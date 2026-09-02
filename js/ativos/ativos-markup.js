// ============================================================================
// js/ativos/ativos-markup.js — Raiz Patrimônio · Módulo Único, fatia frontend 1
// Versão: 1.14.0 · 02/09/2026
//
// v1.14.0 — box "Partes" NOVO na ficha do item de controle (pedido
// explícito, ver changelog completo em cofre-controles.js v1.11.0) —
// entre Ocorrência e Contatos vinculados.
//
// v1.13.0 — comentário do painel Propriedade corrigido (não descreve
// mais 2 tabelas possíveis — propriedade_ativo é a única fonte desde
// cofre-ativos.js v1.13.0/cofre-api.js v1.13.0).
//
// v1.12.0 — BUG REAL corrigido, achado com screenshot real: "esta
// barra de rolagem nos chips nunca deve existir". A fileira de abas da
// ficha do ativo (Dados/Contratos/.../Fotos) tinha voltado a ter
// overflow-x-auto na v1.10.0 pra caber as 7 abas, escondendo a barra
// via CSS (::-webkit-scrollbar{display:none}) — só que essa técnica já
// tinha se mostrado insuficiente ANTES, na v1.95.0 (mesma barra cinza
// com setas, indicador nativo de alguns Android/Samsung Internet que
// ignora CSS de scrollbar) — reintroduzi sem perceber que era o mesmo
// bug já resolvido. Corrigido de vez: flex-wrap em vez de overflow-x,
// a fileira quebra em 2 linhas quando não cabe tudo numa só — sem
// overflow não existe scrollbar possível, de nenhum tipo, garantido.
// 3 comentários de changelog redundantes/parcialmente contraditórios
// sobre esta mesma fileira (v1.95.0/v1.7.0/v1.10.0) consolidados num
// só, pra não deixar histórico confuso pra próxima sessão.
//
// v1.11.0 — pedido explícito, 02/09/2026: "durante a criação de um novo
// ativo, seguir a mesma regra e funcionalidade de um novo imóvel
// antigamente". Formulário "Novo ativo" ganhou seção de divisão
// societária embutida (ids naf-pe-linhas/naf-pe-soma, distintos do
// popup do chip Propriedade — os 2 ficam no DOM ao mesmo tempo, Tipo A
// é sempre estático). Ver cofre-ativos.js v1.13.0 pro comportamento
// completo (default de sócio de maior cota, validação de soma=100%).
//
// v1.10.0 — pedido explícito, 02/09/2026: "a ordem dos chips nos ativos
// deve ser: Dados, Contratos, Controles, Financeiro, Propriedade,
// Documentos e Fotos." Reordenado (era Dados/Documentos/Controles/
// Contratos/Financeiro/Fotos) + 7ª aba nova: Propriedade (painel
// #fa-painel-propriedade — mostra a divisão societária do ativo +
// botão "Editar divisão", conteúdo montado por montarPropriedadeAtivo()/
// abrirEditarPropriedadeAtivo(), cofre-ativos.js v1.12.0). Com 7 abas,
// flex-1 não cabe mais legível — a fileira (.fa-subtab) voltou a rolar
// horizontalmente, mas com a mesma técnica de sempre (.raiz-sem-scrollbar):
// rola, sem mostrar barra. Diferente da decisão de v1.95.0 (retirou
// rolagem de 5 abas porque cabiam sem ela) — aqui não cabe mesmo, então
// a rolagem é a solução certa, não o problema que aquela versão evitou.
//
// v1.9.0 — gap de CSS achado a partir de 3 screenshots (Family Office
// Karen Corporation, 02/09/2026): .card-ativo/.card-doc (a moldura
// branca com borda 2px que separa cada card na lista) nunca tiveram
// CSS no contexto embutido no App — existiam só no <style> do <head>
// de cofre.html standalone, mesma classe de gap já corrigida uma vez
// pra .modal-overlay/.modal-box (v1.95.1) e que tinha passado batido
// nesta regra específica. Migrado o valor exato do cofre.html (border
// 2px #e2e8f0, radius 14px, fundo branco) pro <style> injetado aqui —
// mesmo padrão do bloco de modais, logo abaixo dele. O HTML de cada
// card sempre esteve certo (ícone, título, endereço, status, chip de
// alerta) — só a caixa em volta nunca teve onde nascer visualmente.
// Ver cofre-ativos.js v1.11.0 pros outros 2 achados desta mesma rodada
// (bug do "Editar" não voltando pra tab-ativos + scroll dos chips).
//
// v1.8.0 — 6ª aba na ficha do ativo: Financeiro (NOVO, pedido explícito,
// "adicione a um ativo um novo chip de fluxo financeiro onde é possível
// ver as entradas e saídas daquele ativo. Permita lançamento por este
// chip também e um atalho para a tela de saídas financeiras"). Botão
// novo na fileira de abas (flex-1, 6 no lugar de 5) + painel novo
// (#fa-painel-financeiro: 2 mini-cards de resumo + lista + 2 botões-
// ponte pro App). Conteúdo montado por montarFinanceiroAtivo()
// (cofre-ativos.js v1.10.0) — nenhum HTML de formulário de despesa
// entrou aqui, os 2 botões são pontes (data-action="fa-novo-lancamento"
// / "fa-ver-saidas-ativo", registrados em cofre-app.js v1.15.0).
//
// v1.7.0 — data-action-change="ativo-imovel-origem-mudou" no select
// "Qual imóvel?" (pedido explícito, "modal não traz os campos certos"
// — ver cofre-ativos.js v1.9.0/cofre-app.js v1.14.0).
//
// v1.6.0 — 2 correções achadas com screenshot real, pedido explícito
// ("a lista de ativos está bem diferente... elimine qq menção que seja
// por módulo"):
//   1) BUG REAL: a grade de dados do imóvel (aba Dados da ficha)
//      entrava como 3º filho dentro de #fa-resumo-origem-imovel, um
//      <div flex justify-between> com só 2 filhos previstos — layout
//      quebrava (grade "flutuando" ao lado do texto). Corrigido: grade
//      ganhou container próprio (#fa-dados-imovel-grid), fora do flex.
//      Frase "Este ativo referencia um imóvel já cadastrado" SAIU —
//      expunha a arquitetura por trás em vez de mostrar o dado.
//   2) Abas da ficha (Dados/Documentos/Controles/Contratos/Fotos)
//      pararam de rolar horizontalmente (overflow-x-auto removido,
//      flex-1 no lugar de flex-none) — as 5 cabem sem rolar; a barra
//      cinza estranha da screenshot é muito provavelmente o indicador
//      de rolagem nativo de navegadores Android/Samsung Internet, que
//      não respeita as técnicas de esconder scrollbar via CSS. Corrige
//      a causa (rolagem desnecessária), não só o sintoma.
//   Subtítulo da aba Contratos reescrito ("aqui é só o vínculo" saiu —
//   mesma limpeza de linguagem por módulo).
//
// v1.5.0 (31/08/2026, pedido explícito: "apague a aba antiga do cofre
// de visão geral pra irmos reduzindo e limpando o html") — data-screen=
// "home" e data-screen="alertas" APAGADAS (~65 linhas). "Em triagem" e
// "Atenção necessária" (que a Home mostrava) migraram pra Visão Geral
// de verdade (index.html v1.94.2, carregarPontosAtencaoFundidos()) —
// ver comentário completo no lugar onde as seções foram removidas.
//
// v1.4.1 — ajustes de qualidade pedidos depois do Nicola testar a
// v1.94.0 em navegador de verdade:
//   1) <style> novo (1x, topo do template) — esconde a barra de
//      rolagem das 2 fileiras horizontais (chips de tipo + abas da
//      ficha), sem desligar a rolagem em si ("anexo uma barra de
//      rolagem que fica feia... não usar este recurso").
//   2) Barra de botões da lista de Ativos reorganizada: Localizar/
//      Vitrine (novo)/Adicionar/Carregar documento (novo). "Visão
//      geral do Cofre" (ir-home) REMOVIDA — pedido explícito ("eliminar
//      o 1º botão que leva pra tela de visão geral antiga"). "Cadastrar
//      imóvel" (casinha+) SAIU da barra — não apagada, virou link "+
//      Cadastrar novo imóvel" dentro do form "Novo ativo" > "Qual
//      imóvel?", que é onde o bug real dela também foi corrigido (ver
//      cofre-app.js v1.12.0).
//
// v1.4.0 (31/08/2026, pedido explícito, "seguir com a unificação") —
// botão novo "Cadastrar novo imóvel" na barra da tela data-screen=
// "ativos" (data-action="cadastrar-imovel-app", ponte defensiva pra
// abrirCadastroImovelModal() do App — ver cofre-app.js v1.11.0). Existe
// porque o segmento Imóveis/Ativos saiu (index.html v1.94.0) — sem um
// caminho sempre disponível, cadastrar imóvel novo dependeria de existir
// algum alerta pendente na Visão Geral pra levar até tab-imoveis.
//
// Guarda o HTML do Cofre (extraído de cofre.html, 31/08/2026) como string,
// pra não fazer o index.html crescer mais — ele só injeta este conteúdo
// num container vazio (#ativos-mount-point) na primeira vez que a aba
// Ativos é aberta, em vez de carregar tudo isso inline no arquivo principal.
//
// O QUE FOI EXTRAÍDO: os 15 blocos de nível 0 do <body> do cofre.html —
// #app-cofre (o shell principal) + 13 modais (#modal-busca-global,
// #modal-busca-ativos, #modal-lightbox-fotos,
// #modal-upload, #modal-ficha-doc, #modal-sugestoes-ia,
// #modal-criacao-assistida, #modal-menu-conta, #modal-sobre-cofre,
// #modal-categorias, #modal-subtipos-controle, #modal-modelos-controle)
// + #toast. Cobertura conferida: dos 157 ids que js/cofre-*.js referencia
// via getElementById, 148 vêm deste HTML estático e 9 são criados em tempo
// de execução pelo próprio JS (modal-generico e campos de formulário
// injetados via innerHTML) — nenhum ficou de fora.
// v1.3.0 — #modal-documentos-ativo SAIU da lista (removido, ver changelog
// abaixo) — 14 blocos de nível 0 agora, não mais 15.
//
// #tela-bootstrap e #tela-erro-acesso do cofre.html NÃO foram trazidos —
// o index.html já tem tela de carregamento e tratamento de sessão
// expirada próprios. Só entraram como placeholders vazios (sempre
// escondidos) porque nav.bootstrap() (cofre-navegacao.js) referencia os
// dois sem checar null — sem o placeholder, o boot quebra com
// TypeError antes de mostrar qualquer coisa.
//
// v1.3.0 (31/08/2026, pedido explícito: "unificar a lista de ativos e
// imóveis. Ao clicar no ativo/imóvel, deve evoluir a exemplo do
// protótipo") — ficha do ativo (data-screen="ficha-ativo") reestruturada
// de boxes empilhados pra 5 abas (Dados/Documentos/Controles/Contratos/
// Fotos), igual ao mockup (PROTOTIPO_MODULO_UNICO_RAIZ_v1_0.html,
// page-ficha). Detalhe técnico completo no changelog do index.html desta
// mesma entrega — resumo aqui:
//   - fa-cabecalho mudou de lugar (era dentro do box "Dados do ativo",
//     agora é o cabeçalho da ficha inteira, acima das abas) — mesmo id.
//   - #modal-documentos-ativo REMOVIDO — conteúdo (2 botões de upload +
//     #fa-tab-documentos) movido pra dentro da aba Documentos, inline.
//   - Aba Contratos é NOVA — #fa-contratos-lista, populada por
//     montarContratosAtivo() (cofre-ativos.js v1.6.0), só quando o ativo
//     referencia um imóvel.
//   - #fa-fotos-vazio novo — estado vazio da aba Fotos (antes, sem foto,
//     o box simplesmente não existia; numa aba própria isso pareceria
//     tela quebrada).
// Mudança de padrão DELIBERADA, só nesta tela — o resto do app (ficha do
// imóvel, ficha do contrato) continua com boxes empilhados, decisão de
// Design System de 25/08/2026 ("menu suspenso com abas não é o padrão
// do projeto"). Registrado aqui pra não parecer inconsistência.
//
// v1.2.0 (31/08/2026, "Fase A" da fusão Ativos/Imóveis, pedido explícito)
// — container #ativos-chips-tipo novo, vazio de propósito (populado via
// JS por renderChipsAtivos(), cofre-ativos.js v1.5.0) — chips
// Todos/Imóveis/Veículos/Outros com contador, batendo com o protótipo.
// Aditivo: o dropdown fino de subtipo (dentro do modal "Buscar/
// Filtrar") não foi tocado, continua existindo do lado dos chips.
//
// v1.1.0 (31/08/2026, pedido explícito) — 1 ícone novo ("Visão geral do
// Cofre", data-action="ir-home") na barra da tela data-screen="ativos".
// É ESTE ARQUIVO que é uma cópia própria (extraída de cofre.html), não o
// cofre.html de verdade — editar aqui NÃO afeta a página standalone
// (cofre.html continua com seu switcher normal). Existe porque a Home
// interna do Cofre deixou de ser a tela padrão da aba Ativos (ver
// ativos-boot.js v1.1.0) e o switcher (nav.bottom-nav) foi escondido —
// sem este ícone, Home/Alertas/"Em triagem"/"Comece pelo documento"
// ficariam sem NENHUMA porta de entrada dentro da aba Ativos.
// ============================================================================

export const ATIVOS_MARKUP = `<style>
    /* v1.94.1 (31/08/2026, pedido explícito: "anexo uma barra de
       rolagem que fica feia... ao rolar os chips não mostrar a barra")
       — esconde a barra de rolagem SEM desligar a rolagem em si, nas 2
       fileiras horizontais deste módulo (chips de tipo + abas da ficha
       do ativo). Cross-browser: scrollbar-width (Firefox), -ms-overflow-
       style (Edge antigo), ::-webkit-scrollbar (Chrome/Safari/Edge novo).
       1x só aqui — <style> injetado via innerHTML funciona normal
       (diferente de <script>, que não executa assim), então não precisa
       repetir em cada lugar que usa a classe. -->
    .raiz-sem-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
    .raiz-sem-scrollbar::-webkit-scrollbar { display: none; }

    /* v1.14.0 (02/09/2026, pedido explícito: "resolva as pendências de
       cores") — auxiliar pro hover de border (inline style não suporta
       :hover). Só existe aqui, no contexto embutido — cofre.html
       standalone tem seu próprio <style> separado, precisaria da mesma
       regra se o hover também importar lá (não reportado quebrado, fora
       de escopo hoje). */
    .raiz-hover-borda-sprout:hover { border-color: var(--sprout) !important; }

    /* v1.95.1 (01/09/2026, pedido explícito: "os botões devem funcionar
       da mesma forma que no módulo de imóveis, abrindo modais no bottom
       sheet") — ACHADO REAL, não só ajuste: .modal-overlay/.modal-box
       são usadas por 15 modais diferentes deste módulo (busca de
       ativos, upload, ficha de documento, sugestões de IA, criação
       assistida, categorias, sub-tipos, modelos de controle, menu de
       conta do Cofre, sobre) — e essas 2 classes NUNCA tiveram CSS
       definido no contexto embutido no App. No cofre.html standalone
       elas vêm do <style> do <head>, que nunca foi extraído junto (só o
       <body> foi trazido pra cá, ver comentário no topo do arquivo) —
       um vazio real, presente desde a v1.80.0, só agora encontrado.
       Mesmo padrão bottom-sheet Tipo B do Design System (sobe de baixo,
       cantos só em cima, fundo escurecido) — igual ao resto do app.
       display:flex vem de regra de CLASSE (:not(.hidden)), nunca
       inline junto com position:fixed no mesmo elemento — é a mesma
       armadilha já documentada no Design System (§9, Tipo A): estilo
       inline sempre vence .hidden por especificidade CSS. */
    .modal-overlay { position: fixed; inset: 0; z-index: 96; align-items: flex-end; justify-content: center; background: rgba(23,33,30,.5); }
    .modal-overlay:not(.hidden) { display: flex; }
    .modal-box { background: #fff; border-radius: 16px 16px 0 0; max-width: 480px; width: 100%; max-height: 85vh; overflow-y: auto; }

    /* v1.9.0 (02/09/2026, pedido explícito com 3 screenshots: "cada
       ativo deve aparecer num box com moldura e fundo") — MESMO GAP do
       bloco acima (.modal-overlay/.modal-box), só que nunca tinha sido
       encontrado: .card-ativo/.card-doc também só existiam no <style>
       do <head> de cofre.html standalone, nunca extraídas junto pro
       contexto embutido no App. Efeito prático: o card da lista de
       Ativos sempre teve TODO o conteúdo certo (ícone, título, endereço,
       status, chip de alerta — ativoCardHtml() já montava tudo isso
       direito), só nunca teve moldura/fundo/sombra visíveis — parecia
       uma lista "pobre" sem caixa nenhuma, não porque faltava HTML, mas
       porque a classe que desenha a caixa nunca chegou a existir aqui.
       Mesmo valor exato do cofre.html (border 2px #e2e8f0, radius 14px,
       fundo branco) — não inventei um novo, só migrei o que já existia. */
    .card-doc, .card-ativo { border: 2px solid #e2e8f0; border-radius: 14px; background: #fff; transition: border-color .15s; }
    .card-doc:hover, .card-ativo:hover { border-color: var(--pine-light); }

</style><div id="tela-bootstrap" class="hidden"></div>
<div id="tela-erro-acesso" class="hidden"></div>

<div id="app-cofre" class="hidden">

    <!-- Header (revisão DS, 25/08/2026) — reconstruído pra bater 1:1 com o
         padrão do App (index.html #main-header):
         (1) SEM max-w-md/mx-auto aqui — o wrapper anterior comprimia o
         cabeçalho inteiro numa faixa central em telas largas (raiz do
         "ícones centralizados" vs. os do App, que ficam nas laterais reais
         da janela). Só o <main> abaixo é limitado a max-w-md, igual ao App.
         (2) Nome/selo/botões/ícone de robô (com piscar) copiados
         literalmente do App — ver Design System §5-A (novo, App vs. Cofre). -->
    <header class="sticky top-0 z-40" style="background:var(--pine-deep)">
        <div class="p-3 flex justify-between items-center">
            <div class="min-w-0">
                <span class="text-lg font-black tracking-wider text-white/80 block leading-tight" id="cofre-nome-empresa">—</span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-white/80 inline-block mt-0.5">Cofre</span>
            </div>
            <div class="flex items-center gap-2 flex-none">
                <span class="text-[10px] hidden sm:inline" style="color:var(--pine-light)" id="badge-versao-cofre">v1.2.0</span>
                <button data-action="abrir-bot" title="Falar com R.AI.Z" class="w-9 h-9 flex-none flex items-center justify-center bg-white/10 rounded-full active:scale-90 transition text-white">
                    <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <path d="M12 2v3"/>
                        <circle cx="12" cy="2" r="1" fill="currentColor" stroke="none"/>
                        <rect x="4" y="7" width="16" height="12" rx="4"/>
                        <circle class="raiz-bot-eye" cx="9" cy="13" r="1.8" fill="currentColor" stroke="none"/>
                        <circle class="raiz-bot-eye" cx="15" cy="13" r="1.8" fill="currentColor" stroke="none"/>
                        <path d="M9 16.5c.8.6 1.9.9 3 .9s2.2-.3 3-.9" stroke-width="1.6"/>
                        <path d="M2 11v3"/>
                        <path d="M22 11v3"/>
                    </svg>
                </button>
                <button data-action="abrir-menu-conta" title="Configurações" class="w-9 h-9 flex-none flex items-center justify-center bg-white/10 rounded-full active:scale-90 transition">
                    <i data-lucide="user" style="width:18px;height:18px" class="text-white"></i>
                </button>
            </div>
        </div>
    </header>

    <!-- v1.14.0 (02/09/2026, pedido explícito, achado com 3 screenshots:
         "a largura do box dos ativos está mais estreita que o padrão
         do sistema... ajustar para o padrão") — BUG REAL: max-w-md
         mx-auto px-4 py-5 aqui duplicava o que o <main id="main-content">
         do App (index.html) JÁ aplica por fora (p-4 max-w-md mx-auto) —
         16px de padding horizontal do App + 16px daqui = 32px de cada
         lado, conteúdo sempre mais estreito que qualquer outra aba.
         Mesma classe de bug já corrigida uma vez pro <header> duplicado
         (escondido via CSS em ativos-boot.js) — desta vez é o <main>,
         que não dá pra esconder (é o container do conteúdo de verdade),
         só remover o padding/largura redundante. cofre.html standalone
         tem sua PRÓPRIA cópia deste <main> (não compartilha este
         arquivo) — não afetado por esta mudança. -->
    <main>

        <!-- ===================== HOME + ALERTAS — APAGADAS (31/08/2026,
             pedido explícito: "os documentos em triagem e qq outro
             alerta que venha do sistema deve estar na aba de visão
             geral integrada do app... apague a aba antiga do cofre de
             visão geral pra irmos reduzindo e limpando o html").

             O que cada uma mostrava e pra onde foi:
               - KPIs (ativos controlados/alertas próximos/documentos
                 guardados) — não eram alertas, eram só contadores;
                 removidos sem substituto (Patrimônio sob gestão, no
                 tab-geral real do App, já cobre o mesmo espírito).
               - "Comece pelo documento" (upload rápido sem escolher
                 ativo antes) — já virou o botão "Carregar documento" na
                 barra da lista de Ativos (v1.94.1), mesma ação
                 (abrir-upload-home), só mudou de endereço.
               - "Em triagem" — MOVIDO pra Visão Geral de verdade
                 (tab-geral, index.html) — ver carregarPontosAtencaoFundidos()
                 v1.94.2, mesma classificação (documento com 0 vínculos).
               - "Atenção necessária" (controles vencidos/vencendo) — JÁ
                 tinha sido fundido na Visão Geral desde a v1.91.0
                 (carregarPontosAtencaoFundidos) — esta seção da Home era
                 puramente redundante desde então, só ninguém tinha
                 apagado ainda.
               - Tela "Alertas" (tela cheia) — já estava ÓRFÃ antes desta
                 versão: nenhum botão no HTML chamava mais 'ir-alertas'
                 (o "Ver todos →" que levava até ela tinha sido removido
                 numa revisão de 25/08/2026, documentada no próprio
                 código, sem que a seção em si tivesse sido apagada
                 junto). As ações "Tratar"/"Acionar" que ela oferecia não
                 se perdem — abrem o mesmo lugar que já é alcançável
                 direto pela ficha do ativo (aba Controles → item →
                 tratar), só sem o atalho de lista consolidada.

             cofre-documentos.js (montarHome) e cofre-app.js
             (renderAlertas) NÃO foram apagados — são arquivos
             compartilhados com o cofre.html standalone, que continua
             com as duas telas normalmente. Só ganharam guarda defensiva
             (elemento nulo = não faz nada) pra não quebrar quando
             chamados aqui dentro, onde os elementos não existem mais.
             Ver changelog completo desta versão no index.html. -->

        <!-- ===================== ATIVOS (lista) ===================== -->
        <section data-screen="ativos" class="hidden">
            <div class="flex items-center gap-2 mb-4">
                <p class="text-[11px] flex-1 text-left" style="color:var(--sage)">Bens e proteções acompanhados pelo Cofre.</p>
                <!-- v1.94.1 (31/08/2026, pedido explícito) — barra
                     reorganizada: "Localizar / Vitrine / Adicionar /
                     Carregar documento" — 4 ações, batendo com o que a
                     lista antiga de Imóveis sempre ofereceu.
                     REMOVIDOS: "Visão geral do Cofre" (ir-home, 1º
                     botão de antes) — pedido explícito, levava pra uma
                     tela de Visão Geral que duplicava a de verdade do
                     App; "Cadastrar imóvel" (casinha+) — não removido
                     de fato, só mudou de endereço: virou link "+
                     Cadastrar novo imóvel" dentro do próprio formulário
                     "Novo ativo" > "Qual imóvel?" (ver aoMudarTipoAtivo,
                     cofre-ativos.js), onde faz mais sentido estar. -->
                <button data-action="abrir-busca-ativos" title="Localizar" class="w-11 h-11 flex-none flex items-center justify-center bg-white text-slate-700 border border-slate-300 rounded-full shadow active:scale-90 transition">
                    <i data-lucide="search" style="width:20px;height:20px"></i>
                </button>
                <!-- "Vitrine" — ponte pra tab-vitrine (fluxo de sempre,
                     seleção múltipla de imóveis + link único). Ao
                     contrário do "Cadastrar imóvel", tab-vitrine é uma
                     aba de nível normal (não um modal preso dentro de
                     outra aba escondida) — switchTab() já lida com isso
                     nativamente, sem o mesmo bug de display:none. -->
                <button data-action="ir-vitrine-app" title="Vitrine" class="w-11 h-11 flex-none flex items-center justify-center bg-white text-slate-700 border border-slate-300 rounded-full shadow active:scale-90 transition">
                    <i data-lucide="image" style="width:20px;height:20px"></i>
                </button>
                <button data-action="abrir-form-ativo" id="btn-toggle-ativo" class="w-11 h-11 flex-none flex items-center justify-center bg-white text-slate-700 border border-slate-300 rounded-full shadow active:scale-90 transition" title="Adicionar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
                <!-- "Carregar documento" — mesmo fluxo de sempre
                     (abrir-upload-home, já existia no dispatcher, usado
                     antes só pelo card "Comece pelo documento" da Home
                     interna do Cofre) — upload rápido sem precisar abrir
                     um ativo específico primeiro, decide o vínculo (ou
                     deixa em triagem) depois. -->
                <button data-action="abrir-upload-home" title="Carregar documento" class="w-11 h-11 flex-none flex items-center justify-center bg-white text-slate-700 border border-slate-300 rounded-full shadow active:scale-90 transition">
                    <i data-lucide="upload" style="width:20px;height:20px"></i>
                </button>
            </div>

            <!-- v1.5.0 (31/08/2026, pedido explícito, "Fase A" da fusão
                 Ativos/Imóveis) — chips de tipo, batendo com o protótipo
                 (Todos/Imóveis/Veículos/Outros, com contador). Populados
                 por renderChipsAtivos() (cofre-ativos.js) — sempre que a
                 lista muda, os contadores mudam junto. Filtro ADITIVO: o
                 dropdown fino dentro de "Buscar/Filtrar" (7+ subtipos)
                 continua existindo do jeito que estava, pra quem quiser
                 filtrar por um subtipo específico (ex.: só Terrenos) —
                 os chips são só o atalho rápido pros 3 grupos grandes. -->
            <!-- v1.14.0 (02/09/2026, achado real, mesmo padrão já
                 corrigido nas abas da ficha do ativo: "os chips estão
                 tb com a barra de rolagem na aba de ativos") — a
                 técnica de esconder via CSS (.raiz-sem-scrollbar) não é
                 confiável em todo navegador Android (mesma lição já
                 registrada). Trocado pra flex-wrap — só 4 chips aqui,
                 cabem tranquilamente numa ou duas linhas sem rolagem
                 nenhuma, então nem falta o "cabe numa linha só" que
                 justificaria manter rolagem como no caso dos 7 chips da
                 ficha do ativo. -->
            <div id="ativos-chips-tipo" class="flex flex-wrap gap-2 mb-3"></div>

            <div id="ativos-lista" class="space-y-2"></div>
            <div id="ativos-estado-vazio" class="hidden text-center py-14">
                <i data-lucide="boxes" style="width:40px;height:40px;color:var(--sage)" class="mx-auto mb-2"></i>
                <p class="text-sm font-semibold">Nenhum ativo controlado ainda</p>
                <p class="text-xs mb-3" style="color:var(--sage)">Veículo, imóvel, terreno ou proteção pessoal.</p>
                <button data-action="abrir-form-ativo" class="px-4 py-2 rounded-xl text-sm font-semibold text-white" style="background:var(--pine)">+ Novo ativo</button>
            </div>
        </section>

        <!-- ===================== MODAL — NOVO ATIVO (Tipo A, DS §9) =====================
             C-4 (revisão DS): era painel inline (alternarToggle), mesmo padrão
             que Imóvel/Controles já tinham deixado pra trás. Convertido pra
             bottom-sheet estático, z-65, .modal-overlay herda o clique-fora-
             fecha genérico (cofre-app.js) e a proteção contra a armadilha do
             display inline (.hidden tem !important no Cofre — ver §9 nota do
             App pra armadilha equivalente). -->
        <div id="form-ativo-wrapper" class="modal-overlay hidden">
            <div class="modal-box p-4">
                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                    <h3 style="font-size:14px;font-weight:bold;color:#1e293b;">Novo ativo</h3>
                    <button type="button" data-action="fechar-form-ativo" style="background:#e2e8f0;border:none;border-radius:9999px;width:26px;height:26px;flex:none;">✕</button>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label class="text-xs font-semibold block mb-1">Tipo de ativo <span style="color:var(--danger)">*</span></label>
                        <select id="at-tipo" class="w-full border-2 border-slate-300 rounded-xl p-2 text-sm" data-action-change="ativo-tipo-mudou"></select>
                    </div>
                    <div>
                        <label class="text-xs font-semibold block mb-1">Nome de exibição <span style="color:var(--danger)">*</span></label>
                        <input type="text" id="at-nome" class="w-full border-2 border-slate-300 rounded-xl p-2 text-sm" placeholder="ex.: Honda Civic 2022">
                    </div>
                    <div id="at-origem-imovel-wrapper" class="hidden sm:col-span-2">
                        <label class="text-xs font-semibold block mb-1">Qual imóvel?</label>
                        <select id="at-origem-imovel" class="w-full border-2 border-slate-300 rounded-xl p-2 text-sm" data-action-change="ativo-imovel-origem-mudou"></select>
                        <p class="raiz-indicador-inline" style="color:var(--sage)">Não duplica dados — este ativo só guarda documentos/fotos/alertas específicos do Cofre; o imóvel em si continua em Imóveis.</p>
                        <!-- v1.94.1 (31/08/2026, pedido explícito) — substitui
                             o botão "Cadastrar imóvel" separado na barra da
                             lista (removido, estava quebrado e virou
                             confuso ter 2 portas pra Novo Ativo). O
                             cadastro de imóvel novo agora mora AQUI dentro,
                             junto de "Qual imóvel?" — faz mais sentido:
                             quem tá escolhendo um imóvel existente e não
                             acha o que precisa, cadastra ali mesmo, sem
                             sair do formulário. Ponte pra
                             abrirCadastroImovelModal() nativa do App (mesmo
                             data-action="cadastrar-imovel-app" de sempre). -->
                        <button type="button" data-action="cadastrar-imovel-app" class="text-xs font-bold mt-1.5" style="color:var(--sprout)">+ Cadastrar novo imóvel</button>
                    </div>
                    <div id="at-campos-estruturados" class="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3"></div>
                    <!-- v1.11.0 (NOVO, 02/09/2026, pedido explícito: "durante a
                         criação de um novo ativo, seguir a mesma regra e
                         funcionalidade de um novo imóvel antigamente") —
                         divisão societária embutida no formulário, mesmo
                         editor do chip Propriedade (cofre-ativos.js v1.13.0),
                         só que com ids próprios (naf-*) pra não colidir com
                         o popup "Editar divisão" — os 2 ficam no DOM ao
                         mesmo tempo (Tipo A é sempre estático). Pré-populado
                         com o sócio de maior % de cotas em 100%, mesmo
                         default que o formulário de imóvel antigo usava. -->
                    <div class="sm:col-span-2">
                        <p class="text-[11px] font-bold uppercase tracking-wide" style="color:var(--brass-deep)">Divisão societária</p>
                        <div id="naf-pe-linhas" class="space-y-2 mt-2"></div>
                        <button type="button" onclick="window.__peAdicionarLinha()" class="text-xs font-bold px-2.5 py-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300 flex items-center gap-1 mt-2">
                            <i data-lucide="plus" style="width:11px;height:11px"></i> Adicionar sócio
                        </button>
                        <div class="flex items-center justify-between text-xs font-bold mt-2">
                            <span>Soma</span>
                            <span id="naf-pe-soma">100%</span>
                        </div>
                    </div>
                </div>
                <div style="display:flex;gap:8px;margin-top:14px;">
                    <button data-action="salvar-ativo" style="flex:1;background:var(--pine);color:#fff;font-weight:bold;font-size:13px;padding:10px;border:none;border-radius:8px;">Salvar ativo</button>
                    <button type="button" data-action="fechar-form-ativo" style="flex:1;background:#f1f5f9;color:#475569;font-weight:bold;font-size:13px;padding:10px;border:none;border-radius:8px;">Fechar</button>
                </div>
                <p class="raiz-indicador-inline mt-2" id="at-status"></p>
            </div>
        </div>

        <!-- ===================== ALERTAS ===================== -->
<!-- ===================== TELA — FICHA DO ATIVO (boxes, padrão do App/Imóveis) ===================== -->
<section data-screen="ficha-ativo" class="hidden">

    <button data-action="voltar-ficha-ativo" class="text-xs font-bold text-slate-600 flex items-center gap-1"><i data-lucide="chevron-left" style="width:16px;height:16px"></i> Ativos</button>

    <!-- v1.93.0 (pedido explícito, 31/08/2026, "evoluir a exemplo do
         protótipo") — ficha reestruturada de boxes empilhados pra abas
         (Dados/Documentos/Controles/Contratos/Fotos), igual ao mockup
         (PROTOTIPO_MODULO_UNICO_RAIZ_v1_0.html, page-ficha). Isto é uma
         mudança deliberada de padrão nesta tela específica — o resto do
         app (ficha do imóvel, ficha do contrato) continua com boxes
         empilhados (padrão do Design System, "menu suspenso com abas
         não é o padrão do projeto" — decisão de 25/08/2026). Registrando
         a diferença aqui pra não parecer inconsistência não percebida:
         é intencional, pedido explícito, só nesta tela.
         fa-cabecalho MUDOU DE LUGAR (antes vivia dentro do box "Dados do
         ativo", agora é o cabeçalho da ficha inteira, acima das abas) —
         mesmo id, mesma função abrirFichaAtivo() que já preenchia,
         nenhuma mudança de JS precisou pra isso. -->
    <div id="fa-cabecalho" class="mt-3"></div>

    <!-- Histórico desta fileira, resumido (comentários antigos redundantes
         removidos em v1.12.0 pra não deixar versões contraditórias):
         v1.95.0 tirou overflow-x-auto (5 abas cabiam em flex-1 sem
         rolar) — achado então: a barra cinza com setas que aparece em
         alguns Android/Samsung Internet é um indicador nativo de
         rolagem que NÃO respeita ::-webkit-scrollbar{display:none}
         (essa técnica só funciona pro scrollbar clássico de desktop).
         v1.7.0/v1.10.0 mantiveram flex-1 ao adicionar Financeiro (6ª) e
         Propriedade (7ª) — na 7ª, flex-1 já não cabia legível, e a
         correção errada foi trazer overflow-x-auto de volta escondendo
         via CSS, reintroduzindo exatamente o bug que a v1.95.0 já tinha
         corrigido (mesma barra com setas voltou, confirmado por
         screenshot real, 02/09/2026: "esta barra de rolagem nos chips
         nunca deve existir"). v1.12.0 corrige de vez: flex-wrap, ZERO
         overflow-x — sem overflow não existe scrollbar possível, de
         nenhum tipo, em nenhum navegador. A fileira quebra em 2 linhas
         quando não cabe tudo numa só. Chips de TIPO (Todos/Imóveis/
         Veículos/Outros, na lista de Ativos) são um componente
         DIFERENTE deste e continuam com overflow-x-auto +
         raiz-sem-scrollbar — não tocados aqui; se o mesmo indicador
         nativo aparecer lá também, é a próxima fileira a trocar pra
         flex-wrap pelo mesmo motivo. -->
    <div class="flex flex-wrap gap-1 mt-4 mb-3" style="border-bottom:1px solid var(--line)">
        <button data-action="fa-trocar-aba" data-fa-aba="dados" class="fa-subtab flex-none whitespace-nowrap text-center text-xs font-bold px-3 py-2" style="color:var(--sprout);border-bottom:2px solid var(--sprout)">Dados</button>
        <button data-action="fa-trocar-aba" data-fa-aba="contratos" class="fa-subtab flex-none whitespace-nowrap text-center text-xs font-bold px-3 py-2 text-slate-500" style="border-bottom:2px solid transparent">Contratos</button>
        <button data-action="fa-trocar-aba" data-fa-aba="controles" class="fa-subtab flex-none whitespace-nowrap text-center text-xs font-bold px-3 py-2 text-slate-500" style="border-bottom:2px solid transparent">Controles</button>
        <button data-action="fa-trocar-aba" data-fa-aba="financeiro" class="fa-subtab flex-none whitespace-nowrap text-center text-xs font-bold px-3 py-2 text-slate-500" style="border-bottom:2px solid transparent">Financeiro</button>
        <button data-action="fa-trocar-aba" data-fa-aba="propriedade" class="fa-subtab flex-none whitespace-nowrap text-center text-xs font-bold px-3 py-2 text-slate-500" style="border-bottom:2px solid transparent">Propriedade</button>
        <button data-action="fa-trocar-aba" data-fa-aba="documentos" class="fa-subtab flex-none whitespace-nowrap text-center text-xs font-bold px-3 py-2 text-slate-500" style="border-bottom:2px solid transparent">Documentos</button>
        <button data-action="fa-trocar-aba" data-fa-aba="fotos" class="fa-subtab flex-none whitespace-nowrap text-center text-xs font-bold px-3 py-2 text-slate-500" style="border-bottom:2px solid transparent">Fotos</button>
    </div>

    <!-- ===== Painel: Dados ===== -->
    <div id="fa-painel-dados" class="fa-painel space-y-3">
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <!-- v1.95.0 (pedido explícito, 01/09/2026, achado com screenshot
                 real) — BUG REAL corrigido: #fa-resumo-origem-imovel era
                 flex+justify-between com 2 filhos (frase + botão); o JS
                 (montarDadosAtivo) entrava um 3º filho ali dentro (a
                 grade de dados) — 3 itens flex numa linha só quebravam o
                 layout inteiro (a grade "flutuava" ao lado da frase em
                 vez de ficar embaixo). Corrigido: grade agora tem
                 container PRÓPRIO (#fa-dados-imovel-grid), fora do flex.
                 Também "não temos mais dois módulos... elimine qq menção
                 que seja por módulo": a frase "Este ativo referencia um
                 imóvel já cadastrado" (que expunha a arquitetura por
                 trás em vez de mostrar o dado) SAIU — o link de editar
                 virou parte do cabeçalho da própria grade, sem chamar
                 atenção pra existir "um imóvel" separado do "ativo". -->
            <div id="fa-dados-imovel-grid" class="hidden mb-3"></div>
            <div id="fa-resumo-dados" class="text-sm space-y-1"></div>

            <div id="fa-editar-wrapper" class="hidden raiz-form-borda p-3 mt-2">
                <div id="fa-editar-campos" class="grid grid-cols-1 sm:grid-cols-2 gap-2"></div>
                <div class="flex justify-end gap-2 mt-3">
                    <button data-action="alternar-editar-ativo" class="px-3 py-2 rounded-xl text-xs border-2 border-slate-300">Cancelar</button>
                    <button data-action="salvar-edicao-ativo" class="px-3 py-2 rounded-xl text-xs font-semibold text-white" style="background:var(--sprout)">Salvar</button>
                </div>
            </div>

            <div class="flex justify-end mt-3 pt-3 border-t border-slate-100">
                <button data-action="alternar-mais-acoes-ativo" class="text-xs font-bold text-slate-500 flex items-center gap-1">
                    Mais ações <i data-lucide="chevron-down" id="fa-mais-acoes-seta" style="width:13px;height:13px"></i>
                </button>
            </div>
            <!-- v1.93.0 — pill "Documentos" SAIU daqui: virou aba própria,
                 não precisa mais de atalho dentro de Mais ações. Fotos/
                 Marcar como vendido/Excluir continuam (não são abas). -->
            <div id="fa-mais-acoes" class="hidden mt-2 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5 justify-end">
                <button data-action="alternar-editar-ativo" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 border border-slate-300">Editar dados</button>
                <label for="fa-foto-input" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 border border-slate-300" style="cursor:pointer">Fotos</label>
                <button data-action="marcar-ativo-vendido" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 border border-slate-300">Marcar como vendido</button>
                <button data-action="excluir-ativo-atual" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 border border-slate-300">Excluir</button>
            </div>
        </div>
    </div>

    <!-- ===== Painel: Contratos (NOVO, v1.93.0, pedido explícito) =====
         Só existe conteúdo de verdade quando o ativo referencia um
         imóvel (entidade_origem_tipo='imovel') — outros tipos de ativo
         não têm contrato de locação neste sistema. Leitura direta da
         tabela contratos via cofre-api.js (mesma conexão redundante já
         aceita, ver ativos-boot.js), sem duplicar nenhuma lógica de
         negócio de contrato (reajuste, minuta, rescisão continuam só na
         aba Contratos do App).
         v1.95.0 — subtítulo reescrito: "aqui é só o vínculo com este
         ativo" expunha a mesma dualidade ("vínculo" pressupõe 2 coisas
         separadas) — pedido explícito de eliminar linguagem por módulo. -->
    <div id="fa-painel-contratos" class="fa-painel hidden space-y-3">
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <h3 class="font-bold text-sm" style="color:var(--pine)">Contratos</h3>
            <p class="text-[11px] mt-0.5" style="color:var(--sage)">Reajuste, minuta e rescisão continuam na aba Contratos.</p>
            <div id="fa-contratos-lista" class="mt-3 space-y-2"></div>
        </div>
    </div>

    <!-- ===== Painel: Controles ===== -->
    <div id="fa-painel-controles" class="fa-painel hidden space-y-3">
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <h3 class="font-bold text-sm" style="color:var(--pine)">Controles</h3>
            <div id="fa-tab-controles" class="mt-1.5"></div>
            <div class="flex justify-end mt-3 pt-3 border-t border-slate-100">
                <button data-action="alternar-mais-acoes-controles" class="text-xs font-bold text-slate-500 flex items-center gap-1">
                    Mais ações <i data-lucide="chevron-down" id="fa-mais-acoes-controles-seta" style="width:13px;height:13px"></i>
                </button>
            </div>
            <div id="fa-mais-acoes-controles" class="hidden mt-2 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5 justify-end">
                <button data-action="abrir-form-controle" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 border border-slate-300">Criar item de controle</button>
            </div>
        </div>
    </div>

    <!-- ===== Painel: Financeiro (NOVO, v1.7.0, pedido explícito,
         01/09/2026) — entradas e saídas deste ativo. Só leitura +
         2 pontes pro App (Nova despesa / Ver tudo em Saídas); nenhum
         formulário de despesa vive aqui dentro, pra não duplicar a
         lógica que já existe na aba Saídas do Financeiro (mesmo
         princípio já usado no botão "Abrir gestão do imóvel" da aba
         Dados). Preenchido por montarFinanceiroAtivo() (cofre-ativos.js
         v1.10.0). -->
    <div id="fa-painel-financeiro" class="fa-painel hidden space-y-3">
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <h3 class="font-bold text-sm" style="color:var(--pine)">Financeiro</h3>
            <p class="text-[11px] mt-0.5" style="color:var(--sage)">Entradas e saídas ligadas a este ativo.</p>
            <div id="fa-financeiro-resumo" class="grid grid-cols-2 gap-2 mt-3"></div>
            <div id="fa-financeiro-lista" class="mt-3 space-y-2"></div>
            <div class="flex gap-2 mt-3 pt-3 border-t border-slate-100">
                <button data-action="fa-novo-lancamento" class="flex-1 text-xs font-bold px-2.5 py-2 rounded-lg bg-slate-100 text-slate-600 border border-slate-300 flex items-center justify-center gap-1">
                    <i data-lucide="plus" style="width:12px;height:12px"></i> Novo lançamento
                </button>
                <button data-action="fa-ver-saidas-ativo" class="flex-1 text-xs font-bold px-2.5 py-2 rounded-lg bg-slate-100 text-slate-600 border border-slate-300 flex items-center justify-center gap-1">
                    <i data-lucide="wallet" style="width:12px;height:12px"></i> Ver tudo em Saídas
                </button>
            </div>
        </div>
    </div>

    <!-- ===== Painel: Propriedade (v1.10.0, pedido explícito,
         02/09/2026: "todos os ativos devem ter a definição da
         propriedade com % de sócio na tabela correspondente") — mostra
         a distribuição atual (sócio/parte + %) e permite editar, mesmo
         espírito da "Divisão Societária" que já existia pra imóvel,
         agora estendida pra qualquer tipo de ativo. Backend (v1.13.0):
         propriedade_ativo é a ÚNICA fonte, sempre — dado de
         propriedade_imovel já migrado (100 linhas) e os 2 RPCs de
         negócio que liam de lá (fn_apurar_distribuicao,
         fn_leitura_tributaria_sinais) redirecionados também, testados
         sem regressão contra dado real. Montado por
         montarPropriedadeAtivo() (cofre-ativos.js). -->
    <div id="fa-painel-propriedade" class="fa-painel hidden space-y-3">
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <h3 class="font-bold text-sm" style="color:var(--pine)">Propriedade</h3>
            <p class="text-[11px] mt-0.5" style="color:var(--sage)">Divisão societária deste ativo.</p>
            <div id="fa-propriedade-lista" class="mt-3 space-y-2"></div>
            <div class="flex justify-end mt-3 pt-3 border-t border-slate-100">
                <button data-action="fa-editar-propriedade" class="text-xs font-bold px-2.5 py-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300 flex items-center gap-1">
                    <i data-lucide="pencil" style="width:11px;height:11px"></i> Editar divisão
                </button>
            </div>
        </div>
    </div>

    <!-- ===== Painel: Documentos =====
         v1.93.0 — antes era um MODAL (modal-documentos-ativo, aberto via
         pill "Documentos" em Mais ações). Movido pra cá, inline, igual
         ao protótipo — mesmos 2 botões de upload (Com IA/Upload simples,
         mesmos data-action de sempre) + mesma lista (#fa-tab-documentos,
         mesmo id, mesma montarDocumentosAtivo() que já preenchia —
         nenhuma mudança de JS precisou só por causa da mudança de
         lugar). O modal em si foi removido do HTML (ver changelog). -->
    <div id="fa-painel-documentos" class="fa-painel hidden space-y-3">
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <h3 class="font-bold text-sm mb-2" style="color:var(--pine)">Documentos</h3>
            <div class="grid grid-cols-2 gap-2 mb-3">
                <button data-action="abrir-upload-no-ativo-ia" class="border-2 border-dashed rounded-xl p-3 text-xs font-bold text-center flex flex-col items-center gap-1" style="border-color:var(--sprout); color:var(--sprout)">
                    <i data-lucide="sparkles" style="width:16px;height:16px"></i> Com IA
                </button>
                <button data-action="abrir-upload-no-ativo-simples" class="border-2 border-dashed rounded-xl p-3 text-xs font-bold text-center flex flex-col items-center gap-1" style="border-color:var(--sage); color:var(--sage)">
                    <i data-lucide="upload" style="width:16px;height:16px"></i> Upload simples
                </button>
            </div>
            <div id="fa-tab-documentos" class="space-y-2"></div>
        </div>
    </div>


    <!-- ===== Painel: Fotos ===== -->
    <div id="fa-painel-fotos" class="fa-painel hidden space-y-3">
        <div id="fa-box-fotos" class="hidden bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <h3 class="font-bold text-sm" style="color:var(--pine)">Foto</h3>
            <div id="fa-fotos-grid" class="flex flex-wrap gap-2 mt-2"></div>
            <div class="flex justify-end mt-3 pt-3 border-t border-slate-100">
                <button data-action="alternar-mais-acoes-fotos-ativo" class="text-xs font-bold text-slate-500 flex items-center gap-1">Mais ações <i data-lucide="chevron-down" id="fa-fotos-seta" style="width:13px;height:13px"></i></button>
            </div>
            <div id="fa-fotos-acoes" class="hidden mt-2 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5 justify-end">
                <label for="fa-foto-input" class="text-[11px] font-bold px-2.5 py-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300 flex items-center gap-1" style="cursor:pointer">
                    <i data-lucide="image-plus" style="width:11px;height:11px"></i> Adicionar fotos
                </label>
            </div>
        </div>
        <!-- v1.93.0 — estado vazio novo: antes, sem foto, a aba inteira
             ficaria em branco (fa-box-fotos escondido por
             montarFotosAtivo() quando não há foto) — dentro de uma aba
             própria isso ficaria estranho (parece tela quebrada, não
             "sem dado"). Alternado por montarFotosAtivo() junto com o
             box, sempre o oposto um do outro. -->
        <div id="fa-fotos-vazio" class="hidden text-center py-10">
            <i data-lucide="image" style="width:32px;height:32px;color:var(--sage)" class="mx-auto mb-2"></i>
            <p class="text-xs" style="color:var(--sage)">Nenhuma foto cadastrada ainda.</p>
            <label for="fa-foto-input" class="inline-block mt-3 text-xs font-bold px-3 py-2 rounded-lg" style="background:var(--sprout);color:#fff;cursor:pointer">+ Adicionar fotos</label>
        </div>
    </div>

    <input type="file" id="fa-foto-input" accept="image/*" multiple class="hidden">

    <p class="raiz-indicador-inline mt-3" id="fa-status"></p>
</section>

<!-- ===================== MODAL — CRIAR ITEM DE CONTROLE (bottom-sheet) ===================== -->
<div id="modal-criar-item-controle" class="modal-overlay hidden">
    <div class="modal-box p-5">
        <div class="flex items-start justify-between mb-3">
            <h3 class="text-base font-bold">Novo item de controle</h3>
            <button type="button" data-action="fechar-form-controle" style="background:#e2e8f0;border:none;border-radius:9999px;width:26px;height:26px;flex:none;">✕</button>
        </div>
        <div id="ic-modelos-sugeridos" class="hidden mb-3"></div>
        <div class="grid grid-cols-2 gap-2">
            <select id="ic-tipo" data-action-change="ic-tipo-mudou" class="border-2 border-slate-300 rounded-lg p-2 text-xs col-span-1">
                <option value="seguro">Seguro</option>
                <option value="manutencao">Manutenção</option>
                <option value="tributo">Tributo</option>
            </select>
            <select id="ic-subtipo" class="border-2 border-slate-300 rounded-lg p-2 text-xs col-span-1"></select>
            <input id="ic-titulo" placeholder="Título (ex.: Seguro patrimonial 2026)" class="border-2 border-slate-300 rounded-lg p-2 text-xs col-span-2">
            <div>
                <label class="text-xs font-semibold block mb-1" style="color:var(--sage)">Data início</label>
                <input type="date" id="ic-data-base" class="w-full border-2 border-slate-300 rounded-lg p-2 text-xs">
            </div>
            <div>
                <label class="text-xs font-semibold block mb-1" style="color:var(--sage)">Data fim <span style="font-weight:400">(opcional)</span></label>
                <input type="date" id="ic-data-fim" class="w-full border-2 border-slate-300 rounded-lg p-2 text-xs">
            </div>
            <div class="col-span-2">
                <label class="text-xs font-semibold block mb-1" style="color:var(--sage)">Gerar ocorrências a partir de</label>
                <select id="ic-direcao-alerta" class="w-full border-2 border-slate-300 rounded-lg p-2 text-xs">
                    <option value="inicio" selected>Início</option>
                    <option value="fim">Fim (retroativo)</option>
                </select>
            </div>
            <div>
                <label class="text-xs font-semibold block mb-1" style="color:var(--sage)">Repetir a cada</label>
                <input type="number" min="1" id="ic-freq-intervalo" placeholder="Ex.: 3" class="w-full border-2 border-slate-300 rounded-lg p-2 text-xs">
            </div>
            <div>
                <label class="text-xs font-semibold block mb-1" style="color:var(--sage)">Unidade</label>
                <select id="ic-freq-unidade" class="w-full border-2 border-slate-300 rounded-lg p-2 text-xs">
                    <option value="dia">Dia(s)</option>
                    <option value="semana">Semana(s)</option>
                    <option value="mes" selected>Mês(es)</option>
                    <option value="ano">Ano(s)</option>
                </select>
            </div>
            <div class="col-span-2">
                <label class="text-xs font-semibold block mb-1" style="color:var(--sage)">Avisar com quantos dias de antecedência</label>
                <input type="number" min="0" id="ic-antecedencia" value="7" class="w-full border-2 border-slate-300 rounded-lg p-2 text-xs">
            </div>
        </div>
        <p class="raiz-indicador-inline mt-2" style="color:var(--sage)">Deixe "Repetir a cada" em branco para um item não recorrente (evento único). Sem data fim = sem fim de vigência (só pode gerar a partir do início). Escolhendo "Fim (retroativo)", as ocorrências são contadas pra trás a partir da data fim, na frequência escolhida. Ao salvar, as ocorrências já são geradas automaticamente.</p>
        <div class="flex gap-2 mt-3">
            <button type="button" data-action="fechar-form-controle" style="flex:1;background:#f1f5f9;color:#475569;font-weight:bold;font-size:13px;padding:10px;border:none;border-radius:8px;">Fechar</button>
            <button data-action="salvar-item-controle" style="flex:1;background:var(--pine);color:#fff;font-weight:bold;font-size:13px;padding:10px;border:none;border-radius:8px;">Salvar item de controle</button>
        </div>
    </div>
</div>

<!-- ===================== MODAL — EDITAR ITEM DE CONTROLE (Tipo B, DS §9) =====================
     Revisão DS (25/08/2026) — era edição inline dentro do box "Dados do
     item" (fic-editar-wrapper, painel raiz-form-borda); convertido pra
     bottom-sheet Tipo B, mesmo padrão de "Novo item de controle" acima.
     Frequência exposta aqui (não existia no formulário antigo, só
     título/subtipo/antecedência) — necessário pra poder detectar se a
     mudança "impacta os alertas possíveis" e oferecer regenerar. -->
<div id="modal-editar-item-controle" class="modal-overlay hidden">
    <div class="modal-box p-5">
        <div class="flex items-start justify-between mb-3">
            <h3 class="text-base font-bold">Editar item de controle</h3>
            <button type="button" data-action="fechar-editar-item" style="background:#e2e8f0;border:none;border-radius:9999px;width:26px;height:26px;flex:none;">✕</button>
        </div>
        <div class="grid grid-cols-2 gap-2">
            <div>
                <label class="text-xs font-semibold block mb-1" style="color:var(--sage)">Tipo</label>
                <select id="fic-ed-tipo" data-action-change="fic-ed-tipo-mudou" class="w-full border-2 border-slate-300 rounded-lg p-2 text-xs">
                    <option value="seguro">Seguro</option>
                    <option value="manutencao">Manutenção</option>
                    <option value="tributo">Tributo</option>
                </select>
            </div>
            <div>
                <label class="text-xs font-semibold block mb-1" style="color:var(--sage)">Subtipo</label>
                <select id="fic-ed-subtipo" class="w-full border-2 border-slate-300 rounded-lg p-2 text-xs"></select>
            </div>
            <div class="col-span-2">
                <label class="text-xs font-semibold block mb-1" style="color:var(--sage)">Título</label>
                <input id="fic-ed-titulo" placeholder="Título" class="w-full border-2 border-slate-300 rounded-lg p-2 text-xs">
            </div>
            <div>
                <label class="text-xs font-semibold block mb-1" style="color:var(--sage)">Data início</label>
                <input type="date" id="fic-ed-data-inicio" class="w-full border-2 border-slate-300 rounded-lg p-2 text-xs">
            </div>
            <div>
                <label class="text-xs font-semibold block mb-1" style="color:var(--sage)">Data fim <span style="font-weight:400">(opcional)</span></label>
                <input type="date" id="fic-ed-data-fim" class="w-full border-2 border-slate-300 rounded-lg p-2 text-xs">
            </div>
            <div class="col-span-2">
                <label class="text-xs font-semibold block mb-1" style="color:var(--sage)">Gerar a partir de</label>
                <select id="fic-ed-direcao-alerta" class="w-full border-2 border-slate-300 rounded-lg p-2 text-xs">
                    <option value="inicio">Início</option>
                    <option value="fim">Fim (retroativo)</option>
                </select>
            </div>
            <div>
                <label class="text-xs font-semibold block mb-1" style="color:var(--sage)">Repetir a cada</label>
                <input type="number" min="1" id="fic-ed-freq-intervalo" placeholder="Ex.: 3" class="w-full border-2 border-slate-300 rounded-lg p-2 text-xs">
            </div>
            <div>
                <label class="text-xs font-semibold block mb-1" style="color:var(--sage)">Unidade</label>
                <select id="fic-ed-freq-unidade" class="w-full border-2 border-slate-300 rounded-lg p-2 text-xs">
                    <option value="dia">Dia(s)</option>
                    <option value="semana">Semana(s)</option>
                    <option value="mes">Mês(es)</option>
                    <option value="ano">Ano(s)</option>
                </select>
            </div>
            <div class="col-span-2">
                <label class="text-xs font-semibold block mb-1" style="color:var(--sage)">Avisar com quantos dias de antecedência</label>
                <input type="number" min="0" id="fic-ed-antecedencia" class="w-full border-2 border-slate-300 rounded-lg p-2 text-xs">
            </div>
        </div>
        <p class="raiz-indicador-inline mt-2" style="color:var(--sage)">Deixe "Repetir a cada" em branco para um item não recorrente. Mudar a data início, a data fim, a direção ou a frequência impacta os alertas — o Cofre pergunta se quer regerar as ocorrências futuras ou manter as que já existem.</p>
        <div class="flex gap-2 mt-3">
            <button type="button" data-action="fechar-editar-item" style="flex:1;background:#f1f5f9;color:#475569;font-weight:bold;font-size:13px;padding:10px;border:none;border-radius:8px;">Fechar</button>
            <button data-action="salvar-edicao-item" style="flex:1;background:var(--pine);color:#fff;font-weight:bold;font-size:13px;padding:10px;border:none;border-radius:8px;">Salvar</button>
        </div>
    </div>
</div>

<!-- ===================== MODAL — CONTATO DO ITEM DE CONTROLE =====================
     Pedido explícito, 25/08/2026 — bottom-sheet Tipo B (DS §9), mesmo
     gabarito do modal-editar-item-controle acima. Reaproveitado pra
     criar E editar (abrirNovoContatoItem()/abrirEditarContatoItem() só
     mudam o que preenchem antes de abrir) — substitui o formulário
     inline (raiz-form-borda) que existia antes. "Excluir" só aparece
     no modo editar (ct-ed-excluir-wrapper). -->
<div id="modal-editar-contato-item" class="modal-overlay hidden">
    <div class="modal-box p-5">
        <div class="flex items-start justify-between mb-3">
            <h3 id="modal-editar-contato-item-titulo" class="text-base font-bold">Novo contato</h3>
            <button type="button" data-action="fechar-editar-contato-item" style="background:#e2e8f0;border:none;border-radius:9999px;width:26px;height:26px;flex:none;">✕</button>
        </div>
        <div class="grid grid-cols-2 gap-2">
            <div>
                <label class="text-xs font-semibold block mb-1" style="color:var(--sage)">Papel <span style="color:var(--danger)">*</span></label>
                <select id="ct-ed-papel" class="w-full border-2 border-slate-300 rounded-lg p-2 text-xs">
                    <option value="seguradora">Seguradora</option>
                    <option value="corretor">Corretor(a) de seguro</option>
                    <option value="oficina">Oficina</option>
                    <option value="assistencia">Assistência técnica</option>
                    <option value="administradora">Administradora</option>
                    <option value="advogado">Advogado(a)</option>
                    <option value="outro">Outro</option>
                </select>
            </div>
            <div>
                <label class="text-xs font-semibold block mb-1" style="color:var(--sage)">Nome <span style="color:var(--danger)">*</span></label>
                <input id="ct-ed-nome" placeholder="Nome" class="w-full border-2 border-slate-300 rounded-lg p-2 text-xs">
            </div>
            <div class="col-span-2">
                <label class="text-xs font-semibold block mb-1" style="color:var(--sage)">Empresa <span style="font-weight:400">(opcional)</span></label>
                <input id="ct-ed-empresa" placeholder="Empresa" class="w-full border-2 border-slate-300 rounded-lg p-2 text-xs">
            </div>
            <div>
                <label class="text-xs font-semibold block mb-1" style="color:var(--sage)">Telefone <span style="font-weight:400">(opcional)</span></label>
                <input type="tel" id="ct-ed-telefone" placeholder="(11) 91234-5678" class="w-full border-2 border-slate-300 rounded-lg p-2 text-xs">
                <p id="ct-ed-telefone-indicador" class="raiz-indicador-inline text-[11px] mt-0.5 h-3"></p>
            </div>
            <div>
                <label class="text-xs font-semibold block mb-1" style="color:var(--sage)">WhatsApp <span style="font-weight:400">(opcional)</span></label>
                <input type="tel" id="ct-ed-whatsapp" placeholder="(11) 91234-5678" class="w-full border-2 border-slate-300 rounded-lg p-2 text-xs">
                <p id="ct-ed-whatsapp-indicador" class="raiz-indicador-inline text-[11px] mt-0.5 h-3"></p>
            </div>
            <div class="col-span-2">
                <label class="text-xs font-semibold block mb-1" style="color:var(--sage)">E-mail <span style="font-weight:400">(opcional)</span></label>
                <input type="email" id="ct-ed-email" placeholder="E-mail" class="w-full border-2 border-slate-300 rounded-lg p-2 text-xs">
                <p id="ct-ed-email-indicador" class="raiz-indicador-inline text-[11px] mt-0.5 h-3"></p>
            </div>
            <div class="col-span-2">
                <label class="text-xs font-semibold block mb-1" style="color:var(--sage)">Observação <span style="font-weight:400">(opcional)</span></label>
                <textarea id="ct-ed-observacao" placeholder="Observação" rows="2" class="w-full border-2 border-slate-300 rounded-lg p-2 text-xs"></textarea>
            </div>
        </div>
        <div id="ct-ed-excluir-wrapper" class="hidden mt-2 pt-2 border-t border-slate-100 flex justify-end">
            <button data-action="excluir-contato-item-modal" class="text-[11px] font-bold px-2.5 py-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300 flex items-center gap-1"><i data-lucide="trash-2" style="width:11px;height:11px"></i> Excluir contato</button>
        </div>
        <div class="flex gap-2 mt-3">
            <button type="button" data-action="fechar-editar-contato-item" style="flex:1;background:#f1f5f9;color:#475569;font-weight:bold;font-size:13px;padding:10px;border:none;border-radius:8px;">Fechar</button>
            <button data-action="salvar-contato-item-modal" style="flex:1;background:var(--pine);color:#fff;font-weight:bold;font-size:13px;padding:10px;border:none;border-radius:8px;">Salvar</button>
        </div>
    </div>
</div>

<!-- ===================== SOBRE / LICENÇA / PESSOAS / MINHA EMPRESA =====================
     MERGE (pedido explícito, 26/08/2026) — telas de administração do CLIENTE
     (empresa), não do módulo Cofre — por isso não têm HTML/lógica própria
     aqui: cada uma é só um mount-point vazio, populado por js/comum-*.js (o
     MESMO arquivo que index.html usa). Nenhuma duplica tela nenhuma. Botão
     "< Voltar" de cada uma segue o mesmo padrão já usado em
     data-screen="alertas" (ir-home).
     ⚠️ Depende de 4 arquivos ainda não recebidos nesta sessão de merge — ver
     aviso no início da resposta. Sem eles, estas 4 telas ficam vazias (o
     mount-point existe, mas nada é injetado dentro). ===================== -->
<section data-screen="sobre" class="hidden">
    <button data-action="ir-home" class="text-xs font-bold text-slate-600 flex items-center gap-1 mb-3"><i data-lucide="chevron-left" style="width:16px;height:16px"></i> Início</button>
    <div id="mount-sobre-cofre"></div>
</section>

<section data-screen="licenca" class="hidden">
    <button data-action="ir-home" class="text-xs font-bold text-slate-600 flex items-center gap-1 mb-3"><i data-lucide="chevron-left" style="width:16px;height:16px"></i> Início</button>
    <h2 class="text-lg font-bold mb-1" style="color:var(--ink)">Licença</h2>
    <div id="mount-licenca-cofre" class="mt-3"></div>
</section>

<section data-screen="pessoas" class="hidden">
    <button data-action="ir-home" class="text-xs font-bold text-slate-600 flex items-center gap-1 mb-3"><i data-lucide="chevron-left" style="width:16px;height:16px"></i> Início</button>
    <div id="mount-pessoas-cofre"></div>
</section>

<section data-screen="minha-empresa" class="hidden">
    <button data-action="ir-home" class="text-xs font-bold text-slate-600 flex items-center gap-1 mb-3"><i data-lucide="chevron-left" style="width:16px;height:16px"></i> Início</button>
    <h2 class="text-lg font-bold mb-1" style="color:var(--ink)">Minha Empresa</h2>
    <div id="mount-minha-empresa-cofre" class="mt-3"></div>
</section>

<!-- ===================== TELA — FICHA DO ITEM DE CONTROLE ===================== -->
<section data-screen="ficha-item-controle" class="hidden">

    <!-- Revisão DS (25/08/2026) — removido o título solto (nome do item +
         tipo/subtipo/frequência) que ficava aqui fora dos boxes; pedido
         explícito: "esta aba não deve ter título, apenas os boxes têm
         título". Vira "< Voltar" + descrição breve da FUNÇÃO da tela,
         mesmo padrão das demais telas secundárias do Cofre (ex.: tela
         Alertas, ver data-screen="alertas" acima). O nome/tipo/subtipo do
         item em si já aparece dentro do box "Dados do item" logo abaixo —
         nada foi perdido, só parou de aparecer 2x. -->
    <button data-action="voltar-item-controle" class="text-xs font-bold text-slate-600 flex items-center gap-1 mb-3"><i data-lucide="chevron-left" style="width:16px;height:16px"></i> Voltar ao ativo</button>
    <p class="text-xs mb-3" style="color:var(--sage)">Dados do item, ocorrências de vencimento e contatos vinculados.</p>

    <div class="space-y-3">

        <!-- Box: Dados do item — revisão DS 25/08/2026 (pedido explícito):
             cabeçalho no mesmo formato de letra/cor do componente de Ativo
             (fic-dados-cabecalho, montado via JS); Editar/Excluir migraram
             pra um painel "Mais ações" colapsável de verdade (§8), não
             mais pills sempre visíveis. -->
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <h3 class="font-bold text-sm" style="color:var(--pine)">Dados do item</h3>
            <div id="fic-dados-cabecalho" class="mt-2"></div>
            <div id="fic-dados-leitura" class="text-sm space-y-1 mt-3 pt-3 border-t border-slate-100"></div>
            <div class="flex justify-end mt-3 pt-3 border-t border-slate-100">
                <button data-action="alternar-mais-acoes-dados-item" class="text-xs font-bold text-slate-500 flex items-center gap-1">Mais ações <i data-lucide="chevron-down" id="fic-dados-seta" style="width:13px;height:13px"></i></button>
            </div>
            <div id="fic-dados-acoes" class="hidden mt-2 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5 justify-end">
                <button data-action="abrir-editar-item" class="text-[11px] font-bold px-2.5 py-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300 flex items-center gap-1"><i data-lucide="pencil" style="width:11px;height:11px"></i> Editar</button>
                <button data-action="excluir-item-controle-atual" class="text-[11px] font-bold px-2.5 py-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300 flex items-center gap-1"><i data-lucide="trash-2" style="width:11px;height:11px"></i> Excluir</button>
            </div>
        </div>

        <!-- Box: Documento — NOVO (25/08/2026, pedido explícito). Mesma
             referência de box de documento que existe nos Imóveis: linha
             clicável abre o documento (abrirFichaDocumento, caminho já
             existente), "x" remove só o vínculo (documento continua
             guardado, vira "Em triagem" na Home), "Carregar novo" mora no
             Mais ações. Box SEMPRE visível (mesma exceção §16 do box
             Contrato/Contatos vinculados — mesmo vazio, oferece a ação). -->
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <h3 class="font-bold text-sm" style="color:var(--pine)">Documento</h3>
            <div id="fic-documentos" class="mt-1.5 space-y-1.5"></div>
            <div class="flex justify-end mt-3 pt-3 border-t border-slate-100">
                <button data-action="alternar-mais-acoes-doc-item" class="text-xs font-bold text-slate-500 flex items-center gap-1">Mais ações <i data-lucide="chevron-down" id="fic-doc-seta" style="width:13px;height:13px"></i></button>
            </div>
            <div id="fic-doc-acoes" class="hidden mt-2 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5 justify-end">
                <button data-action="carregar-novo-documento-item" class="text-[11px] font-bold px-2.5 py-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300 flex items-center gap-1"><i data-lucide="upload" style="width:11px;height:11px"></i> Carregar novo</button>
            </div>
        </div>

        <!-- Box: Ocorrência -->
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <h3 class="font-bold text-sm" style="color:var(--pine)">Ocorrência</h3>
            <div id="fic-ocorrencia" class="mt-1.5"></div>
        </div>

        <!-- Box: Partes (NOVO, 02/09/2026, pedido explícito: "as partes
             devem ser vários chips e aparecer... em itens de controle
             (prestadores)... podendo ter mais de uma parte no item").
             Chips (não linhas de lista, de propósito — visual pedido),
             cada um "Nome · Papel". Editor abre modal-generico (mesmo
             mecanismo do chip Propriedade em Ativos), sem % (não é
             rateio, é lista de responsáveis). Diferente do box
             "Contatos vinculados" logo abaixo: Partes é o cadastro
             formal (pode virar fornecedor de despesa depois); Contatos
             é só "quem eu chamo no WhatsApp", mais leve, continua
             existindo em paralelo, não substituído. -->
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <h3 class="font-bold text-sm" style="color:var(--pine)">Partes</h3>
            <p class="text-[11px] mt-0.5" style="color:var(--sage)">Quem responde por este item — pode virar fornecedor de uma despesa depois.</p>
            <div id="fic-partes" class="mt-2 flex flex-wrap gap-1.5"></div>
            <div class="flex justify-end mt-3 pt-3 border-t border-slate-100">
                <button data-action="abrir-editar-partes-item" class="text-[11px] font-bold px-2.5 py-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300 flex items-center gap-1"><i data-lucide="users" style="width:11px;height:11px"></i> Editar partes</button>
            </div>
        </div>

        <!-- Box: Contatos vinculados — revisão DS: botão "+ Adicionar"
             virou pill de Mais ações (mesmo padrão do box Contrato vazio
             na Ficha do Imóvel, montarBoxSemContratoFicha), não mais um
             CTA tracejado centralizado. O box em si CONTINUA sempre
             visível mesmo sem contato (D-6, exceção documentada — DS
             §16) — só o botão interno mudou de formato. -->
        <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <h3 class="font-bold text-sm" style="color:var(--pine)">Contatos vinculados</h3>
            <div id="fic-contatos" class="mt-1.5"></div>
            <div class="flex justify-end mt-3 pt-3 border-t border-slate-100">
                <button data-action="alternar-mais-acoes-contatos-item" class="text-xs font-bold text-slate-500 flex items-center gap-1">Mais ações <i data-lucide="chevron-down" id="fic-contatos-seta" style="width:13px;height:13px"></i></button>
            </div>
            <div id="fic-contatos-acoes" class="hidden mt-2 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5 justify-end">
                <button data-action="abrir-novo-contato-item" class="text-[11px] font-bold px-2.5 py-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300 flex items-center gap-1"><i data-lucide="user-plus" style="width:11px;height:11px"></i> Adicionar contato</button>
            </div>
        </div>

    </div>
</section>

    </main>

    <nav class="bottom-nav">
        <div class="max-w-md mx-auto flex">
            <button class="nav-btn active" data-nav-item="home" data-action="ir-home"><i data-lucide="layout-dashboard" style="width:18px;height:18px"></i>Visão Geral</button>
            <button class="nav-btn" data-nav-item="ativos" data-action="ir-ativos" id="nav-item-ativos"><i data-lucide="boxes" style="width:18px;height:18px"></i>Ativos</button>
        </div>
    </nav>
</div>

<div id="modal-busca-global" class="modal-overlay hidden">
    <div class="modal-box p-5">
        <div class="flex items-start justify-between mb-3">
            <div><h3 class="text-base font-bold">Buscar no Cofre</h3><p class="text-xs" style="color:var(--sage)">Busca documental — ferramenta secundária; o caminho normal é pelo ativo/imóvel/contrato.</p></div>
            <button type="button" data-action="fechar-busca-global" class="text-slate-400 text-2xl leading-none px-2">&times;</button>
        </div>
        <input id="busca-global-input" type="text" placeholder="Nome, descrição, tag…" class="w-full p-3 rounded-xl border-2 border-slate-300 text-sm mb-3">
        <div class="flex gap-2 mb-3 text-xs">
            <select id="busca-global-status" class="w-full border-2 border-slate-300 rounded-xl p-2 text-xs" style="background:#f8fafc"><option value="">Status: todos</option><option value="triagem">Em triagem</option><option value="empresa">Geral da empresa</option><option value="vinculado">Vinculado</option></select>
        </div>
        <div id="busca-global-resultado" class="space-y-2"></div>
    </div>
</div>

<div id="modal-busca-ativos" class="modal-overlay hidden">
    <div class="modal-box p-3">
        <div class="p-3 border-b flex items-center justify-between flex-none" style="border-color:var(--line)">
            <span class="font-bold" style="color:var(--ink)">Buscar / Filtrar</span>
            <button data-action="fechar-busca-ativos" class="text-slate-400 text-2xl leading-none px-2">&times;</button>
        </div>
        <div class="p-3 space-y-3">
            <!-- v1.8.0 (pedido explícito, 01/09/2026: "ajustar o modal de
                 consultas para consultar nos campos chaves de ativo,
                 contrato e itens de controle. ajuste para filtrar por
                 status, por alerta") — o campo de texto agora casa com
                 nome do ativo, locatário do contrato principal e título
                 de item de controle vinculado (ver renderAtivosLista()).
                 2 dropdowns novos: Status (2 vocabulários — imóvel
                 Vago/Alugado/Assinando, ou ativo em geral ativo/vendido/
                 arquivado, sinalizados por optgroup) e Alerta (tem/não
                 tem ocorrência aberta vinculada). Aplicam ao vivo
                 (onchange), mesmo padrão do Overlay de Busca do resto
                 do app — sem botão "Aplicar". -->
            <input id="filtro-ativo-busca" type="text" placeholder="Buscar por nome, locatário ou item de controle…" class="w-full p-3 rounded-xl border-2 border-slate-300 text-sm">
            <select id="filtro-ativo-tipo" class="w-full p-3 rounded-xl border-2 border-slate-300 text-sm">
                <option value="">Todos os tipos</option>
                <option value="veiculo">Veículos</option>
                <option value="veiculo_blindado">Veículos blindados</option>
                <option value="imovel">Imóveis</option>
                <option value="terreno">Terrenos</option>
                <option value="vida_protecao">Vida / proteção</option>
                <option value="obra_arte">Obras de arte</option>
                <option value="outro">Outros</option>
            </select>
            <select id="filtro-ativo-status" class="w-full p-3 rounded-xl border-2 border-slate-300 text-sm">
                <option value="">Todos os status</option>
                <optgroup label="Imóveis">
                    <option value="prop:Vago">Vago</option>
                    <option value="prop:Alugado">Alugado</option>
                    <option value="prop:Assinando">Assinando</option>
                </optgroup>
                <optgroup label="Outros ativos">
                    <option value="ativo:ativo">Ativo</option>
                    <option value="ativo:vendido">Vendido</option>
                    <option value="ativo:arquivado">Arquivado</option>
                </optgroup>
            </select>
            <select id="filtro-ativo-alerta" class="w-full p-3 rounded-xl border-2 border-slate-300 text-sm">
                <option value="">Qualquer alerta</option>
                <option value="com">Só com alerta pendente</option>
                <option value="sem">Só sem alerta</option>
            </select>
            <button type="button" data-action="limpar-filtro-ativos" class="w-full text-xs font-bold text-slate-500 py-2">Limpar filtros</button>
        </div>
    </div>
</div>

<!-- v1.93.0 — modal-documentos-ativo REMOVIDO: conteúdo (botões de
     upload + #fa-tab-documentos) movido pra dentro da aba "Documentos"
     da ficha do ativo (data-screen="ficha-ativo" > #fa-painel-documentos),
     inline, batendo com o protótipo. abrir-documentos-ativo/fechar-
     documentos-ativo saíram do dispatcher (cofre-app.js) junto — nada
     mais referencia este modal. -->

<div id="modal-lightbox-fotos" class="hidden fixed inset-0 z-[300] bg-black flex items-center justify-center">
    <button data-action="fechar-lightbox-fotos" class="absolute top-4 right-4 text-white text-3xl leading-none z-10">&times;</button>
    <button data-action="navegar-lightbox-fotos" data-dir="-1" class="absolute left-2 text-white text-4xl leading-none p-2 z-10">‹</button>
    <img id="lightbox-fotos-img" class="max-h-[85vh] max-w-full object-contain">
    <button data-action="navegar-lightbox-fotos" data-dir="1" class="absolute right-2 text-white text-4xl leading-none p-2 z-10">›</button>
    <div id="lightbox-fotos-contador" class="absolute bottom-4 text-white text-xs font-bold"></div>
</div>

<div id="modal-upload" class="modal-overlay hidden">
    <div class="modal-box p-5">
        <div class="flex items-start justify-between mb-3">
            <div><h3 class="text-base font-bold">Novo documento</h3><p class="text-xs" style="color:var(--sage)" id="upload-contexto-legenda"></p></div>
            <button type="button" data-action="fechar-upload" style="background:#e2e8f0;border:none;border-radius:9999px;width:26px;height:26px;flex:none;">✕</button>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="sm:col-span-2">
                <label class="text-xs font-semibold block mb-1">Arquivo <span style="color:var(--danger)">*</span></label>
                <input type="file" id="up-arquivo" class="w-full text-sm border-2 border-slate-300 rounded-xl p-2" accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx">
                <p class="raiz-indicador-inline" id="up-arquivo-info"></p>
            </div>
            <div><label class="text-xs font-semibold block mb-1">Nome de exibição <span style="color:var(--danger)">*</span></label><input type="text" id="up-nome" class="w-full border-2 border-slate-300 rounded-xl p-2 text-sm"></div>
            <div><label class="text-xs font-semibold block mb-1">Categoria <span style="color:var(--danger)">*</span></label><select id="up-categoria" class="w-full border-2 border-slate-300 rounded-xl p-2 text-sm"></select></div>

            <div id="up-vinculo-bloco" class="sm:col-span-2">
                <label class="text-xs font-semibold block mb-1">Vincular a</label>
                <div id="up-vinculo-travado" class="hidden raiz-bloco-interno text-sm"></div>
                <div id="up-vinculo-livre">
                    <select id="up-vinculo-tipo" class="w-full border-2 border-slate-300 rounded-xl p-2 text-sm mb-2" data-action-change="upload-vinculo-tipo-mudou">
                        <option value="triagem">Ainda não sei — deixar em triagem</option>
                        <option value="empresa">Empresa (geral)</option>
                        <option value="ativo">Ativo controlado</option>
                        <option value="imovel">Imóvel</option>
                    </select>
                    <input id="up-vinculo-busca" type="text" class="hidden w-full border-2 border-slate-300 rounded-xl p-2 text-sm mb-1" placeholder="Digite para buscar…">
                    <div id="up-vinculo-candidatos" class="space-y-1"></div>
                </div>
            </div>

            <div><label class="text-xs font-semibold block mb-1">Data do documento</label><input type="date" id="up-data-documento" class="w-full border-2 border-slate-300 rounded-xl p-2 text-sm"></div>
            <div><label class="text-xs font-semibold block mb-1">Validade</label><input type="date" id="up-validade" class="w-full border-2 border-slate-300 rounded-xl p-2 text-sm"></div>
            <div class="sm:col-span-2"><label class="text-xs font-semibold block mb-1">Descrição</label><textarea id="up-descricao" rows="2" class="w-full border-2 border-slate-300 rounded-xl p-2 text-sm"></textarea></div>
            <div id="up-restrito-wrapper" class="hidden sm:col-span-2 flex items-center gap-2">
                <input type="checkbox" id="up-restrito" class="w-4 h-4"><label for="up-restrito" class="text-xs">Marcar como acesso restrito</label>
            </div>
        </div>
        <div class="flex justify-end gap-2 mt-4">
            <button data-action="salvar-upload" style="flex:1;background:var(--pine);color:#fff;font-weight:bold;font-size:13px;padding:10px;border:none;border-radius:8px;">Salvar documento</button>
            <button type="button" data-action="fechar-upload" style="flex:1;background:#f1f5f9;color:#475569;font-weight:bold;font-size:13px;padding:10px;border:none;border-radius:8px;">Fechar</button>
        </div>
        <p class="raiz-indicador-inline" id="up-status"></p>
    </div>
</div>

<div id="modal-ficha-doc" class="modal-overlay hidden">
    <div class="modal-box p-5">
        <div class="flex items-start justify-between mb-3">
            <div><h3 class="text-base font-bold pr-4" id="fd-nome">—</h3><p class="text-xs" style="color:var(--sage)" id="fd-contexto-label">—</p></div>
            <button type="button" data-action="fechar-ficha-doc" style="background:#e2e8f0;border:none;border-radius:9999px;width:26px;height:26px;flex:none;">✕</button>
        </div>
        <div id="fd-chips" class="flex flex-wrap gap-1 mb-3"></div>
        <div class="raiz-bloco-interno mb-3 text-sm space-y-1" id="fd-meta"></div>
        <div class="mb-3">
            <p class="text-xs font-semibold mb-1" style="color:var(--sage)">Vínculos</p>
            <div id="fd-vinculos" class="flex flex-wrap gap-1 mb-2"></div>
            <div id="fd-vincular-agora-wrapper" class="hidden">
                <div id="fd-vincular-agora-form" class="hidden mt-2 raiz-bloco-interno">
                    <select id="fd-va-tipo" class="w-full border-2 border-slate-300 rounded-lg p-2 text-xs mb-2" data-action-change="fd-vincular-tipo-mudou">
                        <option value="empresa">Empresa (geral)</option>
                        <option value="ativo">Ativo controlado</option>
                        <option value="imovel">Imóvel</option>
                    </select>
                    <input id="fd-va-busca" type="text" class="hidden w-full border-2 border-slate-300 rounded-lg p-2 text-xs mb-1" placeholder="Digite para buscar…">
                    <div id="fd-va-candidatos" class="space-y-1"></div>
                    <div class="flex justify-end gap-2 mt-2">
                        <button data-action="fechar-vincular-agora" class="px-3 py-1.5 rounded-lg text-xs border-2 border-slate-300">Cancelar</button>
                        <button data-action="confirmar-vincular-agora" class="px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style="background:var(--pine)">Vincular</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="grid grid-cols-2 gap-2">
            <button id="fd-btn-vincular" data-action="abrir-vincular-agora" class="hidden px-3 py-2 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1" style="background:var(--pine)"><i data-lucide="link" style="width:14px;height:14px"></i> Vincular</button>
            <button data-action="baixar-documento-atual" class="px-3 py-2 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1" style="background:var(--pine)"><i data-lucide="download" style="width:14px;height:14px"></i> Baixar</button>
            <button data-action="excluir-documento-atual" class="px-3 py-2 rounded-xl text-xs font-semibold border-2 border-slate-300 text-slate-600 flex items-center justify-center gap-1"><i data-lucide="trash-2" style="width:14px;height:14px"></i> Excluir</button>
        </div>
        <p class="raiz-indicador-inline" id="fd-status"></p>
    </div>
</div>

<div id="modal-sugestoes-ia" class="modal-overlay hidden">
    <div class="modal-box p-5">
        <div class="flex items-start justify-between mb-3">
            <div>
                <h3 class="text-base font-bold flex items-center gap-2"><i data-lucide="sparkles" style="width:16px;height:16px;color:var(--warning)"></i> Sugestões da IA</h3>
                <p class="text-xs" style="color:var(--sage)" id="sug-tipo-detectado">—</p>
            </div>
            <button type="button" data-action="ignorar-sugestoes-ia" style="background:#e2e8f0;border:none;border-radius:9999px;width:26px;height:26px;flex:none;">✕</button>
        </div>
        <p class="text-xs mb-3" style="color:var(--sage)">Nada aqui é aplicado sozinho — revise e confirme só o que fizer sentido.</p>

        <div id="sug-categoria-bloco" class="hidden raiz-bloco-interno mb-2">
            <label class="flex items-center gap-2 text-sm"><input type="checkbox" id="sug-aplicar-categoria" checked> Categoria sugerida: <b id="sug-categoria-nome"></b></label>
        </div>

        <div id="sug-vinculo-bloco" class="hidden mb-2">
            <p class="text-xs font-semibold mb-1" style="color:var(--sage)">Vincular a</p>
            <div id="sug-vinculo-opcoes" class="space-y-1"></div>
        </div>

        <div id="sug-alerta-bloco" class="hidden raiz-bloco-interno mb-2">
            <label class="flex items-center gap-2 text-sm"><input type="checkbox" id="sug-aplicar-alerta" checked> Criar alerta: <span id="sug-alerta-texto"></span></label>
        </div>

        <div id="sug-contato-bloco" class="hidden raiz-bloco-interno mb-3">
            <label class="flex items-center gap-2 text-sm"><input type="checkbox" id="sug-aplicar-contato" checked> Adicionar contato: <span id="sug-contato-texto"></span></label>
        </div>

        <div class="flex justify-end gap-2">
            <button type="button" data-action="ignorar-sugestoes-ia" style="flex:1;background:#f1f5f9;color:#475569;font-weight:bold;font-size:13px;padding:10px;border:none;border-radius:8px;">Deixar em triagem</button>
            <button data-action="aplicar-sugestoes-ia" style="flex:1;background:var(--pine);color:#fff;font-weight:bold;font-size:13px;padding:10px;border:none;border-radius:8px;">Aplicar selecionados</button>
        </div>
        <p class="raiz-indicador-inline" id="sug-status"></p>
    </div>
</div>

<div id="modal-criacao-assistida" class="modal-overlay hidden">
    <div class="modal-box p-5">
        <h3 class="text-base font-bold mb-2">Criar ativo para este imóvel?</h3>
        <p class="text-sm mb-3" style="color:var(--sage)" id="criacao-assistida-texto"></p>
        <div class="flex justify-end gap-2">
            <button data-action="fechar-criacao-assistida" class="px-4 py-2 rounded-xl text-sm border-2 border-slate-300">Agora não</button>
            <button data-action="confirmar-criacao-assistida" class="px-4 py-2 rounded-xl text-sm font-semibold text-white" style="background:var(--pine)">Criar ativo</button>
        </div>
    </div>
</div>

<div id="modal-menu-conta" class="modal-overlay hidden">
    <div class="w-full max-w-md rounded-t-2xl shadow-2xl overflow-hidden" style="background:var(--paper); max-height:85vh; display:flex; flex-direction:column;">
        <div class="px-5 pt-5 pb-3 flex items-center justify-between border-b flex-none" style="border-color:var(--line)">
            <h3 class="font-bold" style="font-family:'Bricolage Grotesque',sans-serif;color:var(--ink)">Configurações</h3>
            <button type="button" data-action="fechar-menu-conta" class="text-slate-400 hover:text-white font-bold text-sm bg-emerald-900 w-7 h-7 rounded-full flex items-center justify-center transition active:scale-90">✕</button>
        </div>
        <div class="p-4 space-y-1 overflow-y-auto" style="padding-bottom:calc(24px + env(safe-area-inset-bottom))">
            <!-- Reorganização (pedido explícito, 25/08/2026) — só 2 grupos:
                 "Cofre" (config nativa do módulo, incluindo Prestadores de
                 Serviço — antes "Em breve", agora linka pro App porque a
                 tabela \`prestadores\` já é compartilhada, cofre_itens_controle.
                 prestador_escopo_id referencia ela) e "Conta" (5 itens que
                 são CÓPIAS das telas do App — Pessoas/Minha Empresa/Imóveis/
                 Licença/Sobre — nunca duplicadas aqui, sempre deep-link via
                 ?ir=tab-X pro index.html, mesmo padrão já usado por
                 abrirCofreDocumentos() no sentido contrário). "Módulo
                 Imóveis" (antes item avulso no topo) e "Sobre" (antes modal
                 próprio do Cofre, modal-sobre-cofre) foram absorvidos pelo
                 grupo Conta — modal-sobre-cofre continua no arquivo (não
                 apagado) mas não tem mais nenhum link pra ele. -->
            <p class="text-[10px] font-bold uppercase tracking-wide px-2 pt-1 pb-0.5" style="color:var(--sage)">Cofre</p>
            <button data-action="menu-conta-em-breve" data-rotulo="Prestadores de Serviço" class="w-full flex items-center gap-3 px-2 py-3 rounded-lg active:bg-gray-100 transition text-left">
                <i data-lucide="wrench" style="width:18px;height:18px;color:var(--pine)"></i>
                <span class="text-sm font-medium flex-1" style="color:var(--ink)">Prestadores de Serviço</span>
                <span class="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-none" style="background:var(--line);color:var(--sage)">Em breve</span>
            </button>
            <button data-action="abrir-configuracoes-catalogo" class="w-full flex items-center gap-3 px-2 py-3 rounded-lg active:bg-gray-100 transition text-left">
                <i data-lucide="tags" style="width:18px;height:18px;color:var(--pine)"></i>
                <span class="text-sm font-medium" style="color:var(--ink)">Categoria de Documento</span>
            </button>
            <button data-action="abrir-subtipos-controle" class="w-full flex items-center gap-3 px-2 py-3 rounded-lg active:bg-gray-100 transition text-left">
                <i data-lucide="list-tree" style="width:18px;height:18px;color:var(--pine)"></i>
                <span class="text-sm font-medium" style="color:var(--ink)">Sub-tipos de item de controle</span>
            </button>
            <button data-action="abrir-modelos-controle" class="w-full flex items-center gap-3 px-2 py-3 rounded-lg active:bg-gray-100 transition text-left">
                <i data-lucide="clipboard-list" style="width:18px;height:18px;color:var(--pine)"></i>
                <span class="text-sm font-medium" style="color:var(--ink)">Modelos de item de controle</span>
            </button>

            <p class="text-[10px] font-bold uppercase tracking-wide px-2 pt-3 pb-0.5" style="color:var(--sage)">Conta</p>
            <!-- MERGE (pedido explícito, 26/08/2026) — Pessoas/Minha
                 Empresa/Licença/Sobre deixam de ser "Em breve"/modal
                 próprio: agora montam js/comum-pessoas.js,
                 comum-minha-empresa.js, comum-licenca.js e
                 comum-sobre.js (mesmos arquivos que index.html usa)
                 direto dentro do Cofre — telas de administração do
                 CLIENTE, não do módulo, fazem sentido nos 2 lugares sem
                 duplicar HTML/lógica. Ver cofre-app.js. "Imóveis"
                 continua indo pro App (voltar-app) — não é uma tela de
                 administração, é o módulo principal em si.
                 ⚠️ Depende de 4 arquivos ainda não recebidos nesta
                 sessão de merge — ver aviso no início da resposta. -->
            <button data-action="ir-pessoas" class="w-full flex items-center gap-3 px-2 py-3 rounded-lg active:bg-gray-100 transition text-left">
                <i data-lucide="users" style="width:18px;height:18px;color:var(--pine)"></i>
                <span class="text-sm font-medium flex-1" style="color:var(--ink)">Pessoas</span>
            </button>
            <button data-action="ir-minha-empresa" class="w-full flex items-center gap-3 px-2 py-3 rounded-lg active:bg-gray-100 transition text-left">
                <i data-lucide="building" style="width:18px;height:18px;color:var(--pine)"></i>
                <span class="text-sm font-medium flex-1" style="color:var(--ink)">Minha Empresa</span>
            </button>
            <button data-action="voltar-app" class="w-full flex items-center gap-3 px-2 py-3 rounded-lg active:bg-gray-100 transition text-left">
                <i data-lucide="home" style="width:18px;height:18px;color:var(--pine)"></i>
                <span class="text-sm font-medium" style="color:var(--ink)">Imóvel</span>
            </button>
            <button data-action="ir-licenca" class="w-full flex items-center gap-3 px-2 py-3 rounded-lg active:bg-gray-100 transition text-left">
                <i data-lucide="badge-check" style="width:18px;height:18px;color:var(--pine)"></i>
                <span class="text-sm font-medium flex-1" style="color:var(--ink)">Licença</span>
            </button>
            <a href="https://wa.me/5511947461828" target="_blank" class="w-full flex items-center gap-3 px-2 py-3 rounded-lg active:bg-gray-100 transition text-left">
                <i data-lucide="message-circle" style="width:18px;height:18px;color:var(--pine)"></i>
                <span class="text-sm font-medium" style="color:var(--ink)">Suporte (WhatsApp)</span>
            </a>
            <button data-action="ir-sobre" class="w-full flex items-center gap-3 px-2 py-3 rounded-lg active:bg-gray-100 transition text-left">
                <i data-lucide="info" style="width:18px;height:18px;color:var(--pine)"></i>
                <span class="text-sm font-medium" style="color:var(--ink)">Sobre</span>
            </button>
        </div>
    </div>
</div>

<div id="modal-sobre-cofre" class="modal-overlay hidden">
    <div class="modal-box p-5">
        <div class="flex items-start justify-between mb-3">
            <h3 class="text-base font-bold">Sobre</h3>
            <button type="button" data-action="fechar-sobre-cofre" style="background:#e2e8f0;border:none;border-radius:9999px;width:26px;height:26px;flex:none;">✕</button>
        </div>
        <div class="text-sm space-y-2">
            <div class="flex justify-between border-b pb-1"><span style="color:var(--sage)">Módulo Cofre</span><b id="sobre-versao-cofre">—</b></div>
            <!-- C-0b (revisão DS) — cofre.html e index.html são 2 arquivos
                 estáticos independentes, sem fonte de versão compartilhada;
                 esta linha precisa ser atualizada manualmente a cada bump
                 do App (id adicionado só pra facilitar grep/busca na hora
                 do deploy — ver checklist em DEPLOY_RAIZ_PATRIMONIO.md). -->
            <div class="flex justify-between border-b pb-1"><span style="color:var(--sage)">App Raiz Patrimônio</span><b id="sobre-versao-app-principal">Beta v1.62.5</b></div>
        </div>
    </div>
</div>

<div id="modal-categorias" class="modal-overlay hidden">
    <div class="modal-box p-5">
        <div class="flex items-start justify-between mb-3">
            <h3 class="text-base font-bold">Categorias de documento</h3>
            <button type="button" data-action="fechar-categorias" style="background:#e2e8f0;border:none;border-radius:9999px;width:26px;height:26px;flex:none;">✕</button>
        </div>
        <div class="flex gap-2 items-end mb-3">
            <div class="flex-1"><label class="text-xs font-semibold block mb-1">Nome</label><input type="text" id="cat-nome" class="w-full border-2 border-slate-300 rounded-xl p-2 text-sm"></div>
            <div class="flex-1"><label class="text-xs font-semibold block mb-1">Grupo</label><input type="text" id="cat-grupo" class="w-full border-2 border-slate-300 rounded-xl p-2 text-sm"></div>
            <button data-action="salvar-categoria" class="px-4 py-2 rounded-xl text-sm font-semibold text-white h-[38px]" style="background:var(--pine)">Adicionar</button>
        </div>
        <div id="categorias-lista" class="space-y-1"></div>
    </div>
</div>

<div id="modal-subtipos-controle" class="modal-overlay hidden">
    <div class="modal-box p-5">
        <div class="flex items-start justify-between mb-3">
            <h3 class="text-base font-bold">Subtipos de item de controle</h3>
            <button type="button" data-action="fechar-subtipos-controle" style="background:#e2e8f0;border:none;border-radius:9999px;width:26px;height:26px;flex:none;">✕</button>
        </div>
        <div class="flex gap-2 items-end mb-3">
            <div>
                <label class="text-xs font-semibold block mb-1">Tipo</label>
                <select id="subtipo-tipo" class="border-2 border-slate-300 rounded-xl p-2 text-sm h-[38px]">
                    <option value="seguro">Seguro</option>
                    <option value="manutencao">Manutenção</option>
                    <option value="tributo">Tributo</option>
                </select>
            </div>
            <div class="flex-1"><label class="text-xs font-semibold block mb-1">Nome</label><input type="text" id="subtipo-nome" placeholder="Ex.: Seguro contra incêndio" class="w-full border-2 border-slate-300 rounded-xl p-2 text-sm"></div>
            <button id="subtipo-btn-salvar" data-action="salvar-subtipo-controle" class="px-4 py-2 rounded-xl text-sm font-semibold text-white h-[38px]" style="background:var(--pine)">Adicionar</button>
            <button id="subtipo-btn-cancelar" data-action="cancelar-edicao-subtipo" class="hidden px-4 py-2 rounded-xl text-sm font-semibold h-[38px]" style="background:#f1f5f9;color:#475569;">Cancelar</button>
        </div>
        <!-- NOVO (29/08/2026) — pedido explícito do Nicola: sinalizar por
             CATEGORIA (não por item individual) se um documento anexo é
             esperado. Alimenta a varredura proativa solicitar.anexo_apolice
             (fn_diario_cofre_documento_pendente) — item ativo desse subtipo
             sem nenhum documento vinculado entra no alerta. -->
        <div class="flex items-start gap-2 mb-3">
            <input type="checkbox" id="subtipo-documento-esperado" class="w-4 h-4 mt-0.5">
            <label for="subtipo-documento-esperado" class="text-xs" style="color:var(--sage)">Documento anexo esperado (ex.: apólice) — item deste subtipo sem nenhum documento vinculado entra no aviso automático de "documento pendente".</label>
        </div>
        <p class="raiz-indicador-inline mb-2" style="color:var(--sage)">Some pra escolher toda vez que criar um item de controle desse tipo — em "Novo item de controle" e ao editar.</p>
        <div id="subtipos-lista"></div>
    </div>
</div>

<div id="modal-modelos-controle" class="modal-overlay hidden">
    <div class="modal-box p-5">
        <div class="flex items-start justify-between mb-3">
            <h3 class="text-base font-bold">Modelos de item de controle</h3>
            <button type="button" data-action="fechar-modelos-controle" style="background:#e2e8f0;border:none;border-radius:9999px;width:26px;height:26px;flex:none;">✕</button>
        </div>
        <div class="grid grid-cols-2 gap-2 mb-2">
            <select id="modelo-tipo-ativo" class="border-2 border-slate-300 rounded-lg p-2 text-xs col-span-1"></select>
            <select id="modelo-tipo" data-action-change="modelo-tipo-mudou" class="border-2 border-slate-300 rounded-lg p-2 text-xs col-span-1">
                <option value="seguro">Seguro</option>
                <option value="manutencao">Manutenção</option>
                <option value="tributo">Tributo</option>
            </select>
            <select id="modelo-subtipo" class="border-2 border-slate-300 rounded-lg p-2 text-xs col-span-2"></select>
            <input id="modelo-titulo" placeholder="Título sugerido (ex.: Seguro veicular)" class="border-2 border-slate-300 rounded-lg p-2 text-xs col-span-2">
            <div>
                <label class="text-xs font-semibold block mb-1" style="color:var(--sage)">Repetir a cada</label>
                <input type="number" min="1" id="modelo-freq-intervalo" placeholder="Ex.: 1" class="w-full border-2 border-slate-300 rounded-lg p-2 text-xs">
            </div>
            <select id="modelo-freq-unidade" class="border-2 border-slate-300 rounded-lg p-2 text-xs self-end">
                <option value="dia">Dia(s)</option>
                <option value="semana">Semana(s)</option>
                <option value="mes">Mês(es)</option>
                <option value="ano" selected>Ano(s)</option>
            </select>
            <div class="col-span-2">
                <label class="text-xs font-semibold block mb-1" style="color:var(--sage)">Antecedência do alerta (dias) — sugestão</label>
                <input type="number" min="0" id="modelo-antecedencia" value="30" class="w-full border-2 border-slate-300 rounded-lg p-2 text-xs">
            </div>
        </div>
        <div class="flex gap-2 mb-2">
            <button id="modelo-btn-salvar" data-action="salvar-modelo-controle" class="flex-1 px-4 py-2 rounded-xl text-sm font-semibold text-white" style="background:var(--pine)">Adicionar modelo</button>
            <button id="modelo-btn-cancelar" data-action="cancelar-edicao-modelo" class="hidden px-4 py-2 rounded-xl text-sm font-semibold" style="background:#f1f5f9;color:#475569;">Cancelar</button>
        </div>
        <p class="raiz-indicador-inline mb-2" style="color:var(--sage)">Deixe "Repetir a cada" em branco pra um modelo de evento único. Modelos aparecem como atalho "Usar modelo" ao criar um item de controle nesse tipo de ativo.</p>
        <div id="modelos-lista"></div>
    </div>
</div>

<div id="toast" class="hidden fixed bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl text-white text-sm font-semibold z-[500]" style="background:var(--pine)"></div>`;
