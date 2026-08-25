// ============================================================================
// cofre-controles.js — Raiz Patrimônio · Cofre de Documentos
// Versão: 1.2.2 · 25/08/2026
//
// v1.2.2 — D-2 (revisão DS): badge de vencimento migrado pro formato
// oficial §14 — "chip ${chip.classe}" (2 ocorrências) virou
// "${chip.classe}" (classe já vem completa de chipVencimento(), sem
// prefixo). Sem mudança de comportamento.
//
// v1.2.1 — DS C-8: alternarMaisAcoesControles() só fazia
// classList.toggle, sem girar a seta (DS §8.2 exige rotação 180°/0° +
// refrescarIcones()). Corpo canônico aplicado; depende do novo id
// fa-mais-acoes-controles-seta no HTML (cofre.html v1.7.0).
//
// v1.2.0 — GERAÇÃO AUTOMÁTICA DE 120 DIAS (pedido explícito, previsto
// desde a arquitetura original mas não implementado até agora): ao criar
// um item de controle, gerarOcorrenciasHorizonte() cria TODAS as
// ocorrências dentro dos próximos 120 dias (não só a 1ª), respeitando a
// frequência (dia/semana/mes/ano). Box de Ocorrências na ficha do item
// agora lista todas (antes só a mais recente). CONCLUSÃO DA MIGRAÇÃO v6:
// removida "Alertas vinculados" (formAlertaItemHtml/alternarFormAlertaItem/
// salvarAlertaItem, criarEvento — mortos, cofre_eventos removida; a
// própria ocorrência já é o alerta). Formulário de criar item de controle
// migrou de inline pra modal bottom-sheet (abrirFormControle/
// fecharFormControle agora usam abrirModal/fecharModal), acionado por
// "Mais ações" do box Controles (nova alternarMaisAcoesControles()).
//
// v1.1.0 — MUDANÇA ESTRUTURAL (pedido explícito): clicar num item de
// controle abre uma TELA PRÓPRIA (data-screen="ficha-item-controle"), não
// mais um card expansível dentro da ficha do ativo. Nessa tela dá pra
// ver/editar/excluir o item, tratar/reagendar/estornar a ocorrência, e ver
// Alertas e Contatos vinculados A ESTE ITEM (não mais ao ativo direto —
// ver migration cofre_contatos_e_eventos_vinculo_item_controle_v4). O box
// "Controles" na ficha do ativo virou uma lista-resumo clicável.
//
// v1.0.0 — módulo original (Fase 1 núcleo): aba "Controles" com card
// expansível de tratar/reagendar/estornar. Ver HANDOFF para o que ainda
// não está implementado (geração automática de ocorrências recorrentes,
// Central de Alertas consolidada).
// ============================================================================
import { estado } from './cofre-estado.js';
import * as api from './cofre-api.js';
import { mostrarToast, refrescarIcones, abrirModal, fecharModal } from './cofre-ui.js';
import { mudarTela } from './cofre-navegacao.js';
import {
    escapeHtml, formatarDataBR, diasAte, chipVencimento,
    rotuloTipoControle, rotuloStatusOcorrencia, rotuloFrequencia,
} from './cofre-validacoes.js';

let subtiposCache = null; // carregado 1x por sessão; catálogo muda pouco
let itensDoAtivoAtual = [];
let itemEmFoco = null;
let ocorrenciaEmAcao = null; // { ocorrenciaId, modo: 'tratar'|'reagendar'|'estornar' }
let contatosDoItemAtual = [];
let formContatoItemAberto = false;

// ============================================================================
// BOX "CONTROLES" na ficha do ativo — lista-resumo clicável
// ============================================================================
export async function montarControlesAtivo(a) {
    document.getElementById('fa-mais-acoes-controles')?.classList.add('hidden');
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
    if (!alvo) return;
    if (!itensDoAtivoAtual.length) {
        alvo.innerHTML = `<p class="text-xs" style="color:var(--sage)">Nenhum item de controle cadastrado para este ativo ainda.</p>`;
        return;
    }
    alvo.innerHTML = itensDoAtivoAtual.map(itemResumoHtml).join('');
    refrescarIcones();
}

// Linha de item de controle — DS (revisão 25/08/2026): paralelo direto das
// linhas de "itens a receber" do box Financeiro na Ficha do Imóvel
// (index.html, htmlFinanceiro) — sem raiz-bloco-interno (que tinha borda
// 2px + fundo #f8fafc), divisor fino border-b/last:border-0, texto
// text-xs, ícone à esquerda colorido por urgência em vez de status de
// pagamento (vencido=alerta vermelho, ≤30d=relógio âmbar, em dia/sem
// ocorrência aberta=check verde).
function itemResumoHtml(item) {
    const ocorrencias = (item.cofre_ocorrencias_controle || []).slice().sort((x, y) => (x.data_prevista_atual < y.data_prevista_atual ? 1 : -1));
    const oc = ocorrencias[0];
    const dias = (oc && oc.status_execucao === 'aberto') ? diasAte(oc.data_prevista_atual) : null;
    const chip = dias !== null ? chipVencimento(dias) : null;
    const icone = dias === null ? 'check-circle-2' : (dias < 0 ? 'alert-circle' : (dias <= 30 ? 'clock' : 'check-circle-2'));
    const corIcone = dias === null ? 'var(--success)' : (dias < 0 ? 'var(--danger)' : (dias <= 30 ? 'var(--warning)' : 'var(--success)'));
    const subtituloSubtipo = item.cofre_controle_subtipos?.nome || rotuloTipoControle(item.tipo);
    return `<button data-action="abrir-item-controle" data-id="${item.id}" class="w-full flex items-center gap-2 py-1.5 border-b border-slate-50 last:border-0 text-left">
        <svg data-lucide="${icone}" style="width:14px;height:14px;flex:none;color:${corIcone}"></svg>
        <div class="flex-1 min-w-0 text-xs font-bold truncate">${escapeHtml(item.titulo)} <span class="font-normal text-slate-400">· ${escapeHtml(subtituloSubtipo)}</span></div>
        ${chip ? `<span class="${chip.classe} flex-none">${escapeHtml(chip.texto)}</span>` : ''}
        <i data-lucide="chevron-right" style="width:14px;height:14px;flex:none;color:var(--sage)"></i>
    </button>`;
}

export function alternarMaisAcoesControles() {
    const el = document.getElementById('fa-mais-acoes-controles');
    const seta = document.getElementById('fa-mais-acoes-controles-seta');
    if (!el) return;
    el.classList.toggle('hidden');
    if (seta) seta.style.transform = el.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
    refrescarIcones();
}

// ============================================================================
// TELA — FICHA DO ITEM DE CONTROLE
// ============================================================================
export async function abrirFichaItemControle(itemId) {
    ocorrenciaEmAcao = null;
    formContatoItemAberto = false;
    document.getElementById('fic-contatos-acoes')?.classList.add('hidden');
    try {
        itemEmFoco = await api.buscarItemControlePorId(itemId);
        contatosDoItemAtual = await api.listarContatosPorItemControle(itemId);
    } catch (err) {
        mostrarToast('Erro ao abrir item de controle: ' + err.message, 'erro');
        return;
    }
    mudarTela('ficha-item-controle');
    renderizarFichaItemControle();
}

export async function recarregarFichaItemControle() {
    if (!itemEmFoco) return;
    try {
        itemEmFoco = await api.buscarItemControlePorId(itemEmFoco.id);
        contatosDoItemAtual = await api.listarContatosPorItemControle(itemEmFoco.id);
    } catch (err) { mostrarToast('Erro: ' + err.message, 'erro'); return; }
    renderizarFichaItemControle();
}

export function voltarFichaItemControle() {
    const ativo = estado.ativoEmFoco;
    itemEmFoco = null;
    mudarTela('ficha-ativo');
    if (ativo) montarControlesAtivo(ativo);
}

function renderizarFichaItemControle() {
    const item = itemEmFoco;

    // ---- Box Dados (revisão DS: edição virou bottom-sheet — ver
    // abrirEditarItem()/salvarEdicaoItem() — este box agora é só leitura)
    document.getElementById('fic-dados-leitura').innerHTML = `
        <div class="flex justify-between border-b pb-1"><span style="color:var(--sage)">Título</span><b>${escapeHtml(item.titulo)}</b></div>
        <div class="flex justify-between border-b pb-1"><span style="color:var(--sage)">Tipo</span><b>${escapeHtml(rotuloTipoControle(item.tipo))}</b></div>
        <div class="flex justify-between border-b pb-1"><span style="color:var(--sage)">Subtipo</span><b>${escapeHtml(item.cofre_controle_subtipos?.nome || '—')}</b></div>
        <div class="flex justify-between border-b pb-1"><span style="color:var(--sage)">Frequência</span><b>${escapeHtml(rotuloFrequencia(item.frequencia_intervalo, item.frequencia_unidade))}</b></div>
        <div class="flex justify-between border-b pb-1"><span style="color:var(--sage)">Antecedência do alerta</span><b>${item.antecedencia_alerta_dias} dias</b></div>
    `;

    // ---- Box Ocorrências (TODAS — pode haver várias, geradas para os
    // próximos 120 dias conforme a frequência do item; v6, pedido explícito)
    // Revisão DS (25/08/2026) — linhas no mesmo padrão de "itens a
    // receber" da Ficha do Imóvel (index.html htmlFinanceiro): sem
    // raiz-bloco-interno (borda 2px + fundo #f8fafc), divisor fino
    // border-b/last item sem divisor, ícone de urgência à esquerda.
    const ocorrencias = (item.cofre_ocorrencias_controle || []).slice().sort((x, y) => (x.data_prevista_atual > y.data_prevista_atual ? 1 : -1));
    const elOc = document.getElementById('fic-ocorrencia');
    if (!ocorrencias.length) {
        elOc.innerHTML = `<p class="text-xs" style="color:var(--sage)">Nenhuma ocorrência gerada.</p>`;
    } else {
        elOc.innerHTML = ocorrencias.map((oc, idx) => {
            const dias = oc.status_execucao === 'aberto' ? diasAte(oc.data_prevista_atual) : null;
            const chip = dias !== null ? chipVencimento(dias) : null;
            const icone = dias === null ? 'check-circle-2' : (dias < 0 ? 'alert-circle' : (dias <= 30 ? 'clock' : 'check-circle-2'));
            const corIcone = dias === null ? 'var(--success)' : (dias < 0 ? 'var(--danger)' : (dias <= 30 ? 'var(--warning)' : 'var(--success)'));
            const divisor = idx < ocorrencias.length - 1 ? 'border-b border-slate-50' : '';
            return `<div class="py-2 ${divisor}">
                <div class="flex items-center gap-2 text-xs">
                    <svg data-lucide="${icone}" style="width:14px;height:14px;flex:none;color:${corIcone}"></svg>
                    <span class="flex-1 font-bold">${escapeHtml(rotuloStatusOcorrencia(oc.status_execucao))} <span class="font-normal text-slate-400">· vence ${formatarDataBR(oc.data_prevista_atual)}</span></span>
                    ${chip ? `<span class="${chip.classe} flex-none">${escapeHtml(chip.texto)}</span>` : ''}
                </div>
                ${oc.tratamento_descricao ? `<p class="text-xs mt-1 ml-6" style="color:var(--sage)">Tratamento: ${escapeHtml(oc.tratamento_descricao)}</p>` : ''}
                <div class="mt-2 ml-6">${renderizarAcoesOcorrencia(oc)}</div>
                ${renderizarFormAcaoOcorrencia(oc)}
            </div>`;
        }).join('');
    }

    // ---- Box Alertas vinculados: REMOVIDO (v6) — a própria ocorrência
    // (acima) já É o alerta; não existe mais cadastro de alerta avulso.

    // ---- Box Contatos vinculados — revisão DS: linhas no mesmo padrão
    // sem borda/fundo (era raiz-bloco-interno). O botão "+ Adicionar"
    // agora vive dentro do painel de Mais ações (ver HTML), não mais
    // como CTA tracejado centralizado.
    const elContatos = document.getElementById('fic-contatos');
    const listaContatos = contatosDoItemAtual.length
        ? contatosDoItemAtual.map((c, idx) => `<div class="py-1.5 ${idx < contatosDoItemAtual.length - 1 ? 'border-b border-slate-50' : ''}">
            <p class="text-xs font-bold truncate">${escapeHtml(c.nome)}</p>
            <p class="text-[11px]" style="color:var(--sage)">${escapeHtml(c.papel)}${c.whatsapp ? ' · ' + escapeHtml(c.whatsapp) : ''}</p>
        </div>`).join('')
        : `<p class="text-xs" style="color:var(--sage)">Nenhum contato vinculado a este item.</p>`;
    elContatos.innerHTML = (formContatoItemAberto ? formContatoItemHtml() : '') + listaContatos;

    refrescarIcones();
}

export function alternarMaisAcoesContatosItem() {
    const el = document.getElementById('fic-contatos-acoes');
    const seta = document.getElementById('fic-contatos-seta');
    if (!el) return;
    el.classList.toggle('hidden');
    if (seta) seta.style.transform = el.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
    refrescarIcones();
}

function renderizarAcoesOcorrencia(oc) {
    if (oc.status_execucao === 'aberto') {
        return `<div class="flex gap-2">
            <button data-action="alternar-acao-ocorrencia" data-id="${oc.id}" data-modo="tratar" style="flex:1;background:var(--pine);color:#fff;font-weight:bold;font-size:12px;padding:8px;border:none;border-radius:8px;">Tratar</button>
            <button data-action="alternar-acao-ocorrencia" data-id="${oc.id}" data-modo="reagendar" style="flex:1;background:#f1f5f9;color:#475569;font-weight:bold;font-size:12px;padding:8px;border:none;border-radius:8px;">Reagendar</button>
        </div>`;
    }
    if (oc.status_execucao === 'concluido') {
        return `<button data-action="alternar-acao-ocorrencia" data-id="${oc.id}" data-modo="estornar" style="width:100%;background:#f1f5f9;color:#475569;font-weight:bold;font-size:12px;padding:8px;border:none;border-radius:8px;">Estornar</button>`;
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
    renderizarFichaItemControle();
}

export function fecharAcaoOcorrencia() {
    ocorrenciaEmAcao = null;
    renderizarFichaItemControle();
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
        await recarregarFichaItemControle();
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
        await recarregarFichaItemControle();
    } catch (err) { mostrarToast('Erro: ' + err.message, 'erro'); }
}

export async function confirmarEstornarOcorrencia(ocorrenciaId) {
    try {
        await api.estornarOcorrencia(ocorrenciaId);
        await registrarHistoricoOcorrenciaLocal(ocorrenciaId, 'estornar', { status_execucao: 'concluido' }, { status_execucao: 'aberto' }, 'Estorno solicitado pelo usuário');
        await api.registrarLogAcessos(estado.clienteId, estado.pessoa.id, 'cofre.ocorrencias.estornar', { ativoId: estado.ativoEmFoco?.id, ocorrenciaId });
        mostrarToast('Ocorrência estornada ✅');
        ocorrenciaEmAcao = null;
        await recarregarFichaItemControle();
    } catch (err) { mostrarToast('Erro: ' + err.message, 'erro'); }
}

// ---- Editar / Excluir item
// Revisão DS (25/08/2026) — edição do item de controle virou bottom-sheet
// (Tipo B, #modal-editar-item-controle), substituindo o painel inline
// antigo (fic-editar-wrapper). Também ganhou os campos de frequência
// (antes só dava pra editar título/subtipo/antecedência) — necessário
// pra poder detectar mudança que "impacta os alertas possíveis" (pedido
// explícito) e oferecer regenerar as ocorrências futuras.
export function abrirEditarItem() {
    const item = itemEmFoco;
    popularSelectSubtipoEm('fic-ed-subtipo', item.tipo, item.subtipo_id);
    document.getElementById('fic-ed-titulo').value = item.titulo;
    document.getElementById('fic-ed-freq-intervalo').value = item.frequencia_intervalo || '';
    document.getElementById('fic-ed-freq-unidade').value = item.frequencia_unidade || 'mes';
    document.getElementById('fic-ed-antecedencia').value = item.antecedencia_alerta_dias;
    abrirModal('modal-editar-item-controle');
}

export function fecharEditarItem() {
    fecharModal('modal-editar-item-controle');
}

export async function salvarEdicaoItem() {
    const titulo = document.getElementById('fic-ed-titulo').value.trim();
    const subtipoId = document.getElementById('fic-ed-subtipo').value || null;
    const freqIntervalo = parseInt(document.getElementById('fic-ed-freq-intervalo').value, 10) || null;
    const freqUnidade = freqIntervalo ? document.getElementById('fic-ed-freq-unidade').value : null;
    const antecedencia = parseInt(document.getElementById('fic-ed-antecedencia').value, 10) || 0;
    if (!titulo) { mostrarToast('Informe um título.', 'erro'); return; }

    const item = itemEmFoco;
    // Campos que, se mudarem, afetam quais ocorrências futuras fazem
    // sentido existir. Antecedência do alerta NÃO entra aqui — só afeta
    // o cálculo do chip em tempo real (ocorrenciaEmAlerta em
    // cofre-validacoes.js), não as datas já gravadas.
    const mudouFrequencia = (freqIntervalo !== item.frequencia_intervalo) || (freqUnidade !== item.frequencia_unidade);

    try {
        const antes = { titulo: item.titulo, subtipo_id: item.subtipo_id, frequencia_intervalo: item.frequencia_intervalo, frequencia_unidade: item.frequencia_unidade, antecedencia_alerta_dias: item.antecedencia_alerta_dias };
        const depois = { titulo, subtipo_id: subtipoId, recorrente: !!freqIntervalo, frequencia_intervalo: freqIntervalo, frequencia_unidade: freqUnidade, antecedencia_alerta_dias: antecedencia };
        await api.atualizarItemControle(item.id, depois);
        await api.registrarHistoricoItemControle({ item_id: item.id, acao: 'editar', antes, depois, pessoa_id: estado.pessoa.id, origem: 'app' });

        if (mudouFrequencia) {
            // Pedido explícito: mudança que impacta os alertas possíveis
            // pergunta se regera as ocorrências FUTURAS em aberto (não
            // mexe nas já vencidas — essas continuam pendentes de
            // verdade, independente da frequência ter mudado) ou mantém
            // as que já existem. confirm() nativo — mesmo padrão já
            // usado em excluirItemControleAtual/excluirAtivoAtual pra
            // decisões simples de sim/não.
            const regenerar = confirm(
                'Você mudou a frequência deste item.\n\n' +
                'Regenerar as ocorrências futuras em aberto com a nova frequência (a partir de hoje)?\n\n' +
                'OK = Regenerar (as já vencidas continuam como estão)\n' +
                'Cancelar = Manter as ocorrências que já existem, a nova frequência só vale se você criar mais pra frente'
            );
            if (regenerar) {
                const hojeISO = new Date().toISOString().slice(0, 10);
                await api.excluirOcorrenciasAbertasFuturasDoItem(item.id, hojeISO);
                const itemAtualizado = { ...item, ...depois };
                const payloads = gerarOcorrenciasHorizonte(itemAtualizado, hojeISO, freqIntervalo, freqUnidade);
                await api.criarOcorrenciasControleBatch(payloads);
                await api.registrarLogAcessos(estado.clienteId, estado.pessoa.id, 'cofre.controle.regerar_ocorrencias', { itemId: item.id, ocorrenciasGeradas: payloads.length });
                mostrarToast(`Item atualizado — ${payloads.length} ocorrência(s) regerada(s) ✅`);
            } else {
                mostrarToast('Item atualizado — ocorrências existentes mantidas ✅');
            }
        } else {
            mostrarToast('Item atualizado ✅');
        }

        fecharEditarItem();
        await recarregarFichaItemControle();
        window.dispatchEvent(new CustomEvent('cofre:recarregar-eventos'));
    } catch (err) { mostrarToast('Erro: ' + err.message, 'erro'); }
}

export async function excluirItemControleAtual() {
    if (!confirm(`Excluir o item de controle "${itemEmFoco.titulo}"? Isso fica registrado e não pode ser desfeito pela interface.`)) return;
    try {
        await api.arquivarItemControle(itemEmFoco.id);
        await api.registrarHistoricoItemControle({ item_id: itemEmFoco.id, acao: 'excluir', antes: itemEmFoco, depois: null, pessoa_id: estado.pessoa.id, origem: 'app' });
        await api.registrarLogAcessos(estado.clienteId, estado.pessoa.id, 'cofre.controle.desativar', { itemId: itemEmFoco.id });
        mostrarToast('Item de controle excluído.');
        voltarFichaItemControle();
    } catch (err) { mostrarToast('Erro: ' + err.message, 'erro'); }
}

// ---- Alertas vinculados: REMOVIDO (v6) — não existe mais cadastro de
// alerta avulso; a ocorrência (box "Ocorrências" acima) já é o alerta.

// ---- Contatos vinculados ao item
function formContatoItemHtml() {
    return `<div class="raiz-form-borda p-2 mb-2 space-y-2">
        <select id="fic-ct-papel" class="w-full border-2 border-slate-300 rounded-lg p-2 text-xs">
            <option value="corretora_seguro">Corretora de seguro</option>
            <option value="prestador">Prestador de serviço</option>
            <option value="contador">Contador</option>
            <option value="outro">Outro</option>
        </select>
        <input id="fic-ct-nome" placeholder="Nome" class="w-full border-2 border-slate-300 rounded-lg p-2 text-xs">
        <input id="fic-ct-whatsapp" placeholder="WhatsApp (opcional)" class="w-full border-2 border-slate-300 rounded-lg p-2 text-xs">
        <input id="fic-ct-email" placeholder="E-mail (opcional)" class="w-full border-2 border-slate-300 rounded-lg p-2 text-xs">
        <div class="flex justify-end gap-2">
            <button data-action="alternar-form-contato-item" class="px-3 py-1.5 rounded-lg text-xs border-2 border-slate-300">Cancelar</button>
            <button data-action="salvar-contato-item" class="px-3 py-1.5 rounded-lg text-xs font-bold text-white" style="background:var(--pine)">Salvar contato</button>
        </div>
    </div>`;
}

export function alternarFormContatoItem() {
    formContatoItemAberto = !formContatoItemAberto;
    renderizarFichaItemControle();
}

export async function salvarContatoItem() {
    const nome = document.getElementById('fic-ct-nome').value.trim();
    if (!nome) { mostrarToast('Informe o nome do contato.', 'erro'); return; }
    try {
        await api.criarContato({
            cliente_id: estado.clienteId, item_controle_id: itemEmFoco.id, papel: document.getElementById('fic-ct-papel').value, nome,
            whatsapp: document.getElementById('fic-ct-whatsapp').value.trim() || null, email: document.getElementById('fic-ct-email').value.trim() || null,
        });
        mostrarToast('Contato salvo ✅');
        formContatoItemAberto = false;
        await recarregarFichaItemControle();
    } catch (err) { mostrarToast('Erro: ' + err.message, 'erro'); }
}

// ============================================================================
// CRIAR ITEM DE CONTROLE (formulário na ficha do ativo)
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
    abrirModal('modal-criar-item-controle');
}

export function fecharFormControle() {
    fecharModal('modal-criar-item-controle');
}

function popularSelectSubtipo(tipo) {
    popularSelectSubtipoEm('ic-subtipo', tipo, null);
}

function popularSelectSubtipoEm(selectId, tipo, selecionadoId) {
    const sel = document.getElementById(selectId);
    if (!sel) return;
    const opcoes = (subtiposCache || []).filter(s => s.tipo === tipo);
    sel.innerHTML = `<option value="">— sem subtipo específico —</option>` +
        opcoes.map(s => `<option value="${s.id}" ${s.id === selecionadoId ? 'selected' : ''}>${escapeHtml(s.nome)}</option>`).join('');
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

        // v6 (pedido explícito): ao criar o item, já lança TODAS as ocorrências
        // dentro do horizonte de 120 dias (não só a 1ª) — respeitando a
        // frequência do item. Item não-recorrente: gera só 1, na data base
        // (mesmo que fora do horizonte, pra sempre ter algo a mostrar).
        const payloads = gerarOcorrenciasHorizonte(item, dataBase, freqIntervalo, freqUnidade);
        await api.criarOcorrenciasControleBatch(payloads);

        await api.registrarLogAcessos(estado.clienteId, estado.pessoa.id, 'cofre.controle.criar', { ativoId: a.id, itemId: item.id, ocorrenciasGeradas: payloads.length });
        mostrarToast(`Item de controle criado — ${payloads.length} ocorrência(s) gerada(s) ✅`);
        fecharFormControle();
        itensDoAtivoAtual = await api.listarItensControleAtivo(a.id);
        renderizarListaControles();
        window.dispatchEvent(new CustomEvent('cofre:recarregar-eventos')); // atualiza Home/Visão Geral com as novas ocorrências
    } catch (err) { mostrarToast('Erro: ' + err.message, 'erro'); }
}

// Gera as ocorrências de um item dentro do horizonte de 120 dias a partir de
// hoje, respeitando frequência (dia/semana/mes/ano). Sempre gera pelo menos
// 1 (a da data_base), mesmo que ela já esteja fora do horizonte — pra nunca
// deixar um item sem nenhuma ocorrência.
const HORIZONTE_DIAS = 120;
const MAX_OCORRENCIAS_GERADAS = 60; // guarda contra frequência muito curta (ex.: diária) gerar demais

function gerarOcorrenciasHorizonte(item, dataBase, freqIntervalo, freqUnidade) {
    const camposComuns = { cliente_id: estado.clienteId, item_controle_id: item.id, alerta_habilitado: !!item.alerta_ativo, status_execucao: 'aberto' };
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    const horizonte = new Date(hoje); horizonte.setDate(horizonte.getDate() + HORIZONTE_DIAS);
    const horizonteISO = horizonte.toISOString().slice(0, 10);

    if (!freqIntervalo || !freqUnidade) {
        return [{ ...camposComuns, competencia: primeiroDiaDoMes(dataBase), data_prevista_original: dataBase, data_prevista_atual: dataBase }];
    }

    const payloads = [];
    let dataAtual = dataBase;
    let guarda = 0;
    while (dataAtual <= horizonteISO && guarda < MAX_OCORRENCIAS_GERADAS) {
        payloads.push({ ...camposComuns, competencia: primeiroDiaDoMes(dataAtual), data_prevista_original: dataAtual, data_prevista_atual: dataAtual });
        dataAtual = proximaData(dataAtual, freqUnidade, freqIntervalo);
        guarda++;
    }
    // Se a 1ª data já nasce depois do horizonte (ex.: vence daqui 200 dias),
    // ainda assim garante pelo menos essa 1ª ocorrência.
    if (!payloads.length) {
        payloads.push({ ...camposComuns, competencia: primeiroDiaDoMes(dataBase), data_prevista_original: dataBase, data_prevista_atual: dataBase });
    }
    return payloads;
}

function proximaData(dataISO, unidade, intervalo) {
    const d = new Date(dataISO + 'T00:00:00');
    if (unidade === 'dia') d.setDate(d.getDate() + intervalo);
    else if (unidade === 'semana') d.setDate(d.getDate() + intervalo * 7);
    else if (unidade === 'mes') d.setMonth(d.getMonth() + intervalo);
    else if (unidade === 'ano') d.setFullYear(d.getFullYear() + intervalo);
    return d.toISOString().slice(0, 10);
}

function primeiroDiaDoMes(dataISO) {
    const [ano, mes] = dataISO.split('-');
    return `${ano}-${mes}-01`;
}
