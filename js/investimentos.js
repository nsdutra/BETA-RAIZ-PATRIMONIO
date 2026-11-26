// ============================================================================
// investimentos.js — Raiz Patrimônio · Ramo Investimentos (conta e aplicações)
// Versão: 1.4.0 · 26/11/2026
//
// v1.4.0 (26/11/2026, sessão 20261126-1330-investimentos-i2a, demanda 885410f9; PLANO_EXECUCAO_I2_I3_I4_INVESTIMENTOS_RAIZ v1.2.0, I2a, e
// PROTOTIPO_INVESTIMENTOS_I2_I4_POSICAO_FGC v1.1.0; de acordo do Nicola 26/11 12:12 e 13:24) — renda variável pelo módulo novo
// js/investimentos-rv.js: Nova aplicação (Ação / BDR / ETF e Fundo imobiliário) começa pela posição ou por uma compra e ganha o atalho
// "Várias compras e vendas"; a ficha ganha o card Posição e custo médio; Registrar movimento e a linha do Financeiro de compra,
// venda e amortização vão para o módulo. Grupo "Renda variável" no card Aplicações; posição zerada aparece como "Zerada".
//
// v1.3.0 (25/11/2026, sessão 20261125-2135-investimentos-i1-3, demanda e2b658a8; PLANO_EXECUCAO_I1_3_MOVIMENTOS_EDITAR_RAIZ v1.0.0
// e ficha F11; de acordo do Nicola 25/11 21:35 "A B e C ok", "F11 ok") — movimento lançado se corrige e se exclui:
//   A · abrirMovimento(lancId): a linha do movimento no card Financeiro (aplicação e conta) abre a ficha do movimento — tipo,
//       data, bruto, IR, IOF, taxa (com o % do bruto), líquido e observação, com o "i" do tipo.
//   B · "Corrigir dados": data e observação (em aplicação, resgate e amortização só a observação, porque a data deles também está no
//       histórico de valor) e "Excluir e lançar de novo": o formulário do tipo vem preenchido e, ao salvar, exclui o antigo antes.
//   C · "Excluir movimento" com confirmação: fn_aplicacao_movimento_excluir (F11) apaga o movimento e os descontos dele e
//       desfaz o efeito no valor; o último resgate de aplicação encerrada a reabre e pede para conferir o vencimento.
//   Aberto pelo Financeiro da conta, volta para a conta (chip Movimento).
//
// v1.2.0 (25/11/2026, sessão 20261125-1954-investimentos-i1-2, demanda 09dff31b; PLANO_EXECUCAO_I1_2_APLICACAO_FINANCEIRO_RAIZ v1.1.0,
// FICHA_F10_CATALOGO_CAMPOS_CONTRATO_RAIZ v1.0.0 fase 1 e PROTOTIPO_INVESTIMENTOS_FINANCEIRO_INDICADORES_RAIZ v1.2.0; de acordo do
// Nicola 25/11 12:43, 13:40 e 19:54):
//   A · Nova aplicação, Editar e Condições montados pelo catálogo do tipo (contrato_tipos_campos, js/contrato-catalogo.js e
//       js/nucleo/campos.js), cada campo com o "i" da ajuda.
//   C · na criação, a aplicação herda a divisão da Propriedade da conta (divisao_repasse_contrato), card Distribuição do aluguel.
//   D · o card Financeiro da aplicação e o da conta são o mesmo do aluguel (rzFinCompetencias, olhar do investimento): este
//       módulo dá a série do ganho do mês (window.__rzFinInvest) e recebe o filtro do gráfico (aoFiltrar).
//   F · resgate com Bruto, IR, IOF, Taxa e Líquido: dois lados fecham o terceiro, cada desconto com o % do bruto e o IR também
//       com o % sobre o ganho estimado e a alíquota da tabela (fn_aplicacao_movimento_registrar v3).
//   G · um link só, "Rendimento": o tipo (juros/cupom, amortização, dividendos, JCP, rendimento; bonificação no I2) é o primeiro
//       campo e a tela se ajusta, com o "i" do tipo; bruto, IR e líquido com o IR sugerido por tipo.
//   H · card Indicadores separado, abaixo do Financeiro, sem filtro próprio: segue o filtro do card Financeiro (ano ou mês) e
//       mostra sempre No ano · 12 meses · Desde o início. Ganho e rentabilidade pelo método de Dietz modificado, mês a mês,
//       encadeado nos períodos maiores; cada métrica com o "i". O card Valor da aplicação perde o % "desde a aplicação".
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
export const VERSAO = '1.4.0';

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
    { g: 'Renda fixa', pref: 'inv_rf_' }, { g: 'Renda variável', pref: 'inv_rv_' }, { g: 'Fundos', pref: 'inv_fundo' },
    { g: 'Previdência', pref: 'inv_prev' }, { g: 'Poupança', pref: 'inv_poup' },
];
const grupoDoTipo = (cod) => (GRUPOS.find(x => String(cod || '').startsWith(x.pref)) || { g: 'Outras' }).g;
const ICONE_TIPO = { inv_rf_cdb: 'percent', inv_rf_lci: 'percent', inv_rf_tesouro: 'landmark', inv_rf_credito: 'scroll-text', inv_fundo: 'pie-chart', inv_prev: 'umbrella', inv_poup: 'piggy-bank', inv_rv_acao: 'line-chart', inv_rv_fii: 'building-2' };
const EH_RV = (cod) => String(cod || '').startsWith('inv_rv_');
const moduloRV = () => import('./investimentos-rv.js');
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
        const venc = EH_RV(c.tipo_contrato) ? (c.dados_modelo?.ticker || '') : TEM_VENC(c.tipo_contrato) && c.fim ? 'vence ' + dataBR(c.fim) : 'sem vencimento';
        const idx = indexadorTexto(c.dados_modelo || {});
        const st = encerrada(c) ? `<span class="rz-st rz-neu">${EH_RV(c.tipo_contrato) ? 'Zerada' : 'Encerrada'}</span>` : '<span class="rz-st rz-ok">Ativa</span>';
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
    const acoes = tipos.map(t => ({
        icone: ICONE_TIPO[t.codigo] || 'coins', titulo: t.nome, sub: t.descricao || '', codigo: 'contratos.criar',
        aoTocar: () => abrirFormAplicacao(a, t, aoConcluir),
    }));
    // v1.4.0 — I2a: várias compras e vendas de ações e FII de uma vez (cria as aplicações dos códigos novos)
    if (tipos.some(t => EH_RV(t.codigo))) acoes.push({ icone: 'list-checks', titulo: 'Várias compras e vendas', sub: 'Ações e FII, em lote', codigo: 'contratos.criar',
        aoTocar: async () => (await moduloRV()).abrirLote(a, aoConcluir) });
    abrirSheetAcoes({ titulo: 'Nova aplicação', sub: a.nome_exibicao, acoes });
}

const campo = (id, rot, html, extra = '') => `<div class="rz-f"${extra}><label for="${id}">${rot}</label>${html}</div>`;
const catalogo = () => import('./contrato-catalogo.js');
const nucleoCampos = () => import('./nucleo/campos.js');

// A (F10) — formulário pelo catálogo do tipo
async function abrirFormAplicacao(a, t, aoConcluir) {
    if (typeof abrirSheetForm !== 'function') { toast('Abra pelo app principal.', 'erro'); return; }
    let cat, nc, campos = [], partes = { usados: [], outras: [] };
    try {
        [cat, nc] = await Promise.all([catalogo(), nucleoCampos()]);
        campos = await cat.camposDoTipo(t.codigo);
        const cp = campos.find(c => c.tipo_dado === 'parte');
        if (cp) partes = await cat.partesParaCampo(a.cliente_id, cp.opcoes?.papeis_lista || []);
    } catch (e) { toast(e?.message || 'Não consegui ler os campos do tipo.', 'erro'); return; }
    const ctx = { novo: true, prefixo: 'inv-', row: {}, partes, infoBtn: cat.infoBtn };
    if (EH_RV(t.codigo)) { // v1.4.0 — I2a: começa pela posição que já tem ou por uma compra
        const rv = await moduloRV();
        return rv.abrirNovaRV(a, t, { campos, ctx, nc, cat, aoConcluir, criar: (r) => criarAplicacao(a, t.codigo, r) });
    }
    abrirSheetForm({
        titulo: t.nome, sub: a.nome_exibicao, rotuloSalvar: 'Salvar aplicação',
        corpo: nc.camposHtml(campos, ctx) + '<p class="rz-desc">A aplicação conta no limite de contratos do plano. Novas aplicações no mesmo título e resgates entram depois, em "Registrar movimento".</p>',
        aoSalvar: async () => {
            const r = nc.lerCampos(document, campos, ctx);
            if (!r.ok) { toast(r.erro, 'erro'); return false; }
            const valor = Number(r.dados.aplicado_inicial || 0);
            if (!(valor > 0)) { toast('Informe o valor aplicado.', 'erro'); return false; }
            try {
                await criarAplicacao(a, t.codigo, r);
                toast('Aplicação registrada', 'sucesso');
                aoConcluir?.();
                return true;
            } catch (e) { toast(e?.message || 'Não consegui registrar a aplicação.', 'erro'); return false; }
        },
    });
    setTimeout(() => { nc.ligarCampos(document, campos, ctx); cat.ligarInfos(document, campos); icones(); }, 0);
}

async function garantirUsoInvestimento(a, inicio) {
    const { data } = await db().from('ativo_usos').select('id, inicio, fim').eq('ativo_id', a.id).eq('modelo', 'investimento');
    const hojeS = hoje();
    if ((data || []).some(u => !u.fim || u.fim >= hojeS)) return;
    const { error } = await db().rpc('fn_ativo_uso_iniciar', { p_ativo_id: a.id, p_modelo: 'investimento', p_inicio: inicio, p_fim: null, p_observacao: null, p_canal: 'app' });
    if (error) throw error;
}
// C — a aplicação herda a divisão da Propriedade da conta (mesma solução do aluguel: divisao_repasse_contrato)
async function herdarDivisaoDaConta(ativoId, contratoId) {
    const { data } = await db().from('propriedade_ativo').select('tipo_proprietario, pessoa_id, nome_externo, percentual').eq('ativo_id', ativoId);
    if (!(data || []).length) return;
    const { error } = await db().from('divisao_repasse_contrato').insert(data.map(p => ({ contrato_id: contratoId, tipo_beneficiario: p.tipo_proprietario,
        pessoa_id: p.pessoa_id, nome_externo: p.nome_externo, percentual: p.percentual })));
    if (error) throw error;
}
async function criarAplicacao(a, cod, r) {
    const clienteId = a.cliente_id, cat = await catalogo();
    const data = r.colunas.inicio, valor = Number(r.dados.aplicado_inicial || 0);
    await garantirUsoInvestimento(a, data);
    const dados = { ...r.dados }; Object.keys(dados).forEach(k => { if (dados[k] === null) delete dados[k]; });
    const { data: con, error } = await db().from('contratos').insert({
        cliente_id: clienteId, ativo_id: a.id, modelo: 'investimento', tipo_contrato: cod, status: 'ativo', ...r.colunas, dados_modelo: dados,
    }).select('id').single();
    if (error) throw error;
    // emissor (papel do contrato) — falha aqui não desfaz a aplicação: aparece em Partes para completar
    try { await cat.papelDoContratoGravar(con.id, clienteId, r.parte); } catch (e) { console.warn('[investimentos] emissor:', e?.message || e); }
    try { await herdarDivisaoDaConta(a.id, con.id); } catch (e) { console.warn('[investimentos] divisão:', e?.message || e); }
    // itens do tipo (automáticos): "Atualizar valor"
    try {
        const { data: mods } = await db().from('cofre_modelos_item_controle').select('id').eq('escopo_tipo', 'contrato_tipo').eq('escopo_valor', cod).eq('automatico', true).eq('ativo', true);
        const ids = (mods || []).map(m => m.id);
        if (ids.length) await db().rpc('fn_contrato_itens_sugeridos_criar', { p_contrato_id: con.id, p_modelos: ids, p_canal: 'app' });
    } catch (e) { console.warn('[investimentos] itens:', e?.message || e); }
    if (!EH_RV(cod)) { // v1.4.0 — na renda variável a primeira posição vem por fn_rv_evento_registrar (investimentos-rv.js)
        const { error: eMov } = await db().rpc('fn_aplicacao_movimento_registrar', { p_contrato_id: con.id, p_tipo: 'aplicacao', p_data: data, p_valor: valor, p_observacao: 'Aplicação inicial' });
        if (eMov) throw eMov;
    }
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
async function lerAplicacao(id) {
    const { data: row } = await db().from('contratos').select('id, cliente_id, descricao, valor, dados_modelo, status, inicio, fim, tipo_contrato, ativo_id').eq('id', id).maybeSingle();
    return row ? { id: row.id, clienteId: row.cliente_id, descricao: row.descricao, valor: row.valor, dadosModelo: row.dados_modelo || {}, status: String(row.status || ''),
        inicio: row.inicio, fim: row.fim, tipoContrato: row.tipo_contrato, ativoId: row.ativo_id, row } : null;
}
export async function aplicarFichaAplicacao(conApp, raiz) {
    if (!raiz) return;
    await tiposAplicacao().catch(() => []);
    // a lista do app não traz descricao nem o status 'finalizado' como no banco: a ficha lê a linha do contrato
    const con = (await lerAplicacao(conApp.id)) || conApp;
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
    // A (F10) — Condições pelo catálogo do tipo, com o "i" de cada campo
    const kv = raiz.querySelector('[data-fc-secao="resumo.condicoes"] .rz-kv');
    if (kv && con.row) {
        try {
            const cat = await catalogo();
            const campos = await cat.camposDoTipo(con.tipoContrato);
            kv.innerHTML = cat.condicoesHtml(campos, con.row) || '<p class="rz-desc">Sem condições cadastradas.</p>';
            cat.ligarInfos(kv, campos);
        } catch (e) { console.warn('[investimentos] condições:', e?.message || e); }
    }
    // cards do Resumo: Valor e Ocorrências (o card padrão de Ocorrências só lê ocorrência do contrato: fica escondido aqui)
    raiz.querySelector('#fc-card-ocorrencias')?.classList.add('hidden');
    const cond = raiz.querySelector('[data-fc-secao="resumo.condicoes"]');
    if (cond && !raiz.querySelector('#fc-card-apl-valor')) {
        cond.insertAdjacentHTML('afterend', `<div class="rz-card" id="fc-card-apl-valor">${sk(3)}</div>
            <div class="rz-card rz-list" id="fc-card-apl-oc"><div class="rz-card-h"><h3>Ocorrências</h3></div>${sk(2)}</div>`);
    }
    // D/H — Financeiro: o card padrão (contratos.js, olhar do investimento) + o card Indicadores logo abaixo
    const painel = raiz.querySelector('#fc-painel-cobrancas');
    if (painel && !raiz.querySelector('#fc-card-apl-ind')) painel.insertAdjacentHTML('beforeend', `<div class="rz-card" id="fc-card-apl-ind">${sk(3)}</div>`);
    const chipFin = raiz.querySelector('#fc-chips [data-fc-chip="cobrancas"] .rz-n'); if (chipFin) chipFin.textContent = '';
    const partes = raiz.querySelector('#fc-painel-partes');
    if (partes) partes.innerHTML = `<div class="rz-card rz-list" id="fc-card-apl-partes"><div class="rz-card-h"><h3>Partes</h3></div>${sk(2)}</div>`;
    const chipPartes = raiz.querySelector('#fc-chips [data-fc-chip="partes"] .rz-n'); if (chipPartes) chipPartes.textContent = '';
    icones();
    montarValorAplicacao(con).catch(e => console.warn('[investimentos] valor:', e?.message || e));
    prepararIndicadores([con.id], 'fc-fin-comp', 'fc-card-apl-ind').catch(e => console.warn('[investimentos] indicadores:', e?.message || e));
    montarOcorrenciasAplicacao(con).catch(e => console.warn('[investimentos] ocorrências:', e?.message || e));
    montarPartesAplicacao(con).catch(e => console.warn('[investimentos] partes:', e?.message || e));
    if (EH_RV(con.tipoContrato)) { // v1.4.0 — I2a: card Posição e custo médio e a faixa de quantidade e preço médio
        moduloRV().then(rv => rv.aplicarFichaRV(con, raiz, { aoMudar: () => reabrirFicha(con.id) }))
            .catch(e => console.warn('[investimentos] posição:', e?.message || e));
    }
}

const modoValor = new Map();
async function montarValorAplicacao(con) {
    const card = document.getElementById('fc-card-apl-valor'); if (!card) return;
    const hist = (await historicoValores([con.id])).map(h => ({ tipo: 'mercado', data_base: h.data_base, valor: h.valor, fonte: h.origem, criado_em: h.criado_em, obs: h.obs }));
    const { data: lap } = await db().from('lancamentos').select('categoria, valor').eq('contrato_id', con.id).eq('categoria', 'inv_aplicacao');
    const aplicado = (lap || []).reduce((s, l) => s + Number(l.valor || 0), 0);
    const ca = await import('./cofre-ativos.js');
    const rot = (x) => ORIGEM_ROT[x.fonte] || 'Informado';
    const modoIni = ca.vbModoInicial(hist);
    const modo = modoIni ? (modoValor.get(con.id) || modoIni) : null;
    const op = { semVariacao: true }; // H — sem a frase de %: o % vai para o card Indicadores
    const menu = `<button type="button" class="rz-more" data-apl-valor-menu aria-label="Ações do valor"><i data-lucide="ellipsis-vertical"></i></button>`;
    card.innerHTML = `<div class="rz-card-h"><h3>Valor</h3>${menu}</div>
        <div class="rz-kv"><div><small>Valor atual</small><b>${esc(moeda(con.valor))}</b>${hist.length ? `<small>${esc(dataBR(hist.slice().sort((a, b) => a.data_base.localeCompare(b.data_base)).pop().data_base))}</small>` : ''}</div>
        <div><small>Aplicado no total</small><b>${esc(moeda(aplicado))}</b></div></div>
        ${modo ? `<div class="rz-seg rz-vb-seg" role="group"><button type="button" data-vb-modo="mes" class="${modo === 'mes' ? 'rz-on' : ''}">Mês</button><button type="button" data-vb-modo="ano" class="${modo === 'ano' ? 'rz-on' : ''}">Ano</button></div>
        <div data-vb-grafico>${ca.vbGraficoHtml(hist, modo, rot, op)}</div>` : '<p class="rz-vb-sub">As colunas aparecem a partir do segundo valor informado.</p>'}`;
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
            card.querySelector('[data-vb-grafico]').innerHTML = ca.vbGraficoHtml(hist, m, rot, op); ligar(m);
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

// ---------------------------------------------------------------------------------------------------- movimentos (D, E, F, G)
const INFO_MOV = {
    aplicacao: ['Aplicação', 'Dinheiro novo no mesmo título (mesma taxa e vencimento). Aumenta o valor da aplicação e sai do seu caixa. Não é rendimento.'],
    resgate_parcial: ['Resgate parcial', 'Você tira parte do dinheiro. O valor bruto sai da aplicação; IR, IOF e taxas são descontados; o líquido cai no caixa.'],
    resgate_total: ['Resgate total', 'Você tira tudo: a aplicação vai para Encerradas e sai da soma da conta. O líquido cai no caixa.'],
    rendimento: ['Rendimento', 'Tudo o que a aplicação paga sem você resgatar: juros/cupom, amortização, dividendos, JCP e rendimento de fundo ou poupança. O tipo se escolhe dentro.'],
    taxa: ['Taxa ou custódia', 'Taxa cobrada à parte (custódia da B3, corretagem, administração cobrada fora do fundo). Entra em Impostos e taxas.'],
};
const TIPOS_REND = {
    juros: { nome: 'Juros / cupom', cat: 'inv_juros', info: 'Juros pagos durante a vida do título, sem tirar o principal (ex.: Tesouro IPCA+ com juros semestrais, debêntures, CRI, CRA). IR pela tabela regressiva — 22,5% até 180 dias, 20% até 360, 17,5% até 720 e 15% acima —, exceto os isentos para pessoa física (LCI, LCA, CRI, CRA, debêntures incentivadas).' },
    amortizacao: { nome: 'Amortização', cat: 'inv_amortizacao', info: 'Devolução de parte do dinheiro aplicado (principal) antes do vencimento. Reduz o valor da aplicação e não é rendimento; o IR só incide sobre juros que vierem junto.' },
    dividendo: { nome: 'Dividendos', cat: 'inv_dividendo', info: 'Parte do lucro da empresa paga aos acionistas, em dinheiro. Isento de IR para pessoa física até R$ 50 mil por mês da mesma empresa; acima disso, desde 2026, há retenção de 10% sobre o total pago (Lei 15.270/2025).' },
    jcp: { nome: 'JCP', cat: 'inv_jcp', info: 'Juros sobre capital próprio: outra forma de a empresa distribuir lucro. Tem 15% de IR retido na fonte — o que cai no caixa já é o líquido.' },
    rendimento: { nome: 'Rendimento de fundo ou poupança', cat: 'inv_rendimento', info: 'Rendimento distribuído por fundo (ex.: FII todo mês) ou juros da poupança no aniversário. Em geral isento para pessoa física (poupança; FII que cumpre as regras).' },
};
const aliqTabela = (dias) => (dias <= 180 ? 0.225 : dias <= 360 ? 0.20 : dias <= 720 ? 0.175 : 0.15);
const diasDesde = (iso) => Math.max(0, Math.round((new Date(hoje() + 'T12:00:00') - new Date(String(iso || hoje()).slice(0, 10) + 'T12:00:00')) / 86400000));
const pctTxt = (v) => (v * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '%';
const aviso = (titulo, texto) => (typeof rzAviso === 'function' ? rzAviso({ titulo, linhas: [texto] }) : toast(texto));
const infoBtnHtml = (k) => `<button type="button" class="rz-i" data-inv-info="${k}" aria-label="O que é?"><svg data-lucide="info"></svg></button>`;
const numero = (id) => { const v = String(document.getElementById(id)?.value || '').trim().replace(',', '.'); return v ? Number(v) : 0; };

// E — "Registrar movimento" da aplicação (financeiro.js › rzRegistrarMovimento chama aqui)
export async function abrirRegistrarMovimento(contratoId) {
    voltarParaConta = null;
    const con = await lerAplicacao(contratoId); if (!con) return;
    if (EH_RV(con.tipoContrato)) { // v1.4.0 — I2a: compra, venda, lote e eventos no módulo de renda variável
        const rv = await moduloRV();
        return rv.abrirRegistrarRV(con, { rendimento: () => abrirFormRendimento(con, con.tipoContrato === 'inv_rv_fii' ? 'rendimento' : 'dividendo'),
            taxa: () => abrirFormTaxa(con), despesa: () => (typeof window.abrirNovaDespesa === 'function' ? window.abrirNovaDespesa(con.ativoId || null) : null) });
    }
    const fechada = ['encerrado', 'finalizado'].includes(con.status.toLowerCase());
    const acoes = [
        ...(fechada ? [] : [
            { icone: 'arrow-up-right', titulo: 'Aplicação', sub: 'No mesmo título', codigo: 'cofre.editar', aoTocar: () => abrirFormAporte(con) },
            { icone: 'arrow-down-left', titulo: 'Resgate parcial', sub: 'Bruto, impostos e líquido', codigo: 'cofre.editar', aoTocar: () => abrirFormResgate(con, 'resgate_parcial') },
            { icone: 'log-out', titulo: 'Resgate total', sub: 'A aplicação fica encerrada', codigo: 'cofre.editar', aoTocar: () => abrirFormResgate(con, 'resgate_total') },
        ]),
        { icone: 'sprout', titulo: 'Rendimento', sub: 'Juros, dividendos, JCP…', codigo: 'cofre.editar', aoTocar: () => abrirFormRendimento(con, 'jcp') },
        { icone: 'receipt', titulo: 'Taxa ou custódia', sub: 'Cobrada à parte', codigo: 'cofre.editar', aoTocar: () => abrirFormTaxa(con) },
        { icone: 'arrow-up-right', titulo: 'Outra despesa', sub: 'Saída ligada à conta', codigo: 'saidas.registrar', aoTocar: () => (typeof window.abrirNovaDespesa === 'function' ? window.abrirNovaDespesa(con.ativoId || null) : null) },
    ];
    abrirSheetAcoes({ titulo: 'Registrar movimento', sub: con.descricao || '', acoes });
}
// v1.3.0 — quem abriu o movimento pelo Financeiro da conta volta para a conta (chip Movimento), não para a ficha da aplicação
let voltarParaConta = null;
async function depoisDoMovimento(con) {
    const conta = voltarParaConta; voltarParaConta = null;
    await recarregarContratosApp();
    if (conta && typeof window.abrirFichaAtivoNoChip === 'function') { window.abrirFichaAtivoNoChip(conta, 'movimento'); return; }
    await reabrirFicha(con.id);
}
// v1.3.0 (B) — "Excluir e lançar de novo": o formulário vem preenchido e, ao salvar, exclui o movimento antigo antes (F11)
async function antesDeSalvar(pre) {
    if (!pre?.antes || pre.feito) return true;
    const ok = await pre.antes(); if (ok) pre.feito = true; return ok;
}
const erroRelancar = (pre, error) => toast((pre?.feito ? 'O movimento antigo já foi excluído: confira e salve de novo. ' : '') + (error?.message || 'Não consegui registrar.'), 'erro');
const valorPre = (v) => (Number(v) > 0 ? String(Math.round(Number(v) * 100) / 100) : '');
function ligarInfosMov(extra = {}) {
    document.querySelectorAll('[data-inv-info]').forEach(b => {
        if (b.dataset.invLigado) return; b.dataset.invLigado = '1';
        b.addEventListener('click', (ev) => { ev.preventDefault(); ev.stopPropagation(); const k = b.dataset.invInfo; const t = extra[k] || INFO_MOV[k]; if (t) aviso(t[0], t[1]); });
    });
    icones();
}
function abrirFormAporte(con, pre = null) {
    abrirSheetForm({ titulo: 'Aplicação', sub: con.descricao || '', rotuloSalvar: pre ? 'Excluir o antigo e registrar' : 'Registrar aplicação', empilhar: true,
        corpo: `<p class="rz-desc">${esc(INFO_MOV.aplicacao[1])}</p>
            <div class="rz-f2">${campo('inv-m-data', 'Data', `<input type="date" id="inv-m-data" max="${hoje()}" value="${esc(pre?.data || hoje())}">`)}${campo('inv-m-valor', 'Valor (R$)', `<input type="number" id="inv-m-valor" step="0.01" min="0" inputmode="decimal" value="${valorPre(pre?.bruto)}">`)}</div>
            ${campo('inv-m-obs', 'Observação (opcional)', `<input type="text" id="inv-m-obs" maxlength="120" value="${esc(pre?.obs || '')}">`)}`,
        aoSalvar: async () => {
            const data = document.getElementById('inv-m-data')?.value, valor = numero('inv-m-valor');
            if (!data || !(valor > 0)) { toast('Informe a data e o valor.', 'erro'); return false; }
            if (!(await antesDeSalvar(pre))) return false;
            const { error } = await db().rpc('fn_aplicacao_movimento_registrar', { p_contrato_id: con.id, p_tipo: 'aplicacao', p_data: data, p_valor: valor, p_observacao: document.getElementById('inv-m-obs')?.value || null });
            if (error) { erroRelancar(pre, error); return false; }
            toast('Aplicação registrada', 'sucesso'); await depoisDoMovimento(con); return true;
        } });
}

// F — resgate: Bruto, IR, IOF, Taxa e Líquido; dois lados fecham o terceiro
async function abrirFormResgate(con, tipo, pre = null) {
    const total = tipo === 'resgate_total';
    const { data: lanc } = await db().from('lancamentos').select('categoria, valor').eq('contrato_id', con.id).in('categoria', ['inv_aplicacao', 'inv_resgate', 'inv_amortizacao']);
    const aplicado = (lanc || []).filter(l => l.categoria === 'inv_aplicacao').reduce((s, l) => s + Number(l.valor || 0), 0);
    const tirado = (lanc || []).filter(l => l.categoria !== 'inv_aplicacao').reduce((s, l) => s + Number(l.valor || 0), 0);
    const custo = Math.max(aplicado - tirado, 0), valorAtual = Number(con.valor || 0);
    const isento = !!con.dadosModelo?.isento_ir, dias = diasDesde(con.inicio), aliq = aliqTabela(dias);
    const vl = (id, rot) => campo(id, rot, `<input type="number" id="${id}" step="0.01" min="0" inputmode="decimal"><span class="rz-hint" id="${id}-pc"></span>`);
    abrirSheetForm({ titulo: INFO_MOV[tipo][0], sub: con.descricao || '', rotuloSalvar: pre ? 'Excluir o antigo e registrar' : 'Registrar resgate', empilhar: true,
        corpo: `<p class="rz-desc">${esc(INFO_MOV[tipo][1])} ${infoBtnHtml(tipo)}</p>
            <div class="rz-f2">${campo('inv-r-data', 'Data', `<input type="date" id="inv-r-data" max="${hoje()}" value="${esc(pre?.data || hoje())}">`)}${campo('inv-r-atual', 'Valor atual', `<input type="text" id="inv-r-atual" value="${esc(moeda(valorAtual))}" disabled>`)}</div>
            ${vl('inv-r-bruto', 'Bruto (sai da aplicação)')}
            <div class="rz-f2">${vl('inv-r-ir', 'IR')}${vl('inv-r-iof', 'IOF')}</div>
            ${vl('inv-r-taxa', 'Taxa')}
            ${vl('inv-r-liq', 'Líquido (cai no caixa)')}
            <p class="rz-desc" id="inv-r-calc">Preencha dois lados: bruto e descontos, bruto e líquido, ou líquido e descontos.</p>
            ${campo('inv-r-obs', 'Observação (opcional)', `<input type="text" id="inv-r-obs" maxlength="120" value="${esc(pre?.obs || '')}">`)}`,
        aoSalvar: async () => {
            const data = document.getElementById('inv-r-data')?.value;
            const bruto = numero('inv-r-bruto'), ir = numero('inv-r-ir'), iof = numero('inv-r-iof'), taxa = numero('inv-r-taxa');
            if (!data || !(bruto > 0)) { toast('Informe a data e o bruto.', 'erro'); return false; }
            if (bruto - ir - iof - taxa <= 0) { toast('Os descontos passam do bruto.', 'erro'); return false; }
            if (!(await antesDeSalvar(pre))) return false;
            const { error } = await db().rpc('fn_aplicacao_movimento_registrar', { p_contrato_id: con.id, p_tipo: tipo, p_data: data, p_valor: bruto,
                p_observacao: document.getElementById('inv-r-obs')?.value || null, p_ir: ir, p_iof: iof, p_taxa: taxa });
            if (error) { erroRelancar(pre, error); return false; }
            toast('Resgate registrado', 'sucesso'); await depoisDoMovimento(con); return true;
        } });
    setTimeout(() => {
        const ids = ['inv-r-bruto', 'inv-r-ir', 'inv-r-iof', 'inv-r-taxa', 'inv-r-liq'], toque = [];
        const set = (id, x) => { const el = document.getElementById(id); if (el) el.value = x > 0 ? String(Math.round(x * 100) / 100) : ''; };
        const lado = (id) => (id === 'inv-r-bruto' ? 'B' : id === 'inv-r-liq' ? 'L' : 'D');
        const recalc = (origem) => {
            if (origem) { const i = toque.indexOf(origem); if (i >= 0) toque.splice(i, 1); toque.push(origem); }
            const lados = [...new Set(toque.map(lado))].slice(-2);
            const desc = () => numero('inv-r-ir') + numero('inv-r-iof') + numero('inv-r-taxa');
            let msg = '';
            if (lados.includes('B') && lados.includes('D') && toque[toque.length - 1] !== 'inv-r-liq') { set('inv-r-liq', numero('inv-r-bruto') - desc()); msg = 'Líquido = bruto − descontos.'; }
            else if (lados.includes('B') && lados.includes('L')) { set('inv-r-ir', Math.max(numero('inv-r-bruto') - numero('inv-r-liq') - numero('inv-r-iof') - numero('inv-r-taxa'), 0)); msg = 'A diferença entre bruto e líquido foi para o IR — mova para IOF ou Taxa se for o caso.'; }
            else if (lados.includes('L') && lados.includes('D')) { set('inv-r-bruto', numero('inv-r-liq') + desc()); msg = 'Bruto = líquido + descontos.'; }
            const b = numero('inv-r-bruto');
            ['inv-r-ir', 'inv-r-iof', 'inv-r-taxa', 'inv-r-liq'].forEach(id => { const el = document.getElementById(id + '-pc'); if (el) el.textContent = b > 0 && numero(id) > 0 ? pctTxt(numero(id) / b) + ' do bruto' : ''; });
            if (b > 0) {
                const ganho = valorAtual > 0 ? Math.max(b * (1 - custo / valorAtual), 0) : 0;
                const irEl = document.getElementById('inv-r-ir-pc');
                if (irEl && numero('inv-r-ir') > 0 && ganho > 0) irEl.textContent = `${pctTxt(numero('inv-r-ir') / b)} do bruto · ≈ ${pctTxt(numero('inv-r-ir') / ganho)} do ganho`;
                msg += isento ? ' Esta aplicação é isenta de IR para pessoa física.'
                    : ganho > 0 ? ` Tabela pelo prazo (${dias} dias): ${pctTxt(aliq)} do ganho ≈ ${moeda(ganho * aliq)}.` : '';
            }
            if (numero('inv-r-liq') < 0) msg = 'Os descontos passam do bruto.';
            const c = document.getElementById('inv-r-calc'); if (c) c.textContent = msg || 'Preencha dois lados: bruto e descontos, bruto e líquido, ou líquido e descontos.';
        };
        ids.forEach(id => document.getElementById(id)?.addEventListener('input', () => recalc(id)));
        if (pre) { set('inv-r-bruto', pre.bruto); set('inv-r-ir', pre.ir); set('inv-r-iof', pre.iof); set('inv-r-taxa', pre.taxa); toque.push('inv-r-bruto', 'inv-r-ir'); recalc(); }
        else if (total && valorAtual > 0) { set('inv-r-bruto', valorAtual); recalc('inv-r-bruto'); }
        ligarInfosMov();
    }, 0);
}

// G — um link só "Rendimento": o tipo é o primeiro campo e a tela se ajusta
function abrirFormRendimento(con, tipo, pre = null) {
    const T = TIPOS_REND[tipo] || TIPOS_REND.jcp;
    const dias = diasDesde(con.inicio), isento = !!con.dadosModelo?.isento_ir;
    const sug = tipo === 'jcp' ? 0.15 : tipo === 'juros' ? (isento ? 0 : aliqTabela(dias)) : 0;
    const sugTxt = tipo === 'jcp' ? 'sugerido 15% (retido na fonte)' : tipo === 'juros' ? (isento ? 'isenta para pessoa física' : `sugerido ${pctTxt(sug)} pela tabela (${dias} dias)`)
        : tipo === 'dividendo' ? 'só acima de R$ 50 mil/mês da mesma empresa' : tipo === 'amortizacao' ? 'só sobre juros que vierem junto' : 'em geral isento';
    const opcoes = Object.entries(TIPOS_REND).map(([k, t]) => `<option value="${k}"${k === tipo ? ' selected' : ''}>${esc(t.nome)}</option>`).join('') + '<option value="bonificacao" disabled>Bonificação · chega com a Renda variável</option>';
    const vl = (id, rot) => campo(id, rot, `<input type="number" id="${id}" step="0.01" min="0" inputmode="decimal"><span class="rz-hint" id="${id}-pc"></span>`);
    abrirSheetForm({ titulo: 'Rendimento', sub: con.descricao || '', rotuloSalvar: pre ? 'Excluir o antigo e lançar' : 'Lançar', empilhar: true,
        corpo: `${campo('inv-p-tipo', `Tipo ${infoBtnHtml('tipo_' + tipo)}`, `<select id="inv-p-tipo">${opcoes}</select>`)}
            ${campo('inv-p-data', 'Data do pagamento', `<input type="date" id="inv-p-data" max="${hoje()}" value="${esc(pre?.data || hoje())}">`)}
            ${vl('inv-p-bruto', 'Bruto')}
            ${vl('inv-p-ir', `IR <small>${esc(sugTxt)}</small>`)}
            ${vl('inv-p-liq', 'Líquido (cai no caixa)')}
            ${tipo === 'amortizacao' ? '<p class="rz-desc">O bruto sai da aplicação (o valor dela cai), como num resgate; não conta como rendimento.</p>' : ''}`,
        aoSalvar: async () => {
            const data = document.getElementById('inv-p-data')?.value, bruto = numero('inv-p-bruto'), ir = numero('inv-p-ir');
            if (!data || !(bruto > 0)) { toast('Informe a data e o bruto.', 'erro'); return false; }
            if (ir >= bruto) { toast('O IR passa do bruto.', 'erro'); return false; }
            if (!(await antesDeSalvar(pre))) return false;
            if (tipo === 'amortizacao') {
                const { error } = await db().rpc('fn_aplicacao_movimento_registrar', { p_contrato_id: con.id, p_tipo: 'amortizacao', p_data: data, p_valor: bruto, p_observacao: pre?.obs || null, p_ir: ir, p_iof: 0, p_taxa: 0 });
                if (error) { erroRelancar(pre, error); return false; }
            } else {
                const origem = (crypto?.randomUUID ? crypto.randomUUID() : null);
                const base = { cliente_id: con.clienteId, ativo_id: con.ativoId || null, contrato_id: con.id, competencia: data.slice(0, 7) + '-01', status: 'realizado', reembolsavel: false,
                    origem_tipo: 'manual', origem_id: origem, vencimento: data, data_pagamento: data, incluir_contabilidade: true, natureza_economica: 'operacao', observacao: pre?.obs || null };
                const linhas = [{ ...base, direcao: 'entrada', categoria: T.cat, valor: bruto, descricao: `${T.nome} · ${con.descricao || ''}` }];
                if (ir > 0) linhas.push({ ...base, direcao: 'saida', categoria: 'inv_ir', valor: ir, descricao: `IR retido · ${T.nome} · ${con.descricao || ''}` });
                const { error } = await db().from('lancamentos').insert(linhas);
                if (error) { erroRelancar(pre, error); return false; }
            }
            toast('Rendimento registrado', 'sucesso'); await depoisDoMovimento(con); return true;
        } });
    setTimeout(() => {
        document.getElementById('inv-p-tipo')?.addEventListener('change', (e) => { if (typeof fecharSheet === 'function') fecharSheet(); setTimeout(() => abrirFormRendimento(con, e.target.value, pre), 60); });
        let ultimo = 'inv-p-bruto';
        const set = (id, x) => { const el = document.getElementById(id); if (el) el.value = x > 0 ? String(Math.round(x * 100) / 100) : ''; };
        const recalc = (o) => {
            if (o) ultimo = o;
            if (ultimo === 'inv-p-bruto') { set('inv-p-ir', numero('inv-p-bruto') * sug); set('inv-p-liq', numero('inv-p-bruto') - numero('inv-p-ir')); }
            else if (ultimo === 'inv-p-ir') set('inv-p-liq', numero('inv-p-bruto') - numero('inv-p-ir'));
            else { set('inv-p-bruto', sug < 1 ? numero('inv-p-liq') / (1 - sug) : numero('inv-p-liq')); set('inv-p-ir', numero('inv-p-bruto') - numero('inv-p-liq')); }
            const b = numero('inv-p-bruto');
            ['inv-p-ir', 'inv-p-liq'].forEach(id => { const el = document.getElementById(id + '-pc'); if (el) el.textContent = b > 0 && numero(id) > 0 ? pctTxt(numero(id) / b) + ' do bruto' : ''; });
        };
        ['inv-p-bruto', 'inv-p-ir', 'inv-p-liq'].forEach(id => document.getElementById(id)?.addEventListener('input', () => recalc(id)));
        if (pre) { set('inv-p-bruto', pre.bruto); set('inv-p-ir', pre.ir); recalc('inv-p-ir'); }
        ligarInfosMov({ ['tipo_' + tipo]: [T.nome, T.info] });
    }, 0);
}
function abrirFormTaxa(con, pre = null) {
    abrirSheetForm({ titulo: 'Taxa ou custódia', sub: con.descricao || '', rotuloSalvar: pre ? 'Excluir o antigo e lançar' : 'Lançar', empilhar: true,
        corpo: `<p class="rz-desc">${esc(INFO_MOV.taxa[1])}</p>
            <div class="rz-f2">${campo('inv-t-data', 'Data', `<input type="date" id="inv-t-data" max="${hoje()}" value="${esc(pre?.data || hoje())}">`)}${campo('inv-t-valor', 'Valor (R$)', `<input type="number" id="inv-t-valor" step="0.01" min="0" inputmode="decimal" value="${valorPre(pre?.bruto)}">`)}</div>`,
        aoSalvar: async () => {
            const data = document.getElementById('inv-t-data')?.value, valor = numero('inv-t-valor');
            if (!data || !(valor > 0)) { toast('Informe a data e o valor.', 'erro'); return false; }
            if (!(await antesDeSalvar(pre))) return false;
            const { error } = await db().from('lancamentos').insert({ cliente_id: con.clienteId, direcao: 'saida', categoria: 'inv_taxa', ativo_id: con.ativoId || null, contrato_id: con.id,
                competencia: data.slice(0, 7) + '-01', valor, status: 'realizado', reembolsavel: false, origem_tipo: 'manual', descricao: 'Taxa · ' + (con.descricao || ''),
                vencimento: data, data_pagamento: data, incluir_contabilidade: true, natureza_economica: 'operacao', observacao: pre?.obs || null });
            if (error) { erroRelancar(pre, error); return false; }
            toast('Taxa registrada', 'sucesso'); await depoisDoMovimento(con); return true;
        } });
}

// ---------------------------------------------------------------------------------------------------- ficha do movimento (I1.3)
// A linha do movimento no card Financeiro (olhar do investimento) abre aqui: o que foi lançado (bruto, descontos e líquido do
// mesmo origem_id) e três ações — corrigir data ou observação, excluir e lançar de novo, excluir (fn_aplicacao_movimento_excluir).
const CAT_PRINCIPAL = ['inv_aplicacao', 'inv_resgate', 'inv_amortizacao'];
const CAT_VALOR = { inv_aplicacao: 'aplicacao', inv_resgate: 'resgate_parcial', inv_amortizacao: 'amortizacao' };
const REND_DA_CAT = Object.fromEntries(Object.entries(TIPOS_REND).map(([k, t]) => [t.cat, k]));
const NOME_DESC = { inv_ir: 'IR', inv_iof: 'IOF', inv_taxa: 'Taxa' };
function nomeMovimento(cat, total) {
    if (cat === 'inv_aplicacao') return 'Aplicação';
    if (cat === 'inv_resgate') return total ? 'Resgate total' : 'Resgate';
    if (REND_DA_CAT[cat]) return TIPOS_REND[REND_DA_CAT[cat]].nome;
    return cat === 'inv_taxa' ? 'Taxa ou custódia' : NOME_DESC[cat] || 'Movimento';
}
async function lerMovimento(lancId) {
    const cols = 'id, contrato_id, origem_id, categoria, direcao, valor, data_pagamento, vencimento, observacao, criado_em';
    const { data: l } = await db().from('lancamentos').select(cols).eq('id', lancId).maybeSingle();
    if (!l?.contrato_id) return null;
    const { data: grupo } = l.origem_id ? await db().from('lancamentos').select(cols).eq('origem_id', l.origem_id).eq('contrato_id', l.contrato_id) : { data: [l] };
    const linhas = grupo?.length ? grupo : [l];
    const p = linhas.slice().sort((a, b) => (CAT_PRINCIPAL.includes(b.categoria) - CAT_PRINCIPAL.includes(a.categoria)) || ((b.direcao === 'entrada') - (a.direcao === 'entrada')))[0];
    const desc = linhas.filter(x => x !== p && NOME_DESC[x.categoria]);
    const dsc = (c) => desc.filter(x => x.categoria === c).reduce((t, x) => t + Number(x.valor || 0), 0);
    return { p, ids: linhas.map(x => x.id), bruto: Number(p.valor || 0), ir: dsc('inv_ir'), iof: dsc('inv_iof'), taxa: dsc('inv_taxa'), linhas };
}
export async function abrirMovimento(lancId, { origem = null } = {}) {
    const m = await lerMovimento(lancId);
    if (!m) { toast('Não encontrei este movimento.', 'erro'); return; }
    const con = await lerAplicacao(m.p.contrato_id); if (!con) return;
    if (EH_RV(con.tipoContrato) && m.p.origem_id) { // v1.4.0 — I2a: compra, venda e amortização (e as taxas delas) abrem o evento
        const rv = await moduloRV();
        if (await rv.abrirEventoDoLancamento(con, m.p.origem_id, { contaVolta: origem === 'fa-mov-comp' ? con.ativoId : null })) return;
    }
    const fechada = ['encerrado', 'finalizado'].includes(con.status.toLowerCase());
    let total = false;
    if (m.p.categoria === 'inv_resgate' && fechada) {
        const { data: rs } = await db().from('lancamentos').select('id, data_pagamento, criado_em').eq('contrato_id', con.id).eq('categoria', 'inv_resgate');
        const ult = (rs || []).slice().sort((a, b) => String(b.data_pagamento).localeCompare(String(a.data_pagamento)) || String(b.criado_em).localeCompare(String(a.criado_em)) || String(b.id).localeCompare(String(a.id)))[0];
        total = ult?.id === m.p.id;
    }
    const contaVolta = origem === 'fa-mov-comp' ? con.ativoId : null;
    const cat = m.p.categoria, nome = nomeMovimento(cat, total), mudaValor = !!CAT_VALOR[cat];
    const liquido = m.bruto - m.ir - m.iof - m.taxa;
    const pc = (v) => (m.bruto > 0 ? ` (${pctTxt(v / m.bruto)})` : '');
    const kv = [['Data', dataBR(m.p.data_pagamento || m.p.vencimento)], [cat === 'inv_aplicacao' || cat === 'inv_taxa' ? 'Valor' : 'Bruto', moeda(m.bruto)],
        ...[['IR', m.ir], ['IOF', m.iof], ['Taxa', m.taxa]].filter(x => x[1] > 0).map(([k, v]) => [k, moeda(v) + pc(v)]),
        ...(m.ir + m.iof + m.taxa > 0 ? [['Líquido', moeda(liquido)]] : []),
        ...(m.p.observacao ? [['Observação', m.p.observacao]] : [])];
    const efeito = cat === 'inv_aplicacao' ? `O valor da aplicação cai ${moeda(m.bruto)}.`
        : cat === 'inv_resgate' && total ? 'A aplicação volta para Ativas e a soma da conta é refeita.'
        : mudaValor ? `O valor da aplicação volta a somar ${moeda(m.bruto)}.` : 'O valor da aplicação não muda; sai do Financeiro e dos Indicadores.';
    const pre = { data: String(m.p.data_pagamento || m.p.vencimento || '').slice(0, 10), bruto: m.bruto, ir: m.ir, iof: m.iof, taxa: m.taxa, obs: m.p.observacao || '',
        antes: async () => { const r = await excluirMovimentoRpc(m.p.id); return !!r; } };
    const relancar = () => {
        voltarParaConta = contaVolta;
        if (cat === 'inv_aplicacao') return abrirFormAporte(con, pre);
        if (cat === 'inv_resgate') return abrirFormResgate(con, total ? 'resgate_total' : 'resgate_parcial', pre);
        if (cat === 'inv_amortizacao') return abrirFormRendimento(con, 'amortizacao', pre);
        if (REND_DA_CAT[cat]) return abrirFormRendimento(con, REND_DA_CAT[cat], pre);
        if (cat === 'inv_taxa') return abrirFormTaxa(con, pre);
    };
    const podeRelancar = cat === 'inv_aplicacao' || cat === 'inv_resgate' || cat === 'inv_amortizacao' || !!REND_DA_CAT[cat] || cat === 'inv_taxa';
    const chaveInfo = cat === 'inv_aplicacao' ? 'aplicacao' : cat === 'inv_resgate' ? (total ? 'resgate_total' : 'resgate_parcial') : cat === 'inv_taxa' ? 'taxa' : REND_DA_CAT[cat] ? 'tipo_' + REND_DA_CAT[cat] : '';
    const extraInfo = REND_DA_CAT[cat] ? { ['tipo_' + REND_DA_CAT[cat]]: [TIPOS_REND[REND_DA_CAT[cat]].nome, TIPOS_REND[REND_DA_CAT[cat]].info] } : {};
    const acoes = [
        { k: 'corrigir', icone: 'pencil', titulo: 'Corrigir dados', sub: mudaValor ? 'Só a observação' : 'Data e observação' },
        ...(podeRelancar ? [{ k: 'relancar', icone: 'rotate-ccw', titulo: 'Excluir e lançar de novo', sub: 'Vem preenchido para ajustar' }] : []),
        { k: 'excluir', icone: 'trash-2', titulo: 'Excluir movimento', sub: mudaValor ? 'Desfaz o efeito no valor' : 'O valor não muda', tipo: 'bad' },
    ];
    abrirSheetForm({ titulo: nome, sub: con.descricao || '', semRodape: true, empilhar: true,
        corpo: `<div class="rz-card"><div class="rz-card-h"><h3>O que foi lançado</h3>${chaveInfo ? infoBtnHtml(chaveInfo) : ''}</div>
            <div class="rz-kv">${kv.map(([k, v]) => `<div><small>${esc(k)}</small><b>${esc(v)}</b></div>`).join('')}</div></div>
            <div class="rz-group">O que fazer</div>${acoes.map((a, i) => `<button type="button" class="rz-act${a.tipo === 'bad' ? ' rz-bad' : ''}" data-inv-mov="${i}"><div class="rz-ic${a.tipo ? ' rz-' + a.tipo : ''}"><svg data-lucide="${a.icone}"></svg></div><div>${esc(a.titulo)}<small>${esc(a.sub)}</small></div></button>`).join('')}` });
    setTimeout(() => {
        ligarInfosMov(extraInfo);
        document.querySelectorAll('[data-inv-mov]').forEach(b => b.addEventListener('click', () => {
            if (typeof rzMostrarBloqueio === 'function' && rzMostrarBloqueio('cofre.editar')) return;
            const a = acoes[Number(b.dataset.invMov)];
            if (typeof fecharSheet === 'function') fecharSheet();
            setTimeout(() => {
                if (a.k === 'corrigir') abrirCorrigirMovimento(con, m, mudaValor, contaVolta);
                else if (a.k === 'relancar') relancar();
                else confirmarExcluirMovimento(con, m, nome, efeito, contaVolta);
            }, 60);
        }));
    }, 0);
}
async function excluirMovimentoRpc(lancId) {
    const { data, error } = await db().rpc('fn_aplicacao_movimento_excluir', { p_lancamento_id: lancId });
    if (error) { toast(error.message || 'Não consegui excluir o movimento.', 'erro'); return null; }
    if (data?.conferir_vencimento) aviso('Aplicação reaberta', 'Ela voltou para Ativas. Confira o vencimento em Editar aplicação.');
    return data || { ok: true };
}
function confirmarExcluirMovimento(con, m, nome, efeito, contaVolta) {
    const junto = m.ids.length > 2 ? ` Saem também os ${m.ids.length - 1} descontos dele.` : m.ids.length > 1 ? ' Sai também o desconto dele.' : '';
    abrirSheetAcoes({ titulo: 'Excluir este movimento?', sub: `${nome} · ${dataBR(m.p.data_pagamento)} · ${moeda(m.bruto)}. ${efeito}${junto}`, empilhar: true, acoes: [
        { icone: 'trash-2', titulo: 'Excluir', sub: 'Não dá para desfazer', tipo: 'bad', codigo: 'cofre.editar',
            aoTocar: async () => {
                const r = await excluirMovimentoRpc(m.p.id); if (!r) return;
                toast('Movimento excluído', 'sucesso'); voltarParaConta = contaVolta; await depoisDoMovimento(con);
            } },
    ] });
}
function abrirCorrigirMovimento(con, m, soObs, contaVolta) {
    const data0 = String(m.p.data_pagamento || m.p.vencimento || '').slice(0, 10);
    abrirSheetForm({ titulo: 'Corrigir dados', sub: con.descricao || '', rotuloSalvar: 'Salvar', empilhar: true,
        corpo: `${soObs ? '' : campo('inv-c-data', 'Data', `<input type="date" id="inv-c-data" max="${hoje()}" value="${esc(data0)}">`)}
            ${campo('inv-c-obs', 'Observação', `<input type="text" id="inv-c-obs" maxlength="120" value="${esc(m.p.observacao || '')}">`)}
            ${m.ids.length > 1 ? `<p class="rz-desc">Vale para o movimento e ${m.ids.length > 2 ? `os ${m.ids.length - 1} descontos` : 'o desconto'} dele.</p>` : ''}`,
        aoSalvar: async () => {
            const obs = document.getElementById('inv-c-obs')?.value.trim() || null;
            const muda = { observacao: obs };
            if (!soObs) {
                const data = document.getElementById('inv-c-data')?.value;
                if (!data) { toast('Informe a data.', 'erro'); return false; }
                Object.assign(muda, { data_pagamento: data, vencimento: data, competencia: data.slice(0, 7) + '-01' });
            }
            const { error } = await db().from('lancamentos').update(muda).in('id', m.ids);
            if (error) { toast(error.message || 'Não consegui salvar.', 'erro'); return false; }
            toast('Movimento corrigido', 'sucesso'); voltarParaConta = contaVolta; await depoisDoMovimento(con); return true;
        } });
}

// ---------------------------------------------------------------------------------------------------- indicadores (H)
// Mês a mês, por aplicação: ganho = V1 − V0 − aplicações + resgates (bruto) + rendimentos pagos (bruto); capital médio (Dietz
// modificado) = V0 + Σ aplicação × peso − Σ (resgate + rendimento) × peso, peso = dias do dinheiro no mês ÷ dias do mês. Nos
// períodos maiores, as rentabilidades mensais encadeadas (1+r1)(1+r2)… − 1, como corretoras e fundos.
const CAT_A = ['inv_aplicacao'], CAT_R = ['inv_resgate', 'inv_amortizacao'], CAT_P = ['inv_rendimento', 'inv_juros', 'inv_dividendo', 'inv_jcp'], CAT_T = ['inv_ir', 'inv_iof', 'inv_taxa'];
const MESES_L = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const ymDe = (iso) => String(iso).slice(0, 7);
const fimDoMes = (ym) => { const [y, m] = ym.split('-').map(Number); const f = `${ym}-${String(new Date(y, m, 0).getDate()).padStart(2, '0')}`; return f > hoje() ? hoje() : f; };
const diasNoMes = (ym) => { const [y, m] = ym.split('-').map(Number); return new Date(y, m, 0).getDate(); };
const INFO_IND = {
    sempre: ['Sempre visíveis', 'No ano, Últimos 12 meses e Desde o início não dependem do filtro: rentabilidade e ganho bruto de cada período, encadeando os meses.'],
    saldo_ini: ['Saldo inicial', 'Quanto a aplicação valia no último dia antes do período.'],
    aplic: ['Aplicações', 'Dinheiro novo que você colocou no período. Aumenta o saldo, mas não é ganho: por isso fica fora do rendimento.'],
    resg: ['Resgates', 'Valor bruto que você tirou da aplicação no período (antes de IR, IOF e taxas), mais amortizações. Diminui o saldo, mas não é perda.'],
    valoriz: ['Valorização', 'Quanto o saldo mudou só pelo mercado: saldo final − saldo inicial − aplicações + resgates.'],
    rend: ['Rendimentos pagos', 'Juros, cupons, dividendos, JCP e rendimentos que caíram no seu caixa no período, pelo valor bruto. São ganho, mesmo tendo saído da aplicação.'],
    saldo_fim: ['Saldo final', 'Quanto a aplicação valia no último dia do período (último valor informado; mês sem valor repete o anterior).'],
    ganho: ['Ganho bruto', 'Valorização + rendimentos pagos: o que o dinheiro rendeu no período, antes de impostos e taxas.'],
    imp: ['Impostos e taxas', 'IR e IOF retidos nos resgates e nos rendimentos, e taxas lançadas (custódia, corretagem, administração cobrada à parte).'],
    liq: ['Ganho líquido', 'Ganho bruto − impostos e taxas: o que de fato ficou para você.'],
    rent: ['Rentabilidade', 'Ganho bruto ÷ capital médio do período. O capital médio pesa cada aplicação e resgate pelos dias em que ficou investido (método de Dietz modificado). Em mais de um mês, as rentabilidades mensais são encadeadas, como fazem corretoras e fundos — assim dinheiro novo não vira rendimento.'],
    rent_liq: ['Rentabilidade líquida', 'O mesmo cálculo com o ganho líquido (depois de IR, IOF e taxas).'],
};
async function dadosIndicadores(ids) {
    if (!ids.length) return { meses: [] };
    const [{ data: rows, error: e1 }, hist, { data: lanc, error: e2 }] = await Promise.all([
        db().from('contratos').select('id, inicio, fim, status').in('id', ids),
        historicoValores(ids),
        db().from('lancamentos').select('contrato_id, categoria, valor, data_pagamento, vencimento, competencia, status').in('contrato_id', ids).eq('status', 'realizado'),
    ]);
    if (e1) throw e1; if (e2) throw e2;
    const apl = (rows || []).map(c => ({ ...c, st: String(c.status || '').toLowerCase() }));
    const ini = apl.map(c => String(c.inicio || hoje()).slice(0, 7)).sort()[0] || ymDe(hoje());
    const meses = [];
    for (let [y, m] = ini.split('-').map(Number); `${y}-${String(m).padStart(2, '0')}` <= ymDe(hoje()); m === 12 ? (y++, m = 1) : m++) meses.push(`${y}-${String(m).padStart(2, '0')}`);
    const valorEm = (c, ym) => {
        const fim = fimDoMes(ym);
        if (String(c.inicio || '') > fim) return 0;
        if ((c.st === 'encerrado' || c.st === 'finalizado') && c.fim && String(c.fim).slice(0, 10) <= fim) return 0;
        const ult = hist.filter(h => h.contrato_id === c.id && h.data_base <= fim).sort((a, b) => a.data_base.localeCompare(b.data_base)).pop();
        return ult ? ult.valor : 0;
    };
    const fluxos = (lanc || []).map(l => ({ c: l.contrato_id, cat: l.categoria, v: Number(l.valor || 0), d: String(l.data_pagamento || l.vencimento || l.competencia).slice(0, 10) }));
    const mm = meses.map((k, i) => {
        let V0 = 0, V1 = 0, A = 0, R = 0, P = 0, T = 0, cap = 0;
        apl.forEach(c => {
            const v0 = i ? valorEm(c, meses[i - 1]) : 0, v1 = valorEm(c, k);
            let capC = v0;
            fluxos.filter(f => f.c === c.id && f.d.slice(0, 7) === k).forEach(f => {
                const peso = (diasNoMes(k) - Number(f.d.slice(8, 10)) + 1) / diasNoMes(k);
                if (CAT_A.includes(f.cat)) { A += f.v; capC += f.v * peso; }
                else if (CAT_R.includes(f.cat)) { R += f.v; capC -= f.v * peso; }
                else if (CAT_P.includes(f.cat)) { P += f.v; capC -= f.v * peso; }
                else if (CAT_T.includes(f.cat)) T += f.v;
            });
            V0 += v0; V1 += v1; cap += Math.max(capC, 0);
        });
        const ganho = V1 - V0 - A + R + P, liq = ganho - T;
        return { k, V0, V1, A, R, P, T, ganho, liq, cap, r: cap > 0 ? ganho / cap : 0, rl: cap > 0 ? liq / cap : 0 };
    });
    return { meses: mm };
}
function periodo(d, de, ate) {
    const mm = d.meses.filter(x => x.k >= de && x.k <= ate);
    if (!mm.length) return null;
    const soma = (c) => mm.reduce((s, x) => s + x[c], 0);
    const enc = (c) => mm.reduce((s, x) => s * (1 + x[c]), 1) - 1;
    return { V0: mm[0].V0, V1: mm[mm.length - 1].V1, A: soma('A'), R: soma('R'), P: soma('P'), T: soma('T'), ganho: soma('ganho'), liq: soma('liq'), r: enc('r'), rl: enc('rl'), meses: mm.length };
}
const pctS = (v) => `${v < 0 ? '−' : v > 0 ? '+' : ''}${Math.abs(v * 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
const kmil = (v) => { const a = Math.abs(v) / 1000; return (v < -0.004 ? '−' : '') + (a >= 10 ? Math.round(a).toLocaleString('pt-BR') : a.toLocaleString('pt-BR', { maximumFractionDigits: 1 })); };
const moedaS = (v) => `${v < 0 ? '−' : ''}${moeda(Math.abs(v))}`;
function desenharIndicadores(card, d, ano, sel, porAplicacao) {
    if (!card) return;
    const agora = ymDe(hoje()), anoAtual = Number(agora.slice(0, 4));
    const ultimoAno = ano === anoAtual ? agora : `${ano}-12`;
    const [de, ate, rotP] = sel === null || sel === undefined ? [`${ano}-01`, ultimoAno, `${ano}${ano === anoAtual ? ' até ' + MESES_L[Number(agora.slice(5)) - 1].toLowerCase() : ''}`]
        : [`${ano}-${String(sel + 1).padStart(2, '0')}`, `${ano}-${String(sel + 1).padStart(2, '0')}`, `${MESES_L[sel]} de ${ano}`];
    const r = periodo(d, de, ate);
    const a12 = (() => { const [y, m] = agora.split('-').map(Number); const dd = new Date(y, m - 12, 1); return `${dd.getFullYear()}-${String(dd.getMonth() + 1).padStart(2, '0')}`; })();
    const fixo = (rot, x) => `<div class="rz-ind-fixo"><small>${esc(rot)}</small><b class="${x && x.r >= 0 ? 'rz-in' : ''}">${x ? pctS(x.r) : '—'}</b><span>${x ? esc(moedaS(x.ganho).replace(/,\d\d$/, '')) : ''}</span></div>`;
    const linha = (k, val, destaque, cls = '') => `<div class="rz-ind${destaque ? ' rz-ind-dest' : ''}"><span>${esc(INFO_IND[k][0])} ${infoInd(k)}</span><b class="${cls}">${esc(val)}</b></div>`;
    const valoriz = r ? r.ganho - r.P : 0;
    card.innerHTML = `<div class="rz-card-h"><h3>Indicadores</h3>${infoInd('sempre')}</div>
        <div class="rz-ind-fixos">${fixo('No ano', periodo(d, `${anoAtual}-01`, agora))}${fixo('12 meses', periodo(d, a12 > agora ? agora : a12, agora))}${fixo('Desde o início', periodo(d, '0000-00', agora))}</div>
        <div class="rz-card-h"><h3>${esc(rotP)}</h3><span class="rz-sub">filtro do Financeiro</span></div>
        ${r ? [linha('saldo_ini', moeda(r.V0)), linha('aplic', '+' + moeda(r.A)), linha('resg', '−' + moeda(r.R)), linha('valoriz', (valoriz >= 0 ? '+' : '') + moedaS(valoriz)),
            linha('rend', '+' + moeda(r.P)), linha('saldo_fim', moeda(r.V1)), linha('ganho', moedaS(r.ganho), true, r.ganho >= 0 ? 'rz-in' : ''), linha('imp', '−' + moeda(r.T)),
            linha('liq', moedaS(r.liq), true, r.liq >= 0 ? 'rz-in' : ''), linha('rent', pctS(r.r), true, r.r >= 0 ? 'rz-in' : ''), linha('rent_liq', pctS(r.rl), false, r.rl >= 0 ? 'rz-in' : '')].join('')
            + '<p class="rz-desc">Comparar com CDI, IPCA e poupança chega com as cotações (I3).</p>' : '<p class="rz-desc">Sem valores no período.</p>'}
        ${porAplicacao ? porAplicacao(de, ate, rotP) : ''}`;
    card.querySelectorAll('[data-ind-info]').forEach(b => b.addEventListener('click', (ev) => {
        ev.stopPropagation(); const k = b.dataset.indInfo;
        if (k === 'sempre') { if (typeof rzAviso === 'function') rzAviso({ titulo: 'Sobre os indicadores', linhas: Object.values(INFO_IND).map(([t, x]) => `${t}: ${x}`) }); return; }
        aviso(INFO_IND[k][0], INFO_IND[k][1]);
    }));
    icones();
}
const infoInd = (k) => `<button type="button" class="rz-i" data-ind-info="${k}" aria-label="O que é ${esc(INFO_IND[k][0])}?"><svg data-lucide="info"></svg></button>`;
function registrarFinanceiro(finId, d, card, porAplicacao) {
    window.__rzFinInvest = window.__rzFinInvest || {};
    window.__rzFinInvest[finId] = {
        serie: (ano) => MES_CURTO.map((_, m) => d.meses.find(x => x.k === `${ano}-${String(m + 1).padStart(2, '0')}`)?.ganho || 0),
        titulo: (ano, serie, mesHoje) => {
            const viv = serie.slice(0, mesHoje + 1); if (!viv.length || viv.every(v => Math.abs(v) < 0.5)) return `Nenhum ganho registrado em ${ano}`;
            const acum = viv.reduce((t, v) => t + v, 0), melhor = viv.indexOf(Math.max(...viv));
            return `Ganho de R$ ${kmil(acum)} mil em ${ano}${mesHoje < 11 ? ' até ' + MES_CURTO[mesHoje] : ''}; ${MESES_L[melhor].toLowerCase()} foi o melhor mês`;
        },
        aoFiltrar: (ano, sel) => desenharIndicadores(card(), d, ano, sel, porAplicacao),
    };
}
async function prepararIndicadores(ids, finId, cardId) {
    const d = await dadosIndicadores(ids);
    registrarFinanceiro(finId, d, () => document.getElementById(cardId));
    desenharIndicadores(document.getElementById(cardId), d, new Date().getFullYear(), new Date().getMonth());
    try { (await import('./financeiro.js')).rzFinRedesenhar(finId); } catch (e) { console.warn('[investimentos] financeiro:', e?.message || e); }
}
// H — conta: os mesmos indicadores somando as aplicações, com a tabela por aplicação no fim
export async function montarIndicadoresConta(a, finId, cardId) {
    const card = document.getElementById(cardId); if (card) card.innerHTML = sk(3);
    await tiposAplicacao().catch(() => []);
    const apl = await aplicacoesDaConta(a.id);
    if (!apl.length) { if (card) card.innerHTML = '<div class="rz-card-h"><h3>Indicadores</h3></div><p class="rz-desc">Nenhuma aplicação nesta conta ainda.</p>'; return; }
    const d = await dadosIndicadores(apl.map(c => c.id));
    const porApl = {};
    await Promise.all(apl.map(async c => { porApl[c.id] = await dadosIndicadores([c.id]); }));
    const porAplicacao = (de, ate, rotP) => `<div class="rz-group">Por aplicação · ${esc(rotP)}</div>` + apl.map(c => {
        const x = periodo(porApl[c.id], de, ate); if (!x || (!x.V0 && !x.V1 && !x.A && !x.R)) return '';
        return `<div class="rz-row"><div class="rz-ic"><i data-lucide="${ICONE_TIPO[c.tipo_contrato] || 'coins'}"></i></div><div class="rz-tx"><b>${esc(c.descricao || nomeTipo(c.tipo_contrato))}</b><span>${esc(`ganho ${moedaS(x.ganho)} · saldo ${moeda(x.V1)}`)}</span></div><div class="rz-rt"><b class="${x.r >= 0 ? 'rz-in' : ''}">${pctS(x.r)}</b></div></div>`;
    }).join('');
    registrarFinanceiro(finId, d, () => document.getElementById(cardId), porAplicacao);
    desenharIndicadores(document.getElementById(cardId), d, new Date().getFullYear(), new Date().getMonth(), porAplicacao);
    try { (await import('./financeiro.js')).rzFinRedesenhar(finId); } catch (e) { console.warn('[investimentos] financeiro:', e?.message || e); }
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
        if (o.status_execucao === 'aberto') { if (ehAporte(o)) abrirFormAporte(con); else abrirInformarValor(con, o.data_prevista_atual); return; }
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
