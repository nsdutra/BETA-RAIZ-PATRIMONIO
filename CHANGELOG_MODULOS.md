# Changelog — módulos do Raiz Patrimônio (`js/`)

Histórico completo de versões dos módulos, movido automaticamente pelo `gerar_versoes.py` (regra VER-05): o cabeçalho de cada módulo mantém só as 5 versões mais recentes; na entrega, as mais antigas rolam pra cá (mais recente primeiro, uma seção por arquivo). Não editar à mão — escreva o changelog no header do módulo, como sempre.

---

## `js/ativos/ativos-markup.js`

//
// v1.39.0 — pedido explícito: "toda caixa de ativo deve ter a mesma
// altura padrão" — .card-ativo ganhou min-height (ver comentário junto
// da regra, mais abaixo no <style>). Acompanha cofre-ativos.js v1.45.0
// (reordenação de linhas do card + ícone centralizado).
//
// v1.38.0 — pedido explícito/achado em teste real: #ativos-chips-tipo usava
// "flex flex-wrap" (Tailwind cru, gramática legada) e quebrava a fileira de
// chips (Todos/Imóveis/Veículos/Outros) pra 2ª linha; trocado pra .rz-chips
// (padrão único de chip do app, 1 linha com scroll horizontal).
//
// v1.37.0 — contador que faltava no chip Financeiro (acompanha
// cofre-ativos.js v1.42.0).
//
// v1.35.0 — Onda 12, E15.2.1 ("criar imóvel novo" no formulário
// unificado, item 2.1 do handoff). Botão "+ Cadastrar novo imóvel"
// (cadastrar-imovel-app → wizard antigo, imoveis.js) removido do markup
// — vira a 3ª opção do próprio seletor #at-origem-imovel
// ('__novo__', ver cofre-ativos.js v1.38.0). Texto de ajuda ajustado pra
// explicar os 2 caminhos (vincular existente × cadastrar novo).
//
// v1.34.0 — feedback do teste real (16/09/2026): #at-empreendimento-
// valor-wrapper novo, posicionado logo depois de #at-tipo-detalhe-
// wrapper (antes do bloco de campos específicos) — empreendimento saiu
// do #at-imovel-wrapper, é universal agora. #at-endereco-wrapper e
// #at-imovel-wrapper com espaçamento mais compacto (gap-3 → gap-2/sem
// grid próprio, o de dentro já define).
//
// v1.33.0 — PLANO_IMPLEMENTACAO v1.0, etapa E15.2 ("A2"). #at-imovel-
// wrapper novo, ao lado do #at-endereco-wrapper — campos da Fase 1/2
// (empreendimento, valor de referência, área, finalidade/situação de
// uso, observação), mesmo escopo (só imóvel avulso).
//
// v1.32.0 — PLANO_IMPLEMENTACAO v1.0, etapa E14.4 ("A5"). modal-editar-
// contato-item e o card "Contatos" da ficha do item removidos —
// unificado com o card "Partes" (ganhou o mesmo atalho de WhatsApp).
//
// v1.31.0 — PLANO_IMPLEMENTACAO v1.0, etapa E14.2 ("A16"), Onda 12.
// #ic-parcelas-wrapper novo (Parcelas/Dias entre parcelas escondem
// quando "Repetir a cada" está preenchido — cofre-controles.js v1.24.0).
//
// v1.30.0 — PLANO_IMPLEMENTACAO v1.0, etapa E14.1 ("A4"), Onda 12.
// Checkbox "Gerar também as ocorrências passadas" no form de criar item
// de controle (cofre-controles.js v1.23.0 lê o valor).
//
// v1.29.0 — duas mudanças acumuladas nesta sessão, ambas no form de
// ativo: (1) #at-endereco-wrapper (E6.2, bloco de endereço estruturado
// pro imóvel avulso) — inserido mais cedo na sessão sem bump de versão
// aqui, corrigindo agora (achado ao voltar neste arquivo pra E5 — regra
// é toda entrega evoluir versão em todo arquivo tocado, sem exceção).
// (2) #at-tipo-detalhe-wrapper (E5, Onda 6, decisão do Nicola "pode
// evoluir") — 2º seletor, tipo específico dentro da categoria; e
// filtro-ativo-tipo (modal Buscar/Filtrar) trocou os 8 valores
// específicos antigos pelas 8 categorias macro (E4.1) — sem isto o
// filtro "Veículos blindados"/"Vida / proteção" voltaria zero depois da
// E4.2 fatia B, mesmo problema que GRUPOS_CHIP_TIPO teve e já foi
// corrigido em cofre-ativos.js v1.32.1.
//
// v1.28.0 — PLANO_IMPLEMENTACAO v1.0, etapa E1: os seletores de tipo de item
// de controle (ic-tipo) e de subtipo (subtipo-tipo) ganham "Taxa" e
// "Documento". A migration catalogo_alertas_subtipos_v1 criou o tipo `taxa`
// e moveu Condomínio e Marina/guarda para ele — sem estas duas opções, um
// subtipo em uso (Condomínio, 2 itens) sumiria da tela. `documento` já
// existia no CHECK do banco e nunca tinha aparecido aqui.
//
// v1.27.0 — Documentos arquivados: entrada nova no menu Conta › Cofre
// ("Documentos arquivados") e modal-documentos-arquivados (mesmo molde de
// modal-categorias/modal-subtipos-controle) — cofre-documentos.js 2.11.0
// cuida do conteúdo.
//
// v1.26.0 — A.10: bloco "Controlar vencimento" do upload com IA ganha Valor
// previsto · Parcelas · Dias entre parcelas (uc-ctl-*), sugeridos a partir do
// que a IA já extraiu (cofre-documentos.js aplicarSubtipoUpload) — editáveis
// antes de salvar, igual aos demais campos do documento.
//
// v1.25.0 — A.10: formulários de item de controle (novo e editar) ganham
// "Valor previsto (R$) · Parcelas · Dias entre parcelas" (ic-*/fic-ed-*).
// Com valor, cada ocorrência prevista nasce com despesa prevista no
// Financeiro (trigger do banco); parcelas>1 = "IPVA em 3×". Sem valor = só
// lembrete, como sempre.
//
// v1.24.0 — o seletor de tipo + botão Reler estouravam a largura do sheet
// (print do Nicola: conteúdo cortado nas laterais). min-w-0 no flex e no
// select; o sheet ganha overflow-x hidden.
//
// v1.23.0 — criar ativo a partir do documento: botão #uc-criar-ativo-btn e
// bloco #uc-novo-ativo-bloco (tipo sugerido + nome editável) no
// #modal-confirmar-upload, logo abaixo do vínculo.
//
// v1.22.0 (Motor Documental fase 3) — #modal-confirmar-upload ganha: select
// "Tipo de documento" (catálogo global; no caminho sem IA é ele que manda,
// com IA vem preenchido e "Reler como este tipo" reclassifica), bloco
// #uc-avisos (vencido, titular divergente, validações que falharam, campos
// "confira"), bloco #uc-dados-bloco com os campos estruturados do tipo
// (editáveis, com evidência), e UM só "Vence em" (#uc-validade) — o campo de
// vencimento do controle vira espelho (escondido). Chip "calculada — confira"
// quando o vencimento foi derivado por regra.
//
// v1.21.0 (A.12/A.13 — PROPOSTA_UPLOAD_INTELIGENTE_CATEGORIAS v1.0 §5):
// #modal-upload virou caixa mínima (Câmera · Arquivo · toggle "Ler com IA");
// NOVO #modal-confirmar-upload — tela única com tudo que a IA leu (tipo,
// resumo, nome, categoria › subcategoria, datas, vigência, vínculo com
// candidatos reais, contatos, "Manter arquivo", "Controlar vencimento" com
// o bloco do item de controle). #modal-sugestoes-ia SAIU (o pós-upload
// deixou de existir — a confirmação acontece antes de salvar). Ficha do
// documento: botão Baixar ganhou id fd-btn-baixar (some quando o arquivo
// não foi mantido).
//
// Versão anterior: 1.20.0 · 04/09/2026
//
// v1.20.0 (fatia 7) — cabeçalho da lista de Ativos com 2 ícones no
// catálogo (.rz-ico-btn): Buscar + "+" que abre sheet. Vitrine e Upload
// saíram da barra e foram pro sheet.
//
// v1.19.0 — Nicola (19h): rodapés de card SAEM; toda ação vive no ⋮ do
// cabeçalho ou no toque da linha (REGRAS §6 v3.11). ⋮ novo em
// Propriedade, Movimentações, Anexos/Fotos, Documentos e Contatos do item.
// Ficha do documento ganha "Categorizar".
//
// v1.18.0 — "Mais ações" vira ⋮ (.rz-more) no CABEÇALHO do card em todos
// os cards (REGRAS §6 v3.10); rodapé fica só com a ação nomeada — cards
// mais baixos. Chip "Arquivos" → "Anexos" com chips por categoria
// (#fa-anexos-chips) no lugar do segmento Documentos·Fotos; IA + Upload
// sempre no rodapé.
//
// v1.17.0 — FATIA 3b-i: section ficha-item-controle refeita na gramática
// única (ver comentário na própria section). IDs de montagem mantidos
// (fic-dados-cabecalho, fic-dados-leitura, fic-ocorrencia, fic-partes,
// fic-documentos, fic-contatos); novo fic-ocorrencia-status.
//
// v1.16.0 — FATIA 3 da gramática única (REGRAS_EXPERIENCIA_RAIZ_v3_2 §6,
// §9, §11; catálogo rz-* do index.html v1.106.0). Ficha do ativo:
//   - 7 abas (flex-wrap, 2 linhas) → 5 chips em 1 linha com rolagem
//     (.rz-chips): Resumo · Contratos · Controles · Financeiro · Arquivos.
//     Resumo = Dados + Propriedade; Arquivos = Documentos + Fotos com
//     segmento .rz-seg. Contadores .rz-n nos chips, preenchidos pelos
//     montar*() (cofre-ativos.js v1.17.0 / cofre-controles.js v1.13.0).
//   - Todo card virou .rz-card com rodapé único: 1 ação nomeada (.rz-btn-2)
//     à esquerda + "Mais ações" (.rz-more) à direita, que agora abre um
//     SHEET (abrirSheetAcoes) — os 3 painéis inline #fa-mais-acoes,
//     #fa-mais-acoes-controles e #fa-fotos-acoes SAÍRAM do markup.
//   - Vazios de Documentos e Fotos no formato único .rz-empty; em
//     Documentos a IA é o botão primário (.rz-btn-ia) e "Upload simples"
//     é terciário — as 2 caixas tracejadas saíram.
//   - Cabeçalho da ficha usa .rz-entity (ícone 52 · título 18 · contexto ·
//     status à direita); "Voltar" usa .rz-back.
//   - "Editar →" (link em texto) saiu: o botão "Editar dados" do rodapé
//     do card Dados leva pro formulário do imóvel quando o ativo é imóvel
//     vinculado (data-action decidido em montarDadosAtivo()).
//   IDs mantidos (fa-dados-imovel-grid, fa-resumo-dados, fa-editar-*,
//   fa-contratos-lista, fa-tab-controles, fa-financeiro-*, fa-propriedade-
//   lista, fa-tab-documentos, fa-box-fotos, fa-fotos-grid, fa-fotos-vazio,
//   fa-foto-input) pra que o JS que já preenchia continue preenchendo.
//   Painel 'dados' virou 'resumo' e 'propriedade'/'documentos'/'fotos'
//   deixaram de ser painéis (vivem dentro de resumo/arquivos).
//
// v1.15.0 — botão "Gerar despesa" novo na box Partes do item de
// controle (ver changelog completo em cofre-controles.js v1.12.0).
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
// #modal-upload, #modal-confirmar-upload, #modal-ficha-doc,
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

---

## `js/cofre-api.js`

//
// v1.44.0 (demanda be42b19f, "componente único de Parte") — buscarParte()/
// atualizarParte() novas: BUG REAL achado por mim revisando o pedido do
// Nicola — abrirFichaParte()/abrirEditarParte() (cofre-controles.js,
// 18/09/2026) já chamavam api.buscarParte()/api.atualizarParte(), mas
// essas 2 funções nunca tinham sido escritas neste arquivo (teriam
// estourado "is not a function" assim que o clique chegasse até elas —
// corrigido junto com o despachante, cofre-app.js v1.35.0, antes de
// entregar).
//
// v1.43.0 (Entrega R.4, PLANO_IMPLEMENTACAO_RESULTADOS_MERCADO_FISCAL v2.0.0
// / ESP v1.3.0 §8.1) — 2 funções novas pro card "Revisão anual de valor" da
// ficha do ativo (cofre-ativos.js v1.58.0): buscarSugestaoRevisaoValor()
// (fn_revisao_valor_sugerir, LEITURA — resolve sozinha a ocorrência aberto
// do ativo quando existe, devolve null quando não há revisão em andamento,
// e o card some) e aplicarRevisaoValor() (fn_revisao_valor_aplicar,
// ESCREVE — grava valor_referencia + valor_revisado_em e dá baixa na
// ocorrência; nunca chamada sozinha pelo card, sempre uma decisão explícita
// do usuário — sugestão aceita, editada ou "manter o valor", RV5).
// migration revisao_valor_funcoes_v1.
//
// v1.42.0 (Entrega A.7, PLANO_IMPLEMENTACAO_RESULTADOS_MERCADO_FISCAL
// v2.0.0 / ESP v1.3.0 §8) — 2 funções novas pro chip "Performance" da
// ficha do ativo (renomeado de "Financeiro" em cofre-ativos.js/ativos-
// markup.js): buscarPerformanceAtivo() (fn_performance_ativo, já existia
// desde A.1 — só não tinha wrapper aqui) e buscarResultadoMensalAtivo()
// (fn_resultado_mensal com p_nivel='ativo', mesma função que resultados.js
// já usa pra carteira/empreendimento). buscarFluxoFinanceiroAtivo() segue
// existindo (nada a ver com Performance) — nenhuma outra tela usa, mas
// não foi removida por não ser desta entrega.
//
// v1.41.0 (Fase R / Entrega R.3, 20/09/2026) — iniciarRevisaoValorAtivo(),
// nova: wrapper de fn_revisao_valor_ativo_iniciar (migration revisao_valor_
// ativo_iniciar_v1). Esqueleto sem IA — cria o item de controle anual do
// ativo a partir da data de última revisão informada pelo usuário; a
// sugestão da IA (R.4) fica pra depois de B1.1 (indicador_valores ainda
// não existe).
//
// v1.40.0 — NOVO (Entrega 0.1 da frente Resultados/Mercado/Fiscal,
// PLANO_IMPLEMENTACAO_RESULTADOS_MERCADO_FISCAL v2.0.0) —
// criarImovelEAtivo() passa a gravar `cib` (coluna nova em cofre_ativos,
// migration fiscal_cofre_ativos_cib_v1) já na criação do ativo; a edição
// (atualizarAtivo, passthrough de patch) não precisou de mudança.
//
// v1.39.0 — demanda 0b2fd53a (3º consumidor do padrão antigo, achado em
// QUA-01 na correção de cofre-documentos.js v2.16.0): listarSubtiposControle()
// filtrava por tipo_ativo_aplicavel (campo quase sempre vazio, .or() que na
// prática não filtrava nada) quando chamada com `tipoAtivo` — usado pelo
// seletor de subtipo do form "Novo item de controle" (cofre-controles.js::
// abrirFormControle()). Trocado por cofre_subtipo_aplicabilidade (mesma
// fonte de listarAplicabilidadeSubtipos() logo abaixo), com a MESMA regra
// de cofre-documentos.js: só entra se houver vínculo explícito subtipo ×
// tipo de ativo. Confirmado no banco que os 10 subtipos sem vínculo nenhum
// são todos titular_escopo=empresa/contrato — não regridem.
//
// v1.38.0 — listarAplicabilidadeSubtipos() nova (cofre_subtipo_aplicabilidade,
// só linhas ativas): fonte real de aplicabilidade por tipo de ativo, pro
// upload de documento (cofre-documentos.js v2.16.0) parar de ler o campo
// antigo tipo_ativo_aplicavel. Corrigido também o VERSAO (const) que tinha
// ficado em 1.37.1 na rodada anterior — o header já estava em 1.37.2, o
// v-check é que não tinha acompanhado.
//
// v1.37.2 — listarModelosItemControle(): order() trocou tipo_ativo (campo
// deprecated, formulário de Modelos de controle parou de gravar nele — ver
// changelog de cofre-controles.js v1.26.0) por escopo_valor.
//
// v1.37.1 — BUG REAL (print do Nicola, ficha de ativo com 2 chips
// "Documento" idênticos em vez do nome de cada categoria): listarCategorias()
// filtrava só `cliente_id = clienteId`, nunca batendo com as categorias
// globais (cliente_id NULL = catálogo padrão Raiz — hoje as 34 únicas que
// existem no banco). Corrigida pro mesmo `.or('cliente_id.is.null,cliente_id.eq.…')`
// já usado em listarSubtiposControle/listarModelosItemControle/ativo_tipos.
// Ver changelog completo junto da função, mais abaixo.
//
// v1.37.0 — buscarCandidatosContrato() nova (ver changelog junto da função,
// mais abaixo): "Vincular a" um documento nunca teve busca por Contrato,
// só Ativo/Imóvel — achado no relato do Nicola sobre o seletor de vínculo.
//
// v1.36.2 — bug real achado ao investigar print do Nicola: o Map de
// buscarResumoImoveisParaCards() usava `entidade_origem_id` como chave,
// mas ativoCardHtml() (cofre-ativos.js) sempre leu por `a.id` — nunca
// batia, pra NENHUM imóvel. Chave trocada pra `id`, vínculo de contrato
// trocado pra `contratos.ativo_id` (cobre legado + nativo). Ver
// changelog completo dentro da própria função.
//
// v1.36.1 — ver changelog junto de buscarContratosDoAtivo() abaixo: função
// renomeada de verdade (estava só no nome, causava TypeError na aba
// Contratos da ficha do ativo — achado real do Nicola).
//
// v1.35.0 — Onda 12 (pedido explícito 16/09/2026: "quero que exista já
// definitivamente apenas um caminho de escrita, que seja na tabela de
// ativos... quero deixar a tabela de imóveis totalmente isolada por um
// tempo... se possível, alterar o nome dela pra ficar aguardando ser
// deletada"). criarImovelEAtivo() parou de chamar fn_criar_ativo/inserir
// em `imoveis` — grava direto em cofre_ativos, sem vínculo nenhum com
// `imoveis` (imóvel novo nasce nativo). BUG REAL evitado: fn_criar_ativo
// sempre gravava tipo_ativo='imovel' (nem predial nem territorial) —
// tipoAtivo agora é parâmetro explícito. atualizarImovel() aposentada
// (sem chamador — salvarEdicaoAtivo grava tudo em cofre_ativos agora,
// vinculado ou não). buscarResumoImovelOrigem/buscarResumoImoveisParaCards
// simplificadas — sem fallback pra `imoveis` (backfill de 1x já fechou
// os gaps, ver migration onda12_backfill_dados_especificos_pre_isolamento).
// `imoveis` não é mais escrita nem lida por nenhuma função viva deste
// arquivo (as 2 que ainda mencionam a tabela, atualizarImovel e o delete
// em imoveis.js, estão sem chamador).
//
// v1.34.0 — Onda 12, continuação (pedido "continuar" — fecha o
// bloqueio registrado na entrega anterior). buscarResumoImovelOrigem e
// buscarResumoImoveisParaCards migradas pra `cofre_ativos`. Achado que
// destravou tudo: uso/tipo_locacao/cib (os 3 campos sem equivalente em
// cofre_ativos) estão 100% vazios hoje — 0 dos 104 imóveis, em qualquer
// tenant, têm qualquer um dos 3 preenchido, e nenhum formulário do app
// (nem o antigo nem o novo) jamais teve campo pra editá-los. Não era
// dado represado — eram 3 colunas mortas. Saíram de vez do retorno de
// buscarResumoImovelOrigem. IPTU usa o mesmo fallback já validado em
// carregarImoveisSupabase (cofre_itens_controle primeiro, imoveis.iptu
// só se o item ainda não tiver valor). Código do IPTU continua narrow-lendo
// `imoveis` (13/104 têm valor real, sem equivalente em item de controle
// ainda). buscarResumoImoveisParaCards: status/tipo/empreendimento
// migraram; a foto de capa CONTINUA lendo imoveis.fotos[0] de propósito
// (cofre_ativo_fotos grava em 3 buckets diferentes por linha — gerar
// signed URL em lote pra uma lista inteira não é tão simples quanto os
// outros campos, fica pra quando essa frente evoluir).
//
// v1.33.0 — Onda 12 (pedido explícito 16/09/2026: "troque as leituras
// para eliminar de vez a tabela [imoveis]... não inverta a lógica... não
// elimine ainda"). 4 funções trocaram de fonte pra `cofre_ativos`:
// resolverNomesDeEntidades (ramo imóvel), buscarCandidatosImovel,
// buscarImovelPorId, listarImoveisDoCliente — todas devolvem `id` como
// entidade_origem_id (== imoveis.id, mesmo espaço de sempre; contratos.
// imovel_id e afins têm FK pra `imoveis`, não mudou). buscarResumoImovelOrigem
// e buscarResumoImoveisParaCards CONTINUAM em `imoveis` de propósito —
// uso/tipo_locacao/cib não têm equivalente em cofre_ativos (uso lá é
// coluna GERADA com outro significado, mapear direto mostraria valor
// errado) — registrado como pendência de arquitetura. atualizarImovel
// não mudou — escrita continua em `imoveis`, decisão explícita de não
// inverter agora.
//
// v1.32.0 — Onda 12, E15.3 (pedido explícito 16/09/2026: "siga direto pra
// apontar a vitrine pra tabela de ativos, mesmo que quebre momentaneamente
// — não há consumo real de cliente hoje pra vitrine"). alternarPublicarVitrineFoto()
// simplificada: parou de ler/gravar `imoveis.fotos` — a vitrine pública
// passa a ler cofre_ativo_fotos direto (RLS nova, migration
// e15_3_vitrine_publica_cofre_ativos_v1, + GRANT SELECT pra anon em
// cofre_ativos/empreendimentos, que faltava de origem). Esta função só
// cuida do arquivo no bucket público e da flag publicar_vitrine agora —
// a linha em cofre_ativo_fotos já É o registro do que está publicado,
// não precisa de 2ª cópia em `imoveis`.
//
// v1.31.0 — Onda 12, E15.2.1 ("criar imóvel novo" dentro do formulário
// unificado, fechando o item 2.1 do handoff — o que ainda mantinha
// imoveis.js vivo). criarImovelEAtivo(clienteId, nomeExibicao,
// imovelDados, tipoDetalheId, dadosEspecificos) nova — chama
// fn_criar_ativo (RPC estendida na mesma sessão, migration
// e15_2_1_fn_criar_ativo_completa_imovel_v1) em vez de inserir direto em
// `imoveis`: reaproveita o "motor único" que já existia pro wizard
// antigo (checagem de limite de plano incluída), agora completo com
// tipo_detalhe_id/dados_especificos, que ele nunca soube preencher.
//
// v1.30.0 — PLANO_IMPLEMENTACAO v1.0, etapa E15.2, conclusão.
// atualizarImovel(id, patch) nova — write-target do formulário
// unificado pra imóvel VINCULADO (grava em `imoveis`; trigger no banco
// espelha pra cofre_ativos sozinho).
//
// v1.29.0 — PLANO_IMPLEMENTACAO v1.0, etapa E15.2. listarEmpreendimentos/
// criarEmpreendimentoRapido novas — mesmo padrão de listarPartesCliente/
// criarParteRapida, pro seletor de empreendimento no form de ativo.
//
// v1.28.0 — PLANO_IMPLEMENTACAO v1.0, etapa E14.4. listarContatos/
// criarContato/atualizarContato/excluirContato saíram (só operavam
// cofre_contatos_acionamento). listarContatosPorItemControle manteve o
// nome, trocou de fonte (RPC fn_partes_do_item_controle). encontrarOuCriarParte
// nova — find-or-create por nome, usada pelo fluxo de sugestão de
// contato por IA (cofre-documentos.js) pra não duplicar parte a cada
// documento novo da mesma seguradora/corretora.
//
// v1.27.0 — PLANO_IMPLEMENTACAO v1.0, etapa E14.3, Onda 12. 2 funções
// novas: resolverPartePadrao (lê cofre_partes_padrao direto, com a nome
// junto, pra achar a parte padrão certa pro subtipo+município/UF do
// ativo) e materializarPartePadrao (RPC fn_parte_padrao_materializar —
// find-or-create idempotente por tenant). buscarItemControlePorId ganha
// codigo_ibge_municipio/uf no join com cofre_ativos — precisava disso
// pra resolver a parte padrão certa.
//
// v1.26.0 — PLANO_IMPLEMENTACAO v1.0, etapa E5 (decisão do Nicola,
// "pode evoluir" — Onda 6 do plano). Nova listarTiposAtivo(clienteId):
// busca ativo_tipos + ativo_tipos_campos (catálogo criado na E4.1/E4.4,
// até aqui só usado pra estampar tipo_detalhe_id retroativamente — nunca
// tinha um consumidor no front). cofre-validacoes.js v2.0.0 usa isto pra
// alimentar o cache que passa a decidir rótulo/ícone/campos por tipo de
// ativo, com fallback pras constantes hardcoded se a busca falhar (R1 do
// plano). Uma chamada só, 2 tabelas pequenas (36+45 linhas) — cache de
// sessão, não precisa buscar de novo a cada tela.
//
// v1.25.0 — PLANO_IMPLEMENTACAO v1.0, etapa E0.2 (achado A8):
// listarSubtiposControle() ganha o parâmetro opcional `tipoAtivo` e filtra
// por cofre_controle_subtipos.tipo_ativo_aplicavel. O array já estava
// preenchido no catálogo desde a criação e nunca era usado — o seletor de
// subtipo mostrava os 109 subtipos em qualquer ativo. Chamada sem o
// parâmetro mantém o catálogo completo (assinatura antiga preservada).
//
// v1.24.0 — MOTOR CENTRAL DE ALERTAS, Fase 3: nova buscarAlertasDoAtivo(),
// ponte pra fn_alertas_do_ativo (banco) — alertas contextualizados na
// ficha do ativo (ver cofre-ativos.js). Nenhuma função existente mudou.
//
// v1.23.0 — A.9 (transição imóveis → ativos, passo 1 de 5): publicação real
// na vitrine. alternarPublicarVitrineFoto era um stub — só marcava a flag,
// nunca copiava o arquivo nem sincronizava `imoveis.fotos` (a vitrine
// pública, sem login, lê direto dessa coluna). Agora copia o arquivo do
// bucket privado (cofre-documentos) pro público (imoveis-fotos, o mesmo já
// usado pelas fotos antigas) e sincroniza a URL — só o que está marcado fica
// exposto. Despublicar reverte os dois lados. Ganhou o parâmetro clienteId
// (este arquivo não importa `estado` — quem chama já tem).
//
// v1.22.0 — Documentos arquivados (pendência: contagem do alerta incluía
// arquivados, tela de "sem vínculo" nunca mostrava). listarDocumentosArquivados
// (status='excluido' — mesmo RLS já libera pra quem tem cofre.editar/cofre.excluir,
// sem migration), restaurarDocumento (volta pra 'ativo'), excluirDocumentoDeVez
// (agora sim: apaga o arquivo do Storage quando havia, remove os vínculos e a
// linha — DELETE físico). Quem chama registra o log ANTES (mesmo padrão de
// excluirDocumentoAtual, que já existia e não mudou de comportamento) — a
// função em si não loga, porque depois do DELETE não haveria mais documento_id
// pra referenciar num log gravado depois.
//
// v1.21.0 — A.10 (Encerrar × Excluir, PROPOSTA v2.2): listarItensControleAtivo
// ganha `incluirEncerrados` (default false — comportamento de sempre);
// encerrarItemControle (= o antigo arquivar, ativo=false; o trigger
// trg_item_controle_encerrar apaga as ocorrências abertas e as despesas
// previstas delas); reabrirItemControle (ativo=true); excluirItemControleDeVez
// (DELETE físico — o banco bloqueia com P0001 se houver ocorrência concluída;
// FK em cascata apaga as abertas). arquivarItemControle fica como alias.
//
// v1.20.0 — "Falha no upload: Failed to fetch" com PDF pelo Android (Nicola,
// 10/09). uploadArquivoDocumento() ficou robusto: (1) lê o arquivo pra
// memória ANTES de subir — no Android/Chrome o File vindo do seletor pode
// ficar inválido depois de um await (o hash já tinha lido; a 2ª leitura no
// fetch falhava); (2) contentType por extensão quando file.type vem vazio
// (comum em PDF vindo de outro app); (3) 1 retry automático em falha de
// rede, com 1,2 s de espera; (4) mensagem de erro em português.
//
// v1.19.0 (Motor Documental fase 3) — listarCatalogoSubtipos() (catálogo
// global de cofre_controle_subtipos com campos/regra/padrões, pra tela de
// confirmação e caminho sem IA); analisarArquivoComIA ganha opções
// {tipoAtivo, ativoId, classificacaoForcada, motor}; registrarExtracaoMotor()
// grava pela RPC nova (subtipo_codigo, campos, validacoes, execucao_ia,
// prompt_versao, canal) e leva dados_estruturados pro documento;
// mesclarIdentificadoresAtivo() grava CPF/placa/RENAVAM/chassi no ativo pra
// o próximo documento casar por identificador forte.
//
// v1.18.0 (A.12/A.13) — listarCategoriasGabarito() (linhas globais de
// cofre_categorias, cliente_id null: padrões de manter arquivo / controle);
// analisarArquivoComIA(storagePath, mime) (cofre-extrair-documento 1.5 em
// modo pré-insert — antes de gravar cofre_documentos); registrarExtracao()
// (RPC fn_cofre_registrar_extracao: auditoria gravada depois do insert, já
// com status_revisao/revisado_por). analisarDocumentoComIA(documentoId)
// mantida pra compatibilidade.
//
// Versão anterior: 1.17.0
//
// v1.17.0 — buscarResumoImoveisParaCards: imóveis e contratos em paralelo.
//
// v1.16.0 — reaproveita window.__raizDbAuth quando roda dentro do App
// (GoTrueClient duplicado, fatia 7). Standalone inalterado.
//
// v1.15.0 — gerarSignedUrl resolve bucket 'externo' (URL como está) e
// 'imoveis-fotos' (público, getPublicUrl) — fotos migradas do cadastro antigo.
//
// v1.14.0 — funções novas pro chip "Partes" do item de controle:
// listarPartesCliente (todas as partes do cliente, não só sócios
// internos), buscarPartesDoItemControle/salvarPartesItemControle (RPCs
// fn_partes_do_item_controle/substituir_partes_item_controle),
// criarParteRapida (nome só, mesmo espírito do fornecedor "+ Novo" do
// popup de despesa em index.html).
//
// v1.13.0 — salvarPropriedadeImovel() removida (função morta desde a
// v1.12.0 — nada mais chamava). Comentários da função de leitura
// corrigidos (não decide mais entre 2 tabelas, só lê propriedade_ativo).
//
// v1.12.0 — listarPessoasInternas() ganhou percentual_cotas_empresa no
// select (pedido explícito: formulário de Novo Ativo precisa pré-popular
// a divisão societária com o sócio de maior cota, mesmo default do
// formulário antigo de imóvel). salvarPropriedadeImovel() mantida no
// arquivo mas sem chamador ativo agora (chip passou a gravar só em
// propriedade_ativo, "no chip de propriedade, só apresente o dos
// ativos") — não removida porque a RPC por trás (substituir_propriedade_
// imovel) continua ativa noutro lugar do App (popup "Divisão Societária"
// da ficha antiga do imóvel) e pode ser útil se esse popup for corrigido
// (ver achado reportado ao Nicola: hoje ele grava num campo
// imoveis.divisao que não existe no schema — bug pré-existente, não
// desta sessão).
//
// v1.11.0 — chip "Propriedade" (NOVO, pedido explícito: "todos os
// ativos devem ter a definição da propriedade com % de sócio na tabela
// correspondente"): buscarPropriedadeDoAtivo() (lê fn_propriedade_do_ativo,
// que decide sozinha propriedade_imovel vs propriedade_ativo),
// salvarPropriedadeAtivo()/salvarPropriedadeImovel() (escrita, 1 RPC
// cada, nenhuma reescrita da lógica existente pro caso imóvel),
// listarPessoasInternas() (sócios internos pro seletor do editor).
//
// v1.10.0 — buscarFluxoFinanceiroAtivo(ativoId): nova, pedido explícito
// ("adicione a um ativo um novo chip de fluxo financeiro"). Chama a RPC
// fn_fluxo_financeiro_ativo (nova, SECURITY INVOKER — RLS de cliente_id
// já existente em mensalidades/contratos/lancamentos/partes faz o
// isolamento sozinha, sem precisar elevar privilégio). Só LEITURA — a
// escrita (novo lançamento) não duplica lógica aqui, é sempre uma ponte
// pra abrirNovaDespesa() do App (index.html), mesmo princípio já usado
// em abrirGestaoImovel(). Testado como authenticated real antes de
// entrar (SET LOCAL ROLE authenticated + RLS), não só via este client
// SECURITY INVOKER assumido.
//
// v1.9.0 — buscarResumoImoveisParaCards(clienteId): nova, pedido
// explícito ("perdeu a formatação da lista... como referência a lista
// de imóveis antiga") — alimenta o enriquecimento visual dos cards de
// ativos do tipo imóvel na lista unificada. 1 query só (join embutido),
// nunca por card.
//
// v1.8.0 — buscarContratosDoImovel(imovelId): nova, pedido explícito
// ("evoluir a exemplo do protótipo") — alimenta a aba Contratos nova da
// ficha do ativo. Leitura pura, mesma tabela/RLS que o App já usa.
//
// v1.7.0 — buscarResumoImovelOrigem(imovelId): nova, busca uso/tipo_locacao/
// iptu/valor_mercado/codigo_iptu de imoveis — fecha a lacuna da ficha do
// ativo não trazer esses campos pra imóvel vinculado (ver changelog de
// cofre-ativos.js v1.4.0 pro consumo). Erro engolido de propósito (retorna
// null) — se o imóvel de origem não existir mais, a ficha não deve quebrar.
//
// v1.6.0 — nova marcarAtivoVendido(id): muda cofre_ativos.status pra
// 'vendido' e desativa em cascata cofre_itens_controle.alerta_ativo dos
// itens vinculados — pedido explícito do Nicola. Ver cofre-ativos.js
// v1.3.0 pro fluxo completo (confirm, toast, disparo de
// cofre:recarregar-eventos).
//
// v1.5.0 — criarSubtipoControle() e atualizarSubtipoControle() ganham
// parâmetro documentoEsperado (default false), gravado em
// cofre_controle_subtipos.documento_esperado — ver changelog de
// cofre-controles.js v1.7.0 pro fluxo completo.
//
// v1.4.2 — REVISÃO DE DESIGN (pedido explícito): listarOcorrenciasAbertasComItem()
// ganhou embed aninhado cofre_ativos(nome_exibicao, tipo_ativo) dentro
// de cofre_itens_controle — o card de alerta da Home/Alertas agora
// mostra o nome e o tipo (ícone) do ativo, não só o título do item.
//
// v1.4.1 — BUG FIX CRÍTICO (achado pelo usuário): listarOcorrenciasAbertasComItem()
// fazia um embed comum (LEFT JOIN) de cofre_itens_controle, sem !inner —
// em PostgREST isso só decide se o objeto embutido vem null ou
// preenchido, NÃO filtra a linha pai pela coluna do filho. Resultado:
// excluir um item de controle (arquivarItemControle, soft-delete —
// ativo=false, nunca mexe nas ocorrências) deixava as ocorrências
// ABERTAS desse item pra sempre nos resultados, porque nada filtrava
// por cofre_itens_controle.ativo. Corrigido com
// `cofre_itens_controle!inner(...)` + `.eq('cofre_itens_controle.ativo', true)`.
// Como esta função alimenta estado.ocorrenciasAbertas (fonte única
// consumida por Home/KPIs, card do Ativo na lista, e tela cheia de
// Alertas), 1 correção resolveu os 3 sintomas relatados de uma vez.
//
// v1.4.0 — MODELOS DE ITEM DE CONTROLE POR TIPO DE ATIVO (pedido
// explícito): listarModelosItemControle()/criarModeloItemControle() —
// mesmo padrão de escopo (global + cliente) de listarSubtiposControle.
// Depende de migration cofre_modelos_item_controle_v1.
//
// v1.3.0 — GESTÃO DE SUBTIPOS DE ITEM DE CONTROLE (pedido explícito):
// nova criarSubtipoControle() — sempre grava com cliente_id do tenant
// atual (nunca null, reservado ao catálogo-base compartilhado), codigo
// gerado por slug do nome com retry de sufixo se colidir (UNIQUE
// (cliente_id, codigo) no banco). Precisou de policy de escrita nova
// (cofre_controle_subtipos_write_policy_v1) — a tabela só tinha SELECT.
//
// v1.2.1 — BUG FIX CRÍTICO (não documentado aqui na hora — só no
// changelog do cofre.html v1.8.1; corrigido agora, tarde, mas correto):
// listarOcorrenciasAbertasComItem() selecionava `alerta_habilitado` de
// dentro de `cofre_itens_controle` — coluna que NUNCA existiu ali (é
// `alerta_ativo`; `alerta_habilitado` é de `cofre_ocorrencias_controle`,
// tabela diferente). Causava 400 Bad Request em toda carga da Visão
// Geral do Cofre. Confirmado contra o schema live do Supabase antes de
// corrigir, não o dump do projeto (pode estar desatualizado).
//
// v1.2.0 — LIMPEZA v6: removida listarOcorrenciasAbertas() duplicada
// (função correta e em uso é listarOcorrenciasAbertasComItem, de sessão
// anterior). Nova criarOcorrenciasControleBatch() — geração de múltiplas
// ocorrências de uma vez (horizonte de 120 dias, ver cofre-controles.js).
//
// v1.1.3 — CORREÇÃO DE BUG: migration_cofre_alarmes_fase1_nucleo_v1 deu
// GRANT só pra service_role nas tabelas de controle, esquecendo
// authenticated — Postgres barrava com "permission denied" antes mesmo de
// avaliar a RLS. Corrigido em migration_cofre_alarmes_fix_grants_v3
// (banco). Também: atualizarEvento/excluirEvento/listarEventosPorItemControle,
// atualizarItemControle/arquivarItemControle/buscarItemControlePorId,
// listarContatosPorItemControle — suporte à ficha própria de Item de
// Controle (ver cofre-controles.js v1.1.0).
//
// v1.1.2 — arquivarAtivo() (soft-delete de ativo, mesmo padrão de
// excluirDocumentoAtual: UPDATE status='arquivado', nunca DELETE físico).
//
// v1.1.1 — funções de acesso a cofre_itens_controle/cofre_ocorrencias_controle/
// cofre_controle_subtipos/históricos (módulo de Alarmes, Fase 1 núcleo).
// Escrita direta via Supabase client, protegida por RLS já aplicada em
// migration_cofre_alarmes_fase1_nucleo_v1 — sem RPC dedicada nesta rodada.
//
// Única camada que fala com o Supabase. cofre-ativos.js/cofre-documentos.js/
// cofre-navegacao.js chamam funções daqui — nenhuma delas monta uma query
// supabase-js diretamente (Diretriz Arquitetural — Passo 2: responsabilidade
// única por módulo).
// ============================================================================

---

## `js/cofre-app.js`

//
// v1.40.0 (demanda ec7d8a9f, item 5 do retorno do piloto — Nicola: "Pode
// executar as demandas dos itens 1, 2, 4, 5 e 6 tb", 28/09/2026) — case
// novo 'ativo-toggle-mais-campos' → ativos.alternarCamposAvancadosImovel
// (cofre-ativos.js v1.66.0), botão "+ Mostrar mais campos" do bloco
// imóvel no formulário de ativo.
//
// v1.39.0 (demanda 2bb6705e, item 6 do retorno do piloto — Nicola: "Pode
// executar as demandas dos itens 1, 2, 4, 5 e 6 tb", 28/09/2026) — case
// novo 'fa-info-cib' → ativos.abrirInfoCib() (cofre-ativos.js v1.65.0),
// ícone (i) do rótulo "CIB (NFS-e)" no formulário de imóvel/ativo.
//
// v1.38.0 (demanda ed2774ee, entrega 2/3 do lote de 29) — dispatcher ganha
// o case 'ic-subtipo-mudou' (controles.aoMudarSubtipoControleForm): trocar
// o subtipo no formulário de novo item de controle passa a sugerir a
// antecedência padrão dele. Depende de ativos-markup.js v1.47.0 (listener
// data-action-change no <select id="ic-subtipo">).
//
// v1.37.0 (demanda 176b3145 — padronizar experiência de Parte em todos
// os locais, pedido explícito do Nicola) — case 'abrir-ficha-parte' não
// abre mais a Ficha (view) como tela intermediária: chama
// window.abrirFormParteSheet() (index.html) direto, o mesmo form de
// edição da aba Configurações › Partes. Ver changelog de index.html
// v1.244.0 pra o resto do rollout desta demanda (lista de Partes, chip
// Partes do contrato, listener cofre:abrir-ficha-parte).
//
// v1.36.0 — BUG REAL achado ao vivo pelo Nicola testando o wrapper de
// escrita (22/09/2026): "alterei o tipo empreendimento de um ativo, e
// não refletiu na lista de imóveis". Causa: o listener de
// 'cofre:recarregar-ativos' já recarregava `estado.ativos` certo, mas a
// LISTA (renderAtivosLista, cofre-ativos.js) não agrupa/exibe a partir
// desse array — ela lê `resumoImoveisPorId`, um Map de cofre-ativos.js
// carregado 1x só no boot ('cofre:dados-carregados') com empreendimento/
// status/tipo/finalidade/foto/contrato principal de cada imóvel, nunca
// invalidado depois de uma escrita. Mesma classe de bug de
// estado.ativoEmFoco (fix v1.61.0 de cofre-ativos.js) e do chip "Fiscal
// OK" (fechamento.js) — variável de módulo cacheada 1x que nunca
// reseta. Fix: o listener agora chama carregarResumoImoveisParaCards()
// (cofre-ativos.js, já existia, exportada) em vez de renderAtivosLista()
// solto — ela recarrega o Map E re-renderiza a lista sozinha, preservando
// o filtro/chip que a pessoa tinha selecionado (bônus: a chamada antiga
// também resetava o filtro a cada edição, sem querer).
//
// v1.35.0 (demanda be42b19f — BUG REAL achado por mim revisando o pedido
// do Nicola de padronizar o componente de Parte) — case novo
// 'abrir-ficha-parte' → controles.abrirFichaParte(). O data-action já
// existia na linha de cada parte dentro do item de controle
// (montarPartesItemControle, cofre-controles.js v1.18.0, 18/09/2026), mas
// nunca teve case correspondente aqui — o clique não fazia NADA, nem
// erro no console. Era a causa real do "clicar numa parte listada
// deveria abrir um resumo" (a função abrirFichaParte já existia e já
// era completa).
//
// v1.34.0 (demanda 44f30857, item 2) — case novo 'fa-info-performance' →
// ativos.abrirInfoPerformanceAtivo() (cofre-ativos.js v1.60.0), ícone (i)
// do card Performance do chip Performance da ficha do ativo.
//
// v1.33.0 (Entrega R.4) — 3 cases novos pro card "Revisão anual de valor"
// do chip Performance da ficha do ativo (cofre-ativos.js v1.58.0):
// 'fa-revisar-valor' → abrirRevisarValor() (abre o sheet com a sugestão da
// IA já calculada, RV4); 'fa-revisao-adiar' → adiarRevisaoValor(); 'fa-
// revisao-manter' → manterValorRevisao(). Nenhuma leva dataset — as 3
// funções leem o estado local do módulo (`revisaoValorAtual`, carregado
// junto com o resto da Performance).
//
// v1.32.5 (pedido explícito, 18/09/2026: "Nos detalhes do arquivo deve ser
// possivel editar o nome. Tanto nos anexos de contrato, quanto ativos, itens
// de controle e os demais") — case novo 'editar-nome-documento-atual' →
// docs.editarNomeDocumentoAtual() (cofre-documentos.js v2.18.0), lapiseira
// nova ao lado do #fd-nome na Ficha do Documento. FIX de passagem: VERSAO
// (const) estava em '1.32.3' enquanto o cabeçalho já apontava '1.32.4' —
// mesmo tipo de deslize de v-check já visto em cofre-api.js — corrigido
// junto, os dois number agora batem de novo.
//
// v1.32.4 — case novo 'modelo-categoria-mudou' →
// controles.aoMudarCategoriaModeloControleForm() — acompanha a troca do
// formulário de Modelos de controle pra escopo_tipo/escopo_valor
// (cofre-controles.js v1.26.0).
//
// v1.32.3 — PLANO_IMPLEMENTACAO v1.0, etapa E14.4: 7 cases de contato-
// item saíram do despachante, 1 novo (acionar-parte-item-direto) no
// lugar. Listener 'cofre:recarregar-contatos' removido — só reatribuía
// estado.contatos, que nada no app lê (achado ao investigar).
//
// v1.32.2 — PLANO_IMPLEMENTACAO v1.0, etapa E14.2: case novo
// 'ic-freq-mudou' → controles.aoMudarFrequenciaItemControle().
//
// v1.32.1 — PLANO_IMPLEMENTACAO v1.0, etapa E5: 2 cases novos no
// despachante de data-action-change, pro 2º seletor (tipo específico)
// que cofre-ativos.js v1.33.0 acrescenta ao form de ativo — um pro form
// de criar, outro pro de editar (prefixos de campo diferentes).
//
// v1.32.0 — BUG REAL achado pelo Nicola (10/09): "Documentos arquivados"
// (v1.31.0) tinha ido pro modal-menu-conta de ativos-markup.js — morto
// desde a v1.115.0 do index.html, quando o menu de Conta virou sheet
// dinâmico (abrirMenuConta()/abrirMenuTiposModelos()). Corrigido no lugar
// certo: 'arquivados' novo no listener cofre:abrir-configuracao, chamado
// por abrirConfiguracaoCofre('arquivados') a partir do menu real (index.html
// v1.165.0). O botão velho fica em ativos-markup.js — mesmo padrão de outras
// telas mortas do projeto (ex.: tab-imoveis), não escopo desta correção.
//
// v1.31.0 — Documentos arquivados: dispatch novo pras 5 ações da tela
// (cofre-documentos.js 2.11.0 / ativos-markup.js 1.27.0).
//
// v1.30.0 — A.10: ações novas do item de controle (cofre-controles.js 1.20.0):
// filtrar-controles-encerrados (chip Ativos/Encerrados no card), encerrar-item-
// controle-atual, reabrir-item-controle-atual. 'excluir-item-controle-atual'
// continua (agora é exclusão de verdade, com guarda no banco).
//
// v1.29.0 (A.24) — despacho: up-pdf-destravar e up-pdf-sem-leitura (PDF com senha).
//
// v1.28.0 — quality gate (up-tentar-outra-foto, up-enviar-assim-mesmo) e
// criar ativo a partir do documento (uc-criar-ativo, uc-cancelar-criar-ativo).
//
// v1.27.0 (Motor Documental fase 3) — despacho: uc-tipo-doc-mudou,
// uc-validade-mudou (change) e uc-reler-tipo (click) do #modal-confirmar-upload.
//
// v1.26.0 (A.12/A.13) — despacho do upload novo (cofre-documentos 2.0.0):
// up-escolher-camera / up-escolher-arquivo, cancelar/salvar-confirmacao-
// upload, uc-categoria-mudou, uc-controlar-mudou, uc-ctl-tipo-mudou,
// uc-ctl-subtipo-mudou, uc-vinculo-ia-mudou; listener de change no #up-camera.
// SAÍRAM: salvar-upload, ignorar/aplicar-sugestoes-ia (modal removido).
//
// Versão anterior: 1.25.4
//
// v1.25.4 — constante VERSAO sincronizada com o header (estava presa em uma
// versão anterior desde o bump do header; ⚙️ › Versões lia a constante e
// acusava "cache segurou" sem haver cache). gerar_versoes.py v1.3 agora
// trava a entrega se header ≠ VERSAO.
//
// Versão anterior: 1.25.3 · 04/09/2026
//
// v1.25.1 — expõe window.rzAbrirUploadContextualComFlag (upload com/sem
// IA pra chamadores fora de Ativos — sheet de Anexos do contrato).
//
// v1.25.0 (fatia 7) — case 'abrir-acoes-ativos' ("+" da aba abre sheet) e
// evento 'cofre:abrir-upload-home' (upload livre a partir do Raiz IA).
//
// v1.24.0 — cases dos ⋮ novos (propriedade, financeiro, anexos, docs e
// contatos do item, categorizar documento) e pontes window.__rz* pros sheets.
//
// v1.23.0 — case 'fa-iniciar-contratacao' (menu completo de contratação).
//
// v1.22.0 — cases fa-novo-contrato-imovel / fa-acoes-contratos; ponte
// window.rzAbrirUploadContextual pro App (upload do contrato no mesmo
// modal do ativo).
//
// v1.21.0 — 'voltar-app' vai pra tab-ativos e 'cadastrar-imovel-app' abre
// o modal sem trocar de aba (telas antigas de Imóveis desligadas no
// index v1.108.0).
//
// v1.20.0 — FATIA 3 da gramática única: cases novos no dispatcher —
// 'abrir-acoes-ativo' / 'abrir-acoes-controles' (os antigos 'alternar-
// mais-acoes-*' ficam como alias, mesmo handler), mais:
// 'fa-seg-arquivos' (segmento Documentos·Fotos dentro do chip Arquivos)
// e 'fa-abrir-contrato-app' (linha de contrato da ficha abre o contrato
// na aba Contratos). Os cases 'alternar-mais-acoes-ativo' /
// 'alternar-mais-acoes-controles' / 'alternar-mais-acoes-fotos-ativo'
// continuam com o mesmo nome, mas agora abrem sheet (ver cofre-ativos.js
// v1.17.0 / cofre-controles.js v1.13.0).
//
// v1.19.0 — case novo 'fi-gerar-despesa-item', delegando pra
// controles.abrirNovoLancamentoDoItem() (box Partes do item de
// controle, botão "Gerar despesa").
//
// v1.18.0 — 2 cases novos pro chip "Partes" do item de controle:
// 'abrir-editar-partes-item' e 'fi-salvar-partes-item' (este dentro do
// modal-generico), delegando pra controles.abrirEditarPartesItem()/
// controles.salvarPartesItemAtual().
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

---

## `js/cofre-ativos.js`

//
// Versão anterior: 1.73.0 · 04/10/2026
//
// v1.73.0 (F0.2b do PLANO_UX, demanda 9e4aca28, sessão 20261003-1707-ux-base; UXR-29/30) —
// zero diálogo nativo: excluir ativo e marcar como vendido viram perguntar() do cofre-ui
// (Sheet); remover foto (só arquiva) não pergunta mais e ganha "Desfazer".
//
// Versão anterior: 1.72.0 · 04/10/2026
//
// v1.72.0 (04/10/2026, sessão 20261004-0020-financeiro, demanda cad6ec67 — P2
// Ficha 3): eixo contábil do ativo. Chip Propriedade ganha a linha
// "Contabilidade da empresa" (Entra / Fora) e o ⋮ ganha "Tirar da / Incluir
// na contabilidade da empresa" (gate imoveis.divisao), gravando
// cofre_ativos.registro_contabil. "Fora" = continua no Raiz, mas não vai ao
// pacote do contador (fn_fechamento_calcular_contabil).
// Versão anterior: 1.71.0.
//
// v1.71.0 (F0.3, demanda 29bed5eb, sessão 20261003-1707-ux-base, "de acordo" do Nicola 03/10 23:57) — nome único da IA: documento que chegou pelo bot mostra "pela Raiz IA"
// (antes "pelo Robô").
//
// Versão anterior: 1.70.0 · 03/10/2026
//
// v1.70.0 (F0.4, demanda 717fc21d, sessão 20261003-1707-ux-base — teste 8
// reprovado pelo Nicola: salvar ativo sem nome mostrava o aviso mas não
// vibrava). Os 5 avisos de erro de salvarAtivo() e da ficha passam por
// erroInline() do cofre-ui.js 1.5.0: mesmo texto, mesmo lugar, agora com
// vibração de erro, anúncio ao leitor de tela e rolagem até o aviso.
//
// v1.69.0 (demanda c0d255e3, teste abf1 reprovado pelo Nicola em 01/10/2026,
// sessão 20261001-2335-contratos-rotulos) — o sheet "Itens de controle" do ativo
// (abrirAcoesControlesAtivo) fica só com "Carregar documento" e "Novo item de
// controle": "Modelos de item" e "Tipos de controle" saem, porque esse cadastro
// é feito no Gestão, para todas as empresas.
//
// v1.68.0 (demanda 11afd25f, pedido do Nicola: "falta atalho de novo contrato
// no ativo — ao clicar em Contratos, quando não existe ainda um contrato, não
// aparece a opção de novo contrato, como Novo ativo no grid geral") — o vazio
// do chip Contratos ganha o botão "+ Novo contrato" (antes só dizia "inicie
// pelo menu ⋮"). Abre abrirEscolhaNovoContratoDoAtivo(): Carregar documento
// (IA, já ligado a este ativo), Novo contrato (formulário único, imóvel já
// escolhido) e Coletar dados do locatário (link, WhatsApp e minuta). O ⋮ do
// card continua com as mesmas opções. Ponte window.__rzNovoContratoAtivo (mesmo
// molde de __rzUploadAtivo), sem case novo no cofre-app.js.
//
// v1.67.0 (demanda 1163097a, retorno do piloto — Nicola testando o item 6/
// CIB pediu o mesmo padrão de ícone (i) + modalGenerico() em "Situação de
// uso" e "Destinação (NFS-e)", ambos dentro do bloco "+ Mostrar mais
// campos" de renderizarBlocoImovel()/renderizarCampoDestinacao()) —
// abrirInfoSituacaoUso() e abrirInfoDestinacao() novas (mesmo molde de
// abrirInfoCib(), v1.65.0); cases 'fa-info-situacao-uso'/'fa-info-destinacao'
// no cofre-app.js v1.41.0. (Os outros 2 campos do mesmo pedido — desconto
// de energia e aluguel antecipado — são do formulário de CONTRATO, não
// deste arquivo; ver contratos.js/index.html na mesma entrega.)
//
// v1.66.0 (demanda ec7d8a9f, item 5 do retorno do piloto — Nicola: "Pode
// executar as demandas dos itens 1, 2, 4, 5 e 6 tb", 28/09/2026) —
// formulário de ativo/imóvel achado longo pela Claudia: renderizarBlocoImovel()
// esconde Situação de uso, Destinação (NFS-e, só edição) e CIB atrás de
// "+ Mostrar mais campos" (alternarCamposAvancadosImovel() nova, export;
// case 'ativo-toggle-mais-campos' no cofre-app.js v1.40.0). Observação
// continua visível — é o campo mais usado ali no dia a dia, por relato do
// Nicola. Nenhum dos campos escondidos é obrigatório
// (validarCamposAtivo/cofre-validacoes.js só cobre nome_exibicao e campos
// do catálogo por tipo) — confirmado antes de esconder qualquer coisa.
// Funciona em criação (prefixo at-imovel-) e edição (prefixo
// fa-editar-imovel-) porque o prefixo vem do próprio botão
// (data-prefixo), igual o padrão já usado nos outros IDs deste bloco.
// Escopo é só o formulário de ATIVO/IMÓVEL — o de CONTRATO (mesma
// demanda, mesmo achado do piloto) fica para uma entrega própria, ainda
// não investigada nesta sessão (ver ENTREGA desta sessão, §1).
//
// v1.65.0 (demanda 2bb6705e, item 6 do retorno do piloto — Nicola: "Pode
// executar as demandas dos itens 1, 2, 4, 5 e 6 tb", 28/09/2026) — ícone
// (i) ao lado do rótulo "CIB (NFS-e)" no formulário de imóvel/ativo
// (renderizarCampoDadosImovel, criação e edição): abrirInfoCib() nova
// (export), mesmo padrão de abrirInfoPerformanceAtivo() (v1.60.0) —
// modalGenerico() explicando o que é o CIB (Cadastro Imobiliário
// Brasileiro, "CPF do imóvel" da Reforma Tributária, atribuído pelo
// cartório via Sinter) e por que o campo existe (NFS-e nacional,
// obrigatório a partir de 01/12/2026). Sem mudança de dado ou de banco —
// só o texto de ajuda.
//
// v1.64.0 (demanda 43448a36, teste reprovado pelo Nicola em 23/09/2026:
// "o campo finalidade de uso deve aparecer na tela de edição de todos os
// ativos") — "Finalidade de uso" sai do bloco de imóvel para um campo
// único (renderizarCampoFinalidadeUso) que aparece em TODO ativo, no criar
// e no editar. Sem finalidade = Família (cofre_ativos.uso é coluna gerada:
// long/short stay, arrendamento e revenda = comercial; o resto e o vazio =
// não comercial). O app nunca grava 'uso'.
//
// v1.63.0 (frente fiscal, Fase 2 — demanda 976fcbf6) — campo "Destinação
// (NFS-e)" na edição do imóvel: Residencial · Não residencial · "Pelo tipo".
// Define o código do serviço (NBS) na nota e o redutor social; NÃO é a
// finalidade de uso (comercial × não comercial, contábil). O banco
// (trg_cofre_ativos_destinacao) já preenche pelo tipo — Apartamento/Casa/
// Cobertura residencial; Sala/Loja/Galpão/Vaga/Conjunto não residencial —
// e respeita a escolha manual (origem 'manual'), que não é mais
// sobrescrita quando o tipo muda. "Pelo tipo" devolve a decisão ao tipo.
// Só na EDIÇÃO: na criação o banco já deriva pelo tipo escolhido (o RPC de
// criação não muda nesta entrega).
//
// Versão anterior: 1.62.0 · 22/09/2026
//
// v1.62.0 (demanda 8b2d37d7, C4 do soft launch) — a trava da cota de ativos
// entra na PORTA DE ENTRADA do formulário, não nos botões: abrirFormAtivo()
// chama rzMostrarBloqueio('cofre.ativos.criar') (js/comum-licenca.js v1.4.0)
// antes de montar qualquer coisa. Cobre os 2 botões do cofre.html, o do
// estado vazio (ativos-markup.js), o Sheet "+" do App e o onboarding
// ('cofre:abrir-form-ativo') de uma vez. salvarAtivo(): erro da porta do
// banco (DETAIL rz_porta:*) aparece como aviso, sem "❌", e a porta é
// recarregada; depois de criar, a porta também recarrega (o contador de
// cota mudou) e os cadeados (data-rz-codigo) são reaplicados.
//
// Versão anterior: 1.61.0 · 22/09/2026
//
// v1.61.0 (BUG REAL, achado do Nicola testando o piloto do wrapper v1.59.0:
// "editei, salvei, refletiu na ficha — mas reabri a edição sem mexer em
// nada e o valor dentro do form estava o antigo"). salvarEdicaoAtivo()
// agora aplica `Object.assign(a, patch)` no objeto local logo após o
// `api.atualizarAtivo()` confirmar — antes disso, só o banco era
// atualizado; o objeto local (mesma referência de `estado.ativos`, usado
// direto por alternarEditarAtivo() pra preencher o form) ficava
// desatualizado até o listener assíncrono de `cofre:recarregar-ativos`
// terminar, o que só acontecia DEPOIS do `abrirFichaAtivo()` seguinte já
// ter rodado. Ver comentário completo na função.
//
// v1.60.0 (demanda 44f30857, item 2 — achado do Nicola: "chip Performance
// (tela do ativo)... incluir um botão/ícone 'i' explicando as métricas
// exibidas") — abrirInfoPerformanceAtivo() nova (export), ícone (i) no
// header do card "Performance" (montarGridPerformanceAtivo), 1 explicação
// por campo do grid. Usa modalGenerico (cofre-ui.js) — a UI nativa do
// Cofre — não o abrirSheet do app principal. Case novo 'fa-info-
// performance' em cofre-app.js v1.34.0.
//
// v1.59.0 (22/09/2026 — Fase 1 do wrapper de escrita/evento local, backlog
// discutido em sessão anterior: "tela desatualizada após criar/editar/
// excluir, cross, todo o app"; decisão do Nicola pra esta entrega, via
// AskUserQuestion: "Utilitário + 1 piloto testado"). salvarEdicaoAtivo()
// agora também chama emitirEscrita('ativo', {...}) (js/raiz-eventos.js,
// novo) logo depois do já existente cofre:recarregar-ativos — o evento
// novo é pra fora do Cofre (index.html, Visão Geral), o antigo continua
// só pro Cofre por dentro. Nenhum outro ponto de escrita deste arquivo
// (salvarAtivo/excluirAtivoAtual/marcarAtivoVendidoAtual, etc.) foi
// tocado — o piloto é só este 1 fluxo, de propósito (ver ENTREGA).
//
// v1.58.0 (Entrega R.4, PLANO_IMPLEMENTACAO_RESULTADOS_MERCADO_FISCAL v2.0.0
// / ESP v1.3.0 §8.1) — card "Revisão anual de valor" completo no chip
// Performance da ficha do ativo (C6, ficava de fora desde a v1.55.0 à
// espera da B1.1). montarFinanceiroAtivo() busca api.buscarSugestaoRevisaoValor
// (fn_revisao_valor_sugerir) em paralelo com performance/mensal e preenche o
// novo #fa-financeiro-revisao (ativos-markup.js v1.45.0) via
// montarCardRevisaoValor() — nada quando o ativo não tem uma revisão em
// andamento (⋮ "Iniciar revisão anual", R.3). Sugestão da IA (IVG-R 12m ×
// fator de ocupação, memória de cálculo aberta) nunca aplicada sozinha
// (REGRAS §15.3/RV5): 3 ações no card, todas terminando numa decisão
// explícita do usuário — "Revisar valor" (abrirRevisarValor, sheet com o
// número já calculado, editável) grava via api.aplicarRevisaoValor com
// origem 'sugestao_ia' ou 'editado_manual'; "Manter o valor"
// (manterValorRevisao) grava o valor atual como confirmado, origem
// 'manter_valor'; "Adiar 30 dias" (adiarRevisaoValor) reusa
// api.reagendarOcorrencia (já existente, cofre-controles.js) — não muda
// valor, só empurra a data. Vocabulário (RV7): nunca "avaliação", "laudo"
// ou "valor de mercado" — só "valor cadastrado" e "sugestão", mesmo texto
// que a função devolve. `revisaoValorAtual` (estado local do módulo,
// mesmo padrão de `ativoAtualId`) guarda a última sugestão carregada pra
// as 3 ações lerem sem 2ª consulta.
//
// v1.57.0 (demanda b46e30fa, continuação — pedido explícito do Nicola após a
// v1.56.0: "minha intenção é sim levar o cartão do ativo pro padrão por
// exemplo do componente de contratos sem mexer no texto e exposição do
// conteúdo do cartão") — o CONTAINER e a MOLDURA do cartão de ativo agora
// seguem o mesmo componente que a lista de Contratos usa (contratos.js
// renderContratos(): 1 `.rz-card.rz-list` por grupo/empreendimento, com
// `.rz-row` dividido por `border-top` entre os itens), no lugar da grade de
// caixas soltas (`.card-ativo` individual + `space-y-2`). Trocado em
// renderAtivosLista(): `<div class="space-y-2">` → `<div class="rz-card
// rz-list">`. Trocado em ativoCardHtml() (as 2 variantes — imóvel com resumo
// e ativo genérico): `<button class="card-ativo ...">` → `<div class="rz-row
// rz-link" role="button" tabindex="0" data-action="abrir-ativo" ...>`
// (mesma delegação de clique de sempre, cofre-app.js; teclado via
// onkeydown Enter/Espaço, igual ao padrão de contratos.js); ícone raiz
// `w-12 h-12 rounded-xl` (48px) → `.rz-ic` (42px/12px, tile), igual
// contratos; adicionado `.rz-chev` (seta) no fim da linha, igual contratos
// (indica "toque para abrir", não existia antes). TEXTO/CONTEÚDO EXPOSTO
// NÃO MUDOU: as mesmas linhas de sempre (nome, valor de mercado, locatário/
// modelo, aluguel/identificador — decidido com o Nicola em v1.44.0/
// v1.51.0/v1.52.0) viraram `<b>`/`<span>` dentro de `.rz-tx` — a CSS de
// `.rz-row .rz-tx span` (DESIGN_SYSTEM, index.html) já é `display:block`,
// então cada `<span>` empilha numa linha, sem precisar de nenhuma classe
// nova. Selo de status (Alugado/Assinando/Vago) e chip de vencimento
// mantidos exatamente como eram, agora dentro de `.rz-rt`. Agrupamento por
// empreendimento (`.rz-group`, já corrigido na v1.56.0) mantido intocado.
//
// v1.56.0 (demanda b46e30fa — registrada como "lista de imóveis no padrão
// das demais listas", mas tab-imoveis/imoveis.js está desligada desde
// v1.108.0 (decisão do Nicola, "não vejo sentido existir estas telas
// antigas mais") e nunca chega a ser vista por um usuário real — quem
// realmente abre depois do cadastro é a lista de Ativos. Confirmado com o
// Nicola e redirecionado o escopo pra cá): renderChipsAtivos() e o
// cabeçalho de grupo de renderAtivosLista() ainda usavam Tailwind cru fora
// da gramática. Corrigido: (1) chips de tipo (Todos/Imóveis/Veículos/
// Outros) trocados de botão com classes condicionais + style inline pra
// `.rz-chip`/`.rz-chip.rz-on` + contador em `.rz-n`, mesmo padrão já usado
// em contratos.js (filtrarContratosPorChip) — fecha de vez a demanda
// 5011173d (que já tinha corrigido só o wrap do container em
// ativos-markup.js v1.38.0, não o botão em si); (2) cabeçalho de grupo por
// empreendimento trocado de `uppercase tracking-wide` (proibido pelo
// DESIGN_SYSTEM §2: "NUNCA caixa alta em rótulo") pra `.rz-group`
// (12px/--sage/sentence case), mesmo padrão de contratos.js (lista de
// contratos agrupada por empreendimento). Conteúdo do card de ativo
// (ativoCardHtml, decidido em várias rodadas com o Nicola — v1.44.0/
// v1.51.0/v1.52.0) NÃO foi alterado, só a chrome ao redor. QUA-01: mesmo
// padrão uppercase/tracking-wide achado também em imoveis.js (tela morta,
// fora de escopo), cofre-controles.js e vitrine.js — registrado como
// pendência separada, não corrigido nesta rodada (fora do pedido "olhar
// pra ativos").
//
// v1.55.0 (Entrega A.7, PLANO_IMPLEMENTACAO_RESULTADOS_MERCADO_FISCAL
// v2.0.0 / ESP v1.3.0 §8) — chip "Financeiro" da Ficha do ativo vira
// "Performance" (ativos-markup.js v1.44.0 trocou só o rótulo; id interno
// data-fa-aba="financeiro" não mudou). montarFinanceiroAtivo() reescrita:
// saiu o grid de Movimentações (era fn_fluxo_financeiro_ativo, últimos 6
// meses — ESP C5: "o chip Performance não tem grid de movimentações",
// operação virou coisa só do Financeiro por competência); entraram os 2
// KPIs do ano (Recebido/Saídas), o gráfico "Recebimento mês a mês" novo
// (fn_resultado_mensal, p_nivel='ativo' — já existia desde A.1) e o grid
// de 10 campos com a mediana da carteira pra comparar (fn_performance_
// ativo.rentabilidade_mediana_carteira_pct, também já existia desde A.1 —
// nenhuma migration nesta entrega). O contador do chip (badge numérico)
// saiu: não tem mais lista de pendência aqui pra contar. Card "Revisão
// anual de valor" (ESP §8.1/C6) fica de fora — critério de pronto próprio
// (Entrega R.4), depende da Fase B1.1 (índice IVG-R) que ainda não existe;
// R.3 (v1.54.0, abaixo) já deixou só o esqueleto de início do ciclo, sem
// sugestão de IA, pela mesma razão.
//
// v1.54.0 (Fase R / Entrega R.3, 20/09/2026) — "Iniciar revisão anual" no
// ⋮ da ficha do ativo (abrirAcoesAtivo): abre Sheet de formulário pedindo a
// data da última revisão de valor e chama api.iniciarRevisaoValorAtivo()
// (cofre-api.js v1.41.0 → fn_revisao_valor_ativo_iniciar). Esqueleto sem
// IA — cria só o item de controle anual do ativo; a sugestão de valor da
// IA (REGRAS §10, card "Performance") é a Entrega R.4, depois de
// indicador_valores nascer na Fase B1.1. Duplicidade (ativo que já tem
// revisão em andamento) é recusada no banco, não pré-checada aqui.
//
// v1.53.0 — NOVO (Entrega 0.1 da frente Resultados/Mercado/Fiscal,
// PLANO_IMPLEMENTACAO_RESULTADOS_MERCADO_FISCAL v2.0.0) — campo "CIB
// (NFS-e)" na ficha do ativo, categoria imóvel: renderizarBlocoImovel()
// ganha o `.rz-f` de texto simples, lerBlocoImovel() devolve `cib`,
// salvarEdicaoAtivo() grava em cofre_ativos.cib (coluna nova, migration
// fiscal_cofre_ativos_cib_v1) e salvarAtivo()/criarImovelEAtivo()
// (cofre-api.js v1.40.0) gravam já na criação. Exibição de leitura em
// montarDadosAtivo() nos dois ramos (avulso e vinculado). Preenchimento
// é manual (decisão do Nicola, Q1 do HANDOFF) — sem OCR, sem
// integração; é o dado que a Reforma Tributária exige (cCIB) pra NFS-e
// de locação a partir de 01/12/2026, e por isso está no caminho crítico
// do plano, não é feature nova de produto. Corrigido de passagem: o
// v-check (linha abaixo) estava em '1.51.0' desatualizado em relação ao
// header (que já dizia 1.52.0 na entrega anterior) — QUA-01, mesmo
// padrão de deslize já visto em outros arquivos deste app.
//
// v1.52.0 — CORRIGIDO (pedido explícito, rodada 10 entrega 4) —
// ativoCardHtml(): simplifica de vez a descrição do card na lista de
// Ativos, nos 2 ramos. Imóvel: linha 2 volta a ser só valor de mercado
// (tipo de uso saiu, virou 3 textos → 1: "Sem contrato" cobre
// Assinando/Em uso/Vago, o selo colorido à direita já diferencia esses
// estados); linha 4 (aluguel) só aparece se alugado. Demais ativos:
// ganham as mesmas 4 linhas isoladas (nome/valor/modelo/identificador),
// que antes só existiam pro imóvel — modelo (dados_especificos.modelo)
// e identificador (identificadorDocumentoAtivo(), já existia desde
// v1.47.0) cada um na sua própria linha, sem "·" concatenando.
//
// v1.49.0 — CORRIGIDO (pedido explícito: "em todos os ativos, colocar o
// valor de mercado do ativo") — ativoCardHtml(), ramo de imóvel com resumo
// carregado (Alugado): linhaDetalhe só mostrava locatário + aluguel;
// valorFmt (a.valor_referencia, mesmo campo que o card genérico e o ramo
// Vago/Em uso já usavam) nunca entrava aí — o card do imóvel alugado nunca
// dizia quanto ele vale. Agora entra sempre que existir (65/109 imóveis
// têm o campo preenchido no banco, conferido antes de mudar), junto com
// locatário e aluguel na mesma linha (aluguel já sem casa decimal desde
// v1.47.0 — fmtMoeda local intocado).
//
// v1.48.0 — CORRIGIDO (pedido explícito: "no chip financeiro do ativo,
// permitir dar baixa ou excluir uma despesa, e se clicar nela, vai pra aba
// financeira") — montarFinanceiroAtivo(): a linha inteira do
// Movimentações ficou clicável (antes só o ⋮ reagia); e a entrada
// (mensalidade) agora também troca pra aba Financeiro (tab-mensal) antes
// de abrir rzAcoesMensalidade — antes só a saída (despesa, via
// abrirEditarDespesa) fazia isso.
//
// v1.47.0 — CORRIGIDO: header e VERSAO (linha ~601) estavam dessincronizados
// (header já dizia 1.46.0, VERSAO ainda '1.45.0') — corrigido de passagem.
// 4 pedidos explícitos do Nicola na mesma rodada, todos em ativoCardHtml()/
// renderAtivosLista(): (1) padrão "há/em xx d" — o chip de prazo do card
// ("29 dias") usava 'warn'/marrom e número cru; virou 'run'/azul + "Em Xd"
// (REGRAS_EXPERIENCIA §9: "run" é a semântica de "A vencer"/"A pagar", não
// "warn" — só o dia exato do vencimento continua 'warn', "Vence hoje"); (2)
// card de imóvel tinha até 4 linhas de texto (nome + "Bem R$X" + locatário +
// aluguel) contra as 2 do card genérico — sempre mais alto, mesmo com
// min-height compartilhado (ativos-markup.js). Consolidado numa linha de
// detalhe só: alugado = "locatário · R$ aluguel/mês"; sem contrato ativo =
// "locatário/status · R$ valor do bem" (Vago/Em uso) — mesma altura do
// genérico agora, de verdade; (3) removida a palavra "Bem" e as casas
// decimais dos valores (fmtMoeda local ganhou maximumFractionDigits:0,
// escopado a este card — formatarMoedaBR() de sempre continua com
// centavos em toda outra tela); (4) card genérico: saiu o texto de
// categoria (rotuloTipoAtivo — o ícone já diz isso) e entrou o
// identificador do documento do bem (placa/matrícula/registro, por tipo —
// identificadorDocumentoAtivo(), novo), pra dar pra diferenciar 2 ativos
// do mesmo tipo sem abrir a ficha; (5) agrupamento por empreendimento
// (renderAtivosLista) deixou de exigir mais de 10 imóveis na carteira —
// carteira pequena com 1 empreendimento só (ex.: 8 imóveis em "Capital")
// nunca agrupava; agora agrupa sempre.
//
// v1.46.0 — E15.3 (demanda abd1a73f): destravado o campo "Tipo específico"
// na edição de ativo VINCULADO (imóvel legado ligado a `imoveis`) — antes
// só avulso podia editar, vinculado ficava com <input disabled> porque
// `imoveis.tipo_id` (catálogo antigo) era temido como fonte de verdade pra
// "outras partes do sistema legado". Levantamento confirmou: 0 função SQL
// ativa lê imoveis.tipo_id hoje, salvarEdicaoAtivo() já tinha parado de
// escrever em `imoveis` desde a Onda 12, e cofre_ativos.tipo_detalhe_id
// bate 100% (104/104) com o tipo legado em todo imóvel existente. Risco de
// descasamento que motivava o lock não existe mais — vinculado e avulso
// convergem pro mesmo <select>. `imoveis.tipo_id`/`tipos_imovel` ficam
// congelados no banco (COMMENT ON, não apagados) — ver ENTREGA da rodada.
//
// v1.45.0 — feedback do Nicola em teste real sobre o card de imóvel da
// v1.44.0: (1) linha "Empreendimento · Tipo" saiu de dentro da caixa
// (redundante — já dá pra ver pelo agrupador .rz-group da lista); (2)
// nova ordem das linhas: nome do imóvel → valor do bem → locatário →
// aluguel, cada um na sua própria linha (antes valor+aluguel vinham
// juntos numa linha só); (3) ícone/avatar passou de items-start pra
// items-center (agora centraliza na altura da caixa, não só na 1ª
// linha do texto); (4) removido finalidadeLabel — variável morta, nunca
// foi usada em lugar nenhum da função. Altura padrão do card em si é
// CSS (.card-ativo min-height, ativos-markup.js v1.39.0).
//
// v1.44.0 — pedido explícito (inspiração: lista de e-mail do Outlook
// mobile, anexada): renderAtivosLista/ativoCardHtml — card de imóvel
// ganha 2 linhas novas (locatário completo, sem truncar; valor do bem e,
// se alugado, valor do aluguel/mês), card genérico ganha o valor do bem;
// componente de alarme (chip de vencimento) reduzido — "Em dia" saiu, só
// aparece quando há urgência real (vencido ou ≤30 dias).
//
// v1.43.0 — pendência 6c2e9b1e (parcial): bloco "Divisão societária" do
// form de criar ativo — hex solto em style="" (#cbd5e1/#f8fafc) e
// classes Tailwind de cor (bg-slate-100 etc.) trocados por tokens do
// Design System. Não usa a classe .rz-f (layout em linha horizontal,
// não cabe no padrão vertical dela) — estilo replicado nos mesmos
// tokens. Item de controle e form de EDITAR ativo continuam pendentes
// (mesma demanda, escopo maior — fica pra próxima rodada).
//
// v1.42.0 — 3 achados do teste real (Nicola, prints Albuquerque Silva):
// (1) chip Financeiro sem contador/warn — faAtualizarContador() nunca
// era chamada pra esse chip (elemento nem existia no markup); agora
// mostra itens em aberto e fica warn quando algum está atrasado. (2)
// BUG REAL nas 2 pontes de "iniciar contratação"/"novo contrato" da
// ficha do ativo — passavam a.entidade_origem_id (sempre undefined pra
// imóvel nativo) em vez de a.id pras funções de vitrine.js/contratos.js,
// que fazem imoveis.find(i => i.id === ...) contra um array que usa o
// id do próprio ativo desde a Onda 12. As pontes em si sempre existiram
// (lazy-load em index.html) — corrige a demanda ba64b8cb, que tinha
// premissa errada (achava que não existiam). (3) achado no caminho:
// fn_fluxo_financeiro_ativo (banco) tinha a mesma restrição legada de
// outras funções desta sessão (entidade_origem_tipo/imovel_id) —
// corrigida separadamente, direto no banco.
//
// v1.41.0 — 4 achados reais de teste (Nicola, prints), mesma rodada:
// (1) seletor "Qual imóvel?" removido do form de criar ativo — criar
// sempre nasce nativo desde o único caminho de escrita da Onda 12,
// vincular a um legado não tinha mais ganho nenhum. (2) BUG REAL: aba
// Contratos da ficha do ativo mostrava "só existem pra imóveis" pra um
// imóvel NATIVO de verdade — 13 pontos usavam entidade_origem_tipo
// ==='imovel' como proxy de "é imóvel" (só reconhece os 104 legados);
// 9 corrigidos pra ehCategoriaImovel(tipo_ativo) (os outros 4 ficam
// como estavam de propósito — vitrine e foto legada realmente exigem
// um imoveis.id, e abrirGestaoImovel já não tem chamador). (3) mesma
// causa raiz do "cai em Outros ativos" — grouping/card rico corrigidos
// junto. (4) campos do form de criar ativo convertidos pra gramática
// .rz-f (DS §6) — usavam border-slate-300, classe Tailwind de cor
// proibida no Design System; só o bloco de endereço já seguia o padrão
// certo. Ver cofre-api.js v1.36.0 e ativos-markup.js v1.36.0 pro resto.
//
// v1.40.0 — Onda 12 (pedido explícito: "único caminho de escrita, na
// tabela de ativos"). salvarEdicaoAtivo(): vinculado e avulso convergem
// — os dois gravam em cofre_ativos direto agora, no mesmo `patch`.
// api.atualizarImovel() (escrevia em `imoveis`) não é mais chamada
// daqui. criarImovelEAtivo() ganhou o parâmetro tipoAtivo (bug real
// evitado — ver changelog de cofre-api.js 1.35.0).
//
// v1.39.0 — Onda 12, continuação. montarDadosAtivo(): "Inscrição
// imobiliária"/"Uso"/"Tipo de locação" saíram da grade "Dados do
// imóvel" — buscarResumoImovelOrigem (cofre-api.js 1.34.0) não devolve
// mais esses 3 campos (achado: 100% vazios em produção, nenhum
// formulário jamais teve campo pra editá-los — não mudava nada visível
// pra ninguém, já não apareciam). UF/Município, Valor de mercado e IPTU
// continuam exatamente iguais.
//
// v1.38.0 — Onda 12, E15.2.1 ("criar imóvel novo" no formulário
// unificado — item 2.1 do handoff de 16/09, o último caminho que ainda
// mantinha imoveis.js/wizard antigo vivo). aoMudarTipoAtivo() ganhou 3ª
// opção no seletor "Qual imóvel?" ('__novo__' — "+ Cadastrar um imóvel
// novo"), reaproveitando os mesmos blocos de endereço/empreendimento-
// valor/dados de imóvel que o avulso já usa (atualizarCamposEstrutu-
// radosAtivo() passou a tratar vazio e '__novo__' como o mesmo estado
// "sem vínculo a existente"). salvarAtivo() ganhou o 3º ramo: chama
// api.criarImovelEAtivo() (cofre-api.js v1.31.0 → fn_criar_ativo, RPC
// estendida na mesma sessão) em vez de inserir só em cofre_ativos —
// grava em `imoveis` de verdade, então o imóvel novo já nasce podendo
// virar contrato de locação e aparecendo na vitrine pública (que ainda
// lê `imoveis` sem login, E15.3 não migrou). Achado no caminho: o
// seletor de vínculo só existia pra 'imovel_predial' — 'imovel_
// territorial' (terreno/fazenda) nunca teve a opção de vincular NEM
// agora de criar; ehCategoriaImovel() no lugar do antigo "===
// 'imovel_predial'" resolve as duas categorias de uma vez.
//
// v1.37.0 — feedback do teste real (Rumo, "Rua Outono, 998", 16/09/2026):
// (1) Empreendimento virou bloco PRÓPRIO, universal (qualquer tipo de
// ativo sem vínculo com imóvel real, não só categoria imóvel) —
// renderizarBlocoEmpreendimentoValor(), reposicionado logo abaixo de
// "Tipo específico" (antes vinha depois de todo o bloco de endereço).
// (2) Espaçamento dos blocos de endereço/imóvel reduzido (gap-3 → gap-2).
// (3) "Aluguel esperado (R$)" novo — só aparece quando finalidade de uso
// é comercial (FINALIDADES_USO_ATIVO ganhou a flag `comercial`); pergunta
// direta do Nicola no teste ("qual campo é isso?") — resposta: não
// existia. Grava em dados_especificos.aluguel_desejado SEMPRE (avulso e
// vinculado) — não sincroniza com `imoveis`, decisão do documento
// DE_PARA (é conceito diferente de valor_referencia/valor_mercado).
// (4) `valor_estimado` (dados_especificos, campo antigo de
// CAMPOS_POR_TIPO_ATIVO) desativado no catálogo pra imovel_predial/
// imovel_territorial — ficava redundante com valor_referencia (Fase 1)
// desde que ela nasceu, e ninguém tinha desligado o antigo ainda. Achado
// pela pergunta do Nicola "quais dos 2 campos de valor é qual".
//
// v1.41.0 — PLANO_IMPLEMENTACAO v1.0, etapa E15.2 ("A2"), conclusão
// (decisão do Nicola: "quero desligar o form de imóveis... vamos
// implementar o que falta"). alternarEditarAtivo()/salvarEdicaoAtivo()
// passam a atender IMÓVEL VINCULADO também, não só avulso — blocoEndereco/
// blocoImovel aparecem pros dois; salvarEdicaoAtivo() decide o destino:
// vinculado escreve em `imoveis` (api.atualizarImovel — a vitrine
// pública lê imoveis sem login, tem que continuar fonte de verdade até
// a E15.3), avulso continua direto em cofre_ativos. Banco ganhou
// trg_imovel_atualiza_ativo (AFTER UPDATE, só existia BEFORE INSERT) —
// testado isolado antes de mexer no front. Os 2 botões que apontavam
// pro formulário legado (abrirAcoesAtivo "Editar dados do imóvel" e o
// botão da grade de dados na ficha) convergem num só, "Editar" →
// alternarEditarAtivo(). abrirGestaoImovel()/o formulário legado em si
// NÃO foram removidos — só ficaram sem chamador a partir daqui.
// Achado e corrigido no caminho: 6 dos 104 ativos vinculados são
// imovel_territorial, não só imovel_predial (comentário antigo em
// ehImovelAvulso() estava errado nisso) — ehCategoriaImovel() nova
// cobre as 2 categorias.
//
// v1.35.0 — PLANO_IMPLEMENTACAO v1.0, etapa E15.2 ("A2"), Onda 12
// (decisão do Nicola: "pode evoluir"). Campos da DE_PARA_IMOVEIS_ATIVOS
// Fase 1/2 (valor_referencia, area_m2, finalidade_uso, situacao_uso,
// observacao) + empreendimento_id ganham formulário — mesmo escopo do
// endereço (E6.2): só imóvel avulso. renderizarBlocoImovel/lerBlocoImovel
// novas (mesmo padrão do bloco de endereço), seletor de empreendimento
// com find-or-create (criarEmpreendimentoRapido, cofre-api.js).
// Investigação antes de codar: propriedade societária e fotos JÁ
// funcionam pro imóvel avulso sem mudança nenhuma — salvarDivisaoImovelPopup
// (form legado) chama a MESMA RPC substituir_propriedade_ativo que o
// ativo genérico usa, e montarFotosAtivo já lê cofre_ativo_fotos com
// fallback pro legado — não eram gap, só pareciam.
//
// v1.34.0 — PLANO_IMPLEMENTACAO v1.0, etapa E15.1 ("A3"), Onda 12
// (decisão do Nicola, "começar a onda 12"). montarDadosAtivo(): os campos
// específicos do ativo (dados_especificos) apareciam como uma STRING de
// valores separados por "·", sem rótulo — dava pra ver quantos campos
// tinham valor, não qual era qual. Vira grade .rz-kv (rótulo + valor),
// 3º lugar nesta mesma função a usar o componente (os outros 2: imóvel
// vinculado, endereço do avulso na E6.2) — nenhum padrão novo.
//
// v1.33.0 — PLANO_IMPLEMENTACAO v1.0, etapa E5, Onda 6 (decisão do
// Nicola, "pode evoluir"). CAMPOS_POR_TIPO_ATIVO (objeto) some da
// importação — os 4 call sites (renderizar/lerCamposEstruturados,
// montarDadosAtivo) passam a chamar obterCamposPorTipo(categoria,
// tipoDetalheId), do catálogo do banco (cofre-validacoes.js v2.0.0).
// Form de criar ganha 2º seletor (#at-tipo-detalhe, categoria → tipo
// específico, ex. Veículo → Carro blindado) — popularSelectTipoAtivo()
// oferece as 8 categorias macro, não mais os 10 valores específicos
// antigos. Form de editar ganha o mesmo 2º seletor, mas EDITÁVEL (a
// categoria continua somente-leitura, pelo motivo já documentado; o
// tipo específico não tinha esse problema, a E5 liberou). salvarAtivo/
// salvarEdicaoAtivo passam a gravar tipo_detalhe_id — ativo novo já
// nasce com o dado que a E4.2 só conseguiu estampar retroativamente.
// ehImovelAvulso/aoMudarTipoAtivo: 'imovel' → 'imovel_predial' (valor
// mudou na fatia B; 'imovel_territorial' nunca passou pela tabela
// imoveis mesmo, então esse ramo não muda). Catálogo carregado 1x por
// sessão (garantirCatalogoTiposAtivo), com fallback se falhar — mesmo
// padrão de obterCamposPorTipo.
// Bot (_shared.ts) continua fora desta entrega — fatia separada, já
// avisada; o catálogo tem fallback idêntico ao comportamento de hoje,
// nada quebra no app publicando sozinho.
//
// v1.32.1 — PONTE DE COMPATIBILIDADE pra E4.2 fatia B (junto com
// cofre-validacoes.js v1.4.0 — ver changelog lá pro porquê). Achado aqui:
// GRUPOS_CHIP_TIPO (chips Imóveis/Veículos/Outros da lista de ativos)
// filtra por tipo_ativo cru — sem isto, o chip "Imóveis" ficaria
// VAZIO depois da migration (os 106 imóveis passam a ser
// imovel_predial/imovel_territorial, nenhum dos dois batia no filtro
// antigo ['imovel','terreno']). Grupos passam a aceitar os dois
// conjuntos de valores.
//
// v1.32.0 — PLANO_IMPLEMENTACAO v1.0, etapa E6.2 (decisão do Nicola,
// 15/09: "do endereço sim pode ser"): js/comum-endereco.js ganha seu
// primeiro consumidor — a ficha do ativo "imóvel avulso" (tipo_ativo=
// 'imovel' SEM vínculo com a tabela imoveis; ativo vinculado a imóvel de
// verdade continua editando endereço só pelo formulário do imóvel — dois
// caminhos de escrita pro mesmo dado não é opção, R3 do plano). Criar,
// editar e a ficha (Resumo) passam a usar o bloco estruturado
// (renderizarBlocoEndereco/lerBlocoEndereco) em vez do antigo campo
// solto `dados_especificos.endereco` (removido em cofre-validacoes.js
// v1.3.1). Escopo desta entrega, de propósito menor: sem o botão "usar
// endereço de outro ativo" ainda (exige um seletor de ativos da empresa
// — fica pra próxima fatia, componente já suporta via
// botaoCopiarDeAtivo/opcoes.mostrarBotaoCopiar quando entrar). Código
// IBGE (`codigo_ibge_municipio`) fica oculto no formulário — E6.3 ainda
// não existe, não tem quem resolva; ViaCEP preenche quando devolve o
// campo, senão vai nulo e fica pendente.
//
// v1.31.3 — FIX (achado do Nicola em teste real): aplicarAlertaMotorNoChip
// Controles filtra os alertas por tipo antes de repassar ao pintor — só
// anexo_apolice_pendente e cofre_item_vencendo pintam o chip "Controles".
// Alerta de contrato/financeiro do ativo (que a E2.3 passou a trazer aqui)
// não é mais confundido com item de controle vencido.
//
// v1.31.2 — PLANO_IMPLEMENTACAO v1.0, etapa E11: aplicarAlertaMotorNoChip
// Controles passa a só BUSCAR (fn_alertas_do_ativo) e delegar a pintura para
// aplicarMotorNoChipControles (cofre-controles.js v1.21.0), fonte única de
// cor e texto do chip. Antes acendia o vermelho aqui e nunca apagava.
//
// v1.31.1 — PLANO_IMPLEMENTACAO v1.0, etapa E0.1 (achado A6):
// abrirNovoContratoDoAtivo() não chama mais window.switchTab('tab-contratos')
// antes de criarContratoParaImovel(). O formulário de contrato agora vive no
// <body> e abre por cima da ficha do ativo, sem tirar o usuário de onde ele
// estava. Nenhuma outra função deste arquivo mudou.
//
// v1.31.0 — MOTOR CENTRAL DE ALERTAS, Fase 3: "alertas contextualizados na
// ficha do ativo" (último item da Fase 3) — versão FINAL, pedido do Nicola
// depois de ver a v1.30.0 (banner) ao vivo: "o banner ficou ruim, melhor
// pintar de vermelho a bolinha do chip que já existe". Reescrito: em vez de
// um componente novo, nova aplicarAlertaMotorNoChipControles() só ACENDE o
// vermelho (.rz-warn) que o chip "Controles" já tinha (cofre-controles.js,
// desde v1.13.0) quando o Motor detecta um alerta que a conta local não via
// (anexo_apolice_pendente — documento pendente, sem data de vencimento pra
// comparar). Não mexe no número mostrado no chip nem no clique (o chip já
// troca de aba nativamente). v1.30.0 (o banner) nunca foi entregue como
// versão própria — direto pra esta.
//
// v1.29.0 — INSTRUMENTAÇÃO: window.editarImovel é ponte assíncrona (R8/
// A.8). A promise era ignorada, então falha de import ou da própria função
// virava "unhandled rejection" no console e o usuário via só um clique que
// não fazia nada. Agora o erro real vai pra tela.
//
// v1.28.0 — A.9: acompanha cofre-api.js 1.23.0 (publicação real na vitrine)
// — alternarVitrineFoto passa clienteId e o toast deixou de avisar "ainda
// não implementada".
//
// v1.27.1 (09/09/2026) — LISTA VAZIA QUE NÃO EXPLICA NADA (achado do
// Nicola: "os ativos das empresas não estão carregando"). Causa: a RLS de
// cofre_ativos exige `cofre.ver`; com a licença expirada o SELECT volta
// zero linhas e a tela mostrava "Nenhum ativo controlado ainda" — como se
// a empresa não tivesse ativos, escondendo que o problema é licença.
// Agora o estado vazio consulta podeUsar('cofre.ver') e, quando o motivo é
// licença/plano, troca a mensagem e o botão por "Ver licença". Vale pra
// qualquer empresa que expire (hoje 3 estão nesse estado).
//
// v1.27.0 — chips da ficha gateados por *.ver (CHIP_CODIGO): sem permissão
// = cadeado e não troca. Antes o chip abria e mostrava os dados.
//
// v1.26.0 — ficha do ativo abre NA HORA: mudarTela primeiro, 6 painéis em
// paralelo (Promise.all) com catch individual; guarda contra troca de ativo
// no meio. Era 6 consultas em fila antes de trocar de tela (Nicola: "nem
// sempre abre de primeira").
//
// v1.25.0 — 12 ações que ficaram sem `codigo` na v1.24 (achado pelo
// Nicola testando como 'consulta'): Editar dados (ficha do ativo),
// Editar divisão, Novo item de controle, Financeiro (Novo lançamento /
// Ver no Financeiro), Anexos (IA / upload / fotos), Contratos (link /
// cadastrar / ver todos). abrirAcoesAtivo, abrirAcoesPropriedade,
// abrirAcoesControlesAtivo, abrirAcoesFinanceiroAtivo, abrirAcoesAnexos
// e abrirAcoesContratosAtivo usam sheetOuAviso — não passavam pelo mesmo
// scan que abrirSheetAcoes direto, por isso escaparam da 9a.
//
// v1.24.0 — ⋮ do ativo com `codigo` (porta única do app): imoveis.editar, cofre.editar, vitrine.gerar, cofre.excluir.
//
// v1.23.0 — ⋮ por linha nas movimentações do chip Financeiro do ativo
// (entrada → rzAcoesMensalidade; saída → abrirEditarDespesa no App).
//
// v1.22.0 (fatia 7) — "Gerar vitrine" no ⋮ do ativo-imóvel.
//
// v1.21.0 — Nicola (19h): rodapés de card saem — toda ação no ⋮ ou no
// toque (abrirAcoesPropriedade / abrirAcoesControlesAtivo /
// abrirAcoesFinanceiroAtivo / abrirAcoesAnexos; abrirAcoesAtivo ganha
// "Editar dados do imóvel"). BUG do status "Vago com contrato": status do
// resumo vem minúsculo. Alerta do card na mesma linguagem do status.
//
// v1.20.0 — anotações do Nicola (16h):
//   - Anexos: chips Todos · Fotos · <categorias> (montarAnexosChips /
//     aplicarFiltroAnexos); IA + Upload sempre no rodapé.
//   - Fotos: migração base64 → Cofre ao abrir a ficha (migrarFotosBase64);
//     toast no lugar do "Fotos enviadas ✅".
//   - Card da lista: tag derivada do contrato (Alugado/Assinando/Em uso/
//     Vago) via renderStatus; finalidade sai do título.
//   - abrirContratoNoApp abre a FICHA (abrirFichaContrato), não o modal.
//   - Chip Contratos: "Iniciar contratação" → iniciarProcessoContratacao
//     (link, WhatsApp, minuta); Mais ações com as 3 vias.
//   - "Mais ações" do rodapé saiu (⋮ vive no cabeçalho, markup v1.18.0).
//
// v1.19.0 — achados do Nicola (prints 13h40):
//   - Documentos do ativo: toque abre o documento (abrir-documento) + chevron.
//   - Fotos: fallback pras fotos do cadastro antigo (imoveis.fotos, URLs)
//     quando cofre_ativo_fotos está vazia — Alameda Oscar Niemeyer, 288.
//   - Chip Contratos: chevron nas linhas, rodapé "Abrir contrato" /
//     "Iniciar contratação" + Mais ações (abrirAcoesContratosAtivo,
//     abrirNovoContratoDoAtivo → abrirNovoContratoParaImovel do App).
//   - abrirContratoNoApp deixa window.fichaContratoOrigem pra o Voltar do
//     contrato cair na ficha do ativo.
//   - abrirFichaAtivo(id, chipInicial) + window.faTrocarAbaFicha /
//     abrirFichaAtivoNoChip: voltar do item de controle cai em Controles.
//
// v1.18.1 — fatia 3b-ii: ao abrir o formulário do imóvel pela ficha do
// ativo, esconde o bloco #imo-blocos-ficha (síndico, manutencista, sócios,
// fotos), que já tem lugar próprio na ficha.
//
// v1.18.0 — achados do Nicola (prints 13h, 03/09):
//   - abrirGestaoImovel(): não troca mais pra tab-imoveis (modal vive no
//     <body> desde index v1.108.0); deixa o hook __rzAposFecharImovel pro
//     App recarregar a ficha do ativo ao fechar/salvar. Fim da queda na
//     lista antiga de imóveis.
//   - alternarEditarAtivo(): editor de campos do ativo em bottom sheet
//     (abrirSheetForm), mesmos ids; salvarEdicaoAtivo devolve true/false.
//   - Pontes novas window.rzAbrirAtivosComFiltro / rzAbrirAtivoDoImovel
//     (atalhos da Visão Geral e "ver imóvel" do contrato).
//
// v1.17.2 — BUG: contador/subtítulo do chip Contratos comparava status
// capitalizado ('Ativo') com o valor minúsculo do banco ('ativo') —
// contrato vigente contava como encerrado. Normalizado em
// montarContratosAtivo (c.st).
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

---

## `js/cofre-controles.js`

//
// v1.44.0 (F1.1, teste 3 reprovado pelo Nicola 04/10 08:41, demanda c5d844a4, sessão 20261003-1707-ux-base) — editar item de controle: quando a
// mudança afeta os alertas (início, fim, frequência ou direção), a pergunta vem ANTES de
// salvar — "Salvar e regerar" / "Salvar e manter as atuais". Fechar sem escolher NÃO salva
// nada e o formulário continua aberto (antes o item já estava gravado quando a pergunta
// aparecia, e fechar não desfazia a alteração).
//
// v1.43.0 (demanda 2923ff4d, catálogo único — fatia 2, parte app; "de acordo" do Nicola 03/10/2026 23:42; sessão 20261004-0815-catalogo-f2) —
//   1) combos de Tipo (#ic-tipo novo item, #fic-ed-tipo edição) montados a partir do
//      catálogo controle_tipos (só selecionavel_app; o tipo do próprio item sempre entra).
//      O markup fixo do HTML fica só como reserva se o catálogo não carregar.
//   2) "Lançar despesa" a partir do item pede a categoria ao banco
//      (fn_categoria_lancamento_do_item: subtipo › tipo › outro) — a mesma que a
//      ocorrência usa. Taxa/condomínio deixa de abrir como "tributo".
//
// v1.42.0 (F0.2b do PLANO_UX, demanda 9e4aca28, sessão 20261003-1707-ux-base; UXR-29/30) — zero diálogo nativo: 7 confirm() viram perguntar() do cofre-ui
// (Sheet; destrutivo com item vermelho). Desvincular documento do item não pergunta mais e
// ganha "Desfazer" no aviso (regra aprovada: Desfazer onde voltar é trivial).
//
// Versão anterior: 1.41.0 · 03/10/2026
//
// v1.41.0 (F0.3, demanda 29bed5eb, sessão 20261003-1707-ux-base, "de acordo" do Nicola 03/10 23:57) — nome único da IA: documento que chegou pelo bot mostra "Pela Raiz IA"
// (antes "Pelo Robô").
//
// Versão anterior: 1.40.0 · 03/10/2026
//
// v1.40.0 (demanda d3260b23, testes reprovados pelo Nicola em 03/10/2026 23:02, sessão 20261003-2305-controles-despesa-b) —
//   teste 4: a data fim ia no FIM do subtítulo e o celular cortava ("Licença de
//   software / ..."). Agora vem primeiro: "Até 15/08/2027 · Licença de software".
//
// v1.39.0 (demanda d3260b23, Ficha F1 — plano aprovado pelo Nicola em
// 03/10/2026 21:37, sessão 20261003-2140-controles-despesa):
//   1) CORRIGIDO: item de tipo `despesa` abria a edição com o Tipo em branco
//      (o combo fic-ed-tipo do cofre.html só tinha seguro/manutenção/tributo) e
//      o salvar mandava tipo vazio — erro cofre_itens_controle_tipo_check. Agora
//      o combo ganha "Despesa" (cofre.html v1.30.0) e abrirEditarItem garante a
//      opção do tipo do próprio item mesmo que o combo não a conheça.
//   2) salvarEdicaoItem e salvarItemControle recusam Tipo vazio com aviso, sem
//      chamar o banco.
//   3) Lista de itens: o subtítulo mostra "· até dd/mm/aaaa" quando o item tem
//      data fim (validade de chave, crédito, apólice).
//   4) Cabeçalho do card Controles: complemento neutro "· N encerrado(s) ·
//      M sem alerta" quando houver, para o item desligado não passar despercebido.
//      Nenhuma cor de urgência muda; o Motor continua decidindo cor e texto.
//
// v1.38.0 (demanda 854f6343, encargos v3, plano aprovado pelo Nicola em
// 02/10/2026 23:47, sessão 20260927-2205-contratos) — ficha do item de IPTU/
// condomínio por responsável: "Período do contrato" (ou "Período sem
// contrato", no item vago) e "Memória de cálculo" a partir de item.rateio
// (IPTU: anual × dias ÷ dias do ano = devido; condomínio: competências, mês
// parcial em dias). Se o valor do item foi editado, mostra o ajuste. "Quem
// paga" desses itens é fixo: locatário (contrato), proprietário (contrato)
// ou proprietário · imóvel sem contrato.
//
// v1.37.0 (demanda 854f6343, encargos v2, plano aprovado pelo Nicola em
// 02/10/2026 13:28, sessão 20260927-2205-contratos):
//   1) CORRIGIDO: editar item apagava o subtipo. abrirEditarItem montava o
//      seletor com o catálogo ainda não carregado (subtiposCache null) e o
//      salvar gravava subtipo_id null. Agora carrega o catálogo antes e, como
//      garantia, o subtipo do próprio item sempre entra no seletor.
//   2) Ficha do item: "Quem paga" aparece também em tributo/taxa sem marcação
//      ("Proprietário (padrão)"); locatário passa a ler "na vigência do
//      contrato" — quem paga cada ocorrência é decidido pela data dela
//      (migration contratos_encargos_responsavel_v2), escrito na descrição.
//   3) Linha da ocorrência em aberto mostra a descrição dela quando houver
//      (ex.: "Pagamento: locatário — contrato Fulano, vigente até 31/12/2026").
//
// v1.36.0 (demanda 854f6343, sessão 20260927-2205-contratos) — item de IPTU/
// condomínio pago pelo locatário mostra "· Paga: locatário" na lista de itens do
// ativo, e a ficha do item ganha a linha "Quem paga" (responsavel_pagamento,
// preenchido pelo contrato vigente via trigger trg_contrato_sincroniza_encargos).
//
// v1.35.0 (30/09/2026 — frente licenca-financeiro, ficha F1/F3 aprovada
// pelo Nicola em 30/09): item de controle do tipo `despesa` (domínio,
// licença de software/SaaS, telecom — banco já aceita desde a migration
// etapa3_tipo_despesa_e_categoria_tecnologia) passa a abrir a despesa já
// com a categoria `tecnologia_assinaturas`, a mesma que
// fn_categoria_lancamento_do_item devolve no banco. Antes caía em 'outro'.
//
// v1.34.0 (demandas 4a609dbb, ed2774ee e 132ab1f8, entrega 2/3 do lote de
// 29): (1) ficha do item de controle ganha banner "Documento pendente"
// (#fic-aviso-documento-pendente, ativos-markup.js v1.47.0) quando o
// subtipo espera documento_esperado e nada foi vinculado ao item nem ao
// ativo dono — antes só existia esse aviso na tela de Subtipos, e o clique
// no alerta correspondente abria a ficha sem nenhum indicador. Depende de
// cofre-api.js v1.46.0 (select traz documento_esperado). (2) formulário de
// novo item de controle: trocar o subtipo agora sugere a antecedência
// padrão dele (aoMudarSubtipoControleForm, mesmo padrão do upload de
// documento) — antes o campo nascia sempre fixo em 7 dias. Depende de
// ativos-markup.js v1.47.0 (listener no <select>) e cofre-app.js v1.38.0
// (dispatcher). (3) cabeçalho de grupo em Configurações › Controles
// (Subtipos e Modelos) trocado de uppercase/tracking-wide pra .rz-group
// (mesmo fix já aplicado em cofre-ativos.js v1.56.0 — b46e30fa).
//
// v1.33.0 (demanda 3cc64651, pedido explícito do Nicola 23/09/2026 com
// prints do item de controle Condomínio): ⋮ de Partes do item tinha só
// "Editar partes", que abria o editor da lista (modal "Editar partes do
// item" com "+ Adicionar parte" dentro) — tela intermediária. Agora o ⋮
// tem "Adicionar parte" (form curto direto: parte + papel, grava na hora —
// abrirAdicionarParteItem), "Gerar despesa" e "Remover parte"
// (abrirRemoverParteItem). Editar os dados da parte continua sendo tocar
// na linha (form da parte direto).
//
// v1.32.0 (22/09/2026 — Fase 1 do wrapper de escrita, rollout Cofre de
// Documentos/Controles — pedido do Nicola 22/09/2026). Este é o módulo de
// maior volume de escrita do rollout (item de controle, partes, ocorrência).
// Adota emitirEscrita() (js/raiz-eventos.js, piloto em cofre-ativos.js
// v1.59.0/salvarEdicaoAtivo) em TODO ponto de escrita já identificado, ao
// lado dos window.dispatchEvent('cofre:recarregar-...') que já existiam —
// nenhum evento antigo saiu, este é adicional, pra fora do Cofre:
//   salvarPartesItemAtual      → emitirEscrita('controle', { id, acao: 'editar-partes' })
//   excluirDocumentoDoItem     → emitirEscrita('controle', { id, acao: 'excluir-documento' })
//   salvarEdicaoItem           → emitirEscrita('controle', { id, acao: 'editar' })
//   excluirItemControleAtual   → emitirEscrita('controle', { id, acao: 'excluir' })
//   salvarItemControle         → emitirEscrita('controle', { id, acao: 'criar' })
//     (só cria — não edita item existente, formulário próprio de criação —
//     por isso 'criar', não 'criar-ou-editar')
//   criarItemControleDeDocumento → emitirEscrita('controle', { id, acao: 'criar-de-documento' })
//   confirmarTratarOcorrencia    → emitirEscrita('controle', { id, ocorrenciaId, acao: 'tratar-ocorrencia' })
//   confirmarReagendarOcorrencia → emitirEscrita('controle', { id, ocorrenciaId, acao: 'reagendar-ocorrencia' })
//   confirmarEstornarOcorrencia  → emitirEscrita('controle', { id, ocorrenciaId, acao: 'estornar-ocorrencia' })
//     (`id` = id do ITEM de controle dono da ocorrência — itemEmFoco.id —
//     não o id da ocorrência em si, que vai à parte em `ocorrenciaId`; é o
//     que um listener precisa pra saber qual ficha de item recarregar)
// Config (catálogo, entidade separada 'config-controle', prioridade baixa
// per pedido — cobertas mesmo assim, deu tempo):
//   salvarSubtipoControle   → emitirEscrita('config-controle', { acao: 'criar-subtipo' | 'editar-subtipo' })
//   excluirSubtipoControle  → emitirEscrita('config-controle', { id, acao: 'excluir-subtipo' })
//   salvarModeloControle    → emitirEscrita('config-controle', { acao: 'criar-modelo' | 'editar-modelo' })
//   excluirModeloControle   → emitirEscrita('config-controle', { id, acao: 'excluir-modelo' })
//     (editarSubtipoControle/editarModeloControle, apesar do nome, só
//     preenchem o formulário — NÃO chamam a API; quem escreve de verdade é
//     salvarSubtipoControle/salvarModeloControle, cobertos acima nos dois
//     ramos criar/editar — por isso os dois "editar*" ficaram de fora)
// BUG DE OBJETO LOCAL DESATUALIZADO (mesma classe do achado em cofre-
// ativos.js v1.61.0/salvarEdicaoAtivo) — PROCURADO E NÃO ENCONTRADO aqui:
// salvarEdicaoItem() usa `item = itemEmFoco` (mesma referência de estado),
// mas nunca reabre um FORM de edição direto em cima de `item` logo depois
// de salvar — chama recarregarFichaItemControle() (await), que já REATRIBUI
// `itemEmFoco` inteiro a partir de um novo `api.buscarItemControlePorId()`
// antes de renderizar de novo. Mesmo padrão em confirmarTratar/Reagendar/
// EstornarOcorrencia. Nenhum fix de bug necessário neste arquivo.
// LISTENER NOVO (module-level, guarda por window.__rzListenerEscritaControleLigado
// — mesmo padrão do piloto em index.html): registrado logo depois do
// listener já existente de 'cofre:recarregar-partes' (mesmo bloco de
// listeners module-level) — escuta aoEscrever('controle', ...) e, se a
// Ficha do Item de Controle estiver aberta (itemEmFoco) com o MESMO id
// (ou sem id no detalhe), chama recarregarFichaItemControle() pra
// refletir sem F5.
//
// v1.31.0 (demanda be42b19f, "Padronizar componente de Parte em todo o
// app", achado do Nicola em revisão de telas, 21/09/2026) — Ficha e
// formulário de Parte (abrirFichaParte/abrirEditarParte, nascidas em
// 18/09/2026) passam a usar os componentes compartilhados novos
// (comum-partes.js + comum-endereco.js, mesmos que Configurações ›
// Partes usa em index.html): endereço vira bloco estruturado (CEP com
// busca automática, rua/número/bairro/cidade/UF) em vez de 1 campo de
// texto livre; formulário ganha profissão/estado civil, que não
// existiam aqui. abrirFichaParte() ganha um resumo de verdade (.rz-kv,
// abrirSheet) em vez de espremer tudo numa linha de subtítulo do menu de
// ações — cai pra sheetAcoes simples se abrirSheet não existir (defensivo).
// Corrigidos junto (bugs reais encontrados nesta revisão, não só o pedido
// original): api.buscarParte()/api.atualizarParte() (cofre-api.js
// v1.44.0) eram chamadas mas nunca tinham sido escritas; o clique na
// linha de uma parte (data-action="abrir-ficha-parte", 18/09/2026) nunca
// tinha um case no despachante (cofre-app.js v1.35.0) — os dois eram a
// causa real de "clicar numa parte não abre nada" e "editar abre
// formulário incompleto" (demanda). migration
// partes_endereco_estruturado_v1 (colunas endereco_rua/num/comp/bairro/
// cidade/uf/cep/codigo_ibge_municipio em `partes`, mesmo padrão de
// cofre_ativos; `endereco` texto livre mantido, não apagado — DAD-04).
//
// v1.29.0 — CORRIGIDO (achado do Nicola: "no ativo da Faria Lima tem um
// alerta vermelho mas sem item em alerta aparente") — ver changelog
// completo dentro de aplicarMotorNoChipControles(), logo abaixo. Resumo:
// fn_diario_cofre_item_vencendo (banco) devolve item dentro da janela de
// ANTECEDÊNCIA (30/60/90 dias antes, por subtipo) — não "vencendo" no
// sentido visual do resto do app. O chip "Controles" pintava .rz-warn
// (marrom) pra qualquer alerta de 0 a 30 dias, mesmo prazo que a lista de
// ocorrências (já corrigida, rodada 4) mostra calmo em azul "Em Xd" — daí
// o chip "aceso" sem nenhum item vencido/vence-hoje visível na lista.
// Confirmado ao vivo: item "Dedetização periódica" do ativo Av. Faria
// Lima, 3000 (dias=21, dentro da janela) disparava "1 vencendo" no chip.
// Só vencido/vence-hoje/pendência-sem-data acendem agora; dias>0 vira "N a
// vencer" (run/azul), sem grifo.
//
// v1.28.0 — CORRIGIDO (pedido explícito, relato do Nicola): item de
// controle recorrente com data início no passado gerava, por padrão, uma
// ocorrência já vencida ("Em atraso" no Financeiro) sem cobrança real por
// trás — flagrado num item de Dedetização anual criado com data início em
// 10/10/2025. gerarOcorrenciasHorizonte(): default de gerarDesdeInicio
// trocado de true pra false (afeta também criarItemControleDeDocumento(),
// que não passava esse parâmetro). salvarItemControle(): fallback do
// checkbox (quando ele não existir no DOM) também trocado de true pra
// false. Ver mesmo checkbox em js/ativos/ativos-markup.js v1.42.0/
// cofre.html v1.27.0 (default do próprio <input> também mudou lá).
//
// v1.27.0 — CORRIGIDO: header e VERSAO (linha ~362) estavam dessincronizados
// (header já dizia 1.26.0, VERSAO ainda '1.25.0') — corrigido de passagem.
// Padrão "há/em xx d" (mesma correção replicada em cofre-ativos.js/
// contratos.js/index.html, achado a partir de print do Nicola): 3 rótulos
// de prazo aqui (cardItemControleHtml, cabeçalho da ficha do item de
// controle, linha de ocorrência) caíam em 'warn'/marrom com número cru
// ("13 dias") pra qualquer prazo de 1 a 30 dias. REGRAS_EXPERIENCIA §9
// reserva 'warn' pra "vai virar problema" (Vencendo/Renovar) — um prazo
// ainda confortável é 'run'/azul (mesma semântica de "A vencer"/"A
// pagar"). Agora só o dia exato do vencimento (dias===0, "Vence hoje")
// fica 'warn'; o resto do prazo (1 a 30 dias) é 'run' + "Em Xd".
//
// v1.26.0 — Pedido explícito do Nicola: formulário "Modelos de item de
// controle" (abrirModelosControle/salvarModeloControle) passa a gravar
// escopo_tipo/escopo_valor (mesmo padrão de cofre_subtipo_aplicabilidade,
// migration demanda_7e6f4027_fix_modelos_escopo_v1) em vez do tipo_ativo
// antigo (coluna virou DEPRECATED — ALTER ... DROP NOT NULL, comentada no
// banco; nada foi apagado, os 11 modelos pré-existentes mantêm o valor
// histórico). 2º seletor novo no form, "Tipo específico" (#modelo-tipo-
// especifico, espelha o de cofre-ativos.js) — vazio = modelo vale pra
// toda a categoria (escopo_tipo='categoria'); com um tipo escolhido,
// escopo_tipo='codigo'. TIPOS_ATIVO_ORDEM (14 valores misturados,
// categoria + código, com histórico de gap — ver v1.21.2 abaixo) vira
// CATEGORIAS_MODELO_ORDEM (as 8 categorias reais).
// QUA-01 (root-cause, mesmo padrão em outro lugar): achei DOIS
// consumidores do tipo_ativo antigo além do form — renderizarModelosControle
// (agrupamento da lista) e renderizarModelosSugeridosForm (pills "Usar
// modelo" no form de item de controle, comparando m.tipo_ativo ===
// ativo?.tipo_ativo). O 2º estava silenciosamente quebrado pra todo modelo
// de escopo específico (TUF, revisão/seguro de blindado, seguro de obra
// de arte, nota fiscal de terreno — 5 dos 11) desde que ativo.tipo_ativo
// passou a usar só as 8 categorias novas: a comparação nunca batia, pill
// nunca aparecia, sem erro nenhum. Corrigido junto — ambos agora resolvem
// via categoriaDoModelo()/modeloAplicaAoAtivo() (novas), que tratam
// escopo_tipo='codigo' resolvendo a categoria/código real do ativo pelo
// catálogo (listarTiposPorCategoria, cofre-validacoes.js). Espelha em 2
// arquivos de markup (cofre.html + js/ativos/ativos-markup.js — HTML
// duplicado entre App e Cofre standalone, prática já documentada no
// cabeçalho de cofre.html) e 1 case novo no dispatcher (cofre-app.js).
//
// v1.25.0 — PLANO_IMPLEMENTACAO v1.0, etapa E14.4 ("A5"), Onda 12
// (decisão do Nicola: "vamos fazer a 15.2 e a migração dos dados").
// Contatos unificado com Partes — não existiam 2 conceitos, existiam 2
// TABELAS pro mesmo conceito. Removidos: modal-editar-contato-item e as
// 6 funções que o operavam (abrir/fechar/salvar/excluir/criar-novo),
// estado contatosDoItemAtual/contatoEmEdicaoId, o card "Contatos" da
// ficha. montarPartesItemControle() ganhou o atalho de WhatsApp que só
// Contatos tinha (fn_partes_do_item_controle agora devolve whatsapp/
// email). acionarParteItemDireto substitui acionarContatoItemDireto.
// 12 registros reais (2 clientes) já migrados pra partes/partes_papeis
// em migration própria — cofre_contatos_acionamento não foi apagada
// (histórico), só parou de ser lida/escrita.
//
// v1.24.0 — PLANO_IMPLEMENTACAO v1.0, etapa E14.2 ("A16"), Onda 12.
// Parcelas (Parcelas/Dias entre parcelas) e recorrência são conceitos
// que não deviam se misturar — parcelamento é de evento ÚNICO (ex.:
// IPVA 3x); item recorrente sem fim usa "Repetir a cada". Até aqui nada
// impedia marcar os dois juntos (0 itens reais nesse estado hoje,
// conferido antes de mexer — é prevenção, não limpeza de dado). Campo
// de parcelas some quando "Repetir a cada" está preenchido
// (aoMudarFrequenciaItemControle, novo), resetando pro padrão (1/30)
// pra nunca submeter parcela escondida.
//
// v1.23.0 — PLANO_IMPLEMENTACAO v1.0, etapa E14.1 ("A4"), Onda 12.
// Checkbox novo no form de criar item de controle: "Gerar também as
// ocorrências passadas". Achado ao investigar: o mecanismo que realmente
// gera ocorrência retroativa não é o cron do banco
// (fn_cofre_gerar_proximas_ocorrencias, ajustado à parte) — é
// gerarOcorrenciasHorizonte() aqui mesmo, chamado na hora de criar o
// item. Quando data início está no passado (obrigação antiga sendo
// cadastrada agora) e a pessoa desmarca a caixa, a geração pula direto
// pra 1ª ocorrência >= hoje, mantendo a fase do ciclo (ex.: sempre dia
// 15). Coluna nova gerar_desde_inicio (migration e14_1_gerar_desde_
// inicio_v1) — default true preserva o comportamento de sempre pra todo
// item existente.
//
// v1.22.0 — PLANO_IMPLEMENTACAO v1.0, etapa E14.3 ("A15"), Onda 12
// (decisão do Nicola: parte padrão vale pra TODAS as empresas —
// prefeitura, órgão recolhedor — cadastrada uma vez na Raiz Matriz,
// materializada por tenant no primeiro uso). abrirEditarPartesItem()
// sugere a parte padrão do subtipo (quando existe pro município/UF do
// ativo) só se o item ainda não tem nenhuma parte — botão "Usar"
// materializa (cofre-api.js) e adiciona como linha, mesmo fluxo de
// salvar de sempre. PAPEIS_PARTE_ITEM ganha 'orgao_recolhedor' (CHECK do
// banco estendido — nenhum dos 12 valores antigos encaixava).
// REGRAS §19 — desvio justificado: botão "Usar" reaproveita a classe do
// "Adicionar parte" logo abaixo (bg-slate-100/text-slate-600/border-
// slate-300/rounded-full), que o verificador já sinaliza como padrão
// "Mais ações" aposentado (§6) — city §6 é sobre menu de mais ações
// virar sheet, não sobre chip pequeno; usei a mesma classe do botão
// vizinho de propósito (2 chips pequenos no mesmo modal, mesma
// hierarquia visual) em vez de inventar um 3º estilo.
//
// v1.21.2 — PONTE DE COMPATIBILIDADE pra E4.2 fatia B (junto com
// cofre-validacoes.js v1.4.0/cofre-ativos.js v1.32.1). TIPOS_ATIVO_ORDEM
// nunca teve aeronave/embarcacao/colecao_bem_valor (gap pré-existente,
// não causado por hoje) — ficavam invisíveis na tela "Modelos de item de
// controle" (guarda `if (grupos[m.tipo_ativo])` esconde em vez de
// quebrar). Achei o gap agora porque o modelo de TUF que acabei de criar
// (tipo_ativo='embarcacao') ficaria invisível nessa tela. Lista completa
// agora: os 11 valores antigos + as 4 categorias novas da fatia B.
//
// v1.21.1 — FIX (achado do Nicola em teste real): ROTULO_ALERTA_CHIP tinha
// 6 entradas de tipos que não são item de controle (reajuste, contrato
// encerrando/assinando/vendido, atraso, documento sem vínculo) — nunca
// deveriam ter sido rótulo do chip "Controles". Reduzido aos 2 tipos
// corretos, acompanhando o filtro novo em cofre-ativos.js v1.31.3.
//
// v1.21.0 — PLANO_IMPLEMENTACAO v1.0, etapa E11 (chip do ativo com fonte
// única). Achado pelo Nicola em teste real: ativo com bolinha vermelha e
// contador 0, sem alerta visível na ficha. Causa: duas contas decidiam a
// mesma bolinha. atualizarEstadoChipControles olhava só data de vencimento
// dos itens e escrevia "Em dia"; aplicarAlertaMotorNoChipControles acendia
// vermelho por qualquer alerta do Motor e nunca apagava. Depois da E2.3, o
// Motor passou a enxergar também alerta de contrato e financeiro no ativo —
// por isso a bolinha acendeu em ativo sem nenhum item de controle.
// Agora: a conta local escreve só o número; o Motor decide cor e texto, e o
// cabeçalho diz o MOTIVO ("1 documento pendente", "2 vencendo") em vez de só
// uma data. A regra "só acende, nunca apaga" saiu — apagar é o objetivo.
//
// v1.20.3 — PLANO_IMPLEMENTACAO v1.0, etapa E1: a tela de cadastro de
// subtipos passa a agrupar também `taxa` e `documento`, e despesa gerada a
// partir de um item de `taxa` entra como tributo. Acompanha a migration
// catalogo_alertas_subtipos_v1 (tipo `taxa` criado; Condomínio e
// Marina/guarda movidos de `tributo` para `taxa`).
//
// v1.20.2 — PLANO_IMPLEMENTACAO v1.0, etapa E0.2 (achado A8): o seletor de
// subtipo do formulário de item de controle passa a mostrar só os subtipos
// aplicáveis ao tipo do ativo em foco (embarcação: 12, não 109), via
// api.listarSubtiposControle(clienteId, tipoAtivo) — cofre-api.js v1.25.0.
// Cache próprio (subtiposDoAtivoCache); subtiposCache continua sendo o
// catálogo completo das telas de cadastro de subtipos e de modelos. Subtipo
// com tipo_ativo_aplicavel nulo continua aparecendo, e um subtipo vindo de
// modelo nunca some do seletor por causa do filtro. Falha na busca filtrada
// degrada para o catálogo completo, nunca trava o formulário.
//
// v1.20.1 — A.10: criarItemControleDeDocumento recebe valorPrevisto/
// parcelas/parcelaIntervaloDias (upload com IA, cofre-documentos.js 2.10.0)
// e repassa pro item, igual ao formulário manual.
//
// v1.20.0 — A.10 (ocorrência ↔ despesa + Encerrar × Excluir, PROPOSTA v1.0
// §4.1 / v2.2). Banco já no ar (triggers). Nesta tela:
//   · Formulários (novo/editar): Valor previsto · Parcelas · Dias entre
//     parcelas (campos em ativos-markup.js 1.25.0). Com valor, cada ocorrência
//     prevista nasce com despesa prevista no Financeiro; parcelas>1 = irmãs.
//   · Ficha: "Valor previsto" nos dados; ocorrência mostra o valor (real ou
//     previsto) quando houver.
//   · Menu Dados: "Encerrar item" (neutro — some daqui pra frente, histórico
//     fica; abertas e despesas previstas somem, trigger) e "Excluir item de
//     vez" (bad — DELETE; o banco bloqueia se houver ocorrência tratada, com
//     a mensagem "Reabra-as antes de excluir"). Ficha de item encerrado:
//     status "Encerrado", ações Reabrir / Excluir de vez, sem Editar.
//   · Card Controles: chips Ativos / Encerrados (só aparecem se houver
//     encerrado) — lista carrega tudo e filtra local (filtrarControles).
//
// v1.19.0 — OCORRÊNCIA FANTASMA NO INÍCIO DA VIGÊNCIA (achado do Nicola:
// apólice 19/08/2026–19/08/2027 nasceu com 2 ocorrências, uma "vencida há
// 22d" em 19/08/2026). Causa: gerarOcorrenciasHorizonteRetroativo() anda
// pra trás a partir do fim, ciclo a ciclo, até 120 dias atrás — e, num
// item anual, fim − 1 ano cai exatamente no INÍCIO da vigência, que não é
// um vencimento. Dois consertos:
//   - o gerador retroativo nunca cria ocorrência em data ≤ data_base
//     (o início da vigência não é ciclo vencido);
//   - item nascido de documento (criarItemControleDeDocumento) cria SÓ a
//     ocorrência do vencimento — o próximo ciclo é gerado pelo banco
//     quando esse fechar, como em qualquer item recorrente.
//
// Versão anterior: 1.18.0 · 09/09/2026
//
// v1.18.0 (A.13) — criarItemControleDeDocumento(): item de controle criado a
// partir da confirmação do upload (cofre-documentos.js v2.0.0), pelo MESMO
// caminho de salvarItemControle() — criarItemControle → histórico →
// ocorrências no horizonte (retroativo quando tem data fim) → log. Aceita
// ativo OU contrato (CHECK cofre_itens_controle_entidade_check), grava
// origem='documento' e o reforço novo alerta_repeticao_dias (migration
// a12_a13_categorias_gabarito_padroes_subtipos_v1; diario-eventos 1.12 lê).
// Chamada por import dinâmico (cofre-documentos ↔ cofre-controles já se
// importam; dinâmico evita ciclo no boot).
//
// Versão anterior: 1.17.0 · 06/09/2026
//
// v1.17.0 — log_acessos com códigos do catálogo (cofre.controles.criar/desativar/editar) — fase F.
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

---

## `js/cofre-documentos.js`

//
// Versão anterior: 2.27.0 · 07/10/2026
//
// v2.27.0 (demanda 9ddb9f34, sessão 20261007-0059-upload-ia; fatia U1 aprovada pelo Nicola 07/10 00:59,
// protótipo PROTOTIPO_LEITURA_IA_RAIZ v1.0.0) — leitura com IA com tela travada e resultado na tela:
//   (a) Do arquivo escolhido até o resultado, o sheet de envio não fecha: sem ✕, o fundo não fecha e
//       os sheets de envio e do "Confira" passam a viver no <body> (o voltar do celular e a troca de
//       aba não os escondem mais). O fundo do "Confira" também deixa de fechar (só Salvar/Cancelar):
//       fechar por ali deixava o arquivo solto no Storage.
//   (b) Passos visíveis (Conferindo · Enviando · Lendo com IA · Preparando a conferência), tempo
//       correndo, aviso para manter o app aberto e tela acesa (Wake Lock, quando o aparelho tem).
//   (c) Resultado sempre na tela, sem toast: Pronto (tipo lido, segurança, tempo; "Conferir e
//       salvar"), Não deu para ler (motivo; Preencher eu mesmo · Outra foto · Pedir para a equipe na
//       configuração inicial · Cancelar o envio), Interrompida (conexão caiu ou mais de 90 s; Ler de
//       novo sem reenviar o arquivo) e Envio não concluído. Resposta que chega depois dos 90 s vira
//       Pronto sozinha. Cancelar remove o arquivo do Storage.
//   (d) "Reler como" trava o "Confira" durante a releitura e mostra o resultado na própria tela.
//
// Versão anterior: 2.26.0 · 06/10/2026
//
// v2.26.0 (frente D, fatia D2 — demandas 860233ca e be7cdd7c; sessão 20261006-2348-setup-d2; "Estou de
// acordo" do Nicola 06/10 23:48, plano PLANO_INDICADORES_E_SETUP_DOCUMENTOS v1.1.0) — o leitor do Cofre
// passa a servir também a configuração inicial (js/configuracao-inicial.js):
//   (a) abrirUploadConfiguracao(tipo, aoTerminar): o mesmo picker/"Confira", marcado com o tipo que a
//       pessoa disse que ia mandar. Salvar, descartar ou cancelar devolvem o controle à tela da
//       configuração. Depois de salvar, o documento é ligado ao serviço "Configuração inicial"
//       (fn_configuracao_inicial_documento) — é o que alimenta o "esperado × lido" do Gestão.
//   (b) Leitura fraca na configuração (sem tipo, "outro", leitura que falhou ou confiança < 75%):
//       bloco no topo do "Confira" com Tentar outra foto · Pedir para a equipe Raiz · Descartar com
//       motivo. Pedir para a equipe abre chamado (fn_suporte_ticket_documento_abrir; sem leitura,
//       fn_demanda_criar de suporte + vínculo do documento). Descartar grava a leitura como rejeitada e
//       o motivo (fn_cofre_extracao_descartar); o arquivo sai do Storage e o documento fica excluído.
//       Lista de ativos vai sempre para a equipe Raiz cadastrar.
//   (c) be7cdd7c — contrato de locação lido (em QUALQUER envio): o "Confira" pergunta "Criar o
//       contrato" ou "Só guardar no ativo". Criar salva o documento sem item de controle próprio e abre
//       o formulário de contrato preenchido (contratos.js, abrirNovoContratoDoDocumento); quando o
//       contrato é salvo, o documento é anexado a ele (evento cofre:vincular-documento).
//   (d) Documento de pessoa (RG/CIN, CNH, passaporte…) já vem com "Restrito" marcado; o banco força o
//       mesmo (gatilho trg_cofre_documento_restrito_pessoa), em qualquer canal.
//
// Versão anterior: 2.25.0 · 04/10/2026
//
// v2.25.0 (catálogo único 2b-3c, demanda 2923ff4d, sessão 20261004-1815-catalogo-2b3c; plano 2b-3 aprovado pelo Nicola 04/10) —
// o documento passa a mostrar o caminho da árvore. cofre_categorias virou a lista de 15 ESPÉCIES
// (migration catalogo_tipos_categorias_v5); o nó (tipo › subtipo) vem do tipo de documento e o
// contexto vem do vínculo. (a) "Confira": linha de chips #uc-caminho — vínculo · tipo de ativo ·
// tipo › subtipo · espécie — atualizada ao trocar tipo, espécie ou vínculo; o select de espécie
// deixa os grupos por bem (imóvel/veículo/...) e lista as espécies na ordem do catálogo.
// (b) Ficha: chips #fd-caminho com tipo · subtipo · espécie no lugar do nome solto da categoria.
// (c) Sheet "Categorizar" vira "Espécie do documento". Sem style inline no código novo (REGRAS §17).
//
// Versão anterior: 2.24.0 · 04/10/2026
//
// v2.24.0 (UX F1.4a, demanda c71f617c, sessão 20261003-1707-ux-base; aprovada pelo Nicola 04/10 15:46) —
// esqueleto no lugar de "Carregando..." na lista de documentos arquivados.
//
// Versão anterior: 2.23.0 · 04/10/2026
//
// v2.23.0 (F0.2b do PLANO_UX, demanda 9e4aca28, sessão 20261003-1707-ux-base; UXR-29/30) — zero diálogo nativo: 4 confirm() viram perguntar() do cofre-ui.
// Tirar documento da empresa (desvincular) não pergunta mais e ganha "Desfazer".
//
// Versão anterior: 2.22.0 · 03/10/2026
//
// v2.22.0 (F0.3, demanda 29bed5eb, sessão 20261003-1707-ux-base, "de acordo" do Nicola 03/10 23:57) — texto interno sai da tela: o aviso de documento vencido deixa de citar
// a decisão de projeto "(D10)".
//
// Versão anterior: 2.21.0 · 22/09/2026
//
// v2.21.0 (22/09/2026 — Fase 1 do wrapper de escrita, rollout Cofre de
// Documentos/Controles — pedido do Nicola 22/09/2026). Este é o módulo de
// maior volume de escrita do rollout (upload, categorização, editar nome,
// excluir, vincular/excluir arquivado). Adota emitirEscrita() (js/raiz-
// eventos.js, piloto em cofre-ativos.js v1.59.0/salvarEdicaoAtivo) em TODO
// ponto de escrita de documento já existente, sempre ao lado do
// window.dispatchEvent('cofre:recarregar-documentos') que já havia — nenhum
// evento antigo saiu, este é adicional, pra fora do Cofre:
//   salvarUpload/salvarConfirmacaoUpload  → emitirEscrita('documento', { id, acao: 'criar' })
//   editarNomeDocumentoAtual              → emitirEscrita('documento', { id, acao: 'editar-nome' })
//   categorizarDocumentoAtual             → emitirEscrita('documento', { id, acao: 'categorizar' })
//   excluirDocumentoAtual                 → emitirEscrita('documento', { id, acao: 'excluir' })
//   vincularDocumentoArquivado            → emitirEscrita('documento', { id, acao: 'vincular' })
//   excluirDocumentoArquivadoDeVez        → emitirEscrita('documento', { id, acao: 'excluir-definitivo' })
//   salvarCategoria                       → emitirEscrita('config-documento', { acao: 'criar-categoria' })
//     (achado ao ler: isto grava uma CATEGORIA do catálogo/configuração —
//     api.criarCategoria — não a categorização de um documento específico;
//     por isso entidade separada 'config-documento', não 'documento'.)
// BUG DE OBJETO LOCAL DESATUALIZADO (mesma classe do achado em
// cofre-ativos.js v1.61.0) — PROCURADO E NÃO ENCONTRADO aqui:
// editarNomeDocumentoAtual()/categorizarDocumentoAtual() já faziam
// `d.nome_exibicao = nome`/`d.categoria_id = c.id` no objeto local (mesma
// referência de estado.documentos) ANTES desta rodada — já sincronizavam
// na hora, sem esperar o recarregamento assíncrono. Nenhum fix de bug
// necessário neste arquivo.
// LISTENER NOVO (module-level, guarda por window.__rzListenerEscritaDocumentoLigado
// — mesmo padrão do piloto em index.html): escuta aoEscrever('documento', ...)
// logo depois do listener já existente de 'cofre:recarregar-documentos' (ver
// abaixo) — não há um único "ponto de montagem" da tela de Documentos (Home/
// lista/ficha variam conforme a navegação do Cofre, cofre-navegacao.js), então
// o alvo escolhido foi o mesmo já coberto por aquele listener antigo (box
// "Documentos da empresa", fora da árvore de telas do Cofre) + a Ficha do
// Documento (#modal-ficha-doc), se estiver aberta com o MESMO id que escreveu
// — reabre via abrirFichaDocumento(docAtualId), com guarda de modal visível
// pra não REABRIR uma ficha que a pessoa já fechou.
// FORA DO ESCOPO desta rodada (achado ao ler, mas não tocado — ficam pra uma
// rodada dedicada futura, pra não expandir o escopo pedido): anexarArquivoEntidade()
// (anexo programático, ex.: reajuste contratual) e confirmarVincularAgora()
// (fluxo "Vincular agora" de documento em triagem) também escrevem documento/
// vínculo mas não estavam na lista desta entrega.
//
// v2.19.0 — 2 achados do Nicola:
//   (1) "o menu de editar o nome do arquivo está ficando sob a tela do
//   anexo" — editarNomeDocumentoAtual() (v2.18.0, abaixo) abre por
//   abrirSheetForm/#rz-veil (z-index:90, index.html); a Ficha do Documento
//   (#modal-ficha-doc) é um .modal-overlay (z-index:96) — o sheet nascia
//   ATRÁS do modal ainda aberto. Corrigido subindo #rz-veil pra z-index:97
//   (index.html) — acima de qualquer .modal-overlay, sem mexer nos outros
//   overlays (spinner/toast/confirmação, 200-500, continuam por cima do
//   sheet, como já eram).
//   (2) mesma classe de bug do chip "Controles" da Faria Lima (ver
//   cofre-controles.js v1.29.0) achada aqui: fraseVencimento()/
//   corFraseVencimento() (usadas por alertaCardHtml(), tela de Alertas —
//   #alertas-lista) ainda no padrão antigo — "Falta(m) X dia(s)!"/"Venceu
//   há X dia(s)!" (verboso) e âmbar pra qualquer prazo de 0 a 30 dias,
//   nunca alinhado com o padrão "há/em xx d" já unificado em
//   linhaAlertaHtml (index.html)/ativoCardHtml (cofre-ativos.js) desde a
//   rodada 4. Reescritas: só dias<0 é vermelho (vencido) e dias===0 é
//   âmbar (vence hoje); qualquer prazo positivo vira "Em Xd" azul, sem
//   teto de 30 dias.
//
// v2.18.0 (pedido explícito, 18/09/2026: "Nos detalhes do arquivo deve ser
// possivel editar o nome. Tanto nos anexos de contrato, quanto ativos, itens
// de controle e os demais") — editarNomeDocumentoAtual() nova: lapiseira ao
// lado do #fd-nome na Ficha do Documento abre o mesmo abrirSheetForm de
// sempre (1 campo "Nome de exibição *", mesma gramática .rz-f de
// alternarEditarAtivo/fa-editar-nome em cofre-ativos.js), valida
// não-vazio/≤200 chars, grava via api.atualizarDocumento() — já genérica,
// nenhuma função nova em cofre-api.js — e recarrega a ficha + as listas
// (cofre:recarregar-documentos). ACHADO DE ARQUITETURA (investigado antes de
// codar): abrirFichaDocumento()/#modal-ficha-doc é UM SÓ fluxo pros 3
// contextos que o Nicola citou (anexo de contrato, de ativo, de item de
// controle — todos abrem a mesma ficha por aqui), então isto já cobre os 3
// de uma vez. O MARKUP do modal, porém, está duplicado em 2 lugares
// (cofre.html e js/ativos/ativos-markup.js, mesmos ids) — o botão novo
// entrou nos dois (ver changelog de cada um).
//
// v2.17.0 — box "Documentos da empresa" na aba Minha Empresa do App (pedido
// explícito, mesmo relato do Nicola da v2.16.0: "no menu empresa do app,
// deve ter um box pra anexar documentos... com as mesmas funções de um
// documento de contrato ou de ativo" — escolheu o padrão "Box simples",
// igual ao do Item de Controle, via AskUserQuestion). Novo:
// documentosDaEmpresa()/renderizarDocumentosEmpresa()/
// carregarNovoDocumentoEmpresa()/excluirDocumentoDaEmpresa()/
// montarBoxDocumentosEmpresa() (export, chamado por
// dev_carregarDadosEmpresa() em index.html). Vínculo
// entidade_tipo='empresa'/entidade_id=null — o mesmo padrão já usado pelo
// "Vincular a › Empresa" do upload livre, nenhuma migration nova. Excluir
// só desvincula (api.removerVinculo), documento nunca é apagado de vez.
//
// ACHADO DE ARQUITETURA (investigado antes de codar, pra não montar em
// cima de DOM que não existe): tab-minha-empresa é montada por
// dev_carregarDadosEmpresa() em index.html, no MESMO nível de tab-ativos —
// cada aba carrega seu próprio módulo sob demanda, independente uma da
// outra (index.html/switchTab()). Isso quer dizer que a pessoa pode abrir
// "Minha empresa" sem nunca ter tocado em Ativos, e nesse caso o Cofre
// (nav.bootstrap(), cofre-app.js) nunca rodou: `estado.clienteId`/
// `estado.pessoa` continuam null, e a Ficha do Documento (fd-*, DOM só
// injetado pelo módulo Ativos) nem existe ainda. O box do Item de
// Controle (cofre-controles.js) nunca precisou lidar com isso porque só
// existe DENTRO da ficha do Cofre, depois do Cofre já ter dado boot.
// Por isso este box: (1) usa CLIENTE_ID_SUPABASE/pessoaIdLogada — globais
// do script clássico de index.html, não `estado` — mesmo padrão que
// contratos.js já usa (única outra aba de nível de App com box de
// documento); (2) abre o arquivo com URL assinada direto
// (api.gerarSignedUrl) em vez da Ficha do Documento; (3) escuta
// 'cofre:recarregar-documentos' com listener PRÓPRIO (checando se
// #me-documentos existe no DOM), em vez de depender do listener central
// de cofre-app.js (cujo dispatcher `[data-action]`/`telaAtual` também só
// existe depois do Cofre ter dado boot) — mesma solução, mesmo motivo, que
// contratos.js já usa pro card Anexos do Contrato.
//
// v2.16.0 — 2 achados reais do Nicola (relato + 3 prints do sheet de upload,
// 18/09/2026):
// (1) "lista grande e estranha" no seletor Tipo de documento (uc-tipo-doc) —
//     causa: montarSelectTipoDoc() e preencherSubtiposControleUpload()
//     filtravam "Deste tipo de ativo" pelo campo antigo e quase sempre vazio
//     cofre_controle_subtipos.tipo_ativo_aplicavel (texto livre, "lista
//     curta e antiga" — nota já existente no form de Subtipos do Gestão);
//     vazio era tratado como "serve pra qualquer ativo", então o filtro não
//     filtrava nada de fato. Os 2 agora usam a fonte real,
//     cofre_subtipo_aplicabilidade (mesma tabela da aba Aplicabilidade do
//     Gestão), via api.listarAplicabilidadeSubtipos() nova (cofre-api.js
//     v1.38.0) + helper subtipoAplicaAoTipoAtivo(). Efeito colateral
//     esperado: subtipo ainda sem nenhum vínculo cadastrado na aba
//     Aplicabilidade passa a cair em "Outros" (antes entrava errado em
//     "Deste tipo de ativo") — a lista tende a encolher e ficar correta à
//     medida que a aba Aplicabilidade for preenchida, não é regressão.
//     Escopo por tipo de ativo específico (escopo_tipo='codigo') continua
//     fora — são raros e exigiriam também o tipo_detalhe_id do ativo, que
//     este fluxo não carrega; registrado como pendência (ver ENTREGA).
// (2) "categoria › subtipo, qualquer item que escolho ele trava no outro" —
//     causa: aplicarPadroesCategoriaUpload(), quando nenhum subtipo estava
//     selecionado, delegava pra aplicarSubtipoUpload(primeira), que
//     recalcula uc-categoria a partir do subtipo/IA e SOBRESCREVE o select —
//     mesmo quando quem tinha acabado de mudar era a própria Categoria, à
//     mão. A categoria escolhida "voltava" sozinha pro valor anterior.
//     Corrigido: sem subtipo selecionado, só reaplica os padrões da
//     categoria atual — não mexe mais no valor do select.
//
// v2.15.0 — item 5 do mesmo relato do Nicola (v2.14.0, abaixo): "Vincular a"
// (upload livre e "Vincular agora" da ficha) mostrava "Imóvel" — nomenclatura
// legada, buscar por "Ativo controlado" já cobre imóvel — e não tinha
// "Contrato", que já é um vínculo válido no banco (cofre_documento_vinculos,
// vinculoPermiteControle() já reconhecia 'contrato') mas nunca teve busca de
// candidato na UI. aoMudarTipoVinculoUpload/aoMudarTipoVinculoAgora e
// buscarCandidatosUpload trocam 'imovel' por 'contrato' (busca por
// locatário, api.buscarCandidatosContrato — cofre-api.js v1.37.0);
// rotuloCandidatoVinculo() nova, fatora a montagem do texto do candidato
// (antes duplicada nos 2 fluxos). Acompanha ativos-markup.js v1.40.0 (troca
// das opções nos 2 <select>).
//
// v2.14.0 — 3 achados reais do Nicola (relato + prints, 17/09/2026), todos
// no fluxo de documentos:
// (1) "Controlar vencimento" ficava travado sem poder marcar mesmo depois
//     de vincular a um ativo/contrato. Causa: aplicarPadroesCategoriaUpload()
//     só recalculava o disabled do checkbox dentro do ramo "nenhum subtipo
//     selecionado ainda" (via aplicarSubtipoUpload) — no caso comum (IA já
//     classifica o tipo do documento antes do usuário escolher o vínculo),
//     esse ramo nunca era tocado e o disabled ficava congelado no estado de
//     quando o vínculo ainda era nulo/triagem. Lógica extraída pra
//     atualizarDisponibilidadeControleUpload() (nova), chamada dos dois
//     lugares agora.
// (2) Ficha de um documento já existente, aberta pela aba Ativos > Anexos
//     (sem passar antes pelo upload nem pela navegação do módulo Cofre —
//     os 2 únicos lugares que garantiam estado.categorias carregado):
//     mostrava "Sem categoria" mesmo em documento COM categoria salva no
//     banco (confirmado direto no banco — categoria_id correto,
//     estado.categorias é que estava vazio nessa tela). Mesma causa
//     quebrava o sheet "Categorizar" (abria sem nenhuma opção — parecia
//     "muito pequeno", na real é lista vazia). abrirFichaDocumento() e
//     categorizarDocumentoAtual() ganham o mesmo guard de carregamento que
//     o fluxo de upload já tinha (carregarApoioUpload()).
// (3) NÃO é bug de código, é gap de catálogo (achado, não corrigido aqui):
//     "Minuta" e "Matrícula" existem como CATEGORIA (cofre_categorias:
//     contrato.minuta, imovel.matricula — por isso aparecem no seletor
//     manual de categoria), mas não têm nenhum SUBTIPO em
//     cofre_controle_subtipos — o classificador de IA só escolhe entre
//     subtipos, nunca entre categorias direto, então esses 2 documentos
//     nunca saem de "Não classificado"/categoria "Outros" sozinhos. Ver
//     ENTREGA desta rodada, seção do catálogo.
//
// v2.13.0 — PLANO_IMPLEMENTACAO v1.0, etapa E14.4 ("A5"). O upload de
// documento com sugestão de contato por IA gravava direto em
// cofre_contatos_acionamento, ANTES do item de controle existir (então
// nunca vinculava por item_controle_id de verdade — achado ao mexer
// aqui). Agora: contato marcado vira parte (find-or-create por nome,
// api.encontrarOuCriarParte) na hora, e o vínculo com o item
// (partes_papeis) só é gravado DEPOIS que o item nasce, reordenado pra
// isso. acionarContatoAlerta não mudou uma linha — listarContatosPorItemControle
// trocou de fonte por baixo, ela só lê nome/whatsapp/email, que
// continuam existindo.
//
// v2.12.0 — BUG REAL (achado 10/09, versão só bumpada agora — tinha
// deixado passar): abrirDocumentosArquivados() usava window.abrirModal,
// que NUNCA existiu, e caía num aviso "Disponível só dentro do app
// principal". O abrirModal correto já estava importado no topo deste
// arquivo e é usado em outras 5 chamadas aqui mesmo — só esta fugia do
// padrão. Por isso a tela de Documentos arquivados nunca abria.
//
// v2.11.0 — Documentos arquivados (pendência do Nicola): tela nova
// (modal-documentos-arquivados, aberta pelo menu Conta › Cofre ›
// "Documentos arquivados") listando status='excluido' — Restaurar (volta
// pra ativo), Vincular agora (reaproveita o mesmo fluxo de "em triagem" da
// ficha do documento) e Excluir de vez (apaga do Storage + a linha, com
// guarda de confirmação; loga cofre.excluir_de_vez antes). BUG FIX: o card
// "N documento(s) pendente(s) de vínculo" da Visão Geral contava documentos
// arquivados na consulta (sem filtrar status), por isso o número nunca
// batia com a lista — corrigido em index.html (query com .eq('status',
// 'ativo')), não é código deste arquivo.
//
// v2.10.0 — A.10 (pedido do Nicola: "muitas vezes já aparece se o valor do
// documento foi parcelado — aproveite pra extrair a configuração correta").
// Bloco "Controlar vencimento" ganha Valor previsto/Parcelas/Dias entre
// parcelas (ativos-markup.js 1.26.0), sugeridos por sugerirValorParcelasIA()
// a partir dos campos já extraídos pela IA para o subtipo: valor total
// (campo "valor"/"premio_total"/"valor_financiado", nessa ordem), parcelas
// (campo "parcelas" quando >1) e o intervalo entre elas (calculado de
// "primeira_parcela"/"ultima_parcela" quando o subtipo os tem — ex.
// financiamento_veiculo; senão 30 dias, mesmo padrão do item manual). Tudo
// editável antes de salvar, como os demais campos do documento. Passa a
// gravar valor_previsto/parcelas/parcela_intervalo_dias no item —
// criarItemControleDeDocumento (cofre-controles.js) e criarItemControle
// (cofre-api.js) recebem os campos novos.
//
// v2.9.0 — "IA indisponível agora" sem motivo (Nicola, 10/09): o log da
// Edge Function mostrou 2 respostas 400 "storage_path inválido" sem
// nenhum erro real — sinal de estado.clienteId vazio no instante do
// upload (corrida de navegação). Guarda nova: processarArquivoUpload
// aborta ANTES de montar o caminho se a empresa não estiver carregada,
// com mensagem clara e "Tentar de novo" — em vez de subir com um caminho
// quebrado e falhar depois, muda, lá na IA. cofre-extrair-documento 1.7
// passou a logar o motivo quando isso acontece.
//
// Versão anterior: 2.8.0 · 10/09/2026
//
// v2.8.0 — 2 achados do teste da apólice (Nicola, 10/09):
//   - VALORES em "Dados do documento" sem formatação (321635): agora todo
//     campo tipo 'valor' aparece como "3.216,35" (pt-BR, 2 casas) num input
//     de texto com teclado decimal, e é convertido de volta pra número ao
//     salvar — aceita "3.216,35", "3216,35" e "3216.35". Vale pra qualquer
//     tipo/subtipo do catálogo (a formatação é pelo tipo do campo, não pelo
//     documento). O motor 1.3 também parou de mandar "321635".
//   - PARTES não viravam contatos: o motor 1.3 passa a derivar partes dos
//     campos (seguradora, corretor, segurado…) e aqui elas vêm marcadas por
//     padrão (papéis conhecidos), gravadas em cofre_contatos_acionamento.
//
// Versão anterior: 2.7.0 · 10/09/2026
//
// v2.7.0 (A.24) — PDF PROTEGIDO POR SENHA. Antes de subir, o app detecta
// (pdf.js) e pede a senha no próprio sheet; abre no celular e gera uma cópia
// sem senha só pra leitura da IA (sobe em tmp-ia/, apagada depois). O
// ORIGINAL protegido é o que fica no Cofre. A senha nunca sai do aparelho e
// não é gravada. Senha errada → pede de novo; "Enviar sem ler" guarda o
// original sem IA. cofre-imagem.js 1.1.0 faz a parte de PDF.
//
// Versão anterior: 2.6.0 · 10/09/2026
//
// v2.6.0 — 2 achados do Nicola (10/09):
//   - "Tirar outra foto" abria a CÂMERA mesmo quando o arquivo tinha vindo
//     do seletor de arquivos. Agora o gate lembra a origem: vindo de
//     Arquivo, o botão vira "Escolher outro arquivo" e reabre o seletor.
//   - "Failed to fetch" no upload de PDF pelo Android: tratado em
//     cofre-api 1.20.0 (arquivo lido pra memória antes de subir, mime por
//     extensão, 1 retry); aqui a mensagem ficou em português e o quality
//     gate/hash reaproveitam a mesma leitura.
//
// Versão anterior: 2.5.0 · 10/09/2026
//
// v2.5.0 — 3 ajustes finos do teste do Nicola (10/09):
//   - "Enviar assim mesmo" no quality gate vira botão secundário, no mesmo
//     padrão de "Tirar outra foto" (era um link sublinhado miúdo);
//   - criar ativo a partir do documento passa a permitir "Controlar
//     vencimento" na MESMA confirmação: o ativo nasce ao salvar, e o item de
//     controle nasce em seguida, vinculado a ele — tudo num toque;
//   - o erro "cofre_itens_controle_tipo_check" ao controlar uma CNH era do
//     banco (CHECK sem 'documento') — unificada por migration.
//
// Versão anterior: 2.4.0 · 10/09/2026
//
// v2.4.0 — LEITURA QUE FALHA NÃO PODE PARECER "documento não reconhecido"
// (teste do Nicola: CRLV e CNH classificados certo, tela toda vazia em
// "Não classificado"). Quando o motor classifica mas a extração falha, ele
// devolve subtipo_codigo='outro' com o nome do tipo real. Agora o app:
//   - detecta esse caso (classificacao.codigo real × subtipo_codigo 'outro'),
//     pré-seleciona o TIPO CLASSIFICADO no select e mostra um aviso vermelho
//     "a IA reconheceu <tipo> mas não conseguiu ler os campos — toque em Reler";
//   - não deixa criar ativo a partir de um documento sem nenhum campo lido.
// A causa raiz estava na Edge Function (motor_documental 1.1: `temperature`
// recusado pelo Sonnet 5 derrubava toda extração).
//
// Versão anterior: 2.3.1 · 10/09/2026
//
// v2.3.1 — REGRESSÃO GRAVE (achado do Nicola: "antes, 1.149 apareciam, e agora
// pararam"): o import estático de cofre-imagem.js (v2.2.0) derrubava o módulo
// de Ativos inteiro quando esse arquivo não estava publicado — e ele não
// estava, porque faltava a linha dele no $Manifesto do Deploy_Raiz.ps1. Um
// recurso opcional (quality gate da foto) não pode quebrar a tela principal:
// virou import dinâmico com degradação silenciosa. Diagnóstico anterior
// ("empresa errada") estava errado — as correções de ativos-boot 1.3.0 e
// cofre-navegacao 1.7.0 ficam de pé por serem corretas em si, mas NÃO eram
// a causa desta falha.
//
// Versão anterior: 2.3.0 · 09/09/2026
//
// v2.3.0 — DOCUMENTO EM TRIAGEM VOLTOU A TER FLUXO (achado do Nicola):
// o card "N documentos em triagem" da Visão Geral chamava só
// switchTab('tab-ativos') e caía numa tela em branco, e a tela de Alertas
// não listava esses documentos. Agora:
//   - listarDocumentosEmTriagem() — fonte única (documento sem vínculo),
//     usada pela Visão Geral, pela tela de Alertas e pela Home do Cofre;
//   - abrirDocumentoEmTriagem(id) — ponte App→Cofre no mesmo padrão de
//     abrirItemControleComOrigemAlertas (cofre-controles 1.9.0): garante os
//     dados carregados, abre a ficha do documento e já deixa o "Vincular
//     agora" aberto, que é a ação que resolve a pendência;
//   - abrirTriagemDocumentos() — quando há mais de um, abre a lista em
//     Ativos › Documentos filtrada por "Em triagem" em vez de tela vazia.
// Nenhuma regra nova: reaproveita classificarStatusVinculo e o formulário
// "Vincular agora" que já existiam.
//
// Versão anterior: 2.2.0 · 09/09/2026
//
// v2.2.0 (ajuste de arquitetura de 09/09, itens 2, 3 e 12 + criar ativo):
//   - QUALITY GATE antes de qualquer chamada de IA (cofre-imagem.js 1.0.0):
//     foto desfocada, escura, com reflexo, cortada ou pequena demais NÃO sobe
//     e NÃO gasta IA — mensagem pronta + botão "Tirar outra foto". Avisos
//     (não bloqueiam) aparecem na tela de confirmação.
//   - PRÉ-PROCESSAMENTO leve: recorte da área do documento, orientação e
//     contraste suave. O ORIGINAL é o que vai pro Cofre; a versão tratada é
//     enviada só pra leitura (sobe em <cliente>/tmp-ia/ e é apagada depois).
//   - CRIAR ATIVO NO UPLOAD: quando o documento não casa com nenhum ativo
//     (ou não há vínculo), a confirmação oferece "Criar <tipo> a partir deste
//     documento" — nome, tipo e campos (placa, RENAVAM, chassi, CPF…) vêm do
//     que a IA leu, pelo mesmo caminho de cofre-ativos.salvarAtivo.
//   - Métricas de qualidade e tratamento gravadas na auditoria (item 12).
// A decisão sobre OCR externo (Document AI) segue EM ABERTO — nada aqui
// depende dela; este passo é o que dá pra fazer sem custo e sem vendor.
//
// Versão anterior: 2.1.0 · 09/09/2026
//
// v2.1.0 (Motor Documental fase 3, D1–D11) — a confirmação passa a falar a
// língua do motor (cofre-extrair-documento 1.6 / extracao 1.7):
//   - chamada leva tipo_ativo + ativo_id (1 chamada quando o ativo restringe;
//     titular divergente detectado); `resultado.motor` é a fonte quando existe
//   - select "Tipo de documento" (catálogo global): com IA vem preenchido e
//     "Reler" reclassifica (classificacao_forcada); sem IA é ele que manda —
//     categoria, manter arquivo, controle e campos vêm do tipo
//   - bloco "Dados do documento": campos do tipo, editáveis, com evidência e
//     marca "confira" (confiança < 0,75 ou validação falhou); gravados em
//     cofre_documentos.dados_estruturados
//   - avisos: vencido (D10: NÃO cria controle, pergunta se sobe mesmo assim),
//     titular divergente, validações que falharam, orçamento ≠ apólice
//   - "Vence em" único: alimenta validade_em e data_fim do item (espelho);
//     "calculada — confira" quando derivada por regra
//   - salvar: auditoria pela RPC nova (registrarExtracaoMotor), vencido_no_
//     upload, subtipo_codigo, e identificadores fortes gravados no ativo
//     (CPF na Vida; placa/RENAVAM/chassi no veículo) pro próximo casar
//   - contatos sugeridos agora vêm de motor.partes (papel)
// Categorias/subtipos são globais (D1): listarCategorias segue por cliente
// só pra retrocompatibilidade de linhas antigas; o select usa o gabarito.
//
// Versão anterior: 2.0.0 · 09/09/2026
//
// v2.0.0 (A.12/A.13 — PROPOSTA_UPLOAD_INTELIGENTE_CATEGORIAS v1.0 §5) — FLUXO
// DE UPLOAD INVERTIDO. Antes: formulário completo → salvar → IA analisa em
// segundo plano → modal de sugestões. Agora: caixa mínima (Câmera · Arquivo ·
// "Ler com IA") → arquivo sobe pro Storage → cofre-extrair-documento 1.5 em
// modo pré-insert → UMA tela de confirmação (#modal-confirmar-upload) já
// preenchida: tipo, resumo, nome sugerido, categoria › subcategoria casada por
// `codigo` do gabarito global, datas/vigência, vínculo com candidatos reais,
// contatos, "Manter arquivo no Cofre" e "Controlar vencimento" (bloco do item
// de controle com antecedência/reforço/recorrência do subtipo). Salvar grava
// documento → vínculo → auditoria (fn_cofre_registrar_extracao, já com
// status_revisao/revisado_por) → contatos → item de controle (via
// cofre-controles.criarItemControleDeDocumento, import dinâmico) → descarte
// do arquivo quando a categoria é "só dados" (arquivo_mantido=false,
// log cofre.documento_descartado). Cancelar apaga o arquivo do Storage. Sem
// IA = mesma tela, vazia, com os padrões da categoria. SAÍRAM:
// analisarAposUpload/montarModalSugestoesIA/ignorarSugestoesIA/
// aplicarSugestoesIA e o flag pularAnaliseIAProximoUpload. Ficha do
// documento: "Só dados" quando o arquivo não foi mantido (sem Baixar).
// Padrões lidos de cofre_categorias (gabarito) e cofre_controle_subtipos
// (migration a12_a13_categorias_gabarito_padroes_subtipos_v1).
//
// Versão anterior: 1.9.1 · 06/09/2026
//
// v1.9.1 — constante VERSAO sincronizada com o header (estava presa em uma
// versão anterior desde o bump do header; ⚙️ › Versões lia a constante e
// acusava "cache segurou" sem haver cache). gerar_versoes.py v1.3 agora
// trava a entrega se header ≠ VERSAO.
//
// Versão anterior: 1.9.0 · 06/09/2026
//
// v1.9.0 — anexarArquivoEntidade(): anexo programático (reajuste contratual).
//
// v1.8.1 — cofre.baixar → cofre.download (rename no catálogo, 05/09); upload
// restrito passa a depender de podeUsar('cofre.ver_restrito') em vez de
// ['master','admin'] chumbado (porta única do app).
//
// v1.8.0 — abrirUploadContextualComFlag(tipo, id, nome, comIA): versão
// genérica do par ComIA/SemIA de Ativos, pro sheet de Anexos do contrato
// (index.html) oferecer os dois modos sem duplicar o flag
// pularAnaliseIAProximoUpload.
//
// v1.7.0 — categorizarDocumentoAtual(): sheet de categorias na ficha do
// documento (pedido do Nicola: documento "Sem categoria" precisava de saída).
//
// v1.6.0 (31/08/2026, pedido explícito, "apague a aba antiga do cofre
// de visão geral pra irmos reduzindo e limpando o html") — montarHome()
// ganhou guarda defensiva (elemento nulo = não faz nada). Embutido no
// App (ativos-boot.js), data-screen="home" foi APAGADA (ver
// ativos-markup.js v1.5.0) — "Em triagem"/"Atenção necessária"
// migraram pra Visão Geral de verdade (index.html v1.94.2). Esta
// função em si NÃO foi apagada — cofre.html standalone ainda tem a
// Home de verdade, ainda funciona 100% lá.
//
// v1.5.0 — ALERTAS NO PADRÃO VISUAL DO IMÓVEIS (pedido explícito):
// alertaCardHtml() reescrita — mesmo box de ícone (w-9 h-9 rounded-lg),
// tipografia e borda do "Atenção necessária" do Imóveis; ícone agora
// representa o tipo do ativo (iconeAtivo()); título virou "nome do
// ativo - título do item"; badge+data unificados numa frase
// (fraseVencimento()/corFraseVencimento(), novas). montarHome() perdeu
// o corte de 5 itens (sem "Ver todos" pra ver o resto, mostra tudo).
// ocorrenciaParaAlertaViewHome() ganhou ativoNome/tipoAtivo.
//
// v1.4.0 — ATALHOS "TRATAR" E "ACIONAR" NO ALERTA DA VISÃO GERAL (pedido
// explícito): alertaCardHtml() ganhou 2 botões — "Tratar" (abre a ficha
// do item já com a ação Tratar disparada pra aquela ocorrência
// específica) e "Acionar" (nova acionarContatoAlerta() — busca contato
// vinculado ao item na hora do clique, prioriza WhatsApp sobre e-mail,
// abre com mensagem pronta pedindo cotação de renovação). Card continua
// clicável pra só visualizar o item. ocorrenciaParaAlertaViewHome()
// ganhou o campo `tipo` — necessário pra descrever o item na mensagem
// de "Acionar".
//
// v1.3.1 — D-2 (revisão DS): 5 pontos de badge migrados pro formato
// oficial §14 (BADGE_NEUTRO/BADGE_ALERTA/BADGE_PENDENTE/BADGE_OK,
// importados de cofre-validacoes.js) — alertaCardHtml(), montarFichaDoc
// (status de vínculo + "Restrito" + vencimento), lista de vínculos
// ("Empresa (geral)"), docResultadoBuscaHtml(). Novo helper local
// classeBadgeVinculo() evita repetir o ternário triagem/empresa/
// vinculado 2x. Sem mudança de comportamento — só classe CSS.
//
// v1.3.0 — CONCLUSÃO DA MIGRAÇÃO v6: alertaCardHtml() reescrita (não lê
// mais estado.eventos/cofre_eventos — recebe objeto já normalizado com
// itemControleId e navega pro Item de Controle ao clicar, em vez de
// editar/excluir inline). Removidas alternarEditarAlerta/
// confirmarEditarAlerta/excluirAlerta (mortas, tabela removida).
// montarHome() lê estado.ocorrenciasAbertas (via novo adaptador
// ocorrenciaParaAlertaViewHome) em vez do estado.eventos morto — é a
// causa raiz de "nenhum alerta aparece na Visão Geral". Sugestão de
// alerta pela IA (aplicarSugestoesIA) não cria mais evento avulso —
// checkbox escondida até termos fluxo de "virar item de controle".
//
// v1.2.0 — alertaCardHtml() ganha modo interativo (editar/excluir, pedido
// explícito — "alertas padrão pode e excluir e editar sem problemas").
// abrirUploadNoAtivoComIA()/SemIA() — 2 caminhos de anexar documento a um
// ativo (Com IA / Upload simples), reaproveitando modal-upload existente.
//
// Home (visão geral do patrimônio), upload (dois caminhos: contextual —
// vínculo pré-preenchido e travado — e "documento primeiro" — pergunta
// triagem/candidato), ficha do documento (vínculos por nome, clicáveis),
// busca global (secundária), categorias (configuração).
// ============================================================================

---

## `js/cofre-estado.js`

//
// v1.21.1 — MERGE: cabeçalho padronizado com o Imóveis (cor) — pedido
// explícito. Ver changelog completo em cofre.html. cofre-estado.js em
// si não mudou de conteúdo — só o COFRE_VERSAO abaixo.
//
// v1.21.0 — Menu "Imóvel" + cabeçalho do ativo dentro do box + bug fix
// modal Documentos (pedido explícito). Ver changelog completo em
// cofre.html. cofre-estado.js em si não mudou de conteúdo — só o
// COFRE_VERSAO abaixo.
//
// v1.20.0 — MERGE de 2 branches paralelos que divergiram do mesmo
// v1.18.0 em conversas separadas, cada um se autodenominando "v1.19.0"
// (pedido explícito: "faça o merge"):
//   (a) esta conversa — WHATSAPP + MÁSCARAS + FOTO + TIPO/SUBTIPO/
//       CATEGORIA + EDIÇÃO DE PADRÃO DO SISTEMA;
//   (b) conversa paralela — PESSOAS/MINHA EMPRESA/LICENÇA/SOBRE DE
//       VERDADE NO COFRE (via js/comum-*.js compartilhados com o App).
// Renomeado pra v1.20.0 (em vez de reaproveitar "v1.19.0" de qualquer
// um dos 2) justamente pra não ambiguar com nenhum dos dois pais. Ver
// changelog completo em cofre.html. cofre-estado.js em si não mudou de
// conteúdo — só o COFRE_VERSAO abaixo.
//
// v1.18.0 — BUG FIX FOTOS DO ATIVO + LINK IMÓVEIS + CONTATOS COMPLETOS
// (editar/excluir/WhatsApp) (pedido explícito). Ver changelog completo
// em cofre.html. cofre-estado.js em si não mudou de conteúdo — só o
// COFRE_VERSAO abaixo.
//
// v1.17.0 — ITEM DE CONTROLE (documento + visual + cascata + edição
// completa) + BOX DE FOTO DO ATIVO (pedido explícito). Ver changelog
// completo em cofre.html. cofre-estado.js em si não mudou de conteúdo
// — só o COFRE_VERSAO abaixo.
//
// v1.16.0 — EDIÇÃO E EXCLUSÃO DE MODELOS DE ITEM DE CONTROLE (pedido
// explícito). Ver changelog completo em cofre.html. cofre-estado.js em
// si não mudou de conteúdo — só o COFRE_VERSAO abaixo.
//
// v1.15.1 — Prestadores de Serviço revertido pra "Em breve" (pedido
// explícito). Ver changelog completo em cofre.html. cofre-estado.js em
// si não mudou de conteúdo — só o COFRE_VERSAO abaixo.
//
// v1.15.0 — CORREÇÃO DE COR (CONTRASTE) + REORGANIZAÇÃO COMPLETA DO
// MENU ⚙️ (pedido explícito). Ver changelog completo em cofre.html.
// cofre-estado.js em si não mudou de conteúdo — só o COFRE_VERSAO abaixo.
//
// v1.14.0 — CORES DO CABEÇALHO — nome da empresa e badge do módulo
// (pedido explícito). Ver changelog completo em cofre.html.
// cofre-estado.js em si não mudou de conteúdo — só o COFRE_VERSAO abaixo.
//
// v1.13.0 — ALERTAS NO PADRÃO VISUAL DO "ATENÇÃO NECESSÁRIA" DO IMÓVEIS
// (pedido explícito). Ver changelog completo em cofre.html.
// cofre-estado.js em si não mudou de conteúdo — só o COFRE_VERSAO abaixo.
//
// v1.12.0 — 3 BUGS CRÍTICOS corrigidos (achados pelo usuário): erro de
// constraint ao salvar contato, "Voltar" não respeitava origem real,
// excluir item de controle não atualizava alertas da Visão Geral. Ver
// changelog completo em cofre.html.
//
// v1.11.0 — MODELOS DE ITEM DE CONTROLE POR TIPO DE ATIVO (menu ⚙️ +
// atalho "Usar modelo", pedido explícito). Ver changelog completo em
// cofre.html. cofre-estado.js em si não mudou de conteúdo — só o
// COFRE_VERSAO abaixo.
//
// v1.10.1 — BUG FIX CRÍTICO: Visão Geral ficava congelada após tratar/
// reagendar/estornar/excluir (5 pontos não disparavam
// cofre:recarregar-eventos). Ver changelog completo em cofre.html.
//
// v1.10.0 — ITEM DE CONTROLE: DATA INÍCIO/FIM + GERAÇÃO RETROATIVA +
// ATALHOS TRATAR/ACIONAR NA VISÃO GERAL (pedido explícito). Ver
// changelog completo em cofre.html. cofre-estado.js em si não mudou de
// conteúdo — só o COFRE_VERSAO abaixo.
//
// v1.9.0 — GESTÃO DE SUBTIPOS DE ITEM DE CONTROLE (menu ⚙️, pedido
// explícito). Ver changelog completo em cofre.html. cofre-estado.js em
// si não mudou de conteúdo — só o COFRE_VERSAO abaixo.
//
// v1.8.1 — BUG FIX ("Erro ao carregar alertas") + PARIDADE VISUAL COM
// IMÓVEIS (cabeçalho de topo, card de KPIs, ícones) + TELA DO ITEM DE
// CONTROLE REESCRITA. Ver changelog completo em cofre.html.
//
// v1.8.0 — DECISÕES D-1 A D-6 CONFIRMADAS (2ª rodada da revisão DS). Ver
// changelog completo em cofre.html. cofre-estado.js em si não mudou de
// conteúdo — só o COFRE_VERSAO abaixo (bump obrigatório de sincronia).
//
// v1.7.0 — LOTE DE CONFORMIDADE COM O DESIGN SYSTEM (camada mecânica, sem
// decisão de produto pendente). Ver changelog completo em cofre.html.
// Nesta rodada, cofre-estado.js em si não mudou de conteúdo — só o
// COFRE_VERSAO abaixo (bump obrigatório de sincronia, mesma regra de
// sempre: qualquer entrega do módulo bump aqui, mesmo que este arquivo
// específico não tenha linha alterada).
//
// v1.6.0 — CONCLUSÃO DA MIGRAÇÃO v6 (deixada pela metade numa sessão
// anterior) + geração automática de 120 dias + lote de ajustes visuais
// (largura da ficha, fonte da lista de ativos, box Dados em prosa,
// Controles virou bottom-sheet). Ver changelog completo em cofre.html.
//
// v1.5.1 — guarda defensiva no bootstrap (cofre-navegacao.js v1.1.3).
//
// v1.5.0 — item de controle ganhou tela própria (ver cofre-controles.js
// v1.1.0); Contatos saiu da ficha do ativo (agora vincula a Item de
// Controle); Documentos/Fotos viraram ações em "Mais ações" (modais
// próprios, não boxes fixos); upload com 2 caminhos (IA / simples).
// CORRIGIDO: header desta seção estava duplicado numa entrega anterior e
// COFRE_VERSAO tinha ficado presa em 1.3.1 mesmo com o changelog já
// falando de v1.4.0 — consolidado num único bloco de novo.
//
// v1.4.0 — bump maior de COFRE_VERSAO: ficha do ativo virou tela (não
// modal com abas), header idêntico ao padrão do App (empresa + selo de
// módulo), exclusão de ativo, valor estimado universal.
//
// v1.3.1 — bump de COFRE_VERSAO: header simplificado (sem seletor de
// módulos), cofre-app.js v1.1.2 / cofre-navegacao.js v1.1.1.
//
// v1.5.0 (cofre-navegacao.js) — bump de COFRE_VERSAO: revertido pra
// 'raiz:comunicacoes:processar' direto — Termos/Política/Beta migraram
// pro motor de comunicações de verdade, não precisam mais de wrapper
// próprio. Ver changelog completo em cofre-navegacao.js v1.5.0.
//
// v1.4.0 (cofre-navegacao.js) — bump de COFRE_VERSAO: Aceite de Termos/LGPD
// entra antes da Central de Comunicações (mesma mudança de index.html
// v1.70.0) — sem isso, quem loga direto pelo Cofre passava batido pelo
// modal de aceite. Ver changelog completo em cofre-navegacao.js v1.4.0.
//
// v1.3.0 — bump de COFRE_VERSAO: nova aba Controles na ficha do ativo
// (criar item de controle + tratar/reagendar/estornar ocorrência), módulo
// novo cofre-controles.js v1.0.0.
//
// v1.2.1 — bump de COFRE_VERSAO acompanhando cofre-ativos.js/cofre-validacoes.js
// v1.1.1 (novos tipos de ativo veiculo_blindado/obra_arte).
//
// Estado em memória, único, desta aba do navegador. Não é um framework de
// estado — é um objeto simples exportado por referência, para os módulos de
// tela (navegacao/documentos/ativos) lerem e escreverem sem precisar
// importar uns aos outros (evita ciclo de import).
// ============================================================================

// Fonte única da versão exibida (badge do header) — sincronizada com o
// comentário de cabeçalho de cofre.html. Atualizar aqui a cada entrega
// (mesma regra de sincronia de 3 pontos já usada no app principal).
//
// NOTA (29/08/2026): pulava de '1.21.5' direto pra cá sem refletir nem a
// v1.21.6 (Arquivar/RLS, sessão paralela) nem esta entrega — fechado
// agora. Ver changelog completo em cofre.html v1.22.0 (merge das 2
// sessões paralelas + badge fix + form fix + função Vendido).

---

## `js/cofre-navegacao.js`

//
// v1.6.0 — bootstrap() ganhou suporte a ?abrir=categorias|subtipos|
// modelos (pedido explícito, 31/08/2026): abre direto uma tela de
// configuração do Cofre que só tinha porta de entrada dentro do próprio
// menu ⚙️ do Cofre até agora — agora alcançável também pelo menu
// Configurações do App (index.html, abrirConfiguracaoCofre()). Mesmo
// espírito de segurança do contexto/ref já existente: parâmetro de URL
// nunca é autorização, só sugestão de navegação.
//
// v1.5.0 — REVERTIDO pra 'raiz:comunicacoes:processar' direto (mesma
// reversão de index.html v1.71.0). Termos de Uso/Política de Privacidade/
// Termo de Beta migraram pro motor de comunicações de verdade — não
// precisam mais de um wrapper próprio antes de disparar a Central de
// Comunicações. js/comunicacoes/consentimento-app.js (usado por este
// arquivo desde a v1.4.0) fica obsoleto, junto com consentimento-{api,
// ui}.js — não são mais importados por cofre.html (tag removida).
//
// v1.4.0 — Aceite de Termos/LGPD entra ANTES da Central de Comunicações
// também aqui (mesma mudança de index.html v1.70.0) — dispatch trocou de
// 'raiz:comunicacoes:processar' pra 'raiz:termos:verificar'. Sem isso,
// quem loga direto pelo Cofre passava batido pelo modal de aceite de
// Termos de Uso/Política de Privacidade/Termo de Beta. Ver changelog
// completo no bloco do bootstrap() mais abaixo, e em
// js/comunicacoes/consentimento-app.js (módulo novo, compartilhado com
// index.html).
//
// v1.3.0 — pedido explícito do Nicola: Central de Comunicações Omnichannel
// passa a rodar também no Cofre (antes só existia em index.html). Novo
// dispatch de 'raiz:comunicacoes:processar' no fim de bootstrap(), mesmo
// evento/módulo compartilhado (js/comunicacoes/*.js) que o app principal
// usa — onAcaoFinal trata 'abrir_formulario_ativo' (dispara
// 'cofre:abrir-form-ativo', ver cofre-app.js) e é defensivo com
// 'abrir_formulario_imovel' (não deveria ocorrer aqui, mas não trava se
// ocorrer). Não precisa mais passar quantidadeImoveis/plano/perfil no
// detail — a seleção agora é decidida no banco (fn_comunicacao_proxima_app)
// a partir de pessoaId/clienteId.
//
// v1.2.0 (28/08/2026) — BUG REAL corrigido: abrirContexto('imovel', ...)
// quando o ativo já existe (caminho mais comum) disparava só
// 'cofre:abrir-ativo' (ficha, sem upload) — agora dispara
// 'cofre:upload-contextual' direto, igual contrato/pagamento sempre
// fizeram. Botão "Documentos" do Imóvel no app nunca chegava no
// formulário de anexar arquivo.
//
// v1.1.3 — guarda defensiva em cofre-nome-empresa (evita "Cannot set
// properties of null" se o elemento não existir por algum motivo — ex.:
// cache de navegador com HTML antigo enquanto o JS já é o novo).
//
// v1.1.2 — header: nome da empresa passa a ser o título principal
// (#cofre-nome-empresa), com selo "Cofre" ao lado (identificação de
// módulo). badge-empresa-atual agora mostra só o nome da pessoa (empresa
// já aparece acima, sem duplicar).
//
// v1.1.1 — abrirSeletorModulo() marcada DEPRECATED (não mais chamada); ver
// cofre-app.js v1.1.2 (novo data-action="voltar-app", header simplificado).
//
// v1.1.0 — CORREÇÃO DE ARQUITETURA (substitui o bootstrap simplista da
// v1.0.0, que só aceitava ?cliente_id=). Implementa o contrato do prompt
// corretivo §5:
//   1. valida Supabase Auth
//   2. resolve empresas da pessoa
//   3. resolve contexto/ref DENTRO das empresas autorizadas
//   4. (licença do módulo — deferido, ver HANDOFF item 18)
//   5. valida perfil/funcionalidade (cofre.ver)
//   6. RLS faz a validação final no banco, em toda query subsequente
//   7. abre diretamente a tela/ficha correta
//
// `ref` é sempre revalidado contra o banco (nunca confiado da URL — "URL
// nunca é autorização", Adendo §5/§18). `nome` (quando vem na URL, ver
// alias do protótipo de Imóveis) é usado só como legenda cosmética
// imediata, e é IMEDIATAMENTE substituído pelo nome real assim que a
// consulta volta — nunca fica sozinho como fonte de verdade.
// ============================================================================

---

## `js/cofre-ui.js`

//
// v1.3.1 (demanda c7c0cc6f, achado do Nicola testando o item 6/CIB) —
// #modal-generico (modalGenerico()) ganhou z-index PRÓPRIO (460, faixa
// "Confirmação genérica" do DESIGN_SYSTEM §5). Antes, dependia só da
// classe .modal-overlay (compartilhada com os formulários/sheets do
// Cofre, ativos-markup.js), cujo z-index é 96 — valor LEGADO, aposentado
// no próprio DESIGN_SYSTEM (65/70/95/96, "antigos popups Tipo A/B/C").
// Com os 2 no mesmo z-index, quem ficava por cima dependia só da ordem
// no DOM — por isso o modal do CIB abria por baixo do formulário de
// imóvel aberto e ficava inacessível. z-index inline sempre vence a
// classe compartilhada (especificidade CSS), então não depende de
// ordem de inserção no DOM nunca mais.
//
// v1.3.0 (pedido explícito, 01/09/2026: "apenas um modal deve ser
// aberto por vez") — abrirModal() passou a fechar qualquer outro
// .modal-overlay que já estivesse aberto antes de abrir o novo. Antes,
// nada impedia 2+ modais ficarem abertos ao mesmo tempo se um fluxo
// disparasse um modal de dentro de outro sem fechar o anterior
// primeiro.
//
// v1.2.0 — D-2 (revisão DS): chipStatusVinculoHtml() migrada pro badge
// oficial §14 (BADGE_NEUTRO/BADGE_PENDENTE/BADGE_OK, importados de
// cofre-validacoes.js) — removido prefixo "chip " (classe já vem
// completa). Sem mudança de comportamento.
//
// Helpers de DOM reutilizáveis: toast, abrir/fechar modal, troca de aba
// genérica, template de card, indicador de "liga/desliga" (Design System
// v1.43.0 §2). Não importa cofre-api.js — não sabe nada de Supabase.
// ============================================================================

---

## `js/cofre-validacoes.js`

//
// v1.4.0 — PONTE DE COMPATIBILIDADE pra E4.2 fatia B (decisão do Nicola,
// "pode migrar conforme sugerido os ativos"). ACHADO antes de migrar:
// rotuloTipoAtivo/iconeAtivo/CAMPOS_POR_TIPO_ATIVO só reconhecem os
// valores ANTIGOS de tipo_ativo — se a migration rodasse sem isto, 119
// dos 131 ativos (91%) ficariam com rótulo cru ("imovel_predial" na
// tela), ícone genérico, E os campos estruturados (placa, matrícula,
// artista...) sumiriam da ficha (CAMPOS_POR_TIPO_ATIVO[tipo] || []) —
// dado continuaria no banco, só ficaria invisível/não-editável na
// interface. Isto aqui NÃO é a E5 completa (catálogo vindo do banco,
// bot lendo a mesma fonte) — é só o mínimo pra rótulo/ícone/campos não
// quebrarem para os valores novos. E5 continua no backlog, como estava.
// - rotuloTipoAtivo/iconeAtivo ganham 4 chaves novas: imovel_predial,
//   imovel_territorial, vida, bem_valor. Chaves antigas mantidas (pedido
//   do próprio plano: "manter os valores antigos aceitos durante a
//   transição").
// - CAMPOS_POR_TIPO_ATIVO ganha as mesmas 4 chaves, cada uma reaproveitando
//   a lista de campos do tipo antigo mais próximo (imovel_predial=imovel,
//   imovel_territorial=terreno, vida=vida_protecao, bem_valor=obra_arte) —
//   é o que os ativos reais de hoje precisam pra não perder campo nenhum.
//   `colecao_bem_valor` fica como está, sem ativo nenhum usando ainda —
//   consolidar os dois num catálogo só é trabalho da E4.3/E4.4, não desta
//   ponte.
// - `veiculo` ganha blindagem_empresa/blindagem_nivel como campos
//   OPCIONAIS (antes só existiam em veiculo_blindado) — os 3 ativos que
//   migram de veiculo_blindado pra veiculo precisam continuar vendo e
//   editando esse dado; os outros 9 veículos simplesmente não preenchem.
//
// v1.3.1 — PLANO_IMPLEMENTACAO v1.0, etapa E6.2 (primeiro consumidor do
// componente de endereço, decisão do Nicola 15/09): CAMPOS_POR_TIPO_ATIVO.
// imovel perde o campo solto `endereco` (texto livre, sem CEP/IBGE/UF
// estruturados). Motivo: agora existe js/comum-endereco.js, que grava
// direto nas 8 colunas de endereço de cofre_ativos (E6.1) em vez de um
// texto dentro de dados_especificos — evita o mesmo dado em dois formatos.
// cofre-ativos.js (E6.2) passa a renderizar o bloco estruturado no lugar
// deste campo, só para imóvel avulso (sem vínculo com a tabela imoveis).
// Backfill do único registro em produção com esse campo preenchido:
// migration endereco_ativo_avulso_backfill_v1 (Family Office Karen Corp.).
//
// v1.3.0 — pesquisa própria do Nicola: 3 tipos de ativo novos (aeronave,
// embarcacao, colecao_bem_valor) em rotuloTipoAtivo/iconeAtivo/
// CAMPOS_POR_TIPO_ATIVO — mesmo padrão dos tipos existentes. Ícones
// Lucide escolhidos (plane/sailboat/gem) não confirmados visualmente
// nesta sessão — conferir ao testar.
//
// v1.2.0 — D-2 (revisão DS, decisão do proprietário: "chips migram pro
// [badge] do Imóveis"): chipVencimento() migrada do sistema de pill
// próprio do Cofre (classe chip-*, ver cofre.html) pro badge OFICIAL do
// Design System §14 — mesmas classes Tailwind literais do App (não um
// equivalente reaproximado). 4 constantes novas EXPORTADAS
// (BADGE_NEUTRO/BADGE_ALERTA/BADGE_PENDENTE/BADGE_OK), reaproveitadas em
// cofre-ui.js e cofre-documentos.js — nenhum arquivo repete a string à
// mão. `classe` retornado por chipVencimento() agora é a classe COMPLETA
// (formato + cor); quem consome não prefixa mais com "chip ".
//
// v1.1.3 — removido campo `seguradora` de obra_arte/vida_protecao (seguro
// agora é Item de Controle, não dado estruturado); `valor_estimado`
// padronizado em TODOS os tipos de ativo (pedido explícito).
//
// v1.1.2 — rótulos puros de Controles/Ocorrências (rotuloTipoControle,
// rotuloStatusOcorrencia, rotuloFrequencia) para a nova aba Controles.
//
// v1.1.1 — adiciona tipos de ativo veiculo_blindado/obra_arte (rótulo, ícone,
// campos estruturados), acompanhando migration_cofre_alarmes_v2 que ampliou
// cofre_ativos_tipo_check. Sem remoção de tipos existentes.
//
// Funções PURAS (sem DOM, sem rede, sem estado global) — é isso que torna
// possível testar este arquivo isoladamente (ver tests/cofre-validacoes.test.js,
// executável com `node tests/cofre-validacoes.test.js`, sem framework).
//
// Diretriz Arquitetural — Passo 2: este é o módulo mais "de baixo nível" da
// pilha; os demais (cofre-ui, cofre-documentos, cofre-ativos) importam
// daqui, nunca o contrário.
// ============================================================================

---

## `js/comum-licenca.js`

//
// Versão anterior: 1.3.0 · 07/09/2026
//
// v1.3.0 — E.3.1: cada limite mostra o tipo de cota (no mês / em uso / MB),
// lido de funcionalidades.cota_tipo (E.3), e o número fica âmbar a partir de
// 80% e vermelho no limite. fn_verificar_limite já conta por tipo desde a
// migration e3_cota_tipo_e_uso_por_tipo_v1 — aqui só o rótulo mudou.
//
// Versão anterior: 1.2.1 · 06/09/2026
//
// v1.2.1 — constante VERSAO sincronizada com o header (estava presa em uma
// versão anterior desde o bump do header; ⚙️ › Versões lia a constante e
// acusava "cache segurou" sem haver cache). gerar_versoes.py v1.3 agora
// trava a entrega se header ≠ VERSAO.
//
// Versão anterior: 1.2.0 · 06/09/2026
//
// v1.2.0 — gramática (REGRAS §6): caixa alta fora ("Plano atual", "Limites do plano"),
// cards .rz-card com .rz-card-h, rótulos em sentence case. Lógica intocada.
//
// v1.1.0 — pedido explícito: "resolva as pendências de cores listadas".
// 3 usos de emerald-* trocados: barra de uso (era bg-emerald-500, é
// status semântico — DS §14 — virou var(--success), par de
// var(--danger)/var(--warning) que os outros 2 estados já usavam
// hardcoded fora de token também, corrigidos junto); nome do plano e
// status viraram var(--pine).
//
// v1.0.0 — PRIMEIRA VERSÃO. Extraído de index.html (Beta v1.63.0 —
// inicializarLicenca()/carregarLicencaAtual()) pra módulo compartilhado —
// pedido explícito do usuário: Pessoas/Minha Empresa/Licença/Sobre são
// telas de ADMINISTRAÇÃO DO CLIENTE (empresa), não do módulo Imóveis —
// hoje moram só dentro de index.html, mas o Cofre (e módulos futuros)
// também precisam delas. Em vez de duplicar HTML/lógica em cada app (o
// que index.html v1.62.3 já vinha evitando com um deep-link pra cá —
// ?ir=tab-licenca — como remendo temporário), este módulo vira a ÚNICA
// fonte: qualquer host importa e chama montarAbaLicenca(). Começando por
// Licença e Sobre (menos funções/elementos); Pessoas e Minha Empresa
// ficam pra uma próxima rodada, mesmo padrão.
//
// MUDANÇA DE CONCEITO nesta extração (não é só mover código de lugar):
// a versão antiga buscava só a licença do módulo 'imoveis', hardcoded
// (`.eq('modulo', 'imoveis')` em 3 pontos diferentes de index.html).
// Essa tela agora é de administração GERAL do cliente, então busca TODAS
// as licenças do cliente_id, sem filtro de módulo. Confirmado contra o
// banco ao vivo (Supabase MCP, 26/08/2026): hoje são 10 clientes com
// licença só de 'imoveis' e 1 cliente com 'imoveis'+'gestao' — ou seja,
// pra quase todo mundo o resultado visual continua sendo exatamente 1
// card, idêntico a antes. Mas quando o Cofre (ou outro módulo futuro)
// ganhar sua própria linha em `licencas`, ela aparece aqui sozinha, sem
// precisar tocar neste arquivo de novo.
//
// Diretriz Arquitetural (mesma já usada no Cofre — ver cofre-api.js, e
// em comunicacoes-app.js dentro do próprio index.html): este módulo NÃO
// cria seu próprio cliente Supabase. Recebe `dbAuth` (o client já
// autenticado do app hospedeiro) por parâmetro em toda função — evita
// abrir uma 2ª sessão/round-trip de auth dentro da mesma página. Quem
// hospeda (index.html, cofre.html, ou um módulo futuro) é quem decide
// COMO obtém esse client; este arquivo só usa o que recebe.
// ============================================================================

---

## `js/comum-minha-empresa.js`

//
// Versão anterior: 1.8.0 · 01/10/2026
//
// v1.8.0 (F12, demanda 3a1a5ef5, aprovada em 01/10/2026) — card novo "Pix para
// cobrança de aluguel": Chave Pix (clientes.pix_chave) e Nome do recebedor
// (clientes.pix_recebedor_nome; vazio = nome da empresa). Colunas já existiam
// (F10). A cidade do Pix vem do endereço da sede. Hoje a chave é usada na
// cobrança de aluguel pelo WhatsApp, de forma opcional na hora de cobrar.
// Mesmo salvar de sempre (salvarDadosEmpresa). Versão anterior: 1.7.0.
//
// v1.7.0 (frente fiscal, Fase 2 — demanda 976fcbf6) — card "Perfil fiscal e
// societário" ganha "Inscrição municipal" (clientes.inscricao_municipal,
// coluna nova, opcional; até 30 caracteres, conferido também no banco).
// Mesmo salvar de sempre (salvarDadosEmpresa). Quem emite a nota
// (fiscal_responsavel_emissao) fica para a tela Fiscal, fases seguintes.
//
// v1.6.0 (Fase R / Entrega R.2, 20/09/2026) — Card "Rotinas": lista as 5
// rotinas de empresa do catálogo (cofre_controle_subtipos, tipo='rotina',
// titular_escopo 'empresa' — fechamento mensal, envio ao contador, NFS-e
// da competência, relatório da carteira, indicadores de mercado) via
// fn_rotinas_empresa_listar. Toque na linha abre Sheet de ações (⋮,
// abrirSheetAcoes já global no host) com "Ligar rotina" (codigo
// cofre.controles.criar — ACE-01: aparece travada com cadeado/motivo se o
// plano não incluir, igual a qualquer outro item do catálogo) ou "Desligar
// rotina". Camada de dados nova (buscarRotinasEmpresa/ligarRotinaEmpresa/
// desligarRotinaEmpresa) chama fn_rotina_empresa_ligar/fn_rotina_empresa_
// desligar/fn_rotinas_empresa_listar (migration rotinas_funcoes_ligar_
// desligar_listar_v1). Segue o mesmo princípio do resto do arquivo: módulo
// não pressupõe host, mas usa window.abrirSheetAcoes/window.renderStatus/
// window.podeUsar (via codigo na ação) quando disponíveis, com fallback
// degradado (toast "só disponível dentro do app principal") quando não.
//
// v1.5.0 (A.5.1, 09/09/2026) — CEP, telefone, e-mail e site da empresa:
// colunas criadas em `clientes` (migration a5_1_clientes_cep_telefone_email_
// site_v1, CHECK de CEP 8 dígitos e e-mail). Campos no card de contato e
// de endereço; CEP salvo só com dígitos.
//
// Versão anterior: 1.4.0 · 06/09/2026
//
// v1.4.0 — TELA COMPLETA NA GRAMÁTICA (print do Nicola 20:16: "modelo antigo
// com formatação ruim; traga os campos completos"). Formulário reescrito no
// catálogo .rz-f/.rz-f2/.rz-seg (antes era Tailwind solto: alturas e labels
// desiguais). 4 cards: Identificação (natureza PF/PJ em segmento → rótulo e
// máscara CPF/CNPJ, responsável, pessoa de contato) · Endereço da sede (UF em
// select, código IBGE do município) · Recibos e documentos (cidade do recibo,
// papel na locação, LOGO com upload reduzido no navegador) · Perfil fiscal e
// societário (regime tributário, distribuição de lucros — enums do banco).
// Todos os campos são colunas que JÁ existem em `clientes`; nenhuma coluna
// nova (regra do Nicola). Sem coluna no banco, logo fora da tela: CEP,
// telefone, e-mail e site da empresa — decisão pendente (PENDÊNCIAS A.5).
// Gate parametros.empresa.editar: sem permissão, tudo em leitura (inputs
// desabilitados, botões de upload também). Documento gravado com máscara.
// Índice também passou a recarregar CONFIG_CLIENTE.logoUrl após salvar.
//
// v1.3.1 — 06/09/2026 · constante VERSAO sincronizada.
//
// v1.3.1 — constante VERSAO sincronizada com o header (estava presa em uma
// versão anterior desde o bump do header; ⚙️ › Versões lia a constante e
// acusava "cache segurou" sem haver cache). gerar_versoes.py v1.3 agora
// trava a entrega se header ≠ VERSAO.
//
// Versão anterior: 1.3.0 · 06/09/2026
//
// v1.3.0 — layout na gramática (print do Nicola): tabhead com descrição, card
// "Dados da empresa" com .rz-card-h, labels leves, assinatura em card próprio.
//
// v1.2.0 — gramática: botões no catálogo (Salvar = rz-btn-1, assinatura = rz-btn-2 + rz-ico-btn),
// sentence case; gate parametros.empresa.editar (sem permissão = só leitura, com motivo).
//
// v1.1.0 — pedido explícito: "resolva as pendências de cores listadas".
// bg-emerald-600 (único uso deste arquivo) trocado por var(--pine) —
// era o botão de ação principal (Salvar), token certo por definição
// (DS §12: "Ação principal → background:var(--pine)").
//
// v1.0.0 — PRIMEIRA VERSÃO. Extraído de index.html (dev_carregarDadosEmpresa()/
// dev_salvarDadosEmpresa()/processarUploadAssinatura()/calcularLimiarOtsu()/
// salvarAssinaturaProcessada()/apagarAssinatura(), Beta v1.64.0) pra
// módulo compartilhado — pedido explícito: "faz também Minha Empresa e
// Pessoas" (mesma sessão/motivo de comum-sobre.js/comum-licenca.js — ver
// changelog completo lá, não repetido aqui).
//
// DIFERENÇA em relação à versão original: o índex.html lia/escrevia
// direto em CONFIG_CLIENTE (objeto global carregado no login). Este
// módulo NÃO depende de CONFIG_CLIENTE existir no host — busca a linha
// de `clientes` sozinho (mesmo princípio de comum-licenca.js: módulo
// compartilhado não pressupõe variável global de nenhum host
// específico). Depois de salvar, chama `ctx.onBrandingAtualizado?.()`
// pra avisar o host que pode querer atualizar CONFIG_CLIENTE/branding
// (index.html usa isso pra refletir no recibo em PDF; Cofre não tem
// recibo, então simplesmente não passa esse callback).
//
// Diretriz Arquitetural: não cria seu próprio cliente Supabase — recebe
// `dbAuth` já autenticado do host, por parâmetro (ver nota completa em
// comum-licenca.js).
// ============================================================================

---

## `js/comum-pessoas.js`

//
// Versão anterior: 1.200.0 · 18/09/2026
//
// v2.0.0 (COMUM_PESSOAS_VERSAO) / v1.200.0 (VERSAO, header) — pedido
// explícito do Nicola (18/09/2026): "A tela de pessoas ficou no formato
// antigo de leiaute, fora do padrão. Deve ser totalmente reescrita."
// REESCRITA TOTAL da camada de apresentação (render + interação). A
// camada de dados NÃO mudou — listarPessoas/buscarModulosPorPerfil/
// buscarProativasDisponiveis/buscarPreferenciasComunicacao/
// FREQUENCIA_OPCOES continuam com a mesma consulta e o mesmo formato de
// retorno (index.html "Minhas notificações", linha ~9219, importa 3
// delas direto — contrato preservado).
//
//   SAIU (gramática antiga, herdada do app-dev original, Tipo A):
//   - Cartão com expansão inline (toggle .hidden) + <input> nativos
//     sempre no DOM → virou Sheet de formulário (abrirFormPessoaSheet),
//     mesmo padrão do módulo Partes (index.html, abrirFormParteSheet).
//   - Botão único "Salvar pessoas" salvando TODOS os cartões de uma vez
//     (já apontado como frágil no changelog do v1.2.0 desta mesma
//     versão anterior — um re-render externo podia descartar edição não
//     salva) → cada pessoa salva por si, ao tocar "Salvar"/"Cadastrar"
//     no próprio Sheet. Sem "linha fantasma" pra pessoa nova: o "+"
//     abre o Sheet de nova pessoa direto — só existe 1 tipo de cadastro
//     aqui, mesmo padrão do "+" de Partes (não precisa de Sheet de
//     ações antes, só faz sentido pra "+" com mais de 1 opção, como em
//     Financeiro).
//   - Lápis/lixeira redondos (v1.4.0) e ⋮ solto → toda ação mora agora
//     no ⋮ único da linha (abrirAcoesPessoa · Sheet de ações), incluindo
//     Editar — "não existe terceiro ícone" (REGRAS_EXPERIENCIA §8).
//   - Badges de módulo (Imóveis/Cofre/Gestão) em cor Tailwind crua
//     (bg-blue-50 etc., achado antigo de UI/cor) saíram da linha (linha
//     não tem espaço pra chip por design, §8) e viraram texto dentro da
//     Ficha (.rz-kv "Acesso a módulos").
//   - Seção "Comunicações (avisos automáticos)" inline + botão de salvar
//     próprio (v1.1.0/v1.2.0) → Sheet de formulário dedicado
//     (abrirComunicacoesPessoaSheet), aberto pelo ⋮. Mesma consulta e
//     mesma gravação em pessoa_preferencias_comunicacao, zero mudança
//     de dado.
//   - "Acessos recentes" (div colapsável, v1.7.0) → Sheet de leitura
//     dedicado (abrirAcessosPessoaSheet), mesmo carregarAcessosDaPessoa
//     lazy de sempre (LGPD — minimização, só busca ao abrir).
//   - alert()/confirm()/prompt() nativos saíram de quase todo fluxo —
//     ficaram só os confirm() dos 2 DELETEs irreversíveis (excluir
//     pessoa, remover acesso), mesmo padrão aceito em excluirParte()
//     (index.html) pra ação destrutiva real.
//
//   NOVO — linha da lista (.rz-row), igual ao padrão de Partes: ícone
//   (user · shield-check se master) · nome · "Perfil · função" (1 fato +
//   1 contexto, §8) · toque na linha abre a Ficha (abrirFichaPessoa,
//   Sheet de leitura com .rz-card/.rz-kv), ⋮ abre o Sheet de ações.
//
//   ACHADO DE GOVERNANÇA (registrado, não corrigido nesta entrega —
//   fora do escopo de "reescrever a tela de Pessoas do App"):
//   cofre.html é página HTML separada (não carrega o <script> do
//   index.html) e NÃO define abrirSheet/abrirSheetAcoes/abrirSheetForm/
//   podeUsar/renderStatus — mesma lacuna já documentada no próprio
//   changelog de cofre.html v1.25.9 pra outras classes .rz-*. Este
//   módulo é compartilhado (montarPessoasCofre() em js/cofre-app.js
//   também o monta): dentro do Cofre standalone, toda ação que dependa
//   de Sheet (editar dados, perfil, comunicações, acessos recentes,
//   criar/vincular/remover acesso, e a própria Ficha de leitura) mostra
//   o mesmo aviso "Ações disponíveis só dentro do app principal." que
//   cofre-controles.js/cofre-ativos.js/cofre-documentos.js já usam pras
//   próprias ações Sheet-dependentes — NÃO é regressão desta entrega, é
//   o mesmo padrão de degradação já aceito no resto do Cofre (ver
//   demanda nova registrada nesta entrega). A lista de pessoas continua
//   visível lá. ctx continua 100% retrocompatível: nenhum campo novo
//   obrigatório, o call site do Cofre não muda.
//
// Versão anterior: 1.199.0 · 17/09/2026
//
// v1.7.0 (COMUM_PESSOAS_VERSAO) / v1.199.0 (VERSAO, header) — bc9df144,
// item 2 (17/09/2026): "aba Pessoas" ganha auto-filtro. ctx novo e todo
// OPCIONAL (pessoaId/autoFiltro/podeVerTodas/carregarAcessosDaPessoa) —
// call site do Cofre (js/cofre-app.js, montarPessoasCofre) não passa
// esses campos e continua exatamente como estava, sem autoFiltro.
//   - autoFiltro=true (App > Conta > Pessoas, novo call site em
//     index.html): por padrão renderLista() mostra só a pessoa cujo id é
//     ctx.pessoaId; quem tem podeVerTodas=true (calculado no host a
//     partir do codigo pessoas.ver_todas — perfil master da própria
//     empresa) vê todo mundo, com as mesmas regras de sempre (master
//     oculto de quem não é master).
//   - "+" (nova pessoa) e o rótulo do botão de salvar só aparecem/mudam
//     quando podeGerenciarOutras (= !autoFiltro || podeVerTodas) — no
//     modo "só eu" não faz sentido cadastrar outra pessoa.
//   - Novo atalho "Acessos recentes" por pessoa (acessosRecentesHtml()),
//     lazy (só busca ao expandir — minimização de dados, LGPD): usa o
//     callback ctx.carregarAcessosDaPessoa(pessoaId), que o host injeta
//     reaproveitando a MESMA consulta de log_acessos que alimentava a
//     extinta tela "Logs do Sistema" do app-dev — nenhuma lógica de
//     consulta nova, só um ponto de entrada por pessoa em vez de
//     multi-pessoa com filtros.
//   - Esta seção só aparece quando ctxUi.autoFiltro é true — o Cofre
//     nunca a vê.
//
// v1.6.0 — MOTOR CENTRAL DE ALERTAS, Fase 5: buscarProativasDisponiveis(),
// buscarPreferenciasComunicacao() e FREQUENCIA_OPCOES viram export — a
// tela nova "Minhas notificações" (index.html, menu Conta) reaproveita a
// MESMA consulta de licença×proativa e o MESMO mapa de preferências que
// esta tela já usa, em vez de reimplementar. Nenhuma lógica mudou aqui,
// só a visibilidade das 3 declarações.
//
// v1.5.1 — constante VERSAO sincronizada com o header (estava presa em uma
// versão anterior desde o bump do header; ⚙️ › Versões lia a constante e
// acusava "cache segurou" sem haver cache). gerar_versoes.py v1.3 agora
// trava a entrega se header ≠ VERSAO.
//
// v1.5.0 (A.5) — perfil escolhido em sheet a partir da tabela perfis (protegido só pra master);
// os 2 prompt() de perfil saíram. Nenhum nome de perfil chumbado no fluxo.
//
// v1.4.0 — gramática: ⋮ por pessoa (Editar/Remover com código do catálogo → cadeado por perfil)
// no lugar de lápis/lixeira redondos; título sem h2; + e Salvar no catálogo; perfil em
// sentence case. Lista de perfis do prompt continua (próxima leva).
//
// v1.3.1 — podeEditarPerfil lê podeUsar('pessoas.editar'). Lista de perfis do
// prompt e proteção do master ficam pro roteiro #6 (sheet + perfis.protegido).
//
// v1.3.0 — pedido explícito: "resolva as pendências de cores listadas".
// 9 usos de emerald-* trocados por token: 2 pares bg-emerald-50/text-
// emerald-700/border-emerald-200 (botões leves) → var(--sprout-light)/
// var(--pine)/var(--sprout); 2 bg-emerald-600 (ação principal) →
// var(--pine); 1 text-emerald-900 (título "Pessoas") → var(--pine) —
// mesmo hex oficial da marca, Tailwind emerald-900 (#064e3b) não bate
// exatamente com --pine (#1e3a32), por isso vale trocar mesmo em uso
// já "certo" visualmente.
//
// v1.2.0 (28/08/2026) — BUG REAL corrigido, reportado pelo Nicola: a
// seção de comunicações deixava clicar no checkbox/escolher frequência,
// mas nada era salvo. Causa: só existia UM caminho de salvamento (o botão
// "Salvar Pessoas" lá embaixo, fora da seção), que grava TUDO de uma vez
// (nome/e-mail/whatsapp/perfil/avisos de todos os cards). Clicar num
// checkbox muda o estado visual na hora (comportamento normal do
// navegador), dando a impressão de que já "pegou" — mas sem lembrar de
// rolar até o botão distante e clicar, nada persiste. Pior: qualquer
// re-render externo da aba (dev_renderPessoas, chamado por outras
// rotinas do app) reconstrói a lista inteira a partir do banco,
// descartando silenciosamente qualquer edição ainda não salva. Corrigido
// com um botão "Salvar avisos desta pessoa" dentro da própria seção —
// salva só aquilo, na hora, com feedback próprio — sem depender do botão
// de baixo nem do risco de um re-render apagar a edição no meio do
// caminho.
//
// v1.1.0 (28/08/2026) — NOVO, pedido explícito do Nicola: seção
// "Comunicações (avisos automáticos)" dentro do cadastro de cada pessoa —
// habilitar/desabilitar, por pessoa, quais avisos proativos ela recebe
// via WhatsApp e em qual frequência (diário/semanal/quinzenal/mensal/
// trimestral).
//
//   - Escopo = funcionalidades.tipo='proativa' AND ativo=true (conferido
//     contra o banco: 7 cadastradas, 5 ativas — batem exatamente com os
//     5 templates Meta já aprovados). Todas as 7 já tinham `descricao`
//     preenchida — usada como texto explicativo do escopo de cada uma,
//     mostrado direto pra pessoa (pedido explícito: "o escopo da função
//     deve aparecer ao usuário").
//   - Filtrado pela LICENÇA do cliente (licencas × plano_funcionalidade)
//     — só aparece pra configurar o que a empresa realmente contratou.
//     Mesmo raciocínio de clienteTemFuncionalidadeLicenca() no bot,
//     portado pra JS aqui (3 consultas + join, mesmo estilo de
//     buscarModulosPorPerfil, sem RPC nova).
//   - Nova tabela `pessoa_preferencias_comunicacao` (migration
//     pessoa_preferencias_comunicacao_v1, 28/08/2026) — mesmo padrão de
//     RLS/grants de `pessoas` (tabela irmã direta).
//   - Sem WhatsApp cadastrado na pessoa: seção continua aparecendo (não
//     trava), mas mostra aviso de que os envios não chegam até
//     preencher o número.
//   - Pessoa ainda não salva (sem id): seção mostra "salve primeiro",
//     mesmo padrão já usado pra "criar acesso".
//
// v1.0.0 — PRIMEIRA VERSÃO. Extraído de index.html (dev_renderPessoas()/
// dev_salvarPessoas()/dev_removerPessoa()/dev_criarAcessoParaPessoa()/
// dev_vincularLoginPessoa()/dev_desvincularLoginPessoa(), Beta v1.64.0)
// pra módulo compartilhado — pedido explícito: "faz também Minha Empresa
// e Pessoas, incluindo os acessos no módulo de imóveis e cofre".
//
// SOBRE "INCLUINDO OS ACESSOS" — leitura importante antes de usar isto:
// hoje o controle de acesso do sistema é por PERFIL (pessoas.perfil →
// perfil_funcionalidade → funcionalidades), não por pessoa individual.
// Ou seja, toda pessoa com o mesmo perfil (ex.: "operador") tem
// EXATAMENTE o mesmo acesso a módulos — não existe hoje um jeito de dar
// Cofre pra uma pessoa "operador" e negar pra outra "operador" da mesma
// empresa. O badge/campo "Acesso a módulos" mostra, por pessoa, quais
// módulos o PERFIL dela libera — calculado ao vivo a partir de
// perfil_funcionalidade + funcionalidades.area, nunca hardcoded. Editar
// o "Perfil de acesso" de uma pessoa continua sendo o único jeito de
// mudar o acesso dela.
//
// Diretriz Arquitetural: não cria seu próprio cliente Supabase pra
// leitura/escrita de conta — recebe `dbAuth` já autenticado do host, por
// parâmetro (ver nota completa em comum-licenca.js). Exceção pontual:
// criarAcessoPessoa() precisa de um 2º client TEMPORÁRIO, isolado
// (persistSession:false), pra criar o login de outra pessoa sem
// sobrescrever a sessão de quem está usando a tela. Usa a mesma URL/anon
// key pública já hardcoded em cofre-api.js (é chave pública, protegida
// por RLS no banco — não é segredo, mesmo padrão já replicado nesse
// outro arquivo).
// ============================================================================

---

## `js/comum-renovacao.js`

//
// Versão anterior: 1.2.0 · 01/10/2026
//
// v1.2.0 — AJUSTES DO TESTE DO NICOLA (01/10, 13:32), só apresentação:
// (1) cada opção ganha "Escolher ›" à direita; (2) linhas mais baixas: o anual
// mostra "cheio riscado + preço" numa linha e a economia em texto verde curto
// (sai a pílula), sub "12 meses, à vista" (o "pagamento à vista" cortava);
// (3) nome do plano alinhado à esquerda com as linhas Mensal/Anual;
// (4) aviso único no topo: quando vence (ou venceu) o plano atual, crédito do
// que não foi usado na troca, valor final calculado ao escolher, "por enquanto
// só Pix" — sai o rodapé; (5) na tela do Pix, "Voltar aos planos" no lugar de
// "Fechar" (volta à lista, não à Licença); (6) subtítulo com o nome comercial.
//
// Versão anterior: 1.1.0 · 30/09/2026
//
// v1.1.0 — AJUSTES DO TESTE DO NICOLA (30/09, 20:37): (1) texto curto no topo
// explicando o que muda entre os planos; (2) ofertas agrupadas por plano, com
// a capacidade de cada um (ativos, contratos, pessoas, itens de controle,
// perguntas à IA por mês, espaço no Cofre) lida de plano_funcionalidade —
// nada escrito à mão, segue o que o banco diz; (3) nos anuais, preço cheio
// (12 × o mensal do mesmo plano) riscado, preço à vista e "Economize R$ X (Y%)".
// Só apresentação: valor e BR Code continuam vindo do banco (fn_licenca_cobranca_criar).
//
// Versão anterior: 1.0.0 · 30/09/2026
//
// v1.0.0 — CRIAÇÃO (demanda 1899fe67, ficha F10 v1.0.0, frente 1).
// Tela em Sheet (única superfície modal — REGRAS §2) que:
//   1. lista as ofertas de fn_ofertas_renovacao (renovação do plano atual,
//      plano ampliado sugerido e upgrades), com nome e preço;
//   2. ao escolher, chama fn_licenca_cobranca_criar — o VALOR e o BR CODE
//      vêm do banco, nunca do navegador — e mostra QR + "Pix copia e cola",
//      o código da cobrança (txid) e o crédito pró-rata quando houver;
//   3. "Já paguei" chama fn_licenca_pagamento_informar; a confirmação é do
//      Gestão (fn_gestao_pagamento_confirmar).
// Se a cobrança anterior foi recusada, o motivo aparece em destaque.
// Sem tabela, coluna ou função nova: consome só o que a F10 criou.
// O QR é desenhado por qrcode-generator 1.4.4 (MIT), carregado sob demanda do
// jsdelivr (mesma origem já usada pelo app); se não carregar, o "copia e cola"
// continua funcionando sozinho.
// ============================================================================

---

## `js/comum-sobre.js`

//
// v1.1.1 — BUG FIX de conformidade visual (achado pelo usuário): botão
// "Enviar" (feedback via texto) usava `bg-slate-700`, destoando dos 2
// botões vizinhos no mesmo box (WhatsApp/E-mail), que já usam
// `var(--pine)` — o padrão de ação principal do módulo de Imóveis.
// Corrigido pra usar o mesmo token. Como este arquivo é compartilhado
// (montado tanto dentro de index.html quanto de cofre.html via
// mount-point), e os dois hosts já têm `--pine` definido no próprio
// :root com o mesmo valor, a correção vale nos 2 lugares sem precisar
// de nenhum ajuste condicional por host.
//
// v1.1.0 — pedido explícito: "adicione no módulo de Sobre a versão do
// módulo do Cofre, e dos bots".
//   1) VERSÕES DE MÓDULO (App/Cofre) — cada host passa a versão do
//      PRÓPRIO módulo (sempre exata, o host sabe a sua) e, opcionalmente,
//      a versão que ele conhece do(s) outro(s) módulo(s) (ctx.modulos,
//      array). Não existe hoje nenhuma fonte única compartilhada de
//      versão de arquivo estático entre index.html e cofre.html (2
//      arquivos independentes, sem build/bundler) — mesma limitação já
//      documentada no antigo modal-sobre-cofre do Cofre ("precisa ser
//      atualizada manualmente a cada bump"). Não resolvido aqui (seria
//      uma mudança de infra maior, não pedida); só herdado e mantido
//      visível/documentado no lugar certo.
//   2) VERSÃO DOS BOTS — ao contrário do módulo acima, ESTA é ao vivo de
//      verdade: a tabela `edge_function_versoes` já existe (populada por
//      cada Edge Function sozinha, no boot — ver whatsapp-webhook/index.ts
//      `FUNCTION_VERSAO`/registro em `edge_function_versoes`) — nunca
//      fica desatualizada porque não é este módulo que escreve nela,
//      só lê. RLS da tabela já restringe SELECT a quem tem
//      fn_sou_master() = true — então esta seção simplesmente não
//      aparece pra usuário comum (a query volta vazia, não erro); é
//      informação operacional, não de produto.
//
// v1.0.0 — PRIMEIRA VERSÃO. Ver detalhes no changelog original (extração
// de aplicarBrandingCliente()/atualizarSecaoSobreLicenca()/
// enviarFeedbackLivreSobre() de index.html Beta v1.63.0).
//
// O QUE FICOU DE FORA DE PROPÓSITO (continua no host, não neste
// módulo): logout de verdade (signOut + reload) — cada host pode querer
// um comportamento pós-logout diferente (ex.: redirecionar pra uma tela
// diferente), então este módulo só dispara `ctx.onLogout()`, nunca
// implementa o signOut ele mesmo. Mesmo princípio de callback já usado
// em comunicacoes-app.js (onToast/onAcaoFinal) dentro do próprio
// index.html.
//
// Diretriz Arquitetural: não cria seu próprio cliente Supabase pra
// dados de conta — recebe `dbAuth` já autenticado do host, por
// parâmetro (ver nota completa em comum-licenca.js).
// ============================================================================

---

## `js/contratos.js`

//
// Versão anterior: 1.40.0 · 04/10/2026
//
// v1.40.0 (UX F1.4a, demanda c71f617c, sessão 20261003-1707-ux-base; aprovada pelo Nicola 04/10 15:46) —
// esqueleto no lugar de "Carregando..." em Ocorrências, Distribuição, Itens de controle e Documentos
// da ficha do contrato.
//
// Versão anterior: 1.39.1 · 04/10/2026
//
// v1.39.1 (F0.2a, testes do Nicola 04/10 00:52) — (1) "Remover fiador" desvincula a parte do
// contrato e agora tem "Desfazer" por 5 s no toast (regra aprovada: Desfazer onde voltar é
// trivial). (2) Divisão do contrato com soma ≠ 100%: sai a pergunta "Salvar mesmo assim?" —
// o banco nunca aceita; vira aviso vermelho e o sheet continua aberto para ajustar.
//
// Versão anterior: 1.39.0 · 04/10/2026
//
// v1.39.0 (F0.2a do PLANO_UX, demanda 9e4aca28, sessão 20261003-1707-ux-base, "de acordo"
// do Nicola 04/10 00:22; UXR-29/30) — ZERO diálogo nativo neste módulo: os 26 alert(),
// 7 confirm() e 2 prompt() viram os substitutos do js/raiz-ui.js pelos atalhos do index
// (rzAvisar = toast, rzPerguntar = confirmação em Sheet — destrutiva como último item
// vermelho, rzEscolherUm = escolha em lista, rzPedirTexto = Sheet com campo, rzResumo =
// resumo de várias linhas). Textos reescritos sem emoji e sem pedido técnico ("copie esta
// mensagem e me envie"). Funções que perguntam viraram async (adicionarSocioContrato).
// CORREÇÃO NA MESMA ENTREGA: 4 mostrarToast(..., 'erro') saíam com a cor de SUCESSO (o
// toast não conhece 'erro') — passam a 'danger'.
//
// Versão anterior: 1.38.0 · 03/10/2026
//
// v1.38.0 (F0.3, demanda 29bed5eb, sessão 20261003-1707-ux-base, "de acordo" do Nicola 03/10 23:57) — forma de pagamento única: o contrato passa a usar a mesma lista da baixa (PIX, Boleto, Dinheiro,
// Transferência, Cheque). "Depósito" sai (nenhum contrato usava) e, se vier de dado antigo, abre
// como Transferência.
//
// Versão anterior: 1.37.0 · 03/10/2026
//
// v1.37.0 (F0.5 complemento, UXR-31a, sessão 20261003-1707-ux-base, demanda
// 4c7f2264 — Nicola 03/10 21:28: "novo contrato ainda com elementos fora"):
// bloco de cada fiador deixa o estilo solto (fundo #f8fafc, bordas #cbd5e1,
// rótulos 10 px) e passa a .rz-card + .rz-f/.rz-f2 — mesma casca do resto do
// formulário; "Remover" vira botão terciário; divisão de sócios vira .rz-row
// com campo % na casca única e ✕ como .rz-ico-btn. Sem mudança de dado.
//
// v1.36.1 (demanda 854f6343, pedido do Nicola 03/10/2026 11:20, sessão
// 20260927-2205-contratos) — o sheet "Itens do imóvel" (IPTU/condomínio do
// contrato) só aparece com o contrato ATIVO; em Assinando não, porque a data e
// o contrato ainda não estão confirmados. Aparece ao ativar o contrato. O banco
// recusa o mesmo (migration contratos_encargos_v3_2).
//
// v1.36.0 (demanda 854f6343, encargos v3, plano aprovado pelo Nicola em
// 02/10/2026 23:47, sessão 20260927-2205-contratos) — sheet "Itens do imóvel"
// no modelo por responsável: cada contrato cria o SEU item de IPTU e de
// condomínio do ano. IPTU pede o valor ANUAL e mostra a conta (valor × dias do
// contrato no ano ÷ dias do ano = devido, e as parcelas); condomínio pede o
// valor MENSAL e mostra as competências (mês parcial proporcional). O texto
// avisa que o período sem contrato vira o item "vago" do proprietário. Ano de
// referência: o atual, ou o do início do contrato se for posterior. Item do
// modelo anterior no imóvel continua impedindo a criação (o banco recusa).
//
// v1.35.0 (demanda 854f6343, encargos v2, plano aprovado pelo Nicola em
// 02/10/2026 13:28, sessão 20260927-2205-contratos) — sheet "Itens do imóvel":
// IPTU vira item POR EXERCÍCIO. Pede "Parcelas no ano" (1 = à vista), 1º
// vencimento e valor da parcela; o banco gera só as parcelas que faltam até
// dezembro. Se a cidade do imóvel tem calendário de IPTU, as datas vêm dele e
// o campo de parcelas fica travado; a parte credora vem da parte padrão da
// cidade (fn_parte_padrao_resolver). IPTU de outro exercício não conta como
// "já existe". RPC fn_contrato_criar_item_encargo ganha p_parcelas
// (migration contratos_encargos_responsavel_v2).
//
// v1.34.0 (pedido do Nicola, 02/10/2026 01:55, sessão 20260927-2205-contratos) —
// menu ⋮ da ficha do contrato: sai "Abrir o imóvel"; entra "Dados do contrato"
// no topo (qualquer status), abrindo abrirDadosContratoLeitura — sheet só de
// leitura com Contrato, Revisionais, Encargos e Locatário.
//
// v1.33.0 (demanda 854f6343, sessão 20260927-2205-contratos, pedido do Nicola:
// "imóvel sem item — o formulário oferece criar") — oferecerItensEncargoContrato:
// depois de salvar um contrato Ativo/Assinando que trata de IPTU/condomínio
// (locatário paga ou valor informado), se o imóvel não tem o item de controle,
// abre o sheet "Itens do imóvel" (1º vencimento + valor). Cria pelo banco
// (fn_contrato_criar_item_encargo, migration contratos_encargos_responsavel_v1).
// Quem paga cada item passa a ser definido pelo banco (trigger
// trg_contrato_sincroniza_encargos) — nada disso é regra no JS.
//
// v1.32.0 (demanda 5ca973d6, pedido do Nicola em 02/10/2026 00:19, sessão
// 20261002-0020-contratos-assinando) — contrato em Assinando:
//   1) Menu ⋮ da ficha sem "Reajustar contrato" e "Renovar contrato";
//      lancarReajusteContrato e renovarContrato recusam com aviso se chamados
//      de outro ponto, e a Linha do tempo não fica clicável.
//   2) "Ativar contrato" abre o FORMULÁRIO do contrato preenchido, já com
//      status Ativo, para completar, conferir e salvar (ativarContratoPeloFormulario).
//      Ao salvar volta à ficha do contrato. Antes abria só o sheet de status.
//
// v1.31.0 (demandas 5ca973d6 e 11afd25f, pedidos do Nicola testando no celular
// em 01/10/2026 23:57, sessão 20261002-0005-contratos-ficha):
//   1) Salvar contrato agora ESPERA a gravação no banco antes de voltar à
//      ficha (saveContrato async + await salvarContratoIndividual). Antes a
//      ficha reabria com o id provisório 'con_...' e não mostrava o contrato,
//      a Parte nem a Linha do tempo até sair e voltar. Contrato NOVO sem
//      contexto de retorno abre direto a ficha dele.
//   2) Excluir contrato apaga antes os itens de controle do contrato
//      (reajuste/revisional; as ocorrências caem em cascata). Antes a FK
//      cofre_itens_controle_contrato_id_fkey barrava a exclusão.
//   3) Chip Reajuste: sai o card "O que você pode fazer" (Renovar continua
//      no menu ⋮ da ficha); "Pelo mercado" passa para antes da Linha do tempo.
//   4) "Reajustar contrato"/"Registrar revisão" (lancarReajusteContrato) abre
//      com Novo valor e % já preenchidos pela simulação do índice cadastrado
//      (fn_simular_reajuste_contrato — o mesmo "Valor reajustado (estimado)"
//      do card Pelo contrato), venha de onde vier a chamada (Linha do tempo,
//      Resumo, menu). Campo que o usuário já digitou não é sobrescrito.
//
// v1.30.0 (demanda 5ca973d6, pedido do Nicola em 01/10/2026 23:26, sessão
// 20261001-2335-contratos-rotulos) — rótulos: o chip "Renovação" da ficha do
// contrato passa a se chamar "Reajuste" (id interno 'renovacao' mantido) e a
// ocorrência/linha de revisão passa a se chamar "Revisional" (Linha do tempo e
// OC_CONTRATO_ROTULO). Só texto.
//
// v1.29.0 (demanda 5ca973d6, teste ba98 reprovado pelo Nicola em 01/10/2026,
// sessão 20261001-2315-contratos-partes) — card "Linha do tempo" do chip
// Renovação mostrava "Não consegui carregar reajuste/revisão." em todo
// contrato COM itens de reajuste/revisional. Causa: montarItensControleContrato
// usava o helper rs() de selo de status, que só é declarado dentro de
// abrirFichaContrato — fora dele dava ReferenceError, engolido pelo catch.
// A RPC fn_contrato_itens_controle_listar sempre respondeu certo. Correção:
// declarar rs() no escopo da própria função, igual às outras duas cópias.
//
// v1.28.0 (demanda 11afd25f, sinérgicas 3b458eb4 e c0d255e3, sessão
// 20260927-2205-contratos, pedido explícito do Nicola: "ao optar por dados
// novo contrato o formulário é diferente do cadastrar contrato manualmente.
// Devem ser idênticos") — UM formulário de contrato só:
//   1) O popup "Dados Novo Contrato" (dnc-*, abrirDadosNovoContratoPopup/
//      salvarDadosNovoContratoPopup, ~300 linhas) saiu. Ele nunca gravou
//      nada sozinho — copiava os campos pro formulário completo e chamava
//      saveContrato(). abrirDadosNovoContratoPopup(imovelId) continua
//      exportada, agora só abre o formulário completo
//      (criarContratoParaImovel: imóvel escolhido, contrato Assinando com
//      os dados do link já carregado, aluguel do imóvel e vencimento 5).
//   2) O que o popup tinha de melhor foi pro formulário completo: endereço
//      do locatário em campos separados (comum-endereco.js, prefixo
//      con-loc — montarEnderecoLocatarioForm/lerEnderecoLocatarioDoForm/
//      carregarEnderecoParteLocatario) e fiadores na mesma tela, 0..N
//      (#con-fiadores-lista). BUG corrigido junto (3b458eb4): no popup, o
//      bloco estruturado era montado numa variável que o HTML nunca usava —
//      a tela mostrava sempre o textarea antigo, e rua/CEP nunca chegavam à
//      Parte do locatário.
//   3) Fiadores com 2 travas novas: saveContrato() só regrava fiadores
//      quando a lista MUDOU desde que foi carregada (fiadoresParaSalvar —
//      editar o telefone não faz delete+insert dos fiadores), e erro ao
//      carregar não vira "lista vazia" (antes, um save em seguida apagaria
//      os fiadores salvos).
//   4) abrirEscolhaNovoContrato(imovelId?) aceita o imóvel: com ele, "Novo
//      contrato" já abre com o imóvel e entra "Coletar dados do locatário"
//      (link, WhatsApp e minuta). Vazio da lista de Contratos sem filtro
//      ganha o botão "+ Novo contrato".
//
// v1.27.0 (Bloco B, demandas 5ca973d6/854f6343, sessão 20260927-2205-contratos,
// pedido explícito do Nicola) — reajuste e revisional de contrato passam a
// ser itens de controle (cofre_itens_controle), acionáveis pelas próprias
// ocorrências, não só pelo botão solto do chip:
//   1) Chip Renovação ganha o card "Linha do tempo"
//      (montarItensControleContrato, chamada nova em abrirFichaContrato):
//      lista os itens de reajuste_contrato/revisional_contrato do contrato
//      (fn_contrato_itens_controle_listar) com as ocorrências passadas
//      (concluídas) e futuras (em aberto). Não depende dos campos novos do
//      formulário (index.html) — lê tudo direto da RPC.
//   2) lancarReajusteContrato()/salvarReajusteContratoPopup() ganham 2
//      parâmetros opcionais (ocorrenciaId, subtipoCodigo): quando vêm de
//      uma ocorrência da "Linha do tempo", fn_contrato_reajustar fecha
//      AQUELA ocorrência (p_ocorrencia_id) em vez de criar um lançamento
//      avulso, e o sheet troca o rótulo pra "revisão" quando o subtipo é
//      revisional_contrato. Sem os 2 parâmetros (botão "Aplicar o reajuste
//      contratual", uso solto de sempre), comportamento idêntico ao de
//      antes.
//   3) saveContrato() lê os 4 campos novos do card "Reajuste e Revisão"
//      (index.html, mesma entrega): reajustePeriodicidadeMeses/
//      reajusteTetoPct/reajustePisoPct/revisionalPeriodicidadeMeses — em
//      branco vira null, nunca 0/12 salvo por engano. editarContrato()
//      preenche os 4 com o que já está salvo no contrato (nunca o padrão
//      de contrato novo), pra editar um contrato antigo sem periodicidade
//      configurada não criar um item pra ele por baixo dos panos — sem
//      backfill dos 72 contratos já cadastrados, pedido explícito do
//      Nicola ("só de renovação que faltam").
// Banco: migrations contratos_reajuste_revisional_itens_controle_v1 e v2
// (fn_contrato_itens_controle_gerar/fn_contrato_itens_controle_listar,
// unicidade de item por contrato/subtipo, fn_contrato_reajustar com
// p_ocorrencia_id).
//
// v1.26.0 (demandas 3b458eb4/8e661f53/c83fb2d3(fatia contratos.js)/8909ebf4 +
// 1301897c(duplicata, encerrada junto), 30/09/2026) — 4 achados do retorno do
// piloto (Nicola, 29/09):
//   1) (3b458eb4) O popup "Dados Novo Contrato" lê o CEP/endereço do
//      locatário pelo bloco estruturado de comum-endereco.js, mas só
//      gravava o texto concatenado (locatarioEnderecoAtual) — os campos
//      rua/número/bairro/cidade/UF/CEP nunca chegavam na Parte do
//      locatário (partes.endereco_rua etc., index.html). Guarda também o
//      objeto estruturado (enderecoLocatarioEstruturadoAtual, mesma trava
//      de contratoId que fiadoresContratoAtual já usa) pra
//      sincronizarContratoSupabase() gravar nas duas formas.
//   2) (8e661f53) "Cancelar" no formulário de fiador (atalho pós-salvar)
//      parecia desfazer o contrato recém-criado — não desfazia (o INSERT
//      já tinha acontecido antes do confirm()), mas o formulário fechava
//      sem garantir um re-render da lista. Corrigido em index.html
//      (salvarContratoIndividual): aguarda o Sheet de fiador fechar
//      (salvando OU cancelando) e força renderContratos() de novo.
//   3) (c83fb2d3, mesmo achado da 1301897c) botão "..." de reajuste
//      removido do formulário (index.html) — Nicola confirmou que
//      aparecia tanto ao criar quanto ao editar; painel de reajuste
//      (#secao-avancada-contrato) fica órfão de propósito, aguardando o
//      Bloco B (demandas 5ca973d6/854f6343).
//   4) (8909ebf4) Ficha do contrato: o card "Precisa de atenção" dizia
//      "Gerado pela Vitrine" pra QUALQUER contrato com status Assinando
//      — inclusive um cadastrado manualmente pelo app, já que Assinando
//      também é o valor padrão do formulário. Texto virou neutro de
//      origem (não afirma mais de onde veio).
// Sem migração de banco — item 1 só grava em colunas que já existem em
// `partes` (mesmas que comum-endereco.js/comum-partes.js já usam).
//
// v1.25.0 (demanda 11afd25f + parte de ec7d8a9f, 29/09/2026) — Reorganização do
// formulário de contrato + atalho de Partes:
//   1) Campos opcionais (IPTU/condomínio, forma de pagamento, índice de
//      reajuste, rateio, administradora, documentos, observação) saem da
//      vista por padrão, atrás de "+ Mostrar mais campos" — mesmo padrão já
//      usado em cofre-ativos.js v1.66.0 (ec7d8a9f). Nasce ABERTO ao editar um
//      contrato existente (editarContrato) e FECHADO ao cadastrar um novo
//      (cancelarEdicaoContrato) — nenhum campo obrigatório entra nesse bloco.
//   2) saveContrato() marca contratoDados._novo (não persiste — só existe em
//      memória local, sincronizarContratoSupabase() em index.html monta a
//      `linha` campo a campo e não inclui) para o salvamento saber se deve
//      oferecer "cadastrar fiador agora" (salvarContratoIndividual).
//   Sem migração de banco. Nenhum campo some da tela, nenhum dado antigo é
//   apagado — só reagrupados/escondidos por padrão.
//
// v1.24.0 (retorno do piloto, 3 pedidos do Nicola):
// (1, demanda 1163097a) — abrirInfoAluguelAntecipado()/abrirInfoDescontoEnergia()
// novas: mesmo padrão de abrirInfoReajusteContrato() (abrirSheet/
// rzSheetCabecalho, globais do app principal) — ícone (i) nos campos
// "Aluguel Antecipado?" e "Desconto Energia (%)" do formulário de
// contrato (index.html v1.269.0).
// (2, demanda c0d255e3) — abrirEscolhaNovoContrato() nova: o "+" de
// Contratos (btn-toggle-contrato, index.html) ia direto pro formulário
// manual, sem nenhuma pista de que também existe o caminho por
// documento com IA (mesma lacuna do "+" de Ativos antes do Onda/fatia 7 —
// lá já foi resolvida com abrirSheetAcoes). Reaproveita
// abrirUploadDocumentoNoApp() (index.html, já usado pelo sheet Raiz IA do
// cabeçalho) — "Carregar documento" primeiro, "Novo contrato" (manual)
// depois.
// (3, demanda 1301897c) — achado ao investigar a bolinha "..." de
// reajuste (btn-toggle-reajuste-contrato): já fica escondida ao CRIAR um
// contrato novo desde a v1.41.2 (cancelarEdicaoContrato() esconde o
// botão) — nenhum código mudado aqui, comportamento confirmado correto;
// ver observação na entrega sobre o caso reportado pelo Nicola.
//
// v1.23.1 (demanda 303e68dc, achado do piloto — Claudia, 28/09/2026):
// criarContratoParaImovel() vira async e ganha 1 retentativa: se o imóvel
// ainda não está no array `imoveis` em memória (janela entre criar o ativo
// e a atualização assíncrona de aoEscrever('ativo', ...), index.html),
// recarrega direto do Supabase antes de desistir. Antes, `if (!imo) return;`
// falhava em silêncio — nenhum toast, nenhum log, a tela "não abria". Sem
// mudança de banco. Ver também js/vitrine.js v1.2.1 (mesmo padrão, mesma
// demanda — bridge da opção "Contratação: link, WhatsApp e minuta").
//
// v1.23.0 (demanda d92a6dfc, pedido do Nicola 24/09 18:50 + decisão 25/09
// "Restante de acordo. Pode implementar."): card "Condições" da ficha
// ganha, quando o contrato tem administradora, uma linha somente leitura
// "Recebimento esperado" (bruto do aluguel, taxa da administradora e
// líquido esperado) — mesma conta já usada no formulário de contrato
// (index.html, atualizarValorLiquidoEsperado). Sem administradora não
// mostra (bruto = líquido = "Aluguel", já exibido acima).
//
// v1.22.0 (demanda e19d6739, testes reprovados pelo Nicola em 23/09/2026):
// (1) dar baixa numa mensalidade no Financeiro levava o usuário para a
// ficha de um contrato. Causa: o ouvinte de 'mensalidade' reabria a ficha
// sempre que fichaContratoAtualId estava preenchido — e ele fica "velho"
// quando se sai da ficha pelo rodapé ou pelo voltar do celular;
// abrirFichaContrato() faz switchTab. Agora só redesenha se a ficha for a
// tela visível. (2) Editar o nome da parte locatária não mudava a ficha
// nem a lista: contratos.locatario é cópia em texto. O salvar da parte
// (index.html v1.258.0) propaga para os contratos e emite 'parte' com
// contratoIds; aqui a lista e a ficha visível se redesenham.
//
// v1.21.0 (demanda 3cc64651, pedido explícito do Nicola 23/09/2026: "Ao
// clicar no menu 3 pontinhos da parte, nao aparece opcao adicionar parte.
// so editar. ainda nao permite o clique na parte. ao editar locatario ou
// parte ainda mostra tela de transicao") — card Partes da Ficha do
// contrato, o que be42b19f/176b3145 não cobriram aqui: (1) tocar no
// locatário abre o form da parte direto (abrirEditarLocatarioContrato);
// tocar num fiador abre o form DAQUELE fiador (abrirFormFiadorContrato,
// novo, gramática .rz-f) em vez da lista "Fiadores do contrato"; (2) todo
// ⋮ de parte (card, locatário, fiador) tem "Adicionar parte", direto pro
// form de fiador novo (adicionarParteContrato); (3) ⋮ do fiador ganhou
// Editar/Remover DAQUELE fiador (índice), sem seletor no meio.
//
// v1.20.0 (demanda 0e40951a, complemento — pedido explícito do Nicola,
// 22/09/2026: "adicione esta possibilidade tb no card financeiro do
// contrato", referindo-se à nova função de criar recebimento avulso de
// js/financeiro.js v1.19.0) — abrirAcoesCobrancasContrato() (⋮ do card
// "Financeiro" da Ficha, fc-painel-cobrancas): nova ação "Adicionar
// recebimento", chama window.abrirNovoRecebimento(contratoId) (módulo
// isolado — financeiro.js, ver window[nome] em index.html) já com o
// contrato certo, sem seletor. Listener novo (module boot, guarda
// window.__rzListenerEscritaMensalidadeContratoLigado): este arquivo nunca
// escutava a entidade 'mensalidade' (só emite/ouve a própria 'contrato') —
// o card "Financeiro" da Ficha não se atualizava sozinho quando um
// recebimento nascia de fora dela (ex.: pelo quadrante Adicionar em
// Financeiro) — reabrirFichaSeFor() já existia (usada por outras 12
// funções deste arquivo), só reaproveitada.
//
// v1.19.0 (demanda 176b3145 — padronizar experiência de Parte em todos os
// locais, pedido explícito do Nicola) — abrirAcoesPartesContrato()/
// abrirAcoesLocatarioContrato(): "Editar locatário" era rótulo fixo mesmo
// quando o contrato ainda não tinha locatário (con.locatario vazio) —
// agora "Adicionar locatário"/"Editar locatário" dinâmico, mesmo padrão
// que "Adicionar/Editar fiador" já usava aqui do lado (serviu de
// referência). Ver changelog de index.html v1.244.0/cofre-app.js v1.37.0
// pro resto do rollout desta demanda (o clique num locatário/fiador
// existente agora vai direto pro form de edição, sem passar pela Ficha
// como tela intermediária).
//
// v1.18.0 (Fase 1 do wrapper de escrita, rollout Contratos+Minutas — pedido
// do Nicola 22/09/2026) — adoção do utilitário js/raiz-eventos.js (piloto
// único até aqui era cofre-ativos.js, ver changelog dele/de raiz-eventos.js)
// em TODA função deste arquivo que persiste escrita de verdade no banco:
// salvarFiadoresStandalone, excluirContrato, salvarReajusteContratoPopup,
// salvarAlterarStatusContrato (inclusive o ramo de exclusão inline, que
// duplicava a mesma operação de excluirContrato sem avisar ninguém),
// salvarDadosNovoContratoPopup (cria OU edita — mesmo emitirEscrita nos
// dois casos, id resolvido depois do saveContrato()), salvarObservacaoContrato
// (ganhou um 6º parâmetro opcional `acaoEmitir`, default 'observacao' —
// salvarDadosLocatarioContrato/salvarDetalhesContrato passam 'editar-
// locatario'/'editar-detalhes' nessa chamada em vez de cada um emitir por
// conta própria, senão a mesma gravação disparava o evento 2x, uma vez
// genérico e outra específico), salvarDivisaoContratoPopup,
// salvarBaixaOcorrenciaContrato, salvarReagendarOcorrenciaContrato,
// salvarRenovacaoContratoPopup. Todas emitem a MESMA entidade 'contrato'
// (raiz:escrita), só o `detalhe.acao` muda — quem ouve se inscreve 1x.
// BUG DO cofre-ativos.js (objeto local ficava velho até um recarregamento
// assíncrono terminar) — VERIFICADO EM CADA UMA DAS 12 FUNÇÕES ACIMA E NÃO
// ENCONTRADO: este arquivo já mutava `con` (Object.assign/atribuição direta
// de campo) IMEDIATAMENTE após a escrita confirmada, bem antes desta
// entrega, em todas elas — o mesmo padrão que o fix do cofre-ativos.js
// introduziu lá já era o padrão daqui. Nenhuma correção de bug foi
// necessária, só a instrumentação do evento.
// LISTENER (module boot, guarda window.__rzListenerEscritaContratoLigado):
// aoEscrever('contrato', ...) chama renderContratos() — a ÚNICA lacuna real
// encontrada (a ficha aberta já se auto-recarrega, chamada direta logo
// após cada emitirEscrita acima — reagir a ela também no listener dobraria
// o fetch de fiadores/ocorrências à toa; a LISTA, porém, só era redesenhada
// ao entrar na aba ou usar a busca — uma escrita feita de outro ponto da
// tela, ex. a partir da ficha do imóvel, nunca a atualizava sem F5).
//
// v1.17.0 (demanda c75076ed, "Tela 'Novo contrato' no padrão do sistema +
// remover Histórico do formulário de criação", achado do Nicola em
// revisão de telas, 21/09/2026) — o grosso desta entrega é HTML
// (index.html v1.242.0, form-contrato-wrapper: .rz-f/.rz-f2/.rz-card no
// lugar de Tailwind de cor + classes raiz-* legado, z-[65] aposentado
// vira z-[97]). Aqui em contratos.js só o item 2 (esconder o Histórico ao
// criar):
//   - editarContrato(): logo após renderHistoricoContratoInline(con),
//     remove 'hidden' de #con-historico-bloco (contrato existente — o
//     histórico já tem pelo menos 1 item real, faz sentido mostrar).
//   - cancelarEdicaoContrato(): logo após renderHistoricoContratoInline
//     (null), adiciona 'hidden' em #con-historico-bloco (contrato novo —
//     "o primeiro histórico só nasce ao salvar", não faz sentido mostrar
//     a caixa vazia). Mesmo mecanismo que #secao-avancada-contrato
//     (painel de reajuste) já usava para a mesma distinção criar/editar.
//
// v1.16.0 (demanda be42b19f, "Padronizar componente de Parte em todo o
// app", achado do Nicola em revisão de telas, 21/09/2026) — 2 itens desta
// demanda vivem aqui (os outros: cofre-controles.js/cofre-api.js/
// cofre-app.js/comum-partes.js novo — ver changelog deles):
//   (1) "Dados Novo Contrato" (abrirDadosNovoContratoPopup): campo
//   "Endereço atual do locatário" era 1 textarea de texto livre — passa a
//   usar o bloco de endereço estruturado (comum-endereco.js), mesmo
//   componente que Configurações › Partes e o Item de Controle já usam.
//   salvarDadosNovoContratoPopup() concatena os campos estruturados num
//   texto só (locatario_endereco_atual continua sendo 1 coluna de texto,
//   sem migration nesta tela) — e, editando um contrato existente sem
//   tocar no bloco, MANTÉM o endereço já salvo em vez de apagar (bloco
//   nasce em branco de propósito: não dá pra reconstituir rua/número a
//   partir do texto livre antigo).
//   (2) montarChipsPartesContrato() (chip "Partes" do popup "Detalhes do
//   Contrato" — aberto tanto de contratos finalizados quanto do botão
//   "Detalhes" do contrato ATIVO, index.html): os chips de Locatário/
//   Fiador/Divisão eram <span>, sem nenhum onclick ("editar locador hoje
//   não abre nada" — exatamente o relato do Nicola). Viram <button>,
//   despachando o mesmo evento cofre:abrir-ficha-parte que o chip
//   "Partes" da ficha nova usa (agora com listener de verdade,
//   index.html) — Locatário e Fiador já vêm com parte_id resolvido na
//   própria consulta; Divisão abre o popup de rateio (demanda 44f30857
//   item 4).
//
// v1.15.0 (demanda 44f30857, achado do Nicola em revisão de telas,
// 21/09/2026) — aba Contratos, 4 correções (item 1, título removido da
// lista, ficou no index.html — ver changelog dele):
//   (2) chip "Renovação" › card "Pelo contrato" ganha botão (i) explicando
//   cada métrica (abrirInfoReajusteContrato()) — mesmo padrão já usado no
//   card "Performance" do ativo (cofre-ativos.js v1.60.0, mesma demanda).
//   (3) Ficha do contrato, card "Cobranças": o ⋮ de cada mensalidade
//   disparava o onclick do rz-row inteiro (switchTab('tab-mensal') +
//   rzAcoesMensalidade), então "Dar baixa"/"Excluir" sempre navegavam pra
//   Financeiro antes de agir — ganhou onclick próprio com
//   event.stopPropagation(), rzAcoesMensalidade() funciona de qualquer aba.
//   (4) "Editar a distribuição do aluguel entre proprietários"
//   (abrirAcoesDistribuicaoContrato) abria o formulário inteiro de editar
//   contrato só pra chegar numa seção de rateio — passa a abrir direto o
//   popup "Alterações" de divisão societária (abrirAlteracoesDivisaoSocietaria,
//   index.html), o mesmo já usado pela ficha do imóvel — sem duplicar
//   formulário. salvarDivisaoContratoPopup() agora também atualiza o card
//   "Distribuição" da ficha do contrato quando salvo por esse caminho.
//   (5) abrirDetalheOcorrenciaContrato() (ex.: clicar numa ocorrência já
//   concluída de tipo "Assinatura"): o campo "Descrição" (texto livre)
//   dividia a grade de 2 colunas com os campos curtos (Tipo, Status,
//   datas) e ficava espremido — ganhou .rz-full (mesma classe que .rz-kv
//   já define pra isso), agora ocupa a linha inteira.
//
// v1.14.0 (Entrega B1.2, PLANO_IMPLEMENTACAO_RESULTADOS_MERCADO_FISCAL
// v2.0.0, migration mercado_reajuste_simulador_v1) — chip Renovação ›
// "Pelo contrato": "Acumulado 12m" e "Valor reajustado (estimado)" saem
// do "—" fixo e passam a chamar fn_simular_reajuste_contrato
// (montarSimulacaoReajusteContrato(), nova, chamada logo depois de
// montarDistribuicaoContrato() em abrirFichaContrato) — sempre pelo
// ÍNDICE CADASTRADO no contrato (con.reajuste, texto livre mapeado pra
// uma série do BCB capturada pela B1.1), nunca o mais favorável (ESP
// §13.5 C3). É só simulação — quem aplica de verdade continua sendo
// fn_contrato_reajustar (A.6, ação "Aplicar o reajuste contratual"). O
// card de atenção do aniversário (≤30 dias) ganha o número simulado na
// frase ("...o aluguel vai de X para Y"), completando o mockup da ESP
// §7. Textos de "Pelo mercado" e "✨ Negociar acima do índice" corrigidos
// (não diziam mais a verdade depois da B1.1: os índices JÁ existem no
// banco — o que falta é uma fonte de imóvel comparável pra estimar
// faixa/confiança, não a série de índice) — ambos continuam vazios,
// fora do escopo desta entrega (ideia registrada em separado, demanda
// 1afb0d06).
//
// v1.13.2 — CORRIGIDO (demanda ac549b98, achado gravando as Pílulas de
// demonstração): ao criar um contrato novo, a 1ª entrada de histórico
// ("Contrato criado") interpolava `contratoDados.valor` cru, sem chamar
// formatarMoedaBR() — resultado "R$ 20000/mês" em vez de "R$ 20.000,00/mês".
// Confirmado como bug de código real (não dado de demo): o mesmo texto cru
// aparece no histórico de contratos de teste do próprio Nicola em
// "Rabelo Testes"/"BETA-RAIZ-PATRIMONIO", criados pela UI de produção.
// Corrigido para usar formatarMoedaBR(), no mesmo padrão já usado em todo o
// resto do arquivo (linhas 733/822/1601 etc.). QUA-01 (mesmo padrão em todo
// o código): buscado `R$ ${...}` sem formatarMoedaBR/fmtBR/toLocaleString em
// todo o projeto — achados mais 2 casos em financeiro.js (sheet de
// conciliação, usando `.toFixed(2)` cru — formato americano, ponto decimal
// sem separador de milhar), corrigidos no mesmo changelog daquele arquivo.
//
// v1.13.1 — CORRIGIDO (achado por Nicola em teste manual, contrato de teste
// na empresa Karen Corrêa, aba Financeiro da Ficha do contrato mostrando
// 12/2026, 12/2025, 12/2024, 12/2023, 11/2026, 11/2025... em vez de
// decrescente real): abrirFichaContrato() ordenava mensalidadesDoContrato
// comparando a string bruta "referencia" (formato "MM/YYYY") com
// localeCompare — nessa comparação o MÊS (2 primeiros chars) pesa mais que
// o ANO, então agrupava tudo por mês igual (todo "12/*" antes de todo
// "11/*") em vez de ordenar por competência real. QUA-01 (mesmo padrão em
// código inteiro): achado o idêntico bug em imoveis.js (box Financeiro da
// Ficha do imóvel, mesma correção aplicada ali). Fix: chave de ordenação
// "AAAAMM" (ano+mês, com padStart), mesmo padrão já usado corretamente no
// filtro de competência de financeiro.js (~linha 3066). Nenhuma mudança de
// RPC/banco — client-side only.
//
// v1.13.0 — Entrega A.6 (reduzida, PLANO_IMPLEMENTACAO_RESULTADOS_MERCADO_
// FISCAL v2.0.0 / ESP §7, escolha explícita do Nicola: "A.6 reduzida, mesmo
// padrão da A.3"). Duas mudanças:
//   (1) salvarReajusteContratoPopup() parava de gravar direto em
//   contratos.update()+historico_contrato.insert() (regra de negócio fora
//   do banco, driblando DEM-04/CAN-03) — agora chama fn_contrato_reajustar
//   (migration contratos_fn_reajustar_v1), a mesma função central que a
//   ação "Aplicar o reajuste contratual" da Ficha usa; ela grava em
//   cofre_ocorrencias_controle (tipo='reajuste'), não mais em
//   historico_contrato. Mesma ordem de salvarRenovacaoContratoPopup: anexo
//   sobe ANTES da RPC, pra nascer vinculado (p_documento_id) na ocorrência.
//   (2) abrirFichaContrato() ganhou o 5º chip "Renovação" (REGRAS §10: 5
//   chips Resumo · Cobranças · Renovação · Partes · Anexos): "Pelo
//   contrato" com dado real (aluguel, índice cadastrado, próximo
//   aniversário — calculado a partir de con.inicio, âncora FIXA, nunca do
//   padrão de âncora móvel já achado como bug em
//   fn_diario_contratos_aniversario_reajuste, demanda a9488469, fora do
//   escopo aqui); "Pelo mercado" e "Negociar acima do índice" (IA) em
//   estado vazio honesto — dependem de indicador_series/valores (Fase B1),
//   que ainda não existe no banco (mesma razão/frase da A.3 em
//   resultados.js). "Aplicar o reajuste contratual" e "Renovar o
//   contrato" reaproveitam 100% lancarReajusteContrato()/renovarContrato()
//   já existentes — nenhuma ação nova. CORRIGIDO de passagem: o subtítulo
//   de lancarReajusteContrato() lia con.indiceReajuste (propriedade que
//   nunca existiu — sempre undefined, nunca mostrava o índice); o campo
//   certo é con.reajuste (mesmo usado no card "Condições" da ficha).
//
// v1.10.0 — 2 pedidos explícitos do Nicola:
//   (1) "no chip financeiro do contrato retirar das linhas o label de
//   venceu, vence e pago da frente da data" — linha de mensalidade do
//   painel Financeiro (v1.9.0, abaixo) mostrava "Pago em DD/MM"/"Venceu em
//   DD/MM"/"Vence em DD/MM"; virou só a data nua (mesma info, sem o rótulo
//   redundante à esquerda) — cai pro texto de status ("Vencido"/"A
//   vencer") só quando não há data real (dataPgto nulo).
//   (2) "no chip anexo no contrato, retirar o X e colocar as ações
//   padrões do documento, abrindo o form de arquivo" — montarDocumentos
//   Contrato(): linha ganhava um botão "X" (exclusão direta e definitiva,
//   sem passar pela Ficha do Documento) e o toque no texto abria o
//   arquivo cru numa aba nova (abrirDocumentoContratoAtual, bypass total
//   da Ficha). Os 2 caminhos bespoke saíram — a linha inteira agora é
//   data-action="abrir-documento" (mesmo padrão de cofre-ativos.js
//   montarDocumentosAtivo()), abrindo abrirFichaDocumento() — Baixar/
//   Excluir já existem lá dentro, único fluxo pros 3 contextos (contrato/
//   ativo/item de controle), nada reinventado. abrirDocumentoContratoAtual/
//   removerDocumentoContratoAtual removidas (órfãs, sem outro chamador).
//
// v1.9.0 — CORRIGIDO (pedido explícito: "no chip financeiro do contrato,
// permitir dar baixa ou excluir, e se clicar nela, vai pra aba
// financeira") — abrirFichaContrato(), painel Financeiro: a linha de
// mensalidade ficou clicável inteira (antes só o ⋮ reagia) e agora troca
// pra aba Financeiro (tab-mensal) antes de abrir rzAcoesMensalidade (o
// mesmo sheet Dar baixa/Excluir de sempre — nenhuma lógica nova ali).
//
// v1.8.0 — 3 pedidos explícitos do Nicola na mesma rodada: (1) padrão
// "há/em xx d" (mesma correção replicada em cofre-ativos.js/cofre-
// controles.js/index.html) — a urgência das Ocorrências do contrato
// (aba Financeiro) usava "${dias} dias" cru, sem "Em" e sem ser azul
// (rz-warn/marrom); virou "Em Xd" sem tag colorida (era só tinta de
// ícone, não status pill, então "run" não se aplica aqui — cls vazio,
// mesmo tratamento do "Em dia"); (2) aba Cobranças/Financeiro — texto
// "Vencido"/"A vencer" de cada mensalidade não dizia QUANDO; agora
// mostra "Venceu em DD/MM/AAAA"/"Vence em DD/MM/AAAA" usando
// m.dataPgto (campo que guarda a data prevista até a mensalidade ser
// paga — mesmo uso que mensalidadeEmAtraso() já fazia); (3) renomeado
// o chip "Cobranças" da ficha do contrato para "Financeiro" (e o
// título do card dentro dele) — o id interno (data-fc-chip="cobrancas",
// fc-painel-cobrancas, abrirAcoesCobrancasContrato) não mudou, só o
// texto visível, pra não quebrar nenhuma referência.
//
// v1.7.0 — demanda 53ca281b (print do Nicola: aba Cobranças da ficha do
// contrato mostrando competências de 11/2026 e 12/2026 como "Em atraso"/
// "Vencido" em vermelho, sem terem vencido ainda). Causa raiz: o render
// usava `m.status === 'Inadimplente'` cru — esse rótulo (mapStatusMensalidade
// SupabaseParaAntigo, index.html) junta 'pendente' (ainda não venceu) e
// 'atrasado' (venceu de verdade) no MESMO valor, de propósito, porque outro
// consumidor (abrirAlterarStatusContrato, linha ~748) só precisa saber "tem
// mensalidade não paga" sem se importar com a data. Pra EXIBIÇÃO, isso é
// bug: financeiro.js já resolvia certo há tempo com mensalidadeEmAtraso()/
// mensalidadeAVencer() (index.html), comparando o vencimento de verdade —
// só a ficha do contrato (`atrasadas`, `statusMensal`, `iconeMensal`,
// `classeMensal`, e o texto "Vencido"/"A vencer" de cada linha) não usava
// esse helper. Trocado pra reaproveitar mensalidadeEmAtraso() — mesmo
// padrão, zero lógica nova, contador de "Cobranças" no chip e o total "em
// atraso" no card também corrigem sozinhos (dependem da mesma `atrasadas`).
// NÃO mexido (é a leitura certa pro caso deles): as 2 checagens de
// "pendências financeiras" em abrirAlterarStatusContrato/handleAlterarStatus
// (linhas ~748/~1044) — ali "Inadimplente" = "não pago", vencido ou não, é
// a pergunta certa (trata a pendência ao mudar o status do contrato).
//
// v1.6.0 — pedido explícito: (1) card "Ocorrências" da ficha — chip
// colorido saiu (padrão reservado a alertas/status; urgência virou parte
// do subtítulo), TODA linha ficou clicável (fechada/cancelada abre
// abrirDetalheOcorrenciaContrato, resumo só-leitura, antes não fazia
// nada), data não trunca mais (.rz-row-oc, CSS no index.html); (2)
// "Histórico" saiu do ⋮ da ficha (redundante — a ocorrência já é o
// histórico).
//
// v1.5.0 — Onda 12 (pedido explícito: "único caminho de escrita, na
// tabela de ativos"). Write direto de imoveis.status (sincronização de
// status ao mudar ação do contrato) trocado pra cofre_ativos.situacao_uso
// — imo.id já é o id do ativo desde que carregarImoveisSupabase()
// (index.html) trocou de fonte.
//
// v1.4.0 — Onda 12 (pedido explícito, 16/09/2026: "retirar a faixa de
// aviso no topo da tela de contratos"). banner-revisao-contratos
// ("⚠️ Você tem alertas em contratos!") removido de renderContratos() —
// resíduo pré-Motor de Alertas, redundante com o status por linha
// (statusContratoHtml). Variáveis pendentesRevisao/vencidos saíram
// junto, só existiam pra alimentar o banner. Elemento correspondente
// removido de index.html (Beta v1.188.0).
//
// v1.3.1 — PLANO_IMPLEMENTACAO v1.0, etapa E0.1 (achado A6): formulário de
// contrato sobreposto. criarContratoParaImovel() não troca mais de aba
// (switchTab('tab-contratos')) nem espera setTimeout(150) — o wrapper
// #form-contrato-wrapper passou a viver no <body> (rzMoverFormContratoParaBody,
// index.html v1.181.0), mesmo padrão do formulário de imóvel desde a
// v1.108.0. Causa do bug: o wrapper é `fixed inset-0 z-[65]` mas estava
// dentro de <section id="tab-contratos">, e section com display:none não
// renderiza filho `fixed` — abrindo pela ficha do ativo, o form ficava
// atrás da ficha. A origem (window.fichaContratoOrigem) agora é preservada
// no reset de abertura, senão o Cancelar seguinte não sabia para onde voltar.
//
// v1.3.0 — Etapa 7 do PLANO_CONCILIACAO_FINANCEIRO_RAIZ_v1_4.md (Parte G.2
// item 2): ao ativar um contrato com início no passado, pergunta se quer
// criar também os recebimentos retroativos (mês a mês, até o mês atual) —
// fn_gerar_mensalidades_horizonte só gera pra frente, e o botão "Gerar mês"
// que preenchia isso manualmente saiu (financeiro.js, Etapa 7). Nunca
// decide sozinho — sempre pergunta antes (confirm()), mesmo padrão já
// usado no resto do arquivo. fn_mensalidades_realinhar (reajuste/renovação)
// e fn_gerar_mensalidades_horizonte (ativação/renovação) já estavam
// wired numa sessão anterior — sem mudança nesses dois pontos.
//
// v1.2.0 — módulo Apoio ao Contador, itens 5/6 do plano (10/09/2026): ao
// ativar ou renovar um contrato, chama fn_gerar_mensalidades_horizonte
// (banco, 90 dias) em vez da geração de 1 mês só em JS local — mesma RPC do
// botão "Gerar Mês" (financeiro.js) e do cron diário. gerarMensalidadesPara
// Competencia (index.html) não é mais chamada daqui.
//
// v1.1.0 — A.10 (ocorrências como histórico universal, PROPOSTA v2.0 §4.3):
//   (1) Card "Ocorrências" na ficha do contrato (painel Resumo, logo abaixo
//       de Condições) — mesmo molde do box da ficha do item de controle
//       (cofre-controles.js): abertas primeiro (vence/vencido), depois as
//       registradas (reajuste, renovação, alteração, assinatura, anexo…), até
//       8 linhas + "Ver tudo" (histórico). Lê cofre_ocorrencias_controle por
//       contrato_id (a view historico_contrato continua servindo o histórico).
//       Linha aberta → sheet Dar baixa / Reagendar (triggers do banco espelham
//       na despesa, quando houver).
//   (2) "Renovar contrato" (código contratos.estender) no ⋮ da ficha e do card:
//       novo fim, valor (opcional, % calculada), vigência do valor, observação
//       e documento (vai pro Cofre vinculado ao contrato, igual ao reajuste).
//       Grava pela RPC fn_contrato_renovar (banco decide: estende fim, muda
//       valor com valor_anterior, cria ocorrência 'renovacao' com receber_ate/
//       valor_a_receber/percentual/documento). Nenhuma regra aqui.
//   Bridges novas no index: montarOcorrenciasContrato, abrirAcoesOcorrenciaContrato,
//   salvarBaixaOcorrenciaContrato, salvarReagendarOcorrenciaContrato,
//   renovarContrato, calcularPctRenovacaoPopup, calcularValorRenovacaoPopup,
//   salvarRenovacaoContratoPopup.
//
// Versão anterior: 1.0.1 · 06/09/2026
//
// v1.0.1 — BUG da fatia 3 (v1.142): a ficha usava o RETORNO síncrono de
// avaliarProntidaoContratoParaMinuta(), que virou ponte (Promise) quando
// Minutas saiu do index. Agora é import estático de ./minutas.js — módulo a
// módulo, sem ponte. Regra que fica: ponte window[nome] só pra chamada
// "dispara e esquece"; quem precisa do retorno importa.
//
// Versão anterior: 1.0.0 · 06/09/2026
//
// R8 — FRAGMENTAÇÃO, FATIA 2 (A.8). Segundo corte do index.html (Beta
// v1.141.0), mesmo método do financeiro.js v1.0.0 (R8-1): ES module SOB
// DEMANDA via import() no switchTab, pontes window[nome] no index pra quem
// chama de fora, rzConSeCarregado() nos ganchos de recarga.
//
// O QUE MORA AQUI (camada de tela + ações de tab-contratos / tab-contrato-ficha
// e do formulário do contrato):
//   · Lista: renderContratos, chips de filtro, busca, alertas do contrato.
//   · Ficha: abrirFichaContrato, ⋮ dos cards (cobranças, partes, locatário,
//     fiador, anexos, condições, status), documentos do contrato, voltar.
//   · Formulário: abrirFormularioContrato/saveContrato/editarContrato/
//     cancelarEdicaoContrato, validações, painel de reajuste do form, divisão
//     de repasse do contrato, documentos no form (processarMultiplosDocumentos,
//     preview, remover, upload pro Storage), fiadores (popup + standalone).
//   · Popups/sheets: reajuste, alterar status (+ efeitos nas mensalidades),
//     dados do novo contrato, observação, dados do locatário, detalhes,
//     outros contratos do imóvel, divisão, excluir, seletor de contrato pra
//     ação, criar contrato a partir do imóvel/ativo, edição contextual.
//   · Histórico: verHistoricoContrato e o inline do formulário.
//
// O QUE FICOU NO index.html, DE PROPÓSITO:
//   · Dados e sincronização: `contratos`, carregar/sincronizarContratoSupabase,
//     normalizarContrato, salvarContratoIndividual, mapStatusContrato*.
//   · Regras lidas por outras telas: contratoVencido, contratoPrecisaRevisao,
//     contratoAguardandoAssinatura, obterUltimaVigenciaValor (Alertas, Visão
//     Geral, Resultados), obterContratosContextuaisDoImovel/
//     obterContratoPrincipalDoImovel/montarResumoContagemContratos (ativo).
//   · Minutas (tab-minutas, gerarMinuta*, placeholders) — domínio próprio,
//     candidato a minutas.js. Contratação pública/vitrine — idem.
//   · montarBoxContratoFicha/montarBoxSemContratoFicha — ficha ANTIGA do
//     imóvel (tab-imoveis, desligada na v1.108); saem junto com ela.
//   · fecharModalCampoContrato e o container #modal-campo-contrato —
//     genéricos (despesa, retirada, divisão também usam).
//   · __divisaoPopupContrato — popup de divisão compartilhado com o imóvel.
//   · activeConId — do motor de recibo/PDF.
//   · HTML das seções (formulário do contrato, filtros) — sai com a gramática.
//
// COMO É CHAMADO:
//   · switchTab('tab-contratos') → carregarContratos().then(m => m.montarAbaContratos()).
//   · Ficha: abrirFichaContrato(id) (ponte) — Visão Geral, ativo (cofre-ativos
//     via window.*), minuta gerada, financeiro.
//   · Ganchos de recarga (saveAll, carga inicial) usam rzConSeCarregado('renderContratos').
//   · reabrirFichaSeFor(id): usado por gerarMinutaNoCofre (index) pra
//     recarregar a ficha depois de anexar a minuta, sem ler estado do módulo.
//
// ESTADO GLOBAL LIDO/ESCRITO DAQUI: contratos, imoveis, mensalidades, pessoas,
// administradoras, dbAuth, CONFIG_CLIENTE, CLIENTE_ID_SUPABASE, pessoaIdLogada,
// fichaImovelAtualId, activeConId, __divisaoPopupContrato. Estado EXCLUSIVO
// virou nível de módulo (11 declarações abaixo).
//
// INDENTAÇÃO mantida (8 espaços) de propósito — template literals com quebra
// de linha; reindentar mudaria strings. Strict verificado (sem global
// implícita/arguments/with).
// ============================================================================

---

## `js/fechamento.js`

//
// v1.9.0 (achado do Nicola, 23/09/2026 — Albuquerque): o checklist fiscal
// completa QUALQUER pendência ali mesmo (CPF/CNPJ do locatário ou da
// empresa, destinação, município pelo CEP, CIB) pela função única
// window.fiscalCompletarPendencia (js/fiscal.js v1.3.0 → banco
// fn_fiscal_pendencia_completar). Antes, só o documento do locatário era
// no contexto; o resto levava a outra tela sem caminho de volta. Grupo
// Empresa passa a mostrar também "CPF/CNPJ da empresa não confere"
// (empresa_documento_invalido, novo no banco).
//
// v1.8.0 (frente fiscal, Fase 7 — demanda 976fcbf6; decisão D3): pacote do
// contador com o bloco FISCAL do fechamento (fn_pacote_contador_montar agora
// devolve dados.fiscal quando o fechamento tem o retrato fiscal — migration
// fiscal_pacote_contador_v1; fechamento antigo continua como antes).
//   · PDF: seção "Fiscal (NFS-e)" — resumo (imóveis locados, recebimentos,
//     valor bruto recebido, notas emitidas, rascunhos, pendências),
//     obrigatoriedade, notas emitidas (nº, data, valor, locatário, imóvel,
//     chave), RASCUNHOS com os campos da DPS na ordem do Emissor Nacional
//     (para o contador emitir), pendências e o resumo do check-up (D3).
//   · Compartilhar com o contador ganha 2 opções: "Planilha (CSV)" (tudo do
//     pacote numa planilha, UTF-8 com BOM e ";" — abre certo no Excel) e
//     "XML das notas" (arquivos do Cofre); e o canal "Só baixar os arquivos".
//   · Depois de compartilhar, os rascunhos que foram no pacote ficam
//     marcados como enviados ao contador (fn_fiscal_documento_enviar_contador).
//
// v1.7.0 (frente fiscal, Fase 6 — demanda 976fcbf6; item adiado da Fase 5):
// o botão Fiscal do Financeiro passa a mostrar as NOTAS da competência, não
// só as pendências de cadastro. fechamentoAtualizarNotasFiscais() lê os KPIs
// de fn_fiscal_competencia (mesma fonte da tela Fiscal da competência) a
// cada troca de mês, com a rotina "NFS-e da competência" ligada, e publica
// em window.RZ_FIN_FISCAL.notas; o status fiscal de cada recebimento vai
// para window.RZ_FIN_FISCAL_REC (mensalidade_id → status), lido pelo ⋮
// "Nota fiscal" do recebimento (financeiro.js v1.23.0).
//
// v1.6.2 (pedido do Nicola, 23/09/2026) — "Compartilhar com o contador" sem
// contador cadastrado não para mais num aviso: leva direto a Partes com o
// formulário de parte nova já como Contador (window.abrirCadastroContador,
// index.html v1.253.0).
//
// v1.6.1 (frente fiscal, Fase 3 — demanda 976fcbf6) — nova exportação
// fechamentoAbrirChecklistFiscalAtualizado(): relê as pendências no banco
// (fn_fiscal_pendencias_cadastro) e abre o checklist, independentemente de a
// rotina "NFS-e da competência" estar ligada. Chamada pela tela Fiscal
// (js/fiscal.js, card "Dados que faltam"), que pode abrir antes de o
// Financeiro ter carregado o estado fiscal da sessão.
//
// v1.6.0 (frente fiscal, Fase 2 — demanda 976fcbf6; decisões D2 e D6 do
// Nicola, 23/09/2026):
//   · Checklist fiscal passa a vir de UMA função do banco,
//     fn_fiscal_pendencias_cadastro (a lógica em JS saiu). Resolve o achado
//     A4: contratos novos entram (antes o filtro por imovel_id os deixava de
//     fora), lê o documento da parte locatária (não só contratos.cpf) e o
//     CIB passa a valer só para imóvel alugado (antes contava veículo).
//     Grupos novos: Empresa (documento, município-sede) e Imóvel
//     (destinação, município, CIB).
//   · D6: tocar num locatário sem documento abre o campo CPF/CNPJ ali
//     mesmo (Sheet de formulário) e grava por
//     fn_contrato_tomador_documento_definir (parte + contrato, com dígito
//     conferido). Sem permissão de editar contrato, a linha abre o contrato.
//     Depois de salvar, o checklist volta atualizado. O mesmo locatário
//     pode estar em vários contratos (1 cadastro em Partes): o documento
//     vale para todos e o aviso diz quantos foram resolvidos.
//   · D2: o contador é lido de Partes (fn_contadores_empresa) e o pacote vai
//     com p_contador_parte_id. O banco ainda aceita o id antigo de
//     prestadores, então a versão anterior deste arquivo continua
//     funcionando até o deploy.
//
// v1.5.0 (demanda 7bdcb8d4, pedido explícito do Nicola 23/09/2026): o card
// de competência perdeu o ⋮ ("nao deve ter menu de 3 pontinhos no seletor
// de competencia") e o Checklist fiscal virou um dos 6 botões do Financeiro.
// Este módulo deixou de desenhar a célula Fechar/Abrir e o chip Fiscal: agora
// só publica o estado (fechamentoPublicarEstado → window.RZ_FIN_FECHAMENTO /
// window.RZ_FIN_FISCAL) e pede o redesenho a financeiro.js v1.20.0
// (financeiroRedesenharQuadrantes), que pinta os 6 botões e o cadeado do mês
// a partir do mesmo estado. fechamentoAbrirAcoes() continua exportada (ponte
// existente), mas nenhuma tela chama mais.
//
// v1.4.0 (demanda 0e40951a — redesenho do Financeiro, pedido explícito do
// Nicola) — fechamentoRenderBotaoDedicado(): (1) ícone do botão
// Fechar/Abrir competência estava INVERTIDO (mostrava cadeado aberto pra
// competência FECHADA e cadeado fechado pra ABERTA — o desenho descrevia a
// ação, não o estado; corrigido pra refletir o estado de verdade). (2)
// alvo trocou de um ícone solto (.rz-ico-btn, ids fin-botao-fechamento-*)
// pra uma célula do grid 2x2 novo (.rz-fin-quad, ids
// fin-quad-fechamento-*) — ver financeiroQuadrantesHtml(), financeiro.js
// v1.18.0, e o card de competência (index.html v1.245.0), que perdeu o
// chip "Fiscal" e a mensagem aberta/fechada por pedido explícito ("no
// componente da compentencia nao deve ter tag de fiscal, nem msg de
// aberta ou fechada") — o checklist fiscal continua acessível pelo ⋮
// (fechamentoAbrirAcoes), só saiu do CARD.
//
// v1.3.0 (22/09/2026 — Fase 1 do wrapper de escrita, rollout Financeiro —
// pedido do Nicola 22/09/2026, ver js/raiz-eventos.js v1.0.0 e o piloto em
// cofre-ativos.js v1.59.0/index.html v1.239.0): fechamento.js passa a
// chamar emitirEscrita('competencia', {...}) logo depois de CADA escrita
// real confirmada no banco, pra módulos de fora saberem que uma competência
// mudou de estado:
//   · fechamentoAbrirSheetFechar() — dentro do aoSalvar do Sheet, logo
//     depois de fn_fechamento_fechar não dar erro. acao: 'fechar'.
//   · fechamentoAbrirSheetReabrir() — dentro do aoSalvar do Sheet, logo
//     depois de fn_fechamento_reabrir não dar erro. acao: 'reabrir'.
//   · fechamentoGerarEcompartilhar() CONFERIDA e deixada de fora: a RPC que
//     ela chama (fn_pacote_contador_montar) MONTA o pacote a partir do
//     bloco 'contabil' já gravado no fechamento_snapshot (imutável desde o
//     fechar) — não achei nenhum insert/update de um registro novo de
//     "compartilhamento" nem no client nem indício de tabela pra isso; o
//     resto da função é só gerar PDF (client-side, jsPDF) e compartilhar
//     (navigator.share ou wa.me/mailto) — nada disso é escrita de entidade.
//     Se um dia existir um registro de "compartilhado em X, por Y" no
//     banco, esta função passa a ser candidata a emitir também.
//   · Listener próprio (aoEscrever, guard window.__rzListenerEscritaFecha
//     mentoLigado) registrado dentro de fechamentoAtualizarCard() — não há
//     um "boot" único e separado neste módulo (mesma situação de
//     financeiro.js — funções soltas, sem classe/inicializador); esta é a
//     função chamada toda vez que o card do Fechamento precisa refletir o
//     estado atual (abrir a aba, trocar de mês, ou depois de fechar/
//     reabrir), então é o ponto mais natural. Guard evita registrar de novo
//     a cada chamada (ela roda várias vezes por sessão). Ao ouvir
//     'competencia', só rechama fechamentoAtualizarCard() — redundante com
//     a chamada direta que fechar/reabrir já fazem (dobra o refresh nesses
//     2 casos, inofensivo), mas cobre o caso de outro módulo vir a escrever
//     nessa entidade no futuro sem financeiro.js precisar saber.
//   · Zero mudança de lógica de negócio, RPC, payload ou texto de tela —
//     só a chamada nova de emitirEscrita() e o import do módulo.
//
// v1.2.1 (21/09/2026) — 2 correções (QUA-01, achadas nesta mesma entrega,
// revisando o v1.2.0 antes de considerar pronto, nenhuma reportada por uso
// real):
//   · fechamentoRenderCorpo passa a espelhar window.RZ_FIN_COMPETENCIA_FECHADA
//     (boolean) toda vez que resolve o estado — financeiro.js usa isso pra
//     tirar Estornar/"Não incluir na contabilidade" do ⋮ de Recebimentos/
//     Saídas quando a competência do item está fechada (REGRAS §11.1: só
//     Recibo e Ver detalhes continuam ali; o trigger de banco já bloqueava a
//     GRAVAÇÃO, mas o menu continuava oferecendo a ação como se desse certo).
//   · O comentário "COMO É CHAMADO" abaixo (linha ~122 da v1.2.0) dizia que
//     fechamentoAtualizarCard() só era chamado de dentro de
//     financeiroRenderCabecalho('conciliacao') — exatamente o oposto do que
//     o changelog do v1.2.0 prometia ("botão dedicado visível nos 3 chips...
//     não só aqui"): o botão existia no HTML das 3 abas, mas só era
//     REDESENHADO quando o usuário abria o chip Fechamento — flipar o mês
//     em Recebimentos/Saídas deixava o cadeado com o estado do mês anterior
//     (ou vazio, no boot). Corrigido do lado de financeiro.js
//     (financeiroRenderCabecalho passa a chamar fechamentoAtualizarCard()
//     nas 3 abas, não só 'conciliacao' — ver financeiro.js v1.15.0).
//
// v1.2.0 (21/09/2026) — Entrega F.3 (redesenhada) — Compartilhamento com o
// contador, decisão do Nicola (21/09/2026, substitui o desenho anterior de
// token/link de acesso ao sistema — ver REGRAS_EXPERIENCIA_RAIZ v3.22.0
// §11.1 e Demanda do backlog do mecanismo de token, registrada para uma
// fase posterior de acesso direto do contador).
//   · Fechar/Reabrir a competência SAI do ⋮ e ganha um botão dedicado
//     (cadeado), visível nos 3 chips de nível superior do Financeiro
//     (Recebimentos · Saídas · Fechamento) — não só aqui. O ícone e o
//     rótulo alternam sozinhos: aberto → "lock" ("Fechar competência");
//     fechado → "lock-open" ("Abrir competência"). Tocar o botão vai direto
//     ao Sheet de formulário de sempre (fechar pede observação opcional,
//     reabrir exige motivo) — sem mais passar pelo Sheet de ações
//     intermediário, que só tinha essa opção.
//   · O ⋮ do card passa a abrir só "Compartilhar com o contador" — nova
//     ação desta entrega.
//   · Compartilhar com o contador: o usuário escolhe 1+ competências JÁ
//     FECHADAS (nunca fecha mais de uma de uma vez — cada competência
//     continua fechando sozinha, um retrato por vez) e o contador
//     cadastrado (prestadores.tipo='contador', mesmo padrão de
//     administradora/síndico/manutencista — reaproveita a tabela
//     existente, sem tabela nova). Cada competência vira um PDF, montado
//     com jsPDF (já carregado no app, mesmo padrão de
//     baixarRelatorioPdfLocal() no index.html) a partir do bloco
//     'contabil' do fechamento_snapshot — nunca recalculado, então editar
//     um lançamento depois de fechar não muda o PDF.
//   · Envio é "compartilhamento nativo": quando o navegador suporta
//     navigator.share() com arquivo (a maioria dos celulares), abre
//     direto a folha de compartilhamento do sistema com o(s) PDF(s)
//     anexados de verdade — inclusive pra WhatsApp. Sem esse suporte
//     (a maioria dos desktops), baixa o(s) PDF(s) e abre wa.me (número do
//     contador) ou mailto: (e-mail do contador) só com o texto-resumo,
//     porque nenhum dos dois esquemas de URL consegue anexar arquivo —
//     o rótulo do botão avisa "anexe o PDF baixado".
//   · O QUE ENTRA NO PACOTE (decisão do Nicola, 21/09/2026): todo item
//     baixado (pago/recebido), seja a baixa manual ou por conciliação de
//     extrato — não exige mais conciliação bancária. Fica de fora só o
//     que a própria empresa desmarcar manualmente (⋮ da linha de
//     Recebimentos/Saídas, "Não incluir na contabilidade" — ver
//     financeiro.js v1.5.0, coluna incluir_contabilidade). Repasses
//     entram como uma 3ª lista (extrato_fingerprints.destino_tipo=
//     'repasse'). Tudo isso é calculado no banco
//     (fn_fechamento_calcular_contabil) e gravado como um 2º bloco do
//     mesmo snapshot ('contabil') no momento do fechar — não existe
//     como consulta em tempo real.
//   · Retificação: como o snapshot é imutável, corrigir um lançamento de
//     uma competência já fechada exige reabrir → editar → fechar de novo
//     (o botão dedicado é o mesmo dos dois passos). Um trigger no banco
//     (fn_trg_bloquear_edicao_competencia_fechada, migration
//     fechamento_pacote_contador_v1) bloqueia UPDATE em mensalidades/
//     lancamentos de competência fechada mesmo fora deste módulo —
//     inclusive edição direta de tela, sem passar por nenhuma função
//     daqui. Só permite ver detalhe e gerar recibo, nunca alterar.
//   · Novo bloco de KPIs no card do Fechamento (fn_financeiro_totalizador_
//     fechamento): pendente / não controlado / recebido / pago da
//     competência, mesmo padrão visual dos 4 KPIs de Recebimentos/Saídas.
//   · CORRIGIDO (achado revisando esta mesma entrega, antes de qualquer
//     uso real): o cadastro de contador (prestadores.tipo='contador') não
//     tinha NENHUM caminho de tela — o <select> "Atua como prestador?" da
//     tela de Partes (index.html, abrirFormParteSheet — hoje o único lugar
//     que cria/edita administradora/síndico/manutencista, desde que as 3
//     abas antigas foram fundidas em Partes na v1.119.0) só tinha essas 3
//     opções. Adicionado "Contador" ao <select> — salva em partes.tipo_
//     prestador e espelha pra prestadores.tipo via sincronizarPrestadorDaParte,
//     mesmo mecanismo dos outros 3 papéis. O aviso desta função também
//     apontava pro destino errado ("Empresa › Rotinas") — corrigido pra
//     "Partes › Prestadores".
//
// v1.1.0 (21/09/2026) — Entrega F3.1 (Chip Fiscal e checklist de CIB),
// PLANO_IMPLEMENTACAO_RESULTADOS_MERCADO_FISCAL v2.0.0, FASE F3. Objetivo:
// a empresa vê o que falta pra emitir NFS-e quando a obrigatoriedade
// chegar, SEM emitir nada ainda e SEM nenhum texto afirmar que o cliente é
// contribuinte. Sem migration nova (reaproveita os tipos/funções de AL.2):
//   · Chip "Fiscal" novo no card de competência do Fechamento (ao lado do
//     status "Fechado"), só aparece com a rotina nfse_competencia ligada
//     (fn_rotinas_empresa_listar — mesmo padrão de
//     financeiroVerificarRotinaFechamento em financeiro.js, checado aqui
//     de novo porque os módulos são isolados de propósito, sem import
//     direto). Mostra "Fiscal OK" (verde) quando não há pendência, ou a
//     contagem (âmbar) quando há.
//   · Toque no chip abre um checklist por imóvel com 2 perguntas: CIB
//     preenchido? (fn_diario_cib_pendente, MESMA função que já alimenta o
//     alerta de estado cib_pendente da AL.2 — fonte única, nunca diverge
//     do que a Central de Alertas mostra) e o contrato ativo do imóvel tem
//     documento do locatário? (contratos.cpf — rótulo "CPF/CNPJ" na ficha
//     do contrato, campo obrigatório lá; consulta nova, client-side, sem
//     RPC — não existe alerta de estado pra isso ainda, natureza puramente
//     de cadastro). Cada item do checklist navega pro lugar de sempre pra
//     corrigir (CIB: switchTab('tab-ativos') + abrirFichaAtivoNoChip(id,
//     'resumo'), mesmo destino do case 'ativo/ficha' de
//     rzAbrirDestinoAlerta; documento: abrirFichaContrato(id), mesmo
//     destino do case 'contrato/ficha') — nenhuma edição inline nova,
//     nenhuma duplicação da UX de edição que a AL.3/AL.6 já resolveram
//     pros alertas.
//   · Fiscal é status DA CARTEIRA (não da competência selecionada) —
//     verificado 1x por sessão (fechamentoRotinaFiscalLigada !== null),
//     igual ao padrão de financeiroRotinaFechamentoLigada — não refaz a
//     consulta a cada troca de mês no card.
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
// Migrations: fechamento_estrutura_v1 (fn_fechamento_verificar/fechar/
// reabrir + tabela fechamento_snapshot) e fechamento_pacote_contador_v1
// (v1.2.0 — incluir_contabilidade, bloco 'contabil', fn_pacote_contador_
// montar, fn_financeiro_totalizador_fechamento, fn_fechamento_listar_
// fechadas, gatilho de bloqueio de edição).
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
//     (mesmo padrão de carregarFinanceiro/carregarResultados); o chip
//     Fiscal (v1.1.0) chama fechamentoAbrirChecklistFiscal() e o botão
//     dedicado (v1.2.0, nos 3 chips) chama fechamentoAlternarBotao() pela
//     mesma ponte.
//
// ESTADO GLOBAL LIDO/ESCRITO DAQUI: dbAuth, CLIENTE_ID_SUPABASE,
// pessoaIdLogada, mostrarToast, abrirSheetAcoes, abrirSheetForm, abrirSheet,
// rzSheetCabecalho, fecharSheet, rzEsc, renderStatus, formatarMoedaBR,
// switchTab, abrirFichaContrato, window.abrirFichaAtivoNoChip,
// window.jspdf, CONFIG_CLIENTE (todos já globais no index.html clássico —
// mesmo acesso que financeiro.js já faz).
// ============================================================================

---

## `js/financeiro.js`

//
// Versão anterior: 1.34.0 · 06/10/2026
//
// v1.34.0 (06/10/2026, sessão 20261006-2320-catalogo-f4b, demanda 2923ff4d — fatia 4b; fichas F-C8/F-C9
// aprovadas pelo Nicola 06/10 23:16) — resultado e contabilidade são dois eixos da categoria:
// (1) Nova despesa: o caminho ganha os chips "Entra no resultado"/"Fora do resultado" (grupo_resultado
// da subcategoria) e "Contabilidade: sim/não"; na criação aparece "Entra na contabilidade", pré-marcado
// pelo padrão da categoria (lancamento_categorias.contabilidade_padrao) e gravado em incluir_contabilidade.
// Na edição o chip mostra o valor gravado (a troca continua pela ação da despesa, financeiro.contabilidade_ajustar).
// (2) Receita sem contrato: deixa de gravar a categoria 'outro' (que é de saída e caía fora da receita) —
// pede Categoria (nível 1 de entrada) → Subcategoria, com os mesmos chips e o mesmo "Entra na contabilidade".
// Ex.: Vendas › Venda de bem = fora do resultado (imobilizado vira caixa) e, por padrão, na contabilidade.
//
// Versão anterior: 1.33.0 · 04/10/2026
//
// v1.33.0 (04/10/2026, sessão 20261004-1245-financeiro, demanda f3e6cd27 — P4a,
// fichas A1–A6 aprovadas pelo Nicola 12:43) — conta no Financeiro (Premium):
// (1) chip de recorte "Conta: Todas ▾" no fim dos chips de Recebimentos e
// Saídas (UXR-13), só com a funcionalidade financeiro.contas.ver e mais de 1
// conta ativa visível; filtra a lista e os 4 totais
// (fn_financeiro_totalizadores_por_conta). (2) No sheet de cada recebimento e
// despesa, a linha "Conta: <nome>" mostra a conta e, com
// financeiro.contas.escolher, troca (fn_lancamento_definir_conta — a mesma
// função que o bot usa). (3) Nova/Editar despesa ganha o campo Conta quando
// há mais de 1 conta (padrão já escolhida). Sem Premium nada aparece e tudo
// segue na conta da empresa. Versão anterior: 1.32.0.
//
// v1.32.0 (demanda 2923ff4d, catálogo 2b-2 — plano aprovado pelo Nicola em 04/10/2026 12:40; sessão 20261004-1245-catalogo-2b2) —
// teste 2 reprovado ("lista com muita coisa misturada"): Nova/Editar despesa em dois níveis —
// Categoria (nível 1 de saída da árvore lancamento_categorias) → Subcategoria (folhas dela).
// Ao editar, os dois vêm posicionados a partir da folha gravada. Linha de chips mostra o
// caminho: Saída · ativo · categoria · subcategoria · valor. Sem nós de nível 1 no catálogo,
// volta à lista única da v1.31.0.
//
// v1.31.0 (demanda 2923ff4d, catálogo único — fatia 2, parte app; "de acordo" do Nicola 03/10/2026 23:42; sessão 20261004-0815-catalogo-f2) —
// categorias de despesa vêm do catálogo lancamento_categorias (nome, ícone, ordem e
// direção): lista do formulário de despesa (só saida/ambas), rótulo e ícone da lista de
// Saídas. Os mapas fixos ficam como reserva se o catálogo não carregar.
//
// v1.30.1 (04/10/2026, demanda cad6ec67 — correção dos testes da P2):
// (1) o card "Outras receitas" mostrava o título partido em duas colunas
// (título à esquerda, legenda à direita, quebrando em 2 linhas no celular);
// agora é só o título, numa linha. (2) A rotina "Fechamento do mês" era
// verificada 1x por sessão: ligar/desligar em Minha empresa não refletia no
// Financeiro sem recarregar a página. Agora reverifica a cada entrada na aba
// Financeiro (e quando a empresa muda), sem apagar o estado anterior antes
// da resposta (sem piscar). Também avança window.__rzFinRotinasEpoca para
// o fechamento.js reverificar a rotina fiscal no mesmo momento.
// Versão anterior: 1.30.0.
//
// v1.30.0 (04/10/2026, demanda cad6ec67 — P2 Ficha 5): as receitas sem
// contrato passaram a entrar nos 4 totais de Recebimentos
// (fn_financeiro_totalizadores soma os lançamentos de entrada); o card
// "Outras receitas" deixa de dizer "fora dos totais acima".
// Versão anterior: 1.29.0.
//
// v1.29.0 (03/10/2026, sessão 20261003-2345-financeiro, demanda 4a369778 —
// P1b da ESP_FINANCEIRO_CUSTOS_DISTRIBUICAO v2.3.0; "Siga em frente", Nicola 23:38):
//   · DISTRIBUIÇÃO (tab-socios) remodelada e com número do banco
//     (fn_apurar_distribuicao): chips Mês/Ano, 4 KPIs (cotas recebidas,
//     despesas, retirado, saldo a retirar), lista por sócio com saldo, ficha
//     do sócio (líquido apurado na ordem do demonstrativo, retiradas,
//     compartilhar resumo), "Lançar retirada" em .rz-f gravando em repasses
//     por pessoa_id, excluir com rzConfirmar. Paridade das cotas com o cálculo
//     antigo conferida (Rumo jul/2026, 4 sócios, centavo a centavo); o saldo
//     passa a descontar a cota das despesas do imóvel (antes não descontava).
//   · RECEITA AVULSA: "Adicionar recebimento" pergunta De um contrato | Sem
//     contrato; sem contrato grava lançamento de entrada; card "Outras
//     receitas" em Recebimentos (inclui licenças), fora dos 4 KPIs.
//   · ORIGEM DA SAÍDA: ⋮ da despesa mostra "Origem: <item>" e abre a ficha do
//     item de controle; sem ativo, a linha diz "da empresa".
//   · RF-05: multa/juros da baixa também em mensalidades.multa_encargos.
//   · RF-09: nome e categoria das regras de conciliação vêm de
//     conciliacao_regras (listas fixas NOME_REGRA_CONC/CATEGORIA_POR_REGRA_CONC saíram).
//   · "Ver comprovante" abre pelo adaptador (rzDev('abrirExterno')).
// Versão anterior: 1.28.0.
//
// v1.28.0 (03/10/2026, sessão 20261003-2250-financeiro, demanda 94245176 —
// ESP_FINANCEIRO_CUSTOS_DISTRIBUICAO v2.3.0 §5 P1a, decisões D24–D26 do
// Nicola) — Financeiro no padrão da DIRETRIZES_UX_RAIZ_2026 (UXR-10/12/25/30/41):
//   · topo: barra de busca + "+" (abrirBuscaFinanceiro / abrirLancarFinanceiro);
//   · segmento com 4 opções: Recebimentos · Saídas · Conciliação ·
//     Distribuição (tab-socios, gate repasses.ver com cadeado e motivo);
//   · a grade 3x2 (financeiroQuadrantesHtml) vira o card "Rotinas de <mês>"
//     (financeiroRotinasHtml): Fechar/Reabrir · Contador · Fiscal · Atrasados,
//     mesmos estados de antes; Importar e Adicionar foram para o "+";
//   · "Lançar" único no "+" (Importar extrato (IA) · Ler um documento (IA) ·
//     Adicionar recebimento · Adicionar saída; Reprocessar só em Conciliação);
//     abrirAcoesAdicionarFinanceiro/abrirAcoesImportarConciliacao continuam
//     existindo e abrem o mesmo Sheet;
//   · zero diálogo nativo: os 23 usos viram rzToast/rzConfirmar/rzAviso
//     (js/raiz-ui.js 1.0.0, D25); exclusões são confirmação destrutiva
//     (último item vermelho, REGRAS §6);
//   · Cobrar pelo WhatsApp sai por rzDev('whatsapp') (UXR-41), não mais
//     window.open direto;
//   · Dar baixa: validação que falha mantém o Sheet aberto (antes fechava).
// Sem objeto de banco. "Desfazer" nas ações destrutivas fica para a fatia
// que criar a operação inversa de cada uma (registrado na ENTREGA).
// Versão anterior: 1.27.3.
//
// v1.27.3 (02/10/2026, pedido do Nicola) — despesa da licença Raiz
// (origem_tipo='licenca') ganha "Ver comprovante" no ⋮ quando a empresa
// guardou o comprovante: procura no Cofre o documento vinculado ao pagamento
// (vínculo 'pagamento' = origem_id da despesa) e abre por link temporário.
// Versão anterior: 1.27.2.
//
// v1.27.2 (02/10/2026, achado do Nicola no teste da F11) — a lista de Saídas
// recarrega do banco toda vez que a aba abre, como os totais (que já vinham de
// fn_financeiro_totalizadores a cada abertura). Antes a lista só era carregada
// no login: uma despesa lançada depois (ex.: a licença confirmada no Gestão)
// entrava no total mas não aparecia na lista até recarregar o app.
// Versão anterior: 1.27.1.
//
// v1.27.1 (01/10/2026, pedido do Nicola no teste da F12) — o Pix copia e cola
// sai em uma 2ª mensagem, sozinho: no WhatsApp ele vinha quebrado em linhas
// com trechos virando link, e o locatário não conseguia copiar só o código.
// A 1ª mensagem leva a chave e avisa que o código vem em seguida; o Sheet fica
// aberto com o botão "Enviar o código Pix" (2º toque, mesma conversa).
// Junto (pedido do Nicola, 01/10 23:19): "Cobrar pelo WhatsApp" também no ⋮
// de cada mensalidade em atraso — antes só existia no cabeçalho do grupo,
// com a lista agrupada por Locatário (difícil de achar).
// Versão anterior: 1.27.0.
//
// v1.27.0 (01/10/2026, F12 — demanda 3a1a5ef5): "Cobrar pelo WhatsApp" abre
// antes um Sheet com a opção "Incluir o Pix da empresa" (marcada quando há
// chave cadastrada): a mensagem ganha a chave, o recebedor e o Pix copia e cola
// com o valor total (fn_pix_brcode_empresa — mesmo cálculo do QR da Raiz).
// Sem chave cadastrada, o Sheet avisa onde cadastrar (Minha empresa) e a
// mensagem sai como antes. Versão anterior: 1.26.0.
//
// v1.26.0 (30/09/2026 — frente licenca-financeiro, ficha F3 aprovada em
// 30/09): categoria de despesa `tecnologia_assinaturas` ("Tecnologia e
// assinaturas": domínio, licença de software, telecom) ganha rótulo, ícone
// e entra na lista de categorias do formulário de despesa. O banco já
// aceita a categoria (lancamentos_categoria_check) e os relatórios já a
// somam (só `repasse_socio` fica de fora).
//
// v1.25.0 (demandas fb6576c1 e 835aea49, entrega 2/3 do lote de 29): (1)
// "Modo: Manual" aparecia até pra comprovante que o bot conciliou sozinho
// via IA (regra_codigo null) — ganhou rótulo próprio "Automático
// (IA/WhatsApp)" (diferenciado por canal='bot', já gravado pela Edge
// Function whatsapp-webhook), tanto no menu de ações quanto no Resumo da
// conciliação. (2) A mesma linha pendente mostrava confiança diferente no
// sheet "Ver sugestão" (motor de regras, 0-100) e no sheet de Ações
// (fn_extrato_sugerir_*, 0-1): quando o candidato do topo é o mesmo destino
// que o motor já sugeriu, reaproveita o % e o texto do motor em vez de
// recalcular por outra conta. A parte de banco (texto "valor difere" mesmo
// quando os valores conferem, e formato americano do valor) foi corrigida
// em fn_conciliacao_avaliar (migration, regra R05 v2) — sem código aqui.
//
// v1.24.0 (demanda d92a6dfc, pedido do Nicola 24/09 18:50 + decisão 25/09
// "Restante de acordo. Pode implementar."): "Dar baixa" ganha 2 campos —
// Aluguel bruto e Taxa da administradora — ao lado do Líquido, com
// recálculo automático entre os 3 (recalcularValoresBaixaBruto); os
// valores vêm pré-preenchidos do que fn_gerar_mensalidades_competencia já
// calculou (mensalidades.valorBruto/valorTaxaAdm, mapeados agora em
// index.html). O antigo campo solto "Taxa da administradora (R$)" dos
// Extras (nunca ligado a nada — taxaAdmSugerida não existe mais no
// código atual, só sobrava em observação de recibo) saiu daqui: virou
// este campo estruturado. Recebimento pago ganha ⋮ "Ajustar valores"
// (abrirAjusteValoresMensalidade) — mesmos 3 campos + motivo obrigatório,
// via fn_mensalidade_valores_ajustar (migration_valor_bruto_liquido_v1);
// some com a competência fechada, igual "Estornar". O extrato/conciliação
// não muda: líquido sempre do banco, sem bater vai pra pendente (isso já
// não passava por "Dar baixa" manual).
//
// v1.23.0 (frente fiscal, Fase 6 — demanda 976fcbf6; itens adiados da
// Fase 5): (1) o botão Fiscal mostra as notas do mês — "N nota(s) a
// preparar" quando há recebimento pago sem nota (window.RZ_FIN_FISCAL.notas,
// publicado por fechamento.js v1.7.0); sem nota pendente, continua com as
// pendências de cadastro ou "Pronto para NFS-e". (2) ⋮ do recebimento pago
// ganha "Nota fiscal", com o status fiscal dele no subtítulo
// (window.RZ_FIN_FISCAL_REC); abre a tela Fiscal da competência já nas ações
// daquele recebimento (window.abrirFiscalCompetencia, index.html v1.255.0).
// A linha da lista não ganhou etiqueta nova (achado da rodada 10: "muito
// texto na frente da data") — o status fica no ⋮.
//
// v1.22.0 (frente fiscal, Fase 5 — demanda 976fcbf6): o botão Fiscal abre a
// tela "Fiscal da competência" (window.abrirFiscalCompetencia, index.html
// v1.254.0; tela em js/fiscal.js v1.1.0), no mês em que o Financeiro está.
// Antes abria direto o checklist de cadastro, que agora é o segmento
// "Cadastro" da tela nova. Rotina fiscal desligada: continua levando a
// Empresa › Rotinas. Status do botão sem mudança (pendências de cadastro).
//
// v1.21.0 (demanda 3cc64651, pedido explícito do Nicola 23/09/2026: "o
// botao extrato generalize para importar documento mas deixa a palavra
// extrato. o fechar competencia, tente usar uma palavra so ou nao cortar o
// texto. Mude o titulo da aba fechamento para conciliacao"): botão
// "Importar" (explicação "Extrato ou outro documento") abre menu com
// Importar extrato / Importar documento (upload com IA,
// abrirUploadDocumentoNoApp) / Reprocessar; botão Fechar/Reabrir com
// título de uma palavra; chip do seletor "Fechamento" → "Conciliação".
//
// v1.20.0 (demanda 7bdcb8d4, pedido explícito do Nicola 23/09/2026 com
// prints): topo do Financeiro reorganizado (index.html v1.249.0) e os
// botões de função passaram de 4 pra 6 — Extrato · Adicionar · Fechar/
// Abrir competência · Contador · Fiscal (saiu do ⋮ do card de competência,
// que deixou de existir) · Atrasados (tela que já existia, abrirTelaAtrasados).
// Os botões sinalizam o status da competência pela cor do ícone e ficam
// indisponíveis (.rz-off, toque explica) quando a ação não cabe — ex.:
// Adicionar com a competência fechada. financeiroQuadrantesHtml() passou a
// desenhar os 6 a partir do estado que js/fechamento.js v1.5.0 publica em
// window.RZ_FIN_FECHAMENTO/RZ_FIN_FISCAL; novas: financeiroRedesenharQuadrantes()
// (chamada por fechamento.js), financeiroRenderCadeadoCompetencia() (cadeado
// ao lado do mês quando fechada), financeiroIrParaRotinas() (Fiscal desligado).
//
// v1.19.0 (demanda 0e40951a, complemento — pedido explícito do Nicola,
// 22/09/2026, em resposta à pergunta feita na entrega anterior sobre o
// quadrante "Adicionar" não ter ação real em Recebimentos/Fechamento):
// NOVA funcionalidade — criar recebimento avulso, decisão anterior
// registrada na v1.6.5 ("não existe criar recebimento avulso") revertida
// a pedido explícito. abrirNovoRecebimento(contratoIdPreSelecionado) abre
// um form (abrirSheetForm, mesmo padrão de rzAbrirBaixaMensalidade) com
// contrato (seletor, quando não vem pré-selecionado)/competência/valor e
// um segmentado "A receber"/"Já recebido" (nrecAlternarSituacao) — "Já
// recebido" grava status='pago'+data_pgto/banco num único INSERT (a
// baixa já sai finalizada, pedido explícito "se for recebido entrar com
// a baixa finalizada"); "A receber" grava status='pendente' (pedido
// explícito "se for em aberto, inclui-lo no a receber" — mesmo bucket
// que qualquer mensalidade pendente, sem tratamento especial). Emite
// emitirEscrita('mensalidade', ...) como qualquer outra escrita deste
// arquivo (Fase 1 do wrapper). 2 pontos de entrada, pedido explícito
// ("adicione esta possibilidade tb no card financeiro do contrato"):
//   · financeiroQuadrantesHtml() — "Adicionar" DEIXOU de ser contextual
//     por aba: abre abrirAcoesAdicionarFinanceiro() (menu novo, 2 ações —
//     Novo recebimento / Nova despesa), mesmo quadrante nas 3 abas.
//   · js/contratos.js v1.20.0 — abrirAcoesCobrancasContrato() (⋮ do card
//     "Financeiro" da Ficha do contrato): nova ação "Adicionar
//     recebimento", chama abrirNovoRecebimento(contratoId) já com o
//     contrato certo (sem seletor) — ver changelog de lá pro listener
//     'mensalidade' novo (reabre a Ficha sozinha, sem F5, quando o
//     recebimento nasce de fora, ex.: pelo quadrante Adicionar).
// DUPLICATA: replica no cliente a MESMA checagem que
// fn_gerar_mensalidades_competencia já faz no banco (não deixa 2
// mensalidades pro mesmo contrato/competência) — não é constraint de
// banco (conferido: mensalidades não tem UNIQUE nenhum além da PK), só
// aviso preventivo antes de gravar.
//
// v1.18.0 (demanda 0e40951a — redesenho do Financeiro, pedido explícito do
// Nicola: "Reorganizar os botoes... colocar a esquerda o botão e uma
// explicação da funcao na frente. Colocar 2 botoes a direita e dois a
// esquerda como se fosse 4 quadrantes") — financeiroQuadrantesHtml() nova:
// grid 2x2 (Extrato/Adicionar/Fechar-Reabrir/Contador) substitui a fileira
// de ícones soltos que existia nos 3 cabeçalhos (Recebimentos/Saídas/
// Fechamento). "Adicionar" é contextual — só Saídas tem criação manual de
// verdade (Recebimentos nasce do contrato, decisão já registrada na
// v1.6.5; Fechamento é conciliação, não criação) — as outras 2 orientam
// pra onde a coisa nasce de verdade em vez de simular uma ação que não
// existe. Texto da explicação QUEBRA linha de propósito (era a causa do
// achado "mensagens saindo da tela" — .rz-fin-quad, index.html v1.245.0,
// usa white-space:normal, nunca nowrap/ellipsis). O 3º quadrante
// (Fechar/Reabrir, com o ícone de cadeado corrigido) é preenchido por
// js/fechamento.js v1.4.0 — ver changelog de lá. Card de competência
// (index.html) perdeu a tag "Fiscal" e a mensagem aberta/fechada por
// pedido explícito — checklist fiscal voltou pro ⋮ (fechamentoAbrirAcoes).
//
// v1.17.0 (22/09/2026 — Fase 1 do wrapper de escrita, rollout Financeiro —
// pedido do Nicola 22/09/2026, ver js/raiz-eventos.js v1.0.0 e o piloto em
// cofre-ativos.js v1.59.0/index.html v1.239.0): financeiro.js passa a
// chamar emitirEscrita() logo depois de CADA escrita real confirmada no
// banco, pra módulos de fora (Visão Geral, Resultados, Contratos, etc.)
// saberem que algo mudou sem precisar conhecer este arquivo:
//   · entidade 'despesa' (tabela lancamentos, direcao='saida'):
//     salvarDespesa (criar/editar), confirmarPagamentoDespesa, estornar
//     PagamentoDespesa, excluirDespesa, alternarIncluirContabilidade
//     (ramo tipo!=='mensalidade').
//   · entidade 'mensalidade' (tabela mensalidades): liquidarMensalidade,
//     estornarMensalidade, excluirLancamentoMensal, alternarIncluirContabi
//     lidade (ramo tipo==='mensalidade').
//   · entidade 'conciliacao' (extrato_fingerprints + o que cada confirmação
//     grava do outro lado): conciliarTransacoes (import em lote),
//     confirmarVincularConciliacaoRecebimento, confirmarVincularConciliacao
//     Saida, confirmarCriarSaidaConciliacao, confirmarNaoControlarConcilia
//     cao, confirmarEstornarConciliacaoSaida, criarRepasseDireto (marcar
//     como repasse). confirmarSugestaoConciliacao e confirmarMarcarComoRe
//     passe são só despachantes (delegam pra uma destas) — não emitem elas
//     mesmas, pra não duplicar o evento.
//   · entidade 'recibo': salvarObservacaoRecibo.
//   · gerarProximasCompetencias (só monta rótulos MM/AAAA pro <select>, não
//     escreve nada) e atualizarCamposTipoConciliacao (só mostra/esconde
//     campos condicionais do modal Buscar) CONFERIDAS e deixadas de fora —
//     não são escrita de entidade nenhuma.
//   · Listener próprio (aoEscrever, guard window.__rzListenerEscritaFinan
//     ceiroLigado) registrado dentro de montarAbaFinanceiro() — 1x por
//     boot, redesenha só a aba do Financeiro que estiver ativa agora
//     quando qualquer uma das 4 entidades acima for escrita (inclusive por
//     este próprio módulo — redundante com os renders diretos que cada
//     função já faz, mas inofensivo, e cobre o caso de outro módulo vir a
//     escrever nelas no futuro).
//   · AUDITORIA (bug do tipo achado em cofre-ativos.js v1.61.0 — objeto
//     local editado só sobrevive até o próximo recarregamento assíncrono
//     terminar): verificado em TODAS as funções de escrita deste arquivo —
//     nenhuma reabre uma tela reaproveitando a mesma referência de objeto
//     sem antes esperar (await) a atualização, local (mutação direta antes
//     do fetch, ex. liquidarMensalidade/estornarMensalidade/salvarObserva
//     caoRecibo) ou remota (reload completo do array, ex. salvarDespesa/
//     confirmarPagamentoDespesa/excluirLancamentoMensal). Nenhum fix desse
//     tipo foi necessário neste arquivo.
//   · Zero mudança de lógica de negócio, RPC, payload ou texto de tela —
//     só a chamada nova de emitirEscrita() e o import do módulo.
//
// v1.16.0 (22/09/2026) — resetarFinanceiroParaAbaInicial() nova (demanda
// 60284322, "navegação por rodapé sempre reseta a aba"): financeiroCompetencia
// Atual (module-scoped, ver declaração abaixo) ficava preso no mês pra onde
// a pessoa tinha navegado (‹ Mês/Ano ›) — voltar pro Financeiro pelo rodapé
// depois de visitar outra aba continuava mostrando esse mês, não o mês
// corrente. Chamada por index.html (irParaAbaRodape) antes de
// switchTab('tab-mensal'); só zera o estado — quem redesenha é o gancho que
// o próprio switchTab já dispara (montarAbaFinanceiro).
//
// v1.15.0 (21/09/2026) — 2 correções (QUA-01, achadas revisando o v1.14.0
// nesta mesma entrega, antes de qualquer uso real):
//   · financeiroRenderCabecalho chamava fechamentoAtualizarCard() só pra
//     aba==='conciliacao' — mas o botão dedicado de Fechar/Abrir (cadeado,
//     REGRAS §11.1) vive nos 3 chips (Recebimentos · Saídas · Fechamento).
//     Flipar o mês (ou abrir o app) em Recebimentos/Saídas deixava esse
//     botão com o estado do mês errado (ou vazio) até o usuário visitar
//     Fechamento ao menos 1x na sessão. Agora chama nas 3 abas sempre —
//     fechamentoAtualizarCard já redesenha os 3 botões de uma vez
//     (FECHAMENTO_IDS_BOTAO em fechamento.js), então não duplica nada.
//   · rzAcoesMensalidade/rzAcoesDespesa (⋮ de um item "Pago"/"realizado")
//     continuavam oferecendo Estornar e "Não incluir na contabilidade"
//     mesmo com a competência fechada — o trigger de banco
//     (fn_trg_bloquear_edicao_competencia_fechada) já barrava a gravação,
//     mas só depois do toque, com um erro cru. Agora as duas ações somem do
//     menu quando window.RZ_FIN_COMPETENCIA_FECHADA (ponte de
//     fechamento.js) é true — sobra só Recibo/Ver detalhe e Resumo da
//     conciliação (leitura), exatamente o "permitir apenas geração de
//     recibo e ver detalhes, nunca alterar" pedido pra competência fechada
//     (REGRAS §11.1).
//
// v1.14.0 (Entrega F.3 redesenho + F.4, pedido explícito do Nicola — ver
// changelog completo no header do index.html, Beta v1.237.0) — resumo do
// que mudou aqui:
//   - financeiroChipsNivelHtml/financeiroRedesenharChipsNivel: .rz-chips
//     virou .rz-seg (mesmo componente da Visão Geral); CORRIGIDO (QUA-01)
//     bug real no contador da badge de Fechamento (comparava `x.status`,
//     campo que não existe em extrato_fingerprints — sempre 0).
//   - financeiroMudarCompetencia: Conciliação passa a recarregar a LISTA
//     no flip de mês (montarAbaFinanceiro), não só o card — reverte a
//     decisão da F.1/F.2 (comentário antigo removido).
//   - carregarConciliacaoUnificada: escopo de mês (igual
//     fn_financeiro_totalizador_fechamento) + só pendente/não controlado,
//     direto na query — troca a busca de "últimos 200 lançamentos de
//     qualquer mês".
//   - renderConciliacaoUnificada: reescrita — sem segmento/chip de tela
//     (só sobrou o <select> "Tipo" do modal Buscar), sem agrupamento por
//     competência (1 mês só), sem hero (conc-hero-*, saiu do HTML — quem
//     resume agora são os 4 KPIs do chip Fechamento, js/fechamento.js).
//     filtrarConciliacaoChip() e alternarGrupoConciliacao() removidas
//     (dead code — telas que alimentavam saíram do HTML).
//   - renderMensalidades/renderSaidas: linha "Pago"/"realizado" ganha
//     rótulo curto de origem (Manual/Extrato) + aviso "Fora da
//     contabilidade" quando incluirContabilidade===false.
//   - rzAcoesMensalidade/rzAcoesDespesa: novo item de ⋮ "Não incluir na
//     contabilidade" / "Incluir na contabilidade", codigo
//     financeiro.contabilidade_ajustar (ACE-03) — chama a nova
//     alternarIncluirContabilidade() (RPC fn_financeiro_incluir_contabilidade).
//
// v1.13.0 (Entrega F.3 — achado do Nicola, 21/09/2026: "uma vez que tem o
// chip do mês no topo, não precisa mais ter os agrupamentos e filtros por
// competência") — Recebimentos e Saídas PERDEM o agrupamento colapsável
// por mês e o filtro de competência próprio (o <select> escondido de
// "Buscar"): a lista passa a mostrar só a competência do card do topo
// (financeiroCompetenciaAtual/window.RZ_FIN_COMPETENCIA), flat, sem
// grupos. Reverte a decisão registrada em v1.11.0 (ver nota grande antes
// de financeiroCompetenciaAtual) de manter os dois independentes — aquela
// cautela era pro caso de um mês futuro/vazio sumir da lista ao trocar o
// <select>; agora não tem mais <select>, o card manda sozinho, e mês vazio
// mostra a lista vazia mesmo (mesmo comportamento que os KPIs já tinham).
// Removidos: men-/saidas-filtro-competencia (index.html), popularFiltrosMensal/
// Saidas pararam de popular esse select, gruposMensalAbertos/
// gruposSaidasAbertos e alternarGrupoMensal/Saidas (dead code). Atrasados
// (tab-inadimplencia) e Fechamento/Conciliação (tab-conciliacao) NÃO
// mudam — o primeiro tem segmento próprio, o segundo continua
// deliberadamente independente do card (decisão da F.1, ainda válida:
// conciliação precisa ver vários meses de uma vez).
//
// v1.12.0 (Entrega F.2 — PLANO_IMPLEMENTACAO_RESULTADOS_MERCADO_FISCAL
// v2.0.0, REGRAS_EXPERIENCIA_RAIZ v3.19.0 §11.1) — "Fechamento da
// competência": o chip Fechamento (tab-conciliacao) ganha o MESMO card de
// competência de Recebimentos/Saídas (agora com ⋮, abre Sheet de ações
// Fechar/Reabrir — js/fechamento.js, módulo novo e isolado, mesmo padrão
// de ponte global dos demais). financeiro.js não ganhou lógica de
// fechamento nenhuma — só passou a (1) espelhar
// financeiroCompetenciaAtual em window.RZ_FIN_COMPETENCIA (module isolado
// não importa module isolado; fechamento.js lê essa variável pra saber
// "qual mês" sem duplicar estado), (2) reagir ao flip de competência
// também quando tab-conciliacao está ativa (financeiroMudarCompetencia),
// e (3) chamar a ponte fechamentoAtualizarCard() de dentro de
// financeiroRenderCabecalho('conciliacao'). REGRAS §11.1: card de
// competência (F.1) + Sheet de ações (§2) — zero CSS/superfície nova.
//
// v1.11.0 (Entrega F.1 — PLANO_IMPLEMENTACAO_RESULTADOS_MERCADO_FISCAL
// v2.0.0, REGRAS_EXPERIENCIA_RAIZ v3.18.0 §11) — "Totalizadores e
// reordenação do Financeiro (preservando chips e listas)": card de
// competência (‹ Mês/Ano ›) sozinho no topo de Recebimentos/Saídas
// (financeiroMudarCompetencia); .rz-seg (Recebimentos/Saídas/Conciliação)
// virou .rz-chips (Recebimentos/Saídas/Fechamento — só chip representa
// "bloqueado com motivo", segmento não; chip Fechamento fica .rz-off com
// motivo quando a rotina fechamento_mensal está desligada, leva a
// Empresa › Rotinas — financeiroVerificarRotinaFechamento/
// rzTocarChipFechamentoDesligado, mesmo destino de rzAbrirDestinoAlerta
// case 'empresa/rotinas'); os 4 KPIs de cada aba passaram a vir de
// fn_financeiro_totalizadores (migration fechamento_totalizadores_v1),
// nunca mais de soma no cliente (financeiroAtualizarKpis) — fecha parte
// da demanda a247bddf. Ver a nota grande logo depois de montarAbaFinanceiro
// pra a decisão de manter a competência do card INDEPENDENTE do filtro de
// competência da lista (men-filtro-competencia/saidas-filtro-competencia),
// e por quê. Nenhuma coluna/campo de linha das 3 listas mudou; os chips
// internos de status (filtrarMensalPorChip/filtrarSaidasPorChip/
// #conc-uni-chips) continuam exatamente como estavam (ajuste explícito do
// Nicola, 20/09/2026).
//
// v1.10.1 — CORRIGIDO (QUA-01, achado buscando o mesmo padrão do bug da
// demanda ac549b98 em contratos.js): as 2 sugestões de vínculo do sheet de
// conciliação de extrato (recebimento e saída) mostravam o valor com
// `Number(c.valor).toFixed(2)` — formato americano (ponto decimal, sem
// separador de milhar), ex. "R$ 1234.50" em vez de "R$ 1.234,50". Trocado
// por fmtBR(c.valor), já usado em todo o resto deste arquivo para o mesmo
// fim (ver comentário da própria fmtBR, linha ~6527 do index.html). Nenhuma
// mudança de lógica de negócio ou de RPC.
//
// v1.9.0 — pedido explícito do Nicola ("em cada linha de item deve
// apresentar a data do item"): a data JÁ estava sendo montada tanto em
// Recebimentos (v1.8.0) quanto em Saídas (bem mais antiga) — a causa real
// não era ausência de data, era ORDEM: as duas linhas concatenavam a data
// por ÚLTIMO depois de imóvel/categoria/parte/ativo, e `.rz-row .rz-tx
// span` trunca em 1 linha só (white-space:nowrap + ellipsis, ver DESIGN_
// SYSTEM §rz-row) — em qualquer linha um pouco mais cheia (nome de
// empreendimento longo, várias partes) a data virava a parte cortada pelo
// "...". Reordenado nas 3 linhas (Recebimentos pago/a vencer, Saídas): a
// data agora vem logo depois do dado principal (categoria/verbo de
// vencimento), antes do que pode crescer sem limite (endereço do imóvel,
// nome da parte, do ativo) — praticamente garantido de sempre caber.
//
// v1.8.0 — pedido explícito do Nicola: aba Financeiro › Recebimentos, cada
// mensalidade não paga só dizia "vence dia 15" (dia do mês, sem mês/ano —
// ambíguo fora do agrupamento por competência). Passou a mostrar a data
// completa (men.dataPgto, mesmo campo que mensalidadeEmAtraso() já usa
// como referência de vencimento até a mensalidade ser paga), com o verbo
// certo pro caso ("venceu em"/"vence em"); "vence dia N" continua como
// fallback só pra quando essa data ainda não existe no registro.
//
// v1.7.2 — pedido do Nicola após validar a extensão de saída no bot:
//   - Novo modal "Resumo da conciliação" (abrirResumoConciliacao /
//     abrirResumoConciliacaoPorDestino) — data/hora, origem (extrato vs
//     comprovante avulso), modo (automático+regra ou manual) e canal
//     (app ou bot, só quando manual) — plugado nos 4 lugares onde um item
//     conciliado aparece: Conciliação (conciliado e não controlado),
//     Recebimentos (mensalidade paga vinda de conciliação) e Saídas
//     (despesa paga vinda de conciliação).
//   - Correção real achada no caminho: confirmação MANUAL de entrada
//     (app ou bot) sempre aparecia como "Automático · Aluguel do
//     locatário" na lista — bug pré-existente num trigger de espelho do
//     banco (corrigido à parte), não algo desta versão introduziu.
//   - Menu de 3 pontinhos de item conciliado na aba Conciliação ganhou
//     "Recibo" direto (antes só via "Ver detalhe") e "Desfazer" virou
//     "Estornar", mesmo rótulo das outras abas.
//   - Totalizador (hero) da aba Conciliação agora reage aos chips de
//     status (Todos/Pendentes/Conciliados/Não controlado), igual
//     Recebimentos e Saídas sempre fizeram — era a exceção, não o padrão.
//
// v1.7.1 — pedido do Nicola ("não quero evoluir o sistema e ficar deixando
// código morto espalhado"): pendencias_extrato foi DROPADA de verdade no
// banco (não só parou de ser usada) — limpeza de tudo que ainda tocava
// nela aqui:
//   - chavesJaPendentes (lia o array pendenciasExtrato) e a checagem de
//     cls.classificacao === 'pendencia_ja_existe' (classificação que a RPC
//     compartilhada parou de devolver, mesma limpeza do lado do banco)
//     removidas do loop de importação — bug real corrigido junto:
//     qtdJaPendentes ficou órfã (nunca mais incrementada) e ainda era lida
//     na mensagem final — ReferenceError na próxima importação se não
//     tivesse sido pega agora.
//   - Bloco que resolvia "pendência antiga" (pendenciaAntiga, achava no
//     array pendenciasExtrato) removido — não existe mais tabela separada
//     pra fechar, extrato_fingerprints já reflete sozinho.
//   - idsPendenciasAlteradas e a rota 'pendenciasExtrato' em rotasTocadas/
//     saveAll removidas.
//
// v1.7.0 — 5ª leva de achados do Nicola + auditoria contra o design system:
//   - Resumo de competência em Recebimentos padronizado: sempre "valor · N
//     itens", em qualquer chip (inclusive "Todos") e qualquer competência.
//     Antes "Todos" mostrava a repartição por status (N pago/N atraso/N a
//     vencer), destoando do resto.
//   - Alerta "lançamentos futuros não entram aqui" removido de Atrasados
//     (avencerQtd/avencerValor continuam calculados, só não exibidos).
//   - Ícone de Recebimentos (e de Atrasados) virou fixo por tipo (seta de
//     entrada), não varia mais por status — status já está na tag, não
//     precisa repetir mudando a forma do ícone. Cor ainda muda (rz-bad).
//   - linhaConciliacaoUniHtml() reescrita inteira: usava divs com estilo
//     próprio (bg colorido no ícone, badge de status sem bolinha, grupo
//     sem fundo branco) — agora usa as classes canônicas do catálogo
//     (.rz-row/.rz-ic/.rz-tx/.rz-rt/.rz-chev) e renderStatus() (única
//     função que decide cor de status, REGRAS §10 — é dali que vem a
//     bolinha antes do texto, via .rz-st::before, que a Conciliação nunca
//     tinha porque nunca chamava essa função). Grupo expandido passou a
//     usar .rz-card.rz-list, mesmo fundo branco de Recebimentos/Saídas.
//   - Auditoria mecânica: rodei verificar_gramatica.py contra os arquivos
//     atuais (não só comparação visual). Achou e corrigiu 2 regressões
//     reais: emoji 🤖 numa mensagem de importação (trocado por ⚙️ — REGRAS
//     §16, robô é sempre ícone Lucide, nunca emoji) e um badge de
//     confiança usando var(--brass-deep) fora de uma classe .rz-* (uso
//     decorativo do dourado, exclusivo de IA) — trocado pela classe
//     própria .rz-ia-tag, que já existia no catálogo. hex_solto_style
//     ficou em 36 contra baseline 34, mas todo concentrado no formulário
//     legado de despesa (montarPopupDespesa), que já tinha 37 no arquivo
//     original antes desta sessão — não é regressão introduzida agora,
//     baseline parece só estar um pouco desatualizada; não mexido (seria
//     refactor grande, fora do escopo desta entrega).
//
// v1.6.9 — 4ª leva de achados do Nicola:
//   - Regra de conciliação: sheet de modo agora mostra a descrição
//     completa da regra (abrirEscolherModoRegra ganhou 3º parâmetro).
//   - Menu (⋮) unificado nas 3 abas: Conciliação tinha botões inline
//     (Confirmar/Outra saída) e um ícone avulso de Desfazer — viraram
//     opções do mesmo menu que abre ao tocar a linha
//     (abrirAcoesConciliacaoLinha, ramo "conciliado" reescrito: Ver
//     detalhe + Desfazer em vez de pular direto pra tela nativa).
//     Saídas ganhou o mesmo padrão (rzAcoesDespesa, novo — registrada na
//     ponte, achado no próprio fechamento desta leva: tinha ficado de
//     fora e o onclick teria falhado em produção).
//   - Ícone por categoria em Saídas (ICONE_POR_CATEGORIA_SAIDA) + descrição
//     limpa (limparRotuloConciliacao reaproveitada da Conciliação).
//   - "Marcar como repasse" agora identifica o sócio (automático pelo nome
//     do pagador, ou pergunta) e usa o mecanismo de repasse de verdade —
//     antes criava uma despesa genérica sem dono (confirmarMarcarComoRepasse
//     + criarRepasseDireto, novas).
//   - Bug real: formulário de despesa não lia valor/vencimento de
//     `sugestoes` — "Nova despesa"/"Outra despesa" vindo da Conciliação
//     abria com esses campos vazios mesmo passando os dados. Corrigido nos
//     3 pontos (o formulário em si + as 2 chamadas) — competência também
//     ajustada pra seguir o vencimento pré-preenchido, não mais o mês
//     corrente do calendário.
//
// v1.6.8 — 3ª leva de achados do Nicola testando no celular:
//   - Bug real: seletor de imóvel (abrirSeletorImovel, usado em 5 telas)
//     tinha o MESMO z-index do sheet "Buscar/Filtrar" de onde é aberto —
//     como vem antes no DOM, sempre ficava atrás. z-index subido (85).
//   - Ativo/Fornecedor "sem valores" em Saídas — conferido, não é bug: das
//     13 despesas da Rumo, 0 têm ativo vinculado e só 1 tem fornecedor
//     (campos opcionais no formulário, ninguém preencheu ainda).
//   - Lista de Conciliação padronizada com Recebimentos/Saídas: card branco
//     removido, título solto removido, chips de status neutros (.rz-chip
//     sem cor própria por chip, igual Partes/Recebimentos/Saídas).
//   - Botão Importar virou redondo (.rz-ico-btn, mesma posição de
//     Localizar); lupa nova ao lado — filtra texto livre + campos
//     condicionais por direção (entrada usa os de Recebimentos, saída os
//     de Saídas). Hero e agrupador atualizam com o filtro; agrupador passa
//     a mostrar "Entrada R$X (N itens) · Saída R$Y (M itens)".
//   - Atrasados (tab-inadimplencia) padronizada: hero verde no lugar das 2
//     caixas vermelha/âmbar, chip solto removido, "< Voltar" condicional
//     novo, agrupamentos viraram cortinas colapsáveis de verdade
//     (alternarGrupoInadimplencia — antes era texto fixo sempre aberto).
//     Caminho de entrada (toque em "Em atraso" no hero de Recebimentos)
//     ganhou seta de link e agora mostra o Voltar (abrirTelaAtrasados).
//
// v1.6.7 — 2ª leva da bateria grande de achados do Nicola (fecha os 9 itens
// que tinham ficado pendentes na 1ª leva):
//   - DARF/tributo: sugestão de categoria "tributo" agora abre o formulário
//     de despesa pré-preenchido em vez de criar direto — o texto do banco
//     não carrega qual tributo específico (IRPJ/CSLL/PIS/COFINS...), só a
//     guia teria isso. Outras categorias continuam criando direto.
//   - Saídas: lista sem ordenação estável dentro do grupo — "saía da
//     ordem" a cada recarregamento depois de dar baixa. Ordenado por
//     vencimento (Recebimentos já fazia isso, só Saídas que faltava).
//   - Chips de status (Todos/Pagos/A vencer/Em atraso ou Atrasadas) em
//     Recebimentos E Saídas — mesmo padrão .rz-chip de Partes/Conciliação.
//     Resumo da competência passa a mostrar "valor · N itens" quando um
//     chip específico está ativo (Recebimentos) ou sempre (Saídas, que já
//     não tinha contagem nenhuma antes).
//   - Saídas: resumo do topo virou geral (soma tudo que bate com os
//     filtros ativos), não mais travado no mês corrente do calendário —
//     mesmo padrão de Recebimentos agora.
//   - Conciliação: hero verde (.rz-kpi.rz-hero) no lugar do texto pequeno
//     "X de Y"; Importar + Reprocessar viraram 1 botão só com menu.
//   - "Apagar lançamentos em atraso" — já saiu na 1ª leva.
//   - Avaliado (não mudou código): tab-inadimplencia continua fazendo
//     sentido mesmo com os chips novos — ela agrupa por locatário (não só
//     competência) e tem "Cobrar pelo WhatsApp" com todas as competências
//     em atraso somadas, que os chips não replicam.
//
// v1.6.6 — 1ª leva de uma bateria grande de achados do Nicola (12 itens —
// ver changelog completo em index.html 1.178.8, esta versão cobre os que
// tocam financeiro.js):
//   - Despesa já conciliada abrindo "Nova despesa" em vez do detalhe com
//     Estornar: `lancamentos` nunca era recarregado depois de vincular/criar
//     saída pela Conciliação — a busca por id falhava. Corrigido nas 2
//     funções (confirmarVincularConciliacaoSaida, confirmarCriarSaidaConciliacao).
//   - "Apagar lançamentos em atraso do mês" removida do menu da competência
//     (rzAcoesGrupoMensal + apagarInadimplentesDoGrupo) — era a única opção
//     do menu, então o ⋮ do grupo saiu junto.
//
// v1.6.5 — 6 achados do Nicola, padronização Recebimentos/Saídas/Conciliação:
//   - "+" de Recebimentos removido — abria Importar/Reprocessar/Painel de
//     conciliação, tudo redundante com a aba própria; rzAcoesRecebimentos()
//     removida.
//   - Resumo do topo padronizado: Recebimentos e Saídas usam agora a MESMA
//     classe .rz-kpi.rz-hero do catálogo (antes cada um tinha desenho
//     próprio — Recebimentos com 3 caixas .rz-kpi soltas, Saídas com um
//     card customizado cor --sprout). Virou HTML estático em ambas as
//     abas, preenchido por id — igual ao padrão que só Saídas já usava.
//   - Chip "Atrasados" solto abaixo do segmento tirado de Recebimentos e
//     Saídas (Conciliação já não tinha mais). "Em atraso" de Recebimentos
//     e "Atrasado" de Saídas viraram parte do hero, tocáveis: Recebimentos
//     navega pra tab-inadimplencia (mesmo destino de sempre); Saídas
//     filtra a própria lista (filtrarSaidasPorStatus, novo — não existe
//     inadimplência de saída como tela própria).
//   - Conciliação ganha agrupamento por competência (mesmo padrão de
//     Recebimentos: cabeçalho colapsável, contagem de pendentes por mês).
//     Template de linha extraído pra linhaConciliacaoUniHtml() (reusado
//     por grupo, antes só existia inline).
//   - Grupo 100% futuro (só "a vencer", nada pago/atrasado ainda) em
//     Recebimentos ganha opacidade reduzida no cabeçalho — antes a única
//     diferença pro grupo com algo pra agir era o ⋮ sumir, sutil demais.
//
// v1.6.4 — mais achados do Nicola testando no celular (Conciliação):
//   - fn_extrato_vincular_recebimento tinha 2 overloads no banco (a de 5
//     parâmetros, que o app chama, e uma de 9 com p_multa/p_taxa/p_iptu/
//     p_condominio — órfã, de sessão anterior, ninguém chamava) — Postgres
//     não conseguia escolher, "Confirmar" quebrava com erro real. Overload
//     de 9 removida (banco).
//   - limparRotuloConciliacao() estendida: sem " - " ainda sobrava "PIX
//     TRANSF"/"TED" e a referência numérica do banco antes do nome ("TED
//     033.0944.HWN ENGENHARIA LTDA" virava só isso agora vira "HWN
//     ENGENHARIA LTDA").
//   - Chip "Automáticas" removido — redundante com "Conciliados" (acordo
//     com o Nicola: o selo por linha + Desfazer já aparecem lá, sem
//     precisar de filtro à parte).
//   - ACHADO GRAVE, no banco, fora do escopo desta versão do arquivo: ~15
//     fingerprints duplicados por variação de grafia da IA em
//     reimportações sobrepostas (mesmo TED/PIX extraído com texto
//     ligeiramente diferente a cada vez) — limpos os casos seguros (sem
//     conflito de conciliação). 11 grupos ficaram de fora da limpeza
//     automática por terem 2 mensalidades conciliadas com destinos
//     diferentes (risco de 1 pagamento real ter marcado 2 competências
//     como pagas) — aguardando decisão do Nicola, não é código.
//
// v1.6.3 — 5 achados do Nicola testando no celular (Conciliação):
//   - Título das linhas limpo: limparRotuloConciliacao() tira o prefixo
//     redundante que o banco grava junto ("SAÍDA BOLETO PAGO CONDOMINIO -
//     CONDOMINIO EDIFICIO..." → "CONDOMINIO EDIFICIO..."). Padrão real do
//     extrato Itaú: o trecho depois do ÚLTIMO " - " é o nome completo do
//     favorecido/pagador — o resto é histórico do banco, sem valor de
//     identificação. Tipo (boleto/PIX/TED) não aparece à parte, por
//     decisão dele ("ou não trazer").
//   - "Voltar" de um recebimento já conciliado, aberto a partir da
//     Conciliação, caía sempre em Recebimentos — a função só conhecia 2
//     origens (ficha de imóvel ou padrão). 3ª origem adicionada.
//   - Legenda dos status (explicarStatusConciliacao) — "i" ao lado do
//     título, pedido explícito ("o que significa pendente?").
//   - Barra de rolagem dos chips escondida (index.html).
//   - Botões Importar/Reprocessar viraram .rz-ico-btn do catálogo;
//     Importar ganhou o selo IA (mesma distinção que o sheet "Ações" já
//     fazia — Importar é tipo:'ia', Reprocessar não).
//
// v1.6.2 — pedido do Nicola: migração + remoção total do painel de
// Pendências legado (v1.6.1 tinha deixado de pé por decisão consciente —
// tinha ~30 pendências reais da Rumo, R$ 127 mil). Migração conferida no
// banco antes de remover: as 30 já tinham fingerprint correspondente em
// extrato_fingerprints (nenhuma perdida); 2 estavam com o status antigo
// dessincronizado do real (já resolvidas por baixo — rendimento, R01 — mas
// a pendência legada tinha ficado travada em "Pendente"), corrigidas no
// banco; as outras 28 seguem 'pendente', já visíveis/acionáveis na
// Conciliação nova. Removidos: HTML do painel (4 selects de filtro + lista
// agrupada por mês), renderPendenciasExtrato, alternarGrupoPendencias,
// vincularPendenciaExtrato, confirmarPendenciaDupla, descartarPendenciaExtrato,
// gruposPendenciasAbertos, e todo call-site (montarAbaFinanceiro, 4 pontos
// de refresh pós-salvamento, pontes window[...]). reprocessarConciliacaoPendente()
// reescrita: buscava em pendenciasExtrato (congelado desde v1.6.1, só
// cresceria com dado histórico) — agora busca extrato_fingerprints
// (status_conciliacao='pendente', direção entrada) direto, mesma fonte que
// a Conciliação usa; idempotente pelo mesmo motivo de sempre (chave igual,
// trigger de banco ignora o insert duplicado, só a reclassificação roda de
// novo). "Confirmação dupla" confirmado no backlog — pedido explícito do
// Nicola (é incomum; as 30 pendências reais da Rumo eram todas
// 'nao_identificado', nenhuma 'confirmacao_dupla').
//
// v1.6.1 — achado do Nicola testando no celular: painel de Pendências legado
// (pendencias_extrato) ainda era alimentado em PARALELO pela importação —
// toda linha de entrada não identificada gerava as duas coisas (fingerprint
// pendente + pendência legada), sistema duplicado de verdade, não só UI
// antiga. Parada a escrita nova nos 4 pontos de conciliarTransacoes() que
// ainda empurravam pra pendenciasExtrato — daqui pra frente, entrada não
// identificada fica só 'pendente' em extrato_fingerprints, a mesma fonte
// única que a Conciliação já usa. GAP CONHECIDO, aceito conscientemente:
// "confirmação dupla" (1 pagamento cobrindo 2 meses) não tem ação
// equivalente na tela nova ainda — não achei nenhum caso real na base da
// Rumo, registrado no código pra retomar se aparecer.
//   - "Buscar manualmente" NOVO (abrirBuscarMensalidadeManual): sheet com
//     busca por locatário entre os recebimentos em aberto — substitui a
//     dependência de rolar até o painel antigo quando a IA não encontra
//     sugestão (fn_extrato_sugerir_recebimento só olha ±5%/±7 dias).
//   - Decisão consciente, NÃO fiz nesta rodada: o painel antigo em si
//     (HTML + renderPendenciasExtrato + vincular/descartar/confirmarDupla)
//     continua de pé — tem ~30 pendências reais (R$ 127 mil) da Rumo já
//     carregadas nele, resolvíveis pela UI de sempre. Remover a tela agora
//     esconderia dinheiro real ainda em aberto. Ela deve ficar vazia
//     sozinha à medida que essas 30 forem resolvidas (ou descartadas) pela
//     UI de sempre — sem pendência nova entrando, só esvazia. Remoção total
//     do HTML/funções fica pra quando isso zerar (ou se o Nicola preferir
//     migrar as 30 de uma vez, o que é outra frente).
//
// v1.6.0 — Etapa 8 do PLANO_CONCILIACAO_FINANCEIRO_RAIZ_v1_4.md.
//   - Sugestões em lote (fn_conciliacao_sugestoes, 1 chamada pra lista
//     inteira) — linha pendente com sugestão mostra "Parece: X" tocável
//     (ficha completa) + Confirmar/Buscar outro direto na linha, sem
//     precisar tocar pra buscar. Ações ambíguas (soma, valor divergente,
//     memória sem parâmetro exposto) caem no fluxo de toque de sempre —
//     falha fechada.
//   - Chip "Automáticas": tudo que o motor conciliou sozinho (regra_codigo
//     preenchido), com selo "Automático · <regra>" e Desfazer
//     (reaproveita fn_extrato_estornar_vinculo, agora exportada).
//   - "Sempre fazer assim" no formulário de nova despesa vinda da
//     conciliação (fn_conciliacao_sempre_assim) — só aparece quando a
//     linha tem documento (a RPC exige pra criar a memória).
//   - Fim da importação chama fn_conciliacao_aplicar (motor novo trata
//     rendimento/tarifa/repasse de administradora também pelo app).
//   - banco_origem real (achado A5) — não mais 'Itaú' fixo pra PDF/foto.
//   - historico/razaoSocial/documento separados (achado A3/A4) — antes só
//     descricao, documento sempre ''.
//   - Sócios pelo dado (achado A7) — SOCIOS_CONHECIDOS (config estática,
//     sempre vazia) virou obterSociosConhecidos(), computada de
//     contratos[].divisaoRepasse.
//   - Achado ao escrever: 3 novas funções usadas via onclick="" (escopo
//     global) precisavam de export + ponte — não bastava aoTocar (closure
//     de módulo). Corrigido antes de entregar.
//
// v1.5.1 — Etapa 7 do plano, resto: Conciliação virou aba própria
// (tab-conciliacao, index.html) em vez de painel escondido dentro de
// Recebimentos — montarAbaFinanceiro() ganha o ramo 'tab-conciliacao'
// (chama carregarConciliacaoUnificada()/renderPendenciasExtrato() direto,
// sem esperar toggle manual). alternarPainelConciliacao() removida — não
// existe mais painel pra abrir/fechar, a aba já mostra tudo ao entrar. O
// sheet "Painel de conciliação" (rzAcoesRecebimentos) agora só chama
// switchTab('tab-conciliacao').
//
// v1.5.0 — Etapa 7/8 do PLANO_CONCILIACAO_FINANCEIRO_RAIZ_v1_4.md. Achado ao
// revisar antes de mexer na tela: ressincronizarFingerprintAposEstorno()
// (v1.4.1, hoje mais cedo) fazia na mão exatamente o que
// fn_mensalidade_espelha_fingerprint/fn_lancamento_espelha_fingerprint
// (triggers de banco, Etapa 3) passaram a fazer sozinhos — e de forma mais
// completa (também limpam regra_codigo, que a função aqui não limpava).
// Removida; fica só atualizarConciliacaoSeAberta() (refresh de tela, sem
// gravação). Nenhuma perda: os dois pontos de chamada continuam
// resincronizando a tela de conciliação do mesmo jeito, só que o RESET em
// si agora é feito uma vez só, no banco, pra qualquer caminho que apague o
// pagamento (app, bot ou futura tela de gestão) — não só o estorno nativo.
//
// v1.4.1 — pedido explícito do Nicola ("não dá pra deixar desta forma"):
// estornarMensalidade/estornarPagamentoDespesa (telas nativas, fora da
// conciliação) agora ressincronizam extrato_fingerprints de volta pra
// pendente — reaproveitando ressincronizarFingerprintAposEstorno, testada
// direto no banco antes de conectar. Fecha o ponto que tinha ficado em
// aberto na entrega anterior.
//
// v1.4.0 — módulo Apoio ao Contador: conciliação virou roteador fino
// (pedido do Nicola, 10/09/2026) — linha já conciliada abre a tela nativa
// de sempre (abrirRecebimentoDetalhe/abrirEditarDespesa) em vez de uma
// ficha própria; "Nova despesa" abre abrirNovaDespesa (já aceitava
// `sugestoes`, só nunca tinha sido chamada daqui) pré-preenchida.
// salvarDespesa() agora fecha o laço: quando a despesa nasce da
// conciliação, marca origem_tipo='extrato' e vincula o fingerprint de
// volta depois de criar — sem duplicar a lógica de criação.
// fn_extrato_sugerir_recebimento (nova, banco) dá sugestão de mensalidade
// pra vincular direto, mesmo padrão da de saída.
// Campos de IPTU/Condomínio (Etapa 1) adicionados na tela nativa de
// recebimento, ao lado de Multa/Taxa Adm. — informativos, não entram na
// conta do líquido.
//
// v1.3.1 — BUG REAL achado pelo Nicola com prints ("chips ficando em
// branco ao navegar"): filtrarConciliacaoChip() desativava um chip fazendo
// `b.style.color = b.style.color` — um no-op que MANTINHA a cor branca de
// quando o chip esteve ativo, com o fundo voltando pra branco também: texto
// branco em fundo branco, invisível. Corrigido — cada chip agora carrega
// sua própria cor (data-cor no HTML) e a restaura explicitamente ao
// desativar. Também achei e corrigi, no meio do conserto, uma quebra que EU
// tinha acabado de introduzir tentando ajustar a borda do card (título e
// div de abertura sumiram numa edição malfeita) — pego antes de entregar,
// conferido de novo depois. E o texto do resumo pós-importação deixou de
// dizer "descartado" pras saídas — elas vão pra tela nova, não pro lixo.
//
// v1.3.0 — módulo Apoio ao Contador, Etapa 2B (tela, 10/09/2026): tela de
// conciliação unificada (protótipo Tudo/Entradas/Saídas aprovado pelo
// Nicola) — lê extrato_fingerprints direto, segmento + chips filtram
// client-side. Entrada pendente só aponta pro painel de Pendências de
// sempre (não reimplementado); saída usa as 5 RPCs da Etapa 2A inteiras
// (sugerir/vincular/criar/não controlar/estornar). Abre junto do painel de
// conciliação de sempre (alternarPainelConciliacao).
//
// v1.2.0 — módulo Apoio ao Contador, etapa 2B (investigação + fix mínimo,
// 10/09/2026): a importação de extrato levava o documento (CPF/CNPJ) só até
// a classificação, nunca até extrato_fingerprints (documento_original,
// Etapa 1, ficava sempre null). Corrigido. E o resultado do match de
// entrada passa a ser espelhado no próprio fingerprint (status_conciliacao/
// destino_tipo/destino_id) — só isso, NADA da lógica de match em si mudou —
// pra uma futura tela unificada (protótipo já aprovado) poder ler entrada e
// saída pela mesma fonte. Achado no caminho: saída hoje só reconhece
// repasse pros sócios conhecidos; todo o resto (condomínio, DARF, boleto de
// terceiro) já virava fingerprint mas era descartado — com
// documento_original preenchido, essas linhas já ficam prontas pra tela de
// conciliação de saída usar (fn_extrato_sugerir_destino etc., Etapa 2A) sem
// precisar de mais nenhuma mudança na importação.
//
// v1.1.0 — módulo Apoio ao Contador, item 6 do plano (10/09/2026):
// gerarMensalidades() ("Gerar Mês") passa a chamar fn_gerar_mensalidades_
// competencia (banco) em vez da função JS local — fonte única a partir de
// agora, compartilhada com o disparo automático de contratos.js e o cron.
// saveAll() não entra mais nesta rota; recarrega mensalidades direto do
// banco depois da RPC.
//
// R8 — FRAGMENTAÇÃO, FATIA 1 (A.8, roteiro v4.7). Primeiro corte do
// Financeiro pra fora do index.html (Beta v1.138.0). Decisão do Nicola
// (06/09): "o definitivo de uma vez, o padrão mesmo" — ES module carregado
// SOB DEMANDA via import() no switchTab (mesmo mecanismo de
// js/ativos/ativos-boot.js e js/cadastros.js), não script clássico nem
// module carregado no boot.
//
// O QUE MORA AQUI (camada de tela + ações das abas tab-mensal /
// tab-inadimplencia / tab-saidas / tab-recebimento-detalhe):
//   · Recebimentos: renderMensalidades, sheets ⋮ (rzAcoes*), dar baixa /
//     estornar / excluir lançamento, Gerar mês, detalhe do recebimento.
//   · Atrasados: renderInadimplencia, cobrança por WhatsApp.
//   · Saídas: renderSaidas, popup de despesa (novo/editar/pagar/estornar/
//     excluir), filtros, entrada "Ver tudo em Saídas" vinda da ficha do ativo.
//   · Conciliação: importar extrato (planilha local ou IA), conciliar,
//     reprocessar, painel de pendências (vincular/confirmar/descartar).
//   · Recibo: sheet de opções (visualizar/PDF/WhatsApp/e-mail) e observação.
//
// O QUE FICOU NO index.html, DE PROPÓSITO (relação, não fusão — §18.3 do Cofre):
//   · Dados e sincronização: `mensalidades`, `lancamentos`, `pendenciasExtrato`,
//     `repasses`, carregar*/sincronizar*Supabase, normalizarMensalidade,
//     mensalidadeEmAtraso/AVencer (Alertas e Visão Geral usam). v1.177.0:
//     gerarMensalidadesParaCompetencia/construirLinhaDoTempoValor/valorVigenteEm
//     saíram (Etapa 7 da conciliação) — fonte única virou
//     fn_gerar_mensalidades_competencia (banco).
//   · Motor de PDF do recibo/relatórios (baixarArquivoPdfLocal,
//     ejecutarCanalComunicação, activeMenId/activeConId) — compartilhado com
//     Resultados. Este módulo só ABRE o sheet e delega.
//   · Helpers de uso geral: escapeHtmlSaidas (16 leitores fora daqui),
//     alternarGrupoSocio/gruposSociosFechados (Distribuição também usa),
//     competenciaParaData/dataParaCompetencia (a cópia duplicada que existia
//     dentro do bloco de Saídas foi apagada — vale a do index, que trata nulo
//     e faz padStart; saída idêntica pros valores válidos).
//   · O HTML das abas (filtros, painéis) — sai daqui quando o Financeiro
//     passar pela gramática própria (Financeiro+, A.6): mover markup 2x
//     seria retrabalho.
//
// COMO É CHAMADO:
//   · switchTab('tab-mensal' | 'tab-inadimplencia' | 'tab-saidas') →
//     carregarFinanceiro().then(m => m.montarAbaFinanceiro(tabId)).
//   · Quem chama de fora (onclick do HTML estático, ficha do contrato,
//     cofre-ativos.js/cofre-controles.js via window.*) passa pelas PONTES
//     globais instaladas no index.html: window[nome] = (...a) =>
//     carregarFinanceiro().then(m => m[nome](...a)). Nenhum HTML mudou.
//   · Ganchos de recarga de dados (saveAll, salvar contrato, carga inicial)
//     usam rzFinSeCarregado('renderX') — só redesenham se o módulo já está
//     no ar; ao abrir a aba depois, montarAbaFinanceiro desenha do zero.
//
// ESTADO GLOBAL LIDO/ESCRITO DAQUI (declarado no index, escopo léxico
// global compartilhado): mensalidades, lancamentos, pendenciasExtrato,
// extratoFingerprints, partesParaSelect (invalida cache), activeMenId,
// activeConId, contratos, imoveis, repasses, dbAuth, CONFIG_CLIENTE,
// CLIENTE_ID_SUPABASE, fichaImovelAtualId, administradoras, manutencistas,
// obterSociosConhecidos() (v1.177.0 — função, substitui a antiga constante
// SOCIOS_CONHECIDOS; achado A7). Estado EXCLUSIVO do Financeiro virou
// `let` de módulo (7 variáveis abaixo).
//
// INDENTAÇÃO: mantida a de origem (8 espaços) de propósito — vários
// template literals (texto de WhatsApp, HTML) contêm quebras de linha;
// reindentar mudaria strings. Diff contra o index anterior fica 1:1.
//
// Código é strict por ser module: varredura prévia não achou global
// implícita, `arguments` nem `with` (o único `this` está dentro de string).
// ============================================================================

---

## `js/fiscal.js`

//
// v1.1.0 (frente fiscal, Fase 5 — demanda 976fcbf6; decisão D7 do Nicola,
// preparação em lote) — tela nova "Fiscal da competência" (section
// tab-fiscal-competencia, aberta pelo botão Fiscal do Financeiro via
// window.abrirFiscalCompetencia, index.html v1.254.0). Toda a regra vive no
// banco: fn_fiscal_competencia (leitura) + fn_fiscal_documento_detalhe
// (rascunho/DPS) + as RPCs da Fase 4 (preparar, registrar emitida, cancelar,
// descartar, enviar ao contador, "não gera nota").
//   · Voltar ao Financeiro, barra do mês (começa no mês do Financeiro,
//     window.RZ_FIN_COMPETENCIA), cabeçalho "obrigatória desde …", quem
//     emite (toque edita), aviso com o motivo quando o plano/perfil não
//     inclui documentos fiscais.
//   · 4 KPIs + "Preparar todos (N)" (D7) com confirmação e o resultado
//     (criados/recusados com motivo).
//   · Segmento Recebimentos · Notas · Cadastro (Cadastro abre o checklist
//     fiscal atualizado, sem trocar a lista).
//   · Ações por linha conforme o status fiscal; ações que gravam levam o
//     código fiscal.documentos (cadeado + motivo pelo abrirSheetAcoes).
//   · Rascunho da nota: campos da DPS na ordem do Emissor Nacional com
//     "Copiar" por campo e "Copiar tudo"; itens; histórico.
//   · Anexar XML da NFS-e: sobe o arquivo para o Cofre (categoria Nota
//     fiscal, cofre-api.js) e chama a Edge cofre-extrair-documento 1.9, que
//     registra/casa a nota. Exige também cofre.upload (regra do Storage).
//   · fiscalEditarResponsavel ganha o parâmetro `depois` (redesenha a tela
//     de onde foi chamado).
//
// v1.0.1 — card Emissão: sem contador cadastrado, a linha "Contador" abre
// direto o cadastro já como Contador (window.abrirCadastroContador,
// index.html v1.253.0); com contador, continua levando a Partes.
//
// v1.0.0 (frente fiscal, Fase 3 — demanda 976fcbf6; decisões D1 e D3 do
// Nicola, 23/09/2026) — tela secundária ⚙️ › Empresa › Fiscal. Fatia lazy
// (carregada por carregarFiscal() no index.html na 1ª abertura), sem
// carregar*Supabase: toda a regra vive no banco.
//   · Card "Resultado do check-up": PJ = prontidão para a NFS-e (data por
//     regime + pendências); PF = resumo dos titulares.
//   · Card "Titulares" (PF): 1 linha por pessoa proprietária, com status
//     (Abaixo do limite · Atenção · Possível enquadramento). Tocar abre os
//     4 blocos de texto: regra, estimativa do sistema, orientação e quando
//     validar com o contador.
//   · Card "Dados que faltam": o que o check-up não conseguiu ver.
//     "Pendências de cadastro" abre o Checklist fiscal (fechamento.js).
//   · Card "Emissão": quem emite a nota (clientes.fiscal_responsavel_emissao),
//     contador cadastrado em Partes (fn_contadores_empresa) e a rotina
//     "NFS-e da competência".
//   · ⋮: "Registrar check-up" (grava o retrato imutável — fechamento_snapshot,
//     bloco checkup_fiscal), "Ver regras usadas" (versão e fonte de cada uma)
//     e a troca do ano analisado (este ano ⇄ próximo).
//   · Frase fixa no rodapé: "Calculado só com o que está no Raiz…".
// Fonte única: fn_fiscal_checkup / fn_fiscal_checkup_historico (porta
// fiscal.checkup: plano + perfil). Nunca afirma obrigação — "valide com seu
// contador" sempre visível no resultado amarelo/vermelho.
//
// ESTADO GLOBAL LIDO: dbAuth, CLIENTE_ID_SUPABASE, pessoaIdLogada, rzMostrarBloqueio, rzEsc, renderStatus,
// abrirSheet, abrirSheetAcoes, abrirSheetForm, rzSheetCabecalho, fecharSheet,
// mostrarToast, switchTab, rzIcones, podeUsar, window.fechamentoAbrirChecklistFiscalAtualizado.
// ============================================================================

---

## `js/imoveis.js`

//
// v1.5.1 — CORRIGIDO (QUA-01 — mesmo bug achado em contratos.js v1.13.1,
// reportado por Nicola): box Financeiro da Ficha do imóvel ordenava
// mensalidadesDoImovel comparando a string bruta "referencia" (formato
// "MM/YYYY") com localeCompare, agrupando por mês (todo "12/*" antes de
// todo "11/*") em vez de decrescente real por competência. Fix: chave
// "AAAAMM", mesmo padrão do fix em contratos.js. Client-side only.
//
// v1.5.0 — PAREI DE CHUTAR. Este bug ("Editar dados do imóvel não abre")
// já me enganou 3 vezes: cada tentativa corrigiu um problema real, mas
// nenhuma era A causa. O motivo de eu errar sempre: qualquer exceção no
// meio da população dos ~20 campos matava a função ANTES da linha que
// exibe o modal — em silêncio absoluto, sem erro no console visível pro
// usuário. Agora: o preenchimento foi extraído pra
// preencherCamposFormularioImovel() e roda dentro de try/catch — se
// estourar, o erro REAL aparece na tela; e o modal abre MESMO ASSIM,
// porque campo não preenchido é muito menos grave que tela que não abre.
// Se ainda falhar, o próximo teste finalmente dirá o motivo.
// (resetStepsImovel saiu do caminho — é no-op desde a v1.47.0, conferido.)
//
// v1.4.0 — CAUSA RAIZ do "Editar dados do imóvel não abre", enfim achada
// (3ª tentativa; as 2 anteriores corrigiram problemas reais, mas não ESTE).
// renderPreviewFotosImovel() fazia previewContainer.innerHTML direto num
// container que EU MESMO removi do formulário no A.9 (v1.163.0, corte do
// upload base64) — e editarImovel() chama essa função ANTES de tirar o
// 'hidden' do modal. Resultado: a execução morria no meio, sem erro
// visível, e a tela nunca aparecia. Na v1.163.0 eu tinha tornado 2 outros
// usos do mesmo id null-safe e deixei passar justamente o que estava no
// caminho crítico. Varri os 71 ids que este módulo referencia contra o
// index.html pra achar outros iguais — os demais órfãos estão em telas
// mortas ou já protegidos.
//
// v1.3.0 — BUG REAL: o bug do "Editar dados do imóvel" PERSISTIA depois do
// fix da v1.2.0 (esse estava certo, mas resolvia outra coisa). Causa real:
// rzMoverFormImovelParaBody() — que move o formulário pro <body>, chamada
// DIRETO NO BOOT do index.html, antes de qualquer interação — tinha vindo
// pra cá na extração do A.8 por engano. Uma função de boot dentro de um
// módulo lazy nunca roda a tempo. Voltou pro index.html (mesma categoria
// dos 4 carregar/sincronizar de antes, só que essa eu não tinha visto).
//
// v1.2.0 — BUG REAL achado pelo Nicola: "Editar dados do imóvel" (a partir
// do Ativo, via abrirGestaoImovel em cofre-ativos.js) não abria nada, sem
// nenhum aviso. Causa: editarImovel(id) procurava no array `imoveis`
// (carregado pelo boot do index.html) e retornava em silêncio se não
// achasse — corrida real entre esse boot e o boot independente do Cofre/
// Ativos. Agora recarrega uma vez antes de desistir, e avisa com toast se
// mesmo assim não achar. Não é bug de ponte (a ponte window.editarImovel
// do A.8 está correta) — é timing de dado.
//
// v1.1.0 — BUG REAL achado pelo Nicola (boot travava: "Falha ao buscar
// imóveis: Failed to fetch dynamically imported module"). Causa: a v1.0.0
// tinha levado carregarImoveisSupabase/sincronizarImovelSupabase/
// sincronizarImoveisSupabase/carregarTiposImovelSupabase junto — mas esses
// 4 são a camada de DADO/BOOT, não de tela, e o app carrega o array
// `imoveis` antes da primeira renderização. Voltaram pra index.html — mesmo
// padrão que contratos.js/minutas.js/financeiro.js já seguiam (nunca
// levaram seus carregar*Supabase/sincronizar*Supabase, só a UI). 47 funções
// ficam aqui, as 4 de dado saíram.
//
// R8 — FRAGMENTAÇÃO, FATIA 5 (A.8), combinada com o Nicola em 10/09/2026 como
// parte do caminho B (imóveis → ativos): mesmo método de contratos.js/
// vitrine.js/minutas.js/financeiro.js — ES module SOB DEMANDA via import()
// no switchTab, pontes window[nome] no index pra quem chama de fora,
// rzImoSeCarregado() nos ganchos de recarga (saveAll etc., pra não forçar o
// import só por causa de um save em outra aba).
//
// ESTADO GLOBAL LIDO/ESCRITO DAQUI: imoveis, contratos, mensalidades,
// pessoas, tiposImovelCadastrados, empreendimentosCadastrados, dbAuth,
// CONFIG_CLIENTE, CLIENTE_ID_SUPABASE, pessoaIdLogada, fichaImovelAtualId,
// imoveisFiltroAlertaContrato. Não redeclarado aqui — mesma convenção das
// fatias anteriores (script clássico e módulo compartilham o Global
// Environment Record; ver contratos.js para a mesma nota).
//
// 51 funções movidas verbatim (extração por balanceamento de chaves,
// conferida função a função — 0 sobreposição, 0 corte no meio). Nenhuma
// lógica mudou nesta fatia; só o "onde mora o código". valor_previsto/
// parcelas do A.10 e a publicação real de vitrine do A.9 já estavam
// aplicados nas versões anteriores e vieram junto sem alteração.
//
// PENDENTE (próximo passo do caminho B, passo 4): ainda lê `imoveis.fotos`
// puro em vários pontos (lightbox, miniatura do card) — só mostra o que
// está publicado na vitrine, não todas as fotos do Cofre; e `contratos`
// ainda referencia `imovel_id`, não `ativo_id`. Os dois ficam pra quando a
// fatia de Contratos migrar (passo 4), não escopo desta entrega.
// ============================================================================

---

## `js/resultados.js`

// Versão anterior: Beta v1.9.0 (04/10/2026 — demanda c71f617c)
// -----------------------------------------------------------------
// NOVIDADES (Beta v1.9.0) — UX F1.4a (sessão 20261003-1707-ux-base, aprovada pelo
//   Nicola 04/10 15:46): esqueleto (window.rzSkeleton) no lugar de "Carregando..." nos
//   sheets de Reajustes e de Revisional/Renovação do mês e na abertura da tela (cards).
// Versão anterior: Beta v1.8.2 (03/10/2026 — demanda 29bed5eb)
// NOVIDADES (Beta v1.8.2) — F0.3 do PLANO_UX (sessão 20261003-1707-ux-base,
//   "de acordo" do Nicola 03/10 23:57): a falha ao carregar deixa de mandar
//   "puxar a lupa e tocar em Aplicar" e o erro técnico some da tela; o card
//   ganha o botão "Tentar de novo", que recarrega o conteúdo.
// Versão anterior: Beta v1.8.1 (25/09/2026 — demanda 95d4009a)
// NOVIDADES (Beta v1.8.1) — demanda 95d4009a:
//   — fn_performance_empreendimento agora recebe p_uso (mesmo filtro que
//     fn_performance_carteira já usava) — visão por empreendimento passa
//     a respeitar o filtro Comercial/Residencial/Tudo em vez de sempre
//     trazer a carteira toda; rentabilidade_pct some quando uso =
//     'nao_comercial', igual ao que a carteira já fazia (DB corrigida
//     antes, nesta rodada só o front passa a mandar o parâmetro).
// -----------------------------------------------------------------
// NOVIDADES (Beta v1.8.0) — pedido do Nicola (23/09, 13:01): filtrando só
// Família, os cards Dependência de locatário, Reajustes, Revisional/Renovação
// e Performance não fazem sentido (são de carteira alugada) — saem da tela e
// as 3 consultas deles nem rodam. Em Tudo e Comercial continuam iguais.
// NOVIDADES (Beta v1.7.0) — demanda 43448a36 (teste reprovado pelo Nicola
// em 23/09, Albuquerque): em Família o cartão "Ativos em uso" ficava sempre
// "—" (ocupação só existe para long stay) e dava a impressão de que os
// ativos sem aluguel (terreno, carros, jet-ski) estavam fora do recorte.
// Agora mostra "Ativos" com a QUANTIDADE do recorte — o mesmo universo do
// Patrimônio e da Visão Geral.
// NOVIDADES (Beta v1.6.0) — demanda 8d5585a3 (achado do Nicola):
//   — Todo valor em R$ exibido nesta tela (formatarMoedaBR) passa a usar
//     `{ semCentavos: true }` — sem casas decimais. formatarMoedaBR() em
//     si ganhou esse 2º parâmetro opcional (index.html), default
//     inalterado, pra não afetar nenhuma das outras telas que já a usam
//     (regra DESIGN_SYSTEM §2: valor monetário SEMPRE via
//     formatarMoedaBR(), nunca .toFixed(2) — a variação fica dentro da
//     função, nunca bypassada).
//   — "Resultado mês a mês": removida a linha tracejada da média do
//     período e a legenda que a explicava (v1.5.0) — os números de
//     maior/menor no topo das barras continuam.
// -----------------------------------------------------------------
// NOVIDADES (Beta v1.5.0) — demanda 8ac32623 (achado do Nicola em revisão
// de telas, 21/09/2026):
//   — Patrimônio (card de KPIs e card Performance) passa a mostrar em
//     formato compacto ("R$ 41,9 mi"), reusando formatarValorCompacto que
//     a Visão Geral (index.html) já usa — mesmo formato em vez de um 2º
//     jeito de abreviar dinheiro (CAN-03).
//   — 4ª caixa de KPI: Inadimplência (valor em atraso no período) — opção
//     escolhida pelo Nicola entre as apresentadas (pergunta de múltipla
//     escolha). Mesmo campo inadimplencia_valor que o card Performance já
//     mostrava mais abaixo — fonte única.
//   — "Resultado mês a mês": legenda nova pra linha tracejada (média do
//     período), que antes só era explicada no Sheet do ícone (i).
// -----------------------------------------------------------------
// NOVIDADES (Beta v1.4.0):
//   — resetarResultadosParaAbaInicial() nova (demanda 60284322 — "navegação
//     por rodapé sempre reseta a aba", achado do Nicola em revisão de
//     telas): antes, o filtro aplicado (ano/abrangência/contexto/alvo)
//     ficava preso entre trocas de aba pelo rodapé — voltar pra Resultados
//     depois de ir noutro empreendimento/ano continuava mostrando o
//     último filtro escolhido, não o padrão (Carteira, ano corrente,
//     Tudo). Chamada por index.html (irParaAbaRodape) antes de
//     switchTab('tab-relatorios'); só reseta o estado — quem redesenha é
//     o gancho que o próprio switchTab já dispara.
// -----------------------------------------------------------------
// NOVIDADES (Beta v1.3.0):
//   — Card "Indicadores" e gráfico "Sua carteira × indicador" saem do
//     estado vazio (que dizia "a captura automática ainda não foi
//     construída") e passam a mostrar dado real: a B1.1 (22/09/2026,
//     mesma rodada) já capturou IPCA/IGP-M/Selic/IVG-R/INCC-DI/CDI do
//     BCB SGS (migration mercado_reajuste_simulador_v1 adiciona as
//     funções de leitura — fn_indicadores_resumo, fn_carteira_
//     indicador_series — este arquivo só passa a chamá-las).
//   — Card Indicadores: IPCA/IGP-M/Selic, acumulado 12 meses (mesmos 3
//     nomeados no texto que já existia aqui).
//   — Gráfico "Sua carteira × indicador": base 100, eixo único (ESP
//     §13.1 R9), comparando com o IPCA (índice mais comum nos contratos
//     cadastrados — decisão revisável, mesmo padrão de "propor e
//     documentar" da R.4); linha do indicador tracejada/cinza com
//     rótulo direto (R10), corta no último mês já capturado — não
//     inventa valor futuro. Fórmula documentada no changelog da
//     migration (fn_carteira_indicador_series): índice da carteira usa
//     o patrimônio do ano como referência fixa (o banco não guarda
//     patrimônio mês a mês) — mesma limitação já assumida no fator de
//     ocupação da R.4.
//   — Escopo desta entrega (ver ENTREGA_20260922_indicadoresSimuladorB1_2.md
//     §3): só resultados.js (Card Indicadores + gráfico, exatamente o
//     que a B1.2 nomeia como "Arquivos do produto") e o bloco "Pelo
//     contrato" da ficha do contrato (contratos.js, chip Renovação —
//     simulador pelo índice do contrato). O bloco "Pelo mercado" (faixa
//     estimada/confiança/situação) e "✨ Negociar acima do índice" NÃO
//     entram aqui — dependem de uma fonte de dado de mercado comparável
//     que ainda não existe (registrado como ideia de produto separada).
// -----------------------------------------------------------------
// NOVIDADES (Beta v1.2.0):
//   — Ícone (i) (mesmo botão/Sheet dos 2 cards de calendário, entrega
//     anterior) agora em TODOS os cards da tela: Indicadores, Resultado
//     mês a mês, Sua carteira × indicador, Dependência de locatário,
//     Performance — 5 nomes novos exportados (abrirInfoIndicadores,
//     abrirInfoResultadoMensal, abrirInfoGraficoIndicador,
//     abrirInfoConcentracao, abrirInfoPerformanceGrid) + bridge em
//     index.html. Botão extraído em botaoInfoCard() (era HTML duplicado
//     em cada função de card) — Reajustes/Revisionais passam a usar o
//     mesmo helper, sem mudança de comportamento. Não entra no bloco de
//     KPIs (.rz-kpis): não é `.rz-card` na anatomia do DESIGN_SYSTEM
//     (§5) — só os cards de verdade ganham o ícone.
// -----------------------------------------------------------------
// NOVIDADES (Beta v1.1.0):
//   — BUG REAL corrigido: chip de ano (Período) nunca marcava depois do
//     1º clique — onclick gerado por template string sempre manda texto
//     ('2026'), enquanto o padrão nascia number; escolherResultadosFiltro
//     agora força Number() só pro grupo 'ano'.
//   — Layout corrigido: linhas de "Dependência de locatário" quebravam
//     nome E valor quando o locatário tinha nome longo (faltava
//     flex:1;min-width:0 no nome e flex:none;white-space:nowrap no
//     valor — mesmo mecanismo que .rz-row .rz-tx/.rz-rt já usam no
//     resto do app).
//   — "Reajustes no ano" corrigido: a âncora do mês era o ÚLTIMO evento
//     de reajuste/renovação em historico_contrato, o que fazia o mês
//     "andar" ano a ano — agora é sempre o mês de aniversário da
//     ASSINATURA (con.inicio), fixo (migration
//     resultados_reajustes_revisionais_v1).
//   — Card novo "Revisional / Renovação": mesmo desenho do calendário
//     de reajustes (12 barras, por VALOR, mês concentra ≥25% = warning),
//     mas pelo mês de TÉRMINO do contrato (fn_carteira_revisionais_
//     calendario/fn_carteira_revisionais_mes, funções novas) — conceito
//     distinto de reajuste anual por índice, pedido explícito do Nicola.
//   — Os dois cards (Reajustes, Revisional/Renovação) ganham ícone (i)
//     no cabeçalho — abre sheet explicando os conceitos e métricas do
//     card, mesmo padrão de explicarStatusConciliacao() (financeiro.js).
// -----------------------------------------------------------------
// Tela nova de Resultados (ESP_RESULTADOS_MERCADO_FISCAL §4, REGRAS §13):
// "Resultados só mostra performance" — sem seletor, sem segmento, sem
// chip de tela; todo recorte (Período · Abrangência · Contexto) virou
// filtro dentro da lupa. Fatia lazy (UI-05): não chama nenhum
// carregar*Supabase — só dbAuth.rpc(fn_*) direto (mesmo padrão que
// montarResumoResultados()/renderRelatorios() já usavam no index.html)
// e globais compartilhados do <script> clássico (dbAuth,
// CLIENTE_ID_SUPABASE, mostrarToast, abrirSheet, abrirSheetAcoes,
// fecharSheet, rzSheetCabecalho, rzEsc, rzIcones, formatarMoedaBR,
// formatarDataBR, switchTab, empreendimentosCadastrados,
// abrirFichaContrato, abrirFichaAtivoNoChip, podeUsar,
// baixarRelatorioPdfLocal, exportarRelatorioSocioPDF, repasses).
//
// NOVIDADES (Beta v1.0.0):
//   — Cabeçalho descrição + lupa (Filtros) + Exportar, sem nenhum
//     controle fixo na tela (R1/R2 do §13.1 da ESP).
//   — Sheet Filtros: Período (2024·2025·2026) · Abrangência
//     (Carteira·Empreendimento·Imóvel) · Contexto (Tudo·Comercial·
//     Família) — três grupos independentes, Aplicar/Limpar.
//   — Resumo do filtro em texto abaixo do cabeçalho (nunca só a cor da
//     lupa como pista).
//   — Conteúdo (abrangência Carteira/Empreendimento): KPIs do período →
//     Indicadores → Resultado mês a mês (gráfico de barras) → Sua
//     carteira × indicador (gráfico) → Dependência de locatário →
//     Reajustes no ano (calendário de 12 barras, por VALOR) →
//     Performance (grid de 10 campos, fn_performance_carteira nova
//     desta entrega ou fn_performance_empreendimento já existente).
//   — Abrangência Imóvel não renderiza nada aqui: aplica e navega direto
//     pra ficha do ativo, chip Performance (§4.2 da ESP).
//   — Card Indicadores e gráfico "carteira × indicador" nascem no lugar
//     certo (posição, regra de sumir em Família) mas em ESTADO VAZIO
//     HONESTO: não existe hoje nenhuma fonte real de índice de mercado
//     no banco (indicador_series/valores só nascem na Fase B1, que não
//     é pré-requisito de A.3 — confirmado ao vivo nesta sessão: nem
//     essas tabelas nem nada mais simples existem). Decisão registrada
//     na demanda `45cc9f88` — fecha quando B1.2 entregar dado real (o
//     próprio PLANO já antecipa isso: "já com o lugar certo desde A.3
//     — só passa a ter dado real").
//   — Contexto Família: sem rentabilidade, sem card Indicadores, sem
//     gráfico de comparação — regra vem do banco (fn_resumo_resultados/
//     fn_performance_carteira devolvem NULL nesses campos com
//     p_uso='nao_comercial'), a tela só não renderiza o que vier nulo.
//   — "Reajustes no ano": toque na barra abre sheet com os contratos do
//     mês (fn_carteira_reajustes_mes); toque na linha abre a ficha do
//     contrato (abrirFichaContrato) — o chip Renovação próprio (ESP §7)
//     ainda não existe (é a Entrega A.6, adiante nesta fila), então por
//     ora a ficha abre no chip padrão; navegação já fica pronta pra
//     quando A.6 entregar o chip.
//   — "Dependência de locatário": até 6 barras + "Outros N locatários"
//     agregado sempre neutro (nunca conta como risco, ESP §4.6).
//   — Gráficos usam só tokens de cor já existentes (--sprout/--danger/
//     --warning/--sage) e a única dimensão em `style=""` é a geometria
//     de dado (altura/largura da barra) — não há como expressar um
//     valor contínuo numa classe `rz-*` fixa; zero classe/token novo no
//     DESIGN_SYSTEM (checklist §17 do REGRAS).
// =====================================================================

---

## `js/vitrine.js`

//
// v1.2.2 (demanda 11afd25f, pedido do Nicola: "deve apagar a opção dentro do
// link da minuta pois já tem a opção num passo antes") — o menu de Locação
// (abrirModalOpcoesContratacao) perde "Dados novo contrato": cadastrar na tela
// agora é escolhido antes, em "Novo contrato" (contratos.js 1.28.0,
// abrirEscolhaNovoContrato com o imóvel), e abre o formulário único. Este menu
// fica só com o que é dele: link de coleta, WhatsApp e minuta.
//
// v1.2.1 (demanda 303e68dc, achado do piloto — Claudia, 28/09/2026):
// iniciarProcessoContratacao() (bridge da opção "Contratação: link,
// WhatsApp e minuta" do menu de 3 pontos do ativo) ganha 1 retentativa:
// mesmo problema do criarContratoParaImovel() em contratos.js v1.23.1 —
// `imoveis` pode não refletir ainda um ativo recém-criado. Antes,
// `if (!imo) return;` falhava em silêncio — é o caminho mais provável do
// relato "clica na opção, mas não funciona o link" (esta função é quem
// monta o link/WhatsApp/minuta). Sem mudança de banco.
//
// v1.2.0 — pendência 46dc7300: iniciarProcessoContratacao() grava
// ativo_id em processos_contratacao (coluna nova), não mais imovel_id
// (FK real pra imoveis.id, que não batia mais com o id que este array
// carrega desde o único caminho de escrita da Onda 12 — quebrava pra
// qualquer imóvel). Testado ponta a ponta no banco antes de entregar.
//
// v1.1.0 — Onda 12, E15.3 (pedido explícito, 16/09/2026: "siga direto pra
// apontar a vitrine pra tabela de ativos"). Linha "Condomínio: R$ X | IPTU:
// R$ Y" removida dos 2 cards (renderVitrine — aba interna — e
// verificarFiltroVitrineExterna — página pública): os dois campos já
// viraram item de controle automático (E8), não são mais dado do imóvel.
// A fonte de dados da página pública em si mudou em index.html
// (resolverVitrinePublicaSupabase, v1.188.1) — este arquivo não fala com o
// banco diretamente, só recebe o objeto pronto; nenhuma query aqui mudou.
//
// R8 — FRAGMENTAÇÃO, FATIA 4 (A.8). Quarto corte do index.html (Beta
// v1.143.0), mesmo método das fatias 1–3: ES module SOB DEMANDA, pontes
// window[nome] no index, rzVitSeCarregado() nos ganchos de recarga.
//
// O QUE MORA AQUI: aba Vitrine (renderVitrine, busca, gerar link de 1 ou N
// imóveis), modo público ?v=<token> (verificarFiltroVitrineExterna — troca o
// <body> inteiro pela vitrine, lightbox de fotos, sair), modo público
// ?contratar=<token> (iniciarModoContratacaoPublica, validação e envio do
// formulário do interessado), início do processo de contratação a partir do
// imóvel/ativo (iniciarProcessoContratacao, abrirModalOpcoesContratacao) e o
// resumo pro WhatsApp (copyResumo).
//
// COMO É CHAMADO: switchTab('tab-vitrine') → montarAbaVitrine(); boot público
// (window.onload) importa o módulo ANTES de seguir quando a URL tem ?contratar
// ou ?v/?viewShowcase — a vitrine pública nunca deixa o visitante ver o login,
// então o import é aguardado (await) e só então o boot continua, igual ao
// comportamento anterior. Sem parâmetro público, o módulo não é baixado.
// cofre-ativos.js chama window.gerarVitrineDoImovel/iniciarProcessoContratacao
// (pontes). Ficha antiga do imóvel usa copyResumo/iniciarProcessoContratacao
// por onclick (pontes).
//
// O QUE FICOU NO index.html: dados (`processosContratacao`, links_vitrine —
// carregar/criar/apagar/resolverVitrinePublicaSupabase, usados no boot e no
// Dev), validarCNPJ (Partes e contrato também usam), banner de contratação
// do PLANO (mostrarBannerContratacao — é licença, não vitrine), HTML das
// telas públicas e da aba (sai com a gramática).
//
// ESTADO GLOBAL LIDO: imoveis, contratos, processosContratacao, CONFIG_CLIENTE,
// CLIENTE_ID_SUPABASE, dbAuth. Exclusivo (4) virou nível de módulo.
// Indentação de origem mantida. Strict verificado.
// ============================================================================

---

