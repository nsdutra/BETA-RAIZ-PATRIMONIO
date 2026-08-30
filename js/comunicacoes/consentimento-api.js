// Raiz Patrimônio — Aceite de Termos/LGPD — API App
// Beta v1.0.0 · 30/08/2026
//
// Espelha o padrão de comunicacoes-api.js (mesmo par configurar*/db()) —
// funções finas em cima das RPCs, sem lógica de decisão aqui (a decisão de
// "quais documentos ainda faltam aceitar" mora inteira em
// fn_termos_pendentes, no banco — mesmo princípio já usado pra
// fn_comunicacao_proxima_app: não duplicar lógica entre client e servidor).
let clienteSupabase = null;

export function configurarApiConsentimento(dbAuth) { clienteSupabase = dbAuth; }
function db() {
  if (!clienteSupabase) throw new Error('API de consentimento não inicializada.');
  return clienteSupabase;
}

export async function buscarTermosPendentes(versoesVigentes) {
  const { data, error } = await db().rpc('fn_termos_pendentes', { p_versoes: versoesVigentes });
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

export async function registrarAceiteTermo(tipo, versaoDocumento, canal = 'app') {
  const { data, error } = await db().rpc('fn_registrar_consentimento', {
    p_tipo: tipo, p_versao_documento: versaoDocumento, p_canal: canal
  });
  if (error) throw error;
  return data;
}
