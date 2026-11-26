// ============================================================================
// relatorios-executivos.js — Raiz Patrimônio · Relatórios no modelo executivo
// Versão: 1.19.0 · 26/11/2026
//
// v1.19.0 (26/11/2026, sessão 20261126-1215-investimentos-i4, demanda 885410f9; PLANO_EXECUCAO_I2_I3_I4_INVESTIMENTOS_RAIZ v1.2.0, I4, e
//   PROTOTIPO_INVESTIMENTOS_I2_I4_POSICAO_FGC v1.1.0; de acordo do Nicola 26/11 12:12, "relatórios ok") — Exposição ao FGC
//   (relatorios.investimentos_fgc, fn_fgc_exposicao, tipo fgc): por titular e banco (CNPJ raiz), o total coberto em % do limite de
//   R$ 250 mil, o excesso e até quando; os vencimentos de cada banco com a soma que sobra; total do titular contra o teto de R$ 1 milhão;
//   planilha com uma linha por aplicação. Situação de hoje, sem chip de período. Abre por abrirRelatorioExecutivo('fgc').
// v1.18.0 (25/11/2026, sessão 20261125-2330-rel-ficha-imovel, demanda bf8ab9a9; plano + protótipo v1.0.0, de acordo do Nicola 25/11 23:24) — Ficha financeira do imóvel
//   (relatorios.ficha_imovel, fn_relatorio_ficha_imovel): o ano por imóvel em tela (KPIs, abas Imóveis/Atrasos/Proprietários/Administradoras, detalhe com
//   cadastro, contrato vigente, mês a mês, despesas, atrasos e parte de cada proprietário) e planilha de 5 abas. Proprietários só com a parte no
//   resultado, sem volume de repasses (pedido do Nicola). Abre por abrirRelatorioExecutivo('ficha_imovel').
// v1.17.0 (18/11/2026, sessão 20261118-2125-cadastro-em-tela, demanda 6412873a; PLANO_CADASTRO_EM_TELA_CORRECOES_RAIZ v1.2.0, de acordo do Nicola 18/11 21:21 (Q1–Q3 sim)) — Cadastro da carteira: corrigir direto da linha. Tocar num imóvel abre:
//   Reajustar (a tela de reajuste), Corrigir o inquilino (o formulário do inquilino), Corrigir o contrato (a edição do contrato),
//   Dar baixa nos recebimentos (o Financeiro do contrato, com "‹ Voltar ao Cadastro"), Encerrar o contrato (e, encerrado, "Criar o
//   novo contrato neste imóvel"), Criar contrato neste imóvel (vago) e Anexar documento (ao contrato ou ao imóvel). Ao salvar ou
//   fechar, o relatório relê o banco. Os ids e o "N em aberto" vêm da fn_relatorio_cadastro_carteira (F1); sem id, acha pelo nome
//   como antes. Versão anterior: 1.16.0
//
// v1.16.0 (18/11/2026, sessão 20261118-0815-financeiro-relatorios, demanda 679b2700; FICHA_REVISAO_FINANCEIRO_RAIZ v1.0.0, Onda 4;
//   de acordo do Nicola 16/11 23:44 e Onda 4 liberada 18/11 08:14; protótipo PROTOTIPO_FINANCEIRO_REVISAO_RAIZ v1.4.0) — dois
//   relatórios novos, só fatos e dados (REL-56): "Balanço entre pessoas · analítico" (relatorios.balanco_analitico, Plus e acima):
//   capa com os números, saldo por pessoa e composição (Distribuição + Com a empresa + Entre pessoas = Saldo, fn_balanco_pessoas);
//   uma página por pessoa com o saldo anterior, os itens do mês e o saldo corrido (fn_balanco_extrato, a mesma do extrato da
//   pessoa); tocar numa linha de lançamento ou recebimento abre o mesmo ajuste da Onda 1 (pessoas-extrato.js 1.1.0). Mês ou
//   "Desde o início". "Ativos e contratos por pessoa" (relatorios.ativos_por_pessoa, todos os planos com Relatórios): capa com a
//   parte de cada um no valor e na receita; uma página por pessoa com ativo, vínculo, parte, contrato vigente, valor por mês e
//   parte por mês (fn_relatorio_ativos_por_pessoa, F4). Os dois com PDF e planilha (Compartilhar › Baixar a planilha).
//   Versão anterior: 1.15.0
//
// v1.15.0 (17/11/2026, sessão 20261117-2335-comercial-relatorios2, demanda 285a0058; FICHA_RECEITA_UNIDADES_GERADORAS v1.14.0 §13.15,
//   de acordo do Nicola 17/11 23:30) — os 5 relatórios restantes do Comercial, lidos de fn_relatorio_comercial v1.1.0: Margem por
//   item e safra (comercial.rel_margem), Funil de interessados (rel_funil), Recebíveis das vendas (rel_recebiveis, pelo vencimento),
//   Entregas (rel_entregas, pela entrega prevista) e Preços e tabelas (rel_precos, vigentes no fim do mês). Mesma casca, filtros,
//   PDF e planilha dos 4 primeiros. Versão anterior: 1.14.0
//
// v1.14.0 (17/11/2026, sessão 20261117-2250-comercial-relatorios, demanda 285a0058; FICHA_RECEITA_UNIDADES_GERADORAS v1.13.0 §13.14,
//   de acordo do Nicola 17/11 23:07 — Q9 sem quebra por tabela, Q10 ok) — os 4 primeiros relatórios do Raiz Comercial, no modelo
//   executivo e lidos só de fn_relatorio_comercial (CAN-01): Pedidos do mês (comercial.rel_pedidos), Itens mais vendidos
//   (comercial.rel_itens), Faturamento por cliente (comercial.rel_clientes) e Vendas por ponto de venda (comercial.rel_ativos).
//   Filtros: mês e ponto de venda (ativos com tabela de venda); mês em andamento sai com PRÉVIA. Compartilhar abre "Enviar o
//   resumo" e "Baixar a planilha" (baixarPlanilhaLista, REL-41/61). Versão anterior: 1.13.0
//
// v1.13.0 (16/11/2026, sessão 20261114-2342-investimentos-patrimonio, demanda fd3898f7; FICHA_RELATORIO_INVESTIMENTOS_PATRIMONIO
//   v1.0.0 e protótipo aprovados pelo Nicola 15/11) — relatório novo "Investimentos no patrimônio" (relatorios.investimentos, Premium),
//   tipo 'investimentos' do modelo executivo, lido só de fn_relatorio_investimentos_patrimonio (CAN-01): capa com a leitura, os 4
//   números (gerado, reinvestido, taxa, distribuído), cascata do caixa e reinvestido por mês; página 2 por ramo, por tipo, por bem
//   (custo investido × valor atual) e os maiores lançamentos. Ano e ramo nos filtros; PDF e Compartilhar como os outros.
// --------------------------------------------------------------------------
// Versões anteriores (v1.12.0 … v1.12.0): CHANGELOG_MODULOS.md, na raiz do repositório — o
// gerar_versoes.py rola pra lá automaticamente tudo além das 5 versões
// mais recentes deste cabeçalho (VER-06).
import { rzMostrarBloqueio } from './comum-licenca.js';
import { rzToast } from './raiz-ui.js';
import RaizDevice from './raiz-device.js';

export const VERSAO = '1.19.0';

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
      <div class="pf"><span><b>${esc(cfg.nome)}</b> · gerado em ${c.data} às ${c.hora} por ${esc(d.gerado_por || 'Raiz')}<br>Raiz Patrimônio · ${esc(d.relatorio)} v${d.versao || 1} · visão ${d.visao === 'caixa' ? 'caixa' : d.visao === 'situacao' ? 'situação na data' : 'competência'}</span><span>Página ${n} de ${total}</span></div>
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
.rzrel .page tr.aj{cursor:pointer}.rzrel .page tr.aj:hover td{background:rgba(63,129,99,.08)}
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

// ---------------------------------------------------------------------------
// Investimentos no patrimônio (v1.13.0, dem fd3898f7) — tudo vem pronto de fn_relatorio_investimentos_patrimonio
// ---------------------------------------------------------------------------
const TIPO_INV = { compra_bem: 'Compra de bem', benfeitoria: 'Melhoria e benfeitoria', aquisicao_imovel: 'Compra de imóvel e custos', financiamento_pago: 'Parcelas de financiamento' };
function montarInvestimentos(d) {
    const cab = d.cabecalho || {}, k = d.kpis || {}, c = d.cascata || {}, t = d.por_tipo || {}, lei = d.leitura || {};
    const ano = dataIso(cab.ate).getFullYear(), anoHoje = new Date().getFullYear();
    const per = ano === anoHoje ? `${ano} (jan a ${compCurto(cab.ate)})` : String(ano);
    const perCurto = ano === anoHoje ? `jan–${compCurto(cab.ate)} ${ano}` : String(ano);
    const cfg = { nome: 'Investimentos no patrimônio', medida: 'Investimentos no patrimônio em R$',
        subtitulo: [per, 'visão caixa', cab.ramo_nome || (cab.ramo ? 'ramo ' + cab.ramo : 'todos os ramos'), 'comparação com o mesmo período de ' + (ano - 1)].join(' · ') };
    const dl = (a, b, sobe = true) => { const v = variacao(a, b); return { t: v == null ? '' : seta(v) + pct(Math.abs(v)) + ' vs ' + (ano - 1), c: deltaClasse(v, sobe) }; };
    const dG = dl(k.gerado, k.gerado_anterior), dR = dl(k.reinvestido, k.reinvestido_anterior), dD = dl(k.distribuido, k.distribuido_anterior, false);
    const taxa = k.taxa_pct != null ? pct(k.taxa_pct) : '—';
    const taxaAnt = k.taxa_pct_anterior != null ? `${ano - 1}: ${pct(k.taxa_pct_anterior)}` : 'reinvestido ÷ gerado';
    const kpis = `<div class="kpis">${kpi('Gerado na operação', compacto(k.gerado), dG.t, dG.c)}${kpi('Reinvestido no patrimônio', compacto(k.reinvestido), dR.t, dR.c)}${kpi('Taxa de reinvestimento', taxa, taxaAnt)}${kpi('Distribuído aos donos', compacto(k.distribuido), dD.t, dD.c)}</div>`;
    const pontos = (lei.pontos || []).map(p => ({ a: p.titulo, b: p.prova }));
    const passos = [{ l: 'Gerado', v: num(c.gerado) / 1000, t: 'tot' }];
    const add = (l, v, t) => { if (num(v)) passos.push({ l: rotulo2(l), v: num(v) / 1000, t }); };
    add('Reinvestido', c.investido, 'down'); add('Venda de bem', c.venda_bem, 'up'); add('Financiamento recebido', c.financiamento_recebido, 'up');
    add('Amortização', c.amortizacao, 'down'); add('Distribuído', c.distribuido, 'down'); add('Outros financ.', c.outros_financiamento, 'down'); add('Pessoal', c.pessoal, 'down');
    passos.push({ l: rotulo2('Variação do caixa'), v: num(c.variacao_caixa) / 1000, t: 'tot' });
    const fonte = `Raiz · fn_relatorio_investimentos_patrimonio · ${perCurto}`;
    const mensal = (d.mensal || []).map(m => ({ l: compCurto(m.mes + '-01'), titulo: comp(m.mes + '-01'), v: num(m.atual) / 1000 }));
    const capa = `
      <div class="acao">${esc(lei.manchete || '')}</div>
      <div class="acao-sub"><i>Leitura</i>gerada a partir dos números deste relatório</div>
      ${kpis}
      ${pontos.length ? pontosHtml(pontos) : ''}
      <div class="g2">
        ${figura('Do que o patrimônio gerou ao caixa', 'R$ mil · visão caixa', svgPonte(passos, { aria: 'Cascata do caixa' }), fonte)}
        ${figura(`Reinvestido por mês em ${ano}`, 'R$ mil · data do pagamento', mensal.some(m => m.v) ? svgColunas(mensal, { aria: 'Reinvestido por mês' }) : '<p class="mut">Sem investimento no período.</p>', fonte)}
      </div>`;
    const ramos = (d.por_ramo || []).map(r => ({ l: r.nome, v: num(r.valor) }));
    const linTipo = Object.keys(TIPO_INV).map(x => `<tr><td>${esc(TIPO_INV[x])}</td><td class="n">${tab(t[x])}</td><td class="n hm">${t.anterior && t.anterior[x] != null ? tab(t.anterior[x]) : '—'}</td></tr>`).join('');
    const bens = d.por_bem || [];
    const linBem = bens.map(b => `<tr><td>${esc(b.nome)}${b.status === 'vendido' ? ' <span class="mut">(vendido)</span>' : ''}</td><td class="n">${tab(b.investido_periodo)}</td><td class="n">${tab(b.custo_investido)}</td><td class="n">${b.valor_atual != null ? tab(b.valor_atual) : '—'}</td><td class="n ${b.variacao_pct == null ? '' : num(b.variacao_pct) >= 0 ? 'pos' : 'neg'}">${b.variacao_pct != null ? pct(b.variacao_pct, true) : '—'}</td></tr>`).join('');
    const maiores = (d.maiores || []).map(m => `<tr><td>${dma(m.data)}</td><td>${esc(m.descricao || '—')}</td><td class="hm">${esc(m.ativo || '—')}</td><td class="n">${tab(m.valor)}</td></tr>`).join('');
    let n = 0;
    const p2 = `
      ${secao(`${++n}. Reinvestido por ramo`, `${perCurto} · R$`)}
      ${ramos.length ? barrasH(ramos, x => compacto(x.v), 150) : '<p class="mut">Sem investimento no período.</p>'}
      ${secao(`${++n}. Por tipo de investimento`, `${perCurto} · R$ · mesmo período de ${ano - 1} ao lado`)}
      <table><thead><tr><th>Tipo</th><th class="n">${ano}</th><th class="n hm">${ano - 1}</th></tr></thead><tbody>${linTipo}
        <tr class="tot"><td>Reinvestido</td><td class="n">${tab(t.reinvestido)}</td><td class="n hm">${tab(k.reinvestido_anterior)}</td></tr>
        <tr><td>Venda de bem (entrada)</td><td class="n">${tab(t.venda_bem)}</td><td class="n hm">—</td></tr>
        <tr class="tot"><td>Reinvestido líquido</td><td class="n">${tab(t.reinvestido_liquido)}</td><td class="n hm">—</td></tr></tbody></table>
      ${secao(`${++n}. Por bem`, 'R$ · custo investido = compra registrada + melhorias − vendas · valor atual = último valor de mercado')}
      <table><thead><tr><th>Bem</th><th class="n">No período</th><th class="n">Custo investido</th><th class="n">Valor atual</th><th class="n">Sobre o custo</th></tr></thead><tbody>${linBem || '<tr><td colspan="5" class="mut">Nenhum bem com investimento no período.</td></tr>'}</tbody></table>
      ${maiores ? secao(`${++n}. Maiores investimentos do período`, 'Data do pagamento · R$') + `<table><thead><tr><th>Data</th><th>Descrição</th><th class="hm">Bem</th><th class="n">Valor</th></tr></thead><tbody>${maiores}</tbody></table>` : ''}
      <div class="notes">
        <p><b>Visão caixa</b>: cada lançamento entra na data em que foi pago.</p>
        <p><b>Natureza</b>: a de cada lançamento, quando trocada no Financeiro, senão a da subcategoria. Operação gera; investimento é o que volta para o patrimônio (compra, melhoria, parcelas da compra e do financiamento); pessoal fica fora do gerado.</p>
        <p><b>Taxa de reinvestimento</b>: reinvestido ÷ gerado na operação (bruta). Vazia quando a operação não gerou caixa no período.</p>
        <p><b>Custo do bem</b>: a compra registrada no bem conta uma vez; as parcelas que pagam essa compra não somam de novo.</p>
        <p><b>Origem</b>: fn_relatorio_investimentos_patrimonio · dados até ${dma(cab.ate)}.</p>
      </div>`;
    return {
        cfg, linhas3: [`${cfg.nome} · ${per}`, `Reinvestido ${compacto(k.reinvestido)} · taxa ${taxa} · gerado ${compacto(k.gerado)}`, lei.manchete || ''],
        paginas: [[capa, ['Resumo', 'Evolução']], [p2, ['Composição', 'Detalhe', 'Notas']]]
    };
}
// ---------------------------------------------------------------------------
// Relatórios do Comercial (v1.14.0, dem 285a0058; FICHA_RECEITA_UNIDADES_GERADORAS v1.13.0 §13.14) — tudo vem pronto de
// fn_relatorio_comercial (CAN-01); aqui só a casca. Competência = data do pedido; totais só com pedidos confirmados.
// ---------------------------------------------------------------------------
const SIT_COM = { rascunho: 'Rascunho', confirmado: 'Confirmado', enviado: 'Enviado', entregue: 'Entregue', cancelado: 'Cancelado' };
const qtd = v => nf(v, Number.isInteger(num(v)) ? 0 : 2);
function cfgComercial(d, nome, medida) {
    const cab = d.cabecalho || {};
    const mes = comp(cab.de), atual = String(cab.de).slice(0, 7) === new Date().toISOString().slice(0, 7);
    return { nome, medida, previa: atual,
        subtitulo: [mes + (atual ? ' (mês em andamento)' : ''), 'visão competência (data do pedido)', cab.ativo_nome || 'todos os pontos de venda'].join(' · ') };
}
const notasComercial = (cab, extra = '') => `<div class="notes">
        <p><b>Competência</b>: cada pedido entra no mês da sua data. Os totais contam só pedidos confirmados (sem rascunho, amostra ou cancelado).</p>
        ${extra}
        <p><b>Origem</b>: fn_relatorio_comercial · ${comp(cab.de)}${cab.ativo_nome ? ' · ' + esc(cab.ativo_nome) : ''}.</p></div>`;
const vazioComercial = '<p class="mut">Nenhum pedido confirmado neste recorte.</p>';
function montarComPedidos(d) {
    const cab = d.cabecalho || {}, k = d.numeros || {};
    const cfg = cfgComercial(d, 'Pedidos do mês', 'Pedidos de venda em R$');
    const manchete = num(k.pedidos) ? `${qtd(k.pedidos)} ${num(k.pedidos) === 1 ? 'pedido confirmado' : 'pedidos confirmados'} em ${comp(cab.de)}, somando ${compacto(k.valor)}; ${compacto(k.a_receber)} ainda a receber.` : `Nenhum pedido confirmado em ${comp(cab.de)}.`;
    const capa = `<div class="acao">${esc(manchete)}</div>
      <div class="kpis">${kpi('Pedidos', qtd(k.pedidos), 'confirmados')}${kpi('Valor', compacto(k.valor), 'soma dos pedidos')}${kpi('Ticket médio', compacto(k.ticket), 'valor ÷ pedidos')}${kpi('A receber', compacto(k.a_receber), 'parcelas previstas')}</div>
      ${secao('1. Por situação', 'pedidos · R$')}
      <table><thead><tr><th>Situação</th><th class="n">Pedidos</th><th class="n">Valor</th></tr></thead><tbody>${(d.por_situacao || []).map(s => `<tr><td>${esc(SIT_COM[s.situacao] || s.situacao)}</td><td class="n">${qtd(s.pedidos)}</td><td class="n">${tab(s.valor)}</td></tr>`).join('')}</tbody></table>
      ${secao('2. Por ponto de venda', 'pedidos confirmados · R$')}
      ${(d.por_ativo || []).length ? barrasH((d.por_ativo || []).map(a => ({ l: a.ativo, v: num(a.valor), n: a.pedidos })), x => `${compacto(x.v)} · ${qtd(x.n)}`, 150) : vazioComercial}`;
    const lin = (d.linhas || []).map(p => `<tr><td>${dma(p.data)}</td><td>nº ${esc(p.numero)}</td><td>${esc(p.cliente)}</td><td class="hm">${esc(p.ativo)}</td><td>${esc(SIT_COM[p.situacao] || p.situacao)}</td><td class="n">${tab(p.valor)}</td><td class="n hm">${tab(p.a_receber)}</td></tr>`).join('');
    const p2 = `${secao('3. Os pedidos do mês', 'data do pedido · R$')}
      <table><thead><tr><th>Data</th><th>Pedido</th><th>Cliente</th><th class="hm">Ponto de venda</th><th>Situação</th><th class="n">Valor</th><th class="n hm">A receber</th></tr></thead><tbody>${lin || '<tr><td colspan="7" class="mut">Nenhum pedido no mês.</td></tr>'}</tbody></table>
      ${notasComercial(cab, '<p><b>A receber</b>: parcelas dos pedidos do mês que ainda estão previstas no Financeiro.</p>')}`;
    return { cfg, linhas3: [`Pedidos do mês · ${comp(cab.de)}`, `${qtd(k.pedidos)} pedidos · ${compacto(k.valor)} · a receber ${compacto(k.a_receber)}`, manchete],
        paginas: [[capa, ['Resumo', 'Composição']], [p2, ['Detalhe', 'Notas']]],
        planilha: { aba: 'Pedidos', colunas: [
            { cab: 'Data', larg: 12, fmt: 'data', ler: r => r.data }, { cab: 'Pedido', larg: 10, fmt: 'int', ler: r => num(r.numero) },
            { cab: 'Cliente', larg: 28, ler: r => r.cliente }, { cab: 'Ponto de venda', larg: 24, ler: r => r.ativo },
            { cab: 'Situação', larg: 13, ler: r => SIT_COM[r.situacao] || r.situacao },
            { cab: 'Valor (R$)', larg: 14, fmt: 'moeda', ler: r => num(r.valor), total: true }, { cab: 'A receber (R$)', larg: 14, fmt: 'moeda', ler: r => num(r.a_receber), total: true }],
            linhas: d.linhas || [], kpis: [{ rot: 'Pedidos', formula: f => `COUNTA(${f('Pedido')})`, fmt: 'int' }, { rot: 'Valor (R$)', formula: f => `SUM(${f('Valor (R$)')})` }, { rot: 'A receber (R$)', formula: f => `SUM(${f('A receber (R$)')})` }],
            sobre: [['Linha', 'Um pedido de venda do mês (rascunho, confirmado, enviado, entregue ou cancelado).'], ['Valor', 'Total do pedido com descontos.'], ['A receber', 'Parcelas do pedido ainda previstas no Financeiro.']] } };
}
function montarComItens(d) {
    const cab = d.cabecalho || {}, k = d.numeros || {}, ls = d.linhas || [];
    const cfg = cfgComercial(d, 'Itens mais vendidos', 'Itens vendidos em R$');
    const top = ls[0];
    const manchete = top ? `${top.item} liderou ${comp(cab.de)} com ${compacto(top.valor)} (${qtd(top.quantidade)} ${top.unidade || 'un'})${num(k.valor) ? ', ' + pct(num(top.valor) / num(k.valor) * 100) + ' do vendido' : ''}.` : `Nenhum item vendido em ${comp(cab.de)}.`;
    const capa = `<div class="acao">${esc(manchete)}</div>
      <div class="kpis">${kpi('Itens diferentes', qtd(k.itens), 'vendidos no mês')}${kpi('Quantidade', qtd(k.quantidade), 'soma das unidades')}${kpi('Valor', compacto(k.valor), 'com descontos')}${kpi('Margem', k.margem_pct != null ? pct(k.margem_pct) : '—', 'itens com custo')}</div>
      ${secao('1. Ranking por valor', 'R$ · os 10 primeiros')}
      ${ls.length ? barrasH(ls.slice(0, 10).map(i => ({ l: i.item, v: num(i.valor) })), x => compacto(x.v), 150) : vazioComercial}
      ${secao('2. Ranking por quantidade', 'unidade do item · os 10 primeiros')}
      ${ls.length ? barrasH([...ls].sort((a, b) => num(b.quantidade) - num(a.quantidade)).slice(0, 10).map(i => ({ l: i.item, v: num(i.quantidade), u: i.unidade })), x => `${qtd(x.v)} ${x.u || ''}`, 150) : ''}`;
    const lin = ls.map(i => `<tr><td>${esc(i.item)}${i.grupo ? ` <span class="mut">· ${esc(i.grupo)}</span>` : ''}</td><td class="n">${qtd(i.quantidade)} ${esc(i.unidade || '')}</td><td class="n hm">${qtd(i.pedidos)}</td><td class="n">${tab(i.valor)}</td><td class="n hm">${i.custo != null ? tab(i.custo) : '—'}</td><td class="n">${i.margem_pct != null ? pct(i.margem_pct) : '—'}</td></tr>`).join('');
    const p2 = `${secao('3. Todos os itens', 'R$ · margem = valor − custo registrado no pedido')}
      <table><thead><tr><th>Item</th><th class="n">Quantidade</th><th class="n hm">Pedidos</th><th class="n">Valor</th><th class="n hm">Custo</th><th class="n">Margem</th></tr></thead><tbody>${lin || '<tr><td colspan="6" class="mut">Nenhum item vendido.</td></tr>'}</tbody></table>
      ${notasComercial(cab, '<p><b>Margem</b>: valor vendido menos o custo do item registrado no pedido (o do sistema ou o informado). Item sem custo aparece com "—" e fica fora da margem total.</p>')}`;
    return { cfg, linhas3: [`Itens mais vendidos · ${comp(cab.de)}`, `${qtd(k.itens)} itens · ${compacto(k.valor)} · margem ${k.margem_pct != null ? pct(k.margem_pct) : '—'}`, manchete],
        paginas: [[capa, ['Resumo', 'Composição']], [p2, ['Detalhe', 'Notas']]],
        planilha: { aba: 'Itens', colunas: [
            { cab: 'Item', larg: 30, ler: r => r.item }, { cab: 'Grupo', larg: 18, ler: r => r.grupo || '' }, { cab: 'Unidade', larg: 9, ler: r => r.unidade || '' },
            { cab: 'Quantidade', larg: 12, fmt: 'moeda', ler: r => num(r.quantidade), total: true }, { cab: 'Pedidos', larg: 10, fmt: 'int', ler: r => num(r.pedidos) },
            { cab: 'Valor (R$)', larg: 14, fmt: 'moeda', ler: r => num(r.valor), total: true }, { cab: 'Custo (R$)', larg: 14, fmt: 'moeda', ler: r => r.custo == null ? null : num(r.custo), total: true },
            { cab: 'Margem (R$)', larg: 14, fmt: 'moeda', ler: r => r.margem == null ? null : num(r.margem), total: true }],
            linhas: ls, kpis: [{ rot: 'Itens', formula: f => `COUNTA(${f('Item')})`, fmt: 'int' }, { rot: 'Valor (R$)', formula: f => `SUM(${f('Valor (R$)')})` }, { rot: 'Margem (R$)', formula: f => `SUM(${f('Margem (R$)')})` }],
            sobre: [['Linha', 'Um item vendido no mês (do catálogo ou fora dele), somando os pedidos confirmados.'], ['Margem', 'Valor menos o custo registrado no pedido; vazia quando o item não tem custo.']] } };
}
function montarComClientes(d) {
    const cab = d.cabecalho || {}, k = d.numeros || {}, ls = d.linhas || [];
    const cfg = cfgComercial(d, 'Faturamento por cliente', 'Faturamento por cliente em R$');
    const top = ls[0];
    const manchete = top ? `${top.cliente} foi o maior cliente de ${comp(cab.de)}: ${compacto(top.valor)} em ${qtd(top.pedidos)} ${num(top.pedidos) === 1 ? 'pedido' : 'pedidos'}.` : `Nenhum cliente com pedido confirmado em ${comp(cab.de)}.`;
    const capa = `<div class="acao">${esc(manchete)}</div>
      <div class="kpis">${kpi('Clientes', qtd(k.clientes), 'com pedido no mês')}${kpi('Valor', compacto(k.valor), 'soma dos pedidos')}${kpi('Ticket médio', compacto(k.ticket), 'valor ÷ pedidos')}${kpi('Recorrentes', qtd(k.recorrentes), 'mais de um pedido até hoje')}</div>
      ${secao('1. Quem mais comprou', 'R$ · os 10 primeiros')}
      ${ls.length ? barrasH(ls.slice(0, 10).map(c => ({ l: c.cliente, v: num(c.valor) })), x => compacto(x.v), 150) : vazioComercial}`;
    const lin = ls.map(c => `<tr><td>${esc(c.cliente)}</td><td class="n">${qtd(c.pedidos)}</td><td class="n">${tab(c.valor)}</td><td class="n hm">${tab(c.ticket)}</td><td class="n hm">${qtd(c.pedidos_total)}</td><td>${c.ultimo_pedido ? dma(c.ultimo_pedido) : '—'}</td><td class="n">${tab(c.a_receber)}</td></tr>`).join('');
    const p2 = `${secao('2. Todos os clientes', 'R$ · pedidos confirmados')}
      <table><thead><tr><th>Cliente</th><th class="n">Pedidos</th><th class="n">Valor</th><th class="n hm">Ticket</th><th class="n hm">Pedidos até hoje</th><th>Último pedido</th><th class="n">A receber</th></tr></thead><tbody>${lin || '<tr><td colspan="7" class="mut">Nenhum cliente.</td></tr>'}</tbody></table>
      ${notasComercial(cab, '<p><b>Recorrente</b>: cliente com mais de um pedido confirmado até o fim do mês. <b>Último pedido</b>: o mais recente até o fim do mês, em qualquer ponto de venda.</p>')}`;
    return { cfg, linhas3: [`Faturamento por cliente · ${comp(cab.de)}`, `${qtd(k.clientes)} clientes · ${compacto(k.valor)} · ${qtd(k.recorrentes)} recorrentes`, manchete],
        paginas: [[capa, ['Resumo', 'Composição']], [p2, ['Detalhe', 'Notas']]],
        planilha: { aba: 'Clientes', colunas: [
            { cab: 'Cliente', larg: 30, ler: r => r.cliente }, { cab: 'Pedidos', larg: 10, fmt: 'int', ler: r => num(r.pedidos), total: true },
            { cab: 'Valor (R$)', larg: 14, fmt: 'moeda', ler: r => num(r.valor), total: true }, { cab: 'Ticket (R$)', larg: 14, fmt: 'moeda', ler: r => num(r.ticket) },
            { cab: 'Pedidos até hoje', larg: 12, fmt: 'int', ler: r => num(r.pedidos_total) }, { cab: 'Último pedido', larg: 13, fmt: 'data', ler: r => r.ultimo_pedido },
            { cab: 'A receber (R$)', larg: 14, fmt: 'moeda', ler: r => num(r.a_receber), total: true }],
            linhas: ls, kpis: [{ rot: 'Clientes', formula: f => `COUNTA(${f('Cliente')})`, fmt: 'int' }, { rot: 'Valor (R$)', formula: f => `SUM(${f('Valor (R$)')})` }, { rot: 'A receber (R$)', formula: f => `SUM(${f('A receber (R$)')})` }],
            sobre: [['Linha', 'Um cliente com pedido confirmado no mês.'], ['Recorrente', 'Mais de um pedido confirmado até o fim do mês.']] } };
}
function montarComAtivos(d) {
    const cab = d.cabecalho || {}, k = d.numeros || {}, ls = d.linhas || [];
    const cfg = cfgComercial(d, 'Vendas por ponto de venda', 'Vendas por ativo em R$');
    const top = ls[0];
    const manchete = top ? `${top.ativo} vendeu mais em ${comp(cab.de)}: ${compacto(top.valor)}${top.participacao_pct != null ? ', ' + pct(top.participacao_pct) + ' do total' : ''}.` : `Nenhuma venda confirmada em ${comp(cab.de)}.`;
    const capa = `<div class="acao">${esc(manchete)}</div>
      <div class="kpis">${kpi('Pontos de venda', qtd(k.pontos), 'com venda no mês')}${kpi('Valor', compacto(k.valor), 'soma dos pedidos')}${kpi('Pedidos', qtd(k.pedidos), 'confirmados')}${kpi('Item líder', k.item_lider || '—', 'maior valor vendido')}</div>
      ${secao('1. Valor por ponto de venda', 'R$ · participação no total')}
      ${ls.length ? barrasH(ls.map(a => ({ l: a.ativo, v: num(a.valor), p: a.participacao_pct })), x => `${compacto(x.v)}${x.p != null ? ' · ' + pct(x.p) : ''}`, 150) : vazioComercial}`;
    const lin = ls.map(a => `<tr><td>${esc(a.ativo)}</td><td class="n">${qtd(a.pedidos)}</td><td class="n">${tab(a.valor)}</td><td class="n hm">${tab(a.ticket)}</td><td>${(a.itens || []).map(i => esc(i.item)).join(', ') || '—'}</td></tr>`).join('');
    const p2 = `${secao('2. O que cada ponto vende', 'R$ · 3 itens de maior valor')}
      <table><thead><tr><th>Ponto de venda</th><th class="n">Pedidos</th><th class="n">Valor</th><th class="n hm">Ticket</th><th>Itens principais</th></tr></thead><tbody>${lin || '<tr><td colspan="5" class="mut">Nenhuma venda.</td></tr>'}</tbody></table>
      ${notasComercial(cab, '<p><b>Ponto de venda</b>: o ativo do pedido (fazenda, loja, feira…). Pedido sem ativo aparece como "Sem ativo".</p>')}`;
    return { cfg, linhas3: [`Vendas por ponto de venda · ${comp(cab.de)}`, `${qtd(k.pontos)} pontos · ${compacto(k.valor)} · ${qtd(k.pedidos)} pedidos`, manchete],
        paginas: [[capa, ['Resumo', 'Composição']], [p2, ['Detalhe', 'Notas']]],
        planilha: { aba: 'Pontos de venda', colunas: [
            { cab: 'Ponto de venda', larg: 30, ler: r => r.ativo }, { cab: 'Pedidos', larg: 10, fmt: 'int', ler: r => num(r.pedidos), total: true },
            { cab: 'Valor (R$)', larg: 14, fmt: 'moeda', ler: r => num(r.valor), total: true }, { cab: 'Ticket (R$)', larg: 14, fmt: 'moeda', ler: r => num(r.ticket) },
            { cab: 'Itens principais', larg: 40, ler: r => (r.itens || []).map(i => i.item).join(', ') }],
            linhas: ls, kpis: [{ rot: 'Pontos de venda', formula: f => `COUNTA(${f('Ponto de venda')})`, fmt: 'int' }, { rot: 'Valor (R$)', formula: f => `SUM(${f('Valor (R$)')})` }, { rot: 'Pedidos', formula: f => `SUM(${f('Pedidos')})`, fmt: 'int' }],
            sobre: [['Linha', 'Um ativo (ponto de venda) com pedido confirmado no mês.']] } };
}
// v1.15.0 — os 5 restantes (FICHA v1.14.0 §13.15): margem, funil, recebíveis, entregas, preços e tabelas
function cfgComercial2(d, nome, medida, visao) {
    const c = cfgComercial(d, nome, medida);
    c.subtitulo = c.subtitulo.replace('visão competência (data do pedido)', visao);
    return c;
}
const pctOu = v => (v != null ? pct(v) : '—');
function montarComMargem(d) {
    const cab = d.cabecalho || {}, k = d.numeros || {}, ls = d.linhas || [], sf = d.safras || [];
    const cfg = cfgComercial(d, 'Margem por item e por safra', 'Margem das vendas em R$');
    const manchete = num(k.vendido) ? `Em ${comp(cab.de)}, a margem foi de ${compacto(k.margem)} (${pctOu(k.margem_pct)}) sobre ${compacto(k.vendido)} vendidos, já descontado o frete pago.` : `Nenhum item vendido em ${comp(cab.de)}.`;
    const capa = `<div class="acao">${esc(manchete)}</div>
      <div class="kpis">${kpi('Vendido', compacto(k.vendido), 'itens dos pedidos')}${kpi('Custo', compacto(k.custo), 'registrado nos itens')}${kpi('Frete pago', compacto(k.frete_pago), `cobrado ${compacto(k.frete_cobrado)}`)}${kpi('Margem', pctOu(k.margem_pct), compacto(k.margem))}</div>
      ${secao('1. Margem por item', 'R$ · valor − custo registrado no pedido')}
      ${ls.length ? barrasH(ls.slice(0, 10).map(i => ({ l: i.item, v: num(i.margem ?? 0), p: i.margem_pct })), x => `${compacto(x.v)} · ${pctOu(x.p)}`, 150) : vazioComercial}`;
    const linI = ls.map(i => `<tr><td>${esc(i.item)}</td><td class="n">${qtd(i.quantidade)} ${esc(i.unidade || '')}</td><td class="n">${tab(i.valor)}</td><td class="n hm">${i.custo != null ? tab(i.custo) : '—'}</td><td class="n hm">${i.margem != null ? tab(i.margem) : '—'}</td><td class="n">${pctOu(i.margem_pct)}</td></tr>`).join('');
    const linS = sf.map(s => `<tr><td>${esc(s.safra)}</td><td class="hm">${esc(s.ativo)}</td><td class="n">${tab(s.vendido)}</td><td class="n hm">${tab(s.custo)}</td><td class="n hm">${tab(s.frete)}</td><td class="n">${tab(s.resultado)}</td><td class="n">${pctOu(s.margem_pct)}</td></tr>`).join('');
    const p2 = `${secao('2. Todos os itens', 'R$')}
      <table><thead><tr><th>Item</th><th class="n">Quantidade</th><th class="n">Vendido</th><th class="n hm">Custo</th><th class="n hm">Margem</th><th class="n">%</th></tr></thead><tbody>${linI || '<tr><td colspan="6" class="mut">Nenhum item vendido.</td></tr>'}</tbody></table>
      ${secao('3. Por safra', 'R$ · a safra inteira (todas as vendas e despesas do ciclo)')}
      <table><thead><tr><th>Safra</th><th class="hm">Ativo</th><th class="n">Vendido</th><th class="n hm">Custo do ciclo</th><th class="n hm">Frete</th><th class="n">Resultado</th><th class="n">%</th></tr></thead><tbody>${linS || '<tr><td colspan="7" class="mut">Nenhum pedido do mês está ligado a uma safra.</td></tr>'}</tbody></table>
      ${notasComercial(cab, '<p><b>Margem do item</b>: vendido menos o custo registrado no pedido; item sem custo fica fora da margem %. <b>Margem do mês</b>: desconta também o frete pago. <b>Safra</b>: tudo o que o ciclo vendeu menos todas as despesas lançadas no ciclo e o frete; a divisão do custo do ciclo por item vem com o fechamento por item.</p>')}`;
    return { cfg, linhas3: [`Margem por item e safra · ${comp(cab.de)}`, `Vendido ${compacto(k.vendido)} · margem ${compacto(k.margem)} (${pctOu(k.margem_pct)})`, manchete],
        paginas: [[capa, ['Resumo', 'Composição']], [p2, ['Detalhe', 'Notas']]],
        planilha: { aba: 'Margem', colunas: [
            { cab: 'Item', larg: 30, ler: r => r.item }, { cab: 'Unidade', larg: 9, ler: r => r.unidade || '' }, { cab: 'Quantidade', larg: 12, fmt: 'moeda', ler: r => num(r.quantidade), total: true },
            { cab: 'Vendido (R$)', larg: 14, fmt: 'moeda', ler: r => num(r.valor), total: true }, { cab: 'Custo (R$)', larg: 14, fmt: 'moeda', ler: r => r.custo == null ? null : num(r.custo), total: true },
            { cab: 'Margem (R$)', larg: 14, fmt: 'moeda', ler: r => r.margem == null ? null : num(r.margem), total: true }],
            linhas: ls, kpis: [{ rot: 'Vendido (R$)', formula: f => `SUM(${f('Vendido (R$)')})` }, { rot: 'Custo (R$)', formula: f => `SUM(${f('Custo (R$)')})` }, { rot: 'Margem (R$)', formula: f => `SUM(${f('Margem (R$)')})` }],
            sobre: [['Linha', 'Um item vendido no mês, somando os pedidos confirmados.'], ['Margem', 'Vendido menos o custo registrado no pedido (sem o frete).']] } };
}
function montarComFunil(d) {
    const cab = d.cabecalho || {}, k = d.numeros || {}, ls = d.linhas || [], et = d.por_etapa || [], mo = d.motivos || [];
    const cfg = cfgComercial2(d, 'Funil de interessados', 'Interessados de venda', 'passagens de etapa no mês');
    const manchete = (num(k.pedidos) + num(k.cancelados)) ? `${qtd(k.pedidos)} ${num(k.pedidos) === 1 ? 'interessado virou pedido' : 'interessados viraram pedido'} em ${comp(cab.de)}; conversão de ${pctOu(k.conversao_pct)}.` : `${qtd(k.novos)} ${num(k.novos) === 1 ? 'interessado novo' : 'interessados novos'} em ${comp(cab.de)}; nenhum fechou ainda.`;
    const capa = `<div class="acao">${esc(manchete)}</div>
      <div class="kpis">${kpi('Novos', qtd(k.novos), 'entraram no mês')}${kpi('Viraram pedido', qtd(k.pedidos), 'no mês')}${kpi('Cancelados', qtd(k.cancelados), 'no mês')}${kpi('Conversão', pctOu(k.conversao_pct), 'pedido ÷ (pedido + cancelado)')}</div>
      ${secao('1. Por etapa', 'interessados hoje · passagens no mês')}
      <table><thead><tr><th>Etapa</th><th class="n">Hoje</th><th class="n">Entraram no mês</th></tr></thead><tbody>${et.map(e => `<tr><td>${esc(e.etapa)}</td><td class="n">${qtd(e.agora)}</td><td class="n">${qtd(e.no_mes)}</td></tr>`).join('')}</tbody></table>
      ${secao('2. Motivos de cancelamento', 'no mês')}
      ${mo.length ? barrasH(mo.map(m => ({ l: m.motivo, v: num(m.n) })), x => qtd(x.v), 150) : '<p class="mut">Nenhum cancelamento com motivo no mês.</p>'}`;
    const lin = ls.map(i => `<tr><td>${esc(i.nome)}</td><td class="hm">${esc(i.ativo)}</td><td>${esc(i.etapa || '—')}</td><td>${i.desde ? dma(i.desde) : '—'}</td><td class="hm">${esc(i.proximo_passo || '')}${i.proximo_passo_em ? ' · ' + dma(i.proximo_passo_em) : ''}</td></tr>`).join('');
    const p2 = `${secao('3. Interessados', 'etapa atual')}
      <table><thead><tr><th>Interessado</th><th class="hm">Ponto de venda</th><th>Etapa</th><th>Desde</th><th class="hm">Próximo passo</th></tr></thead><tbody>${lin || '<tr><td colspan="5" class="mut">Nenhum interessado.</td></tr>'}</tbody></table>
      ${notasComercial(cab, '<p><b>Conversão</b>: dos que fecharam no mês (pedido ou cancelado), quantos viraram pedido. <b>Motivos</b>: só os registrados a partir de 17/11/2026; antes disso o interessado entra pela etapa atual.</p>')}`;
    return { cfg, linhas3: [`Funil de interessados · ${comp(cab.de)}`, `${qtd(k.novos)} novos · ${qtd(k.pedidos)} pedidos · conversão ${pctOu(k.conversao_pct)}`, manchete],
        paginas: [[capa, ['Resumo', 'Composição']], [p2, ['Detalhe', 'Notas']]],
        planilha: { aba: 'Interessados', colunas: [
            { cab: 'Interessado', larg: 30, ler: r => r.nome }, { cab: 'Ponto de venda', larg: 24, ler: r => r.ativo }, { cab: 'Etapa', larg: 14, ler: r => r.etapa || '' },
            { cab: 'Desde', larg: 12, fmt: 'data', ler: r => r.desde ? String(r.desde).slice(0, 10) : null }, { cab: 'Entrou', larg: 12, fmt: 'data', ler: r => r.entrou ? String(r.entrou).slice(0, 10) : null },
            { cab: 'Próximo passo', larg: 30, ler: r => r.proximo_passo || '' }],
            linhas: ls, kpis: [{ rot: 'Interessados', formula: f => `COUNTA(${f('Interessado')})`, fmt: 'int' }, { rot: 'Em pedido', formula: f => `COUNTIF(${f('Etapa')},"Pedido")`, fmt: 'int' }],
            sobre: [['Linha', 'Um interessado da esteira Venda, na etapa em que está hoje.']] } };
}
const SIT_REC = { a_vencer: 'A vencer', vencido: 'Vencido', recebido: 'Recebido' };
function montarComRecebiveis(d) {
    const cab = d.cabecalho || {}, k = d.numeros || {}, ls = d.linhas || [], pc = d.por_cliente || [];
    const cfg = cfgComercial2(d, 'Recebíveis das vendas', 'Recebíveis das vendas em R$', 'pelo vencimento da parcela');
    const manchete = num(k.vencido) ? `${compacto(k.vencido)} vencidos com ${qtd(k.clientes_atraso)} ${num(k.clientes_atraso) === 1 ? 'cliente' : 'clientes'}; ${compacto(k.a_receber)} vencem em ${comp(cab.de)}.` : `Nada vencido; ${compacto(k.a_receber)} vencem em ${comp(cab.de)} e ${compacto(k.recebido)} já entraram.`;
    const capa = `<div class="acao">${esc(manchete)}</div>
      <div class="kpis">${kpi('A receber no mês', compacto(k.a_receber), 'vencem no mês')}${kpi('Vencido', compacto(k.vencido), 'até hoje', num(k.vencido) ? 'neg' : 'mut')}${kpi('Recebido', compacto(k.recebido), 'pago no mês')}${kpi('Clientes em atraso', qtd(k.clientes_atraso), 'com parcela vencida')}</div>
      ${secao('1. Por cliente', 'R$ · vencido primeiro')}
      <table><thead><tr><th>Cliente</th><th class="n">A receber</th><th class="n">Vencido</th><th class="n">Recebido</th></tr></thead><tbody>${pc.map(c => `<tr><td>${esc(c.cliente)}</td><td class="n">${tab(c.a_receber)}</td><td class="n ${num(c.vencido) ? 'neg' : ''}">${tab(c.vencido)}</td><td class="n">${tab(c.recebido)}</td></tr>`).join('') || '<tr><td colspan="4" class="mut">Nenhuma parcela neste recorte.</td></tr>'}</tbody></table>`;
    const lin = ls.map(r => `<tr><td>${dma(r.vencimento)}</td><td>${esc(r.cliente)}</td><td>nº ${esc(r.pedido)}${num(r.parcelas) > 1 ? ` · ${esc(r.parcela)}/${esc(r.parcelas)}` : ''}</td><td class="hm">${esc(r.ativo)}</td><td class="${r.situacao === 'vencido' ? 'neg' : ''}">${esc(SIT_REC[r.situacao] || r.situacao)}${r.dias_atraso ? ` · ${r.dias_atraso} d` : ''}</td><td class="n">${tab(r.valor)}</td></tr>`).join('');
    const p2 = `${secao('2. Parcelas', 'vencimento · R$')}
      <table><thead><tr><th>Vencimento</th><th>Cliente</th><th>Pedido</th><th class="hm">Ponto de venda</th><th>Situação</th><th class="n">Valor</th></tr></thead><tbody>${lin || '<tr><td colspan="6" class="mut">Nenhuma parcela.</td></tr>'}</tbody></table>
      <div class="notes"><p><b>Período</b>: pelo vencimento — as parcelas que vencem no mês, as vencidas até hoje (de qualquer mês) e as recebidas no mês.</p>
        <p><b>Origem</b>: fn_relatorio_comercial · parcelas dos pedidos no Financeiro · ${comp(cab.de)}${cab.ativo_nome ? ' · ' + esc(cab.ativo_nome) : ''}.</p></div>`;
    return { cfg, linhas3: [`Recebíveis das vendas · ${comp(cab.de)}`, `A receber ${compacto(k.a_receber)} · vencido ${compacto(k.vencido)} · recebido ${compacto(k.recebido)}`, manchete],
        paginas: [[capa, ['Resumo', 'Composição']], [p2, ['Detalhe', 'Notas']]],
        planilha: { aba: 'Parcelas', colunas: [
            { cab: 'Vencimento', larg: 12, fmt: 'data', ler: r => r.vencimento }, { cab: 'Cliente', larg: 28, ler: r => r.cliente }, { cab: 'Pedido', larg: 10, fmt: 'int', ler: r => num(r.pedido) },
            { cab: 'Parcela', larg: 9, ler: r => `${r.parcela || 1}/${r.parcelas || 1}` }, { cab: 'Ponto de venda', larg: 24, ler: r => r.ativo },
            { cab: 'Situação', larg: 12, ler: r => SIT_REC[r.situacao] || r.situacao, alerta: v => v === 'Vencido' }, { cab: 'Dias de atraso', larg: 10, fmt: 'int', ler: r => r.dias_atraso ?? null },
            { cab: 'Valor (R$)', larg: 14, fmt: 'moeda', ler: r => num(r.valor), total: true }],
            linhas: ls, kpis: [{ rot: 'Parcelas', formula: f => `COUNTA(${f('Cliente')})`, fmt: 'int' }, { rot: 'Vencido (R$)', formula: f => `SUMIF(${f('Situação')},"Vencido",${f('Valor (R$)')})` }, { rot: 'Total (R$)', formula: f => `SUM(${f('Valor (R$)')})` }],
            sobre: [['Linha', 'Uma parcela de pedido: vence no mês, está vencida até hoje ou foi recebida no mês.']] } };
}
const SIT_ENT = { pendente: 'Prevista', enviada: 'Enviada', entregue: 'Entregue' };
const TIPO_ENT = { retirada: 'Retirada', propria: 'Entrega própria', transportadora: 'Transportadora' };
function montarComEntregas(d) {
    const cab = d.cabecalho || {}, k = d.numeros || {}, ls = d.linhas || [];
    const cfg = cfgComercial2(d, 'Entregas', 'Entregas e frete em R$', 'pela entrega prevista');
    const tot = num(k.previstas) + num(k.enviadas) + num(k.entregues);
    const manchete = tot ? `${qtd(k.entregues)} de ${qtd(tot)} ${tot === 1 ? 'entrega concluída' : 'entregas concluídas'} em ${comp(cab.de)}${num(k.atrasadas) ? `; ${qtd(k.atrasadas)} atrasada${num(k.atrasadas) > 1 ? 's' : ''}` : ''}. Frete pago ${compacto(k.frete_pago)} × cobrado ${compacto(k.frete_cobrado)}.` : `Nenhuma entrega prevista em ${comp(cab.de)}.`;
    const capa = `<div class="acao">${esc(manchete)}</div>
      <div class="kpis">${kpi('Previstas', qtd(k.previstas), num(k.atrasadas) ? `${qtd(k.atrasadas)} atrasada(s)` : 'a enviar', num(k.atrasadas) ? 'neg' : 'mut')}${kpi('Enviadas', qtd(k.enviadas), 'a caminho')}${kpi('Entregues', qtd(k.entregues), 'no mês')}${kpi('Frete pago', compacto(k.frete_pago), `cobrado ${compacto(k.frete_cobrado)}`, num(k.frete_pago) > num(k.frete_cobrado) ? 'neg' : 'pos')}</div>`;
    const lin = ls.map(e => `<tr><td>${e.prevista ? dma(e.prevista) : '—'}</td><td>nº ${esc(e.pedido)}${e.tipo === 'amostra' ? ' (amostra)' : ''}</td><td>${esc(e.cliente)}</td><td class="hm">${esc(TIPO_ENT[e.entrega_tipo] || '—')}${e.transportadora ? ' · ' + esc(e.transportadora) : ''}</td><td class="${e.atrasada ? 'neg' : ''}">${esc(SIT_ENT[e.situacao] || e.situacao)}${e.atrasada ? ' · atrasada' : ''}</td><td class="n hm">${tab(e.cobrado)}</td><td class="n">${tab(e.pago)}</td></tr>`).join('');
    const p1 = capa + `${secao('1. As entregas do mês', 'entrega prevista · R$')}
      <table><thead><tr><th>Prevista</th><th>Pedido</th><th>Cliente</th><th class="hm">Como</th><th>Situação</th><th class="n hm">Cobrado</th><th class="n">Pago</th></tr></thead><tbody>${lin || '<tr><td colspan="7" class="mut">Nenhuma entrega.</td></tr>'}</tbody></table>
      <div class="notes"><p><b>Período</b>: pela entrega prevista; pedido sem previsão entra pela data do pedido. <b>Atrasada</b>: não entregue e com previsão antes de hoje.</p>
        <p><b>Origem</b>: fn_relatorio_comercial · pedidos confirmados (vendas e amostras) · ${comp(cab.de)}${cab.ativo_nome ? ' · ' + esc(cab.ativo_nome) : ''}.</p></div>`;
    return { cfg, linhas3: [`Entregas · ${comp(cab.de)}`, `${qtd(k.entregues)} entregues · ${qtd(k.previstas)} previstas · frete ${compacto(k.frete_pago)}`, manchete],
        paginas: [[p1, ['Resumo', 'Detalhe', 'Notas']]],
        planilha: { aba: 'Entregas', colunas: [
            { cab: 'Prevista', larg: 12, fmt: 'data', ler: r => r.prevista }, { cab: 'Pedido', larg: 10, fmt: 'int', ler: r => num(r.pedido) }, { cab: 'Cliente', larg: 28, ler: r => r.cliente },
            { cab: 'Como', larg: 16, ler: r => TIPO_ENT[r.entrega_tipo] || '' }, { cab: 'Transportadora', larg: 22, ler: r => r.transportadora || '' },
            { cab: 'Situação', larg: 12, ler: r => SIT_ENT[r.situacao] || r.situacao }, { cab: 'Atrasada', larg: 9, ler: r => r.atrasada ? 'sim' : '', alerta: v => v === 'sim' },
            { cab: 'Frete cobrado (R$)', larg: 14, fmt: 'moeda', ler: r => num(r.cobrado), total: true }, { cab: 'Frete pago (R$)', larg: 14, fmt: 'moeda', ler: r => num(r.pago), total: true }],
            linhas: ls, kpis: [{ rot: 'Entregas', formula: f => `COUNTA(${f('Cliente')})`, fmt: 'int' }, { rot: 'Frete cobrado (R$)', formula: f => `SUM(${f('Frete cobrado (R$)')})` }, { rot: 'Frete pago (R$)', formula: f => `SUM(${f('Frete pago (R$)')})` }],
            sobre: [['Linha', 'Um pedido confirmado com entrega prevista no mês.']] } };
}
function montarComPrecos(d) {
    const cab = d.cabecalho || {}, k = d.numeros || {}, ls = d.linhas || [], mu = d.mudancas || [], tb = d.por_tabela || [], sp = d.sem_preco || [];
    const cfg = cfgComercial2(d, 'Preços e tabelas', 'Preços de venda em R$', 'preços vigentes no fim do mês');
    const manchete = `${qtd(k.tabelas)} ${num(k.tabelas) === 1 ? 'tabela ativa' : 'tabelas ativas'} com ${qtd(k.itens_com_preco)} ${num(k.itens_com_preco) === 1 ? 'item' : 'itens'}; ${qtd(k.mudancas)} ${num(k.mudancas) === 1 ? 'preço mudou' : 'preços mudaram'} em ${comp(cab.de)}${num(k.itens_sem_preco) ? ` e ${qtd(k.itens_sem_preco)} sem preço` : ''}.`;
    const capa = `<div class="acao">${esc(manchete)}</div>
      <div class="kpis">${kpi('Tabelas ativas', qtd(k.tabelas), '')}${kpi('Itens com preço', qtd(k.itens_com_preco), 'vigente')}${kpi('Mudanças', qtd(k.mudancas), 'começaram no mês')}${kpi('Itens sem preço', qtd(k.itens_sem_preco), 'em nenhuma tabela', num(k.itens_sem_preco) ? 'neg' : 'mut')}</div>
      ${secao('1. Tabelas', 'itens com preço · onde vale')}
      <table><thead><tr><th>Tabela</th><th class="n">Itens</th><th>Vale em</th></tr></thead><tbody>${tb.map(t => `<tr><td>${esc(t.tabela)}</td><td class="n">${qtd(t.itens)}</td><td>${esc((t.ativos || []).join(', ') || 'Sem ativo')}</td></tr>`).join('') || '<tr><td colspan="3" class="mut">Nenhuma tabela ativa.</td></tr>'}</tbody></table>
      ${secao('2. Mudanças no mês', 'R$ · preço novo × anterior')}
      <table><thead><tr><th>Desde</th><th>Item</th><th class="hm">Tabela</th><th class="n">Novo</th><th class="n hm">Anterior</th><th class="n">Δ</th></tr></thead><tbody>${mu.map(m => `<tr><td>${dma(m.desde)}</td><td>${esc(m.item)}${m.comprador ? ` <span class="mut">· ${esc(m.comprador)}</span>` : ''}</td><td class="hm">${esc(m.tabela)}</td><td class="n">${tab(m.preco)}</td><td class="n hm">${m.anterior != null ? tab(m.anterior) : '—'}</td><td class="n">${m.variacao_pct != null ? pct(m.variacao_pct, true) : 'novo'}</td></tr>`).join('') || '<tr><td colspan="6" class="mut">Nenhuma mudança no mês.</td></tr>'}</tbody></table>`;
    const lin = ls.map(p => `<tr><td>${esc(p.tabela)}</td><td>${esc(p.item)}</td><td class="hm">${esc(p.comprador || 'todos')}${num(p.quantidade_min) > 0 ? ` · a partir de ${qtd(p.quantidade_min)}` : ''}</td><td class="n">${tab(p.preco)}</td><td>${esc(p.unidade || '')}</td><td>${p.desde ? dma(p.desde) : '—'}</td></tr>`).join('');
    const p2 = `${secao('3. Preços vigentes', 'R$ por unidade')}
      <table><thead><tr><th>Tabela</th><th>Item</th><th class="hm">Para</th><th class="n">Preço</th><th>Unidade</th><th>Desde</th></tr></thead><tbody>${lin || '<tr><td colspan="6" class="mut">Nenhum preço vigente.</td></tr>'}</tbody></table>
      ${sp.length ? secao('4. Itens sem preço', 'ativos no catálogo e sem preço vigente em nenhuma tabela') + `<p>${sp.map(s => esc(s.item)).join(' · ')}</p>` : ''}
      <div class="notes"><p><b>Vigente</b>: preço que vale no último dia do mês. <b>Mudança</b>: preço que começou a valer no mês; "novo" quando não havia preço anterior para o mesmo item, cliente e quantidade na tabela.</p>
        <p><b>Origem</b>: fn_relatorio_comercial · tabelas e preços do catálogo · ${comp(cab.de)}${cab.ativo_nome ? ' · ' + esc(cab.ativo_nome) : ''}.</p></div>`;
    return { cfg, linhas3: [`Preços e tabelas · ${comp(cab.de)}`, `${qtd(k.tabelas)} tabelas · ${qtd(k.itens_com_preco)} itens · ${qtd(k.mudancas)} mudanças`, manchete],
        paginas: [[capa, ['Resumo', 'Composição']], [p2, ['Detalhe', 'Notas']]],
        planilha: { aba: 'Preços', colunas: [
            { cab: 'Tabela', larg: 24, ler: r => r.tabela }, { cab: 'Item', larg: 30, ler: r => r.item }, { cab: 'Para', larg: 22, ler: r => r.comprador || 'todos' },
            { cab: 'A partir de (qtd)', larg: 12, fmt: 'moeda', ler: r => num(r.quantidade_min) }, { cab: 'Preço (R$)', larg: 14, fmt: 'moeda', ler: r => num(r.preco) },
            { cab: 'Unidade', larg: 9, ler: r => r.unidade || '' }, { cab: 'Desde', larg: 12, fmt: 'data', ler: r => r.desde }],
            linhas: ls, kpis: [{ rot: 'Preços', formula: f => `COUNTA(${f('Item')})`, fmt: 'int' }],
            sobre: [['Linha', 'Um preço vigente no fim do mês, numa tabela ativa.']] } };
}
// ---------------------------------------------------------------------------
// v1.16.0 (dem 679b2700, Onda 4) — Balanço entre pessoas · analítico e Ativos e contratos por pessoa (REL-56: só fatos e dados)
// ---------------------------------------------------------------------------
const NAT_BAL = { distribuicao: 'Distribuição', reembolso: 'Reembolso', adiantamento: 'Adiantamento', rateio: 'Rateio', extraordinaria: 'Retirada extraordinária' };
const GRUPOS_BAL = [['dist', 'Distribuição'], ['emp', 'Com a empresa'], ['pes', 'Entre pessoas']];
// a mesma regra do extrato da pessoa (pessoas-extrato.js): extraordinária não entra no saldo
const grupoBal = (natureza, contraparteTipo) => natureza === 'extraordinaria' ? null : natureza === 'distribuicao' ? 'dist' : (contraparteTipo === 'caixa' ? 'emp' : 'pes');
const comSinalBal = v => (num(v) > 0.004 ? '+' : num(v) < -0.004 ? '−' : '') + nf(Math.abs(num(v)));
function comoFoiBal(e) {
    const mov = num(e.valor_movimento), c = num(e.cota);
    if (e.natureza === 'extraordinaria') return `não abate o saldo · ${brl(mov)}`;
    if (c > 0 && c < 100 && mov) return `${nf(c, c % 1 ? 2 : 0)}% de ${brl(mov)}`;
    if (e.pagador) return `pagou ${e.pagador}`;
    return e.contraparte_nome ? `com ${e.contraparte_nome}` : '';
}
function montarBalancoAnalitico(d) {
    const cab = d.cabecalho, pessoas = d.pessoas;
    const nomeMes = cab.de ? `${MESES_LONGO[dataIso(cab.de).getMonth()]} ${dataIso(cab.de).getFullYear()}` : 'desde o início';
    const cfg = { nome: 'Balanço entre pessoas · analítico', medida: 'Saldo entre pessoas em R$', previa: !!d.previa,
        subtitulo: [cab.de ? `itens de ${dma(cab.de)} a ${dma(cab.ate)}` : `itens até ${dma(cab.ate)}`, `situação em ${dma(cab.ate)}`, cab.pessoa_nome || 'todas as pessoas'].join(' · ') };
    const nItens = pessoas.reduce((t, p) => t + p.doPeriodo.length, 0);
    const aRec = pessoas.reduce((t, p) => t + Math.max(p.saldo, 0), 0), aPag = pessoas.reduce((t, p) => t + Math.max(-p.saldo, 0), 0);
    const linha = `${cab.de ? nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1) : 'Desde o início'}: ${qtdTxt(nItens, 'item', 'itens')}, ${qtdTxt(pessoas.length, 'pessoa', 'pessoas')}, ${brl(aRec)} a receber e ${brl(aPag)} a pagar.`;
    const mx = Math.max(1, ...pessoas.map(p => Math.abs(p.saldo)));
    const barras = pessoas.map(p => {
        const w = Math.round(Math.abs(p.saldo) / mx * 500) / 10;
        return `<div class="hbar"><span style="width:150px">${esc(p.nome)}</span><div class="trk2"><i style="${p.saldo >= 0 ? `left:50%;width:${w}%` : `left:${50 - w}%;width:${w}%`}"></i><em class="exp" style="left:50%"></em></div><b>${comSinalBal(p.saldo)}</b></div>`;
    }).join('') || '<p class="mut">Ninguém com saldo até esta data.</p>';
    const tot = k => pessoas.reduce((t, p) => t + num(p[k]), 0);
    const capa = `
      <div class="acao-sub rx-resumo">${esc(linha)}</div>
      <div class="kpis">${kpi('Pessoas', String(pessoas.length), 'com saldo ou item')}${kpi(cab.de ? 'Itens no mês' : 'Itens', String(nItens), cab.de ? nomeMes : 'até ' + dma(cab.ate))}${kpi('A receber', compacto(aRec), 'soma dos saldos positivos')}${kpi('A pagar', compacto(aPag), 'soma dos saldos negativos')}</div>
      ${figura('Saldo por pessoa', `R$ · situação em ${dma(cab.ate)} · à direita: a receber · à esquerda: deve`, '', 'Raiz · fn_balanco_pessoas · ' + dma(cab.ate), barras)}
      ${secao('Composição do saldo', 'R$ · Distribuição + Com a empresa + Entre pessoas = Saldo')}
      <table><thead><tr><th>Pessoa</th>${GRUPOS_BAL.map(([, n]) => `<th class="n">${n}</th>`).join('')}<th class="n">Saldo</th></tr></thead><tbody>${
        pessoas.map(p => `<tr><td>${esc(p.nome)}</td>${GRUPOS_BAL.map(([k]) => `<td class="n">${comSinalBal(p[k])}</td>`).join('')}<td class="n"><b>${comSinalBal(p.saldo)}</b></td></tr>`).join('') || '<tr><td colspan="5" class="mut">Ninguém com saldo.</td></tr>'
      }<tr class="tot"><td>Total</td>${GRUPOS_BAL.map(([k]) => `<td class="n">${comSinalBal(tot(k))}</td>`).join('')}<td class="n">${comSinalBal(tot('saldo'))}</td></tr></tbody></table>
      <div class="notes"><p><b>Saldo</b>: positivo, a pessoa tem a receber; negativo, a pessoa deve. Retirada extraordinária aparece no item e não entra no saldo.</p>
      <p><b>Origem</b>: fn_balanco_pessoas e fn_balanco_extrato · situação em ${dma(cab.ate)}.${d.previa ? ' <b>PRÉVIA</b>: o mês ainda não foi fechado.' : ''}</p></div>`;
    const paginas = [[capa, ['Resumo', 'Composição', 'Notas']]];
    pessoas.forEach(p => {
        let run = p.anterior;
        const linhas = p.doPeriodo.map(e => {
            const g = grupoBal(e.natureza, e.contraparte_tipo);
            if (g) run += num(e.valor);
            const aj = e.origem_tipo === 'lancamento' || e.origem_tipo === 'mensalidade';
            return `<tr${aj ? ` class="aj" data-aj="${e._i}" title="Toque para ajustar a divisão"` : ''}><td>${dma(e.data)}</td><td>${esc(e.descricao || 'Movimento')}<br><small class="mut">${esc(comoFoiBal(e))}</small></td><td class="hm">${esc(NAT_BAL[e.natureza] || e.natureza)}</td><td class="n">${e.natureza === 'extraordinaria' ? `<span class="mut">${nf(e.valor_movimento)}</span>` : comSinalBal(e.valor)}</td><td class="n">${comSinalBal(run)}</td></tr>`;
        }).join('');
        const corpo = `${secao(p.nome, `${cab.de ? 'Itens de ' + nomeMes : 'Todos os itens'} · R$ · positivo: a pessoa tem a receber${p.pessoaId ? ' · toque numa linha de lançamento ou recebimento para ajustar a divisão' : ''}`)}
          <table><thead><tr><th>Data</th><th>Item</th><th class="hm">Natureza</th><th class="n">Valor</th><th class="n">Saldo</th></tr></thead><tbody>
          ${cab.de ? `<tr class="prev"><td>${dma(cab.de)}</td><td>Saldo anterior</td><td class="hm"></td><td class="n"></td><td class="n">${comSinalBal(p.anterior)}</td></tr>` : ''}
          ${linhas || `<tr><td colspan="5" class="mut">Nenhum item ${cab.de ? 'em ' + nomeMes : ''}.</td></tr>`}
          ${GRUPOS_BAL.map(([k, n]) => `<tr class="sub"><td></td><td>${n}</td><td class="hm"></td><td class="n">${comSinalBal(p[k])}</td><td></td></tr>`).join('')}
          <tr class="tot"><td></td><td>Saldo em ${dma(cab.ate)}</td><td class="hm"></td><td class="n">${comSinalBal(p.saldo)}</td><td></td></tr></tbody></table>`;
        paginas.push([corpo, ['Detalhe']]);
    });
    const plan = [];
    pessoas.forEach(p => { let run = p.anterior; p.doPeriodo.forEach(e => { if (grupoBal(e.natureza, e.contraparte_tipo)) run += num(e.valor);
        plan.push({ pessoa: p.nome, data: e.data, item: e.descricao || 'Movimento', como: comoFoiBal(e), natureza: NAT_BAL[e.natureza] || e.natureza,
            contraparte: e.contraparte_nome || 'Empresa', valor: e.natureza === 'extraordinaria' ? 0 : num(e.valor), saldo: run }); }); });
    return { cfg, linhas3: [`${cfg.nome} · ${cab.de ? comp(cab.de) : 'até ' + dma(cab.ate)}`, `A receber ${compacto(aRec)} · a pagar ${compacto(aPag)}`, linha],
        paginas, ligar: ligarBalancoAnalitico,
        planilha: { aba: 'Itens', recorte: `${cab.de ? comp(cab.de) : 'até ' + dma(cab.ate)} · ${cab.pessoa_nome || 'todas as pessoas'}`, sufixo: cab.de ? String(cab.de).slice(0, 7).replace('-', '_') : 'tudo',
            fonte: 'fn_balanco_extrato', colunas: [
                { cab: 'Pessoa', larg: 26, ler: r => r.pessoa }, { cab: 'Data', larg: 12, fmt: 'data', ler: r => r.data },
                { cab: 'Item', larg: 34, ler: r => r.item }, { cab: 'Como foi calculado', larg: 26, ler: r => r.como },
                { cab: 'Natureza', larg: 18, ler: r => r.natureza }, { cab: 'Com', larg: 22, ler: r => r.contraparte },
                { cab: 'Valor (R$)', larg: 14, fmt: 'moeda', ler: r => r.valor, total: true }, { cab: 'Saldo (R$)', larg: 14, fmt: 'moeda', ler: r => r.saldo }],
            linhas: plan, kpis: [{ rot: 'Itens', formula: f => `COUNTA(${f('Item')})`, fmt: 'int' }, { rot: 'Soma dos itens (R$)', formula: f => `SUM(${f('Valor (R$)')})` }],
            sobre: [['Linha', 'Um item do extrato de uma pessoa no período: retirada, rateio, reembolso, adiantamento ou acerto.'], ['Valor', 'O efeito no saldo da pessoa: positivo, ela tem a receber; negativo, deve. Retirada extraordinária entra com 0 (não abate o saldo).'],
                ['Saldo', 'Saldo corrido da pessoa depois da linha, a partir do saldo anterior ao período.']] } };
}
function ligarBalancoAnalitico(corpo) {
    corpo.querySelectorAll('tr.aj[data-aj]').forEach(tr => tr.addEventListener('click', async () => {
        if (!pode('financeiro.divisao.editar').ok) { rzToast('Sem permissão para ajustar a divisão.', 'warning'); return; }
        const e = estado?.dados?.itens?.[Number(tr.dataset.aj)]; if (!e) return;
        try {
            const m = await import('./pessoas-extrato.js');
            m.pessoasAjustarItem(e, () => carregar());
        } catch (err) { console.error('[rz] ajuste', err); rzToast('Não foi possível abrir o ajuste.', 'danger'); }
    }));
}
const pode = codigo => (typeof podeUsar === 'function' ? podeUsar(codigo) : { ok: true });
async function buscarBalancoAnalitico(f) {
    const de = f.competencia || null;
    let ate;
    if (de) { const d0 = new Date(Number(de.slice(0, 4)), Number(de.slice(5, 7)), 0); ate = de.slice(0, 8) + String(d0.getDate()).padStart(2, '0'); }
    else { const h = new Date(); ate = h.getFullYear() + '-' + String(h.getMonth() + 1).padStart(2, '0') + '-' + String(h.getDate()).padStart(2, '0'); }
    const [rp, re, quem] = await Promise.all([
        dbAuth.rpc('fn_balanco_pessoas', { p_cliente_id: CLIENTE_ID_SUPABASE, p_ate: ate }),
        dbAuth.rpc('fn_balanco_extrato', { p_cliente_id: CLIENTE_ID_SUPABASE, p_pessoa_id: f.pessoaId || null, p_limite: null, p_ate: ate }), quemGera()]);
    if (rp.error) throw new Error(rp.error.message);
    if (re.error) throw new Error(re.error.message);
    const chave = x => x.pessoa_id || ('ext:' + (x.nome_externo || x.nome));
    const mapa = new Map();
    (rp.data || []).forEach(x => {
        if (f.pessoaId && x.pessoa_id !== f.pessoaId) return;
        const k = chave(x), p = mapa.get(k) || { chave: k, pessoaId: x.pessoa_id || null, nome: x.nome, dist: 0, emp: 0, pes: 0, saldo: 0, anterior: 0, doPeriodo: [] };
        const g = grupoBal(x.natureza, x.contraparte_tipo); if (g) { p[g] += num(x.valor); p.saldo += num(x.valor); }
        mapa.set(k, p);
    });
    const itens = (re.data || []).slice().sort((a, b) => String(a.data).localeCompare(String(b.data)) || String(a.origem_id).localeCompare(String(b.origem_id)));
    itens.forEach((e, i) => {
        e._i = i;
        const k = chave(e), p = mapa.get(k) || { chave: k, pessoaId: e.pessoa_id || null, nome: e.nome, dist: 0, emp: 0, pes: 0, saldo: 0, anterior: 0, doPeriodo: [] };
        mapa.set(k, p);
        if (de && String(e.data) < de) { if (grupoBal(e.natureza, e.contraparte_tipo)) p.anterior += num(e.valor); }
        else p.doPeriodo.push(e);
    });
    const pessoas = [...mapa.values()].filter(p => Math.abs(p.saldo) > 0.004 || p.doPeriodo.length || Math.abs(p.anterior) > 0.004)
        .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    const m0 = iso(new Date());
    const empresa = (typeof CONFIG_CLIENTE === 'object' && CONFIG_CLIENTE?.nomeEmpresa) || 'Empresa';
    return { cabecalho: { de, ate, pessoa_nome: f.pessoaNome || null }, pessoas, itens, previa: !de || de >= m0,
             empresa, gerado_em: new Date().toISOString(), gerado_por: quem, relatorio: 'relatorios.balanco_analitico', versao: 1, visao: 'situacao' };
}

function montarAtivosPessoa(d) {
    const cab = d.cabecalho || {}, k = d.kpis || {}, pp = d.por_pessoa || [], ls = d.linhas || [];
    const recorte = !!cab.recorte;
    const cfg = { nome: 'Ativos e contratos por pessoa', medida: 'Parte de cada pessoa em R$', previa: false,
        subtitulo: [`situação em ${dma(cab.situacao_em)}`, 'valores do cadastro de cada ativo', cab.pessoa_nome || 'todas as pessoas'].join(' · ') };
    const linha = recorte
        ? `${qtdTxt(k.ativos, 'ativo', 'ativos')} com parte de ${cab.pessoa_nome || 'você'}: ${brl(k.parte_valor)} no valor e ${brl(k.parte_mes)} por mês nos contratos vigentes.`
        : `${qtdTxt(k.ativos, 'ativo', 'ativos')}, ${qtdTxt(k.contratos, 'contrato vigente', 'contratos vigentes')}, ${qtdTxt(k.pessoas, 'pessoa com parte', 'pessoas com parte')}.`;
    const kpis = `<div class="kpis">${recorte
        ? kpi('Ativos', String(num(k.ativos)), 'com parte') + kpi('Contratos', String(num(k.contratos)), 'vigentes') + kpi('Parte no valor', compacto(k.parte_valor), 'valor × parte') + kpi('Parte por mês', compacto(k.parte_mes), 'contratos vigentes')
        : kpi('Ativos', String(num(k.ativos)), num(d.sem_valor) ? qtdTxt(d.sem_valor, 'sem valor no cadastro', 'sem valor no cadastro') : 'todos com valor') + kpi('Valor total', compacto(k.valor_total), 'cadastro dos ativos') + kpi('Contratos', String(num(k.contratos)), 'vigentes') + kpi('Receita por mês', compacto(k.receita_mes), 'contratos vigentes')}</div>`;
    const mx = Math.max(1, ...pp.map(p => num(p.parte_valor)));
    const barras = pp.map(p => `<div class="hbar"><span style="width:150px">${esc(p.nome)}</span><div class="trk2"><i style="width:${Math.max(0.6, Math.round(num(p.parte_valor) / mx * 1000) / 10)}%"></i></div><b>${compacto(p.parte_valor)}</b></div>`).join('') || '<p class="mut">Nenhum ativo com parte cadastrada.</p>';
    const fonte = 'Raiz · fn_relatorio_ativos_por_pessoa · ' + dma(cab.situacao_em);
    const capa = `
      <div class="acao-sub rx-resumo">${esc(linha)}</div>${kpis}
      ${figura('Parte de cada pessoa no valor dos ativos', 'R$ · valor do cadastro × parte', '', fonte, barras)}
      ${secao('Resumo por pessoa', 'R$ · parte no valor e na receita por mês dos contratos vigentes')}
      <table><thead><tr><th>Pessoa</th><th class="n">Ativos</th><th class="n">Parte no valor</th><th class="n">Parte na receita/mês</th></tr></thead><tbody>${
        pp.map(p => `<tr><td>${esc(p.nome)}</td><td class="n">${num(p.ativos)}</td><td class="n">${tab(p.parte_valor)}</td><td class="n">${tab(p.parte_mes)}</td></tr>`).join('') || '<tr><td colspan="4" class="mut">Nenhuma pessoa com parte.</td></tr>'
      }<tr class="tot"><td>Total</td><td class="n">${num(k.ativos)}</td><td class="n">${tab(k.parte_valor)}</td><td class="n">${tab(k.parte_mes)}</td></tr></tbody></table>
      <div class="notes">
        <p><b>Vínculo</b>: propriedade direta (a parte está na propriedade do ativo) ou pela empresa dona (o ativo não tem propriedade cadastrada e vale a quota de cada pessoa na empresa). "Pelo contrato": a pessoa recebe pela divisão do contrato, sem parte no ativo.</p>
        <p><b>Parte na receita</b>: a divisão do contrato quando ele tem uma; sem divisão, a parte no ativo. Contrato vigente é o contrato ativo hoje, com o valor atual por mês.</p>
        ${(d.ativos_soma_diferente || []).length ? `<p><b>Partes que não somam 100%</b>: ${d.ativos_soma_diferente.map(a => `${esc(a.ativo)} (${nf(a.soma, 2)}%)`).join(', ')}. Ajuste em Patrimônio › ativo › Propriedade.</p>` : ''}
        ${num(d.sem_valor) ? `<p><b>Sem valor</b>: ${qtdTxt(d.sem_valor, 'ativo sem valor', 'ativos sem valor')} no cadastro entra${num(d.sem_valor) > 1 ? 'm' : ''} com R$ 0 na parte do valor.</p>` : ''}
        ${recorte ? `<p><b>Recorte</b>: só a parte de ${esc(cab.pessoa_nome || 'quem gerou')} (REL-46).</p>` : ''}
        <p><b>Origem</b>: fn_relatorio_ativos_por_pessoa v1 · situação em ${dma(cab.situacao_em)}. O usufruto não entra neste relatório.</p></div>`;
    const VINC = { direta: 'Propriedade direta', empresa: 'Pela empresa dona', contrato: 'Pelo contrato' };
    const vig = c => [c.inicio ? 'desde ' + dma(c.inicio) : '', c.fim ? 'até ' + dma(c.fim) : 'sem prazo'].filter(Boolean).join(' · ');
    const paginas = [[capa, ['Resumo', 'Composição', 'Notas']]];
    pp.forEach(p => {
        const as = ls.filter(l => (l.pessoa_id || l.nome) === (p.pessoa_id || p.nome));
        const linhas = as.map(a => {
            const cs = a.contratos || [];
            const ctr = cs.length ? cs.map(c => `${esc(c.locatario || 'Sem nome')}<br><small class="mut">${esc(c.tipo)} · ${esc(vig(c))}${c.pct != null && num(c.pct) !== num(a.pct) ? ' · ' + nf(c.pct, num(c.pct) % 1 ? 2 : 0) + '% da receita' : ''}</small>`).join('<br>') : '<span class="mut">Sem contrato vigente</span>';
            return `<tr><td>${esc(a.ativo)}<br><small class="mut">${esc(a.ramo || '')}${num(a.valor) ? ' · ' + compacto(a.valor) : ' · sem valor'}</small></td><td class="hm">${VINC[a.vinculo] || a.vinculo}</td><td class="n">${nf(a.pct, num(a.pct) % 1 ? 2 : 0)}%</td><td>${ctr}</td><td class="n hm">${num(a.valor_mes) ? tab(a.valor_mes) : '—'}</td><td class="n">${num(a.parte_mes) ? tab(a.parte_mes) : '—'}</td></tr>`;
        }).join('');
        paginas.push([`${secao(p.nome, `${qtdTxt(p.ativos, 'ativo', 'ativos')} · parte no valor ${brl(p.parte_valor)} · parte na receita ${brl(p.parte_mes)}/mês`)}
          <table><thead><tr><th>Ativo</th><th class="hm">Vínculo</th><th class="n">Parte</th><th>Contrato vigente</th><th class="n hm">Valor/mês</th><th class="n">Parte/mês</th></tr></thead><tbody>${linhas}
          <tr class="tot"><td colspan="2">Total</td><td class="n"></td><td></td><td class="n hm">${tab(as.reduce((t, a) => t + num(a.valor_mes), 0))}</td><td class="n">${tab(p.parte_mes)}</td></tr></tbody></table>`, ['Detalhe']]);
    });
    const plan = [];
    ls.forEach(a => { const cs = a.contratos && a.contratos.length ? a.contratos : [null];
        cs.forEach(c => plan.push({ pessoa: a.nome, ativo: a.ativo, ramo: a.ramo, valor: num(a.valor), vinculo: VINC[a.vinculo] || a.vinculo, pct: num(a.pct), parte_valor: num(a.parte_valor),
            contrato: c ? c.locatario || 'Sem nome' : 'Sem contrato vigente', tipo: c ? c.tipo : '', inicio: c ? c.inicio : null, fim: c ? c.fim : null,
            valor_mes: c ? num(c.valor_mes) : 0, pct_receita: c && c.pct != null ? num(c.pct) : null, parte_mes: c ? num(c.parte_mes) : 0 })); });
    return { cfg, linhas3: [`${cfg.nome} · ${dma(cab.situacao_em)}`, recorte ? `Parte no valor ${compacto(k.parte_valor)} · ${compacto(k.parte_mes)}/mês` : `Valor ${compacto(k.valor_total)} · receita ${compacto(k.receita_mes)}/mês`, linha],
        paginas,
        planilha: { aba: 'Ativos por pessoa', recorte: `situação em ${dma(cab.situacao_em)} · ${cab.pessoa_nome || 'todas as pessoas'}`, sufixo: String(cab.situacao_em).slice(0, 10).replace(/-/g, '_'),
            fonte: 'fn_relatorio_ativos_por_pessoa', colunas: [
                { cab: 'Pessoa', larg: 26, ler: r => r.pessoa }, { cab: 'Ativo', larg: 28, ler: r => r.ativo }, { cab: 'Ramo', larg: 12, ler: r => r.ramo },
                { cab: 'Valor do ativo (R$)', larg: 16, fmt: 'moeda', ler: r => r.valor }, { cab: 'Vínculo', larg: 18, ler: r => r.vinculo },
                { cab: 'Parte (%)', larg: 10, fmt: '0.00', ler: r => r.pct }, { cab: 'Parte no valor (R$)', larg: 16, fmt: 'moeda', ler: r => r.parte_valor },
                { cab: 'Contrato vigente', larg: 28, ler: r => r.contrato }, { cab: 'Tipo', larg: 20, ler: r => r.tipo },
                { cab: 'Início', larg: 12, fmt: 'data', ler: r => r.inicio }, { cab: 'Fim', larg: 12, fmt: 'data', ler: r => r.fim },
                { cab: 'Valor/mês (R$)', larg: 14, fmt: 'moeda', ler: r => r.valor_mes }, { cab: 'Parte na receita (%)', larg: 12, fmt: '0.00', ler: r => r.pct_receita },
                { cab: 'Parte/mês (R$)', larg: 14, fmt: 'moeda', ler: r => r.parte_mes, total: true }],
            linhas: plan, kpis: [{ rot: 'Linhas', formula: f => `COUNTA(${f('Ativo')})`, fmt: 'int' }, { rot: 'Parte/mês (R$)', formula: f => `SUM(${f('Parte/mês (R$)')})` }],
            sobre: [['Linha', 'Uma pessoa × um ativo × um contrato vigente (ou "Sem contrato vigente"). Um ativo com dois contratos aparece em duas linhas: some a Parte no valor só uma vez por ativo.'],
                ['Vínculo', 'Propriedade direta, pela empresa dona (quotas) ou pelo contrato (só na divisão do contrato).'],
                ['Parte na receita', 'A divisão do contrato quando existe; senão, a parte no ativo.']] } };
}

// ---------------------------------------------------------------------------
// v1.19.0 (I4, 26/11/2026) — Exposição ao FGC (relatorios.investimentos_fgc). Tudo vem pronto de fn_fgc_exposicao (por titular e
// CNPJ raiz do emissor: total coberto, excesso, até quando e as aplicações em ordem de vencimento); aqui só a casca.
// ---------------------------------------------------------------------------
function montarFgc(d) {
    const ls = d.linhas || [], LIM = 250000;
    const acima = ls.filter(x => num(x.excesso) > 0), semCnpj = ls.filter(x => x.sem_cnpj);
    const titulares = [...new Map(ls.map(x => [x.titular_chave, { nome: x.titular_nome, total: num(x.total_titular) }])).values()];
    const exc = acima.reduce((t, x) => t + num(x.excesso), 0);
    const cfg = { nome: 'Exposição ao FGC', medida: 'Aplicações cobertas pelo FGC em R$', previa: false,
        subtitulo: [`situação em ${dma(d.situacao_em)}`, 'valor atual de cada aplicação', titulares.length === 1 ? titulares[0].nome : `${titulares.length} titulares`].join(' · ') };
    const linha = acima.length
        ? `${qtdTxt(acima.length, 'banco passa', 'bancos passam')} do limite de R$ 250 mil: ${brl(exc)} sem garantia do FGC hoje.`
        : (ls.length ? 'Nenhum banco passa do limite de R$ 250 mil por titular.' : 'Nenhuma aplicação coberta pelo FGC (CDB, LCI, LCA ou poupança).');
    const kpis = `<div class="kpis">${kpi('Coberto pelo FGC', compacto(ls.reduce((t, x) => t + num(x.total), 0)), qtdTxt(ls.length, 'banco', 'bancos'))}${kpi('Acima do limite', compacto(exc), qtdTxt(acima.length, 'banco', 'bancos'), acima.length ? 'neg' : 'mut')}${kpi('Maior exposição', ls.length ? nf(ls[0].pct, 0) + '%' : '—', ls.length ? ls[0].emissor_nome : '')}${kpi('Titulares', String(titulares.length), 'teto de R$ 1 milhão em 4 anos')}</div>`;
    const barras = ls.map(x => `<div class="hbar"><span style="width:170px">${esc(x.emissor_nome)}${titulares.length > 1 ? ' · ' + esc(x.titular_nome) : ''}</span><div class="trk2"><i style="width:${Math.max(0.6, Math.min(100, num(x.total) / LIM * 100)).toFixed(1)}%${num(x.excesso) > 0 ? ';background:var(--danger)' : ''}"></i></div><b>${nf(x.pct, 0)}%</b></div>`).join('') || '<p class="mut">Nenhuma aplicação coberta.</p>';
    const fonte = 'Raiz · fn_fgc_exposicao · ' + dma(d.situacao_em);
    const capa = `
      <div class="acao-sub rx-resumo">${esc(linha)}</div>${kpis}
      ${figura('Quanto de cada banco está coberto', '% do limite de R$ 250 mil por titular · barra cheia = no limite', '', fonte, barras)}
      ${secao('Por banco', 'R$ · soma das aplicações cobertas do titular no mesmo CNPJ raiz, em todas as contas')}
      <table><thead><tr><th>Banco</th>${titulares.length > 1 ? '<th>Titular</th>' : ''}<th class="n">Coberto</th><th class="n">% do limite</th><th class="n">Acima</th><th>Até</th></tr></thead><tbody>${
        ls.map(x => `<tr><td>${esc(x.emissor_nome)}${x.sem_cnpj ? ' <span class="mut">(sem CNPJ)</span>' : x.emissor_cnpj ? `<br><small class="mut">${esc(x.emissor_cnpj)}</small>` : ''}</td>${titulares.length > 1 ? `<td>${esc(x.titular_nome)}</td>` : ''}<td class="n">${tab(x.total)}</td><td class="n">${nf(x.pct, 0)}%</td><td class="n ${num(x.excesso) > 0 ? 'neg' : ''}">${num(x.excesso) > 0 ? tab(x.excesso) : '—'}</td><td>${x.excesso_ate ? dma(x.excesso_ate) : num(x.excesso) > 0 ? 'sem vencimento' : ''}</td></tr>`).join('') || `<tr><td colspan="${titulares.length > 1 ? 6 : 5}" class="mut">Nenhuma aplicação coberta.</td></tr>`
      }</tbody></table>
      ${titulares.length ? secao('Total coberto por titular', 'R$ · o FGC tem teto de R$ 1 milhão por CPF a cada 4 anos') + `<table><tbody>${titulares.map(t => `<tr><td>${esc(t.nome)}</td><td class="n">${tab(t.total)}</td><td class="n ${t.total > 1000000 ? 'neg' : 'mut'}">${nf(t.total / 10000, 0)}% de R$ 1 milhão</td></tr>`).join('')}</tbody></table>` : ''}
      <div class="notes">
        <p><b>Cobertura</b>: o FGC garante até R$ 250 mil por CPF (ou CNPJ) e por instituição (CNPJ raiz), somando principal e rendimento; há ainda um teto de R$ 1 milhão por CPF a cada 4 anos. Entram CDB, RDB, LC, LCI, LCA, LIG e poupança. Tesouro, debêntures, CRI, CRA, fundos, previdência e renda variável não entram.</p>
        <p><b>Titular</b>: o proprietário da conta de investimento (Propriedade do ativo). Conta com mais de um titular divide igualmente entre eles, como faz o FGC.</p>
        <p><b>Até quando</b>: a data do vencimento a partir da qual a soma do banco volta a caber no limite, pela ordem dos vencimentos.</p>
        ${semCnpj.length ? `<p><b>Sem CNPJ</b>: ${semCnpj.map(x => esc(x.emissor_nome)).join(', ')}. Sem o CNPJ, bancos do mesmo grupo não se juntam; cadastre o CNPJ do emissor em Partes.</p>` : ''}
        <p><b>Origem</b>: fn_fgc_exposicao v1 · situação em ${dma(d.situacao_em)}. Conglomerados (bancos diferentes do mesmo grupo) ainda não são somados.</p></div>`;
    const paginas = [[capa, ['Resumo', 'Por banco', 'Notas']]];
    const exp = ls.filter(x => (x.aplicacoes || []).length);
    if (exp.length) paginas.push([`${secao('Vencimentos por banco', 'R$ · o que vence e quanto sobra coberto depois')}
      ${exp.map(x => `<p style="margin:10px 0 4px"><b>${esc(x.emissor_nome)}</b>${titulares.length > 1 ? ' · ' + esc(x.titular_nome) : ''} · ${brl(x.total)} (${nf(x.pct, 0)}%)</p>
        <table><thead><tr><th>Aplicação</th><th>Vence</th><th class="n">Valor</th><th class="n">Soma depois</th></tr></thead><tbody>${
          (x.aplicacoes || []).map(a => `<tr><td>${esc(a.descricao || '—')}</td><td>${a.fim ? dma(a.fim) : 'sem vencimento'}</td><td class="n">${tab(a.valor)}</td><td class="n ${num(a.restante_depois) > LIM ? 'neg' : ''}">${tab(a.restante_depois)}</td></tr>`).join('')}</tbody></table>`).join('')}`, ['Detalhe']]);
    const plan = [];
    ls.forEach(x => (x.aplicacoes || []).forEach(a => plan.push({ titular: x.titular_nome, banco: x.emissor_nome, cnpj: x.emissor_cnpj || '', aplicacao: a.descricao || '',
        fim: a.fim, valor: num(a.valor), total: num(x.total), pct: num(x.pct), excesso: num(x.excesso), ate: x.excesso_ate })));
    return { cfg, linhas3: [`${cfg.nome} · ${dma(d.situacao_em)}`, acima.length ? `${brl(exc)} acima do limite em ${qtdTxt(acima.length, 'banco', 'bancos')}` : 'Tudo dentro do limite', linha],
        paginas,
        planilha: { aba: 'Exposição ao FGC', recorte: `situação em ${dma(d.situacao_em)}`, sufixo: String(d.situacao_em).slice(0, 10).replace(/-/g, '_'),
            fonte: 'fn_fgc_exposicao', colunas: [
                { cab: 'Titular', larg: 24, ler: r => r.titular }, { cab: 'Banco', larg: 26, ler: r => r.banco }, { cab: 'CNPJ', larg: 20, ler: r => r.cnpj },
                { cab: 'Aplicação', larg: 32, ler: r => r.aplicacao }, { cab: 'Vencimento', larg: 12, fmt: 'data', ler: r => r.fim },
                { cab: 'Valor (R$)', larg: 14, fmt: 'moeda', ler: r => r.valor, total: true }, { cab: 'Total do banco (R$)', larg: 16, fmt: 'moeda', ler: r => r.total },
                { cab: '% do limite', larg: 10, fmt: '0.0', ler: r => r.pct }, { cab: 'Acima (R$)', larg: 14, fmt: 'moeda', ler: r => r.excesso }, { cab: 'Acima até', larg: 12, fmt: 'data', ler: r => r.ate }],
            linhas: plan, kpis: [{ rot: 'Aplicações', formula: f => `COUNTA(${f('Aplicação')})`, fmt: 'int' }, { rot: 'Valor (R$)', formula: f => `SUM(${f('Valor (R$)')})` }],
            sobre: [['Linha', 'Uma aplicação coberta pelo FGC de um titular. O total, o % e o excesso são do banco (CNPJ raiz) para aquele titular.'],
                ['Cobertura', 'R$ 250 mil por CPF e por instituição; teto de R$ 1 milhão por CPF a cada 4 anos.']] } };
}

const COMERCIAL = { com_pedidos: 'pedidos', com_itens: 'itens', com_clientes: 'clientes', com_ativos: 'ativos',
    com_margem: 'margem', com_funil: 'funil', com_recebiveis: 'recebiveis', com_entregas: 'entregas', com_precos: 'precos' }; // v1.15.0
const ehComercial = t => !!COMERCIAL[t];
async function escolherAtivoComercial() {
    let ativos = [];
    try {
        const { data } = await dbAuth.from('vinculos').select('ativo_id, ativo:ativo_id(nome_exibicao)').eq('origem_tipo', 'catalogo_tabela').eq('papel', 'vende');
        const vistos = new Map(); (data || []).forEach(v => { if (v.ativo_id && !vistos.has(v.ativo_id)) vistos.set(v.ativo_id, v.ativo?.nome_exibicao || 'Ativo'); });
        ativos = [...vistos.entries()].sort((a, b) => a[1].localeCompare(b[1], 'pt-BR'));
    } catch (e) { ativos = []; }
    abrirSheetAcoes({ titulo: 'Ponto de venda', sub: RELATORIOS[estado.tipo].nome, acoes: [
        { icone: 'layers', titulo: 'Todos os pontos de venda', aoTocar: () => { Object.assign(estado.filtro, { ativoId: null, ativoNome: null }); carregar(); } },
        ...ativos.map(([id, nome]) => ({ icone: 'store', titulo: nome, aoTocar: () => { Object.assign(estado.filtro, { ativoId: id, ativoNome: nome }); carregar(); } }))] });
}
function planilhaComercial() {
    const p = estado?.montado?.planilha; if (!p) return;
    if (p.recorte) { baixarPlanilhaLista({ ...p, titulo: RELATORIOS[estado.tipo].nome, arquivo: RELATORIOS[estado.tipo].arquivo }); return; } // v1.16.0 — o relatório traz recorte e fonte
    const cab = estado.dados.cabecalho || {};
    baixarPlanilhaLista({ ...p, titulo: RELATORIOS[estado.tipo].nome, recorte: `${comp(cab.de)} · ${cab.ativo_nome || 'todos os pontos de venda'}`,
        arquivo: RELATORIOS[estado.tipo].arquivo, sufixo: String(cab.de).slice(0, 7).replace('-', '_'), fonte: 'fn_relatorio_comercial' });
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
    executivo: { codigo: 'relatorios.executivo', nome: 'Relatório executivo', arquivo: 'executivo', montar: montarExecutivo }, // v1.6.0 — cockpit C3
    investimentos: { codigo: 'relatorios.investimentos', nome: 'Investimentos no patrimônio', arquivo: 'investimentos_patrimonio', montar: montarInvestimentos }, // v1.13.0
    com_pedidos: { codigo: 'comercial.rel_pedidos', nome: 'Pedidos do mês', arquivo: 'pedidos_mes', montar: montarComPedidos }, // v1.14.0 — Comercial
    com_itens: { codigo: 'comercial.rel_itens', nome: 'Itens mais vendidos', arquivo: 'itens_mais_vendidos', montar: montarComItens },
    com_clientes: { codigo: 'comercial.rel_clientes', nome: 'Faturamento por cliente', arquivo: 'faturamento_cliente', montar: montarComClientes },
    com_ativos: { codigo: 'comercial.rel_ativos', nome: 'Vendas por ponto de venda', arquivo: 'vendas_ponto_venda', montar: montarComAtivos },
    com_margem: { codigo: 'comercial.rel_margem', nome: 'Margem por item e safra', arquivo: 'margem_item_safra', montar: montarComMargem }, // v1.15.0
    com_funil: { codigo: 'comercial.rel_funil', nome: 'Funil de interessados', arquivo: 'funil_interessados', montar: montarComFunil },
    com_recebiveis: { codigo: 'comercial.rel_recebiveis', nome: 'Recebíveis das vendas', arquivo: 'recebiveis_vendas', montar: montarComRecebiveis },
    com_entregas: { codigo: 'comercial.rel_entregas', nome: 'Entregas', arquivo: 'entregas', montar: montarComEntregas },
    com_precos: { codigo: 'comercial.rel_precos', nome: 'Preços e tabelas', arquivo: 'precos_tabelas', montar: montarComPrecos },
    balanco_analitico: { codigo: 'relatorios.balanco_analitico', nome: 'Balanço entre pessoas · analítico', arquivo: 'balanco_pessoas_analitico', montar: montarBalancoAnalitico }, // v1.16.0
    ativos_pessoa: { codigo: 'relatorios.ativos_por_pessoa', nome: 'Ativos e contratos por pessoa', arquivo: 'ativos_contratos_por_pessoa', montar: montarAtivosPessoa }, // v1.16.0
    fgc: { codigo: 'relatorios.investimentos_fgc', nome: 'Exposição ao FGC', arquivo: 'exposicao_fgc', montar: montarFgc } // v1.19.0 — I4
};
let estado = null; // { tipo, filtro, dados, montado }

function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-01'; }
function somaMeses(base, n) { const d = new Date(base.getFullYear(), base.getMonth() + n, 1); return d; }
function filtroPadrao(tipo, opcoes = {}) {
    const hoje = new Date(), m0 = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    if (tipo === 'retiradas') return { ano: hoje.getFullYear(), pessoaId: opcoes.pessoaId || null, pessoaNome: opcoes.pessoaNome || null }; // v1.3.0
    if (tipo === 'balanco_analitico') return { competencia: opcoes.competencia || iso(m0), pessoaId: opcoes.pessoaId || null, pessoaNome: opcoes.pessoaNome || null }; // v1.16.0
    if (tipo === 'ativos_pessoa') return {}; // v1.16.0 — situação do dia
    if (tipo === 'fgc') return {}; // v1.19.0 — situação do dia
    if (tipo === 'executivo' || tipo === 'investimentos') return { ano: opcoes.ano || hoje.getFullYear(), ramo: opcoes.ramo || null, ramoNome: opcoes.ramoNome || null }; // v1.6.0 · v1.13.0
    if (ehComercial(tipo)) return { competencia: iso(m0), ativoId: opcoes.ativoId || null, ativoNome: opcoes.ativoNome || null }; // v1.14.0 — mês atual
    if (tipo === 'fluxo') return { de: iso(somaMeses(m0, -3)), ate: iso(somaMeses(m0, 2)), conta: null, contaNome: null, rotulo: 'Últimos 3 meses e próximos 2' };
    return { competencia: iso(somaMeses(m0, -1)) };
}
function rotuloFiltro() {
    if (!estado) return '';
    if (estado.tipo === 'fluxo') return `${comp(estado.filtro.de)} a ${comp(estado.filtro.ate)}`;
    if (estado.tipo === 'retiradas') return estado.filtro.ano ? String(estado.filtro.ano) : 'Todos os anos';
    if (estado.tipo === 'balanco_analitico') return estado.filtro.competencia ? comp(estado.filtro.competencia) : 'Desde o início'; // v1.16.0
    if (estado.tipo === 'ativos_pessoa' || estado.tipo === 'fgc') return 'Hoje';
    if (estado.tipo === 'executivo' || estado.tipo === 'investimentos') return String(estado.filtro.ano); // v1.6.0 · v1.13.0
    return comp(estado.filtro.competencia);
}

async function buscar() {
    const f = estado.filtro;
    if (estado.tipo === 'balanco_analitico') return buscarBalancoAnalitico(f); // v1.16.0
    if (estado.tipo === 'fgc') { // v1.19.0 — I4: exposição ao FGC (fn_fgc_exposicao), situação de hoje
        const [{ data, error }, quem] = await Promise.all([dbAuth.rpc('fn_fgc_exposicao', { p_cliente_id: CLIENTE_ID_SUPABASE }), quemGera()]);
        if (error) throw new Error(error.message);
        const empresa = (typeof CONFIG_CLIENTE === 'object' && CONFIG_CLIENTE?.nomeEmpresa) || 'Empresa';
        const h = new Date(), hoje = h.getFullYear() + '-' + String(h.getMonth() + 1).padStart(2, '0') + '-' + String(h.getDate()).padStart(2, '0');
        return { linhas: data || [], situacao_em: hoje, empresa, gerado_em: new Date().toISOString(), gerado_por: quem,
                 relatorio: 'relatorios.investimentos_fgc', versao: 1, visao: 'situacao' };
    }
    if (estado.tipo === 'ativos_pessoa') { // v1.16.0 — F4
        const [{ data, error }, quem] = await Promise.all([
            dbAuth.rpc('fn_relatorio_ativos_por_pessoa', { p_cliente_id: CLIENTE_ID_SUPABASE, p_pessoa_id: null }), quemGera()]);
        if (error) throw new Error(error.message);
        if (!data?.cabecalho) throw new Error('O relatório não veio.');
        return { ...data, empresa: data.cabecalho.empresa, gerado_em: data.cabecalho.gerado_em, gerado_por: quem,
                 relatorio: 'relatorios.ativos_por_pessoa', versao: 1, visao: 'situacao' };
    }
    if (ehComercial(estado.tipo)) { // v1.14.0 — o mês inteiro, um ponto de venda ou todos
        const d0 = new Date(Number(f.competencia.slice(0, 4)), Number(f.competencia.slice(5, 7)), 0);
        const [{ data, error }, quem] = await Promise.all([
            dbAuth.rpc('fn_relatorio_comercial', { p_cliente_id: CLIENTE_ID_SUPABASE, p_relatorio: COMERCIAL[estado.tipo], p_de: f.competencia,
                p_ate: f.competencia.slice(0, 8) + String(d0.getDate()).padStart(2, '0'), p_ativo_id: f.ativoId || null }), quemGera()]);
        if (error) throw new Error(error.message);
        if (!data?.ok) throw new Error(data?.mensagem || 'O relatório não veio.');
        return { ...data, empresa: data.cabecalho?.empresa, gerado_em: data.cabecalho?.gerado_em, gerado_por: quem,
                 relatorio: RELATORIOS[estado.tipo].codigo, versao: 1, visao: 'competencia' };
    }
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
    if (estado.tipo === 'investimentos') { // v1.13.0 — ano atual até hoje; ano passado inteiro
        const h = new Date(), hojeIso = h.getFullYear() + '-' + String(h.getMonth() + 1).padStart(2, '0') + '-' + String(h.getDate()).padStart(2, '0');
        const [{ data, error }, quem] = await Promise.all([
            dbAuth.rpc('fn_relatorio_investimentos_patrimonio', { p_cliente_id: CLIENTE_ID_SUPABASE, p_de: f.ano + '-01-01',
                p_ate: f.ano === h.getFullYear() ? hojeIso : f.ano + '-12-31', p_ramo: f.ramo || null, p_ativo_id: null }), quemGera()]);
        if (error) throw new Error(error.message);
        if (!data?.ok) throw new Error(data?.mensagem || 'O relatório não veio.');
        if (data.cabecalho) data.cabecalho.ramo_nome = f.ramoNome || null;
        return { ...data, empresa: data.cabecalho?.empresa, gerado_em: data.cabecalho?.gerado_em, gerado_por: quem,
                 relatorio: 'relatorios.investimentos', versao: 1, visao: 'caixa' };
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
        : (estado.tipo === 'retiradas' || estado.tipo === 'balanco_analitico') && estado.filtro.pessoaId ? `<button type="button" data-rx="pessoa" aria-label="Ver todas as pessoas"><svg data-lucide="user"></svg>${esc(estado.filtro.pessoaNome || 'Pessoa')}<svg data-lucide="x"></svg></button>` // v1.3.0: recorte por pessoa; tocar volta a todas
        : ehComercial(estado.tipo) ? `<button type="button" data-rx="ativo"><svg data-lucide="store"></svg>${esc(estado.filtro.ativoNome || 'Todos os pontos')}<svg data-lucide="chevron-down"></svg></button>` // v1.14.0
        : (estado.tipo === 'executivo' || estado.tipo === 'investimentos') ? `<button type="button" data-rx="ramo"><svg data-lucide="layers"></svg>${esc(estado.filtro.ramoNome || (estado.tipo === 'investimentos' ? 'Todos os ramos' : 'Consolidado'))}<svg data-lucide="chevron-down"></svg></button>` : ''; // v1.6.0
    return `<div class="rx-top">
        <button type="button" class="rx-voltar" data-rx="fechar" aria-label="Voltar para Relatórios"><svg data-lucide="chevron-left"></svg>Relatórios</button>
        <span class="rx-sp"></span>
        ${estado.tipo === 'ativos_pessoa' || estado.tipo === 'fgc' ? '' : `<button type="button" data-rx="periodo"><svg data-lucide="calendar"></svg>${esc(rotuloFiltro())}<svg data-lucide="chevron-down"></svg></button>`}
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
        if (typeof m.ligar === 'function') m.ligar(corpo); // v1.16.0 — linhas tocáveis (ajuste do balanço)
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
        else if (acao === 'ativo') escolherAtivoComercial(); // v1.14.0
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
    } else if (estado.tipo === 'executivo' || estado.tipo === 'investimentos') { // v1.6.0 — o ano (até o mês corrente no ano atual) · v1.13.0
        const a0 = hoje.getFullYear();
        abrirSheetAcoes({ titulo: 'Ano', sub: RELATORIOS[estado.tipo].nome, acoes: [a0, a0 - 1, a0 - 2].map(a => ({
            icone: 'calendar', titulo: String(a), sub: a === a0 ? 'até o mês atual' : 'ano inteiro', aoTocar: () => { estado.filtro.ano = a; carregar(); } })) });
    } else if (estado.tipo === 'balanco_analitico') { // v1.16.0 — um mês ou desde o início
        const ops = Array.from({ length: 12 }, (_, i) => iso(somaMeses(m0, -i)));
        abrirSheetAcoes({ titulo: 'Período', sub: RELATORIOS[estado.tipo].nome, acoes: [
            ...ops.map(c => ({ icone: 'calendar', titulo: comp(c), sub: c === iso(m0) ? 'mês atual · prévia' : '', aoTocar: () => { estado.filtro.competencia = c; carregar(); } })),
            { icone: 'layers', titulo: 'Desde o início', sub: 'todos os itens até hoje', aoTocar: () => { estado.filtro.competencia = null; carregar(); } }] });
    } else if (estado.tipo === 'retiradas') { // v1.3.0 — ano ou todos
        const a0 = hoje.getFullYear();
        const anos = [...new Set([a0, a0 - 1, ...((estado.dados && estado.dados.por_ano) || []).map(x => num(x.ano))])].sort((a, b) => b - a);
        abrirSheetAcoes({ titulo: 'Período', sub: 'Retiradas extraordinárias', acoes: [
            ...anos.map(a => ({ icone: 'calendar', titulo: String(a), sub: a === a0 ? 'ano atual' : '', aoTocar: () => { estado.filtro.ano = a; carregar(); } })),
            { icone: 'layers', titulo: 'Todos os anos', sub: 'desde a primeira retirada', aoTocar: () => { estado.filtro.ano = null; carregar(); } }] });
    } else {
        const ops = Array.from({ length: 12 }, (_, i) => iso(somaMeses(m0, -i)));
        abrirSheetAcoes({ titulo: ehComercial(estado.tipo) ? 'Mês' : 'Competência', sub: RELATORIOS[estado.tipo].nome, acoes: ops.map(c => ({
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
    abrirSheetAcoes({ titulo: 'Ramo', sub: RELATORIOS[estado.tipo].nome, acoes: [
        { icone: 'layers', titulo: estado.tipo === 'investimentos' ? 'Todos os ramos' : 'Consolidado', sub: 'todos os ramos', aoTocar: () => { Object.assign(estado.filtro, { ramo: null, ramoNome: null }); carregar(); } },
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
        : estado.tipo === 'balanco_analitico' ? (estado.filtro.competencia ? estado.filtro.competencia.slice(0, 7) : 'tudo') // v1.16.0
        : estado.tipo === 'ativos_pessoa' ? new Date().toISOString().slice(0, 10)
        : (estado.tipo === 'executivo' || estado.tipo === 'investimentos') ? `${estado.filtro.ramo || (estado.tipo === 'investimentos' ? 'todos' : 'consolidado')}_${estado.filtro.ano}` // v1.6.0 · v1.13.0
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
    if (estado.montado.planilha && !compartilhar.direto) { // v1.14.0 — REL-41: a planilha mora no Compartilhar
        abrirSheetAcoes({ titulo: 'Compartilhar', sub: RELATORIOS[estado.tipo].nome, acoes: [
            { icone: 'share-2', titulo: 'Enviar o resumo', sub: 'Título, números e leitura', aoTocar: () => { compartilhar.direto = true; compartilhar().finally(() => { compartilhar.direto = false; }); } },
            { icone: 'sheet', titulo: 'Baixar a planilha', sub: 'Excel (.xlsx) com as linhas do relatório', aoTocar: () => planilhaComercial() }] });
        return;
    }
    const [l1, l2, l3] = estado.montado.linhas3; // REL-42
    const r = await RaizDevice.share({ titulo: l1, texto: `${l1}\n${l2}\n${l3}` });
    if (r && r.ok === false && r.motivo === 'sem_share') {
        try { await navigator.clipboard.writeText(`${l1}\n${l2}\n${l3}`); rzToast('Resumo copiado'); }
        catch (e) { rzToast('Sem compartilhar aqui. Use PDF.', 'warning'); }
    }
}

export function fecharRelatorioExecutivo() {
    document.getElementById('rz-relexec')?.remove();
    document.getElementById('rz-cad-voltar')?.remove(); // v1.17.0
    if (window.scrollX) window.scrollTo(0, window.scrollY); // v1.11.0 — a página não fica deslocada para o lado
    window.removeEventListener('resize', aplicarVista);
    estado = null;
}

export function abrirRelatorioExecutivo(tipo, opcoes = {}) {
    if (tipo === 'ficha_imovel') return abrirRelatorioFichaImovel(opcoes); // v1.18.0 — tela própria
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
                  ${x.diagnostico ? `<div class="ra-o">⚠ ${esc(x.diagnostico)}</div>` : ''}${num(x.em_aberto_qtd) ? `<div class="ra-o">${num(x.em_aberto_qtd)} em aberto · ${brl(x.em_aberto_valor)}</div>` : ''}</button>`;
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
    // v1.17.0 — ids do banco (F1); sem id (banco antigo), acha pelo nome como antes
    const listaImo = typeof imoveis !== 'undefined' ? imoveis : [], listaCon = typeof contratos !== 'undefined' ? contratos : [];
    const imo = listaImo.find(i => x.imovel_id ? i.id === x.imovel_id : cadNorm(i.nomeExibicao) === cadNorm(x.imovel));
    const conId = x.contrato_id || (x.locatario && imo ? listaCon.find(c => c.imovelId === imo.id && cadNorm(c.locatario) === cadNorm(x.locatario) && c.status !== 'Finalizado')?.id : null) || null;
    const imovelId = x.imovel_id || imo?.id || null;
    const ativoId = x.ativo_id || null;
    const aberto = num(x.em_aberto_qtd);
    const acoes = [];
    if (conId) {
        acoes.push({ icone: 'trending-up', titulo: 'Reajustar', sub: 'Novo valor e vigência', codigo: 'contratos.reajustar', aoTocar: () => { window.lancarReajusteContrato(conId); cadRecarregarAoVoltar(); } });
        acoes.push({ icone: 'user-round-pen', titulo: 'Corrigir o inquilino', sub: 'Nome, CPF/CNPJ e contato', codigo: 'contratos.editar', aoTocar: () => { window.abrirEditarLocatarioContrato(conId); cadRecarregarAoVoltar(); } });
        acoes.push({ icone: 'file-pen', titulo: 'Corrigir o contrato', sub: 'Valor, vencimento, vigência e índice', codigo: 'contratos.editar', aoTocar: () => { Promise.resolve(window.abrirEdicaoContratoContextual(conId, 'relatorio', null)).then(() => window.rzContratoVoltarAoRelatorio?.()); cadRecarregarAoVoltar(); } });
        acoes.push({ icone: 'wallet', titulo: aberto ? `Dar baixa nos recebimentos (${aberto})` : 'Recebimentos do contrato', sub: aberto ? `${brl(x.em_aberto_valor)} em aberto · no Financeiro` : 'No Financeiro', codigo: 'mensal.ver', aoTocar: () => cadRecolher(() => window.abrirFinanceiroDoContrato(conId)) });
        acoes.push({ icone: 'square-check-big', titulo: 'Encerrar o contrato', sub: 'E criar o novo, se for trocar o inquilino', codigo: 'contratos.editar', aoTocar: () => { window.abrirAcaoStatusContrato(conId, 'Finalizado'); cadRecarregarAoVoltar(() => cadDepoisDeEncerrar(conId, imovelId, x.imovel)); } });
    } else if (imovelId) {
        acoes.push({ icone: 'file-plus', titulo: 'Criar contrato neste imóvel', sub: 'O formulário já com o imóvel', codigo: 'contratos.criar', aoTocar: () => cadCriarContrato(imovelId) });
    }
    if (conId || ativoId) acoes.push({ icone: 'paperclip', titulo: 'Anexar documento', sub: conId && ativoId ? 'Ao contrato ou ao imóvel' : conId ? 'Ao contrato' : 'Ao imóvel', codigo: 'cofre.upload', aoTocar: () => cadAnexar(x, conId, ativoId) });
    if (conId) acoes.push({ icone: 'file-text', titulo: 'Abrir o contrato', sub: 'Sai do relatório', aoTocar: () => { fecharRelatorioExecutivo(); cad = null; window.abrirFichaContrato(conId); } });
    const idAtivoAbrir = ativoId || imo?.id;
    if (idAtivoAbrir) acoes.push({ icone: 'building-2', titulo: 'Abrir o imóvel', sub: 'Sai do relatório', aoTocar: () => { fecharRelatorioExecutivo(); cad = null; switchTab('tab-ativos'); window.dispatchEvent(new CustomEvent('cofre:abrir-ativo', { detail: { id: idAtivoAbrir } })); } });
    if (!acoes.length) { rzToast('Não achei este imóvel na lista do app. Abra por Patrimônio.', 'warning'); return; }
    abrirSheetAcoes({ titulo: x.imovel || 'Imóvel', sub: [x.locatario || 'Vago', x.diagnostico].filter(Boolean).join(' · '), acoes });
}
// v1.17.0 — criar contrato no vago: o formulário de sempre; ao salvar, volta ao relatório (contratos.js 1.76.0)
function cadCriarContrato(imovelId) {
    Promise.resolve(window.criarContratoParaImovel(imovelId)).then(() => window.rzContratoVoltarAoRelatorio?.());
    cadRecarregarAoVoltar();
}
// v1.17.0 (Q1) — encerrado, oferece na hora o novo contrato no mesmo imóvel
function cadDepoisDeEncerrar(conId, imovelId, nome) {
    const ainda = (cad?.dados?.linhas || []).some(l => l.contrato_id === conId);
    if (ainda || !imovelId) return;
    abrirSheetAcoes({ titulo: 'Contrato encerrado', sub: nome || 'Imóvel', acoes: [
        { icone: 'file-plus', titulo: 'Criar o novo contrato neste imóvel', sub: 'Para o inquilino certo', codigo: 'contratos.criar', aoTocar: () => cadCriarContrato(imovelId) },
        { icone: 'x', titulo: 'Agora não', aoTocar: () => {} }] });
}
// v1.17.0 — anexar ao contrato ou ao imóvel, no envio de sempre do Cofre (por cima do app; o relatório volta ao salvar)
function cadAnexar(x, conId, ativoId) {
    const ir = (tipo, id, nome) => cadRecolher(async () => {
        let n = 0;
        if (typeof window.rzAbrirUploadContextual !== 'function') switchTab('tab-ativos'); // o envio mora no Cofre: abre uma vez
        while (typeof window.rzAbrirUploadContextual !== 'function' && n++ < 40) await new Promise(r => setTimeout(r, 250));
        if (typeof window.rzAbrirUploadContextual !== 'function') { rzToast('O envio de documento não abriu agora. Tente de novo.', 'warning'); return; }
        window.rzAbrirUploadContextual(tipo, id, nome);
    }, true);
    if (conId && ativoId) abrirSheetAcoes({ titulo: 'Anexar documento', sub: x.imovel || '', acoes: [
        { icone: 'file-text', titulo: 'Ao contrato', sub: x.locatario || 'Contrato', aoTocar: () => ir('contrato', conId, x.locatario || 'Contrato') },
        { icone: 'building-2', titulo: 'Ao imóvel', sub: x.imovel || 'Imóvel', aoTocar: () => ir('ativo', ativoId, x.imovel || 'Imóvel') }] });
    else if (conId) ir('contrato', conId, x.locatario || 'Contrato');
    else ir('ativo', ativoId, x.imovel || 'Imóvel');
}
// v1.17.0 — o relatório se recolhe (fica guardado: filtro, aba e posição) enquanto a pessoa trabalha numa tela do app, com um
// botão fixo "‹ Voltar ao Cadastro"; voltar (ou salvar um documento) reabre o relatório relido.
function cadRecolher(acao, voltaAoSalvarDoc) {
    const el = document.getElementById('rz-relexec'); if (!el || !cad) return;
    const rolagem = el.querySelector('.rx-corpo')?.scrollTop || 0;
    el.style.display = 'none';
    document.getElementById('rz-cad-voltar')?.remove();
    const b = document.createElement('button');
    b.type = 'button'; b.id = 'rz-cad-voltar';
    b.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:calc(76px + env(safe-area-inset-bottom));z-index:96;min-height:44px;padding:10px 18px;border-radius:999px;border:0;background:var(--pine,#1e3a32);color:#fff;font:600 14px Inter,system-ui,sans-serif;box-shadow:0 4px 16px rgba(23,33,30,.25);display:inline-flex;align-items:center;gap:6px;cursor:pointer';
    b.innerHTML = '<svg data-lucide="chevron-left" style="width:18px;height:18px"></svg>Voltar ao Cadastro';
    const voltar = () => {
        b.remove(); window.removeEventListener('cofre:recarregar-documentos', aoDoc);
        const r = document.getElementById('rz-relexec'); if (!r || !cad) return;
        r.style.display = '';
        cad.partesIds = null;
        cadCarregar().then(() => { const c = r.querySelector('.rx-corpo'); if (c) c.scrollTop = rolagem; });
    };
    const aoDoc = () => setTimeout(voltar, 400);
    b.addEventListener('click', voltar);
    if (voltaAoSalvarDoc) window.addEventListener('cofre:recarregar-documentos', aoDoc, { once: true });
    document.body.appendChild(b);
    if (typeof rzIcones === 'function') rzIcones();
    try { acao(); } catch (e) { console.error('[rz] cadastro › ação', e); }
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
function cadRecarregarAoVoltar(depois) { // v1.17.0 — também espera o formulário de contrato fechar; depois: roda após reler
    let vezes = 0;
    const formAberto = () => { const w = document.getElementById('form-contrato-wrapper'); return !!w && !w.classList.contains('hidden'); };
    const t = setInterval(() => {
        vezes++;
        if (!cad || vezes > 600) { clearInterval(t); return; }
        if (!acompSheetAberto() && !formAberto() && vezes > 1) {
            clearInterval(t); cad.partesIds = null;
            cadCarregar().then(() => { if (typeof depois === 'function') depois(); });
        }
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

// =====================================================================
// v1.18.0 (25/11/2026, demanda bf8ab9a9) — FICHA FINANCEIRA DO IMÓVEL (rel.ficha_imovel)
// O ano de cada imóvel: a receber, recebido, atraso, taxa, despesas, investimentos e resultado; cadastro, contrato vigente,
// inadimplência, parte de cada proprietário (sem os repasses, pedido do Nicola 23:24) e administradoras.
// Números da fn_relatorio_ficha_imovel (REL-02: o app só formata). Abre pela ponte abrirRelatorioExecutivo('ficha_imovel').
// =====================================================================
const FICHA_CODIGO = 'relatorios.ficha_imovel';
let ficha = null; // { ano, emp, imovel, prop, soAtraso, aba, abertoId, dados }
const FICHA_CSS = `
 #rz-relexec .rf-k{display:grid;grid-template-columns:1fr 1fr;gap:8px}
 @media(min-width:720px){#rz-relexec .rf-k{grid-template-columns:repeat(3,1fr)}}
 #rz-relexec .rf-sp{display:flex;align-items:flex-end;gap:2px;height:22px;margin-top:6px}
 #rz-relexec .rf-sp i{flex:1;background:var(--line,#e6e3da);border-radius:2px;position:relative;overflow:hidden}
 #rz-relexec .rf-sp i.at{background:#f0d0cb}
 #rz-relexec .rf-sp i u{position:absolute;left:0;right:0;bottom:0;background:var(--sprout,#2f6a51)}
 #rz-relexec .rf-c{background:var(--card,#fff);border:1px solid var(--line,#e6e3da);border-radius:12px;padding:12px}
 #rz-relexec .rf-c h4{margin:0 0 8px;font-size:var(--fs-sec);color:var(--pine,#1e3a32)}
 #rz-relexec .rf-kv{display:grid;grid-template-columns:1fr 1fr;gap:6px 10px;font-size:var(--fs-sec)}
 #rz-relexec .rf-kv small{display:block;color:var(--muted,#6f7a76);font-size:var(--fs-mini)}
 #rz-relexec .rf-t{width:100%;border-collapse:collapse;font-size:var(--fs-min);font-variant-numeric:tabular-nums}
 #rz-relexec .rf-t th{color:var(--muted,#6f7a76);font-weight:600;text-align:right;padding:4px 3px;border-bottom:1px solid var(--line,#e6e3da)}
 #rz-relexec .rf-t td{text-align:right;padding:4px 3px;border-bottom:1px solid var(--line,#e6e3da)}
 #rz-relexec .rf-t th:first-child,#rz-relexec .rf-t td:first-child{text-align:left}
 #rz-relexec .rf-t tr.tot td{font-weight:700;border-top:2px solid var(--pine,#1e3a32)}
 #rz-relexec .rf-n{color:var(--danger,#c1463a)}`;
const MES_CURTO = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const nBr = v => Math.round(num(v)).toLocaleString('pt-BR');
const kBrl = v => { const a = Math.abs(num(v)); const s = a >= 1e6 ? (a / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + ' mi' : a >= 1e3 ? (a / 1e3).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mil' : a.toLocaleString('pt-BR', { maximumFractionDigits: 0 }); return (num(v) < 0 ? '− ' : '') + 'R$ ' + s; };
function fichaTot(im) {
    const t = { a_receber: 0, recebido: 0, taxa: 0, atraso: 0, despesas: 0, invest: 0, outras_entr: 0 };
    (im.meses || []).forEach(m => Object.keys(t).forEach(k => { t[k] += num(m[k]); }));
    t.resultado = t.recebido + t.outras_entr - t.taxa - t.despesas;
    return t;
}
function fichaImoveis() {
    const L = (ficha.dados?.imoveis || []).map(im => ({ ...im, tot: fichaTot(im) }));
    return L.filter(i => (!ficha.emp || i.emp === ficha.emp) && (!ficha.imovel || i.id === ficha.imovel)
        && (!ficha.prop || (i.props || []).some(p => p.nome === ficha.prop)) && (!ficha.soAtraso || i.tot.atraso > 0.99));
}
function fichaSoma(L, k) { return L.reduce((s, i) => s + num(i.tot[k]), 0); }
function fichaKpis(t) {
    const itens = [['A receber', t.a_receber], ['Recebido', t.recebido], ['Em atraso', t.atraso, 1], ['Taxa + despesas', t.taxa + t.despesas], ['Investimentos', t.invest], ['Resultado', t.resultado]];
    return `<div class="ra-k rf-k">${itens.map(([r, v, n]) => `<div class="${n && v > 0.99 ? 'neg' : ''}"><small>${r}</small><b>${kBrl(v)}</b></div>`).join('')}</div>`;
}
function fichaTelaHtml() {
    const filtro = [ficha.emp, ficha.imovel ? (ficha.dados?.imoveis || []).find(i => i.id === ficha.imovel)?.nome : null, ficha.prop].filter(Boolean).join(' · ') || 'Todos';
    return `<div class="rx-top">
        <button type="button" class="rx-voltar" data-rf="fechar" aria-label="Voltar para Relatórios"><svg data-lucide="chevron-left"></svg>Relatórios</button>
        <span class="rx-sp"></span>
        <button type="button" data-rf="ano"><svg data-lucide="calendar"></svg>${ficha.ano}<svg data-lucide="chevron-down"></svg></button>
        <button type="button" data-rf="filtro"><svg data-lucide="filter"></svg>${esc(filtro)}<svg data-lucide="chevron-down"></svg></button>
      </div>
      <div class="rx-corpo" aria-live="polite"><div class="rx-msg">Montando a ficha financeira…</div></div>
      <div class="rx-pe"><button type="button" class="rx-sec" data-rf="compartilhar"><svg data-lucide="share-2"></svg>Compartilhar</button><button type="button" class="rx-pri" data-rf="planilha"><svg data-lucide="sheet"></svg>Exportar planilha</button></div>`;
}
function fichaListaHtml() {
    const L = fichaImoveis();
    const t = { a_receber: fichaSoma(L, 'a_receber'), recebido: fichaSoma(L, 'recebido'), atraso: fichaSoma(L, 'atraso'), taxa: fichaSoma(L, 'taxa'), despesas: fichaSoma(L, 'despesas'), invest: fichaSoma(L, 'invest'), resultado: fichaSoma(L, 'resultado') };
    const nInad = L.reduce((s, i) => s + (i.inad || []).length, 0);
    const tabs = `<div class="ra-tabs">${[['im', `Imóveis ${L.length}`], ['inad', `Atrasos ${nInad}`], ['prop', 'Donos e %'], ['adm', 'Adm.']]
        .map(([c, r]) => `<button type="button" data-rf-aba="${c}" class="${ficha.aba === c ? 'on' : ''}">${esc(r)}</button>`).join('')}</div>`;
    const chips = `<div class="ra-f"><button type="button" data-rf-f="atraso" class="${ficha.soAtraso ? 'on' : ''}">Só com atraso</button></div>`;
    let lista = '';
    if (!L.length) lista = `<div class="ra-v">Nenhum imóvel com esses filtros.</div>`;
    else if (ficha.aba === 'im') {
        let g = null;
        L.forEach(i => {
            if (i.emp !== g) { g = i.emp; lista += `<div class="ra-g">${esc(g)} · ${L.filter(x => x.emp === g).length}</div>`; }
            const mx = Math.max(1, ...(i.meses || []).map(m => num(m.a_receber)));
            const sp = (i.meses || []).map(m => `<i class="${num(m.atraso) > 0.99 ? 'at' : ''}" style="height:${Math.max(2, num(m.a_receber) / mx * 22)}px"><u style="height:${num(m.a_receber) ? Math.min(100, num(m.recebido) / num(m.a_receber) * 100) : 0}%"></u></i>`).join('');
            const ct = i.contrato;
            lista += `<button type="button" class="ra-l" data-rf-im="${esc(i.id)}"><div class="ra-l1"><b>${esc(i.nome)}</b><span>${ct && ct.valor ? brl(ct.valor) + '/mês' : ''}</span></div>
              <div class="ra-l2"><span>${ct ? esc(ct.locatario || '—') + (ct.adm ? ' · ' + esc(String(ct.adm).split(' ')[0]) : '') : 'Sem contrato'}</span><span>${esc((i.props || []).map(p => String(p.nome || '').split(' ')[0] + (num(p.pct) < 100 ? ' ' + num(p.pct) + '%' : '')).join(', '))}</span></div>
              <div class="rf-sp">${sp}</div>
              <div class="ra-l2"><span>recebido ${kBrl(i.tot.recebido)}${i.tot.atraso > 0.99 ? ` · <span class="n">atraso ${kBrl(i.tot.atraso)}</span>` : ''}</span><span>resultado ${kBrl(i.tot.resultado)}</span></div></button>`;
        });
    } else if (ficha.aba === 'inad') {
        const por = {};
        L.forEach(i => (i.inad || []).forEach(x => { const k = i.id + '|' + (x.locatario || ''); const r = por[k] = por[k] || { id: i.id, im: i.nome, loc: x.locatario, n: 0, v: 0, d: 0 }; r.n++; r.v += num(x.valor); r.d = Math.max(r.d, num(x.dias)); }));
        const rows = Object.values(por).sort((a, b) => b.v - a.v);
        lista = rows.length ? rows.map(x => `<button type="button" class="ra-l" data-rf-im="${esc(x.id)}"><div class="ra-l1"><b>${esc(x.loc || '—')}</b><span class="rf-n">${brl(x.v)}</span></div>
            <div class="ra-l2"><span>${esc(x.im)}</span><span>${x.n} ${x.n > 1 ? 'meses' : 'mês'} · mais antigo há ${x.d} dias</span></div></button>`).join('')
            + `<p class="ra-n">Meses da carga inicial ainda não ligados ao extrato aparecem aqui: concilie para tirar os que já foram pagos.</p>`
            : `<div class="ra-v">Nada em atraso.</div>`;
    } else if (ficha.aba === 'prop') {
        const P = {};
        L.forEach(i => (i.props || []).forEach(p => { if (ficha.prop && p.nome !== ficha.prop) return; const r = P[p.nome] = P[p.nome] || { n: p.nome, im: 0, parte: 0 }; r.im++; r.parte += i.tot.resultado * num(p.pct) / 100; }));
        lista = Object.values(P).sort((a, b) => b.parte - a.parte).map(r => `<div class="ra-l" style="cursor:default"><div class="ra-l1"><b>${esc(r.n || '—')}</b><span>${brl(r.parte)}</span></div>
            <div class="ra-l2"><span>${r.im} ${r.im > 1 ? 'imóveis' : 'imóvel'}</span><span>parte no resultado</span></div></div>`).join('')
            + `<p class="ra-n">Parte no resultado = resultado de cada imóvel × % do proprietário.</p>`;
    } else {
        const A = {};
        L.forEach(i => { const a = i.contrato?.adm; if (!a) return; const r = A[a] = A[a] || { n: a, c: 0, b: 0, t: 0 }; r.c++; r.b += i.tot.recebido; r.t += i.tot.taxa; });
        const rows = Object.values(A);
        lista = rows.length ? rows.map(r => `<div class="ra-l" style="cursor:default"><div class="ra-l1"><b>${esc(r.n)}</b><span>${brl(r.b - r.t)}</span></div>
            <div class="ra-l2"><span>${r.c} ${r.c > 1 ? 'contratos' : 'contrato'} · bruto ${brl(r.b)}</span><span>taxa ${brl(r.t)} (${r.b ? (r.t / r.b * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) : 0}%)</span></div></div>`).join('')
            : `<div class="ra-v">Nenhum imóvel com administradora neste filtro.</div>`;
    }
    return `<div class="ra">${fichaKpis(t)}${tabs}${ficha.aba === 'im' || ficha.aba === 'inad' ? chips : ''}${lista}<p class="ra-n">Recebido é o valor bruto; a taxa da administradora sai à parte. Investimentos (compra e benfeitorias) ficam fora do resultado.</p></div>`;
}
function fichaImovelHtml(id) {
    const i = fichaImoveis().find(x => x.id === id) || (ficha.dados?.imoveis || []).map(x => ({ ...x, tot: fichaTot(x) })).find(x => x.id === id);
    if (!i) return `<div class="ra-v">Imóvel não encontrado.</div>`;
    const t = i.tot, ct = i.contrato, hoje = String(ficha.dados?.hoje || '');
    const linhas = (i.meses || []).map((m, k) => [num(m.a_receber), num(m.recebido), num(m.atraso), num(m.taxa) + num(m.despesas), num(m.recebido) + num(m.outras_entr) - num(m.taxa) - num(m.despesas), num(m.invest)])
        .map((v, k) => v.some(x => Math.abs(x) > 0.004) ? `<tr><td>${MES_CURTO[k]}</td><td>${nBr(v[0])}</td><td>${nBr(v[1])}</td><td class="${v[2] > 0.99 ? 'rf-n' : ''}">${v[2] > 0.99 ? nBr(v[2]) : '—'}</td><td>${v[3] ? nBr(v[3]) : '—'}</td><td>${nBr(v[4])}</td></tr>` : '').join('');
    const kv = (r, v) => `<div><small>${r}</small>${v}</div>`;
    return `<div class="ra">
      <button type="button" class="ra-l" data-rf-voltar="1" style="cursor:pointer"><div class="ra-l1"><b>‹ ${esc(i.nome)}</b><span>${ficha.ano}</span></div><div class="ra-l2"><span>${esc(i.emp)}</span><span>voltar à lista</span></div></button>
      ${fichaKpis(t)}
      <div class="rf-c"><h4>Cadastro do imóvel</h4><div class="rf-kv">${kv('Endereço', esc(i.endereco || '—'))}${kv('Situação', esc(SIT_ATIVO[i.situacao] || i.situacao || '—'))}
        ${kv('Área', i.area ? esc(String(i.area)) + ' m²' : '—')}${kv('Valor de referência', i.valor_ref ? brl(i.valor_ref) : '—')}
        <div style="grid-column:1/3"><small>Proprietários</small>${esc((i.props || []).map(p => `${p.nome} ${num(p.pct)}%`).join(' · ') || '—')}</div></div></div>
      <div class="rf-c"><h4>Contrato vigente</h4>${ct ? `<div class="rf-kv">${kv('Locatário', esc(ct.locatario || '—') + (ct.cpf ? `<br><span class="ra-n">${esc(ct.cpf)}</span>` : ''))}${kv('Aluguel', `${brl(ct.valor)} · dia ${esc(String(ct.venc || '—'))}`)}
        ${kv('Vigência', `${ct.inicio ? dma(ct.inicio) : '—'} a ${ct.fim ? dma(ct.fim) : '—'}${ct.fim && ct.fim < hoje ? ' <span class="rf-n">· vencida</span>' : ''}`)}${kv('Reajuste', esc(ct.reajuste || '—'))}
        ${kv('Administradora', esc(ct.adm || 'Não tem'))}${kv('Fiador', esc((ct.fiadores || []).join(', ') || '—'))}
        ${kv('Contato', esc(ct.contato || '—') + (ct.zap ? ' · ' + esc(ct.zap) : ''))}${kv('Outros pagadores', esc((ct.pagadores || []).join(', ') || '—'))}</div>` : `<div class="ra-v">Sem contrato vigente.</div>`}</div>
      <div class="rf-c"><h4>Mês a mês <span class="ra-n">(R$)</span></h4><table class="rf-t"><tr><th>Mês</th><th>Previsto</th><th>Recebido</th><th>Atraso</th><th>Taxa+desp.</th><th>Result.</th></tr>${linhas}
        <tr class="tot"><td>Ano</td><td>${nBr(t.a_receber)}</td><td>${nBr(t.recebido)}</td><td class="rf-n">${t.atraso > 0.99 ? nBr(t.atraso) : '—'}</td><td>${nBr(t.taxa + t.despesas)}</td><td>${nBr(t.resultado)}</td></tr></table></div>
      <div class="rf-c"><h4>Despesas e investimentos</h4>${t.taxa || Object.keys(i.desp_cat || {}).length || t.invest ? `<div class="rf-kv">
        ${t.taxa ? kv('Taxa da administradora', brl(t.taxa)) : ''}${Object.entries(i.desp_cat || {}).map(([k, v]) => kv(esc(k), brl(v))).join('')}${t.invest ? kv('Investimentos (fora do resultado)', brl(t.invest)) : ''}</div>`
        : `<div class="ra-v">Nenhuma despesa ligada a este imóvel no ano.</div>`}</div>
      <div class="rf-c"><h4>Em atraso</h4>${(i.inad || []).length ? (i.inad || []).map(x => `<div class="ra-l1" style="font-size:var(--fs-min);padding:3px 0"><span>${esc(comp(x.comp))} · venceu ${dma(x.venc)} · ${num(x.dias)} dias</span><span class="rf-n">${brl(x.valor)}</span></div>`).join('') : `<div class="ra-v">Nada em atraso.</div>`}</div>
      <div class="rf-c"><h4>Parte de cada proprietário</h4>${(i.props || []).map(p => `<div class="ra-l1" style="font-size:var(--fs-min);padding:3px 0"><span>${esc(p.nome || '—')} · ${num(p.pct)}%</span><span>${brl(t.resultado * num(p.pct) / 100)}</span></div>`).join('') || '—'}</div>
    </div>`;
}
function fichaDesenhar() {
    const corpo = document.querySelector('#rz-relexec .rx-corpo'); if (!corpo || !ficha?.dados) return;
    corpo.innerHTML = ficha.abertoId ? fichaImovelHtml(ficha.abertoId) : fichaListaHtml();
    corpo.scrollTop = 0;
    corpo.querySelectorAll('[data-rf-aba]').forEach(b => b.addEventListener('click', () => { ficha.aba = b.dataset.rfAba; fichaDesenhar(); }));
    corpo.querySelectorAll('[data-rf-f]').forEach(b => b.addEventListener('click', () => { ficha.soAtraso = !ficha.soAtraso; fichaDesenhar(); }));
    corpo.querySelectorAll('[data-rf-im]').forEach(b => b.addEventListener('click', () => { ficha.abertoId = b.dataset.rfIm; fichaDesenhar(); }));
    corpo.querySelectorAll('[data-rf-voltar]').forEach(b => b.addEventListener('click', () => { ficha.abertoId = null; fichaDesenhar(); }));
}
async function fichaCarregar() {
    const el = document.getElementById('rz-relexec'); if (!el || !ficha) return;
    el.innerHTML = fichaTelaHtml();
    el.querySelectorAll('[data-rf]').forEach(b => b.addEventListener('click', () => fichaAcao(b.dataset.rf)));
    if (typeof rzIcones === 'function') rzIcones();
    const corpo = el.querySelector('.rx-corpo');
    try {
        const [{ data, error }, quem] = await Promise.all([dbAuth.rpc('fn_relatorio_ficha_imovel', { p_cliente_id: CLIENTE_ID_SUPABASE, p_ano: ficha.ano }), quemGera()]);
        if (error) throw new Error(error.message);
        if (!data?.ok) throw new Error('O relatório não veio.');
        ficha.dados = { ...data, gerado_por: quem };
        fichaDesenhar();
    } catch (e) {
        console.error('[rz] ficha do imóvel', e);
        corpo.innerHTML = `<div class="rx-msg">Não foi possível montar a ficha financeira.<br><small>${esc(e.message || e)}</small></div>`;
    }
}
function fichaAcao(a) {
    if (a === 'fechar') { fecharRelatorioExecutivo(); ficha = null; return; }
    if (a === 'ano') {
        const y = new Date().getFullYear();
        abrirSheetAcoes({ titulo: 'Ano', sub: 'Ficha financeira do imóvel', acoes: [y, y - 1, y - 2, y - 3].map(n => ({ icone: 'calendar', titulo: String(n), aoTocar: () => { ficha.ano = n; ficha.abertoId = null; fichaCarregar(); } })) });
    } else if (a === 'filtro') {
        const D = ficha.dados?.imoveis || [];
        const emps = [...new Set(D.map(i => i.emp))].sort(), props = [...new Set(D.flatMap(i => (i.props || []).map(p => p.nome)).filter(Boolean))].sort();
        const redes = () => { ficha.abertoId = null; fichaCarregarTopo(); fichaDesenhar(); };
        abrirSheetAcoes({ titulo: 'Filtrar', sub: 'Ficha financeira do imóvel', acoes: [
            { icone: 'layers', titulo: 'Tudo', sub: 'Tira os filtros', aoTocar: () => { Object.assign(ficha, { emp: null, imovel: null, prop: null }); redes(); } },
            { icone: 'building-2', titulo: 'Empreendimento', sub: ficha.emp || 'Todos', aoTocar: () => setTimeout(() => abrirSheetAcoes({ titulo: 'Empreendimento', acoes: emps.map(e => ({ icone: 'building-2', titulo: e, aoTocar: () => { Object.assign(ficha, { emp: e, imovel: null }); redes(); } })) }), 250) },
            { icone: 'home', titulo: 'Imóvel', sub: ficha.imovel ? (D.find(i => i.id === ficha.imovel)?.nome || '') : 'Todos', aoTocar: () => setTimeout(() => abrirSheetAcoes({ titulo: 'Imóvel', acoes: D.filter(i => !ficha.emp || i.emp === ficha.emp).map(i => ({ icone: 'home', titulo: i.nome, sub: i.emp, aoTocar: () => { ficha.imovel = i.id; redes(); } })) }), 250) },
            { icone: 'user', titulo: 'Proprietário', sub: ficha.prop || 'Todos', aoTocar: () => setTimeout(() => abrirSheetAcoes({ titulo: 'Proprietário', acoes: props.map(p => ({ icone: 'user', titulo: p, aoTocar: () => { ficha.prop = p; redes(); } })) }), 250) },
        ] });
    } else if (a === 'planilha') baixarPlanilhaFichaImovel();
    else if (a === 'compartilhar') fichaCompartilhar();
}
function fichaCarregarTopo() {
    const el = document.getElementById('rz-relexec'); if (!el) return;
    const top = el.querySelector('.rx-top'); if (!top) return;
    const tmp = document.createElement('div'); tmp.innerHTML = fichaTelaHtml();
    top.replaceWith(tmp.querySelector('.rx-top'));
    el.querySelectorAll('.rx-top [data-rf]').forEach(b => b.addEventListener('click', () => fichaAcao(b.dataset.rf)));
    if (typeof rzIcones === 'function') rzIcones();
}
async function fichaCompartilhar() {
    const L = fichaImoveis(); if (!ficha?.dados) return;
    const l1 = `Ficha financeira dos imóveis · ${ficha.ano} · ${ficha.dados.empresa || ''}`;
    const l2 = `A receber ${brl(fichaSoma(L, 'a_receber'))} · recebido ${brl(fichaSoma(L, 'recebido'))} · em atraso ${brl(fichaSoma(L, 'atraso'))}`;
    const l3 = `Resultado ${brl(fichaSoma(L, 'resultado'))} · ${L.length} imóveis`;
    const r = await RaizDevice.share({ titulo: l1, texto: `${l1}\n${l2}\n${l3}` });
    if (r && r.ok === false && r.motivo === 'sem_share') {
        try { await navigator.clipboard.writeText(`${l1}\n${l2}\n${l3}`); rzToast('Resumo copiado'); } catch (e) { rzToast('Use a planilha.', 'warning'); }
    }
}
export function abrirRelatorioFichaImovel(opcoes = {}) {
    if (rzMostrarBloqueio(FICHA_CODIGO)) return; // ACE-04
    garantirCss();
    if (!document.getElementById('rz-relacomp-css')) { const st = document.createElement('style'); st.id = 'rz-relacomp-css'; st.textContent = ACOMP_CSS; document.head.appendChild(st); }
    if (!document.getElementById('rz-relficha-css')) { const st = document.createElement('style'); st.id = 'rz-relficha-css'; st.textContent = FICHA_CSS; document.head.appendChild(st); }
    fecharRelatorioExecutivo();
    ficha = { ano: opcoes.ano || new Date().getFullYear(), emp: null, imovel: null, prop: null, soAtraso: false, aba: 'im', abertoId: null, dados: null };
    const el = document.createElement('div');
    el.id = 'rz-relexec'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'Ficha financeira do imóvel');
    document.body.appendChild(el);
    fichaCarregar();
}
async function baixarArquivoPlanilha(buf, nome) {
    const url = URL.createObjectURL(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
    const a = document.createElement('a'); a.href = url; a.download = nome; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    rzToast('Planilha baixada');
}
async function baixarPlanilhaFichaImovel() {
    const d = ficha?.dados; if (!d) return;
    rzToast('Montando a planilha…');
    try {
        const ExcelJS = await carregarExcelJs();
        const empresa = d.empresa || 'Empresa', quem = d.gerado_por || '';
        const agora = new Date(), p2 = n => String(n).padStart(2, '0');
        const quando = `${p2(agora.getDate())}/${p2(agora.getMonth() + 1)}/${agora.getFullYear()} às ${p2(agora.getHours())}:${p2(agora.getMinutes())}`;
        const L = fichaImoveis();
        const recorte = `ano ${ficha.ano} · ${[ficha.emp, ficha.prop].filter(Boolean).join(' · ') || 'todos os imóveis'}${ficha.soAtraso ? ' · só com atraso' : ''}`;
        const F = (sz = 9, b = false, cor = CC.ink, i = false) => ({ name: 'Arial', size: sz, bold: b, italic: i, color: { argb: cor } });
        const fundo = c => ({ type: 'pattern', pattern: 'solid', fgColor: { argb: c } });
        const fio = { style: 'thin', color: { argb: CC.line } }, med = { style: 'medium', color: { argb: CC.pine } };
        const MO = '#,##0.00;[Red]-#,##0.00', DT = 'dd/mm/yyyy';
        const png = await simboloPng();
        const wb = new ExcelJS.Workbook(); wb.creator = 'Raiz Patrimônio'; wb.title = `Ficha financeira do imóvel · ${empresa}`; wb.created = agora;
        wb.calcProperties = { fullCalcOnLoad: true };
        const topo = (ws, titulo, nc) => {
            ws.getRow(1).height = 30;
            ws.getCell('A1').value = empresa; ws.getCell('A1').font = F(18, true, CC.pine);
            ws.getCell('A2').value = titulo; ws.getCell('A2').font = F(12, true);
            ws.getCell('A3').value = `${recorte} · gerado em ${quando}${quem ? ' por ' + quem : ''}`; ws.getCell('A3').font = F(9, false, CC.muted);
            const cm = Math.max(3, nc - 1);
            if (png) { const id = wb.addImage({ base64: png, extension: 'png' }); ws.addImage(id, { tl: { col: cm - 1, row: 0 }, ext: { width: 30, height: 38 } }); }
            ws.getCell(1, cm + 1).value = 'Raiz'; ws.getCell(1, cm + 1).font = F(12, true, CC.pine);
            ws.getCell(2, cm + 1).value = 'Patrimônio'; ws.getCell(2, cm + 1).font = F(8, true, CC.sprout);
            ws.headerFooter.oddFooter = `&L&8${titulo.replace(/&/g, '&&')} · ${empresa.replace(/&/g, '&&')} · gerado em ${quando}&R&8Página &P de &N`;
        };
        const kpis = (ws, itens, nc) => itens.forEach(([rot, formula, fmt], i) => {
            const c0 = 1 + i * 2, a = ws.getCell(5, c0), b = ws.getCell(6, c0);
            if ((ws.getColumn(c0).width || 0) < 15) ws.getColumn(c0).width = 15;
            a.value = rot; a.font = F(8, false, CC.muted); b.value = { formula }; b.font = F(14, true, CC.pine); b.numFmt = fmt; b.alignment = { horizontal: 'left' };
            [5, 6].forEach(rr => [c0, c0 + 1].forEach(cc => { if (cc <= Math.max(nc, 8)) ws.getCell(rr, cc).fill = fundo(CC.paper); }));
        });
        const tabela = (ws, HDR, cols, linhas, o = {}) => {
            cols.forEach((c, i) => {
                ws.getColumn(i + 1).width = c[1];
                const cl = ws.getCell(HDR, i + 1); cl.value = c[0]; cl.font = F(9, true, c[4]?.edit ? CC.brassTx : CC.pine); cl.fill = fundo(c[4]?.edit ? CC.brassBg : CC.paper);
                cl.alignment = { wrapText: true, vertical: 'middle', horizontal: c[2] && c[2] !== DT ? 'right' : 'left' }; cl.border = { bottom: med };
            });
            ws.getRow(HDR).height = 32;
            const INI = HDR + 1, FIM = Math.max(INI, INI + linhas.length - 1);
            linhas.forEach((r, k) => cols.forEach((c, i) => {
                const cl = ws.getCell(INI + k, i + 1); const v = c[3](r, INI + k);
                if (v && typeof v === 'object' && v.formula) cl.value = v; else if (c[2] === DT) cl.value = dataXl(v); else if (c[2]) cl.value = nOuNulo(v); else cl.value = tOuNulo(v);
                cl.font = F(9); cl.border = { bottom: fio }; if (c[2]) cl.numFmt = c[2];
                if (c[2] && c[2] !== DT) cl.alignment = { horizontal: 'right' };
                if (c[4]?.edit) { cl.fill = fundo(CC.brassBg); cl.font = F(9, false, CC.brassTx); } else if (k % 2 === 1) cl.fill = fundo(CC.zebra);
                if (c[4]?.alerta && c[4].alerta(r)) cl.font = F(9, true, CC.danger);
            }));
            ws.autoFilter = { from: { row: HDR, column: 1 }, to: { row: FIM, column: cols.length } };
            ws.views = [{ state: 'frozen', xSplit: o.xSplit || 0, ySplit: HDR, showGridLines: false }];
            const TR = FIM + 1;
            ws.getCell(TR, 1).value = 'Total'; ws.getCell(TR, 1).font = F(9, true);
            cols.forEach((c, i) => { const cl = ws.getCell(TR, i + 1); cl.border = { top: med };
                if (c[4]?.total) { const Lc = colLetra(i + 1); cl.value = { formula: `SUBTOTAL(9,${Lc}${INI}:${Lc}${FIM})` }; cl.numFmt = c[2]; cl.font = F(9, true); cl.alignment = { horizontal: 'right' }; } });
            ws.pageSetup = { orientation: cols.length > 6 ? 'landscape' : 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0, printTitlesRow: `${HDR}:${HDR}` };
            return { INI, FIM, TR };
        };
        const fonte = (ws, row) => { ws.getCell(row, 1).value = `Fonte: Raiz · Ficha financeira do imóvel · ${recorte} · situação em ${quando.slice(0, 10)} · Raiz Patrimônio · raizpatrimonio.com.br`; ws.getCell(row, 1).font = F(8, false, CC.muted, true); };
        const ct = i => i.contrato || {};
        // 1. Resumo por imóvel
        const w1 = wb.addWorksheet('Resumo por imóvel');
        const c1 = [
            ['Empreendimento', 16, null, i => i.emp], ['Imóvel', 26, null, i => i.nome], ['Endereço', 30, null, i => i.endereco], ['Área (m²)', 8, '0', i => i.area],
            ['Valor de referência', 13, MO, i => i.valor_ref], ['Proprietários e %', 26, null, i => (i.props || []).map(p => `${p.nome} ${num(p.pct)}%`).join(', ')],
            ['Locatário', 26, null, i => ct(i).locatario], ['CPF/CNPJ', 16, null, i => ct(i).cpf], ['Aluguel atual', 11, MO, i => ct(i).valor], ['Venc.', 6, '0', i => ct(i).venc],
            ['Início', 10, DT, i => ct(i).inicio], ['Fim', 10, DT, i => ct(i).fim], ['Índice', 7, null, i => ct(i).reajuste], ['Administradora', 20, null, i => ct(i).adm],
            ['Fiador', 20, null, i => (ct(i).fiadores || []).join(', ')], ['Outros pagadores', 20, null, i => (ct(i).pagadores || []).join(', ')],
            ['A receber', 12, MO, i => i.tot.a_receber, { total: true }], ['Recebido', 12, MO, i => i.tot.recebido, { total: true }],
            ['Em atraso', 12, MO, i => i.tot.atraso, { total: true, alerta: i => i.tot.atraso > 0.99 }], ['Taxa adm.', 10, MO, i => i.tot.taxa, { total: true }],
            ['Despesas', 10, MO, i => i.tot.despesas, { total: true }], ['Resultado', 12, MO, (i, n) => ({ formula: `R${n}-T${n}-U${n}${i.tot.outras_entr ? '+' + i.tot.outras_entr : ''}` }), { total: true }],
            ['Investimentos', 12, MO, i => i.tot.invest, { total: true }], ['Observação (pode escrever)', 24, null, () => null, { edit: true }],
        ];
        topo(w1, 'Ficha financeira do imóvel · resumo do ano', c1.length);
        const t1 = tabela(w1, 9, c1, L, { xSplit: 2 });
        kpis(w1, [['A receber', `SUBTOTAL(9,Q${t1.INI}:Q${t1.FIM})`, MO], ['Recebido', `SUBTOTAL(9,R${t1.INI}:R${t1.FIM})`, MO], ['Em atraso', `SUBTOTAL(9,S${t1.INI}:S${t1.FIM})`, MO],
                  ['Taxa + despesas', `SUBTOTAL(9,T${t1.INI}:T${t1.FIM})+SUBTOTAL(9,U${t1.INI}:U${t1.FIM})`, MO], ['Resultado', `SUBTOTAL(9,V${t1.INI}:V${t1.FIM})`, MO], ['Investimentos', `SUBTOTAL(9,W${t1.INI}:W${t1.FIM})`, MO]], c1.length);
        fonte(w1, t1.TR + 2);
        // 2. Mês a mês
        const linhasM = [];
        L.forEach(i => (i.meses || []).forEach(m => { if ([m.a_receber, m.recebido, m.despesas, m.invest].some(v => Math.abs(num(v)) > 0.004)) linhasM.push({ i, m }); }));
        const w2 = wb.addWorksheet('Mês a mês');
        const c2 = [['Empreendimento', 16, null, x => x.i.emp], ['Imóvel', 26, null, x => x.i.nome], ['Mês', 9, null, x => `${MES_CURTO[x.m.mes - 1]}/${ficha.ano}`],
            ['A receber', 12, MO, x => x.m.a_receber, { total: true }], ['Recebido', 12, MO, x => x.m.recebido, { total: true }], ['Em atraso', 12, MO, x => x.m.atraso, { total: true }],
            ['Taxa adm.', 10, MO, x => x.m.taxa, { total: true }], ['Despesas', 10, MO, x => x.m.despesas, { total: true }],
            ['Resultado', 12, MO, (x, n) => ({ formula: `E${n}-G${n}-H${n}${num(x.m.outras_entr) ? '+' + num(x.m.outras_entr) : ''}` }), { total: true }], ['Investimentos', 12, MO, x => x.m.invest, { total: true }]];
        topo(w2, 'Ficha financeira do imóvel · mês a mês', c2.length);
        const t2 = tabela(w2, 9, c2, linhasM, { xSplit: 3 });
        kpis(w2, [['A receber', `SUBTOTAL(9,D${t2.INI}:D${t2.FIM})`, MO], ['Recebido', `SUBTOTAL(9,E${t2.INI}:E${t2.FIM})`, MO], ['Resultado', `SUBTOTAL(9,I${t2.INI}:I${t2.FIM})`, MO]], c2.length);
        fonte(w2, t2.TR + 2);
        // 3. Inadimplência
        const linhasI = []; L.forEach(i => (i.inad || []).forEach(x => linhasI.push({ i, x }))); linhasI.sort((a, b) => num(b.x.dias) - num(a.x.dias));
        const w3 = wb.addWorksheet('Inadimplência');
        const c3 = [['Empreendimento', 16, null, r => r.i.emp], ['Imóvel', 26, null, r => r.i.nome], ['Locatário', 28, null, r => r.x.locatario], ['Competência', 11, null, r => comp(r.x.comp)],
            ['Vencimento', 11, DT, r => r.x.venc], ['Dias em atraso', 9, '0', r => r.x.dias], ['Valor', 12, MO, r => r.x.valor, { total: true }],
            ['Faixa', 14, null, (r, n) => ({ formula: `IF(F${n}>90,"mais de 90 dias",IF(F${n}>30,"31 a 90 dias","até 30 dias"))` })], ['O que foi feito (pode escrever)', 28, null, () => null, { edit: true }]];
        topo(w3, 'Ficha financeira do imóvel · inadimplência', c3.length);
        const t3 = tabela(w3, 9, c3, linhasI);
        kpis(w3, [['Em atraso', `SUBTOTAL(9,G${t3.INI}:G${t3.FIM})`, MO], ['Meses em aberto', `SUBTOTAL(3,G${t3.INI}:G${t3.FIM})`, '0'], ['Mais de 90 dias', `SUMIF(H${t3.INI}:H${t3.FIM},"mais de 90 dias",G${t3.INI}:G${t3.FIM})`, MO]], c3.length);
        w3.getCell(t3.TR + 2, 1).value = 'Meses da carga inicial ainda não ligados ao extrato aparecem aqui: concilie para tirar os que já foram pagos.'; w3.getCell(t3.TR + 2, 1).font = F(8, false, CC.muted, true);
        fonte(w3, t3.TR + 3);
        // 4. Proprietários (só a parte no resultado) e administradoras
        const P = {}; L.forEach(i => (i.props || []).forEach(p => { if (ficha.prop && p.nome !== ficha.prop) return; const r = P[p.nome] = P[p.nome] || { n: p.nome, im: 0, parte: 0 }; r.im++; r.parte += i.tot.resultado * num(p.pct) / 100; }));
        const w4 = wb.addWorksheet('Proprietários');
        const c4 = [['Proprietário', 30, null, r => r.n], ['Imóveis', 8, '0', r => r.im], ['Parte no resultado', 16, MO, r => r.parte, { total: true }]];
        topo(w4, 'Ficha financeira do imóvel · proprietários', 6);
        const t4 = tabela(w4, 9, c4, Object.values(P).sort((a, b) => b.parte - a.parte));
        w4.getCell(t4.TR + 2, 1).value = 'Parte no resultado = resultado de cada imóvel × % do proprietário.'; w4.getCell(t4.TR + 2, 1).font = F(8, false, CC.muted, true);
        const A = {}; L.forEach(i => { const a = i.contrato?.adm; if (!a) return; const r = A[a] = A[a] || { n: a, c: 0, b: 0, t: 0 }; r.c++; r.b += i.tot.recebido; r.t += i.tot.taxa; });
        const r0 = t4.TR + 5;
        w4.getCell(r0 - 1, 1).value = 'Administradoras'; w4.getCell(r0 - 1, 1).font = F(11, true, CC.pine);
        const c5 = [['Administradora', 30, null, r => r.n], ['Contratos', 8, '0', r => r.c], ['Recebido bruto', 16, MO, r => r.b, { total: true }], ['Taxa', 14, MO, r => r.t, { total: true }],
            ['% da taxa', 10, '0.0%', (r, n) => ({ formula: `IF(C${n}>0,D${n}/C${n},0)` })], ['Líquido repassado', 16, MO, (r, n) => ({ formula: `C${n}-D${n}` }), { total: true }]];
        const t5 = tabela(w4, r0, c5, Object.values(A));
        w4.autoFilter = undefined;
        fonte(w4, t5.TR + 2);
        // 5. Sobre
        const w6 = wb.addWorksheet('Sobre'); w6.views = [{ showGridLines: false }];
        w6.getColumn(1).width = 24; w6.getColumn(2).width = 100;
        w6.getCell('A1').value = 'Sobre esta planilha'; w6.getCell('A1').font = F(14, true, CC.pine);
        [['Para quê', 'O extrato do ano de cada imóvel: a receber, recebido, atrasos, despesas, investimentos, resultado e a parte de cada proprietário.'],
         ['Recebido', 'Valor bruto pago pelo inquilino. A taxa da administradora aparece à parte e sai do resultado.'],
         ['Resultado', 'Recebido − taxa da administradora − despesas do imóvel. Investimentos (compra, sinal, cartório, benfeitorias) ficam fora.'],
         ['Em atraso', 'Meses vencidos e não recebidos. Meses da carga inicial ainda não conciliados podem estar pagos.'],
         ['Proprietários', 'Parte no resultado = resultado de cada imóvel × % do proprietário.'],
         ['Colunas amarelas', 'Para você anotar. A planilha não altera o sistema.'],
         ['LGPD', 'Contém nomes e documentos de locatários. Compartilhe só com quem precisa.']].forEach(([a, b], k) => {
            w6.getCell(3 + k, 1).value = a; w6.getCell(3 + k, 1).font = F(10, true, CC.pine);
            w6.getCell(3 + k, 2).value = b; w6.getCell(3 + k, 2).font = F(10); w6.getCell(3 + k, 2).alignment = { wrapText: true, vertical: 'top' }; w6.getRow(3 + k).height = 30;
        });
        const buf = await wb.xlsx.writeBuffer();
        const nome = `raiz_ficha_financeira_imovel_${String(empresa).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')}_${ficha.ano}.xlsx`;
        await baixarArquivoPlanilha(buf, nome);
    } catch (e) {
        console.error('[rz] planilha da ficha', e);
        rzToast('Não consegui montar a planilha.', 'danger');
    }
}
