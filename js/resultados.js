// =====================================================================
// RAIZ PATRIMÔNIO — js/resultados.js
// VERSÃO: Beta v1.0.0 (21/09/2026 — Entrega A.3 do
// PLANO_IMPLEMENTACAO_RESULTADOS_MERCADO_FISCAL v2.0.0)
// LINHAS: (ver versoes.json)
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

export const VERSAO = '1.0.0';

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
    rascunho[grupo] = valor;
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

    try {
        const [resumoR, perfR, mensalR, concR, reajR] = await Promise.all([
            filtro.abrangencia === 'carteira'
                ? dbAuth.rpc('fn_resumo_resultados', { p_cliente_id: CLIENTE_ID_SUPABASE, p_uso, p_ano: filtro.ano })
                : Promise.resolve({ data: null }),
            filtro.abrangencia === 'carteira'
                ? dbAuth.rpc('fn_performance_carteira', { p_cliente_id: CLIENTE_ID_SUPABASE, p_uso, p_ano: filtro.ano })
                : dbAuth.rpc('fn_performance_empreendimento', { p_empreendimento_id: alvoId, p_ano: filtro.ano }),
            dbAuth.rpc('fn_resultado_mensal', { p_cliente_id: CLIENTE_ID_SUPABASE, p_ano: filtro.ano, p_nivel: nivel, p_id: alvoId, p_uso }),
            filtro.abrangencia === 'carteira'
                ? dbAuth.rpc('fn_carteira_concentracao', { p_cliente_id: CLIENTE_ID_SUPABASE, p_ano: filtro.ano })
                : Promise.resolve({ data: [] }),
            filtro.abrangencia === 'carteira'
                ? dbAuth.rpc('fn_carteira_reajustes_calendario', { p_cliente_id: CLIENTE_ID_SUPABASE, p_ano: filtro.ano, p_uso })
                : Promise.resolve({ data: [] }),
        ]);
        if (resumoR.error) throw resumoR.error;
        if (perfR.error) throw perfR.error;
        if (mensalR.error) throw mensalR.error;
        if (concR.error) throw concR.error;
        if (reajR.error) throw reajR.error;

        const resumo = Array.isArray(resumoR.data) ? resumoR.data[0] : resumoR.data;
        const perf = Array.isArray(perfR.data) ? perfR.data[0] : perfR.data;
        const mensal = mensalR.data || [];
        const concentracao = concR.data || [];
        const reajustes = reajR.data || [];

        alvo.innerHTML = [
            montarKpis(resumo, perf),
            montarCardIndicadores(),
            montarGraficoMensal(mensal),
            montarGraficoIndicador(),
            filtro.abrangencia === 'carteira' ? montarConcentracao(concentracao) : '',
            filtro.abrangencia === 'carteira' ? montarReajustesCalendario(reajustes) : '',
            montarPerformanceGrid(perf),
        ].filter(Boolean).join('');

        if (typeof rzIcones === 'function') rzIcones();
        ligarBarrasReajuste(reajustes);
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
    // Carteira usa fn_resumo_resultados.ocupacao_pct direto; Empreendimento
    // não tem esse campo pronto (fn_performance_empreendimento só devolve
    // dias_alugado_medio/dias_vago_medio) — deriva o % localmente, mesma
    // conta que a função já faz por trás (dias/período).
    const ocupacaoValor = resumo ? resumo.ocupacao_pct
        : (perf && perf.dias_alugado_medio != null && (perf.dias_alugado_medio + perf.dias_vago_medio) > 0
            ? Math.round((perf.dias_alugado_medio / (perf.dias_alugado_medio + perf.dias_vago_medio)) * 1000) / 10
            : null);

    const heroLabel = familia ? 'Custo · ano' : 'Resultado do ano';
    const heroValor = familia ? formatarMoedaBR(saidasAno || 0) : formatarMoedaBR(resultadoAno || 0);
    const heroClasse = !familia && Number(resultadoAno) < 0 ? ' rz-bad' : '';

    const cards = [`<div class="rz-kpi rz-hero${heroClasse}"><small>${heroLabel}</small><b>${heroValor}</b></div>`];
    cards.push(`<div class="rz-kpi"><small>Patrimônio</small><b>${formatarMoedaBR(patrimonio || 0)}</b></div>`);
    if (!familia) cards.push(`<div class="rz-kpi"><small>Rentabilidade</small><b>${pctFmt(rentabilidade)}</b></div>`);
    cards.push(`<div class="rz-kpi"><small>${familia ? 'Ativos em uso' : 'Ocupação'}</small><b>${pctFmt(ocupacaoValor)}</b></div>`);

    return `<div class="rz-kpis">${cards.join('')}</div>`;
}

function montarCardIndicadores() {
    if (filtro.contexto === 'familia') return ''; // ESP §4.3 — não renderiza em Família
    // Estado vazio honesto (§0.7 do REGRAS): sem indicador_series/valores
    // no banco ainda (Fase B1, fora dos pré-requisitos de A.3 — demanda
    // 45cc9f88). Nasce no lugar certo (logo após a ocupação), sem dado
    // fabricado.
    return `<div class="rz-card">
        <div class="rz-card-h"><b>Indicadores</b></div>
        <div class="rz-empty" style="padding:14px 8px">
            <div class="rz-ic"><svg data-lucide="trending-up"></svg></div>
            <p>IPCA, IGP-M e Selic — a captura automática desses índices ainda não foi construída; entra na Fase de Indicadores do roadmap.</p>
        </div>
    </div>`;
}

function montarGraficoMensal(mensal) {
    if (!mensal || !mensal.length) return `<div class="rz-card"><b>Resultado mês a mês</b><p class="rz-desc" style="margin-top:8px">Sem lançamentos no período.</p></div>`;
    const valores = mensal.map(m => Number(m.resultado) || 0);
    const max = Math.max(...valores, 0);
    const min = Math.min(...valores, 0);
    const amplitude = (max - min) || 1;
    const media = valores.reduce((s, v) => s + v, 0) / valores.length;
    const mediaPct = Math.max(0, Math.min(100, ((media - min) / amplitude) * 100));
    const iMax = valores.indexOf(max), iMin = valores.indexOf(min);
    const barras = mensal.map((m, i) => {
        const alturaPct = Math.max(2, ((valores[i] - min) / amplitude) * 100);
        const neg = valores[i] < 0;
        const rotulo = (i === iMax || i === iMin) ? `<span style="position:absolute;top:-16px;left:0;right:0;text-align:center;font-size:9.5px;font-weight:700;color:var(--muted)">${formatarMoedaBR(valores[i]).replace('R$', '').trim()}</span>` : '';
        return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;position:relative">
            ${rotulo}
            <div title="${NOMES_MES[m.mes - 1]}: ${formatarMoedaBR(valores[i])}" style="width:70%;height:${alturaPct}%;border-radius:3px 3px 0 0;background:${neg ? 'var(--danger)' : 'var(--sprout)'}"></div>
            <small style="font-size:9.5px;color:var(--muted);margin-top:3px">${NOMES_MES[m.mes - 1]}</small>
        </div>`;
    }).join('');
    return `<div class="rz-card">
        <div class="rz-card-h"><b>Resultado mês a mês</b></div>
        <div style="height:130px;display:flex;align-items:flex-end;gap:3px;position:relative;margin-top:14px">
            <div style="position:absolute;left:0;right:0;bottom:${mediaPct}%;border-top:1px dashed var(--sage)"></div>
            ${barras}
        </div>
    </div>`;
}

function montarGraficoIndicador() {
    if (filtro.contexto === 'familia') return ''; // ESP §4.3
    return `<div class="rz-card">
        <div class="rz-card-h"><b>Sua carteira × indicador</b></div>
        <div class="rz-empty" style="padding:14px 8px">
            <div class="rz-ic"><svg data-lucide="line-chart"></svg></div>
            <p>A comparação com IPCA/IGP-M/IVG-R chega junto com a captura de indicadores do roadmap — ainda não há série de mercado no banco pra comparar.</p>
        </div>
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
    const rows = principais.map(l => `
        <div style="margin-bottom:10px">
            <div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:3px">
                <b style="font-weight:600;color:${l.concentrado ? 'var(--danger)' : 'var(--ink)'}">${rzEsc(l.locatario || '—')}</b>
                <span style="color:${l.concentrado ? 'var(--danger)' : 'var(--muted)'}">${l.percentual_pct}% · ${formatarMoedaBR(l.valor_ano)}</span>
            </div>
            <div class="rz-prog"><i style="width:${Math.min(100, l.percentual_pct)}%;${l.concentrado ? 'background:var(--danger)' : ''}"></i></div>
        </div>`).join('');
    const rowOutros = resto.length ? `
        <div>
            <div style="display:flex;justify-content:space-between;font-size:12.5px;margin-bottom:3px">
                <b style="font-weight:600;color:var(--muted)">Outros ${resto.length} locatário${resto.length > 1 ? 's' : ''}</b>
                <span style="color:var(--muted)">${restoPct}% · ${formatarMoedaBR(restoValor)}</span>
            </div>
            <div class="rz-prog"><i style="width:${Math.min(100, restoPct)}%;background:var(--sage)"></i></div>
        </div>` : '';
    return `<div class="rz-card">
        <div class="rz-card-h"><b>Dependência de locatário</b>${concentrada ? '<span class="rz-st rz-bad">Concentrada</span>' : ''}</div>
        <div style="margin-top:10px">${rows}${rowOutros}</div>
    </div>`;
}

function montarReajustesCalendario(meses) {
    const total = meses.reduce((s, m) => s + Number(m.valor_total || 0), 0);
    const max = Math.max(...meses.map(m => Number(m.valor_total || 0)), 0) || 1;
    const alerta = meses.find(m => m.concentrado);
    const barras = Array.from({ length: 12 }, (_, i) => {
        const m = meses.find(mm => mm.mes === i + 1) || { mes: i + 1, valor_total: 0, qtd_contratos: 0, concentrado: false };
        const alturaPct = Math.max(2, (Number(m.valor_total) / max) * 100);
        return `<div class="rz-res-barra-mes" data-mes="${m.mes}" style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;cursor:${Number(m.valor_total) > 0 ? 'pointer' : 'default'}">
            <div style="width:70%;height:${alturaPct}%;border-radius:3px 3px 0 0;background:${m.concentrado ? 'var(--warning)' : 'var(--sprout)'}"></div>
            <small style="font-size:9px;color:var(--muted);margin-top:2px">${m.qtd_contratos || ''}</small>
            <small style="font-size:9.5px;color:var(--muted)">${NOMES_MES[i]}</small>
        </div>`;
    }).join('');
    const nota = alerta ? `<p class="rz-desc" style="margin-top:8px;color:var(--warning)">${NOMES_MES[alerta.mes - 1]} concentra ${formatarMoedaBR(alerta.valor_total)} dos ${formatarMoedaBR(total)} do ano.</p>` : '';
    return `<div class="rz-card">
        <div class="rz-card-h"><b>Reajustes no ano</b></div>
        <div style="height:110px;display:flex;align-items:flex-end;gap:3px;margin-top:10px">${barras}</div>
        ${nota}
    </div>`;
}

function ligarBarrasReajuste(meses) {
    document.querySelectorAll('.rz-res-barra-mes').forEach(el => {
        const mes = Number(el.dataset.mes);
        const dado = meses.find(m => m.mes === mes);
        if (!dado || !Number(dado.valor_total)) return;
        el.addEventListener('click', () => abrirResultadosMesReajuste(mes));
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
                <div class="rz-rt"><b>${formatarMoedaBR(c.valor)}</b></div>
                <svg data-lucide="chevron-right" class="rz-chev"></svg>
            </div>`).join('')}</div>`;
        if (typeof rzIcones === 'function') rzIcones();
    } catch (err) {
        const corpo = document.getElementById('res-mes-reajuste-corpo');
        if (corpo) corpo.innerHTML = `<p class="rz-desc">Não deu pra carregar (${rzEsc(err.message || 'erro')}).</p>`;
    }
}

function montarPerformanceGrid(perf) {
    if (!perf) return '';
    const kv = (r, v) => `<div><small>${r}</small><b>${v}</b></div>`;
    const familia = filtro.contexto === 'familia';
    const linhas = [
        kv('Resultado líquido', formatarMoedaBR(perf.resultado_liquido || 0)),
        familia ? '' : kv('Rentabilidade', pctFmt(perf.rentabilidade_pct)),
        kv('Receita do ano', formatarMoedaBR(perf.receita_ano || 0)),
        kv('Patrimônio', formatarMoedaBR(perf.patrimonio || 0)),
        kv('Tempo médio alugado', perf.dias_alugado_medio != null ? `${Math.round(perf.dias_alugado_medio)} dias` : '—'),
        kv('Tempo médio vago', perf.dias_vago_medio != null ? `${Math.round(perf.dias_vago_medio)} dias` : '—'),
        kv('Tributos', formatarMoedaBR(perf.tributos || 0)),
        kv('Manutenção', formatarMoedaBR(perf.manutencao || 0)),
        kv('Seguros', formatarMoedaBR(perf.seguros || 0)),
        kv('Inadimplência', formatarMoedaBR(perf.inadimplencia_valor || 0)),
    ].filter(Boolean);
    return `<div class="rz-card">
        <div class="rz-card-h"><b>Performance</b></div>
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
