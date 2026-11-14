// =====================================================================
// RAIZ PATRIMÔNIO — js/ativo-interessados.js
// Versão: 1.0.0 · 14/11/2026
// -----------------------------------------------------------------
// v1.0.0 (14/11/2026, sessão 20261114-1415-crm-f3-1, demanda 09277cba; FICHA_CRM_AGENDA_OCUPACAO_RAIZ v1.2.0 F3 — de acordo
// do Nicola 12/11 08:40; ida 14/11 14:15) — criação.
//   · Card "Pedidos e interessados" no chip Usos e contratos do bem: pré-reservas aguardando (toque → Aprovar · Outra data ·
//     Recusar, de agenda-form.js) e os interessados do bem com a etapa da esteira (fluxo_etapas), há quanto tempo e o
//     próximo passo. "+ Interessado" registra pelo WhatsApp (fn_interessado_registrar: a mesma pessoa vira uma parte só).
//   · Ficha do interessado (sheet): etapa em chips (opcionais à parte), próximo passo com data, abrir o WhatsApp e as
//     comunicações da pessoa (fn_comunicacoes_pessoa: robô, comunicações, app e esteira). Grava por fn_interessado_mover.
//   · O card aparece no bem com uso de agenda (temporada, short stay, cowork, atendimento) ou que já tenha interessado/pedido.
// =====================================================================
export const VERSAO = '1.0.0';

const MODELOS_AGENDA = ['temporada', 'short_stay', 'cowork', 'atendimento'];
const esc = (s) => (typeof rzEsc === 'function' ? rzEsc(s) : String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])));
const toast = (m, t) => (typeof mostrarToast === 'function' ? mostrarToast(m, t) : alert(m));
const icones = () => { if (typeof refrescarIcones === 'function') refrescarIcones(); else if (window.lucide) window.lucide.createIcons(); };
const dm = (x) => new Date(x).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
const dmh = (x) => new Date(x).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
const dias = (x) => { if (!x) return ''; const n = Math.floor((Date.now() - new Date(x).getTime()) / 864e5); return n <= 0 ? 'hoje' : n === 1 ? 'há 1 dia' : `há ${n} dias`; };
const telVisivel = (t) => { const d = String(t || '').replace(/\D/g, ''); const l = d.startsWith('55') ? d.slice(2) : d; return l.length >= 10 ? `(${l.slice(0, 2)}) ${l.slice(2, -4)}-${l.slice(-4)}` : t || ''; };

let etapasCache = null;
async function etapas() {
    if (etapasCache) return etapasCache;
    const { data } = await dbAuth.from('fluxo_etapas').select('fluxo_codigo, fluxo_nome, etapa_codigo, etapa_nome, ordem, opcional, natureza, prazo_dias').eq('ativo', true).order('ordem');
    etapasCache = data || [];
    return etapasCache;
}

// a: ativo da ficha; usos: linhas de fn_ativo_usos (para saber se o bem usa agenda)
export async function montarCardInteressados(a, usos = []) {
    const usosCard = document.getElementById('fa-card-usos'); if (!usosCard) return;
    let card = document.getElementById('fa-card-interessados');
    const temAgenda = (usos || []).some(u => !u.repouso && MODELOS_AGENDA.includes(u.modelo));
    let lista = [], pedidos = [];
    try {
        const [r1, r2, cat] = await Promise.all([
            dbAuth.from('partes_papeis').select('id, parte_id, fluxo_codigo, etapa_codigo, etapa_desde, proximo_passo, proximo_passo_em, criado_em, dados_origem, partes!inner(id, nome, whatsapp)')
                .eq('papel', 'interessado').eq('entidade_tipo', 'ativo').eq('entidade_id', a.id).eq('ativo', true).order('etapa_desde', { ascending: false, nullsFirst: false }),
            dbAuth.from('processos_contratacao').select('id, interessado_nome, interessado_whatsapp, periodo_inicio, periodo_fim, expira_em, status')
                .eq('ativo_id', a.id).eq('status', 'preenchido').not('periodo_inicio', 'is', null).order('periodo_inicio'),
            etapas(),
        ]);
        if (r1.error) throw r1.error;
        lista = r1.data || []; pedidos = (r2.data || []);
    } catch (e) {
        console.warn('[ativo-interessados] leitura:', e?.message || e);
        card?.remove(); return;
    }
    if (!temAgenda && !lista.length && !pedidos.length) { card?.remove(); return; }
    if (!card) {
        card = document.createElement('div'); card.id = 'fa-card-interessados'; card.className = 'rz-card';
        (document.getElementById('fa-card-calendario') || usosCard).after(card);
    }
    const cat = etapasCache || [];
    const nomeEtapa = (f, e) => (cat.find(x => x.fluxo_codigo === f && x.etapa_codigo === e) || {}).etapa_nome || '';
    const natureza = (f, e) => (cat.find(x => x.fluxo_codigo === f && x.etapa_codigo === e) || {}).natureza || 'aberta';
    const abertos = lista.filter(i => !['ganho', 'perdido'].includes(natureza(i.fluxo_codigo, i.etapa_codigo)) || !i.etapa_codigo);
    const fechados = lista.filter(i => !abertos.includes(i));
    const linhaPedido = (p, k) => `<button type="button" class="rz-row rz-link" data-int-ped="${k}">
            <div class="rz-ic"><i data-lucide="hourglass"></i></div>
            <div class="rz-tx"><b>${esc(p.interessado_nome || 'Pedido de reserva')}</b><span>${dm(p.periodo_inicio)} a ${dm(p.periodo_fim)} · aguardando até ${dmh(p.expira_em)}</span></div>
            <i data-lucide="chevron-right" class="rz-chev"></i></button>`;
    const linhaInt = (i) => {
        const et = nomeEtapa(i.fluxo_codigo, i.etapa_codigo);
        const sub = [et ? `${et} ${dias(i.etapa_desde)}` : `Desde ${dm(i.criado_em)}`, i.proximo_passo ? `→ ${i.proximo_passo}${i.proximo_passo_em ? ' (' + dm(i.proximo_passo_em + 'T12:00') + ')' : ''}` : ''].filter(Boolean).join(' · ');
        return `<button type="button" class="rz-row rz-link" data-int-id="${i.id}">
            <div class="rz-ic"><i data-lucide="user-round"></i></div>
            <div class="rz-tx"><b>${esc(i.partes?.nome || 'Interessado')}</b><span>${esc(sub)}</span></div>
            <i data-lucide="chevron-right" class="rz-chev"></i></button>`;
    };
    card.innerHTML = `<div class="rz-card-h"><h3>Pedidos e interessados</h3><button type="button" class="rz-ico-btn" data-int-novo aria-label="Novo interessado"><i data-lucide="user-plus"></i></button></div>
        ${pedidos.length ? `<div class="rz-group">Pedidos aguardando<span>${pedidos.length}</span></div><div class="rz-list">${pedidos.map(linhaPedido).join('')}</div>` : ''}
        <div class="rz-group"${pedidos.length ? ' style="margin-top:10px"' : ''}>Interessados<span>${abertos.length || '—'}</span></div>
        ${abertos.length ? `<div class="rz-list">${abertos.map(linhaInt).join('')}</div>` : '<p class="rz-desc" style="margin:4px 0 0">Nenhum interessado em andamento.</p>'}
        ${fechados.length ? `<details style="margin-top:8px"><summary class="rz-desc">Concluídos e perdidos (${fechados.length})</summary><div class="rz-list">${fechados.map(linhaInt).join('')}</div></details>` : ''}`;
    const recarregar = () => montarCardInteressados(a, usos);
    card.querySelector('[data-int-novo]').addEventListener('click', () => abrirNovoInteressado(a, recarregar));
    card.querySelectorAll('[data-int-id]').forEach(b => b.addEventListener('click', () => abrirFichaInteressado(a, lista.find(i => i.id === b.dataset.intId), recarregar)));
    card.querySelectorAll('[data-int-ped]').forEach(b => b.addEventListener('click', async () => {
        const p = pedidos[Number(b.dataset.intPed)];
        const m = await import('./agenda-form.js');
        m.abrirDecisaoPedido({ entidade_tipo: 'processo', entidade_id: p.id, titulo: p.interessado_nome || 'Pedido de reserva', inicio_em: p.periodo_inicio, fim_em: p.periodo_fim }, recarregar);
    }));
    icones();
}

function abrirNovoInteressado(a, aoMudar) {
    abrirSheetForm({
        titulo: 'Novo interessado', sub: a.nome_exibicao, rotuloSalvar: 'Registrar',
        corpo: `<div class="rz-f"><label for="ai-nome">Nome</label><input type="text" id="ai-nome" maxlength="160" placeholder="Como a pessoa se chama"></div>
            <div class="rz-f"><label for="ai-wa">WhatsApp</label><input type="tel" id="ai-wa" placeholder="(11) 9…"></div>
            <div class="rz-f" style="margin-bottom:0"><label for="ai-orig">De onde veio</label><input type="text" id="ai-orig" maxlength="60" placeholder="Ex.: indicação, Instagram, placa"></div>`,
        aoSalvar: async () => {
            const nome = (document.getElementById('ai-nome')?.value || '').trim();
            const wa = (document.getElementById('ai-wa')?.value || '').replace(/\D/g, '');
            if (wa.length < 10) { toast('Informe o WhatsApp com DDD.', 'erro'); return false; }
            const { data, error } = await dbAuth.rpc('fn_interessado_registrar', { p_cliente_id: a.cliente_id || CLIENTE_ID_SUPABASE, p_ativo_id: a.id, p_whatsapp: wa, p_nome: nome || null,
                p_origem: (document.getElementById('ai-orig')?.value || '').trim() || 'manual', p_canal: 'app' });
            if (error) { toast(error.message || 'Não consegui registrar.', 'erro'); return false; }
            toast(data?.novo ? 'Interessado registrado.' : 'Essa pessoa já está nos interessados deste bem.', 'sucesso');
            aoMudar && aoMudar();
            return true;
        },
    });
}

async function abrirFichaInteressado(a, i, aoMudar) {
    if (!i) return;
    const cat = (await etapas()).filter(x => x.fluxo_codigo === i.fluxo_codigo);
    const st = { etapa: i.etapa_codigo };
    const chip = (e) => `<button type="button" class="rz-chip${e.etapa_codigo === st.etapa ? ' rz-on' : ''}" data-ai-et="${e.etapa_codigo}">${esc(e.etapa_nome)}</button>`;
    const wa = String(i.partes?.whatsapp || '').replace(/\D/g, '');
    const corpo = `
        ${wa ? `<p class="rz-desc" style="margin:0 0 8px"><a href="https://wa.me/${wa}" target="_blank" rel="noopener">${esc(telVisivel(wa))} · abrir o WhatsApp</a></p>` : ''}
        ${cat.length ? `<div class="rz-group">Etapa${cat[0] ? ' · ' + esc(cat[0].fluxo_nome) : ''}<span></span></div>
        <div class="rz-chips" id="ai-etapas" style="margin:0 0 4px">${cat.filter(e => !e.opcional).map(chip).join('')}</div>
        ${cat.some(e => e.opcional) ? `<div class="rz-chips" style="margin:0 0 10px"><span class="rz-desc" style="align-self:center;margin-right:4px">Opcional:</span>${cat.filter(e => e.opcional).map(chip).join('')}</div>` : ''}`
        : '<p class="rz-desc">Este interessado não está numa esteira (o bem não tem uso de temporada, cowork ou atendimento).</p>'}
        <div class="rz-f"><label for="ai-pp">Próximo passo</label><input type="text" id="ai-pp" maxlength="160" value="${esc(i.proximo_passo || '')}" placeholder="Ex.: mandar proposta"></div>
        <div class="rz-f"><label for="ai-em">Até quando</label><input type="date" id="ai-em" value="${esc(i.proximo_passo_em || '')}"></div>
        <div class="rz-group" style="margin-top:6px">Comunicações<span></span></div>
        <div id="ai-com"><p class="rz-desc">Carregando…</p></div>`;
    const sheet = abrirSheetForm({
        titulo: i.partes?.nome || 'Interessado', sub: a.nome_exibicao, corpo, rotuloSalvar: 'Salvar',
        aoSalvar: async () => {
            if (!i.fluxo_codigo) { return true; }
            const pp = (raiz.querySelector('#ai-pp')?.value || '').trim();
            const em = raiz.querySelector('#ai-em')?.value || null;
            const { data, error } = await dbAuth.rpc('fn_interessado_mover', { p_papel_id: i.id, p_etapa: st.etapa !== i.etapa_codigo ? st.etapa : null,
                p_proximo_passo: pp, p_em: pp ? em : null, p_canal: 'app' });
            if (error || !data?.ok) { toast(error?.message || data?.mensagem || 'Não consegui salvar.', 'erro'); return false; }
            toast(data.mudou ? 'Etapa atualizada.' : 'Salvo.', 'sucesso');
            aoMudar && aoMudar();
            return true;
        },
    });
    const raiz = sheet || document;
    raiz.querySelectorAll('[data-ai-et]').forEach(b => b.addEventListener('click', () => {
        st.etapa = b.dataset.aiEt;
        raiz.querySelectorAll('[data-ai-et]').forEach(x => x.classList.toggle('rz-on', x.dataset.aiEt === st.etapa));
    }));
    icones();
    const { data, error } = await dbAuth.rpc('fn_comunicacoes_pessoa', { p_cliente_id: a.cliente_id || CLIENTE_ID_SUPABASE, p_parte_id: i.parte_id, p_whatsapp: null, p_limite: 30 });
    const el = raiz.querySelector('#ai-com'); if (!el) return;
    if (error) { el.innerHTML = '<p class="rz-desc">Não consegui ler as comunicações agora.</p>'; return; }
    const ic = { robo: 'bot', comunicacao: 'megaphone', app: 'smartphone', esteira: 'route' };
    el.innerHTML = (data || []).length ? `<div class="rz-list">${data.map(c => `<div class="rz-row"><div class="rz-ic"><i data-lucide="${ic[c.fonte] || 'message-circle'}"></i></div>
            <div class="rz-tx"><b>${esc(c.titulo || c.fonte)}</b><span>${esc(dmh(c.quando))}${c.texto ? ' · ' + esc(c.texto) : ''}</span></div></div>`).join('')}</div>`
        : '<p class="rz-desc">Nenhuma comunicação registrada com esse número.</p>';
    icones();
}
