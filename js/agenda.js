// =====================================================================
// RAIZ PATRIMÔNIO — js/agenda.js
// VERSÃO: Beta v1.0.0 (14/10/2026 — demanda a05ad2ee)
// LINHAS: (ver versoes.json)
// -----------------------------------------------------------------
// NOVIDADES (Beta v1.0.0) — onda 7a/7b do estudo PROTOTIPO_UX_DENSIDADE_RAMOS_RAIZ v1.2.0 (D14), FICHA_ONDA_7_AGENDA_RAIZ
//   v1.0.0 aprovada pelo Nicola 14/10 00:09 ("De acordo", D7.1 a D7.6). Sessão 20261014-0010-agenda.
//   Módulo novo, lazy (UI-05): só carrega quando a pessoa toca em Semana ou Mês na Agenda.
//   — Semana: "‹ 13–19 out ›" no título; os 7 dias em grupos, cada compromisso numa linha (ícone por tipo, valor quando
//     houver); dia vazio numa linha só; atrasado em --danger.
//   — Mês: "‹ outubro 2026 ›" no título; grade de 7 colunas com até 3 pontos por dia (um por tipo); tocar no dia lista
//     os compromissos dele embaixo.
//   — Chips de tipo que só filtram: Ocorrências · Recebimentos · Pagamentos · Contratos · Documentos.
//   — Toque no compromisso abre o lugar dele pelos caminhos que já existem.
//   — ⋮ do título: "Enviar a semana por WhatsApp" (7b, D7.5) — texto curto pelo adaptador rzDev('whatsapp'), sem contato.
//   Dados: fn_agenda_periodo (D7.1) — só leitura; o módulo só desenha o que o banco devolve (CAN-01).
//   Ramo: o do cabeçalho (geralRamoFiltro), como os alertas.
// =====================================================================
// Depende de globais do index.html: dbAuth, CLIENTE_ID_SUPABASE, geralRamoFiltro, rzEsc, rzIcones, rzSkeleton,
// formatarMoedaBR, abrirSheetAcoes, abrirAlertaItemControle, abrirFichaContrato, switchTab, mostrarToast, rzDev.

export const VERSAO = '1.0.0';

const TIPOS = {
    ocorrencia:   { rotulo: 'Ocorrência',  chip: 'ocorrencias',  icone: 'wrench',          cor: 'var(--brass)' },
    recebimento:  { rotulo: 'Recebimento', chip: 'recebimentos', icone: 'arrow-down-left', cor: 'var(--success)' },
    pagamento:    { rotulo: 'Pagamento',   chip: 'pagamentos',   icone: 'arrow-up-right',  cor: 'var(--wine)' },
    contrato_fim: { rotulo: 'Contrato',    chip: 'contratos',    icone: 'file-x',          cor: 'var(--pine)' },
    reajuste:     { rotulo: 'Reajuste',    chip: 'contratos',    icone: 'trending-up',     cor: 'var(--pine)' },
    documento:    { rotulo: 'Documento',   chip: 'documentos',   icone: 'file-clock',      cor: 'var(--sage)' },
};
const CHIPS = [['ocorrencias', 'Ocorrências'], ['recebimentos', 'Recebimentos'], ['pagamentos', 'Pagamentos'], ['contratos', 'Contratos'], ['documentos', 'Documentos']];
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const MES_CURTO = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const DIA_SEM = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

const st = { vista: 'semana', semana: null, mes: null, dia: null, filtro: null, dados: [], seq: 0, el: null };

// ---- datas (sempre data local, ISO yyyy-mm-dd)
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const deIso = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const somaDias = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const inicioSemana = (d) => somaDias(d, -((d.getDay() + 6) % 7)); // segunda
const hoje = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };

function periodo() {
    if (st.vista === 'semana') return [st.semana, somaDias(st.semana, 6)];
    const ini = new Date(st.mes.getFullYear(), st.mes.getMonth(), 1);
    const fim = new Date(st.mes.getFullYear(), st.mes.getMonth() + 1, 0);
    return [inicioSemana(ini), somaDias(inicioSemana(fim), 6)]; // grade inteira (bordas), até 42 dias
}
function tituloPeriodo() {
    if (st.vista === 'mes') return `${MESES[st.mes.getMonth()]} ${st.mes.getFullYear()}`;
    const a = st.semana, b = somaDias(st.semana, 6);
    return a.getMonth() === b.getMonth() ? `${a.getDate()}–${b.getDate()} ${MES_CURTO[a.getMonth()]}` : `${a.getDate()} ${MES_CURTO[a.getMonth()]} – ${b.getDate()} ${MES_CURTO[b.getMonth()]}`;
}
const visivel = (r) => !st.filtro || st.filtro.has((TIPOS[r.tipo] || {}).chip);
const moeda = (v) => (v == null ? '' : (typeof formatarMoedaBR === 'function' ? formatarMoedaBR(v) : Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })));

// ---- entrada
export async function montarAgenda(vista, el) {
    st.el = el || st.el;
    if (!st.el) return;
    st.vista = vista === 'mes' ? 'mes' : 'semana';
    if (!st.semana) st.semana = inicioSemana(hoje());
    if (!st.mes) st.mes = new Date(hoje().getFullYear(), hoje().getMonth(), 1);
    if (!st.dia) st.dia = iso(hoje());
    await carregar();
}

async function carregar() {
    const meu = ++st.seq;
    const [de, ate] = periodo();
    desenharMoldura(true);
    let dados = [];
    try {
        const ramo = (typeof geralRamoFiltro !== 'undefined' && geralRamoFiltro && geralRamoFiltro !== 'tudo') ? geralRamoFiltro : null;
        const { data, error } = await dbAuth.rpc('fn_agenda_periodo', { p_cliente_id: CLIENTE_ID_SUPABASE, p_de: iso(de), p_ate: iso(ate), p_ramo: ramo });
        if (error) throw error;
        dados = data || [];
    } catch (e) {
        if (meu !== st.seq) return;
        console.error('[agenda] fn_agenda_periodo:', e?.message || e);
        st.el.querySelector('#ag-corpo').innerHTML = '<p class="rz-desc" style="text-align:center;padding:24px 0">Não consegui carregar a agenda agora.</p>';
        return;
    }
    if (meu !== st.seq) return; // chegou um período mais novo
    st.dados = dados;
    desenharMoldura(false);
}

// ---- moldura: título com ‹ › e ⋮, chips e corpo
function desenharMoldura(carregando) {
    const contaChip = (k) => st.dados.filter(r => (TIPOS[r.tipo] || {}).chip === k).length;
    st.el.innerHTML = `
        <div class="rz-fin-topo rz-ag-topo">
            <div class="rz-mes-bar rz-mes-titulo">
                <button type="button" class="rz-ico-btn" data-ag-nav="-1" aria-label="Anterior"><svg data-lucide="chevron-left"></svg></button>
                <span class="rz-mes-centro"><b class="rz-mes-label">${rzEsc(tituloPeriodo())}</b></span>
                <button type="button" class="rz-ico-btn" data-ag-nav="1" aria-label="Próximo"><svg data-lucide="chevron-right"></svg></button>
            </div>
            <button type="button" class="rz-ico-btn" data-ag-mais aria-label="Mais ações"><svg data-lucide="more-vertical"></svg></button>
        </div>
        <div class="rz-chips">${CHIPS.map(([k, n]) => `<button type="button" class="rz-chip${st.filtro && st.filtro.has(k) ? ' rz-on' : ''}" data-ag-chip="${k}">${n}${carregando ? '' : ` <span class="rz-n">${contaChip(k)}</span>`}</button>`).join('')}</div>
        <div id="ag-corpo">${carregando ? (typeof rzSkeleton === 'function' ? rzSkeleton('lista', 4) : '') : (st.vista === 'semana' ? semanaHtml() : mesHtml())}</div>`;
    ligar();
    rzIcones();
}

function linhaHtml(r, i) {
    const t = TIPOS[r.tipo] || { icone: 'circle', rotulo: '' };
    return `<button type="button" class="rz-row rz-link rz-ag-linha${r.atrasado ? ' rz-ag-atraso' : ''}" data-ag-i="${i}">
        <div class="rz-ic"><svg data-lucide="${t.icone}"></svg></div>
        <div class="rz-tx"><b>${rzEsc(r.titulo || t.rotulo)}</b><span>${rzEsc([r.sub, r.atrasado ? 'atrasado' : ''].filter(Boolean).join(' · ') || t.rotulo)}</span></div>
        ${r.valor != null ? `<span class="rz-ag-valor">${moeda(r.valor)}</span>` : ''}</button>`;
}

function semanaHtml() {
    let html = '';
    for (let k = 0; k < 7; k++) {
        const d = somaDias(st.semana, k), di = iso(d);
        const doDia = st.dados.map((r, i) => [r, i]).filter(([r]) => r.data === di && visivel(r));
        const ehHoje = di === iso(hoje());
        const rot = `${DIA_SEM[d.getDay()]} ${d.getDate()}${ehHoje ? ' · hoje' : ''}`;
        if (!doDia.length) { html += `<div class="rz-group rz-ag-dia rz-ag-vazio">${rot}<span>—</span></div>`; continue; }
        html += `<div class="rz-group rz-ag-dia${ehHoje ? ' rz-ag-hoje' : ''}">${rot}<span>${doDia.length}</span></div>
            <div class="rz-card rz-list">${doDia.map(([r, i]) => linhaHtml(r, i)).join('')}</div>`;
    }
    return html;
}

function mesHtml() {
    const [de] = periodo();
    const mesAtual = st.mes.getMonth();
    let grade = DIA_SEM.slice(1).concat(DIA_SEM[0]).map(s => `<div class="rz-ag-sem">${s[0].toUpperCase()}</div>`).join('');
    for (let k = 0; k < 42; k++) {
        const d = somaDias(de, k), di = iso(d);
        if (k >= 35 && d.getMonth() !== mesAtual) break; // 5 semanas bastam
        const tipos = [...new Set(st.dados.filter(r => r.data === di && visivel(r)).map(r => r.tipo))].slice(0, 3);
        const fora = d.getMonth() !== mesAtual;
        const atraso = st.dados.some(r => r.data === di && r.atrasado && visivel(r));
        grade += `<button type="button" class="rz-ag-cel${fora ? ' rz-ag-fora' : ''}${di === st.dia ? ' rz-on' : ''}${di === iso(hoje()) ? ' rz-ag-hoje' : ''}${atraso ? ' rz-ag-atraso' : ''}" data-ag-dia="${di}">
            <b>${d.getDate()}</b><span class="rz-ag-pts">${tipos.map(t => `<i style="background:${(TIPOS[t] || {}).cor || 'var(--muted)'}"></i>`).join('')}</span></button>`;
    }
    const d = deIso(st.dia);
    const doDia = st.dados.map((r, i) => [r, i]).filter(([r]) => r.data === st.dia && visivel(r));
    return `<div class="rz-ag-grade">${grade}</div>
        <div class="rz-group rz-ag-dia">${DIA_SEM[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}<span>${doDia.length || '—'}</span></div>
        ${doDia.length ? `<div class="rz-card rz-list">${doDia.map(([r, i]) => linhaHtml(r, i)).join('')}</div>` : '<p class="rz-desc rz-ag-nada">Nada neste dia.</p>'}`;
}

// ---- eventos
function ligar() {
    st.el.querySelectorAll('[data-ag-nav]').forEach(b => b.addEventListener('click', () => {
        const n = Number(b.dataset.agNav);
        if (st.vista === 'semana') st.semana = somaDias(st.semana, 7 * n);
        else { st.mes = new Date(st.mes.getFullYear(), st.mes.getMonth() + n, 1); st.dia = iso(st.mes); }
        carregar();
    }));
    st.el.querySelectorAll('[data-ag-chip]').forEach(b => b.addEventListener('click', () => {
        const k = b.dataset.agChip;
        if (!st.filtro) st.filtro = new Set([k]);
        else if (st.filtro.has(k)) { st.filtro.delete(k); if (!st.filtro.size) st.filtro = null; }
        else st.filtro.add(k);
        desenharMoldura(false);
    }));
    st.el.querySelectorAll('[data-ag-dia]').forEach(b => b.addEventListener('click', () => { st.dia = b.dataset.agDia; desenharMoldura(false); }));
    st.el.querySelectorAll('[data-ag-i]').forEach(b => b.addEventListener('click', () => abrirCompromisso(st.dados[Number(b.dataset.agI)])));
    const mais = st.el.querySelector('[data-ag-mais]');
    if (mais) mais.addEventListener('click', () => abrirSheetAcoes({ titulo: 'Agenda', sub: tituloPeriodo(), acoes: [
        { icone: 'send', titulo: 'Enviar a semana por WhatsApp', sub: 'Compartilhar com uma pessoa', aoTocar: enviarSemana },
    ] }));
}

// Toque no compromisso: abre o lugar dele pelos caminhos que já existem.
function abrirCompromisso(r) {
    if (!r) return;
    if (r.entidade_tipo === 'item_controle') { abrirAlertaItemControle(r.entidade_id, r.ativo_id || ''); return; }
    if (r.entidade_tipo === 'contrato') { abrirFichaContrato(r.entidade_id); return; }
    if (r.entidade_tipo === 'documento') { switchTab('tab-ativos'); setTimeout(() => window.dispatchEvent(new CustomEvent('cofre:abrir-documento', { detail: { id: r.entidade_id } })), 120); return; }
    // recebimento e pagamento: o Financeiro no mês do vencimento
    switchTab(r.tipo === 'recebimento' ? 'tab-mensal' : 'tab-saidas');
    const atual = window.RZ_FIN_COMPETENCIA || iso(new Date(hoje().getFullYear(), hoje().getMonth(), 1));
    const meses = (Number(r.data.slice(0, 4)) - Number(atual.slice(0, 4))) * 12 + (Number(r.data.slice(5, 7)) - Number(atual.slice(5, 7)));
    if (meses && typeof window.financeiroMudarCompetencia === 'function') window.financeiroMudarCompetencia(meses);
    if (typeof mostrarToast === 'function') mostrarToast(`${r.titulo} · vence ${r.data.split('-').reverse().join('/')}`);
}

// 7b — texto curto da semana (a semana à vista; no Mês, a semana do dia escolhido), pelo adaptador do aparelho.
async function enviarSemana() {
    const ini = st.vista === 'semana' ? st.semana : inicioSemana(deIso(st.dia));
    const fim = somaDias(ini, 6);
    let dados = st.dados;
    if (st.vista !== 'semana') {
        try {
            const ramo = (typeof geralRamoFiltro !== 'undefined' && geralRamoFiltro && geralRamoFiltro !== 'tudo') ? geralRamoFiltro : null;
            const { data } = await dbAuth.rpc('fn_agenda_periodo', { p_cliente_id: CLIENTE_ID_SUPABASE, p_de: iso(ini), p_ate: iso(fim), p_ramo: ramo });
            dados = data || [];
        } catch (_) { /* usa o que está na tela */ }
    }
    const linhas = [];
    for (let k = 0; k < 7; k++) {
        const d = somaDias(ini, k), di = iso(d);
        const doDia = dados.filter(r => r.data === di && visivel(r));
        if (!doDia.length) continue;
        linhas.push(`*${DIA_SEM[d.getDay()]} ${d.getDate()}/${String(d.getMonth() + 1).padStart(2, '0')}*`);
        doDia.forEach(r => linhas.push(`• ${r.titulo}${r.valor != null ? ' · ' + moeda(r.valor) : ''}${r.atrasado ? ' (atrasado)' : ''}`));
    }
    const cab = `Agenda ${ini.getDate()}/${String(ini.getMonth() + 1).padStart(2, '0')} a ${fim.getDate()}/${String(fim.getMonth() + 1).padStart(2, '0')}`;
    const texto = linhas.length ? `${cab}\n\n${linhas.join('\n')}` : `${cab}\n\nNada marcado nesta semana.`;
    if (typeof rzDev === 'function') rzDev('whatsapp', '', texto);
    else window.open('https://wa.me/?text=' + encodeURIComponent(texto), '_blank');
}
