// ============================================================================
// cofre-app.js — Raiz Patrimônio · Cofre de Documentos
// Versão: 1.17.0 · 02/09/2026
//
// v1.17.0 — 'abrir-form-ativo' ganhou await (ativos.abrirFormAtivo()
// virou async na v1.11.0 do cofre-ativos.js, pra pré-carregar sócios
// internos e pré-popular a divisão societária antes do modal abrir).
//
// v1.16.0 — 2 cases novos pro chip "Propriedade" da ficha do ativo
// (NOVO, pedido explícito, 02/09/2026): 'fa-editar-propriedade' e
// 'fa-salvar-propriedade' (este dentro do modal-generico, ver
// cofre-ativos.js v1.12.0), delegando pra
// ativos.abrirEditarPropriedadeAtivo()/ativos.salvarPropriedadeAtivoAtual().
//
// v1.15.0 — 2 cases novos pro chip "Financeiro" da ficha do ativo (NOVO,
// pedido explícito, "adicione a um ativo um novo chip de fluxo
// financeiro... permita lançamento por este chip também e um atalho
// para a tela de saídas financeiras"): 'fa-novo-lancamento' e
// 'fa-ver-saidas-ativo', delegando pra ativos.abrirNovoLancamentoDoAtivo()/
// ativos.abrirSaidasDoAtivo() (cofre-ativos.js v1.10.0) — mesmo padrão
// de ponte já usado em 'cadastrar-imovel-app'/'abrir-gestao-imovel',
// nenhuma lógica de formulário duplicada aqui.
//
// v1.14.0 — "vasculhe todo o código" (pedido explícito, 01/09/2026):
// case 'voltar-app' corrigido — rotulado "Imóvel" (dentro do menu de
// conta do Cofre) mas fazia reload pra './' sem parâmetro, pousando em
// Visão Geral. Trocado por switchTab('tab-imoveis'), sem reload — hoje
// inalcançável na prática (o header que continha o botão já é escondido
// via CSS), corrigido mesmo assim por higiene (código morto enganoso).
// Novo case 'ativo-imovel-origem-mudou' — ver cofre-ativos.js v1.9.0.
//
// v1.13.0 — "apague a aba antiga do cofre de visão geral" (pedido
// explícito): renderAlertas() ganhou guarda defensiva, mesma razão de
// montarHome() (cofre-documentos.js v1.6.0) — data-screen="alertas" foi
// apagada do markup embutido no App.
//
// v1.12.0 — ajustes de qualidade pedidos depois do Nicola testar a
// v1.94.0 em navegador de verdade:
//   1) BUG REAL corrigido: 'cadastrar-imovel-app' não funcionava — o
//      modal (#form-imovel-wrapper) é position:fixed mas vive dentro de
//      <section id="tab-imoveis">, que fica display:none quando não é
//      a aba ativa. display:none no ancestral esconde tudo dentro,
//      mesmo filho position:fixed. Corrigido trocando pra tab-imoveis
//      ANTES de abrir o modal.
//   2) Novo case 'ir-vitrine-app' — ponte pra tab-vitrine (aba normal,
//      sem o mesmo problema — switchTab() já lida nativamente).
//   3) Barra da lista de Ativos reorganizada (ver ativos-markup.js
//      v1.4.1): Localizar/Vitrine/Adicionar/Carregar documento.
//      'cadastrar-imovel-app' NÃO saiu do dispatcher — só mudou de
//      lugar no HTML (agora dentro do form "Novo ativo").
//
// v1.11.0 — "seguir com a unificação" (pedido explícito, 31/08/2026):
// novo case 'cadastrar-imovel-app' — ponte defensiva pra
// abrirCadastroImovelModal() (função nativa do index.html, só existe
// quando embutido no App). Existe porque o segmento Imóveis/Ativos saiu
// da navegação (ver index.html v1.94.0) — cadastrar um imóvel novo
// precisava continuar sempre alcançável, não só quando havia alerta
// pendente na Visão Geral.
//
// v1.10.0 — "evoluir a exemplo do protótipo" (pedido explícito,
// 31/08/2026): novo case 'fa-trocar-aba' (troca de aba na ficha do
// ativo, delega pra ativos.faTrocarAba()). 'abrir-documentos-ativo'/
// 'fechar-documentos-ativo' SAÍRAM do dispatcher — o modal que abriam
// foi removido (conteúdo virou aba inline, ver ativos-markup.js v1.3.0/
// cofre-ativos.js v1.6.0).
//
// v1.9.0 — novo listener 'cofre:abrir-configuracao' (pedido explícito,
// 31/08/2026): disparado por nav.bootstrap() (cofre-navegacao.js v1.6.0)
// quando a URL trouxe ?abrir=categorias|subtipos|modelos, vindo do menu
// Configurações do App (index.html, abrirConfiguracaoCofre()) — essas 3
// telas só tinham porta de entrada dentro do próprio menu ⚙️ do Cofre
// até agora.
//
// v1.8.0 — "Fase A" da fusão Ativos/Imóveis (pedido explícito,
// 31/08/2026): novo case 'filtrar-ativos-chip' no dispatcher, delega
// pra ativos.aplicarFiltroChipAtivos() (cofre-ativos.js v1.5.0) — chips
// de tipo (Todos/Imóveis/Veículos/Outros) acima da lista de Ativos.
// Nenhum case existente foi tocado.
//
// v1.7.0 — novo listener 'cofre:abrir-form-ativo' (chama ativos.
// abrirFormAtivo()) — acionado pela Central de Comunicações quando o
// onboarding variante "ativo" é concluído (ver cofre-navegacao.js v1.3.0).
//
// v1.6.0 (29/08/2026) — 2 mudanças, sessões diferentes no mesmo dia:
//   1) Handler de "Arquivar documento" removido do dispatcher (pedido
//      explícito: função sem utilidade) — sem changelog próprio quando
//      isso aconteceu (só documentado no header central de cofre.html
//      v1.21.6); registrado aqui agora pra não deixar o histórico deste
//      arquivo com um buraco.
//   2) NOVO case 'marcar-ativo-vendido' no dispatcher, chamando
//      ativos.marcarAtivoVendidoAtual() — pedido explícito do Nicola
//      (função de marcar ativo como vendido, desativando itens de
//      controle/alertas em cascata). Ver cofre-ativos.js v1.3.0.
//
// v1.5.0 (28/08/2026) — BUG REAL corrigido: botão "Documentos" no Mais
// ações do Imóvel (index.html) levava pro Cofre mas nunca chegava no
// formulário de upload. Fluxo de criação assistida do ativo (quando
// ainda não existe) agora vai direto pro upload ao terminar, em vez de
// só abrir a ficha do ativo recém-criado. Ver também cofre-navegacao.js
// (caminho mais comum — ativo já existente).
//
// v1.4.0 — MERGE (pedido explícito) de 2 branches paralelos que
// divergiram do mesmo v1.3.4/v1.3.5 em conversas separadas:
//   (a) esta conversa — dispatchers de editar/excluir subtipo de item
//       de controle (v1.3.5 abaixo).
//   (b) conversa paralela — PESSOAS/MINHA EMPRESA/LICENÇA/SOBRE DE
//       VERDADE dentro do Cofre: 4 novos dispatchers (ir-sobre/
//       ir-licenca/ir-pessoas/ir-minha-empresa) + bloco "TELAS
//       COMPARTILHADAS" novo (onToastCofre/registrarLogCofre/
//       sairCofre/4× montarXCofre) perto do BOOT, importando 4
//       módulos compartilhados com o App (js/comum-*.js).
// ⚠️ PENDÊNCIA DESTE MERGE — ver aviso completo no início da resposta:
// os 4 arquivos js/comum-sobre.js, comum-licenca.js, comum-pessoas.js
// e comum-minha-empresa.js NÃO foram recebidos nesta sessão. Sem eles,
// este import quebra o carregamento do Cofre INTEIRO (erro fatal de
// módulo ES — não é só as 4 telas novas que ficam fora do ar, é o
// Cofre inteiro). Não publicar este arquivo até esses 4 arquivos
// chegarem e o merge ser fechado de verdade.
//
// v1.3.5 — ocorrenciaParaAlertaView() (tela cheia de Alertas) ganhou
// ativoNome/tipoAtivo, mesmo motivo do adaptador equivalente em
// cofre-documentos.js (ver changelog completo em cofre.html v1.13.0).
//
// v1.3.4 — dispatchers de Modelos de item de controle (pedido
// explícito): abrir-modelos-controle/fechar-modelos-controle/
// salvar-modelo-controle/usar-modelo-controle + novo
// data-action-change "modelo-tipo-mudou".
//
// v1.3.3 — dispatchers dos atalhos "Tratar"/"Acionar" no alerta da
// Visão Geral (pedido explícito): alerta-tratar (abre a ficha do item
// + já dispara alternarAcaoOcorrencia('tratar') pra ocorrência
// específica) e alerta-acionar (chama docs.acionarContatoAlerta()).
// ocorrenciaParaAlertaView() (tela cheia de Alertas) ganhou o campo
// `tipo`, mesmo motivo do adaptador equivalente em cofre-documentos.js.
//
// v1.3.2 — dispatchers de Subtipos de item de controle (pedido
// explícito): abrir-subtipos-controle/fechar-subtipos-controle/
// salvar-subtipo-controle.
//
// v1.3.1 — dispatchers acompanham a reescrita da tela do Item de
// Controle (cofre-controles.js): "alternar-editar-item" virou
// "abrir-editar-item"/"fechar-editar-item" (edição virou bottom-sheet
// Tipo B); novo "alternar-mais-acoes-contatos-item" (botão de adicionar
// contato saiu de CTA tracejado e foi pro painel de Mais ações).
//
// v1.3.0 — 2ª rodada da revisão DS. (1) D-3: novo bloco no topo do
// listener delegado — clique no backdrop de QUALQUER modal fecha (nenhum
// fechava assim antes; guarda contra bubbling igual ao onclick do App).
// (2) C-4: dispatcher "alternar-form-ativo" (painel inline) virou
// "abrir-form-ativo"/"fechar-form-ativo" (modal Tipo A) — acompanha
// cofre-ativos.js v1.2.0.
//
// v1.2.0 — CONCLUSÃO DA MIGRAÇÃO v6 (deixada pela metade numa sessão
// anterior — banco já não tinha mais cofre_eventos, mas este arquivo ainda
// chamava funções removidas da API, quebrando silenciosamente). Alertas
// agora 100% derivados de cofre_ocorrencias_controle (estado.ocorrenciasAbertas):
// renderAlertas()/montarHome() reescritos, removida toda a UI de "criar
// alerta manual" (alternarFormEvento/salvarEvento e o listener
// cofre:evento-contextual — mortos, sem tabela pra escrever). Removidos
// dispatchers órfãos: abrir-evento-no-ativo, alternar-form-alerta-item,
// salvar-alerta-item, alternar-form-evento, salvar-evento. Novo:
// alternar-mais-acoes-controles (box Controles vira bottom-sheet).
//
// v1.1.4 — dispatcher acompanha a ficha do item de controle (tela própria,
// cofre-controles.js v1.1.0): abrir/voltar-item-controle, editar/excluir
// item, alertas/contatos vinculados. Documentos/Fotos do ativo viram
// modais abertos via "Mais ações" (abrir-documentos-ativo/abrir-fotos-ativo).
// Upload com 2 caminhos (IA/simples). Alertas legado ganham editar/excluir.
// Listener novo: cofre:recarregar-eventos.
//
// v1.1.3 — dispatcher acompanha a ficha do ativo virar tela (não modal):
// voltar-ficha-ativo, alternar-mais-acoes-ativo, alternar-historico-ativo,
// excluir-ativo-atual.
//
// v1.1.2 — header simplificado: remove o seletor "módulos" (modal); troca
// por botão "< Voltar" direto (data-action="voltar-app" → './'), a pedido
// explícito, para igualar ao padrão minimalista do header do App principal.
//
// v1.1.1 — importa cofre-controles.js (novo) e liga os data-action da aba
// Controles/tratamento de ocorrência (criar item, tratar/reagendar/estornar).
//
// Entry point. Único arquivo que faz `addEventListener` no `document`
// (delegação de evento, via atributos `data-action`/`data-action-change`)
// — nenhum outro módulo liga handler direto em elemento específico, exceto
// onde a delegação genérica não cobre bem (inputs de arquivo, ver
// cofre-ativos.js). Prefere addEventListener a onclick inline em todo
// código novo (Diretriz Arquitetural — Passo 2).
// ============================================================================
import { estado, COFRE_VERSAO } from './cofre-estado.js';
import * as api from './cofre-api.js';
import { mostrarToast, fecharModal, abrirModal, refrescarIcones } from './cofre-ui.js';
import * as nav from './cofre-navegacao.js';
import * as docs from './cofre-documentos.js';
import * as ativos from './cofre-ativos.js';
import * as controles from './cofre-controles.js';

// v1.20.0 (merge) — módulos compartilhados com o App (mesmos arquivos,
// mesmo caminho relativo — cofre.html e index.html estão ambos na raiz
// do repo, então './comum-X.js' funciona igual dos 2 lugares).
//
// ⚠️ ARQUIVOS AINDA NÃO RECEBIDOS NESTA SESSÃO — ver aviso completo no
// topo da resposta. Sem eles, este import quebra o carregamento do
// Cofre inteiro (erro fatal de módulo ES, não só destas 4 telas).
import { montarAbaSobre } from './comum-sobre.js';
import { montarAbaLicenca } from './comum-licenca.js';
import { montarAbaPessoas } from './comum-pessoas.js';
import { montarAbaMinhaEmpresa, buscarDadosEmpresa } from './comum-minha-empresa.js';

// ============================================================================
// DELEGAÇÃO DE CLIQUE — um único listener cobre todo elemento (estático ou
// gerado dinamicamente) com [data-action].
// ============================================================================
document.addEventListener('click', async (ev) => {
    // D-3/C-3 (revisão DS) — clique no backdrop fecha o modal (padrão
    // default de Tipo A/B/C, §9: "por padrão também fecha ao clicar fora,
    // a menos que exista razão de negócio documentada pra não fechar").
    // Nenhum modal do Cofre tinha esse comportamento até aqui — só X e
    // Cancelar/Fechar fechavam. Guarda: só dispara se o clique foi
    // literalmente no elemento com a classe .modal-overlay (o backdrop
    // em si), nunca por bubbling de um filho sem handler próprio — mesma
    // proteção que o App faz via onclick="if(event.target===this)".
    if (ev.target.classList?.contains('modal-overlay') && ev.target.id) {
        ev.target.classList.add('hidden');
        return;
    }

    const alvo = ev.target.closest('[data-action]');
    if (!alvo) return;
    const acao = alvo.dataset.action;
    const id = alvo.dataset.id;

    switch (acao) {
        // ---- navegação principal
        case 'ir-home': nav.mudarTela('home'); docs.montarHome(); break;
        case 'ir-ativos': nav.mudarTela('ativos'); ativos.renderAtivosLista(document.getElementById('filtro-ativo-tipo').value, document.getElementById('filtro-ativo-busca').value); break;
        case 'ir-alertas': nav.mudarTela('alertas'); renderAlertas(); break;
        // Menu ⚙️ → grupo "Conta" (v1.20.0, merge) — Pessoas/Minha
        // Empresa/Licença/Sobre montam telas de VERDADE dentro do
        // Cofre, via módulos compartilhados com o App (js/comum-*.js —
        // ver bloco "TELAS COMPARTILHADAS" perto do BOOT, fim deste
        // arquivo). "Imóveis" é o único que continua indo pro App
        // (voltar-app) — não é uma tela de administração do cliente,
        // é o módulo principal em si, não faz sentido montar aqui.
        // "menu-conta-em-breve" segue existindo pra Prestadores de
        // Serviço (ainda sem tela própria) e qualquer outro item futuro.
        //
        // v1.96.2 (01/09/2026, "vasculhe todo o código... pra evitar
        // que isto ainda tenha") — BUG REAL corrigido, mesma classe do
        // achado em abrirGestaoImovel(): rotulado "Imóvel" mas mandava
        // pra './' (reload completo, sem parâmetro nenhum) — pousava
        // sempre em tab-geral (Visão Geral), nunca em Imóveis. Este
        // botão específico está dentro do <header> do Cofre, que já é
        // escondido via CSS no contexto embutido (ver ativos-boot.js) —
        // hoje inalcançável na prática — mas corrigido mesmo assim
        // (código morto enganoso é pior que código morto neutro, e o
        // header pode voltar a aparecer no futuro). Mesma ponte de
        // sempre: switchTab() em vez de reload.
        case 'voltar-app':
            fecharModal('modal-menu-conta');
            if (typeof window.switchTab === 'function') window.switchTab('tab-imoveis');
            else window.location.href = './';
            break;
        case 'menu-conta-em-breve': fecharModal('modal-menu-conta'); mostrarToast(`${alvo.dataset.rotulo}: em breve.`); break;
        case 'ir-sobre': fecharModal('modal-menu-conta'); nav.mudarTela('sobre'); montarSobreCofre(); break;
        case 'ir-licenca': fecharModal('modal-menu-conta'); nav.mudarTela('licenca'); montarLicencaCofre(); break;
        case 'ir-pessoas': fecharModal('modal-menu-conta'); nav.mudarTela('pessoas'); montarPessoasCofre(); break;
        case 'ir-minha-empresa': fecharModal('modal-menu-conta'); nav.mudarTela('minha-empresa'); montarMinhaEmpresaCofre(); break;
        // Deep-link pro App numa aba específica — hoje NENHUM botão do
        // HTML aponta pra cá (Prestadores de Serviço usa
        // menu-conta-em-breve, ainda sem tela própria) — mantido pronto
        // pra reaproveitar assim que alguém decidir linkar Prestadores
        // de verdade. index.html v1.62.3 lê ?ir=tab-X pós-login e chama
        // switchTab() sozinho (abrirAbaPorDeepLink()) — mesmo princípio
        // de segurança de abrirCofreDocumentos() no sentido contrário:
        // parâmetro de URL nunca é autorização, só sugestão de
        // navegação. Este SIM funciona (index.html trata ?ir=), ao
        // contrário do ?abrir=imovel que abrirGestaoImovel() usava
        // errado — deixado como reload de propósito, é código morto
        // (nenhum botão chama), não vale o esforço de trocar por
        // ponte agora.
        case 'ir-app': window.location.href = './?ir=' + encodeURIComponent(alvo.dataset.tab || 'tab-geral'); break;
        case 'fechar-modal-generico': fecharModal('modal-generico'); break;

        // ---- busca global / configurações
        case 'abrir-busca-global': docs.abrirBuscaGlobal(); break;
        case 'fechar-busca-global': docs.fecharBuscaGlobal(); break;
        case 'abrir-menu-conta': abrirModal('modal-menu-conta'); break;
        case 'fechar-menu-conta': fecharModal('modal-menu-conta'); break;
        case 'abrir-busca-ativos': abrirModal('modal-busca-ativos'); break;
        case 'fechar-busca-ativos': fecharModal('modal-busca-ativos'); break;
        case 'limpar-filtro-ativos':
            document.getElementById('filtro-ativo-tipo').value = '';
            document.getElementById('filtro-ativo-busca').value = '';
            // v1.14.0 (pedido explícito) — status/alerta entraram no
            // modal de busca junto com os 2 campos que já existiam.
            const selStatus = document.getElementById('filtro-ativo-status');
            if (selStatus) selStatus.value = '';
            const selAlerta = document.getElementById('filtro-ativo-alerta');
            if (selAlerta) selAlerta.value = '';
            ativos.renderAtivosLista('', '');
            break;
        // v1.5.0 (31/08/2026, "Fase A" da fusão Ativos/Imóveis, pedido
        // explícito) — chips de tipo (Todos/Imóveis/Veículos/Outros)
        // acima da lista. data-chip-indice vem de renderChipsAtivos()
        // (cofre-ativos.js); a função decide o grupo de tipos e chama
        // renderAtivosLista() por dentro — nada de lógica de filtro
        // duplicada aqui, só delega.
        case 'filtrar-ativos-chip': ativos.aplicarFiltroChipAtivos(Number(alvo.dataset.chipIndice)); break;
        case 'abrir-configuracoes-catalogo': fecharModal('modal-menu-conta'); docs.abrirConfiguracoes(); break;
        case 'abrir-sobre-cofre': fecharModal('modal-menu-conta'); abrirModal('modal-sobre-cofre'); break;
        case 'fechar-sobre-cofre': fecharModal('modal-sobre-cofre'); break;
        case 'abrir-bot': window.open('https://wa.me/5511978950609?text=' + encodeURIComponent('Olá, como o R.AI.Z pode me ajudar?'), '_blank', 'noopener'); break;
        case 'fechar-categorias': docs.fecharCategorias(); break;
        case 'salvar-categoria': await docs.salvarCategoria(); break;
        case 'abrir-subtipos-controle': fecharModal('modal-menu-conta'); await controles.abrirSubtiposControle(); break;
        case 'fechar-subtipos-controle': controles.fecharSubtiposControle(); break;
        case 'salvar-subtipo-controle': await controles.salvarSubtipoControle(); break;
        case 'editar-subtipo-controle': controles.editarSubtipoControle(alvo.dataset.id); break;
        case 'cancelar-edicao-subtipo': controles.cancelarEdicaoSubtipo(); break;
        case 'excluir-subtipo-controle': await controles.excluirSubtipoControle(alvo.dataset.id); break;
        case 'abrir-modelos-controle': fecharModal('modal-menu-conta'); await controles.abrirModelosControle(); break;
        case 'fechar-modelos-controle': controles.fecharModelosControle(); break;
        case 'salvar-modelo-controle': await controles.salvarModeloControle(); break;
        case 'editar-modelo-controle': controles.editarModeloControle(alvo.dataset.id); break;
        case 'cancelar-edicao-modelo': controles.cancelarEdicaoModelo(); break;
        case 'excluir-modelo-controle': await controles.excluirModeloControle(alvo.dataset.id); break;
        case 'usar-modelo-controle': controles.aplicarModeloAoForm(alvo.dataset.id); break;

        // ---- documentos
        case 'abrir-upload-home': await docs.abrirUploadHome(); break;
        case 'fechar-upload': docs.fecharUpload(); break;
        case 'salvar-upload': await docs.salvarUpload(); break;
        case 'abrir-documento': await docs.abrirFichaDocumento(id); break;
        case 'alternar-editar-alerta': docs.alternarEditarAlerta(id); break;
        case 'confirmar-editar-alerta': await docs.confirmarEditarAlerta(id); break;
        case 'excluir-alerta': await docs.excluirAlerta(id); break;
        case 'fechar-ficha-doc': docs.fecharFichaDoc(); break;
        case 'baixar-documento-atual': await docs.baixarDocumentoAtual(); break;
        case 'excluir-documento-atual': await docs.excluirDocumentoAtual(); break;
        case 'ir-para-vinculo': await docs.irParaVinculo(alvo.dataset.tipo, alvo.dataset.id); break;
        case 'escolher-candidato-upload': docs.escolherCandidatoUpload(alvo.dataset.tipo, alvo.dataset.id, alvo.dataset.nome); break;

        // ---- Fase 2 (IA) e "Vincular agora"
        case 'ignorar-sugestoes-ia': docs.ignorarSugestoesIA(); break;
        case 'aplicar-sugestoes-ia': await docs.aplicarSugestoesIA(); break;
        case 'abrir-vincular-agora': docs.abrirVincularAgora(); break;
        case 'fechar-vincular-agora': docs.fecharVincularAgora(); break;
        case 'confirmar-vincular-agora': await docs.confirmarVincularAgora(); break;
        case 'escolher-candidato-vincular-agora': docs.escolherCandidatoVincularAgora(alvo.dataset.tipo, alvo.dataset.id, alvo.dataset.nome); break;

        // ---- ativos
        case 'abrir-form-ativo': await ativos.abrirFormAtivo(); break;
        case 'fechar-form-ativo': ativos.fecharFormAtivo(); break;
        case 'salvar-ativo': await ativos.salvarAtivo(); break;
        case 'abrir-ativo': await ativos.abrirFichaAtivo(id); break;
        case 'voltar-ficha-ativo': ativos.fecharFichaAtivo(); break;
        case 'alternar-mais-acoes-ativo': ativos.alternarMaisAcoesAtivo(); break;
        // v1.11.0 (31/08/2026, pedido explícito, "seguir com a
        // unificação") — ponte pra abrirCadastroImovelModal(), função
        // NATIVA do index.html (não é código do Cofre) — só existe
        // quando este arquivo roda embutido no App (ver js/ativos/
        // ativos-boot.js), nunca no cofre.html standalone. Checagem
        // defensiva (typeof) de propósito: se um dia este botão for
        // reaproveitado em outro contexto sem essa função, não quebra
        // com "is not a function", só não faz nada.
        // BUG REAL corrigido (31/08/2026, achado pelo Nicola: "o botao
        // casinha com + ao apertar nao funciona") — o modal de cadastro
        // (#form-imovel-wrapper) é position:fixed, mas vive DENTRO de
        // <section id="tab-imoveis">, que fica display:none quando não
        // é a aba ativa. display:none no ANCESTRAL esconde tudo dentro,
        // mesmo um filho position:fixed — não existe workaround de CSS
        // pra isso, é comportamento padrão do navegador. Corrigido
        // trocando pra tab-imoveis PRIMEIRO (mesmo padrão que os
        // atalhos de "Atenção necessária" da Visão Geral já usam),
        // então abrindo o modal por cima — não moveu o modal de lugar
        // no HTML (risco maior, fora de escopo desta correção).
        case 'cadastrar-imovel-app':
            if (typeof window.switchTab === 'function' && typeof window.abrirCadastroImovelModal === 'function') {
                window.switchTab('tab-imoveis');
                window.abrirCadastroImovelModal();
            } else {
                mostrarToast('Cadastro de imóvel só disponível dentro do app principal.', 'erro');
            }
            break;
        // v1.94.1 (31/08/2026, pedido explícito) — "Vitrine" na barra da
        // lista de Ativos: ponte pra tab-vitrine, aba de nível normal
        // do App (não um modal preso — switchTab() já lida nativamente,
        // sem o mesmo problema de display:none do cadastrar-imovel-app).
        case 'ir-vitrine-app':
            if (typeof window.switchTab === 'function') window.switchTab('tab-vitrine');
            else mostrarToast('Vitrine só disponível dentro do app principal.', 'erro');
            break;
        // 'alternar-historico-ativo' removido (revisão DS, 25/08/2026) —
        // Histórico não é mais opção do Mais ações do box do Ativo.
        case 'excluir-ativo-atual': await ativos.excluirAtivoAtual(); break;
        case 'marcar-ativo-vendido': await ativos.marcarAtivoVendidoAtual(); break;
        case 'alternar-editar-ativo': ativos.alternarEditarAtivo(); break;
        case 'salvar-edicao-ativo': await ativos.salvarEdicaoAtivo(); break;
        case 'abrir-gestao-imovel': ativos.abrirGestaoImovel(); break;
        // v1.93.0 (pedido explícito, "evoluir a exemplo do protótipo") —
        // 'abrir-documentos-ativo'/'fechar-documentos-ativo' SAÍRAM: o
        // modal que abriam (modal-documentos-ativo) foi removido —
        // conteúdo virou aba inline (#fa-painel-documentos). No lugar,
        // 'fa-trocar-aba' cobre a troca entre as 5 abas da ficha
        // (Dados/Documentos/Controles/Contratos/Fotos).
        case 'fa-trocar-aba': ativos.faTrocarAba(alvo.dataset.faAba); break;
        // v1.15.0 (NOVO) — chip Financeiro da ficha do ativo: "Novo
        // lançamento" e "Ver tudo em Saídas" são pontes pro App (ver
        // cofre-ativos.js v1.10.0 pro porquê de não duplicar formulário).
        case 'fa-novo-lancamento': ativos.abrirNovoLancamentoDoAtivo(); break;
        case 'fa-ver-saidas-ativo': ativos.abrirSaidasDoAtivo(); break;
        // v1.16.0 (NOVO, 02/09/2026) — chip Propriedade da ficha do
        // ativo. "fa-salvar-propriedade" é o botão de dentro do
        // modal-generico (ver cofre-ativos.js v1.11.0).
        case 'fa-editar-propriedade': await ativos.abrirEditarPropriedadeAtivo(); break;
        case 'fa-salvar-propriedade': await ativos.salvarPropriedadeAtivoAtual(); break;
        case 'abrir-lightbox-foto-ativo': ativos.abrirLightboxFotoAtivo(parseInt(alvo.dataset.indice, 10)); break;
        case 'fechar-lightbox-fotos': ativos.fecharLightboxFotoAtivo(); break;
        case 'navegar-lightbox-fotos': ativos.navegarLightboxFotoAtivo(parseInt(alvo.dataset.dir, 10)); break;
        case 'remover-foto-ativo': await ativos.removerFotoAtivo(alvo.dataset.fotoId); break;
        case 'alternar-mais-acoes-fotos-ativo': ativos.alternarMaisAcoesFotosAtivo(); break;
        case 'abrir-upload-no-ativo-ia': docs.abrirUploadNoAtivoComIA(estado.ativoEmFoco); break;
        case 'abrir-upload-no-ativo-simples': docs.abrirUploadNoAtivoSemIA(estado.ativoEmFoco); break;
        case 'abrir-form-controle': await controles.abrirFormControle(); break;
        case 'alternar-mais-acoes-controles': controles.alternarMaisAcoesControles(); break;
        case 'fechar-form-controle': controles.fecharFormControle(); break;
        case 'salvar-item-controle': await controles.salvarItemControle(); break;
        case 'alternar-acao-ocorrencia': controles.alternarAcaoOcorrencia(alvo.dataset.id, alvo.dataset.modo); break;
        case 'fechar-acao-ocorrencia': controles.fecharAcaoOcorrencia(); break;
        case 'confirmar-tratar-ocorrencia': await controles.confirmarTratarOcorrencia(alvo.dataset.id); break;
        case 'confirmar-reagendar-ocorrencia': await controles.confirmarReagendarOcorrencia(alvo.dataset.id); break;
        case 'confirmar-estornar-ocorrencia': await controles.confirmarEstornarOcorrencia(alvo.dataset.id); break;
        case 'abrir-item-controle': await controles.abrirFichaItemControle(id); break;
        case 'voltar-item-controle': controles.voltarFichaItemControle(); break;
        // Pedido explícito (25/08/2026) — atalhos no card de alerta:
        // "Tratar" abre a ficha do item já com a ação Tratar disparada
        // pra ESSA ocorrência (abrirFichaItemControle é assíncrona e já
        // renderiza a ficha antes de retornar, então alternarAcaoOcorrencia
        // logo depois encontra o DOM pronto); "Acionar" busca o contato
        // do item e abre WhatsApp/e-mail com sugestão de texto.
        case 'alerta-tratar':
            await controles.abrirFichaItemControle(alvo.dataset.itemId);
            controles.alternarAcaoOcorrencia(alvo.dataset.ocorrenciaId, 'tratar');
            break;
        case 'alerta-acionar':
            await docs.acionarContatoAlerta(alvo.dataset.itemId, alvo.dataset.titulo, alvo.dataset.tipo);
            break;
        case 'abrir-editar-item': controles.abrirEditarItem(); break;
        case 'fechar-editar-item': controles.fecharEditarItem(); break;
        case 'salvar-edicao-item': await controles.salvarEdicaoItem(); break;
        case 'excluir-item-controle-atual': await controles.excluirItemControleAtual(); break;
        case 'alternar-mais-acoes-contatos-item': controles.alternarMaisAcoesContatosItem(); break;
        case 'alternar-mais-acoes-dados-item': controles.alternarMaisAcoesDadosItem(); break;
        case 'alternar-mais-acoes-doc-item': controles.alternarMaisAcoesDocItem(); break;
        case 'carregar-novo-documento-item': controles.carregarNovoDocumentoItem(); break;
        case 'excluir-documento-do-item': await controles.excluirDocumentoDoItem(alvo.dataset.vinculoId); break;
        case 'abrir-novo-contato-item': controles.abrirNovoContatoItem(); break;
        case 'abrir-editar-contato-item': controles.abrirEditarContatoItem(alvo.dataset.id); break;
        case 'fechar-editar-contato-item': controles.fecharEditarContatoItem(); break;
        case 'salvar-contato-item-modal': await controles.salvarContatoItemModal(); break;
        case 'excluir-contato-item-modal': await controles.excluirContatoItemModal(); break;
        case 'acionar-contato-item-direto': controles.acionarContatoItemDireto(alvo.dataset.id); break;

        // ---- criação assistida (deep link contexto=imovel sem ativo ainda)
        case 'fechar-criacao-assistida': fecharModal('modal-criacao-assistida'); break;
        case 'confirmar-criacao-assistida': await confirmarCriacaoAssistida(); break;

        default: break;
    }
});

// Delegação de `change` (selects/checkboxes que precisam reagir na hora,
// não só no clique de salvar) — mesmo princípio, um único listener.
document.addEventListener('change', async (ev) => {
    const alvo = ev.target.closest('[data-action-change]');
    if (!alvo) return;
    const acao = alvo.dataset.actionChange;
    switch (acao) {
        case 'ativo-tipo-mudou': await ativos.aoMudarTipoAtivo(); break;
        // v1.96.2 (pedido explícito, "nao traz os campos... nao todos
        // os campos de imovel que tinhamos antes") — reage à escolha
        // de "Qual imóvel?", não só à troca de tipo (ver
        // atualizarCamposEstruturadosAtivo() em cofre-ativos.js).
        case 'ativo-imovel-origem-mudou': ativos.atualizarCamposEstruturadosAtivo(); break;
        case 'upload-vinculo-tipo-mudou': await docs.aoMudarTipoVinculoUpload(); break;
        case 'fd-vincular-tipo-mudou': await docs.aoMudarTipoVinculoAgora(); break;
        case 'alternar-vitrine-foto': await ativos.alternarVitrineFoto(alvo.dataset.fotoId, alvo.checked); break;
        case 'ic-tipo-mudou': controles.aoMudarTipoControleForm(); break;
        case 'modelo-tipo-mudou': controles.aoMudarTipoModeloControleForm(); break;
        case 'fic-ed-tipo-mudou': controles.aoMudarTipoEditarItemForm(); break;
        default: break;
    }
});

// input de arquivo (upload) tem handler próprio simples — não passa por
// data-action porque `change` de <input type=file> já é bem específico.
document.getElementById('up-arquivo')?.addEventListener('change', () => docs.aoSelecionarArquivoUpload());
document.getElementById('busca-global-input')?.addEventListener('input', debounce(() => docs.renderizarBuscaGlobal(), 200));
document.getElementById('busca-global-status')?.addEventListener('change', () => docs.renderizarBuscaGlobal());
document.getElementById('filtro-ativo-tipo')?.addEventListener('change', () => ativos.renderAtivosLista(document.getElementById('filtro-ativo-tipo').value, document.getElementById('filtro-ativo-busca').value));
document.getElementById('filtro-ativo-busca')?.addEventListener('input', debounce(() => ativos.renderAtivosLista(document.getElementById('filtro-ativo-tipo').value, document.getElementById('filtro-ativo-busca').value), 200));
// v1.14.0 (pedido explícito, 01/09/2026) — Status/Alerta são lidos de
// dentro de renderAtivosLista() diretamente do DOM (ver cofre-ativos.js
// v1.8.0) — aqui só preciso disparar o re-render passando tipo/texto
// como sempre; os 2 novos entram sozinhos.
document.getElementById('filtro-ativo-status')?.addEventListener('change', () => ativos.renderAtivosLista(document.getElementById('filtro-ativo-tipo').value, document.getElementById('filtro-ativo-busca').value));
document.getElementById('filtro-ativo-alerta')?.addEventListener('change', () => ativos.renderAtivosLista(document.getElementById('filtro-ativo-tipo').value, document.getElementById('filtro-ativo-busca').value));

function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

// ============================================================================
// ALERTAS — tela própria (v6: 100% DERIVADO de cofre_ocorrencias_controle,
// sem cadastro manual — a "configuração" de um alerta é o próprio item de
// controle, campos alerta_ativo/antecedencia_alerta_dias já preenchidos na
// criação do item. Clicar num alerta abre o Item de Controle que o gerou.
// ============================================================================
function ocorrenciaParaAlertaView(oc) {
    return {
        id: oc.id,
        itemControleId: oc.item_controle_id,
        titulo: oc.cofre_itens_controle?.titulo || '(item removido)',
        tipo: oc.cofre_itens_controle?.tipo || null,
        ativoNome: oc.cofre_itens_controle?.cofre_ativos?.nome_exibicao || null,
        tipoAtivo: oc.cofre_itens_controle?.cofre_ativos?.tipo_ativo || null,
        data_vencimento: oc.data_prevista_atual,
        ativoId: oc.cofre_itens_controle?.ativo_id || null,
    };
}

// v1.12.0 (31/08/2026, pedido explícito) — guarda defensiva: embutido
// no App, data-screen="alertas" foi APAGADA junto com a Home (ver
// ativos-markup.js v1.5.0) — já estava órfã antes disso (nenhum botão
// chamava 'ir-alertas' desde 25/08/2026). Mantida por causa do
// cofre.html standalone, que não foi tocado.
function renderAlertas() {
    if (!document.getElementById('alertas-lista')) return;
    const alertasView = [...estado.ocorrenciasAbertas].map(ocorrenciaParaAlertaView)
        .sort((a, b) => (a.data_vencimento || '') > (b.data_vencimento || '') ? 1 : -1);
    document.getElementById('alertas-lista').innerHTML = alertasView.map(docs.alertaCardHtml).join('');
    document.getElementById('alertas-estado-vazio').classList.toggle('hidden', alertasView.length !== 0);
    document.getElementById('alertas-lista').classList.toggle('hidden', alertasView.length === 0);
    refrescarIcones();
}

// ============================================================================
// CRIAÇÃO ASSISTIDA — contexto=imovel sem ativo correspondente ainda
// (prompt corretivo §11-B/§13: nunca criar silenciosamente, sempre confirmar)
// ============================================================================
let imovelPendenteCriacao = null;

function abrirCriacaoAssistida(imovelId, imovel, abrirUploadAoFinalizar) {
    imovelPendenteCriacao = { id: imovelId, imovel, abrirUploadAoFinalizar: !!abrirUploadAoFinalizar };
    const endereco = imovel ? `${imovel.endereco_rua}, ${imovel.endereco_num || ''}` : 'este imóvel';
    document.getElementById('criacao-assistida-texto').textContent =
        `Ainda não existe um ativo do Cofre para ${endereco}. Quer criar agora, pra já guardar documentos, alertas e contatos ligados a ele?`;
    abrirModal('modal-criacao-assistida');
}

async function confirmarCriacaoAssistida() {
    if (!imovelPendenteCriacao) return;
    try {
        const nomeExibicao = imovelPendenteCriacao.imovel ? `${imovelPendenteCriacao.imovel.endereco_rua}, ${imovelPendenteCriacao.imovel.endereco_num || ''}` : 'Imóvel';
        const novo = await api.criarAtivo({
            cliente_id: estado.clienteId, tipo_ativo: 'imovel',
            nome_exibicao: nomeExibicao,
            status: 'ativo', entidade_origem_tipo: 'imovel', entidade_origem_id: imovelPendenteCriacao.id, criado_por: estado.pessoa.id,
        });
        fecharModal('modal-criacao-assistida');
        estado.ativos = await api.listarAtivos(estado.clienteId);
        mostrarToast('Ativo criado ✅');
        // CORRIGIDO (28/08/2026) — BUG REAL reportado: o botão "Documentos"
        // no Mais ações do Imóvel levava pro Cofre mas nunca chegava no
        // formulário de upload — parava aqui, na ficha do ativo recém-
        // criado, deixando a pessoa procurar sozinha como anexar o
        // documento. Contrato/pagamento (mesma abrirCofreDocumentos())
        // pulam a criação de ativo inteira e vão direto pro upload; imóvel
        // PRECISA do ativo antes (é o jeito certo — evita vínculo órfão),
        // mas depois de criado o objetivo da pessoa continua sendo
        // "anexar o documento", não "ver a ficha do ativo". Só abre a
        // ficha se o contexto que trouxe até aqui NÃO era um pedido de
        // upload (ex.: alguém criando o ativo por outro caminho, se algum
        // dia existir).
        if (imovelPendenteCriacao.abrirUploadAoFinalizar) {
            await docs.abrirUploadContextual('ativo', novo.id, nomeExibicao);
        } else {
            await ativos.abrirFichaAtivo(novo.id);
        }
    } catch (err) {
        mostrarToast('Erro ao criar ativo: ' + err.message, 'erro');
    }
    imovelPendenteCriacao = null;
}

// ============================================================================
// EVENTOS CUSTOMIZADOS — comunicação entre módulos sem import circular
// ============================================================================
window.addEventListener('cofre:dados-carregados', () => {
    ativos.popularSelectTipoAtivo();
    // v1.12.0 (pedido explícito, "perdeu a formatação... como referência
    // a lista de imóveis antiga") — busca em paralelo, não bloqueia o
    // resto do boot. Assim que resolver, re-renderiza a lista (se já
    // estiver em tela) com os cards ricos no lugar dos genéricos.
    ativos.carregarResumoImoveisParaCards();
});

// v1.8.0 (31/08/2026, pedido explícito) — disparado por nav.bootstrap()
// (cofre-navegacao.js v1.6.0) quando a URL trouxe ?abrir=categorias|
// subtipos|modelos — vindo do menu Configurações do App (index.html,
// abrirConfiguracaoCofre()). Roda DEPOIS de montarHome()/mudarTela('home')
// (ver bootstrap()), então a tela de fundo já existe antes do modal abrir
// por cima. tela desconhecida = no-op silencioso (nunca quebra o boot
// por causa de um parâmetro de URL malformado).
window.addEventListener('cofre:abrir-configuracao', async (ev) => {
    const tela = ev.detail?.tela;
    if (tela === 'categorias') docs.abrirConfiguracoes();
    else if (tela === 'subtipos') await controles.abrirSubtiposControle();
    else if (tela === 'modelos') await controles.abrirModelosControle();
});

window.addEventListener('cofre:montar-home', () => docs.montarHome());

window.addEventListener('cofre:abrir-ativo', (ev) => ativos.abrirFichaAtivo(ev.detail.id));
// NOVO (v1.x, 29/08/2026) — acionado pela Central de Comunicações
// (onboarding variante "ativo", ver cofre-navegacao.js bootstrap()) ao
// concluir o passo final: abre o form de cadastro de ativo, mesmo botão
// "+" que a tela já usa.
window.addEventListener('cofre:abrir-form-ativo', () => ativos.abrirFormAtivo());
window.addEventListener('cofre:abrir-documento', (ev) => docs.abrirFichaDocumento(ev.detail.id));

window.addEventListener('cofre:upload-contextual', (ev) => {
    docs.abrirUploadContextual(ev.detail.entidadeTipo, ev.detail.entidadeId, ev.detail.nome);
});

window.addEventListener('cofre:contexto-imovel-sem-ativo', (ev) => abrirCriacaoAssistida(ev.detail.imovelId, ev.detail.imovel, true));

window.addEventListener('cofre:navegar-contexto', (ev) => nav.abrirContexto(ev.detail.tipo, ev.detail.ref, null));

window.addEventListener('cofre:recarregar-documentos', async () => {
    estado.documentos = await api.listarDocumentos(estado.clienteId);
    docs.montarHome();
    const telaAtual = document.querySelector('[data-screen]:not(.hidden)')?.dataset.screen;
    if (telaAtual === 'home') docs.montarHome();
    if (telaAtual === 'ficha-item-controle') controles.renderizarDocumentosItemControle();
});
window.addEventListener('cofre:recarregar-ativos', async () => {
    estado.ativos = await api.listarAtivos(estado.clienteId);
    ativos.renderAtivosLista();
    docs.montarHome();
});
window.addEventListener('cofre:recarregar-contatos', async () => {
    estado.contatos = await api.listarContatos(estado.clienteId);
});
window.addEventListener('cofre:recarregar-eventos', async () => {
    estado.ocorrenciasAbertas = await api.listarOcorrenciasAbertasComItem(estado.clienteId);
    docs.montarHome();
    const telaAtual = document.querySelector('[data-screen]:not(.hidden)')?.dataset.screen;
    if (telaAtual === 'alertas') renderAlertas();
    if (telaAtual === 'ficha-ativo' && estado.ativoEmFoco) ativos.abrirFichaAtivo(estado.ativoEmFoco.id);
    if (telaAtual === 'ficha-item-controle') controles.recarregarFichaItemControle();
});

// ============================================================================
// TELAS COMPARTILHADAS (Sobre/Licença/Pessoas/Minha Empresa) — v1.20.0
// (merge, pedido explícito): essas 4 telas são de administração do
// CLIENTE, não do módulo Cofre, então usam os MESMOS arquivos
// js/comum-*.js que index.html usa (importados no topo deste arquivo).
// Cada montarXCofre() só monta o contexto (dbAuth/clienteId/callbacks)
// — toda a lógica de tela mora nos módulos compartilhados, nunca
// duplicada aqui.
// ============================================================================

// Adaptador de toast: comum-sobre.js/comum-pessoas.js/comum-minha-
// empresa.js falam o vocabulário do App ('success'/'danger'/'info' —
// ver index.html mostrarToast()); o Cofre fala outro ('erro'/'aviso'/
// default=sucesso — ver cofre-ui.js mostrarToast()). Sem este
// adaptador, uma mensagem de erro do módulo compartilhado sairia verde
// (cor de sucesso) no Cofre.
function onToastCofre(msg, tipo) {
    mostrarToast(msg, tipo === 'danger' ? 'erro' : (tipo === 'info' ? 'aviso' : undefined));
}

// Log genérico — mesma tabela/formato de registrarLog() em index.html.
// O Cofre não tinha essa função (nada aqui precisava dela até agora);
// existir só aqui, local, evita criar uma dependência nova em
// cofre-api.js pra uma escrita tão simples e genérica.
async function registrarLogCofre(acao, detalhe) {
    try {
        await api.dbAuth.from('log_acessos').insert({
            cliente_id: estado.clienteId, pessoa_id: estado.pessoa?.id, acao, detalhe: detalhe || {},
        });
    } catch (err) {
        console.warn('[cofre-app] Falha ao registrar log:', err.message);
    }
}

// NOVO — Cofre nunca teve botão "Sair" (Sobre era só um modal com 2
// linhas de versão, sem ação nenhuma). signOut + volta pra raiz do repo
// (index.html) — é lá que mora a tela de login; ficar no Cofre depois de
// deslogar só mostraria a tela de "sessão expirada" do bootstrap().
async function sairCofre() {
    await api.dbAuth.auth.signOut();
    window.location.href = './';
}

async function montarSobreCofre() {
    const mount = document.getElementById('mount-sobre-cofre');
    if (!mount) return;
    let dadosEmpresa = {};
    try { dadosEmpresa = await buscarDadosEmpresa(api.dbAuth, estado.clienteId) || {}; }
    catch (err) { console.warn('[cofre-app] Falha ao buscar dados da empresa pro cabeçalho do Sobre:', err.message); }

    await montarAbaSobre(mount, {
        dbAuth: api.dbAuth, clienteId: estado.clienteId, pessoaId: estado.pessoa?.id,
        configCliente: {
            nomeEmpresa: dadosEmpresa.nome_empresa || estado.pessoa?.clienteNome || '',
            cnpj: dadosEmpresa.cnpj || '', cidade: dadosEmpresa.cidade || '', uf: dadosEmpresa.uf || '',
            logoUrl: dadosEmpresa.logo_url || '',
        },
        appVersao: 'v' + COFRE_VERSAO,
        // "App Raiz Patrimônio" precisa ser atualizada manualmente aqui
        // a cada deploy do App — mesma limitação (e mesmo motivo)
        // documentada em index.html/atualizarSecaoSobreLicenca() e no
        // changelog de js/comum-sobre.js v1.1.0. ⚠️ Valor abaixo não
        // confirmado nesta sessão de merge (não tenho o index.html
        // atual em mãos) — conferir antes de publicar.
        modulos: [
            { nome: 'Cofre de Documentos', versao: 'v' + COFRE_VERSAO },
            { nome: 'App Raiz Patrimônio', versao: 'Beta v1.65.0' },
        ],
        onLogout: sairCofre,
        onToast: onToastCofre,
    });
}

async function montarLicencaCofre() {
    const mount = document.getElementById('mount-licenca-cofre');
    if (!mount) return;
    await montarAbaLicenca(mount, { dbAuth: api.dbAuth, clienteId: estado.clienteId });
}

async function montarPessoasCofre() {
    const mount = document.getElementById('mount-pessoas-cofre');
    if (!mount) return;
    await montarAbaPessoas(mount, {
        dbAuth: api.dbAuth, clienteId: estado.clienteId, perfilLogado: estado.pessoa?.perfil,
        onToast: onToastCofre, registrarLog: registrarLogCofre,
    });
}

async function montarMinhaEmpresaCofre() {
    const mount = document.getElementById('mount-minha-empresa-cofre');
    if (!mount) return;
    await montarAbaMinhaEmpresa(mount, {
        dbAuth: api.dbAuth, clienteId: estado.clienteId,
        onToast: onToastCofre, registrarLog: registrarLogCofre,
        // Sem onBrandingAtualizado de propósito — Cofre não gera recibo/
        // PDF (nada pra reaplicar), e o nome mostrado no header
        // (#cofre-nome-empresa) vem de `nome_empresa`, campo que este
        // formulário não edita (trava igual ao do App).
    });
}

// ============================================================================
// BOOT
// ============================================================================
nav.bootstrap().catch(err => {
    console.error('Falha no bootstrap do Cofre:', err);
    mostrarToast('Erro inesperado ao carregar o Cofre.', 'erro');
});
