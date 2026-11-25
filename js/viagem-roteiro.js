// ============================================================================
// viagem-roteiro.js — Raiz Patrimônio · Roteiro da viagem (programa com tipos de ciclo)
// Versão: 1.0.0 · 25/11/2026
//
// v1.0.0 (25/11/2026, sessão 20261125-0021-viagem-roteiro, demanda d8061e47; FICHA_PROGRAMA_VIAGEM_FATIA2B v1.0.0, de acordo
// do Nicola 25/11 00:21) — criação. Tela Roteiro: trechos › dias › o que está marcado no dia (fn_ciclo_roteiro), a bandeja
// "A encaixar" (registro aberto sem dia) e "Outros dias" (fora dos trechos). Encaixar marca dia e hora num registro do item ou
// inclui mais um no mesmo item — 2º hotel, voo de volta (fn_roteiro_encaixar). "Editar trechos" grava a lista inteira de uma
// vez (fn_ciclo_trechos_salvar). O dia em que se muda de cidade é do trecho que começa nele (regra do banco). As regras são do
// banco; aqui só se monta, colhe e manda. Aberto por cofre-controles.js (botão "Roteiro" e ⋮ do trecho).
// ============================================================================
export const VERSAO = '1.0.0';
import * as api from './cofre-api.js';

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const g = (nome) => (typeof window !== 'undefined' && typeof window[nome] === 'function') ? window[nome] : null;
const icones = () => { if (typeof lucide !== 'undefined') lucide.createIcons(); };
const aviso = (msg, tipo = 'info') => (g('rzToast') ? g('rzToast')(msg, tipo) : g('mostrarToast')?.(msg, tipo));
const moeda = (v) => { const f = g('formatarMoedaBR'); return f ? f(Number(v)) : 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
const dm = (iso) => { const [, m, d] = String(iso).slice(0, 10).split('-'); return `${d}/${m}`; };
const dmy = (iso) => { const [a, m, d] = String(iso).slice(0, 10).split('-'); return `${d}/${m}/${a}`; };
const SEM = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const diaRot = (iso) => { const [a, m, d] = String(iso).slice(0, 10).split('-').map(Number); return SEM[new Date(a, m - 1, d).getDay()] + ' ' + dm(iso); };
// data e hora em Brasília (o banco grava timestamptz; o dia do roteiro é o de Brasília)
const partes = (ts) => {
    if (!ts) return { data: '', hora: '' };
    const f = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
    const [data, hora] = f.format(new Date(ts)).split(' ');
    return { data, hora: hora === '00:00' ? '' : hora };
};
const ts = (data, hora) => data ? `${data}T${hora || '00:00'}:00-03:00` : null; // Brasília, sem horário de verão

let ctx = null; // { cicloId, abrirItem(itemId) }

/** Abre o roteiro da viagem. ctx: { cicloId, abrirItem(itemId) } */
export async function abrirRoteiro(c) {
    ctx = c || ctx; if (!ctx?.cicloId) return;
    const r = await ler(); if (!r) return;
    if (!r.pode_ver) { aviso('Seu perfil não vê esta viagem.', 'erro'); return; }
    const abrirSheet = g('abrirSheet'), cab = g('rzSheetCabecalho'); if (!abrirSheet || !cab) return;
    const C = r.ciclo;
    const sheet = abrirSheet(cab('Roteiro', `${C.nome} · ${dm(C.inicio)} a ${dmy(C.fim)}`) + `<div class="rz-sh-b">${corpoHtml(r)}</div>`
        + `<div class="rz-sh-f rz-exec-acoes">${r.pode_encaixar && C.situacao !== 'fechado' ? '<button type="button" class="rz-btn rz-btn-1" data-rt-novo>+ No roteiro</button>' : ''}`
        + `${r.pode_gerir && C.situacao !== 'fechado' ? '<button type="button" class="rz-btn rz-btn-3" data-rt-trechos>Editar trechos</button>' : ''}</div>`);
    icones();
    const fechado = C.situacao === 'fechado';
    sheet.querySelectorAll('[data-rt-oc]').forEach(b => b.addEventListener('click', () => acoesEntrada(r, b.dataset.rtOc, fechado)));
    sheet.querySelector('[data-rt-novo]')?.addEventListener('click', () => escolherItem(r));
    sheet.querySelector('[data-rt-trechos]')?.addEventListener('click', () => abrirEditarTrechos({ cicloId: ctx.cicloId, roteiro: r }));
}

async function ler() {
    const { data, error } = await api.dbAuth.rpc('fn_ciclo_roteiro', { p_ciclo_id: ctx.cicloId });
    if (error) { aviso(error.message || 'Não foi possível ler o roteiro.', 'erro'); return null; }
    return data;
}

function linhaEntrada(e, comHora = true) {
    const p = partes(e.inicio_em), pf = partes(e.fim_em);
    const quando = comHora ? (p.hora || 'Dia todo') + (e.fim_em ? ' – ' + (pf.data !== p.data ? dm(pf.data) + ' ' : '') + (pf.hora || '') : '') : '';
    const sub = [quando, e.valor ? moeda(e.valor) : '', e.status === 'concluido' ? 'Feito' : ''].filter(Boolean).join(' · ');
    const titulo = e.descricao ? `${e.titulo} · ${e.descricao}` : e.titulo;
    return `<button type="button" class="rz-row" data-rt-oc="${e.ocorrencia_id}" style="width:100%;text-align:left">
        <div class="rz-tx"><b>${esc(titulo)}</b>${sub ? `<span>${esc(sub)}</span>` : ''}</div>
        ${e.docs ? '<i data-lucide="paperclip"></i>' : ''}<i data-lucide="chevron-right"></i></button>`;
}
function diaHtml(d) {
    const ent = d.entradas || [];
    return `<div class="rz-group" style="margin:10px 0 2px"><span>${esc(diaRot(d.data))}</span></div>`
        + (ent.length ? `<div class="rz-list" style="padding:0">${ent.map(e => linhaEntrada(e)).join('')}</div>`
            : '<p class="rz-hint" style="margin:0 0 4px">Livre</p>');
}
function corpoHtml(r) {
    const enc = r.a_encaixar || [];
    let h = '';
    if (enc.length) h += `<div class="rz-group rz-group-t"><span>A encaixar · ${enc.length}</span></div>
        <p class="rz-hint" style="margin:0 0 6px">Ainda sem dia. Toque para marcar o dia e, se quiser, a hora.</p>
        <div class="rz-list" style="padding:0">${enc.map(e => linhaEntrada(e, false)).join('')}</div>`;
    (r.trechos || []).forEach(t => {
        const ult = (t.dias || []).length ? t.dias[t.dias.length - 1].data : t.fim;
        h += `<div class="rz-group rz-group-t" style="margin-top:14px"><span>${esc(t.nome)} · ${dm(t.inicio)} a ${dm(ult)}</span></div>`
            + ((t.dias || []).length ? t.dias.map(diaHtml).join('') : '<p class="rz-hint">Os dias deste trecho ficaram com o trecho seguinte.</p>');
    });
    const sem = r.dias_sem_trecho || [], fora = r.fora_dos_trechos || [];
    if (sem.length || fora.length) {
        const dias = [...new Set([...sem, ...fora.map(e => partes(e.inicio_em).data)])].sort();
        h += `<div class="rz-group rz-group-t" style="margin-top:14px"><span>Outros dias</span></div>`
            + dias.map(dd => diaHtml({ data: dd, entradas: fora.filter(e => partes(e.inicio_em).data === dd) })).join('');
    }
    if (!h) h = '<p class="rz-desc">Nada no roteiro ainda.</p>';
    return h;
}
function achar(r, ocId) {
    const todas = [...(r.a_encaixar || []), ...(r.fora_dos_trechos || [])];
    (r.trechos || []).forEach(t => (t.dias || []).forEach(d => todas.push(...(d.entradas || []))));
    return todas.find(e => e.ocorrencia_id === ocId);
}
function itensDoRoteiro(r) {
    const m = new Map();
    const add = (e) => { if (!m.has(e.item_id)) m.set(e.item_id, { id: e.item_id, titulo: e.titulo }); };
    (r.a_encaixar || []).forEach(add); (r.fora_dos_trechos || []).forEach(add);
    (r.trechos || []).forEach(t => (t.dias || []).forEach(d => (d.entradas || []).forEach(add)));
    return [...m.values()].sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'));
}

function acoesEntrada(r, ocId, fechado) {
    const e = achar(r, ocId); if (!e) return;
    const acoes = [];
    if (!fechado && r.pode_encaixar && e.status === 'aberto') {
        acoes.push({ icone: 'calendar-clock', titulo: e.inicio_em ? 'Mudar dia e hora' : 'Marcar dia e hora', codigo: 'cofre.controles.editar', aoTocar: () => folhaEncaixar(r, e, false) });
        acoes.push({ icone: 'copy-plus', titulo: 'Mais um em ' + e.titulo, codigo: 'cofre.controles.editar', sub: 'Outro hotel, o voo de volta…', aoTocar: () => folhaEncaixar(r, { item_id: e.item_id, titulo: e.titulo }, true) });
        if (e.inicio_em) acoes.push({ icone: 'undo-2', titulo: 'Voltar para A encaixar', codigo: 'cofre.controles.editar', aoTocar: () => mandar({ p_item_id: e.item_id, p_ocorrencia_id: e.ocorrencia_id, p_inicio_em: null }) });
    }
    acoes.push({ icone: 'paperclip', titulo: 'Abrir o item', codigo: 'cofre.controles.ver', sub: 'Documentos, pagamento e rateio', aoTocar: () => ctx.abrirItem?.(e.item_id) });
    g('abrirSheetAcoes')?.({ titulo: e.descricao ? `${e.titulo} · ${e.descricao}` : e.titulo, sub: 'Roteiro', acoes, empilhar: true });
}

function escolherItem(r) {
    const its = itensDoRoteiro(r); if (!its.length) { aviso('A viagem não tem itens.', 'erro'); return; }
    g('abrirSheetAcoes')?.({ titulo: 'No roteiro', sub: 'Escolha o item', empilhar: true,
        acoes: its.map(i => ({ icone: 'plus', titulo: i.titulo, codigo: 'cofre.controles.editar', aoTocar: () => folhaEncaixar(r, { item_id: i.id, titulo: i.titulo }, true) })) });
}

function folhaEncaixar(r, e, novo) {
    const p = partes(e.inicio_em), pf = partes(e.fim_em);
    const dataIni = p.data || (e.data_prevista && e.data_prevista >= r.ciclo.inicio && e.data_prevista <= r.ciclo.fim ? e.data_prevista : r.ciclo.inicio);
    g('abrirSheetForm')?.({
        titulo: (novo ? 'Mais um em ' : '') + e.titulo, sub: r.ciclo.nome, rotuloSalvar: novo ? 'Incluir' : 'Salvar', empilhar: true,
        corpo: `<div class="rz-row" style="gap:8px"><div class="rz-f" style="flex:1"><label for="rt-dia">Dia</label><input type="date" id="rt-dia" value="${esc(dataIni)}"></div>
                <div class="rz-f" style="flex:1"><label for="rt-hora">Hora (opcional)</label><input type="time" id="rt-hora" value="${esc(p.hora)}"></div></div>
            <div class="rz-row" style="gap:8px"><div class="rz-f" style="flex:1"><label for="rt-ate">Até (opcional)</label><input type="date" id="rt-ate" value="${esc(pf.data)}"></div>
                <div class="rz-f" style="flex:1"><label for="rt-ate-h">Hora</label><input type="time" id="rt-ate-h" value="${esc(pf.hora)}"></div></div>
            <span class="rz-hint">Ex.: check-in 23/12 14:00 até 27/12 11:00.</span>
            <div class="rz-f"><label for="rt-desc">Descrição</label><input type="text" id="rt-desc" maxlength="80" value="${esc(e.descricao || '')}" placeholder="Ex.: Hotel Araxá, voo G3 1234"></div>
            <div class="rz-f"><label for="rt-valor">Valor (opcional)</label><input type="text" inputmode="decimal" id="rt-valor" value="${e.valor ? esc(String(e.valor).replace('.', ',')) : ''}" placeholder="0,00"></div>`,
        aoSalvar: async (el) => {
            const v = (s) => (el.querySelector(s)?.value || '').trim();
            const dia = v('#rt-dia'); if (!dia) { aviso('Informe o dia.', 'erro'); return false; }
            const ate = v('#rt-ate'), ateH = v('#rt-ate-h');
            if (ateH && !ate) { aviso('Informe o dia do "Até".', 'erro'); return false; }
            const valorTxt = v('#rt-valor').replace(/\./g, '').replace(',', '.');
            const valor = valorTxt ? Number(valorTxt) : null;
            if (valorTxt && (isNaN(valor) || valor < 0)) { aviso('Valor inválido.', 'erro'); return false; }
            return mandar({ p_item_id: e.item_id, p_ocorrencia_id: novo ? null : e.ocorrencia_id, p_inicio_em: ts(dia, v('#rt-hora')),
                p_fim_em: ate ? ts(ate, ateH) : null, p_descricao: v('#rt-desc'), p_valor: valor });
        },
    });
}

async function mandar(args) {
    const { data, error } = await api.dbAuth.rpc('fn_roteiro_encaixar', { p_canal: 'app', ...args });
    if (error) { aviso(error.message || 'Não foi possível salvar.', 'erro'); return false; }
    aviso(data?.mensagem || 'Feito.', 'sucesso');
    setTimeout(() => abrirRoteiro(), 0);
    return true;
}

/** Editar trechos: a lista inteira, de uma vez. c: { cicloId, roteiro?, aoSalvar? } */
export async function abrirEditarTrechos(c) {
    if (!ctx || ctx.cicloId !== c.cicloId) ctx = { ...(ctx || {}), cicloId: c.cicloId };
    const r = c.roteiro || await ler(); if (!r) return;
    const C = r.ciclo;
    const linha = (t = {}) => `<div class="rz-row rz-rt-trecho" data-id="${esc(t.id || '')}" style="gap:6px;align-items:flex-end">
        <div class="rz-f" style="flex:2;margin:0"><label>Trecho</label><input type="text" data-t-nome maxlength="60" value="${esc(t.nome || '')}" placeholder="Ex.: Araxá"></div>
        <div class="rz-f" style="flex:1.2;margin:0"><label>De</label><input type="date" data-t-ini value="${esc(t.inicio || '')}" min="${esc(C.inicio)}" max="${esc(C.fim)}"></div>
        <div class="rz-f" style="flex:1.2;margin:0"><label>Até</label><input type="date" data-t-fim value="${esc(t.fim || '')}" min="${esc(C.inicio)}" max="${esc(C.fim)}"></div>
        <button type="button" class="rz-more" data-t-tirar aria-label="Tirar trecho"><i data-lucide="x"></i></button></div>`;
    const sheet = g('abrirSheetForm')?.({
        titulo: 'Trechos', sub: `${C.nome} · ${dm(C.inicio)} a ${dmy(C.fim)}`, rotuloSalvar: 'Salvar', empilhar: true,
        corpo: `<p class="rz-hint" style="margin:0 0 8px">O dia em que se muda de cidade fica no trecho que começa nele.</p>
            <div data-t-lista>${(r.trechos || []).map(linha).join('')}</div>
            <button type="button" class="rz-btn rz-btn-3" data-t-add>+ Trecho</button>`,
        aoSalvar: async (el) => {
            const lista = [...el.querySelectorAll('.rz-rt-trecho')].map(x => ({ id: x.dataset.id || null, nome: (x.querySelector('[data-t-nome]')?.value || '').trim(),
                inicio_previsto: x.querySelector('[data-t-ini]')?.value || null, fim_previsto: x.querySelector('[data-t-fim]')?.value || null }))
                .filter(t => t.id || t.nome || t.inicio_previsto);
            if (!lista.length) { aviso('Deixe ao menos um trecho.', 'erro'); return false; }
            if (lista.some(t => !t.nome)) { aviso('Dê um nome a cada trecho.', 'erro'); return false; }
            const ficam = new Set(lista.map(t => t.id).filter(Boolean));
            const saem = (r.trechos || []).filter(t => !ficam.has(t.id));
            const comCoisa = saem.filter(t => (t.dias || []).some(d => (d.entradas || []).length));
            if (comCoisa.length) {
                const ok = await (g('rzConfirmar') ? g('rzConfirmar')({ titulo: 'Tirar ' + comCoisa.map(t => t.nome).join(', ') + '?',
                    impacto: 'O que está marcado nesses dias não se apaga: passa a aparecer no trecho que cobrir a data, ou em "Outros dias".', rotuloConfirmar: 'Tirar' })
                    : confirm('Tirar o trecho? O que está marcado não se apaga.'));
                if (!ok) return false;
            }
            const { data, error } = await api.dbAuth.rpc('fn_ciclo_trechos_salvar', { p_ciclo_id: c.cicloId, p_trechos: lista, p_canal: 'app' });
            if (error) { aviso(error.message || 'Não foi possível salvar.', 'erro'); return false; }
            aviso(data?.mensagem || 'Trechos salvos.', 'sucesso');
            setTimeout(() => (typeof c.aoSalvar === 'function' ? c.aoSalvar() : abrirRoteiro()), 0);
            return true;
        },
    });
    const raiz = sheet || document;
    const ligar = () => { raiz.querySelectorAll('[data-t-tirar]').forEach(b => { b.onclick = () => b.closest('.rz-rt-trecho')?.remove(); }); icones(); };
    raiz.querySelector('[data-t-add]')?.addEventListener('click', () => { raiz.querySelector('[data-t-lista]')?.insertAdjacentHTML('beforeend', linha()); ligar(); });
    ligar();
}
