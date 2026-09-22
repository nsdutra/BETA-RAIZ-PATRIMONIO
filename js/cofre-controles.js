// ============================================================================
// cofre-controles.js — Raiz Patrimônio · Cofre de Documentos
// Versão: 1.31.0 · 22/09/2026
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
export const VERSAO = '1.31.0'; // v-check: lido por ⚙️ › Conta › Versões — manter igual ao header
import { estado } from './cofre-estado.js';
import * as api from './cofre-api.js';
import { mostrarToast, refrescarIcones, abrirModal, fecharModal, modalGenerico } from './cofre-ui.js';
import { mudarTela } from './cofre-navegacao.js';
import { abrirUploadContextual } from './cofre-documentos.js';
import {
    escapeHtml, formatarDataBR, diasAte, chipVencimento,
    rotuloTipoControle, rotuloStatusOcorrencia, rotuloFrequencia, rotuloTipoAtivo, iconeAtivo,
    numeroWhatsAppComDDI,
    inicializarCatalogoTiposAtivo, listarTiposPorCategoria,
} from './cofre-validacoes.js';
// v1.31.0 (demanda be42b19f, "componente único de Parte") — Ficha e
// formulário de uma Parte passam a montar seus campos com o MESMO
// componente que Configurações › Partes usa (comum-partes.js, novo) +
// o bloco de endereço estruturado (comum-endereco.js, já existia — seu
// próprio header já previa "partes" como consumidor futuro).
import { renderizarBlocoDadosParte, lerBlocoDadosParte, renderizarResumoParte, formatarEnderecoParte } from './comum-partes.js';
import { renderizarBlocoEndereco, lerBlocoEndereco } from './comum-endereco.js';

let subtiposCache = null; // carregado 1x por sessão; catálogo muda pouco
// v1.20.2 (E0.2 / A8) — cache separado do catalogo FILTRADO pelo tipo de
// ativo em foco, usado so pelo seletor do formulario de item de controle.
// subtiposCache (acima) continua sendo o catalogo COMPLETO, porque as telas
// de cadastro de subtipos e de modelos precisam ver tudo.
let subtiposDoAtivoCache = { tipoAtivo: null, lista: null };
let modelosCache = null; // idem, pros modelos de item de controle por tipo de ativo
let modeloEmEdicao = null; // id do modelo sendo editado no momento, ou null (modo "criar novo")
let itensDoAtivoAtual = [];
let itemEmFoco = null;
let filtroControles = 'ativos'; // v1.20.0 — 'ativos' | 'encerrados'
function itensFiltrados() { return itensDoAtivoAtual.filter(i => filtroControles === 'encerrados' ? i.ativo === false : i.ativo !== false); }
function moedaBR(v) { return (typeof window.formatarMoedaBR === 'function') ? window.formatarMoedaBR(v) : 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
// BUG FIX (25/08/2026, achado pelo usuário) — guarda a tela de onde a
// ficha do item foi aberta de verdade (Home, Alertas ou Ficha do
// Ativo), pra "< Voltar" não mentir. Antes ia sempre pra "ficha-ativo",
// fixo — clicar num alerta na Visão Geral e depois "Voltar" não voltava
// pra Visão Geral. Mesma classe de bug já corrigida no Imóveis
// (fichaImovelOrigemTab, index.html v1.61.5).
let itemControleOrigemTela = null;
let ocorrenciaEmAcao = null; // { ocorrenciaId, modo: 'tratar'|'reagendar'|'estornar' }
// E14.4 — contatosDoItemAtual/contatoEmEdicaoId removidas (Contatos
// unificado com Partes, ver comentário mais abaixo).

// ============================================================================
// BOX "CONTROLES" na ficha do ativo — lista-resumo clicável
// ============================================================================
export async function montarControlesAtivo(a) {
    try {
        itensDoAtivoAtual = await api.listarItensControleAtivo(a.id, true); // v1.20.0 — inclui encerrados (filtro local)
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
// v1.21.0 (E11) — esta funcao DEIXOU DE DECIDIR A COR. Antes duas contas
// discordavam sobre a mesma bolinha: a local olhava so data de vencimento e
// escrevia "Em dia", enquanto o Motor acendia vermelho por outro motivo (e,
// depois da E2.3, tambem por alerta de contrato e financeiro) — dai a
// bolinha vermelha "com 0" e sem alerta visivel. Agora a conta local escreve
// so o NUMERO de itens; quem decide cor e texto e o Motor, em
// aplicarMotorNoChipControles(). O texto local fica como estado provisorio
// ate a resposta do Motor chegar, e nunca acende vermelho sozinho.
function atualizarEstadoChipControles() {
    const ativos = itensDoAtivoAtual.filter(i => i.ativo !== false); // v1.20.0 — encerrados não contam
    if (typeof window.faAtualizarContadorFicha === 'function') window.faAtualizarContadorFicha('controles', ativos.length, false);
    const cab = document.getElementById('fa-controles-status');
    if (!cab) return;
    if (motorDecidiuChipControles) return; // o Motor já falou; não sobrescreve
    cab.innerHTML = ativos.length ? statusHtml('neu', `${ativos.length} ite${ativos.length === 1 ? 'm' : 'ns'}`) : '';
}

// Rótulo curto por tipo de alerta, para o cabeçalho do chip dizer o MOTIVO
// em vez de só uma data. [singular, plural].
// v1.21.1 (FIX) — só os 2 tipos que são de fato item de controle: quem
// chama (cofre-ativos.js v1.31.3) já filtra por tipo_alerta antes de
// chegar aqui, mas o dicionário só tinha as outras 6 entradas por engano
// (contrato/financeiro) — nunca deveriam ter sido rótulo do chip Controles.
const ROTULO_ALERTA_CHIP = {
    anexo_apolice_pendente: ['documento pendente', 'documentos pendentes'],
    cofre_item_vencendo:    ['item de controle', 'itens de controle'],
};

let motorDecidiuChipControles = false;

export function reiniciarChipControlesDoMotor() {
    motorDecidiuChipControles = false;
}

// v1.21.0 (E11) — FONTE ÚNICA da cor e do texto do chip "Controles".
// Recebe o que fn_alertas_do_ativo devolveu (cofre-ativos.js busca) e pinta.
// Pode ACENDER e também APAGAR — era justamente a regra "só acende, nunca
// apaga" da v1.31.0 que deixava vermelho preso depois de resolver a causa.
//
// CORRIGIDO v1.29.0 (18/09/2026, achado do Nicola: "no ativo da Faria Lima
// tem um alerta vermelho mas sem item em alerta aparente") — mesma classe de
// bug do comentário logo acima (chip acende sem alerta visível), causa
// diferente: fn_diario_cofre_item_vencendo devolve todo item dentro da
// JANELA DE ANTECEDÊNCIA do subtipo (30/60/90 dias antes, calculado no
// banco) — não "vencendo" no sentido visual do resto do app, que só trata
// dias===0 como alerta de verdade (dias>0, qualquer magnitude, é 'run'/azul,
// "em andamento", sem grifo — mesma régua "há/em xx d" de linhaAlertaHtml/
// ativoCardHtml/fraseVencimento). Este chip pintava .rz-warn (marrom, lido
// como "vermelho" pelo usuário) pra QUALQUER dias de 0 a 30 — um item a 21
// ou 28 dias (calmo em toda outra tela) acendia "Controles" como urgente,
// sem nenhum vencido/vence-hoje pra mostrar quando a lista abria. Só vencido
// (dias<0) e vence-hoje (dias===0) acendem o chip agora; dias>0 fica calmo,
// sem grifo. Pendência sem data (ex.: anexo_apolice_pendente) continua
// acendendo — é ação real sem prazo pra comparar, não um falso alarme.
//
// CORRIGIDO v1.30.0 (18/09/2026, rodada 10 — achado do Nicola: "sumiu o
// vermelho e aparece 'a vencer'; nestes casos onde não há nada vencido,
// deixar em dia") — a v1.29.0 (linha acima) resolveu a cor errada (chip não
// acende mais 'warn' pra item calmo), mas ainda escrevia "N a vencer" no
// texto quando havia itens na janela sem nenhum urgente de verdade — o
// Nicola quer que, sem NADA vencido/vence-hoje/pendente, o chip diga
// simplesmente "Em dia" (mesmo texto/cor de "nenhum alerta"), sem contar
// itens futuros que não pedem ação nenhuma agora. As 2 branches (lista
// vazia e lista com itens mas sem urgente) convergem pro mesmo resultado.
export function aplicarMotorNoChipControles(alertas) {
    motorDecidiuChipControles = true;
    const lista = Array.isArray(alertas) ? alertas : [];
    const chip = document.getElementById('fa-chip-n-controles')?.closest('.rz-chip');
    const cab = document.getElementById('fa-controles-status');
    const ativos = itensDoAtivoAtual.filter(i => i.ativo !== false);

    if (!lista.length) {
        chip?.classList.remove('rz-warn');
        if (cab) cab.innerHTML = ativos.length ? statusHtml('ok', 'Em dia') : '';
        return;
    }

    // Urgente de verdade: vencido, vence hoje, ou sem data pra comparar
    // (pendência de documento). dias>0 sozinho NUNCA acende o chip.
    const urgentes = lista.filter(x => x.dias === null || x.dias <= 0);

    if (!urgentes.length) {
        chip?.classList.remove('rz-warn');
        if (cab) cab.innerHTML = statusHtml('ok', 'Em dia');
        return;
    }

    chip?.classList.add('rz-warn');
    if (!cab) return;

    const vencidos = urgentes.filter(x => x.dias !== null && x.dias < 0).length;
    if (vencidos) { cab.innerHTML = statusHtml('bad', `${vencidos} vencido${vencidos === 1 ? '' : 's'}`); return; }

    const venceHoje = urgentes.filter(x => x.dias === 0).length;
    if (venceHoje) { cab.innerHTML = statusHtml('warn', venceHoje === 1 ? 'Vence hoje' : `${venceHoje} vencem hoje`); return; }

    // Sem data: o motivo é o tipo mais frequente entre os alertas do ativo.
    const contagem = {};
    urgentes.forEach(x => { contagem[x.tipo_alerta] = (contagem[x.tipo_alerta] || 0) + 1; });
    const tipo = Object.keys(contagem).sort((a, b) => contagem[b] - contagem[a])[0];
    const n = contagem[tipo];
    const rot = ROTULO_ALERTA_CHIP[tipo] || ['pendência', 'pendências'];
    cab.innerHTML = statusHtml('warn', `${n} ${n === 1 ? rot[0] : rot[1]}`);
}

// v1.20.0 — chip Ativos/Encerrados (mesmo molde do chip "Encerrados" de Contratos)
export function filtrarControles(chave) {
    filtroControles = chave === 'encerrados' ? 'encerrados' : 'ativos';
    renderizarListaControles();
}
function chipsControlesHtml() {
    const nEnc = itensDoAtivoAtual.filter(i => i.ativo === false).length;
    if (!nEnc) { filtroControles = 'ativos'; return ''; }
    const nAt = itensDoAtivoAtual.length - nEnc;
    const chip = (k, r, n) => `<button type="button" class="rz-chip ${filtroControles === k ? 'rz-on' : ''}" data-action="filtrar-controles-encerrados" data-chave="${k}">${r} <span class="rz-n">${n}</span></button>`;
    return `<div class="rz-chips" style="margin-bottom:6px">${chip('ativos', 'Ativos', nAt)}${chip('encerrados', 'Encerrados', nEnc)}</div>`;
}

function renderizarListaControles() {
    const alvo = document.getElementById('fa-tab-controles');
    if (!alvo) return;
    atualizarEstadoChipControles();
    const lista = itensFiltrados(); // v1.20.0
    if (!itensDoAtivoAtual.length) {
        // v1.13.0 — vazio no formato único (REGRAS §9): a ação fica no
        // rodapé do card ("Novo item"), por isso o vazio não repete botão.
        alvo.innerHTML = `<div class="rz-empty"><div class="rz-ic"><i data-lucide="shield"></i></div><p>Nenhum item de controle ainda. Seguros, tributos e vistorias cadastrados aqui viram alertas automáticos.</p></div>`;
        refrescarIcones();
        return;
    }
    alvo.innerHTML = chipsControlesHtml() + (lista.length ? lista.map(itemResumoHtml).join('')
        : `<div class="rz-empty"><p>Nenhum item ${filtroControles === 'encerrados' ? 'encerrado' : 'ativo'}.</p></div>`);
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
    if (item.ativo === false) { // v1.20.0 — encerrado: histórico visível, sem urgência
        return `<div class="rz-row rz-link" data-action="abrir-item-controle" data-id="${item.id}">
            <div class="rz-ic rz-neu"><i data-lucide="archive"></i></div>
            <div class="rz-tx"><b>${escapeHtml(item.titulo)}</b><span>${escapeHtml(subtitulo)}</span></div>
            <div class="rz-rt">${statusHtml('neu', 'Encerrado')}</div>
            <i data-lucide="chevron-right" class="rz-chev"></i>
        </div>`;
    }
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
    if (dias !== null && dias < 0) { sem = 'bad'; rotulo = `há ${Math.abs(dias)}d`; classeIc = ' rz-bad'; }
    else if (dias === 0) { sem = 'warn'; rotulo = 'Vence hoje'; classeIc = ' rz-warn'; }
    // CORRIGIDO v1.27.0 (padrão "há/em xx d") — de 0 a 30 dias caía tudo em
    // 'warn' com rótulo cru ("13 dias"), sem o prefixo "Em" e na cor de
    // "vai virar problema" (--warning, marrom) em vez da cor de "ainda
    // dentro do prazo" (--info/azul, REGRAS_EXPERIENCIA §9: "run" cobre
    // exatamente "A vencer"/"A pagar"). Só o dia exato do vencimento
    // (dias===0, acima) fica em 'warn' — o resto do prazo é 'run'.
    else if (dias !== null && dias <= 30) { sem = 'run'; rotulo = `Em ${dias}d`; classeIc = ''; }
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
            { icone: 'layers', titulo: 'Modelos de item', codigo: 'cofre.controles.editar', sub: 'Modelos prontos pra criar mais rápido', aoTocar: () => abrirModelosControle() },
            { icone: 'tags', titulo: 'Tipos de controle', codigo: 'cofre.controles.editar', sub: 'Subtipos de seguro, tributo e manutenção', aoTocar: () => abrirSubtiposControle() },
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
    { v: 'orgao_recolhedor', l: 'Órgão recolhedor (prefeitura, Detran...)' }, // E14.3
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
    // E14.4 ("A5") — atalho de WhatsApp por parte, migrado da seção
    // Contatos (removida — unificada aqui). Só aparece se a parte tiver
    // whatsapp cadastrado, mesmo critério de antes.
    //
    // CORRIGIDO (18/09/2026, pedido explícito: "no cadastro e edição de
    // uma parte... deve aparecer os campos... e a opção de ver e poder
    // acionar o contato via 3 pontinhos") — a linha inteira abria
    // abrirEditarPartesItem() (editor da LISTA de vínculos — pra
    // adicionar/trocar quem está ligado ao item, sem mostrar dado nenhum
    // da parte tocada). Isso continua existindo, só que agora só pelo ⋮ do
    // CABEÇALHO do box (abrir-acoes-partes-item, ativos-markup.js — mesma
    // função, nada mudou aí). A linha agora abre abrirFichaParte(), a
    // ficha da parte tocada (dados + Editar/Acionar).
    mount.innerHTML = linhas.map(l => `
        <div class="rz-row rz-link" data-action="abrir-ficha-parte" data-id="${l.parte_id}">
            <div class="rz-ic"><i data-lucide="briefcase"></i></div>
            <div class="rz-tx"><b>${escapeHtml(l.nome)}</b><span>${escapeHtml(rotuloPapelParteItem(l.papel))}${l.whatsapp ? ' · ' + escapeHtml(l.whatsapp) : ''}</span></div>
            ${l.whatsapp ? `<button type="button" data-action="acionar-parte-item-direto" data-whatsapp="${escapeHtml(l.whatsapp)}" title="Chamar no WhatsApp" class="rz-ico-btn" style="width:36px;height:36px"><i data-lucide="message-circle" style="width:18px;height:18px;color:var(--success)"></i></button>` : ''}
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

    // E14.3 ("A15", 15/09/2026, decisão do Nicola: parte padrão é padrão
    // pra TODAS as empresas — prefeitura, órgão recolhedor, materializado
    // por tenant no primeiro uso) — só sugere quando o item ainda não tem
    // NENHUMA parte (não empurra em cima de quem já preencheu à mão).
    let sugestaoPadraoHtml = '';
    if (atuais.length === 0 && item.subtipo_id) {
        const padrao = await api.resolverPartePadrao(item.subtipo_id, item.cofre_ativos?.codigo_ibge_municipio, item.cofre_ativos?.uf);
        if (padrao) {
            sugestaoPadraoHtml = `
                <div class="rz-row" style="background:var(--cream);border-radius:10px;padding:10px;margin-bottom:10px;">
                    <div class="rz-tx"><b>Usar parte padrão?</b><span>${escapeHtml(padrao.nome)}</span></div>
                    <button onclick="window.__piUsarPartePadrao('${padrao.id}','${escapeHtml(padrao.nome).replace(/'/g, "\\'")}')" class="text-xs font-bold px-2.5 py-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300">Usar</button>
                </div>`;
        }
    }

    modalGenerico('Editar partes do item', `
        ${sugestaoPadraoHtml}
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

// E14.3 — clique em "Usar" na sugestão: materializa (ou reaproveita) a
// parte na empresa atual e adiciona como linha, igual "Adicionar parte"
// faria manualmente — o "Salvar" do modal continua sendo o que grava de
// verdade (fluxo intacto, só ganhou um atalho pra não digitar).
window.__piUsarPartePadrao = async function (partePadraoId, nome) {
    try {
        const parteId = await api.materializarPartePadrao(estado.clienteId, partePadraoId);
        partesClienteCache = null; // invalida — a parte materializada é nova pro cache
        partesItemLinhasEmEdicao.push({ parte_id: parteId, papel: 'orgao_recolhedor', nomeNovo: '' });
        renderPartesItemEditor();
        // some com a sugestão depois de usada, pra não oferecer 2x
        const sugestao = document.querySelector('#modal-generico .rz-row');
        if (sugestao) sugestao.remove();
    } catch (err) {
        mostrarToast('Erro ao usar parte padrão: ' + (err.message || String(err)), 'erro');
    }
};

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
// v1.20.3 (E1) — `taxa` cai em despesa de tributo (condomínio, marina, TUF);
// `documento` não gera despesa e continua caindo no fallback 'outro'.
const CATEGORIA_DESPESA_POR_TIPO_ITEM = { seguro: 'seguro', manutencao: 'manutencao', tributo: 'tributo', taxa: 'tributo' };

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
    const statusItem = item.ativo === false ? statusHtml('neu', 'Encerrado') // v1.20.0
        : item.alerta_ativo === false ? statusHtml('neu', 'Alertas desligados')
        : diasProx === null ? statusHtml('ok', 'Sem pendência')
        : diasProx < 0 ? statusHtml('bad', `há ${Math.abs(diasProx)}d`)
        : diasProx === 0 ? statusHtml('warn', 'Vence hoje')
        // CORRIGIDO v1.27.0 (padrão "há/em xx d") — ver nota na mesma
        // rodada em cardItemControleHtml(): "run"/azul, não "warn"/marrom.
        : diasProx <= 30 ? statusHtml('run', `Em ${diasProx}d`)
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
        kv('Alerta', `${item.antecedencia_alerta_dias} dias antes · ${item.direcao_alerta === 'fim' ? 'a partir do fim' : 'a partir do início'}`) +
        (item.valor_previsto ? kv('Valor previsto', `${moedaBR(item.valor_previsto)}${(item.parcelas || 1) > 1 ? ` · ${item.parcelas}× de ${moedaBR(item.valor_previsto / item.parcelas)}` : ''}`) : ''); // v1.20.0
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
            else if (dias < 0) { sem = 'bad'; rot = `há ${Math.abs(dias)}d`; ic = 'alarm-clock'; cls = ' rz-bad'; }
            else if (dias === 0) { sem = 'warn'; rot = 'Vence hoje'; ic = 'clock'; cls = ' rz-warn'; }
            // CORRIGIDO v1.27.0 (padrão "há/em xx d") — mesma correção da
            // rodada: "run"/azul (REGRAS_EXPERIENCIA §9, "A vencer"/"A
            // pagar"), não "warn"/marrom, pro prazo ainda não vencido.
            else if (dias <= 30) { sem = 'run'; rot = `Em ${dias}d`; ic = 'clock'; cls = ''; }
            return `<div class="rz-row rz-link" data-action="abrir-acoes-ocorrencia" data-id="${oc.id}">
                <div class="rz-ic${cls}"><i data-lucide="${ic}"></i></div>
                <div class="rz-tx"><b>${aberta ? 'Vence ' : (oc.status_execucao === 'concluido' ? 'Tratada · ' : '')}${formatarDataBR(oc.data_prevista_atual)}${(oc.valor_real ?? oc.valor_previsto) ? ` · ${moedaBR(oc.valor_real ?? oc.valor_previsto)}` : ''}</b><span>${oc.tratamento_descricao ? escapeHtml(oc.tratamento_descricao) : (aberta ? 'Toque pra tratar ou reagendar' : rotuloStatusOcorrencia(oc.status_execucao))}</span></div>
                <div class="rz-rt">${statusHtml(sem, rot)}</div>
                <i data-lucide="ellipsis-vertical" class="rz-chev"></i>
            </div>`;
        }).join('');
    }

    montarPartesItemControle(item);

    // ---- Box Alertas vinculados: REMOVIDO (v6) — a própria ocorrência
    // (acima) já É o alerta; não existe mais cadastro de alerta avulso.
    // ---- Box Contatos vinculados: REMOVIDO (E14.4, "A5") — unificado
    // com Partes, ver comentário em montarPartesItemControle().

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
        ...(item.ativo === false ? [ // v1.20.0 — encerrado
            { icone: 'rotate-ccw', titulo: 'Reabrir item', codigo: 'cofre.controles.editar', sub: 'Volta a gerar ocorrências e alertas', aoTocar: () => reabrirItemControleAtual() },
        ] : [
            { icone: 'pencil', titulo: 'Editar item', codigo: 'cofre.controles.editar', aoTocar: () => abrirEditarItem() },
            { icone: 'archive', titulo: 'Encerrar item', codigo: 'cofre.controles.desativar', sub: 'Para de gerar alertas; histórico fica visível em "Encerrados"', aoTocar: () => encerrarItemControleAtual() },
        ]),
        { icone: 'trash-2', titulo: 'Excluir item de vez', codigo: 'cofre.controles.desativar', sub: 'Some do banco. Bloqueado se houver ocorrência já tratada', tipo: 'bad', aoTocar: () => excluirItemControleAtual() },
    ] });
}
export function abrirAcoesPartesItem() {
    const item = itemEmFoco; if (!item) return;
    sheetAcoes({ titulo: 'Partes do item', sub: item.titulo, acoes: [
        { icone: 'users', titulo: 'Editar partes', codigo: 'cofre.controles.editar', sub: 'Quem responde por este item', aoTocar: () => abrirEditarPartesItem() },
        { icone: 'receipt', titulo: 'Gerar despesa', codigo: 'saidas.registrar', sub: 'Lançamento com a parte como fornecedor', aoTocar: () => abrirNovoLancamentoDoItem() },
    ] });
}
export function abrirAcoesDocsItem() {
    sheetAcoes({ titulo: 'Documentos do item', sub: itemEmFoco?.titulo || '', acoes: [
        { icone: 'upload', titulo: 'Carregar documento', codigo: 'cofre.upload', sub: 'Apólice, guia, laudo — com leitura por IA', tipo: 'ia', aoTocar: () => carregarNovoDocumentoItem() },
    ] });
}
// E14.4 — abrirAcoesContatosItem/alternarMaisAcoesContatosItem
// removidas (Contatos unificado com Partes; "Adicionar parte" já existe
// dentro de "Editar partes", abrirAcoesPartesItem acima).
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
        acoes.push({ icone: 'check', titulo: 'Dar baixa', codigo: 'cofre.ocorrencias.tratar', sub: 'Marca como tratada, com descrição opcional', aoTocar: () => alternarAcaoOcorrencia(ocorrenciaId, 'tratar') });
        acoes.push({ icone: 'calendar', titulo: 'Reagendar', codigo: 'cofre.ocorrencias.reagendar', sub: 'Muda a data prevista desta ocorrência', aoTocar: () => alternarAcaoOcorrencia(ocorrenciaId, 'reagendar') });
    } else if (oc.status_execucao === 'concluido') {
        acoes.push({ icone: 'undo-2', titulo: 'Estornar', codigo: 'cofre.ocorrencias.estornar', sub: 'Volta pra "Em aberto", fica no histórico', tipo: 'bad', aoTocar: () => alternarAcaoOcorrencia(ocorrenciaId, 'estornar') });
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
        window.abrirSheetForm({ titulo: 'Dar baixa', codigo: 'cofre.ocorrencias.tratar', sub, rotuloSalvar: 'Confirmar baixa',
            corpo: `<div class="rz-f"><label>Descrição da baixa</label><textarea id="oc-tratar-descricao" rows="3" placeholder="Opcional — o que foi feito, com quem, valor"></textarea></div>`,
            aoSalvar: async () => { await confirmarTratarOcorrencia(ocorrenciaId); } });
    } else if (modo === 'reagendar') {
        window.abrirSheetForm({ titulo: 'Reagendar', codigo: 'cofre.ocorrencias.reagendar', sub, rotuloSalvar: 'Confirmar novo prazo',
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
    const elVp = document.getElementById('fic-ed-valor-previsto'); if (elVp) elVp.value = item.valor_previsto ?? ''; // v1.20.0
    const elPc = document.getElementById('fic-ed-parcelas'); if (elPc) elPc.value = item.parcelas || 1;
    const elPi = document.getElementById('fic-ed-parcela-intervalo'); if (elPi) elPi.value = item.parcela_intervalo_dias || 30;
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
    const valorPrevisto = parseFloat(document.getElementById('fic-ed-valor-previsto')?.value) || null; // v1.20.0
    const parcelas = Math.max(1, parseInt(document.getElementById('fic-ed-parcelas')?.value, 10) || 1);
    const parcelaIntervalo = Math.max(1, parseInt(document.getElementById('fic-ed-parcela-intervalo')?.value, 10) || 30);
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
        const depois = { tipo, titulo, subtipo_id: subtipoId, recorrente: !!freqIntervalo, frequencia_intervalo: freqIntervalo, frequencia_unidade: freqUnidade, antecedencia_alerta_dias: antecedencia, data_base: dataInicio, data_fim: dataFim, direcao_alerta: direcaoAlerta,
            valor_previsto: valorPrevisto, parcelas, parcela_intervalo_dias: parcelaIntervalo }; // v1.20.0
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
                await api.registrarLogAcessos(estado.clienteId, estado.pessoa.id, 'cofre.controles.editar', { itemId: item.id, ocorrenciasGeradas: payloads.length });
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

// v1.20.0 — A.10/v2.2: Encerrar (soft) — abertas e despesas previstas somem
// por trigger; concluídas e realizadas ficam. Documentos vinculados não são
// tocados (continuam no item, visível em "Encerrados").
export async function encerrarItemControleAtual() {
    const item = itemEmFoco; if (!item) return;
    const abertas = (item.cofre_ocorrencias_controle || []).filter(o => o.status_execucao === 'aberto').length;
    if (!confirm(`Encerrar "${item.titulo}"?\n\nEle para de gerar ocorrências e alertas${abertas ? ` (${abertas} em aberto somem, com as despesas previstas delas)` : ''}. O que já foi tratado fica no histórico, visível em "Encerrados". Dá pra reabrir depois.`)) return;
    try {
        await api.encerrarItemControle(item.id);
        await api.registrarHistoricoItemControle({ item_id: item.id, acao: 'encerrar', antes: item, depois: { ...item, ativo: false }, pessoa_id: estado.pessoa.id, origem: 'app' });
        await api.registrarLogAcessos(estado.clienteId, estado.pessoa.id, 'cofre.controles.desativar', { itemId: item.id, modo: 'encerrar' });
        mostrarToast('Item encerrado.');
        voltarFichaItemControle();
        window.dispatchEvent(new CustomEvent('cofre:recarregar-eventos'));
    } catch (err) { mostrarToast('Erro: ' + err.message, 'erro'); }
}
export async function reabrirItemControleAtual() {
    const item = itemEmFoco; if (!item) return;
    try {
        await api.reabrirItemControle(item.id);
        await api.registrarHistoricoItemControle({ item_id: item.id, acao: 'reabrir', antes: item, depois: { ...item, ativo: true }, pessoa_id: estado.pessoa.id, origem: 'app' });
        await api.registrarLogAcessos(estado.clienteId, estado.pessoa.id, 'cofre.controles.editar', { itemId: item.id, modo: 'reabrir' });
        mostrarToast('Item reaberto — as próximas ocorrências voltam a ser geradas pela regra.');
        await recarregarFichaItemControle();
        window.dispatchEvent(new CustomEvent('cofre:recarregar-eventos'));
    } catch (err) { mostrarToast('Erro: ' + err.message, 'erro'); }
}

export async function excluirItemControleAtual() {
    const item = itemEmFoco;
    // v1.20.0 — exclusão DE VERDADE (v2.2). Guarda no banco: com ocorrência
    // tratada, o DELETE falha com a mensagem do trigger (mostrada abaixo).
    if ((item.cofre_ocorrencias_controle || []).some(o => o.status_execucao === 'concluido')) {
        mostrarToast('Este item tem ocorrências já tratadas. Estorne-as antes de excluir — ou use "Encerrar item" pra manter o histórico.', 'erro'); return;
    }
    if (!confirm(`Excluir DE VEZ o item de controle "${item.titulo}"?\n\nEle some do banco com as ocorrências em aberto e as despesas previstas delas. Não dá pra desfazer. Se quiser só parar os alertas mantendo o histórico, use "Encerrar item".`)) return;

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
        await api.registrarHistoricoItemControle({ item_id: item.id, acao: 'excluir', antes: item, depois: null, pessoa_id: estado.pessoa.id, origem: 'app' }); // antes do DELETE (FK)
        await api.excluirItemControleDeVez(item.id); // v1.20.0
        await api.registrarLogAcessos(estado.clienteId, estado.pessoa.id, 'cofre.controles.desativar', { itemId: item.id });

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

// ---- Contatos vinculados ao item: REMOVIDO (E14.4 "A5", 15/09/2026,
// decisão do Nicola: "vamos fazer a 15.2 e a migração dos dados") —
// unificado com Partes (que já cobre o mesmo papel — vínculo com
// item_controle, nome, telefone/whatsapp/e-mail — só faltava o atalho
// de WhatsApp de 1 toque, que montarPartesItemControle() ganhou acima).
// modal-editar-contato-item, ligarMascaraEValidacaoContato,
// abrirNovoContatoItem, abrirEditarContatoItem, fecharEditarContatoItem,
// salvarContatoItemModal, excluirContatoItemModal saíram — Partes já
// tem seu próprio editor (abrirEditarPartesItem, com sugestão de parte
// padrão desde a E14.3). 12 registros reais migrados pra `partes` +
// `partes_papeis` em migration própria (e14_4_migrar_contatos_para_
// partes_v1) — cofre_contatos_acionamento não foi apagada (histórico),
// só parou de ser lida/escrita pelo app.
export function acionarParteItemDireto(whatsapp) {
    if (!whatsapp) { mostrarToast('Esta parte não tem WhatsApp cadastrado.', 'erro'); return; }
    const item = itemEmFoco;
    const descricaoItem = item.tipo ? `${item.titulo} (${rotuloTipoControle(item.tipo)})` : item.titulo;
    const mensagem = `Olá! Poderia nos enviar uma cotação atualizada para a renovação do item de controle "${descricaoItem}"? Obrigado!`;
    // BUG FIX (25/08/2026, achado pelo usuário, herdado da função antiga
    // de Contatos) — numeroWhatsAppComDDI() garante o prefixo 55 quando
    // só DDD+número foi salvo.
    const numero = numeroWhatsAppComDDI(whatsapp);
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`, '_blank', 'noopener');
}

// ============================================================================
// FICHA DA PARTE (NOVO, 18/09/2026, pedido explícito: "no cadastro e edição
// de uma parte dentro do item de controle ou contrato, deve aparecer os
// campos do cadastro como telefone, endereço... e a opção de ver e poder
// acionar o contato via menu de 3 pontinhos") — até aqui não existia NENHUM
// visualizador/editor de 1 parte só: tocar numa linha de Partes do item
// abria abrirEditarPartesItem() (o editor da LISTA de vínculos, útil pra
// adicionar/trocar/remover quem está ligado ao item, mas não mostra nem
// deixa editar os dados da própria parte — telefone, endereço etc.).
// abrirFichaParte() é o fluxo único novo (mesmo espírito de
// abrirFichaDocumento() — 1 função, vários chamadores): mostra os dados
// (sheet de ações com o resumo no subtítulo) e oferece Editar/Acionar.
// Chamada por data-action="abrir-ficha-parte" (linha da parte, abaixo, e
// contratos.js — atalho "Editar locatário"/fiador), então funciona de
// qualquer tela sem import cruzado (mesmo padrão de abrir-documento).
// v1.31.0 (demanda be42b19f, item 4 — "clicar numa parte listada deveria
// abrir um resumo com a maioria dos dados dela") — antes cabia tudo numa
// linha só de subtítulo do menu de ações (sheetAcoes); passa a abrir a
// MESMA gramática de ficha só-leitura usada em Configurações › Partes
// (abrirSheet + rzSheetCabecalho + .rz-kv, index.html), com
// renderizarResumoParte() (comum-partes.js) montando o card — Editar/
// Acionar continuam logo abaixo, como ações da própria ficha (não um
// sheet de menu separado). Cai pra sheetAcoes simples se abrirSheet não
// existir por algum motivo (defensivo, mesmo padrão de abrirSheetForm
// abaixo).
export async function abrirFichaParte(parteId) {
    if (!parteId) { mostrarToast('Parte não encontrada.', 'erro'); return; }
    let p;
    try { p = await api.buscarParte(parteId); } catch (err) { mostrarToast('Erro ao carregar a parte: ' + (err.message || String(err)), 'erro'); return; }
    if (!p) { mostrarToast('Parte não encontrada.', 'erro'); return; }

    if (typeof window.abrirSheet !== 'function' || typeof window.rzSheetCabecalho !== 'function') {
        const linhasInfo = [p.documento, p.whatsapp, p.email, formatarEnderecoParte(p)].filter(Boolean);
        sheetAcoes({
            titulo: p.nome || 'Parte',
            sub: linhasInfo.length ? linhasInfo.join(' · ') : 'Sem dados de contato cadastrados ainda',
            acoes: [
                { icone: 'pencil', titulo: 'Editar dados', codigo: 'cofre.controles.editar', sub: 'Nome, documento, telefone, e-mail, endereço', aoTocar: () => abrirEditarParte(parteId) },
                ...(p.whatsapp ? [{ icone: 'message-circle', titulo: 'Acionar por WhatsApp', aoTocar: () => acionarParteWhatsAppDireto(p.whatsapp) }] : []),
                ...(p.email ? [{ icone: 'mail', titulo: 'Acionar por e-mail', aoTocar: () => acionarParteEmailDireto(p.email) }] : []),
            ]
        });
        return;
    }

    window.abrirSheet(window.rzSheetCabecalho(p.nome || 'Parte', p.documento ? `${p.doc_tipo || ''} ${p.documento}`.trim() : '') + `
        <div class="rz-sh-b">
            <div class="rz-card">
                <div class="rz-card-h"><h3>Dados</h3><button type="button" onclick="window.__rzPartesItem_editar('${parteId}')" class="rz-more" aria-label="Editar"><svg data-lucide="pencil"></svg></button></div>
                ${renderizarResumoParte(p)}
            </div>
            <div style="display:flex;gap:8px;margin-top:4px">
                ${p.whatsapp ? `<button type="button" onclick="window.__rzPartesItem_whatsapp('${escapeHtml(p.whatsapp)}')" style="flex:1;background:var(--tile);color:var(--success);font-weight:bold;font-size:12.5px;padding:9px;border:none;border-radius:8px;display:flex;align-items:center;justify-content:center;gap:6px"><svg data-lucide="message-circle" style="width:14px;height:14px"></svg> WhatsApp</button>` : ''}
                ${p.email ? `<button type="button" onclick="window.__rzPartesItem_email('${escapeHtml(p.email)}')" style="flex:1;background:var(--tile);color:var(--pine);font-weight:bold;font-size:12.5px;padding:9px;border:none;border-radius:8px;display:flex;align-items:center;justify-content:center;gap:6px"><svg data-lucide="mail" style="width:14px;height:14px"></svg> E-mail</button>` : ''}
            </div>
        </div>`);
    if (typeof lucide !== 'undefined') lucide.createIcons();
}
// Bridges pro onclick inline do sheet acima — este módulo é sempre
// dinamicamente importado (nunca <script> clássico), então os onclick
// (resolvidos em tempo de clique, contra o escopo global) precisam de um
// window.* pra achar as funções do módulo. Mesmo padrão já usado por
// comum-endereco.js (window.rzConsultarCepBloco etc.).
window.__rzPartesItem_editar = (parteId) => abrirEditarParte(parteId);
window.__rzPartesItem_whatsapp = (whatsapp) => acionarParteWhatsAppDireto(whatsapp);
window.__rzPartesItem_email = (email) => acionarParteEmailDireto(email);

// Acionar genérico (fora do contexto de "cotação de renovação" de
// acionarParteItemDireto, acima, que é específico do item em foco) — usado
// pela Ficha da Parte, que pode ser aberta de um contrato onde não existe
// item de controle nenhum em foco.
export function acionarParteWhatsAppDireto(whatsapp) {
    if (!whatsapp) { mostrarToast('Esta parte não tem WhatsApp cadastrado.', 'erro'); return; }
    window.open(`https://wa.me/${numeroWhatsAppComDDI(whatsapp)}`, '_blank', 'noopener');
}

export function acionarParteEmailDireto(email) {
    if (!email) { mostrarToast('Esta parte não tem e-mail cadastrado.', 'erro'); return; }
    window.open(`mailto:${email}`, '_blank', 'noopener');
}

// v1.31.0 (demanda be42b19f, item 3 — "Editar abre formulário incompleto:
// sem endereço e demais atributos") — corpo passa a ser montado por
// renderizarBlocoDadosParte()/renderizarBlocoEndereco() (mesmos 2
// componentes agora usados em Configurações › Partes, index.html), em vez
// de 5 campos escritos à mão aqui — ganha profissão/estado civil e o
// bloco de endereço estruturado (CEP/rua/número/bairro/cidade/UF, com
// busca automática por CEP) de graça, sem duplicar HTML. Grava as duas
// formas de endereço: as colunas estruturadas (edição) + `endereco`
// texto (compatibilidade — quem ainda só lê essa coluna continua
// funcionando; partes_endereco_estruturado_v1).
export async function abrirEditarParte(parteId) {
    if (typeof window.abrirSheetForm !== 'function') { mostrarToast('Disponível só dentro do app principal.', 'erro'); return; }
    let p;
    try { p = await api.buscarParte(parteId); } catch (err) { mostrarToast('Erro ao carregar a parte: ' + (err.message || String(err)), 'erro'); return; }
    if (!p) { mostrarToast('Parte não encontrada.', 'erro'); return; }
    window.abrirSheetForm({
        titulo: 'Editar parte',
        sub: p.nome || '',
        corpo: renderizarBlocoDadosParte('pf', p, { mostrarProfissaoEstadoCivil: true })
             + renderizarBlocoEndereco('pf', p, { mostrarBotaoCopiar: false }),
        rotuloSalvar: 'Salvar',
        aoSalvar: async () => {
            const dados = lerBlocoDadosParte('pf');
            if (!dados.nome) { mostrarToast('Nome não pode ficar vazio.', 'erro'); return false; }
            // Bloco de endereço nasce PRÉ-preenchido com o que `p` já tinha
            // (renderizarBlocoEndereco recebeu `p` acima), então uma parte
            // que já veio do formulário novo mantém seus campos ao reabrir.
            // Mas uma parte ANTIGA (só tem `.endereco` texto livre, colunas
            // estruturadas nunca preenchidas) mostra o bloco em branco — se
            // salvar sem tocar nele, formatado fica vazio; nesse caso
            // preserva o `.endereco` antigo em vez de apagar (mesmo
            // cuidado já tomado em index.html/salvarParteSheet e em
            // contratos.js/salvarDadosNovoContratoPopup, mesma demanda).
            const enderecoEstruturado = lerBlocoEndereco('pf');
            const formatado = formatarEnderecoParte(enderecoEstruturado);
            const patchEndereco = formatado
                ? { ...enderecoEstruturado, endereco: formatado }
                : { endereco: p.endereco || null }; // bloco em branco — mantém o texto antigo, não mexe nas colunas estruturadas
            try {
                await api.atualizarParte(parteId, { ...dados, ...patchEndereco });
                mostrarToast('Parte atualizada.');
                window.dispatchEvent(new CustomEvent('cofre:recarregar-partes'));
                return true;
            } catch (err) { mostrarToast('Erro: ' + (err.message || String(err)), 'erro'); return false; }
        }
    });
}

// Recarrega a lista de Partes do item de controle em foco depois de um
// Editar dados salvo pela Ficha da Parte (acima) — mesmo padrão do
// 'cofre:recarregar-documentos' já usado por cofre-documentos.js/
// contratos.js. contratos.js tem seu próprio listener pro chip Partes do
// contrato (montarChipsPartesContrato).
window.addEventListener('cofre:recarregar-partes', () => { if (itemEmFoco) montarPartesItemControle(itemEmFoco); });

// ============================================================================
// CRIAR ITEM DE CONTROLE (formulário na ficha do ativo)
// ============================================================================
export async function abrirFormControle() {
    if (!subtiposCache) {
        try { subtiposCache = await api.listarSubtiposControle(estado.clienteId); }
        catch (err) { mostrarToast('Erro ao carregar catálogo: ' + err.message, 'erro'); return; }
    }
    // v1.20.2 (E0.2 / A8) — catálogo do seletor filtrado pelo tipo do ativo
    // em foco (embarcação mostra 12 subtipos, não 109). Se a busca filtrada
    // falhar, cai no catálogo completo em vez de travar o formulário.
    const tipoAtivoFoco = estado.ativoEmFoco?.tipo_ativo || null;
    if (tipoAtivoFoco && subtiposDoAtivoCache.tipoAtivo !== tipoAtivoFoco) {
        try { subtiposDoAtivoCache = { tipoAtivo: tipoAtivoFoco, lista: await api.listarSubtiposControle(estado.clienteId, tipoAtivoFoco) }; }
        catch (err) { subtiposDoAtivoCache = { tipoAtivo: null, lista: null }; }
    }
    if (!tipoAtivoFoco) subtiposDoAtivoCache = { tipoAtivo: null, lista: null };
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
    aoMudarFrequenciaItemControle(); // E14.2 — form abre com parcelas visível (recorrente vazio)
    renderizarModelosSugeridosForm();
    abrirModal('modal-criar-item-controle');
}

// E14.2 ("A16", 15/09/2026) — parcelamento (Parcelas/Dias entre parcelas)
// só faz sentido pra evento ÚNICO; item recorrente usa "Repetir a cada"
// pra isso. defensivo: se #ic-parcelas-wrapper não existir no DOM (ainda
// não publicado em algum canal), não faz nada — nunca quebra o form.
export function aoMudarFrequenciaItemControle() {
    const freq = document.getElementById('ic-freq-intervalo')?.value;
    const wrapper = document.getElementById('ic-parcelas-wrapper');
    if (!wrapper) return;
    const recorrente = !!freq;
    wrapper.classList.toggle('hidden', recorrente);
    if (recorrente) {
        // some da tela = some do payload: reseta pro padrão de "sem
        // parcelamento", nunca deixa um valor antigo escondido ser
        // submetido por engano.
        document.getElementById('ic-parcelas').value = '1';
        document.getElementById('ic-parcela-intervalo').value = '30';
    }
}

// Modelos sugeridos (pedido explícito, 25/08/2026) — pills clicáveis no
// topo do formulário, filtradas pelo tipo_ativo do ativo em foco. Clicar
// aplica os campos do modelo (aplicarModeloAoForm) — usuário ainda pode
// ajustar tudo antes de salvar, é só um atalho de preenchimento.
function renderizarModelosSugeridosForm() {
    const el = document.getElementById('ic-modelos-sugeridos');
    const ativo = estado.ativoEmFoco;
    // v1.26.0 — a comparação direta `m.tipo_ativo === ativo?.tipo_ativo`
    // (achado, mesmo bug pattern da trigger corrigida na demanda 7e6f4027:
    // ativo.tipo_ativo só tem os 8 valores de categoria, e nunca batia com
    // os modelos de escopo 'codigo' — TUF/veículo blindado/obra de arte
    // ficavam invisíveis aqui em silêncio) virou modeloAplicaAoAtivo(),
    // que resolve escopo_tipo='codigo' via o tipo_detalhe_id do ativo.
    const modelos = (modelosCache || []).filter(m => modeloAplicaAoAtivo(m, ativo));
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
    popularSelectSubtipoEm('ic-subtipo', m.tipo, m.subtipo_id, subtiposDoAtivoCache.lista);
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
    popularSelectSubtipoEm('ic-subtipo', tipo, null, subtiposDoAtivoCache.lista);
}

// v1.20.2 (E0.2 / A8) — 4o parametro opcional `lista`: quando vem, e o
// catalogo ja filtrado pelo tipo do ativo; quando nao vem, e o catalogo
// completo (cadastro de subtipos, cadastro de modelos). Assinatura de 3
// argumentos preservada — os chamadores antigos nao mudam de comportamento.
function popularSelectSubtipoEm(selectId, tipo, selecionadoId, lista) {
    const sel = document.getElementById(selectId);
    if (!sel) return;
    const base = lista || subtiposCache || [];
    const opcoes = base.filter(s => s.tipo === tipo);
    // Um subtipo escolhido explicitamente (ex.: veio de um modelo) nunca
    // pode sumir do seletor por causa do filtro — se nao estiver na lista
    // filtrada, entra a partir do catalogo completo.
    if (selecionadoId && !opcoes.some(s => s.id === selecionadoId)) {
        const extra = (subtiposCache || []).find(s => s.id === selecionadoId);
        if (extra) opcoes.push(extra);
    }
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
    const valorPrevisto = parseFloat(document.getElementById('ic-valor-previsto')?.value) || null; // v1.20.0
    const parcelas = Math.max(1, parseInt(document.getElementById('ic-parcelas')?.value, 10) || 1);
    const parcelaIntervalo = Math.max(1, parseInt(document.getElementById('ic-parcela-intervalo')?.value, 10) || 30);
    // E14.1 ("A4") — checkbox some do DOM em telas antigas de cache; default
    // false se por algum motivo não existir. CORRIGIDO (pedido explícito,
    // 18/09/2026, rodada 8) — era default true ("gerar desde o início"), o
    // que fazia todo item de controle com data início no passado nascer com
    // uma ocorrência já vencida ("Em atraso") no Financeiro por padrão. Ver
    // changelog completo em js/ativos/ativos-markup.js (mesmo checkbox).
    const gerarDesdeInicio = document.getElementById('ic-gerar-desde-inicio') ? document.getElementById('ic-gerar-desde-inicio').checked : false;

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
            valor_previsto: valorPrevisto, parcelas, parcela_intervalo_dias: parcelaIntervalo, // v1.20.0
            gerar_desde_inicio: gerarDesdeInicio, // E14.1
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
        // E14.1 (15/09/2026) — gerarDesdeInicio só se aplica à direção
        // "inicio": achado ao construir, "fim" já é inerentemente
        // retroativo por definição (conta pra trás a partir de uma data
        // fim conhecida) — o checkbox não muda nada nesse modo.
        const payloads = direcaoAlerta === 'fim'
            ? gerarOcorrenciasHorizonteRetroativo(item, dataFim, freqIntervalo, freqUnidade)
            : gerarOcorrenciasHorizonte(item, dataBase, freqIntervalo, freqUnidade, gerarDesdeInicio);
        await api.criarOcorrenciasControleBatch(payloads);

        await api.registrarLogAcessos(estado.clienteId, estado.pessoa.id, 'cofre.controles.criar', { ativoId: a.id, itemId: item.id, ocorrenciasGeradas: payloads.length });
        mostrarToast(`Item de controle criado — ${payloads.length} ocorrência(s) gerada(s) ✅`);
        fecharFormControle();
        itensDoAtivoAtual = await api.listarItensControleAtivo(a.id);
        renderizarListaControles();
        window.dispatchEvent(new CustomEvent('cofre:recarregar-eventos')); // atualiza Home/Visão Geral com as novas ocorrências
    } catch (err) { mostrarToast('Erro: ' + err.message, 'erro'); }
}

// v1.18.0 (A.13) — item de controle nascido de um documento (upload com
// confirmação). Mesmo pipeline de salvarItemControle(), sem depender do
// formulário nem de estado.ativoEmFoco. Devolve o item criado.
export async function criarItemControleDeDocumento(p) {
    if (!p.ativoId && !p.contratoId) throw new Error('Item de controle precisa de um ativo ou contrato.');
    if (!p.titulo) throw new Error('Informe o título do controle.');
    const dataFim = p.dataFim || null;
    const dataBase = p.dataBase || dataFim;
    if (!dataBase) throw new Error('Informe a data de vencimento.');
    const direcao = dataFim ? 'fim' : 'inicio';
    const freqIntervalo = p.freqIntervalo || null;
    const freqUnidade = freqIntervalo ? p.freqUnidade : null;
    const item = await api.criarItemControle({
        cliente_id: estado.clienteId, ativo_id: p.ativoId || null, contrato_id: p.contratoId || null,
        tipo: p.tipo, subtipo_id: p.subtipoId || null, titulo: p.titulo,
        recorrente: !!freqIntervalo, frequencia_intervalo: freqIntervalo, frequencia_unidade: freqUnidade,
        data_base: dataBase, data_fim: dataFim, direcao_alerta: direcao,
        alerta_ativo: true, antecedencia_alerta_dias: p.antecedencia ?? 0, alerta_repeticao_dias: p.repeticao || null,
        valor_previsto: p.valorPrevisto ?? null, parcelas: p.parcelas || 1, parcela_intervalo_dias: p.parcelaIntervaloDias || 30, // v1.20.1 — A.10
        origem: 'documento', criado_por: estado.pessoa.id,
    });
    await api.registrarHistoricoItemControle({ item_id: item.id, acao: 'criar', antes: null, depois: item, pessoa_id: estado.pessoa.id, origem: 'app' });
    // v1.19.0 — documento: só o vencimento lido. Ciclos passados não existem
    // (a apólice começou agora); o próximo é gerado pelo banco ao fechar este.
    const payloads = direcao === 'fim'
        ? [{ cliente_id: estado.clienteId, item_controle_id: item.id, alerta_habilitado: !!item.alerta_ativo, status_execucao: 'aberto', competencia: primeiroDiaDoMes(dataFim), data_prevista_original: dataFim, data_prevista_atual: dataFim }]
        : gerarOcorrenciasHorizonte(item, dataBase, freqIntervalo, freqUnidade);
    await api.criarOcorrenciasControleBatch(payloads);
    await api.registrarLogAcessos(estado.clienteId, estado.pessoa.id, 'cofre.controles.criar', { ativoId: p.ativoId, contratoId: p.contratoId, itemId: item.id, ocorrenciasGeradas: payloads.length, origem: 'documento', documentoId: p.documentoId });
    if (estado.ativoEmFoco && p.ativoId === estado.ativoEmFoco.id) {
        try { itensDoAtivoAtual = await api.listarItensControleAtivo(p.ativoId); renderizarListaControles(); } catch (e) { /* lista atualiza ao reabrir */ }
    }
    return item;
}

// Gera as ocorrências de um item dentro do horizonte de 120 dias a partir de
// hoje, respeitando frequência (dia/semana/mes/ano). Sempre gera pelo menos
// 1 (a da data_base), mesmo que ela já esteja fora do horizonte — pra nunca
// deixar um item sem nenhuma ocorrência.
const HORIZONTE_DIAS = 120;
const MAX_OCORRENCIAS_GERADAS = 60; // guarda contra frequência muito curta (ex.: diária) gerar demais

// E14.1 ("A4", 15/09/2026) — gerarDesdeInicio=false pula toda ocorrência
// anterior a hoje: avança dataBase (mantendo a fase do ciclo — ex. sempre
// dia 15 de cada mês) até a 1ª data >= hoje, e só a partir daí gera.
// Item não-recorrente não usa isto — só tem 1 ocorrência, sempre na
// data_base literal. CORRIGIDO (pedido explícito, 18/09/2026, rodada 8) —
// default trocado de true pra false: um item recorrente com data_base no
// passado gerava, por padrão, ocorrência(s) já vencida(s) que viravam
// despesa "Em atraso" no Financeiro sem nenhuma cobrança real por trás.
// Afeta também criarItemControleDeDocumento() (item nascido de upload com
// vencimento no passado), que não passa este parâmetro e por isso também
// dependia deste default.
function gerarOcorrenciasHorizonte(item, dataBase, freqIntervalo, freqUnidade, gerarDesdeInicio = false) {
    const camposComuns = { cliente_id: estado.clienteId, item_controle_id: item.id, alerta_habilitado: !!item.alerta_ativo, status_execucao: 'aberto' };
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    const hojeISO = hoje.toISOString().slice(0, 10);
    const horizonte = new Date(hoje); horizonte.setDate(horizonte.getDate() + HORIZONTE_DIAS);
    const horizonteISO = horizonte.toISOString().slice(0, 10);

    if (!freqIntervalo || !freqUnidade) {
        return [{ ...camposComuns, competencia: primeiroDiaDoMes(dataBase), data_prevista_original: dataBase, data_prevista_atual: dataBase }];
    }

    let dataInicioGeracao = dataBase;
    if (!gerarDesdeInicio) {
        let guardaAvanco = 0;
        while (dataInicioGeracao < hojeISO && guardaAvanco < MAX_OCORRENCIAS_GERADAS) {
            dataInicioGeracao = proximaData(dataInicioGeracao, freqUnidade, freqIntervalo);
            guardaAvanco++;
        }
    }

    const payloads = [];
    let dataAtual = dataInicioGeracao;
    let guarda = 0;
    while (dataAtual <= horizonteISO && guarda < MAX_OCORRENCIAS_GERADAS) {
        payloads.push({ ...camposComuns, competencia: primeiroDiaDoMes(dataAtual), data_prevista_original: dataAtual, data_prevista_atual: dataAtual });
        dataAtual = proximaData(dataAtual, freqUnidade, freqIntervalo);
        guarda++;
    }
    // Se a 1ª data já nasce depois do horizonte (ex.: vence daqui 200 dias),
    // ainda assim garante pelo menos essa 1ª ocorrência.
    if (!payloads.length) {
        payloads.push({ ...camposComuns, competencia: primeiroDiaDoMes(dataInicioGeracao), data_prevista_original: dataInicioGeracao, data_prevista_atual: dataInicioGeracao });
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
    while (dataAtual >= limiteAntigoISO && guarda < MAX_OCORRENCIAS_GERADAS && !(item.data_base && dataAtual <= item.data_base && dataAtual !== dataFim)) { // v1.19.0 — nunca antes do início da vigência
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
    // v1.20.3 (E1) — `taxa` e `documento` passam a ter grupo próprio; antes
    // um subtipo fora dos 3 tipos simplesmente não era listado nesta tela.
    const grupos = { seguro: [], manutencao: [], tributo: [], taxa: [], documento: [] };
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
// v1.26.0 (rodada 3, 18/09/2026) — as 8 categorias macro reais (mesma
// lista de popularSelectTipoAtivo em cofre-ativos.js), substituindo os 14
// valores misturados (categoria + código específico) de TIPOS_ATIVO_ORDEM.
// Ver changelog da versão pra contexto completo da troca pra escopo_tipo/
// escopo_valor.
const CATEGORIAS_MODELO_ORDEM = ['imovel_predial', 'imovel_territorial', 'veiculo', 'embarcacao', 'aeronave', 'vida', 'bem_valor', 'outro'];

// Catálogo cru (categoria+código+id) carregado em abrirModelosControle() —
// listarTiposPorCategoria() (cofre-validacoes.js) só filtra POR categoria;
// aqui precisamos também do caminho inverso (código → categoria), pra
// agrupar a lista de modelos por categoria mesmo nos de escopo 'codigo'.
let catalogoTiposAtivoBruto = [];

async function garantirCatalogoTiposAtivoModelos() {
    try {
        const catalogo = await api.listarTiposAtivo(estado.clienteId);
        inicializarCatalogoTiposAtivo(catalogo);
        catalogoTiposAtivoBruto = catalogo?.tipos || [];
    } catch (err) {
        console.error('Catálogo de tipos de ativo indisponível — modelos de escopo "código" não conseguem resolver categoria.', err);
    }
}

function categoriaDoModelo(m) {
    if (m.escopo_tipo === 'categoria') return m.escopo_valor;
    return catalogoTiposAtivoBruto.find(t => t.codigo === m.escopo_valor)?.categoria || m.escopo_valor;
}

// Usada tanto pelas pills "Usar modelo" (renderizarModelosSugeridosForm)
// quanto — futuramente — pelo bot. categoria = toda a categoria; codigo =
// só o tipo específico (resolvido via tipo_detalhe_id do ativo).
function modeloAplicaAoAtivo(m, ativo) {
    if (!ativo) return false;
    if (m.escopo_tipo === 'categoria') return m.escopo_valor === ativo.tipo_ativo;
    const codigoDoAtivo = listarTiposPorCategoria(ativo.tipo_ativo).find(t => t.id === ativo.tipo_detalhe_id)?.codigo;
    return !!codigoDoAtivo && codigoDoAtivo === m.escopo_valor;
}

export async function abrirModelosControle() {
    try {
        if (!subtiposCache) subtiposCache = await api.listarSubtiposControle(estado.clienteId);
        await garantirCatalogoTiposAtivoModelos();
        modelosCache = await api.listarModelosItemControle(estado.clienteId);
    } catch (err) {
        mostrarToast('Erro ao carregar modelos: ' + err.message, 'erro');
        return;
    }
    modeloEmEdicao = null;
    document.getElementById('modelo-categoria').innerHTML = CATEGORIAS_MODELO_ORDEM.map(t => `<option value="${t}">${escapeHtml(rotuloTipoAtivo(t))}</option>`).join('');
    document.getElementById('modelo-categoria').value = 'imovel_predial';
    atualizarSelectModeloTipoEspecifico('imovel_predial', null);
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

// Repopula "Tipo específico" com os códigos da categoria escolhida (2º
// seletor, mesmo espírito do "Tipo específico" na ficha do ativo). Opção
// padrão vazia = modelo vale pra toda a categoria (escopo_tipo='categoria').
export function aoMudarCategoriaModeloControleForm() {
    atualizarSelectModeloTipoEspecifico(document.getElementById('modelo-categoria').value, null);
}

function atualizarSelectModeloTipoEspecifico(categoria, tipoDetalheIdAtual) {
    const sel = document.getElementById('modelo-tipo-especifico');
    const tipos = listarTiposPorCategoria(categoria);
    sel.innerHTML = `<option value="">— toda a categoria —</option>` +
        tipos.map(t => `<option value="${t.id}"${t.id === tipoDetalheIdAtual ? ' selected' : ''}>${escapeHtml(t.nome)}</option>`).join('');
}

export async function salvarModeloControle() {
    const categoria = document.getElementById('modelo-categoria').value;
    const tipoEspecificoId = document.getElementById('modelo-tipo-especifico').value || null;
    const tipo = document.getElementById('modelo-tipo').value;
    const subtipoId = document.getElementById('modelo-subtipo').value || null;
    const titulo = document.getElementById('modelo-titulo').value.trim();
    const freqIntervalo = parseInt(document.getElementById('modelo-freq-intervalo').value, 10) || null;
    const freqUnidade = freqIntervalo ? document.getElementById('modelo-freq-unidade').value : null;
    const antecedencia = parseInt(document.getElementById('modelo-antecedencia').value, 10) || 0;
    if (!titulo) { mostrarToast('Informe um título sugerido.', 'erro'); return; }
    // v1.26.0 — escopo_tipo/escopo_valor (mesmo padrão de
    // cofre_subtipo_aplicabilidade) em vez do antigo tipo_ativo (deprecated,
    // não é mais gravado por este formulário).
    const tipoEspecifico = tipoEspecificoId ? listarTiposPorCategoria(categoria).find(t => t.id === tipoEspecificoId) : null;
    const escopoTipo = tipoEspecifico ? 'codigo' : 'categoria';
    const escopoValor = tipoEspecifico ? tipoEspecifico.codigo : categoria;
    const payload = {
        escopo_tipo: escopoTipo, escopo_valor: escopoValor, tipo, subtipo_id: subtipoId, titulo_sugerido: titulo,
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
    // v1.26.0 — reconstrói categoria + tipo específico a partir de
    // escopo_tipo/escopo_valor (tipo_ativo não é mais gravado/lido).
    const categoria = categoriaDoModelo(m);
    document.getElementById('modelo-categoria').value = categoria;
    const tipoDetalheId = m.escopo_tipo === 'codigo' ? (listarTiposPorCategoria(categoria).find(t => t.codigo === m.escopo_valor)?.id || null) : null;
    atualizarSelectModeloTipoEspecifico(categoria, tipoDetalheId);
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

// Agrupado por categoria (ordem fixa CATEGORIAS_MODELO_ORDEM), cada grupo
// mostrando tipo/subtipo/frequência/antecedência numa linha só — mesmo
// espírito de "itens a receber" (sem borda/fundo, divisor fino).
function renderizarModelosControle() {
    const grupos = {};
    CATEGORIAS_MODELO_ORDEM.forEach(t => { grupos[t] = []; });
    // v1.26.0 — agrupa por categoriaDoModelo() (resolve escopo_tipo='codigo'
    // pra sua categoria via o catálogo), não mais por tipo_ativo cru — o
    // `if (grupos[...])` continua defensivo (nunca esconde: cai fora do
    // agrupamento só se a categoria vier de fora das 8 conhecidas).
    (modelosCache || []).forEach(m => { const cat = categoriaDoModelo(m); if (grupos[cat]) grupos[cat].push(m); });
    const el = document.getElementById('modelos-lista');
    el.innerHTML = CATEGORIAS_MODELO_ORDEM.map(tipoAtivo => {
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
