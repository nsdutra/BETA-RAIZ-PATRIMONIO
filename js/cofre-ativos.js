// ============================================================================
// cofre-ativos.js — Raiz Patrimônio · Cofre de Documentos
// Versão: 1.39.0 · 16/09/2026
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
// v1.36.0 — PLANO_IMPLEMENTACAO v1.0, etapa E15.2 ("A2"), conclusão
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
export const VERSAO = '1.39.0'; // v-check (16/09/2026): lido por Dev › Versões — manter igual ao header
import { estado } from './cofre-estado.js';
import * as api from './cofre-api.js';
import { mostrarToast, refrescarIcones, alternarToggle, abrirModal, fecharModal, modalGenerico } from './cofre-ui.js';
import { mudarTela } from './cofre-navegacao.js';
import {
    escapeHtml, formatarDataBR, diasAte, chipVencimento, mascarar,
    rotuloTipoAtivo, iconeAtivo, validarCamposAtivo,
    obterCamposPorTipo, listarTiposPorCategoria, inicializarCatalogoTiposAtivo,
} from './cofre-validacoes.js';
import { montarControlesAtivo, aplicarMotorNoChipControles, reiniciarChipControlesDoMotor } from './cofre-controles.js';
// E6.2 — retorno usado de forma síncrona em salvarAtivo/salvarEdicaoAtivo
// (lerBlocoEndereco), por isso import estático (ver nota em technical-
// learnings: bridge window[nome] só serve fire-and-forget).
import { renderizarBlocoEndereco, lerBlocoEndereco } from './comum-endereco.js';

// E6.2 — único critério usado em todo o arquivo pra decidir se um ativo
// "imóvel" é avulso (sem tabela imoveis por trás) ou vinculado. Função só
// pra não repetir a mesma condição em 4 lugares (criar/editar/salvar/ficha).
// v2.0.0-front (E5) — 'imovel' virou 'imovel_predial' na migração da
// E4.2 fatia B.
// E15.2 (15/09/2026) — CORRIGIDO: o comentário antigo aqui dizia que
// "terreno/fazenda (imovel_territorial) nunca passaram pela tabela
// imoveis" — falso, achado ao investigar a DE_PARA_IMOVEIS_ATIVOS: 6 dos
// 104 ativos vinculados são imovel_territorial (foram cadastrados como
// "imóvel" genérico e a fatia A da E4.2 os reclassificou certo). As duas
// categorias entram na checagem agora.
function ehCategoriaImovel(tipo) {
    return tipo === 'imovel_predial' || tipo === 'imovel_territorial';
}

// Vinculado a uma linha real de `imoveis` — write-target dos blocos de
// endereço/imóvel vira `imoveis` (api.atualizarImovel), não cofre_ativos
// direto: a vitrine pública lê `imoveis` sem login (RLS ativa), tem que
// continuar a fonte de verdade até a E15.3 migrar isso.
function ehImovelVinculado(entidadeOrigemTipo) {
    return entidadeOrigemTipo === 'imovel';
}

function ehImovelAvulso(tipo, entidadeOrigemTipo) {
    return ehCategoriaImovel(tipo) && !ehImovelVinculado(entidadeOrigemTipo);
}

let ativoAtualId = null;
let _catalogoTiposAtivoCarregado = false;
let _empreendimentosCache = null; // E15.2 — lista pro seletor, invalidada ao criar um novo

// E5 — busca o catálogo (ativo_tipos + ativo_tipos_campos) uma vez por
// sessão. Falha não trava nada: obterCamposPorTipo/listarTiposPorCategoria
// já degradam sozinhas (fallback hardcoded / seletor de tipo específico
// vazio) — só loga e tenta de novo na próxima chamada.
async function garantirCatalogoTiposAtivo() {
    if (_catalogoTiposAtivoCarregado) return;
    try {
        const catalogo = await api.listarTiposAtivo(estado.clienteId);
        inicializarCatalogoTiposAtivo(catalogo);
        _catalogoTiposAtivoCarregado = true;
    } catch (e) {
        console.error('Catálogo de tipos de ativo indisponível — usando os campos padrão.', e);
    }
}

// E15.2 — mesma ideia, pro seletor de empreendimento. Falha = lista
// vazia (só "— nenhum —" / "+ Novo"), não trava o form.
async function garantirEmpreendimentos() {
    if (_empreendimentosCache !== null) return _empreendimentosCache;
    try {
        _empreendimentosCache = await api.listarEmpreendimentos(estado.clienteId);
    } catch (e) {
        console.error('Lista de empreendimentos indisponível.', e);
        _empreendimentosCache = [];
    }
    return _empreendimentosCache;
}

// ============================================================================
// LISTA (tela Ativos)
// ============================================================================
export function popularSelectTipoAtivo() {
    const sel = document.getElementById('at-tipo');
    if (!sel || sel.options.length) return;
    // v2.0.0-front (E5) — as 8 categorias macro (E4.1), não mais os 10
    // valores específicos antigos. O tipo específico (Apartamento, Carro
    // blindado...) vira o 2º seletor, #at-tipo-detalhe, populado por
    // categoria via atualizarSelectTipoDetalhe().
    sel.innerHTML = ['imovel_predial', 'imovel_territorial', 'veiculo', 'embarcacao', 'aeronave', 'vida', 'bem_valor', 'outro']
        .map(t => `<option value="${t}">${rotuloTipoAtivo(t)}</option>`).join('');
}

// E5 — popula o 2º seletor (tipo específico dentro da categoria
// escolhida) a partir do catálogo. Sem catálogo carregado ainda, ou
// categoria sem tipo cadastrado: esconde o seletor — form funciona igual
// a antes da E5, sem esse nível de detalhe.
function atualizarSelectTipoDetalhe(categoria, prefixoId, valorAtualId = null) {
    const sel = document.getElementById(`${prefixoId}tipo-detalhe`);
    const wrap = document.getElementById(`${prefixoId}tipo-detalhe-wrapper`);
    if (!sel || !wrap) return;
    const tipos = listarTiposPorCategoria(categoria);
    wrap.classList.toggle('hidden', tipos.length === 0);
    sel.innerHTML = tipos.map(t => `<option value="${t.id}"${t.id === valorAtualId ? ' selected' : ''}>${escapeHtml(t.nome)}</option>`).join('');
}

// E15.2 ("A2") — campos que a DE_PARA_IMOVEIS_ATIVOS Fase 1/2 promoveu
// pra coluna própria de cofre_ativos + empreendimento_id — NÃO são campo
// de dados_especificos, por isso não passam por obterCamposPorTipo; têm
// renderização própria, mesmo espírito do bloco de endereço.
//
// Achado no teste real do Nicola (16/09/2026): empreendimento e valor de
// referência valem pra QUALQUER ativo (Fase 1 sempre foi desenhada
// assim), não só imóvel — viraram bloco PRÓPRIO, universal, separado do
// resto (área/finalidade/situação/observação — esses sim continuam só
// categoria imóvel, não fazem sentido pra um carro).
const FINALIDADES_USO_ATIVO = [
    { v: 'uso_proprio', l: 'Uso próprio', comercial: false },
    { v: 'long_stay', l: 'Locação longa (long stay)', comercial: true },
    { v: 'short_stay', l: 'Locação curta (short stay)', comercial: true },
    { v: 'comodato', l: 'Comodato', comercial: false },
    { v: 'arrendamento', l: 'Arrendamento', comercial: true },
    { v: 'revenda', l: 'Revenda', comercial: true },
    { v: 'ocioso', l: 'Ocioso', comercial: false },
];
const SITUACOES_USO_ATIVO = [
    { v: 'disponivel', l: 'Disponível' }, { v: 'alugado', l: 'Alugado' }, { v: 'em_uso', l: 'Em uso' },
    { v: 'reservado', l: 'Reservado' }, { v: 'assinando', l: 'Assinando' }, { v: 'manutencao', l: 'Manutenção' }, { v: 'em_breve', l: 'Em breve' },
];

// Universal — qualquer tipo de ativo.
function renderizarBlocoEmpreendimentoValor(prefixo, v = {}, empreendimentos = []) {
    return `
        <div>
            <label class="text-xs font-semibold block mb-1">Empreendimento</label>
            <select id="${prefixo}empreendimento-id" onchange="window.__ativoMudarEmpreendimento('${prefixo}')" class="w-full border-2 border-slate-300 rounded-lg p-2 text-xs">
                <option value="">— nenhum —</option>
                ${empreendimentos.map(e => `<option value="${e.id}"${e.id === v.empreendimento_id ? ' selected' : ''}>${escapeHtml(e.nome)}</option>`).join('')}
                <option value="__novo__">+ Novo empreendimento</option>
            </select>
            <input type="text" id="${prefixo}empreendimento-novo-nome" placeholder="Nome do empreendimento" class="w-full border-2 border-slate-300 rounded-lg p-2 text-xs mt-1 hidden">
        </div>
        <div>
            <label class="text-xs font-semibold block mb-1">Valor de referência (R$)</label>
            <input type="number" step="0.01" id="${prefixo}valor-referencia" value="${v.valor_referencia ?? ''}" class="w-full border-2 border-slate-300 rounded-lg p-2 text-xs">
        </div>
    `;
}

window.__ativoMudarEmpreendimento = function (prefixo) {
    const sel = document.getElementById(prefixo + 'empreendimento-id');
    const input = document.getElementById(prefixo + 'empreendimento-novo-nome');
    if (input) input.classList.toggle('hidden', sel?.value !== '__novo__');
};

// find-or-create do empreendimento "novo" (se escolhido) + leitura do
// valor. Async por causa do criarEmpreendimentoRapido.
async function lerBlocoEmpreendimentoValor(prefixo, clienteId) {
    const selEmp = document.getElementById(prefixo + 'empreendimento-id');
    let empreendimentoId = selEmp ? selEmp.value : '';
    if (empreendimentoId === '__novo__') {
        const nomeNovo = document.getElementById(prefixo + 'empreendimento-novo-nome')?.value.trim();
        empreendimentoId = nomeNovo ? (await api.criarEmpreendimentoRapido(clienteId, nomeNovo)).id : '';
    }
    const valorEl = document.getElementById(prefixo + 'valor-referencia');
    const valorReferencia = valorEl?.value?.trim() ? parseFloat(valorEl.value.trim()) : null;
    return {
        empreendimento_id: empreendimentoId || null,
        valor_referencia: valorReferencia,
        valor_referencia_em: valorReferencia !== null ? new Date().toISOString().slice(0, 10) : null,
    };
}

// Só categoria imóvel. Aluguel esperado (achado no teste real: pergunta
// direta do Nicola — "qual campo é o aluguel esperado?" — resposta:
// nenhum, ele não existia) só aparece quando a finalidade de uso é
// comercial (documento DE_PARA §5: valor de aluguel é
// dados_especificos.aluguel_desejado, NUNCA imoveis.valor_mercado/
// cofre_ativos.valor_referencia — são conceitos diferentes: um é o que
// se pede pra alugar, o outro é quanto o bem vale).
function renderizarBlocoImovel(prefixo, v = {}) {
    const optSel = (val, campo) => val === (v[campo] || '') ? ' selected' : '';
    const finalidadeInfo = FINALIDADES_USO_ATIVO.find(f => f.v === (v.finalidade_uso || ''));
    const aluguelVisivel = finalidadeInfo?.comercial ? '' : ' hidden';
    return `
        <div>
            <label class="text-xs font-semibold block mb-1">Área (m²)</label>
            <input type="number" step="0.01" id="${prefixo}area-m2" value="${v.area_m2 ?? ''}" class="w-full border-2 border-slate-300 rounded-lg p-2 text-xs">
        </div>
        <div>
            <label class="text-xs font-semibold block mb-1">Finalidade de uso</label>
            <select id="${prefixo}finalidade-uso" onchange="window.__ativoMudarFinalidadeUso('${prefixo}')" class="w-full border-2 border-slate-300 rounded-lg p-2 text-xs">
                <option value=""${optSel('', 'finalidade_uso')}>— não informado —</option>
                ${FINALIDADES_USO_ATIVO.map(f => `<option value="${f.v}"${optSel(f.v, 'finalidade_uso')}>${f.l}</option>`).join('')}
            </select>
        </div>
        <div>
            <label class="text-xs font-semibold block mb-1">Situação de uso</label>
            <select id="${prefixo}situacao-uso" class="w-full border-2 border-slate-300 rounded-lg p-2 text-xs">
                <option value=""${optSel('', 'situacao_uso')}>— não informado —</option>
                ${SITUACOES_USO_ATIVO.map(s => `<option value="${s.v}"${optSel(s.v, 'situacao_uso')}>${s.l}</option>`).join('')}
            </select>
        </div>
        <div id="${prefixo}aluguel-wrapper" class="${aluguelVisivel}">
            <label class="text-xs font-semibold block mb-1">Aluguel esperado (R$)</label>
            <input type="number" step="0.01" id="${prefixo}aluguel-desejado" value="${v.dados_especificos?.aluguel_desejado ?? ''}" class="w-full border-2 border-slate-300 rounded-lg p-2 text-xs">
        </div>
        <div class="sm:col-span-2">
            <label class="text-xs font-semibold block mb-1">Observação</label>
            <textarea id="${prefixo}observacao" rows="2" class="w-full border-2 border-slate-300 rounded-lg p-2 text-xs">${escapeHtml(v.observacao || '')}</textarea>
        </div>
    `;
}

window.__ativoMudarFinalidadeUso = function (prefixo) {
    const sel = document.getElementById(prefixo + 'finalidade-uso');
    const wrap = document.getElementById(prefixo + 'aluguel-wrapper');
    if (!wrap) return;
    const f = FINALIDADES_USO_ATIVO.find(x => x.v === sel?.value);
    wrap.classList.toggle('hidden', !f?.comercial);
};

// Só categoria imóvel. Devolve { camposImovel, aluguelDesejado } —
// camposImovel segue o destino de sempre (imoveis × cofre_ativos, ver
// salvarEdicaoAtivo/salvarAtivo); aluguelDesejado é SEMPRE
// dados_especificos, nos 2 casos (não precisa do sincronismo com
// `imoveis` que o resto do bloco tem — decisão do documento DE_PARA).
// Síncrona agora (empreendimento saiu pra lerBlocoEmpreendimentoValor).
function lerBlocoImovel(prefixo) {
    const num = (id) => { const v = document.getElementById(prefixo + id)?.value?.trim(); return v ? parseFloat(v) : null; };
    const txt = (id) => { const v = document.getElementById(prefixo + id)?.value?.trim(); return v || null; };
    return {
        camposImovel: {
            area_m2: num('area-m2'),
            finalidade_uso: txt('finalidade-uso'),
            situacao_uso: txt('situacao-uso'),
            observacao: txt('observacao'),
        },
        aluguelDesejado: num('aluguel-desejado'),
    };
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

    const vazio = document.getElementById('ativos-estado-vazio');
    vazio.classList.toggle('hidden', estado.ativos.length !== 0);
    container.classList.toggle('hidden', estado.ativos.length === 0);
    if (estado.ativos.length === 0) explicarListaVazia(vazio);
    renderChipsAtivos();
    refrescarIcones();
}

// Lista vazia: distingue "não tem ativo" de "não pode ver" (licença/plano).
function explicarListaVazia(el) {
    const gate = window.podeUsar ? window.podeUsar('cofre.ver') : { ok: true };
    if (gate.ok) return; // estado vazio normal, já está no markup
    // 09/09: confirmado com o Nicola que licença vencida NÃO corta acesso hoje
    // (o padrão é seguir alertando — suspensão/expiração é a frente A.22). Este
    // estado cobre só falta de permissão de perfil, que é o que a RLS checa.
    const porLicenca = ['sem_licenca', 'licenca_expirada', 'suspenso'].includes(gate.motivo);
    el.innerHTML = `
        <i data-lucide="${porLicenca ? 'lock' : 'eye-off'}" style="width:40px;height:40px;color:var(--sage)" class="mx-auto mb-2"></i>
        <p class="text-sm font-semibold">${porLicenca ? 'Acesso bloqueado nesta empresa' : 'Sem acesso aos ativos'}</p>
        <p class="text-xs mb-3" style="color:var(--sage)">${porLicenca
            ? 'Os ativos continuam guardados — o bloqueio é da licença desta empresa, não dos dados.'
            : 'Seu perfil não tem permissão para ver os ativos desta empresa.'}</p>
        ${porLicenca ? `<button data-action="ir-licenca" class="px-4 py-2 rounded-xl text-sm font-semibold text-white" style="background:var(--pine)">Ver licença</button>` : ''}`;
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
    // v1.32.1 (E4.2 fatia B) — cada grupo aceita valor antigo E novo
    { rotulo: 'Imóveis', tipos: ['imovel', 'terreno', 'imovel_predial', 'imovel_territorial'] },
    { rotulo: 'Veículos', tipos: ['veiculo', 'veiculo_blindado'] },
    { rotulo: 'Outros', tipos: ['vida_protecao', 'obra_arte', 'aeronave', 'embarcacao', 'colecao_bem_valor', 'outro', 'vida', 'bem_valor'] },
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
    // v1.21.0 — alerta de vencimento na MESMA linguagem do status (Nicola:
    // "tags diferentes ficou ruim"): ponto + rótulo via renderStatus.
    const rsA = (sem, t) => (typeof window.renderStatus === 'function') ? window.renderStatus(sem, t) : `<span class="rz-st rz-${sem}">${t}</span>`;
    const chip = proximo === undefined || proximo === null ? null
        : proximo < 0 ? { html: rsA('bad', `Vencido há ${Math.abs(proximo)}d`) }
        : proximo <= 30 ? { html: rsA('warn', proximo === 0 ? 'Vence hoje' : `${proximo} dia${proximo === 1 ? '' : 's'}`) }
        : { html: rsA('ok', 'Em dia') };

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
        // v1.20.0 (Nicola 03/09): "sem contrato mostrando Alugado" — o status
        // do imóvel legado (imoveis.status) fica desatualizado; a TAG passa a
        // ser derivada do contrato principal: vigente → Alugado, assinando →
        // Assinando, uso próprio → Em uso, senão Vago. E "Uso Pessoal / Long
        // Stay" sai do título (redundante com a tag).
        const usoProprio = resumoImovel.finalidadeUso === 'uso_proprio';
        // v1.21.0 — BUG: o status do contrato no resumo vem MINÚSCULO do banco
        // ('ativo'); a comparação com 'Ativo' deixava tudo "Vago".
        const stPrincipal = String(principal?.status || '').toLowerCase();
        const situacao = (stPrincipal === 'ativo') ? 'Alugado'
            : (stPrincipal === 'assinando') ? 'Assinando'
            : usoProprio ? 'Em uso' : 'Vago';
        const rsSem = { Alugado: 'ok', Assinando: 'run', 'Em uso': 'neu', Vago: 'warn' }[situacao];
        const badgeHtml = (typeof window.renderStatus === 'function') ? window.renderStatus(rsSem, situacao) : `<span class="rz-st rz-${rsSem}">${situacao}</span>`;
        const titulo = [resumoImovel.empreendimento || 'Sem empreendimento', resumoImovel.tipo].filter(Boolean).join(' · ');

        return `<button data-action="abrir-ativo" data-id="${a.id}" class="card-ativo w-full p-3 text-left flex gap-3 items-start">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-none overflow-hidden" style="background:var(--tile);color:var(--pine)">
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
                ${badgeHtml}
                ${chip ? chip.html : ''}
            </div>
        </button>`;
    }

    // Card genérico (ativos que não são imóvel, ou imóvel sem resumo
    // ainda carregado) — mesmo formato de sempre.
    return `<button data-action="abrir-ativo" data-id="${a.id}" class="card-ativo w-full p-3 text-left flex items-center gap-3">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-none" style="background:var(--tile);color:var(--pine)"><i data-lucide="${iconeAtivo(a.tipo_ativo)}" style="width:20px;height:20px"></i></div>
        <div class="min-w-0 flex-1">
            <p class="text-xs font-extrabold truncate">${escapeHtml(a.nome_exibicao)}</p>
            <p class="text-xs" style="color:var(--sage)">${escapeHtml(rotuloTipoAtivo(a.tipo_ativo))}</p>
        </div>
        ${chip ? chip.html : ''}
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
    await garantirCatalogoTiposAtivo();
    await garantirEmpreendimentos(); // E15.2 — pro seletor no bloco imóvel
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
    // Onda 12 (E15.2.1, achado no caminho) — este seletor só aparecia pra
    // 'imovel_predial'; 'imovel_territorial' (terreno/fazenda/sítio) ia
    // direto pro avulso, sem nunca poder vincular a um imóvel existente
    // nem, agora, criar um novo — mesmo bug de origem do resto desta
    // etapa, mesma correção: ehCategoriaImovel() cobre as duas.
    document.getElementById('at-origem-imovel-wrapper').classList.toggle('hidden', !ehCategoriaImovel(tipo));
    if (ehCategoriaImovel(tipo)) {
        const imoveisCliente = await api.listarImoveisDoCliente(estado.clienteId);
        // v1.96.2 — opção "nenhum" explícita no topo, valor vazio de
        // propósito (atualizarCamposEstruturadosAtivo() usa pra decidir
        // se mostra os campos avulsos ou não — ver comentário lá).
        // v1.38.0 (E15.2.1) — 3ª opção "+ Cadastrar um imóvel novo"
        // (valor sentinela '__novo__'): fecha o item 2.1 do handoff —
        // até aqui só dava pra vincular a um imóvel JÁ existente ou
        // criar ativo avulso (sem linha em `imoveis`); criar um imóvel
        // de verdade só existia pelo wizard antigo (imoveis.js). Mesmos
        // blocos de endereço/valor/tipo do avulso, só muda o destino no
        // salvarAtivo() — ver ali e criarImovelEAtivo (cofre-api.js).
        document.getElementById('at-origem-imovel').innerHTML =
            '<option value="">— nenhum, cadastrar dados avulsos abaixo —</option>' +
            '<option value="__novo__">+ Cadastrar um imóvel novo</option>' +
            imoveisCliente.map(i => `<option value="${i.id}">${escapeHtml(i.endereco_rua)}, ${escapeHtml(i.endereco_num || '')}</option>`).join('');
    }
    // E5 — 2º seletor (tipo específico) troca de opções a cada mudança
    // de categoria; sem valor pré-selecionado (form de criar sempre
    // parte zerado).
    atualizarSelectTipoDetalhe(tipo, 'at-');
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
    // v1.38.0 (E15.2.1) — 3 estados agora, não 2: vazio (avulso) e
    // '__novo__' (imóvel novo) mostram os MESMOS blocos de endereço/
    // valor/tipo abaixo (o dado ainda não existe em `imoveis` nos dois
    // casos); só um UUID real (imóvel JÁ existente) esconde e delega —
    // dados já vêm de lá.
    const valorOrigem = selImovel ? selImovel.value : '';
    const vinculadoAExistente = ehCategoriaImovel(tipo) && valorOrigem && valorOrigem !== '__novo__';
    const semImovelVinculado = !vinculadoAExistente;
    // E5 — tipo_detalhe_id (uuid) do 2º seletor, quando existir; some
    // pra undefined se o seletor não existir ou estiver escondido (sem
    // tipo específico cadastrado pra essa categoria) — obterCamposPorTipo
    // trata null igual a "só os campos de categoria", comportamento de
    // antes da E5.
    const selDetalhe = document.getElementById('at-tipo-detalhe');
    const tipoDetalheId = selDetalhe && selDetalhe.value ? selDetalhe.value : null;
    document.getElementById('at-campos-estruturados').innerHTML = semImovelVinculado
        ? renderizarCamposEstruturados(tipo, {}, 'at-campo-', tipoDetalheId)
        : `<p class="text-xs sm:col-span-2" style="color:var(--sage)">Endereço, IPTU e valor de mercado já vêm de "${escapeHtml(selImovel.options[selImovel.selectedIndex]?.text || 'imóvel selecionado')}" — nada a preencher aqui.</p>`;

    // E15.2 (achado no teste real, 16/09/2026) — empreendimento/valor de
    // referência valem pra QUALQUER tipo de ativo, não só imóvel. Mesma
    // regra de "sem vínculo" que os campos específicos acima usam
    // (semImovelVinculado): se já tem imóvel selecionado, esses dados já
    // existem nele, nada a duplicar aqui.
    const wrapEmpVal = document.getElementById('at-empreendimento-valor-wrapper');
    if (wrapEmpVal) wrapEmpVal.innerHTML = semImovelVinculado ? renderizarBlocoEmpreendimentoValor('at-empval-', {}, _empreendimentosCache || []) : '';

    // v1.32.0 (E6.2) — bloco de endereço estruturado, categoria imóvel
    // sem vínculo a um EXISTENTE (avulso OU '__novo__' — v1.38.0/E15.2.1
    // ampliou de "só avulso" pra "sem imóvel selecionado", mesmo critério
    // de semImovelVinculado acima).
    const mostrarBlocosImovel = ehCategoriaImovel(tipo) && semImovelVinculado;
    const wrapEndereco = document.getElementById('at-endereco-wrapper');
    if (wrapEndereco) {
        wrapEndereco.classList.toggle('hidden', !mostrarBlocosImovel);
        if (mostrarBlocosImovel) wrapEndereco.innerHTML = renderizarBlocoEndereco('at-endereco', {}, { mostrarBotaoCopiar: false });
    }

    // E15.2 ("A2") — bloco (área, finalidade/situação de uso, aluguel
    // esperado, observação) — Fase 1/2 da DE_PARA_IMOVEIS_ATIVOS.
    // v1.38.0 (E15.2.1) — mesmo critério de mostrarBlocosImovel acima
    // (avulso OU '__novo__'; empreendimento/valor saíram pro bloco
    // universal). _empreendimentosCache já foi carregado em abrirFormAtivo.
    const wrapImovel = document.getElementById('at-imovel-wrapper');
    if (wrapImovel) {
        wrapImovel.classList.toggle('hidden', !mostrarBlocosImovel);
        if (mostrarBlocosImovel) wrapImovel.innerHTML = renderizarBlocoImovel('at-imovel-', {});
    }
}

// E5 — chamado pelo data-action-change do #at-tipo-detalhe: só precisa
// re-renderizar os campos (o tipo/categoria não mudou), não o resto do
// form inteiro.
export function aoMudarTipoDetalheAtivo() {
    atualizarCamposEstruturadosAtivo();
}

function renderizarCamposEstruturados(tipo, valores, prefixoId = 'at-campo-', tipoDetalheId = null) {
    const campos = obterCamposPorTipo(tipo, tipoDetalheId);
    return campos.map(c => `
        <div>
            <label class="text-xs font-semibold block mb-1">${escapeHtml(c.label)} ${c.obrigatorio ? '<span style="color:var(--danger)">*</span>' : ''}</label>
            <input type="${c.tipo === 'number' ? 'number' : c.tipo === 'date' ? 'date' : 'text'}" id="${prefixoId}${c.chave}" value="${escapeHtml(valores[c.chave] || '')}" class="w-full border-2 border-slate-300 rounded-xl p-2 text-sm">
        </div>`).join('') || `<p class="text-xs sm:col-span-2" style="color:var(--sage)">Sem campos estruturados adicionais para este tipo.</p>`;
}

function lerCamposEstruturados(tipo, prefixoId = 'at-campo-', tipoDetalheId = null) {
    const campos = obterCamposPorTipo(tipo, tipoDetalheId);
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
    // E5 — tipo_detalhe_id (uuid do tipo específico, ex. "Carro blindado")
    // vem do 2º seletor quando ele existir; completa o que a fatia B da
    // E4.2 só conseguiu fazer retroativamente pros 131 ativos que já
    // existiam — ativo novo já nasce com o dado certo.
    const selDetalhe = document.getElementById('at-tipo-detalhe');
    const tipoDetalheId = selDetalhe && selDetalhe.value ? selDetalhe.value : null;
    const dadosEspecificos = lerCamposEstruturados(tipo, 'at-campo-', tipoDetalheId);

    const erros = validarCamposAtivo(tipo, nome, dadosEspecificos, tipoDetalheId);
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

    // v1.38.0 (E15.2.1) — 3 modos agora, não 2: vinculado (UUID real em
    // "Qual imóvel?"), novo ('__novo__', sentinela do seletor — cria
    // linha em `imoveis` de verdade) e avulso (vazio, só cofre_ativos).
    // ehCategoriaImovel() no lugar do antigo "=== 'imovel_predial'":
    // territorial ganhou o mesmo seletor nesta etapa (ver aoMudarTipoAtivo).
    const origemImovelValor = ehCategoriaImovel(tipo) ? (document.getElementById('at-origem-imovel')?.value || '') : '';
    const vinculadoAExistente = !!origemImovelValor && origemImovelValor !== '__novo__';
    const criandoImovelNovo = origemImovelValor === '__novo__';

    const payload = { cliente_id: estado.clienteId, tipo_ativo: tipo, tipo_detalhe_id: tipoDetalheId, nome_exibicao: nome, status: 'ativo', dados_especificos: dadosEspecificos, criado_por: estado.pessoa.id };
    if (vinculadoAExistente) {
        payload.entidade_origem_tipo = 'imovel';
        payload.entidade_origem_id = origemImovelValor;
    }
    // v1.32.0 (E6.2) — BUG REAL corrigido: a opção "— nenhum, cadastrar
    // dados avulsos abaixo —" existe no seletor desde a v1.96.2, mas até
    // aqui salvarAtivo() sempre exigia um imovelId e bloqueava o
    // salvamento com "Selecione o imóvel" mesmo quando a pessoa escolhia
    // essa opção de propósito. Endereço estruturado (E6.1/E6.2) entra
    // direto nas colunas de cofre_ativos (avulso) ou de `imoveis` (novo
    // — v1.38.0), não em dados_especificos.
    //
    // E15.2 (achado no teste real, 16/09/2026) — empreendimento/valor de
    // referência agora são universais (qualquer tipo de ativo sem vínculo
    // com imóvel real); área/finalidade/situação/aluguel/observação
    // continuam só categoria imóvel. Aluguel esperado vai pra
    // dados_especificos SEMPRE, nos 3 modos (decisão do documento
    // DE_PARA) — pra "novo", vai TAMBÉM em imoveis.valor logo abaixo,
    // porque a vitrine pública ainda lê isso direto de `imoveis`
    // (E15.3 não migrou — sem isto, imóvel novo nasceria já divergente,
    // mesma classe de achado de "marcar como vendido").
    let empvalLido = null, enderecoLido = null, camposImovelLido = null, aluguelDesejado = null;
    if (!vinculadoAExistente) {
        empvalLido = await lerBlocoEmpreendimentoValor('at-empval-', estado.clienteId);
        if (ehCategoriaImovel(tipo)) {
            enderecoLido = lerBlocoEndereco('at-endereco');
            const lidoImovel = lerBlocoImovel('at-imovel-');
            camposImovelLido = lidoImovel.camposImovel;
            aluguelDesejado = lidoImovel.aluguelDesejado;
            if (aluguelDesejado !== null) payload.dados_especificos.aluguel_desejado = aluguelDesejado;
        }
    }

    try {
        let novoAtivo;
        if (criandoImovelNovo) {
            // v1.38.0 (E15.2.1) — fecha o item 2.1 do handoff: cria a
            // linha em `imoveis` de verdade (criarImovelEAtivo →
            // fn_criar_ativo) em vez de só cofre_ativos avulso. Sem isso
            // o imóvel novo não podia nunca virar contrato de locação
            // (contratos.js inteiro gira em torno de `imoveis`/imovelId)
            // nem aparecer na vitrine pública (lê `imoveis` sem login,
            // E15.3 ainda não migrou) — exatamente o que mantinha o
            // wizard antigo (imoveis.js) vivo.
            const imovelDados = {
                ...(enderecoLido || {}),
                empreendimento_id: empvalLido?.empreendimento_id ?? null,
                valor_mercado: empvalLido?.valor_referencia ?? null,
                valor: aluguelDesejado,
                tamanho: camposImovelLido?.area_m2 ?? null,
                finalidade_uso: camposImovelLido?.finalidade_uso || null,
                status: camposImovelLido?.situacao_uso || null,
                descricao: camposImovelLido?.observacao || null,
            };
            novoAtivo = await api.criarImovelEAtivo(estado.clienteId, nome, imovelDados, tipoDetalheId, payload.dados_especificos);
        } else {
            if (empvalLido) Object.assign(payload, empvalLido);
            if (enderecoLido) Object.assign(payload, enderecoLido);
            if (camposImovelLido) Object.assign(payload, camposImovelLido);
            novoAtivo = await api.criarAtivo(payload);
        }
        // Divisão societária gravada logo em seguida, já com o id do
        // ativo recém-criado — mesma RPC do chip Propriedade, nenhuma
        // lógica duplicada. criarImovelEAtivo devolve {ativo_id,
        // imovel_id}; criarAtivo devolve a linha inteira (.id) — os dois
        // formatos coexistem aqui de propósito.
        const linhasParaApi = propriedadeLinhasEmEdicao.map(l => ({
            tipo_proprietario: l.tipo_proprietario,
            pessoa_id: l.pessoa_id || '',
            nome_externo: l.nome_externo || '',
            percentual: parseFloat(l.percentual) || 0
        }));
        await api.salvarPropriedadeAtivo(novoAtivo.ativo_id || novoAtivo.id, linhasParaApi);

        mostrarToast(criandoImovelNovo ? 'Imóvel cadastrado ✅' : 'Ativo cadastrado ✅');
        document.getElementById('at-nome').value = '';
        fecharFormAtivo();
        window.dispatchEvent(new CustomEvent('cofre:recarregar-ativos'));
    } catch (err) { statusEl.textContent = '❌ ' + err.message; statusEl.style.color = 'var(--danger)'; }
}

// ============================================================================
// FICHA DO ATIVO — abre SEMPRE em Resumo (Adendo §7.1)
// ============================================================================
export async function abrirFichaAtivo(id, chipInicial = 'resumo') {
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
    // v1.26.0 (Nicola, 05/09: "ao clicar num ativo parece pesado e nem
    // sempre abre de primeira") — a tela trocava SÓ no fim, depois de 6
    // consultas em fila (2–4 s no 4G). Agora: troca de tela primeiro (cada
    // painel já mostra "Carregando..."), ficha abre em Resumo (regra desde
    // a v1.93.0), e os 6 montar* rodam em PARALELO, cada um com seu catch
    // (um painel falhar não derruba os outros). Se o usuário tocar em
    // outro ativo no meio, o repaint final é do ativo mais recente.
    faTrocarAba(chipInicial);
    faTrocarSegArquivos('documentos');
    mudarTela('ficha-ativo');
    montarDocumentosAtivo(a);
    reiniciarChipControlesDoMotor(); // v1.31.2 (E11) — ficha nova, decisão do Motor ainda não chegou
    const seguro = (fn, nome) => fn(a).catch(err => console.warn(`[cofre-ativos] ${nome} falhou:`, err?.message || err));
    await Promise.all([
        seguro(montarDadosAtivo, 'montarDadosAtivo'),
        seguro(montarControlesAtivo, 'montarControlesAtivo'),
        seguro(montarContratosAtivo, 'montarContratosAtivo'),
        seguro(montarFotosAtivo, 'montarFotosAtivo'),
        seguro(montarFinanceiroAtivo, 'montarFinanceiroAtivo'),
        seguro(montarPropriedadeAtivo, 'montarPropriedadeAtivo'),
        seguro(aplicarAlertaMotorNoChipControles, 'aplicarAlertaMotorNoChipControles'),
    ]);
    if (ativoAtualId !== id) return; // outro ativo foi aberto no meio — o dele repinta
}

// v1.31.2 (E11) — esta funcao agora so BUSCA; quem pinta e
// aplicarMotorNoChipControles (cofre-controles.js v1.21.0), que e a fonte
// unica de cor e texto do chip "Controles". Antes ela acendia o vermelho
// direto e nunca apagava, e a conta local escrevia "Em dia" por cima —
// dai a bolinha vermelha sem alerta visivel na ficha.
// v1.31.3 (FIX, achado do Nicola em teste real) — fn_alertas_do_ativo(a.id)
// devolve TODO alerta ligado a este ativo_id, e desde a E2.3 isso inclui
// alerta de CONTRATO (reajuste, encerramento, aguardando assinatura,
// vendido/arquivado) e de FINANCEIRO (atraso) — não só item de controle.
// aplicarMotorNoChipControles() pinta o chip "Controles", que mostra só
// cofre_itens_controle; pintar por alerta de contrato produzia exatamente
// o sintoma relatado: bolinha vermelha com contador 0 (Rua Funchal, sem
// nenhum item de controle, tinha 1 contrato vencido) e "1 reajuste
// pendente" no cabeçalho de Controles de um ativo cujo item (IPTU) estava
// Em dia (Av. Faria Lima — o reajuste era do CONTRATO, não do IPTU).
// Filtro por tipo_alerta antes de pintar: só os 2 tipos que são de fato
// item de controle. Alerta de contrato/financeiro do ativo continua
// aparecendo — na tela de Alertas e na Visão Geral, que são o lugar certo.
const TIPOS_ALERTA_CHIP_CONTROLES = new Set(['anexo_apolice_pendente', 'cofre_item_vencendo']);

async function aplicarAlertaMotorNoChipControles(a) {
    try {
        const alertas = await api.buscarAlertasDoAtivo(a.id);
        if (ativoAtualId !== a.id) return; // trocou de ativo enquanto buscava
        const doControle = (alertas || []).filter(x => TIPOS_ALERTA_CHIP_CONTROLES.has(x.tipo_alerta));
        aplicarMotorNoChipControles(doControle);
    } catch (err) {
        // Motor indisponível: o chip fica com o estado provisório da conta
        // local (só o número), sem vermelho inventado.
        console.warn('[cofre-ativos] aplicarAlertaMotorNoChipControles falhou:', err?.message || err);
    }
}


// v1.93.0 (pedido explícito, 31/08/2026, "evoluir a exemplo do
// protótipo") — troca de aba dentro da ficha do ativo (Dados/
// Documentos/Controles/Contratos/Fotos). Todo o CONTEÚDO de cada aba já
// é montado de uma vez em abrirFichaAtivo() (nenhuma busca nova
// acontece ao trocar de aba) — esta função só troca visibilidade +
// destaque visual, mesmo espírito leve do trocarSub() do protótipo.
// v1.27.0 — chip → código *.ver que o gateia (Resumo é sempre livre)
const CHIP_CODIGO = { contratos: 'contratos.ver', controles: 'cofre.controles.ver', financeiro: 'mensal.ver', arquivos: 'cofre.ver' };
export function faTrocarAba(nomeAba) {
    // v1.17.0 — chips .rz-chip: destaque é só a classe .rz-on (sem style
    // inline). Compatibilidade: 'dados' → 'resumo', 'propriedade' → 'resumo',
    // 'documentos'/'fotos' → 'arquivos' (quem chamava com os nomes antigos
    // continua caindo no lugar certo).
    const mapa = { dados: 'resumo', propriedade: 'resumo', documentos: 'arquivos', fotos: 'arquivos' };
    const alvo = mapa[nomeAba] || nomeAba;
    // v1.27.0 — chip com código bloqueado: cadeado e não troca (porta única).
    const cod = CHIP_CODIGO[alvo];
    if (cod && typeof window.podeUsar === 'function' && !window.podeUsar(cod).ok) {
        if (typeof window.rzMostrarBloqueio === 'function') window.rzMostrarBloqueio(cod);
        return;
    }
    document.querySelectorAll('.fa-subtab').forEach(btn => {
        btn.classList.toggle('rz-on', btn.dataset.faAba === alvo);
        const c = CHIP_CODIGO[btn.dataset.faAba];
        btn.classList.toggle('rz-off', !!(c && typeof window.podeUsar === 'function' && !window.podeUsar(c).ok));
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
    // v1.20.0 — chips de Anexos ('todos' | 'fotos' | <categoria_id>);
    // 'documentos' (nome antigo) cai em 'todos'.
    filtroAnexoAtual = (nome === 'documentos' || !nome) ? 'todos' : nome;
    document.querySelectorAll('#fa-anexos-chips .rz-chip').forEach(b => b.classList.toggle('rz-on', b.dataset.faSeg === filtroAnexoAtual));
    aplicarFiltroAnexos();
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
window.faTrocarAbaFicha = faTrocarAba;
window.abrirFichaAtivoNoChip = (id, chip) => abrirFichaAtivo(id, chip);

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
    // E15.2 (15/09/2026, "vamos desligar o form de imóveis") — os 2
    // itens que existiam aqui pra imóvel ("Editar dados do imóvel" →
    // abrirGestaoImovel/form legado, e "Editar campos do ativo" →
    // alternarEditarAtivo) viram UM só: alternarEditarAtivo() agora
    // cobre os dois mundos (endereço/valor/área/uso/empreendimento +
    // campos específicos), escrevendo em `imoveis` por baixo quando
    // vinculado (ver salvarEdicaoAtivo). abrirGestaoImovel() continua
    // existindo (não removida) só por segurança de rollback — sem
    // chamador neste menu a partir de agora.
    acoes.push({ icone: 'pencil', titulo: 'Editar', codigo: 'cofre.editar', sub: ehImovel ? 'Endereço, valores, uso e campos específicos' : 'Campos específicos deste tipo', aoTocar: () => { faTrocarAba('resumo'); alternarEditarAtivo(); } });
    acoes.push({ icone: 'image-plus', titulo: 'Adicionar fotos', codigo: 'cofre.editar', aoTocar: () => { faTrocarAba('arquivos'); faTrocarSegArquivos('fotos'); document.getElementById('fa-foto-input')?.click(); } });
    // v1.22.0 (fatia 7) — "Gerar vitrine" deste imóvel (link único) —
    // reaproveita gerarVitrineDoImovel() do App (index.html v1.115.0).
    if (ehImovel && a.status !== 'vendido' && typeof window.gerarVitrineDoImovel === 'function') acoes.push({ icone: 'image', titulo: 'Gerar vitrine', codigo: 'vitrine.gerar', sub: 'Link deste imóvel pra compartilhar', aoTocar: () => window.gerarVitrineDoImovel(a.entidade_origem_id) });
    if (a.status !== 'vendido') acoes.push({ icone: 'tag', titulo: 'Marcar como vendido', codigo: 'cofre.editar', sub: 'Desliga alertas e sai da vitrine', aoTocar: () => marcarAtivoVendidoAtual() });
    acoes.push({ icone: 'trash-2', titulo: 'Excluir ativo', codigo: 'cofre.excluir', tipo: 'bad', aoTocar: () => excluirAtivoAtual() });
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
        // v1.17.2 — BUG (print 03/09 12:32): "0 vigentes · 1 encerrado" com
        // a linha "Ativo". contratos.status é MINÚSCULO no banco ('ativo',
        // 'assinando', 'finalizado'); a comparação com 'Ativo' (capitalizado,
        // herdada do texto do v1.5.0) nunca batia. Normalizado uma vez aqui.
        const lista = (await api.buscarContratosDoImovel(a.entidade_origem_id)).map(c => ({ ...c, st: String(c.status || '').toLowerCase() }));
        const vigentes = lista.filter(c => c.st === 'ativo' || c.st === 'assinando');
        faAtualizarContador('contratos', vigentes.length);
        if (sub) sub.textContent = lista.length ? `${vigentes.length} vigente${vigentes.length === 1 ? '' : 's'} · ${lista.length - vigentes.length} encerrado${lista.length - vigentes.length === 1 ? '' : 's'}` : '';
        if (!lista.length) {
            // v1.17.0 — único card vazio que RENDERIZA sem ação própria
            // (exceção documentada, REGRAS §6): a contratação nasce na aba
            // Contratos do App, não daqui.
            painel.innerHTML = `<div class="rz-empty"><div class="rz-ic"><i data-lucide="file-text"></i></div><p>Nenhum contrato pra este imóvel ainda. Inicie a contratação pelo menu ⋮.</p></div>`;
            refrescarIcones();
            return;
        }
        // v1.17.0 — item de lista único (.rz-row, REGRAS §9) + status nas
        // 5 semânticas; toque abre o contrato na aba Contratos do App
        // (abrirContratoNoApp), lógica de contrato continua só lá.
        const r = typeof window.renderStatus === 'function' ? window.renderStatus : (c, t) => `<span class="rz-st rz-neu">${escapeHtml(t || c)}</span>`;
        const statusDe = { ativo: r('ok', 'Vigente'), assinando: r('run', 'Assinando'), suspenso: r('neu', 'Suspenso'), finalizado: r('neu', 'Encerrado'), cancelado: r('neu', 'Cancelado') };
        painel.innerHTML = lista.map(c => `
            <div class="rz-row rz-link" data-action="fa-abrir-contrato-app" data-contrato-id="${c.id}">
                <div class="rz-ic${(c.st === 'ativo' || c.st === 'assinando') ? '' : ' rz-neu'}"><i data-lucide="${c.st === 'assinando' ? 'file-signature' : (c.st === 'ativo' ? 'file-text' : 'archive')}"></i></div>
                <div class="rz-tx">
                    <b>${escapeHtml(c.locatario || 'Locatário não informado')}</b>
                    <span>${c.inicio ? formatarDataBR(c.inicio) : ''}${c.fim ? ' → ' + formatarDataBR(c.fim) : ''}</span>
                </div>
                <div class="rz-rt">
                    <b>R$ ${Number(c.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</b>
                    ${statusDe[c.st] || r(c.st || 'neu')}
                </div>
                <i data-lucide="chevron-right" class="rz-chev"></i>
            </div>`).join('');
        // v1.21.0 — sem rodapé (Nicola: "o toque já resolve"): a linha abre
        // o contrato; contratação/novo vivem no ⋮ do cabeçalho.
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
            // v1.23.0 (pedido explícito do Nicola, 05/09: "na aba
            // Financeiro no ativo, está sem o menu de 3 pontinhos pra
            // tratar cada item") — ⋮ por linha, ponte pro App: entrada
            // abre rzAcoesMensalidade (o MESMO sheet Dar baixa/Recibo/
            // Estornar/Excluir de Financeiro e da ficha do contrato,
            // v1.116); saída abre abrirEditarDespesa (mesmo destino do
            // toque na linha de Financeiro › Saídas). A RPC já devolve o
            // id de cada item (mensalidades.id / lancamentos.id).
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
                    <button type="button" data-fin-acao="${it.id}" data-fin-dir="${it.direcao}" class="rz-more" aria-label="Mais ações"><i data-lucide="ellipsis-vertical"></i></button>
                </div>`;
        }).join('');
        painelLista.querySelectorAll('[data-fin-acao]').forEach(btn => btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-fin-acao');
            if (btn.getAttribute('data-fin-dir') === 'entrada') {
                if (typeof window.rzAcoesMensalidade === 'function') window.rzAcoesMensalidade(id);
                else mostrarToast('Ação só disponível dentro do app principal.', 'erro');
            } else {
                if (typeof window.switchTab === 'function' && typeof window.abrirEditarDespesa === 'function') {
                    window.switchTab('tab-mensal');
                    window.abrirEditarDespesa(id);
                } else mostrarToast('Ação só disponível dentro do app principal.', 'erro');
            }
        }));
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
    // v1.20.0 — BUG (Nicola): abrirDetalhesContrato é o MODAL de edição; a
    // ficha é abrirFichaContrato (toque = entrar, nunca editar).
    if (typeof window.switchTab === 'function' && typeof window.abrirFichaContrato === 'function') {
        // v1.19.0 — o App usa isto pra "Voltar" cair na ficha do ativo, não
        // na lista de contratos (Nicola 03/09).
        window.fichaContratoOrigem = { tipo: 'ativo', id: estado.ativoEmFoco?.id || null };
        window.switchTab('tab-contratos');
        window.abrirFichaContrato(contratoId);
    } else {
        mostrarToast('Contrato só abre dentro do app principal.', 'erro');
    }
}

// v1.19.0 — contratação e sheet de ações do chip Contratos (ponte pro App:
// abrirNovoContratoParaImovel já pré-seleciona o imóvel e abre o formulário).
export function abrirNovoContratoDoAtivo() {
    const a = estado.ativoEmFoco;
    if (a?.entidade_origem_tipo !== 'imovel') { mostrarToast('Contratos de locação só existem pra imóveis.', 'erro'); return; }
    if (typeof window.switchTab === 'function' && typeof window.criarContratoParaImovel === 'function') {
        window.fichaContratoOrigem = { tipo: 'ativo', id: a.id };
        // v1.31.1 (E0.1 / A6) — switchTab('tab-contratos') saiu: o formulario
        // de contrato agora vive no <body> e abre por cima da ficha do ativo.
        window.criarContratoParaImovel(a.entidade_origem_id);
    } else mostrarToast('Contratação só abre dentro do app principal.', 'erro');
}
// v1.20.0 (Nicola: "faltaram gerar minuta, compartilhar link e as outras
// opções que tinham pra iniciar um novo contrato") — iniciarProcessoContratacao
// do App cria o processo e abre o menu completo (dados do locatário por
// link, WhatsApp, minuta padrão, gerar minuta). O menu em si ainda é o
// Tipo B antigo — vira sheet na fatia 9.
export function iniciarContratacaoDoAtivo() {
    const a = estado.ativoEmFoco;
    if (a?.entidade_origem_tipo !== 'imovel') { mostrarToast('Contratos de locação só existem pra imóveis.', 'erro'); return; }
    if (typeof window.iniciarProcessoContratacao !== 'function') { abrirNovoContratoDoAtivo(); return; }
    window.fichaContratoOrigem = { tipo: 'ativo', id: a.id };
    window.iniciarProcessoContratacao(a.entidade_origem_id);
}
export function abrirAcoesPropriedade() {
    const a = estado.ativoEmFoco; if (!a) return;
    sheetOuAviso({ titulo: 'Propriedade', sub: a.nome_exibicao, acoes: [
        { icone: 'pencil', titulo: 'Editar divisão', codigo: 'imoveis.divisao', sub: 'Sócios e percentuais', aoTocar: () => abrirEditarPropriedadeAtivo() },
    ] });
}
export function abrirAcoesControlesAtivo() {
    const a = estado.ativoEmFoco; if (!a) return;
    sheetOuAviso({ titulo: 'Itens de controle', sub: a.nome_exibicao, acoes: [
        { icone: 'plus', titulo: 'Novo item de controle', codigo: 'cofre.controles.criar', sub: 'Seguro, tributo, vistoria, manutenção', aoTocar: () => window.__rzAbrirFormControle?.() },
        { icone: 'layers', titulo: 'Modelos de item', codigo: 'cofre.controles.editar', sub: 'Modelos prontos pra criar mais rápido', aoTocar: () => window.__rzAbrirModelosControle?.() },
        { icone: 'tags', titulo: 'Tipos de controle', codigo: 'cofre.controles.editar', sub: 'Subtipos de seguro, tributo e manutenção', aoTocar: () => window.__rzAbrirSubtiposControle?.() },
    ] });
}
export function abrirAcoesFinanceiroAtivo() {
    const a = estado.ativoEmFoco; if (!a) return;
    sheetOuAviso({ titulo: 'Financeiro', sub: a.nome_exibicao, acoes: [
        { icone: 'plus', titulo: 'Novo lançamento', codigo: 'saidas.registrar', sub: 'Saída ligada a este ativo', aoTocar: () => abrirNovoLancamentoDoAtivo() },
        { icone: 'wallet', titulo: 'Ver no Financeiro', codigo: 'mensal.ver', sub: 'Todas as saídas deste ativo', aoTocar: () => abrirSaidasDoAtivo() },
    ] });
}
export function abrirAcoesAnexos() {
    const a = estado.ativoEmFoco; if (!a) return;
    sheetOuAviso({ titulo: 'Anexos', sub: a.nome_exibicao, acoes: [
        { icone: 'sparkles', titulo: 'Adicionar documento com IA', codigo: 'cofre.analisar_ia', sub: 'Lê matrícula, IPTU, apólice e preenche os controles', tipo: 'ia', aoTocar: () => window.__rzUploadAtivo?.(true) },
        { icone: 'upload', titulo: 'Upload simples', codigo: 'cofre.upload', sub: 'Só guarda o arquivo', aoTocar: () => window.__rzUploadAtivo?.(false) },
        { icone: 'camera', titulo: 'Adicionar fotos', codigo: 'cofre.editar', aoTocar: () => { faTrocarSegArquivos('fotos'); document.getElementById('fa-foto-input')?.click(); } },
    ] });
}
export function abrirAcoesContratosAtivo() {
    const a = estado.ativoEmFoco; if (!a) return;
    sheetOuAviso({ titulo: 'Contratos', sub: a.nome_exibicao, acoes: [
        { icone: 'link', titulo: 'Contratação: link, WhatsApp e minuta', codigo: 'contratos.criar', sub: 'Coleta de dados do locatário e minuta', aoTocar: () => iniciarContratacaoDoAtivo() },
        { icone: 'plus', titulo: 'Cadastrar contrato manualmente', codigo: 'contratos.criar', sub: 'Já com este imóvel selecionado', aoTocar: () => abrirNovoContratoDoAtivo() },
        { icone: 'list', titulo: 'Ver todos na aba Contratos', codigo: 'contratos.ver', aoTocar: () => { if (typeof window.switchTab === 'function') window.switchTab('tab-contratos'); } },
    ] });
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
    // v1.32.0 (E6.2) — imóvel avulso com endereço preenchido (colunas da
    // E6.1) reaproveita a MESMA grade de leitura do imóvel vinculado, só
    // que sem chamar api.buscarResumoImovelOrigem (não existe tabela
    // imoveis por trás deste ativo).
    const ehAvulsoComEndereco = ehImovelAvulso(a.tipo_ativo, a.entidade_origem_tipo) && (a.endereco_rua || a.endereco_cidade);
    gridWrapper.classList.toggle('hidden', !ehImovelVinculado && !ehAvulsoComEndereco);

    if (ehAvulsoComEndereco) {
        const enderecoPartes = [a.endereco_rua, a.endereco_num].filter(Boolean).join(', ');
        const enderecoCompleto = [enderecoPartes, a.endereco_bairro, [a.endereco_cidade, a.uf].filter(Boolean).join('/')].filter(Boolean).join(' — ');
        // E15.2 — mesma grade, ganha os campos da Fase 1/2 quando
        // preenchidos (rótulo amigável pra finalidade/situação de uso,
        // reaproveitando as listas do formulário — não duplica tradução).
        const kvExtra = [
            a.valor_referencia != null ? `<div><small>Valor de referência</small><b>${Number(a.valor_referencia).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</b></div>` : '',
            a.area_m2 != null ? `<div><small>Área</small><b>${a.area_m2} m²</b></div>` : '',
            a.finalidade_uso ? `<div><small>Finalidade de uso</small><b>${escapeHtml(FINALIDADES_USO_ATIVO.find(f => f.v === a.finalidade_uso)?.l || a.finalidade_uso)}</b></div>` : '',
            a.situacao_uso ? `<div><small>Situação de uso</small><b>${escapeHtml(SITUACOES_USO_ATIVO.find(s => s.v === a.situacao_uso)?.l || a.situacao_uso)}</b></div>` : '',
            a.observacao ? `<div class="rz-full"><small>Observação</small><b>${escapeHtml(a.observacao)}</b></div>` : '',
        ].join('');
        gridWrapper.innerHTML = `<div class="rz-kv"><div class="rz-full"><small>Endereço completo</small><b>${escapeHtml(enderecoCompleto)}</b></div>${kvExtra}</div>`;
    }
    if (ehImovelVinculado) {
        // v1.93.0 (pedido explícito, "evoluir a exemplo do protótipo") —
        // grade completa 2 colunas (Inscrição imobiliária/UF-Município/
        // Uso/Tipo de locação/Valor de mercado/IPTU/Endereço completo),
        // igual ao mockup — antes era só um resumo em texto corrido
        // (uso/valor/IPTU numa linha só). Isto é LEITURA, direto de
        // `imoveis` (sempre fresco, sem depender de cache).
        //
        // E15.2 (15/09/2026) — o comentário antigo aqui dizia que fundir
        // os 2 formulários de escrita (cofre_ativos.dados_especificos ×
        // imoveis) era "decisão maior, fora desta entrega" — não é mais:
        // alternarEditarAtivo() agora escreve em `imoveis` quando o
        // ativo é vinculado (ver salvarEdicaoAtivo), então o botão
        // "Editar dados" (rodapé desta grade) aponta pra lá também,
        // não mais pro formulário legado.
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
        const campo = (rotulo, valor) => valor
            ? `<div><small>${escapeHtml(rotulo)}</small><b>${valor}</b></div>`
            : '';
        const enderecoPartes = [resumoImovel?.endereco_rua, resumoImovel?.endereco_num].filter(Boolean).join(', ');
        const enderecoCompleto = [enderecoPartes, resumoImovel?.endereco_bairro, [resumoImovel?.endereco_cidade, resumoImovel?.uf].filter(Boolean).join('/')].filter(Boolean).join(' — ');

        // Onda 12 (16/09/2026) — "Inscrição imobiliária"/"Uso"/"Tipo de
        // locação" saíram: buscarResumoImovelOrigem (cofre-api.js 1.33.0+)
        // não devolve mais esses 3 campos — conferido no banco antes de
        // tirar, 0 dos 104 imóveis (qualquer tenant) tinham QUALQUER um
        // dos 3 preenchido, e nenhum formulário do app jamais teve campo
        // pra editá-los. Não mudava nada visível pra ninguém — já não
        // apareciam (campo() só renderiza com valor).
        const campos = [
            campo('UF / Município', (resumoImovel?.uf && resumoImovel?.endereco_cidade) ? escapeHtml(resumoImovel.uf) + ' · ' + escapeHtml(resumoImovel.endereco_cidade) : ''),
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
    // E15.2 (15/09/2026) — sempre 'alternar-editar-ativo' agora, os 2
    // caminhos (vinculado/avulso) convergem pra lá (ver nota acima).
    // 'abrir-gestao-imovel' fica sem chamador neste botão a partir de
    // agora — action + abrirGestaoImovel() não removidos, só sem uso.
    if (btnEditar) btnEditar.dataset.action = 'alternar-editar-ativo';

    // v1.95.0 — pra ativo vinculado a imóvel, a grade acima JÁ é o dado
    // de verdade — mostrar "Sem dados estruturados cadastrados ainda."
    // aqui embaixo (que se refere só a cofre_ativos.dados_especificos,
    // um conceito interno que não devia aparecer pro usuário) ficava
    // confuso: parecia que faltava informação quando na verdade a
    // grade acima já tinha tudo (achado direto, pedido explícito: "veja
    // como aparece, ruim, precisa já aparecer os dados do imóvel").
    // Pra ativo SEM imóvel vinculado, comportamento intacto.
    // v1.34.0 (E15.1 / "A3", 15/09/2026) — achado ao reler a tela: os
    // campos específicos apareciam como uma STRING de valores separados
    // por "·" ("ABC1D23 · Honda · Civic · 2022"), sem rótulo nenhum —
    // dava pra ver O QUE tinha, não O QUE CADA VALOR ERA. Vira .rz-kv
    // (rótulo + valor), mesmo componente já usado 2x nesta função pro
    // imóvel vinculado e pro endereço do avulso (E6.2) — não é padrão
    // novo, só o 3º lugar que usa o mesmo.
    const camposDefinidos = obterCamposPorTipo(a.tipo_ativo, a.tipo_detalhe_id);
    const dados = a.dados_especificos || {};
    const camposPreenchidos = camposDefinidos.filter(c => dados[c.chave]);

    const resumo = document.getElementById('fa-resumo-dados');
    if (ehImovelVinculado && camposPreenchidos.length === 0) {
        resumo.innerHTML = '';
    } else if (camposPreenchidos.length === 0) {
        resumo.innerHTML = `<p class="rz-desc${ehImovelVinculado ? ' mt-2' : ''}">Sem campos específicos preenchidos ainda.</p>`;
    } else {
        const kv = camposPreenchidos.map(c => `<div><small>${escapeHtml(c.label)}</small><b>${c.mascarar ? mascarar(dados[c.chave]) : escapeHtml(dados[c.chave])}</b></div>`).join('');
        resumo.innerHTML = `<div class="rz-kv${ehImovelVinculado ? ' mt-2' : ''}">${kv}</div>`;
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
export async function alternarEditarAtivo() {
    const a = estado.ativoEmFoco;
    // E5 — garante o catálogo antes de montar o 2º seletor (tipo
    // específico); se já carregou (abriu o form de criar antes, na mesma
    // sessão), não busca de novo.
    await garantirCatalogoTiposAtivo();
    await garantirEmpreendimentos(); // E15.2
    const vinculado = ehImovelVinculado(a.entidade_origem_tipo);
    // v1.18.0 (fatia 3b-iii, pedido do Nicola 03/09: "está abrindo
    // formulário dentro da tela e não bottom sheet como os demais") —
    // abre em abrirSheetForm com os MESMOS ids de campo (fa-editar-nome,
    // fa-editar-campo-*), então salvarEdicaoAtivo não mudou. O wrapper
    // inline continua no markup só como fallback sem o App.
    // v1.32.0 (E6.2) — imóvel avulso ganha o bloco de endereço estruturado
    // no fim do form de edição, nos dois caminhos (sheet do App e o
    // fallback inline). Prefixo 'fa-editar-endereco', lido de volta em
    // salvarEdicaoAtivo(). Continua sem o botão "usar endereço de outro
    // ativo" nesta entrega (mesmo corte de escopo do formulário de criar).
    // E15.2 (15/09/2026, "vamos desligar o form de imóveis") — os 2
    // blocos agora aparecem pra QUALQUER ativo de categoria imóvel,
    // vinculado ou avulso — não só avulso como antes. salvarEdicaoAtivo()
    // decide pra onde escrever (imoveis × cofre_ativos) por baixo; aqui
    // só decide SE mostra.
    // Achado no teste real, 16/09/2026: empreendimento/valor de
    // referência viraram bloco PRÓPRIO, universal (qualquer tipo de
    // ativo, não só imóvel) — ver renderizarBlocoEmpreendimentoValor.
    const blocoEmpreendimentoValor = `<div class="rz-campos-imovel grid grid-cols-1 sm:grid-cols-2 gap-3">${renderizarBlocoEmpreendimentoValor('fa-editar-empval-', a, _empreendimentosCache || [])}</div>`;
    const blocoEndereco = ehCategoriaImovel(a.tipo_ativo)
        ? `<div class="rz-campos-endereco">${renderizarBlocoEndereco('fa-editar-endereco', a, { mostrarBotaoCopiar: false })}</div>`
        : '';
    const blocoImovel = ehCategoriaImovel(a.tipo_ativo)
        ? `<div class="rz-campos-imovel grid grid-cols-1 sm:grid-cols-2 gap-2">${renderizarBlocoImovel('fa-editar-imovel-', a)}</div>`
        : '';
    // E5 — tipo específico (dentro da categoria, que continua somente-
    // leitura — ver nota abaixo) passa a ser editável: corrige um ativo
    // classificado errado, ou completa um que nunca teve tipo_detalhe_id
    // (criado antes da E5). Categoria sem tipo cadastrado no catálogo:
    // tiposDetalhe fica [], o bloco não aparece — comportamento de antes.
    // E15.2 — pra VINCULADO, fica travado (disabled): `imoveis.tipo_id`
    // (catálogo antigo, tipos_imovel) é quem ainda manda pro que outras
    // partes do sistema legado leem — mudar só o tipo_detalhe_id daqui
    // divergiria dos dois catálogos sem sincronismo nenhum. Destravar
    // isso é trabalho da E15.3 (fim de verdade do catálogo antigo).
    const tiposDetalhe = listarTiposPorCategoria(a.tipo_ativo);
    const blocoTipoDetalhe = tiposDetalhe.length
        ? (vinculado
            ? `<div class="rz-f"><label>Tipo específico</label><input type="text" value="${escapeHtml(tiposDetalhe.find(t => t.id === a.tipo_detalhe_id)?.nome || '—')}" disabled></div>`
            : `<div class="rz-f"><label>Tipo específico</label><select id="fa-editar-tipo-detalhe" data-action-change="ativo-tipo-detalhe-editar-mudou">${tiposDetalhe.map(t => `<option value="${t.id}"${t.id === a.tipo_detalhe_id ? ' selected' : ''}>${escapeHtml(t.nome)}</option>`).join('')}</select></div>`)
        : '';
    if (typeof window.abrirSheetForm === 'function') {
        const campos =
            `<div class="rz-f"><label>Tipo</label><input type="text" value="${escapeHtml(rotuloTipoAtivo(a.tipo_ativo))}" disabled></div>` +
            blocoTipoDetalhe + blocoEmpreendimentoValor +
            `<div class="rz-f"><label>Nome de exibição <i>*</i></label><input type="text" id="fa-editar-nome" value="${escapeHtml(a.nome_exibicao)}"></div>` +
            `<div class="rz-campos-estruturados" id="fa-editar-campos-estruturados">${renderizarCamposEstruturados(a.tipo_ativo, a.dados_especificos || {}, 'fa-editar-campo-', a.tipo_detalhe_id)}</div>` +
            blocoEndereco + blocoImovel;
        window.abrirSheetForm({ titulo: 'Editar campos do ativo', sub: a.nome_exibicao, corpo: campos, rotuloSalvar: 'Salvar',
            aoSalvar: async () => { const ok = await salvarEdicaoAtivo(); return ok !== false; } });
        return;
    }
    const aberto = !document.getElementById('fa-editar-wrapper').classList.contains('hidden');
    if (aberto) { document.getElementById('fa-editar-wrapper').classList.add('hidden'); return; }
    // Tipo (categoria) exibido como somente-leitura (pedido explícito,
    // 25/08/2026) — não é um <select> editável de propósito: mudar a
    // categoria depois de criado trocaria todo o conjunto de campos
    // estruturados (obterCamposPorTipo), o que exigiria decidir o que
    // fazer com dados_especificos já preenchidos no formato antigo —
    // fora de escopo por ora. O TIPO ESPECÍFICO (dentro da categoria) já
    // não tem esse problema — ver blocoTipoDetalhe acima, a E5 liberou
    // esse nível (menos pra vinculado, ver nota acima).
    document.getElementById('fa-editar-campos').innerHTML =
        `<div class="sm:col-span-2"><label class="text-xs font-semibold block mb-1" style="color:var(--sage)">Tipo</label><input type="text" value="${escapeHtml(rotuloTipoAtivo(a.tipo_ativo))}" disabled class="w-full border-2 border-slate-200 rounded-xl p-2 text-sm bg-slate-50 text-slate-500"></div>` +
        (tiposDetalhe.length ? `<div class="sm:col-span-2"><label class="text-xs font-semibold block mb-1">Tipo específico</label>${vinculado
            ? `<input type="text" value="${escapeHtml(tiposDetalhe.find(t => t.id === a.tipo_detalhe_id)?.nome || '—')}" disabled class="w-full border-2 border-slate-200 rounded-xl p-2 text-sm bg-slate-50 text-slate-500">`
            : `<select id="fa-editar-tipo-detalhe" data-action-change="ativo-tipo-detalhe-editar-mudou" class="w-full border-2 border-slate-300 rounded-xl p-2 text-sm">${tiposDetalhe.map(t => `<option value="${t.id}"${t.id === a.tipo_detalhe_id ? ' selected' : ''}>${escapeHtml(t.nome)}</option>`).join('')}</select>`}</div>` : '') +
        blocoEmpreendimentoValor +
        `<div class="sm:col-span-2"><label class="text-xs font-semibold block mb-1">Nome de exibição</label><input type="text" id="fa-editar-nome" value="${escapeHtml(a.nome_exibicao)}" class="w-full border-2 border-slate-300 rounded-xl p-2 text-sm"></div>` +
        `<div id="fa-editar-campos-estruturados" class="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">${renderizarCamposEstruturados(a.tipo_ativo, a.dados_especificos || {}, 'fa-editar-campo-', a.tipo_detalhe_id)}</div>` +
        blocoEndereco + blocoImovel;
    document.getElementById('fa-editar-wrapper').classList.remove('hidden');
}

// E5 — troca do 2º seletor no form de EDITAR: só precisa re-renderizar
// os campos estruturados com o novo tipo_detalhe (mesmo padrão de
// aoMudarTipoDetalheAtivo, mas contra o wrapper de edição).
export function aoMudarTipoDetalheEditarAtivo() {
    const a = estado.ativoEmFoco;
    const sel = document.getElementById('fa-editar-tipo-detalhe');
    const tipoDetalheId = sel && sel.value ? sel.value : null;
    const wrap = document.getElementById('fa-editar-campos-estruturados');
    if (wrap) wrap.innerHTML = renderizarCamposEstruturados(a.tipo_ativo, a.dados_especificos || {}, 'fa-editar-campo-', tipoDetalheId);
}

export async function salvarEdicaoAtivo() {
    const a = estado.ativoEmFoco;
    const nome = document.getElementById('fa-editar-nome').value.trim();
    if (!nome) { mostrarToast('Nome não pode ficar vazio.', 'erro'); return false; }
    const selDetalhe = document.getElementById('fa-editar-tipo-detalhe');
    // Sem seletor no DOM (categoria sem tipo específico cadastrado, OU
    // vinculado — ver alternarEditarAtivo, vira <input disabled> sem
    // esse id de propósito): mantém o tipo_detalhe_id que o ativo já
    // tinha, não apaga.
    const tipoDetalheId = selDetalhe ? (selDetalhe.value || null) : a.tipo_detalhe_id;
    const dados = lerCamposEstruturados(a.tipo_ativo, 'fa-editar-campo-', tipoDetalheId);
    const patch = { nome_exibicao: nome, tipo_detalhe_id: tipoDetalheId, dados_especificos: dados };
    // E15.2 (achado no teste real, 16/09/2026) — empreendimento/valor de
    // referência são universais agora (qualquer tipo de ativo); pra
    // vinculado, entram no MESMO imoveisPatch abaixo (não em
    // cofre_ativos direto) — o gatilho espelha de volta sozinho.
    const empValLido = await lerBlocoEmpreendimentoValor('fa-editar-empval-', estado.clienteId);
    // v1.32.0 (E6.2) — só lê os blocos de endereço/imóvel se foram
    // renderizados (categoria imóvel); nos demais tipos os campos não
    // existem no DOM.
    // E15.2 (15/09/2026) — vinculado escreve em `imoveis`
    // (api.atualizarImovel), não em cofre_ativos: a vitrine pública lê
    // imoveis sem login, tem que continuar a fonte de verdade até a
    // E15.3. trg_imovel_atualiza_ativo (banco) espelha o resultado pra
    // cofre_ativos sozinho — nenhum 2º UPDATE precisa sair daqui.
    // Aluguel esperado é SEMPRE dados_especificos, nos 2 casos — não
    // sincroniza com `imoveis` (decisão do documento DE_PARA).
    if (ehCategoriaImovel(a.tipo_ativo)) {
        const enderecoLido = lerBlocoEndereco('fa-editar-endereco');
        const { camposImovel, aluguelDesejado } = lerBlocoImovel('fa-editar-imovel-');
        if (aluguelDesejado !== null) dados.aluguel_desejado = aluguelDesejado;
        if (ehImovelVinculado(a.entidade_origem_tipo)) {
            const imoveisPatch = {
                endereco_rua: enderecoLido.endereco_rua, endereco_num: enderecoLido.endereco_num,
                endereco_comp: enderecoLido.endereco_comp, endereco_bairro: enderecoLido.endereco_bairro,
                endereco_cidade: enderecoLido.endereco_cidade, uf: enderecoLido.uf, cep: enderecoLido.cep,
                codigo_ibge_municipio: enderecoLido.codigo_ibge_municipio,
                empreendimento_id: empValLido.empreendimento_id,
                valor_mercado: empValLido.valor_referencia,
                tamanho: camposImovel.area_m2,
                finalidade_uso: camposImovel.finalidade_uso,
                status: camposImovel.situacao_uso,
                descricao: camposImovel.observacao,
            };
            try {
                await api.atualizarImovel(a.entidade_origem_id, imoveisPatch);
            } catch (err) { mostrarToast('Erro ao salvar dados do imóvel: ' + err.message, 'erro'); return false; }
        } else {
            Object.assign(patch, enderecoLido, camposImovel, empValLido);
        }
    } else {
        // não-imóvel: só empreendimento/valor, direto em cofre_ativos
        Object.assign(patch, empValLido);
    }
    try {
        await api.atualizarAtivo(a.id, patch);
        await api.registrarLogAcessos(estado.clienteId, estado.pessoa.id, 'cofre.editar', { ativoId: a.id, acao: 'editar_ativo' });
        mostrarToast('Ativo atualizado');
        window.dispatchEvent(new CustomEvent('cofre:recarregar-ativos'));
        await abrirFichaAtivo(a.id); // "Salvar edição → voltar para a ficha atualizada" (§9.2)
        return true;
    } catch (err) { mostrarToast('Erro: ' + err.message, 'erro'); return false; }
}

// v1.18.0 — pontes App → Ativos que substituem as entradas nas telas
// antigas de Imóveis (index.html v1.108.0):
//   rzAbrirAtivosComFiltro('prop:Vago')  → lista de ativos já filtrada
//   rzAbrirAtivoDoImovel(imovelId)       → ficha do ativo dono do imóvel
window.rzAbrirAtivosComFiltro = function (status = '', alerta = '') {
    const selS = document.getElementById('filtro-ativo-status');
    const selA = document.getElementById('filtro-ativo-alerta');
    if (selS) selS.value = status;
    if (selA) selA.value = alerta;
    if (typeof window.switchTab === 'function') window.switchTab('tab-ativos');
    mudarTela('ativos');
    renderAtivosLista('', document.getElementById('filtro-ativo-busca')?.value || '');
};
window.rzAbrirAtivoDoImovel = function (imovelId) {
    const a = (estado.ativos || []).find(x => x.entidade_origem_tipo === 'imovel' && x.entidade_origem_id === imovelId);
    if (typeof window.switchTab === 'function') window.switchTab('tab-ativos');
    if (a) abrirFichaAtivo(a.id); else { mudarTela('ativos'); mostrarToast('Ativo deste imóvel não encontrado.', 'erro'); }
};

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
    if (typeof window.editarImovel !== 'function') { mostrarToast('Edição do imóvel só disponível dentro do app principal.', 'erro'); return; }
    // v1.18.0 — SEM switchTab('tab-imoveis'): o modal (#form-imovel-wrapper)
    // agora vive no <body> (index.html v1.108.0, rzMoverFormImovelParaBody)
    // e abre de qualquer aba. A ficha do ativo fica atrás do modal; ao
    // fechar/salvar, o App chama este hook e a ficha recarrega com os
    // dados novos. Nunca mais cai na lista antiga de imóveis.
    window.fichaOrigemAoEditarImovel = null;
    const ativoId = a.id;
    window.__rzAposFecharImovel = () => {
        window.dispatchEvent(new CustomEvent('cofre:recarregar-ativos'));
        if (estado.ativoEmFoco?.id === ativoId) abrirFichaAtivo(ativoId);
    };
    // v1.29.0 — INSTRUMENTAÇÃO (10/09/2026): window.editarImovel é uma
    // PONTE ASSÍNCRONA (import dinâmico do módulo imoveis.js, R8/A.8).
    // Antes a promise era ignorada — se o import ou a função falhassem, o
    // erro virava "unhandled rejection" no console e o usuário via só um
    // clique que não fazia nada. Agora o erro real aparece na tela.
    Promise.resolve(window.editarImovel(a.entidade_origem_id)).catch(err => {
        console.error('[ativos] Falha ao abrir o formulário do imóvel:', err);
        mostrarToast('Não consegui abrir o formulário: ' + (err?.message || err), 'erro');
    });
    // v1.18.1 (fatia 3b-ii) — síndico/manutencista/sócios/fotos já vivem na
    // ficha (Partes, Propriedade, Arquivos): escondidos no formulário
    // quando aberto daqui. cancelarEdicaoImovel() reexibe ao fechar.
    document.getElementById('imo-blocos-ficha')?.classList.add('hidden');
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
    // v1.19.0 — BUG (Nicola 03/09): linha sem toque. Agora abre o documento
    // (abrir-documento → abrirFichaDocumento), com chevron (= navega, §9).
    document.getElementById('fa-tab-documentos').innerHTML = docs.map(d => `
        <div class="rz-row rz-link" data-action="abrir-documento" data-id="${d.id}">
            <div class="rz-ic${d.origem === 'bot_whatsapp' ? ' rz-ia' : ''}"><i data-lucide="${d.origem === 'bot_whatsapp' ? 'bot' : 'file-text'}"></i></div>
            <div class="rz-tx"><b>${escapeHtml(d.nome_exibicao)}</b><span>${escapeHtml((estado.categorias || []).find(c => c.id === d.categoria_id)?.nome || 'Documento')}${d.origem === 'bot_whatsapp' ? ' · pelo Robô' : ''}${d.criado_em ? ' · ' + formatarDataBR(String(d.criado_em).slice(0, 10)) : ''}</span></div>
            <i data-lucide="chevron-right" class="rz-chev"></i>
        </div>`).join('');
    docsAtivoCache = docs;
    docsAtivoCount = docs.length;
    atualizarContadorArquivos();
    montarAnexosChips();
    aplicarFiltroAnexos();
}

// v1.20.0 — ANEXOS (Nicola 03/09): chips Todos · Fotos · <categorias>;
// documentos filtrados pela categoria escolhida; card de fotos no chip
// Fotos. IA + Upload sempre no rodapé (REGRAS §11 v3.10).
let docsAtivoCache = [];
let filtroAnexoAtual = 'todos';
function montarAnexosChips() {
    const wrap = document.getElementById('fa-anexos-chips');
    if (!wrap) return;
    const cats = new Map();
    docsAtivoCache.forEach(d => { const k = d.categoria_id || 'sem'; cats.set(k, (cats.get(k) || 0) + 1); });
    const nomeCat = id => id === 'sem' ? 'Sem categoria' : ((estado.categorias || []).find(c => c.id === id)?.nome || 'Documento');
    const chips = [
        { chave: 'todos', rotulo: 'Todos', n: docsAtivoCache.length + (fotosAtivoCache?.length || 0) },
        { chave: 'fotos', rotulo: 'Fotos', n: fotosAtivoCache?.length || 0 },
        ...[...cats.entries()].sort((x, y) => nomeCat(x[0]).localeCompare(nomeCat(y[0]))).map(([id, n]) => ({ chave: id, rotulo: nomeCat(id), n })),
    ];
    if (!chips.some(c => c.chave === filtroAnexoAtual)) filtroAnexoAtual = 'todos';
    wrap.innerHTML = chips.map(c => `<button type="button" data-action="fa-seg-arquivos" data-fa-seg="${c.chave}" class="rz-chip ${filtroAnexoAtual === c.chave ? 'rz-on' : ''}">${escapeHtml(c.rotulo)} <span class="rz-n">${c.n}</span></button>`).join('');
}
function aplicarFiltroAnexos() {
    const lista = document.getElementById('fa-tab-documentos');
    const vazio = document.getElementById('fa-documentos-vazio');
    const vazioTx = document.getElementById('fa-documentos-vazio-texto');
    const titulo = document.getElementById('fa-anexos-titulo');
    const sub = document.getElementById('fa-anexos-sub');
    const cardDocs = document.getElementById('fa-arq-documentos');
    const cardFotos = document.getElementById('fa-arq-fotos');
    const mostrarFotos = filtroAnexoAtual === 'fotos';
    cardFotos?.classList.toggle('hidden', !mostrarFotos);
    cardDocs?.classList.toggle('hidden', mostrarFotos);
    if (mostrarFotos) { refrescarIcones(); return; }
    const filtrados = filtroAnexoAtual === 'todos' ? docsAtivoCache : docsAtivoCache.filter(d => (d.categoria_id || 'sem') === filtroAnexoAtual);
    if (titulo) titulo.textContent = filtroAnexoAtual === 'todos' ? 'Anexos' : ((estado.categorias || []).find(c => c.id === filtroAnexoAtual)?.nome || 'Anexos');
    if (sub) sub.textContent = filtrados.length ? `${filtrados.length} documento${filtrados.length === 1 ? '' : 's'}` : '';
    lista.querySelectorAll('.rz-row').forEach(r => { r.classList.toggle('hidden', !filtrados.some(d => d.id === r.dataset.id)); });
    if (vazio) {
        vazio.classList.toggle('hidden', filtrados.length > 0);
        if (vazioTx) vazioTx.textContent = filtroAnexoAtual === 'todos'
            ? 'Nenhum anexo neste ativo. A IA lê matrícula, IPTU e apólices e preenche os controles sozinha.'
            : 'Nenhum documento nesta categoria.';
    }
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
    montarAnexosChips();
    if (!fotos.length) {
        // v1.19.0 — BUG (Nicola 03/09: "imóvel com fotos anexadas não
        // apresenta as fotos"): as fotos do cadastro antigo vivem em
        // imoveis.fotos (URLs), não em cofre_ativo_fotos. Enquanto não há
        // migração, mostra-as aqui em modo leitura (sem remover/vitrine).
        // v1.20.0 — MIGRAÇÃO das fotos base64 do cadastro antigo (as URLs já
        // foram migradas por SQL em 03/09): ao abrir a ficha, sobe pro Cofre
        // uma vez e recarrega. Depois disso imoveis.fotos não é mais lido aqui.
        const legado = fotosLegadasDoImovel(a);
        if (legado.length && !a.__migrandoFotos) {
            a.__migrandoFotos = true;
            try {
                await migrarFotosBase64(a, legado);
                mostrarToast(`${legado.length} foto${legado.length === 1 ? '' : 's'} do cadastro migrada${legado.length === 1 ? '' : 's'} pro Cofre`);
                return montarFotosAtivo(a);
            } catch (e) { console.error('[fotos] migração base64 falhou', e); }
        }
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

function fotosLegadasDoImovel(a) {
    if (a?.entidade_origem_tipo !== 'imovel' || !Array.isArray(window.imoveis)) return [];
    const imo = window.imoveis.find(i => i.id === a.entidade_origem_id);
    return (imo?.fotos || []).filter(u => typeof u === 'string' && u.startsWith('data:image/'));
}
async function migrarFotosBase64(a, dataUris) {
    let ordem = 0;
    for (const uri of dataUris) {
        const resp = await fetch(uri); const blob = await resp.blob();
        const ext = (blob.type.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
        const fotoId = crypto.randomUUID();
        const path = `${estado.clienteId}/ativos/${a.id}/fotos/${fotoId}_migrada.${ext}`;
        await api.uploadArquivoDocumento(path, new File([blob], `migrada.${ext}`, { type: blob.type }));
        await api.inserirFotoAtivo({ id: fotoId, cliente_id: estado.clienteId, ativo_id: a.id, bucket: 'cofre-documentos', storage_path: path, nome_arquivo: `migrada.${ext}`, ordem: ordem++, capa: ordem === 1, publicar_vitrine: false, legenda: 'Migrada do cadastro do imóvel', status: 'ativo', criado_por: estado.pessoa?.id || null });
    }
    const imo = window.imoveis.find(i => i.id === a.entidade_origem_id);
    if (imo) imo.fotos = [];
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
    statusEl.textContent = '';
    mostrarToast(arquivos.length === 1 ? 'Foto adicionada' : `${arquivos.length} fotos adicionadas`);
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

// v1.28.0 — A.9: a publicação na vitrine agora é real (cofre-api.js 1.23.0
// copia o arquivo pro bucket público e sincroniza imoveis.fotos) — toast
// atualizado, tirado o aviso de "ainda não implementada".
export async function alternarVitrineFoto(fotoId, valor) {
    try {
        await api.alternarPublicarVitrineFoto(fotoId, valor, estado.clienteId);
        mostrarToast(valor ? 'Foto publicada na vitrine.' : 'Foto removida da vitrine.');
    } catch (err) { mostrarToast('Erro: ' + err.message, 'erro'); }
}

// Histórico do Ativo removido (revisão DS, 25/08/2026) — pedido explícito:
// não deve ter opção "Histórico" no Mais ações do box do Ativo.
// api.listarHistoricoAtivo() (cofre-api.js) foi mantida — infraestrutura
// de log genérica, pode servir outro consumidor no futuro.
