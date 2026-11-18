// =====================================================================
// RAIZ PATRIMÔNIO — js/ativo-interessados.js
// Versão: 1.5.0 · 17/11/2026
// -----------------------------------------------------------------
// v1.5.0 (17/11/2026, sessão 20261117-1700-comercial-r5, demanda 285a0058; FICHA_RECEITA_UNIDADES_GERADORAS v1.12.0 §13.7) — interessado
//   da esteira Venda movido para "Pedido" abre o Novo pedido com o comprador (js/comercial-pedidos.js); "Marcar como perdido" usa a
//   etapa de perda da esteira de cada um (Cancelado na Venda, Perdido na licença, Cancelada na temporada…); cabeçalhos de grupo com o
//   contador à direita (rz-group-t), sem "Pedidos aguardando1" colado. Versão anterior: 1.4.0
// v1.4.0 (17/11/2026, sessão 20261117-1535-comercial-c4, demanda 285a0058; FICHA_RECEITA_UNIDADES_GERADORAS v1.12.0 §13.7 — Nicola
//   16/11 20:12 e 21:31) — "Leads" vira "Interessados" no card, na tela e no ⋮; o card aparece também no ativo com tabela de
//   venda ativa (Raiz Comercial), onde o interessado entra na esteira Venda: Cotação · Pedido · Cancelado (fn_interessado_registrar v3).
//   Versão anterior: 1.3.1
// v1.3.1 (15/11/2026, sessão 20261115-1805-licencas-l2, demanda 954b4cca — ajustes do Nicola, 18:00) — ⋮ dos leads:
//   "Novo interessado" sem o "Pelo WhatsApp" e o formulário aceita só o nome (WhatsApp opcional, como a
//   fn_interessado_registrar já permite); sai "Ver todos" (o chip Todos já faz isso); entram os atalhos de configuração —
//   Dados da empresa (validade dos pedidos e dados do recebedor) e Disponibilidade e reservas de cada uso de agenda do bem.
//   Versão anterior: 1.3.0
// v1.3.0 (15/11/2026, sessão 20261115-1735-licencas-leads, demanda 954b4cca; FICHA_LICENCAS_LEADS_RAIZ v1.3.0 L1 — de acordo
//   do Nicola 15/11 17:34) — o card deixa de listar os interessados corridos: vira o card "Leads" com o RESUMO por etapa
//   (quantidade em cada uma e quantos próximos passos vencem em 7 dias); pedidos de reserva aguardando seguem como linhas.
//   Tocar no resumo abre a tela "Leads e interessados" (sheet): ⋮ padrão no topo (Novo interessado, Ver todos, O que é cada
//   etapa), busca, chips por etapa com contagem, lista agrupada por etapa na largura toda e ⋮ em cada lead (abrir, propor
//   reunião, WhatsApp, marcar como perdido). A lista vem da fn_leads_listar (regra no banco); a ficha do interessado abre
//   por cima (empilhar) e, ao salvar, tela e card se atualizam. Versão anterior: 1.2.0
// v1.2.0 (14/11/2026, sessão 20261114-1910-crm-reuniao-1; FICHA_REUNIAO_LEAD_GOOGLE_MEET_RAIZ v1.0.2) — lead da Raiz (Venda de
//   licença) com WhatsApp ganha "Propor reunião" na ficha: até 3 faixas de dias, duração, prévia dos horários e envio do convite
//   (Edge agenda-google, só master). Preferências, adoção e dores ficam na ficha do Gestão › Leads. Versão anterior: 1.1.0
// v1.1.0 (14/11/2026, sessão 20261114-1710-crm-f3-3; FICHA_LEADS_AJUSTES_RAIZ v1.0.0 A3) — na ficha do interessado, o
//   significado da etapa escolhida (fluxo_etapas.descricao) aparece embaixo dos chips e muda junto com a escolha.
//   Versão anterior: 1.0.0
// v1.0.0 (14/11/2026, sessão 20261114-1415-crm-f3-1, demanda 09277cba; FICHA_CRM_AGENDA_OCUPACAO_RAIZ v1.2.0 F3 — de acordo
// do Nicola 12/11 08:40; ida 14/11 14:15) — criação.
//   · Card "Pedidos e interessados" no chip Usos e contratos do bem: pré-reservas aguardando (toque → Aprovar · Outra data ·
//     Recusar, de agenda-form.js) e os interessados do bem com a etapa da esteira (fluxo_etapas), há quanto tempo e o
//     próximo passo. "+ Interessado" registra pelo WhatsApp (fn_interessado_registrar: a mesma pessoa vira uma parte só).
//   · Ficha do interessado (sheet): etapa em chips (opcionais à parte), próximo passo com data, abrir o WhatsApp e as
//     comunicações da pessoa (fn_comunicacoes_pessoa: robô, comunicações, app e esteira). Grava por fn_interessado_mover.
//   · O card aparece no bem com uso de agenda (temporada, short stay, cowork, atendimento) ou que já tenha interessado/pedido.
// =====================================================================
export const VERSAO = '1.5.0';

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
    const { data } = await dbAuth.from('fluxo_etapas').select('fluxo_codigo, fluxo_nome, etapa_codigo, etapa_nome, ordem, opcional, natureza, prazo_dias, descricao').eq('ativo', true).order('ordem');
    etapasCache = data || [];
    return etapasCache;
}

// v1.3.0 — item da fn_leads_listar no formato que a ficha do interessado já usa
const paraLinha = (it) => ({ ...it, partes: { id: it.parte_id, nome: it.nome, whatsapp: it.whatsapp } });

// a: ativo da ficha; usos: linhas de fn_ativo_usos (para saber se o bem usa agenda)
export async function montarCardInteressados(a, usos = []) {
    const usosCard = document.getElementById('fa-card-usos'); if (!usosCard) return;
    let card = document.getElementById('fa-card-interessados');
    const temAgenda = (usos || []).some(u => !u.repouso && MODELOS_AGENDA.includes(u.modelo));
    let lista = [], pedidos = [], resumo = null;
    try {
        const [r1, r2, cat] = await Promise.all([
            dbAuth.rpc('fn_leads_listar', { p_cliente_id: a.cliente_id || CLIENTE_ID_SUPABASE, p_ativo_id: a.id, p_etapa: 'todos' }), // v1.3.0
            dbAuth.from('processos_contratacao').select('id, interessado_nome, interessado_whatsapp, periodo_inicio, periodo_fim, expira_em, status')
                .eq('ativo_id', a.id).eq('status', 'preenchido').not('periodo_inicio', 'is', null).order('periodo_inicio'),
            etapas(),
        ]);
        if (r1.error) throw r1.error;
        resumo = r1.data || {}; lista = (resumo.itens || []).map(paraLinha); pedidos = (r2.data || []);
    } catch (e) {
        console.warn('[ativo-interessados] leitura:', e?.message || e);
        card?.remove(); return;
    }
    // v1.4.0 — ativo com tabela de venda ativa (Raiz Comercial) também tem card: a esteira é Venda (Cotação · Pedido · Cancelado)
    let temVenda = false;
    if (!temAgenda && !lista.length && !pedidos.length && typeof window.podeUsar === 'function' && window.podeUsar('comercial.precos').ok) {
        try {
            const hoje = new Date().toISOString().slice(0, 10);
            const { data: vs } = await dbAuth.from('vinculos').select('vigencia_ate').eq('origem_tipo', 'catalogo_tabela').eq('papel', 'vende').eq('ativo_id', a.id);
            temVenda = (vs || []).some(v => !v.vigencia_ate || v.vigencia_ate >= hoje);
        } catch (e) { temVenda = false; }
    }
    if (!temAgenda && !temVenda && !lista.length && !pedidos.length) { card?.remove(); return; }
    if (!card) {
        card = document.createElement('div'); card.id = 'fa-card-interessados'; card.className = 'rz-card';
        (document.getElementById('fa-card-calendario') || usosCard).after(card);
    }
    const linhaPedido = (p, k) => `<button type="button" class="rz-row rz-link" data-int-ped="${k}">
            <div class="rz-ic"><i data-lucide="hourglass"></i></div>
            <div class="rz-tx"><b>${esc(p.interessado_nome || 'Pedido de reserva')}</b><span>${dm(p.periodo_inicio)} a ${dm(p.periodo_fim)} · aguardando até ${dmh(p.expira_em)}</span></div>
            <i data-lucide="chevron-right" class="rz-chev"></i></button>`;
    // v1.3.0 — resumo por etapa (sem os vazios); perdidos e concluídos contam, mas por último
    const etapasRes = (resumo.resumo || []).filter(e => e.qtd > 0);
    const sub = [`${resumo.ativos || 0} ${resumo.ativos === 1 ? 'ativo' : 'ativos'}`, resumo.passos_semana ? `${resumo.passos_semana} ${resumo.passos_semana === 1 ? 'passo' : 'passos'} esta semana` : ''].filter(Boolean).join(' · ');
    card.className = 'rz-card';
    card.innerHTML = `<div class="rz-card-h"><h3>Interessados</h3><span class="rz-sub">${esc(sub)}</span><button type="button" class="rz-more" data-int-mais aria-label="Ações dos interessados"><i data-lucide="ellipsis-vertical"></i></button></div>
        ${etapasRes.length ? `<div class="rz-kpis" style="margin:0" role="button" data-int-abrir aria-label="Ver os interessados">${etapasRes.map(e => `<div class="rz-kpi"${['ganho', 'perdido'].includes(e.natureza) ? ' style="opacity:.6"' : ''}><small>${esc(e.nome || 'Sem etapa')}</small><b>${e.qtd}</b></div>`).join('')}</div>`
            : '<p class="rz-desc" style="margin:4px 0 0">Nenhum interessado ainda.</p>'}
        ${pedidos.length ? `<div class="rz-group rz-group-t" style="margin-top:10px"><span>Pedidos aguardando</span><b>${pedidos.length}</b></div><div class="rz-list">${pedidos.map(linhaPedido).join('')}</div>` : ''}`;
    const recarregar = () => montarCardInteressados(a, usos);
    card.querySelector('[data-int-abrir]')?.addEventListener('click', () => abrirTelaLeads(a, recarregar));
    tela.usos = usos; // v1.3.1 — atalhos de configuração do ⋮
    card.querySelector('[data-int-mais]').addEventListener('click', () => acoesTelaLeads(a, recarregar, false, usos));
    card.querySelectorAll('[data-int-ped]').forEach(b => b.addEventListener('click', async () => {
        const p = pedidos[Number(b.dataset.intPed)];
        const m = await import('./agenda-form.js');
        m.abrirDecisaoPedido({ entidade_tipo: 'processo', entidade_id: p.id, titulo: p.interessado_nome || 'Pedido de reserva', inicio_em: p.periodo_inicio, fim_em: p.periodo_fim }, recarregar);
    }));
    icones();
}

function abrirNovoInteressado(a, aoMudar, empilhar = false) {
    abrirSheetForm({ empilhar,
        titulo: 'Novo interessado', sub: a.nome_exibicao, rotuloSalvar: 'Registrar',
        corpo: `<div class="rz-f"><label for="ai-nome">Nome</label><input type="text" id="ai-nome" maxlength="160" placeholder="Como a pessoa se chama"></div>
            <div class="rz-f"><label for="ai-wa">WhatsApp <span class="rz-desc">(opcional)</span></label><input type="tel" id="ai-wa" placeholder="(11) 9…"></div>
            <div class="rz-f" style="margin-bottom:0"><label for="ai-orig">De onde veio</label><input type="text" id="ai-orig" maxlength="60" placeholder="Ex.: indicação, Instagram, placa"></div>`,
        aoSalvar: async () => {
            const nome = (document.getElementById('ai-nome')?.value || '').trim();
            const wa = (document.getElementById('ai-wa')?.value || '').replace(/\D/g, '');
            if (!nome && wa.length < 10) { toast('Informe o nome (ou o WhatsApp com DDD).', 'erro'); return false; } // v1.3.1
            if (wa && wa.length < 10) { toast('O WhatsApp precisa do DDD.', 'erro'); return false; }
            const { data, error } = await dbAuth.rpc('fn_interessado_registrar', { p_cliente_id: a.cliente_id || CLIENTE_ID_SUPABASE, p_ativo_id: a.id, p_whatsapp: wa || null, p_nome: nome || null,
                p_origem: (document.getElementById('ai-orig')?.value || '').trim() || 'manual', p_canal: 'app' });
            if (error) { toast(error.message || 'Não consegui registrar.', 'erro'); return false; }
            toast(data?.novo ? 'Interessado registrado.' : 'Essa pessoa já está nos interessados deste bem.', 'sucesso');
            aoMudar && aoMudar();
            return true;
        },
    });
}

async function abrirFichaInteressado(a, i, aoMudar, empilhar = false) {
    if (!i) return;
    const cat = (await etapas()).filter(x => x.fluxo_codigo === i.fluxo_codigo);
    const st = { etapa: i.etapa_codigo };
    const chip = (e) => `<button type="button" class="rz-chip${e.etapa_codigo === st.etapa ? ' rz-on' : ''}" data-ai-et="${e.etapa_codigo}">${esc(e.etapa_nome)}</button>`;
    const wa = String(i.partes?.whatsapp || '').replace(/\D/g, '');
    const corpo = `
        ${wa ? `<p class="rz-desc" style="margin:0 0 8px"><a href="https://wa.me/${wa}" target="_blank" rel="noopener">${esc(telVisivel(wa))} · abrir o WhatsApp</a></p>` : ''}
        ${wa && i.fluxo_codigo === 'venda_licenca' ? '<button type="button" class="rz-btn rz-btn-2 rz-sm" id="ai-propor" style="margin:0 0 10px"><i data-lucide="video"></i> Propor reunião</button>' : ''}
        ${cat.length ? `<div class="rz-group">Etapa${cat[0] ? ' · ' + esc(cat[0].fluxo_nome) : ''}</div>
        <div class="rz-chips" id="ai-etapas" style="margin:0 0 4px">${cat.filter(e => !e.opcional).map(chip).join('')}</div>
        ${cat.some(e => e.opcional) ? `<div class="rz-chips" style="margin:0 0 4px"><span class="rz-desc" style="align-self:center;margin-right:4px">Opcional:</span>${cat.filter(e => e.opcional).map(chip).join('')}</div>` : ''}
        <p class="rz-desc" id="ai-et-desc" style="margin:0 0 10px">${esc((cat.find(e => e.etapa_codigo === st.etapa) || {}).descricao || '')}</p>`
        : '<p class="rz-desc">Este interessado não está numa esteira (o bem não tem uso de temporada, cowork ou atendimento, nem tabela de venda ativa).</p>'}
        <div class="rz-f"><label for="ai-pp">Próximo passo</label><input type="text" id="ai-pp" maxlength="160" value="${esc(i.proximo_passo || '')}" placeholder="Ex.: mandar proposta"></div>
        <div class="rz-f"><label for="ai-em">Até quando</label><input type="date" id="ai-em" value="${esc(i.proximo_passo_em || '')}"></div>
        <div class="rz-group" style="margin-top:6px">Comunicações<span></span></div>
        <div id="ai-com"><p class="rz-desc">Carregando…</p></div>`;
    const sheet = abrirSheetForm({
        titulo: i.partes?.nome || 'Interessado', sub: a.nome_exibicao, corpo, rotuloSalvar: 'Salvar', empilhar,
        aoSalvar: async () => {
            if (!i.fluxo_codigo) { return true; }
            const pp = (raiz.querySelector('#ai-pp')?.value || '').trim();
            const em = raiz.querySelector('#ai-em')?.value || null;
            const { data, error } = await dbAuth.rpc('fn_interessado_mover', { p_papel_id: i.id, p_etapa: st.etapa !== i.etapa_codigo ? st.etapa : null,
                p_proximo_passo: pp, p_em: pp ? em : null, p_canal: 'app' });
            if (error || !data?.ok) { toast(error?.message || data?.mensagem || 'Não consegui salvar.', 'erro'); return false; }
            toast(data.mudou ? 'Etapa atualizada.' : 'Salvo.', 'sucesso');
            aoMudar && aoMudar();
            // v1.5.0 — virou pedido (esteira Venda): abre o Novo pedido com o comprador
            if (data.mudou && i.fluxo_codigo === 'venda' && st.etapa === 'pedido' && i.parte_id) {
                setTimeout(() => import('./comercial-pedidos.js').then(m => m.abrirNovoPedido(a, { parteId: i.parte_id })), 150);
            }
            return true;
        },
    });
    const raiz = sheet || document;
    raiz.querySelector('#ai-propor')?.addEventListener('click', () => setTimeout(() => abrirProporReuniao(a, i), 50)); // v1.2.0
    raiz.querySelectorAll('[data-ai-et]').forEach(b => b.addEventListener('click', () => {
        st.etapa = b.dataset.aiEt;
        raiz.querySelectorAll('[data-ai-et]').forEach(x => x.classList.toggle('rz-on', x.dataset.aiEt === st.etapa));
        const d = raiz.querySelector('#ai-et-desc'); if (d) d.textContent = (cat.find(e => e.etapa_codigo === st.etapa) || {}).descricao || '';
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

// =====================================================================
// v1.3.0 — Tela "Leads e interessados" (sheet que abre cheio): ⋮ padrão no topo, busca, chips por etapa, grupos e ⋮ por lead.
// =====================================================================
const tela = { etapa: null, busca: '', usos: [] };
const MODELOS_AGENDA_CFG = ['temporada', 'short_stay', 'cowork', 'atendimento']; // iguais a ativo-disponibilidade.js
function acoesTelaLeads(a, aoMudar, empilhar = true, usos = tela.usos || []) {
    const agenda = (usos || []).filter(u => !u.repouso && MODELOS_AGENDA_CFG.includes(u.modelo) && u.uso_id);
    const config = [
        ...agenda.map(u => ({ icone: 'calendar-cog', titulo: 'Disponibilidade e reservas', sub: u.nome || u.modelo, codigo: 'ativo.disponibilidade',
            aoTocar: () => import('./ativo-disponibilidade.js').then(m => m.abrirDisponibilidadeUso({ usoId: u.uso_id, modelo: u.modelo, nomeUso: u.nome, nomeBem: a.nome_exibicao })) })),
        { icone: 'building', titulo: 'Dados da empresa', sub: 'Validade dos pedidos e dados do recebedor', aoTocar: () => { fecharSheet(); if (typeof switchTab === 'function') switchTab('tab-minha-empresa'); } },
    ];
    abrirSheetAcoes({ titulo: 'Interessados', sub: a.nome_exibicao, empilhar, grupos: [
        { titulo: 'Interessados', acoes: [
            { icone: 'user-plus', titulo: 'Novo interessado', sub: 'Só o nome já basta', aoTocar: () => setTimeout(() => abrirNovoInteressado(a, aoMudar, empilhar), 50) },
            { icone: 'info', titulo: 'O que é cada etapa', aoTocar: () => setTimeout(() => explicarEtapas(empilhar), 50) } ] },
        { titulo: 'Configurações', acoes: config },
    ] });
}
async function explicarEtapas(empilhar) {
    const cat = (await etapas()).filter(e => e.fluxo_codigo === 'venda_licenca' || !e.fluxo_codigo);
    const lista = cat.length ? cat : await etapas();
    abrirSheet(rzSheetCabecalho('Etapas da esteira', lista[0]?.fluxo_nome || '') + `<div class="rz-sh-b"><div class="rz-card rz-list">${lista.map(e =>
        `<div class="rz-row"><div class="rz-tx"><b>${esc(e.etapa_nome)}${e.opcional ? ' <span class="rz-st rz-neu">opcional</span>' : ''}</b><span>${esc(e.descricao || '')}</span></div></div>`).join('')}</div></div>`, { empilhar });
}
export async function abrirTelaLeads(a, aoMudarCard) {
    const sheet = abrirSheet(`<div class="rz-sh-h"><div style="flex:1;min-width:0"><h3>Interessados</h3><span class="rz-sub">${esc(a.nome_exibicao || '')}</span></div>
        <button type="button" class="rz-more" data-tl-mais aria-label="Ações"><i data-lucide="ellipsis-vertical"></i></button>
        <button type="button" class="rz-x" onclick="fecharSheet()" aria-label="Fechar"><i data-lucide="x"></i></button></div>
        <div class="rz-sh-b"><div class="rz-f" style="margin-bottom:8px"><input type="search" data-tl-busca placeholder="Buscar nome ou empresa" value="${esc(tela.busca)}" aria-label="Buscar interessado"></div>
        <div class="rz-chips" data-tl-chips></div><div data-tl-lista>${typeof rzSk === 'function' ? rzSk('linhas', 4) : ''}</div></div>`);
    const aoMudar = () => { carregar(); aoMudarCard && aoMudarCard(); };
    sheet.querySelector('[data-tl-mais]').addEventListener('click', () => acoesTelaLeads(a, aoMudar, true));
    let espera = null;
    sheet.querySelector('[data-tl-busca]').addEventListener('input', (ev) => { tela.busca = ev.target.value; clearTimeout(espera); espera = setTimeout(carregar, 250); });
    async function carregar() {
        const { data, error } = await dbAuth.rpc('fn_leads_listar', { p_cliente_id: a.cliente_id || CLIENTE_ID_SUPABASE, p_ativo_id: a.id, p_etapa: tela.etapa, p_busca: tela.busca || null });
        const el = sheet.querySelector('[data-tl-lista]'); if (!el) return;
        if (error) { el.innerHTML = '<p class="rz-desc">Não consegui ler os interessados agora.</p>'; return; }
        const res = (data?.resumo || []).filter(e => e.qtd > 0);
        const chip = (cod, rot, n) => `<button type="button" class="rz-chip${tela.etapa === cod ? ' rz-on' : ''}" data-tl-et="${cod ?? ''}">${esc(rot)} <span class="rz-n">${n}</span></button>`;
        sheet.querySelector('[data-tl-chips]').innerHTML = chip(null, 'Ativos', data?.ativos || 0) + res.map(e => chip(e.etapa, e.nome || 'Sem etapa', e.qtd)).join('') + chip('todos', 'Todos', data?.total || 0);
        sheet.querySelectorAll('[data-tl-et]').forEach(b => b.addEventListener('click', () => { tela.etapa = b.dataset.tlEt || null; carregar(); }));
        const itens = (data?.itens || []).map(paraLinha);
        const grupos = [];
        itens.forEach(i => { let g = grupos.find(x => x.cod === i.etapa_codigo); if (!g) grupos.push(g = { cod: i.etapa_codigo, nome: i.etapa_nome || 'Sem etapa', itens: [] }); g.itens.push(i); });
        el.innerHTML = grupos.length ? grupos.map(g => `<div class="rz-group rz-group-t"><span>${esc(g.nome)}</span><b>${g.itens.length}</b></div><div class="rz-card rz-list">${g.itens.map(i => {
            const sub = [i.empresa, i.proximo_passo ? `→ ${i.proximo_passo}${i.proximo_passo_em ? ' (' + dm(i.proximo_passo_em + 'T12:00') + ')' : ''}` : (i.etapa_desde ? `Na etapa ${dias(i.etapa_desde)}` : '')].filter(Boolean).join(' · ');
            return `<div class="rz-row rz-link" role="button" tabindex="0" data-tl-id="${i.id}">
                <div class="rz-ic"><i data-lucide="${i.etapa_codigo === 'em_teste' ? 'badge-check' : 'user-round'}"></i></div>
                <div class="rz-tx"><b>${esc(i.nome || 'Interessado')}</b><span>${esc(sub || 'Sem próximo passo')}</span></div>
                ${i.passo_semana ? '<div class="rz-rt"><span class="rz-st rz-warn">Esta semana</span></div>' : ''}
                <button type="button" class="rz-more" data-tl-acoes="${i.id}" aria-label="Ações do interessado"><i data-lucide="ellipsis-vertical"></i></button></div>`;
        }).join('')}</div>`).join('') : '<p class="rz-desc">Nenhum interessado com esse filtro.</p>';
        const achar = (id) => itens.find(x => x.id === id);
        el.querySelectorAll('[data-tl-id]').forEach(r => r.addEventListener('click', (ev) => {
            if (ev.target.closest('[data-tl-acoes]')) return;
            abrirFichaInteressado(a, achar(r.dataset.tlId), aoMudar, true);
        }));
        el.querySelectorAll('[data-tl-acoes]').forEach(b => b.addEventListener('click', (ev) => { ev.stopPropagation(); acoesLead(a, achar(b.dataset.tlAcoes), aoMudar); }));
        icones();
    }
    icones();
    await carregar();
}
function acoesLead(a, i, aoMudar) {
    if (!i) return;
    const wa = String(i.whatsapp || '').replace(/\D/g, '');
    const acoes = [
        { icone: 'pencil', titulo: 'Etapa e próximo passo', sub: i.etapa_nome || '', aoTocar: () => setTimeout(() => abrirFichaInteressado(a, i, aoMudar, true), 50) },
        ...(wa && i.fluxo_codigo === 'venda_licenca' ? [{ icone: 'video', titulo: 'Propor reunião', sub: 'Até 3 faixas, link próprio', aoTocar: () => setTimeout(() => abrirProporReuniao(a, i), 50) }] : []),
        ...(wa ? [{ icone: 'message-circle', titulo: 'Abrir o WhatsApp', sub: telVisivel(wa), aoTocar: () => window.open('https://wa.me/' + wa, '_blank', 'noopener') }] : []),
        ...(i.natureza !== 'perdido' && i.fluxo_codigo ? [{ icone: 'circle-x', tipo: 'bad', titulo: i.fluxo_codigo === 'venda' ? 'Marcar como cancelado' : 'Marcar como perdido', aoTocar: async () => {
            const perda = (await etapas()).find(e => e.fluxo_codigo === i.fluxo_codigo && e.natureza === 'perdido'); // v1.5.0 — etapa de perda da esteira
            const { data, error } = await dbAuth.rpc('fn_interessado_mover', { p_papel_id: i.id, p_etapa: perda?.etapa_codigo || 'perdido', p_proximo_passo: null, p_em: null, p_canal: 'app' });
            if (error || !data?.ok) { toast(error?.message || data?.mensagem || 'Não consegui mudar a etapa.', 'erro'); return; }
            toast(`Marcado como ${(perda?.etapa_nome || 'perdido').toLowerCase()}.`, 'sucesso'); aoMudar && aoMudar();
        } }] : []),
    ];
    abrirSheetAcoes({ titulo: i.nome || 'Interessado', sub: [i.etapa_nome, i.empresa].filter(Boolean).join(' · '), acoes, empilhar: true });
}

// v1.2.0 — Propor reunião (lead da Raiz): faixas de dias + duração → prévia → convite pelo WhatsApp (Edge agenda-google)
async function edgeAgenda(body) {
    const { data, error } = await dbAuth.functions.invoke('agenda-google', { body });
    if (error) { let m = error.message; try { const j = await error.context.json(); m = j.mensagem || m; } catch (_) { /* sem corpo */ } return { ok: false, mensagem: m }; }
    return data || { ok: false, mensagem: 'Sem resposta.' };
}
function abrirProporReuniao(a, i) {
    const faixa = (k) => `<div class="grid grid-cols-2 gap-2"><div class="rz-f"><label>Faixa ${k} · de</label><input type="date" id="pr-de${k}"></div><div class="rz-f"><label>até</label><input type="date" id="pr-ate${k}"></div></div>`;
    let raiz = document;
    const ler = () => ({
        faixas: [1, 2, 3].map(k => ({ de: raiz.querySelector('#pr-de' + k)?.value, ate: raiz.querySelector('#pr-ate' + k)?.value || raiz.querySelector('#pr-de' + k)?.value })).filter(f => f.de),
        duracao: Number(raiz.querySelector('#pr-du')?.value || 30),
    });
    const sheet = abrirSheetForm({
        titulo: 'Propor reunião', sub: i.partes?.nome || '', rotuloSalvar: 'Enviar convite',
        corpo: `<p class="rz-desc" style="margin:0 0 8px">Até 3 faixas de dias (sem faixa: próximos 5 dias úteis). Os horários respeitam sua agenda, o Google da Raiz e as preferências do interessado.</p>
            ${faixa(1)}${faixa(2)}${faixa(3)}
            <div class="rz-f"><label>Duração</label><select id="pr-du"><option value="30">30 min</option><option value="60">1 hora</option></select></div>
            <button type="button" class="rz-btn rz-btn-2 rz-sm" id="pr-ver">Ver horários</button>
            <div id="pr-res" class="rz-desc" style="margin-top:8px"></div>`,
        aoSalvar: async () => {
            const r = await edgeAgenda({ acao: 'propor', papel_id: i.id, ...ler() });
            toast(r.mensagem || (r.ok ? 'Convite enviado.' : 'Não deu certo.'), r.ok ? 'sucesso' : 'erro');
            return !!r.ok;
        },
    });
    raiz = sheet || document;
    raiz.querySelector('#pr-ver')?.addEventListener('click', async () => {
        const el = raiz.querySelector('#pr-res'); if (el) el.textContent = 'Calculando…';
        const r = await edgeAgenda({ acao: 'previa', papel_id: i.id, ...ler() });
        if (el) el.textContent = r.ok ? ((r.horarios_txt || []).length ? `${r.horarios_txt.length} horário(s): ${r.horarios_txt.join(' · ')}` : 'Nenhum horário livre com essas faixas e preferências.') : (r.mensagem || 'Não deu certo.');
    });
}
