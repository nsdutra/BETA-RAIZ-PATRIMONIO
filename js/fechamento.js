// ============================================================================
// js/fechamento.js — Raiz Patrimônio · Fechamento da competência
// Versão: 1.0.0 · 21/09/2026
//
// Entrega F.2 (PLANO_IMPLEMENTACAO_RESULTADOS_MERCADO_FISCAL v2.0.0,
// REGRAS_EXPERIENCIA_RAIZ v3.19.0 §11.1) — módulo novo: fechar/reabrir a
// competência + retrato financeiro.
//
// ESCOPO DESTA ENTREGA (decisão explícita do Nicola, 21/09/2026,
// AskUserQuestion): só fechar/reabrir + o retrato "financeiro" (Previsto/
// Recebido/Pago, mesma regra de fn_financeiro_totalizadores). O retrato de
// Distribuição (extrato de sócio, calcularExtratoSocio() em index.html)
// fica pra uma entrega seguinte, com mais tempo pra validar o rateio
// contra dado real antes de congelar num snapshot imutável — este módulo
// NÃO toca em calcularExtratoSocio().
//
// Migration: fechamento_estrutura_v1 — fn_fechamento_verificar/fechar/
// reabrir + tabela fechamento_snapshot (imutável, RLS leitura-tenant/
// escrita-só-RPC).
//
// COMO É CHAMADO:
//   · financeiro.js chama a ponte global fechamentoAtualizarCard() de
//     dentro de financeiroRenderCabecalho('conciliacao') — módulos
//     isolados, sem import direto entre os dois (mesmo padrão de
//     isolamento dos demais módulos do app).
//   · A competência mostrada aqui é a MESMA da Recebimentos/Saídas — como
//     os dois módulos não se importam, financeiro.js espelha
//     financeiroCompetenciaAtual em window.RZ_FIN_COMPETENCIA (ISO
//     'YYYY-MM-01') toda vez que muda; este módulo só lê essa variável.
//   · onclick do HTML estático (#fin-fechamento-card) chama
//     fechamentoAbrirAcoes() via ponte global instalada no index.html
//     (mesmo padrão de carregarFinanceiro/carregarResultados).
//
// ESTADO GLOBAL LIDO/ESCRITO DAQUI: dbAuth, CLIENTE_ID_SUPABASE,
// pessoaIdLogada, mostrarToast, abrirSheetAcoes, abrirSheetForm,
// renderStatus, formatarMoedaBR, switchTab (todos já globais no
// index.html clássico — mesmo acesso que financeiro.js já faz).
// ============================================================================

export const VERSAO = '1.0.0'; // v-check: lido por ⚙️ › Conta › Versões — manter igual ao header

let fechamentoUltimoEstado = null; // último resultado de fn_fechamento_verificar (cache pro Sheet de ações)
let fechamentoCarregando = false;

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

/** Desenha o card de competência do Fechamento (status + corpo). Chamado
 * 1x por abertura da aba Fechamento e por flip de competência
 * (financeiroRenderCabecalho('conciliacao'), ver financeiro.js). */
export async function fechamentoAtualizarCard() {
    const elStatus = document.getElementById('fin-fechamento-status');
    const elCorpo = document.getElementById('fin-fechamento-corpo');
    if (!elStatus && !elCorpo) return; // aba ainda não montada
    if (elCorpo) elCorpo.textContent = 'Verificando…';
    if (elStatus) elStatus.innerHTML = '';
    fechamentoCarregando = true;
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
}

function fechamentoRenderCorpo(linha) {
    const elStatus = document.getElementById('fin-fechamento-status');
    const elCorpo = document.getElementById('fin-fechamento-corpo');
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

/** ⋮ do card — abre Sheet de ações com Fechar OU Reabrir, conforme o
 * último estado verificado (REGRAS §11.1: nunca os dois juntos). */
export async function fechamentoAbrirAcoes() {
    if (typeof abrirSheetAcoes !== 'function') return;
    if (fechamentoCarregando) return;
    if (!fechamentoUltimoEstado) await fechamentoAtualizarCard();
    const linha = fechamentoUltimoEstado;
    if (!linha || linha.status === 'sem_rotina') {
        if (typeof mostrarToast === 'function') mostrarToast(linha?.motivo_bloqueio || 'Fechamento indisponível para esta empresa.', 'info');
        return;
    }
    if (linha.status === 'concluido') {
        abrirSheetAcoes({
            titulo: 'Fechamento da competência',
            acoes: [
                { icone: 'lock-open', titulo: 'Reabrir a competência', aoTocar: fechamentoAbrirSheetReabrir },
            ],
        });
    } else {
        abrirSheetAcoes({
            titulo: 'Fechamento da competência',
            acoes: [
                { icone: 'lock', titulo: 'Fechar a competência', sub: fechamentoResumoPendencia(linha) || undefined, aoTocar: fechamentoAbrirSheetFechar },
            ],
        });
    }
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
        sub: 'Desfaz o fechamento — o retrato anterior continua registrado, e um novo é gerado no próximo fechamento. Explique o motivo.',
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
            if (typeof mostrarToast === 'function') mostrarToast('Competência reaberta.', 'success');
            fechamentoAtualizarCard();
        },
    });
}
