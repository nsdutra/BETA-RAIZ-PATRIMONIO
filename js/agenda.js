// =====================================================================
// RAIZ PATRIMÔNIO — js/agenda.js
// VERSÃO: Beta v1.1.0 (14/10/2026 — demanda a05ad2ee)
// LINHAS: (ver versoes.json)
// -----------------------------------------------------------------
// NOVIDADES (Beta v1.1.0) — revisão das três vistas, FICHA_ONDA_7_AGENDA_RAIZ v1.2.0 §7–§8 (D7.7 a D7.13; Nicola 14/10
//   00:51: "Gostei. Faria só 2 ajustes (...) Restante ok. Não mexer nas regras de alerta atuais"). Sessão
//   20261014-0055-agenda-vistas. O módulo passa a desenhar a Agenda inteira:
//   — Topo no padrão do Financeiro (D7.7): linha 1 = período como título (‹ outubro 2026 › / ‹ 12–18 out ›) e ⋮;
//     linha 2 = vistas Lista · Semana · Mês (abas sublinhadas); linha 3 = filtros.
//   — Filtros (D7.11): status (● Crítico · ● Atenção · ● Informativo, múltipla escolha) e o chip "Assunto ▾", que abre a
//     escolha múltipla (Ativos · Itens de controle · Contratos e usos · Ocorrências · Financeiro · Documentos). Valem nas
//     três vistas.
//   — Lista (D7.8 ajustada): lista corrente por dia, sem "Precisa de você". No mês atual começa em hoje: os alertas de
//     hoje (mesma linha, gestos e regras de sempre — linhaAlertaHtml/rzLigarGestosAlertas do index) e os compromissos
//     do dia; depois os próximos dias com algo. O compromisso que um alerta já mostra (mesma entidade, até 7 dias) não
//     se repete.
//   — Semana (D7.9): faixa de 7 dias com pontos de status + resumo + a lista do dia escolhido; abre em hoje.
//   — Mês: grade com pontos por status (antes por tipo) + a lista do dia.
//   — Status do compromisso (D7.10): atrasado = crítico; vence em até 7 dias = atenção; o resto = informativo. Calculado
//     aqui, no app (a troca do retorno da fn_agenda_periodo foi barrada duas vezes na confirmação do banco; nenhuma
//     regra de alerta muda — os alertas usam a severidade que já têm em alerta_tipos).
//   — Dia por hora (D7.13): a lista do dia separa "Dia todo" e os horários (r.hora) e marca o realizado (r.situacao);
//     hoje nada tem hora — fica pronto para o registro do dia (6b).
// Versão anterior (Beta v1.0.0):
// NOVIDADES (Beta v1.0.0) — onda 7a/7b (D14), FICHA_ONDA_7_AGENDA_RAIZ v1.0.0 aprovada pelo Nicola 14/10 00:09.
//   Semana e Mês lendo fn_agenda_periodo; chips de tipo; toque abre o lugar; ⋮ "Enviar a semana por WhatsApp".
// =====================================================================
// Depende de globais do index.html: dbAuth, CLIENTE_ID_SUPABASE, geralRamoFiltro, alertasVisiveisTodos,
// agruparEMapearAlertas, linhaAlertaHtml, rzOrdemAlertas, rzLigarGestosAlertas, rzEsc, rzIcones, rzSkeleton,
// formatarMoedaBR, abrirSheet, abrirSheetAcoes, rzSheetCabecalho, fecharSheet, abrirAlertaItemControle,
// abrirFichaContrato, switchTab, mostrarToast, rzDev.

export const VERSAO = '1.1.0';

const TIPOS = {
    ocorrencia:   { rotulo: 'Ocorrência',  icone: 'wrench',          dominio: 'ocorrencias' },
    recebimento:  { rotulo: 'Recebimento', icone: 'arrow-down-left', dominio: 'financeiro' },
    pagamento:    { rotulo: 'Pagamento',   icone: 'arrow-up-right',  dominio: 'financeiro' },
    contrato_fim: { rotulo: 'Contrato',    icone: 'file-x',          dominio: 'contratos' },
    reajuste:     { rotulo: 'Reajuste',    icone: 'trending-up',     dominio: 'contratos' },
    documento:    { rotulo: 'Documento',   icone: 'file-clock',      dominio: 'documentos' },
};
const ASSUNTOS = [['ativos', 'Ativos'], ['itens', 'Itens de controle'], ['contratos', 'Contratos e usos'], ['ocorrencias', 'Ocorrências'], ['financeiro', 'Financeiro'], ['documentos', 'Documentos']];
const STATUS = [['critico', 'Crítico'], ['atencao', 'Atenção'], ['informativo', 'Informativo']];
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const MES_CURTO = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const DIA_SEM = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const JANELA_ATENCAO = 7; // D7.10

const st = { vista: 'lista', semana: null, mes: null, dia: null, status: new Set(), assuntos: new Set(), dados: [], seq: 0, el: null };

// ---- datas (data local, ISO yyyy-mm-dd)
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const deIso = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const somaDias = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const inicioSemana = (d) => somaDias(d, -((d.getDay() + 6) % 7)); // segunda
const hoje = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const moeda = (v) => (v == null ? '' : (typeof formatarMoedaBR === 'function' ? formatarMoedaBR(v) : Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })));

// ---- status e assunto
function statusCompromisso(r) { // D7.10 — só para o compromisso da Agenda; alerta mantém a severidade dele
    if (r.severidade) return r.severidade;
    if (r.atrasado) return 'critico';
    return deIso(r.data) <= somaDias(hoje(), JANELA_ATENCAO) ? 'atencao' : 'informativo';
}
const assuntoCompromisso = (r) => r.dominio || (TIPOS[r.tipo] || {}).dominio || 'itens';
function assuntoAlerta(a) { // alerta do Motor → assunto do filtro (só leitura; a regra do alerta não muda)
    const et = a.entidade_tipo;
    if (et === 'ativo') return 'ativos';
    if (et === 'contrato') return 'contratos';
    if (et === 'documento') return 'documentos';
    if (et === 'item_controle') return a.dominio === 'financeiro' ? 'financeiro' : 'itens';
    if (a.dominio === 'financeiro' || a.dominio === 'fiscal') return 'financeiro';
    if (a.dominio === 'cadastro') return 'ativos';
    return 'itens';
}
const passaStatus = (s) => !st.status.size || st.status.has(s);
const passaAssunto = (a) => !st.assuntos.size || st.assuntos.has(a);
const compVisivel = (r) => passaStatus(statusCompromisso(r)) && passaAssunto(assuntoCompromisso(r));
const alertaVisivel = (a) => passaStatus(a.severidade) && passaAssunto(assuntoAlerta(a));

function periodo() {
    if (st.vista === 'semana') return [st.semana, somaDias(st.semana, 6)];
    const ini = new Date(st.mes.getFullYear(), st.mes.getMonth(), 1);
    const fim = new Date(st.mes.getFullYear(), st.mes.getMonth() + 1, 0);
    return [inicioSemana(ini), somaDias(inicioSemana(fim), 6)]; // grade inteira (bordas), até 42 dias
}
function tituloPeriodo() {
    if (st.vista !== 'semana') return `${MESES[st.mes.getMonth()]} ${st.mes.getFullYear()}`;
    const a = st.semana, b = somaDias(st.semana, 6);
    return a.getMonth() === b.getMonth() ? `${a.getDate()}–${b.getDate()} ${MES_CURTO[a.getMonth()]}` : `${a.getDate()} ${MES_CURTO[a.getMonth()]} – ${b.getDate()} ${MES_CURTO[b.getMonth()]}`;
}
const mesTemHoje = () => st.mes.getFullYear() === hoje().getFullYear() && st.mes.getMonth() === hoje().getMonth();
// alertas do Motor que entram na Lista (só no mês de hoje, no grupo de hoje)
// (alertasVisiveisTodos é um `let` do index: lido pelo nome, não por window)
const alertasDaLista = () => (st.vista === 'lista' && mesTemHoje() && typeof alertasVisiveisTodos !== 'undefined' && Array.isArray(alertasVisiveisTodos)) ? alertasVisiveisTodos : [];

// ---- entrada (chamada pelo index: rzAgendaVista)
export async function montarAgenda(vista, el) {
    st.el = el || st.el;
    if (!st.el) return;
    st.vista = ['lista', 'semana', 'mes'].includes(vista) ? vista : (st.vista || 'lista'); // sem vista: mantém a atual
    if (!st.mes) st.mes = new Date(hoje().getFullYear(), hoje().getMonth(), 1);
    if (!st.dia) st.dia = iso(hoje());
    if (!st.semana) st.semana = inicioSemana(hoje());
    window.rzAgendaRedesenhar = () => { if (st.el && st.el.isConnected) desenhar(false); };
    await carregar();
}

async function carregar() {
    const meu = ++st.seq;
    const [de, ate] = periodo();
    desenhar(true);
    let dados = [];
    try {
        const ramo = (typeof geralRamoFiltro !== 'undefined' && geralRamoFiltro && geralRamoFiltro !== 'tudo') ? geralRamoFiltro : null;
        const { data, error } = await dbAuth.rpc('fn_agenda_periodo', { p_cliente_id: CLIENTE_ID_SUPABASE, p_de: iso(de), p_ate: iso(ate), p_ramo: ramo });
        if (error) throw error;
        dados = data || [];
    } catch (e) {
        if (meu !== st.seq) return;
        console.error('[agenda] fn_agenda_periodo:', e?.message || e);
        const c = st.el.querySelector('#ag-corpo');
        if (c) c.innerHTML = '<p class="rz-desc rz-ag-nada">Não consegui carregar a agenda agora.</p>';
        return;
    }
    if (meu !== st.seq) return; // chegou um período mais novo
    st.dados = dados;
    desenhar(false);
}

// ---- moldura: título (linha 1), vistas (linha 2), filtros (linha 3), corpo
function desenhar(carregando) {
    const alertas = alertasDaLista().filter(a => passaAssunto(assuntoAlerta(a)));
    const comps = st.dados.filter(r => passaAssunto(assuntoCompromisso(r)));
    const conta = (s) => comps.filter(r => statusCompromisso(r) === s).length + alertas.filter(a => a.severidade === s).length;
    const rotAss = !st.assuntos.size ? 'Assunto' : st.assuntos.size === 1 ? ASSUNTOS.find(a => st.assuntos.has(a[0]))[1] : `Assunto · ${st.assuntos.size}`;
    st.el.innerHTML = `
        <div class="rz-fin-topo">
            <div class="rz-mes-bar rz-mes-titulo">
                <button type="button" class="rz-ico-btn" data-ag-nav="-1" aria-label="Anterior"><svg data-lucide="chevron-left"></svg></button>
                <span class="rz-mes-centro"><b class="rz-mes-label">${rzEsc(tituloPeriodo())}</b></span>
                <button type="button" class="rz-ico-btn" data-ag-nav="1" aria-label="Próximo"><svg data-lucide="chevron-right"></svg></button>
            </div>
            <button type="button" class="rz-ico-btn rz-fin-lupa" data-ag-mais aria-label="Mais ações"><svg data-lucide="more-vertical"></svg></button>
        </div>
        <div class="rz-seg rz-fin-abas" role="tablist" aria-label="Vista da agenda">
            ${[['lista', 'Lista'], ['semana', 'Semana'], ['mes', 'Mês']].map(([k, n]) => `<button type="button" class="${st.vista === k ? 'rz-on' : ''}" data-ag-vista="${k}">${n}</button>`).join('')}
        </div>
        <div class="rz-chips rz-ag-chips">
            ${STATUS.map(([k, n]) => `<button type="button" class="rz-chip${st.status.has(k) ? ' rz-on' : ''}" data-ag-st="${k}"><span class="rz-ag-pt rz-ag-${k}"></span>${n}${carregando ? '' : ` <span class="rz-n">${conta(k)}</span>`}</button>`).join('')}
            <button type="button" class="rz-chip rz-ag-ass${st.assuntos.size ? ' rz-on' : ''}" data-ag-ass>${rzEsc(rotAss)} <svg data-lucide="chevron-down"></svg></button>
        </div>
        <div id="ag-corpo">${carregando ? (typeof rzSkeleton === 'function' ? rzSkeleton('lista', 4) : '') : (st.vista === 'lista' ? listaHtml() : st.vista === 'semana' ? semanaHtml() : mesHtml())}</div>`;
    ligar();
    if (!carregando && st.vista === 'lista' && typeof rzLigarGestosAlertas === 'function') {
        const m = st.el.querySelector('#ag-corpo');
        if (m && alertasDaLista().length) rzLigarGestosAlertas(m); // gestos de sempre nas linhas de alerta
    }
    rzIcones();
}

// ---- linhas
function linhaHtml(r, i) {
    const t = TIPOS[r.tipo] || { icone: 'circle', rotulo: '' };
    const s = statusCompromisso(r);
    const sub = [r.sub, r.atrasado ? 'atrasado' : '', r.situacao === 'realizado' ? 'realizado' : ''].filter(Boolean).join(' · ') || t.rotulo;
    return `<button type="button" class="rz-row rz-link rz-ag-linha rz-ag-${s}" data-ag-i="${i}">
        <div class="rz-ic"><svg data-lucide="${r.situacao === 'realizado' ? 'check' : t.icone}"></svg></div>
        <div class="rz-tx"><b>${rzEsc(r.titulo || t.rotulo)}</b><span>${rzEsc(sub)}</span></div>
        ${r.valor != null ? `<span class="rz-ag-valor">${moeda(r.valor)}</span>` : ''}</button>`;
}
// D7.13 — dia por hora: "Dia todo" primeiro; depois um bloco por horário (quando o registro do dia trouxer hora)
function blocoDoDia(pares) {
    const semHora = pares.filter(([r]) => !r.hora), comHora = pares.filter(([r]) => r.hora).sort((a, b) => String(a[0].hora).localeCompare(String(b[0].hora)));
    if (!comHora.length) return pares.map(([r, i]) => linhaHtml(r, i)).join('');
    let h = semHora.length ? `<div class="rz-ag-hora">Dia todo</div>${semHora.map(([r, i]) => linhaHtml(r, i)).join('')}` : '';
    let ultima = '';
    comHora.forEach(([r, i]) => { const hh = String(r.hora).slice(0, 5); if (hh !== ultima) { h += `<div class="rz-ag-hora">${hh}</div>`; ultima = hh; } h += linhaHtml(r, i); });
    return h;
}
const rotDia = (di) => { const d = deIso(di); return `${DIA_SEM[d.getDay()]} ${d.getDate()}${di === iso(hoje()) ? ' · hoje' : ''}`; };

// ---- Lista (D7.8): corrente, por dia; no mês de hoje começa em hoje com os alertas de sempre
function listaHtml() {
    const hj = iso(hoje()), ini = iso(new Date(st.mes.getFullYear(), st.mes.getMonth(), 1)), fim = iso(new Date(st.mes.getFullYear(), st.mes.getMonth() + 1, 0));
    const alertas = alertasDaLista().filter(alertaVisivel);
    // o compromisso que um alerta já mostra (mesma entidade, até 7 dias) não se repete
    const entAlerta = new Set(alertasDaLista().map(a => a.entidade_id).filter(Boolean));
    const limiteDup = iso(somaDias(hoje(), JANELA_ATENCAO));
    const pares = st.dados.map((r, i) => [r, i]).filter(([r]) => r.data >= ini && r.data <= fim && compVisivel(r))
        .filter(([r]) => !(entAlerta.has(r.entidade_id) && r.data <= limiteDup && mesTemHoje()));
    let html = '';
    const comecaHoje = mesTemHoje();
    // hoje: alertas + compromissos de hoje (e os atrasados do mês, que já passaram)
    if (comecaHoje) {
        const deHoje = pares.filter(([r]) => r.data <= hj);
        let itensAlerta = '';
        if (alertas.length && typeof agruparEMapearAlertas === 'function' && typeof linhaAlertaHtml === 'function') {
            const mapeados = agruparEMapearAlertas(alertas);
            if (typeof rzOrdemAlertas === 'function') mapeados.sort(rzOrdemAlertas);
            itensAlerta = mapeados.map(linhaAlertaHtml).join('');
        }
        const n = deHoje.length + (itensAlerta ? alertas.length : 0);
        if (n) html += `<div class="rz-group rz-ag-dia rz-ag-hoje">${rotDia(hj)}<span>${n}</span></div><div class="rz-card rz-list">${itensAlerta}${blocoDoDia(deHoje)}</div>`;
    }
    const dias = [...new Set(pares.map(([r]) => r.data).filter(d => !comecaHoje || d > hj))].sort();
    dias.forEach(di => {
        const doDia = pares.filter(([r]) => r.data === di);
        html += `<div class="rz-group rz-ag-dia">${rotDia(di)}<span>${doDia.length}</span></div><div class="rz-card rz-list">${blocoDoDia(doDia)}</div>`;
    });
    return html || `<p class="rz-desc rz-ag-nada">${st.status.size || st.assuntos.size ? 'Nada com este filtro.' : 'Nada marcado neste mês.'}</p>`;
}

// ---- pontos por status (D7.10/Mês)
function pontos(di) {
    const ss = new Set(st.dados.filter(r => r.data === di && compVisivel(r)).map(statusCompromisso));
    return `<span class="rz-ag-pts">${['critico', 'atencao', 'informativo'].filter(s => ss.has(s)).map(s => `<i class="rz-ag-${s}"></i>`).join('')}</span>`;
}
function listaDoDia() {
    const d = deIso(st.dia);
    const pares = st.dados.map((r, i) => [r, i]).filter(([r]) => r.data === st.dia && compVisivel(r));
    return `<div class="rz-group rz-ag-dia${st.dia === iso(hoje()) ? ' rz-ag-hoje' : ''}">${DIA_SEM[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}<span>${pares.length || '—'}</span></div>
        ${pares.length ? `<div class="rz-card rz-list">${blocoDoDia(pares)}</div>` : '<p class="rz-desc rz-ag-nada">Nada neste dia.</p>'}`;
}

// ---- Semana (D7.9): faixa de 7 dias + resumo + dia
function semanaHtml() {
    let faixa = '';
    for (let k = 0; k < 7; k++) {
        const d = somaDias(st.semana, k), di = iso(d);
        faixa += `<button type="button" class="rz-ag-cel${di === st.dia ? ' rz-on' : ''}${di === iso(hoje()) ? ' rz-ag-cel-hoje' : ''}" data-ag-dia="${di}">
            <small>${DIA_SEM[d.getDay()]}</small><b>${d.getDate()}</b>${pontos(di)}</button>`;
    }
    const a = iso(st.semana), b = iso(somaDias(st.semana, 6));
    const daSemana = st.dados.filter(r => r.data >= a && r.data <= b && compVisivel(r));
    const crit = daSemana.filter(r => statusCompromisso(r) === 'critico').length;
    return `<div class="rz-ag-grade">${faixa}</div>
        <p class="rz-ag-resumo"><b>${daSemana.length}</b> na semana${crit ? ` · <span class="rz-ag-txt-critico"><b>${crit}</b> crítico${crit > 1 ? 's' : ''}</span>` : ''}</p>${listaDoDia()}`;
}

// ---- Mês
function mesHtml() {
    const [de] = periodo();
    const mesAtual = st.mes.getMonth();
    let grade = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map(s => `<div class="rz-ag-sem">${s}</div>`).join('');
    for (let k = 0; k < 42; k++) {
        const d = somaDias(de, k), di = iso(d);
        if (k >= 35 && d.getMonth() !== mesAtual) break; // 5 semanas bastam
        grade += `<button type="button" class="rz-ag-cel${d.getMonth() !== mesAtual ? ' rz-ag-fora' : ''}${di === st.dia ? ' rz-on' : ''}${di === iso(hoje()) ? ' rz-ag-cel-hoje' : ''}" data-ag-dia="${di}">
            <b>${d.getDate()}</b>${pontos(di)}</button>`;
    }
    return `<div class="rz-ag-grade">${grade}</div>${listaDoDia()}`;
}

// ---- eventos
function ligar() {
    st.el.querySelectorAll('[data-ag-vista]').forEach(b => b.addEventListener('click', () => {
        const v = b.dataset.agVista;
        if (v === st.vista) return;
        if (v === 'semana') { st.semana = inicioSemana(deIso(st.dia)); }
        else { const d = deIso(st.dia); st.mes = new Date(d.getFullYear(), d.getMonth(), 1); }
        st.vista = v;
        carregar();
    }));
    st.el.querySelectorAll('[data-ag-nav]').forEach(b => b.addEventListener('click', () => {
        const n = Number(b.dataset.agNav);
        if (st.vista === 'semana') {
            st.semana = somaDias(st.semana, 7 * n);
            const h = iso(hoje()); st.dia = (h >= iso(st.semana) && h <= iso(somaDias(st.semana, 6))) ? h : iso(st.semana);
        } else {
            st.mes = new Date(st.mes.getFullYear(), st.mes.getMonth() + n, 1);
            st.dia = mesTemHoje() ? iso(hoje()) : iso(st.mes);
        }
        carregar();
    }));
    st.el.querySelectorAll('[data-ag-st]').forEach(b => b.addEventListener('click', () => {
        const k = b.dataset.agSt; st.status.has(k) ? st.status.delete(k) : st.status.add(k); desenhar(false);
    }));
    const ass = st.el.querySelector('[data-ag-ass]');
    if (ass) ass.addEventListener('click', abrirAssunto);
    st.el.querySelectorAll('[data-ag-dia]').forEach(b => b.addEventListener('click', () => { st.dia = b.dataset.agDia; desenhar(false); }));
    st.el.querySelectorAll('[data-ag-i]').forEach(b => b.addEventListener('click', () => abrirCompromisso(st.dados[Number(b.dataset.agI)])));
    const mais = st.el.querySelector('[data-ag-mais]');
    if (mais) mais.addEventListener('click', () => abrirSheetAcoes({ titulo: 'Agenda', sub: tituloPeriodo(), acoes: [
        { icone: 'send', titulo: 'Enviar a semana por WhatsApp', sub: 'Compartilhar com uma pessoa', aoTocar: enviarSemana },
    ] }));
}

// Assunto (D7.11): escolha múltipla num sheet, com o número de cada um
function abrirAssunto() {
    const marcados = new Set(st.assuntos);
    const base = st.dados.filter(r => passaStatus(statusCompromisso(r))).map(assuntoCompromisso)
        .concat(alertasDaLista().filter(a => passaStatus(a.severidade)).map(assuntoAlerta));
    const corpo = () => ASSUNTOS.map(([k, n]) => `<button type="button" class="rz-row rz-link rz-ag-op${marcados.has(k) ? ' rz-on' : ''}" data-ag-op="${k}">
            <span class="rz-ag-ck">${marcados.has(k) ? '<svg data-lucide="check"></svg>' : ''}</span>
            <div class="rz-tx"><b>${n}</b></div><span class="rz-ag-valor">${base.filter(x => x === k).length}</span></button>`).join('')
        + `<button type="button" class="rz-btn rz-btn-1 rz-ag-bt" data-ag-aplicar>Mostrar</button>
           <button type="button" class="rz-btn rz-ag-bt" data-ag-limpar>Limpar assunto</button>`;
    const sh = abrirSheet(rzSheetCabecalho('Assunto', 'Escolha um ou mais') + `<div class="rz-sh-b" id="ag-ass-corpo">${corpo()}</div>`);
    const ligarOps = () => {
        const c = sh.querySelector('#ag-ass-corpo');
        c.querySelectorAll('[data-ag-op]').forEach(o => o.addEventListener('click', () => {
            const k = o.dataset.agOp; marcados.has(k) ? marcados.delete(k) : marcados.add(k);
            c.innerHTML = corpo(); ligarOps(); rzIcones();
        }));
        c.querySelector('[data-ag-aplicar]').addEventListener('click', () => { st.assuntos = marcados; fecharSheet(); desenhar(false); });
        c.querySelector('[data-ag-limpar]').addEventListener('click', () => { st.assuntos = new Set(); fecharSheet(); desenhar(false); });
    };
    ligarOps(); rzIcones();
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

// 7b — texto curto da semana do dia escolhido, pelo adaptador do aparelho (respeita os filtros).
async function enviarSemana() {
    const ini = inicioSemana(deIso(st.dia)), fim = somaDias(ini, 6);
    let dados = st.dados;
    const cobre = st.dados.length && iso(ini) >= iso(periodo()[0]) && iso(fim) <= iso(periodo()[1]);
    if (!cobre) {
        try {
            const ramo = (typeof geralRamoFiltro !== 'undefined' && geralRamoFiltro && geralRamoFiltro !== 'tudo') ? geralRamoFiltro : null;
            const { data } = await dbAuth.rpc('fn_agenda_periodo', { p_cliente_id: CLIENTE_ID_SUPABASE, p_de: iso(ini), p_ate: iso(fim), p_ramo: ramo });
            dados = data || [];
        } catch (_) { /* usa o que está na tela */ }
    }
    const linhas = [];
    for (let k = 0; k < 7; k++) {
        const d = somaDias(ini, k), di = iso(d);
        const doDia = dados.filter(r => r.data === di && compVisivel(r));
        if (!doDia.length) continue;
        linhas.push(`*${DIA_SEM[d.getDay()]} ${d.getDate()}/${String(d.getMonth() + 1).padStart(2, '0')}*`);
        doDia.forEach(r => linhas.push(`• ${r.hora ? String(r.hora).slice(0, 5) + ' ' : ''}${r.titulo}${r.valor != null ? ' · ' + moeda(r.valor) : ''}${r.atrasado ? ' (atrasado)' : ''}`));
    }
    const cab = `Agenda ${ini.getDate()}/${String(ini.getMonth() + 1).padStart(2, '0')} a ${fim.getDate()}/${String(fim.getMonth() + 1).padStart(2, '0')}`;
    const texto = linhas.length ? `${cab}\n\n${linhas.join('\n')}` : `${cab}\n\nNada marcado nesta semana.`;
    if (typeof rzDev === 'function') rzDev('whatsapp', '', texto);
    else window.open('https://wa.me/?text=' + encodeURIComponent(texto), '_blank');
}
