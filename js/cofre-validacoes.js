// ============================================================================
// cofre-validacoes.js — Raiz Patrimônio · Cofre de Documentos
// Versão: 1.2.0 · 25/08/2026
//
// v1.2.0 — D-2 (revisão DS, decisão do proprietário: "chips migram pro
// [badge] do Imóveis"): chipVencimento() migrada do sistema de pill
// próprio do Cofre (classe chip-*, ver cofre.html) pro badge OFICIAL do
// Design System §14 — mesmas classes Tailwind literais do App (não um
// equivalente reaproximado). 4 constantes novas EXPORTADAS
// (BADGE_NEUTRO/BADGE_ALERTA/BADGE_PENDENTE/BADGE_OK), reaproveitadas em
// cofre-ui.js e cofre-documentos.js — nenhum arquivo repete a string à
// mão. `classe` retornado por chipVencimento() agora é a classe COMPLETA
// (formato + cor); quem consome não prefixa mais com "chip ".
//
// v1.1.3 — removido campo `seguradora` de obra_arte/vida_protecao (seguro
// agora é Item de Controle, não dado estruturado); `valor_estimado`
// padronizado em TODOS os tipos de ativo (pedido explícito).
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
//
// v1.1.3 — removido campo `seguradora` de obra_arte/vida_protecao (seguro agora é
// Item de Controle do ativo, não dado estruturado do cadastro — pedido explícito).
// `valor_estimado` adicionado a TODOS os tipos (antes só obra_arte tinha, como
// `avaliacao_valor` — renomeado/padronizado para permitir somatório de portfólio
// sem precisar de switch por tipo).
export const CAMPOS_POR_TIPO_ATIVO = {
    veiculo: [
        { chave: 'placa', label: 'Placa', obrigatorio: true },
        { chave: 'marca', label: 'Marca', obrigatorio: false },
        { chave: 'modelo', label: 'Modelo', obrigatorio: false },
        { chave: 'ano', label: 'Ano', obrigatorio: false, tipo: 'number' },
        { chave: 'cor', label: 'Cor', obrigatorio: false },
        { chave: 'chassi', label: 'Chassi', obrigatorio: false, mascarar: true },
        { chave: 'renavam', label: 'RENAVAM', obrigatorio: false, mascarar: true },
        { chave: 'valor_estimado', label: 'Valor estimado (R$)', obrigatorio: false, tipo: 'number' },
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
        { chave: 'valor_estimado', label: 'Valor estimado (R$)', obrigatorio: false, tipo: 'number' },
    ],
    obra_arte: [
        { chave: 'artista', label: 'Artista', obrigatorio: false },
        { chave: 'titulo_obra', label: 'Título da obra', obrigatorio: false },
        { chave: 'ano', label: 'Ano', obrigatorio: false, tipo: 'number' },
        { chave: 'valor_estimado', label: 'Valor estimado (R$)', obrigatorio: false, tipo: 'number' },
    ],
    terreno: [
        { chave: 'matricula', label: 'Matrícula/Inscrição', obrigatorio: true },
        { chave: 'localizacao', label: 'Localização', obrigatorio: false },
        { chave: 'area_m2', label: 'Área (m²)', obrigatorio: false, tipo: 'number' },
        { chave: 'inscricao_municipal', label: 'Inscrição municipal', obrigatorio: false },
        { chave: 'valor_estimado', label: 'Valor estimado (R$)', obrigatorio: false, tipo: 'number' },
    ],
    // vida_protecao: representa uma PESSOA (não uma apólice — a apólice de
    // seguro vira Item de Controle da pessoa, tipo=seguro). Por isso não
    // tem valor_estimado (pedido explícito: "Pessoa não tem valor estimado").
    vida_protecao: [
        { chave: 'grau_parentesco', label: 'Grau de parentesco', obrigatorio: false },
        { chave: 'numero_documento', label: 'Nº do documento (CPF/RG)', obrigatorio: false, mascarar: true },
        { chave: 'data_nascimento', label: 'Data de nascimento', obrigatorio: false, tipo: 'date' },
    ],
    outro: [
        { chave: 'descricao_livre', label: 'Descrição', obrigatorio: false },
        { chave: 'valor_estimado', label: 'Valor estimado (R$)', obrigatorio: false, tipo: 'number' },
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
// D-2 (revisão DS, 25/08/2026) — migrado do sistema de pill próprio do
// Cofre (classe chip-*, rounded-full 12px, tokens CSS custom) para o
// badge OFICIAL do Design System §14: mesma formatação e MESMAS classes
// Tailwind literais usadas no App (não um equivalente reaproximado — é
// texto idêntico, copiado de montarCabecalhoImovelHtml()/badgeStatus de
// contrato em index.html). `classe` agora já é a string completa
// (formato + cor) — quem consome NÃO deve mais prefixar com "chip ".
const RAIZ_BADGE = 'text-[11px] font-bold px-1.5 py-0.5 rounded';
export const BADGE_NEUTRO = `${RAIZ_BADGE} bg-slate-100 text-slate-700`;   // "Demais/neutro" — tag de vínculo, não status
export const BADGE_ALERTA = `${RAIZ_BADGE} bg-red-100 text-red-800`;      // vencido/restrito — mesmo par usado no badge de status "Cancelado" do Contrato (index.html)
export const BADGE_PENDENTE = `${RAIZ_BADGE} bg-amber-100 text-amber-800`;
export const BADGE_OK = `${RAIZ_BADGE} bg-green-100 text-green-800`;
export function chipVencimento(diffDias) {
    if (diffDias === null || diffDias === undefined) return null;
    if (diffDias < 0) return { classe: BADGE_ALERTA, texto: `Vencido há ${Math.abs(diffDias)}d` };
    if (diffDias <= 30) return { classe: BADGE_PENDENTE, texto: `Vence em ${diffDias}d` };
    return { classe: BADGE_OK, texto: 'Em dia' };
}

// Alertas DERIVADOS (v6, pedido explícito) — não existe mais cadastro de
// alerta separado. Uma ocorrência "está em alerta" quando o item que a
// gerou tem alerta_habilitado=true E já entrou na janela de antecedência
// (ou já venceu — vencido sempre conta). Mesmo princípio do App em
// Imóveis: Vago/Contrato a vencer são calculados, nunca cadastrados.
export function ocorrenciaEmAlerta(oc) {
    const item = oc.cofre_itens_controle;
    if (!item || item.alerta_habilitado === false) return false;
    const dias = diasAte(oc.data_prevista_atual);
    if (dias === null) return false;
    return dias <= (item.antecedencia_alerta_dias ?? 0);
}
