// ============================================================================
// investimentos.js — Raiz Patrimônio · Ramo Investimentos (conta e aplicações)
// Versão: 1.1.0 · 25/11/2026
//
// v1.1.0 (25/11/2026, sessão 20261125-0118-investimentos-i1-1, demanda 368d8f36; PLANO_EXECUCAO_I1_1_AJUSTES_APLICACAO_RAIZ v1.0.0,
// de acordo do Nicola 25/11 01:18 "De acordo com A-E") — ajustes do teste no Cdb teste:
//   A · liquidez "Depois da carência" pede os dias (dados_modelo.carencia_dias); Condições mostra os dias e a data que libera.
//   B · sai o card Movimentos do Resumo: a aba Financeiro tem um botão só, "Registrar movimento", com aplicação, resgates,
//       rendimento, taxa e IR (aplicação encerrada só lança rendimento, taxa e IR).
//   C · sai o card "Itens da aplicação": o card Ocorrências da aplicação lista as ocorrências dos itens dela ("Atualizar valor"
//       todo mês, "Aporte" na previdência) — a aberta abre Informar valor; a concluída mostra data, valor e origem. O card
//       padrão (contratos.js) só lê ocorrência do próprio contrato, por isso fica escondido nesta ficha.
//   D · Emissor escolhido da lista de partes da empresa (as que já são emissor ou instituição primeiro) ou "+ Cadastrar
//       emissor novo"; escolhido, o CNPJ vem do cadastro e a aplicação reusa a parte (só ganha o papel emissor).
//   E · Financeiro da aplicação no olhar da aplicação: aplicação e rendimento +, resgate, taxa e IR −. O lançamento no
//       Financeiro geral não muda (resgate = entrada de caixa).
//
// v1.0.0 (25/11/2026, sessão 20261125-0029-investimentos-i1, demanda e5d269c2; PLANO_EXECUCAO_I1_CONTA_E_APLICACOES_RAIZ v1.2.0,
// de acordo do Nicola 25/11 00:29 e F5) — criação. A conta de investimento é um ativo (ou sub-ativo da pessoa) com o uso
// Investimento; cada aplicação é um contrato de modelo 'investimento' (tipos inv_*), sem uso próprio (F5).
//   · montarCardAplicacoes: na aba Usos e contratos da conta, o card "Aplicações" no lugar da lista de contratos — agrupado por
//     tipo (subtotal, vencimento crescente; sem vencimento por último, pelo valor) ou corrido por vencimento; "+ Nova aplicação".
//   · Nova aplicação: tipo → formulário → uso Investimento (se ainda não houver) + contrato + emissor (parte, papel emissor) +
//     itens do tipo (fn_contrato_itens_sugeridos_criar) + 1º movimento (fn_aplicacao_movimento_registrar).
//   · aplicarFichaAplicacao: a ficha do contrato com as seções do tipo (chamada pelo contrato-licenca.js): título, faixa,
//     Condições, Valor (colunas da I0, valor de cada mês = ocorrência de "Atualizar valor"), Ocorrências, Financeiro e Partes.
//   · linhasValorConta: série da conta = soma das aplicações mês a mês (usada pelo card Valor do bem da conta, cofre-ativos.js).
// O valor atual mora em contratos.valor; o histórico, nas ocorrências do item "Atualizar valor" (F3). Sem projeção (I3).
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

// ---------------------------------------------------------------------------------------------------- catálogo
const GRUPOS = [
    { g: 'Renda fixa', pref: 'inv_rf_' }, { g: 'Fundos', pref: 'inv_fundo' },
    { g: 'Previdência', pref: 'inv_prev' }, { g: 'Poupança', pref: 'inv_poup' },
];
const grupoDoTipo = (cod) => (GRUPOS.find(x => String(cod || '').startsWith(x.pref)) || { g: 'Outras' }).g;
const ICONE_TIPO = { inv_rf_cdb: 'percent', inv_rf_lci: 'percent', inv_rf_tesouro: 'landmark', inv_rf_credito: 'scroll-text', inv_fundo: 'pie-chart', inv_prev: 'umbrella', inv_poup: 'piggy-bank' };
const TEM_VENC = (cod) => String(cod || '').startsWith('inv_rf_');
const INDEXADORES = [['cdi', '% do CDI'], ['ipca', 'IPCA +'], ['pre', 'Prefixado'], ['selic', 'Selic +'], ['poupanca', 'Poupança'], ['outro', 'Outro']];
const LIQUIDEZ = [['vencimento', 'No vencimento'], ['diaria', 'Diária'], ['carencia', 'Depois da carência']];
let tiposCache = null;
async function tiposAplicacao() {
    if (tiposCache) return tiposCache;
    const { data, error } = await db().from('contrato_tipos').select('codigo, nome, descricao, ordem, status').eq('modelo', 'investimento').eq('status', 'ativo').order('ordem');
    if (error) throw error;
    tiposCache = data || [];
    return tiposCache;
}
const nomeTipo = (cod) => (tiposCache || []).find(t => t.codigo === cod)?.nome || 'Aplicação';
function indexadorTexto(dm) {
    const t = dm?.taxa != null && dm?.taxa !== '' ? Number(dm.taxa).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) : '';
    switch (dm?.indexador) {
        case 'cdi': return t ? `${t}% do CDI` : 'CDI';
        case 'ipca': return t ? `IPCA + ${t}%` : 'IPCA';
        case 'pre': return t ? `${t}% a.a.` : 'Prefixado';
        case 'selic': return t ? `Selic + ${t}%` : 'Selic';
        case 'poupanca': return 'Poupança';
        case 'outro': return dm?.indexador_texto || 'Outro';
        default: return '';
    }
}

// ---------------------------------------------------------------------------------------------------- dados
async function aplicacoesDaConta(ativoId) {
    const { data, error } = await db().from('contratos').select('id, tipo_contrato, descricao, valor, inicio, fim, status, dados_modelo')
        .eq('ativo_id', ativoId).eq('modelo', 'investimento');
    if (error) throw error;
    return (data || []).map(c => ({ ...c, st: String(c.status || '').toLowerCase() }));
}
const encerrada = (c) => c.st === 'encerrado' || c.st === 'finalizado';
let subAtualizarId = null;
async function historicoValores(contratoIds) {
    if (!contratoIds.length) return [];
    if (!subAtualizarId) {
        const { data } = await db().from('cofre_controle_subtipos').select('id').eq('codigo', 'aplicacao_atualizar_valor').is('cliente_id', null).maybeSingle();
        subAtualizarId = data?.id || null;
    }
    if (!subAtualizarId) return [];
    const { data: itens, error: e1 } = await db().from('cofre_itens_controle').select('id, contrato_id').in('contrato_id', contratoIds).eq('subtipo_id', subAtualizarId);
    if (e1) throw e1;
    if (!(itens || []).length) return [];
    const porItem = Object.fromEntries(itens.map(i => [i.id, i.contrato_id]));
    const { data: oc, error: e2 } = await db().from('cofre_ocorrencias_controle').select('id, item_controle_id, data_prevista_atual, valor_real, origem, tratamento_descricao, tratado_em')
        .in('item_controle_id', Object.keys(porItem)).eq('status_execucao', 'concluido').not('valor_real', 'is', null);
    if (e2) throw e2;
    return (oc || []).map(o => ({ contrato_id: porItem[o.item_controle_id], data_base: String(o.data_prevista_atual).slice(0, 10), valor: Number(o.valor_real),
        origem: o.origem, obs: o.tratamento_descricao, criado_em: o.tratado_em || '' }));
}
const ORIGEM_ROT = { manual: 'Informado', extrato: 'Extrato', print: 'Print', movimento: 'Movimento', estimativa: 'Estimativa' };

// Série da conta para o card Valor do bem: uma linha por mês em que alguma aplicação teve valor novo (ou foi encerrada),
// com a soma do último valor de cada aplicação naquele fim de mês. Mês sem evento repete a soma (o card marca "estimado").
export async function linhasValorConta(ativoId) {
    const apl = await aplicacoesDaConta(ativoId);
    const hist = await historicoValores(apl.map(c => c.id));
    const meses = new Set(hist.map(h => h.data_base.slice(0, 7)));
    apl.filter(c => encerrada(c) && c.fim).forEach(c => meses.add(String(c.fim).slice(0, 7)));
    const fimDoMes = (ym) => { const [y, m] = ym.split('-').map(Number); const d = new Date(y, m, 0).getDate(); const f = `${ym}-${String(d).padStart(2, '0')}`; return f > hoje() ? hoje() : f; };
    const linhas = [...meses].sort().map(ym => {
        const fim = fimDoMes(ym);
        let soma = 0;
        apl.forEach(c => {
            if (encerrada(c) && c.fim && String(c.fim).slice(0, 10) <= fim) return; // resgatada: zero depois do fim
            const ult = hist.filter(h => h.contrato_id === c.id && h.data_base <= fim).sort((a, b) => a.data_base.localeCompare(b.data_base)).pop();
            if (ult) soma += ult.valor;
        });
        return { tipo: 'mercado', data_base: fim, valor: Math.round(soma * 100) / 100, fonte: 'aplicacoes', criado_em: fim };
    }).filter(l => l.valor > 0);
    const ativas = apl.filter(c => !encerrada(c));
    return { linhas, atual: ativas.reduce((s, c) => s + Number(c.valor || 0), 0), ativas: ativas.length, total: apl.length };
}

// ---------------------------------------------------------------------------------------------------- card Aplicações (conta)
const modoLista = new Map();
export async function montarCardAplicacoes(a, { abrirContrato, aoContar } = {}) {
    const base = document.getElementById('fa-card-contratos');
    if (!base) return;
    base.classList.add('hidden');
    let card = document.getElementById('fa-card-aplicacoes');
    if (!card) { card = document.createElement('div'); card.className = 'rz-card rz-list'; card.id = 'fa-card-aplicacoes'; base.insertAdjacentElement('afterend', card); }
    card.innerHTML = `<div class="rz-card-h"><h3>Aplicações</h3></div>${sk(3)}`;
    let apl = [];
    try { await tiposAplicacao(); apl = await aplicacoesDaConta(a.id); } catch (e) { card.innerHTML = `<div class="rz-card-h"><h3>Aplicações</h3></div><p class="rz-desc">${esc(e?.message || 'Não consegui ler as aplicações.')}</p>`; return; }
    const ativas = apl.filter(c => !encerrada(c)), fechadas = apl.filter(encerrada);
    aoContar?.(ativas.length);
    const total = ativas.reduce((s, c) => s + Number(c.valor || 0), 0);
    const modo = modoLista.get(a.id) || 'tipo';
    const ordVenc = (x, y) => (x.fim && y.fim) ? String(x.fim).localeCompare(String(y.fim)) : x.fim ? -1 : y.fim ? 1 : Number(y.valor || 0) - Number(x.valor || 0);
    const linha = (c) => {
        const venc = TEM_VENC(c.tipo_contrato) && c.fim ? 'vence ' + dataBR(c.fim) : 'sem vencimento';
        const idx = indexadorTexto(c.dados_modelo || {});
        const st = encerrada(c) ? '<span class="rz-st rz-neu">Encerrada</span>' : '<span class="rz-st rz-ok">Ativa</span>';
        return `<div class="rz-row rz-link" data-apl="${c.id}"><div class="rz-ic"><i data-lucide="${ICONE_TIPO[c.tipo_contrato] || 'coins'}"></i></div>
            <div class="rz-tx"><b>${esc(c.descricao || nomeTipo(c.tipo_contrato))}</b><span>${esc([nomeTipo(c.tipo_contrato), venc, idx].filter(Boolean).join(' · '))}</span></div>
            <div class="rz-rt"><b>${esc(moeda(c.valor))}</b>${st}</div><i data-lucide="chevron-right" class="rz-chev"></i></div>`;
    };
    let corpo = '';
    if (!apl.length) {
        corpo = `<div class="rz-empty"><div class="rz-ic"><i data-lucide="coins"></i></div><p>Nenhuma aplicação nesta conta ainda. Comece por "Nova aplicação".</p></div>`;
    } else if (modo === 'tipo') {
        GRUPOS.concat([{ g: 'Outras' }]).forEach(({ g }) => {
            const l = ativas.filter(c => grupoDoTipo(c.tipo_contrato) === g).sort(ordVenc);
            if (!l.length) return;
            corpo += `<div class="rz-group rz-group-t"><span>${esc(g)} · ${l.length}</span><b>${esc(moeda(l.reduce((s, c) => s + Number(c.valor || 0), 0)))}</b></div>` + l.map(linha).join('');
        });
    } else {
        const cV = ativas.filter(c => TEM_VENC(c.tipo_contrato) && c.fim).sort(ordVenc), sV = ativas.filter(c => !(TEM_VENC(c.tipo_contrato) && c.fim)).sort(ordVenc);
        if (cV.length) corpo += '<div class="rz-group">Com vencimento · o mais próximo primeiro</div>' + cV.map(linha).join('');
        if (sV.length) corpo += '<div class="rz-group">Sem vencimento · pelo valor</div>' + sV.map(linha).join('');
    }
    if (fechadas.length) corpo += `<div class="rz-group">Encerradas · ${fechadas.length}</div>` + fechadas.sort((x, y) => String(y.fim || '').localeCompare(String(x.fim || ''))).map(linha).join('');
    card.innerHTML = `<div class="rz-card-h"><h3>Aplicações</h3><span class="rz-sub">${ativas.length} · ${esc(moeda(total))}</span></div>
        ${apl.length ? `<div class="rz-seg rz-apl-seg" role="group" aria-label="Organizar aplicações"><button type="button" data-apl-modo="tipo" class="${modo === 'tipo' ? 'rz-on' : ''}">Por tipo</button><button type="button" data-apl-modo="venc" class="${modo === 'venc' ? 'rz-on' : ''}">Por vencimento</button></div>` : ''}
        ${corpo}
        <button type="button" class="rz-add" data-rz-codigo="contratos.criar" data-apl-nova><i data-lucide="plus"></i> Nova aplicação</button>`;
    card.querySelectorAll('[data-apl-modo]').forEach(b => b.addEventListener('click', () => { modoLista.set(a.id, b.dataset.aplModo); montarCardAplicacoes(a, { abrirContrato, aoContar }); }));
    card.querySelectorAll('[data-apl]').forEach(r => r.addEventListener('click', () => abrirContrato?.(r.dataset.apl)));
    card.querySelector('[data-apl-nova]')?.addEventListener('click', () => abrirNovaAplicacao(a, () => montarCardAplicacoes(a, { abrirContrato, aoContar })));
    icones();
}

// ---------------------------------------------------------------------------------------------------- nova aplicação
async function abrirNovaAplicacao(a, aoConcluir) {
    if (typeof rzMostrarBloqueio === 'function' && rzMostrarBloqueio('contratos.criar')) return;
    let tipos = [];
    try { tipos = await tiposAplicacao(); } catch (e) { toast(e?.message || 'Não consegui ler os tipos.', 'erro'); return; }
    if (typeof abrirSheetAcoes !== 'function') { toast('Abra pelo app principal.', 'erro'); return; }
    abrirSheetAcoes({ titulo: 'Nova aplicação', sub: a.nome_exibicao, acoes: tipos.map(t => ({
        icone: ICONE_TIPO[t.codigo] || 'coins', titulo: t.nome, sub: t.descricao || '', codigo: 'contratos.criar',
        aoTocar: () => abrirFormAplicacao(a, t, aoConcluir),
    })) });
}

function campo(id, rot, html, extra = '') { return `<div class="rz-f"${extra}><label for="${id}">${esc(rot)}</label>${html}</div>`; }
async function partesParaEmissor(clienteId) {
    const [{ data: pts }, { data: pps }] = await Promise.all([
        db().from('partes').select('id, nome, documento').eq('cliente_id', clienteId).order('nome'),
        db().from('partes_papeis').select('parte_id').in('papel', ['emissor', 'instituicao']).eq('ativo', true),
    ]);
    const usados = new Set((pps || []).map(x => x.parte_id));
    const l = (pts || []).map(p => ({ ...p, usado: usados.has(p.id) }));
    return { usados: l.filter(p => p.usado), outras: l.filter(p => !p.usado) };
}
async function abrirFormAplicacao(a, t, aoConcluir) {
    if (typeof abrirSheetForm !== 'function') { toast('Abra pelo app principal.', 'erro'); return; }
    let ptsEm = { usados: [], outras: [] };
    try { ptsEm = await partesParaEmissor(a.cliente_id); } catch (e) { console.warn('[investimentos] partes:', e?.message || e); }
    const todasPts = [...ptsEm.usados, ...ptsEm.outras];
    const cod = t.codigo, venc = TEM_VENC(cod), fundo = cod === 'inv_fundo', prev = cod === 'inv_prev', poup = cod === 'inv_poup';
    const sel = (id, ops, v) => `<select id="${id}">${ops.map(([k, r]) => `<option value="${k}"${k === v ? ' selected' : ''}>${esc(r)}</option>`).join('')}</select>`;
    const indexPadrao = cod === 'inv_rf_tesouro' ? 'ipca' : poup ? 'poupanca' : 'cdi';
    const rotEm = poup ? 'Banco' : fundo ? 'Fundo' : prev ? 'Seguradora' : 'Emissor';
    const padraoNome = cod === 'inv_rf_tesouro' ? 'Tesouro Nacional' : '';
    const padraoPt = padraoNome ? todasPts.find(p => String(p.nome).toLowerCase() === padraoNome.toLowerCase()) : null;
    const escolhaIni = padraoPt ? padraoPt.id : (padraoNome || !todasPts.length) ? '__nova__' : '';
    const opt = (p) => `<option value="${p.id}"${p.id === escolhaIni ? ' selected' : ''}>${esc(p.nome)}</option>`;
    const optsEm = ['<option value="">— escolher —</option>',
        ptsEm.usados.length ? `<optgroup label="Já usados em aplicações">${ptsEm.usados.map(opt).join('')}</optgroup>` : '',
        ptsEm.outras.length ? `<optgroup label="Outras partes da empresa">${ptsEm.outras.map(opt).join('')}</optgroup>` : '',
        `<option value="__nova__"${escolhaIni === '__nova__' ? ' selected' : ''}>+ Cadastrar ${esc(rotEm.toLowerCase())} novo</option>`].join('');
    window.__invEmissor = (val) => {
        const nova = val === '__nova__', pt = todasPts.find(p => p.id === val);
        document.getElementById('inv-em-nova')?.classList.toggle('hidden', !nova);
        const info = document.getElementById('inv-em-info');
        if (info) { info.classList.toggle('hidden', !pt); info.textContent = pt ? (pt.documento ? `CNPJ ${pt.documento} · do cadastro` : 'Sem CNPJ no cadastro: complete em Partes.') : ''; }
    };
    const corpo = [
        campo('inv-nome', 'Nome da aplicação', `<input type="text" id="inv-nome" maxlength="80" placeholder="${esc(poup ? 'Poupança Itaú' : fundo ? 'Multimercado FIC' : prev ? 'PGBL Brasilprev' : 'CDB Banco Pine 120% CDI')}">`),
        campo('inv-em-sel', rotEm, `<select id="inv-em-sel" onchange="window.__invEmissor && window.__invEmissor(this.value)">${optsEm}</select>`),
        `<p class="rz-desc${escolhaIni && escolhaIni !== '__nova__' ? '' : ' hidden'}" id="inv-em-info"></p>`,
        `<div class="rz-f2${escolhaIni === '__nova__' ? '' : ' hidden'}" id="inv-em-nova">${campo('inv-emissor', fundo ? 'Nome do fundo' : 'Nome', `<input type="text" id="inv-emissor" maxlength="80" value="${esc(padraoPt ? '' : padraoNome)}">`)}
         ${campo('inv-emissor-doc', fundo ? 'CNPJ do fundo' : 'CNPJ', `<input type="text" id="inv-emissor-doc" inputmode="numeric" maxlength="18" placeholder="00.000.000/0000-00">`)}</div>`,
        `<div class="rz-f2">${campo('inv-data', 'Data da aplicação', `<input type="date" id="inv-data" max="${hoje()}" value="${hoje()}">`)}
         ${campo('inv-valor', 'Valor aplicado (R$)', `<input type="number" id="inv-valor" step="0.01" min="0" inputmode="decimal">`)}</div>`,
        venc ? campo('inv-venc', 'Vencimento', `<input type="date" id="inv-venc">`) : '',
        (poup || prev) ? '' : `<div class="rz-f2">${campo('inv-index', 'Indexador', sel('inv-index', INDEXADORES, indexPadrao))}
         ${campo('inv-taxa', 'Taxa', `<input type="number" id="inv-taxa" step="0.01" inputmode="decimal" placeholder="${cod === 'inv_rf_tesouro' ? '6,10' : '120'}">`)}</div>`,
        venc ? campo('inv-liq', 'Liquidez', `<select id="inv-liq" onchange="document.getElementById('inv-car-wrap')?.classList.toggle('hidden', this.value !== 'carencia')">${LIQUIDEZ.map(([k, r]) => `<option value="${k}"${k === 'vencimento' ? ' selected' : ''}>${esc(r)}</option>`).join('')}</select>`) : '',
        venc ? `<div id="inv-car-wrap" class="hidden">${campo('inv-car', 'Carência (dias)', `<input type="number" id="inv-car" min="1" max="3650" step="1" inputmode="numeric" placeholder="90">`)}</div>` : '',
        prev ? `<div class="rz-f2">${campo('inv-regime', 'Plano', sel('inv-regime', [['pgbl', 'PGBL'], ['vgbl', 'VGBL']], 'vgbl'))}${campo('inv-trib', 'Tributação', sel('inv-trib', [['regressiva', 'Regressiva'], ['progressiva', 'Progressiva']], 'regressiva'))}</div>` : '',
        poup ? campo('inv-aniv', 'Dia do aniversário', `<input type="number" id="inv-aniv" min="1" max="31" inputmode="numeric">`) : '',
        `<p class="rz-desc">A aplicação conta no limite de contratos do plano. Novas aplicações no mesmo título e resgates entram depois, em "Registrar movimento".</p>`,
    ].join('');
    abrirSheetForm({
        titulo: t.nome, sub: a.nome_exibicao, corpo, rotuloSalvar: 'Salvar aplicação',
        aoSalvar: async () => {
            const v = (id) => (document.getElementById(id)?.value || '').trim();
            const escolha = v('inv-em-sel'), ptEsc = todasPts.find(p => p.id === escolha);
            if (!escolha) { toast(`Escolha ${poup ? 'o banco' : fundo ? 'o fundo' : prev ? 'a seguradora' : 'o emissor'} ou cadastre.`, 'erro'); return false; }
            const nome = v('inv-nome'), data = v('inv-data');
            const emissor = ptEsc ? ptEsc.nome : v('inv-emissor'), doc = ptEsc ? (ptEsc.documento || '') : v('inv-emissor-doc');
            const valor = Number(String(v('inv-valor')).replace(',', '.'));
            if (!nome) { toast('Dê um nome à aplicação.', 'erro'); return false; }
            if (!emissor) { toast(`Informe ${poup ? 'o banco' : fundo ? 'o fundo' : prev ? 'a seguradora' : 'o emissor'}.`, 'erro'); return false; }
            if (!data || data > hoje()) { toast('Informe a data da aplicação, até hoje.', 'erro'); return false; }
            if (!(valor > 0)) { toast('Informe o valor aplicado.', 'erro'); return false; }
            const fim = venc ? v('inv-venc') : '';
            if (venc && !fim) { toast('Informe o vencimento.', 'erro'); return false; }
            if (fim && fim <= data) { toast('O vencimento precisa ser depois da aplicação.', 'erro'); return false; }
            const dm = { aplicado_inicial: valor, emissor_nome: emissor };
            if (doc) dm.emissor_documento = doc;
            if (!(poup || prev)) { dm.indexador = v('inv-index') || null; const tx = v('inv-taxa'); if (tx) dm.taxa = Number(tx.replace(',', '.')); }
            if (poup) dm.indexador = 'poupanca';
            if (venc) dm.liquidez = v('inv-liq') || 'vencimento';
            if (dm.liquidez === 'carencia') {
                const dias = Number(v('inv-car'));
                if (!(Number.isInteger(dias) && dias >= 1 && dias <= 3650)) { toast('Informe os dias de carência.', 'erro'); return false; }
                dm.carencia_dias = dias;
            }
            if (cod === 'inv_rf_lci') dm.isento_ir = true;
            if (prev) { dm.regime = v('inv-regime'); dm.tributacao = v('inv-trib'); }
            if (poup) { const an = Number(v('inv-aniv')); if (an >= 1 && an <= 31) dm.aniversario = an; }
            try {
                await criarAplicacao(a, cod, { nome, emissor, doc, data, valor, fim: fim || null, dm, parteId: ptEsc?.id || null });
                toast('Aplicação registrada', 'sucesso');
                aoConcluir?.();
                return true;
            } catch (e) { toast(e?.message || 'Não consegui registrar a aplicação.', 'erro'); return false; }
        },
    });
    setTimeout(() => window.__invEmissor?.(escolhaIni), 0); // CNPJ do emissor já escolhido (Tesouro Nacional cadastrado)
}

async function garantirUsoInvestimento(a, inicio) {
    const { data } = await db().from('ativo_usos').select('id, inicio, fim').eq('ativo_id', a.id).eq('modelo', 'investimento');
    const hojeS = hoje();
    if ((data || []).some(u => !u.fim || u.fim >= hojeS)) return;
    const { error } = await db().rpc('fn_ativo_uso_iniciar', { p_ativo_id: a.id, p_modelo: 'investimento', p_inicio: inicio, p_fim: null, p_observacao: null, p_canal: 'app' });
    if (error) throw error;
}
async function parteEmissor(clienteId, nome, doc) {
    const dig = String(doc || '').replace(/\D/g, '');
    let q = db().from('partes').select('id').eq('cliente_id', clienteId).limit(1);
    const { data } = dig ? await db().from('partes').select('id, documento').eq('cliente_id', clienteId).not('documento', 'is', null)
        : await q.ilike('nome', nome);
    const achada = dig ? (data || []).find(p => String(p.documento || '').replace(/\D/g, '') === dig) : (data || [])[0];
    if (achada) return achada.id;
    const { data: nova, error } = await db().from('partes').insert({ cliente_id: clienteId, nome, doc_tipo: dig ? (dig.length > 11 ? 'CNPJ' : 'CPF') : null, documento: dig ? doc : null })
        .select('id').single();
    if (error) throw error;
    return nova.id;
}
async function criarAplicacao(a, cod, { nome, emissor, doc, data, valor, fim, dm, parteId: parteEscolhida }) {
    const clienteId = a.cliente_id;
    await garantirUsoInvestimento(a, data);
    const { data: con, error } = await db().from('contratos').insert({
        cliente_id: clienteId, ativo_id: a.id, modelo: 'investimento', tipo_contrato: cod, status: 'ativo',
        inicio: data, fim, descricao: nome, dados_modelo: dm,
    }).select('id').single();
    if (error) throw error;
    // emissor (papel novo, F2) — falha aqui não desfaz a aplicação: aparece no Partes para completar
    try {
        const parteId = parteEscolhida || await parteEmissor(clienteId, emissor, doc);
        await db().from('partes_papeis').insert({ parte_id: parteId, papel: 'emissor', entidade_tipo: 'contrato', entidade_id: con.id, ativo: true });
    } catch (e) { console.warn('[investimentos] emissor:', e?.message || e); }
    // itens do tipo (automáticos): "Atualizar valor"
    try {
        const { data: mods } = await db().from('cofre_modelos_item_controle').select('id').eq('escopo_tipo', 'contrato_tipo').eq('escopo_valor', cod).eq('automatico', true).eq('ativo', true);
        const ids = (mods || []).map(m => m.id);
        if (ids.length) await db().rpc('fn_contrato_itens_sugeridos_criar', { p_contrato_id: con.id, p_modelos: ids, p_canal: 'app' });
    } catch (e) { console.warn('[investimentos] itens:', e?.message || e); }
    const { error: eMov } = await db().rpc('fn_aplicacao_movimento_registrar', { p_contrato_id: con.id, p_tipo: 'aplicacao', p_data: data, p_valor: valor, p_observacao: 'Aplicação inicial' });
    if (eMov) throw eMov;
    await recarregarContratosApp();
    window.dispatchEvent(new CustomEvent('cofre:recarregar-eventos'));
    return con.id;
}
async function recarregarContratosApp() {
    try {
        if (typeof window.carregarContratosSupabase === 'function' && typeof contratos !== 'undefined') {
            contratos = await window.carregarContratosSupabase(); // eslint-disable-line no-global-assign
        }
    } catch (e) { console.warn('[investimentos] recarregar contratos:', e?.message || e); }
}

// ---------------------------------------------------------------------------------------------------- ficha da aplicação
export async function aplicarFichaAplicacao(conApp, raiz) {
    if (!raiz) return;
    await tiposAplicacao().catch(() => []);
    // a lista do app não traz descricao nem o status 'finalizado' como no banco: a ficha lê a linha do contrato
    const { data: row } = await db().from('contratos').select('id, descricao, valor, dados_modelo, status, inicio, fim, tipo_contrato, ativo_id').eq('id', conApp.id).maybeSingle();
    const con = row ? { id: row.id, descricao: row.descricao, valor: row.valor, dadosModelo: row.dados_modelo || {}, status: String(row.status || ''),
        inicio: row.inicio, fim: row.fim, tipoContrato: row.tipo_contrato, ativoId: row.ativo_id } : conApp;
    const dm = con.dadosModelo || {};
    const tipoNome = nomeTipo(con.tipoContrato);
    // título e faixa
    const tit = raiz.querySelector('.rz-entity .rz-tx b'); if (tit) tit.textContent = con.descricao || tipoNome;
    const sub = raiz.querySelector('.rz-entity .rz-tx span'); if (sub) sub.textContent = [tipoNome, dm.emissor_nome].filter(Boolean).join(' · ');
    const ic = raiz.querySelector('.rz-entity .rz-ic'); if (ic) ic.innerHTML = `<svg data-lucide="${ICONE_TIPO[con.tipoContrato] || 'coins'}"></svg>`;
    const faixa = raiz.querySelector('.rz-fc-faixa');
    const vencimento = TEM_VENC(con.tipoContrato) && con.fim;
    const meses = vencimento ? Math.round((new Date(con.fim + 'T00:00:00') - new Date()) / (30.44 * 86400000)) : null;
    if (faixa) faixa.innerHTML = `<div><small>Valor atual</small><b>${esc(moeda(con.valor).replace(/,00$/, ''))}</b></div>
        <div><small>Aplicado</small><b>${esc(moeda(dm.aplicado_inicial || 0).replace(/,00$/, ''))}</b></div>
        <div><small>${vencimento ? 'Vence em' : 'Vencimento'}</small><b>${vencimento ? (meses > 0 ? `${meses} ${meses === 1 ? 'mês' : 'meses'}` : 'vencida') : 'sem'}</b></div>`;
    // condições
    const kv = raiz.querySelector('[data-fc-secao="resumo.condicoes"] .rz-kv');
    if (kv) {
        const k = (r, v, full) => `<div${full ? ' class="rz-full"' : ''}><small>${esc(r)}</small><b>${v}</b></div>`;
        const LIQ = Object.fromEntries(LIQUIDEZ);
        kv.innerHTML = [
            k('Aplicado', esc(moeda(dm.aplicado_inicial || 0))),
            dm.indexador ? k('Indexador', esc(indexadorTexto(dm))) : '',
            k('Início', dataBR(con.inicio)),
            TEM_VENC(con.tipoContrato) ? k('Vencimento', dataBR(con.fim)) : '',
            dm.liquidez ? k('Liquidez', esc(LIQ[dm.liquidez] || dm.liquidez) + (dm.liquidez === 'carencia' && dm.carencia_dias ? esc(` · ${dm.carencia_dias} dias${con.inicio ? ' (até ' + dataBR(somaDias(con.inicio, dm.carencia_dias)) + ')' : ''}`) : '')) : '',
            dm.isento_ir ? k('IR', 'Isenta para pessoa física') : '',
            dm.regime ? k('Plano', esc(String(dm.regime).toUpperCase() + (dm.tributacao ? ' · ' + dm.tributacao : ''))) : '',
            dm.aniversario ? k('Aniversário', 'dia ' + esc(dm.aniversario)) : '',
            k(con.tipoContrato === 'inv_fundo' ? 'Fundo' : con.tipoContrato === 'inv_prev' ? 'Seguradora' : con.tipoContrato === 'inv_poup' ? 'Banco' : 'Emissor',
              esc([dm.emissor_nome, dm.emissor_documento].filter(Boolean).join(' · ') || '—'), true),
        ].join('');
    }
    // cards do Resumo: Valor e Ocorrências (v1.1.0 — sem Movimentos e sem Itens; o card padrão de Ocorrências só lê
    // ocorrência do contrato e a da aplicação mora no item "Atualizar valor": fica escondido aqui)
    raiz.querySelector('#fc-card-ocorrencias')?.classList.add('hidden');
    const cond = raiz.querySelector('[data-fc-secao="resumo.condicoes"]');
    if (cond && !raiz.querySelector('#fc-card-apl-valor')) {
        cond.insertAdjacentHTML('afterend', `<div class="rz-card" id="fc-card-apl-valor">${sk(3)}</div>
            <div class="rz-card rz-list" id="fc-card-apl-oc"><div class="rz-card-h"><h3>Ocorrências</h3></div>${sk(2)}</div>`);
    }
    // Financeiro e Partes
    const fin = raiz.querySelector('#fc-painel-cobrancas');
    if (fin) fin.innerHTML = `<div class="rz-card rz-list" id="fc-card-apl-fin"><div class="rz-card-h"><h3>Financeiro</h3></div>${sk(3)}</div>`;
    const chipFin = raiz.querySelector('#fc-chips [data-fc-chip="cobrancas"] .rz-n'); if (chipFin) chipFin.textContent = '';
    const partes = raiz.querySelector('#fc-painel-partes');
    if (partes) partes.innerHTML = `<div class="rz-card rz-list" id="fc-card-apl-partes"><div class="rz-card-h"><h3>Partes</h3></div>${sk(2)}</div>`;
    const chipPartes = raiz.querySelector('#fc-chips [data-fc-chip="partes"] .rz-n'); if (chipPartes) chipPartes.textContent = '';
    icones();
    montarValorAplicacao(con).catch(e => console.warn('[investimentos] valor:', e?.message || e));
    montarFinanceiroAplicacao(con).catch(e => console.warn('[investimentos] financeiro:', e?.message || e));
    montarOcorrenciasAplicacao(con).catch(e => console.warn('[investimentos] ocorrências:', e?.message || e));
    montarPartesAplicacao(con).catch(e => console.warn('[investimentos] partes:', e?.message || e));
}

const modoValor = new Map();
async function montarValorAplicacao(con) {
    const card = document.getElementById('fc-card-apl-valor'); if (!card) return;
    const hist = (await historicoValores([con.id])).map(h => ({ tipo: 'mercado', data_base: h.data_base, valor: h.valor, fonte: h.origem, criado_em: h.criado_em, obs: h.obs }));
    const ca = await import('./cofre-ativos.js');
    const rot = (x) => ORIGEM_ROT[x.fonte] || 'Informado';
    const modoIni = ca.vbModoInicial(hist);
    const modo = modoIni ? (modoValor.get(con.id) || modoIni) : null;
    const menu = `<button type="button" class="rz-more" data-apl-valor-menu aria-label="Ações do valor"><i data-lucide="ellipsis-vertical"></i></button>`;
    card.innerHTML = `<div class="rz-card-h"><h3>Valor</h3>${menu}</div>
        <div class="rz-kv"><div><small>Valor atual</small><b>${esc(moeda(con.valor))}</b>${hist.length ? `<small>${esc(dataBR(hist.slice().sort((a, b) => a.data_base.localeCompare(b.data_base)).pop().data_base))}</small>` : ''}</div>
        <div><small>Desde a aplicação</small><b>${con.dadosModelo?.aplicado_inicial ? esc(pct(con.valor, con.dadosModelo.aplicado_inicial)) : '—'}</b></div></div>
        ${modo ? `<div class="rz-seg rz-vb-seg" role="group"><button type="button" data-vb-modo="mes" class="${modo === 'mes' ? 'rz-on' : ''}">Mês</button><button type="button" data-vb-modo="ano" class="${modo === 'ano' ? 'rz-on' : ''}">Ano</button></div>
        <div data-vb-grafico>${ca.vbGraficoHtml(hist, modo, rot)}</div>` : '<p class="rz-vb-sub">As colunas aparecem a partir do segundo valor informado.</p>'}`;
    const ligar = (m) => {
        const cols = ca.vbSerie(hist, m);
        card.querySelectorAll('[data-vb-grafico] .rz-vb-col').forEach(g => g.addEventListener('click', () => {
            const c = cols[Number(g.getAttribute('data-i'))]; if (!c) return;
            const linhas = c.estado === 'est' ? [`${moeda(c.valor)} em ${c.longo}.`, `Sem valor novo neste período: repete o de ${dataBR(c.linha.data_base)}.`]
                : [`${moeda(c.valor)} em ${c.longo}.`, `Valor de ${dataBR(c.linha.data_base)} · ${rot(c.linha)}.`];
            if (typeof rzAviso === 'function') rzAviso({ titulo: `Valor · ${c.longo}`, linhas }); else toast(linhas.join(' '));
        }));
    };
    if (modo) {
        ligar(modo);
        card.querySelectorAll('[data-vb-modo]').forEach(b => b.addEventListener('click', () => {
            const m = b.dataset.vbModo; modoValor.set(con.id, m);
            card.querySelectorAll('[data-vb-modo]').forEach(x => x.classList.toggle('rz-on', x === b));
            card.querySelector('[data-vb-grafico]').innerHTML = ca.vbGraficoHtml(hist, m, rot); ligar(m);
        }));
    }
    card.querySelector('[data-apl-valor-menu]')?.addEventListener('click', () => abrirSheetAcoes({ titulo: 'Valor', sub: con.descricao || '', acoes: [
        { icone: 'pencil', titulo: 'Informar valor', codigo: 'cofre.editar', sub: 'Do extrato ou app do banco', aoTocar: () => abrirInformarValor(con) },
        { icone: 'history', titulo: 'Ver todos os valores', sub: `${hist.length} ${hist.length === 1 ? 'valor' : 'valores'}`, aoTocar: () => (typeof rzAviso === 'function'
            ? rzAviso({ titulo: 'Todos os valores', linhas: hist.length ? hist.slice().sort((a, b) => b.data_base.localeCompare(a.data_base)).map(h => `${dataBR(h.data_base)} · ${moeda(h.valor)} · ${rot(h)}`) : ['Nenhum valor ainda.'] })
            : null) },
    ] }));
    icones();
}
const somaDias = (iso, n) => { const d = new Date(String(iso).slice(0, 10) + 'T12:00:00'); d.setDate(d.getDate() + Number(n || 0)); return d.toISOString().slice(0, 10); };
const pct = (atual, base) => { const p = (Number(atual) / Number(base) - 1) * 100; return `${p >= 0 ? '+' : '−'}${Math.abs(p).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`; };

function abrirInformarValor(con, dataSugerida) {
    const dIni = dataSugerida && String(dataSugerida).slice(0, 10) <= hoje() ? String(dataSugerida).slice(0, 10) : hoje();
    abrirSheetForm({ titulo: 'Informar valor', sub: con.descricao || '', rotuloSalvar: 'Salvar valor', empilhar: true,
        corpo: `<div class="rz-f2">${campo('inv-v-data', 'Data', `<input type="date" id="inv-v-data" max="${hoje()}" value="${dIni}">`)}${campo('inv-v-valor', 'Valor (R$)', `<input type="number" id="inv-v-valor" step="0.01" min="0" inputmode="decimal">`)}</div>
            ${campo('inv-v-origem', 'De onde veio', `<select id="inv-v-origem"><option value="manual">App ou site do banco</option><option value="extrato">Extrato</option></select>`)}`,
        aoSalvar: async () => {
            const data = document.getElementById('inv-v-data')?.value, valor = Number(String(document.getElementById('inv-v-valor')?.value || '').replace(',', '.'));
            if (!data || !(valor > 0)) { toast('Informe a data e o valor.', 'erro'); return false; }
            const { error } = await db().rpc('fn_aplicacao_valor_registrar', { p_contrato_id: con.id, p_data: data, p_valor: valor, p_origem: document.getElementById('inv-v-origem')?.value || 'manual', p_observacao: null });
            if (error) { toast(error.message || 'Não consegui salvar.', 'erro'); return false; }
            toast('Valor registrado', 'sucesso');
            await reabrirFicha(con.id);
            return true;
        } });
}

const MOV = { aplicacao: ['Aplicação', 'No mesmo título e taxa', 'arrow-up-right'],
    resgate_parcial: ['Resgate parcial', 'Reduz o valor da aplicação', 'arrow-down-left'],
    resgate_total: ['Resgate total', 'A aplicação fica encerrada', 'arrow-down-left'] };
const LANC = [['inv_rendimento', 'Rendimento', 'Juros recebidos', 'entrada', 'trending-up'], ['inv_taxa', 'Taxa', 'Taxa ou corretagem', 'saida', 'receipt'],
    ['inv_ir', 'IR', 'IR retido', 'saida', 'landmark']];
// v1.1.0 (E) — sinal no olhar da aplicação: o que entra nela (aplicação, rendimento) é +; o que sai dela (resgate, taxa, IR) é −
const sinalAplicacao = (x) => (['inv_resgate', 'inv_taxa', 'inv_ir'].includes(x.categoria) ? -1 : x.categoria === 'inv_aplicacao' || x.categoria === 'inv_rendimento' ? 1 : (x.direcao === 'entrada' ? 1 : -1));
async function montarFinanceiroAplicacao(con) {
    const { data, error } = await db().from('lancamentos').select('id, direcao, categoria, valor, data_pagamento, vencimento, descricao, status, observacao')
        .eq('contrato_id', con.id).order('data_pagamento', { ascending: false, nullsFirst: false });
    if (error) throw error;
    const l = data || [];
    const fechada = ['encerrado', 'finalizado'].includes(String(con.status || '').toLowerCase());
    const linha = (x) => { const sg = sinalAplicacao(x);
        return `<div class="rz-row"><div class="rz-ic"><i data-lucide="${sg > 0 ? 'arrow-up-right' : 'arrow-down-left'}"></i></div>
        <div class="rz-tx"><b>${esc(String(x.descricao || '').split(' · ')[0] || 'Lançamento')}</b><span>${esc(dataBR(x.data_pagamento || x.vencimento))}${x.observacao ? ' · ' + esc(x.observacao) : ''}</span></div>
        <div class="rz-rt"><b${sg > 0 ? ' class="rz-in"' : ''}>${sg > 0 ? '+' : '−'}${esc(moeda(x.valor))}</b></div></div>`; };
    const fin = document.getElementById('fc-card-apl-fin');
    if (!fin) return;
    fin.innerHTML = `<div class="rz-card-h"><h3>Financeiro</h3><span class="rz-sub">${l.length}</span></div>
        ${l.length ? l.map(linha).join('') : '<p class="rz-desc">Nenhum lançamento desta aplicação.</p>'}
        <button type="button" class="rz-add" data-apl-mov><i data-lucide="plus"></i> Registrar movimento</button>`;
    fin.querySelector('[data-apl-mov]')?.addEventListener('click', () => abrirSheetAcoes({ titulo: 'Registrar movimento', sub: con.descricao || '', acoes: [
        ...(fechada ? [] : Object.entries(MOV).map(([k, [t, s, i]]) => ({ icone: i, titulo: t, sub: s, codigo: 'cofre.editar', aoTocar: () => abrirFormMovimento(con, k) }))),
        ...LANC.map(([k, t, s, , i]) => ({ icone: i, titulo: t, sub: s, codigo: 'cofre.editar', aoTocar: () => abrirFormLancamento(con, k) })),
    ] }));
    icones();
}
function abrirFormMovimento(con, tipo) {
    const [titulo] = MOV[tipo];
    abrirSheetForm({ titulo, sub: con.descricao || '', rotuloSalvar: tipo === 'aplicacao' ? 'Registrar aplicação' : 'Registrar resgate', empilhar: true,
        corpo: `<div class="rz-f2">${campo('inv-m-data', 'Data', `<input type="date" id="inv-m-data" max="${hoje()}" value="${hoje()}">`)}${campo('inv-m-valor', tipo === 'resgate_total' ? 'Valor recebido (R$)' : 'Valor (R$)', `<input type="number" id="inv-m-valor" step="0.01" min="0" inputmode="decimal">`)}</div>
            ${campo('inv-m-obs', 'Observação (opcional)', `<input type="text" id="inv-m-obs" maxlength="120">`)}
            ${tipo === 'aplicacao' ? '<p class="rz-desc">Taxa ou vencimento diferentes? Então é outra aplicação.</p>' : tipo === 'resgate_total' ? '<p class="rz-desc">O valor recebido entra no Financeiro e a aplicação fica encerrada.</p>' : ''}`,
        aoSalvar: async () => {
            const data = document.getElementById('inv-m-data')?.value, valor = Number(String(document.getElementById('inv-m-valor')?.value || '').replace(',', '.'));
            if (!data || !(valor > 0)) { toast('Informe a data e o valor.', 'erro'); return false; }
            const { error } = await db().rpc('fn_aplicacao_movimento_registrar', { p_contrato_id: con.id, p_tipo: tipo, p_data: data, p_valor: valor, p_observacao: document.getElementById('inv-m-obs')?.value || null });
            if (error) { toast(error.message || 'Não consegui registrar.', 'erro'); return false; }
            toast(tipo === 'aplicacao' ? 'Aplicação registrada' : 'Resgate registrado', 'sucesso');
            await recarregarContratosApp();
            await reabrirFicha(con.id);
            return true;
        } });
}
function abrirFormLancamento(con, cat) {
    const op = LANC.find(o => o[0] === cat) || LANC[0];
    abrirSheetForm({ titulo: op[1], sub: con.descricao || '', rotuloSalvar: 'Lançar', empilhar: true,
        corpo: `<div class="rz-f2">${campo('inv-l-data', 'Data', `<input type="date" id="inv-l-data" max="${hoje()}" value="${hoje()}">`)}${campo('inv-l-valor', 'Valor (R$)', `<input type="number" id="inv-l-valor" step="0.01" min="0" inputmode="decimal">`)}</div>`,
        aoSalvar: async () => {
            const data = document.getElementById('inv-l-data')?.value;
            const valor = Number(String(document.getElementById('inv-l-valor')?.value || '').replace(',', '.'));
            if (!data || !(valor > 0)) { toast('Informe a data e o valor.', 'erro'); return false; }
            const { error } = await db().from('lancamentos').insert({ cliente_id: (typeof CLIENTE_ID_SUPABASE !== 'undefined' ? CLIENTE_ID_SUPABASE : null), direcao: op[3], categoria: op[0],
                ativo_id: con.ativoId || null, contrato_id: con.id, competencia: data.slice(0, 7) + '-01', valor, status: 'realizado', reembolsavel: false,
                origem_tipo: 'manual', descricao: op[2] + ' · ' + (con.descricao || ''), vencimento: data, data_pagamento: data, incluir_contabilidade: true });
            if (error) { toast(error.message || 'Não consegui lançar.', 'erro'); return false; }
            toast('Lançamento registrado', 'sucesso');
            montarFinanceiroAplicacao(con).catch(() => {});
            return true;
        } });
}
const MES_CURTO = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const mesAno = (iso) => { const [y, m] = String(iso || '').slice(0, 7).split('-'); return y && m ? `${MES_CURTO[Number(m) - 1]}/${y}` : '—'; };
async function montarOcorrenciasAplicacao(con) {
    const card = document.getElementById('fc-card-apl-oc'); if (!card) return;
    const { data: itens, error: e1 } = await db().from('cofre_itens_controle').select('id, titulo, frequencia_intervalo, frequencia_unidade, ativo, subtipo_id').eq('contrato_id', con.id);
    if (e1) throw e1;
    const porItem = Object.fromEntries((itens || []).map(i => [i.id, i]));
    let oc = [];
    if ((itens || []).length) {
        const { data, error } = await db().from('cofre_ocorrencias_controle').select('id, item_controle_id, status_execucao, data_prevista_atual, valor_real, origem, tratado_em, tratamento_descricao')
            .in('item_controle_id', Object.keys(porItem)).neq('status_execucao', 'cancelado');
        if (error) throw error;
        oc = data || [];
    }
    const UN = { dia: 'dia', semana: 'semana', mes: 'mês', ano: 'ano' };
    const freq = (i) => (i.frequencia_intervalo ? (i.frequencia_intervalo > 1 ? `a cada ${i.frequencia_intervalo} ${UN[i.frequencia_unidade] || i.frequencia_unidade}` : `todo ${UN[i.frequencia_unidade] || i.frequencia_unidade}`) : 'uma vez');
    const vivos = (itens || []).filter(i => i.ativo);
    const subt = vivos.map(i => `${i.titulo} · ${freq(i)}`).join(' · ');
    const abertas = oc.filter(o => o.status_execucao === 'aberto').sort((a, b) => String(a.data_prevista_atual).localeCompare(String(b.data_prevista_atual)));
    const feitas = oc.filter(o => o.status_execucao !== 'aberto').sort((a, b) => String(b.data_prevista_atual).localeCompare(String(a.data_prevista_atual)));
    const lista = [...abertas, ...feitas].slice(0, 12);
    const ehAporte = (o) => /aporte/i.test(porItem[o.item_controle_id]?.titulo || '');
    const linha = (o) => {
        const it = porItem[o.item_controle_id] || {}, aberta = o.status_execucao === 'aberto';
        const sub = aberta ? `${mesAno(o.data_prevista_atual)} · a fazer até ${dataBR(o.data_prevista_atual)}`
            : `${mesAno(o.data_prevista_atual)} · ${dataBR(o.data_prevista_atual)} · ${ORIGEM_ROT[o.origem] || 'Informado'}`;
        return `<div class="rz-row rz-link" data-apl-oc="${o.id}"><div class="rz-ic"><i data-lucide="${ehAporte(o) ? 'coins' : 'refresh-cw'}"></i></div>
            <div class="rz-tx"><b>${esc(it.titulo || 'Ocorrência')}</b><span>${esc(sub)}</span></div>
            <div class="rz-rt">${o.valor_real != null ? `<b>${esc(moeda(o.valor_real))}</b>` : ''}${aberta ? '<span class="rz-st rz-warn">Em aberto</span>' : ''}</div><i data-lucide="chevron-right" class="rz-chev"></i></div>`;
    };
    card.innerHTML = `<div class="rz-card-h"><h3>Ocorrências</h3>${subt ? `<span class="rz-sub">${esc(subt)}</span>` : ''}</div>
        ${lista.length ? lista.map(linha).join('') : '<div class="rz-empty"><div class="rz-ic"><i data-lucide="calendar-check"></i></div><p>Nada registrado ainda.</p></div>'}`;
    card.querySelectorAll('[data-apl-oc]').forEach(r => r.addEventListener('click', () => {
        const o = oc.find(x => x.id === r.dataset.aplOc); if (!o) return;
        if (o.status_execucao === 'aberto') { if (ehAporte(o)) abrirFormMovimento(con, 'aplicacao'); else abrirInformarValor(con, o.data_prevista_atual); return; }
        const it = porItem[o.item_controle_id] || {};
        const linhas = [`${mesAno(o.data_prevista_atual)} · ${dataBR(o.data_prevista_atual)}`, o.valor_real != null ? `Valor: ${moeda(o.valor_real)}` : '', `Origem: ${ORIGEM_ROT[o.origem] || 'Informado'}`, o.tratamento_descricao || ''].filter(Boolean);
        if (typeof rzAviso === 'function') rzAviso({ titulo: it.titulo || 'Ocorrência', linhas }); else toast(linhas.join(' · '));
    }));
    icones();
}
async function montarPartesAplicacao(con) {
    const card = document.getElementById('fc-card-apl-partes'); if (!card) return;
    const { data, error } = await db().from('partes_papeis').select('papel, parte_id, partes(nome, documento)').eq('entidade_tipo', 'contrato').eq('entidade_id', con.id).eq('ativo', true);
    if (error) throw error;
    const ROT = { emissor: 'Emissor', instituicao: 'Instituição financeira' };
    const l = (data || []);
    card.innerHTML = `<div class="rz-card-h"><h3>Partes</h3></div>
        ${l.length ? l.map(p => `<div class="rz-row"><div class="rz-ic"><i data-lucide="landmark"></i></div><div class="rz-tx"><b>${esc(p.partes?.nome || '—')}</b><span>${esc([ROT[p.papel] || p.papel, p.partes?.documento].filter(Boolean).join(' · '))}</span></div></div>`).join('')
            : `<p class="rz-desc">${esc(con.dadosModelo?.emissor_nome ? 'Emissor: ' + con.dadosModelo.emissor_nome + ' (sem cadastro em Partes).' : 'Nenhuma parte.')}</p>`}`;
    icones();
}
async function reabrirFicha(id) {
    if (typeof window.abrirFichaContrato === 'function') { await recarregarContratosApp(); window.abrirFichaContrato(id); }
}
