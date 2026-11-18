// =====================================================================
// RAIZ PATRIMÔNIO — js/comercial-tabelas.js
// Versão: 1.0.1 · 17/11/2026
// -----------------------------------------------------------------
// v1.0.1 (17/11/2026, sessão 20261117-1700-comercial-r5, demanda 285a0058 — nota de 17/11 20:45) — cabeçalhos de grupo com o contador à
//   direita (rz-group-t): sai o "Vale em0" / "Café1" colado. A tela que mostrava "Ativa em 0 ativos" era a policy de vinculos
//   (corrigida no banco, comercial_vinculos_policy_fix_v1). Versão anterior: 1.0.0
// v1.0.0 (17/11/2026, sessão 20261117-0000-comercial-c2, demanda 285a0058; FICHA_RECEITA_UNIDADES_GERADORAS v1.12.0 §13.5, §13.6
// e §13.9 — de acordo do Nicola 16/11 21:31, 23:18 e 23:19) — criação. Tabelas de preço do Raiz Comercial, SEM tabela padrão:
//   · Lista das tabelas (chip "Tabelas" da lente Comercial): recorte Grupo › Subgrupo, ativos onde está ativa, cliente exclusivo.
//   · Tela da tabela (sheet de tela inteira): ativos onde vale, preços por subgrupo (base, por volume, por cliente) e ⋮ com
//     Preço de item, Ativar em outro ativo, Editar e Desativar.
//   · Card "Tabelas de venda" na aba Usos e contratos do ativo (resumo; tocar abre a tela), só com tabela ativa no ativo.
//   · "Ativar tabela de venda" no ⋮ de Contratos do ativo (liga/desliga, como o calendário).
// Escrita só pelas funções (fn_catalogo_tabela_salvar, fn_catalogo_tabela_ativar, fn_catalogo_preco_salvar); leitura pela RLS
// (catalogo_tabelas, catalogo_precos, vinculos com origem catalogo_tabela, partes_papeis).
// =====================================================================
export const VERSAO = '1.0.1';

const esc = (s) => (typeof rzEsc === 'function' ? rzEsc(s) : String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])));
const toast = (m, t) => (typeof mostrarToast === 'function' ? mostrarToast(m, t) : console.log(m));
const icones = () => { if (typeof refrescarIcones === 'function') refrescarIcones(); else if (window.lucide) window.lucide.createIcons(); };
const moeda = (v) => (v == null ? '—' : (typeof formatarMoedaBR === 'function' ? formatarMoedaBR(v) : `R$ ${Number(v).toFixed(2)}`));
const dataBR = (d) => (d ? String(d).slice(0, 10).split('-').reverse().join('/') : '—');
const cliente = () => (typeof CLIENTE_ID_SUPABASE !== 'undefined' ? CLIENTE_ID_SUPABASE : null);
const hoje = () => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
const vigente = (v) => (!v.vigencia_ate || v.vigencia_ate >= hoje()) && (!v.vigencia_de || v.vigencia_de <= hoje());
const precoVigente = (p) => p.vigencia_inicio <= hoje() && (!p.vigencia_fim || p.vigencia_fim >= hoje());
const recorte = (t) => t.grupo ? (t.subgrupo ? `${t.grupo} › ${t.subgrupo}` : `${t.grupo} (todos)`) : 'Todos os itens';
const cabecalho = (titulo, sub, mais) => `<div class="rz-sh-h"><div style="flex:1;min-width:0"><h3>${esc(titulo)}</h3>${sub ? `<span class="rz-sub">${esc(sub)}</span>` : ''}</div>
    ${mais ? '<button type="button" class="rz-more" data-tt-mais aria-label="Ações"><i data-lucide="ellipsis-vertical"></i></button>' : ''}
    <button type="button" class="rz-x" onclick="fecharSheet()" aria-label="Fechar"><i data-lucide="x"></i></button></div>`;

// ---------------------------------------------------------------------
// Leitura
// ---------------------------------------------------------------------
async function lerTabelas() {
    const [t, v, c] = await Promise.all([
        dbAuth.from('catalogo_tabelas').select('id, nome, grupo, subgrupo, descricao, ativa').eq('cliente_id', cliente()).order('nome'),
        dbAuth.from('vinculos').select('id, origem_id, ativo_id, vigencia_de, vigencia_ate, cofre_ativos(nome_exibicao)').eq('cliente_id', cliente()).eq('origem_tipo', 'catalogo_tabela').eq('papel', 'vende'),
        dbAuth.from('partes_papeis').select('entidade_id, parte_id, partes(nome)').eq('entidade_tipo', 'catalogo_tabela').eq('papel', 'comprador').eq('ativo', true),
    ]);
    if (t.error) throw t.error;
    const vins = (v.data || []).filter(vigente);
    return (t.data || []).map(x => ({ ...x,
        ativos: vins.filter(y => y.origem_id === x.id).map(y => ({ id: y.ativo_id, nome: y.cofre_ativos?.nome_exibicao || 'Ativo' })),
        comprador: (c.data || []).find(y => y.entidade_id === x.id) || null }));
}
async function lerPrecos(tabelaId) {
    const { data, error } = await dbAuth.from('catalogo_precos')
        .select('id, item_id, parte_id, quantidade_min, preco, vigencia_inicio, vigencia_fim, catalogo_itens(nome, unidade, grupo, subgrupo), partes(nome)')
        .eq('tabela_id', tabelaId).order('vigencia_inicio', { ascending: false });
    if (error) throw error;
    return data || [];
}

// ---------------------------------------------------------------------
// Lista (chip Tabelas da lente Comercial)
// ---------------------------------------------------------------------
const stLista = { container: null };
export async function renderTabelas(container) {
    stLista.container = container || stLista.container;
    const el = stLista.container; if (!el) return;
    el.innerHTML = typeof rzSk === 'function' ? rzSk('lista', 3) : '';
    let tabs = [];
    try { tabs = await lerTabelas(); } catch (e) { el.innerHTML = `<div class="rz-card"><p class="rz-desc" style="margin:0">${esc(e?.message || 'Não consegui ler as tabelas.')}</p></div>`; return; }
    const linha = (t) => `<div class="rz-row rz-link${t.ativa ? '' : ' rz-off'}" role="button" tabindex="0" data-tb-id="${t.id}">
        <div class="rz-ic"><i data-lucide="tags"></i></div>
        <div class="rz-tx"><b>${esc(t.nome)}</b><span>${esc([recorte(t), t.ativos.length ? 'em ' + t.ativos.map(a => a.nome).join(', ') : 'sem ativo', t.comprador ? 'só ' + (t.comprador.partes?.nome || 'um cliente') : ''].filter(Boolean).join(' · '))}</span></div>
        <div class="rz-rt">${!t.ativa ? '<span class="rz-st rz-neu">Desativada</span>' : t.ativos.length ? '<span class="rz-st rz-ok">Ativa</span>' : '<span class="rz-st rz-neu">Sem ativo</span>'}</div></div>`;
    el.innerHTML = `<div class="rz-card rz-list"><div class="rz-card-h" style="padding-top:10px;margin-bottom:0"><h3>Tabelas de preço</h3>
            <span class="rz-sub">${tabs.length} ${tabs.length === 1 ? 'tabela' : 'tabelas'}</span></div>
        ${tabs.length ? tabs.map(linha).join('') : '<p class="rz-desc" style="margin:8px 2px">Nenhuma tabela ainda. Crie uma por recorte (ex.: Fazenda › Café) e ative nos ativos onde ela vale, como o calendário.</p>'}
        <button type="button" class="rz-add" data-tb-nova><i data-lucide="plus"></i>Nova tabela</button></div>`;
    el.querySelector('[data-tb-nova]').addEventListener('click', () => abrirFormTabela(null, () => renderTabelas()));
    el.querySelectorAll('[data-tb-id]').forEach(r => r.addEventListener('click', () => abrirTelaTabela(r.dataset.tbId, { aoMudar: () => renderTabelas() })));
    icones();
}

// ---------------------------------------------------------------------
// Formulário da tabela
// ---------------------------------------------------------------------
export async function abrirFormTabela(t, aoSalvar, opcoes = {}) {
    const [itens, partes] = await Promise.all([
        dbAuth.rpc('fn_catalogo_itens_listar', { p_cliente_id: cliente(), p_busca: null, p_ativos_so: true }).then(r => r.data?.dados || []).catch(() => []),
        dbAuth.from('partes').select('id, nome').eq('cliente_id', cliente()).order('nome').limit(500).then(r => r.data || []).catch(() => []),
    ]);
    const recortes = [];
    itens.forEach(i => { if (!i.grupo) return; if (!recortes.some(r => r.g === i.grupo && !r.s)) recortes.push({ g: i.grupo, s: null }); if (i.subgrupo && !recortes.some(r => r.g === i.grupo && r.s === i.subgrupo)) recortes.push({ g: i.grupo, s: i.subgrupo }); });
    recortes.sort((a, b) => (a.g + (a.s || '')).localeCompare(b.g + (b.s || ''), 'pt-BR'));
    const atual = t ? JSON.stringify({ g: t.grupo || null, s: t.subgrupo || null }) : '';
    const opR = [`<option value="${esc(JSON.stringify({ g: null, s: null }))}">Todos os itens</option>`]
        .concat(recortes.map(r => { const v = JSON.stringify(r); return `<option value="${esc(v)}"${v === atual ? ' selected' : ''}>${esc(r.s ? `${r.g} › ${r.s}` : `${r.g} (todos)`)}</option>`; })).join('');
    abrirSheetForm({
        titulo: t ? 'Editar tabela' : 'Nova tabela de preço', sub: 'Raiz Comercial', rotuloSalvar: t ? 'Salvar' : 'Criar tabela', empilhar: !!opcoes.empilhar,
        corpo: `
            <div class="rz-f"><label for="tb-nome">Nome <i>*</i></label><input type="text" id="tb-nome" maxlength="80" value="${esc(t?.nome || '')}" placeholder="Ex.: Café — atacado"></div>
            <div class="rz-f"><label for="tb-rec">Itens da tabela</label><select id="tb-rec">${opR}</select>
                <small class="rz-desc">Só os itens desse grupo entram na tabela — não mistura café com queijo.</small></div>
            <div class="rz-f"><label for="tb-comp">Só para um cliente (opcional)</label><select id="tb-comp"><option value="">Todos os clientes</option>${partes.map(p => `<option value="${p.id}"${t?.comprador?.parte_id === p.id ? ' selected' : ''}>${esc(p.nome)}</option>`).join('')}</select></div>
            <div class="rz-f" style="margin-bottom:0"><label for="tb-desc">Observação</label><textarea id="tb-desc" rows="2" maxlength="400">${esc(t?.descricao || '')}</textarea></div>
            ${t ? '' : '<p class="rz-desc" style="margin:10px 0 0">Não existe tabela padrão: depois de criar, ative a tabela nos ativos onde ela vale (no ⋮ da tabela ou no ⋮ de Contratos do ativo).</p>'}`,
        aoSalvar: async () => {
            const val = (id) => document.getElementById(id)?.value ?? '';
            if (!val('tb-nome').trim()) { toast('Dê um nome à tabela.', 'erro'); return false; }
            const r = JSON.parse(val('tb-rec') || '{}');
            const { data, error } = await dbAuth.rpc('fn_catalogo_tabela_salvar', { p_cliente_id: cliente(), p_tabela_id: t?.id || null, p_canal: 'app',
                p_tabela: { nome: val('tb-nome').trim(), grupo: r.g || '', subgrupo: r.s || '', descricao: val('tb-desc').trim(), comprador_parte_id: val('tb-comp') } });
            if (error || !data?.ok) { toast(data?.mensagem || error?.message || 'Não consegui salvar a tabela.', 'erro'); return false; }
            toast(data.mensagem, 'sucesso');
            setTimeout(() => aoSalvar && aoSalvar(data.dados?.id), 80);
            return true;
        },
    });
}

// ---------------------------------------------------------------------
// Tela da tabela (tela própria, aberta pelo card ou pela lista)
// ---------------------------------------------------------------------
export async function abrirTelaTabela(tabelaId, ctx = {}) {
    let t, precos;
    try { t = (await lerTabelas()).find(x => x.id === tabelaId); precos = t ? await lerPrecos(t.id) : []; }
    catch (e) { toast(e?.message || 'Não consegui abrir a tabela.', 'erro'); return; }
    if (!t) { toast('Tabela não encontrada.', 'erro'); return; }
    const vig = precos.filter(precoVigente);
    const futuros = precos.filter(p => p.vigencia_inicio > hoje());
    const nItens = new Set(vig.map(p => p.item_id)).size;
    const grupos = new Map();
    [...vig, ...futuros].forEach(p => { const k = p.catalogo_itens?.subgrupo || p.catalogo_itens?.grupo || 'Itens'; if (!grupos.has(k)) grupos.set(k, []); grupos.get(k).push(p); });
    const linhaPreco = (p) => {
        const det = [p.catalogo_itens?.unidade, p.quantidade_min > 0 ? `a partir de ${Number(p.quantidade_min).toLocaleString('pt-BR')}` : '', p.partes?.nome ? 'só ' + p.partes.nome : ''].filter(Boolean).join(' · ');
        return `<div class="rz-row"><div class="rz-ic"><i data-lucide="${p.parte_id ? 'user-round' : p.quantidade_min > 0 ? 'boxes' : 'package'}"></i></div>
            <div class="rz-tx"><b>${esc(p.catalogo_itens?.nome || 'Item')}</b><span>${esc(det)}</span></div>
            <div class="rz-rt"><b>${moeda(p.preco)}</b>${precoVigente(p) ? '<span class="rz-st rz-ok">Vigente</span>' : `<span class="rz-st rz-neu">A partir de ${dataBR(p.vigencia_inicio)}</span>`}</div>
            <button type="button" class="rz-more" data-tt-preco="${p.id}" aria-label="Ações do preço"><i data-lucide="ellipsis-vertical"></i></button></div>`;
    };
    const sheet = abrirSheet(`${cabecalho(t.nome, [recorte(t), t.comprador ? 'só ' + (t.comprador.partes?.nome || 'um cliente') : '', t.ativa ? '' : 'desativada'].filter(Boolean).join(' · '), true)}
        <div class="rz-sh-b">
            <div class="rz-kpis"><div class="rz-kpi"><small>Itens com preço</small><b>${nItens}</b></div><div class="rz-kpi"><small>Ativa em</small><b>${t.ativos.length} ${t.ativos.length === 1 ? 'ativo' : 'ativos'}</b></div></div>
            <div class="rz-group rz-group-t"><span>Vale em</span><b>${t.ativos.length}</b></div>
            <div class="rz-card rz-list">${t.ativos.length ? t.ativos.map(a => `<div class="rz-row"><div class="rz-ic"><i data-lucide="map-pin"></i></div><div class="rz-tx"><b>${esc(a.nome)}</b></div>
                <button type="button" class="rz-more" data-tt-ativo="${a.id}" aria-label="Ações"><i data-lucide="ellipsis-vertical"></i></button></div>`).join('')
                : '<p class="rz-desc" style="margin:8px 2px">Ainda não vale em nenhum ativo. Use ⋮ › Ativar em um ativo.</p>'}</div>
            ${[...grupos.entries()].map(([k, ps]) => `<div class="rz-group rz-group-t"><span>${esc(k)}</span><b>${ps.length}</b></div><div class="rz-card rz-list">${ps.map(linhaPreco).join('')}</div>`).join('')
                || '<div class="rz-card"><p class="rz-desc" style="margin:0">Sem preço ainda. Use ⋮ › Preço de item.</p></div>'}
            <button type="button" class="rz-add" data-tt-novo style="margin-top:8px"><i data-lucide="plus"></i>Preço de item</button>
        </div>`, { classe: 'rz-cheio' });
    const reabrir = () => { ctx.aoMudar && ctx.aoMudar(); setTimeout(() => abrirTelaTabela(t.id, ctx), 120); };
    sheet.querySelector('[data-tt-mais]')?.addEventListener('click', () => acoesTabela(t, ctx, reabrir));
    sheet.querySelector('[data-tt-novo]')?.addEventListener('click', () => abrirPrecoNaTabela(t, null, reabrir));
    sheet.querySelectorAll('[data-tt-preco]').forEach(b => b.addEventListener('click', () => {
        const p = precos.find(x => x.id === b.dataset.ttPreco);
        abrirSheetAcoes({ titulo: p?.catalogo_itens?.nome || 'Preço', sub: t.nome, empilhar: true, acoes: [
            { icone: 'pencil', titulo: 'Mudar o preço', sub: 'O anterior termina na véspera', aoTocar: () => setTimeout(() => abrirPrecoNaTabela(t, p, reabrir), 60) },
        ] });
    }));
    sheet.querySelectorAll('[data-tt-ativo]').forEach(b => b.addEventListener('click', () => {
        const a = t.ativos.find(x => x.id === b.dataset.ttAtivo);
        abrirSheetAcoes({ titulo: a?.nome || 'Ativo', sub: t.nome, empilhar: true, acoes: [
            { icone: 'unlink', tipo: 'bad', titulo: 'Desativar neste ativo', sub: 'Os preços continuam na tabela', aoTocar: () => ativar(t.id, a.id, false, reabrir) },
        ] });
    }));
    icones();
}

function acoesTabela(t, ctx, reabrir) {
    abrirSheetAcoes({ titulo: t.nome, sub: recorte(t), empilhar: true, grupos: [
        { titulo: 'Tabela', acoes: [
            { icone: 'plus', titulo: 'Preço de item', sub: 'Lista só os itens do recorte da tabela', aoTocar: () => setTimeout(() => abrirPrecoNaTabela(t, null, reabrir), 60) },
            { icone: 'map-pin', titulo: 'Ativar em um ativo', sub: 'Onde esta tabela vale', aoTocar: () => setTimeout(() => escolherAtivo(t, reabrir), 60) },
            { icone: 'pencil', titulo: 'Editar tabela', aoTocar: () => setTimeout(() => abrirFormTabela(t, reabrir, { empilhar: true }), 60) },
        ] },
        { titulo: '', acoes: [
            t.ativa ? { icone: 'archive', tipo: 'bad', titulo: 'Desativar tabela', sub: 'Sai da venda em todos os ativos; o histórico fica', aoTocar: () => salvarAtiva(t, false, reabrir) }
                    : { icone: 'eye', titulo: 'Ativar a tabela de novo', aoTocar: () => salvarAtiva(t, true, reabrir) },
        ] },
    ] });
}

async function salvarAtiva(t, ativa, depois) {
    const { data, error } = await dbAuth.rpc('fn_catalogo_tabela_salvar', { p_cliente_id: cliente(), p_tabela_id: t.id, p_canal: 'app',
        p_tabela: { nome: t.nome, grupo: t.grupo || '', subgrupo: t.subgrupo || '', descricao: t.descricao || '', ativa } });
    if (error || !data?.ok) { toast(data?.mensagem || error?.message || 'Não consegui.', 'erro'); return; }
    toast(ativa ? 'Tabela ativa de novo.' : 'Tabela desativada.', 'sucesso'); depois && depois();
}

async function ativar(tabelaId, ativoId, liga, depois) {
    const { data, error } = await dbAuth.rpc('fn_catalogo_tabela_ativar', { p_cliente_id: cliente(), p_tabela_id: tabelaId, p_ativo_id: ativoId, p_ativar: liga, p_canal: 'app' });
    if (error || !data?.ok) { toast(data?.mensagem || error?.message || 'Não consegui.', 'erro'); return false; }
    toast(data.mensagem, 'sucesso'); depois && depois(); return true;
}

async function escolherAtivo(t, depois) {
    const { data } = await dbAuth.from('cofre_ativos').select('id, nome_exibicao').eq('cliente_id', cliente()).is('ativo_principal_id', null).order('nome_exibicao');
    const livres = (data || []).filter(a => !t.ativos.some(x => x.id === a.id));
    abrirSheetForm({ titulo: 'Ativar em um ativo', sub: t.nome, rotuloSalvar: 'Ativar', empilhar: true,
        corpo: `<div class="rz-f" style="margin-bottom:0"><label for="tb-at">Ativo</label><select id="tb-at">${livres.map(a => `<option value="${a.id}">${esc(a.nome_exibicao)}</option>`).join('')}</select>
            <small class="rz-desc">A tabela passa a aparecer no card "Tabelas de venda" do ativo e nos pedidos dele.</small></div>`,
        aoSalvar: async () => { const id = document.getElementById('tb-at')?.value; if (!id) { toast('Escolha o ativo.', 'erro'); return false; } return ativar(t.id, id, true, depois); },
    });
}

// Preço de um item na tabela (novo ou mudança). Só itens do recorte da tabela.
export async function abrirPrecoNaTabela(t, p, depois, opcoes = {}) {
    const { data } = await dbAuth.rpc('fn_catalogo_itens_listar', { p_cliente_id: cliente(), p_busca: null, p_ativos_so: true });
    const itens = (data?.dados || []).filter(i => !t.grupo || ((i.grupo || '').toLowerCase() === t.grupo.toLowerCase() && (!t.subgrupo || (i.subgrupo || '').toLowerCase() === t.subgrupo.toLowerCase())));
    if (!itens.length) { toast(`Nenhum item em ${recorte(t)}. Cadastre o item primeiro.`, 'erro'); return; }
    const { data: partes } = await dbAuth.from('partes').select('id, nome').eq('cliente_id', cliente()).order('nome').limit(500);
    const sel = p?.item_id || opcoes.itemId || '';
    abrirSheetForm({
        titulo: p ? 'Mudar o preço' : 'Preço de item', sub: t.nome, rotuloSalvar: 'Salvar preço', empilhar: true,
        corpo: `
            <div class="rz-f"><label for="tp-item">Item <i>*</i></label><select id="tp-item"${p ? ' disabled' : ''}>${itens.map(i => `<option value="${i.id}"${i.id === sel ? ' selected' : ''}>${esc(i.nome)} · ${esc(i.unidade)}</option>`).join('')}</select></div>
            <div class="rz-f2 rz-f2-curto">
                <div class="rz-f"><label for="tp-preco">Preço <i>*</i></label><input type="number" id="tp-preco" min="0" step="0.01" inputmode="decimal" value="${p ? p.preco : ''}"></div>
                <div class="rz-f"><label for="tp-ini">Vale a partir de</label><input type="date" id="tp-ini" value="${hoje()}"></div>
            </div>
            <div class="rz-f2 rz-f2-curto">
                <div class="rz-f"><label for="tp-qtd">A partir de (qtd)</label><input type="number" id="tp-qtd" min="0" step="any" value="${p ? p.quantidade_min : 0}"${p ? ' disabled' : ''}></div>
                <div class="rz-f"><label for="tp-parte">Só para o cliente</label><select id="tp-parte"${p ? ' disabled' : ''}><option value="">Todos</option>${(partes || []).map(x => `<option value="${x.id}"${p?.parte_id === x.id ? ' selected' : ''}>${esc(x.nome)}</option>`).join('')}</select></div>
            </div>
            <p class="rz-desc" style="margin:0">O preço anterior do mesmo item, quantidade e cliente nesta tabela termina na véspera.</p>`,
        aoSalvar: async () => {
            const val = (id) => document.getElementById(id)?.value ?? '';
            if (val('tp-preco') === '') { toast('Informe o preço.', 'erro'); return false; }
            const { data: r, error } = await dbAuth.rpc('fn_catalogo_preco_salvar', { p_cliente_id: cliente(), p_item_id: p?.item_id || val('tp-item'), p_tabela_id: t.id,
                p_preco: Number(val('tp-preco')), p_parte_id: (p ? p.parte_id : val('tp-parte')) || null, p_quantidade_min: Number((p ? p.quantidade_min : val('tp-qtd')) || 0),
                p_vigencia_inicio: val('tp-ini') || hoje(), p_canal: 'app' });
            if (error || !r?.ok) { toast(r?.mensagem || error?.message || 'Não consegui salvar o preço.', 'erro'); return false; }
            toast('Preço salvo.', 'sucesso'); setTimeout(() => depois && depois(), 80); return true;
        },
    });
}

// ---------------------------------------------------------------------
// Ativo: card "Tabelas de venda" (aba Usos e contratos) e "Ativar tabela de venda"
// ---------------------------------------------------------------------
const liberado = () => typeof window.podeUsar === 'function' && window.podeUsar('comercial.precos').ok === true;

export async function montarCardTabelas(a) {
    const usosCard = document.getElementById('fa-card-usos'); if (!usosCard) return;
    let card = document.getElementById('fa-card-tabelas');
    if (!liberado()) { card?.remove(); return; }
    let tabs = [], nItens = 0;
    try {
        tabs = (await lerTabelas()).filter(t => t.ativa && t.ativos.some(x => x.id === a.id));
        if (tabs.length) {
            const { data } = await dbAuth.from('catalogo_precos').select('item_id, vigencia_inicio, vigencia_fim').in('tabela_id', tabs.map(t => t.id));
            nItens = new Set((data || []).filter(precoVigente).map(p => p.item_id)).size;
        }
    } catch (e) { console.warn('[comercial-tabelas] card:', e?.message || e); card?.remove(); return; }
    if (!tabs.length) { card?.remove(); return; }
    if (!card) {
        card = document.createElement('div'); card.id = 'fa-card-tabelas'; card.className = 'rz-card'; card.style.marginTop = '12px';
        (document.getElementById('fa-card-interessados') || document.getElementById('fa-card-calendario') || usosCard).after(card);
    }
    card.innerHTML = `<div class="rz-card-h"><h3>Tabelas de venda</h3><span class="rz-sub">${tabs.length} ${tabs.length === 1 ? 'ativa' : 'ativas'} · ${nItens} ${nItens === 1 ? 'item' : 'itens'} com preço</span>
            <button type="button" class="rz-more" data-ct-mais aria-label="Ações"><i data-lucide="ellipsis-vertical"></i></button></div>
        <div class="rz-list">${tabs.map(t => `<button type="button" class="rz-row rz-link" data-ct-id="${t.id}"><div class="rz-ic"><i data-lucide="tags"></i></div>
            <div class="rz-tx"><b>${esc(t.nome)}</b><span>${esc([recorte(t), t.comprador ? 'só ' + (t.comprador.partes?.nome || 'um cliente') : ''].filter(Boolean).join(' · '))}</span></div><i data-lucide="chevron-right" class="rz-chev"></i></button>`).join('')}</div>`;
    const recarregar = () => montarCardTabelas(a);
    card.querySelector('[data-ct-mais]').addEventListener('click', () => abrirAtivarTabelas(a));
    card.querySelectorAll('[data-ct-id]').forEach(b => b.addEventListener('click', () => abrirTelaTabela(b.dataset.ctId, { aoMudar: recarregar })));
    icones();
}

export async function abrirAtivarTabelas(a) {
    let tabs = [];
    try { tabs = (await lerTabelas()).filter(t => t.ativa); } catch (e) { toast(e?.message || 'Não consegui ler as tabelas.', 'erro'); return; }
    const recarregar = () => montarCardTabelas(a);
    const sh = abrirSheet(`${cabecalho('Tabelas de venda', a.nome_exibicao || '', false)}
        <div class="rz-sh-b"><div class="rz-card rz-list">${tabs.map(t => { const on = t.ativos.some(x => x.id === a.id);
            return `<div class="rz-row"><div class="rz-ic"><i data-lucide="tags"></i></div><div class="rz-tx"><b>${esc(t.nome)}</b><span>${esc(recorte(t))}</span></div>
                <button type="button" role="switch" class="rz-switch" data-at-id="${t.id}" aria-checked="${on}" aria-label="Ativar ${esc(t.nome)}"></button></div>`; }).join('')
            || '<p class="rz-desc" style="margin:8px 2px">Nenhuma tabela cadastrada ainda.</p>'}
            <button type="button" class="rz-add" data-at-nova><i data-lucide="plus"></i>Nova tabela</button></div>
            <p class="rz-desc" style="margin:10px 4px 0">Ligada, a tabela vale neste ativo: aparece no card "Tabelas de venda" e nos pedidos dele.</p></div>`);
    sh.querySelectorAll('[data-at-id]').forEach(b => b.addEventListener('click', async () => {
        const liga = b.getAttribute('aria-checked') !== 'true';
        b.disabled = true;
        const ok = await ativar(b.dataset.atId, a.id, liga, recarregar);
        b.disabled = false; if (ok) b.setAttribute('aria-checked', String(liga));
    }));
    sh.querySelector('[data-at-nova]')?.addEventListener('click', () => abrirFormTabela(null, async (id) => { if (id) await ativar(id, a.id, true, recarregar); abrirAtivarTabelas(a); }, { empilhar: true }));
    icones();
}
