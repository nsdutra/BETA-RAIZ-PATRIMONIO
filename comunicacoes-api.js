// Raiz Patrimônio — Central de Comunicações Omnichannel — API App
// Beta v1.43.0
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
