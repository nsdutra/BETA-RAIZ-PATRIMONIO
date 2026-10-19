// ============================================================================
// cofre-validacoes.js — Raiz Patrimônio · Cofre de Documentos
// Versão: 2.12.0 · 19/10/2026
//
// v2.12.0 (19/10/2026, sessão 20261019-1140-carga-silva-icones, demanda 9404081c, item 37) — pessoa com ícone pela idade
// (criança < 18, adulto, idoso ≥ 65; desenhos próprios para criança e idoso); iconeHtmlDoAtivo devolve o HTML pronto.
// Versão anterior: 2.11.0 · 19/10/2026
//
// v2.11.0 (19/10/2026, sessão 20261019-1125-carga-silva-ajustes, demanda 9404081c, item 34) — iconeDoAtivo(a): ícone pelo
// tipo do catálogo (trator com trator, talhão com broto, secador com chama…), a categoria fica de reserva.
// Versão anterior: 2.10.0 · 19/10/2026
//
// v2.10.0 (19/10/2026, sessão 20261019-0850-carga-silva-l5a, demanda 9404081c, L5-3) — tiposDoCatalogo() devolve a lista de
// tipos do catálogo, para o "+" de Ativos dizer o que cadastrar no ramo da lente.
// Versão anterior: 2.9.0 · 18/10/2026
//
// v2.9.0 (18/10/2026, sessão 20261018-2343-carga-silva-l4a, demanda 9404081c; FICHA_LOTES_4_5 v1.1.0, de acordo do Nicola 18/10
// 23:43) — L4-B/L4-C: campo do tipo substitui o da categoria com a mesma chave e 'oculto' tira campo ou bloco (fazenda sem rua);
// na lente de um ramo entram os tipos ligados a um uso desse ramo (ramos_uso, montado por cofre-api.js).
// Versão anterior: 2.8.0 · 16/10/2026
//
// v2.8.0 (16/10/2026, sessão 20261016-0105-usos-fatia7-fix, demanda 3022603b; achado do Nicola 16/10 01:03) — rótulo e ícone
// das categorias Agro e Pecuária (rotuloTipoAtivo, iconeAtivo), que o novo ativo passa a oferecer (cofre-ativos.js 1.115.0).
// --------------------------------------------------------------------------
// Versões anteriores (v2.7.0 … v2.7.0): CHANGELOG_MODULOS.md, na raiz do repositório — o
// gerar_versoes.py rola pra lá automaticamente tudo além das 5 versões
// mais recentes deste cabeçalho (VER-06).
export const VERSAO = '2.12.0'; // v-check (18/09/2026): lido por Dev › Versões — manter igual ao header
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
        agro: 'Agro', pecuaria: 'Pecuária', // v2.8.0
    }[t] || t;
}

export function iconeAtivo(t) {
    return {
        veiculo: 'car', veiculo_blindado: 'shield', imovel: 'home', terreno: 'map', vida_protecao: 'heart-pulse', obra_arte: 'image', outro: 'package', aeronave: 'plane', embarcacao: 'sailboat', colecao_bem_valor: 'gem',
        // v1.4.0 (E4.2 fatia B — ponte de compatibilidade)
        imovel_predial: 'home', imovel_territorial: 'map', vida: 'heart-pulse', bem_valor: 'gem', agro: 'sprout', pecuaria: 'fence', // v2.8.0
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
export function listarTiposPorCategoria(categoria, opcoes = null) {
    if (!_catalogoAtivoTipos) return [];
    // v2.5.0 (F21) — com { ramo }: só tipos do ramo (ou todos, em 'tudo') e de ramo já ativo (Agro e Pecuária em breve ficam fora)
    const ramo = opcoes && opcoes.ramo;
    const ramoAtivo = ramoLiberado; // v2.7.0 (fatia 6a): ativo e contratado
    return _catalogoAtivoTipos
        .filter(t => t.categoria === categoria && (!opcoes || ((ramo === 'tudo' || !ramo || t.ramo === ramo || (t.ramos_uso || []).includes(ramo)) && ramoAtivo(t.ramo))))
        .map(t => ({ id: t.id, codigo: t.codigo, nome: t.nome }));
}

// v2.7.0 (usos fatia 6a) — ramo ativo E contratado (index: rzRamoLiberado, pela fn_cliente_ramos); sem o index (cofre.html
// avulso) vale só o status do ramo, como antes
function ramoLiberado(r) {
    if (!r) return true;
    if (typeof rzRamoLiberado === 'function') return rzRamoLiberado(r);
    return typeof rzRamoInfo !== 'function' || rzRamoInfo(r)?.status === 'ativo';
}

// v2.11.0 (item 34 da dem 9404081c, Nicola 19/10 11:19: "o trator está com ícone de planta") — ícone pelo TIPO do catálogo
// (codigo); a categoria fica de reserva. Nomes do Lucide.
const ICONE_POR_TIPO = {
    casa: 'home', apartamento: 'building', cobertura: 'building-2', sala: 'briefcase', conjunto: 'building-2', loja: 'store',
    galpao: 'warehouse', vaga: 'square-parking', terreno: 'map', lote: 'map-pin',
    fazenda: 'map', sitio: 'trees', chacara: 'trees', terreno_rural: 'map', gleba: 'land-plot', talhao: 'sprout', lavoura: 'sprout',
    trator: 'tractor', colheitadeira: 'tractor', colhedora_cafe: 'tractor', plantadeira: 'tractor', pulverizador: 'spray-can',
    implemento: 'wrench', terreiro: 'sun', secador: 'flame', armazem: 'warehouse',
    lote_bovino: 'beef', lote_suino: 'piggy-bank', equinos: 'fence', ovinos_caprinos: 'fence', pasto: 'fence', piquete: 'fence',
    curral: 'fence', galpao_rural: 'warehouse',
    empreendimento: 'building-2', obra: 'hard-hat', loteamento: 'map', area_comum: 'trees',
    carro: 'car', carro_blindado: 'shield', moto: 'bike', caminhao: 'truck', onibus: 'bus', reboque: 'truck',
    lancha: 'sailboat', iate: 'sailboat', veleiro: 'sailboat', jet_ski: 'waves', aviao: 'plane', helicoptero: 'plane',
    obra_de_arte: 'image', joia: 'gem', relogio: 'watch', vinho: 'wine', antiguidade: 'landmark', instrumento: 'music', livre: 'package',
    familia: 'users', pessoa: 'user', pet: 'paw-print',
};
// v2.12.0 (Nicola 19/10 11:34: "ajuste ícone de adulto, criança, idoso (maior 65) e pet") — a pessoa ganha o ícone pela
// idade (dados_especificos.data_nascimento): menor de 18 = criança, 65 ou mais = idoso, senão adulto; sem data, adulto.
function idadeDe(a) {
    const dn = a?.dados_especificos?.data_nascimento;
    if (!dn || !/^\d{4}-\d{2}-\d{2}/.test(dn)) return null;
    const [y, m, d] = dn.slice(0, 10).split('-').map(Number), h = new Date();
    let id = h.getFullYear() - y; if (h.getMonth() + 1 < m || (h.getMonth() + 1 === m && h.getDate() < d)) id--;
    return id;
}
export function iconeDoAtivo(a) {
    const t = a && a.tipo_detalhe_id ? tipoDoCatalogo(a.tipo_detalhe_id) : null;
    if (t && t.codigo === 'pessoa') { const i = idadeDe(a); return i === null ? 'user' : i < 18 ? 'rz-crianca' : i >= 65 ? 'rz-idoso' : 'user'; }
    return (t && ICONE_POR_TIPO[t.codigo]) || iconeAtivo(a?.tipo_ativo);
}
// Lucide não tem criança nem idoso: dois desenhos próprios no mesmo traço (24×24, stroke 2, currentColor)
const SVG_PROPRIO = {
    'rz-crianca': '<circle cx="12" cy="5.5" r="3"/><path d="M12 9.5v6"/><path d="M7 11.5l5 1 5-1"/><path d="M12 15.5l-3 5.5"/><path d="M12 15.5l3 5.5"/>',
    'rz-idoso': '<circle cx="10" cy="4.5" r="2.5"/><path d="M10 8c-1.2 2.5-1.2 5 0 8l-2 5"/><path d="M10 16l2.5 5"/><path d="M9.6 10.5l5.4 2"/><path d="M16 12.5V21"/><path d="M16 12.5c0-1.3 1.8-1.3 1.8 0"/>',
};
// HTML do ícone do ativo: <svg data-lucide> (ou <i>) para o Lucide; o SVG pronto para os desenhos próprios
export function iconeHtmlDoAtivo(a, tag = 'svg') {
    const n = iconeDoAtivo(a);
    if (SVG_PROPRIO[n]) return `<svg class="lucide rz-ic-proprio" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${SVG_PROPRIO[n]}</svg>`;
    return tag === 'i' ? `<i data-lucide="${n}"></i>` : `<svg data-lucide="${n}"></svg>`;
}

// v2.10.0 (L5-3) — a lista inteira do catálogo de tipos (ramo, segmento, ordem), [] sem catálogo
export function tiposDoCatalogo() { return _catalogoAtivoTipos || []; }

// v2.5.0 (F21/F22) — o tipo do catálogo (com ramo e segmento) pelo id; null sem catálogo
export function tipoDoCatalogo(id) {
    if (!_catalogoAtivoTipos || !id) return null;
    return _catalogoAtivoTipos.find(t => t.id === id) || null;
}

// v2.5.0 (F21) — categorias que têm tipo no ramo (para o 1º seletor do novo ativo); null sem catálogo
export function categoriasDoRamo(ramo) {
    if (!_catalogoAtivoTipos) return null;
    return [...new Set(listarTiposPorCategoriaTodas(ramo))];
}
function listarTiposPorCategoriaTodas(ramo) {
    const ramoAtivo = ramoLiberado; // v2.7.0 (fatia 6a): ativo e contratado
    // v2.9.0 (L4-C, D2) — na lente de um ramo entram também os tipos ligados a um uso desse ramo (Casa na lente Família, por Moradia)
    return _catalogoAtivoTipos.filter(t => (ramo === 'tudo' || !ramo || t.ramo === ramo || (t.ramos_uso || []).includes(ramo)) && ramoAtivo(t.ramo)).map(t => t.categoria);
}

// Campos estruturados: categoria sempre, + os específicos do tipo_detalhe
// escolhido (ex.: blindagem_empresa só aparece com tipoDetalheId = "Carro
// blindado"). tipoDetalheId omitido = só os campos de categoria (mesmo
// comportamento de antes de existir o 2º seletor).
// v2.6.0 (fatia 3b) — contexto 'ativo' (solto) ou 'subativo' (unidade, área, integrante); linha 'ambos' vale nos dois
const noContexto = (c, contexto) => !c.contexto || c.contexto === 'ambos' || c.contexto === (contexto || 'ativo');
// v2.9.0 (L4-B, dem 9404081c) — linha do TIPO com a mesma chave substitui a da categoria (rótulo, opções, tipo de dado), e
// tipo_dado 'oculto' tira o campo/bloco da categoria para aquele tipo (ex.: fazenda sem rua e número). Armadilha: sem a
// substituição, a soma de categoria + tipo duplicava a chave e o formulário lia o mesmo id duas vezes.
function linhasResolvidas(categoria, tipoDetalheId, contexto) {
    const doTipo = new Map();
    const base = [];
    _catalogoAtivoCampos
        .filter(c => c.categoria === categoria && (c.tipo_detalhe_id === null || c.tipo_detalhe_id === tipoDetalheId) && noContexto(c, contexto))
        .forEach(c => { if (c.tipo_detalhe_id) doTipo.set(c.chave, c); else base.push(c); });
    const out = base.filter(c => !doTipo.has(c.chave)).concat([...doTipo.values()]);
    return out.filter(c => c.tipo_dado !== 'oculto');
}
export function obterCamposPorTipo(categoria, tipoDetalheId = null, contexto = 'ativo') {
    if (!_catalogoAtivoCampos) return CAMPOS_POR_TIPO_ATIVO_FALLBACK[categoria] || [];
    const daCategoria = _catalogoAtivoCampos.filter(c => c.categoria === categoria);
    const campos = linhasResolvidas(categoria, tipoDetalheId, contexto)
        .filter(c => c.tipo_dado !== 'bloco')
        .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
        .map(c => ({ chave: c.chave, label: c.label, obrigatorio: !!c.obrigatorio, ...(c.tipo_dado && c.tipo_dado !== 'text' ? { tipo: c.tipo_dado } : {}),
                     ...(c.mascarar ? { mascarar: true } : {}), ...(Array.isArray(c.opcoes) ? { opcoes: c.opcoes } : {}) }));
    // v2.6.0 — com o catálogo carregado, categoria sem campo para este tipo (Família) fica sem campo; o fallback de
    // código só vale para categoria que o catálogo não conhece.
    return daCategoria.length ? campos : (CAMPOS_POR_TIPO_ATIVO_FALLBACK[categoria] || []);
}
// v2.6.0 (fatia 3b) — blocos fixos do formulário (linhas tipo_dado = 'bloco'): Set de chaves, ou null sem catálogo de
// blocos (quem chama mantém o formulário de antes). v2.9.0 — a linha 'oculto' do tipo tira o bloco.
export function blocosDoFormulario(categoria, tipoDetalheId = null, contexto = 'ativo') {
    if (!_catalogoAtivoCampos || !_catalogoAtivoCampos.some(c => c.tipo_dado === 'bloco')) return null;
    return new Set(linhasResolvidas(categoria, tipoDetalheId, contexto).filter(c => c.tipo_dado === 'bloco').map(c => c.chave));
}

// Retorna lista de mensagens de erro (vazia = válido). Não lança exceção —
// quem chama decide como mostrar (mesmo padrão dos indicadores inline do
// Design System).
export function validarCamposAtivo(tipoAtivo, nomeExibicao, dadosEspecificos, tipoDetalheId = null, contexto = 'ativo') {
    const erros = [];
    if (!nomeExibicao || !nomeExibicao.trim()) erros.push('Nome de exibição é obrigatório.');
    const campos = obterCamposPorTipo(tipoAtivo, tipoDetalheId, contexto);
    for (const campo of campos) {
        if (campo.obrigatorio && !(dadosEspecificos && dadosEspecificos[campo.chave])) {
            erros.push(`${campo.label} é obrigatório para este tipo de ativo.`);
        }
        // v2.9.0 (L4-B) — coordenadas: as duas partes, latitude entre -90 e 90 e longitude entre -180 e 180
        const v = dadosEspecificos && dadosEspecificos[campo.chave];
        if (campo.tipo === 'coordenadas' && v) {
            const [la, ln] = String(v).split(',').map(x => parseFloat((x || '').trim()));
            if (!(Number.isFinite(la) && Number.isFinite(ln) && Math.abs(la) <= 90 && Math.abs(ln) <= 180))
                erros.push(`${campo.label}: informe latitude e longitude em graus (ex.: -21.2510 e -45.0012).`);
        }
        if (campo.tipo === 'tamanho' && v && !(parseFloat(v) >= 0)) erros.push(`${campo.label}: informe um número.`);
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
let rotulosTipoCatalogo = null; // v2.4.0 — preenchido pelo catálogo controle_tipos
export function definirCatalogoTiposControle(lista) {
    rotulosTipoCatalogo = Object.fromEntries((lista || []).map(x => [x.codigo, x.nome]));
}
export function rotuloTipoControle(t) {
    if (rotulosTipoCatalogo && rotulosTipoCatalogo[t]) return rotulosTipoCatalogo[t];
    return { seguro: 'Seguro', manutencao: 'Manutenção', tributo: 'Tributo', taxa: 'Taxa', documento: 'Documento', despesa: 'Despesa' }[t] || t; // v2.3.0
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
