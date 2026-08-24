// ============================================================================
// cofre-validacoes.js — Raiz Patrimônio · Cofre de Documentos
// Versão: 1.1.2 · 24/08/2026
//
// v1.1.2 — rótulos puros de Controles/Ocorrências (rotuloTipoControle,
// rotuloStatusOcorrencia, rotuloFrequencia) para a nova aba Controles.
//
// v1.1.1 — adiciona tipos de ativo veiculo_blindado/obra_arte (rótulo, ícone,
// campos estruturados), acompanhando migration_cofre_alarmes_v2 que ampliou
// cofre_ativos_tipo_check. Sem remoção de tipos existentes.
//
// Funções PURAS (sem DOM, sem rede, sem estado global) — é isso que torna
// possível testar este arquivo isoladamente (ver tests/cofre-validacoes.test.js,
// executável com `node tests/cofre-validacoes.test.js`, sem framework).
//
// Diretriz Arquitetural — Passo 2: este é o módulo mais "de baixo nível" da
// pilha; os demais (cofre-ui, cofre-documentos, cofre-ativos) importam
// daqui, nunca o contrário.
// ============================================================================

export function escapeHtml(s) {
    return (s ?? '').toString().replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function formatarDataBR(iso) {
    if (!iso) return '-';
    const d = new Date(iso.length > 10 ? iso : iso + 'T00:00:00');
    return d.toLocaleDateString('pt-BR');
}

export function formatarBytes(n) {
    if (!n) return '-';
    if (n < 1024) return n + ' B';
    if (n < 1048576) return (n / 1024).toFixed(0) + ' KB';
    return (n / 1048576).toFixed(1) + ' MB';
}

// Dias entre hoje e uma data ISO (YYYY-MM-DD). Negativo = já passou.
export function diasAte(iso) {
    if (!iso) return null;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const alvo = new Date(iso + 'T00:00:00');
    return Math.round((alvo - hoje) / 86400000);
}

// ============================================================================
// CLASSIFICAÇÃO DE VÍNCULO — Adendo Cofre Contextual §11: "sem vínculo" não
// é uma única situação. Distingue 3 estados de UX, não só true/false.
// ============================================================================
export function classificarStatusVinculo(vinculos) {
    const lista = Array.isArray(vinculos) ? vinculos : [];
    if (lista.length === 0) return 'triagem';
    if (lista.length === 1 && lista[0].entidade_tipo === 'empresa') return 'empresa';
    return 'vinculado';
}

export function rotuloStatusVinculo(status) {
    return { triagem: 'Em triagem', empresa: 'Geral da empresa', vinculado: 'Vinculado' }[status] || status;
}

// ============================================================================
// MÁSCARA — chassi/RENAVAM/apólice: só os últimos N caracteres visíveis
// (Adendo §17, prompt corretivo §10 "proteção de exibição").
// ============================================================================
export function mascarar(valor, visiveisNoFinal = 4) {
    const v = (valor ?? '').toString();
    if (v.length <= visiveisNoFinal) return v;
    return '•'.repeat(Math.min(v.length - visiveisNoFinal, 8)) + v.slice(-visiveisNoFinal);
}

// ============================================================================
// ATIVOS — rótulos/ícones por tipo + validação de campos estruturados
// (prompt corretivo §10 — nada de campo único "identificadores" genérico).
// ============================================================================
export function rotuloTipoAtivo(t) {
    return { veiculo: 'Veículo', veiculo_blindado: 'Veículo blindado', imovel: 'Imóvel', terreno: 'Terreno', vida_protecao: 'Vida / proteção pessoal', obra_arte: 'Obra de arte', outro: 'Outro' }[t] || t;
}

export function iconeAtivo(t) {
    return { veiculo: 'car', veiculo_blindado: 'shield', imovel: 'home', terreno: 'map', vida_protecao: 'heart-pulse', obra_arte: 'image', outro: 'package' }[t] || 'package';
}

// Campos estruturados por tipo (convenção documentada em migration_cofre_v1_1_0.sql §3;
// veiculo_blindado/obra_arte adicionados em migration_cofre_alarmes_v1 — convenção nova,
// documentada aqui por não ter migration própria de schema, já que dados_especificos é jsonb livre)
export const CAMPOS_POR_TIPO_ATIVO = {
    veiculo: [
        { chave: 'placa', label: 'Placa', obrigatorio: true },
        { chave: 'marca', label: 'Marca', obrigatorio: false },
        { chave: 'modelo', label: 'Modelo', obrigatorio: false },
        { chave: 'ano', label: 'Ano', obrigatorio: false, tipo: 'number' },
        { chave: 'cor', label: 'Cor', obrigatorio: false },
        { chave: 'chassi', label: 'Chassi', obrigatorio: false, mascarar: true },
        { chave: 'renavam', label: 'RENAVAM', obrigatorio: false, mascarar: true },
    ],
    veiculo_blindado: [
        { chave: 'placa', label: 'Placa', obrigatorio: true },
        { chave: 'marca', label: 'Marca', obrigatorio: false },
        { chave: 'modelo', label: 'Modelo', obrigatorio: false },
        { chave: 'ano', label: 'Ano', obrigatorio: false, tipo: 'number' },
        { chave: 'blindagem_empresa', label: 'Empresa blindadora', obrigatorio: false },
        { chave: 'blindagem_nivel', label: 'Nível de blindagem', obrigatorio: false },
        { chave: 'chassi', label: 'Chassi', obrigatorio: false, mascarar: true },
        { chave: 'renavam', label: 'RENAVAM', obrigatorio: false, mascarar: true },
    ],
    obra_arte: [
        { chave: 'artista', label: 'Artista', obrigatorio: false },
        { chave: 'titulo_obra', label: 'Título da obra', obrigatorio: false },
        { chave: 'ano', label: 'Ano', obrigatorio: false, tipo: 'number' },
        { chave: 'avaliacao_valor', label: 'Valor de avaliação', obrigatorio: false, tipo: 'number' },
        { chave: 'seguradora', label: 'Seguradora', obrigatorio: false },
    ],
    terreno: [
        { chave: 'matricula', label: 'Matrícula/Inscrição', obrigatorio: true },
        { chave: 'localizacao', label: 'Localização', obrigatorio: false },
        { chave: 'area_m2', label: 'Área (m²)', obrigatorio: false, tipo: 'number' },
        { chave: 'inscricao_municipal', label: 'Inscrição municipal', obrigatorio: false },
    ],
    vida_protecao: [
        { chave: 'seguradora', label: 'Seguradora', obrigatorio: false },
        { chave: 'numero_apolice', label: 'Nº da apólice', obrigatorio: false, mascarar: true },
        { chave: 'tipo_cobertura', label: 'Tipo de cobertura', obrigatorio: false },
    ],
    outro: [
        { chave: 'descricao_livre', label: 'Descrição', obrigatorio: false },
    ],
};

// Retorna lista de mensagens de erro (vazia = válido). Não lança exceção —
// quem chama decide como mostrar (mesmo padrão dos indicadores inline do
// Design System).
export function validarCamposAtivo(tipoAtivo, nomeExibicao, dadosEspecificos) {
    const erros = [];
    if (!nomeExibicao || !nomeExibicao.trim()) erros.push('Nome de exibição é obrigatório.');
    const campos = CAMPOS_POR_TIPO_ATIVO[tipoAtivo] || [];
    for (const campo of campos) {
        if (campo.obrigatorio && !(dadosEspecificos && dadosEspecificos[campo.chave])) {
            erros.push(`${campo.label} é obrigatório para este tipo de ativo.`);
        }
    }
    return erros;
}

// ============================================================================
// ROTEADOR DE CONTEXTO — normaliza o parâmetro `contexto` da URL. Aceita os
// 5 tipos canônicos do prompt corretivo §5 (imovel/contrato/pagamento/ativo/
// documento) e os apelidos já usados pelo protótipo de Imóveis v0.3.0
// (comprovante/seguro/documentos) — ver HANDOFF para o pedido de alinhar o
// vocabulário do lado de Imóveis na próxima rodada da trilha A.
// ============================================================================
const ALIASES_CONTEXTO = {
    comprovante: 'pagamento',
    seguro: 'imovel',
    documentos: 'imovel',
};

export function normalizarContexto(contextoBruto) {
    if (!contextoBruto) return null;
    const c = contextoBruto.toLowerCase().trim();
    const CANONICOS = ['imovel', 'contrato', 'pagamento', 'ativo', 'documento'];
    if (CANONICOS.includes(c)) return c;
    if (ALIASES_CONTEXTO[c]) return ALIASES_CONTEXTO[c];
    return null; // contexto desconhecido — bootstrap cai para a Home normal
}

// ============================================================================
// CONTROLES / OCORRÊNCIAS — rótulos puros (módulo de Alarmes, Fase 1 núcleo)
// ============================================================================
export function rotuloTipoControle(t) {
    return { seguro: 'Seguro', manutencao: 'Manutenção', tributo: 'Tributo' }[t] || t;
}

export function rotuloStatusOcorrencia(s) {
    return { aberto: 'Em aberto', concluido: 'Concluído', cancelado: 'Cancelado' }[s] || s;
}

export function rotuloFrequencia(intervalo, unidade) {
    if (!intervalo || !unidade) return 'Não recorrente';
    const unidades = { dia: ['dia', 'dias'], semana: ['semana', 'semanas'], mes: ['mês', 'meses'], ano: ['ano', 'anos'] };
    const [singular, plural] = unidades[unidade] || [unidade, unidade];
    return intervalo === 1 ? `A cada ${singular}` : `A cada ${intervalo} ${plural}`;
}

// ============================================================================
// PAPÉIS DE CONTATO
// ============================================================================
export function rotuloPapelContato(p) {
    return { seguradora: 'Seguradora', corretor: 'Corretor', oficina: 'Oficina', assistencia: 'Assistência', administradora: 'Administradora', advogado: 'Advogado', outro: 'Outro' }[p] || p;
}

// Chip de urgência de vencimento — usado por dashboard/alertas/ficha.
export function chipVencimento(diffDias) {
    if (diffDias === null || diffDias === undefined) return null;
    if (diffDias < 0) return { classe: 'chip-vencido', texto: `Vencido há ${Math.abs(diffDias)}d` };
    if (diffDias <= 30) return { classe: 'chip-proximo', texto: `Vence em ${diffDias}d` };
    return { classe: 'chip-ok', texto: 'Em dia' };
}
