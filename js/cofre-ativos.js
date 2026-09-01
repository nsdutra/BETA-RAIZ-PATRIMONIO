// ============================================================================
// cofre-ativos.js — Raiz Patrimônio · Cofre de Documentos
// Versão: 1.7.0 · 31/08/2026
//
// v1.7.0 — ajustes de qualidade pedidos depois do Nicola testar a
// v1.94.0 em navegador de verdade ("perdeu a formatação da lista com
// ícones, tamanho e cores... como referência a lista de imóveis
// antiga"): ativoCardHtml() reescrita — ativos do tipo imóvel agora
// mostram a MESMA formatação da lista antiga de Imóveis (empreendimento
// · tipo · finalidade no título, endereço, locatário+aluguel, selo de
// status colorido, foto real quando houver), lendo de
// resumoImoveisPorId (Map carregado 1x por carregarResumoImoveisParaCards(),
// nunca 1 busca por card). Ativos de outros tipos continuam com o card
// genérico de sempre. "+ Cadastrar novo imóvel" (aoMudarTipoAtivo) —
// novo link dentro do form "Novo ativo" > "Qual imóvel?", substituindo
// o botão separado da barra (removido, estava quebrado — ver
// ativos-markup.js v1.4.1/cofre-app.js v1.12.0 pro bug real).
//
// v1.6.0 — "evoluir a exemplo do protótipo" (pedido explícito,
// 31/08/2026): ficha do ativo reestruturada de boxes empilhados pra
// abas (Dados/Documentos/Controles/Contratos/Fotos), igual ao mockup.
// Nova faTrocarAba() (troca de aba, tudo já montado de uma vez em
// abrirFichaAtivo() — nenhuma busca nova ao trocar); nova
// montarContratosAtivo() (aba Contratos, NOVA — lê contratos via
// api.buscarContratosDoImovel(), só quando o ativo referencia um
// imóvel); montarFotosAtivo() ganhou estado vazio (#fa-fotos-vazio,
// necessário porque a aba Fotos agora existe mesmo sem foto nenhuma).
// Mudança deliberada de padrão SÓ NESTA TELA — o resto do app continua
// com boxes empilhados (ver nota completa no changelog do index.html
// e no comentário de ativos-markup.js v1.3.0).
//
// v1.5.0 — "Fase A" da fusão Ativos/Imóveis (pedido explícito,
// 31/08/2026): chips de tipo (Todos/Imóveis/Veículos/Outros, com
// contador) acima da lista, batendo com o protótipo. renderAtivosLista()
// ganhou suporte a array em filtroTipo (agrupa mais de 1 tipo por chip),
// 100% retrocompatível — quem já chamava com string (dropdown fino do
// modal "Buscar/Filtrar", listeners em cofre-app.js) continua funcionando
// idêntico a antes. Ver GRUPOS_CHIP_TIPO/renderChipsAtivos/
// aplicarFiltroChipAtivos logo abaixo da função.
//
// v1.4.0 — 2 mudanças, pedido do Nicola (trem v1.85/v1.86):
// 1) popularSelectTipoAtivo() ganha 3 tipos novos (aeronave, embarcacao,
//    colecao_bem_valor) — catálogo de campos correspondente foi pra
//    cofre-validacoes.js v1.3.0. CHECK de cofre_ativos.tipo_ativo já
//    ampliado no banco (migration v1.84.9) antes desta entrega.
// 2) montarDadosAtivo() virou async: quando o ativo referencia um imóvel
//    do App (entidade_origem_tipo='imovel'), busca e mostra IPTU/valor
//    de mercado/uso ali mesmo (api.buscarResumoImovelOrigem), além do
//    botão "Abrir gestão do imóvel" que já existia (mantido). Pra
//    qualquer outro caso, comportamento idêntico a antes.
//
// v1.3.0 — pedido explícito do Nicola: função "Marcar como vendido"
// (marcarAtivoVendidoAtual, pill nova no Mais ações da ficha do ativo) —
// muda status pra 'vendido' e desativa em cascata o alerta dos itens de
// controle vinculados (api.marcarAtivoVendido). Badge de status
// (montarDadosAtivo) ganha 3º estado (cor neutra, mesma família de
// "Suspenso/Finalizado" do DS §14) — antes só tinha Ativo/Arquivado.
//
// v1.2.1 — BUG FIX (achado pelo usuário): excluirAtivoAtual() não
// disparava cofre:recarregar-eventos — excluir um ativo com itens de
// controle ativos deixava os alertas desses itens congelados na Home.
// Ver mesmo bug em cofre-controles.js v1.5.1 (4 funções vizinhas).
//
// v1.2.0 — 2ª rodada da revisão DS (decisões D-1/D-2/D-3 confirmadas).
// (1) D-2: badge de vencimento (chipVencimento) migrado pro formato
// oficial §14 — "chip ${chip.classe}" virou "${chip.classe}" (classe já
// vem completa, sem prefixo). (2) D-3/C-4: "Novo ativo" convertido de
// painel inline (alternarFormAtivo/alternarToggle) pra Tipo A bottom-
// sheet — abrirFormAtivo()/fecharFormAtivo() novas, salvarAtivo() fecha
// via fecharFormAtivo(). (3) D-1: comentário sobre cor de "Excluir"
// corrigido (era "vermelho discreto", virou cinza uniforme — ver
// excluirAtivoAtual() abaixo).
//
// v1.1.6 — DS C-8: alternarMaisAcoesAtivo() só fazia classList.toggle,
// sem girar a seta (DS §8.2 exige rotação 180°/0° + refrescarIcones()).
// Corpo canônico aplicado; depende do novo id fa-mais-acoes-seta no HTML
// (cofre.html v1.7.0).
//
// v1.1.5 — box "Dados do ativo": vira descrição corrida + badge de status
// (Ativo/Arquivado), igual ao padrão de card do Imóvel — antes era tabela
// label:valor. Card da lista de ativos: fonte igual ao Imóvel (text-xs
// font-extrabold, era text-sm font-semibold). Box "Alertas" removido (v6 —
// alertas agora só existem via Item de Controle). ativoCardHtml() lê
// estado.ocorrenciasAbertas em vez do estado.eventos morto.
//
// v1.1.4 — Contatos removido da ficha do ativo (pedido explícito: contatos
// agora vinculam a Item de Controle, não ao ativo direto — ver
// cofre-controles.js). Documentos/Fotos deixam de ser boxes fixos e viram
// ações em "Mais ações" (abrem modal-documentos-ativo/modal-fotos-ativo).
// montarAlertasAtivo() passa a excluir eventos já vinculados a um item de
// controle (esses aparecem na ficha do item, não duplicados aqui).
//
// v1.1.3 — MUDANÇA ESTRUTURAL: ficha do ativo deixa de ser modal com abas
// e passa a ser tela cheia (data-screen="ficha-ativo") com boxes empilhados
// (Dados/Documentos/Controles/Alertas/Contatos/Fotos), padrão idêntico à
// ficha do imóvel no App principal (pedido explícito — "menu suspenso com
// abas não é o padrão do projeto"). Histórico passa a viver em "Mais ações"
// do box Dados, mesma convenção usada no box de Contrato da ficha do
// imóvel. Nova ação excluirAtivoAtual() (soft-delete, "Mais ações →
// Excluir", cinza uniforme — D-1 (revisão DS, 25/08/2026): decisão do
// proprietário confirmou "Excluir" cinza como regra OFICIAL do sistema
// inteiro (não é mais uma divergência do Cofre — o App também foi
// corrigido, ver index.html v1.61.6). Comentário original desta linha
// dizia "vermelho discreto conforme Design System §1" — o DS v2.0 ainda
// tinha essa regra quando este trecho foi escrito; v2.1.0 já reflete a
// mudança.
//
// v1.1.2 — abrirFichaAtivo() passa a montar também a aba Controles (novo
// módulo cofre-controles.js), junto de Resumo/Documentos/Alertas/Contatos.
//
// v1.1.1 — select de tipo de ativo passa a incluir veiculo_blindado e
// obra_arte (ver cofre-validacoes.js v1.1.1 para rótulo/ícone/campos).
//
// Ativo Controlado como entidade rica: Lista → Ficha → Editar (Adendo §6).
// Ficha abre sempre em Resumo (nunca direto em Documentos — era o desvio
// da v1.0.0 que este arquivo corrige). Campos estruturados por tipo em vez
// do campo único "identificadores" da v1.0.0 (prompt corretivo §10).
// ============================================================================
import { estado } from './cofre-estado.js';
import * as api from './cofre-api.js';
import { mostrarToast, refrescarIcones, alternarToggle, abrirModal, fecharModal } from './cofre-ui.js';
import { mudarTela } from './cofre-navegacao.js';
import {
    escapeHtml, formatarDataBR, diasAte, chipVencimento, mascarar,
    rotuloTipoAtivo, iconeAtivo, CAMPOS_POR_TIPO_ATIVO, validarCamposAtivo,
} from './cofre-validacoes.js';
import { montarControlesAtivo } from './cofre-controles.js';

let ativoAtualId = null;

// ============================================================================
// LISTA (tela Ativos)
// ============================================================================
export function popularSelectTipoAtivo() {
    const sel = document.getElementById('at-tipo');
    if (!sel || sel.options.length) return;
    sel.innerHTML = ['veiculo', 'veiculo_blindado', 'imovel', 'terreno', 'vida_protecao', 'obra_arte', 'aeronave', 'embarcacao', 'colecao_bem_valor', 'outro']
        .map(t => `<option value="${t}">${rotuloTipoAtivo(t)}</option>`).join('');
}

export function renderAtivosLista(filtroTipo = '', filtroTexto = '') {
    const termo = filtroTexto.toLowerCase().trim();
    // v1.5.0 — filtroTipo agora aceita string (comportamento de sempre,
    // usado pelo dropdown fino do modal "Buscar/Filtrar") OU array
    // (usado pelos chips novos, que agrupam mais de um tipo — ex.:
    // "Veículos" = veiculo + veiculo_blindado). null/'' continuam
    // significando "sem filtro de tipo", igual sempre foi.
    const tiposFiltro = Array.isArray(filtroTipo) ? filtroTipo : (filtroTipo ? [filtroTipo] : null);

    // Sincroniza qual chip aparece "aceso": se este filtro veio do
    // dropdown fino (string específica, não array) e não é vazio,
    // nenhum dos 4 chips corresponde 1:1 — apaga o destaque (-1) pra não
    // mentir. Filtro vazio ('') volta pro mesmo estado do chip "Todos"
    // (cobre o botão "Limpar filtros" do modal também, sem precisar
    // tocar nele). Array (veio de um clique em chip) não mexe aqui —
    // aplicarFiltroChipAtivos() já setou o índice certo antes de chamar.
    if (!Array.isArray(filtroTipo)) {
        chipAtivoAtual = filtroTipo ? -1 : 0;
    }

    const lista = estado.ativos.filter(a => {
        if (tiposFiltro && !tiposFiltro.includes(a.tipo_ativo)) return false;
        if (termo && !a.nome_exibicao.toLowerCase().includes(termo)) return false;
        return true;
    });
    document.getElementById('ativos-lista').innerHTML = lista.map(ativoCardHtml).join('');
    document.getElementById('ativos-estado-vazio').classList.toggle('hidden', estado.ativos.length !== 0);
    document.getElementById('ativos-lista').classList.toggle('hidden', estado.ativos.length === 0);
    renderChipsAtivos();
    refrescarIcones();
}

// ============================================================================
// CHIPS DE TIPO — "Fase A" da fusão Ativos/Imóveis (v1.5.0, 31/08/2026,
// pedido explícito). Agrupa os 10 tipos granulares (usados no dropdown
// fino do modal "Buscar/Filtrar", que continua existindo do lado disso)
// em 4 chips largos, batendo com o protótipo (PROTOTIPO_MODULO_UNICO_
// RAIZ_v1_0.html): Todos/Imóveis/Veículos/Outros, cada um com contador
// ao vivo. Chamada de dentro de renderAtivosLista() — nunca precisa ser
// chamada separadamente, os contadores ficam sempre sincronizados com a
// lista atual sem eu ter que caçar todos os outros call-sites de
// renderAtivosLista() espalhados pelo app.
// ============================================================================
const GRUPOS_CHIP_TIPO = [
    { rotulo: 'Todos', tipos: null },
    { rotulo: 'Imóveis', tipos: ['imovel', 'terreno'] },
    { rotulo: 'Veículos', tipos: ['veiculo', 'veiculo_blindado'] },
    { rotulo: 'Outros', tipos: ['vida_protecao', 'obra_arte', 'aeronave', 'embarcacao', 'colecao_bem_valor', 'outro'] },
];

// Índice do chip ativo — 0 ("Todos") é o estado inicial. Só muda quando
// a própria pessoa clica num chip (aplicarFiltroChipAtivos); escolher um
// subtipo fino pelo dropdown do modal não mexe aqui de propósito (são 2
// filtros independentes, o dropdown fino não tem chip correspondente 1:1).
let chipAtivoAtual = 0;

function renderChipsAtivos() {
    const wrap = document.getElementById('ativos-chips-tipo');
    if (!wrap) return; // cofre.html standalone não tem este container ainda — no-op seguro
    wrap.innerHTML = GRUPOS_CHIP_TIPO.map((g, i) => {
        const qtd = g.tipos ? estado.ativos.filter(a => g.tipos.includes(a.tipo_ativo)).length : estado.ativos.length;
        const ativo = i === chipAtivoAtual;
        return `<button type="button" data-action="filtrar-ativos-chip" data-chip-indice="${i}" class="flex-none text-[11px] font-bold px-3 py-1.5 rounded-full transition ${ativo ? 'text-white' : 'bg-white text-slate-600 border border-slate-300'}" ${ativo ? 'style="background:var(--pine)"' : ''}>${escapeHtml(g.rotulo)} · ${qtd}</button>`;
    }).join('');
}

// Chamada pelo dispatch central (cofre-app.js, case 'filtrar-ativos-chip').
// Limpa o dropdown fino do modal de propósito — os 2 filtros de tipo não
// deveriam ficar "brigando" (um mostrando subtipo, outro mostrando
// grupo); clicar um chip sempre volta o dropdown fino pra "Todos os tipos".
export function aplicarFiltroChipAtivos(indice) {
    if (indice < 0 || indice >= GRUPOS_CHIP_TIPO.length) return;
    chipAtivoAtual = indice;
    const selTipo = document.getElementById('filtro-ativo-tipo');
    if (selTipo) selTipo.value = '';
    const termoAtual = document.getElementById('filtro-ativo-busca')?.value || '';
    renderAtivosLista(GRUPOS_CHIP_TIPO[indice].tipos, termoAtual);
}

// v1.7.0 (31/08/2026, pedido explícito, "perdeu a formatação... como
// referência a lista de imóveis antiga") — resumoImoveisPorId é um Map
// carregado 1x (carregarResumoImoveisParaCards(), disparada em
// 'cofre:dados-carregados', mesmo padrão de popularSelectTipoAtivo())
// com empreendimento/tipo/finalidade/status/foto/contrato principal de
// TODOS os imóveis do cliente, numa tacada só — nunca 1 busca por card
// (isso sim deixaria a lista lenta de verdade).
let resumoImoveisPorId = new Map();

export async function carregarResumoImoveisParaCards() {
    try {
        resumoImoveisPorId = await api.buscarResumoImoveisParaCards(estado.clienteId);
    } catch (e) {
        console.warn('[cofre-ativos] Falha ao carregar resumo de imóveis pra cards:', e.message);
        return;
    }
    // Só re-renderiza se a lista já estiver montada em tela — sem
    // forçar a tela abrir, e preservando o filtro/chip que a pessoa já
    // tiver escolhido (nunca reseta pra "Todos" por baixo dos panos).
    const listaEl = document.getElementById('ativos-lista');
    if (!listaEl) return;
    const tiposFiltroAtual = chipAtivoAtual >= 0 ? GRUPOS_CHIP_TIPO[chipAtivoAtual]?.tipos : (document.getElementById('filtro-ativo-tipo')?.value || '');
    const termoAtual = document.getElementById('filtro-ativo-busca')?.value || '';
    renderAtivosLista(tiposFiltroAtual, termoAtual);
}

function ativoCardHtml(a) {
    const ocorrenciasDoAtivo = estado.ocorrenciasAbertas.filter(oc => oc.cofre_itens_controle?.ativo_id === a.id);
    const proximo = ocorrenciasDoAtivo.map(oc => diasAte(oc.data_prevista_atual)).filter(d => d !== null).sort((x, y) => x - y)[0];
    const chip = chipVencimento(proximo);

    // v1.7.0 — ativo do tipo imóvel COM resumo carregado: mesma "cara"
    // exata da lista antiga de Imóveis (montarCabecalhoImovelHtml, no
    // index.html) — avatar com foto real (ou casinha), título
    // "Empreendimento · Tipo · Finalidade", endereço, situação
    // (locatário/status à esquerda, aluguel à direita) e selo de status
    // colorido (Vago=âmbar/Assinando=azul/Alugado=verde/demais=cinza).
    // Sem resumo ainda carregado (1ª renderização, antes do bulk fetch
    // resolver) ou ativo de outro tipo: cai no card genérico de sempre.
    const resumoImovel = a.entidade_origem_tipo === 'imovel' ? resumoImoveisPorId.get(a.entidade_origem_id) : null;

    if (resumoImovel) {
        const finalidadeLabel = { long_stay: 'Long Stay', uso_proprio: 'Uso Pessoal', temporada: 'Temporada', comercial: 'Comercial', outro: 'Outro' };
        const principal = resumoImovel.contratoPrincipal;
        let situacaoEsquerda, situacaoDireita;
        if (!principal) {
            situacaoEsquerda = 'Sem contrato cadastrado';
            situacaoDireita = '';
        } else if (principal.status === 'Finalizado') {
            situacaoEsquerda = 'Sem contrato em andamento';
            situacaoDireita = '';
        } else {
            situacaoEsquerda = (principal.locatario || '-') + (principal.status !== 'Ativo' ? ` · ${principal.status}` : '');
            situacaoDireita = 'R$ ' + Number(principal.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        }
        const badgeClasse = resumoImovel.status === 'Vago' ? 'bg-amber-100 text-amber-800'
            : resumoImovel.status === 'Assinando' ? 'bg-blue-100 text-blue-800'
            : resumoImovel.status === 'Alugado' ? 'bg-green-100 text-green-800'
            : 'bg-slate-100 text-slate-700';
        const titulo = [resumoImovel.empreendimento || 'Sem empreendimento', resumoImovel.tipo, finalidadeLabel[resumoImovel.finalidadeUso] || 'Long Stay'].filter(Boolean).join(' · ');

        return `<button data-action="abrir-ativo" data-id="${a.id}" class="card-ativo w-full p-3 text-left flex gap-3 items-start">
            <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center flex-none overflow-hidden">
                ${resumoImovel.foto ? `<img src="${resumoImovel.foto}" class="w-full h-full object-cover">` : `<i data-lucide="home" style="width:20px;height:20px"></i>`}
            </div>
            <div class="flex-1 min-w-0">
                <h3 class="text-xs font-extrabold text-emerald-950 truncate">${escapeHtml(titulo)}</h3>
                <div class="text-xs text-slate-500 truncate">${escapeHtml(a.nome_exibicao)}</div>
                <div class="flex items-center justify-between gap-2 mt-1">
                    <span class="text-xs text-slate-700 truncate">${escapeHtml(situacaoEsquerda)}</span>
                    ${situacaoDireita ? `<span class="text-xs text-slate-700 flex-none">${situacaoDireita}</span>` : ''}
                </div>
            </div>
            <div class="flex flex-col items-end gap-1 flex-none">
                <span class="text-[11px] font-bold px-1.5 py-0.5 rounded ${badgeClasse}">${escapeHtml(resumoImovel.status)}</span>
                ${chip ? `<span class="${chip.classe}">${escapeHtml(chip.texto)}</span>` : ''}
            </div>
        </button>`;
    }

    // Card genérico (ativos que não são imóvel, ou imóvel sem resumo
    // ainda carregado) — mesmo formato de sempre.
    return `<button data-action="abrir-ativo" data-id="${a.id}" class="card-ativo w-full p-3 text-left flex items-center gap-3">
        <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center flex-none"><i data-lucide="${iconeAtivo(a.tipo_ativo)}" style="width:20px;height:20px"></i></div>
        <div class="min-w-0 flex-1">
            <p class="text-xs font-extrabold truncate">${escapeHtml(a.nome_exibicao)}</p>
            <p class="text-xs" style="color:var(--sage)">${escapeHtml(rotuloTipoAtivo(a.tipo_ativo))}</p>
        </div>
        ${chip ? `<span class="${chip.classe} flex-shrink-0">${escapeHtml(chip.texto)}</span>` : ''}
    </button>`;
}

// ============================================================================
// FORMULÁRIO — NOVO ATIVO (campos estruturados por tipo, §10)
// ============================================================================
// C-4 (revisão DS §9) — "Novo ativo" era um painel inline (alternarToggle,
// mesmo padrão que Imóvel/Controles já tinham abandonado). Convertido pra
// Tipo A (bottom-sheet modal, estático no DOM, z-65) — ver cofre.html
// v1.7.1, #form-ativo-wrapper. abrirFormAtivo()/fecharFormAtivo() reaproveitam
// abrirModal()/fecharModal() genéricos (mesmo par de funções usado por
// todo popup do módulo), em vez do alternarToggle() (exclusivo de painel
// inline, ex.: formulário de Contrato/Síndico no App).
export function abrirFormAtivo() {
    document.getElementById('at-status').textContent = '';
    abrirModal('form-ativo-wrapper');
    aoMudarTipoAtivo();
}

export function fecharFormAtivo() {
    fecharModal('form-ativo-wrapper');
}

export async function aoMudarTipoAtivo() {
    const tipo = document.getElementById('at-tipo').value;
    document.getElementById('at-origem-imovel-wrapper').classList.toggle('hidden', tipo !== 'imovel');
    if (tipo === 'imovel') {
        const imoveis = await api.listarImoveisDoCliente(estado.clienteId);
        document.getElementById('at-origem-imovel').innerHTML = imoveis.map(i => `<option value="${i.id}">${escapeHtml(i.endereco_rua)}, ${escapeHtml(i.endereco_num || '')}</option>`).join('') || '<option value="">Nenhum imóvel cadastrado</option>';
    }
    document.getElementById('at-campos-estruturados').innerHTML = renderizarCamposEstruturados(tipo, {});
}

function renderizarCamposEstruturados(tipo, valores, prefixoId = 'at-campo-') {
    const campos = CAMPOS_POR_TIPO_ATIVO[tipo] || [];
    return campos.map(c => `
        <div>
            <label class="text-xs font-semibold block mb-1">${escapeHtml(c.label)} ${c.obrigatorio ? '<span style="color:var(--danger)">*</span>' : ''}</label>
            <input type="${c.tipo === 'number' ? 'number' : c.tipo === 'date' ? 'date' : 'text'}" id="${prefixoId}${c.chave}" value="${escapeHtml(valores[c.chave] || '')}" class="w-full border-2 border-slate-300 rounded-xl p-2 text-sm">
        </div>`).join('') || `<p class="text-xs sm:col-span-2" style="color:var(--sage)">Sem campos estruturados adicionais para este tipo.</p>`;
}

function lerCamposEstruturados(tipo, prefixoId = 'at-campo-') {
    const campos = CAMPOS_POR_TIPO_ATIVO[tipo] || [];
    const dados = {};
    for (const c of campos) {
        const el = document.getElementById(`${prefixoId}${c.chave}`);
        if (el && el.value.trim()) dados[c.chave] = el.value.trim();
    }
    return dados;
}

export async function salvarAtivo() {
    const tipo = document.getElementById('at-tipo').value;
    const nome = document.getElementById('at-nome').value.trim();
    const statusEl = document.getElementById('at-status');
    const dadosEspecificos = lerCamposEstruturados(tipo);

    const erros = validarCamposAtivo(tipo, nome, dadosEspecificos);
    if (erros.length) { statusEl.textContent = '⚠️ ' + erros[0]; statusEl.style.color = 'var(--danger)'; return; }

    const payload = { cliente_id: estado.clienteId, tipo_ativo: tipo, nome_exibicao: nome, status: 'ativo', dados_especificos: dadosEspecificos, criado_por: estado.pessoa.id };
    if (tipo === 'imovel') {
        const imovelId = document.getElementById('at-origem-imovel').value;
        if (!imovelId) { statusEl.textContent = '⚠️ Selecione o imóvel.'; statusEl.style.color = 'var(--danger)'; return; }
        payload.entidade_origem_tipo = 'imovel';
        payload.entidade_origem_id = imovelId;
    }

    try {
        await api.criarAtivo(payload);
        mostrarToast('Ativo cadastrado ✅');
        document.getElementById('at-nome').value = '';
        fecharFormAtivo();
        window.dispatchEvent(new CustomEvent('cofre:recarregar-ativos'));
    } catch (err) { statusEl.textContent = '❌ ' + err.message; statusEl.style.color = 'var(--danger)'; }
}

// ============================================================================
// FICHA DO ATIVO — abre SEMPRE em Resumo (Adendo §7.1)
// ============================================================================
export async function abrirFichaAtivo(id) {
    const a = estado.ativos.find(x => x.id === id) || await api.buscarAtivoPorId(id);
    if (!a) { mostrarToast('Ativo não encontrado.', 'erro'); return; }
    ativoAtualId = id;
    estado.ativoEmFoco = a;

    // v1.93.0 (pedido explícito, "evoluir a exemplo do protótipo") —
    // fa-cabecalho deixou de viver DENTRO do box "Dados do ativo" e virou
    // o cabeçalho da ficha inteira, acima das abas (mesma posição do
    // .ficha-head do protótipo) — por isso o texto cresceu um pouco
    // (text-xs -> text-sm no nome) pra não ficar pequeno demais como
    // título de página. Mesmo id, mesmo innerHTML, só o tamanho mudou.
    document.getElementById('fa-cabecalho').innerHTML = `
        <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center flex-none"><i data-lucide="${iconeAtivo(a.tipo_ativo)}" style="width:20px;height:20px"></i></div>
            <div class="min-w-0 flex-1">
                <p class="text-sm font-extrabold truncate">${escapeHtml(a.nome_exibicao)}</p>
                <p class="text-xs" style="color:var(--sage)">${escapeHtml(rotuloTipoAtivo(a.tipo_ativo))}</p>
            </div>
        </div>
    `;
    document.getElementById('fa-editar-wrapper').classList.add('hidden');
    document.getElementById('fa-mais-acoes').classList.add('hidden');

    await montarDadosAtivo(a);
    montarDocumentosAtivo(a);
    await montarControlesAtivo(a);
    await montarContratosAtivo(a);
    await montarFotosAtivo(a);

    // v1.93.0 — toda vez que a ficha abre, começa na aba "Dados" (mesmo
    // comportamento do protótipo: "Ficha abre sempre em Resumo" já era
    // regra deste projeto desde antes das abas existirem — só reaplicado
    // aqui em cima do mecanismo novo).
    faTrocarAba('dados');

    mudarTela('ficha-ativo');
}

// v1.93.0 (pedido explícito, 31/08/2026, "evoluir a exemplo do
// protótipo") — troca de aba dentro da ficha do ativo (Dados/
// Documentos/Controles/Contratos/Fotos). Todo o CONTEÚDO de cada aba já
// é montado de uma vez em abrirFichaAtivo() (nenhuma busca nova
// acontece ao trocar de aba) — esta função só troca visibilidade +
// destaque visual, mesmo espírito leve do trocarSub() do protótipo.
export function faTrocarAba(nomeAba) {
    document.querySelectorAll('.fa-subtab').forEach(btn => {
        const ativo = btn.dataset.faAba === nomeAba;
        btn.style.color = ativo ? 'var(--sprout)' : '';
        btn.style.borderBottomColor = ativo ? 'var(--sprout)' : 'transparent';
        btn.classList.toggle('text-slate-500', !ativo);
    });
    document.querySelectorAll('.fa-painel').forEach(painel => {
        painel.classList.toggle('hidden', painel.id !== 'fa-painel-' + nomeAba);
    });
    refrescarIcones();
}

export function fecharFichaAtivo() {
    mudarTela('ativos');
    window.dispatchEvent(new CustomEvent('cofre:recarregar-ativos'));
}

export function alternarMaisAcoesAtivo() {
    const el = document.getElementById('fa-mais-acoes');
    const seta = document.getElementById('fa-mais-acoes-seta');
    if (!el) return;
    el.classList.toggle('hidden');
    if (seta) seta.style.transform = el.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
    refrescarIcones();
}

// v1.93.0 (NOVO, pedido explícito, "evoluir a exemplo do protótipo") —
// aba Contratos: só existe conteúdo de verdade quando o ativo referencia
// um imóvel do App (entidade_origem_tipo='imovel') — outros tipos de
// ativo (veículo, obra de arte etc.) não têm contrato de locação neste
// sistema. "Relação, não fusão" (mesmo princípio do protótipo): lê
// direto a tabela contratos via cofre-api.js (mesma conexão redundante
// já aceita, ver ativos-boot.js) — NENHUMA lógica de negócio de
// contrato (reajuste, minuta, rescisão) foi duplicada aqui, é só leitura.
async function montarContratosAtivo(a) {
    const painel = document.getElementById('fa-contratos-lista');
    if (!painel) return;

    if (a.entidade_origem_tipo !== 'imovel') {
        painel.innerHTML = `<p class="text-xs" style="color:var(--sage)">Contratos só existem pra ativos do tipo imóvel.</p>`;
        return;
    }

    try {
        const lista = await api.buscarContratosDoImovel(a.entidade_origem_id);
        if (!lista.length) {
            painel.innerHTML = `<p class="text-xs" style="color:var(--sage)">Nenhum contrato vinculado a este imóvel ainda.</p>`;
            return;
        }
        const rotuloStatus = { Ativo: 'Vigente', Assinando: 'Aguardando assinatura', Suspenso: 'Suspenso', Finalizado: 'Finalizado' };
        painel.innerHTML = lista.map(c => `
            <div class="raiz-bloco-interno">
                <div class="flex justify-between items-start gap-2">
                    <span class="text-sm font-bold">${escapeHtml(c.locatario || 'Locatário não informado')}</span>
                    <span class="text-sm font-bold flex-none" style="color:var(--sprout)">R$ ${Number(c.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <p class="text-xs mt-0.5" style="color:var(--sage)">${rotuloStatus[c.status] || escapeHtml(c.status || '')}${c.fim ? ' · até ' + formatarDataBR(c.fim) : ''}</p>
            </div>`).join('');
    } catch (err) {
        painel.innerHTML = `<p class="text-xs text-red-500">Não foi possível carregar os contratos agora.</p>`;
        console.warn('[cofre-ativos] montarContratosAtivo falhou:', err.message);
    }
}

// ---- Dados do ativo (box 1 — campos estruturados por tipo, incl. valor estimado)
// v1.85 — virou async: quando o ativo referencia um imóvel do App
// (entidade_origem_tipo='imovel'), busca IPTU/valor de mercado/uso/tipo
// de locação e mostra ali dentro, além do botão "Abrir gestão do imóvel"
// que já existia (mantido — navegar pra edição completa continua útil,
// isto aqui é só o resumo rápido pra não precisar sair da ficha só pra
// ver o valor). Pra ativo NÃO vinculado (imóvel solto no Cofre, ou
// qualquer outro tipo), comportamento idêntico ao de antes.
async function montarDadosAtivo(a) {
    const origemWrapper = document.getElementById('fa-resumo-origem-imovel');
    const ehImovelVinculado = a.entidade_origem_tipo === 'imovel';
    origemWrapper.classList.toggle('hidden', !ehImovelVinculado);

    if (ehImovelVinculado) {
        // v1.93.0 (pedido explícito, "evoluir a exemplo do protótipo") —
        // grade completa 2 colunas (Inscrição imobiliária/UF-Município/
        // Uso/Tipo de locação/Valor de mercado/IPTU/Endereço completo),
        // igual ao mockup — antes era só um resumo em texto corrido
        // (uso/valor/IPTU numa linha só). "Relação, não fusão": isto é
        // LEITURA — editar esses campos continua sendo só pelo formulário
        // de verdade do imóvel ("Abrir gestão do imóvel →" logo abaixo),
        // porque cofre_ativos.dados_especificos (o que "Editar dados"
        // desta ficha edita) e imoveis (endereço/IPTU/valor de mercado)
        // são tabelas diferentes — fundir os 2 formulários de escrita é
        // decisão maior, fora desta entrega.
        const resumoImovel = await api.buscarResumoImovelOrigem(a.entidade_origem_id);
        const usoLabel = { residencial: 'Residencial', comercial: 'Comercial', industrial: 'Industrial', terreno: 'Terreno', rural: 'Rural' };
        const locacaoLabel = { longa_duracao: 'Longa duração', temporada: 'Temporada', comercial: 'Comercial' };
        const campo = (rotulo, valor) => valor
            ? `<div><dt class="text-[10px]" style="color:var(--sage)">${escapeHtml(rotulo)}</dt><dd class="text-[13px] font-bold mt-0.5">${valor}</dd></div>`
            : '';
        const enderecoPartes = [resumoImovel?.endereco_rua, resumoImovel?.endereco_num].filter(Boolean).join(', ');
        const enderecoCompleto = [enderecoPartes, resumoImovel?.endereco_bairro, [resumoImovel?.endereco_cidade, resumoImovel?.uf].filter(Boolean).join('/')].filter(Boolean).join(' — ');

        const campos = [
            campo('Inscrição imobiliária', resumoImovel?.cib ? escapeHtml(resumoImovel.cib) : ''),
            campo('UF / Município', (resumoImovel?.uf && resumoImovel?.endereco_cidade) ? escapeHtml(resumoImovel.uf) + ' · ' + escapeHtml(resumoImovel.endereco_cidade) : ''),
            campo('Uso', resumoImovel?.uso ? (usoLabel[resumoImovel.uso] || escapeHtml(resumoImovel.uso)) : ''),
            campo('Tipo de locação', resumoImovel?.tipo_locacao ? (locacaoLabel[resumoImovel.tipo_locacao] || escapeHtml(resumoImovel.tipo_locacao)) : ''),
            campo('Valor de mercado', resumoImovel?.valor_mercado ? 'R$ ' + Number(resumoImovel.valor_mercado).toLocaleString('pt-BR') : ''),
            campo('IPTU (anual)', resumoImovel?.iptu ? 'R$ ' + Number(resumoImovel.iptu).toLocaleString('pt-BR') : ''),
        ].filter(Boolean);
        const campoEndereco = enderecoCompleto
            ? `<div class="col-span-2"><dt class="text-[10px]" style="color:var(--sage)">Endereço completo</dt><dd class="text-[13px] font-bold mt-0.5">${escapeHtml(enderecoCompleto)}</dd></div>`
            : '';

        const resumoHtml = (campos.length || campoEndereco)
            ? `<dl class="grid grid-cols-2 gap-x-3 gap-y-2 mt-2">${campos.join('')}${campoEndereco}</dl>`
            : `<p class="text-xs mt-2" style="color:var(--sage)">Sem endereço/IPTU/valor de mercado/uso cadastrado no imóvel ainda.</p>`;
        const bloco = origemWrapper.querySelector('[data-resumo-imovel]') || (() => {
            const div = document.createElement('div');
            div.setAttribute('data-resumo-imovel', '');
            origemWrapper.appendChild(div);
            return div;
        })();
        bloco.innerHTML = resumoHtml;
    }

    // Descrição corrida (não tabela) + badge de status, mesmo padrão do
    // card/ficha de Imóvel no App (pedido explícito).
    const camposDefinidos = CAMPOS_POR_TIPO_ATIVO[a.tipo_ativo] || [];
    const dados = a.dados_especificos || {};
    const valoresPreenchidos = camposDefinidos
        .filter(c => dados[c.chave])
        .map(c => c.mascarar ? mascarar(dados[c.chave]) : escapeHtml(dados[c.chave]));
    const descricaoCorrida = valoresPreenchidos.length
        ? valoresPreenchidos.join(' · ')
        : 'Sem dados estruturados cadastrados ainda.';

    // NOVO (29/08/2026) — 3º estado 'vendido', mesma cor neutra já usada
    // pra "Suspenso"/"Finalizado" no resto do sistema (DS §14, "demais
    // estados" → slate) — não é sucesso (verde) nem erro (vermelho), é
    // só um encerramento normal do ciclo de vida do ativo.
    const badgeStatus = a.status === 'arquivado'
        ? `<span class="text-[11px] font-bold px-1.5 py-0.5 rounded flex-none" style="background:var(--danger-bg); color:var(--danger)">Arquivado</span>`
        : a.status === 'vendido'
        ? `<span class="text-[11px] font-bold px-1.5 py-0.5 rounded flex-none" style="background:#f1f5f9; color:#475569">Vendido</span>`
        : `<span class="text-[11px] font-bold px-1.5 py-0.5 rounded flex-none" style="background:var(--success-bg); color:var(--success)">Ativo</span>`;

    document.getElementById('fa-resumo-dados').innerHTML = `
        <div class="flex items-start justify-between gap-2">
            <p class="text-xs flex-1" style="color:var(--sage)">${descricaoCorrida}</p>
            ${badgeStatus}
        </div>`;

    refrescarIcones();
}

function documentosDoAtivo(ativoId) {
    return estado.documentos.filter(d => (d.cofre_documento_vinculos || []).some(v => v.entidade_tipo === 'ativo' && v.entidade_id === ativoId));
}

export async function excluirAtivoAtual() {
    const a = estado.ativoEmFoco;
    if (!a) return;
    if (!confirm(`Excluir "${a.nome_exibicao}"? Esta ação fica registrada e não pode ser desfeita pela interface.`)) return;
    try {
        await api.arquivarAtivo(a.id);
        await api.registrarLogAcessos(estado.clienteId, estado.pessoa.id, 'cofre.excluir', { ativoId: a.id, nome: a.nome_exibicao });
        mostrarToast('Ativo excluído.');
        fecharFichaAtivo();
        window.dispatchEvent(new CustomEvent('cofre:recarregar-eventos')); // BUG FIX 25/08/2026 — itens/ocorrências do ativo excluído continuavam nos alertas da Visão Geral
    } catch (err) { mostrarToast('Erro: ' + err.message, 'erro'); }
}

// NOVO (29/08/2026, pedido explícito) — "Marcar como vendido": diferente
// de Excluir (soft-delete, esconde da listagem principal), aqui o ativo
// muda de status pra 'vendido' e os itens de controle vinculados têm o
// alerta desligado em cascata (api.marcarAtivoVendido) — param de gerar
// aviso proativo (WhatsApp) e de acender badge de urgência na ficha, mas
// documentos/histórico continuam intactos. Mesma tela some da listagem
// principal (query já filtra status='ativo', igual arquivado) — se no
// futuro fizer sentido um filtro "ver vendidos/arquivados" na lista, é
// mudança separada, não pedida agora.
export async function marcarAtivoVendidoAtual() {
    const a = estado.ativoEmFoco;
    if (!a) return;
    if (!confirm(`Marcar "${a.nome_exibicao}" como vendido? Os itens de controle vinculados (seguro, manutenção, tributo) param de gerar alerta. O ativo some da listagem principal — histórico e documentos continuam preservados.`)) return;
    try {
        await api.marcarAtivoVendido(a.id);
        await api.registrarLogAcessos(estado.clienteId, estado.pessoa.id, 'cofre.editar', { ativoId: a.id, nome: a.nome_exibicao, acao: 'marcar_vendido' });
        mostrarToast('Ativo marcado como vendido — alertas desativados.');
        fecharFichaAtivo();
        window.dispatchEvent(new CustomEvent('cofre:recarregar-eventos')); // mesmo motivo do excluirAtivoAtual — itens desativados não devem continuar nos alertas da Visão Geral
    } catch (err) { mostrarToast('Erro: ' + err.message, 'erro'); }
}

// ---- Editar (secundário, dentro do Resumo — Adendo §7.2/§9.2)
export function alternarEditarAtivo() {
    const aberto = !document.getElementById('fa-editar-wrapper').classList.contains('hidden');
    if (aberto) { document.getElementById('fa-editar-wrapper').classList.add('hidden'); return; }
    const a = estado.ativoEmFoco;
    // Tipo exibido como somente-leitura (pedido explícito, 25/08/2026) —
    // não é um <select> editável de propósito: mudar o tipo_ativo depois
    // de criado trocaria todo o conjunto de campos estruturados
    // (CAMPOS_POR_TIPO_ATIVO), o que exigiria decidir o que fazer com
    // dados_especificos já preenchidos no formato antigo — fora de
    // escopo por ora, mas o tipo pelo menos fica visível no formulário
    // (antes só aparecia no cabeçalho da ficha, fora do form de editar).
    document.getElementById('fa-editar-campos').innerHTML =
        `<div class="sm:col-span-2"><label class="text-xs font-semibold block mb-1" style="color:var(--sage)">Tipo</label><input type="text" value="${escapeHtml(rotuloTipoAtivo(a.tipo_ativo))}" disabled class="w-full border-2 border-slate-200 rounded-xl p-2 text-sm bg-slate-50 text-slate-500"></div>` +
        `<div class="sm:col-span-2"><label class="text-xs font-semibold block mb-1">Nome de exibição</label><input type="text" id="fa-editar-nome" value="${escapeHtml(a.nome_exibicao)}" class="w-full border-2 border-slate-300 rounded-xl p-2 text-sm"></div>` +
        renderizarCamposEstruturados(a.tipo_ativo, a.dados_especificos || {}, 'fa-editar-campo-');
    document.getElementById('fa-editar-wrapper').classList.remove('hidden');
}

export async function salvarEdicaoAtivo() {
    const a = estado.ativoEmFoco;
    const nome = document.getElementById('fa-editar-nome').value.trim();
    if (!nome) { mostrarToast('Nome não pode ficar vazio.', 'erro'); return; }
    const dados = lerCamposEstruturados(a.tipo_ativo, 'fa-editar-campo-');
    try {
        await api.atualizarAtivo(a.id, { nome_exibicao: nome, dados_especificos: dados });
        await api.registrarLogAcessos(estado.clienteId, estado.pessoa.id, 'cofre.editar', { ativoId: a.id, acao: 'editar_ativo' });
        mostrarToast('Ativo atualizado ✅');
        window.dispatchEvent(new CustomEvent('cofre:recarregar-ativos'));
        await abrirFichaAtivo(a.id); // "Salvar edição → voltar para a ficha atualizada" (§9.2)
    } catch (err) { mostrarToast('Erro: ' + err.message, 'erro'); }
}

export function abrirGestaoImovel() {
    const a = estado.ativoEmFoco;
    if (a?.entidade_origem_tipo === 'imovel' && a.entidade_origem_id) {
        window.location.href = `./?abrir=imovel&ref=${encodeURIComponent(a.entidade_origem_id)}`;
    }
}

// ---- Documentos
function montarDocumentosAtivo(a) {
    const docs = documentosDoAtivo(a.id);
    // BUG FIX (26/08/2026, achado pelo usuário) — clicar num documento
    // aqui dentro (modal-documentos-ativo, legado, nunca redesenhado
    // junto do resto) dava erro e mostrava algo "como se estivesse
    // editando". Pedido explícito: retirar a opção de clique — vira só
    // listagem informativa (sem data-action) até esta tela ganhar o
    // mesmo tratamento completo que o box "Documento" do item de
    // controle já tem (abrir/remover/carregar novo).
    document.getElementById('fa-tab-documentos').innerHTML = docs.length
        ? docs.map(d => `<div class="w-full raiz-bloco-interno flex items-center gap-2"><i data-lucide="file-text" style="width:14px;height:14px;color:var(--sage);flex-shrink:0"></i><span class="text-sm truncate">${escapeHtml(d.nome_exibicao)}</span></div>`).join('')
        : `<p class="text-xs" style="color:var(--sage)">Nenhum documento vinculado a este ativo ainda.</p>`;
}

// ---- Documentos: upload agora é via modal-documentos-ativo (2 ações: IA/
// upload simples — cofre-documentos.js abrirUploadNoAtivoComIA/SemIA).
// A antiga abrirUploadNoAtivo() (fechava a ficha e ia pro upload global)
// foi removida — não fazia sentido depois que Documentos virou modal
// próprio dentro da ficha, sem precisar sair dela.

// ---- Alertas: box REMOVIDO da ficha do ativo (v6, pedido explícito) —
// alertas agora são 100% derivados de Itens de Controle (ver box
// "Controles" e a ficha própria de cada item, cofre-controles.js). Não
// existe mais cadastro de alerta avulso por ativo.

// ---- Contatos: REMOVIDO desta ficha (pedido explícito) — contatos agora
// vinculam a um Item de Controle, não ao Ativo direto. Ver
// js/cofre-controles.js (abrirFichaItemControle, box "Contatos vinculados").

// ---- Fotos (privado por padrão; "selecionada p/ Vitrine" ≠ publicado — Adendo §16/§17)
//
// Revisão DS (25/08/2026, pedido explícito) — box visível na ficha (só
// aparece quando há foto vinculada), não mais escondido atrás de um
// modal só alcançável pelo Mais ações. Miniaturas de verdade agora (o
// grid antigo só desenhava um ícone genérico cinza, nunca a foto real —
// resolvido via signed URL, mesmo mecanismo já usado pra abrir
// documento). Clicar abre lightbox com navegação entre as fotos (mesma
// referência do box de fotos dos Imóveis — abrirLightboxGeral no App).
// Remover foto e "Adicionar fotos" (Mais ações) inclusos.
let fotosAtivoCache = [];
let fotosAtivoUrlsCache = [];
let lightboxFotosIndex = 0;

async function montarFotosAtivo(a) {
    const fotos = await api.listarFotosAtivo(a.id);
    fotosAtivoCache = fotos;
    const box = document.getElementById('fa-box-fotos');
    // v1.93.0 (pedido explícito, "evoluir a exemplo do protótipo") — a
    // aba Fotos agora existe mesmo sem foto nenhuma (antes, o box inteiro
    // só existia como parte de uma lista de boxes empilhados — sem foto,
    // ele simplesmente não aparecia, e não tinha problema porque outros
    // boxes preenchiam a tela). Dentro de uma ABA própria, ficar em
    // branco pareceria tela quebrada — #fa-fotos-vazio (estado vazio com
    // call-to-action) alterna sempre no sentido OPOSTO de fa-box-fotos.
    const vazio = document.getElementById('fa-fotos-vazio');
    // BUG FIX (25/08/2026, achado pelo usuário) — o onchange do input só
    // era religado DEPOIS do return antecipado (sem foto nenhuma), então
    // pra um ativo zerado o clique em "Fotos"/"Adicionar fotos" abria o
    // seletor de arquivo, mas escolher uma foto não disparava nada —
    // sem listener nenhum plugado. Movido pra ANTES do return, sempre
    // religa independente de já existir foto ou não.
    const inputFoto = document.getElementById('fa-foto-input');
    inputFoto.value = '';
    inputFoto.onchange = () => enviarFotosAtivo(a.id);
    if (!fotos.length) {
        box.classList.add('hidden');
        if (vazio) vazio.classList.remove('hidden');
        fotosAtivoUrlsCache = [];
        return;
    }
    if (vazio) vazio.classList.add('hidden');
    box.classList.remove('hidden');
    fotosAtivoUrlsCache = await Promise.all(fotos.map(f => api.gerarSignedUrl(f.bucket, f.storage_path, 600).catch(() => null)));
    renderizarGridFotos();
}

function renderizarGridFotos() {
    const grid = document.getElementById('fa-fotos-grid');
    grid.innerHTML = fotosAtivoCache.map((f, i) => `
        <div class="relative flex-none">
            <img src="${fotosAtivoUrlsCache[i] || ''}" data-action="abrir-lightbox-foto-ativo" data-indice="${i}" class="w-16 h-16 object-cover rounded-lg border border-slate-200 cursor-pointer">
            <button data-action="remover-foto-ativo" data-foto-id="${f.id}" title="Remover" class="absolute -top-1.5 -right-1.5 bg-white border border-slate-300 rounded-full w-5 h-5 flex items-center justify-center shadow-sm"><i data-lucide="x" style="width:11px;height:11px;color:#64748b"></i></button>
        </div>`).join('');
    refrescarIcones();
}

async function enviarFotosAtivo(ativoId) {
    const arquivos = document.getElementById('fa-foto-input').files;
    const statusEl = document.getElementById('fa-status');
    if (!arquivos.length) return;
    statusEl.textContent = 'Enviando fotos…'; statusEl.style.color = 'var(--sage)';
    let ordem = fotosAtivoCache.length;
    for (const arquivo of arquivos) {
        const fotoId = crypto.randomUUID();
        const path = `${estado.clienteId}/ativos/${ativoId}/fotos/${fotoId}_${arquivo.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        try {
            await api.uploadArquivoDocumento(path, arquivo); // mesmo bucket/serviço de upload que documentos
            await api.inserirFotoAtivo({ id: fotoId, cliente_id: estado.clienteId, ativo_id: ativoId, bucket: 'cofre-documentos', storage_path: path, nome_arquivo: arquivo.name, ordem: ordem++, criado_por: estado.pessoa.id });
        } catch (err) {
            statusEl.textContent = '❌ ' + err.message; statusEl.style.color = 'var(--danger)';
        }
    }
    statusEl.textContent = 'Fotos enviadas ✅'; statusEl.style.color = 'var(--success)';
    document.getElementById('fa-box-fotos').classList.remove('hidden');
    await montarFotosAtivo(estado.ativoEmFoco);
}

export function alternarMaisAcoesFotosAtivo() {
    const el = document.getElementById('fa-fotos-acoes');
    const seta = document.getElementById('fa-fotos-seta');
    if (!el) return;
    el.classList.toggle('hidden');
    if (seta) seta.style.transform = el.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
    refrescarIcones();
}

export async function removerFotoAtivo(fotoId) {
    if (!confirm('Remover esta foto?')) return;
    try {
        await api.excluirFotoAtivo(fotoId);
        mostrarToast('Foto removida.');
        await montarFotosAtivo(estado.ativoEmFoco);
    } catch (err) { mostrarToast('Erro: ' + err.message, 'erro'); }
}

export function abrirLightboxFotoAtivo(indice) {
    lightboxFotosIndex = indice;
    document.getElementById('lightbox-fotos-img').src = fotosAtivoUrlsCache[lightboxFotosIndex] || '';
    document.getElementById('lightbox-fotos-contador').textContent = `${lightboxFotosIndex + 1} / ${fotosAtivoUrlsCache.length}`;
    abrirModal('modal-lightbox-fotos');
}

export function fecharLightboxFotoAtivo() {
    fecharModal('modal-lightbox-fotos');
}

export function navegarLightboxFotoAtivo(direcao) {
    const n = fotosAtivoUrlsCache.length;
    lightboxFotosIndex = (lightboxFotosIndex + direcao + n) % n;
    document.getElementById('lightbox-fotos-img').src = fotosAtivoUrlsCache[lightboxFotosIndex] || '';
    document.getElementById('lightbox-fotos-contador').textContent = `${lightboxFotosIndex + 1} / ${n}`;
}

export async function alternarVitrineFoto(fotoId, valor) {
    try {
        await api.alternarPublicarVitrineFoto(fotoId, valor);
        mostrarToast(valor ? 'Foto selecionada para a Vitrine (publicação real ainda não implementada — ver HANDOFF).' : 'Foto removida da seleção.', 'aviso');
    } catch (err) { mostrarToast('Erro: ' + err.message, 'erro'); }
}

// Histórico do Ativo removido (revisão DS, 25/08/2026) — pedido explícito:
// não deve ter opção "Histórico" no Mais ações do box do Ativo.
// api.listarHistoricoAtivo() (cofre-api.js) foi mantida — infraestrutura
// de log genérica, pode servir outro consumidor no futuro.
