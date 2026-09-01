// ============================================================================
// cofre-validacoes.js — Raiz Patrimônio · Cofre de Documentos
// Versão: 1.3.0 · 31/08/2026
//
// v1.3.0 — pesquisa própria do Nicola: 3 tipos de ativo novos (aeronave,
// embarcacao, colecao_bem_valor) em rotuloTipoAtivo/iconeAtivo/
// CAMPOS_POR_TIPO_ATIVO — mesmo padrão dos tipos existentes. Ícones
// Lucide escolhidos (plane/sailboat/gem) não confirmados visualmente
// nesta sessão — conferir ao testar.
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
    if (v.length <= visiveisNoFinal) return escapeHtml(v);
    // BUG FIX (25/08/2026, achado pelo usuário) — os pontinhos ficavam
    // desalinhados verticalmente (fonte proporcional não posiciona "•"
    // numa linha reta consistente). Envolve só os pontos num span
    // monoespaçado com letter-spacing — alinhamento reto garantido,
    // independente da fonte do resto da tela. Retorna HTML agora (antes
    // retornava texto puro) — por isso já escapa a parte visível aqui
    // dentro, e quem chama não deve escapar de novo (ver
    // renderizarDadosAtivo em cofre-ativos.js).
    const pontos = '•'.repeat(Math.min(v.length - visiveisNoFinal, 8));
    return `<span style="font-family:monospace;letter-spacing:2px">${pontos}</span>${escapeHtml(v.slice(-visiveisNoFinal))}`;
}

// ============================================================================
// ATIVOS — rótulos/ícones por tipo + validação de campos estruturados
// (prompt corretivo §10 — nada de campo único "identificadores" genérico).
// ============================================================================
export function rotuloTipoAtivo(t) {
    return { veiculo: 'Veículo', veiculo_blindado: 'Veículo blindado', imovel: 'Imóvel', terreno: 'Terreno', vida_protecao: 'Vida / proteção pessoal', obra_arte: 'Obra de arte', outro: 'Outro', aeronave: 'Aeronave', embarcacao: 'Embarcação', colecao_bem_valor: 'Coleção / bem de valor' }[t] || t;
}

export function iconeAtivo(t) {
    return { veiculo: 'car', veiculo_blindado: 'shield', imovel: 'home', terreno: 'map', vida_protecao: 'heart-pulse', obra_arte: 'image', outro: 'package', aeronave: 'plane', embarcacao: 'sailboat', colecao_bem_valor: 'gem' }[t] || 'package';
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
    // "imovel" — achado pelo usuário, 25/08/2026: era o único tipo sem
    // NENHUM campo estruturado (retornava lista vazia, "Sem campos
    // estruturados adicionais para este tipo" sempre). Quando o ativo
    // está vinculado a um imóvel real do App (entidade_origem_tipo=
    // 'imovel'), esses campos ficam redundantes com o dado de origem —
    // mas quando NÃO está vinculado (ativo "imóvel" cadastrado solto no
    // Cofre, ex. imóvel fora do sistema de locação), precisa de algo
    // pra preencher.
    imovel: [
        { chave: 'matricula', label: 'Matrícula do imóvel', obrigatorio: false },
        { chave: 'endereco', label: 'Endereço completo', obrigatorio: false },
        { chave: 'area_m2', label: 'Área (m²)', obrigatorio: false, tipo: 'number' },
        { chave: 'valor_estimado', label: 'Valor estimado (R$)', obrigatorio: false, tipo: 'number' },
    ],
    outro: [
        { chave: 'descricao_livre', label: 'Descrição', obrigatorio: false },
        { chave: 'valor_estimado', label: 'Valor estimado (R$)', obrigatorio: false, tipo: 'number' },
    ],
    // NOVO (31/08/2026, pesquisa do Nicola) — 3 tipos novos, mesmo padrão
    // dos demais (campo obrigatório mínimo pra identificar o bem +
    // valor_estimado em todos, pra somatório de portfólio continuar
    // funcionando sem switch por tipo).
    aeronave: [
        { chave: 'matricula_aeronave', label: 'Matrícula (prefixo)', obrigatorio: true },
        { chave: 'fabricante', label: 'Fabricante', obrigatorio: false },
        { chave: 'modelo', label: 'Modelo', obrigatorio: false },
        { chave: 'ano', label: 'Ano', obrigatorio: false, tipo: 'number' },
        { chave: 'numero_serie', label: 'Número de série', obrigatorio: false, mascarar: true },
        { chave: 'horas_voo', label: 'Horas de voo (total)', obrigatorio: false, tipo: 'number' },
        { chave: 'valor_estimado', label: 'Valor estimado (R$)', obrigatorio: false, tipo: 'number' },
    ],
    embarcacao: [
        { chave: 'nome_embarcacao', label: 'Nome da embarcação', obrigatorio: false },
        { chave: 'registro_capitania', label: 'Registro (Capitania dos Portos)', obrigatorio: true },
        { chave: 'fabricante', label: 'Fabricante', obrigatorio: false },
        { chave: 'modelo', label: 'Modelo', obrigatorio: false },
        { chave: 'ano', label: 'Ano', obrigatorio: false, tipo: 'number' },
        { chave: 'marina_local', label: 'Marina / local de guarda', obrigatorio: false },
        { chave: 'valor_estimado', label: 'Valor estimado (R$)', obrigatorio: false, tipo: 'number' },
    ],
    colecao_bem_valor: [
        { chave: 'categoria', label: 'Categoria (joia, relógio, vinho, antiguidade...)', obrigatorio: false },
        { chave: 'descricao_item', label: 'Descrição do item', obrigatorio: false },
        { chave: 'local_armazenamento', label: 'Local de armazenamento', obrigatorio: false },
        { chave: 'ultima_avaliacao', label: 'Data da última avaliação', obrigatorio: false, tipo: 'date' },
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

// ============================================================================
// MÁSCARA + VALIDAÇÃO DE TELEFONE/E-MAIL (25/08/2026, pedido explícito)
// Mesmo padrão já usado no App (index.html: validarTelefoneBR/
// validarEmailFormato/aplicarIndicadorValidacao/aplicarMascaraTelefone) —
// portado pro Cofre pro modal de Contato. Versão simplificada: sem a
// lista de DDDs válidos do Brasil (só valida contagem de dígitos e o
// "9" na frente de celular) — evita duplicar uma lista grande só por
// causa deste formulário; se precisar da validação completa de DDD
// depois, dá pra importar a mesma constante do App.
// ============================================================================
export function aplicarMascaraTelefoneCofre(input) {
    let digitos = input.value.replace(/\D/g, '').slice(0, 11);
    let formatado = digitos;
    if (digitos.length > 10) formatado = digitos.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
    else if (digitos.length > 6) formatado = digitos.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    else if (digitos.length > 2) formatado = digitos.replace(/(\d{2})(\d{0,5})/, '($1) $2');
    else if (digitos.length > 0) formatado = digitos.replace(/(\d{0,2})/, '($1');
    formatado = formatado.replace(/-$/, '').replace(/\)\s$/, ')');
    input.value = formatado;
}

export function validarTelefoneBRCofre(valorDigitado) {
    const digitos = (valorDigitado || '').replace(/\D/g, '');
    if (digitos.length === 0) return { vazio: true };
    if (digitos.length !== 10 && digitos.length !== 11) return { ok: false, motivo: 'Telefone precisa ter 10 ou 11 dígitos (DDD + número)' };
    if (digitos.length === 11 && digitos[2] !== '9') return { ok: false, motivo: 'Celular com 11 dígitos precisa começar com 9 após o DDD' };
    return { ok: true };
}

export function validarEmailFormatoCofre(valorDigitado) {
    const valor = (valorDigitado || '').trim();
    if (valor.length === 0) return { vazio: true };
    const formatoOk = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(valor) && !valor.includes('..') && !valor.startsWith('.') && !valor.endsWith('.');
    if (!formatoOk) return { ok: false, motivo: 'Formato de e-mail inválido' };
    return { ok: true };
}

export function aplicarIndicadorValidacaoCofre(indicadorId, resultado, rotuloOk) {
    const indicador = document.getElementById(indicadorId);
    if (!indicador) return;
    if (resultado.vazio || !resultado.ok) {
        if (resultado.ok === false) {
            indicador.innerText = '⚠️ ' + resultado.motivo;
            indicador.className = 'raiz-indicador-inline text-[11px] mt-0.5 h-3 text-red-600 font-bold';
            return;
        }
        indicador.innerText = '';
        indicador.className = 'raiz-indicador-inline text-[11px] mt-0.5 h-3';
        return;
    }
    indicador.innerText = '✅ ' + rotuloOk;
    indicador.className = 'raiz-indicador-inline text-[11px] mt-0.5 h-3 text-green-600 font-bold';
}

// Garante DDI (55) no número antes de montar o link wa.me — pedido
// explícito (achado real: contato salvo só com DDD+número, sem "+55" na
// frente, faz o wa.me abrir errado/não encontrar o contato). Só prefixa
// quando o número tem exatamente 10 ou 11 dígitos (DDD+número sem DDI);
// se já vier maior (already tem DDI), mantém como está.
export function numeroWhatsAppComDDI(valor) {
    let digitos = (valor || '').replace(/\D/g, '');
    if (digitos.length === 10 || digitos.length === 11) digitos = '55' + digitos;
    return digitos;
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
// gerou tem alerta_ativo=true E já entrou na janela de antecedência
// (ou já venceu — vencido sempre conta). Mesmo princípio do App em
// Imóveis: Vago/Contrato a vencer são calculados, nunca cadastrados.
export function ocorrenciaEmAlerta(oc) {
    const item = oc.cofre_itens_controle;
    if (!item || item.alerta_ativo === false) return false;
    const dias = diasAte(oc.data_prevista_atual);
    if (dias === null) return false;
    return dias <= (item.antecedencia_alerta_dias ?? 0);
}
