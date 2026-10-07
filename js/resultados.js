// =====================================================================
// RAIZ PATRIMÔNIO — js/resultados.js
// VERSÃO: Beta v2.3.2 (07/10/2026 — demanda 2923ff4d)
// LINHAS: (ver versoes.json)
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
// Versão anterior: Beta v2.2.0 (04/10/2026 — demanda e42f649b)
// -----------------------------------------------------------------
// NOVIDADES (Beta v2.2.0) — frente 5, fatia 5B (sessão 20261004-1800-indicadores, "De acordo com
//   5B" do Nicola 04/10 22:06): o card Indicadores ganha "Ver todos", que carrega o módulo novo
//   js/indicadores.js (lazy) com Mês a mês · Sua carteira · Simulador. Sem o código
//   resultados.indicadores, o botão aparece desabilitado com cadeado e o motivo (ACE-04).
// Versão anterior: Beta v2.1.0 (04/10/2026 — demanda 557d3a6b)
// -----------------------------------------------------------------
// NOVIDADES (Beta v2.1.0) — frente 5, fatia 5A (sessão 20261004-1800-indicadores, "de acordo"
//   do Nicola 04/10 18:00 e 22:06): o card Indicadores passa dos 3 para os 6 indicadores
//   coletados (IPCA, IGP-M, INCC-DI, Selic, CDI, IVG-R), cada um com o valor do último mês
//   fechado, o mês de referência e o acumulado de 12 meses. O ⓘ abre um parágrafo por
//   indicador, lido do banco (indicador_series.explicacao, via fn_indicadores_resumo — fonte
//   única para app, bot e relatórios). Migration indicadores_resumo_seis_v1: IVG-R vira
//   variação e o mês em andamento (Selic/CDI provisórios) não entra. Texto do card a 12 px
//   (era 10,5 — UXR-31).
// Versão anterior: Beta v2.0.0 (04/10/2026 — demanda 217e3a38)
// -----------------------------------------------------------------
// NOVIDADES (Beta v2.0.0) — UX F2.1a (sessão 20261003-1707-ux-base, "Sim de acordo" do
//   Nicola 04/10 21:11; DIRETRIZES UXR-16 a 19): Resultados deixa de ser aba e passa a
//   morar em Hoje (antiga Visão Geral).
//   — Herói unificado (UXR-17) em #hoje-heroi-mount: Patrimônio sob gestão + nº de ativos,
//     Resultado do ano e Rentabilidade · Ocupação · Inadimplência, num bloco --pine só.
//     Ano (‹ 2026 ›) e contexto (Tudo · Comercial · Família) dentro do herói (UXR-18);
//     o contexto é o mesmo de Hoje inteiro (index.html, escolherGeralUniverso).
//   — Cards de Resultados em #hoje-resultados-mount com o título "Resultados · <ano>",
//     na ordem de sempre e com ⓘ (UXR-19). O bloco de KPIs sai (virou o herói).
//   — Sai a lupa e o sheet Filtros: abrangência (empreendimento · imóvel) não existe em
//     Hoje (UXR-18) — o imóvel tem Performance na própria ficha; empreendimento fica para
//     a ficha do empreendimento (demanda própria).
//   — Desenhos que se atropelam (trocar o contexto rápido) não sobrescrevem o mais novo.
// --------------------------------------------------------------------------
// Versões anteriores (v1.0.0 … v1.9.0): CHANGELOG_MODULOS.md, na raiz do repositório — o
// gerar_versoes.py rola pra lá automaticamente tudo além das 5 versões
// mais recentes deste cabeçalho (VER-06).

export const VERSAO = '2.3.2';

// ---------------------------------------------------------------------
// Estado do filtro (module-scoped — sobrevive entre renders porque o
// import dinâmico só roda uma vez por sessão de app, mesmo padrão do
// module cache usado por carregarImoveis()/carregarContratos()).
// ---------------------------------------------------------------------
const ANO_ATUAL = new Date().getFullYear();
let filtro = { ano: ANO_ATUAL, abrangencia: 'carteira', contexto: 'tudo', alvoId: null, alvoNome: null };
// rascunho editado dentro do sheet Filtros, só vira `filtro` em Aplicar
let rascunho = null;

const CONTEXTO_USO = { tudo: null, comercial: 'comercial', familia: 'nao_comercial' };
const CONTEXTO_ROTULO = { tudo: 'Tudo', comercial: 'Comercial', familia: 'Família' };
const ABRANGENCIA_ROTULO = { carteira: 'Carteira', empreendimento: 'Empreendimento', imovel: 'Imóvel' };
const NOMES_MES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

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
    filtro.abrangencia = 'carteira'; filtro.alvoId = null; filtro.alvoNome = null;
    heroi.innerHTML = montarHeroi(null, null, true);
    cards.innerHTML = `<h3 class="rz-plain-title">Resultados · ${filtro.ano}</h3><div id="resultados-conteudo">${rzSk('cards', 3)}</div>`;
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
    const seg = ['tudo', 'comercial', 'familia'].map(v =>
        `<button type="button" onclick="escolherGeralUniverso('${v}')" class="${v === filtro.contexto ? 'rz-on' : ''}">${CONTEXTO_ROTULO[v]}</button>`
    ).join('');

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
        <div class="rz-seg" role="group" aria-label="Contexto">${seg}</div>
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
        const [resumoR, perfR, mensalR, concR, reajR, revR, indR, graficoIndR, grupoR] = await Promise.all([
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
            filtro.contexto === 'familia' ? Promise.resolve({ data: [] }) : dbAuth.rpc('fn_indicadores_resumo'),
            filtro.contexto === 'familia' ? Promise.resolve({ data: [] }) : dbAuth.rpc('fn_carteira_indicador_series', { p_cliente_id: CLIENTE_ID_SUPABASE, p_ano: filtro.ano, p_codigo: 'ipca' }),
            // v2.3.0 — abertura por grupo (nível 1 da árvore); erro aqui só esconde o card
            dbAuth.rpc('fn_resultado_por_grupo', { p_cliente_id: CLIENTE_ID_SUPABASE, p_ano: filtro.ano, p_nivel: nivel, p_id: alvoId, p_uso }),
        ]);
        if (minha !== geracao) return; // v2.0.0 — chegou um desenho mais novo
        if (resumoR.error) throw resumoR.error;
        if (perfR.error) throw perfR.error;
        if (mensalR.error) throw mensalR.error;
        if (concR.error) throw concR.error;
        if (reajR.error) throw reajR.error;
        if (revR.error) throw revR.error;
        if (indR.error) throw indR.error;
        if (graficoIndR.error) throw graficoIndR.error;

        const resumo = Array.isArray(resumoR.data) ? resumoR.data[0] : resumoR.data;
        const perf = Array.isArray(perfR.data) ? perfR.data[0] : perfR.data;
        const mensal = mensalR.data || [];
        const concentracao = concR.data || [];
        const reajustes = reajR.data || [];
        const revisionais = revR.data || [];
        const indicadores = indR.data || [];
        ultimosIndicadores = indicadores; // v2.1.0 (5A) — alimenta o ⓘ
        const graficoIndicador = graficoIndR.data || [];
        if (grupoR.error) console.warn('[resultados] por grupo:', grupoR.error.message); // v2.3.0
        const porGrupo = grupoR.error ? [] : (grupoR.data || []);

        // v2.0.0 (UXR-17) — os números de cima vão para o herói de Hoje; os cards ficam abaixo
        const heroiEl = document.getElementById('hoje-heroi-mount');
        if (heroiEl) heroiEl.innerHTML = montarHeroi(resumo, perf);
        alvo.innerHTML = [
            montarCardIndicadores(indicadores),
            montarGraficoMensal(mensal),
            montarPorGrupo(porGrupo), // v2.3.0
            montarGraficoIndicador(graficoIndicador, 'ipca'),
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

function montarCardIndicadores(indicadores) {
    if (filtro.contexto === 'familia') return ''; // ESP §4.3 — não renderiza em Família
    // v1.3.0 (B1.2) — dado real (fn_indicadores_resumo, migration
    // mercado_reajuste_simulador_v1). Fallback defensivo abaixo (não deve
    // acontecer na prática: IPCA/IGP-M/Selic sempre voltam da função,
    // com acumulado_12m_pct eventualmente nulo se faltar histórico) —
    // mesmo texto de vazio honesto de antes, adaptado.
    if (!indicadores || !indicadores.length) {
        return `<div class="rz-card">
            <div class="rz-card-h" style="justify-content:space-between"><b>Indicadores</b>${botaoInfoCard('abrirInfoIndicadores()')}</div>
            <div class="rz-empty" style="padding:14px 8px">
                <div class="rz-ic"><svg data-lucide="trending-up"></svg></div>
                <p>Sem índice de mercado disponível no momento.</p>
            </div>
        </div>`;
    }
    // v2.1.0 (5A) — 6 indicadores: mês de referência, valor do mês e 12 meses.
    return `<div class="rz-card">
        <div class="rz-card-h" style="justify-content:space-between"><b>Indicadores</b>${botaoInfoCard('abrirInfoIndicadores()')}</div>
        <div class="rz-kv">${indicadores.map(ind => {
            const mes = ind.valor_mes_pct == null ? null : Number(ind.valor_mes_pct);
            return `<div>
                <small style="display:flex;justify-content:space-between;gap:6px"><span>${rzEsc(NOME_CURTO_INDICADOR[ind.codigo] || ind.nome)}</span><span>${rzEsc(competenciaCurta(ind.competencia_mes))}</span></small>
                <b style="${mes != null && mes < 0 ? 'color:var(--danger)' : ''}">${pctSinal(mes)}</b>
                <span style="display:block;font-size:12px;color:var(--muted)">${pctSinal(ind.acumulado_12m_pct)} em 12 meses</span>
            </div>`;
        }).join('')}</div>
        ${botaoVerTodosIndicadores()}
    </div>`;
}

function montarGraficoMensal(mensal) {
    if (!mensal || !mensal.length) return `<div class="rz-card"><div class="rz-card-h" style="justify-content:space-between"><b>Resultado mês a mês</b>${botaoInfoCard('abrirInfoResultadoMensal()')}</div><p class="rz-desc" style="margin-top:8px">Sem lançamentos no período.</p></div>`;
    const valores = mensal.map(m => Number(m.resultado) || 0);
    const max = Math.max(...valores, 0);
    const min = Math.min(...valores, 0);
    const amplitude = (max - min) || 1;
    const iMax = valores.indexOf(max), iMin = valores.indexOf(min);
    const barras = mensal.map((m, i) => {
        const alturaPct = Math.max(2, ((valores[i] - min) / amplitude) * 100);
        const neg = valores[i] < 0;
        const rotulo = (i === iMax || i === iMin) ? `<span style="position:absolute;top:-16px;left:0;right:0;text-align:center;font-size:9.5px;font-weight:700;color:var(--muted)">${formatarMoedaBR(valores[i], { semCentavos: true }).replace('R$', '').trim()}</span>` : '';
        return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;position:relative">
            ${rotulo}
            <div title="${NOMES_MES[m.mes - 1]}: ${formatarMoedaBR(valores[i], { semCentavos: true })}" style="width:70%;height:${alturaPct}%;border-radius:3px 3px 0 0;background:${neg ? 'var(--danger)' : 'var(--sprout)'}"></div>
            <small style="font-size:9.5px;color:var(--muted);margin-top:3px">${NOMES_MES[m.mes - 1]}</small>
        </div>`;
    }).join('');
    // v1.6.0 (demanda 8d5585a3 — achado do Nicola, "no card resultado mes a
    // mes, retirar a linha pontilhada do meio das barras") — a linha
    // tracejada da média do período (e a legenda que a v1.5.0/8ac32623
    // tinha acrescentado pra explicá-la) saíram; os números de topo (maior/
    // menor do ano) continuam sendo a referência visual do card.
    return `<div class="rz-card">
        <div class="rz-card-h" style="justify-content:space-between"><b>Resultado mês a mês</b>${botaoInfoCard('abrirInfoResultadoMensal()')}</div>
        <div style="height:130px;display:flex;align-items:flex-end;gap:3px;position:relative;margin-top:14px">
            ${barras}
        </div>
    </div>`;
}

// v1.3.0 (B1.2) — dado real (fn_carteira_indicador_series). SVG desenhado
// à mão (mesmo espírito de montarGraficoMensal, que já monta barras em
// divs cruas) — sem lib nova, sem componente .rz-* novo (CAN-03). Base
// 100, eixo único (ESP §13.1 R9); linha do indicador tracejada/cinza com
// rótulo direto (R10), corta no último mês com dado capturado (não
// interpola nem projeta o que ainda não foi lido do BC).
function montarGraficoIndicador(serie, codigoIndicador) {
    if (filtro.contexto === 'familia') return ''; // ESP §4.3
    const nomeIndicador = NOME_CURTO_INDICADOR[codigoIndicador] || (codigoIndicador || '').toUpperCase();
    if (!serie || serie.length < 2) {
        return `<div class="rz-card">
            <div class="rz-card-h" style="justify-content:space-between"><b>Sua carteira × indicador</b>${botaoInfoCard('abrirInfoGraficoIndicador()')}</div>
            <p class="rz-desc" style="margin-top:8px">Sem patrimônio ou resultado suficiente no período pra montar a comparação com ${rzEsc(nomeIndicador)}.</p>
        </div>`;
    }
    const valores = serie.flatMap(p => [p.carteira_indice, p.indicador_indice]).filter(v => v != null).map(Number);
    const max = Math.max(...valores), min = Math.min(...valores);
    const amplitude = (max - min) || 1;
    const W = 300, H = 108, PAD = 4;
    const passo = (W - PAD * 2) / (serie.length - 1);
    const x = (i) => PAD + i * passo;
    const y = (v) => H - 14 - ((Number(v) - min) / amplitude) * (H - 14 - PAD);

    const pontosCarteira = serie.map((p, i) => `${x(i).toFixed(1)},${y(p.carteira_indice).toFixed(1)}`).join(' ');
    // a série do indicador só corta no FIM (mês ainda não capturado) — não
    // tem buraco no meio, então pega os pontos válidos a partir do início.
    let ultimoIndicador = -1;
    const pontosIndicador = [];
    for (let i = 0; i < serie.length; i++) {
        if (serie[i].indicador_indice == null) break;
        pontosIndicador.push(`${x(i).toFixed(1)},${y(serie[i].indicador_indice).toFixed(1)}`);
        ultimoIndicador = i;
    }
    const iUltimoCarteira = serie.length - 1;
    const rotuloCarteira = `<text x="${(x(iUltimoCarteira) - 2).toFixed(1)}" y="${(y(serie[iUltimoCarteira].carteira_indice) - 4).toFixed(1)}" font-size="8" text-anchor="end" fill="var(--sprout)" font-weight="700">Sua carteira</text>`;
    const rotuloIndicador = ultimoIndicador >= 0
        ? `<text x="${(x(ultimoIndicador) - 2).toFixed(1)}" y="${(y(serie[ultimoIndicador].indicador_indice) + 10).toFixed(1)}" font-size="8" text-anchor="end" fill="var(--muted)" font-weight="700">${rzEsc(nomeIndicador)}</text>`
        : '';
    const rotuloMesInicio = `<text x="${x(0).toFixed(1)}" y="${H - 2}" font-size="8" fill="var(--muted)">${NOMES_MES[(serie[0].mes || 1) - 1]}</text>`;
    const rotuloMesFim = `<text x="${x(iUltimoCarteira).toFixed(1)}" y="${H - 2}" font-size="8" text-anchor="end" fill="var(--muted)">${NOMES_MES[(serie[iUltimoCarteira].mes || 12) - 1]}</text>`;

    return `<div class="rz-card">
        <div class="rz-card-h" style="justify-content:space-between"><b>Sua carteira × indicador</b>${botaoInfoCard('abrirInfoGraficoIndicador()')}</div>
        <svg viewBox="0 0 ${W} ${H}" style="width:100%;height:118px;margin-top:6px" preserveAspectRatio="none">
            <polyline points="${pontosCarteira}" fill="none" stroke="var(--sprout)" stroke-width="2" vector-effect="non-scaling-stroke"/>
            ${pontosIndicador.length > 1 ? `<polyline points="${pontosIndicador.join(' ')}" fill="none" stroke="var(--muted)" stroke-width="1.6" stroke-dasharray="4 3" vector-effect="non-scaling-stroke"/>` : ''}
            ${rotuloCarteira}
            ${rotuloIndicador}
            ${rotuloMesInicio}
            ${rotuloMesFim}
        </svg>
        <p class="rz-desc" style="margin-top:2px">Base 100 no início do período · ${rzEsc(nomeIndicador)} até o último mês já capturado do Banco Central.</p>
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
function montarCalendario12Meses(meses, { titulo, classeBarra, infoOnclick }) {
    const total = meses.reduce((s, m) => s + Number(m.valor_total || 0), 0);
    const max = Math.max(...meses.map(m => Number(m.valor_total || 0)), 0) || 1;
    const alerta = meses.find(m => m.concentrado);
    const barras = Array.from({ length: 12 }, (_, i) => {
        const m = meses.find(mm => mm.mes === i + 1) || { mes: i + 1, valor_total: 0, qtd_contratos: 0, concentrado: false };
        const alturaPct = Math.max(2, (Number(m.valor_total) / max) * 100);
        return `<div class="${classeBarra}" data-mes="${m.mes}" style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;cursor:${Number(m.valor_total) > 0 ? 'pointer' : 'default'}">
            <div style="width:70%;height:${alturaPct}%;border-radius:3px 3px 0 0;background:${m.concentrado ? 'var(--warning)' : 'var(--sprout)'}"></div>
            <small style="font-size:9px;color:var(--muted);margin-top:2px">${m.qtd_contratos || ''}</small>
            <small style="font-size:9.5px;color:var(--muted)">${NOMES_MES[i]}</small>
        </div>`;
    }).join('');
    const nota = alerta ? `<p class="rz-desc" style="margin-top:8px;color:var(--warning)">${NOMES_MES[alerta.mes - 1]} concentra ${formatarMoedaBR(alerta.valor_total, { semCentavos: true })} dos ${formatarMoedaBR(total, { semCentavos: true })} do ano.</p>` : '';
    return `<div class="rz-card">
        <div class="rz-card-h" style="justify-content:space-between"><b>${titulo}</b>${botaoInfoCard(infoOnclick)}</div>
        <div style="height:110px;display:flex;align-items:flex-end;gap:3px;margin-top:10px">${barras}</div>
        ${nota}
    </div>`;
}

function montarReajustesCalendario(meses) {
    return montarCalendario12Meses(meses, { titulo: 'Reajustes no ano', classeBarra: 'rz-res-barra-mes', infoOnclick: 'abrirInfoReajustes()' });
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
    return montarCalendario12Meses(meses, { titulo: 'Revisional / Renovação', classeBarra: 'rz-res-barra-revisional', infoOnclick: 'abrirInfoRevisionais()' });
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
function botaoVerTodosIndicadores() {
    const pode = typeof podeUsar === 'function' ? podeUsar('resultados.indicadores') : true;
    if (pode === false) {
        return `<button type="button" disabled title="Disponível nos planos com Resultados" style="display:flex;align-items:center;justify-content:center;gap:6px;width:100%;margin-top:12px;padding-top:12px;border:0;border-top:1px solid var(--line);background:none;color:var(--muted);font-weight:600;font-size:14px;min-height:44px"><svg data-lucide="lock" style="width:14px;height:14px"></svg>Ver todos — disponível nos planos com Resultados</button>`;
    }
    return `<button type="button" onclick="abrirIndicadores()" style="display:flex;align-items:center;justify-content:center;gap:4px;width:100%;margin-top:12px;padding-top:12px;border:0;border-top:1px solid var(--line);background:none;color:var(--sprout);font-weight:600;font-size:14px;min-height:44px">Ver todos<svg data-lucide="chevron-right" style="width:16px;height:16px"></svg></button>`;
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
        ['Barra vermelha', 'Mês em que saiu mais dinheiro do que entrou (resultado negativo).'],
        ['Números no topo', 'O maior e o menor resultado do ano, em destaque.'],
    ];
    abrirSheet(rzSheetCabecalho('Sobre o card Resultado mês a mês') +
        `<div class="rz-sh-b"><div class="rz-card"><div class="rz-kv">${
            itens.map(([r, v]) => `<div class="rz-full"><small>${rzEsc(r)}</small><b style="font-weight:500;font-size:12.5px">${rzEsc(v)}</b></div>`).join('')
        }</div></div></div>`);
}

export function abrirInfoGraficoIndicador() {
    const itens = [
        ['Sua carteira × indicador', 'Compara o resultado da carteira com o IPCA no mesmo período, os dois em base 100 — mostra se o patrimônio está rendendo acima ou abaixo do índice.'],
        ['Linha tracejada e cinza', 'O IPCA acumulado, mês a mês — só até o último mês já capturado do Banco Central; não projeta o que ainda não saiu.'],
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
