// ============================================================================
// investimentos-rv.js — Raiz Patrimônio · Ramo Investimentos · renda variável (ações, BDR, ETF e fundos imobiliários)
// Versão: 1.1.0 · 27/11/2026
//
// v1.1.0 (27/11/2026, sessão 20261127-1730-investimentos-i3a, demanda 885410f9; PLANO_EXECUCAO_I2_I3_I4_INVESTIMENTOS_RAIZ v1.2.0, I3a) —
// o valor da posição usa a cotação do dia (brapi, pela rotina cotacoes-captura) quando ela existe; o card diz "cotação dd/mm" ou
// "último preço".
//
// v1.0.0 (26/11/2026, sessão 20261126-1330-investimentos-i2a, demanda 885410f9; PLANO_EXECUCAO_I2_I3_I4_INVESTIMENTOS_RAIZ v1.2.0,
// I2a, fichas F15–F19 e F27, e PROTOTIPO_INVESTIMENTOS_I2_I4_POSICAO_FGC v1.1.0, telas 4, 5, 7, 8, 9, 11 e 12; de acordo do Nicola
// 26/11 12:12 "Ok com a ficha e protótipo" e 13:24 "Vamos em frente então") — criação.
//   · Nova aplicação de ação ou FII pelo catálogo do tipo (código na bolsa), começando pela posição que já tem (quantidade e preço
//     médio, sem saída de caixa) ou por uma compra.
//   · Card "Posição e custo médio" na ficha: quantidade, preço médio, custo, valor pelo último preço, não realizado, realizado e
//     proventos do ano, e os eventos anunciados com o que fazer.
//   · "Conferir o cálculo": a memória do preço médio evento a evento (fn_rv_posicao), baixar em planilha e ajustar o preço médio.
//   · Registrar movimento: compra, venda (com o resultado), várias compras e vendas de uma vez (fn_rv_eventos_lote, com conferência
//     antes de gravar), evento da posição (emissão, bonificação, desdobramento, grupamento, amortização), anunciado ou feito.
//   · Compra, venda e amortização caem no Financeiro (lançamentos com o mesmo origem_id); tocar na linha abre o evento.
// Chamado por js/investimentos.js (import dinâmico); não mexe no index.
// ============================================================================
export const VERSAO = '1.1.0';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const toast = (m, t) => (typeof mostrarToast === 'function' ? mostrarToast(m, t) : console.log(m));
const icones = () => { if (typeof refrescarIcones === 'function') refrescarIcones(); else if (window.lucide) window.lucide.createIcons(); };
const moeda = (v) => (typeof formatarMoedaBR === 'function' ? formatarMoedaBR(Number(v || 0)) : 'R$ ' + Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
const dataBR = (d) => (d ? String(d).slice(0, 10).split('-').reverse().join('/') : '—');
const hoje = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const db = () => (typeof dbAuth !== 'undefined' ? dbAuth : window.dbAuth);
const sk = (n) => (typeof rzSk === 'function' ? rzSk('linhas', n) : '');
const aviso = (titulo, linhas) => (typeof rzAviso === 'function' ? rzAviso({ titulo, linhas: [].concat(linhas) }) : toast([].concat(linhas).join(' ')));
const qtd = (n) => Number(n || 0).toLocaleString('pt-BR', { maximumFractionDigits: 8 });
const n2 = (n, d = 2) => Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
const sinal = (v) => (Number(v) > 0 ? '+' : Number(v) < 0 ? '−' : '') + moeda(Math.abs(Number(v || 0)));
const campo = (id, rot, html, extra = '') => `<div class="rz-f"${extra}><label for="${id}">${rot}</label>${html}</div>`;
const val = (id) => document.getElementById(id)?.value ?? '';
const numero = (id) => { const v = String(val(id)).trim().replace(',', '.'); return v ? Number(v) : 0; };
const ANO = new Date().getFullYear();

export const ehRV = (cod) => String(cod || '').startsWith('inv_rv_');
export const ICONE_RV = { inv_rv_acao: 'line-chart', inv_rv_fii: 'building-2' };
const unidade = (con, n) => (con?.tipoContrato === 'inv_rv_fii' ? (Number(n) === 1 ? 'cota' : 'cotas') : (Number(n) === 1 ? 'ação' : 'ações'));
const codigo = (con) => con?.dadosModelo?.ticker || con?.descricao || 'Ativo';

const INFO = {
    posicao: ['Posição e custo médio', 'Preço médio = custo ÷ quantidade. A compra soma quantidade × preço + taxas; a venda tira a quantidade pelo preço médio (o preço médio não muda) e a diferença é o resultado. O valor usa a cotação do dia quando existe; sem ela, o último preço negociado.'],
    subscricao: ['Emissão (subscrição)', 'A empresa ou o fundo vende ações ou cotas novas. Quem já tem pode comprar primeiro (direito de preferência), na proporção do que tem e até a data-limite. O que você comprar entra pelo preço da emissão e o preço médio é recalculado.'],
    bonificacao: ['Bonificação', 'A empresa distribui ações novas aos acionistas, sem você pagar. A quantidade sobe e o preço médio cai. Se a empresa informar um custo atribuído por ação, ele soma ao custo (é o que vale para o IR).'],
    desdobramento: ['Desdobramento', 'Cada ação vira mais de uma (fator 2: cada 1 vira 2). A quantidade multiplica pelo fator e o preço médio divide; o custo não muda.'],
    grupamento: ['Grupamento', 'Várias ações viram uma (fator 10: cada 10 viram 1). A quantidade divide pelo fator e o preço médio multiplica; o custo não muda.'],
    amortizacao: ['Amortização (FII)', 'O fundo devolve parte do capital. O valor recebido entra no caixa e baixa o custo; o preço médio cai na mesma proporção.'],
    ajuste: ['Ajustar preço médio', 'Se a corretora mostra outro preço médio, grave um acerto com data. Ele fica na memória do cálculo e os próximos movimentos partem dele.'],
};
const NOME_EV = { posicao_inicial: 'Posição inicial', compra: 'Compra', venda: 'Venda', subscricao: 'Emissão (subscrição)', bonificacao: 'Bonificação',
    desdobramento: 'Desdobramento', grupamento: 'Grupamento', amortizacao: 'Amortização', ajuste_pm: 'Ajuste do preço médio' };
const ICONE_EV = { posicao_inicial: 'flag', compra: 'arrow-down-left', venda: 'arrow-up-right', subscricao: 'git-branch', bonificacao: 'gift',
    desdobramento: 'split', grupamento: 'merge', amortizacao: 'coins', ajuste_pm: 'pencil' };
const infoBtn = (k) => `<button type="button" class="rz-i" data-rv-info="${k}" aria-label="O que é?"><svg data-lucide="info"></svg></button>`;
function ligarInfos(raiz = document) {
    raiz.querySelectorAll('[data-rv-info]').forEach(b => {
        if (b.dataset.rvLigado) return; b.dataset.rvLigado = '1';
        b.addEventListener('click', (ev) => { ev.preventDefault(); ev.stopPropagation(); const t = INFO[b.dataset.rvInfo]; if (t) aviso(t[0], t[1]); });
    });
    icones();
}

// ---------------------------------------------------------------------------------------------------- dados
export async function posicao(contratoId) {
    const { data, error } = await db().rpc('fn_rv_posicao', { p_contrato_id: contratoId });
    if (error) throw error;
    return data || {};
}
async function registrar(con, args) {
    const { data, error } = await db().rpc('fn_rv_evento_registrar', { p_contrato_id: con.id, p_tipo: args.tipo, p_data: args.data,
        p_quantidade: args.quantidade ?? null, p_preco: args.preco ?? null, p_taxas: args.taxas || 0, p_fator: args.fator ?? null, p_valor: args.valor ?? null,
        p_situacao: args.situacao || 'realizado', p_data_limite: args.dataLimite || null, p_observacao: args.obs || null, p_anunciado_id: args.anunciadoId || null });
    if (error) throw error;
    return data;
}
async function excluirEvento(eventoId) {
    const { data, error } = await db().rpc('fn_rv_evento_excluir', { p_evento_id: eventoId });
    if (error) throw error;
    return data;
}

// ---------------------------------------------------------------------------------------------------- ficha (card Posição)
let ctxFicha = null; // { con, aoMudar }
export async function aplicarFichaRV(con, raiz, { aoMudar, abrirRegistrar } = {}) {
    ctxFicha = { con, aoMudar, abrirRegistrar };
    const cond = raiz.querySelector('[data-fc-secao="resumo.condicoes"]');
    if (cond && !raiz.querySelector('#fc-card-apl-pos')) cond.insertAdjacentHTML('beforebegin', `<div class="rz-card" id="fc-card-apl-pos">${sk(4)}</div>`);
    let p = null;
    try { p = await posicao(con.id); } catch (e) {
        const card = raiz.querySelector('#fc-card-apl-pos');
        if (card) card.innerHTML = `<div class="rz-card-h"><h3>Posição e custo médio</h3></div><p class="rz-desc">${esc(e?.message || 'Não consegui ler a posição.')}</p>`;
        return;
    }
    const faixa = raiz.querySelector('.rz-fc-faixa');
    if (faixa) faixa.innerHTML = `<div><small>Quantidade</small><b>${esc(qtd(p.quantidade))}</b></div>
        <div><small>Preço médio</small><b>${esc(moeda(p.pm))}</b></div>
        <div><small>Valor</small><b>${esc(moeda(p.valor).replace(/,00$/, ''))}</b></div>`;
    desenharPosicao(con, p);
}
function desenharPosicao(con, p) {
    const card = document.getElementById('fc-card-apl-pos'); if (!card) return;
    const temEventos = (p.memoria || []).length > 0, q = Number(p.quantidade || 0);
    const aberto = Number(p.valor || 0) - Number(p.custo || 0);
    const pctAberto = Number(p.custo) > 0 ? ` (${aberto >= 0 ? '+' : '−'}${n2(Math.abs(aberto / Number(p.custo) * 100), 2)}%)` : '';
    const anunciados = p.anunciados || [];
    const linhaAnuncio = (e, i) => `<div class="rz-row rz-link" data-rv-anuncio="${i}"><div class="rz-ic rz-warn"><i data-lucide="megaphone"></i></div>
        <div class="rz-tx"><b>${esc(NOME_EV[e.tipo] || 'Evento')} anunciada</b><span>${esc(e.data_limite ? 'decidir até ' + dataBR(e.data_limite) : 'para ' + dataBR(e.data))}${e.preco ? ' · ' + esc(moeda(e.preco)) : ''}</span></div>
        <i data-lucide="chevron-right" class="rz-chev"></i></div>`;
    card.innerHTML = `<div class="rz-card-h"><h3>Posição e custo médio</h3>${infoBtn('posicao')}</div>
        ${temEventos ? `<div class="rz-kv">
            <div><small>Quantidade</small><b>${esc(qtd(q))}</b></div>
            <div><small>Preço médio</small><b>${esc(moeda(p.pm))}</b></div>
            <div><small>Custo</small><b>${esc(moeda(p.custo))}</b></div>
            <div><small>Valor</small><b>${esc(moeda(p.valor))}</b>${p.preco_ref ? `<small>${esc(moeda(p.preco_ref))} · ${p.cotacao_data ? 'cotação ' + esc(dataBR(p.cotacao_data).slice(0, 5)) : 'último preço'}</small>` : ''}</div>
            ${q > 0 ? `<div><small>Não realizado</small><b${aberto < 0 ? ' style="color:var(--danger)"' : ''}>${esc(sinal(aberto) + pctAberto)}</b></div>` : ''}
            <div><small>Realizado em ${ANO}</small><b>${esc(sinal(p.realizado_ano))}</b></div>
            <div><small>Proventos em ${ANO}</small><b>${esc(moeda(p.proventos_ano))}</b></div></div>`
        : `<div class="rz-empty"><div class="rz-ic"><i data-lucide="${ICONE_RV[con.tipoContrato] || 'line-chart'}"></i></div><p>Sem posição ainda. Informe a posição que você já tem ou lance a primeira compra.</p></div>`}
        ${anunciados.length ? `<div class="rz-group">Anunciado</div>${anunciados.map(linhaAnuncio).join('')}` : ''}
        ${temEventos ? `<button type="button" class="rz-act" data-rv-calc><div class="rz-ic"><svg data-lucide="calculator"></svg></div><div>Conferir o cálculo<small>Como chegamos ao preço médio</small></div></button>`
        : `<button type="button" class="rz-act" data-rv-ini><div class="rz-ic"><svg data-lucide="flag"></svg></div><div>Posição que já tenho<small>Quantidade e preço médio de hoje</small></div></button>
           <button type="button" class="rz-act" data-rv-compra><div class="rz-ic"><svg data-lucide="arrow-down-left"></svg></div><div>Primeira compra<small>Quantidade, preço e taxas</small></div></button>`}`;
    card.querySelector('[data-rv-calc]')?.addEventListener('click', () => abrirMemoria(con, p));
    card.querySelector('[data-rv-ini]')?.addEventListener('click', () => bloqueado() || abrirPosicaoInicial(con));
    card.querySelector('[data-rv-compra]')?.addEventListener('click', () => bloqueado() || abrirCompraVenda(con, p, 'compra'));
    card.querySelectorAll('[data-rv-anuncio]').forEach(r => r.addEventListener('click', () => tratarAnuncio(con, p, anunciados[Number(r.dataset.rvAnuncio)])));
    ligarInfos(card);
}
const bloqueado = () => typeof rzMostrarBloqueio === 'function' && rzMostrarBloqueio('cofre.editar');
async function depois(con, msg) {
    toast(msg, 'sucesso');
    if (typeof ctxFicha?.aoMudar === 'function' && ctxFicha.con?.id === con.id) { await ctxFicha.aoMudar(); return; }
    if (typeof window.abrirFichaContrato === 'function') window.abrirFichaContrato(con.id);
}

// ---------------------------------------------------------------------------------------------------- memória do cálculo (tela 9)
function abrirMemoria(con, p) {
    const mem = p.memoria || [];
    const mov = (m) => {
        if (m.tipo === 'compra' || m.tipo === 'venda' || m.tipo === 'subscricao') return `${NOME_EV[m.tipo]} ${qtd(m.quantidade)} × ${n2(m.preco)}${Number(m.taxas) > 0 ? ' + taxas ' + n2(m.taxas) : ''}`;
        if (m.tipo === 'posicao_inicial') return `Posição inicial ${qtd(m.quantidade)} × ${n2(m.preco)}`;
        if (m.tipo === 'bonificacao') return `Bonificação +${qtd(m.qtd_depois - m.qtd_antes)}${m.preco ? ' · custo ' + n2(m.preco) : ' · sem custo'}`;
        if (m.tipo === 'desdobramento' || m.tipo === 'grupamento') return `${NOME_EV[m.tipo]} · fator ${qtd(m.fator)}`;
        if (m.tipo === 'amortizacao') return `Amortização ${n2(m.valor)}`;
        return `Ajuste do preço médio para ${n2(m.preco, 4)}`;
    };
    const neg = (v) => (Number(v) < 0 ? ' style="color:var(--danger)"' : '');
    const linhas = mem.map((m, i) => `<div class="rz-row rz-link" data-rv-mem="${i}"><div class="rz-ic"><i data-lucide="${ICONE_EV[m.tipo] || 'circle-dollar-sign'}"></i></div>
        <div class="rz-tx"><b>${esc(mov(m))}</b><span>${esc(dataBR(m.data))} · custo ${esc(n2(m.custo_depois))}${m.resultado != null ? ` · <span${neg(m.resultado)}>resultado ${esc(sinal(m.resultado))}</span>` : ''}</span></div>
        <div class="rz-rt"><b>${esc(qtd(m.qtd_depois))}</b><small>PM ${esc(n2(m.pm_depois, 4))}</small></div><i data-lucide="chevron-right" class="rz-chev"></i></div>`).join('');
    abrirSheetForm({ titulo: 'Como chegamos ao preço médio', sub: `${codigo(con)} · ${qtd(p.quantidade)} ${unidade(con, p.quantidade)}`, semRodape: true, empilhar: true,
        corpo: `<div class="rz-card rz-list"><div class="rz-card-h"><h3>Evento a evento</h3><span class="rz-sub">quantidade e PM depois</span></div>${linhas}</div>
            <p class="rz-desc">${esc(INFO.posicao[1].split('. O valor')[0])}. Toque numa linha para ver ou excluir o evento.</p>
            <button type="button" class="rz-act" data-rv-csv><div class="rz-ic"><svg data-lucide="download"></svg></div><div>Baixar em planilha<small>CSV com todas as linhas</small></div></button>
            <button type="button" class="rz-act" data-rv-ajuste><div class="rz-ic"><svg data-lucide="pencil"></svg></div><div>Ajustar preço médio<small>Acerto com data, fica na memória</small></div></button>` });
    setTimeout(() => {
        document.querySelectorAll('[data-rv-mem]').forEach(r => r.addEventListener('click', () => abrirEvento(con, p, mem[Number(r.dataset.rvMem)])));
        document.querySelector('[data-rv-csv]')?.addEventListener('click', () => baixarCsv(con, mem));
        document.querySelector('[data-rv-ajuste]')?.addEventListener('click', () => bloqueado() || abrirAjuste(con, p));
        icones();
    }, 0);
}
function baixarCsv(con, mem) {
    const nb = (v) => (v == null || v === '' ? '' : String(v).replace('.', ','));
    const cab = ['Data', 'Movimento', 'Quantidade', 'Preço', 'Fator', 'Taxas', 'Valor', 'Qtd depois', 'Custo depois', 'PM depois', 'Resultado'];
    const linhas = mem.map(m => [dataBR(m.data), NOME_EV[m.tipo] || m.tipo, nb(m.quantidade), nb(m.preco), nb(m.fator), nb(m.taxas), nb(m.valor),
        nb(m.qtd_depois), nb(m.custo_depois), nb(m.pm_depois), nb(m.resultado)].join(';'));
    const blob = new Blob(['﻿' + [cab.join(';'), ...linhas].join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `preco_medio_${String(codigo(con)).toLowerCase()}.csv`;
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

// ---------------------------------------------------------------------------------------------------- evento (ver, excluir)
function abrirEvento(con, p, m, { contaVolta = null } = {}) {
    const kv = [['Data', dataBR(m.data)], ...(m.quantidade != null ? [['Quantidade', qtd(m.quantidade)]] : []), ...(m.preco != null ? [[m.tipo === 'ajuste_pm' ? 'Preço médio' : 'Preço', moeda(m.preco)]] : []),
        ...(m.fator != null ? [['Fator', qtd(m.fator)]] : []), ...(Number(m.taxas) > 0 ? [['Taxas', moeda(m.taxas)]] : []), ...(m.valor != null ? [['Valor', moeda(m.valor)]] : []),
        ...(m.resultado != null ? [['Resultado', sinal(m.resultado)]] : []), ['Depois', `${qtd(m.qtd_depois)} ${unidade(con, m.qtd_depois)} · PM ${moeda(m.pm_depois)}`],
        ...(m.observacao ? [['Observação', m.observacao]] : [])];
    const dinheiro = ['compra', 'venda', 'subscricao', 'amortizacao'].includes(m.tipo);
    const relanca = m.tipo === 'compra' || m.tipo === 'venda';
    abrirSheetForm({ titulo: NOME_EV[m.tipo] || 'Evento', sub: codigo(con), semRodape: true, empilhar: true,
        corpo: `<div class="rz-card"><div class="rz-card-h"><h3>O que foi registrado</h3></div><div class="rz-kv">${kv.map(([k, v]) => `<div><small>${esc(k)}</small><b>${esc(v)}</b></div>`).join('')}</div></div>
            <div class="rz-group">O que fazer</div>
            ${relanca ? `<button type="button" class="rz-act" data-rv-ev="relancar"><div class="rz-ic"><svg data-lucide="rotate-ccw"></svg></div><div>Excluir e lançar de novo<small>Vem preenchido para ajustar</small></div></button>` : ''}
            <button type="button" class="rz-act rz-bad" data-rv-ev="excluir"><div class="rz-ic rz-bad"><svg data-lucide="trash-2"></svg></div><div>Excluir ${esc((NOME_EV[m.tipo] || 'evento').toLowerCase())}<small>${dinheiro ? 'Sai do Financeiro e o preço médio é refeito' : 'O preço médio é refeito'}</small></div></button>` });
    setTimeout(() => {
        document.querySelectorAll('[data-rv-ev]').forEach(b => b.addEventListener('click', () => {
            if (bloqueado()) return;
            if (typeof fecharSheet === 'function') fecharSheet();
            setTimeout(() => {
                if (b.dataset.rvEv === 'relancar') abrirCompraVenda(con, p, m.tipo, { data: String(m.data).slice(0, 10), quantidade: m.quantidade, preco: m.preco, taxas: m.taxas, obs: m.observacao, eventoAntigo: m.evento_id, contaVolta });
                else confirmarExcluir(con, m, contaVolta);
            }, 60);
        }));
        icones();
    }, 0);
}
function confirmarExcluir(con, m, contaVolta) {
    abrirSheetAcoes({ titulo: `Excluir ${(NOME_EV[m.tipo] || 'evento').toLowerCase()}?`, sub: `${codigo(con)} · ${dataBR(m.data)} · refaz o preço médio`, empilhar: true, acoes: [
        { icone: 'trash-2', titulo: 'Excluir', sub: 'Não dá para desfazer', tipo: 'bad', codigo: 'cofre.editar', aoTocar: async () => {
            try { await excluirEvento(m.evento_id); } catch (e) { toast(e?.message || 'Não consegui excluir.', 'erro'); return; }
            if (contaVolta && typeof window.abrirFichaAtivoNoChip === 'function') { toast('Excluído', 'sucesso'); window.abrirFichaAtivoNoChip(contaVolta, 'movimento'); return; }
            await depois(con, 'Excluído');
        } },
    ] });
}
// linha do Financeiro (compra, venda, amortização e as taxas delas) → o evento
export async function abrirEventoDoLancamento(con, origemId, { contaVolta = null } = {}) {
    let p;
    try { p = await posicao(con.id); } catch (e) { toast(e?.message || 'Não consegui ler a posição.', 'erro'); return false; }
    const m = (p.memoria || []).find(x => x.origem_id === origemId);
    if (!m) return false;
    abrirEvento(con, p, m, { contaVolta });
    return true;
}

// ---------------------------------------------------------------------------------------------------- formulários
function abrirPosicaoInicial(con) {
    abrirSheetForm({ titulo: 'Posição que já tenho', sub: codigo(con), rotuloSalvar: 'Salvar posição', empilhar: true,
        corpo: `<p class="rz-desc">Quantidade e preço médio de hoje, da corretora ou do informe de rendimentos. Entra sem saída de caixa no Financeiro; os próximos movimentos partem daqui.</p>
            <div class="rz-f2">${campo('rv-q', 'Quantidade', '<input type="number" id="rv-q" step="any" min="0" inputmode="decimal">')}${campo('rv-p', 'Preço médio (R$)', '<input type="number" id="rv-p" step="0.0001" min="0" inputmode="decimal">')}</div>
            ${campo('rv-d', 'Posição em', `<input type="date" id="rv-d" max="${hoje()}" value="${hoje()}">`)}
            <p class="rz-desc" id="rv-custo"></p>`,
        aoSalvar: async () => {
            const q = numero('rv-q'), pr = numero('rv-p'), d = val('rv-d');
            if (!(q > 0) || !(pr > 0) || !d) { toast('Informe quantidade, preço médio e data.', 'erro'); return false; }
            try { await registrar(con, { tipo: 'posicao_inicial', data: d, quantidade: q, preco: pr }); } catch (e) { toast(e?.message || 'Não consegui salvar.', 'erro'); return false; }
            await depois(con, 'Posição registrada'); return true;
        } });
    setTimeout(() => {
        const at = () => { const el = document.getElementById('rv-custo'); if (el) el.textContent = numero('rv-q') > 0 && numero('rv-p') > 0 ? `Custo da posição: ${moeda(numero('rv-q') * numero('rv-p'))}` : ''; };
        ['rv-q', 'rv-p'].forEach(id => document.getElementById(id)?.addEventListener('input', at));
    }, 0);
}

function abrirCompraVenda(con, p, tipo, pre = null) {
    const venda = tipo === 'venda', tem = Number(p?.quantidade || 0), pm = Number(p?.pm || 0);
    if (venda && !(tem > 0) && !pre) { aviso('Sem posição', 'Não há quantidade para vender nesta aplicação.'); return; }
    const sub = `${codigo(con)}${tem > 0 ? ` · ${qtd(tem)} ${unidade(con, tem)} · PM ${moeda(pm)}` : ''}`;
    abrirSheetForm({ titulo: venda ? 'Venda' : 'Compra', sub, rotuloSalvar: pre?.eventoAntigo ? 'Excluir o antigo e registrar' : venda ? 'Registrar venda' : 'Registrar compra', empilhar: true,
        corpo: `<div class="rz-f2">${campo('rv-d', 'Data', `<input type="date" id="rv-d" max="${hoje()}" value="${esc(pre?.data || hoje())}">`)}${campo('rv-q', 'Quantidade', `<input type="number" id="rv-q" step="any" min="0" inputmode="decimal" value="${pre?.quantidade ?? ''}">`)}</div>
            ${venda && tem > 0 ? `<p class="rz-desc">de ${esc(qtd(tem))} · <a href="#" data-rv-tudo>vender tudo</a></p>` : ''}
            <div class="rz-f2">${campo('rv-p', `Preço por ${con.tipoContrato === 'inv_rv_fii' ? 'cota' : 'ação'} (R$)`, `<input type="number" id="rv-p" step="0.0001" min="0" inputmode="decimal" value="${pre?.preco ?? ''}">`)}${campo('rv-t', 'Taxas (R$)', `<input type="number" id="rv-t" step="0.01" min="0" inputmode="decimal" value="${Number(pre?.taxas) > 0 ? pre.taxas : ''}">`)}</div>
            <div class="rz-card" id="rv-conta"></div>
            ${campo('rv-o', 'Observação (opcional)', `<input type="text" id="rv-o" maxlength="120" value="${esc(pre?.obs || '')}">`)}`,
        aoSalvar: async () => {
            const d = val('rv-d'), q = numero('rv-q'), pr = numero('rv-p'), tx = numero('rv-t');
            if (!d || !(q > 0) || !(pr > 0)) { toast('Informe data, quantidade e preço.', 'erro'); return false; }
            if (pre?.eventoAntigo && !pre.feito) {
                try { await excluirEvento(pre.eventoAntigo); pre.feito = true; } catch (e) { toast(e?.message || 'Não consegui excluir o antigo.', 'erro'); return false; }
            }
            let r;
            try { r = await registrar(con, { tipo, data: d, quantidade: q, preco: pr, taxas: tx, obs: val('rv-o').trim() || null }); }
            catch (e) { toast((pre?.feito ? 'O antigo já foi excluído: confira e salve de novo. ' : '') + (e?.message || 'Não consegui registrar.'), 'erro'); return false; }
            const msg = venda ? `Venda registrada · resultado ${sinal(r?.resultado)}` : 'Compra registrada';
            if (pre?.contaVolta && typeof window.abrirFichaAtivoNoChip === 'function') { toast(msg, 'sucesso'); window.abrirFichaAtivoNoChip(pre.contaVolta, 'movimento'); return true; }
            await depois(con, msg); return true;
        } });
    setTimeout(() => {
        const box = document.getElementById('rv-conta');
        const at = () => {
            if (!box) return;
            const q = numero('rv-q'), pr = numero('rv-p'), tx = numero('rv-t');
            if (!(q > 0 && pr > 0)) { box.innerHTML = ''; box.classList.add('hidden'); return; }
            box.classList.remove('hidden');
            if (venda) {
                const res = q * pr - tx - q * pm;
                box.innerHTML = `<div class="rz-kv"><div><small>Valor da venda</small><b>${esc(moeda(q * pr))}</b></div>
                    <div><small>Custo (${esc(qtd(q))} × ${esc(n2(pm))})</small><b>${esc(moeda(q * pm))}</b></div>
                    <div><small>Resultado</small><b${res < 0 ? ' style="color:var(--danger)"' : ''}>${esc(sinal(res))}</b></div>
                    <div><small>Fica</small><b>${q > tem ? 'mais do que tem' : `${esc(qtd(tem - q))} · PM ${esc(n2(pm))}`}</b></div></div>
                    ${con.tipoContrato === 'inv_rv_acao' ? '<p class="rz-desc">Vendas de ações até R$ 20 mil no mês são isentas de IR para pessoa física. Só informativo.</p>' : '<p class="rz-desc">Ganho na venda de cotas de FII é tributado a 20%. Só informativo.</p>'}`;
            } else {
                const custo = Number(p?.custo || 0) + q * pr + tx, nq = tem + q;
                box.innerHTML = `<div class="rz-kv"><div><small>Valor da compra</small><b>${esc(moeda(q * pr + tx))}</b></div><div><small>Preço médio depois</small><b>${esc(moeda(nq > 0 ? custo / nq : 0))}</b></div></div>`;
            }
        };
        ['rv-q', 'rv-p', 'rv-t'].forEach(id => document.getElementById(id)?.addEventListener('input', at));
        document.querySelector('[data-rv-tudo]')?.addEventListener('click', (ev) => { ev.preventDefault(); const el = document.getElementById('rv-q'); if (el) { el.value = String(tem); at(); } });
        at();
    }, 0);
}

function abrirAjuste(con, p) {
    abrirSheetForm({ titulo: 'Ajustar preço médio', sub: `${codigo(con)} · hoje ${moeda(p.pm)}`, rotuloSalvar: 'Salvar acerto', empilhar: true,
        corpo: `<p class="rz-desc">${esc(INFO.ajuste[1])}</p>
            <div class="rz-f2">${campo('rv-p', 'Preço médio certo (R$)', '<input type="number" id="rv-p" step="0.0001" min="0" inputmode="decimal">')}${campo('rv-d', 'A partir de', `<input type="date" id="rv-d" max="${hoje()}" value="${hoje()}">`)}</div>
            ${campo('rv-o', 'Observação (opcional)', '<input type="text" id="rv-o" maxlength="120" placeholder="Ex.: conforme a corretora">')}`,
        aoSalvar: async () => {
            const pr = numero('rv-p'), d = val('rv-d');
            if (!(pr > 0) || !d) { toast('Informe o preço médio e a data.', 'erro'); return false; }
            try { await registrar(con, { tipo: 'ajuste_pm', data: d, preco: pr, obs: val('rv-o').trim() || null }); } catch (e) { toast(e?.message || 'Não consegui salvar.', 'erro'); return false; }
            await depois(con, 'Preço médio ajustado'); return true;
        } });
}

const EVENTOS = [['subscricao', 'Emissão (subscrição)'], ['bonificacao', 'Bonificação'], ['desdobramento', 'Desdobramento'], ['grupamento', 'Grupamento'], ['amortizacao', 'Amortização (FII)']];
function abrirEventoPosicao(con, p, pre = {}) {
    const tem = Number(p?.quantidade || 0);
    abrirSheetForm({ titulo: 'Evento da posição', sub: `${codigo(con)} · ${qtd(tem)} ${unidade(con, tem)} · PM ${moeda(p?.pm)}`, rotuloSalvar: 'Registrar evento', empilhar: true,
        corpo: `<div class="rz-f2">${campo('rv-e', `Tipo ${infoBtn(pre.tipo || 'subscricao').replace('data-rv-info=', 'id="rv-e-i" data-rv-info=')}`, `<select id="rv-e">${EVENTOS.map(([k, n]) => `<option value="${k}"${(pre.tipo || 'subscricao') === k ? ' selected' : ''}>${n}</option>`).join('')}</select>`)}
            ${campo('rv-s', 'Situação', `<select id="rv-s"><option value="anunciado"${pre.situacao === 'realizado' ? '' : ' selected'}>Anunciada</option><option value="realizado"${pre.situacao === 'realizado' ? ' selected' : ''}>Feita</option></select>`)}</div>
            <p class="rz-desc" id="rv-e-txt"></p>
            <div class="rz-f2">${campo('rv-d', 'Data', `<input type="date" id="rv-d" value="${esc(pre.data || hoje())}">`, ' id="rv-c-d"')}${campo('rv-l', 'Decidir até', `<input type="date" id="rv-l" value="${esc(pre.dataLimite || '')}">`, ' id="rv-c-l"')}</div>
            <div class="rz-f2">${campo('rv-q', 'Quantidade', `<input type="number" id="rv-q" step="any" min="0" inputmode="decimal" value="${pre.quantidade ?? ''}">`, ' id="rv-c-q"')}${campo('rv-p', 'Preço (R$)', `<input type="number" id="rv-p" step="0.0001" min="0" inputmode="decimal" value="${pre.preco ?? ''}">`, ' id="rv-c-p"')}</div>
            <div class="rz-f2">${campo('rv-f', 'Fator', `<input type="number" id="rv-f" step="any" min="0" inputmode="decimal" value="${pre.fator ?? ''}">`, ' id="rv-c-f"')}${campo('rv-v', 'Valor recebido (R$)', `<input type="number" id="rv-v" step="0.01" min="0" inputmode="decimal" value="${pre.valor ?? ''}">`, ' id="rv-c-v"')}</div>
            ${campo('rv-o', 'Observação (opcional)', `<input type="text" id="rv-o" maxlength="120" value="${esc(pre.obs || '')}">`)}
            <p class="rz-desc" id="rv-e-nota"></p>`,
        aoSalvar: async () => {
            const tipo = val('rv-e'), sit = val('rv-s'), d = val('rv-d');
            if (!d) { toast('Informe a data.', 'erro'); return false; }
            if (sit === 'realizado' && d > hoje()) { toast('Evento feito não pode ter data futura.', 'erro'); return false; }
            const args = { tipo, situacao: sit, data: d, dataLimite: sit === 'anunciado' ? (val('rv-l') || null) : null, obs: val('rv-o').trim() || null, anunciadoId: pre.anunciadoId || null };
            if (tipo === 'subscricao') Object.assign(args, { quantidade: numero('rv-q') || null, preco: numero('rv-p') || null });
            if (tipo === 'bonificacao') Object.assign(args, { quantidade: numero('rv-q') || null, preco: numero('rv-p') || null, fator: numero('rv-f') || null });
            if (tipo === 'desdobramento' || tipo === 'grupamento') args.fator = numero('rv-f') || null;
            if (tipo === 'amortizacao') args.valor = numero('rv-v') || null;
            try { await registrar(con, args); } catch (e) { toast(e?.message || 'Não consegui registrar.', 'erro'); return false; }
            await depois(con, sit === 'anunciado' ? 'Anúncio registrado' : 'Evento registrado'); return true;
        } });
    setTimeout(() => {
        const mostra = (id, sim) => document.getElementById(id)?.classList.toggle('hidden', !sim);
        const rot = (id, t) => { const l = document.querySelector(`#${id} label`); if (l) l.textContent = t; };
        const at = () => {
            const tipo = val('rv-e'), anun = val('rv-s') === 'anunciado';
            const i = document.getElementById('rv-e-i'); if (i) i.dataset.rvInfo = tipo;
            const txt = document.getElementById('rv-e-txt'); if (txt) txt.textContent = INFO[tipo]?.[1] || '';
            mostra('rv-c-l', anun);
            mostra('rv-c-q', tipo === 'subscricao' || tipo === 'bonificacao');
            mostra('rv-c-p', tipo === 'subscricao' || tipo === 'bonificacao');
            mostra('rv-c-f', tipo === 'bonificacao' || tipo === 'desdobramento' || tipo === 'grupamento');
            mostra('rv-c-v', tipo === 'amortizacao');
            rot('rv-c-d', tipo === 'subscricao' ? (anun ? 'Liquidação' : 'Data da compra') : anun ? 'Data do evento' : 'Data');
            rot('rv-c-q', tipo === 'bonificacao' ? 'Ações recebidas' : anun ? 'Quantidade (opcional)' : 'Quantidade comprada');
            rot('rv-c-p', tipo === 'bonificacao' ? 'Custo por ação (R$, opcional)' : 'Preço da emissão (R$)');
            rot('rv-c-f', tipo === 'bonificacao' ? 'Ou o percentual (%)' : 'Fator');
            const nota = document.getElementById('rv-e-nota');
            if (nota) nota.textContent = anun ? 'Vai aparecer na central de alertas até a data. Quando fizer, registre aqui como "Feita".'
                : tipo === 'subscricao' ? 'A compra cai no Financeiro e o preço médio é recalculado.'
                : tipo === 'amortizacao' ? 'O valor cai no Financeiro e baixa o custo.' : 'Sem dinheiro: aparece só na memória do preço médio.';
        };
        ['rv-e', 'rv-s'].forEach(id => document.getElementById(id)?.addEventListener('change', at));
        at(); ligarInfos(document.getElementById('rz-sheet-corpo') || document);
    }, 0);
}
function tratarAnuncio(con, p, e) {
    if (!e) return;
    abrirSheetAcoes({ titulo: `${NOME_EV[e.tipo] || 'Evento'} anunciada`, sub: `${codigo(con)} · ${e.data_limite ? 'decidir até ' + dataBR(e.data_limite) : 'para ' + dataBR(e.data)}${e.observacao ? ' · ' + e.observacao : ''}`, empilhar: true, acoes: [
        { icone: 'check', titulo: e.tipo === 'subscricao' ? 'Exerci (comprei)' : 'Aconteceu', sub: 'Registra o evento feito', codigo: 'cofre.editar',
            aoTocar: () => abrirEventoPosicao(con, p, { tipo: e.tipo, situacao: 'realizado', data: e.tipo === 'subscricao' ? hoje() : (e.data <= hoje() ? e.data : hoje()), quantidade: e.quantidade, preco: e.preco, fator: e.fator, valor: e.valor, anunciadoId: e.evento_id }) },
        { icone: 'ban', titulo: e.tipo === 'subscricao' ? 'Não vou exercer' : 'Não aconteceu', sub: 'Sai dos alertas', codigo: 'cofre.editar', aoTocar: async () => {
            const { error } = await db().rpc('fn_rv_anuncio_encerrar', { p_evento_id: e.evento_id });
            if (error) { toast(error.message || 'Não consegui salvar.', 'erro'); return; }
            await depois(con, 'Anúncio encerrado');
        } },
        { icone: 'trash-2', titulo: 'Excluir anúncio', sub: 'Foi lançado por engano', tipo: 'bad', codigo: 'cofre.editar', aoTocar: async () => {
            try { await excluirEvento(e.evento_id); } catch (er) { toast(er?.message || 'Não consegui excluir.', 'erro'); return; }
            await depois(con, 'Anúncio excluído');
        } },
    ] });
}

// ---------------------------------------------------------------------------------------------------- Registrar movimento (tela 4)
export async function abrirRegistrarRV(con, { rendimento, taxa, despesa } = {}) {
    let p = {};
    try { p = await posicao(con.id); } catch (e) { toast(e?.message || 'Não consegui ler a posição.', 'erro'); return; }
    const sem = !(p.memoria || []).length;
    const conta = con.ativoId ? { id: con.ativoId, cliente_id: con.clienteId } : null;
    abrirSheetAcoes({ titulo: 'Registrar movimento', sub: codigo(con), acoes: [
        ...(sem ? [{ icone: 'flag', titulo: 'Posição que já tenho', sub: 'Quantidade e PM de hoje', codigo: 'cofre.editar', aoTocar: () => abrirPosicaoInicial(con) }] : []),
        { icone: 'arrow-down-left', titulo: 'Compra', sub: 'Quantidade e preço', codigo: 'cofre.editar', aoTocar: () => abrirCompraVenda(con, p, 'compra') },
        ...(Number(p.quantidade) > 0 ? [{ icone: 'arrow-up-right', titulo: 'Venda', sub: 'Com o resultado', codigo: 'cofre.editar', aoTocar: () => abrirCompraVenda(con, p, 'venda') }] : []),
        ...(conta ? [{ icone: 'list-checks', titulo: 'Várias compras e vendas', sub: 'Em lote, de vários códigos', codigo: 'cofre.editar', aoTocar: () => abrirLote(conta, null) }] : []),
        { icone: 'sprout', titulo: 'Rendimento', sub: 'Dividendos, JCP, FII', codigo: 'cofre.editar', aoTocar: () => rendimento?.() },
        { icone: 'git-branch', titulo: 'Evento da posição', sub: 'Emissão, bonificação…', codigo: 'cofre.editar', aoTocar: () => abrirEventoPosicao(con, p) },
        { icone: 'receipt', titulo: 'Taxa ou custódia', sub: 'Cobrada à parte', codigo: 'cofre.editar', aoTocar: () => taxa?.() },
        ...(despesa ? [{ icone: 'arrow-up-right', titulo: 'Outra despesa', sub: 'Saída ligada à conta', codigo: 'saidas.registrar', aoTocar: despesa }] : []),
    ] });
}

// ---------------------------------------------------------------------------------------------------- Nova aplicação (tela 7)
// criar(r) cria o contrato pelo caminho comum (investimentos.js) e devolve o id; aqui só a primeira posição
export async function abrirNovaRV(a, t, { campos, ctx, nc, cat, criar, aoConcluir }) {
    const tFii = t.codigo === 'inv_rv_fii';
    abrirSheetForm({ titulo: t.nome, sub: a.nome_exibicao, rotuloSalvar: 'Criar aplicação',
        corpo: nc.camposHtml(campos, ctx)
            + `${campo('rv-com', 'Começar com', '<select id="rv-com"><option value="posicao">Posição que já tenho</option><option value="compra">Uma compra</option></select>')}
            <div class="rz-f2">${campo('rv-q', 'Quantidade', '<input type="number" id="rv-q" step="any" min="0" inputmode="decimal">')}${campo('rv-p', 'Preço médio (R$)', '<input type="number" id="rv-p" step="0.0001" min="0" inputmode="decimal">', ' id="rv-c-p"')}</div>
            ${campo('rv-t', 'Taxas (R$)', '<input type="number" id="rv-t" step="0.01" min="0" inputmode="decimal">', ' id="rv-c-t"')}
            <p class="rz-desc" id="rv-nota"></p>
            <p class="rz-desc">A aplicação conta no limite de contratos do plano. Para vários códigos de uma vez, use "Várias compras e vendas".</p>`,
        aoSalvar: async () => {
            const r = nc.lerCampos(document, campos, ctx);
            if (!r.ok) { toast(r.erro, 'erro'); return false; }
            r.dados.ticker = String(r.dados.ticker || '').trim().toUpperCase();
            if (!r.dados.ticker) { toast('Informe o código na bolsa.', 'erro'); return false; }
            if (!r.colunas.descricao) r.colunas.descricao = r.dados.ticker;
            const q = numero('rv-q'), pr = numero('rv-p'), tx = numero('rv-t'), com = val('rv-com');
            if (!(q > 0) || !(pr > 0)) { toast('Informe quantidade e preço.', 'erro'); return false; }
            const data = r.colunas.inicio || hoje();
            let id;
            try { id = await criar(r); } catch (e) { toast(e?.message || 'Não consegui criar a aplicação.', 'erro'); return false; }
            try { await registrar({ id }, com === 'posicao' ? { tipo: 'posicao_inicial', data, quantidade: q, preco: pr } : { tipo: 'compra', data, quantidade: q, preco: pr, taxas: tx }); }
            catch (e) { toast(`A aplicação foi criada, mas a ${com === 'posicao' ? 'posição' : 'compra'} não: ${e?.message || 'erro'}. Registre pela ficha.`, 'erro'); aoConcluir?.(); return true; }
            toast('Aplicação criada', 'sucesso'); aoConcluir?.(); return true;
        } });
    setTimeout(() => {
        nc.ligarCampos(document, campos, ctx); cat.ligarInfos(document, campos);
        const at = () => {
            const pos = val('rv-com') === 'posicao';
            const l = document.querySelector('#rv-c-p label'); if (l) l.textContent = pos ? 'Preço médio (R$)' : `Preço por ${tFii ? 'cota' : 'ação'} (R$)`;
            document.getElementById('rv-c-t')?.classList.toggle('hidden', pos);
            const nota = document.getElementById('rv-nota'), q = numero('rv-q'), pr = numero('rv-p');
            if (nota) nota.textContent = (q > 0 && pr > 0 ? `Custo: ${moeda(q * pr + (pos ? 0 : numero('rv-t')))}. ` : '')
                + (pos ? 'Entra como posição inicial, sem saída de caixa no Financeiro. "Desde" é a data da posição.' : 'A compra cai no Financeiro na data em "Desde".');
        };
        document.getElementById('rv-com')?.addEventListener('change', at);
        ['rv-q', 'rv-p', 'rv-t'].forEach(id => document.getElementById(id)?.addEventListener('input', at));
        at(); icones();
    }, 0);
}

// ---------------------------------------------------------------------------------------------------- várias compras e vendas (tela 5)
const lerNumBR = (s) => {
    let v = String(s ?? '').trim().replace(/[R$\s]/g, '');
    if (!v) return '';
    if (v.includes(',')) v = v.replace(/\./g, '').replace(',', '.');
    const n = Number(v); return Number.isFinite(n) ? n : '';
};
const lerDataBR = (s) => {
    const v = String(s ?? '').trim();
    let m = v.match(/^(\d{4})-(\d{2})-(\d{2})/); if (m) return `${m[1]}-${m[2]}-${m[3]}`;
    m = v.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
    if (m) { const y = m[3] ? (m[3].length === 2 ? '20' + m[3] : m[3]) : String(new Date().getFullYear()); return `${y}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`; }
    return '';
};
export function abrirLote(a, aoConcluir) {
    const linhas = [{ data: hoje(), op: 'compra', ticker: '', q: '', p: '', t: '' }];
    let conferido = null, assinatura = '';
    const html = () => linhas.map((l, i) => `<div class="rz-lote-l" data-rv-l="${i}" style="display:grid;grid-template-columns:7.2em 3.6em 1fr;gap:6px;margin-bottom:6px">
            <input type="date" data-k="data" max="${hoje()}" value="${esc(l.data)}" aria-label="Data">
            <select data-k="op" aria-label="Compra ou venda"><option value="compra"${l.op === 'compra' ? ' selected' : ''}>C</option><option value="venda"${l.op === 'venda' ? ' selected' : ''}>V</option></select>
            <input type="text" data-k="ticker" maxlength="12" placeholder="Código" value="${esc(l.ticker)}" aria-label="Código" style="text-transform:uppercase">
            <input type="number" data-k="q" step="any" min="0" inputmode="decimal" placeholder="Qtd" value="${l.q}" aria-label="Quantidade">
            <input type="number" data-k="p" step="0.0001" min="0" inputmode="decimal" placeholder="Preço" value="${l.p}" aria-label="Preço">
            <div style="display:flex;gap:6px"><input type="number" data-k="t" step="0.01" min="0" inputmode="decimal" placeholder="Taxas" value="${l.t}" aria-label="Taxas" style="flex:1">
            <button type="button" class="rz-more" data-rv-del="${i}" aria-label="Tirar a linha"><svg data-lucide="x"></svg></button></div></div>`).join('');
    const itens = () => linhas.filter(l => l.ticker || l.q || l.p).map(l => ({ data: l.data, operacao: l.op, ticker: String(l.ticker).trim().toUpperCase(),
        quantidade: Number(l.q) || null, preco: Number(l.p) || null, taxas: Number(l.t) || 0 }));
    const desenhar = () => {
        const box = document.getElementById('rv-lote'); if (!box) return;
        box.innerHTML = html();
        box.querySelectorAll('[data-rv-l]').forEach(row => {
            const i = Number(row.dataset.rvL);
            row.querySelectorAll('[data-k]').forEach(inp => inp.addEventListener('input', () => { linhas[i][inp.dataset.k] = inp.value; marcarMudou(); }));
            row.querySelector('[data-rv-del]')?.addEventListener('click', () => { linhas.splice(i, 1); if (!linhas.length) linhas.push({ data: hoje(), op: 'compra', ticker: '', q: '', p: '', t: '' }); desenhar(); marcarMudou(); });
        });
        icones();
    };
    const botao = () => document.getElementById('rz-sheet-salvar');
    const marcarMudou = () => {
        const n = itens().length, b = botao();
        if (b) b.textContent = conferido && assinatura === JSON.stringify(itens()) ? `Lançar ${n} ${n === 1 ? 'operação' : 'operações'}` : 'Conferir';
    };
    const mostrarConferencia = (r) => {
        const box = document.getElementById('rv-conf'); if (!box) return;
        const ROT = { ok: ['ok', 'Entra'], novo: ['run', 'Código novo'], duplicado: ['neu', 'Já lançada'], erro: ['bad', 'Erro'] };
        box.innerHTML = `<div class="rz-group">Como fica · ${r.ok} ${r.ok === 1 ? 'entra' : 'entram'}${r.duplicados ? ` · ${r.duplicados} já ${r.duplicados === 1 ? 'lançada' : 'lançadas'}` : ''}${r.erros ? ` · ${r.erros} com erro` : ''}</div>
            ${(r.itens || []).sort((x, y) => x.linha - y.linha).map(x => `<div class="rz-row"><div class="rz-tx"><b>${esc(x.ticker || '—')} · ${x.operacao === 'venda' ? 'venda' : 'compra'} ${esc(qtd(x.quantidade))} × ${esc(n2(x.preco))}</b>
                <span>${esc(x.mensagem || (x.qtd_depois != null ? `fica ${qtd(x.qtd_depois)} · PM ${n2(x.pm_depois)}${x.resultado != null ? ' · resultado ' + sinal(x.resultado) : ''}` : ''))}</span></div>
                <div class="rz-rt"><span class="rz-st rz-${ROT[x.status]?.[0] || 'neu'}">${esc(ROT[x.status]?.[1] || x.status)}</span></div></div>`).join('')}
            ${r.erros ? '<p class="rz-desc">Corrija as linhas com erro para lançar: nada é gravado enquanto houver erro.</p>' : ''}`;
    };
    const colar = () => {
        abrirSheetForm({ titulo: 'Colar da planilha', sub: 'Uma operação por linha', rotuloSalvar: 'Usar estas linhas', empilhar: true,
            corpo: `<p class="rz-desc">Na ordem: data, C ou V, código, quantidade, preço e taxas (opcional), separados por tabulação ou ponto e vírgula. Ex.: 03/11/2026; C; HGLG11; 20; 158,90; 0</p>
                ${campo('rv-cola', 'Linhas', '<textarea id="rv-cola" rows="8" style="width:100%"></textarea>')}`,
            aoSalvar: () => {
                const novas = String(val('rv-cola')).split(/\r?\n/).map(s => s.trim()).filter(Boolean).map(s => {
                    const c = s.includes('\t') ? s.split('\t') : s.includes(';') ? s.split(';') : s.split(/\s+/);
                    const op = String(c[1] || '').trim().toLowerCase();
                    return { data: lerDataBR(c[0]), op: op.startsWith('v') ? 'venda' : 'compra', ticker: String(c[2] || '').trim().toUpperCase(), q: lerNumBR(c[3]), p: lerNumBR(c[4]), t: lerNumBR(c[5]) };
                }).filter(l => l.ticker);
                if (!novas.length) { toast('Não reconheci nenhuma linha.', 'erro'); return false; }
                const vazias = linhas.every(l => !l.ticker && !l.q && !l.p);
                if (vazias) linhas.length = 0;
                linhas.push(...novas); setTimeout(() => { desenhar(); marcarMudou(); }, 80); return true;
            } });
    };
    abrirSheetForm({ titulo: 'Várias compras e vendas', sub: a.nome_exibicao || 'Conta', rotuloSalvar: 'Conferir', empilhar: true,
        corpo: `<p class="rz-desc">Uma linha por operação, de qualquer código desta conta. Código que ainda não existe vira aplicação nova (final 11 entra como fundo imobiliário). Antes de gravar, o app mostra como fica cada código.</p>
            <div style="display:grid;grid-template-columns:7.2em 3.6em 1fr;gap:6px" class="rz-desc"><span>Data</span><span>C/V</span><span>Código · qtd · preço · taxas</span></div>
            <div id="rv-lote"></div>
            <button type="button" class="rz-add" data-rv-mais><svg data-lucide="plus"></svg> Linha</button>
            <button type="button" class="rz-add" data-rv-colar><svg data-lucide="clipboard"></svg> Colar da planilha</button>
            <div id="rv-conf"></div>`,
        aoSalvar: async () => {
            const it = itens();
            if (!it.length) { toast('Preencha ao menos uma linha.', 'erro'); return false; }
            const sig = JSON.stringify(it), gravar = conferido && assinatura === sig && !conferido.erros;
            const { data, error } = await db().rpc('fn_rv_eventos_lote', { p_ativo_id: a.id, p_itens: it, p_simular: !gravar });
            if (error) { toast(error.message || 'Não consegui conferir.', 'erro'); return false; }
            if (gravar && data?.gravado) {
                toast(`${data.ok} ${data.ok === 1 ? 'operação lançada' : 'operações lançadas'}${data.novos ? ` · ${data.novos} ${data.novos === 1 ? 'aplicação nova' : 'aplicações novas'}` : ''}`, 'sucesso');
                aoConcluir?.(); return true;
            }
            conferido = data; assinatura = sig; mostrarConferencia(data); marcarMudou();
            if (data?.erros) toast('Há linhas com erro: veja a conferência.', 'erro');
            return false;
        } });
    setTimeout(() => {
        desenhar();
        document.querySelector('[data-rv-mais]')?.addEventListener('click', () => { const u = linhas[linhas.length - 1]; linhas.push({ data: u?.data || hoje(), op: 'compra', ticker: '', q: '', p: '', t: '' }); desenhar(); marcarMudou(); });
        document.querySelector('[data-rv-colar]')?.addEventListener('click', colar);
        icones();
    }, 0);
}
