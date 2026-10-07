// ============================================================================
// cofre-documentos.js — Raiz Patrimônio · Cofre de Documentos
// Versão: 2.29.0 · 07/10/2026
//
// v2.29.0 (demanda 6a1210a0, sessão 20261007-0207-ia-falha; "Pode fazer sim" do Nicola 07/10 02:07) —
// resultado da leitura que não engana:
//   (a) "Lido como Não classificado" (tipo "outro" ou sem tipo) deixa de ser um "Pronto" verde: vira
//       "Não reconheci o tipo deste documento", com "Conferir e classificar" (abre o Confira, onde se
//       escolhe o Tipo de documento e se pode Reler), outra foto, equipe Raiz (configuração) e cancelar.
//   (b) Leitor fora do ar (cofre-extrair-documento 1.12 devolve falha_ia): "A leitura com IA está fora do
//       ar agora", com Ler de novo (sem reenviar), Preencher eu mesmo e Cancelar.
//   (c) O "Pronto" explica a próxima tela: conferir os dados, ajustar o tipo se precisar e salvar.
//
// Versão anterior: 2.28.0 · 07/10/2026
//
// v2.28.0 (demanda 9ddb9f34, fatia U1b + U2, sessão 20261007-0129-upload-ia-b; "De acordo" do Nicola
// 07/10 01:29, protótipo PROTOTIPO_LEITURA_IA_RAIZ v1.1.0) —
//   (a) "Enviar documento" vira Sheet de ações do app (REGRAS §2): Fotografar e ler com IA · Escolher
//       arquivo e ler com IA · Só guardar o arquivo (IA no topo; sem IA no plano, cadeado com motivo).
//       Sai a caixinha "Ler com IA". Leitura e resultado no mesmo sheet, TRAVADO (rzSheetTravar do
//       index 1.312.0: sem X, sem arrastar, toque fora e voltar não fecham). No cofre.html avulso
//       (sem Sheet), o modal de sempre.
//   (b) Durante a leitura, sair/recarregar pede confirmação do navegador (beforeunload).
//   (c) U2 — antes de chamar a IA, o app anota no aparelho a leitura em andamento (chave do Sair,
//       raiz_d_<empresa>_<pessoa>_leitura_pendente: ids, nome do arquivo e vínculo) e manda
//       leitura_id ao leitor (cofre-extrair-documento 1.11 guarda o resultado). Se o app for
//       recarregado ou fechado no meio, o index oferece retomar ao reabrir; o evento
//       cofre:retomar-leitura reconstrói o envio com o arquivo já enviado e mostra o resultado
//       guardado (ou lê de novo, se não terminou). Salvar, cancelar, descartar ou "outra foto"
//       apagam a anotação e o resultado guardado.
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
export const VERSAO = '2.29.0'; // v-check (22/09/2026): lido por Dev › Versões — manter igual ao header
import { estado } from './cofre-estado.js';
// v2.3.1 — import TOLERANTE: na v2.2.0 isto era um import estático. Quando o
// cofre-imagem.js não subiu no deploy (faltava a linha no manifesto), o import
// falhou e derrubou o MÓDULO INTEIRO de Ativos — a aba ficou vazia. Nenhum
// recurso opcional pode ter esse poder: agora carrega sob demanda e, se não
// existir, o upload segue sem quality gate (degrada, não quebra).
let _imagemMod = null, _imagemFalhou = false;
async function imagemMod() {
    if (_imagemMod || _imagemFalhou) return _imagemMod;
    try { _imagemMod = await import('./cofre-imagem.js'); }
    catch (err) { _imagemFalhou = true; console.warn('[cofre] quality gate indisponível (cofre-imagem.js não carregou):', err.message); }
    return _imagemMod;
}
const avaliarFoto = async (f, o) => (await imagemMod())?.avaliarFoto(f, o) ?? { ok: true, bloqueios: [], avisos: [], medidas: null, aplicavel: false };
const detectarPdfProtegido = async (f) => { try { return !!(await (await imagemMod())?.detectarPdfProtegido(f)); } catch { return false; } };
const destravarPdf = async (f, senha) => (await imagemMod())?.destravarPdf(f, senha);
const tratarImagem = async (f, o) => (await imagemMod())?.tratarImagem(f, o) ?? null;
const resumoQualidade = (a, t) => _imagemMod ? _imagemMod.resumoQualidade(a, t) : null;
import * as api from './cofre-api.js';
import { mostrarToast, abrirModal, fecharModal, refrescarIcones, perguntar, avisarComDesfazer } from './cofre-ui.js';
import {
    escapeHtml, formatarDataBR, formatarBytes, diasAte, chipVencimento,
    classificarStatusVinculo, rotuloStatusVinculo, rotuloTipoAtivo, iconeAtivo, rotuloTipoControle,
    BADGE_NEUTRO, BADGE_PENDENTE, BADGE_OK, BADGE_ALERTA, numeroWhatsAppComDDI,
} from './cofre-validacoes.js';
// v2.21.0 (Fase 1 do wrapper de escrita, rollout Cofre de Documentos/
// Controles) — emitirEscrita() é o evento padrão pra "algo mudou que
// módulos DE FORA do Cofre podem precisar saber" (cofre:recarregar-
// documentos continua existindo do jeito que está, só serve o Cofre por
// dentro — ver changelog do topo do arquivo). aoEscrever() usado pelo
// listener module-level logo abaixo do bloco de "cofre:recarregar-
// documentos" já existente.
import { emitirEscrita, aoEscrever } from './raiz-eventos.js';

// D-2 (revisão DS) — helper local: mesma regra que chipStatusVinculoHtml()
// de cofre-ui.js, mas retornando só a classe (as 2 chamadas deste arquivo
// já montam o próprio <span>/<button>). Evita repetir o ternário 2x.
function classeBadgeVinculo(status) {
    return status === 'triagem' ? BADGE_PENDENTE : (status === 'empresa' ? BADGE_NEUTRO : BADGE_OK);
}

let docAtualId = null;

// ============================================================================
// HOME
// ============================================================================
// v6: alertas são DERIVADOS de cofre_ocorrencias_controle (via
// estado.ocorrenciasAbertas, já vem com o item de controle embutido).
// Não existe mais cadastro manual de alerta (cofre_eventos foi removida).
function ocorrenciaParaAlertaViewHome(oc) {
    return {
        id: oc.id,
        itemControleId: oc.item_controle_id,
        titulo: oc.cofre_itens_controle?.titulo || '(item removido)',
        tipo: oc.cofre_itens_controle?.tipo || null,
        ativoNome: oc.cofre_itens_controle?.cofre_ativos?.nome_exibicao || null,
        tipoAtivo: oc.cofre_itens_controle?.cofre_ativos?.tipo_ativo || null,
        data_vencimento: oc.data_prevista_atual,
    };
}

// v1.26.0 (31/08/2026, pedido explícito) — guarda defensiva no topo:
// embutido no App (ativos-boot.js), data-screen="home" foi APAGADA
// (ver ativos-markup.js) — "Em triagem"/"Atenção necessária" migraram
// pra Visão Geral de verdade (index.html, carregarPontosAtencaoFundidos()).
// Esta função continua existindo porque cofre.html standalone ainda tem
// a Home de verdade (arquivo NÃO tocado) — só não pode mais assumir que
// os elementos existem. kpi-total-ativos é o 1º elemento que a Home
// sempre teve; se ele não existir, nenhum dos outros existe também
// (são todos da mesma seção) — checagem única, sem repetir em cada
// linha.
export function montarHome() {
    // A tela home do Cofre saiu do app (markup v1.5.0) — segue existindo só no
    // cofre.html. Sem os elementos, não há o que montar.
    if (!document.getElementById('kpi-total-ativos')) return;

    document.getElementById('kpi-total-ativos').textContent = estado.ativos.length;
    document.getElementById('kpi-total-docs').textContent = estado.documentos.length;

    const alertasView = estado.ocorrenciasAbertas.map(ocorrenciaParaAlertaViewHome);
    const vencendo = alertasView.filter(e => { const d = diasAte(e.data_vencimento); return d !== null && d >= 0 && d <= 30; });
    const vencidos = alertasView.filter(e => { const d = diasAte(e.data_vencimento); return d !== null && d < 0; });
    document.getElementById('kpi-vencendo').textContent = vencendo.length;
    document.getElementById('kpi-vencidos').textContent = vencidos.length;

    const emTriagem = listarDocumentosEmTriagem();
    const wrapperTriagem = document.getElementById('home-triagem-wrapper');
    wrapperTriagem.classList.toggle('hidden', emTriagem.length === 0);
    document.getElementById('home-lista-triagem').innerHTML = emTriagem.slice(0, 5).map(docCardCompactoHtml).join('');

    // Revisão de design (25/08/2026, pedido explícito) — removido o
    // atalho "Ver todos" da Home (única porta de entrada pra tela cheia
    // de Alertas). Sem essa saída, um .slice(0, 5) escondia alerta 6+
    // sem nenhum jeito de ver — removido o limite, a lista mostra tudo
    // que está aberto (mesmo princípio do "Atenção necessária" do
    // Imóveis: nunca esconde nada atrás de paginação).
    const listaAlertas = [...vencidos, ...vencendo];
    document.getElementById('home-lista-alertas').innerHTML = listaAlertas.length
        ? listaAlertas.map(alertaCardHtml).join('')
        : `<p class="text-xs text-slate-500">Nada pedindo atenção agora. 🎉</p>`;

    refrescarIcones();
}

// v2.3.0 — fonte única de "documento pendente de vínculo". Home do Cofre,
// Visão Geral e tela de Alertas leem daqui — antes cada uma refazia o filtro.
export function listarDocumentosEmTriagem() {
    return (estado.documentos || []).filter(d => classificarStatusVinculo(d.cofre_documento_vinculos) === 'triagem');
}

// v2.3.0 — ponte App→Cofre (mesmo padrão de abrirItemControleComOrigemAlertas):
// abre a ficha do documento com o "Vincular agora" já aberto — que é a ação
// que resolve a pendência. A tela "home" do Cofre, onde a lista de triagem
// morava, foi apagada no corte do markup v1.5.0; o lugar dela agora é a tela
// de Alertas (index.html), pela categoria "Documentos".
export async function abrirDocumentoEmTriagem(documentoId) {
    await abrirFichaDocumento(documentoId);
    const wrapper = document.getElementById('fd-vincular-agora-wrapper');
    if (wrapper && !wrapper.classList.contains('hidden')) abrirVincularAgora();
}

// v2.3.0 — dados prontos pro card de alerta (a tela de Alertas não conhece a
// forma de cofre_documentos).
export function resumoDocumentosEmTriagem() {
    return listarDocumentosEmTriagem().map(d => ({
        id: d.id,
        titulo: d.nome_exibicao || d.nome_original || 'Documento sem nome',
        subtitulo: 'Pendente de vínculo — toque para vincular',
        criado_em: d.criado_em || null,
    }));
}

// Revisão de design (25/08/2026, pedido explícito) — igualar 1:1 ao
// padrão "Atenção necessária" da Visão Geral do Imóveis (index.html
// #geral-atencao-lista): mesmo box de ícone (w-9 h-9 rounded-lg),
// mesma tipografia (título text-xs font-bold, legenda text-[11px]
// text-slate-500), mesmo chevron (#94a3b8), mesma borda
// (border-slate-200, rounded-xl, p-2.5). O ícone agora representa o
// TIPO DO ATIVO (mesmo glyph usado na aba Ativos — iconeAtivo()), não
// mais um selo genérico de vencimento. Badge "Vence em Xd" + data
// numa linha separada viraram UMA frase só (fraseVencimento()).
// CORRIGIDO (18/09/2026, achado no print do Nicola — "alerta vermelho no
// ativo da Faria Lima sem item em alerta aparente"): mesmo bug de padrão já
// corrigido em index.html/cofre-ativos.js/cofre-controles.js/contratos.js
// (rodada 4) nunca tinha chegado aqui — "Falta(m) X dia(s)!"/"Venceu há X
// dia(s)!" (verboso, sem o "d" curto) e, pior, corFraseVencimento() pintava
// de âmbar QUALQUER coisa até 30 dias de prazo (inclusive 21/28 dias, que a
// régua "há/em xx d" já trata como 'run'/tranquilo em todo o resto do app) —
// o alerta piscava "preocupante" numa tela e "em Xd" tranquilo noutra, pro
// MESMO item. Unificado: só dias<0 é vermelho (vencido) e dias===0 é âmbar
// (vence hoje); qualquer prazo positivo é 'run' (azul), sem teto de 30 dias.
function fraseVencimento(dataVencimento, dias) {
    const dataFmt = formatarDataBR(dataVencimento);
    if (dias === null || dias === undefined) return `Vencimento: ${dataFmt}`;
    if (dias < 0) { const d = Math.abs(dias); return `Vencimento: ${dataFmt} · há ${d}d`; }
    if (dias === 0) return `Vencimento: ${dataFmt} · Vence hoje`;
    return `Vencimento: ${dataFmt} · Em ${dias}d`;
}

function corFraseVencimento(dias) {
    if (dias === null || dias === undefined) return 'text-slate-500';
    if (dias < 0) return 'text-red-700';
    if (dias === 0) return 'text-amber-700';
    return 'text-blue-700';
}

export function alertaCardHtml(e) {
    const dias = diasAte(e.data_vencimento);
    const descricao = e.ativoNome ? `${escapeHtml(e.ativoNome)} - ${escapeHtml(e.titulo)}` : escapeHtml(e.titulo);
    return `<div class="border border-slate-200 rounded-xl p-2.5">
        <button data-action="abrir-item-controle" data-id="${e.itemControleId || ''}" class="w-full flex items-center gap-3 text-left">
            <div class="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center flex-none"><i data-lucide="${iconeAtivo(e.tipoAtivo)}" style="width:16px;height:16px"></i></div>
            <div class="flex-1 min-w-0">
                <div class="text-xs font-bold truncate">${descricao}</div>
                <div class="text-[11px] ${corFraseVencimento(dias)}">${fraseVencimento(e.data_vencimento, dias)}</div>
            </div>
            <svg data-lucide="chevron-right" style="width:16px;height:16px;color:#94a3b8;flex-shrink:0"></svg>
        </button>
        <div class="flex gap-2 mt-2 pt-2 border-t border-slate-100">
            <button data-action="alerta-tratar" data-ocorrencia-id="${e.id}" data-item-id="${e.itemControleId || ''}" style="flex:1;background:var(--pine);color:#fff;font-weight:bold;font-size:11px;padding:6px;border:none;border-radius:6px;">Tratar</button>
            <button data-action="alerta-acionar" data-item-id="${e.itemControleId || ''}" data-titulo="${escapeHtml(e.titulo)}" data-tipo="${e.tipo || ''}" style="flex:1;background:#f1f5f9;color:#475569;font-weight:bold;font-size:11px;padding:6px;border:none;border-radius:6px;">Acionar</button>
        </div>
    </div>`;
}

// Atalho "Acionar" do alerta (pedido explícito, 25/08/2026) — busca o(s)
// contato(s) vinculados ao item na hora do clique (não traz isso pra
// todo card da lista de alertas, custo desnecessário pra uma ação
// ocasional). Prioriza WhatsApp sobre e-mail (mesmo canal principal do
// resto do produto); se não houver nenhum contato, avisa em vez de
// travar — a Ficha do Item já tem "Mais ações → Adicionar contato" pra
// resolver isso.
export async function acionarContatoAlerta(itemControleId, titulo, tipo) {
    if (!itemControleId) { mostrarToast('Item de controle não encontrado.', 'erro'); return; }
    let contatos;
    try {
        contatos = await api.listarContatosPorItemControle(itemControleId);
    } catch (err) { mostrarToast('Erro ao buscar contato: ' + err.message, 'erro'); return; }

    if (!contatos.length) {
        mostrarToast('Nenhuma parte vinculada a este item ainda. Adicione uma na ficha do item (chip Partes → Editar partes).', 'aviso');
        return;
    }
    const contato = contatos.find(c => c.whatsapp) || contatos.find(c => c.email) || contatos[0];
    const descricaoItem = tipo ? `${titulo} (${rotuloTipoControle(tipo)})` : titulo;
    const mensagem = `Olá! Poderia nos enviar uma cotação atualizada para a renovação do item de controle "${descricaoItem}"? Obrigado!`;

    if (contato.whatsapp) {
        // BUG FIX (25/08/2026) — ver mesma correção em acionarParteItemDireto
        // (cofre-controles.js): garante DDI (55) no número antes do wa.me.
        const numero = numeroWhatsAppComDDI(contato.whatsapp);
        window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`, '_blank', 'noopener');
    } else if (contato.email) {
        const assunto = `Cotação — renovação: ${titulo}`;
        window.open(`mailto:${contato.email}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(mensagem)}`, '_blank', 'noopener');
    } else {
        mostrarToast(`Contato "${contato.nome}" não tem WhatsApp nem e-mail cadastrado.`, 'aviso');
    }
}

function docCardCompactoHtml(d) {
    return `<div class="raiz-bloco-interno flex items-center justify-between cursor-pointer" data-action="abrir-documento" data-id="${d.id}">
        <div class="min-w-0"><p class="text-sm font-semibold truncate">${escapeHtml(d.nome_exibicao)}</p><p class="text-xs" style="color:var(--sage)">${formatarDataBR((d.criado_em || '').slice(0, 10))}</p></div>
        <i data-lucide="chevron-right" style="width:16px;height:16px;color:var(--sage)"></i>
    </div>`;
}

// C-ativos-home (revisão DS, 25/08/2026) — ativoCardMiniHtml() removida:
// era usada só pela seção "Ativos controlados" da Home, removida a pedido
// explícito (Visão Geral não deve listar ativos nem ter atalho "Ver
// todos" — essa listagem já existe na própria aba Ativos).

// ============================================================================
// UPLOAD — v2.0.0 (09/09/2026, A.12/A.13): a IA lê ANTES de gravar.
// Caixa mínima (Câmera · Arquivo · "Ler com IA") → arquivo sobe pro Storage
// → cofre-extrair-documento em modo pré-insert → UMA tela de confirmação com
// tudo preenchido → Salvar executa o que está parametrizado na categoria
// (manter arquivo ou só dados; controlar vencimento com item de controle).
// Sem IA = mesma tela, vazia. Cancelar apaga o arquivo já enviado (nada
// fica órfão no Storage).
// ============================================================================
const LIMITE_ARQUIVO = 25 * 1024 * 1024;
const MIMES_IA = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
let up = null;                // upload em curso: { contexto, vinculo, comIA, arquivo, hash, documentoId, storagePath, ia, padroes }
let gabaritoCategorias = null; // linhas globais de cofre_categorias (padrões)
let subtiposControle = null;   // v2.1.0 — catálogo global (cofre_controle_subtipos, cliente_id null, ativo)
let aplicabilidadeSubtipos = null; // v2.16.0 — cofre_subtipo_aplicabilidade (ativo=true) — fonte real de "este subtipo serve pra este tipo de ativo"
const LIMIAR_CONFIRA = 0.75;

function podeIA() { return window.podeUsar ? window.podeUsar('cofre.analisar_ia').ok : true; }
function podeControlar() { return window.podeUsar ? window.podeUsar('cofre.controles.criar').ok : true; }

export async function abrirUploadHome() { await abrirPickerUpload(null, true); }
export async function abrirUploadNoAtivoComIA(ativo) { if (ativo) await abrirPickerUpload({ entidadeTipo: 'ativo', entidadeId: ativo.id, nome: ativo.nome_exibicao, tipoAtivo: ativo.tipo_ativo }, true); }
export async function abrirUploadNoAtivoSemIA(ativo) { if (ativo) await abrirPickerUpload({ entidadeTipo: 'ativo', entidadeId: ativo.id, nome: ativo.nome_exibicao, tipoAtivo: ativo.tipo_ativo }, false); }
export async function abrirUploadContextualComFlag(entidadeTipo, entidadeId, nomeExibido, comIA) { await abrirPickerUpload({ entidadeTipo, entidadeId, nome: nomeExibido }, !!comIA); }
export async function abrirUploadContextual(entidadeTipo, entidadeId, nomeExibido) { await abrirPickerUpload({ entidadeTipo, entidadeId, nome: nomeExibido }, true); }

// v2.26.0 (D2) — configuração inicial: o mesmo leitor, marcado com o tipo esperado.
const ROTULO_TIPO_CFG = { lista_ativos: 'Lista de ativos', documentos_ativos: 'Documentos dos ativos', contratos: 'Contratos de aluguel', contas_apolices: 'Contas e apólices', documentos_pessoas: 'Documentos de pessoas' };
export async function abrirUploadConfiguracao(tipo, aoTerminar) {
    await abrirPickerUpload(null, true);
    if (!up) return;
    up.config = { tipo, aoTerminar };
    document.getElementById('upload-contexto-legenda').textContent = `Configuração inicial · ${ROTULO_TIPO_CFG[tipo] || 'documento'}. Um documento por vez.`;
    if (up.modoSheet) { const sub = document.querySelector('#rz-sheet .rz-sh-h .rz-sub'); if (sub) sub.textContent = subEnvio(); } // v2.28.0
}
function avisarConfig(cfg, res) {
    if (cfg && typeof cfg.aoTerminar === 'function') setTimeout(() => cfg.aoTerminar(res || {}), 150);
}
async function rpcDoc(nome, args) {
    const { data, error } = await dbAuth.rpc(nome, args);
    if (error) throw error;
    return data;
}
function ehDocumentoDePessoa(s) { return !!(s && Array.isArray(s.titular_escopo) && s.titular_escopo.includes('pessoa')); }
function leituraFraca() {
    if (!up) return false;
    const m = up.motor;
    if (!up.ia) return true;
    if (!m) return up.ia.confianca === 'baixa';
    return !m.subtipo_codigo || m.subtipo_codigo === 'outro' || up.leituraFalhou || (typeof m.confianca === 'number' && m.confianca < LIMIAR_CONFIRA);
}

function rotuloEntidadeTipo(t) {
    return { ativo: 'Ativo', imovel: 'Imóvel', contrato: 'Contrato', pagamento: 'Pagamento', empresa: 'Empresa', item_controle: 'Item de controle' }[t] || t;
}

async function abrirPickerUpload(contexto, comIA) {
    garantirModaisUpload(); if (leitura) encerrarLeitura(); // v2.27.0
    up = {
        contexto, tipoAtivo: contexto?.tipoAtivo || null, comIA: comIA && podeIA(), arquivo: null, hash: null, documentoId: null, storagePath: null, ia: null,
        vinculo: contexto ? { tipo: contexto.entidadeTipo, id: contexto.entidadeId, nome: contexto.nome || rotuloEntidadeTipo(contexto.entidadeTipo) } : null,
    };
    document.getElementById('upload-contexto-legenda').textContent = contexto
        ? `Vai sair vinculado a: ${up.vinculo.nome}.`
        : 'Escolha a foto ou o arquivo — o resto você confere na tela seguinte.';
    const chk = document.getElementById('up-com-ia');
    chk.checked = up.comIA; chk.disabled = !podeIA();
    document.getElementById('up-com-ia-hint').textContent = podeIA() ? '— preenche tudo pra você só conferir' : '— indisponível no seu plano';
    ['up-arquivo', 'up-camera'].forEach(id => { document.getElementById(id).value = ''; });
    document.getElementById('up-status').textContent = '';
    if (modoSheet()) { up.modoSheet = true; abrirSheetEnvio(); return; } // v2.28.0
    abrirModal('modal-upload');
    refrescarIcones();
}

// v2.28.0 — "Enviar documento" como Sheet de ações do app (REGRAS §2): IA no topo, cada opção com
// ícone, verbo e explicação; leitura e resultado no mesmo sheet (#up-progresso), travado.
function subEnvio() {
    if (up?.config) return `Configuração inicial · ${ROTULO_TIPO_CFG[up.config.tipo] || 'documento'}. Um documento por vez.`;
    if (up?.vinculo) return `Vai sair vinculado a: ${up.vinculo.nome}`;
    return 'O resto você confere na tela seguinte';
}
function abrirSheetEnvio() {
    const ia = window.podeUsar ? window.podeUsar('cofre.analisar_ia') : { ok: true };
    const acao = (id, icone, tipo, titulo, sub, off) =>
        `<button type="button" class="rz-act ${off ? 'rz-off' : ''}" data-up-escolha="${id}" ${off ? 'aria-disabled="true"' : ''}>` +
        `<div class="rz-ic ${tipo ? 'rz-' + tipo : ''}"><svg data-lucide="${off ? 'lock' : icone}"></svg></div>` +
        `<div>${escapeHtml(titulo)}<small>${escapeHtml(off ? (ia.textoCurto || ia.motivo || 'Indisponível no seu plano') : sub)}</small></div></button>`;
    const html = window.rzSheetCabecalho('Enviar documento', subEnvio()) +
        `<div class="rz-sh-b"><div id="up-sh-escolha">` +
        acao('camera', 'camera', 'ia', 'Fotografar e ler com IA', 'A IA preenche tudo; você só confere', !ia.ok) +
        acao('arquivo', 'file-text', 'ia', 'Escolher arquivo e ler com IA', 'PDF ou foto da galeria', !ia.ok) +
        acao('guardar', 'folder-open', '', 'Só guardar o arquivo', 'Sem leitura: Word, Excel ou o que não precisa ler', false) +
        `<p class="rz-desc" style="margin:8px 0 0">Até 25 MB por arquivo.</p></div>` +
        `<div id="up-sh-status" aria-live="polite"></div><div id="up-progresso" aria-live="polite"></div></div>`;
    const sheet = window.abrirSheet(html, { aoFechar: aoFecharSheetEnvio });
    if (!sheet) return;
    sheet.classList.add('up-sheet');
    sheet.querySelectorAll('[data-up-escolha]').forEach(b => b.addEventListener('click', () => {
        if (!up || leitura) return;
        const id = b.dataset.upEscolha;
        if (b.classList.contains('rz-off')) { if (typeof window.rzMostrarBloqueio === 'function') window.rzMostrarBloqueio('cofre.analisar_ia'); return; }
        up.comIA = id !== 'guardar';
        up.origemInput = id === 'camera' ? 'up-camera' : 'up-arquivo';
        const st = statusUpload(); if (st) st.textContent = '';
        document.getElementById(up.origemInput).value = '';
        document.getElementById(up.origemInput).click();
    }));
    sheet.querySelector('#up-progresso')?.addEventListener('click', aoTocarResultadoLeitura);
    refrescarIcones();
}
// Fechou o sheet de envio sem mandar nada (X, toque fora, arraste): volta para a configuração.
function aoFecharSheetEnvio() {
    if (!up || up._indoConfira) return;
    if (up.config && !up.storagePath) { const cfg = up.config; up = null; avisarConfig(cfg, { cancelado: true }); }
}

// v2.2.0 — foto reprovada no quality gate: mostra o que corrigir, sem gastar IA.
function mostrarBloqueioQualidade(q) {
    const el = statusUpload();
    el.style.color = 'var(--danger)';
    el.innerHTML = q.bloqueios.map(b => `⚠️ ${escapeHtml(b.mensagem)}`).join('<br>') +
        `<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">` +
        `<button type="button" data-action="up-tentar-outra-foto" style="flex:1;background:var(--pine);color:#fff;border:none;border-radius:8px;padding:10px 14px;font-size:12px;font-weight:700">${up.origemInput === 'up-arquivo' ? 'Escolher outro arquivo' : 'Tirar outra foto'}</button>` +
        `<button type="button" data-action="up-enviar-assim-mesmo" style="flex:1;background:#f1f5f9;color:#475569;border:none;border-radius:8px;padding:10px 14px;font-size:12px;font-weight:700">Enviar assim mesmo</button>` +
        `</div>`;
    up.arquivo = null;
    ['up-arquivo', 'up-camera'].forEach(id => { const i = document.getElementById(id); if (i) i.value = ''; });
    up.bloqueadoPorQualidade = q;
}

// v2.7.0 (A.24) — pedido de senha do PDF, no próprio sheet de upload.
function mostrarPedidoSenhaPdf(erro = false) {
    const el = statusUpload();
    el.style.color = erro ? 'var(--danger)' : 'var(--sage)';
    el.innerHTML = `${erro ? '⚠️ Senha incorreta — tente de novo.' : '🔒 Este PDF está protegido por senha. Informe a senha pra IA conseguir ler.'}<br>
        <span style="font-size:11px;color:var(--sage)">A senha é usada só aqui no seu celular e não fica guardada. O arquivo original, ainda protegido, é o que vai pro Cofre.</span>
        <div style="display:flex;gap:8px;margin-top:8px;flex-wrap:wrap">
            <input type="password" id="up-pdf-senha" inputmode="numeric" autocomplete="off" placeholder="Senha do PDF" style="flex:1;min-width:140px;border:2px solid #cbd5e1;border-radius:8px;padding:8px 10px;font-size:14px">
            <button type="button" data-action="up-pdf-destravar" style="background:var(--pine);color:#fff;border:none;border-radius:8px;padding:8px 14px;font-size:12px;font-weight:700">Destravar e ler</button>
        </div>
        <button type="button" data-action="up-pdf-sem-leitura" style="margin-top:8px;background:#f1f5f9;color:#475569;border:none;border-radius:8px;padding:8px 14px;font-size:12px;font-weight:700">Enviar sem ler (só guardar)</button>`;
    setTimeout(() => document.getElementById('up-pdf-senha')?.focus(), 50);
}

export async function destravarPdfUpload() {
    const senha = document.getElementById('up-pdf-senha')?.value ?? '';
    if (!senha) { mostrarPedidoSenhaPdf(); return; }
    const el = statusUpload();
    el.style.color = 'var(--sage)'; el.textContent = 'Abrindo o PDF…';
    try {
        const r = await destravarPdf(up.arquivo, senha);
        if (!r?.blob) throw new Error('não consegui gerar a cópia de leitura');
        up.pdfDestravado = r.blob;
        await processarArquivoUpload();
    } catch (err) {
        if (String(err?.message) === 'senha_incorreta') { mostrarPedidoSenhaPdf(true); return; }
        el.style.color = 'var(--danger)'; el.textContent = '❌ ' + err.message;
    }
}

export async function enviarPdfSemLeituraUpload() {
    up.pdfSemLeitura = true; up.comIA = false;
    await processarArquivoUpload();
}

export function tentarOutraFotoUpload() {
    statusUpload().textContent = '';
    up.bloqueadoPorQualidade = null;
    // v2.6.0 — reabre a MESMA origem (câmera ou seletor de arquivos).
    if (up.origemInput === 'up-arquivo') escolherArquivoUpload(); else escolherCameraUpload();
}

// Escape do gate: o cliente decide. Fica registrado na auditoria.
export async function enviarAssimMesmoUpload() {
    const q = up?.bloqueadoPorQualidade; if (!q) return;
    const inputCam = document.getElementById('up-camera'), inputArq = document.getElementById('up-arquivo');
    const f = q.arquivo || up.arquivoBloqueado; if (!f) { mostrarToast('Escolha a foto de novo.', 'aviso'); return; }
    up.arquivo = f; up.qualidadeIgnorada = true; up.bloqueadoPorQualidade = null;
    statusUpload().textContent = '';
    await processarArquivoUpload();
}

export function fecharUpload() {
    if (leitura) return; // v2.27.0 — travado até o resultado (botões da própria tela)
    if (up?.modoSheet) { window.fecharSheet(); return; } // v2.28.0 — aoFecharSheetEnvio avisa a configuração
    fecharModal('modal-upload');
    // v2.26.0 (D2) — fechou o picker sem mandar nada: volta para a tela da configuração.
    if (up?.config && !up.storagePath) { const cfg = up.config; up = null; avisarConfig(cfg, { cancelado: true }); }
}
export function escolherArquivoUpload() { document.getElementById('up-arquivo').click(); }
export function escolherCameraUpload() { document.getElementById('up-camera').click(); }

export async function aoSelecionarArquivoUpload(inputId = 'up-arquivo') {
    const f = document.getElementById(inputId).files[0];
    if (!f || !up) return;
    up.origemInput = inputId; // v2.6.0 — pra "outra foto"/"outro arquivo" reabrir a origem certa
    up.pdfDestravado = null; up.pdfSemLeitura = false; // v2.7.0 — arquivo novo, estado de senha zerado
    const statusEl = statusUpload();
    if (f.size > LIMITE_ARQUIVO) { statusEl.textContent = '⚠️ Arquivo maior que 25MB.'; statusEl.style.color = 'var(--danger)'; document.getElementById(inputId).value = ''; return; }
    up.arquivo = f;
    up.comIA = up.modoSheet ? (up.comIA && podeIA()) : (document.getElementById('up-com-ia').checked && podeIA()); // v2.28.0
    await processarArquivoUpload();
}

// ---------------------------------------------------------------------------
// v2.27.0 (demanda 9ddb9f34) — LEITURA COM TELA TRAVADA E RESULTADO NA TELA.
// Do arquivo escolhido até o cliente decidir o que fazer com o resultado, o
// sheet de envio fica travado: sem ✕, o fundo não fecha e o voltar do celular
// não o esconde (os dois sheets do envio passam a viver no <body>, fora da aba
// Ativos, então trocar de aba por baixo não os some). Quatro passos visíveis
// com o tempo correndo; a tela não apaga (Wake Lock, quando o aparelho tem).
// O fim sempre aparece na tela, nunca em toast: Pronto (vai para o Confira),
// Não deu para ler (motivo + saídas) ou Interrompida (lê de novo sem enviar o
// arquivo outra vez). Passou de 90 s sem resposta vira Interrompida; se a
// resposta chegar depois, a tela vira Pronto sozinha. DS §9: o fundo não
// fecha por razão de negócio — fechar no meio deixava o arquivo solto no
// Storage e a leitura (já cobrada) perdida.
// ---------------------------------------------------------------------------
const PASSOS_LEITURA = ['Conferindo o arquivo', 'Enviando para o Cofre', 'Lendo com IA', 'Preparando a conferência'];
const LIMITE_LEITURA_MS = 90000;
const TEMPO_TIPICO_S = 40;
let leitura = null; // { token, inicio, inicioIa, passo, comIA, relogio, wake, saiuDaTela, estado }

// v2.28.0 — no app o envio é Sheet (precisa do sheet travado do index 1.312.0); no avulso, modal.
function modoSheet() { return typeof window.abrirSheet === 'function' && typeof window.rzSheetTravar === 'function' && typeof window.rzSheetCabecalho === 'function'; }
function caixaUpload() { return up?.modoSheet ? document.getElementById('rz-sheet') : document.querySelector('#modal-upload .modal-box'); }
function statusUpload() { return document.getElementById(up?.modoSheet ? 'up-sh-status' : 'up-status'); }
function bloquearSaida(ev) { ev.preventDefault(); ev.returnValue = ''; return ''; }

// v2.28.0 (U2) — leitura em andamento anotada no aparelho (chave apagada no Sair: prefixo raiz_d_).
function chaveLeituraPendente() { return (estado.clienteId && estado.pessoa?.id) ? `raiz_d_${estado.clienteId}_${estado.pessoa.id}_leitura_pendente` : null; }
function anotarLeituraPendente() {
    const k = chaveLeituraPendente(); if (!k || !up?.documentoId || !up.storagePath || !up.arquivo) return;
    const ctx = up.contexto ? { entidadeTipo: up.contexto.entidadeTipo, entidadeId: up.contexto.entidadeId, nome: up.contexto.nome || null, tipoAtivo: up.contexto.tipoAtivo || null } : null;
    try {
        localStorage.setItem(k, JSON.stringify({
            v: 1, documentoId: up.documentoId, storagePath: up.storagePath, nome: up.arquivo.name, mime: api.mimeDoArquivo(up.arquivo),
            contexto: ctx, configTipo: up.config?.tipo || null, criado_em: Date.now(),
        }));
    } catch (e) { /* aparelho sem espaço: segue sem a anotação */ }
}
function esquecerLeituraPendente() {
    const k = chaveLeituraPendente();
    if (k) { try { localStorage.removeItem(k); } catch (e) { /* segue */ } }
    if (up?.documentoId && estado.clienteId) api.removerArquivoDocumento(`${estado.clienteId}/tmp-ia/${up.documentoId}.leitura.json`).catch(() => {});
}

const CSS_LEITURA = `
#modal-upload .modal-box.up-lendo > :not(.up-cab):not(#up-progresso){display:none}
#modal-upload .modal-box.up-lendo [data-action="fechar-upload"]{visibility:hidden}
#up-progresso{display:none}
.up-lendo #up-progresso{display:block}
.up-sheet.up-lendo #up-sh-escolha,.up-sheet.up-lendo #up-sh-status{display:none}
.up-sheet.up-lendo .rz-x,.up-sheet.up-lendo .rz-grab{visibility:hidden}
#up-sh-status{margin-top:10px}
#up-sh-status:empty{display:none}
#up-progresso .up-arq{display:flex;gap:10px;align-items:center;background:var(--tile,#e9ece5);border-radius:10px;padding:9px 11px;font-size:13px;margin:4px 0 14px;overflow-wrap:anywhere}
#up-progresso .up-arq small{display:block;color:var(--muted,#6f7a76)}
#up-progresso .up-passos{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px}
#up-progresso .up-passo{display:flex;gap:10px;align-items:center;font-size:14px;color:var(--muted,#6f7a76)}
#up-progresso .up-bola{width:22px;height:22px;border-radius:50%;border:2px solid var(--line,#e6e3da);flex:none;display:grid;place-items:center;font-size:12px}
#up-progresso .up-passo.feito{color:var(--ink,#17211e)}
#up-progresso .up-passo.feito .up-bola{background:var(--pine);border-color:var(--pine);color:#fff}
#up-progresso .up-passo.agora{color:var(--ink,#17211e);font-weight:600}
#up-progresso .up-passo.agora .up-bola{border-color:var(--brass,#c68a3b);border-top-color:transparent;animation:upGira .9s linear infinite}
#up-progresso .up-passo.ia.agora{color:var(--brass-deep,#a86f27)}
@keyframes upGira{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){#up-progresso .up-passo.agora .up-bola{animation:none;border-top-color:var(--brass,#c68a3b)}}
#up-progresso .up-barra{height:6px;background:var(--tile,#e9ece5);border-radius:3px;margin:16px 0 8px;overflow:hidden}
#up-progresso .up-barra i{display:block;height:100%;width:0;background:var(--brass,#c68a3b);transition:width .6s}
#up-progresso .up-tempo{font-size:12.5px;color:var(--muted,#6f7a76)}
#up-progresso .up-aviso{margin-top:14px;background:var(--brass-bg,#fbf1e2);border-radius:10px;padding:10px 12px;font-size:12.5px;color:var(--brass-deep,#a86f27)}
#up-progresso .up-trava{font-size:11.5px;color:var(--muted,#6f7a76);text-align:center;margin-top:10px}
#up-progresso .up-res{display:flex;gap:12px;align-items:flex-start;border-radius:12px;padding:12px;margin-bottom:12px;background:var(--tile,#e9ece5)}
#up-progresso .up-res.ok{background:#e6f0ea}
#up-progresso .up-res.falha{background:var(--warning-bg,#f3e7e9)}
#up-progresso .up-res-ic{width:34px;height:34px;border-radius:50%;flex:none;display:grid;place-items:center;font-weight:700;color:#fff;background:var(--pine)}
#up-progresso .up-res.ok .up-res-ic{background:#2f6b4f}
#up-progresso .up-res.falha .up-res-ic{background:var(--warning,#7d4b54)}
#up-progresso .up-res b{display:block;font-size:14.5px}
#up-progresso .up-res span{display:block;font-size:13px;color:var(--muted,#6f7a76)}
#up-progresso .up-resumo{border:1px solid var(--line,#e6e3da);border-radius:10px;padding:10px 12px;font-size:13px;margin-bottom:12px}
#up-progresso .up-acoes{display:flex;flex-direction:column;gap:8px}
#up-progresso .up-acoes .rz-btn{width:100%}
`;

// Os dois sheets do envio passam a viver no <body> (fora da aba Ativos) e
// ganham a guarda do fundo. Idempotente.
function garantirModaisUpload() {
    ['modal-upload', 'modal-confirmar-upload'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        if (el.parentElement !== document.body) document.body.appendChild(el);
        if (el.dataset.rzGuarda) return;
        el.dataset.rzGuarda = '1';
        el.addEventListener('click', (ev) => {
            if (ev.target !== el) return;
            // o delegador geral (cofre-app.js) esconderia o sheet no clique do fundo
            ev.stopPropagation();
            if (id === 'modal-upload' && !leitura) fecharUpload();
            // Confira: só Salvar ou Cancelar (o fundo deixava o arquivo solto no Storage)
        });
    });
    if (!document.getElementById('rz-up-estilo')) {
        const s = document.createElement('style'); s.id = 'rz-up-estilo'; s.textContent = CSS_LEITURA; document.head.appendChild(s);
    }
    const box = document.querySelector('#modal-upload .modal-box');
    if (!modoSheet() && box && !box.querySelector('#up-progresso')) {
        box.firstElementChild?.classList.add('up-cab');
        const d = document.createElement('div');
        d.id = 'up-progresso'; d.setAttribute('aria-live', 'polite');
        box.appendChild(d);
        d.addEventListener('click', aoTocarResultadoLeitura);
    }
    if (!garantirModaisUpload._vis) {
        garantirModaisUpload._vis = true;
        document.addEventListener('visibilitychange', () => {
            if (!leitura || leitura.estado !== 'lendo') return;
            if (document.visibilityState === 'hidden') leitura.saiuDaTela = true;
            else pedirTelaAcesa();
        });
    }
}

async function pedirTelaAcesa() {
    if (!leitura || !('wakeLock' in navigator)) return;
    try { leitura.wake = await navigator.wakeLock.request('screen'); } catch (e) { /* sem suporte ou negado: segue */ }
}
function soltarTelaAcesa() {
    try { leitura?.wake?.release?.(); } catch (e) { /* segue */ }
    if (leitura) leitura.wake = null;
}

function tituloEnvio(txt) {
    const h = caixaUpload()?.querySelector('.up-cab h3, .rz-sh-h h3');
    if (h) { if (!h.dataset.original) h.dataset.original = h.textContent; h.textContent = txt || h.dataset.original; }
}

function iniciarLeitura(comIA) {
    garantirModaisUpload();
    pararRelogioLeitura();
    leitura = { token: Math.random().toString(36).slice(2), inicio: Date.now(), inicioIa: null, passo: 0, comIA: !!comIA, relogio: null, wake: null, saiuDaTela: false, estado: 'lendo' };
    if (up) up.processando = true;
    caixaUpload()?.classList.add('up-lendo');
    if (up?.modoSheet) window.rzSheetTravar(true); // v2.28.0
    window.addEventListener('beforeunload', bloquearSaida); // v2.28.0
    tituloEnvio(comIA ? 'Lendo o documento' : 'Enviando o documento');
    const st = statusUpload(); if (st) st.textContent = '';
    pedirTelaAcesa();
    leitura.relogio = setInterval(atualizarRelogioLeitura, 1000);
    desenharProgressoLeitura();
}
function pararRelogioLeitura() { if (leitura?.relogio) { clearInterval(leitura.relogio); leitura.relogio = null; } }

// Fim da trava: o sheet volta ao normal (escolher arquivo).
function encerrarLeitura() {
    pararRelogioLeitura(); soltarTelaAcesa();
    leitura = null;
    if (up) up.processando = false;
    caixaUpload()?.classList.remove('up-lendo');
    if (up?.modoSheet) window.rzSheetTravar(false); // v2.28.0
    window.removeEventListener('beforeunload', bloquearSaida);
    tituloEnvio(null);
    const p = document.getElementById('up-progresso'); if (p) p.innerHTML = '';
}

function passoLeitura(i) {
    if (!leitura) return;
    leitura.passo = i;
    if (i === 2 && !leitura.inicioIa) leitura.inicioIa = Date.now();
    desenharProgressoLeitura();
}

function cartaoArquivoLeitura() {
    const f = up?.arquivo;
    if (!f) return '';
    return `<div class="up-arq"><i data-lucide="file-text" style="width:22px;height:22px;flex:none;color:var(--pine)"></i><div><b>${escapeHtml(f.name)}</b><small>${formatarBytes(f.size)}</small></div></div>`;
}

function desenharProgressoLeitura() {
    const el = document.getElementById('up-progresso');
    if (!el || !leitura || leitura.estado !== 'lendo') return;
    const passos = leitura.comIA ? PASSOS_LEITURA : [PASSOS_LEITURA[0], PASSOS_LEITURA[1], PASSOS_LEITURA[3]];
    const atual = leitura.comIA ? leitura.passo : (leitura.passo >= 3 ? 2 : Math.min(leitura.passo, 1));
    el.setAttribute('aria-busy', 'true');
    el.innerHTML = `${cartaoArquivoLeitura()}
        <ol class="up-passos">${passos.map((p, k) => `<li class="up-passo ${k < atual ? 'feito' : (k === atual ? 'agora' : '')} ${p === PASSOS_LEITURA[2] ? 'ia' : ''}"><span class="up-bola">${k < atual ? '✓' : ''}</span>${p}</li>`).join('')}</ol>
        <div class="up-barra"><i id="up-barra"></i></div>
        <div class="up-tempo" id="up-tempo"></div>
        <div class="up-aviso">Mantenha o app aberto até terminar.</div>
        <div class="up-trava">Esta tela fecha sozinha quando terminar</div>`;
    refrescarIcones();
    atualizarRelogioLeitura();
}

function atualizarRelogioLeitura() {
    if (!leitura || leitura.estado !== 'lendo') return;
    const s = Math.round((Date.now() - leitura.inicio) / 1000);
    const t = document.getElementById('up-tempo');
    if (t) t.textContent = leitura.comIA ? `${s} s · costuma levar até ${TEMPO_TIPICO_S} s` : `${s} s`;
    const b = document.getElementById('up-barra');
    if (b) {
        let pct = [8, 25, 25, 95][leitura.passo] ?? 95;
        if (leitura.passo === 2 && leitura.inicioIa) pct = 25 + Math.min(65, ((Date.now() - leitura.inicioIa) / 1000) / TEMPO_TIPICO_S * 65);
        b.style.width = pct + '%';
    }
}

function rotuloConfiancaLeitura() {
    const m = up?.motor, r = up?.ia;
    if (m && typeof m.confianca === 'number') return m.confianca >= LIMIAR_CONFIRA ? 'Leitura segura' : (m.confianca >= 0.55 ? 'Confira com atenção' : 'Leitura incerta, confira com atenção');
    if (r?.confianca === 'baixa') return 'Leitura incerta, confira com atenção';
    return 'Confira antes de salvar';
}

// Resultado na tela. estado: 'pronto' | 'falha' | 'interrompida' | 'erro_envio'
function mostrarResultadoLeitura(estadoRes, info = {}) {
    if (!leitura) iniciarLeitura(!!up?.comIA);
    pararRelogioLeitura(); soltarTelaAcesa();
    leitura.estado = estadoRes;
    window.removeEventListener('beforeunload', bloquearSaida); // v2.28.0 — o resultado já está na tela
    const el = document.getElementById('up-progresso');
    if (!el) return;
    el.setAttribute('aria-busy', 'false');
    const seg = Math.max(1, Math.round((Date.now() - leitura.inicio) / 1000));
    const outra = up?.origemInput === 'up-arquivo' ? 'Escolher outro arquivo' : 'Tirar outra foto';
    const fora = leitura.saiuDaTela ? ' · terminou enquanto o app estava fora' : '';
    const aviso = info.avisoLimite ? `<p class="rz-desc" style="margin:0 0 10px">${escapeHtml(info.avisoLimite)}</p>` : '';
    let html = '';
    // v2.29.0 — leitura sem tipo reconhecido não é "Pronto"
    const semTipo = estadoRes === 'pronto' && (up?.motor ? (!up.motor.subtipo_codigo || up.motor.subtipo_codigo === 'outro') : !up?.ia?.tipoDocumentoDetectado);
    if (semTipo) {
        tituloEnvio('Leitura concluída');
        html = `<div class="up-res falha"><div class="up-res-ic">?</div><div><b>Não reconheci o tipo deste documento</b><span>Na próxima tela você escolhe o tipo, confere os dados e salva. Se preferir, toque em Reler lá depois de escolher o tipo.</span></div></div>
            ${cartaoArquivoLeitura()}${aviso}
            <div class="up-acoes">
                <button type="button" class="rz-btn rz-btn-1" data-up="conferir">Conferir e classificar</button>
                <button type="button" class="rz-btn rz-btn-2" data-up="outra">${outra}</button>
                ${up?.config ? '<button type="button" class="rz-btn rz-btn-2" data-up="equipe">Pedir para a equipe Raiz</button>' : ''}
                <button type="button" class="rz-btn rz-btn-3" data-up="cancelar">Cancelar o envio</button>
            </div>`;
    } else if (estadoRes === 'pronto') {
        const tipo = up?.motor?.subtipo_nome || up?.ia?.tipoDocumentoDetectado || 'documento';
        tituloEnvio('Leitura concluída');
        html = `<div class="up-res ok"><div class="up-res-ic">✓</div><div><b>Pronto. Lido como ${escapeHtml(tipo)}</b><span>${rotuloConfiancaLeitura()} · ${seg} s${fora}</span></div></div>
            ${up?.ia?.resumo ? `<div class="up-resumo">${escapeHtml(up.ia.resumo)}</div>` : cartaoArquivoLeitura()}
            ${aviso}
            <div class="up-acoes"><button type="button" class="rz-btn rz-btn-1" data-up="conferir">Conferir e salvar</button></div>
            <div class="up-trava">Na próxima tela você confere os dados lidos, ajusta o tipo se precisar e salva. Nada é gravado antes disso.</div>`;
    } else if (estadoRes === 'falha' && info.falhaIA) {
        tituloEnvio('Leitura indisponível');
        html = `<div class="up-res falha"><div class="up-res-ic">!</div><div><b>A leitura com IA está fora do ar agora</b><span>O arquivo já foi enviado. Tente ler de novo em alguns minutos ou preencha você mesmo. Esta tentativa não conta no seu limite.</span></div></div>
            ${cartaoArquivoLeitura()}
            <div class="up-acoes">
                <button type="button" class="rz-btn rz-btn-1" data-up="ler-de-novo">Ler de novo</button>
                <button type="button" class="rz-btn rz-btn-2" data-up="preencher">Preencher eu mesmo</button>
                <button type="button" class="rz-btn rz-btn-3" data-up="cancelar">Cancelar o envio</button>
            </div>`;
    } else if (estadoRes === 'falha') {
        tituloEnvio('Leitura concluída');
        html = `<div class="up-res falha"><div class="up-res-ic">!</div><div><b>Não deu para ler este documento</b><span>${escapeHtml(info.motivo || 'A IA não reconheceu o documento.')} O arquivo já foi enviado: nada se perde.</span></div></div>
            ${cartaoArquivoLeitura()}${aviso}
            <div class="up-acoes">
                <button type="button" class="rz-btn rz-btn-1" data-up="preencher">Preencher eu mesmo</button>
                <button type="button" class="rz-btn rz-btn-2" data-up="outra">${outra}</button>
                ${up?.config ? '<button type="button" class="rz-btn rz-btn-2" data-up="equipe">Pedir para a equipe Raiz</button>' : ''}
                <button type="button" class="rz-btn rz-btn-3" data-up="cancelar">Cancelar o envio</button>
            </div>`;
    } else if (estadoRes === 'interrompida') {
        tituloEnvio('Leitura interrompida');
        html = `<div class="up-res"><div class="up-res-ic">↻</div><div><b>A leitura foi interrompida</b><span>${info.porTempo ? 'A IA demorou mais de 90 s para responder.' : 'A conexão caiu, por exemplo quando o app sai da tela.'} O arquivo já foi enviado: é só ler de novo.</span></div></div>
            ${cartaoArquivoLeitura()}
            <div class="up-acoes">
                <button type="button" class="rz-btn rz-btn-1" data-up="ler-de-novo">Ler de novo</button>
                <button type="button" class="rz-btn rz-btn-2" data-up="preencher">Preencher eu mesmo</button>
                <button type="button" class="rz-btn rz-btn-3" data-up="cancelar">Cancelar o envio</button>
            </div>`;
    } else { // erro_envio
        tituloEnvio('Envio não concluído');
        html = `<div class="up-res falha"><div class="up-res-ic">!</div><div><b>Não consegui enviar o arquivo</b><span>${escapeHtml(info.motivo || 'Verifique a conexão e tente de novo.')}</span></div></div>
            ${cartaoArquivoLeitura()}
            <div class="up-acoes">
                ${up?.arquivo ? '<button type="button" class="rz-btn rz-btn-1" data-up="reenviar">Tentar de novo</button>' : ''}
                <button type="button" class="rz-btn rz-btn-3" data-up="cancelar">Cancelar o envio</button>
            </div>`;
    }
    el.innerHTML = html;
    refrescarIcones();
    el.querySelector('button')?.focus?.();
}

async function aoTocarResultadoLeitura(ev) {
    const b = ev.target.closest('[data-up]');
    if (!b || !up || !leitura || leitura.estado === 'lendo') return;
    const acao = b.dataset.up;
    if (acao === 'conferir' || acao === 'preencher') { seguirParaConfira(); return; }
    if (acao === 'equipe') { seguirParaConfira(); await pedirEquipeConfiguracao(); return; }
    if (acao === 'ler-de-novo') {
        leitura.estado = 'lendo'; leitura.inicio = Date.now(); leitura.inicioIa = null; leitura.saiuDaTela = false;
        tituloEnvio('Lendo o documento'); pedirTelaAcesa();
        window.addEventListener('beforeunload', bloquearSaida); // v2.28.0
        leitura.relogio = setInterval(atualizarRelogioLeitura, 1000);
        await etapaLeituraIA();
        return;
    }
    if (acao === 'reenviar') { encerrarLeitura(); await processarArquivoUpload(); return; }
    if (acao === 'outra' || acao === 'cancelar') {
        esquecerLeituraPendente(); // v2.28.0 (U2)
        // v2.28.0 — sem await: "outra foto" abre o seletor ainda dentro do toque (o navegador exige)
        if (up.storagePath) api.removerArquivoDocumento(up.storagePath).catch(() => { /* melhor esforço */ });
        up.storagePath = null; up.documentoId = null; up.ia = null; up.motor = null; up.hash = null;
        encerrarLeitura();
        if (acao === 'outra') { up.arquivo = null; tentarOutraFotoUpload(); }
        else fecharUpload();
    }
}

// Leitura com limite de tempo. Devolve { estado, info }.
async function lerComIALimitada(caminho, mime, opcoes) {
    const tk = leitura?.token;
    const promessa = api.analisarArquivoComIA(caminho, mime, opcoes).then(resp => ({ resp }), err => ({ err }));
    let timer;
    const limite = new Promise(res => { timer = setTimeout(() => res({ limite: true }), LIMITE_LEITURA_MS); });
    const r = await Promise.race([promessa, limite]);
    clearTimeout(timer);
    if (r.limite) {
        // a resposta pode chegar depois: se o cliente ainda estiver na tela de interrompida, vira Pronto
        promessa.then(async tarde => {
            if (!leitura || leitura.token !== tk || leitura.estado !== 'interrompida' || !tarde.resp?.analisado || !tarde.resp.resultado) return;
            up.ia = tarde.resp.resultado; up.motor = tarde.resp.resultado.motor || null;
            try { await carregarApoioUpload(); } catch (e) { /* segue */ }
            mostrarResultadoLeitura('pronto', { avisoLimite: tarde.resp.avisoLimite });
        });
        return { estado: 'interrompida', info: { porTempo: true } };
    }
    if (r.err) {
        const msg = String(r.err?.message || '');
        const rede = r.err?.name === 'FunctionsFetchError' || /fetch|network|load failed|abort/i.test(msg);
        if (rede || leitura?.saiuDaTela) return { estado: 'interrompida', info: {} };
        let motivo = '';
        try { const corpo = await r.err?.context?.json?.(); motivo = corpo?.erro || corpo?.motivo || ''; } catch (e) { /* segue */ }
        return { estado: 'falha', info: { motivo: motivo || 'A IA está indisponível agora.' } };
    }
    const resp = r.resp;
    if (resp?.analisado && resp.resultado) {
        up.ia = resp.resultado; up.motor = resp.resultado.motor || null;
        return { estado: 'pronto', info: { avisoLimite: resp.avisoLimite } };
    }
    return { estado: 'falha', info: { motivo: resp?.motivo || resp?.erro || '', avisoLimite: resp?.avisoLimite, falhaIA: !!resp?.falha_ia } };
}

// Passo "Lendo com IA" (também usado pelo "Ler de novo"): prepara a cópia de
// leitura, chama a IA com limite, limpa a cópia e mostra o resultado.
async function etapaLeituraIA() {
    if (!up || !leitura) return;
    const f = up.arquivo;
    const mimeArquivo = api.mimeDoArquivo(f);
    passoLeitura(2);
    up.ia = null; up.motor = null; up.leituraFalhou = false;
    let caminhoLeitura = up.storagePath, mimeLeitura = mimeArquivo;
    try {
        if (up.pdfDestravado) {
            const tmp = `${estado.clienteId}/tmp-ia/${up.documentoId}.pdf`;
            await api.uploadArquivoDocumento(tmp, up.pdfDestravado);
            up.storagePathTemp = tmp; caminhoLeitura = tmp; mimeLeitura = 'application/pdf';
        } else {
            up.tratamento = await tratarImagem(f, { orientacaoEsperada: null });
            if (up.tratamento?.blob) {
                const tmp = `${estado.clienteId}/tmp-ia/${up.documentoId}.jpg`;
                await api.uploadArquivoDocumento(tmp, up.tratamento.blob);
                up.storagePathTemp = tmp; caminhoLeitura = tmp; mimeLeitura = 'image/jpeg';
            }
        }
    } catch (err) { console.warn('pré-processamento pulado:', err.message); }
    let res;
    anotarLeituraPendente(); // v2.28.0 (U2) — se o app cair daqui em diante, dá para retomar
    try {
        res = await lerComIALimitada(caminhoLeitura, mimeLeitura, { tipoAtivo: up.tipoAtivo, ativoId: up.vinculo?.tipo === 'ativo' ? up.vinculo.id : null, leituraId: up.documentoId });
    } finally {
        if (up?.storagePathTemp) { try { await api.removerArquivoDocumento(up.storagePathTemp); } catch (e) { /* melhor esforço */ } up.storagePathTemp = null; }
    }
    if (!up || !leitura) return;
    if (res.estado !== 'pronto') up.leituraFalhou = true;
    passoLeitura(3);
    try { await carregarApoioUpload(); } catch (err) { console.warn('apoio do upload:', err.message); }
    mostrarResultadoLeitura(res.estado, res.info);
}

// v2.28.0 (U2) — retomar a leitura depois que o app foi recarregado/fechado no meio. O index
// (rzLeituraPendenteVerificar) lê a anotação, busca o resultado guardado e dispara
// cofre:retomar-leitura com { ...anotação, resposta } quando a pessoa escolhe continuar.
async function retomarLeituraPendente(p) {
    if (!p?.documentoId || !p?.storagePath || leitura) return;
    await abrirPickerUpload(p.contexto || null, true);
    if (!up) return;
    if (p.configTipo) up.config = { tipo: p.configTipo, aoTerminar: null };
    up.documentoId = p.documentoId; up.storagePath = p.storagePath; up.comIA = true; up.origemInput = 'up-arquivo';
    iniciarLeitura(true);
    tituloEnvio('Retomando a leitura');
    leitura.saiuDaTela = true;
    passoLeitura(1);
    try {
        const blob = await api.baixarArquivoDocumento(p.storagePath);
        up.arquivo = new File([blob], p.nome || 'documento', { type: p.mime || blob.type || 'application/octet-stream' });
        up.hash = await api.calcularHashSha256(up.arquivo);
    } catch (err) {
        esquecerLeituraPendente();
        up.storagePath = null; up.documentoId = null;
        mostrarResultadoLeitura('erro_envio', { motivo: 'O arquivo enviado não está mais disponível. Envie de novo.' });
        return;
    }
    const r = p.resposta;
    if (r && r.analisado && r.resultado) {
        up.ia = r.resultado; up.motor = r.resultado.motor || null;
        passoLeitura(3); try { await carregarApoioUpload(); } catch (e) { /* segue */ }
        mostrarResultadoLeitura('pronto', { avisoLimite: r.avisoLimite });
    } else if (r) {
        up.leituraFalhou = true;
        passoLeitura(3); try { await carregarApoioUpload(); } catch (e) { /* segue */ }
        mostrarResultadoLeitura('falha', { motivo: r.motivo || r.erro || '' });
    } else {
        await etapaLeituraIA();
    }
}
window.addEventListener('cofre:retomar-leitura', (ev) => { retomarLeituraPendente(ev.detail).catch(err => console.warn('retomar leitura:', err?.message)); });

// Sai do sheet de envio para o "Confira".
function seguirParaConfira() {
    if (up?.storagePathTemp) { const t = up.storagePathTemp; up.storagePathTemp = null; api.removerArquivoDocumento(t).catch(() => {}); }
    encerrarLeitura();
    if (up?.modoSheet) { up._indoConfira = true; window.fecharSheet(); if (up) up._indoConfira = false; } // v2.28.0
    fecharModal('modal-upload');
    garantirModaisUpload();
    montarConfirmacaoUpload();
    abrirModal('modal-confirmar-upload');
    refrescarIcones();
}

async function processarArquivoUpload() {
    const statusEl = statusUpload();
    const f = up.arquivo;
    garantirModaisUpload();

    // v2.9.0 — sem empresa carregada, nem tenta: o caminho do Storage
    // (<clienteId>/...) sairia quebrado e a IA falharia muda lá na frente.
    if (!estado.clienteId) {
        statusEl.style.color = 'var(--danger)';
        statusEl.innerHTML = '⚠️ A empresa ainda está carregando — aguarde um instante.' +
            `<br><button type="button" data-action="up-tentar-outra-foto" style="margin-top:8px;background:var(--pine);color:#fff;border:none;border-radius:8px;padding:8px 14px;font-size:12px;font-weight:700">Tentar de novo</button>`;
        up.arquivo = null;
        return;
    }

    // v2.7.0 (A.24) — PDF com senha: pede a senha antes de subir; a leitura
    // usa uma cópia destravada gerada no celular. Sem senha, o cliente pode
    // subir o original sem leitura.
    if (up.comIA && /pdf/i.test(api.mimeDoArquivo(f)) && !up.pdfDestravado && !up.pdfSemLeitura) {
        statusEl.style.color = 'var(--sage)';
        statusEl.textContent = 'Conferindo o PDF…';
        if (await detectarPdfProtegido(f)) { mostrarPedidoSenhaPdf(); return; }
    }

    // v2.2.0 — QUALITY GATE: antes do upload e antes da IA. Foto ruim volta
    // na hora, com instrução do que corrigir; nada é enviado nem cobrado.
    statusEl.style.color = 'var(--sage)';
    statusEl.textContent = 'Conferindo a foto…';
    up.qualidade = await avaliarFoto(f, { orientacaoEsperada: null });
    if (up.qualidade?.aplicavel && !up.qualidade.ok && !up.qualidadeIgnorada) {
        up.arquivoBloqueado = f;
        mostrarBloqueioQualidade({ ...up.qualidade, arquivo: f });
        return;
    }

    up.hash = await api.calcularHashSha256(f);
    if (up.hash && estado.documentos.some(d => d.hash_sha256 === up.hash)) {
        const existente = estado.documentos.find(d => d.hash_sha256 === up.hash);
        if (!await perguntar({ titulo: 'Arquivo repetido?', impacto: `Este arquivo parece idêntico a "${existente.nome_exibicao}", que já está no Cofre. Enviar mesmo assim?`, rotuloConfirmar: 'Enviar mesmo assim', rotuloCancelar: 'Não enviar' })) { statusEl.textContent = ''; return; }
    }

    // v2.27.0 — daqui em diante a tela fica travada até o resultado.
    const mimeArquivo = api.mimeDoArquivo(f); // v2.6.0 — PDF de outro app pode vir com type vazio
    const vaiLer = up.comIA && MIMES_IA.includes(mimeArquivo);
    iniciarLeitura(vaiLer);
    passoLeitura(1);
    up.documentoId = crypto.randomUUID();
    up.storagePath = api.montarStoragePath(estado.clienteId, up.documentoId, f.name);
    try {
        await api.uploadArquivoDocumento(up.storagePath, f);
    } catch (err) {
        up.storagePath = null; up.documentoId = null; up.bloqueadoPorQualidade = null;
        mostrarResultadoLeitura('erro_envio', { motivo: 'Não consegui enviar o arquivo: ' + err.message });
        return;
    }

    if (vaiLer) { await etapaLeituraIA(); return; }

    // sem IA (Word/Excel, ou "Ler com IA" desmarcado): direto para o Confira, como antes
    passoLeitura(3);
    try { await carregarApoioUpload(); } catch (err) { console.warn('apoio do upload:', err.message); }
    if (up.comIA) mostrarToast('Word/Excel não passam pela IA — preencha os dados.', 'aviso');
    seguirParaConfira();
}

async function carregarApoioUpload() {
    if (!estado.categorias?.length) estado.categorias = await api.listarCategorias(estado.clienteId);
    if (!gabaritoCategorias) gabaritoCategorias = await api.listarCategoriasGabarito();
    if (!subtiposControle) subtiposControle = await api.listarCatalogoSubtipos(); // v2.1.0 — global
    if (!aplicabilidadeSubtipos) aplicabilidadeSubtipos = await api.listarAplicabilidadeSubtipos(); // v2.16.0 — global
}

// v2.16.0 — s "serve" pro tipoAtivo quando existe vínculo ATIVO em
// cofre_subtipo_aplicabilidade (subtipo × categoria macro do ativo) — a
// mesma fonte que a aba Aplicabilidade do Gestão edita. Sem tipoAtivo (nada
// vinculado ainda), não filtra nada. Escopo por tipo de ativo específico
// (escopo_tipo='codigo', ex.: "carro blindado") não é resolvido aqui — são
// raros (nota já em catalogo-patrimonio.js) e exigiriam também o
// tipo_detalhe_id do ativo, que este fluxo de upload não carrega; ficam de
// fora do grupo "Deste tipo de ativo" (caem em "Outros"), nunca somem do
// catálogo. Subtipo sem NENHUM vínculo ativo (ainda não configurado na aba
// Aplicabilidade) também cai em "Outros" — antes, sem vínculo no campo
// antigo era tratado como "serve pra tudo", que era exatamente a causa da
// lista grande e sem filtro real (achado, relato Nicola 18/09/2026).
function subtipoAplicaAoTipoAtivo(s, tipoAtivo) {
    if (!tipoAtivo) return true;
    return (aplicabilidadeSubtipos || []).some(a => a.subtipo_id === s.id && a.escopo_tipo === 'categoria' && a.escopo_valor === tipoAtivo);
}

// Padrão efetivo da categoria: gabarito global (por codigo) → linha do
// cliente → sistema (guarda = sim, vigência = não). Mesma regra de
// fn_cofre_categoria_padroes() no banco, resolvida aqui pra não fazer RPC a
// cada troca de select.
function padroesDaCategoria(categoriaId) {
    const c = (estado.categorias || []).find(x => x.id === categoriaId);
    const g = c?.codigo ? (gabaritoCategorias || []).find(x => x.codigo === c.codigo) : null;
    return {
        manterArquivo: g?.manter_arquivo_padrao ?? c?.manter_arquivo_padrao ?? true,
        controleTipo: g?.controle_tipo_padrao ?? c?.controle_tipo_padrao ?? null,
        controleSubtipoId: g?.controle_subtipo_padrao_id ?? c?.controle_subtipo_padrao_id ?? null,
    };
}

// v2.2.0 — o documento pode CRIAR o ativo. Tipo e campos vêm do catálogo +
// do que a IA leu; a criação usa o mesmo caminho da tela de Ativos.
const TIPO_ATIVO_SUGERIDO = {
    cnh: 'vida_protecao', cin_rg: 'vida_protecao', passaporte: 'vida_protecao', visto: 'vida_protecao',
    carteira_profissional: 'vida_protecao', carteira_maritimo: 'vida_protecao', carteira_aeronautica: 'vida_protecao',
    seguro_vida: 'vida_protecao', seguro_viagem: 'vida_protecao',
    crlv: 'veiculo', ipva_global: 'veiculo', licenciamento_veicular: 'veiculo', atpv_e: 'veiculo',
    multa_transito: 'veiculo', seguro_veiculo: 'veiculo', financiamento_veiculo: 'veiculo', registro_blindagem: 'veiculo_blindado',
    iptu_global: 'imovel', condominio: 'imovel', seguro_incendio: 'imovel', avcb_clcb: 'imovel',
    contrato_locacao: 'imovel', itr: 'terreno', ccir_regularidade_cadastral: 'terreno', outorga_agua: 'terreno', licenca_ambiental_rural: 'terreno',
    vacinacao_pet: 'animal', vermifugo_antiparasitario_pet: 'animal', consulta_checkup_pet: 'animal', seguro_plano_pet: 'animal',
};

function tipoAtivoDoDocumento() {
    const s = subtipoSelecionado();
    if (!s) return null;
    if (up?.tipoAtivo) return up.tipoAtivo;
    if (s.tipo_ativo_aplicavel?.length === 1) return s.tipo_ativo_aplicavel[0];
    return TIPO_ATIVO_SUGERIDO[s.codigo] || (s.tipo_ativo_aplicavel?.[0] ?? null);
}

// Nome do ativo a partir do que foi lido (nunca do nome do arquivo).
function nomeAtivoSugerido(tipo, dados) {
    if (tipo === 'vida_protecao') return dados.titular || dados.nome || null;
    if (tipo === 'veiculo' || tipo === 'veiculo_blindado') {
        const base = dados.marca_modelo || [dados.marca, dados.modelo].filter(Boolean).join(' ') || 'Veículo';
        return dados.placa ? `${base} — ${dados.placa}` : base;
    }
    if (tipo === 'imovel' || tipo === 'terreno') return dados.imovel_endereco || dados.endereco || dados.inscricao_imobiliaria || null;
    if (tipo === 'animal') return dados.nome_animal || dados.nome || null;
    return dados.titular || dados.proprietario || null;
}

// dados_especificos no formato que cofre-ativos espera (CAMPOS_POR_TIPO_ATIVO).
function dadosEspecificosDoDocumento(tipo, dados) {
    const d = {};
    if (tipo === 'veiculo' || tipo === 'veiculo_blindado') {
        if (dados.placa) d.placa = dados.placa;
        if (dados.chassi) d.chassi = dados.chassi;
        if (dados.renavam) d.renavam = dados.renavam;
        if (dados.ano_fabricacao || dados.ano_modelo) d.ano = String(dados.ano_modelo || dados.ano_fabricacao);
        if (dados.cor) d.cor = dados.cor;
        const mm = String(dados.marca_modelo || '').split(/[\/ ]/).filter(Boolean);
        if (mm.length) { d.marca = mm[0]; if (mm.length > 1) d.modelo = mm.slice(1).join(' '); }
    }
    return d;
}

export function abrirCriarAtivoDoDocumento() {
    const g = id => document.getElementById(id);
    const tipo = tipoAtivoDoDocumento();
    if (!tipo) { mostrarToast('Escolha o tipo de documento primeiro.', 'aviso'); return; }
    const dados = lerDadosEstruturados();
    // v2.4.0 — sem nenhum campo lido, o ativo nasceria vazio e sem nome útil
    // (foi o que aconteceu no teste: um ativo chamado "Veículo", sem placa).
    if (!Object.values(dados).some(v => v !== null && v !== '')) {
        mostrarToast('Preencha ao menos um dado do documento antes de criar o ativo.', 'aviso');
        return;
    }
    const nome = nomeAtivoSugerido(tipo, dados) || g('uc-nome').value || '';
    up.novoAtivo = { tipo, nome, dados_especificos: dadosEspecificosDoDocumento(tipo, dados) };
    g('uc-novo-ativo-tipo').textContent = rotuloTipoAtivo ? rotuloTipoAtivo(tipo) : tipo;
    g('uc-novo-ativo-nome').value = nome;
    g('uc-novo-ativo-bloco').classList.remove('hidden');
    g('uc-criar-ativo-btn').classList.add('hidden');
    up.tipoAtivo = tipo;
    aplicarSubtipoUpload(false); // v2.5.0 — libera "Controlar vencimento" com o ativo novo
    renderizarAvisosUpload();
}

export function cancelarCriarAtivoDoDocumento() {
    up.novoAtivo = null;
    document.getElementById('uc-novo-ativo-bloco').classList.add('hidden');
    document.getElementById('uc-criar-ativo-btn').classList.remove('hidden');
    aplicarSubtipoUpload(false);
}

// Cria o ativo pelo mesmo caminho da tela de Ativos (100% do titular, como o
// formulário faz por padrão) e já deixa o documento vinculado a ele.
async function criarAtivoDoDocumentoSeMarcado() {
    if (!up.novoAtivo) return null;
    const nome = document.getElementById('uc-novo-ativo-nome').value.trim();
    if (!nome) throw new Error('informe o nome do ativo');
    const novo = await api.criarAtivo({
        cliente_id: estado.clienteId, tipo_ativo: up.novoAtivo.tipo, nome_exibicao: nome, status: 'ativo',
        dados_especificos: up.novoAtivo.dados_especificos || {}, criado_por: estado.pessoa.id,
    });
    try { await api.salvarPropriedadeAtivo(novo.id, [{ tipo_proprietario: 'socio_interno', pessoa_id: estado.pessoa.id, nome_externo: '', percentual: 100 }]); }
    catch (err) { console.warn('propriedade do ativo novo:', err.message); }
    up.vinculo = { tipo: 'ativo', id: novo.id, nome };
    up.tipoAtivo = up.novoAtivo.tipo;
    window.dispatchEvent(new CustomEvent('cofre:recarregar-ativos'));
    return novo;
}

function vinculoPermiteControle() {
    // v2.5.0 — ativo novo pedido na confirmação conta como vínculo: ele nasce
    // ao salvar, antes do item de controle.
    if (up?.novoAtivo) return true;
    return !!up?.vinculo && (up.vinculo.tipo === 'ativo' || up.vinculo.tipo === 'contrato');
}

function montarConfirmacaoUpload() {
    const r = up.ia; const m = up.motor;
    const g = id => document.getElementById(id);
    g('uc-titulo').innerHTML = r ? '<i data-lucide="sparkles" style="width:16px;height:16px;color:var(--warning)"></i> Confira o que a IA leu' : 'Dados do documento';
    g('uc-tipo').textContent = r ? `${m?.subtipo_nome || r.tipoDocumentoDetectado}${(m ? m.confianca < 0.55 : r.confianca === 'baixa') ? ' · leitura incerta, confira com atenção' : ''}` : `${up.arquivo.name} · ${formatarBytes(up.arquivo.size)}`;
    g('uc-resumo').classList.toggle('hidden', !r?.resumo);
    g('uc-resumo').textContent = r?.resumo || '';
    g('uc-status').textContent = '';

    // categorias: grupo › nome (gabarito global é a fonte; linhas do cliente só pra ids antigos)
    // v2.25.0 — espécies (lista única, ordem do catálogo); o caminho vem do tipo e do vínculo
    const cats = catalogoCategoriasParaSelect();
    g('uc-categoria').innerHTML = cats.map(c => `<option value="${c.id}">${escapeHtml(c.nome)}</option>`).join('');
    ligarCaminhoUpload();

    // tipo de documento (catálogo). v2.4.0 — se a extração falhou, o motor
    // devolve 'outro' mas a classificação sabe o tipo: usa o classificado.
    up.leituraFalhou = !!(m && m.subtipo_codigo === 'outro' && m.classificacao?.codigo && m.classificacao.codigo !== 'outro');
    montarSelectTipoDoc((up.leituraFalhou ? m.classificacao.codigo : m?.subtipo_codigo) || null);
    g('uc-reler').classList.toggle('hidden', !r);

    g('uc-nome').value = m?.nome_sugerido || r?.nomeSugerido || up.arquivo.name.replace(/\.[^.]+$/, '');
    g('uc-descricao').value = '';
    g('uc-data-documento').value = m ? (m.campos?.data_emissao || m.campos?.data_documento || r?.dataDocumento || '') : (r?.dataDocumento || '');
    g('uc-validade').value = m ? (m.vencimento?.data || '') : (r?.validadeEm || r?.vigenciaFim || '');
    g('uc-validade-flag').classList.toggle('hidden', !m?.vencimento?.derivada);
    g('uc-vig-inicio').value = m?.campos?.vigencia_inicio || r?.vigenciaInicio || '';
    g('uc-vig-fim').value = m?.campos?.vigencia_fim || r?.vigenciaFim || '';
    g('uc-vigencia-bloco').classList.toggle('hidden', !(g('uc-vig-inicio').value || g('uc-vig-fim').value));

    // vínculo
    g('up-vinculo-travado').classList.toggle('hidden', !up.contexto);
    g('up-vinculo-livre').classList.toggle('hidden', !!up.contexto);
    g('up-vinculo-ia').classList.add('hidden');
    g('up-vinculo-ia').innerHTML = '';
    if (up.contexto) {
        g('up-vinculo-travado').innerHTML = `<i data-lucide="link" style="width:14px;height:14px;display:inline"></i> ${escapeHtml(up.vinculo.nome)}`;
    } else {
        g('up-vinculo-tipo').value = 'triagem';
        g('up-vinculo-candidatos').innerHTML = '';
        g('up-vinculo-busca').classList.add('hidden');
        up.vinculo = null;
        const cands = r?.candidatosVinculo || [];
        if (cands.length) {
            g('up-vinculo-ia').classList.remove('hidden');
            const sug = m?.vinculo?.sugerido?.id;
            g('up-vinculo-ia').innerHTML = cands.map((c, i) => `
                <label class="flex items-center gap-2 text-sm raiz-bloco-interno"><input type="radio" name="uc-vinculo-ia" value="${i}" data-action-change="uc-vinculo-ia-mudou" ${(sug ? c.id === sug : i === 0) ? 'checked' : ''}> ${escapeHtml(c.nome)} <span class="text-xs" style="color:var(--sage)">(${c.tipo === 'imovel' ? 'imóvel' : 'ativo'})</span></label>`).join('') + `
                <label class="flex items-center gap-2 text-sm raiz-bloco-interno"><input type="radio" name="uc-vinculo-ia" value="outro" data-action-change="uc-vinculo-ia-mudou"> Outro — escolher abaixo</label>`;
            const escolhido = cands.find(c => c.id === sug) || cands[0];
            up.vinculo = { tipo: escolhido.tipo, id: escolhido.id, nome: escolhido.nome };
            g('up-vinculo-livre').classList.add('hidden');
        }
    }

    // contatos (motor.partes > legado)
    const contatos = (m?.partes?.length ? m.partes.map(p => ({ nome: p.nome, papel: p.papel, telefone: null, email: null, documento: p.documento })) : (r?.contatosSugeridos || [])).filter(c => c?.nome);
    up.contatosSugeridos = contatos;
    g('uc-contatos-bloco').classList.toggle('hidden', !contatos.length);
    g('uc-contatos-lista').innerHTML = contatos.map((c, i) => `
        <label class="flex items-center gap-2 text-sm raiz-bloco-interno"><input type="checkbox" class="uc-contato" value="${i}" ${c.papel && !['outro', 'titular', 'segurado', 'proprietario'].includes(c.papel) ? 'checked' : ''}> ${escapeHtml(c.nome)} <span class="text-xs" style="color:var(--sage)">${escapeHtml(c.papel || 'outro')}${c.documento ? ' · ' + escapeHtml(c.documento) : ''}</span></label>`).join('');
    // v2.8.0 — titular/segurado/proprietário é a própria pessoa da carteira, não um contato de acionamento; os demais (seguradora, corretor, administradora…) entram marcados.

    g('up-restrito').checked = false;
    g('up-restrito-wrapper').classList.toggle('hidden', !(window.podeUsar ? window.podeUsar('cofre.ver_restrito').ok : false));

    aplicarSubtipoUpload(true);
    renderizarAvisosUpload();
    atualizarOfertaCriarAtivo();
    montarBlocoConfiguracao(); // v2.26.0 (D2)
}

// v2.26.0 (D2) — contêiner único no topo do "Confira" para a configuração inicial e para a
// escolha do contrato (be7cdd7c). Criado por código: a casca do modal (ativos-markup.js) não muda.
function containerConfigUpload() {
    let el = document.getElementById('uc-config');
    if (!el) {
        const ref = document.getElementById('uc-avisos');
        if (!ref) return null;
        el = document.createElement('div');
        el.id = 'uc-config';
        ref.parentNode.insertBefore(el, ref.nextSibling);
    }
    return el;
}

function montarBlocoConfiguracao() {
    const el = containerConfigUpload();
    if (!el || !up) return;
    const partes = [];
    if (up.config) {
        partes.push(`<p class="rz-desc"><span class="rz-ia-tag"><i data-lucide="list-checks"></i> Configuração inicial · ${escapeHtml(ROTULO_TIPO_CFG[up.config.tipo] || 'documento')}</span></p>`);
        if (up.config.tipo === 'lista_ativos') {
            partes.push(`<div class="rz-card"><p class="rz-desc">A equipe Raiz cadastra os ativos desta lista e te avisa. É só salvar.</p></div>`);
        } else if (leituraFraca()) {
            partes.push(`<div class="rz-card" id="uc-cfg-fraca">
                <div class="rz-card-h"><b>Não consegui ler este com segurança</b></div>
                <p class="rz-desc">Você pode corrigir os campos abaixo e salvar, ou escolher uma destas saídas.</p>
                <div class="rz-acts">
                    <button type="button" class="rz-btn rz-btn-2" data-cfg="outra"><i data-lucide="camera"></i> Tentar outra foto</button>
                    <button type="button" class="rz-btn rz-btn-2" data-cfg="equipe"><i data-lucide="life-buoy"></i> Pedir para a equipe Raiz</button>
                    <button type="button" class="rz-btn rz-btn-3" data-cfg="descartar">Descartar</button>
                </div>
                <div class="rz-chips hidden" id="uc-cfg-motivos">
                    <button type="button" class="rz-chip" data-motivo="Não era este">Não era este</button>
                    <button type="button" class="rz-chip" data-motivo="Documento antigo">Documento antigo</button>
                    <button type="button" class="rz-chip" data-motivo="Mando depois">Mando depois</button>
                </div>
            </div>`);
        }
    }
    partes.push('<div id="uc-contrato-escolha"></div>');
    el.innerHTML = partes.join('');
    el.querySelector('[data-cfg="outra"]')?.addEventListener('click', tentarOutraFotoConfiguracao);
    el.querySelector('[data-cfg="equipe"]')?.addEventListener('click', pedirEquipeConfiguracao);
    el.querySelector('[data-cfg="descartar"]')?.addEventListener('click', () => document.getElementById('uc-cfg-motivos')?.classList.toggle('hidden'));
    el.querySelectorAll('[data-motivo]').forEach(b => b.addEventListener('click', () => descartarUploadConfiguracao(b.dataset.motivo)));
    atualizarEscolhaContrato();
    refrescarIcones();
}

// be7cdd7c — contrato de locação: criar o contrato ou só guardar no ativo.
function atualizarEscolhaContrato() {
    const el = document.getElementById('uc-contrato-escolha');
    if (!el || !up) return;
    const ehContrato = subtipoSelecionado()?.codigo === 'contrato_locacao';
    const podeCriar = window.podeUsar ? window.podeUsar('contratos.criar').ok : true;
    if (!ehContrato || !podeCriar) { el.innerHTML = ''; return; }
    if (el.innerHTML) return; // mantém a escolha feita
    el.innerHTML = `<div class="rz-card">
        <div class="rz-card-h"><b>É um contrato de locação. O que fazer com ele?</b></div>
        <label class="rz-row rz-chk"><input type="radio" name="uc-contrato-acao" value="criar" checked>
            <div class="rz-tx rz-wrap"><b>Criar o contrato</b><span>Abre o contrato já preenchido para você revisar e salvar. O documento fica anexado a ele.</span></div></label>
        <label class="rz-row rz-chk"><input type="radio" name="uc-contrato-acao" value="guardar">
            <div class="rz-tx rz-wrap"><b>Só guardar no ativo</b><span>Vira um documento do ativo, sem contrato no sistema.</span></div></label>
    </div>`;
}

function escolheuCriarContrato() {
    return subtipoSelecionado()?.codigo === 'contrato_locacao'
        && document.querySelector('input[name="uc-contrato-acao"]:checked')?.value === 'criar';
}

async function tentarOutraFotoConfiguracao() {
    const cfg = up?.config;
    if (up?.storagePath) { try { await api.removerArquivoDocumento(up.storagePath); } catch (e) { /* melhor esforço */ } }
    fecharModal('modal-confirmar-upload');
    esquecerLeituraPendente(); // v2.28.0 (U2)
    up = null;
    if (cfg) await abrirUploadConfiguracao(cfg.tipo, cfg.aoTerminar);
}

async function pedirEquipeConfiguracao() {
    if (!up) return;
    const g = id => document.getElementById(id);
    if (!g('uc-nome').value.trim()) g('uc-nome').value = up.arquivo.name.replace(/\.[^.]+$/, '');
    if (!g('uc-categoria').value) { const cat = categoriaIdPorCodigo('outros.outros'); if (cat) g('uc-categoria').value = cat; }
    up.pedirEquipe = true;
    await salvarConfirmacaoUpload();
}

async function pedirEquipeDocumento(docId, extracaoId, nome, motivo) {
    if (extracaoId) {
        await rpcDoc('fn_suporte_ticket_documento_abrir', { p_extracao_id: extracaoId, p_motivo: motivo || 'Cliente pediu para a equipe Raiz conferir', p_automatico: false });
        return;
    }
    const r = await rpcDoc('fn_demanda_criar', {
        p_cliente_id: estado.clienteId, p_subtipo: 'suporte', p_titulo: `Configuração inicial: ${nome}`.slice(0, 200),
        p_descricao: motivo || 'Documento sem leitura automática enviado na configuração inicial.',
        p_chave_idempotencia: 'cfg-doc:' + docId, p_forcar: true, p_pessoa_id: null, p_canal: null, p_severidade: 'alta',
    });
    if (r?.id) await api.inserirVinculo(estado.clienteId, docId, 'item_controle', r.id, false, estado.pessoa.id);
}

async function descartarUploadConfiguracao(motivo) {
    if (!up) return;
    const g = id => document.getElementById(id);
    const cfg = up.config; const f = up.arquivo;
    const statusEl = g('uc-status');
    statusEl.style.color = 'var(--sage)';
    statusEl.textContent = 'Descartando…';
    let extracaoId = null;
    try {
        try { await api.removerArquivoDocumento(up.storagePath); } catch (e) { /* melhor esforço */ }
        await api.inserirDocumento({
            id: up.documentoId, cliente_id: estado.clienteId, nome_original: f.name,
            nome_exibicao: (g('uc-nome').value || f.name).trim(), bucket: 'cofre-documentos', storage_path: up.storagePath,
            mime_type: api.mimeDoArquivo(f), extensao: (f.name.split('.').pop() || '').toLowerCase(), tamanho_bytes: f.size,
            hash_sha256: up.hash, categoria_id: g('uc-categoria').value || null, tags: [], subtipo_codigo: subtipoSelecionado()?.codigo || null,
            nivel_acesso: 'empresa', origem: 'app', status: 'ativo', criado_por: estado.pessoa.id,
            arquivo_mantido: false, arquivo_descartado_em: new Date().toISOString(),
        });
        const confirmado = { descartado: true, motivo };
        if (up.motor) extracaoId = await api.registrarExtracaoMotor(up.documentoId, up.motor, up.ia, 'rejeitado', confirmado);
        else if (up.ia) extracaoId = await api.registrarExtracao(up.documentoId, up.ia, 'rejeitado', confirmado);
        if (extracaoId) await rpcDoc('fn_cofre_extracao_descartar', { p_extracao_id: extracaoId, p_motivo: motivo });
        if (cfg) await rpcDoc('fn_configuracao_inicial_documento', { p_extracao_id: extracaoId, p_tipo_esperado: cfg.tipo, p_documento_id: up.documentoId });
        try {
            await api.atualizarDocumento(up.documentoId, { status: 'excluido', excluido_em: new Date().toISOString(), excluido_por: estado.pessoa.id });
        } catch (e) {
            await api.atualizarDocumento(up.documentoId, { status: 'arquivado' });
        }
    } catch (err) {
        return marcarErroConfirmacao('Não consegui descartar: ' + err.message);
    }
    fecharModal('modal-confirmar-upload');
    esquecerLeituraPendente(); // v2.28.0 (U2)
    up = null;
    mostrarToast('Documento descartado.');
    window.dispatchEvent(new CustomEvent('cofre:recarregar-documentos'));
    avisarConfig(cfg, {});
}

// Depois de salvar: liga à configuração, chama a equipe quando for o caso e abre o contrato (be7cdd7c).
async function depoisDeSalvarUpload(docId, p) {
    if (p.cfg) {
        try { await rpcDoc('fn_configuracao_inicial_documento', { p_extracao_id: p.extracaoId, p_tipo_esperado: p.cfg.tipo, p_documento_id: docId }); }
        catch (err) { console.warn('[configuração inicial] ligar documento:', err.message); }
    }
    let mensagem = null;
    if (p.pedirEquipe || p.cfg?.tipo === 'lista_ativos') {
        try {
            await pedirEquipeDocumento(docId, p.extracaoId, p.nome, p.cfg?.tipo === 'lista_ativos' ? 'Lista de ativos para cadastrar' : null);
            mensagem = 'A equipe Raiz vai conferir e te avisar.';
        } catch (err) {
            mostrarToast('O documento foi salvo, mas não consegui chamar a equipe: ' + err.message, 'aviso');
        }
    }
    if (p.criarContrato && typeof window.abrirNovoContratoDoDocumento === 'function') {
        window.abrirNovoContratoDoDocumento({ ativoId: p.ativoId, dados: p.dadosContrato, documentoId: docId, aoTerminar: p.cfg ? () => avisarConfig(p.cfg, {}) : null });
        return;
    }
    if (p.cfg) avisarConfig(p.cfg, { mensagem });
}

// be7cdd7c — o contrato criado a partir do documento recebe o documento anexado.
window.addEventListener('cofre:vincular-documento', async (ev) => {
    const d = ev.detail || {};
    if (!d.documentoId || !d.entidadeId) return;
    try {
        await api.inserirVinculo(estado.clienteId, d.documentoId, d.entidadeTipo || 'contrato', d.entidadeId, false, estado.pessoa.id);
        mostrarToast('Documento anexado ao contrato.');
    } catch (err) {
        mostrarToast('O contrato foi salvo, mas não consegui anexar o documento: ' + err.message, 'aviso');
    }
});

// v2.1.0 — o select de categoria usa o gabarito global; as linhas do cliente
// ficam só pra manter ids antigos (documentos já gravados apontam pra elas).
function catalogoCategoriasParaSelect() {
    const globais = (gabaritoCategorias || []).filter(c => c.ativo !== false);
    if (globais.length) return globais;
    return (estado.categorias || []).filter(c => c.ativo !== false);
}
function categoriaIdPorCodigo(codigo) {
    if (!codigo) return null;
    const cats = catalogoCategoriasParaSelect();
    return cats.find(c => c.codigo === codigo)?.id || null;
}

function montarSelectTipoDoc(codigoAtual) {
    const sel = document.getElementById('uc-tipo-doc');
    const tipoAtivo = up?.tipoAtivo || null;
    const lista = (subtiposControle || []).filter(s => s.ia_reconhece !== false || s.codigo === codigoAtual);
    const aplic = tipoAtivo ? lista.filter(s => subtipoAplicaAoTipoAtivo(s, tipoAtivo)) : lista;
    const outros = lista.filter(s => !aplic.includes(s));
    const opt = s => `<option value="${s.codigo}">${escapeHtml(s.nome)}</option>`;
    sel.innerHTML = `<option value="">— escolher o tipo —</option>` +
        (aplic.length ? `<optgroup label="${tipoAtivo ? 'Deste tipo de ativo' : 'Tipos'}">${aplic.map(opt).join('')}</optgroup>` : '') +
        (outros.length && tipoAtivo ? `<optgroup label="Outros">${outros.map(opt).join('')}</optgroup>` : '') +
        `<option value="outro">Não classificado / outro</option>`;
    sel.value = codigoAtual && [...sel.options].some(o => o.value === codigoAtual) ? codigoAtual : (codigoAtual === 'outro' ? 'outro' : '');
}

function subtipoSelecionado() {
    const codigo = document.getElementById('uc-tipo-doc').value;
    return (subtiposControle || []).find(s => s.codigo === codigo) || null;
}

// v2.25.0 — linha de chips com o caminho do documento no "Confira":
// vínculo · tipo de ativo · tipo › subtipo · espécie (mesmo padrão de #ic-caminho em cofre-controles.js).
function ligarCaminhoUpload() {
    const blocoTipo = document.getElementById('uc-tipo-doc')?.closest('.mb-3');
    if (!blocoTipo) return;
    if (!document.getElementById('uc-caminho')) {
        const caminho = document.createElement('div');
        caminho.id = 'uc-caminho';
        caminho.className = 'rz-chips mb-3';
        blocoTipo.insertAdjacentElement('afterend', caminho);
    }
    atualizarCaminhoUpload();
}
function atualizarCaminhoUpload() {
    const caminho = document.getElementById('uc-caminho');
    if (!caminho || !up) return;
    const s = subtipoSelecionado();
    const selEsp = document.getElementById('uc-categoria');
    const especie = selEsp?.value ? selEsp.options[selEsp.selectedIndex]?.text : '';
    const vinculo = up.vinculo?.nome || up.novoAtivo?.nome || '';
    const partes = [vinculo, up.tipoAtivo ? rotuloTipoAtivo(up.tipoAtivo) : '',
        s?.tipo ? rotuloTipoControle(s.tipo) : '', s?.nome || '', especie].filter(Boolean);
    caminho.innerHTML = partes.map(p => `<span class="rz-chip">${escapeHtml(p)}</span>`).join('');
}

// v2.14.0 — extraído de aplicarSubtipoUpload pra também rodar quando só o
// VÍNCULO muda (subtipo de documento já selecionado — o caso comum, IA
// classifica antes do usuário escolher o vínculo): antes, esta checagem só
// era refeita dentro de aplicarSubtipoUpload, e aplicarPadroesCategoriaUpload
// só chamava aplicarSubtipoUpload quando NENHUM subtipo estava selecionado
// ainda — nesse caso comum, "Controlar vencimento" ficava travado com o
// disabled calculado antes do vínculo existir (achado real, relato Nicola
// 17/09/2026: vinculou a um ativo, "Controlar vencimento" continuava sem
// poder marcar).
function atualizarDisponibilidadeControleUpload() {
    if (!up) return false;
    const g = id => document.getElementById(id);
    const vencido = !!g('uc-validade').value && g('uc-validade').value < new Date().toISOString().slice(0, 10);
    const permite = vinculoPermiteControle() && podeControlar() && !vencido;
    const chk = g('uc-controlar');
    chk.disabled = !permite;
    if (!permite && chk.checked) { chk.checked = false; g('uc-controle-bloco').classList.add('hidden'); }
    g('uc-controlar-hint').textContent = !podeControlar() ? 'Controle de vencimento indisponível no seu plano.'
        : vencido ? 'Documento vencido não gera controle. Envie o documento novo para controlar o vencimento.'
        : !vinculoPermiteControle() ? 'Vincule a um ativo ou contrato pra controlar o vencimento.'
        : 'Cria um item de controle com alerta no WhatsApp.';
    atualizarCaminhoUpload(); // v2.25.0 — vínculo ou tipo mudou
    return permite;
}

// Troca do tipo de documento (com ou sem IA): tudo abaixo segue o catálogo.
export function aplicarSubtipoUpload(primeira = false) {
    if (!up) return;
    const g = id => document.getElementById(id);
    const s = subtipoSelecionado();
    const m = up.motor;
    const mesmoDaIA = !!(m && s && m.subtipo_codigo === s.codigo);
    // categoria pelo tipo (catálogo) → senão pela IA legada → senão Outros
    const catId = categoriaIdPorCodigo(s?.categoria_codigo) || categoriaIdPorCodigo(mesmoDaIA ? m?.categoria_codigo : null) || categoriaIdPorCodigo(up.ia?.categoriaCodigoSugerido) || categoriaIdPorCodigo('outros.outros');
    if (catId) g('uc-categoria').value = catId;
    up.padroes = padroesDaCategoria(g('uc-categoria').value);
    if (s?.manter_arquivo_padrao != null) up.padroes.manterArquivo = s.manter_arquivo_padrao;
    if (s?.gera_controle_padrao) { up.padroes.controleTipo = s.tipo; up.padroes.controleSubtipoId = s.id; }
    else if (s) { up.padroes.controleTipo = null; up.padroes.controleSubtipoId = null; }
    g('uc-manter-arquivo').checked = !!up.padroes.manterArquivo;
    // v2.26.0 (D2) — documento de pessoa entra restrito (o banco força o mesmo).
    if (s && g('up-restrito')) g('up-restrito').checked = ehDocumentoDePessoa(s);
    atualizarEscolhaContrato();

    // dados estruturados: campos do tipo (valores da IA quando é o mesmo tipo)
    renderizarDadosCampos(s, mesmoDaIA ? m : null);
    // vencimento: campo único
    if (!primeira || !g('uc-validade').value) {
        const v = mesmoDaIA ? (m.vencimento?.data || '') : (g('uc-validade').value || '');
        g('uc-validade').value = v;
        g('uc-validade-flag').classList.toggle('hidden', !(mesmoDaIA && m.vencimento?.derivada));
    }

    // controle
    const permite = atualizarDisponibilidadeControleUpload();
    const chk = g('uc-controlar');
    const geraPadrao = s ? !!s.gera_controle_padrao : !!up.padroes.controleTipo;
    const bloqueadoPorValidacao = mesmoDaIA && m.gera_controle === false && !vencido;
    chk.checked = permite && geraPadrao && !!g('uc-validade').value && !bloqueadoPorValidacao;
    g('uc-controle-bloco').classList.toggle('hidden', !chk.checked);
    if (up.padroes.controleTipo) g('uc-ctl-tipo').value = up.padroes.controleTipo;
    preencherSubtiposControleUpload(up.padroes.controleSubtipoId);
    g('uc-ctl-titulo').value = g('uc-nome').value;
    g('uc-ctl-data-inicio').value = g('uc-vig-inicio').value || g('uc-data-documento').value || new Date().toISOString().slice(0, 10);
    g('uc-ctl-data-fim').value = g('uc-validade').value || '';
    aplicarPadraoSubtipoUpload();
    if (mesmoDaIA && m.controle_sugerido) {
        if (m.controle_sugerido.antecedencia != null) g('uc-ctl-antecedencia').value = m.controle_sugerido.antecedencia;
        if (m.controle_sugerido.repeticao != null) g('uc-ctl-reforco').value = m.controle_sugerido.repeticao;
        g('uc-ctl-rec-intervalo').value = m.controle_sugerido.rec_intervalo ?? '';
        if (m.controle_sugerido.rec_unidade) g('uc-ctl-rec-unidade').value = m.controle_sugerido.rec_unidade;
    }
    // v2.10.0 — A.10: valor/parcelas sugeridos pela IA (ou limpos, se o
    // subtipo mudou pra um que a IA não classificou).
    const sug = mesmoDaIA ? sugerirValorParcelasIA(s, m) : null;
    g('uc-ctl-valor-previsto').value = sug ? formatarValorBR(sug.valorTotal) : '';
    g('uc-ctl-parcelas').value = sug ? sug.parcelas : 1;
    g('uc-ctl-parcela-intervalo').value = sug ? sug.intervalo : 30;
}

// v2.10.0 — lê os campos JÁ EXTRAÍDOS (m.campos, conforme o esquema do
// subtipo s.campos) e sugere valor total previsto + parcelamento, sem
// depender de nome de campo fixo (cada subtipo usa um): prioridade
// 'valor' → 'premio_total' → 'valor_financiado' pro total; 'parcelas' pra
// quantidade; se só houver 'valor_parcela' (sem total), total = parcela ×
// qtd; intervalo vem de 'primeira_parcela'/'ultima_parcela' quando existem
// (ex. financiamento_veiculo), senão o padrão de 30 dias.
function sugerirValorParcelasIA(s, m) {
    if (!s || !m?.campos) return null;
    const campos = s.campos || [];
    const existe = campo => campos.some(c => c.campo === campo);
    const num = campo => { const v = m.campos[campo]; if (v === null || v === undefined || v === '') return null; const n = typeof v === 'number' ? v : parseValorBR(String(v)); return Number.isFinite(n) ? n : null; };
    let parcelas = 1;
    if (existe('parcelas')) { const p = parseInt(m.campos.parcelas, 10); if (Number.isInteger(p) && p > 1) parcelas = p; }
    let valorTotal = null;
    for (const campo of ['valor', 'premio_total', 'valor_financiado']) { if (existe(campo)) { const v = num(campo); if (v != null) { valorTotal = v; break; } } }
    if (valorTotal == null && existe('valor_parcela') && parcelas > 1) { const vp = num('valor_parcela'); if (vp != null) valorTotal = Math.round(vp * parcelas * 100) / 100; }
    if (valorTotal == null) return null;
    let intervalo = 30;
    if (parcelas > 1 && existe('primeira_parcela') && existe('ultima_parcela') && m.campos.primeira_parcela && m.campos.ultima_parcela) {
        const dias = Math.round((new Date(m.campos.ultima_parcela) - new Date(m.campos.primeira_parcela)) / 86400000 / (parcelas - 1));
        if (Number.isFinite(dias) && dias > 0) intervalo = dias;
    }
    return { valorTotal, parcelas, intervalo };
}

// Bloco "Dados do documento" — um input por campo do catálogo.
function renderizarDadosCampos(s, m) {
    const bloco = document.getElementById('uc-dados-bloco');
    const cont = document.getElementById('uc-dados-campos');
    const campos = (s?.campos || []).filter(c => c.tipo !== 'partes');
    if (!campos.length) { bloco.classList.add('hidden'); cont.innerHTML = ''; return; }
    const ruins = new Set((m?.validacoes || []).filter(v => !v.ok).flatMap(v => v.campos || []));
    cont.innerHTML = campos.map(c => {
        const val = m?.campos?.[c.campo] ?? '';
        const conf = m?.confianca_campos?.[c.campo];
        const confira = m && ((conf != null && conf < LIMIAR_CONFIRA) || ruins.has(c.campo) || (c.obrigatorio && (val === '' || val == null)));
        const ev = m?.evidencias?.[c.campo] ? ` title="lido em: ${escapeHtml(String(m.evidencias[c.campo]).slice(0, 120))}"` : '';
        const tipoInput = c.tipo === 'data' ? 'date' : 'text';
        const extra = c.tipo === 'valor' ? ' inputmode="decimal" placeholder="0,00"' : (c.tipo === 'cpf' || c.tipo === 'renavam' ? ' inputmode="numeric"' : '');
        const mostrado = c.tipo === 'valor' ? formatarValorBR(val) : (val == null ? '' : String(val)); // v2.8.0
        return `<div><label class="text-xs block mb-0.5" style="color:${confira ? 'var(--warning)' : 'var(--sage)'}">${escapeHtml(c.rotulo)}${confira ? ' · confira' : ''}${c.obrigatorio ? ' *' : ''}${c.tipo === 'valor' ? ' <span style="color:var(--sage)">(R$)</span>' : ''}</label>
            <input type="${tipoInput}"${extra} class="uc-dado w-full border-2 ${confira ? 'border-amber-400' : 'border-slate-300'} rounded-xl p-2 text-sm" data-campo="${c.campo}" data-tipo="${c.tipo}" value="${escapeHtml(mostrado)}"${ev}${c.tipo === 'valor' ? ' onblur="this.value=window.__rzFmtValor?window.__rzFmtValor(this.value):this.value"' : ''}></div>`;
    }).join('');
    bloco.classList.remove('hidden');
}

// v2.8.0 — valores no padrão brasileiro nos dois sentidos.
function formatarValorBR(v) {
    if (v === null || v === undefined || v === '') return '';
    const n = typeof v === 'number' ? v : parseValorBR(String(v));
    return n === null ? String(v) : n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function parseValorBR(t) {
    let x = String(t ?? '').replace(/[^\d,.\-]/g, '');
    if (!x) return null;
    const temVirgula = x.includes(','), temPonto = x.includes('.');
    if (temVirgula && temPonto) x = x.replace(/\./g, '').replace(',', '.');
    else if (temVirgula) x = x.replace(',', '.');
    else if (temPonto && /\.\d{3}(\.|$)/.test(x) && !/\.\d{1,2}$/.test(x)) x = x.replace(/\./g, '');
    const n = Number(x);
    return Number.isFinite(n) ? Math.round(n * 100) / 100 : null;
}
window.__rzFmtValor = formatarValorBR;

function lerDadosEstruturados() {
    const out = {};
    document.querySelectorAll('.uc-dado').forEach(el => {
        let v = el.value.trim(); if (v === '') { out[el.dataset.campo] = null; return; }
        if (el.dataset.tipo === 'valor') { v = parseValorBR(v); if (v === null) { out[el.dataset.campo] = null; return; } }
        if (['cpf', 'renavam', 'numero'].includes(el.dataset.tipo)) v = v.replace(/\D/g, '');
        if (['placa', 'chassi'].includes(el.dataset.tipo)) v = v.toUpperCase().replace(/[^A-Z0-9]/g, '');
        out[el.dataset.campo] = v;
    });
    return out;
}

// Avisos do motor: vencido (D10), titular divergente, validações, orçamento≠apólice.
function renderizarAvisosUpload() {
    const el = document.getElementById('uc-avisos');
    const m = up?.motor; const g = id => document.getElementById(id);
    const avisos = [];
    const venc = g('uc-validade').value;
    if (venc && venc < new Date().toISOString().slice(0, 10)) avisos.push({ cor: 'var(--danger)', texto: `Este documento está vencido desde ${formatarDataBR(venc)}. Ele será guardado como vencido e não vai gerar controle — subir mesmo assim?` });
    if (m?.titular?.divergente && m.titular.mensagem) avisos.push({ cor: 'var(--warning)', texto: m.titular.mensagem });
    (m?.validacoes || []).filter(v => !v.ok && v.codigo !== 'campo_obrigatorio_ausente').forEach(v => avisos.push({ cor: 'var(--warning)', texto: v.mensagem || v.codigo }));
    (up?.qualidade?.avisos || []).forEach(a => avisos.push({ cor: 'var(--sage)', texto: a.mensagem })); // v2.2.0 — quality gate (não bloqueia)
    if (m && m.classificacao?.motivo && /mais de um|2 documentos|dois documentos/i.test(m.classificacao.motivo)) avisos.push({ cor: 'var(--warning)', texto: 'A foto parece ter mais de um documento — a IA leu o principal. Se quiser guardar os dois, envie separado.' });
    if (m?.vencimento?.derivada && !m?.titular?.divergente) avisos.push({ cor: 'var(--sage)', texto: 'O vencimento foi calculado pela regra do tipo (não estava legível). Confira antes de salvar.' });
    // v2.4.0 — o caso mais confuso: reconheceu o documento, mas não leu nada.
    if (up?.leituraFalhou) avisos.unshift({ cor: 'var(--danger)', texto: `A IA reconheceu que é ${subtipoSelecionado()?.nome || 'este tipo'}, mas não conseguiu ler os campos. Toque em "Reler" para tentar de novo, ou preencha à mão.` });
    el.classList.toggle('hidden', !avisos.length);
    el.innerHTML = avisos.map(a => `<div class="text-xs rounded-xl px-3 py-2" style="background:#fff7ed;border:1px solid ${a.cor};color:#4a5852">${escapeHtml(a.texto)}</div>`).join('');
}

export function aoMudarTipoDocUpload() { aplicarSubtipoUpload(false); renderizarAvisosUpload(); atualizarOfertaCriarAtivo(); refrescarIcones(); }

// Oferece criar o ativo quando o documento não tem a que se vincular.
function atualizarOfertaCriarAtivo() {
    const g = id => document.getElementById(id);
    const btn = g('uc-criar-ativo-btn'); if (!btn) return;
    const semVinculo = !up?.vinculo || up.vinculo.tipo === 'triagem' || !up.vinculo.id;
    const tipo = tipoAtivoDoDocumento();
    const mostra = semVinculo && !!tipo && !up?.novoAtivo && !up?.contexto;
    btn.classList.toggle('hidden', !mostra);
    if (mostra) btn.textContent = `+ Criar ${(rotuloTipoAtivo ? rotuloTipoAtivo(tipo) : tipo).toLowerCase()} a partir deste documento`;
    if (up?.novoAtivo) g('uc-novo-ativo-bloco').classList.remove('hidden');
}
export function aoMudarValidadeUpload() {
    document.getElementById('uc-ctl-data-fim').value = document.getElementById('uc-validade').value || '';
    aplicarSubtipoUpload(true); renderizarAvisosUpload();
}

// "Reler": reclassifica com o tipo escolhido (gasta cota de IA).
export async function relerComoTipoUpload() {
    const codigo = document.getElementById('uc-tipo-doc').value;
    if (!up?.storagePath || !codigo || codigo === 'outro') { mostrarToast('Escolha um tipo pra reler.', 'aviso'); return; }
    if (up.processando) return;
    // v2.27.0 (9ddb9f34) — o Confira fica travado durante a releitura e o resultado aparece na tela.
    const st = document.getElementById('uc-status');
    const botoes = [...document.querySelectorAll('#modal-confirmar-upload button, #modal-confirmar-upload select, #modal-confirmar-upload input')];
    const estavam = botoes.map(b => b.disabled);
    up.processando = true; botoes.forEach(b => { b.disabled = true; });
    const nome = subtipoSelecionado()?.nome || codigo;
    const inicio = Date.now();
    st.style.color = 'var(--brass, #b8860b)';
    const relogio = setInterval(() => { st.textContent = `✨ Relendo como ${nome}… ${Math.round((Date.now() - inicio) / 1000)} s · mantenha o app aberto`; }, 1000);
    st.textContent = `✨ Relendo como ${nome}… mantenha o app aberto`;
    let res;
    try {
        res = await lerComIALimitada(up.storagePath, api.mimeDoArquivo(up.arquivo), { tipoAtivo: up.tipoAtivo, ativoId: up.vinculo?.tipo === 'ativo' ? up.vinculo.id : null, classificacaoForcada: codigo });
    } catch (err) { res = { estado: 'falha', info: { motivo: 'A IA está indisponível agora.' } }; }
    clearInterval(relogio);
    up.processando = false; botoes.forEach((b, k) => { b.disabled = estavam[k]; });
    if (res.estado === 'pronto') {
        montarConfirmacaoUpload(); refrescarIcones();
        st.style.color = 'var(--pine)'; st.textContent = `✓ Relido como ${up.motor?.subtipo_nome || nome}. Confira os campos.`;
    } else {
        st.style.color = 'var(--danger)';
        st.textContent = res.estado === 'interrompida'
            ? '↻ A releitura foi interrompida. Toque em Reler para tentar de novo; a leitura anterior foi mantida.'
            : `⚠️ Não deu para reler: ${res.info?.motivo || 'tente outro tipo'}. A leitura anterior foi mantida.`;
    }
    if (res.info?.avisoLimite) mostrarToast(res.info.avisoLimite, 'aviso');
}


// Troca de categoria (ou 1ª montagem): aplica os padrões parametrizados —
// manter arquivo e controlar vencimento — e pré-preenche o bloco de controle.
export function aplicarPadroesCategoriaUpload(primeira = false) {
    // v2.1.0 — o tipo de documento manda; troca manual de categoria só reaplica "manter arquivo".
    if (!up) return;
    atualizarCaminhoUpload(); // v2.25.0
    const g = id => document.getElementById(id);
    if (!subtipoSelecionado()) {
        // FIX 18/09/2026 (achado real, relato Nicola — "categoria › subtipo,
        // qq item que escolho ele trava no outro"): este ramo delegava pra
        // aplicarSubtipoUpload(primeira), que RECALCULA uc-categoria a partir
        // do subtipo/IA (catId) e SOBRESCREVE o <select> — inclusive quando
        // quem acabou de mudar foi exatamente a Categoria, à mão, sem
        // subtipo nenhum selecionado. Resultado: a categoria escolhida
        // "voltava" sozinha pro valor anterior (sugestão da IA, ou "Outros").
        // Sem subtipo selecionado não há nada que justifique reescrever a
        // categoria — só reaplica os padrões da categoria que o usuário
        // efetivamente escolheu.
        up.padroes = padroesDaCategoria(g('uc-categoria').value);
        g('uc-manter-arquivo').checked = !!up.padroes.manterArquivo;
        atualizarDisponibilidadeControleUpload();
        return;
    }
    up.padroes = { ...(up.padroes || {}), manterArquivo: padroesDaCategoria(g('uc-categoria').value).manterArquivo };
    g('uc-manter-arquivo').checked = !!up.padroes.manterArquivo;
    // FIX 17/09/2026 — era o único ramo que nunca recomputava "Controlar
    // vencimento" depois de trocar o vínculo (ver nota em
    // atualizarDisponibilidadeControleUpload).
    atualizarDisponibilidadeControleUpload();
}

export function aoMudarControlarUpload() {
    const chk = document.getElementById('uc-controlar');
    document.getElementById('uc-controle-bloco').classList.toggle('hidden', !chk.checked);
    if (chk.checked && !document.getElementById('uc-ctl-titulo').value) document.getElementById('uc-ctl-titulo').value = document.getElementById('uc-nome').value;
}

export function aoMudarTipoControleUpload() { preencherSubtiposControleUpload(null); aplicarPadraoSubtipoUpload(); }

function preencherSubtiposControleUpload(subtipoIdPreferido) {
    const tipo = document.getElementById('uc-ctl-tipo').value;
    const tipoAtivo = up?.tipoAtivo || null;
    let lista = (subtiposControle || []).filter(s => s.tipo === tipo);
    if (tipoAtivo) {
        const compat = lista.filter(s => subtipoAplicaAoTipoAtivo(s, tipoAtivo));
        if (compat.length) lista = compat;
    }
    // Dica da IA: subtipo cujo nome aparece no tipo detectado (ex.: "CNH")
    const detectado = (up?.ia?.tipoDocumentoDetectado || '').toLowerCase();
    const pelaIA = detectado ? lista.find(s => detectado.includes(s.nome.toLowerCase()) || detectado.includes(s.codigo.replace(/_/g, ' '))) : null;
    const sel = document.getElementById('uc-ctl-subtipo');
    sel.innerHTML = `<option value="">— sem subtipo —</option>` + lista.map(s => `<option value="${s.id}">${escapeHtml(s.nome)}</option>`).join('');
    const alvo = subtipoIdPreferido && lista.some(s => s.id === subtipoIdPreferido) ? subtipoIdPreferido : (pelaIA?.id || '');
    sel.value = alvo;
}

// Padrão de ocorrência do subtipo (antecedência · reforço · recorrência) —
// A.13, cofre_controle_subtipos.*_padrao_*. Editável na hora.
export function aplicarPadraoSubtipoUpload() {
    const g = id => document.getElementById(id);
    const s = (subtiposControle || []).find(x => x.id === g('uc-ctl-subtipo').value);
    const tipo = g('uc-ctl-tipo').value;
    const fallback = { seguro: [60, 30, 1, 'ano'], tributo: [30, 7, 1, 'ano'], documento: [180, 60, null, null], manutencao: [15, 7, null, null] }[tipo] || [30, 7, null, null];
    g('uc-ctl-antecedencia').value = s?.antecedencia_padrao_dias ?? fallback[0];
    g('uc-ctl-reforco').value = s?.repeticao_padrao_dias ?? fallback[1];
    g('uc-ctl-rec-intervalo').value = s?.recorrencia_padrao_intervalo ?? fallback[2] ?? '';
    g('uc-ctl-rec-unidade').value = s?.recorrencia_padrao_unidade ?? fallback[3] ?? 'ano';
}

export function aoMudarVinculoIaUpload() {
    const v = document.querySelector('input[name="uc-vinculo-ia"]:checked')?.value;
    const livre = document.getElementById('up-vinculo-livre');
    if (v === 'outro') { up.vinculo = null; livre.classList.remove('hidden'); document.getElementById('up-vinculo-tipo').value = 'triagem'; }
    else { const c = up.ia.candidatosVinculo[parseInt(v, 10)]; up.vinculo = { tipo: c.tipo, id: c.id, nome: c.nome }; livre.classList.add('hidden'); }
    aplicarPadroesCategoriaUpload();
}

// Troca de tipo de vínculo no upload livre — mostra busca de candidato
// quando aplicável (prompt corretivo §19.3, mas aqui no App, não no bot)
export async function aoMudarTipoVinculoUpload() {
    const tipo = document.getElementById('up-vinculo-tipo').value;
    const buscaEl = document.getElementById('up-vinculo-busca');
    const candidatosEl = document.getElementById('up-vinculo-candidatos');
    up.vinculo = tipo === 'triagem' ? null : (tipo === 'empresa' ? { tipo: 'empresa', id: null, nome: 'Empresa (geral)' } : null);
    candidatosEl.innerHTML = '';
    // FIX 17/09/2026 — "imovel" saiu do <select> (ativos-markup.js v1.40.0):
    // buscar por "Ativo controlado" já cobre imóvel (cofre_ativos.nome_exibicao
    // tem o endereço). "contrato" entrou — busca por locatário.
    if (tipo === 'ativo' || tipo === 'contrato') {
        buscaEl.classList.remove('hidden');
        buscaEl.value = '';
        buscaEl.placeholder = tipo === 'ativo' ? 'Digite o nome do ativo…' : 'Digite o nome do locatário…';
        buscaEl.oninput = debounce(() => buscarCandidatosUpload(tipo, buscaEl.value), 250);
    } else {
        buscaEl.classList.add('hidden');
    }
    aplicarPadroesCategoriaUpload();
}

function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

// Rótulo de exibição de um candidato de vínculo, por tipo — usado tanto no
// upload quanto no "Vincular agora" pós-triagem (mesmo catálogo de tipos).
function rotuloCandidatoVinculo(tipo, c) {
    if (tipo === 'ativo') return c.nome_exibicao;
    if (tipo === 'contrato') return c.locatario + (c.ativoNome ? ` · ${c.ativoNome}` : '') + (c.status && c.status !== 'ativo' ? ` (${c.status})` : '');
    return `${c.endereco_rua}, ${c.endereco_num || ''}`; // imovel — só chega aqui via candidato sugerido pela IA, não pelo select manual
}

async function buscarCandidatosUpload(tipo, termo) {
    const el = document.getElementById('up-vinculo-candidatos');
    if (!termo || termo.trim().length < 2) { el.innerHTML = ''; return; }
    const candidatos = tipo === 'ativo' ? await api.buscarCandidatosAtivo(estado.clienteId, termo) : await api.buscarCandidatosContrato(estado.clienteId, termo);
    if (candidatos.length === 0) { el.innerHTML = `<p class="text-xs" style="color:var(--sage)">Nada encontrado. Você pode salvar em triagem e resolver depois.</p>`; return; }
    el.innerHTML = candidatos.map(c => {
        const nome = rotuloCandidatoVinculo(tipo, c);
        return `<button type="button" data-action="escolher-candidato-upload" data-tipo="${tipo}" data-id="${c.id}" data-nome="${escapeHtml(nome)}" data-tipo-ativo="${escapeHtml(c.tipo_ativo || '')}" class="w-full text-left text-xs border-2 border-slate-200 rounded-lg p-2 hover:border-emerald-700">${escapeHtml(nome)}</button>`;
    }).join('');
}

export function escolherCandidatoUpload(tipo, id, nome, tipoAtivo) {
    up.vinculo = { tipo, id, nome };
    if (tipoAtivo) up.tipoAtivo = tipoAtivo;
    up.novoAtivo = null;
    document.getElementById('uc-novo-ativo-bloco')?.classList.add('hidden');
    document.getElementById('up-vinculo-candidatos').innerHTML = `<div class="raiz-bloco-interno text-xs flex items-center justify-between"><span>✅ ${escapeHtml(nome)}</span></div>`;
    document.getElementById('up-vinculo-busca').classList.add('hidden');
    aplicarPadroesCategoriaUpload();
    atualizarOfertaCriarAtivo();
}

export async function cancelarConfirmacaoUpload() {
    const cfg = up?.config || null; // v2.26.0 (D2)
    if (up?.storagePath) { try { await api.removerArquivoDocumento(up.storagePath); } catch (e) { /* melhor esforço */ } }
    fecharModal('modal-confirmar-upload');
    esquecerLeituraPendente(); // v2.28.0 (U2)
    up = null;
    avisarConfig(cfg, { cancelado: true });
}

// Compatibilidade: chamadores antigos de salvarUpload() caem no salvar novo.
export async function salvarUpload() { await salvarConfirmacaoUpload(); }

export async function salvarConfirmacaoUpload() {
    if (!up?.storagePath) return;
    const g = id => document.getElementById(id);
    const statusEl = g('uc-status');
    const nome = g('uc-nome').value.trim();
    const categoriaId = g('uc-categoria').value;
    const manter = g('uc-manter-arquivo').checked;
    // v2.26.0 (D2) — contrato que vai virar contrato não ganha item de vencimento próprio (o contrato
    // tem os dele); documento mandado para a equipe também não (a leitura é incerta).
    const criarContrato = !up.pedirEquipe && escolheuCriarContrato();
    const controlar = g('uc-controlar').checked && !g('uc-controlar').disabled && !criarContrato && !up.pedirEquipe;
    if (!nome) return marcarErroConfirmacao('Informe o nome de exibição.');
    if (!categoriaId) return marcarErroConfirmacao('Selecione uma categoria.');
    g('uc-ctl-data-fim').value = g('uc-validade').value || g('uc-ctl-data-fim').value || '';
    if (controlar && !g('uc-ctl-data-fim').value) return marcarErroConfirmacao('Informe a data de vencimento (Vence em).');
    if (controlar && !g('uc-ctl-titulo').value.trim()) return marcarErroConfirmacao('Informe o título do controle.');

    statusEl.style.color = 'var(--sage)';
    statusEl.textContent = 'Salvando…';
    const f = up.arquivo;
    const nivelAcesso = g('up-restrito').checked ? 'restrito' : 'empresa';
    const validade = g('uc-validade').value || g('uc-vig-fim').value || null;
    const vencido = !!validade && validade < new Date().toISOString().slice(0, 10);
    const subtipoSel = subtipoSelecionado();
    const dadosEstruturados = lerDadosEstruturados();
    const dados = {
        data_documento: g('uc-data-documento').value || null, validade_em: validade,
        descricao: g('uc-descricao').value.trim() || null,
        subtipo_codigo: subtipoSel?.codigo || (g('uc-tipo-doc').value === 'outro' ? 'outro' : null), dados_estruturados: dadosEstruturados, vencido_no_upload: vencido,
    };

    try {
        await api.inserirDocumento({
            id: up.documentoId, cliente_id: estado.clienteId, nome_original: f.name, nome_exibicao: nome,
            bucket: 'cofre-documentos', storage_path: up.storagePath, mime_type: api.mimeDoArquivo(f), extensao: (f.name.split('.').pop() || '').toLowerCase(),
            tamanho_bytes: f.size, hash_sha256: up.hash, categoria_id: categoriaId, tags: [], ...dados,
            nivel_acesso: nivelAcesso, origem: 'app', status: 'ativo', criado_por: estado.pessoa.id, arquivo_mantido: manter,
        });
    } catch (err) {
        await api.removerArquivoDocumento(up.storagePath);
        return marcarErroConfirmacao('Falha ao salvar (upload desfeito): ' + err.message);
    }

    const avisos = [];
    // v2.2.0 — cria o ativo pedido na confirmação (antes do vínculo).
    if (up.novoAtivo) {
        try {
            const novo = await criarAtivoDoDocumentoSeMarcado();
            if (novo) mostrarToast(`Ativo "${novo.nome_exibicao}" criado ✅`);
        } catch (err) { avisos.push('criar ativo: ' + err.message); up.novoAtivo = null; }
    }
    if (up.vinculo && up.vinculo.tipo !== 'triagem') {
        try { await api.inserirVinculo(estado.clienteId, up.documentoId, up.vinculo.tipo, up.vinculo.id, true, estado.pessoa.id); }
        catch (err) { avisos.push('vínculo: ' + err.message); }
    }

    // Auditoria: o que a IA leu × o que o cliente confirmou (motor → RPC nova; legado → RPC antiga).
    if (up.ia) {
        const cat = catalogoCategoriasParaSelect().find(c => c.id === categoriaId) || estado.categorias.find(c => c.id === categoriaId);
        const confirmado = { categoriaCodigo: cat?.codigo || null, categoriaId, nome, subtipo_codigo: dados.subtipo_codigo, dados_estruturados: dadosEstruturados, validade_em: validade, data_documento: dados.data_documento, manterArquivo: manter, controlar, vencido,
            qualidade: resumoQualidade(up.qualidade, up.tratamento), qualidade_ignorada: !!up.qualidadeIgnorada, ativo_criado: up.novoAtivo ? up.vinculo?.id ?? null : null };
        let igual;
        if (up.motor) {
            const mc = up.motor.campos || {};
            igual = up.motor.subtipo_codigo === dados.subtipo_codigo && (up.motor.vencimento?.data || null) === validade &&
                Object.keys(dadosEstruturados).every(k => (dadosEstruturados[k] ?? null) === (mc[k] ?? null));
            try { up.extracaoId = await api.registrarExtracaoMotor(up.documentoId, up.motor, up.ia, (igual && !up.pedirEquipe) ? 'confirmado' : (up.pedirEquipe ? 'nao_revisado' : 'corrigido'), confirmado); }
            catch (err) { console.warn('auditoria do motor:', err.message); }
        } else {
            igual = (cat?.codigo || null) === (up.ia.categoriaCodigoSugerido || null) && nome === (up.ia.nomeSugerido || '') && (dados.data_documento || null) === (up.ia.dataDocumento || null);
            try { up.extracaoId = await api.registrarExtracao(up.documentoId, up.ia, (igual && !up.pedirEquipe) ? 'confirmado' : (up.pedirEquipe ? 'nao_revisado' : 'corrigido'), confirmado); }
            catch (err) { console.warn('auditoria da extração:', err.message); }
        }
    }

    // Identificadores fortes no ativo (fase 3): o próximo documento casa sem escolher.
    if (up.vinculo?.tipo === 'ativo' && up.vinculo.id) {
        const idn = {};
        if (dadosEstruturados.cpf) idn.cpf = dadosEstruturados.cpf;
        if (dadosEstruturados.placa) idn.placa = dadosEstruturados.placa;
        if (dadosEstruturados.renavam) idn.renavam = dadosEstruturados.renavam;
        if (dadosEstruturados.chassi) idn.chassi = dadosEstruturados.chassi;
        if (Object.keys(idn).length) { try { await api.mesclarIdentificadoresAtivo(up.vinculo.id, idn); } catch (err) { console.warn('identificadores do ativo:', err.message); } }
    }

    // E14.4 ("A5", 15/09/2026) — contatos marcados viram partes (find-or-
    // create por nome, cofre-api.js), não mais cofre_contatos_acionamento.
    // O vínculo com o item de controle só é gravado MAIS ABAIXO, depois
    // que itemCriado existe — achado ao mexer aqui: o bloco antigo rodava
    // ANTES do item nascer, então nunca vinculava por item_controle_id
    // mesmo (só por documento_id) — o vínculo de verdade ficava pra uma
    // consulta manual. Agora fica explícito e funciona.
    const PAPEL_CONTATO_PARA_PARTE = { seguradora: 'contato_seguradora', corretor: 'corretor', oficina: 'prestador', assistencia: 'prestador', administradora: 'administradora', advogado: 'advogado', outro: 'prestador' };
    const marcados = [...document.querySelectorAll('.uc-contato:checked')].map(el => up.contatosSugeridos?.[parseInt(el.value, 10)]).filter(Boolean);
    const partesParaVincular = []; // { parte_id, papel } — vira partes_papeis quando o item nascer
    for (const c of marcados) {
        try {
            const parteId = await api.encontrarOuCriarParte(estado.clienteId, c.nome, { whatsapp: c.telefone || null, email: c.email || null });
            partesParaVincular.push({ parte_id: parteId, papel: PAPEL_CONTATO_PARA_PARTE[c.papel] || 'prestador' });
        } catch (err) { avisos.push('contato ' + c.nome + ': ' + err.message); }
    }

    // Item de controle — mesmo caminho da tela Controles (cofre-controles.js).
    let itemCriado = null;
    if (controlar) {
        try {
            const ctl = await import('./cofre-controles.js');
            const recInt = parseInt(g('uc-ctl-rec-intervalo').value, 10) || null;
            const valorPrevisto = parseValorBR(g('uc-ctl-valor-previsto').value) ?? null; // v2.10.0 — A.10
            const parcelasCtl = Math.max(1, parseInt(g('uc-ctl-parcelas').value, 10) || 1);
            const parcelaIntervaloCtl = Math.max(1, parseInt(g('uc-ctl-parcela-intervalo').value, 10) || 30);
            itemCriado = await ctl.criarItemControleDeDocumento({
                ativoId: up.vinculo.tipo === 'ativo' ? up.vinculo.id : null,
                contratoId: up.vinculo.tipo === 'contrato' ? up.vinculo.id : null,
                tipo: g('uc-ctl-tipo').value, subtipoId: g('uc-ctl-subtipo').value || null,
                titulo: g('uc-ctl-titulo').value.trim(),
                dataBase: g('uc-ctl-data-inicio').value || g('uc-ctl-data-fim').value, dataFim: g('uc-ctl-data-fim').value,
                freqIntervalo: recInt, freqUnidade: recInt ? g('uc-ctl-rec-unidade').value : null,
                antecedencia: parseInt(g('uc-ctl-antecedencia').value, 10) || 0,
                repeticao: parseInt(g('uc-ctl-reforco').value, 10) || null,
                valorPrevisto, parcelas: parcelasCtl, parcelaIntervaloDias: parcelaIntervaloCtl, // v2.10.0 — A.10
                documentoId: up.documentoId,
            });
            await api.inserirVinculo(estado.clienteId, up.documentoId, 'item_controle', itemCriado.id, false, estado.pessoa.id);
            // E14.4 — só agora o item existe; vincula as partes coletadas
            // acima (find-or-create já rodou antes de precisar do item_id).
            if (partesParaVincular.length) {
                try { await api.salvarPartesItemControle(itemCriado.id, partesParaVincular); }
                catch (err) { avisos.push('vincular contato ao item: ' + err.message); }
            }
        } catch (err) { avisos.push('controle: ' + err.message); }
    }

    // Minimização (A.12): categoria "só dados" → arquivo sai do Storage, dados ficam.
    if (!manter) {
        try {
            await api.removerArquivoDocumento(up.storagePath);
            await api.atualizarDocumento(up.documentoId, { arquivo_mantido: false, arquivo_descartado_em: new Date().toISOString() });
            await api.registrarLogAcessos(estado.clienteId, estado.pessoa.id, 'cofre.documento_descartado', { documento_id: up.documentoId, categoria_id: categoriaId });
        } catch (err) { avisos.push('descarte do arquivo: ' + err.message); }
    }

    await api.registrarLogAcessos(estado.clienteId, estado.pessoa.id, 'cofre.upload', {
        documento_id: up.documentoId, nome, categoria_id: categoriaId, comIA: !!up.ia, manterArquivo: manter, itemControleId: itemCriado?.id,
        ativoId: up.vinculo?.tipo === 'ativo' ? up.vinculo.id : undefined,
    });

    const partes = ['Documento salvo'];
    if (itemCriado) partes.push('vencimento sob controle');
    if (vencido) partes.push('guardado como vencido');
    if (!manter) partes.push('só os dados guardados');
    mostrarToast(partes.join(' · ') + ' ✅');
    avisos.forEach(a => mostrarToast('Atenção — ' + a, 'aviso'));
    fecharModal('modal-confirmar-upload');
    const documentoIdSalvo = up.documentoId; // capturado antes de `up = null` (linha abaixo)
    // v2.26.0 (D2) — o que acontece depois de salvar, capturado antes de `up = null`.
    const posSalvar = {
        cfg: up.config || null, extracaoId: up.extracaoId || null, pedirEquipe: !!up.pedirEquipe, nome,
        criarContrato, ativoId: up.vinculo?.tipo === 'ativo' ? up.vinculo.id : null,
        dadosContrato: criarContrato ? { ...(up.motor?.campos || {}), ...dadosEstruturados, partes: up.motor?.partes || up.motor?.campos?.partes || [] } : null,
    };
    esquecerLeituraPendente(); // v2.28.0 (U2)
    up = null;
    window.dispatchEvent(new CustomEvent('cofre:recarregar-documentos'));
    if (itemCriado) window.dispatchEvent(new CustomEvent('cofre:recarregar-eventos'));
    // v2.21.0 (Fase 1 do wrapper de escrita) — evento novo pra fora do Cofre.
    emitirEscrita('documento', { id: documentoIdSalvo, acao: 'criar' });
    await depoisDeSalvarUpload(documentoIdSalvo, posSalvar); // v2.26.0 (D2)
}

function marcarErroConfirmacao(msg) {
    const el = document.getElementById('uc-status');
    el.textContent = '⚠️ ' + msg;
    el.style.color = 'var(--danger)';
}

// v1.9.0 (06/09/2026) — ANEXO PROGRAMÁTICO: guarda um File no Cofre já
// vinculado a uma entidade, sem abrir o sheet de upload. Usado pelo
// reajuste contratual (index.html v1.133). Mesmo caminho de salvarUpload():
// hash → storage → cofre_documentos → cofre_documento_vinculos. Categoria:
// a que casar com `categoriaSugerida` (regex no nome), senão a primeira.
export async function anexarArquivoEntidade(entidadeTipo, entidadeId, arquivo, opts = {}) {
    if (!arquivo) throw new Error('Sem arquivo.');
    const hash = await api.calcularHashSha256(arquivo);
    const documentoId = crypto.randomUUID();
    const storagePath = api.montarStoragePath(estado.clienteId, documentoId, arquivo.name);
    await api.uploadArquivoDocumento(storagePath, arquivo);
    const cats = estado.categorias || [];
    const rx = opts.categoriaSugerida ? new RegExp(opts.categoriaSugerida, 'i') : null;
    const cat = (rx && cats.find(c => rx.test(c.nome))) || cats.find(c => /contrato/i.test(c.nome)) || cats[0];
    try {
        await api.inserirDocumento({
            id: documentoId, cliente_id: estado.clienteId, nome_original: arquivo.name, nome_exibicao: opts.nome || arquivo.name,
            bucket: 'cofre-documentos', storage_path: storagePath, mime_type: arquivo.type, extensao: (arquivo.name.split('.').pop() || '').toLowerCase(),
            tamanho_bytes: arquivo.size, hash_sha256: hash, categoria_id: cat ? cat.id : null,
            descricao: opts.descricao || null, tags: [], data_documento: opts.dataDocumento || null, validade_em: null,
            nivel_acesso: 'empresa', origem: 'app', status: 'ativo', criado_por: estado.pessoa.id,
        });
    } catch (err) { await api.removerArquivoDocumento(storagePath); throw err; }
    await api.inserirVinculo(estado.clienteId, documentoId, entidadeTipo, entidadeId, true, estado.pessoa.id);
    try { estado.documentos = await api.listarDocumentos(estado.clienteId); } catch (e) { /* lista atualiza no próximo boot */ }
    return documentoId;
}
// ============================================================================
// "VINCULAR AGORA" — documento já salvo em triagem, sem passar de novo pelo
// upload (lacuna identificada em produção, 20/08/2026: antes não existia
// nenhum caminho pra resolver o vínculo de um documento que já tinha
// ficado em triagem).
// ============================================================================
let vinculoAgoraEscolhido = null;

export function abrirVincularAgora() {
    document.getElementById('fd-vincular-agora-form').classList.remove('hidden');
    document.getElementById('fd-va-tipo').value = 'empresa';
    document.getElementById('fd-va-busca').classList.add('hidden');
    document.getElementById('fd-va-candidatos').innerHTML = '';
    vinculoAgoraEscolhido = null;
}
export function fecharVincularAgora() {
    document.getElementById('fd-vincular-agora-form').classList.add('hidden');
}

export async function aoMudarTipoVinculoAgora() {
    const tipo = document.getElementById('fd-va-tipo').value;
    const buscaEl = document.getElementById('fd-va-busca');
    vinculoAgoraEscolhido = tipo === 'empresa' ? { tipo: 'empresa', id: null, nome: 'Empresa (geral)' } : null;
    document.getElementById('fd-va-candidatos').innerHTML = '';
    // FIX 17/09/2026 — mesma troca do upload (ver aoMudarTipoVinculoUpload):
    // "imovel" saiu do select, "contrato" entrou.
    if (tipo === 'ativo' || tipo === 'contrato') {
        buscaEl.classList.remove('hidden');
        buscaEl.value = '';
        buscaEl.placeholder = tipo === 'ativo' ? 'Digite o nome do ativo…' : 'Digite o nome do locatário…';
        buscaEl.oninput = debounce(async () => {
            const termo = buscaEl.value;
            if (termo.trim().length < 2) { document.getElementById('fd-va-candidatos').innerHTML = ''; return; }
            const candidatos = tipo === 'ativo' ? await api.buscarCandidatosAtivo(estado.clienteId, termo) : await api.buscarCandidatosContrato(estado.clienteId, termo);
            document.getElementById('fd-va-candidatos').innerHTML = candidatos.map(c => {
                const nome = rotuloCandidatoVinculo(tipo, c);
                return `<button type="button" data-action="escolher-candidato-vincular-agora" data-tipo="${tipo}" data-id="${c.id}" data-nome="${escapeHtml(nome)}" class="w-full text-left text-xs border-2 border-slate-200 rounded-lg p-2">${escapeHtml(nome)}</button>`;
            }).join('') || `<p class="text-xs" style="color:var(--sage)">Nada encontrado.</p>`;
        }, 250);
    } else {
        buscaEl.classList.add('hidden');
    }
}

export function escolherCandidatoVincularAgora(tipo, id, nome) {
    vinculoAgoraEscolhido = { tipo, id, nome };
    document.getElementById('fd-va-candidatos').innerHTML = `<div class="raiz-bloco-interno text-xs">✅ ${escapeHtml(nome)}</div>`;
}

export async function confirmarVincularAgora() {
    if (!vinculoAgoraEscolhido) { mostrarToast('Escolha uma opção antes de confirmar.', 'aviso'); return; }
    try {
        await api.inserirVinculo(estado.clienteId, docAtualId, vinculoAgoraEscolhido.tipo, vinculoAgoraEscolhido.id, true, estado.pessoa.id);
        mostrarToast('Documento vinculado ✅');
        fecharVincularAgora();
        window.dispatchEvent(new CustomEvent('cofre:recarregar-documentos'));
        // v2.3.0 — a tela de Alertas e o card da Visão Geral mostram os
        // pendentes de vínculo: some da lista assim que resolve.
        window.dispatchEvent(new CustomEvent('cofre:triagem-resolvida', { detail: { documentoId: docAtualId } }));
        await abrirFichaDocumento(docAtualId);
    } catch (err) {
        mostrarToast('Erro ao vincular: ' + err.message, 'erro');
    }
}

// ============================================================================
export async function abrirFichaDocumento(id) {
    const d = estado.documentos.find(x => x.id === id) || await api.buscarDocumentoPorId(id);
    if (!d) { mostrarToast('Documento não encontrado.', 'erro'); return; }
    docAtualId = id;

    // FIX 17/09/2026 — mesma causa do bug do sheet "Categorizar" vazio
    // (achado real, Nicola): abrindo a ficha pela aba Ativos > Anexos, sem
    // passar antes pelo fluxo de upload ou pela navegação do módulo Cofre
    // (os 2 únicos lugares que garantiam estado.categorias carregado),
    // "Sem categoria" aparecia aqui mesmo quando o documento TINHA
    // categoria salva no banco — o .find() abaixo batia num array vazio.
    if (!estado.categorias?.length) {
        try { estado.categorias = await api.listarCategorias(estado.clienteId); }
        catch (e) { console.warn('categorias (ficha do documento):', e.message); }
    }

    document.getElementById('fd-nome').textContent = d.nome_exibicao;

    const statusVinculo = classificarStatusVinculo(d.cofre_documento_vinculos);
    const cat = (estado.categorias || []).find(c => c.id === d.categoria_id);
    document.getElementById('fd-contexto-label').textContent = cat ? cat.nome : 'Sem espécie';
    // v2.25.0 — caminho do documento: tipo · subtipo · espécie
    if (!subtiposControle) {
        try { subtiposControle = await api.listarCatalogoSubtipos(); }
        catch (e) { console.warn('catálogo (ficha do documento):', e.message); }
    }
    const subDoc = d.subtipo_codigo ? (subtiposControle || []).find(x => x.codigo === d.subtipo_codigo) : null;
    const partesCaminho = [subDoc?.tipo ? rotuloTipoControle(subDoc.tipo) : '', subDoc?.nome || '', cat?.nome || ''].filter(Boolean);
    let fdCaminho = document.getElementById('fd-caminho');
    if (!fdCaminho) {
        fdCaminho = document.createElement('div');
        fdCaminho.id = 'fd-caminho';
        fdCaminho.className = 'rz-chips';
        document.getElementById('fd-chips')?.insertAdjacentElement('beforebegin', fdCaminho);
    }
    fdCaminho.innerHTML = partesCaminho.map(p => `<span class="rz-chip">${escapeHtml(p)}</span>`).join('');
    fdCaminho.classList.toggle('hidden', !partesCaminho.length);

    const dias = diasAte(d.validade_em);
    const chip = chipVencimento(dias);
    let chips = `<span class="${classeBadgeVinculo(statusVinculo)}">${escapeHtml(rotuloStatusVinculo(statusVinculo))}</span>`;
    if (d.nivel_acesso === 'restrito') chips += `<span class="${BADGE_ALERTA}">Restrito</span>`;
    if (d.arquivo_mantido === false) chips += `<span class="${BADGE_NEUTRO}">Só dados</span>`; // v2.0.0 (A.12)
    if (d.vencido_no_upload || (d.validade_em && d.validade_em < new Date().toISOString().slice(0, 10))) chips += `<span class="${BADGE_ALERTA}">Vencido</span>`; // v2.1.0 (D10)
    if (chip) chips += `<span class="${chip.classe}">${escapeHtml(chip.texto)}</span>`;
    document.getElementById('fd-chips').innerHTML = chips;
    document.getElementById('fd-btn-baixar')?.classList.toggle('hidden', d.arquivo_mantido === false);

    document.getElementById('fd-meta').innerHTML = `
        <p><strong>Enviado em:</strong> ${formatarDataBR((d.criado_em || '').slice(0, 10))}</p>
        <p><strong>Tamanho:</strong> ${formatarBytes(d.tamanho_bytes)}${d.arquivo_mantido === false ? ' · <em>arquivo não armazenado — só os dados lidos</em>' : ''}</p>
        <p><strong>Origem:</strong> ${d.origem === 'bot_whatsapp' ? 'WhatsApp' : 'App'}</p>
        ${d.descricao ? `<p><strong>Descrição:</strong> ${escapeHtml(d.descricao)}</p>` : ''}
    `;

    const vincs = d.cofre_documento_vinculos || [];
    const emTriagem = vincs.length === 0;
    document.getElementById('fd-vincular-agora-wrapper').classList.toggle('hidden', !emTriagem);
    document.getElementById('fd-btn-vincular').classList.toggle('hidden', !emTriagem);
    document.getElementById('fd-vincular-agora-form').classList.add('hidden');
    if (vincs.length === 0) {
        document.getElementById('fd-vinculos').innerHTML = `<span class="text-xs" style="color:var(--sage)">Nenhum — este documento está em triagem.</span>`;
    } else {
        const refs = vincs.filter(v => v.entidade_id).map(v => ({ tipo: v.entidade_tipo, id: v.entidade_id }));
        const nomes = refs.length ? await api.resolverNomesDeEntidades(estado.clienteId, refs) : new Map();
        document.getElementById('fd-vinculos').innerHTML = vincs.map(v => {
            if (v.entidade_tipo === 'empresa' || !v.entidade_id) return `<span class="${BADGE_NEUTRO}">Empresa (geral)</span>`;
            const info = nomes.get(`${v.entidade_tipo}:${v.entidade_id}`);
            const nome = info?.nome || v.entidade_tipo;
            return `<button data-action="ir-para-vinculo" data-tipo="${v.entidade_tipo}" data-id="${v.entidade_id}" class="${BADGE_NEUTRO}" style="cursor:pointer">${escapeHtml(info?.subtitulo || v.entidade_tipo)} · ${escapeHtml(nome)}</button>`;
        }).join('');
    }

    document.getElementById('fd-status').textContent = '';
    abrirModal('modal-ficha-doc');
}

export function fecharFichaDoc() { fecharModal('modal-ficha-doc'); }

export async function irParaVinculo(tipo, id) {
    fecharFichaDoc();
    if (tipo === 'ativo') { window.dispatchEvent(new CustomEvent('cofre:abrir-ativo', { detail: { id } })); return; }
    if (tipo === 'imovel') { window.dispatchEvent(new CustomEvent('cofre:navegar-contexto', { detail: { tipo: 'imovel', ref: id } })); return; }
    mostrarToast('Esse vínculo ainda não tem ficha própria no Cofre.', 'aviso');
}

export async function baixarDocumentoAtual() {
    const d = estado.documentos.find(x => x.id === docAtualId) || await api.buscarDocumentoPorId(docAtualId);
    if (!d) return;
    if (d.arquivo_mantido === false) { mostrarToast('Este documento foi guardado só com os dados — o arquivo não está armazenado.', 'aviso'); return; }
    try {
        const url = await api.gerarSignedUrl(d.bucket, d.storage_path, 120);
        window.open(url, '_blank');
        await api.registrarLogAcessos(estado.clienteId, estado.pessoa.id, 'cofre.download', { documento_id: d.id });
    } catch (err) {
        mostrarToast('Erro ao gerar link de download: ' + err.message, 'erro');
    }
}

// REMOVIDO (29/08/2026, pedido explícito — "não to vendo utilidade nesta
// função de arquivar um documento"): arquivarDocumentoAtual() e o botão
// correspondente na ficha do documento saíram. Escopo só de DOCUMENTO —
// arquivar Ativo (cofre-ativos.js) e arquivar Foto (cofre-api.js) não
// foram tocados, são funcionalidades separadas que o pedido não menciona.
// status='arquivado' continua um valor válido no CHECK constraint de
// cofre_documentos (documentos já arquivados antes continuam aparecendo
// normalmente) — só não tem mais como CRIAR um novo a partir da ficha.

// v2.18.0 (pedido explícito, 18/09/2026: "Nos detalhes do arquivo deve ser
// possivel editar o nome. Tanto nos anexos de contrato, quanto ativos, itens
// de controle e os demais") — mesmo abrirSheetForm de sempre, 1 campo só
// ("Nome de exibição *", mesma gramática .rz-f de fa-editar-nome em
// cofre-ativos.js/alternarEditarAtivo — não inventei padrão novo). Grava
// nome_exibicao via api.atualizarDocumento() (já genérica, usada por
// categorizarDocumentoAtual/excluirDocumentoAtual logo abaixo — nenhuma
// função nova precisou entrar em cofre-api.js). abrirFichaDocumento() é o
// único fluxo que monta a Ficha do Documento pros 3 contextos citados pelo
// Nicola (contrato/ativo/item de controle todos passam por aqui), então
// isto já cobre os 3 de uma vez só.
export async function editarNomeDocumentoAtual() {
    if (!docAtualId) return;
    if (typeof window.abrirSheetForm !== 'function') { mostrarToast('Disponível só dentro do app principal.', 'erro'); return; }
    const d = estado.documentos.find(x => x.id === docAtualId) || await api.buscarDocumentoPorId(docAtualId);
    if (!d) { mostrarToast('Documento não encontrado.', 'erro'); return; }
    window.abrirSheetForm({
        titulo: 'Editar nome do documento',
        sub: d.nome_exibicao,
        corpo: `<div class="rz-f"><label>Nome de exibição <i>*</i></label><input type="text" id="fd-editar-nome" maxlength="200" value="${escapeHtml(d.nome_exibicao)}"></div>`,
        rotuloSalvar: 'Salvar',
        aoSalvar: async () => {
            const nome = document.getElementById('fd-editar-nome').value.trim();
            if (!nome) { mostrarToast('Nome não pode ficar vazio.', 'erro'); return false; }
            if (nome.length > 200) { mostrarToast('Nome muito longo (máx. 200 caracteres).', 'erro'); return false; }
            if (nome === d.nome_exibicao) return true; // nada mudou, só fecha o sheet
            try {
                await api.atualizarDocumento(docAtualId, { nome_exibicao: nome });
                d.nome_exibicao = nome;
                await api.registrarLogAcessos(estado.clienteId, estado.pessoa.id, 'cofre.editar', { documento_id: docAtualId, acao: 'editar_nome_documento' });
                mostrarToast('Nome atualizado.');
                window.dispatchEvent(new CustomEvent('cofre:recarregar-documentos'));
                emitirEscrita('documento', { id: docAtualId, acao: 'editar-nome' }); // v2.21.0
                await abrirFichaDocumento(docAtualId);
            } catch (e) { mostrarToast('Erro: ' + e.message, 'erro'); return false; }
        }
    });
}

// v1.x (03/09, Nicola: "deve ter opção de categorizar um documento sem
// categoria") — sheet com as categorias do cliente; grava categoria_id e
// recarrega a ficha + listas (cofre:recarregar-documentos).
export async function categorizarDocumentoAtual() {
    if (!docAtualId) return;
    if (typeof window.abrirSheetAcoes !== 'function') { mostrarToast('Disponível só dentro do app principal.', 'erro'); return; }
    // FIX 17/09/2026 — achado real (Nicola): abrindo a ficha de um documento
    // já existente direto pela aba Ativos > Anexos (sem passar pelo fluxo de
    // upload antes, que é quem chama carregarApoioUpload() e popula
    // estado.categorias), o sheet "Categorizar" abria com a lista de ações
    // vazia (nenhuma categoria carregada ainda) — visualmente um sheet
    // minúsculo, só cabeçalho, sem nada pra tocar.
    if (!estado.categorias?.length) {
        try { estado.categorias = await api.listarCategorias(estado.clienteId); }
        catch (e) { mostrarToast('Erro ao carregar categorias: ' + e.message, 'erro'); return; }
    }
    const d = estado.documentos.find(x => x.id === docAtualId);
    window.abrirSheetAcoes({ titulo: 'Espécie do documento', sub: d?.nome_exibicao || '', acoes: (estado.categorias || []).map(c => ({ // v2.25.0
        icone: c.id === d?.categoria_id ? 'check' : 'tag', titulo: c.nome, sub: c.id === d?.categoria_id ? 'Espécie atual' : '',
        aoTocar: async () => {
            try {
                await api.atualizarDocumento(docAtualId, { categoria_id: c.id });
                if (d) d.categoria_id = c.id;
                mostrarToast(`Espécie: ${c.nome}`);
                window.dispatchEvent(new CustomEvent('cofre:recarregar-documentos'));
                emitirEscrita('documento', { id: docAtualId, acao: 'categorizar' }); // v2.21.0
                await abrirFichaDocumento(docAtualId);
            } catch (e) { mostrarToast('Erro: ' + e.message, 'erro'); }
        }
    })) });
}

export async function excluirDocumentoAtual() {
    if (!await perguntar({ titulo: 'Excluir documento?', impacto: 'A exclusão fica registrada e não dá para desfazer pelo app.', destrutivo: true, rotuloConfirmar: 'Excluir documento' })) return;
    const d = estado.documentos.find(x => x.id === docAtualId);
    try {
        await api.atualizarDocumento(docAtualId, { status: 'excluido', excluido_em: new Date().toISOString(), excluido_por: estado.pessoa.id });
        await api.registrarLogAcessos(estado.clienteId, estado.pessoa.id, 'cofre.excluir', { documento_id: docAtualId, nome: d?.nome_exibicao });
        mostrarToast('Documento excluído.');
        fecharFichaDoc();
        window.dispatchEvent(new CustomEvent('cofre:recarregar-documentos'));
        emitirEscrita('documento', { id: docAtualId, acao: 'excluir' }); // v2.21.0
    } catch (err) { mostrarToast('Erro: ' + err.message, 'erro'); }
}

// ============================================================================
// v2.11.0 — DOCUMENTOS ARQUIVADOS (status='excluido'): ver, restaurar,
// vincular ou excluir de vez. Modal simples (mesmo molde de modal-categorias/
// modal-subtipos-controle), aberto pelo menu Conta.
// ============================================================================
let arquivadosCache = [];

export async function abrirDocumentosArquivados() {
    document.getElementById('doc-arq-lista').innerHTML = rzSk('linhas', 3);
    abrirModal('modal-documentos-arquivados');
    try {
        arquivadosCache = await api.listarDocumentosArquivados(estado.clienteId);
        renderizarDocumentosArquivados();
    } catch (err) {
        document.getElementById('doc-arq-lista').innerHTML = `<p class="text-xs" style="color:var(--danger)">Erro ao carregar: ${escapeHtml(err.message)}</p>`;
    }
}
export function fecharDocumentosArquivados() { fecharModal('modal-documentos-arquivados'); }

function renderizarDocumentosArquivados() {
    const el = document.getElementById('doc-arq-lista');
    if (!el) return;
    if (!arquivadosCache.length) {
        el.innerHTML = `<p class="text-xs" style="color:var(--sage)">Nenhum documento arquivado.</p>`;
        return;
    }
    el.innerHTML = arquivadosCache.map(d => {
        const semVinculo = !d.cofre_documento_vinculos || d.cofre_documento_vinculos.length === 0;
        return `<div class="raiz-bloco-interno" style="margin-bottom:6px">
            <div class="flex items-start justify-between gap-2">
                <div class="min-w-0"><b class="text-xs block truncate">${escapeHtml(d.nome_exibicao)}</b>
                    <span class="text-[10px]" style="color:var(--sage)">Arquivado em ${formatarDataBR((d.excluido_em || '').slice(0, 10))}${semVinculo ? ' · sem vínculo' : ''}</span></div>
            </div>
            <div class="flex gap-1.5 mt-1.5 flex-wrap">
                <button type="button" data-action="restaurar-documento-arquivado" data-id="${d.id}" class="text-[11px] font-semibold px-2 py-1 rounded-lg" style="background:var(--pine);color:#fff">Restaurar</button>
                ${semVinculo ? `<button type="button" data-action="vincular-documento-arquivado" data-id="${d.id}" class="text-[11px] font-semibold px-2 py-1 rounded-lg" style="background:var(--line);color:var(--ink)">Vincular</button>` : ''}
                <button type="button" data-action="excluir-documento-arquivado-de-vez" data-id="${d.id}" class="text-[11px] font-semibold px-2 py-1 rounded-lg" style="background:#fef2f2;color:var(--danger)">Excluir de vez</button>
            </div>
        </div>`;
    }).join('');
}

export async function restaurarDocumentoArquivado(id) {
    const d = arquivadosCache.find(x => x.id === id);
    try {
        await api.restaurarDocumento(id);
        await api.registrarLogAcessos(estado.clienteId, estado.pessoa.id, 'cofre.restaurar', { documento_id: id, nome: d?.nome_exibicao });
        mostrarToast('Documento restaurado.');
        arquivadosCache = arquivadosCache.filter(x => x.id !== id);
        renderizarDocumentosArquivados();
        window.dispatchEvent(new CustomEvent('cofre:recarregar-documentos'));
    } catch (err) { mostrarToast('Erro: ' + err.message, 'erro'); }
}

// Restaura (documento arquivado sem vínculo precisa estar 'ativo' pra entrar
// no fluxo normal de vínculo) e reabre a ficha já no modo "vincular agora".
export async function vincularDocumentoArquivado(id) {
    try {
        await api.restaurarDocumento(id);
        arquivadosCache = arquivadosCache.filter(x => x.id !== id);
        renderizarDocumentosArquivados();
        fecharDocumentosArquivados();
        estado.documentos = await api.listarDocumentos(estado.clienteId);
        await abrirFichaDocumento(id);
        abrirVincularAgora();
        window.dispatchEvent(new CustomEvent('cofre:recarregar-documentos'));
        emitirEscrita('documento', { id, acao: 'vincular' }); // v2.21.0
    } catch (err) { mostrarToast('Erro: ' + err.message, 'erro'); }
}

export async function excluirDocumentoArquivadoDeVez(id) {
    const d = arquivadosCache.find(x => x.id === id);
    if (!await perguntar({ titulo: 'Excluir de vez?', impacto: `"${d?.nome_exibicao || 'Este documento'}" e o arquivo guardado somem. Não dá para desfazer.`, destrutivo: true, rotuloConfirmar: 'Excluir de vez' })) return;
    try {
        await api.registrarLogAcessos(estado.clienteId, estado.pessoa.id, 'cofre.excluir_de_vez', { documento_id: id, nome: d?.nome_exibicao });
        await api.excluirDocumentoDeVez(id);
        mostrarToast('Documento excluído de vez.');
        arquivadosCache = arquivadosCache.filter(x => x.id !== id);
        renderizarDocumentosArquivados();
        emitirEscrita('documento', { id, acao: 'excluir-definitivo' }); // v2.21.0
    } catch (err) { mostrarToast('Erro: ' + err.message, 'erro'); }
}

// ============================================================================
// BUSCA GLOBAL (secundária — Adendo §3)
// ============================================================================
export function abrirBuscaGlobal() {
    document.getElementById('busca-global-input').value = '';
    document.getElementById('busca-global-status').value = '';
    renderizarBuscaGlobal();
    abrirModal('modal-busca-global');
    document.getElementById('busca-global-input').focus();
}
export function fecharBuscaGlobal() { fecharModal('modal-busca-global'); }

export function renderizarBuscaGlobal() {
    const termo = (document.getElementById('busca-global-input').value || '').toLowerCase().trim();
    const statusFiltro = document.getElementById('busca-global-status').value;
    let lista = estado.documentos.filter(d => {
        if (termo && !`${d.nome_exibicao} ${d.descricao || ''}`.toLowerCase().includes(termo)) return false;
        if (statusFiltro && classificarStatusVinculo(d.cofre_documento_vinculos) !== statusFiltro) return false;
        return true;
    }).slice(0, 30);
    document.getElementById('busca-global-resultado').innerHTML = lista.length
        ? lista.map(docResultadoBuscaHtml).join('')
        : `<p class="text-xs text-center py-6" style="color:var(--sage)">Nada encontrado.</p>`;
    refrescarIcones();
}

function docResultadoBuscaHtml(d) {
    const status = classificarStatusVinculo(d.cofre_documento_vinculos);
    return `<div class="card-doc p-3 cursor-pointer" data-action="abrir-documento" data-id="${d.id}">
        <div class="flex items-center justify-between">
            <p class="text-sm font-semibold truncate">${escapeHtml(d.nome_exibicao)}</p>
            <span class="${classeBadgeVinculo(status)}">${escapeHtml(rotuloStatusVinculo(status))}</span>
        </div>
    </div>`;
}

// ============================================================================
// CATEGORIAS (configuração — Adendo §3)
// ============================================================================
export function abrirConfiguracoes() {
    renderizarCategorias();
    abrirModal('modal-categorias');
}
export function fecharCategorias() { fecharModal('modal-categorias'); }

export async function salvarCategoria() {
    const nome = document.getElementById('cat-nome').value.trim();
    if (!nome) return;
    try {
        await api.criarCategoria(estado.clienteId, nome, document.getElementById('cat-grupo').value.trim(), estado.categorias.length + 1);
        mostrarToast('Categoria criada ✅');
        document.getElementById('cat-nome').value = ''; document.getElementById('cat-grupo').value = '';
        estado.categorias = await api.listarCategorias(estado.clienteId);
        renderizarCategorias();
        // v2.21.0 — isto grava uma CATEGORIA do catálogo/configuração
        // (api.criarCategoria), não a categorização de um documento
        // específico (isso é categorizarDocumentoAtual, entidade
        // 'documento' acima) — entidade separada de propósito.
        emitirEscrita('config-documento', { acao: 'criar-categoria' });
    } catch (err) { mostrarToast('Erro: ' + err.message, 'erro'); }
}

function renderizarCategorias() {
    document.getElementById('categorias-lista').innerHTML = estado.categorias.map(c =>
        `<div class="raiz-bloco-interno flex items-center justify-between"><span class="text-sm">${escapeHtml(c.nome)}</span><span class="text-xs" style="color:var(--sage)">${escapeHtml(c.grupo || '')}</span></div>`
    ).join('') || `<p class="text-xs" style="color:var(--sage)">Nenhuma categoria.</p>`;
}

// ============================================================================
// BOX "DOCUMENTOS DA EMPRESA" (aba Minha Empresa do App) — v2.17.0
// (pedido explícito, 18/09/2026: "no menu empresa do app, deve ter um box
// pra anexar documentos... com as mesmas funções de um documento de
// contrato ou de ativo" — escolheu o padrão "Box simples", igual ao do
// Item de Controle). ATENÇÃO ARQUITETURA: tab-minha-empresa é uma aba de
// NÍVEL DE APP (switchTab), montada por dev_carregarDadosEmpresa() em
// index.html — igual tab-contratos, NÃO é uma tela dentro de tab-ativos
// (Cofre). Ao contrário do box do Item de Controle (cofre-controles.js,
// só existe dentro da ficha do Cofre, depois do Cofre já ter dado boot),
// aqui não dá pra supor `estado.clienteId`/`estado.pessoa`/o modal "Ficha
// do documento" (fd-*) — todos só existem depois de montarAtivosTab()
// rodar de verdade (a pessoa pode abrir "Minha empresa" direto, sem nunca
// ter tocado em Ativos — confirmado lendo index.html/ativos-boot.js: cada
// aba carrega o próprio módulo sob demanda, uma independente da outra).
// Por isso este box usa CLIENTE_ID_SUPABASE/pessoaIdLogada (globais do
// script clássico de index.html, mesmo padrão já usado por contratos.js —
// ver comentário no topo desse arquivo) em vez de `estado`, e abre o
// arquivo com URL assinada direto (api.gerarSignedUrl) em vez da Ficha do
// Documento (fd-*, DOM injetado só pelo Cofre) — mesma solução que
// contratos.js já usa pro card "Anexos" do Contrato, pelo mesmo motivo.
// Vínculo: entidade_tipo='empresa', entidade_id=null — o MESMO padrão já
// usado pelo "Vincular a › Empresa" do upload livre (nenhuma migration
// nova). Excluir aqui só remove o VÍNCULO (api.removerVinculo, igual ao
// Item de Controle) — o documento nunca é apagado de vez, continua no
// Cofre ("Em triagem" se não sobrar nenhum outro vínculo).
// ============================================================================
let __docsEmpresaCache = [];
let __meBoxWired = false;

async function documentosDaEmpresa() {
    const todos = await api.listarDocumentos(CLIENTE_ID_SUPABASE);
    return todos.filter(d => (d.cofre_documento_vinculos || []).some(v => v.entidade_tipo === 'empresa'));
}

export async function renderizarDocumentosEmpresa() {
    const el = document.getElementById('me-documentos');
    if (!el || !CLIENTE_ID_SUPABASE) return;
    try {
        __docsEmpresaCache = await documentosDaEmpresa();
    } catch (err) {
        el.innerHTML = `<p class="text-xs text-red-500">Não consegui carregar os documentos.</p>`;
        console.warn('Falha ao carregar documentos da empresa (não bloqueando):', err.message);
        return;
    }
    el.innerHTML = __docsEmpresaCache.length ? __docsEmpresaCache.map(d => {
        const vinculo = (d.cofre_documento_vinculos || []).find(v => v.entidade_tipo === 'empresa');
        return `<div class="rz-row">
            <div class="rz-ic"><i data-lucide="${(d.mime_type || '').startsWith('image/') ? 'image' : 'file-text'}"></i></div>
            <div class="rz-tx rz-link" data-me-abrir="${d.id}"><b>${escapeHtml(d.nome_exibicao || 'Documento')}</b><span>${d.criado_em ? formatarDataBR(String(d.criado_em).slice(0, 10)) : ''}</span></div>
            <button type="button" data-me-excluir="${vinculo?.id || ''}" title="Remover da empresa" class="rz-ico-btn" style="width:36px;height:36px"><i data-lucide="x" style="width:16px;height:16px;color:var(--muted)"></i></button>
        </div>`;
    }).join('') : `<div class="rz-empty"><div class="rz-ic"><i data-lucide="file-plus-2"></i></div><p>Nenhum documento anexado. CNPJ, contrato social ou outro documento da empresa fica guardado aqui.</p></div>`;
    el.querySelectorAll('[data-me-abrir]').forEach(row => row.addEventListener('click', () => abrirDocumentoEmpresa(row.dataset.meAbrir)));
    el.querySelectorAll('[data-me-excluir]').forEach(btn => btn.addEventListener('click', () => excluirDocumentoDaEmpresa(btn.dataset.meExcluir)));
    refrescarIcones();
}

async function abrirDocumentoEmpresa(documentoId) {
    const d = __docsEmpresaCache.find(x => x.id === documentoId);
    if (!d) return;
    try {
        const url = await api.gerarSignedUrl(d.bucket || 'cofre-documentos', d.storage_path);
        window.open(url, '_blank', 'noopener');
    } catch (err) { mostrarToast('Não consegui abrir o documento: ' + (err.message || String(err)), 'erro'); }
}

async function excluirDocumentoDaEmpresa(vinculoId) {
    if (!vinculoId) { mostrarToast('Vínculo não encontrado.', 'erro'); return; }
    // v2.23.0 (F0.2b) — desvincular é reversível: sem pergunta, com "Desfazer" no aviso.
    try {
        const linhaAntes = await api.lerVinculo(vinculoId);
        await api.removerVinculo(vinculoId);
        avisarComDesfazer('Documento tirado da empresa. Ele continua no Cofre.', async () => {
            try {
                await api.restaurarVinculo(linhaAntes);
                await renderizarDocumentosEmpresa();
                window.dispatchEvent(new CustomEvent('cofre:recarregar-documentos'));
                mostrarToast('Documento de volta à empresa.');
            } catch (e) { mostrarToast('Não consegui desfazer: ' + e.message, 'erro'); }
        });
        await renderizarDocumentosEmpresa();
        window.dispatchEvent(new CustomEvent('cofre:recarregar-documentos'));
    } catch (err) { mostrarToast('Erro: ' + err.message, 'erro'); }
}

async function carregarNovoDocumentoEmpresa(file) {
    if (!file || !CLIENTE_ID_SUPABASE) return;
    const documentoId = crypto.randomUUID();
    const storagePath = api.montarStoragePath(CLIENTE_ID_SUPABASE, documentoId, file.name);
    try {
        await api.uploadArquivoDocumento(storagePath, file);
        try {
            await api.inserirDocumento({
                id: documentoId, cliente_id: CLIENTE_ID_SUPABASE, nome_original: file.name, nome_exibicao: file.name,
                bucket: 'cofre-documentos', storage_path: storagePath, mime_type: api.mimeDoArquivo(file),
                extensao: (file.name.split('.').pop() || '').toLowerCase(), origem: 'app', status: 'ativo',
                criado_por: pessoaIdLogada || null,
            });
        } catch (err) { await api.removerArquivoDocumento(storagePath); throw err; }
        await api.inserirVinculo(CLIENTE_ID_SUPABASE, documentoId, 'empresa', null, true, pessoaIdLogada || null);
        mostrarToast('Documento carregado ✅');
        await renderizarDocumentosEmpresa();
        window.dispatchEvent(new CustomEvent('cofre:recarregar-documentos'));
    } catch (err) {
        mostrarToast('Não consegui carregar o documento: ' + (err.message || String(err)), 'erro');
    }
}

// Chamado por dev_carregarDadosEmpresa() (index.html) toda vez que a aba
// "Minha empresa" é aberta — mesmo padrão de "chamar de novo é barato, a
// função se protege sozinha" já usado por montarAtivosTab(). Os listeners
// do botão "+"/input de arquivo só são presos 1 vez (__meBoxWired).
export async function montarBoxDocumentosEmpresa() {
    const btnAdd = document.getElementById('me-doc-add');
    const input = document.getElementById('me-doc-input');
    if (!__meBoxWired && btnAdd && input) {
        btnAdd.addEventListener('click', () => input.click());
        input.addEventListener('change', async () => {
            const file = input.files[0];
            input.value = '';
            if (file) await carregarNovoDocumentoEmpresa(file);
        });
        __meBoxWired = true;
    }
    await renderizarDocumentosEmpresa();
}

// Independente do "telaAtual" do Cofre (cofre-app.js) — este box vive fora
// da árvore de telas do Cofre, então escuta o evento direto, do mesmo jeito
// que contratos.js já faz pro card Anexos do Contrato. Checagem por DOM
// (em vez de guardar um "aba ativa" à parte) — sem custo quando a aba
// Minha Empresa não está montada.
// v2.21.0 (Fase 1 do wrapper de escrita) — escuta emitirEscrita('documento',
// ...) 1x por carga do módulo (guarda por window.*, mesmo padrão do piloto
// em index.html/cofre-ativos.js v1.59.0 — aqui é defensivo: um módulo ES só
// roda uma vez mesmo, mas segue a convenção pedida). Sem um único "ponto de
// montagem" da tela de Documentos (Home/lista/ficha variam conforme a
// navegação do Cofre — cofre-navegacao.js), o alvo é o mesmo já coberto pelo
// listener de 'cofre:recarregar-documentos' logo abaixo (box "Documentos da
// empresa") + a Ficha do Documento (#modal-ficha-doc), SE estiver aberta com
// o mesmo id — guarda por modal visível pra não reabrir uma ficha já fechada.
if (!window.__rzListenerEscritaDocumentoLigado) {
    window.__rzListenerEscritaDocumentoLigado = true;
    aoEscrever('documento', (detalhe) => {
        if (document.getElementById('me-documentos')) renderizarDocumentosEmpresa();
        const fichaAberta = !document.getElementById('modal-ficha-doc')?.classList.contains('hidden');
        if (fichaAberta && docAtualId && (!detalhe?.id || detalhe.id === docAtualId)) {
            abrirFichaDocumento(docAtualId);
        }
    });
}

window.addEventListener('cofre:recarregar-documentos', () => {
    if (document.getElementById('me-documentos')) renderizarDocumentosEmpresa();
});


// v2.24.0 (UX F1.4a, demanda c71f617c) — esqueleto no lugar de "Carregando…" (UXR, REGRAS §8).
// window.rzSkeleton vive no index.html; no cofre.html avulso cai no texto de antes.
function rzSk(tipo, n) {
    return (typeof window !== 'undefined' && typeof window.rzSkeleton === 'function')
        ? window.rzSkeleton(tipo, n)
        : '<p class="rz-desc">Carregando…</p>';
}
