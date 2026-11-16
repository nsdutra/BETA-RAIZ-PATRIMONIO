// =====================================================================
// RAIZ PATRIMÔNIO — js/comercial-itens.js
// Versão: 1.0.0 · 16/11/2026
// -----------------------------------------------------------------
// v1.0.0 (16/11/2026, sessão 20261116-0840-comercial-r3, demandas 285a0058 e cc3c667e; FICHA_RECEITA_UNIDADES_GERADORAS v1.6.0
// §6.2, §6.3, §11 e §12.1–12.4 — de acordo do Nicola 14/11 e 16/11 08:38) — criação. Chip "Itens" do Patrimônio na lente
// Comercial: lista do catálogo (fn_catalogo_itens_listar) com preço vigente da tabela padrão e ⋮ por item (Editar, Preços,
// Desativar/Ativar); ⋮ do card com Novo item e Mostrar inativos; formulário do item (fn_catalogo_item_salvar) e preços com
// histórico, por comprador e por volume (fn_catalogo_preco_salvar; leitura de catalogo_precos pela RLS).
// =====================================================================
export const VERSAO = '1.0.0';

const esc = (s) => (typeof rzEsc === 'function' ? rzEsc(s) : String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])));
const toast = (m, t) => (typeof mostrarToast === 'function' ? mostrarToast(m, t) : console.log(m));
const icones = () => { if (typeof refrescarIcones === 'function') refrescarIcones(); else if (window.lucide) window.lucide.createIcons(); };
const moeda = (v) => (v == null ? '—' : (typeof formatarMoedaBR === 'function' ? formatarMoedaBR(v) : `R$ ${Number(v).toFixed(2)}`));
const dataBR = (d) => (d ? String(d).slice(0, 10).split('-').reverse().join('/') : '—');
const cliente = () => (typeof CLIENTE_ID_SUPABASE !== 'undefined' ? CLIENTE_ID_SUPABASE : null);
const NATUREZA = { produto: 'Produto', servico: 'Serviço', licenca: 'Licença', unidade: 'Unidade locável' };
const UNIDADES = ['unidade', 'saca', 'kg', 'litro', 'm²', 'hora', 'diária', 'mês', 'ano', 'caixa', 'dúzia'];
const st = { inativos: false, itens: [], container: null };

// ---------------------------------------------------------------------
// Lista
// ---------------------------------------------------------------------
export async function renderItens(container) {
    st.container = container || st.container;
    const el = st.container; if (!el) return;
    el.innerHTML = typeof rzSk === 'function' ? rzSk('lista', 3) : '';
    const { data, error } = await dbAuth.rpc('fn_catalogo_itens_listar', { p_cliente_id: cliente(), p_busca: null, p_ativos_so: !st.inativos });
    if (error || !data?.ok) {
        el.innerHTML = `<div class="rz-card"><p class="rz-desc" style="margin:0">${esc(data?.mensagem || error?.message || 'Não consegui ler o catálogo agora.')}</p></div>`;
        return;
    }
    st.itens = data.dados || [];
    const linha = (i) => {
        const sub = [i.codigo, NATUREZA[i.natureza] || i.natureza, i.categoria_nome, i.ativo_origem_nome ? 'de ' + i.ativo_origem_nome : ''].filter(Boolean).join(' · ');
        const preco = i.preco != null ? `<b>${moeda(i.preco)}</b><span class="rz-desc">por ${esc(i.unidade)}</span>` : '<span class="rz-st rz-warn">Sem preço</span>';
        return `<div class="rz-row rz-link${i.ativo ? '' : ' rz-off'}" role="button" tabindex="0" data-ci-id="${i.id}">
            <div class="rz-ic"><svg data-lucide="${i.natureza === 'servico' ? 'handshake' : i.natureza === 'licenca' ? 'badge-check' : 'package'}"></svg></div>
            <div class="rz-tx"><b>${esc(i.nome)}</b><span>${esc(sub || (i.ativo ? '' : 'Inativo'))}${i.precos_especiais ? ` · ${i.precos_especiais} preço${i.precos_especiais > 1 ? 's' : ''} especia${i.precos_especiais > 1 ? 'is' : 'l'}` : ''}</span></div>
            <div class="rz-rt">${preco}</div>
            <button type="button" class="rz-more" data-ci-acoes="${i.id}" aria-label="Ações do item"><svg data-lucide="ellipsis-vertical"></svg></button></div>`;
    };
    el.innerHTML = `<div class="rz-card rz-list"><div class="rz-card-h" style="padding-top:10px;margin-bottom:0"><h3>Itens à venda</h3>
            <span class="rz-sub">${st.itens.length} ${st.itens.length === 1 ? 'item' : 'itens'}${st.inativos ? ' · com inativos' : ''}</span>
            <button type="button" class="rz-more" data-ci-mais aria-label="Ações do catálogo"><svg data-lucide="ellipsis-vertical"></svg></button></div>
        ${st.itens.length ? st.itens.map(linha).join('') : '<p class="rz-desc" style="margin:8px 2px">Nenhum item ainda. Cadastre o que você vende — produto, serviço, licença — com unidade e preço.</p>'}
        <button type="button" class="rz-add" data-ci-novo><svg data-lucide="plus"></svg>Novo item</button></div>`;
    el.querySelector('[data-ci-mais]').addEventListener('click', acoesCatalogo);
    el.querySelector('[data-ci-novo]').addEventListener('click', () => abrirFormItem(null));
    el.querySelectorAll('[data-ci-id]').forEach(r => r.addEventListener('click', (ev) => {
        if (ev.target.closest('[data-ci-acoes]')) return;
        abrirFormItem(st.itens.find(x => x.id === r.dataset.ciId));
    }));
    el.querySelectorAll('[data-ci-acoes]').forEach(b => b.addEventListener('click', (ev) => { ev.stopPropagation(); acoesItem(st.itens.find(x => x.id === b.dataset.ciAcoes)); }));
    icones();
}

function acoesCatalogo() {
    abrirSheetAcoes({ titulo: 'Itens à venda', sub: 'Catálogo do Comercial', acoes: [
        { icone: 'plus', titulo: 'Novo item', sub: 'Produto, serviço ou licença', aoTocar: () => setTimeout(() => abrirFormItem(null), 50) },
        { icone: st.inativos ? 'eye-off' : 'eye', titulo: st.inativos ? 'Esconder inativos' : 'Mostrar inativos', aoTocar: () => { st.inativos = !st.inativos; renderItens(); } },
    ] });
}

function acoesItem(i) {
    if (!i) return;
    abrirSheetAcoes({ titulo: i.nome, sub: [NATUREZA[i.natureza], i.unidade].filter(Boolean).join(' · '), acoes: [
        { icone: 'pencil', titulo: 'Editar item', aoTocar: () => setTimeout(() => abrirFormItem(i), 50) },
        { icone: 'tags', titulo: 'Preços', sub: i.preco != null ? `${moeda(i.preco)} por ${i.unidade}` : 'Sem preço ainda', aoTocar: () => setTimeout(() => abrirPrecos(i), 50) },
        i.ativo
            ? { icone: 'archive', tipo: 'bad', titulo: 'Desativar', sub: 'Sai da lista e da venda; o histórico fica', aoTocar: () => salvar(i.id, { ...paraSalvar(i), ativo: false }, 'Item desativado.') }
            : { icone: 'eye', titulo: 'Ativar de novo', aoTocar: () => salvar(i.id, { ...paraSalvar(i), ativo: true }, 'Item ativo de novo.') },
    ] });
}

const paraSalvar = (i) => ({ nome: i.nome, natureza: i.natureza, unidade: i.unidade, codigo: i.codigo || '', descricao: i.descricao || '',
    categoria_codigo: i.categoria_codigo || '', ativo_origem_id: i.ativo_origem_id || '', custo_padrao: i.custo_padrao ?? '', variacoes: i.variacoes || [] });

async function salvar(id, item, ok) {
    const { data, error } = await dbAuth.rpc('fn_catalogo_item_salvar', { p_cliente_id: cliente(), p_item: item, p_item_id: id || null, p_canal: 'app' });
    if (error || !data?.ok) { toast(data?.mensagem || error?.message || 'Não consegui salvar.', 'erro'); return false; }
    toast(ok || data.mensagem, 'sucesso');
    renderItens();
    return true;
}

// ---------------------------------------------------------------------
// Formulário do item
// ---------------------------------------------------------------------
let _cats = null, _ativos = null;
async function opcoes() {
    if (!_cats) {
        const { data } = await dbAuth.from('lancamento_categorias').select('codigo, nome').eq('direcao', 'entrada').order('nome');
        _cats = (data || []).filter(c => !String(c.codigo).startsWith('grp_'));
    }
    if (!_ativos) {
        const { data } = await dbAuth.from('cofre_ativos').select('id, nome_exibicao').eq('cliente_id', cliente()).is('ativo_principal_id', null).order('nome_exibicao');
        _ativos = data || [];
    }
}

async function abrirFormItem(i) {
    await opcoes().catch(() => {});
    const v = i || { natureza: 'produto', unidade: 'unidade' };
    const opt = (lista, val, rot) => lista.map(x => `<option value="${esc(x[0])}"${String(x[0]) === String(val ?? '') ? ' selected' : ''}>${esc(x[1])}</option>`).join('');
    abrirSheetForm({
        titulo: i ? 'Editar item' : 'Novo item', sub: 'Catálogo do Comercial', rotuloSalvar: 'Salvar',
        corpo: `
            <div class="rz-f"><label for="ci-nome">Nome <i>*</i></label><input type="text" id="ci-nome" maxlength="200" value="${esc(v.nome || '')}" placeholder="Ex.: Café arábica tipo 6, saca 60 kg"></div>
            <div class="rz-f2 rz-f2-curto">
                <div class="rz-f"><label for="ci-nat">Natureza</label><select id="ci-nat">${opt(Object.entries(NATUREZA), v.natureza)}</select></div>
                <div class="rz-f"><label for="ci-un">Unidade <i>*</i></label><input type="text" id="ci-un" list="ci-un-lista" value="${esc(v.unidade || '')}"><datalist id="ci-un-lista">${UNIDADES.map(u => `<option value="${esc(u)}">`).join('')}</datalist></div>
            </div>
            <div class="rz-f2 rz-f2-curto">
                <div class="rz-f"><label for="ci-preco">${i ? 'Preço (tabela padrão)' : 'Preço'}</label><input type="number" id="ci-preco" min="0" step="0.01" inputmode="decimal" value="${i && i.preco != null ? i.preco : ''}" placeholder="0,00"></div>
                <div class="rz-f"><label for="ci-custo">Custo padrão</label><input type="number" id="ci-custo" min="0" step="0.01" inputmode="decimal" value="${v.custo_padrao ?? ''}" placeholder="opcional"></div>
            </div>
            <div class="rz-f"><label for="ci-cat">Categoria da receita</label><select id="ci-cat"><option value="">—</option>${opt((_cats || []).map(c => [c.codigo, c.nome]), v.categoria_codigo)}</select></div>
            <div class="rz-f"><label for="ci-ativo">De onde vem (ativo)</label><select id="ci-ativo"><option value="">—</option>${opt((_ativos || []).map(a => [a.id, a.nome_exibicao]), v.ativo_origem_id)}</select></div>
            <div class="rz-f2 rz-f2-curto">
                <div class="rz-f"><label for="ci-cod">Código</label><input type="text" id="ci-cod" maxlength="40" value="${esc(v.codigo || '')}" placeholder="SKU, opcional"></div>
                <div class="rz-f"></div>
            </div>
            <div class="rz-f" style="margin-bottom:0"><label for="ci-desc">Descrição</label><textarea id="ci-desc" rows="2" maxlength="600">${esc(v.descricao || '')}</textarea></div>`,
        aoSalvar: async () => {
            const val = (id) => document.getElementById(id)?.value ?? '';
            if (!val('ci-nome').trim()) { toast('Dê um nome ao item.', 'erro'); return false; }
            if (!val('ci-un').trim()) { toast('Informe a unidade.', 'erro'); return false; }
            const novoPreco = val('ci-preco') === '' ? null : Number(val('ci-preco'));
            const item = { nome: val('ci-nome').trim(), natureza: val('ci-nat'), unidade: val('ci-un').trim(), codigo: val('ci-cod').trim(),
                categoria_codigo: val('ci-cat'), ativo_origem_id: val('ci-ativo'), custo_padrao: val('ci-custo'), descricao: val('ci-desc').trim(),
                variacoes: v.variacoes || [], ativo: i ? i.ativo : true };
            if (novoPreco != null && (!i || Number(i.preco) !== novoPreco)) item.preco = novoPreco; // só grava preço novo quando mudou
            return salvar(i?.id, item);
        },
    });
}

// ---------------------------------------------------------------------
// Preços (histórico, comprador, volume)
// ---------------------------------------------------------------------
async function abrirPrecos(i) {
    const { data, error } = await dbAuth.from('catalogo_precos').select('id, tabela, parte_id, quantidade_min, preco, vigencia_inicio, vigencia_fim, partes(nome)')
        .eq('item_id', i.id).order('vigencia_inicio', { ascending: false });
    if (error) { toast(error.message, 'erro'); return; }
    const hoje = new Date().toISOString().slice(0, 10);
    const vig = (p) => p.vigencia_inicio <= hoje && (!p.vigencia_fim || p.vigencia_fim >= hoje);
    const chave = (p) => [p.partes?.nome ? 'Para ' + p.partes.nome : (p.tabela === 'padrao' ? 'Tabela padrão' : 'Tabela ' + p.tabela), p.quantidade_min > 0 ? `a partir de ${p.quantidade_min} ${i.unidade}` : ''].filter(Boolean).join(' · ');
    const linhas = (data || []).map(p => `<div class="rz-row"><div class="rz-ic"><svg data-lucide="${p.parte_id ? 'user-round' : p.quantidade_min > 0 ? 'boxes' : 'tag'}"></svg></div>
        <div class="rz-tx"><b>${esc(chave(p))}</b><span>${dataBR(p.vigencia_inicio)}${p.vigencia_fim ? ' a ' + dataBR(p.vigencia_fim) : ' em diante'}</span></div>
        <div class="rz-rt"><b>${moeda(p.preco)}</b>${vig(p) ? '<span class="rz-st rz-ok">Vigente</span>' : p.vigencia_inicio > hoje ? '<span class="rz-st rz-neu">A partir de</span>' : '<span class="rz-st rz-neu">Antigo</span>'}</div></div>`).join('');
    const s = abrirSheet(`${typeof rzSheetCabecalho === 'function' ? rzSheetCabecalho('Preços', i.nome) : `<div class="rz-sh-h"><h3>Preços</h3></div>`}
        <div class="rz-sh-b"><div class="rz-card rz-list">${linhas || '<p class="rz-desc" style="margin:8px 2px">Sem preço ainda.</p>'}
        <button type="button" class="rz-add" data-cp-novo><svg data-lucide="plus"></svg>Novo preço</button></div>
        <p class="rz-desc" style="margin:10px 4px 0">Na venda vale o preço do comprador; sem ele, o de volume que couber na quantidade; sem ele, a tabela padrão — sempre o vigente na data.</p></div>`);
    s?.querySelector('[data-cp-novo]')?.addEventListener('click', () => abrirNovoPreco(i));
    icones();
}

async function abrirNovoPreco(i) {
    const { data: partes } = await dbAuth.from('partes').select('id, nome').eq('cliente_id', cliente()).order('nome').limit(500);
    const hoje = new Date().toISOString().slice(0, 10);
    abrirSheetForm({
        titulo: 'Novo preço', sub: i.nome, rotuloSalvar: 'Salvar preço', empilhar: true,
        corpo: `
            <div class="rz-f2 rz-f2-curto">
                <div class="rz-f"><label for="cp-preco">Preço por ${esc(i.unidade)} <i>*</i></label><input type="number" id="cp-preco" min="0" step="0.01" inputmode="decimal"></div>
                <div class="rz-f"><label for="cp-ini">Vale a partir de</label><input type="date" id="cp-ini" value="${hoje}"></div>
            </div>
            <div class="rz-f"><label for="cp-parte">Só para o comprador</label><select id="cp-parte"><option value="">Todos (tabela)</option>${(partes || []).map(p => `<option value="${p.id}">${esc(p.nome)}</option>`).join('')}</select></div>
            <div class="rz-f2 rz-f2-curto">
                <div class="rz-f"><label for="cp-qtd">A partir de (quantidade)</label><input type="number" id="cp-qtd" min="0" step="any" value="0"></div>
                <div class="rz-f"><label for="cp-tab">Tabela</label><input type="text" id="cp-tab" value="padrao" maxlength="40"></div>
            </div>
            <p class="rz-desc" style="margin:0">O preço anterior da mesma tabela, comprador e quantidade termina na véspera.</p>`,
        aoSalvar: async () => {
            const val = (id) => document.getElementById(id)?.value ?? '';
            if (val('cp-preco') === '') { toast('Informe o preço.', 'erro'); return false; }
            const { data, error } = await dbAuth.rpc('fn_catalogo_preco_salvar', { p_cliente_id: cliente(), p_item_id: i.id, p_preco: Number(val('cp-preco')),
                p_tabela: val('cp-tab') || 'padrao', p_parte_id: val('cp-parte') || null, p_quantidade_min: Number(val('cp-qtd') || 0),
                p_vigencia_inicio: val('cp-ini') || hoje, p_canal: 'app' });
            if (error || !data?.ok) { toast(data?.mensagem || error?.message || 'Não consegui salvar o preço.', 'erro'); return false; }
            toast('Preço salvo.', 'sucesso');
            setTimeout(() => { fecharSheet && fecharSheet(); abrirPrecos(i); renderItens(); }, 80);
            return true;
        },
    });
}
