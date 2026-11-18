// =====================================================================
// RAIZ PATRIMÔNIO — js/comercial-pedidos.js
// Versão: 1.1.0 · 17/11/2026
// -----------------------------------------------------------------
// v1.1.0 (17/11/2026, sessão 20261117-2250-comercial-relatorios, demanda 285a0058; achados do Nicola 17/11 23:11) — relatórios do Comercial no ⋮ do card Pedidos; escolher o item no Novo pedido não redesenha a linha — a descrição fica sempre no lugar (só leitura com item do catálogo) e preço, custo e sugestão entram no próprio campo (antes os campos mudavam de lugar e o que se digitava caía no Desconto). Versão anterior: 1.0.0
// v1.0.0 (17/11/2026, sessão 20261117-1700-comercial-r5, demanda 285a0058; FICHA_RECEITA_UNIDADES_GERADORAS v1.12.0 §6.4–6.6,
// §12.5–12.11 e §13.8 — de acordo do Nicola 14/11, 15/11 e 16/11 23:18; "Sim siga" 17/11 16:55) — criação. O pedido do Raiz
// Comercial convivendo com os contratos na aba Usos e contratos do ativo:
//   · Card "Pedidos" (resumo por situação + os últimos), só com o plano (comercial.vendas) e com tabela de venda ativa ou pedido.
//   · Novo pedido / editar rascunho: comprador, venda ou amostra, itens (preço sugerido das tabelas ativas no ativo, custo
//     sugerido), desconto, pagamento (forma, parcelas, 1º vencimento, intervalo), entrega (tipo, endereço sugerido do último
//     pedido ou da parte, previsão, frete cobrado e pago, transportadora) e observação → fn_venda_salvar (o total sai do banco).
//   · Ficha do pedido (tela inteira): Resumo · Itens · Financeiro · Entrega · Partes, com ⋮ Confirmar (gera as parcelas no
//     Financeiro), Marcar enviado/entregue, Converter amostra em pedido e Cancelar (tira só as parcelas previstas).
//   · Interessado movido para "Pedido" abre o Novo pedido com o comprador (ativo-interessados.js chama abrirNovoPedido).
// =====================================================================
export const VERSAO = '1.1.0';

const esc = (s) => (typeof rzEsc === 'function' ? rzEsc(s) : String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])));
const toast = (m, t) => (typeof mostrarToast === 'function' ? mostrarToast(m, t) : console.log(m));
const icones = () => { if (typeof refrescarIcones === 'function') refrescarIcones(); else if (window.lucide) window.lucide.createIcons(); };
const moeda = (v) => (v == null ? '—' : (typeof formatarMoedaBR === 'function' ? formatarMoedaBR(v) : `R$ ${Number(v).toFixed(2)}`));
const dataBR = (d) => (d ? String(d).slice(0, 10).split('-').reverse().join('/') : '—');
const cliente = () => (typeof CLIENTE_ID_SUPABASE !== 'undefined' ? CLIENTE_ID_SUPABASE : null);
const hoje = () => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
const liberado = (cod = 'comercial.vendas') => typeof window.podeUsar === 'function' && window.podeUsar(cod).ok === true;
const SITUACAO = { rascunho: ['Rascunho', 'rz-neu'], confirmada: ['Confirmado', 'rz-run'], cancelada: ['Cancelado', 'rz-neu'], convertida: ['Convertida', 'rz-neu'] };
const ENTREGA = { pendente: 'A entregar', enviada: 'Enviado', entregue: 'Entregue' };
const TIPO_ENTREGA = { retirada: 'Retirada', propria: 'Entrega própria', transportadora: 'Transportadora' };
const FORMAS = { pix: 'PIX', boleto: 'Boleto', transferencia: 'Transferência', dinheiro: 'Dinheiro', outro: 'Outro' };
const PAPEIS = { comprador: 'Comprador', pagador: 'Pagador', recebe_entrega: 'Recebe a entrega', vendedor: 'Vendedor', transportadora: 'Transportadora' };
const situacao = (v) => v.status === 'confirmada' && v.entrega_status === 'entregue' ? ['Entregue', 'rz-ok'] : (SITUACAO[v.status] || [v.status, 'rz-neu']);
const titulo = (v) => `${v.tipo === 'amostra' ? 'Amostra' : 'Pedido'} nº ${v.numero}`;
const cabecalho = (t, sub, mais) => `<div class="rz-sh-h"><div style="flex:1;min-width:0"><h3>${esc(t)}</h3>${sub ? `<span class="rz-sub">${sub}</span>` : ''}</div>
    ${mais ? '<button type="button" class="rz-more" data-pd-mais aria-label="Ações do pedido"><i data-lucide="ellipsis-vertical"></i></button>' : ''}
    <button type="button" class="rz-x" onclick="fecharSheet()" aria-label="Fechar"><i data-lucide="x"></i></button></div>`;

// ---------------------------------------------------------------------
// Card "Pedidos" (aba Usos e contratos do ativo)
// ---------------------------------------------------------------------
export async function montarCardPedidos(a) {
    const usosCard = document.getElementById('fa-card-usos'); if (!usosCard) return;
    let card = document.getElementById('fa-card-pedidos');
    if (!liberado()) { card?.remove(); return; }
    let pedidos = [], temTabela = false;
    try {
        const [p, t] = await Promise.all([
            dbAuth.from('vendas').select('id, numero, tipo, status, data, valor_total, entrega_status, entrega_prevista, partes:parte_id(nome)').eq('ativo_id', a.id).order('numero', { ascending: false }).limit(50),
            dbAuth.from('vinculos').select('vigencia_ate').eq('origem_tipo', 'catalogo_tabela').eq('papel', 'vende').eq('ativo_id', a.id),
        ]);
        if (p.error) throw p.error;
        pedidos = p.data || [];
        temTabela = (t.data || []).some(v => !v.vigencia_ate || v.vigencia_ate >= hoje());
    } catch (e) { console.warn('[comercial-pedidos] card:', e?.message || e); card?.remove(); return; }
    if (!pedidos.length && !temTabela) { card?.remove(); return; }
    if (!card) {
        card = document.createElement('div'); card.id = 'fa-card-pedidos'; card.className = 'rz-card'; card.style.marginTop = '12px';
        (document.getElementById('fa-card-tabelas') || document.getElementById('fa-card-interessados') || usosCard).after(card);
    }
    const abertos = pedidos.filter(v => v.status === 'confirmada' && v.entrega_status !== 'entregue');
    const mes = hoje().slice(0, 7);
    const doMes = pedidos.filter(v => v.status === 'confirmada' && String(v.data).slice(0, 7) === mes);
    const linha = (v) => { const [s, c] = situacao(v);
        return `<button type="button" class="rz-row rz-link" data-pd-id="${v.id}"><div class="rz-ic"><i data-lucide="receipt"></i></div>
            <div class="rz-tx"><b>${esc(titulo(v))} · ${esc(v.partes?.nome || 'cliente')}</b><span>${dataBR(v.data)}${v.status === 'confirmada' && v.entrega_status !== 'entregue' && v.entrega_prevista ? ' · entrega ' + dataBR(v.entrega_prevista) : ''}</span></div>
            <div class="rz-rt"><b>${moeda(v.valor_total)}</b><span class="rz-st ${c}">${esc(s)}</span></div></button>`; };
    card.innerHTML = `<div class="rz-card-h"><h3>Pedidos</h3><span class="rz-sub">${pedidos.length ? `${doMes.length} no mês · ${abertos.length} a entregar` : 'nenhum ainda'}</span>
            <button type="button" class="rz-more" data-pd-card-mais aria-label="Ações"><i data-lucide="ellipsis-vertical"></i></button></div>
        ${pedidos.length ? `<div class="rz-list">${pedidos.slice(0, 5).map(linha).join('')}</div>` : '<p class="rz-desc" style="margin:4px 0 0">Registre o primeiro pedido deste ativo.</p>'}
        ${pedidos.length > 5 ? `<button type="button" class="rz-add" data-pd-todos><i data-lucide="list"></i>Ver os ${pedidos.length} pedidos</button>` : ''}
        <button type="button" class="rz-add" data-pd-novo><i data-lucide="plus"></i>Novo pedido</button>`;
    const recarregar = () => montarCardPedidos(a);
    card.querySelector('[data-pd-novo]').addEventListener('click', () => abrirNovoPedido(a, { aoMudar: recarregar }));
    card.querySelector('[data-pd-card-mais]').addEventListener('click', () => abrirSheetAcoes({ titulo: 'Pedidos', sub: a.nome_exibicao, acoes: [
        { icone: 'plus', titulo: 'Novo pedido', codigo: 'comercial.vendas', aoTocar: () => setTimeout(() => abrirNovoPedido(a, { aoMudar: recarregar }), 60) },
        { icone: 'gift', titulo: 'Nova amostra', sub: 'Pedido com desconto de amostra', codigo: 'comercial.amostras', aoTocar: () => setTimeout(() => abrirNovoPedido(a, { aoMudar: recarregar, tipo: 'amostra' }), 60) },
        { icone: 'tags', titulo: 'Tabelas de venda', codigo: 'comercial.precos', aoTocar: () => import('./comercial-tabelas.js').then(m => m.abrirAtivarTabelas(a)) },
        { icone: 'file-bar-chart', titulo: 'Relatórios', sub: 'Só deste ponto de venda', aoTocar: () => setTimeout(() => abrirRelatoriosComercial(a), 60) }, // v1.1.0
    ] }));
    card.querySelector('[data-pd-todos]')?.addEventListener('click', () => abrirListaPedidos(a, pedidos, recarregar));
    card.querySelectorAll('[data-pd-id]').forEach(b => b.addEventListener('click', () => abrirPedido(b.dataset.pdId, { ativo: a, aoMudar: recarregar })));
    icones();
}

// v1.1.0 — os 4 relatórios do Comercial (relatorios-executivos.js, fn_relatorio_comercial); com ativo, já abrem filtrados nele
export function abrirRelatoriosComercial(ativo = null, empilhar = false) {
    const rel = [['pedidos', 'Pedidos do mês', 'receipt', 'Valor, ticket e a receber'], ['itens', 'Itens mais vendidos', 'trophy', 'Ranking com margem'],
        ['clientes', 'Faturamento por cliente', 'users', 'Total, ticket e recorrência'], ['ativos', 'Vendas por ponto de venda', 'store', 'O que cada ativo vende']];
    abrirSheetAcoes({ titulo: 'Relatórios do Comercial', sub: ativo ? ativo.nome_exibicao : 'Todos os pontos de venda', empilhar, acoes: rel.map(([k, titulo, icone, sub]) => ({
        icone, titulo, sub, codigo: 'comercial.rel_' + k,
        aoTocar: () => setTimeout(() => window.abrirRelatorioExecutivo('com_' + k, ativo ? { ativoId: ativo.id, ativoNome: ativo.nome_exibicao } : {}), 60) })) });
}
function abrirListaPedidos(a, pedidos, aoMudar) {
    const sh = abrirSheet(`${cabecalho('Pedidos', esc(a.nome_exibicao || ''), false)}<div class="rz-sh-b"><div class="rz-card rz-list">${pedidos.map(v => { const [s, c] = situacao(v);
        return `<button type="button" class="rz-row rz-link" data-pd-id="${v.id}"><div class="rz-ic"><i data-lucide="receipt"></i></div><div class="rz-tx"><b>${esc(titulo(v))} · ${esc(v.partes?.nome || 'cliente')}</b><span>${dataBR(v.data)}</span></div>
            <div class="rz-rt"><b>${moeda(v.valor_total)}</b><span class="rz-st ${c}">${esc(s)}</span></div></button>`; }).join('')}</div></div>`, { classe: 'rz-cheio' });
    sh.querySelectorAll('[data-pd-id]').forEach(b => b.addEventListener('click', () => abrirPedido(b.dataset.pdId, { ativo: a, aoMudar })));
    icones();
}

// ---------------------------------------------------------------------
// Ficha do pedido
// ---------------------------------------------------------------------
export async function abrirPedido(id, ctx = {}, aba = 'resumo') {
    const [v, itens, lanc, partes, hist] = await Promise.all([
        dbAuth.from('vendas').select('*, comprador:parte_id(nome, whatsapp), transp:entrega_parte_id(nome), ativo:ativo_id(nome_exibicao)').eq('id', id).maybeSingle().then(r => r.data),
        dbAuth.from('venda_itens').select('*').eq('venda_id', id).order('ordem').then(r => r.data || []),
        dbAuth.from('lancamentos').select('id, valor, status, vencimento, data_pagamento, parcela, forma_pagamento, direcao').eq('origem_tipo', 'venda').eq('origem_id', id).order('parcela').then(r => r.data || []),
        dbAuth.from('partes_papeis').select('papel, parte_id, partes(nome, whatsapp)').eq('entidade_tipo', 'venda').eq('entidade_id', id).eq('ativo', true).then(r => r.data || []),
        dbAuth.from('vendas_historico').select('acao, criado_em, depois').eq('venda_id', id).order('criado_em', { ascending: false }).limit(20).then(r => r.data || []),
    ]).catch(e => { toast(e?.message || 'Não consegui abrir o pedido.', 'erro'); return []; });
    if (!v) { toast('Pedido não encontrado.', 'erro'); return; }
    const [s, c] = situacao(v);
    const recebido = lanc.filter(l => l.direcao === 'entrada' && l.status === 'realizado').reduce((t, l) => t + Number(l.valor), 0);
    const custo = itens.reduce((t, i) => t + (i.custo_unitario != null ? Number(i.custo_unitario) * Number(i.quantidade) : 0), 0) + Number(v.entrega_custo || 0);
    const temCusto = itens.some(i => i.custo_unitario != null);
    const kv = (rot, val) => `<div><small>${esc(rot)}</small><b>${val}</b></div>`;
    const end = v.entrega_endereco || {};
    const endTxt = [end.rua && [end.rua, end.numero].filter(Boolean).join(', '), end.complemento, end.bairro, [end.cidade, end.uf].filter(Boolean).join('/'), end.cep].filter(Boolean).join(' · ');
    const ACAO = { criar: 'Criado', editar: 'Editado', confirmar: 'Confirmado', cancelar: 'Cancelado', converter: 'Convertido em pedido', entrega: 'Entrega atualizada' };
    const corpos = {
        resumo: `<div class="rz-card"><div class="rz-kv">${kv('Comprador', esc(v.comprador?.nome || '—'))}${kv('Data', dataBR(v.data))}${kv('Ativo', esc(v.ativo?.nome_exibicao || '—'))}${kv('Tipo', v.tipo === 'amostra' ? 'Amostra' : 'Venda')}
            ${kv('Pagamento', esc([FORMAS[v.forma_pagamento] || 'a combinar', v.parcelas > 1 ? `${v.parcelas}x a cada ${v.intervalo_dias} dias` : 'à vista'].join(' · ')))}${kv('1º vencimento', dataBR(v.primeiro_vencimento || v.data))}
            ${v.desconto_pct > 0 ? kv('Desconto do pedido', `${Number(v.desconto_pct).toLocaleString('pt-BR')}%${v.condicao ? ' · ' + esc(v.condicao) : ''}`) : ''}
            ${temCusto ? kv('Margem estimada', `${moeda(Number(v.valor_total) - custo)}${Number(v.valor_total) > 0 ? ` (${Math.round((1 - custo / Number(v.valor_total)) * 100)}%)` : ''}`) : ''}
            ${v.observacao ? `<div class="rz-full"><small>Observação</small><b>${esc(v.observacao)}</b></div>` : ''}</div></div>
            <div class="rz-group rz-group-t"><span>Histórico</span><b>${hist.length}</b></div><div class="rz-card rz-list">${hist.map(h => `<div class="rz-row"><div class="rz-ic"><i data-lucide="history"></i></div>
                <div class="rz-tx"><b>${esc(ACAO[h.acao] || h.acao)}</b><span>${new Date(h.criado_em).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</span></div></div>`).join('') || '<p class="rz-desc" style="margin:8px 2px">Sem histórico.</p>'}</div>`,
        itens: `<div class="rz-card rz-list">${itens.map(i => `<div class="rz-row"><div class="rz-ic"><i data-lucide="package"></i></div>
                <div class="rz-tx"><b>${esc(i.descricao)}</b><span>${Number(i.quantidade).toLocaleString('pt-BR')} ${esc(i.unidade)} × ${moeda(i.preco_unitario)}${Number(i.desconto_pct) > 0 ? ` · −${Number(i.desconto_pct).toLocaleString('pt-BR')}%` : ''}${i.custo_unitario != null ? ` · custo ${moeda(i.custo_unitario)}` : ''}</span></div>
                <div class="rz-rt"><b>${moeda(i.valor_total)}</b></div></div>`).join('')}
            ${Number(v.entrega_valor_cobrado) > 0 ? `<div class="rz-row"><div class="rz-ic"><i data-lucide="truck"></i></div><div class="rz-tx"><b>Frete cobrado</b></div><div class="rz-rt"><b>${moeda(v.entrega_valor_cobrado)}</b></div></div>` : ''}
            <div class="rz-row"><div class="rz-tx"><b>Total</b>${v.desconto_pct > 0 ? `<span>com ${Number(v.desconto_pct).toLocaleString('pt-BR')}% de desconto no pedido</span>` : ''}</div><div class="rz-rt"><b>${moeda(v.valor_total)}</b></div></div></div>`,
        financeiro: `<div class="rz-card rz-list">${lanc.filter(l => l.direcao === 'entrada').map(l => `<div class="rz-row"><div class="rz-ic"><i data-lucide="arrow-down-left"></i></div>
                <div class="rz-tx"><b>Parcela ${l.parcela || 1}/${v.parcelas}</b><span>${l.status === 'realizado' ? 'recebida em ' + dataBR(l.data_pagamento || l.vencimento) : 'vence ' + dataBR(l.vencimento)} · ${esc(FORMAS[l.forma_pagamento] || '')}</span></div>
                <div class="rz-rt"><b>${moeda(l.valor)}</b><span class="rz-st ${l.status === 'realizado' ? 'rz-ok' : l.vencimento < hoje() ? 'rz-warn' : 'rz-neu'}">${l.status === 'realizado' ? 'Recebida' : l.vencimento < hoje() ? 'Em atraso' : 'Prevista'}</span></div></div>`).join('')
            || `<p class="rz-desc" style="margin:8px 2px">${v.status === 'rascunho' ? 'As parcelas entram no Financeiro quando o pedido for confirmado.' : 'Sem parcelas (valor zero).'}</p>`}</div>
            ${lanc.length ? '<p class="rz-desc" style="margin:8px 4px 0">A baixa da parcela é feita no Financeiro, como qualquer recebimento.</p>' : ''}`,
        entrega: `<div class="rz-card"><div class="rz-kv">${kv('Tipo', esc(TIPO_ENTREGA[v.entrega_tipo] || v.entrega_tipo))}${kv('Situação', esc(ENTREGA[v.entrega_status] || v.entrega_status))}${kv('Prevista', dataBR(v.entrega_prevista))}
            ${kv('Transportadora', esc(v.transp?.nome || '—'))}${kv('Frete cobrado', moeda(v.entrega_valor_cobrado))}${kv('Frete pago', moeda(v.entrega_custo))}
            <div class="rz-full"><small>Endereço</small><b>${esc(endTxt || (v.entrega_tipo === 'retirada' ? 'Retirada no local' : '—'))}</b></div>
            ${end.referencia ? `<div class="rz-full"><small>Referência</small><b>${esc(end.referencia)}</b></div>` : ''}</div></div>`,
        partes: `<div class="rz-card rz-list">${partes.map(p => `<div class="rz-row"><div class="rz-ic"><i data-lucide="${p.papel === 'comprador' ? 'user-round' : p.papel === 'pagador' ? 'wallet' : p.papel === 'vendedor' ? 'briefcase' : 'map-pin'}"></i></div>
                <div class="rz-tx"><b>${esc(p.partes?.nome || '—')}</b><span>${esc(PAPEIS[p.papel] || p.papel)}</span></div></div>`).join('')}
            ${v.transp ? `<div class="rz-row"><div class="rz-ic"><i data-lucide="truck"></i></div><div class="rz-tx"><b>${esc(v.transp.nome)}</b><span>Transportadora</span></div></div>` : ''}</div>
            ${v.status === 'rascunho' ? '<p class="rz-desc" style="margin:8px 4px 0">Pagador, quem recebe a entrega e vendedor entram no ⋮ › Editar pedido.</p>' : ''}`,
    };
    const abas = [['resumo', 'Resumo'], ['itens', `Itens <span class="rz-n">${itens.length}</span>`], ['financeiro', 'Financeiro'], ['entrega', 'Entrega'], ['partes', 'Partes']];
    const sh = abrirSheet(`${cabecalho(`${titulo(v)} · ${v.comprador?.nome || 'cliente'}`, `${esc(v.ativo?.nome_exibicao || '')} · <span class="rz-st ${c}">${esc(s)}</span>`, true)}
        <div class="rz-sh-b"><div class="rz-kpis" style="grid-template-columns:repeat(3,1fr)"><div class="rz-kpi"><small>Total</small><b>${moeda(v.valor_total)}</b></div>
            <div class="rz-kpi"><small>Recebido</small><b>${moeda(recebido)}</b></div><div class="rz-kpi"><small>Entrega</small><b>${v.entrega_status === 'entregue' ? 'Entregue' : dataBR(v.entrega_prevista)}</b></div></div>
        <div class="rz-chips">${abas.map(([k, r]) => `<button type="button" class="rz-chip${k === aba ? ' rz-on' : ''}" data-pd-aba="${k}">${r}</button>`).join('')}</div>
        <div data-pd-corpo>${corpos[aba]}</div></div>`, { classe: 'rz-cheio' });
    sh.querySelectorAll('[data-pd-aba]').forEach(b => b.addEventListener('click', () => {
        sh.querySelectorAll('[data-pd-aba]').forEach(x => x.classList.toggle('rz-on', x === b));
        sh.querySelector('[data-pd-corpo]').innerHTML = corpos[b.dataset.pdAba]; icones();
    }));
    const reabrir = (a2) => { ctx.aoMudar && ctx.aoMudar(); setTimeout(() => abrirPedido(id, ctx, a2 || aba), 120); };
    sh.querySelector('[data-pd-mais]')?.addEventListener('click', () => acoesPedido(v, itens, partes, ctx, reabrir));
    icones();
}

function acoesPedido(v, itens, partes, ctx, reabrir) {
    const rpc = async (fn, args, ok) => { const { data, error } = await dbAuth.rpc(fn, args); if (error || !data?.ok) { toast(data?.mensagem || error?.message || 'Não consegui.', 'erro'); return null; } toast(data.mensagem || ok, 'sucesso'); return data; };
    const entrega = (st) => rpc('fn_venda_salvar', { p_cliente_id: v.cliente_id, p_venda_id: v.id, p_venda: { entrega_status: st }, p_itens: [], p_canal: 'app' }).then(r => r && reabrir('entrega'));
    const acoes = [];
    if (v.status === 'rascunho') {
        acoes.push({ icone: 'check', titulo: 'Confirmar pedido', sub: v.valor_total > 0 ? `Gera ${v.parcelas} recebimento${v.parcelas > 1 ? 's' : ''} previsto${v.parcelas > 1 ? 's' : ''} no Financeiro` : 'Sem valor a receber', codigo: v.tipo === 'amostra' ? 'comercial.amostras' : 'comercial.vendas',
            aoTocar: () => rpc('fn_venda_confirmar', { p_venda_id: v.id, p_canal: 'app' }).then(r => r && reabrir('financeiro')) });
        acoes.push({ icone: 'pencil', titulo: 'Editar pedido', aoTocar: () => setTimeout(() => abrirFormPedido(ctx.ativo || { id: v.ativo_id, nome_exibicao: '' }, v, itens, partes, { aoMudar: () => reabrir() }), 60) });
    }
    if (v.status === 'confirmada' && v.entrega_status === 'pendente') acoes.push({ icone: 'truck', titulo: 'Marcar como enviado', aoTocar: () => entrega('enviada') });
    if (v.status === 'confirmada' && v.entrega_status !== 'entregue') acoes.push({ icone: 'package-check', titulo: 'Marcar como entregue', aoTocar: () => entrega('entregue') });
    if (v.tipo === 'amostra' && ['rascunho', 'confirmada'].includes(v.status)) acoes.push({ icone: 'repeat', titulo: 'Converter em pedido', sub: 'Copia os itens sem o desconto da amostra', codigo: 'comercial.amostras',
        aoTocar: () => rpc('fn_amostra_converter', { p_venda_id: v.id, p_canal: 'app' }).then(r => { if (r) { ctx.aoMudar && ctx.aoMudar(); setTimeout(() => abrirPedido(r.dados.id, ctx), 120); } }) });
    if (v.comprador?.whatsapp) acoes.push({ icone: 'message-circle', titulo: 'WhatsApp do comprador', aoTocar: () => window.open('https://wa.me/' + String(v.comprador.whatsapp).replace(/\D/g, ''), '_blank', 'noopener') });
    const fim = ['rascunho', 'confirmada'].includes(v.status) ? [{ icone: 'x-circle', tipo: 'bad', titulo: 'Cancelar pedido', sub: 'Tira as parcelas ainda não recebidas', aoTocar: () => setTimeout(() => cancelar(v, reabrir), 60) }] : [];
    abrirSheetAcoes({ titulo: titulo(v), sub: v.comprador?.nome || '', empilhar: true, grupos: [{ titulo: 'Pedido', acoes }, { titulo: '', acoes: fim }].filter(g => g.acoes.length) });
}

function cancelar(v, reabrir) {
    abrirSheetForm({ titulo: 'Cancelar ' + titulo(v), sub: v.comprador?.nome || '', rotuloSalvar: 'Cancelar pedido', empilhar: true,
        corpo: `<p class="rz-desc" style="margin:0 0 8px">As parcelas previstas saem do Financeiro. Parcela já recebida continua lá (você decide se devolve).</p>
            <div class="rz-f" style="margin-bottom:0"><label for="pd-motivo">Motivo</label><input type="text" id="pd-motivo" maxlength="160" placeholder="Ex.: cliente desistiu"></div>`,
        aoSalvar: async () => {
            const { data, error } = await dbAuth.rpc('fn_venda_cancelar', { p_venda_id: v.id, p_motivo: document.getElementById('pd-motivo')?.value || null, p_canal: 'app' });
            if (error || !data?.ok) { toast(data?.mensagem || error?.message || 'Não consegui cancelar.', 'erro'); return false; }
            toast(data.mensagem, 'sucesso'); setTimeout(() => reabrir('financeiro'), 80); return true;
        } });
}

// ---------------------------------------------------------------------
// Novo pedido / editar rascunho
// ---------------------------------------------------------------------
export function abrirNovoPedido(a, opcoes = {}) {
    if (!liberado(opcoes.tipo === 'amostra' ? 'comercial.amostras' : 'comercial.vendas')) { if (typeof window.rzMostrarBloqueio === 'function') window.rzMostrarBloqueio(opcoes.tipo === 'amostra' ? 'comercial.amostras' : 'comercial.vendas'); return; }
    return abrirFormPedido(a, { tipo: opcoes.tipo || 'venda', parte_id: opcoes.parteId || '', data: hoje() }, [], [], opcoes);
}

async function abrirFormPedido(a, v, itensIni, partesIni, opcoes = {}) {
    const [partes, cat, tabsAtivo] = await Promise.all([
        dbAuth.from('partes').select('id, nome').eq('cliente_id', cliente()).order('nome').limit(1000).then(r => r.data || []),
        dbAuth.rpc('fn_catalogo_itens_listar', { p_cliente_id: cliente(), p_busca: null, p_ativos_so: true }).then(r => r.data?.dados || []),
        a?.id ? dbAuth.from('vinculos').select('origem_id, vigencia_ate').eq('origem_tipo', 'catalogo_tabela').eq('papel', 'vende').eq('ativo_id', a.id).then(r => (r.data || []).filter(x => !x.vigencia_ate || x.vigencia_ate >= hoje()).map(x => x.origem_id)) : [],
    ]);
    // itens com preço numa tabela ativa no ativo primeiro; os demais ficam disponíveis (preço à mão)
    let comPreco = new Set();
    if (tabsAtivo.length) { const { data } = await dbAuth.from('catalogo_precos').select('item_id, vigencia_inicio, vigencia_fim').in('tabela_id', tabsAtivo);
        comPreco = new Set((data || []).filter(p => p.vigencia_inicio <= hoje() && (!p.vigencia_fim || p.vigencia_fim >= hoje())).map(p => p.item_id)); }
    const catOrd = [...cat.filter(i => comPreco.has(i.id)), ...cat.filter(i => !comPreco.has(i.id))];
    const st = { itens: (itensIni.length ? itensIni : [{}]).map(i => ({ item_id: i.item_id || '', descricao: i.descricao || '', quantidade: i.quantidade ?? 1, unidade: i.unidade || '',
        preco_unitario: i.preco_unitario ?? '', desconto_pct: i.desconto_pct ?? 0, custo_unitario: i.custo_unitario ?? '', custo_origem: i.custo_origem || '' })) };
    const extra = (papel) => (partesIni.find(p => p.papel === papel) || {}).parte_id || '';
    const end = v.entrega_endereco || {};
    const optPartes = (sel, vazio) => `<option value="">${vazio}</option>` + partes.map(p => `<option value="${p.id}"${p.id === sel ? ' selected' : ''}>${esc(p.nome)}</option>`).join('');
    const corpo = (el) => {
        el.innerHTML = `
            <div class="rz-f2 rz-f2-curto"><div class="rz-f"><label for="pf-tipo">Tipo</label><select id="pf-tipo"><option value="venda"${v.tipo !== 'amostra' ? ' selected' : ''}>Venda</option><option value="amostra"${v.tipo === 'amostra' ? ' selected' : ''}>Amostra</option></select></div>
                <div class="rz-f"><label for="pf-data">Data</label><input type="date" id="pf-data" value="${esc(v.data || hoje())}"></div></div>
            <div class="rz-f"><label for="pf-parte">Comprador <i>*</i></label><select id="pf-parte">${optPartes(v.parte_id, 'Escolha…')}</select></div>
            <div class="rz-group">Itens</div><div data-pf-itens></div>
            <button type="button" class="rz-add" data-pf-mais-item><i data-lucide="plus"></i>Mais um item</button>
            <div class="rz-f2 rz-f2-curto" style="margin-top:8px"><div class="rz-f"><label for="pf-desc">Desconto no pedido (%)</label><input type="number" id="pf-desc" min="0" max="100" step="0.01" value="${v.desconto_pct || 0}"></div>
                <div class="rz-f"><label for="pf-cond">Condição</label><input type="text" id="pf-cond" maxlength="40" value="${esc(v.condicao || '')}" placeholder="amostra, promocional…"></div></div>
            <div class="rz-group">Pagamento</div>
            <div class="rz-f2 rz-f2-curto"><div class="rz-f"><label for="pf-forma">Forma</label><select id="pf-forma"><option value="">A combinar</option>${Object.entries(FORMAS).map(([k, r]) => `<option value="${k}"${v.forma_pagamento === k ? ' selected' : ''}>${r}</option>`).join('')}</select></div>
                <div class="rz-f"><label for="pf-parc">Parcelas</label><input type="number" id="pf-parc" min="1" max="60" value="${v.parcelas || 1}"></div></div>
            <div class="rz-f2 rz-f2-curto"><div class="rz-f"><label for="pf-venc">1º vencimento</label><input type="date" id="pf-venc" value="${esc(v.primeiro_vencimento || '')}"></div>
                <div class="rz-f"><label for="pf-int">A cada (dias)</label><input type="number" id="pf-int" min="1" value="${v.intervalo_dias || 30}"></div></div>
            <div class="rz-group">Entrega</div>
            <div class="rz-f2 rz-f2-curto"><div class="rz-f"><label for="pf-etipo">Tipo</label><select id="pf-etipo">${Object.entries(TIPO_ENTREGA).map(([k, r]) => `<option value="${k}"${(v.entrega_tipo || 'retirada') === k ? ' selected' : ''}>${r}</option>`).join('')}</select></div>
                <div class="rz-f"><label for="pf-eprev">Prevista</label><input type="date" id="pf-eprev" value="${esc(v.entrega_prevista || '')}"></div></div>
            <div data-pf-end>
                <div class="rz-f"><label for="pf-rua">Rua e número</label><input type="text" id="pf-rua" value="${esc([end.rua, end.numero].filter(Boolean).join(', '))}"></div>
                <div class="rz-f2 rz-f2-curto"><div class="rz-f"><label for="pf-bairro">Bairro</label><input type="text" id="pf-bairro" value="${esc(end.bairro || '')}"></div>
                    <div class="rz-f"><label for="pf-cid">Cidade/UF</label><input type="text" id="pf-cid" value="${esc([end.cidade, end.uf].filter(Boolean).join('/'))}"></div></div>
                <div class="rz-f2 rz-f2-curto"><div class="rz-f"><label for="pf-cep">CEP</label><input type="text" id="pf-cep" value="${esc(end.cep || '')}"></div>
                    <div class="rz-f"><label for="pf-ref">Referência</label><input type="text" id="pf-ref" value="${esc(end.referencia || '')}" placeholder="Ex.: galpão azul"></div></div>
                <p class="rz-desc" data-pf-end-origem style="margin:-4px 0 8px"></p></div>
            <div class="rz-f2 rz-f2-curto"><div class="rz-f"><label for="pf-fcob">Frete cobrado</label><input type="number" id="pf-fcob" min="0" step="0.01" value="${v.entrega_valor_cobrado || 0}"></div>
                <div class="rz-f"><label for="pf-fpag">Frete pago (custo)</label><input type="number" id="pf-fpag" min="0" step="0.01" value="${v.entrega_custo || 0}"></div></div>
            <div class="rz-f"><label for="pf-transp">Transportadora</label><select id="pf-transp">${optPartes(v.entrega_parte_id || '', '—')}</select></div>
            <div class="rz-group">Outras partes</div>
            <div class="rz-f"><label for="pf-pag">Pagador (se não for o comprador)</label><select id="pf-pag">${optPartes(extra('pagador'), '—')}</select></div>
            <div class="rz-f2 rz-f2-curto"><div class="rz-f"><label for="pf-rec">Recebe a entrega</label><select id="pf-rec">${optPartes(extra('recebe_entrega'), '—')}</select></div>
                <div class="rz-f"><label for="pf-vend">Vendedor</label><select id="pf-vend">${optPartes(extra('vendedor'), '—')}</select></div></div>
            <div class="rz-f" style="margin-bottom:0"><label for="pf-obs">Observação</label><textarea id="pf-obs" rows="2" maxlength="600">${esc(v.observacao || '')}</textarea></div>
            <p class="rz-desc" data-pf-total style="margin:10px 0 0"></p>`;
        desenharItens(el);
        el.querySelector('[data-pf-mais-item]').addEventListener('click', () => { lerItens(el); st.itens.push({ quantidade: 1, desconto_pct: 0 }); desenharItens(el); });
        el.querySelector('#pf-parte').addEventListener('change', (ev) => sugerirEntrega(el, ev.target.value));
        ['#pf-desc', '#pf-fcob'].forEach(s => el.querySelector(s).addEventListener('input', () => { lerItens(el); total(el); }));
        if (v.parte_id && !v.id) sugerirEntrega(el, v.parte_id);
    };
    const desenharItens = (el) => {
        const box = el.querySelector('[data-pf-itens]');
        box.innerHTML = st.itens.map((i, k) => `<div class="rz-card" style="margin-bottom:8px;padding:10px" data-pf-linha="${k}">
            <div class="rz-f"><label>Item</label><select data-pf-item>${'<option value="">Fora do catálogo…</option>' + catOrd.map(c => `<option value="${c.id}"${c.id === i.item_id ? ' selected' : ''}>${esc(c.nome)} · ${esc(c.unidade)}${comPreco.has(c.id) ? '' : ' (sem preço aqui)'}</option>`).join('')}</select></div>
            <div class="rz-f"><label>Descrição</label><input type="text" data-pf-descr maxlength="200" value="${esc(i.descricao || '')}"${i.item_id ? ' readonly' : ''}></div>
            <div class="rz-f2 rz-f2-curto"><div class="rz-f"><label>Quantidade</label><input type="number" data-pf-qtd min="0" step="any" value="${esc(i.quantidade ?? 1)}"></div>
                <div class="rz-f"><label>Preço unitário</label><input type="number" data-pf-pu min="0" step="0.01" value="${esc(i.preco_unitario ?? '')}"></div></div>
            <div class="rz-f2 rz-f2-curto"><div class="rz-f"><label>Desconto (%)</label><input type="number" data-pf-dp min="0" max="100" step="0.01" value="${esc(i.desconto_pct ?? 0)}"></div>
                <div class="rz-f"><label>Custo unitário</label><input type="number" data-pf-cu min="0" step="0.0001" value="${esc(i.custo_unitario ?? '')}" placeholder="opcional"></div></div>
            <p class="rz-desc" data-pf-sug style="margin:0">${i.sug || ''}</p>
            ${st.itens.length > 1 ? '<button type="button" class="rz-btn rz-btn-3 rz-sm" data-pf-tira>Tirar item</button>' : ''}</div>`).join('');
        box.querySelectorAll('[data-pf-linha]').forEach(row => {
            const k = Number(row.dataset.pfLinha);
            // v1.1.0 — escolher o item não redesenha a linha (os campos ficavam mudando de lugar e o que se digitava caía no desconto):
            // a descrição fica sempre no lugar (só leitura com item do catálogo) e preço, custo e sugestão são preenchidos no próprio campo
            row.querySelector('[data-pf-item]').addEventListener('change', async (ev) => {
                lerItens(el); const i = st.itens[k]; i.item_id = ev.target.value; i.custo_origem = '';
                const d = row.querySelector('[data-pf-descr]'), c = cat.find(x => x.id === i.item_id);
                d.readOnly = !!i.item_id; if (c) { d.value = c.nome; i.descricao = c.nome; } else if (!i.item_id) { d.value = ''; i.descricao = ''; }
                await sugerirPreco(k);
                if (st.itens[k] !== i) return;
                row.querySelector('[data-pf-pu]').value = i.preco_unitario ?? ''; row.querySelector('[data-pf-cu]').value = i.custo_unitario ?? '';
                row.querySelector('[data-pf-sug]').innerHTML = i.sug || ''; total(el);
            });
            row.querySelectorAll('input').forEach(inp => inp.addEventListener('input', () => { lerItens(el); total(el); }));
            row.querySelector('[data-pf-cu]').addEventListener('change', () => { if (st.itens[k].custo_origem === 'sistema') st.itens[k].custo_origem = 'corrigido'; });
            row.querySelector('[data-pf-tira]')?.addEventListener('click', () => { lerItens(el); st.itens.splice(k, 1); desenharItens(el); });
        });
        total(el); icones();
    };
    const lerItens = (el) => el.querySelectorAll('[data-pf-linha]').forEach(row => {
        const i = st.itens[Number(row.dataset.pfLinha)]; if (!i) return;
        i.item_id = row.querySelector('[data-pf-item]').value; i.descricao = row.querySelector('[data-pf-descr]').value;
        i.quantidade = row.querySelector('[data-pf-qtd]').value; i.preco_unitario = row.querySelector('[data-pf-pu]').value;
        i.desconto_pct = row.querySelector('[data-pf-dp]').value; i.custo_unitario = row.querySelector('[data-pf-cu]').value;
    });
    const sugerirPreco = async (k) => {
        const i = st.itens[k]; if (!i.item_id) { i.sug = ''; return; }
        const c = cat.find(x => x.id === i.item_id); i.unidade = c?.unidade || '';
        const parte = document.getElementById('pf-parte')?.value || null;
        const [p, cu] = await Promise.all([
            dbAuth.rpc('fn_catalogo_preco_sugerido', { p_item_id: i.item_id, p_parte_id: parte, p_quantidade: Number(i.quantidade || 1), p_data: document.getElementById('pf-data')?.value || hoje(), p_ativo_id: a?.id || null }).then(r => r.data),
            dbAuth.rpc('fn_venda_custo_sugerido', { p_item_id: i.item_id, p_ciclo_id: null, p_ativo_fase_id: null }).then(r => r.data),
        ]);
        const ORIG = { comprador: 'preço do cliente', volume: 'preço por volume', tabela: 'preço da tabela' };
        if (p?.dados) { i.preco_unitario = p.dados.preco; i.sug = `Sugerido: ${ORIG[p.dados.origem] || ''} · ${esc(p.dados.tabela || '')}`; } else i.sug = 'Sem preço nas tabelas ativas deste ativo — informe à mão.';
        if (cu?.dados && (i.custo_unitario === '' || i.custo_unitario == null)) { i.custo_unitario = cu.dados.custo_unitario; i.custo_origem = 'sistema'; }
    };
    const total = (el) => {
        const soma = st.itens.reduce((t, i) => t + Math.round(Number(i.quantidade || 0) * Number(i.preco_unitario || 0) * (1 - Number(i.desconto_pct || 0) / 100) * 100) / 100, 0);
        const tot = Math.round(soma * (1 - Number(el.querySelector('#pf-desc')?.value || 0) / 100) * 100) / 100 + Number(el.querySelector('#pf-fcob')?.value || 0);
        const t = el.querySelector('[data-pf-total]'); if (t) t.innerHTML = `Total estimado: <b>${moeda(tot)}</b> (o valor final é calculado ao salvar)`;
    };
    const sugerirEntrega = async (el, parteId) => {
        if (!parteId) return;
        const { data } = await dbAuth.rpc('fn_venda_entrega_sugerida', { p_cliente_id: cliente(), p_parte_id: parteId });
        const e = data?.dados?.endereco; if (!e) return;
        const set = (id, val) => { const x = el.querySelector(id); if (x && !x.value) x.value = val || ''; };
        set('#pf-rua', [e.rua, e.numero].filter(Boolean).join(', ')); set('#pf-bairro', e.bairro); set('#pf-cid', [e.cidade, e.uf].filter(Boolean).join('/')); set('#pf-cep', e.cep); set('#pf-ref', e.referencia);
        const o = el.querySelector('[data-pf-end-origem]'); if (o) o.textContent = data.dados.origem === 'ultimo_pedido' ? 'Endereço do último pedido deste comprador.' : 'Endereço do cadastro do comprador.';
    };
    abrirSheetForm({ titulo: v.id ? 'Editar ' + titulo(v) : (v.tipo === 'amostra' ? 'Nova amostra' : 'Novo pedido'), sub: a?.nome_exibicao || '', rotuloSalvar: 'Salvar rascunho', empilhar: !!opcoes.empilhar, corpo,
        aoSalvar: async (el) => {
            lerItens(el);
            const val = (id) => el.querySelector(id)?.value ?? '';
            if (!val('#pf-parte')) { toast('Escolha o comprador.', 'erro'); return false; }
            const itens = st.itens.filter(i => i.item_id || (i.descricao || '').trim()).map(i => ({ item_id: i.item_id || null, descricao: (i.descricao || '').trim(), quantidade: Number(i.quantidade),
                unidade: i.unidade || '', preco_unitario: Number(i.preco_unitario), desconto_pct: Number(i.desconto_pct || 0),
                custo_unitario: i.custo_unitario === '' || i.custo_unitario == null ? null : Number(i.custo_unitario), custo_origem: i.custo_origem || (i.custo_unitario !== '' && i.custo_unitario != null ? 'manual' : null) }));
            if (!itens.length) { toast('Inclua ao menos um item.', 'erro'); return false; }
            if (itens.some(i => !(i.quantidade > 0) || isNaN(i.preco_unitario))) { toast('Cada item precisa de quantidade e preço.', 'erro'); return false; }
            const [rua, numero] = val('#pf-rua').split(/,\s*/); const [cidade, uf] = val('#pf-cid').split('/');
            const endereco = val('#pf-etipo') === 'retirada' && !val('#pf-rua') ? null : { rua: rua || '', numero: numero || '', bairro: val('#pf-bairro'), cidade: (cidade || '').trim(), uf: (uf || '').trim(), cep: val('#pf-cep'), referencia: val('#pf-ref') };
            const partesExtra = [['pagador', '#pf-pag'], ['recebe_entrega', '#pf-rec'], ['vendedor', '#pf-vend']].filter(([, s]) => val(s)).map(([papel, s]) => ({ papel, parte_id: val(s) }));
            const venda = { tipo: val('#pf-tipo'), parte_id: val('#pf-parte'), data: val('#pf-data'), ativo_id: a?.id || v.ativo_id || null, forma_pagamento: val('#pf-forma'),
                parcelas: Number(val('#pf-parc') || 1), primeiro_vencimento: val('#pf-venc'), intervalo_dias: Number(val('#pf-int') || 30), desconto_pct: Number(val('#pf-desc') || 0),
                condicao: val('#pf-cond'), entrega_tipo: val('#pf-etipo'), entrega_prevista: val('#pf-eprev'), entrega_endereco: endereco, entrega_valor_cobrado: Number(val('#pf-fcob') || 0),
                entrega_custo: Number(val('#pf-fpag') || 0), entrega_parte_id: val('#pf-transp'), observacao: val('#pf-obs'), partes: partesExtra };
            const { data, error } = await dbAuth.rpc('fn_venda_salvar', { p_cliente_id: cliente(), p_venda: venda, p_itens: itens, p_venda_id: v.id || null, p_canal: 'app' });
            if (error || !data?.ok) { toast(data?.mensagem || error?.message || 'Não consegui salvar o pedido.', 'erro'); return false; }
            toast(data.mensagem, 'sucesso');
            opcoes.aoMudar && opcoes.aoMudar();
            setTimeout(() => abrirPedido(data.dados.id, { ativo: a, aoMudar: opcoes.aoMudar }), 120);
            return true;
        } });
    // pré-carrega a sugestão dos itens que vieram prontos (edição)
}
