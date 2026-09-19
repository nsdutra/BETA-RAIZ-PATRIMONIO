// ============================================================================
// cofre-validacoes.js — Raiz Patrimônio · Cofre de Documentos
// Versão: 2.2.0 · 19/09/2026 (rodada 10)
//
// v2.1.0 — CORRIGIDO (mesma classe de bug do chip "Controles" da Faria
// Lima, ver cofre-controles.js v1.29.0) — chipVencimento() (badge de
// validade de documento, usado por abrirFichaDocumento()) pintava PENDENTE
// (âmbar) pra qualquer prazo de 0 a 30 dias, destoando do padrão "há/em xx
// d" já unificado no resto do app. Só diffDias===0 é PENDENTE/"Vence
// hoje" agora; qualquer prazo positivo vira OK (verde)/"Vence em Xd" — sem
// teto de 30 dias.
//
// v2.0.0 — PLANO_IMPLEMENTACAO v1.0, etapa E5, Onda 6 (decisão do Nicola,
// "pode evoluir"). QUEBRA DE CONTRATO: `CAMPOS_POR_TIPO_ATIVO` deixou de
// ser objeto exportado — virou `obterCamposPorTipo(categoria,
// tipoDetalheId)`, lendo de `ativo_tipos_campos` (catálogo da E4.4, 45
// campos, nunca tinha consumidor até agora) em vez do objeto hardcoded
// (que virou `CAMPOS_POR_TIPO_ATIVO_FALLBACK`, não exportado, só usado
// se o catálogo não carregou). Ganho real sobre a ponte de compatibilidade
// da v1.4.0: campos por TIPO ESPECÍFICO, não só por categoria —
// blindagem_empresa/nivel agora só aparecem pra "Carro blindado" de
// verdade (achado ao construir isto: a ponte v1.4.0 mostrava esses 2
// campos em TODO veículo, sem necessidade). `listarTiposPorCategoria()`
// nova, alimenta o 2º seletor (categoria → tipo específico) que
// cofre-ativos.js v1.33.0 acrescenta ao form. `rotuloTipoAtivo`/
// `iconeAtivo` NÃO mudaram — ver nota no bloco do catálogo, escopo
// deliberadamente menor que "catalogar tudo".
// Ainda não entra nesta entrega: o bot (`_shared.ts`) continua com
// `TIPOS_ATIVO_VALIDOS`/`SINONIMOS_TIPO_ATIVO` hardcoded — fatia
// separada, avisada no fim da sessão, não bloqueia esta (catálogo tem
// fallback idêntico ao comportamento de hoje, nada quebra sem o bot).
//
// v1.4.0 — PONTE DE COMPATIBILIDADE pra E4.2 fatia B (decisão do Nicola,
// "pode migrar conforme sugerido os ativos"). ACHADO antes de migrar:
// rotuloTipoAtivo/iconeAtivo/CAMPOS_POR_TIPO_ATIVO só reconhecem os
// valores ANTIGOS de tipo_ativo — se a migration rodasse sem isto, 119
// dos 131 ativos (91%) ficariam com rótulo cru ("imovel_predial" na
// tela), ícone genérico, E os campos estruturados (placa, matrícula,
// artista...) sumiriam da ficha (CAMPOS_POR_TIPO_ATIVO[tipo] || []) —
// dado continuaria no banco, só ficaria invisível/não-editável na
// interface. Isto aqui NÃO é a E5 completa (catálogo vindo do banco,
// bot lendo a mesma fonte) — é só o mínimo pra rótulo/ícone/campos não
// quebrarem para os valores novos. E5 continua no backlog, como estava.
// - rotuloTipoAtivo/iconeAtivo ganham 4 chaves novas: imovel_predial,
//   imovel_territorial, vida, bem_valor. Chaves antigas mantidas (pedido
//   do próprio plano: "manter os valores antigos aceitos durante a
//   transição").
// - CAMPOS_POR_TIPO_ATIVO ganha as mesmas 4 chaves, cada uma reaproveitando
//   a lista de campos do tipo antigo mais próximo (imovel_predial=imovel,
//   imovel_territorial=terreno, vida=vida_protecao, bem_valor=obra_arte) —
//   é o que os ativos reais de hoje precisam pra não perder campo nenhum.
//   `colecao_bem_valor` fica como está, sem ativo nenhum usando ainda —
//   consolidar os dois num catálogo só é trabalho da E4.3/E4.4, não desta
//   ponte.
// - `veiculo` ganha blindagem_empresa/blindagem_nivel como campos
//   OPCIONAIS (antes só existiam em veiculo_blindado) — os 3 ativos que
//   migram de veiculo_blindado pra veiculo precisam continuar vendo e
//   editando esse dado; os outros 9 veículos simplesmente não preenchem.
//
// v1.3.1 — PLANO_IMPLEMENTACAO v1.0, etapa E6.2 (primeiro consumidor do
// componente de endereço, decisão do Nicola 15/09): CAMPOS_POR_TIPO_ATIVO.
// imovel perde o campo solto `endereco` (texto livre, sem CEP/IBGE/UF
// estruturados). Motivo: agora existe js/comum-endereco.js, que grava
// direto nas 8 colunas de endereço de cofre_ativos (E6.1) em vez de um
// texto dentro de dados_especificos — evita o mesmo dado em dois formatos.
// cofre-ativos.js (E6.2) passa a renderizar o bloco estruturado no lugar
// deste campo, só para imóvel avulso (sem vínculo com a tabela imoveis).
// Backfill do único registro em produção com esse campo preenchido:
// migration endereco_ativo_avulso_backfill_v1 (Family Office Karen Corp.).
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

export const VERSAO = '2.2.0'; // v-check (18/09/2026): lido por Dev › Versões — manter igual ao header
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
    return {
        veiculo: 'Veículo', veiculo_blindado: 'Veículo blindado', imovel: 'Imóvel', terreno: 'Terreno', vida_protecao: 'Vida / proteção pessoal', obra_arte: 'Obra de arte', outro: 'Outro', aeronave: 'Aeronave', embarcacao: 'Embarcação', colecao_bem_valor: 'Coleção / bem de valor',
        // v1.4.0 (E4.2 fatia B — ponte de compatibilidade) — categorias macro novas
        imovel_predial: 'Imóvel', imovel_territorial: 'Terreno', vida: 'Vida / proteção pessoal', bem_valor: 'Obra de arte / bem de valor',
    }[t] || t;
}

export function iconeAtivo(t) {
    return {
        veiculo: 'car', veiculo_blindado: 'shield', imovel: 'home', terreno: 'map', vida_protecao: 'heart-pulse', obra_arte: 'image', outro: 'package', aeronave: 'plane', embarcacao: 'sailboat', colecao_bem_valor: 'gem',
        // v1.4.0 (E4.2 fatia B — ponte de compatibilidade)
        imovel_predial: 'home', imovel_territorial: 'map', vida: 'heart-pulse', bem_valor: 'gem',
    }[t] || 'package';
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
export const CAMPOS_POR_TIPO_ATIVO_FALLBACK = {
    veiculo: [
        { chave: 'placa', label: 'Placa', obrigatorio: true },
        { chave: 'marca', label: 'Marca', obrigatorio: false },
        { chave: 'modelo', label: 'Modelo', obrigatorio: false },
        { chave: 'ano', label: 'Ano', obrigatorio: false, tipo: 'number' },
        { chave: 'cor', label: 'Cor', obrigatorio: false },
        { chave: 'chassi', label: 'Chassi', obrigatorio: false, mascarar: true },
        { chave: 'renavam', label: 'RENAVAM', obrigatorio: false, mascarar: true },
        // v1.4.0 (E4.2 fatia B) — antes só existiam em veiculo_blindado; os
        // 3 ativos que migram de lá pra cá precisam continuar vendo/editando
        // esse dado. Opcionais pros outros 9 veículos, que não preenchem.
        { chave: 'blindagem_empresa', label: 'Empresa blindadora', obrigatorio: false },
        { chave: 'blindagem_nivel', label: 'Nível de blindagem', obrigatorio: false },
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
    // v1.3.1 (E6.2) — `endereco` (texto livre) SAIU daqui: cofre-ativos.js
    // agora renderiza js/comum-endereco.js no lugar, gravando direto nas
    // colunas estruturadas de cofre_ativos (endereco_rua, uf, cep, etc. —
    // E6.1), não mais dentro de dados_especificos.
    imovel: [
        { chave: 'matricula', label: 'Matrícula do imóvel', obrigatorio: false },
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
    // v1.4.0 (E4.2 fatia B — ponte de compatibilidade, NÃO é a E4.3/E4.4)
    // — cada chave nova reaproveita a lista do tipo antigo mais próximo,
    // só pra não perder campo de nenhum ativo real remapeado hoje.
    // Consolidar num catálogo próprio (banco, por categoria) é a E4.3/E4.4,
    // continua no backlog.
    imovel_predial: [
        { chave: 'matricula', label: 'Matrícula do imóvel', obrigatorio: false },
        { chave: 'area_m2', label: 'Área (m²)', obrigatorio: false, tipo: 'number' },
        { chave: 'valor_estimado', label: 'Valor estimado (R$)', obrigatorio: false, tipo: 'number' },
    ],
    imovel_territorial: [
        { chave: 'matricula', label: 'Matrícula/Inscrição', obrigatorio: true },
        { chave: 'localizacao', label: 'Localização', obrigatorio: false },
        { chave: 'area_m2', label: 'Área (m²)', obrigatorio: false, tipo: 'number' },
        { chave: 'inscricao_municipal', label: 'Inscrição municipal', obrigatorio: false },
        { chave: 'valor_estimado', label: 'Valor estimado (R$)', obrigatorio: false, tipo: 'number' },
    ],
    vida: [
        { chave: 'grau_parentesco', label: 'Grau de parentesco', obrigatorio: false },
        { chave: 'numero_documento', label: 'Nº do documento (CPF/RG)', obrigatorio: false, mascarar: true },
        { chave: 'data_nascimento', label: 'Data de nascimento', obrigatorio: false, tipo: 'date' },
    ],
    bem_valor: [
        { chave: 'artista', label: 'Artista', obrigatorio: false },
        { chave: 'titulo_obra', label: 'Título da obra', obrigatorio: false },
        { chave: 'ano', label: 'Ano', obrigatorio: false, tipo: 'number' },
        { chave: 'valor_estimado', label: 'Valor estimado (R$)', obrigatorio: false, tipo: 'number' },
    ],
};

// ============================================================================
// v2.0.0 (E5) — CATÁLOGO DINÂMICO. cofre-ativos.js chama
// inicializarCatalogoTiposAtivo() uma vez, cedo (com o retorno de
// api.listarTiposAtivo(clienteId)), e obterCamposPorTipo/
// listarTiposPorCategoria passam a ler dali. Enquanto não carregou (ou se
// falhar — try/catch é responsabilidade de quem chama a API, não daqui),
// obterCamposPorTipo cai no FALLBACK acima — nenhum comportamento muda
// pra quem nunca chamar inicializarCatalogoTiposAtivo(). rotuloTipoAtivo/
// iconeAtivo NÃO entraram nesta troca — catálogo não guarda ícone, e
// rótulo de categoria (8 valores) já é estável desde a v1.4.0; catalogar
// isso também seria superfície extra sem ganho real.
let _catalogoAtivoTipos = null;
let _catalogoAtivoCampos = null;

export function inicializarCatalogoTiposAtivo({ tipos, campos } = {}) {
    _catalogoAtivoTipos = Array.isArray(tipos) && tipos.length ? tipos : null;
    _catalogoAtivoCampos = Array.isArray(campos) && campos.length ? campos : null;
}

// Tipos específicos (Apartamento, Carro blindado, Pet...) dentro de uma
// categoria — alimenta o 2º seletor (categoria → tipo específico) do
// form de ativo. Catálogo vazio/não carregado = lista vazia (o form
// simplesmente não mostra o 2º seletor, degrada pro comportamento
// pré-E5, não quebra).
export function listarTiposPorCategoria(categoria) {
    if (!_catalogoAtivoTipos) return [];
    return _catalogoAtivoTipos.filter(t => t.categoria === categoria).map(t => ({ id: t.id, codigo: t.codigo, nome: t.nome }));
}

// Campos estruturados: categoria sempre, + os específicos do tipo_detalhe
// escolhido (ex.: blindagem_empresa só aparece com tipoDetalheId = "Carro
// blindado"). tipoDetalheId omitido = só os campos de categoria (mesmo
// comportamento de antes de existir o 2º seletor).
export function obterCamposPorTipo(categoria, tipoDetalheId = null) {
    if (!_catalogoAtivoCampos) return CAMPOS_POR_TIPO_ATIVO_FALLBACK[categoria] || [];
    const campos = _catalogoAtivoCampos
        .filter(c => c.categoria === categoria && (c.tipo_detalhe_id === null || c.tipo_detalhe_id === tipoDetalheId))
        .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
        .map(c => ({ chave: c.chave, label: c.label, obrigatorio: !!c.obrigatorio, ...(c.tipo_dado && c.tipo_dado !== 'text' ? { tipo: c.tipo_dado } : {}), ...(c.mascarar ? { mascarar: true } : {}) }));
    // Categoria existe no catálogo mas não tem NENHUM campo cadastrado
    // (não deveria acontecer — as 8 têm campo hoje) cai no fallback em
    // vez de mostrar form vazio.
    return campos.length ? campos : (CAMPOS_POR_TIPO_ATIVO_FALLBACK[categoria] || []);
}


// Retorna lista de mensagens de erro (vazia = válido). Não lança exceção —
// quem chama decide como mostrar (mesmo padrão dos indicadores inline do
// Design System).
export function validarCamposAtivo(tipoAtivo, nomeExibicao, dadosEspecificos, tipoDetalheId = null) {
    const erros = [];
    if (!nomeExibicao || !nomeExibicao.trim()) erros.push('Nome de exibição é obrigatório.');
    const campos = obterCamposPorTipo(tipoAtivo, tipoDetalheId);
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
// CORRIGIDO (18/09/2026, mesma classe de bug achada no chip "Controles" do
// ativo da Faria Lima — Nicola: "alerta vermelho sem item em alerta
// aparente") — qualquer prazo de 0 a 30 dias pintava PENDENTE (âmbar),
// destoando da régua "há/em xx d" já unificada em todo o resto do app (só
// diffDias===0 é alerta de verdade; positivo, qualquer magnitude, é calmo).
// Documento vencendo em 21/28 dias não é "pendente" — ainda tem prazo.
export function chipVencimento(diffDias) {
    if (diffDias === null || diffDias === undefined) return null;
    if (diffDias < 0) return { classe: BADGE_ALERTA, texto: `há ${Math.abs(diffDias)}d` };
    if (diffDias === 0) return { classe: BADGE_PENDENTE, texto: 'Vence hoje' };
    return { classe: BADGE_OK, texto: `Vence em ${diffDias}d` };
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
