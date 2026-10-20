// =====================================================================
// RAIZ PATRIMÔNIO — js/resultados.js
// VERSÃO: Beta v2.16.0 (20/10/2026 — demanda 87ff1a11)
// LINHAS: (ver versoes.json)
// -----------------------------------------------------------------
// NOVIDADES (Beta v2.16.0) (20/10/2026, sessão 20261018-2336-usos-lotes, demanda 87ff1a11; Nicola 13:38, de acordo 14:01) — lente
//   Obras: sem obra com etapas, o box "Avanço físico · Entrega dez/27" vira "Falta pagar": saldo somado dos planos de pagamento e
//   as parcelas que faltam ("6 parcelas"; com mais de um plano, "· N obras"). A data de entrega fica só em Obras em andamento.
//   Obra com etapas continua com o Avanço físico em %.
// Versão anterior (Beta v2.15.0):
// NOVIDADES (Beta v2.15.0) (20/10/2026, sessão 20261018-2336-usos-lotes, demanda 87ff1a11; de acordo do Nicola 20/10 13:13) —
//   lente Obras com imóvel em construção por plano de pagamento (Construção coletiva, Compra na planta): Investido no ano soma
//   as parcelas de aquisição (fn_hoje_ramo_indicadores.investido_ano, migration hoje_obras_plano_v1); Avanço financeiro sem
//   etapas = pago ÷ total do plano ("N de M pagas"); Avanço físico sem etapas mostra a entrega prevista; o card Obras em
//   andamento lista os planos (pago × total, entrega); o gráfico vira "Investido por mês"; "Carteira × indicadores" e
//   Performance saem da lente Obras.
// Versão anterior (Beta v2.14.0):
// NOVIDADES (Beta v2.14.0) (19/10/2026, sessão 20261018-2336-usos-lotes, demanda 63649288; FICHA_COCKPIT_METAS_RELATORIO_RAIZ v1.0.0,
//   de acordo do Nicola 18/10 23:36) — cockpit C3: Exportar ganha "Relatório executivo" do ramo da lente e do consolidado
//   (js/relatorios-executivos.js 1.6.0, código relatorios.executivo).
// Versão anterior (Beta v2.13.0):
// NOVIDADES (Beta v2.13.0) (19/10/2026, sessão 20261018-2336-usos-lotes, demanda 63649288; FICHA_COCKPIT_METAS_RELATORIO_RAIZ v1.0.0,
//   de acordo do Nicola 18/10 23:36) — cockpit C2, toque no número: tocar no resultado do herói abre a Composição, com a
//   trilha Todo o patrimônio › Ramo › Ativo principal › Ativo ("‹" volta um nível) e três vistas: Por grupo (com a variação
//   sobre o ano anterior; tocar num grupo abre os lançamentos dele), Por mês e Lançamentos (tocar abre o detalhe). Em Todo
//   o patrimônio, a lista dos ramos desce um nível; na lente, a lista dos ativos (fn_hoje_ramo_indicadores.por_ativo).
//   Sem função nova: fn_resultado_por_grupo, fn_resultado_mensal e a leitura de lancamentos (RLS da empresa).
// Versão anterior (Beta v2.12.0):
// NOVIDADES (Beta v2.12.0) (18/10/2026, sessão 20261018-2336-usos-lotes, demanda 63649288; FICHA_COCKPIT_METAS_RELATORIO_RAIZ v1.0.0,
//   de acordo do Nicola 18/10 23:36) — cockpit C1, metas do ano: o herói mostra a barra real × meta e "meta até <mês> · faltam"
//   (lente: fn_hoje_ramo_indicadores.meta; Todo o patrimônio: fn_hoje_por_ramo.consolidado.meta); a margem da lente compara
//   com a da meta; o Resultado por ramo mostra a meta do período de cada ramo e do Consolidado. Exportar ganha "Metas de
//   <ano>" (js/cockpit-metas.js). Sem meta, nada muda.
// Versão anterior (Beta v2.11.1):
// NOVIDADES (Beta v2.11.1) (16/10/2026) — comparação em .rz-vs (a .rz-cmp é do gráfico Carteira × indicador).
// Versão anterior (Beta v2.11.0):
// NOVIDADES (Beta v2.11.0) (16/10/2026, sessão 20261016-0945-usos-fatia8, demanda 3022603b; FICHA_FATIA8_HOJE_POR_RAMO_RAIZ v1.2.0 e
//   PROTOTIPO_HOJE_COCKPIT_RAMOS_RAIZ v1.0.0, de acordo do Nicola 16/10 01:09 e 09:43) — o Hoje responde "qual ramo dá resultado":
//   — Todo o patrimônio: card Resultado por ramo (fn_hoje_por_ramo), uma linha por ramo com receita × despesa, margem e
//     patrimônio, a linha Geral · sem ativo e o Consolidado; tocar no ramo abre a lente. Sai o card Geral separado (D8-1).
//   — Herói: todo número compara com o ano anterior (% ou p.p.; verde e vermelho só dizem bom e ruim) e o resultado tem a
//     linha do ano (sparkline). Cada ramo tem os seus números no herói (D8-2 revista, D8-8, D8-9).
//   — Lentes: Família (por vida), Outros bens (custo por bem), Agro (safras abertas, sacas, custo por saca e por hectare),
//     Obras (avanço físico × financeiro), Pecuária (rebanho, prenhez, partos, avisos, vendas) e o resultado por ativo
//     (fn_hoje_ramo_indicadores). Tocar num ativo abre a ficha; num aviso, a ficha do animal.
// Versão anterior (Beta v2.10.0):
// NOVIDADES (Beta v2.10.0) (14/10/2026, sessão 20261014-2145-onda9c-textos, demanda a05ad2ee; onda 9c do estudo, D6 seção 10) — textos no
//   limite: ação até 24, descrição até 28, aviso e tela vazia até 40 caracteres. Nada de comportamento mudou.
// Versão anterior (Beta v2.9.0):
// NOVIDADES (Beta v2.9.0) — F23 (resultados por ramo; Nicola 10/10 10:45, "opção b"):
//   — As funções de resultado recebem p_ramo. Num ramo que soma valor (Imóveis, Outros bens) o Hoje volta a ter
//     o herói completo (patrimônio, resultado do ano, rentabilidade, ocupação, inadimplência) e os cards do ramo;
//     os cards de locação e a comparação com indicadores ficam em Todo o patrimônio e Imóveis.
//   — Família (não soma valor): herói com as vidas, e os cards Resultado mês a mês e Por grupo das despesas das vidas.
//   — Em Todo o patrimônio, um card "Geral · sem ativo": o que foi lançado sem ativo, que não entra em ramo nenhum.
// Versão anterior: Beta v2.8.0
// -----------------------------------------------------------------
// NOVIDADES (Beta v2.8.0) — sessão 20261008-1231-pessoas-ativos; pedido do Nicola 10/10 10:22:
//   — Herói de Todo o patrimônio diz "Todo o patrimônio" (era "Patrimônio sob gestão").
//   — No ramo Imóveis voltam os cards da carteira de imóveis: contratos por índice, concentração, reajustes
//     e revisional (são de contrato de locação, logo de imóvel). Resultado mês a mês e por grupo esperam a F23.
// Versão anterior: Beta v2.7.0
// -----------------------------------------------------------------
// NOVIDADES (Beta v2.7.0) — sessão 20261008-1231-pessoas-ativos; fichas F21/F22 ("De acordo" do Nicola 10/10 02:52):
//   — O ramo sai do herói: quem escolhe é a lente do cabeçalho do app (index.html), e o Hoje recebe o ramo e o
//     cadastro dele (ativo_ramos: nome, unidade, soma valor, tem uso). Em Todo o patrimônio o herói e os cards são
//     os de sempre, sem seletor.
//   — Num ramo, o herói mostra o valor e a quantidade do ramo (ou só a quantidade, quando o ramo não soma valor,
//     como as vidas da Família) e, se o ramo tem uso, Todos · Comercial · Uso próprio. Os cards de Resultados
//     ficam em Todo o patrimônio: as funções de resultado ainda não recortam por ramo (F23).
// Versão anterior: Beta v2.6.0
// -----------------------------------------------------------------
// NOVIDADES (Beta v2.6.0) — sessão 20261008-1231-pessoas-ativos; ficha F20 e protótipo PROTOTIPO_HOJE_ANEL_RAMO_RAIZ
//   v1.2.0 aprovados pelo Nicola 10/10 ("De acordo"):
//   — O herói troca o "Tudo · Comercial · Família" pelo RAMO: Tudo · Patrimônio · Família · Agro (em breve,
//     travado). O uso (Todos · Comercial · Uso próprio) aparece só dentro de Patrimônio; "Uso próprio" é o
//     antigo "Família" de uso (nao_comercial), com o mesmo cálculo de custo.
//   — Ramo Família: o herói mostra quantos cadastros a família tem (pessoas e pets não têm valor) e os cards
//     de Resultados não aparecem — as funções de resultado ainda não recortam por ramo.
// Versão anterior: Beta v2.5.0
// -----------------------------------------------------------------
// NOVIDADES (Beta v2.5.0) — sessão 20261003-1707-ux-base; pedido do Nicola 09/10 23:04 (itens 2 a 4):
//   — Card novo "Contratos por índice" no Patrimônio (fn_carteira_indices_resumo, já existente): barras deitadas
//     com a fatia do aluguel e o nº de contratos por índice de reajuste, título-conclusão, reajuste médio
//     ponderado de 12 meses e o atalho "Indicadores e simuladores" (abrirIndicadores). Sem o código
//     resultados.indicadores o card aparece bloqueado, com o motivo.
//   — "Sua carteira × indicador" no modelo executivo: título-conclusão, rótulo direto no fim de cada linha,
//     SVG sem distorcer o texto, e chips para comparar a carteira com até 2 dos 6 indicadores (começa com
//     IPCA e IGP-M; trocarIndicadorComparacao). Indicador continua linha de referência tracejada (REGRAS §18).
//   — Indicadores de mercado voltam aos quadrantes, agora em blocos separados (nome e mês no topo, valor,
//     12 meses embaixo).
// --------------------------------------------------------------------------
// Versões anteriores (v2.4.0 … v2.4.0): CHANGELOG_MODULOS.md, na raiz do repositório — o
// gerar_versoes.py rola pra lá automaticamente tudo além das 5 versões
// mais recentes deste cabeçalho (VER-06).
export const VERSAO = '2.16.0';

// ---------------------------------------------------------------------
// Estado do filtro (module-scoped — sobrevive entre renders porque o
// import dinâmico só roda uma vez por sessão de app, mesmo padrão do
// module cache usado por carregarImoveis()/carregarContratos()).
// ---------------------------------------------------------------------
const ANO_ATUAL = new Date().getFullYear();
let filtro = { ano: ANO_ATUAL, abrangencia: 'carteira', contexto: 'tudo', ramo: 'tudo', alvoId: null, alvoNome: null };
// rascunho editado dentro do sheet Filtros, só vira `filtro` em Aplicar
let rascunho = null;

const CONTEXTO_USO = { tudo: null, comercial: 'comercial', familia: 'nao_comercial' };
const CONTEXTO_ROTULO = { tudo: 'Todos', comercial: 'Comercial', familia: 'Uso próprio' }; // v2.6.0 — uso, dentro do ramo
// v2.7.0 (F21) — o ramo vem da lente do cabeçalho (index.html), com o cadastro dele (ativo_ramos)
let ramoInfo = null; // { codigo, nome, unidade_singular, unidade_plural, soma_valor, tem_uso }
let ultimoPorRamo = null; // v2.12.0 — última leitura de fn_hoje_por_ramo (escolha do ramo em Metas)
const ABRANGENCIA_ROTULO = { carteira: 'Carteira', empreendimento: 'Empreendimento', imovel: 'Imóvel' };
const NOMES_MES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
// v2.15.0 — '2027-12-01' → 'dez/27'
function mesAnoCurto(iso) {
    const m = /^(\d{4})-(\d{2})/.exec(String(iso || ''));
    return m ? `${['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'][Number(m[2]) - 1]}/${m[1].slice(2)}` : '';
}
const NOMES_MES_LONGO = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

function pctFmt(v) { return v == null ? '—' : `${v}%`; }

// v1.5.0 (demanda 8ac32623) — "Patrimônio" em milhões (mesmo padrão
// compacto "R$ 41,9 mi" que a Visão Geral já usa em formatarValorCompacto,
// index.html) — reusa a MESMA função em vez de reinventar um 2º formato
// compacto (CAN-03, "não duplicar regra"). formatarValorCompacto é uma
// function de topo de um <script> clássico (não módulo), então vira
// window.formatarValorCompacto — acessível daqui. Fallback defensivo pro
// formato cheio se por algum motivo não existir (nunca deveria acontecer
// em produção; só protege contra o script principal ainda não ter
// terminado de carregar num cenário incomum).
function formatarPatrimonioCompacto(v) {
    if (typeof window.formatarValorCompacto === 'function') return window.formatarValorCompacto(v);
    return formatarMoedaBR(v || 0, { semCentavos: true });
}

// v1.3.0 (B1.2) — sinal explícito (+/-), 2 casas, vírgula — mesmo padrão
// já usado em fn_revisao_valor_sugerir (R.4) e fn_simular_reajuste_
// contrato (B1.2), só que calculado aqui porque o card lista 3 índices
// de uma vez (fn_indicadores_resumo não formata texto, devolve número).
function pctSinal(v) {
    if (v == null) return '—';
    const n = Number(v);
    return (n >= 0 ? '+' : '') + n.toFixed(2).replace('.', ',') + '%';
}

// ---------------------------------------------------------------------
// v2.11.0 (fatia 8, cockpit) — peças do cockpit (DESIGN_SYSTEM §cockpit): comparação com o ano anterior, sparkline,
// barra de bala (real × previsto) e linha comparativa por ramo.
// ---------------------------------------------------------------------
const ehBloqueado = p => p === false || !!(p && p.ok === false);
function podeVerPorRamo() { return typeof podeUsar !== 'function' || !ehBloqueado(podeUsar('hoje.resultado_por_ramo')); }
const nOuNull = v => (v === null || v === undefined || v === '' || Number.isNaN(Number(v))) ? null : Number(v);
const fmtNum = (v, casas = 1) => Number(v).toLocaleString('pt-BR', { maximumFractionDigits: casas });
const sinalTxt = v => (v > 0 ? '+' : v < 0 ? '−' : '');
function moedaCurta(v) { const n = Number(v) || 0; return (n < 0 ? '−' : '') + formatarPatrimonioCompacto(Math.abs(n)); }
function moedaInteira(v) { return formatarMoedaBR(Number(v) || 0, { semCentavos: true }); }
function escR(t) { return String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
const codR = c => String(c || '').replace(/[^a-z0-9_]/gi, ''); // código de ramo vai para onclick e var() de CSS

// Todo número compara (DIRETRIZES_UX §cockpit). pp: o número já é % e a diferença vai em pontos percentuais.
// bom: 'sobe' (receita, resultado), 'desce' (custo, inadimplência) ou null (neutro: sem verde nem vermelho).
function comparar(atual, anterior, { pp = false, bom = 'sobe', rotulo } = {}) {
    const a = nOuNull(atual), b = nOuNull(anterior);
    if (a === null || b === null) return '';
    let d, txt;
    if (pp) { d = a - b; txt = `${sinalTxt(d)}${fmtNum(Math.abs(d))} p.p.`; }
    else { if (b === 0) return ''; d = (a - b) / Math.abs(b) * 100; txt = `${sinalTxt(Math.round(d))}${fmtNum(Math.abs(d), 0)}%`; }
    const igual = pp ? Math.abs(d) < 0.05 : Math.round(d) === 0;
    const cls = igual || !bom ? 'rz-vs' : ((d > 0) === (bom === 'sobe') ? 'rz-vs rz-vs-bom' : 'rz-vs rz-vs-ruim');
    return `<em class="${cls}">${txt} ${rotulo || `vs ${filtro.ano - 1}`}</em>`;
}
const notaCmp = (t, cls = '') => t ? `<em class="rz-vs${cls ? ' ' + cls : ''}">${escR(t)}</em>` : '';

// Linha do ano: resultado acumulado mês a mês até o mês corrente (só o desenho; o número está ao lado).
function sparkSvg(mensal, campo = 'resultado') {
    if (!Array.isArray(mensal) || !mensal.length) return '';
    const ate = filtro.ano === ANO_ATUAL ? new Date().getMonth() + 1 : 12;
    let acc = 0;
    const v = Array.from({ length: ate }, (_, i) => (acc += Number((mensal.find(m => Number(m.mes) === i + 1) || {})[campo]) || 0));
    if (v.length < 2) return '';
    const min = Math.min(...v), max = Math.max(...v), amp = (max - min) || 1;
    const pts = v.map((x, i) => `${(i / (v.length - 1) * 54).toFixed(1)},${(18 - (x - min) / amp * 16).toFixed(1)}`).join(' ');
    return `<svg class="rz-spark" viewBox="0 0 54 20" aria-hidden="true"><polyline points="${pts}"/></svg>`;
}

// Barra de bala (Few): trilho = previsto; sombra = pago + a pagar; barra escura = pago; traço = marcador (avanço físico
// ou fase). `alerta`: a barra fica vermelha (gasto à frente do físico).
function barraBala({ pago = 0, aPagar = 0, previsto = null, marcador = null, alerta = false, esquerda = '', direita = '' }) {
    const base = Math.max(Number(previsto) || 0, (Number(pago) || 0) + (Number(aPagar) || 0), 1);
    const p = x => Math.max(0, Math.min(100, (Number(x) || 0) / base * 100)).toFixed(1);
    const mk = marcador == null ? '' : `<span class="rz-bl-mk" style="left:${Math.max(0, Math.min(100, marcador)).toFixed(1)}%"></span>`;
    return `<div class="rz-bl"><div class="rz-bl-tr"><span class="rz-bl-fs" style="width:${p(Number(pago) + Number(aPagar || 0))}%"></span><span class="rz-bl-ex${alerta ? ' rz-ruim' : ''}" style="width:${p(pago)}%"></span>${mk}</div>`
        + `<div class="rz-bl-lg"><span>${esquerda}</span><span>${direita}</span></div></div>`;
}

// Tocar num ativo do Hoje abre a ficha dele; num aviso de animal, a ficha do animal.
export function abrirAtivoHoje(id) {
    if (!id) return;
    if (typeof switchTab === 'function') switchTab('tab-ativos');
    if (typeof window.abrirFichaAtivoNoChip === 'function') window.abrirFichaAtivoNoChip(id, 'resumo');
}
export function abrirMembroHoje(id) {
    if (!id) return;
    import('./cofre-membros.js').then(m => m.abrirFichaMembro(id)).catch(() => { if (typeof mostrarToast === 'function') mostrarToast('Não consegui abrir.'); });
}

const NOME_CURTO_INDICADOR = { ipca: 'IPCA', igpm: 'IGP-M', selic: 'Selic', ivgr: 'IVG-R', inccdi: 'INCC-DI', cdi: 'CDI' };
// v2.5.0 — indicadores que a carteira pode comparar (ordem dos chips) e os escolhidos (até 2; começa IPCA e IGP-M).
const INDICADORES_COMPARAVEIS = ['ipca', 'igpm', 'inccdi', 'selic', 'cdi', 'ivgr'];
let indicadoresComparar = ['ipca', 'igpm'];
// v2.1.0 (5A) — última leitura de fn_indicadores_resumo, para o ⓘ mostrar o texto de cada
// indicador sem consultar de novo. Só leitura; quem escreve é renderizarConteudo().
let ultimosIndicadores = [];
const MES_CURTO_IND = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
function competenciaCurta(iso) {
    if (!iso) return '';
    const [a, m] = String(iso).split('-');
    return `${MES_CURTO_IND[(+m || 1) - 1]}/${String(a).slice(2)}`;
}

// v1.2.0 (21/09/2026, pedido explícito ao vivo: "o icone i deve entrar em
// todos os cards desta tela") — botão (i) reaproveitado por TODOS os
// `.rz-card` desta tela (antes só existia em Reajustes/Revisionais).
// Mesmo padrão de explicarStatusConciliacao() (financeiro.js): ícone
// sozinho no cabeçalho do card, abre Sheet explicando direto (não é o
// `⋮`/Sheet de ações do §5 da gramática — é a mesma exceção informativa
// já aceita nos 2 cards de calendário na entrega anterior). Não entra no
// bloco de KPIs (.rz-kpis): não é `.rz-card` na anatomia do DESIGN_SYSTEM.
function botaoInfoCard(onclick) {
    return `<button type="button" onclick="${onclick}" class="text-slate-400" title="O que é isso?" aria-label="O que é isso?" style="line-height:0"><svg data-lucide="info" style="width:14px;height:14px"></svg></button>`;
}

// ---------------------------------------------------------------------
// v2.0.0 (UX F2.1a) — Boot: chamado por Hoje (index.html, rzRenderResultadosHoje) a cada
// desenho da aba, com o contexto de Hoje. Herói em #hoje-heroi-mount; cards em
// #hoje-resultados-mount. Abrangência é sempre a carteira (UXR-18).
// ---------------------------------------------------------------------
let geracao = 0; // só o desenho mais novo escreve na tela
export async function renderResultados(opcoes) {
    const heroi = document.getElementById('hoje-heroi-mount');
    const cards = document.getElementById('hoje-resultados-mount');
    if (!heroi || !cards || !CLIENTE_ID_SUPABASE) return;
    if (opcoes && Object.prototype.hasOwnProperty.call(CONTEXTO_USO, opcoes.contexto)) filtro.contexto = opcoes.contexto;
    if (opcoes && typeof opcoes.ramo === 'string') { filtro.ramo = opcoes.ramo || 'tudo'; ramoInfo = opcoes.ramoInfo || null; } // v2.7.0
    if (filtro.ramo === 'tudo' || !ramoInfo?.tem_uso) filtro.contexto = 'tudo'; // uso só dentro de ramo que tem uso
    filtro.abrangencia = 'carteira'; filtro.alvoId = null; filtro.alvoNome = null;
    const noRamo = filtro.ramo !== 'tudo';
    heroi.innerHTML = noRamo ? montarHeroiRamo(null, true) : montarHeroi(null, null, true);
    if (!heroi._rzCompo) { // v2.13.0 (cockpit C2) — tocar no resultado do herói abre a composição
        heroi._rzCompo = true;
        const abrir = ev => { if (ev.target.closest('[data-rz-compo]') && (ev.type === 'click' || ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); abrirComposicaoHoje(); } };
        heroi.addEventListener('click', abrir); heroi.addEventListener('keydown', abrir);
    }
    // v2.7.0 — num ramo, os cards de Resultados ficam em Todo o patrimônio (as funções ainda não recortam por ramo — F23)
    cards.innerHTML = noRamo ? '<div id="resultados-conteudo"></div>'
        : `<h3 class="rz-plain-title">Resultados · ${filtro.ano}</h3><div id="resultados-conteudo">${rzSk('cards', 3)}</div>`;
    if (typeof rzIcones === 'function') rzIcones();
    await renderizarConteudo();
}

// Ano do herói: ‹ › entre os 2 anos anteriores e o corrente (os mesmos 3 do antigo filtro).
export function escolherResultadosAno(delta) {
    const novo = filtro.ano + Number(delta);
    if (novo < ANO_ATUAL - 2 || novo > ANO_ATUAL) return;
    filtro.ano = novo;
    renderResultados();
}

// v1.4.0 (demanda 60284322) — tocar em Hoje na barra volta ao ano corrente. O contexto é
// de Hoje (index.html) e não muda aqui. Quem redesenha é o próprio switchTab.
export function resetarResultadosParaAbaInicial() {
    filtro.ano = ANO_ATUAL;
}

// UXR-17 — herói unificado. `carregando`: casca com "—" enquanto as funções respondem.
// v2.11.0 (fatia 8) — ctx: { ant (fn_resumo_resultados do ano anterior), mensal (sparkline), ind (fn_hoje_ramo_indicadores) }.
function montarHeroi(resumo, perf, carregando, ctx = {}) {
    const familia = filtro.contexto === 'familia';
    const tem = !!(resumo || perf);
    const traco = '—';
    const patrimonio = perf ? perf.patrimonio : (resumo ? resumo.soma_valor_mercado : null);
    const totalAtivos = perf ? perf.total_ativos : (resumo ? resumo.total_imoveis : null);
    const resultadoAno = perf ? perf.resultado_liquido : (resumo ? resumo.resultado_liquido_ano : null);
    const saidasAno = perf ? perf.saidas_ano : (resumo ? resumo.saidas_ano : null);
    const rentabilidade = perf ? perf.rentabilidade_pct : (resumo ? resumo.yield_ano_pct : null);
    const inadimplencia = perf ? perf.inadimplencia_valor : (resumo ? resumo.inadimplencia_valor : null);
    const ocupacao = resumo ? resumo.ocupacao_pct : null;
    const moeda = v => formatarMoedaBR(v || 0, { semCentavos: true });
    const pctBR = v => v == null ? traco : Number(v).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%'; // 5,2%

    const resRotulo = familia ? 'Custo · ' + filtro.ano : 'Resultado do ano';
    const resValor = !tem ? traco : (familia ? moeda(saidasAno) : moeda(resultadoAno));
    const resNeg = tem && !familia && Number(resultadoAno) < 0 ? ' class="rz-neg"' : '';
    const celula = (r, v, neg, cmp) => `<div><small>${r}</small><b${neg ? ' class="rz-neg"' : ''}>${v}</b>${cmp || ''}</div>`;
    const ant = tem ? (ctx.ant || null) : null;
    const ind = tem && ctx.ind && ctx.ind.pode_ver !== false ? ctx.ind : null;
    const celulas = familia
        ? [celula('Inadimplência', tem ? moeda(inadimplencia) : traco, tem && Number(inadimplencia) > 0, ant ? comparar(inadimplencia, ant.inadimplencia_valor, { bom: 'desce' }) : '')]
        : celulasHeroiRamo({ tem, resumo, ant, ind, moeda, pctBR, rentabilidade, ocupacao, inadimplencia, celula });
    const resCmp = ant && !familia ? comparar(resultadoAno, ant.resultado_liquido_ano)
        : (ant && familia ? comparar(saidasAno, ant.saidas_ano, { bom: 'desce' }) : '');
    const spark = tem && ctx.mensal ? sparkSvg(ctx.mensal) : '';
    const metaHtml = tem && !familia ? metaHeroiHtml(resultadoAno, ctx.meta, moeda) : ''; // v2.12.0 (cockpit C1)
    let ativosTxt = totalAtivos == null ? '' : `${totalAtivos} ${Number(totalAtivos) === 1 ? 'ativo' : 'ativos'}`;
    if (filtro.ramo !== 'tudo' && ind && ind.qtd != null) { // v2.11.0 — na lente, a unidade do ramo (lotes, talhões, bens)
        const q = Number(ind.qtd);
        ativosTxt = `${q} ${q === 1 ? (ramoInfo?.unidade_singular || 'ativo') : (ramoInfo?.unidade_plural || 'ativos')}`;
        if (filtro.ramo === 'pecuaria' && ind.animais != null) ativosTxt = `${ind.animais} ${Number(ind.animais) === 1 ? 'animal' : 'animais'} em ${ativosTxt}`;
    }
    const seg = segRamoUsoHtml();

    return `<div class="rz-heroi"${carregando ? ' aria-busy="true"' : ''}>
        <div class="rz-heroi-top">
            <div class="rz-heroi-ano">
                <button type="button" onclick="escolherResultadosAno(-1)" aria-label="Ano anterior"${filtro.ano <= ANO_ATUAL - 2 ? ' disabled' : ''}><svg data-lucide="chevron-left"></svg></button>
                <b>${filtro.ano}</b>
                <button type="button" onclick="escolherResultadosAno(1)" aria-label="Próximo ano"${filtro.ano >= ANO_ATUAL ? ' disabled' : ''}><svg data-lucide="chevron-right"></svg></button>
            </div>
            <button type="button" class="rz-heroi-exp" onclick="abrirResultadosExportar()" aria-label="Exportar"><svg data-lucide="share"></svg></button>
        </div>
        <small>${filtro.ramo === 'tudo' ? 'Todo o patrimônio' : String(ramoInfo?.nome || '').replace(/[<>&"]/g, '')}</small>
        <b class="rz-heroi-pat">${tem ? formatarPatrimonioCompacto(patrimonio) : traco}</b>
        ${ativosTxt ? `<small>${ativosTxt}</small>` : ''}
        <div class="rz-heroi-res">
            <div class="rz-heroi-resl"><div${tem && !familia ? ' class="rz-tq" role="button" tabindex="0" data-rz-compo aria-label="Ver a composição do resultado"' : ''}><small>${resRotulo}${tem && !familia ? ' <svg data-lucide="chevron-right" class="rz-tq-ic"></svg>' : ''}</small><b${resNeg}>${resValor}</b>${resCmp}</div>${spark}</div>${metaHtml}
            <div class="rz-heroi-3${celulas.length === 1 ? ' rz-um' : celulas.length === 4 ? ' rz-q4' : ''}">${celulas.join('')}</div>
        </div>
        ${seg}
    </div>`;
}

// v2.12.0 (cockpit C1, D-CK2) — real × meta do período: barra (real e traço da meta até o mês, na escala da meta do ano)
// e a frase "meta até <mês>: R$ X · faltam R$ Y". Sem meta, nada.
function metaHeroiHtml(real, meta, moeda) {
    if (!meta || meta.ate_mes == null) return '';
    const r = Number(real) || 0, ate = Number(meta.ate_mes) || 0, noAno = Number(meta.ano) || 0, mes = Number(meta.mes) || 0;
    const pc = x => Math.max(0, Math.min(100, x)).toFixed(1);
    const barra = noAno > 0 ? `<div class="rz-mt-bar" aria-hidden="true"><span class="rz-mt-ex" style="width:${pc(r / noAno * 100)}%"></span><span class="rz-mt-mk" style="left:${pc(ate / noAno * 100)}%"></span></div>` : '';
    if (!mes) return barra + notaCmp(`meta do ano: ${moeda(noAno)}`);
    const dif = r - ate;
    return barra + notaCmp(`meta até ${MES_CURTO_IND[mes - 1]}: ${moeda(ate)} · ${dif >= 0 ? 'acima em' : 'faltam'} ${moeda(Math.abs(dif))}`, dif >= 0 ? 'rz-vs-bom' : 'rz-vs-ruim');
}

// v2.11.0 (fatia 8, D8-2 revista e D8-9) — os números do herói de cada ramo. Imóveis e Todo o patrimônio: margem,
// rentabilidade, ocupação e inadimplência. Os outros ramos: os números da operação deles. Todos comparam.
function celulasHeroiRamo({ tem, resumo, ant, ind, moeda, pctBR, rentabilidade, ocupacao, inadimplencia, celula }) {
    const traco = '—';
    const r = filtro.ramo;
    const receita = resumo ? Number(resumo.recebido_ano) || 0 : 0;
    const despesa = resumo ? Number(resumo.saidas_ano) || 0 : 0;
    const resultado = resumo ? Number(resumo.resultado_liquido_ano) || 0 : 0;
    const margem = receita > 0 ? resultado / receita * 100 : null;
    const margemAnt = ant && Number(ant.recebido_ano) > 0 ? Number(ant.resultado_liquido_ano) / Number(ant.recebido_ano) * 100 : null;
    // v2.12.0 (cockpit C1) — com meta de receita no ramo, a margem compara com a da meta
    const margemMeta = ind && ind.meta && Number(ind.meta.receita_ate) > 0 ? Number(ind.meta.ate_mes) / Number(ind.meta.receita_ate) * 100 : null;
    const cMargem = () => celula('Margem', tem && margem != null ? pctBR(margem) : traco, margem != null && margem < 0, margem != null ? (margemMeta != null ? comparar(margem, margemMeta, { pp: true, rotulo: 'vs meta' }) : comparar(margem, margemAnt, { pp: true })) : notaCmp(tem ? 'sem receita no ano' : ''));
    const cAPagar = () => celula('A pagar 30 dias', ind ? moeda(ind.a_pagar_30?.valor) : traco, false,
        ind ? notaCmp(`${Number(ind.a_pagar_30?.qtd) || 0} ${Number(ind.a_pagar_30?.qtd) === 1 ? 'conta' : 'contas'}`) : '');
    const cInad = () => celula('Inadimplência', tem ? moeda(inadimplencia) : traco, tem && Number(inadimplencia) > 0, ant ? comparar(inadimplencia, ant.inadimplencia_valor, { bom: 'desce' }) : '');
    const cRent = () => celula('Rentabilidade', tem ? pctBR(rentabilidade) : traco, false, ant ? comparar(rentabilidade, ant.yield_ano_pct, { pp: true }) : '');
    if (r === 'tudo' || r === 'imoveis') {
        return [cMargem(), cRent(), celula('Ocupação', tem ? pctBR(ocupacao) : traco, false, ant ? comparar(ocupacao, ant.ocupacao_pct, { pp: true }) : ''), cInad()];
    }
    if (r === 'outros') {
        return [
            celula('Custo de manter', tem ? moeda(despesa) : traco, false, ant ? comparar(despesa, ant.saidas_ano, { bom: 'desce' }) : ''),
            celula('Custo ÷ valor', ind && ind.custo_pct_valor != null ? `${fmtNum(ind.custo_pct_valor)}%` : traco, false, notaCmp(ind ? 'do valor dos bens, no ano' : '')),
            cAPagar(),
            celula('Receita', tem ? moeda(receita) : traco, false, ant ? comparar(receita, ant.recebido_ano) : ''),
        ];
    }
    if (r === 'agro') {
        const ult = ind && Array.isArray(ind.ciclos_fechados) ? ind.ciclos_fechados[0] : null;
        const res = ult?.resultado || {};
        const sacas = nOuNull(res.sacas), custo = nOuNull(res.custo);
        if (ult && sacas) {
            const area = nOuNull(ult.area_ha);
            return [
                cMargem(),
                celula('Sacas (última safra)', fmtNum(sacas, 0), false, notaCmp(ult.nome || '')),
                celula('Custo por saca', custo != null ? moeda(custo / sacas) : traco, false, notaCmp('custo da safra ÷ sacas')),
                celula('Custo por hectare', custo != null && area ? moeda(custo / area) : traco, false, notaCmp(area ? `${fmtNum(area)} ha` : 'sem área no talhão')),
            ];
        }
        const abertas = ind && Array.isArray(ind.ciclos_abertos) ? ind.ciclos_abertos.length : null;
        return [
            cMargem(),
            celula('Custo no ano', tem ? moeda(despesa) : traco, false, ant ? comparar(despesa, ant.saidas_ano, { bom: 'desce' }) : ''),
            celula('Safras abertas', abertas == null ? traco : String(abertas), false, notaCmp(ind ? 'sacas e custo por saca no fechamento' : '')),
            cAPagar(),
        ];
    }
    if (r === 'obras') {
        const obras = ind && Array.isArray(ind.obras) ? ind.obras : [];
        const conc = obras.reduce((s, o) => s + (Number(o.concluidas) || 0), 0), tot = obras.reduce((s, o) => s + (Number(o.total) || 0), 0);
        const pago = obras.reduce((s, o) => s + (Number(o.pago) || 0), 0), prev = obras.reduce((s, o) => s + (Number(o.previsto) || 0), 0);
        // v2.15.0 (dem 87ff1a11, de acordo do Nicola 20/10 13:13) — imóvel em construção com plano de pagamento (Construção
        // coletiva, Compra na planta) entra nos números: o investido soma as parcelas de aquisição (fora do resultado), o avanço
        // financeiro sem etapas é pago ÷ total do plano e o físico sem etapas mostra a entrega prevista.
        const planos = ind && Array.isArray(ind.planos) ? ind.planos : [];
        const plPago = planos.reduce((s, o) => s + (Number(o.pago) || 0), 0), plTot = planos.reduce((s, o) => s + (Number(o.total) || 0), 0);
        const plPagas = planos.reduce((s, o) => s + (Number(o.pagas) || 0), 0), plParc = planos.reduce((s, o) => s + (Number(o.parcelas) || 0), 0);
        const fis = tot > 0 ? conc / tot * 100 : null;
        const fin = prev > 0 ? pago / prev * 100 : (plTot > 0 ? plPago / plTot * 100 : null);
        const dif = tot > 0 && prev > 0 && fis != null && fin != null ? fin - fis : null;
        const investido = ind && ind.investido_ano != null ? Number(ind.investido_ano) : despesa;
        // v2.16.0 (Nicola 20/10 13:38/14:01: "o box de entrega parece estranho… como ficaria com várias obras… a data já aparece
        // em Obras em andamento") — sem etapas, o box vira "Falta pagar": soma do saldo e das parcelas que faltam de todos os planos
        const plSaldo = planos.reduce((s, o) => s + (Number(o.saldo) || 0), 0), plFaltam = Math.max(0, plParc - plPagas);
        const notaInvest = prev > 0 ? notaCmp(`de ${moedaCurta(prev)} previstos`)
            : plTot > 0 ? notaCmp(`de ${moedaCurta(plTot)} no total`)
            : (ant ? comparar(despesa, ant.saidas_ano, { bom: null }) : '');
        return [
            celula('Investido no ano', (tem || investido) ? moeda(investido) : traco, false, notaInvest),
            fis != null || !planos.length
                ? celula('Avanço físico', fis != null ? pctBR(fis) : traco, false, notaCmp(tot ? `${conc} de ${tot} etapas` : 'sem obra em andamento'))
                : celula('Falta pagar', moeda(plSaldo), false, notaCmp(plFaltam ? `${plFaltam} ${plFaltam === 1 ? 'parcela' : 'parcelas'}${planos.length > 1 ? ` · ${planos.length} obras` : ''}` : 'plano quitado')),
            celula('Avanço financeiro', fin != null ? pctBR(fin) : traco, false,
                dif != null ? notaCmp(Math.abs(dif) < 1 ? 'igual ao físico' : `${fmtNum(Math.abs(dif), 0)} p.p. ${dif > 0 ? 'à frente' : 'atrás'} do físico`, dif > 5 ? 'rz-vs-ruim' : '')
                : notaCmp(prev > 0 ? 'pago ÷ previsto' : plParc > 0 ? `${plPagas} de ${plParc} pagas` : (fin != null ? 'pago ÷ total' : ''))),
            cAPagar(),
        ];
    }
    if (r === 'pecuaria') {
        return [
            cMargem(),
            celula('Taxa de prenhez', ind && ind.taxa_prenhez != null ? `${fmtNum(ind.taxa_prenhez, 0)}%` : traco, false,
                notaCmp(ind && ind.em_ciclo ? `${ind.prenhes} de ${ind.em_ciclo} em ciclo` : (ind ? 'nenhuma fêmea em ciclo' : ''))),
            celula('Partos em 90 dias', ind ? String(Number(ind.partos_90) || 0) : traco, false, notaCmp(ind ? `${Number(ind.partos_30) || 0} nos próximos 30` : '')),
            celula('Custo por cabeça/mês', ind && ind.custo_cabeca_mes != null ? moeda(ind.custo_cabeca_mes) : traco, false, notaCmp(ind && ind.animais ? `${ind.animais} animais` : '')),
        ];
    }
    return [cMargem(), cRent(), cInad(), cAPagar()]; // varejo, investimentos e os que vierem
}

// v2.7.0 (F21) — o ramo mora na lente do cabeçalho; aqui fica só o uso, e só em ramo que tem uso
function segRamoUsoHtml() {
    if (filtro.ramo === 'tudo' || !ramoInfo?.tem_uso) return '';
    const usos = ['tudo', 'comercial', 'familia'].map(v =>
        `<button type="button" onclick="escolherGeralUniverso('${v}')" class="${v === filtro.contexto ? 'rz-on' : ''}">${CONTEXTO_ROTULO[v]}</button>`
    ).join('');
    return `<div class="rz-seg rz-seg-uso" role="group" aria-label="Uso">${usos}</div>`;
}

// v2.7.0 (F21) — herói de um ramo: valor e quantidade, ou só a quantidade quando o ramo não soma valor (vidas)
function montarHeroiRamo(d, carregando) {
    const esc = t => String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const nome = ramoInfo?.nome || 'Ramo';
    const un = n => n === 1 ? (ramoInfo?.unidade_singular || 'ativo') : (ramoInfo?.unidade_plural || 'ativos');
    const somaValor = !ramoInfo || ramoInfo.soma_valor !== false;
    const qtdTxt = d == null ? '—' : `${d.qtd} ${un(d.qtd)}`;
    const grande = somaValor ? (d == null ? '—' : formatarPatrimonioCompacto(d.valor)) : qtdTxt;
    const usoTxt = filtro.contexto === 'comercial' ? ' · comercial' : filtro.contexto === 'familia' ? ' · uso próprio' : '';
    const sub = somaValor ? qtdTxt : 'Sem valor de patrimônio: entram na contagem';
    // v2.11.0 (fatia 8) — Família: custo do ano (contra o anterior, com a linha do ano), por vida ao mês, a pagar e vencidos
    const ind = d && d.ind && d.ind.pode_ver !== false ? d.ind : null;
    let kpis = '';
    if (ind) {
        const moeda = v => formatarMoedaBR(Number(v) || 0, { semCentavos: true });
        const cel = (r, v, cmp) => `<div><small>${r}</small><b>${v}</b>${cmp || ''}</div>`;
        const venc = Number(ind.vencidos) || 0;
        kpis = `<div class="rz-heroi-res">
            <div class="rz-heroi-resl"><div><small>Custo · ${filtro.ano}</small><b>${moeda(ind.despesa)}</b>${comparar(ind.despesa, ind.anterior?.despesa, { bom: 'desce' })}</div>${sparkSvg(d.mensal, 'saidas')}</div>
            <div class="rz-heroi-3 rz-q4">
                ${cel('Por vida, ao mês', ind.custo_por_vida_mes != null ? moeda(ind.custo_por_vida_mes) : '—', notaCmp(`${ind.meses} ${Number(ind.meses) === 1 ? 'mês' : 'meses'} no ano`))}
                ${cel('A pagar 30 dias', moeda(ind.a_pagar_30?.valor), notaCmp(`${Number(ind.a_pagar_30?.qtd) || 0} ${Number(ind.a_pagar_30?.qtd) === 1 ? 'conta' : 'contas'}`))}
                ${cel('Vencidos', String(venc), notaCmp(venc ? 'itens de controle' : 'tudo em dia', venc ? 'rz-vs-ruim' : 'rz-vs-bom'))}
                ${cel('Receita', moeda(ind.receita), comparar(ind.receita, ind.anterior?.receita))}
            </div></div>`;
    }
    return `<div class="rz-heroi"${carregando ? ' aria-busy="true"' : ''}>
        <small>${esc(nome)}${usoTxt}</small>
        <b class="rz-heroi-pat">${grande}</b>
        <small>${esc(sub)}</small>
        ${kpis}
        ${segRamoUsoHtml()}
    </div>`;
}

// ---------------------------------------------------------------------
// Exportar (REGRAS §13 — "share, abre sheet: pacote pro contador · PDF
// · link"). Pacote do contador ainda não existe (fica pra fase própria
// do PLANO); por ora reaproveita 100% o que já existia em
// renderCatalogoRelatorios() (PDF analítico + distribuição por sócio),
// e mantém o catálogo completo (tab-relatorios-catalogo) e Distribuição
// (tab-socios) alcançáveis pelo terciário, já que o segmento antigo que
// levava até eles saiu da tela (REGRAS §13 — "sem segmento").
// ---------------------------------------------------------------------
export function abrirResultadosExportar() {
    const socios = [...new Set((typeof repasses !== 'undefined' && Array.isArray(repasses) ? repasses : []).map(r => r.socio).filter(Boolean))];
    abrirSheetAcoes({
        titulo: 'Exportar',
        acoes: [
            { icone: 'file-text', titulo: 'Resultados analítico', sub: 'PDF com os filtros aplicados', aoTocar: () => { if (typeof baixarRelatorioPdfLocal === 'function') baixarRelatorioPdfLocal(); } },
            { icone: 'users', titulo: 'Distribuição aos sócios', sub: socios.length ? `PDF por sócio · ${socios.length} sócio${socios.length > 1 ? 's' : ''}` : 'PDF por sócio', aoTocar: () => abrirSheetAcoes({ titulo: 'Distribuição aos sócios', sub: 'Escolha o sócio', acoes: socios.length ? socios.map(sc => ({ icone: 'user', titulo: sc, aoTocar: () => { if (typeof exportarRelatorioSocioPDF === 'function') exportarRelatorioSocioPDF(sc); } })) : [{ icone: 'info', titulo: 'Sem distribuição ainda', aoTocar: () => {} }] }) },
            { icone: 'folder-open', titulo: 'Ver todos os relatórios', sub: 'Catálogo completo', aoTocar: () => switchTab('tab-relatorios-catalogo') },
            // v2.14.0 (cockpit C3) — relatório executivo do ramo da lente e do consolidado
            ...(filtro.ramo !== 'tudo' ? [{ icone: 'file-bar-chart', titulo: `Executivo · ${ramoInfo?.nome || 'ramo'}`.slice(0, 24), sub: 'PDF de 2 páginas', codigo: 'relatorios.executivo',
                aoTocar: () => { if (typeof abrirRelatorioExecutivo === 'function') abrirRelatorioExecutivo('executivo', { ano: filtro.ano, ramo: filtro.ramo, ramoNome: ramoInfo?.nome || '' }); } }] : []),
            { icone: 'layers', titulo: 'Executivo · consolidado', sub: 'Uma página por ramo', codigo: 'relatorios.executivo',
                aoTocar: () => { if (typeof abrirRelatorioExecutivo === 'function') abrirRelatorioExecutivo('executivo', { ano: filtro.ano }); } },
            // v2.12.0 (cockpit C1) — metas do ramo da lente; em Todo o patrimônio, escolhe o ramo
            { icone: 'target', titulo: `Metas de ${filtro.ano}`, sub: filtro.ramo === 'tudo' ? 'Por ramo e grupo de resultado' : `Do ramo ${ramoInfo?.nome || ''}`, codigo: 'resultados.metas', aoTocar: () => abrirMetasHoje() },
        ]
    });
}

// v2.12.0 (cockpit C1) — o sheet mora em js/cockpit-metas.js; ao salvar, o Hoje redesenha com a meta.
export function abrirMetasHoje() {
    const ramo = filtro.ramo === 'tudo' ? null : filtro.ramo;
    import('./cockpit-metas.js').then(m => m.abrirMetasDoAno({
        ano: filtro.ano, ramo, ramoNome: ramoInfo?.nome || '',
        ramos: (ultimoPorRamo && Array.isArray(ultimoPorRamo.ramos)) ? ultimoPorRamo.ramos : [],
        aoSalvar: () => renderResultados(),
    })).catch(e => { console.warn('[resultados] metas:', e?.message); if (typeof mostrarToast === 'function') mostrarToast('Não deu para abrir as metas', 'danger'); });
}

// ---------------------------------------------------------------------
// Conteúdo — Carteira / Empreendimento
// ---------------------------------------------------------------------
async function renderizarConteudo() {
    const alvo = document.getElementById('resultados-conteudo');
    if (!alvo) return;
    const minha = ++geracao; // v2.0.0
    const p_ramo = filtro.ramo === 'tudo' ? null : filtro.ramo; // v2.9.0 (F23)
    if (p_ramo && ramoInfo && ramoInfo.soma_valor === false) { // v2.9.0 — ramo de contagem (Família): vidas + despesas do ramo
        const [ativosR, mensalF, grupoF, indF] = await Promise.all([
            dbAuth.from('cofre_ativos').select('tipo_ativo, tipo_detalhe:ativo_tipos(ramo)').eq('cliente_id', CLIENTE_ID_SUPABASE).eq('status', 'ativo'),
            dbAuth.rpc('fn_resultado_mensal', { p_cliente_id: CLIENTE_ID_SUPABASE, p_ano: filtro.ano, p_nivel: 'carteira', p_id: null, p_uso: null, p_ramo }),
            dbAuth.rpc('fn_resultado_por_grupo', { p_cliente_id: CLIENTE_ID_SUPABASE, p_ano: filtro.ano, p_nivel: 'carteira', p_id: null, p_uso: null, p_ramo }),
            podeVerPorRamo() ? dbAuth.rpc('fn_hoje_ramo_indicadores', { p_cliente_id: CLIENTE_ID_SUPABASE, p_ramo, p_ano: filtro.ano }) : Promise.resolve({ data: null }), // v2.11.0
        ]);
        if (minha !== geracao) return;
        if (indF.error) console.warn('[resultados] indicadores do ramo:', indF.error.message);
        const indFam = indF.error ? null : indF.data;
        const ramoDe = typeof rzRamoDoAtivo === 'function' ? rzRamoDoAtivo : (x => x?.tipo_detalhe?.ramo || 'outros');
        const qtd = ativosR.error ? null : (ativosR.data || []).filter(x => ramoDe(x) === p_ramo).length;
        const heroiR = document.getElementById('hoje-heroi-mount');
        if (heroiR) heroiR.innerHTML = montarHeroiRamo(qtd == null ? null : { qtd, valor: 0, ind: indFam, mensal: mensalF.error ? [] : (mensalF.data || []) });
        alvo.innerHTML = [
            montarCardsDoRamo(p_ramo, indFam), // v2.11.0
            mensalF.error ? '' : montarGraficoMensal(mensalF.data || []),
            grupoF.error ? '' : montarPorGrupo(grupoF.data || []),
        ].filter(Boolean).join('') || '<p class="rz-desc">Nenhuma despesa deste ramo no ano.</p>';
        if (typeof rzIcones === 'function') rzIcones();
        return;
    }
    const p_uso = CONTEXTO_USO[filtro.contexto];
    const nivel = filtro.abrangencia; // 'carteira' | 'empreendimento'
    const alvoId = filtro.abrangencia === 'empreendimento' ? filtro.alvoId : null;
    // v1.8.0 — cards de carteira alugada só fora de Família (Tudo e Comercial); v2.9.0 — e só em Todo o patrimônio ou Imóveis
    const cardsLocacao = filtro.abrangencia === 'carteira' && filtro.contexto !== 'familia' && (!p_ramo || p_ramo === 'imoveis');

    try {
        // v1.3.0 (B1.2) — 2 chamadas novas, só no contexto que mostra os 2
        // cards (mesma guarda que montarCardIndicadores()/montarGraficoIndicador()
        // já usam: nada disso renderiza em Família — ESP §4.3). Sempre no
        // nível carteira (fn_carteira_indicador_series é por cliente_id, não
        // por empreendimento/imóvel — decisão documentada no changelog
        // acima): olhar o índice de mercado contra UM imóvel só não faz
        // sentido, a leitura é sempre da carteira.
        const [resumoR, perfR, mensalR, concR, reajR, revR, graficoIndR, grupoR, indicesR] = await Promise.all([
            filtro.abrangencia === 'carteira'
                ? dbAuth.rpc('fn_resumo_resultados', { p_cliente_id: CLIENTE_ID_SUPABASE, p_uso, p_ano: filtro.ano, p_ramo })
                : Promise.resolve({ data: null }),
            filtro.abrangencia === 'carteira'
                ? dbAuth.rpc('fn_performance_carteira', { p_cliente_id: CLIENTE_ID_SUPABASE, p_uso, p_ano: filtro.ano, p_ramo })
                : dbAuth.rpc('fn_performance_empreendimento', { p_empreendimento_id: alvoId, p_ano: filtro.ano, p_uso }),
            dbAuth.rpc('fn_resultado_mensal', { p_cliente_id: CLIENTE_ID_SUPABASE, p_ano: filtro.ano, p_nivel: nivel, p_id: alvoId, p_uso, p_ramo }),
            cardsLocacao
                ? dbAuth.rpc('fn_carteira_concentracao', { p_cliente_id: CLIENTE_ID_SUPABASE, p_ano: filtro.ano })
                : Promise.resolve({ data: [] }),
            cardsLocacao
                ? dbAuth.rpc('fn_carteira_reajustes_calendario', { p_cliente_id: CLIENTE_ID_SUPABASE, p_ano: filtro.ano, p_uso, p_ramo })
                : Promise.resolve({ data: [] }),
            // v1.1.0 — card novo, mesmo desenho do de reajustes, mas pelo
            // mês de TÉRMINO do contrato (fn_carteira_revisionais_*, nova).
            cardsLocacao
                ? dbAuth.rpc('fn_carteira_revisionais_calendario', { p_cliente_id: CLIENTE_ID_SUPABASE, p_ano: filtro.ano, p_uso, p_ramo })
                : Promise.resolve({ data: [] }),
            (filtro.contexto === 'familia' || (p_ramo && p_ramo !== 'imoveis')) ? Promise.resolve({ data: [] }) : lerSeriesComparacao(), // v2.5.0 — até 2 indicadores
            // v2.3.0 — abertura por grupo (nível 1 da árvore); erro aqui só esconde o card
            dbAuth.rpc('fn_resultado_por_grupo', { p_cliente_id: CLIENTE_ID_SUPABASE, p_ano: filtro.ano, p_nivel: nivel, p_id: alvoId, p_uso, p_ramo }),
            // v2.5.0 — contratos por índice; sem o código resultados.indicadores a função recusa e o card fica bloqueado
            cardsLocacao ? dbAuth.rpc('fn_carteira_indices_resumo', { p_cliente_id: CLIENTE_ID_SUPABASE }) : Promise.resolve({ data: null }),
        ]);
        if (minha !== geracao) return; // v2.0.0 — chegou um desenho mais novo
        // v2.11.0 (fatia 8) — o ano anterior (todo número compara), o resultado por ramo (Todo o patrimônio) e os indicadores
        // do ramo (lente). Erro aqui só tira a comparação ou o card; o resto do Hoje segue.
        const pr = podeVerPorRamo() && filtro.abrangencia === 'carteira';
        const [antR, porRamoR, indR] = await Promise.all([
            filtro.abrangencia === 'carteira'
                ? dbAuth.rpc('fn_resumo_resultados', { p_cliente_id: CLIENTE_ID_SUPABASE, p_uso, p_ano: filtro.ano - 1, p_ramo })
                : Promise.resolve({ data: null }),
            pr && !p_ramo && !p_uso ? dbAuth.rpc('fn_hoje_por_ramo', { p_cliente_id: CLIENTE_ID_SUPABASE, p_ano: filtro.ano }) : Promise.resolve({ data: null }),
            pr && p_ramo ? dbAuth.rpc('fn_hoje_ramo_indicadores', { p_cliente_id: CLIENTE_ID_SUPABASE, p_ramo, p_ano: filtro.ano }) : Promise.resolve({ data: null }),
        ]);
        if (minha !== geracao) return;
        [antR, porRamoR, indR].forEach(x => { if (x.error) console.warn('[resultados] fatia 8:', x.error.message); });
        const resumoAnt = antR.error ? null : (Array.isArray(antR.data) ? antR.data[0] : antR.data);
        const porRamo = porRamoR.error ? null : porRamoR.data;
        if (porRamo) ultimoPorRamo = porRamo; // v2.12.0
        const indRamo = indR.error ? null : indR.data;
        if (resumoR.error) throw resumoR.error;
        if (perfR.error) throw perfR.error;
        if (mensalR.error) throw mensalR.error;
        if (concR.error) throw concR.error;
        if (reajR.error) throw reajR.error;
        if (revR.error) throw revR.error;
        if (graficoIndR.error) throw graficoIndR.error;

        const resumo = Array.isArray(resumoR.data) ? resumoR.data[0] : resumoR.data;
        const perf = Array.isArray(perfR.data) ? perfR.data[0] : perfR.data;
        const mensal = mensalR.data || [];
        const concentracao = concR.data || [];
        const reajustes = reajR.data || [];
        const revisionais = revR.data || [];
        const graficoIndicador = graficoIndR.data || {}; // v2.5.0 — { codigo: [{mes, carteira_indice, indicador_indice}] }
        if (grupoR.error) console.warn('[resultados] por grupo:', grupoR.error.message); // v2.3.0
        const porGrupo = grupoR.error ? [] : (grupoR.data || []);

        // v2.0.0 (UXR-17) — os números de cima vão para o herói de Hoje; os cards ficam abaixo
        const heroiEl = document.getElementById('hoje-heroi-mount');
        if (heroiEl) heroiEl.innerHTML = montarHeroi(resumo, perf, false, { ant: resumoAnt, mensal, ind: indRamo, meta: p_ramo ? indRamo?.meta : (p_uso ? null : porRamo?.consolidado?.meta) }); // v2.12.0 — meta
        // v2.11.0 (fatia 8, D8-1) — em Todo o patrimônio o Geral vira uma linha do Resultado por ramo
        const cardPorRamo = !p_ramo ? montarResultadoPorRamo(porRamo) : '';
        // v2.9.0 (F23, opção b) — Geral: o que foi lançado sem ativo; só em Todo o patrimônio, nível carteira (agora só sem o card por ramo)
        let cardGeral = '';
        if (!p_ramo && filtro.abrangencia === 'carteira' && !cardPorRamo) {
            const g = await dbAuth.rpc('fn_resumo_resultados', { p_cliente_id: CLIENTE_ID_SUPABASE, p_uso, p_ano: filtro.ano, p_ramo: 'geral' });
            if (minha !== geracao) return;
            const gr = !g.error ? (Array.isArray(g.data) ? g.data[0] : g.data) : null;
            if (gr && (Number(gr.saidas_ano) || Number(gr.resultado_liquido_ano))) {
                const desp = Number(gr.saidas_ano) || 0, rec = (Number(gr.resultado_liquido_ano) || 0) + desp;
                const fmt = v => formatarMoedaBR(v || 0, { semCentavos: true });
                cardGeral = `<div class="rz-card"><h3 class="rz-plain-title">Geral · sem ativo · ${filtro.ano}</h3><p class="rz-desc">Lançamentos que não estão ligados a um ativo: contam em Todo o patrimônio e em ramo nenhum. Receitas ${fmt(rec)} · despesas ${fmt(desp)}.</p></div>`;
            }
        }
        alvo.innerHTML = [
            cardPorRamo, // v2.11.0 — logo abaixo do herói: "qual ramo dá resultado"
            p_ramo ? montarCardsDoRamo(p_ramo, indRamo) : '', // v2.11.0 — os números da operação do ramo
            p_ramo === 'obras' ? montarGraficoInvestido(indRamo) : montarGraficoMensal(mensal), // v2.15.0 (dem 87ff1a11) — Obras: investido por mês
            montarPorGrupo(porGrupo), // v2.3.0
            cardGeral, // v2.9.0 (F23)
            cardsLocacao ? montarContratosPorIndice(indicesR) : '', // v2.5.0
            p_ramo === 'obras' ? '' : montarGraficoIndicador(graficoIndicador), // v2.15.0 — não serve para obra
            cardsLocacao ? montarConcentracao(concentracao) : '',
            cardsLocacao ? montarReajustesCalendario(reajustes) : '',
            cardsLocacao ? montarRevisionaisCalendario(revisionais) : '',
            filtro.contexto !== 'familia' && p_ramo !== 'obras' ? montarPerformanceGrid(perf) : '', // v1.8.0 · v2.15.0: fora de Obras
        ].filter(Boolean).join('');

        if (typeof rzIcones === 'function') rzIcones();
        ligarBarrasCalendario('.rz-res-barra-mes', reajustes, abrirResultadosMesReajuste);
        ligarBarrasCalendario('.rz-res-barra-revisional', revisionais, abrirResultadosMesRevisional);
    } catch (err) {
        if (minha !== geracao) return;
        console.warn('[resultados] Falha ao carregar conteúdo:', err.message);
        const heroiErr = document.getElementById('hoje-heroi-mount');
        if (heroiErr) heroiErr.innerHTML = montarHeroi(null, null);
        alvo.innerHTML = `<div class="rz-card"><p class="rz-desc">Não deu para carregar os resultados agora.</p><button type="button" class="rz-btn rz-btn-2" id="rz-res-tentar" style="margin-top:10px">Tentar de novo</button></div>`;
        alvo.querySelector('#rz-res-tentar')?.addEventListener('click', () => renderizarConteudo());
    }
}

// ---------------------------------------------------------------------
// v2.13.0 (cockpit C2, FICHA_COCKPIT §2) — COMPOSIÇÃO: o detalhe de um número do Hoje.
// Níveis: tudo (Todo o patrimônio) › ramo › ativo. A trilha guarda o caminho; "‹" volta um nível.
// ---------------------------------------------------------------------
let compo = null; // { ano, trilha: [{ nivel, ramo, id, nome }], vista, grupo, cache }
const COMPO_VISTAS = [['grupo', 'Por grupo'], ['mes', 'Por mês'], ['lanc', 'Lançamentos']];

export function abrirComposicaoHoje() {
    const trilha = [{ nivel: 'tudo', nome: 'Todo o patrimônio' }];
    if (filtro.ramo !== 'tudo') trilha.push({ nivel: 'ramo', ramo: filtro.ramo, nome: ramoInfo?.nome || filtro.ramo });
    compo = { ano: filtro.ano, trilha, vista: 'grupo', grupo: null, cache: {} };
    desenharComposicao(true);
}

function compoAtual() { return compo.trilha[compo.trilha.length - 1]; }
function compoChave(n) { return `${n.nivel}:${n.ramo || ''}:${n.id || ''}`; }

async function compoDados(n) {
    const k = compoChave(n);
    if (compo.cache[k]) return compo.cache[k];
    const base = { p_cliente_id: CLIENTE_ID_SUPABASE, p_nivel: n.nivel === 'ativo' ? 'ativo' : 'carteira', p_id: n.nivel === 'ativo' ? n.id : null, p_uso: null, p_ramo: n.nivel === 'ramo' ? n.ramo : null };
    const [g, ga, m, filhos] = await Promise.all([
        dbAuth.rpc('fn_resultado_por_grupo', { ...base, p_ano: compo.ano }),
        dbAuth.rpc('fn_resultado_por_grupo', { ...base, p_ano: compo.ano - 1 }),
        dbAuth.rpc('fn_resultado_mensal', { ...base, p_ano: compo.ano }),
        n.nivel === 'ramo' ? dbAuth.rpc('fn_hoje_ramo_indicadores', { p_cliente_id: CLIENTE_ID_SUPABASE, p_ramo: n.ramo, p_ano: compo.ano }) : Promise.resolve({ data: null }),
    ]);
    if (g.error) throw g.error;
    const d = { grupos: g.data || [], ant: ga.error ? [] : (ga.data || []), mensal: m.error ? [] : (m.data || []),
        ativos: (filhos.data && Array.isArray(filhos.data.por_ativo)) ? filhos.data.por_ativo : [] };
    compo.cache[k] = d;
    return d;
}

function compoTotais(grupos) {
    let rec = 0, desp = 0;
    grupos.forEach(x => { if (x.grupo_resultado === 'fora_resultado') return; if (x.direcao === 'entrada') rec += Number(x.valor) || 0; else desp += Number(x.valor) || 0; });
    return { rec, desp, res: rec - desp };
}

async function desenharComposicao(abrirNovo) {
    const n = compoAtual();
    const trilhaHtml = compo.trilha.map((t, i) => i === compo.trilha.length - 1 ? `<b>${escR(t.nome)}</b>`
        : `<button type="button" data-cp-nivel="${i}">${escR(t.nome)}</button>`).join('<span aria-hidden="true">›</span>');
    const casca = (corpo, sub = '') => `${typeof rzSheetCabecalho === 'function' ? rzSheetCabecalho(`${n.nome} · ${compo.ano}`, sub) : `<h3>${escR(n.nome)}</h3>`}
        <div class="rz-sh-b"><div class="rz-cp-trilha">${compo.trilha.length > 1 ? `<button type="button" class="rz-cp-volta" data-cp-volta aria-label="Voltar um nível"><svg data-lucide="chevron-left"></svg></button>` : ''}${trilhaHtml}</div>
        <div class="rz-seg" role="group" aria-label="Vista">${COMPO_VISTAS.map(([v, r]) => `<button type="button" data-cp-vista="${v}" class="${compo.vista === v ? 'rz-on' : ''}">${r}</button>`).join('')}</div>
        <div id="rz-cp-corpo">${corpo}</div></div>`;
    let sheet = document.getElementById('rz-sheet');
    if (abrirNovo || !sheet || !sheet.querySelector('#rz-cp-corpo')) sheet = abrirSheet(casca(rzSk('lista', 4)), { classe: 'rz-cp' });
    else { sheet.innerHTML = '<div class="rz-grab"></div>' + casca(rzSk('lista', 4)); }
    let html = '', sub = '';
    try {
        const d = await compoDados(n);
        const t = compoTotais(d.grupos);
        sub = `Resultado ${moedaCurta(t.res)} · receita ${moedaCurta(t.rec)} · despesa ${moedaCurta(t.desp)}`;
        if (compo.vista === 'grupo') html = compoPorGrupo(d, n);
        else if (compo.vista === 'mes') html = compoPorMes(d);
        else html = await compoLancamentos(n, d);
    } catch (e) {
        console.warn('[resultados] composição:', e?.message);
        html = '<p class="rz-desc">Não deu para carregar agora.</p>';
    }
    if (!compo || compoAtual() !== n) return; // trocou de nível enquanto carregava
    sheet.innerHTML = '<div class="rz-grab"></div>' + casca(html, sub);
    if (typeof rzIcones === 'function') rzIcones();
    sheet.querySelectorAll('[data-cp-vista]').forEach(b => b.addEventListener('click', () => { compo.vista = b.dataset.cpVista; if (compo.vista !== 'lanc') compo.grupo = null; desenharComposicao(); }));
    sheet.querySelectorAll('[data-cp-nivel]').forEach(b => b.addEventListener('click', () => { compo.trilha = compo.trilha.slice(0, Number(b.dataset.cpNivel) + 1); compo.grupo = null; desenharComposicao(); }));
    sheet.querySelector('[data-cp-volta]')?.addEventListener('click', () => { compo.trilha.pop(); compo.grupo = null; desenharComposicao(); });
    sheet.querySelectorAll('[data-cp-grupo]').forEach(b => b.addEventListener('click', () => { compo.grupo = { codigo: b.dataset.cpGrupo, nome: b.dataset.cpNome }; compo.vista = 'lanc'; desenharComposicao(); }));
    sheet.querySelectorAll('[data-cp-ramo]').forEach(b => b.addEventListener('click', () => { compo.trilha.push({ nivel: 'ramo', ramo: b.dataset.cpRamo, nome: b.dataset.cpNome }); compo.grupo = null; desenharComposicao(); }));
    sheet.querySelectorAll('[data-cp-ativo]').forEach(b => b.addEventListener('click', () => {
        const pr = b.dataset.cpPrincipal;
        if (pr && !compo.trilha.some(x => x.id === pr)) compo.trilha.push({ nivel: 'ativo', id: pr, nome: b.dataset.cpPrincipalNome || 'Ativo principal' });
        compo.trilha.push({ nivel: 'ativo', id: b.dataset.cpAtivo, nome: b.dataset.cpNome }); compo.grupo = null; desenharComposicao();
    }));
    sheet.querySelector('[data-cp-semgrupo]')?.addEventListener('click', () => { compo.grupo = null; desenharComposicao(); });
    sheet.querySelectorAll('[data-cp-lanc]').forEach(b => b.addEventListener('click', () => compoAbrirLancamento(b.dataset.cpLanc)));
}

function compoPorGrupo(d, n) {
    const antDe = c => Number((d.ant.find(a => a.grupo_codigo === c) || {}).valor) || 0;
    const linha = x => {
        const v = Number(x.valor) || 0, a = antDe(x.grupo_codigo);
        const bom = x.direcao === 'entrada' ? 'sobe' : 'desce';
        return `<button type="button" class="rz-row rz-ck-li" data-cp-grupo="${escR(x.grupo_codigo)}" data-cp-nome="${escR(x.grupo_nome)}">
            <span class="rz-ic"><svg data-lucide="${escR(x.icone || (x.direcao === 'entrada' ? 'trending-up' : 'trending-down'))}"></svg></span>
            <div class="rz-tx"><b>${escR(x.grupo_nome)}</b><span>${x.qtd} ${Number(x.qtd) === 1 ? 'lançamento' : 'lançamentos'}${a ? ` · ${compo.ano - 1}: ${moedaCurta(a)}` : ''}</span></div>
            <div class="rz-rt"><b class="${x.direcao === 'entrada' ? 'rz-in' : ''}">${moedaCurta(v)}</b>${a ? comparar(v, a, { bom }) : ''}</div></button>`;
    };
    const dentro = d.grupos.filter(x => x.grupo_resultado !== 'fora_resultado');
    const fora = d.grupos.filter(x => x.grupo_resultado === 'fora_resultado');
    let html = dentro.length ? `<div class="rz-card rz-list">${dentro.map(linha).join('')}</div>` : '<p class="rz-desc">Sem receita nem despesa no ano.</p>';
    if (fora.length) html += `<div class="rz-group">Fora do resultado</div><div class="rz-card rz-list">${fora.map(linha).join('')}</div>`;
    if (n.nivel === 'tudo' && ultimoPorRamo && Array.isArray(ultimoPorRamo.ramos) && ultimoPorRamo.ramos.length && compo.ano === filtro.ano) {
        html += `<div class="rz-group">Por ramo</div><div class="rz-card rz-list">${ultimoPorRamo.ramos.map(r => `<button type="button" class="rz-row rz-ck-li" data-cp-ramo="${escR(codR(r.codigo))}" data-cp-nome="${escR(r.nome)}">
            <span class="rz-ck-dot" style="background:var(--ramo-cor-${codR(r.codigo)}, var(--sage))"></span>
            <div class="rz-tx"><b>${escR(r.nome)}</b><span>receita ${moedaCurta(r.receita)} · despesa ${moedaCurta(r.despesa)}</span></div>
            <div class="rz-rt"><b class="${Number(r.resultado) < 0 ? 'rz-neg' : ''}">${moedaCurta(r.resultado)}</b></div></button>`).join('')}</div>`;
    }
    if (n.nivel === 'ramo' && d.ativos.length) {
        const nomes = Object.fromEntries(d.ativos.map(a => [a.id, a.nome]));
        html += `<div class="rz-group">Por ativo</div><div class="rz-card rz-list">${d.ativos.slice(0, 30).map(a => `<button type="button" class="rz-row rz-ck-li" data-cp-ativo="${escR(a.id)}" data-cp-nome="${escR(a.nome)}"${a.principal ? ` data-cp-principal="${escR(a.principal)}" data-cp-principal-nome="${escR(nomes[a.principal] || '')}"` : ''}>
            <div class="rz-tx"><b>${escR(a.nome)}</b><span>receita ${moedaCurta(a.receita)} · despesa ${moedaCurta(a.despesa)}</span></div>
            <div class="rz-rt"><b class="${Number(a.resultado) < 0 ? 'rz-neg' : ''}">${moedaCurta(a.resultado)}</b></div></button>`).join('')}</div>`;
    }
    return html + '<p class="rz-desc">Toque num grupo para ver os lançamentos.</p>';
}

function compoPorMes(d) {
    const ate = compo.ano === ANO_ATUAL ? new Date().getMonth() + 1 : 12;
    const meses = Array.from({ length: ate }, (_, i) => d.mensal.find(m => Number(m.mes) === i + 1) || { mes: i + 1, recebido: 0, saidas: 0, resultado: 0 });
    const esc = Math.max(1, ...meses.flatMap(m => [Number(m.recebido) || 0, Number(m.saidas) || 0]));
    const w = v => Math.max(0, Math.min(100, (Number(v) || 0) / esc * 100)).toFixed(1);
    return `<div class="rz-rr-leg"><span><i class="rz-rr-rec"></i>receita</span><span><i class="rz-rr-desp"></i>despesa</span></div>` + meses.map(m => {
        const r = Number(m.resultado) || 0;
        return `<div class="rz-rr"><span class="rz-rr-pt" style="background:transparent"></span>
            <span class="rz-rr-nm">${NOMES_MES[m.mes - 1]}<small>receita ${moedaCurta(m.recebido)} · despesa ${moedaCurta(m.saidas)}</small></span>
            <span class="rz-rr-vl${r < 0 ? ' rz-neg' : ''}">${moedaCurta(r)}</span>
            <span class="rz-rr-bars"><span><i class="rz-rr-rec" style="width:${w(m.recebido)}%"></i></span><span><i class="rz-rr-desp" style="width:${w(m.saidas)}%"></i></span></span></div>`;
    }).join('');
}

let compoLancCache = [];
async function compoLancamentos(n, d) {
    let q = dbAuth.from('lancamentos').select('id, descricao, valor, direcao, competencia, data_pagamento, categoria, ativo_id, status')
        .eq('cliente_id', CLIENTE_ID_SUPABASE).eq('status', 'realizado').in('direcao', ['entrada', 'saida'])
        .gte('competencia', `${compo.ano}-01-01`).lte('competencia', `${compo.ano}-12-31`);
    let aviso = '';
    if (n.nivel === 'ativo') q = q.eq('ativo_id', n.id);
    else if (n.nivel === 'ramo') {
        const ids = d.ativos.map(a => a.id);
        if (!ids.length) return '<p class="rz-desc">Nenhum ativo no ramo com lançamento no ano.</p>';
        q = q.in('ativo_id', ids);
        aviso = 'Lançamentos ligados aos ativos do ramo. Os de contrato e os de rateio entram no Por grupo.';
    }
    if (compo.grupo) {
        if (compo.grupo.codigo === 'grp_alugueis') aviso = 'Os aluguéis vêm das mensalidades pagas, em Contratos. Aqui aparecem só os lançados à mão.';
        const cats = await dbAuth.from('lancamento_categorias').select('codigo').or(`codigo.eq.${compo.grupo.codigo},categoria_pai.eq.${compo.grupo.codigo}`);
        const cods = (cats.data || []).map(c => c.codigo);
        q = q.in('categoria', cods.length ? cods : [compo.grupo.codigo]);
    }
    const { data, error } = await q.order('valor', { ascending: false }).limit(100);
    if (error) throw error;
    compoLancCache = data || [];
    const filtroTxt = compo.grupo ? `<div class="rz-cp-filtro">Grupo: <b>${escR(compo.grupo.nome)}</b> <button type="button" data-cp-semgrupo aria-label="Tirar o filtro"><svg data-lucide="x"></svg></button></div>` : '';
    if (!compoLancCache.length) return filtroTxt + `<p class="rz-desc">${aviso || 'Nenhum lançamento no ano.'}</p>`;
    return filtroTxt + `<div class="rz-card rz-list">${compoLancCache.map(l => `<button type="button" class="rz-row rz-ck-li" data-cp-lanc="${escR(l.id)}">
            <div class="rz-tx"><b>${escR(l.descricao || l.categoria || 'Lançamento')}</b><span>${escR(competenciaCurta(l.competencia))}${l.data_pagamento ? ' · pago ' + escR(typeof formatarDataBR === 'function' ? formatarDataBR(l.data_pagamento) : l.data_pagamento) : ''}</span></div>
            <div class="rz-rt"><b class="${l.direcao === 'entrada' ? 'rz-in' : ''}">${l.direcao === 'saida' ? '−' : ''}${moedaInteira(l.valor)}</b></div></button>`).join('')}</div>`
        + (compoLancCache.length === 100 ? '<p class="rz-desc">Mostrando os 100 maiores.</p>' : '') + (aviso ? `<p class="rz-desc">${escR(aviso)}</p>` : '');
}

function compoAbrirLancamento(id) {
    const l = compoLancCache.find(x => x.id === id);
    if (!l) return;
    const acoes = [{ icone: 'calendar', titulo: `Competência ${competenciaCurta(l.competencia)}`, sub: l.data_pagamento ? 'Pago em ' + (typeof formatarDataBR === 'function' ? formatarDataBR(l.data_pagamento) : l.data_pagamento) : 'Realizado', aoTocar: () => {}, manterAberto: true }];
    if (l.ativo_id && l.direcao === 'saida' && typeof window.abrirSaidasFiltradasPorAtivo === 'function') {
        acoes.push({ icone: 'wallet', titulo: 'Ver no Financeiro', sub: 'Saídas deste ativo', aoTocar: () => { fecharSheet(true); switchTab('tab-financeiro'); setTimeout(() => window.abrirSaidasFiltradasPorAtivo(l.ativo_id, ''), 300); } });
    }
    if (l.ativo_id) acoes.push({ icone: 'box', titulo: 'Abrir o ativo', aoTocar: () => { fecharSheet(true); abrirAtivoHoje(l.ativo_id); } });
    abrirSheetAcoes({ titulo: `${l.direcao === 'saida' ? '−' : ''}${moedaInteira(l.valor)}`, sub: l.descricao || l.categoria || '', acoes, empilhar: true });
}

// ---------------------------------------------------------------------
// v2.11.0 (fatia 8, F8-1, D8-1) — Resultado por ramo: uma linha por ramo (receita × despesa em barras, resultado, margem,
// patrimônio), a linha Geral · sem ativo e o Consolidado. Tocar no ramo abre a lente (escolherGeralRamo, index.html).
// ---------------------------------------------------------------------
function montarResultadoPorRamo(pr) {
    if (!pr || pr.pode_ver === false || !Array.isArray(pr.ramos) || !pr.ramos.length) return '';
    const ramos = pr.ramos, g = pr.geral || {}, c = pr.consolidado || {};
    const escala = Math.max(1, ...ramos.flatMap(r => [Number(r.receita) || 0, Number(r.despesa) || 0]));
    const larg = v => Math.max(0, Math.min(100, (Number(v) || 0) / escala * 100)).toFixed(1);
    const corte = filtro.ano === ANO_ATUAL ? `jan–${MES_CURTO_IND[new Date().getMonth()]} ${filtro.ano}` : String(filtro.ano);
    const un = (r, q) => Number(q) === 1 ? (r.unidade_singular || 'ativo') : (r.unidade_plural || 'ativos');
    const linhas = ramos.map(r => {
        const cod = codR(r.codigo);
        const rec = Number(r.receita) || 0, res = Number(r.resultado) || 0;
        const patr = r.soma_valor !== false && Number(r.patrimonio) > 0 ? moedaCurta(r.patrimonio) : '';
        const sub = r.soma_valor === false ? `${r.qtd} ${un(r, r.qtd)} · custo de vida`
            : [r.margem != null ? `margem ${fmtNum(r.margem, 0)}%` : (cod === 'obras' ? 'em construção' : 'sem receita'), patr].filter(Boolean).join(' · ');
        const vlSub = (rec > 0 ? `de ${moedaCurta(rec)}` : (cod === 'obras' ? 'investido' : 'custo'))
            + (r.meta && r.meta.ate_mes != null ? ` · meta ${moedaCurta(r.meta.ate_mes)}` : ''); // v2.12.0 — meta do período
        return `<button type="button" class="rz-rr" onclick="escolherGeralRamo('${cod}')" aria-label="Abrir ${escR(r.nome)}">
            <span class="rz-rr-pt" style="background:var(--ramo-cor-${cod}, var(--sage))"></span>
            <span class="rz-rr-nm">${escR(r.nome)}<small>${escR(sub)}</small></span>
            <span class="rz-rr-vl${res < 0 ? ' rz-neg' : ''}">${moedaCurta(res)}<small>${vlSub}</small>${r.meta && r.meta.ate_mes != null ? comparar(res, r.meta.ate_mes, { rotulo: 'vs meta' }) : comparar(res, r.anterior?.resultado, { rotulo: 'vs ' + (filtro.ano - 1) })}</span>
            <span class="rz-rr-bars"><span><i class="rz-rr-rec" style="width:${larg(r.receita)}%"></i></span><span><i class="rz-rr-desp" style="width:${larg(r.despesa)}%"></i></span></span>
        </button>`;
    }).join('');
    const gRes = Number(g.resultado) || 0;
    const linhaGeral = (Number(g.receita) || Number(g.despesa) || gRes) ? `<div class="rz-rr rz-rr-geral">
            <span class="rz-rr-pt" style="background:var(--ramo-cor-geral, var(--sage))"></span>
            <span class="rz-rr-nm">Geral · sem ativo<small>lançado sem ativo: contador, banco</small></span>
            <span class="rz-rr-vl${gRes < 0 ? ' rz-neg' : ''}">${moedaCurta(gRes)}</span>
        </div>` : '';
    const cRes = Number(c.resultado) || 0, cRec = Number(c.receita) || 0;
    const cSub = [c.margem != null ? `margem ${fmtNum(c.margem, 0)}%` : '', Number(c.patrimonio) > 0 ? moedaCurta(c.patrimonio) : ''].filter(Boolean).join(' · ');
    const linhaTot = `<div class="rz-rr rz-rr-tot">
            <span class="rz-rr-pt" style="background:var(--ink)"></span>
            <span class="rz-rr-nm">Consolidado<small>${escR(cSub)}</small></span>
            <span class="rz-rr-vl${cRes < 0 ? ' rz-neg' : ''}">${moedaCurta(cRes)}<small>${[cRec > 0 ? `de ${moedaCurta(cRec)}` : '', c.meta && c.meta.ate_mes != null ? `meta ${moedaCurta(c.meta.ate_mes)}` : ''].filter(Boolean).join(' · ')}</small>${c.meta && c.meta.ate_mes != null ? comparar(cRes, c.meta.ate_mes, { rotulo: 'vs meta' }) : comparar(cRes, c.anterior?.resultado)}</span>
        </div>`;
    const nota = pr.soma_ok ? 'A soma das linhas é igual ao Consolidado e ao resultado do herói.' : 'A soma das linhas não fechou com o Consolidado: avise o suporte.';
    return `<div class="rz-card rz-ck">
        <div class="rz-card-h"><h3>Resultado por ramo</h3><span class="rz-sub">${corte}</span></div>
        <p class="rz-desc">Receita, despesa e resultado de cada ramo. Toque para abrir a lente.</p>
        <div class="rz-rr-leg"><span><i class="rz-rr-rec"></i>receita</span><span><i class="rz-rr-desp"></i>despesa</span></div>
        ${linhas}${linhaGeral}${linhaTot}
        <p class="rz-desc rz-ck-nota">${nota} Família e Outros bens mostram o custo, sem margem.</p>
    </div>`;
}

// ---------------------------------------------------------------------
// v2.11.0 (fatia 8, F8-2, D8-2 revista) — os cards da operação de cada ramo, abaixo do herói da lente.
// Imóveis já tem os dele (cards de locação); os outros ramos ganham os seus aqui.
// ---------------------------------------------------------------------
function montarCardsDoRamo(ramo, ind) {
    if (!ind || ind.pode_ver === false || ramo === 'imoveis') return '';
    const cards = [];
    const linha = ({ ic, tit, sub, rt, rtSub, rtCls, toque, extra = '' }) => {
        const tag = toque ? 'button' : 'div';
        return `<${tag}${toque ? ` type="button" onclick="${toque}"` : ''} class="rz-row rz-ck-li">
            ${ic ? `<span class="rz-ic"><i data-lucide="${escR(ic)}"></i></span>` : ''}
            <div class="rz-tx"><b>${escR(tit)}</b>${sub ? `<span>${escR(sub)}</span>` : ''}${extra}</div>
            ${rt != null ? `<div class="rz-rt"><b${rtCls ? ` class="${rtCls}"` : ''}>${rt}</b>${rtSub ? `<small>${escR(rtSub)}</small>` : ''}</div>` : ''}
        </${tag}>`;
    };
    const card = (titulo, sub, corpo, desc = '') => `<div class="rz-card rz-ck"><div class="rz-card-h"><h3>${escR(titulo)}</h3>${sub ? `<span class="rz-sub">${escR(sub)}</span>` : ''}</div>${desc ? `<p class="rz-desc">${escR(desc)}</p>` : ''}${corpo}</div>`;
    const idAtivo = id => `abrirAtivoHoje('${String(id || '').replace(/[^0-9a-f-]/gi, '')}')`;
    const porAtivo = Array.isArray(ind.por_ativo) ? ind.por_ativo : [];

    // Ciclos abertos (safra do talhão, engorda do lote): fase n de m e o custo pago, a pagar e previsto
    if ((ramo === 'agro' || ramo === 'pecuaria') && Array.isArray(ind.ciclos_abertos) && ind.ciclos_abertos.length) {
        const corpo = ind.ciclos_abertos.map(c => {
            const tot = Number(c.total) || 0, pos = Number(c.posicao) || 0;
            const sub = [c.fase, tot ? `fase ${pos} de ${tot}` : '', c.area_ha ? `${fmtNum(c.area_ha)} ha` : ''].filter(Boolean).join(' · ');
            const prev = nOuNull(c.previsto);
            return linha({ ic: ramo === 'agro' ? 'sprout' : 'fence', tit: `${c.ativo} · ${c.nome || c.programa || ''}`, sub,
                extra: barraBala({ pago: c.pago, aPagar: c.a_pagar, previsto: prev, marcador: tot ? pos / tot * 100 : null,
                    esquerda: `pago ${moedaCurta(c.pago)}${Number(c.a_pagar) ? ` · a pagar ${moedaCurta(c.a_pagar)}` : ''}`,
                    direita: prev ? `previsto ${moedaCurta(prev)}` : 'sem previsto' }) });
        }).join('');
        cards.push(card(ramo === 'agro' ? 'Safras abertas' : 'Ciclos abertos', '', corpo, 'Fase atual e o custo até agora. Traço = onde a fase está.'));
    }
    if (ramo === 'agro' && Array.isArray(ind.ciclos_fechados) && ind.ciclos_fechados.length) {
        const corpo = ind.ciclos_fechados.map(c => {
            const r = c.resultado || {};
            const partes = (Array.isArray(c.campos) ? c.campos : []).map(f => {
                let v = nOuNull(r[f.campo]);
                if (v == null && f.calculado) { const [a, b] = String(f.calculado).split('/'); v = nOuNull(r[a]) != null && nOuNull(r[b]) ? Number(r[a]) / Number(r[b]) : null; }
                if (v == null) return '';
                return String(f.unidade || '').startsWith('R$') ? `${f.rotulo}: ${moedaInteira(v)}` : `${f.rotulo}: ${fmtNum(v, 0)} ${f.unidade || ''}`.trim();
            }).filter(Boolean).join(' · ');
            return linha({ ic: 'wheat', tit: `${c.ativo} · ${c.nome || ''}`, sub: partes || 'Fechada sem resultado informado', rt: r.custo != null ? moedaCurta(r.custo) : null, rtSub: 'custo' });
        }).join('');
        cards.push(card('Última safra fechada', '', corpo));
    }

    // Obras: avanço físico (traço) × financeiro (barra); gasto mais de 5 p.p. à frente do físico fica vermelho
    if (ramo === 'obras') {
        const obras = Array.isArray(ind.obras) ? ind.obras : [];
        const corpo = obras.map(o => {
            const tot = Number(o.total) || 0, conc = Number(o.concluidas) || 0, prev = nOuNull(o.previsto);
            const fis = tot ? conc / tot * 100 : null, fin = prev ? (Number(o.pago) || 0) / prev * 100 : null;
            return linha({ ic: 'hard-hat', tit: `${o.ativo} · ${o.programa || ''}`, sub: [o.etapa, tot ? `etapa ${Math.min(conc + 1, tot)} de ${tot}` : ''].filter(Boolean).join(' · '),
                extra: barraBala({ pago: o.pago, aPagar: o.a_pagar, previsto: prev, marcador: fis, alerta: fis != null && fin != null && fin - fis > 5,
                    esquerda: `pago ${moedaCurta(o.pago)}${fin != null ? ` (${fmtNum(fin, 0)}%)` : ''}`,
                    direita: `${fis != null ? `físico ${fmtNum(fis, 0)}%` : ''}${prev ? ` · previsto ${moedaCurta(prev)}` : ''}` }) });
        }).join('');
        // v2.15.0 (dem 87ff1a11) — imóveis com plano de pagamento (Construção coletiva, Compra na planta) entram no card
        const planos = Array.isArray(ind.planos) ? ind.planos : [];
        const corpoPl = planos.map(o => {
            const tot = Number(o.total) || 0, pg = Number(o.pago) || 0, fin = tot ? pg / tot * 100 : null;
            const ent = o.entrega && o.entrega.prevista ? `entrega ${mesAnoCurto(o.entrega.prevista)}${o.entrega.situacao === 'atrasada' ? ' · atrasada' : o.entrega.situacao === 'tolerancia' ? ' · na tolerância' : ''}` : '';
            return linha({ ic: 'building-2', tit: `${o.ativo} · ${o.programa || ''}`, sub: [o.parcelas ? `${o.pagas || 0} de ${o.parcelas} parcelas` : '', ent].filter(Boolean).join(' · '),
                toque: o.ativo_id ? idAtivo(o.ativo_id) : '',
                extra: barraBala({ pago: pg, previsto: tot, alerta: o.entrega && o.entrega.situacao === 'atrasada',
                    esquerda: `pago ${moedaCurta(pg)}${fin != null ? ` (${fmtNum(fin, 0)}%)` : ''}`, direita: tot ? `total ${moedaCurta(tot)}` : '' }) });
        }).join('');
        cards.push(card('Obras em andamento', '', (corpo + corpoPl) || '<p class="rz-desc">Nenhuma obra em andamento.</p>',
            obras.length ? 'Barra escura = pago; traço = avanço físico. Gasto passando do físico pede atenção.' : (planos.length ? 'Barra escura = pago do plano de pagamento.' : '')));
    }

    // Pecuária: rebanho, próximos avisos e vendas (D8-3, D8-5, D8-9)
    if (ramo === 'pecuaria') {
        const cats = Array.isArray(ind.por_categoria) ? ind.por_categoria : [];
        const fases = Array.isArray(ind.por_fase) ? ind.por_fase : [];
        const total = Number(ind.animais) || 0;
        if (total) {
            const tons = ['var(--ramo-acc)', 'var(--ramo-hdr)', 'var(--sage)', 'var(--brass-light)', 'var(--muted)', 'var(--line)'];
            const C = 2 * Math.PI * 15.9;
            let acc = 0;
            const arcos = cats.map((c, k) => { const len = C * (Number(c.qtd) || 0) / total; const s = `<circle cx="21" cy="21" r="15.9" style="stroke:${tons[k % tons.length]};stroke-dasharray:${len.toFixed(1)} ${(C - len).toFixed(1)};stroke-dashoffset:${(-acc).toFixed(1)}" transform="rotate(-90 21 21)"/>`; acc += len; return s; }).join('');
            const leg = cats.map((c, k) => `<div><span class="rz-ck-dot" style="background:${tons[k % tons.length]}"></span>${escR(c.nome)}<b>${Number(c.qtd) || 0}</b></div>`).join('');
            const chips = fases.map(f => `<span class="rz-ck-cnt"><b>${Number(f.qtd) || 0}</b> ${escR(String(f.fase || '').toLowerCase())}</span>`).join('');
            cards.push(card('Rebanho', `${total} ${total === 1 ? 'animal' : 'animais'}`, `<div class="rz-ck-ring"><svg viewBox="0 0 42 42" role="img" aria-label="Animais por categoria"><circle cx="21" cy="21" r="15.9" class="rz-ck-ring-bg"/>${arcos}<text x="21" y="22" text-anchor="middle" class="rz-ck-ring-n">${total}</text><text x="21" y="27.5" text-anchor="middle" class="rz-ck-ring-u">${total === 1 ? 'animal' : 'animais'}</text></svg><div class="rz-ck-ring-leg">${leg}</div></div>`
                + `${chips ? `<div class="rz-ck-cnts">${chips}</div>` : ''}<p class="rz-desc rz-ck-nota">${Number(ind.em_ciclo) || 0} em ciclo · ${Number(ind.prenhes) || 0} prenhes${Number(ind.lotes) ? ` · ${ind.lotes} ${Number(ind.lotes) === 1 ? 'lote' : 'lotes'}` : ''}</p>`));
        }
        const avisos = Array.isArray(ind.avisos) ? ind.avisos : [];
        if (avisos.length) {
            const corpo = avisos.map(a => {
                const atras = !!a.atrasado;
                const quando = a.data ? formatarDataBR(a.data).slice(0, 5) : '';
                return `<button type="button" class="rz-row rz-ck-li" onclick="abrirMembroHoje('${String(a.membro_id || '').replace(/[^0-9a-f-]/gi, '')}')">
                    <span class="rz-ck-dot" style="background:var(--ramo-cor-pecuaria, var(--sage))"></span>
                    <div class="rz-tx"><b>${escR(`${a.rotulo || a.fase} · ${a.identificador}${a.nome ? ' ' + a.nome : ''}`)}</b><span>${escR([a.ativo_nome, a.automatica ? 'muda sozinha na data' : 'você confirma'].filter(Boolean).join(' · '))}</span></div>
                    <span class="rz-ck-tag ${atras ? 'rz-ruim' : a.automatica ? 'rz-info' : 'rz-aten'}">${atras ? 'atrasado' : escR(quando)}</span>
                </button>`;
            }).join('');
            cards.push(card('Próximos 30 dias no rebanho', '', corpo));
        }
        const v = ind.vendas || {};
        const cab = Number(v.cabecas) || 0, val = Number(v.valor) || 0;
        if (cab || val) {
            cards.push(card('Vendas de animais', String(filtro.ano), `<div class="rz-ck-kpis"><div><small>Cabeças vendidas</small><b>${cab}</b></div><div><small>Receita</small><b>${moedaCurta(val)}</b>${cab && val ? `<em class="rz-vs">${moedaCurta(val / cab)} por cabeça</em>` : ''}</div></div>`));
        }
    }

    // Família: por vida · Outros bens: custo por bem (quanto pesa no valor) · demais: resultado por ativo
    if (porAtivo.length) {
        if (ramo === 'familia') {
            cards.push(card('Por vida', String(filtro.ano), porAtivo.map(a => linha({ ic: 'user', tit: a.nome, sub: a.principal || '', rt: moedaInteira(a.despesa), rtSub: 'custo no ano', toque: idAtivo(a.id) })).join('')));
        } else if (ramo === 'outros') {
            const L = [...porAtivo].sort((x, y) => (Number(y.despesa) || 0) - (Number(x.despesa) || 0));
            cards.push(card('Custo por bem', String(filtro.ano), L.map(a => linha({ ic: 'gem', tit: a.nome,
                sub: a.custo_pct_valor != null ? `${fmtNum(a.custo_pct_valor)}% do valor` : 'sem valor cadastrado', rt: moedaInteira(a.despesa), rtSub: Number(a.receita) ? `receita ${moedaCurta(a.receita)}` : '', toque: idAtivo(a.id) })).join(''),
                'Quanto cada bem custa no ano e quanto isso pesa no valor dele.'));
        } else {
            const tit = ramo === 'pecuaria' ? 'Resultado por lote' : ramo === 'agro' ? 'Resultado por talhão e ativo' : 'Resultado por ativo';
            cards.push(card(tit, String(filtro.ano), porAtivo.map(a => {
                const res = Number(a.resultado) || 0;
                const sub = [a.principal, `receita ${moedaCurta(a.receita)} · custo ${moedaCurta(a.despesa)}`, a.custo_ha != null ? `${moedaInteira(a.custo_ha)}/ha` : ''].filter(Boolean).join(' · ');
                return linha({ tit: a.nome, sub, rt: (res > 0 ? '+' : '') + moedaCurta(res), rtCls: res < 0 ? 'rz-neg' : res > 0 ? 'rz-in' : '', toque: idAtivo(a.id) });
            }).join('')));
        }
    }
    if (ramo === 'agro' || ramo === 'pecuaria') {
        cards.push(`<p class="rz-desc rz-ck-depois">${ramo === 'agro' ? 'Chuva e produtividade em tempo real' : 'Litros por vaca, ganho de peso e DEL'} entram com os registros do dia (medições).</p>`);
    }
    return cards.join('');
}

// v2.4.0 (dem 43bc3cab) — "Indicadores de mercado" no chip Fique por dentro do Hoje: uma linha por indicador
// (nome e mês de referência à esquerda; valor do mês e acumulado de 12 meses à direita). Não depende do
// contexto Tudo · Comercial · Família: é informação do mercado, não da carteira.
export async function renderIndicadoresMercado(mountId) {
    const mount = document.getElementById(mountId);
    if (!mount) return;
    if (!mount.innerHTML && typeof rzSkeleton === 'function') mount.innerHTML = `<div class="rz-card">${rzSkeleton('linhas', 3)}</div>`;
    let indicadores = [];
    try {
        const { data, error } = await dbAuth.rpc('fn_indicadores_resumo');
        if (error) throw error;
        indicadores = data || [];
    } catch (e) {
        console.warn('[resultados] indicadores:', e.message);
        mount.innerHTML = `<div class="rz-card"><p class="rz-desc">Não deu para carregar os indicadores agora.</p></div>`;
        return;
    }
    ultimosIndicadores = indicadores; // alimenta o ⓘ
    mount.innerHTML = montarIndicadoresMercado(indicadores);
    if (typeof rzIcones === 'function') rzIcones();
}

// v2.5.0 — de volta aos quadrantes (pedido do Nicola 09/10 23:04), cada indicador num bloco separado: nome e mês
// no topo, valor do mês grande (negativo em --danger) e o acumulado de 12 meses embaixo.
function montarIndicadoresMercado(indicadores) {
    const cab = `<div class="rz-card-h"><h3>Indicadores de mercado</h3>${botaoInfoCard('abrirInfoIndicadores()')}</div>`;
    if (!indicadores || !indicadores.length) {
        return `<div class="rz-card">${cab}<div class="rz-empty"><div class="rz-ic"><svg data-lucide="trending-up"></svg></div><p>Índice de mercado indisponível.</p></div></div>`;
    }
    const blocos = indicadores.map(ind => {
        const mes = ind.valor_mes_pct == null ? null : Number(ind.valor_mes_pct);
        return `<div class="rz-ind-q">
            <div class="rz-ind-q-h"><b>${rzEsc(NOME_CURTO_INDICADOR[ind.codigo] || ind.nome)}</b><span>${rzEsc(competenciaCurta(ind.competencia_mes))}</span></div>
            <strong class="${mes != null && mes < 0 ? 'rz-ind-neg' : ''}">${pctSinal(mes)}</strong>
            <span class="rz-ind-q-12">${pctSinal(ind.acumulado_12m_pct)} em 12 meses</span>
        </div>`;
    }).join('');
    return `<div class="rz-card">${cab}<p class="rz-res-sub">Último mês fechado e acumulado de 12 meses · Banco Central</p>
        <div class="rz-ind-grade">${blocos}</div>${botaoVerTodosIndicadores('Ver todos e simuladores')}</div>`;
}

// ---- Colunas no padrão executivo (v2.4.0, dem f0ab422d) -------------------------------------------------
// Referência: gráficos de consultoria estratégica (McKinsey) e PADRAO_RELATORIOS REL-13/23/25/50/52/53 —
// o título diz a conclusão; medida e unidade na linha de baixo; o valor fica em cima de cada coluna, na
// unidade do subtítulo (sem eixo Y nem grade); o zero é a base (negativo desce); colunas em cinza e um
// destaque só; mês que ainda não chegou fica apagado; a fonte vai embaixo. SVG com classes (sem style).
function unidadeColunas(valores) {
    const maxAbs = Math.max(0, ...valores.map(v => Math.abs(v)));
    if (maxAbs >= 1e6) return { div: 1e6, casas: 1, rotulo: 'R$ mi' };
    return { div: 1e3, casas: maxAbs >= 1e4 ? 0 : 1, rotulo: 'R$ mil' };
}
function numeroNaUnidade(v, u) {
    const x = v / u.div;
    const casas = u.casas === 0 && Math.abs(x) < 1 ? 1 : u.casas; // −729 em R$ mil vira −0,7, nunca −1
    const s = Math.abs(x).toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
    return (x < 0 ? '−' : '') + s;
}
function mesesFechadosNoAno() {
    return filtro.ano < ANO_ATUAL ? 12 : (filtro.ano > ANO_ATUAL ? 0 : new Date().getMonth() + 1);
}
function colunasExecutivasSvg(valores, { destaque = -1, alerta = -1, unidade, classeBarra = '', rotuloAria = '' }) {
    const W = 320, TOPO = 16, AREA = 112, BAIXO = 14, MES = 14;
    const max = Math.max(0, ...valores), min = Math.min(0, ...valores);
    const faixa = (max - min) || 1;
    const yZero = TOPO + AREA * (max / faixa);
    const H = TOPO + AREA + BAIXO + MES;
    const passo = W / 12, larg = passo * 0.62;
    const ate = mesesFechadosNoAno();
    const colunas = valores.map((v, i) => {
        const cx = i * passo + passo / 2;
        const h = Math.max(Math.abs(v) / faixa * AREA, v ? 1.5 : 0);
        const y = v >= 0 ? yZero - h : yZero;
        const cls = v < 0 ? 'rz-col-neg' : i === alerta ? 'rz-col-warn' : i === destaque ? 'rz-col-hl' : 'rz-col';
        const barra = v ? `<rect class="${cls}" x="${(cx - larg / 2).toFixed(1)}" y="${y.toFixed(1)}" width="${larg.toFixed(1)}" height="${h.toFixed(1)}" rx="2"/>` : '';
        const valor = v ? `<text class="rz-col-v${v < 0 ? ' rz-col-v-neg' : ''}" x="${cx.toFixed(1)}" y="${(v >= 0 ? y - 4 : y + h + 11).toFixed(1)}" text-anchor="middle">${numeroNaUnidade(v, unidade)}</text>` : '';
        const mes = `<text class="rz-col-m${i + 1 > ate ? ' rz-col-fut' : ''}" x="${cx.toFixed(1)}" y="${H - 3}" text-anchor="middle">${NOMES_MES[i]}</text>`;
        const alvo = `<rect class="rz-col-alvo" x="${(i * passo).toFixed(1)}" y="0" width="${passo.toFixed(1)}" height="${H}"/>`;
        return `<g${classeBarra ? ` class="${classeBarra}"` : ''} data-mes="${i + 1}">${barra}${valor}${mes}${alvo}</g>`;
    }).join('');
    return `<svg class="rz-cols" viewBox="0 0 ${W} ${H}" role="img" aria-label="${rzEsc(rotuloAria)}"><line class="rz-col-base" x1="0" x2="${W}" y1="${yZero.toFixed(1)}" y2="${yZero.toFixed(1)}"/>${colunas}</svg>`;
}
function cabecalhoGrafico(titulo, sub, infoOnclick) {
    return `<div class="rz-card-h"><h3 class="rz-res-titulo">${rzEsc(titulo)}</h3>${botaoInfoCard(infoOnclick)}</div><p class="rz-res-sub">${rzEsc(sub)}</p>`;
}

function montarGraficoMensal(mensal) {
    if (!mensal || !mensal.length) return `<div class="rz-card"><div class="rz-card-h" style="justify-content:space-between"><b>Resultado mês a mês</b>${botaoInfoCard('abrirInfoResultadoMensal()')}</div><p class="rz-desc" style="margin-top:8px">Sem lançamentos no período.</p></div>`;
    // v2.4.0 (dem f0ab422d) — padrão executivo: título-conclusão, valor em cima, zero na base, destaque no melhor mês.
    const valores = Array.from({ length: 12 }, (_, i) => Number((mensal.find(m => Number(m.mes) === i + 1) || {}).resultado) || 0);
    const total = valores.reduce((s, v) => s + v, 0);
    const max = Math.max(...valores);
    const melhor = max > 0 ? valores.indexOf(max) : -1;
    const ate = mesesFechadosNoAno();
    const corte = filtro.ano === ANO_ATUAL && ate >= 1 ? ` até ${NOMES_MES_LONGO[ate - 1]}` : '';
    const somaTxt = (total < 0 ? '−' : '') + formatarPatrimonioCompacto(Math.abs(total));
    const titulo = melhor >= 0
        ? `${NOMES_MES_LONGO[melhor].charAt(0).toUpperCase() + NOMES_MES_LONGO[melhor].slice(1)} foi o melhor mês; o ano soma ${somaTxt}${corte}`
        : (total < 0 ? `O ano está negativo em ${formatarPatrimonioCompacto(Math.abs(total))}${corte}` : `Sem resultado em ${filtro.ano}`);
    const unidade = unidadeColunas(valores);
    return `<div class="rz-card">
        ${cabecalhoGrafico(titulo, `Resultado por mês · ${unidade.rotulo} · ${filtro.ano}`, 'abrirInfoResultadoMensal()')}
        ${colunasExecutivasSvg(valores, { destaque: melhor, unidade, rotuloAria: titulo })}
        <p class="rz-res-fonte">Fonte: Raiz · recebimentos e lançamentos realizados</p>
    </div>`;
}

// v2.15.0 (dem 87ff1a11) — lente Obras: "Investido por mês" (saídas realizadas dos ativos do ramo, inclusive as parcelas de
// aquisição, fora do resultado) no lugar do "Resultado por mês", que em obra fica sempre vazio.
function montarGraficoInvestido(ind) {
    const meses = ind && Array.isArray(ind.investido_mes) ? ind.investido_mes : [];
    const valores = Array.from({ length: 12 }, (_, i) => Number((meses.find(m => Number(m.mes) === i + 1) || {}).valor) || 0);
    const total = valores.reduce((s, v) => s + v, 0);
    const ate = mesesFechadosNoAno();
    const corte = filtro.ano === ANO_ATUAL && ate >= 1 ? ` até ${NOMES_MES_LONGO[ate - 1]}` : '';
    const titulo = total > 0 ? `Investido em ${filtro.ano}: ${formatarPatrimonioCompacto(total)}${corte}` : `Nada investido em ${filtro.ano}`;
    const unidade = unidadeColunas(valores);
    return `<div class="rz-card">
        ${cabecalhoGrafico(titulo, `Investido por mês · ${unidade.rotulo} · ${filtro.ano}`, 'abrirInfoResultadoMensal()')}
        ${colunasExecutivasSvg(valores, { unidade, rotuloAria: titulo })}
        <p class="rz-res-fonte">Fonte: Raiz · saídas realizadas dos ativos do ramo, com as parcelas de aquisição</p>
    </div>`;
}

// v2.5.0 (dem 4de70503) — séries da carteira contra os indicadores escolhidos (fn_carteira_indicador_series, uma
// chamada por indicador; a linha da carteira é a mesma em todas). Devolve { data: {codigo: linhas}, error }.
async function lerSeriesComparacao() {
    const rs = await Promise.all(indicadoresComparar.map(cod =>
        dbAuth.rpc('fn_carteira_indicador_series', { p_cliente_id: CLIENTE_ID_SUPABASE, p_ano: filtro.ano, p_codigo: cod })));
    const erro = rs.find(r => r.error);
    if (erro) return { data: null, error: erro.error };
    const data = {};
    indicadoresComparar.forEach((cod, i) => { data[cod] = rs[i].data || []; });
    return { data, error: null };
}

// Chip da comparação: liga/desliga; no máximo 2 ligados (o 3º troca o mais antigo) e nunca nenhum.
export async function trocarIndicadorComparacao(codigo) {
    if (!INDICADORES_COMPARAVEIS.includes(codigo)) return;
    if (indicadoresComparar.includes(codigo)) {
        if (indicadoresComparar.length === 1) return;
        indicadoresComparar = indicadoresComparar.filter(c => c !== codigo);
    } else {
        indicadoresComparar = indicadoresComparar.length >= 2 ? [indicadoresComparar[1], codigo] : [...indicadoresComparar, codigo];
    }
    const el = document.getElementById('res-card-carteira-ind');
    if (!el) return;
    el.querySelectorAll('[data-ind-cmp]').forEach(b => b.classList.toggle('rz-on', indicadoresComparar.includes(b.dataset.indCmp)));
    const r = await lerSeriesComparacao();
    if (r.error) { if (typeof mostrarToast === 'function') mostrarToast('Não deu para trocar o indicador agora.', 'danger'); return; }
    el.outerHTML = montarGraficoIndicador(r.data);
    if (typeof rzIcones === 'function') rzIcones();
}

const pctVar = (indice) => indice == null ? null : Number(indice) - 100;
const pctTxt = (v) => v == null ? '—' : (v >= 0 ? '+' : '−') + Math.abs(v).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';

// v2.5.0 — modelo executivo: título-conclusão, base 100 como linha fina, carteira em --pine contínua, indicadores
// tracejados em cinza (um traço diferente para cada), rótulo direto no fim de cada linha com a variação do ano.
function montarGraficoIndicador(series) {
    if (filtro.contexto === 'familia') return ''; // ESP §4.3
    const chips = `<div class="rz-chips rz-res-cmp" role="group" aria-label="Comparar com">${INDICADORES_COMPARAVEIS.map(c =>
        `<button type="button" class="rz-chip${indicadoresComparar.includes(c) ? ' rz-on' : ''}" data-ind-cmp="${c}" onclick="trocarIndicadorComparacao('${c}')">${rzEsc(NOME_CURTO_INDICADOR[c])}</button>`).join('')}</div>`;
    const base = series && series[indicadoresComparar[0]];
    if (!base || base.length < 2) {
        return `<div class="rz-card" id="res-card-carteira-ind">
            ${cabecalhoGrafico('Sua carteira × indicadores', `Base 100 em jan · ${filtro.ano}`, 'abrirInfoGraficoIndicador()')}
            ${chips}<p class="rz-desc rz-res-nota">Dados insuficientes no período.</p></div>`;
    }
    const ate = Math.max(1, Math.min(mesesFechadosNoAno() || 12, base.length));
    const carteira = base.slice(0, ate).map(p => Number(p.carteira_indice));
    const linhasInd = indicadoresComparar.map((cod, k) => {
        const pts = [];
        for (let i = 0; i < Math.min(ate, (series[cod] || []).length); i++) {
            const v = series[cod][i].indicador_indice;
            if (v == null) break;
            pts.push(Number(v));
        }
        return { cod, nome: NOME_CURTO_INDICADOR[cod], pts, traco: k === 0 ? '5 3' : '1.5 3' };
    });
    const todos = [100, ...carteira, ...linhasInd.flatMap(l => l.pts)];
    const max = Math.max(...todos), min = Math.min(...todos), amp = (max - min) || 1;
    const W = 320, H = 150, ESQ = 4, DIR = 92, TOPO = 10, BAIXO = 18;
    const larg = W - ESQ - DIR;
    const x = (i) => ESQ + (ate > 1 ? i * larg / (ate - 1) : 0);
    const y = (v) => TOPO + (max - v) / amp * (H - TOPO - BAIXO);
    const poli = (pts) => pts.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
    // rótulos no fim das linhas, afastados para não se sobreporem
    const rot = [{ txt: `Carteira ${pctTxt(pctVar(carteira[carteira.length - 1]))}`, y: y(carteira[carteira.length - 1]), cls: 'rz-cmp-rot-c' },
        ...linhasInd.filter(l => l.pts.length).map(l => ({ txt: `${l.nome} ${pctTxt(pctVar(l.pts[l.pts.length - 1]))}`, y: y(l.pts[l.pts.length - 1]), cls: 'rz-cmp-rot-i' }))]
        .sort((p, q) => p.y - q.y);
    for (let i = 1; i < rot.length; i++) if (rot[i].y - rot[i - 1].y < 12) rot[i].y = rot[i - 1].y + 12;
    const rotulos = rot.map(r => `<text class="${r.cls}" x="${W - DIR + 6}" y="${(r.y + 3.5).toFixed(1)}">${rzEsc(r.txt)}</text>`).join('');
    const svg = `<svg class="rz-cmp" viewBox="0 0 ${W} ${H}" role="img" aria-label="Sua carteira comparada com ${rzEsc(linhasInd.map(l => l.nome).join(' e '))}">
        <line class="rz-cmp-base" x1="${ESQ}" x2="${W - DIR}" y1="${y(100).toFixed(1)}" y2="${y(100).toFixed(1)}"/>
        ${linhasInd.filter(l => l.pts.length > 1).map(l => `<polyline class="rz-cmp-ind" stroke-dasharray="${l.traco}" points="${poli(l.pts)}"/>`).join('')}
        <polyline class="rz-cmp-cart" points="${poli(carteira)}"/>
        ${rotulos}
        <text class="rz-cmp-m" x="${ESQ}" y="${H - 3}">${NOMES_MES[0]}</text>
        <text class="rz-cmp-m" x="${(W - DIR).toFixed(1)}" y="${H - 3}" text-anchor="end">${NOMES_MES[ate - 1]}</text>
    </svg>`;
    // título-conclusão: a carteira contra cada indicador escolhido (variação do ano até o último mês de cada um)
    const vc = pctVar(carteira[carteira.length - 1]);
    const comps = linhasInd.filter(l => l.pts.length).map(l => {
        const vi = pctVar(l.pts[l.pts.length - 1]);
        return { lado: vc >= vi ? 'acima' : 'abaixo', txt: `do ${l.nome} (${pctTxt(vi)})` };
    });
    // "acima do IPCA (+1,9%) e do IGP-M (+3,4%)" quando os dois vão para o mesmo lado
    const compTxt = comps.length === 2 && comps[0].lado === comps[1].lado
        ? `${comps[0].lado} ${comps[0].txt} e ${comps[1].txt}`
        : comps.map(c => `${c.lado} ${c.txt}`).join(' e ');
    const titulo = `Sua carteira rendeu ${pctTxt(vc)} em ${filtro.ano}` + (compTxt ? `, ${compTxt}` : '');
    const ultimoInd = linhasInd.filter(l => l.pts.length).map(l => `${l.nome} até ${NOMES_MES[l.pts.length - 1].toLowerCase()}`).join(' · ');
    return `<div class="rz-card" id="res-card-carteira-ind">
        ${cabecalhoGrafico(titulo, `Base 100 em jan · carteira até ${NOMES_MES[ate - 1].toLowerCase()}${ultimoInd ? ' · ' + ultimoInd : ''}`, 'abrirInfoGraficoIndicador()')}
        ${chips}${svg}
        <p class="rz-res-fonte">Fonte: Raiz · resultado da carteira; índices do Banco Central · escolha até 2 para comparar</p>
    </div>`;
}

// v2.5.0 (dem 4de70503) — Contratos por índice: barras deitadas (ranking, REL-25), a maior fatia em destaque.
function montarContratosPorIndice(r) {
    const atalho = botaoVerTodosIndicadores('Indicadores e simuladores');
    if (r && r.error) {
        const bloqueado = /plano|perfil/i.test(r.error.message || '') || r.error.code === '42501';
        if (!bloqueado) { console.warn('[resultados] índices:', r.error.message); return ''; }
        return `<div class="rz-card">${cabecalhoGrafico('Contratos por índice de reajuste', 'Aluguel mensal dos contratos ativos por índice', 'abrirInfoContratosIndice()')}
            <p class="rz-desc rz-res-nota">Disponível nos planos com Indicadores.</p>${atalho}</div>`;
    }
    const d = r && r.data;
    const grupos = (d && Array.isArray(d.grupos)) ? d.grupos : [];
    if (!grupos.length || !Number(d.receita)) return '';
    const nome = (g) => NOME_CURTO_INDICADOR[g.codigo] || String(g.nome || 'Sem índice').split(' — ')[0];
    const topo = grupos[0];
    const pctFmt1 = (v) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 }) + '%';
    const titulo = grupos.length === 1
        ? `Todo o aluguel da carteira reajusta pelo ${nome(topo)}`
        : `${nome(topo)} reajusta ${pctFmt1(topo.pct_receita)} do aluguel da carteira`;
    const linhas = grupos.map((g, i) => `<div class="rz-idx-l">
        <span class="rz-idx-n">${rzEsc(nome(g))}</span>
        <svg class="rz-idx-t" viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden="true"><rect class="rz-idx-fundo" width="100" height="12" rx="2"/><rect class="${i === 0 ? 'rz-idx-hl' : 'rz-idx-b'}" width="${Math.max(1, Math.min(100, Number(g.pct_receita || 0))).toFixed(1)}" height="12" rx="2"/></svg>
        <span class="rz-idx-v"><b>${pctFmt1(g.pct_receita)}</b> · ${Number(g.contratos)} ${Number(g.contratos) === 1 ? 'contrato' : 'contratos'}</span>
    </div>`).join('');
    const pond = d.ponderado && d.ponderado.a12 != null ? `<p class="rz-res-sub rz-idx-pond">Reajuste médio ponderado da carteira em 12 meses: <b>${pctSinal(d.ponderado.a12)}</b></p>` : '';
    return `<div class="rz-card">
        ${cabecalhoGrafico(titulo, `Aluguel mensal por índice · ${Number(d.contratos)} contratos ativos · ${formatarPatrimonioCompacto(Number(d.receita))}/mês`, 'abrirInfoContratosIndice()')}
        <div class="rz-idx">${linhas}</div>
        ${pond}
        <p class="rz-res-fonte">Fonte: Raiz · contratos ativos com valor</p>
        ${atalho}
    </div>`;
}

function montarConcentracao(linhas) {
    if (!linhas || !linhas.length) return '';
    const total = linhas.reduce((s, l) => s + Number(l.valor_ano || 0), 0);
    const principais = linhas.slice(0, 6);
    const resto = linhas.slice(6);
    const restoValor = resto.reduce((s, l) => s + Number(l.valor_ano || 0), 0);
    const restoPct = total > 0 ? Math.round((restoValor / total) * 1000) / 10 : 0;
    const concentrada = principais.some(l => l.concentrado);
    // CORRIGIDO (achado pelo Nicola ao vivo, 21/09/2026) — layout original
    // não dava `flex:1;min-width:0` pro nome nem `flex:none;white-space:
    // nowrap` pro valor: com locatário de nome longo, os DOIS lados
    // quebravam linha (nome em 2 linhas E "21.2% · R$" numa linha com
    // "146.400,00" sozinho na de baixo) — mesmo mecanismo que .rz-row
    // .rz-tx/.rz-rt já resolvem em todo o resto do app (.rz-tx com
    // min-width:0 pra poder encolher/quebrar, .rz-rt com flex:none pra
    // nunca quebrar), só que aqui não tinha essas duas propriedades.
    const rows = principais.map(l => `
        <div style="margin-bottom:10px">
            <div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;font-size:12.5px;margin-bottom:3px">
                <b style="font-weight:600;color:${l.concentrado ? 'var(--danger)' : 'var(--ink)'};flex:1;min-width:0">${rzEsc(l.locatario || '—')}</b>
                <span style="color:${l.concentrado ? 'var(--danger)' : 'var(--muted)'};flex:none;white-space:nowrap">${l.percentual_pct}% · ${formatarMoedaBR(l.valor_ano, { semCentavos: true })}</span>
            </div>
            <div class="rz-prog"><i style="width:${Math.min(100, l.percentual_pct)}%;${l.concentrado ? 'background:var(--danger)' : ''}"></i></div>
        </div>`).join('');
    const rowOutros = resto.length ? `
        <div>
            <div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;font-size:12.5px;margin-bottom:3px">
                <b style="font-weight:600;color:var(--muted);flex:1;min-width:0">Outros ${resto.length} locatário${resto.length > 1 ? 's' : ''}</b>
                <span style="color:var(--muted);flex:none;white-space:nowrap">${restoPct}% · ${formatarMoedaBR(restoValor, { semCentavos: true })}</span>
            </div>
            <div class="rz-prog"><i style="width:${Math.min(100, restoPct)}%;background:var(--sage)"></i></div>
        </div>` : '';
    return `<div class="rz-card">
        <div class="rz-card-h" style="justify-content:space-between">
            <span style="display:flex;align-items:center;gap:8px"><b>Dependência de locatário</b>${concentrada ? '<span class="rz-st rz-bad">Concentrada</span>' : ''}</span>
            ${botaoInfoCard('abrirInfoConcentracao()')}
        </div>
        <div style="margin-top:10px">${rows}${rowOutros}</div>
    </div>`;
}

// v2.3.0 — card "Por grupo": o ano aberto pelo nível 1 da árvore de categorias.
function montarPorGrupo(linhas) {
    if (!linhas || !linhas.length) return '';
    const moeda = v => formatarMoedaBR(Number(v || 0), { semCentavos: true });
    const secao = (titulo, itens, { entrada, neutro }) => {
        if (!itens.length) return '';
        const total = itens.reduce((s, l) => s + Number(l.valor || 0), 0);
        const rows = itens.map(l => {
            const pct = total > 0 ? Math.round(Number(l.valor || 0) / total * 100) : 0;
            const qtd = Number(l.qtd || 0);
            return `<div class="rz-row">
                <span class="rz-ic${neutro ? ' rz-neu' : ''}"><i data-lucide="${rzEsc(l.icone || 'circle-dollar-sign')}"></i></span>
                <div class="rz-tx"><b>${rzEsc(l.grupo_nome || l.grupo_codigo)}</b><span>${qtd} ${qtd === 1 ? 'lançamento' : 'lançamentos'}${neutro ? '' : ` · ${pct}%`}</span></div>
                <div class="rz-rt"><b${entrada && !neutro ? ' class="rz-in"' : ''}>${moeda(l.valor)}</b></div>
            </div>`;
        }).join('');
        return `<p class="rz-sub">${titulo} · ${moeda(total)}</p>${rows}`;
    };
    const fora = linhas.filter(l => l.grupo_resultado === 'fora_resultado');
    const receitas = linhas.filter(l => l.direcao === 'entrada' && l.grupo_resultado !== 'fora_resultado');
    const despesas = linhas.filter(l => l.direcao === 'saida' && l.grupo_resultado !== 'fora_resultado');
    return `<div class="rz-card">
        <div class="rz-card-h"><h3>Por grupo</h3>${botaoInfoCard('abrirInfoPorGrupo()')}</div>
        ${secao('Receitas', receitas, { entrada: true })}
        ${secao('Despesas', despesas, { entrada: false })}
        ${secao('Fora do resultado', fora, { entrada: false, neutro: true })}
    </div>`;
}

export function abrirInfoPorGrupo() {
    const itens = [
        ['Por grupo', 'O ano aberto pelos grupos do catálogo (Aluguéis, Licenças e serviços, Tributos e taxas, Condomínio e administração, Manutenção…), somando os recebimentos e os lançamentos realizados.'],
        ['Receitas e Despesas', 'Entram no resultado. O percentual é a fatia de cada grupo dentro da sua seção.'],
        ['Fora do resultado', 'Movimento de caixa que não é receita nem despesa: repasses e venda de bem (o imobilizado vira caixa). Aparece para conferência e não entra na conta.'],
        ['De onde vem a classificação', 'Cada subcategoria diz se entra no resultado. A contabilidade é outro eixo: cada lançamento pode ou não ir para o pacote do contador.'],
    ];
    abrirSheet(rzSheetCabecalho('Sobre o card Por grupo') +
        `<div class="rz-sh-b"><div class="rz-card"><div class="rz-kv">${
            itens.map(([r, v]) => `<div class="rz-full"><small>${rzEsc(r)}</small><b>${rzEsc(v)}</b></div>`).join('')
        }</div></div></div>`);
}

// v1.1.0 — Reajustes e Revisional/Renovação viraram 2 cards com o MESMO
// desenho (12 barras, por VALOR, mês que concentra ≥25% do ano vira
// warning) — motor comum, só muda o título, o dado e o botão de info.
function montarCalendario12Meses(meses, { titulo, classeBarra, infoOnclick, umContrato, varios, fatia, medida }) {
    // v2.4.0 (dem f0ab422d) — mesmo padrão executivo do Resultado mês a mês. O mês que concentra ≥25% do
    // valor do ano é o destaque em --warning (estado); sem concentração, o maior mês fica em --pine.
    const valores = Array.from({ length: 12 }, (_, i) => Number((meses.find(m => m.mes === i + 1) || {}).valor_total) || 0);
    const total = valores.reduce((s, v) => s + v, 0);
    const qtd = meses.reduce((s, m) => s + Number(m.qtd_contratos || 0), 0);
    const alerta = meses.find(m => m.concentrado);
    const iAlerta = alerta ? alerta.mes - 1 : -1;
    const max = Math.max(...valores);
    const destaque = iAlerta < 0 && max > 0 ? valores.indexOf(max) : -1;
    const mesTxt = (i) => NOMES_MES_LONGO[i].charAt(0).toUpperCase() + NOMES_MES_LONGO[i].slice(1);
    const conclusao = !total ? `${titulo}: nada em ${filtro.ano}`
        : alerta ? `${mesTxt(iAlerta)} concentra ${Math.round(Number(alerta.valor_total) / total * 100)}% ${fatia}`
        : `${qtd} ${qtd === 1 ? umContrato : varios} em ${filtro.ano}, somando ${formatarPatrimonioCompacto(total)}`;
    const unidade = unidadeColunas(valores);
    return `<div class="rz-card">
        ${cabecalhoGrafico(conclusao, `${medida} · ${unidade.rotulo} · ${filtro.ano}`, infoOnclick)}
        ${colunasExecutivasSvg(valores, { destaque, alerta: iAlerta, unidade, classeBarra, rotuloAria: conclusao })}
        <p class="rz-res-fonte">Fonte: Raiz · contratos vigentes · toque no mês para ver os contratos</p>
    </div>`;
}

function montarReajustesCalendario(meses) {
    return montarCalendario12Meses(meses, { titulo: 'Reajustes', classeBarra: 'rz-res-barra-mes', infoOnclick: 'abrirInfoReajustes()', umContrato: 'contrato reajusta', varios: 'contratos reajustam', fatia: 'do aluguel que reajusta no ano', medida: 'Aluguel que reajusta por mês' });
}

function montarRevisionaisCalendario(meses) {
    if (!meses.length || !meses.some(m => Number(m.valor_total) > 0)) {
        // ainda mostra o card (nunca fica menos informativo que Reajustes),
        // mas com estado vazio honesto — não tem contrato terminando no ano.
        return `<div class="rz-card">
            <div class="rz-card-h" style="justify-content:space-between"><b>Revisional / Renovação</b>${botaoInfoCard('abrirInfoRevisionais()')}</div>
            <p class="rz-desc" style="margin-top:8px">Nenhum contrato termina em ${filtro.ano}.</p>
        </div>`;
    }
    return montarCalendario12Meses(meses, { titulo: 'Revisional / Renovação', classeBarra: 'rz-res-barra-revisional', infoOnclick: 'abrirInfoRevisionais()', umContrato: 'contrato termina', varios: 'contratos terminam', fatia: 'do aluguel dos contratos que terminam no ano', medida: 'Aluguel dos contratos que terminam por mês' });
}

function ligarBarrasCalendario(seletor, meses, aoTocarMes) {
    document.querySelectorAll(seletor).forEach(el => {
        const mes = Number(el.dataset.mes);
        const dado = meses.find(m => m.mes === mes);
        if (!dado || !Number(dado.valor_total)) return;
        el.addEventListener('click', () => aoTocarMes(mes));
    });
}

export async function abrirResultadosMesReajuste(mes) {
    abrirSheet(rzSheetCabecalho(`Reajustes de ${NOMES_MES[mes - 1]}/${filtro.ano}`, null) + `<div class="rz-sh-b" id="res-mes-reajuste-corpo">${rzSk('linhas', 3)}</div>`);
    try {
        const { data, error } = await dbAuth.rpc('fn_carteira_reajustes_mes', { p_cliente_id: CLIENTE_ID_SUPABASE, p_ano: filtro.ano, p_mes: mes });
        if (error) throw error;
        const corpo = document.getElementById('res-mes-reajuste-corpo');
        if (!corpo) return;
        if (!data || !data.length) { corpo.innerHTML = '<p class="rz-desc">Nenhum contrato reajusta neste mês.</p>'; return; }
        corpo.innerHTML = `<div class="rz-card rz-list">${data.map(c => `
            <div class="rz-row rz-link" onclick="fecharSheet(); abrirFichaContrato('${c.contrato_id}')">
                <div class="rz-ic"><svg data-lucide="file-text"></svg></div>
                <div class="rz-tx"><b>${rzEsc(c.locatario || '—')}</b><span>${rzEsc(c.ativo_nome || '')} · ${rzEsc(c.indice || 'índice não informado')}</span></div>
                <div class="rz-rt"><b>${formatarMoedaBR(c.valor, { semCentavos: true })}</b></div>
                <svg data-lucide="chevron-right" class="rz-chev"></svg>
            </div>`).join('')}</div>`;
        if (typeof rzIcones === 'function') rzIcones();
    } catch (err) {
        const corpo = document.getElementById('res-mes-reajuste-corpo');
        if (corpo) corpo.innerHTML = `<p class="rz-desc">Não deu pra carregar (${rzEsc(err.message || 'erro')}).</p>`;
    }
}

// v1.1.0 — mesmo padrão de abrirResultadosMesReajuste, pelo mês de TÉRMINO
// do contrato (fn_carteira_revisionais_mes). Subtítulo mostra a data de
// término em vez do índice (não faz sentido aqui — não é reajuste).
export async function abrirResultadosMesRevisional(mes) {
    abrirSheet(rzSheetCabecalho(`Revisional/Renovação de ${NOMES_MES[mes - 1]}/${filtro.ano}`, null) + `<div class="rz-sh-b" id="res-mes-revisional-corpo">${rzSk('linhas', 3)}</div>`);
    try {
        const { data, error } = await dbAuth.rpc('fn_carteira_revisionais_mes', { p_cliente_id: CLIENTE_ID_SUPABASE, p_ano: filtro.ano, p_mes: mes });
        if (error) throw error;
        const corpo = document.getElementById('res-mes-revisional-corpo');
        if (!corpo) return;
        if (!data || !data.length) { corpo.innerHTML = '<p class="rz-desc">Nenhum contrato termina neste mês.</p>'; return; }
        corpo.innerHTML = `<div class="rz-card rz-list">${data.map(c => `
            <div class="rz-row rz-link" onclick="fecharSheet(); abrirFichaContrato('${c.contrato_id}')">
                <div class="rz-ic"><svg data-lucide="file-text"></svg></div>
                <div class="rz-tx"><b>${rzEsc(c.locatario || '—')}</b><span>${rzEsc(c.ativo_nome || '')} · termina em ${formatarDataBR(c.fim)}</span></div>
                <div class="rz-rt"><b>${formatarMoedaBR(c.valor, { semCentavos: true })}</b></div>
                <svg data-lucide="chevron-right" class="rz-chev"></svg>
            </div>`).join('')}</div>`;
        if (typeof rzIcones === 'function') rzIcones();
    } catch (err) {
        const corpo = document.getElementById('res-mes-revisional-corpo');
        if (corpo) corpo.innerHTML = `<p class="rz-desc">Não deu pra carregar (${rzEsc(err.message || 'erro')}).</p>`;
    }
}

// v1.1.0 — pedido explícito do Nicola: ícone (i) em cada card explicando
// conceitos e métricas. Mesmo padrão de explicarStatusConciliacao()
// (financeiro.js) — sheet com rz-kv, sem novo componente.
export function abrirInfoReajustes() {
    const itens = [
        ['Reajuste', 'O aumento anual do valor do aluguel pelo índice do contrato (IPCA, IGP-M...).'],
        ['Mês da barra', 'O mês de aniversário da ASSINATURA do contrato — fixo, não muda com o tempo. Um contrato assinado em março reajusta em março todo ano, mesmo que o reajuste seja aplicado com atraso.'],
        ['Valor da barra', 'Soma do valor de aluguel dos contratos que reajustam naquele mês — não a quantidade de contratos. Poucos contratos de valor alto pesam mais que muitos de valor baixo.'],
        ['Mês em alerta', 'Quando um único mês concentra 25% ou mais do valor total do ano — o fluxo de caixa da carteira fica mais sensível a esse mês.'],
        ['Toque na barra', 'Abre a lista de contratos que reajustam naquele mês; toque num contrato leva à ficha dele.'],
    ];
    abrirSheet(rzSheetCabecalho('Como funciona o calendário de reajustes') +
        `<div class="rz-sh-b"><div class="rz-card"><div class="rz-kv">${
            itens.map(([r, v]) => `<div class="rz-full"><small>${rzEsc(r)}</small><b style="font-weight:500;font-size:12.5px">${rzEsc(v)}</b></div>`).join('')
        }</div></div></div>`);
}

export function abrirInfoRevisionais() {
    const itens = [
        ['Revisional / Renovação', 'O momento em que locador e locatário negociam continuar o contrato (renovando ou revisando condições) ou encerrá-lo.'],
        ['Mês da barra', 'O mês de TÉRMINO (fim) do contrato — calendário separado do de reajuste, que olha a data de assinatura.'],
        ['Valor da barra', 'Soma do valor de aluguel dos contratos que terminam naquele mês.'],
        ['Mês em alerta', 'Quando um único mês concentra 25% ou mais do valor total do ano que ainda vai terminar.'],
        ['Toque na barra', 'Abre a lista de contratos que terminam naquele mês; toque num contrato leva à ficha dele.'],
    ];
    abrirSheet(rzSheetCabecalho('Como funciona o calendário de revisionais/renovações') +
        `<div class="rz-sh-b"><div class="rz-card"><div class="rz-kv">${
            itens.map(([r, v]) => `<div class="rz-full"><small>${rzEsc(r)}</small><b style="font-weight:500;font-size:12.5px">${rzEsc(v)}</b></div>`).join('')
        }</div></div></div>`);
}

// v1.2.0 (21/09/2026, pedido explícito ao vivo: "o icone i deve entrar em
// todos os cards desta tela") — mesmo padrão das 2 funções acima
// (rz-kv/rz-full dentro de Sheet), uma por card que ainda não tinha.
// v2.2.0 (5B) — "Ver todos" abre a tela de indicadores (módulo lazy js/indicadores.js).
function botaoVerTodosIndicadores(rotulo = 'Ver todos') {
    const pode = typeof podeUsar === 'function' ? podeUsar('resultados.indicadores') : true;
    if (pode === false) {
        return `<button type="button" disabled title="Disponível nos planos com Resultados" style="display:flex;align-items:center;justify-content:center;gap:6px;width:100%;margin-top:12px;padding-top:12px;border:0;border-top:1px solid var(--line);background:none;color:var(--muted);font-weight:600;font-size:14px;min-height:44px"><svg data-lucide="lock" style="width:14px;height:14px"></svg>${rzEsc(rotulo)} — disponível nos planos com Resultados</button>`;
    }
    return `<button type="button" onclick="abrirIndicadores()" style="display:flex;align-items:center;justify-content:center;gap:4px;width:100%;margin-top:12px;padding-top:12px;border:0;border-top:1px solid var(--line);background:none;color:var(--sprout);font-weight:600;font-size:14px;min-height:44px">${rzEsc(rotulo)}<svg data-lucide="chevron-right" style="width:16px;height:16px"></svg></button>`;
}

export function abrirIndicadores() {
    return import('./indicadores.js').then(m => m.abrirTelaIndicadores(filtro.ano))
        .catch(err => { console.warn('[resultados] indicadores.js:', err?.message); if (typeof mostrarToast === 'function') mostrarToast('Não deu para abrir os indicadores agora.', 'erro'); });
}

export function abrirInfoIndicadores() {
    const itens = [
        // v2.1.0 (5A) — um parágrafo por indicador, do banco (indicador_series.explicacao).
        ...ultimosIndicadores.filter(ind => ind.explicacao).map(ind => [
            `${NOME_CURTO_INDICADOR[ind.codigo] || ind.nome} · ${pctSinal(ind.acumulado_12m_pct)} em 12 meses`, ind.explicacao]),
        ['Como ler', 'O número grande é a variação do último mês fechado; embaixo, o acumulado dos últimos 12 meses. O mês em andamento não entra na conta.'],
        ['Fonte', 'Banco Central do Brasil (Sistema Gerenciador de Séries Temporais — SGS).'],
    ];
    abrirSheet(rzSheetCabecalho('O que cada indicador mede') +
        `<div class="rz-sh-b"><div class="rz-card"><div class="rz-kv">${
            itens.map(([r, v]) => `<div class="rz-full"><small>${rzEsc(r)}</small><b style="font-weight:500;font-size:12.5px">${rzEsc(v)}</b></div>`).join('')
        }</div></div></div>`);
}

export function abrirInfoResultadoMensal() {
    const itens = [
        ['Resultado mês a mês', 'A diferença entre o que entrou (aluguéis recebidos e recebimentos lançados em categorias de receita) e o que saiu (despesas e tributos) em cada mês do ano escolhido no topo de Hoje. Repasses e venda de bem ficam fora do resultado.'],
        ['Como ler', 'O número em cima de cada coluna é o resultado do mês, na unidade escrita embaixo do título (R$ mil ou R$ mi). A coluna escura é o melhor mês; mês ainda por vir fica apagado.'],
        ['Coluna vermelha', 'Mês em que saiu mais dinheiro do que entrou (resultado negativo) — ela desce abaixo da linha do zero.'],
    ];
    abrirSheet(rzSheetCabecalho('Sobre o card Resultado mês a mês') +
        `<div class="rz-sh-b"><div class="rz-card"><div class="rz-kv">${
            itens.map(([r, v]) => `<div class="rz-full"><small>${rzEsc(r)}</small><b style="font-weight:500;font-size:12.5px">${rzEsc(v)}</b></div>`).join('')
        }</div></div></div>`);
}

export function abrirInfoContratosIndice() {
    const itens = [
        ['Contratos por índice', 'Quanto do aluguel mensal dos contratos ativos reajusta por cada índice (IPCA, IGP-M…). Mostra a exposição da carteira a cada índice.'],
        ['Reajuste médio ponderado', 'O acumulado de 12 meses de cada índice, pesado pelo aluguel dos contratos que usam esse índice.'],
        ['Indicadores e simuladores', 'Abre o detalhe dos indicadores, com o mês a mês, a sua carteira e o simulador de troca de índice.'],
    ];
    abrirSheet(rzSheetCabecalho('Sobre o card Contratos por índice') +
        `<div class="rz-sh-b"><div class="rz-card"><div class="rz-kv">${
            itens.map(([r, v]) => `<div class="rz-full"><small>${rzEsc(r)}</small><b style="font-weight:500;font-size:12.5px">${rzEsc(v)}</b></div>`).join('')
        }</div></div></div>`);
}

export function abrirInfoGraficoIndicador() {
    const itens = [
        ['Sua carteira × indicadores', 'Compara o resultado da carteira com até 2 índices no mesmo período, todos em base 100 — mostra se o patrimônio está rendendo acima ou abaixo de cada índice. Toque nos chips para escolher (começa com IPCA e IGP-M).'],
        ['Linhas tracejadas e cinza', 'Cada índice acumulado, mês a mês — só até o último mês já capturado do Banco Central; não projeta o que ainda não saiu. O número no fim da linha é a variação no ano.'],
        ['Limite da conta', 'O índice da carteira usa o patrimônio consolidado do período como referência (o banco não guarda o patrimônio mês a mês) — é uma aproximação da rentabilidade mensal, não uma conta exata mês a mês.'],
    ];
    abrirSheet(rzSheetCabecalho('Sobre o card Sua carteira × indicador') +
        `<div class="rz-sh-b"><div class="rz-card"><div class="rz-kv">${
            itens.map(([r, v]) => `<div class="rz-full"><small>${rzEsc(r)}</small><b style="font-weight:500;font-size:12.5px">${rzEsc(v)}</b></div>`).join('')
        }</div></div></div>`);
}

export function abrirInfoConcentracao() {
    const itens = [
        ['Dependência de locatário', 'Quanto do total recebido no ano vem de cada locatário — mostra se a carteira depende demais de poucos inquilinos.'],
        ['Barra de progresso', 'A fatia (%) que aquele locatário representa do total recebido no ano.'],
        ['Concentrada', 'Selo vermelho quando um único locatário responde por 30% ou mais do total recebido no ano — risco maior se ele atrasar ou sair.'],
        ['Outros N locatários', 'Os locatários menores, agrupados — nunca conta como risco, mesmo somados.'],
    ];
    abrirSheet(rzSheetCabecalho('Sobre o card Dependência de locatário') +
        `<div class="rz-sh-b"><div class="rz-card"><div class="rz-kv">${
            itens.map(([r, v]) => `<div class="rz-full"><small>${rzEsc(r)}</small><b style="font-weight:500;font-size:12.5px">${rzEsc(v)}</b></div>`).join('')
        }</div></div></div>`);
}

export function abrirInfoPerformanceGrid() {
    const itens = [
        ['Resultado líquido', 'Receita do ano menos despesas e tributos — o que sobrou de fato. Repasses e venda de bem ficam fora.'],
        ['Rentabilidade', 'O resultado do ano dividido pelo valor de mercado da carteira — some em Família.'],
        ['Receita do ano', 'Tudo o que foi efetivamente recebido no ano: aluguéis pagos e recebimentos lançados em categorias de receita.'],
        ['Patrimônio', 'Soma do valor de mercado dos ativos considerados neste recorte.'],
        ['Tempo médio alugado / vago', 'Média de dias que os imóveis passaram alugados e vagos no período.'],
        ['Tributos, Manutenção, Seguros', 'Total gasto no ano em cada categoria de despesa.'],
        ['Inadimplência', 'Total ainda em atraso, considerando os contratos deste recorte.'],
    ];
    abrirSheet(rzSheetCabecalho('Sobre o card Performance') +
        `<div class="rz-sh-b"><div class="rz-card"><div class="rz-kv">${
            itens.map(([r, v]) => `<div class="rz-full"><small>${rzEsc(r)}</small><b style="font-weight:500;font-size:12.5px">${rzEsc(v)}</b></div>`).join('')
        }</div></div></div>`);
}

function montarPerformanceGrid(perf) {
    if (!perf) return '';
    const kv = (r, v) => `<div><small>${r}</small><b>${v}</b></div>`;
    const familia = filtro.contexto === 'familia';
    const linhas = [
        kv('Resultado líquido', formatarMoedaBR(perf.resultado_liquido || 0, { semCentavos: true })),
        familia ? '' : kv('Rentabilidade', pctFmt(perf.rentabilidade_pct)),
        kv('Receita do ano', formatarMoedaBR(perf.receita_ano || 0, { semCentavos: true })),
        kv('Patrimônio', formatarPatrimonioCompacto(perf.patrimonio)),
        kv('Tempo médio alugado', perf.dias_alugado_medio != null ? `${Math.round(perf.dias_alugado_medio)} dias` : '—'),
        kv('Tempo médio vago', perf.dias_vago_medio != null ? `${Math.round(perf.dias_vago_medio)} dias` : '—'),
        kv('Tributos', formatarMoedaBR(perf.tributos || 0, { semCentavos: true })),
        kv('Manutenção', formatarMoedaBR(perf.manutencao || 0, { semCentavos: true })),
        kv('Seguros', formatarMoedaBR(perf.seguros || 0, { semCentavos: true })),
        kv('Inadimplência', formatarMoedaBR(perf.inadimplencia_valor || 0, { semCentavos: true })),
    ].filter(Boolean);
    return `<div class="rz-card">
        <div class="rz-card-h" style="justify-content:space-between"><b>Performance</b>${botaoInfoCard('abrirInfoPerformanceGrid()')}</div>
        <div class="rz-kv">${linhas.join('')}</div>
    </div>`;
}

// v1.9.0 (UX F1.4a, demanda c71f617c) — esqueleto no lugar de "Carregando…".
function rzSk(tipo, n) {
    return (typeof window !== 'undefined' && typeof window.rzSkeleton === 'function')
        ? window.rzSkeleton(tipo, n)
        : '<p class="rz-desc">Carregando…</p>';
}
