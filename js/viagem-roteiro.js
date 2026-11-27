// ============================================================================
// viagem-roteiro.js — Raiz Patrimônio · Roteiro da viagem (programa com tipos de ciclo)
// Versão: 1.7.0 · 27/11/2026
//
// v1.7.0 (27/11/2026, sessão 20261127-1233-viagem-icone-catalogo, demanda d8061e47; de acordo do Nicola 27/11 12:33) — REU: o ícone
// de cada linha vem do catálogo (cofre_controle_subtipos.icone, via fn_ciclo_roteiro → icone), como nos alertas; sai o mapa próprio
// da v1.6.0. A linha do dia de volta usa undo-2 (está no recorte icones-raiz.js; corner-down-left não estava). Versão anterior: 1.6.0
//
// v1.6.0 (26/11/2026, sessão 20261126-1213-viagem-icones, demanda d8061e47; de acordo do Nicola 26/11 12:13) — ícone da categoria em
// cada linha (voo, cama, carro, ingresso, talheres, alfinete) e etapa como etiqueta pequena, com menos texto; "A encaixar" sem a
// frase de ajuda; abrirRoteiro sem viagem aberta só existe para quem ainda chama (a tela é a da viagem). Versão anterior: 1.5.0
//
// v1.5.0 (26/11/2026, sessão 20261126-1015-viagem-2b3, demanda d8061e47; FICHA_PROGRAMA_VIAGEM_FATIA2B3 v1.1.0, de acordo do
// Nicola 26/11 10:15) — a viagem abre direto no roteiro (abrirViagem: cabeçalho com tipo, datas, pago/a pagar, quem vai e etapas;
// abas das outras viagens; "+ No roteiro" e "Mais"); formulário único para criar e editar (folhaItem → fn_roteiro_salvar: nome,
// categoria, dia, hora, até, descrição, valor, etapa) — tocar numa entrada abre o formulário preenchido e salvar atualiza na hora;
// "Quem vai" (folhaQuemVai → fn_ciclo_viajantes_salvar): pessoa da família ou de fora, toda a viagem ou só alguns trechos; o trecho
// mostra quem está só nele. Versão anterior: 1.4.0
//
// v1.4.0 (25/11/2026, sessão 20261125-2326-viagem-roteiro-ux, demanda d8061e47; de acordo do Nicola 25/11 23:26) — item com data e
// sem hora já aparece no dia (regra do banco, fn_ciclo_roteiro) como "Dia todo"; "A encaixar" vem aberta quando há algo que a
// pessoa ainda não viu ali; acoesItemViagem() dá à tela da viagem as ações do item (Marcar dia e hora, Etapa, Abrir o item) e o
// encaixe feito fora do Roteiro volta para quem chamou. Versão anterior: 1.3.0
//
// v1.3.0 (25/11/2026, sessão 20261125-1019-viagem-compartilhar, demanda faf717a1; FICHA_COMPARTILHAR_VIAGEM v1.0.0, de acordo do
// Nicola 25/11 10:19) — "Compartilhar" no rodapé do Roteiro (viagem-compartilhar.js); no encaixe, a hora é a saída, o "Até" com
// hora é a chegada e a descrição traz o exemplo de voo. Versão anterior: 1.2.0
// --------------------------------------------------------------------------
// Versões anteriores (v1.2.0 … v1.2.0): CHANGELOG_MODULOS.md, na raiz do repositório — o
// gerar_versoes.py rola pra lá automaticamente tudo além das 5 versões
// mais recentes deste cabeçalho (VER-06).
export const VERSAO = '1.7.0';
import { estado } from './cofre-estado.js';
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
let bandejaAberta = false;
let aposEncaixe = null; // v1.4.0 — encaixe aberto fora do Roteiro (tela da viagem) volta para quem chamou
// v1.4.0 — "A encaixar" abre sozinha quando tem registro que a pessoa ainda não viu ali (guardado por viagem, neste aparelho)
function novidadeNaBandeja(cicloId, enc) {
    let vistos = [];
    try { vistos = JSON.parse(localStorage.getItem('rz.bandeja.' + cicloId) || '[]'); } catch (e) { vistos = []; }
    const ids = enc.map(e => e.ocorrencia_id);
    try { localStorage.setItem('rz.bandeja.' + cicloId, JSON.stringify(ids)); } catch (e) { /* sem armazenamento: fica fechada */ }
    return ids.some(id => !vistos.includes(id));
} // v1.1.0 — "A encaixar" fechada ao abrir; fica como o usuário deixou enquanto o roteiro está aberto

/** Abre o roteiro da viagem. ctx: { cicloId, abrirItem(itemId) } */
export async function abrirRoteiro(c) {
    if (!c && typeof ctx?.recarregar === 'function') return ctx.recarregar(); // v1.5.0 — dentro da viagem, recarrega a viagem
    if (c) bandejaAberta = null; // abertura nova: decide pela novidade (v1.4.0)
    aposEncaixe = null;
    ctx = c || ctx; if (!ctx?.cicloId) return;
    const r = await ler(); if (!r) return;
    if (!r.pode_ver) { aviso('Seu perfil não vê esta viagem.', 'erro'); return; }
    if (bandejaAberta === null) bandejaAberta = novidadeNaBandeja(ctx.cicloId, r.a_encaixar || []);
    const abrirSheet = g('abrirSheet'), cab = g('rzSheetCabecalho'); if (!abrirSheet || !cab) return;
    const C = r.ciclo;
    const sheet = abrirSheet(cab('Roteiro', `${C.nome} · ${dm(C.inicio)} a ${dmy(C.fim)}`) + `<div class="rz-sh-b">${corpoHtml(r)}</div>`
        + `<div class="rz-sh-f rz-exec-acoes">${r.pode_encaixar && C.situacao !== 'fechado' ? '<button type="button" class="rz-btn rz-btn-1" data-rt-novo>+ No roteiro</button>' : ''}`
        + `${r.pode_gerir && C.situacao !== 'fechado' ? '<button type="button" class="rz-btn rz-btn-3" data-rt-trechos>Editar trechos</button>' : ''}`
        + '<button type="button" class="rz-btn rz-btn-3" data-rt-compartilhar>Compartilhar</button></div>'); // v1.3.0
    icones();
    const fechado = C.situacao === 'fechado';
    ligarCorpo(sheet, r, fechado);
    sheet.querySelector('[data-rt-bandeja-x]')?.addEventListener('click', (ev) => {
        bandejaAberta = !bandejaAberta; const b = ev.currentTarget;
        b.setAttribute('aria-expanded', String(bandejaAberta));
        sheet.querySelector('[data-rt-bandeja-lista]')?.classList.toggle('hidden', !bandejaAberta);
        const ic = b.querySelector('[data-lucide^="chevron"], svg.lucide-chevron-down, svg.lucide-chevron-up');
        if (ic) { const n = document.createElement('i'); n.setAttribute('data-lucide', bandejaAberta ? 'chevron-up' : 'chevron-down'); ic.replaceWith(n); icones(); }
    });
    sheet.querySelector('[data-rt-novo]')?.addEventListener('click', () => folhaItem(r, null)); // v1.5.0 — formulário único
    sheet.querySelector('[data-rt-compartilhar]')?.addEventListener('click', () => import('./viagem-compartilhar.js').then(m => m.compartilharViagem({ cicloId: ctx.cicloId }))); // v1.3.0
    sheet.querySelector('[data-rt-trechos]')?.addEventListener('click', () => abrirEditarTrechos({ cicloId: ctx.cicloId, roteiro: r }));
}

async function ler() {
    const { data, error } = await api.dbAuth.rpc('fn_ciclo_roteiro', { p_ciclo_id: ctx.cicloId });
    if (error) { aviso(error.message || 'Não foi possível ler o roteiro.', 'erro'); return null; }
    return data;
}

export const iconeCategoria = (e) => (e && e.icone) || 'calendar'; // v1.7.0 — ícone do catálogo (subtipo); sem ícone, calendário
const etiqueta = (e) => e.etapa_nome ? `<span class="rz-chip${['reservado', 'pago', 'feito', 'escolhido'].includes(e.etapa) ? ' rz-on' : ''}" style="flex:none;font-size:12px;padding:2px 8px;pointer-events:none">${esc(e.etapa_nome)}</span>` : '';
function linhaEntrada(e, comHora = true) {
    const p = partes(e.inicio_em), pf = partes(e.fim_em);
    const quando = !comHora ? '' : e.papel === 'fim' ? 'Termina hoje' + (pf.hora ? ' ' + pf.hora : '') + ' · desde ' + dm(p.data)
        : (p.hora || 'Dia todo') + (e.fim_em ? ' – ' + (pf.data !== p.data ? dm(pf.data) + ' ' : '') + (pf.hora || '') : '');
    const sub = [quando, e.descricao || '', e.papel !== 'fim' && e.valor ? moeda(e.valor) : '', e.status === 'concluido' ? 'Feito' : ''].filter(Boolean).join(' · ');
    return `<button type="button" class="rz-row" data-rt-oc="${e.ocorrencia_id}" style="width:100%;text-align:left;gap:10px">
        <div class="rz-ic"><i data-lucide="${e.papel === 'fim' ? 'undo-2' : iconeCategoria(e)}"></i></div>
        <div class="rz-tx" style="min-width:0"><b>${esc(e.titulo)}</b>${sub ? `<span>${esc(sub)}</span>` : ''}</div>
        ${etiqueta(e)}${e.docs ? '<i data-lucide="paperclip" style="flex:none;width:16px"></i>' : ''}</button>`;
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
    if (enc.length) h += `<button type="button" class="rz-row" data-rt-bandeja aria-expanded="${bandejaAberta}" style="width:100%;text-align:left">
            <div class="rz-ic"><i data-lucide="inbox"></i></div><div class="rz-tx"><b>A encaixar · ${enc.length}</b><span>Sem dia ainda · toque num item para pôr dia e hora</span></div>
            <i data-lucide="${bandejaAberta ? 'chevron-up' : 'chevron-down'}"></i></button>
        <div data-rt-bandeja-lista class="rz-rt-bandeja${bandejaAberta ? '' : ' hidden'}">
        <div class="rz-list" style="padding:0">${bandejaAgrupada(enc).map(linhaBandeja).join('')}</div></div>`;
    (r.trechos || []).forEach(t => {
        const ult = (t.dias || []).length ? t.dias[t.dias.length - 1].data : t.fim;
        const so = (r.viajantes || []).filter(v => !v.toda && (v.trechos || []).includes(t.id)).map(v => String(v.nome || '').split(' ')[0]); // v1.5.0
        h += `<div class="rz-group rz-group-t" style="margin-top:14px"><span>${esc(t.nome)} · ${dm(t.inicio)} a ${dm(ult)}${so.length ? ' · + ' + esc(so.join(', ')) : ''}</span></div>`
            + ((t.dias || []).length ? t.dias.map(diaHtml).join('') : '<p class="rz-hint">Os dias deste trecho ficaram com o trecho seguinte.</p>');
    });
    const sem = r.dias_sem_trecho || [], fora = r.fora_dos_trechos || [];
    if (sem.length || fora.length) {
        const diaDe = (e) => e.dia || partes(e.inicio_em).data; // v1.2.0 — a entrada de fim vem com o dia do fim
        const dias = [...new Set([...sem, ...fora.map(diaDe)])].sort();
        h += `<div class="rz-group rz-group-t" style="margin-top:14px"><span>Outros dias</span></div>`
            + dias.map(dd => diaHtml({ data: dd, entradas: fora.filter(e => diaDe(e) === dd) })).join('');
    }
    if (!h) h = '<p class="rz-desc">Nada no roteiro ainda.</p>';
    return h;
}
// v1.2.0 — passe: os dias sem marcar do mesmo item viram uma linha ("0 de 4 dias"); o toque encaixa o próximo
function bandejaAgrupada(enc) {
    const m = new Map();
    enc.forEach(e => { if (!m.has(e.item_id)) m.set(e.item_id, []); m.get(e.item_id).push(e); });
    return [...m.values()].flatMap(lst => (lst[0].dias_total > 1 ? [lst[0]] : lst));
}
function linhaBandeja(e) {
    if (!(e.dias_total > 1)) return linhaEntrada(e, false);
    const sub = [`${e.dias_marcados} de ${e.dias_total} dias`, e.janela_fim ? 'válido ' + dm(e.janela_inicio) + ' a ' + dm(e.janela_fim) : '',
        e.valor ? moeda(e.valor) : ''].filter(Boolean).join(' · ');
    return `<button type="button" class="rz-row" data-rt-oc="${e.ocorrencia_id}" style="width:100%;text-align:left;gap:10px">
        <div class="rz-ic"><i data-lucide="${iconeCategoria(e)}"></i></div><div class="rz-tx" style="min-width:0"><b>${esc(e.titulo)}</b><span>${esc(sub)}</span></div>
        ${e.docs ? '<i data-lucide="paperclip" style="flex:none;width:16px"></i>' : ''}</button>`;
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
    if (!fechado && r.pode_encaixar && e.fluxo && (r.etapas || {})[e.fluxo])
        acoes.unshift({ icone: 'list-checks', titulo: 'Etapa: ' + (e.etapa_nome || '—'), codigo: 'cofre.controles.editar', sub: 'Toque para mudar',
            aoTocar: () => escolherEtapa({ itemId: e.item_id, titulo: e.titulo, fluxo: e.fluxo, etapa: e.etapa, etapas: r.etapas[e.fluxo] }, () => abrirRoteiro()) });
    acoes.push({ icone: 'paperclip', titulo: 'Abrir o item', codigo: 'cofre.controles.ver', sub: 'Documentos, pagamento e rateio', aoTocar: () => ctx.abrirItem?.(e.item_id) });
    g('abrirSheetAcoes')?.({ titulo: e.descricao ? `${e.titulo} · ${e.descricao}` : e.titulo, sub: 'Roteiro', acoes, empilhar: true });
}

function escolherItem(r) {
    const its = itensDoRoteiro(r);
    const novos = r.pode_incluir ? [
        { icone: 'map-pin', titulo: 'Lugar', codigo: 'cofre.controles.criar', sub: 'Restaurante, passeio: Ideia › Escolhido › Feito', aoTocar: () => folhaIncluir(r, 'lugar') },
        { icone: 'ticket', titulo: 'Passe', codigo: 'cofre.controles.criar', sub: 'Ingresso com janela e dias de uso', aoTocar: () => folhaIncluir(r, 'passe') },
        { icone: 'plus', titulo: 'Outro item', codigo: 'cofre.controles.criar', sub: 'Um gasto que não está na lista', aoTocar: () => folhaIncluir(r, 'item') },
    ] : [];
    const mais = its.map(i => ({ icone: 'copy-plus', titulo: 'Mais um em ' + i.titulo, codigo: 'cofre.controles.editar', aoTocar: () => folhaEncaixar(r, { item_id: i.id, titulo: i.titulo }, true) }));
    if (!novos.length && !mais.length) { aviso('Nada para incluir.', 'erro'); return; }
    g('abrirSheetAcoes')?.({ titulo: 'No roteiro', sub: r.ciclo.nome, empilhar: true, acoes: [...novos, ...mais] });
}
/** v1.2.0 — inclui Lugar, Passe ou Outro item na viagem (fn_ciclo_item_incluir). c: { cicloId, ciclo{inicio,fim,nome} }, tipo, aposSalvar */
export function folhaIncluir(r, tipo, aposSalvar) {
    const C = r.ciclo, T = { lugar: 'Lugar', passe: 'Passe', item: 'Outro item' }[tipo];
    const ph = { lugar: 'Ex.: Jantar no Epcot', passe: 'Ex.: Ingresso 4 parques', item: 'Ex.: Chip de celular' }[tipo];
    g('abrirSheetForm')?.({
        titulo: T, sub: C.nome, rotuloSalvar: 'Incluir', empilhar: true,
        corpo: `<div class="rz-f"><label for="ri-tit">Nome</label><input type="text" id="ri-tit" maxlength="80" placeholder="${esc(ph)}"></div>`
            + (tipo === 'passe' ? `<div class="rz-row" style="gap:8px"><div class="rz-f" style="flex:1"><label for="ri-de">Válido de</label><input type="date" id="ri-de" value="${esc(C.inicio)}" min="${esc(C.inicio)}" max="${esc(C.fim)}"></div>
                <div class="rz-f" style="flex:1"><label for="ri-ate">até</label><input type="date" id="ri-ate" value="${esc(C.fim)}" min="${esc(C.inicio)}" max="${esc(C.fim)}"></div></div>
                <div class="rz-f"><label for="ri-dias">Dias de uso</label><input type="number" id="ri-dias" min="1" value="1" inputmode="numeric"></div>` : '')
            + `<div class="rz-f"><label for="ri-desc">${tipo === 'lugar' ? 'Nota (opcional)' : 'Descrição (opcional)'}</label><input type="text" id="ri-desc" maxlength="120" placeholder="${tipo === 'lugar' ? 'Endereço, link, dica…' : ''}"></div>`
            + (tipo !== 'lugar' ? `<div class="rz-f"><label for="ri-valor">Valor (opcional)</label><input type="text" inputmode="decimal" id="ri-valor" placeholder="0,00"></div>` : '')
            + `<span class="rz-hint">Entra em "A encaixar"; depois é só marcar o dia.</span>`,
        aoSalvar: async (el) => {
            const v = (q) => (el.querySelector(q)?.value || '').trim();
            const titulo = v('#ri-tit'); if (!titulo) { aviso('Dê um nome.', 'erro'); return false; }
            const valorTxt = v('#ri-valor').replace(/\./g, '').replace(',', '.'); const valor = valorTxt ? Number(valorTxt) : null;
            if (valorTxt && (isNaN(valor) || valor < 0)) { aviso('Valor inválido.', 'erro'); return false; }
            const { data, error } = await api.dbAuth.rpc('fn_ciclo_item_incluir', { p_ciclo_id: C.id, p_tipo: tipo, p_titulo: titulo, p_descricao: v('#ri-desc') || null,
                p_valor: valor, p_janela_inicio: tipo === 'passe' ? v('#ri-de') || null : null, p_janela_fim: tipo === 'passe' ? v('#ri-ate') || null : null,
                p_dias: tipo === 'passe' ? Number(v('#ri-dias') || 1) : null, p_canal: 'app' });
            if (error) { aviso(error.message || 'Não foi possível incluir.', 'erro'); return false; }
            aviso(data?.mensagem || 'Incluído.', 'sucesso');
            setTimeout(() => (typeof aposSalvar === 'function' ? aposSalvar() : abrirRoteiro()), 0);
            return true;
        },
    });
}
/** v1.2.0 — troca a etapa do item. it: { itemId, titulo, fluxo, etapa, etapas? }. Sem etapas, lê o catálogo (fluxo_etapas). */
export async function escolherEtapa(it, aposMudar) {
    let etapas = it.etapas;
    if (!etapas) {
        const { data } = await api.dbAuth.from('fluxo_etapas').select('etapa_codigo, etapa_nome, ordem').eq('fluxo_codigo', it.fluxo).eq('aplica_a', 'item_controle').eq('ativo', true).order('ordem');
        etapas = (data || []).map(x => ({ codigo: x.etapa_codigo, nome: x.etapa_nome }));
    }
    if (!etapas.length) return;
    const ICONE = { a_cotar: 'circle-dashed', cotado: 'file-text', reservado: 'calendar-check', pago: 'badge-check', cancelado: 'x-circle',
        ideia: 'lightbulb', escolhido: 'star', feito: 'check-circle', descartado: 'x-circle' };
    g('abrirSheetAcoes')?.({ titulo: it.titulo, sub: 'Etapa', empilhar: true, acoes: etapas.map(x => ({
        icone: x.codigo === it.etapa ? 'check' : (ICONE[x.codigo] || 'circle'), titulo: x.nome, codigo: 'cofre.controles.editar',
        sub: x.codigo === it.etapa ? 'Etapa atual' : (x.codigo === 'cancelado' || x.codigo === 'descartado' ? 'Sai do roteiro' : ''),
        tipo: x.codigo === 'cancelado' || x.codigo === 'descartado' ? 'bad' : undefined,
        aoTocar: async () => {
            if (x.codigo === it.etapa) return;
            const { data, error } = await api.dbAuth.rpc('fn_item_etapa_mover', { p_item_id: it.itemId, p_etapa: x.codigo, p_canal: 'app' });
            if (error) { aviso(error.message || 'Não foi possível mudar.', 'erro'); return; }
            aviso(data?.mensagem || 'Feito.', 'sucesso');
            setTimeout(() => aposMudar?.(), 0);
        } })) });
}

function folhaEncaixar(r, e, novo) {
    const p = partes(e.inicio_em), pf = partes(e.fim_em);
    const dataIni = p.data || (e.data_prevista && e.data_prevista >= r.ciclo.inicio && e.data_prevista <= r.ciclo.fim ? e.data_prevista : r.ciclo.inicio);
    const jan = e.dias_total > 1 && e.janela_fim ? ` min="${esc(e.janela_inicio)}" max="${esc(e.janela_fim)}"` : ''; // v1.2.0 — passe: só dentro da janela
    g('abrirSheetForm')?.({
        titulo: (novo ? 'Mais um em ' : '') + e.titulo, sub: r.ciclo.nome, rotuloSalvar: novo ? 'Incluir' : 'Salvar', empilhar: true,
        corpo: `<div class="rz-row" style="gap:8px"><div class="rz-f" style="flex:1"><label for="rt-dia">Dia</label><input type="date" id="rt-dia" value="${esc(dataIni)}"${jan}></div>
                <div class="rz-f" style="flex:1"><label for="rt-hora">Hora / saída (opcional)</label><input type="time" id="rt-hora" value="${esc(p.hora)}"></div></div>
            <div class="rz-row" style="gap:8px"><div class="rz-f" style="flex:1"><label for="rt-ate">Até (opcional)</label><input type="date" id="rt-ate" value="${esc(pf.data)}"></div>
                <div class="rz-f" style="flex:1"><label for="rt-ate-h">Hora / chegada</label><input type="time" id="rt-ate-h" value="${esc(pf.hora)}"></div></div>
            <span class="rz-hint">Ex.: voo 29/11 21:45 até 30/11 06:10; check-in 23/12 14:00 até 27/12 11:00.</span>
            <div class="rz-f"><label for="rt-desc">Descrição</label><input type="text" id="rt-desc" maxlength="80" value="${esc(e.descricao || '')}" placeholder="Ex.: AC97 GRU→YUL, Hotel Araxá, reserva B3VY9V"></div>
            <div class="rz-f"><label for="rt-valor">Valor (opcional)</label><input type="text" inputmode="decimal" id="rt-valor" value="${e.valor ? esc(String(e.valor).replace('.', ',')) : ''}" placeholder="0,00"></div>`,
        aoSalvar: async (el) => {
            const v = (s) => (el.querySelector(s)?.value || '').trim();
            const dia = v('#rt-dia'); if (!dia) { aviso('Informe o dia.', 'erro'); return false; }
            if (jan && (dia < e.janela_inicio || dia > e.janela_fim)) { aviso(`O passe vale de ${dm(e.janela_inicio)} a ${dm(e.janela_fim)}.`, 'erro'); return false; }
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
    const volta = aposEncaixe; // v1.4.0
    setTimeout(() => (typeof volta === 'function' ? volta() : abrirRoteiro()), 0);
    return true;
}
/** v1.4.0 — ações do item a partir da tela da viagem: { cicloId, itemId, titulo, fluxo, etapa, abrirItem(id), aoVoltar() } */
export async function acoesItemViagem(o) {
    ctx = { ...(ctx || {}), cicloId: o.cicloId, abrirItem: o.abrirItem };
    const r = await ler(); if (!r || !r.pode_ver) return;
    const todas = [...(r.a_encaixar || []), ...(r.fora_dos_trechos || [])];
    (r.trechos || []).forEach(t => (t.dias || []).forEach(d => todas.push(...(d.entradas || []))));
    const doItem = todas.filter(e => e.item_id === o.itemId && e.papel !== 'fim');
    const e = doItem.find(x => x.status === 'aberto') || doItem[0];
    const fechado = r.ciclo.situacao === 'fechado';
    const acoes = [];
    if (e && !fechado && r.pode_encaixar && e.status === 'aberto')
        acoes.push({ icone: 'calendar-clock', titulo: e.inicio_em ? 'Mudar dia e hora' : 'Marcar dia e hora', codigo: 'cofre.controles.editar',
            sub: e.inicio_em || e.data_prevista ? 'Hoje: ' + (partes(e.inicio_em).data ? dm(partes(e.inicio_em).data) + (partes(e.inicio_em).hora ? ' ' + partes(e.inicio_em).hora : '') : dm(e.data_prevista) + ' (sem hora)') : 'Ainda sem dia',
            aoTocar: () => { aposEncaixe = o.aoVoltar || null; folhaEncaixar(r, e, false); } });
    if (e && !fechado && r.pode_encaixar)
        acoes.push({ icone: 'copy-plus', titulo: 'Mais um em ' + o.titulo, codigo: 'cofre.controles.editar', sub: 'Outro hotel, o voo de volta…',
            aoTocar: () => { aposEncaixe = o.aoVoltar || null; folhaEncaixar(r, { item_id: o.itemId, titulo: o.titulo }, true); } });
    if (!fechado && r.pode_encaixar && o.fluxo && (r.etapas || {})[o.fluxo])
        acoes.push({ icone: 'list-checks', titulo: 'Etapa: ' + (e?.etapa_nome || '—'), codigo: 'cofre.controles.editar', sub: 'Toque para mudar',
            aoTocar: () => escolherEtapa({ itemId: o.itemId, titulo: o.titulo, fluxo: o.fluxo, etapa: o.etapa, etapas: r.etapas[o.fluxo] }, o.aoVoltar) });
    acoes.push({ icone: 'paperclip', titulo: 'Abrir o item', codigo: 'cofre.controles.ver', sub: 'Documentos, pagamento, rateio e compartilhar', aoTocar: () => o.abrirItem?.(o.itemId) });
    g('abrirSheetAcoes')?.({ titulo: o.titulo, sub: r.ciclo.nome, acoes, empilhar: true });
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

// ---------------------------------------------------------------------------------------------------------------------------
// v1.5.0 — viagem = roteiro; formulário único; quem vai
// ---------------------------------------------------------------------------------------------------------------------------
const CATS = [['deslocamento', 'Voo e deslocamento', 'viagem_deslocamento'], ['hospedagem', 'Hospedagem', 'viagem_hospedagem'],
    ['transporte', 'Carro e transporte', 'viagem_locomocao'], ['atracao', 'Ingresso e atração', 'viagem_atracao'],
    ['alimentacao', 'Restaurante', 'viagem_alimentacao'], ['lugar', 'Lugar', 'viagem_lugar'], ['outro', 'Outro', 'evento_viagem']];
const NOME_VAR = { terrestre: 'Terrestre', aerea: 'Aérea nacional', internacional: 'Internacional' };
const primeiro = (n) => String(n || '').split(' ')[0];

function ligarCorpo(sheet, r, fechado) {
    sheet.querySelectorAll('[data-rt-oc]').forEach(b => b.addEventListener('click', () => tocarEntrada(r, b.dataset.rtOc, fechado)));
    sheet.querySelector('[data-rt-bandeja]')?.addEventListener('click', (ev) => {
        bandejaAberta = !bandejaAberta; const b = ev.currentTarget;
        b.setAttribute('aria-expanded', String(bandejaAberta));
        sheet.querySelector('[data-rt-bandeja-lista]')?.classList.toggle('hidden', !bandejaAberta);
        const ic = b.querySelector('[data-lucide^="chevron"], svg.lucide-chevron-down, svg.lucide-chevron-up');
        if (ic) { const n = document.createElement('i'); n.setAttribute('data-lucide', bandejaAberta ? 'chevron-up' : 'chevron-down'); ic.replaceWith(n); icones(); }
    });
}
function tocarEntrada(r, ocId, fechado) {
    const e = achar(r, ocId); if (!e) return;
    if (!fechado && r.pode_encaixar && e.status === 'aberto') folhaItem(r, e); else acoesEntrada(r, ocId, fechado);
}
function quemVaiResumo(r) {
    const vs = r.viajantes || []; if (!vs.length) return '';
    const nomeTrecho = (id) => (r.trechos || []).find(t => t.id === id)?.nome || '';
    return vs.map(v => primeiro(v.nome) + (v.toda ? '' : ' (só ' + (v.trechos || []).map(nomeTrecho).filter(Boolean).join(', ') + ')')).join(', ');
}

/** A viagem aberta já no roteiro. o: { d, abrirItem(id), recarregar(), abrirCiclo(id), novaViagem(), corrigir(), verLista() } */
export async function abrirViagem(o) {
    const d = o.d, P = d.programa, C0 = d.ciclo;
    if (!ctx || ctx.cicloId !== C0.id) bandejaAberta = null;
    ctx = { cicloId: C0.id, abrirItem: o.abrirItem, recarregar: o.recarregar };
    aposEncaixe = null;
    const r = await ler(); if (!r) return;
    if (!r.pode_ver) { aviso('Seu perfil não vê esta viagem.', 'erro'); return; }
    if (bandejaAberta === null) bandejaAberta = novidadeNaBandeja(C0.id, r.a_encaixar || []);
    const abrirSheet = g('abrirSheet'), cab = g('rzSheetCabecalho'); if (!abrirSheet || !cab) return;
    const C = r.ciclo, fechado = C.situacao === 'fechado';
    const vari = (P.ciclo_config?.variantes || []).find(v => v.codigo === C.variante)?.nome || NOME_VAR[C.variante] || '';
    const sub = [vari, 'ida ' + dmy(C.inicio), 'volta ' + dmy(C.fim)].filter(Boolean).join(' · ') + (fechado ? ' · fechada' : '');
    const abas = (d.ciclos || []).length > 1 ? `<div class="rz-chips" style="margin:0 0 10px">${d.ciclos.map(c =>
        `<button type="button" class="rz-chip ${c.id === C.id ? 'rz-on' : ''}" data-vg-ciclo="${c.id}">${esc(c.nome)}</button>`).join('')}</div>` : '';
    const custo = d.custo || {};
    const custoHtml = `<div class="rz-exec-custo"><span><b>${moeda(custo.realizado || 0)}</b> pago</span><span><b>${moeda(custo.a_pagar || 0)}</b> a pagar</span></div>`;
    const qv = quemVaiResumo(r);
    const quem = `<button type="button" class="rz-row" data-vg-quem style="width:100%;text-align:left"><div class="rz-ic"><i data-lucide="users"></i></div>
        <div class="rz-tx"><b>Quem vai</b><span>${esc(qv || (fechado ? 'Ninguém na lista' : 'Ninguém ainda · toque para incluir'))}</span></div><i data-lucide="chevron-right"></i></button>`;
    const cont = (d.itens || []).filter(i => i.etapa_nome).reduce((m, i) => (m.set(i.etapa_nome, (m.get(i.etapa_nome) || 0) + 1), m), new Map());
    const etapas = cont.size ? `<p class="rz-hint" style="margin:6px 0 0">${esc([...cont].map(([k, n]) => k + ' ' + n).join(' · '))}</p>` : '';
    const sheet = abrirSheet(cab(P.nome + ' · ' + C.nome, sub) + `<div class="rz-sh-b">${abas}${custoHtml}${quem}${etapas}<div style="margin-top:8px">${corpoHtml(r)}</div></div>`
        + `<div class="rz-sh-f rz-exec-acoes">${!fechado && r.pode_encaixar ? '<button type="button" class="rz-btn rz-btn-1" data-vg-novo>+ No roteiro</button>' : ''}`
        + '<button type="button" class="rz-btn rz-btn-3" data-vg-mais>Mais</button></div>');
    icones();
    ligarCorpo(sheet, r, fechado);
    sheet.querySelectorAll('[data-vg-ciclo]').forEach(b => b.addEventListener('click', () => o.abrirCiclo?.(b.dataset.vgCiclo)));
    sheet.querySelector('[data-vg-novo]')?.addEventListener('click', () => folhaItem(r, null));
    sheet.querySelector('[data-vg-quem]')?.addEventListener('click', () => { if (!fechado && r.pode_gerir) folhaQuemVai(r); });
    sheet.querySelector('[data-vg-mais]')?.addEventListener('click', () => g('abrirSheetAcoes')?.({ titulo: C.nome, sub: P.nome, empilhar: true, acoes: [
        ...(!fechado && r.pode_gerir ? [{ icone: 'route', titulo: 'Editar trechos', codigo: 'ciclos.gerir', sub: 'Nome e datas, incluir ou tirar', aoTocar: () => abrirEditarTrechos({ cicloId: C.id, roteiro: r }) },
            { icone: 'users', titulo: 'Quem vai', codigo: 'ciclos.gerir', sub: 'Toda a viagem ou só alguns trechos', aoTocar: () => folhaQuemVai(r) }] : []),
        { icone: 'share-2', titulo: 'Compartilhar', codigo: 'ciclos.ver', sub: 'Escolher dados e documentos e mandar', aoTocar: () => import('./viagem-compartilhar.js').then(m => m.compartilharViagem({ cicloId: C.id })) },
        ...(!fechado && r.pode_incluir ? [{ icone: 'ticket', titulo: '+ Passe de vários dias', codigo: 'cofre.controles.criar', sub: 'Ingresso com janela e dias de uso', aoTocar: () => folhaIncluir(r, 'passe') }] : []),
        ...(o.novaViagem ? [{ icone: 'plus', titulo: '+ Nova viagem', codigo: 'ciclos.gerir', aoTocar: o.novaViagem }] : []),
        ...(o.corrigir ? [{ icone: 'pencil', titulo: 'Corrigir ' + C.nome, codigo: 'ciclos.gerir', sub: 'Datas, nome, fechar ou excluir', aoTocar: o.corrigir }] : []),
        ...(o.verLista ? [{ icone: 'list', titulo: 'Ver como lista', codigo: 'ciclos.ver', sub: 'Itens da viagem em lista', aoTocar: o.verLista }] : []),
    ] }));
}

/** Formulário único: criar (e = null) ou editar uma entrada do roteiro. */
export function folhaItem(r, e) {
    const C = r.ciclo, novo = !e;
    const p = e ? partes(e.inicio_em) : { data: '', hora: '' }, pf = e ? partes(e.fim_em) : { data: '', hora: '' };
    const dataIni = p.data || (e && e.data_prevista && e.data_prevista !== C.inicio ? e.data_prevista : '');
    let cat = e ? (CATS.find(c => c[2] === e.sub)?.[0] || null) : null;
    const etapaIni = e?.etapa || null; let etapa = etapaIni;
    const jan = e && e.dias_total > 1 && e.janela_fim ? ` min="${esc(e.janela_inicio)}" max="${esc(e.janela_fim)}"` : '';
    const chipsCat = CATS.map(([k, n]) => `<button type="button" class="rz-chip${k === cat ? ' rz-on' : ''}" data-fi-cat="${k}">${esc(n)}</button>`).join('');
    const sheet = g('abrirSheetForm')?.({
        titulo: novo ? 'No roteiro' : (e.titulo || 'Editar'), sub: C.nome, rotuloSalvar: 'Salvar', empilhar: true,
        corpo: `<div class="rz-f"><label for="fi-nome">Nome</label><input type="text" id="fi-nome" maxlength="80" value="${esc(e?.titulo || '')}" placeholder="Ex.: Show do Seinfeld, Hotel Araxá, voo de ida"></div>
            <div class="rz-f"><label>Categoria</label><div class="rz-chips" data-fi-cats>${chipsCat}</div></div>
            <div class="rz-row" style="gap:8px"><div class="rz-f" style="flex:1"><label for="fi-dia">Dia</label><input type="date" id="fi-dia" value="${esc(dataIni)}"${jan || ` min="${esc(C.inicio)}" max="${esc(C.fim)}"`}></div>
                <div class="rz-f" style="flex:1"><label for="fi-hora">Hora / saída</label><input type="time" id="fi-hora" value="${esc(p.hora)}"></div></div>
            <div class="rz-row" style="gap:8px"><div class="rz-f" style="flex:1"><label for="fi-ate">Até (opcional)</label><input type="date" id="fi-ate" value="${esc(pf.data)}"></div>
                <div class="rz-f" style="flex:1"><label for="fi-ate-h">Hora / chegada</label><input type="time" id="fi-ate-h" value="${esc(pf.hora)}"></div></div>
            <span class="rz-hint">Sem dia, fica em "A encaixar". Ex.: voo 29/11 21:45 até 30/11 06:10; check-in 23/12 14:00 até 27/12 11:00.</span>
            <div class="rz-f"><label for="fi-desc">Descrição</label><input type="text" id="fi-desc" maxlength="120" value="${esc(e?.descricao || '')}" placeholder="Nº do voo, reserva, endereço"></div>
            <div class="rz-f"><label for="fi-valor">Valor (opcional)</label><input type="text" inputmode="decimal" id="fi-valor" value="${e?.valor ? esc(String(e.valor).replace('.', ',')) : ''}" placeholder="0,00"></div>
            <div class="rz-f"><label>Etapa</label><div class="rz-chips" data-fi-etapas></div></div>`
            + (novo ? '' : `<div class="rz-chips" style="margin-top:10px">
                <button type="button" class="rz-btn rz-btn-3" data-fi-abrir>Documentos e pagamento</button>
                <button type="button" class="rz-btn rz-btn-3" data-fi-mais>Mais um em ${esc(e.titulo)}</button></div>`),
        aoSalvar: async (el) => {
            const v = (q) => (el.querySelector(q)?.value || '').trim();
            const nome = v('#fi-nome'); if (!nome) { aviso('Dê um nome.', 'erro'); return false; }
            if (novo && !cat) { aviso('Escolha a categoria.', 'erro'); return false; }
            const dia = v('#fi-dia'), hora = v('#fi-hora'); let ate = v('#fi-ate'); const ateH = v('#fi-ate-h');
            if ((hora || ate || ateH) && !dia) { aviso('Informe o dia.', 'erro'); return false; }
            if (ateH && !ate) ate = dia;
            if (jan && dia && (dia < e.janela_inicio || dia > e.janela_fim)) { aviso(`O passe vale de ${dm(e.janela_inicio)} a ${dm(e.janela_fim)}.`, 'erro'); return false; }
            const valorTxt = v('#fi-valor').replace(/\./g, '').replace(',', '.'); const valor = valorTxt ? Number(valorTxt) : null;
            if (valorTxt && (isNaN(valor) || valor < 0)) { aviso('Valor inválido.', 'erro'); return false; }
            const catOrig = e ? (CATS.find(c => c[2] === e.sub)?.[0] || null) : null;
            const { data, error } = await api.dbAuth.rpc('fn_roteiro_salvar', { p_ciclo_id: C.id, p_item_id: e?.item_id || null, p_ocorrencia_id: e?.ocorrencia_id || null,
                p_categoria: cat && cat !== catOrig ? cat : (novo ? cat : null), p_titulo: nome, p_inicio_em: dia ? ts(dia, hora) : null,
                p_fim_em: ate ? ts(ate, ateH) : null, p_descricao: v('#fi-desc'), p_valor: valor, p_etapa: etapa && etapa !== etapaIni ? etapa : null, p_canal: 'app' });
            if (error) { aviso(error.message || 'Não foi possível salvar.', 'erro'); return false; }
            aviso(data?.mensagem || 'Salvo.', 'sucesso');
            setTimeout(() => abrirRoteiro(), 0);
            return true;
        },
    });
    const raiz = sheet || document;
    const desenharEtapas = () => {
        const fl = cat === 'lugar' ? 'lugar' : 'reserva_viagem';
        const lst = (r.etapas || {})[fl] || [];
        if (etapa && !lst.some(x => x.codigo === etapa)) etapa = null;
        const box = raiz.querySelector('[data-fi-etapas]'); if (!box) return;
        box.innerHTML = lst.map(x => `<button type="button" class="rz-chip${x.codigo === (etapa || lst[0]?.codigo) ? ' rz-on' : ''}" data-fi-et="${x.codigo}">${esc(x.nome)}</button>`).join('');
        box.querySelectorAll('[data-fi-et]').forEach(b => b.addEventListener('click', () => { etapa = b.dataset.fiEt; desenharEtapas(); }));
    };
    raiz.querySelectorAll('[data-fi-cat]').forEach(b => b.addEventListener('click', () => {
        cat = b.dataset.fiCat; raiz.querySelectorAll('[data-fi-cat]').forEach(x => x.classList.toggle('rz-on', x === b)); desenharEtapas(); }));
    desenharEtapas();
    raiz.querySelector('[data-fi-abrir]')?.addEventListener('click', () => { g('fecharSheet')?.(); ctx?.abrirItem?.(e.item_id); });
    raiz.querySelector('[data-fi-mais]')?.addEventListener('click', () => { g('fecharSheet')?.(); setTimeout(() => folhaEncaixar(r, { item_id: e.item_id, titulo: e.titulo }, true), 0); });
}

/** Quem vai: família (vidas) e pessoas de fora; toda a viagem ou só alguns trechos. */
export async function folhaQuemVai(r) {
    const C = r.ciclo, trechos = r.trechos || [];
    let vidas = [];
    try {
        const { data } = await api.dbAuth.from('cofre_ativos').select('id, nome_exibicao').eq('cliente_id', estado.clienteId)
            .eq('tipo_ativo', 'vida').eq('status', 'ativo').order('nome_exibicao');
        vidas = data || [];
    } catch (err) { vidas = []; }
    const atual = new Map((r.viajantes || []).map(v => [v.ativo_id || 'p:' + v.parte_id, v]));
    const linha = (chave, nome, sub, extra = '') => {
        const v = atual.get(chave), on = !!v || extra === 'novo';
        const tchips = trechos.length > 1 ? `<div class="rz-chips" data-qv-trechos style="margin:4px 0 0 30px${on ? '' : ';display:none'}">${trechos.map(t =>
            `<button type="button" class="rz-chip${v && !v.toda && (v.trechos || []).includes(t.id) ? ' rz-on' : ''}" data-qv-t="${t.id}">${esc(t.nome)}</button>`).join('')}</div>` : '';
        return `<div class="rz-qv" data-qv="${esc(chave)}" style="padding:6px 0;border-bottom:1px solid var(--line)">
            <label style="display:flex;gap:10px;align-items:center;cursor:pointer"><input type="checkbox" data-qv-on ${on ? 'checked' : ''}>
            <span><b>${esc(nome)}</b>${sub ? `<br><span class="rz-hint">${esc(sub)}</span>` : ''}</span></label>${extra === 'novo' ? `
            <div class="rz-row" style="gap:6px;margin:4px 0 0 30px"><input type="text" data-qv-nome maxlength="80" placeholder="Nome" style="flex:2">
            <input type="tel" data-qv-zap maxlength="20" placeholder="WhatsApp (opcional)" style="flex:1.4"></div>` : ''}${tchips}</div>`;
    };
    const externos = (r.viajantes || []).filter(v => v.parte_id);
    const corpo = `<p class="rz-hint" style="margin:0 0 6px">${trechos.length > 1 ? 'Sem trecho marcado, a pessoa vai na viagem toda.' : 'Marque quem vai.'}</p>
        <div data-qv-lista>${vidas.map(a => linha(a.id, a.nome_exibicao, 'Da família')).join('')}
        ${externos.map(v => linha('p:' + v.parte_id, v.nome, 'De fora' + (v.whatsapp ? ' · ' + v.whatsapp : ''))).join('')}</div>
        <button type="button" class="rz-btn rz-btn-3" data-qv-add style="margin-top:8px">+ Pessoa de fora</button>`;
    const sheet = g('abrirSheetForm')?.({ titulo: 'Quem vai', sub: C.nome, rotuloSalvar: 'Salvar', empilhar: true, corpo,
        aoSalvar: async (el) => {
            const lista = [];
            for (const row of el.querySelectorAll('[data-qv]')) {
                if (!row.querySelector('[data-qv-on]')?.checked) continue;
                const chave = row.dataset.qv, ts2 = [...row.querySelectorAll('[data-qv-t].rz-on')].map(b => b.dataset.qvT);
                const item = { trechos: ts2.length && ts2.length < trechos.length ? ts2 : null };
                if (chave === 'novo') { const nome = (row.querySelector('[data-qv-nome]')?.value || '').trim(); if (!nome) continue;
                    item.nome = nome; item.whatsapp = (row.querySelector('[data-qv-zap]')?.value || '').trim() || null; }
                else if (chave.startsWith('p:')) item.parte_id = chave.slice(2); else item.ativo_id = chave;
                lista.push(item);
            }
            const { data, error } = await api.dbAuth.rpc('fn_ciclo_viajantes_salvar', { p_ciclo_id: C.id, p_viajantes: lista, p_canal: 'app' });
            if (error) { aviso(error.message || 'Não foi possível salvar.', 'erro'); return false; }
            aviso(data?.mensagem || 'Salvo.', 'sucesso');
            setTimeout(() => abrirRoteiro(), 0);
            return true;
        } });
    const raiz = sheet || document;
    const ligar = (row) => {
        row.querySelector('[data-qv-on]')?.addEventListener('change', (ev) => { const t = row.querySelector('[data-qv-trechos]'); if (t) t.style.display = ev.target.checked ? '' : 'none'; });
        row.querySelectorAll('[data-qv-t]').forEach(b => b.addEventListener('click', () => b.classList.toggle('rz-on')));
    };
    raiz.querySelectorAll('[data-qv]').forEach(ligar);
    raiz.querySelector('[data-qv-add]')?.addEventListener('click', () => {
        const box = raiz.querySelector('[data-qv-lista]'); box.insertAdjacentHTML('beforeend', linha('novo', 'Pessoa de fora', 'Não precisa estar no Raiz', 'novo'));
        ligar(box.lastElementChild); box.lastElementChild.querySelector('[data-qv-nome]')?.focus();
    });
}
