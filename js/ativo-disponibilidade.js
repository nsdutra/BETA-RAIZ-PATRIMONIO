// =====================================================================
// RAIZ PATRIMÔNIO — js/ativo-disponibilidade.js
// Versão: 1.0.0 · 14/11/2026
// -----------------------------------------------------------------
// v1.0.0 (14/11/2026, sessão 20261114-1115-crm-f2b-2b, demanda 09277cba; FICHA_DISPONIBILIDADE_SALVAR_RAIZ v1.0.0,
// de acordo do Nicola 14/11 11:12) — criação.
//   · Tela "Disponibilidade" do uso (⋮ do uso no chip Usos e contratos): regras que a agenda, a vitrine e o robô leem
//     por fn_agenda_disponibilidade — diária (mínimo/máximo de noites, entrada/saída, hóspedes) ou por hora (duração e
//     janelas de horário), antecedência, aprovação, preço base, períodos especiais (valor + mínimo de noites, ex. Réveillon)
//     e bloqueios.
//   · Grava pela porta única fn_ativo_disponibilidade_salvar (ativo_usos só tem leitura pelo app). Chaves que a tela não
//     mostra (ex.: regras_vitrine, preco.unidade) são mantidas como estavam.
//   · Uso sem regras próprias abre com o padrão do modelo (operacao_modelo_tipos.parametros_padrao).
// =====================================================================
export const VERSAO = '1.0.0';

// modelos que usam agenda de ocupação/horário (os que têm parametros_padrao.disponibilidade no catálogo)
export const MODELOS_COM_DISPONIBILIDADE = ['temporada', 'short_stay', 'cowork', 'atendimento'];

const DIAS = [[1, 'Seg'], [2, 'Ter'], [3, 'Qua'], [4, 'Qui'], [5, 'Sex'], [6, 'Sáb'], [7, 'Dom']];
const esc = (s) => (typeof rzEsc === 'function' ? rzEsc(s) : String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])));
const toast = (m, t) => (typeof mostrarToast === 'function' ? mostrarToast(m, t) : alert(m));
const num = (v) => { const s = String(v ?? '').trim().replace(/\./g, '').replace(',', '.'); if (!s) return null; const n = Number(s); return Number.isFinite(n) ? n : NaN; };
const int = (v) => { const n = num(v); return n === null ? null : (Number.isInteger(n) ? n : NaN); };
const moeda = (n) => (n === null || n === undefined || n === '' ? '' : Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));

async function carregar(usoId, modelo) {
    const db = typeof dbAuth !== 'undefined' ? dbAuth : null;
    if (!db) throw new Error('Abra pelo app principal.');
    const { data: u, error } = await db.from('ativo_usos').select('id, modelo, parametros').eq('id', usoId).maybeSingle();
    if (error) throw error;
    if (!u) throw new Error('Uso não encontrado.');
    let d = (u.parametros && u.parametros.disponibilidade) || null;
    let doPadrao = false;
    if (!d || !Object.keys(d).length) {
        const { data: p } = await db.from('operacao_modelo_tipos').select('parametros_padrao').eq('modelo', u.modelo || modelo).not('parametros_padrao', 'is', null).limit(1);
        d = (p && p[0] && p[0].parametros_padrao && p[0].parametros_padrao.disponibilidade) || {};
        doPadrao = true;
    }
    return { d: JSON.parse(JSON.stringify(d)), doPadrao };
}

// o: { usoId, modelo, nomeUso, nomeBem, aoSalvar }
export async function abrirDisponibilidadeUso(o = {}) {
    if (typeof rzMostrarBloqueio === 'function' && rzMostrarBloqueio('ativo.disponibilidade')) return;
    if (typeof window.podeUsar === 'function' && !window.podeUsar('ativo.disponibilidade').ok) { toast('Seu perfil não pode mudar a disponibilidade.', 'erro'); return; }
    if (typeof abrirSheetForm !== 'function') { toast('Abra pelo app principal.', 'erro'); return; }
    let base;
    try { base = await carregar(o.usoId, o.modelo); } catch (e) { toast(e.message || 'Não consegui abrir a disponibilidade.', 'erro'); return; }
    const d = base.d;
    const st = {
        unidade: d.unidade || (o.modelo === 'cowork' ? 'hora' : o.modelo === 'atendimento' ? 'slot' : 'dia'),
        janelas: Array.isArray(d.janelas) ? d.janelas.map(j => ({ de: j.de || '', ate: j.ate || '', dias: Array.isArray(j.dias) ? j.dias.slice() : [] })) : [],
        especiais: Array.isArray(d.preco && d.preco.especiais) ? d.preco.especiais.map(e => ({ ...e })) : [],
        bloqueios: Array.isArray(d.bloqueios) ? d.bloqueios.map(b => ({ ...b })) : [],
    };
    const corpo = `
        ${base.doPadrao ? '<p class="rz-desc" style="margin:0 0 8px">Este uso ainda não tem regras próprias: a tela abre com o padrão do modelo. Ao salvar, elas passam a valer só para este uso.</p>' : ''}
        <div class="rz-f"><label for="ad-unidade">Como se reserva</label><select id="ad-unidade">
            <option value="dia"${st.unidade === 'dia' ? ' selected' : ''}>Por diária (noites)</option>
            <option value="hora"${st.unidade === 'hora' ? ' selected' : ''}>Por hora</option>
            <option value="slot"${st.unidade === 'slot' ? ' selected' : ''}>Horários de atendimento</option></select></div>
        <div id="ad-dia">
            <div class="grid grid-cols-2 gap-2"><div class="rz-f"><label for="ad-min">Mínimo de noites</label><input type="number" inputmode="numeric" min="1" id="ad-min" value="${esc(d.minimo ?? '')}"></div>
            <div class="rz-f"><label for="ad-max">Máximo de noites</label><input type="number" inputmode="numeric" min="1" id="ad-max" value="${esc(d.maximo ?? '')}" placeholder="Sem limite"></div></div>
            <div class="grid grid-cols-2 gap-2"><div class="rz-f"><label for="ad-ent">Entrada a partir de</label><input type="time" id="ad-ent" value="${esc(d.entrada || '')}"></div>
            <div class="rz-f"><label for="ad-sai">Saída até</label><input type="time" id="ad-sai" value="${esc(d.saida || '')}"></div></div>
            <div class="rz-f"><label for="ad-hosp">Hóspedes no máximo</label><input type="number" inputmode="numeric" min="1" id="ad-hosp" value="${esc(d.hospedes_max ?? '')}" placeholder="Sem limite"></div>
        </div>
        <div id="ad-hora">
            <div class="rz-f"><label for="ad-slot">Duração (minutos)</label><input type="text" inputmode="numeric" id="ad-slot" value="${esc((d.slot_min || []).join(', '))}" placeholder="Ex.: 30, 60"></div>
            <div class="rz-group" style="margin-top:6px">Janelas de horário<span></span></div>
            <div id="ad-janelas"></div>
            <button type="button" class="rz-btn rz-btn-2 rz-sm" id="ad-jan-add" style="margin:4px 0 10px"><i data-lucide="plus"></i> Janela</button>
        </div>
        <div class="grid grid-cols-2 gap-2"><div class="rz-f"><label for="ad-ant">Antecedência (horas)</label><input type="number" inputmode="numeric" min="0" id="ad-ant" value="${esc(d.antecedencia_horas ?? '')}" placeholder="0"></div>
        <div class="rz-f"><label for="ad-apr">Aprovação</label><select id="ad-apr"><option value="manual"${(d.aprovacao || 'manual') === 'manual' ? ' selected' : ''}>Eu aprovo cada pedido</option><option value="automatica"${d.aprovacao === 'automatica' ? ' selected' : ''}>Automática</option></select></div></div>
        <div class="rz-f"><label for="ad-preco" id="ad-preco-rot">Preço base</label><input type="text" inputmode="decimal" id="ad-preco" value="${esc(moeda(d.preco && d.preco.base))}" placeholder="R$ 0,00"></div>
        <div class="rz-group" style="margin-top:6px">Períodos especiais<span></span></div>
        <p class="rz-desc" style="margin:0 0 6px">Natal, Réveillon, Carnaval: preço e mínimo de noites próprios no período.</p>
        <div id="ad-especiais"></div>
        <button type="button" class="rz-btn rz-btn-2 rz-sm" id="ad-esp-add" style="margin:4px 0 10px"><i data-lucide="plus"></i> Período especial</button>
        <div class="rz-group" style="margin-top:6px">Bloqueios<span></span></div>
        <p class="rz-desc" style="margin:0 0 6px">Dias em que o bem não aceita reserva (reforma, uso da família).</p>
        <div id="ad-bloqueios"></div>
        <button type="button" class="rz-btn rz-btn-2 rz-sm" id="ad-blq-add" style="margin:4px 0 0"><i data-lucide="plus"></i> Bloqueio</button>`;

    const sheet = abrirSheetForm({
        titulo: 'Disponibilidade', sub: [o.nomeBem, o.nomeUso].filter(Boolean).join(' · '), corpo, rotuloSalvar: 'Salvar',
        aoSalvar: async () => salvar(),
    });
    const raiz = sheet || document;
    const $ = (s) => raiz.querySelector(s);

    // ---- listas editáveis: lê o que está na tela antes de redesenhar, para não perder digitação
    function lerListas() {
        raiz.querySelectorAll('[data-jan]').forEach(el => {
            const j = st.janelas[Number(el.dataset.jan)]; if (!j) return;
            j.de = el.querySelector('[data-k="de"]').value; j.ate = el.querySelector('[data-k="ate"]').value;
            j.dias = [...el.querySelectorAll('[data-dia]')].filter(b => b.classList.contains('rz-on')).map(b => Number(b.dataset.dia));
        });
        raiz.querySelectorAll('[data-esp]').forEach(el => {
            const e = st.especiais[Number(el.dataset.esp)]; if (!e) return;
            ['nome', 'de', 'ate', 'valor', 'minimo'].forEach(k => { e[k] = el.querySelector(`[data-k="${k}"]`).value; });
        });
        raiz.querySelectorAll('[data-blq]').forEach(el => {
            const b = st.bloqueios[Number(el.dataset.blq)]; if (!b) return;
            ['de', 'ate', 'motivo'].forEach(k => { b[k] = el.querySelector(`[data-k="${k}"]`).value; });
        });
    }
    const btnTirar = (attr, i) => `<button type="button" class="rz-ico-btn" ${attr}="${i}" aria-label="Tirar"><i data-lucide="x"></i></button>`;
    function desenharListas() {
        $('#ad-janelas').innerHTML = st.janelas.map((j, i) => `
            <div class="rz-card" data-jan="${i}" style="padding:10px;margin:0 0 8px">
                <div class="rz-chips" style="margin:0 0 6px">${DIAS.map(([n, r]) => `<button type="button" class="rz-chip${j.dias.includes(n) ? ' rz-on' : ''}" data-dia="${n}">${r}</button>`).join('')}</div>
                <div style="display:flex;gap:8px;align-items:flex-end"><div class="rz-f" style="flex:1;margin:0"><label>De</label><input type="time" data-k="de" value="${esc(j.de)}"></div>
                <div class="rz-f" style="flex:1;margin:0"><label>Até</label><input type="time" data-k="ate" value="${esc(j.ate)}"></div>${btnTirar('data-jan-tirar', i)}</div>
            </div>`).join('') || '<p class="rz-desc" style="margin:0 0 6px">Nenhuma janela.</p>';
        $('#ad-especiais').innerHTML = st.especiais.map((e, i) => `
            <div class="rz-card" data-esp="${i}" style="padding:10px;margin:0 0 8px">
                <div style="display:flex;gap:8px;align-items:flex-end"><div class="rz-f" style="flex:1;margin:0"><label>Nome</label><input type="text" data-k="nome" maxlength="60" value="${esc(e.nome || '')}" placeholder="Ex.: Réveillon"></div>${btnTirar('data-esp-tirar', i)}</div>
                <div class="grid grid-cols-2 gap-2" style="margin-top:6px"><div class="rz-f" style="margin:0"><label>De</label><input type="date" data-k="de" value="${esc(e.de || '')}"></div>
                <div class="rz-f" style="margin:0"><label>Até</label><input type="date" data-k="ate" value="${esc(e.ate || '')}"></div></div>
                <div class="grid grid-cols-2 gap-2" style="margin-top:6px"><div class="rz-f" style="margin:0"><label>Valor</label><input type="text" inputmode="decimal" data-k="valor" value="${esc(typeof e.valor === 'number' ? moeda(e.valor) : (e.valor || ''))}" placeholder="R$"></div>
                <div class="rz-f" style="margin:0"><label>Mínimo de noites</label><input type="number" inputmode="numeric" min="1" data-k="minimo" value="${esc(e.minimo ?? '')}"></div></div>
            </div>`).join('') || '<p class="rz-desc" style="margin:0 0 6px">Nenhum período especial.</p>';
        $('#ad-bloqueios').innerHTML = st.bloqueios.map((b, i) => `
            <div class="rz-card" data-blq="${i}" style="padding:10px;margin:0 0 8px">
                <div class="grid grid-cols-2 gap-2"><div class="rz-f" style="margin:0"><label>De</label><input type="date" data-k="de" value="${esc(b.de || '')}"></div>
                <div class="rz-f" style="margin:0"><label>Até</label><input type="date" data-k="ate" value="${esc(b.ate || '')}"></div></div>
                <div style="display:flex;gap:8px;align-items:flex-end;margin-top:6px"><div class="rz-f" style="flex:1;margin:0"><label>Motivo</label><input type="text" data-k="motivo" maxlength="80" value="${esc(b.motivo || '')}" placeholder="Ex.: reforma"></div>${btnTirar('data-blq-tirar', i)}</div>
            </div>`).join('') || '<p class="rz-desc" style="margin:0">Nenhum bloqueio.</p>';
        raiz.querySelectorAll('[data-dia]').forEach(b => b.addEventListener('click', () => b.classList.toggle('rz-on')));
        [['data-jan-tirar', 'janelas'], ['data-esp-tirar', 'especiais'], ['data-blq-tirar', 'bloqueios']].forEach(([attr, k]) =>
            raiz.querySelectorAll(`[${attr}]`).forEach(b => b.addEventListener('click', () => { lerListas(); st[k].splice(Number(b.getAttribute(attr)), 1); desenharListas(); })));
        if (typeof refrescarIcones === 'function') refrescarIcones(); else if (window.lucide) window.lucide.createIcons();
    }
    function mostrarUnidade() {
        st.unidade = $('#ad-unidade').value;
        $('#ad-dia').style.display = st.unidade === 'dia' ? '' : 'none';
        $('#ad-hora').style.display = st.unidade === 'dia' ? 'none' : '';
        $('#ad-preco-rot').textContent = st.unidade === 'dia' ? 'Preço base da noite' : 'Preço base da hora';
    }
    $('#ad-unidade').addEventListener('change', mostrarUnidade);
    $('#ad-jan-add').addEventListener('click', () => { lerListas(); st.janelas.push({ de: '09:00', ate: '18:00', dias: [1, 2, 3, 4, 5] }); desenharListas(); });
    $('#ad-esp-add').addEventListener('click', () => { lerListas(); st.especiais.push({ nome: '', de: '', ate: '', valor: '', minimo: '' }); desenharListas(); });
    $('#ad-blq-add').addEventListener('click', () => { lerListas(); st.bloqueios.push({ de: '', ate: '', motivo: '' }); desenharListas(); });
    mostrarUnidade(); desenharListas();

    async function salvar() {
        lerListas();
        const v = (id) => ($(id)?.value ?? '').trim();
        const out = { ...d, unidade: st.unidade };
        const erros = [];
        const ant = int(v('#ad-ant')); if (Number.isNaN(ant)) erros.push('antecedência');
        out.antecedencia_horas = ant; out.aprovacao = v('#ad-apr') || 'manual';
        if (st.unidade === 'dia') {
            const mi = int(v('#ad-min')), ma = int(v('#ad-max')), ho = int(v('#ad-hosp'));
            if ([mi, ma, ho].some(Number.isNaN)) erros.push('noites ou hóspedes');
            Object.assign(out, { minimo: mi, maximo: ma, hospedes_max: ho, entrada: v('#ad-ent') || null, saida: v('#ad-sai') || null });
        } else {
            const slots = v('#ad-slot').split(/[,;\s]+/).filter(Boolean).map(Number);
            if (slots.some(n => !Number.isInteger(n) || n < 5)) erros.push('duração');
            out.slot_min = slots.length ? slots : null;
            out.janelas = st.janelas.map(j => ({ de: j.de, ate: j.ate, dias: j.dias.slice().sort() }));
        }
        const pb = num(v('#ad-preco')); if (Number.isNaN(pb)) erros.push('preço base');
        const esp = st.especiais.filter(e => e.de || e.ate || e.valor || e.minimo || e.nome).map(e => ({
            nome: (e.nome || '').trim() || null, de: e.de || null, ate: e.ate || null, valor: num(e.valor), minimo: int(e.minimo) }));
        if (esp.some(e => Number.isNaN(e.valor) || Number.isNaN(e.minimo))) erros.push('período especial');
        out.preco = { ...(d.preco || {}), base: pb, especiais: esp };
        out.bloqueios = st.bloqueios.filter(b => b.de || b.ate || b.motivo).map(b => ({ de: b.de || null, ate: b.ate || null, motivo: (b.motivo || '').trim() || null }));
        if (erros.length) { toast('Confira: ' + erros.join(', ') + '.', 'erro'); return false; }
        const { data, error } = await dbAuth.rpc('fn_ativo_disponibilidade_salvar', { p_uso_id: o.usoId, p_disponibilidade: out, p_canal: 'app' });
        if (error) { toast(error.message || 'Não consegui salvar.', 'erro'); return false; }
        if (!data || !data.ok) { toast((data && data.mensagem) || 'Não consegui salvar.', 'erro'); return false; }
        toast(data.mensagem || 'Disponibilidade salva.', 'sucesso');
        if (typeof o.aoSalvar === 'function') { try { await o.aoSalvar(); } catch (e) { /* a lista recarrega na próxima abertura */ } }
        return true;
    }
}
