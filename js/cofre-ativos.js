// ============================================================================
// cofre-ativos.js — Raiz Patrimônio · Cofre de Documentos
// Versão: 1.17.1 · 03/09/2026
//
// v1.17.1 — BUG (print 03/09): 6 mensalidades inadimplentes apareciam
// como "A receber". Raiz no banco (fn_fluxo_financeiro_ativo devolvia
// vencimento NULL e status 'previsto' pra tudo que não era pago —
// migration fix_v1). Aqui, montarFinanceiroAtivo passa a honrar os
// status 'atrasado' e 'isento' vindos da RPC além do cálculo por
// vencimento.
//
// v1.17.0 — FATIA 3 da gramática única (REGRAS_EXPERIENCIA_RAIZ_v3_2;
// catálogo rz-* + helpers do index.html v1.106.0). Ficha do ativo:
//   - abrirFichaAtivo(): cabeçalho .rz-entity com status (statusAtivoHtml
//     → renderStatus) e abre sempre em 'resumo' + segmento 'documentos';
//     fotosAtivoCache zerado antes de montar (contador de Arquivos).
//   - faTrocarAba(): destaque por classe .rz-on; aceita os nomes antigos
//     (dados/propriedade/documentos/fotos) e redireciona. NOVAS:
//     faTrocarSegArquivos(), faAtualizarContador() (também em
//     window.faAtualizarContadorFicha pro cofre-controles.js),
//     abrirContratoNoApp() (ponte pra abrirDetalhesContrato do App).
//   - abrirAcoesAtivo() (era alternarMaisAcoesAtivo): abre SHEET com Editar
//     campos do ativo (só imóvel vinculado) · Adicionar fotos · Marcar
//     como vendido · Excluir (vermelha, por último). Painel inline saiu.
//   - montarContratosAtivo/Financeiro/Propriedade/Documentos: listas em
//     .rz-row, KPIs em .rz-kpi, vazios em .rz-empty, status nas 5
//     semânticas (Pago/Em atraso/A receber/A pagar; Vigente/Assinando/
//     Encerrado). "Em atraso" no financeiro do ativo passou a ser
//     calculado (aberto + vencimento < hoje) — antes era "A receber" cinza.
//   - montarDadosAtivo(): grade .rz-kv; "DADOS DO IMÓVEL" (caixa alta) e
//     "Editar →" saíram — título vai pro cabeçalho do card e o botão
//     "Editar dados" do rodapé aponta pro formulário do imóvel
//     (abrir-gestao-imovel) quando é imóvel vinculado. Badge de status
//     saiu daqui (está no cabeçalho de entidade).
//   - montarDocumentosAtivo(): documento vindo do Robô (origem
//     'bot_whatsapp') ganha ícone bot em brass (REGRAS §16).
//   - abrirSeletorFotosAtivo() (era alternarMaisAcoesFotosAtivo): só abre
//     o seletor (painel inline saiu).
//   Não mexido: editor inline de dados_especificos, editor de
//   propriedade (modalGenerico), lightbox, upload — fatia 3b.
//
// v1.16.0 — pedido explícito: "este padrão pode ser o do chip do
// sistema das demais telas" — display do chip Propriedade virou pill
// (mesmo visual do chip Partes novo em cofre-controles.js v1.11.0),
// não mais bloco de linha. Só o DISPLAY mudou, o editor continua com %
// (rateio de propriedade é diferente de item de controle, que não tem
// percentual).
//
// v1.15.0 — pedido explícito: "resolva as pendências de cores
// listadas". 10 usos de emerald-* trocados por token (--sprout-light/
// --pine): 3 ícones-box de card (idênticos, ativoCardHtml), título de
// card rico (h3), box+valor de resumo financeiro (Entradas 6 meses).
//
// v1.14.0 — comentário da seção Propriedade corrigido (não descreve
// mais um caminho "imóvel escreve na tabela antiga" — propriedade_ativo
// é a única fonte, sempre, em qualquer lugar do sistema que grava
// divisão societária — ver index.html v1.101.0 pro resto da
// centralização (RPCs de negócio + popup legado do imóvel).
//
// v1.13.0 — 2 pedidos explícitos: (1) "migre os dados de propriedade da
// tabela propriedade_imovel para propriedade_ativo... no chip de
// propriedade, só apresente o dos ativos" — salvarPropriedadeAtivoAtual()
// não chama mais substituir_propriedade_imovel em nenhuma hipótese,
// sempre grava em propriedade_ativo (dado antigo já migrado via SQL,
// ver DEPLOY/changelog do banco). (2) "durante a criação de um novo
// ativo, seguir a mesma regra e funcionalidade de um novo imóvel
// antigamente" — formulário "Novo ativo" ganhou seção de divisão
// societária embutida (mesmo editor do chip, reaproveitado via
// variável propriedadeEditorAlvo pra não colidir de id — os 2 ficam no
// DOM ao mesmo tempo). Default: sócio de maior % de cotas em 100%,
// mesmo comportamento do formulário antigo de imóvel. salvarAtivo()
// valida soma=100% no cliente (banco também valida, dupla checagem) e
// grava a divisão logo após criar o ativo, mesma RPC do chip. Testado
// como authenticated real (criar ativo + gravar divisão em sequência).
//
// v1.12.0 — chip "Propriedade" (NOVO, pedido explícito: "todos os
// ativos devem ter a definição da propriedade com % de sócio na tabela
// correspondente"): montarPropriedadeAtivo() lê fn_propriedade_do_ativo
// e mostra a divisão atual; abrirEditarPropriedadeAtivo()/
// salvarPropriedadeAtivoAtual() abrem um editor (modalGenerico,
// cofre-ui.js) com linhas sócio interno/externo + %, valida soma=100%
// no cliente (mesma UX imediata do formulário de imóvel) ANTES de
// chamar o RPC (que também valida via trigger — dupla checagem, nunca
// confia só no cliente). Escreve em substituir_propriedade_imovel
// (ativo referencia imóvel — RPC já existente, reaproveitada) ou
// substituir_propriedade_ativo (resto — RPC nova). Chip novo chamado
// dentro de abrirFichaAtivo(), junto dos outros 6.
// Também: chips reordenados (ver ativos-markup.js v1.10.0 pro
// changelog completo da ordem nova).
//
// v1.11.0 — 2 achados reais a partir de 3 screenshots (Family Office
// Karen Corporation): 1) abrirGestaoImovel() agora seta
// window.fichaOrigemAoEditarImovel = 'tab-ativos' antes de trocar de
// aba — sem isso, fechar/salvar a edição do imóvel deixava a tela
// antiga tab-imoveis vazando por baixo do modal fechado (o mecanismo de
// retorno já existia pronto no index.html, só faltava esse chamador).
// 2) renderChipsAtivos() ganhou wrap.scrollLeft = 0 depois de toda
// renderização — fileira de chips (Todos/Imóveis/Veículos/Outros)
// sempre descansa encostada à esquerda, nunca mostra corte residual de
// scroll. Ver ativos-markup.js v1.9.0 pro 3º achado desta rodada
// (.card-ativo/.card-doc sem CSS no contexto embutido).
//
// v1.10.0 — 6ª aba da ficha do ativo: Financeiro (NOVO, pedido explícito,
// 01/09/2026, "adicione a um ativo um novo chip de fluxo financeiro").
// montarFinanceiroAtivo() lê fn_fluxo_financeiro_ativo via cofre-api.js
// (1 chamada só, união de entradas+saídas já feita no banco) e preenche
// 2 mini-cards (Entradas/Saídas, últimos 6 meses) + lista dos últimos
// lançamentos. Escrita NÃO é duplicada aqui — os 2 botões do painel são
// pontes pro App (mesmo princípio de abrirGestaoImovel()):
//   - abrirNovoLancamentoDoAtivo(): switchTab('tab-saidas') +
//     window.abrirNovaDespesa(ativoId) já com o ativo pré-selecionado.
//   - abrirSaidasDoAtivo(): switchTab('tab-saidas') +
//     window.abrirSaidasFiltradasPorAtivo(ativoId, nome) — mesma aba
//     cheia de Saídas, já filtrada por este ativo, com "< Voltar".
// Chamada nova dentro de abrirFichaAtivo(), junto das outras 4 (mesmo
// padrão: tudo montado de uma vez, faTrocarAba() só troca visibilidade).
// Vínculo sempre por ativo_id (cofre_ativos), nunca por imovel_id direto
// — funciona pra qualquer tipo_ativo (veículo, aeronave etc.), não só
// imóvel, já pensando no Raiz Agro/frota (ver Diretrizes Técnicas §2).
//
// v1.9.0 — 2 bugs reais corrigidos, pedido explícito ("vasculhe todo o
// código... editar imóvel está indo pra tela inicial" + "modal não traz
// os campos certos"):
//   1) abrirGestaoImovel(): fazia window.location.href = './?abrir=
//      imovel&ref=...' — RELOAD COMPLETO da página, e index.html nunca
//      soube tratar ?abrir=imovel (só tratava ?ir=tab-X e ?abrir=
//      categorias|subtipos|modelos) — sempre pousava em tab-geral
//      (Visão Geral), nunca no imóvel. Corrigido com a mesma ponte já
//      usada em cadastrar-imovel-app: switchTab('tab-imoveis') +
//      editarImovel(id) direto, sem reload, sem perder estado.
//   2) atualizarCamposEstruturadosAtivo() (nova, separada de
//      aoMudarTipoAtivo): os campos matrícula/endereço/área/valor
//      estimado (CAMPOS_POR_TIPO_ATIVO.imovel) apareciam SEMPRE que
//      tipo=Imóvel, mesmo já tendo escolhido um imóvel existente em
//      "Qual imóvel?" — redundante (o dado já existe na tabela
//      imoveis) e criava a confusão de "campos errados aparecendo".
//      Agora só aparecem quando NÃO há imóvel vinculado selecionado.
//
// v1.8.0 — pedido explícito, 01/09/2026, achado com screenshot real:
//   1) BUG REAL corrigido em montarDadosAtivo(): a grade de dados do
//      imóvel entrava dentro de um flex justify-between de 2 filhos —
//      layout quebrava. Agora escreve em #fa-dados-imovel-grid, container
//      próprio (ver ativos-markup.js v1.6.0).
//   2) "Sem dados estruturados cadastrados ainda." deixou de aparecer
//      pra ativo vinculado a imóvel sem dados_especificos preenchidos —
//      a grade acima já É o dado de verdade; mostrar essa frase ficava
//      confuso ("veja como aparece, ruim, precisa já aparecer os dados
//      do imóvel").
//   3) "Este ativo referencia um imóvel já cadastrado" e "Abrir gestão
//      do imóvel →" reescritos — cabeçalho "Dados do imóvel" + link
//      "Editar →", sem expor a existência de 2 sistemas separados
//      ("não temos mais dois módulos... elimine qq menção que seja por
//      módulo").
//   4) renderAtivosLista() ganhou agrupamento por empreendimento, mesmo
//      critério da lista antiga de Imóveis (só agrupa com >10 imóveis
//      na carteira) — pedido explícito: "prefiro o padrão da lista
//      antiga de imóveis".
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
// v1.1.6 — DS C-8: abrirAcoesAtivo() só fazia classList.toggle,
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
import { mostrarToast, refrescarIcones, alternarToggle, abrirModal, fecharModal, modalGenerico } from './cofre-ui.js';
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

    // v1.8.0 (pedido explícito, 01/09/2026: "ajustar o modal de
    // consultas para consultar nos campos chaves de ativo, contrato e
    // itens de controle. ajuste para filtrar por status, por alerta")
    // — filtroStatus/filtroAlerta são lidos DIRETO do DOM aqui dentro
    // (não viram parâmetro da função) de propósito: são "sticky" — só o
    // próprio modal os define, então qualquer chamada existente
    // (chips, digitação no campo de busca, ir-ativos) continua
    // funcionando sem precisar passar 2 argumentos novos — os filtros
    // de status/alerta simplesmente se somam ao que já estava rodando.
    const filtroStatus = document.getElementById('filtro-ativo-status')?.value || '';
    const filtroAlerta = document.getElementById('filtro-ativo-alerta')?.value || '';

    // Busca por texto agora cobre 3 campos-chave, não só o nome do
    // ativo: locatário do contrato principal (quando o ativo referencia
    // um imóvel) e título de qualquer item de controle vinculado —
    // "consultar nos campos chaves de ativo, contrato e itens de
    // controle". ocorrenciasPorAtivo é montado 1x por render (não por
    // item da lista) — mesmo cuidado de desempenho já usado no
    // agrupamento por empreendimento.
    const ocorrenciasPorAtivo = {};
    estado.ocorrenciasAbertas.forEach(oc => {
        const idAtivo = oc.cofre_itens_controle?.ativo_id;
        if (!idAtivo) return;
        (ocorrenciasPorAtivo[idAtivo] = ocorrenciasPorAtivo[idAtivo] || []).push(oc);
    });

    const ativoBateComBusca = (a, resumo) => {
        if (!termo) return true;
        if (a.nome_exibicao.toLowerCase().includes(termo)) return true;
        if (resumo?.contratoPrincipal?.locatario && resumo.contratoPrincipal.locatario.toLowerCase().includes(termo)) return true;
        const ocorrencias = ocorrenciasPorAtivo[a.id] || [];
        return ocorrencias.some(oc => (oc.cofre_itens_controle?.titulo || '').toLowerCase().includes(termo));
    };

    const ativoBateComStatus = (a, resumo) => {
        if (!filtroStatus) return true;
        // "prop:<status>" checa o status do IMÓVEL (Vago/Alugado/
        // Assinando); "ativo:<status>" checa cofre_ativos.status
        // (ativo/vendido/arquivado) — 2 vocabulários diferentes, o
        // prefixo diz qual campo olhar. Ver modal-busca-ativos.
        const [tipoFiltro, valor] = filtroStatus.split(':');
        if (tipoFiltro === 'prop') return resumo?.status === valor;
        if (tipoFiltro === 'ativo') return (a.status || 'ativo') === valor;
        return true;
    };

    const ativoBateComAlerta = (a) => {
        if (!filtroAlerta) return true;
        const temAlerta = (ocorrenciasPorAtivo[a.id] || []).length > 0;
        return filtroAlerta === 'com' ? temAlerta : !temAlerta;
    };

    const lista = estado.ativos.filter(a => {
        if (tiposFiltro && !tiposFiltro.includes(a.tipo_ativo)) return false;
        const resumo = a.entidade_origem_tipo === 'imovel' ? resumoImoveisPorId.get(a.entidade_origem_id) : null;
        if (!ativoBateComBusca(a, resumo)) return false;
        if (!ativoBateComStatus(a, resumo)) return false;
        if (!ativoBateComAlerta(a)) return false;
        return true;
    });

    const container = document.getElementById('ativos-lista');

    // v1.7.0 (pedido explícito, 01/09/2026: "a lista de ativos está bem
    // diferente da lista antiga de imóveis... prefiro o padrão da lista
    // antiga, favor ajustar") — agrupamento por empreendimento, MESMO
    // critério da lista antiga (index.html, renderImoveis()): só agrupa
    // quando há mais de 10 imóveis no TOTAL da carteira (traço do porte
    // da carteira, não do filtro do momento). Ativos que não são imóvel
    // (sem empreendimento) caem em "(Outros ativos)", sempre por último
    // — hoje (Rumo) isso nunca acontece, mas o critério já vem pronto
    // pra quando existirem veículos/outros tipos na carteira.
    const totalImoveisNaCarteira = estado.ativos.filter(a => a.entidade_origem_tipo === 'imovel').length;

    if (totalImoveisNaCarteira > 10) {
        const grupos = {};
        lista.forEach(a => {
            const resumo = a.entidade_origem_tipo === 'imovel' ? resumoImoveisPorId.get(a.entidade_origem_id) : null;
            const chave = resumo?.empreendimento || (a.entidade_origem_tipo === 'imovel' ? '(Sem empreendimento)' : '(Outros ativos)');
            (grupos[chave] = grupos[chave] || []).push(a);
        });
        const nomesGrupos = Object.keys(grupos).sort((x, y) => {
            if (x === '(Outros ativos)') return 1;
            if (y === '(Outros ativos)') return -1;
            return x.localeCompare(y);
        });
        container.innerHTML = nomesGrupos.map(nome => `
            <div class="mb-1">
                <p class="text-[11px] font-bold uppercase tracking-wide text-slate-500 px-1 mb-2 mt-4 first:mt-0">${escapeHtml(nome)} <span class="text-slate-400">(${grupos[nome].length})</span></p>
                <div class="space-y-2">${grupos[nome].map(ativoCardHtml).join('')}</div>
            </div>
        `).join('');
    } else {
        container.innerHTML = `<div class="space-y-2">${lista.map(ativoCardHtml).join('')}</div>`;
    }

    document.getElementById('ativos-estado-vazio').classList.toggle('hidden', estado.ativos.length !== 0);
    container.classList.toggle('hidden', estado.ativos.length === 0);
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
    // v1.9.0 (02/09/2026, pedido explícito: "os chips devem correr na
    // horizontal mas sem deixar a mostra a rolagem") — a barra em si já
    // estava escondida (.raiz-sem-scrollbar, ver ativos-markup.js), mas
    // nada garantia que a fileira sempre DESCANSA encostada à esquerda:
    // se a pessoa arrastasse pra ver "Outros" e depois trocasse de chip,
    // o innerHTML era reconstruído no MESMO elemento, e sobrar scroll
    // residual fazia o 1º chip ("Todos") aparecer cortado mesmo sem
    // ninguém estar arrastando — o efeito que o Nicola reportou. Reset
    // explícito, incondicional, depois de toda renderização.
    wrap.scrollLeft = 0;
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
            <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-none overflow-hidden" style="background:var(--sprout-light);color:var(--pine)">
                ${resumoImovel.foto ? `<img src="${resumoImovel.foto}" class="w-full h-full object-cover">` : `<i data-lucide="home" style="width:20px;height:20px"></i>`}
            </div>
            <div class="flex-1 min-w-0">
                <h3 class="text-xs font-extrabold truncate" style="color:var(--pine)">${escapeHtml(titulo)}</h3>
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
        <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-none" style="background:var(--sprout-light);color:var(--pine)"><i data-lucide="${iconeAtivo(a.tipo_ativo)}" style="width:20px;height:20px"></i></div>
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
export async function abrirFormAtivo() {
    document.getElementById('at-status').textContent = '';
    abrirModal('form-ativo-wrapper');
    aoMudarTipoAtivo();

    // v1.11.0 (NOVO, 02/09/2026) — divisão societária embutida, mesmo
    // editor do chip Propriedade (ver comentário em ativos-markup.js).
    // Default: sócio de maior % de cotas em 100%, mesmo comportamento
    // que o formulário antigo de imóvel já tinha (ver index.html,
    // cancelarEdicaoImovel) — replicado aqui pra "seguir a mesma regra".
    propriedadeEditorAlvo = { linhas: 'naf-pe-linhas', soma: 'naf-pe-soma' };
    if (propriedadePessoasCache === null) {
        propriedadePessoasCache = await api.listarPessoasInternas(estado.clienteId);
    }
    const socioMaiorCota = [...(propriedadePessoasCache || [])]
        .filter(p => (p.percentual_cotas_empresa || 0) > 0)
        .sort((a, b) => (b.percentual_cotas_empresa || 0) - (a.percentual_cotas_empresa || 0))[0];
    propriedadeLinhasEmEdicao = socioMaiorCota
        ? [{ tipo_proprietario: 'socio_interno', pessoa_id: socioMaiorCota.id, nome_externo: null, percentual: 100 }]
        : [{ tipo_proprietario: 'socio_interno', pessoa_id: null, nome_externo: null, percentual: 100 }];
    renderPropriedadeEditor();
}

export function fecharFormAtivo() {
    fecharModal('form-ativo-wrapper');
}

export async function aoMudarTipoAtivo() {
    const tipo = document.getElementById('at-tipo').value;
    document.getElementById('at-origem-imovel-wrapper').classList.toggle('hidden', tipo !== 'imovel');
    if (tipo === 'imovel') {
        const imoveisCliente = await api.listarImoveisDoCliente(estado.clienteId);
        // v1.96.2 (pedido explícito, achado real: "nao traz os campos...
        // nao todos os campos de imovel que tinhamos antes") — opção
        // "nenhum" explícita no topo, valor vazio de propósito (é o
        // que atualizarCamposEstruturadosAtivo() usa pra decidir se
        // mostra os campos avulsos ou não — ver comentário lá).
        document.getElementById('at-origem-imovel').innerHTML =
            '<option value="">— nenhum, cadastrar dados avulsos abaixo —</option>' +
            imoveisCliente.map(i => `<option value="${i.id}">${escapeHtml(i.endereco_rua)}, ${escapeHtml(i.endereco_num || '')}</option>`).join('');
    }
    atualizarCamposEstruturadosAtivo();
}

// v1.96.2 (01/09/2026, pedido explícito, achado real com screenshot:
// "no modal bottom sheet, ao escolher tipo de ativo = imovel, ele nao
// traz os campos... nao todos os campos de imovel que tinhamos antes")
// — separada de aoMudarTipoAtivo() de propósito: precisa rodar TAMBÉM
// quando "Qual imóvel?" muda, não só quando o TIPO muda (por isso
// ganhou data-action-change própria — ver ativos-markup.js/
// cofre-app.js).
//
// O que estava confuso: CAMPOS_POR_TIPO_ATIVO.imovel (matrícula/
// endereço/área/valor estimado) existe pro caso de um imóvel AVULSO no
// Cofre — um bem que nunca foi cadastrado no App de verdade (ver
// comentário original em cofre-validacoes.js, 25/08/2026). Antes desta
// correção, esses 4 campos apareciam SEMPRE que tipo=Imóvel, mesmo
// quando a pessoa já tinha escolhido um imóvel EXISTENTE em "Qual
// imóvel?" — nesse caso eles são pura redundância (o endereço/valor já
// existem na tabela imoveis, cadastrar nome ali de novo não faz
// sentido) e pareciam "os campos errados" por estarem sobrando na
// tela errada. Agora só aparecem quando NÃO há imóvel selecionado.
export function atualizarCamposEstruturadosAtivo() {
    const tipo = document.getElementById('at-tipo').value;
    const selImovel = document.getElementById('at-origem-imovel');
    const semImovelVinculado = tipo !== 'imovel' || !selImovel || !selImovel.value;
    document.getElementById('at-campos-estruturados').innerHTML = semImovelVinculado
        ? renderizarCamposEstruturados(tipo, {})
        : `<p class="text-xs sm:col-span-2" style="color:var(--sage)">Endereço, IPTU e valor de mercado já vêm de "${escapeHtml(selImovel.options[selImovel.selectedIndex]?.text || 'imóvel selecionado')}" — nada a preencher aqui.</p>`;
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

    // v1.11.0 (NOVO, 02/09/2026) — mesma validação de soma=100% que o
    // chip Propriedade usa, agora também na criação (DB também valida
    // via trigger — dupla checagem, nunca confia só no cliente).
    const somaPropriedade = propriedadeSomaAtual();
    if (Math.round(somaPropriedade * 100) / 100 !== 100) {
        statusEl.textContent = `⚠️ A soma da divisão societária precisa ser 100% (está em ${somaPropriedade}%).`;
        statusEl.style.color = 'var(--danger)';
        return;
    }
    for (const l of propriedadeLinhasEmEdicao) {
        const temNome = l.tipo_proprietario === 'socio_interno' ? !!l.pessoa_id : !!(l.nome_externo && l.nome_externo.trim());
        if (!temNome) { statusEl.textContent = '⚠️ Preencha o sócio/nome de todas as linhas da divisão societária.'; statusEl.style.color = 'var(--danger)'; return; }
    }

    const payload = { cliente_id: estado.clienteId, tipo_ativo: tipo, nome_exibicao: nome, status: 'ativo', dados_especificos: dadosEspecificos, criado_por: estado.pessoa.id };
    if (tipo === 'imovel') {
        const imovelId = document.getElementById('at-origem-imovel').value;
        if (!imovelId) { statusEl.textContent = '⚠️ Selecione o imóvel.'; statusEl.style.color = 'var(--danger)'; return; }
        payload.entidade_origem_tipo = 'imovel';
        payload.entidade_origem_id = imovelId;
    }

    try {
        const novoAtivo = await api.criarAtivo(payload);
        // Divisão societária gravada logo em seguida, já com o id do
        // ativo recém-criado — mesma RPC do chip Propriedade, nenhuma
        // lógica duplicada.
        const linhasParaApi = propriedadeLinhasEmEdicao.map(l => ({
            tipo_proprietario: l.tipo_proprietario,
            pessoa_id: l.pessoa_id || '',
            nome_externo: l.nome_externo || '',
            percentual: parseFloat(l.percentual) || 0
        }));
        await api.salvarPropriedadeAtivo(novoAtivo.id, linhasParaApi);

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
    // v1.17.0 (fatia 3, REGRAS §11) — cabeçalho de entidade único
    // (.rz-entity): ícone 52 · título · contexto · status à direita. O
    // status do ativo (Ativo/Vendido/Arquivado) vem pra cá, via
    // renderStatus() (index.html v1.106.0) — antes ficava dentro do box
    // Dados, longe do nome.
    document.getElementById('fa-cabecalho').innerHTML = `
        <div class="rz-ic"><i data-lucide="${iconeAtivo(a.tipo_ativo)}"></i></div>
        <div class="rz-tx">
            <b>${escapeHtml(a.nome_exibicao)}</b>
            <span>${escapeHtml(rotuloTipoAtivo(a.tipo_ativo))}</span>
        </div>
        ${statusAtivoHtml(a)}
    `;
    document.getElementById('fa-editar-wrapper').classList.add('hidden');

    fotosAtivoCache = [];
    await montarDadosAtivo(a);
    montarDocumentosAtivo(a);
    await montarControlesAtivo(a);
    await montarContratosAtivo(a);
    await montarFotosAtivo(a);
    await montarFinanceiroAtivo(a);
    await montarPropriedadeAtivo(a);

    // v1.93.0 — toda vez que a ficha abre, começa na aba "Dados" (mesmo
    // comportamento do protótipo: "Ficha abre sempre em Resumo" já era
    // regra deste projeto desde antes das abas existirem — só reaplicado
    // aqui em cima do mecanismo novo).
    faTrocarAba('resumo');
    faTrocarSegArquivos('documentos');

    mudarTela('ficha-ativo');
}

// v1.93.0 (pedido explícito, 31/08/2026, "evoluir a exemplo do
// protótipo") — troca de aba dentro da ficha do ativo (Dados/
// Documentos/Controles/Contratos/Fotos). Todo o CONTEÚDO de cada aba já
// é montado de uma vez em abrirFichaAtivo() (nenhuma busca nova
// acontece ao trocar de aba) — esta função só troca visibilidade +
// destaque visual, mesmo espírito leve do trocarSub() do protótipo.
export function faTrocarAba(nomeAba) {
    // v1.17.0 — chips .rz-chip: destaque é só a classe .rz-on (sem style
    // inline). Compatibilidade: 'dados' → 'resumo', 'propriedade' → 'resumo',
    // 'documentos'/'fotos' → 'arquivos' (quem chamava com os nomes antigos
    // continua caindo no lugar certo).
    const mapa = { dados: 'resumo', propriedade: 'resumo', documentos: 'arquivos', fotos: 'arquivos' };
    const alvo = mapa[nomeAba] || nomeAba;
    document.querySelectorAll('.fa-subtab').forEach(btn => {
        btn.classList.toggle('rz-on', btn.dataset.faAba === alvo);
    });
    document.querySelectorAll('.fa-painel').forEach(painel => {
        painel.classList.toggle('hidden', painel.id !== 'fa-painel-' + alvo);
    });
    if (nomeAba === 'fotos') faTrocarSegArquivos('fotos');
    if (nomeAba === 'documentos') faTrocarSegArquivos('documentos');
    refrescarIcones();
}

// v1.17.0 — segmento Documentos · Fotos dentro do chip Arquivos (REGRAS §8).
export function faTrocarSegArquivos(nome) {
    document.querySelectorAll('#fa-seg-arquivos button').forEach(b => b.classList.toggle('rz-on', b.dataset.faSeg === nome));
    document.getElementById('fa-arq-documentos')?.classList.toggle('hidden', nome !== 'documentos');
    document.getElementById('fa-arq-fotos')?.classList.toggle('hidden', nome !== 'fotos');
    refrescarIcones();
}

// v1.17.0 — contador dos chips da ficha (.rz-n). warn=true pinta o
// contador de vinho (há algo pra olhar naquele chip).
export function faAtualizarContador(chip, n, warn = false) {
    // exposto em window pra cofre-controles.js (evita import circular)

    const el = document.getElementById('fa-chip-n-' + chip);
    if (!el) return;
    el.textContent = String(n);
    el.closest('.rz-chip')?.classList.toggle('rz-warn', !!warn);
}

// v1.17.0 — status do ativo nas 5 semânticas (REGRAS §10), via
// renderStatus() global; fallback simples se a ficha rodar fora do App.
window.faAtualizarContadorFicha = faAtualizarContador;

function statusAtivoHtml(a) {
    const r = typeof window.renderStatus === 'function' ? window.renderStatus : (c, t) => `<span class="rz-st rz-neu">${escapeHtml(t || c)}</span>`;
    if (a.status === 'arquivado') return r('bad', 'Arquivado');
    if (a.status === 'vendido') return r('neu', 'Vendido');
    return r('ok', 'Ativo');
}

// v1.17.0 — "Mais ações" abre SHEET (REGRAS §6): dados, não HTML; a
// destrutiva vai por último em vermelho sozinha (abrirSheetAcoes ordena).
function sheetOuAviso(config) {
    if (typeof window.abrirSheetAcoes === 'function') { window.abrirSheetAcoes(config); return true; }
    mostrarToast('Ações disponíveis só dentro do app principal.', 'erro');
    return false;
}

export function fecharFichaAtivo() {
    mudarTela('ativos');
    window.dispatchEvent(new CustomEvent('cofre:recarregar-ativos'));
}

export function abrirAcoesAtivo() {
    const a = estado.ativoEmFoco;
    if (!a) return;
    const ehImovel = a.entidade_origem_tipo === 'imovel';
    const acoes = [];
    // quando o rodapé leva pro formulário do imóvel, o editor dos campos
    // estruturados do ativo (dados_especificos) continua alcançável daqui
    if (ehImovel) acoes.push({ icone: 'list', titulo: 'Editar campos do ativo', sub: 'Campos específicos deste tipo', aoTocar: () => { faTrocarAba('resumo'); alternarEditarAtivo(); } });
    acoes.push({ icone: 'image-plus', titulo: 'Adicionar fotos', aoTocar: () => { faTrocarAba('arquivos'); faTrocarSegArquivos('fotos'); document.getElementById('fa-foto-input')?.click(); } });
    if (a.status !== 'vendido') acoes.push({ icone: 'tag', titulo: 'Marcar como vendido', sub: 'Desliga alertas e sai da vitrine', aoTocar: () => marcarAtivoVendidoAtual() });
    acoes.push({ icone: 'trash-2', titulo: 'Excluir ativo', tipo: 'bad', aoTocar: () => excluirAtivoAtual() });
    sheetOuAviso({ titulo: a.nome_exibicao, sub: rotuloTipoAtivo(a.tipo_ativo), acoes });
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

    const sub = document.getElementById('fa-contratos-sub');
    faAtualizarContador('contratos', 0);
    if (sub) sub.textContent = '';

    if (a.entidade_origem_tipo !== 'imovel') {
        painel.innerHTML = `<div class="rz-empty"><div class="rz-ic"><i data-lucide="file-text"></i></div><p>Contratos de locação só existem pra ativos do tipo imóvel.</p></div>`;
        refrescarIcones();
        return;
    }

    try {
        const lista = await api.buscarContratosDoImovel(a.entidade_origem_id);
        const vigentes = lista.filter(c => c.status === 'Ativo' || c.status === 'Assinando');
        faAtualizarContador('contratos', vigentes.length);
        if (sub) sub.textContent = lista.length ? `${vigentes.length} vigente${vigentes.length === 1 ? '' : 's'} · ${lista.length - vigentes.length} encerrado${lista.length - vigentes.length === 1 ? '' : 's'}` : '';
        if (!lista.length) {
            // v1.17.0 — único card vazio que RENDERIZA sem ação própria
            // (exceção documentada, REGRAS §6): a contratação nasce na aba
            // Contratos do App, não daqui.
            painel.innerHTML = `<div class="rz-empty"><div class="rz-ic"><i data-lucide="file-text"></i></div><p>Nenhum contrato pra este imóvel ainda. Inicie a contratação na aba Contratos.</p></div>`;
            refrescarIcones();
            return;
        }
        // v1.17.0 — item de lista único (.rz-row, REGRAS §9) + status nas
        // 5 semânticas; toque abre o contrato na aba Contratos do App
        // (abrirContratoNoApp), lógica de contrato continua só lá.
        const r = typeof window.renderStatus === 'function' ? window.renderStatus : (c, t) => `<span class="rz-st rz-neu">${escapeHtml(t || c)}</span>`;
        const statusDe = { Ativo: r('ok', 'Vigente'), Assinando: r('run', 'Assinando'), Suspenso: r('neu', 'Suspenso'), Finalizado: r('neu', 'Encerrado'), Cancelado: r('neu', 'Cancelado') };
        painel.innerHTML = lista.map(c => `
            <div class="rz-row rz-link" data-action="fa-abrir-contrato-app" data-contrato-id="${c.id}">
                <div class="rz-ic${(c.status === 'Ativo' || c.status === 'Assinando') ? '' : ' rz-neu'}"><i data-lucide="${c.status === 'Assinando' ? 'file-signature' : (c.status === 'Ativo' ? 'file-text' : 'archive')}"></i></div>
                <div class="rz-tx">
                    <b>${escapeHtml(c.locatario || 'Locatário não informado')}</b>
                    <span>${c.inicio ? formatarDataBR(c.inicio) : ''}${c.fim ? ' → ' + formatarDataBR(c.fim) : ''}</span>
                </div>
                <div class="rz-rt">
                    <b>R$ ${Number(c.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b>
                    ${statusDe[c.status] || r(c.status || 'neu')}
                </div>
            </div>`).join('');
        refrescarIcones();
    } catch (err) {
        painel.innerHTML = `<p class="rz-desc" style="color:var(--danger)">Não foi possível carregar os contratos agora.</p>`;
        console.warn('[cofre-ativos] montarContratosAtivo falhou:', err.message);
    }
}

// ============================================================================
// FINANCEIRO (NOVO, v1.10.0, pedido explícito, 01/09/2026) — "adicione a
// um ativo um novo chip de fluxo financeiro onde é possível ver as
// entradas e saídas daquele ativo". Só LEITURA aqui (fn_fluxo_financeiro_
// ativo, cofre-api.js) — os 2 botões de ação são pontes pro App, nunca
// duplicam o formulário de despesa (abrirNovaDespesa já existe lá,
// mesmo princípio de abrirGestaoImovel logo abaixo).
// ============================================================================
async function montarFinanceiroAtivo(a) {
    const painelResumo = document.getElementById('fa-financeiro-resumo');
    const painelLista = document.getElementById('fa-financeiro-lista');
    if (!painelResumo || !painelLista) return;

    painelResumo.innerHTML = `<p class="rz-desc" style="grid-column:1/-1">Carregando...</p>`;
    painelLista.innerHTML = '';

    const fmtMoeda = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    const fmtData = (iso) => iso ? formatarDataBR(iso) : '—';

    const fluxo = await api.buscarFluxoFinanceiroAtivo(a.id);

    // v1.17.0 (fatia 3) — KPIs no formato único (.rz-kpi, REGRAS §9) e
    // lista em .rz-row com status nas 5 semânticas via renderStatus().
    // "Em atraso" agora é calculado (entrada aberta com vencimento
    // passado), antes tudo aberto era "A receber" cinza.
    painelResumo.innerHTML = `
        <div class="rz-kpi rz-in"><small>Entradas · 6 meses</small><b>${fmtMoeda(fluxo.totalEntradas6m)}</b></div>
        <div class="rz-kpi"><small>Saídas · 6 meses</small><b>${fmtMoeda(fluxo.totalSaidas6m)}</b></div>`;

    if (!fluxo.itens.length) {
        painelLista.innerHTML = `<div class="rz-empty"><div class="rz-ic"><i data-lucide="wallet"></i></div><p>Nenhum lançamento pra este ativo nos últimos 6 meses.</p></div>`;
    } else {
        const r = typeof window.renderStatus === 'function' ? window.renderStatus : (c, t) => `<span class="rz-st rz-neu">${escapeHtml(t || c)}</span>`;
        const hoje = new Date().toISOString().slice(0, 10);
        painelLista.innerHTML = fluxo.itens.map(it => {
            const ehEntrada = it.direcao === 'entrada';
            // v1.17.1 — a RPC (fix_v1, 03/09) agora devolve 'atrasado' e
            // 'isento' pra mensalidade, e vencimento de verdade; o cálculo
            // por data fica como segunda rede (lançamentos só têm
            // previsto/realizado).
            const pago = it.status === 'realizado';
            const isento = it.status === 'isento';
            const atrasado = !pago && !isento && (it.status === 'atrasado' || (it.vencimento && it.vencimento < hoje));
            const status = pago ? r('ok', 'Pago') : isento ? r('neu', 'Isento') : (atrasado ? r('bad', 'Em atraso') : r('run', ehEntrada ? 'A receber' : 'A pagar'));
            const icone = pago ? (ehEntrada ? 'arrow-down-left' : 'arrow-up-right') : isento ? 'minus-circle' : (atrasado ? 'alarm-clock' : 'clock');
            return `
                <div class="rz-row">
                    <div class="rz-ic${atrasado ? ' rz-bad' : ''}"><i data-lucide="${icone}"></i></div>
                    <div class="rz-tx">
                        <b>${escapeHtml(it.descricao || '')}</b>
                        <span>${it.fornecedor ? escapeHtml(it.fornecedor) + ' · ' : ''}${fmtData(it.data_pagamento || it.vencimento)}</span>
                    </div>
                    <div class="rz-rt">
                        <b class="${ehEntrada ? 'rz-in' : 'rz-out'}">${ehEntrada ? '+ ' : '− '}${fmtMoeda(it.valor)}</b>
                        ${status}
                    </div>
                </div>`;
        }).join('');
    }
    refrescarIcones();
}

// Ponte pro App — mesmo princípio de abrirGestaoImovel() logo abaixo:
// nenhuma lógica de formulário duplicada aqui, só troca de aba + chamada
// da função que já existe no index.html, com o ativo já pré-selecionado.
// v1.17.0 — ponte pro App: abre o contrato na aba Contratos (mesmo
// princípio de abrirGestaoImovel: nada de contrato duplicado aqui).
export function abrirContratoNoApp(contratoId) {
    if (!contratoId) return;
    if (typeof window.switchTab === 'function' && typeof window.abrirDetalhesContrato === 'function') {
        window.switchTab('tab-contratos');
        window.abrirDetalhesContrato(contratoId);
    } else {
        mostrarToast('Contrato só abre dentro do app principal.', 'erro');
    }
}

export function abrirNovoLancamentoDoAtivo() {
    const a = estado.ativoEmFoco;
    if (!a) return;
    if (typeof window.switchTab === 'function' && typeof window.abrirNovaDespesa === 'function') {
        window.switchTab('tab-saidas');
        window.abrirNovaDespesa(a.id);
    } else {
        mostrarToast('Lançamento de despesa só disponível dentro do app principal.', 'erro');
    }
}

export function abrirSaidasDoAtivo() {
    const a = estado.ativoEmFoco;
    if (!a) return;
    if (typeof window.switchTab === 'function' && typeof window.abrirSaidasFiltradasPorAtivo === 'function') {
        window.switchTab('tab-saidas');
        window.abrirSaidasFiltradasPorAtivo(a.id, a.nome_exibicao);
    } else {
        mostrarToast('Tela de Saídas só disponível dentro do app principal.', 'erro');
    }
}

// ============================================================================
// PROPRIEDADE ("todos os ativos devem ter a definição da propriedade
// com % de sócio na tabela correspondente"). propriedade_ativo é a
// ÚNICA fonte (leitura via fn_propriedade_do_ativo, escrita via
// substituir_propriedade_ativo) — desde v1.13.0, dado de
// propriedade_imovel já migrado e centralizado, chip nunca mais toca
// na tabela antiga. Editor é um modal dinâmico (modalGenerico,
// cofre-ui.js), estado das linhas em memória só enquanto está aberto
// (mesmo espírito do sociosAdicionais do formulário de imóvel).
// ============================================================================
let propriedadeLinhasEmEdicao = [];
let propriedadePessoasCache = null; // null = ainda não carregado
// v1.13.0 (02/09/2026) — o MESMO editor (linhas + soma) agora é usado em
// 2 lugares: o popup de "Editar divisão" do chip Propriedade (ids
// pe-linhas/pe-soma, dentro do modal-generico) E embutido no formulário
// de Novo Ativo (ids naf-pe-linhas/naf-pe-soma, pedido explícito:
// "durante a criação de um novo ativo, seguir a mesma regra e
// funcionalidade de um novo imóvel antigamente"). Como o formulário de
// Novo Ativo é Tipo A (estático no DOM, sempre presente) e o
// modal-generico também fica no DOM mesmo escondido, os 2 containers
// #pe-linhas/#naf-pe-linhas coexistem — por isso o alvo é uma variável,
// nunca um id fixo, pra não colidir.
let propriedadeEditorAlvo = { linhas: 'pe-linhas', soma: 'pe-soma' };

async function montarPropriedadeAtivo(a) {
    const lista = document.getElementById('fa-propriedade-lista');
    if (!lista) return;
    lista.innerHTML = `<p class="rz-desc">Carregando...</p>`;

    const linhas = await api.buscarPropriedadeDoAtivo(a.id);

    if (!linhas.length) {
        lista.innerHTML = `<div class="rz-empty"><div class="rz-ic"><i data-lucide="users"></i></div><p>Sem divisão de propriedade ainda. Sem ela, a distribuição de resultados não sabe pra quem repassar.</p></div>`;
        refrescarIcones();
        return;
    }

    // v1.16.0 (02/09/2026, pedido explícito: "as partes devem ser
    // vários chips... este padrão pode ser o do chip do sistema das
    // demais telas") — visual de pill/chip igual ao Partes do item de
    // controle (cofre-controles.js), não mais bloco de linha. Só o
    // DISPLAY mudou — o editor continua com % (aqui é rateio de
    // propriedade, diferente de item de controle que não tem %).
    // v1.17.0 (fatia 3, REGRAS §9/§11) — de pills pra .rz-row (sócio à
    // esquerda, % em destaque à direita), mesmo item de lista do resto da
    // ficha. Pills ficam só pra filtro/sub-navegação (REGRAS §8).
    lista.innerHTML = linhas.map(l => `
        <div class="rz-row">
            <div class="rz-ic"><i data-lucide="${l.nome_pessoa ? 'user' : 'user-round'}"></i></div>
            <div class="rz-tx"><b>${escapeHtml(l.nome_pessoa || l.nome_externo || 'Sem nome')}</b><span>${l.nome_pessoa ? 'Sócio' : 'Parte externa'}</span></div>
            <div class="rz-rt"><b style="color:var(--sprout)">${Number(l.percentual)}%</b></div>
        </div>`).join('');
    refrescarIcones();
}

function propriedadeSomaAtual() {
    return propriedadeLinhasEmEdicao.reduce((s, l) => s + (parseFloat(l.percentual) || 0), 0);
}

function propriedadeLinhaHtml(l, idx) {
    const ehInterno = l.tipo_proprietario === 'socio_interno';
    const optsPessoas = (propriedadePessoasCache || []).map(p =>
        `<option value="${p.id}" ${ehInterno && l.pessoa_id === p.id ? 'selected' : ''}>${escapeHtml(p.nome)}</option>`).join('');
    return `
        <div class="flex gap-2 items-start" data-propriedade-linha="${idx}">
            <div class="flex-1 space-y-1">
                <select onchange="window.__peMudarTipo(${idx}, this.value)" style="width:100%;padding:6px;border:1px solid #cbd5e1;border-radius:6px;font-size:12px;background:#f8fafc;">
                    <option value="socio_interno" ${ehInterno ? 'selected' : ''}>Sócio interno</option>
                    <option value="terceiro_externo" ${!ehInterno ? 'selected' : ''}>Outro (nome livre)</option>
                </select>
                ${ehInterno
                    ? `<select onchange="window.__peMudarPessoa(${idx}, this.value)" style="width:100%;padding:6px;border:1px solid #cbd5e1;border-radius:6px;font-size:12px;background:#f8fafc;"><option value="">— selecionar —</option>${optsPessoas}</select>`
                    : `<input type="text" value="${escapeHtml(l.nome_externo || '')}" oninput="window.__peMudarNomeExterno(${idx}, this.value)" placeholder="Nome" style="width:100%;padding:6px;border:1px solid #cbd5e1;border-radius:6px;font-size:12px;">`}
            </div>
            <input type="number" step="0.01" value="${l.percentual ?? ''}" oninput="window.__peMudarPercentual(${idx}, this.value)" style="width:70px;padding:6px;border:1px solid #cbd5e1;border-radius:6px;font-size:12px;" placeholder="%">
            <button onclick="window.__peRemoverLinha(${idx})" style="background:transparent;border:none;color:var(--danger);flex:none;padding:6px 0;"><i data-lucide="x" style="width:16px;height:16px"></i></button>
        </div>`;
}

function renderPropriedadeEditor() {
    const container = document.getElementById(propriedadeEditorAlvo.linhas);
    if (!container) return;
    container.innerHTML = propriedadeLinhasEmEdicao.map((l, i) => propriedadeLinhaHtml(l, i)).join('');
    const soma = propriedadeSomaAtual();
    const somaEl = document.getElementById(propriedadeEditorAlvo.soma);
    if (somaEl) {
        somaEl.textContent = soma + '%';
        somaEl.style.color = soma === 100 ? 'var(--success)' : 'var(--danger)';
    }
    refrescarIcones();
}

// Funções ponte pro editor (chamadas via onchange/oninput inline, já que
// o container é reconstruído via innerHTML — mesmo padrão já usado nos
// popups Tipo B do App). Expostas em window de propósito.
window.__peMudarTipo = (idx, valor) => {
    propriedadeLinhasEmEdicao[idx].tipo_proprietario = valor;
    if (valor === 'socio_interno') { propriedadeLinhasEmEdicao[idx].nome_externo = null; }
    else { propriedadeLinhasEmEdicao[idx].pessoa_id = null; }
    renderPropriedadeEditor();
};
window.__peMudarPessoa = (idx, pessoaId) => {
    propriedadeLinhasEmEdicao[idx].pessoa_id = pessoaId || null;
};
window.__peMudarNomeExterno = (idx, valor) => {
    propriedadeLinhasEmEdicao[idx].nome_externo = valor;
};
window.__peMudarPercentual = (idx, valor) => {
    propriedadeLinhasEmEdicao[idx].percentual = valor;
    const soma = propriedadeSomaAtual();
    const somaEl = document.getElementById(propriedadeEditorAlvo.soma);
    if (somaEl) { somaEl.textContent = soma + '%'; somaEl.style.color = soma === 100 ? 'var(--success)' : 'var(--danger)'; }
};
window.__peRemoverLinha = (idx) => {
    propriedadeLinhasEmEdicao.splice(idx, 1);
    renderPropriedadeEditor();
};
window.__peAdicionarLinha = () => {
    propriedadeLinhasEmEdicao.push({ tipo_proprietario: 'socio_interno', pessoa_id: null, nome_externo: null, percentual: '' });
    renderPropriedadeEditor();
};

export async function abrirEditarPropriedadeAtivo() {
    const a = estado.ativoEmFoco;
    if (!a) return;

    propriedadeEditorAlvo = { linhas: 'pe-linhas', soma: 'pe-soma' };

    if (propriedadePessoasCache === null) {
        propriedadePessoasCache = await api.listarPessoasInternas(estado.clienteId);
    }

    const linhasAtuais = await api.buscarPropriedadeDoAtivo(a.id);
    propriedadeLinhasEmEdicao = linhasAtuais.length
        ? linhasAtuais.map(l => ({ tipo_proprietario: l.tipo_proprietario, pessoa_id: l.pessoa_id, nome_externo: l.nome_externo, percentual: l.percentual }))
        : [{ tipo_proprietario: 'socio_interno', pessoa_id: null, nome_externo: null, percentual: 100 }];

    modalGenerico('Editar divisão de propriedade', `
        <div id="pe-linhas" class="space-y-2 mb-2"></div>
        <button onclick="window.__peAdicionarLinha()" class="text-xs font-bold px-2.5 py-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300 flex items-center gap-1 mb-3">
            <i data-lucide="plus" style="width:11px;height:11px"></i> Adicionar sócio
        </button>
        <div class="flex items-center justify-between text-xs font-bold border-t border-slate-100 pt-2 mb-3">
            <span>Soma</span>
            <span id="pe-soma">100%</span>
        </div>
        <div class="flex gap-2">
            <button data-action="fechar-modal-generico" class="flex-1" style="background:#f1f5f9;color:#475569;font-weight:bold;font-size:13px;padding:10px;border:none;border-radius:8px;">Cancelar</button>
            <button data-action="fa-salvar-propriedade" class="flex-1" style="background:var(--pine);color:#fff;font-weight:bold;font-size:13px;padding:10px;border:none;border-radius:8px;">Salvar</button>
        </div>
    `);
    renderPropriedadeEditor();
}

export async function salvarPropriedadeAtivoAtual() {
    const a = estado.ativoEmFoco;
    if (!a) return;

    const soma = propriedadeSomaAtual();
    if (Math.round(soma * 100) / 100 !== 100) {
        mostrarToast(`A soma precisa ser exatamente 100% (está em ${soma}%).`, 'erro');
        return;
    }
    for (const l of propriedadeLinhasEmEdicao) {
        const temNome = l.tipo_proprietario === 'socio_interno' ? !!l.pessoa_id : !!(l.nome_externo && l.nome_externo.trim());
        if (!temNome) { mostrarToast('Preencha o sócio/nome de todas as linhas.', 'erro'); return; }
    }

    const linhasParaApi = propriedadeLinhasEmEdicao.map(l => ({
        tipo_proprietario: l.tipo_proprietario,
        pessoa_id: l.pessoa_id || '',
        nome_externo: l.nome_externo || '',
        percentual: parseFloat(l.percentual) || 0
    }));

    try {
        // Pedido explícito (02/09/2026): "no chip de propriedade, só
        // apresente o dos ativos" — sempre grava em propriedade_ativo,
        // mesmo quando o ativo referencia um imóvel (dado já migrado
        // de propriedade_imovel nesta sessão, ver migration). Não
        // chama mais substituir_propriedade_imovel a partir daqui.
        await api.salvarPropriedadeAtivo(a.id, linhasParaApi);
        mostrarToast('Divisão de propriedade salva.', 'sucesso');
        fecharModal('modal-generico');
        await montarPropriedadeAtivo(a);
    } catch (err) {
        mostrarToast('Erro ao salvar: ' + (err.message || String(err)), 'erro');
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
    const gridWrapper = document.getElementById('fa-dados-imovel-grid');
    const ehImovelVinculado = a.entidade_origem_tipo === 'imovel';
    gridWrapper.classList.toggle('hidden', !ehImovelVinculado);

    if (ehImovelVinculado) {
        // v1.93.0 (pedido explícito, "evoluir a exemplo do protótipo") —
        // grade completa 2 colunas (Inscrição imobiliária/UF-Município/
        // Uso/Tipo de locação/Valor de mercado/IPTU/Endereço completo),
        // igual ao mockup — antes era só um resumo em texto corrido
        // (uso/valor/IPTU numa linha só). Isto é LEITURA — editar esses
        // campos continua sendo só pelo formulário de verdade do imóvel
        // (link "Editar →" no cabeçalho da grade), porque
        // cofre_ativos.dados_especificos (o que "Editar dados" desta
        // ficha edita) e imoveis (endereço/IPTU/valor de mercado) são
        // tabelas diferentes — fundir os 2 formulários de escrita é
        // decisão maior, fora desta entrega.
        //
        // v1.95.0 (pedido explícito, 01/09/2026, achado com screenshot
        // real) — BUG REAL corrigido: a grade entrava como 3º filho
        // dentro de um <div flex justify-between> que já tinha 2 filhos
        // (frase + botão) — o layout inteiro quebrava (grade flutuando
        // ao lado do texto em vez de embaixo). Corrigido: gridWrapper
        // agora é um container PRÓPRIO (#fa-dados-imovel-grid), fora de
        // qualquer flex row. Também "não temos mais dois módulos...
        // elimine qq menção que seja por módulo": a frase "Este ativo
        // referencia um imóvel já cadastrado" SAIU — o link de editar
        // virou parte do cabeçalho da própria grade.
        const resumoImovel = await api.buscarResumoImovelOrigem(a.entidade_origem_id);
        const usoLabel = { residencial: 'Residencial', comercial: 'Comercial', industrial: 'Industrial', terreno: 'Terreno', rural: 'Rural' };
        const locacaoLabel = { longa_duracao: 'Longa duração', temporada: 'Temporada', comercial: 'Comercial' };
        const campo = (rotulo, valor) => valor
            ? `<div><small>${escapeHtml(rotulo)}</small><b>${valor}</b></div>`
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
            ? `<div class="rz-full"><small>Endereço completo</small><b>${escapeHtml(enderecoCompleto)}</b></div>`
            : '';

        // v1.17.0 (fatia 3, REGRAS §6/§17) — grade .rz-kv; título em
        // sentence case no cabeçalho do card (era "DADOS DO IMÓVEL" em
        // caixa alta) e o link "Editar →" saiu: o botão "Editar dados" do
        // rodapé passa a apontar pro formulário do imóvel (abaixo).
        gridWrapper.innerHTML = (campos.length || campoEndereco)
            ? `<div class="rz-kv">${campos.join('')}${campoEndereco}</div>`
            : `<p class="rz-desc">Sem endereço, IPTU, valor de mercado ou uso cadastrado ainda.</p>`;
    }
    const titulo = document.getElementById('fa-dados-titulo');
    if (titulo) titulo.textContent = ehImovelVinculado ? 'Dados do imóvel' : 'Dados do ativo';
    const btnEditar = document.getElementById('fa-btn-editar-dados');
    if (btnEditar) btnEditar.dataset.action = ehImovelVinculado ? 'abrir-gestao-imovel' : 'alternar-editar-ativo';

    // v1.95.0 — pra ativo vinculado a imóvel, a grade acima JÁ é o dado
    // de verdade — mostrar "Sem dados estruturados cadastrados ainda."
    // aqui embaixo (que se refere só a cofre_ativos.dados_especificos,
    // um conceito interno que não devia aparecer pro usuário) ficava
    // confuso: parecia que faltava informação quando na verdade a
    // grade acima já tinha tudo (achado direto, pedido explícito: "veja
    // como aparece, ruim, precisa já aparecer os dados do imóvel").
    // Pra ativo SEM imóvel vinculado, comportamento intacto.
    const camposDefinidos = CAMPOS_POR_TIPO_ATIVO[a.tipo_ativo] || [];
    const dados = a.dados_especificos || {};
    const valoresPreenchidos = camposDefinidos
        .filter(c => dados[c.chave])
        .map(c => c.mascarar ? mascarar(dados[c.chave]) : escapeHtml(dados[c.chave]));

    // NOVO (29/08/2026) — 3º estado 'vendido', mesma cor neutra já usada
    // pra "Suspenso"/"Finalizado" no resto do sistema (DS §14, "demais
    // estados" → slate) — não é sucesso (verde) nem erro (vermelho), é
    // só um encerramento normal do ciclo de vida do ativo.
    // v1.17.0 — status saiu daqui: vive no cabeçalho de entidade
    // (statusAtivoHtml, abrirFichaAtivo). Aqui fica só o dado.
    const resumo = document.getElementById('fa-resumo-dados');
    if (ehImovelVinculado && valoresPreenchidos.length === 0) {
        resumo.innerHTML = '';
    } else {
        resumo.innerHTML = `<p class="rz-desc${ehImovelVinculado ? ' mt-2' : ''}">${valoresPreenchidos.length ? valoresPreenchidos.join(' · ') : 'Sem campos específicos preenchidos ainda.'}</p>`;
    }

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

// v1.96.2 (01/09/2026, pedido explícito, achado real: "ao clicar no
// editar de um imóvel está indo para a tela inicial do app") — BUG
// REAL corrigido: window.location.href = './?abrir=imovel&ref=...'
// fazia um RELOAD COMPLETO da página (destrói todo o estado do app,
// refaz login) — e index.html nunca soube tratar esse parâmetro de
// URL (?abrir=imovel), então o boot só caía no padrão de sempre
// (tab-geral, "Visão Geral" = a tela inicial que o Nicola viu). Isso é
// resquício de um padrão pensado pra outro contexto (cofre.html
// standalone tem seu próprio ?contexto=/&ref=, não isto).
// Corrigido com a MESMA ponte já usada em cadastrar-imovel-app/ir-
// vitrine-app: switchTab('tab-imoveis') primeiro (o formulário de
// edição, como o de cadastro, é position:fixed só que preso dentro de
// uma <section> que fica display:none quando não é a aba ativa — sem
// trocar de aba antes, o formulário abriria "invisível") + chamar
// editarImovel(id) direto, sem sair da página, sem perder estado.
export function abrirGestaoImovel() {
    const a = estado.ativoEmFoco;
    if (a?.entidade_origem_tipo !== 'imovel' || !a.entidade_origem_id) return;
    if (typeof window.switchTab === 'function' && typeof window.editarImovel === 'function') {
        // BUG FIX (02/09/2026, achado pelo Nicola com screenshot: "ao sair
        // do modal, aparece a tela antiga de lista dos imóveis") — faltava
        // dizer ao App de onde essa edição veio. window.fichaOrigemAoEditarImovel
        // é uma variável já existente no index.html (mecanismo já pronto
        // de "Voltar sempre pra origem real", DS §4.2) — só nunca tinha
        // um chamador que setasse 'tab-ativos'. cancelarEdicaoImovel()
        // já sabe fazer switchTab(origem) sozinha ao fechar/salvar; a
        // troca pra tab-imoveis abaixo é só pra deixar o modal Tipo A
        // visível (ele fica preso numa <section> display:none fora da
        // aba ativa) — nunca deveria "grudar" ali depois de fechado.
        window.fichaOrigemAoEditarImovel = 'tab-ativos';
        window.switchTab('tab-imoveis');
        window.editarImovel(a.entidade_origem_id);
    } else {
        mostrarToast('Edição do imóvel só disponível dentro do app principal.', 'erro');
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
    // v1.17.0 (fatia 3) — lista em .rz-row; vazio no formato único
    // (#fa-documentos-vazio, IA primária) e rodapé com as 2 ações só
    // quando há lista. Contador do chip Arquivos = documentos + fotos
    // (atualizarContadorArquivos).
    document.getElementById('fa-tab-documentos').innerHTML = docs.map(d => `
        <div class="rz-row">
            <div class="rz-ic${d.origem === 'bot_whatsapp' ? ' rz-ia' : ''}"><i data-lucide="${d.origem === 'bot_whatsapp' ? 'bot' : 'file-text'}"></i></div>
            <div class="rz-tx"><b>${escapeHtml(d.nome_exibicao)}</b><span>${escapeHtml((estado.categorias || []).find(c => c.id === d.categoria_id)?.nome || 'Documento')}${d.origem === 'bot_whatsapp' ? ' · pelo Robô' : ''}${d.criado_em ? ' · ' + formatarDataBR(String(d.criado_em).slice(0, 10)) : ''}</span></div>
        </div>`).join('');
    document.getElementById('fa-documentos-vazio')?.classList.toggle('hidden', docs.length > 0);
    document.getElementById('fa-documentos-rodape')?.classList.toggle('hidden', docs.length === 0);
    docsAtivoCount = docs.length;
    atualizarContadorArquivos();
    refrescarIcones();
}

let docsAtivoCount = 0;
function atualizarContadorArquivos() {
    faAtualizarContador('arquivos', docsAtivoCount + (fotosAtivoCache?.length || 0));
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
    const rodape = document.getElementById('fa-fotos-rodape');
    const sub = document.getElementById('fa-fotos-sub');
    if (sub) sub.textContent = fotos.length ? `${fotos.length} foto${fotos.length === 1 ? '' : 's'}` : '';
    atualizarContadorArquivos();
    if (!fotos.length) {
        box.classList.add('hidden');
        if (vazio) vazio.classList.remove('hidden');
        rodape?.classList.add('hidden');
        fotosAtivoUrlsCache = [];
        refrescarIcones();
        return;
    }
    if (vazio) vazio.classList.add('hidden');
    rodape?.classList.remove('hidden');
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

// v1.17.0 — o painel inline #fa-fotos-acoes saiu (REGRAS §6); "Adicionar
// fotos" é a ação nomeada do rodapé. Mantida por compatibilidade com o
// dispatcher: agora só abre o seletor.
export function abrirSeletorFotosAtivo() {
    document.getElementById('fa-foto-input')?.click();
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
