// ============================================================================
// viagem-compartilhar.js — Raiz Patrimônio · Compartilhar dados de uma viagem ou de um item com quem não está no Raiz
// Versão: 1.2.0 · 26/11/2026
//
// v1.2.0 (26/11/2026, sessão 20261126-1213-viagem-icones, demanda d8061e47; de acordo do Nicola 26/11 12:13) — viagem sai na ordem do
// roteiro (por dia e hora, com o dia como título e o emoji da categoria), Datas e Quem vai no topo, "Sem dia ainda" no fim; Valores no
// topo das opções, com o valor de cada entrada e o total; documentos como "📎 N documentos anexos". Versão anterior: 1.1.0
//
// v1.1.0 (26/11/2026, sessão 20261126-1015-viagem-2b3, demanda d8061e47; FICHA_PROGRAMA_VIAGEM_FATIA2B3 v1.1.0) — bloco "Quem vai"
// (fn_ciclo_roteiro → viajantes), com "(só Araxá)" para quem vai só em alguns trechos. Versão anterior: 1.0.0
//
// v1.0.0 (25/11/2026, sessão 20261125-1019-viagem-compartilhar, demanda faf717a1; FICHA_COMPARTILHAR_VIAGEM_RAIZ v1.0.0, de
// acordo do Nicola 25/11 10:19) — criação. Folha "Compartilhar": a pessoa marca o que vai (datas, cada item com seus registros —
// dia, hora de saída e de chegada, descrição com nº do voo ou reserva —, valores e documentos), vê e pode editar a prévia, e
// "Enviar" abre o compartilhar do celular com o texto e os documentos marcados (baixados ao marcar, para o envio não perder o
// toque). Sem o compartilhar do sistema, copia o texto e baixa os arquivos. Lê fn_ciclo_roteiro (viagem) ou o próprio item
// (avulso); nada muda no banco. Cancelado e Descartado não entram; lugar em Ideia fica desmarcado.
// ============================================================================
export const VERSAO = '1.2.0';
import * as api from './cofre-api.js';

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const g = (nome) => (typeof window !== 'undefined' && typeof window[nome] === 'function') ? window[nome] : null;
const aviso = (msg, tipo = 'info') => (g('rzToast') ? g('rzToast')(msg, tipo) : g('mostrarToast')?.(msg, tipo));
const moeda = (v) => { const f = g('formatarMoedaBR'); return f ? f(Number(v)) : 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
const dmy = (iso) => { if (!iso) return ''; const [a, m, d] = String(iso).slice(0, 10).split('-'); return `${d}/${m}/${a}`; };
const SEM = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const fmt = new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
const partes = (ts) => { if (!ts) return null; const [data, hora] = fmt.format(new Date(ts)).split(' '); return { data, hora: hora === '00:00' ? '' : hora }; };
const diaRot = (iso) => { const [a, m, d] = iso.split('-').map(Number); return SEM[new Date(a, m - 1, d).getDay()] + ' ' + String(d).padStart(2, '0') + '/' + String(m).padStart(2, '0'); };

let st = null; // { titulo, cabecalho, blocos:[{k, rotulo, linhas:[{txt, valor}], on}], docs:[{id,nome,path,mime,on,file}], valores }

function linhaRegistro(e) {
    const p = partes(e.inicio_em), f = partes(e.fim_em);
    let quando = '(sem dia marcado)';
    if (p) {
        quando = diaRot(p.data) + (p.hora ? ' ' + p.hora : '');
        if (f) quando += ' → ' + (f.data !== p.data ? diaRot(f.data) + ' ' : '') + (f.hora || '');
    }
    return { txt: quando + (e.descricao ? ' · ' + e.descricao : ''), valor: e.valor };
}
const EMOJI = { viagem_deslocamento: '✈️', viagem_hospedagem: '🏨', viagem_locomocao: '🚗', viagem_atracao: '🎟️', viagem_alimentacao: '🍽️',
    viagem_lugar: '📍', seguro_viagem: '🛡️' };
const emoji = (sub) => EMOJI[sub] || '•';
function montarTexto() {
    if (st.modo === 'viagem') return montarTextoViagem();
    const out = [st.cabecalho];
    st.blocos.filter(b => b.on).forEach(b => {
        out.push('', '*' + b.rotulo + '*');
        b.linhas.forEach(l => out.push('• ' + l.txt + (st.valores && l.valor ? ' · ' + moeda(l.valor) : '')));
    });
    const docs = st.docs.filter(d => d.on);
    if (docs.length) out.push('', '📎 ' + docs.length + (docs.length === 1 ? ' documento anexo' : ' documentos anexos'));
    return out.join('\n');
}
// v1.2.0 — viagem na ordem do roteiro
function montarTextoViagem() {
    const on = (k) => st.blocos.find(b => b.k === k)?.on;
    const out = [st.cabecalho];
    if (on('datas')) out.push('📅 ' + st.datas);
    if (on('quem') && st.quem) out.push('👥 ' + st.quem);
    let dia = null, total = 0;
    st.entradas.filter(x => on(x.item)).forEach(x => {
        if (x.dia !== dia) { dia = x.dia; out.push('', '*' + (dia ? diaRot(dia) : 'Sem dia ainda') + '*'); }
        out.push(emoji(x.sub) + ' ' + x.txt + (st.valores && x.valor ? ' · ' + moeda(x.valor) : ''));
        if (x.valor) total += Number(x.valor);
    });
    if (st.valores && total) out.push('', '💰 Total: ' + moeda(total));
    const docs = st.docs.filter(d => d.on);
    if (docs.length) out.push('', '📎 ' + docs.length + (docs.length === 1 ? ' documento anexo' : ' documentos anexos'));
    return out.join('\n');
}

async function docsDosItens(itemIds) {
    if (!itemIds.length) return [];
    const [{ data: vs }, { data: ocs }] = await Promise.all([
        api.dbAuth.from('cofre_documento_vinculos').select('documento_id, cofre_documentos(id, nome_exibicao, storage_path, mime_type, status)')
            .eq('entidade_tipo', 'item_controle').in('entidade_id', itemIds),
        api.dbAuth.from('cofre_ocorrencias_controle').select('documento_id, cofre_documentos(id, nome_exibicao, storage_path, mime_type, status)')
            .in('item_controle_id', itemIds).not('documento_id', 'is', null),
    ]);
    const m = new Map();
    [...(vs || []), ...(ocs || [])].forEach(x => { const d = x.cofre_documentos; if (d && d.status !== 'excluido' && d.storage_path && !m.has(d.id))
        m.set(d.id, { id: d.id, nome: d.nome_exibicao || 'documento', path: d.storage_path, mime: d.mime_type || 'application/octet-stream', on: false, file: null }); });
    return [...m.values()];
}

/** Compartilhar uma viagem (ciclo). v1.2.0: na ordem do roteiro. */
export async function compartilharViagem({ cicloId }) {
    const { data: r, error } = await api.dbAuth.rpc('fn_ciclo_roteiro', { p_ciclo_id: cicloId });
    if (error || !r?.pode_ver) { aviso(error?.message || 'Não foi possível ler a viagem.', 'erro'); return; }
    const vistos = new Set(), entradas = [];
    const add = (e, dia) => {
        if (e.papel === 'fim' || vistos.has(e.ocorrencia_id)) return; vistos.add(e.ocorrencia_id);
        const p = partes(e.inicio_em), f = partes(e.fim_em);
        let quando = p?.hora || '';
        if (f) quando += (quando ? ' ' : '') + '→ ' + (f.data !== (p?.data || dia) ? diaRot(f.data) + ' ' : '') + (f.hora || '');
        entradas.push({ item: e.item_id, sub: e.sub, dia, ord: (dia || '9999') + ' ' + (p?.hora || '00:00'), valor: e.valor,
            txt: [e.titulo, quando.trim(), e.descricao].filter(Boolean).join(' · ') });
    };
    (r.trechos || []).forEach(t => (t.dias || []).forEach(d => (d.entradas || []).forEach(e => add(e, d.data))));
    (r.fora_dos_trechos || []).forEach(e => add(e, e.dia || partes(e.inicio_em)?.data || null));
    (r.a_encaixar || []).forEach(e => add(e, null));
    entradas.sort((a, b) => a.ord.localeCompare(b.ord));
    const nomeT = (id) => (r.trechos || []).find(t => t.id === id)?.nome || '';
    const quem = (r.viajantes || []).map(v => String(v.nome || '').split(' ')[0] + (v.toda ? '' : ' (só ' + (v.trechos || []).map(nomeT).filter(Boolean).join(', ') + ')')).join(', ');
    const blocos = [{ k: 'datas', rotulo: 'Datas', linhas: [{ txt: 'Ida ' + dmy(r.ciclo.inicio) + ' · Volta ' + dmy(r.ciclo.fim) }], on: true }];
    if (quem) blocos.push({ k: 'quem', rotulo: 'Quem vai', linhas: [{ txt: quem }], on: true });
    const ordemItens = [];
    entradas.forEach(x => { if (!ordemItens.includes(x.item)) ordemItens.push(x.item); });
    ordemItens.forEach(id => {
        const es = entradas.filter(x => x.item === id);
        blocos.push({ k: id, rotulo: emoji(es[0].sub) + ' ' + es[0].txt.split(' · ')[0], linhas: es.map(x => ({ txt: (x.dia ? diaRot(x.dia) : 'sem dia') + ' · ' + x.txt.split(' · ').slice(1).join(' · ') })),
            on: es.some(x => x.dia) });
    });
    st = { modo: 'viagem', titulo: r.ciclo.nome, cabecalho: '*' + r.ciclo.nome + '*', datas: 'Ida ' + dmy(r.ciclo.inicio) + ' · Volta ' + dmy(r.ciclo.fim),
        quem: quem ? 'Quem vai: ' + quem : '', entradas, blocos, docs: await docsDosItens(ordemItens), valores: false };
    abrirFolha();
}

/** Compartilhar um item (avulso ou de viagem). */
export async function compartilharItem({ itemId }) {
    let it;
    try { it = await api.buscarItemControlePorId(itemId); } catch (e) { aviso('Não foi possível ler o item.', 'erro'); return; }
    const regs = (it.cofre_ocorrencias_controle || []).filter(o => o.status_execucao !== 'cancelado')
        .sort((a, b) => String(a.inicio_em || a.data_prevista_atual).localeCompare(String(b.inicio_em || b.data_prevista_atual)));
    const blocos = [];
    blocos.push({ k: 'datas', rotulo: 'Datas', linhas: [{ txt: dmy(it.data_base) + (it.data_fim ? ' a ' + dmy(it.data_fim) : '') }], on: true });
    if (it.descricao) blocos.push({ k: 'desc', rotulo: 'Detalhes', linhas: it.descricao.split('\n').map(s => s.trim()).filter(s => s && !/^Criado pelo robô/i.test(s)).map(txt => ({ txt })), on: true });
    const comDia = regs.filter(o => o.inicio_em || o.descricao);
    if (comDia.length) blocos.push({ k: 'regs', rotulo: 'Registros', linhas: comDia.map(o => linhaRegistro({ inicio_em: o.inicio_em, fim_em: o.fim_em, descricao: o.descricao, valor: o.valor_real ?? o.valor_previsto })), on: true });
    if (it.valor_previsto) blocos.push({ k: 'valor', rotulo: 'Valor', linhas: [{ txt: moeda(it.valor_previsto) }], on: false });
    st = { titulo: it.titulo, cabecalho: '*' + it.titulo + '*', blocos, docs: await docsDosItens([it.id]), valores: false };
    abrirFolha();
}

function abrirFolha() {
    const chk = (attr, id, on, rot, sub = '') => `<label class="rz-row" style="gap:10px;align-items:flex-start;width:100%;cursor:pointer">
        <input type="checkbox" ${attr}="${esc(id)}" ${on ? 'checked' : ''} style="margin-top:3px;flex:none">
        <div class="rz-tx"><b>${esc(rot)}</b>${sub ? `<span>${esc(sub)}</span>` : ''}</div></label>`;
    const corpo = `<p class="rz-hint" style="margin:0 0 6px">Marque o que vai. Você vê o texto antes de enviar.</p>`
        + chk('data-cp-valores', '1', false, 'Valores', 'Valor de cada entrada e o total') // v1.2.0 — no topo
        + st.blocos.map(b => chk('data-cp-b', b.k, b.on, b.rotulo, b.linhas.slice(0, 2).map(l => l.txt).join(' · ') + (b.linhas.length > 2 ? ' …' : ''))).join('')
        + (st.docs.length ? `<div class="rz-group rz-group-t" style="margin-top:12px"><span>Documentos</span></div>` + st.docs.map(d => chk('data-cp-d', d.id, false, d.nome)).join('') : '')
        + `<div class="rz-group rz-group-t" style="margin-top:12px"><span>Prévia</span></div>
           <textarea id="cp-texto" rows="10" style="width:100%;font:inherit;font-size:14px;padding:10px;border:1px solid var(--line);border-radius:12px"></textarea>
           <span class="rz-hint">Pode ajustar o texto à vontade antes de enviar.</span>`;
    let editado = false;
    const sheet = g('abrirSheetForm')?.({ titulo: 'Compartilhar', sub: st.titulo, rotuloSalvar: 'Enviar', empilhar: true, corpo, aoSalvar: (el) => enviar(el) });
    const raiz = sheet || document;
    const ta = raiz.querySelector('#cp-texto');
    const refazer = () => { if (!editado && ta) ta.value = montarTexto(); };
    ta?.addEventListener('input', () => { editado = true; });
    raiz.querySelectorAll('[data-cp-b]').forEach(c => c.addEventListener('change', () => { const b = st.blocos.find(x => x.k === c.dataset.cpB); if (b) b.on = c.checked; editado = false; refazer(); }));
    raiz.querySelector('[data-cp-valores]')?.addEventListener('change', (ev) => { st.valores = ev.target.checked; editado = false; refazer(); });
    raiz.querySelectorAll('[data-cp-d]').forEach(c => c.addEventListener('change', async () => {
        const d = st.docs.find(x => x.id === c.dataset.cpD); if (!d) return;
        d.on = c.checked; editado = false; refazer();
        if (d.on && !d.file) { // baixa já, para o envio acontecer no mesmo toque
            try { const blob = await api.baixarArquivoDocumento(d.path); const ext = (d.path.split('.').pop() || '').toLowerCase();
                const nome = /\.[a-z0-9]{2,5}$/i.test(d.nome) ? d.nome : d.nome + (ext ? '.' + ext : '');
                d.file = new File([blob], nome, { type: d.mime }); }
            catch (e) { aviso('Não foi possível baixar ' + d.nome + '.', 'erro'); d.on = false; c.checked = false; refazer(); }
        }
    }));
    refazer();
}

async function enviar(el) {
    const texto = (el.querySelector('#cp-texto')?.value || '').trim();
    if (!texto) { aviso('Nada para enviar.', 'erro'); return false; }
    const docs = st.docs.filter(d => d.on);
    if (docs.some(d => !d.file)) { aviso('Ainda baixando os documentos. Tente de novo em instantes.', 'erro'); return false; }
    const files = docs.map(d => d.file);
    try {
        if (navigator.share && (!files.length || (navigator.canShare && navigator.canShare({ files })))) {
            await navigator.share(files.length ? { text: texto, files } : { text: texto });
            return true;
        }
    } catch (e) { if (e?.name === 'AbortError') return false; }
    // sem o compartilhar do sistema: copia o texto e baixa os arquivos
    try { await navigator.clipboard.writeText(texto); aviso('Texto copiado' + (files.length ? '; documentos baixados.' : '.'), 'sucesso'); } catch (e) { aviso('Copie o texto da prévia.', 'info'); return false; }
    files.forEach(f => { const a = document.createElement('a'); a.href = URL.createObjectURL(f); a.download = f.name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000); });
    return true;
}
