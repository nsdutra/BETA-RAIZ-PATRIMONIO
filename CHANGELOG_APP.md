# Changelog — Raiz Patrimônio (app)

Histórico completo de versões do `index.html`, movido automaticamente pelo `gerar_versoes.py`: o cabeçalho do index mantém só as 5 versões mais recentes; na entrega, as mais antigas rolam pra cá (mais recente primeiro). Não editar à mão — escreva o changelog no header do index, como sempre.

---

------------------------------------------------------------------
NOVIDADES (Beta v1.144.0) — E.3.1: COTA VISÍVEL NO APP.
Desde a migration e3_cota_tipo_e_uso_por_tipo_v1 (07/09) a RPC
fn_funcionalidades_liberadas devolve `cota_tipo` e o `usado` certo
(estoque pra ativos/contratos/controles, MB pra storage, mês pra IA —
Gemini e Claude contam 1 cada). Aqui: (1) podeUsar() monta o texto do
cadeado por tipo — "Limite do plano (49 de 50)" pra estoque, "Espaço
esgotado (x de y MB)" pra bytes, "Limite do mês" só pro que é mensal;
aviso_padrao do plano, se existir, vence o texto genérico. (2) Um
toast por sessão, só pra admin/master, quando alguma cota passou do
limite_aviso (ex.: Rumo, 49 de 50 ativos) — sem bloquear nada.
(3) comum-licenca.js v1.3.0: cada barra mostra o tipo (no mês / em uso
/ MB) e o número fica âmbar a 80% e vermelho no teto. Sem migration.
------------------------------------------------------------------
Versões anteriores (v1.143.0 … v1.143.0): CHANGELOG_APP.md, na raiz do
repositório — o gerar_versoes.py rola pra lá automaticamente tudo além
das 5 versões mais recentes deste cabeçalho.

---

------------------------------------------------------------------
NOVIDADES (Beta v1.143.0) — R8 FATIA 4: VITRINE SAI DO INDEX
(js/vitrine.js v1.0.0). 688 linhas: aba Vitrine, vitrine pública
(?v=token, lightbox, sair), contratação pública (?contratar=token,
formulário do interessado), início do processo de contratação pelo
imóvel/ativo, resumo pro WhatsApp. Estado exclusivo (4) virou nível de
módulo. Boot: quando a URL é pública, o módulo é importado com await
ANTES de seguir (visitante nunca vê o login — mesma garantia); sem
parâmetro público, não baixa. Ficaram: dados de links_vitrine e
processosContratacao, validarCNPJ (compartilhado), banner de contratação
do PLANO (é licença), HTML das telas. Zero HTML tocado. DEPLOY:
vitrine.js NOVO no manifesto (Deploy_Raiz.ps1 v2.14) e gerar_versoes.py
v1.6. Sem migration.
CORREÇÃO (achado nesta fatia): contratos.js v1.0.1 — a ficha usava o
retorno síncrono de avaliarProntidaoContratoParaMinuta(), que na v1.142
virou ponte (Promise) quando Minutas saiu daqui; o card de prontidão da
minuta viria errado. Agora contratos.js e vitrine.js IMPORTAM de
./minutas.js (import estático, o import map resolve). Regra: ponte só
pra "dispara e esquece"; quem usa retorno, importa. Varredura feita nos
4 módulos + index: nenhum outro uso síncrono de ponte.
------------------------------------------------------------------
Versões anteriores (v1.142.0 … v1.142.0): CHANGELOG_APP.md, na raiz do
repositório — o gerar_versoes.py rola pra lá automaticamente tudo além
das 5 versões mais recentes deste cabeçalho.

---

------------------------------------------------------------------
NOVIDADES (Beta v1.142.0) — R8 FATIA 3: MINUTAS SAI DO INDEX
(js/minutas.js v1.0.0). 1219 linhas saíram: tela de modelos, wizard de
minutização (DOCX/PDF → IA → revisão → DOCX), geração da minuta preenchida
(placeholders, prontidão, gerarMinutaNoCofre), escolha de minuta pro
imóvel. Helpers exclusivos vieram junto (assert: ninguém de fora usa).
Mesmo desenho das fatias 1 e 2: import() no switchTab('tab-minutas'),
pontes window[nome], rzMinSeCarregado('renderMinutas') nos 3 ganchos.
Ficaram: minutasContrato + carregar/sincronizar, contratação pública.
Zero HTML tocado. DEPLOY: minutas.js NOVO no manifesto (Deploy_Raiz.ps1
v2.13) e no gerar_versoes.py (v1.5). Sem migration.
------------------------------------------------------------------
Versões anteriores (v1.1.0 … v1.141.0): CHANGELOG_APP.md, na raiz do
repositório — o gerar_versoes.py rola pra lá automaticamente tudo além
das 5 versões mais recentes deste cabeçalho.

---

------------------------------------------------------------------
NOVIDADES (Beta v1.141.0) — R8 FATIA 2: CONTRATOS SAI DO INDEX
(js/contratos.js v1.0.0) + MINHA EMPRESA COMPLETA (comum-minha-empresa.js
v1.4.0).
1) contratos.js: 3.019 linhas saíram daqui — lista, ficha, formulário,
   status/reajuste/detalhes/locatário/observação, fiadores, documentos,
   histórico, criar contrato a partir do ativo. ES module sob demanda
   (import() no switchTab('tab-contratos')), pontes window[nome] (mesmo
   desenho do Financeiro na v1.138), rzConSeCarregado('renderContratos')
   nos 4 ganchos de recarga. Estado exclusivo (11 declarações, incl.
   fichaContratoAtualId e FIADOR_CAMPO_VAZIO) virou nível de módulo;
   gerarMinutaNoCofre passa a chamar reabrirFichaSeFor() em vez de ler a
   variável. Ficaram aqui, de propósito: dados/sincronização, regras
   lidas por Alertas/Visão Geral (contratoVencido etc.), Minutas,
   contratação pública, ficha antiga do imóvel, modal genérico,
   __divisaoPopupContrato e activeConId. Zero mudança de HTML.
2) comum-minha-empresa.js v1.4.0 (print do Nicola 20:16): formulário
   reescrito no catálogo .rz-f (antes Tailwind solto); 4 cards com TODOS
   os campos que existem em `clientes`: natureza PF/PJ (segmento → CPF/
   CNPJ com máscara), responsável, pessoa de contato, endereço completo
   com UF em select e código IBGE, cidade do recibo, papel na locação,
   LOGO (upload reduzido no navegador), regime tributário e distribuição
   de lucros (enums do banco). Nenhuma coluna nova. Sem coluna → fora:
   CEP, telefone, e-mail, site (decisão pendente). Este index recarrega
   CONFIG_CLIENTE.logoUrl após salvar (branding do header/splash).
DEPLOY: contratos.js NOVO no manifesto (Deploy_Raiz.ps1 v2.12) e no
gerar_versoes.py (v1.4). Sem migration.
------------------------------------------------------------------
NOVIDADES (Beta v1.140.0) — "CACHE SEGUROU" ERA FALSO: NÃO ERA CACHE.
Print do Nicola 20:10, com a v1.139 no ar: os MESMOS 6 módulos, com os
MESMOS números. Diagnóstico certo, finalmente: em comum-licenca (1.2.0),
comum-minha-empresa (1.3.0), comum-pessoas (1.5.0), comum-sobre (1.2.0),
cofre-app (1.25.3) e cofre-documentos (1.9.0) o header tinha sido
bumpado nas entregas v1.133–v1.136 mas a constante `export const VERSAO`
ficou na versão anterior (1.1.0/1.1.0/1.3.1/1.1.2/1.25.2/1.8.1) — e o
Versões lê o header como "site" e a constante como "rodando". Os arquivos
certos SEMPRE estiveram rodando. O "Recarregar módulos" (v1.137) e o
import map (v1.139) caçavam fantasma; o import map fica, é proteção real.
Correção: (1) os 6 módulos ganharam bump de patch (1.2.1, 1.3.1, 1.5.1,
1.2.1, 1.25.4, 1.9.1) com a constante sincronizada; (2) gerar_versoes.py
v1.3 TRAVA a entrega se header ≠ VERSAO em qualquer módulo (provado numa
cópia com divergência forçada: aborta com exit 1). Isso vira impossível
de repetir sem o gerador acusar. Nenhuma linha de lógica mudou.
------------------------------------------------------------------
NOVIDADES (Beta v1.139.0) — MÓDULOS PRESOS NO CACHE: SOLUÇÃO DEFINITIVA
(prints do Nicola 20:04: financeiro.js 1.0.0 "em dia" — arquivo novo,
nunca esteve em cache — mas comum-licenca/minha-empresa/pessoas/sobre,
cofre-app 1.25.2 e cofre-documentos 1.8.1 "cache segurou", com o site
já certo). Diagnóstico: a coluna "site" do Versões lê o arquivo com
?v=<timestamp> e vem certa; o import() lê a URL limpa e vem velha —
ou seja, URL diferente atravessa qualquer cache (navegador, SW que não
controla, proxy da operadora); URL igual, não. O "Recarregar módulos"
da v1.137 dependia de o SW interceptar — não dá pra garantir.
Solução: <script type="importmap"> no <head> (bloco RZ-IMPORTMAP, gerado
pelo gerar_versoes.py v1.2 a partir do versoes.json): ./js/X.js →
./js/X.js?v=<versão do arquivo>. O navegador aplica o mapa a TODO
import — o import() do index E os imports estáticos dentro dos módulos
(cofre-app.js → ./cofre-api.js…) — sem tocar em módulo nenhum. Versão
muda → URL muda → busca nova, garantido. Versão igual → cache normal
(nada de tráfego extra). O checker de Versões (import('./'+arq)) passa
pelo mesmo mapa, então "rodando" reflete a URL versionada. sw.js v2.1
continua (pathname não muda com query). Fica: comunicacoes-*.js (carrega
por <script src>, fora do versoes.json) e cofre.html standalone (sem
mapa — sai do repo no R8).
DEPLOY: só index.html + versoes.json mudam (acumula v1.138). Depois do
deploy: fechar e reabrir o PWA (ou "Recarregar módulos" 1x) — daí em
diante nunca mais precisa.
------------------------------------------------------------------
NOVIDADES (Beta v1.138.0) — R8 FATIA 1: FINANCEIRO SAI DO INDEX
(js/financeiro.js v1.0.0, ES module sob demanda). Decisão do Nicola
(06/09): "o definitivo de uma vez, o padrão mesmo" — nem script clássico
nem module no boot; import() no switchTab, igual Ativos/Tipos.
1) 2.483 linhas saíram daqui: renderMensalidades/renderInadimplencia/
   renderSaidas e todas as ações das 3 abas (baixa, estorno, excluir,
   Gerar mês, despesa nova/editar/pagar, conciliação de extrato, painel
   de pendências, sheet do recibo, detalhe do recebimento). Estado
   exclusivo (gruposMensalAbertos, gruposSaidasAbertos, gruposPendencias
   Abertos, despesaEmEdicaoId, financeiroFiltradoOrigem, saidasFiltradas
   OrigemAtiva, recebimentoDetalheAtualId) virou `let` de módulo.
2) Ficou aqui o que é compartilhado: dados/sincronização (mensalidades,
   lancamentos, pendenciasExtrato, carregar*/sincronizar*), gerar
   MensalidadesParaCompetencia (contrato também gera), motor de PDF,
   escapeHtmlSaidas, alternarGrupoSocio, competenciaParaData (a cópia
   duplicada dentro do bloco de Saídas foi apagada — valia a última
   declarada; a que fica trata nulo e faz padStart, saída igual).
3) Ligação: carregarFinanceiro() + rzFinSeCarregado() + pontes
   window[nome] (ver bloco acima do switchTab). Ganchos de recarga
   (salvar contrato, saveAll, carga inicial) trocaram renderX() por
   rzFinSeCarregado('renderX') — se a aba nunca abriu, nada a redesenhar.
   switchTab de tab-mensal/-inadimplencia/-saidas importa e chama
   montarAbaFinanceiro(tabId). Zero mudança de HTML e de lógica de tela.
4) Fica pra próxima fatia (R8-2): contratos.js; markup das abas sai
   junto com a gramática do Financeiro (A.6). imoveis.fotos (A.9) e
   cofre.html continuam pendentes no R8.
DEPLOY: financeiro.js NOVO no manifesto do Deploy_Raiz.ps1 (v2.11) e em
gerar_versoes.py (v1.1). Verificação: node --check (index + módulo),
verificar_gramatica.py (--atualizar: contagens migram de arquivo),
balanceamento de tags idêntico.
------------------------------------------------------------------
NOVIDADES (Beta v1.137.0) — "RECARREGAR MÓDULOS" DE VERDADE (print do
Nicola: Versões mostrando 6 módulos presos e o botão sem efeito).
Causa: o botão só limpava Cache Storage; o que segura os módulos é o
cache HTTP do navegador, e o SW v2.0 não chegou a controlar o PWA
("sw.js rodando —"). Agora: (1) desregistra todo SW, apaga caches,
registra o sw.js de novo com updateViaCache:'none', espera ele
CONTROLAR (controllerchange) e recarrega com query — a carga nova
passa inteira pelo SW; (2) sw.js v2.1 busca todo .js e o versoes.json
do site com cache:'reload' (rede sempre, ignora cache HTTP) em vez
de 'no-cache' (que só revalida — e o Android nem sempre revalida
módulos). (3) registro normal do SW também com updateViaCache:'none'.
Depois deste deploy, a primeira carga ainda pode vir mista; o botão
resolve a partir daí, e o Versões tem que ficar todo verde.
------------------------------------------------------------------
NOVIDADES (Beta v1.136.0) — A.4 RESULTADOS EM 3 SEGMENTOS + R6 (parte 2).
1) Resultados: Desempenho · Distribuição · RELATÓRIOS. Regra nova (decisão
   de 05/09): toda exportação mora em Relatórios — o botão "Exportar
   relatório analítico PDF" saiu de Desempenho. O catálogo só lista o que
   existe: Resultados analítico (relatorios.resultados) e Distribuição aos
   sócios (relatorios.distribuicao, escolhe o sócio num sheet). Pacote do
   contador e Parâmetros entram quando existirem. Cadeado por plano/perfil
   na linha; aba gateada por relatorios.ver.
2) comum-minha-empresa.js v1.3.0 — layout na gramática de verdade (print
   do Nicola): tabhead com descrição, card "Dados da empresa" com
   cabeçalho, labels leves, assinatura em card próprio.
3) comum-pessoas.js v1.5.0 (A.5) — os 2 prompt() de perfil viraram sheet
   lendo a tabela perfis (protegido só pra master). Nenhum perfil chumbado.
------------------------------------------------------------------
NOVIDADES (Beta v1.135.0) — ROTEIRO R6: telas comum-*.js na gramática
(prints do Nicola de 05/09). Index só sobe de versão; mudança nos
satélites:
· comum-licenca.js v1.2.0 — "PLANO ATUAL"/"FUNCIONALIDADES ATIVAS COM
  LIMITES" → cards .rz-card com .rz-card-h ("Plano atual", "Limites do
  plano"); status em sentence case; nomes vêm de nome_comercial (9c-1).
· comum-sobre.js v1.2.0 — caixa alta fora, badge do plano vira .rz-st,
  cards .rz-card, Enviar/Sair no catálogo de botões.
· comum-minha-empresa.js v1.2.0 — Salvar = rz-btn-1, assinatura =
  rz-btn-2 + rz-ico-btn; sentence case; GATE parametros.empresa.editar
  (sem permissão: aviso com motivo e Salvar desabilitado — só leitura).
· comum-pessoas.js v1.4.0 — lápis/lixeira redondos → ⋮ por pessoa
  (Editar = pessoas.editar, Remover = pessoas.excluir → cadeado por
  perfil); + e Salvar no catálogo; perfil em sentence case. FICA: lista
  de perfis do prompt → sheet com perfis+protegido (R6, próxima leva).
A.9 REGISTRADO: imoveis.fotos tem 14 leitores (não 5) — inclui o upload
base64 do form do imóvel e a VITRINE; migrar pra cofre_ativo_fotos é
refatoração de vitrine, não limpeza. Vai com a fragmentação (R8).
------------------------------------------------------------------
NOVIDADES (Beta v1.134.0) — FATIA 9c (limpeza final, parte 1).
1) tab-imoveis: cabeçalho, segmento Imóveis/Ativos, filtros, 3 contadores
   e banner da lista antiga REMOVIDOS (74 linhas). Auditoria antes:
   dos 10 ids, 5 eram lidos pelo JS — 2 já null-safe (?. / if), 3 eram
   escritas diretas em renderImoveis (contadores) → ganharam null-guard.
   Fica só o form-imovel-wrapper (a ficha do ativo edita por ele).
2) [MIGRATION aplicada] nome_comercial nos 53 códigos que ainda
   apareciam como código em "Licença e uso" (0 sem nome agora);
   partes.documento só dígitos (40 linhas, 0 duplicatas); DROP
   propriedade_imovel_deprecated (100 linhas migradas na v1.115; 0 FKs,
   0 RPCs, 0 refs no app/bot).
FICA (9c parte 2): imoveis.fotos (5 leitores → cofre_ativo_fotos) e
cofre.html (0 refs em código; sai do repositório junto com a
fragmentação, o deploy não apaga arquivo).
------------------------------------------------------------------
NOVIDADES (Beta v1.133.0) — REAJUSTE CONTRATUAL (pedido do Nicola).
Já existia um reajuste (popup Tipo B: valor, %, vigência, observação →
contratos.valor/valor_anterior + historico_contrato + log). Evoluído:
1) Sheet da gramática (mesmos ids rj-*); % ↔ valor calculam nos dois
   sentidos; validações em toast; gate contratos.reajustar.
2) ANEXO: documento do reajuste vai pro Cofre (cofre-documentos v1.9.0
   anexarArquivoEntidade — mesmo caminho do upload: hash → storage →
   cofre_documentos → vínculo com o contrato), categoria "reajuste/
   aditivo/contrato" quando existir. Aparece em Anexos do contrato.
3) Histórico do contrato registra o anexo; log_acessos leva vigência e
   documentoId.
4) Entrada nova: ⋮ da ficha do contrato → "Reajustar contrato".
LIMITE CONHECIDO (decisão pendente): "vale a partir de" é registrado no
histórico e no documento, mas o valor vigente é atualizado NA HORA —
não há coluna pra agendar (contratos tem valor/valor_anterior/
reajuste_aplicado). Pra agendar de verdade, seria 1 coluna nova
(reajuste_agendado jsonb) + aplicação no gerar-mês. Informo antes.
------------------------------------------------------------------
NOVIDADES (Beta v1.132.0) — CONFERÊNCIA DE VERSÕES (PENDÊNCIAS v4 §C,
pedido do Nicola: "conferir a versão dos arquivos e sinalizar se são as
últimas"). Zero tabela nova.
1) versoes.json (novo, raiz do repositório; gerado por gerar_versoes.py
   a cada entrega) = o que DEVERIA estar no ar: 18 arquivos.
2) Todo módulo js/ exporta `VERSAO` (igual ao header) — 16 arquivos
   tocados só nessa linha.
3) ⚙️ › Conta › "Versões" (gate dev.acessar): sheet que compara, por
   arquivo, esperado (versoes.json) × site (fetch no-cache do header) ×
   rodando (VERSAO do módulo importado). Diagnóstico: ✅ em dia ·
   ⚠️ "não publicado — no ar vX" (rodar deploy) · ⚠️ "cache segurou vY"
   (botão Recarregar módulos: limpa caches + reload). Bot e functions:
   edge_function_versoes, como o Sobre já lia.
4) Deploy_Raiz.ps1 v2.10 publica versoes.json e compara antes de subir.
Regra de entrega (Claude): o zip acumula tudo desde o último deploy
confirmado e traz versoes.json — este zip traz os 18 arquivos.
------------------------------------------------------------------
NOVIDADES (Beta v1.131.0) — FATIA 8 · FASE F: log_acessos do app com
os CÓDIGOS DO CATÁLOGO. O app já gravava log_acessos, mas com nomes
livres — e a cota (fn_checar_funcionalidade / fn_funcionalidades_
liberadas) conta `acao = código`: baixa pelo bot contava, pelo app não.
1) [MIGRATION aplicada] 4 linhas novas no catálogo (minutas.criar/
   editar/excluir — Operar; parametros.empresa.editar — Administrar,
   é o que vai gatear "Minha empresa" no roteiro #6) e reaponte do
   histórico: 11 nomes livres → códigos (cofre.controle.* →
   cofre.controles.*, minutas.gerar_no_cofre/gerar_docx → minutas.gerar,
   contratos.alterar_status/*_atualizados → contratos.editar, etc.).
2) App: 6 registrarLog no index + 3 em cofre-controles.js (v1.17.0)
   passam a usar o código; o "o quê" (status, título da alteração) vai
   pro `detalhe`. Telemetria (login, logout, comunicacoes.*, links
   abertos) fica como está — não é capacidade, não conta cota.
3) ⋮ da minuta: Editar/Excluir com minutas.editar/minutas.excluir
   (tinham minutas.gerar como aproximação).
9b — ESTADO REAL: os formulários de contrato e de imóvel JÁ estão no
padrão sheet (overlay, rz-grab, rz-x, rz-sh-f) desde fases anteriores;
a pendência "Tipo A" estava desatualizada. Resta em tab-imoveis o
cabeçalho/filtros da lista antiga (74 linhas), com ids ainda escritos
pelo render legado — vai pra 9c com auditoria de null-guard.
------------------------------------------------------------------
NOVIDADES (Beta v1.130.0) — PORTA ÚNICA: chips, barra e recarga
(perguntas do Nicola, 05/09: "se eu tirar pessoas.ver do consulta, o
menu fica inacessível? E uma tela? E um chip?").
1) BARRA INFERIOR: aba bloqueada fica opaca com ponto wine
   (aplicarBloqueiosNav, chamada após carregar o conjunto). O toque já
   era bloqueado desde a v1.124; agora também se VÊ.
2) CHIPS DA FICHA DO ATIVO (cofre-ativos.js v1.27.0): chip sem
   permissão aparece com cadeado e NÃO troca — Contratos→contratos.ver,
   Controles→cofre.controles.ver, Financeiro→mensal.ver,
   Anexos→cofre.ver. Antes o chip abria e mostrava os dados; só o ⋮
   tinha cadeado.
3) RECARGA SEM RELOGAR: ao voltar pro app (visibilitychange), o
   conjunto é recarregado (no máximo 1×/min) e a barra reaplicada —
   mudança feita na Gestão vale em segundos. O bot já checava a cada
   mensagem; agora o app acompanha.
Continua fora, registrado: RLS por perfil nas leituras (quem usa a API
com o próprio token ainda lê o que a tela esconde) — fatia própria.
------------------------------------------------------------------
NOVIDADES (Beta v1.129.0) — DESEMPENHO DA FICHA DO ATIVO + módulos
presos no cache (3 prints do Nicola, 05/09 20:55). Index só sobe de
versão; a mudança é nos satélites:
1) cofre-ativos.js v1.26.0 — abrirFichaAtivo trocava de tela SÓ no fim,
   depois de 6 consultas em fila (2–4 s no 4G): por isso "seleciona mas
   nem sempre abre de primeira". Agora troca de tela primeiro e os 6
   painéis carregam em paralelo, cada um com seu catch. Guarda contra
   troca de ativo no meio. Volume de dados NÃO era o problema (Rumo: 49
   ativos = 21 kB, 1 documento) — era latência × sequência.
2) cofre-api.js v1.17.0 — buscarResumoImoveisParaCards com as 2
   consultas em paralelo.
3) sw.js v2.0 — "Sobre" mostrava Cofre v1.21.1 com o GitHub em 1.26.0:
   import() de módulos presos no cache HTTP (hard refresh não alcança
   os import() disparados depois, no prefetch em idle). SW passa a
   buscar todo .js do site com cache:'no-cache' (revalida com ETag →
   304 barato). Continua SEM cache próprio. Depois deste deploy, o
   "Sobre" tem que bater com o header de cada módulo.
REGISTRADO (roteiro #6, subiu na fila): Minha empresa, Pessoas e
acessos e Sobre estão fora da gramática (botões emerald, títulos
grandes, caixa alta "SEU PLANO/VERSÕES") — comum-*.js.
------------------------------------------------------------------
NOVIDADES (Beta v1.128.0) — FATIA 9b (2/3): "Fiadores do contrato" de
popup Tipo B pra sheet (abrirSheetForm). O invólucro mudou; a lista de
fiadores (renderFiadoresPopup, #dnc-fiadores-lista, atualizarCampo
Fiador, adicionar/removerFiadorPopup) é COMPARTILHADA com o popup
"Dados novo contrato" e fica intocada até a 9b 3/3, quando os dois
migram juntos. salvarFiadoresStandalone: mesma RPC
(substituir_fiadores_contrato), fecha o sheet, e o alert() de erro
virou toast. "+ Adicionar fiador" virou .rz-btn rz-btn-2 no rodapé da
lista. Trava: popup_tipo_b e z_popup caem mais 1. Sem migration.
------------------------------------------------------------------
NOVIDADES (Beta v1.127.0) — FATIA 9b (1/3): "Alterar status do
contrato" de popup Tipo B pra sheet da gramática (abrirSheetForm).
Mesmos ids de campo (asc-acao/asc-data/asc-obs/asc-pendentes), então
salvarAlterarStatusContrato() — com todas as regras de transição,
pendentes e sincronização do imóvel — não mudou UMA linha, e
abrirAcaoStatusContrato() (pré-seleção pelo ⋮ da ficha) segue igual.
fecharModalCampoContrato() passa a fechar o sheet quando o formulário
aberto é este (os outros popups que usam o mesmo id continuam como
estão até a 9b 2/3 e 3/3). Aviso de pendentes virou .rz-card wine.
Trava: popup_tipo_b e z_popup caem mais 1. Sem migration.
------------------------------------------------------------------
NOVIDADES (Beta v1.126.0) — PORTA ÚNICA: 16 ações que escaparam da 9a.
Achado pelo Nicola testando como 'consulta' na v1.125 (só Minutas
bloqueava no ⚙️; Financeiro e Controles do ativo abriam tudo).
16 ações que a 9a tinha deixado passar: no `index.html` — ⋮ de
fiadores (Editar/Adicionar fiador), Minuta (Editar/Excluir),
contratação (Abrir WhatsApp), Parte (Abrir ficha); em
`cofre-ativos.js` (v1.25.0) — Editar dados do ativo, Editar divisão,
Novo item de controle, Financeiro (Novo lançamento/Ver no
Financeiro), Anexos (IA/upload/fotos), Contratos (link/cadastrar
manualmente/ver todos). Causa: essas 12 do cofre-ativos usam
`sheetOuAviso`, não `abrirSheetAcoes` direto — o scan da 9a não olhou
dentro dela. Deixados sem código, de propósito, por serem informativos
ou já protegidos pela ação-mãe: itens do ⚙️ Empresa/Conta (Minha
empresa, Robô, Licença, Sair etc.), sub-ações do recibo e da vitrine
(a entrada já é gateada por recibo.gerar/vitrine.gerar), escolha de
fiador/entidade em listas (a ação-mãe já gateia).
Arquivos: index.html + cofre-ativos.js v1.25.0. Sem migration.
------------------------------------------------------------------
NOVIDADES (Beta v1.125.0) — FATIA 9a: porta única completa + limpeza 1/3.
1) `codigo` em TODOS os ⋮ que faltavam (41 ações no index + 5 em
   cofre-ativos v1.24.0 + 3 em cofre-app v1.25.2 + 2 em cadastros v1.0.1
   + 13 em cofre-controles v1.16.0): contrato (ficha, cobranças, partes,
   fiadores, anexos, status), recebimentos (+, grupos, inadimplência),
   contratação, parte, papel, ativo, controles, ocorrências, tipos.
   Só códigos que já existem no catálogo — nenhuma ação inventa código.
2) [MIGRATION aplicada] prestadores.* → partes.* (ver/criar/editar/
   excluir) com perfis, planos e histórico reapontados; os 3
   registrarLog('prestadores.excluir') viraram partes.excluir.
3) 5 funções órfãs REMOVIDAS (zero chamadores desde a v1.117):
   salvarManutencista, inicializarServicos, alternarFormularioSindico/
   Manutencista/Administradora (76 linhas).
FICA pra 9b: tab-imoveis (36 ids ainda lidos — o form do imóvel que o
ativo reutiliza vive lá; sai junto com a migração de saveImovel), os 3
popups Tipo A/B → sheet. 9c: imoveis.fotos, partes.documento,
DROP propriedade_imovel_deprecated, cofre.html.
------------------------------------------------------------------
NOVIDADES (Beta v1.124.0) — PORTA ÚNICA DO APP (fatia 8). Primeira
entrega da fatia que toca o index. Pré-requisitos já no banco (via
conector, 05/09): matriz de perfis corrigida (decisões do Nicola:
operador exclui, consulta usa IA, dev só master, cofre.baixar →
cofre.download, plataforma.* só master_plataforma), códigos novos
dados.limpar/dados.apagar, RPC fn_funcionalidades_liberadas.
1) carregarFuncionalidadesLiberadas() no boot (após a licença): UMA
   RPC devolve todos os códigos ativos com motivo (sem_licenca /
   limite_atingido / sem_perfil). podeUsar(codigo) lê em memória.
2) abrirSheetAcoes: ação com `codigo` bloqueado aparece DESABILITADA
   (cadeado, opacidade, motivo no lugar do sub) e o toque mostra o
   motivo sem fechar — decisão do Nicola: "mostrar todas, desabilitar"
   (troubleshooting + upgrade). Substitui a regra "item desabilitado
   não é ação" da gramática pra ⋮ e ⚙️.
3) switchTab: TAB_CODIGO_VER — aba que exige *.ver bloqueado avisa e
   fica onde está (Ativos/cofre.ver, Contratos, Financeiro/mensal.ver,
   Resultados, Distribuição/repasses.ver, Pessoas, Dev/dev.acessar).
4) ⚙️ com códigos (Partes, Minutas, Pessoas, Alertas, Tipos e modelos);
   atalho "Prestadores" REMOVIDO (pedido do Nicola — a tela morreu na
   v1.117). ⋮ da mensalidade com códigos (recibo.gerar, mensal.baixar,
   mensal.estornar, mensal.excluir).
5) Hardcoded → catálogo: dev (dev.acessar), limpar/apagar dados
   (dados.limpar/dados.apagar), 2× plano_codigo === 'trial' →
   data_expiracao. Satélites: cofre-documentos.js v1.8.1
   (cofre.baixar → cofre.download; upload restrito por
   cofre.ver_restrito), comum-sobre.js v1.1.2 (trial → data_expiracao),
   comum-pessoas.js v1.3.1 (editar perfil por pessoas.editar).
Ainda por anotar com `codigo`: ⋮ de contrato, saída, ativo, parte,
minuta (fatia 9 e seguintes) — sem código, a ação segue liberada.
------------------------------------------------------------------
NOVIDADES (Beta v1.123.0) — FATIA RESULTADOS: aba Resultados migrada
pra gramática (pedido Nicola 05/09: "tela na formatação antiga").
1) SEGMENTO Resumo/Distribuição: flex+bg-slate-100 → .rz-seg + .rz-on
   (em tab-relatorios e tab-socios). Sprout inline eliminado.
2) "FILTRAR" em caixa alta REMOVIDO: o card de filtros era o único
   lugar da app com label uppercase no corpo (não no header). Virou
   .rz-card simples com labels "Imóvel" e "Período" em sentence case.
3) <h2>Métricas</h2> REMOVIDO: a tab toda é métricas — o h2 era
   redundante e criava hierarquia falsa (REGRAS §6 — sem section
   labels desnecessários).
4) <h2>Mês a Mês</h2>: substituído por <p> leve em pine, sem h2 que
   criava peso visual excessivo pra um sub-cabeçalho.
5) BOTÃO EXPORTAR: bg-emerald-900 + emoji 📊 → .rz-btn .rz-btn-2
   .rz-wide (pine outline, sentence case, ícone lucide bar-chart-2).
JS INTOCADO: renderRelatorios, montarResumoResultados,
baixarRelatorioPdfLocal, filtro-imovel, filtro-periodo,
tabela-mensal-resultados — TODOS os ids/funções preservados.
Sem migration. node --check OK; baseline regravada.
------------------------------------------------------------------
NOVIDADES (Beta v1.122.0) — FATIA 7b-ii (parte 2): tela de MINUTAS na
gramática. Fronteira mantida de propósito: só a TELA muda; o MOTOR
(salvarMinuta com upload .docx, gerarMinutaNoCofre,
encontrarMinutaParaImovel, gerarMinutaContrato) não teve UMA linha
alterada — ids de todos os campos preservados foram o truque.
1) CABEÇALHO: h2 + raiz-btn-toggle viraram .rz-tabhead com descrição
   ("modelos .docx com placeholders; o escopo diz quando cada um
   vale") + 2 ícones: varinha (wizard IA, classe rz-ia — brass é
   permitido aqui, ação de IA por REGRAS §13) e "+" (cadastrar).
2) FORMULÁRIO DE UPLOAD → SHEET (abrirFormMinutaSheet): mesmos campos,
   MESMOS ids (minuta-nome/escopo/empreendimento-id/tipo-imovel-id/
   imovel-id/arquivo-input/arquivo-atual-info...) — salvarMinuta lê
   por getElementById e continua funcionando intocada; aoSalvar chama
   ela com um preventDefault falso e devolve false (quem fecha o
   sheet é cancelarEdicaoMinuta no sucesso, agora null-safe +
   fecharSheet). Editar = mesmo sheet pré-preenchido (editarMinuta e
   abrirFormularioMinuta/alternarFormularioMinuta viraram aliases —
   há chamadores antigos espalhados). Seletor de imóvel
   (abrirSeletorImovel) e ajuda de placeholders reaproveitados.
3) LISTA → .rz-row com ⋮ (abrirAcoesMinuta): Ver arquivo do modelo ·
   Editar · Excluir. Regras de escopo/nome idênticas às antigas.
4) WIZARD DE MINUTIZAÇÃO POR IA (form-minutizar-wrapper) FICA COMO
   ESTÁ nesta entrega — fluxo guiado multi-passo amarrado ao motor de
   contratação; converte junto da fatia 10 (contratos.js). Registrado.
switchTab: hook de tab-minutas só renderiza (selects do form vivem no
sheet). Trava: btn_toggle 17→16; nada subiu; baseline regravada.
Arquivos da entrega: SÓ index.html. Sem migration. node --check OK;
balanceamento idêntico (svg 1).
------------------------------------------------------------------
NOVIDADES (Beta v1.121.0) — 2 achados da validação em campo (prints
do Nicola, 05/09) + 1 registro de plano.
1) ⋮ NAS MOVIMENTAÇÕES DO CHIP FINANCEIRO DO ATIVO (pedido: "está sem
   o menu de 3 pontinhos pra tratar cada item"). cofre-ativos v1.23.0:
   cada linha ganhou ⋮ — entrada abre rzAcoesMensalidade (o MESMO
   sheet Dar baixa/Recibo/Estornar/Excluir do Financeiro e da ficha
   do contrato, v1.116); saída vai pro App e abre abrirEditarDespesa
   (mesmo destino do toque em Financeiro › Saídas). A RPC
   fn_fluxo_financeiro_ativo já devolvia o id de cada item
   (verificado no banco antes de escrever) — zero mudança de SQL.
2) RECIBO DE ALUGUEL EM SHEET (pedido: "quando solicito um recibo,
   formato antigo"). O modal Tipo B (fundo emerald, caixa alta, botões
   próprios) foi REMOVIDO do HTML; abrirModalOpcoesRecibo() — nome
   mantido pelos 2 chamadores — agora monta sheet da gramática:
   observações no topo (MESMO id do campo; salvarObservacaoRecibo
   intocada, continua salvando no blur) + Visualizar na tela · Gerar
   e baixar PDF · WhatsApp · E-mail. Toda a montagem do template
   oculto pdf-* continua idêntica; fecharModalOpcoes() = fecharSheet().
   Trava: popup_tipo_b 24→23 · z_popup_antigo 17→16.
3) REGISTRO — ABA RESULTADOS NA FORMATAÇÃO ANTIGA (print do Nicola:
   "Métricas", FILTRAR em caixa alta, tabela Mês a Mês, botão de
   exportar fora do catálogo): entra nas PENDÊNCIAS como fatia
   própria ("fatia Resultados") — é migração de tela inteira com
   tabela + filtros + PDF analítico, não cabe de carona.
Arquivos da entrega: index.html + js/cofre-ativos.js (v1.23.0). Sem
migration. node --check OK (2 arquivos); balanceamento idêntico
(svg 1); baseline regravada.
------------------------------------------------------------------
NOVIDADES (Beta v1.120.0) — FATIA 7b-ii (parte 1) + estreia da regra
E0 do PLANO_FRAGMENTACAO_INDEX_v1_0.md ("nada novo nasce no index").
NOVO MÓDULO js/cadastros.js v1.0.0 — primeiro módulo nascido fora do
index. Telas Tipo de Imóvel e Tipo de Empreendimento reconstruídas
na gramática: .rz-tabhead (descrição + "+"), lista .rz-row com ⋮
(Renomear · Excluir — renomear é NOVO, a tela antiga só criava/
excluía), criação/renome via abrirSheetForm com validação de nome
duplicado. As 2 sections viraram mount-points; switchTab importa o
módulo sob demanda.
PONTES (padrão satélite): dbAuth via window.__raizDbAuth; clienteId
por parâmetro; window.__raizCadastrosPonte no index com as MESMAS
regras de "em uso" da tela antiga (arrays em memória) e aoAlterar
recarregando tiposImovelCadastrados/empreendimentosCadastrados +
popularSelectsEmpreendimentoTipo — o formulário de imóvel continua
enxergando os cadastros novos na hora.
REMOVIDO do index (~140 linhas): markup das 2 sections antigas (h2 +
raiz-btn-toggle + form inline) e o bloco dev_param_criar/excluir/
render + alternarFormularioTipo* (120 linhas). FICAM:
carregarTiposImovelSupabase/carregarEmpreendimentosSupabase e
popularSelectsEmpreendimentoTipo (alimentam o form de imóvel e a
ponte); dev_param_inicializar virou só dev_carregarDadosEmpresa.
DEPLOY: cadastros.js entra no manifesto do Deploy_Raiz.ps1 (nome
único, sem prefixo — regra do módulo patrimônio); DEPLOY.md v2.9.
Minutas fica pra parte 2 da fatia — amarrada ao motor de contratação
(gerarMinutaNoCofre/encontrarMinutaParaImovel), migra separada de
propósito pra não arriscar a geração de minuta.
Trava: btn_toggle 19→17; nada subiu; baseline regravada. node --check
OK (index + cadastros.js); balanceamento idêntico (svg 1).
------------------------------------------------------------------
NOVIDADES (Beta v1.119.0) — validação da Partes unificada (retorno do
Nicola, 05/09) + primeira remoção antecipada da fatia 9.
1) CHIPS DE PARTES CONTANDO PAPÉIS, NÃO PARTES (bug apontado: "os
   totais não batem com as partes, e sim com os papéis"). Causa:
   papeisPorParte guarda UMA entrada por LINHA de papel — parte
   locatária em 3 contratos vira ['locatario','locatario','locatario']
   e o chip somava 3. Dedup por parte ([...new Set(papeis)]): cada
   parte conta 1x por papel, e o número do chip passa a bater com as
   linhas que o filtro dele mostra. "Prestadores" e "Sem papel" já
   contavam por parte (não mudaram).
2) HTML DAS 3 TELAS DE PRESTADORES REMOVIDO (autorização explícita:
   "o form de prestadores já está igual ao de partes; pode eliminar").
   tab-sindicos (103 linhas), tab-manutencistas (71) e
   tab-administradoras (79) — formulários Tipo A e listas — fora do
   arquivo. Estavam desligadas no roteador desde a v1.117 (redirect
   pra Partes › chip Prestadores), então nenhum caminho vivo as
   alcançava. As funções JS dessas telas ficam como órfãs
   auto-protegidas (render* tem `if (!container) return`;
   sincronizarBotaoToggleServico é null-guarded e É COMPARTILHADA com
   Minutas — não sai) e entram na varredura da fatia 9 junto com os
   call sites; verificado que nenhum caminho vivo chama as órfãs que
   tocariam elementos removidos. Trava: btn_toggle 22→19.
Arquivos da entrega: SÓ index.html. Sem migration. node --check OK;
balanceamento de tags idêntico (svg 1, pré-existente); baseline
regravada.
------------------------------------------------------------------
NOVIDADES (Beta v1.118.0) — 2 pendências do roteiro fechadas (pedido:
"Vamos evoluir próximos passos!").
1) fn_resumo_resultados SOMA SAÍDAS (aberta desde a v1.114). Migration
   fn_resumo_resultados_v2_soma_saidas (05/09, aplicada e testada via
   conector): 4 colunas novas — saidas_12m, saidas_mes_atual (só
   status='realizado'; previsto não é caixa), resultado_liquido_12m e
   resultado_liquido_mes (recebido − saídas do período). Assinatura
   mudou ⇒ DROP explícito antes do CREATE (CREATE OR REPLACE não
   troca tipo de retorno — regra registrada) + REVOKE/GRANT refeitos.
   FRONT (Resultados): hero deixa de chamar receita bruta de
   "resultado" — título vira "Resultado (últimos 12 meses)" com o
   líquido; Recebido (12m) e Saídas (12m) viram os 2 primeiros
   quadrinhos; rodapé explica "saídas consideram só o realizado".
   Visão Geral não muda (patrimônio/recebido/ocupação continuam os
   mesmos campos; a RPC v2 é retrocompatível nos campos antigos).
2) EMPREENDIMENTOS DO PRESTADOR EDITÁVEIS NA FICHA DA PARTE (limitação
   registrada na v1.117: a ficha mostrava, não editava). ⋮ da parte
   ganha "Empreendimentos atendidos" quando tipo_prestador é síndico
   ou manutencista → sheet de checkboxes (busca empreendimentos +
   vínculos vigentes direto do banco, sem depender de array em
   memória). Salvar reaplica as MESMAS regras da tela antiga: marcar
   = insert em prestador_vinculo com data_inicio_vigencia (síndico
   fecha o vínculo do síndico anterior naquele empreendimento);
   desmarcar = data_fim_vigencia hoje. Nada é deletado — vigência é
   histórico.
Arquivos da entrega: SÓ index.html. Migration aplicada via conector
(nada a rodar na mão). Trava: nada subiu; baseline regravada.
node --check OK; balanceamento de tags idêntico (svg 1, pré-existente).
------------------------------------------------------------------
NOVIDADES (Beta v1.117.0) — FATIA 7b-i: PARTES UNIFICADA (decisão do
Nicola, 04/09: "fazer uma tela nova de partes e seus vínculos/papéis
... fundir tudo em partes. A depender do papel os campos são
ajustados em tela. Importante mostrar os vínculos já existentes pra
aquela parte, pra todos os papéis e por papel"). Embute a FRENTE F
(atribuir papel avulso na UI).
ARQUITETURA (verificada no banco antes de escrever):
  - `partes` = identidade; `partes_papeis` = onde atua (locatario/
    fiador→contrato · proprietario→ativo/imovel · prestador→
    prestadores.id · manutencista→item_controle).
  - `prestadores` NÃO some: é alvo de FK operacional
    (contratos.administradora_id, prestador_vinculo com
    empreendimentos, cofre_itens_controle.prestador_escopo_id). A
    fusão é de TELA e IDENTIDADE; salvar parte-prestadora grava nas
    duas e liga via partes_papeis (mesmo espelho da migração de
    01/09), por sincronizarPrestadorDaParte() — idempotente.
  - RPC nova fn_vinculos_da_parte (migration 04/09): todos os
    vínculos de uma parte com o NOME da entidade resolvido (contrato
    → locatário + imóvel + status; ativo → nome_exibicao; imóvel →
    endereço; prestador → tipo + empreendimentos vigentes; item →
    título), numa ida só. SECURITY INVOKER de propósito: a RLS de
    cada tabela continua decidindo o que a pessoa vê.
TELA (tab-partes reconstruída na gramática, ~104 linhas de markup
antigo removidas):
  - .rz-tabhead com descrição ("num cadastro único; os papéis dizem
    onde cada uma atua") + Buscar + "+".
  - Chips por papel com contador (Todas · Locatários · Fiadores ·
    Proprietários · Prestadores · Interessados · Corretores · Sem
    papel) — só aparecem os que existem na carteira; "Prestadores"
    agrega sindico/manutencista/administradora/prestador.
  - Lista .rz-row: ícone por papel/tipo, nome + doc + resumo de
    papéis; toque abre a FICHA; ⋮ com Abrir ficha · Editar dados ·
    Adicionar papel · Excluir.
  - FICHA (sheet): card Dados (kv, lápis no ⋮) + card Vínculos
    AGRUPADOS POR PAPEL (pedido explícito), cada linha com nome/
    detalhe resolvidos; vínculo de contrato/ativo é navegável (abre a
    ficha correspondente). "+" no card = Adicionar papel.
  - FORMULÁRIO via abrirSheetForm com campos POR PAPEL: base sempre
    (nome, doc com máscara/validação, WhatsApp, e-mail, fantasia,
    profissão, estado civil, endereço); "Atua como prestador?"
    (não / administradora / síndico / manutencista) liga contato e —
    só administradora — taxa de administração.
  - FRENTE F: "Adicionar papel" → escolhe papel → escolhe a entidade
    (contrato ou ativo, listas do próprio app) → grava em
    partes_papeis com dedup; Interessado/Corretor entram sem
    entidade; Prestador cai no formulário (campo tipo).
  - Excluir bloqueado se houver papéis ativos (abre a ficha pra
    remover vínculos antes) — integridade antes de conveniência.
ROTEADOR/MENU:
  - tab-sindicos/tab-administradoras/tab-manutencistas DESLIGADAS no
    switchTab → caem em Partes com chip Prestadores (mesmo padrão do
    desligamento de tab-imoveis na fatia 3b; HTML e funções antigas
    ficam até a fatia 9). abrirVincularSindico/Manutencista idem.
  - Menu ⚙️: "Prestadores" vai direto pra Partes filtrada (sub-sheet
    abrirMenuPrestadores() removida); "Partes" reseta o filtro.
Arquivos da entrega: SÓ index.html (nenhum módulo js mudou).
Migration fn_vinculos_da_parte_v1 aplicada e testada via conector.
Trava: btn_toggle 23→22; nada subiu; baseline regravada. node --check
OK; balanceamento de tags idêntico (svg 1, pré-existente).
------------------------------------------------------------------
NOVIDADES (Beta v1.116.0) — correções da validação da v1.115 (prints
do Nicola, 04/09) + 6 pedidos da mesma rodada.
1) CABEÇALHO DESFORMATADO (print: círculos do Raiz IA/avatar certos,
   mas sem a barra pine e texto solto sobre o conteúdo — regras filhas
   aplicaram, container não; consistente com CSS em cache divergindo
   do HTML). Duas defesas: regra `#main-header .rz-hdr` duplicada no
   catálogo (maior especificidade, sempre a última a ganhar) e
   forcarLayoutHeaderGlobal() — força o layout via style inline no
   login, que vence qualquer folha de estilo, seja qual for a causa.
2) PARTES — "edição à frente de cada parte": linha do locatário deixou
   de ser toque-na-linha com ellipsis fingindo de seta (violava §9);
   cada linha (locatário e CADA fiador) tem seu próprio ⋮. Fiador:
   Editar fiadores (popup completo já existente) e Remover fiador —
   direto pelo MESMO RPC do popup (substituir_fiadores_contrato), com
   seletor quando há mais de um. BANCO: migration
   fn_sincronizar_locatario_partes_v2 — o trigger de 02/09 só criava a
   parte quando havia documento e nunca teve backfill (63 dos 64
   contratos sem papel de locatário). Agora: lógica em
   fn_sincronizar_locatario_contrato(uuid); sem documento casa por
   nome; documento comparado por dígitos; UPDATE também dispara em
   WhatsApp/e-mail; backfill rodado — verificação pós: 64/64 contratos
   com papel 'locatario' ativo em partes_papeis.
3) COBRANÇAS DA FICHA DO CONTRATO — cada linha ganhou ⋮ chamando
   rzAcoesMensalidade() (o MESMO sheet de Financeiro › Recebimentos:
   Dar baixa · Recibo · Estornar · Excluir). Zero lógica nova.
4) CONTRATAÇÃO E STATUS NO ⋮ (pedido: "as opções do print no menu 3
   bolinhas; ativo ganha suspender/encerrar; assinando ganha ativar e
   excluir; as regras estão no antigo alterar status"):
   - abrirModalOpcoesContratacao (popup Tipo B com estilo inline, o do
     print) virou abrirSheetAcoes: Dados novo contrato · Gerar link ·
     WhatsApp · Conferir minuta · Gerar minuta; sem minuta padrão,
     sheet em grupos com "Cadastrar minuta padrão". Mesmos
     registrarLog/token/checagem (encontrarMinutaParaImovel).
   - ⋮ da ficha do contrato, por estado: Assinando → Ativar contrato;
     Ativo → Suspender · Encerrar; Suspenso → Reativar · Encerrar;
     Excluir continua pra todos (já existia). Cada item chama
     abrirAcaoStatusContrato(): abre o formulário JÁ EXISTENTE de
     alterar status com a ação pré-selecionada — 100% das regras
     (transições válidas, mensalidades pendentes, sincronização do
     status do imóvel) continuam em salvarAlterarStatusContrato, nada
     duplicado.
5) ATIVOS LENTO — prefetchModuloAtivos() deixou de ser só
   modulepreload: agora monta a aba de verdade em segundo plano
   (idle) logo após o login — #ativos-mount-point é display:none mas
   está no DOM; montarAtivosTab() já é idempotente. Tocar na aba só
   troca a classe .active. Junto, cofre-navegacao v1.6.2 paraleliza a
   checagem cofre.categorias com carregarTudo() (1 ida a menos no
   caminho crítico).
6) ANEXOS DO CONTRATO ≠ ATIVOS — ganhou "Upload simples" (par
   IA/simples via window.rzAbrirUploadContextualComFlag —
   cofre-documentos v1.8.0 + cofre-app v1.25.1) e "Gerar minuta"
   quando o contrato está pronto (mesma avaliarProntidaoContratoParaMinuta
   do ⋮ da ficha).
Arquivos da entrega: index.html · js/cofre-navegacao.js (1.6.2) ·
js/cofre-documentos.js (1.8.0) · js/cofre-app.js (1.25.1). Os demais
módulos NÃO mudaram desde a v1.115 (regra DEPLOY §5.5.1 — não
redelivar sem mudança real). Migration aplicada via conector (não há
.sql pra rodar na mão). Trava: z_popup_antigo 18→17 · hex_solto
429→417; nada subiu; baseline regravada. node --check OK (bloco
principal + 3 módulos); balanceamento de tags idêntico (svg 1,
pré-existente).
------------------------------------------------------------------
NOVIDADES (Beta v1.115.0) — FATIA 7 da gramática única (REGRAS v3.12
§4/§5/§16; roteiro #3 das PENDÊNCIAS de 03/09; pedido: "Pode seguir").
Por quê: cabeçalho, menu e barras de aba eram o último pedaço de casca
antiga em volta de telas já migradas — Ativos tinha 4 ícones, o menu
⚙️ era um HTML de 7 grupos com itens "Em breve" desabilitados, e o
cabeçalho ainda mostrava o Robô como ícone principal.
CABEÇALHO GLOBAL (.rz-hdr, §4):
  - <header> agora é o próprio .rz-hdr: nome do cliente em 1 linha
    truncada (#logo-header, mesmo id que aplicarBrandingCliente() já
    preenchia com texto ou <img>), linha de contexto "Plano X · N
    ativos" (atualizarContextoHeader(): plano de LICENCA_ATUAL, N de
    window.__cofreAtivos, ou imoveis antes do módulo carregar), botão
    Raiz IA (brass, sparkles, anel 28 %, ponto branco p/ sugestão) e
    avatar com iniciais. Toque = recarregar; duplo-toque = DEV, como
    antes. O botão do Robô saiu do cabeçalho (vive no menu › Empresa e
    no sheet do Raiz IA — §16.7). Tag OFFLINE virou .rz-off (sem
    Tailwind, keyframe própria rz-pulse).
  - Raiz IA (abrirSheetRaizIA): faixa .rz-ia-hero + o que a IA já faz
    HOJE — Importar extrato (vai pro Financeiro e abre o seletor), Ler
    um documento (abre o upload livre do módulo Ativos via evento
    'cofre:abrir-upload-home', cofre-app v1.25.0) e Robô WhatsApp.
    A conversa (sugestões, bolhas, campo) é a fatia 8 — o botão só
    ganhou lugar e contrato visual definitivos; nada promete o que
    não existe.
MENU ⚙️ (§5) — 3 grupos fixos, gerado por abrirSheetAcoes({grupos}):
  - Cadastros: Partes · Prestadores › (Síndicos e gestoras,
    Administradoras, Manutencistas) · Minutas de contrato · Tipos e
    modelos › (Tipo de imóvel, Tipo de empreendimento, Categoria de
    documento, Sub-tipos de item de controle, Modelos de controle).
  - Empresa: Minha empresa · Pessoas e acessos · Robô WhatsApp ·
    Licença e uso (plano no subtítulo — substitui o selo) · Trocar de
    empresa.
  - Conta: Alertas do patrimônio · Preferências de comunicação ·
    Suporte pelo WhatsApp · Termos e privacidade · Sobre · Sair (não
    existia no menu; só no DEV).
  - #modal-menu-conta (HTML estático, ~250 linhas) REMOVIDO junto com
    os 4 itens "Em breve" (Meu perfil, Sócios & cotas, Certificado/
    NFS-e, Banco) — item desabilitado não é ação; os 4 seguem nas
    PENDÊNCIAS. atualizarBadgePlanoMenu() removida; fecharMenuConta()
    = fecharSheet() (mantida pelos chamadores).
  - Categoria/Sub-tipos/Modelos abrem DENTRO do App: abrirConfiguracaoCofre()
    deixou de mandar pro cofre.html — vai pra tab-ativos e dispara
    'cofre:abrir-configuracao' (listener existia desde cofre-app
    v1.8.0); se o módulo ainda não carregou, espera
    'cofre:dados-carregados' uma vez. Era a última porta do menu pro
    cofre.html.
CABEÇALHOS DE ABA (≤2 ícones, "+" preenchido, §4):
  - Ativos (ativos-markup v1.20.0): 4 ícones → Buscar + "+". O "+"
    abre sheet (cofre-app 'abrir-acoes-ativos'): Carregar documento
    [IA, no topo — §16.5] · Novo ativo · Montar vitrine (vários).
  - Contratos: .rz-ico-btn; "+" abre o formulário direto (uma ação só —
    sheet quando "A partir de um PDF" existir); raiz-btn-toggle saiu
    do botão (o sheet tem o próprio X; sincronizarBotaoToggleContrato
    segue inofensiva sem o svg).
  - Visão Geral: ganhou a linha de aba (descrição + sino → Alertas)
    com ponto --danger quando há atraso / --warning quando só há
    pontos de atenção (renderVisaoGeral escreve em #geral-sino-dot).
  - Vitrine: "‹ Ativos" (era "Imóveis", tela desligada) + Buscar +
    Gerar link (share, preenchido).
VITRINE POR IMÓVEL: gerarLinkVitrine() virou casca de
  gerarLinkVitrineParaIds(ids); gerarVitrineDoImovel(id) novo, usado
  pelo ⋮ do ativo-imóvel ("Gerar vitrine", cofre-ativos v1.22.0).
  Resultado deixou de ser confirm()/alert() e virou sheet "Vitrine
  pronta": Copiar · Enviar pelo WhatsApp · Abrir (link já copiado ao
  abrir; erros em toast).
GOTRUECLIENT DUPLICADO: index.html expõe window.__raizDbAuth; cofre-api
  v1.16.0 reaproveita (standalone cofre.html continua criando o dele).
  Some o aviso "Multiple GoTrueClient instances" e a sessão paralela.
ÓRFÃ: verificarAcessoCofreEAtualizarMenu() (v1.46.0) removida — só
  alternava #menu-grupo-modulos, que não existe desde a v1.87.0.
TRAVA: verificar_gramatica.py v1.3 — o check obrigatório de --paper
  (#f1f4ec) estava defasado da paleta executiva e acusava FALHA falsa;
  agora exige --paper:#f4f3ee, --tile e .rz-hdr. Baseline regravada.
  Contagens: emerald 117→114 · caixa_alta 30→18 · hex_solto 430→429;
  nada subiu.
FICOU DE FORA (de propósito): nav.bottom-nav interna do Cofre e o
  <header> do módulo já são display:none via ativos-boot; a remoção
  física do markup é fatia 9 junto com o resto da limpeza.
Validação: node --check no bloco principal e nos 4 módulos;
balanceamento de tags idêntico à v1.114 (svg 1, pré-existente).
------------------------------------------------------------------
NOVIDADES (Beta v1.114.0) — FATIAS 5 e 6 da gramática única (pedido:
"bora fazer o 5 e 6 de uma vez; conciliação das despesas pro final").
FATIA 5 — FINANCEIRO:
  - Segmento Recebimentos · Atrasados · Saídas no catálogo (.rz-seg), 3
    cópias. Cabeçalhos com ≤2 ícones: Buscar + "+" (Recebimentos: sheet
    com Importar extrato [IA] · Gerar mês · Reprocessar conciliação ·
    Painel de conciliação — os painéis inline continuam existindo;
    conciliação de extrato NÃO foi tocada, por decisão).
  - Recebimentos (renderMensalidades): KPIs do período (Recebido / Em
    atraso / A vencer); cada competência = .rz-group recolhível +
    .rz-card.rz-list; cada mensalidade = .rz-row com status (Pago ok ·
    Em atraso bad · A vencer run). Toque → sheet de ações
    (rzAcoesMensalidade): Dar baixa · Excluir; pago: Recibo · Estornar.
    "Dar baixa" = sheet de formulário (rzAbrirBaixaMensalidade) com os
    MESMOS ids banco-/data-/valor-/obs-/energia-/multa-/taxa-admin-
    → liquidarMensalidade() intacta. Saíram os formulários inline por
    card, 4 botões por card e o cabeçalho verde-escuro do grupo.
    "Apagar inadimplentes do mês" → ⋮ do grupo.
  - Atrasados (renderInadimplencia): .rz-row + .rz-card.rz-critico por
    grupo; "Cobrar pelo WhatsApp" (dispararCobrancaWhatsAppDirect, o
    link wa.me de sempre) → ⋮ do grupo (só agrupando por locatário).
    Linhas em branco da função normalizadas (−340 linhas no arquivo).
  - Saídas (renderSaidas): .rz-row com status (Pago / Em atraso / A
    pagar), grupo por competência recolhível; toque abre a despesa.
FATIA 6 — VISÃO GERAL + ALERTAS:
  - Hero em .rz-kpi.rz-hero (Patrimônio sob gestão) + 3 KPIs
    (Recebido / Em atraso / Ocupação), mesmos ids. Card "Precisa de
    atenção" no catálogo: rows com semântica na placa, status no
    cabeçalho (n em atraso / n pontos / Em dia), borda danger quando há
    crítico. Relatórios vira row.
  - Alertas de contrato abrem a FICHA (abrirFichaContrato), não o modal
    de edição (5 ocorrências).
  - Alerta NOVO "Contrato vigente em ativo vendido/arquivado"
    (pendência de 02/09) — lê window.__cofreAtivos (cofre-app v1.24.0).
Fora desta entrega, de propósito: conciliação de extrato (painel e
pendências, layout antigo), fn_resumo_resultados somando saídas (RPC,
próxima rodada), card do Robô na Visão Geral (fatia 8).

NOVIDADES (Beta v1.113.0) — anotações do Nicola (19h): "o toque
intuitivo já resolve":
  - RODAPÉS DE CARD SAEM. Regra nova (REGRAS §6 v3.11): toda ação
    secundária vive no ⋮ do cabeçalho; entrar num item é o toque na
    linha (›); linha que tem ações próprias mostra ⋮ e abre sheet. Sem
    botão "Abrir contrato"/"Editar dados"/"Iniciar contratação"/
    "Carregar documento" duplicando o que ⋮ ou o toque já fazem. Cards
    ficaram mais baixos. Lápis (pencil) deixou de existir como sinal.
  - Ficha do contrato: ⋮ em Condições (Editar contrato, Histórico,
    Gerar minuta, Abrir o imóvel, Excluir), Cobranças (Ver no
    Financeiro), Partes (Editar locatário, Adicionar/Editar fiadores)
    e Anexos (Adicionar documento com IA — brass); linha do locatário
    abre sheet.
  - "Arquivos" → "Anexos" também no CONTRATO, com chips por categoria
    (fcMontarChipsAnexos / fcFiltrarAnexos) — faltou na 1.112.
  - Categorizar documento: botão na ficha do documento abre sheet com
    as categorias (cofre-documentos.js v1.7.0).
  - BUG "Vago com contrato" na lista de Ativos: o status do resumo vem
    minúsculo do banco — mesma causa do chip Contratos (v1.17.2).
    Normalizado (cofre-ativos.js v1.21.0).
  - Tag de alerta da lista de Ativos na mesma linguagem do status
    (ponto + rótulo via renderStatus) — acabou o par "badge + pill
    amarela" no mesmo card.

NOVIDADES (Beta v1.112.0) — anotações do Nicola (16h) + migração de fotos:
  - ⋮ NO CABEÇALHO DO CARD substitui "Mais ações" em todos os cards
    (.rz-more icon-only; rodapé só com a ação nomeada → cards mais
    baixos). Ficha do contrato, ficha do ativo, item de controle.
  - "Arquivos" → "ANEXOS" com chips Todos · Fotos · <categorias>;
    IA + Upload sempre no rodapé (cofre-ativos.js v1.20.0,
    ativos-markup.js v1.18.0).
  - FOTOS MIGRADAS: migration migrar_fotos_legadas_imoveis_para_cofre_
    ativo_fotos_v1 (11 URLs: 8 do bucket imoveis-fotos + 3 do Drive);
    as 7 em base64 migram ao abrir a ficha (upload pro Cofre). Thumbnail
    das migradas: gerarSignedUrl resolve 'externo' e bucket público
    (cofre-api.js v1.15.0). "Fotos enviadas ✅" virou toast.
  - Toque no contrato abre a FICHA (abrirFichaContrato) — a ponte usava
    abrirDetalhesContrato, que é o modal de edição.
  - "Iniciar contratação" reabre o menu completo (iniciarProcessoContratacao:
    link de coleta, WhatsApp, minuta padrão, gerar minuta); Mais ações
    do chip Contratos tem as 3 vias. O menu em si ainda é Tipo B (fatia 9).
  - Cancelar o formulário de contrato aberto pela ficha do ativo volta
    pra ficha (chip Contratos), não pra lista.
  - Lista de Ativos: tag derivada do contrato (Alugado / Assinando /
    Em uso / Vago) — "Alugado sem contrato" e "Em uso" redundante
    resolvidos; finalidade sai do título.
  - Partes do contrato: locatário editável (lápis → formulário).
O que pode ser eliminado após a migração de fotos (avaliação pedida):
  - imoveis.fotos deixa de ser LIDO pela ficha do ativo. Ainda é lido
    por: card da lista de Ativos (resumo.foto), vitrine in-app
    (3 pontos) e escrito por saveImovel/form (bloco escondido na ficha).
    Migrar esses 5 leitores pra cofre_ativo_fotos = fatia 9, junto com
    a remoção do bloco "Fotos do Imóvel (até 10)" do formulário.
  - A coluna imoveis.fotos e o bucket imoveis-fotos ficam (regra
    aditiva; objetos migrados apontam pro bucket). Drop só quando a
    tabela imoveis for eliminada (item já adiado).

NOVIDADES (Beta v1.111.0) — 10 achados do Nicola nos prints das 13h40
(fatia 4b + correções de fluxo):
  1) "Carregar documento" no contrato abria o cofre.html (tela do módulo
     Cofre, com troca de módulo). Agora usa o MESMO modal de upload do
     ativo (rzCarregarDocumentoContrato → ponte rzAbrirUploadContextual,
     cofre-app.js v1.22.0) e a lista recarrega no evento
     cofre:recarregar-documentos. "Abrir no Cofre" saiu do Mais ações.
     A tela do Cofre fica sem porta de entrada pelo contrato (a última
     que restava fora do menu ⚙️ — remoção das demais na fatia 7).
  2) Documentos do ativo não abriam ao tocar: linha ganhou
     abrir-documento + chevron (cofre-ativos.js v1.19.0).
  3) REGRA NOVA (REGRAS v3.9 §9): chevron › = "entra numa tela";
     linha que abre SHEET usa ⋮ (ocorrências) ou lápis (partes do item);
     linha sem toque não tem ícone. Aplicado em contratos do ativo,
     lista de Contratos, documentos, ocorrências e partes.
  4) Fotos do cadastro antigo (imoveis.fotos, URLs do Drive) não
     apareciam no chip Arquivos › Fotos: fallback em modo leitura
     quando cofre_ativo_fotos está vazia (Alameda Oscar Niemeyer, 288).
  5) Chip Contratos do ativo ganhou rodapé "Abrir contrato" /
     "Iniciar contratação" (criarContratoParaImovel, com o imóvel já
     selecionado) + Mais ações em sheet.
  6) "Partes" — o print acabou sem a frase; tratado como o item 3 (linha
     de parte com lápis = abre editor).
  7) Formulário de contrato (form-contrato-wrapper) no padrão do sheet:
     sobe de baixo, painel branco, título Bricolage sem emoji, X .rz-x,
     3 rótulos de seção em caixa alta → .rz-group, rodapé Cancelar |
     Salvar contrato. saveContrato/editarContrato intactos.
  8) = item 1.
  9) Voltar da ficha do contrato aberta pela ficha do ativo agora volta
     pro ATIVO, no chip Contratos (window.fichaContratoOrigem, rótulo
     do Voltar vira "‹ Ativo").
 10) Voltar do item de controle reabre a ficha do ativo no chip
     Controles (cofre-controles.js v1.14.0; abrirFichaAtivo ganhou
     parâmetro chipInicial).

NOVIDADES (Beta v1.110.0) — FATIA 4 da gramática única: CONTRATOS.
  LISTA (renderContratos): cards soltos → .rz-row agrupadas por
    empreendimento em .rz-card.rz-list; status "ponto + rótulo" via
    renderStatus (Vencido bad · Reajustar warn · Assinando run ·
    Vigente ok · Encerrado neu) — o ícone de alerta e os 4 badges
    Tailwind saíram; chips de filtro em 1 linha (Todos · Vigentes ·
    Com alerta · Assinando · Encerrados) que só escrevem no <select> e
    no checkbox já existentes (renderChipsContratos /
    filtrarContratosPorChip); vazio único.
  FICHA (abrirFichaContrato): cabeçalho de entidade (.rz-entity) com
    status; 4 chips Resumo · Cobranças (n em atraso) · Partes (n) ·
    Arquivos (n); card "Precisa de atenção" (borda danger/wine) com o
    ÚNICO botão preenchido da tela ("Ver alertas"); Condições em
    .rz-kv com rodapé "Editar contrato" + Mais ações em SHEET
    (Histórico · Abrir no Cofre · Gerar minuta se pronta · Abrir o
    imóvel · Excluir); Cobranças com 6 últimas em .rz-row (Pago / Em
    atraso / A receber) e total em atraso no cabeçalho, "Ver no
    Financeiro"; Partes com locatário + fiadores em .rz-row, vazio
    "Nenhum fiador" e "Adicionar fiador"; Arquivos com documentos em
    .rz-row (montarDocumentosContrato) e "Carregar documento".
    Saíram: #fc-mais-acoes e #fc-doc-acoes inline, "Editar" solto de
    Fiadores, "Ver financeiro completo →", 👤 no título.
    Funções de negócio intactas; alternarMaisAcoesFichaContrato/
    alternarMaisAcoesDocContrato ficam como fallback sem sheet.
  Não mexido nesta fatia: cabeçalho da aba (busca + "+" toggle) e o
  formulário Tipo A de contrato — fatias 7 e 9.

NOVIDADES (Beta v1.109.0) — FATIA 3b-ii: formulário do imóvel na
gramática, SEM reescrever saveImovel/editarImovel (ids intactos):
  - Cabeçalho no padrão do sheet (título Bricolage, X .rz-x); títulos
    "Cadastrar imóvel"/"Editar imóvel" (sai o emoji 📝).
  - Rótulos de seção "LOCALIZAÇÃO/VALORES/EXTRAS E SÓCIOS" (caixa alta
    em --brass-deep) viram .rz-group (sentence case, sage) — 3 caixa_alta
    e 3 brass_decorativo a menos na trava. "Extras e Sócios" → "Extras".
  - Síndico, manutencista, sócios e fotos entram num contêiner
    #imo-blocos-ficha: a ficha do ativo o esconde ao abrir o formulário
    (cofre-ativos.js v1.18.1), porque esses blocos já vivem lá (Partes
    do item, Propriedade, Arquivos). No cadastro novo continuam
    visíveis (sócios são obrigatórios pra criar). cancelarEdicaoImovel
    reexibe ao fechar.
  - Rodapé .rz-sh-f: Cancelar (nível 2) à esquerda, "Salvar imóvel"
    (nível 1) à direita — antes era Salvar sprout | Fechar cinza.
O 2º formulário "Detalhes do Imóvel" (abrirDetalhesImovel) segue no
código mas está inalcançável desde a v1.108.0 — remoção física fica
pra limpeza (fatia 8).

NOVIDADES (Beta v1.108.0) — 3 achados do Nicola nos prints das 13h:
  1) TELAS ANTIGAS DE IMÓVEIS DESLIGADAS. Ao fechar o modal "Editar
     Imóvel" o usuário caía na lista/ficha antiga (#tab-imoveis) e
     podia navegar por ela. Causa: o modal (#form-imovel-wrapper) vivia
     dentro da section, então abrirGestaoImovel precisava trocar de aba
     antes de abrir. Agora: (a) o modal é movido pro <body> no boot
     (rzMoverFormImovelParaBody) e abre de qualquer aba; (b) guarda no
     switchTab: tab-imoveis → tab-ativos, sempre; (c) todas as entradas
     redirecionadas — atalhos da Visão Geral (assinando/alerta →
     Contratos; vagos → Ativos com filtro Vago), "< Imóveis" da vitrine,
     "voltar ao app" do menu, alerta de contrato, "ver imóvel" no
     detalhe do contrato (→ ficha do ativo via rzAbrirAtivoDoImovel);
     (d) ao fechar/salvar, cofre-ativos recarrega a ficha do ativo
     (hook __rzAposFecharImovel). A section fica no DOM (o modal e
     renderImoveis dependem dos elementos) mas nunca é exibida; a
     remoção física entra no item "imoveis table elimination" já
     adiado. O 2º formulário ("Detalhes do Imóvel", abrirDetalhesImovel)
     só era alcançável pela ficha antiga — morre junto.
  2) Editar campos do ATIVO abria formulário inline dentro do card;
     agora abre bottom sheet (abrirSheetForm) como o resto
     (cofre-ativos.js v1.18.0).
  3) Status "ponto + rótulo" em toda a tela Alertas (lista e chips em
     1 linha), igual ficha/contrato — ver montarAlertasPatrimonio.

NOVIDADES (Beta v1.107.0) — PALETA EXECUTIVA (decisão do Nicola em
03/09, "opção B" do comparativo; DS v2.3 §1):
  - O app tinha ficado "verde claro de forma geral": cabeçalho --sprout
    (já era assim desde antes), fundo Pérola #f1f4ec (fatia 1) e placas
    de ícone --sprout-light (fatia 3) somados. O cabeçalho médio ainda
    destoava da família escura (splash, botões, chip ativo, sheet).
  - Agora: cabeçalho do App em --pine (mesma família da splash);
    --paper volta a neutro quente #f4f3ee; token novo --tile #e9ece5
    pras placas de ícone (.rz-entity/.rz-row/.rz-act .rz-ic).
    --sprout deixa de ser superfície e vira SÓ acento de estado (aba
    ativa da bottom nav, barra de progresso, positivo). --sprout-light
    segue existindo (bolha "eu" do chat IA, badges antigos).
  - Botões do cabeçalho: Robô em --brass (REGRAS §16) e avatar em
    --pine-light com borda fina, via .rz-hdr-ia/.rz-hdr-avatar — saem
    2 bg-emerald-800. Fatia 7 troca a estrutura inteira pra .rz-hdr.
  - Zero componente tocado: é o que a gramática (tokens + catálogo)
    foi feita pra permitir.
+ FATIA 3b-i nos módulos (ficha do item de controle): ativos-markup.js
  v1.17.0, cofre-controles.js v1.13.0 (parte b), cofre-app.js v1.20.0
  (3 cases novos). Neste arquivo nada além dos tokens acima.
+ cofre-ativos.js v1.17.2: bug do chip Contratos ('Ativo' ≠ 'ativo').

NOVIDADES (Beta v1.106.1) — correções da fatia 3 a partir dos prints
reais do Nicola (03/09, 06:49–06:52):
  1) BUG (Arquivos › Documentos e Fotos): estado vazio E rodapé com os
     mesmos botões apareciam juntos. Causa: .rz-card-f{display:flex} tem
     a mesma especificidade do .hidden do Tailwind e vem depois no CSS
     — o toggle de classe funcionava, o CSS é que não escondia. Regra
     nova [class*="rz-"].hidden{display:none} (0,2,0) fecha isso pra
     todo componente rz-* de uma vez, sem !important.
  2) BUG (Financeiro do ativo): 6 mensalidades inadimplentes apareciam
     como "A receber". Causa raiz no banco: fn_fluxo_financeiro_ativo
     devolvia vencimento NULL e achatava status 'atrasado' em
     'previsto'. Migration fix_v1_fn_fluxo_financeiro_ativo_vencimento_
     status (CREATE OR REPLACE, assinatura igual, 1 overload conferido):
     vencimento = competência + contratos.vencimento_dia (clampado no
     fim do mês), data_pagamento só quando pago, status realizado/
     atrasado/isento/previsto. Front (cofre-ativos.js v1.17.1) passa a
     honrar 'atrasado' e 'isento' além do cálculo por vencimento.
  3) O restante dos prints não é bug: ficha do item de controle,
     "Editar Imóvel 📝" e "Detalhes do Imóvel" ainda estão no padrão
     antigo — são a fatia 3b (ver REGRAS v3.4 §19).

NOVIDADES (Beta v1.106.0) — MERGE de duas linhas que divergiram da
v1.104.0 em sessões diferentes, ambas rotuladas "v1.105.0":
  (a) Partes (esta base): chips no contrato, alocação de despesa por
      parte, "Gerar despesa" no item de controle — texto abaixo, intacto;
  (b) Gramática única, fatias 1 e 2 (reaplicadas aqui, byte a byte):
      tokens (--paper Pérola #f1f4ec, --warning vinho, --wine,
      --brass-bg, --muted, --card, raios, sombra, fontes), catálogo de
      classes rz-* no <style> global e helpers abrirSheet/fecharSheet/
      abrirSheetAcoes/abrirSheetForm/renderStatus/rzSemantica/rzIcones/
      rzEsc logo após APP_VERSAO (expostos em window.*).
Regiões disjuntas (a: a partir da linha ~21.3k; b: :root, fim do
style, pós-APP_VERSAO) — merge por reaplicação, diff conferido: só as
linhas de :root, header e APP_VERSAO diferem da base (a).
+ FATIA 3 (ficha do ativo) entregue nos módulos: ativos-markup.js
  v1.16.0, cofre-ativos.js v1.17.0, cofre-controles.js v1.13.0,
  cofre-app.js v1.20.0 — 7 abas → 5 chips, cards com rodapé único,
  Mais ações em sheet, vazios únicos, status nas 5 semânticas.
  Neste arquivo, só 3 regras de CSS a mais no catálogo (tamanho do
  svg dentro de .rz-row/.rz-empty e flex:none nos ícones de botão).
Trava: verificar_gramatica.py v1.1 rodado — nenhum padrão subiu;
caíram pill_mais_acoes, mais_acoes_inline, caixa_alta, seta_em_texto,
status_tailwind (ver saída no changelog das REGRAS v3.3).

NOVIDADES (Beta v1.105.0 — linha Partes) — fecha a arquitetura de Partes iniciada na
v1.104.0 (3 pedidos explícitos numa sequência de mensagens):

1) Chip "Partes" no Contrato — abrirDetalhesContrato() ganhou uma
fileira de chips no topo (locatário/fiador/rateio-divisão entre
proprietários), lida de 3 fontes (contrato.locatario, partes_papeis
fiador, divisao_repasse_contrato) e montada em paralelo. Só EXIBIÇÃO
— os 3 fluxos de escrita já existentes (popups próprios de
locatário/fiador/divisão) continuam sendo o jeito de editar, não
duplicados.

2) "Vai precisar de um controle de qual a parte é pra alocar a
despesa já que podemos ter mais que 1 parte cadastrada" —
abrirNovaDespesa()/montarPopupDespesa() ganharam um 3º parâmetro
opcional (sugestões vindas do item de controle: descrição, categoria,
lista de partes). 1 parte só → pré-seleciona sozinho. 2+ partes →
mostra um chip por parte acima do campo Fornecedor, pra escolher qual
delas recebe ESTA despesa específica (não dá pra adivinhar). Botão
"Gerar despesa" novo na box Partes do item de controle (módulo
Ativos) já manda tudo pronto.

Testado: query dos chips do contrato (partes_papeis + divisao_repasse_
contrato) como authenticated real, nomes resolvendo certo.

VERSÃO ANTERIOR: Beta v1.104.0
LINHAS: 30364
DATA: 02/09/2026
NOVIDADES (Beta v1.104.0) — pedido explícito: "pode evoluir mais nos
ajustes das cores". 1ª fatia de `index.html` (212 ocorrências reais,
número atualizado — pendência antiga registrava 71): 105 convertidas
nesta rodada, via classes utilitárias novas no <style> global
(.raiz-text-pine, .raiz-bg-pine, .raiz-btn-pine, .raiz-bg-sprout-light,
.raiz-border-sprout — troca só o NOME da classe Tailwind pelo
utilitário, preserva o resto do atributo class="" intacto, mais
seguro em escala do que editar style="" elemento por elemento).

Convertidas: text-emerald-900 (34, títulos), bg-emerald-600 sozinho e
em par com hover:bg-emerald-500 (25, botões de ação primária —
"Salvar X"/"Dar Baixa"/"Recibo"/etc.), text-emerald-700 (18, exceto 1
caso de status), bg-emerald-50 (12), border-emerald-200 (7).

ACHADO NO CAMINHO — 3 ocorrências eram na verdade badge de STATUS
("Alugado"/"ATIVO"/"Pago"), não cor de marca: usavam emerald em vez
do bg-green-100/text-green-800 que o Design System já documenta pra
esse status e que o resto do app já usa — alinhadas ao padrão
correto (Tailwind literal, não token), não convertidas pra --pine
(teriam perdido o significado semântico de "sucesso").

NÃO MEXIDO nesta rodada, de propósito — 107 ocorrências restantes,
majoritariamente uma família visual diferente (UI de fundo escuro:
splash, login, menus sobre fundo escuro, telas de erro, vitrine
pública) que já tem histórico próprio de tratamento cuidadoso
registrado neste changelog (contraste WCAG sinalizado numa entrega
anterior, decisão consciente de escopo à parte da splash/login).
Continuar nesta família pede validação visual real (contraste em fundo
escuro é mais fácil de errar sem navegador) — fica pendência própria,
não decidi sozinho.

VERSÃO ANTERIOR: Beta v1.103.0
LINHAS: 30309
DATA: 02/09/2026
NOVIDADES (Beta v1.103.0) — BUG REAL corrigido, achado pelo Nicola
com 3 screenshots: "há despesas lançadas que, ao atualizar a tela
não aparecem por lá". Causa: renderSaidas() só era chamada de dentro
das próprias mutações (salvarDespesa/confirmarPagamento/etc.) — nunca
ao simplesmente abrir a aba depois de um boot fresco. Testado: dado
e RLS de lancamentos estavam corretos (confirmado via query idêntica
como authenticated real), só faltava o gancho de renderização que
toda outra aba lazy já tem (tab-relatorios/tab-partes/tab-alertas).
Corrigido com o mesmo padrão.

Os outros 3 achados desta rodada (largura das caixas de Ativos mais
estreita que o padrão, chips com barra de rolagem na lista de Ativos,
pendências de cores) foram resolvidos nos arquivos do Cofre — ver
ativos-markup.js v1.14.0, cofre-ativos.js v1.15.0, cofre-controles.js
v1.10.0, cofre-documentos.js v1.7.0, comum-pessoas.js v1.3.0,
comum-licenca.js v1.1.0, comum-minha-empresa.js v1.1.0. Nenhuma
mudança própria de index.html pra esses 3 (o problema vivia inteiro
no módulo Ativos).

VERSÃO ANTERIOR: Beta v1.102.0
LINHAS: 30274
DATA: 02/09/2026
NOVIDADES (Beta v1.102.0) — 3 pedidos explícitos sobre a tela de
Alertas: "ao clicar num alerta, deve permitir o seu tratamento caso
seja um alerta de um item de controle... deve ser possível, via
chip, filtrar os tipos de alertas... deve ter ordenação do mais
crítico pro menos crítico" (confirmado: vencido há mais tempo
primeiro, depois por dias restantes crescente).

Reescrita completa de montarAlertasPatrimonio(): modelo unificado
(itens de controle + contratos vencidos/precisando revisão/
aguardando assinatura + sinais tributários), ordenado por
criticidade, com 5 chips de filtro (Todos/Ativos/Itens de controle/
Contratos/Outros — mapeamento das 4 categorias de negócio pra cima
das fontes de dado existentes, minha interpretação, vale conferir
com o Nicola). Clicar num item de controle abre a ficha dele de
verdade agora (antes só fazia switchTab('tab-ativos') genérico, sem
nem abrir o item certo) — e de lá dá pra tratar (marcar concluído),
reaproveitando a ação "Tratar" que já existia no módulo Ativos, via
1ª ponte deste projeto na direção App→Cofre (ver cofre-controles.js
v1.9.0 pro outro lado). Contratos abrem abrirDetalhesContrato(),
já existente, reaproveitado sem duplicar.

De brinde: "< Voltar" que faltava em tab-alertas (toda aba
secundária deveria ter, DS §4.2) — corrigido, respeitando a origem
real (3 cards da Visão Geral + 1 item do menu ⚙️, nunca fixo).
CATEGORIA_SINAL_ICONE removida (ficou órfã depois da reescrita).

VERSÃO ANTERIOR: Beta v1.101.0
LINHAS: 30088
DATA: 02/09/2026
NOVIDADES (Beta v1.101.0) — pedido explícito: "vasculha tudo pra ver
quem lê a tabela de propriedades hoje pra trocar pra esta de ativo
também". Centralização completa de propriedade em propriedade_ativo
(banco + App):

Banco: fn_apurar_distribuicao (Distribuição) e fn_leitura_tributaria_
sinais (diagnóstico tributário) liam propriedade_imovel direto —
redirecionadas pra propriedade_ativo via cofre_ativos, testadas
contra dado real do Rumo ANTES/DEPOIS (mesmos números, zero
regressão) antes de considerar pronto.

App: carregarImoveisSupabase() (o boot inteiro do app) lia
propriedade_imovel — trocado pra propriedade_ativo com embed
filtrado via cofre_ativos!inner. O popup "Divisão Societária →
Alterações" da ficha antiga do imóvel — que tinha um BUG REAL,
achado nesta sessão, gravando numa coluna imoveis.divisao que não
existe no banco (silenciosamente quebrado) — agora resolve o
ativo_id do imóvel e grava via substituir_propriedade_ativo, mesma
RPC do chip Propriedade novo. O fluxo de salvar/criar imóvel
(sincronizarImovelSupabase) também tinha uma 2ª chamada direta a
substituir_propriedade_imovel — redirecionada igual.

Resultado: zero ponto de escrita ou leitura de propriedade_imovel
restante no App ou nas RPCs de negócio — só a própria tabela (ainda
existe, não apagada) e sua RPC/trigger originais, que continuam
corretas mas sem mais nenhum chamador ativo. Não verificado: bot
WhatsApp (raiz-edge-functions) e cockpit (raiz-gestao) — repositórios
não estavam disponíveis nesta sessão; se algum dos dois também ler
propriedade_imovel, fica pendente conferir numa sessão com esses
repos.

VERSÃO ANTERIOR: Beta v1.99.0
LINHAS: 30010
DATA: 02/09/2026
NOVIDADES (Beta v1.99.0) — aba Contratos reconstruída pro padrão
das outras abas primárias, pedido explícito com screenshot: "deve
ter o padrão dos demais, sem título, com breve descrição, com ícone
de filtro lupa padrão. não tem o resumo de contratos no topo."

Removidos: <h2>"Contratos"</h2> (nenhuma outra aba primária tem
título — DS §4.1) e o box de resumo "Contratos: N ativos / N
suspensos / N finalizados / N total" (idem, nenhuma outra tem).
Os 4 filtros (Empreendimento/Status/Imóvel/Locatário) + checkbox
"só com alerta", que ficavam SEMPRE visíveis ocupando a tela
(violava DS §5: "nenhuma aba tem filtro permanentemente visível"),
foram pro overlay de busca padrão novo (modal-busca-contratos,
mesmo componente de Recebimentos/Atrasados/Saídas — sem "Fechar"
no rodapé, só "Limpar filtros"). Mesmos ids de campo dos filtros —
renderContratos() não mudou nenhuma linha de lógica de filtro, só
perdeu as 4 linhas que atualizavam contadores que não existem mais.

Este changelog também documenta o trabalho feito nos arquivos do
Cofre nesta mesma sessão (chip Propriedade novo + reordenação dos
chips da ficha do ativo + tabela propriedade_ativo/RPCs no banco) —
ver cofre-ativos.js v1.12.0 e ativos-markup.js v1.10.0 pro
changelog completo, já que index.html não precisou de nenhuma
mudança pra isso (o chip vive inteiro dentro do módulo Ativos).

Validado: node --check limpo, balanceamento de div/section/button/
select/form/label ZERO diferença em relação à v1.98.0 recebida de
volta do Nicola.

VERSÃO ANTERIOR: Beta v1.98.0
LINHAS: 29994
DATA: 02/09/2026
NOVIDADES (Beta v1.98.0) — 3 achados reais a partir de 3 screenshots
(Family Office Karen Corporation, tenant de teste): 1 bug de navegação
+ 1 gap de CSS que já existia desde a v1.7.0 do Cofre, só nunca tinha
sido encontrado + 1 ajuste de scroll.

1) BUG REAL — "Editar" na ficha do ativo (aba Dados) abria o modal de
edição do imóvel certinho, mas ao fechar/salvar não voltava pra
tab-ativos — ficava vazando a tela antiga e secundária tab-imoveis
(só imóveis, sem veículos/outros, layout diferente) por baixo do
modal fechado. Causa: abrirGestaoImovel() (cofre-ativos.js) trocava
pra tab-imoveis só pra deixar o modal Tipo A visível (ele vive preso
numa <section> display:none fora da aba ativa), mas nunca dizia ao
App de onde a edição tinha vindo. Corrigido reaproveitando um
mecanismo que já existia pronto no código (fichaOrigemAoEditarImovel,
variável órfã desde uma refatoração anterior, mantida só pra não
quebrar cancelarEdicaoImovel()) — ganhou o chamador que faltava, zero
lógica nova escrita, cobre "Fechar/X" e "Salvar" ao mesmo tempo.

2) GAP DE CSS ACHADO — mesma classe de bug já corrigida uma vez
(v1.96.0, .modal-overlay/.modal-box), só que numa 2ª regra que tinha
ficado de fora daquela varredura: .card-ativo/.card-doc (a moldura
branca com borda que separa cada card na lista) também só existiam
no <style> do <head> de cofre.html standalone — nunca chegaram ao
contexto embutido no App. O HTML/JS de cada card sempre esteve
correto (ícone, título, endereço, status, chip de alerta —
ativoCardHtml() já montava tudo certo); só a caixa em volta nunca
tinha CSS pra existir. Migrado o mesmo valor exato do cofre.html
(border 2px #e2e8f0, radius 14px, fundo branco) pro <style> injetado
em ativos-markup.js — mesmo padrão já usado pro bloco de modais.

3) CHIPS DE TIPO (Todos/Imóveis/Veículos/Outros) — a barra de rolagem
já estava escondida (.raiz-sem-scrollbar), mas nada garantia que a
fileira sempre descansasse encostada à esquerda depois de trocar de
filtro — scroll residual podia deixar "Todos" cortado sem ninguém
estar arrastando. renderChipsAtivos() (cofre-ativos.js) ganhou reset
explícito de scrollLeft=0 depois de toda renderização.

Validado: node --check nos 2 arquivos JS tocados + no bloco JS deste
HTML: sem erro de sintaxe. Balanceamento de div/section/button/select/
form/label/style: ZERO diferença em relação ao arquivo desta mesma
sessão antes da edição (a versão v1.97.0 recebida de volta do Nicola
bate byte a byte com o que eu tinha entregado — confirmado por diff
antes de tocar em qualquer linha, então este changelog edita
exatamente o código de produção, não uma cópia desatualizada).

VERSÃO ANTERIOR: Beta v1.97.0
LINHAS: 29937
DATA: 01/09/2026
NOVIDADES (Beta v1.97.0) — pedido explícito: "vamos evoluir para o
item financeiro, iniciando a escrita de tela para as despesas e
saidas... adicione a um ativo um novo chip de fluxo financeiro".

Aba nova "Saídas" (tab-saidas), 3ª pill do segmento de Financeiro
(Recebimentos · Atrasados · Saídas — mesmo componente/posicionamento
dos outros 2, pra trocar de pill não mudar nada de lugar). CRUD
completo de despesa: criar, editar, dar baixa (com data/forma de
pagamento), estornar, excluir — tudo em public.lancamentos
(direcao='saida'), tabela que já existia mas estava vazia (a
Distribuição já lia dela via fn_apurar_distribuicao, então essa
entrega também corrige um número que já estava sendo mostrado
errado — saídas sempre em zero).

Migration aditiva aplicada: lancamentos ganhou descricao/vencimento/
data_pagamento/forma_pagamento/parte_id/observacao. Fornecedor SEMPRE
resolve pra uma linha de partes (pedido explícito, "prefiro que
tenha um registro, mesmo que incompleto") — o popup de Nova Despesa
cria a parte na hora se ainda não existir, nunca grava nome livre
solto. Vínculo com patrimônio é sempre por ativo_id (cofre_ativos),
nunca imovel_id — decisão já tomada na tabela, esta entrega só
respeita (ver DIAGNOSTICO_ELIMINAR_TABELA_IMOVEIS).

Ficha do ativo ganhou 6ª aba "Financeiro" (ver ativos-markup.js
v1.8.0/cofre-ativos.js v1.10.0): resumo de entradas/saídas dos
últimos 6 meses + lista, com "Novo lançamento" e "Ver tudo em
Saídas" — as 2 ações são pontes pro App (abrirNovaDespesa/
abrirSaidasFiltradasPorAtivo), nenhum formulário duplicado.

RPC nova fn_fluxo_financeiro_ativo (SECURITY INVOKER, testada como
authenticated real antes de entrar) une entradas (mensalidades, via
ativo→imóvel de origem→contrato) e saídas (lancamentos, direto por
ativo_id — funciona pra qualquer tipo de ativo, não só imóvel).

Conciliação de extrato bancário FICA DE FORA desta entrega (pedido
explícito) — outra pendência.

Redesenho completo de navegação por chips na ficha do ativo (chips
com sub-itens, chip Propriedade, ações movidas pra dentro do chip)
CONTINUA pendente — o chip Financeiro é o passo concreto possível
dentro desse item maior, não o redesenho inteiro (que ainda precisa
de sessão própria com estrutura confirmada, como já registrado em
PENDENCIAS_RAIZ_PATRIMONIO_2026_09_01.md).

NOVIDADES (Beta v1.96.3) — pedido explícito: "criar uma tela
especifica para o alertas sobre patrimonio... acessivel pelo menu
bonequinho... retire a descricao dos alertas da sessao de
resultados... deixe ele apenas aparecer como alerta na visao geral,
ao clicar abra esta nova tela."

Tela nova tab-alertas, no menu Configurações (grupo próprio, "Alertas",
no topo do menu — maior visibilidade que os grupos de cadastro
abaixo). 2 seções: "Controles do patrimônio" (IPTU/seguro/manutenção
vencidos/vencendo — detalhe item por item, coisa que a Visão Geral
nunca mostrou, só contagem) e "Diagnóstico tributário" (MOVIDO de
Resultados pra cá — mesmo rendering, só de endereço novo).

Resultados perdeu o card "Diagnóstico tributário" (só ficaram KPIs +
Cenário econômico) — a busca de fn_leitura_tributaria_sinais também
saiu de montarResumoResultados(), não fica mais duplicada em 2
lugares.

Visão Geral: os 3 itens de alerta que antes abriam Ativos/Resultados
(2 de controles + 1 de tributário) agora abrem tab-alertas — a Visão
Geral resume, a tela nova detalha.

Validado: node --check no bloco JS extraído, balanceamento de tags
idêntico ao início desta sessão, 4 usos confirmados de
switchTab('tab-alertas') (3 na Visão Geral + 1 no menu).

VERSÃO ANTERIOR: Beta v1.96.1
LINHAS: 29049
DATA: 01/09/2026
NOVIDADES (Beta v1.96.1) — 1 bug crítico corrigido + 1 bug de
navegação + 1 migração de dados, todos pedidos explícitos depois do
Nicola testar a v1.96.0.

1) BUG CRÍTICO CORRIGIDO — "a lista de imóveis não está carregando",
   achado pelo console real do Nicola: "Falha no bootstrap do Cofre:
   TypeError: Cannot read properties of null (reading 'classList')
   at Module.bootstrap". Causa raiz: o prefetch da v1.95.0
   (prefetchModuloAtivos) usava import(), que não só baixa o módulo,
   EXECUTA — e a última linha de cofre-app.js chama nav.bootstrap()
   sozinha, sem checar nada. No momento do prefetch (logo após
   login, Ativos nunca foi aberta) o HTML do Cofre ainda não existe
   em tela — bootstrap() tentava mexer em elemento que não existia,
   crashava. Pior: módulo ES só avalia 1 vez — depois desse crash, a
   aba Ativos ficava morta pra sempre, mesmo abrindo ela de verdade
   depois. Corrigido com a ferramenta certa: <link
   rel="modulepreload">, que baixa e compila sem executar nem uma
   linha. Reforço extra em cofre-navegacao.js (bootstrap()/
   falhaAcesso() ganharam guarda defensiva, 2ª camada).

2) "AO SAIR DA ABA DE PARTES, APARECE ESTA TELA DE PARÂMETROS QUE
   DEVE SER ELIMINADA" — os botões "Voltar" de Síndicos/
   Administradoras/Manutencistas/Partes apontavam pra
   tab-parametrizacoes, uma tela morta desde que esses cadastros
   ganharam porta de entrada direta no menu Configurações (a própria
   tela já dizia "estes cadastros agora têm telas próprias" — nunca
   foi atualizada quando isso mudou). Removidos os 4 "Voltar" —
   mesmo padrão já correto de Tipo de Empreendimento/Tipo de Imóvel,
   que nunca tiveram esse botão.

3) MIGRAÇÃO — prestadores (síndico/administradora/manutencista, 11
   linhas) e fiadores (contrato_fiadores, 1 linha) migrados pra
   partes/partes_papeis. Aditivo e idempotente: prestadores/
   contrato_fiadores continuam existindo do jeito que estavam,
   partes é só o espelho de identidade (mesmo princípio já usado pra
   locatário/proprietário desde v1.84.3-8). Dedup por CPF/CNPJ
   funcionou corretamente — achei um caso real de CPF repetido entre
   2 prestadores diferentes (dado de teste), virou 1 parte só com os
   2 papéis. Verificado direto no banco depois de aplicar, não só
   "rodou sem erro".

Validado: node --check no bloco JS extraído, balanceamento de tags
com variação ZERO desde o início desta sessão, migração conferida
com SELECT de verificação (contagem batendo 11 prestador + 1 fiador
+ 2 proprietario, exatamente o esperado).

VERSÃO ANTERIOR: Beta v1.96.0
LINHAS: 28946
DATA: 01/09/2026
NOVIDADES (Beta v1.96.0) — itens 4, 5 e 6 da sequência de pedidos
sobre a aba Ativos e o menu do App.

4) BOTÕES/MODAIS NO PADRÃO DE IMÓVEIS — achado real, não só ajuste:
   as classes .modal-overlay/.modal-box, usadas por 15 modais
   diferentes do Cofre (busca de ativos, upload, ficha de documento,
   categorias, sub-tipos, modelos de controle etc.), NUNCA tiveram
   CSS definido no contexto embutido no App — existiam só no <head>
   do cofre.html, que nunca foi extraído junto (só o <body> foi
   trazido). Corrigido: CSS adicionado (ver ativos-markup.js),
   mesmo padrão bottom-sheet que o resto do app usa. "Apenas um
   modal por vez": abrirModal() (cofre-ui.js) agora fecha qualquer
   outro .modal-overlay aberto antes de abrir um novo.

5) MODAL DE CONSULTA AMPLIADO — busca por texto agora casa com nome
   do ativo, locatário do contrato principal e título de item de
   controle vinculado. 2 filtros novos: Status (Vago/Alugado/
   Assinando pra imóveis; Ativo/Vendido/Arquivado pra outros ativos)
   e Alerta (com/sem ocorrência pendente). Aplicam ao vivo.

6) TELA NOVA "PARTES" — cadastro único de pessoas/empresas que já
   aparecem como locatário, fiador, interessado ou proprietário
   (unificação de contrapartes, trens anteriores) — evita
   recadastrar o mesmo CPF/CNPJ em contextos diferentes. Mesmo
   padrão visual e de código do cadastro de Síndico (formulário
   liga/desliga, lista com editar/excluir). No menu Configurações,
   grupo Empresa, ao lado de Pessoas & acessos/Minha Empresa.
   Diferença honesta do padrão de síndico: sem checkbox de vínculo
   (síndico vincula empreendimentos; aqui os PAPÉIS continuam sendo
   atribuídos automaticamente pelos fluxos de contrato/imóvel já
   existentes — esta tela é só o cadastro da parte em si, mostrando
   os papéis já atribuídos como informação). Atribuir um papel novo
   direto desta tela (escolhendo o imóvel/contrato) é maior, fora
   desta entrega.

Validado: node --check no bloco JS extraído, balanceamento de tags
com variação ZERO em relação ao arquivo do início desta sessão (só
os elementos void, como <input>, aumentaram — esperado, void não
tem fechamento pra contar), zero função ou id duplicado, GRANT/RLS
de partes e partes_papeis conferidos no banco antes de escrever
qualquer query.

VERSÃO ANTERIOR: Beta v1.95.0
LINHAS: 28561
DATA: 01/09/2026
NOVIDADES (Beta v1.95.0) — pedidos explícitos sobre a Visão Geral e o
carregamento da aba Ativos, todos verificados contra 2 screenshots
reais.

1) ALERTAS DA VISÃO GERAL UNIFICADOS — achado real: 8 tipos de ponto
   de atenção, cada um com HTML repetido à mão em sessões diferentes.
   A inconsistência de espaçamento que você reparou vinha de um
   wrapper aninhado (#geral-atencao-fundidos) sem a mesma classe
   space-y-2 do container pai. Corrigido com uma função só,
   pontoAtencaoHtml() — impossível divergir por acidente daqui pra
   frente.
   Resposta direta à sua pergunta ("as funções de carregamento estão
   unificadas? quais oportunidades de centralizar?"): NÃO estavam —
   2 funções, a maior com 3 buscas em SEQUÊNCIA. Unificadas em
   carregarDadosAssincronosVisaoGeral(), 1 função só, as 4 buscas
   (KPIs + controles + tributário + triagem) disparadas TODAS JUNTAS
   via Promise.allSettled — é a causa raiz de "cada componente
   carregando num tempo diferente". Achado no caminho: uma chamada
   órfã à função antiga (carregarKpisVisaoGeral()) que eu tinha
   esquecido de remover numa entrega anterior — corrigida.

2) DELAY DA ABA ATIVOS — causa real: o módulo inteiro do Cofre só
   começava a baixar no instante do primeiro toque na aba.
   prefetchModuloAtivos() pré-carrega os mesmos imports em segundo
   plano, ocioso (requestIdleCallback), logo após o login — quando a
   pessoa abre Ativos de verdade, o navegador já tem tudo em cache.
   Zero mudança em ativos-boot.js.

3) LISTA DE ATIVOS — agrupamento por empreendimento (ver
   ativos-markup.js/cofre-ativos.js v1.6.0/v1.8.0), mesmo critério
   da lista antiga de Imóveis.

4) FICHA DO ATIVO — 2 bugs reais achados com screenshot: grade de
   dados do imóvel quebrada (entrava dentro de um flex de 2 filhos
   só) e abas rolando horizontalmente sem precisar. Linguagem "por
   módulo" removida ("Este ativo referencia um imóvel já
   cadastrado", "aqui é só o vínculo") — ver changelog completo nos
   arquivos do Cofre.

Validado: node --check no bloco JS extraído, balanceamento de tags
idêntico ao arquivo antes desta edição, zero chamada de código ativo
às 2 funções antigas de Visão Geral (só sobrou menção em comentário).

VERSÃO ANTERIOR: Beta v1.94.2
LINHAS: 28469
DATA: 31/08/2026
NOVIDADES (Beta v1.94.2) — 2 pedidos explícitos: (1) "os documentos
em triagem e qq outro alerta que venha do sistema deve estar na aba
de visão geral integrada do app"; (2) "apague a aba antiga do cofre
de visão geral pra irmos reduzindo e limpando o html".

1) "Em triagem" fundido na Visão Geral — carregarPontosAtencaoFundidos()
   (tab-geral) ganhou um 3º sinal: documentos sem nenhum vínculo
   (mesma classificação que a Home antiga do Cofre usava —
   classificarStatusVinculo, 0 linhas em cofre_documento_vinculos =
   triagem), como query própria (não dá pra depender de
   estado.documentos do Cofre aqui — pode não ter carregado ainda se
   a pessoa nunca abriu a aba Ativos). Zero lógica nova de negócio,
   só uma 2ª fonte de leitura pro mesmo critério.

2) Home + Alertas antigas do Cofre APAGADAS de dentro do App —
   ver js/ativos/ativos-markup.js v1.5.0 (~65 linhas de HTML a
   menos). O que cada uma mostrava:
     - KPIs (ativos controlados/alertas próximos/docs guardados) —
       removidos sem substituto, não eram alertas.
     - "Comece pelo documento" — já virava o botão "Carregar
       documento" da barra de Ativos desde a v1.94.1, redundante.
     - "Em triagem" — migrado pra cá (item 1 acima).
     - "Atenção necessária" (controles vencidos/vencendo) — já
       tinha sido fundido aqui desde a v1.91.0; a seção da Home era
       puramente redundante desde então.
     - Tela "Alertas" — já estava ÓRFÃ antes desta versão (nenhum
       botão chamava mais 'ir-alertas' desde uma revisão de
       25/08/2026, código nunca tinha sido limpo). As ações "Tratar/
       Acionar" que oferecia continuam alcançáveis do mesmo jeito de
       sempre: ficha do ativo → aba Controles → item → tratar.
   cofre-documentos.js (montarHome) e cofre-app.js (renderAlertas)
   NÃO foram apagados — são compartilhados com o cofre.html
   standalone, que continua com as 2 telas normais. Só ganharam
   guarda defensiva (elemento nulo = não faz nada) pra não quebrar
   quando chamadas aqui dentro.

Validado: node --check nos 4 arquivos tocados (index.html +
ativos-markup.js + cofre-app.js + cofre-documentos.js), balanceamento
de tags idêntico ao arquivo antes desta edição.

VERSÃO ANTERIOR: Beta v1.94.0
LINHAS: 28396
DATA: 31/08/2026
NOVIDADES (Beta v1.94.0) — "Vamos seguir com o que falta, unificação"
(pedido explícito). Fecha o 2º item que tinha ficado de fora da
v1.93.0: Imóveis deixa de ser destino de navegação de mesmo nível
que Ativos.

O QUE MUDOU:
1) Segmento "Imóveis / Ativos" REMOVIDO dos dois lados. Ativos passa
   a ser o único destino primário — os chips de tipo (v1.5.0 do
   Cofre) já filtram só imóveis quando alguém quer ver só isso, não
   precisa mais de uma tela irmã pra isso.
2) tab-imoveis virou tela SECUNDÁRIA — mesmo padrão já usado em
   tab-vitrine ("< Imóveis"): agora tem breadcrumb "< Ativos" no
   lugar do segmento. Continua 100% funcional por dentro (cadastro,
   vitrine, filtros por empreendimento/status) — só mudou a PORTA de
   entrada, nenhuma linha de lógica de negócio foi tocada.
3) NOVO botão "Cadastrar novo imóvel" na barra da aba Ativos —
   investiguei antes de remover o segmento: sem esse botão, cadastrar
   um imóvel novo dependeria de existir algum alerta pendente na
   Visão Geral (vago, contrato assinando) pra levar até tab-imoveis
   — no caso comum (carteira em dia, zero alertas), ficaria sem
   NENHUM caminho até o cadastro. Corrigido com uma ponte direta:
   abrirCadastroImovelModal() (função nativa do App, mesmo formulário
   completo de sempre) chamada a partir de dentro da aba Ativos —
   funciona porque o modal é position:fixed, não depende de
   tab-imoveis estar "ativa" por baixo. Ponte defensiva (checa
   typeof antes de chamar) do lado do Cofre.

O QUE FICOU DE FORA, de propósito (não é o mesmo item, é o outro que
também tinha ficado pendente na v1.93.0): fundir os 2 formulários de
ESCRITA — hoje "Editar dados" na ficha do ativo ainda edita
cofre_ativos.dados_especificos (JSON), e o endereço/IPTU/valor de
mercado de verdade (tabela imoveis) só se edita mesmo é abrindo
"Abrir gestão do imóvel →", que leva pra tab-imoveis. Fazer o
"Editar dados" da ficha do ativo escrever direto na tabela imoveis é
mudança de maior risco (mexe no caminho de escrita do dado mais
crítico do sistema) — fica pra confirmar depois que esta entrega for
testada em navegador de verdade. Ver lista de pendências atualizada
no fim da conversa.

Validado: node --check nos 3 arquivos tocados (index.html +
ativos-markup.js + cofre-app.js), balanceamento de tags comparado
com a versão imediatamente anterior, TAB_PARENT_MAP conferido (já
apontava tab-imoveis → tab-ativos desde v1.90.0, não precisou mudar).

VERSÃO ANTERIOR: Beta v1.93.0
LINHAS: 28339
DATA: 31/08/2026
NOVIDADES (Beta v1.93.0) — 5 pedidos explícitos na mesma entrega,
todos conferidos contra 3 screenshots reais do protótipo rodando
(não só o HTML/CSS lido antes) que o Nicola anexou.

1) IMÓVEIS+ATIVOS — FICHA EVOLUÍDA PRO PADRÃO DO PROTÓTIPO. A ficha
   do ativo (dentro de js/ativos, injetada na aba Ativos) deixou de
   ser boxes empilhados e virou 5 ABAS: Dados · Documentos ·
   Controles · Contratos · Fotos — igual ao mockup. Mudança
   DELIBERADA de padrão só nesta tela (o resto do app continua com
   boxes empilhados, decisão de Design System de 25/08/2026 — "menu
   suspenso com abas não é o padrão do projeto"; registrado nos
   changelogs dos arquivos do Cofre pra não parecer inconsistência
   não percebida).
     - Aba Dados: grade completa (Inscrição imobiliária, UF/
       Município, Uso, Tipo de locação, Valor de mercado, IPTU,
       Endereço completo) — antes só um resumo em texto corrido.
       "Abrir gestão do imóvel →" continua ali: editar esses campos
       ainda é só pelo formulário de verdade do imóvel (cofre_ativos.
       dados_especificos e imoveis são tabelas diferentes — fundir
       os 2 formulários de escrita é decisão maior, fora desta
       entrega).
     - Aba Documentos: modal-documentos-ativo REMOVIDO, virou
       conteúdo inline (mesmos 2 botões de upload, mesma lista).
     - Aba Contratos: NOVA — mostra os contratos vinculados ao
       imóvel (locatário, valor, status, vigência), lendo direto a
       tabela contratos via cofre-api.js. "Relação, não fusão" (like
       o protótipo): é só leitura, o contrato continua tendo ficha
       própria completa (reajuste/minuta/rescisão) só na aba
       Contratos do App — nada disso foi duplicado aqui.
     - Aba Fotos: ganhou estado vazio de verdade (antes, sem foto, a
       aba ficaria em branco).
   Confirmado no banco antes de mexer: os 49 imóveis do Rumo já
   estão 100% sincronizados com cofre_ativos (nenhum órfão) — a
   base de dados pra unificação já era segura.
   FICOU DE FORA, de propósito: fundir os 2 formulários de escrita
   (editar imóvel completo dentro da própria ficha do ativo, sem
   precisar do botão "Abrir gestão") e aposentar a aba Imóveis como
   destino de navegação próprio — são mudanças de escopo maior,
   tocam o fluxo diário do Rumo, ficam pra confirmar depois de testar
   esta entrega em navegador de verdade.

2) MENU CONFIGURAÇÕES — 3 telas do Cofre que nunca tinham porta de
   entrada aqui: "Categoria de Documento" e "Sub-tipos de item de
   controle" são NOVAS; "Modelos de controle" deixou de estar
   marcada (errado) como "Em breve" — já existia e funcionava no
   Cofre, eu não tinha conferido lá antes de marcar como pendente na
   v1.89.0. Ponte técnica nova: cofre-navegacao.js ganhou suporte a
   ?abrir=categorias|subtipos|modelos (mesmo espírito de segurança
   do contexto/ref que já existia — parâmetro de URL nunca é
   autorização).

3) SELETORES VIRARAM CHIPS — os 3 pares de segmento (Imóveis/Ativos,
   Recebimentos/Atrasados, Resumo/Distribuição) trocaram do estilo
   "2 botões 50/50" pro estilo pill do protótipo (fundo cinza claro,
   item ativo em branco com sombra).

4) VISÃO GERAL — hero redesenhado no padrão do protótipo: "Patrimônio
   sob gestão" (valor total) + Recebido do mês + Ocupação — reaproveita
   fn_resumo_resultados (mesma RPC de Resultados, zero lógica nova).
   Diferença honesta do protótipo: "Inadimplência" continua como
   CONTAGEM, não virou porcentagem — a RPC não devolve uma taxa
   pronta e eu não tinha uma base clara (% de quê?) pra calcular uma
   sem arriscar mostrar um número que parece preciso mas não é.

5) HEADER — label "Imóveis" removido de baixo do nome da empresa. E
   um BUG REAL da v1.92.0 corrigido no caminho: a div interna do
   header tinha uma classe Tailwind fixa (bg-emerald-950) cobrindo o
   var(--sprout) que a mudança de paleta tinha aplicado — o header
   nunca mudou de cor de verdade até agora.

ACHADO NÃO RESOLVIDO NESTA ENTREGA, registrado pra não esquecer: além
dos 68 pontos var(--pine) já tratados na v1.92.0, o arquivo tem 72
usos de classes Tailwind fixas (bg-emerald-950/900/800/700/600) que
representam a marca só que FORA do sistema de tokens — só a do header
foi corrigida (bloqueava o item 5). As outras 71 continuam como
estavam; não mexi sem mostrar a lista primeiro, mesmo critério já
validado antes pra troca de paleta.

Validado: node --check em cada um dos 7 arquivos tocados (index.html
+ 6 arquivos do Cofre), balanceamento de tags comparado com a versão
anterior a cada edição, zero id novo duplicado, zero referência
remanescente aos 2 data-action do modal removido. GRANT de SELECT em
contratos pra authenticated confirmado no banco antes de escrever
buscarContratosDoImovel(). Ainda SEM teste em navegador de verdade —
a ficha em abas é a peça de maior risco visual desta entrega (nunca
usei este padrão de abas antes, mesmo já validando a mecânica com
cuidado) — prioridade #1 de quem testar.

VERSÃO ANTERIOR: Beta v1.92.0
LINHAS: 28135
DATA: 31/08/2026
NOVIDADES (Beta v1.92.0) — Mudança de paleta de cores, decisão de
design já tomada em conversa separada (documento de instruções
colado nesta sessão) — aplicada com rigor, sem redesenhar nada.

2 tokens novos no :root, mesma família de matiz do --pine já
existente: --sprout (#3f8163) e --sprout-light (#dcebe0). Regra:
--pine/--pine-deep ficam reservados pra telas de AUTORIDADE (contrato,
minuta, fiador, divisão societária de contrato — qualquer tela que
precisa parecer séria de propósito); --sprout vira o padrão do DIA A
DIA (header, barra de baixo, menu Configurações, botões "Salvar" fora
de contexto de contrato).

Antes de trocar qualquer coisa: grep de TODO uso de var(--pine)/
var(--pine-deep) no arquivo (68 pontos reais), classificados em
autoridade × dia a dia × ambíguo. Como passou de 15 pontos, PAREI e
mostrei a lista completa pro Nicola antes de mexer em código (regra
do próprio pedido, mesmo critério já usado pra escopo de rename de
coluna). Confirmado: (a) escopo só index.html nesta entrega —
cofre.html fica pra depois; (b) os pontos ambíguos (trocar de empresa,
pessoas & acessos, minha empresa, distribuição de sócios do imóvel,
toggle genérico, toast, banner de upsell) entram como dia a dia.

48 pontos viraram --sprout: header principal, indicador da barra de
baixo (JS + CSS), os 18 ícones do menu Configurações, os 2 cards hero
(Visão Geral e Resumo de Resultados — gradiente pine-deep→pine virou
sprout SÓLIDO, porque não existe --sprout-deep nos tokens definidos;
sinalizando essa decisão, não escondendo), os 5 segmentos de 2 botões
(Imóveis/Ativos, Recebimentos/Atrasados, Resumo/Distribuição), Salvar
Imóvel, Confirmar Retirada, toast informativo, banner de upsell de
plano, toggle de preferência de comunicação, dots do onboarding.

18 pontos ficaram --pine de propósito (autoridade, contrato/minuta/
fiador): confirmado 1 a 1 depois da troca, por conteúdo (não por
número de linha, que mudou ao inserir os tokens no :root) — nenhum
deles foi tocado.

Teste de contraste (WCAG AA) rodado ANTES de aplicar, não assumido:
branco sobre --sprout = 4,63:1 — passa AA pra texto normal (mínimo
4.5), mas com margem pequena; recomendo conferência visual em
aparelho real. --sprout como TEXTO sobre --sprout-light = 3,75:1 —
FALHA AA pra texto normal (só serve pra elementos grandes/ícones,
nunca texto de corpo nessa combinação — nenhum ponto desta entrega
usa essa combinação, registrado aqui como limite conhecido pra
entregas futuras).

Documento DESIGN_SYSTEM_RAIZ_PATRIMONIO não estava anexado nesta
conversa — o patch da paleta foi entregue como arquivo avulso, pronto
pra aplicar quando o documento real vier (ver mensagem de entrega).

cofre.html e Módulo de Gestão (raiz-gestao)/raiz-site ficaram fora
desta entrega, de propósito (decidido antes de começar). Nenhum
arquivo novo entrou no fluxo de deploy — é o mesmo index.html de
sempre, só editado.

VERSÃO ANTERIOR: Beta v1.91.0
LINHAS: 28067
DATA: 31/08/2026
NOVIDADES (Beta v1.91.0) — Sequência de pedidos explícitos, todos
conferidos contra o protótipo (PROTOTIPO_MODULO_UNICO_RAIZ_v1_0.html)
e, pra Resultados/Diagnóstico tributário, contra uma sessão anterior
(busca em conversas passadas) que já tinha construído e testado o
backend — só nunca tinha ganhado tela.

1) BARRA DE BAIXO — Contratos mudou de posição, agora vem logo depois
   de Ativos (antes de Financeiro) — ordem exata do protótipo (Visão
   geral · Ativos · Contratos · Financeiro · Resultados). Só trocou
   de lugar no HTML.

2) ALERTAS FUNDIDOS + DIAGNÓSTICO TRIBUTÁRIO NA VISÃO GERAL — o card
   "Atenção necessária" (tab-geral) agora funde 2 sinais que só
   existiam em telas separadas: (a) controles do Cofre vencidos/
   vencendo em 14 dias (cofre_ocorrencias_controle, mesma query de
   listarOcorrenciasAbertasComItem() do Cofre, chamada aqui pelo
   dbAuth do próprio index.html); (b) 1 item resumido de "Diagnóstico
   tributário" (fn_leitura_tributaria_sinais, RPC já pronta e testada
   desde v1.85.0 — achei via busca em conversa anterior, nunca tinha
   tela nenhuma). Os itens síncronos que já existiam (inadimplência,
   contratos assinando/com alerta, vagos) não foram tocados — os 2
   novos chegam um instante depois, sem bloquear o resto, dentro do
   MESMO card (nunca um card à parte). Ver carregarPontosAtencaoFundidos().

3) RESULTADOS — "Resumo" de verdade no topo da aba (antes só existia
   "Métricas", o relatório antigo por filtro — intocado, só ganhou
   resumo em cima): card de KPIs (fn_resumo_resultados — recebido
   12m, ocupação, yield bruto, cobertura de valor de mercado) +
   card "Diagnóstico tributário" completo (mesma RPC do item 2, aqui
   sinal-por-sinal com detalhe) + nota honesta de "Cenário econômico"
   (IPCA/Selic — continua bloqueado, projeto sem pg_net/http
   instalado, precisa de Edge Function; não é código faltando, é
   infraestrutura). Ver montarResumoResultados().

Achado ao investigar: as 2 RPCs (fn_resumo_resultados,
fn_leitura_tributaria_sinais) já existiam prontas, testadas com
sessão real e corretamente protegidas (REVOKE ALL FROM PUBLIC + GRANT
EXECUTE só pra authenticated, conferido no banco antes de usar) desde
v1.85.0 — só nunca tinham ganhado NENHUMA tela. Zero migration nova
nesta entrega, só front consumindo o que já existia.

O QUE FICOU DE FORA, DE PROPÓSITO (pedido também explícito, não
esquecido): "os ativos e imóveis devem também se fundir" + navegação
por tipo dentro de Ativos, com sub-funções ao entrar no ativo — é o
item de maior risco de tudo que foi pedido (mexe na única fonte de
receita hoje, o fluxo de contrato/cobrança do Rumo, sem poder testar
em navegador) e fica de fora deste trem de propósito. Ver mensagem de
entrega pra proposta de como fatiar isso com segurança.

VERSÃO ANTERIOR: Beta v1.90.0
LINHAS: 27784
DATA: 31/08/2026
NOVIDADES (Beta v1.90.0) — Dois pedidos explícitos na sequência da
v1.89.0: (1) "no menu ativo, ainda aparece a visão geral do ativo e ao
final os botões visão geral e ativo. Isto já deveria ter sido
unificado"; (2) "pode também unificar o imóveis e ativos que tinha
deixado para o final".

1) HOME INTERNA DO COFRE, DENTRO DA ABA ATIVOS — deixou de ser a tela
   padrão. js/ativos/ativos-boot.js (v1.1.0) agora escuta o evento
   'cofre:dados-carregados' e, um instante depois (setTimeout 0 — dá
   tempo do próprio nav.bootstrap() do Cofre terminar sua sequência,
   senão minha troca de tela seria sobrescrita pela dele), força a
   tela pra 'ativos' (lista) com as MESMAS funções que o antigo botão
   "Ativos" do switcher já chamava — mudarTela('ativos') +
   renderAtivosLista(). O switcher (nav.bottom-nav interna, que só
   tinha sido REPOSICIONADA em v1.84.0) agora é ESCONDIDA de vez.
   Nada de cofre-navegacao.js/cofre-app.js foi tocado (também usados
   pelo cofre.html standalone, que não deveria mudar de
   comportamento) — a correção inteira vive na camada de integração.
   Nenhum acesso foi perdido: a Home (KPIs de ativos/alertas/docs,
   "Em triagem", "Comece pelo documento") e, a partir dela, Alertas
   continuam existindo — só passaram a ser alcançáveis por 1 ícone
   novo ("Visão geral do Cofre") na barra da lista de Ativos, em vez
   de tela padrão. Ver js/ativos/ativos-markup.js (v1.1.0).

2) IMÓVEIS UNIFICADO COM ATIVOS NA NAVEGAÇÃO — barra de baixo passa de
   6 pra 5 ícones (Visão Geral · Ativos · Financeiro · Contratos ·
   Resultados), batendo com o protótipo desde sempre. Mesmo mecanismo
   já validado em v1.88.0 pra Cobranças/Distrib.: segmento de 2
   botões (Imóveis/Ativos) no topo de CADA UMA das duas telas, só
   chamando switchTab() — NENHUM HTML ou lógica de negócio foi movido
   ou mesclado entre tab-imoveis e tab-ativos, as duas continuam
   100% intactas por dentro. TAB_PARENT_MAP atualizado: tab-imoveis e
   suas 3 telas-filhas (vitrine, ficha do imóvel, detalhe de
   recebimento) passam a acender o ícone "Ativos" — o lookup não é
   encadeado, então as 4 entradas precisaram apontar direto pra
   'tab-ativos', não só 'tab-imoveis' (que não tem mais botão na
   barra). Diferença honesta do protótipo, mantida como estava: o
   FORMULÁRIO de criação de Imóveis continua separado do formulário
   "Novo ativo" do Cofre — só a navegação foi unificada, a decisão de
   fundir os dois cadastros de dado continua em aberto (é bem maior,
   mexe em sincronização de dado real, não só navegação).

Achado ao entregar o item 1): js/ativos/ativos-boot.js e
js/ativos/ativos-markup.js existem desde v1.80.0/v1.84.0 mas NUNCA
tinham entrado no manifesto do Deploy_Raiz.ps1 — corrigido junto
(script sobe pra v2.3, DEPLOY_RAIZ_PATRIMONIO.md sobe pra v2.6, ver
changelog de lá).

Validado: node --check no bloco JS extraído (limpo), balanceamento de
div/button/svg/section/span/a/p/nav comparado com o arquivo antes
desta edição (nenhum diff piorou), zero referência solta a
btn-tab-imoveis (removido de propósito). Ainda SEM teste em navegador
de verdade — mesma ressalva de sempre, prioridade #1 de quem testar,
com atenção especial a: (a) o setTimeout(0) do item 1 é uma técnica
de coordenação entre módulos que nunca tinha sido usada neste projeto
— merece confirmação visual de que a lista de Ativos aparece direto,
sem "piscar" a Home antes; (b) os 2 segmentos novos (Imóveis/Ativos)
precisam ser conferidos lado a lado com os já existentes (Financeiro/
Cobranças) pra bater visualmente.

VERSÃO ANTERIOR: Beta v1.89.0
LINHAS: 27678
DATA: 31/08/2026
NOVIDADES (Beta v1.89.0) — Menu do bonequinho ("Configurações")
reestruturado seguindo a proposta do protótipo (pedido explícito,
"avançar com os ajustes do menu bonequinho conforme protótipo").

1) Cabeçalho de identidade novo dentro do próprio sheet: avatar com
   iniciais (ex.: "Nicola Santos Dutra" -> "ND") + nome + empresa ·
   perfil — preenchido por atualizarMenuContaHeader(), chamada 1x em
   entrarNaEmpresa() logo depois de aplicarBrandingCliente() (mesmo
   ponto em que socioLogado/perfilLogado/CONFIG_CLIENTE/LICENCA_ATUAL
   já estão todos carregados — zero consulta nova ao banco). O mesmo
   avatar substitui o ícone genérico de pessoa no gatilho do header.

2) Grupos reorganizados pra bater com o protótipo: Conta (novo, no
   topo) · Cadastros e prestadores (mantido, 100% intocado nos 6 itens
   que já existiam) · Empresa · Plano · Integrações (novo) · Legal
   (novo). Todo item que já tinha tela própria continua com ela —
   só mudou de grupo (Preferências de comunicação/Suporte foram pra
   "Conta"; Sobre foi pra "Legal"; "Pessoas" virou "Pessoas &
   acessos" no rótulo, mesma tab-pessoas de sempre).

3) 5 itens do protótipo que ainda não têm tela de verdade por trás
   entram como linha desabilitada com selo "Em breve" (mesmo padrão
   já usado em botões de mídia sem arquivo — opacity-40 +
   cursor-not-allowed): Meu perfil, Sócios & cotas, Modelos de
   controle, Certificado/NFS-e, Banco (extrato). Zero gate de licença
   por trás — é só estrutura visual, igual o painel v1.39.8 antigo já
   fazia antes de Sobre/Suporte virarem reais.

4) "Trocar de empresa" virou REAL fora da aba DEV — resolve a lacuna
   apontada no handoff de 31/08/2026 ("não localizei nenhum seletor
   de empresa em lugar nenhum do app", achado comparando contra o
   protótipo). Reaproveita a trocarEmpresa() que já existia pronta
   (recarrega a página; verificarAcessoEEntrar() mostra a seleção de
   novo se a pessoa tiver mais de 1 empresa) — zero função nova.

5) "WhatsApp (R.AI.Z)" (grupo Integrações) chama a MESMA
   abrirBotWhatsapp() do ícone do mascote no header — 2ª porta de
   entrada pra mesma função, não uma integração nova.

6) "Termos & privacidade" (grupo Legal) linka direto pro raiz-site —
   raizpatrimonio.com.br/termos-de-uso, SEM www (é o CNAME real, ver
   DEPLOY_RAIZ_PATRIMONIO.md §2); a própria página já linka Política
   de Privacidade e Termo de Beta no rodapé, não precisei duplicar.

7) "Licença & uso" ganhou selo do plano atual (Trial/Standard/Plus),
   lido de LICENCA_ATUAL.plano_codigo (já em memória) — sem fetch novo.

Validado: node --check no bloco JS extraído (limpo), balanceamento de
div/button/svg/section/span/a comparado linha a linha com o arquivo
ANTES desta edição — nenhum diff piorou (mesma lógica de "comparar
com o original, não com um ideal teórico" já registrada nas
Diretrizes Técnicas §3.9). Ainda SEM teste em navegador de verdade —
mesma ressalva do handoff anterior, prioridade #1 de quem testar.

VERSÃO ANTERIOR: Beta v1.88.0
LINHAS: 27394
DATA: 31/08/2026
NOVIDADES (Beta v1.88.0) — Consolidação da barra de baixo, seguindo a
proposta do protótipo (PROTOTIPO_MODULO_UNICO_RAIZ_v1_0.html), com uma
correção de leitura no caminho: no protótipo, "Distribuição" mora
dentro de RESULTADOS (não de Financeiro) — corrigido antes de codar.

Barra: 6 ícones agora (era 6 também, mas 2 trocaram de identidade) —
Visão Geral · Imóveis · Ativos · Financeiro · Contratos · Resultados.
Cobranças e Distrib. deixaram de ter ícone próprio; Contratos e
Relatórios (que só viviam no menu) ganharam. Diferença honesta do
protótipo: Imóveis continua separada de Ativos — a decisão de unificar
o formulário de criação ficou pra revisão final, deixei como estava.

Mecanismo usado — TAB_PARENT_MAP (já existia, não inventei nada novo):
tab-inadimplencia aponta pra tab-mensal, tab-socios aponta pra
tab-relatorios — o destaque do ícone certo continua acendendo mesmo
sem botão próprio. Dentro de cada tela, um segmento de 2 botões
(Recebimentos/Atrasados dentro de Financeiro; Resumo/Distribuição
dentro de Resultados) faz o vínculo visual — só chama switchTab() pro
outro id, NENHUM HTML das 4 telas foi movido ou mesclado. Risco baixo
de propósito: mexer na lógica interna de 4 telas financeiras
complexas sem poder testar em navegador seria imprudente.

Achado no caminho: "Financeiro" (tab-mensal) já tem conciliação de
extrato embutida — não existe "Saídas" como tela ainda (só o banco,
lancamentos, sem UI) — por isso o segmento tem 2 opções, não 3 como o
protótipo mostrava; UI de Saídas fica pra quando o backend tiver
consumidor de verdade.

Menu do bonequinho: "Contratos (todos)" e "Relatórios" saíram do grupo
"Cadastros e prestadores" (promovidos pra barra nesta mesma entrega —
nunca tirar de um lugar sem o substituto já existir junto).

VERSÃO ANTERIOR: Beta v1.87.0
LINHAS: 27324
DATA: 31/08/2026
NOVIDADES (Beta v1.87.0) — Primeiro passo da unificação de menus
(pedido explícito, inspirado na proposta do protótipo do módulo
único). Duas mudanças, só no menu do bonequinho ("Configurações"):
1) Removido o item "Cofre de Documentos" (abria cofre.html sem
   contexto) — redundante desde que a aba Ativos (v1.80.0) já embute
   o Cofre inteiro. A função abrirCofreDocumentos() em si NÃO foi
   tocada — continua usada em vários pontos do app pra abrir o Cofre
   COM contexto (ex.: botão "Documentos" num card de imóvel).
2) Menu reagrupado em 3 grupos (renomeados no lugar, sem mover botão
   nenhum — mais seguro que reordenar): "Cadastros e prestadores"
   (era "Imóveis": Contratos, Relatórios, Minutas, Síndicos,
   Administradoras, Manutencistas, Tipo de Imóvel/Empreendimento —
   Contratos/Relatórios continuam aqui até serem promovidos pra barra
   de baixo, trem futuro), "Empresa" (era 2ª metade de "Conta":
   Pessoas, Minha Empresa, Licença), "Conta" (cabeçalho novo, antes
   de Preferências/Suporte/Sobre). Nenhum grupo "Integrações"/
   "Desenvolvedor" foi inventado — nada existe ainda pra popular eles.
Barra de baixo NÃO foi tocada nesta entrega — consolidar Financeiro/
Cobranças/Distrib. e promover Contratos/Resultados é a próxima etapa,
maior e mais arriscada, fica pra trem dedicado.

VERSÃO ANTERIOR: Beta v1.84.1
LINHAS: 27291
DATA: 31/08/2026
NOVIDADES (Beta v1.84.1) — CORREÇÃO DE PROCESSO: a troca do insert
direto por fn_criar_ativo no ramo de criação de sincronizarImovelSupabase()
(linha ~9690) tinha sido feita na cópia de trabalho mas nunca chegou a
ser versionada nem recopiada pro arquivo entregue — a v1.84.0 que saiu
antes NÃO tinha essa troca, apesar do changelog dela mencionar. Corrigido
agora: dbAuth.rpc('fn_criar_ativo', {p_tipo_ativo:'imovel', p_dados:linha})
no lugar de dbAuth.from('imoveis').insert(linha) — só o ramo de criação,
update e divisão societária seguem intocados. Lição: depois de editar a
cópia de trabalho, sempre recopiar pro output antes de considerar uma
entrega "atual" — checagem de md5sum entre as duas cópias vira parte do
checklist de entrega a partir de agora.

VERSÃO ANTERIOR: Beta v1.84.0
LINHAS: 27265
DATA: 31/08/2026
NOVIDADES (Beta v1.84.0) — Trem v1.84, fatia 1 (módulo único, parte
front). Duas mudanças, nenhuma delas neste arquivo diretamente — o
próprio index.html não mudou além da versão:
1) js/ativos/ativos-boot.js corrige o achado do Nicola testando
   v1.80.0: o Cofre reaproveitado trazia cabeçalho e nav interna
   próprios, duplicando o que o App já mostra por fora. Cabeçalho
   escondido de vez (puro duplicado). Nav interna (Home/Triagem x
   Ativos, funcional dentro do Cofre) NÃO escondida — só reposicionada
   do rodapé fixo pro topo, como sub-aba compacta; os cliques
   continuam funcionando, nenhum cofre-*.js foi tocado.
2) fn_criar_ativo(cliente_id, tipo_ativo, nome_exibicao, dados jsonb)
   no banco — motor único de criação (imóvel → grava em imoveis, o
   trigger já existente espelha em cofre_ativos sozinho; qualquer
   outro tipo → grava direto em cofre_ativos). Testado com sessão
   real (imóvel + veículo, revertido depois). O formulário front que
   chama este RPC ainda não existe — só o motor; formulário fica pra
   próxima fatia do v1.84, junto com partes/partes_papeis nos fluxos
   reais e a ficha buscando os campos de imóvel que faltam.

VERSÃO ANTERIOR: Beta v1.80.0
LINHAS: 27210
DATA: 31/08/2026
NOVIDADES (Beta v1.80.0) — Primeira fatia de frontend do módulo único
(trem v1.80, ver DIAGNOSTICO_E_PLANO_MAJOR_RELEASE_RAIZ_v2_1.md e
DIRETRIZES_TECNICAS_IMPLEMENTACAO_RAIZ_v2_0.md). Nova aba "Ativos" na
barra inferior, AO LADO de Imóveis (aditivo — nada foi removido/
substituído; a decisão de aposentar Imóveis/cofre.html fica pra depois).
Reaproveita o Cofre inteiro (js/cofre-*.js, 7933 linhas) sem copiar nem
reescrever: o HTML de cofre.html (15 blocos de nível 0 — #app-cofre +
13 modais + #toast; #tela-bootstrap/#tela-erro-acesso ficaram de fora,
viram placeholder vazio) foi extraído pra js/ativos/ativos-markup.js
(arquivo novo, fora deste); js/ativos/ativos-boot.js injeta esse HTML
num container vazio (#ativos-mount-point, dentro da nova
<section id="tab-ativos">) e importa ./js/cofre-app.js dinamicamente
na primeira vez que a aba é aberta — mesmo padrão de import() sob
demanda já usado pelas abas de Configurações (Licença/Sobre/Pessoas/
Minha Empresa). Cobertura de ids conferida antes de extrair: dos 157
que js/cofre-*.js referencia, 148 vêm do HTML extraído e 9 são criados
em tempo de execução pelo próprio JS — nenhum ficou de fora. Ajuste
feito no processo (sem tocar nos arquivos do Cofre): nav.bootstrap()
escolhe a empresa pela ordem da lista da pessoa a menos que ache
?cliente_id= na URL — ativos-boot.js seta esse parâmetro (com o
CLIENTE_ID_SUPABASE já ativo no App) antes do import e restaura a URL
limpa logo depois (history.replaceState, sem reload, sem entrar no
histórico do navegador) — sem isso um usuário multi-empresa veria a
aba Ativos abrir na empresa errada. Zero colisão de id confirmada
entre os 157 do Cofre e os 496 já existentes neste arquivo antes desta
entrega. Nenhuma linha do Cofre foi colada aqui — só o wiring (1 botão
de nav, 1 <section> vazia, 1 chamada dentro de switchTab()) — é a
estratégia pedida explicitamente pelo Nicola pra não deixar este
arquivo crescer mais a cada área nova do módulo único.

VERSÃO ANTERIOR: Beta v1.76.0
LINHAS: 27181
DATA: 31/08/2026
NOVIDADES (Beta v1.76.0) — Trem v1.71 do roadmap "Major Release" (ver
DIAGNOSTICO_E_PLANO_MAJOR_RELEASE_RAIZ_v2_1.md), item P0 de segurança.
Achado real (não teórico): a tela pública de contratação (?contratar=
<token>) lia e gravava direto em processos_contratacao via dbAuth,
contando com a RLS pra filtrar por token — mas as policies
"anon_le_processo_pelo_token"/"anon_preenche_processo_pendente" nunca
checavam o token, só status+prazo. Qualquer chamada anônima à Data API
(fora do app) enxergava/alterava os 76 processos pendentes de qualquer
cliente, sem precisar do link. minutas_contrato também tinha SELECT
liberado pra anon sem nenhum uso real no front. Corrigido no banco
(RPCs fn_processo_publico_obter/fn_processo_publico_preencher,
SECURITY DEFINER, validam token+status+prazo dentro da função; anon
perdeu SELECT/UPDATE nas duas tabelas) e aqui no front (as duas telas
trocaram dbAuth.from(...) por dbAuth.rpc(...) — ver comentários em
iniciarModoContratacaoPublica). De quebra, fn_sou_master() deixou de
comparar a string 'master' e passou a ler uma tabela de parâmetro
(plataforma_operadores) — não muda nada visível, fecha a possibilidade
de um usuário 'master' de empresa cliente ganhar acesso de plataforma
no futuro. Detalhe técnico completo no documento de diretrizes desta
sessão.

VERSÃO ANTERIOR: Beta v1.75.1
LINHAS: 27162
DATA: 30/08/2026
NOVIDADES (Beta v1.75.1) — BUG REAL corrigido, achado investigando por
que "salvando contrato não gera Assinando" persistia mesmo após a
v1.75.0 (confirmei no banco: nenhum contrato novo, de fato, tinha sido
criado — não era confusão com dado antigo). Causa real: saveContrato()
tem 6 pontos de saída antecipada com alert() (CPF/CNPJ inválido, sem
imóvel selecionado, soma de rateio errada, vigência obrigatória, guarda
de duplo clique, exceção pega no catch) — nenhum deles nunca tinha
retornado `false` de verdade pro caller. salvarDadosNovoContratoPopup()
(o popup "Dados Novo Contrato") chamava saveContrato() sem checar
retorno nenhum — o alert() piscava e sumia, e o popup fechava do mesmo
jeito, parecendo sucesso, mesmo com ZERO gravação no banco (CPF de
teste que falha no dígito verificador é a causa mais provável — ex.:
"123.456.789-00"). Agora os 6 pontos retornam `false` explicitamente, e
o popup confere isso antes de prosseguir — se a validação barrar, o
popup continua aberto com o alerta visível, não fecha mais sozinho.

VERSÃO ANTERIOR: Beta v1.75.0
LINHAS: 27116
DATA: 30/08/2026
NOVIDADES (Beta v1.75.0) — 6 pedidos do Nicola, testando a v1.74.x:
  1) BUG CRÍTICO corrigido — GRANT esquecido na criação de
     contrato_fiadores (migration à parte, já aplicada): faltava
     GRANT SELECT/INSERT/UPDATE/DELETE pro papel `authenticated`. RLS
     só é avaliado DEPOIS do GRANT permitir a operação — sem ele, toda
     consulta falhava com "permission denied" (403), confirmado no
     console do navegador. A gravação (via RPC SECURITY DEFINER)
     provavelmente sempre funcionou — só a LEITURA (consulta direta)
     estava bloqueada, por isso "salva mas ao voltar não tem nada lá".
     2 fiadores já estavam salvos no banco, invisíveis, confirmando.
  2) Box "Documentos" da ficha do IMÓVEL (diferente do box "Documento"
     da ficha do CONTRATO, corrigido na v1.74.0) — ganhou data/hora +
     exclusão de verdade, mesmo padrão. TAMBÉM: parou de criar um chip
     "Contrato anterior" automático pra cada contrato Finalizado do
     imóvel — pedido explícito: "documentos de contrato só devem ser
     mostrados se o contrato estiver no contexto da tela". Consultar
     documento de contrato encerrado agora passa por "Outros
     Contratos" (ver item 3), que já mostra o contrato antes dos
     documentos dele.
  3) Box "Sem contrato em andamento" (quando não há contrato ativo mas
     há encerrado no histórico) ganhou o botão "Outros contratos" —
     reaproveita abrirOutrosContratosImovel(), já existia noutro
     contexto, só faltava oferecer aqui.
  4) statusAoEditarFinalidadeUso() — REFINADO: saindo de Uso Próprio/
     Temporada, antes ia sempre pra 'Vago'. Agora checa de verdade se
     existe contrato operacional pro imóvel — vai pra 'Alugado' se
     tiver, 'Vago' se não tiver.
  5) Contrato novo por "Dados Novo Contrato" nascia direto 'Ativo' —
     pedido explícito: agora nasce 'Assinando' (mesmo status que o
     formulário da Vitrine usa, e que gerarMinutaNoCofre() já exigia
     pra achar o contrato — isso destrava "Gerar Minuta" pra contrato
     cadastrado internamente, não só via Vitrine). Vira 'Ativo' depois
     via "Alterar Status", que já dispara a geração automática do item
     a receber (v1.74.0, item 3).
  6) Nome genérico "Minuta - {locatário}.docx" nos documentos —
     investigado: não bate com o padrão que gerarMinutaNoCofre() gera
     (contrato_{locatário}_{minuta}_{data}.docx) — são documentos de
     upload manual anterior à geração automática, não bug de código
     atual. Testar de novo com uma minuta gerada do zero depois desta
     entrega pra confirmar.

VERSÃO ANTERIOR: Beta v1.74.0
LINHAS: 26995
DATA: 30/08/2026
NOVIDADES (Beta v1.74.0) — 3 pedidos do Nicola, testando a v1.73.x:
  1) Box "Documento" da ficha do contrato — agora mostra data/hora de
     cada documento (criado_em do vínculo, não existia antes) e o
     botão de remover passou a EXCLUIR de verdade (Storage +
     cofre_documentos + vínculo), não só desvincular como antes —
     pedido explícito ("não está sendo possível excluir").
  2) Fiador "sumindo" ao voltar — BUG REAL (race condition) achado: um
     contrato novo nasce com id LOCAL temporário (tipo
     'con_1735689000123') até sincronizarContratoSupabase() (async,
     dentro de saveAll()) terminar e trocar pelo UUID real. Reabrir
     "Dados Novo Contrato"/"Editar" de fiadores rápido demais (antes
     dessa troca terminar) buscava fiadores com um id que a tabela não
     reconhece — falha silenciosa, parecia que "sumiu". Corrigido com
     aguardarIdRealDoContrato() — espera o id real resolver (até 5s)
     antes de buscar, em vez de falhar calado.
  3) NOVO: ao mudar o status de um contrato pra Ativo, se ele ainda não
     tem NENHUM item a receber gerado, gera automaticamente o da
     competência atual — só pra esse contrato (gerarMensalidades
     ParaCompetencia ganhou um 3º parâmetro opcional contratoIdFiltro,
     reaproveita a mesma trava anti-duplicidade que o botão manual do
     Financeiro já tinha).

VERSÃO ANTERIOR: Beta v1.73.2
LINHAS: 26867
DATA: 30/08/2026
NOVIDADES (Beta v1.73.2) — BUG REAL corrigido, achado pelo Nicola:
alterar o status de um contrato ("Ações → Alterar Status") já
atualizava imo.status corretamente (dado certo, gravado certo no
Supabase) — só faltava mandar a LISTA de imóveis se redesenhar com o
valor novo. Sem isso, o card na lista de Imóveis só mostrava o status
atualizado depois de um F5 manual. Adicionado o mesmo `if
(...tab-imoveis) renderImoveis()` que salvarDetalhesImovelPopup() já
usava, em salvarAlterarStatusContrato().

VERSÃO ANTERIOR: Beta v1.73.1
LINHAS: 26846
DATA: 30/08/2026
NOVIDADES (Beta v1.73.1) — 2 pedidos do Nicola, seguindo a v1.73.0:
  1) statusAoEditarFinalidadeUso() (NOVA) — editar o Uso de um imóvel
     já existente agora também acompanha o status, não só a criação
     (decisão explícita, revertendo a de 25/08). Só mexe quando a
     finalidade REALMENTE mudou: entrando em uso_proprio/temporada
     sempre vira o status correspondente; saindo delas volta pra Vago
     (nunca houve contrato rodando nesse meio tempo — bloqueado por
     iniciarProcessoContratacao); mudança entre 2 finalidades
     "normais" não mexe (evita resetar status de um imóvel já
     Ativo/Suspenso por causa de contrato real). Ligada nos 2 pontos
     de edição de Uso que existem (saveImovel — formulário principal;
     salvarDetalhesImovelPopup — popup "Detalhes do Imóvel").
  2) Vagas de garagem — proposta lida e decidida: NÃO cria campo novo,
     reaproveita o campo "Descrição" que já existe no popup "Detalhes
     do Imóvel" (mdi-descricao) e já está ligado ao placeholder
     imovel_descricao. Só ganhou rótulo/dica melhor (exemplo com vaga
     de garagem e numeração de salas) pra orientar o preenchimento.

VERSÃO ANTERIOR: Beta v1.73.0
LINHAS: 26794
DATA: 30/08/2026
NOVIDADES (Beta v1.73.0) — 4 correções pedidas pelo Nicola testando a
entrega de Fiadores/Minutas:
  1) BUG REAL GRAVE: abrirDadosNovoContratoPopup() só reconhecia
     contrato existente com status 'Assinando' — mas salvarDados
     NovoContratoPopup() define status='Ativo' direto pra contrato
     novo (nunca passa por 'Assinando' nesse fluxo). Reabrir "Dados
     Novo Contrato" depois de salvar não encontrava mais o contrato,
     mostrava tudo vazio de novo (fiador incluso) e, se salvo de novo,
     criava um CONTRATO DUPLICADO. Corrigido usando
     obterContratoPrincipalDoImovel() (já existente, mesmo critério
     usado no resto do sistema) em vez do filtro estreito por status.
  2) "Gerar Minuta" (ficha do contrato) nunca oferecia escolha mesmo
     havendo mais de uma minuta aplicável — delegava direto sem checar.
     Agora usa listarMinutasAplicaveis() e abre o mesmo picker de
     "Conferir minuta padrão" quando há mais de uma opção.
  3) Os 2 pickers (Gerar Minuta / Conferir minuta padrão) misturavam
     as ações "ver" e "gerar" na mesma tela. Agora
     abrirPickerMinutasAplicaveis() recebe um `modo` — Gerar Minuta só
     oferece "gerar" por opção, Conferir minuta padrão só oferece "ver".
  4) extrairTextoPdfMinutizacao() — BUG REAL de formatação achado num
     contrato real (palavras saindo partidas: "c asado", "9 15", "s
     eja"). Juntava fragmentos de texto do PDF sempre com espaço; agora
     só insere espaço quando há um vão de verdade entre fragmentos
     (kerning da fonte original partia uma mesma palavra em vários
     fragmentos sem espaço real entre eles).
Também: PLACEHOLDERS_OFICIAIS e o prompt de minuta-detectar-
placeholders (Edge Function) corrigidos — locador removido da lista
(fica sempre fixo) e fiador_1_*/fiador_2_* adicionados (existiam no
app, nunca tinham sincronizado com o que a IA tem permissão de
sugerir) — ver changelog completo naquele arquivo.

VERSÃO ANTERIOR: Beta v1.72.1
LINHAS: 26697
DATA: 30/08/2026
NOVIDADES (Beta v1.72.1) — MERGE com sessão paralela do mesmo dia
(v1.71.1, partiu da mesma base v1.71.0 que a v1.72.0 abaixo): bug real
achado pelo Nicola em produção — quem é master em várias empresas
(mesmo user_id, várias linhas em pessoas) via cada termo legal
pendente duplicado 1x por empresa na mesma tela ("Política de
Privacidade" 10x no modal). fn_minhas_comunicacoes_opt_out e
fn_definir_opt_out_comunicacao agora exigem p_cliente_id explícito no
banco (já aplicado, confirmado via MCP antes de mesclar) — as 2
chamadas deste arquivo passam CLIENTE_ID_SUPABASE agora. Sem isso, a
1ª chamada quebraria (a RPC só existe com o parâmetro agora) e a 2ª
usaria uma versão antiga ainda com o bug. PENDÊNCIA: o resto desta
correção mora em comunicacoes-api.js v1.46 e comunicacoes-app.js
v1.47 (sessão paralela) — não fazem parte deste merge, preciso
receber os 2 arquivos separadamente antes de publicar tudo junto.

VERSÃO: Beta v1.72.0
LINHAS: 26679
DATA: 30/08/2026
NOVIDADES (Beta v1.72.0) — Fiadores de contrato, pedido explícito do
Nicola (proposta lida e aprovada antes de implementar): tabela nova
contrato_fiadores (0/1/2+ por contrato, ver migration
contrato_fiadores.sql), cadastrada pela tela do App e usada como fonte
de dado pra Minuta.
  - Cadastro: seção nova dentro do popup "Dados Novo Contrato"
    (abrirDadosNovoContratoPopup) — nome, CPF, RG, profissão, estado
    civil, regime de bens, cônjuge (obrigatório assinar se casado(a)
    fora de separação total/obrigatória — Art. 1.647 CC), contato,
    endereço, garantia patrimonial (matrícula de imóvel) opcional.
    Salvo via substituir_fiadores_contrato() (RPC nova, mesmo padrão
    delete+insert de substituir_divisao_repasse_contrato), disparado
    de dentro de sincronizarContratoSupabase() — trava de segurança
    nova (fiadoresContratoAtualPertenceAoId) evita que uma sobra de
    fiadoresContratoAtual de um popup aberto antes seja gravada em
    cima do contrato errado.
  - Edição fora do fluxo de criação: abrirEdicaoFiadoresPopup() (NOVA)
    — abrirDadosNovoContratoPopup só reconhece contrato 'Assinando';
    este popup focado funciona em qualquer status, chamado direto do
    botão "Editar" na seção de Fiadores da ficha do contrato.
  - Exibição: ficha do contrato (abrirFichaContrato, agora async) ganha
    seção "Fiadores" — nome, documento, estado civil, e se há imóvel
    em garantia.
  - Minuta: montarValoresPlaceholdersMinuta() ganha 3º parâmetro
    fiadores — placeholders fiador_1_* a fiador_4_* (nome/cpf/rg/
    profissão/estado civil/regime de bens/cônjuge/garantia
    patrimonial) + fiadores_qtd. Fiador inexistente fica com string
    vazia — o mecanismo JÁ EXISTENTE de checagem em preencherMinutaDocx
    (placeholdersVaziosDetectados) descobre sozinho se a minuta
    escolhida precisa de fiador e ele não foi cadastrado; nenhuma
    lógica de validação nova foi criada, só o dicionário foi ampliado.
  - Escolha de minuta: listarMinutasAplicaveis() (NOVA) — diferente de
    encontrarMinutaParaImovel() (resolve UMA só, a mais específica,
    usada pelo atalho "Gerar Minuta"), devolve TODAS as minutas ativas
    aplicáveis ao imóvel. baixarMinutaPadraoImovel() ("Conferir minuta
    padrão") abre um picker quando há mais de uma — cada opção pode
    "Ver modelo em branco" ou "Usar esta e gerar" (segue o mesmo fluxo
    de validação de gerarMinutaNoCofre, agora com 2º parâmetro opcional
    minutaIdEscolhida). Com só 1 aplicável, comportamento idêntico a
    antes (abre direto, sem picker).
  - BUG REAL corrigido de quebra (achado nesta sessão, não introduzido
    agora): sincronizarContratoSupabase() nunca gravava
    locatario_endereco_atual/_profissao/_estado_civil no Supabase —
    ficavam só na memória local da sessão, se perdiam a cada reload.
    Usado por montarValoresPlaceholdersMinuta(); sem isso, o
    placeholder do locatário na minuta ficava vazio depois do primeiro
    reload mesmo tendo sido preenchido uma vez.

VERSÃO ANTERIOR: Beta v1.71.0
LINHAS: 26171
DATA: 30/08/2026
NOVIDADES (Beta v1.71.0) — reescrita completa da frente de aceite de
termos, pedido explícito do Nicola após revisão de arquitetura: Termos
de Uso/Política de Privacidade/Termo de Beta deixaram de ser um sistema
à parte (js/comunicacoes/consentimento-*.js, RPCs fn_termos_pendentes/
fn_registrar_consentimento) e migraram DE VERDADE pro motor de
comunicações — cada um é uma comunicacao real (dispensavel=false,
prioridade 1000/999/998, 1ª/2ª/3ª msg do plano Onboarding). Dispatch
pós-login voltou a chamar 'raiz:comunicacoes:processar' direto (sem o
wrapper 'raiz:termos:verificar' da v1.70.0) — comunicacoes-app.js
reconhece dispensavel=false sozinho e chama renderizarAceite()
(comunicacoes-ui.js v1.45.0), um modal sem botão de fechar, igual ao
antigo só que dentro do mesmo motor que onboarding/NPS/upsell — e
encadeia automaticamente pro próximo pendente (Termos → Política →
Beta) sem precisar de lógica extra aqui.

js/comunicacoes/consentimento-{api,ui,app}.js ficam OBSOLETOS — não são
mais carregados por este arquivo (tag <script> removida). Não foram
apagados do repositório automaticamente; remover na próxima limpeza.

Menu ⚙️ Configurações → grupo Conta: "Comunicações comerciais" (toggle
único) virou "Preferências de comunicação" (lista, 1 toggle por
mensagem que permite opt-out — fn_minhas_comunicacoes_opt_out/
fn_definir_opt_out_comunicacao) — pedido explícito do Nicola pra não
ficar só 1 liga/desliga geral.

VERSÃO ANTERIOR: Beta v1.70.1
LINHAS: 26138
DATA: 30/08/2026
NOVIDADES (Beta v1.70.1) — toggle "Comunicações comerciais" no menu ⚙️
Configurações → grupo Conta, entre Licença e Suporte (RPCs já existiam
no banco desde a entrega anterior, só faltava o botão). Não fecha o
menu ao clicar — carrega o estado atual toda vez que o menu abre
(carregarStatusComunicacaoComercial, chamada de dentro de
abrirMenuConta) e alterna via fn_definir_opt_out_comunicacao_comercial.
Só afeta onboarding/adoção/upsell/NPS via WhatsApp — nunca os avisos
operacionais do próprio contrato (vencimento, atraso), que são
pessoa_preferencias_comunicacao, sistema separado.

VERSÃO ANTERIOR: Beta v1.70.0
LINHAS: 26057
DATA: 30/08/2026
NOVIDADES (Beta v1.70.0) — Aceite de Termos de Uso/Política de
Privacidade/Termo de Beta (LGPD), pedido explícito do Nicola: "evoluir
com tudo" na frente de conformidade legal. 3 módulos novos em
js/comunicacoes/ (consentimento-api.js, consentimento-ui.js,
consentimento-app.js), espelhando o mesmo padrão de
comunicacoes-api.js/ui.js/app.js já existente — nenhuma lógica de
decisão no front-end, tudo resolvido pela RPC nova fn_termos_pendentes
(considera ambiente_teste do cliente pra saber se também exige o Termo
de Beta).

No fluxo pós-login, o dispatch de 'raiz:comunicacoes:processar' virou
'raiz:termos:verificar' — o novo módulo só repassa pra Central de
Comunicações depois de resolver o aceite (nada pendente, ou pendente e
confirmado), pra nunca competir com o modal de onboarding/NPS.
comunicacoes-app.js não foi tocado.

Modal SEM botão de fechar/sem clique-fora-fecha — bloqueante de
propósito (mesma exceção documentada no DS §9 pro Tipo A): a pessoa não
pode continuar usando o app sem aceitar os termos vigentes.

Pendente pra próxima entrega: trocar os links placeholder de
LINKS_TERMOS (consentimento-app.js) pelas URLs públicas reais assim que
os 3 documentos forem publicados; toggle "Comunicações comerciais" no
menu ⚙️ Configurações (RPC fn_definir_opt_out_comunicacao_comercial já
existe no banco, só falta o botão).

VERSÃO ANTERIOR: Beta v1.69.1
LINHAS: 26047
DATA: 29/08/2026
NOVIDADES (Beta v1.69.1) — pedido explícito do Nicola: app e bot
precisam decidir "qual comunicação mostrar agora" chamando a MESMA
função no banco (não duplicar lógica) — ver migrations da sessão de
Planos de Comunicação (fn_comunicacao_proxima_app/_servico).

js/comunicacoes/comunicacoes-app.js e comunicacoes-api.js (módulos
compartilhados, não vivem neste arquivo) trocaram a seleção local
(selecionarComunicacao()/comunicacoes-regras.js) por uma chamada a
fn_comunicacao_proxima_app — ver changelog completo nesses 2
arquivos. Aqui em index.html, só 1 mudança pontual: onAcaoFinal
ganhou um branch defensivo pra 'abrir_formulario_ativo' (a variante
"ativo" do onboarding pertence ao Cofre, que agora também dispara
este mesmo evento — ver cofre-navegacao.js v1.3.0) — não deveria
disparar aqui, mas não pode travar silenciosamente se disparar.

VERSÃO ANTERIOR: Beta v1.69.0
LINHAS: 26023
DATA: 29/08/2026
NOVIDADES (Beta v1.69.0) — Parte 3 da especificação de Minutas: "gerar
minuta a partir de um contrato real" (pedido original do Nicola,
respondido "achei que estava entregue já" quando viu que não estava —
esta versão entrega de verdade). Novo botão "Gerar de um contrato real"
(ícone varinha) em Configurações → Minutas de Contrato, ao lado do "+"
de sempre. Fluxo em 2 passos:

1) Sobe um contrato real já assinado (.docx ou .pdf) + nome/escopo da
   minuta. O texto é extraído inteiramente no navegador (JSZip pro
   .docx, pdf.js — biblioteca nova, CDN adicionado — pro .pdf) e
   enviado pra uma Edge Function nova (minuta-detectar-placeholders,
   já em produção) que chama Claude (Haiku, escalando pra Sonnet se
   vier vazio) pra identificar quais trechos são dados variáveis
   (nome, CPF, valores, datas) e sugerir qual dos 23 placeholders
   oficiais cada um deveria virar.

2) Tela de conferência OBRIGATÓRIA (nunca aplica sozinho — decisão de
   LGPD, documentada em ESPECIFICACAO_MINUTA_V2_PARIDADE_E_GERACAO_
   AUTOMATICA.md Parte 3.2): cada trecho encontrado aparece com um
   dropdown pré-marcado na sugestão da IA, livre pra trocar ou
   desmarcar ("não substituir"). Só depois de confirmar é que gera o
   arquivo de verdade.

O resultado é sempre um .docx NOVO, gerado do zero direto no
navegador (estrutura OOXML mínima construída via JSZip, sem depender
de nenhuma biblioteca de servidor) — tanto pra quem subiu .pdf quanto
pra quem subiu .docx. Decisão consciente, confirmada com o Nicola
antes de construir: não tenta preservar a formatação visual exata do
arquivo original (fonte, negrito, numeração de cláusula) — vira um
modelo limpo com formatação padrão do sistema. Quem precisar de
fidelidade visual exata continua tendo a opção manual de sempre
(upload direto de um .docx já com os {{placeholders}} escritos à
mão). Nome do arquivo final segue a mesma convenção já usada no
cadastro manual (minuta_{slug}_v1_{data}.docx) — e o contrato real
enviado nunca é gravado em lugar nenhum, só passa pela memória do
navegador e pela chamada de IA (que também não persiste o texto).

VERSÃO ANTERIOR: Beta v1.68.0
LINHAS: 25524
DATA: 29/08/2026
NOVIDADES (Beta v1.68.0) — pedido explícito do Nicola: "não estou
conseguindo anexar PDF para subir um contrato no cadastro de minutas
padrão". Causa raiz: o `<input accept=".docx">` do formulário de
cadastro de minuta bloqueava PDF de aparecer como selecionável no
seletor de arquivo do celular — não era bug de lógica, era o próprio
navegador filtrando a escolha antes de qualquer validação rodar.
Corrigido: `accept=".docx,.pdf"` (PDF agora é selecionável), e ao
escolher um PDF a mensagem agora deixa claro que a conversão
automática de PDF (gerar minuta a partir de um contrato real — Parte
3 da especificação combinada) ainda não foi construída, só
especificada — orienta a converter pra .docx por enquanto. Texto de
instrução da própria tela também atualizado, pra não sugerir uma
capacidade que ainda não existe.

VERSÃO ANTERIOR: Beta v1.67.0
LINHAS: 25491
DATA: 29/08/2026
NOVIDADES (Beta v1.67.0) — auditoria de paridade de Minutas pedida pelo
Nicola (App × bot-menu × bot-voz), 4 bugs reais confirmados e
corrigidos:
1) "Gerar Minuta" da Ficha do Contrato (gerarMinutaContrato) gravava o
   anexo em `contratos.anexos`, coluna que não existe mais desde a
   migração do sistema de documentos pro Cofre — o `.update()` nunca
   checava erro, então o botão subia o arquivo, mostrava toast de
   sucesso, mas o vínculo nunca era salvo (documento ficava órfão no
   Storage, nunca aparecia em lugar nenhum, nem no próprio box
   "Documento" da ficha). Corrigido eliminando a duplicação:
   gerarMinutaContrato() agora só resolve o imóvel e delega inteiramente
   pra gerarMinutaNoCofre() (já correta, usada pelo menu "Locação") —
   um único caminho de geração, não dois que podem divergir de novo.
2) Nome de arquivo de minuta (cadastro e geração) não era intuitivo e
   tinha 2 bugs de higienização confirmados nos dados reais: sufixo de
   download duplicado do navegador (" (1)") virava parte do nome salvo,
   e reenviar um arquivo (fluxo normal de edição — baixar, editar no
   Word, reenviar) empilhava um novo timestamp em cima do antigo em vez
   de substituir. Corrigido: nome agora vem sempre do campo "Nome da
   minuta" (nunca do File.name bruto), com versão que sobe a cada
   reenvio — minuta_{slug}_v{n}_{data}.docx pro modelo,
   contrato_{locatário}_{slug-da-minuta}_{data}.docx pro contrato
   gerado (referencia de qual modelo veio, o que não existia antes).
3) excluirMinuta() só apagava a linha da tabela, nunca o arquivo no
   Storage — todo modelo excluído ficava órfão no bucket. Corrigido
   (extrai o caminho real da signed URL, remove antes/junto da linha).
4) Lista de minutas cadastradas não tinha atalho pra "ver e conferir" o
   modelo — só editar/excluir. Adicionado botão "Ver" (abre o arquivo
   direto), pedido explícito.
Migration aplicada separadamente (arquivo_versao em minutas_contrato +
catálogo de funcionalidades). Bot (whatsapp-webhook) corrigido à parte
nesta mesma auditoria — ver changelog de _shared.ts.

VERSÃO ANTERIOR: Beta v1.66.11
LINHAS: 25451
DATA: 28/08/2026
NOVIDADES (Beta v1.66.11) — pedido explícito do Nicola: popup "Detalhes
do Imóvel" (Mais ações → Detalhes) não deixava editar "Uso do imóvel"
(finalidadeUso — já existia no cadastro completo e no card da lista,
só faltava neste popup) nem "Tamanho (m²)" (idem, já existia só no
cadastro completo). Adicionados os 2 campos, mesmas opções/rótulos do
formulário principal. Refresh ao salvar já era feito por
salvarDetalhesImovelPopup() pra ficha (se aberta) e lista de Imóveis
(se aba ativa) — nenhum campo novo precisou de lógica de refresh
separada, os 2 usam o mesmo salvamento/recarregamento de sempre.

VERSÃO: Beta v1.66.10
LINHAS: 25422
DATA: 28/08/2026
NOVIDADES (Beta v1.66.10) — BUG REAL relacionado ao equivalente já
corrigido no bot na mesma rodada: nomesIguaisSocio() usava igualdade
pura (===), o que perderia um match legítimo confirmado contra o banco
real (sócio da Rumo cadastrado como "Luciana Maia Silva", mas extrato
mostra nome legal completo "...DE ARAUJO BRANDAO"). Trocado pra
continência (substring) — continua rejeitando corretamente sócios com
sobrenome de família em comum ("Renato Maia Silva" x "Claudia Beatriz
Maia Silva"), mas passa a reconhecer nome cadastrado mais curto dentro
do nome legal completo do extrato.

VERSÃO: Beta v1.66.9
LINHAS: 25391
DATA: 28/08/2026
NOVIDADES (Beta v1.66.9) — mesmo bug de performance do saveAll (v1.66.7,
corrigido nos botões pontuais de pendência) agora também corrigido na
IMPORTAÇÃO DE EXTRATO EM LOTE (conciliarTransacoes):

  - CAUSA: ao final da importação, `await saveAll(true, null)` (sem
    `rotas`) sincronizava as 9 rotas inteiras — imóveis, contratos,
    administradoras, síndicos, manutencistas e minutas incluídos, mesmo
    essa função nunca tocando em nenhum deles. E dentro de mensalidades/
    pendenciasExtrato, ressincronizava a carteira inteira, não só o que
    mudou nesta importação.

  - RESOLVIDO: gerarMensalidadesParaCompetencia() ganhou parâmetro
    opcional pra devolver os IDs das mensalidades novas geradas
    (retrocompatível — chamador que não passar nada continua igual).
    conciliarTransacoes() rastreia toda mensalidade tocada (gerada ou
    conciliada) e toda pendência tocada (criada ou resolvida) durante o
    loop, e a chamada final vira `saveAll(true, null, rotasTocadas, {
    mensalidades, pendenciasExtrato })` — só sincroniza as rotas que
    realmente tiveram alguma mudança nesta rodada, e dentro delas, só os
    IDs específicos tocados.

VERSÃO: Beta v1.66.8
LINHAS: 25324
DATA: 28/08/2026
NOVIDADES (Beta v1.66.8) — BUG REAL GRAVE: PDF de extrato falhando com
"Edge function returned a non-2xx status code" mesmo depois do fix de
CORS de ontem (achado pelo Nicola testando de novo):

  - CAUSA RAIZ (confirmada via logs reais da Edge Function, não só
    suposição): o preflight OPTIONS já passava com 200 — o CORS
    estava certo. O POST de verdade voltava 403. Dentro da function,
    a resolução de pessoa (`.eq('user_id', ...).maybeSingle()`) FALHA
    — erro de verdade, não "pega a primeira" — quando o usuário logado
    tem mais de uma linha em `pessoas` pro mesmo user_id. Exatamente
    o caso do Nicola: master de 10 empresas diferentes, 10 linhas em
    `pessoas`, mesmo user_id. Um usuário de empresa única nunca
    bateria nisso — só apareceria testando como master multi-empresa.

  - RESOLVIDO: a chamada à Edge Function `extrato-extrair-transacoes`
    agora manda `cliente_id: CLIENTE_ID_SUPABASE` (a empresa ATIVA no
    app) junto no corpo da requisição — a function usa isso pra
    desambiguar entre as empresas do usuário (nunca abre acesso novo,
    só resolve qual das empresas que já são dele é a certa). Já
    corrigido e publicado do lado da Edge Function também (deploy
    direto, sem precisar do script local).

VERSÃO: Beta v1.66.7
LINHAS: 25299
DATA: 28/08/2026
NOVIDADES (Beta v1.66.7) — BUG REAL: SALVAMENTO LENTO AO CONCILIAR 1
ITEM (achado pelo Nicola testando conciliação manual):

  - CAUSA: saveAll() já sabia limitar quais TABELAS sincronizar (`rotas`
    — otimização anterior, ver comentário histórico logo acima na
    função), mas dentro de cada tabela incluída ainda ressincronizava
    a LISTA INTEIRA (sincronizarListaComResiliencia — um await
    sequencial por item), mesmo quando só 1 registro mudou. Vincular 1
    pendência tocava 1 mensalidade + 1 pendência, mas sincronizava
    TODAS as mensalidades da carteira (centenas, numa empresa
    estabelecida) uma de cada vez.

  - RESOLVIDO: saveAll() ganhou parâmetro opcional `itensAlterados`
    (`{ mensalidades: [ids], pendenciasExtrato: [ids] }`) — quando
    passado, sincroniza SÓ esses IDs específicos em vez da lista
    inteira. 100% retrocompatível: chamador que não passar continua
    com o comportamento antigo (nenhum dos outros pontos de saveAll()
    no arquivo precisou mudar). Aplicado nos 3 botões de ação pontual
    de pendência: vincularPendenciaExtrato, confirmarPendenciaDupla,
    descartarPendenciaExtrato.

  - PENDENTE, NÃO CORRIGIDO NESTA ENTREGA: a importação de extrato em
    LOTE (conciliarTransacoes → saveAll(true, null), sem `rotas` nem
    `itensAlterados`) tem o mesmo problema, na verdade pior — sincroniza
    as 9 rotas inteiras, não só mensalidades/pendências. Não apliquei
    a mesma otimização ali nesta entrega porque exige rastrear também
    as mensalidades NOVAS geradas na hora por
    gerarMensalidadesParaCompetencia() (que ainda não têm sync
    nenhum) — arriscar isso sem poder testar contra dado real
    poderia deixar mensalidade nova sem persistir. Fica pra próxima
    entrega, com mais cuidado.

VERSÃO: Beta v1.66.6
LINHAS: 25233
DATA: 28/08/2026
NOVIDADES (Beta v1.66.6) — MERGE: DEDUP DE PENDÊNCIA + FIX
MENSAL.BAIXAR + v1.66.4 (BOX FOTO MOVIDO + DOCUMENTOS NO IMÓVEL)

NOTA DE VERSIONAMENTO: mesma situação da v1.66.3 — esta entrega e a
v1.66.4 abaixo nasceram em paralelo a partir da v1.66.3 (sessões
diferentes), e as duas ficaram "v1.66.4" de forma independente. Áreas
de código sem sobreposição (conciliação de extrato de um lado, Ficha
do Imóvel do outro). Esta v1.66.6 é o merge: peguei o arquivo com o
fix do box Foto + Documentos no Imóvel como base e reapliquei por
cima o trabalho de conciliação — nenhum dos dois lados perdeu nada.

  - BUG REAL — reimportar o mesmo extrato duplicava pendência
    'nao_identificado' (sem contrato achado): o ramo específico de
    conciliarTransacoes() sem contrato identificado nunca checava
    chavesJaPendentes antes de empurrar uma pendência nova. Corrigido
    (checagem local) + proteção definitiva no banco (índice único
    parcial (cliente_id, chave) WHERE status='Pendente' em
    pendencias_extrato, migration pendencias_extrato_chave_dedup_v2).
    sincronizarPendenciaExtratoSupabase() agora grava `chave` e trata
    conflito de índice único (23505) adotando o id existente em vez
    de derrubar o saveAll().

  - BUG REAL — 'mensal.baixa' (usado em registrarLog(), 2 pontos)
    não batia com o código real do catálogo (`mensal.baixar` — 1
    letra de diferença), nunca resolvia pra um nome na aba Saúde do
    módulo de Gestão. Corrigido nos 2 pontos + comentários.

VERSÃO: Beta v1.66.4
LINHAS: 25174
DATA: 27/08/2026
NOVIDADES (Beta v1.66.4) — BOX FOTO MOVIDO + DOCUMENTOS NO IMÓVEL
(pedido explícito):

  1) Box "Foto" da Ficha do Imóvel movido pra depois do box
     "Financeiro" (antes ficava logo no cabeçalho) — agora entra na
     mesma concatenação de renderFichaImovelUnica(), herdando o
     espaçamento padrão (space-y-3) do container automaticamente,
     sem margem própria adicionada.
  2) Nova pill "Documentos" no Mais ações de "Dados do imóvel" —
     faltava por completo, não tinha como abrir a tela de cadastro
     de documento direto do imóvel. Reaproveita abrirCofreDocumentos,
     mesma função já usada pelo Contrato.

  - Arquivos alterados: index.html (renderFichaImovelUnica +
    abrirFichaImovel).

VERSÃO: Beta v1.66.3
LINHAS: 25159
DATA: 27/08/2026
NOVIDADES (Beta v1.66.3) — MERGE: CONCILIAÇÃO (PDF/FOTO VIA IA + MOTOR
ÚNICO COM O BOT) + v1.66.2 (LIGHTBOX + DOCUMENTO NO CONTRATO)

NOTA DE VERSIONAMENTO: esta entrega e a v1.66.2 abaixo nasceram em
paralelo, cada uma a partir da mesma v1.66.1 (conversas/sessões
diferentes), e as duas ficaram rotuladas "v1.66.2" de forma
independente — colisão de número de versão, não colisão de conteúdo
(áreas do código completamente diferentes: conciliação de extrato de
um lado, lightbox de fotos + documento do contrato do outro). Esta
v1.66.3 é o merge dos dois: todo o trabalho de conciliação abaixo foi
reaplicado sobre o arquivo que já tinha o fix do lightbox + documento
do contrato — nenhum dos dois lados perdeu nada.

  - PROBLEMA 1: `<input accept=".xlsx,.xls">` na tela de Conciliação não
    deixava nem escolher um PDF no seletor de arquivo do celular —
    parecia que o botão "não levava pro app" depois de clicar no
    arquivo. Causa raiz: o app só sabia ler extrato em `.xlsx` (SheetJS,
    formato detalhado do Itaú), nunca teve caminho de leitura de PDF.

  - RESOLVIDO 1: `accept` ganhou `.pdf,.jpg,.jpeg,.png`.
    processarExtratoImportado() agora roteia por tipo de arquivo:
    xlsx/xls continua 100% local (SheetJS, sem IA — decisão do Nicola,
    já sabemos que é extrato pelo botão clicado, não precisa gastar IA
    em classificação de intenção). PDF/foto vai para a nova função
    processarExtratoViaIA(), que chama a Edge Function nova
    `extrato-extrair-transacoes` — mesma extração por IA
    (extrairTransacoesExtratoIA, Claude Sonnet 5) que o bot já usa
    desde a v2.23, agora em módulo compartilhado
    (_shared_extrato/extracao.ts) em vez de duplicada.

  - PROBLEMA 2: conciliarTransacoes() (app) e conciliarRecebimento()
    (bot) eram duas reimplementações paralelas da mesma decisão —
    causa raiz confirmada de 26 falsos-positivos achados na Rumo em
    27/08/2026 (a conciliação um a um do bot sugeria itens que já
    estavam conciliados no app — ex.: Geneticenter/julho, com chave
    de dedup NULL por ter sido reconciliado manualmente; HWN/julho,
    com chave gravada diferente da chave da nova transação, mesma
    transação real).

  - RESOLVIDO 2: bloco de crédito de conciliarTransacoes() virou
    assíncrono (forEach → for...of) e agora chama a MESMA RPC
    compartilhada que o bot usa — fn_classificar_pagamento_contrato()
    (Postgres, migration conciliacao_rpc_compartilhada_v1, 27/08/2026)
    — em vez da busca local de matchUnico/soma-de-2/criação
    incondicional de pendência. Motor único dos dois lados agora,
    não mais duas implementações que podem divergir silenciosamente.
    Resumo final da importação ganhou nova linha "♻️ N transação(ões)
    já estava(m) conciliada(s) antes" pra dar visibilidade a esse
    cenário.

  - Arquivos novos no repo de Edge Functions (não fazem parte deste
    repo): `_shared_extrato/extracao.ts`,
    `extrato-extrair-transacoes/index.ts`. Ver HANDOFF da entrega.

VERSÃO: Beta v1.66.2
LINHAS: 24965
DATA: 27/08/2026
NOVIDADES (Beta v1.66.2) — BUG FIX LIGHTBOX DE FOTOS + ADICIONAR
DOCUMENTO NO CONTRATO (pedido explícito):

  1) BUG FIX — clicar na foto do Imóvel não abria o carrossel
  - CAUSA: `JSON.stringify(__fotosImovelUrlsCache)` embutido direto
    dentro do atributo `onclick="..."` — o JSON gerado usa aspas
    duplas nas strings, colidindo com as aspas duplas do próprio
    atributo `onclick=""` e quebrando o HTML. Corrigido pra
    referenciar a variável global já existente
    (`__fotosImovelUrlsCache`) direto no onclick, sem reserializar.

  2) NOVO — "Adicionar documento" no Contrato, reaproveitando o
     fluxo completo (Com IA/Upload simples)
  - Nova pill "Adicionar documento" no Mais ações de "Dados do
    contrato" — chama `abrirCofreDocumentos('contrato', id)`, o
    MESMO mecanismo que já existia (usado por Imóvel/Fotos/etc.),
    que já dispara o evento `cofre:upload-contextual` no Cofre e
    abre `abrirUploadContextual()` — o formulário rico (Com IA/
    Upload simples) que o Item de Controle já usa. "Usar as mesmas
    funções", pedido explícito.
  - O "Carregar novo" dentro do box "Documento" (entregue na sessão
    anterior) trocou do upload bespoke próprio (sem IA) pra chamar
    a mesma `abrirCofreDocumentos()` — consistência total, um único
    caminho de upload pro Contrato em vez de dois diferentes.
  - `carregarNovoDocumentoContrato()` (upload bespoke antigo) ficou
    órfã — mantida no código, não apagada, nenhum botão aponta mais
    pra ela.

  - Arquivos alterados: index.html (box de Foto do Imóvel + Mais
    ações/box Documento do Contrato).

VERSÃO: Beta v1.66.1
LINHAS: 24927
DATA: 27/08/2026
NOVIDADES (Beta v1.66.1) — CABEÇALHO VOLTA A USAR O TOKEN --pine-deep
(pedido explícito, reverte a decisão da v1.21.1 do Cofre que tinha
ido no sentido contrário):

  - `<header id="main-header">`: `bg-emerald-900` (hardcoded) →
    `style="background:var(--pine-deep)"`. Mesmo valor de cor
    (--pine-deep já era #152a24, muito próximo de emerald-900 —
    #064e3b — mas não idêntico), agora via token do Design System
    em vez de classe Tailwind fixa. Aplicado em paralelo no Cofre
    (cofre.html v1.21.2) — os dois cabeçalhos continuam idênticos
    entre si, só a fonte da cor mudou de "classe hardcoded" pra
    "token compartilhado".
  - `js/comum-sobre.js` v1.1.1 (arquivo compartilhado, recebido
    nesta sessão pela primeira vez): botão "Enviar" (feedback)
    alinhado ao padrão de ação principal (var(--pine)), antes
    destoava dos 2 botões vizinhos (WhatsApp/E-mail) com
    bg-slate-700.

  - Arquivos alterados: index.html (1 linha, header).

VERSÃO: Beta v1.66.0
LINHAS: 24904
DATA: 26/08/2026
NOVIDADES (Beta v1.66.0) — DOCUMENTO NO CONTRATO + FOTO NO IMÓVEL
(GRAVADA NO COFRE) (pedido explícito):

  1) NOVO box "Documento" na Ficha do Contrato — só aparece quando o
     contrato está "Ativo" ou "Assinando". Mesma referência do box
     de Documento já usado no item de controle do Cofre: linha
     clicável abre via signed URL, "x" remove só o vínculo
     (documento continua guardado, vira "Em triagem" no Cofre),
     "Carregar novo" no Mais ações — upload direto pro Cofre
     (cofre_documentos + cofre_documento_vinculos entidade_tipo=
     'contrato'), mesmo padrão de storage já usado em
     gerarMinutaNoCofre(). Novas funções: montarDocumentosContrato(),
     abrirDocumentoContratoAtual(), removerDocumentoContratoAtual(),
     carregarNovoDocumentoContrato(), alternarMaisAcoesDocContrato().

  2) NOVO box "Foto" na Ficha do Imóvel — só aparece quando há foto
     cadastrada, mesmos controles do box de Foto do Ativo no Cofre
     (miniatura real via signed URL, lightbox com navegação —
     reaproveita abrirLightboxGeral/fecharLightboxGeral já
     existentes —, remover, "Adicionar fotos" no Mais ações).
     Pill "Fotos" também no Mais ações de "Dados do imóvel"
     (bootstrap da 1ª foto, mesmo princípio já usado no Cofre).
  - Pedido explícito: "as fotos devem ser gravadas no módulo cofre"
    — usa cofre_ativo_fotos (MESMA tabela do Ativo), não o
    mecanismo próprio antigo (imo.fotos, array de base64 direto no
    registro do imóvel — esse continua existindo, intocado, só não
    é mais o destino de fotos NOVAS enviadas por este box).
  - cofre_ativo_fotos é ativo_id-scoped (sem entidade_tipo/
    entidade_id genérico) — nova buscarOuCriarAtivoCofreDoImovel()
    acha ou cria sozinha um "ativo-ponte" no Cofre (tipo_ativo=
    'imovel', entidade_origem_tipo='imovel', entidade_origem_id=
    <imóvel>) na hora do primeiro upload — a pessoa nunca precisa
    saber que esse ativo-ponte existe. Ficha só CONSULTA (nunca
    cria) esse ativo-ponte ao abrir — criar só acontece de verdade
    no primeiro envio de foto, não é criado em toda visita à ficha.

  - Arquivos alterados: index.html (2 boxes + 10 funções novas).

VERSÃO: Beta v1.65.0
LINHAS: 24564
DATA: 2026-08-26
NOVIDADES (Beta v1.65.0) — pedido explícito: "chamar as telas Sobre/
Licença no Cofre, e já fazer Minha Empresa e Pessoas também,
incluindo os acessos no módulo de imóveis e cofre".

  - COFRE PASSA A USAR AS MESMAS 2 TELAS (Sobre/Licença) — cofre.html
    v1.19.0 não faz mais deep-link/placeholder "Em breve"/modal
    próprio pra essas duas: monta js/comum-sobre.js e
    js/comum-licenca.js direto, os MESMOS arquivos deste app. Ver
    changelog completo em cofre.html.
  - 2 MÓDULOS COMPARTILHADOS NOVOS: js/comum-minha-empresa.js
    (formulário de dados da empresa + upload/processamento de
    assinatura — algoritmo de Otsu copiado fiel) e
    js/comum-pessoas.js (CRUD de pessoas + criar/vincular/desvincular
    acesso). Absorvem por completo dev_carregarDadosEmpresa()/
    dev_salvarDadosEmpresa()/processarUploadAssinatura()/
    calcularLimiarOtsu()/salvarAssinaturaProcessada()/
    apagarAssinatura() e dev_renderPessoas()/dev_alternarDetalhePessoa()/
    validarPessoaEmail()/validarPessoaWhatsapp()/dev_adicionarNovaPessoa()/
    dev_salvarPessoas()/dev_removerPessoa()/dev_vincularLoginPessoa()/
    dev_desvincularLoginPessoa()/dev_criarAcessoParaPessoa() — todas
    REMOVIDAS daqui (confirmado por grep, zero chamadores externos
    restantes). dev_carregarDadosEmpresa()/dev_renderPessoas() viram
    pontes finas (nomes mantidos — call sites externos não mudaram),
    "preguiçosas": só remontam se a aba correspondente estiver
    mesmo ativa (`.tab-content.active`), evitando refetch/render
    invisível toda vez que uma rotina de refresh geral roda em
    background.
  - IMPORTANTE: a variável global `pessoas` (array) e
    carregarPessoasSupabase() NÃO foram tocadas — usadas em ~90
    outros pontos do app (sócios, divisão societária, repasses),
    fora do escopo desta extração.
  - "ACESSOS POR MÓDULO" (pedido explícito) — nova visibilidade na
    tela Pessoas: badge por pessoa mostrando quais módulos
    (Imóveis/Cofre) o PERFIL dela libera, calculado ao vivo. NÃO é
    controle novo por pessoa — confirmado contra o banco que hoje
    todo perfil libera os 2 módulos igualmente. Ver nota completa no
    changelog de comum-pessoas.js.
  - SOBRE GANHOU SEÇÃO "VERSÕES" (pedido explícito: "adicione a
    versão do módulo do Cofre, e dos bots") — módulos (App/Cofre,
    mantidos manualmente, sem fonte única compartilhada entre os 2
    arquivos estáticos) + bots (Edge Functions), estes AO VIVO via
    nova tabela `edge_function_versoes` (o próprio bot já se
    registra sozinho no boot — nunca fica desatualizado). RLS
    restringe a seção de bots a quem é master; para os demais
    perfis, a seção simplesmente não aparece.
  - Arquivos alterados/novos: index.html, cofre.html, js/cofre-app.js,
    js/cofre-estado.js, js/comum-sobre.js (v1.1.0), js/comum-licenca.js,
    js/comum-minha-empresa.js (novo), js/comum-pessoas.js (novo).

VERSÃO: Beta v1.64.0
LINHAS: 25053
DATA: 2026-08-26
NOVIDADES (Beta v1.64.0) — ABAS SOBRE E LICENÇA EXTRAÍDAS PRA CÓDIGO
COMPARTILHADO (pedido explícito): essas telas são de administração do
CLIENTE (empresa) — plano contratado, dados cadastrais, suporte —
não são conceitualmente do módulo Imóveis, e o Cofre (e módulos
futuros) também precisam delas. Até aqui, o Cofre resolvia isso com
um deep-link pra cá (?ir=tab-licenca, v1.62.3) — remendo funcional,
mas cada tela continuava existindo só neste arquivo. Primeira rodada
de uma extração maior (Pessoas e Minha Empresa ficam pra uma próxima
sessão, mesmo padrão) — comecei por Sobre/Licença por serem as com
menos funções/elementos, decisão do próprio usuário.

  - 2 módulos novos: js/comum-sobre.js e js/comum-licenca.js (ver
    changelog próprio em cada arquivo). São ES modules de verdade —
    App e Cofre importam o MESMO arquivo; nenhum dos dois "contém" a
    tela. Seguem a mesma Diretriz Arquitetural já usada nos módulos
    do Cofre (cofre-api.js) e no bridge de Comunicações
    (comunicacoes-app.js, já existente aqui): não criam client
    Supabase próprio, recebem `dbAuth` já autenticado do host por
    parâmetro — evita 2ª sessão/round-trip dentro da mesma página.
  - <section id="tab-sobre">/<section id="tab-licenca"> continuam
    existindo com os MESMOS ids (switchTab()/TAB_PARENT_MAP/
    abrirAbaPorDeepLink() dependem deles) — só o conteúdo interno
    virou um <div id="mount-sobre">/<div id="mount-licenca"> vazio,
    populado via import() dinâmico.
  - atualizarSecaoSobreLicenca()/inicializarLicenca() continuam
    existindo com os MESMOS nomes (viraram pontes finas de ~15
    linhas) — nenhum outro call site (switchTab(), bootstrap pós-
    login) precisou mudar.
  - enviarFeedbackLivreSobre() REMOVIDA (não só desativada — grep
    confirmou zero chamadores restantes): envio de feedback da aba
    Sobre agora é responsabilidade do módulo.
  - aplicarBrandingCliente() perdeu as 3 linhas que escreviam direto
    em sobre-logo/sobre-nome-empresa/sobre-dados-empresa (elementos
    não existem mais estaticamente) — montarAbaSobre() recebe
    CONFIG_CLIENTE inteiro e desenha esses dados sozinho.
  - MUDANÇA DE CONCEITO (não só de lugar): a aba Licença buscava só
    a licença do módulo 'imoveis' (hardcoded em 3 pontos). Agora
    busca TODAS as licenças do cliente, sem filtro de módulo — hoje
    isso não muda nada pra quase ninguém (confirmado contra o banco
    ao vivo: 10 clientes só com 'imoveis', 1 com 'imoveis'+'gestao'
    — a tela fica pixel-idêntica quando há só 1 licença), mas fica
    pronto pro Cofre ganhar sua própria linha em `licencas` no
    futuro sem precisar mexer neste arquivo de novo. Ver nota
    completa em comum-licenca.js.
  - LICENCA_ATUAL/carregarLicencaAtual()/dev_carregarLicenca() (usado
    pelas checagens de limite de Imóveis — fn_verificar_limite,
    verificarLimiteAntesDeAbrir(), painel DEV) NÃO foram tocados —
    são hardcoded em 'imoveis' de propósito (é exatamente o que
    devem checar) e continuam existindo à parte, sem relação com a
    extração desta versão.
  - Arquivos alterados/novos: index.html, js/comum-sobre.js (novo),
    js/comum-licenca.js (novo).

VERSÃO: Beta v1.63.0
LINHAS: 25238
DATA: 2026-08-26
NOVIDADES (Beta v1.63.0) — CONCEITO DE "ATRASO" CORRIGIDO EM TODO O
MÓDULO FINANCEIRO (pedido explícito do usuário): valor a receber no
futuro (lançamento gerado com antecedência, vencimento ainda não
chegado) NÃO pode ser tratado como pendência/atraso — antes era.

  - CAUSA RAIZ: gerarMensalidadesParaCompetencia() sempre grava
    status='Inadimplente' na criação, independente da competência
    ser passada ou futura (isso é correto — o campo status só
    significa "não pago"; não muda). O bug era que TODO ponto de
    alerta/badge do app lia esse status cru como se fosse sinônimo
    de "atrasado", sem checar a data de vencimento (dataPgto) real.
    Confirmado contra o banco ao vivo (Supabase MCP): havia 3
    lançamentos reais já marcados como atraso com vencimento em
    09/2026, 10/2026 e até 07/2027.
  - NOVA função central mensalidadeEmAtraso(m) (perto de
    mensalidadeIsentaDeAlertas): só considera atraso quando status
    não pago E dataPgto <= hoje. Complementar mensalidadeAVencer(m)
    pro caso contrário. Nenhuma mudança no campo status armazenado
    nem nos usos operacionais (dar baixa, excluir lançamento,
    trocar status do contrato, conciliação) — só o RECORTE de
    "isso é alerta/cobrança" muda.
  - Visão Geral: card "Em atraso" e item "recebimentos em atraso"
    da lista "Atenção necessária" agora usam mensalidadeEmAtraso().
  - Cobranças (renderInadimplencia): lançamento futuro NUNCA mais
    aparece na lista nem soma no "Total em Aberto"/"Taxa de
    Atraso" — essa aba dispara cobrança de verdade por WhatsApp
    (botão "Cobrar Grupo"), então mostrar/cobrar um aluguel que
    ainda nem venceu era o pior caso do bug. Novo aviso informativo
    (neutro, não-alerta) avisa quantos lançamentos futuros existem
    e não aparecem ali, apontando pra aba Financeiro.
  - Financeiro/Mensal (renderMensalidades) e ficha individual do
    recebimento (abrirRecebimentoDetalhe): badge "Atrasado" (âmbar)
    só aparece em lançamento realmente vencido; lançamento futuro
    ganha badge neutro "A vencer" — mesmo card, mesmos botões (Dar
    Baixa continua disponível pra recebimento antecipado). Chip
    "Atraso R$..." do cabeçalho de cada grupo de competência também
    corrigido; novo chip "A vencer R$...". apagarInadimplentesDoGrupo()
    corrigida pra nunca apagar um "A vencer" junto (antes apagava
    TODO 'Inadimplente' da competência, sem checar vencimento).
  - Relatórios (renderRelatorios): coluna/total "Inadimplente" da
    tabela mês a mês também passou a usar mensalidadeEmAtraso().
  - Bot do WhatsApp (webhook + Diário de Eventos): RPC
    fn_diario_atrasos_pendentes corrigida via migration no Supabase
    (mesma sessão) pra usar a data de vencimento real gravada em
    cada mensalidade em vez de recalcular a partir de
    vencimento_dia — a versão antiga não considerava
    aluguel_antecipado=false (vencimento no mês seguinte),
    cobrindo um atraso que ainda não tinha vencido de verdade em
    alguns dias por mês. _shared.ts também ajustado nos 2 pontos
    que mostravam o status cru do banco numa mensagem de WhatsApp
    (🔴 Atrasado) sem checar se o vencimento já tinha chegado.
  - Arquivos alterados: index.html, whatsapp-webhook/_shared.ts,
    migration no Supabase (fn_diario_atrasos_pendentes).

VERSÃO: Beta v1.62.5
LINHAS: 24940
DATA: 2026-08-25
NOVIDADES (Beta v1.62.5) — BUG FIX CRÍTICO NA ABA LICENÇA (achado pelo
usuário, erro 404 ao abrir):

  - Tabela errada: código buscava `plano_funcionalidades` (plural) —
    a tabela real é `plano_funcionalidade` (singular). Sempre dava
    404. Confirmado direto no schema live via Supabase MCP antes de
    corrigir (não presumido — mesma lição já registrada nos
    aprendizados do projeto: "schema_completo.sql pode estar
    desatualizado, sempre confirmar contra o banco ao vivo").
  - Coluna errada: filtro usava `limite_final` — a coluna real é só
    `limite`. Mesmo bug, mesma causa (código escrito sem acesso ao
    banco ao vivo numa sessão anterior, registrado no próprio
    comentário do código que eu revisei).
  - BÔNUS: cada funcionalidade agora mostra o nome comercial
    (`funcionalidades.nome_comercial`, ex. "Comprovantes por mês")
    em vez do código técnico bruto (ex. "cofre.uso_mensal") — busca
    separada, sem depender de sintaxe de embed/FK.

  - Arquivos alterados: index.html (função de carregar Licença).

VERSÃO: Beta v1.62.4
LINHAS: 24896
DATA: 2026-08-25
NOVIDADES (Beta v1.62.4) — INVESTIGAÇÃO DO DEEP-LINK (?ir=tab-X) NÃO
FUNCIONANDO NO CELULAR + SPLASH MAIS RÁPIDO (pedido explícito):

  1) INVESTIGAÇÃO — deep-link não levava a lugar nenhum no celular
  - Revisado o código: existem 2 caminhos de boot que convergem numa
    ÚNICA função (`entrarNoSistema()`) — login manual
    (`fazerLoginSupabase()`) e sessão já salva no navegador
    (`window.onload` → `verificarAcessoEEntrar()`, quando já existe
    sessão Supabase válida). `abrirAbaPorDeepLink()` já estava
    corretamente dentro dessa função convergente, então os dois
    caminhos deveriam chamar ela igual — **não achei um bug de
    código que explique "não funciona no celular"**.
  - Suspeita mais provável: cache do Service Worker (`sw.js`, já
    registrado no boot) servindo uma versão ANTIGA da página no
    celular, de antes do recurso `?ir=` existir. Sinalizado pro
    usuário — se persistir depois desta entrega, tentar um "hard
    refresh"/limpar cache no navegador do celular antes de reabrir o
    chamado de bug.
  - Adicionado log de diagnóstico em `abrirAbaPorDeepLink()`
    (`logScreen()`, mesmo painel já usado no resto do boot) — se
    acontecer de novo, dá pra confirmar se a função sequer está
    rodando, ou se roda mas `switchTab()` falha silenciosamente.

  2) SPLASH MAIS RÁPIDO PRA DEEP-LINK (reduz a sensação de "recarregou
     tudo", pedido explícito)
  - `entrarNoSistema()` ganhou `temDeepLinkPendente` (detecta `?ir=`
    na URL logo no início da função) — quando verdadeiro, os 2
    `setTimeout` da animação de fade da splash (800ms + 500ms, só
    efeito visual, não busca de dado nenhum) caem pra 0ms. A busca
    de dados em si (pessoas/imóveis/contratos/etc., que sempre
    precisa rodar pra qualquer aba funcionar direito) continua
    exatamente igual — só a ANIMAÇÃO de transição é pulada.
  - ⚠️ LIMITE ARQUITETURAL (avisado, não resolvido nesta entrega):
    mesmo com a animação pulada, ainda existe um carregamento real
    (sessão + busca de todos os dados do app) — index.html e
    cofre.html são 2 arquivos HTML separados, e reaproveitar a tela
    do App de verdade (em vez de duplicar, como já foi pedido
    explicitamente antes) significa necessariamente carregar o App.
    Eliminar esse carregamento por completo exigiria (a) um iframe
    incorporando o App dentro do Cofre — arriscado, pode quebrar
    layout/CSS entre os 2 apps — ou (b) duplicar a tela de verdade
    dentro do Cofre — o que contraria o pedido anterior de não
    duplicar. Nenhuma das duas foi implementada; decisão em aberto
    com o usuário.

  3) PRESTADORES DE SERVIÇO — revertido pra "Em breve" (pedido
     explícito, decisão de destino ainda não confirmada)

  - Arquivos alterados: index.html (entrarNoSistema + abrirAbaPorDeepLink).

VERSÃO: Beta v1.62.3
LINHAS: 24821
DATA: 2026-08-25
NOVIDADES (Beta v1.62.3) — CORREÇÃO DE COR + DEEP-LINK PRO COFRE
(pedido explícito):

  1) COR DO NOME DA EMPRESA (correção da v1.62.2 — contraste ruim)
  - `text-emerald-800` → `text-white/80` — igual à cor do texto do
    badge do módulo ("Imóveis"), que fica logo abaixo do nome.
    Resolve o problema de contraste sinalizado na entrega anterior
    (emerald-800 sobre o fundo do cabeçalho dava ~1.9:1, ilegível).
  - Fundo do badge/ícones de robô e conta NÃO mudou aqui (continuam
    `bg-emerald-800`) — a mudança de fundo pro tom "ativos
    controlados" foi pedida só pro Cofre, não pro App.

  2) NOVO — DEEP-LINK PÓS-LOGIN (?ir=tab-X)
  - Nova `abrirAbaPorDeepLink()`, chamada uma vez logo após o app
    principal terminar de renderizar no login. Lê `?ir=tab-X` da
    URL; se o elemento existir no DOM, chama `switchTab('tab-X')`
    sozinho. Remove o parâmetro da URL em seguida
    (`history.replaceState`) — um F5 depois não repete a troca de
    aba à força.
  - Existe pro menu ⚙️ do Cofre poder abrir Pessoas/Minha Empresa/
    Imóveis/Licença/Sobre/Prestadores de Serviço direto no App, sem
    duplicar HTML/lógica nenhuma no lado do Cofre (pedido explícito
    — "não crie duas abas iguais, os links devem levar à mesma
    tela"). Mesmo princípio de segurança de `abrirCofreDocumentos()`
    no sentido contrário: parâmetro de URL nunca é autorização, só
    sugestão de navegação — a RLS de cada aba continua sendo quem
    decide o que a pessoa vê de verdade.

  - Arquivos alterados: index.html (2 spans de cor + nova função +
    1 chamada no fluxo de login).

VERSÃO: Beta v1.62.2
LINHAS: 24757
DATA: 2026-08-25
NOVIDADES (Beta v1.62.2) — CORES DO CABEÇALHO (pedido explícito):

  - Nome da empresa (`#logo-header`): `text-emerald-400` →
    `text-emerald-800` — igual ao fundo do badge do módulo e dos
    ícones de robô/conta (todos `bg-emerald-800`).
  - Badge do módulo ("Imóveis"): texto `text-emerald-200` →
    `text-white/80` — igual à cor do texto dos rótulos do card de
    KPIs ("Imóveis"/"Alugados"/etc., que usam `opacity-80` sobre
    texto branco).
  - Mesma correção aplicada no Cofre (cofre.html v1.14.0) — os dois
    módulos usavam a mesma cor antiga, ficam sincronizados na nova.
  - ⚠️ RESSALVA (contraste): `text-emerald-800` (#065f46) sobre o
    fundo do cabeçalho (`--pine-deep`, #152a24) calcula ~1.9:1 de
    contraste — abaixo do mínimo WCAG AA (4.5:1) pra texto normal.
    Aplicado exatamente como pedido; sinalizado pro usuário decidir
    se mantém ou ajusta numa próxima rodada.
  - Splash/login (`text-3xl ... text-emerald-400`, 2 ocorrências) NÃO
    alterado — pedido era especificamente sobre o cabeçalho interno
    (nome + badge + ícones de robô/conta), contexto diferente do
    logo grande da tela de login.

  - Arquivos alterados: index.html (2 spans).

VERSÃO: Beta v1.62.1
LINHAS: 24731
DATA: 2026-08-25
NOVIDADES (Beta v1.62.1) — EXCLUIR IMÓVEL CONECTADO AO MAIS AÇÕES
(pedido explícito):

  ACHADO — a função `excluirImovel(id)` já existia inteira (com
  confirm(), checagem de contrato vinculado, DELETE no Supabase,
  log e navegação pós-exclusão) desde uma versão anterior, mas
  nunca tinha sido conectada a nenhum botão — órfã, inacessível
  pela interface.

  CONECTADO — nova pill "Excluir" no painel de Mais ações do
  cabeçalho da Ficha do Imóvel (`abrirFichaImovel()`, `#fi-mais-
  acoes`), ao lado de Detalhes/Copiar resumo/Criar contrato/Enviar
  IPTU. Só aparece se o imóvel NÃO tiver nenhum contrato vinculado
  (`!contratos.some(c => c.imovelId === imo.id)`) — DS §16, pill
  condicional não existe no DOM se a condição não vale, em vez de
  aparecer desabilitada. Checagem de contrato dentro da própria
  `excluirImovel()` continua como segunda camada de segurança
  (nunca confia só na visibilidade da pill).
  - "Nem itens a receber mensais relacionados" (pedido explícito):
    não precisou de checagem própria — mensalidades SEMPRE são
    filhas de um contrato (`m.contratoId`, nunca existe mensalidade
    sem contrato no schema atual) — a checagem de contrato já
    garante isso transitivamente.

  - Arquivos alterados: index.html (1 pill nova).

VERSÃO: Beta v1.62.0
LINHAS: 24701
DATA: 2026-08-25
NOVIDADES (Beta v1.62.0) — USO DO IMÓVEL: STATUS PRÓPRIO, ALERTAS
CONDICIONAIS, BLOQUEIO DE CONTRATO (pedido explícito, revisão de
testes do delivery da Karen):

  1) 2 STATUS NOVOS NO BANCO (migrations aplicadas)
  - Migrations `status_imovel_add_em_uso_v1` e
    `status_imovel_add_em_breve_v1` (ALTER TYPE ADD VALUE, cada uma
    isolada — restrição do Postgres) já aplicadas em produção.
    `status_imovel_enum` agora tem: disponivel, alugado, manutencao,
    reservado, assinando, em_uso, em_breve.

  2) STATUS INICIAL DEPENDE DO USO DO IMÓVEL
  - NOVO: `statusInicialPorFinalidadeUso()` — ao CRIAR um imóvel (não
    se aplica a edição de um já existente): finalidadeUso
    'uso_proprio' nasce direto em "Em uso" (nunca passa por "Vago");
    'temporada' nasce em "Em Breve"; long_stay/comercial/outro
    seguem nascendo "Vago" como sempre.
  - `mapStatusSupabaseParaAntigo`/`mapStatusAntigoParaSupabase`
    atualizados com os 2 status novos nos dois sentidos.
  - Badge de status (montarCabecalhoImovelHtml) não precisou de
    código novo — "Em uso"/"Em Breve" já caem no branch "demais"
    (slate), que é a cor correta pra um status neutro sem urgência.

  3) ALERTAS CONDICIONADOS AO USO DO IMÓVEL (Visão Geral)
  - NOVO: `imovelIsentoDeAlertas(imovelId)` — true pra uso_proprio E
    temporada (pedido explícito: nenhum dos dois gera alerta do App
    neste momento, só os cadastrados no Cofre; Long Stay continua
    com os alertas de sempre).
  - NOVO: `mensalidadeIsentaDeAlertas(m)` — mesma regra, olhando o
    imóvel por trás do contrato da mensalidade.
  - `renderVisaoGeral()`: contadores de inadimplentes e as listas de
    "contratos aguardando assinatura"/"contratos com alerta" agora
    excluem imóveis isentos. Contadores de vagos/alugados já
    excluíam automaticamente (efeito colateral bom da mudança #2 —
    "Em uso"/"Em Breve" nunca são "Vago"/"Alugado").
  - NÃO alterado (decisão de escopo): os filtros manuais de busca de
    Contratos (contratoPrecisaRevisao/contratoVencido usados no
    overlay de filtro) continuam mostrando o estado real mesmo de
    contratos isentos — a exceção é só pra alerta PROATIVO
    (notificação/contagem não solicitada), não pra esconder dado
    real de uma busca manual do usuário.
  - PENDENTE (fora do escopo destes arquivos): a mesma condicional
    precisa ser replicada no bot (`whatsapp-webhook`, Supabase Edge
    Function) — esse código não está entre os arquivos desta
    entrega. Ver HANDOFF/checklist ao final deste changelog.

  4) BLOQUEIO DE CONTRATO PARA USO PESSOAL
  - `iniciarProcessoContratacao()`: guarda única na função-fonte —
    imóvel com finalidadeUso === 'uso_proprio' nunca inicia processo
    de contratação (alerta explicando o motivo). Cobre todos os
    pontos de entrada (pill "Locação" da Ficha, reabertura de
    "Assinando", Vitrine pública).
  - `montarBoxSemContratoFicha()`: pra imóvel de uso pessoal, o box
    Contrato explica o motivo em vez de oferecer "Mais ações →
    Locação" vazio (DS §16 — pill condicional não existe no DOM se a
    condição não vale).

  5) TAG DE USO DO IMÓVEL NA LISTA
  - NOVO: `rotuloFinalidadeUso()` — rótulo de exibição dos 5 valores
    de finalidade_uso. Card da lista (montarCabecalhoImovelHtml,
    reaproveitado também no topo da Ficha) ganhou o Uso logo após o
    Tipo: "Canaã · Apartamento · Long Stay" (pedido explícito).

  - Arquivos alterados: index.html (linhas não mudaram — só
    substituições pontuais).
  - Migrations aplicadas: status_imovel_add_em_uso_v1,
    status_imovel_add_em_breve_v1 (ambas em
    oduwpttbbemypiypjsux, via Supabase MCP).

HANDOFF — PENDENTE PRO BOT (whatsapp-webhook, fora destes arquivos):
  Replicar a mesma condicional desta versão na lógica de alertas do
  bot: NÃO enviar mensagem de alerta de contrato/vencimento pra
  imóveis com finalidade_uso IN ('uso_proprio', 'temporada') — usar
  a MESMA leitura de `imoveis.finalidade_uso` que o App já faz.
  Long Stay/comercial/outro continuam recebendo alerta normalmente.
  Fila de trabalho: (a) achar onde o bot itera contratos/imóveis pra
  montar a mensagem periódica de alerta, (b) fazer join com
  `imoveis.finalidade_uso`, (c) pular o envio se
  uso_proprio/temporada. Sem essa mudança, o bot vai continuar
  mandando alerta de contrato pra imóvel de uso pessoal (que nem
  pode ter contrato — inofensivo na prática, já que o contrato nunca
  vai existir) e pra imóvel de temporada com contrato real vencendo
  (esse SIM precisa da correção, pois o contrato pode existir de
  verdade).

VERSÃO: Beta v1.61.6
LINHAS: 24541
DATA: 2026-08-25
NOVIDADES (Beta v1.61.6) — DECISÕES D-1/D-3 CONFIRMADAS (2ª rodada da
revisão REVISAO_DS_COFRE_IMOVEIS v1.0.0):

  1) D-1 — "EXCLUIR" DEIXA DE SER EXCEÇÃO DE COR
  - CORRIGIDO: `excluirContrato()` (painel "Mais ações" da Ficha do
    Contrato, `#fc-mais-acoes`) era o ÚNICO lugar do App que seguia o
    padrão antigo do DS (pill vermelha sem fundo). Decisão do
    proprietário: "Excluir" vira cinza uniforme em todo o sistema —
    Design System v2.1.0 §8.3/§12 atualizados, regra da "exceção" foi
    removida (agora não existe mais nenhuma exceção de cor dentro do
    painel de Mais ações). Não alterados: os botões de excluir em
    telas de configuração (Empreendimentos/Tipos de Imóvel/Minutas/
    Administradoras/Síndicos/Manutencistas) e os de Financeiro/
    Divisão — são um padrão visual DIFERENTE (ícone circular
    standalone em linha de lista, não pill de "Mais ações"), fora do
    escopo desta decisão.

  2) D-3 — ARQUITETURA DE POPUP: nenhuma mudança de código aqui
    (decisão "Cofre segue o padrão do Imóveis" afeta cofre.html/js,
    não o App — ver changelog do cofre.html v1.8.0).

  - Arquivos alterados: index.html (linha 17260 — 1 pill).

VERSÃO: Beta v1.61.5
LINHAS: 24515
DATA: 2026-08-25
NOVIDADES (Beta v1.61.5) — LOTE DE CONFORMIDADE COM O DESIGN SYSTEM
(revisão REVISAO_DS_COFRE_IMOVEIS v1.0.0, decisões confirmadas pelo
proprietário: I-1, I-2, I-3, I-4, I-5, I-7). Zero mudança de
comportamento visível ao usuário final — só nomenclatura, tokens de
cor, semântica de tag e um bug latente de navegação corrigido
preventivamente.

  1) I-1 — PADRONIZAÇÃO DE NOME DE FUNÇÃO
  - RENOMEADO: formatarMoeda() → formatarMoedaBR() em TODO o arquivo
    (14 ocorrências: definição + 13 chamadas). O Design System sempre
    documentou formatarMoedaBR() como nome oficial (§11.4, checklist de
    DoD §20); o código divergia do próprio documento que devia
    descrevê-lo. Nenhuma mudança de comportamento — só nome.

  2) I-2 — HEX SOLTOS SUBSTITUÍDOS POR TOKEN
  - CORRIGIDO: 5 ocorrências de #059669/#dc2626/#fee2e2 hardcoded
    (ícone de mensalidade paga/pendente na ficha do imóvel, X de
    remover foto, "Total: X%" e botão de remover linha na Divisão
    Societária) substituídas por var(--success)/var(--danger)/
    var(--danger-bg). Visual idêntico (tokens têm valor de cor bem
    próximo do hex anterior); daqui pra frente qualquer ajuste de
    paleta de sucesso/erro é 1 lugar só (:root), não N ocorrências
    soltas pelo arquivo.

  3) I-3 — BADGE DE ENERGIA: NOVA CATEGORIA "BADGE DE ATRIBUTO"
  - NOVO: classe utilitária `.raiz-badge-atributo` (usa
    var(--warning-bg)/var(--warning) — reaproveita token existente,
    nenhum hex novo), substituindo as 3 ocorrências internas de
    bg-yellow-100/text-yellow-800 (renderImoveis/renderContratos/
    renderVitrine). A badge do formulário PÚBLICO da Vitrine (fora do
    app autenticado, template próprio) foi mantida como estava —
    fora do escopo do Design System interno.
  - Categoria "badge de atributo" (distinta de badge de STATUS, §14)
    documentada no Design System v2.1.0 §14.1: usada quando o dado é
    uma característica do registro (ex.: "tem energia própria"), não
    um estado de fluxo.

  4) I-4 — SEMÂNTICA DE TAG NO CARD DO IMÓVEL
  - CORRIGIDO: `<h2 class="text-xs...">` do nome do
    empreendimento/tipo dentro do card virou `<h3>` — um `h2` a 12px
    não é "título de tela secundária" (DS §2, que reserva h2 pra
    text-lg). Sem mudança visual (a fonte/tamanho vêm só da classe).

  5) I-5c — "VOLTAR" DA FICHA DO IMÓVEL RESPEITA A ORIGEM REAL
  - CORRIGIDO (preventivo — sem bug visível ainda, mas trap latente):
    voltarDaFichaImovel() ia sempre pra tab-imoveis, fixo.
    abrirFichaImovel() é chamada de vários pontos além da lista de
    Imóveis (Ficha do Contrato, retorno pós-conciliação, etc. — ver
    linhas 13740/16873/17128/18069) — se um card de fora de Imóveis
    abrisse a ficha, o "< Voltar" mentia sobre a origem. NOVO: variável
    `fichaImovelOrigemTab`, gravada só quando a navegação vem de fora
    da própria ficha (não se perde ao reabrir após salvar edição).
    Fallback pro TAB_PARENT_MAP se a origem não for capturada por
    algum motivo. Alinhado à DS §4.2 ("destino sempre real, nunca
    fixo").
  - NÃO ALTERADO nesta versão (decisão do proprietário, ver DS
    v2.1.0): o rótulo do botão continua "Imóveis" (não "Voltar") e a
    ficha continua sem `<h2>` de título — o Design System é que foi
    corrigido pra descrever esse padrão como legítimo, em vez do
    código ser forçado a imitar o texto genérico do documento.

  6) I-7 — PAINEL DE MAIS AÇÕES DO BOX FINANCEIRO
  - CORRIGIDO: `#fi-financeiro-acoes` ganhou `flex-wrap gap-1.5`
    (fazia falta desde sempre, só não quebrava com 1 pill só). Segue
    DS §8.3 à risca agora — pronto pra uma 2ª pill futura sem gambiarra.

  - Arquivos alterados: index.html (LINHAS: 24399→24433).
  - Nenhuma migration, nenhum deploy de bot nesta rodada.

NÃO IMPLEMENTADO NESTA VERSÃO (declarado, não fingido):
  - I-6 (documentar "bloco interno" no DS) — fica só no documento
    (DS v2.1.0 §17), não exige mudança de código.
  - Itens do Cofre (C-*) — ver changelog próprio do cofre.html v1.7.0
    nesta mesma entrega.
  - Decisões D-1 a D-6 (cor de Excluir, chips vs badges, arquitetura
    de popup do Cofre, itens "em breve" do menu, box Contatos
    vinculados) seguem pendentes de confirmação — ver seção própria
    na resposta desta rodada.

VERSÃO: Beta v1.61.4
LINHAS: 24399
DATA: 2026-08-25
NOVIDADES (Beta v1.61.4) — CAMPO "USO DO IMÓVEL" LIGADO NO FORMULÁRIO:

  NOVO — campo "Uso do imóvel" (Long Stay/Uso próprio/Temporada/
  Comercial/Outro, default Long Stay) no formulário de cadastro/edição
  de imóvel. A coluna `finalidade_uso` já existia no banco desde uma
  migration de sessão anterior (imoveis_finalidade_uso_v1), mas nunca
  tinha sido ligada ao formulário — ficava sempre no valor padrão do
  banco, sem o usuário poder escolher nem ver. "Detalhes do Imóvel"
  (Mais ações) reaproveita o mesmo formulário, então também mostra o
  campo automaticamente.

VERSÃO: Beta v1.61.3
LINHAS: 24355
DATA: 2026-08-24
NOVIDADES (Beta v1.61.3) — CORRIGIDO: selo de módulo mal posicionado:

  CORRIGIDO — o selo "Imóveis" do header estava numa linha flex
  horizontal ao lado do nome da empresa; quando o nome era longo (ex.:
  "BETA-RAIZ-PATRIMONIO") e quebrava linha, o selo ficava flutuando no
  lugar errado. Virou layout empilhado (nome em cima, selo embaixo),
  igual ao padrão já usado no Cofre.

VERSÃO: Beta v1.61.2
LINHAS: 24355
DATA: 2026-08-24
NOVIDADES (Beta v1.61.2) — SELO DE MÓDULO NO HEADER (pedido explícito):

  NOVO — selo "Imóveis" ao lado da logo no header principal, identificando
  o módulo atual (mesmo padrão agora usado no Cofre, que ganhou selo
  "Cofre" equivalente — ver changelog do Cofre v1.4.0). Preparação para
  quando o usuário circular entre módulos (Imóveis/Cofre) dentro do mesmo
  shell — sem isso, não dava pra saber em qual módulo se estava.
  Nome da empresa no header já era dinâmico via aplicarBrandingCliente()
  (CONFIG_CLIENTE.nomeEmpresa) desde antes desta versão — não mudou aqui,
  só ganhou o selo de módulo ao lado.

NOVIDADES (Beta v1.61.1) — CORRIGIDO BUG CRÍTICO INTRODUZIDO NA v1.61.0:

  CORRIGIDO — form-imovel-wrapper ficava sempre visível e bloqueando a
  aba Imóveis, sem forma de fechar. Causa: a conversão pro padrão
  bottom-sheet colocou "display:flex" no atributo style INLINE do
  wrapper; estilo inline sempre vence a classe .hidden (display:none)
  por especificidade CSS, então classList.add('hidden')/remove('hidden')
  (usado por fecharCadastroImovelModal/abrirCadastroImovelModal e por
  todo o resto do fluxo de edição) parava de ter efeito visual — o
  JS estava funcionando certo, só não conseguia mais esconder o modal.
  Corrigido: "display:flex" saiu do style inline e virou regra CSS
  dedicada (#form-imovel-wrapper:not(.hidden){display:flex}), que
  respeita a mesma cascade de .hidden usada no resto do app. Nenhuma
  outra função/wrapper foi afetada — bug isolado a este componente,
  confirmado por varredura no arquivo inteiro.

NOVIDADES (Beta v1.61.0) — AUDITORIA DE PADRÃO VISUAL (Design System v1.0):

  CORRIGIDO — form-imovel-wrapper (Cadastrar/Editar Imóvel) era o único
  formulário de ação que ainda usava o padrão ANTIGO de modal (card
  centralizado, cabeçalho escuro fora do card, X redondo translúcido
  sobre o overlay). Convertido para o padrão bottom-sheet (item 6 do
  Design System): sobe de baixo pra cima, cantos arredondados só em
  cima, título+X pequeno dentro do card branco, rodapé com os 2 botões
  lado a lado (Salvar Imóvel / Fechar). Conteúdo dos 3 steps (imo-step-
  1/2/3) e toda a lógica de validação/gravação (saveImovel,
  validarStepImovel etc.) NÃO foram tocados — só o container mudou.
  abrirCadastroImovelModal()/fecharCadastroImovelModal() continuam
  como únicos pontos de entrada, sem mudança de assinatura.

  VERIFICADO (sem mudança de código) — auditoria completa dos itens
  listados na seção "Cobertura" do Design System v1.0:
  - "Dados do Locatário" e "Detalhes do Contrato": JÁ estavam no
    padrão bottom-sheet completo (X pequeno + 2 botões no rodapé) —
    a seção "Cobertura" do documento estava desatualizada nesse ponto,
    corrigida nesta entrega (ver DESIGN_SYSTEM v1.1).
  - "Reajuste" como popup isolado e "Vincular Prestadores" como modal:
    não existem mais como componentes separados nesta versão —
    Reajuste foi absorvido pelo formulário completo de contrato
    (campo con-valor-anterior) e "Vincular síndico/manutencista"
    viraram navegação direta pras abas globais (abrirVincularSindico/
    abrirVincularManutencista → switchTab), não modais. Documento
    atualizado pra refletir a realidade do código.
  - form-contrato-wrapper (Novo Contrato/Locação) continua com o
    padrão ANTIGO (mesmo cabeçalho escuro + X translúcido do
    form-imovel-wrapper antes desta versão) — NÃO convertido agora
    por ser um formulário grande e deliberadamente bloqueante
    (overlay que só fecha ao salvar ou no X, decisão de v1.48.0), com
    máscara/indicador de CPF/telefone/e-mail própria, categoria já
    excluída pelo próprio Design System (item 7.2). Fica registrado
    como pendência para decisão explícita — ver observações da
    entrega.
  - Aba "Contratos (todos)" (tab-contratos): mantida — NÃO é código
    morto. Além de ser destino de deep-link a partir de outros pontos
    do app (switchTab('tab-contratos') chamado depois de salvar
    contrato, a partir dos cards de alerta da Visão Geral, e do
    seletor de contrato), é a ÚNICA tela que permite busca/filtro de
    contratos ACIMA do nível de um imóvel (por locatário, por
    empreendimento, por "só com alerta") — a sub-aba Contrato da
    Ficha do Imóvel é só leitura e filtrada para 1 imóvel. Remover
    quebraria esses 3 pontos de entrada sem ganho real.

NOVIDADES (Beta v1.60.0):

  CORRIGIDO — BUG REAL CRÍTICO, PRÉ-EXISTENTE (não introduzido nesta
  sessão, mas exposto por ela): editar o "Valor do aluguel" de um
  contrato JÁ EXISTENTE (fora do fluxo de reajuste) nunca persistia —
  saveContrato() sempre reaproveitava contratoExistente.valor quando o
  painel de reajuste (con-valor-anterior) estava vazio, ignorando por
  completo o que estivesse em con-valor. Relatado como "altero, salvo,
  ao entrar de novo voltou pro valor antigo" — confirmado e corrigido:
  con-valor agora é sempre a fonte de verdade da base; o painel de
  reajuste só entra como substituição quando preenchido de propósito
  (fluxo de reajuste em si não mudou nada).

  Esse mesmo bug explica o relato "o contrato nasceu com o valor padrão
  do imóvel, mas a crítica de gerar minuta reclamou de valor zerado" —
  contratos nascidos do link público realmente começam com valor 0 (o
  trigger não copia o valor do imóvel); o popup "Dados Novo Contrato"
  mostrava o valor do imóvel como sugestão de preenchimento (fallback
  visual), o que dava a impressão de já estar salvo — mas ao tentar
  editar e salvar de verdade, o bug acima impedia a gravação. Com o bug
  corrigido, editar e salvar o valor agora funciona nesse popup.

  DESIGN SYSTEM — NOVO documento (DESIGN_SYSTEM_RAIZ_PATRIMONIO_v1.60.0.md)
  registrando os padrões visuais já implementados: cores, tipografia,
  estrutura de boxes/overlays/popups, campos de formulário com máscara/
  indicador de validação, ícones, hierarquia de botões — e uma seção
  de "Cobertura" honesta sobre quais popups já seguem 100% o padrão
  bottom-sheet completo (2 botões no rodapé, sem X redondo) e quais
  ainda não foram atualizados.

NOVIDADES (Beta v1.59.0) — fecha a pendência da v1.58.0 sobre a
validação da minuta.

  "GERAR MINUTA" — CORRIGIDO: a pessoa relatou receber 2 avisos em
  sequência (1º sobre preço/vigência do contrato, corrigia, clicava de
  novo, e só aí via um 2º sobre "observação" — que era da DESCRIÇÃO DO
  IMÓVEL, usada como placeholder no modelo de minuta, não um campo do
  contrato). Causa: a validação rodava em 2 etapas sequenciais
  (avaliarProntidaoContratoParaMinuta primeiro, preencherMinutaDocx
  depois), cada uma travando com seu próprio alerta antes da outra
  rodar. Corrigido: as duas checagens agora rodam completas ANTES de
  qualquer alerta — tudo que estiver faltando (dados do contrato +
  placeholders do modelo) aparece junto, numa mensagem só.

  LEMBRETE — a migration URGENTE_rodar_sozinho_enum_assinando.sql
  (entregue há duas rodadas) ainda precisa ser aplicada no Supabase pra
  os erros "invalid input value for enum status_imovel_enum: assinando"
  dos prints pararem de acontecer — não é algo que o código do app
  resolve sozinho, é uma alteração pendente no banco.

PENDÊNCIAS (não concluídas — ver HANDOFF de v1.58.0 pra detalhe):
  - Revisão visual completa de todos os popups desta ficha (máscara +
    indicador "válido" de CPF/CNPJ/telefone/e-mail em todos, remover
    botão redondo de fechar, padronizar ação principal à esquerda/
    "Sair" à direita no rodapé) — aplicado nos mais usados ao longo das
    últimas rodadas, não numa varredura sistemática de todos.
  - Documento de Design System (novo arquivo pra subir no projeto) —
    não criado.

NOVIDADES (Beta v1.58.0) — lote grande de ajustes. Ver lista de
PENDÊNCIAS no fim deste bloco — nem tudo do pedido coube com o mesmo
rigor de validação nesta rodada.

  LISTA/FICHA DE IMÓVEIS — endereço não trunca mais em 1 linha (mostra
  rua/número/complemento/bairro/cidade completos, quebrando quantas
  linhas precisar). Locatário e aluguel sem negrito. Aluguel alinhado à
  direita, "/mês" removido.

  BOX CONTRATO — botão "Histórico" ganhou a contagem entre parênteses
  antes de abrir (ex: "Histórico (3)").

  ALTERAR STATUS — rótulo "Data" → "Data vigência". Opção "Assinando"
  desaparece da lista se o contrato já teve algum pagamento registrado
  (não faz sentido voltar pra essa fase depois de já ter recebido).

  GERAR MÊS (Financeiro) — CORRIGIDO: contratos "Assinando" não geram
  mais mensalidades (só Ativo/Suspenso continuavam sendo considerados
  antes desta correção incluir Assinando na exclusão).

  BOXES VAZIOS — Financeiro/Serviços/Divisão Societária somem da ficha
  quando não têm nada cadastrado. Documentos some quando não há nenhum
  documento (decisão assíncrona, depois da checagem no Cofre). EXCEÇÃO
  EXPLÍCITA: o box Contrato sempre aparece, mesmo vazio (é onde mora o
  "Mais ações → Locação").

  DOCUMENTOS — miniaturas de fotos ficaram bem menores (grid compacto
  40×40px, antes ocupavam 1/3 da largura da tela cada).

  MENU "LOCAÇÃO" — CORRIGIDO: BUG REAL — "Gerar minuta" fechava o menu
  ANTES de mostrar qualquer alerta de validação (contrato inexistente/
  dados faltando/sem minuta cadastrada); a pessoa clicava OK no alerta e
  o menu já tinha sumido. Corrigido: só fecha no sucesso de verdade.

  "DADOS NOVO CONTRATO" RECONSTRUÍDO (pedido explícito) — deixou de
  abrir o formulário completo (tema escuro, com imóvel/status/reajuste/
  documentos/históricos) e virou popup leve, mesmo padrão bottom-sheet
  de "Alterar Status"/"Histórico". Campos: dados do locatário completos
  (nome/CPF-CNPJ/WhatsApp/e-mail/endereço em 3 linhas/profissão/estado
  civil), vigência, valor do aluguel, vencimento, forma de pagamento,
  administradora, índice de reajuste, condomínio/IPTU pago pelo
  locatário, e um campo novo de "Descrição/observação" livre (vira
  histórico). Sem imóvel/status/reajuste/documentos/históricos — nenhum
  deles fazia sentido aqui. "Salvar" escreve nos campos REAIS do
  formulário completo (escondido) e chama saveContrato() sem
  alteração — reaproveita 100% o motor de validação/diff/histórico que
  já existia, não dupliquei nada disso. Se já existir um contrato
  Assinando pra este imóvel, abre pré-preenchido com os dados que o
  locatário enviou pelo link.

PENDÊNCIAS (não concluídas nesta rodada — ver HANDOFF):
  - "Ao clicar em gerar minuta, não avisa que campo observação está
    vazio na 1ª vez" — investigado, não encontrei um campo "observação"
    na validação de prontidão da minuta nem uma causa clara pro sintoma
    "só na 1ª vez". Preciso de mais detalhe (print, ou em qual minuta/
    contrato específico) pra corrigir com segurança em vez de adivinhar.
  - Revisão visual completa de TODOS os popups desta ficha (padronizar
    máscara+indicador "válido" de CPF/CNPJ/telefone/e-mail em todos,
    remover botão redondo de fechar, mover ação principal pra esquerda/
    "Sair" pra direita no rodapé em todos) — toquei nos mais usados ao
    longo das últimas rodadas, mas não fiz uma varredura sistemática
    confirmando os ~15 popups construídos nesta sessão inteira.
  - Documento de Design System (novo arquivo pra subir no projeto) —
    não criado nesta rodada.

NOVIDADES (Beta v1.57.0) — lote de ajustes na ficha do imóvel/contrato.

  FILTRO DE ALERTA EM IMÓVEIS (NOVO, pedido explícito) — o mecanismo
  paralelo com banner (só acessível vindo da Visão Geral) virou um
  filtro de verdade, visível no overlay de busca de Imóveis: "Todos" /
  "Todos com alerta" / "Aguardando assinatura" / "Precisa revisão" /
  "Contrato vencido". Ao entrar pelo card "contratos com alerta" da
  Visão Geral, marca automaticamente "Todos com alerta".

  BOX IMÓVEL → DETALHES — campos obrigatórios marcados com * (mesmo
  padrão dos demais formulários). Rótulo "Valor do aluguel" → "Expectativa
  aluguel" (é o valor anunciado/esperado do imóvel, não o valor do
  contrato em si). Rótulo "Energia solidária" → "Energia" + ícone "i"
  explicando do que se trata.

  BOX CONTRATO → HISTÓRICO — CORRIGIDO: virou popup no mesmo padrão
  bottom-sheet dos demais (antes era um modal centralizado no meio da
  tela, único remanescente do padrão antigo).

  FORMULÁRIO COMPLETO DE CONTRATO — WhatsApp/E-mail/Endereço do
  locatário/Profissão/Estado civil viraram obrigatórios com * (eram os
  únicos campos realmente necessários pra minuta que ainda não tinham a
  marcação — Locatário/CPF/Valor/Vencimento já eram desde antes).

  CONTRATO ASSINANDO — Mais ações reduzido pra só 4 opções (pedido
  explícito): Compartilhar IPTU, Histórico, Locação, Alterar Status. As
  demais (Reajuste/Dados locatário/Detalhes/Outros contratos) não fazem
  sentido ainda pra um contrato que nem foi assinado — continuam
  existindo, só não aparecem nesse status.

  "LOCAÇÃO" → "DADOS NOVO CONTRATO" — CORRIGIDO: agora abre o formulário
  completo JÁ PREENCHIDO com os dados que o locatário enviou pelo link
  (reaproveita editarContrato() já existente), quando já existir um
  contrato Assinando pra este imóvel; abre em branco só se realmente não
  houver contrato ainda. Mensagem de confirmação ("Confirma a criação de
  um novo contrato...") removida — abre direto. Salvar continua usando
  saveContrato(), que JÁ tinha um mecanismo de diff completo (compara
  ~20 campos e grava só o que mudou no histórico) — não precisei
  construir nada novo aqui, só garantir que o formulário certo abre.

  ALTERAR STATUS — CORRIGIDO/AMPLIADO: opções "Marcar como Ativo" e
  "Marcar como Assinando" adicionadas (antes só tinha Suspender/
  Encerrar/Excluir). A lista de opções nunca mostra o status em que o
  contrato já está — montada dinamicamente. Sincronização de status do
  imóvel ampliada: além do caso "sem contrato operacional → Vago", agora
  também cobre "virou Ativo → imóvel Alugado" e "virou Assinando →
  imóvel Assinando".

NOVIDADES (Beta v1.56.0) — 3 dos 4 ajustes pedidos nesta rodada. O 4º
("mesmo erro" ao salvar tanto no link público quanto na criação de
contrato pelo App) NÃO foi corrigido — a mensagem não veio com o texto/
print do erro desta vez, e depois dos bugs de tipo de dado já corrigidos
em v1.53.0 (boolean) não dá pra adivinhar qual é sem o texto exato.
Preciso do print/mensagem completa pra continuar esse item específico.

  ALERTA "CONTRATOS AGUARDANDO ASSINATURA" (Visão Geral) — CORRIGIDO:
  antes usava um filtro paralelo por contrato
  (filtrarImoveisPorAlertaContrato) com um banner explicativo na tela.
  Agora usa o filtro REAL de status do imóvel ("Assinando", existente
  desde v1.50.0 — sincronizado automaticamente quando um contrato nasce
  ou muda pra esse status) e não mostra mais banner nenhum — só filtra
  e mostra a lista limpa, como pedido.

  "GERAR MINUTA" (menu Locação) — CORRIGIDO: BUG REAL relatado — a
  geração pelo botão nunca gravava nada no histórico do contrato.
  Corrigido: grava uma entrada em historico_contrato (tipo 'anexo' —
  enum já existente, literalmente pra isso) com o nome do arquivo e o
  modelo usado.

  DOCUMENTOS DA FICHA — NOVO (pedido explícito): cada documento listado
  agora é clicável — abre numa aba nova via signed URL (mesma função
  que o próprio Cofre já usa pra isso, 120s de validade). Precisou
  buscar bucket/storage_path a mais na consulta (só isso mudou na
  query, resto igual).

NOVIDADES (Beta v1.55.0) — conclui as pendências da v1.54.0.

  "DETALHES" DO IMÓVEL RECONSTRUÍDO — deixou de reaproveitar o modal de
  edição completo (que ficava no padrão antigo, com fotos/sócios) e
  virou popup de verdade, no mesmo padrão visual de "Dados locatário"
  (bottom-sheet). Fotos e divisão societária NÃO aparecem aqui de
  propósito (pedido explícito) — fotos continuam só na Vitrine/
  lightbox; divisão tem seu próprio popup (Divisão Societária →
  Alterações). Salvar reaproveita 100% sincronizarImovelSupabase() já
  existente (mesma função do formulário completo) — nenhuma lógica de
  sync nova, nenhum risco de divergir do que o formulário completo já
  validava.

  DOCUMENTOS — CORRIGIDO: chips de tipo (Fotos/Seguro/Contrato(s)) agora
  só aparecem se existir pelo menos 1 documento de verdade daquele tipo
  (fotos checadas local via imo.fotos; seguro/contratos checados via
  consulta ao Cofre antes de desenhar os botões) — antes apareciam
  sempre, mesmo vazios.

  BUSCA POR TEXTO em Financeiro e Cobrança (NOVA, pedido explícito) —
  mesmo padrão de Imóveis: locatário/endereço/bairro/cidade/
  empreendimento. Filtros que já existiam (Locatário, Imóvel,
  Competência, Agrupado por) continuam intactos, nada foi removido.

  "DADOS NOVO CONTRATO" — botão renomeado (era "Cadastrar novo
  contrato"). Valor do aluguel já era obrigatório no formulário
  (conferido, sem mudança necessária). Campo de endereço do locatário
  virou textarea maior — o endereço completo que o interessado digita
  no link público não cabia inteiro num input de 1 linha.

  "GERAR MINUTA" NO MENU LOCAÇÃO (NOVA) — reaproveita 100% a mesma
  regra de prontidão e preenchimento que "Gerar Minuta" da ficha do
  contrato já usa (avaliarProntidaoContratoParaMinuta/
  montarValoresPlaceholdersMinuta/preencherMinutaDocx — nenhuma lógica
  duplicada); se faltar dado, avisa exatamente quais. Diferença: em vez
  de subir pro bucket antigo (contratos-documentos) e anexar em
  con.anexos, esta sobe pro COFRE de verdade — cofre-documentos +
  cofre_documentos + cofre_documento_vinculos, como um documento
  "Minuta Contratual" já vinculado ao contrato (categoria resolvida por
  nome, se existir; segue sem categoria se não encontrar, não bloqueia
  a geração).

  CORRIGIDO NO FECHAMENTO — durante a própria montagem desta entrega, a
  inserção da função gerarMinutaNoCofre() acabou apagando por engano a
  linha de declaração de popularFiltroSelect() (função usada em
  dezenas de lugares — Imóveis/Contratos/Financeiro/etc.), quebrando a
  sintaxe do arquivo inteiro. Pego e corrigido no próprio gate de
  qualidade antes de publicar — nunca chegou a uma versão entregue.

NOVIDADES (Beta v1.54.0) — continuação das pendências da v1.53.0. Ainda
ficam de fora desta rodada: "Dados Novo Contrato" com campos obrigatórios
completos; opção "Gerar minuta" automática/validada; box Documentos só
com tipos que existem de verdade; reconstrução do popup "Detalhes" do
imóvel no padrão "Dados locatário" (sem fotos/sócios); filtro de
Financeiro/Cobrança com busca por texto igual Imóveis. Ver HANDOFF.

  RENOMEADO — "Iniciar Contratação"/"Iniciar contratação" → "Locação" em
  todos os textos visíveis (botões do box Contrato/Sem Contrato e
  título do modal) — o fluxo em si (iniciarProcessoContratacao) não
  mudou, só o rótulo.

  FORMULÁRIO PÚBLICO (Vitrine → contratar) — campo "Observação"
  removido (pedido explícito). TODOS os demais campos viraram
  obrigatórios (e-mail, endereço/número/complemento, UF, CEP,
  profissão, estado civil — bairro/cidade já eram desde v1.51.0),
  validados na mesma checagem de "primeiro campo inválido" que já
  existia.

  MIGRATION NOVA (migration_v1_54_0_atualizar_contrato_assinando_
  existente.sql, NÃO APLICADA — precisa rodar manualmente) — CORRIGE
  fn_gerar_contrato_de_processo() pra: (1) se já existir um contrato
  "assinando" pro mesmo imóvel, ATUALIZAR esse contrato com os dados
  reenviados em vez de criar um duplicado; (2) em qualquer um dos dois
  casos (criação ou atualização), gravar os dados enviados como um
  registro em historico_contrato — CONFIRMADO lendo a função atual que
  ela nunca gerou minuta automática (isso já tinha sido corrigido no
  bot antes) — esta migration reforça esse comportamento nesse ponto
  específico e resolve a duplicação relatada.

  DIVISOR PADRÃO — CORRIGIDO: a linha divisória acima do botão "Mais
  ações" (que já existia no cabeçalho do imóvel) estava faltando nos
  boxes Financeiro/Serviços/Divisão Societária/Contrato/Sem Contrato —
  agora todos os boxes da ficha têm exatamente o mesmo padrão
  (border-t border-slate-100, acima do toggle, antes do painel de
  ações).

  "< VOLTAR" — adicionado no topo de Síndicos/Manutencistas/
  Administradoras (as 3 telas alcançáveis pelo Mais ações → Vincular
  síndico/Vincular manutencista do box Serviços), voltando pra
  Configurações.

  RECIBO/ESTORNAR — reposicionados pro final do card (fileira
  horizontal lado a lado), mesmo padrão de Dar Baixa/Excluir — antes
  ficavam flutuando numa coluna ao lado do texto.

NOVIDADES (Beta v1.53.0) — LOTE DE CORREÇÃO DE BUGS CRÍTICOS relatados
em produção. Esta entrega é SÓ os bugs — a lista grande de novos ajustes/
funcionalidades pedida na mesma mensagem (renomear "Iniciar Contratação"
pra "Locação", gerar minuta automática quando os dados estiverem
completos, filtro de Documentos só com tipos que existem de verdade,
campos obrigatórios no link público, atualizar contrato Assinando
existente em vez de criar novo, mudança de textos em Imóveis/Vitrine,
formulário de Detalhes do Imóvel no padrão novo, "< Voltar" em
Síndicos/Administradoras, filtro de Financeiro/Cobrança no padrão de
Imóveis, etc.) FICOU PENDENTE — não coube com a mesma rigor de validação
nesta rodada. Ver HANDOFF para a lista completa.

  CORRIGIDO — BUG CRÍTICO: "invalid input syntax for type boolean: Sim".
  condominio_locatario é boolean no banco (confirmado no schema);
  salvarDetalhesContrato() mandava a STRING 'Sim'/'Não' direto em vez de
  converter — só locatario_paga_iptu (campo ao lado) já convertia
  certo. Toda tentativa de salvar Detalhes do Contrato falhava.

  CORRIGIDO — CAUSA RAIZ de dois sintomas relatados separadamente
  ("observação sumida" em Dados locatário/Detalhes do contrato,
  "reajuste sem detalhes" no histórico): verHistoricoContrato() só
  renderizava h.alteracoes[] — nunca h.descricao. Todo histórico
  gravado pelos popups novos (Dados locatário/Detalhes/Reajuste/Alterar
  status) usa "descricao" (texto livre, com a observação já embutida
  no texto), então a entrada aparecia na lista mas SEM NENHUM TEXTO
  visível. Corrigido: a tela agora mostra h.descricao quando presente,
  além de continuar mostrando h.alteracoes[] quando houver.

  CORRIGIDO — BUG CRÍTICO: "confirma a exclusão do contrato, mas ele
  continua no banco". excluirContrato() disparava o delete() sem
  "await" e sem checar erro de verdade (só logava no devlog interno,
  nunca avisava a pessoa) — a lista local era filtrada e "sucesso"
  aparecia ANTES de saber se o banco realmente apagou. Agora aguarda de
  verdade e só confirma sucesso depois da confirmação do banco.

  CORRIGIDO — CAUSA DO 409 CONFLICT "especialmente em Assinando":
  CONFIRMADO no schema — processos_contratacao.contrato_id_fkey NÃO tem
  ON DELETE CASCADE (diferente de historico_contrato/
  divisao_repasse_contrato/mensalidades, que têm). Todo contrato
  nascido da Vitrine (status Assinando) tem uma linha em
  processos_contratacao apontando pra ele, travando a exclusão com FK
  violation. Corrigido: desvincula essa referência (contrato_id = null
  no processo — o processo em si não é apagado) antes de excluir.

  CORRIGIDO — BUG REAL: escolher "Excluir contrato" + "excluir os
  pendentes" no popup de Alterar Status não fazia nada (nem os itens
  nem o contrato eram apagados, alegando itens pendentes). Causa: o
  código retornava pro caminho de exclusão ANTES de processar a decisão
  sobre os pendentes — eles nunca eram de fato excluídos, então
  excluirContrato() sempre encontrava mensalidades e bloqueava
  corretamente (a trava em si nunca esteve errada). Corrigido: os
  pendentes agora são resolvidos SEMPRE primeiro, pra qualquer ação
  escolhida, só depois decide o que fazer com o contrato.

NOVIDADES (Beta v1.52.0) — TERCEIRO E ÚLTIMO LOTE do pedido grande de
ajustes finos (conclui o que ficou pendente em v1.51.0).

  DIVISOR PADRÃO — espaçamento entre header e "Mais ações" padronizado
  (mt-2/pt-2) em todos os boxes da ficha do imóvel.

  DIVISÃO SOCIETÁRIA → ALTERAÇÕES (NOVA) — popup único com as duas
  divisões (imóvel + contrato), cada uma com seu próprio "Salvar".
  Persistência real: imoveis.divisao (update direto) e a RPC
  substituir_divisao_repasse_contrato (mesma que o formulário completo
  de contrato já usava — reaproveitei a resolução pessoa_id/nome_externo
  que sincronizarContratoSupabase() já fazia, não inventei regra nova).
  CORRIGIDO NO CAMINHO — BUG REAL: o resumo da Divisão Societária lia
  "contratoPrincipal.divisao", campo que nunca existiu no contrato (a
  divisão do contrato vive em divisao_repasse_contrato, carregada como
  con.divisaoRepasse — array, não objeto). Por isso a divisão do
  contrato nunca aparecia no resumo, mesmo cadastrada.

  ALTERAR STATUS DO CONTRATO (NOVO, Mais ações) — popup com Suspender/
  Encerrar/Excluir + data + observação (vira historico_contrato) +
  tratamento de pendências financeiras quando há mensalidades
  'Inadimplente' vinculadas (dar baixa sem pagamento = 'Isento', já
  existente; dar baixa como pago = 'Pago'; excluir = remove os
  lançamentos). "Excluir" delega pro excluirContrato() já existente
  (já bloqueia se houver mensalidades — não dupliquei essa trava). Se o
  imóvel ficar sem NENHUM contrato operacional após a mudança, volta a
  "Vago" automaticamente.

  PADRÃO VISUAL UNIFICADO — "Iniciar Contratação" e o modal de "Recibo"
  corrigidos pro mesmo padrão bottom-sheet de "Dados locatário" (antes
  centralizados). Conteúdo interno do Recibo (tema escuro, preview de
  PDF) não foi alterado — só a posição/comportamento de abrir/fechar.

  BUSCA SEM PRECISAR FECHAR — tocar fora do painel (no fundo escurecido)
  agora fecha os overlays de busca de Imóveis e Vitrine, deixando a
  lista já filtrada tocável na hora, sem precisar mirar no X.

  ABA FINANCEIRO — pill Lista/Atrasos e título "Recebimentos" removidos;
  descrição curta + ícones reordenados (Gerar Mês/Buscar/Conciliar,
  direita→esquerda — Gerar Mês é o "+" desta aba, já que não existe
  "criar 1 mensalidade avulsa"). Filtros (Locatário/Competência/
  Empreendimento/Imóvel) migraram pro overlay de busca, mesmo
  componente de Imóveis. Itens a receber: ícone de lixeira isolado
  removido, "Excluir" virou botão par de "Dar Baixa"; itens já baixados
  ganharam o mesmo padrão de par de botões (Recibo/Estornar).

  ABA COBRANÇA — pill Lista/Atrasos e título "Atrasos" removidos;
  descrição + lupa no mesmo padrão. Os 3 filtros que já existiam
  (Agrupado por/Competência/Locatário) migraram pro overlay, todas as
  opções preservadas.

  ABA DISTRIBUIÇÃO — título "Distribuições" removido; descrição + ícones
  (lupa/+) no mesmo padrão. Filtro (Sócio/Tipo/Mês/Ano) migrou pro
  overlay. "Registrar Retirada" virou popup do "+", mesmo padrão de
  "Dados locatário" — só fecha ao salvar ou no X; reaproveita 100%
  registrarRepasse() já existente (o popup só sincroniza os valores
  escolhidos pros campos reais antes de chamar a função, sem duplicar
  lógica de negócio).

  CORRIGIDO NO FECHAMENTO — duas rodadas de IDs duplicados encontradas e
  corrigidas durante o próprio gate de qualidade desta entrega (stubs
  "hidden" que deveriam ter sido removidos ao migrar filtros pros
  overlays de Financeiro e Distribuição, mas ficaram órfãos por engano)
  — nenhuma duplicata real chegou a esta versão final.

NOVIDADES (Beta v1.51.0) — segundo lote do pedido grande de ajustes finos
(continuação da v1.50.0). Muitos itens do pedido original ainda ficaram
de fora — ver HANDOFF/changelog para a lista completa do que falta.

  BOX FINANCEIRO (ficha do imóvel) — clique no item removido (pedido
  explícito). "Inadimplente" agora exibe como "Pendente" (só rótulo —
  dado real no banco continua 'Inadimplente'). Botão renomeado
  "Histórico financeiro" → "Financeiro"; abre a aba Mensal cheia já
  filtrada por este imóvel, com "< Voltar" funcional
  (abrirFinanceiroFiltradoImovel/voltarDoFinanceiroFiltrado, NOVAS) —
  volta pra ficha de origem, não pra lista.

  CORRIGIDO — "REAJUSTE" ABRIA O FORMULÁRIO INTEIRO: a v1.49.0 tentou
  reaproveitar o painel de reajuste do formulário completo, mas ele só
  existe DENTRO do formulário inteiro — não era o "menu suspenso curto"
  pedido. Reescrito como popup dedicado (valor, %, vigência,
  observação), persiste direto em contratos.valor/valor_anterior/
  reajuste_aplicado + historico_contrato, sem abrir o formulário.

  CORRIGIDO — BUG REAL: fotos do imóvel não apareciam no box Documentos
  porque o filtro "Fotos" só consultava o Cofre — mas as fotos vivem em
  imo.fotos (mecanismo próprio do app, usado em toda parte). Corrigido:
  "Fotos" lê imo.fotos direto, mostra grid com lightbox. "vigente"
  removido dos rótulos dos chips (Seguro/Contrato, não mais "Seguro
  vigente"/"Contrato vigente"). Documentos de cada categoria agora
  ordenados decrescente por vigência.

  SERVIÇOS — "Vincular prestadores serviços" (1 botão) virou 2 botões
  separados: "Vincular síndico" e "Vincular manutencista".

  CONTRATO ASSINANDO — ganhou "Iniciar contratação" no Mais ações
  (reaproveita iniciarProcessoContratacao() já existente).

  FORMULÁRIO PÚBLICO (Vitrine → contratar) — bairro e cidade agora
  obrigatórios. Mensagem de confirmação parou de mencionar
  "imobiliária" — agora diz "O locador foi notificado e em breve dará
  um retorno". Botão fechar agora tenta fechar a aba de verdade
  (window.close()) em vez de redirecionar pra landing page; se o
  navegador não permitir (guia digitada manualmente, sem histórico de
  navegação — restrição de segurança do próprio navegador, não é algo
  que dá pra contornar), mostra um aviso simples "Você já pode fechar
  esta aba" em vez de insistir num redirecionamento que não fazia
  sentido.

  DESCRIÇÕES CURTAS — Imóveis e Vitrine ganharam texto curto à esquerda
  dos ícones (mesmo padrão textual de Síndicos, mas na mesma linha dos
  ícones, não abaixo). Texto da Vitrine também ficou mais claro sobre o
  que a aba faz.

  PENDENTE (não implementado nesta rodada — pedido original tinha ~30
  itens, ver HANDOFF): Alterar status do contrato (suspender/encerrar/
  excluir com tratamento de pendências financeiras); divisor padrão
  entre header e Mais ações em todos os boxes; Divisão Societária →
  Alterações (editar divisão de imóvel e contrato no mesmo popup);
  unificação visual de todos os popups suspensos no padrão "Dados
  locatário"; busca de imóveis sem precisar fechar manualmente; reforma
  completa das abas Financeiro (remover seletores Lista/Atrasos, lupa de
  filtro, ordem de ícones, botões Excluir/Recibo/Estornar padronizados),
  Cobrança (remover seletores, lupa, descrição) e Distribuição (remover
  título, filtro padrão, botão + com popup de lançamento).

NOVIDADES (Beta v1.50.0) — ajuste pontual na Visão Geral + verificação
do fluxo de Iniciar Contratação.

  VISÃO GERAL → IMÓVEIS (pedido explícito) — os 2 cards de atenção
  "N contratos aguardando assinatura" e "N contratos com alerta" não
  levam mais para Contratos: agora levam para Imóveis, filtrando só os
  imóveis cujo contrato bate com o alerta clicado.
  filtrarImoveisPorAlertaContrato() (NOVA) reaproveita 100% dos helpers
  já existentes (obterContratosContextuaisDoImovel/
  contratoAguardandoAssinatura/contratoPrecisaRevisao/contratoVencido —
  nenhuma lógica de alerta duplicada). Um banner aparece no topo da
  lista ("Mostrando imóveis com contrato aguardando assinatura/em
  alerta") com botão "Limpar" (limparFiltroAlertaContratoImoveis, NOVA)
  pra voltar à lista normal.

  VERIFICADO (sem mudança de código) — o fluxo "Iniciar Contratação"
  (Cadastrar novo contrato → Gerar link para coleta de dados para
  minuta → Abrir WhatsApp com os dados pedidos → Conferir minuta
  padrão, as 3 últimas condicionadas a existir minuta padrão pro
  imóvel) já estava implementado desde a v1.48.0 e continua intacto —
  as mudanças da v1.49.0 não o afetaram. Conferido linha a linha contra
  o pedido, nenhuma regressão encontrada.

  CORRIGIDO — BUG CRÍTICO relatado: "Could not find the '_local' column
  of 'contratos' in the schema cache", acontecia em "Dados locatário" e
  "Detalhes" do contrato. Causa raiz: salvarDadosLocatarioContrato()/
  salvarDetalhesContrato() removiam a chave __local do objeto via
  destructuring, mas depois a RECOLOCAVAM no objeto final antes de
  mandar pro Supabase ({ ...patchDb, __local }) — a "coluna" __local
  literalmente ia dentro do update(). Corrigido: salvarObservacaoContrato()
  agora recebe o patch do banco e o patch local como DOIS parâmetros
  separados — __local nunca mais chega perto de uma chamada ao Supabase.

  CORRIGIDO — campo "Descrição do Imóvel" virou obrigatório, com * no
  mesmo padrão dos demais campos obrigatórios do formulário.

  CORRIGIDO — imóvel com contrato Assinando agora tem status próprio
  "Assinando" (antes ficava "Vago" durante todo o processo de
  contratação, confuso). Novo valor no filtro de Status. Sincronizado
  em dois pontos: saveContrato() (fluxo manual pelo App — corrigido pra
  não marcar sempre "Alugado" cego, agora olha o status real do
  contrato que está sendo salvo) e fn_gerar_contrato_de_processo()
  (fluxo Vitrine/bot — corrigido via migration separada, ver
  migration_v1_50_0_status_imovel_assinando.sql, PRECISA SER APLICADA
  MANUALMENTE, o primeiro passo dela — ALTER TYPE ADD VALUE — tem que
  rodar isolado por restrição do Postgres).

NOVIDADES (Beta v1.49.0) — LOTE DE AJUSTES FINOS NA FICHA DO IMÓVEL E
LISTA (continuação da Fase 2, v1.48.0).

  LISTA/FICHA — CABEÇALHO ÚNICO: montarCabecalhoImovelHtml() (NOVA),
  reaproveitada pelo card da lista E pelo topo da ficha — mesma
  formatação byte a byte, como pedido. Ícone 👤 removido. Empreendimento
  + tipo reduzidos pro mesmo tamanho dos demais textos. Linha de
  situação (locatário · aluguel/mês) ganhou truncate — nunca mais quebra
  linha. "Editar imóvel" removido do topo da ficha.

  "DETALHES" (renomeado de "Detalhes do imóvel" — tirei a palavra
  "Imóvel", pedido explícito) — ao fechar, volta pra tela que abriu o
  modal (fichaOrigemAoEditarImovel, NOVA variável), não sempre pra
  lista. "Excluir" removido do Mais ações da ficha (só "Detalhes",
  "Copiar resumo", "Criar contrato" quando Vago, "Enviar IPTU" quando
  aplicável).

  ÍCONES (Imóveis e Vitrine) — busca/vitrine/+ alinhados à direita,
  ordem direita→esquerda: adicionar, buscar, vitrine (pedido explícito).
  Ícone da Vitrine trocado pro mesmo do "Exportar vitrine". Na Vitrine:
  texto explicativo entrou na mesma linha dos ícones (esquerda,
  centralizado); "Iniciar Contratação" removido de cada card (o fluxo
  continua existindo só pela ficha do imóvel).

  BOX CONTRATO — REESCRITO:
  - clique no corpo NÃO abre mais a ficha completa do contrato (pedido
    explícito) — Mais ações agora é a única porta de entrada pra
    detalhe/edição;
  - Mais ações alinhado à direita, TODAS as opções em cinza (pedido
    explícito — nada de verde/âmbar/azul diferenciando ação, em nenhum
    Mais ações da ficha, incluindo os das telas de Contrato/Ficha do
    Contrato standalone);
  - "Reajuste" CORRIGIDO: parou de usar prompt() + insert direto — agora
    reabre o formulário de edição do contrato com o painel de reajuste
    que JÁ EXISTIA (Novo Valor/% Reajuste/Vigência da alteração, dentro
    de #secao-avancada-contrato) já expandido — reaproveita 100%, não
    reescrevi a lógica de cálculo;
  - "Dados locatário" (NOVA) — menu suspenso com nome/CPF-CNPJ/pessoa de
    contato/WhatsApp/e-mail/endereço/profissão/estado civil, editável,
    Fechar/Salvar. Observação é campo aberto que sempre vira uma entrada
    em historico_contrato quando preenchida;
  - "Detalhes" (NOVA, contrato) — menu suspenso com início/fim
    vigência, desconto energia, locatário paga IPTU/condomínio (com os
    valores reais do imóvel), administradora, forma de pagamento,
    índice de reajuste, editável, Fechar/Salvar, mesma regra de
    observação→histórico;
  - "Outros contratos" (NOVA) — lista os contratos Finalizados deste
    imóvel, ordenados decrescente por data de fim de vigência, cada um
    com seu próprio Dados locatário/Detalhes/Históricos — 100% somente
    leitura (nenhum botão Salvar nessas variantes).

  BOX FINANCEIRO — compactado (linhas mais finas, sem borda por item,
  ocupa bem menos altura). Ganhou Mais ações (cinza, à direita) com
  "Histórico financeiro" (abre a aba Financeiro cheia, já filtrada pro
  imóvel).

  BOX DOCUMENTOS — CORRIGIDO: link direto pro Cofre removido (pedido
  explícito "retirar por enquanto"). Virou filtro real e inline —
  chips "Fotos" / "Seguro vigente" / "Contrato vigente" / "Contrato
  anterior" (um por contrato Finalizado), cada um consultando
  cofre_documento_vinculos + cofre_documentos (mesma tabela/RLS do
  Cofre) e mostrando a lista ali mesmo, sem sair da ficha.
  contarDocumentosCofrePorTipo() foi REMOVIDA (não só desativada) —
  função antiga do resumo por contagem, substituída de verdade pelo
  filtro novo.

  BOX SERVIÇOS — ganhou Mais ações (cinza, à direita) com "Vincular
  prestadores serviços" (leva pras telas globais de Síndicos/
  Manutencistas, onde o vínculo por empreendimento já é gerenciado —
  não recriei essa lógica) e "Chamar manutenção" (mesma ação de
  sempre). Ícone verde da chave-inglesa ao lado do contato removido.

  BOX DIVISÃO SOCIETÁRIA (NOVA) — abaixo de Serviços, mostra a divisão
  do imóvel (imo.divisao, já existia) e do contrato vigente
  (con.divisao, já existia) — não inventei campo novo, só exibi o que
  já era salvo.

  "TODO MENU SUSPENSO FECHADO VOLTA PRA TELA QUE ORIGINOU" — os 5
  popups novos desta versão (Dados locatário/Detalhes do contrato/
  Outros contratos/Vincular prestadores + o filtro de Documentos) são
  overlays que renderizam POR CIMA da tela atual sem trocar de aba —
  fechar só remove o overlay, a tela de baixo nunca muda. "Detalhes" do
  imóvel (que usa switchTab de verdade) ganhou o mecanismo explícito
  fichaOrigemAoEditarImovel pra voltar certo.

NOVIDADES (Beta v1.48.0) — FASE 2 COMPLETA: FICHA DO IMÓVEL (Contrato,
Financeiro, Documentos, Serviços). Continuação da Fase 1 (v1.47.0,
redesenho da lista de Imóveis).

  FICHA VIROU TELA ÚNICA — a barra de sub-abas (Resumo/Contrato/
  Financeiro/Documentos/Histórico) foi removida. setFichaImovelTab()
  foi APAGADA de propósito (não deixada órfã) — substituída por
  renderFichaImovelUnica(), que desenha tudo numa rolagem contínua de
  boxes por tema. Nenhuma capacidade sumiu, só mudou de forma:
  resumo/contrato viraram os boxes de Contrato; financeiro virou o box
  Financeiro; documentos virou o box Documentos (linkado ao Cofre);
  histórico virou ação dentro do "Mais ações" de cada contrato
  (verHistoricoContrato(), inalterada).

  BOX CONTRATO — clicar no corpo do card abre a ficha do contrato direto
  (removido o atalho "Abrir contrato →"). Mostra vigência (início até
  fim) e administradora, quando houver. Badge de status ao lado do
  título (não ocupa mais linha própria). Alerta virou ícone de triângulo
  vermelho clicável (mantém verAlertasContrato() já existente). Cada
  contrato ganhou seu próprio "Mais ações":
    - Compartilhar IPTU (NOVA) — copia o código do IPTU e abre o
      WhatsApp pro locatário DESTE contrato; avisa em tela se faltar
      WhatsApp ou código;
    - Reajuste (NOVA) — lança uma entrada em historico_contrato
      (tipo='reajuste', enum já existente) e atualiza o valor do
      contrato, persistido direto no Supabase;
    - Alteração contratual — reaproveita abrirEdicaoContratoContextual()
      já existente (mesma ação que antes se chamava "Editar contrato");
    - Históricos — reaproveita verHistoricoContrato() já existente.

  SEM CONTRATO — box em branco com "Mais ações → Iniciar contratação",
  chamando iniciarProcessoContratacao() já existente (a mesma rotina que
  já existia na Vitrine).

  MODAL "INICIAR CONTRATAÇÃO" REESCRITO (abrirModalOpcoesContratacao) —
  1ª opção agora é "Cadastrar novo contrato" (fecha este menu e abre o
  modal de contrato). "Gerar Link" renomeado para "Gerar link para
  coleta de dados para minuta". Nova opção "Conferir minuta padrão"
  (baixarMinutaPadraoImovel(), NOVA — baixa o arquivo do modelo em
  branco, sem preencher nada, não confundir com gerarMinutaContrato()).
  As 3 últimas opções só aparecem se existir minuta padrão pro imóvel
  (encontrarMinutaParaImovel(), já existente, reaproveitada — não criei
  um segundo conceito de "minuta padrão"); senão, avisa e linka pra
  Configurações → Minutas.

  CADASTRO DE CONTRATO MODALIZADO — mesmo tratamento que o de Imóveis
  ganhou na Fase 1: form-contrato-wrapper virou overlay bloqueante
  (fixed inset-0), só fecha ao salvar ou no X. abrirFormularioContrato/
  cancelarEdicaoContrato/editarContrato não mudaram (só alternam a
  classe "hidden" do wrapper, como sempre).

  BOX FINANCEIRO (renomeado de "Últimos recebimentos") — mostra só os
  últimos 3; cada item abre abrirRecebimentoDetalhe() (NOVA), um recorte
  de UM recebimento numa tela própria com "< Voltar". Os campos usam A
  MESMA convenção de IDs que renderMensalidades() já usa (banco-ID/
  data-ID/valor-ID/obs-ID/energia-ID/multa-ID/taxa-admin-ID), então
  liquidarMensalidade()/recalcularTotalBaixaExtra()/
  alternarMenuBaixaExtra()/excluirLancamentoMensal()/
  abrirModalOpcoesRecibo() funcionam sem nenhuma alteração nelas —
  nenhuma lógica de negócio duplicada, só a renderização de 1 item em
  vez da lista inteira. LIMITAÇÃO CONHECIDA: como os IDs são iguais aos
  da lista completa, se a MESMA mensalidade estiver simultaneamente
  expandida na aba Financeiro completa E aberta neste recorte, pode
  haver 2 elementos com o mesmo id no DOM ao mesmo tempo (o
  getElementById pega o primeiro em ordem de documento). Cenário raro
  na prática (exige visitar as duas telas pra mesma competência sem
  re-render no meio) — registrado aqui e no HANDOFF, não escondido.

  BOX DOCUMENTOS — resumo por tipo (contagem real, assíncrona, via
  cofre_documento_vinculos + cofre_documentos + cofre_categorias — MESMA
  tabela/RLS que o próprio Cofre já usa). Clique abre o Cofre já no
  contexto do imóvel (contrato de URL da Fase 2 anterior, inalterado).

  BOX SERVIÇOS (NOVA) — mostra síndico e manutencista já vinculados ao
  imóvel, com atalho de WhatsApp pra cada um.

  "DADOS RÁPIDOS" — removido (pedido explícito).

  "DETALHES DO IMÓVEL" — adicionado ao "Mais ações" do cabeçalho da
  ficha. DECISÃO REGISTRADA: reaproveita o MESMO modal de edição que
  "Editar imóvel" já usa (editarImovel()), em vez de duplicar ~250
  linhas de campos/upload de foto/sócios numa segunda tela paralela.
  Funcionalmente entrega o que foi pedido (todos os dados cadastrados,
  editável, com salvar) sem duplicar formulário.

NOVIDADES (Beta v1.47.0) — REDESENHO DA ABA IMÓVEIS (Fase 1 de um pedido
maior — Fase 2, a ficha do imóvel/contrato/financeiro/documentos/
serviços, ainda não foi implementada, ver próxima entrega).

  CABEÇALHO — contador de imóveis (vagos/alugados/total) removido do
  topo; título "Imóveis" removido; pill Lista/Vitrine removida. No lugar:
  grupo de 3 ícones — Buscar (lupa) / Vitrine / Adicionar (+).

  BUSCA/FILTRO EM OVERLAY (novo #modal-busca-imoveis, mesmo padrão
  visual do #modal-seletor-imovel já existente, mas SEM lista — aqui
  filtra o que já está atrás, não escolhe 1 item): Status (rótulo sem
  "Apenas" — "Vago"/"Alugado"), Empreendimento, e um campo de texto
  livre NOVO que busca por locatário (via
  obterContratoPrincipalDoImovel, já existente) além de endereço/bairro/
  complemento/número/empreendimento. IDs imoveis-filtro-emp/status
  preservados (só mudaram de lugar no DOM) — renderImoveis() não
  precisou de reescrita da lógica de filtro, só ganhou a condição de
  texto a mais.

  CARD DA LISTA REDESENHADO — antes: status/tipo/valor/endereço + fileira
  de miniaturas de foto. Agora: avatar (foto real do imóvel se houver,
  senão ícone de casinha) + linha de locatário/aluguel do contrato
  principal (reaproveita obterContratoPrincipalDoImovel), no mesmo
  espírito da ficha. Clique continua abrindo a ficha (Lista → Ficha →
  Ação, inalterado desde v1.45.0).

  AGRUPAMENTO POR EMPREENDIMENTO — quando a empresa tem mais de 10
  imóveis cadastrados (contagem total, não do resultado filtrado), a
  lista passa a agrupar por empreendimento com cabeçalho e contagem;
  carteiras menores continuam em lista plana, como sempre foi.

  CADASTRO DE IMÓVEL — DESFEITO O WIZARD DE 3 ETAPAS (pedido explícito):
  virou um único formulário rolável (as 3 seções continuam existindo
  como agrupamento visual — Localização/Valores/Extras — só não têm mais
  botão Próximo/Voltar nem indicador de passo). O formulário inteiro
  virou modal bloqueante (fixed inset-0 + fundo escurecido) — não dá
  pra navegar a lista por trás até salvar ou fechar no X. Funções antigas
  de navegação de passo (avancarStepImovel/voltarStepImovel/
  irParaStepImovel) ficaram sem chamador no HTML — preservadas, não
  apagadas; resetStepsImovel() virou no-op de propósito (se ainda
  chamasse a navegação antiga, voltaria a esconder as seções 2 e 3).

  VITRINE — pill Lista/Vitrine removida (chega-se pelo ícone da aba
  Imóveis agora); breadcrumb "< Imóveis" no topo pra voltar. Ganhou lupa
  própria (#modal-busca-vitrine, mesmo padrão) com Status (sem "Apenas")
  e Empreendimento — o card de filtro fixo que existia foi removido da
  tela principal.

  PENDENTE (Fase 2, não implementada nesta entrega): tudo relacionado à
  ficha do imóvel — esconder a barra de sub-abas ao entrar; nova tela
  "Detalhes do Imóvel" (dados cadastrais completos, editável); boxes de
  resumo por tema; box Contrato com vigência/administradora, menu "Mais
  ações" (Compartilhar IPTU/Reajuste/Alteração contratual/Históricos),
  alerta com triângulo vermelho, fluxo "Iniciar contratação" reaproveitando
  a rotina da Vitrine com as 4 opções pedidas; box Financeiro renomeado
  com recorte de tela; remoção do box "Dados rápidos"; box Documentos
  resumido por tipo, linkado ao Cofre; nova seção Serviços (síndico/
  manutencista).

NOVIDADES (Beta v1.46.1) — PRONTIDÃO CONTRATUAL (fase 2 desta trilha,
testes automatizados explicitamente fora do escopo desta rodada por
pedido do proprietário).

  REGRA CANÔNICA avaliarProntidaoContratoParaMinuta(con, imo) — nova,
  substitui "con.status === 'Assinando'" como critério de elegibilidade
  de minuta em TODOS os pontos que decidem se mostram "Gerar Minuta"
  (ficha do imóvel → aba Contrato; ficha do contrato → Mais ações).
  4 camadas (Especificação de Prontidão §5): (1) contrato completo —
  locatário/CPF-CNPJ válido/datas coerentes/valor>0/vencimento válido/
  reajuste, usando os MESMOS validadores que o formulário já usa
  (validarCPF/validarCNPJ/validarTelefoneBR/validarEmailFormato — nenhum
  validador novo); (2) imóvel e empresa carregados; (3) minuta aplicável
  cadastrada; (4) placeholders do MODELO REAL — ver abaixo.

  DEFESA EM PROFUNDIDADE (Especificação §11) — gerarMinutaContrato()
  reavalia a MESMA regra canônica antes de gerar qualquer coisa, mesmo
  que a UI já tivesse escondido o botão. Chamada direta via console num
  contrato incompleto é bloqueada aqui, não só na tela.

  CAMADA 4 REAL — preencherMinutaDocx() agora detecta, no MODELO
  REAL (depois de abrir o .docx escolhido): (a) placeholders conhecidos
  que o modelo usa e que ficaram vazios; (b) qualquer "{{...}}" que
  sobrou porque o sistema não tinha valor mapeado pra aquele nome.
  gerarMinutaContrato() aborta ANTES de subir o arquivo se qualquer um
  dos dois acontecer — nunca mais sai um .docx com placeholder residual
  ou campo obrigatório em branco (critério de teste F do checklist).

  CORRIGIDO — BUG REAL DE PERDA DE DADOS (achado do inventário de
  obrigatórios): locatario_endereco_atual/_profissao/_estado_civil já
  existiam no banco (preenchidos pelo interessado na Vitrine ou pelo
  bot) e já eram usados como placeholder de minuta, mas NUNCA tiveram
  campo no formulário de Contrato do App. Consequência: editar e salvar
  qualquer contrato vindo da Vitrine/bot apagava esses 3 valores em
  silêncio (contratoDados não os incluía). Adicionados os 3 campos no
  formulário (grupo Locatário) + incluídos em contratoDados +
  populados em editarContrato().

  UX DA PRONTIDÃO (Especificação §9) — ficha do imóvel (aba Contrato) e
  ficha do contrato mostram "Minuta ainda indisponível — faltam N
  informação(ões) obrigatória(s)" quando não pronto, em vez de simplesmente
  esconder o botão sem explicação.

  RESUMO DE MÚLTIPLOS CONTRATOS (Especificação Múltiplos Contratos §5)
  — Resumo da ficha do imóvel agora mostra a contagem explícita, ex.:
  "3 contratos vinculados · 1 Ativo · 1 Assinando · 1 Finalizado"
  (montarResumoContagemContratos(), nova) — antes só listava os cards,
  sem esse resumo agregado.

  BOT (whatsapp-webhook v2.5 → v2.6, _shared.ts + index.ts) — CORRIGIDO:
  verificarEnotificarContratosGerados() enviava a minuta com
  placeholders JÁ PREENCHIDOS assim que um contrato nascia via bot/
  Vitrine, mesmo com valor/vigência ainda em branco — geração de
  documento prematura (Especificação §12 "documentação antiga
  contraditória" + §4). Removido o envio automático dessa minuta
  parcial; a notificação continua avisando o operador que precisa
  completar o contrato no App. preencherPlaceholdersMinuta() ficou sem
  chamador (mantida, comentada, não apagada).

  PENDENTE (não implementado, ver HANDOFF): RPC
  fn_avaliar_prontidao_minuta_contrato — a regra canônica hoje só
  existe no App (client-side); convergência real entre App e Bot exigiria
  essa RPC compartilhada, ainda não escrita nem aplicada; identificação
  de contrato por linha em Financeiro/Documentos quando há ambiguidade
  (Especificação §18) — parcialmente coberto (Financeiro já isola por
  contrato internamente, mas não rotula visualmente linha a linha
  quando há mais de 1 contrato); testes automatizados — explicitamente
  fora do escopo desta rodada.

NOVIDADES (Beta v1.46.0) — PARCIAL, ver HANDOFF para o que ficou pendente.
Pacote de origem: 01_PROMPT_CLAUDE_IMOVEIS_V2_v1_46_0.md (32 seções —
prontidão contratual, múltiplos contratos, primeiro toque). Dado o
tamanho real do pedido (regra canônica cross-App/Bot, RPC nova,
auditoria completa, testes automatizados), esta entrega cobre o que foi
possível validar com segurança nesta rodada; o restante está listado
como próxima fase no HANDOFF, não foi descartado nem implementado sem
cuidado.

  NAVEGAÇÃO ENTRE MÓDULOS (pedido explícito desta rodada) — novo grupo
  "Módulos" no menu de Configurações, com link para o Cofre de
  Documentos (cofre.html), visível só para quem tem a funcionalidade
  'cofre.ver' liberada no perfil (mesma tabela perfil_funcionalidade que
  o próprio Cofre já usa — não inventei uma segunda regra de permissão).
  Checagem roda em paralelo ao login, não bloqueia entrada no sistema se
  falhar. Sub-aba "Documentos" da Ficha do Imóvel deixou de dizer "em
  breve" — agora linka pro Cofre já no contexto do imóvel
  (cofre.html?contexto=imovel&ref=<uuid>, contrato de URL definido desde
  a Fase 2). Cofre → Imóveis já existia (abrirSeletorModulo() do lado do
  Cofre), então a navegação agora é nos dois sentidos.

  CORRIGIDO — ZONA MORTA DE FOTOS (DIAGNÓSTICO_TOQUE_CARDS): a faixa de
  fotos do card de Imóveis tinha stopPropagation() no container INTEIRO,
  não só nas miniaturas — violação direta da Especificação Múltiplos
  Contratos e Toque §13. Tocar no espaço vazio entre fotos não abria a
  ficha. Corrigido: stopPropagation() só na miniatura (<img>), o espaço
  ao redor volta a abrir a ficha normalmente. Esta é a causa mais
  provável (não 100% confirmada sem teste real em dispositivo) do
  "precisa tocar várias vezes" relatado, PARA CARDS COM FOTO.

  CORRIGIDO — ACESSIBILIDADE DE TECLADO: cards de Imóveis e Contratos
  (são elementos "div", não "button") ganharam role="button", tabindex="0"
  e handler de teclado (Enter/Espaço abrem a ficha, igual clique) —
  exigência explícita §15/§21 da especificação.

  CORRIGIDO — SELEÇÃO SILENCIOSA DE CONTRATO EM AÇÃO AMBÍGUA:
  acionarZapIptuImovel() usava contratos.find(...status==='Ativo') e
  escolhia o primeiro Ativo em silêncio, mesmo se houvesse mais de um
  contrato Ativo elegível para o mesmo imóvel. Esse é o EXEMPLO
  EXPLÍCITO citado na Especificação Múltiplos Contratos, Parte A §7
  ("IPTU/WhatsApp"). Agora: 0 elegíveis → informa; 1 → executa; >1 →
  abre seletor explícito (abrirSeletorContratoParaAcao(), nova função
  reaproveitável para casos futuros do mesmo tipo).

  AUDITORIA `contratos.find()` (Especificação §2, tabela completa no
  relatório MULTIPLOS_CONTRATOS anexo a esta entrega) — 38 ocorrências
  revisadas; 37 já eram seguras (lookup por con.id, que é único por
  definição, não afetado por multiplicidade); 1 caso real de risco
  encontrado e corrigido (acima). obterContratosContextuaisDoImovel()/
  obterContratoPrincipalDoImovel() (criados na v1.45.0) já cobriam
  corretamente a ficha do imóvel — não precisaram de mudança.

  PENDENTE PARA PRÓXIMA FASE (não implementado nesta entrega — ver
  HANDOFF): regra canônica avaliarProntidaoContratoParaMinuta() e RPC
  fn_avaliar_prontidao_minuta_contrato; convergência Interessado/Bot/App
  na mesma regra (bot_legado.ts/bot_ia.ts/_shared.ts não foram tocados
  nesta rodada); defesa em profundidade no gerador de minuta; resumo de
  múltiplos contratos na ficha ("3 contratos vinculados · 1 Ativo...");
  seção "Em andamento"/"Anteriores" explícita na aba Contrato da ficha;
  identificação de contrato em cada linha do Financeiro/Documentos/
  Histórico quando ambíguo; testes automatizados (Playwright/Vitest);
  teste manual real em dispositivo/viewport (nada aqui foi testado em
  browser real, só validado estaticamente).

NOVIDADES (Beta v1.45.0) — IMÓVEIS V2: CORREÇÃO DE DIREÇÃO UX
CONTEXTUAL. Não é polimento visual — é correção de comportamento de
navegação: a v1.44.x preservou regras de negócio mas reintroduziu o
padrão legado "Lista → Editar" em paralelo à ficha contextual criada na
Fase 2. Esta versão implementa "Lista → Ficha → Ação" como o único
padrão, conforme ADENDO_DESIGN_SYSTEM_UX_CONTEXTUAL_v1.43.1 e
PROMPT_CLAUDE_CORRECAO_UX_IMOVEIS_V2_v1.

  CARD → FICHA (nunca mais edição direta):
  - Card de Imóveis: onclick chama abrirFichaImovel(), nunca mais
    editarImovel(). Fileira de ícones removida (ficha/editar/excluir/
    criar contrato/copiar/manutenção/IPTU) — card agora só mostra
    status, dados principais e fotos.
  - Card de Contratos (lista geral): onclick chama abrirFichaContrato()
    (NOVA), nunca mais editarContrato(). Histórico/Excluir/Gerar Minuta
    migraram pra dentro da ficha — card só mantém status/alerta.

  FICHA DO CONTRATO (NOVA, tab-contrato-ficha) — não existia até esta
  versão; implementada reaproveitando 100% das funções já existentes
  (verHistoricoContrato, gerarMinutaContrato, verAlertasContrato,
  excluirContrato) — nenhuma lógica duplicada, só uma tela de resumo +
  atalhos por cima do que já existia.

  AÇÕES REALOCADAS, NÃO REMOVIDAS: editar/excluir/copiar resumo/criar
  contrato/WhatsApp manutenção/IPTU/histórico/gerar minuta continuam
  todas acessíveis — de dentro da ficha correspondente, atrás de
  "Editar [imóvel/contrato]" (textual, ação secundária) e "Mais ações"
  (recolhido por padrão; excluir fica discreto lá dentro, nunca mais
  dominante na lista).

  CORRIGIDO — ASSINANDO NA FICHA DO IMÓVEL: a ficha usava
  "contratos.find(c => c.imovelId === id && c.status === 'Ativo')",
  então um imóvel com contrato Assinando (gerado pela Vitrine) aparecia
  como "Sem contrato ativo". Substituído por dois helpers centrais —
  obterContratosContextuaisDoImovel()/obterContratoPrincipalDoImovel() —
  que NUNCA escondem Assinando/Suspenso, e mostram Ativo+Assinando
  simultâneos sem esconder nenhum dos dois (Caso C do prompt de
  correção). CONFERIDO contra mapStatusContratoSupabaseParaAntigo(): os
  status reais deste app são só 4 (Ativo/Assinando/Suspenso/Finalizado)
  — "Renovação", citado no adendo como exemplo, não existe como status
  distinto neste sistema hoje; divergência registrada no relatório de
  aderência, não inventada.

  SALVAR RETORNA À FICHA (nunca à lista): editarImovel()/editarContrato()
  só são alcançáveis de dentro da ficha agora — ao salvar, volta
  automaticamente pra ficha atualizada do mesmo item (não pra lista).
  Editar contrato a partir da ficha do imóvel ou da ficha do próprio
  contrato volta pro lugar certo (contextoRetornoEdicaoContrato, novo).
  Excluir de dentro de qualquer ficha fecha/redesenha corretamente.

  FORMULÁRIO PÚBLICO — mobile/scroll (item 8 do prompt): overlay
  reestruturado de "fixed inset-0 + flex justify-center" (podia empurrar
  conteúdo alto pra fora da área navegável) para "fixed inset-0
  overflow-y-auto" + inner "min-h-full flex items-start justify-center
  p-4" + card "sm:my-6" — cresce naturalmente com o conteúdo. Campos
  agrupados em 4 blocos rotulados (Identificação/Contato/Endereço/
  Informações complementares). Validação agora localiza o primeiro
  campo inválido antes do envio, foca e rola até ele
  (scrollIntoView+focus), reaproveitando os validadores que já existiam
  (CPF/CNPJ/telefone/e-mail/CEP) — nenhuma regra nova. Sucesso rola a
  tela pro topo (senão a mensagem podia ficar fora da área visível se o
  formulário estivesse rolado pra baixo).

NOVIDADES (Beta v1.44.2) — lote de correções e melhorias reportadas pelo
proprietário depois de testar o v1.44.1 em produção:

  1) HIPÓTESE DE BUG CRÍTICO investigada (dados do interessado sumiam
     depois do preenchimento do link da Vitrine, nenhum contrato
     "Assinando" aparecia, nenhuma minuta gerável): pela leitura do
     trigger fn_gerar_contrato_de_processo + da policy RLS
     anon_preenche_processo_pendente, a causa mais provável é que o
     trigger muda o status final da linha para 'contrato_gerado' antes
     da checagem de RLS acontecer, e a policy só aceitava 'preenchido'
     como resultado — o UPDATE inteiro era rejeitado, nada era gravado.
     Migration separada proposta: migration_v1_44_2_fix_rls_processo_
     contratacao.sql (NÃO aplicada automaticamente — precisa rodar no
     Supabase e testar de novo; ver arquivo para o diagnóstico completo
     e o passo a passo). "Gerar Minuta" continua sendo ação manual (botão
     no card do contrato Assinando) — não existe envio automático de
     minuta hoje, isso não é bug, é o comportamento já existente.

  2) Contrato com status "Assinando" agora conta como alerta (função
     contratoAguardandoAssinatura()) — borda vermelha no card + entra em
     verAlertasContrato(). Antes só vencido/precisa-revisão contavam.

  3) Cards de "Atenção necessária" na Visão Geral agora filtram de
     verdade ao clicar, não só trocam de aba: "aguardando assinatura"
     aplica o filtro de status Assinando em Contratos; "contratos com
     alerta" liga um novo checkbox "Mostrar só contratos com alerta" no
     painel de filtros de Contratos (reaproveita contratoPrecisaRevisao/
     contratoVencido/contratoAguardandoAssinatura já existentes — nenhuma
     lógica de alerta duplicada).

  4) Formulário público de contratação (tela do interessado): endereço
     deixou de ser um campo único pequeno e virou o mesmo padrão
     estruturado de Imóveis (rua/número/complemento/bairro/cidade/UF/
     CEP), com CEP mascarado e validado no mesmo padrão de telefone/
     documento/e-mail (validarCEPFormato/aplicarMascaraCEP/
     validarCEPComIndicador, novas). Os campos continuam sendo
     concatenados num texto único (montarEnderecoContratacaoPublica())
     e salvos em interessado_endereco_atual — NÃO criei colunas novas
     no banco pra isso (ver observação no HANDOFF sobre o trade-off).

  5) Tela pública de contratação ganhou botão de fechar (canto superior,
     visível em qualquer estado) e a tela de sucesso ganhou botão "OK" —
     os dois chamam fecharTelaContratacaoPublica(), que leva para a
     landing page (não há "voltar" real nesse link avulso sem login).

  6) Padrão "clicar no card inteiro edita" substituiu o botão de lápis
     dedicado em Imóveis e Contratos (pedido explícito, com exemplo
     nesses dois). Os demais botões de ação de cada card continuam
     funcionando à parte via stopPropagation() no container deles — não
     precisei tocar em cada botão individualmente. NÃO estendi este
     padrão para as demais telas do sistema que também têm botão
     "editar" (Síndicos, Manutencistas, Administradoras, Pessoas, Minha
     Empresa, Minutas etc.) — são ~10 telas com estruturas de card
     diferentes entre si; fazer isso com segurança merece o mesmo tipo
     de diagnóstico dedicado que dei a Imóveis/Contratos, não um
     find-and-replace às pressas. Ver observação no HANDOFF.

NOVIDADES (Beta v1.44.1) — HOTFIX FORA DO ESCOPO DA TRILHA, REPORTADO
PELO PROPRIETÁRIO EM PRODUÇÃO — link público da Vitrine ("?contratar=
<token>") não carregava, erro 400 (postgres 42703 "column imoveis_1.tipo
does not exist"). Causa: iniciarModoContratacaoPublica() pedia a coluna
imoveis.tipo, que não existe mais (virou tipo_id, FK para tipos_imovel,
numa migration anterior a esta trilha — não investiguei quando). Correção
mínima aplicada: query parou de pedir a coluna inexistente; o resumo do
imóvel na tela pública deixou de mostrar o "tipo" (Casa/Apartamento/etc.),
mostrando só o endereço. NÃO tentei reintroduzir o tipo via
"tipos_imovel(nome)" porque o papel anon não tem GRANT de SELECT nessa
tabela e a RLS dela depende de sessão autenticada (meus_clientes()) — para
voltar a mostrar o tipo nesta tela pública é preciso decidir e aplicar uma
policy de RLS nova para anon, fora do escopo que posso tomar sozinho
nesta trilha. Nenhum outro trecho da tela de contratação pública foi
tocado.

NOVIDADES (Beta v1.44.0) — IMÓVEIS V2: FASE 1 (CASCA DE NAVEGAÇÃO) +
FASE 2 (FICHA DO IMÓVEL) — evolução de UI, sem reescrever regra de
negócio existente. Trilha "Conversa A" do plano de paralelização.

  FASE 1 — Navegação principal reduzida de 5 para 5 itens, mas com
  composição nova (antes: Imóveis/Contratos/Recebim./Métricas/Distrib.;
  agora: Visão Geral/Imóveis/Financeiro/Cobranças/Distrib.):
  - NOVA aba "Visão Geral" (tab-geral), primeira da navegação e tela
    inicial padrão do app (antes era direto em Imóveis). Mostra apenas
    contagens já calculadas a partir dos arrays em memória (imoveis,
    contratos, mensalidades) — nenhuma consulta nova ao Supabase,
    nenhuma métrica financeira inventada. Cards: patrimônio (imóveis
    por status), atenção necessária (inadimplentes via
    mensalidades.status, contratos com alerta via
    contratoPrecisaRevisao()/contratoVencido() já existentes, imóveis
    vagos), atalho para Relatórios.
  - "Cobranças" (tab-inadimplencia) ganha ícone próprio na barra
    inferior — antes só existia como toggle "Atrasos" dentro de
    Recebimentos. A tela em si e toda sua lógica NÃO mudaram.
  - "Recebim." renomeado para "Financeiro" (mesmo tab-mensal, mesma
    função renderMensalidades(), zero mudança de lógica).
  - "Contratos" (tab-contratos) e "Métricas" (tab-relatorios) saem da
    barra inferior — não foram removidos nem esvaziados, continuam
    100% funcionais e agora vivem em Configurações → grupo "Imóveis"
    (novos atalhos "Contratos (todos)" e "Relatórios"), preservando
    todo caminho de acesso que existia antes.
  - TAB_PARENT_MAP atualizado: tab-inadimplencia deixou de apontar
    para tab-mensal (agora é aba própria); tab-imovel-ficha passa a
    apontar para tab-imoveis (ver Fase 2); tab-contratos e
    tab-relatorios continuam sem destaque na barra, mesmo
    comportamento já documentado no código para abas de Configurações.

  FASE 2 — Ficha do imóvel (prontuário patrimonial):
  - NOVA seção tab-imovel-ficha, acessada pelo botão "Ver ficha" em
    cada card da lista de Imóveis (função abrirFichaImovel(id)), sem
    alterar nenhum botão/ação que já existia no card (editar, excluir,
    criar contrato, copiar resumo, WhatsApp manutenção/IPTU
    continuam exatamente como estavam).
  - 5 sub-abas dentro da ficha, iguais ao protótipo v0.4.0: Resumo,
    Contrato, Financeiro, Documentos, Histórico.
  - Resumo/Contrato/Financeiro são só LEITURA, montados a partir dos
    arrays já carregados (imoveis/contratos/mensalidades), filtrando
    por imovelId/contratoId — nenhuma função de renderização
    existente foi duplicada. Cada sub-aba tem um botão que abre a
    tela cheia correspondente (Contratos ou Financeiro) já filtrada
    para este imóvel, reaproveitando os filtros ocultos que essas
    abas já tinham (contratos-filtro-imovel-id / men-filtro-imovel) —
    zero lógica nova de filtro.
  - Histórico reaproveita 100% a função existente
    verHistoricoContrato() (mesmo modal que já existia em Contratos).
  - Documentos: como o módulo Cofre (trilha "Conversa B") ainda não
    está implementado, esta sub-aba mostra um aviso honesto "em breve"
    em vez de simular uma integração que não existe — não é permitido
    alterar/inventar comportamento de outro módulo fora do escopo
    desta trilha.
  - Tela inicial do app passou de tab-imoveis (classe "active" fixa no
    HTML) para tab-geral — única mudança de comportamento de boot;
    login/seleção de empresa/licença não foram tocados.

NOVIDADES (Beta v1.43.2) — CORRIGIDO ÍCONES SUMINDO EM 7 TELAS DIFERENTES:
  - CORRIGIDO (bug real): ícones ficavam como círculos/quadrados vazios
    depois que a lista era redesenhada dinamicamente, em 7 funções
    diferentes: renderVitrine (reaparecia ao trocar filtro
    Empreendimento/Status), renderDivisaoContrato, renderListaSeletorImovel,
    renderPendenciasExtrato, renderPreviewDocumentosContrato,
    renderPreviewFotosImovel, renderSocioInputs. Causa em todas: o
    innerHTML era reconstruído com <svg data-lucide="..."> novos, mas
    lucide.createIcons() nunca era chamado de novo pra desenhar os
    ícones recém-inseridos. Corrigido nas 7 de uma vez, mesmo padrão.
  - (Fix de RLS do link público de contratação — anon não conseguia ler
    o imóvel — já foi aplicado direto no banco separadamente, não fazia
    parte deste HTML.)

--- HISTÓRICO ANTERIOR (Beta v1.43.1) ---

  - Central de Comunicações: onboarding agora funciona como carrossel real,
    com botão Voltar e dots clicáveis para revisar passos já lidos.
  - Etapa de instalação PWA agora informa explicitamente quando o Raiz já
    está instalado, quando o prompt Android está disponível e quando o
    navegador não disponibilizou a instalação naquele momento.
  - Ao tocar em instalar no Android, o onboarding só avança automaticamente
    se a instalação for aceita; se o usuário fechar/recusar, permanece no
    passo para permitir nova leitura/tentativa.
  - CORRIGIDO: log de login ainda chamava o Apps Script legado via
    registrarAcesso(), causando CORS/401 mesmo com login e dados já migrados
    ao Supabase. Login passa a registrar em public.log_acessos via registrarLog().
  - CORRIGIDO: abertura da Vitrine pública ainda chamava registrarAcesso()
    no Apps Script. Passa a registrar evento fogo-e-esquece em
    comercial.eventos_landing, mesma infraestrutura já usada pela landing
    e pelo botão do R.AI.Z na splash.
  - O restante dos usos de GOOGLE_API_URL foi auditado e mantido nesta
    versão quando ainda pertence a fluxo legado específico; ver diagnóstico
    da entrega v1.43.1 antes de remover/migrar.
NOVIDADES (Beta v1.43.0) — CENTRAL DE COMUNICAÇÕES OMNICHANNEL + NPS UNIFICADO:
  - NOVA infraestrutura modular de jornadas/comunicações, preparada desde a
    fundação para App, WhatsApp/R.AI.Z e e-mail. Conteúdo é específico por
    canal; prioridade, frequência, histórico e conclusão são compartilhados.
  - Onboarding legado v1.37.0 removido como fonte ativa e migrado para
    onboarding_primeiro_acesso_v1. App: boas-vindas → instalação PWA →
    primeiro imóvel. Canal WhatsApp já possui payload/fluxo cadastrado para
    o adaptador do bot usar sem criar outra estrutura.
  - NPS legado do App (popup específico do 3º acesso) migrado para
    nps_experiencia_v1. A regra continua >=3 logins no App; o canal WhatsApp
    preserva a regra arquitetural atual de >=10 interações, mas ambos passam
    a compartilhar a mesma jornada e a mesma conclusão.
  - Responder NPS em qualquer canal grava na tabela feedback existente e
    encerra a comunicação globalmente para aquela pessoa; o flag histórico
    feedback_terceiro_acesso_dado também é marcado por compatibilidade.
  - Nova migration cria comunicacoes, comunicacao_canais,
    comunicacao_regras e comunicacao_interacoes + RPCs separadas para App
    autenticado e Edge Functions service_role.
  - Orquestrador garante apenas uma comunicação por vez; onboarding (100)
    precede NPS (30), evitando concorrência de popups.
  - Código novo segue Diretriz Arquitetural Passo 2: ES Modules, API/UI/
    regras/PWA separados, addEventListener e testes Vitest/Playwright.
  - ATENÇÃO BOT: banco/contrato omnichannel estão prontos, mas os 4 arquivos
    .ts atuais do whatsapp-webhook não estavam anexados nesta conversa; não
    foi inventado patch parcial. Documento de integração define exatamente
    como substituir talvezPedirNPS() e ligar o adaptador sem duplicar estado.
NOVIDADES (Beta v1.42.3) — CORRIGIDO DE VEZ O "ROW-LEVEL SECURITY" DE MINUTAS/CONTRATAÇÃO, NOVO ÍCONE DO CONCILIAR:
  - CORRIGIDO (bug real, causa raiz encontrada): "new row violates
    row-level security policy" ao salvar uma Minuta ou ao iniciar uma
    contratação pela Vitrine. As políticas de RLS que eu tinha escrito
    usavam "cliente_id = public.fn_meu_cliente_id()" — uma função que
    retorna só UM cliente_id (com LIMIT 1). Só que TODAS as outras
    tabelas do sistema (contratos, imóveis, pessoas, prestadores, tipos
    de imóvel, etc.) usam "cliente_id IN (SELECT public.meus_clientes())"
    — uma função diferente, que retorna a LISTA COMPLETA de empresas que
    aquele usuário tem acesso. Quem tem mais de uma empresa vinculada
    (como várias empresas de teste) esbarrava exatamente nisso: a função
    errada pegava só uma empresa "aleatória", que podia não ser a que
    estava em uso no app. Corrigido pra usar o mesmo padrão comprovado
    usado em todo o resto do sistema.
  - Ícone do botão "Conciliar" trocado outra vez, agora com base numa
    imagem de referência do cliente: duas setas em sentidos opostos
    formando um ciclo fechado (padrão "repeat"), representando a troca
    bidirecional de dados entre o banco e o Raiz Patrimônio — renderizado
    e conferido visualmente antes da entrega.
  - Aba Minha Empresa: corrigida borda do formulário (fina, igual ao
    padrão de Imóveis — border-2 é só pra sub-blocos internos) e campos
    reagrupados em grid de 2-3 colunas em vez de empilhados um por linha.
  - Design System atualizado com o histórico completo do ícone do
    Conciliar e a distinção formal entre borda de formulário inteiro vs.
    borda de sub-bloco interno.
  - Migration original (migration_v2_minutas_contrato_e_processos_contratacao.sql)
    também corrigida na fonte, pra instalações novas já vierem certas.
    Quem já rodou a versão anterior deve rodar o fix avulso
    (fix_v3_rls_meus_clientes.sql).

--- HISTÓRICO ANTERIOR (Beta v1.42.2) ---

  - CORRIGIDO: aba Minha Empresa estava com borda grossa (border-2) no
    formulário inteiro — deveria ser fina (border), igual ao padrão de
    Imóveis/Contratos/etc.; border-2 é só pra sub-blocos DENTRO de um
    form (Sócios, Documentos...), não pro form inteiro.
  - Campos de Minha Empresa reagrupados em grid de 2-3 colunas (mesmo
    padrão da aba Imóveis), em vez de cada campo empilhado sozinho
    ocupando a largura toda — isso que deixava a tela com aparência mais
    espalhada/vazia horizontalmente. Tamanho de letra já estava correto
    (conferido, batia com Imóveis).
  - Aba Recebimentos: "Conciliação de Extrato" e "Reprocessar
    Conciliação" agora dividem a MESMA moldura (2 seções dentro de um
    único card), sem alterar a formatação interna de cada uma. O título
    (renomeado para "Pendências do Extrato Bancário") ficou acima dessa
    moldura, fora dela.
  - Documento de Design System atualizado (novo item 12): distinção
    formal entre borda do formulário inteiro (fina) vs. borda de
    sub-blocos internos (grossa), e regra de agrupar campos em grid de
    2-3 colunas em vez de empilhar um por linha.
  - PENDENTE: pedido de trocar o ícone do botão "Conciliar" por um mais
    próximo de uma imagem de referência — a imagem não veio anexada
    nesta mensagem. Aguardando reenvio pra fazer o ajuste.

--- HISTÓRICO ANTERIOR (Beta v1.42.1) ---

  - CORRIGIDO (bug real): "permission denied for table processos_contratacao"
    ao iniciar contratação pela Vitrine. A migration anterior criou as
    tabelas e as regras de RLS, mas faltou o GRANT básico de acesso pros
    papéis "authenticated" e "anon" do Postgres — RLS só filtra QUAIS
    LINHAS um papel enxerga; sem o GRANT, o Postgres nega acesso à tabela
    inteira antes de sequer avaliar as políticas. Corrigido via arquivo
    SQL avulso (fix_v2_grants_e_minuta_arquivo.sql).
  - MUDANÇA DE ARQUITETURA no cadastro de Minutas: em vez de colar o
    texto do contrato num campo grande (com placeholders digitados à
    mão), agora é upload de um arquivo .docx (Word) de verdade. O texto
    da minuta continua usando os mesmos {{placeholders}}, mas escritos
    direto no documento Word.
  - Ao gerar uma minuta específica para uma contratação, o sistema abre
    o .docx do modelo (é um .zip por dentro) usando a biblioteca JSZip
    direto no navegador, localiza e substitui cada {{placeholder}} pelo
    valor real dentro do XML interno do documento, e gera um novo .docx
    já preenchido — sem precisar de nenhum servidor. Inclui uma camada
    de resiliência que funde texto de {{placeholders}} que o Word possa
    ter quebrado em múltiplos "runs" internos (comum quando o modelo é
    editado manualmente no Word, por causa de correção ortográfica).
  - Esse .docx específico (já com os dados do locatário/imóvel/contrato)
    é anexado automaticamente ao contrato, no mesmo Cofre de Documentos
    de sempre — pronto pra baixar, conferir e enviar pro interessado.
  - Migration SQL atualizada: coluna "corpo_texto" trocada por
    "arquivo_url"/"arquivo_nome" na tabela minutas_contrato.
  - Dois modelos de minuta prontos entregues em anexo (Word, já com os
    placeholders certos, revisados e com pequenos erros do original
    corrigidos): Minuta_Padrao_Locacao_Comercial.docx e
    Minuta_Padrao_Locacao_Residencial.docx — prontos pra cadastrar numa
    empresa de teste.
  - Especificação para o bot.ia atualizada para refletir a nova
    arquitetura baseada em edição real de .docx (em vez de geração de
    PDF do zero).

--- HISTÓRICO ANTERIOR (Beta v1.42.0) ---

  - CORRIGIDO (bug real, achado durante o desenvolvimento desta feature):
    o campo "Valor IPTU" do contrato nunca sincronizava certo com o banco
    (o código lia/escrevia em "con.iptu", um campo que nunca existia no
    objeto do contrato — o certo era "con.iptuValor"), e "Valor
    Condomínio" nem tinha coluna correspondente na tabela "contratos" no
    Supabase (só existia para imóveis). Corrigido no app + migration SQL
    adicionando a coluna.
  - Novo módulo "Minutas de Contrato" (menu Configurações): cadastro de
    modelos de contrato com placeholders {{...}}, escopados por
    Geral (empresa toda) / Empreendimento / Tipo de Imóvel / Imóvel
    específico. Tela com botão de ajuda mostrando todos os placeholders
    disponíveis (copiáveis com um toque).
  - Vitrine: novo botão "Iniciar Contratação" por imóvel. Abre um modal
    com duas opções: gerar um link público (copiado pra área de
    transferência) ou abrir o WhatsApp com uma mensagem já pronta pedindo
    os dados do interessado — pro próprio cliente encaminhar.
  - Nova tela pública (?contratar=<token> na URL, sem necessidade de
    login) onde o interessado preenche seus dados (nome, CPF/CNPJ com
    máscara e validação, WhatsApp, e-mail, endereço atual, profissão,
    estado civil, observação).
  - Ao preencher, um TRIGGER NO BANCO (não depende do app estar aberto)
    gera automaticamente um contrato com status "Assinando" — novo
    status adicionado ao enum — escolhendo a minuta certa pela regra de
    prioridade (imóvel específico > tipo de imóvel > empreendimento >
    geral).
  - Contratos "Assinando" ganham um botão "Gerar Minuta" na lista: gera
    o PDF com os placeholders já preenchidos (dados do locatário, imóvel,
    empresa e contrato) e anexa automaticamente ao contrato, no mesmo
    Cofre de Documentos (bucket "contratos-documentos") já usado pelos
    outros anexos.
  - Logs e nomes de funcionalidade adicionados para as novas ações:
    minutas.criar / minutas.editar / minutas.excluir / minutas.gerar_pdf /
    contratacao.link_gerado / contratacao.whatsapp_aberto.
  - Migration SQL completa entregue separadamente
    (migration_v2_minutas_contrato_e_processos_contratacao.sql): tabelas
    novas, RLS (incluindo acesso público controlado por token), trigger
    de geração automática do contrato, e documentação de placeholders.
    Tem um passo que precisa rodar ISOLADO primeiro (ALTER TYPE ADD
    VALUE) — instrução clara no topo do arquivo.
  - Especificação separada para a próxima conversa de implementação do
    bot.ia (ESPECIFICACAO_BOT_IA_MINUTAS_CONTRATO.md): menu novo do bot
    pra gerar minuta ou receber minuta padrão, fluxo de notificação
    automática do cliente quando um contrato é gerado via link, e lista
    de placeholders pra replicar a lógica de preenchimento no bot, caso
    necessário. NÃO IMPLEMENTADO NO APP — só documentado, como pedido.

--- HISTÓRICO ANTERIOR (Beta v1.41.5) ---

  - Filtros de Imóveis e Contratos unificados numa única moldura ("Filtrar"),
    mesmo padrão visual já usado em Recebimentos — antes eram 2-3 blocos
    separados.
  - Síndico, Manutencista e Administradora: campos de Documento (CPF/CNPJ),
    WhatsApp e E-mail agora têm máscara + validação + indicador (✅/⚠️),
    mesmo padrão já usado no Contrato. Funções genéricas reutilizáveis
    criadas (validarTelefoneComIndicador, validarEmailComIndicador,
    formatarMascaraDocumentoGenerico estendida com indicador opcional).
  - Aba Pessoas redesenhada: lista com informações reduzidas por padrão
    (nome, função, perfil) — tocar no lápis abre os demais dados e as
    opções de acesso (criar/remover), no mesmo padrão visual de
    Síndicos/Manutencistas. Removida a rolagem interna isolada (lista
    ocupa a aba toda). Ícones padronizados em SVG (cadeado para master,
    lixeira para remover, usuário-check/usuário-x para criar/remover
    acesso). Usuários master continuam protegidos contra remoção (já
    existia, preservado). Removido o título duplicado dentro do
    componente (a aba já tem "Pessoas" no cabeçalho). Botão salvar
    padronizado ("Salvar Pessoas", verde-esmeralda, padrão do sistema).
  - Aba Minha Empresa redesenhada: todos os campos já abertos, sem
    rolagem (só existe uma empresa). Ordem revista — Nome (2º elemento da
    aba, linha própria), CPF/CNPJ (com máscara+validação), Responsável
    (linha própria, label mais larga), depois Endereço/Complemento/Bairro
    (novos campos, cada um em linha própria), Cidade/UF, e por fim cidade
    impressa no recibo. Labels tiradas do caixa-alta (padrão normal do
    sistema). Botão salvar e botões de assinatura padronizados (ícones
    SVG, verde-esmeralda no botão principal).
  - Tipo de Empreendimento e Tipo de Imóvel redesenhados: lista no mesmo
    padrão de Imóveis/Síndicos (cards brancos, borda cinza, botão de
    excluir em SVG), sem rolagem interna isolada, formulário de cadastro
    atrás do botão "+" (padrão liga/desliga), fecha sozinho ao salvar.
    Texto descritivo abaixo do título mantido.
  - Texto descritivo abaixo do título adicionado nas abas Síndicos,
    Manutencistas, Administradoras, Pessoas e Minha Empresa.
  - Menu do bonequinho: X vermelho de fechar trocado pelo X neutro do
    design system; título renomeado de "Conta" para "Configurações";
    item "Dev" removido do menu por hora (acesso interno continua via
    duplo-clique na logo).
  - Aba Recebimentos, dentro de Conciliação: botão "Reprocessar" saiu do
    vermelho ao lado do título e ganhou moldura própria (mesmo padrão do
    card "Conciliação de Extrato" logo acima), com título e explicação
    do que faz. Título "Pendências do Extrato Importado" ficou acima da
    moldura (não mais dentro dela).
  - Ícone do botão "Conciliar" trocado outra vez: agora são dois nós
    (retângulos) ligados por duas linhas com setas em sentidos opostos,
    representando a transferência eletrônica de dados nos dois sentidos
    entre o banco e o Raiz Patrimônio.
  - Verificação de segurança: nenhuma das 154 funções chamadas via
    onclick/oninput/onchange no app ficou presa em escopo local (mesmo
    tipo de bug já corrigido na v1.41.4 nas funções de WhatsApp/E-mail).

NOTA TÉCNICA: os 3 novos campos da aba Minha Empresa (endereco,
complemento, bairro) esperam colunas de mesmo nome na tabela "clientes"
do Supabase. Se ainda não existirem, o botão "Salvar Dados da Empresa"
vai mostrar o erro do Postgres com clareza — nesse caso, rodar:
  ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS endereco text;
  ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS complemento text;
  ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS bairro text;

--- HISTÓRICO ANTERIOR (Beta v1.41.4) ---

  - CORRIGIDO (bug real e grave, pré-existente no código desde antes da
    v1.41.0 — não foi algo introduzido nas rodadas anteriores): os
    botões de WhatsApp/E-mail na aba Distribuição nunca funcionavam
    porque as funções enviarResumoSocioZap, enviarResumoSocioEmail,
    obterContatoSocio, montarTextoResumoSocio e calcularExtratoSocio
    estavam declaradas DENTRO do loop .forEach() de
    renderSociosDistribricao() — sintaticamente válido (por isso nunca
    acusava erro de sintaxe em nenhuma validação anterior), mas isso as
    tornava funções LOCAIS aquele escopo, invisíveis para o "window"
    global. Como os botões usam onclick="..." no HTML (que só enxerga
    funções GLOBAIS), clicar disparava um ReferenceError silencioso no
    console — por isso "não faziam nada", mesmo depois de duas rodadas
    de correções na lógica INTERNA dessas funções (a lógica sempre
    esteve correta; o problema era que o navegador nunca conseguia nem
    chamar as funções). Movidas para o escopo global. Validado por
    análise de profundidade de aninhamento (contagem de chaves) e
    comparação direta com funções globais confirmadas.
  - IPTU/Condomínio do contrato: voltaram a ser campos PRÓPRIOS e
    EDITÁVEIS (con-iptu-valor/con-condominio-valor), reincorporados
    depois de terem sido removidos por engano numa rodada anterior.
    Comportamento correto: ao escolher o imóvel num contrato NOVO, os
    campos vêm pré-preenchidos automaticamente com o que está cadastrado
    no imóvel — o usuário pode ajustar livremente os dois valores antes
    de salvar. Ao editar um contrato já existente, usa o valor que já
    está salvo nele (não busca de novo no imóvel, não sobrescreve edição
    em andamento). Nenhum comentário/texto solto abaixo dos campos
    "IPTU sim/não" e "Condomínio sim/não".
  - Novo filtro por Imóvel na aba Imóveis, mesmo formato/padrão do
    filtro de imóvel já usado na aba Recebimentos (botão que abre um
    seletor modal com busca, não <select> nativo).
  - Novos filtros por Imóvel e por Locatário na aba Contratos, mesmo
    padrão. O filtro de Locatário lista os locatários únicos com
    contrato cadastrado.
  - CORRIGIDO: os filtros "Empreendimento" (select) e "Imóvel" (botão)
    no topo da aba Recebimentos tinham alturas ligeiramente diferentes —
    mesma causa/solução já aplicada em Métricas e no par Imóvel/Status
    do contrato (classe .raiz-filtro-altura-padrao aplicada aos dois).

--- HISTÓRICO ANTERIOR (Beta v1.41.3) ---

  - CORRIGIDO (bug real): "could not find the 'desconto' column in the
    schema cache" ao salvar contrato — mesmo depois da coluna já ter sido
    apagada do banco (migration da v1.41.2), o payload de sincronização
    com o Supabase (sincronizarContratoSupabase) ainda tentava ENVIAR
    "desconto: con.desconto || null". Removido do payload de escrita, da
    leitura, do cálculo de valor efetivo de recebimentos e do importador
    de planilha/carga inicial — nenhuma referência restante no sistema.
  - IPTU/Condomínio do contrato: revertido para vir automaticamente do
    cadastro do IMÓVEL vinculado (fonte única da verdade), em vez de
    campos digitáveis duplicados no contrato (que eu tinha adicionado por
    engano numa rodada anterior). Mostrado como informação de leitura
    (não editável) logo abaixo de "Locatário paga IPTU/Condomínio".
    Removido também o parágrafo de detalhe de valor abaixo do campo
    "IPTU Sim/Não".
  - Borda do bloco de Rateio no formulário de contrato: escurecida para o
    mesmo padrão dos Documentos (rounded-xl border-2 border-slate-300).
  - Pessoas, Minha Empresa (ex-"Cliente"), Tipo de Empreendimento e Tipo
    de Imóvel viraram TELAS PRÓPRIAS no menu de Conta — antes viviam
    fisicamente dentro de DEV/Parametrizações. Extração feita movendo os
    blocos HTML originais (preservando todos os IDs e funções JS já
    existentes, sem duplicar lógica) para 4 novas seções independentes.
    A antiga aba "Parametrizações" virou um hub simples com 3 atalhos.
  - CORRIGIDO: botões +/X de Síndico, Manutencista e Administradora
    apareciam em tamanho diferente do de Imóveis — o círculo externo era
    do mesmo tamanho (w-11 h-11) nos 4, mas o SVG interno dos 3 primeiros
    esquecia o "w-5 h-5", fazendo o ícone desenhar no tamanho padrão do
    SVG (maior). Corrigido nos 3 botões + adicionada uma regra CSS de
    segurança (.raiz-btn-toggle svg.raiz-icone-toggle{width:20px;
    height:20px}) para todo botão futuro do tipo.
  - CORRIGIDO (bug real): síndico/manutencista recém-cadastrado não
    aparecia vinculado ao abrir o imóvel para conferir — só aparecia
    depois de atualizar a página inteira. Causa: o recálculo do vínculo
    (recalcularVinculosSindicos/Manutencistas) rodava ANTES do saveAll()
    terminar de trocar o id TEMPORÁRIO do registro recém-criado pelo id
    REAL do banco — o vínculo ficava apontando pro id temporário, que
    deixava de existir. Agora o recálculo espera o saveAll() terminar.
  - Asterisco (*) adicionado nos campos obrigatórios de Síndico,
    Manutencista, Administradora, Tipo de Empreendimento e Tipo de
    Imóvel (Pessoas usa "Nome *" no placeholder, por ser uma lista
    compacta de linhas sem <label> tradicional). Documentado como regra
    permanente no Design System (todo campo required precisa do
    asterisco visual, e vice-versa).
  - Botão "Fechar" do pop-up de Histórico de Contrato: trocado do X
    vermelho (que na verdade nem desenhava — dependia de
    lucide.createIcons() nunca chamado no innerHTML dinâmico, ficava um
    quadrado cinza vazio) para o mesmo padrão X neutro usado no modal de
    Opções (círculo verde-escuro, SVG inline garantindo que sempre
    desenha).
  - Ícone do botão "Conciliar" trocado outra vez: agora é um glifo de
    banco (telhado + pilares + base) com um pequeno ícone de
    sincronização sobreposto — representando "troca de informações com
    o banco", conforme referência visual fornecida.
  - WhatsApp/E-mail da aba Distribuição: revisado de novo. Antes pedia
    para digitar um contato avulso (guardado só no localStorage do
    aparelho — sumia se o sócio abrisse de outro celular). Agora busca
    DIRETO do cadastro de Pessoas (mesma fonte que alimenta a nova aba
    Pessoas). Se não encontrar e-mail/WhatsApp cadastrado, mostra um
    aviso claro dizendo o que falta e onde cadastrar — nunca mais "não
    faz nada" ao clicar.
  - Confirmado: nenhum resíduo de "Seu Plano" restante em lugar nenhum
    do app (já tinha sido totalmente migrado para a aba Licença).
  - Documento de Design System completo e atualizado entregue
    separadamente (DESIGN_SYSTEM_RAIZ_PATRIMONIO_v1_41_3.md),
    consolidando tudo (liga/desliga v2, tamanhos de ícone, bordas,
    campos obrigatórios, telas extraídas, fluxos assíncronos com id
    temporário, contatos via Pessoas, campos derivados de outro
    cadastro, checklist de remoção de coluna do banco).

--- HISTÓRICO ANTERIOR (Beta v1.41.2) ---

  - Campo Energia: usabilidade revista de novo — o atributo "title"
    (tooltip) usado na primeira tentativa não funciona em touchscreen
    (não existe "hover" no celular), então na prática não ajudava
    ninguém no app real. Trocado para texto direto nas opções do
    select: "Não (só concessionária)" / "Sim (tem geração particular)"
    — sempre visível, sem depender de mouse.
  - CORRIGIDO (bug real, não visual): a versão exibida na tela de splash
    e na aba Sobre estava travada em "Beta v1.39.8" havia 3 versões — a
    causa era uma constante separada (APP_VERSAO) no JS que não era
    atualizada junto do changelog do cabeçalho. Agora sincronizada.
  - CORRIGIDO (bug real): botões de WhatsApp/E-mail na aba Distribuição
    "não faziam nada" ao clicar — a causa era o uso de window.prompt()
    como fallback para pedir contato de sócio sem WhatsApp/e-mail
    cadastrado; prompt() é ignorado silenciosamente dentro do PWA
    instalado no celular. Substituído por um modal HTML próprio
    (pedirContatoSocioModal), funções viraram callback-based.
  - CORRIGIDO (bug real): botão de fechar do pop-up de Histórico de
    contrato aparecia como um quadrado cinza vazio — o SVG usava
    data-lucide="x" sem chamar lucide.createIcons() depois de injetar
    via innerHTML (o ícone nunca era desenhado). Trocado por SVG inline,
    em botão vermelho circular, sempre visível.
  - CORRIGIDO: aba Licença ficava presa para sempre em "Carregando
    funcionalidades..." — a função inicializarLicenca() nunca tinha sido
    escrita (só era chamada condicionalmente). Implementada: mostra
    plano/status/vigência e a lista de funcionalidades do plano com
    limite configurado, cada uma com uso atual e barra de progresso.
  - Campo Endereço e Tipo de Imóvel: adicionado "required" + asterisco
    vermelho na label de Tipo de Imóvel (não tinha nenhum dos dois) e
    asterisco na label de Endereço (já era obrigatório, faltava o sinal
    visual).
  - Serviços desmembrado em 3 telas distintas (tab-sindicos,
    tab-manutencistas, tab-administradoras), cada uma com seu próprio
    botão de cadastro — a antiga aba única "Serviços" foi removida.
  - Menu "Conta" (ícone do bonequinho) reorganizado com todos os itens
    pedidos: Síndicos/Manutencistas/Administradoras, Pessoas, Cliente,
    Tipo de Empreendimento, Tipo de Imóvel, Dev, Licença, Suporte,
    Sobre. Pessoas/Cliente/Tipo Empreendimento/Tipo Imóvel continuam
    fisicamente dentro das abas DEV/Parametrizações (evita duplicar
    lógica já funcional e complexa) — o menu agora leva direto para a
    seção certa dentro delas via nova função irParaSecaoConta().
  - Design system "liga/desliga" evoluído (v2): além de mudar de cor, o
    botão agora troca o ÍCONE entre "+" (fechado) e "X" (aberto), sem
    alterar o esquema de cores. Nova função central
    atualizarIconeToggle(), aplicada em todos os botões toggle do app.
    Ícone do botão "Conciliar" trocado do desenho antigo (lápis) por um
    ícone de dupla-confirmação (✓✓), mais alinhado com "conciliação".
  - Bordas escurecidas (rounded-xl border-2 border-slate-300) em: Sócios,
    Síndico, Manutencista (imóvel), Documentos e Histórico (contrato) —
    consistentes com o card de "Fotos do Imóvel".
  - Texto "Fotos do Imóvel": corrigido conflito de classes CSS (block +
    flex juntos, que impedia a centralização vertical de funcionar);
    agora fica exatamente no meio da altura do componente.
  - Formulário de Contrato reestruturado:
    • Botão "..." de reajuste movido para AO LADO DO VALOR do campo
      Aluguel (R$) — não mais em frente ao label — replicando a
      experiência do "..." de Líquido na aba Mensal.
    • Cortina de reajuste movida para logo abaixo do campo Aluguel;
      removidos os botões "Salvar"/"Fechar" que ela tinha (o painel
      alimenta o valor direto, quem persiste é "Salvar Contrato");
      cortina só existe ao EDITAR um contrato (o botão "..." fica
      escondido ao cadastrar um contrato novo).
    • Novos campos "Valor IPTU (R$)" e "Valor Condomínio (R$)".
    • Campo "Descrição do Contrato" removido do formulário e do banco de
      dados em memória (campo "descricao" não é mais lido/gravado).
    • Caixa de Observação: removido "(opcional)" do label, cores
      padronizadas com o resto do formulário (era destacada em âmbar).
    • Botão "..." (reajuste do contrato) e "..." (Energia/multa/taxa na
      aba Mensal) agora escurecem enquanto o painel está aberto (nova
      classe .raiz-btn-toggle-mini.ativo).
    • Altura do par Imóvel/Status padronizada (nova classe
      .raiz-campo-altura-contrato).
    • Espaçamento entre linhas corrigido: parágrafos de indicador de
      validação (CPF/CNPJ, WhatsApp, e-mail) reservavam altura fixa
      mesmo vazios, "esticando" só as linhas que os têm e fazendo a
      linha seguinte parecer mais distante das demais. Agora colapsam
      por completo quando vazios (nova classe .raiz-indicador-inline).
  - Migration SQL entregue separadamente (não executada neste arquivo,
    roda direto no Supabase): remove a coluna "desconto" da tabela
    contratos, com backup automático dos valores existentes e script de
    rollback. Ver migration_v1_remover_coluna_desconto_contratos.sql e
    rollback_v1_remover_coluna_desconto_contratos.sql.
  - Documento de Design System (adendo) entregue separadamente,
    documentando o padrão liga/desliga v2, bordas escuras, alturas de
    campo padronizadas e indicadores inline — para incorporar ao
    DESIGN_SYSTEM_RAIZ_PATRIMONIO.md principal do projeto.

--- HISTÓRICO ANTERIOR (Beta v1.41.1) ---


FASE 1 (imediata):
  - Sócio padrão no 1º cadastro de imóvel da sessão: pré-preenchido a
    100% com o sócio de MAIOR % de cotas da empresa (antes ficava em
    branco); a partir do 2º cadastro, continua valendo o padrão
    societário salvo no cadastro anterior (comportamento já existente).
  - Contrato: novo ícone "..." ao lado de "Aluguel (R$)" abre o painel
    "Registrar Reajuste/Alteração" (abrirPainelReajusteContrato).
  - Painel de reajuste: removido o campo "Desconto Vigente (R$)"
    (con-desconto) do formulário e do fluxo de salvamento — dado
    histórico antigo no banco é preservado, mas não é mais gravado nem
    editável (ver nota de decisão pendente abaixo). Adicionados botões
    "Salvar"/"Fechar" (confirmarReajusteContrato/fecharPainelReajuste-
    Contrato): pede confirmação quando o novo valor difere do vigente,
    e exige a vigência da alteração sempre que houver valor/reajuste
    digitado (validação também replicada dentro de saveContrato, como
    trava de segurança).
  - Nova caixa de "Observação" ao final do formulário de contrato,
    sempre em branco: se preenchida e o contrato for salvo, o texto
    entra como mais um item DENTRO da mesma entrada de histórico
    daquele salvamento (mantém o padrão "1 histórico por salvamento",
    não cria entrada separada).
  - Botão de salvar do contrato renomeado "Firmar/Atualizar Contrato"
    → "Salvar Contrato", cor padronizada (raiz-bg-pine, igual ao de
    Imóvel).
  - Lista de contratos: ícone de alerta movido para a fileira de ações
    (junto de editar/histórico/excluir, em vez de badge solto no meio
    do texto) + borda do card fica vermelha quando há alerta pendente.
    Clique no ícone continua abrindo a descrição do alerta.
  - Removidos comentários obsoletos: "Auto se houver Energia." (form de
    contrato) e placeholder estático "Selecione o imóvel" (label de
    IPTU do locatário, HTML e JS).

FASE 2 (reorganização de Recebimentos + design system liga/desliga):
  - Painel "Gerar Mês" (botão "+") agora abre logo abaixo do cabeçalho
    da aba Recebimentos (topo), perto do próprio botão — antes abria
    depois do bloco de pendências, exigindo rolagem.
  - NOVO botão "Conciliar" no cabeçalho de Recebimentos: mostra/esconde
    toda a função de conciliação (botão "Importar Extrato", que saiu do
    cabeçalho principal e passou a viver dentro deste bloco, + as
    pendências geradas a partir do extrato importado).
  - Design system "liga/desliga": nova classe .raiz-btn-toggle (+
    .ativo) — os botões "+" (Imóveis, Contratos, Gerar Mês) e
    "Conciliar" agora trocam de cor quando o painel correspondente está
    aberto, dando sensação de toggle. Como consequência, os antigos
    botões "X" vermelhos de fechar formulário (Imóvel e Contrato) foram
    REMOVIDOS — fechar agora é tocar de novo no próprio botão "+"
    (alternarFormularioImovel/alternarFormularioContrato).
  - Distribuição: removido "(%)" do select de "Registrar Retirada";
    removida a palavra "Sócio:" e o emoji 👤 do título do card; removido
    "📅 Competência" do separador de linhas do extrato (fica só o
    mês/ano); ícones 💬/📄 trocados por SVG lucide (message-circle,
    file-text), padronizando com o ícone de e-mail. Saldo: corrigida a
    lógica de cor (antes ficava vermelho quando POSITIVO — invertido;
    agora fica vermelho quando NEGATIVO, esmeralda caso contrário),
    removido uppercase forçado ("SALDO" → "Saldo"), tamanho da fonte
    igualado ao de "Total Retirado". Total Retirado: cor trocada de
    vermelho para azul (label e valor).
  - Atrasos: botão "Cobrar Grupo" agora só aparece quando o agrupamento
    ativo é "por Locatário" — nos demais agrupamentos (Mês/Competência,
    Empreendimento) o cabeçalho do grupo fica só com o título.
  - Métricas: filtros "Imóvel" e "Período" agora têm altura idêntica
    (nova classe .raiz-filtro-altura-padrao); título da tabela mudou de
    "Detalhamento Mês a Mês (crescente)" para "Mês a Mês".

DECISÃO PENDENTE (não executada nesta versão — aguardando confirmação):
  - Campo "desconto" do contrato foi removido do FORMULÁRIO e do fluxo
    de gravação (não é mais lido nem escrito), mas a COLUNA no banco
    Supabase não foi apagada — dados históricos antigos continuam lá,
    inofensivos (não afetam mais nenhum contrato editado a partir de
    agora). Apagar a coluna de verdade requer uma migration SQL
    separada, com script de rollback — não foi feita agora por ser
    destrutiva e irreversível sem confirmação explícita do cliente.

--- HISTÓRICO ANTERIOR (Beta v1.41.0) ---


--- HISTÓRICO ANTERIOR (Beta v1.40.3) --- — ÍCONE DA SPLASH IGUAL AO DO HEADER:
  - Mascote na splash reposicionado e restilizado pra ficar EXATAMENTE
    igual ao ícone do header pós-login: mesma posição na tela (top-3
    right-14, replicando os offsets reais do botão no header — p-3=12px
    de padding + botão-Conta(36px) + gap-2(8px) = 56px=right-14), mesmo
    tamanho de botão (w-9 h-9, era w-10 h-10), mesmo SVG (21x21, era
    23x23), mesma cor (bg-emerald-800 + texto branco, era fundo branco
    + texto verde). Antes ficava no canto superior ESQUERDO — agora
    fica no canto superior DIREITO, no mesmo lugar em que vai
    "reaparecer" quando o header entra. Resultado: transição splash →
    app não faz o ícone pular de lugar nem mudar de tamanho/cor.

--- HISTÓRICO ANTERIOR (Beta v1.40.2) ---

VERSÃO: Beta v1.40.2
LINHAS: 17791
DATA: 2026-08-14
NOVIDADES (Beta v1.40.2) — CORREÇÃO DE NÚMERO + PISCADA REESTILIZADA:
  - CORRIGIDO: abrirBotWhatsapp() usava por engano o número de suporte/
    comercial humano (5511947461828) — trocado pelo número correto do
    BOT (5511978950609, Meta Cloud API / whatsapp-webhook). Os outros
    links "Falar no WhatsApp" do app (topo, rodapé, painel de conta,
    CTA pós-trial) continuam apontando pro número humano — esses
    estavam certos, só o ícone do mascote é que apontava errado.
  - Piscada do mascote REESTILIZADA — v1.40.1 tinha um squish de 150ms
    a cada 4.5s, pequeno e rápido demais pra notar. Agora: "piscadela
    dupla" (fecha/abre/fecha/abre, ~0.8s dentro de um ciclo de 5s) +
    olhos 28% maiores (r 1.4 → 1.8) + ícone geral um pouco maior
    (splash 20px → 23px, header 18px → 21px) — mais fácil de perceber
    o movimento sem ficar irritante (ainda ~84% do ciclo com olhos
    parados, abertos).

--- HISTÓRICO ANTERIOR (Beta v1.40.1) ---

VERSÃO: Beta v1.40.1
LINHAS: 17763
DATA: 2026-08-14
NOVIDADES (Beta v1.40.1) — MASCOTE R.AI.Z ANIMADO + ÍCONE TAMBÉM NO APP:
  - Ícone do bot deixou de ser o lucide "bot" genérico e virou um SVG
    próprio (mascote R.AI.Z): cabeça arredondada, antena, "orelhas"
    (hastes laterais), sorriso e dois olhos que PISCAM sozinhos — CSS
    @keyframes raiz-bot-blink (classe .raiz-bot-eye, definida no bloco
    de design tokens): scaleY(1) -> scaleY(0.12) -> volta, a cada
    4.5s, em loop infinito. transform-box: fill-box garante que o
    "fechar o olho" gira em torno do próprio olho, não do ícone
    inteiro.
  - Mensagem padrão pré-preenchida no WhatsApp trocada para "Olá, como
    o R.AI.Z - Assistente Patrimonial pode me ajudar?" (antes: "Oi!
    Preciso de ajuda para entrar...").
  - NOVO ícone do mascote também no HEADER do app (pós-login), ao lado
    do ícone de Conta (pessoa), canto superior direito — mesmo botão
    #btn-falar-bot-header, mesma função abrirBotWhatsapp(). Antes só
    existia na splash (pré-login).
  - abrirBotWhatsapp() agora detecta se já existe sessão (checando
    CLIENTE_ID_SUPABASE) para decidir onde registrar o clique:
    pré-login continua indo pra comercial.eventos_landing (pagina=
    'app_splash'); pós-login passa a gravar em log_acessos também,
    via registrarLog('bot.abrir_whatsapp', {origem:'app_header'}) —
    agora esse clique aparece no histórico de logs da pessoa, dentro
    do painel.

--- HISTÓRICO ANTERIOR (Beta v1.40.0) ---

VERSÃO: Beta v1.40.0
LINHAS: 17668
DATA: 2026-08-14
NOVIDADES (Beta v1.40.0) — ÍCONE BOT NA SPLASH (jornada de resgate de acesso):
  - Novo botão circular no canto superior ESQUERDO da splash (espelha o
    #btn-solicitar-acesso-socio, que fica no direito): ícone de robô
    (lucide "bot"), sempre visível — ao contrário do botão de sócio,
    que é condicional. onclick abre WhatsApp com o número do BOT
    (5511978950609, Meta Cloud API / whatsapp-webhook — DIFERENTE do
    número de suporte/comercial humano usado na landing e nos outros
    links do app), mensagem pré-preenchida pedindo ajuda pra entrar.
  - abrirBotWhatsapp() registra o clique em comercial.eventos_landing
    (schema comercial, mesma tabela/padrão fogo-e-esquece da landing —
    ver registrarVisitaLanding() em index.html) ANTES de abrir o
    WhatsApp. Motivo: nesse ponto (splash, pré-login) ainda não existe
    cliente_id/pessoa_id, e a policy RLS "isolamento por cliente" de
    log_acessos exige auth.uid() de sessão já autenticada — um insert
    aqui seria barrado. pagina='app_splash', utm_medium=
    'splash_icone_bot', utm_campaign='resgate_acesso'.
  - O fluxo de "Esqueci minha senha" da própria splash (esqueciSenha /
    definirNovaSenha, magic link por e-mail) NÃO foi alterado — segue
    exatamente como estava. O ícone bot é só um atalho adicional pra
    quem prefere/precisa de ajuda via WhatsApp em vez do link de e-mail.
  - Jornadas de login/reset DENTRO do bot (fluxo que roda no
    whatsapp-webhook.ts, com o cliente já identificado pelo e-mail
    digitado na conversa) devem gravar em log_acessos — usando
    service_role na Edge Function, que ignora a RLS acima. Essa parte
    do .ts está em desenvolvimento em paralelo; este HTML já está
    pronto para o gancho, não depende dele para funcionar (o ícone
    sempre abre o WhatsApp, com ou sem o bot mais elaborado no ar).

--- HISTÓRICO ANTERIOR (Beta v1.39.8) ---

VERSÃO: Beta v1.39.8
LINHAS: 17599
DATA: 2026-08-11
NOVIDADES (Beta v1.39.8) — NAVEGAÇÃO REAPLICADA NA BASE CORRETA:
  - ATENÇÃO: v1.39.0-v1.39.7 (Fase 1A: Trial/Licença/Feedback/NPS) e
    a "v1.39.0" de navegação (barra inferior + painel de conta)
    nasceram do MESMO ponto (v1.38.5) em conversas diferentes, sem
    nunca se encontrarem — dois "v1.39.0" distintos. Esta versão
    reaplica a navegação em cima da base real (esta, com todo o
    trabalho de Trial/Licença), não descarta nada do que já existia.
  - Barra inferior fixa, 5 itens, SEM condicional de plano/licença:
    Imóveis · Contratos · Recebimentos · Métricas · Distribuições.
    Diferença importante da tentativa anterior: NÃO existe mais
    nenhuma lógica de "standard vs premium" na navegação — pedido
    explícito de não mexer em nenhum gate de plano/licença agora,
    já que isso está sendo evoluído em outra frente (o sistema real
    de plano é licencas.plano_codigo — trial/standard/plus —, um
    conceito diferente do que eu tinha inventado antes só pra UI).
  - Ícone de pessoa no cabeçalho substitui o ícone de balão
    (v1.39.4) — mesmo destino (Sobre) + Suporte/Serviços juntos no
    mesmo painel. Serviços e Sobre são reais e funcionam; Pessoas,
    Status da Licença e Plano aparecem estruturados no painel mas
    marcados "Em breve" — as telas próprias ainda não existem
    (Pessoas hoje só vive dentro do DEV puro) e eu não devo mexer
    no sistema de licença real agora.
  - Vitrine e Atrasos viraram seletor "Lista / Vitrine" e "Lista /
    Atrasos" dentro de Imóveis e Recebimentos — mesmo padrão de
    antes, nenhum HTML interno dessas seções foi tocado.
  - switchTab() reescrita com mapa de aba-pai (TAB_PARENT_MAP),
    mesma lógica de antes, adaptada pra esta base.
  - RETIRADO: raiz_add_plano_cliente.sql (da tentativa anterior) —
    não se aplica mais, não precisa rodar. Ver NOTA_SQL_RETIRADO.md.
  - Validado: sintaxe JS, tags balanceadas (div/button/section/nav/
    main), zero função duplicada, zero referência órfã aos botões
    de nav antigos removidos.

--- HISTÓRICO ANTERIOR (Beta v1.39.7) ---

VERSÃO: Beta v1.39.7
LINHAS: 17400
DATA: 2026-08-07
NOVIDADES (Beta v1.39.7) — BUG DO LINK DE CONVITE:
  - Link de "Compartilhar com sócio" (aba Sobre) estava montado como
    ".../#trial?convite=xxx" — "?convite=" depois do "#" vira parte
    do fragmento (hash), não query string de verdade, então
    window.location.search na landing nunca via o parâmetro e o
    formulário não simplificava. Corrigido pra
    ".../?convite=xxx#trial" (query antes do hash) — a lógica de
    leitura na landing (v2.5.0) já estava certa, só o link que vinha
    montado errado.

--- HISTÓRICO ANTERIOR (Beta v1.39.6) ---

VERSÃO: Beta v1.39.6
LINHAS: 17380
DATA: 2026-08-07
NOVIDADES (Beta v1.39.6) — CONVITE DE SÓCIO PRO TRIAL:
  - Aba Sobre, logo abaixo de "Quero Contratar": botão novo
    "Compartilhar com sócio" (só aparece em trial). Gera link do
    WhatsApp com a landing + ?convite=<cliente_id>, mostra quantas
    vagas restam (checagem ao vivo em "pessoas", limite 5), some
    sozinho se o limite já foi atingido.
  - Depende de raiz_fase1a_correcoes_v9.sql (fn_info_convite_trial,
    fn_entrar_trial_convite) e da landing index.html v2.5.0.
  - Quem entra pelo convite NÃO cria empresa nova — vira mais um
    acesso (perfil operador, função "Sócio") na MESMA empresa trial.
    Validação de limite/validade do trial roda de novo no banco,
    não confia só na checagem que a landing já fez antes.

--- HISTÓRICO ANTERIOR (Beta v1.39.5) ---

VERSÃO: Beta v1.39.5
LINHAS: 17334
DATA: 2026-08-07
NOVIDADES (Beta v1.39.5) — CORREÇÕES DE TESTE REAL (4ª rodada):
  - Assinatura cursiva do recibo: fonte reduzida de 42px pra 21px —
    estava gigante, parecia 3 palavras soltas em vez de assinatura.
  - fn_criar_trial (SQL v8): cidade do recibo agora nasce como
    "imóvel" (era "empresa") — trial não preenche cidade própria, o
    recibo saía sem cidade de emissão.
  - Formulário de contrato: labels simplificados (Status, Vencimento,
    Aluguel (R$)). Campo de IPTU deixou de ser só um texto informativo
    e virou pergunta Sim/Não ("Locatário paga: IPTU / Condomínio"),
    mesmo padrão que Condomínio já tinha. Novo campo
    contratos.locatario_paga_iptu (SQL v8).
  - DEV: painel de licença estava estourando a largura da tela (inputs
    lado a lado demais) — layout agora empilhado, largura total.
  - DEV: nova seção "Apagar Empresa e Acessos" (só master, só depois
    de "Limpar Sistema", dupla confirmação) — apaga a empresa e todos
    os acessos vinculados (sem tocar no login de ninguém), redireciona
    pra tela de login. fn_apagar_empresa_completa (SQL v8).
  - Cabeçalho: "Sair" saiu dali (ficou só o ícone de balão, que leva
    pra Sobre); "Sair" agora mora dentro da aba Sobre.

--- HISTÓRICO ANTERIOR (Beta v1.39.4) ---

VERSÃO: Beta v1.39.4
LINHAS: 17217
DATA: 2026-08-07
NOVIDADES (Beta v1.39.4) — CORREÇÕES DE TESTE REAL (3ª rodada):
  - BUG CRÍTICO CORRIGIDO — "Dar Baixa" e excluir recebimento não
    faziam nada: saveAll() não redesenhava renderMensalidades() (nem
    Inadimplência/Distribuições/Relatórios/Pendências) depois de
    salvar. Quando uma mensalidade trocava de id local→real (Supabase),
    os botões da tela continuavam presos ao id antigo — clique rodava
    a função, não achava o item, terminava sem erro nenhum. Corrigido
    em 2 camadas: (1) saveAll() agora redesenha essas 5 telas também;
    (2) liquidarMensalidade()/excluirLancamentoMensal() reescritas pra
    sincronizar só a linha alterada (não a lista inteira — resolve
    também a lentidão fora do normal relatada) e se autocorrigir
    (toast + redesenha) se acharem um id desatualizado, em vez de
    falhar em silêncio. excluirLancamentoMensal também tinha uma race
    condition real (delete() disparado sem await) — corrigida.
  - Formulário de contrato: asterisco (*) nos 6 campos obrigatórios
    que não tinham (Imóvel, Locatário, Documento, Vencimento, Início/
    Fim Vigência, Valor). Label "Documento (CPF ou CNPJ)" encurtado
    pra "CPF/CNPJ" — quebrava a tela no mobile.
  - DEV: painel de licença ganhou botão "Estender +7 dias", campo de
    data de expiração editável, e campos de limite de imóveis/
    contratos editáveis por empresa (override — vazio = usa o limite
    do plano). Depende de raiz_fase1a_correcoes_v7.sql.
  - Ícone de feedback: deixou de ser flutuante (atrapalhava o
    conteúdo) — agora é um botão fixo no cabeçalho, ao lado do "Sair",
    que leva direto pra aba Sobre.
  - "Sobre" removido do menu de abas (só acessível pelo ícone novo).
  - Aba Sobre redesenhada: compacta (sem rolagem na maioria das
    telas), texto descritivo grande virou rodapé pequeno tipo
    copyright (versão, site, nome da empresa), bloco de dúvidas/
    sugestões (zap + e-mail + texto livre, tudo junto, sem modal)
    movido pra logo após a licença.
  - fn_criar_trial (SQL v7): agora grava e-mail do lead (faltava),
    função "Proprietário" e 100% de posse por padrão pro usuário do
    trial.

--- HISTÓRICO ANTERIOR (Beta v1.39.3) ---

VERSÃO: Beta v1.39.3
LINHAS: 17011
DATA: 2026-08-07
NOVIDADES (Beta v1.39.3) — CORREÇÕES DE TESTE REAL (2ª rodada):
  - fn_criar_trial (SQL v5) agora também cria pessoa para o(s)
    master(s) na empresa nova — sem isso, toda empresa criada via
    trial ficava invisível na tela de seleção do master pra sempre
    (não existe "master vê tudo" automático, é por linha em pessoas).
  - Tela de seleção de empresa: falha ao carregar licenças (que
    antes só ia pro console, silenciosa) agora aparece como aviso
    visível embaixo do filtro — sintoma "filtro específico sempre
    vazio, 'todos' sempre cheio" era exatamente esse erro escondido.

--- HISTÓRICO ANTERIOR (Beta v1.39.2) ---

VERSÃO: Beta v1.39.2
LINHAS: 16977
DATA: 2026-08-07
NOVIDADES (Beta v1.39.2) — ABA SOBRE: CARTÃO DE PLANO/LICENÇA:
  - Novo card em tab-sobre (atualizarSecaoSobreLicenca()), chamado uma
    vez no login: mostra o plano atual, e se for trial, quantos dias
    faltam pra expirar + botão "Quero Contratar" (mesmo mecanismo de
    log de interesse dos outros pontos). Não faz consulta nova — usa
    LICENCA_ATUAL, já carregado em entrarNaEmpresa().
  - Correções de bug reportadas em teste real (perfil de trial errado,
    RLS de feedback falhando pra quem não é master, filtro de plano
    sem dado pra filtrar) foram todas no SQL — ver
    raiz_fase1a_correcoes_v4.sql. Nenhuma outra mudança de código
    aqui além do card novo.

--- HISTÓRICO ANTERIOR (Beta v1.39.1) ---

VERSÃO: Beta v1.39.1
LINHAS: 16899
DATA: 2026-08-07
NOVIDADES (Beta v1.39.1) — TRIAL HANDOFF (landing → app):
  - window.onload agora detecta #access_token/#refresh_token/
    type=trial_handoff no hash da URL (chegando do formulário de
    trial na landing page, index.html v2.2.0) — aplica via
    dbAuth.auth.setSession() e limpa a URL antes do resto do fluxo
    normal de login rodar. Mesma técnica que o Supabase usa em
    magic link, então a pessoa que acabou de se cadastrar cai
    direto dentro do sistema, sem digitar login de novo.
  - Sem mudança em nenhum outro fluxo — quem chega sem esse hash
    (login normal) segue exatamente como antes.

--- HISTÓRICO ANTERIOR (Beta v1.39.0) ---

VERSÃO: Beta v1.39.0
LINHAS: 16862
DATA: 2026-08-07
NOVIDADES (Beta v1.39.0) — FASE 1A: TRIAL, LICENÇA, FEEDBACK E NPS:
  - Nova aba de controle: LICENCA_ATUAL (global) carregada em
    entrarNaEmpresa(), a partir da tabela "licencas" (Supabase) —
    plano_codigo, status, data_inicio, data_expiracao. Carregada
    ANTES de aplicarBrandingCliente(), pois o recibo depende disso.
  - BANNER DE LIMITE: abrirFormularioImovel() e
    abrirFormularioContrato() agora chamam fn_verificar_limite()
    (RPC) antes de abrir o formulário. Se o plano estourou o limite
    (trial: 3 imóveis / 3 contratos), mostra banner "Contrate agora"
    com link direto pro WhatsApp, em vez do formulário. O trigger
    de bloqueio hard no banco continua sendo a proteção real — isto
    aqui é só pra melhor experiência (evita o usuário preencher o
    formulário todo pra descobrir o bloqueio só no final).
  - SELEÇÃO DE EMPRESA: mostrarSelecaoEmpresa() agora busca as
    licenças de todas as empresas do login em bloco, mostra selo
    "TRIAL" ao lado do nome, e tem um filtro por plano
    (Todos/Trial/Standard/Plus) acima da lista.
  - ABA DEV: nova seção "🎫 Licença desta empresa" — mostra plano,
    status, datas, uso/limite de imóveis e contratos (via
    fn_verificar_limite), botão de liga/desliga manual (muda
    licencas.status entre 'ativo'/'suspenso') e botão "Quero
    Contratar" (log manual, útil pra teste).
  - LOG DE INTERESSE EM CONTRATAR: sem tabela nova — clique em
    "Contrate agora" (banner) ou "Quero Contratar" (DEV) grava em
    log_acessos via registrarLog('licenca.interesse_contratacao',
    {...}), reaproveitando a infraestrutura de log já existente.
  - FEEDBACK LIVRE: ícone flutuante (canto inferior esquerdo,
    sempre visível após login) abre formulário de texto livre,
    grava na nova tabela "feedback" (origem: 'icone_suspenso').
  - NPS NO 3º ACESSO: fn_registrar_login() (RPC) incrementa o
    contador de login da pessoa a cada entrada; no exato 3º acesso
    (e só uma vez, controlado por flag no banco), dispara popup de
    1-5 estrelas + comentário livre, gravado via
    fn_registrar_feedback_terceiro_acesso() (RPC).
  - ASSINATURA PADRÃO DE TRIAL: aplicarBrandingCliente() — quando a
    empresa está em trial E ainda não tem assinatura própria
    cadastrada (assinatura_url vazio), mostra o nome do responsável
    (ou da empresa) na fonte cursiva Mrs Saint Delafield (mesma da
    rubrica digital) no espaço da assinatura do recibo, só pra dar
    a ideia visual de como fica quando configurado de verdade.
  - DEPENDE do SQL de migração já aplicado no Supabase:
    raiz_fase1a_licencas_trial_v3.sql (tabelas licencas/feedback,
    coluna "limite" em plano_funcionalidade, funções
    fn_verificar_limite / fn_registrar_login /
    fn_registrar_feedback_terceiro_acesso, triggers de bloqueio
    hard em imoveis/contratos).
  - Validado: sintaxe JS (node --check) limpa, tags balanceadas
    (div/section/button/span/table/tr/td/style), 11 abas intactas.

--- HISTÓRICO ANTERIOR (Beta v1.38.5) ---

VERSÃO: Beta v1.38.5
LINHAS: 16409
DATA: 2026-08-07
NOVIDADES (Beta v1.38.5) — RECIBO: ORDEM CORRETA DA ASSINATURA:
  - CORRIGIDO DE VERDADE (a correção da v1.38.3 tirou a altura
    fixa, mas não resolveu o problema real): a ORDEM dos elementos
    estava errada, não só a altura. A imagem da assinatura era
    inserida DENTRO da caixa com border-top, antes do nome — ou
    seja, a linha vinha ANTES da assinatura no fluxo (linha →
    assinatura → nome), quando o certo é assinatura em cima,
    depois a linha, depois o nome embaixo (como se fosse assinar
    em cima de uma linha impressa).
  - Criado um espaço dedicado (#pdf-assinatura-espaco) ACIMA da
    caixa com a linha — é ali que a imagem da assinatura entra
    agora via JS. A caixa com border-top passou a conter só nome +
    cargo/CNPJ, que ficam corretamente abaixo da linha.
  - Data/cidade também aproximada do texto principal (margem de
    25px para 12px) — "Nova Lima, 07 de agosto de 2026." aparece
    mais colado ao parágrafo, menos espaço solto no meio do
    recibo.
  - Validado: sintaxe JS, tags balanceadas, 11 abas intactas.

--- HISTÓRICO ANTERIOR (Beta v1.38.4) ---

VERSÃO: Beta v1.38.4
LINHAS: 16383
DATA: 2026-08-07
NOVIDADES (Beta v1.38.4) — VERSÃO DA SPLASH, DE VEZ:
  - CORRIGIDO: versão exibida no app estava travada em "Beta
    v1.37.0" desde a v1.37.1 — 5 versões seguidas sem atualizar,
    apesar de já estar documentado como pendência recorrente.
  - Criada fonte ÚNICA de verdade: const APP_VERSAO no topo do
    script. window.onload aplica automaticamente na splash
    (#logo-splash-versao-texto) e no Sobre (#sobre-versao-badge)
    assim que a página carrega — os dois sempre em sincronia,
    sem depender de lembrar de editar 2 lugares a cada release.
    Removida a lógica antiga que copiava o texto da splash pro
    Sobre (redundante agora que os dois vêm da mesma constante).
  - A partir de agora, atualizar a versão a cada release é só
    mudar o valor de APP_VERSAO (1 linha) — não precisa mais tocar
    em nenhum HTML.
  - Validado: sintaxe JS, tags balanceadas.

--- HISTÓRICO ANTERIOR (Beta v1.38.3) ---

VERSÃO: Beta v1.38.3
LINHAS: 16347
DATA: 2026-08-07
NOVIDADES (Beta v1.38.3) — RECIBO: OBSERVAÇÃO, ASSINATURA, ÍCONES:
  - ⚠️ REQUER MIGRAÇÃO DE BANCO antes de usar em produção: rodar
    raiz_add_observacao_recibo.sql (adiciona a coluna
    observacao_recibo na tabela mensalidades) em cada instalação.
  - CORRIGIDO (bug real de dado vazando pro cliente): "observacao"
    era usado misturado pra nota interna de conciliação bancária
    E pro texto que imprime no recibo — às vezes uma nota técnica
    tipo "Conciliado automaticamente via extrato — pagador: X"
    podia acabar aparecendo no recibo do locatário. Agora são 2
    campos: observacao (interna, nunca aparece no recibo) e
    observacaoRecibo (aparece no "Vale ressaltar que..." do
    recibo). liquidarMensalidade() — dar baixa manual, onde a
    pessoa digita algo tipo "Desconto" e/ou lança energia/multa/
    taxa — grava em observacaoRecibo (é conteúdo pra aparecer no
    recibo). As notas automáticas de conciliação bancária
    continuam em observacao (interna, correto). O card na aba
    Recebimentos agora mostra os dois separadamente: "Nota
    interna" (âmbar) e "No recibo" (verde) — cada um só aparece
    se tiver conteúdo.
  - CORRIGIDO: assinatura/nome/data no recibo com posicionamento
    inconsistente dependendo do tamanho do texto acima. Causa
    raiz: o bloco de assinatura usava position:absolute dentro de
    uma altura fixa de 65px — a imagem da assinatura (45px) mais
    nome e subtítulo frequentemente ultrapassavam essa altura,
    causando sobreposição que variava conforme o texto do
    parágrafo acima (nome da empresa, endereço, observação)
    empurrava as coisas de forma diferente. Removida a altura
    fixa e o position:absolute — o bloco agora flui naturalmente
    após "cidade, data", se ajustando ao próprio conteúdo sempre.
  - Sobre o popup "app.raizpatrimonio.com.br diz" ao clicar no
    botão "⋯" antigo: essa é a barra de título PADRÃO do
    navegador pra qualquer alert() nativo — não é customizável via
    CSS/HTML/JS, é uma proteção de segurança do próprio Chrome
    contra sites forjarem diálogos falsos. Removido nesta versão o
    ÚNICO alert() que causava isso (o botão "⋯" de "ver valores"),
    já que deixou de ser necessário com observacao/observacaoRecibo
    separados. Ainda existem outros alert()/confirm() no sistema
    (principalmente erro/confirmação destrutiva) que vão continuar
    mostrando esse mesmo prefixo do navegador — não tem como tirar
    sem trocar cada um por um modal customizado (trabalho maior,
    separado desta correção).
  - Ícones: botão "⋯" de Energia/Multa/Taxa (alternarMenuBaixaExtra)
    trocado por SVG (more-horizontal). Mais 1 📍 residual (local do
    imóvel no card de Recebimentos) trocado por SVG (map-pin).
  - Validado: sintaxe JS, tags balanceadas (div/button/section/
    form/span/p), 11 abas intactas, zero função duplicada.

--- HISTÓRICO ANTERIOR (Beta v1.38.2) ---

VERSÃO: Beta v1.38.2
LINHAS: 16284
DATA: 2026-08-07
NOVIDADES (Beta v1.38.2) — LOG DE BAIXA, ESTORNO E RECIBO:
  - CONFIRMADO E CORRIGIDO: dar baixa, estornar e gerar recibo NÃO
    geravam log, ao contrário de outras ações equivalentes (criar/
    editar/excluir imóvel, contrato, prestador, excluir mensalidade,
    gerar vitrine — todas já usavam registrarLog()). Adicionados 4
    pontos de log, cobrindo os 2 caminhos de "dar baixa" que
    existem no sistema (manual E conciliação bancária automática):
      - liquidarMensalidade() → registrarLog('mensal.baixar', ...),
        com via:'manual'
      - conciliarTransacoes() → registrarLog('mensal.baixar', ...)
        por item conciliado automaticamente, com
        via:'conciliacao_automatica' — essa era a lacuna mais
        importante, já que é uma baixa que acontece sem
        supervisão direta no momento
      - estornarMensalidade() → registrarLog('mensal.estornar', ...)
      - dispararAcaoDoMenu() → registrarLog('recibo.gerar', ...)
        para os canais pdf/zap/email (não conta "visualizar na
        tela", que não gera nem envia nada)
  - Segue o mesmo padrão já estabelecido no resto do sistema:
    fire-and-forget (sem await, registrarLog já trata erro
    internamente), gravado em log_acessos via Supabase.
  - O filtro de "Área"/"Ação" da tela de Log do Sistema (DEV) é
    populado dinamicamente a partir dos dados reais — não precisou
    de nenhuma lista fixa pra atualizar; as novas ações aparecem
    sozinhas assim que existir pelo menos 1 registro de cada.
  - Validado: sintaxe JS, tags balanceadas, zero função duplicada.

--- HISTÓRICO ANTERIOR (Beta v1.38.1) ---

VERSÃO: Beta v1.38.1
LINHAS: 16242
DATA: 2026-08-07
NOVIDADES (Beta v1.38.1) — CORREÇÕES DA HOMOLOGAÇÃO NO CELULAR:
  - CORRIGIDO (bug real): botão "Próximo" duplicado no formulário
    multi-step de imóvel. Causa raiz: as divs de navegação entre
    passos (Próximo do Passo 1, Voltar/Próximo do Passo 2) nunca
    tinham classe "hidden" — só o conteúdo dos campos escondia,
    os botões de transição ficavam sempre visíveis e se
    empilhavam. Corrigido movendo cada botão de navegação pra
    dentro da própria div do step correspondente (mesmo padrão já
    usado no Passo 3), eliminando a necessidade de um id extra
    controlado separadamente.
  - CORRIGIDO (bug real): ícones sumindo/aparecendo em branco,
    principalmente na aba Imóveis. Causa raiz: 8 funções de
    renderização de lista (renderImoveis, renderContratos,
    renderMensalidades, renderInadimplencia, renderSociosDistribricao,
    renderAdministradoras, renderSindicos, renderManutencistas)
    nunca chamavam lucide.createIcons() depois de montar a lista —
    só a troca de aba (switchTab) disparava isso, então ícones
    renderizados por outros motivos (filtro, etc.) ficavam com o
    <svg> vazio até a próxima troca de aba. Adicionada a chamada
    no fechamento de cada uma das 8 funções.
  - CORRIGIDO: label "Aluguel Alvo (R$) *" quebrando linha no grid
    de 3 colunas (Condomínio/IPTU/Aluguel). Aluguel Alvo agora tem
    linha própria em largura total — também dá mais destaque ao
    campo obrigatório mais importante do passo.
  - Ícones: mais 23 emoji trocados por SVG, achados numa varredura
    ampla após o teste no celular apontar "ícones no modelo antigo"
    em editar imóvel/contrato/síndico/manutencista/administradora
    e criar contrato a partir de imóvel. Também cobertos: chamar
    manutenção via WhatsApp, o menu inteiro de gerar recibo
    (visualizar na tela/PDF/WhatsApp/E-mail), endereço e valor no
    card do imóvel, histórico de contrato, alerta de contrato,
    badge de anexo, envio de resumo de sócio por e-mail, log de
    notificação de mensalidade.
  - Terminologia: "Inadimplente"/"Inadimplência" trocado por
    "Atrasado"/"Atraso" em todo texto VISÍVEL ao usuário — aba
    Atrasos (label "Taxa de Atraso", badge por lançamento, badge de
    grupo, botão e mensagens de apagar), aba Métricas (cabeçalho de
    coluna, coluna "% Atraso", legenda explicativa) e no PDF de
    Métricas ("SALDO EM ATRASO"). Decisão consciente: o valor
    INTERNO de status ('Inadimplente', usado em dezenas de
    comparações de código como status === 'Inadimplente') NÃO foi
    alterado — é lógica de negócio/dado gravado, mudar isso seria
    um refactor maior e arriscado, fora do que foi pedido.
  - Validado: sintaxe JS, tags balanceadas (div/button/section/
    form/a/span), 11 abas intactas, zero função duplicada, ids de
    step do formulário únicos.

--- HISTÓRICO ANTERIOR (Beta v1.38.0) ---

VERSÃO: Beta v1.38.0
LINHAS: 16177
DATA: 2026-08-07
NOVIDADES (Beta v1.38.0) — ÍCONES FINAIS + FORMULÁRIO MULTI-STEP:
  - Ícones: mais 18 emoji trocados por SVG (🗑️ excluir, 📋 listas/
    extratos, ⚠️ envio pendente, ⚡ energia, ✕ remover sócio),
    cobrindo Imóveis, Contratos, Recebimentos, Atrasos, Distribuições
    e Serviços. Mapeamento novo (🗑️→trash-2, 📋→clipboard-list ou
    copy conforme o botão) não estava no design system original —
    adicionado agora. Restam ~30 emoji, todos DE PROPÓSITO: dentro
    de .innerText/.textContent (CPF/CNPJ, status de e-mail),
    mensagens de WhatsApp (texto puro enviado pro app externo,
    inclui formatação *negrito* do próprio WhatsApp), e telas
    DEV/Parametrizações (fora de escopo, cliente final não usa).
  - Formulário de novo/editar imóvel dividido em 3 passos:
    1) Localização (empreendimento, tipo, endereço completo)
    2) Valores (tamanho, aluguel, condomínio, IPTU)
    3) Extras e Sócios (descrição, energia, síndico/manutenção,
       divisão societária, fotos — e o botão Salvar)
    Navegação com indicador de passo (3 pontinhos), botões
    Voltar/Próximo, validação própria em JS por passo (não depende
    do required nativo do navegador em campo escondido — problema
    clássico de formulário multi-step que trava sem avisar). Campos
    obrigatórios marcados com * vermelho ao lado do label, incluindo
    "Sócios e Porcentagem" (obrigatório por regra de negócio já
    existente em saveImovel — soma tem que fechar 100%).
  - Aplica tanto para CRIAR quanto EDITAR imóvel (mesmo form) —
    sempre reinicia no Passo 1 ao abrir, nos dois fluxos
    (abrirFormularioImovel via cancelarEdicaoImovel, e editarImovel
    diretamente).
  - Validado: sintaxe JS, tags balanceadas (incluindo checagem
    isolada de divs só dentro do form-imovel), 3 ids de step
    únicos, nenhuma função duplicada.
  - NÃO incluído nesta versão: reorganização/agrupamento da barra
    de navegação — adiado a pedido do cliente, ver
    PROPOSTA_REORGANIZACAO_ABAS_v2.md para retomar quando decidido.

--- HISTÓRICO ANTERIOR (Beta v1.37.2) ---

VERSÃO: Beta v1.37.2
LINHAS: 16026
DATA: 2026-08-07
NOVIDADES (Beta v1.37.2) — NOMENCLATURA DE 1 PALAVRA:
  - "Pagamentos Atrasados" → "Atrasos" (nav + título interno).
    "Pendências" não foi usado de propósito — já é o termo da
    conciliação bancária (Pendências do Extrato Importado), evitar
    colisão de conceito.
  - "Sócios" (nav) / "Quem Ganha o Quê" (título) → unificados em
    "Distribuições" nos dois lugares. Escolhido em vez de
    "Retiradas" porque a aba cobre tanto o crédito quanto a
    retirada de cada sócio — "Retiradas" descreveria só metade do
    que a aba faz. Rótulo do filtro "Filtrar por Sócio" mantido
    sem mudança (refere-se à pessoa, não ao nome da aba).
  - Reorganização/agrupamento da barra de navegação (proposta
    híbrida: barra fixa + tela "Mais") NÃO foi implementada nesta
    versão — discutida e aprovada em conceito, mas explicitamente
    adiada a pedido do cliente para focar só em nomenclatura por
    ora. Ver PROPOSTA_REORGANIZACAO_ABAS_v2.md para retomar quando
    decidido.
  - Validado: sintaxe JS, tags balanceadas, 11 abas intactas,
    nenhuma dependência de JS no texto dos botões renomeados.

--- HISTÓRICO ANTERIOR (Beta v1.37.1) ---

VERSÃO: Beta v1.37.1
LINHAS: 16026
DATA: 2026-08-07
NOVIDADES (Beta v1.37.1) — AJUSTES PÓS-REVISÃO:
  - Ícones: 29 emoji trocados por SVG (Lucide) nas telas de maior
    tráfego (botões fechar/cancelar, badges de energia/alerta,
    botão "+"). Deixados como emoji DE PROPÓSITO: os que estão
    dentro de alert()/confirm() (texto puro, não renderiza HTML),
    de .innerText/.textContent (idem), e o texto de mensagem do
    WhatsApp de cobrança (enviado como texto puro pro app externo).
    Ícones de tab-developer/tab-parametrizacoes continuam fora de
    escopo (telas internas, ver v1.36.0).
  - Removidos 3 títulos duplicados: "Lista Patrimonial" (aba
    Imóveis, já tinha "Imóveis" no topo); "Fila de Recebimentos"
    (aba Recebimentos, já tinha um título no topo — trocado de
    "Faturamento Mensal" para "Recebimentos"); "Painel de
    Inadimplência" → "Pagamentos Atrasados" (aba já se chama assim
    na navegação, mas o título interno ainda dizia o nome antigo).
    Encontrado durante a revisão (não estava na lista original, mas
    é o mesmo bug): aba Métricas tinha "Filtros das Métricas" como
    título principal, repetindo quase a mesma coisa do "Filtrar
    Métricas" logo abaixo — corrigido para só "Métricas".
  - Corrigido: badge de versão da aba Sobre estava sincronizando
    corretamente (JS ok), mas a FONTE que ele copia — o texto da
    splash — estava hardcoded em "Beta v1.35.0" desde antes das
    sprints 1-3, nunca atualizado. Corrigido para v1.37.1 nos dois
    lugares (splash + fallback estático do badge). Fica registrado
    aqui: a cada release, atualizar a versão em
    #logo-splash-versao-texto (linha ~2016) além do header deste
    comentário — são 2 lugares, não 1 (changelog anterior estava
    impreciso nisso).
  - Aba Sobre: removido e-mail pessoal (nsadutra@gmail.com) da UI.
    Bloco de contatos redesenhado — separado em "Tecnologia"
    (info institucional + link do site) e "Dúvidas, suporte ou
    sugestões?" (2 botões diretos: WhatsApp e E-mail, ambos para
    contato@raizpatrimonio.com.br / (11) 94746-1828).
  - Validado: sintaxe JS (node --check), tags balanceadas
    (div/button/section/a), zero função duplicada, 11 abas intactas.

--- HISTÓRICO ANTERIOR (Beta v1.37.0) ---

VERSÃO: Beta v1.37.0
LINHAS: 16026
DATA: 2026-08-07
NOVIDADES (Beta v1.37.0) — TERMINOLOGIA + TOAST (Sprint 3):
  - Renomeados 4 rótulos visíveis para linguagem não-técnica: aba
    "Mensal" → "Recebimentos"; aba "Inadimplência" → "Pagamentos
    Atrasados"; aba "Parametrizações" → "Configurações"; título da
    aba Sócios "Prestação de Contas Societária" → "Quem Ganha o
    Quê" (+ filtro "Filtrar Prestação de Contas" → "Filtrar por
    Sócio"). Confirmado antes: nenhum JS lê o texto desses botões,
    só o id (não alterado) — renomeação segura.
  - "Divisão de Repasse" e "Rubricas" NÃO foram mexidos: o primeiro
    só existe como nome de variável interna (con.divisaoRepasse),
    nunca aparece pro usuário; o segundo não existe no arquivo real.
  - Toast (mostrarToast()) substituindo o alert() de sucesso dentro
    de saveAll() — não bloqueia mais a tela esperando clique em OK.
    O alert() de FALHA foi mantido de propósito (já mostra detalhe
    específico por item, rico demais pra virar toast genérico).
  - Corrigidos 4 pontos que salvavam em silêncio total (zero
    feedback, nem alert nem toast): dar baixa manual de mensalidade,
    estornar mensalidade, descartar pendência de extrato, salvar
    observação do recibo — cada um agora informa o resultado.
  - Validado: sintaxe JS (node --check), tags balanceadas, zero
    função duplicada, rota 'pendenciasExtrato' conferida contra o
    objeto todasAsRotas antes de usar.

--- HISTÓRICO ANTERIOR (Beta v1.36.0) ---

VERSÃO: Beta v1.36.0
LINHAS: 15886
DATA: 2026-08-07
NOVIDADES (Beta v1.36.0) — DESIGN SYSTEM + ONBOARDING (Sprints 1 e 2):
  - SPRINT 1 (Design System): paleta do Tailwind sobrescrita via @theme
    (emerald→pine, slate+gray→neutro unificado, red→danger, amber→
    warning/brass, green→success, yellow→energia) — mesma marca da
    landing page (www.raizpatrimonio.com.br), sem editar as ~875
    classes de cor já espalhadas pelo arquivo. Tipografia de marca
    (Bricolage Grotesque + Inter) adicionada. Lucide icons carregado
    (lucide.createIcons() plugado em window.onload, switchTab() e
    após montagem do app em entrarNoSistema()). Ver
    DESIGN_SYSTEM_RAIZ_PATRIMONIO.md para a referência completa.
  - SPRINT 2 (Onboarding): modal de 3 passos (Cadastre um imóvel →
    Crie um contrato → Registre recebimentos), só aparece para quem
    ainda não tem nenhum imóvel cadastrado (imoveis.length === 0) e
    ainda não fechou o onboarding antes nesse navegador (flag em
    localStorage via chaveLocal('onboardingConcluido') — decisão
    deliberada de não migrar o Supabase nesta sprint). Botão final
    abre abrirFormularioImovel() direto.
  - Validado: sintaxe JS (node --check), balanceamento de tags HTML
    (div/button/section), ausência de funções JS duplicadas.
  - Fora de escopo desta sprint (fica para depois): telas internas
    tab-developer/tab-parametrizacoes (indigo/teal/purple) não
    receberam a paleta nova — só uso interno, cliente final não vê.

--- HISTÓRICO ANTERIOR (Beta v1.35.0) ---

VERSÃO: Beta v1.35.0
LINHAS: 15640
DATA: 2026-08-02
NOVIDADES (Beta v1.35.0):
  - Aba Sobre: contatos oficiais atualizados — WhatsApp (11)
    94746-1828, site www.raizpatrimonio.com.br, e adicionado o
    e-mail contato@raizpatrimonio.com.br (mantido também
    nsadutra@gmail.com)
  - Abas Imóveis e Contratos: título adicionado no topo, no mesmo
    padrão da aba Mensal (título + botão de "+" na mesma linha); o
    resumo (contador de vagos/alugados, ativos/suspensos etc.)
    passou para uma linha própria logo abaixo

--- HISTÓRICO ANTERIOR (Beta v1.34.0) ---

VERSÃO: Beta v1.34.0
LINHAS: 15618
DATA: 2026-08-01
NOVIDADES (Beta v1.34.0):
  - Cadastro de imóvel: a partir do 2º imóvel CRIADO na mesma
    sessão, o formulário de "novo imóvel" já vem pré-preenchido com
    empreendimento, tipo, endereço (rua/número/bairro/cidade),
    tamanho, descrição, valor, condomínio, IPTU, valor de mercado e
    energia do imóvel anterior — mesmo padrão já usado para a
    divisão de sócios (só dentro da sessão, some ao recarregar a
    página). Complemento, foto e código do IPTU continuam sempre em
    branco, de propósito. Abrir um imóvel para EDITAR (salvando ou
    não) não altera esse padrão — só criar um imóvel novo atualiza

--- HISTÓRICO ANTERIOR (Beta v1.33.0) ---

VERSÃO: Beta v1.33.0
LINHAS: 15556
DATA: 2026-08-01
NOVIDADES (Beta v1.33.0):
  - Removido o badge de versão do cabeçalho superior — fica só o
    nome da empresa
  - Aba Sobre reestruturada: removido o texto "Este sistema é";
    CNPJ e cidade/UF da empresa agora aparecem centralizados,
    abaixo do nome; "Gestão de imóveis e patrimônio familiar"
    movido para a seção de tecnologia (perto de "Raiz Patrimônio")
  - Badge de versão da aba Sobre agora sincroniza sozinho com a
    versão real do sistema (antes estava fixo em "BETA v1.1.0",
    congelado desde a primeira versão) — só precisa atualizar a
    versão em 1 lugar (a splash) daqui pra frente

--- HISTÓRICO ANTERIOR (Beta v1.32.0) ---

VERSÃO: Beta v1.32.0
LINHAS: 15526
DATA: 2026-08-01
NOVIDADES (Beta v1.32.0):
  - CORRIGIDO (bug real — anexo de contrato duplicado no histórico):
    ao salvar um anexo, uma entrada genérica extra ("Documentos: - →
    nome") era criada além da entrada específica que já existia —
    parecia duplicado porque, na prática, era mesmo duplicado.
    Removida a entrada genérica redundante
  - CORRIGIDO (bug real — anexo excluído continuava aparecendo ao
    reabrir o contrato, mesmo com o banco certo): a reconstrução dos
    anexos ao carregar o contrato não verificava se existia uma
    entrada de remoção mais recente para aquele arquivo. Também
    corrigido: reabrir o MESMO contrato na mesma sessão (sem
    recarregar a página) agora reflete a remoção corretamente — antes
    só atualizava o formulário, não o registro global do contrato
  - CORRIGIDO (bug real — valores de multa/taxa lançados no menu "⋯"
    da aba Mensal nunca eram salvos; sumiam ao estornar): agora são
    lidos e viram um resumo dentro da observação interna ao dar
    baixa (não existe coluna própria no banco para isso, mesma
    solução já usada para energia)
  - Lançamentos já pagos ganharam um botão "⋯" para ver os valores
    lançados (energia/multa/taxa), sem poder alterar
  - CORRIGIDO: ícone de energia duplicado no card da Vitrine (sobrou
    uma ocorrência da versão antiga, além da nova ao lado do status)
  - Campo de valor quebrando linha corrigido em: lista de
    Inadimplência, totalizador de Aluguéis/Retiradas em Sócios
    (valor agora fica embaixo do rótulo), e lista de lançamentos de
    crédito em Sócios

⚠️ AINDA NÃO NESTA RODADA (lista grande, ficou pendente): mesma
correção de largura na lista de débito/retirada em Sócios (só a de
crédito foi ajustada); renomear "Métricas" para "Resultados";
reinvestigar o filtro de período em Métricas (a correção anterior
pode não ter resolvido de vez); posição do título no topo de
Imóveis/Contratos igual à de Mensal; ícone de clipe para
contrato/imóvel com anexo/foto; botão "Salvar" dentro do menu "⋯"
antes de dar baixa; bloquear edição direta do Valor Vigente +
botão de reajuste sobreposto; aba Sobre.

--- HISTÓRICO ANTERIOR (Beta v1.31.0 — segurança) ---

VERSÃO: Beta v1.31.0
LINHAS: 15409
DATA: 2026-08-01
NOVIDADES (Beta v1.31.0) — CORREÇÃO CRÍTICA DE SEGURANÇA:
  - CORRIGIDO (bug grave — link de redefinir/criar senha dava
    acesso completo ao sistema SEM exigir senha nenhuma): ao
    carregar a página, o código verificava só "existe uma sessão
    válida?" e, se sim, entrava direto no sistema. Só que clicar num
    link de "definir senha" TAMBÉM cria uma sessão válida no
    Supabase — de propósito, é assim que a pessoa consegue trocar a
    senha sem já ter uma antiga. O código não diferenciava as duas
    situações: uma sessão vinda só do link de recuperação entrava
    direto no sistema, sem nunca mostrar a tela de definir senha, e
    sem a pessoa nunca ter digitado senha nenhuma. Corrigido: agora
    verifica se a URL indica um fluxo de recuperação antes de
    entrar automaticamente — se for, deixa a tela de definir senha
    assumir primeiro, como já era o previsto

⚠️ IMPORTANTE: teste esse fluxo de novo depois de subir esta versão
— gere um novo link de teste (o link antigo, se ainda não usado,
pode continuar válido e reproduzir o problema até expirar sozinho).

--- HISTÓRICO ANTERIOR (Beta v1.30.0) ---

VERSÃO: Beta v1.30.0
LINHAS: 15371
DATA: 2026-08-01
NOVIDADES (Beta v1.30.0):
  - Aba Inadimplência: resumo (Total em Aberto / Taxa Inadimplência)
    movido para antes dos filtros, conforme o padrão pedido
  - Ícone de energia na Vitrine: trocado de mensagem grande
    ("⚡ Energia disponível" em caixa própria) para o mesmo badge
    pequeno usado no card do imóvel (⚡ ao lado do status)

⚠️ AINDA NÃO NESTA RODADA: reordenação padrão completa em Imóveis e
Contratos (Inadimplência já ajustada); bloquear edição direta do
Valor Vigente + botão de reajuste sobreposto; aba Sobre com
logo/nome/ícones no padrão do resto do sistema. Passo a passo do
Supabase entregue em texto, fora do arquivo.

--- HISTÓRICO ANTERIOR (Beta v1.29.0) ---

VERSÃO: Beta v1.29.0
LINHAS: 15353
DATA: 2026-08-01
NOVIDADES (Beta v1.29.0):
  - CORRIGIDO: manutencista tinha a MESMA causa raiz do síndico
    (bug corrigido antes só numa das duas funções, não na outra) —
    lista de empreendimentos vinha dos imóveis já cadastrados, não
    de Parametrizações
  - CORRIGIDO (bug real — filtro de período em Métricas não
    funcionava): tinha ficado uma DATA FIXA no código (13/07/2026),
    provavelmente de um teste antigo — qualquer filtro de "últimos
    N meses" contava a partir dessa data parada no passado
  - Formatação de moeda brasileira (vírgula decimal, ponto no
    milhar) aplicada em cerca de 20 pontos do sistema que ainda
    usavam formato americano. Importante: no meio do processo, uma
    correção automática ampla demais quase estragou 11 pontos que
    NÃO eram exibição (campos de input numérico, contas internas,
    chaves de comparação para conciliação bancária) — revertidos a
    tempo antes de fechar a versão, só o que é exibição de verdade
    foi alterado
  - Botões "✕ Fechar" (vermelho, só texto) trocados por botão
    redondo vermelho com X branco, tamanho intermediário entre o
    "+" e os ícones de ação
  - Botão "Criar Contrato" no imóvel: fundo verde escuro trocado
    por estilo suave, igual aos demais botões de ação do card
  - Aba Vitrine: botão grande no topo trocado por ícone pequeno
    (mesmo estilo/posição do "+"), fundo branco; mensagem
    atualizada
  - Nova seção "Limpar Sistema", visível só para quem está logado
    como master, na aba DEV — apaga todo o dado operacional
    (imóveis, contratos, mensalidades, repasses, prestadores,
    histórico, Storage) da empresa atual, mantendo a empresa e as
    pessoas/usuários cadastrados. Dupla confirmação (a segunda
    exige digitar o nome exato da empresa)

⚠️ AINDA NÃO NESTA RODADA (lista grande, ficou pendente):
reordenação padrão das abas (Título/Resumo/Filtros/Alertas/Dados)
em Imóveis, Contratos e Inadimplência; bloquear edição direta do
Valor Vigente + botão de reajuste sobreposto; ícone de energia na
vitrine igual ao do imóvel; aba Sobre com logo à esquerda/nome à
direita e ícones no padrão do resto do sistema; passo a passo para
criar usuário manualmente no Supabase (vou responder isso em texto,
não é algo que entra no arquivo).

--- HISTÓRICO ANTERIOR (Beta v1.28.0) ---

VERSÃO: Beta v1.28.0
LINHAS: 15214
DATA: 2026-08-01
NOVIDADES (Beta v1.28.0):
  - Link de "redefinir senha" indo para localhost: não é bug de
    código — é a "Site URL" do projeto Supabase ainda configurada
    com o padrão de quando o projeto foi criado. Precisa trocar em
    Authentication → URL Configuration, no painel do Supabase, para
    a URL de verdade (e adicionar em Redirect URLs também)
  - E-mail de redefinir senha personalizado com dados da empresa:
    não dá para fazer isso pelo código do app — é configurado nos
    templates de e-mail do Supabase (Authentication → Email
    Templates), no painel
  - CORRIGIDO: nome da administradora aparecia como código (UUID)
    no histórico do contrato, agora mostra o nome
  - CORRIGIDO (bug real — excluir documento não apagava nada de
    verdade): agora apaga o arquivo do Storage, apaga a entrada de
    histórico correspondente, e registra uma nova entrada
    documentando a remoção
  - CORRIGIDO (bug real — status do imóvel voltava a "Vago" ao
    atualizar a página): ao otimizar para sincronizar só o
    contrato editado, parei de propagar a mudança de status do
    imóvel (que também muda como efeito colateral, de "Vago" para
    "Alugado") — ficava só na memória. Agora sincroniza os dois
    juntos quando isso acontece
  - Cadastro de Pessoas: reduzido o espaço reservado abaixo de
    e-mail/telefone (para a mensagem de validação), deixando o
    espaçamento mais parecido com os demais campos
  - Observação exibida no card da aba Mensal: rótulo agora deixa
    claro que é a observação do recibo (é o mesmo campo usado nos
    dois lugares — "Observações Internas" da baixa e "Observações
    do Recibo" da modal de recibo escrevem no mesmo lugar)

⚠️ AINDA NÃO NESTA RODADA: bloquear edição direta do "Valor
Vigente" do contrato (reajuste só pela seção própria) + transformar
a seção de reajuste num botão sobreposto, no estilo do menu "⋯" da
aba Mensal. Fica para a próxima — é uma mudança de tela maior.

--- HISTÓRICO ANTERIOR (Beta v1.27.0) ---

VERSÃO: Beta v1.27.0
LINHAS: 15110
DATA: 2026-08-01
NOVIDADES (Beta v1.27.0):
  - SQL de limpeza do histórico corrigido (erro de coluna ambígua
    "descricao" — faltava qualificar com o alias da tabela)
  - Botão "Criar Contrato" no imóvel: agora só ícone, sem texto
  - CORRIGIDO (bug real — formulário de novo contrato não abria):
    cancelarEdicaoContrato() esconde o formulário no final (usado
    normalmente para fechar a edição) — e criarContratoParaImovel()
    chamava essa função para limpar o formulário, mas nunca
    reabria o wrapper depois. Corrigido
  - Cadastro de Pessoas: a trava do campo de perfil exigia que a
    pessoa já tivesse login criado — agora trava SÓ quando a
    pessoa já é master (mesmo sem login ainda, para os demais
    casos o campo fica editável). Também: só quem está logado como
    master ou admin pode alterar o perfil de qualquer pessoa

--- HISTÓRICO ANTERIOR (Beta v1.26.0 — explosão de histórico corrigida) ---

VERSÃO: Beta v1.26.0
LINHAS: 15081
DATA: 2026-08-01
NOVIDADES (Beta v1.26.0) — BUG CRÍTICO DE EXPLOSÃO DE DADOS CORRIGIDO:
  - CORRIGIDO (bug crítico — histórico de contrato chegou a 10 mil+
    linhas em menos de 30 testes): entradas de histórico
    reconstruídas a partir do banco não eram marcadas como "já
    salvas". Na gravação seguinte, TODAS eram tratadas como novas e
    reinseridas — e como as reinseridas também não ficavam
    marcadas, a PRÓXIMA gravação reinseria tudo de novo, crescendo
    cada vez mais rápido a cada save. Rode
    raiz_limpar_historico_contrato.sql (apaga o histórico da
    Rabelo Testes e deixa recomeçar limpo — o bug já está corrigido
    no código)
  - CORRIGIDO (causa real da demora de ~10s ao salvar 1 contrato):
    mesmo já restringindo a ROTA para "contratos", a função por
    trás ainda percorria TODOS os contratos da empresa a cada
    gravação. Agora sincroniza só o contrato específico que mudou
  - CORRIGIDO: vínculo de síndico/manutencista só aparecia no
    imóvel após atualizar a página — o recálculo local tinha o
    mesmo problema de formato (objeto vs texto) já corrigido na
    gravação, só que numa função diferente. Corrigido nas duas, e
    a tela agora atualiza sozinha depois de salvar
  - Conferência completa dos campos monitorados no histórico do
    contrato: além do telefone (que você apontou), também faltavam
    documento, tipo de documento, e-mail, aluguel antecipado e
    administradora — todos adicionados agora
  - Telefone: removida a mensagem vermelha de er, mostra só "✅"
    quando válido, nada quando não
  - Assinatura: critério de corte mais rigoroso (só pixels bem
    escuros contam para a área do traço) e faixa de transição mais
    estreita — deve reduzir a influência de ruído/sombra da foto
    na área cortada. Ainda pode não estar perfeito para toda foto;
    me manda outro teste

⚠️ IMPORTANTE: rode raiz_limpar_historico_contrato.sql — a tabela
está com volume grande demais para ser prático separar duplicata de
dado real.

--- HISTÓRICO ANTERIOR (Beta v1.25.0) ---

VERSÃO: Beta v1.25.0
LINHAS: 14960
DATA: 2026-08-01
NOVIDADES (Beta v1.25.0):
  - CORRIGIDO (bug crítico — histórico não gerado ao editar divisão
    ou anexar documento): essas duas mudanças não entravam na lista
    de campos monitorados para detectar alteração — agora entram
  - CORRIGIDO (bug crítico — anexo duplicado no Storage, 2 virou 4):
    botão de salvar contrato agora trava contra duplo toque
  - CORRIGIDO DE VERDADE (vínculo de síndico/manutencista com
    empreendimento nunca gravava): achei a causa raiz — a leitura
    dos checkboxes manda um array de OBJETOS
    ({empreendimentoId, dataInicio}), mas a gravação comparava como
    se fosse texto puro. A comparação nunca batia com nada, e todo
    vínculo era silenciosamente ignorado
  - CORRIGIDO (Log "undefined (undefined)" na aba Mensal): o padrão
    ao gravar era "[]" (array vazio) em vez de "null" — e array
    vazio é "verdadeiro" em JavaScript, então a tela sempre achava
    que existia log. Rode raiz_limpar_envio_log.sql para corrigir
    os registros já salvos errados
  - Telefone: revertido para aceitar só 10 ou 11 dígitos (o suporte
    a número internacional criado antes gerava confusão)
  - Assinatura: trocado o limiar fixo de cor (que falhava com
    sombra/iluminação desigual na foto, tratando parte do papel
    como se fosse traço) por um limiar adaptativo — método de Otsu,
    calcula o ponto de corte certo a partir do histograma de brilho
    da própria foto, em vez de um número fixo chutado
  - Cidade e data do recibo agora centralizadas na linha de
    assinatura
  - "Criar Contrato" (a partir do imóvel): agora pede confirmação
    antes, e o preenchimento do formulário foi tornado mais robusto
    após a troca de aba
  - Cortina da aba Mensal: "Recebido" e "Inadimplente" agora
    empilhados à direita (um embaixo do outro), sem mexer na seta,
    competência ou ícone de calendário
  - Cadastro de Pessoas: espaçamento vertical reduzido entre campos
  - Divisão de sócios do contrato: movida para fora do campo
    Imóvel, agora em largura cheia (igual ao componente de
    Imóveis), posicionada logo depois de Forma de Pagamento e
    Índice de Reajuste

⚠️ Rode raiz_limpar_envio_log.sql (mensalidades com log corrompido).

--- HISTÓRICO ANTERIOR (Beta v1.24.0 — divisão editável no contrato) ---

VERSÃO: Beta v1.24.0
LINHAS: 14836
DATA: 2026-08-01
NOVIDADES (Beta v1.24.0):
  - CORRIGIDO (bug real de segurança/integridade): o próprio usuário
    master conseguia mudar seu próprio perfil pela tela (a trava só
    protegia contra OUTRAS pessoas mexerem num master). Agora o
    campo de perfil fica sempre travado para qualquer pessoa
    master, mesmo editando o próprio registro — só muda direto no
    banco
  - CORRIGIDO: assinatura aparecendo triplicada no recibo —
    getElementById só limpava a primeira ocorrência quando havia
    mais de uma órfã na página; trocado para remover todas de uma vez
  - Divisão de sócios do CONTRATO agora é editável (antes era só
    leitura) — mesma experiência de Imóveis (adicionar/remover/
    ajustar %), vem pré-preenchida com a divisão do imóvel mas pode
    ser ajustada só para aquele contrato específico. Conecta a
    tabela divisao_repasse_contrato, que existia no schema desde o
    início e nunca tinha sido usada. Rode
    raiz_fix_rpc_divisao_contrato.sql antes de subir este HTML
  - Ícone de atalho (⋯) na aba Mensal reposicionado para do lado do
    campo Líquido
  - Campo de observações do recibo: rótulo deixa claro que completa
    a frase "Vale ressaltar que..."
  - Ao gerar mensalidades, o campo de Taxa da Administradora (no
    menu ⋯) já vem pré-preenchido com o valor calculado a partir da
    taxa % cadastrada na administradora do contrato
  - CONFIRMADOS já corretos, sem necessidade de mudança: recorte
    automático da assinatura (você precisa reenviar a foto uma vez
    para pegar essa versão — a atual foi salva antes desse
    tratamento existir), seletor de imóvel na aba Mensal, atalho
    "Criar Contrato" a partir do imóvel, e máscara/validação de
    telefone internacional (detecta pelo formato digitado, sem
    perguntar o país)

--- HISTÓRICO ANTERIOR (Beta v1.23.0 — causa raiz real do 200%) ---

VERSÃO: Beta v1.23.0
LINHAS: 14574
DATA: 2026-08-01
NOVIDADES (Beta v1.23.0) — CAUSA RAIZ REAL DO "SOMA 200%":
  - CORRIGIDO DE VERDADE (a trava de reentrância da v1.20.0 era uma
    melhoria válida, mas não era a causa raiz): apagar e regravar a
    divisão de propriedade do imóvel eram DUAS chamadas separadas
    do navegador — duas transações separadas no banco. A trigger de
    "soma = 100%" é deferrable (só valida no fim da transação), mas
    o DELETE sozinho já era uma transação inteira: ao terminar, a
    soma ficava 0%, a trigger disparava e desfazia o DELETE inteiro
    (rollback). As linhas antigas nunca saíam de verdade, e o
    INSERT seguinte empilhava 100% em cima — por isso o erro
    acontecia em QUALQUER edição de imóvel, sempre, mesmo depois de
    limpar os dados. Corrigido de vez: apagar+regravar agora rodam
    dentro de UMA função no banco (RPC, mesma transação de
    verdade) — rode raiz_fix_rpc_propriedade_imovel.sql antes de
    subir este HTML

--- HISTÓRICO ANTERIOR (Beta v1.22.0 — lista grande finalizada) ---

VERSÃO: Beta v1.22.0
LINHAS: 14542
DATA: 2026-08-01
NOVIDADES (Beta v1.22.0) — LISTA GRANDE FINALIZADA:
  - CORRIGIDO (causa real da lentidão em síndico/contrato/qualquer
    salvamento): saveAll() sempre resincronizava as 8 rotas
    inteiras, mesmo salvando 1 item de 1 rota. Agora cada função de
    salvar informa qual rota mudou — só ela é sincronizada. Chamadas
    que não especificarem rota continuam sincronizando tudo (rede
    de segurança para ações que realmente afetam várias áreas, como
    importar extrato)
  - Seletor de imóvel (contrato e filtro de Métricas) trocado de
    <select> nativo — que no celular cortava o texto sem solução —
    para um seletor customizado com busca, mostrando empreendimento,
    endereço completo, status e valor de cada imóvel
  - Cortina de histórico do contrato: ordem agora decrescente (mais
    recente primeiro); "abrir/fechar todos" agora olha o estado real
    dos itens, não só o texto do botão
  - Máscara de telefone brasileira ((11) 91234-5678) em todos os
    campos de telefone do sistema — contrato, pessoas, síndico,
    manutencista. Pesquisei a prática recomendada antes: e-mail já
    seguia o padrão indicado (regex "prática", não RFC 5322
    completo) — mantido como estava
  - Aba DEV: pessoas com perfil master agora só aparecem/editáveis
    para quem também é master; Parametrizações bloqueia exclusão de
    Empreendimento/Tipo em uso; filtros de log agora vêm dos dados
    reais (só pessoas que já logaram, só ações que já aconteceram),
    com Área e Ação separadas, e os campos de data com o mesmo
    tamanho dos demais filtros
  - Aba Inadimplência: endereço completo com pin (mesmo padrão da
    aba Mensal, com número e complemento) no lugar de só a rua com
    o rótulo "Endereço:"; "Inquilino" removido dos rótulos, mantido
    só "Locatário"
  - Aba Mensal: corrigido o "undefined" ao dar baixa (mostrava
    literalmente a palavra quando a mensalidade ainda não tinha
    valor confirmado); campo renomeado para "Líquido"; novo botão
    (⋯) abre um menu com Energia, Multa e Taxa da Administradora,
    com totalizador (multa + taxa + líquido = total) — lançar uma
    multa soma automaticamente ao líquido
  - Recibo: campo de observações dentro da própria tela de gerar
    recibo (antes só existia dentro do formulário de baixa,
    escondido) — salva sozinho ao sair do campo, e aparece no texto
    do recibo
  - Contrato: ao escolher (ou já abrir, editando) um imóvel, mostra
    a divisão de sócios cadastrada nele, para conferência antes de
    salvar
  - Parametrizações: nova seção "Dados da Empresa" — responsável,
    CPF/CNPJ, cidade, UF editáveis (nome da empresa fica travado,
    não pode ser alterado nem excluído por aqui); nova opção
    "cidade impressa no recibo" (da empresa ou do imóvel alugado);
    upload de assinatura com tratamento automático de imagem (a
    foto da assinatura em papel branco é processada no navegador —
    fundo vira transparente, traço vira preto sólido — mostrando o
    resultado, com opção de apagar e enviar outra)
  - Rode raiz_add_cidade_recibo_fonte.sql (novo campo em "clientes")

--- HISTÓRICO ANTERIOR (Beta v1.21.0 — síndico, documento, DEV) ---

VERSÃO: Beta v1.21.0
LINHAS: 13965
DATA: 2026-08-01
NOVIDADES (Beta v1.21.0) — MAIS CORREÇÕES DA LISTA GRANDE:
  - CORRIGIDO (síndico não aparecia no imóvel, causa real): existia
    um mecanismo antigo e conflitante (recalcularVinculosSindicos/
    Manutencistas) rodando por cima do vínculo correto (vindo do
    banco via prestador_vinculo). Pior: uma das chamadas rodava
    logo no login, ANTES de haver garantia de que "sindicos" já
    tinha terminado de carregar — sobrescrevia o vínculo certo com
    um recálculo feito sobre um array ainda vazio. Removida essa
    chamada arriscada; a função de síndico também foi simplificada
    para o mesmo padrão direto que já funcionava no manutencista
  - CORRIGIDO (documento do contrato "sumia" ao atualizar a
    página): não existia NENHUMA gravação de "anexos" no banco — o
    upload ia para o Storage, mas a URL nunca era salva em lugar
    nenhum. Cada anexo novo agora vira uma entrada de histórico
    (tipo "anexo"), e a leitura reconstrói a lista de anexos a
    partir dessas entradas
  - Aba DEV: pessoas com perfil "master" agora só aparecem (e só
    podem ser editadas) para quem também é "master" — outros
    perfis (admin, operador, consulta) não veem esses cadastros
  - Parametrizações: bloqueada a exclusão de Empreendimento ou
    Tipo de Imóvel se existir pelo menos 1 imóvel usando aquele
    registro (antes deixava excluir e só avisava que os imóveis
    "perderiam a referência")
  - CONFIRMADO sem necessidade de mudança: "sócio sem % aparecendo
    como opção de rateio" e "indicar sócio externo" já tinham sido
    corrigidos em edições anteriores desta mesma leva de trabalho
  - REVISADA, sem bug encontrado: a lógica de data de pagamento
    para contrato "antecipado = Não" (deveria gerar no mês
    seguinte à competência) — o código já faz exatamente isso.
    Se o problema persistir, preciso do contrato específico onde
    aconteceu para investigar mais fundo (não consegui reproduzir
    lendo o código)

⚠️ AINDA NÃO NESTA RODADA (lista continua grande): filtros de log
em cascata (ação→entidade, só o que existe), tempo de espera alto
em síndico/contrato, cortina de histórico (ordem decrescente,
abrir/fechar tudo incluindo resumos), seletor de imóvel sem
detalhes/cortado (contrato e Métricas), confirmação de divisão ao
carregar contrato, máscara de telefone + pesquisa de validação
recomendada, detalhamento da aba Inadimplência, "undefined" ao dar
baixa + menu de multa/taxa/energia com totalizador, observações do
recibo, e completar dados da empresa em Parametrizações (incluindo
tratamento de assinatura).

--- HISTÓRICO ANTERIOR (Beta v1.20.0 — 3 bugs críticos) ---

VERSÃO: Beta v1.20.0
LINHAS: 13859
DATA: 2026-07-31
NOVIDADES (Beta v1.20.0) — 3 BUGS CRÍTICOS DA LISTA MAIS RECENTE:
  - CORRIGIDO (bug crítico — causa provável do erro "soma 200%"):
    saveAll() não tinha proteção contra ser chamado duas vezes ao
    mesmo tempo (ex.: toque duplo acidental). Se acontecesse, as
    duas execuções entrelaçavam a gravação de divisão societária
    (apaga tudo + regrava) e a soma dobrava. Adicionada trava de
    reentrância: uma segunda chamada agora espera a primeira
    terminar, em vez de rodar em paralelo
  - CORRIGIDO (bug crítico — causa real da duplicação de histórico
    em contratos "vazios"): o campo "iptu" estava na lista de
    campos monitorados para detectar mudança no contrato, mas
    NUNCA era lido de nenhum campo do formulário (não existe tela
    para editá-lo ainda) — ficava sempre "undefined". Resultado:
    TODA gravação de contrato, mesmo sem nenhuma mudança real,
    detectava uma "alteração fantasma" de IPTU e criava um
    histórico novo — exatamente o padrão relatado (históricos
    vazios se multiplicando). Corrigido preservando o valor
    existente em vez de perdê-lo a cada salvamento
  - CORRIGIDO: a aba Sócios mostrava um card fantasma "Sócio:
    Sócio" — era o mesmo padrão de bug já corrigido em outros 2
    lugares (semear a lista com SOCIO_PADRAO, que virou um valor
    genérico "Sócio" desde a mudança para multi-empresa), só que
    faltou corrigir este terceiro lugar. Agora usa a mesma fonte
    de verdade das outras duas correções: pessoas com % de cotas
    cadastrado

⚠️ LISTA MUITO GRANDE RECEBIDA NESTA RODADA (~22 itens) — só os 3
bugs mais críticos (que causavam perda/corrupção de dado) foram
corrigidos agora, com o cuidado que esse tipo de bug exige. NENHUM
dos demais itens foi tocado ainda: filtros de log, tempo de espera
alto em síndico/contrato, vínculo de síndico no imóvel, cortina de
histórico (ordem/abrir-fechar), upload de documento não
persistindo, seletor de imóvel no contrato, permissões de DEV por
perfil, sócio sem % aparecendo como opção, indicação de sócio
externo, confirmação de divisão no contrato, data de pagamento
antecipado, máscara de telefone, proteção contra excluir
empreendimento/tipo em uso, detalhamento da aba Inadimplência,
"undefined" ao dar baixa + menu de multa/taxa, observações do
recibo, e completar dados da empresa em Parametrizações (incluindo
assinatura tratada). Essa lista fica registrada aqui para a
próxima rodada.

--- HISTÓRICO ANTERIOR (Beta v1.19.0 — multi-empresa) ---

VERSÃO: Beta v1.19.0
LINHAS: 13782
DATA: 2026-07-31
NOVIDADES (Beta v1.19.0) — MUDANÇA DE ARQUITETURA: UM ARQUIVO, VÁRIAS EMPRESAS:
  - CONFIG_CLIENTE deixou de ser fixo no arquivo — antes cada
    instalação precisava do próprio HTML com esses valores
    embutidos; agora um ÚNICO arquivo atende quantas empresas o
    login tiver acesso. CLIENTE_ID_SUPABASE também virou dinâmico
    (era "const" fixo, agora "let", definido em tempo de execução)
  - Login agora, depois de autenticar, busca TODAS as empresas às
    quais aquele login tem acesso (antes buscava só na empresa fixa
    do arquivo). Se só tiver 1, entra direto, como sempre foi. Se
    tiver mais de 1 (hoje, só o seu login master), mostra uma nova
    tela de escolha, com o nome de cada empresa e o perfil nela
  - Depois da escolha, os dados da empresa (nome, logo, CNPJ,
    assinatura) são carregados do banco (tabela "clientes") na hora
    — não é mais texto fixo no arquivo
  - Novo botão "🏢 Trocar Empresa" na aba DEV, mostrando a empresa
    atual — clicar nele recarrega a página; como a sessão do
    Supabase continua salva no navegador, o fluxo de escolha
    aparece de novo sozinho, sem precisar logar de novo
  - PRÁTICO: a partir de agora, só este arquivo é necessário no
    GitHub — não precisa mais de um HTML separado por empresa
    (BETA, Rabelo, Dutra...). Todas elas já estão cadastradas no
    banco; o mesmo arquivo funciona para todas, e cada login vê só
    as empresas às quais tem acesso

⚠️ Como qualquer mudança estrutural desse tamanho, vale um teste
cuidadoso: logar, confirmar que a tela de escolha aparece (você tem
acesso a BETA-RAIZ-PATRIMONIO, Rumo, Rabelo Imóveis, Dutra Imóveis e
Rabelo Testes — 5 opções), entrar em uma, conferir que os dados
certos carregam (nome, logo), trocar de empresa pela aba DEV, e
confirmar que a segunda empresa carrega os dados dela, não os da
primeira.

--- HISTÓRICO ANTERIOR (Beta v1.18.0 — lista pendente finalizada) ---

VERSÃO: Beta v1.18.0
LINHAS: 13653
DATA: 2026-07-31
NOVIDADES (Beta v1.18.0) — LISTA PENDENTE FINALIZADA:
  - Carga inicial da Rabelo redirecionada para a instância BETA-RAIZ-
    PATRIMONIO (raiz_carga_inicial_BETA.sql) — mesmo conteúdo de
    antes, só o cliente_id trocado
  - Botão direto para Parametrizações dentro da aba DEV (não precisa
    mais do duplo clique escondido para achar Empreendimentos/Tipos)
  - CORRIGIDO (bug real, causa da perda de sessão relatada): o
    cliente Supabase temporário usado em "Criar Acesso" sobrescrevia
    a sessão do usuário logado no localStorage. Corrigido com
    persistSession: false
  - Parâmetros de envio de e-mail migrados para o Supabase
    (raiz_add_parametros_email.sql, campos em "clientes"). Limite
    reconhecido na própria tela: isso guarda a configuração, mas o
    disparo automático de verdade ainda depende de um agendador de
    servidor não construído — o botão de teste que falhava com
    "erro de conexão" era esta mesma peça, agora migrada
  - Documentos do contrato migrados para o Storage — bucket PRIVADO
    (raiz_storage_bucket_documentos_contrato.sql), diferente do de
    fotos, por serem dados sensíveis (CPF do locatário etc.); link
    assinado de validade longa em vez de base64 na linha do contrato
  - RESOLVIDA a sobreposição "Divisão de Sócios" × "Propriedade
    Rumo": unificadas numa tela só. "Divisão de Sócios" agora aceita
    também terceiro externo (nome livre, não precisa estar
    cadastrado em Pessoas) — a gravação já classificava sozinha,
    pelo nome, quem é sócio interno ou externo. "parteRumo" removido
    por completo: HTML, 4 funções, variável, validação duplicada e
    campo salvo — nada ficou pela metade
  - Botão de resumo de locação (📋, copia texto formatado para
    WhatsApp) adicionado em cada card da aba Vitrine — reaproveitando
    a função copyResumo() que já existia (usada em Imóveis)

⚠️ Nenhum item da lista anterior ficou pendente desta vez.

--- HISTÓRICO ANTERIOR (Beta v1.17.0 — renomeação de perfis, carga Rabelo) ---

VERSÃO: Beta v1.17.0
LINHAS: 13755
DATA: 2026-07-31
NOVIDADES (Beta v1.17.0) — RENOMEAÇÃO DE PERFIS + CARGA INICIAL RABELO:
  - Perfis renomeados: "master_plataforma" (você, todas as empresas)
    agora se chama "master"; "master" (administrador de cada
    empresa) agora se chama "admin". Roda raiz_renomear_perfis.sql
    ANTES de subir este HTML (o SQL migra perfis, perfil_funcionalidade
    e pessoas.perfil existentes — sem isso, seu próprio acesso
    ficaria com o nome antigo e o código novo não reconheceria)
  - Todos os prompts/seletores de perfil no Cadastro de Pessoas
    atualizados: agora oferecem "admin, operador, consulta" (+
    "master", só quando quem está logado já é master)
  - Carga inicial da Rabelo Imóveis (Open Mall Canaã): gerado
    raiz_carga_inicial_rabelo.sql a partir da planilha enviada — 13
    imóveis, 11 contratos (com histórico de assinatura), 13
    mensalidades de julho/2026 já lançadas (incluindo os 5 meses em
    atraso da Loja 08, cada um como lançamento próprio, já que
    competência é campo obrigatório). Roda esse SQL depois de
    confirmar que a Rabelo já está com o schema em dia

⚠️ AINDA PENDENTE: % de rateio de aluguel na tela de contrato
(vem do imóvel, editável por contrato — usa a tabela
divisao_repasse_contrato, ainda não conectada); e o restante da
lista já registrada nas versões anteriores (empreendimento/tipo
visíveis na aba DEV, atualização automática de lista após criar
pessoa, parâmetros de e-mail, documentos do contrato no Storage,
resumo de locação na vitrine).

--- HISTÓRICO ANTERIOR (Beta v1.16.0 — DEV, validação, mensagens) ---

VERSÃO: Beta v1.16.0
LINHAS: 13724
DATA: 2026-07-31
NOVIDADES (Beta v1.16.0) — DEV, VALIDAÇÃO, MENSAGENS MAIS CLARAS:
  - CONFIRMADO: opção de perfil "admin" já não existia em nenhum
    lugar do código (checado a fundo) — provavelmente teste numa
    versão em cache
  - Usuários master/master_plataforma não podem mais ser excluídos
    pela tela (botão vira um 🔒, e a função recusa mesmo se
    chamada por outro caminho) — só direto no banco
  - Removido o componente antigo "Log de Acessos" da aba DEV
    (redundante com Logs do Sistema). Logs do Sistema ganhou
    filtros: usuário, ação, e intervalo de datas
  - Validação de telefone/e-mail bem mais rigorosa: telefone agora
    confere DDD real (lista da ANATEL) e recusa número com todos os
    dígitos iguais (111111111, 999999999...); e-mail exige TLD de
    2+ letras e recusa pontos duplicados/nas pontas. Mesma
    validação aplicada também no Cadastro de Pessoas, que antes não
    tinha nenhuma
  - CORRIGIDO (mensagem confusa): erros de sincronização agora
    mostram QUAL item específico falhou e por quê, não só o nome
    genérico da rota. Isso explica o mistério do "% não pode ser
    diferente de 100%" ao excluir um contrato — não era a exclusão
    que falhava, era um IMÓVEL SEM RELAÇÃO com divisão societária
    incompleta, sincronizado junto porque toda ação passa por
    saveAll() (que resincroniza tudo). Agora a mensagem deixa isso
    claro, apontando o imóvel certo
  - Unificado o padrão de sincronização resiliente (item por item,
    sem abortar o lote inteiro por causa de 1 problema) também para
    mensalidades, repasses e pendências de extrato — antes só
    imóveis/contratos/prestadores tinham esse tratamento

⚠️ AINDA NÃO NESTA RODADA (lista longa, seguem pendentes):
empreendimento/tipo de imóvel visíveis dentro da aba DEV (hoje só
em Parametrizações); atualização automática da lista após criar
pessoa nova + investigar perda de sessão relatada; tabela de
parâmetros para os dias de envio de e-mail; teste de envio de
e-mail de lembrete (deu falha de conexão — ainda não investigado);
documentos do contrato para o Storage; botão de resumo de locação
na vitrine.

--- HISTÓRICO ANTERIOR (Beta v1.15.0 — acesso DEV, contrato salvando) ---

VERSÃO: Beta v1.15.0
LINHAS: 13588
DATA: 2026-07-31
NOVIDADES (Beta v1.15.0) — ACESSO DEV, CONTRATO SALVANDO, RENDER APÓS SYNC:
  - CORRIGIDO (bloqueava seu teste): perfil de Nicola no banco ainda
    estava como "admin" (valor antigo) — a checagem nova de DEV não
    reconhecia. Rode raiz_fix_perfil_nicola.sql (atualiza para
    "master_plataforma" nas 4 instalações) — o código em si já
    estava certo, era dado desatualizado
  - CORRIGIDO (bug crítico, provável causa real de contrato não
    salvar): a coluna "reajuste" foi criada como numeric no schema
    original, mas o formulário sempre envia texto (nome do índice,
    "IPCA"/"IGP-M") — isso derrubava o INSERT inteiro, silenciosamente.
    Rode raiz_fix_reajuste_tipo_coluna.sql (troca a coluna para text)
  - CORRIGIDO: imóvel recém-criado não deixava editar/excluir direito
    até atualizar a página — os botões eram desenhados com o id
    temporário local, ANTES do Supabase confirmar e trocar pelo id
    real. Agora a lista de imóveis/contratos/administradoras/
    síndicos/manutencistas é redesenhada depois que a nuvem confirma
  - CORRIGIDO (mesma causa acima): exclusão de imóvel podia
    "funcionar" na tela sem realmente apagar no banco (se o id ainda
    fosse o temporário) — e o log registrava mesmo assim. Agora
    espera a confirmação do Supabase antes de tirar da tela ou
    registrar o log; mostra alerta claro se falhar de verdade
  - REMOVIDO o banner "Reenviar Agora" (e a lógica de pendenciasSync
    associada) — fazia sentido para a instabilidade do Apps Script,
    mas no Supabase uma falha normalmente é um problema real (não
    resolve tentar de novo sem mudar nada). Falha agora vira um
    alerta claro apontando para os Logs do Sistema, sem banner
    insistente no topo
  - Log do sistema: adicionado registro da geração de link de
    vitrine (vitrine.gerar)
  - Registrada, não corrigida: sobreposição conceitual entre
    "Divisão de Sócios" e "Propriedade dentro/fora da empresa"
    (parte_rumo) — as duas tentam representar a mesma informação na
    mesma tabela (propriedade_imovel). Corrigir isso de improviso
    arriscava sobrescrever/duplicar dado; fica como decisão de
    design pendente, mesma régua já usada para o Cadastro de Sócios

⚠️ AINDA PENDENTE desta rodada (não coube): documentos do contrato
(Contrato/Aditivo/Outros) migrar para o Storage como as fotos;
botão de "resumo de locação" na vitrine.

--- HISTÓRICO ANTERIOR (Beta v1.14.0 — histórico, validação, storage) ---

VERSÃO: Beta v1.14.0
LINHAS: 13518
DATA: 2026-07-31
NOVIDADES (Beta v1.14.0) — HISTÓRICO DE CONTRATO, VALIDAÇÃO E STORAGE:
  - Componente de Histórico do contrato reformulado: o antigo botão
    "🔧 Reajuste / Alteração de Contrato" virou o cabeçalho do
    histórico, com contador (ex.: "Histórico (4)"), botão "Abrir
    todos/Fechar todos", cada item com abrir/fechar individual, em
    ordem CRESCENTE (mais antigo primeiro) — mesmo estilo visual do
    modal que já existia (acessível pelo ícone 🕒 na lista de
    contratos). Os campos de reajuste em si (Novo Valor, % Reajuste
    etc.) continuam existindo, agora atrás do botão "➕ Registrar
    Reajuste/Alteração" — mesmo toggle de sempre, só reorganizado
  - Validação de WhatsApp e e-mail no formulário de contrato, mesmo
    padrão visual da validação de CPF/CNPJ que já existia
    (✅/⚠️ verde/vermelho logo abaixo do campo, atualiza ao digitar
    e também já vem certo ao abrir um contrato para editar)
  - Fotos de imóvel migradas para o Supabase Storage de verdade:
    roda também raiz_storage_bucket_fotos.sql (cria o bucket
    "imoveis-fotos" + políticas de leitura pública/escrita
    autenticada). A mesma compressão de antes (até 1024px, JPEG
    qualidade 0.6) continua — só que agora o resultado é enviado
    como arquivo de verdade, e o que fica gravado no banco é a URL
    pública, não mais o texto base64 inteiro dentro da linha do
    imóvel

⚠️ NÃO INCLUÍDO NESTA RODADA (gap pequeno, ciente): ao excluir uma
foto do formulário antes de salvar, ou ao excluir um imóvel inteiro,
o arquivo correspondente não é apagado do Storage automaticamente
(fica órfão lá). Baixo custo/risco para o volume atual — pode ser
endereçado numa rodada de limpeza futura.

--- HISTÓRICO ANTERIOR (Beta v1.13.0 — grande rodada de correções) ---

VERSÃO: Beta v1.13.0
LINHAS: 13300
DATA: 2026-07-31
NOVIDADES (Beta v1.13.0) — GRANDE RODADA DE CORREÇÕES (lista extensa do cliente):
  - CORRIGIDO (bug crítico): enum de status do contrato estava com
    valores INVENTADOS (ativo/encerrado/inadimplente/renovacao),
    nunca conferidos contra o <select> real do formulário
    (Ativo/Suspenso/Finalizado) — provável causa de contratos não
    salvando. Corrigido o mapeamento; roda TAMBÉM
    raiz_fix_enum_status_contrato.sql (ajusta o enum no banco)
  - REMOVIDA de vez a última chamada ao Apps Script do login/entrada
    — só buscava recursos legados que não são mais lidos em nenhuma
    tela real. Elimina a mensagem de "Failed to fetch" e o "modo
    offline" que apareciam mesmo com tudo funcionando
  - CORRIGIDO: dropdown de Empreendimento/Tipo de Imóvel no
    formulário de imóvel usava listas fixas da Rumo — agora carrega
    da tabela nova, e para de criar registro novo sozinho ao salvar
    (precisa estar cadastrado antes, em Parametrizações)
  - NOVA ABA "Parametrizações" (oculta — duplo clique no botão DEV
    depois de já estar em modo DEV): cadastro de Empreendimentos e
    Tipos de Imóvel
  - CORRIGIDO: formulário de síndico/manutencista montava a lista de
    empreendimentos a partir dos imóveis já cadastrados (por isso
    nomes antigos da Rumo apareciam) — agora usa Parametrizações
  - CORRIGIDO (bug crítico de dado): síndico vinculado a um
    empreendimento nunca aparecia no imóvel (diferente do
    manutencista) porque o adaptador de leitura de imóveis deixava
    sindicoId/manutencistaId sempre vazios, sem nunca consultar
    "prestador_vinculo" de verdade. Corrigido — busca os vínculos
    vigentes e casa por empreendimento
  - REMOVIDA a divisão societária padrão (SOCIO_PADRAO=100%) que
    aparecia mesmo em imóvel sem dono cadastrado — agora fica
    vazio, refletindo a realidade
  - CORRIGIDO (bug de dado): repasse e o filtro de sócio da aba
    "Prestação de Contas" semeavam a lista com SOCIO_PADRAO fixo e
    derivavam nomes da divisão dos imóveis (por isso apareciam
    nomes da Rumo, e o repasse falhava ao gravar — o nome não
    batia com nenhuma pessoa real). Agora os dois usam a fonte
    certa: pessoas cadastradas com % de cotas da empresa
  - Cadastro de Pessoas: adicionados os campos "% de cotas da
    empresa" e "perfil de acesso" (editável direto no card, só
    quando a pessoa já tem login — evita sobrescrever com lixo)
  - Aba Sobre: logo da empresa (CONFIG_CLIENTE.logoUrl), e contatos
    clicáveis — e-mail (mailto:), WhatsApp (wa.me) e site,
    com os dados informados pelo cliente. ⚠️ O número de WhatsApp
    informado nesta rodada ("11.97619745") tinha um dígito a menos
    que o padrão de 9 dígitos — usei o número já conhecido do
    projeto (11 97610-9745); conferir e corrigir se estiver errado
  - Splash: foto de prédio comercial restaurada (tamanho reduzido,
    144px, para não repetir o problema de campos cortados no
    notebook — a rolagem de segurança da v1.3.1 continua ativa)
  - Log do sistema: adicionado registro de criar/editar em imóveis
    e contratos (antes só existia para exclusões)
  - CONFIRMADO, sem necessidade de mudança: vazamento de estado
    entre editar e cadastrar imóvel, e a divisão societária "lembrar
    o último cadastro só durante a sessão" — ambos já tinham sido
    corrigidos numa edição anterior desta mesma rodada de trabalho

⚠️ AINDA PENDENTE (lista longa, não coube tudo nesta rodada):
  - Componente de histórico do contrato (visual completo, com
    contador e abrir/fechar) — a lógica de dado já existe (cria o
    primeiro histórico "assinatura" ao cadastrar, novo histórico a
    cada edição), falta só a reformulação visual pedida
  - Validação de telefone/e-mail no contrato com sinalização verde
    (a exemplo do documento)
  - Chave "Rumo" fixa na propriedade dentro/fora da empresa
    (parte_rumo) — mesmo gap já documentado antes: esse campo
    ainda não está de fato conectado ao banco
  - Fotos: confirmado que funcionam, mas ficam como texto (base64)
    dentro da própria linha do imóvel — não é Supabase Storage de
    verdade. Funciona para poucas fotos pequenas; migrar para
    Storage antes de crescer o volume
  - Cobertura de log ainda não estende a mensalidades, repasses,
    prestadores, sócios (só imóveis/contratos + exclusões de todas
    as áreas, que já vinham da rodada anterior)

--- HISTÓRICO ANTERIOR (Beta v1.12.0 — login com convite + logs) ---

VERSÃO: Beta v1.12.0
LINHAS: 13087
DATA: 2026-07-30
NOVIDADES (Beta v1.12.0) — LOGIN: CONVITE + PRIMEIRO ACESSO + LOGS DE VERDADE:
  - Fluxo de login "cadastra antes, autentica depois": botão "Criar
    Acesso" no Cadastro de Pessoas — cria a conta (signUp, senha
    aleatória descartável que ninguém precisa saber) usando um
    cliente Supabase TEMPORÁRIO, para não derrubar a sessão de quem
    está operando; em seguida dispara e-mail de "definir senha"
    (resetPasswordForEmail). Tudo com a chave pública (anon) — nunca
    precisou da chave secreta do Supabase
  - Nova tela "Definir Senha" na splash — aparece sozinha quando a
    pessoa clica no link do e-mail (evento PASSWORD_RECOVERY do
    Supabase Auth, capturado via onAuthStateChange)
  - "Esqueci minha senha" — link na própria tela de login, mesmo
    mecanismo do convite
  - "Vincular login" (colar UUID manual) continua disponível como
    opção secundária, para casos em que o login já existe por outro
    motivo
  - LOG DO SISTEMA conectado de verdade: registrarLog() grava em
    "log_acessos" (Supabase) — login, logout, e as exclusões em
    imóveis, contratos, mensalidades, repasses, prestadores e
    pessoas, além de criar/aprovar/revogar acesso
  - Nova seção "Logs do Sistema" na aba DEV, lendo de log_acessos
    (a antiga "Log de Acessos", ligada ao Apps Script, continua
    existindo em paralelo — é outra coisa, mais genérica, decisão
    de unificação ainda pendente, mesma nota das versões anteriores)
  - Prompts de perfil atualizados de "admin/consulta" (nomes antigos)
    para os 4 perfis atuais: master_plataforma, master, operador,
    consulta

⚠️ ESCOPO DESTA RODADA: log conectado nas EXCLUSÕES (ação mais
sensível) em 6 áreas + nos eventos de acesso. Criar/editar ainda não
registram log — ampliar a cobertura é trabalho incremental, mesma
régua que já vínhamos usando para não tentar fazer tudo de uma vez.
Aplicar as permissões por funcionalidade (perfil_funcionalidade) nas
telas em si também fica para a próxima rodada — o schema já existe
e está carregado, só falta conectar nas checagens do app.

--- HISTÓRICO ANTERIOR (Beta v1.11.0 — conciliação bancária) ---

VERSÃO: Beta v1.11.0
LINHAS: 12801
DATA: 2026-07-30
NOVIDADES (Beta v1.11.0) — ETAPA 3: CONCILIAÇÃO BANCÁRIA NO SUPABASE:
  - Boa notícia de arquitetura: a leitura do .xlsx e a lógica de match
    automático (processarExtratoImportado, conciliarTransacoes) já
    operavam 100% em memória, sobre arrays já migrados (mensalidades,
    contratos, repasses) — não precisaram de NENHUMA mudança. Só a
    persistência final precisava migrar
  - Pendências de extrato: carregarPendenciasExtratoSupabase() /
    sincronizarPendenciaExtratoSupabase() — mesmo padrão de sempre.
    Como toda ação manual (confirmar pendência dupla, descartar) já
    seguia o padrão "muda o array + chama saveAll()", migrar só a
    rota "pendenciasExtrato" dentro do saveAll cobriu todas elas de
    uma vez, sem precisar tocar em cada função individualmente
  - Fingerprints do extrato (log de auditoria, só escrita, nunca
    lido de volta): gravarFingerprintsExtratoSupabase() — inserção
    direta, sem carregar nada no início da sessão (não precisa)
  - Removida a classe "offline-disable" dos botões "Importar
    extrato bancário" e "Reprocessar conciliação" — conciliação não
    depende mais do Apps Script para nada
  - Bloco "Demais dados (Apps Script)" dentro de entrarNoSistema()
    ficou reduzido a só duas coisas: log de acessos e solicitações
    de dispositivo (ambos recursos LEGADOS, do sistema de aprovação
    por dispositivo anterior ao login Supabase da v1.3.0) — mensagens
    de status/erro atualizadas para refletir isso com precisão
  - VALIDAÇÃO NOVA: a partir desta versão, a checagem de sintaxe usa
    `node --check` sobre o JavaScript extraído do arquivo, em vez de
    só contar chaves/parênteses no arquivo inteiro — mais confiável,
    porque não é enganado por parênteses dentro de texto de
    comentário ou de mensagens ao usuário (alert/confirm), que
    sempre geraram "desvios" que na prática eram inofensivos

⚠️ Único recurso ainda no Apps Script: log de acessos + solicitações
de dispositivo (legado, não bloqueia nenhuma funcionalidade
principal). Cadastro Sócios (unificação completa com "pessoas",
incluindo esses dois recursos legados) segue como decisão de design
pendente, já registrada nas versões anteriores.

--- HISTÓRICO ANTERIOR (Beta v1.10.0 — cadastro de pessoas unificado) ---

VERSÃO: Beta v1.10.0
LINHAS: 12667
DATA: 2026-07-30
NOVIDADES (Beta v1.10.0) — ETAPA 3: CADASTRO DE PESSOAS UNIFICADO:
  - Substituído de vez o antigo "Cadastro Sócios" (que misturava um
    array "socios" próprio, "dispositivosAprovados" do sistema de
    aprovação por dispositivo — morto desde a v1.3.0 — e
    "emailConfiguracao") por um único CRUD sobre a tabela "pessoas"
    do Supabase, na aba DEV
  - carregarPessoasSupabase() / dev_renderPessoas() / dev_salvarPessoas()
    / dev_removerPessoa() cobrem nome, e-mail, WhatsApp e função —
    tudo que já era comum às três fontes antigas
  - "Vincular login" / "Remover acesso ao sistema": liga (ou tira) o
    user_id + perfil de uma pessoa já cadastrada. Decisão de design
    importante: este CRUD NÃO cria o login em si — isso exigiria a
    chave "service_role" do Supabase no código do front-end, o que
    nunca deve acontecer. O fluxo real: 1) criar o login no painel
    do Supabase (Authentication → Users → Add user); 2) usar
    "Vincular login" aqui, colando o UUID gerado lá
  - Isso é o que permite, na prática, cadastrar os usuários dos
    leads (Rabelo, Dutra) direto pelo app, sem precisar rodar SQL
    manual toda vez — só a criação do login continua sendo manual
    no painel do Supabase (passo rápido, ~1 min por pessoa)

--- HISTÓRICO ANTERIOR (Beta v1.9.0 — desbloqueio definitivo de abas) ---

VERSÃO: Beta v1.9.0
LINHAS: 12643
DATA: 2026-07-30
NOVIDADES (Beta v1.9.0) — DESBLOQUEIO DEFINITIVO DE ABAS (BUG CRÍTICO):
  - CORRIGIDO (bug crítico, achado pelo cliente no teste): existia um
    SEGUNDO mecanismo de bloqueio, dentro de switchTab(), inteiramente
    separado da classe ".offline-disable" que já tínhamos corrigido —
    bloqueava a troca para as abas tab-imoveis/tab-contratos/tab-
    mensal/tab-socios por inteiro sempre que isOffline fosse
    verdadeiro, antes mesmo de qualquer botão interno ser
    considerado. Removido — nenhuma dessas 4 abas depende mais do
    Apps Script
  - CORRIGIDO: dois botões de Mensal ("Dar Baixa", "Estornar") tinham
    um TERCEIRO mecanismo de bloqueio (${isOffline ? 'opacity-50
    pointer-events-none' : ''} embutido direto na string de classe),
    nunca coberto pelas correções anteriores. Removido
  - CORRIGIDO (bug no meu próprio script de correção anterior, v1.7.0):
    o botão "Gerar Recebimento do Mês" continuava com a classe
    "offline-disable" porque o padrão de busca usado para removê-la
    tinha um espaço a mais que nunca batia com o texto real —
    reportava sucesso sem ter mudado nada. Corrigido com o padrão certo
  - CONFIRMADO: aba "Prestação de Contas Societária" (tab-socios) não
    precisa de nenhuma migração adicional — o filtro de sócio já é
    montado a partir da divisão de propriedade dos imóveis
    (imo.divisao), que já vem do Supabase desde a v1.4.0. Liberada
    do bloqueio de aba junto com imóveis/contratos/mensal
  - Fica pendente, fora do escopo desta rodada (não bloqueia o teste
    dos 2 leads): o CRUD de "Cadastro Sócios" na Central do
    Desenvolvedor (que hoje mistura socios/dispositivosAprovados/
    emailConfiguracao — precisa de decisão de unificação com
    "pessoas" antes de migrar, não só troca mecânica) e a
    conciliação bancária (extrato)

--- HISTÓRICO ANTERIOR (Beta v1.8.0 — vitrine no Supabase) ---

VERSÃO: Beta v1.8.0
LINHAS: 12607
DATA: 2026-07-30
NOVIDADES (Beta v1.8.0) — ETAPA 3: VITRINE PÚBLICA NO SUPABASE:
  - Geração de link (gerarLinkVitrine), exclusão individual
    (dev_apagarLinkEspecifico), exclusão em massa
    (dev_apagarTodosLinks) e exclusão de expirados
    (dev_apagarLinksExpirados) — todas migradas para o Supabase
    (tabela links_vitrine), removendo as chamadas ao Apps Script
  - CORRIGIDO (achado nesta migração, pré-existente): a vitrine
    pública fazia DUAS chamadas — resolver o token, e depois buscar
    O PORTFÓLIO INTEIRO de imóveis para filtrar no navegador. O
    backend antigo (Apps Script) já tinha sido corrigido faz tempo
    para devolver os imóveis pré-filtrados na própria resolução do
    token, mas o FRONT nunca foi atualizado para usar essa resposta
    — continuava fazendo a segunda chamada insegura. Nova função
    resolverVitrinePublicaSupabase() faz tudo numa consulta só, já
    filtrada pela política de RLS (o visitante nunca recebe nada
    além dos imóveis daquele link específico)
  - Como consequência prática: a vitrine pública estava
    efetivamente QUEBRADA (dependia do Apps Script, que segue
    indisponível) — agora funciona de novo, e mais segura do que
    antes
  - CONFIRMADO sem necessidade de mudança: a aba Relatórios/Métricas
    (renderRelatorios) já funciona corretamente — é só uma leitura
    dos arrays imoveis/contratos/mensalidades já em memória, sem
    chamada própria. Como as três já vêm do Supabase, relatórios já
    estava migrado "de graça"

⚠️ AINDA PENDENTES (avaliados nesta rodada, não migrados ainda):
  - CONCILIAÇÃO BANCÁRIA (pendencias_extrato/extrato_fingerprints):
    a mais complexa das pendentes — envolve leitura de .xlsx e
    lógica de match automático. Fica para uma rodada própria,
    mapeada com calma
  - SÓCIOS (aba DEV "Cadastro Sócios"): achei que esse fluxo hoje é
    uma unificação de 3 fontes (array "socios" próprio,
    dispositivosAprovados do antigo login por dispositivo, e
    emailConfiguracao) — tudo isso é conceitualmente redundante com
    a tabela "pessoas" que já existe no Supabase. Precisa de
    decisão de design (unificar de vez com "pessoas", não só
    trocar o backend) antes de migrar, não só troca mecânica
  - ABA DEV (demais funções, fora do gerenciador de links já
    migrado): ainda não mapeada em detalhe

--- HISTÓRICO ANTERIOR (Beta v1.7.0 — mensalidades e repasses) ---

VERSÃO: Beta v1.7.0
LINHAS: 12555
DATA: 2026-07-30
NOVIDADES (Beta v1.7.0) — ETAPA 3: MENSALIDADES E REPASSES NO SUPABASE:
  - Mensalidades migradas: carregarMensalidadesSupabase() /
    sincronizarMensalidadeSupabase(). "referencia" (texto "MM/YYYY")
    convertida para "competencia" (date, sempre dia 1 do mês) e
    vice-versa nas funções competenciaParaData()/dataParaCompetencia()
  - Repasses migrados: carregarRepassesSupabase() /
    sincronizarRepasseSupabase(). O campo "socio" (nome em texto)
    agora resolve para pessoa_id via obterPessoaIdPorNome() — se o
    nome não bater com nenhuma pessoa cadastrada, a gravação falha
    com mensagem clara (schema exige pessoa_id, não aceita texto solto)
  - Exclusão de mensalidade e repasse agora também apaga no Supabase
    (mesma correção já aplicada em imóveis/contratos/prestadores)
  - Removida a classe "offline-disable" de: botão "Gerar recebimento
    do mês", painel de geração de mensalidades, e formulário
    "Registrar Retirada" (repasse) — não dependem mais do Apps Script
  - NÃO alterado: botão de importar extrato bancário e "reprocessar
    conciliação" continuam com offline-disable — pendências de
    extrato (conciliação) ainda não foi migrada
  - NÃO verificado nesta rodada: "Importar Carga Inicial" (DEV, bulk
    load via planilha) foi deixado com offline-disable por cautela —
    não confirmei se o caminho interno dela já usa os novos
    adaptadores Supabase ou ainda depende de algo do Apps Script

⚠️ Pendências de extrato (conciliação bancária) e vitrine pública
AINDA no Apps Script — próxima etapa.

--- HISTÓRICO ANTERIOR (Beta v1.6.1 — correção de RLS + contratos) ---

VERSÃO: Beta v1.6.1
LINHAS: 12341
DATA: 2026-07-30
NOVIDADES (Beta v1.6.1) — RESILIÊNCIA DE SINCRONIZAÇÃO + BUG DA DIVISÃO:
  - CORRIGIDO (bug real, achado pelo cliente no teste): a divisão
    societária de imóvel não estava sendo gravada em
    "propriedade_imovel". Causa: o formulário identifica o sócio
    pelo nome CURTO (SOCIO_PADRAO, ex.: "Nicola"), mas a tabela
    "pessoas" guarda o nome COMPLETO ("Nicola Santos Dutra") — a
    comparação exigia igualdade exata de texto e nunca batia.
    Corrigido para aceitar também o casamento pelo primeiro nome
  - CORRIGIDO (bug real, mesmo teste): uma vez que UM item de uma
    lista falhava ao sincronizar (ex.: o imóvel com o problema
    acima), TODO o lote parava — e como saveAll() resincroniza
    TODOS os itens a cada gravação (não só o que mudou), aquele
    item ruim passava a aparecer como falha em TODA gravação
    futura, mesmo salvando algo sem relação (foi o que aconteceu
    ao salvar um contrato e "Imóveis" aparecer como erro junto)
  - Novo helper sincronizarListaComResiliencia(): cada item agora
    tem seu próprio try/catch — um item com problema não trava
    mais os demais, e o erro específico daquele item aparece no
    log (antes era um "falhou" genérico, sem dizer qual nem por quê)
  - Aplicado nas 5 rotas já migradas: imóveis, contratos,
    administradoras, síndicos, manutencistas

⚠️ Mensalidades, repasses, pendências de extrato (conciliação
bancária) e vitrine pública AINDA no Apps Script — próxima rodada
da migração, como já vínhamos combinando.

--- HISTÓRICO ANTERIOR (Beta v1.6.0 — bugfix crítico + contratos) ---

VERSÃO: Beta v1.6.0
LINHAS: 12311
DATA: 2026-07-30
NOVIDADES (Beta v1.6.0) — BUGFIX CRÍTICO DE GRAVAÇÃO + CONTRATOS NO SUPABASE:
  - CORRIGIDO (bug crítico, achado pelo cliente no teste): saveAll()
    tinha um bloqueio cego — "if (isOffline) { não salva NADA;
    return; }" — ANTES de sequer chegar nas chamadas de gravação.
    Como "isOffline" reflete o Apps Script (que segue indisponível),
    isso bloqueava a gravação de TUDO, inclusive imóveis e serviços
    já migrados para o Supabase na v1.4.0/v1.5.0. A tela mostrava
    "salvo com sucesso" mesmo assim porque o alert de bloqueio saía
    ANTES da mensagem de sucesso ser sequer chamada — mas o dado
    nunca chegava ao banco. Removido o bloqueio; a lógica de
    sucesso/falha por rota que já existia mais abaixo (linha
    "falhas") passa a ser a única fonte de verdade
  - ETAPA 3 — Contratos migrados para o Supabase, mesmo padrão de
    imóveis/serviços: carregarContratosSupabase() lê;
    sincronizarContratoSupabase() grava 1 contrato + as entradas
    novas do histórico (tabela historico_contrato — uma linha por
    edição, preservando o registro rico de "o que mudou, quando e
    a partir de quando passou a valer" que já existia)
  - CORRIGIDO no meio do caminho: o bloco antigo do Apps Script
    ainda sobrescrevia "contratos" a partir do cache local em caso
    de falha — como contratos agora tem seu próprio bloco de
    carregamento (Supabase) com seu próprio catch, essa
    reatribuição no bloco de "demais dados" foi removida (evitava
    um contrato recém-carregado do Supabase ser silenciosamente
    substituído por uma cópia antiga em cache)
  - Removida a classe "offline-disable" do botão e formulário de
    Contrato (mesma lógica da v1.5.0 para imóveis/serviços — não
    depende mais do Apps Script)
  - SIMPLIFICAÇÕES CONSCIENTES (documentadas no próprio código):
    "anexos" do contrato não está sendo lido/gravado como campo
    próprio nesta etapa (no schema novo, viraria uma entrada de
    histórico com anexo — ainda não conectado); "divisao_repasse_
    contrato" (tipo 3 da divisão) não está gravado — a tela de
    contrato hoje nem expõe esse campo ainda

⚠️ Mensalidades, repasses, pendências de extrato (conciliação) e
vitrine pública AINDA no Apps Script — próxima rodada da migração.

--- HISTÓRICO ANTERIOR (Beta v1.5.0 — desbloqueio offline + DEV + serviços) ---

VERSÃO: Beta v1.5.0
LINHAS: 12092
DATA: 2026-07-30
NOVIDADES (Beta v1.5.0) — DESBLOQUEIO OFFLINE + PERFIL DEV + SERVIÇOS NO SUPABASE:
  - CORRIGIDO (bug real, achado pelo cliente no teste): o app travava
    as abas de Imóvel e Contrato inteiras sempre que "isOffline" era
    verdadeiro — mesmo quando só o Apps Script (contratos/mensalidades)
    estava fora do ar, e imóveis já funcionava de forma independente
    desde a v1.4.0. Removida a classe "offline-disable" dos elementos
    de Imóvel, Síndico, Manutencista e Administradora (que não
    dependem mais do Apps Script); removido também o switchTab()
    forçado para "tab-inadimplencia" sempre que ficava offline
  - CORRIGIDO: acesso à aba DEV checava o nome mágico legado
    "Nicola-Adm" (socioLogado !== 'Nicola-Adm') — não fazia mais
    sentido desde a v1.3.0, quando socioLogado passou a ser o nome
    real da pessoa (vindo do Supabase). Trocado para checar
    perfilLogado === 'admin', o campo de verdade vindo da tabela
    "pessoas"
  - ETAPA 3 — Serviços (síndico, manutencista, administradora)
    migrados para o Supabase, mesmo padrão usado em imóveis:
    carregarPrestadoresSupabase() lê; sincronizarPrestadorSupabase()
    grava 1 prestador + seus vínculos com empreendimentos (síndico e
    manutencista); administradora fica sem vínculo por enquanto (ela
    se liga por CONTRATO, ainda não migrado)
  - Regra de vigência do síndico (só 1 vigente por empreendimento,
    imposta pelo próprio banco desde o schema) implementada no
    fluxo de gravação: ao vincular um síndico novo a um
    empreendimento que já tinha outro, fecha a vigência do anterior
    automaticamente antes de abrir a do novo — efetiva a "troca de
    síndico" sem exigir uma tela nova
  - Exclusão de síndico/manutencista/administradora agora também
    apaga no Supabase (mesma correção que fizemos em imóveis na
    v1.4.0 — a sincronização em lote só grava/atualiza, nunca apaga
    sozinha)
  - SIMPLIFICAÇÃO CONSCIENTE: campo "escopo" da administradora não
    está sendo gravado ainda (no schema novo, mora no vínculo com o
    contrato — que ainda não foi migrado). Volta quando contratos
    forem migrados

--- HISTÓRICO ANTERIOR (Beta v1.4.0 — imóveis migrados para o Supabase) ---

VERSÃO: Beta v1.4.0
LINHAS: 11826
DATA: 2026-07-30
NOVIDADES (Beta v1.4.0) — ETAPA 3: IMÓVEIS MIGRADOS PARA O SUPABASE:
  - Leitura de imóveis: nova função carregarImoveisSupabase() —
    substitui a leitura via fetch(GOOGLE_API_URL). Independente do
    Apps Script: mesmo que o Apps Script continue falhando (CORS),
    os imóveis carregam normalmente
  - Gravação de imóveis: novas funções sincronizarImovelSupabase()
    (grava/atualiza 1 imóvel + sua divisão societária) e
    sincronizarImoveisSupabase() (percorre a lista, chamada pelo
    saveAll() no lugar de enviarDadosParaGoogleSheets("imoveis",...))
  - Exclusão de imóvel: adicionado delete explícito no Supabase
    (a sincronização em lote só grava/atualiza, não apaga sozinha —
    sem isso, excluir um imóvel localmente não removia do banco)
  - "tipo" e "empreendimento" continuam como texto livre na tela
    (sem mudar o formulário ainda) — obterOuCriarLookup() cria a
    linha correspondente em tipos_imovel/empreendimentos
    automaticamente na primeira vez que um nome novo aparece
  - entrarNoSistema() reestruturado: imóveis (Supabase) e demais
    dados (Apps Script — contratos, mensalidades, repasses, sócios,
    prestadores) agora carregam em blocos try/catch INDEPENDENTES.
    Se o Apps Script falhar, só essas rotas ficam vazias/em cache —
    não trava mais o app inteiro nem impede ver/editar imóveis
  - REMOVIDO: bloco inteiro de "usuarioBackend"/aprovação por
    dispositivo dentro de entrarNoSistema() — morto desde a v1.3.0
    (Supabase já decide autorização antes desta função ser chamada),
    ficou como código morto até agora. acessoAutorizado passa a ser
    sempre true aqui dentro (a checagem de verdade já aconteceu)
  - SIMPLIFICAÇÃO CONSCIENTE (documentada no próprio código): o
    campo "parteRumo" (propriedade dentro/fora da empresa) ainda
    não lê/grava de "propriedade_imovel" — fica fixo em 100% da
    empresa nesta etapa. Só a divisão entre sócios internos
    ("divisao") está de fato migrada. Nada foi perdido — é uma
    fatia ainda não conectada, não uma remoção de funcionalidade

⚠️ Contratos, mensalidades, repasses, sócios, prestadores e
conciliação bancária CONTINUAM no Apps Script nesta versão —
migração é tabela por tabela, como planejado. Enquanto o Apps
Script não for corrigido ou também migrado, essas telas ficam sem
dado novo (mas não impedem o uso da parte de imóveis).

--- HISTÓRICO ANTERIOR (Beta v1.3.1 — correção da tela de login) ---

VERSÃO: Beta v1.3.1
LINHAS: 11664
DATA: 2026-07-30
NOVIDADES (Beta v1.3.1) — CORREÇÃO DA TELA DE LOGIN NO DESKTOP:
  - CORRIGIDO: os campos de e-mail/senha não apareciam em janelas
    largas e baixas (típico de notebook) — a splash empilhava foto
    grande + logo + formulário sem rolagem habilitada; em telas
    baixas o formulário ficava fora da área visível, sem como
    rolar até ele. Removida a foto de fundo e a logo "RAIZ" (fica
    só o subtítulo por enquanto — reversível, é só reativar o h1
    #logo-splash), e adicionado overflow-y-auto na splash como
    rede de segurança para qualquer tela mais baixa no futuro
  - Campos de e-mail/senha e botão "Entrar" aumentados (mais
    padding, fonte maior) — mais fáceis de tocar/ler

--- HISTÓRICO ANTERIOR (Beta v1.3.0 — login definitivo via Supabase) ---

VERSÃO: Beta v1.3.0
LINHAS: 11655
DATA: 2026-07-30
NOVIDADES (Beta v1.3.0) — LOGIN DEFINITIVO (SUPABASE, CENÁRIO B):
  - Substituído de vez o login por Conta Google (Cenário A), que
    esbarrava numa limitação real da plataforma do Apps Script:
    chamadas via fetch() para um Web App que exige login do Google
    são bloqueadas por CORS, sem contorno possível no nosso código
    (ver conversa de 2026-07-29 para o diagnóstico completo)
  - Nova tela de login: e-mail + senha, via Supabase Auth
  - SUPABASE_URL, SUPABASE_ANON_KEY e CLIENTE_ID_SUPABASE (novo bloco
    de configuração) — a chave anon é segura para ficar no código; a
    segurança de verdade vem das políticas de RLS no banco
  - Fluxo: login → confere se existe uma linha em "pessoas" para o
    CLIENTE_ID_SUPABASE desta instalação → só então libera a entrada.
    Login válido no Supabase sozinho NÃO basta — precisa também
    pertencer a este cliente especificamente
  - Removido o fluxo antigo de "aprovação de dispositivo" do
    window.onload (dispositivo aprovado por localStorage). O
    equivalente agora é: sessão do Supabase válida = entra direto,
    sem digitar senha de novo, com verificarAcessoEEntrar()
  - Botão "Sair" do cabeçalho agora faz logout de verdade
    (fazerLogoutSupabase — encerra a sessão do Supabase), antes só
    voltava visualmente para a splash sem encerrar nada
  - CORRIGIDO: entrarNoSistema() referenciava o elemento "btn-entrar",
    removido nesta versão (virou o formulário de login) — adicionado
    fallback seguro para não quebrar com erro de referência nula

⚠️ AÇÃO NECESSÁRIA NO APPS SCRIPT — o carregamento de dados
(imóveis, contratos etc.) AINDA vem do Apps Script nesta versão
(a migração de dados para o Supabase é a próxima etapa do plano).
Para o fetch(GOOGLE_API_URL) voltar a funcionar sem CORS, é
necessário republicar o Web App como "Executar como: Eu" + "Quem
tem acesso: Qualquer pessoa" — REMOVENDO a exigência de Conta
Google na própria plataforma do Apps Script. O Supabase (login
desta versão) passa a ser quem decide quem entra na TELA; o Apps
Script deixa de fazer essa checagem por conta própria.
⚠️ Tradeoff temporário e consciente: nesta etapa intermediária, a
URL do Apps Script, se descoberta, responde a qualquer chamada
direta (mesma limitação do sistema pré-Cenário-A). A blindagem de
verdade, no nível dos dados, só fica completa quando os dados
migrarem para o Supabase (RLS protege no banco, não só na tela) —
próxima etapa do plano.

--- HISTÓRICO ANTERIOR (Beta v1.2.3 — logotipo e tema verde) ---

VERSÃO: Beta v1.2.3
LINHAS: 11522
DATA: 2026-07-25
NOVIDADES (Beta v1.2.3) — LOGOTIPO E TEMA VERDE:
  - CONFIG_CLIENTE.logoUrl preenchido com o logotipo "RAIZ
    PATRIMÔNIO" enviado (embutido como base64 direto no HTML —
    não depende de nenhum arquivo externo hospedado). A função
    aplicarBrandingCliente() já sabia renderizar isso como <img>;
    nenhuma mudança de código foi necessária, só o valor
  - Paleta recolorida de azul/slate-escuro para tons de verde
    (família Tailwind "emerald"), escopo deliberadamente limitado
    a duas coisas: (1) o FUNDO escuro do app — cabeçalho, splash,
    navegação (antes bg-slate-700/800/900/950) — e (2) a cor de
    destaque/marca — logo "RAIZ", botões, títulos de seção (antes
    toda a família "blue"). 137 classes trocadas ao todo
  - NÃO alterado de propósito: texto comum e títulos em fundo
    claro (text-slate-700/800/900, ~52 ocorrências) e bordas
    claras de formulário (border-slate-200/300) — são cor de
    texto/borda em cards brancos, não "fundo", e trocar sem
    necessidade arriscava legibilidade à toa em telas que nem
    foram mencionadas no pedido

--- HISTÓRICO ANTERIOR (Beta v1.2.2 — dados desta instalação de teste) ---

VERSÃO: Beta v1.2.2
LINHAS: 11498
DATA: 2026-07-25
NOVIDADES (Beta v1.2.2) — DADOS DESTA INSTALAÇÃO DE TESTE:
  - CONFIG_CLIENTE alinhado com os dados reais desta instância
    (BETA-RAIZ-PATRIMONIO): nomeResponsavel, cnpj, cidade e uf
    trocados de Ruyter/Rumo para Nicola Santos Dutra / São Paulo
  - socioPadrao trocado de "Ruyter" para "Nicola"
  - sociosConhecidos trocado da lista real da família Rumo para
    4 placeholders de teste (1-NICOLA TESTE a 4-NICOLA TESTE)
  - nomesSociosPerfil reduzido para ["Nicola"]
  - GOOGLE_API_URL atualizada para a implantação nova que
    resolveu o problema de autorização (ver conversa) —
    implantação anterior ficou presa numa versão desatualizada
    mesmo após "Nova versão"; a partir de agora, a recomendação
    é sempre usar "Nova implantação" (URL nova) em vez de editar
    a implantação existente, para eliminar essa ambiguidade
  - REGISTRADO COMO MELHORIA FUTURA (pedido do cliente): tanto
    socioPadrao quanto sociosConhecidos deveriam vir de uma
    marcação no próprio Cadastro de Sócios (ex.: checkbox "sócio
    principal"), não de config fixa. Não implementado nesta
    versão — fica para uma etapa futura de evolução do cadastro

--- HISTÓRICO ANTERIOR (Beta v1.2.1 — correções do primeiro teste) ---

VERSÃO: Beta v1.2.1
DATA: 2026-07-24
NOVIDADES (Beta v1.2.1) — CORREÇÕES DO PRIMEIRO TESTE DA INSTALAÇÃO NOVA:
  - CORRIGIDO (bug real, não cosmético): localStorage usava chaves fixas
    ("rumo_imoveis", "rumo_contratos", "rumo_mensalidades", "rumo_repasses",
    "rumo_admin_verificado", "rumo_device_id" e outras 5) — como
    localStorage é isolado por ORIGEM e não por pasta/repositório, duas
    instalações hospedadas no MESMO domínio (ex.: GitHub Pages
    usuario.github.io/repoA e /repoB) podiam ler o cache uma da outra.
    Foi exatamente o que aconteceu no primeiro teste: o cache do
    navegador, deixado por uma visita anterior ao sistema real da Rumo,
    vazou para a instalação nova assim que ela caiu em modo offline.
    Nova função chaveLocal(sufixo) deriva o prefixo de
    CONFIG_CLIENTE.nomeEmpresa — cada instalação agora tem seu próprio
    namespace de cache, mesmo compartilhando domínio
  - CORRIGIDO: "Versão do Sistema: v7.4.2" fixo na tela de erro/offline
    (nunca tinha sido achado nas rodadas anteriores de renomeação) →
    agora reflete a versão atual
  - CORRIGIDO: badge do cabeçalho ainda mostrava "Beta v1.1.0" — texto
    estático que ficou para trás no bump de versão anterior

--- HISTÓRICO ANTERIOR (Beta v1.2.0 — de-hardcoding profundo) ---

NOVIDADES (Beta v1.2.0) — ETAPA 1 (de-hardcoding profundo):
  - "Ruyter" deixou de ser um literal espalhado por ~16 pontos do
    código. Nova constante SOCIO_PADRAO = CONFIG_CLIENTE.socioPadrao
    (default "Ruyter", preservando os dados já existentes da Rumo)
    agora é a ÚNICA fonte da chave de divisão societária e do
    rótulo "[Sócio] (Padrão)" no formulário de imóvel. Um cliente
    novo troca 1 linha (CONFIG_CLIENTE.socioPadrao) e o sistema
    nasce limpo, sem precisar editar nenhuma outra parte do código
  - SOCIOS_CONHECIDOS (nomes completos usados para casar retiradas
    via PIX no extrato bancário) e NOMES_SOCIOS_PERFIL (nomes curtos
    do fluxo legado de solicitação de acesso) saíram de listas
    fixas e agora vêm de CONFIG_CLIENTE.sociosConhecidos /
    .nomesSociosPerfil — para a Rumo, mantidos com os dados reais
    (preservando o recurso de conciliação); um cliente novo começa
    com sociosConhecidos: [] e vai preenchendo
  - Genericizado texto de exibição: "Energia Rumo" → "Energia" (5
    ocorrências: rótulo do formulário, dica de texto, badge, texto
    de disponibilidade); "gestão direta Rumo" → "gestão direta" (2
    ocorrências, seletor de administradora). Nomes internos de campo
    (imo.energiaRumo, a coluna da planilha) NÃO foram tocados — só o
    texto que o usuário lê
  - NÃO alterado nesta rodada (variáveis JS locais como
    pctRuyterAtual, valorRuyter, inputRuyter): são só nomes internos
    de variável, invisíveis ao usuário e aos dados — renomeá-las não
    traz benefício e só aumenta risco de erro de digitação

--- HISTÓRICO ANTERIOR (Beta v1.1.0 — Etapa 1 identidade + Etapa 2 login) ---

NOVIDADES (Beta v1.1.0) — ETAPA 1 (personalização) + ETAPA 2 (login):

ETAPA 1 — Identidade do cliente em primeiro plano:
  - Novo bloco CONFIG_CLIENTE (nomeEmpresa, nomeResponsavel, cnpj,
    cidade, uf, logoUrl, assinaturaImgBase64) no topo do <script> —
    um ponto único para personalizar cada instalação
  - Função aplicarBrandingCliente() injeta esses valores nos pontos
    antes fixos: logo da tela inicial, logo do cabeçalho interno,
    recibo em PDF (cabeçalho, CNPJ, cidade de emissão, assinatura),
    relatório em PDF, mensagens de WhatsApp (manutenção, IPTU,
    notificação de caixa, oportunidade da vitrine)
  - "Raiz Patrimônio" (o software) foi para segundo plano: nova aba
    "Sobre" no menu principal, com o nome do cliente em destaque e
    a marca do software discreta, junto de versão e contato/suporte
    (campos [e-mail de suporte a definir] / [link institucional a
    definir] — preencher antes de divulgar)
  - Backend (Code.gs) ganhou o mesmo CONFIG_CLIENTE — usado no
    assunto, assinatura e rodapé dos e-mails automáticos

ETAPA 2 — Login por Conta Google (Cenário A):
  - Novo USUARIOS_AUTORIZADOS no Code.gs — lista de e-mails (Conta
    Google) autorizados a usar esta instalação, com papel admin
  - Nova função usuarioAtual() identifica quem está acessando via
    Session.getActiveUser() e confere contra a lista
  - doPost bloqueia TODAS as rotas de escrita se o e-mail não
    estiver autorizado (verificação no início da função, antes de
    processar qualquer rota)
  - doGet bloqueia a carga completa de dados da mesma forma —
    EXCETO a rota da vitrine pública (link compartilhado), que
    continua sem exigir login
  - CORRIGIDO (pré-requisito da autenticação): a vitrine pública
    antes buscava o PORTFÓLIO INTEIRO (todos os contratos, sócios,
    financeiro de todos os imóveis) e filtrava no navegador — um
    vazamento de dados pré-existente. Agora o backend devolve, já
    filtrados, só os imóveis daquele link específico
  - Front-end: quando o backend confirma login autorizado, a
    identidade é aplicada automaticamente (sem mais o prompt manual
    "Digite o usuário do administrador"). O fluxo antigo por
    aprovação de dispositivo continua no código como fallback
    estrutural, mas não é mais alcançado em uso normal
  - Nova tela mostrarTelaNaoAutorizado() — bloqueia com a mensagem
    do backend e mostra o e-mail identificado, quando a Conta
    Google não está na lista de autorizados

⚠️ MUDANÇA DE DEPLOY NECESSÁRIA — o Web App precisa ser republicado
com "Executar como: Usuário que acessa o app" (era "Eu") e "Quem tem
acesso: Qualquer pessoa com uma Conta Google" (era "Qualquer
pessoa"). Cada e-mail autorizado também precisa de acesso de Editor
direto na planilha e nas duas pastas do Drive — sem uma Conta
Google, a pessoa não consegue acessar o sistema (ver conversa sobre
Cenário A x B)

NÃO ALTERADO NESTA VERSÃO (mesma ressalva da v1.0.0): "Ruyter" ainda
é o sócio padrão do sistema (rótulo, NOMES_SOCIOS_PERFIL, chave de
dados, SOCIOS_CONHECIDOS da conciliação bancária) — fica para a
Etapa 1 de de-hardcoding mais profunda, ainda não feita

--- HISTÓRICO ANTERIOR (v1.0.0 — renomeação para Raiz Patrimônio) ---

NOVIDADES (v1.0.0) — RENOMEAÇÃO PARA RAIZ PATRIMÔNIO:
  - Sistema rebatizado de RUMO para RAIZ PATRIMÔNIO em todo texto de
    exibição: título, meta tags, cabeçalhos (h1), badge de versão,
    recibo em PDF, relatório em PDF, assuntos de e-mail, mensagens
    de WhatsApp. Identificadores internos (funções, variáveis, IDs
    de DOM, chaves de dados salvas na planilha) foram mantidos
    propositalmente intactos — só o texto que o usuário lê mudou
  - NEUTRALIZADO (dado sensível): CNPJ real da família Rumo
    (18.661.505/0001-62) trocado por placeholder 00.000.000/0001-00
    no cabeçalho do recibo e no rodapé do relatório PDF
  - REMOVIDO (dado pessoal): imagem embutida (base64) da assinatura
    digitalizada de Ruyter Carlos da Silva no recibo em PDF — trocada
    por um espaço reservado em branco; nome do signatário no recibo
    virou placeholder "[Nome do Responsável]" / "[Nome da Empresa]"
  - ATENÇÃO — NÃO ALTERADO NESTA VERSÃO (fica para a Etapa 1 de
    de-hardcoding, ~20-30h já planejadas): "Ruyter" continua sendo o
    sócio padrão do sistema (rótulo "Ruyter (Padrão)" no formulário
    de imóvel, array NOMES_SOCIOS_PERFIL, chave de dados em
    divisao["Ruyter"], lista SOCIOS_CONHECIDOS usada na conciliação
    bancária). Mexer nisso agora, sem o refactor completo, arrisca
    quebrar cálculo de divisão societária tanto nos leads quanto na
    instalação real da Rumo. Cosmético por enquanto, não bloqueia o
    teste dos leads
  - Cidade "Belo Horizonte" ainda hardcoded em 3 pontos (rodapé do
    PDF, texto do recibo, valor padrão de cidade) — trocar
    manualmente pela cidade de cada cliente se for diferente

--- HISTÓRICO ANTERIOR (como Sistema RUMO) ---

NOVIDADES (v7.4.2):
  - Link visível "Sou o administrador" virou duplo clique escondido
    na palavra "RUMO" da tela inicial (mesmo padrão já usado no
    cabeçalho interno para abrir o DEV)
  - Clique simples na palavra "RUMO" do cabeçalho (que volta pra
    tela inicial) agora recarrega a página de verdade — antes só
    trocava a tela sem buscar nada novo do servidor, então nunca
    pegava uma versão mais recente publicada
  - CORRIGIDO (bug real): seção de Repasses no e-mail Resultado
    vinha sempre vazia. Causa: o Google Sheets pode converter
    automaticamente a data digitada em "Registrar Retirada" de
    texto para um valor de data de verdade — nesse caso o backend
    devolve a data no formato AAAA-MM-DD, mas o código só sabia
    interpretar DD/MM/AAAA, e descartava todo registro em silêncio.
    Agora reconhece os dois formatos. Confirmado o bug e testada a
    correção isoladamente antes de aplicar
  - Removidas as referências fixas a "Dia 01"/"Dia 15" no dropdown
    de e-mail de teste (DEV) e nos checkboxes de opt-in dos sócios
    — agora são só "Email Lembrete"/"Email Resultado", já que o dia
    é configurável e não faz mais sentido nomear por número fixo
  - CORRIGIDO: envio manual de teste usava o nome de quem por acaso
    tem aquele e-mail cadastrado no Cadastro Sócios, em vez do nome
    de quem está de fato logado testando. Agora usa o nome de quem
    está logado (o admin vê "Nicola-Adm"); o envio automático para
    todos os sócios continua usando o nome real de cada um

NOVIDADES (v7.4.1) — CORREÇÃO DE 2 BUGS no controle de acesso da v7.4.0:
  - BUG 1: se o dispositivo do admin já estivesse aprovado como um
    sócio qualquer (ex: de teste anterior), o sistema nunca chegava
    a perguntar "Nicola-Adm" — entrava direto como aquele sócio, e a
    trava pré-existente de DEV ("perfis de sócio não têm acesso")
    passou a bloquear também o admin, já que agora ele tinha
    socioLogado preenchido. Corrigido: verificação de admin
    (localStorage) tem prioridade sobre aprovação de sócio; adicionado
    link permanente "Sou o administrador" na tela inicial, sempre
    disponível independente do estado de aprovação do aparelho; DEV
    agora libera explicitamente para socioLogado === 'Nicola-Adm'
  - BUG 2: com um pedido de acesso Pendente (não aprovado), era
    possível entrar mesmo assim caindo no "modo offline" (fallback
    que carrega dados do cache local quando a rede falha) — esse
    modo nunca verificava autorização, só herdava o valor da
    variável de uma tentativa anterior na mesma sessão de página.
    Corrigido: acessoAutorizado é resetado no início de cada
    chamada, e o modo offline agora consulta explicitamente uma
    flag persistida SÓ quando uma autorização foi confirmada de
    verdade — sem essa flag, nem o modo offline libera acesso
  - Validado com simulação isolada dos 3 cenários (bug do admin,
    bypass via offline, e não-regressão do sócio legítimo offline)

NOVIDADES (v7.4.0):
  - Vitrine pública (link compartilhado): adicionado botão "✕ Sair"
    (tenta window.close(), com tela de despedida como plano B, já que
    nem todo navegador permite fechar aba aberta por link direto)
  - Ao gerar link da vitrine: em vez de só copiar e avisar, agora
    pergunta se quer abrir o WhatsApp para compartilhar ou só fechar
    (link já copiado de qualquer forma)
  - DEV: "Solicitações de Acesso" e "Cadastro Sócios" (que eram duas
    seções separadas) viraram UM componente só — cada sócio mostra
    nome/e-mail/whatsapp editáveis, status de acesso com Aprovar/
    Recusar/Revogar quando aplicável, e os checkboxes de e-mail.
    Suporta renomear sócio sem perder o histórico de aprovação
  - CONTROLE DE ACESSO REAL: antes o sistema não validava nada — ao
    clicar "Acessar Sistema", qualquer um entrava direto. Agora
    verifica se o dispositivo está aprovado; se não, só o usuário
    "Nicola-Adm" consegue passar (bypass fixo do administrador);
    qualquer outro é bloqueado numa tela que não revela dados do
    sistema, com opção de solicitar acesso. Importante: validação é
    de front-end — o backend ainda aceita chamadas sem autenticação
  - Dia do mês configurável para os e-mails automáticos (Dia 01 e
    Dia 15 eram fixos) — campos numéricos em DEV, 1 a 28

NOVIDADES (v7.3.9):
  - Nenhuma mudança neste HTML — a autorização antecipada do escopo
    de triggers (script.scriptapp) foi feita no appsscript.json e no
    Code-V7.3.9.gs (função autorizarPermissoes). Ver changelog no
    Code-V7.3.9.gs

NOVIDADES (v7.3.8):
  - Nova seção "🤖 Envio Automático de E-mails" na aba DEV, com botão
    de liga/desliga (status verificado ao abrir a aba)
  - Resto do trabalho desta rodada foi no backend (Code.gs): correção
    importante dos Repasses aos Sócios (agora usa dados reais de
    retirada, não mais um cálculo teórico) e o sistema de triggers
    automáticos. Ver changelog completo no Code-V7.3.8.gs. Ícones do
    Android também corrigidos (arquivos separados, fora do HTML)

NOVIDADES (v7.3.7):
  - Rótulos "Dia 05" trocados para "Dia 15" (dropdown de teste em DEV
    e checkbox de config. por sócio) — identificador interno de rota
    continua "dia05", sem risco de quebra
  - Ícone de alerta (🔺) em contratos: maior, com fundo vermelho e
    leve pulsação, mais fácil de notar num card com vários badges
  - Resto do trabalho desta rodada foi no backend (Code.gs): correção
    importante de estilos de e-mail (classes Tailwind que não tinham
    efeito nenhum em cliente de e-mail real), totais da tabela de
    competências, inadimplências e repasses. Ver changelog completo
    no Code-V7.3.7.gs

NOVIDADES (v7.3.6):
  - CORRIGIDO: tabela de Métricas não removia decimais de fato
    (minimumFractionDigits:0 só define o mínimo, não o máximo) —
    trocado por Math.round() antes do toLocaleString() nas colunas
    Potencial/Previsto/Recebido/Inadimplente
  - Resto do trabalho desta rodada foi no backend (Code.gs):
    personalização de nome nos e-mails, correções de competência/
    formatação, e as duas seções grandes que faltavam (Inadimplência
    agrupada e Repasses aos Sócios). Ver changelog completo no
    Code-V7.3.6.gs

NOVIDADES (v7.3.5):
  - CORRIGIDO: filtro de empreendimento na Vitrine era uma lista
    hardcoded no HTML (não dinâmica) — por isso "Belo Horizonte"
    nunca aparecia; agora usa popularFiltroSelect() como as demais
  - Botão "Compartilhar Link da Vitrine" movido para o topo da aba
  - Mensagem de energia ajustada de "incluída" para "disponível"
  - Métricas: removidos os boxes-resumo e a legenda em caixa
    separada — ficam só os filtros e a tabela; tabela mais estreita
    (cabe sem scroll horizontal), sem "R$" repetido em cada célula,
    "% Inadimplência" renomeada para "% INAD", legenda movida para
    nota em itálico no rodapé da tabela
  - DEV: "Configurar E-mails por Sócio" virou "Cadastro Sócios" —
    CRUD completo (adicionar, editar nome/e-mail/whatsapp inline,
    marcar quais e-mails recebe, excluir com confirmação)
  - DEV: log do sistema com borda e fundo branco, consistente com
    os demais cards da aba (era fundo escuro, sem borda visível)
  - Tamanho de fonte das tabelas de Acessos/Links padronizado para
    11px (estava em 9px/10px, menor que o resto do app)

NOVIDADES (v7.3.4):
  - Nenhuma mudança estrutural no HTML nesta versão — o trabalho desta
    rodada foi 100% no backend (Code.gs): reescrita completa dos
    e-mails Dia 01 e Dia 05 (texto, tom e assinatura, com base em
    modelos de referência fornecidos)
  - A partir de agora, frontend e backend sempre avançam juntos de
    versão a cada entrega, mesmo quando só um dos dois muda de fato

NOVIDADES (v7.3.3):
  - Contratos: badge de energia (⚡) agora no mesmo estilo usado em
    Imóveis, e reposicionado para ANTES do nome do locatário (título)
  - Contratos: "Desconto Energia" subiu para ao lado de "Valor
    Vigente"; "Administradora Terceirizada" ocupou o lugar antigo
    do desconto (saiu da seção avançada de Reajuste/Alteração)
  - Imóveis: seção "Manutenção" virou "Manutencista" (somente
    leitura) e só aparece se houver manutencista vinculado ao
    empreendimento; nova seção "Síndico" (mesmo comportamento)
    aparece ANTES dela. Trocar/atualizar só é possível em Serviços
  - CORRIGIDO: sindicoId/manutencistaId nunca eram calculados —
    agora há cascata automática (recalcularVinculosSindicos/
    recalcularVinculosManutencistas) ligando imóvel ↔ empreendimento
  - CORRIGIDO: ao editar e salvar um imóvel, sindicoId/manutencistaId
    eram perdidos silenciosamente (objeto reconstruído do zero)
  - Síndico: removido o campo "Tipo de Documento" — agora é um único
    campo (CPF ou CNPJ), com validação real de dígito verificador
    (mesmo padrão de Contratos), não apenas contagem de dígitos
  - Síndico: campo de vigência (data de início) por empreendimento,
    que não aparecia, agora é exibido ao lado de cada checkbox
  - DEV: box de log agora tem borda e espaçamento consistentes com
    os demais cards da aba (estava com borda mais fina e sem margem)
  - Títulos de todas as abas padronizados (tamanho/cor/posição/fonte)
    seguindo o padrão de "Faturamento Mensal": text-lg font-bold
    raiz-text-pine
  - Números-resumo do topo de Imóveis e Contratos agora refletem os
    filtros ativos (empreendimento/status), não mais o total geral

HISTÓRICO (v7.3.2):
  - Aba Serviços (Síndicos/Manutencistas/Administradoras) padronizada
    visualmente com Imóveis e Administradoras: mesmo botão circular
    branco com ícone "+", mesmo estilo de card na lista
  - Formulários de Síndicos/Manutencistas agora abrem inline, ACIMA
    da lista (como em Imóveis/Administradoras) — não mais em modal
  - Administradoras foi movida para dentro da aba Serviços; a aba
    "Admin." separada foi removida (nav + seção + toggle dev-mode)
  - Acessos e Links agora vêm prontos na carga inicial do doGet
    (backend v7.3.1) e renderizam instantaneamente, sem round-trip
    extra ao servidor — mesmo padrão de Imóveis/Contratos
  - saveAll() agora também persiste síndicos e manutencistas na nuvem
