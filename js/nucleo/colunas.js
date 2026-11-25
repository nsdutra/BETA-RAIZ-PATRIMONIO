// ============================================================================
// nucleo/colunas.js — Raiz Patrimônio · Núcleo de plataforma · colunas no padrão executivo (REGRAS §18.1)
// Versão: 1.0.0 · 25/11/2026
//
// v1.0.0 (25/11/2026, sessão 20261125-0000-investimentos-i0, demandas e5d269c2 e fd3898f7; PLANO_EXECUCAO_I0_CARD_VALOR_DO_BEM_RAIZ
// v1.0.0, de acordo do Nicola 24/11 23:59 "Pode fazer") — criação. O desenho de colunas que vivia preso dentro do resultados.js
// (colunasExecutivasSvg, v2.4.0, dem f0ab422d) passa a ser comum: o Resultado mês a mês e o card Valor do bem (cofre-ativos.js)
// desenham com a mesma função. Ganha rótulos livres (meses de anos diferentes, anos) e dois estados de coluna:
//   · estimado (rz-col-est): o período repete o último valor conhecido;
//   · projeção (rz-col-proj): contorno tracejado — usada a partir da I1 (aplicação com indexador); imóvel não tem (D5).
// O que NÃO muda: zero na base, sem eixo e sem grade, valor em cima na unidade da linha de baixo, cinza com um destaque só.
// ============================================================================
export const VERSAO = '1.0.0';

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// computador (≥ 1024 px com o Hoje em colunas): o gráfico desenha mais largo; o texto fica na escala do app
export const rzDesk = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(min-width:1024px)').matches;

// Unidade da linha de baixo: R$ mi com 1 casa; R$ mil sem casa (com 1 casa abaixo de 10 mil)
export function unidadeColunas(valores) {
    const maxAbs = Math.max(0, ...valores.map(v => Math.abs(v)));
    if (maxAbs >= 1e6) return { div: 1e6, casas: 1, rotulo: 'R$ mi' };
    return { div: 1e3, casas: maxAbs >= 1e4 ? 0 : 1, rotulo: 'R$ mil' };
}
export function numeroNaUnidade(v, u) {
    const x = v / u.div;
    const casas = u.casas === 0 && Math.abs(x) < 1 ? 1 : u.casas; // −729 em R$ mil vira −0,7, nunca −1
    const s = Math.abs(x).toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });
    return (x < 0 ? '−' : '') + s;
}
// "R$ 748 mil" / "R$ 1,2 mi" — para a frase-conclusão
export function valorNaUnidade(v, u) {
    return `R$ ${numeroNaUnidade(v, u)} ${u.rotulo === 'R$ mi' ? 'mi' : 'mil'}`;
}

/**
 * Colunas no padrão executivo.
 * @param {number[]} valores
 * @param {object} o
 *   rotulos        texto embaixo de cada coluna (obrigatório)
 *   unidade        de unidadeColunas(valores)
 *   destaque       índice da coluna em --pine (uma só)
 *   alerta         índice da coluna em --warning
 *   estados        por coluna: 'real' (padrão) | 'est' | 'proj'
 *   futuroAPartir  rótulos deste índice em diante ficam apagados (mês que ainda não chegou)
 *   classeBarra    classe do <g> de cada coluna (toque)
 *   dados          (i) => atributos extras do <g> (padrão data-i="i")
 *   rotuloAria     texto para leitor de tela
 */
export function colunasSvg(valores, { rotulos = [], unidade, destaque = -1, alerta = -1, estados = null, futuroAPartir = Infinity,
    classeBarra = '', dados = null, rotuloAria = '' } = {}) {
    const n = valores.length || 1;
    const W = rzDesk() ? 360 : 320, TOPO = 16, AREA = 112, BAIXO = 14, MES = 14;
    const max = Math.max(0, ...valores), min = Math.min(0, ...valores);
    const faixa = (max - min) || 1;
    const yZero = TOPO + AREA * (max / faixa);
    const H = TOPO + AREA + BAIXO + MES;
    const passo = W / n, larg = Math.min(passo * 0.62, 36);
    const colunas = valores.map((v, i) => {
        const cx = i * passo + passo / 2;
        const h = Math.max(Math.abs(v) / faixa * AREA, v ? 1.5 : 0);
        const y = v >= 0 ? yZero - h : yZero;
        const est = estados ? estados[i] : 'real';
        const cls = v < 0 ? 'rz-col-neg' : i === alerta ? 'rz-col-warn' : i === destaque ? 'rz-col-hl'
            : est === 'proj' ? 'rz-col-proj' : est === 'est' ? 'rz-col-est' : 'rz-col';
        const barra = v ? `<rect class="${cls}" x="${(cx - larg / 2).toFixed(1)}" y="${y.toFixed(1)}" width="${larg.toFixed(1)}" height="${h.toFixed(1)}" rx="2"/>` : '';
        const valor = v ? `<text class="rz-col-v${v < 0 ? ' rz-col-v-neg' : ''}" x="${cx.toFixed(1)}" y="${(v >= 0 ? y - 4 : y + h + 11).toFixed(1)}" text-anchor="middle">${numeroNaUnidade(v, unidade)}</text>` : '';
        const rot = `<text class="rz-col-m${i >= futuroAPartir || est === 'proj' ? ' rz-col-fut' : ''}" x="${cx.toFixed(1)}" y="${H - 3}" text-anchor="middle">${esc(rotulos[i] ?? '')}</text>`;
        const alvo = `<rect class="rz-col-alvo" x="${(i * passo).toFixed(1)}" y="0" width="${passo.toFixed(1)}" height="${H}"/>`;
        const attrs = dados ? dados(i) : `data-i="${i}"`;
        return `<g${classeBarra ? ` class="${classeBarra}"` : ''} ${attrs}>${barra}${valor}${rot}${alvo}</g>`;
    }).join('');
    return `<svg class="rz-cols" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(rotuloAria)}"><line class="rz-col-base" x1="0" x2="${W}" y1="${yZero.toFixed(1)}" y2="${yZero.toFixed(1)}"/>${colunas}</svg>`;
}

// Legenda só com os estados que aparecem (REGRAS §18 regra 3: rótulo direto, cor nunca é a única pista)
export function legendaColunas(estados = []) {
    const temEst = estados.includes('est'), temProj = estados.includes('proj');
    if (!temEst && !temProj) return '';
    return `<div class="rz-cols-leg">${temEst ? '<span><i class="rz-cols-leg-est"></i>estimado (repete o último valor)</span>' : ''}${temProj ? '<span><i class="rz-cols-leg-proj"></i>projeção</span>' : ''}</div>`;
}
