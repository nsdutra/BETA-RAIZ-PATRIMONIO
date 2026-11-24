// ============================================================================
// cartao-descobrir.js — Raiz Patrimônio · Fatura do cartão › "Descobrir o que é"
// Versão: 1.0.0 · 23/11/2026
//
// v1.0.0 (23/11/2026, sessão 20261123-2310-cartao-descobrir, demanda 1e32c5a1; FICHA_CARTAO_DESCOBRIR_COMPRA_RAIZ v1.1.0,
// peça E5; de acordo do Nicola 23/11 23:09) — criação. Na compra "A classificar", a ação "Descobrir o que é" abre por cima
// da fatura o resultado da Edge cartao-descobrir: o que parece ser (empresa, cidade, confiança, fontes), as pistas do
// próprio Raiz (dia, parcela, viagem/programa, compromisso, documento, compras parecidas) e as compras vizinhas a
// classificar, que a pessoa marca uma a uma. Confirmar grava pela mesma função de classificar da fatura (quem chama passa
// o gravar); autônomo (MEI) só pergunta o que foi o serviço. O módulo não decide nada: mostra o que a Edge e o banco mandam.
// ============================================================================
export const VERSAO = '1.0.0';

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const moeda = (v) => 'R$ ' + Math.abs(Number(v) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const dataBR = (iso) => { if (!iso) return ''; const [a, m, d] = String(iso).slice(0, 10).split('-'); return `${d}/${m}/${a}`; };
const dataCurta = (iso) => { if (!iso) return ''; const [, m, d] = String(iso).slice(0, 10).split('-'); return `${d}/${m}`; };
const g = (nome) => (typeof window !== 'undefined' && typeof window[nome] === 'function') ? window[nome] : null;
const icones = () => { if (typeof lucide !== 'undefined') lucide.createIcons(); };

/**
 * Abre "Descobrir o que é" para uma compra da fatura.
 * @param {object} item   compra da fn_fatura_listar ({ id, descricao, valor, compra })
 * @param {object} ctx    { nomeCat(codigo), gravar(ids, v) → Promise<boolean>, classificar() }
 */
export async function cartaoDescobrir(item, ctx) {
    const abrirSheet = g('abrirSheet'), cab = g('rzSheetCabecalho');
    if (!item || !abrirSheet || !cab) return;
    const titulo = cab('Descobrir o que é', `${item.descricao} · ${moeda(item.valor)}`);
    const sheet = abrirSheet(titulo + `<div class="rz-sh-b"><div class="rz-card"><div class="rz-empty"><div class="rz-ic rz-ia"><svg data-lucide="sparkles"></svg></div>
        <p>Procurando o que é esta compra…<br><small style="color:var(--muted)">Olho o que você já tem no Raiz e pesquiso o nome que aparece na fatura.</small></p></div></div></div>`, { empilhar: true });
    icones();
    let r;
    try {
        const { data, error } = await dbAuth.functions.invoke('cartao-descobrir', { body: { lancamento_id: item.id } });
        if (error) {
            let msg = error.message;
            try { const corpo = await error.context?.json?.(); if (corpo?.mensagem) msg = corpo.mensagem; } catch (_) { /* resposta sem corpo */ }
            throw new Error(msg);
        }
        if (!data?.ok) throw new Error(data?.mensagem || 'Não consegui pesquisar agora.');
        r = data;
    } catch (e) {
        const b = sheet.querySelector('.rz-sh-b');
        if (b) b.innerHTML = `<div class="rz-card"><div class="rz-empty"><div class="rz-ic"><svg data-lucide="alert-circle"></svg></div><p>${esc(e?.message || e)}</p></div></div>`;
        icones();
        return;
    }
    desenhar(sheet, item, r, ctx);
}

function pistasHtml(p) {
    const linhas = [];
    const dia = p.compra ? `${p.dia_semana}, ${dataBR(p.compra)}` : '';
    if (dia) linhas.push(['calendar', 'Dia da compra', dia + (p.valor_redondo ? ' · valor redondo' : '')]);
    if (p.parcela && p.parcela.n) linhas.push(['layers', 'Parcelada', `parcela ${p.parcela.n} de ${p.parcela.de}${p.parcela.n > 1 ? ' · a compra foi feita antes desta fatura' : ''}`]);
    (p.programas || []).forEach(x => linhas.push(['plane', 'Em andamento na data', `${x.nome} (${dataCurta(x.inicio)} a ${dataCurta(x.fim)})`]));
    (p.ciclos || []).forEach(x => linhas.push(['refresh-cw', 'Em andamento na data', `${x.nome}${x.inicio ? ' (desde ' + dataCurta(x.inicio) + ')' : ''}`]));
    (p.ocorrencias || []).forEach(x => linhas.push(['calendar-check', 'Na sua agenda', `${dataCurta(x.data)} · ${x.titulo}${x.descricao ? ' · ' + x.descricao : ''}`]));
    (p.documentos || []).forEach(x => linhas.push(['file-text', 'No Cofre', `${dataCurta(x.data)} · ${x.nome}`]));
    (p.parecidas || []).forEach(x => linhas.push(['history', 'Compra parecida', `${x.descricao} · ${x._cat || x.categoria}`]));
    if (!linhas.length) return '';
    return `<div class="rz-group">Pistas no Raiz</div><div class="rz-card rz-list">` + linhas.map(([ic, t, s]) =>
        `<div class="rz-row"><div class="rz-ic"><svg data-lucide="${ic}"></svg></div><div class="rz-tx"><b>${esc(t)}</b><span>${esc(s)}</span></div></div>`).join('') + '</div>';
}

function desenhar(sheet, item, r, ctx) {
    const h = r.hipotese || {}, p = r.pistas || {};
    const nomeCat = (c) => (ctx && typeof ctx.nomeCat === 'function' ? ctx.nomeCat(c) : c);
    (p.parecidas || []).forEach(x => { x._cat = nomeCat(x.categoria); });
    const autonomo = r.tipo === 'autonomo';
    const temCat = !autonomo && h.categoria;
    const quem = [h.empresa, h.cidade].filter(Boolean).join(' · ');
    const topo = `<div class="rz-card rz-list">
        <div class="rz-row"><div class="rz-ic rz-ia"><svg data-lucide="${autonomo ? 'user-round' : 'sparkles'}"></svg></div>
          <div class="rz-tx"><b>${esc(autonomo ? 'Pagamento a autônomo (MEI)' : (h.o_que_e ? 'Parece: ' + h.o_que_e : 'Não achei com segurança o que é'))}</b>
          <span>${esc(autonomo ? 'É uma pessoa, não uma loja: o Raiz não pesquisa pessoas na internet.' : (quem || 'Sem empresa identificada'))}${!autonomo && h.cnpj ? ' · CNPJ ' + esc(h.cnpj) : ''}</span></div>
          ${!autonomo && h.confianca ? `<div class="rz-rt"><span class="rz-ia-tag"><svg data-lucide="sparkles"></svg>${Math.round(h.confianca)}%</span></div>` : ''}</div>
        ${temCat ? `<div class="rz-row"><div class="rz-ic"><svg data-lucide="tag"></svg></div><div class="rz-tx"><b>Categoria sugerida</b><span>${esc(h.categoria_nome || nomeCat(h.categoria))}</span></div></div>` : ''}
      </div>
      ${h.pergunta ? `<p class="rz-desc" style="margin:8px 2px 4px">${esc(h.pergunta)}</p>` : ''}`;
    const viz = (p.vizinhas || []).filter(v => v.a_classificar);
    const vizHtml = temCat && viz.length ? `<div class="rz-group">Do mesmo dia ou do dia ao lado · marque as que são a mesma coisa</div><div class="rz-card rz-list">` +
        viz.map(v => `<label class="rz-row" style="cursor:pointer"><input type="checkbox" data-viz="${esc(v.id)}" style="width:20px;height:20px;flex:none;accent-color:var(--pine)">
            <div class="rz-tx"><b>${esc(v.descricao)}</b><span>${esc(dataBR(v.compra))}</span></div><div class="rz-rt"><b class="rz-out">− ${esc(moeda(v.valor))}</b></div></label>`).join('') + '</div>' : '';
    const outrasViz = (p.vizinhas || []).filter(v => !v.a_classificar);
    const vizInfo = outrasViz.length ? `<div class="rz-group">Já classificadas perto desta data</div><div class="rz-card rz-list">` +
        outrasViz.map(v => `<div class="rz-row"><div class="rz-tx"><b>${esc(v.descricao)}</b><span>${esc(dataBR(v.compra))} · ${esc(nomeCat(v.categoria))}</span></div></div>`).join('') + '</div>' : '';
    const fontes = !autonomo && (h.fontes || []).length ? `<details style="margin:10px 2px"><summary class="rz-hint" style="cursor:pointer">Fontes da pesquisa${r.cache ? ' (pesquisa recente reaproveitada)' : ''}</summary>
        <ul class="rz-hint" style="margin:6px 0 0 18px">${h.fontes.map(f => `<li>${esc(f)}</li>`).join('')}</ul></details>` : '';
    const b = sheet.querySelector('.rz-sh-b');
    if (b) b.innerHTML = topo + vizHtml + pistasHtml(p) + vizInfo + fontes;
    sheet.querySelector('.rz-sh-f')?.remove();
    sheet.insertAdjacentHTML('beforeend', `<div class="rz-sh-f">
        <button type="button" class="rz-btn rz-btn-2" data-cd-nao>${temCat ? 'Não é isso' : 'Fechar'}</button>
        <button type="button" class="rz-btn rz-btn-1" data-cd-sim>${temCat ? 'Confirmar' : 'Classificar'}</button></div>`);
    sheet.querySelector('[data-cd-nao]')?.addEventListener('click', () => g('fecharSheet')?.());
    sheet.querySelector('[data-cd-sim]')?.addEventListener('click', async (ev) => {
        const btn = ev.currentTarget;
        if (!temCat) { g('fecharSheet')?.(); if (ctx && typeof ctx.classificar === 'function') setTimeout(() => ctx.classificar(), 30); return; }
        const ids = [item.id, ...[...sheet.querySelectorAll('[data-viz]:checked')].map(el => el.dataset.viz)];
        btn.disabled = true;
        // a hipótese confirmada fica registrada (D3: o master decide no relatório do CIO o que vira regra geral)
        if (r.proposta_id) dbAuth.functions.invoke('cartao-descobrir', { body: { acao: 'confirmar', proposta_id: r.proposta_id, categoria: h.categoria } }).catch(() => {});
        g('fecharSheet')?.();
        const ok = ctx && typeof ctx.gravar === 'function' ? await ctx.gravar(ids, { categoria: h.categoria, ativo_id: null, parte_id: null, divisao: null, sempre_assim: false }) : false;
        if (!ok) btn.disabled = false;
    });
    icones();
}
