// Raiz Patrimônio — Central de Comunicações Omnichannel — API App
// Beta v1.45.0
//
// v1.45.0 — nova buscarTermosLegaisPendentes(): base do modal único de
// aceite (fn_termos_legais_pendentes, devolve todos de uma vez, não 1 por
// vez) — ver changelog completo em comunicacoes-app.js/ui.js.
//
// v1.44.0 — nova buscarProximaComunicacao(): chama fn_comunicacao_proxima_app,
// que já devolve a comunicação vencedora (regras avaliadas no banco) — ver
// changelog completo em comunicacoes-app.js. buscarComunicacoesCandidatas()
// mantida (não removida): não é mais chamada por comunicacoes-app.js, mas
// nenhum outro caller foi confirmado ausente — remover função pública sem
// certeza é risco desnecessário pra um ganho de limpeza pequeno.
let clienteSupabase = null;

export function configurarApiComunicacoes(dbAuth) { clienteSupabase = dbAuth; }
function db() {
  if (!clienteSupabase) throw new Error('API de comunicações não inicializada.');
  return clienteSupabase;
}

export async function registrarLoginComunicacoes({ pessoaId, clienteId }) {
  const { data, error } = await db().rpc('fn_registrar_login_comunicacoes', {
    p_pessoa_id: pessoaId, p_cliente_id: clienteId
  });
  if (error) throw error;
  return Number(data || 0);
}

export async function buscarComunicacoesCandidatas({ pessoaId, clienteId }) {
  const { data, error } = await db().rpc('fn_comunicacoes_candidatas_app', {
    p_pessoa_id: pessoaId, p_cliente_id: clienteId
  });
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

// NOVO (v1.44.0) — substitui buscarComunicacoesCandidatas() + seleção local
// no fluxo real. ctxCliente carrega só o que é genuinamente de sessão (PWA
// instalado, tela atual, dispositivo) — tudo o mais (imóveis, contrato,
// recebimento, login, uso do bot, licença) o banco já calcula sozinho.
// Devolve a comunicação já escolhida, ou null se nenhuma bateu.
export async function buscarProximaComunicacao({ pessoaId, clienteId, ctxCliente = {} }) {
  const { data, error } = await db().rpc('fn_comunicacao_proxima_app', {
    p_pessoa_id: pessoaId, p_cliente_id: clienteId, p_ctx_cliente: ctxCliente
  });
  if (error) throw error;
  return Array.isArray(data) && data.length ? data[0] : null;
}

export async function buscarTermosLegaisPendentes() {
  const { data, error } = await db().rpc('fn_termos_legais_pendentes');
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function registrarInteracao({ comunicacaoId,pessoaId,clienteId,evento,detalhe={},correlacaoId=null }) {
  const { data, error } = await db().rpc('fn_registrar_interacao_comunicacao', {
    p_comunicacao_id: comunicacaoId,
    p_pessoa_id: pessoaId,
    p_cliente_id: clienteId,
    p_canal: 'app',
    p_evento: evento,
    p_detalhe: detalhe,
    p_correlacao_id: correlacaoId
  });
  if (error) throw error;
  return data;
}

export async function responderNps({ comunicacaoId,pessoaId,clienteId,nota,comentario }) {
  const { data, error } = await db().rpc('fn_responder_nps_comunicacao', {
    p_comunicacao_id: comunicacaoId,
    p_pessoa_id: pessoaId,
    p_cliente_id: clienteId,
    p_canal: 'app',
    p_nota: nota,
    p_comentario: comentario || null,
    p_correlacao_id: null
  });
  if (error) throw error;
  return data;
}
