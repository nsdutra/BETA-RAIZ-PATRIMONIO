// ============================================================================
// relatorios-executivos.js — Raiz Patrimônio · Relatórios no modelo executivo
// Versão: 1.1.0 · 07/10/2026
//
// v1.1.0 (07/10/2026, sessão 20261007-0137-financeiro — P4b, B4): Visão gerencial mostra o reembolso
// de quem pagou despesa da própria conta (fn_apurar_distribuicao): passo "Reembolso" na cascata da
// capa, coluna "(+) Reembolso" no quadro por pessoa e nota explicando. Versão anterior: 1.0.1.
//
// v1.0.1 (07/10/2026, sessão 20261007-0137-financeiro — teste do Nicola 01:37): os
// filtros (período, conta) abriam POR TRÁS do relatório. A tela do relatório passa a
// ficar na camada 96, logo abaixo dos sheets (#rz-veil, 97). Versão anterior: 1.0.0.
//
// v1.0.0 (07/10/2026, sessão 20261007-0110-financeiro, demanda f3e6cd27 — P4b,
// fichas B3/B5 e decisões D35/D36 aprovadas pelo Nicola): renderizador único
// (tela e PDF pelo MESMO HTML, REL-37/38) dos relatórios no modelo executivo
// (PADRAO_RELATORIOS v1.2.0, REL-49 a REL-55): capa que responde sozinha
// (manchete-conclusão marcada "Leitura", 3 pontos-chave, 4 números, 2 gráficos
// com título-conclusão e fonte) e páginas de detalhe com rastreador de seção.
// Rodapé de toda página: nome do relatório, data e hora da geração e usuário
// (REL-10). Primeiros relatórios: Fluxo de caixa (relatorios.fluxo_caixa →
// fn_contas_fluxo_caixa) e Visão gerencial (relatorios.gerencial →
// fn_contas_visao_gerencial). Os números vêm prontos do banco (o mesmo modelo
// que o bot usa); aqui só se monta o texto e o desenho — nunca se recalcula
// (REL-02). Protótipo: raiz\docs\PROTOTIPO_RELATORIOS_FLUXO_GERENCIAL v1.1.0.
// ============================================================================
import { rzMostrarBloqueio } from './comum-licenca.js';
import { rzToast } from './raiz-ui.js';
import RaizDevice from './raiz-device.js';

export const VERSAO = '1.1.0';

// ---------------------------------------------------------------------------
// Formatos (REL-13 a REL-17)
// ---------------------------------------------------------------------------
const NB = ' ';
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const MESES_LONGO = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const num = v => Number(v) || 0;
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const nf = (v, c = 2) => num(v).toLocaleString('pt-BR', { minimumFractionDigits: c, maximumFractionDigits: c });
const menos = v => (num(v) < 0 ? '−' : '');
const brl = v => menos(v) + 'R$' + NB + nf(Math.abs(num(v)));
const tab = v => menos(v) + nf(Math.abs(num(v)));
function compacto(v) {
    const a = Math.abs(num(v));
    let t;
    if (a >= 1e9) t = nf(a / 1e9, 1) + NB + 'bi';
    else if (a >= 1e6) t = nf(a / 1e6, 1) + NB + 'mi';
    else if (a >= 1e3) t = nf(a / 1e3, 1) + NB + 'mil';
    else t = nf(a, 0);
    return menos(v) + 'R$' + NB + t;
}
const mil = v => menos(v) + nf(Math.abs(num(v)) / 1000, 1);
const pct = (v, sinal = false) => (sinal && num(v) > 0 ? '+' : '') + menos(v) + nf(Math.abs(num(v)), 1) + '%';
const dataIso = s => { const [a, m, d] = String(s).slice(0, 10).split('-').map(Number); return new Date(a, m - 1, d); };
const comp = s => { const d = dataIso(s); return MESES[d.getMonth()] + '/' + d.getFullYear(); };
const compCurto = s => MESES[dataIso(s).getMonth()];
const mesLongo = s => MESES_LONGO[dataIso(s).getMonth()];
const dma = s => { const d = dataIso(s); return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear(); };
function carimbo(iso) {
    const d = iso ? new Date(iso) : new Date();
    return { data: String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear(),
             hora: String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') };
}
const variacao = (atual, anterior) => (num(anterior) ? (num(atual) - num(anterior)) / Math.abs(num(anterior)) * 100 : null);
const iniciais = nome => String(nome || 'R').split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('');

// ---------------------------------------------------------------------------
// Gráficos em SVG (REL-25, REL-51, REL-53): uma série, rótulo direto, sem eixo duplo
// ---------------------------------------------------------------------------
const C = { sprout: '#3f8163', pine: '#1e3a32', cinza: '#c9d0ca', ink: '#17211e', mut: '#6f7a76' };
function txt(x, y, s, o = {}) {
    return `<text x="${x}" y="${y}" text-anchor="${o.a || 'middle'}" font-size="${o.fs || 9}" font-weight="${o.fw || 400}" class="${o.c || ''}" fill="${o.f || C.ink}" font-family="Inter,system-ui,sans-serif" style="font-variant-numeric:tabular-nums">${esc(s)}</text>`;
}
function svgColunas(dados, o = {}) {
    if (!dados.length) return '';
    const max = Math.max(0, ...dados.map(d => d.v)), min = Math.min(0, ...dados.map(d => d.v));
    const W = o.w || 320, H = o.h || (min < 0 ? 186 : 170), top = 24, bot = min < 0 ? 36 : 20;
    const sc = (H - top - bot) / ((max - min) || 1), y0 = top + max * sc, band = (W - 8) / dados.length, bw = Math.min(28, band * 0.56);
    let s = `<defs><pattern id="rzrel-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="5" fill="#fff"/><line x1="0" y1="0" x2="0" y2="5" stroke="${C.sprout}" stroke-width="2"/></pattern></defs>`;
    dados.forEach((d, i) => {
        const x = 4 + band * i + (band - bw) / 2, h = Math.abs(d.v) * sc, y = d.v >= 0 ? y0 - h : y0;
        s += `<g><title>${esc(d.titulo || d.l)}: ${esc(compacto(d.v * 1000))}${d.p ? ' (previsão)' : ''}</title><rect x="${x}" y="${y}" width="${bw}" height="${Math.max(h, 1)}" rx="2" fill="${d.p ? 'url(#rzrel-hatch)' : C.sprout}" stroke="${d.p ? C.sprout : 'none'}" stroke-width="${d.p ? 1 : 0}"/></g>`;
        s += txt(x + bw / 2, d.v >= 0 ? y - 4 : y + h + 10, mil(d.v * 1000), { fw: d.hl ? 700 : 500 });
        s += txt(x + bw / 2, H - 6, d.l, { f: C.mut, c: 'mu', fs: 8.5 });
        if (d.hl && o.nota) {
            const esquerda = x > W * 0.55, ay = d.v >= 0 ? y + 8 : y + h / 2;
            const x1 = esquerda ? x - 1 : x + bw + 1, x2 = esquerda ? x - 10 : x + bw + 10, xt = esquerda ? x - 12 : x + bw + 12;
            s += `<line x1="${x1}" y1="${ay}" x2="${x2}" y2="${ay}" stroke="${C.mut}" stroke-width=".8"/>` + o.nota.map((t, k) => txt(xt, ay + 3 + k * 10, t, { a: esquerda ? 'end' : 'start', fs: 8, f: C.mut, c: 'mu' })).join('');
        }
    });
    s += `<line class="zl" x1="0" x2="${W}" y1="${y0}" y2="${y0}" stroke="${C.ink}" stroke-width=".8"/>`;
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.aria || '')}">${s}</svg>`;
}
// ponte: passos {l, v, t: 'tot'|'up'|'down'} — total em pine, entrada em sprout, saída em cinza
function svgPonte(passos, o = {}) {
    if (!passos.length) return '';
    const W = o.w || 320, H = o.h || 190, top = 18, bot = 30;
    let run = 0;
    const bars = passos.map(p => {
        let a, b;
        if (p.t === 'tot') { a = Math.min(0, p.v); b = Math.max(0, p.v); run = p.v; }
        else if (p.t === 'up') { a = run; b = run + p.v; run = b; }
        else { a = run - p.v; b = run; run = a; }
        return { ...p, a: Math.min(a, b), b: Math.max(a, b), fim: run };
    });
    const mx = Math.max(0, ...bars.map(b => b.b)), mn = Math.min(0, ...bars.map(b => b.a));
    const sc = (H - top - bot) / ((mx - mn) || 1), Y = v => top + (mx - v) * sc, band = W / bars.length, bw = Math.min(34, band * 0.62);
    let s = '';
    bars.forEach((p, i) => {
        const x = band * i + (band - bw) / 2, y = Y(p.b), h = Math.max((p.b - p.a) * sc, 1);
        const fill = p.t === 'tot' ? C.pine : p.t === 'up' ? C.sprout : C.cinza;
        s += `<g><title>${esc(p.l.replace('|', ' '))}: ${esc(compacto(p.v * 1000))}</title><rect x="${x}" y="${y}" width="${bw}" height="${h}" rx="1.5" fill="${fill}"/></g>`;
        s += txt(x + bw / 2, y - 4, (p.t === 'down' ? '−' : p.t === 'up' ? '+' : '') + nf(Math.abs(p.v), 1), { fw: p.t === 'tot' ? 700 : 500 });
        if (i < bars.length - 1) s += `<line x1="${x + bw}" x2="${x + band}" y1="${Y(p.fim)}" y2="${Y(p.fim)}" stroke="${C.mut}" stroke-width=".6" stroke-dasharray="2 2"/>`;
        p.l.split('|').forEach((t, k) => { s += txt(x + bw / 2, H - bot + 11 + k * 9, t, { f: C.mut, c: 'mu', fs: 7.6 }); });
    });
    s += `<line class="zl" x1="0" x2="${W}" y1="${Y(0)}" y2="${Y(0)}" stroke="${C.ink}" stroke-width=".8"/>`;
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.aria || '')}">${s}</svg>`;
}
function barrasH(dados, fmt, largura = 170) {
    const mx = Math.max(...dados.map(d => Math.abs(d.v)), 1);
    return dados.map(d => `<div class="hbar"><span style="width:${largura}px">${esc(d.l)}</span><i class="${d.g ? 'g' : ''}" style="width:${Math.max(0.5, Math.round(Math.abs(d.v) / mx * 550) / 10)}%"></i><b>${fmt(d)}</b></div>`).join('');
}
// quebra rótulo longo em 2 linhas para o eixo da ponte
function rotulo2(t) {
    const p = String(t).split(' ');
    if (t.length <= 11 || p.length < 2) return t;
    let a = '', i = 0;
    while (i < p.length && (a + ' ' + p[i]).trim().length <= 12) { a = (a + ' ' + p[i]).trim(); i++; }
    return a + '|' + p.slice(i).join(' ');
}

// ---------------------------------------------------------------------------
// Moldura do documento (REL-05, REL-10, REL-54)
// ---------------------------------------------------------------------------
const SECOES = ['Resumo', 'Evolução', 'Composição', 'Detalhe', 'Notas'];
function pagina(d, cfg, n, total, corpo, secoesOn) {
    const c = carimbo(d.gerado_em);
    const cab = n === 1
        ? `<div class="r"><b>Raiz Patrimônio</b>Gerado em ${c.data} às ${c.hora}<br>por ${esc(d.gerado_por || 'Raiz')}</div>`
        : `<div class="r"><b>Raiz Patrimônio</b>${esc(cfg.nome)}</div>`;
    return `<section class="page">
      ${cfg.previa ? '<div class="wm">PRÉVIA</div>' : ''}
      <div class="ph"><div class="logo">${esc(iniciais(d.empresa))}</div><div class="t"><div class="l1">${esc(d.empresa || 'Empresa')} · ${esc(cfg.medida)}</div><div class="l2">${esc(cfg.subtitulo)}</div></div>${cab}</div>
      <div class="trk">${SECOES.map(s => `<span class="${secoesOn.includes(s) ? 'on' : ''}">${s}</span>`).join('')}</div>
      ${corpo}
      <div class="pf"><span><b>${esc(cfg.nome)}</b> · gerado em ${c.data} às ${c.hora} por ${esc(d.gerado_por || 'Raiz')}<br>Raiz Patrimônio · ${esc(d.relatorio)} v${d.versao || 1} · visão ${d.visao === 'caixa' ? 'caixa' : 'competência'}</span><span>Página ${n} de ${total}</span></div>
    </section>`;
}
const kpi = (rotulo, valor, delta, classe = 'mut') => `<div><small>${esc(rotulo)}</small><b>${esc(valor)}</b><div class="d ${classe}">${esc(delta || '')}</div></div>`;
const pontosHtml = pts => `<div class="pts">${pts.map((p, i) => `<div><div class="n">${i + 1}</div><b>${esc(p.a)}</b><span>${esc(p.b)}</span></div>`).join('')}</div>`;
const figura = (titulo, unidade, svg, fonte, extra = '') => `<div class="fig"><div class="ft">${esc(titulo)}</div><div class="fu">${esc(unidade)}</div>${extra}${svg}<div class="fs">Fonte: ${esc(fonte)}</div></div>`;
const secao = (titulo, unidade) => `<h4>${esc(titulo)}</h4><div class="hu">${esc(unidade)}</div>`;
const deltaClasse = (v, favoravelSobe = true) => (v == null || v === 0 ? 'mut' : ((v > 0) === favoravelSobe ? 'pos' : 'neg'));
const seta = v => (v == null ? '' : v > 0 ? '▲ ' : v < 0 ? '▼ ' : '');

// ---------------------------------------------------------------------------
// Fluxo de caixa
// ---------------------------------------------------------------------------
function montarFluxo(d) {
    const k = d.kpis || {}, meses = d.meses || [], pts = d.pontos || [];
    const ateReal = d.hoje < d.ate ? d.hoje : d.ate;
    const res = num(k.resultado_realizado);
    const neg = pts.find(p => p.tipo === 'mes_negativo');
    const desv = pts.find(p => p.tipo === 'desvio_entradas') || {};
    const ultimo = meses[meses.length - 1];
    const periodoTxt = `${comp(d.de)} a ${comp(d.ate)}`;
    const cfg = {
        nome: 'Fluxo de caixa', medida: 'Fluxo de caixa em R$',
        subtitulo: `${periodoTxt} · realizado até ${dma(ateReal)}${meses.some(m => m.previsao) ? ' · previsão nos meses seguintes' : ''} · visão caixa · ${d.conta_nome ? esc(d.conta_nome) : 'todas as contas visíveis'}`
    };
    // manchete (REL-06/49) — fatos do banco, frase montada aqui
    let manchete = `Caixa ${res >= 0 ? 'gerou' : 'consumiu'} ${compacto(Math.abs(res))} de ${comp(d.de)} até ${dma(ateReal)}`;
    manchete += neg ? `; ${mesLongo(neg.mes)} ${neg.previsao ? 'deve ser' : 'foi'} o pior mês, com ${compacto(neg.valor)}.`
                    : `; nenhum mês ${meses.some(m => m.previsao) ? 'previsto ' : ''}fica no negativo até ${comp(d.ate)}.`;
    const pctPrev = num(desv.previsto) ? num(desv.realizado) / num(desv.previsto) * 100 : null;
    const pontos = [
        { a: `O período ${res >= 0 ? 'gerou' : 'consumiu'} ${compacto(Math.abs(res))} de caixa.`, b: `Entraram ${compacto(k.entradas_realizadas)} e saíram ${compacto(k.saidas_realizadas)} até ${dma(ateReal)}.` },
        neg ? { a: `${mesLongo(neg.mes).replace(/^./, c => c.toUpperCase())} é o pior mês: ${compacto(neg.valor)}.`, b: neg.maior_saida ? `A maior saída do mês é ${neg.maior_saida.descricao} (${compacto(neg.maior_saida.valor)}).` : 'As saídas do mês passam as entradas.' }
            : { a: 'Nenhum mês fica no negativo.', b: `O resultado ${meses.some(m => m.previsao) ? 'previsto ' : ''}do período é ${compacto(k.resultado_previsto_periodo)}.` },
        num(desv.atraso_qtd) > 0
            ? { a: `${num(desv.atraso_qtd)} ${num(desv.atraso_qtd) === 1 ? 'recebimento está' : 'recebimentos estão'} em atraso: ${compacto(desv.atraso_valor)}.`, b: `${pctPrev != null ? 'Entrou ' + pct(pctPrev) + ' do previsto até hoje. ' : ''}${desv.maior_atraso ? 'O maior é ' + desv.maior_atraso.descricao + '.' : ''}` }
            : { a: 'Nenhum recebimento em atraso.', b: pctPrev != null ? `Entrou ${pct(pctPrev)} do previsto até hoje.` : 'Tudo o que venceu foi recebido.' }
    ];
    const kpis = `<div class="kpis">${
        kpi('Resultado de caixa', compacto(res), `até ${dma(ateReal)}`, res >= 0 ? 'pos' : 'neg') +
        kpi('Entradas realizadas', compacto(k.entradas_realizadas), pctPrev != null ? pct(pctPrev) + ' do previsto' : '') +
        kpi('Saídas realizadas', compacto(k.saidas_realizadas), num(k.saidas_previstas_ate_hoje) ? pct(num(k.saidas_realizadas) / num(k.saidas_previstas_ate_hoje) * 100) + ' do previsto' : '') +
        kpi(`Resultado previsto até ${comp(d.ate)}`, compacto(k.resultado_previsto_periodo), meses.some(m => m.previsao) ? 'inclui previsão' : 'realizado')
    }</div>`;
    const colunas = meses.map(m => ({ l: compCurto(m.mes), titulo: comp(m.mes), v: num(m.resultado) / 1000, p: m.previsao, hl: neg && m.mes === neg.mes }));
    const notaNeg = neg && neg.maior_saida ? [String(neg.maior_saida.descricao).slice(0, 18), compacto(neg.maior_saida.valor)] : null;
    const tituloCol = neg ? `${mesLongo(neg.mes).replace(/^./, c => c.toUpperCase())} é o mês mais fraco` : 'Todos os meses no positivo';
    const ponteBase = (d.ponte || []).map(p => ({ l: rotulo2(p.rotulo), v: num(p.valor) / 1000, t: p.tipo === 'entrada' ? 'up' : 'down' }));
    if (ponteBase.length) ponteBase[0].t = ponteBase[0].t === 'up' ? 'tot' : ponteBase[0].t;
    const ponte = ponteBase.concat([{ l: 'Resultado', v: res / 1000, t: 'tot' }]);
    const maiorSaida = (d.ponte || []).filter(p => p.tipo === 'saida').sort((a, b) => num(b.valor) - num(a.valor))[0];
    const tituloPonte = maiorSaida ? `${maiorSaida.rotulo} é a maior saída do período` : 'Sem saídas no período';
    const capa = `
      <div class="acao">${esc(manchete)}</div>
      <div class="acao-sub"><i>Leitura</i>gerada a partir dos números deste relatório</div>
      ${kpis}${pontosHtml(pontos)}
      <div class="g2">
        ${figura(tituloCol, 'Resultado de caixa por mês · R$ mil · cheio = realizado, hachurado = previsão', svgColunas(colunas, { nota: notaNeg, aria: 'Resultado de caixa por mês' }), `Raiz · fn_contas_fluxo_caixa · dados até ${dma(ateReal)}`)}
        ${figura(tituloPonte, `Entradas e saídas realizadas · ${comp(d.de)} até ${dma(ateReal)} · R$ mil`, svgPonte(ponte, { aria: 'Ponte das entradas ao resultado' }), `Raiz · fn_contas_fluxo_caixa · ${periodoTxt}`)}
      </div>`;
    // detalhe 1: evolução + composição
    const linhasMes = meses.map(m => `<tr class="${m.previsao ? 'prev' : ''}"><td>${comp(m.mes)}${m.mes_atual ? ' <span class="tag">mês atual</span>' : ''}</td><td class="n hm">${tab(m.entradas_previstas)}</td><td class="n">${m.previsao ? '—' : tab(m.entradas_realizadas)}</td><td class="n hm">${tab(m.saidas_previstas)}</td><td class="n">${m.previsao ? '—' : tab(m.saidas_realizadas)}</td><td class="n ${num(m.resultado) < 0 ? 'neg' : ''}">${tab(m.resultado)}</td><td class="n hm">${tab(m.acumulado)}</td></tr>`).join('');
    const tot = (c) => meses.reduce((s, m) => s + num(m[c]), 0);
    const maiorAcum = meses.length ? meses.reduce((a, b) => (num(b.acumulado) > num(a.acumulado) ? b : a)) : null;
    const cat = (d.categorias || []).slice(0, 8);
    const totSaidas = (d.categorias || []).reduce((s, c) => s + num(c.valor), 0);
    const dois = (d.categorias || []).slice(0, 2).reduce((s, c) => s + num(c.valor), 0);
    const contas = d.contas || [];
    const totContas = contas.reduce((s, c) => s + num(c.resultado), 0);
    const p2 = `
      ${secao(`1. Evolução · ${maiorAcum ? 'O acumulado chega a ' + compacto(ultimo.acumulado) + ' em ' + comp(ultimo.mes) : 'Mês a mês'}`, 'Previsto e realizado por mês · R$ · meses em itálico são previsão')}
      <table><thead><tr><th>Mês</th><th class="n hm">Entradas<br>previstas</th><th class="n">Entradas<br>realizadas</th><th class="n hm">Saídas<br>previstas</th><th class="n">Saídas<br>realizadas</th><th class="n">Resultado</th><th class="n hm">Acumulado</th></tr></thead>
      <tbody>${linhasMes}<tr class="tot"><td>Período</td><td class="n hm">${tab(tot('entradas_previstas'))}</td><td class="n">${tab(tot('entradas_realizadas'))}</td><td class="n hm">${tab(tot('saidas_previstas'))}</td><td class="n">${tab(tot('saidas_realizadas'))}</td><td class="n">${tab(tot('resultado'))}</td><td class="n hm">${ultimo ? tab(ultimo.acumulado) : ''}</td></tr></tbody></table>
      ${cat.length ? secao(`2. Composição · ${(d.categorias || []).slice(0, 2).map(c => c.nome).join(' e ')} ${(d.categorias || []).length > 1 ? 'somam' : 'é'} ${pct(totSaidas ? dois / totSaidas * 100 : 0)} das saídas`, `Saídas realizadas por categoria · ${comp(d.de)} até ${dma(ateReal)} · R$ · ordem por valor`) +
        barrasH(cat.map((c, i) => ({ l: c.nome, v: num(c.valor), g: i >= 6 })), x => brl(x.v) + ' · ' + pct(totSaidas ? x.v / totSaidas * 100 : 0)) +
        `<div class="fs">Fonte: Raiz · lançamentos pagos no período · categorias do catálogo (REL-18)</div>` : secao('2. Composição · Nenhuma saída paga no período', '')}
      ${contas.length ? secao(`3. Por conta · ${contas[0].nome} ${contas.length > 1 && totContas ? 'tem ' + pct(num(contas[0].resultado) / totContas * 100) + ' do resultado' : 'concentra o movimento'}`, `Movimento realizado · ${comp(d.de)} até ${dma(ateReal)} · R$`) +
        `<table><thead><tr><th>Conta</th><th class="hm">Titular</th><th class="n">Entradas</th><th class="n">Saídas</th><th class="n">Resultado</th></tr></thead><tbody>${
            contas.map(c => `<tr><td>${esc(c.nome)}${c.final ? ' <span class="mut">· ' + esc(c.instituicao || '') + ' ···' + esc(c.final) + '</span>' : ''}${c.incorpora_contabil ? '' : ' <span class="tag">fora da contabilidade</span>'}</td><td class="hm">${esc(c.titular)}</td><td class="n">${tab(c.entradas)}</td><td class="n">${tab(c.saidas)}</td><td class="n">${tab(c.resultado)}</td></tr>`).join('')
        }<tr class="tot"><td>Total</td><td class="hm"></td><td class="n">${tab(contas.reduce((s, c) => s + num(c.entradas), 0))}</td><td class="n">${tab(contas.reduce((s, c) => s + num(c.saidas), 0))}</td><td class="n">${tab(totContas)}</td></tr></tbody></table>` : ''}`;
    // detalhe 2: próximos 30 dias + atrasos + notas
    const av = d.a_vencer || {}, at = d.atrasos || {};
    const itensAv = (av.itens || []);
    const somaListados = itensAv.reduce((s, i) => s + num(i.valor) * (i.dir === 'entrada' ? 1 : 0), 0);
    const somaListadosP = itensAv.reduce((s, i) => s + num(i.valor) * (i.dir === 'saida' ? 1 : 0), 0);
    const resto = num(av.qtd) - itensAv.length;
    const p3 = `
      ${secao(`4. Próximos 30 dias · ${compacto(av.a_pagar)} a pagar e ${compacto(av.a_receber)} a receber`, `Vencimentos de ${dma(av.de || d.hoje)} a ${dma(av.ate || d.hoje)} · maiores valores · R$`)}
      <table><thead><tr><th>Vencimento</th><th>Descrição</th><th class="hm">Conta</th><th class="n">A receber</th><th class="n">A pagar</th></tr></thead><tbody>${
        itensAv.map(i => `<tr><td>${dma(i.dia)}</td><td>${esc(i.descricao)}</td><td class="hm">${esc(i.conta || '')}</td><td class="n">${i.dir === 'entrada' ? tab(i.valor) : ''}</td><td class="n">${i.dir === 'saida' ? tab(i.valor) : ''}</td></tr>`).join('') || '<tr><td colspan="5" class="mut">Nada vence nos próximos 30 dias.</td></tr>'
      }${resto > 0 ? `<tr><td colspan="2" class="mut">Demais vencimentos (${resto})</td><td class="hm"></td><td class="n">${tab(num(av.a_receber) - somaListados)}</td><td class="n">${tab(num(av.a_pagar) - somaListadosP)}</td></tr>` : ''}<tr class="tot"><td colspan="2">Total dos próximos 30 dias</td><td class="hm"></td><td class="n">${tab(av.a_receber)}</td><td class="n">${tab(av.a_pagar)}</td></tr></tbody></table>
      ${num(at.qtd_receber) + num(at.qtd_pagar) > 0 ? `<div class="box"><b>Em atraso no período:</b> ${num(at.qtd_receber)} a receber (${brl(at.a_receber)}) e ${num(at.qtd_pagar)} a pagar (${brl(at.a_pagar)}). ${(at.itens || []).slice(0, 3).map(i => esc(i.descricao) + ' · ' + brl(i.valor) + ' · venceu em ' + dma(i.dia)).join('; ')}.</div>` : ''}
      <div class="notes">
        <p><b>Notas.</b></p>
        <p><b>Visão caixa:</b> entra o que foi recebido e sai o que foi pago, na data do dinheiro. A Visão gerencial usa a competência e, por isso, dá números diferentes para o mesmo mês (REL-04).</p>
        <p><b>Previsão:</b> recebimentos dos contratos e lançamentos programados, na data de vencimento. Não inclui reajuste ainda não aplicado nem despesa não lançada. O que venceu e não foi pago fica em "Em atraso", fora do resultado.</p>
        <p><b>Acumulado:</b> soma do resultado desde o início do período; não é o saldo do banco, que depende do saldo de abertura de cada conta.</p>
        <p><b>Contas:</b> mostra a conta por onde o dinheiro passou. Este relatório traz só as contas que quem gerou pode ver.</p>
        <p><b>Origem:</b> fn_contas_fluxo_caixa v${d.versao || 1} · recebimentos e lançamentos até ${dma(d.hoje)}.</p>
      </div>`;
    return {
        cfg, linhas3: [`${cfg.nome} · ${periodoTxt}`, `Resultado ${compacto(res)} · Previsto até ${comp(d.ate)} ${compacto(k.resultado_previsto_periodo)}`, manchete],
        paginas: [[capa, ['Resumo']], [p2, ['Evolução', 'Composição']], [p3, ['Detalhe', 'Notas']]]
    };
}

// ---------------------------------------------------------------------------
// Visão gerencial
// ---------------------------------------------------------------------------
function montarGerencial(d) {
    const a = d.atual || {}, p = d.anterior_dre || {}, serie = d.serie || [], pts = d.pontos || [];
    const dist = d.distribuicao || {}, temDist = dist && !dist.indisponivel;
    const cxg = d.contabil_x_gerencial || {};
    const res = num(a.resultado), dRes = variacao(a.resultado, p.resultado);
    const mg = pts.find(x => x.tipo === 'margem') || {}, ms = pts.find(x => x.tipo === 'maior_saida') || {};
    const cfg = {
        nome: 'Visão gerencial', medida: 'Visão gerencial em R$', previa: !d.competencia_fechada,
        subtitulo: `${comp(d.competencia)} · Δ ${comp(d.anterior)} · visão competência · todas as contas visíveis${d.competencia_fechada ? '' : ' · competência não fechada'}`
    };
    let manchete = `Resultado de ${mesLongo(d.competencia)} foi ${compacto(res)}`;
    if (dRes != null) manchete += `, ${pct(Math.abs(dRes))} ${dRes >= 0 ? 'acima' : 'abaixo'} de ${mesLongo(d.anterior)}`;
    manchete += temDist && num(dist.saldo_pendente) > 0 ? `; ${compacto(dist.saldo_pendente)} ainda a repassar.` : '.';
    const dEnt = variacao(a.entradas, p.entradas), dSai = variacao(a.saidas, p.saidas);
    const catTop = ms.categoria;
    const dif = num(cxg.fora_contabilidade);
    const pontos = [
        { a: mg.margem != null ? `Margem de ${pct(mg.margem)}${mg.maior_6m ? ', a maior dos últimos 6 meses' : ''}.` : 'Sem entradas no mês.',
          b: `Entradas ${dEnt != null ? pct(dEnt, true) : 'sem base'} e saídas ${dSai != null ? pct(dSai, true) : 'sem base'} contra ${comp(d.anterior)}.` },
        catTop ? { a: `${catTop.nome} é a maior saída: ${compacto(catTop.valor)}.`, b: num(a.entradas) ? `Equivale a ${pct(num(catTop.valor) / num(a.entradas) * 100)} das entradas do mês.` : 'Sem entradas no mês para comparar.' }
               : { a: 'Nenhuma saída no mês.', b: 'Todas as entradas viraram resultado.' },
        dif ? { a: `Gerencial e contábil diferem em ${compacto(Math.abs(dif))}.`, b: `É o que está fora da contabilidade; o contábil fecha em ${compacto(cxg.resultado_contabil)}.` }
            : { a: 'Gerencial e contábil são iguais.', b: 'Nenhuma conta nem lançamento fora da contabilidade no mês.' }
    ];
    const kpis = `<div class="kpis">${
        kpi('Entradas', compacto(a.entradas), dEnt != null ? seta(dEnt) + pct(dEnt, true) + ' vs. ' + compCurto(d.anterior) : '', deltaClasse(dEnt)) +
        kpi('Saídas', compacto(a.saidas), dSai != null ? seta(dSai) + pct(dSai, true) + ' vs. ' + compCurto(d.anterior) : '', deltaClasse(dSai, false)) +
        kpi('Resultado', compacto(res), dRes != null ? seta(dRes) + pct(dRes, true) + ' vs. ' + compCurto(d.anterior) : '', deltaClasse(dRes)) +
        (temDist ? kpi('A repassar', compacto(dist.saldo_pendente), (dist.pessoas || []).length + ' pessoa' + ((dist.pessoas || []).length === 1 ? '' : 's'))
                 : kpi('Margem', mg.margem != null ? pct(mg.margem) : '—', 'resultado ÷ entradas'))
    }</div>`;
    const ponte = [
        { l: 'Receita|bruta', v: num(a.receita_bruta) / 1000, t: 'tot' },
        { l: 'Inadim-|plência', v: num(a.inadimplencia) / 1000, t: 'down' },
        { l: 'Taxa de|adm.', v: num(a.taxa_adm) / 1000, t: 'down' },
        { l: 'Encargos', v: num(a.encargos) / 1000, t: 'down' },
        { l: 'Estrutura', v: num(a.estrutura) / 1000, t: 'down' },
        { l: 'Tributos', v: num(a.tributos) / 1000, t: 'down' },
        { l: 'Resultado', v: res / 1000, t: 'tot' }
    ];
    for (let i = ponte.length - 2; i > 0; i--) if (Math.abs(ponte[i].v) < 0.005) ponte.splice(i, 1); // passo zerado não vira barra
    if (temDist) {
        const fora = res - num(dist.liquido);
        if (Math.abs(fora) >= 0.01) ponte.push({ l: fora > 0 ? 'Fica na|empresa' : 'Despesas|sem divisão', v: Math.abs(fora) / 1000, t: fora > 0 ? 'down' : 'up' });
        if (num(dist.reembolso) >= 0.01) ponte.push({ l: 'Reembolso', v: num(dist.reembolso) / 1000, t: 'up' });
        ponte.push({ l: 'Já|repassado', v: num(dist.ja_repassado) / 1000, t: 'down' });
        ponte.push({ l: 'A repassar', v: num(dist.saldo_pendente) / 1000, t: 'tot' });
    }
    const tituloPonte = temDist ? `De ${compacto(a.receita_bruta)} de receita bruta, ${compacto(dist.saldo_pendente)} ainda vão às pessoas`
                                : `De ${compacto(a.receita_bruta)} de receita bruta, ${compacto(res)} ficam de resultado`;
    const evo = serie.map((m, i) => ({ l: compCurto(m.mes), titulo: comp(m.mes), v: num(m.resultado) / 1000, hl: i === serie.length - 1 }));
    let seguidos = 0;
    for (let i = serie.length - 1; i > 0 && num(serie[i].resultado) > num(serie[i - 1].resultado); i--) seguidos++;
    const tituloEvo = seguidos >= 2 ? `Resultado cresce há ${seguidos} meses seguidos` : dRes == null ? 'Resultado dos últimos 6 meses' : dRes >= 0 ? `Resultado subiu contra ${mesLongo(d.anterior)}` : `Resultado caiu contra ${mesLongo(d.anterior)}`;
    const contas = d.contas || [];
    const totRes = contas.reduce((s, c) => s + num(c.resultado), 0);
    const contaTop = contas.slice().sort((x, y) => num(y.resultado) - num(x.resultado))[0];
    const tituloContas = !contaTop ? 'Resultado por conta' : (totRes > 0 && contas.every(c => num(c.resultado) >= 0)) ? `${contaTop.nome} gera ${pct(num(contaTop.resultado) / totRes * 100)} do resultado` : `${contaTop.nome} concentra o resultado`;
    const capa = `
      <div class="acao">${esc(manchete)}</div>
      <div class="acao-sub"><i>Leitura</i>gerada a partir dos números deste relatório</div>
      ${kpis}${pontosHtml(pontos)}
      ${figura(tituloPonte, `Da receita bruta ${temDist ? 'ao valor a repassar' : 'ao resultado'} · ${comp(d.competencia)} · R$ mil`, svgPonte(ponte, { w: 660, h: 165, aria: 'Ponte da receita bruta' }), `Raiz · fn_contas_visao_gerencial${temDist ? ' e fn_apurar_distribuicao' : ''} · competência ${comp(d.competencia)}`)}
      <div class="g2">
        ${figura(tituloEvo, 'Resultado por mês · R$ mil', svgColunas(evo, { h: 150, aria: 'Resultado por mês' }), `Raiz · fn_contas_visao_gerencial · ${comp(serie[0]?.mes || d.competencia)} a ${comp(d.competencia)}`)}
        ${figura(tituloContas, `Resultado de ${comp(d.competencia)} por conta · R$ mil`, '', `Raiz · fn_contas_visao_gerencial · competência ${comp(d.competencia)}`,
            `<div style="margin-top:12px">${barrasH(contas.slice(0, 5).map(c => ({ l: c.nome + (c.incorpora_contabil ? '' : ' (fora)'), v: num(c.resultado), g: !c.incorpora_contabil })), x => mil(x.v), 120)}</div>`)}
      </div>`;
    const lin = (rot, k, sub = '', sobeBom = true) => {
        const v = num(a[k]), w = num(p[k]), dv = v - w, dp = variacao(v, w);
        const cls = dv === 0 ? '' : ((dv > 0) === sobeBom ? 'pos' : 'neg');
        return `<tr class="${sub}"><td class="${sub ? '' : 'mut'}">${rot}</td><td class="n">${tab(v)}</td><td class="n hm">${tab(w)}</td><td class="n hm ${cls}">${dv > 0 ? '+' : ''}${tab(dv)}</td><td class="n ${cls}">${dp == null ? '—' : pct(dp, true)}</td></tr>`;
    };
    const opPct = num(a.entradas) ? num(a.resultado_operacional) / num(a.entradas) * 100 : null;
    const pessoas = temDist ? (dist.pessoas || []) : [];
    const pagos = d.pago_propria_conta || [];
    const p2 = `
      ${secao(`1. Demonstrativo · ${opPct != null ? 'O resultado operacional é ' + pct(opPct) + ' das entradas' : 'Resultado da competência'}`, `Ordem fixa da DRE patrimonial (REL-29) · ${comp(d.competencia)} contra ${comp(d.anterior)} · R$`)}
      <table><thead><tr><th style="width:44%">Linha</th><th class="n">${comp(d.competencia)}</th><th class="n hm">${comp(d.anterior)}</th><th class="n hm">Δ</th><th class="n">Δ %</th></tr></thead><tbody>
        ${lin('Receita bruta de aluguéis e outras receitas', 'receita_bruta', '')}
        ${lin('(−) Inadimplência', 'inadimplencia', '', false)}
        ${lin('(=) Entradas', 'entradas', 'sub')}
        ${lin('(−) Taxa de administração', 'taxa_adm', '', false)}
        ${lin('(−) Encargos do proprietário (IPTU, condomínio, seguro, manutenção)', 'encargos', '', false)}
        ${lin('(=) Resultado operacional dos imóveis', 'resultado_operacional', 'sub')}
        ${lin('(−) Despesas da estrutura', 'estrutura', '', false)}
        ${lin('(−) Tributos', 'tributos', '', false)}
        ${lin('(=) Resultado', 'resultado', 'tot')}
      </tbody></table>
      ${secao(`2. Por conta · ${contas.filter(c => !c.incorpora_contabil).length ? contas.filter(c => !c.incorpora_contabil).map(c => c.nome).join(', ') + ' fica fora da contabilidade' : 'Todas as contas entram na contabilidade'}`, `Competência ${comp(d.competencia)} · R$ · Δ contra ${comp(d.anterior)}`)}
      <table><thead><tr><th>Conta</th><th class="hm">Contabilidade</th><th class="n">Entradas</th><th class="n">Saídas</th><th class="n">Resultado</th><th class="n">Δ %</th></tr></thead><tbody>${
        contas.map(c => { const dv = variacao(c.resultado, c.resultado_anterior); return `<tr><td>${esc(c.nome)}</td><td class="hm">${c.incorpora_contabil ? 'Entra' : '<span class="tag">fora</span>'}</td><td class="n">${tab(c.entradas)}</td><td class="n">${tab(c.saidas)}</td><td class="n">${tab(c.resultado)}</td><td class="n ${deltaClasse(dv)}">${dv == null ? '—' : pct(dv, true)}</td></tr>`; }).join('')
      }<tr class="tot"><td>Total gerencial</td><td class="hm"></td><td class="n">${tab(contas.reduce((s, c) => s + num(c.entradas), 0))}</td><td class="n">${tab(contas.reduce((s, c) => s + num(c.saidas), 0))}</td><td class="n">${tab(totRes)}</td><td class="n"></td></tr></tbody></table>
      <div class="box"><b>Contábil × gerencial.</b> Resultado gerencial ${brl(cxg.resultado_gerencial)} · (−) resultado fora da contabilidade ${brl(cxg.fora_contabilidade)} · <b>(=) resultado contábil ${brl(cxg.resultado_contabil)}</b>.</div>
      ${temDist && pessoas.length ? secao(`3. Por pessoa · ${pessoas.slice(0, 2).map(x => x.nome.split(' ')[0] + ' ' + (num(x.a_repassar) >= 0 ? 'tem ' + compacto(x.a_repassar) + ' a receber' : 'recebeu ' + compacto(Math.abs(x.a_repassar)) + ' a mais')).join('; ')}`, `Parte de cada pessoa em ${comp(d.competencia)}, pela divisão do contrato e pela propriedade do imóvel · R$`) +
        `<table><thead><tr><th>Pessoa</th><th class="n hm">Entradas</th><th class="n hm">Saídas</th><th class="n">Parte do resultado</th><th class="n hm">(+) Reembolso</th><th class="n hm">Já repassado</th><th class="n">A repassar</th></tr></thead><tbody>${
            pessoas.map(x => `<tr><td>${esc(x.nome)}</td><td class="n hm">${tab(x.entradas)}</td><td class="n hm">${tab(x.saidas)}</td><td class="n">${tab(x.liquido)}</td><td class="n hm">${tab(x.reembolso ?? x.pago_propria_conta)}</td><td class="n hm">${tab(x.ja_repassado)}</td><td class="n ${num(x.a_repassar) < 0 ? 'neg' : ''}">${tab(x.a_repassar)}</td></tr>`).join('')
        }<tr class="tot"><td>Total</td><td class="n hm">${tab(pessoas.reduce((s, x) => s + num(x.entradas), 0))}</td><td class="n hm">${tab(pessoas.reduce((s, x) => s + num(x.saidas), 0))}</td><td class="n">${tab(dist.liquido)}</td><td class="n hm">${tab(dist.reembolso ?? 0)}</td><td class="n hm">${tab(dist.ja_repassado)}</td><td class="n">${tab(dist.saldo_pendente)}</td></tr></tbody></table>`
        : secao('3. Por pessoa', temDist ? 'Nenhuma divisão entre pessoas nesta competência.' : (dist.motivo || 'Indisponível.'))}`;
    const cats = d.categorias || [];
    const totCat = cats.reduce((s, c) => s + num(c.valor), 0);
    const p3 = `
      ${secao(`4. Saídas · ${cats.length ? cats.slice(0, 2).map(c => c.nome).join(' e ') + ' lideram as saídas' : 'Nenhuma saída no mês'}`, `Saídas de ${comp(d.competencia)} por categoria · R$ · ordem por valor`)}
      ${barrasH(cats.slice(0, 8).map((c, i) => ({ l: c.nome, v: num(c.valor), g: i >= 6 })), x => brl(x.v) + ' · ' + pct(totCat ? x.v / totCat * 100 : 0))}
      ${secao(`5. Pago da própria conta · ${pagos.length ? compacto(pagos.reduce((s, x) => s + num(x.valor), 0)) + ' pagos por conta de pessoa' : 'nenhuma despesa paga por conta de pessoa'}`, `Despesas de ${comp(d.competencia)} pagas por conta de pessoa · R$`)}
      ${pagos.length ? `<table><thead><tr><th>Data</th><th>Descrição</th><th class="n">Valor</th><th class="hm">Paga por</th></tr></thead><tbody>${pagos.map(x => `<tr><td>${x.dia ? dma(x.dia) : ''}</td><td>${esc(x.descricao)}</td><td class="n">${tab(x.valor)}</td><td class="hm">${esc(x.conta)}</td></tr>`).join('')}</tbody></table>` : ''}
      <div class="notes">
        <p><b>Notas.</b></p>
        <p><b>Visão competência:</b> receita e despesa pelo mês a que se referem, só o que foi recebido ou pago. O Fluxo de caixa usa a data do dinheiro e dá números diferentes (REL-04).</p>
        <p><b>Receita bruta:</b> aluguéis da competência (pagos ou não) e outras receitas recebidas. <b>Inadimplência:</b> aluguéis da competência ainda não pagos.</p>
        <p><b>Parte de cada pessoa:</b> recebimento pela divisão do contrato; despesa pela propriedade do imóvel; quando o lançamento tem divisão ajustada, vale a dele (mesma regra da Distribuição). Despesa sem imóvel nem divisão fica na empresa.</p>
        <p><b>Reembolso:</b> despesa paga pela conta de uma pessoa volta inteira a ela, além da parte do resultado, porque já reduziu o resultado de todos.</p>
        <p><b>Fora da contabilidade:</b> contas ou lançamentos marcados assim aparecem no gerencial e não entram no pacote do contador.</p>
        <p><b>Contas visíveis:</b> este relatório traz só as contas que quem gerou pode ver.</p>
        <p><b>Origem:</b> fn_contas_visao_gerencial v${d.versao || 1}${temDist ? ' e fn_apurar_distribuicao' : ''} · competência ${comp(d.competencia)} ${d.competencia_fechada ? 'fechada' : 'não fechada (PRÉVIA)'}.</p>
      </div>`;
    return {
        cfg, linhas3: [`${cfg.nome} · ${comp(d.competencia)}`, `Resultado ${compacto(res)} · ${temDist ? 'A repassar ' + compacto(dist.saldo_pendente) : 'Margem ' + (mg.margem != null ? pct(mg.margem) : '—')}`, manchete],
        paginas: [[capa, ['Resumo']], [p2, ['Composição', 'Detalhe']], [p3, ['Detalhe', 'Notas']]]
    };
}

// ---------------------------------------------------------------------------
// Tela: o documento em si (REL-36) — topo com período, rodapé PDF | Compartilhar
// ---------------------------------------------------------------------------
const CSS = `
#rz-relexec{position:fixed;inset:0;z-index:96;background:var(--paper,#f4f3ee);display:flex;flex-direction:column}
#rz-relexec .rx-top{display:flex;align-items:center;gap:8px;padding:10px 12px;background:var(--card,#fff);border-bottom:1px solid var(--line,#e6e3da)}
#rz-relexec .rx-top button{font:600 14px Inter,system-ui,sans-serif;min-height:44px;border-radius:999px;border:1px solid var(--line,#e6e3da);background:var(--card,#fff);color:var(--ink,#17211e);padding:8px 14px;display:inline-flex;align-items:center;gap:6px;cursor:pointer}
#rz-relexec .rx-top .rx-voltar{border:0;padding:8px 6px}
#rz-relexec .rx-top .rx-sp{flex:1}
#rz-relexec .rx-corpo{flex:1;overflow:auto;padding:16px;display:flex;flex-direction:column;align-items:center;gap:20px;-webkit-overflow-scrolling:touch}
#rz-relexec .rx-pe{display:flex;gap:10px;padding:10px 12px calc(10px + env(safe-area-inset-bottom));background:var(--card,#fff);border-top:1px solid var(--line,#e6e3da)}
#rz-relexec .rx-pe button{flex:1;min-height:48px;border-radius:12px;font:600 15px Inter,system-ui,sans-serif;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px}
#rz-relexec .rx-pe .rx-sec{background:var(--card,#fff);color:var(--ink,#17211e);border:1px solid var(--line,#e6e3da)}
#rz-relexec .rx-pe .rx-pri{background:var(--pine,#1e3a32);color:#fff;border:0}
#rz-relexec .rx-top svg,#rz-relexec .rx-pe svg{width:18px;height:18px;flex:none}
#rz-relexec .rx-msg{padding:40px 16px;color:var(--muted,#6f7a76);text-align:center;font-size:15px}
.rzrel .page{overflow:hidden;box-sizing:border-box;width:210mm;min-height:297mm;background:#fff;color:#17211e;padding:16mm 18mm 18mm;box-shadow:0 2px 16px rgba(23,33,30,.12);position:relative;font-size:9.5pt;line-height:1.35;font-family:Inter,system-ui,sans-serif}
.rzrel .page .ph{display:flex;align-items:flex-start;gap:12px;border-bottom:2px solid #1e3a32;padding-bottom:8px;margin-bottom:10px}
.rzrel .page .ph .logo{width:34px;height:34px;border-radius:8px;background:#1e3a32;color:#fff;display:grid;place-items:center;font:700 13px 'Bricolage Grotesque',Inter,sans-serif;flex:none}
.rzrel .page .ph .t{flex:1}.rzrel .page .ph .t .l1{font:700 13pt/1.15 'Bricolage Grotesque',Inter,sans-serif;letter-spacing:-.01em}.rzrel .page .ph .t .l2{font-size:9pt;color:#6f7a76;margin-top:3px}.rzrel .page .ph .r{text-align:right;font-size:7.5pt;color:#6f7a76}.rzrel .page .ph .r b{display:block;color:#1e3a32;font-size:9pt}
.rzrel .page .trk{display:flex;font-size:7.5pt;color:#9aa49f;margin:-4px 0 10px}.rzrel .page .trk span{padding:2px 8px;border-right:1px solid #e6e3da}.rzrel .page .trk span:last-child{border:0}.rzrel .page .trk span.on{color:#1e3a32;font-weight:700}
.rzrel .page .acao{font:700 17pt/1.18 'Bricolage Grotesque',Inter,sans-serif;letter-spacing:-.015em;color:#17211e;margin:6px 0 4px}
.rzrel .page .acao-sub{font-size:8pt;color:#6f7a76;margin-bottom:12px}.rzrel .page .acao-sub i{font-style:normal;border:1px solid #e6e3da;border-radius:999px;padding:1px 7px;margin-right:6px}
.rzrel .page .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:12px}.rzrel .page .kpis>div{border:1px solid #e6e3da;border-radius:8px;padding:8px 10px}.rzrel .page .kpis small{display:block;font-size:7.5pt;color:#6f7a76}.rzrel .page .kpis b{font:700 14pt 'Bricolage Grotesque',Inter,sans-serif;font-variant-numeric:tabular-nums}.rzrel .page .kpis .d{font-size:8pt;margin-top:2px}
.rzrel .page .pts{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:0 0 12px}.rzrel .page .pts>div{border-top:2px solid #1e3a32;padding-top:6px}.rzrel .page .pts .n{font:700 15pt 'Bricolage Grotesque',Inter,sans-serif;color:#3f8163;line-height:1}.rzrel .page .pts b{display:block;font-size:9.5pt;margin:3px 0 2px;line-height:1.25}.rzrel .page .pts span{font-size:8.5pt;color:#6f7a76}
.rzrel .page .g2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.rzrel .page .fig{break-inside:avoid;margin:2px 0 8px}.rzrel .page .fig .ft{font:700 10pt/1.2 'Bricolage Grotesque',Inter,sans-serif;color:#17211e}.rzrel .page .fig .fu{font-size:7.5pt;color:#6f7a76;margin:1px 0 4px}.rzrel .page .fs,.rzrel .page .fig .fs{font-size:7pt;color:#9aa49f;margin-top:2px}
.rzrel .page .fig svg{width:100%;height:auto;display:block;overflow:visible}
.rzrel .page h4{font:700 11.5pt/1.2 'Bricolage Grotesque',Inter,sans-serif;margin:14px 0 2px;color:#17211e;break-after:avoid}.rzrel .page .hu{font-size:7.5pt;color:#6f7a76;margin:0 0 6px}
.rzrel .page table{width:100%;border-collapse:collapse;font-size:8.8pt}.rzrel .page thead{display:table-header-group}.rzrel .page th{text-align:left;font-weight:600;color:#6f7a76;font-size:7.8pt;padding:4px 6px;border-bottom:1px solid #17211e;vertical-align:bottom}.rzrel .page th.n,.rzrel .page td.n{text-align:right;font-variant-numeric:tabular-nums lining-nums;white-space:nowrap}
.rzrel .page td{padding:4px 6px;border-bottom:1px solid #eeece6;break-inside:avoid}.rzrel .page tbody tr:nth-child(even) td{background:rgba(23,33,30,.04)}
.rzrel .page tr.sub td{font-weight:600;border-top:1px solid #17211e;background:none!important}.rzrel .page tr.tot td{font-weight:700;border-top:1.5px solid #17211e;border-bottom:0;background:none!important;font-size:9.3pt}
.rzrel .page tr.prev td{color:#6f7a76;font-style:italic}
.rzrel .page .pos{color:#2f8b57}.rzrel .page .neg{color:#c1463a}.rzrel .page .mut{color:#6f7a76}
.rzrel .page .tag{display:inline-block;font-size:7pt;border:1px solid #e6e3da;border-radius:999px;padding:0 6px;color:#6f7a76;font-style:normal}
.rzrel .page .hbar{display:flex;align-items:center;gap:8px;font-size:8.5pt;margin:3px 0}.rzrel .page .hbar span{flex:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.rzrel .page .hbar i{display:block;height:9px;background:#3f8163;border-radius:0 2px 2px 0}.rzrel .page .hbar i.g{background:#c9d0ca}.rzrel .page .hbar b{font-variant-numeric:tabular-nums;white-space:nowrap;font-weight:600}
.rzrel .page .notes{font-size:7.5pt;color:#6f7a76;margin-top:14px;border-top:1px solid #e6e3da;padding-top:8px}.rzrel .page .notes b{color:#17211e}.rzrel .page .notes p{margin:0 0 4px}
.rzrel .page .pf{position:absolute;left:18mm;right:18mm;bottom:7mm;display:flex;justify-content:space-between;align-items:flex-end;gap:10px;line-height:1.35;font-size:7.5pt;color:#6f7a76;border-top:1px solid #e6e3da;padding-top:4px}.rzrel .page .pf b{color:#17211e;font-weight:600}
.rzrel .page .box{border:1px solid #e6e3da;border-radius:8px;padding:8px 10px;margin-top:8px}
.rzrel .page .wm{position:absolute;inset:0;display:grid;place-items:center;pointer-events:none;font:700 72pt 'Bricolage Grotesque',Inter,sans-serif;color:rgba(23,33,30,.08);transform:rotate(-24deg)}
.rzrel.m .page{width:100%;max-width:640px;min-height:0;padding:14px 14px 12px;border-radius:16px;box-shadow:0 1px 2px rgba(23,33,30,.06),0 4px 14px rgba(23,33,30,.05);font-size:13px;background:var(--card,#fff);color:var(--ink,#17211e)}
.rzrel.m .page .ph .t .l1{font-size:15px}.rzrel.m .page .ph .t .l2{font-size:12px;color:var(--muted,#6f7a76)}.rzrel.m .page .ph .r,.rzrel.m .page .trk{display:none}.rzrel.m .page .ph{border-bottom-color:var(--ink,#17211e)}
.rzrel.m .page .acao{font-size:19px;color:var(--ink,#17211e)}.rzrel.m .page .acao-sub{font-size:12px}
.rzrel.m .page .kpis{grid-template-columns:1fr 1fr}.rzrel.m .page .kpis>div{border-color:var(--line,#e6e3da)}.rzrel.m .page .kpis small,.rzrel.m .page .kpis .d{font-size:12px}.rzrel.m .page .kpis b{font-size:19px}
.rzrel.m .page .pts{grid-template-columns:1fr}.rzrel.m .page .pts b{font-size:14px}.rzrel.m .page .pts span{font-size:13px}
.rzrel.m .page .g2{grid-template-columns:1fr}
.rzrel.m .page .fig .ft{font-size:15px;color:var(--ink,#17211e)}.rzrel.m .page .fig .fu,.rzrel.m .page .fs{font-size:11px}
.rzrel.m .page h4{font-size:15px;color:var(--ink,#17211e)}.rzrel.m .page .hu{font-size:12px}
.rzrel.m .page table{font-size:13px}.rzrel.m .page th{font-size:12px;border-bottom-color:var(--ink,#17211e)}.rzrel.m .page td{padding:7px 4px;border-bottom-color:var(--line,#e6e3da)}.rzrel.m .page tbody tr:nth-child(even) td{background:none}
.rzrel.m .page .hm{display:none}
.rzrel.m .page .hbar{font-size:13px}.rzrel.m .page .hbar span{width:120px!important}
.rzrel.m .page .notes{font-size:12px;border-top-color:var(--line,#e6e3da)}.rzrel.m .page .notes b{color:var(--ink,#17211e)}
.rzrel.m .page .pf{position:static;margin-top:12px;font-size:11px;flex-wrap:wrap;gap:6px;border-top-color:var(--line,#e6e3da)}
.rzrel.m .page .wm{font-size:56px;align-items:start;padding-top:40%}
.rzrel.m svg text{fill:var(--ink,#17211e)}.rzrel.m svg text.mu{fill:var(--muted,#6f7a76)}.rzrel.m svg .zl{stroke:var(--muted,#6f7a76)}
@media print{
  body.rz-imprimindo-rel>*:not(#rz-relexec){display:none!important}
  body.rz-imprimindo-rel #rz-relexec{position:static;background:#fff}
  body.rz-imprimindo-rel #rz-relexec .rx-top,body.rz-imprimindo-rel #rz-relexec .rx-pe{display:none!important}
  body.rz-imprimindo-rel #rz-relexec .rx-corpo{overflow:visible;padding:0;display:block}
  body.rz-imprimindo-rel .rzrel .page{box-shadow:none;width:auto;min-height:auto;padding:0;break-after:page}
  body.rz-imprimindo-rel .rzrel .page .pf{position:static;margin-top:14px}
  @page{size:A4 portrait;margin:16mm 18mm 14mm}
}`;
function garantirCss() {
    if (document.getElementById('rz-relexec-css')) return;
    const st = document.createElement('style');
    st.id = 'rz-relexec-css';
    st.textContent = CSS;
    document.head.appendChild(st);
}

const RELATORIOS = {
    fluxo: { codigo: 'relatorios.fluxo_caixa', nome: 'Fluxo de caixa', arquivo: 'fluxo_caixa', montar: montarFluxo },
    gerencial: { codigo: 'relatorios.gerencial', nome: 'Visão gerencial', arquivo: 'gerencial', montar: montarGerencial }
};
let estado = null; // { tipo, filtro, dados, montado }

function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-01'; }
function somaMeses(base, n) { const d = new Date(base.getFullYear(), base.getMonth() + n, 1); return d; }
function filtroPadrao(tipo) {
    const hoje = new Date(), m0 = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    if (tipo === 'fluxo') return { de: iso(somaMeses(m0, -3)), ate: iso(somaMeses(m0, 2)), conta: null, contaNome: null, rotulo: 'Últimos 3 meses e próximos 2' };
    return { competencia: iso(somaMeses(m0, -1)) };
}
function rotuloFiltro() {
    if (!estado) return '';
    if (estado.tipo === 'fluxo') return `${comp(estado.filtro.de)} a ${comp(estado.filtro.ate)}`;
    return comp(estado.filtro.competencia);
}

async function buscar() {
    const f = estado.filtro;
    const rpc = estado.tipo === 'fluxo'
        ? dbAuth.rpc('fn_contas_fluxo_caixa', { p_cliente_id: CLIENTE_ID_SUPABASE, p_de: f.de, p_ate: f.ate, p_conta_id: f.conta || null })
        : dbAuth.rpc('fn_contas_visao_gerencial', { p_cliente_id: CLIENTE_ID_SUPABASE, p_competencia: f.competencia });
    const { data, error } = await rpc;
    if (error) throw new Error(error.message);
    if (!data?.ok) throw new Error(data?.mensagem || 'O relatório não veio.');
    return data.dados;
}

function telaHtml() {
    const r = RELATORIOS[estado.tipo];
    const contaChip = estado.tipo === 'fluxo' ? `<button type="button" data-rx="conta"><svg data-lucide="wallet"></svg>${esc(estado.filtro.contaNome || 'Todas as contas')}<svg data-lucide="chevron-down"></svg></button>` : '';
    return `<div class="rx-top">
        <button type="button" class="rx-voltar" data-rx="fechar" aria-label="Voltar para Relatórios"><svg data-lucide="chevron-left"></svg>Relatórios</button>
        <span class="rx-sp"></span>
        <button type="button" data-rx="periodo"><svg data-lucide="calendar"></svg>${esc(rotuloFiltro())}<svg data-lucide="chevron-down"></svg></button>
        ${contaChip}
      </div>
      <div class="rx-corpo" aria-live="polite"><div class="rx-msg">Montando ${esc(r.nome)}…</div></div>
      <div class="rx-pe"><button type="button" class="rx-sec" data-rx="pdf"><svg data-lucide="printer"></svg>PDF</button><button type="button" class="rx-pri" data-rx="compartilhar"><svg data-lucide="share-2"></svg>Compartilhar</button></div>`;
}

function aplicarVista() {
    const doc = document.querySelector('#rz-relexec .rzrel');
    if (doc) doc.classList.toggle('m', window.innerWidth < 860);
}

async function carregar() {
    const el = document.getElementById('rz-relexec'); if (!el) return;
    el.innerHTML = telaHtml();
    ligar(el);
    if (typeof rzIcones === 'function') rzIcones();
    const corpo = el.querySelector('.rx-corpo');
    try {
        const dados = await buscar();
        const m = RELATORIOS[estado.tipo].montar(dados);
        estado.dados = dados; estado.montado = m;
        const total = m.paginas.length;
        corpo.innerHTML = `<div class="rzrel">${m.paginas.map(([html, secs], i) => pagina(dados, m.cfg, i + 1, total, html, secs)).join('')}</div>`;
        // "rzrel" com display:contents não é preciso: as páginas ficam empilhadas
        corpo.querySelector('.rzrel').style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:20px;width:100%';
        aplicarVista();
    } catch (e) {
        console.error('[rz] relatório', e);
        corpo.innerHTML = `<div class="rx-msg">Não foi possível montar o relatório.<br><small>${esc(e.message || e)}</small></div>`;
    }
}

function ligar(el) {
    el.querySelectorAll('[data-rx]').forEach(b => b.addEventListener('click', () => {
        const acao = b.dataset.rx;
        if (acao === 'fechar') fecharRelatorioExecutivo();
        else if (acao === 'periodo') escolherPeriodo();
        else if (acao === 'conta') escolherConta();
        else if (acao === 'pdf') imprimir();
        else if (acao === 'compartilhar') compartilhar();
    }));
}

function escolherPeriodo() {
    const hoje = new Date(), m0 = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    if (estado.tipo === 'fluxo') {
        const ops = [
            ['Últimos 3 meses e próximos 2', -3, 2], ['Últimos 6 meses', -5, 0], ['Próximos 6 meses', 0, 5],
            ['Este ano', -m0.getMonth(), 11 - m0.getMonth()], ['Últimos 12 meses', -11, 0]
        ];
        abrirSheetAcoes({ titulo: 'Período', sub: 'Fluxo de caixa', acoes: ops.map(([t, a, b]) => ({
            icone: 'calendar', titulo: t, sub: `${comp(iso(somaMeses(m0, a)))} a ${comp(iso(somaMeses(m0, b)))}`,
            aoTocar: () => { Object.assign(estado.filtro, { de: iso(somaMeses(m0, a)), ate: iso(somaMeses(m0, b)), rotulo: t }); carregar(); } })) });
    } else {
        const ops = Array.from({ length: 12 }, (_, i) => iso(somaMeses(m0, -i)));
        abrirSheetAcoes({ titulo: 'Competência', sub: 'Visão gerencial', acoes: ops.map(c => ({
            icone: 'calendar', titulo: comp(c), sub: c === iso(m0) ? 'mês atual · prévia' : '',
            aoTocar: () => { estado.filtro.competencia = c; carregar(); } })) });
    }
}

async function escolherConta() {
    const { data, error } = await dbAuth.rpc('fn_contas_listar', { p_cliente_id: CLIENTE_ID_SUPABASE });
    if (error) { rzToast('Não foi possível listar as contas: ' + error.message, 'danger'); return; }
    const contas = Array.isArray(data?.dados) ? data.dados.filter(c => c && c.id) : [];
    abrirSheetAcoes({ titulo: 'Conta', sub: 'Fluxo de caixa', acoes: [
        { icone: 'layers', titulo: 'Todas as contas', aoTocar: () => { Object.assign(estado.filtro, { conta: null, contaNome: null }); carregar(); } },
        ...contas.map(c => ({ icone: 'wallet', titulo: c.nome, sub: c.situacao === 'encerrada' ? 'encerrada' : (c.titular_nome || c.titular || ''),
            aoTocar: () => { Object.assign(estado.filtro, { conta: c.id, contaNome: c.nome }); carregar(); } }))
    ] });
}

function imprimir() {
    if (!estado?.montado) return;
    const doc = document.querySelector('#rz-relexec .rzrel');
    const tituloAntes = document.title;
    const empresa = String(estado.dados.empresa || 'empresa').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    const quando = estado.tipo === 'fluxo' ? estado.filtro.ate.slice(0, 7) : estado.filtro.competencia.slice(0, 7);
    document.title = `raiz_${RELATORIOS[estado.tipo].arquivo}_${empresa}_${quando}`; // REL-38: nome do arquivo
    doc?.classList.remove('m');
    document.body.classList.add('rz-imprimindo-rel');
    const fim = () => { document.body.classList.remove('rz-imprimindo-rel'); document.title = tituloAntes; aplicarVista(); window.removeEventListener('afterprint', fim); };
    window.addEventListener('afterprint', fim);
    setTimeout(() => window.print(), 50);
}

async function compartilhar() {
    if (!estado?.montado) return;
    const [l1, l2, l3] = estado.montado.linhas3; // REL-42
    const r = await RaizDevice.share({ titulo: l1, texto: `${l1}\n${l2}\n${l3}` });
    if (r && r.ok === false && r.motivo === 'sem_share') {
        try { await navigator.clipboard.writeText(`${l1}\n${l2}\n${l3}`); rzToast('Resumo copiado. Para enviar o arquivo, use PDF.'); }
        catch (e) { rzToast('Este aparelho não compartilha daqui. Use PDF.', 'warning'); }
    }
}

export function fecharRelatorioExecutivo() {
    document.getElementById('rz-relexec')?.remove();
    window.removeEventListener('resize', aplicarVista);
    estado = null;
}

export function abrirRelatorioExecutivo(tipo) {
    const r = RELATORIOS[tipo];
    if (!r) return;
    if (rzMostrarBloqueio(r.codigo)) return; // ACE-04: bloqueado mostra o motivo
    garantirCss();
    fecharRelatorioExecutivo();
    estado = { tipo, filtro: filtroPadrao(tipo), dados: null, montado: null };
    const el = document.createElement('div');
    el.id = 'rz-relexec';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', r.nome);
    document.body.appendChild(el);
    window.addEventListener('resize', aplicarVista);
    carregar();
}

// usados por testes e pelo protótipo
export const _interno = { montarFluxo, montarGerencial, compacto, comp };
