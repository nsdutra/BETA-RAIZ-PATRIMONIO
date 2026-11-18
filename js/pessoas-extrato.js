// ============================================================================
// pessoas-extrato.js — Raiz Patrimônio · Financeiro › Pessoas: saldo de cada pessoa e o extrato dela
// Versão: 1.1.0 · 18/11/2026
//
// v1.1.0 (18/11/2026, sessão 20261118-0815-financeiro-relatorios, demanda 679b2700; FICHA_REVISAO_FINANCEIRO_RAIZ v1.0.0, Onda 4)
// — export pessoasAjustarItem(linha, aoGravar): o relatório "Balanço entre pessoas · analítico" (relatorios-executivos.js 1.16.0)
// abre o MESMO ajuste do item (motivo + divisão, fn_divisao_excecao_definir) a partir da linha; ao salvar, fecha o ajuste e
// chama aoGravar (o relatório se remonta), sem passar pela aba Pessoas.
//
// v1.0.1 (17/11/2026, sessão 20261117-0010-financeiro-pessoas-ajustes, demanda 679b2700; teste do Nicola 17/11 00:05, T-3126
// reprovado) — (1) o AJUSTE do item vira uma tela só, por cima do extrato: motivo e divisão juntos (% por pessoa, adicionar
// pessoa, tirar, soma), "Salvar ajuste" e "Voltar à divisão padrão"; antes o editor abria por cima e, ao fechar, caía na
// lista de pessoas. (2) Fechar o item VOLTA AO EXTRATO da pessoa, não à lista. (3) Retirada e acerto (repasse) passam a ser
// editáveis do extrato: "Editar a retirada" abre as ações de hoje (classificar como extraordinária ou de volta ao fluxo,
// dividir em partes, excluir); acerto entre pessoas ou com a empresa ganha "Desfazer este registro" (fn_acerto_desfazer).
// (4) Chips "Retiradas" (regulares) e "Extraordinárias", cada um com a lista dele e os três totais do ano. (5) Sai o
// "Demonstrativo do mês" do fim do extrato.
//
// v1.0.0 (16/11/2026, sessão 20261116-2345-financeiro-pessoas, demanda 679b2700; FICHA_REVISAO_FINANCEIRO_RAIZ v1.0.0, Onda 1;
// de acordo do Nicola 16/11 23:44 "de acordo com toda proposta"; protótipo PROTOTIPO_FINANCEIRO_REVISAO_RAIZ v1.4.0) — criação.
// A aba Balanço vira PESSOAS, sem chips:
//   · lista de saldos (fn_balanco_pessoas), com três números que somam o saldo: Distribuição (natureza distribuição),
//     Com a empresa (contraparte caixa, outras naturezas) e Entre pessoas (contraparte pessoa);
//   · tocar abre o EXTRATO da pessoa (fn_balanco_extrato): item a item, com como foi calculado e o saldo corrido; filtros
//     Tudo · Distribuição · Com a empresa · Entre pessoas · Retiradas;
//   · RETIRADAS do ano (fn_pessoa_retiradas_ano, F2): regulares, extraordinárias e total vêm do banco, e a lista;
//   · AJUSTE do item (lançamento ou recebimento): motivo obrigatório + a divisão do item (v1.0.1: na mesma tela), gravado
//     pela fn_divisao_excecao_definir com p_motivo (F1). Permissão financeiro.divisao.editar (Q1). "Tirar do balanço" ficou
//     fora (Q2);
//   · rodapé: Lançar retirada e Quitar (N), e o "Demonstrativo do mês" (a ficha do sócio de antes, com o compartilhar).
// O módulo não guarda regra de dinheiro: lê o banco e mostra. O saldo corrido é a soma das linhas na ordem da data, e a
// última linha bate com o saldo do topo (teste T-FIN-02).
// ============================================================================
export const VERSAO = '1.1.0';

import { rzToast, rzConfirmar } from './raiz-ui.js';

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = (v) => Number(v) || 0;
const moeda = (v) => 'R$ ' + num(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const sinal = (v) => { const n = num(v); return (n > 0.004 ? '+' : n < -0.004 ? '−' : '') + moeda(Math.abs(n)); };
const dataCurta = (iso) => { if (!iso) return ''; const [, m, d] = String(iso).slice(0, 10).split('-'); return `${d}/${m}`; };
const dataBR = (iso) => { if (!iso) return ''; const [a, m, d] = String(iso).slice(0, 10).split('-'); return `${d}/${m}/${a}`; };
const g = (nome) => (typeof window !== 'undefined' && typeof window[nome] === 'function') ? window[nome] : null;
const icones = () => { if (typeof lucide !== 'undefined') lucide.createIcons(); };
const pode = (codigo) => (typeof podeUsar === 'function') ? podeUsar(codigo) : { ok: true };

const NAT = { distribuicao: 'Distribuição', reembolso: 'Reembolso', adiantamento: 'Adiantamento', rateio: 'Rateio', extraordinaria: 'Retirada extraordinária' };
const GRUPOS = [['dist', 'Distribuição'], ['emp', 'Com a empresa'], ['pes', 'Entre pessoas']];
// grupo de uma linha (do saldo ou do extrato): a mesma regra nos dois lugares
const grupoDe = (natureza, contraparteTipo) => natureza === 'extraordinaria' ? null : natureza === 'distribuicao' ? 'dist' : (contraparteTipo === 'caixa' ? 'emp' : 'pes');

let CTX = null;        // { cliente, competencia, ate, rotuloMes, busca, quitar(p, l), lancarRetirada(pid), acoesRetirada(id) → Promise<boolean> }
let DADOS = null;      // { pessoas: [{ chave, pessoaId, nome, total, dist, emp, pes, linhas: [...] }] }
let FILTRO = 'tudo';

const saldoPartido = (v) => v > 0.004 ? `<span class="rz-saldo rz-run"><small>a receber</small><b>${esc(moeda(v))}</b></span>`
    : v < -0.004 ? `<span class="rz-saldo rz-warn"><small>deve</small><b>${esc(moeda(-v))}</b></span>` : `<span class="rz-saldo rz-ok"><small>em dia</small></span>`;
const iniciais = (nome) => String(nome || '?').trim().split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase();

async function carregar() {
    const { data, error } = await dbAuth.rpc('fn_balanco_pessoas', { p_cliente_id: CTX.cliente, p_ate: CTX.ate });
    if (error) throw error;
    const mapa = new Map();
    (data || []).forEach(x => {
        const chave = x.pessoa_id || ('ext:' + (x.nome_externo || x.nome));
        const p = mapa.get(chave) || { chave, pessoaId: x.pessoa_id || null, nome: x.nome, total: 0, dist: 0, emp: 0, pes: 0, linhas: [] };
        const v = num(x.valor), gr = grupoDe(x.natureza, x.contraparte_tipo);
        p.total += v; if (gr) p[gr] += v;
        p.linhas.push({ contraparteTipo: x.contraparte_tipo, contraparteId: x.contraparte_id || null, contraparteNome: x.contraparte_nome || 'Empresa', natureza: x.natureza, valor: v });
        mapa.set(chave, p);
    });
    DADOS = { pessoas: [...mapa.values()].sort((a, b) => Math.abs(b.total) - Math.abs(a.total) || a.nome.localeCompare(b.nome)) };
}

/** Desenha a aba Pessoas em #distrib-corpo. Chamado pelo financeiro.js (renderDistribuicao). */
export async function pessoasRender(ctx) {
    CTX = ctx;
    const corpo = document.getElementById('distrib-corpo');
    if (!corpo) return;
    const elLabel = document.getElementById('fin-competencia-label-socios');
    if (elLabel) elLabel.textContent = ctx.rotuloMes;
    // o segmento desta aba é estático no index: o rótulo passa a ser "Pessoas" (os das outras abas vêm do financeiro.js)
    const ab = document.querySelector('#tab-socios .rz-fin-abas button:last-child');
    if (ab && ab.textContent.trim() === 'Balanço') ab.textContent = 'Pessoas';
    corpo.innerHTML = `<p class="text-xs text-center py-3" style="color:var(--sage)">Carregando…</p>`;
    try { await carregar(); }
    catch (e) {
        console.error('[pessoas] saldos', e);
        corpo.innerHTML = `<div class="rz-card"><div class="rz-empty"><div class="rz-ic"><svg data-lucide="alert-circle"></svg></div><p>Não consegui calcular os saldos agora.<br><small style="color:var(--muted)">${esc(e?.message || e)}</small></p></div></div>`;
        icones(); return;
    }
    const filtro = String(ctx.busca || '').trim().toLowerCase();
    const lista = DADOS.pessoas.filter(p => !filtro || p.nome.toLowerCase().includes(filtro));
    corpo.innerHTML = lista.length
        ? `<div class="rz-card" style="padding:0"><div class="rz-card-h" style="padding:10px 14px 0;margin-bottom:0"><h3>Saldo de cada pessoa</h3><span class="rz-sub">até ${esc(dataBR(ctx.ate))}</span></div>` +
          lista.map(p => `<div class="rz-pes-lin" role="button" tabindex="0" data-pes="${esc(p.chave)}">
              <div class="rz-pes-h"><em class="rz-pes-av${p.pessoaId ? '' : ' rz-neu'}">${esc(iniciais(p.nome))}</em><b>${esc(p.nome)}</b>${saldoPartido(p.total)}<svg data-lucide="chevron-right" class="rz-chev"></svg></div>
              <div class="rz-pes-c">${GRUPOS.map(([k, n]) => `<span>${n}<b>${esc(sinal(p[k]))}</b></span>`).join('')}</div></div>`).join('') + '</div>'
        : `<div class="rz-card"><div class="rz-empty"><div class="rz-ic"><svg data-lucide="handshake"></svg></div><p>${filtro ? 'Ninguém com esse nome.' : 'Ninguém tem saldo até aqui. O saldo nasce da distribuição dos sócios, dos reembolsos e das despesas divididas.'}</p></div></div>`;
    corpo.querySelectorAll('[data-pes]').forEach(el => {
        const abrir = () => { FILTRO = 'tudo'; abrirExtrato(el.dataset.pes); };
        el.addEventListener('click', abrir);
        el.addEventListener('keydown', ev => { if (ev.key === 'Enter') abrir(); });
    });
    icones();
}

// ---------------------------------------------------------------- extrato da pessoa
async function lerExtrato(p) {
    if (!p.pessoaId) return [];
    const { data, error } = await dbAuth.rpc('fn_balanco_extrato', { p_cliente_id: CTX.cliente, p_pessoa_id: p.pessoaId, p_limite: 5000, p_ate: CTX.ate });
    if (error) throw error;
    // ordem da data, passado em cima (REL-28); a mesma linha do banco, sem regra nova
    return (data || []).slice().sort((a, b) => String(a.data).localeCompare(String(b.data)) || String(a.origem_id).localeCompare(String(b.origem_id)));
}
async function lerRetiradas(p) {
    const ano = Number(String(CTX.competencia).slice(0, 4));
    const { data, error } = await dbAuth.rpc('fn_pessoa_retiradas_ano', { p_cliente_id: CTX.cliente, p_pessoa_id: p.pessoaId, p_ano: ano });
    if (error) throw error;
    return data || { ano, totais: {}, itens: [] };
}
function comoFoi(e) {
    const mov = num(e.valor_movimento), pct = num(e.cota);
    if (e.natureza === 'extraordinaria') return `Não abate o saldo · ${moeda(mov)}`;
    if (pct > 0 && pct < 100 && mov) return `${pct.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}% de ${moeda(mov)}`;
    if (e.pagador) return `pagou ${e.pagador}`;
    return e.contraparte_nome ? `com ${e.contraparte_nome}` : '';
}

async function abrirExtrato(chave) {
    AJ_FORA = null; // v1.1.0 — aberto da aba Pessoas: ao salvar, volta ao extrato
    const p = DADOS?.pessoas.find(x => x.chave === chave);
    const abrirSheet = g('abrirSheet'), cab = g('rzSheetCabecalho');
    if (!p || !abrirSheet || !cab) return;
    const sheet = abrirSheet(cab(p.nome, `até ${dataBR(CTX.ate)}`) + `<div class="rz-sh-b"><p class="text-xs text-center py-3" style="color:var(--sage)">Carregando…</p></div>`);
    let corpo = '';
    try {
        if (!p.pessoaId) corpo = `<p class="rz-desc">Pessoa sem cadastro: cadastre em Pessoas (nome e WhatsApp bastam) para ver o extrato e quitar.</p>`;
        else if (FILTRO === 'ret' || FILTRO === 'ext') corpo = retiradasHtml(await lerRetiradas(p), FILTRO === 'ext' ? 'extraordinaria' : 'regular');
        else corpo = extratoHtml(await lerExtrato(p));
    } catch (e) {
        console.error('[pessoas] extrato', e);
        corpo = `<p class="rz-desc" style="color:var(--danger)">Não consegui ler o extrato: ${esc(e?.message || e)}</p>`;
    }
    const abertos = p.linhas.filter(l => Math.abs(l.valor) > 0.004);
    const podeRet = pode('repasses.registrar').ok;
    const b = sheet.querySelector('.rz-sh-b');
    b.innerHTML = `
        <div class="rz-pes-topo"><span>Saldo</span>${saldoPartido(p.total)}</div>
        <div class="rz-pes-tot">${GRUPOS.map(([k, n]) => `<button type="button" data-f="${k}" class="${FILTRO === k ? 'rz-on' : ''}"><small>${n}</small><b>${esc(sinal(p[k]))}</b></button>`).join('')}</div>
        <div class="rz-chips">${[['tudo', 'Tudo'], ...GRUPOS, ['ret', 'Retiradas'], ['ext', 'Extraordinárias']].map(([k, n]) => `<button type="button" class="rz-chip${FILTRO === k ? ' rz-on' : ''}" data-f="${k}">${n}</button>`).join('')}</div>
        ${corpo}`;
    sheet.insertAdjacentHTML('beforeend', `<div class="rz-sh-f">
        <button type="button" class="rz-btn rz-btn-2" data-ret ${p.pessoaId && podeRet ? '' : 'disabled'}>Lançar retirada</button>
        <button type="button" class="rz-btn rz-btn-1" data-quitar ${p.pessoaId && podeRet && abertos.length ? '' : 'disabled'}>Quitar${abertos.length ? ` (${abertos.length})` : ''}</button></div>`);
    sheet.querySelectorAll('[data-f]').forEach(el => el.addEventListener('click', () => { FILTRO = el.dataset.f; abrirExtrato(chave); }));
    sheet.querySelectorAll('[data-aj]').forEach(el => el.addEventListener('click', () => abrirAjuste(p, el.dataset.aj)));
    sheet.querySelector('[data-ret]')?.addEventListener('click', () => { g('fecharSheet')?.(); CTX.lancarRetirada?.(p.pessoaId); });
    sheet.querySelector('[data-quitar]')?.addEventListener('click', () => escolherQuitar(p, abertos));
    EXT_ATUAL = { p, chave };
    icones();
}
let EXT_ATUAL = null;
let EXT_LINHAS = [];

function extratoHtml(linhas) {
    EXT_LINHAS = linhas;
    const ok = (e) => FILTRO === 'tudo' || grupoDe(e.natureza, e.contraparte_tipo) === FILTRO;
    let run = 0;
    const html = linhas.map((e, i) => {
        if (!ok(e)) return '';
        if (grupoDe(e.natureza, e.contraparte_tipo)) run += num(e.valor);
        const ajusta = e.origem_tipo === 'lancamento' || e.origem_tipo === 'mensalidade';
        return `<div class="rz-row rz-link" role="button" tabindex="0" data-aj="${i}"><span class="rz-pes-dt">${esc(dataCurta(e.data))}</span>
            <div class="rz-tx"><b>${esc(e.descricao || 'Movimento')}</b><span>${esc(comoFoi(e))}</span><em class="rz-pes-nat">${esc(NAT[e.natureza] || e.natureza)}</em></div>
            <div class="rz-rt">${e.natureza === 'extraordinaria' ? `<b>${esc(moeda(e.valor_movimento))}</b>` : `<b class="${num(e.valor) > 0 ? 'rz-in' : 'rz-out'}">${esc(sinal(e.valor))}</b>`}<small class="rz-pes-run">saldo ${esc(sinal(run))}</small></div></div>`;
    }).join('');
    return html ? `<div class="rz-card rz-list rz-pes-ext">${html}</div>` : `<div class="rz-card"><div class="rz-empty"><p>Nada neste filtro até ${esc(dataBR(CTX.ate))}.</p></div></div>`;
}

function retiradasHtml(r, natureza) {
    const t = r.totais || {}, itens = (r.itens || []).filter(x => x.natureza === natureza);
    return `<div class="rz-kpis" style="grid-template-columns:repeat(3,1fr)"><div class="rz-kpi"><small>Regulares</small><b>${esc(moeda(t.regulares))}</b></div>
        <div class="rz-kpi"><small>Extraordinárias</small><b>${esc(moeda(t.extraordinarias))}</b></div><div class="rz-kpi"><small>Total ${esc(r.ano)}</small><b>${esc(moeda(t.total))}</b></div></div>` +
        (itens.length ? `<div class="rz-card rz-list">` + itens.map(x => `<div class="rz-row"><span class="rz-pes-dt">${esc(dataCurta(x.data))}</span>
            <div class="rz-tx"><b>${x.natureza === 'extraordinaria' ? 'Retirada extraordinária' : 'Retirada regular'}</b><span>${x.natureza === 'extraordinaria' ? 'não abate o saldo' : 'abate o saldo'}${x.meio ? ' · ' + esc(x.meio) : ''}${x.observacao ? ' · ' + esc(x.observacao) : ''}</span></div>
            <div class="rz-rt"><b>${esc(moeda(x.valor))}</b></div></div>`).join('') + '</div>'
        : `<div class="rz-card"><div class="rz-empty"><p>Nenhuma retirada ${natureza === 'extraordinaria' ? 'extraordinária' : 'regular'} em ${esc(r.ano)}.</p></div></div>`);
}

// ---------------------------------------------------------------- ajuste do item (por cima do extrato; fechar volta a ele)
let AJ_FORA = null;   // v1.1.0 — callback do relatório analítico (o ajuste foi aberto fora da aba Pessoas)
/** v1.1.0 — abre o ajuste de uma linha de fn_balanco_extrato vinda do relatório; só lançamento e recebimento se ajustam. */
export function pessoasAjustarItem(e, aoGravar) {
    if (!e || !(e.origem_tipo === 'lancamento' || e.origem_tipo === 'mensalidade')) return;
    EXT_LINHAS = [e];
    abrirAjuste(null, 0);
    AJ_FORA = typeof aoGravar === 'function' ? aoGravar : null;
}
let AJ = null;   // { e, linhas: [{ pessoa_id, nome, percentual }], tinhaExcecao }
function abrirItem(html) {
    const abrirSheet = g('abrirSheet');
    // nível 2: o X vira "‹ Voltar" e fecha só o item, com o extrato embaixo
    return abrirSheet ? abrirSheet(html, { empilhar: true }) : null;
}
function abrirAjuste(p, idx) {
    const e = EXT_LINHAS[Number(idx)], cab = g('rzSheetCabecalho');
    if (!e || !cab) return;
    const divisivel = e.origem_tipo === 'lancamento' || e.origem_tipo === 'mensalidade';
    const infos = `<div class="rz-card rz-list">
          <div class="rz-row"><div class="rz-ic"><svg data-lucide="list-checks"></svg></div><div class="rz-tx"><b>De onde veio</b><span>${esc(e.origem_tipo === 'mensalidade' ? 'Recebimento de contrato' : e.origem_tipo === 'lancamento' ? 'Lançamento' : (e.natureza === 'distribuicao' || e.natureza === 'extraordinaria' ? 'Retirada' : 'Acerto'))} · ${esc(dataBR(e.competencia || e.data))}${e.pagador ? ' · pagou ' + esc(e.pagador) : ''}</span></div></div>
          <div class="rz-row"><div class="rz-ic"><svg data-lucide="scale"></svg></div><div class="rz-tx"><b>Como foi calculado</b><span>${esc(comoFoi(e) || '—')} · ${esc(e.contraparte_nome || 'Empresa')}</span></div></div>
        </div>`;
    const titulo = cab(e.descricao || 'Movimento', `${dataBR(e.data)} · ${NAT[e.natureza] || e.natureza} · ${sinal(e.valor)}`);
    if (!divisivel) return abrirRegistro(p, e, titulo, infos);
    const perm = pode('financeiro.divisao.editar');
    if (!perm.ok) { abrirItem(titulo + `<div class="rz-sh-b">${infos}<p class="rz-desc" style="margin-top:10px">${esc(perm.textoCurto || 'Sem permissão para ajustar a divisão.')}</p></div>`); icones(); return; }
    const sheet = abrirItem(titulo + `<div class="rz-sh-b">${infos}<p class="text-xs text-center py-3" style="color:var(--sage)">Carregando a divisão…</p></div>`);
    if (!sheet) return;
    carregarDivisao(e).then(() => desenharAjuste(sheet, titulo, infos));
}
async function carregarDivisao(e) {
    AJ = { e, linhas: [], tinhaExcecao: false };
    try {
        const { data } = await dbAuth.rpc('fn_divisao_movimento', { p_origem_tipo: e.origem_tipo, p_origem_id: e.origem_id });
        AJ.linhas = (data || []).filter(d => d.pessoa_id).map(d => ({ pessoa_id: d.pessoa_id, nome: d.nome, percentual: num(d.percentual) }));
        AJ.tinhaExcecao = (data || []).some(d => d.origem === 'excecao');
    } catch (err) { console.warn('[pessoas] divisão', err); }
}
function desenharAjuste(sheet, titulo, infos) {
    const lista = (typeof pessoas !== 'undefined' && Array.isArray(pessoas)) ? pessoas : [];
    const fora = lista.filter(x => x.id && !AJ.linhas.some(l => l.pessoa_id === x.id)).sort((a, b) => String(a.nome).localeCompare(String(b.nome)));
    const soma = Math.round(AJ.linhas.reduce((t, l) => t + num(l.percentual), 0) * 100) / 100;
    const ok = AJ.linhas.length > 0 && Math.abs(soma - 100) < 0.01;
    const base = num(AJ.e.valor_movimento);
    const motivoAtual = sheet.querySelector('#pes-aj-motivo')?.value || '';
    sheet.innerHTML = '<div class="rz-grab"></div>' + titulo + `<div class="rz-sh-b">${infos}
        <div class="rz-group">Divisão deste item</div>
        <div class="rz-card rz-list">${AJ.linhas.map((l, i) => `<div class="rz-row rz-pes-div">
            <div class="rz-tx"><b>${esc(l.nome)}</b><span>${base ? esc(moeda(base * num(l.percentual) / 100)) : ''}</span></div>
            <input type="number" inputmode="decimal" step="0.01" min="0" max="100" data-pct="${i}" value="${num(l.percentual)}" aria-label="Percentual de ${esc(l.nome)}"><span class="rz-pes-pc">%</span>
            <button type="button" class="rz-pes-tirar" data-tirar="${i}" aria-label="Tirar ${esc(l.nome)}"><svg data-lucide="trash-2"></svg></button></div>`).join('')}
          ${fora.length ? `<div class="rz-row"><div class="rz-tx" style="flex:1"><select id="pes-aj-add" aria-label="Adicionar pessoa"><option value="">+ Adicionar pessoa</option>${fora.map(x => `<option value="${esc(x.id)}">${esc(x.nome)}</option>`).join('')}</select></div></div>` : ''}
        </div>
        <div class="rz-pes-soma${ok ? '' : ' rz-bad'}"><span>Soma</span><b>${soma.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%${ok ? '' : ' · precisa dar 100%'}</b></div>
        <div class="rz-f" style="margin-top:12px"><label>Motivo do ajuste <i>*</i></label><input type="text" id="pes-aj-motivo" maxlength="500" placeholder="Ex.: Paulo pagou a parte dele direto à Marina" value="${esc(motivoAtual)}"></div>
        <small class="rz-hint">Vale só para este item; a divisão do ativo e do contrato continua a mesma. Fica no registro: quem ajustou, quando e por quê.</small>
        </div><div class="rz-sh-f">${AJ.tinhaExcecao ? '<button type="button" class="rz-btn rz-btn-2" data-padrao>Voltar à divisão padrão</button>' : ''}<button type="button" class="rz-btn rz-btn-1${AJ.tinhaExcecao ? '' : ' rz-wide'}" data-salvar ${ok ? '' : 'disabled'}>Salvar ajuste</button></div>`;
    if (sheet.id === 'rz-sheet-2') { const x = sheet.querySelector('.rz-sh-h .rz-x'); if (x) { x.classList.add('rz-voltar'); x.setAttribute('aria-label', 'Voltar'); x.innerHTML = '<svg data-lucide="chevron-left"></svg>'; } }
    sheet.querySelectorAll('[data-pct]').forEach(el => el.addEventListener('change', () => { AJ.linhas[Number(el.dataset.pct)].percentual = num(String(el.value).replace(',', '.')); desenharAjuste(sheet, titulo, infos); }));
    sheet.querySelectorAll('[data-tirar]').forEach(el => el.addEventListener('click', () => { AJ.linhas.splice(Number(el.dataset.tirar), 1); desenharAjuste(sheet, titulo, infos); }));
    sheet.querySelector('#pes-aj-add')?.addEventListener('change', (ev) => {
        const x = lista.find(y => y.id === ev.target.value); if (!x) return;
        AJ.linhas.push({ pessoa_id: x.id, nome: x.nome, percentual: 0 }); desenharAjuste(sheet, titulo, infos);
    });
    sheet.querySelector('[data-salvar]')?.addEventListener('click', () => gravarAjuste(sheet, AJ.linhas.map(l => ({ pessoa_id: l.pessoa_id, percentual: num(l.percentual), modo: 'percentual' }))));
    sheet.querySelector('[data-padrao]')?.addEventListener('click', () => gravarAjuste(sheet, []));
    icones();
}
async function gravarAjuste(sheet, itens) {
    const motivo = String(sheet.querySelector('#pes-aj-motivo')?.value || '').trim();
    if (!motivo) { rzToast('Diga o motivo do ajuste.', { tipo: 'danger' }); sheet.querySelector('#pes-aj-motivo')?.focus(); return; }
    const { data, error } = await dbAuth.rpc('fn_divisao_excecao_definir', { p_origem_tipo: AJ.e.origem_tipo, p_origem_id: AJ.e.origem_id, p_motivo: motivo, p_itens: itens });
    if (error) { rzToast(error.message, { tipo: 'danger' }); return; }
    rzToast(data?.mensagem || 'Feito.', { tipo: data?.ok ? 'success' : 'danger' });
    if (!data?.ok) return;
    await recarregarExtrato();
}
async function recarregarExtrato() {
    if (AJ_FORA) { const f = AJ_FORA; AJ_FORA = null; g('fecharSheet')?.(); await f(); return; } // v1.1.0 — veio do relatório
    g('fecharSheet')?.();                                   // fecha o item (nível 2)
    const chave = EXT_ATUAL?.chave;
    await pessoasRender(CTX);                               // números da lista e do topo vêm do banco de novo
    if (chave) abrirExtrato(chave);
}
// retirada ou acerto (repasse): as ações de hoje, sem sair do extrato
function abrirRegistro(p, e, titulo, infos) {
    const retirada = e.natureza === 'distribuicao' || e.natureza === 'extraordinaria';
    const perm = pode(retirada ? 'repasses.registrar' : 'repasses.excluir');
    const sheet = abrirItem(titulo + `<div class="rz-sh-b">${infos}
        ${!perm.ok ? `<p class="rz-desc" style="margin-top:10px">${esc(perm.textoCurto || 'Sem permissão para mexer neste registro.')}</p>`
        : retirada ? `<button type="button" class="rz-act" data-ret><div class="rz-ic"><svg data-lucide="pencil"></svg></div><div>Editar a retirada<small>Extraordinária ou do fluxo, dividir em partes, excluir</small></div></button>`
        : `<button type="button" class="rz-act" data-desf><div class="rz-ic rz-bad"><svg data-lucide="undo-2"></svg></div><div>Desfazer este registro<small>O valor volta a ficar pendente entre as duas pontas</small></div></button>`}
        </div>`);
    if (!sheet) return;
    sheet.querySelector('[data-ret]')?.addEventListener('click', async () => {
        const achou = await CTX.acoesRetirada?.(e.origem_id);
        if (!achou) rzToast('Não achei esta retirada no ano do mês escolhido. Troque o mês no topo para o ano dela.', { tipo: 'info' });
    });
    sheet.querySelector('[data-desf]')?.addEventListener('click', async () => {
        const sim = await rzConfirmar({ titulo: 'Desfazer este registro?', impacto: `${moeda(e.valor_movimento)} · ${dataBR(e.data)}. O valor volta a ficar pendente entre as duas pontas.`, rotuloConfirmar: 'Desfazer', destrutivo: true });
        if (!sim) return;
        const { data, error } = await dbAuth.rpc('fn_acerto_desfazer', { p_acerto_id: e.origem_id });
        if (error) { rzToast(error.message, { tipo: 'danger' }); return; }
        rzToast(data?.mensagem || 'Feito.', { tipo: data?.ok ? 'success' : 'danger' });
        if (data?.ok) await recarregarExtrato();
    });
    icones();
}

// ---------------------------------------------------------------- quitar
function escolherQuitar(p, abertos) {
    const abrirSheet = g('abrirSheet'), cab = g('rzSheetCabecalho');
    if (!abrirSheet || !cab) return;
    if (abertos.length === 1) { g('fecharSheet')?.(); CTX.quitar?.(p, abertos[0]); return; }
    const sheet = abrirSheet(cab('Quitar', `${p.nome} · escolha o que foi pago`) + `<div class="rz-sh-b"><div class="rz-card rz-list">` +
        abertos.map((l, i) => `<div class="rz-row rz-link" role="button" tabindex="0" data-q="${i}"><div class="rz-ic${l.valor > 0 ? ' rz-ok' : ''}"><svg data-lucide="${l.valor > 0 ? 'arrow-down-left' : 'arrow-up-right'}"></svg></div>
            <div class="rz-tx"><b>${l.valor > 0 ? `${esc(l.contraparteNome)} deve a ${esc(p.nome)}` : `${esc(p.nome)} deve a ${esc(l.contraparteNome)}`}</b><span>${esc(NAT[l.natureza] || l.natureza)}</span></div>
            <div class="rz-rt"><b>${esc(moeda(Math.abs(l.valor)))}</b></div><svg data-lucide="chevron-right" class="rz-chev"></svg></div>`).join('') + '</div></div>');
    sheet.querySelectorAll('[data-q]').forEach(el => el.addEventListener('click', () => { g('fecharSheet')?.(); CTX.quitar?.(p, abertos[Number(el.dataset.q)]); }));
    icones();
}
