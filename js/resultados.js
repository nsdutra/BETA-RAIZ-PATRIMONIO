// =====================================================================
// RAIZ PATRIMÔNIO — js/resultados.js
// VERSÃO: Beta v1.8.1 (25/09/2026 — demanda 95d4009a)
// LINHAS: (ver versoes.json)
// -----------------------------------------------------------------
// NOVIDADES (Beta v1.8.1) — demanda 95d4009a:
//   — fn_performance_empreendimento agora recebe p_uso (mesmo filtro que
//     fn_performance_carteira já usava) — visão por empreendimento passa
//     a respeitar o filtro Comercial/Residencial/Tudo em vez de sempre
//     trazer a carteira toda; rentabilidade_pct some quando uso =
//     'nao_comercial', igual ao que a carteira já fazia (DB corrigida
//     antes, nesta rodada só o front passa a mandar o parâmetro).
// -----------------------------------------------------------------
// NOVIDADES (Beta v1.8.0) — pedido do Nicola (23/09, 13:01): filtrando só
// Família, os cards Dependência de locatário, Reajustes, Revisional/Renovação
// e Performance não fazem sentido (são de carteira alugada) — saem da tela e
// as 3 consultas deles nem rodam. Em Tudo e Comercial continuam iguais.
// NOVIDADES (Beta v1.7.0) — demanda 43448a36 (teste reprovado pelo Nicola
// em 23/09, Albuquerque): em Família o cartão "Ativos em uso" ficava sempre
// "—" (ocupação só existe para long stay) e dava a impressão de que os
// ativos sem aluguel (terreno, carros, jet-ski) estavam fora do recorte.
// Agora mostra "Ativos" com a QUANTIDADE do recorte — o mesmo universo do
// Patrimônio e da Visão Geral.
// NOVIDADES (Beta v1.6.0) — demanda 8d5585a3 (achado do Nicola):
//   — Todo valor em R$ exibido nesta tela (formatarMoedaBR) passa a usar
//     `{ semCentavos: true }` — sem casas decimais. formatarMoedaBR() em
//     si ganhou esse 2º parâmetro opcional (index.html), default
//     inalterado, pra não afetar nenhuma das outras telas que já a usam
//     (regra DESIGN_SYSTEM §2: valor monetário SEMPRE via
//     formatarMoedaBR(), nunca .toFixed(2) — a variação fica dentro da
//     função, nunca bypassada).
//   — "Resultado mês a mês": removida a linha tracejada da média do
//     período e a legenda que a explicava (v1.5.0) — os números de
//     maior/menor no topo das barras continuam.
// -----------------------------------------------------------------
// NOVIDADES (Beta v1.5.0) — demanda 8ac32623 (achado do Nicola em revisão
// de telas, 21/09/2026):
//   — Patrimônio (card de KPIs e card Performance) passa a mostrar em
//     formato compacto ("R$ 41,9 mi"), reusando formatarValorCompacto que
//     a Visão Geral (index.html) já usa — mesmo formato em vez de um 2º
//     jeito de abreviar dinheiro (CAN-03).
//   — 4ª caixa de KPI: Inadimplência (valor em atraso no período) — opção
//     escolhida pelo Nicola entre as apresentadas (pergunta de múltipla
//     escolha). Mesmo campo inadimplencia_valor que o card Performance já
//     mostrava mais abaixo — fonte única.
//   — "Resultado mês a mês": legenda nova pra linha tracejada (média do
//     período), que antes só era explicada no Sheet do ícone (i).
// -----------------------------------------------------------------
// NOVIDADES (Beta v1.4.0):
//   — resetarResultadosParaAbaInicial() nova (demanda 60284322 — "navegação
//     por rodapé sempre reseta a aba", achado do Nicola em revisão de
//     telas): antes, o filtro aplicado (ano/abrangência/contexto/alvo)
//     ficava preso entre trocas de aba pelo rodapé — voltar pra Resultados
//     depois de ir noutro empreendimento/ano continuava mostrando o
//     último filtro escolhido, não o padrão (Carteira, ano corrente,
//     Tudo). Chamada por index.html (irParaAbaRodape) antes de
//     switchTab('tab-relatorios'); só reseta o estado — quem redesenha é
//     o gancho que o próprio switchTab já dispara.
// -----------------------------------------------------------------
// NOVIDADES (Beta v1.3.0):
//   — Card "Indicadores" e gráfico "Sua carteira × indicador" saem do
//     estado vazio (que dizia "a captura automática ainda não foi
//     construída") e passam a mostrar dado real: a B1.1 (22/09/2026,
//     mesma rodada) já capturou IPCA/IGP-M/Selic/IVG-R/INCC-DI/CDI do
//     BCB SGS (migration mercado_reajuste_simulador_v1 adiciona as
//     funções de leitura — fn_indicadores_resumo, fn_carteira_
//     indicador_series — este arquivo só passa a chamá-las).
//   — Card Indicadores: IPCA/IGP-M/Selic, acumulado 12 meses (mesmos 3
//     nomeados no texto que já existia aqui).
//   — Gráfico "Sua carteira × indicador": base 100, eixo único (ESP
//     §13.1 R9), comparando com o IPCA (índice mais comum nos contratos
//     cadastrados — decisão revisável, mesmo padrão de "propor e
//     documentar" da R.4); linha do indicador tracejada/cinza com
//     rótulo direto (R10), corta no último mês já capturado — não
//     inventa valor futuro. Fórmula documentada no changelog da
//     migration (fn_carteira_indicador_series): índice da carteira usa
//     o patrimônio do ano como referência fixa (o banco não guarda
//     patrimônio mês a mês) — mesma limitação já assumida no fator de
//     ocupação da R.4.
//   — Escopo desta entrega (ver ENTREGA_20260922_indicadoresSimuladorB1_2.md
//     §3): só resultados.js (Card Indicadores + gráfico, exatamente o
//     que a B1.2 nomeia como "Arquivos do produto") e o bloco "Pelo
//     contrato" da ficha do contrato (contratos.js, chip Renovação —
//     simulador pelo índice do contrato). O bloco "Pelo mercado" (faixa
//     estimada/confiança/situação) e "✨ Negociar acima do índice" NÃO
//     entram aqui — dependem de uma fonte de dado de mercado comparável
//     que ainda não existe (registrado como ideia de produto separada).
// -----------------------------------------------------------------
// NOVIDADES (Beta v1.2.0):
//   — Ícone (i) (mesmo botão/Sheet dos 2 cards de calendário, entrega
//     anterior) agora em TODOS os cards da tela: Indicadores, Resultado
//     mês a mês, Sua carteira × indicador, Dependência de locatário,
//     Performance — 5 nomes novos exportados (abrirInfoIndicadores,
//     abrirInfoResultadoMensal, abrirInfoGraficoIndicador,
//     abrirInfoConcentracao, abrirInfoPerformanceGrid) + bridge em
//     index.html. Botão extraído em botaoInfoCard() (era HTML duplicado
//     em cada função de card) — Reajustes/Revisionais passam a usar o
//     mesmo helper, sem mudança de comportamento. Não entra no bloco de
//     KPIs (.rz-kpis): não é `.rz-card` na anatomia do DESIGN_SYSTEM
//     (§5) — só os cards de verdade ganham o ícone.
// -----------------------------------------------------------------
// NOVIDADES (Beta v1.1.0):
//   — BUG REAL corrigido: chip de ano (Período) nunca marcava depois do
//     1º clique — onclick gerado por template string sempre manda texto
//     ('2026'), enquanto o padrão nascia number; escolherResultadosFiltro
//     agora força Number() só pro grupo 'ano'.
//   — Layout corrigido: linhas de "Dependência de locatário" quebravam
//     nome E valor quando o locatário tinha nome longo (faltava
//     flex:1;min-width:0 no nome e flex:none;white-space:nowrap no
//     valor — mesmo mecanismo que .rz-row .rz-tx/.rz-rt já usam no
//     resto do app).
//   — "Reajustes no ano" corrigido: a âncora do mês era o ÚLTIMO evento
//     de reajuste/renovação em historico_contrato, o que fazia o mês
//     "andar" ano a ano — agora é sempre o mês de aniversário da
//     ASSINATURA (con.inicio), fixo (migration
//     resultados_reajustes_revisionais_v1).
//   — Card novo "Revisional / Renovação": mesmo desenho do calendário
//     de reajustes (12 barras, por VALOR, mês concentra ≥25% = warning),
//     mas pelo mês de TÉRMINO do contrato (fn_carteira_revisionais_
//     calendario/fn_carteira_revisionais_mes, funções novas) — conceito
//     distinto de reajuste anual por índice, pedido explícito do Nicola.
//   — Os dois cards (Reajustes, Revisional/Renovação) ganham ícone (i)
//     no cabeçalho — abre sheet explicando os conceitos e métricas do
//     card, mesmo padrão de explicarStatusConciliacao() (financeiro.js).
// -----------------------------------------------------------------
// Tela nova de Resultados (ESP_RESULTADOS_MERCADO_FISCAL §4, REGRAS §13):
// "Resultados só mostra performance" — sem seletor, sem segmento, sem
// chip de tela; todo recorte (Período · Abrangência · Contexto) virou
// filtro dentro da lupa. Fatia lazy (UI-05): não chama nenhum
// carregar*Supabase — só dbAuth.rpc(fn_*) direto (mesmo padrão que
// montarResumoResultados()/renderRelatorios() já usavam no index.html)
// e globais compartilhados do <script> clássico (dbAuth,
// CLIENTE_ID_SUPABASE, mostrarToast, abrirSheet, abrirSheetAcoes,
// fecharSheet, rzSheetCabecalho, rzEsc, rzIcones, formatarMoedaBR,
// formatarDataBR, switchTab, empreendimentosCadastrados,
// abrirFichaContrato, abrirFichaAtivoNoChip, podeUsar,
// baixarRelatorioPdfLocal, exportarRelatorioSocioPDF, repasses).
//
// NOVIDADES (Beta v1.0.0):
//   — Cabeçalho descrição + lupa (Filtros) + Exportar, sem nenhum
//     controle fixo na tela (R1/R2 do §13.1 da ESP).
//   — Sheet Filtros: Período (2024·2025·2026) · Abrangência
//     (Carteira·Empreendimento·Imóvel) · Contexto (Tudo·Comercial·
//     Família) — três grupos independentes, Aplicar/Limpar.
//   — Resumo do filtro em texto abaixo do cabeçalho (nunca só a cor da
//     lupa como pista).
//   — Conteúdo (abrangência Carteira/Empreendimento): KPIs do período →
//     Indicadores → Resultado mês a mês (gráfico de barras) → Sua
//     carteira × indicador (gráfico) → Dependência de locatário →
//     Reajustes no ano (calendário de 12 barras, por VALOR) →
//     Performance (grid de 10 campos, fn_performance_carteira nova
//     desta entrega ou fn_performance_empreendimento já existente).
//   — Abrangência Imóvel não renderiza nada aqui: aplica e navega direto
//     pra ficha do ativo, chip Performance (§4.2 da ESP).
//   — Card Indicadores e gráfico "carteira × indicador" nascem no lugar
//     certo (posição, regra de sumir em Família) mas em ESTADO VAZIO
//     HONESTO: não existe hoje nenhuma fonte real de índice de mercado
//     no banco (indicador_series/valores só nascem na Fase B1, que não
//     é pré-requisito de A.3 — confirmado ao vivo nesta sessão: nem
//     essas tabelas nem nada mais simples existem). Decisão registrada
//     na demanda `45cc9f88` — fecha quando B1.2 entregar dado real (o
//     próprio PLANO já antecipa isso: "já com o lugar certo desde A.3
//     — só passa a ter dado real").
//   — Contexto Família: sem rentabilidade, sem card Indicadores, sem
//     gráfico de comparação — regra vem do banco (fn_resumo_resultados/
//     fn_performance_carteira devolvem NULL nesses campos com
//     p_uso='nao_comercial'), a tela só não renderiza o que vier nulo.
//   — "Reajustes no ano": toque na barra abre sheet com os contratos do
//     mês (fn_carteira_reajustes_mes); toque na linha abre a ficha do
//     contrato (abrirFichaContrato) — o chip Renovação próprio (ESP §7)
//     ainda não existe (é a Entrega A.6, adiante nesta fila), então por
//     ora a ficha abre no chip padrão; navegação já fica pronta pra
//     quando A.6 entregar o chip.
//   — "Dependência de locatário": até 6 barras + "Outros N locatários"
//     agregado sempre neutro (nunca conta como risco, ESP §4.6).
//   — Gráficos usam só tokens de cor já existentes (--sprout/--danger/
//     --warning/--sage) e a única dimensão em `style=""` é a geometria
//     de dado (altura/largura da barra) — não há como expressar um
//     valor contínuo numa classe `rz-*` fixa; zero classe/token novo no
//     DESIGN_SYSTEM (checklist §17 do REGRAS).
// =====================================================================

export const VERSAO = '1.8.1';

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

function filtroForaDoPadrao() {
    return filtro.ano !== ANO_ATUAL || filtro.abrangencia !== 'carteira' || filtro.contexto !== 'tudo';
}

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
// Boot — chamado por switchTab('tab-relatorios') via carregarResultados()
// (bridge em index.html, mesmo desenho de carregarImoveis/Contratos).
// ---------------------------------------------------------------------
export async function renderResultados() {
    const mount = document.getElementById('resultados-novo-mount');
    if (!mount || !CLIENTE_ID_SUPABASE) return;

    if (filtro.abrangencia === 'imovel') {
        // Não deveria sobreviver — aplicar filtro com Imóvel já navega
        // embora (abrirResultadosFiltroAplicar). Defensivo: volta pro
        // padrão se alguém chegar aqui vindo de outro estado salvo.
        filtro = { ano: ANO_ATUAL, abrangencia: 'carteira', contexto: 'tudo', alvoId: null, alvoNome: null };
    }

    mount.innerHTML = montarCabecalho() + `<div id="resultados-conteudo"><p class="text-xs text-slate-400 text-center py-6">Carregando resultados...</p></div>`;
    if (typeof rzIcones === 'function') rzIcones();

    await renderizarConteudo();
}

function montarCabecalho() {
    const dot = filtroForaDoPadrao() ? '<span class="rz-dot rz-warn"></span>' : '';
    const alvo = filtro.alvoNome ? ` · ${rzEsc(filtro.alvoNome)}` : '';
    const resumoTxto = `${filtro.ano} · ${ABRANGENCIA_ROTULO[filtro.abrangencia]}${alvo} · ${CONTEXTO_ROTULO[filtro.contexto]}`;
    return `
        <div class="rz-tabhead">
            <p>Performance da carteira: resultado, ocupação e risco.</p>
            <button id="res-lupa" onclick="abrirResultadosFiltros()" class="rz-ico-btn" aria-label="Filtros">
                <svg data-lucide="search"></svg>${dot}
            </button>
            <button onclick="abrirResultadosExportar()" class="rz-ico-btn" aria-label="Exportar">
                <svg data-lucide="share"></svg>
            </button>
        </div>
        <div class="rz-chips" style="margin-top:-6px">
            <span class="rz-chip">${rzEsc(resumoTxto)}</span>
        </div>
    `;
}

// ---------------------------------------------------------------------
// Sheet Filtros
// ---------------------------------------------------------------------
export function abrirResultadosFiltros() {
    rascunho = { ...filtro };
    abrirSheet(rzSheetCabecalho('Filtros', null) + `<div class="rz-sh-b" id="res-filtros-corpo">${montarCorpoFiltros()}</div>${montarRodapeFiltros()}`);
}

function chipOpcao(grupo, valor, rotulo, atual) {
    return `<button class="rz-chip${valor === atual ? ' rz-on' : ''}" onclick="escolherResultadosFiltro('${grupo}','${valor}')">${rzEsc(rotulo)}</button>`;
}

function montarCorpoFiltros() {
    const r = rascunho;
    let alvoPicker = '';
    if (r.abrangencia === 'empreendimento') {
        const lista = (typeof empreendimentosCadastrados !== 'undefined' ? empreendimentosCadastrados : []) || [];
        alvoPicker = `<div class="rz-group">Qual empreendimento</div>` + (lista.length
            ? `<div class="rz-card rz-list">${lista.map(e => `<div class="rz-row rz-link" onclick="escolherResultadosAlvo('${e.id}','${rzEsc(e.nome).replace(/'/g, "\\'")}')"><div class="rz-tx"><b>${rzEsc(e.nome)}</b></div>${r.alvoId === e.id ? '<svg data-lucide="check" style="color:var(--sprout)"></svg>' : ''}</div>`).join('')}</div>`
            : `<p class="rz-desc">Nenhum empreendimento cadastrado ainda.</p>`);
    } else if (r.abrangencia === 'imovel') {
        const lista = (typeof estadoAtivosParaFiltro === 'function' ? estadoAtivosParaFiltro() : []) || [];
        alvoPicker = `<div class="rz-group">Qual imóvel</div>` + (lista.length
            ? `<div class="rz-card rz-list">${lista.map(a => `<div class="rz-row rz-link" onclick="escolherResultadosAlvo('${a.id}','${rzEsc(a.nome).replace(/'/g, "\\'")}')"><div class="rz-tx"><b>${rzEsc(a.nome)}</b></div>${r.alvoId === a.id ? '<svg data-lucide="check" style="color:var(--sprout)"></svg>' : ''}</div>`).join('')}</div>`
            : `<p class="rz-desc">Nenhum imóvel cadastrado ainda.</p>`);
    }
    return `
        <div class="rz-group">Período</div>
        <div class="rz-chips">${[ANO_ATUAL - 2, ANO_ATUAL - 1, ANO_ATUAL].map(a => chipOpcao('ano', a, String(a), r.ano)).join('')}</div>
        <div class="rz-group">Abrangência</div>
        <div class="rz-chips">${['carteira', 'empreendimento', 'imovel'].map(v => chipOpcao('abrangencia', v, ABRANGENCIA_ROTULO[v], r.abrangencia)).join('')}</div>
        <div id="res-filtros-alvo">${alvoPicker}</div>
        <div class="rz-group">Contexto</div>
        <div class="rz-chips">${['tudo', 'comercial', 'familia'].map(v => chipOpcao('contexto', v, CONTEXTO_ROTULO[v], r.contexto)).join('')}</div>
    `;
}

function montarRodapeFiltros() {
    return `<div class="rz-sh-f">
        <button class="rz-btn rz-btn-3" onclick="limparResultadosFiltros()">Limpar</button>
        <button class="rz-btn rz-btn-1" onclick="aplicarResultadosFiltros()">Aplicar</button>
    </div>`;
}

function reescreverCorpoFiltros() {
    const corpo = document.getElementById('res-filtros-corpo');
    if (corpo) corpo.innerHTML = montarCorpoFiltros();
    if (typeof rzIcones === 'function') rzIcones();
}

export function escolherResultadosFiltro(grupo, valor) {
    if (!rascunho) rascunho = { ...filtro };
    // BUG REAL (achado pelo Nicola, 21/09/2026): o onclick é HTML gerado
    // por template string — `${valor}` sempre vira texto no atributo,
    // então um clique no chip de ano manda '2026' (string) pra cá, mas o
    // padrão do filtro (ANO_ATUAL) é number. chipOpcao() compara com
    // === : depois do 1º clique em qualquer ano, nenhum chip nunca mais
    // batia (number !== string), o ano ficava "sem marcação" pra sempre
    // (mesmo quando o valor aplicado era o certo). Só 'ano' precisa de
    // Number — os outros grupos (abrangencia/contexto) já nascem string
    // dos dois lados (padrão E clique), nunca tiveram esse problema.
    rascunho[grupo] = grupo === 'ano' ? Number(valor) : valor;
    if (grupo === 'abrangencia') rascunho.alvoId = null, rascunho.alvoNome = null;
    reescreverCorpoFiltros();
}

export function escolherResultadosAlvo(id, nome) {
    if (!rascunho) return;
    rascunho.alvoId = id;
    rascunho.alvoNome = nome;
    reescreverCorpoFiltros();
}

export function limparResultadosFiltros() {
    rascunho = { ano: ANO_ATUAL, abrangencia: 'carteira', contexto: 'tudo', alvoId: null, alvoNome: null };
    reescreverCorpoFiltros();
}

// v1.4.0 (22/09/2026, demanda 60284322 — "navegação por rodapé sempre
// reseta a aba") — diferente de limparResultadosFiltros() (que só mexe no
// RASCUNHO dentro do sheet Filtros), esta reseta o filtro JÁ APLICADO
// (`filtro`, module-scoped, sobrevive entre trocas de aba — ver comentário
// da declaração acima). Chamada por index.html (irParaAbaRodape) ANTES do
// switchTab, só o reset em si — quem redesenha é o gancho que o próprio
// switchTab('tab-relatorios') já dispara (carregarResultados().then(m =>
// m.renderResultados())), sem duplicar render aqui.
export function resetarResultadosParaAbaInicial() {
    filtro = { ano: ANO_ATUAL, abrangencia: 'carteira', contexto: 'tudo', alvoId: null, alvoNome: null };
}

export function aplicarResultadosFiltros() {
    if (!rascunho) { fecharSheet(); return; }
    if (rascunho.abrangencia !== 'carteira' && !rascunho.alvoId) {
        mostrarToast('Escolha um ' + (rascunho.abrangencia === 'empreendimento' ? 'empreendimento' : 'imóvel') + ' antes de aplicar.', 'danger');
        return;
    }
    filtro = { ...rascunho };
    fecharSheet();
    if (filtro.abrangencia === 'imovel') {
        // ESP §4.2 — Imóvel não fica em Resultados: abre a ficha do
        // ativo direto no chip Performance.
        const alvoId = filtro.alvoId, alvoNome = filtro.alvoNome;
        filtro = { ano: filtro.ano, abrangencia: 'carteira', contexto: filtro.contexto, alvoId: null, alvoNome: null };
        if (typeof window.abrirFichaAtivoNoChip === 'function') window.abrirFichaAtivoNoChip(alvoId, 'performance');
        else mostrarToast(`Abrindo ${alvoNome}...`, 'info');
        return;
    }
    renderResultados();
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
        const [resumoR, perfR, mensalR, concR, reajR, revR, indR, graficoIndR] = await Promise.all([
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
        ]);
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
        const graficoIndicador = graficoIndR.data || [];

        alvo.innerHTML = [
            montarKpis(resumo, perf),
            montarCardIndicadores(indicadores),
            montarGraficoMensal(mensal),
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
        console.warn('[resultados] Falha ao carregar conteúdo:', err.message);
        alvo.innerHTML = `<div class="rz-card"><p class="rz-desc">Não deu pra carregar os resultados agora (${rzEsc(err.message || 'erro')}). Puxe a lupa e toque em Aplicar de novo pra tentar.</p></div>`;
    }
}

function montarKpis(resumo, perf) {
    if (!resumo && !perf) return '';
    const familia = filtro.contexto === 'familia';
    const resultadoAno = perf ? perf.resultado_liquido : (resumo ? resumo.resultado_liquido_ano : null);
    const saidasAno = perf ? perf.saidas_ano : (resumo ? resumo.saidas_ano : null);
    const patrimonio = perf ? perf.patrimonio : (resumo ? resumo.soma_valor_mercado : null);
    const rentabilidade = perf ? perf.rentabilidade_pct : (resumo ? resumo.yield_ano_pct : null);
    // v1.5.0 (demanda 8ac32623) — 4ª caixa: Inadimplência (valor em atraso
    // no período — decisão do Nicola entre as opções propostas). Mesmo
    // campo inadimplencia_valor que o card "Performance" já usa mais
    // abaixo (montarPerformanceGrid) — fonte única, nunca 2 contas
    // diferentes pra "quanto está em atraso" na mesma tela.
    const inadimplencia = perf ? perf.inadimplencia_valor : (resumo ? resumo.inadimplencia_valor : null);
    // Carteira usa fn_resumo_resultados.ocupacao_pct direto; Empreendimento
    // não tem esse campo pronto (fn_performance_empreendimento só devolve
    // dias_alugado_medio/dias_vago_medio) — deriva o % localmente, mesma
    // conta que a função já faz por trás (dias/período).
    const ocupacaoValor = resumo ? resumo.ocupacao_pct
        : (perf && perf.dias_alugado_medio != null && (perf.dias_alugado_medio + perf.dias_vago_medio) > 0
            ? Math.round((perf.dias_alugado_medio / (perf.dias_alugado_medio + perf.dias_vago_medio)) * 1000) / 10
            : null);

    const heroLabel = familia ? 'Custo · ano' : 'Resultado do ano';
    const heroValor = familia ? formatarMoedaBR(saidasAno || 0, { semCentavos: true }) : formatarMoedaBR(resultadoAno || 0, { semCentavos: true });
    const heroClasse = !familia && Number(resultadoAno) < 0 ? ' rz-bad' : '';

    const cards = [`<div class="rz-kpi rz-hero${heroClasse}"><small>${heroLabel}</small><b>${heroValor}</b></div>`];
    cards.push(`<div class="rz-kpi"><small>Patrimônio</small><b>${formatarPatrimonioCompacto(patrimonio)}</b></div>`);
    if (!familia) cards.push(`<div class="rz-kpi"><small>Rentabilidade</small><b>${pctFmt(rentabilidade)}</b></div>`);
    const totalAtivos = perf ? perf.total_ativos : (resumo ? resumo.total_imoveis : null); // v1.7.0
    cards.push(familia
        ? `<div class="rz-kpi"><small>Ativos</small><b>${totalAtivos ?? '—'}</b></div>`
        : `<div class="rz-kpi"><small>Ocupação</small><b>${pctFmt(ocupacaoValor)}</b></div>`);
    cards.push(`<div class="rz-kpi${Number(inadimplencia) > 0 ? ' rz-bad' : ''}"><small>Inadimplência</small><b>${formatarMoedaBR(inadimplencia || 0, { semCentavos: true })}</b></div>`);

    return `<div class="rz-kpis">${cards.join('')}</div>`;
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
    return `<div class="rz-card">
        <div class="rz-card-h" style="justify-content:space-between"><b>Indicadores</b>${botaoInfoCard('abrirInfoIndicadores()')}</div>
        <div class="rz-kv">${indicadores.map(ind => `
            <div><small>${rzEsc(NOME_CURTO_INDICADOR[ind.codigo] || ind.nome)}</small><b>${pctSinal(ind.acumulado_12m_pct)} <span style="font-weight:400;color:var(--muted);font-size:10.5px">12m</span></b></div>
        `).join('')}</div>
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
    abrirSheet(rzSheetCabecalho(`Reajustes de ${NOMES_MES[mes - 1]}/${filtro.ano}`, null) + `<div class="rz-sh-b" id="res-mes-reajuste-corpo"><p class="text-xs text-slate-400 text-center py-6">Carregando...</p></div>`);
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
    abrirSheet(rzSheetCabecalho(`Revisional/Renovação de ${NOMES_MES[mes - 1]}/${filtro.ano}`, null) + `<div class="rz-sh-b" id="res-mes-revisional-corpo"><p class="text-xs text-slate-400 text-center py-6">Carregando...</p></div>`);
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
export function abrirInfoIndicadores() {
    const itens = [
        ['Indicadores', 'Os índices de mercado que orientam reajuste de aluguel e comparação de rentabilidade — IPCA, IGP-M e Selic.'],
        ['Fonte', 'Banco Central do Brasil (Sistema Gerenciador de Séries Temporais — SGS), acumulado dos últimos 12 meses capturados.'],
    ];
    abrirSheet(rzSheetCabecalho('Sobre o card Indicadores') +
        `<div class="rz-sh-b"><div class="rz-card"><div class="rz-kv">${
            itens.map(([r, v]) => `<div class="rz-full"><small>${rzEsc(r)}</small><b style="font-weight:500;font-size:12.5px">${rzEsc(v)}</b></div>`).join('')
        }</div></div></div>`);
}

export function abrirInfoResultadoMensal() {
    const itens = [
        ['Resultado mês a mês', 'A diferença entre o que entrou (aluguéis recebidos) e o que saiu (despesas, tributos, repasses) em cada mês do ano escolhido no filtro.'],
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
        ['Resultado líquido', 'Receita do ano menos despesas, tributos e repasses — o que sobrou de fato.'],
        ['Rentabilidade', 'O resultado do ano dividido pelo valor de mercado da carteira — some em Família.'],
        ['Receita do ano', 'Tudo o que foi efetivamente recebido no ano (aluguéis pagos).'],
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

// Helper local: lista de ativos pra picker de "Imóvel" no Sheet Filtros
// — usa o mesmo array global `imoveis` que o resto do app já usa (não
// importa cofre-estado.js aqui pra não acoplar a dois modelos de dado
// diferentes; `imoveis` é o array clássico já usado por
// abrirSeletorImovel() em outras telas).
function estadoAtivosParaFiltro() {
    try {
        return (typeof imoveis !== 'undefined' && Array.isArray(imoveis) ? imoveis : [])
            .map(i => ({ id: i.id, nome: `${i.empreendimento || ''} ${i.enderecoRua ? '- ' + i.enderecoRua : ''}`.trim() || i.id }));
    } catch (e) { return []; }
}
