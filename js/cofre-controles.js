// ============================================================================
// cofre-controles.js — Raiz Patrimônio · Cofre de Documentos
// Versão: 1.15.0 · 03/09/2026
//
// v1.15.0 — sem rodapés: ⋮ em Documentos/Contatos do item (abrirAcoesDocsItem /
// abrirAcoesContatosItem); linha de parte com ⋮ (sem lápis) → sheet.
//
// v1.14.0 — voltar do item cai no chip Controles do ativo; linhas que abrem
// SHEET (ocorrência, parte) usam ⋮ / lápis em vez de chevron (chevron = navega).
//
// v1.13.0 (parte b — fatia 3b-i) — FICHA DO ITEM DE CONTROLE na gramática
// única: cabeçalho de entidade com status da próxima ocorrência; Dados em
// .rz-kv; ocorrências em .rz-row com UM toque → sheet de ações (Dar
// baixa · Reagendar · Estornar) → sheet de formulário com os mesmos ids
// de campo de antes (confirmar* intactos). Partes/Documentos/Contatos em
// .rz-row com vazio único e rodapé único. Saíram: 3 painéis inline de
// Mais ações, par Tratar|Reagendar por linha, 3 forms inline, pills de
// Partes. Novas: abrirAcoesOcorrencia, abrirAcoesDadosItem,
// abrirAcoesPartesItem. alternarMaisAcoes*Item viram alias.
//
// v1.13.0 (parte a) — FATIA 3 da gramática única (REGRAS_EXPERIENCIA_RAIZ_v3_2 §6,
// §9, §10): na ficha do ativo, a lista de itens de controle virou .rz-row
// (ícone colorido pela semântica, status "ponto + rótulo" via
// renderStatus, sem chipVencimento/Tailwind amber-green); vazio no
// formato único; contador do chip Controles (vinho quando há vencido ou
// vencendo em ≤30d) e status no cabeçalho do card
// (atualizarEstadoChipControles); "Mais ações" abre sheet (Modelos/
// Tipos) e "Criar item de controle" virou a ação nomeada "Novo item" do
// rodapé. A FICHA DO ITEM (renderizarFichaItemControle) NÃO mudou nesta
// fatia — entra na 3b com o sheet "Tratar" (REGRAS §15).
//
// v1.12.0 — abrirNovoLancamentoDoItem() (NOVO, pedido explícito: "vai
// precisar de um controle de qual a parte é pra alocar a despesa já
// que podemos ter mais que 1 parte cadastrada") — botão "Gerar
// despesa" na box Partes, ponte pro App já levando descrição (título
// do item)/categoria (mapeada do tipo) e as partes vinculadas como
// sugestão de fornecedor (ver index.html v1.105.0 pro lado que decide
// pré-selecionar 1 ou mostrar chips pra escolher entre 2+).
//
// v1.11.0 — chip "Partes" no item de controle (NOVO, pedido explícito:
// "as partes devem ser vários chips e aparecer... em itens de controle
// (prestadores)... podendo ter mais de uma parte no item, por exemplo
// pra cobrir a empresa e tb um contato na empresa ou o corretor").
// montarPartesItemControle() mostra os chips; abrirEditarPartesItem()/
// salvarPartesItemAtual() abrem o editor (modalGenerico) — várias
// linhas parte+papel, sem %, permite criar parte nova na hora. Backend:
// fn_partes_do_item_controle/substituir_partes_item_controle (RPCs
// novas, testadas como authenticated real antes desta entrega). Box
// novo entra entre Ocorrência e Contatos vinculados — Partes é o
// cadastro formal (pode virar fornecedor de despesa depois), Contatos
// continua sendo só "quem eu chamo no WhatsApp", os dois convivem.
//
// v1.10.0 — pedido explícito: "resolva as pendências de cores
// listadas". Ícone-box da ficha do item de controle (bg-emerald-50
// text-emerald-800) trocado por token (--sprout-light/--pine), mesmo
// par usado em cofre-ativos.js (ativoCardHtml) pra ficar idêntico.
//
// v1.9.0 — abrirItemControleComOrigemAlertas() (NOVO, pedido explícito:
// "ao clicar num alerta, deve permitir o seu tratamento caso seja um
// alerta de um item de controle") — ponte pro App: até aqui todas as
// pontes deste projeto iam Cofre→App (abrirNovaDespesa etc.); esta é a
// primeira na direção contrária (App→Cofre), pra tab-alertas
// (index.html) conseguir abrir a ficha de um item de controle
// específico com o "Tratar" já alcançável, reaproveitando
// abrirFichaItemControle() (mesma função da lista de Controles) sem
// duplicar nada — só ajusta a origem pra 'alertas' explicitamente
// (auto-detecção de origem não faz sentido vindo de fora do módulo) e
// garante estado.ativoEmFoco correto antes de chamar.
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
// v1.2.1 — DS C-8: abrirAcoesControles() só fazia
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
// "Mais ações" do box Controles (nova abrirAcoesControles()).
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
import { mostrarToast, refrescarIcones, abrirModal, fecharModal, modalGenerico } from './cofre-ui.js';
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
    try {
        itensDoAtivoAtual = await api.listarItensControleAtivo(a.id);
    } catch (err) {
        document.getElementById('fa-tab-controles').innerHTML = `<p class="text-xs" style="color:var(--danger)">Erro ao carregar controles: ${escapeHtml(err.message)}</p>`;
        return;
    }
    renderizarListaControles();
}

// v1.13.0 (fatia 3) — estado do chip/card Controles: contador no chip
// (.rz-n, vinho quando há vencido/vencendo) e status no cabeçalho do card.
function diasProximaOcorrencia(item) {
    if (item.alerta_ativo === false) return null;
    const abertas = (item.cofre_ocorrencias_controle || [])
        .filter(o => o.status_execucao === 'aberto')
        .slice()
        .sort((x, y) => (x.data_prevista_atual > y.data_prevista_atual ? 1 : -1));
    return abertas[0] ? diasAte(abertas[0].data_prevista_atual) : null;
}
function statusHtml(sem, texto) {
    return typeof window.renderStatus === 'function' ? window.renderStatus(sem, texto) : `<span class="rz-st rz-${sem}">${escapeHtml(texto)}</span>`;
}
function atualizarEstadoChipControles() {
    const dias = itensDoAtivoAtual.map(diasProximaOcorrencia).filter(d => d !== null);
    const vencidos = dias.filter(d => d < 0).length;
    const vencendo = dias.filter(d => d >= 0 && d <= 30).length;
    if (typeof window.faAtualizarContadorFicha === 'function') window.faAtualizarContadorFicha('controles', itensDoAtivoAtual.length, vencidos + vencendo > 0);
    const cab = document.getElementById('fa-controles-status');
    if (!cab) return;
    if (vencidos) cab.innerHTML = statusHtml('bad', `${vencidos} vencido${vencidos === 1 ? '' : 's'}`);
    else if (vencendo) cab.innerHTML = statusHtml('warn', `${vencendo} vencendo`);
    else if (itensDoAtivoAtual.length) cab.innerHTML = statusHtml('ok', 'Em dia');
    else cab.innerHTML = '';
}

function renderizarListaControles() {
    const alvo = document.getElementById('fa-tab-controles');
    if (!alvo) return;
    atualizarEstadoChipControles();
    if (!itensDoAtivoAtual.length) {
        // v1.13.0 — vazio no formato único (REGRAS §9): a ação fica no
        // rodapé do card ("Novo item"), por isso o vazio não repete botão.
        alvo.innerHTML = `<div class="rz-empty"><div class="rz-ic"><i data-lucide="shield"></i></div><p>Nenhum item de controle ainda. Seguros, tributos e vistorias cadastrados aqui viram alertas automáticos.</p></div>`;
        refrescarIcones();
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
    // v1.13.0 (fatia 3, REGRAS §9/§10) — item de lista único (.rz-row):
    // ícone 42 colorido pela semântica · título + subtipo · status
    // "ponto + rótulo" (o número é o rótulo: "9 dias", "Vencido há 3d").
    // chipVencimento() (bg-amber/green Tailwind) deixou de ser usado aqui.
    const subtitulo = item.cofre_controle_subtipos?.nome || rotuloTipoControle(item.tipo);
    const iconeTipo = { seguro: 'shield', tributo: 'landmark', manutencao: 'wrench' }[item.tipo] || 'clipboard-check';
    if (item.alerta_ativo === false) {
        return `<div class="rz-row rz-link" data-action="abrir-item-controle" data-id="${item.id}">
            <div class="rz-ic rz-neu"><i data-lucide="bell-off"></i></div>
            <div class="rz-tx"><b>${escapeHtml(item.titulo)}</b><span>${escapeHtml(subtitulo)}</span></div>
            <div class="rz-rt">${statusHtml('neu', 'Alertas desligados')}</div>
            <i data-lucide="chevron-right" class="rz-chev"></i>
        </div>`;
    }
    const dias = diasProximaOcorrencia(item);
    let sem = 'ok', rotulo = 'Em dia', classeIc = '';
    if (dias !== null && dias < 0) { sem = 'bad'; rotulo = `Vencido há ${Math.abs(dias)}d`; classeIc = ' rz-bad'; }
    else if (dias !== null && dias <= 30) { sem = 'warn'; rotulo = dias === 0 ? 'Vence hoje' : `${dias} dia${dias === 1 ? '' : 's'}`; classeIc = ' rz-warn'; }
    return `<div class="rz-row rz-link" data-action="abrir-item-controle" data-id="${item.id}">
        <div class="rz-ic${classeIc}"><i data-lucide="${sem === 'bad' ? 'alarm-clock' : (sem === 'warn' ? 'clock' : iconeTipo)}"></i></div>
        <div class="rz-tx"><b>${escapeHtml(item.titulo)}</b><span>${escapeHtml(subtitulo)}</span></div>
        <div class="rz-rt">${statusHtml(sem, rotulo)}</div>
        <i data-lucide="chevron-right" class="rz-chev"></i>
    </div>`;
}

// v1.13.0 (fatia 3, REGRAS §6) — "Mais ações" do card Controles abre
// SHEET (dados, não HTML). "Criar item" saiu daqui: virou a ação nomeada
// do rodapé ("Novo item"). Ficam as configurações que antes só eram
// alcançáveis pelo menu da conta.
export function abrirAcoesControles() { // v1.13.0 — era alternarMaisAcoesControles
    if (typeof window.abrirSheetAcoes !== 'function') { mostrarToast('Ações disponíveis só dentro do app principal.', 'erro'); return; }
    window.abrirSheetAcoes({
        titulo: 'Itens de controle',
        sub: estado.ativoEmFoco?.nome_exibicao || '',
        acoes: [
            { icone: 'layers', titulo: 'Modelos de item', sub: 'Modelos prontos pra criar mais rápido', aoTocar: () => abrirModelosControle() },
            { icone: 'tags', titulo: 'Tipos de controle', sub: 'Subtipos de seguro, tributo e manutenção', aoTocar: () => abrirSubtiposControle() },
        ],
    });
}

// ============================================================================
// TELA — FICHA DO ITEM DE CONTROLE
// ============================================================================
// ============================================================================
// PARTES DO ITEM DE CONTROLE (NOVO, 02/09/2026, pedido explícito: "as
// partes devem ser vários chips e aparecer... em itens de controle
// (prestadores)... podendo ter mais de uma parte no item"). Backend:
// fn_partes_do_item_controle (leitura) / substituir_partes_item_controle
// (escrita, testadas como authenticated real). Editor sem % (não é
// rateio como Propriedade em Ativos — é lista de responsáveis, cada um
// com seu papel).
// ============================================================================
const PAPEIS_PARTE_ITEM = [
    { v: 'sindico', l: 'Síndico' },
    { v: 'administradora', l: 'Administradora' },
    { v: 'manutencista', l: 'Manutencista' },
    { v: 'corretor', l: 'Corretor' },
    { v: 'contato_seguradora', l: 'Contato na seguradora' },
    { v: 'prestador', l: 'Outro prestador' },
];
function rotuloPapelParteItem(v) {
    return (PAPEIS_PARTE_ITEM.find(p => p.v === v) || {}).l || v;
}

let partesItemLinhasEmEdicao = [];
let partesClienteCache = null; // null = ainda não carregado

async function montarPartesItemControle(item) {
    const mount = document.getElementById('fic-partes');
    if (!mount) return;
    mount.innerHTML = `<p class="text-xs" style="color:var(--sage)">Carregando...</p>`;

    const linhas = await api.buscarPartesDoItemControle(item.id);

    // v1.13.0 (fatia 3b-i) — de pills pra .rz-row (REGRAS §8: pill é só
    // filtro/sub-navegação). Toque abre o editor de partes.
    if (!linhas.length) {
        mount.innerHTML = `<div class="rz-empty"><div class="rz-ic"><i data-lucide="users"></i></div><p>Nenhuma parte ainda. A parte responsável vira o fornecedor quando você gera a despesa.</p></div>`;
        refrescarIcones();
        return;
    }
    mount.innerHTML = linhas.map(l => `
        <div class="rz-row rz-link" data-action="abrir-acoes-partes-linha">
            <div class="rz-ic"><i data-lucide="briefcase"></i></div>
            <div class="rz-tx"><b>${escapeHtml(l.nome)}</b><span>${escapeHtml(rotuloPapelParteItem(l.papel))}</span></div>
            <i data-lucide="ellipsis-vertical" class="rz-chev"></i>
        </div>`).join('');
    refrescarIcones();
}

function partesItemLinhaHtml(l, idx) {
    const optsPartes = (partesClienteCache || []).map(p =>
        `<option value="${p.id}" ${l.parte_id === p.id ? 'selected' : ''}>${escapeHtml(p.nome)}</option>`).join('');
    const optsPapeis = PAPEIS_PARTE_ITEM.map(p =>
        `<option value="${p.v}" ${l.papel === p.v ? 'selected' : ''}>${escapeHtml(p.l)}</option>`).join('');
    return `
        <div class="flex gap-2 items-start" data-partes-item-linha="${idx}">
            <div class="flex-1 space-y-1">
                <select onchange="window.__piMudarParte(${idx}, this.value)" style="width:100%;padding:6px;border:1px solid #cbd5e1;border-radius:6px;font-size:12px;background:#f8fafc;"><option value="">— selecionar parte —</option>${optsPartes}<option value="__nova__" ${l.parte_id === '__nova__' ? 'selected' : ''}>+ Nova parte</option></select>
                ${l.parte_id === '__nova__' ? `<input type="text" value="${escapeHtml(l.nomeNovo || '')}" oninput="window.__piMudarNomeNovo(${idx}, this.value)" placeholder="Nome da nova parte" style="width:100%;padding:6px;border:1px solid #cbd5e1;border-radius:6px;font-size:12px;">` : ''}
                <select onchange="window.__piMudarPapel(${idx}, this.value)" style="width:100%;padding:6px;border:1px solid #cbd5e1;border-radius:6px;font-size:12px;background:#f8fafc;">${optsPapeis}</select>
            </div>
            <button onclick="window.__piRemoverLinha(${idx})" style="background:transparent;border:none;color:var(--danger);flex:none;padding:6px 0;"><i data-lucide="x" style="width:16px;height:16px"></i></button>
        </div>`;
}

function renderPartesItemEditor() {
    const container = document.getElementById('pi-linhas');
    if (!container) return;
    container.innerHTML = partesItemLinhasEmEdicao.map((l, i) => partesItemLinhaHtml(l, i)).join('');
    refrescarIcones();
}

window.__piMudarParte = (idx, valor) => { partesItemLinhasEmEdicao[idx].parte_id = valor; renderPartesItemEditor(); };
window.__piMudarNomeNovo = (idx, valor) => { partesItemLinhasEmEdicao[idx].nomeNovo = valor; };
window.__piMudarPapel = (idx, valor) => { partesItemLinhasEmEdicao[idx].papel = valor; };
window.__piRemoverLinha = (idx) => { partesItemLinhasEmEdicao.splice(idx, 1); renderPartesItemEditor(); };
window.__piAdicionarLinha = () => { partesItemLinhasEmEdicao.push({ parte_id: '', papel: 'prestador', nomeNovo: '' }); renderPartesItemEditor(); };

export async function abrirEditarPartesItem() {
    const item = itemEmFoco;
    if (!item) return;

    if (partesClienteCache === null) {
        partesClienteCache = await api.listarPartesCliente(estado.clienteId);
    }
    const atuais = await api.buscarPartesDoItemControle(item.id);
    partesItemLinhasEmEdicao = atuais.map(l => ({ parte_id: l.parte_id, papel: l.papel, nomeNovo: '' }));

    modalGenerico('Editar partes do item', `
        <div id="pi-linhas" class="space-y-2 mb-2"></div>
        <button onclick="window.__piAdicionarLinha()" class="text-xs font-bold px-2.5 py-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300 flex items-center gap-1 mb-3">
            <i data-lucide="plus" style="width:11px;height:11px"></i> Adicionar parte
        </button>
        <div class="flex gap-2">
            <button data-action="fechar-modal-generico" class="flex-1" style="background:#f1f5f9;color:#475569;font-weight:bold;font-size:13px;padding:10px;border:none;border-radius:8px;">Cancelar</button>
            <button data-action="fi-salvar-partes-item" class="flex-1" style="background:var(--pine);color:#fff;font-weight:bold;font-size:13px;padding:10px;border:none;border-radius:8px;">Salvar</button>
        </div>
    `);
    renderPartesItemEditor();
}

export async function salvarPartesItemAtual() {
    const item = itemEmFoco;
    if (!item) return;

    for (const l of partesItemLinhasEmEdicao) {
        if (!l.parte_id || (l.parte_id === '__nova__' && !l.nomeNovo.trim())) {
            mostrarToast('Preencha a parte de todas as linhas (ou remova as vazias).', 'erro');
            return;
        }
    }

    try {
        const linhasParaApi = [];
        for (const l of partesItemLinhasEmEdicao) {
            let parteId = l.parte_id;
            if (parteId === '__nova__') {
                const { data: novaParte, error } = await api.criarParteRapida(estado.clienteId, l.nomeNovo.trim());
                if (error) throw error;
                parteId = novaParte.id;
                partesClienteCache = null; // invalida cache, próxima abertura já traz
            }
            linhasParaApi.push({ parte_id: parteId, papel: l.papel });
        }
        await api.salvarPartesItemControle(item.id, linhasParaApi);
        mostrarToast('Partes do item salvas.');
        fecharModal('modal-generico');
        await montarPartesItemControle(item);
    } catch (err) {
        mostrarToast('Erro ao salvar: ' + (err.message || String(err)), 'erro');
    }
}

// v1.17.0 (NOVO, 02/09/2026, pedido explícito: "vai precisar de um
// controle de qual a parte é pra alocar a despesa já que podemos ter
// mais que 1 parte cadastrada") — ponte pro App (mesmo princípio de
// abrirNovoLancamentoDoAtivo em cofre-ativos.js), mas pré-preenchendo
// descrição/categoria a partir do item e passando as partes vinculadas
// como sugestão de fornecedor — o popup de despesa (index.html) decide
// sozinho se pré-seleciona (1 parte só) ou mostra os chips pra escolher
// (2+ partes, não dá pra adivinhar qual delas).
const CATEGORIA_DESPESA_POR_TIPO_ITEM = { seguro: 'seguro', manutencao: 'manutencao', tributo: 'tributo' };

export async function abrirNovoLancamentoDoItem() {
    const item = itemEmFoco;
    if (!item) return;
    if (typeof window.switchTab !== 'function' || typeof window.abrirNovaDespesa !== 'function') {
        mostrarToast('Lançamento de despesa só disponível dentro do app principal.', 'erro');
        return;
    }
    const partes = await api.buscarPartesDoItemControle(item.id);
    window.switchTab('tab-saidas');
    window.abrirNovaDespesa(item.ativo_id || null, {
        descricao: item.titulo,
        categoria: CATEGORIA_DESPESA_POR_TIPO_ITEM[item.tipo] || 'outro',
        partes: partes.map(p => ({ parte_id: p.parte_id, nome: p.nome }))
    });
}


export async function abrirFichaItemControle(itemId) {
    ocorrenciaEmAcao = null;
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

// NOVO (02/09/2026, pedido explícito: "ao clicar num alerta, deve
// permitir o seu tratamento caso seja um alerta de um item de
// controle") — ponte App→Cofre (1ª nesta direção; todas as outras
// pontes deste projeto iam Cofre→App). Chamada por
// abrirAlertaItemControle() em index.html (tab-alertas). Reaproveita
// abrirFichaItemControle() por inteiro — só garante estado.ativoEmFoco
// certo antes (pro log de acesso e pra "Voltar" cair no lugar certo se
// a origem virar 'ficha-ativo' por algum motivo) e sobrescreve a
// origem detectada automaticamente, que não faz sentido vindo de fora
// do módulo.
export async function abrirItemControleComOrigemAlertas(itemId, ativoId) {
    if (ativoId && (!estado.ativoEmFoco || estado.ativoEmFoco.id !== ativoId)) {
        try { estado.ativoEmFoco = await api.buscarAtivoPorId(ativoId); }
        catch (e) { console.warn('[cofre-controles] não achei o ativo do alerta:', e); }
    }
    await abrirFichaItemControle(itemId);
    itemControleOrigemTela = 'alertas-app';
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
    // NOVO (02/09/2026) — 'alertas-app' é uma origem DIFERENTE de
    // 'alertas' (a tela de alertas INTERNA do Cofre, alcançável pela
    // Home) — significa que veio de fora do módulo inteiro, da aba
    // tab-alertas do index.html (ponte nova, ver
    // abrirItemControleComOrigemAlertas() logo abaixo). Volta via
    // switchTab, nenhuma tela interna do Cofre faz sentido aqui.
    if (origem === 'alertas-app' && typeof window.switchTab === 'function') {
        window.switchTab('tab-alertas');
        window.dispatchEvent(new CustomEvent('cofre:recarregar-eventos'));
        return;
    }
    // BUG FIX (25/08/2026) — antes ia sempre pra 'ficha-ativo', fixo.
    // Agora respeita a tela de origem real — pode ter sido aberta a
    // partir de um alerta na Home ou na tela cheia de Alertas.
    const destino = (origem === 'home' || origem === 'alertas') ? origem : 'ficha-ativo';
    mudarTela(destino);
    // v1.14.0 — Nicola 03/09: "ao voltar, posiciona no chip inicial do
    // ativo, e não no chip de item de controle". Reabre no chip Controles.
    if (destino === 'ficha-ativo' && ativo) { montarControlesAtivo(ativo); if (typeof window.faTrocarAbaFicha === 'function') window.faTrocarAbaFicha('controles'); }
    // Garante dado fresco na tela de destino (ex.: item tratado/editado/
    // excluído durante a visita) — mesmo mecanismo que já mantém a
    // Visão Geral sincronizada em qualquer outro ponto do Cofre.
    window.dispatchEvent(new CustomEvent('cofre:recarregar-eventos'));
}

function renderizarFichaItemControle() {
    const item = itemEmFoco;

    // ---- Box Dados (revisão DS 25/08/2026, pedido explícito) — cabeçalho
    // agora no MESMO formato de letra/cor do componente de Ativo (ver
    // ativoCardHtml em cofre-ativos.js: w-12 h-12 rounded-xl, ícone com
    // fundo/cor de token — var(--sprout-light)/var(--pine) desde
    // v1.9.0, 02/09/2026, "resolva as pendências de cores" — título
    // text-xs font-extrabold, subtítulo text-xs var(--sage)) — ícone representa o TIPO DO ATIVO dono do
    // item (iconeAtivo()), não mais um H3 solto genérico. Editar/Excluir
    // migraram de pills sempre visíveis pra um painel "Mais ações"
    // colapsável de verdade (DS §8 — antes só simulava o padrão sem o
    // toggle).
    // v1.13.0 (fatia 3b-i) — cabeçalho de entidade (.rz-entity) com o
    // status da PRÓXIMA ocorrência aberta; dados em .rz-kv; ocorrências
    // em .rz-row com UM toque (abre sheet Tratar/Reagendar/Estornar).
    const ocorrencias = (item.cofre_ocorrencias_controle || []).slice().sort((x, y) => (x.data_prevista_atual > y.data_prevista_atual ? 1 : -1));
    const proxima = ocorrencias.find(o => o.status_execucao === 'aberto');
    const diasProx = item.alerta_ativo === false ? null : (proxima ? diasAte(proxima.data_prevista_atual) : null);
    const statusItem = item.alerta_ativo === false ? statusHtml('neu', 'Alertas desligados')
        : diasProx === null ? statusHtml('ok', 'Sem pendência')
        : diasProx < 0 ? statusHtml('bad', `Vencido há ${Math.abs(diasProx)}d`)
        : diasProx <= 30 ? statusHtml('warn', diasProx === 0 ? 'Vence hoje' : `${diasProx} dia${diasProx === 1 ? '' : 's'}`)
        : statusHtml('ok', 'Em dia');
    document.getElementById('fic-dados-cabecalho').innerHTML = `
        <div class="rz-ic"><i data-lucide="${{ seguro: 'shield', tributo: 'landmark', manutencao: 'wrench' }[item.tipo] || 'clipboard-check'}"></i></div>
        <div class="rz-tx"><b>${escapeHtml(item.titulo)}</b><span>${escapeHtml(item.cofre_ativos?.nome_exibicao || '')}${item.cofre_ativos?.nome_exibicao ? ' · ' : ''}${escapeHtml(item.cofre_controle_subtipos?.nome || rotuloTipoControle(item.tipo))}</span></div>
        ${statusItem}`;
    const kv = (r, v) => `<div><small>${escapeHtml(r)}</small><b>${v}</b></div>`;
    document.getElementById('fic-dados-leitura').innerHTML =
        kv('Tipo', escapeHtml(rotuloTipoControle(item.tipo))) +
        kv('Subtipo', escapeHtml(item.cofre_controle_subtipos?.nome || '—')) +
        kv('Início', formatarDataBR(item.data_base)) +
        kv('Fim', item.data_fim ? formatarDataBR(item.data_fim) : 'Sem fim de vigência') +
        kv('Frequência', escapeHtml(rotuloFrequencia(item.frequencia_intervalo, item.frequencia_unidade))) +
        kv('Alerta', `${item.antecedencia_alerta_dias} dias antes · ${item.direcao_alerta === 'fim' ? 'a partir do fim' : 'a partir do início'}`);
    renderizarDocumentosItemControle();

    const elOc = document.getElementById('fic-ocorrencia');
    const elOcSt = document.getElementById('fic-ocorrencia-status');
    const abertas = ocorrencias.filter(o => o.status_execucao === 'aberto').length;
    if (elOcSt) elOcSt.innerHTML = ocorrencias.length ? `<span class="rz-sub">${abertas} em aberto · ${ocorrencias.length - abertas} concluída${ocorrencias.length - abertas === 1 ? '' : 's'}</span>` : '';
    if (!ocorrencias.length) {
        elOc.innerHTML = `<div class="rz-empty"><div class="rz-ic"><i data-lucide="calendar-check"></i></div><p>Nenhuma ocorrência gerada ainda. Elas nascem da frequência e do início do item.</p></div>`;
    } else {
        elOc.innerHTML = ocorrencias.map(oc => {
            const aberta = oc.status_execucao === 'aberto';
            const dias = aberta ? diasAte(oc.data_prevista_atual) : null;
            let sem = 'ok', rot = 'Em dia', ic = 'calendar-check', cls = '';
            if (!aberta) { sem = oc.status_execucao === 'concluido' ? 'ok' : 'neu'; rot = rotuloStatusOcorrencia(oc.status_execucao); ic = oc.status_execucao === 'concluido' ? 'check-circle-2' : 'x-circle'; cls = oc.status_execucao === 'concluido' ? '' : ' rz-neu'; }
            else if (dias < 0) { sem = 'bad'; rot = `Vencido há ${Math.abs(dias)}d`; ic = 'alarm-clock'; cls = ' rz-bad'; }
            else if (dias <= 30) { sem = 'warn'; rot = dias === 0 ? 'Vence hoje' : `${dias} dia${dias === 1 ? '' : 's'}`; ic = 'clock'; cls = ' rz-warn'; }
            return `<div class="rz-row rz-link" data-action="abrir-acoes-ocorrencia" data-id="${oc.id}">
                <div class="rz-ic${cls}"><i data-lucide="${ic}"></i></div>
                <div class="rz-tx"><b>${aberta ? 'Vence ' : (oc.status_execucao === 'concluido' ? 'Tratada · ' : '')}${formatarDataBR(oc.data_prevista_atual)}</b><span>${oc.tratamento_descricao ? escapeHtml(oc.tratamento_descricao) : (aberta ? 'Toque pra tratar ou reagendar' : rotuloStatusOcorrencia(oc.status_execucao))}</span></div>
                <div class="rz-rt">${statusHtml(sem, rot)}</div>
                <i data-lucide="ellipsis-vertical" class="rz-chev"></i>
            </div>`;
        }).join('');
    }

    montarPartesItemControle(item);

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
    // v1.13.0 (fatia 3b-i) — .rz-row; toque na linha edita, ícone do
    // WhatsApp à direita chama direto (mantido: é ação de 1 toque, não menu).
    const listaContatos = contatosDoItemAtual.length
        ? contatosDoItemAtual.map(c => `<div class="rz-row">
            <div class="rz-ic"><i data-lucide="user"></i></div>
            <div class="rz-tx rz-link" data-action="abrir-editar-contato-item" data-id="${c.id}"><b>${escapeHtml(c.nome)}</b><span>${escapeHtml(rotuloPapelContato(c.papel))}${c.whatsapp ? ' · ' + escapeHtml(c.whatsapp) : ''}</span></div>
            ${c.whatsapp ? `<button type="button" data-action="acionar-contato-item-direto" data-id="${c.id}" title="Chamar no WhatsApp" class="rz-ico-btn" style="width:36px;height:36px"><i data-lucide="message-circle" style="width:18px;height:18px;color:var(--success)"></i></button>` : ''}
        </div>`).join('')
        : `<div class="rz-empty"><div class="rz-ic"><i data-lucide="users"></i></div><p>Nenhum contato ainda. Contatos com WhatsApp viram atalho de 1 toque nos alertas.</p></div>`;
    elContatos.innerHTML = listaContatos;

    refrescarIcones();
}

// v1.13.0 (fatia 3b-i, REGRAS §6) — os 3 painéis inline de "Mais ações"
// da ficha do item saíram. Dados → sheet (Excluir); Partes → sheet
// (Editar partes); Documentos/Contatos passaram a ter a ação nomeada
// direto no rodapé (sem "Mais ações"). Nomes antigos mantidos como alias.
function sheetAcoes(config) {
    if (typeof window.abrirSheetAcoes !== 'function') { mostrarToast('Ações disponíveis só dentro do app principal.', 'erro'); return; }
    window.abrirSheetAcoes(config);
}
export function abrirAcoesDadosItem() {
    const item = itemEmFoco; if (!item) return;
    sheetAcoes({ titulo: item.titulo, sub: rotuloTipoControle(item.tipo), acoes: [
        { icone: 'pencil', titulo: 'Editar item', aoTocar: () => abrirEditarItem() },
        { icone: 'trash-2', titulo: 'Excluir item de controle', sub: 'Apaga ocorrências e alertas dele', tipo: 'bad', aoTocar: () => excluirItemControleAtual() },
    ] });
}
export function abrirAcoesPartesItem() {
    const item = itemEmFoco; if (!item) return;
    sheetAcoes({ titulo: 'Partes do item', sub: item.titulo, acoes: [
        { icone: 'users', titulo: 'Editar partes', sub: 'Quem responde por este item', aoTocar: () => abrirEditarPartesItem() },
        { icone: 'receipt', titulo: 'Gerar despesa', sub: 'Lançamento com a parte como fornecedor', aoTocar: () => abrirNovoLancamentoDoItem() },
    ] });
}
export function abrirAcoesDocsItem() {
    sheetAcoes({ titulo: 'Documentos do item', sub: itemEmFoco?.titulo || '', acoes: [
        { icone: 'upload', titulo: 'Carregar documento', sub: 'Apólice, guia, laudo — com leitura por IA', tipo: 'ia', aoTocar: () => carregarNovoDocumentoItem() },
    ] });
}
export function abrirAcoesContatosItem() {
    sheetAcoes({ titulo: 'Contatos do item', sub: itemEmFoco?.titulo || '', acoes: [
        { icone: 'user-plus', titulo: 'Adicionar contato', sub: 'Com WhatsApp vira atalho no alerta', aoTocar: () => abrirNovoContatoItem() },
    ] });
}
export const alternarMaisAcoesContatosItem = () => abrirNovoContatoItem();
export const alternarMaisAcoesDadosItem = () => abrirAcoesDadosItem();
export const alternarMaisAcoesDocItem = () => carregarNovoDocumentoItem();

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
        return `<div class="rz-row">
            <div class="rz-ic${d.origem === 'bot_whatsapp' ? ' rz-ia' : ''}"><i data-lucide="${d.origem === 'bot_whatsapp' ? 'bot' : ((d.mime_type || '').startsWith('image/') ? 'image' : 'file-text')}"></i></div>
            <div class="rz-tx rz-link" data-action="abrir-documento" data-id="${d.id}"><b>${escapeHtml(d.nome_exibicao || 'Documento')}</b><span>${d.origem === 'bot_whatsapp' ? 'Pelo Robô' : 'Documento'}${d.criado_em ? ' · ' + formatarDataBR(String(d.criado_em).slice(0, 10)) : ''}</span></div>
            <button type="button" data-action="excluir-documento-do-item" data-vinculo-id="${vinculo?.id || ''}" title="Remover deste item" class="rz-ico-btn" style="width:36px;height:36px"><i data-lucide="x" style="width:16px;height:16px;color:var(--muted)"></i></button>
        </div>`;
    }).join('') : `<div class="rz-empty"><div class="rz-ic"><i data-lucide="file-plus-2"></i></div><p>Nenhum documento vinculado. Apólice ou guia anexada aqui fica a um toque do alerta.</p></div>`;
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

// v1.13.0 (fatia 3b-i, REGRAS §3/§15) — o par "Tratar | Reagendar" por
// linha e os 3 formulários inline saíram. Toque na ocorrência abre um
// SHEET DE AÇÕES (Dar baixa · Reagendar · Estornar conforme o status);
// cada ação abre um SHEET DE FORMULÁRIO (abrirSheetForm) com os MESMOS
// ids de campo de antes (#oc-tratar-descricao, #oc-reagendar-data), então
// confirmarTratar/Reagendar/EstornarOcorrencia continuam iguais.
function ocorrenciaPorId(id) {
    return (itemEmFoco?.cofre_ocorrencias_controle || []).find(o => o.id === id);
}
export function abrirAcoesOcorrencia(ocorrenciaId) {
    const oc = ocorrenciaPorId(ocorrenciaId);
    if (!oc) return;
    const acoes = [];
    if (oc.status_execucao === 'aberto') {
        acoes.push({ icone: 'check', titulo: 'Dar baixa', sub: 'Marca como tratada, com descrição opcional', aoTocar: () => alternarAcaoOcorrencia(ocorrenciaId, 'tratar') });
        acoes.push({ icone: 'calendar', titulo: 'Reagendar', sub: 'Muda a data prevista desta ocorrência', aoTocar: () => alternarAcaoOcorrencia(ocorrenciaId, 'reagendar') });
    } else if (oc.status_execucao === 'concluido') {
        acoes.push({ icone: 'undo-2', titulo: 'Estornar', sub: 'Volta pra "Em aberto", fica no histórico', tipo: 'bad', aoTocar: () => alternarAcaoOcorrencia(ocorrenciaId, 'estornar') });
    }
    if (!acoes.length) { mostrarToast('Ocorrência cancelada — sem ações.'); return; }
    if (typeof window.abrirSheetAcoes !== 'function') { mostrarToast('Ações disponíveis só dentro do app principal.', 'erro'); return; }
    window.abrirSheetAcoes({ titulo: `Ocorrência · ${formatarDataBR(oc.data_prevista_atual)}`, sub: itemEmFoco?.titulo || '', acoes });
}

export function alternarAcaoOcorrencia(ocorrenciaId, modo) {
    const oc = ocorrenciaPorId(ocorrenciaId);
    if (!oc) return;
    if (typeof window.abrirSheetForm !== 'function') { mostrarToast('Ações disponíveis só dentro do app principal.', 'erro'); return; }
    ocorrenciaEmAcao = { ocorrenciaId, modo };
    const sub = `${itemEmFoco?.titulo || ''} · vence ${formatarDataBR(oc.data_prevista_atual)}`;
    if (modo === 'tratar') {
        window.abrirSheetForm({ titulo: 'Dar baixa', sub, rotuloSalvar: 'Confirmar baixa',
            corpo: `<div class="rz-f"><label>Descrição da baixa</label><textarea id="oc-tratar-descricao" rows="3" placeholder="Opcional — o que foi feito, com quem, valor"></textarea></div>`,
            aoSalvar: async () => { await confirmarTratarOcorrencia(ocorrenciaId); } });
    } else if (modo === 'reagendar') {
        window.abrirSheetForm({ titulo: 'Reagendar', sub, rotuloSalvar: 'Confirmar novo prazo',
            corpo: `<div class="rz-f"><label>Nova data prevista <i>*</i></label><input type="date" id="oc-reagendar-data" value="${oc.data_prevista_atual}"></div>`,
            aoSalvar: async () => { await confirmarReagendarOcorrencia(ocorrenciaId); } });
    } else if (modo === 'estornar') {
        window.abrirSheetForm({ titulo: 'Estornar ocorrência', sub, rotuloSalvar: 'Confirmar estorno',
            corpo: `<p class="rz-desc">A ocorrência volta para "Em aberto". Isso fica registrado no histórico.</p>`,
            aoSalvar: async () => { await confirmarEstornarOcorrencia(ocorrenciaId); } });
    }
}

export function fecharAcaoOcorrencia() {
    ocorrenciaEmAcao = null;
    if (typeof window.fecharSheet === 'function') window.fecharSheet();
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
