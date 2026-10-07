// ============================================================================
// js/fechamento.js — Raiz Patrimônio · Fechamento da competência
// Versão: 1.12.2 · 07/10/2026
//
// v1.12.2 (07/10/2026, sessão 20261007-1721-rolo-changelog, demanda 2507d554 — VER-05, "de acordo" do Nicola 07/10 17:21) — SÓ
// CABEÇALHO: as versões além das 5 mais recentes rolaram para o CHANGELOG_MODULOS.md.
// Nenhuma linha de código mudou — conferido token a token contra o publicado.
//
// Versão anterior: 1.12.1 · 04/10/2026
//
// v1.12.1 (04/10/2026, demanda cad6ec67 — correção dos testes da P2): a
// rotina "NFS-e da competência" ficava em cache até trocar de empresa;
// ligar/desligar em Minha empresa só aparecia no Financeiro depois de
// recarregar a página. Agora também reverifica quando o financeiro.js
// avança window.__rzFinRotinasEpoca (a cada entrada na aba Financeiro).
// Versão anterior: 1.12.0.
//
// v1.12.0 (04/10/2026, demanda cad6ec67 — P2 Ficha 4): o pacote do contador
// ganha a seção "Outras receitas" (bloco outras_receitas de
// fn_fechamento_calcular_contabil: entradas sem contrato — licenças,
// juros, receitas avulsas), que antes saíam misturadas em "Saídas". Vale
// no PDF, na planilha e no texto do compartilhamento. Pacotes antigos (sem
// o bloco) continuam abrindo igual. Ativos marcados "fora da contabilidade"
// (cofre_ativos.registro_contabil) já chegam excluídos pela função.
// Versão anterior: 1.11.0.
//
// v1.11.0 (demandas cdd8a2a5 e d9c1753c, entrega 2/3 do lote de 29): (1)
// chip "Fiscal OK" ficava preso no estado (ligada/desligada) da primeira
// empresa verificada na sessão — fechamentoRotinaFiscalLigada nunca era
// invalidado ao trocar de tenant. Agora guarda o cliente_id junto do cache
// (fechamentoRotinaFiscalClienteId) e reavalia quando CLIENTE_ID_SUPABASE
// mudar. (2) "Compartilhar com o contador": o PDF sempre ia no pacote, sem
// checkbox pra desmarcar, ao contrário de CSV/XML — ganhou checkbox igual
// aos outros 2, com guarda de "nenhum arquivo selecionado".
//
// v1.10.0 (achado do Nicola, 23/09/2026 — Albuquerque): com "Planilha" e
// "XML" marcados, o WhatsApp recebeu só o texto, sem nenhum anexo. Causa:
// navigator.share com vários arquivos de TIPOS diferentes (PDF + CSV + XML)
// junto com texto — o WhatsApp do Android descarta os arquivos e fica só
// com o texto. Correção: quando há mais de 1 arquivo, vai 1 ZIP só
// (PDF + planilha + XMLs dentro, fechamentoMontarZip, sem biblioteca) e o
// compartilhamento leva só o arquivo; o texto-resumo vai para a área de
// transferência ("cole na conversa"). Só o PDF continua indo como PDF.
// "Só baixar" não muda (baixa cada arquivo, como já funcionava).
// --------------------------------------------------------------------------
// Versões anteriores (v1.1.0 … v1.9.0): CHANGELOG_MODULOS.md, na raiz do repositório — o
// gerar_versoes.py rola pra lá automaticamente tudo além das 5 versões
// mais recentes deste cabeçalho (VER-05).

export const VERSAO = '1.12.2'; // v-check: lido por ⚙️ › Conta › Versões — manter igual ao header

// v1.3.0 (Fase 1 do wrapper de escrita, rollout Financeiro) — emitirEscrita
// é o evento padrão pra "algo mudou que módulos DE FORA deste arquivo podem
// precisar saber" (ver changelog do topo). aoEscrever usado só pelo listener
// interno registrado em fechamentoAtualizarCard(), logo abaixo.
import { emitirEscrita, aoEscrever } from './raiz-eventos.js';

let fechamentoUltimoEstado = null; // último resultado de fn_fechamento_verificar (cache pro Sheet de ações e pro botão dedicado)
let fechamentoCarregando = false;

// v1.1.0 (Entrega F3.1) — status fiscal é da CARTEIRA, não da competência
// selecionada: verificado 1x por sessão, igual financeiroRotinaFechamentoLigada.
let fechamentoRotinaFiscalLigada = null; // null = não verificado ainda; true/false = ligada/desligada
let fechamentoRotinaFiscalClienteId = null; // v1.11.0 — cliente_id em que o cache acima foi verificado; ver fechamentoAtualizarFiscal
let fechamentoRotinaFiscalEpoca = 0; // v1.12.1 — window.__rzFinRotinasEpoca em que o cache acima foi verificado
let fechamentoFiscalPendencias = []; // v1.6.0 — linhas de fn_fiscal_pendencias_cadastro
let fechamentoFiscalNotas = null; // v1.7.0 — KPIs de notas da competência (fn_fiscal_competencia); null = não verificado

// v1.4.0 (demanda 0e40951a, redesenho do Financeiro) — ids trocados de
// fin-botao-fechamento-* (ícone solto) pra fin-quad-fechamento-* (célula do
// grid 2x2 novo, ver financeiroQuadrantesHtml em financeiro.js).
// v1.5.0 (demanda 7bdcb8d4) — FECHAMENTO_IDS_BOTAO saiu: o botão Fechar/Abrir
// (e os outros 5) é desenhado por financeiro.js a partir do estado publicado
// em window.RZ_FIN_FECHAMENTO / window.RZ_FIN_FISCAL (ver fechamentoPublicarEstado).
const FECHAMENTO_IDS_KPI = {
    pendente: 'fin-kpi-fech-pendente', naoControlado: 'fin-kpi-fech-nao-controlado',
    recebido: 'fin-kpi-fech-recebido', pago: 'fin-kpi-fech-pago',
};

function fechamentoCompetenciaAtual() {
    if (typeof window !== 'undefined' && window.RZ_FIN_COMPETENCIA) return window.RZ_FIN_COMPETENCIA;
    const h = new Date();
    return `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, '0')}-01`;
}

function fechamentoPessoaLogada() {
    return (typeof pessoaIdLogada !== 'undefined' && pessoaIdLogada) ? pessoaIdLogada : null;
}

function fechamentoMoeda(v) {
    return (typeof formatarMoedaBR === 'function') ? formatarMoedaBR(Number(v || 0)) : `R$ ${Number(v || 0).toFixed(2)}`;
}

/** Desenha o card de competência do Fechamento (status + corpo + botão
 * dedicado + KPIs). Chamado 1x por abertura da aba Fechamento e por flip
 * de competência (financeiroRenderCabecalho('conciliacao'), ver
 * financeiro.js) — e também precisa redesenhar o botão dedicado nas
 * outras 2 abas (Recebimentos/Saídas), que não têm corpo/status próprios. */
export async function fechamentoAtualizarCard() {
    // v1.3.0 (Fase 1 do wrapper de escrita) — assina 1x por boot o evento
    // padrão de escrita pra 'competencia' (ver changelog do topo). Guard
    // por window.* de propósito: fechamentoAtualizarCard roda várias vezes
    // por sessão (abrir a aba, trocar de mês, fechar/reabrir), um listener
    // duplicado dispararia o refresh 2x+ a cada escrita.
    if (!window.__rzListenerEscritaFechamentoLigado) {
        window.__rzListenerEscritaFechamentoLigado = true;
        aoEscrever('competencia', () => { fechamentoAtualizarCard(); });
    }
    const elStatus = document.getElementById('fin-fechamento-status');
    const elCorpo = document.getElementById('fin-fechamento-corpo');
    if (elCorpo) elCorpo.textContent = 'Verificando…';
    if (elStatus) elStatus.innerHTML = '';
    fechamentoCarregando = true;
    // v1.5.0 — competência nova ainda não verificada: botões voltam ao estado
    // neutro ("Verificando…") em vez de mostrar o status do mês anterior.
    if (typeof window !== 'undefined') window.RZ_FIN_FECHAMENTO = null;
    fechamentoFiscalNotas = null; // v1.7.0 — notas do mês anterior não valem para este
    fechamentoPublicarEstado();
    try {
        const { data, error } = await dbAuth.rpc('fn_fechamento_verificar', {
            p_cliente_id: CLIENTE_ID_SUPABASE,
            p_competencia: fechamentoCompetenciaAtual(),
        });
        if (error) throw error;
        const linha = (data && data[0]) || null;
        fechamentoUltimoEstado = linha;
        fechamentoRenderCorpo(linha);
    } catch (e) {
        console.error('[fechamento] fn_fechamento_verificar', e);
        fechamentoUltimoEstado = null;
        if (elCorpo) elCorpo.textContent = 'Não consegui verificar o fechamento deste mês agora.';
    } finally {
        fechamentoCarregando = false;
    }
    fechamentoPublicarEstado(); // v1.5.0 — financeiro.js redesenha os 6 botões + cadeado
    fechamentoAtualizarKpis(); // v1.2.0 — não bloqueia o corpo acima
    fechamentoAtualizarFiscal(); // v1.1.0 — não bloqueia o corpo acima; 1x por sessão (guard interno)
}

/** v1.5.0 (demanda 7bdcb8d4, pedido explícito do Nicola 23/09/2026: "Os
 * botoes devem sinalizar seus status... a depender do status da
 * compentencia") — antes (v1.2.0–v1.4.0) este módulo desenhava sozinho a
 * célula Fechar/Abrir (fechamentoRenderBotaoDedicado) e o chip Fiscal
 * (fechamentoRenderFiscalChip). Agora são 6 botões que dependem do mesmo
 * estado (Adicionar trava com a competência fechada, Contador fica verde,
 * Fiscal e Atrasados mostram pendência), então o desenho foi pra UM lugar
 * só — financeiroQuadrantesHtml(), js/financeiro.js — e este módulo só
 * PUBLICA o estado em window e pede o redesenho (ponte window, módulos
 * isolados — mesmo padrão de window.RZ_FIN_COMPETENCIA_FECHADA). */
function fechamentoPublicarEstado() {
    if (typeof window === 'undefined') return;
    const linha = fechamentoUltimoEstado;
    if (linha && !fechamentoCarregando) {
        const uf = linha.ultimo_fechamento || {};
        const p = linha.pendencias || {};
        window.RZ_FIN_FECHAMENTO = {
            status: linha.status,
            fechadoEm: uf.fechado_em || null,
            motivo: linha.motivo_bloqueio || null,
            pendencias: {
                tem: !!p.tem_pendencia,
                recebimentosEmAtraso: Number(p.recebimentos_em_atraso || 0),
                saidasEmAtraso: Number(p.saidas_em_atraso || 0),
            },
        };
    } else if (!linha && !fechamentoCarregando) {
        // falha ao verificar: sai do "Verificando…" (estado neutro de aberta;
        // o toque em Fechar já avisa que o fechamento está indisponível).
        window.RZ_FIN_FECHAMENTO = { status: 'indisponivel', fechadoEm: null, motivo: null, pendencias: { tem: false, recebimentosEmAtraso: 0, saidasEmAtraso: 0 } };
    }
    window.RZ_FIN_FISCAL = (fechamentoRotinaFiscalLigada === null) ? null : {
        ligada: !!fechamentoRotinaFiscalLigada,
        total: fechamentoFiscalPendencias.length,
        notas: fechamentoFiscalNotas, // v1.7.0 — null enquanto não verificou
    };
    if (typeof window.financeiroRedesenharQuadrantes === 'function') window.financeiroRedesenharQuadrantes();
}

/** v1.2.0 — clique do botão dedicado: vai direto pro Sheet de formulário
 * certo, conforme o estado atual (nunca os dois juntos, REGRAS §11.1). */
export function fechamentoAlternarBotao() {
    if (fechamentoCarregando) return;
    const linha = fechamentoUltimoEstado;
    if (!linha || linha.status === 'sem_rotina') {
        if (typeof mostrarToast === 'function') mostrarToast(linha?.motivo_bloqueio || 'Fechamento indisponível para esta empresa.', 'info');
        return;
    }
    if (linha.status === 'concluido') fechamentoAbrirSheetReabrir();
    else fechamentoAbrirSheetFechar();
}

/** v1.2.0 — os 4 KPIs (pendente/não controlado/recebido/pago) do chip
 * Fechamento, mesmo padrão visual dos KPIs de Recebimentos/Saídas — nunca
 * somado no cliente, sempre de fn_financeiro_totalizador_fechamento. */
async function fechamentoAtualizarKpis() {
    const algumEl = document.getElementById(FECHAMENTO_IDS_KPI.pendente);
    if (!algumEl) return; // aba Fechamento ainda não montada nesta sessão
    Object.values(FECHAMENTO_IDS_KPI).forEach(id => { const el = document.getElementById(id); if (el) el.textContent = '...'; });
    try {
        const { data, error } = await dbAuth.rpc('fn_financeiro_totalizador_fechamento', {
            p_cliente_id: CLIENTE_ID_SUPABASE,
            p_competencia: fechamentoCompetenciaAtual(),
        });
        if (error) throw error;
        const l = (data && data[0]) || {};
        const setar = (id, qtde, valor) => {
            const el = document.getElementById(id);
            if (el) el.textContent = `${fechamentoMoeda(valor)} (${qtde || 0})`;
        };
        setar(FECHAMENTO_IDS_KPI.pendente, l.pendente_qtde, l.pendente_valor);
        setar(FECHAMENTO_IDS_KPI.naoControlado, l.nao_controlado_qtde, l.nao_controlado_valor);
        setar(FECHAMENTO_IDS_KPI.recebido, l.recebido_qtde, l.recebido_valor);
        setar(FECHAMENTO_IDS_KPI.pago, l.pago_qtde, l.pago_valor);
    } catch (e) {
        console.error('[fechamento] fn_financeiro_totalizador_fechamento', e);
        Object.values(FECHAMENTO_IDS_KPI).forEach(id => { const el = document.getElementById(id); if (el) el.textContent = 'R$ 0 (0)'; });
    }
}

/** Entrega F3.1 — verifica se a rotina nfse_competencia está ligada e, se
 * sim, busca as pendências do checklist. Status da rotina é verificado 1x
 * por sessão (é da carteira, não da competência). v1.6.0: as pendências vêm
 * de fn_fiscal_pendencias_cadastro (fonte única); forcar=true relê só as
 * pendências (depois de corrigir um cadastro pelo próprio checklist). */
async function fechamentoAtualizarFiscal(forcar = false) {
    // v1.11.0 (demanda cdd8a2a5) — o cache abaixo era só "1x por sessão", nunca
    // invalidado ao trocar de empresa/tenant: se a 1ª empresa verificada numa
    // sessão resolvesse ligada=false, qualquer outra aberta depois na mesma aba
    // herdava esse valor errado. Agora reavalia sempre que CLIENTE_ID_SUPABASE
    // mudar desde a última verificação (mesmo padrão de ativos-boot.js, sem o
    // location.reload() dele — aqui é só o chip).
    const epocaRotinas = (typeof window !== 'undefined') ? (window.__rzFinRotinasEpoca || 0) : 0; // v1.12.1
    if (fechamentoRotinaFiscalClienteId !== CLIENTE_ID_SUPABASE || fechamentoRotinaFiscalEpoca !== epocaRotinas) {
        fechamentoRotinaFiscalEpoca = epocaRotinas;
        fechamentoRotinaFiscalLigada = null;
        fechamentoFiscalPendencias = [];
        fechamentoFiscalNotas = null;
        fechamentoRotinaFiscalClienteId = CLIENTE_ID_SUPABASE;
    }
    if (fechamentoRotinaFiscalLigada !== null && !forcar) {
        await fechamentoAtualizarNotasFiscais(); // v1.7.0 — as notas mudam a cada competência
        fechamentoRenderFiscalChip();
        return;
    }
    if (fechamentoRotinaFiscalLigada === null) {
        try {
            const { data: rotinas, error: eRot } = await dbAuth.rpc('fn_rotinas_empresa_listar', { p_cliente_id: CLIENTE_ID_SUPABASE });
            if (eRot) throw eRot;
            const linhaRotina = (rotinas || []).find(r => r.codigo === 'nfse_competencia');
            fechamentoRotinaFiscalLigada = !!(linhaRotina && linhaRotina.ligada);
        } catch (e) {
            console.error('[fechamento] fn_rotinas_empresa_listar (fiscal)', e);
            fechamentoRotinaFiscalLigada = false; // falha de rede: botão fica neutro, nunca mostra pendência não confirmada
            fechamentoRenderFiscalChip();
            return;
        }
    }
    if (!fechamentoRotinaFiscalLigada) { fechamentoRenderFiscalChip(); return; }

    try {
        const { data, error } = await dbAuth.rpc('fn_fiscal_pendencias_cadastro', { p_cliente_id: CLIENTE_ID_SUPABASE });
        if (error) throw error;
        fechamentoFiscalPendencias = data || [];
    } catch (e) {
        console.error('[fechamento] fn_fiscal_pendencias_cadastro', e);
        fechamentoFiscalPendencias = []; // não mostra número que não confirmou
    }
    await fechamentoAtualizarNotasFiscais();
    fechamentoRenderFiscalChip();
}

/** v1.7.0 — notas da competência aberta no Financeiro (KPIs e status por
 * recebimento), da MESMA função da tela Fiscal da competência. Só com a
 * rotina fiscal ligada; falha de rede = null (o botão não inventa número). */
async function fechamentoAtualizarNotasFiscais() {
    if (!fechamentoRotinaFiscalLigada) { fechamentoFiscalNotas = null; if (typeof window !== 'undefined') window.RZ_FIN_FISCAL_REC = null; return; }
    const comp = fechamentoCompetenciaAtual();
    try {
        const { data, error } = await dbAuth.rpc('fn_fiscal_competencia', { p_cliente_id: CLIENTE_ID_SUPABASE, p_competencia: comp });
        if (error) throw error;
        if (comp !== fechamentoCompetenciaAtual()) return; // o mês mudou no meio: a chamada nova publica
        const k = data?.kpis || {};
        fechamentoFiscalNotas = {
            aPreparar: Number(k.a_preparar || 0), preparadas: Number(k.preparada || 0),
            comContador: Number(k.com_contador || 0), emitidas: Number(k.emitida || 0), faltaDado: Number(k.falta_dado || 0),
        };
        const mapa = {};
        (data?.recebimentos || []).forEach(r => { mapa[r.mensalidade_id] = r.status_fiscal; });
        if (typeof window !== 'undefined') window.RZ_FIN_FISCAL_REC = mapa;
    } catch (e) {
        console.error('[fechamento] fn_fiscal_competencia', e?.code || '');
        fechamentoFiscalNotas = null;
        if (typeof window !== 'undefined') window.RZ_FIN_FISCAL_REC = null;
    }
}

/** v1.6.1 — relê as pendências e abre o checklist (sem depender da rotina). */
export async function fechamentoAbrirChecklistFiscalAtualizado() {
    try {
        const { data, error } = await dbAuth.rpc('fn_fiscal_pendencias_cadastro', { p_cliente_id: CLIENTE_ID_SUPABASE });
        if (error) throw error;
        fechamentoFiscalPendencias = data || [];
    } catch (e) {
        console.error('[fechamento] fn_fiscal_pendencias_cadastro', e);
        if (typeof mostrarToast === 'function') mostrarToast('Não consegui carregar as pendências agora.', 'danger');
        return;
    }
    fechamentoAbrirChecklistFiscal();
}

// v1.5.0 (demanda 7bdcb8d4) — o chip Fiscal virou o botão "Fiscal" dos 6
// (financeiro.js); aqui só publica o estado.
function fechamentoRenderFiscalChip() {
    fechamentoPublicarEstado();
}

/** Checklist fiscal (v1.6.0): o que falta no cadastro para a NFS-e sair,
 * agrupado por Empresa · Locatário · Imóvel. Nunca afirma que a empresa é
 * contribuinte — só mostra o que falta. Nada é emitido a partir daqui. */
const FECHAMENTO_FISCAL_GRUPOS = [
    { chave: 'empresa', titulo: 'Empresa', tipos: ['empresa_sem_documento', 'empresa_documento_invalido', 'empresa_sem_municipio'] },
    { chave: 'tomador', titulo: 'Documento do locatário', tipos: ['tomador_sem_documento', 'tomador_documento_invalido'] },
    { chave: 'imovel', titulo: 'Imóvel', tipos: ['imovel_sem_destinacao', 'imovel_sem_municipio', 'imovel_sem_cib'] },
];

export function fechamentoAbrirChecklistFiscal() {
    if (typeof abrirSheet !== 'function') return;
    const esc = (typeof rzEsc === 'function') ? rzEsc : (s) => String(s ?? '');
    const pend = fechamentoFiscalPendencias || [];
    const podeEditarContrato = (typeof podeUsar === 'function') ? !!podeUsar('contratos.editar')?.ok : true;
    const idx = new Map(pend.map((p, i) => [i, p]));
    window.RZ_FIN_FISCAL_PEND = pend; // ponte do onclick (índice → linha), mesmo padrão dos demais window.RZ_FIN_*
    const linhaHtml = (p, i) => {
        const icone = p.entidade_tipo === 'contrato' ? 'user-x' : (p.entidade_tipo === 'empresa' ? 'building-2' : 'home');
        const tom = p.gravidade === 'atencao' ? 'rz-warn' : 'rz-bad';
        return `
        <div class="rz-row rz-link" onclick="fechamentoTratarPendenciaFiscal(${i})">
            <div class="rz-ic ${tom}"><svg data-lucide="${icone}"></svg></div>
            <div class="rz-tx"><b>${esc(p.titulo)}</b><span>${esc(p.detalhe || '')}</span></div>
            <svg data-lucide="chevron-right" class="rz-chev"></svg>
        </div>`;
    };
    const secoes = FECHAMENTO_FISCAL_GRUPOS.map(g => {
        const itens = [...idx.entries()].filter(([, p]) => g.tipos.includes(p.tipo));
        if (!itens.length) return '';
        return `<div class="rz-group">${esc(g.titulo)} (${itens.length})</div>
            <div class="rz-card rz-list">${itens.map(([i, p]) => linhaHtml(p, i)).join('')}</div>`;
    }).join('');
    const vazio = `<div class="rz-empty"><div class="rz-ic"><svg data-lucide="file-check-2"></svg></div><p class="rz-desc">Nenhuma pendência de cadastro para a NFS-e.</p></div>`;
    const dica = 'Toque numa linha para completar o dado aqui mesmo.'; // v1.9.0
    const corpo = `
        <p class="rz-desc">O que falta no cadastro para emitir a NFS-e quando a obrigatoriedade chegar. Nada é emitido a partir daqui.${dica ? ' ' + dica : ''}</p>
        ${pend.length ? secoes : vazio}`;
    abrirSheet(rzSheetCabecalho('Checklist fiscal', pend.length ? `${pend.length} pendência${pend.length > 1 ? 's' : ''}` : 'Tudo certo') + `<div class="rz-sh-b">${corpo}</div>`);
    if (typeof rzIcones === 'function') rzIcones();
}

/** v1.6.0 — toque numa linha do checklist. Locatário sem documento (D6):
 * campo CPF/CNPJ no próprio Sheet de formulário. Demais: leva ao cadastro
 * certo (ficha do ativo, contrato ou Minha empresa). */
export function fechamentoTratarPendenciaFiscal(i) {
    const p = (window.RZ_FIN_FISCAL_PEND || [])[i];
    if (!p) return;
    // v1.9.0 — completar no contexto, qualquer campo (função única do fiscal.js)
    if (typeof window.fiscalCompletarPendencia === 'function' && p.campo) {
        window.fiscalCompletarPendencia(p, async () => {
            await fechamentoAtualizarFiscal(true);
            fechamentoAbrirChecklistFiscalAtualizado(); // relê e volta ao checklist
        });
        return;
    }
    const podeEditarContrato = (typeof podeUsar === 'function') ? !!podeUsar('contratos.editar')?.ok : true;
    if (p.entidade_tipo === 'contrato' && podeEditarContrato && typeof abrirSheetForm === 'function') {
        fechamentoAbrirFormDocumentoTomador(p);
        return;
    }
    fecharSheet();
    if (p.entidade_tipo === 'contrato') {
        if (typeof window.abrirFichaContrato === 'function') window.abrirFichaContrato(p.entidade_id);
    } else if (p.entidade_tipo === 'ativo') {
        switchTab('tab-ativos');
        if (typeof window.abrirFichaAtivoNoChip === 'function') window.abrirFichaAtivoNoChip(p.entidade_id, 'resumo');
    } else {
        switchTab('tab-minha-empresa');
    }
}

function fechamentoAbrirFormDocumentoTomador(p) {
    const esc = (typeof rzEsc === 'function') ? rzEsc : (s) => String(s ?? '');
    abrirSheetForm({
        titulo: 'Documento do locatário',
        sub: p.titulo,
        rotuloSalvar: 'Salvar documento',
        corpo: `
            <div class="rz-f">
                <label for="fech-doc-tomador">CPF ou CNPJ <i>*</i></label>
                <input type="text" id="fech-doc-tomador" inputmode="text" autocomplete="off" maxlength="18" placeholder="Só números (CNPJ pode ter letras)">
            </div>
            <p class="rz-desc">${esc(p.detalhe || '')}. Fica gravado no cadastro do locatário em Partes e vale para todos os contratos dele.</p>`,
        aoSalvar: async (corpoEl) => {
            const doc = (corpoEl.querySelector('#fech-doc-tomador')?.value || '').trim();
            if (!doc) { mostrarToast('Informe o CPF ou CNPJ.', 'danger'); return false; }
            const { data, error } = await dbAuth.rpc('fn_contrato_tomador_documento_definir', { p_contrato_id: p.entidade_id, p_documento: doc });
            if (error) { mostrarToast(error.message || 'Não consegui salvar o documento.', 'danger'); return false; }
            emitirEscrita('contrato', { id: p.entidade_id, acao: 'editar' });
            const antes = fechamentoFiscalPendencias.filter(x => x.entidade_tipo === 'contrato').length;
            await fechamentoAtualizarFiscal(true);
            const resolvidos = antes - fechamentoFiscalPendencias.filter(x => x.entidade_tipo === 'contrato').length;
            // o mesmo locatário pode estar em vários contratos (1 cadastro em Partes): o documento vale para todos
            const txt = data?.reaproveitou_parte ? 'Documento salvo — o contrato passou a usar o cadastro que já existia em Partes.'
                : (resolvidos > 1 ? `Documento salvo — vale para os ${resolvidos} contratos deste locatário.` : 'Documento salvo.');
            mostrarToast(txt, 'success');
            setTimeout(() => fechamentoAbrirChecklistFiscal(), 0); // volta ao checklist já atualizado
            return true;
        },
    });
}

function fechamentoRenderCorpo(linha) {
    const elStatus = document.getElementById('fin-fechamento-status');
    const elCorpo = document.getElementById('fin-fechamento-corpo');
    // CORRIGIDO (achado nesta entrega, QUA-01) — o ⋮ de Recebimentos/Saídas
    // (rzAcoesMensalidade/rzAcoesDespesa, financeiro.js) precisa saber se a
    // competência em tela está fechada, pra parar de oferecer
    // Estornar/"Não incluir na contabilidade" nesse caso (REGRAS §11.1: só
    // Recibo e Ver detalhes continuam disponíveis — o trigger de banco já
    // bloqueia a gravação, mas o menu não devia nem oferecer a ação).
    // Espelhado em window, mesmo padrão de window.RZ_FIN_COMPETENCIA —
    // módulos isolados não se importam.
    if (typeof window !== 'undefined') window.RZ_FIN_COMPETENCIA_FECHADA = !!(linha && linha.status === 'concluido');
    if (!linha) { if (elCorpo) elCorpo.textContent = ''; return; }

    if (linha.status === 'sem_rotina') {
        if (elStatus) elStatus.innerHTML = '';
        if (elCorpo) elCorpo.textContent = linha.motivo_bloqueio || 'Rotina de fechamento desligada.';
        return;
    }

    if (linha.status === 'concluido') {
        if (elStatus && typeof renderStatus === 'function') elStatus.innerHTML = renderStatus('ok', 'Fechado');
        const uf = linha.ultimo_fechamento || {};
        const fin = uf.recebimentos ? uf : null; // ultimo_fechamento carrega recebimentos/saidas/meta/fechado_em direto
        const partes = [];
        if (fin) {
            partes.push(`Previsto ${fechamentoMoeda(fin.recebimentos.previsto)} · Recebido ${fechamentoMoeda(fin.recebimentos.realizado)} · Pago ${fechamentoMoeda(fin.saidas.realizado)}`);
        }
        if (uf.fechado_em) {
            const d = new Date(uf.fechado_em);
            partes.push(`Fechada em ${d.toLocaleDateString('pt-BR')}`);
        }
        if (uf.meta && uf.meta.observacao) partes.push(`Observação: ${uf.meta.observacao}`);
        if (linha.pendencias && linha.pendencias.tem_pendencia) partes.push('Há lançamentos em atraso neste mês desde o fechamento.');
        if (elCorpo) elCorpo.textContent = partes.join(' · ');
        return;
    }

    // aberto
    if (elStatus) elStatus.innerHTML = '';
    if (elCorpo) {
        elCorpo.textContent = (linha.pendencias && linha.pendencias.tem_pendencia)
            ? 'Ainda não fechada — há lançamentos em atraso neste mês.'
            : 'Ainda não fechada.';
    }
}

function fechamentoResumoPendencia(linha) {
    if (!linha || !linha.pendencias || !linha.pendencias.tem_pendencia) return null;
    const partes = [];
    if (Number(linha.pendencias.recebimentos_em_atraso) > 0) partes.push(`${fechamentoMoeda(linha.pendencias.recebimentos_em_atraso)} em atraso (Recebimentos)`);
    if (Number(linha.pendencias.saidas_em_atraso) > 0) partes.push(`${fechamentoMoeda(linha.pendencias.saidas_em_atraso)} vencido (Saídas)`);
    return partes.join(' · ') || null;
}

/** v1.2.0 — ⋮ do card passa a abrir só "Compartilhar com o contador"
 * (Fechar/Reabrir saiu daqui, ver fechamentoAlternarBotao acima). */
export function fechamentoAbrirAcoes() {
    if (typeof abrirSheetAcoes !== 'function') return;
    // v1.4.0 (demanda 0e40951a) — "Checklist fiscal" (chip #fin-fiscal-chip
    // que morava solto no card de competência) voltou a viver aqui — o
    // pedido explícito do Nicola foi tirar a TAG do card, não a
    // funcionalidade. Só aparece se a rotina nfse_competencia estiver
    // ligada (mesma regra de sempre — fechamentoRotinaFiscalLigada).
    const acoes = [];
    if (fechamentoRotinaFiscalLigada) {
        const total = fechamentoFiscalPendencias.length;
        acoes.push({ icone: 'file-check-2', titulo: 'Checklist fiscal', sub: total === 0 ? 'Tudo certo' : `${total} pendência(s)`, aoTocar: fechamentoAbrirChecklistFiscal });
    }
    acoes.push({ icone: 'send', titulo: 'Compartilhar com o contador', aoTocar: fechamentoAbrirCompartilharContador });
    abrirSheetAcoes({ titulo: 'Fechamento da competência', acoes });
}

function fechamentoAbrirSheetFechar() {
    if (typeof abrirSheetForm !== 'function') return;
    const linha = fechamentoUltimoEstado;
    const avisoPendencia = fechamentoResumoPendencia(linha);
    abrirSheetForm({
        titulo: 'Fechar a competência',
        sub: avisoPendencia ? `Ainda há pendência (${avisoPendencia}) — fechar mesmo assim registra o retrato com isso em aberto.` : 'O retrato desta competência fica registrado, mesmo que algo mude depois.',
        rotuloSalvar: 'Fechar a competência',
        corpo: `<label class="text-xs font-bold text-slate-600">Observação (opcional)</label>
                <textarea id="fechamento-obs" class="w-full p-2.5 border rounded-lg text-sm mt-1" rows="3" placeholder="Ex.: fechado após conciliar o extrato do mês"></textarea>`,
        aoSalvar: async (corpoEl) => {
            const obs = corpoEl.querySelector('#fechamento-obs')?.value.trim() || null;
            const { error } = await dbAuth.rpc('fn_fechamento_fechar', {
                p_cliente_id: CLIENTE_ID_SUPABASE,
                p_competencia: fechamentoCompetenciaAtual(),
                p_observacao: obs,
                p_pessoa_id: fechamentoPessoaLogada(),
            });
            if (error) { if (typeof mostrarToast === 'function') mostrarToast('Erro ao fechar: ' + error.message, 'danger'); return false; }
            // v1.3.0 (Fase 1 do wrapper de escrita) — ver changelog do topo.
            emitirEscrita('competencia', { competencia: fechamentoCompetenciaAtual(), acao: 'fechar' });
            if (typeof mostrarToast === 'function') mostrarToast('Competência fechada.', 'success');
            fechamentoAtualizarCard();
        },
    });
}

function fechamentoAbrirSheetReabrir() {
    if (typeof abrirSheetForm !== 'function') return;
    const ocorrenciaId = fechamentoUltimoEstado?.ocorrencia_id;
    if (!ocorrenciaId) return;
    abrirSheetForm({
        titulo: 'Reabrir a competência',
        sub: 'Desfaz o fechamento — o retrato anterior continua registrado, e um novo é gerado no próximo fechamento (inclusive o pacote do contador). Explique o motivo.',
        rotuloSalvar: 'Reabrir a competência',
        corpo: `<label class="text-xs font-bold text-slate-600">Motivo da reabertura</label>
                <textarea id="fechamento-motivo" class="w-full p-2.5 border rounded-lg text-sm mt-1" rows="3" placeholder="Ex.: preciso corrigir um lançamento deste mês"></textarea>`,
        aoSalvar: async (corpoEl) => {
            const motivo = corpoEl.querySelector('#fechamento-motivo')?.value.trim() || '';
            if (!motivo) { if (typeof mostrarToast === 'function') mostrarToast('Informe o motivo da reabertura.', 'danger'); return false; }
            const { error } = await dbAuth.rpc('fn_fechamento_reabrir', {
                p_ocorrencia_id: ocorrenciaId,
                p_motivo: motivo,
                p_pessoa_id: fechamentoPessoaLogada(),
            });
            if (error) { if (typeof mostrarToast === 'function') mostrarToast('Erro ao reabrir: ' + error.message, 'danger'); return false; }
            // v1.3.0 (Fase 1 do wrapper de escrita) — ver changelog do topo.
            emitirEscrita('competencia', { competencia: fechamentoCompetenciaAtual(), acao: 'reabrir', ocorrenciaId });
            if (typeof mostrarToast === 'function') mostrarToast('Competência reaberta.', 'success');
            fechamentoAtualizarCard();
        },
    });
}

// ----------------------------------------------------------------------------
// v1.2.0 — Compartilhar com o contador (Entrega F.3 redesenhada)
// ----------------------------------------------------------------------------

/** Sheet: escolher contador cadastrado + canal + 1 ou mais competências
 * já fechadas. Sem contador cadastrado ou sem competência fechada, avisa
 * e não abre (nada de sheet vazio). */
export async function fechamentoAbrirCompartilharContador() {
    if (typeof abrirSheetForm !== 'function') return;

    let contadores = [];
    try {
        // v1.6.0 (D2) — fonte única: Partes (fn_contadores_empresa). id = parte.
        const { data, error } = await dbAuth.rpc('fn_contadores_empresa', { p_cliente_id: CLIENTE_ID_SUPABASE });
        if (error) throw error;
        contadores = (data || []).map(c => ({ id: c.parte_id, nome: c.nome, whatsapp: c.whatsapp, email: c.email }));
    } catch (e) {
        console.error('[fechamento] buscar contador cadastrado', e);
        if (typeof mostrarToast === 'function') mostrarToast('Não consegui buscar o contador cadastrado agora.', 'danger');
        return;
    }
    if (!contadores.length) {
        // CORRIGIDO — o rótulo original apontava pra "Empresa › Rotinas",
        // destino errado: contador se cadastra em Partes (chip Prestadores,
        // campo "Atua como prestador?" → Contador), mesma tela de
        // administradora/síndico/manutencista (index.html, abrirFormParteSheet).
        if (typeof mostrarToast === 'function') mostrarToast('Nenhum contador cadastrado ainda — cadastre agora.', 'info');
        if (typeof window.abrirCadastroContador === 'function') window.abrirCadastroContador();
        return;
    }

    let fechadas = [];
    try {
        const { data, error } = await dbAuth.rpc('fn_fechamento_listar_fechadas', { p_cliente_id: CLIENTE_ID_SUPABASE, p_limite: 12 });
        if (error) throw error;
        fechadas = data || [];
    } catch (e) {
        console.error('[fechamento] listar competências fechadas', e);
        if (typeof mostrarToast === 'function') mostrarToast('Não consegui listar as competências fechadas agora.', 'danger');
        return;
    }
    if (!fechadas.length) {
        if (typeof mostrarToast === 'function') mostrarToast('Nenhuma competência fechada ainda.', 'info');
        return;
    }

    const rzEscSafe = (typeof rzEsc === 'function') ? rzEsc : (s) => String(s ?? '');
    const rotuloMes = (iso) => new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    const opcoesContador = contadores.map(c => `<option value="${c.id}">${rzEscSafe(c.nome)}</option>`).join('');
    const opcoesCompetencia = fechadas.map((f, i) => `
        <label class="rz-row" style="cursor:pointer">
            <input type="checkbox" class="fechamento-comp-check" value="${f.competencia}" ${i === 0 ? 'checked' : ''} style="margin-right:10px">
            <div class="rz-tx"><b>${rzEscSafe(rotuloMes(f.competencia))}</b></div>
        </label>`).join('');

    abrirSheetForm({
        titulo: 'Compartilhar com o contador',
        sub: 'Gera 1 PDF por competência selecionada, a partir do retrato já fechado (nunca recalculado).',
        rotuloSalvar: 'Gerar e compartilhar',
        corpo: `
            <label class="text-xs font-bold text-slate-600">Contador</label>
            <select id="fechamento-contador-sel" class="w-full p-2.5 border rounded-lg text-sm mt-1 mb-3">${opcoesContador}</select>
            <label class="text-xs font-bold text-slate-600">Canal</label>
            <select id="fechamento-canal-sel" class="w-full p-2.5 border rounded-lg text-sm mt-1 mb-3">
                <option value="whatsapp">WhatsApp</option>
                <option value="email">E-mail</option>
                <option value="baixar">Só baixar os arquivos</option>
            </select>
            <label class="text-xs font-bold text-slate-600">Competências</label>
            <div class="rz-card rz-list mt-1">${opcoesCompetencia}</div>
            <div class="rz-group">Arquivos do pacote</div>
            <div class="rz-card rz-list">
                <label class="rz-row rz-chk"><input type="checkbox" id="fechamento-inc-pdf" checked><div class="rz-tx"><b>PDF</b><span>Resumo da competência</span></div></label>
                <label class="rz-row rz-chk"><input type="checkbox" id="fechamento-inc-csv" checked><div class="rz-tx"><b>Planilha (CSV)</b><span>Tudo do pacote, abre no Excel</span></div></label>
                <label class="rz-row rz-chk"><input type="checkbox" id="fechamento-inc-xml" checked><div class="rz-tx"><b>XML das notas</b><span>Arquivos das notas emitidas, do Cofre</span></div></label>
            </div>
        `,
        aoSalvar: async (corpoEl) => {
            const contadorId = corpoEl.querySelector('#fechamento-contador-sel')?.value;
            const canal = corpoEl.querySelector('#fechamento-canal-sel')?.value || 'whatsapp';
            const comps = [...corpoEl.querySelectorAll('.fechamento-comp-check:checked')].map(el => el.value);
            if (!comps.length) { if (typeof mostrarToast === 'function') mostrarToast('Selecione ao menos uma competência.', 'danger'); return false; }
            // v1.11.0 (demanda d9c1753c) — PDF agora tem checkbox igual XML/Excel; antes ia sempre incluído, sem opção de desmarcar.
            const opcoes = {
                pdf: !!corpoEl.querySelector('#fechamento-inc-pdf')?.checked,
                csv: !!corpoEl.querySelector('#fechamento-inc-csv')?.checked,
                xml: !!corpoEl.querySelector('#fechamento-inc-xml')?.checked,
            };
            if (!opcoes.pdf && !opcoes.csv && !opcoes.xml) { if (typeof mostrarToast === 'function') mostrarToast('Selecione ao menos um arquivo.', 'danger'); return false; }
            await fechamentoGerarEcompartilhar(contadorId, canal, comps, opcoes);
        },
    });
}

/** Monta 1 pacote por competência (fn_pacote_contador_montar, lendo o
 * bloco 'contabil' do snapshot), gera os PDFs (jsPDF) e compartilha:
 * navigator.share() com os arquivos de verdade quando o navegador
 * suporta (a maioria dos celulares — inclusive pra WhatsApp); senão baixa
 * o(s) PDF(s) e abre wa.me/mailto só com o texto-resumo, avisando que o
 * PDF precisa ser anexado à mão (nenhum dos dois esquemas de URL
 * consegue anexar arquivo — limitação do próprio navegador/protocolo,
 * não do Raiz). */
async function fechamentoGerarEcompartilhar(contadorId, canal, competencias, opcoes = { pdf: true, csv: true, xml: true }) {
    if (typeof mostrarToast === 'function') mostrarToast('Gerando pacote…', 'info');
    const pacotes = [];
    let contadorInfo = null;
    for (const comp of competencias) {
        try {
            const { data, error } = await dbAuth.rpc('fn_pacote_contador_montar', {
                p_cliente_id: CLIENTE_ID_SUPABASE, p_competencia: comp, p_contador_parte_id: contadorId,
            });
            if (error) throw error;
            const linha = data && data[0];
            if (!linha) continue;
            contadorInfo = contadorInfo || { nome: linha.contador_nome, whatsapp: linha.contador_whatsapp, email: linha.contador_email };
            pacotes.push(linha);
        } catch (e) {
            console.error('[fechamento] montar pacote do contador', comp, e);
            if (typeof mostrarToast === 'function') mostrarToast(`Erro ao montar o pacote de ${comp}: ${e.message}`, 'danger');
        }
    }
    if (!pacotes.length) return;

    // v1.11.0 (demanda d9c1753c) — PDF só entra se marcado (antes era gerado sempre,
    // incondicional, o único dos 3 sem checkbox pra desmarcar).
    let arquivos = [];
    if (opcoes.pdf) {
        try {
            arquivos = pacotes.map(p => fechamentoMontarPdfPacote(p));
        } catch (e) {
            console.error('[fechamento] montar PDF do pacote', e);
            if (typeof mostrarToast === 'function') mostrarToast('Não consegui montar o PDF agora.', 'danger');
            return;
        }
    }
    // v1.8.0 — anexos: planilha e XML das notas (falha num anexo não derruba o pacote)
    if (opcoes.csv) pacotes.forEach(p => { try { arquivos.push(fechamentoMontarCsvPacote(p)); } catch (e) { console.warn('[fechamento] CSV', e?.message); } });
    if (opcoes.xml) arquivos.push(...await fechamentoBaixarXmlsNotas(pacotes));
    if (!arquivos.length) { if (typeof mostrarToast === 'function') mostrarToast('Nenhum arquivo selecionado.', 'danger'); return; }

    if (canal === 'baixar') {
        arquivos.forEach(fechamentoBaixarArquivo);
        await fechamentoMarcarRascunhosEnviados(pacotes);
        if (typeof mostrarToast === 'function') mostrarToast(`${arquivos.length} arquivo(s) baixado(s).`, 'success');
        return;
    }

    // v1.10.0 — mais de 1 arquivo vira 1 ZIP (o WhatsApp descarta anexos de tipos misturados)
    if (arquivos.length > 1) {
        try {
            const comps = pacotes.map(p => String(p.competencia).slice(0, 7)).join('_');
            arquivos = [await fechamentoMontarZip(arquivos, `pacote-contador-${comps}.zip`)];
        } catch (e) { console.warn('[fechamento] ZIP do pacote', e?.message); }
    }
    const textoResumo = fechamentoTextoResumo(pacotes);
    let compartilhouNativo = false;
    if (typeof navigator !== 'undefined' && navigator.canShare) {
        try {
            const files = arquivos.map(a => new File([a.blob], a.nome, { type: a.tipo || 'application/pdf' }));
            if (navigator.canShare({ files })) {
                // Só o arquivo: com texto junto, o WhatsApp do Android fica só com o texto.
                try { await navigator.clipboard?.writeText(textoResumo); } catch (_) { /* sem permissão: segue sem copiar */ }
                if (typeof mostrarToast === 'function') mostrarToast('Resumo copiado — cole na conversa, se quiser.', 'info');
                await navigator.share({ files, title: 'Pacote do contador' });
                compartilhouNativo = true;
            }
        } catch (e) {
            // usuário cancelou: não baixa nada; o navegador recusou: segue pro fallback abaixo
            if (e?.name === 'AbortError') return;
            compartilhouNativo = false;
        }
    }

    if (!compartilhouNativo) {
        arquivos.forEach(fechamentoBaixarArquivo);
        // v1.11.0 (demanda d9c1753c) — a mensagem dizia "PDF baixado" mesmo quando o PDF
        // foi desmarcado e sobrou só CSV/XML; agora nomeia o arquivo real.
        const rotuloArquivo = arquivos[0]?.nome?.endsWith('.zip') ? 'arquivo .zip'
            : arquivos[0]?.nome?.endsWith('.csv') ? 'planilha' : arquivos[0]?.nome?.endsWith('.xml') ? 'XML' : 'PDF';
        const texto = encodeURIComponent(textoResumo + `\n\n(${rotuloArquivo} baixado — anexe antes de enviar)`);
        if (canal === 'whatsapp') {
            const numero = (contadorInfo?.whatsapp || '').replace(/\D/g, '');
            if (!numero) { if (typeof mostrarToast === 'function') mostrarToast(`Contador sem WhatsApp cadastrado — ${rotuloArquivo} baixado, envie manualmente.`, 'info'); return; }
            window.open(`https://wa.me/${numero}?text=${texto}`, '_blank');
        } else {
            const email = contadorInfo?.email || '';
            if (!email) { if (typeof mostrarToast === 'function') mostrarToast(`Contador sem e-mail cadastrado — ${rotuloArquivo} baixado, envie manualmente.`, 'info'); return; }
            window.open(`mailto:${email}?subject=${encodeURIComponent('Pacote do fechamento')}&body=${texto}`, '_blank');
        }
    }
    await fechamentoMarcarRascunhosEnviados(pacotes);
    if (typeof mostrarToast === 'function') mostrarToast('Pacote pronto.', 'success');
}

// v1.10.0 — ZIP sem compressão (método STORE) com os arquivos do pacote.
// Sem biblioteca: cabeçalho local + diretório central + CRC-32 (tabela).
// Nomes em UTF-8 (bit 11). Suficiente para PDF/CSV/XML de poucos MB.
let FECH_CRC_TAB = null;
function fechamentoCrc32(bytes) {
    if (!FECH_CRC_TAB) {
        FECH_CRC_TAB = new Uint32Array(256);
        for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1); FECH_CRC_TAB[n] = c >>> 0; }
    }
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < bytes.length; i++) crc = FECH_CRC_TAB[(crc ^ bytes[i]) & 0xFF] ^ (crc >>> 8);
    return (crc ^ 0xFFFFFFFF) >>> 0;
}
async function fechamentoMontarZip(arquivos, nomeZip) {
    const enc = new TextEncoder();
    const agora = new Date();
    const dosHora = (agora.getHours() << 11) | (agora.getMinutes() << 5) | (agora.getSeconds() >> 1);
    const dosData = ((agora.getFullYear() - 1980) << 9) | ((agora.getMonth() + 1) << 5) | agora.getDate();
    const partes = []; const central = []; let offset = 0; const usados = new Set();
    for (const a of arquivos) {
        let nome = a.nome; let i = 2;
        while (usados.has(nome)) nome = a.nome.replace(/(\.[^.]*)?$/, `-${i++}$1`);
        usados.add(nome);
        const nomeB = enc.encode(nome);
        const dados = new Uint8Array(await a.blob.arrayBuffer());
        const crc = fechamentoCrc32(dados);
        const loc = new DataView(new ArrayBuffer(30));
        loc.setUint32(0, 0x04034b50, true); loc.setUint16(4, 20, true); loc.setUint16(6, 0x0800, true); loc.setUint16(8, 0, true);
        loc.setUint16(10, dosHora, true); loc.setUint16(12, dosData, true); loc.setUint32(14, crc, true);
        loc.setUint32(18, dados.length, true); loc.setUint32(22, dados.length, true); loc.setUint16(26, nomeB.length, true); loc.setUint16(28, 0, true);
        partes.push(new Uint8Array(loc.buffer), nomeB, dados);
        const cen = new DataView(new ArrayBuffer(46));
        cen.setUint32(0, 0x02014b50, true); cen.setUint16(4, 20, true); cen.setUint16(6, 20, true); cen.setUint16(8, 0x0800, true); cen.setUint16(10, 0, true);
        cen.setUint16(12, dosHora, true); cen.setUint16(14, dosData, true); cen.setUint32(16, crc, true);
        cen.setUint32(20, dados.length, true); cen.setUint32(24, dados.length, true); cen.setUint16(28, nomeB.length, true);
        cen.setUint32(42, offset, true);
        central.push(new Uint8Array(cen.buffer), nomeB);
        offset += 30 + nomeB.length + dados.length;
    }
    const tamCentral = central.reduce((s, b) => s + b.length, 0);
    const fim = new DataView(new ArrayBuffer(22));
    fim.setUint32(0, 0x06054b50, true); fim.setUint16(8, arquivos.length, true); fim.setUint16(10, arquivos.length, true);
    fim.setUint32(12, tamCentral, true); fim.setUint32(16, offset, true);
    return { blob: new Blob([...partes, ...central, new Uint8Array(fim.buffer)], { type: 'application/zip' }), nome: nomeZip, tipo: 'application/zip' };
}

// v1.8.0 — baixa 1 arquivo do pacote (PDF, CSV ou XML) sem depender do jsPDF.
function fechamentoBaixarArquivo(a) {
    const url = URL.createObjectURL(a.blob);
    const link = document.createElement('a');
    link.href = url; link.download = a.nome; link.className = 'hidden';
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
}

// v1.8.0 — XML das notas emitidas do pacote, direto do Cofre (download com a
// sessão do usuário: a regra do Storage vale). Nota sem XML fica de fora.
async function fechamentoBaixarXmlsNotas(pacotes) {
    const saida = [];
    for (const p of pacotes) {
        for (const d of (p.dados?.fiscal?.documentos || [])) {
            if (d.status !== 'emitida' || !d.xml?.path) continue;
            try {
                const { data: blob, error } = await dbAuth.storage.from(d.xml.bucket || 'cofre-documentos').download(d.xml.path);
                if (error || !blob) throw error || new Error('vazio');
                saida.push({ blob, nome: `nfse-${p.competencia.slice(0, 7)}-${d.numero || String(d.documento_id).slice(0, 8)}.xml`, tipo: 'application/xml' });
            } catch (e) { console.warn('[fechamento] XML da nota', d.numero || d.documento_id, e?.message || ''); }
        }
    }
    return saida;
}

// v1.8.0 — rascunhos que foram no pacote: marca a data de envio ao contador.
async function fechamentoMarcarRascunhosEnviados(pacotes) {
    const ids = [];
    pacotes.forEach(p => (p.dados?.fiscal?.documentos || []).forEach(d => {
        if (d.status === 'preparada' && (d.status_atual || 'preparada') === 'preparada') ids.push(d.documento_id);
    }));
    if (!ids.length) return;
    try {
        const { error } = await dbAuth.rpc('fn_fiscal_documento_enviar_contador', { p_documento_ids: ids, p_canal: 'app' });
        if (error) throw error;
    } catch (e) { console.warn('[fechamento] marcar rascunhos enviados', e?.code || ''); }
}

// v1.8.0 — planilha do pacote: UTF-8 com BOM, separador ";" e decimal com
// vírgula (Excel em português abre com acento e número certos).
function fechamentoMontarCsvPacote(linha) {
    const dados = linha.dados || {};
    const fis = dados.fiscal || null;
    const num = (v) => (v === null || v === undefined || v === '') ? '' : Number(v).toFixed(2).replace('.', ',');
    const data = (v) => v ? new Date(String(v).length === 10 ? v + 'T00:00:00' : v).toLocaleDateString('pt-BR') : '';
    const cel = (v) => { const t = String(v ?? ''); return /[;"\n\r]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t; };
    const linhas = [['Seção', 'Data', 'Valor', 'Descrição', 'Detalhe', 'Origem/Status']];
    (dados.recebimentos || []).forEach(i => linhas.push(['Recebimento', data(i.data_pgto), num(i.valor), '', '', fechamentoOrigemRotulo(i.origem)]));
    (dados.outras_receitas || []).forEach(i => linhas.push(['Outra receita', data(i.data_pagamento), num(i.valor), i.descricao || '', '', i.origem === 'licenca' ? 'Licença' : fechamentoOrigemRotulo(i.origem)])); // v1.12.0
    (dados.saidas || []).forEach(i => linhas.push(['Saída', data(i.data_pagamento), num(i.valor), i.categoria || '', '', fechamentoOrigemRotulo(i.origem)]));
    (dados.repasses || []).forEach(i => linhas.push(['Repasse', data(i.data), num(i.valor), i.razao_social || '', '', 'Extrato']));
    if (fis) {
        (fis.documentos || []).forEach(d => linhas.push([
            d.status === 'preparada' ? 'Rascunho de nota' : 'Nota fiscal', data(d.emitida_em), num(d.valor),
            [d.numero ? 'Nº ' + d.numero : '', d.tomador_nome || ''].filter(Boolean).join(' · '),
            [(d.imoveis || []).join(', '), d.chave ? 'Chave ' + d.chave : ''].filter(Boolean).join(' · '),
            FECHAMENTO_ROTULO_DOC[d.status] || d.status]));
        (fis.pendencias || []).forEach(pd => linhas.push([
            'Pendência fiscal', '', num(pd.valor), pd.tomador_nome || '', pd.imovel || '',
            (FECHAMENTO_ROTULO_PEND[pd.status_fiscal] || pd.status_fiscal) + (pd.motivo_sem_nota ? ' — ' + pd.motivo_sem_nota : '')]));
    }
    const texto = '﻿' + linhas.map(l => l.map(cel).join(';')).join('\r\n');
    return { blob: new Blob([texto], { type: 'text/csv;charset=utf-8' }), nome: `pacote-contador-${linha.competencia}.csv`, tipo: 'text/csv' };
}

const FECHAMENTO_ROTULO_DOC = { emitida: 'Emitida', preparada: 'Rascunho (emitir)', cancelada: 'Cancelada', substituida: 'Substituída' };
const FECHAMENTO_ROTULO_PEND = { a_preparar: 'A preparar', falta_dado: 'Falta dado para a nota', sem_nota: 'Não gera nota' };

function fechamentoOrigemRotulo(o) {
    if (!o || o === 'manual') return 'Manual';
    if (o === 'extrato') return 'Extrato bancário';
    if (String(o).startsWith('automatico:')) return 'Automático · ' + String(o).split(':')[1];
    return String(o);
}

/** Constrói o PDF do pacote a partir do bloco 'contabil' do snapshot
 * (linha.dados.recebimentos/saidas/repasses) — mesmo padrão de
 * baixarRelatorioPdfLocal() no index.html (jsPDF puro, sem
 * html2canvas). */
function fechamentoMontarPdfPacote(linha) {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const margin = 12;
    let y = 15;
    const mesRotulo = new Date(linha.competencia + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    const nomeEmpresa = (typeof CONFIG_CLIENTE !== 'undefined' && CONFIG_CLIENTE && CONFIG_CLIENTE.nomeEmpresa) ? CONFIG_CLIENTE.nomeEmpresa : 'RAIZ PATRIMÔNIO';

    pdf.setFont('Helvetica', 'bold'); pdf.setFontSize(14); pdf.setTextColor(26, 54, 93);
    pdf.text(`${nomeEmpresa.toUpperCase()} — PACOTE DO CONTADOR`, margin, y);
    pdf.setFont('Helvetica', 'normal'); pdf.setFontSize(10); pdf.setTextColor(113, 128, 150);
    y += 7; pdf.text(`Competência: ${mesRotulo}`, margin, y);
    y += 5; pdf.text(`Fechado em: ${new Date(linha.fechado_em).toLocaleString('pt-BR')}`, margin, y);
    y += 3; pdf.line(margin, y + 2, pdf.internal.pageSize.getWidth() - margin, y + 2);
    y += 10;

    const dados = linha.dados || {};
    const recebimentos = dados.recebimentos || [];
    const saidas = dados.saidas || [];
    const repasses = dados.repasses || [];
    const outrasRec = dados.outras_receitas || []; // v1.12.0

    const totalRec = recebimentos.reduce((s, i) => s + Number(i.valor || 0), 0);
    const totalOut = outrasRec.reduce((s, i) => s + Number(i.valor || 0), 0);
    const totalSai = saidas.reduce((s, i) => s + Number(i.valor || 0), 0);
    const totalRep = repasses.reduce((s, i) => s + Number(i.valor || 0), 0);
    pdf.setFont('Helvetica', 'bold'); pdf.setFontSize(10); pdf.setTextColor(26, 54, 93);
    pdf.text(`Recebido: ${fechamentoMoeda(totalRec)}${outrasRec.length ? `   ·   Outras receitas: ${fechamentoMoeda(totalOut)}` : ''}   ·   Pago: ${fechamentoMoeda(totalSai)}   ·   Repasses: ${fechamentoMoeda(totalRep)}`, margin, y);
    y += 10;

    const secao = (titulo, itens, colunas) => {
        if (y > 265) { pdf.addPage(); y = 15; }
        pdf.setFont('Helvetica', 'bold'); pdf.setFontSize(11); pdf.setTextColor(26, 54, 93);
        pdf.text(`${titulo} (${itens.length})`, margin, y); y += 6;
        pdf.setFont('Helvetica', 'normal'); pdf.setFontSize(9); pdf.setTextColor(45, 55, 72);
        if (!itens.length) { pdf.text('Nenhum lançamento.', margin, y); y += 8; return; }
        itens.forEach(it => {
            if (y > 275) { pdf.addPage(); y = 15; }
            pdf.text(colunas(it), margin, y);
            y += 5.5;
        });
        y += 5;
    };

    secao('Recebimentos', recebimentos, (i) =>
        `${i.data_pgto ? new Date(i.data_pgto).toLocaleDateString('pt-BR') : '—'}  ·  ${fechamentoMoeda(i.valor)}  ·  ${fechamentoOrigemRotulo(i.origem)}`);
    if (outrasRec.length) secao('Outras receitas', outrasRec, (i) =>
        `${i.data_pagamento ? new Date(i.data_pagamento).toLocaleDateString('pt-BR') : '—'}  ·  ${fechamentoMoeda(i.valor)}  ·  ${i.descricao || ''}  ·  ${i.origem === 'licenca' ? 'Licença' : fechamentoOrigemRotulo(i.origem)}`);
    secao('Saídas', saidas, (i) =>
        `${i.data_pagamento ? new Date(i.data_pagamento).toLocaleDateString('pt-BR') : '—'}  ·  ${fechamentoMoeda(i.valor)}  ·  ${i.categoria || ''}  ·  ${fechamentoOrigemRotulo(i.origem)}`);
    secao('Repasses', repasses, (i) =>
        `${i.data ? new Date(i.data).toLocaleDateString('pt-BR') : '—'}  ·  ${fechamentoMoeda(i.valor)}  ·  ${i.razao_social || ''}`);

    // v1.8.0 (Fase 7 fiscal) — seção Fiscal, só quando o fechamento tem o retrato fiscal
    const fis = dados.fiscal;
    if (fis) {
        const r = fis.resumo || {};
        const docs = fis.documentos || [];
        const emitidas = docs.filter(d => d.status === 'emitida');
        const rascunhos = docs.filter(d => d.status === 'preparada');
        const outras = docs.filter(d => d.status !== 'emitida' && d.status !== 'preparada');
        const pend = fis.pendencias || [];
        const larg = pdf.internal.pageSize.getWidth() - margin * 2;
        const escrever = (txt, recuo = 0) => {
            pdf.splitTextToSize(String(txt), larg - recuo).forEach(l => { if (y > 280) { pdf.addPage(); y = 15; } pdf.text(l, margin + recuo, y); y += 5; });
        };
        if (y > 250) { pdf.addPage(); y = 15; }
        pdf.setFont('Helvetica', 'bold'); pdf.setFontSize(12); pdf.setTextColor(26, 54, 93);
        pdf.text('Fiscal (NFS-e)', margin, y); y += 6;
        pdf.setFont('Helvetica', 'normal'); pdf.setFontSize(9); pdf.setTextColor(45, 55, 72);
        const desde = fis.obrigatoria_desde ? new Date(fis.obrigatoria_desde + 'T00:00:00').toLocaleDateString('pt-BR') : null;
        escrever(fis.obrigatoria ? `Nota obrigatória nesta competência (desde ${desde}).`
            : (desde ? `Nota obrigatória a partir de ${desde}; antes disso, registro de teste.` : 'Sem data de obrigatoriedade para o regime.'));
        escrever(`${r.imoveis_locados ?? 0} imóvel(is) locado(s) · ${r.recebimentos ?? 0} recebimento(s), ${r.recebimentos_pagos ?? 0} pago(s) · `
            + `${fechamentoMoeda(r.valor_bruto_pago)} recebido (bruto${r.valor_estimado ? ', parte estimada' : ''}) · `
            + `${r.notas_emitidas ?? 0} nota(s) emitida(s) (${fechamentoMoeda(r.valor_notas)}) · ${r.rascunhos ?? 0} rascunho(s) · ${r.pendentes ?? 0} pendente(s)`);
        if (fis.responsavel_emissao) escrever(`Quem emite: ${fis.responsavel_emissao === 'contador' ? 'o contador' : 'a própria empresa'}.`);
        y += 3;
        secao('Notas emitidas', emitidas, (d) =>
            `Nº ${d.numero || '—'}  ·  ${d.emitida_em ? new Date(d.emitida_em + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}  ·  ${fechamentoMoeda(d.valor)}  ·  ${d.tomador_nome || ''}  ·  ${(d.imoveis || []).join(', ')}`);
        if (rascunhos.length) {
            if (y > 260) { pdf.addPage(); y = 15; }
            pdf.setFont('Helvetica', 'bold'); pdf.setFontSize(11); pdf.setTextColor(26, 54, 93);
            pdf.text(`Rascunhos para emitir (${rascunhos.length}) — campos na ordem do Emissor Nacional`, margin, y); y += 6;
            pdf.setFontSize(9); pdf.setTextColor(45, 55, 72);
            rascunhos.forEach((d, n) => {
                pdf.setFont('Helvetica', 'bold'); escrever(`${n + 1}. ${d.tomador_nome || 'Locatário'} · ${fechamentoMoeda(d.valor)}`);
                pdf.setFont('Helvetica', 'normal');
                (d.dps || []).forEach(c => escrever(`${c.rotulo}: ${c.valor ?? '— (falta)'}`, 4));
                y += 2;
            });
            y += 3;
        }
        if (outras.length) secao('Canceladas ou substituídas', outras, (d) => `Nº ${d.numero || '—'}  ·  ${fechamentoMoeda(d.valor)}  ·  ${FECHAMENTO_ROTULO_DOC[d.status] || d.status}`);
        secao('Pendências fiscais', pend, (p) =>
            `${FECHAMENTO_ROTULO_PEND[p.status_fiscal] || p.status_fiscal}  ·  ${p.imovel || ''}  ·  ${p.tomador_nome || ''}  ·  ${fechamentoMoeda(p.valor)}${p.motivo_sem_nota ? '  ·  ' + p.motivo_sem_nota : ''}`);
        const ck = fis.checkup || {};
        if (!ck.erro && ck.natureza) {
            pdf.setFont('Helvetica', 'normal'); pdf.setFontSize(9); pdf.setTextColor(45, 55, 72);
            escrever(ck.natureza === 'pj'
                ? `Check-up ${ck.ano}: ${ck.prontidao === 'pronto' ? 'pronto para a nota' : 'faltam dados'} (${ck.pendencias_bloqueiam ?? 0} pendência(s) que impedem a nota).`
                : `Check-up ${ck.ano} (pessoa física): ${ck.titulares?.vermelho ?? 0} possível(is) enquadramento(s), ${ck.titulares?.amarelo ?? 0} em atenção, ${ck.titulares?.verde ?? 0} abaixo do limite.`);
            escrever('Estimativa com os dados do Raiz; a decisão tributária é do contador.');
        }
    }

    const nomeArquivo = `pacote-contador-${linha.competencia}.pdf`;
    return { pdf, blob: pdf.output('blob'), nome: nomeArquivo, tipo: 'application/pdf' };
}

function fechamentoTextoResumo(pacotes) {
    const linhas = pacotes.map(p => {
        const mes = new Date(p.competencia + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        const dados = p.dados || {};
        const totalRec = (dados.recebimentos || []).reduce((s, i) => s + Number(i.valor || 0), 0);
        const totalSai = (dados.saidas || []).reduce((s, i) => s + Number(i.valor || 0), 0);
        const totalOut = (dados.outras_receitas || []).reduce((s, i) => s + Number(i.valor || 0), 0); // v1.12.0
        const f = dados.fiscal?.resumo; // v1.8.0
        return `${mes}: recebido ${fechamentoMoeda(totalRec)}${totalOut ? `, outras receitas ${fechamentoMoeda(totalOut)}` : ''}, pago ${fechamentoMoeda(totalSai)}`
            + (f ? `; ${f.notas_emitidas ?? 0} nota(s) emitida(s), ${f.rascunhos ?? 0} rascunho(s) para emitir` : '');
    });
    return `Pacote do fechamento:\n${linhas.join('\n')}`;
}
