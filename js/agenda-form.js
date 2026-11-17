// =====================================================================
// RAIZ PATRIMÔNIO — js/agenda-form.js
// Versão: 1.2.0 · 16/11/2026
// -----------------------------------------------------------------
// v1.2.0 (16/11/2026, sessão 20261116-2330-crm-f4t2, demanda 09277cba; decisões do Nicola 16/11 22:49 e 23:22) — Aprovar uma
// pré-reserva abre "Confirmar reserva" com o recebimento já no padrão (sinal 50% hoje, saldo no dia da entrada) para ajustar
// antes de confirmar; o banco (fn_reserva_gerar_contrato) cria o contrato com sinal e saldo e a mensagem diz os valores.
// Versão anterior: 1.1.0
// v1.1.0 (14/11/2026, sessão 20261114-1910-crm-reuniao-1; FICHA_REUNIAO_LEAD_GOOGLE_MEET_RAIZ v1.0.2) — depois de decidir um pedido de
// reunião, chama a Edge agenda-google (sincronizar): reunião de lead aprovada vira evento no Google com Meet e o lead recebe o
// link; recusada, o evento sai e o lead é avisado. Outras agendas não são tocadas (a Edge confere). Versão anterior: 1.0.0
// v1.0.0 (14/11/2026, sessão 20261114-0839-crm-f2b, demanda 09277cba; FICHA_CRM_AGENDA_OCUPACAO_RAIZ v1.2.0 F2b +
// PLANO_EXECUCAO_CRM_F2B_A_F4 v1.0.1, de acordo do Nicola 14/11 08:39 e 10:41) — criação.
//   · FORMULÁRIO ÚNICO (abrirFormularioAgenda): Reserva · Reunião · Compromisso · Manutenção, no bem escolhido, com hora;
//     aviso de conflito ao vivo (fn_agenda_conflitos: bloqueio do uso e o mesmo bem no mesmo horário) e gravação pela porta
//     única fn_agenda_reservar. Conflito no mesmo bem: reserva não salva; os outros pedem confirmação.
//   · DECIDIR PEDIDO (abrirDecisaoPedido): Aprovar · Outra data · Recusar, para reunião aguardando e pré-reserva
//     (fn_agenda_pedido_decidir). Aprovar pré-reserva gera o contrato na F4 (até lá o banco avisa).
// Nada de banco novo aqui: tudo pelas funções da migration crm_f2b_motor_agenda (v1–v3).
// =====================================================================
export const VERSAO = '1.2.0';

const TIPOS = [['reuniao', 'Reunião', 'users'], ['compromisso', 'Compromisso', 'calendar-check'], ['manutencao', 'Manutenção', 'wrench'], ['reserva', 'Reserva', 'bed-double']];
const esc = (s) => (typeof rzEsc === 'function' ? rzEsc(s) : String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])));
const iso = (d) => d.toLocaleDateString('sv-SE');
const tz = (data, hora) => `${data}T${hora || '00:00'}:00-03:00`; // Brasília (sem horário de verão)
const hm = (x) => new Date(x).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
const dm = (x) => new Date(x).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
const toast = (m, t) => (typeof mostrarToast === 'function' ? mostrarToast(m, t) : alert(m));
const perguntar = async (o) => (typeof window.rzConfirmar === 'function' ? window.rzConfirmar(o) : confirm(o.impacto || o.titulo));

let ativosCache = null;
async function listarAtivos() {
    if (ativosCache) return ativosCache;
    const { data } = await dbAuth.from('cofre_ativos').select('id, nome_exibicao, tipo_ativo, status').eq('cliente_id', CLIENTE_ID_SUPABASE).eq('status', 'ativo').order('nome_exibicao');
    ativosCache = data || [];
    return ativosCache;
}

// pref: { tipo, ativoId, data, hora, aoSalvar }
export async function abrirFormularioAgenda(pref = {}) {
    if (typeof rzMostrarBloqueio === 'function' && rzMostrarBloqueio('agenda.reservar')) return;
    const ativos = await listarAtivos();
    const st = { tipo: pref.tipo || 'reuniao', seq: 0 };
    const hoje = iso(new Date());
    const corpo = `
        <div class="rz-chips" id="af-tipos" style="margin:0 0 10px">${TIPOS.map(([k, n, ic]) => `<button type="button" class="rz-chip${k === st.tipo ? ' rz-on' : ''}" data-af-tipo="${k}"><i data-lucide="${ic}"></i> ${n}</button>`).join('')}</div>
        <div class="rz-f"><label>Bem ou pessoa</label><select id="af-ativo">${ativos.map(a => `<option value="${a.id}"${a.id === pref.ativoId ? ' selected' : ''}>${esc(a.nome_exibicao)}</option>`).join('')}</select></div>
        <div id="af-campos"></div>
        <div id="af-conflito" aria-live="polite"></div>`;
    const sheet = abrirSheetForm({
        titulo: 'Marcar na agenda', sub: 'Reserva, reunião, compromisso ou manutenção', corpo, rotuloSalvar: 'Salvar',
        aoSalvar: async (el) => salvar(el, false),
    });
    const raiz = sheet || document;
    const $ = (s) => raiz.querySelector(s);

    function campos() {
        const el = $('#af-campos'); if (!el) return;
        if (st.tipo === 'reserva') {
            el.innerHTML = `
                <div class="grid grid-cols-2 gap-2"><div class="rz-f"><label>Entrada</label><input type="date" id="af-de" value="${pref.data || hoje}"></div>
                <div class="rz-f"><label>Saída</label><input type="date" id="af-ate" value="${pref.data ? iso(new Date(new Date(pref.data + 'T12:00').getTime() + 2 * 864e5)) : iso(new Date(Date.now() + 2 * 864e5))}"></div></div>
                <div class="grid grid-cols-2 gap-2"><div class="rz-f"><label>Hora de entrada</label><input type="time" id="af-hi" value="15:00"></div>
                <div class="rz-f"><label>Hora de saída</label><input type="time" id="af-hf" value="11:00"></div></div>
                <div class="rz-f"><label>Hóspede</label><input type="text" id="af-nome" placeholder="Nome de quem vai ficar"></div>
                <div class="grid grid-cols-2 gap-2"><div class="rz-f"><label>WhatsApp</label><input type="tel" id="af-wa" placeholder="(11) 9…"></div>
                <div class="rz-f"><label>Valor combinado (R$)</label><input type="number" step="0.01" id="af-valor" placeholder="Opcional"></div></div>
                <p class="rz-desc">A reserva entra como pedido aguardando sua aprovação, com o prazo da empresa (Minha empresa › Rotinas).</p>`;
        } else {
            const titulo = { reuniao: 'Reunião com…', compromisso: 'O que é', manutencao: 'O que vai ser feito' }[st.tipo];
            el.innerHTML = `
                <div class="rz-f"><label>${titulo}</label><input type="text" id="af-titulo" maxlength="160" placeholder="${st.tipo === 'manutencao' ? 'Ex.: troca do aquecedor' : st.tipo === 'reuniao' ? 'Ex.: Reunião com a Marina' : 'Ex.: Visita do corretor'}"></div>
                <div class="grid grid-cols-3 gap-2"><div class="rz-f"><label>Dia</label><input type="date" id="af-de" value="${pref.data || hoje}"></div>
                <div class="rz-f"><label>Início</label><input type="time" id="af-hi" value="${pref.hora || '09:00'}"></div>
                <div class="rz-f"><label>Fim</label><input type="time" id="af-hf" value="${pref.hora ? '' : '10:00'}"></div></div>
                <div class="rz-f"><label>Local</label><input type="text" id="af-local" maxlength="120" placeholder="Opcional"></div>
                ${st.tipo === 'reuniao' ? `<label class="rz-row rz-chk"><input type="checkbox" id="af-aguarda"><div class="rz-tx"><b>Aguardando confirmação</b><span>Fica tracejada até você aprovar; some se ninguém responder no prazo</span></div></label>` : ''}`;
        }
        raiz.querySelectorAll('#af-campos input, #af-ativo').forEach(i => i.addEventListener('change', checar));
        checar();
    }
    function periodo() {
        const de = $('#af-de')?.value, hi = $('#af-hi')?.value || '09:00';
        if (!de) return null;
        if (st.tipo === 'reserva') { const ate = $('#af-ate')?.value; if (!ate) return null; return { inicio: tz(de, hi), fim: tz(ate, $('#af-hf')?.value || '11:00') }; }
        let hf = $('#af-hf')?.value;
        if (!hf) { const [h, m] = hi.split(':').map(Number); hf = `${String(Math.min(23, h + 1)).padStart(2, '0')}:${String(m).padStart(2, '0')}`; }
        return { inicio: tz(de, hi), fim: tz(de, hf) };
    }
    async function checar() {
        const box = $('#af-conflito'); if (!box) return;
        const p = periodo(), ativo = $('#af-ativo')?.value;
        if (!p || !ativo) { box.innerHTML = ''; return; }
        const meu = ++st.seq;
        try {
            const { data, error } = await dbAuth.rpc('fn_agenda_conflitos', { p_ativo_id: ativo, p_inicio: p.inicio, p_fim: p.fim, p_ignorar: null });
            if (error || meu !== st.seq) return;
            const bloq = data?.bloqueio_uso, mesmo = data?.mesmo_ativo || [];
            const bloqueia = bloq && (st.tipo === 'reserva' || st.tipo === 'reuniao');
            if (!bloqueia && !mesmo.length) { box.innerHTML = '<p class="rz-desc" style="color:var(--success,#2f8b57)">Horário livre neste bem.</p>'; return; }
            const linhas = mesmo.map(x => `<li>${esc(x.titulo || '')} · ${dm(x.inicio)} ${hm(x.inicio)}${x.fim ? '–' + hm(x.fim) : ''}${x.aguardando ? ' (aguardando)' : ''}</li>`).join('');
            box.innerHTML = `<div class="rz-card" style="border-color:var(--warning);background:var(--warning-bg);margin:8px 0 0">
                ${bloqueia ? `<b>Período bloqueado</b><p class="rz-desc">${esc(bloq.uso ? 'Uso do bem: ' + bloq.uso : (bloq.texto || 'Data bloqueada nas regras do bem'))}</p>` : ''}
                ${mesmo.length ? `<b>Já tem algo neste horário no mesmo bem</b><ul style="margin:4px 0 0 16px;font-size:13px">${linhas}</ul>
                <p class="rz-desc">${st.tipo === 'reserva' ? 'Reserva não pode sobrepor.' : 'Dá para marcar mesmo assim; vou pedir confirmação.'}</p>` : ''}</div>`;
        } catch (e) { /* aviso é ajuda, não trava */ }
    }
    async function salvar(el, confirmado) {
        const p = periodo(), ativo = $('#af-ativo')?.value;
        if (!p || !ativo) { toast('Escolha o bem e o período.', 'danger'); return false; }
        const pedido = { tipo: st.tipo, ativo_id: ativo, inicio: p.inicio, fim: p.fim, confirmar_conflito: confirmado };
        if (st.tipo === 'reserva') Object.assign(pedido, { nome: $('#af-nome')?.value || null, whatsapp: $('#af-wa')?.value || null, valor: $('#af-valor')?.value || null });
        else Object.assign(pedido, { titulo: $('#af-titulo')?.value || null, local: $('#af-local')?.value || null, aguardando: !!$('#af-aguarda')?.checked });
        const { data, error } = await dbAuth.rpc('fn_agenda_reservar', { p_cliente_id: CLIENTE_ID_SUPABASE, p_pedido: pedido, p_canal: 'app' });
        if (error) { toast(error.message, 'danger'); return false; }
        if (data && data.ok === false && data.precisa_confirmar) {
            const ok = await perguntar({ titulo: 'Já tem algo neste horário', impacto: 'Este bem já tem compromisso no mesmo horário. Marcar mesmo assim?', rotuloConfirmar: 'Marcar mesmo assim' });
            return ok ? salvar(el, true) : false;
        }
        toast(data?.tipo === 'pedido_reserva' ? 'Pedido de reserva criado, aguardando sua aprovação.' : data?.ja_existia ? 'Já estava na agenda.' : 'Marcado na agenda.', 'success');
        if (typeof pref.aoSalvar === 'function') setTimeout(pref.aoSalvar, 50);
        return true;
    }
    raiz.querySelectorAll('[data-af-tipo]').forEach(b => b.addEventListener('click', () => {
        st.tipo = b.dataset.afTipo;
        raiz.querySelectorAll('[data-af-tipo]').forEach(x => x.classList.toggle('rz-on', x === b));
        campos();
    }));
    campos();
    if (typeof rzIcones === 'function') rzIcones();
}

// r: linha da fn_agenda_periodo_v2 (situacao 'aguardando'; entidade_tipo 'processo' = pré-reserva)
export function abrirDecisaoPedido(r, aoMudar) {
    const ehProcesso = r.entidade_tipo === 'processo';
    const tipo = ehProcesso ? 'processo' : 'ocorrencia';
    const id = ehProcesso ? r.entidade_id : r.ocorrencia_id;
    if (!id) { toast('Não achei o pedido.', 'danger'); return; }
    const quando = r.inicio_em ? `${dm(r.inicio_em)} ${hm(r.inicio_em)}${r.fim_em ? ' – ' + (dm(r.fim_em) !== dm(r.inicio_em) ? dm(r.fim_em) + ' ' : '') + hm(r.fim_em) : ''}` : r.data;
    const decidir = async (decisao, nova) => {
        const { data, error } = await dbAuth.rpc('fn_agenda_pedido_decidir', { p_tipo: tipo, p_id: id, p_decisao: decisao, p_canal: 'app', p_nova: nova || null });
        if (error) { toast(error.message, 'danger'); return false; }
        if (data && data.ok === false) { toast(data.mensagem || 'Não deu certo.', 'danger'); return false; }
        toast(decisao === 'aprovar' ? ((data && data.contrato && data.contrato.mensagem) || 'Aprovado.') : decisao === 'recusar' ? 'Recusado.' : 'Nova data proposta.', 'success'); // v1.2.0
        if (tipo === 'ocorrencia' && dbAuth.functions) dbAuth.functions.invoke('agenda-google', { body: { acao: 'sincronizar', ocorrencia_id: id } })
            .then(({ data }) => { if (data && data.link) toast('Meet criado e enviado ao lead.', 'success'); }).catch(() => {}); // v1.1.0
        if (typeof aoMudar === 'function') setTimeout(aoMudar, 50);
        return true;
    };
    abrirSheetAcoes({ titulo: r.titulo || (ehProcesso ? 'Pedido de reserva' : 'Pedido'), sub: `Aguardando · ${quando}`, acoes: [
        { icone: 'check', titulo: 'Aprovar', sub: ehProcesso ? 'Vira contrato com sinal e saldo' : 'Confirma na agenda', codigo: 'agenda.aprovar',
          aoTocar: () => ehProcesso ? setTimeout(() => abrirConfirmarReserva(r, decidir), 50) : decidir('aprovar') }, // v1.2.0
        { icone: 'calendar-clock', titulo: 'Outra data', sub: 'Propor novo horário', codigo: 'agenda.aprovar', aoTocar: () => setTimeout(() => abrirOutraData(r, decidir), 50) },
        { icone: 'x', titulo: 'Recusar', sub: 'Libera o horário', codigo: 'agenda.aprovar', tipo: 'bad', aoTocar: async () => {
            if (await perguntar({ titulo: 'Recusar pedido', impacto: 'O horário fica livre de novo.', destrutivo: true, rotuloConfirmar: 'Recusar' })) decidir('recusar');
        } },
    ] });
}
// v1.2.0 — recebimento da reserva: padrão do catálogo (50% de sinal hoje, saldo na entrada), ajustável só para esta reserva
function abrirConfirmarReserva(r, decidir) {
    const total = Number(r.valor || 0);
    const entrada = r.inicio_em ? iso(new Date(r.inicio_em)) : (r.data || iso(new Date()));
    const brl = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const sh = abrirSheetForm({ titulo: 'Confirmar reserva', sub: `${r.titulo || 'Reserva'} · total ${brl(total)}`, rotuloSalvar: 'Confirmar',
        corpo: `<p class="rz-desc" style="margin:0 0 10px">Vira contrato com dois recebimentos. O padrão é 50% de sinal agora e o saldo no dia da entrada; mude só se combinou diferente com o hóspede.</p>
                <div class="grid grid-cols-2 gap-2">
                  <div class="rz-f"><label>Sinal (%)</label><input type="number" id="cr-pct" min="0" max="100" step="1" value="50"></div>
                  <div class="rz-f"><label>Sinal vence</label><input type="date" id="cr-v1" value="${iso(new Date())}"></div>
                  <div class="rz-f"><label>Saldo vence</label><input type="date" id="cr-v2" value="${entrada}"></div>
                  <div class="rz-f"><label>Valores</label><p id="cr-res" class="rz-desc" style="margin:6px 0 0"></p></div>
                </div>`,
        aoSalvar: async (el) => decidir('aprovar', { recebimento: { sinal_pct: Number(el.querySelector('#cr-pct').value || 0),
            sinal_vencimento: el.querySelector('#cr-v1').value || null, saldo_vencimento: el.querySelector('#cr-v2').value || null } }) });
    const el = sh && sh.querySelector ? sh : document;
    const at = () => { const pct = Math.min(100, Math.max(0, Number(el.querySelector('#cr-pct')?.value || 0))); const sinal = Math.round(total * pct) / 100;
        const res = el.querySelector('#cr-res'); if (res) res.textContent = `Sinal ${brl(sinal)} · saldo ${brl(total - sinal)}`; };
    el.querySelector('#cr-pct')?.addEventListener('input', at); at();
}
function abrirOutraData(r, decidir) {
    const ini = r.inicio_em ? new Date(r.inicio_em) : new Date(), fim = r.fim_em ? new Date(r.fim_em) : new Date(ini.getTime() + 36e5);
    const hh = (d) => d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    abrirSheetForm({ titulo: 'Outra data', sub: r.titulo || '', rotuloSalvar: 'Propor',
        corpo: `<div class="grid grid-cols-2 gap-2"><div class="rz-f"><label>Início · dia</label><input type="date" id="od-d1" value="${iso(ini)}"></div><div class="rz-f"><label>Hora</label><input type="time" id="od-h1" value="${hh(ini)}"></div>
                <div class="rz-f"><label>Fim · dia</label><input type="date" id="od-d2" value="${iso(fim)}"></div><div class="rz-f"><label>Hora</label><input type="time" id="od-h2" value="${hh(fim)}"></div></div>`,
        aoSalvar: async (el) => decidir('outra_data', { inicio: tz(el.querySelector('#od-d1').value, el.querySelector('#od-h1').value), fim: tz(el.querySelector('#od-d2').value, el.querySelector('#od-h2').value) }) });
}
