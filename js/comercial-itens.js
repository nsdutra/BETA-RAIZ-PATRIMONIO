// =====================================================================
// RAIZ PATRIMÔNIO — js/comercial-itens.js
// Versão: 1.1.0 · 16/11/2026
// -----------------------------------------------------------------
// v1.1.0 (16/11/2026, sessão 20261116-2325-comercial-c1, demanda 285a0058; FICHA_RECEITA_UNIDADES_GERADORAS v1.12.0 §13.3,
// §13.4 e §13.11 — de acordo do Nicola 16/11 22:39 e 23:19) — C1 do catálogo: grupo e subgrupo no próprio item (lista
// agrupada Grupo › Subgrupo, com a categoria de receita do subgrupo no cabeçalho); no formulário, Grupo/Subgrupo com
// sugestões dos já usados e "Aplicar a todos os itens do subgrupo" (fn_catalogo_subgrupo_categoria); sai o campo "De onde
// vem (ativo)" (item não é ativo). Fotos do item no MESMO mecanismo das fotos do ativo (cofre_ativo_fotos, bucket
// cofre-documentos, uploadArquivoDocumento/gerarSignedUrl de cofre-api.js), com capa, "publicar na vitrine" e remover com
// Desfazer; miniatura da capa na lista.
// Versão anterior: 1.0.0 · 16/11/2026
//
// v1.0.0 (16/11/2026, sessão 20261116-0840-comercial-r3, demandas 285a0058 e cc3c667e; FICHA_RECEITA_UNIDADES_GERADORAS v1.6.0
// §6.2, §6.3, §11 e §12.1–12.4 — de acordo do Nicola 14/11 e 16/11 08:38) — criação. Chip "Itens" do Patrimônio na lente
// Comercial: lista do catálogo (fn_catalogo_itens_listar) com preço vigente da tabela padrão e ⋮ por item (Editar, Preços,
// Desativar/Ativar); ⋮ do card com Novo item e Mostrar inativos; formulário do item (fn_catalogo_item_salvar) e preços com
// histórico, por comprador e por volume (fn_catalogo_preco_salvar; leitura de catalogo_precos pela RLS).
// =====================================================================
import * as api from './cofre-api.js';
import { estado } from './cofre-estado.js';
import { avisarComDesfazer } from './cofre-ui.js';

export const VERSAO = '1.1.0';

const esc = (s) => (typeof rzEsc === 'function' ? rzEsc(s) : String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])));
const toast = (m, t) => (typeof mostrarToast === 'function' ? mostrarToast(m, t) : console.log(m));
const icones = () => { if (typeof refrescarIcones === 'function') refrescarIcones(); else if (window.lucide) window.lucide.createIcons(); };
const moeda = (v) => (v == null ? '—' : (typeof formatarMoedaBR === 'function' ? formatarMoedaBR(v) : `R$ ${Number(v).toFixed(2)}`));
const dataBR = (d) => (d ? String(d).slice(0, 10).split('-').reverse().join('/') : '—');
const cliente = () => (typeof CLIENTE_ID_SUPABASE !== 'undefined' ? CLIENTE_ID_SUPABASE : null);
const NATUREZA = { produto: 'Produto', servico: 'Serviço', licenca: 'Licença', unidade: 'Unidade locável' };
const UNIDADES = ['unidade', 'saca', 'kg', 'litro', 'm²', 'hora', 'diária', 'mês', 'ano', 'caixa', 'dúzia', 'pacote', 'peça'];
const SEM_GRUPO = 'Sem grupo';
const st = { inativos: false, itens: [], container: null };
const pessoaId = () => (estado?.pessoa?.id || null);

// ---------------------------------------------------------------------
// Lista agrupada Grupo › Subgrupo
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
        const sub = [i.unidade, i.codigo, NATUREZA[i.natureza] !== 'Produto' ? NATUREZA[i.natureza] : '', i.fotos ? `${i.fotos} foto${i.fotos > 1 ? 's' : ''}` : ''].filter(Boolean).join(' · ');
        const preco = i.preco != null ? `<b>${moeda(i.preco)}</b><span class="rz-desc">por ${esc(i.unidade)}</span>` : '<span class="rz-st rz-warn">Sem preço</span>';
        const ic = i.capa ? `<div class="rz-ic" data-ci-capa="${i.id}" style="overflow:hidden;padding:0"></div>`
            : `<div class="rz-ic"><svg data-lucide="${i.natureza === 'servico' ? 'handshake' : i.natureza === 'licenca' ? 'badge-check' : 'package'}"></svg></div>`;
        return `<div class="rz-row rz-link${i.ativo ? '' : ' rz-off'}" role="button" tabindex="0" data-ci-id="${i.id}">${ic}
            <div class="rz-tx"><b>${esc(i.nome)}</b><span>${esc(sub || (i.ativo ? '' : 'Inativo'))}${i.precos_especiais ? ` · ${i.precos_especiais} preço${i.precos_especiais > 1 ? 's' : ''} especia${i.precos_especiais > 1 ? 'is' : 'l'}` : ''}</span></div>
            <div class="rz-rt">${preco}</div>
            <button type="button" class="rz-more" data-ci-acoes="${i.id}" aria-label="Ações do item"><svg data-lucide="ellipsis-vertical"></svg></button></div>`;
    };
    const blocos = new Map();
    st.itens.forEach(i => { const k = i.grupo ? (i.subgrupo ? `${i.grupo} › ${i.subgrupo}` : i.grupo) : SEM_GRUPO; if (!blocos.has(k)) blocos.set(k, []); blocos.get(k).push(i); });
    const corpo = [...blocos.entries()].map(([k, its]) => {
        const cat = its.find(x => x.categoria_nome)?.categoria_nome;
        return `<div class="rz-group">${esc(k)}<span>${its.length}${cat ? ' · receita: ' + esc(cat) : ''}</span></div>${its.map(linha).join('')}`;
    }).join('');
    el.innerHTML = `<div class="rz-card rz-list"><div class="rz-card-h" style="padding-top:10px;margin-bottom:0"><h3>Itens à venda</h3>
            <span class="rz-sub">${st.itens.length} ${st.itens.length === 1 ? 'item' : 'itens'}${st.inativos ? ' · com inativos' : ''}</span>
            <button type="button" class="rz-more" data-ci-mais aria-label="Ações do catálogo"><svg data-lucide="ellipsis-vertical"></svg></button></div>
        ${st.itens.length ? corpo : '<p class="rz-desc" style="margin:8px 2px">Nenhum item ainda. Cadastre o que você vende, com grupo e subgrupo (ex.: Fazenda › Queijos), unidade e fotos.</p>'}
        <button type="button" class="rz-add" data-ci-novo><svg data-lucide="plus"></svg>Novo item</button></div>`;
    el.querySelector('[data-ci-mais]').addEventListener('click', acoesCatalogo);
    el.querySelector('[data-ci-novo]').addEventListener('click', () => abrirFormItem(null));
    el.querySelectorAll('[data-ci-id]').forEach(r => r.addEventListener('click', (ev) => {
        if (ev.target.closest('[data-ci-acoes]')) return;
        abrirFormItem(st.itens.find(x => x.id === r.dataset.ciId));
    }));
    el.querySelectorAll('[data-ci-acoes]').forEach(b => b.addEventListener('click', (ev) => { ev.stopPropagation(); acoesItem(st.itens.find(x => x.id === b.dataset.ciAcoes)); }));
    icones();
    // miniaturas da capa (mesma URL assinada das fotos do ativo)
    el.querySelectorAll('[data-ci-capa]').forEach(async (box) => {
        const i = st.itens.find(x => x.id === box.dataset.ciCapa);
        try { const url = await api.gerarSignedUrl(i.capa.bucket, i.capa.storage_path, 600); if (url) box.innerHTML = `<img src="${esc(url)}" alt="" style="width:100%;height:100%;object-fit:cover">`; } catch (_) { /* fica o quadro */ }
    });
}

function acoesCatalogo() {
    abrirSheetAcoes({ titulo: 'Itens à venda', sub: 'Catálogo do Comercial', acoes: [
        { icone: 'plus', titulo: 'Novo item', sub: 'Produto, serviço ou licença', aoTocar: () => setTimeout(() => abrirFormItem(null), 50) },
        { icone: st.inativos ? 'eye-off' : 'eye', titulo: st.inativos ? 'Esconder inativos' : 'Mostrar inativos', aoTocar: () => { st.inativos = !st.inativos; renderItens(); } },
    ] });
}

function acoesItem(i) {
    if (!i) return;
    abrirSheetAcoes({ titulo: i.nome, sub: [i.grupo && i.subgrupo ? `${i.grupo} › ${i.subgrupo}` : i.grupo, i.unidade].filter(Boolean).join(' · '), acoes: [
        { icone: 'pencil', titulo: 'Editar item', aoTocar: () => setTimeout(() => abrirFormItem(i), 50) },
        { icone: 'image-plus', titulo: 'Fotos', sub: i.fotos ? `${i.fotos} foto${i.fotos > 1 ? 's' : ''}` : 'Nenhuma foto ainda', aoTocar: () => setTimeout(() => abrirFotos(i), 50) },
        { icone: 'tags', titulo: 'Preços', sub: i.preco != null ? `${moeda(i.preco)} por ${i.unidade}` : 'Sem preço ainda', aoTocar: () => setTimeout(() => abrirPrecos(i), 50) },
        i.ativo
            ? { icone: 'archive', tipo: 'bad', titulo: 'Desativar', sub: 'Sai da lista e da venda; o histórico fica', aoTocar: () => salvar(i.id, { ...paraSalvar(i), ativo: false }, 'Item desativado.') }
            : { icone: 'eye', titulo: 'Ativar de novo', aoTocar: () => salvar(i.id, { ...paraSalvar(i), ativo: true }, 'Item ativo de novo.') },
    ] });
}

const paraSalvar = (i) => ({ nome: i.nome, natureza: i.natureza, unidade: i.unidade, codigo: i.codigo || '', descricao: i.descricao || '',
    categoria_codigo: i.categoria_codigo || '', grupo: i.grupo || '', subgrupo: i.subgrupo || '', custo_padrao: i.custo_padrao ?? '', variacoes: i.variacoes || [] });

async function salvar(id, item, ok) {
    const { data, error } = await dbAuth.rpc('fn_catalogo_item_salvar', { p_cliente_id: cliente(), p_item: item, p_item_id: id || null, p_canal: 'app' });
    if (error || !data?.ok) { toast(data?.mensagem || error?.message || 'Não consegui salvar.', 'erro'); return false; }
    toast(ok || data.mensagem, 'sucesso');
    renderItens();
    return data;
}

// ---------------------------------------------------------------------
// Formulário do item (grupo e subgrupo no próprio item)
// ---------------------------------------------------------------------
let _cats = null;
async function opcoes() {
    if (!_cats) {
        const { data } = await dbAuth.from('lancamento_categorias').select('codigo, nome').eq('direcao', 'entrada').order('nome');
        _cats = (data || []).filter(c => !String(c.codigo).startsWith('grp_'));
    }
}
const unicos = (arr) => [...new Set(arr.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));

async function abrirFormItem(i) {
    await opcoes().catch(() => {});
    const v = i || { natureza: 'produto', unidade: 'unidade' };
    const opt = (lista, val) => lista.map(x => `<option value="${esc(x[0])}"${String(x[0]) === String(val ?? '') ? ' selected' : ''}>${esc(x[1])}</option>`).join('');
    const grupos = unicos(st.itens.map(x => x.grupo));
    const subs = unicos(st.itens.map(x => x.subgrupo));
    abrirSheetForm({
        titulo: i ? 'Editar item' : 'Novo item', sub: 'Catálogo do Comercial', rotuloSalvar: 'Salvar',
        corpo: `
            <div class="rz-f"><label for="ci-nome">Nome <i>*</i></label><input type="text" id="ci-nome" maxlength="200" value="${esc(v.nome || '')}" placeholder="Ex.: Queijo artesanal curado"></div>
            <div class="rz-f2 rz-f2-curto">
                <div class="rz-f"><label for="ci-grupo">Grupo</label><input type="text" id="ci-grupo" maxlength="60" list="ci-grupo-lista" value="${esc(v.grupo || '')}" placeholder="Ex.: Fazenda"><datalist id="ci-grupo-lista">${grupos.map(g => `<option value="${esc(g)}">`).join('')}</datalist></div>
                <div class="rz-f"><label for="ci-sub">Subgrupo</label><input type="text" id="ci-sub" maxlength="60" list="ci-sub-lista" value="${esc(v.subgrupo || '')}" placeholder="Ex.: Queijos"><datalist id="ci-sub-lista">${subs.map(g => `<option value="${esc(g)}">`).join('')}</datalist></div>
            </div>
            <div class="rz-f"><label for="ci-cat">Categoria da receita</label><select id="ci-cat"><option value="">—</option>${opt((_cats || []).map(c => [c.codigo, c.nome]), v.categoria_codigo)}</select>
                <label class="rz-desc" style="display:flex;gap:6px;align-items:center;margin-top:6px"><input type="checkbox" id="ci-cat-todos" checked> Aplicar a todos os itens do subgrupo</label></div>
            <div class="rz-f2 rz-f2-curto">
                <div class="rz-f"><label for="ci-nat">Natureza</label><select id="ci-nat">${opt(Object.entries(NATUREZA), v.natureza)}</select></div>
                <div class="rz-f"><label for="ci-un">Unidade <i>*</i></label><input type="text" id="ci-un" list="ci-un-lista" value="${esc(v.unidade || '')}"><datalist id="ci-un-lista">${UNIDADES.map(u => `<option value="${esc(u)}">`).join('')}</datalist></div>
            </div>
            <div class="rz-f2 rz-f2-curto">
                <div class="rz-f"><label for="ci-preco">${i ? 'Preço (tabela padrão)' : 'Preço'}</label><input type="number" id="ci-preco" min="0" step="0.01" inputmode="decimal" value="${i && i.preco != null ? i.preco : ''}" placeholder="0,00"></div>
                <div class="rz-f"><label for="ci-custo">Custo padrão</label><input type="number" id="ci-custo" min="0" step="0.01" inputmode="decimal" value="${v.custo_padrao ?? ''}" placeholder="opcional"></div>
            </div>
            <div class="rz-f"><label for="ci-cod">Código</label><input type="text" id="ci-cod" maxlength="40" value="${esc(v.codigo || '')}" placeholder="SKU, opcional"></div>
            <div class="rz-f" style="margin-bottom:0"><label for="ci-desc">Marca, detalhes e descrição (aparece na vitrine)</label><textarea id="ci-desc" rows="2" maxlength="600">${esc(v.descricao || '')}</textarea></div>
            ${i ? '' : '<p class="rz-desc" style="margin:10px 0 0">As fotos entram depois de salvar, no ⋮ do item › Fotos.</p>'}`,
        aoSalvar: async () => {
            const val = (id) => document.getElementById(id)?.value ?? '';
            if (!val('ci-nome').trim()) { toast('Dê um nome ao item.', 'erro'); return false; }
            if (!val('ci-un').trim()) { toast('Informe a unidade.', 'erro'); return false; }
            if (val('ci-sub').trim() && !val('ci-grupo').trim()) { toast('Informe o grupo do subgrupo.', 'erro'); return false; }
            const novoPreco = val('ci-preco') === '' ? null : Number(val('ci-preco'));
            const item = { nome: val('ci-nome').trim(), natureza: val('ci-nat'), unidade: val('ci-un').trim(), codigo: val('ci-cod').trim(),
                grupo: val('ci-grupo').trim(), subgrupo: val('ci-sub').trim(),
                categoria_codigo: val('ci-cat'), custo_padrao: val('ci-custo'), descricao: val('ci-desc').trim(),
                variacoes: v.variacoes || [], ativo: i ? i.ativo : true };
            if (novoPreco != null && (!i || Number(i.preco) !== novoPreco)) item.preco = novoPreco; // só grava preço novo quando mudou
            const res = await salvar(i?.id, item);
            if (!res) return false;
            // a categoria de receita vale para o subgrupo inteiro (quando marcado)
            const cat = res.dados?.categoria_codigo || item.categoria_codigo || '';
            const outros = st.itens.filter(x => x.id !== i?.id && (x.grupo || '').toLowerCase() === item.grupo.toLowerCase() && (x.subgrupo || '').toLowerCase() === item.subgrupo.toLowerCase());
            if (document.getElementById('ci-cat-todos')?.checked && item.subgrupo && outros.some(x => (x.categoria_codigo || '') !== cat)) {
                const { data } = await dbAuth.rpc('fn_catalogo_subgrupo_categoria', { p_cliente_id: cliente(), p_grupo: item.grupo, p_subgrupo: item.subgrupo, p_categoria_codigo: cat || null, p_canal: 'app' });
                if (data?.ok) { toast(data.mensagem, 'sucesso'); renderItens(); } else if (data?.mensagem) toast(data.mensagem, 'erro');
            }
            return true;
        },
    });
}

// ---------------------------------------------------------------------
// Fotos do item — mesmo mecanismo das fotos do ativo (cofre_ativo_fotos)
// ---------------------------------------------------------------------
async function abrirFotos(i) {
    const { data: fotos, error } = await dbAuth.from('cofre_ativo_fotos').select('id, bucket, storage_path, nome_arquivo, ordem, capa, publicar_vitrine')
        .eq('catalogo_item_id', i.id).eq('status', 'ativo').order('capa', { ascending: false }).order('ordem');
    if (error) { toast(error.message, 'erro'); return; }
    const urls = await Promise.all((fotos || []).map(f => api.gerarSignedUrl(f.bucket, f.storage_path, 600).catch(() => null)));
    const linhas = (fotos || []).map((f, k) => `<div class="rz-row">
        <div class="rz-ic" style="overflow:hidden;padding:0;width:48px;height:48px">${urls[k] ? `<img src="${esc(urls[k])}" alt="" style="width:100%;height:100%;object-fit:cover">` : '<svg data-lucide="image"></svg>'}</div>
        <div class="rz-tx"><b>${f.capa ? 'Capa' : 'Foto ' + (k + 1)}</b><span>${f.publicar_vitrine ? 'Aparece na vitrine' : 'Não aparece na vitrine'}</span></div>
        <button type="button" class="rz-more" data-cf-acoes="${f.id}" aria-label="Ações da foto"><svg data-lucide="ellipsis-vertical"></svg></button></div>`).join('');
    const s = abrirSheet(`${typeof rzSheetCabecalho === 'function' ? rzSheetCabecalho('Fotos', i.nome) : '<div class="rz-sh-h"><h3>Fotos</h3></div>'}
        <div class="rz-sh-b"><div class="rz-card rz-list">${linhas || '<p class="rz-desc" style="margin:8px 2px">Nenhuma foto ainda. A primeira vira a capa.</p>'}
        <button type="button" class="rz-add" data-cf-novo><svg data-lucide="image-plus"></svg>Adicionar fotos</button>
        <input type="file" accept="image/*" multiple data-cf-input style="display:none"></div></div>`);
    const input = s?.querySelector('[data-cf-input]');
    s?.querySelector('[data-cf-novo]')?.addEventListener('click', () => input?.click());
    input?.addEventListener('change', () => enviarFotos(i, input.files, (fotos || []).length));
    s?.querySelectorAll('[data-cf-acoes]').forEach(b => b.addEventListener('click', () => acoesFoto(i, (fotos || []).find(f => f.id === b.dataset.cfAcoes))));
    icones();
}

async function enviarFotos(i, arquivos, jaTem) {
    if (!arquivos?.length) return;
    toast('Enviando fotos…');
    let ordem = jaTem, ok = 0;
    for (const arquivo of arquivos) {
        const fotoId = crypto.randomUUID();
        const path = `${cliente()}/catalogo/${i.id}/fotos/${fotoId}_${arquivo.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        try {
            await api.uploadArquivoDocumento(path, arquivo); // mesmo bucket/serviço de upload das fotos do ativo
            const { error } = await dbAuth.from('cofre_ativo_fotos').insert({ id: fotoId, cliente_id: cliente(), catalogo_item_id: i.id, bucket: 'cofre-documentos',
                storage_path: path, nome_arquivo: arquivo.name, ordem: ordem, capa: ordem === 0, publicar_vitrine: true, criado_por: pessoaId() });
            if (error) throw error;
            ordem++; ok++;
        } catch (e) { toast('Não consegui enviar ' + arquivo.name + ': ' + (e?.message || e), 'erro'); }
    }
    if (ok) toast(ok === 1 ? 'Foto adicionada.' : `${ok} fotos adicionadas.`, 'sucesso');
    renderItens();
    setTimeout(() => { fecharSheet && fecharSheet(); abrirFotos({ ...i, fotos: jaTem + ok }); }, 80);
}

function acoesFoto(i, f) {
    if (!f) return;
    const recarregar = () => { renderItens(); setTimeout(() => { fecharSheet && fecharSheet(); abrirFotos(i); }, 80); };
    abrirSheetAcoes({ titulo: f.capa ? 'Capa' : 'Foto', sub: i.nome, acoes: [
        f.capa ? null : { icone: 'star', titulo: 'Usar como capa', aoTocar: async () => {
            const r1 = await dbAuth.from('cofre_ativo_fotos').update({ capa: false }).eq('catalogo_item_id', i.id).eq('capa', true);
            const r2 = await dbAuth.from('cofre_ativo_fotos').update({ capa: true }).eq('id', f.id);
            if (r1.error || r2.error) toast((r1.error || r2.error).message, 'erro'); else { toast('Capa trocada.', 'sucesso'); recarregar(); }
        } },
        { icone: f.publicar_vitrine ? 'eye-off' : 'store', titulo: f.publicar_vitrine ? 'Tirar da vitrine' : 'Mostrar na vitrine', aoTocar: async () => {
            const { error } = await dbAuth.from('cofre_ativo_fotos').update({ publicar_vitrine: !f.publicar_vitrine }).eq('id', f.id);
            if (error) toast(error.message, 'erro'); else recarregar();
        } },
        { icone: 'trash-2', tipo: 'bad', titulo: 'Remover foto', sub: 'Dá para desfazer', aoTocar: async () => {
            try {
                await api.excluirFotoAtivo(f.id); // arquiva, como nas fotos do ativo
                recarregar();
                avisarComDesfazer('Foto removida.', async () => { await api.restaurarFotoAtivo(f.id); recarregar(); });
            } catch (e) { toast(e?.message || 'Não consegui remover.', 'erro'); }
        } },
    ].filter(Boolean) });
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
