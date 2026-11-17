// ============================================================================
// conciliacao-pilhas.js — Raiz Patrimônio · Financeiro › Conciliação: as linhas do extrato do mês em 4 pilhas
// Versão: 1.1.0 · 17/11/2026
//
// v1.1.0 (17/11/2026, sessão 20261117-0755-financeiro-conciliacao, demanda 679b2700; teste do Nicola 17/11 10:01 e de acordo
// 13:14; FICHA_CONCILIACAO_LIGAR_BAIXA_RAIZ v1.1.0) — (1) A LISTA BATE COM O NÚMERO: a pilha com linhas para tratar mostra só
// elas ("11 para tratar" abre 11); a pilha toda feita mostra as feitas ("19 em ordem" abre 19); as feitas das pilhas que ainda
// têm pendência ficam no botão "Em ordem neste mês", com o Desfazer. Anterior e próximo andam dentro da lista aberta.
// (2) LIGAR À BAIXA JÁ FEITA: quando o motor aponta um mês baixado à mão e sem linha do extrato (acao ligar_baixa_atualizar), o
// detalhe mostra "Ligar à baixa de MM/AAAA" com o antes e o depois do recebimento (data, valor) e a opção de atualizar pelo
// extrato; grava pela fn_extrato_ligar_baixa (ctx.ligarBaixa). Versão anterior: 1.0.0
//
// v1.0.0 (17/11/2026, sessão 20261117-0755-financeiro-conciliacao, demanda 679b2700; FICHA_REVISAO_FINANCEIRO_RAIZ v1.0.0,
// Onda 2, decisão D5; de acordo do Nicola 16/11 23:44 "de acordo com toda proposta"; protótipo
// PROTOTIPO_FINANCEIRO_REVISAO_RAIZ v1.4.0) — criação. A aba Conciliação deixa a lista corrida e passa a mostrar:
//   · TOPO: um anel com quantas linhas do extrato do mês já estão em ordem (conciliadas ou fora) sobre o total;
//   · 4 PILHAS: "O Raiz reconheceu" (sugestão com confiança ≥ CONFIANCA_RECONHECEU), "Sempre fazer assim" (pegas por uma
//     regra do cliente, R12), "Para você decidir" (o resto) e "Não controlados" (o que fica fora do resultado, e as
//     sugestões de não controlar);
//   · LISTA igual nas 4: marcar, Marcar todas, e "Aceitar as N marcadas" ou "Aceitar todas (N)" — "Aplicar" em Sempre fazer
//     assim e "Manter fora" em Não controlados. Só entra no lote a sugestão que se confirma sozinha;
//   · DETALHE igual nas 4: o cartão "O que o Raiz leu", anterior e próximo, Aceitar, É outra coisa, Pular, Não controlar
//     (Controlar em Não controlados) e Desfazer.
// Banco: quem grava é o financeiro.js (ctx.tratarLote, ctx.estornarLote, ctx.ligarBaixa). "Pular" vale só enquanto a página
// está aberta e não grava nada. A recomendação é sempre a do motor (ctx.sugestoes): esta tela não recalcula nada.
// ============================================================================
export const VERSAO = '1.1.0';

import { rzToast } from './raiz-ui.js';

/** Confiança mínima (0–100) para a sugestão entrar em "O Raiz reconheceu". */
export const CONFIANCA_RECONHECEU = 90;

const PILHAS = {
    rec: { nome: 'O Raiz reconheceu', sub: `${CONFIANCA_RECONHECEU}% ou mais de confiança`, ic: 'sparkles', verbo: 'Aceitar' },
    regra: { nome: 'Sempre fazer assim', sub: 'pegas pelas suas regras', ic: 'repeat', verbo: 'Aplicar' },
    dec: { nome: 'Para você decidir', sub: 'confiança baixa ou sem sugestão', ic: 'circle-help', verbo: 'Aceitar' },
    nao: { nome: 'Não controlados', sub: 'ficam fora do resultado', ic: 'eye-off', verbo: 'Manter fora' },
};
const ORDEM = ['rec', 'regra', 'dec', 'nao'];
const FEITAS = 'feitas'; // a vista "Em ordem neste mês"

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = (v) => Number(v) || 0;
const moeda = (v) => 'R$ ' + Math.abs(num(v)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const dataCurta = (iso) => { if (!iso) return ''; const [, m, d] = String(iso).slice(0, 10).split('-'); return `${d}/${m}`; };
const g = (nome) => (typeof window !== 'undefined' && typeof window[nome] === 'function') ? window[nome] : null;
const icones = () => { if (typeof lucide !== 'undefined') lucide.createIcons(); };

let CTX = null;
const pulados = new Set();   // só nesta página: Pular não grava
const marcados = new Set();
let vista = null;            // { k: chave da pilha ou FEITAS, modo: 'pend' | 'feitas' } — a lista aberta
let ocupado = false;
const origem = new Map();    // id → pilha em que a linha estava enquanto pendente (só nesta página)

// ---------------------------------------------------------------- classificação
const sugDe = (f) => (CTX?.sugestoes || {})[f.id] || null;
const pendente = (f) => f.status_conciliacao === 'pendente';

/** Em qual pilha a linha mora. A linha tratada nesta página continua na pilha de onde saiu. */
export function pilhaDe(f, sug) {
    if (origem.has(f.id)) return origem.get(f.id);
    if (f.status_conciliacao === 'nao_controlado') return 'nao';
    if (f.status_conciliacao === 'conciliado') return f.regra_codigo === 'R12' ? 'regra' : f.regra_codigo ? 'rec' : 'dec';
    if (!sug) return 'dec';
    if (sug.regra_codigo === 'R12') return 'regra';
    if (sug.acao === 'nao_controlar') return 'nao';
    return num(sug.confianca) >= CONFIANCA_RECONHECEU ? 'rec' : 'dec';
}
const ordenar = (arr) => arr.sort((a, b) => String(a.data || '').localeCompare(String(b.data || '')) || num(b.valor) - num(a.valor));
const itensDa = (k) => ordenar((CTX?.itens || []).filter(f => pilhaDe(f, sugDe(f)) === k));
const feitasDoMes = () => ordenar((CTX?.itens || []).filter(f => !pendente(f)));
/** As linhas da lista aberta: só as pendentes da pilha, ou só as feitas. */
function itensVista(v) {
    if (!v) return [];
    if (v.k === FEITAS) return feitasDoMes();
    const its = itensDa(v.k);
    return v.modo === 'feitas' ? its.filter(f => !pendente(f)) : its.filter(pendente);
}
const elegivel = (f) => pendente(f) && !!CTX?.elegivel?.(f, sugDe(f));
const ehLigarBaixa = (sug) => sug?.acao === 'ligar_baixa_atualizar' && !!sug.destino_id;

function tituloLinha(f) {
    const sug = sugDe(f);
    if (f.status_conciliacao === 'conciliado') {
        if (f.destino_tipo === 'dividido') return 'Recebimento dividido';
        if (f.regra_codigo === 'CT05') return 'Ligada à baixa já feita';
        return f.regra_codigo ? 'Automático · ' + (CTX.nomeRegra(f.regra_codigo) || f.regra_codigo) : 'Conciliada à mão';
    }
    if (f.status_conciliacao === 'nao_controlado') return f.observacao_usuario || 'Fora do resultado';
    return sug ? (sug.detalhe || CTX.nomeRegra(sug.regra_codigo) || 'Sugestão da Raiz IA') : 'Sem sugestão';
}
function statusLinha(f) {
    if (f.status_conciliacao === 'conciliado') return '<span class="rz-st rz-ok">Feito</span>';
    if (f.status_conciliacao === 'nao_controlado') return '<span class="rz-st rz-neu">Fora</span>';
    if (pulados.has(f.id)) return '<span class="rz-st rz-warn">Pulada</span>';
    const sug = sugDe(f);
    return sug ? `<span class="rz-st rz-neu">${Math.round(num(sug.confianca))}%</span>` : '<span class="rz-st rz-warn">Decidir</span>';
}
const valorHtml = (f) => { const ent = f.direcao === 'entrada'; return `<b class="${ent ? 'rz-in' : 'rz-out'}">${ent ? '+' : '−'} ${moeda(f.valor)}</b>`; };
function nomeVista(v) { return v.k === FEITAS ? 'Em ordem neste mês' : PILHAS[v.k].nome; }
function subVista(v) {
    const n = itensVista(v).length;
    if (v.k === FEITAS) return `${n} ${n === 1 ? 'linha conciliada ou fora' : 'linhas conciliadas ou fora'} · Desfazer em cada uma`;
    return v.modo === 'feitas' ? `${n} em ordem · ${PILHAS[v.k].sub}` : `${n} para tratar · ${PILHAS[v.k].sub}`;
}

// ---------------------------------------------------------------- tela da aba
/**
 * Desenha a aba Conciliação. ctx (do financeiro.js):
 *   el, itens (linhas do mês, já filtradas pela busca), sugestoes ({fingerprint_id: sugestão do motor}), rotuloMes,
 *   nome(f), nomeRegra(codigo), elegivel(f, sug), efeito(f, sug), cartaoLido(f, sug) → html, enriquecer(el, f, sug),
 *   recebimento(mensalidade_id) → {referencia, data, valor, locatario} | null,
 *   tratarLote(ids, modo 'aceitar'|'nao_controlar') → {feitas, falhas}, estornarLote(ids) → {feitas, falhas},
 *   ligarBaixa(id, mensalidade_id, atualizar) → boolean, aceitarComFormulario(id), outra(id).
 */
export function conciliacaoPilhasRender(ctx) {
    CTX = ctx;
    const el = ctx.el;
    if (!el) return;
    document.getElementById('tab-conciliacao')?.classList.add('rz-cp-on');
    const itens = ctx.itens || [];
    for (const f of itens) if (pendente(f) && !origem.has(f.id)) { const k = pilhaDe(f, sugDe(f)); origem.set(f.id, k); }
    for (const id of [...marcados]) { const f = itens.find(x => x.id === id); if (!f || !elegivel(f)) marcados.delete(id); }
    const total = itens.length, feitas = itens.filter(f => !pendente(f)).length;
    if (!total) {
        el.innerHTML = `<div class="rz-card rz-cp-vazio"><p>Nenhuma linha de extrato em ${esc(ctx.rotuloMes)}.</p><small>Importe o extrato pelo ⋮.</small></div>`;
        redesenharLista();
        return;
    }
    const C = 2 * Math.PI * 31, tudo = feitas === total;
    let html = `<div class="rz-card"><div class="rz-cp-anel">
        <svg class="rz-cp-ring" viewBox="0 0 74 74" aria-hidden="true"><circle cx="37" cy="37" r="31" fill="none" stroke="var(--tile)" stroke-width="8"/><circle cx="37" cy="37" r="31" fill="none" stroke="${tudo ? 'var(--success)' : 'var(--ink)'}" stroke-width="8" stroke-linecap="round" stroke-dasharray="${C.toFixed(2)}" stroke-dashoffset="${(C * (1 - feitas / total)).toFixed(2)}"/></svg>
        <div class="rz-tx"><b class="rz-cp-num">${feitas} de ${total}</b><small>linhas do extrato em ordem · ${esc(ctx.rotuloMes)}</small></div></div></div>`;
    if (tudo) html += `<div class="rz-card rz-cp-marco"><div class="rz-cp-selo"><svg data-lucide="check-check"></svg></div><b>Extrato de ${esc(ctx.rotuloMes)} em ordem</b><small>Fechar o mês está no ⋮.</small></div>`;
    html += `<div class="rz-group">Pilhas do extrato</div><div class="rz-card rz-list">` + ORDEM.map(k => {
        const p = PILHAS[k], its = itensDa(k), pend = its.filter(pendente).length, feita = its.length > 0 && pend === 0;
        if (!its.length) return `<div class="rz-row rz-cp-pilha rz-cp-zero"><div class="rz-cp-cartas"><i></i><i></i><b>0</b></div><div class="rz-tx"><b>${p.nome}</b><span>Nenhuma linha · ${p.sub}</span></div></div>`;
        return `<div class="rz-row rz-link rz-cp-pilha${feita ? ' rz-cp-feita' : ''}" role="button" tabindex="0" data-cp-pilha="${k}">
            <div class="rz-cp-cartas"><i></i><i></i><b>${feita ? '✓' : pend}</b></div>
            <div class="rz-tx"><b>${p.nome}</b><span>${feita ? `${its.length} em ordem` : `${pend} para tratar · ${p.sub}`}</span></div>
            ${feita ? '<span class="rz-st rz-ok">Feito</span>' : ''}<svg data-lucide="chevron-right" class="rz-chev"></svg></div>`;
    }).join('') + (feitas ? `<div class="rz-row rz-link rz-cp-pilha rz-cp-emordem" role="button" tabindex="0" data-cp-pilha="${FEITAS}">
            <div class="rz-cp-cartas"><i></i><i></i><b>${feitas}</b></div>
            <div class="rz-tx"><b>Em ordem neste mês</b><span>conciliadas e fora do resultado · Desfazer em cada uma</span></div>
            <svg data-lucide="chevron-right" class="rz-chev"></svg></div>` : '') + '</div>';
    el.innerHTML = html;
    el.querySelectorAll('[data-cp-pilha]').forEach(b => {
        const abrir = () => abrirPilha(b.dataset.cpPilha);
        b.addEventListener('click', abrir);
        b.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); abrir(); } });
    });
    icones();
    redesenharLista();
}

// ---------------------------------------------------------------- lista da pilha (a mesma para as 4)
function abrirPilha(k) {
    const temPend = k !== FEITAS && itensDa(k).some(pendente);
    vista = { k, modo: k === FEITAS ? 'feitas' : temPend ? 'pend' : 'feitas' };
    marcados.clear();
    const cab = g('rzSheetCabecalho') ? g('rzSheetCabecalho')(nomeVista(vista), subVista(vista)) : `<div class="rz-sh-h"><h3>${esc(nomeVista(vista))}</h3></div>`;
    g('abrirSheet')?.(cab + `<div class="rz-sh-b" id="cp-pl-corpo"></div><div class="rz-sh-f" id="cp-pl-pe"></div>`, { aoFechar: () => { vista = null; marcados.clear(); } });
    redesenharLista();
}

function redesenharLista() {
    const corpo = document.getElementById('cp-pl-corpo');
    if (!corpo || !vista) return;
    const v = vista, its = itensVista(v);
    const verbo = v.k === FEITAS ? '' : PILHAS[v.k].verbo;
    const aceitaveis = v.modo === 'pend' ? its.filter(elegivel) : [];
    const sub = corpo.closest('.rz-sheet')?.querySelector('.rz-sh-h .rz-sub');
    if (sub) sub.textContent = subVista(v);
    const linhas = its.map(f => {
        const pode = elegivel(f), on = pode && marcados.has(f.id);
        const cb = v.modo === 'pend'
            ? `<button type="button" class="rz-cp-cb${on ? ' rz-on' : ''}" data-cp-marcar="${f.id}" ${pode ? '' : 'disabled'} aria-label="${on ? 'Desmarcar' : 'Marcar'}" aria-pressed="${on}"><svg data-lucide="${on ? 'square-check-big' : 'circle'}"></svg></button>`
            : '';
        return `<div class="rz-row rz-cp-lin${pendente(f) ? '' : ' rz-cp-feito'}" data-cp-item="${f.id}">${cb}
            <div class="rz-tx"><b>${esc(tituloLinha(f))}</b><span>${dataCurta(f.data)} · ${esc(CTX.nome(f))}</span></div>
            <div class="rz-rt">${valorHtml(f)}${statusLinha(f)}</div>
            <svg data-lucide="chevron-right" class="rz-chev"></svg></div>`;
    }).join('');
    const marcadosAqui = [...marcados].filter(id => aceitaveis.some(f => f.id === id));
    const vazio = v.modo === 'pend' ? 'Nada para tratar nesta pilha.' : 'Nenhuma linha em ordem ainda.';
    corpo.innerHTML = `${aceitaveis.length ? `<div class="rz-chips rz-cp-chips"><button type="button" class="rz-chip" data-cp-todas>Marcar todas</button>${marcadosAqui.length ? '<button type="button" class="rz-chip" data-cp-nenhuma>Desmarcar</button>' : ''}</div>` : ''}
        ${its.length ? `<div class="rz-card rz-list">${linhas}</div>` : `<p class="rz-desc">${vazio}</p>`}
        ${v.modo === 'pend' && its.length ? `<p class="rz-desc rz-cp-dica">Marque para tratar em lote, ou toque na linha para ver o que o Raiz leu.${its.length > aceitaveis.length ? ' A linha sem marcação se trata uma a uma.' : ''}</p>` : ''}`;
    const pe = document.getElementById('cp-pl-pe');
    if (pe) {
        const rot = !verbo ? '' : marcadosAqui.length ? `${verbo} ${marcadosAqui.length === 1 ? 'a marcada' : `as ${marcadosAqui.length} marcadas`}` : aceitaveis.length ? `${verbo} todas (${aceitaveis.length})` : '';
        pe.hidden = !rot;
        pe.innerHTML = rot ? `<button type="button" class="rz-btn rz-btn-1" data-cp-lote>${rot}</button>` : '';
        pe.querySelector('[data-cp-lote]')?.addEventListener('click', () => tratarLote(v.k, marcadosAqui.length ? marcadosAqui : aceitaveis.map(f => f.id)));
    }
    corpo.querySelectorAll('[data-cp-marcar]').forEach(b => b.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const id = b.dataset.cpMarcar;
        if (marcados.has(id)) marcados.delete(id); else marcados.add(id);
        redesenharLista();
    }));
    corpo.querySelector('[data-cp-todas]')?.addEventListener('click', () => { aceitaveis.forEach(f => marcados.add(f.id)); redesenharLista(); });
    corpo.querySelector('[data-cp-nenhuma]')?.addEventListener('click', () => { marcados.clear(); redesenharLista(); });
    corpo.querySelectorAll('[data-cp-item]').forEach(r => r.addEventListener('click', () => abrirItem(r.dataset.cpItem)));
    icones();
}

async function tratarLote(k, ids) {
    if (ocupado || !ids.length) return;
    ocupado = true;
    const pe = document.getElementById('cp-pl-pe')?.querySelector('button');
    if (pe) { pe.disabled = true; pe.textContent = 'Tratando…'; }
    try {
        const r = await CTX.tratarLote(ids, k === 'nao' ? 'nao_controlar' : 'aceitar');
        marcados.clear();
        const n = r.feitas.length;
        if (n) rzToast(`${n} ${n === 1 ? 'linha tratada' : 'linhas tratadas'}${r.falhas.length ? ` · ${r.falhas.length} não deu` : ''}`, { desfazer: () => desfazerLote(r.feitas) });
        else rzToast('Nenhuma linha foi tratada.', { tipo: 'danger' });
    } finally { ocupado = false; redesenharLista(); }
}
async function desfazerLote(ids) {
    const r = await CTX.estornarLote(ids);
    rzToast(r.falhas.length ? `${r.feitas.length} voltaram para tratar · ${r.falhas.length} não deu` : `${r.feitas.length === 1 ? 'A linha voltou' : 'As linhas voltaram'} para tratar.`, r.falhas.length ? { tipo: 'danger' } : undefined);
}

// ---------------------------------------------------------------- detalhe do item (o mesmo para as 4)
function abrirItem(id) {
    const f = (CTX.itens || []).find(x => x.id === id);
    if (!f) return;
    const k = pilhaDe(f, sugDe(f)), p = PILHAS[k];
    // anterior e próximo andam dentro da lista aberta; se a linha já saiu dela (foi tratada), dentro da pilha
    let its = itensVista(vista);
    if (!its.some(x => x.id === id)) its = itensDa(k);
    const pos = its.findIndex(x => x.id === id), ant = its[pos - 1], prox = its[pos + 1];
    const sug = sugDe(f), ent = f.direcao === 'entrada', pend = pendente(f), nao = k === 'nao';
    const estado = f.status_conciliacao === 'conciliado' ? 'feito' : f.status_conciliacao === 'nao_controlado' ? 'fora do resultado' : pulados.has(f.id) ? 'pulada' : '';
    const pode = elegivel(f), efeito = sug ? (CTX.efeito(f, sug) || '') : '';
    const ligar = pend && ehLigarBaixa(sug) ? CTX.recebimento?.(sug.destino_id) : null;
    const sugHtml = sug && pend
        ? `<div class="rz-seq-sug"><small>${k === 'regra' ? 'Sua regra' : 'Sugestão da Raiz IA'} · ${Math.round(num(sug.confianca))}%</small><b>${esc(sug.detalhe || CTX.nomeRegra(sug.regra_codigo))}</b>${efeito && !ligar ? `<span class="rz-desc">${esc(efeito)}</span>` : ''}</div>`
        : pend ? '<div class="rz-seq-sug rz-sem"><small>Sem sugestão</small><b>Escolha o que é esta linha</b></div>'
        : `<div class="rz-seq-sug rz-sem"><small>${f.status_conciliacao === 'conciliado' ? 'Feito' : 'Fora do resultado'}</small><b>${esc(tituloLinha(f))}</b></div>`;
    let botoes;
    if (pend) {
        const principal = ligar
            ? `<button type="button" class="rz-btn rz-btn-1" data-cp-a="ligar">Ligar à baixa de ${esc(ligar.referencia)}</button>`
            : sug ? `<button type="button" class="rz-btn rz-btn-1" data-cp-a="aceitar">${p.verbo}</button>` : '';
        botoes = `<div class="rz-seq-btns"><button type="button" class="rz-btn ${principal ? 'rz-btn-2' : 'rz-btn-1'}" data-cp-a="outra">${principal ? 'É outra coisa' : 'Escolher o que é'}</button>${principal}</div>
            ${ligar ? ligarPainelHtml(f, ligar) : ''}
            <div class="rz-seq-btns rz-cp-mais"><button type="button" class="rz-btn rz-btn-2" data-cp-a="pular"><svg data-lucide="skip-forward"></svg>Pular</button>
            ${nao ? '<button type="button" class="rz-btn rz-btn-2" data-cp-a="outra"><svg data-lucide="eye"></svg>Controlar</button>' : '<button type="button" class="rz-btn rz-btn-2" data-cp-a="nao"><svg data-lucide="eye-off"></svg>Não controlar</button>'}</div>
            ${sug && !pode && !ligar ? '<p class="rz-desc rz-cp-dica">Esta sugestão pede um formulário: o Aceitar abre ele já preenchido.</p>' : ''}`;
    } else {
        botoes = `<div class="rz-seq-btns"><button type="button" class="rz-btn rz-btn-2" data-cp-a="ver">${f.status_conciliacao === 'conciliado' ? 'Ver o que foi feito' : 'Ver opções'}</button></div>
            <button type="button" class="rz-act rz-cp-desfazer" data-cp-a="desfazer"><div class="rz-ic"><svg data-lucide="undo-2"></svg></div><div>Desfazer<small>a linha volta para tratar${f.status_conciliacao === 'conciliado' ? (f.regra_codigo === 'CT05' ? '; o recebimento volta ao que era antes e continua pago' : '; a despesa criada por ela sai, a que já existia volta a prevista') : ''}</small></div></button>`;
    }
    const corpo = `<div class="rz-sh-b" id="cp-item" data-id="${f.id}">
        <div class="rz-cp-trilha">${its.map((y, i) => `<i class="${i === pos ? 'rz-on' : pendente(y) ? '' : 'rz-feito'}"></i>`).join('')}</div>
        <div class="rz-card rz-seq-card rz-cp-carta">
            <small>${dataCurta(f.data)} · ${ent ? 'entrada' : 'saída'} no extrato</small>
            <b class="rz-seq-valor${ent ? ' rz-in' : ''}">${ent ? '+' : '−'} ${moeda(f.valor)}</b>
            <p class="rz-seq-nome">${esc(CTX.nome(f))}</p>
            ${sugHtml}
            ${botoes}
        </div>
        <div class="rz-group">O que o Raiz leu</div>
        <div id="cp-leu">${CTX.cartaoLido(f, sug)}</div>
    </div>`;
    const cab = (g('rzSheetCabecalho') ? g('rzSheetCabecalho')(p.nome, `${pos + 1} de ${its.length}${estado ? ' · ' + estado : ''}`) : `<div class="rz-sh-h"><h3>${p.nome}</h3></div>`);
    let s2 = document.getElementById('rz-sheet-2');
    if (s2 && s2.querySelector('#cp-item')) {
        s2.innerHTML = '<div class="rz-grab"></div>' + cab + corpo;
        const x = s2.querySelector('.rz-sh-h .rz-x');
        if (x) { x.classList.add('rz-voltar'); x.setAttribute('aria-label', 'Voltar à lista'); x.innerHTML = '<svg data-lucide="chevron-left"></svg>'; }
    } else {
        s2 = g('abrirSheet')?.(cab + corpo, { empilhar: true, aoFechar: () => setTimeout(redesenharLista, 0) });
    }
    if (!s2) return;
    // anterior e próximo no cabeçalho, antes do ‹ Voltar
    const xv = s2.querySelector('.rz-sh-h .rz-x');
    if (xv) xv.insertAdjacentHTML('beforebegin', `<div class="rz-cp-nav"><button type="button" class="rz-ico-btn" data-cp-nav="${ant ? ant.id : ''}" ${ant ? '' : 'disabled'} aria-label="Anterior"><svg data-lucide="chevron-left"></svg></button><button type="button" class="rz-ico-btn" data-cp-nav="${prox ? prox.id : ''}" ${prox ? '' : 'disabled'} aria-label="Próximo"><svg data-lucide="chevron-right"></svg></button></div>`);
    s2.querySelectorAll('[data-cp-nav]').forEach(b => b.addEventListener('click', () => { if (b.dataset.cpNav) abrirItem(b.dataset.cpNav); }));
    s2.querySelectorAll('[data-cp-a]').forEach(b => b.addEventListener('click', () => agir(b.dataset.cpA, f)));
    try { CTX.enriquecer(s2.querySelector('#cp-leu'), f, sug); } catch (e) { /* o cartão curto basta */ }
    icones();
}

/** Painel "Ligar à baixa": o antes e o depois do recebimento, escondido até tocar no botão. */
function ligarPainelHtml(f, r) {
    const muda = (a, b) => a !== b ? `<s>${esc(a)}</s> → <b>${esc(b)}</b>` : `<b>${esc(b)}</b>`;
    const dataExtrato = String(f.data || '').slice(0, 10).split('-').reverse().join('/');
    return `<div class="rz-cp-conf rz-cp-ligar" hidden>
        <p>O recebimento de <b>${esc(r.locatario || '')} · ${esc(r.referencia)}</b> já foi baixado à mão. Esta linha do extrato passa a ser o pagamento dele.</p>
        <div class="rz-cp-antes">
            <div><span>Data do pagamento</span><em>${muda(r.data || '—', dataExtrato)}</em></div>
            <div><span>Valor</span><em>${muda(moeda(r.valor), moeda(f.valor))}</em></div>
            <div><span>Observação</span><em><b>+ o registro do extrato</b></em></div>
        </div>
        <label class="rz-row rz-chk rz-cp-atualizar"><input type="checkbox" checked data-cp-atualizar> Atualizar data e valor pelo extrato</label>
        <p class="rz-desc">Desmarcado, só liga a linha à baixa, sem mudar o recebimento. Desfazer devolve tudo como era.</p>
        <div class="rz-seq-btns"><button type="button" class="rz-btn rz-btn-2" data-cp-conf="nao">Cancelar</button><button type="button" class="rz-btn rz-btn-1" data-cp-conf="sim">Ligar</button></div>
    </div>`;
}

/** Próxima linha da mesma pilha para tratar (pendente e não pulada), depois da atual e voltando ao começo. */
function proximaDepois(k, id) {
    const its = itensDa(k), i = its.findIndex(x => x.id === id);
    const ordem = [...its.slice(i + 1), ...its.slice(0, Math.max(0, i))];
    return ordem.find(x => pendente(x) && !pulados.has(x.id)) || null;
}
function seguir(k, id) {
    const prox = vista?.modo === 'feitas' ? null : proximaDepois(k, id);
    if (prox) { abrirItem(prox.id); return; }
    if (document.getElementById('rz-sheet-2')) g('fecharSheet')?.();
    redesenharLista();
    const resta = itensDa(k).filter(pendente).length;
    rzToast(resta ? `Fim da pilha. ${resta} ${resta === 1 ? 'ficou' : 'ficaram'} para depois.` : `${PILHAS[k].nome}: tudo tratado.`);
}

async function agir(acao, f) {
    if (ocupado) return;
    const k = pilhaDe(f, sugDe(f));
    const carta = document.querySelector('#rz-sheet-2 .rz-cp-carta');
    if (acao === 'pular') {
        pulados.add(f.id);
        carta?.classList.add('rz-cp-sai-e');
        setTimeout(() => seguir(k, f.id), 180);
        return;
    }
    if (acao === 'outra' || acao === 'ver') { CTX.outra(f.id); return; } // o menu de opções (troca o sheet)
    if (acao === 'aceitar' && !elegivel(f)) { CTX.aceitarComFormulario(f.id); return; } // formulário já preenchido
    if (acao === 'ligar') { // abre o antes e o depois na própria carta
        const painel = carta?.querySelector('.rz-cp-ligar'), btn = carta?.querySelector('[data-cp-a="ligar"]');
        if (!painel || !btn) return;
        painel.hidden = false; btn.hidden = true;
        painel.querySelector('[data-cp-conf="nao"]').onclick = () => { painel.hidden = true; btn.hidden = false; };
        painel.querySelector('[data-cp-conf="sim"]').onclick = () => agir('ligar-ok', f);
        return;
    }
    if (acao === 'desfazer') { // a confirmação fica na própria carta: um sheet de confirmação por cima fecharia a lista
        const b = document.querySelector('#rz-sheet-2 [data-cp-a="desfazer"]');
        if (b && !b.dataset.cpConfirmar) {
            b.dataset.cpConfirmar = '1';
            b.insertAdjacentHTML('afterend', `<div class="rz-cp-conf"><p>${f.status_conciliacao === 'conciliado'
                ? (f.regra_codigo === 'CT05' ? 'A linha volta para tratar. O recebimento volta à data e ao valor de antes e continua pago.' : 'A linha volta para tratar. Se a despesa foi criada a partir dela, a despesa sai; se já existia, volta para prevista.')
                : 'A linha volta para tratar e entra de novo na conta do mês.'}</p><div class="rz-seq-btns"><button type="button" class="rz-btn rz-btn-2" data-cp-conf="nao">Cancelar</button><button type="button" class="rz-btn rz-btn-1" data-cp-conf="sim">Desfazer</button></div></div>`);
            b.hidden = true;
            const caixa = b.nextElementSibling;
            caixa.querySelector('[data-cp-conf="nao"]').addEventListener('click', () => { caixa.remove(); b.hidden = false; delete b.dataset.cpConfirmar; });
            caixa.querySelector('[data-cp-conf="sim"]').addEventListener('click', () => agir('desfazer-ok', f));
        }
        return;
    }
    ocupado = true;
    document.querySelectorAll('#rz-sheet-2 #cp-item button').forEach(b => { b.disabled = true; });
    try {
        if (acao === 'desfazer-ok') {
            const r = await CTX.estornarLote([f.id]);
            if (r.feitas.length) { pulados.delete(f.id); rzToast('A linha voltou para tratar.'); abrirItem(f.id); }
            else { rzToast('Não consegui desfazer.', { tipo: 'danger' }); abrirItem(f.id); }
            return;
        }
        let ok;
        if (acao === 'ligar-ok') {
            const atualizar = !!document.querySelector('#rz-sheet-2 [data-cp-atualizar]')?.checked;
            ok = await CTX.ligarBaixa(f.id, sugDe(f)?.destino_id, atualizar);
        } else {
            const r = await CTX.tratarLote([f.id], acao === 'nao' ? 'nao_controlar' : 'aceitar');
            ok = r.feitas.length > 0;
        }
        if (!ok) { rzToast('Não consegui tratar esta linha.', { tipo: 'danger' }); abrirItem(f.id); return; }
        pulados.delete(f.id);
        carta?.classList.add('rz-cp-sai-d');
        setTimeout(() => seguir(k, f.id), 180);
    } finally { ocupado = false; }
}
