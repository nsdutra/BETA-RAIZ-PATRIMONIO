// ============================================================================
// cofre-controles.js — Raiz Patrimônio · Cofre de Documentos
// Versão: 1.8.0 · 29/08/2026
//
// v1.8.0 — 2 pedidos explícitos do Nicola, mesma sessão:
//   1) BUG FIX (achado pelo usuário, print mostrando "Em dia" no resumo
//      da box Controles enquanto a ficha do item mostrava uma ocorrência
//      vencendo em 3 dias): itemResumoHtml() tinha o sort de
//      cofre_ocorrencias_controle invertido (descendente — pegava a
//      ocorrência mais DISTANTE) e não filtrava por status_execucao=
//      'aberto' antes de escolher qual mostrar. Corrigido pra mesmo
//      padrão já usado em renderizarFichaItemControleDetalhes (sort
//      ascendente) + filtro explícito. Mesmo bug corrigido em espelho no
//      servidor — ver diario-eventos v1.8 (fn_diario_cofre_item_
//      vencendo), que tinha uma versão irmã do mesmo problema.
//   2) itemResumoHtml() passa a respeitar item.alerta_ativo=false
//      (badge "Alertas desligados", neutro, em vez de chip de urgência)
//      — consequência da função "Marcar como vendido" nova
//      (cofre-ativos.js v1.3.0), que desativa alerta_ativo em cascata
//      nos itens do ativo vendido.
//
// v1.7.0 — pedido explícito do Nicola (revisão de mensagens pró-ativas):
// checkbox "documento anexo esperado" no cadastro de Subtipos de item de
// controle (categoria, não item individual) — abrirSubtiposControle(),
// salvarSubtipoControle(), editarSubtipoControle() e
// cancelarEdicaoSubtipo() passam a ler/gravar/popular
// #subtipo-documento-esperado; renderizarSubtiposControle() mostra badge
// 📎 (.raiz-badge-atributo) quando marcado. Alimenta a coluna nova
// cofre_controle_subtipos.documento_esperado, consumida pela varredura
// proativa solicitar.anexo_apolice do diario-eventos.
//
// v1.6.1 — 2 BUGS corrigidos (achados pelo usuário): (1) dropdown de
// "papel" do contato (formContatoItemHtml) usava valores que não batiam
// com o CHECK constraint real do banco (cofre_contatos_papel_check) —
// reescrito com os 7 valores válidos. (2) voltarFichaItemControle() ia
// sempre pra 'ficha-ativo', fixo — nova variável
// itemControleOrigemTela (gravada em abrirFichaItemControle()) faz
// "Voltar" respeitar a origem real (Home/Alertas/Ficha do Ativo).
//
// v1.6.0 — MODELOS DE ITEM DE CONTROLE POR TIPO DE ATIVO (pedido
// explícito): nova seção completa — abrirModelosControle()/
// fecharModelosControle()/salvarModeloControle()/
// renderizarModelosControle()/aoMudarTipoModeloControleForm() (mesmo
// padrão UX de Subtipos, mais campos). abrirFormControle() agora
// também carrega modelosCache e mostra pills "Usar modelo" filtradas
// pelo tipo_ativo do ativo em foco; nova aplicarModeloAoForm()
// pré-preenche o formulário de criação a partir do modelo escolhido.
//
// v1.5.1 — BUG FIX CRÍTICO (achado pelo usuário): confirmarTratarOcorrencia/
// confirmarReagendarOcorrencia/confirmarEstornarOcorrencia/
// excluirItemControleAtual nunca disparavam cofre:recarregar-eventos —
// só salvarItemControle/salvarEdicaoItem disparavam desde que o evento
// foi criado. Resultado: a Home ficava com estado.ocorrenciasAbertas
// congelado depois de qualquer uma dessas 4 ações, só um F5 resolvia.
// Cada função agora dispara o evento logo após confirmar a ação.
//
// v1.5.0 — DATA INÍCIO/FIM + GERAÇÃO RETROATIVA (pedido explícito):
// modais Criar/Editar item de controle ganharam campo "Data fim
// (opcional)" + seletor de direção (Início/Fim). Nova
// gerarOcorrenciasHorizonteRetroativo() — espelho de
// gerarOcorrenciasHorizonte() andando pra trás a partir da data fim em
// vez de pra frente a partir da data início. salvarItemControle()/
// salvarEdicaoItem() escolhem o gerador certo conforme direcao_alerta;
// a detecção de "mudou algo que impacta os alertas" (mudouFrequencia →
// renomeada mudouGeracaoAlertas) passou a incluir data_fim/
// direcao_alerta, não só frequência. Box "Dados do item" ganhou 3
// linhas novas (Data início/Data fim/Alertas gerados a partir de).
// Depende de migration cofre_itens_controle_data_fim_direcao_v1.
//
// v1.4.0 — GESTÃO DE SUBTIPOS DE ITEM DE CONTROLE (pedido explícito):
// nova seção completa — abrirSubtiposControle()/fecharSubtiposControle()/
// salvarSubtipoControle()/renderizarSubtiposControle() (lista agrupada
// por tipo, mesmo padrão UX de "Categorias de documento" em
// cofre-documentos.js). Ao salvar, atualiza subtiposCache na hora — um
// subtipo criado aqui já aparece no dropdown de "Novo item de controle"
// sem precisar recarregar a página.
//
// v1.3.0 — TELA DA FICHA DO ITEM DE CONTROLE REESCRITA (revisão DS,
// pedido explícito): título solto removido (só "< Voltar" + descrição);
// edição virou bottom-sheet Tipo B (abrirEditarItem/fecharEditarItem,
// substituindo o painel inline fic-editar-wrapper), com campos de
// frequência que antes só existiam na criação. NOVO — regenerar alertas
// ao editar: se a frequência mudar, pergunta (confirm()) se regenera as
// ocorrências FUTURAS em aberto ou mantém as existentes (nunca mexe em
// vencidas/concluídas). Boxes Ocorrência e Contatos redesenhados sem
// borda/fundo (padrão "itens a receber" do Imóvel); botão de Contatos
// virou pill de Mais ações (era CTA tracejado centralizado). Removida
// variável editandoItem (não precisa mais de estado inline).
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
import { abrirUploadContextual } from './cofre-documentos.js';
import {
    escapeHtml, formatarDataBR, diasAte, chipVencimento,
    rotuloTipoControle, rotuloStatusOcorrencia, rotuloFrequencia, rotuloTipoAtivo, iconeAtivo, rotuloPapelContato,
    aplicarMascaraTelefoneCofre, validarTelefoneBRCofre, validarEmailFormatoCofre, aplicarIndicadorValidacaoCofre, numeroWhatsAppComDDI,
} from './cofre-validacoes.js';

let subtiposCache = null; // carregado 1x por sessão; catálogo muda pouco
let modelosCache = null; // idem, pros modelos de item de controle por tipo de ativo
let modeloEmEdicao = null; // id do modelo sendo editado no momento, ou null (modo "criar novo")
let itensDoAtivoAtual = [];
let itemEmFoco = null;
// BUG FIX (25/08/2026, achado pelo usuário) — guarda a tela de onde a
// ficha do item foi aberta de verdade (Home, Alertas ou Ficha do
// Ativo), pra "< Voltar" não mentir. Antes ia sempre pra "ficha-ativo",
// fixo — clicar num alerta na Visão Geral e depois "Voltar" não voltava
// pra Visão Geral. Mesma classe de bug já corrigida no Imóveis
// (fichaImovelOrigemTab, index.html v1.61.5).
let itemControleOrigemTela = null;
let ocorrenciaEmAcao = null; // { ocorrenciaId, modo: 'tratar'|'reagendar'|'estornar' }
let contatosDoItemAtual = [];
let contatoEmEdicaoId = null; // id do contato sendo editado, ou null (modo "criar novo") — pedido explícito 25/08/2026

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
//
// BUG FIX (29/08/2026, achado pelo usuário — print mostrando "Em dia" no
// resumo enquanto a ficha do item mostrava uma ocorrência vencendo em 3
// dias): o sort aqui estava invertido (`x < y ? 1 : -1` = descendente),
// pegando a ocorrência MAIS DISTANTE no tempo em vez da mais próxima —
// oposto do sort correto já usado na ficha do item (renderizarFichaItem
// ControleDetalhes, mais abaixo, `x > y ? 1 : -1` = ascendente). Também
// faltava filtrar por status_execucao='aberto' ANTES de ordenar — sem
// isso, uma ocorrência já tratada com data antiga podia "vencer" a
// comparação mesmo havendo uma ocorrência aberta de verdade mais à
// frente. Corrigido pra filtrar primeiro, ordenar ascendente depois —
// mesmo padrão da ficha do item.
function itemResumoHtml(item) {
    // NOVO (29/08/2026) — item com alerta_ativo=false (ex.: ativo marcado
    // como vendido, cascata em marcarAtivoVendido) não mostra chip de
    // urgência — mostra "Alertas desligados" neutro, consistente com o
    // fato de que a varredura proativa também não vai gerar aviso nenhum
    // pra ele (mesmo campo usado nos dois lugares).
    if (item.alerta_ativo === false) {
        return `<button data-action="abrir-item-controle" data-id="${item.id}" class="w-full flex items-center gap-2 py-1.5 border-b border-slate-50 last:border-0 text-left">
            <svg data-lucide="bell-off" style="width:14px;height:14px;flex:none;color:var(--sage)"></svg>
            <div class="flex-1 min-w-0 text-xs font-bold truncate">${escapeHtml(item.titulo)} <span class="font-normal text-slate-400">· ${escapeHtml(item.cofre_controle_subtipos?.nome || rotuloTipoControle(item.tipo))}</span></div>
            <span class="text-[11px] font-bold px-1.5 py-0.5 rounded flex-none" style="background:#f1f5f9; color:#475569">Alertas desligados</span>
            <i data-lucide="chevron-right" style="width:14px;height:14px;flex:none;color:var(--sage)"></i>
        </button>`;
    }
    const abertas = (item.cofre_ocorrencias_controle || [])
        .filter(o => o.status_execucao === 'aberto')
        .slice()
        .sort((x, y) => (x.data_prevista_atual > y.data_prevista_atual ? 1 : -1));
    const oc = abertas[0];
    const dias = oc ? diasAte(oc.data_prevista_atual) : null;
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
    document.getElementById('fic-contatos-acoes')?.classList.add('hidden');
    // BUG FIX (25/08/2026) — só atualiza a origem se a navegação vem de
    // FORA da própria ficha (reabrir via recarregarFichaItemControle
    // depois de Tratar não deve perder a origem original).
    const telaAntes = document.querySelector('[data-screen]:not(.hidden)')?.dataset.screen;
    if (telaAntes && telaAntes !== 'ficha-item-controle') itemControleOrigemTela = telaAntes;
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
    const origem = itemControleOrigemTela;
    const ativo = estado.ativoEmFoco;
    itemEmFoco = null;
    itemControleOrigemTela = null;
    // BUG FIX (25/08/2026) — antes ia sempre pra 'ficha-ativo', fixo.
    // Agora respeita a tela de origem real — pode ter sido aberta a
    // partir de um alerta na Home ou na tela cheia de Alertas.
    const destino = (origem === 'home' || origem === 'alertas') ? origem : 'ficha-ativo';
    mudarTela(destino);
    if (destino === 'ficha-ativo' && ativo) montarControlesAtivo(ativo);
    // Garante dado fresco na tela de destino (ex.: item tratado/editado/
    // excluído durante a visita) — mesmo mecanismo que já mantém a
    // Visão Geral sincronizada em qualquer outro ponto do Cofre.
    window.dispatchEvent(new CustomEvent('cofre:recarregar-eventos'));
}

function renderizarFichaItemControle() {
    const item = itemEmFoco;

    // ---- Box Dados (revisão DS 25/08/2026, pedido explícito) — cabeçalho
    // agora no MESMO formato de letra/cor do componente de Ativo (ver
    // ativoCardHtml em cofre-ativos.js: w-12 h-12 rounded-xl bg-emerald-50
    // text-emerald-800, título text-xs font-extrabold, subtítulo
    // text-xs var(--sage)) — ícone representa o TIPO DO ATIVO dono do
    // item (iconeAtivo()), não mais um H3 solto genérico. Editar/Excluir
    // migraram de pills sempre visíveis pra um painel "Mais ações"
    // colapsável de verdade (DS §8 — antes só simulava o padrão sem o
    // toggle).
    document.getElementById('fic-dados-cabecalho').innerHTML = `
        <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center flex-none"><i data-lucide="${iconeAtivo(item.cofre_ativos?.tipo_ativo)}" style="width:20px;height:20px"></i></div>
            <div class="min-w-0 flex-1">
                <p class="text-xs font-extrabold truncate">${escapeHtml(item.titulo)}</p>
                <p class="text-xs truncate" style="color:var(--sage)">${escapeHtml(item.cofre_ativos?.nome_exibicao || '')}${item.cofre_ativos?.nome_exibicao ? ' · ' : ''}${escapeHtml(rotuloTipoControle(item.tipo))}</p>
            </div>
        </div>
    `;
    document.getElementById('fic-dados-leitura').innerHTML = `
        <div class="flex justify-between border-b pb-1"><span style="color:var(--sage)">Tipo</span><b>${escapeHtml(rotuloTipoControle(item.tipo))}</b></div>
        <div class="flex justify-between border-b pb-1"><span style="color:var(--sage)">Subtipo</span><b>${escapeHtml(item.cofre_controle_subtipos?.nome || '—')}</b></div>
        <div class="flex justify-between border-b pb-1"><span style="color:var(--sage)">Data início</span><b>${formatarDataBR(item.data_base)}</b></div>
        <div class="flex justify-between border-b pb-1"><span style="color:var(--sage)">Data fim</span><b>${item.data_fim ? formatarDataBR(item.data_fim) : 'Sem fim de vigência'}</b></div>
        <div class="flex justify-between border-b pb-1"><span style="color:var(--sage)">Frequência</span><b>${escapeHtml(rotuloFrequencia(item.frequencia_intervalo, item.frequencia_unidade))}</b></div>
        <div class="flex justify-between border-b pb-1"><span style="color:var(--sage)">Alertas gerados a partir de</span><b>${item.direcao_alerta === 'fim' ? 'Fim (retroativo)' : 'Início'}</b></div>
        <div class="flex justify-between border-b pb-1"><span style="color:var(--sage)">Antecedência do alerta</span><b>${item.antecedencia_alerta_dias} dias</b></div>
    `;
    renderizarDocumentosItemControle();

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

    // ---- Box Contatos vinculados — revisão DS 25/08/2026 (pedido
    // explícito): linhas agora CLICÁVEIS (abrem bottom-sheet de editar/
    // excluir — abrirEditarContatoItem), rótulo de papel amigável
    // (rotuloPapelContato, antes mostrava o código bruto tipo
    // "seguradora"), e atalho de WhatsApp por contato (só aparece se o
    // contato tiver whatsapp cadastrado) — mesma mensagem padrão já
    // usada no atalho "Acionar" da Visão Geral (acionarContatoAlerta em
    // cofre-documentos.js), pedindo cotação de renovação.
    const elContatos = document.getElementById('fic-contatos');
    const listaContatos = contatosDoItemAtual.length
        ? contatosDoItemAtual.map((c, idx) => `<div class="flex items-center gap-2 py-1.5 ${idx < contatosDoItemAtual.length - 1 ? 'border-b border-slate-50' : ''}">
            <button data-action="abrir-editar-contato-item" data-id="${c.id}" class="flex-1 min-w-0 text-left">
                <p class="text-xs font-bold truncate">${escapeHtml(c.nome)}</p>
                <p class="text-[11px]" style="color:var(--sage)">${escapeHtml(rotuloPapelContato(c.papel))}${c.whatsapp ? ' · ' + escapeHtml(c.whatsapp) : ''}</p>
            </button>
            ${c.whatsapp ? `<button data-action="acionar-contato-item-direto" data-id="${c.id}" title="Chamar no WhatsApp" class="flex-none p-1.5"><i data-lucide="message-circle" style="width:15px;height:15px;color:#25D366"></i></button>` : ''}
        </div>`).join('')
        : `<p class="text-xs" style="color:var(--sage)">Nenhum contato vinculado a este item.</p>`;
    elContatos.innerHTML = listaContatos;

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

// Novos toggles (25/08/2026, pedido explícito) — mesmo corpo canônico
// (DS §8.2), só trocam os 2 IDs.
export function alternarMaisAcoesDadosItem() {
    const el = document.getElementById('fic-dados-acoes');
    const seta = document.getElementById('fic-dados-seta');
    if (!el) return;
    el.classList.toggle('hidden');
    if (seta) seta.style.transform = el.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
    refrescarIcones();
}

export function alternarMaisAcoesDocItem() {
    const el = document.getElementById('fic-doc-acoes');
    const seta = document.getElementById('fic-doc-seta');
    if (!el) return;
    el.classList.toggle('hidden');
    if (seta) seta.style.transform = el.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
    refrescarIcones();
}

// Box Documento (25/08/2026, pedido explícito) — mesma referência de box
// de documento que existe nos Imóveis: consulta direta em
// cofre_documento_vinculos (entidade_tipo='item_controle'), abre via
// abrirFichaDocumento() já existente (mesmo caminho usado no resto do
// Cofre — nunca inventei um jeito novo de abrir arquivo). Depende da
// migration cofre_documento_vinculos_item_controle_v1 (adiciona
// 'item_controle' ao CHECK de entidade_tipo) — sem ela, a lista sempre
// vem vazia (não quebra, só não encontra nada pra mostrar).
function documentosDoItemControle(itemId) {
    return (estado.documentos || []).filter(d => (d.cofre_documento_vinculos || []).some(v => v.entidade_tipo === 'item_controle' && v.entidade_id === itemId));
}

export function renderizarDocumentosItemControle() {
    const item = itemEmFoco;
    if (!item) return;
    const docsItem = documentosDoItemControle(item.id);
    const el = document.getElementById('fic-documentos');
    if (!el) return;
    el.innerHTML = docsItem.length ? docsItem.map(d => {
        const vinculo = (d.cofre_documento_vinculos || []).find(v => v.entidade_tipo === 'item_controle' && v.entidade_id === item.id);
        return `<div class="flex items-center gap-2 border border-slate-100 rounded-lg p-2">
            <button data-action="abrir-documento" data-id="${d.id}" class="flex items-center gap-2 flex-1 min-w-0 text-left">
                <i data-lucide="${(d.mime_type || '').startsWith('image/') ? 'image' : 'file-text'}" style="width:14px;height:14px;color:#64748b;flex-shrink:0"></i>
                <span class="text-xs font-bold truncate">${escapeHtml(d.nome_exibicao || 'Documento')}</span>
            </button>
            <button data-action="excluir-documento-do-item" data-vinculo-id="${vinculo?.id || ''}" title="Remover deste item" class="flex-none p-1"><i data-lucide="x" style="width:14px;height:14px;color:#94a3b8"></i></button>
        </div>`;
    }).join('') : `<p class="text-xs" style="color:var(--sage)">Nenhum documento vinculado ainda.</p>`;
    refrescarIcones();
}

// "Carregar novo" (dentro do Mais ações deste box, pedido explícito) —
// reaproveita o modal de upload genérico já existente (mesmo usado por
// Ativo/Imóvel/Contrato), sem nenhum código de upload novo.
export function carregarNovoDocumentoItem() {
    const item = itemEmFoco;
    if (!item) return;
    abrirUploadContextual('item_controle', item.id, item.titulo);
}

// Remove só o VÍNCULO (nunca o documento em si) — o documento continua
// guardado no Cofre e passa a aparecer em "Em triagem" na Visão Geral
// (classificarStatusVinculo já trata isso automaticamente pra qualquer
// documento sem vínculo nenhum — nenhum código novo precisou disso).
export async function excluirDocumentoDoItem(vinculoId) {
    if (!vinculoId) { mostrarToast('Vínculo não encontrado.', 'erro'); return; }
    if (!confirm('Remover este documento do item?\n\nO documento continua guardado no Cofre — só desvincula dele (some da lista "Em triagem" só quando for vinculado a outra coisa).')) return;
    try {
        await api.removerVinculo(vinculoId);
        estado.documentos = await api.listarDocumentos(estado.clienteId);
        renderizarDocumentosItemControle();
        mostrarToast('Documento desvinculado.');
        window.dispatchEvent(new CustomEvent('cofre:recarregar-documentos'));
    } catch (err) { mostrarToast('Erro: ' + err.message, 'erro'); }
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
        // BUG FIX (25/08/2026, achado pelo usuário) — faltava isto aqui e
        // nas 4 funções vizinhas (reagendar/estornar/excluir item/excluir
        // ativo): recarregarFichaItemControle() só atualiza a TELA do
        // item em si; sem disparar este evento, estado.ocorrenciasAbertas
        // nunca era refeito, então a Visão Geral (Home) ficava com dado
        // congelado até um F5. Só salvarItemControle()/salvarEdicaoItem()
        // disparavam — os outros 5 pontos de mudança de ocorrência nunca
        // dispararam desde que o evento foi criado.
        window.dispatchEvent(new CustomEvent('cofre:recarregar-eventos'));
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
        window.dispatchEvent(new CustomEvent('cofre:recarregar-eventos')); // BUG FIX 25/08/2026 — ver nota em confirmarTratarOcorrencia
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
        window.dispatchEvent(new CustomEvent('cofre:recarregar-eventos')); // BUG FIX 25/08/2026 — ver nota em confirmarTratarOcorrencia
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
    document.getElementById('fic-ed-tipo').value = item.tipo;
    popularSelectSubtipoEm('fic-ed-subtipo', item.tipo, item.subtipo_id);
    document.getElementById('fic-ed-titulo').value = item.titulo;
    document.getElementById('fic-ed-data-inicio').value = item.data_base || '';
    document.getElementById('fic-ed-data-fim').value = item.data_fim || '';
    document.getElementById('fic-ed-direcao-alerta').value = item.direcao_alerta || 'inicio';
    document.getElementById('fic-ed-freq-intervalo').value = item.frequencia_intervalo || '';
    document.getElementById('fic-ed-freq-unidade').value = item.frequencia_unidade || 'mes';
    document.getElementById('fic-ed-antecedencia').value = item.antecedencia_alerta_dias;
    abrirModal('modal-editar-item-controle');
}

export function aoMudarTipoEditarItemForm() {
    popularSelectSubtipoEm('fic-ed-subtipo', document.getElementById('fic-ed-tipo').value, null);
}

export function fecharEditarItem() {
    fecharModal('modal-editar-item-controle');
}

export async function salvarEdicaoItem() {
    const tipo = document.getElementById('fic-ed-tipo').value;
    const titulo = document.getElementById('fic-ed-titulo').value.trim();
    const subtipoId = document.getElementById('fic-ed-subtipo').value || null;
    const dataInicio = document.getElementById('fic-ed-data-inicio').value;
    const dataFim = document.getElementById('fic-ed-data-fim').value || null;
    const direcaoAlerta = document.getElementById('fic-ed-direcao-alerta').value;
    const freqIntervalo = parseInt(document.getElementById('fic-ed-freq-intervalo').value, 10) || null;
    const freqUnidade = freqIntervalo ? document.getElementById('fic-ed-freq-unidade').value : null;
    const antecedencia = parseInt(document.getElementById('fic-ed-antecedencia').value, 10) || 0;
    if (!titulo) { mostrarToast('Informe um título.', 'erro'); return; }
    if (!dataInicio) { mostrarToast('Informe a data início.', 'erro'); return; }
    if (direcaoAlerta === 'fim' && !dataFim) { mostrarToast('Pra gerar a partir do fim, informe a data fim.', 'erro'); return; }
    if (dataFim && dataFim < dataInicio) { mostrarToast('A data fim não pode ser antes da data início.', 'erro'); return; }

    const item = itemEmFoco;
    // Campos que, se mudarem, afetam quais ocorrências futuras fazem
    // sentido existir. Antecedência do alerta NÃO entra aqui — só afeta
    // o cálculo do chip em tempo real (ocorrenciaEmAlerta em
    // cofre-validacoes.js), não as datas já gravadas. Revisão 25/08/2026
    // (pedido explícito): data início entrou nessa lista também — mudar
    // o início muda a base de contagem no modo "início" da mesma forma
    // que data fim muda no modo "fim".
    const mudouGeracaoAlertas = (freqIntervalo !== item.frequencia_intervalo) || (freqUnidade !== item.frequencia_unidade)
        || (dataFim !== (item.data_fim || null)) || (direcaoAlerta !== (item.direcao_alerta || 'inicio')) || (dataInicio !== item.data_base);

    try {
        const antes = { tipo: item.tipo, titulo: item.titulo, subtipo_id: item.subtipo_id, frequencia_intervalo: item.frequencia_intervalo, frequencia_unidade: item.frequencia_unidade, antecedencia_alerta_dias: item.antecedencia_alerta_dias, data_base: item.data_base, data_fim: item.data_fim, direcao_alerta: item.direcao_alerta };
        const depois = { tipo, titulo, subtipo_id: subtipoId, recorrente: !!freqIntervalo, frequencia_intervalo: freqIntervalo, frequencia_unidade: freqUnidade, antecedencia_alerta_dias: antecedencia, data_base: dataInicio, data_fim: dataFim, direcao_alerta: direcaoAlerta };
        await api.atualizarItemControle(item.id, depois);
        await api.registrarHistoricoItemControle({ item_id: item.id, acao: 'editar', antes, depois, pessoa_id: estado.pessoa.id, origem: 'app' });

        if (mudouGeracaoAlertas) {
            // Pedido explícito: mudança que impacta os alertas possíveis
            // pergunta se regera as ocorrências FUTURAS em aberto (não
            // mexe nas já vencidas — essas continuam pendentes de
            // verdade, independente da frequência ter mudado) ou mantém
            // as que já existem. confirm() nativo — mesmo padrão já
            // usado em excluirItemControleAtual/excluirAtivoAtual pra
            // decisões simples de sim/não.
            const regenerar = confirm(
                'Você mudou algo que afeta os alertas deste item (data início, data fim, frequência ou direção de geração).\n\n' +
                'Regenerar as ocorrências futuras em aberto com as novas regras?\n\n' +
                'OK = Regenerar (as já vencidas continuam como estão)\n' +
                'Cancelar = Manter as ocorrências que já existem'
            );
            if (regenerar) {
                const hojeISO = new Date().toISOString().slice(0, 10);
                await api.excluirOcorrenciasAbertasFuturasDoItem(item.id, hojeISO);
                const itemAtualizado = { ...item, ...depois };
                // Revisão 25/08/2026 — regenerar respeita a direção
                // escolhida: "fim" ancora retroativamente na data fim
                // nova, "inicio" mantém o comportamento de sempre
                // (pra frente a partir de hoje).
                const payloads = direcaoAlerta === 'fim'
                    ? gerarOcorrenciasHorizonteRetroativo(itemAtualizado, dataFim, freqIntervalo, freqUnidade)
                    : gerarOcorrenciasHorizonte(itemAtualizado, hojeISO, freqIntervalo, freqUnidade);
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
    const item = itemEmFoco;
    if (!confirm(`Excluir o item de controle "${item.titulo}"?\n\nTodas as ocorrências/alertas deste item somem junto da Visão Geral. Isso fica registrado e não pode ser desfeito pela interface.`)) return;

    // Documentos vinculados a este item (pedido explícito, 25/08/2026) —
    // pergunta SEPARADA, só se houver algum: apagar de vez, ou manter
    // (nesse caso só desvincula — o documento continua guardado no
    // Cofre e passa a aparecer em "Em triagem" na Visão Geral,
    // classificarStatusVinculo já trata isso sozinho pra qualquer
    // documento sem vínculo nenhum).
    const docsDoItem = documentosDoItemControle(item.id);
    let apagarDocumentos = false;
    if (docsDoItem.length > 0) {
        apagarDocumentos = confirm(
            `Este item tem ${docsDoItem.length} documento(s) vinculado(s) ("${docsDoItem.map(d => d.nome_exibicao).join('", "')}")\n\n` +
            `Quer apagar o(s) documento(s) também?\n\n` +
            `OK = Apagar de vez (não pode ser desfeito pela interface)\n` +
            `Cancelar = Manter guardado — fica pendente de vincular ("Em triagem" na Visão Geral)`
        );
    }

    try {
        await api.arquivarItemControle(item.id);
        await api.registrarHistoricoItemControle({ item_id: item.id, acao: 'excluir', antes: item, depois: null, pessoa_id: estado.pessoa.id, origem: 'app' });
        await api.registrarLogAcessos(estado.clienteId, estado.pessoa.id, 'cofre.controle.desativar', { itemId: item.id });

        for (const d of docsDoItem) {
            const vinculo = (d.cofre_documento_vinculos || []).find(v => v.entidade_tipo === 'item_controle' && v.entidade_id === item.id);
            if (apagarDocumentos) {
                await api.excluirDocumentoCompleto(d.id);
            } else if (vinculo) {
                await api.removerVinculo(vinculo.id);
            }
        }
        if (docsDoItem.length > 0) {
            estado.documentos = await api.listarDocumentos(estado.clienteId);
            window.dispatchEvent(new CustomEvent('cofre:recarregar-documentos'));
        }

        mostrarToast(docsDoItem.length > 0
            ? `Item excluído — documento(s) ${apagarDocumentos ? 'apagado(s)' : 'mantido(s), pendente(s) de vincular'}.`
            : 'Item de controle excluído.');
        voltarFichaItemControle();
        window.dispatchEvent(new CustomEvent('cofre:recarregar-eventos')); // BUG FIX 25/08/2026 — ver nota em confirmarTratarOcorrencia
    } catch (err) { mostrarToast('Erro: ' + err.message, 'erro'); }
}

// ---- Alertas vinculados: REMOVIDO (v6) — não existe mais cadastro de
// alerta avulso; a ocorrência (box "Ocorrências" acima) já é o alerta.

// ---- Contatos vinculados ao item (revisão DS 25/08/2026, pedido
// explícito) — formulário inline (raiz-form-borda) virou bottom-sheet
// Tipo B de verdade (modal-editar-contato-item, DS §9), reaproveitado
// tanto pra criar quanto editar (contatoEmEdicaoId decide qual). Ganhou
// "todos os campos" da tabela (empresa/telefone/observação, antes
// ausentes da interface) + opção de excluir.
// Liga a máscara/validação nos 3 campos (telefone/whatsapp/e-mail) —
// chamada pelas 2 funções de abrir modal abaixo, tanto faz criar ou
// editar (reatribuir .oninput toda vez é inofensivo). Reaplica a
// validação imediatamente após preencher o campo, pra um valor já
// salvo (modo editar) já nascer mostrando ✅ se for válido, sem
// precisar o usuário digitar algo primeiro.
function ligarMascaraEValidacaoContato() {
    const telInput = document.getElementById('ct-ed-telefone');
    const waInput = document.getElementById('ct-ed-whatsapp');
    const emailInput = document.getElementById('ct-ed-email');
    telInput.oninput = () => { aplicarMascaraTelefoneCofre(telInput); aplicarIndicadorValidacaoCofre('ct-ed-telefone-indicador', validarTelefoneBRCofre(telInput.value), 'Telefone válido'); };
    waInput.oninput = () => { aplicarMascaraTelefoneCofre(waInput); aplicarIndicadorValidacaoCofre('ct-ed-whatsapp-indicador', validarTelefoneBRCofre(waInput.value), 'WhatsApp válido'); };
    emailInput.oninput = () => { aplicarIndicadorValidacaoCofre('ct-ed-email-indicador', validarEmailFormatoCofre(emailInput.value), 'E-mail válido'); };
    aplicarIndicadorValidacaoCofre('ct-ed-telefone-indicador', validarTelefoneBRCofre(telInput.value), 'Telefone válido');
    aplicarIndicadorValidacaoCofre('ct-ed-whatsapp-indicador', validarTelefoneBRCofre(waInput.value), 'WhatsApp válido');
    aplicarIndicadorValidacaoCofre('ct-ed-email-indicador', validarEmailFormatoCofre(emailInput.value), 'E-mail válido');
}

export function abrirNovoContatoItem() {
    contatoEmEdicaoId = null;
    document.getElementById('ct-ed-papel').value = 'seguradora';
    document.getElementById('ct-ed-nome').value = '';
    document.getElementById('ct-ed-empresa').value = '';
    document.getElementById('ct-ed-telefone').value = '';
    document.getElementById('ct-ed-whatsapp').value = '';
    document.getElementById('ct-ed-email').value = '';
    document.getElementById('ct-ed-observacao').value = '';
    document.getElementById('modal-editar-contato-item-titulo').textContent = 'Novo contato';
    document.getElementById('ct-ed-excluir-wrapper').classList.add('hidden');
    ligarMascaraEValidacaoContato();
    abrirModal('modal-editar-contato-item');
}

export function abrirEditarContatoItem(contatoId) {
    const c = contatosDoItemAtual.find(x => x.id === contatoId);
    if (!c) return;
    contatoEmEdicaoId = contatoId;
    document.getElementById('ct-ed-papel').value = c.papel;
    document.getElementById('ct-ed-nome').value = c.nome;
    document.getElementById('ct-ed-empresa').value = c.empresa || '';
    document.getElementById('ct-ed-telefone').value = c.telefone || '';
    document.getElementById('ct-ed-whatsapp').value = c.whatsapp || '';
    document.getElementById('ct-ed-email').value = c.email || '';
    document.getElementById('ct-ed-observacao').value = c.observacao || '';
    document.getElementById('modal-editar-contato-item-titulo').textContent = 'Editar contato';
    document.getElementById('ct-ed-excluir-wrapper').classList.remove('hidden');
    ligarMascaraEValidacaoContato();
    abrirModal('modal-editar-contato-item');
}

export function fecharEditarContatoItem() {
    fecharModal('modal-editar-contato-item');
}

export async function salvarContatoItemModal() {
    const nome = document.getElementById('ct-ed-nome').value.trim();
    if (!nome) { mostrarToast('Informe o nome do contato.', 'erro'); return; }
    const payload = {
        papel: document.getElementById('ct-ed-papel').value, nome,
        empresa: document.getElementById('ct-ed-empresa').value.trim() || null,
        telefone: document.getElementById('ct-ed-telefone').value.trim() || null,
        whatsapp: document.getElementById('ct-ed-whatsapp').value.trim() || null,
        email: document.getElementById('ct-ed-email').value.trim() || null,
        observacao: document.getElementById('ct-ed-observacao').value.trim() || null,
    };
    try {
        if (contatoEmEdicaoId) {
            await api.atualizarContato(contatoEmEdicaoId, payload);
            mostrarToast('Contato atualizado ✅');
        } else {
            await api.criarContato({ cliente_id: estado.clienteId, item_controle_id: itemEmFoco.id, ...payload });
            mostrarToast('Contato salvo ✅');
        }
        fecharModal('modal-editar-contato-item');
        await recarregarFichaItemControle();
    } catch (err) { mostrarToast('Erro: ' + err.message, 'erro'); }
}

export async function excluirContatoItemModal() {
    if (!contatoEmEdicaoId) return;
    if (!confirm('Excluir este contato?')) return;
    try {
        await api.excluirContato(contatoEmEdicaoId);
        mostrarToast('Contato excluído.');
        fecharModal('modal-editar-contato-item');
        await recarregarFichaItemControle();
    } catch (err) { mostrarToast('Erro: ' + err.message, 'erro'); }
}

// Atalho de WhatsApp direto na lista (pedido explícito) — mesma
// mensagem padrão já usada em acionarContatoAlerta() (cofre-documentos.js,
// Visão Geral), pra manter consistência entre os 2 pontos de contato.
export function acionarContatoItemDireto(contatoId) {
    const c = contatosDoItemAtual.find(x => x.id === contatoId);
    if (!c || !c.whatsapp) { mostrarToast('Este contato não tem WhatsApp cadastrado.', 'erro'); return; }
    const item = itemEmFoco;
    const descricaoItem = item.tipo ? `${item.titulo} (${rotuloTipoControle(item.tipo)})` : item.titulo;
    const mensagem = `Olá! Poderia nos enviar uma cotação atualizada para a renovação do item de controle "${descricaoItem}"? Obrigado!`;
    // BUG FIX (25/08/2026, achado pelo usuário) — link não ia corretamente
    // pro WhatsApp quando o contato foi salvo só com DDD+número, sem o
    // DDI (55) na frente. numeroWhatsAppComDDI() garante o prefixo.
    const numero = numeroWhatsAppComDDI(c.whatsapp);
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`, '_blank', 'noopener');
}

// ============================================================================
// CRIAR ITEM DE CONTROLE (formulário na ficha do ativo)
// ============================================================================
export async function abrirFormControle() {
    if (!subtiposCache) {
        try { subtiposCache = await api.listarSubtiposControle(estado.clienteId); }
        catch (err) { mostrarToast('Erro ao carregar catálogo: ' + err.message, 'erro'); return; }
    }
    if (!modelosCache) {
        try { modelosCache = await api.listarModelosItemControle(estado.clienteId); }
        catch (err) { modelosCache = []; /* não bloqueia a criação manual se os modelos falharem ao carregar */ }
    }
    document.getElementById('ic-tipo').value = 'seguro';
    popularSelectSubtipo('seguro');
    document.getElementById('ic-titulo').value = '';
    document.getElementById('ic-data-base').value = '';
    document.getElementById('ic-data-fim').value = '';
    document.getElementById('ic-direcao-alerta').value = 'inicio';
    document.getElementById('ic-freq-intervalo').value = '';
    document.getElementById('ic-freq-unidade').value = 'mes';
    document.getElementById('ic-antecedencia').value = '7';
    renderizarModelosSugeridosForm();
    abrirModal('modal-criar-item-controle');
}

// Modelos sugeridos (pedido explícito, 25/08/2026) — pills clicáveis no
// topo do formulário, filtradas pelo tipo_ativo do ativo em foco. Clicar
// aplica os campos do modelo (aplicarModeloAoForm) — usuário ainda pode
// ajustar tudo antes de salvar, é só um atalho de preenchimento.
function renderizarModelosSugeridosForm() {
    const el = document.getElementById('ic-modelos-sugeridos');
    const ativo = estado.ativoEmFoco;
    const modelos = (modelosCache || []).filter(m => m.tipo_ativo === ativo?.tipo_ativo);
    if (!ativo || !modelos.length) { el.classList.add('hidden'); el.innerHTML = ''; return; }
    el.classList.remove('hidden');
    el.innerHTML = `<p class="text-[11px] font-semibold mb-1" style="color:var(--sage)">Usar modelo</p>
        <div class="flex flex-wrap gap-1.5">
            ${modelos.map(m => `<button type="button" data-action="usar-modelo-controle" data-id="${m.id}" class="text-[11px] font-bold px-2.5 py-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300">${escapeHtml(m.titulo_sugerido)}</button>`).join('')}
        </div>`;
}

export function aplicarModeloAoForm(modeloId) {
    const m = (modelosCache || []).find(x => x.id === modeloId);
    if (!m) return;
    document.getElementById('ic-tipo').value = m.tipo;
    popularSelectSubtipoEm('ic-subtipo', m.tipo, m.subtipo_id);
    document.getElementById('ic-titulo').value = m.titulo_sugerido;
    document.getElementById('ic-freq-intervalo').value = m.frequencia_intervalo || '';
    if (m.frequencia_unidade) document.getElementById('ic-freq-unidade').value = m.frequencia_unidade;
    document.getElementById('ic-antecedencia').value = m.antecedencia_alerta_dias;
    mostrarToast(`Modelo "${m.titulo_sugerido}" aplicado — só falta a data início.`);
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
    const dataFim = document.getElementById('ic-data-fim').value || null;
    const direcaoAlerta = document.getElementById('ic-direcao-alerta').value;
    const freqIntervalo = parseInt(document.getElementById('ic-freq-intervalo').value, 10) || null;
    const freqUnidade = freqIntervalo ? document.getElementById('ic-freq-unidade').value : null;
    const antecedencia = parseInt(document.getElementById('ic-antecedencia').value, 10) || 0;

    if (!titulo) { mostrarToast('Informe um título para o item de controle.', 'erro'); return; }
    if (!dataBase) { mostrarToast('Informe a data início.', 'erro'); return; }
    // Pedido explícito (25/08/2026): gerar retroativo exige saber a partir
    // de onde contar pra trás — sem data fim não tem como.
    if (direcaoAlerta === 'fim' && !dataFim) { mostrarToast('Pra gerar a partir do fim, informe a data fim.', 'erro'); return; }
    if (dataFim && dataFim < dataBase) { mostrarToast('A data fim não pode ser antes da data início.', 'erro'); return; }

    try {
        const item = await api.criarItemControle({
            cliente_id: estado.clienteId, ativo_id: a.id, tipo, subtipo_id: subtipoId, titulo,
            recorrente: !!freqIntervalo, frequencia_intervalo: freqIntervalo, frequencia_unidade: freqUnidade,
            data_base: dataBase, data_fim: dataFim, direcao_alerta: direcaoAlerta,
            alerta_ativo: true, antecedencia_alerta_dias: antecedencia,
            origem: 'manual', criado_por: estado.pessoa.id,
        });
        await api.registrarHistoricoItemControle({ item_id: item.id, acao: 'criar', antes: null, depois: item, pessoa_id: estado.pessoa.id, origem: 'app' });

        // v6 (pedido explícito): ao criar o item, já lança TODAS as ocorrências
        // dentro do horizonte de 120 dias (não só a 1ª) — respeitando a
        // frequência do item. Item não-recorrente: gera só 1, na data base
        // (mesmo que fora do horizonte, pra sempre ter algo a mostrar).
        // Revisão 25/08/2026 — direção de geração escolhida pelo usuário:
        // "inicio" mantém a lógica de sempre (pra frente a partir da data
        // início); "fim" gera retroativamente a partir da data fim.
        const payloads = direcaoAlerta === 'fim'
            ? gerarOcorrenciasHorizonteRetroativo(item, dataFim, freqIntervalo, freqUnidade)
            : gerarOcorrenciasHorizonte(item, dataBase, freqIntervalo, freqUnidade);
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

// Revisão 25/08/2026 (pedido explícito) — espelho retroativo de
// gerarOcorrenciasHorizonte(): em vez de contar PRA FRENTE a partir da
// data início até o horizonte de 120 dias, conta PRA TRÁS a partir da
// data fim, na frequência escolhida (ex.: fim=31/12/2026, 1×/semana →
// ocorrências toda semana contando de trás pra frente a partir de
// 31/12). Isso importa quando a data início não está "alinhada" com o
// ciclo desejado — ex.: um contrato de serviço que sempre vence numa
// sexta-feira específica, mas cuja data início foi uma terça qualquer.
// Mantém as mesmas garantias da versão pra frente: pelo menos 1
// ocorrência sempre, guarda de 60 no máximo. Limite pra trás simétrico
// ao horizonte pra frente (HORIZONTE_DIAS) — evita gerar uma pilha de
// ocorrências antigas pra item recorrente de longa data (ex.: semanal
// desde 5 anos atrás).
function gerarOcorrenciasHorizonteRetroativo(item, dataFim, freqIntervalo, freqUnidade) {
    const camposComuns = { cliente_id: estado.clienteId, item_controle_id: item.id, alerta_habilitado: !!item.alerta_ativo, status_execucao: 'aberto' };
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    const limiteAntigo = new Date(hoje); limiteAntigo.setDate(limiteAntigo.getDate() - HORIZONTE_DIAS);
    const limiteAntigoISO = limiteAntigo.toISOString().slice(0, 10);

    if (!freqIntervalo || !freqUnidade) {
        return [{ ...camposComuns, competencia: primeiroDiaDoMes(dataFim), data_prevista_original: dataFim, data_prevista_atual: dataFim }];
    }

    const payloads = [];
    let dataAtual = dataFim;
    let guarda = 0;
    while (dataAtual >= limiteAntigoISO && guarda < MAX_OCORRENCIAS_GERADAS) {
        payloads.push({ ...camposComuns, competencia: primeiroDiaDoMes(dataAtual), data_prevista_original: dataAtual, data_prevista_atual: dataAtual });
        dataAtual = dataAnterior(dataAtual, freqUnidade, freqIntervalo);
        guarda++;
    }
    // Se a data fim já nasce antes do limite antigo (ex.: venceu há mais
    // de 120 dias), ainda assim garante pelo menos essa 1ª ocorrência.
    if (!payloads.length) {
        payloads.push({ ...camposComuns, competencia: primeiroDiaDoMes(dataFim), data_prevista_original: dataFim, data_prevista_atual: dataFim });
    }
    return payloads;
}

function dataAnterior(dataISO, unidade, intervalo) {
    const d = new Date(dataISO + 'T00:00:00');
    if (unidade === 'dia') d.setDate(d.getDate() - intervalo);
    else if (unidade === 'semana') d.setDate(d.getDate() - intervalo * 7);
    else if (unidade === 'mes') d.setMonth(d.getMonth() - intervalo);
    else if (unidade === 'ano') d.setFullYear(d.getFullYear() - intervalo);
    return d.toISOString().slice(0, 10);
}

function primeiroDiaDoMes(dataISO) {
    const [ano, mes] = dataISO.split('-');
    return `${ano}-${mes}-01`;
}

// ============================================================================
// SUBTIPOS DE CONTROLE (configuração — pedido explícito, 25/08/2026)
// Mesmo padrão UX de "Categorias de documento" (cofre-documentos.js
// abrirConfiguracoes/salvarCategoria/renderizarCategorias), acessível
// pelo menu ⚙️ → Cadastros. Precisou de policy de escrita nova no banco
// (cofre_controle_subtipos só tinha SELECT — ver migration
// cofre_controle_subtipos_write_policy_v1).
// ============================================================================
let subtipoEmEdicao = null; // id do subtipo sendo editado, ou null (modo "criar novo") — pedido explícito 25/08/2026

export async function abrirSubtiposControle() {
    try {
        subtiposCache = await api.listarSubtiposControle(estado.clienteId);
    } catch (err) {
        mostrarToast('Erro ao carregar subtipos: ' + err.message, 'erro');
        return;
    }
    subtipoEmEdicao = null;
    document.getElementById('subtipo-tipo').disabled = false;
    document.getElementById('subtipo-nome').value = '';
    document.getElementById('subtipo-documento-esperado').checked = false;
    document.getElementById('subtipo-btn-salvar').textContent = 'Adicionar';
    document.getElementById('subtipo-btn-cancelar').classList.add('hidden');
    renderizarSubtiposControle();
    abrirModal('modal-subtipos-controle');
}

export function fecharSubtiposControle() {
    fecharModal('modal-subtipos-controle');
}

export async function salvarSubtipoControle() {
    const tipo = document.getElementById('subtipo-tipo').value;
    const nome = document.getElementById('subtipo-nome').value.trim();
    const documentoEsperado = document.getElementById('subtipo-documento-esperado').checked;
    if (!nome) { mostrarToast('Informe um nome.', 'erro'); return; }
    try {
        if (subtipoEmEdicao) {
            await api.atualizarSubtipoControle(subtipoEmEdicao, nome, documentoEsperado);
            mostrarToast('Subtipo atualizado ✅');
            cancelarEdicaoSubtipo();
        } else {
            await api.criarSubtipoControle(estado.clienteId, tipo, nome, documentoEsperado);
            mostrarToast('Subtipo criado ✅');
            document.getElementById('subtipo-nome').value = '';
            document.getElementById('subtipo-documento-esperado').checked = false;
        }
        subtiposCache = await api.listarSubtiposControle(estado.clienteId);
        renderizarSubtiposControle();
    } catch (err) { mostrarToast('Erro: ' + err.message, 'erro'); }
}

// Pedido explícito (25/08/2026) — Editar/Excluir agora aparecem pra
// QUALQUER subtipo, inclusive "padrão do sistema" (cliente_id null,
// compartilhado entre todos os clientes). A RLS (migration
// cofre_subtipos_modelos_master_pode_editar_globais_v1) já garante que
// só quem é fn_sou_master() consegue de fato salvar uma edição numa
// linha global — a interface não precisa mais decidir isso, o banco
// decide. "Tipo" fica desabilitado durante edição (mudar de categoria
// depois de criado deixaria itens já usando esse subtipo apontando pro
// grupo errado no dropdown) — só o nome é editável.
export function editarSubtipoControle(id) {
    const s = (subtiposCache || []).find(x => x.id === id);
    if (!s) return;
    subtipoEmEdicao = id;
    document.getElementById('subtipo-tipo').value = s.tipo;
    document.getElementById('subtipo-tipo').disabled = true;
    document.getElementById('subtipo-nome').value = s.nome;
    document.getElementById('subtipo-documento-esperado').checked = !!s.documento_esperado;
    document.getElementById('subtipo-btn-salvar').textContent = 'Salvar edição';
    document.getElementById('subtipo-btn-cancelar').classList.remove('hidden');
    document.getElementById('subtipo-nome').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function cancelarEdicaoSubtipo() {
    subtipoEmEdicao = null;
    document.getElementById('subtipo-tipo').disabled = false;
    document.getElementById('subtipo-nome').value = '';
    document.getElementById('subtipo-documento-esperado').checked = false;
    document.getElementById('subtipo-btn-salvar').textContent = 'Adicionar';
    document.getElementById('subtipo-btn-cancelar').classList.add('hidden');
}

export async function excluirSubtipoControle(id) {
    const s = (subtiposCache || []).find(x => x.id === id);
    if (!s) return;
    if (!confirm(`Excluir o subtipo "${s.nome}"?`)) return;
    try {
        await api.arquivarSubtipoControle(id);
        mostrarToast('Subtipo excluído.');
        if (subtipoEmEdicao === id) cancelarEdicaoSubtipo();
        subtiposCache = await api.listarSubtiposControle(estado.clienteId);
        renderizarSubtiposControle();
    } catch (err) { mostrarToast('Erro: ' + err.message, 'erro'); }
}

// Agrupado por tipo (Seguro/Manutenção/Tributo — os 3 únicos valores
// possíveis, CHECK constraint no banco) em vez de lista plana, pra ficar
// claro em qual dropdown cada subtipo novo vai aparecer.
function renderizarSubtiposControle() {
    const grupos = { seguro: [], manutencao: [], tributo: [] };
    (subtiposCache || []).forEach(s => { if (grupos[s.tipo]) grupos[s.tipo].push(s); });
    const el = document.getElementById('subtipos-lista');
    el.innerHTML = Object.keys(grupos).map(tipo => {
        const itens = grupos[tipo];
        if (!itens.length) return '';
        return `<div class="mb-3">
            <p class="text-[11px] font-bold uppercase tracking-wide mb-1" style="color:var(--sage)">${escapeHtml(rotuloTipoControle(tipo))}</p>
            ${itens.map((s, idx) => `<div class="flex items-center justify-between gap-2 py-1.5 ${idx < itens.length - 1 ? 'border-b border-slate-50' : ''}">
                <span class="text-xs font-bold">${escapeHtml(s.nome)} ${s.documento_esperado ? `<span class="text-[10px] font-bold px-1.5 py-0.5 rounded raiz-badge-atributo" title="Documento anexo esperado">📎</span>` : ''}</span>
                <div class="flex items-center gap-2 flex-none">
                    ${s.cliente_id === null ? `<span class="text-[10px]" style="color:var(--sage)">padrão do sistema</span>` : ''}
                    <button data-action="editar-subtipo-controle" data-id="${s.id}" class="text-[10px] font-bold" style="color:var(--pine)">Editar</button>
                    <button data-action="excluir-subtipo-controle" data-id="${s.id}" class="text-[10px] font-bold text-slate-500">Excluir</button>
                </div>
            </div>`).join('')}
        </div>`;
    }).join('') || `<p class="text-xs" style="color:var(--sage)">Nenhum subtipo cadastrado ainda.</p>`;
}

// ============================================================================
// MODELOS DE ITEM DE CONTROLE POR TIPO DE ATIVO (configuração — pedido
// explícito, 25/08/2026). Mesmo padrão UX de Subtipos, com mais campos
// (é um template do item inteiro, não só um nome). Usado pelo atalho
// "Usar modelo" em abrirFormControle() acima e, futuramente, pelo bot
// (ver ESPECIFICACAO_FLUXO_DOCUMENTO_BOT). Precisou de tabela e policy
// novas — cofre_modelos_item_controle_v1.
// ============================================================================
const TIPOS_ATIVO_ORDEM = ['veiculo', 'veiculo_blindado', 'imovel', 'terreno', 'obra_arte', 'vida_protecao', 'outro'];

export async function abrirModelosControle() {
    try {
        if (!subtiposCache) subtiposCache = await api.listarSubtiposControle(estado.clienteId);
        modelosCache = await api.listarModelosItemControle(estado.clienteId);
    } catch (err) {
        mostrarToast('Erro ao carregar modelos: ' + err.message, 'erro');
        return;
    }
    modeloEmEdicao = null;
    document.getElementById('modelo-tipo-ativo').innerHTML = TIPOS_ATIVO_ORDEM.map(t => `<option value="${t}">${escapeHtml(rotuloTipoAtivo(t))}</option>`).join('');
    document.getElementById('modelo-tipo').value = 'seguro';
    popularSelectSubtipoEm('modelo-subtipo', 'seguro', null);
    document.getElementById('modelo-titulo').value = '';
    document.getElementById('modelo-freq-intervalo').value = '';
    document.getElementById('modelo-freq-unidade').value = 'ano';
    document.getElementById('modelo-antecedencia').value = '30';
    document.getElementById('modelo-btn-salvar').textContent = 'Adicionar modelo';
    document.getElementById('modelo-btn-cancelar').classList.add('hidden');
    renderizarModelosControle();
    abrirModal('modal-modelos-controle');
}

export function fecharModelosControle() {
    fecharModal('modal-modelos-controle');
}

export function aoMudarTipoModeloControleForm() {
    popularSelectSubtipoEm('modelo-subtipo', document.getElementById('modelo-tipo').value, null);
}

export async function salvarModeloControle() {
    const tipoAtivo = document.getElementById('modelo-tipo-ativo').value;
    const tipo = document.getElementById('modelo-tipo').value;
    const subtipoId = document.getElementById('modelo-subtipo').value || null;
    const titulo = document.getElementById('modelo-titulo').value.trim();
    const freqIntervalo = parseInt(document.getElementById('modelo-freq-intervalo').value, 10) || null;
    const freqUnidade = freqIntervalo ? document.getElementById('modelo-freq-unidade').value : null;
    const antecedencia = parseInt(document.getElementById('modelo-antecedencia').value, 10) || 0;
    if (!titulo) { mostrarToast('Informe um título sugerido.', 'erro'); return; }
    const payload = {
        tipo_ativo: tipoAtivo, tipo, subtipo_id: subtipoId, titulo_sugerido: titulo,
        frequencia_intervalo: freqIntervalo, frequencia_unidade: freqUnidade, antecedencia_alerta_dias: antecedencia,
    };
    try {
        if (modeloEmEdicao) {
            await api.atualizarModeloItemControle(modeloEmEdicao, payload);
            mostrarToast('Modelo atualizado ✅');
            cancelarEdicaoModelo();
        } else {
            await api.criarModeloItemControle({ ...payload, cliente_id: estado.clienteId });
            mostrarToast('Modelo criado ✅');
            document.getElementById('modelo-titulo').value = '';
            document.getElementById('modelo-freq-intervalo').value = '';
        }
        modelosCache = await api.listarModelosItemControle(estado.clienteId);
        renderizarModelosControle();
    } catch (err) { mostrarToast('Erro: ' + err.message, 'erro'); }
}

// Pedido explícito (25/08/2026) — edição preenche o mesmo formulário de
// criação, e o botão vira "Salvar edição" até cancelar ou salvar. Só
// modelos DO PRÓPRIO cliente podem ser editados/excluídos por aqui —
// modelos globais ("padrão do sistema", cliente_id null) são
// compartilhados entre TODOS os clientes, editar um afetaria todo mundo
// — por isso a pill de editar/excluir nem aparece pra eles (ver
// renderizarModelosControle).
export function editarModeloControle(id) {
    const m = (modelosCache || []).find(x => x.id === id);
    if (!m) return;
    modeloEmEdicao = id;
    document.getElementById('modelo-tipo-ativo').value = m.tipo_ativo;
    document.getElementById('modelo-tipo').value = m.tipo;
    popularSelectSubtipoEm('modelo-subtipo', m.tipo, m.subtipo_id);
    document.getElementById('modelo-titulo').value = m.titulo_sugerido;
    document.getElementById('modelo-freq-intervalo').value = m.frequencia_intervalo || '';
    document.getElementById('modelo-freq-unidade').value = m.frequencia_unidade || 'ano';
    document.getElementById('modelo-antecedencia').value = m.antecedencia_alerta_dias;
    document.getElementById('modelo-btn-salvar').textContent = 'Salvar edição';
    document.getElementById('modelo-btn-cancelar').classList.remove('hidden');
    document.getElementById('modelo-titulo').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export function cancelarEdicaoModelo() {
    modeloEmEdicao = null;
    document.getElementById('modelo-titulo').value = '';
    document.getElementById('modelo-freq-intervalo').value = '';
    document.getElementById('modelo-antecedencia').value = '30';
    document.getElementById('modelo-btn-salvar').textContent = 'Adicionar modelo';
    document.getElementById('modelo-btn-cancelar').classList.add('hidden');
}

export async function excluirModeloControle(id) {
    const m = (modelosCache || []).find(x => x.id === id);
    if (!m) return;
    if (!confirm(`Excluir o modelo "${m.titulo_sugerido}"?`)) return;
    try {
        await api.arquivarModeloItemControle(id);
        mostrarToast('Modelo excluído.');
        if (modeloEmEdicao === id) cancelarEdicaoModelo();
        modelosCache = await api.listarModelosItemControle(estado.clienteId);
        renderizarModelosControle();
    } catch (err) { mostrarToast('Erro: ' + err.message, 'erro'); }
}

// Agrupado por tipo de ativo (ordem fixa TIPOS_ATIVO_ORDEM), cada grupo
// mostrando tipo/subtipo/frequência/antecedência numa linha só — mesmo
// espírito de "itens a receber" (sem borda/fundo, divisor fino).
function renderizarModelosControle() {
    const grupos = {};
    TIPOS_ATIVO_ORDEM.forEach(t => { grupos[t] = []; });
    (modelosCache || []).forEach(m => { if (grupos[m.tipo_ativo]) grupos[m.tipo_ativo].push(m); });
    const el = document.getElementById('modelos-lista');
    el.innerHTML = TIPOS_ATIVO_ORDEM.map(tipoAtivo => {
        const itens = grupos[tipoAtivo];
        if (!itens.length) return '';
        return `<div class="mb-3">
            <p class="text-[11px] font-bold uppercase tracking-wide mb-1" style="color:var(--sage)">${escapeHtml(rotuloTipoAtivo(tipoAtivo))}</p>
            ${itens.map((m, idx) => `<div class="py-1.5 ${idx < itens.length - 1 ? 'border-b border-slate-50' : ''}">
                <div class="flex items-center justify-between gap-2">
                    <span class="text-xs font-bold">${escapeHtml(m.titulo_sugerido)}</span>
                    <div class="flex items-center gap-2 flex-none">
                        ${m.cliente_id === null ? `<span class="text-[10px]" style="color:var(--sage)">padrão do sistema</span>` : ''}
                        <button data-action="editar-modelo-controle" data-id="${m.id}" class="text-[10px] font-bold" style="color:var(--pine)">Editar</button>
                        <button data-action="excluir-modelo-controle" data-id="${m.id}" class="text-[10px] font-bold text-slate-500">Excluir</button>
                    </div>
                </div>
                <p class="text-[11px]" style="color:var(--sage)">${escapeHtml(rotuloTipoControle(m.tipo))}${m.cofre_controle_subtipos?.nome ? ' · ' + escapeHtml(m.cofre_controle_subtipos.nome) : ''} · ${escapeHtml(rotuloFrequencia(m.frequencia_intervalo, m.frequencia_unidade))} · avisa ${m.antecedencia_alerta_dias}d antes</p>
            </div>`).join('')}
        </div>`;
    }).join('') || `<p class="text-xs" style="color:var(--sage)">Nenhum modelo cadastrado ainda.</p>`;
}
