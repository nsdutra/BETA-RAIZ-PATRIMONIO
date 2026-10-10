// =====================================================================
// RAIZ PATRIMÔNIO — js/resultados.js
// VERSÃO: Beta v2.6.0 (10/10/2026 — demanda f3e6cd27)
// LINHAS: (ver versoes.json)
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
// Versão anterior: Beta v2.4.0
// -----------------------------------------------------------------
// NOVIDADES (Beta v2.4.0) — sessão 20261003-1707-ux-base; plano aprovado pelo Nicola 09/10 ("De acordo, tudo
//   numa entrega só"; gráficos "no modelo da McKinsey"):
//   — Gráficos de colunas no padrão executivo (PADRAO_RELATORIOS REL-13/23/25/50/52/53, referência McKinsey):
//     título que diz a conclusão, medida e unidade embaixo, valor em cima de cada coluna na unidade do
//     subtítulo, zero como base (mês negativo desce), colunas em cinza com um destaque só, mês por vir
//     apagado e a fonte embaixo. Vale para Resultado mês a mês, Reajustes no ano e Revisional/Renovação
//     (colunasExecutivasSvg).
//   — O card Indicadores sai de Resultados e vira "Indicadores de mercado" no chip Fique por dentro do Hoje
//     (renderIndicadoresMercado), em linhas: nome · mês · valor do mês · 12 meses. A leitura de
//     fn_indicadores_resumo sai de renderizarConteudo.
// Versão anterior: Beta v2.3.2
// -----------------------------------------------------------------
// NOVIDADES (Beta v2.3.1) — 07/10/2026, sessão 20261007-1721-rolo-changelog, demanda 2507d554 (VER-06, "de acordo"
//   do Nicola 07/10 17:21): SÓ CABEÇALHO — as versões além das 5 mais recentes rolaram
//   para o CHANGELOG_MODULOS.md. Nenhuma linha de código mudou (conferido token a token).
// Versão anterior: Beta v2.3.0
// -----------------------------------------------------------------
// NOVIDADES (Beta v2.3.0) — catálogo único, fatia 4b (sessão 20261006-2320-catalogo-f4b; fichas F-C8/F-C9
//   aprovadas pelo Nicola 06/10 23:16): card "Por grupo" logo abaixo do Resultado mês a mês — o ano aberto
//   pelo nível 1 da árvore (fn_resultado_por_grupo): Receitas, Despesas e, à parte, "Fora do resultado"
//   (repasses, venda de bem). Se a função falhar, só o card some; o resto da tela segue. Textos do ⓘ de
//   Resultado mês a mês e Performance atualizados (receita inclui os recebimentos lançados de categoria de
//   receita; o que está fora do resultado não entra). Sem style inline no código novo (REGRAS §17).
// --------------------------------------------------------------------------
// Versões anteriores (v2.2.0 … v2.2.0): CHANGELOG_MODULOS.md, na raiz do repositório — o
// gerar_versoes.py rola pra lá automaticamente tudo além das 5 versões
// mais recentes deste cabeçalho (VER-06).
export const VERSAO = '2.6.0';

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
const CONTEXTO_ROTULO = { tudo: 'Todos', comercial: 'Comercial', familia: 'Uso próprio' }; // v2.6.0 — uso, dentro de Patrimônio
// v2.6.0 (F20) — ramo do Hoje (ativo_tipos.ramo); Agro aparece travado até existir
const RAMO_ROTULO = { tudo: 'Tudo', patrimonio: 'Patrimônio', familia: 'Família' };
const ABRANGENCIA_ROTULO = { carteira: 'Carteira', empreendimento: 'Empreendimento', imovel: 'Imóvel' };
const NOMES_MES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
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
    if (opcoes && Object.prototype.hasOwnProperty.call(RAMO_ROTULO, opcoes.ramo)) filtro.ramo = opcoes.ramo; // v2.6.0
    if (filtro.ramo !== 'patrimonio') filtro.contexto = 'tudo'; // uso só existe dentro de Patrimônio
    filtro.abrangencia = 'carteira'; filtro.alvoId = null; filtro.alvoNome = null;
    heroi.innerHTML = filtro.ramo === 'familia' ? montarHeroiFamilia(null, true) : montarHeroi(null, null, true);
    // v2.6.0 — no ramo Família os cards de Resultados não aparecem (as funções ainda não recortam por ramo)
    cards.innerHTML = filtro.ramo === 'familia' ? '<div id="resultados-conteudo"></div>'
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
function montarHeroi(resumo, perf, carregando) {
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
    const celula = (r, v, neg) => `<div><small>${r}</small><b${neg ? ' class="rz-neg"' : ''}>${v}</b></div>`;
    const celulas = familia
        ? [celula('Inadimplência', tem ? moeda(inadimplencia) : traco, tem && Number(inadimplencia) > 0)]
        : [
            celula('Rentabilidade', tem ? pctBR(rentabilidade) : traco),
            celula('Ocupação', tem ? pctBR(ocupacao) : traco),
            celula('Inadimplência', tem ? moeda(inadimplencia) : traco, tem && Number(inadimplencia) > 0),
        ];
    const ativosTxt = totalAtivos == null ? '' : `${totalAtivos} ${Number(totalAtivos) === 1 ? 'ativo' : 'ativos'}`;
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
        <small>Patrimônio sob gestão</small>
        <b class="rz-heroi-pat">${tem ? formatarPatrimonioCompacto(patrimonio) : traco}</b>
        ${ativosTxt ? `<small>${ativosTxt}</small>` : ''}
        <div class="rz-heroi-res">
            <small>${resRotulo}</small><b${resNeg}>${resValor}</b>
            <div class="rz-heroi-3${celulas.length === 1 ? ' rz-um' : ''}">${celulas.join('')}</div>
        </div>
        ${seg}
    </div>`;
}

// v2.6.0 (F20) — ramo (Tudo · Patrimônio · Família · Agro em breve) e, só em Patrimônio, o uso
function segRamoUsoHtml() {
    const ramos = ['tudo', 'patrimonio', 'familia'].map(v =>
        `<button type="button" onclick="escolherGeralRamo('${v}')" class="${v === filtro.ramo ? 'rz-on' : ''}">${RAMO_ROTULO[v]}</button>`
    ).join('') + '<button type="button" class="rz-off" disabled title="Em breve">Agro</button>';
    const usos = filtro.ramo !== 'patrimonio' ? '' : ['tudo', 'comercial', 'familia'].map(v =>
        `<button type="button" onclick="escolherGeralUniverso('${v}')" class="${v === filtro.contexto ? 'rz-on' : ''}">${CONTEXTO_ROTULO[v]}</button>`
    ).join('');
    return `<div class="rz-seg rz-seg-4" role="group" aria-label="Ramo">${ramos}</div>`
        + (usos ? `<div class="rz-seg rz-seg-uso" role="group" aria-label="Uso">${usos}</div>` : '');
}

// v2.6.0 (F20) — herói do ramo Família: quantos cadastros (pessoas e pets não têm valor)
function montarHeroiFamilia(qtd, carregando) {
    const txt = qtd == null ? '—' : `${qtd} ${qtd === 1 ? 'cadastro' : 'cadastros'}`;
    return `<div class="rz-heroi"${carregando ? ' aria-busy="true"' : ''}>
        <small>Família</small>
        <b class="rz-heroi-pat">${txt}</b>
        <small>Pessoas e pets não têm valor: entram só na contagem.</small>
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
            { icone: 'users', titulo: 'Distribuição aos sócios', sub: socios.length ? `PDF por sócio · ${socios.length} sócio${socios.length > 1 ? 's' : ''}` : 'PDF por sócio', aoTocar: () => abrirSheetAcoes({ titulo: 'Distribuição aos sócios', sub: 'Escolha o sócio', acoes: socios.length ? socios.map(sc => ({ icone: 'user', titulo: sc, aoTocar: () => { if (typeof exportarRelatorioSocioPDF === 'function') exportarRelatorioSocioPDF(sc); } })) : [{ icone: 'info', titulo: 'Nenhum sócio com distribuição registrada', aoTocar: () => {} }] }) },
            { icone: 'folder-open', titulo: 'Ver todos os relatórios', sub: 'Catálogo completo e distribuição', aoTocar: () => switchTab('tab-relatorios-catalogo') },
        ]
    });
}

// ---------------------------------------------------------------------
// Conteúdo — Carteira / Empreendimento
// ---------------------------------------------------------------------
async function renderizarConteudo() {
    const alvo = document.getElementById('resultados-conteudo');
    if (!alvo) return;
    const minha = ++geracao; // v2.0.0
    if (filtro.ramo === 'familia') { // v2.6.0 (F20) — Família: só a contagem no herói
        const { count, error } = await dbAuth.from('cofre_ativos').select('id, ativo_tipos!inner(ramo)', { count: 'exact', head: true })
            .eq('cliente_id', CLIENTE_ID_SUPABASE).eq('status', 'ativo').eq('ativo_tipos.ramo', 'familia');
        if (minha !== geracao) return;
        if (error) console.warn('[resultados] contagem da família:', error.message);
        const heroiFam = document.getElementById('hoje-heroi-mount');
        if (heroiFam) heroiFam.innerHTML = montarHeroiFamilia(error ? null : (count || 0));
        alvo.innerHTML = '';
        if (typeof rzIcones === 'function') rzIcones();
        return;
    }
    const p_uso = CONTEXTO_USO[filtro.contexto];
    const nivel = filtro.abrangencia; // 'carteira' | 'empreendimento'
    const alvoId = filtro.abrangencia === 'empreendimento' ? filtro.alvoId : null;
    // v1.8.0 — cards de carteira alugada só fora de Família (Tudo e Comercial)
    const cardsLocacao = filtro.abrangencia === 'carteira' && filtro.contexto !== 'familia';

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
                ? dbAuth.rpc('fn_resumo_resultados', { p_cliente_id: CLIENTE_ID_SUPABASE, p_uso, p_ano: filtro.ano })
                : Promise.resolve({ data: null }),
            filtro.abrangencia === 'carteira'
                ? dbAuth.rpc('fn_performance_carteira', { p_cliente_id: CLIENTE_ID_SUPABASE, p_uso, p_ano: filtro.ano })
                : dbAuth.rpc('fn_performance_empreendimento', { p_empreendimento_id: alvoId, p_ano: filtro.ano, p_uso }),
            dbAuth.rpc('fn_resultado_mensal', { p_cliente_id: CLIENTE_ID_SUPABASE, p_ano: filtro.ano, p_nivel: nivel, p_id: alvoId, p_uso }),
            cardsLocacao
                ? dbAuth.rpc('fn_carteira_concentracao', { p_cliente_id: CLIENTE_ID_SUPABASE, p_ano: filtro.ano })
                : Promise.resolve({ data: [] }),
            cardsLocacao
                ? dbAuth.rpc('fn_carteira_reajustes_calendario', { p_cliente_id: CLIENTE_ID_SUPABASE, p_ano: filtro.ano, p_uso })
                : Promise.resolve({ data: [] }),
            // v1.1.0 — card novo, mesmo desenho do de reajustes, mas pelo
            // mês de TÉRMINO do contrato (fn_carteira_revisionais_*, nova).
            cardsLocacao
                ? dbAuth.rpc('fn_carteira_revisionais_calendario', { p_cliente_id: CLIENTE_ID_SUPABASE, p_ano: filtro.ano, p_uso })
                : Promise.resolve({ data: [] }),
            filtro.contexto === 'familia' ? Promise.resolve({ data: [] }) : lerSeriesComparacao(), // v2.5.0 — até 2 indicadores
            // v2.3.0 — abertura por grupo (nível 1 da árvore); erro aqui só esconde o card
            dbAuth.rpc('fn_resultado_por_grupo', { p_cliente_id: CLIENTE_ID_SUPABASE, p_ano: filtro.ano, p_nivel: nivel, p_id: alvoId, p_uso }),
            // v2.5.0 — contratos por índice; sem o código resultados.indicadores a função recusa e o card fica bloqueado
            cardsLocacao ? dbAuth.rpc('fn_carteira_indices_resumo', { p_cliente_id: CLIENTE_ID_SUPABASE }) : Promise.resolve({ data: null }),
        ]);
        if (minha !== geracao) return; // v2.0.0 — chegou um desenho mais novo
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
        if (heroiEl) heroiEl.innerHTML = montarHeroi(resumo, perf);
        alvo.innerHTML = [
            montarGraficoMensal(mensal), // v2.4.0 — Indicadores foi para o Fique por dentro (renderIndicadoresMercado)
            montarPorGrupo(porGrupo), // v2.3.0
            cardsLocacao ? montarContratosPorIndice(indicesR) : '', // v2.5.0
            montarGraficoIndicador(graficoIndicador),
            cardsLocacao ? montarConcentracao(concentracao) : '',
            cardsLocacao ? montarReajustesCalendario(reajustes) : '',
            cardsLocacao ? montarRevisionaisCalendario(revisionais) : '',
            filtro.contexto !== 'familia' ? montarPerformanceGrid(perf) : '', // v1.8.0
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
        return `<div class="rz-card">${cab}<div class="rz-empty"><div class="rz-ic"><svg data-lucide="trending-up"></svg></div><p>Sem índice de mercado disponível no momento.</p></div></div>`;
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
            ${chips}<p class="rz-desc rz-res-nota">Sem patrimônio ou resultado suficiente no período para montar a comparação.</p></div>`;
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
