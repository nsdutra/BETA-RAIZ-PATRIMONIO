// ============================================================================
// financeiro-resumo.js — Raiz Patrimônio · Financeiro › Resumo: o mês em linhas, com o % de cada linha
// Versão: 1.1.0 · 18/11/2026
//
// v1.1.0 (18/11/2026, sessão 20261118-1440-financeiro-lente, demanda 679b2700; FICHA_REVISAO_FINANCEIRO_RAIZ v1.0.0 Onda 5 · fatia 5a, LEVANTAMENTO_LENTE_MULTI_RAMO_RAIZ v1.0.0, de acordo do Nicola 18/11 14:36) — p_ramos com a lista de ramos marcados na lente (fn_financeiro_resumo_mes já aceita a lista;
//   lançamento sem ativo só entra com todos os ramos). Versão anterior: 1.0.0
//
// v1.0.0 (17/11/2026, sessão 20261117-1540-financeiro-resumo, demanda 679b2700; FICHA_REVISAO_FINANCEIRO_RAIZ v1.0.0, Onda 3,
// decisão D2; de acordo do Nicola 16/11 23:44 e "vamos em frente" 17/11 15:33; protótipo PROTOTIPO_FINANCEIRO_REVISAO_RAIZ
// v1.4.0, aba Resumo) — criação. A primeira aba do Financeiro:
//   · Caixa (o que entrou e saiu) · Competência (o que era do mês, com o em atraso);
//   · as linhas, em ordem: Receitas, Despesas, Resultado da operação, Investimento, Financiamento, Resultado do mês, Sócios e
//     Ficou no caixa (Caixa) ou Resultado retido (Competência). Sócios = retiradas (regulares e extraordinárias) e as despesas
//     de natureza pessoal;
//   · uma coluna de %: sobre as receitas (sem receita no recorte, sobre o que entrou); nas linhas abertas, a parte no grupo;
//   · cada linha abre as categorias. Sem frases repetindo os números (D2).
// Os números vêm do banco (fn_financeiro_resumo_mes, F3), com a mesma base de Recebimentos e Saídas; o módulo só soma as
// linhas que o banco devolve para desenhar os grupos. A lente de ramos de hoje (um ramo ou todos) é respeitada.
// ============================================================================
export const VERSAO = '1.1.0';

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = (v) => Number(v) || 0;
const moeda = (v) => 'R$ ' + Math.abs(num(v)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const sinal = (v) => (num(v) < -0.004 ? '− ' : '') + moeda(v);
const pct = (v, base) => base ? (Math.round(Math.abs(num(v)) / base * 1000) / 10).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%' : '—';
const icones = () => { if (typeof lucide !== 'undefined') lucide.createIcons(); };

let visao = 'caixa';           // 'caixa' | 'competencia'
const abertos = new Set();     // grupos abertos
let ultimoPedido = 0;

const GRUPOS = [
    { k: 'rec', rotulo: 'Receitas', pega: (l) => l.natureza === 'operacao' && l.direcao === 'entrada' },
    { k: 'desp', rotulo: 'Despesas', pega: (l) => l.natureza === 'operacao' && l.direcao === 'saida' },
    { sub: 'Resultado da operação' },
    { k: 'inv', rotulo: 'Investimento', pega: (l) => l.natureza === 'investimento' },
    { k: 'fin', rotulo: 'Financiamento', pega: (l) => l.natureza === 'financiamento' },
    { sub: 'Resultado do mês' },
    { k: 'soc', rotulo: 'Sócios', pega: (l) => l.natureza === 'socios' || l.natureza === 'pessoal' },
];

/**
 * Desenha a aba Resumo. ctx: { el, dbAuth, clienteId, competencia ('AAAA-MM-01'), ramo ('tudo' ou código), ramos (2+ códigos ou null), nomeRamo, contaId }.
 */
export async function resumoRender(ctx) {
    const el = ctx.el;
    if (!el) return;
    const pedido = ++ultimoPedido;
    el.innerHTML = '<p class="rz-desc" style="text-align:center;padding:16px 0">Carregando…</p>';
    let linhas = [];
    try {
        const { data, error } = await ctx.dbAuth.rpc('fn_financeiro_resumo_mes', {
            p_cliente_id: ctx.clienteId, p_competencia: ctx.competencia, p_visao: visao,
            p_ramos: ctx.ramos || (ctx.ramo && ctx.ramo !== 'tudo' ? [ctx.ramo] : null), p_conta_id: ctx.contaId || null, // v1.1.0 — 2+ ramos
        });
        if (error) throw error;
        linhas = (data || []).map(l => ({ ...l, valor: num(l.valor), em_atraso: num(l.em_atraso) }));
    } catch (e) {
        if (pedido !== ultimoPedido) return;
        el.innerHTML = `<div class="rz-card"><p class="rz-desc">Não consegui montar o resumo: ${esc(e.message || e)}</p></div>`;
        return;
    }
    if (pedido !== ultimoPedido) return;
    desenhar(ctx, linhas);
}

function desenhar(ctx, linhas) {
    const el = ctx.el;
    // valor com sinal: entrada soma, saída subtrai
    const comSinal = (l) => (l.direcao === 'entrada' ? 1 : -1) * l.valor;
    const blocos = GRUPOS.map(g => g.sub ? g : { ...g, itens: linhas.filter(g.pega) }).map(g => g.sub ? g : { ...g, total: g.itens.reduce((t, l) => t + comSinal(l), 0) });
    const receitas = blocos.find(b => b.k === 'rec').total;
    const entradas = linhas.filter(l => l.direcao === 'entrada').reduce((t, l) => t + l.valor, 0);
    const base = Math.abs(receitas) || entradas;
    let acc = 0;
    const linhasHtml = blocos.map(b => {
        if (b.sub) return `<div class="rz-res-l rz-res-sub"><span>${b.sub}</span><em>${pct(acc, base)}</em><b>${sinal(acc)}</b><i></i></div>`;
        if (!b.itens.length) return '';
        acc += b.total;
        const aberto = abertos.has(b.k);
        let h = `<button type="button" class="rz-res-l${aberto ? ' rz-on' : ''}" data-res-g="${b.k}" aria-expanded="${aberto}"><span>${b.rotulo}</span><em>${pct(b.total, base)}</em><b>${sinal(b.total)}</b><svg data-lucide="chevron-right"></svg></button>`;
        if (aberto) {
            // as categorias do grupo, somadas entre ramos; % é a parte no grupo
            const porCat = new Map();
            b.itens.forEach(l => { const k = l.categoria + '|' + l.direcao; const c = porCat.get(k) || { nome: l.categoria_nome, v: 0, atr: 0 }; c.v += comSinal(l); c.atr += l.em_atraso; porCat.set(k, c); });
            const cats = [...porCat.values()].sort((a, c) => Math.abs(c.v) - Math.abs(a.v));
            const totGrupo = cats.reduce((t, c) => t + Math.abs(c.v), 0);
            h += cats.map(c => `<div class="rz-res-l rz-res-f"><span>${esc(c.nome)}</span><em>${pct(c.v, totGrupo)}</em><b>${sinal(c.v)}</b><i></i></div>`).join('');
            if (b.k === 'rec' && visao === 'competencia') {
                const atr = b.itens.reduce((t, l) => t + l.em_atraso, 0);
                if (atr > 0.004) h += `<div class="rz-res-l rz-res-f rz-res-atr"><span>dos quais em atraso</span><em>${pct(atr, base)}</em><b>${moeda(atr)}</b><i></i></div>`;
            }
        }
        return h;
    }).join('');
    const fim = `<div class="rz-res-l rz-res-sub rz-res-fim"><span>${visao === 'caixa' ? 'Ficou no caixa' : 'Resultado retido'}</span><em>${pct(acc, base)}</em><b>${sinal(acc)}</b><i></i></div>`;
    const vazio = !linhas.length;
    el.innerHTML = `<div class="rz-chips rz-res-visao" role="group" aria-label="Visão">
            <button type="button" class="rz-chip${visao === 'caixa' ? ' rz-on' : ''}" data-res-v="caixa">Caixa</button>
            <button type="button" class="rz-chip${visao === 'competencia' ? ' rz-on' : ''}" data-res-v="competencia">Competência</button></div>
        <div class="rz-card rz-list rz-res">
            <div class="rz-card-h"><h3>${visao === 'caixa' ? 'O que entrou e saiu' : 'O que era do mês'}</h3><span class="rz-sub">${esc(ctx.nomeRamo || 'Todo o patrimônio')}</span></div>
            ${vazio ? '<p class="rz-desc" style="padding:4px 14px 14px">Nada lançado neste mês.</p>'
                : `<div class="rz-res-l rz-res-cab"><span></span><em>%</em><b></b><i></i></div>${linhasHtml}${fim}`}
        </div>
        ${vazio ? '' : '<p class="rz-res-nota">% sobre as receitas. Nas linhas abertas, % da parte no grupo.</p>'}`;
    el.querySelectorAll('[data-res-v]').forEach(b => b.addEventListener('click', () => {
        if (visao === b.dataset.resV) return;
        visao = b.dataset.resV;
        resumoRender(ctx);
    }));
    el.querySelectorAll('[data-res-g]').forEach(b => b.addEventListener('click', () => {
        const k = b.dataset.resG;
        if (abertos.has(k)) abertos.delete(k); else abertos.add(k);
        desenhar(ctx, linhas);
    }));
    icones();
}
