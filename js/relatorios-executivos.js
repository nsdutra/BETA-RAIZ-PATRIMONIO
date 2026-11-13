// ============================================================================
// relatorios-executivos.js — Raiz Patrimônio · Relatórios no modelo executivo
// Versão: 1.12.0 · 13/11/2026
//
// v1.12.0 (13/11/2026, sessão 20261113-2040-cadastro-em-tela, demanda c4fb7da1; PLANO_RELATORIOS_CADASTRO_EM_TELA v1.0.0, de acordo
//   do Nicola 13/11 20:33) — Cadastro da carteira e Cadastro de partes e pessoas abrem EM TELA (casca do Acompanhamento): números,
//   abas, filtros, linhas tocáveis com as ações que já existem e rodapé Compartilhar · Exportar planilha (planilhas de sempre).
//   Sem mudança no banco: a parte é achada pelo nome (e CPF/CNPJ quando há nome repetido); o imóvel e o contrato pelas listas do
//   app. Versão anterior: 1.11.0
//
// v1.11.0 (13/11/2026, sessão 20261113-1910-reajuste-desde; achados do Nicola 19:06) — Acompanhamento do mês: a fileira de filtros
//   sem barra de rolagem; recebido sem diferença mostra "sem diferença" (antes repetia "a receber R$ X" ao lado do recebido, o que
//   confundia); a barra do topo não passa da largura da tela; ao fechar o relatório a página volta para a posição horizontal 0
//   (a tela de Relatórios ficava deslocada para o lado até reabrir o app). Versão anterior: 1.10.0
//
// v1.10.0 (13/11/2026, sessão 20261113-1530-dividir-recebimento, demanda 76a2f670 E8; D2 do Nicola 13/11 13:35 "usar a do
//   documento e garantir que vai sair no relatório das diferenças" + 14:05 "Diferenças = acompanhamento do mês") — Acompanhamento
//   do mês ganha o bloco "Diferenças da prestação de contas" (tela e aba "Diferenças" na planilha), lido de
//   fn_relatorio_acompanhamento_mes.diferencas_prestacao: taxa e aluguel cobrados × contrato e arredondamento das divisões de
//   recebimento do mês. Versão anterior: 1.9.0
//
// v1.9.0 (13/11/2026, sessão 20261113-1500-rel-cadastro-partes, demanda 35ff0daf; FICHA_RELATORIO_CADASTRO_PARTES_RAIZ v1.0.0,
//   de acordo do Nicola 13/11 14:05) — relatório novo "Cadastro de partes e pessoas" (relatorios.cadastro_partes), lido de
//   fn_relatorio_cadastro_partes (só da empresa aberta; achados calculados no banco, CAN-01). Planilha com 5 abas: Resumo
//   (contagens por fórmula), Empresa, Partes (papéis, vínculos e achados, com filtro), Pessoas e Sobre. CPF/CNPJ vem mascarado
//   do banco para quem não é admin. abrirRelatorioCadastroPartes().
//
// v1.8.0 (11/11/2026, sessão 20261111-0905-rel-acompanhamento, demanda add3d7a0; FICHA_REL_ACOMPANHAMENTO_MES v1.0.0, de acordo
//   do Nicola 11/11 08:59: "Vamos fazer só o relatório do mês, inclui uma visão do resultado por ativo neste relatório como uma
//   aba") — relatório novo "Acompanhamento do mês" (relatorios.acompanhamento_mes), lido de fn_relatorio_acompanhamento_mes:
//   tela com mês e empreendimento, 4 números (a receber, recebido, diferença, despesas), aviso de extrato não importado e abas
//   Recebimentos (filtros em aberto / com diferença / com observação), Despesas (com origem: extrato, administradora, manual,
//   extrato a classificar; bloco fora do resultado) e Por imóvel. Tocar abre as ações do Financeiro (rzAcoesMensalidade,
//   rzAcoesDespesa) ou grava a Observação; o relatório se atualiza ao fechar o sheet. Planilha com 5 abas (Recebimentos,
//   Despesas, Por imóvel, Gráficos em imagem, Sobre), colunas amarelas para o cliente preencher. abrirRelatorioAcompanhamentoMes().
// --------------------------------------------------------------------------
// Versões anteriores (v1.7.0 … v1.7.0): CHANGELOG_MODULOS.md, na raiz do repositório — o
// gerar_versoes.py rola pra lá automaticamente tudo além das 5 versões
// mais recentes deste cabeçalho (VER-06).
import { rzMostrarBloqueio } from './comum-licenca.js';
import { rzToast } from './raiz-ui.js';
import RaizDevice from './raiz-device.js';

export const VERSAO = '1.12.0';

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
#rz-relexec{position:fixed;inset:0;z-index:80;overflow:hidden;background:var(--paper,#f4f3ee);display:flex;flex-direction:column}
#rz-relexec .rx-top{display:flex;align-items:center;gap:8px;overflow-x:auto;scrollbar-width:none;max-width:100vw;padding:10px 12px;background:var(--card,#fff);border-bottom:1px solid var(--line,#e6e3da)}
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
    if (window.scrollX) window.scrollTo(0, window.scrollY); // v1.11.0 — a página não fica deslocada para o lado
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
    brassBg: 'FFF7ECD9', brass: 'FF8A5A1F', brassTx: 'FF6B4415', zebra: 'FFF6F7F4', loc: 'FF3C5A50', branco: 'FFFFFFFF',
    danger: 'FFC1463A' };
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

// ---------------------------------------------------------------------------
// Planilha de lista (v1.7.0) — PADRAO_RELATORIOS REL-61 a REL-66. A casca é a do Cadastro da carteira; quem exporta só
// diz as colunas e entrega as linhas já lidas da tela (REL-02: a planilha não recalcula, só soma com fórmula).
//   o = { titulo, recorte, arquivo, aba, colunas: [{ cab, larg, fmt, ler, total, alerta }], linhas,
//         kpis: [{ rot, formula: (faixa) => 'SUM(' + faixa('Valor (R$)') + ')', fmt }], sobre: [[a, b]], fonte }
//   fmt: 'moeda' | 'data' | 'int' | null · total: soma a coluna na linha Total · alerta(valor) → true pinta a célula de vermelho
// ---------------------------------------------------------------------------
const FMT_PLANILHA = { moeda: '#,##0.00', data: 'dd/mm/yyyy', int: '0' };
export async function baixarPlanilhaLista(o) {
    rzToast('Montando a planilha…');
    try {
        const ExcelJS = await carregarExcelJs();
        const quem = (typeof socioLogado === 'string' && socioLogado) || await quemGera();
        const empresa = (typeof CONFIG_CLIENTE === 'object' && CONFIG_CLIENTE?.nomeEmpresa) || 'Empresa';
        const agora = new Date(), p2 = (n) => String(n).padStart(2, '0');
        const quando = `${p2(agora.getDate())}/${p2(agora.getMonth() + 1)}/${agora.getFullYear()} às ${p2(agora.getHours())}:${p2(agora.getMinutes())}`;
        const F = (sz = 10, b = false, cor = CC.ink, i = false) => ({ name: 'Arial', size: sz, bold: b, italic: i, color: { argb: cor } });
        const fundo = (c) => ({ type: 'pattern', pattern: 'solid', fgColor: { argb: c } });
        const fio = { style: 'thin', color: { argb: CC.line } };
        const cols = o.colunas, NC = cols.length, linhas = o.linhas || [];
        const wb = new ExcelJS.Workbook();
        wb.creator = 'Raiz Patrimônio'; wb.title = `${o.titulo} · ${empresa}`; wb.created = agora;
        wb.calcProperties = { fullCalcOnLoad: true };
        const HDR = 8, INI = 9, FIM = Math.max(INI, INI + linhas.length - 1);
        const ws = wb.addWorksheet(o.aba || 'Lista', { views: [{ state: 'frozen', xSplit: 0, ySplit: HDR, showGridLines: false }],
            pageSetup: { orientation: NC > 6 ? 'landscape' : 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0, printTitlesRow: `${HDR}:${HDR}` } });
        ws.headerFooter.oddFooter = `&L&8${o.titulo.replace(/&/g, '&&')} · ${empresa.replace(/&/g, '&&')} · gerado em ${quando}${quem ? ' por ' + quem.replace(/&/g, '&&') : ''}&R&8Página &P de &N`;
        cols.forEach((c, i) => { ws.getColumn(i + 1).width = c.larg || 16; });
        ws.getRow(1).height = 30;
        ws.getCell('A1').value = empresa; ws.getCell('A1').font = F(18, true, CC.pine);
        ws.getCell('A2').value = o.titulo; ws.getCell('A2').font = F(12, true);
        ws.getCell('A3').value = `${o.recorte ? o.recorte + ' · ' : ''}gerado em ${quando}${quem ? ' por ' + quem : ''} · ${linhas.length} ${linhas.length === 1 ? 'linha' : 'linhas'}`;
        ws.getCell('A3').font = F(9, false, CC.muted);
        const cMarca = Math.max(3, NC - 1);
        const png = await simboloPng();
        if (png) { const id = wb.addImage({ base64: png, extension: 'png' }); ws.addImage(id, { tl: { col: cMarca - 1, row: 0 }, ext: { width: 30, height: 38 } }); }
        ws.getCell(1, cMarca + 1).value = 'Raiz'; ws.getCell(1, cMarca + 1).font = F(12, true, CC.pine);
        ws.getCell(2, cMarca + 1).value = 'Patrimônio'; ws.getCell(2, cMarca + 1).font = F(8, true, CC.sprout);

        const L = {}; cols.forEach((c, i) => { L[c.cab] = colLetra(i + 1); });
        const faixa = (cab) => `${L[cab]}${INI}:${L[cab]}${FIM}`;
        (o.kpis || []).slice(0, 4).forEach((k, i) => {
            const c0 = 1 + i * 2;
            const a = ws.getCell(5, c0); a.value = k.rot; a.font = F(8, false, CC.muted);
            const b = ws.getCell(6, c0); b.value = { formula: k.formula(faixa) }; b.font = F(14, true, CC.pine);
            b.numFmt = FMT_PLANILHA[k.fmt] || k.fmt || '0'; b.alignment = { horizontal: 'left' };
            [5, 6].forEach(rr => [c0, c0 + 1].forEach(cc => { if (cc <= Math.max(NC, 8)) ws.getCell(rr, cc).fill = fundo(CC.paper); }));
        });

        const direita = (c) => c.fmt === 'moeda' || c.fmt === 'int';
        cols.forEach((c, i) => {
            const cl = ws.getCell(HDR, i + 1); cl.value = c.cab; cl.font = F(9, true, CC.pine); cl.fill = fundo(CC.paper);
            cl.alignment = { wrapText: true, vertical: 'middle', horizontal: direita(c) ? 'right' : 'left' };
            cl.border = { bottom: { style: 'medium', color: { argb: CC.pine } } };
        });
        ws.getRow(HDR).height = 30;
        linhas.forEach((r, k) => {
            const rr = INI + k;
            cols.forEach((c, i) => {
                const cl = ws.getCell(rr, i + 1);
                let v = c.ler(r);
                if (c.fmt === 'data') v = dataXl(v);
                else if (c.fmt === 'moeda' || c.fmt === 'int') v = nOuNulo(v);
                else v = tOuNulo(v);
                cl.value = v; cl.font = F(9); cl.border = { bottom: fio };
                if (FMT_PLANILHA[c.fmt]) cl.numFmt = FMT_PLANILHA[c.fmt];
                if (direita(c)) cl.alignment = { horizontal: 'right' };
                if (k % 2 === 1) cl.fill = fundo(CC.zebra);
                if (c.alerta && c.alerta(v)) cl.font = F(9, true, CC.danger);
            });
        });
        ws.autoFilter = { from: { row: HDR, column: 1 }, to: { row: FIM, column: NC } };
        const TR = FIM + 1;
        ws.getCell(TR, 1).value = 'Total'; ws.getCell(TR, 1).font = F(9, true);
        cols.forEach((c, i) => {
            const cl = ws.getCell(TR, i + 1);
            cl.border = { top: { style: 'medium', color: { argb: CC.pine } } };
            if (c.total) { cl.value = { formula: `SUBTOTAL(9,${faixa(c.cab)})` }; cl.numFmt = FMT_PLANILHA[c.fmt] || '#,##0.00'; cl.font = F(9, true); cl.alignment = { horizontal: 'right' }; }
        });
        ws.getCell(TR + 2, 1).value = `Fonte: Raiz · ${o.fonte || o.titulo} · situação em ${quando.slice(0, 10)} · Raiz Patrimônio · raizpatrimonio.com.br`;
        ws.getCell(TR + 2, 1).font = F(8, false, CC.muted, true);

        const wsb = wb.addWorksheet('Sobre', { views: [{ showGridLines: false }] });
        wsb.getColumn(1).width = 30; wsb.getColumn(2).width = 100;
        wsb.getCell('A1').value = 'Sobre esta planilha'; wsb.getCell('A1').font = F(14, true, CC.pine);
        [...(o.sobre || []),
            ['Total', 'A linha Total soma só as linhas visíveis: ao filtrar uma coluna, o total acompanha o filtro.'],
            ['Origem', `Exportado do Raiz em ${quando}${quem ? ' por ' + quem : ''}. Os números são os da tela no momento da exportação.`]]
            .forEach(([a, b], k) => {
                wsb.getCell(3 + k, 1).value = a || null; wsb.getCell(3 + k, 1).font = F(9, true, CC.pine);
                const cl = wsb.getCell(3 + k, 2); cl.value = b; cl.font = F(9); cl.alignment = { wrapText: true, vertical: 'top' };
            });

        const buf = await wb.xlsx.writeBuffer();
        const s = (t) => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
        const nome = `raiz_${s(o.arquivo || o.titulo)}_${s(empresa) || 'empresa'}${o.sufixo ? '_' + s(o.sufixo) : ''}.xlsx`;
        const url = URL.createObjectURL(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
        const a = document.createElement('a'); a.href = url; a.download = nome; document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 30000);
        rzToast(`Planilha baixada · ${linhas.length} ${linhas.length === 1 ? 'linha' : 'linhas'}`);
    } catch (e) {
        console.error('[rz] planilha de lista', e);
        rzToast('Não foi possível gerar a planilha: ' + (e?.message || e), 'danger');
    }
}

// ---------------------------------------------------------------------------
// Cadastro de partes e pessoas (v1.9.0) — relatorios.cadastro_partes, dados de fn_relatorio_cadastro_partes (REL-02: a planilha
// só formata; os achados vêm do banco). Abas Resumo · Empresa · Partes · Pessoas · Sobre.
// ---------------------------------------------------------------------------
const CADPARTES_CODIGO = 'relatorios.cadastro_partes';
async function baixarPlanilhaCadastroPartes() {
    rzToast('Montando a planilha…');
    try {
        const [ExcelJS, resp, quem] = await Promise.all([
            carregarExcelJs(), dbAuth.rpc('fn_relatorio_cadastro_partes', { p_cliente_id: CLIENTE_ID_SUPABASE }), quemGera(),
        ]);
        if (resp.error) throw resp.error;
        const d = resp.data || {};
        const emp = d.empresa || {}, partes = d.partes || [], pessoas = d.pessoas || [];
        const empresa = emp.nome || 'Empresa';
        const agora = new Date(), p2 = (n) => String(n).padStart(2, '0');
        const quando = `${p2(agora.getDate())}/${p2(agora.getMonth() + 1)}/${agora.getFullYear()} às ${p2(agora.getHours())}:${p2(agora.getMinutes())}`;
        const F = (sz = 10, b = false, cor = CC.ink, i = false) => ({ name: 'Arial', size: sz, bold: b, italic: i, color: { argb: cor } });
        const fundo = (c) => ({ type: 'pattern', pattern: 'solid', fgColor: { argb: c } });
        const fio = { style: 'thin', color: { argb: CC.line } };
        const wb = new ExcelJS.Workbook();
        wb.creator = 'Raiz Patrimônio'; wb.title = `Cadastro de partes e pessoas · ${empresa}`; wb.created = agora;
        wb.calcProperties = { fullCalcOnLoad: true };
        const png = await simboloPng();
        const cabecalho = (ws, subtitulo, ncols) => {
            ws.getRow(1).height = 30;
            ws.getCell('A1').value = empresa; ws.getCell('A1').font = F(18, true, CC.pine);
            ws.getCell('A2').value = subtitulo; ws.getCell('A2').font = F(12, true);
            ws.getCell('A3').value = `Situação em ${quando.slice(0, 10)} · gerado em ${quando}${quem ? ' por ' + quem : ''}`; ws.getCell('A3').font = F(9, false, CC.muted);
            const cm = Math.max(3, ncols - 1);
            if (png) { const id = wb.addImage({ base64: png, extension: 'png' }); ws.addImage(id, { tl: { col: cm - 1, row: 0 }, ext: { width: 30, height: 38 } }); }
            ws.getCell(1, cm + 1).value = 'Raiz'; ws.getCell(1, cm + 1).font = F(12, true, CC.pine);
            ws.getCell(2, cm + 1).value = 'Patrimônio'; ws.getCell(2, cm + 1).font = F(8, true, CC.sprout);
            ws.headerFooter.oddFooter = `&L&8Cadastro de partes e pessoas · ${empresa.replace(/&/g, '&&')} · gerado em ${quando}&R&8Página &P de &N`;
        };
        const tabela = (ws, HDR, cols, linhas) => {
            cols.forEach((c, i) => {
                ws.getColumn(i + 1).width = c.larg || 16;
                const cl = ws.getCell(HDR, i + 1); cl.value = c.cab; cl.font = F(9, true, CC.pine); cl.fill = fundo(CC.paper);
                cl.alignment = { wrapText: true, vertical: 'middle', horizontal: c.num ? 'right' : 'left' };
                cl.border = { bottom: { style: 'medium', color: { argb: CC.pine } } };
            });
            ws.getRow(HDR).height = 30;
            linhas.forEach((r, k) => cols.forEach((c, i) => {
                const cl = ws.getCell(HDR + 1 + k, i + 1);
                let v = c.ler(r); v = c.num ? nOuNulo(v) : c.data ? dataXl(v) : tOuNulo(v);
                cl.value = v; cl.font = F(9); cl.border = { bottom: fio };
                if (c.num) { cl.alignment = { horizontal: 'right' }; cl.numFmt = c.fmt || '0'; }
                if (c.data) cl.numFmt = 'dd/mm/yyyy';
                if (k % 2 === 1) cl.fill = fundo(CC.zebra);
                if (c.alerta && v) cl.font = F(9, true, CC.danger);
            }));
            const fim = HDR + Math.max(1, linhas.length);
            ws.autoFilter = { from: { row: HDR, column: 1 }, to: { row: fim, column: cols.length } };
            return fim;
        };
        const sn = (b) => (b ? 'sim' : 'não');
        const achados = (r) => (r.achados || []).join('; ');

        // Partes
        const colsP = [
            { cab: 'Nome', larg: 38, ler: r => r.nome }, { cab: 'Nome fantasia', larg: 22, ler: r => r.nome_fantasia },
            { cab: 'Tipo doc.', larg: 8, ler: r => r.doc_tipo }, { cab: 'CPF/CNPJ', larg: 20, ler: r => r.documento },
            { cab: 'Prestador', larg: 14, ler: r => r.tipo_prestador }, { cab: 'Taxa adm. (%)', larg: 10, num: true, fmt: '0.00', ler: r => r.taxa_adm },
            { cab: 'Cidade/UF', larg: 18, ler: r => [r.cidade, r.uf].filter(Boolean).join('/') },
            { cab: 'WhatsApp', larg: 9, ler: r => sn(r.whatsapp) }, { cab: 'E-mail', larg: 8, ler: r => sn(r.email) },
            { cab: 'Papéis', larg: 34, ler: r => r.papeis }, { cab: 'Lançamentos', larg: 11, num: true, ler: r => r.lancamentos },
            { cab: 'Itens de controle', larg: 10, num: true, ler: r => r.itens }, { cab: 'Usos', larg: 7, num: true, ler: r => r.usos },
            { cab: 'Vínculos (total)', larg: 10, num: true, ler: r => r.vinculos }, { cab: 'Cadastrada em', larg: 12, data: true, ler: r => r.criado_em },
            { cab: 'Achados', larg: 40, alerta: true, ler: achados },
        ];
        const wp = wb.addWorksheet('Partes', { views: [{ state: 'frozen', xSplit: 1, ySplit: 5, showGridLines: false }],
            pageSetup: { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, printTitlesRow: '5:5' } });
        cabecalho(wp, 'Partes · locatários, administradoras, condomínios, prestadores e demais', colsP.length);
        const fimP = tabela(wp, 5, colsP, partes);
        const achP = `P6:P${fimP}`;

        // Pessoas
        const colsE = [
            { cab: 'Nome', larg: 34, ler: r => r.nome }, { cab: 'Perfil', larg: 12, ler: r => r.perfil }, { cab: 'Função', larg: 22, ler: r => r.funcao },
            { cab: 'Acessa o app', larg: 10, ler: r => sn(r.login) }, { cab: 'WhatsApp', larg: 9, ler: r => sn(r.whatsapp) }, { cab: 'E-mail', larg: 8, ler: r => sn(r.email) },
            { cab: 'Cota (%)', larg: 9, num: true, fmt: '0.00', ler: r => r.cota }, { cab: 'Desde', larg: 12, data: true, ler: r => r.desde },
            { cab: 'Achados', larg: 30, alerta: true, ler: achados },
        ];
        const we = wb.addWorksheet('Pessoas', { views: [{ state: 'frozen', xSplit: 1, ySplit: 5, showGridLines: false }] });
        cabecalho(we, 'Pessoas · quem participa e acessa a empresa', colsE.length);
        const fimE = tabela(we, 5, colsE, pessoas);

        // Empresa
        const wm = wb.addWorksheet('Empresa', { views: [{ showGridLines: false }] });
        cabecalho(wm, 'Empresa', 4);
        wm.getColumn(1).width = 22; wm.getColumn(2).width = 60;
        [['Nome', emp.nome], ['Razão social', emp.razao], ['Documento', [emp.doc_tipo, emp.documento].filter(Boolean).join(' ')],
         ['Cidade/UF', [emp.cidade, emp.uf].filter(Boolean).join('/')], ['Natureza', emp.natureza], ['Regime tributário', emp.regime],
         ['Plano', emp.plano], ['No Raiz desde', emp.desde ? dataXl(emp.desde) : null]].forEach(([a, b], k) => {
            wm.getCell(5 + k, 1).value = a; wm.getCell(5 + k, 1).font = F(9, true, CC.pine);
            const cl = wm.getCell(5 + k, 2); cl.value = b || '—'; cl.font = F(10); if (b instanceof Date) cl.numFmt = 'dd/mm/yyyy';
        });

        // Resumo (fórmulas sobre as abas)
        const wr = wb.addWorksheet('Resumo', { views: [{ showGridLines: false }] });
        cabecalho(wr, 'Cadastro de partes e pessoas · resumo', 4);
        wr.getColumn(1).width = 44; wr.getColumn(2).width = 14;
        [['Partes', `COUNTA(Partes!A6:A${fimP})`], ['Partes sem CPF/CNPJ', `COUNTIF(Partes!${achP},"*sem CPF/CNPJ*")`],
         ['Partes com CPF/CNPJ inválido', `COUNTIF(Partes!${achP},"*inválido*")`], ['Partes com nome repetido', `COUNTIF(Partes!${achP},"*nome repetido*")`],
         ['Partes sem nenhum vínculo', `COUNTIF(Partes!${achP},"*sem vínculo*")`], ['Pessoas', `COUNTA(Pessoas!A6:A${fimE})`],
         ['Pessoas sem acesso ao app', `COUNTIF(Pessoas!D6:D${fimE},"não")`], ['Soma das cotas das pessoas (%)', `SUM(Pessoas!G6:G${fimE})`]].forEach(([a, f], k) => {
            wr.getCell(5 + k, 1).value = a; wr.getCell(5 + k, 1).font = F(10);
            const cl = wr.getCell(5 + k, 2); cl.value = { formula: f }; cl.font = F(12, true, CC.pine); cl.numFmt = k === 7 ? '0.00' : '0';
        });
        wr.getCell(14, 1).value = d.resumo && d.resumo.cotas_ok === false ? 'Atenção: as cotas das pessoas não somam 100%.' : null;
        wr.getCell(14, 1).font = F(9, true, CC.danger);
        const ORDEM = ['Resumo', 'Empresa', 'Partes', 'Pessoas'];
        wb.worksheets.forEach(ws => { ws.orderNo = ORDEM.indexOf(ws.name); }); // a aba Resumo abre primeiro

        // Sobre
        const wsb = wb.addWorksheet('Sobre', { views: [{ showGridLines: false }] });
        wsb.getColumn(1).width = 30; wsb.getColumn(2).width = 100;
        wsb.getCell('A1').value = 'Sobre esta planilha'; wsb.getCell('A1').font = F(14, true, CC.pine);
        [['Só esta empresa', 'A planilha traz apenas as partes e pessoas da empresa aberta no app.'],
         ['Vínculos', 'Soma de papéis ativos (contrato, ativo, empreendimento, item), lançamentos, itens e ocorrências de controle, usos, notas fiscais (tomador), vínculos de pessoa e processos de contratação.'],
         ['Achados', 'CPF/CNPJ inválido (dígito verificador) · sem CPF/CNPJ · nome repetido (mesmo nome, sem acento e maiúsculas) · sem vínculo (nenhum uso no app).'],
         ['Como corrigir', 'Cadastros › Partes › tocar na parte › ⋮ › Editar ou Excluir. Pessoas: ⚙️ › Pessoas.'],
         ['Dados pessoais', d.documento_completo ? 'CPF/CNPJ completos (perfil administrador). Guarde e compartilhe com cuidado.' : 'CPF/CNPJ mascarados: só o perfil administrador vê o número completo (LGPD).'],
         ['Origem', `fn_relatorio_cadastro_partes v${d.versao || 1} · exportado do Raiz em ${quando}${quem ? ' por ' + quem : ''}.`]].forEach(([a, b], k) => {
            wsb.getCell(3 + k, 1).value = a; wsb.getCell(3 + k, 1).font = F(9, true, CC.pine);
            const cl = wsb.getCell(3 + k, 2); cl.value = b; cl.font = F(9); cl.alignment = { wrapText: true, vertical: 'top' };
        });

        const buf = await wb.xlsx.writeBuffer();
        const s = (x) => String(x || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
        const nome = `raiz_cadastro_partes_pessoas_${s(empresa) || 'empresa'}_${agora.getFullYear()}-${p2(agora.getMonth() + 1)}-${p2(agora.getDate())}.xlsx`;
        const url = URL.createObjectURL(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
        const a = document.createElement('a'); a.href = url; a.download = nome; document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 30000);
        rzToast(`Planilha baixada · ${partes.length} partes · ${pessoas.length} pessoas`);
    } catch (e) {
        console.error('[rz] cadastro de partes', e);
        rzToast('Não foi possível gerar a planilha: ' + (e?.message || e), 'danger');
    }
}

export function abrirRelatorioCadastroCarteira() { // v1.12.0 — em tela; a planilha fica no Exportar
    if (rzMostrarBloqueio(CADASTRO_CODIGO)) return; // ACE-04
    cadAbrir('carteira');
}
export function abrirRelatorioCadastroPartes() { // v1.12.0
    if (rzMostrarBloqueio(CADPARTES_CODIGO)) return; // ACE-04
    cadAbrir('partes');
}

// ---------------------------------------------------------------------------
// v1.12.0 (dem c4fb7da1; PLANO_RELATORIOS_CADASTRO_EM_TELA v1.0.0, de acordo do Nicola 13/11 20:33) — Cadastro da carteira e
// Cadastro de partes e pessoas EM TELA, na casca do Acompanhamento do mês: topo, números, abas, filtros, linhas tocáveis e rodapé
// Compartilhar · Exportar planilha (a planilha é a de sempre). Tocar abre as ações que já existem (contrato e parte em sheet,
// sobre o relatório; imóvel abre a ficha). Ao fechar o sheet, a tela relê os dados. Nada novo no banco.
// ---------------------------------------------------------------------------
let cad = null; // { tipo: 'carteira'|'partes', empId, empNome, dados, aba, filtro, partesIds }
const cadNorm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
function cadAbrir(tipo) {
    garantirCss();
    if (!document.getElementById('rz-relacomp-css')) { const s = document.createElement('style'); s.id = 'rz-relacomp-css'; s.textContent = ACOMP_CSS; document.head.appendChild(s); }
    fecharRelatorioExecutivo(); acomp = null;
    cad = { tipo, empId: null, empNome: null, dados: null, aba: tipo === 'carteira' ? 'carteira' : 'partes', filtro: 'todos', partesIds: null };
    const el = document.createElement('div');
    el.id = 'rz-relexec'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true');
    el.setAttribute('aria-label', tipo === 'carteira' ? 'Cadastro da carteira' : 'Cadastro de partes e pessoas');
    document.body.appendChild(el);
    cadCarregar();
}
async function cadCarregar() {
    const el = document.getElementById('rz-relexec'); if (!el || !cad) return;
    el.innerHTML = `<div class="rx-top">
        <button type="button" class="rx-voltar" data-cad="fechar" aria-label="Voltar para Relatórios"><svg data-lucide="chevron-left"></svg>Relatórios</button>
        <span class="rx-sp"></span>
        ${cad.tipo === 'carteira' ? `<button type="button" data-cad="emp"><svg data-lucide="building-2"></svg>${esc(cad.empNome || 'Todos')}<svg data-lucide="chevron-down"></svg></button>` : '<b style="font:600 14px Inter,system-ui,sans-serif">Partes e pessoas</b>'}
      </div>
      <div class="rx-corpo" aria-live="polite"><div class="rx-msg">Montando…</div></div>
      <div class="rx-pe"><button type="button" class="rx-sec" data-cad="compartilhar"><svg data-lucide="share-2"></svg>Compartilhar</button><button type="button" class="rx-pri" data-cad="planilha"><svg data-lucide="sheet"></svg>Exportar planilha</button></div>`;
    el.querySelectorAll('[data-cad]').forEach(b => b.addEventListener('click', () => cadAcao(b.dataset.cad)));
    if (typeof rzIcones === 'function') rzIcones();
    try {
        const r = cad.tipo === 'carteira'
            ? await dbAuth.rpc('fn_relatorio_cadastro_carteira', { p_cliente_id: CLIENTE_ID_SUPABASE, p_empreendimento_id: cad.empId || null })
            : await dbAuth.rpc('fn_relatorio_cadastro_partes', { p_cliente_id: CLIENTE_ID_SUPABASE });
        if (r.error) throw new Error(r.error.message);
        cad.dados = r.data || {};
        if (cad.tipo === 'partes' && !cad.partesIds) {
            const { data } = await dbAuth.from('partes').select('id, nome, documento').eq('cliente_id', CLIENTE_ID_SUPABASE);
            cad.partesIds = data || [];
        }
        cadDesenhar();
    } catch (e) {
        console.error('[rz] cadastro em tela', e);
        el.querySelector('.rx-corpo').innerHTML = `<div class="rx-msg">Não foi possível montar o relatório.<br><small>${esc(e.message || e)}</small></div>`;
    }
}
function cadAcao(a) {
    if (a === 'fechar') { fecharRelatorioExecutivo(); cad = null; return; }
    if (a === 'emp') {
        const emps = cad.dados?.empreendimentos || [];
        abrirSheetAcoes({ titulo: 'Empreendimento', sub: 'Cadastro da carteira', acoes: [
            { icone: 'layers', titulo: 'Todos', aoTocar: () => { Object.assign(cad, { empId: null, empNome: null }); cadCarregar(); } },
            ...emps.map(e => ({ icone: 'building-2', titulo: e.nome, aoTocar: () => { Object.assign(cad, { empId: e.id, empNome: e.nome }); cadCarregar(); } }))] });
    } else if (a === 'planilha') {
        if (cad.tipo === 'carteira') baixarPlanilhaCadastro(cad.empId, cad.empNome); else baixarPlanilhaCadastroPartes();
    } else if (a === 'compartilhar') cadCompartilhar();
}
function cadNumeros() {
    const d = cad.dados || {};
    if (cad.tipo === 'carteira') {
        const l = d.linhas || [];
        const ativos = l.filter(x => x.contrato_situacao === 'ativo');
        return [['Imóveis', new Set(l.map(x => x.imovel)).size], ['Contratos ativos', ativos.length],
            ['Aluguel mensal', brl(ativos.reduce((t, x) => t + num(x.aluguel), 0))], ['Com diagnóstico', l.filter(x => x.diagnostico).length]];
    }
    const r = d.resumo || {};
    return [['Partes', num(r.partes)], ['Sem vínculo', num(r.sem_vinculo)], ['Sem CPF/CNPJ', num(r.sem_documento)], ['Nome repetido', num(r.nome_repetido)]];
}
function cadDesenhar() {
    const corpo = document.querySelector('#rz-relexec .rx-corpo'); if (!corpo || !cad?.dados) return;
    const d = cad.dados, f = cad.filtro;
    const k = `<div class="ra-k">${cadNumeros().map(([r, v]) => `<div><small>${esc(r)}</small><b>${esc(String(v))}</b></div>`).join('')}</div>`;
    let tabs = '', filtros = [], lista = '';
    const fil = (lst) => `<div class="ra-f">${lst.map(([c, r]) => `<button type="button" data-cad-f="${c}" class="${f === c ? 'on' : ''}">${esc(r)}</button>`).join('')}</div>`;
    if (cad.tipo === 'carteira') {
        const l = d.linhas || [];
        tabs = `<div class="ra-tabs"><button type="button" data-cad-aba="carteira" class="${cad.aba === 'carteira' ? 'on' : ''}">Carteira · ${l.length}</button>
            <button type="button" data-cad-aba="emp" class="${cad.aba === 'emp' ? 'on' : ''}">Por empreendimento</button></div>`;
        if (cad.aba === 'carteira') {
            const diag = l.filter(x => x.diagnostico).length, vagos = l.filter(x => !x.locatario).length, semdoc = l.filter(x => x.locatario && !x.documento).length;
            lista += fil([['todos', 'Todos'], ['diag', `Com diagnóstico · ${diag}`], ['vagos', `Vagos · ${vagos}`], ['semdoc', `Sem CPF/CNPJ · ${semdoc}`]]);
            const rows = l.map((x, i) => ({ x, i })).filter(({ x }) => f === 'diag' ? !!x.diagnostico : f === 'vagos' ? !x.locatario : f === 'semdoc' ? (x.locatario && !x.documento) : true);
            let g = null;
            rows.forEach(({ x, i }) => {
                if (x.empreendimento !== g) { g = x.empreendimento; lista += `<div class="ra-g">${esc(g || 'Sem empreendimento')}</div>`; }
                lista += `<button type="button" class="ra-l" data-cad-i="${i}"><div class="ra-l1"><b>${esc(x.imovel || 'Imóvel')}</b><span>${x.aluguel != null ? brl(x.aluguel) : '—'}</span></div>
                  <div class="ra-l2"><span><i class="ra-d ${x.locatario ? 'ra-ok' : 'ra-bad'}"></i>${esc(x.locatario || 'Vago')}${x.documento ? ' · ' + esc(x.doc_tipo || '') + ' ' + esc(x.documento) : ''}</span><span>${esc(x.contrato_tipo || x.tipo || '')}</span></div>
                  ${x.diagnostico ? `<div class="ra-o">⚠ ${esc(x.diagnostico)}</div>` : ''}</button>`;
            });
            if (!rows.length) lista += '<div class="ra-v">Nada neste filtro.</div>';
        } else {
            const por = {};
            l.forEach(x => { const e = por[x.empreendimento || 'Sem empreendimento'] || (por[x.empreendimento || 'Sem empreendimento'] = { im: new Set(), c: 0, al: 0, dg: 0 });
                e.im.add(x.imovel); if (x.contrato_situacao === 'ativo') { e.c++; e.al += num(x.aluguel); } if (x.diagnostico) e.dg++; });
            Object.entries(por).forEach(([n, e]) => {
                lista += `<div class="ra-l" style="cursor:default"><div class="ra-l1"><b>${esc(n)}</b><span>${brl(e.al)}</span></div>
                  <div class="ra-l2"><span>${e.im.size} imóve${e.im.size === 1 ? 'l' : 'is'} · ${e.c} contrato${e.c === 1 ? '' : 's'} ativo${e.c === 1 ? '' : 's'}</span><span class="${e.dg ? 'n' : ''}">${e.dg ? e.dg + ' com diagnóstico' : 'ok'}</span></div></div>`;
            });
        }
    } else {
        const p = d.partes || [], pe = d.pessoas || [];
        tabs = `<div class="ra-tabs"><button type="button" data-cad-aba="partes" class="${cad.aba === 'partes' ? 'on' : ''}">Partes · ${p.length}</button>
            <button type="button" data-cad-aba="pessoas" class="${cad.aba === 'pessoas' ? 'on' : ''}">Pessoas · ${pe.length}</button>
            <button type="button" data-cad-aba="empresa" class="${cad.aba === 'empresa' ? 'on' : ''}">Empresa</button></div>`;
        const tem = (x, a) => (x.achados || []).includes(a);
        if (cad.aba === 'partes') {
            lista += fil([['todos', 'Todas'], ['achado', `Com achado · ${p.filter(x => (x.achados || []).length).length}`], ['semvinc', `Sem vínculo · ${p.filter(x => tem(x, 'sem vínculo')).length}`],
                ['semdoc', `Sem CPF/CNPJ · ${p.filter(x => tem(x, 'sem CPF/CNPJ')).length}`], ['rep', `Nome repetido · ${p.filter(x => tem(x, 'nome repetido')).length}`], ['inv', `CPF/CNPJ inválido · ${p.filter(x => tem(x, 'CPF/CNPJ inválido')).length}`]]);
            const rows = p.map((x, i) => ({ x, i })).filter(({ x }) => f === 'achado' ? (x.achados || []).length : f === 'semvinc' ? tem(x, 'sem vínculo') : f === 'semdoc' ? tem(x, 'sem CPF/CNPJ') : f === 'rep' ? tem(x, 'nome repetido') : f === 'inv' ? tem(x, 'CPF/CNPJ inválido') : true);
            rows.forEach(({ x, i }) => {
                lista += `<button type="button" class="ra-l" data-cad-i="${i}"><div class="ra-l1"><b>${esc(x.nome || '')}</b><span>${num(x.vinculos)} vínculo${num(x.vinculos) === 1 ? '' : 's'}</span></div>
                  <div class="ra-l2"><span><i class="ra-d ${(x.achados || []).length ? 'ra-warn' : 'ra-ok'}"></i>${esc(x.documento ? (x.doc_tipo || '') + ' ' + x.documento : 'sem CPF/CNPJ')}</span><span>${esc(x.papeis || '')}</span></div>
                  ${(x.achados || []).length ? `<div class="ra-o">⚠ ${esc(x.achados.join(' · '))}</div>` : ''}</button>`;
            });
            if (!rows.length) lista += '<div class="ra-v">Nada neste filtro.</div>';
        } else if (cad.aba === 'pessoas') {
            pe.forEach(x => {
                lista += `<div class="ra-l" style="cursor:default"><div class="ra-l1"><b>${esc(x.nome || '')}</b><span>${x.cota != null ? esc(String(x.cota).replace('.', ',')) + '%' : ''}</span></div>
                  <div class="ra-l2"><span><i class="ra-d ${(x.achados || []).length ? 'ra-warn' : 'ra-ok'}"></i>${esc([x.perfil, x.funcao].filter(Boolean).join(' · '))}</span><span>${x.login ? 'acessa o app' : 'sem acesso'}</span></div>
                  ${(x.achados || []).length ? `<div class="ra-o">${esc(x.achados.join(' · '))}</div>` : ''}</div>`;
            });
            if (d.resumo && d.resumo.cotas_ok === false) lista += `<div class="ra-av">As cotas das pessoas somam ${esc(String(d.resumo.cotas_pessoas))}% (deveria ser 100%).</div>`;
        } else {
            const e = d.empresa || {};
            lista += [['Nome', e.nome], ['Razão social', e.razao], ['Documento', [e.doc_tipo, e.documento].filter(Boolean).join(' ')], ['Cidade/UF', [e.cidade, e.uf].filter(Boolean).join('/')],
                ['Natureza', e.natureza], ['Regime tributário', e.regime], ['Plano', e.plano], ['No Raiz desde', e.desde ? dma(e.desde) : '']]
                .map(([a, b]) => `<div class="ra-l" style="cursor:default"><div class="ra-l1"><span>${esc(a)}</span><b>${esc(b || '—')}</b></div></div>`).join('');
        }
    }
    corpo.innerHTML = `<div class="ra">${k}${tabs}${lista}<p class="ra-n">${cad.tipo === 'carteira' ? 'Toque num imóvel para corrigir o contrato e o locatário ou abrir o imóvel.' : 'Toque numa parte para editar, ver os vínculos ou excluir.'} A planilha sai com o que está aqui.</p></div>`;
    corpo.querySelectorAll('[data-cad-aba]').forEach(b => b.addEventListener('click', () => { cad.aba = b.dataset.cadAba; cad.filtro = 'todos'; cadDesenhar(); }));
    corpo.querySelectorAll('[data-cad-f]').forEach(b => b.addEventListener('click', () => { cad.filtro = b.dataset.cadF; cadDesenhar(); }));
    corpo.querySelectorAll('[data-cad-i]').forEach(b => b.addEventListener('click', () => cad.tipo === 'carteira' ? cadTocarImovel(d.linhas[Number(b.dataset.cadI)]) : cadTocarParte(d.partes[Number(b.dataset.cadI)])));
}
function cadTocarImovel(x) {
    if (!x) return;
    const imo = (typeof imoveis !== 'undefined' ? imoveis : []).find(i => cadNorm(i.nomeExibicao) === cadNorm(x.imovel));
    const con = x.locatario && imo ? (typeof contratos !== 'undefined' ? contratos : []).find(c => c.imovelId === imo.id && cadNorm(c.locatario) === cadNorm(x.locatario) && c.status !== 'Finalizado') : null;
    const acoes = [];
    if (con) {
        acoes.push({ icone: 'user-round-pen', titulo: 'Corrigir o locatário', sub: 'Nome, CPF/CNPJ e contato', codigo: 'contratos.editar', aoTocar: () => { window.abrirEditarLocatarioContrato(con.id); cadRecarregarAoVoltar(); } });
        acoes.push({ icone: 'file-pen', titulo: 'Corrigir o contrato', sub: 'Valor, vencimento, reajuste', codigo: 'contratos.editar', aoTocar: () => { window.abrirDetalhesContrato(con.id); cadRecarregarAoVoltar(); } });
    }
    if (imo) acoes.push({ icone: 'building-2', titulo: 'Abrir o imóvel', sub: 'Sai do relatório', aoTocar: () => { fecharRelatorioExecutivo(); cad = null; switchTab('tab-ativos'); window.dispatchEvent(new CustomEvent('cofre:abrir-ativo', { detail: { id: imo.id } })); } });
    if (!acoes.length) { rzToast('Não achei este imóvel na lista do app. Abra por Patrimônio.', 'warning'); return; }
    abrirSheetAcoes({ titulo: x.imovel || 'Imóvel', sub: [x.locatario || 'Vago', x.diagnostico].filter(Boolean).join(' · '), acoes });
}
async function cadTocarParte(x) {
    if (!x) return;
    const dig = (s) => String(s || '').replace(/\D/g, '');
    const cands = (cad.partesIds || []).filter(p => cadNorm(p.nome) === cadNorm(x.nome));
    const pt = cands.length > 1 && x.documento ? (cands.find(p => dig(p.documento) && dig(x.documento).startsWith(dig(p.documento).slice(0, 3)) && dig(p.documento).endsWith(dig(x.documento).slice(-2))) || cands[0]) : cands[0];
    if (!pt) { rzToast('Não achei esta parte. Abra por Cadastros › Partes.', 'warning'); return; }
    try { if (typeof window.carregarPartes === 'function') await window.carregarPartes(); } catch (e) { /* segue */ }
    abrirSheetAcoes({ titulo: x.nome, sub: (x.achados || []).join(' · ') || (x.papeis || ''), acoes: [
        { icone: 'pencil', titulo: 'Editar a parte', sub: 'Nome, CPF/CNPJ, contato', codigo: 'partes.editar', aoTocar: () => { window.abrirFormParteSheet(pt.id); cadRecarregarAoVoltar(); } },
        { icone: 'more-horizontal', titulo: 'Vínculos, papel e excluir', sub: 'As ações de Partes', codigo: 'partes.ver', aoTocar: () => { window.abrirAcoesParte(pt.id); cadRecarregarAoVoltar(); } },
    ] });
}
function cadRecarregarAoVoltar() {
    let vezes = 0;
    const t = setInterval(() => {
        vezes++;
        if (!cad || vezes > 600) { clearInterval(t); return; }
        if (!acompSheetAberto() && vezes > 1) { clearInterval(t); cad.partesIds = null; cadCarregar(); }
    }, 1000);
}
async function cadCompartilhar() {
    if (!cad?.dados) return;
    const tit = cad.tipo === 'carteira' ? `Cadastro da carteira · ${cad.dados.empresa || ''}${cad.empNome ? ' · ' + cad.empNome : ''}` : `Cadastro de partes e pessoas · ${cad.dados.empresa?.nome || ''}`;
    const texto = `${tit}\n${cadNumeros().map(([r, v]) => `${r}: ${v}`).join(' · ')}`;
    const r = await RaizDevice.share({ titulo: tit, texto });
    if (r && r.ok === false && r.motivo === 'sem_share') {
        try { await navigator.clipboard.writeText(texto); rzToast('Resumo copiado'); } catch (e) { rzToast('Sem compartilhar aqui. Use a planilha.', 'warning'); }
    }
}


// ---------------------------------------------------------------------------
// Acompanhamento do mês (v1.8.0) — relatorios.acompanhamento_mes, dados de fn_relatorio_acompanhamento_mes (REL-02:
// a tela e a planilha só formatam). Tela interativa: o mês e o empreendimento no topo, 4 números, aviso quando o
// extrato do mês não foi importado, e três abas (Recebimentos, Despesas, Por imóvel). Tocar numa linha abre as ações
// que já existem no Financeiro (Dar baixa, Ajustar valores, Estornar, a despesa) e "Observação", que grava em
// mensalidades.observacao / lancamentos.observacao com as mesmas permissões da tela de origem. A planilha tem 5 abas:
// Recebimentos, Despesas, Por imóvel, Gráficos (imagem: o ExcelJS não gera gráfico nativo) e Sobre; as colunas
// "Correção do recebido" e "Observação" vêm em amarelo para o cliente preencher e devolver.
// FICHA_REL_ACOMPANHAMENTO_MES v1.0.0 + aba "Por imóvel" (de acordo do Nicola 11/11 08:59), demanda add3d7a0.
// ---------------------------------------------------------------------------
const ACOMP_CODIGO = 'relatorios.acompanhamento_mes';
let acomp = null; // { comp, empId, empNome, dados, aba, filtro }
const ACOMP_CSS = `
 #rz-relexec .ra{width:100%;max-width:720px;display:flex;flex-direction:column;gap:12px;font-family:Inter,system-ui,sans-serif;color:var(--ink,#17211e)}
 #rz-relexec .ra-k{display:grid;grid-template-columns:1fr 1fr;gap:8px}
 @media(min-width:720px){#rz-relexec .ra-k{grid-template-columns:repeat(4,1fr)}}
 #rz-relexec .ra-k div{background:var(--card,#fff);border:1px solid var(--line,#e6e3da);border-radius:12px;padding:10px 12px}
 #rz-relexec .ra-k small{display:block;font-size:var(--fs-min);color:var(--muted,#6f7a76)}
 #rz-relexec .ra-k b{font-size:var(--fs-titulo);font-variant-numeric:tabular-nums;color:var(--pine,#1e3a32)}
 #rz-relexec .ra-k .neg b{color:var(--danger,#c1463a)}
 #rz-relexec .ra-av{background:#f7ecd9;color:#6b4415;border-radius:12px;padding:10px 12px;font-size:var(--fs-sec)}
 #rz-relexec .ra-tabs{display:flex;gap:6px}
 #rz-relexec .ra-tabs button{flex:1;min-width:0;min-height:40px;border-radius:10px;border:1px solid var(--line,#e6e3da);background:var(--card,#fff);font:600 12px Inter,system-ui,sans-serif;color:var(--ink,#17211e);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:0 6px}
 #rz-relexec .ra-tabs button.on{border-color:var(--pine,#1e3a32);color:var(--pine,#1e3a32);box-shadow:inset 0 -2px 0 var(--pine,#1e3a32)}
 #rz-relexec .ra-f{display:flex;gap:6px;overflow-x:auto;padding-bottom:2px;scrollbar-width:none}
 #rz-relexec .ra-f::-webkit-scrollbar{display:none}
 #rz-relexec .ra-f button{flex:none;border:1px solid var(--line,#e6e3da);background:var(--card,#fff);border-radius:999px;padding:5px 11px;font:500 12px Inter,system-ui,sans-serif;color:var(--muted,#6f7a76)}
 #rz-relexec .ra-f button.on{color:var(--pine,#1e3a32);border-color:var(--pine,#1e3a32)}
 #rz-relexec .ra-g{font-size:var(--fs-mini);font-weight:700;color:var(--muted,#6f7a76);text-transform:uppercase;letter-spacing:.04em;margin:6px 0 -4px}
 #rz-relexec .ra-l{background:var(--card,#fff);border:1px solid var(--line,#e6e3da);border-radius:12px;padding:10px 12px;cursor:pointer;text-align:left;width:100%;font:inherit;color:inherit}
 #rz-relexec .ra-l1,#rz-relexec .ra-l2{display:flex;justify-content:space-between;gap:10px}
 #rz-relexec .ra-l1 b{font-weight:600}#rz-relexec .ra-l1 span{font-variant-numeric:tabular-nums;white-space:nowrap}
 #rz-relexec .ra-l2{font-size:var(--fs-min);color:var(--muted,#6f7a76);margin-top:2px}
 #rz-relexec .ra-l2 .n{color:var(--danger,#c1463a);font-weight:600}#rz-relexec .ra-l2 .p{color:var(--sprout,#2f6a51);font-weight:600}
 #rz-relexec .ra-d{display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:5px;vertical-align:middle}
 #rz-relexec .ra-ok{background:#2f6a51}#rz-relexec .ra-bad{background:#c1463a}#rz-relexec .ra-warn{background:#8a5a1f}#rz-relexec .ra-neu{background:#9aa39f}
 #rz-relexec .ra-o{font-size:var(--fs-min);color:#6b4415;margin-top:4px}
 #rz-relexec .ra-v{text-align:center;color:var(--muted,#6f7a76);padding:24px 8px;font-size:var(--fs-corpo)}
 #rz-relexec .ra-n{font-size:var(--fs-min);color:var(--muted,#6f7a76)}`;
const ACOMP_ORIGEM = { extrato: 'Extrato', administradora: 'Administradora', manual: 'Manual', extrato_pendente: 'Extrato · a classificar' };
// a observação do recebimento também guarda a nota automática da conciliação ("Conciliado …"): ela não aparece como
// observação do cliente e é preservada ao salvar
const ACOMP_NOTA_SISTEMA = /^Conciliado\b/;
function obsUsuario(o) { return String(o || '').split('\n').filter(l => l.trim() && !ACOMP_NOTA_SISTEMA.test(l.trim())).join('\n'); }
function obsJuntar(usuario, original) {
    const sistema = String(original || '').split('\n').filter(l => ACOMP_NOTA_SISTEMA.test(l.trim()));
    return [String(usuario || '').trim(), ...sistema].filter(Boolean).join('\n') || null;
}
function acompSituacao(r) {
    if (r.recebido == null) return { t: 'Em aberto', c: 'ra-bad' };
    const d = num(r.diferenca);
    if (Math.abs(d) < 1) return { t: 'Recebido', c: 'ra-ok' };
    return d > 0 ? { t: 'Recebido a mais', c: 'ra-warn' } : { t: 'Recebido a menos', c: 'ra-warn' };
}
function acompTotais(d) {
    const rec = d.recebimentos || [], desp = (d.despesas || []).filter(x => x.situacao === 'realizado');
    const aReceber = rec.reduce((s, r) => s + num(r.a_receber), 0);
    const recebido = rec.reduce((s, r) => s + num(r.recebido) + (r.recebido != null ? num(r.taxa_adm) : 0), 0);
    return { aReceber, recebido, diferenca: rec.reduce((s, r) => s + num(r.diferenca), 0), despesas: desp.reduce((s, x) => s + num(x.valor), 0),
             abertos: rec.filter(r => r.recebido == null).length, comDif: rec.filter(r => r.recebido != null && Math.abs(num(r.diferenca)) >= 1).length,
             comObs: rec.filter(r => obsUsuario(r.observacao)).length };
}
function acompTelaHtml() {
    return `<div class="rx-top">
        <button type="button" class="rx-voltar" data-ra="fechar" aria-label="Voltar para Relatórios"><svg data-lucide="chevron-left"></svg>Relatórios</button>
        <span class="rx-sp"></span>
        <button type="button" data-ra="mes"><svg data-lucide="calendar"></svg>${esc(comp(acomp.comp))}<svg data-lucide="chevron-down"></svg></button>
        <button type="button" data-ra="emp"><svg data-lucide="building-2"></svg>${esc(acomp.empNome || 'Todos')}<svg data-lucide="chevron-down"></svg></button>
      </div>
      <div class="rx-corpo" aria-live="polite"><div class="rx-msg">Montando o acompanhamento…</div></div>
      <div class="rx-pe"><button type="button" class="rx-sec" data-ra="compartilhar"><svg data-lucide="share-2"></svg>Compartilhar</button><button type="button" class="rx-pri" data-ra="planilha"><svg data-lucide="sheet"></svg>Exportar planilha</button></div>`;
}
function acompCorpoHtml() {
    const d = acomp.dados, t = acompTotais(d), ext = d.extrato || {};
    const semExtrato = !num(ext.linhas_no_mes);
    const aviso = semExtrato
        ? `<div class="ra-av">O extrato de ${esc(mesLongo(acomp.comp))} ainda não foi importado${ext.ultima_data ? ` (o último vai até ${esc(dma(ext.ultima_data))})` : ''}. ${t.abertos ? `${t.abertos} ${t.abertos === 1 ? 'recebimento em aberto pode' : 'recebimentos em aberto podem'} já ter caído no banco.` : ''}</div>`
        : (num(ext.pendentes_entrada_mes) + num(ext.pendentes_saida_mes) ? `<div class="ra-av">${num(ext.pendentes_entrada_mes) + num(ext.pendentes_saida_mes)} linhas do extrato deste mês ainda sem classificar na Conciliação.</div>` : '');
    const k = `<div class="ra-k"><div><small>A receber no mês</small><b>${brl(t.aReceber)}</b></div><div><small>Recebido</small><b>${brl(t.recebido)}</b></div>
        <div class="${t.diferenca < -0.99 ? 'neg' : ''}"><small>Diferença</small><b>${brl(t.diferenca)}</b></div><div><small>Despesas do mês</small><b>${brl(t.despesas)}</b></div></div>`;
    const nDesp = (d.despesas || []).length + (d.fora_resultado || []).length;
    const tabs = `<div class="ra-tabs"><button type="button" data-ra-aba="rec" class="${acomp.aba === 'rec' ? 'on' : ''}">Recebimentos · ${(d.recebimentos || []).length}</button>
        <button type="button" data-ra-aba="desp" class="${acomp.aba === 'desp' ? 'on' : ''}">Despesas · ${nDesp}</button>
        <button type="button" data-ra-aba="ativo" class="${acomp.aba === 'ativo' ? 'on' : ''}">Por imóvel</button></div>`;
    let lista = '';
    if (acomp.aba === 'rec') {
        const f = acomp.filtro;
        const filtros = [['todos', 'Todos'], ['aberto', `Em aberto · ${t.abertos}`], ['dif', `Com diferença · ${t.comDif}`], ['obs', `Com observação · ${t.comObs}`]];
        lista += `<div class="ra-f">${filtros.map(([c, r]) => `<button type="button" data-ra-f="${c}" class="${f === c ? 'on' : ''}">${esc(r)}</button>`).join('')}</div>`;
        const rows = (d.recebimentos || []).filter(r => f === 'aberto' ? r.recebido == null : f === 'dif' ? (r.recebido != null && Math.abs(num(r.diferenca)) >= 1) : f === 'obs' ? obsUsuario(r.observacao) : true);
        let g = null;
        rows.forEach(r => {
            if (r.empreendimento !== g) { g = r.empreendimento; lista += `<div class="ra-g">${esc(g)}</div>`; }
            const s = acompSituacao(r), dif = num(r.diferenca);
            lista += `<button type="button" class="ra-l" data-ra-rec="${esc(r.mensalidade_id)}"><div class="ra-l1"><b>${esc(r.imovel || 'Sem imóvel')}</b><span>${r.recebido == null ? '—' : brl(r.recebido)}</span></div>
              <div class="ra-l2"><span><i class="ra-d ${s.c}"></i>${esc(s.t)} · ${esc(r.locatario || '')}</span><span class="${dif < -0.99 ? 'n' : dif > 0.99 ? 'p' : ''}">${Math.abs(dif) < 1 ? (r.recebido == null ? 'a receber ' + brl(r.a_receber) : 'sem diferença') : (dif > 0 ? '+' : '') + brl(dif)}</span></div>
              ${obsUsuario(r.observacao) ? `<div class="ra-o">✎ ${esc(obsUsuario(r.observacao))}</div>` : ''}</button>`;
        });
        if (!rows.length) lista += `<div class="ra-v">Nada neste filtro.</div>`;
    } else if (acomp.aba === 'desp') {
        const desp = d.despesas || [], fora = d.fora_resultado || [];
        if (!desp.length && !fora.length) lista += `<div class="ra-v">Nenhuma despesa neste mês.${semExtrato ? ' Importe o extrato para as saídas do banco aparecerem aqui.' : ''}</div>`;
        desp.forEach((x, i) => {
            lista += `<button type="button" class="ra-l" data-ra-desp="${i}"><div class="ra-l1"><b>${esc(x.descricao || x.categoria_nome || 'Despesa')}</b><span>${brl(x.valor)}</span></div>
              <div class="ra-l2"><span>${esc(x.data ? dma(x.data) : '')} · ${esc(x.categoria_nome || '')}${x.imovel ? ' · ' + esc(x.imovel) : ''}</span><span>${esc(ACOMP_ORIGEM[x.origem] || '')}${x.situacao === 'previsto' ? ' · a pagar' : ''}</span></div>
              ${obsUsuario(x.observacao) ? `<div class="ra-o">✎ ${esc(obsUsuario(x.observacao))}</div>` : ''}</button>`;
        });
        if (fora.length) {
            lista += `<div class="ra-g">Fora do resultado</div>`;
            fora.forEach((x, i) => {
                lista += `<button type="button" class="ra-l" data-ra-fora="${i}"><div class="ra-l1"><b>${esc(x.descricao || '')}</b><span>${brl(x.valor)}</span></div>
                  <div class="ra-l2"><span>${esc(x.data ? dma(x.data) : '')} · ${esc(x.natureza || '')}</span><span>${esc(ACOMP_ORIGEM[x.origem] || '')}</span></div></button>`;
            });
        }
    } else {
        const at = d.por_ativo || [];
        if (!at.length) lista += `<div class="ra-v">Nenhum imóvel com movimento neste mês.</div>`;
        let g = null;
        at.forEach(a => {
            if (a.empreendimento !== g) { g = a.empreendimento; lista += `<div class="ra-g">${esc(g)}</div>`; }
            const desp = num(a.taxa_adm) + num(a.condominio) + num(a.iptu) + num(a.manutencao) + num(a.outras), liq = num(a.liquido);
            lista += `<div class="ra-l" style="cursor:default"><div class="ra-l1"><b>${esc(a.imovel)}</b><span>${brl(liq)}</span></div>
              <div class="ra-l2"><span>recebido ${brl(a.bruto_recebido)} · saiu ${brl(desp)}</span><span class="${liq < -0.99 ? 'n' : ''}">líquido</span></div></div>`;
        });
        if (num(d.despesas_sem_ativo?.valor)) lista += `<p class="ra-n">Despesas sem imóvel no mês (empresa): ${brl(d.despesas_sem_ativo.valor)}, fora desta visão.</p>`;
    }
    const difs = d.diferencas_prestacao || []; // v1.10.0 — E8
    const difTxt = (x, v) => x.tipo === 'taxa' ? `${String(num(v)).replace('.', ',')}%` : brl(v);
    const difHtml = difs.length ? `<div class="ra-av" style="text-align:left"><b>Diferenças da prestação de contas · ${difs.length}</b>
        ${difs.map(x => `<div style="display:flex;justify-content:space-between;gap:8px;margin-top:4px"><span>${esc(x.locatario || '')} · ${esc(x.rotulo || x.tipo)}</span><span>contrato ${esc(difTxt(x, x.contrato))} · cobrado ${esc(difTxt(x, x.cobrado))}</span></div>`).join('')}
        <div style="margin-top:4px;opacity:.8">Gravado o que a administradora cobrou. Ajuste o contrato ou fale com a administradora.</div></div>` : '';
    return `<div class="ra">${aviso}${k}${difHtml}${tabs}${lista}<p class="ra-n">Toque numa linha para corrigir o recebimento ou escrever uma observação. A planilha sai com o que está aqui.</p></div>`;
}
async function acompBuscar() {
    const [{ data, error }, quem] = await Promise.all([
        dbAuth.rpc('fn_relatorio_acompanhamento_mes', { p_cliente_id: CLIENTE_ID_SUPABASE, p_competencia: acomp.comp, p_empreendimento_id: acomp.empId || null }),
        quemGera()]);
    if (error) throw new Error(error.message);
    if (!data?.ok) throw new Error(data?.mensagem || 'O relatório não veio.');
    return { ...data, gerado_por: quem };
}
async function acompCarregar() {
    const el = document.getElementById('rz-relexec'); if (!el || !acomp) return;
    el.innerHTML = acompTelaHtml();
    el.querySelectorAll('[data-ra]').forEach(b => b.addEventListener('click', () => acompAcao(b.dataset.ra)));
    if (typeof rzIcones === 'function') rzIcones();
    const corpo = el.querySelector('.rx-corpo');
    try {
        acomp.dados = await acompBuscar();
        acompDesenhar();
    } catch (e) {
        console.error('[rz] acompanhamento', e);
        corpo.innerHTML = `<div class="rx-msg">Não foi possível montar o acompanhamento.<br><small>${esc(e.message || e)}</small></div>`;
    }
}
function acompDesenhar() {
    const corpo = document.querySelector('#rz-relexec .rx-corpo'); if (!corpo || !acomp?.dados) return;
    corpo.innerHTML = acompCorpoHtml();
    corpo.querySelectorAll('[data-ra-aba]').forEach(b => b.addEventListener('click', () => { acomp.aba = b.dataset.raAba; acompDesenhar(); }));
    corpo.querySelectorAll('[data-ra-f]').forEach(b => b.addEventListener('click', () => { acomp.filtro = b.dataset.raF; acompDesenhar(); }));
    corpo.querySelectorAll('[data-ra-rec]').forEach(b => b.addEventListener('click', () => acompTocarRecebimento(b.dataset.raRec)));
    corpo.querySelectorAll('[data-ra-desp]').forEach(b => b.addEventListener('click', () => acompTocarDespesa((acomp.dados.despesas || [])[Number(b.dataset.raDesp)])));
}
function acompAcao(a) {
    if (a === 'fechar') { fecharRelatorioExecutivo(); acomp = null; return; }
    if (a === 'mes') {
        const hoje = new Date(), m0 = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        abrirSheetAcoes({ titulo: 'Mês', sub: 'Acompanhamento do mês', acoes: Array.from({ length: 13 }, (_, i) => iso(somaMeses(m0, 1 - i))).map(c => ({
            icone: 'calendar', titulo: comp(c), sub: c === iso(m0) ? 'mês atual' : '', aoTocar: () => { acomp.comp = c; acompCarregar(); } })) });
    } else if (a === 'emp') {
        const emps = acomp.dados?.empreendimentos || [];
        abrirSheetAcoes({ titulo: 'Empreendimento', sub: 'Acompanhamento do mês', acoes: [
            { icone: 'layers', titulo: 'Todos', aoTocar: () => { Object.assign(acomp, { empId: null, empNome: null }); acompCarregar(); } },
            ...emps.map(e => ({ icone: 'building-2', titulo: e.nome, aoTocar: () => { Object.assign(acomp, { empId: e.id, empNome: e.nome }); acompCarregar(); } }))] });
    } else if (a === 'planilha') baixarPlanilhaAcompanhamento();
    else if (a === 'compartilhar') acompCompartilhar();
}
function acompObservacao(tabela, id, atual, titulo) {
    abrirSheetForm({ titulo: 'Observação', sub: titulo, rotuloSalvar: 'Salvar observação',
        corpo: `<div class="rz-f"><label>Observação</label><textarea id="ra-obs" rows="3" maxlength="500" placeholder="Ex.: desconto combinado até dezembro">${esc(obsUsuario(atual))}</textarea></div>`,
        aoSalvar: async (el) => {
            const texto = obsJuntar(el.querySelector('#ra-obs')?.value, atual);
            const { error } = await dbAuth.from(tabela).update({ observacao: texto }).eq('cliente_id', CLIENTE_ID_SUPABASE).eq('id', id);
            if (error) throw new Error(error.message);
            rzToast('Observação salva');
            acompCarregar();
            return true;
        } });
}
function acompTocarRecebimento(id) {
    const r = (acomp.dados.recebimentos || []).find(x => x.mensalidade_id === id); if (!r) return;
    const sub = `${r.locatario || ''} · ${comp(acomp.comp)} · a receber ${brl(r.a_receber)}${r.recebido != null ? ' · recebido ' + brl(r.recebido) : ''}`;
    abrirSheetAcoes({ titulo: r.imovel || 'Recebimento', sub, acoes: [
        { icone: 'pencil', titulo: r.recebido == null ? 'Dar baixa' : 'Corrigir o recebimento', sub: r.recebido == null ? 'Registrar o que entrou' : 'Ajustar valores ou estornar',
          codigo: 'mensal.baixar', aoTocar: () => acompAbrirRecebimento(r) },
        { icone: 'message-square', titulo: 'Observação', sub: obsUsuario(r.observacao) ? 'Editar' : 'Escrever', codigo: 'mensal.baixar',
          aoTocar: () => acompObservacao('mensalidades', r.mensalidade_id, r.observacao, `${r.imovel || ''} · ${comp(acomp.comp)}`) },
    ] });
}
function acompAbrirRecebimento(r) {
    // mesmas ações de Financeiro › Recebimentos (rzAcoesMensalidade); a lista do Financeiro precisa ter o recebimento em memória
    if (typeof window.rzAcoesMensalidade !== 'function') { rzToast('Abra em Financeiro › Recebimentos.', 'warning'); return; }
    window.rzAcoesMensalidade(r.mensalidade_id);
    setTimeout(() => { if (!acompSheetAberto()) rzToast('Abra em Recebimentos, mês ' + comp(acomp.comp) + '.', 'warning'); }, 400);
    acompRecarregarAoVoltar();
}
function acompTocarDespesa(x) {
    if (!x) return;
    const acoes = [];
    if (x.tipo === 'lancamento' && typeof window.rzAcoesDespesa === 'function') {
        acoes.push({ icone: 'pencil', titulo: 'Abrir a despesa', sub: 'Ver, editar ou pagar', aoTocar: () => { window.rzAcoesDespesa(x.id); acompRecarregarAoVoltar(); } });
        acoes.push({ icone: 'message-square', titulo: 'Observação', sub: obsUsuario(x.observacao) ? 'Editar' : 'Escrever', codigo: 'saidas.registrar',
            aoTocar: () => acompObservacao('lancamentos', x.id, x.observacao, x.descricao || '') });
    } else if (x.tipo === 'taxa_adm') {
        acoes.push({ icone: 'pencil', titulo: 'Abrir o recebimento', sub: 'Taxa vem do recebimento', codigo: 'mensal.baixar',
            aoTocar: () => acompAbrirRecebimento({ mensalidade_id: x.id }) });
    } else if (x.tipo === 'extrato') {
        acoes.push({ icone: 'git-compare', titulo: 'Classificar no extrato', sub: 'Financeiro › Conciliação', aoTocar: () => rzToast('Classifique em Conciliação.') });
    }
    if (!acoes.length) return;
    abrirSheetAcoes({ titulo: x.descricao || 'Despesa', sub: `${x.data ? dma(x.data) : ''} · ${brl(x.valor)} · ${ACOMP_ORIGEM[x.origem] || ''}`, acoes });
}
const acompSheetAberto = () => !!document.getElementById('rz-veil')?.classList.contains('rz-on');
// depois de usar uma ação do Financeiro, o relatório se atualiza ao fechar o sheet (sem recarregar a página)
function acompRecarregarAoVoltar() {
    let vezes = 0;
    const t = setInterval(() => {
        vezes++;
        if (!acomp || vezes > 600) { clearInterval(t); return; }
        if (!acompSheetAberto() && vezes > 1) { clearInterval(t); acompCarregar(); }
    }, 1000);
}
async function acompCompartilhar() {
    if (!acomp?.dados) return;
    const t = acompTotais(acomp.dados);
    const l1 = `Acompanhamento de ${comp(acomp.comp)} · ${acomp.dados.empresa || ''}`;
    const l2 = `A receber ${brl(t.aReceber)} · recebido ${brl(t.recebido)} · diferença ${brl(t.diferenca)}`;
    const l3 = `${t.abertos} em aberto · despesas ${brl(t.despesas)}`;
    const r = await RaizDevice.share({ titulo: l1, texto: `${l1}\n${l2}\n${l3}` });
    if (r && r.ok === false && r.motivo === 'sem_share') {
        try { await navigator.clipboard.writeText(`${l1}\n${l2}\n${l3}`); rzToast('Resumo copiado'); } catch (e) { rzToast('Sem compartilhar aqui. Use a planilha.', 'warning'); }
    }
}
export function abrirRelatorioAcompanhamentoMes(opcoes = {}) {
    if (rzMostrarBloqueio(ACOMP_CODIGO)) return; // ACE-04
    garantirCss();
    if (!document.getElementById('rz-relacomp-css')) { const st = document.createElement('style'); st.id = 'rz-relacomp-css'; st.textContent = ACOMP_CSS; document.head.appendChild(st); }
    fecharRelatorioExecutivo();
    const hoje = new Date();
    acomp = { comp: opcoes.competencia || iso(somaMeses(new Date(hoje.getFullYear(), hoje.getMonth(), 1), -1)), empId: null, empNome: null, dados: null, aba: 'rec', filtro: 'todos' };
    const el = document.createElement('div');
    el.id = 'rz-relexec'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'Acompanhamento do mês');
    document.body.appendChild(el);
    acompCarregar();
}

// gráfico em PNG para a aba Gráficos (canvas; o ExcelJS não gera gráfico nativo do Excel)
function acompGraficoPng(o) {
    const W = 760, H = 360, c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d'); g.fillStyle = '#ffffff'; g.fillRect(0, 0, W, H);
    g.fillStyle = '#17211e'; g.font = '600 18px Arial'; g.fillText(o.titulo, 20, 30);
    const cores = o.cores || ['#c9d0ca', '#1e3a32'], series = o.series, cats = o.categorias;
    const L = o.horizontal ? 210 : 70, T = 60, R = o.horizontal ? 80 : 30, B = o.horizontal ? 30 : 70, pw = W - L - R, ph = H - T - B;
    const vals = series.flatMap(s => s.valores.map(num)); const mx = Math.max(0, ...vals), mn = Math.min(0, ...vals), amp = (mx - mn) || 1;
    const fmt = v => (Math.abs(v) >= 1000 ? (v / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mil' : num(v).toLocaleString('pt-BR', { maximumFractionDigits: 0 }));
    g.font = '12px Arial';
    if (!o.horizontal) {
        const y = v => T + (mx - v) / amp * ph, band = pw / Math.max(cats.length, 1), bw = Math.min(30, band * 0.8 / series.length);
        g.strokeStyle = '#e3e6e0'; g.beginPath(); g.moveTo(L, y(0)); g.lineTo(W - R, y(0)); g.stroke();
        cats.forEach((cat, i) => {
            series.forEach((s, k) => {
                const v = num(s.valores[i]), x = L + band * i + (band - bw * series.length) / 2 + bw * k;
                g.fillStyle = cores[k % cores.length]; g.fillRect(x, Math.min(y(v), y(0)), bw - 2, Math.max(Math.abs(y(v) - y(0)), 1));
            });
            g.fillStyle = '#5b6662'; g.textAlign = 'center'; g.fillText(String(cat).slice(0, 16), L + band * i + band / 2, H - B + 18);
        });
        g.textAlign = 'left';
        series.forEach((s, k) => { g.fillStyle = cores[k % cores.length]; g.fillRect(L + k * 150, H - 26, 12, 12); g.fillStyle = '#17211e'; g.fillText(s.nome, L + k * 150 + 18, H - 16); });
        g.fillStyle = '#5b6662'; g.textAlign = 'right'; g.fillText(fmt(mx), L - 8, T + 4); if (mn < 0) g.fillText(fmt(mn), L - 8, T + ph); g.fillText('0', L - 8, y(0) + 4);
    } else {
        const x = v => L + (v - mn) / amp * pw, band = ph / Math.max(cats.length, 1), bh = Math.min(22, band * 0.7), s = series[0];
        cats.forEach((cat, i) => {
            const v = num(s.valores[i]), yy = T + band * i + (band - bh) / 2;
            g.fillStyle = v < 0 ? '#c1463a' : cores[1]; g.fillRect(Math.min(x(v), x(0)), yy, Math.max(Math.abs(x(v) - x(0)), 1), bh);
            g.fillStyle = '#17211e'; g.textAlign = 'right'; g.fillText(String(cat).slice(0, 28), L - 8, yy + bh / 2 + 4);
            g.textAlign = v < 0 ? 'left' : 'left'; g.fillText(fmt(v), v < 0 ? x(0) + 4 : x(v) + 4, yy + bh / 2 + 4);
        });
        g.strokeStyle = '#17211e'; g.beginPath(); g.moveTo(x(0), T); g.lineTo(x(0), T + ph); g.stroke();
    }
    return c.toDataURL('image/png');
}

async function baixarPlanilhaAcompanhamento() {
    const d = acomp?.dados; if (!d) return;
    rzToast('Montando a planilha…');
    try {
        const ExcelJS = await carregarExcelJs();
        const empresa = d.empresa || 'Empresa', quem = d.gerado_por || '';
        const agora = new Date(), p2 = n => String(n).padStart(2, '0');
        const quando = `${p2(agora.getDate())}/${p2(agora.getMonth() + 1)}/${agora.getFullYear()} às ${p2(agora.getHours())}:${p2(agora.getMinutes())}`;
        const recorte = `${MESES_LONGO[dataIso(acomp.comp).getMonth()]}/${dataIso(acomp.comp).getFullYear()} · ${acomp.empNome || 'todos os empreendimentos'}`;
        const F = (sz = 9, b = false, cor = CC.ink, i = false) => ({ name: 'Arial', size: sz, bold: b, italic: i, color: { argb: cor } });
        const fundo = c => ({ type: 'pattern', pattern: 'solid', fgColor: { argb: c } });
        const fio = { style: 'thin', color: { argb: CC.line } }, med = { style: 'medium', color: { argb: CC.pine } };
        const png = await simboloPng();
        const wb = new ExcelJS.Workbook(); wb.creator = 'Raiz Patrimônio'; wb.title = `Acompanhamento do mês · ${empresa}`; wb.created = agora;
        wb.calcProperties = { fullCalcOnLoad: true };
        const topo = (ws, titulo, linhas, nc) => {
            ws.getRow(1).height = 30;
            ws.getCell('A1').value = empresa; ws.getCell('A1').font = F(18, true, CC.pine);
            ws.getCell('A2').value = titulo; ws.getCell('A2').font = F(12, true);
            ws.getCell('A3').value = `${recorte} · gerado em ${quando}${quem ? ' por ' + quem : ''}${linhas != null ? ` · ${linhas} ${linhas === 1 ? 'linha' : 'linhas'}` : ''}`; ws.getCell('A3').font = F(9, false, CC.muted);
            const cm = Math.max(3, nc - 1);
            if (png) { const id = wb.addImage({ base64: png, extension: 'png' }); ws.addImage(id, { tl: { col: cm - 1, row: 0 }, ext: { width: 30, height: 38 } }); }
            ws.getCell(1, cm + 1).value = 'Raiz'; ws.getCell(1, cm + 1).font = F(12, true, CC.pine);
            ws.getCell(2, cm + 1).value = 'Patrimônio'; ws.getCell(2, cm + 1).font = F(8, true, CC.sprout);
            ws.headerFooter.oddFooter = `&L&8${titulo.replace(/&/g, '&&')} · ${empresa.replace(/&/g, '&&')} · gerado em ${quando}&R&8Página &P de &N`;
        };
        const kpis = (ws, itens, nc) => itens.forEach(([rot, formula, fmt], i) => {
            const c0 = 1 + i * 2, a = ws.getCell(5, c0), b = ws.getCell(6, c0);
            if ((ws.getColumn(c0).width || 0) < 15) ws.getColumn(c0).width = 15; // o número de 14 pt cabe sem ###
            a.value = rot; a.font = F(8, false, CC.muted); b.value = { formula }; b.font = F(14, true, CC.pine); b.numFmt = fmt; b.alignment = { horizontal: 'left' };
            [5, 6].forEach(rr => [c0, c0 + 1].forEach(cc => { if (cc <= Math.max(nc, 8)) ws.getCell(rr, cc).fill = fundo(CC.paper); }));
        });
        // tabela padrão (REL-64/65): cols [cab, larg, fmt, ler, {edit, total}]
        const tabela = (ws, HDR, cols, linhas, o = {}) => {
            cols.forEach((c, i) => {
                ws.getColumn(i + 1).width = c[1];
                const cl = ws.getCell(HDR, i + 1); cl.value = c[0]; cl.font = F(9, true, c[4]?.edit ? CC.brassTx : CC.pine); cl.fill = fundo(c[4]?.edit ? CC.brassBg : CC.paper);
                cl.alignment = { wrapText: true, vertical: 'middle', horizontal: c[2] && c[2] !== 'dd/mm/yyyy' ? 'right' : 'left' }; cl.border = { bottom: med };
            });
            ws.getRow(HDR).height = 32;
            const INI = HDR + 1, FIM = Math.max(INI, INI + linhas.length - 1);
            linhas.forEach((r, k) => cols.forEach((c, i) => {
                const cl = ws.getCell(INI + k, i + 1); let v = c[3](r, INI + k);
                if (v && typeof v === 'object' && v.formula) cl.value = v; else if (c[2] === 'dd/mm/yyyy') cl.value = dataXl(v); else if (c[2]) cl.value = nOuNulo(v); else cl.value = tOuNulo(v);
                cl.font = F(9); cl.border = { bottom: fio }; if (c[2]) cl.numFmt = c[2];
                if (c[2] && c[2] !== 'dd/mm/yyyy') cl.alignment = { horizontal: 'right' };
                if (c[4]?.edit) { cl.fill = fundo(CC.brassBg); cl.font = F(9, false, CC.brassTx); cl.protection = { locked: false }; } else if (k % 2 === 1) cl.fill = fundo(CC.zebra);
                if (c[4]?.alerta && c[4].alerta(r)) cl.font = F(9, true, CC.danger);
            }));
            ws.autoFilter = { from: { row: HDR, column: 1 }, to: { row: FIM, column: cols.length } };
            ws.views = [{ state: 'frozen', xSplit: o.xSplit || 0, ySplit: HDR, showGridLines: false }];
            const TR = FIM + 1;
            ws.getCell(TR, 1).value = o.rotTotal || 'Total'; ws.getCell(TR, 1).font = F(9, true);
            cols.forEach((c, i) => { const cl = ws.getCell(TR, i + 1); cl.border = { top: med };
                if (c[4]?.total) { const L = colLetra(i + 1); cl.value = { formula: `SUBTOTAL(9,${L}${INI}:${L}${FIM})` }; cl.numFmt = c[2]; cl.font = F(9, true); cl.alignment = { horizontal: 'right' }; } });
            ws.pageSetup = { orientation: cols.length > 6 ? 'landscape' : 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0, printTitlesRow: `${HDR}:${HDR}` };
            return { INI, FIM, TR };
        };
        const MO = '#,##0.00;[Red]-#,##0.00', DT = 'dd/mm/yyyy';
        const fonte = (ws, row, txt) => { ws.getCell(row, 1).value = `Fonte: Raiz · Acompanhamento do mês · ${txt} · situação em ${quando.slice(0, 10)} · Raiz Patrimônio · raizpatrimonio.com.br`; ws.getCell(row, 1).font = F(8, false, CC.muted, true); };

        // 1. Recebimentos
        const rec = d.recebimentos || [];
        const wr = wb.addWorksheet('Recebimentos');
        const rcols = [
            ['Empreendimento', 16, null, r => r.empreendimento], ['Imóvel', 28, null, r => r.imovel], ['Locatário', 30, null, r => r.locatario],
            ['Dia venc.', 8, '0', r => r.vencimento_dia], ['A receber (bruto)', 13, MO, r => r.a_receber, { total: true }],
            ['Recebido (líquido)', 13, MO, r => r.recebido, { total: true }], ['Taxa adm.', 11, MO, r => (r.recebido != null ? r.taxa_adm : null), { total: true }],
            ['Data do recebimento', 12, DT, r => r.data_recebimento],
            ['Diferença', 12, MO, (r, n) => ({ formula: `IF(F${n}="",-E${n},F${n}+N(G${n})-E${n})` }), { total: true }],
            ['Situação', 15, null, (r, n) => ({ formula: `IF(F${n}="","Em aberto",IF(ABS(F${n}+N(G${n})-E${n})<1,"Recebido",IF(F${n}+N(G${n})>E${n},"Recebido a mais","Recebido a menos")))` })],
            ['Origem da baixa', 14, null, r => ACOMP_ORIGEM[r.origem] || null], ['Administradora', 18, null, r => r.administradora],
            ['Correção do recebido (opcional)', 14, MO, () => null, { edit: true }], ['Observação (pode escrever)', 40, null, r => obsUsuario(r.observacao), { edit: true }],
        ];
        topo(wr, 'Acompanhamento do mês · Recebimentos', rec.length, rcols.length);
        const tr = tabela(wr, 9, rcols, rec, { xSplit: 2 });
        wr.getRow(8).height = 16;
        [[1, 4, 'IMÓVEL E CONTRATO', CC.pine], [5, 10, 'O COMBINADO E O RECEBIDO', CC.sprout], [11, 12, 'ORIGEM', CC.loc], [13, 14, 'PARA VOCÊ PREENCHER', CC.brass]].forEach(([a, b, t, cor]) => {
            wr.mergeCells(8, a, 8, b); const g = wr.getCell(8, a); g.value = t; g.font = F(8, true, CC.branco); g.fill = fundo(cor); g.alignment = { horizontal: 'center' }; });
        kpis(wr, [['A receber no mês', `SUBTOTAL(9,E${tr.INI}:E${tr.FIM})`, MO], ['Recebido (líquido + taxa)', `SUBTOTAL(9,F${tr.INI}:F${tr.FIM})+SUBTOTAL(9,G${tr.INI}:G${tr.FIM})`, MO],
                  ['Diferença', `SUBTOTAL(9,I${tr.INI}:I${tr.FIM})`, MO], ['Em aberto', `COUNTIF(J${tr.INI}:J${tr.FIM},"Em aberto")`, '0']], rcols.length);
        wr.addConditionalFormatting({ ref: `I${tr.INI}:I${tr.FIM}`, rules: [{ type: 'cellIs', operator: 'lessThan', formulae: ['-0.99'], style: { font: { bold: true, color: { argb: CC.danger } } } }] });
        wr.addConditionalFormatting({ ref: `J${tr.INI}:J${tr.FIM}`, rules: [{ type: 'containsText', operator: 'containsText', text: 'Em aberto', style: { font: { bold: true, color: { argb: CC.danger } } } }] });
        let rr = tr.TR + 2;
        const ext = d.extrato || {};
        const recs = [
            !num(ext.linhas_no_mes) ? `Importar o extrato de ${mesLongo(acomp.comp)} (arquivo original do banco): os recebimentos em aberto que já caíram ficam recebidos sozinhos. Raiz › Financeiro › Importar › Importar extrato.` : null,
            'Conferir as diferenças em vermelho: desconto combinado, pagamento de mais de um mês ou valor do contrato desatualizado.',
            'Escreva na coluna "Observação" ou corrija o valor recebido e devolva a planilha à Raiz pelo WhatsApp: a Raiz confere e atualiza no sistema.',
        ].filter(Boolean);
        wr.getCell(rr, 1).value = 'Recomendações'; wr.getCell(rr, 1).font = F(10, true, CC.pine);
        recs.forEach((t, i) => { wr.getCell(rr + 1 + i, 1).value = `${i + 1}. ${t}`; wr.getCell(rr + 1 + i, 1).font = F(9); });
        fonte(wr, rr + recs.length + 2, `recebimentos de ${comp(acomp.comp)}`);

        // 2. Despesas
        const desp = d.despesas || [], fora = d.fora_resultado || [];
        const wd = wb.addWorksheet('Despesas');
        const dcols = [
            ['Data', 12, DT, x => x.data], ['Descrição', 38, null, x => x.descricao], ['Categoria', 22, null, x => x.categoria_nome],
            ['Imóvel', 24, null, x => x.imovel], ['Valor', 13, MO, x => x.valor, { total: true }], ['Origem', 18, null, x => ACOMP_ORIGEM[x.origem] || null],
            ['Situação', 10, null, x => (x.situacao === 'previsto' ? 'A pagar' : 'Pago')], ['Observação (pode escrever)', 40, null, x => obsUsuario(x.observacao), { edit: true }],
        ];
        topo(wd, 'Acompanhamento do mês · Despesas', desp.length, dcols.length);
        const td = tabela(wd, 8, dcols, desp, { rotTotal: 'Total das despesas' });
        kpis(wd, [['Despesas pagas no mês', `SUMIF(G${td.INI}:G${td.FIM},"Pago",E${td.INI}:E${td.FIM})`, MO], ['Condomínio', `SUMIF(C${td.INI}:C${td.FIM},"*ondom*",E${td.INI}:E${td.FIM})`, MO],
                  ['Taxa de administração', `SUMIF(C${td.INI}:C${td.FIM},"Taxa*",E${td.INI}:E${td.FIM})`, MO], ['A classificar (extrato)', `SUMIF(F${td.INI}:F${td.FIM},"Extrato · a classificar",E${td.INI}:E${td.FIM})`, MO]], dcols.length);
        let fr = td.TR + 3;
        wd.getCell(fr - 1, 1).value = 'Saídas fora do resultado (distribuição, retirada, compra de imóvel, repasse)'; wd.getCell(fr - 1, 1).font = F(10, true, CC.pine);
        ['Data', 'Para quem / descrição', 'Natureza', '', 'Valor', 'Origem', '', 'Observação'].forEach((t, i) => { const c = wd.getCell(fr, i + 1); c.value = t || null; c.font = F(9, true, CC.pine); c.fill = fundo(CC.paper); c.border = { bottom: med }; });
        fora.forEach((x, k) => {
            const row = fr + 1 + k;
            [[1, dataXl(x.data), DT], [2, tOuNulo(x.descricao)], [3, tOuNulo(x.natureza)], [5, nOuNulo(x.valor), MO], [6, ACOMP_ORIGEM[x.origem] || null], [8, tOuNulo(obsUsuario(x.observacao))]]
                .forEach(([c, v, f]) => { const cl = wd.getCell(row, c); cl.value = v; cl.font = F(9); cl.border = { bottom: fio }; if (f) cl.numFmt = f; });
        });
        const ffim = fr + fora.length;
        wd.getCell(ffim + 1, 1).value = 'Total fora do resultado'; wd.getCell(ffim + 1, 1).font = F(9, true);
        const tf = wd.getCell(ffim + 1, 5); tf.value = fora.length ? { formula: `SUM(E${fr + 1}:E${ffim})` } : 0; tf.numFmt = MO; tf.font = F(9, true);
        fonte(wd, ffim + 3, `saídas de ${comp(acomp.comp)}`);

        // 3. Por imóvel
        const at = d.por_ativo || [];
        const wa = wb.addWorksheet('Por imóvel');
        const acols = [
            ['Empreendimento', 16, null, a => a.empreendimento], ['Imóvel', 30, null, a => a.imovel], ['A receber', 13, MO, a => a.a_receber, { total: true }],
            ['Recebido (bruto)', 13, MO, a => a.bruto_recebido, { total: true }], ['Taxa adm.', 11, MO, a => a.taxa_adm, { total: true }],
            ['Condomínio', 11, MO, a => a.condominio, { total: true }], ['IPTU', 10, MO, a => a.iptu, { total: true }], ['Manutenção', 11, MO, a => a.manutencao, { total: true }],
            ['Outras', 10, MO, a => a.outras, { total: true }], ['Líquido', 13, MO, (a, n) => ({ formula: `D${n}-E${n}-F${n}-G${n}-H${n}-I${n}` }), { total: true }],
        ];
        topo(wa, 'Acompanhamento do mês · Resultado por imóvel', at.length, acols.length);
        const ta = tabela(wa, 8, acols, at, { xSplit: 2 });
        wa.addConditionalFormatting({ ref: `J${ta.INI}:J${ta.FIM}`, rules: [{ type: 'cellIs', operator: 'lessThan', formulae: ['-0.99'], style: { font: { bold: true, color: { argb: CC.danger } } } }] });
        kpis(wa, [['Recebido (bruto)', `SUBTOTAL(9,D${ta.INI}:D${ta.FIM})`, MO], ['O que saiu do dono', `SUBTOTAL(9,E${ta.INI}:I${ta.FIM})`, MO],
                  ['Líquido dos imóveis', `SUBTOTAL(9,J${ta.INI}:J${ta.FIM})`, MO], ['Margem', `IFERROR(SUBTOTAL(9,J${ta.INI}:J${ta.FIM})/SUBTOTAL(9,D${ta.INI}:D${ta.FIM}),0)`, '0.0%']], acols.length);
        wa.getCell(ta.TR + 2, 1).value = num(d.despesas_sem_ativo?.valor) ? `Despesas sem imóvel ligado (da empresa) no mês: ${brl(d.despesas_sem_ativo.valor)} — ficam fora desta aba.` : 'Todas as despesas do mês estão ligadas a um imóvel.';
        wa.getCell(ta.TR + 2, 1).font = F(9, false, CC.muted);
        fonte(wa, ta.TR + 4, `resultado por imóvel de ${comp(acomp.comp)} · pela data do pagamento`);

        // 3b. Diferenças da prestação de contas (v1.10.0 — E8)
        const dfs = d.diferencas_prestacao || [];
        if (dfs.length) {
            const wf = wb.addWorksheet('Diferenças');
            const pctOuBrl = (x, v) => x.tipo === 'taxa' ? `${String(num(v)).replace('.', ',')}%` : brl(v);
            const fcols = [
                ['Locatário / pagador', 34, null, x => x.locatario || ''], ['O quê', 22, null, x => x.rotulo || x.tipo],
                ['Pelo contrato', 16, null, x => pctOuBrl(x, x.contrato)], ['Cobrado', 16, null, x => pctOuBrl(x, x.cobrado)],
                ['Valor da taxa', 13, MO, x => (x.tipo === 'taxa' ? num(x.valor) : null)], ['Depósito', 12, null, x => (x.data_deposito ? dma(x.data_deposito) : '')],
                ['Administradora', 30, null, x => x.pagador || ''],
            ];
            topo(wf, 'Acompanhamento do mês · Diferenças da prestação de contas', dfs.length, fcols.length);
            const tf2 = tabela(wf, 8, fcols, dfs, {});
            wf.getCell(tf2.TR + 2, 1).value = 'Gravado o que a administradora cobrou (decisão D2). A diferença fica aqui até o contrato ou a administradora serem ajustados.';
            wf.getCell(tf2.TR + 2, 1).font = F(9, false, CC.muted);
            fonte(wf, tf2.TR + 4, `divisões de recebimento de ${comp(acomp.comp)}`);
        }

        // 4. Gráficos (imagens)
        const wg = wb.addWorksheet('Gráficos', { views: [{ showGridLines: false }] });
        for (let c = 1; c <= 16; c++) wg.getColumn(c).width = 10;
        wg.pageSetup = { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 1 };
        topo(wg, 'Acompanhamento do mês · Gráficos', null, 12);
        const porEmp = {}; rec.forEach(r => { const e = porEmp[r.empreendimento] || (porEmp[r.empreendimento] = { a: 0, r: 0 }); e.a += num(r.a_receber); e.r += num(r.recebido) + (r.recebido != null ? num(r.taxa_adm) : 0); });
        const emps = Object.keys(porEmp);
        const h6 = d.historico_6m || [];
        const porCat = {}; desp.filter(x => x.situacao === 'realizado').forEach(x => { porCat[x.categoria_nome || 'Outras'] = (porCat[x.categoria_nome || 'Outras'] || 0) + num(x.valor); });
        const cats = Object.entries(porCat).sort((a, b) => b[1] - a[1]).slice(0, 8);
        const faltas = rec.map(r => [r.imovel || '', num(r.diferenca)]).filter(x => x[1] < -0.99).sort((a, b) => a[1] - b[1]).slice(0, 8);
        const graficos = [
            emps.length ? acompGraficoPng({ titulo: 'A receber × recebido por empreendimento', categorias: emps, series: [{ nome: 'A receber', valores: emps.map(e => porEmp[e].a) }, { nome: 'Recebido', valores: emps.map(e => porEmp[e].r) }] }) : null,
            h6.length ? acompGraficoPng({ titulo: 'Últimos 6 meses · a receber × recebido', categorias: h6.map(h => comp(h.competencia)), series: [{ nome: 'A receber', valores: h6.map(h => h.a_receber) }, { nome: 'Recebido', valores: h6.map(h => h.recebido) }], cores: ['#c9d0ca', '#2f6a51'] }) : null,
            cats.length ? acompGraficoPng({ titulo: 'Despesas do mês por categoria', horizontal: true, categorias: cats.map(c => c[0]), series: [{ nome: 'Despesas', valores: cats.map(c => c[1]) }] }) : null,
            faltas.length ? acompGraficoPng({ titulo: 'Maiores faltas do mês (recebido − a receber)', horizontal: true, categorias: faltas.map(f => f[0]), series: [{ nome: 'Diferença', valores: faltas.map(f => f[1]) }] }) : null,
        ];
        graficos.forEach((b64, i) => {
            if (!b64) return;
            const id = wb.addImage({ base64: b64, extension: 'png' });
            wg.addImage(id, { tl: { col: (i % 2) * 8, row: 4 + Math.floor(i / 2) * 19 }, ext: { width: 500, height: 237 } });
        });
        if (!graficos.some(Boolean)) wg.getCell('A6').value = 'Sem dados para gráficos neste mês.';
        fonte(wg, 46, `${comp(acomp.comp)}`);

        // 5. Sobre
        const wsb = wb.addWorksheet('Sobre', { views: [{ showGridLines: false }] });
        wsb.getColumn(1).width = 30; wsb.getColumn(2).width = 100;
        wsb.getCell('A1').value = 'Sobre esta planilha'; wsb.getCell('A1').font = F(14, true, CC.pine);
        [['O que é uma linha (Recebimentos)', 'Um recebimento de aluguel do mês escolhido: o que estava combinado receber e o que entrou.'],
         ['A receber (bruto)', 'O aluguel cheio do mês, antes da taxa da administradora. Num mês com reajuste no meio do caminho, vale o valor atual do contrato.'],
         ['Recebido (líquido)', 'O que entrou de fato, pelo valor que caiu no banco ou que foi baixado à mão. Com administradora, é o que ela repassou, já sem a taxa.'],
         ['Diferença', 'Recebido + taxa da administradora − a receber. Em aberto, aparece o valor inteiro como falta (negativo).'],
         ['Origem da baixa', 'Extrato: reconhecido no extrato importado. Administradora: veio no repasse da imobiliária. Manual: baixado à mão no app ou no robô.'],
         ['Despesas', 'Saídas do mês pela data de pagamento: lançadas no app ou no robô, importadas do extrato e a taxa das administradoras. "Extrato · a classificar" é saída do banco que ainda não foi classificada na Conciliação.'],
         ['Fora do resultado', 'Distribuição a sócios, retirada, compra de imóvel e repasses: saem do caixa, mas não são despesa dos imóveis.'],
         ['Por imóvel', 'Recebido bruto menos taxa, condomínio, IPTU, manutenção e outras despesas ligadas ao imóvel, no mês. Despesa sem imóvel ligado fica fora. Leitura de gestão; a apuração do imposto é do contador.'],
         ['Gráficos', 'Imagens geradas com os números desta planilha no momento da exportação.'],
         ['O que você pode editar', 'As colunas em amarelo: "Correção do recebido" e "Observação". Devolva a planilha à Raiz pelo WhatsApp: a Raiz confere e atualiza no sistema. No app, o mesmo se faz tocando na linha.'],
         ['Total', 'A linha Total soma só as linhas visíveis: ao filtrar uma coluna, o total acompanha o filtro.'],
         ['Origem', `Exportado do Raiz em ${quando}${quem ? ' por ' + quem : ''} (fn_relatorio_acompanhamento_mes v${d.versao_regras || 1}).`],
         ['Dados pessoais', 'Contém nomes e valores de locatários. Guarde em local seguro e não repasse a terceiros (LGPD).'],
        ].forEach(([a, b], k) => { wsb.getCell(3 + k, 1).value = a; wsb.getCell(3 + k, 1).font = F(9, true, CC.pine); const c = wsb.getCell(3 + k, 2); c.value = b; c.font = F(9); c.alignment = { wrapText: true, vertical: 'top' }; });

        const buf = await wb.xlsx.writeBuffer();
        const s = t => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
        const nome = `raiz_acompanhamento_mes_${s(empresa) || 'empresa'}${acomp.empNome ? '_' + s(acomp.empNome) : ''}_${acomp.comp.slice(0, 7).replace('-', '_')}.xlsx`;
        const url = URL.createObjectURL(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
        const a = document.createElement('a'); a.href = url; a.download = nome; document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 30000);
        rzToast('Planilha baixada');
    } catch (e) {
        console.error('[rz] planilha do acompanhamento', e);
        rzToast('Não foi possível gerar a planilha: ' + (e?.message || e), 'danger');
    }
}

// usados por testes e pelo protótipo
export const _interno = { montarFluxo, montarGerencial, montarRetiradas, montarExecutivo, compacto, comp, montarPlanilhaCadastro };
