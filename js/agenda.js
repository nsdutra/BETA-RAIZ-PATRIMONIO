// =====================================================================
// RAIZ PATRIMÔNIO — js/agenda.js
// VERSÃO: Beta v1.8.0 (20/10/2026 — demanda bf1c1ba7)
// LINHAS: (ver versoes.json)
// -----------------------------------------------------------------
// NOVIDADES (Beta v1.8.0) (20/10/2026, sessão 20261020-1834-feriados, demanda bf1c1ba7; FICHA_FAMILIA_CALENDARIO_E_FERIADOS_RAIZ v1.0.0, de acordo do Nicola 20/10 18:34) — FERIADOS: a Agenda
//   traz o tipo 'feriado' de fn_agenda_periodo (rotina Feriados ligada em Minha empresa › Rotinas e alertas; nacionais e os das
//   UFs/cidades dos imóveis). Ícone party-popper, assunto novo "Feriados" no filtro, sempre Informativo (não pede ação) e o
//   toque mostra o feriado e a abrangência num aviso — não há tela para abrir.
// Versão anterior (Beta v1.7.0):
// NOVIDADES (Beta v1.7.0) — Nicola 19/10 12:16 (dem 9404081c, item 42; sessão 20261019-1250-carga-silva-patrimonio): a Agenda
//   abre no Mês e as abas ficam Mês · Semana · Alertas. A escolha da pessoa vale enquanto o app estiver aberto.
// Versão anterior (Beta v1.6.0):
// NOVIDADES (Beta v1.6.0) — Nicola 19/10 11:19 (dem 9404081c, itens 35 e 36; sessão 20261019-1125-carga-silva-ajustes):
//   — volta a lista de alertas de antes como a vista "Alertas", ao lado de Semana e Mês: é o bloco #agenda-lista do index
//     (busca, severidade, linhas e gestos de sempre, montarAlertasPatrimonio), mostrado logo abaixo das abas;
//   — na Semana, arrastar a faixa dos dias para os lados troca a semana; no Mês, arrastar a grade para cima/baixo troca o mês
//     (para cima = próximo). As setas ‹ › continuam.
// Versão anterior (Beta v1.5.0):
// NOVIDADES (Beta v1.5.0) — usos fatia 7 (FICHA_FATIA7_MEMBROS_RAIZ v1.2.0 §2A, de acordo do Nicola 16/10 00:05): entra o que
//   o relógio prevê para os animais (fn_agenda_periodo, tipo 'membro': parto previsto, diagnóstico, secagem, desmame), no
//   assunto Ativos; o toque abre a ficha do animal (cofre-membros.js). Sessão 20261016-0020-usos-fatia7.
// Versão anterior (Beta v1.4.0):
// NOVIDADES (Beta v1.4.0) — Nicola 14/10 21:26 ("a visão de lista prefiro eliminar ela. Pode retirar e deixar apenas
//   semana e mês"): a vista Lista sai; a Agenda abre na Semana (com a lista do dia embaixo) e tem só Semana · Mês. A
//   ação do ⋮ vira "Enviar a semana" (estudo D6, ação até 24 caracteres; a descrição continua dizendo o WhatsApp).
//   Sessão 20261014-2130-ajustes-9b.
// Versão anterior (Beta v1.3.0):
// NOVIDADES (Beta v1.3.0) — Nicola 14/10 09:50: as datas se vinculam ao FATO GERADOR, não a hoje. O alerta e o
//   compromisso pendentes ficam no dia de origem (ex.: o fechamento de 01/10 aparece em 01/10 com "Há 13d"), nas três
//   vistas. A Lista do mês de hoje mostra o mês inteiro por dia e, antes dele, o que ainda está pendente de meses
//   anteriores. O compromisso atrasado ganha o mesmo selo "Há Nd" das linhas de alerta. Sessão 20261014-0955-agenda-datas.
// Versão anterior (Beta v1.2.0):
// NOVIDADES (Beta v1.2.0) — teste do Nicola 14/10 08:58 ("as quantidades parecem estranhas (...) no grid da semana não
//   aparece nenhum compromisso, mas no grid do dia aparece. No mês também não está batendo (...) no filtro por tipo o
//   ideal seria abrir todo marcado"). Sessão 20261014-0900-agenda-contas.
//   — UM universo só (universo()) para linhas, números dos chips, pontos da grade e resumo da semana: o que se conta é
//     exatamente o que se vê. Antes os chips contavam compromissos escondidos pela regra de não repetir e as bordas da
//     grade, e a Semana/Mês não tinham os alertas.
//   — Alertas também na Semana e no Mês, no dia em que vencem (hoje + dias; rotina pronta e extrato ficam em hoje). Na
//     Lista, o que já venceu entra em hoje. Linha, gestos e regras do alerta continuam os de sempre.
//   — Status do alerta no filtro = o que a linha mostra: vencido (vermelho) conta como crítico; os demais pela
//     severidade dele. Nenhuma regra de alerta muda.
//   — Assunto abre com todos marcados; desmarca o que não quer ver ("Marcar todos" / "Desmarcar todos").
// Versão anterior (Beta v1.1.0):
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

export const VERSAO = '1.8.0';

const TIPOS = {
    ocorrencia:   { rotulo: 'Ocorrência',  icone: 'wrench',          dominio: 'ocorrencias' },
    recebimento:  { rotulo: 'Recebimento', icone: 'arrow-down-left', dominio: 'financeiro' },
    pagamento:    { rotulo: 'Pagamento',   icone: 'arrow-up-right',  dominio: 'financeiro' },
    contrato_fim: { rotulo: 'Contrato',    icone: 'file-x',          dominio: 'contratos' },
    reajuste:     { rotulo: 'Reajuste',    icone: 'trending-up',     dominio: 'contratos' },
    documento:    { rotulo: 'Documento',   icone: 'file-clock',      dominio: 'documentos' },
    membro:       { rotulo: 'Rebanho',     icone: 'beef',            dominio: 'ativos' }, // v1.5.0 (fatia 7)
    feriado:      { rotulo: 'Feriado',     icone: 'party-popper',    dominio: 'feriados' }, // v1.8.0 (bf1c1ba7)
};
const ASSUNTOS = [['ativos', 'Ativos'], ['itens', 'Itens de controle'], ['contratos', 'Contratos e usos'], ['ocorrencias', 'Ocorrências'], ['financeiro', 'Financeiro'], ['documentos', 'Documentos'], ['feriados', 'Feriados']]; // v1.8.0 — feriados
const STATUS = [['critico', 'Crítico'], ['atencao', 'Atenção'], ['informativo', 'Informativo']];
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const MES_CURTO = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const DIA_SEM = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const JANELA_ATENCAO = 7; // D7.10

const st = { vista: 'mes', semana: null, mes: null, dia: null, status: new Set(), assuntos: null, dados: [], seq: 0, el: null };

// ---- datas (data local, ISO yyyy-mm-dd)
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const deIso = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const somaDias = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const inicioSemana = (d) => somaDias(d, -((d.getDay() + 6) % 7)); // segunda
const hoje = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const moeda = (v) => (v == null ? '' : (typeof formatarMoedaBR === 'function' ? formatarMoedaBR(v) : Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })));

// ---- status e assunto
function statusCompromisso(r) { // D7.10 — só para o compromisso da Agenda
    if (r.tipo === 'feriado') return 'informativo'; // v1.8.0 — feriado não pede ação
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
// v1.3.0 — o alerta fica na data do FATO GERADOR (Nicola 14/10 09:50: "um alerta há 14 dias pendente que foi originado
// de algo no dia 01.10 tem que aparecer no 01.10 com a tag de alerta há 14 dias"), pela mesma leitura da linha do alerta:
// prazo (dias até vencer; negativo = já venceu) → hoje + dias; extrato desatualizado e rotina pronta contam dias DESDE o
// fato → hoje − |dias|; sem dias → hoje. Vencido aparece vermelho na linha e conta como crítico; os outros pela severidade.
const ehRotina = (a) => (typeof ROTINA_PRONTA_ALERTA !== 'undefined' && ROTINA_PRONTA_ALERTA.includes(a.tipo_alerta)) || a.tipo_alerta === 'extrato_desatualizado';
const dataAlerta = (a) => a.dias == null ? iso(hoje()) : iso(somaDias(hoje(), ehRotina(a) ? -Math.abs(a.dias) : a.dias));
function statusAlerta(a) {
    if (a.severidade === 'critico') return 'critico';
    if (!ehRotina(a) && a.dias != null && a.dias < 0) return 'critico';
    return a.severidade === 'atencao' ? 'atencao' : 'informativo';
}
const TODOS_ASSUNTOS = () => new Set(ASSUNTOS.map(a => a[0]));
const passaStatus = (s) => !st.status.size || st.status.has(s);
const passaAssunto = (a) => st.assuntos.has(a); // v1.2.0 — começa com todos marcados; desmarcar tira

function periodo() { // o que se busca no banco: a grade inteira (Mês/Lista) ou a semana
    if (st.vista === 'semana') return [st.semana, somaDias(st.semana, 6)];
    const ini = new Date(st.mes.getFullYear(), st.mes.getMonth(), 1);
    const fim = new Date(st.mes.getFullYear(), st.mes.getMonth() + 1, 0);
    return [inicioSemana(ini), somaDias(inicioSemana(fim), 6)];
}
function tituloPeriodo() {
    if (st.vista !== 'semana') return `${MESES[st.mes.getMonth()]} ${st.mes.getFullYear()}`;
    const a = st.semana, b = somaDias(st.semana, 6);
    return a.getMonth() === b.getMonth() ? `${a.getDate()}–${b.getDate()} ${MES_CURTO[a.getMonth()]}` : `${a.getDate()} ${MES_CURTO[a.getMonth()]} – ${b.getDate()} ${MES_CURTO[b.getMonth()]}`;
}
const mesTemHoje = () => st.mes.getFullYear() === hoje().getFullYear() && st.mes.getMonth() === hoje().getMonth();
// (alertasVisiveisTodos é um `let` do index: lido pelo nome, não por window)
const alertasMotor = () => (typeof alertasVisiveisTodos !== 'undefined' && Array.isArray(alertasVisiveisTodos)) ? alertasVisiveisTodos : [];

// v1.2.0 — UM universo para tudo (linhas, números dos chips, pontos, resumo): o mesmo conjunto em todas as contas.
// Cada item: { tipo: 'c'|'a', dia, status, assunto, r (compromisso) | a (alerta), i (índice em st.dados) }.
// v1.3.0 — tudo no dia do fato gerador, nas três vistas (o que está pendente leva a tag "há N dias").
function universo(de, ate) {
    const alertas = alertasMotor();
    const entAlerta = new Set(alertas.map(a => a.entidade_id).filter(Boolean));
    const limiteDup = iso(somaDias(hoje(), JANELA_ATENCAO));
    const itens = [];
    alertas.forEach(a => {
        const dia = dataAlerta(a);
        if (dia >= de && dia <= ate) itens.push({ tipo: 'a', dia, status: statusAlerta(a), assunto: assuntoAlerta(a), a });
    });
    st.dados.forEach((r, i) => {
        if (entAlerta.has(r.entidade_id) && r.data <= limiteDup) return; // o alerta já mostra (não repete)
        const dia = r.data;
        if (dia >= de && dia <= ate) itens.push({ tipo: 'c', dia, status: statusCompromisso(r), assunto: assuntoCompromisso(r), r, i });
    });
    return itens;
}
const visivel = (it) => passaStatus(it.status) && passaAssunto(it.assunto);
function intervaloContado() { // o que os números contam (sem as bordas da grade)
    if (st.vista === 'semana') return [iso(st.semana), iso(somaDias(st.semana, 6))];
    const ini = iso(new Date(st.mes.getFullYear(), st.mes.getMonth(), 1)), fim = iso(new Date(st.mes.getFullYear(), st.mes.getMonth() + 1, 0));
    return [ini, fim];
}

// ---- entrada (chamada pelo index: rzAgendaVista)
export async function montarAgenda(vista, el) {
    st.el = el || st.el;
    if (!st.el) return;
    st.vista = ['semana', 'mes', 'alertas'].includes(vista) ? vista : (st.vista || 'mes'); // v1.6.0 — + Alertas; sem vista: mantém a atual
    if (!st.mes) st.mes = new Date(hoje().getFullYear(), hoje().getMonth(), 1);
    if (!st.dia) st.dia = iso(hoje());
    if (!st.semana) st.semana = inicioSemana(hoje());
    if (!st.assuntos) st.assuntos = TODOS_ASSUNTOS();
    window.rzAgendaRedesenhar = () => { if (st.el && st.el.isConnected) desenhar(false); };
    await carregar();
}

// v1.6.0 (item 36) — a vista Alertas é a lista de alertas de sempre (#agenda-lista do index), logo abaixo das abas
function mostrarListaAlertas(mostrar) {
    const lista = document.getElementById('agenda-lista');
    if (!lista || !st.el) return;
    if (lista.previousElementSibling !== st.el) st.el.after(lista);
    lista.hidden = !mostrar;
}

async function carregar() {
    const meu = ++st.seq;
    mostrarListaAlertas(st.vista === 'alertas');
    if (st.vista === 'alertas') { desenhar(false); return; } // a lista vem do index (montarAlertasPatrimonio)
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
    const [de, ate] = intervaloContado();
    const base = carregando ? [] : universo(de, ate).filter(it => passaAssunto(it.assunto));
    const conta = (s) => base.filter(it => it.status === s).length;
    const todos = st.assuntos.size === ASSUNTOS.length;
    const rotAss = todos ? 'Assunto' : !st.assuntos.size ? 'Nenhum assunto' : st.assuntos.size === 1 ? ASSUNTOS.find(a => st.assuntos.has(a[0]))[1] : `Assunto · ${st.assuntos.size} de ${ASSUNTOS.length}`;
    const abas = `<div class="rz-seg rz-fin-abas" role="tablist" aria-label="Vista da agenda">
            ${[['mes', 'Mês'], ['semana', 'Semana'], ['alertas', 'Alertas']].map(([k, n]) => `<button type="button" class="${st.vista === k ? 'rz-on' : ''}" data-ag-vista="${k}">${n}</button>`).join('')}
        </div>`;
    if (st.vista === 'alertas') { // v1.6.0 — título fixo, sem setas de período; a busca e a severidade são as da lista
        st.el.innerHTML = `<div class="rz-fin-topo"><div class="rz-mes-bar rz-mes-titulo"><span class="rz-mes-centro"><b class="rz-mes-label">Alertas</b></span></div></div>${abas}`;
        ligar(); rzIcones(); return;
    }
    st.el.innerHTML = `
        <div class="rz-fin-topo">
            <div class="rz-mes-bar rz-mes-titulo">
                <button type="button" class="rz-ico-btn" data-ag-nav="-1" aria-label="Anterior"><svg data-lucide="chevron-left"></svg></button>
                <span class="rz-mes-centro"><b class="rz-mes-label">${rzEsc(tituloPeriodo())}</b></span>
                <button type="button" class="rz-ico-btn" data-ag-nav="1" aria-label="Próximo"><svg data-lucide="chevron-right"></svg></button>
            </div>
            <button type="button" class="rz-ico-btn rz-fin-lupa" data-ag-mais aria-label="Mais ações"><svg data-lucide="more-vertical"></svg></button>
        </div>
        ${abas}
        <div class="rz-chips rz-ag-chips">
            ${STATUS.map(([k, n]) => `<button type="button" class="rz-chip${st.status.has(k) ? ' rz-on' : ''}" data-ag-st="${k}"><span class="rz-ag-pt rz-ag-${k}"></span>${n}${carregando ? '' : ` <span class="rz-n">${conta(k)}</span>`}</button>`).join('')}
            <button type="button" class="rz-chip rz-ag-ass${todos ? '' : ' rz-on'}" data-ag-ass>${rzEsc(rotAss)} <svg data-lucide="chevron-down"></svg></button>
        </div>
        <div id="ag-corpo">${carregando ? (typeof rzSkeleton === 'function' ? rzSkeleton('lista', 4) : '') : (st.vista === 'semana' ? semanaHtml() : mesHtml())}</div>`;
    ligar();
    if (!carregando && typeof rzLigarGestosAlertas === 'function') {
        const m = st.el.querySelector('#ag-corpo');
        if (m && m.querySelector('[data-rz-alerta],[data-rz-grupo]')) rzLigarGestosAlertas(m); // gestos de sempre
    }
    rzIcones();
}

// ---- linhas
function linhaHtml(r, i) {
    const t = TIPOS[r.tipo] || { icone: 'circle', rotulo: '' };
    const s = statusCompromisso(r);
    const sub = [r.sub, r.situacao === 'realizado' ? 'realizado' : ''].filter(Boolean).join(' · ') || t.rotulo;
    const diasAtraso = r.atrasado ? Math.round((hoje() - deIso(r.data)) / 86400000) : 0;
    const selo = diasAtraso > 0 ? ((typeof renderStatus === 'function') ? renderStatus('bad', `Há ${diasAtraso}d`) : `<span class="rz-st rz-bad">Há ${diasAtraso}d</span>`) : '';
    return `<button type="button" class="rz-row rz-link rz-ag-linha rz-ag-${s}" data-ag-i="${i}">
        <div class="rz-ic"><svg data-lucide="${r.situacao === 'realizado' ? 'check' : t.icone}"></svg></div>
        <div class="rz-tx"><b>${rzEsc(r.titulo || t.rotulo)}</b><span>${rzEsc(sub)}</span></div>
        ${selo}${r.valor != null ? `<span class="rz-ag-valor">${moeda(r.valor)}</span>` : ''}</button>`;
}
// D7.13 — dia por hora: "Dia todo" primeiro; depois um bloco por horário (quando o registro do dia trouxer hora)
function blocoComps(its) {
    const semHora = its.filter(it => !it.r.hora), comHora = its.filter(it => it.r.hora).sort((a, b) => String(a.r.hora).localeCompare(String(b.r.hora)));
    if (!comHora.length) return its.map(it => linhaHtml(it.r, it.i)).join('');
    let h = semHora.length ? `<div class="rz-ag-hora">Dia todo</div>${semHora.map(it => linhaHtml(it.r, it.i)).join('')}` : '';
    let ultima = '';
    comHora.forEach(it => { const hh = String(it.r.hora).slice(0, 5); if (hh !== ultima) { h += `<div class="rz-ag-hora">${hh}</div>`; ultima = hh; } h += linhaHtml(it.r, it.i); });
    return h;
}
// alertas: agrupados e desenhados pela função de sempre (linhaAlertaHtml), UMA chamada por tela; cada grupo vai para
// o dia mais cedo dos seus alertas
function alertasPorDia(itensAlerta) {
    const porDia = new Map();
    if (!itensAlerta.length || typeof agruparEMapearAlertas !== 'function' || typeof linhaAlertaHtml !== 'function') return porDia;
    const diaDaChave = new Map(itensAlerta.map(it => [it.a.alerta_chave, it.dia]));
    const mapeados = agruparEMapearAlertas(itensAlerta.map(it => it.a));
    if (typeof rzOrdemAlertas === 'function') mapeados.sort(rzOrdemAlertas);
    mapeados.forEach(m => {
        const chaves = m.alertaChave ? [m.alertaChave] : (m.grupoChaves || []);
        const dia = chaves.map(c => diaDaChave.get(c)).filter(Boolean).sort()[0] || iso(hoje());
        if (!porDia.has(dia)) porDia.set(dia, []);
        porDia.get(dia).push(linhaAlertaHtml(m));
    });
    return porDia;
}
const rotDia = (di) => { const d = deIso(di); return `${DIA_SEM[d.getDay()]} ${d.getDate()}${di === iso(hoje()) ? ' · hoje' : ''}`; };
function cardDoDia(di, its, alertaHtml) {
    const comps = its.filter(it => it.tipo === 'c');
    return `<div class="rz-card rz-list">${(alertaHtml || []).join('')}${blocoComps(comps)}</div>`;
}

// ---- pontos por status, do mesmo universo
function pontosDe(its, di) {
    const ss = new Set(its.filter(it => it.dia === di).map(it => it.status));
    return `<span class="rz-ag-pts">${['critico', 'atencao', 'informativo'].filter(s => ss.has(s)).map(s => `<i class="rz-ag-${s}"></i>`).join('')}</span>`;
}
function listaDoDia(its) {
    const d = deIso(st.dia);
    const doDia = its.filter(it => it.dia === st.dia);
    const alertas = alertasPorDia(doDia.filter(it => it.tipo === 'a'));
    return `<div class="rz-group rz-ag-dia${st.dia === iso(hoje()) ? ' rz-ag-hoje' : ''}">${DIA_SEM[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}<span>${doDia.length || '—'}</span></div>
        ${doDia.length ? cardDoDia(st.dia, doDia, alertas.get(st.dia)) : '<p class="rz-desc rz-ag-nada">Nada neste dia.</p>'}`;
}

// ---- Semana (D7.9): faixa de 7 dias + resumo + dia
function semanaHtml() {
    const a = iso(st.semana), b = iso(somaDias(st.semana, 6));
    const its = universo(a, b).filter(visivel);
    let faixa = '';
    for (let k = 0; k < 7; k++) {
        const d = somaDias(st.semana, k), di = iso(d);
        faixa += `<button type="button" class="rz-ag-cel${di === st.dia ? ' rz-on' : ''}${di === iso(hoje()) ? ' rz-ag-cel-hoje' : ''}" data-ag-dia="${di}">
            <small>${DIA_SEM[d.getDay()]}</small><b>${d.getDate()}</b>${pontosDe(its, di)}</button>`;
    }
    const crit = its.filter(it => it.status === 'critico').length;
    return `<div class="rz-ag-grade" style="touch-action:pan-y">${faixa}</div>
        <p class="rz-ag-resumo"><b>${its.length}</b> na semana${crit ? ` · <span class="rz-ag-txt-critico"><b>${crit}</b> crítico${crit > 1 ? 's' : ''}</span>` : ''}</p>${listaDoDia(its)}`;
}

// ---- Mês
function mesHtml() {
    const [de, ate] = periodo();
    const its = universo(iso(de), iso(ate)).filter(visivel);
    const mesAtual = st.mes.getMonth();
    let grade = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map(s => `<div class="rz-ag-sem">${s}</div>`).join('');
    for (let k = 0; k < 42; k++) {
        const d = somaDias(de, k), di = iso(d);
        if (k >= 35 && d.getMonth() !== mesAtual) break; // 5 semanas bastam
        grade += `<button type="button" class="rz-ag-cel${d.getMonth() !== mesAtual ? ' rz-ag-fora' : ''}${di === st.dia ? ' rz-on' : ''}${di === iso(hoje()) ? ' rz-ag-cel-hoje' : ''}" data-ag-dia="${di}">
            <b>${d.getDate()}</b>${pontosDe(its, di)}</button>`;
    }
    return `<div class="rz-ag-grade" style="touch-action:pan-x">${grade}</div>${listaDoDia(its)}`;
}

// ---- eventos
function ligar() {
    st.el.querySelectorAll('[data-ag-vista]').forEach(b => b.addEventListener('click', () => {
        const v = b.dataset.agVista;
        if (v === st.vista) return;
        if (v === 'semana') { st.semana = inicioSemana(deIso(st.dia)); }
        else if (v === 'mes') { const d = deIso(st.dia); st.mes = new Date(d.getFullYear(), d.getMonth(), 1); }
        st.vista = v;
        carregar();
    }));
    st.el.querySelectorAll('[data-ag-nav]').forEach(b => b.addEventListener('click', () => navegar(Number(b.dataset.agNav))));
    // v1.6.0 (item 35) — arrastar: Semana para os lados, Mês para cima/baixo (para cima/esquerda = próximo)
    const grade = st.el.querySelector('.rz-ag-grade');
    if (grade) {
        let x0 = null, y0 = null;
        grade.addEventListener('touchstart', (e) => { const t = e.touches[0]; x0 = t.clientX; y0 = t.clientY; }, { passive: true });
        grade.addEventListener('touchend', (e) => {
            if (x0 === null) return;
            const t = e.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0; x0 = y0 = null;
            if (st.vista === 'semana' && Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) navegar(dx < 0 ? 1 : -1);
            else if (st.vista === 'mes' && Math.abs(dy) > 40 && Math.abs(dy) > Math.abs(dx) * 1.3) navegar(dy < 0 ? 1 : -1);
        }, { passive: true });
    }
    st.el.querySelectorAll('[data-ag-st]').forEach(b => b.addEventListener('click', () => {
        const k = b.dataset.agSt; st.status.has(k) ? st.status.delete(k) : st.status.add(k); desenhar(false);
    }));
    const ass = st.el.querySelector('[data-ag-ass]');
    if (ass) ass.addEventListener('click', abrirAssunto);
    st.el.querySelectorAll('[data-ag-dia]').forEach(b => b.addEventListener('click', () => { st.dia = b.dataset.agDia; desenhar(false); }));
    st.el.querySelectorAll('[data-ag-i]').forEach(b => b.addEventListener('click', () => abrirCompromisso(st.dados[Number(b.dataset.agI)])));
    const mais = st.el.querySelector('[data-ag-mais]');
    if (mais) mais.addEventListener('click', () => abrirSheetAcoes({ titulo: 'Agenda', sub: tituloPeriodo(), acoes: [
        { icone: 'send', titulo: 'Enviar a semana', sub: 'Compartilhar com uma pessoa', aoTocar: enviarSemana },
    ] }));
}

function navegar(n) {
    if (st.vista === 'semana') {
        st.semana = somaDias(st.semana, 7 * n);
        const h = iso(hoje()); st.dia = (h >= iso(st.semana) && h <= iso(somaDias(st.semana, 6))) ? h : iso(st.semana);
    } else if (st.vista === 'mes') {
        st.mes = new Date(st.mes.getFullYear(), st.mes.getMonth() + n, 1);
        st.dia = mesTemHoje() ? iso(hoje()) : iso(st.mes);
    } else return;
    carregar();
}

// Assunto (D7.11; v1.2.0 lógica do Nicola 14/10: abre com TODOS marcados, desmarca o que não quer ver)
function abrirAssunto() {
    const marcados = new Set(st.assuntos);
    const [de, ate] = intervaloContado();
    const base = universo(de, ate).filter(it => passaStatus(it.status)).map(it => it.assunto);
    const corpo = () => ASSUNTOS.map(([k, n]) => `<button type="button" class="rz-row rz-link rz-ag-op${marcados.has(k) ? ' rz-on' : ''}" data-ag-op="${k}">
            <span class="rz-ag-ck">${marcados.has(k) ? '<svg data-lucide="check"></svg>' : ''}</span>
            <div class="rz-tx"><b>${n}</b></div><span class="rz-ag-valor">${base.filter(x => x === k).length}</span></button>`).join('')
        + `<button type="button" class="rz-btn rz-btn-1 rz-ag-bt" data-ag-aplicar${marcados.size ? '' : ' disabled'}>${marcados.size ? 'Mostrar' : 'Marque ao menos um'}</button>
           <button type="button" class="rz-btn rz-ag-bt" data-ag-todos>${marcados.size === ASSUNTOS.length ? 'Desmarcar todos' : 'Marcar todos'}</button>`;
    const sh = abrirSheet(rzSheetCabecalho('Assunto', 'Desmarque o que não quer ver') + `<div class="rz-sh-b" id="ag-ass-corpo">${corpo()}</div>`);
    const ligarOps = () => {
        const c = sh.querySelector('#ag-ass-corpo');
        const redesenhar = () => { c.innerHTML = corpo(); ligarOps(); rzIcones(); };
        c.querySelectorAll('[data-ag-op]').forEach(o => o.addEventListener('click', () => {
            const k = o.dataset.agOp; marcados.has(k) ? marcados.delete(k) : marcados.add(k); redesenhar();
        }));
        c.querySelector('[data-ag-aplicar]').addEventListener('click', () => { if (!marcados.size) return; st.assuntos = marcados; fecharSheet(); desenhar(false); });
        c.querySelector('[data-ag-todos]').addEventListener('click', () => {
            if (marcados.size === ASSUNTOS.length) marcados.clear(); else ASSUNTOS.forEach(a => marcados.add(a[0]));
            redesenhar();
        });
    };
    ligarOps(); rzIcones();
}

// Toque no compromisso: abre o lugar dele pelos caminhos que já existem.
function abrirCompromisso(r) {
    if (!r) return;
    if (r.tipo === 'feriado') { if (typeof mostrarToast === 'function') mostrarToast(`${r.titulo} · ${r.sub || 'Nacional'}`); return; } // v1.8.0
    if (r.entidade_tipo === 'item_controle') { abrirAlertaItemControle(r.entidade_id, r.ativo_id || ''); return; }
    if (r.entidade_tipo === 'contrato') { abrirFichaContrato(r.entidade_id); return; }
    if (r.entidade_tipo === 'membro') { import('./cofre-membros.js').then(m => m.abrirFichaMembro(r.entidade_id)).catch(() => mostrarToast('Não consegui abrir.')); return; } // v1.5.0
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
        const doDia = dados.filter(r => r.data === di && passaStatus(statusCompromisso(r)) && passaAssunto(assuntoCompromisso(r)));
        if (!doDia.length) continue;
        linhas.push(`*${DIA_SEM[d.getDay()]} ${d.getDate()}/${String(d.getMonth() + 1).padStart(2, '0')}*`);
        doDia.forEach(r => linhas.push(`• ${r.hora ? String(r.hora).slice(0, 5) + ' ' : ''}${r.titulo}${r.valor != null ? ' · ' + moeda(r.valor) : ''}${r.atrasado ? ' (atrasado)' : ''}`));
    }
    const cab = `Agenda ${ini.getDate()}/${String(ini.getMonth() + 1).padStart(2, '0')} a ${fim.getDate()}/${String(fim.getMonth() + 1).padStart(2, '0')}`;
    const texto = linhas.length ? `${cab}\n\n${linhas.join('\n')}` : `${cab}\n\nNada marcado nesta semana.`;
    if (typeof rzDev === 'function') rzDev('whatsapp', '', texto);
    else window.open('https://wa.me/?text=' + encodeURIComponent(texto), '_blank');
}
