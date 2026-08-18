// Raiz Patrimônio — Central de Comunicações — API
// Beta v1.43.0
let clienteSupabase = null;

export function configurarApiComunicacoes(dbAuth) {
    clienteSupabase = dbAuth;
}

function exigirCliente() {
    if (!clienteSupabase) throw new Error('API de comunicações não inicializada.');
    return clienteSupabase;
}

export async function buscarComunicacoesElegiveis({ pessoaId, clienteId }) {
    const db = exigirCliente();
    const { data, error } = await db.rpc('fn_comunicacoes_elegiveis', {
        p_pessoa_id: pessoaId,
        p_cliente_id: clienteId
    });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
}

export async function registrarInteracao({ comunicacaoId, pessoaId, clienteId, evento, detalhe = {} }) {
    const db = exigirCliente();
    const { data, error } = await db.rpc('fn_registrar_interacao_comunicacao', {
        p_comunicacao_id: comunicacaoId,
        p_pessoa_id: pessoaId,
        p_cliente_id: clienteId,
        p_evento: evento,
        p_detalhe: detalhe
    });
    if (error) throw error;
    return data;
}
