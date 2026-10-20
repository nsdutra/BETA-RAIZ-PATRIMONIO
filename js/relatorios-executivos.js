// ============================================================================
// relatorios-executivos.js — Raiz Patrimônio · Relatórios no modelo executivo
// Versão: 1.6.1 · 20/10/2026
//
// v1.6.1 (20/10/2026, sessão 20261020-1846-balanco-ativo, demanda b8ff7e8d; prints do Nicola 18:37, de acordo 19:12) — no
//   celular o relatório não corta mais a lateral: o texto das células quebra linha (descrição longa como
//   "MERCADOLIVRE*MERCADOLIV" empurrava o valor para fora), a coluna Δ % da tabela "Por conta" fica só no PDF (classe hm,
//   como as outras colunas secundárias) e, se ainda passar da tela, a página rola de lado em vez de cortar. O PDF não muda.
// Versão anterior: 1.6.0 · 19/10/2026
//
// v1.6.0 (19/10/2026, sessão 20261018-2336-usos-lotes, demanda 63649288; FICHA_COCKPIT_METAS_RELATORIO_RAIZ v1.0.0 e protótipo
// v1.0.0, telas 4 a 7, de acordo do Nicola 18/10 23:36) — cockpit C3, relatório novo "Relatório executivo"
// (relatorios.executivo), lido de fn_relatorio_executivo:
//   · do ramo, 2 páginas: capa com manchete e 3 pontos montados a partir dos números (D-CK6), os 4 números (resultado,
//     receita, despesa, margem), o resultado acumulado real × ano anterior × meta e a ponte da meta ao real por grupo
//     (sem meta: a composição do resultado); página 2 com o demonstrativo na ordem da DRE (real até o mês, ano anterior,
//     meta, Δ meta) e o resultado por ativo;
//   · consolidado: uma página-resumo (uma linha por ramo, Geral e Consolidado, a mesma soma do Hoje) e as 2 de cada ramo;
//   · notação REL-57: real em cor cheia escura, ano anterior em cinza claro, meta em contorno; verde e vermelho só na
//     variação; filtro de ano e de ramo; abrirRelatorioExecutivo('executivo', { ramo, ramoNome }).
// Versão anterior: 1.5.0 · 16/10/2026
//
// v1.5.0 (16/10/2026, sessão 20261016-2010-rel-cadastro, demanda 91e3516e; de acordo do Nicola 16/10 20:08) — relatório
// novo "Cadastro da carteira" (relatorios.cadastro_carteira): planilha .xlsx com imóveis, contratos e locatários, uma
// linha por imóvel × contrato ativo, coluna Diagnóstico e Recomendações no fim, lida de fn_relatorio_cadastro_carteira.
// Abas Carteira (filtro em todas as colunas), Por empreendimento (escolha na célula B5) e Sobre. ExcelJS 4.4.0 carregado
// sob demanda (jsdelivr, cdnjs de reserva); símbolo da marca desenhado em PNG na hora. abrirRelatorioCadastroCarteira()
// abre a escolha do empreendimento e baixa o arquivo (exceção à REL-36 registrada na demanda).
// Versão anterior: 1.4.0 · 14/10/2026
//
// v1.4.0 (14/10/2026, sessão 20261014-2145-onda9c-textos, demanda a05ad2ee; onda 9c do estudo PROTOTIPO_UX_DENSIDADE_RAMOS_RAIZ
// v1.2.0, D6 seção 10) — textos no limite: ação até 24 caracteres, descrição até 28, aviso até 40 com o resultado e tela
// vazia em 1 frase de até 40. A explicação longa fica na confirmação, quando existe. Nada de comportamento mudou.
// Também: o resumo do topo do relatório troca o style com cor solta por uma classe (.acao-sub.rx-resumo) — zera o
// hex_solto_style deste arquivo no verificar_gramatica.py.
// Versão anterior: 1.3.0 · 11/10/2026
//
// v1.3.0 (11/10/2026, sessão 20261008-1231-pessoas-ativos, demandas 0aa64e93 e 7c5c4c65; F13.8, ficha v1.4.0 e protótipo v1.3.0; de acordo do Nicola 11/10 22:55) — relatório
// novo "Retiradas extraordinárias" (relatorios.retiradas_extraordinarias), lido de fn_relatorio_retiradas_extraordinarias:
//   · só fatos e dados (REL-56): capa com cabeçalho, uma linha de números do período, 4 números e 2 gráficos de título
//     descritivo; sem manchete, sem pontos de conclusão, sem adjetivo e sem cor de juízo;
//   · com o controle de partes ligado na empresa: tabela "Pessoas com parte definida" (parte e diferença em cor neutra,
//     com sinal), traço da parte no gráfico por pessoa e "Pessoas sem parte definida"; aviso quando a soma ≠ 100%;
//   · filtro por ano ou "Todos os anos"; aberto a partir do ativo pessoa, chip com o nome (recorte por pessoa, REL-46);
//   · abrirRelatorioExecutivo(tipo, opcoes) aceita { pessoaId, pessoaNome }.
// --------------------------------------------------------------------------
// Versões anteriores (v1.2.0 … v1.2.0): CHANGELOG_MODULOS.md, na raiz do repositório — o
// gerar_versoes.py rola pra lá automaticamente tudo além das 5 versões
// mais recentes deste cabeçalho (VER-06).
import { rzMostrarBloqueio } from './comum-licenca.js';
import { rzToast } from './raiz-ui.js';
import RaizDevice from './raiz-device.js';

export const VERSAO = '1.6.1';

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
        ? `<div class="r"><b class="rzm"><svg class="rzm-s" viewBox="16 2 88 112" width="11" height="14" fill="none" stroke="#1e3a32" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M60 64 C60 50 26 52 26 30"/><path d="M60 64 C60 50 44 38 44 16"/><path d="M60 64 C60 50 60 32 60 10"/><path d="M60 64 C60 50 76 38 76 16"/><path d="M60 64 C60 50 94 52 94 30"/><path d="M60 64 V92"/><path d="M60 80 C52 86 44 88 36 98"/><path d="M60 80 C68 86 76 88 84 98"/><circle cx="26" cy="30" r="7" fill="#7e6596" stroke="none"/><circle cx="44" cy="16" r="7" fill="#3c4f9a" stroke="none"/><circle cx="60" cy="10" r="7" fill="#3f8163" stroke="none"/><circle cx="76" cy="16" r="7" fill="#7a8f3c" stroke="none"/><circle cx="94" cy="30" r="7" fill="#966040" stroke="none"/></svg>Raiz Patrimônio</b>Gerado em ${c.data} às ${c.hora}<br>por ${esc(d.gerado_por || 'Raiz')}</div>`
        : `<div class="r"><b class="rzm"><svg class="rzm-s" viewBox="16 2 88 112" width="11" height="14" fill="none" stroke="#1e3a32" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M60 64 C60 50 26 52 26 30"/><path d="M60 64 C60 50 44 38 44 16"/><path d="M60 64 C60 50 60 32 60 10"/><path d="M60 64 C60 50 76 38 76 16"/><path d="M60 64 C60 50 94 52 94 30"/><path d="M60 64 V92"/><path d="M60 80 C52 86 44 88 36 98"/><path d="M60 80 C68 86 76 88 84 98"/><circle cx="26" cy="30" r="7" fill="#7e6596" stroke="none"/><circle cx="44" cy="16" r="7" fill="#3c4f9a" stroke="none"/><circle cx="60" cy="10" r="7" fill="#3f8163" stroke="none"/><circle cx="76" cy="16" r="7" fill="#7a8f3c" stroke="none"/><circle cx="94" cy="30" r="7" fill="#966040" stroke="none"/></svg>Raiz Patrimônio</b>${esc(cfg.nome)}</div>`;
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
      <table><thead><tr><th>Conta</th><th class="hm">Contabilidade</th><th class="n">Entradas</th><th class="n">Saídas</th><th class="n">Resultado</th><th class="n hm">Δ %</th></tr></thead><tbody>${
        contas.map(c => { const dv = variacao(c.resultado, c.resultado_anterior); return `<tr><td>${esc(c.nome)}</td><td class="hm">${c.incorpora_contabil ? 'Entra' : '<span class="tag">fora</span>'}</td><td class="n">${tab(c.entradas)}</td><td class="n">${tab(c.saidas)}</td><td class="n">${tab(c.resultado)}</td><td class="n hm ${deltaClasse(dv)}">${dv == null ? '—' : pct(dv, true)}</td></tr>`; }).join('')
      }<tr class="tot"><td>Total gerencial</td><td class="hm"></td><td class="n">${tab(contas.reduce((s, c) => s + num(c.entradas), 0))}</td><td class="n">${tab(contas.reduce((s, c) => s + num(c.saidas), 0))}</td><td class="n">${tab(totRes)}</td><td class="n hm"></td></tr></tbody></table>
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
// Relatório executivo (v1.6.0, cockpit C3) — do ramo e consolidado. Notação REL-57: real cheio escuro, ano anterior cinza,
// meta em contorno. Manchete e pontos montados aqui a partir dos números (D-CK6).
// ---------------------------------------------------------------------------
// resultado acumulado: 3 linhas (real até o mês, ano anterior, meta)
function svgAcumulado(serie, ate, o = {}) {
    const W = o.w || 320, H = o.h || 170, top = 18, bot = 22, esq = 6, dir = 46;
    const acc = (campo, n) => { let t = 0; return serie.slice(0, n).map(m => (t += num(m[campo]))); };
    const ac = acc('ac', ate), py = acc('py', 12), pl = o.temMeta ? acc('pl', 12) : [];
    const todos = [...ac, ...py, ...pl, 0];
    const mx = Math.max(...todos), mn = Math.min(...todos), sc = (H - top - bot) / ((mx - mn) || 1);
    const X = i => esq + i * (W - esq - dir) / 11, Y = v => top + (mx - v) * sc;
    const linha = (vals, cor, extra = '') => vals.length ? `<polyline points="${vals.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ')}" fill="none" stroke="${cor}" stroke-width="${o.sw || 2}" ${extra}/>` : '';
    let s = `<line class="zl" x1="0" x2="${W - dir}" y1="${Y(0)}" y2="${Y(0)}" stroke="${C.ink}" stroke-width=".6"/>`;
    s += linha(py, C.cinza) + linha(pl, C.sprout, 'stroke-dasharray="4 3"') + linha(ac, C.pine, 'stroke-width="2.6"');
    const fim = (vals, cor, rot, i = vals.length - 1) => vals.length ? txt(X(i) + 4, Y(vals[i]) + 3, `${rot} ${mil(vals[i] * 1000)}`, { a: 'start', fs: 8, f: cor, fw: 600 }) : '';
    s += fim(py, C.mut, String(o.anoAnt || '')) + fim(pl, C.sprout, 'meta') + fim(ac, C.pine, String(o.ano || ''));
    MESES.forEach((m, i) => { if (i % 2 === 0 || i === 11) s += txt(X(i), H - 6, m, { f: C.mut, c: 'mu', fs: 8 }); });
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.aria || '')}">${s}</svg>`;
}

function blocoExecutivo(b, d) {
    const ate = num(d.mes_ate), ano = num(d.ano), mesTxt = MESES[ate - 1];
    const serie = b.serie || [];
    const soma = (campo, n = ate) => serie.slice(0, n).reduce((t, m) => t + num(m[campo]), 0);
    const rec = soma('ac_receita'), desp = soma('ac_despesa'), res = soma('ac');
    const recPy = soma('py_receita'), despPy = soma('py_despesa'), resPy = soma('py');
    const temMeta = !!b.tem_meta, resPl = temMeta ? soma('pl') : null;
    const margem = rec > 0 ? res / rec * 100 : null, margemPy = recPy > 0 ? resPy / recPy * 100 : null;
    const dRes = variacao(res, resPy), dRec = variacao(rec, recPy), dDesp = variacao(desp, despPy);
    const dPl = temMeta ? variacao(res, resPl) : null;
    const grupos = (b.grupos || []).filter(g => g.grupo_resultado !== 'fora_resultado');
    const rec_g = grupos.filter(g => g.direcao === 'entrada'), desp_g = grupos.filter(g => g.direcao === 'saida');
    const periodo = ate === 12 ? String(ano) : `jan–${mesTxt} ${ano}`;
    // manchete (REL-49) e pontos — fatos destes números, frase montada aqui
    let manchete = `${b.nome}: resultado de ${compacto(res)} ${ate === 12 ? 'em ' + ano : 'até ' + mesLongo(ano + '-' + String(ate).padStart(2, '0') + '-01')}`;
    if (temMeta && dPl != null) manchete += `, ${pct(Math.abs(dPl))} ${res >= resPl ? 'acima' : 'abaixo'} da meta`;
    else if (dRes != null) manchete += `, ${pct(Math.abs(dRes))} ${res >= resPy ? 'acima' : 'abaixo'} de ${ano - 1}`;
    manchete += '.';
    // grupo que mais explica: contra a meta, quando há; senão, o maior grupo de despesa
    const efeito = g => (g.direcao === 'entrada' ? 1 : -1) * (num(g.ac) - num(g.pl));
    const gExplica = temMeta ? grupos.filter(g => g.pl != null).sort((x, y) => Math.abs(efeito(y)) - Math.abs(efeito(x)))[0] : null;
    const gMaiorDesp = desp_g.slice().sort((x, y) => num(y.ac) - num(x.ac))[0];
    const ativos = (b.por_ativo || []).slice().sort((x, y) => Math.abs(num(y.resultado)) - Math.abs(num(x.resultado)));
    const aTop = ativos[0];
    const pontos = [
        { a: `Receita de ${compacto(rec)}${dRec != null ? ', ' + pct(dRec, true) + ' contra ' + (ano - 1) : ''}.`, b: `Despesa de ${compacto(desp)}${dDesp != null ? ', ' + pct(dDesp, true) + ' contra ' + (ano - 1) : ''}.` },
        gExplica && Math.abs(efeito(gExplica)) >= 1
            ? { a: `${gExplica.nome} é o grupo que mais ${efeito(gExplica) >= 0 ? 'ajuda' : 'pesa'} contra a meta.`, b: `${compacto(gExplica.ac)} no real contra ${compacto(gExplica.pl)} de meta até ${mesTxt}.` }
            : gMaiorDesp ? { a: `${gMaiorDesp.nome} é a maior despesa: ${compacto(gMaiorDesp.ac)}.`, b: desp ? `${pct(num(gMaiorDesp.ac) / desp * 100)} das despesas do ${b.nome.toLowerCase() === 'geral' ? 'período' : 'ramo'}.` : '' }
            : { a: 'Nenhuma despesa no período.', b: 'Toda a receita virou resultado.' },
        aTop ? { a: `${aTop.nome} é o ativo de maior peso: ${compacto(aTop.resultado)}.`, b: res ? `Equivale a ${pct(Math.abs(num(aTop.resultado) / res) * 100)} do resultado do ramo.` : 'O ramo não tem resultado no período.' }
             : { a: 'Nenhum ativo com lançamento.', b: 'O resultado vem de contratos e rateios do ramo.' }
    ];
    const vsTxt = (v, rot) => v == null ? '' : seta(v) + pct(v, true) + ' ' + rot;
    const kpis = `<div class="kpis">${
        kpi('Resultado', compacto(res), temMeta ? vsTxt(dPl, 'vs meta') : vsTxt(dRes, 'vs ' + (ano - 1)), deltaClasse(temMeta ? dPl : dRes)) +
        kpi('Receita', compacto(rec), vsTxt(dRec, 'vs ' + (ano - 1)), deltaClasse(dRec)) +
        kpi('Despesa', compacto(desp), vsTxt(dDesp, 'vs ' + (ano - 1)), deltaClasse(dDesp, false)) +
        kpi('Margem', margem != null ? pct(margem) : '—', margem != null && margemPy != null ? (margem - margemPy >= 0 ? '+' : '−') + nf(Math.abs(margem - margemPy), 1) + ' p.p. vs ' + (ano - 1) : 'resultado ÷ receita', margem != null && margemPy != null ? deltaClasse(margem - margemPy) : 'mut')
    }</div>`;
    const tituloAcum = temMeta ? (res >= resPl ? `Resultado acima da meta até ${mesTxt}` : `Resultado abaixo da meta até ${mesTxt}`)
        : (res >= resPy ? `Resultado à frente de ${ano - 1} até ${mesTxt}` : `Resultado atrás de ${ano - 1} até ${mesTxt}`);
    const figAcum = figura(tituloAcum, `Resultado acumulado no ano · R$ mil · escuro = ${ano}, cinza = ${ano - 1}${temMeta ? ', tracejado = meta' : ''}`,
        svgAcumulado(serie.map(m => ({ ac: num(m.ac) / 1000, py: num(m.py) / 1000, pl: num(m.pl) / 1000 })), ate, { temMeta, ano, anoAnt: ano - 1, aria: 'Resultado acumulado' }),
        `Raiz · fn_relatorio_executivo · ${periodo}`);
    let fig2;
    if (temMeta) {
        const passos = [{ l: 'Meta', v: resPl / 1000, t: 'tot' }];
        grupos.filter(g => g.pl != null || num(g.ac)).forEach(g => { const e = efeito({ ...g, pl: num(g.pl) }); if (Math.abs(e) >= 1) passos.push({ l: rotulo2(g.nome), v: Math.abs(e) / 1000, t: e >= 0 ? 'up' : 'down' }); });
        passos.push({ l: 'Real', v: res / 1000, t: 'tot' });
        fig2 = figura(`Da meta de ${compacto(resPl)} ao real de ${compacto(res)}`, `Efeito de cada grupo no resultado · ${periodo} · R$ mil`, svgPonte(passos.slice(0, 9), { aria: 'Ponte da meta ao real' }), 'Raiz · fn_relatorio_executivo · ramo_metas');
    } else {
        const top = grupos.slice().sort((x, y) => num(y.ac) - num(x.ac)).slice(0, 6);
        fig2 = figura(top[0] ? `${top[0].nome} é o maior grupo do ${periodo.length > 4 ? 'período' : 'ano'}` : 'Sem grupos no período', `Receitas e despesas por grupo · ${periodo} · R$ · sem meta definida`, '',
            'Raiz · fn_relatorio_executivo', `<div style="margin-top:12px">${barrasH(top.map(g => ({ l: g.nome, v: num(g.ac), g: g.direcao === 'saida' })), x => compacto(x.v), 120)}</div>`);
    }
    const capa = `
      <div class="acao">${esc(manchete)}</div>
      <div class="acao-sub"><i>Leitura</i>gerada a partir dos números deste relatório</div>
      ${kpis}${pontosHtml(pontos)}
      <div class="g2">${figAcum}${fig2}</div>`;
    // página 2 — demonstrativo (REL-29/59): real até o mês, ano anterior (ano inteiro), meta até o mês, Δ meta
    const linG = g => {
        const dv = g.pl != null ? num(g.ac) - num(g.pl) : null, bomSobe = g.direcao === 'entrada';
        const cls = dv == null || dv === 0 ? '' : ((dv > 0) === bomSobe ? 'pos' : 'neg');
        return `<tr><td>${g.direcao === 'saida' ? '(−) ' : ''}${esc(g.nome)}</td><td class="n">${tab(g.ac)}</td><td class="n hm">${tab(g.py)}</td><td class="n">${g.pl == null ? '—' : tab(g.pl)}</td><td class="n ${cls}">${dv == null ? '—' : (dv > 0 ? '+' : '') + tab(dv)}</td></tr>`;
    };
    const tot = (lista, k) => lista.reduce((t, g) => t + num(g[k]), 0);
    const plRec = temMeta ? tot(rec_g, 'pl') : null, plDesp = temMeta ? tot(desp_g, 'pl') : null;
    const linT = (rot, ac, py, pl, cls, bomSobe = true) => {
        const dv = pl != null ? ac - pl : null, c = dv == null || dv === 0 ? '' : ((dv > 0) === bomSobe ? 'pos' : 'neg');
        return `<tr class="${cls}"><td>${rot}</td><td class="n">${tab(ac)}</td><td class="n hm">${tab(py)}</td><td class="n">${pl == null ? '—' : tab(pl)}</td><td class="n ${c}">${dv == null ? '—' : (dv > 0 ? '+' : '') + tab(dv)}</td></tr>`;
    };
    const ativosTab = ativos.slice(0, 12);
    const p2 = `
      ${secao(`1. Demonstrativo · ${temMeta ? (res >= resPl ? 'resultado ' + compacto(res - resPl) + ' acima da meta' : 'faltam ' + compacto(resPl - res) + ' para a meta') : 'resultado de ' + compacto(res)}`, `Ordem da DRE · ${periodo} · R$ · ${ano - 1} = ano inteiro · Δ = real − meta`)}
      <table><thead><tr><th style="width:42%">Linha</th><th class="n">${ano} (até ${mesTxt})</th><th class="n hm">${ano - 1}</th><th class="n">Meta</th><th class="n">Δ meta</th></tr></thead><tbody>
        ${rec_g.map(linG).join('')}
        ${linT('(=) Receita', rec, tot(rec_g, 'py'), plRec, 'sub')}
        ${desp_g.map(linG).join('')}
        ${linT('(=) Despesa', desp, tot(desp_g, 'py'), plDesp, 'sub', false)}
        ${linT('(=) Resultado', res, tot(rec_g, 'py') - tot(desp_g, 'py'), resPl, 'tot')}
      </tbody></table>
      <div class="box"><b>Contra ${ano - 1} no mesmo período (jan–${mesTxt}):</b> receita ${compacto(recPy)} (${dRec == null ? 'sem base' : pct(dRec, true)}), despesa ${compacto(despPy)} (${dDesp == null ? 'sem base' : pct(dDesp, true)}), resultado ${compacto(resPy)} (${dRes == null ? 'sem base' : pct(dRes, true)}).</div>
      ${ativosTab.length ? secao(`2. Por ativo · ${esc(aTop.nome)} tem o maior peso`, `${periodo} · R$ · ordem pelo tamanho do resultado`) +
        `<table><thead><tr><th>Ativo</th><th class="n">Receita</th><th class="n">Despesa</th><th class="n">Resultado</th></tr></thead><tbody>${
          ativosTab.map(a => `<tr><td>${esc(a.nome)}</td><td class="n">${tab(a.receita)}</td><td class="n">${tab(a.despesa)}</td><td class="n ${num(a.resultado) < 0 ? 'neg' : ''}">${tab(a.resultado)}</td></tr>`).join('')
        }</tbody></table>${ativos.length > 12 ? `<div class="fs">Mais ${ativos.length - 12} ativos no Hoje › ${esc(b.nome)}.</div>` : ''}` : secao('2. Por ativo', 'Nenhum ativo com lançamento no período.')}
      <div class="notes">
        <p><b>Notas.</b></p>
        <p><b>Visão competência:</b> receita e despesa pelo mês a que se referem, só o que foi recebido ou pago; as mesmas contas do Hoje (resultado por ramo).</p>
        <p><b>Ramo:</b> o lançamento vai para o ramo do ativo; o do contrato, para o ramo do uso na data. O que foi lançado sem ativo fica no Geral.</p>
        <p><b>Meta:</b> ${temMeta ? 'a do ano proporcional aos meses que passaram (ou a soma mês a mês, se a meta foi feita por mês).' : 'este ramo não tem meta para ' + ano + '; defina em Hoje › Exportar › Metas.'}</p>
        <p><b>${ano - 1}:</b> na tabela, o ano inteiro por grupo; a comparação no mesmo período está no quadro acima da tabela.</p>
        <p><b>Origem:</b> fn_relatorio_executivo v${d.versao || 1} · ${periodo}.</p>
      </div>`;
    return {
        capa, p2, manchete, res, rec, desp, resPl, linhas: [`Relatório executivo · ${b.nome} · ${periodo}`, `Resultado ${compacto(res)}${temMeta ? ' · meta ' + compacto(resPl) : ''}`, manchete]
    };
}

function montarExecutivo(d) {
    const ate = num(d.mes_ate), ano = num(d.ano), mesTxt = MESES[ate - 1];
    const periodo = ate === 12 ? String(ano) : `jan–${mesTxt} ${ano}`;
    const blocos = (d.blocos || []).map(b => ({ b, m: blocoExecutivo(b, d) }));
    const cons = d.consolidado;
    const cfg = { nome: 'Relatório executivo', medida: cons ? 'Relatório executivo · consolidado' : `Relatório executivo · ${blocos[0]?.b.nome || ''}`,
        subtitulo: `${periodo} · visão competência · ${cons ? 'todos os ramos' : 'ramo ' + (blocos[0]?.b.nome || '')}` };
    const paginas = [];
    if (cons) {
        const t = cons.total || {}, g = cons.geral || {};
        const ramos = cons.ramos || [];
        const tm = t.meta, res = num(t.resultado);
        const melhor = ramos.slice().sort((x, y) => num(y.resultado) - num(x.resultado))[0];
        let manchete = `Consolidado: resultado de ${compacto(res)} ${ate === 12 ? 'em ' + ano : 'até ' + MESES_LONGO[ate - 1]}`;
        if (tm && tm.ate_mes != null) manchete += `, ${pct(Math.abs(variacao(res, tm.ate_mes) || 0))} ${res >= num(tm.ate_mes) ? 'acima' : 'abaixo'} da meta`;
        else if (variacao(res, t.anterior?.resultado) != null) manchete += `; em ${ano - 1} inteiro foram ${compacto(t.anterior.resultado)}`;
        manchete += melhor ? `; ${melhor.nome} lidera com ${compacto(melhor.resultado)}.` : '.';
        const lin = (nome, x, cls = '') => {
            const mt = x.meta && x.meta.ate_mes != null ? num(x.meta.ate_mes) : null, dv = mt != null ? num(x.resultado) - mt : null;
            return `<tr class="${cls}"><td>${esc(nome)}</td><td class="n">${tab(x.receita)}</td><td class="n">${tab(x.despesa)}</td><td class="n ${num(x.resultado) < 0 ? 'neg' : ''}">${tab(x.resultado)}</td><td class="n hm">${x.margem != null ? pct(x.margem) : '—'}</td><td class="n">${mt == null ? '—' : tab(mt)}</td><td class="n ${dv == null || dv === 0 ? '' : dv > 0 ? 'pos' : 'neg'}">${dv == null ? '—' : (dv > 0 ? '+' : '') + tab(dv)}</td></tr>`;
        };
        const resumo = `
          <div class="acao">${esc(manchete)}</div>
          <div class="acao-sub"><i>Leitura</i>gerada a partir dos números deste relatório</div>
          <div class="kpis">${kpi('Resultado consolidado', compacto(res), tm && tm.ate_mes != null ? 'meta ' + compacto(tm.ate_mes) : '', tm && tm.ate_mes != null ? deltaClasse(res - num(tm.ate_mes)) : 'mut') +
            kpi('Receita', compacto(t.receita), '') + kpi('Despesa', compacto(t.despesa), '') + kpi('Margem', t.margem != null ? pct(t.margem) : '—', 'resultado ÷ receita')}</div>
          ${secao(`Por ramo · ${melhor ? melhor.nome + ' tem o maior resultado' : 'nenhum ramo com movimento'}`, `${periodo} · R$ · a soma das linhas é o Consolidado (o mesmo do Hoje)`)}
          <table><thead><tr><th>Ramo</th><th class="n">Receita</th><th class="n">Despesa</th><th class="n">Resultado</th><th class="n hm">Margem</th><th class="n">Meta</th><th class="n">Δ meta</th></tr></thead><tbody>
            ${ramos.map(r => lin(r.nome, r)).join('')}
            ${(num(g.receita) || num(g.despesa) || num(g.resultado)) ? lin('Geral · sem ativo', g) : ''}
            ${lin('Consolidado', t, 'tot')}
          </tbody></table>
          ${cons.soma_ok === false ? '<div class="box">A soma das linhas não fechou com o Consolidado. Avise o suporte.</div>' : ''}
          <div class="notes"><p><b>Meta do consolidado:</b> a soma das metas dos ramos; o ramo sem meta entra pelo próprio real (não pesa na variação).</p>
          <p><b>A seguir:</b> as 2 páginas de cada ramo, na ordem do resultado.</p></div>`;
        paginas.push([resumo, ['Resumo']]);
        blocos.forEach(({ m }) => { paginas.push([m.capa, ['Resumo']]); paginas.push([m.p2, ['Composição', 'Detalhe', 'Notas']]); });
        return { cfg, linhas3: [`Relatório executivo · consolidado · ${periodo}`, `Resultado ${compacto(res)}${tm && tm.ate_mes != null ? ' · meta ' + compacto(tm.ate_mes) : ''}`, manchete], paginas };
    }
    const um = blocos[0];
    if (!um) return { cfg, linhas3: ['Relatório executivo', '', ''], paginas: [['<div class="acao">Sem dados para o ramo.</div>', ['Resumo']]] };
    paginas.push([um.m.capa, ['Resumo']]); paginas.push([um.m.p2, ['Composição', 'Detalhe', 'Notas']]);
    return { cfg, linhas3: um.m.linhas, paginas };
}

// ---------------------------------------------------------------------------
// Tela: o documento em si (REL-36) — topo com período, rodapé PDF | Compartilhar
// ---------------------------------------------------------------------------
const CSS = `
/* camada 80 (DESIGN_SYSTEM §5): acima do cabeçalho e da barra inferior, abaixo do véu dos sheets (97) */
#rz-relexec{position:fixed;inset:0;z-index:80;background:var(--paper,#f4f3ee);display:flex;flex-direction:column}
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
.rzrel .page .ph .t{flex:1}.rzrel .page .ph .t .l1{font:700 13pt/1.15 'Bricolage Grotesque',Inter,sans-serif;letter-spacing:-.01em}.rzrel .page .ph .t .l2{font-size:9pt;color:#6f7a76;margin-top:3px}.rzrel .page .ph .r{text-align:right;font-size:7.5pt;color:#6f7a76}.rzrel .page .ph .r b{display:block;color:#1e3a32;font-size:9pt}.rzrel .page .ph .r b.rzm{display:flex;align-items:center;justify-content:flex-end;gap:4px}.rzrel .page .ph .r .rzm-s{flex:none}
.rzrel .page .trk{display:flex;font-size:7.5pt;color:#9aa49f;margin:-4px 0 10px}.rzrel .page .trk span{padding:2px 8px;border-right:1px solid #e6e3da}.rzrel .page .trk span:last-child{border:0}.rzrel .page .trk span.on{color:#1e3a32;font-weight:700}
.rzrel .page .acao{font:700 17pt/1.18 'Bricolage Grotesque',Inter,sans-serif;letter-spacing:-.015em;color:#17211e;margin:6px 0 4px}
.rzrel .page .acao-sub{font-size:8pt;color:#6f7a76;margin-bottom:12px}.rzrel .page .acao-sub.rx-resumo{font-size:9.5pt;color:#17211e;margin:4px 0 12px}.rzrel .page .acao-sub i{font-style:normal;border:1px solid #e6e3da;border-radius:999px;padding:1px 7px;margin-right:6px}
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
.rzrel.m .page{overflow-x:auto}.rzrel.m .page td:not(.n){overflow-wrap:anywhere;word-break:break-word}
.rzrel.m .page .hbar{font-size:13px}.rzrel.m .page .hbar span{width:120px!important}
.rzrel.m .page .notes{font-size:12px;border-top-color:var(--line,#e6e3da)}.rzrel.m .page .notes b{color:var(--ink,#17211e)}
.rzrel.m .page .pf{position:static;margin-top:12px;font-size:11px;flex-wrap:wrap;gap:6px;border-top-color:var(--line,#e6e3da)}
.rzrel.m .page .wm{font-size:56px;align-items:start;padding-top:40%}
.rzrel.m svg text{fill:var(--ink,#17211e)}.rzrel.m svg text.mu{fill:var(--muted,#6f7a76)}.rzrel.m svg .zl{stroke:var(--muted,#6f7a76)}
.rzrel .page .hbar .trk2{flex:1;position:relative;height:9px;min-width:40px}.rzrel .page .hbar .trk2 i{position:absolute;left:0;top:0}.rzrel .page .hbar .trk2 .exp{position:absolute;top:-3px;width:2px;height:15px;margin-left:-1px;background:#17211e}.rzrel .page .hbar small{color:#6f7a76;font-size:inherit}
.rzrel.m .page .hbar .trk2 .exp{background:var(--ink,#17211e)}
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

// ---------------------------------------------------------------------------
// Retiradas extraordinárias (v1.3.0, F13.8) — só fatos e dados (REL-56): sem manchete, sem pontos de conclusão, sem
// adjetivo e sem cor de juízo. A diferença para a parte vai em cor neutra, com sinal. O termo é sempre "retirada
// extraordinária"; as pessoas são "pessoas".
// ---------------------------------------------------------------------------
const qtdTxt = (n, um, varios) => `${num(n)} ${num(n) === 1 ? um : varios}`;
const pctParte = v => num(v).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + '%';
const comSinal = v => (num(v) > 0 ? '+' : '') + tab(v);
function montarRetiradas(d) {
    const cab = d.cabecalho || {}, k = d.kpis || {};
    const ano = cab.ano != null ? num(cab.ano) : null, ate = cab.ate || iso(new Date()), prim = cab.primeira_data || null;
    const anoAte = dataIso(ate).getFullYear(), anoHoje = new Date().getFullYear();
    const partes = d.partes || null, semParte = d.sem_parte || [], ligado = !!cab.controle_partes;
    const perLongo = ano ? (ano === anoHoje ? `${ano} (jan a ${compCurto(ate)})` : String(ano)) : (prim ? `Desde ${comp(prim)}` : 'Todos os anos');
    const perCurto = ano ? String(ano) : (prim ? 'desde ' + comp(prim) : 'todos os anos');
    const cfg = {
        nome: 'Retiradas extraordinárias', medida: 'Retiradas extraordinárias em R$',
        subtitulo: [perLongo, ano && prim ? 'acumulado desde ' + comp(prim) : '', 'visão caixa', d.pessoa_nome || 'pessoas'].filter(Boolean).join(' · '),
        previa: !!d.previa
    };
    const qP = num(k.qtd_periodo), tP = num(k.total_periodo), nP = num(k.pessoas_com_retirada);
    let resumo = !prim ? 'Nenhuma retirada extraordinária registrada.'
        : qP ? `${perLongo}: ${qtdTxt(qP, 'retirada extraordinária', 'retiradas extraordinárias')}, ${brl(tP)}, para ${qtdTxt(nP, 'pessoa', 'pessoas')}.`
        : `${perLongo}: nenhuma retirada extraordinária.`;
    if (ano && prim) resumo += ` Acumulado desde ${comp(prim)}: ${qtdTxt(k.qtd_acumulado, 'retirada', 'retiradas')}, ${brl(k.total_acumulado)}.`;
    const porAno = d.por_ano || [];
    const doAno = a => porAno.find(x => num(x.ano) === a) || { total: 0, qtd: 0 };
    const somaPartes = partes ? num(partes.soma_partes) : 0;
    const k4 = ligado
        ? kpi('Pessoas com parte definida', String(num(k.pessoas_com_parte)), num(k.pessoas_sem_parte) ? qtdTxt(k.pessoas_sem_parte, 'pessoa sem parte', 'pessoas sem parte') : 'soma ' + pctParte(somaPartes))
        : kpi(ano ? `Pessoas com retirada em ${ano}` : 'Pessoas com retirada', String(nP), 'de ' + qtdTxt(k.pessoas_total, 'pessoa', 'pessoas'));
    const kpis = `<div class="kpis">${ano
        ? kpi(`Retiradas extraordinárias em ${ano}`, compacto(tP), qtdTxt(qP, 'retirada', 'retiradas')) +
          kpi(prim ? `Acumulado desde ${comp(prim)}` : 'Acumulado', compacto(k.total_acumulado), qtdTxt(k.qtd_acumulado, 'retirada', 'retiradas')) +
          kpi(`Em ${ano - 1}`, compacto(k.total_ano_anterior), qtdTxt(k.qtd_ano_anterior, 'retirada', 'retiradas'))
        : kpi(prim ? `Total desde ${comp(prim)}` : 'Total', compacto(tP), qtdTxt(qP, 'retirada', 'retiradas')) +
          kpi(`Em ${anoAte}`, compacto(doAno(anoAte).total), qtdTxt(doAno(anoAte).qtd, 'retirada', 'retiradas')) +
          kpi(`Em ${anoAte - 1}`, compacto(doAno(anoAte - 1).total), qtdTxt(doAno(anoAte - 1).qtd, 'retirada', 'retiradas'))
    }${k4}</div>`;
    // gráfico 1: por pessoa, com o traço da parte quando o controle está ligado
    const linhaP = Object.fromEntries(((partes && partes.linhas) || []).map(l => [l.pessoa_id, l]));
    const pp = (d.por_pessoa || []).filter(p => num(p.recebido_periodo) > 0 || linhaP[p.pessoa_id]);
    const mx = Math.max(1, ...pp.map(p => num(p.recebido_periodo)), ...Object.values(linhaP).map(l => num(l.parte_periodo)));
    const barras = pp.map(p => {
        const l = linhaP[p.pessoa_id];
        return `<div class="hbar"><span style="width:150px">${esc(p.nome)}</span><div class="trk2"><i style="width:${Math.max(0.6, Math.round(num(p.recebido_periodo) / mx * 1000) / 10)}%"></i>${l ? `<em class="exp" style="left:${Math.round(num(l.parte_periodo) / mx * 1000) / 10}%" title="Parte: ${esc(brl(l.parte_periodo))}"></em>` : ''}</div><b>${mil(p.recebido_periodo)}</b></div>`;
    }).join('') || '<p class="mut">Nenhuma retirada extraordinária.</p>';
    const unid1 = 'R$ mil' + (partes ? ` · traço = parte da pessoa (percentual × ${compacto(partes.base_periodo)} recebidos pelas pessoas com parte)${pp.some(p => !linhaP[p.pessoa_id]) ? ' · sem traço = pessoa sem parte definida' : ''}` : '');
    const fonte = `Raiz · fn_relatorio_retiradas_extraordinarias · ${perCurto}`;
    const col = ano
        ? (d.por_mes || []).map(m => ({ l: MESES[num(m.mes) - 1], titulo: `${MESES[num(m.mes) - 1]}/${ano}`, v: num(m.total) / 1000 }))
        : porAno.map(a => ({ l: String(a.ano), titulo: String(a.ano), v: num(a.total) / 1000 }));
    const capa = `
      <div class="acao-sub rx-resumo">${esc(resumo)}</div>
      ${kpis}
      <div class="g2">
        ${figura(`Retiradas por pessoa ${ano ? 'em ' + ano : perCurto}`, unid1, '', fonte, barras)}
        ${figura(ano ? `Retiradas por mês em ${ano}` : 'Retiradas por ano', ano ? 'R$ mil · data da retirada' : 'R$ mil', col.length ? svgColunas(col, { aria: ano ? 'Retiradas por mês' : 'Retiradas por ano' }) : '<p class="mut">Sem dados.</p>', fonte)}
      </div>`;
    // página 2: partes, detalhe, por ano e notas
    let n = 0;
    const rot = ano ? String(ano) : '';
    let p2 = '';
    if (partes) {
        const ls = partes.linhas || [];
        const tot = c => ls.reduce((t, l) => t + num(l[c]), 0);
        p2 += secao(`${++n}. Pessoas com parte definida`, `Minha empresa › Rotinas · parte = percentual × total recebido pelas pessoas desta tabela ${ano ? 'no ano' : 'no período'} · diferença = recebido − parte · R$`) +
            (partes.aviso_soma ? `<div class="box">As partes cadastradas somam ${pctParte(somaPartes)}. A parte de cada pessoa usa o percentual cadastrado.</div>` : '') +
            `<table><thead><tr><th>Pessoa</th><th class="n">Parte</th><th class="n">Recebido ${rot}</th><th class="n">Diferença ${rot}</th>${ano ? '<th class="n hm">Recebido acumulado</th><th class="n">Diferença acumulada</th>' : ''}</tr></thead><tbody>${
                ls.map(l => `<tr><td>${esc(l.nome)}</td><td class="n">${pctParte(l.parte)}</td><td class="n">${tab(l.recebido_periodo)}</td><td class="n">${comSinal(l.diferenca_periodo)}</td>${ano ? `<td class="n hm">${tab(l.recebido_acumulado)}</td><td class="n">${comSinal(l.diferenca_acumulado)}</td>` : ''}</tr>`).join('')
            }<tr class="tot"><td>Total das pessoas com parte</td><td class="n">${pctParte(somaPartes)}</td><td class="n">${tab(tot('recebido_periodo'))}</td><td class="n">${comSinal(tot('diferenca_periodo'))}</td>${ano ? `<td class="n hm">${tab(tot('recebido_acumulado'))}</td><td class="n">${comSinal(tot('diferenca_acumulado'))}</td>` : ''}</tr></tbody></table>`;
        if (semParte.length) p2 += `<h4 style="margin-top:10px">Pessoas sem parte definida</h4><div class="hu">Fizeram retirada extraordinária e não têm % no controle de partes · R$</div>` +
            `<table><thead><tr><th>Pessoa</th><th class="n">Recebido ${rot}</th>${ano ? '<th class="n hm">Recebido acumulado</th>' : ''}</tr></thead><tbody>${
                semParte.map(x => `<tr><td>${esc(x.nome)}</td><td class="n">${tab(x.recebido_periodo)}</td>${ano ? `<td class="n hm">${tab(x.recebido_acumulado)}</td>` : ''}</tr>`).join('')}</tbody></table>`;
    }
    const det = d.detalhe || [];
    const grupos = pp.map(p => {
        const its = det.filter(x => x.pessoa_id === p.pessoa_id);
        return `<tr class="sub"><td colspan="3">${esc(p.nome)} · ${qtdTxt(its.length, 'retirada', 'retiradas')}</td><td class="n">${tab(p.recebido_periodo)}</td></tr>` +
            its.map(x => `<tr><td>${dma(x.data)}</td><td>${x.origem === 'conciliada' ? 'Conciliada (extrato)' : 'Lançada no app'}</td><td class="hm">${esc(x.observacao || '—')}</td><td class="n">${tab(x.valor)}</td></tr>`).join('');
    }).join('');
    p2 += secao(`${++n}. Retiradas ${ano ? 'de ' + ano : perCurto} por pessoa`, 'Data da retirada · R$ · origem: conciliada (veio do extrato) ou lançada no app') +
        `<table><thead><tr><th>Data</th><th>Origem</th><th class="hm">Observação</th><th class="n">Valor</th></tr></thead><tbody>${
            grupos || '<tr><td colspan="4" class="mut">Nenhuma retirada extraordinária.</td></tr>'
        }<tr class="tot"><td colspan="3">Total ${ano ? 'de ' + ano : perCurto}</td><td class="n">${tab(tP)}</td></tr></tbody></table>`;
    const primAno = prim ? dataIso(prim).getFullYear() : null;
    p2 += secao(`${++n}. Retiradas extraordinárias por ano`, `R$ · ${d.pessoa_nome ? esc(d.pessoa_nome) : 'todas as pessoas'}`) +
        `<table><thead><tr><th>Ano</th><th class="n">Retiradas</th><th class="n">Valor</th><th class="n">Δ ano anterior</th></tr></thead><tbody>${
            porAno.map(a => `<tr><td>${a.ano}${num(a.ano) === primAno ? ` (desde ${compCurto(prim)})` : num(a.ano) === anoHoje ? ` (até ${compCurto(ate)})` : ''}</td><td class="n">${num(a.qtd)}</td><td class="n">${tab(a.total)}</td><td class="n${a.delta_pct == null ? ' mut' : ''}">${a.delta_pct == null ? '—' : pct(a.delta_pct, true)}</td></tr>`).join('') || '<tr><td colspan="4" class="mut">Nenhuma retirada extraordinária registrada.</td></tr>'
        }<tr class="tot"><td>Acumulado</td><td class="n">${num(k.qtd_acumulado)}</td><td class="n">${tab(k.total_acumulado)}</td><td class="n"></td></tr></tbody></table>`;
    p2 += `<div class="notes">
        <p><b>Retirada extraordinária</b>: retirada da empresa para uma pessoa registrada com o tipo "Extraordinária". Não abate o saldo a retirar e não gera dívida no Balanço. As retiradas do tipo "Do fluxo" ficam no relatório Distribuição aos sócios.</p>
        ${ligado
            ? '<p><b>Partes</b>: controle opcional da empresa (Minha empresa › Rotinas › Controlar retiradas extraordinárias por partes). Só as pessoas com % entram na tabela de partes; a parte é o percentual × o total recebido por elas no período, sem correção monetária. Quem fez retirada sem % aparece em "Pessoas sem parte definida". O relatório não lança nem sugere ajustes.</p>'
            : '<p><b>Partes</b>: o controle de partes não está ligado nesta empresa. Ligado, o relatório mostra a parte de cada pessoa ao lado do recebido.</p>'}
        ${d.pessoa_nome ? `<p><b>Recorte</b>: só as retiradas de ${esc(d.pessoa_nome)}.${ligado ? ' A parte usa o total recebido por todas as pessoas com parte.' : ''}</p>` : ''}
        <p><b>Visão caixa</b>: cada retirada entra na data em que saiu da conta.${d.previa ? ` <b>PRÉVIA</b>: ${mesLongo(ate)}/${anoAte} ainda não foi fechado.` : ''}</p>
        <p><b>Origem</b>: fn_relatorio_retiradas_extraordinarias v${d.versao || 1} · dados até ${dma(ate)}.</p>
      </div>`;
    return {
        cfg, linhas3: [`${cfg.nome} · ${perLongo}`, `Total ${compacto(tP)} · ${qtdTxt(qP, 'retirada', 'retiradas')} · ${qtdTxt(nP, 'pessoa', 'pessoas')}`, resumo],
        paginas: [[capa, ['Resumo']], [p2, ['Composição', 'Detalhe', 'Notas']]]
    };
}
// quem gera (rodapé e capa): a pessoa logada nesta empresa
async function quemGera() {
    try {
        const { data: u } = await dbAuth.auth.getUser();
        const uid = u?.user?.id; if (!uid) return null;
        const { data } = await dbAuth.from('pessoas').select('nome').eq('cliente_id', CLIENTE_ID_SUPABASE).eq('user_id', uid).maybeSingle();
        return data?.nome || null;
    } catch (e) { return null; }
}

const RELATORIOS = {
    fluxo: { codigo: 'relatorios.fluxo_caixa', nome: 'Fluxo de caixa', arquivo: 'fluxo_caixa', montar: montarFluxo },
    gerencial: { codigo: 'relatorios.gerencial', nome: 'Visão gerencial', arquivo: 'gerencial', montar: montarGerencial },
    retiradas: { codigo: 'relatorios.retiradas_extraordinarias', nome: 'Retiradas extraordinárias', arquivo: 'retiradas_extraordinarias', montar: montarRetiradas }, // v1.3.0 — F13.8
    executivo: { codigo: 'relatorios.executivo', nome: 'Relatório executivo', arquivo: 'executivo', montar: montarExecutivo } // v1.6.0 — cockpit C3
};
let estado = null; // { tipo, filtro, dados, montado }

function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-01'; }
function somaMeses(base, n) { const d = new Date(base.getFullYear(), base.getMonth() + n, 1); return d; }
function filtroPadrao(tipo, opcoes = {}) {
    const hoje = new Date(), m0 = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    if (tipo === 'retiradas') return { ano: hoje.getFullYear(), pessoaId: opcoes.pessoaId || null, pessoaNome: opcoes.pessoaNome || null }; // v1.3.0
    if (tipo === 'executivo') return { ano: opcoes.ano || hoje.getFullYear(), ramo: opcoes.ramo || null, ramoNome: opcoes.ramoNome || null }; // v1.6.0
    if (tipo === 'fluxo') return { de: iso(somaMeses(m0, -3)), ate: iso(somaMeses(m0, 2)), conta: null, contaNome: null, rotulo: 'Últimos 3 meses e próximos 2' };
    return { competencia: iso(somaMeses(m0, -1)) };
}
function rotuloFiltro() {
    if (!estado) return '';
    if (estado.tipo === 'fluxo') return `${comp(estado.filtro.de)} a ${comp(estado.filtro.ate)}`;
    if (estado.tipo === 'retiradas') return estado.filtro.ano ? String(estado.filtro.ano) : 'Todos os anos';
    if (estado.tipo === 'executivo') return String(estado.filtro.ano); // v1.6.0
    return comp(estado.filtro.competencia);
}

async function buscar() {
    const f = estado.filtro;
    if (estado.tipo === 'retiradas') { // v1.3.0 — a função devolve o JSON direto (sem ok/dados)
        const [{ data, error }, quem] = await Promise.all([
            dbAuth.rpc('fn_relatorio_retiradas_extraordinarias', { p_cliente_id: CLIENTE_ID_SUPABASE, p_ano: f.ano || null, p_pessoa_id: f.pessoaId || null }),
            quemGera()]);
        if (error) throw new Error(error.message);
        if (!data?.cabecalho) throw new Error('O relatório não veio.');
        return { ...data, empresa: data.cabecalho.empresa, gerado_em: new Date().toISOString(), gerado_por: quem,
                 relatorio: 'relatorios.retiradas_extraordinarias', versao: 1, visao: 'caixa', pessoa_nome: f.pessoaNome || null };
    }
    if (estado.tipo === 'executivo') { // v1.6.0 — cockpit C3
        const [{ data, error }, quem] = await Promise.all([
            dbAuth.rpc('fn_relatorio_executivo', { p_cliente_id: CLIENTE_ID_SUPABASE, p_ramo: f.ramo || null, p_ano: f.ano, p_mes_ate: null }), quemGera()]);
        if (error) throw new Error(error.message);
        if (!data?.ok) throw new Error(data?.mensagem || 'O relatório não veio.');
        return { ...data.dados, gerado_por: quem };
    }
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
    const contaChip = estado.tipo === 'fluxo' ? `<button type="button" data-rx="conta"><svg data-lucide="wallet"></svg>${esc(estado.filtro.contaNome || 'Todas as contas')}<svg data-lucide="chevron-down"></svg></button>`
        : estado.tipo === 'retiradas' && estado.filtro.pessoaId ? `<button type="button" data-rx="pessoa" aria-label="Ver todas as pessoas"><svg data-lucide="user"></svg>${esc(estado.filtro.pessoaNome || 'Pessoa')}<svg data-lucide="x"></svg></button>` // v1.3.0: recorte por pessoa; tocar volta a todas
        : estado.tipo === 'executivo' ? `<button type="button" data-rx="ramo"><svg data-lucide="layers"></svg>${esc(estado.filtro.ramoNome || 'Consolidado')}<svg data-lucide="chevron-down"></svg></button>` : ''; // v1.6.0
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
        else if (acao === 'ramo') escolherRamo(); // v1.6.0
        else if (acao === 'pessoa') { Object.assign(estado.filtro, { pessoaId: null, pessoaNome: null }); carregar(); }
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
    } else if (estado.tipo === 'executivo') { // v1.6.0 — o ano (até o mês corrente no ano atual)
        const a0 = hoje.getFullYear();
        abrirSheetAcoes({ titulo: 'Ano', sub: 'Relatório executivo', acoes: [a0, a0 - 1, a0 - 2].map(a => ({
            icone: 'calendar', titulo: String(a), sub: a === a0 ? 'até o mês atual' : 'ano inteiro', aoTocar: () => { estado.filtro.ano = a; carregar(); } })) });
    } else if (estado.tipo === 'retiradas') { // v1.3.0 — ano ou todos
        const a0 = hoje.getFullYear();
        const anos = [...new Set([a0, a0 - 1, ...((estado.dados && estado.dados.por_ano) || []).map(x => num(x.ano))])].sort((a, b) => b - a);
        abrirSheetAcoes({ titulo: 'Período', sub: 'Retiradas extraordinárias', acoes: [
            ...anos.map(a => ({ icone: 'calendar', titulo: String(a), sub: a === a0 ? 'ano atual' : '', aoTocar: () => { estado.filtro.ano = a; carregar(); } })),
            { icone: 'layers', titulo: 'Todos os anos', sub: 'desde a primeira retirada', aoTocar: () => { estado.filtro.ano = null; carregar(); } }] });
    } else {
        const ops = Array.from({ length: 12 }, (_, i) => iso(somaMeses(m0, -i)));
        abrirSheetAcoes({ titulo: 'Competência', sub: 'Visão gerencial', acoes: ops.map(c => ({
            icone: 'calendar', titulo: comp(c), sub: c === iso(m0) ? 'mês atual · prévia' : '',
            aoTocar: () => { estado.filtro.competencia = c; carregar(); } })) });
    }
}

// v1.6.0 — consolidado ou um ramo da empresa
async function escolherRamo() {
    let ramos = [];
    try { const { data } = await dbAuth.rpc('fn_cliente_ramos', { p_cliente_id: CLIENTE_ID_SUPABASE }); ramos = Array.isArray(data) ? data.map(x => typeof x === 'string' ? x : (x.fn_cliente_ramos || x)) : []; } catch (e) { ramos = []; }
    let nomes = {};
    try { const { data } = await dbAuth.from('ativo_ramos').select('codigo, nome, ordem').order('ordem'); (data || []).forEach(r => { nomes[r.codigo] = r.nome; }); } catch (e) { /* sem nomes */ }
    abrirSheetAcoes({ titulo: 'Ramo', sub: 'Relatório executivo', acoes: [
        { icone: 'layers', titulo: 'Consolidado', sub: 'todos os ramos', aoTocar: () => { Object.assign(estado.filtro, { ramo: null, ramoNome: null }); carregar(); } },
        ...ramos.map(r => ({ icone: 'circle', titulo: nomes[r] || r, aoTocar: () => { Object.assign(estado.filtro, { ramo: r, ramoNome: nomes[r] || r }); carregar(); } }))
    ] });
}

async function escolherConta() {
    const { data, error } = await dbAuth.rpc('fn_contas_listar', { p_cliente_id: CLIENTE_ID_SUPABASE });
    if (error) { rzToast('Não foi possível listar as contas: ' + error.message, 'danger'); return; }
    const contas = Array.isArray(data?.dados) ? data.dados.filter(c => c && c.id && c.tipo !== 'cartao_credito') : []; // v1.1.1 — cartão não é conta (as compras estão na conta que paga)
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
    const quando = estado.tipo === 'fluxo' ? estado.filtro.ate.slice(0, 7)
        : estado.tipo === 'retiradas' ? (estado.filtro.ano ? String(estado.filtro.ano) : 'todos')
        : estado.tipo === 'executivo' ? `${estado.filtro.ramo || 'consolidado'}_${estado.filtro.ano}` // v1.6.0
        : estado.filtro.competencia.slice(0, 7);
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
        try { await navigator.clipboard.writeText(`${l1}\n${l2}\n${l3}`); rzToast('Resumo copiado'); }
        catch (e) { rzToast('Sem compartilhar aqui. Use PDF.', 'warning'); }
    }
}

export function fecharRelatorioExecutivo() {
    document.getElementById('rz-relexec')?.remove();
    window.removeEventListener('resize', aplicarVista);
    estado = null;
}

export function abrirRelatorioExecutivo(tipo, opcoes = {}) {
    const r = RELATORIOS[tipo];
    if (!r) return;
    if (rzMostrarBloqueio(r.codigo)) return; // ACE-04: bloqueado mostra o motivo
    garantirCss();
    fecharRelatorioExecutivo();
    estado = { tipo, filtro: filtroPadrao(tipo, opcoes || {}), dados: null, montado: null };
    const el = document.createElement('div');
    el.id = 'rz-relexec';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', r.nome);
    document.body.appendChild(el);
    window.addEventListener('resize', aplicarVista);
    carregar();
}

// ---------------------------------------------------------------------------
// Cadastro da carteira (planilha .xlsx) — relatorios.cadastro_carteira, dados de fn_relatorio_cadastro_carteira
// (REL-02: a planilha só formata o que a função devolve; diagnóstico e próximo reajuste vêm prontos do banco).
// Exceção registrada à REL-36: o toque escolhe o empreendimento e baixa a planilha, sem tela intermediária
// (dem 91e3516e).
// ---------------------------------------------------------------------------
const CADASTRO_CODIGO = 'relatorios.cadastro_carteira';
const EXCELJS_URLS = [
    'https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js',
];
let __excelJs = null;
function carregarExcelJs() {
    if (window.ExcelJS) return Promise.resolve(window.ExcelJS);
    if (__excelJs) return __excelJs;
    const tentar = (i) => new Promise((ok, falha) => {
        if (i >= EXCELJS_URLS.length) { falha(new Error('Não foi possível carregar o gerador de planilha.')); return; }
        const s = document.createElement('script');
        s.src = EXCELJS_URLS[i]; s.async = true;
        s.onload = () => (window.ExcelJS ? ok(window.ExcelJS) : tentar(i + 1).then(ok, falha));
        s.onerror = () => { s.remove(); tentar(i + 1).then(ok, falha); };
        document.head.appendChild(s);
    });
    __excelJs = tentar(0).catch(e => { __excelJs = null; throw e; });
    return __excelJs;
}

// símbolo da marca (MAR-06) desenhado em PNG na hora: a planilha não carrega imagem externa
const SIMBOLO_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="16 2 88 112" width="176" height="224"><g fill="none" stroke="#1e3a32" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><path d="M60 92 V64"/><path d="M60 64 Q60 44 26 30"/><path d="M60 64 Q58 36 44 16"/><path d="M60 64 V10"/><path d="M60 64 Q62 36 76 16"/><path d="M60 64 Q60 44 94 30"/><path d="M60 92 Q50 98 40 108"/><path d="M60 92 V110"/><path d="M60 92 Q70 98 80 108"/><path d="M30 72 H90" opacity=".3"/></g><circle cx="26" cy="30" r="6.5" fill="#7e6596"/><circle cx="44" cy="16" r="6.5" fill="#3c4f9a"/><circle cx="60" cy="10" r="6.5" fill="#3f8163"/><circle cx="76" cy="16" r="6.5" fill="#7a8f3c"/><circle cx="94" cy="30" r="6.5" fill="#966040"/></svg>';
function simboloPng() {
    return new Promise((ok) => {
        try {
            const img = new Image();
            img.onload = () => {
                try {
                    const c = document.createElement('canvas'); c.width = 176; c.height = 224;
                    c.getContext('2d').drawImage(img, 0, 0, 176, 224);
                    ok(c.toDataURL('image/png'));
                } catch (e) { ok(null); }
            };
            img.onerror = () => ok(null);
            img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(SIMBOLO_SVG);
        } catch (e) { ok(null); }
    });
}

const CC = { pine: 'FF1E3A32', sprout: 'FF2F6A51', paper: 'FFF1F4EC', ink: 'FF17211E', muted: 'FF5B6662', line: 'FFE3E6E0',
    brassBg: 'FFF7ECD9', brass: 'FF8A5A1F', brassTx: 'FF6B4415', zebra: 'FFF6F7F4', loc: 'FF3C5A50', branco: 'FFFFFFFF' };
const SIT_ATIVO = { alugado: 'Alugado', disponivel: 'Disponível', uso_proprio: 'Uso próprio' };
const FORMA_PG = { pix: 'PIX', boleto: 'Boleto', transferencia: 'Transferência', dinheiro: 'Dinheiro', outro: 'Outro' };
const dataXl = (s) => { if (!s) return null; const [a, m, d] = String(s).slice(0, 10).split('-').map(Number); return new Date(Date.UTC(a, m - 1, d)); };
const nOuNulo = (v) => (v === null || v === undefined || v === '' ? null : Number(v));
const tOuNulo = (v) => { const t = String(v ?? '').trim(); return t || null; };

// [grupo, cabeçalho, largura, formato, leitura da linha]
const CADASTRO_COLUNAS = [
    ['Imóvel', 'Empreendimento', 18, null, r => r.empreendimento],
    ['Imóvel', 'Imóvel', 30, null, r => r.imovel],
    ['Imóvel', 'Tipo', 16, null, r => tOuNulo(r.tipo)],
    ['Imóvel', 'Endereço', 28, null, r => tOuNulo(r.endereco)],
    ['Imóvel', 'Nº', 7, null, r => tOuNulo(r.numero)],
    ['Imóvel', 'Complemento', 14, null, r => tOuNulo(r.complemento)],
    ['Imóvel', 'Bairro', 16, null, r => tOuNulo(r.bairro)],
    ['Imóvel', 'Cidade/UF', 16, null, r => tOuNulo(r.cidade_uf)],
    ['Imóvel', 'CEP', 11, null, r => tOuNulo(r.cep)],
    ['Imóvel', 'Área (m²)', 10, '#,##0.00', r => nOuNulo(r.area_m2)],
    ['Imóvel', 'Situação', 12, null, r => SIT_ATIVO[r.situacao] || tOuNulo(r.situacao)],
    ['Imóvel', 'Valor de referência (R$)', 16, '#,##0.00', r => nOuNulo(r.valor_referencia)],
    ['Imóvel', 'Data do valor', 12, 'dd/mm/yyyy', r => dataXl(r.valor_referencia_em)],
    ['Imóvel', 'Aluguel desejado (R$)', 14, '#,##0.00', r => nOuNulo(r.aluguel_desejado)],
    ['Imóvel', 'Proprietários e %', 30, null, r => tOuNulo(r.proprietarios)],
    ['Imóvel', 'Observação', 24, null, r => tOuNulo(r.observacao)],
    ['Contrato', 'Situação do contrato', 13, null, r => (r.contrato_situacao ? r.contrato_situacao.charAt(0).toUpperCase() + r.contrato_situacao.slice(1) : null)],
    ['Contrato', 'Tipo de contrato', 22, null, r => tOuNulo(r.contrato_tipo)],
    ['Contrato', 'Início', 11, 'dd/mm/yyyy', r => dataXl(r.inicio)],
    ['Contrato', 'Fim', 11, 'dd/mm/yyyy', r => dataXl(r.fim)],
    ['Contrato', 'Dia de vencimento', 10, '0', r => nOuNulo(r.vencimento_dia)],
    ['Contrato', 'Aluguel atual (R$)', 14, '#,##0.00', r => nOuNulo(r.aluguel)],
    ['Contrato', 'Aluguel anterior (R$)', 14, '#,##0.00', r => nOuNulo(r.aluguel_anterior)],
    ['Contrato', 'Índice de reajuste', 11, null, r => tOuNulo(r.reajuste)],
    ['Contrato', 'Periodicidade (meses)', 12, '0', r => nOuNulo(r.periodicidade_meses)],
    ['Contrato', 'Próximo reajuste', 12, 'dd/mm/yyyy', r => dataXl(r.proximo_reajuste)],
    ['Contrato', 'Forma de pagamento', 13, null, r => FORMA_PG[r.forma_pagamento] || tOuNulo(r.forma_pagamento)],
    ['Contrato', 'Administradora', 20, null, r => tOuNulo(r.administradora)],
    ['Locatário', 'Locatário', 30, null, r => tOuNulo(r.locatario)],
    ['Locatário', 'PF/PJ', 7, null, r => ({ cpf: 'PF', cnpj: 'PJ' })[String(r.doc_tipo || '').toLowerCase()] || tOuNulo(r.doc_tipo)],
    ['Locatário', 'CPF/CNPJ', 19, null, r => tOuNulo(r.documento)],
    ['Locatário', 'Pessoa de contato', 18, null, r => tOuNulo(r.contato)],
    ['Locatário', 'WhatsApp', 16, null, r => tOuNulo(r.whatsapp)],
    ['Locatário', 'E-mail', 24, null, r => tOuNulo(r.email)],
    ['Diagnóstico', 'Diagnóstico', 60, null, r => tOuNulo(r.diagnostico)],
];

function dataBr(s) { if (!s) return ''; const [a, m, d] = String(s).slice(0, 10).split('-'); return `${d}/${m}/${a}`; }
function colLetra(n) { let s = ''; while (n > 0) { const r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); } return s; }

function recomendacoesCadastro(dados) {
    const ex = dados.extrato || {};
    const rec = [];
    if (ex.ultima_data) {
        const dia = new Date(ex.ultima_data + 'T00:00:00'); dia.setDate(dia.getDate() + 1);
        const prox = `${String(dia.getDate()).padStart(2, '0')}/${String(dia.getMonth() + 1).padStart(2, '0')}/${dia.getFullYear()}`;
        rec.push(`Atualize o extrato bancário: o último importado vai até ${dataBr(ex.ultima_data)}. Importe de ${prox} até hoje em Financeiro › Importar › Importar extrato, ou mande o PDF ao R.AI.Z no WhatsApp (+55 11 97895-0609). Recebimentos já pagos deixam de aparecer como atrasados.`);
    } else {
        rec.push('Importe o extrato bancário em Financeiro › Importar › Importar extrato, ou mande o PDF ao R.AI.Z no WhatsApp (+55 11 97895-0609).');
    }
    rec.push('Antes de importar, corrija nome e CPF/CNPJ dos locatários marcados no diagnóstico: é o CPF/CNPJ que faz o pagamento do banco casar sozinho com o contrato.');
    const pe = num(ex.pendentes_entrada), ps = num(ex.pendentes_saida);
    if (pe + ps > 0) rec.push(`Do extrato já importado (${dataBr(ex.pendentes_de)} a ${dataBr(ex.pendentes_ate)}) ficaram ${pe} entrada(s) e ${ps} saída(s) sem destino: confira em Financeiro › Conciliação.`);
    if (num(dados.sem_whatsapp) > 0) rec.push(`${num(dados.sem_whatsapp)} contrato(s) ativo(s) sem o WhatsApp do locatário: é por ele que saem recibo e lembrete de cobrança.`);
    return rec;
}

async function montarPlanilhaCadastro(ExcelJS, dados, opcoes = {}) {
    const linhas = Array.isArray(dados.linhas) ? dados.linhas : [];
    const empresa = dados.empresa || 'Empresa';
    const agora = new Date();
    const quando = `${String(agora.getDate()).padStart(2, '0')}/${String(agora.getMonth() + 1).padStart(2, '0')}/${agora.getFullYear()} às ${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`;
    const recorte = opcoes.empreendimentoNome ? `empreendimento ${opcoes.empreendimentoNome}` : 'todos os empreendimentos';
    const F = (sz = 10, b = false, cor = CC.ink, i = false) => ({ name: 'Arial', size: sz, bold: b, italic: i, color: { argb: cor } });
    const fundo = (c) => ({ type: 'pattern', pattern: 'solid', fgColor: { argb: c } });
    const fio = { style: 'thin', color: { argb: CC.line } };

    const wb = new ExcelJS.Workbook();
    wb.creator = 'Raiz Patrimônio'; wb.title = `Cadastro da carteira · ${empresa}`; wb.created = agora;
    wb.calcProperties = { fullCalcOnLoad: true };

    // ---- Carteira ----
    const ws = wb.addWorksheet('Carteira', { views: [{ state: 'frozen', xSplit: 2, ySplit: 8, showGridLines: false }],
        pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, printTitlesRow: '8:8' } });
    ws.headerFooter.oddFooter = `&L&8Cadastro da carteira · ${empresa.replace(/&/g, '&&')} · gerado em ${quando}${opcoes.quem ? ' por ' + opcoes.quem.replace(/&/g, '&&') : ''}&R&8Página &P de &N`;
    CADASTRO_COLUNAS.forEach((c, i) => { ws.getColumn(i + 1).width = c[2]; });
    ws.getRow(1).height = 30;
    ws.getCell('A1').value = empresa; ws.getCell('A1').font = F(18, true, CC.pine);
    ws.getCell('A2').value = 'Cadastro da carteira · imóveis, contratos e locatários'; ws.getCell('A2').font = F(12, true);
    ws.getCell('A3').value = `Situação em ${quando.slice(0, 10)} · ${recorte} · gerado em ${quando}${opcoes.quem ? ' por ' + opcoes.quem : ''} · uma linha por imóvel e contrato ativo`;
    ws.getCell('A3').font = F(9, false, CC.muted);
    const png = await simboloPng();
    if (png) { const id = wb.addImage({ base64: png, extension: 'png' }); ws.addImage(id, { tl: { col: 5, row: 0 }, ext: { width: 30, height: 38 } }); }
    ws.getCell('G1').value = 'Raiz'; ws.getCell('G1').font = F(12, true, CC.pine);
    ws.getCell('G2').value = 'Patrimônio'; ws.getCell('G2').font = F(8, true, CC.sprout);

    const HDR = 8, INI = 9, FIM = Math.max(INI, INI + linhas.length - 1), NC = CADASTRO_COLUNAS.length;
    const L = {}; CADASTRO_COLUNAS.forEach((c, i) => { L[c[1]] = colLetra(i + 1); });
    const faixa = (n) => `${L[n]}${INI}:${L[n]}${FIM}`;
    const kpis = [
        ['Linhas (imóvel × contrato)', `COUNTA(${faixa('Imóvel')})`, '0'],
        ['Contratos ativos', `COUNTIF(${faixa('Situação do contrato')},"Ativo")`, '0'],
        ['Aluguel mensal (R$)', `SUM(${faixa('Aluguel atual (R$)')})`, '#,##0.00'],
        ['Linhas com diagnóstico', `COUNTIF(${faixa('Diagnóstico')},"?*")`, '0'],
    ];
    kpis.forEach(([rot, f, fmt], i) => {
        const c0 = 1 + i * 3;
        const a = ws.getCell(5, c0); a.value = rot; a.font = F(8, false, CC.muted);
        const b = ws.getCell(6, c0); b.value = { formula: f }; b.font = F(14, true, CC.pine); b.numFmt = fmt; b.alignment = { horizontal: 'left' };
        [5, 6].forEach(rr => [c0, c0 + 1].forEach(cc => { ws.getCell(rr, cc).fill = fundo(CC.paper); }));
    });

    const COR_GRUPO = { 'Imóvel': CC.pine, 'Contrato': CC.sprout, 'Locatário': CC.loc, 'Diagnóstico': CC.brass };
    let ini = 1;
    for (let i = 1; i <= NC; i++) {
        const g = CADASTRO_COLUNAS[i - 1][0];
        if (i === NC || CADASTRO_COLUNAS[i][0] !== g) {
            if (i > ini) ws.mergeCells(HDR - 1, ini, HDR - 1, i);
            const cl = ws.getCell(HDR - 1, ini); cl.value = g.toUpperCase(); cl.font = F(8, true, CC.branco);
            cl.alignment = { horizontal: 'left', indent: 1 };
            for (let k = ini; k <= i; k++) ws.getCell(HDR - 1, k).fill = fundo(COR_GRUPO[g]);
            ini = i + 1;
        }
    }
    const numerico = (c) => c[3] && c[3] !== 'dd/mm/yyyy';
    CADASTRO_COLUNAS.forEach((c, i) => {
        const cl = ws.getCell(HDR, i + 1); cl.value = c[1]; cl.font = F(9, true, CC.pine); cl.fill = fundo(CC.paper);
        cl.alignment = { wrapText: true, vertical: 'middle', horizontal: numerico(c) ? 'right' : 'left' };
        cl.border = { bottom: { style: 'medium', color: { argb: CC.pine } } };
    });
    ws.getRow(HDR).height = 30;

    linhas.forEach((r, k) => {
        const rr = INI + k;
        CADASTRO_COLUNAS.forEach((c, i) => {
            const cl = ws.getCell(rr, i + 1);
            cl.value = c[4](r);
            cl.font = F(9); cl.border = { bottom: fio };
            if (c[3]) cl.numFmt = c[3];
            if (numerico(c)) cl.alignment = { horizontal: 'right' };
            if (k % 2 === 1) cl.fill = fundo(CC.zebra);
        });
        const d = ws.getCell(rr, NC);
        d.alignment = { wrapText: true, vertical: 'top' };
        if (d.value) { d.fill = fundo(CC.brassBg); d.font = F(9, false, CC.brassTx); }
    });
    ws.autoFilter = { from: { row: HDR, column: 1 }, to: { row: FIM, column: NC } };

    let rr = FIM + 2;
    ws.getCell(rr, 1).value = 'Recomendações'; ws.getCell(rr, 1).font = F(12, true, CC.pine); rr++;
    recomendacoesCadastro(dados).forEach(t => {
        ws.mergeCells(rr, 1, rr, 12);
        const cl = ws.getCell(rr, 1); cl.value = '•  ' + t; cl.font = F(9); cl.alignment = { wrapText: true, vertical: 'top' };
        ws.getRow(rr).height = 26; rr++;
    });
    rr++;
    ws.getCell(rr, 1).value = `Fonte: Raiz · cadastro de ativos, contratos, locatários e recebimentos · situação em ${quando.slice(0, 10)} · Raiz Patrimônio · raizpatrimonio.com.br`;
    ws.getCell(rr, 1).font = F(8, false, CC.muted, true);

    // ---- Por empreendimento ----
    const we = wb.addWorksheet('Por empreendimento', { views: [{ showGridLines: false }] });
    we.getCell('A1').value = empresa; we.getCell('A1').font = F(14, true, CC.pine);
    we.getCell('A2').value = 'Resumo por empreendimento'; we.getCell('A2').font = F(11, true);
    we.getCell('A3').value = 'Escolha o empreendimento na célula B5 para ver só ele; na aba Carteira, use o filtro da coluna Empreendimento.';
    we.getCell('A3').font = F(9, false, CC.muted);
    const emps = [...new Set(linhas.map(r => r.empreendimento || 'Sem empreendimento'))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    we.getCell('A5').value = 'Empreendimento'; we.getCell('A5').font = F(9, true, CC.pine);
    we.getCell('B5').value = 'Todos'; we.getCell('B5').font = F(11, true, CC.pine); we.getCell('B5').fill = fundo(CC.brassBg);
    // lista da validação numa coluna escondida (sem o limite de 255 caracteres da lista literal)
    ['Todos', ...emps].forEach((e, i) => { we.getCell(8 + i, 8).value = e; });
    we.getColumn(8).hidden = true;
    we.getCell('B5').dataValidation = { type: 'list', allowBlank: false, formulae: [`$H$8:$H$${8 + emps.length}`] };
    ['Empreendimento', 'Linhas', 'Contratos ativos', 'Aluguel mensal (R$)', 'Linhas com diagnóstico'].forEach((h, i) => {
        const cl = we.getCell(7, i + 1); cl.value = h; cl.font = F(9, true, CC.pine); cl.fill = fundo(CC.paper);
        cl.border = { bottom: { style: 'medium', color: { argb: CC.pine } } };
        we.getColumn(i + 1).width = [24, 10, 15, 20, 22][i];
    });
    const abs = (n) => `Carteira!$${L[n]}$${INI}:$${L[n]}$${FIM}`;
    const E = abs('Empreendimento'), S = abs('Situação do contrato'), A = abs('Aluguel atual (R$)'), D = abs('Diagnóstico');
    emps.forEach((e, k) => {
        const r_ = 8 + k, vis = `OR($B$5="Todos",$B$5=A${r_})`;
        we.getCell(r_, 1).value = e; we.getCell(r_, 1).font = F(9); we.getCell(r_, 1).border = { bottom: fio };
        [[2, `IF(${vis},COUNTIF(${E},A${r_}),0)`, '0'], [3, `IF(${vis},COUNTIFS(${E},A${r_},${S},"Ativo"),0)`, '0'],
         [4, `IF(${vis},SUMIFS(${A},${E},A${r_}),0)`, '#,##0.00'], [5, `IF(${vis},COUNTIFS(${E},A${r_},${D},"?*"),0)`, '0']]
            .forEach(([c_, f_, fmt]) => { const cl = we.getCell(r_, c_); cl.value = { formula: f_ }; cl.numFmt = fmt; cl.font = F(9); cl.border = { bottom: fio }; });
    });
    const tr = 8 + emps.length;
    we.getCell(tr, 1).value = 'Total'; we.getCell(tr, 1).font = F(9, true);
    for (let c_ = 2; c_ <= 5; c_++) {
        const cl = we.getCell(tr, c_); cl.value = { formula: `SUM(${colLetra(c_)}8:${colLetra(c_)}${tr - 1})` };
        cl.numFmt = c_ === 4 ? '#,##0.00' : '0'; cl.font = F(9, true); cl.border = { top: { style: 'medium', color: { argb: CC.pine } } };
    }

    // ---- Sobre ----
    const wsb = wb.addWorksheet('Sobre', { views: [{ showGridLines: false }] });
    wsb.getColumn(1).width = 30; wsb.getColumn(2).width = 100;
    wsb.getCell('A1').value = 'Sobre esta planilha'; wsb.getCell('A1').font = F(14, true, CC.pine);
    [
        ['Uma linha por imóvel e contrato ativo', 'Imóvel vago aparece uma vez, com as colunas de contrato em branco. Imóvel com mais de um contrato ativo aparece uma vez por contrato.'],
        ['Próximo reajuste', 'Calculado a partir do início do contrato e da periodicidade de reajuste (12 meses quando não informada).'],
        ['Aluguel mensal', 'Soma do aluguel atual dos contratos ativos, como está no cadastro.'],
        ['Diagnóstico', 'O que precisa de atenção na linha:'],
        ['', '· Endereço provisório (rua fictícia)'],
        ['', '· Imóvel sem valor de referência'],
        ['', '· Marcado como alugado sem contrato ativo, ou disponível com contrato ativo'],
        ['', '· Locatário sem nome ("Identificar Locatário") ou sem CPF/CNPJ'],
        ['', '· Contrato sem valor de aluguel'],
        ['', '· Último recebimento diferente do aluguel do contrato'],
        ['', '· Recebimentos marcados como atrasados: em geral somem quando o extrato é atualizado'],
        ['Como corrigir no app', 'Imóvel: Ativos › imóvel › ⋮ › Editar. Contrato e locatário: Ativos › imóvel › card Contrato › ⋮ › Editar. Extrato: Financeiro › Importar › Importar extrato.'],
        ['Dados pessoais', 'CPF/CNPJ e contatos aparecem completos porque a planilha é da própria empresa. Guarde e compartilhe com cuidado.'],
    ].forEach(([a, b], k) => {
        wsb.getCell(3 + k, 1).value = a || null; wsb.getCell(3 + k, 1).font = F(9, true, CC.pine);
        const cl = wsb.getCell(3 + k, 2); cl.value = b; cl.font = F(9); cl.alignment = { wrapText: true, vertical: 'top' };
    });
    return wb;
}

function nomeArquivoCadastro(empresa, empNome) {
    const s = (t) => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    const h = new Date();
    return `raiz_cadastro_carteira_${s(empresa) || 'empresa'}${empNome ? '_' + s(empNome) : ''}_${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, '0')}.xlsx`;
}

async function baixarPlanilhaCadastro(empId, empNome) {
    rzToast('Montando a planilha…');
    try {
        const [ExcelJS, resp, quem] = await Promise.all([
            carregarExcelJs(),
            dbAuth.rpc('fn_relatorio_cadastro_carteira', { p_cliente_id: CLIENTE_ID_SUPABASE, p_empreendimento_id: empId || null }),
            quemGera(),
        ]);
        if (resp.error) throw resp.error;
        const dados = resp.data || {};
        if (!Array.isArray(dados.linhas) || !dados.linhas.length) { rzToast('Nenhum imóvel neste recorte.', 'warning'); return; }
        const wb = await montarPlanilhaCadastro(ExcelJS, dados, { empreendimentoNome: empNome || null, quem });
        const buf = await wb.xlsx.writeBuffer();
        const nome = nomeArquivoCadastro(dados.empresa, empNome);
        const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = nome; document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 30000);
        rzToast('Planilha baixada');
    } catch (e) {
        console.error('[rz] cadastro da carteira', e);
        rzToast('Não foi possível gerar a planilha: ' + (e?.message || e), 'danger');
    }
}

export async function abrirRelatorioCadastroCarteira() {
    if (rzMostrarBloqueio(CADASTRO_CODIGO)) return; // ACE-04
    let emps = [];
    try {
        const { data, error } = await dbAuth.from('empreendimentos').select('id, nome').eq('cliente_id', CLIENTE_ID_SUPABASE).order('nome');
        if (!error && Array.isArray(data)) emps = data;
    } catch (e) { /* sem a lista, segue só com "Todos" */ }
    abrirSheetAcoes({ titulo: 'Cadastro da carteira', sub: 'Planilha para o Excel', acoes: [
        { icone: 'layers', titulo: 'Todos os empreendimentos', sub: 'Baixar planilha', codigo: CADASTRO_CODIGO, aoTocar: () => baixarPlanilhaCadastro(null, null) },
        ...emps.map(e => ({ icone: 'building-2', titulo: e.nome, sub: 'Baixar planilha', codigo: CADASTRO_CODIGO, aoTocar: () => baixarPlanilhaCadastro(e.id, e.nome) })),
    ] });
}

// usados por testes e pelo protótipo
export const _interno = { montarFluxo, montarGerencial, montarRetiradas, montarExecutivo, compacto, comp, montarPlanilhaCadastro };
