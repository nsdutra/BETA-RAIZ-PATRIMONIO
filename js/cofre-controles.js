// ============================================================================
// cofre-controles.js — Raiz Patrimônio · Cofre de Documentos
// Versão: 1.0.0 · 24/08/2026
//
// NOVO módulo (Fase 1 do módulo de Alarmes/Controles — núcleo). Aba
// "Controles" dentro da ficha do ativo: criar item de controle (seguro/
// manutenção/tributo) e tratar/reagendar/estornar a ocorrência aberta.
//
// Escopo desta entrega (declarado, não fingido):
//   - 1 ocorrência por item é criada no momento da criação do item
//     (data_prevista_original = data_prevista_atual = data_base). Geração
//     automática recorrente (job/RPC de horizonte de 120 dias) NÃO está
//     implementada nesta rodada — cada nova competência exige repetir o
//     item manualmente por ora, ou aguardar a rodada do job.
//   - Sem Central de Alertas consolidada (cross-ativo) e sem box "Atenção
//     necessária" no Dashboard — ver HANDOFF.
//   - Sem RPC SECURITY DEFINER dedicada; escrita via RLS existente
//     (cofre_itens_controle_write / cofre_ocorrencias_controle_write).
// ============================================================================
import { estado } from './cofre-estado.js';
import * as api from './cofre-api.js';
import { mostrarToast, refrescarIcones } from './cofre-ui.js';
import {
    escapeHtml, formatarDataBR, diasAte, chipVencimento,
    rotuloTipoControle, rotuloStatusOcorrencia, rotuloFrequencia,
} from './cofre-validacoes.js';

let subtiposCache = null; // carregado 1x por sessão de ficha; catálogo muda pouco
let itensDoAtivoAtual = [];
let ocorrenciaEmAcao = null; // { ocorrenciaId, modo: 'tratar'|'reagendar'|'estornar' }

// ============================================================================
// ABA "CONTROLES" — chamada por cofre-ativos.js dentro de abrirFichaAtivo()
// ============================================================================
export async function montarControlesAtivo(a) {
    ocorrenciaEmAcao = null;
    document.getElementById('fa-form-item-controle')?.classList.add('hidden');
    try {
        itensDoAtivoAtual = await api.listarItensControleAtivo(a.id);
    } catch (err) {
        document.getElementById('fa-tab-controles').innerHTML = `<p class="text-xs" style="color:var(--danger)">Erro ao carregar controles: ${escapeHtml(err.message)}</p>`;
        return;
    }
    renderizarListaControles();
}

function renderizarListaControles() {
    const alvo = document.getElementById('fa-tab-controles');
    if (!itensDoAtivoAtual.length) {
        alvo.innerHTML = `<p class="text-xs" style="color:var(--sage)">Nenhum item de controle cadastrado para este ativo ainda.</p>`;
        return;
    }
    alvo.innerHTML = itensDoAtivoAtual.map(itemCardHtml).join('');
    refrescarIcones();
}

function itemCardHtml(item) {
    const ocorrencias = (item.cofre_ocorrencias_controle || []).slice().sort((x, y) => (x.data_prevista_atual < y.data_prevista_atual ? 1 : -1));
    const oc = ocorrencias[0]; // ocorrência mais recente do item (Fase 1: só existe 1)
    const subtituloSubtipo = item.cofre_controle_subtipos?.nome || rotuloTipoControle(item.tipo);

    let blocoOcorrencia = `<p class="text-xs" style="color:var(--sage)">Nenhuma ocorrência gerada.</p>`;
    if (oc) {
        const chip = oc.status_execucao === 'aberto' ? chipVencimento(diasAte(oc.data_prevista_atual)) : null;
        blocoOcorrencia = `
            <div class="flex items-center justify-between text-xs mb-2">
                <span>${rotuloStatusOcorrencia(oc.status_execucao)} · vence ${formatarDataBR(oc.data_prevista_atual)}</span>
                ${chip ? `<span class="chip ${chip.classe}">${escapeHtml(chip.texto)}</span>` : ''}
            </div>
            ${oc.tratamento_descricao ? `<p class="text-xs mb-2" style="color:var(--sage)">Tratamento: ${escapeHtml(oc.tratamento_descricao)}</p>` : ''}
            ${renderizarAcoesOcorrencia(oc)}
            ${renderizarFormAcaoOcorrencia(oc)}
        `;
    }

    return `<div class="raiz-bloco-interno mb-2">
        <div class="flex items-start justify-between mb-1">
            <div>
                <p class="text-sm font-semibold">${escapeHtml(item.titulo)}</p>
                <p class="text-xs" style="color:var(--sage)">${escapeHtml(rotuloTipoControle(item.tipo))} · ${escapeHtml(subtituloSubtipo)} · ${escapeHtml(rotuloFrequencia(item.frequencia_intervalo, item.frequencia_unidade))}</p>
            </div>
        </div>
        ${blocoOcorrencia}
    </div>`;
}

function renderizarAcoesOcorrencia(oc) {
    if (oc.status_execucao === 'aberto') {
        return `<div class="flex gap-2">
            <button data-action="alternar-acao-ocorrencia" data-id="${oc.id}" data-modo="tratar" class="flex-1 py-1.5 rounded-lg text-xs font-bold text-white" style="background:var(--pine)">Tratar</button>
            <button data-action="alternar-acao-ocorrencia" data-id="${oc.id}" data-modo="reagendar" class="flex-1 py-1.5 rounded-lg text-xs font-bold border-2 border-slate-300">Reagendar</button>
        </div>`;
    }
    if (oc.status_execucao === 'concluido') {
        return `<button data-action="alternar-acao-ocorrencia" data-id="${oc.id}" data-modo="estornar" class="w-full py-1.5 rounded-lg text-xs font-bold border-2 border-slate-300">Estornar</button>`;
    }
    return '';
}

function renderizarFormAcaoOcorrencia(oc) {
    if (!ocorrenciaEmAcao || ocorrenciaEmAcao.ocorrenciaId !== oc.id) return '';
    const { modo } = ocorrenciaEmAcao;
    if (modo === 'tratar') {
        return `<div class="raiz-form-borda p-2 mt-2">
            <textarea id="oc-tratar-descricao" rows="2" placeholder="Descrição da baixa (opcional)" class="w-full border-2 border-slate-300 rounded-lg p-2 text-xs mb-2"></textarea>
            <div class="flex justify-end gap-2">
                <button data-action="fechar-acao-ocorrencia" class="px-3 py-1.5 rounded-lg text-xs border-2 border-slate-300">Cancelar</button>
                <button data-action="confirmar-tratar-ocorrencia" data-id="${oc.id}" class="px-3 py-1.5 rounded-lg text-xs font-bold text-white" style="background:var(--pine)">Confirmar baixa</button>
            </div>
        </div>`;
    }
    if (modo === 'reagendar') {
        return `<div class="raiz-form-borda p-2 mt-2">
            <input type="date" id="oc-reagendar-data" value="${oc.data_prevista_atual}" class="w-full border-2 border-slate-300 rounded-lg p-2 text-xs mb-2">
            <div class="flex justify-end gap-2">
                <button data-action="fechar-acao-ocorrencia" class="px-3 py-1.5 rounded-lg text-xs border-2 border-slate-300">Cancelar</button>
                <button data-action="confirmar-reagendar-ocorrencia" data-id="${oc.id}" class="px-3 py-1.5 rounded-lg text-xs font-bold text-white" style="background:var(--pine)">Confirmar novo prazo</button>
            </div>
        </div>`;
    }
    if (modo === 'estornar') {
        return `<div class="raiz-form-borda p-2 mt-2">
            <p class="text-xs mb-2" style="color:var(--sage)">A ocorrência volta para "Em aberto". Isso fica registrado no histórico.</p>
            <div class="flex justify-end gap-2">
                <button data-action="fechar-acao-ocorrencia" class="px-3 py-1.5 rounded-lg text-xs border-2 border-slate-300">Cancelar</button>
                <button data-action="confirmar-estornar-ocorrencia" data-id="${oc.id}" class="px-3 py-1.5 rounded-lg text-xs font-bold text-white" style="background:var(--danger)">Confirmar estorno</button>
            </div>
        </div>`;
    }
    return '';
}

export function alternarAcaoOcorrencia(ocorrenciaId, modo) {
    ocorrenciaEmAcao = (ocorrenciaEmAcao && ocorrenciaEmAcao.ocorrenciaId === ocorrenciaId && ocorrenciaEmAcao.modo === modo)
        ? null : { ocorrenciaId, modo };
    renderizarListaControles();
}

export function fecharAcaoOcorrencia() {
    ocorrenciaEmAcao = null;
    renderizarListaControles();
}

async function registrarHistoricoOcorrenciaLocal(ocorrenciaId, acao, antes, depois, motivo) {
    await api.registrarHistoricoOcorrencia({
        ocorrencia_id: ocorrenciaId, acao, antes, depois, motivo: motivo || null,
        pessoa_id: estado.pessoa.id, origem: 'app',
    });
}

export async function confirmarTratarOcorrencia(ocorrenciaId) {
    const descricao = document.getElementById('oc-tratar-descricao')?.value.trim() || null;
    try {
        await api.tratarOcorrencia(ocorrenciaId, estado.pessoa.id, descricao);
        await registrarHistoricoOcorrenciaLocal(ocorrenciaId, 'tratar', { status_execucao: 'aberto' }, { status_execucao: 'concluido', tratamento_descricao: descricao });
        await api.registrarLogAcessos(estado.clienteId, estado.pessoa.id, 'cofre.ocorrencias.tratar', { ativoId: estado.ativoEmFoco?.id, ocorrenciaId });
        mostrarToast('Ocorrência tratada ✅');
        ocorrenciaEmAcao = null;
        itensDoAtivoAtual = await api.listarItensControleAtivo(estado.ativoEmFoco.id);
        renderizarListaControles();
    } catch (err) { mostrarToast('Erro: ' + err.message, 'erro'); }
}

export async function confirmarReagendarOcorrencia(ocorrenciaId) {
    const novaData = document.getElementById('oc-reagendar-data')?.value;
    if (!novaData) { mostrarToast('Informe a nova data.', 'erro'); return; }
    try {
        await api.reagendarOcorrencia(ocorrenciaId, novaData);
        await registrarHistoricoOcorrenciaLocal(ocorrenciaId, 'reagendar', null, { data_prevista_atual: novaData });
        await api.registrarLogAcessos(estado.clienteId, estado.pessoa.id, 'cofre.ocorrencias.reagendar', { ativoId: estado.ativoEmFoco?.id, ocorrenciaId, novaData });
        mostrarToast('Ocorrência reagendada ✅');
        ocorrenciaEmAcao = null;
        itensDoAtivoAtual = await api.listarItensControleAtivo(estado.ativoEmFoco.id);
        renderizarListaControles();
    } catch (err) { mostrarToast('Erro: ' + err.message, 'erro'); }
}

export async function confirmarEstornarOcorrencia(ocorrenciaId) {
    try {
        await api.estornarOcorrencia(ocorrenciaId);
        await registrarHistoricoOcorrenciaLocal(ocorrenciaId, 'estornar', { status_execucao: 'concluido' }, { status_execucao: 'aberto' }, 'Estorno solicitado pelo usuário');
        await api.registrarLogAcessos(estado.clienteId, estado.pessoa.id, 'cofre.ocorrencias.estornar', { ativoId: estado.ativoEmFoco?.id, ocorrenciaId });
        mostrarToast('Ocorrência estornada ✅');
        ocorrenciaEmAcao = null;
        itensDoAtivoAtual = await api.listarItensControleAtivo(estado.ativoEmFoco.id);
        renderizarListaControles();
    } catch (err) { mostrarToast('Erro: ' + err.message, 'erro'); }
}

// ============================================================================
// CRIAR ITEM DE CONTROLE
// ============================================================================
export async function abrirFormControle() {
    if (!subtiposCache) {
        try { subtiposCache = await api.listarSubtiposControle(estado.clienteId); }
        catch (err) { mostrarToast('Erro ao carregar catálogo: ' + err.message, 'erro'); return; }
    }
    document.getElementById('ic-tipo').value = 'seguro';
    popularSelectSubtipo('seguro');
    document.getElementById('ic-titulo').value = '';
    document.getElementById('ic-data-base').value = '';
    document.getElementById('ic-freq-intervalo').value = '';
    document.getElementById('ic-freq-unidade').value = 'mes';
    document.getElementById('ic-antecedencia').value = '7';
    document.getElementById('fa-form-item-controle').classList.remove('hidden');
}

export function fecharFormControle() {
    document.getElementById('fa-form-item-controle')?.classList.add('hidden');
}

function popularSelectSubtipo(tipo) {
    const sel = document.getElementById('ic-subtipo');
    const opcoes = (subtiposCache || []).filter(s => s.tipo === tipo);
    sel.innerHTML = `<option value="">— sem subtipo específico —</option>` +
        opcoes.map(s => `<option value="${s.id}">${escapeHtml(s.nome)}</option>`).join('');
}

export function aoMudarTipoControleForm() {
    popularSelectSubtipo(document.getElementById('ic-tipo').value);
}

export async function salvarItemControle() {
    const a = estado.ativoEmFoco;
    const tipo = document.getElementById('ic-tipo').value;
    const subtipoId = document.getElementById('ic-subtipo').value || null;
    const titulo = document.getElementById('ic-titulo').value.trim();
    const dataBase = document.getElementById('ic-data-base').value;
    const freqIntervalo = parseInt(document.getElementById('ic-freq-intervalo').value, 10) || null;
    const freqUnidade = freqIntervalo ? document.getElementById('ic-freq-unidade').value : null;
    const antecedencia = parseInt(document.getElementById('ic-antecedencia').value, 10) || 0;

    if (!titulo) { mostrarToast('Informe um título para o item de controle.', 'erro'); return; }
    if (!dataBase) { mostrarToast('Informe a data base (próximo vencimento).', 'erro'); return; }

    try {
        const item = await api.criarItemControle({
            cliente_id: estado.clienteId, ativo_id: a.id, tipo, subtipo_id: subtipoId, titulo,
            recorrente: !!freqIntervalo, frequencia_intervalo: freqIntervalo, frequencia_unidade: freqUnidade,
            data_base: dataBase, alerta_ativo: true, antecedencia_alerta_dias: antecedencia,
            origem: 'manual', criado_por: estado.pessoa.id,
        });
        await api.registrarHistoricoItemControle({ item_id: item.id, acao: 'criar', antes: null, depois: item, pessoa_id: estado.pessoa.id, origem: 'app' });

        // Fase 1 núcleo: a 1ª ocorrência é criada junto (sem job de horizonte ainda — ver HANDOFF)
        const competencia = primeiroDiaDoMes(dataBase);
        await api.criarOcorrenciaControle({
            cliente_id: estado.clienteId, item_controle_id: item.id, competencia,
            data_prevista_original: dataBase, data_prevista_atual: dataBase, alerta_habilitado: true, status_execucao: 'aberto',
        });

        await api.registrarLogAcessos(estado.clienteId, estado.pessoa.id, 'cofre.controle.criar', { ativoId: a.id, itemId: item.id });
        mostrarToast('Item de controle criado ✅');
        fecharFormControle();
        itensDoAtivoAtual = await api.listarItensControleAtivo(a.id);
        renderizarListaControles();
    } catch (err) { mostrarToast('Erro: ' + err.message, 'erro'); }
}

function primeiroDiaDoMes(dataISO) {
    const [ano, mes] = dataISO.split('-');
    return `${ano}-${mes}-01`;
}
