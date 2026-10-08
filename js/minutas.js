// ============================================================================
// minutas.js — Raiz Patrimônio · Minutas de contrato (modelos, placeholders,
//               geração da minuta preenchida, minutização de um contrato real)
// Versão: 1.4.0 · 08/10/2026
//
// v1.4.0 (UX F2.8, demanda 42ef8b51, sessão 20261003-1707-ux-base; "Sim. Faça 1 e 2 agora" do Nicola 08/10 20:09) —
// "Minuta ainda indisponível" deixa de listar chaves técnicas (locador_cnpj, imovel_endereco…): o que falta vem
// em português, agrupado por onde se preenche (Contrato e locatário, Fiadores, Minha empresa, Imóvel, Modelo),
// com o botão que abre a tela certa. Textos sem "vitrine".
//
// Versão anterior: 1.3.0 · 08/10/2026
//
// v1.3.0 (UX F2.7c-3, demanda b8602a3a, sessão 20261003-1707-ux-base; "De acordo" do Nicola 08/10 14:04) —
// "Gerar de um contrato real" vira Sheet de 2 passos (o formulário fixo do index saiu); ajuda de
// placeholders vira Sheet empilhado (antes abria ATRÁS do formulário da minuta, z-index 96 < 97);
// escolha entre minutas aplicáveis vira Sheet de ações; formulário da minuta em .rz-f; lista vazia
// vira o vazio que convida (IA lê um contrato real; manual: enviar o .docx).
//
// Versão anterior: 1.2.0 · 04/10/2026
//
// v1.2.0 (F0.2b do PLANO_UX, demanda 9e4aca28, sessão 20261003-1707-ux-base; UXR-29/30) — zero diálogo nativo: 20 alert() e 2 confirm() viram
// rzAvisar/rzPerguntar/rzResumo; excluir minuta em Sheet com item vermelho; a lista do que
// falta para gerar a minuta vira resumo de várias linhas.
//
// Versão anterior: 1.1.0 · 22/09/2026
//
// v1.1.0 (Fase 1 do wrapper de escrita, rollout Contratos+Minutas — pedido
// do Nicola 22/09/2026) — adoção do utilitário js/raiz-eventos.js (piloto
// único até aqui era cofre-ativos.js). Funções que persistem de verdade
// ganham emitirEscrita():
//   · salvarMinuta() → 'minuta' / acao 'editar' (cadastro OU edição do
//     modelo — mesmo popup pros dois casos, id resolvido depois do upload).
//   · excluirMinuta() → 'minuta' / acao 'excluir'.
//   · confirmarMinutizacao() → 'minuta' / acao 'gerar-de-contrato-real'
//     (CONFIRMADO que persiste: sobe o .docx gerado pro Storage e chama
//     saveAll(..., ['minutasContrato']), que grava a linha nova — não é só
//     leitura/preview como o nome sugeria à primeira vista).
//   · gerarMinutaNoCofre() → DUAS entidades, porque são DUAS escritas
//     diferentes na mesma operação: 'minuta' / acao 'gerar-no-cofre' (a
//     minuta preenchida foi gerada) E 'documento' / acao 'criar-via-minuta'
//     (cofre_documentos ganhou uma linha nova, vinculada ao contrato via
//     cofre_documento_vinculos — é um documento novo no Cofre, entidade
//     diferente de 'minuta').
//   · gerarMinutaContrato() → NÃO ganhou emit próprio: ela só resolve qual
//     minuta usar e delega 100% pra gerarMinutaNoCofre() (await), que já
//     emite os dois eventos acima — duplicar aqui disparava o mesmo evento
//     2x pela mesma escrita.
//   · confirmarMinutizacao() confirmado como o único outro ponto de escrita
//     real do wizard "Gerar de um contrato real" (os passos anteriores —
//     processarArquivoMinutizacao, detecção de placeholders — só leem/
//     calculam, nada é persistido até a confirmação).
// BUG DO cofre-ativos.js (objeto local ficava velho até um recarregamento
// assíncrono terminar) — VERIFICADO E NÃO ENCONTRADO aqui: salvarMinuta()
// substitui o objeto inteiro no array (`minutasContrato[idx] = dados`, não
// uma mutação parcial de referência velha) e nenhuma das funções de escrita
// deste arquivo reabre a MESMA tela de edição logo depois de salvar (o
// sheet fecha via cancelarEdicaoMinuta()) — o padrão que causou o bug no
// Cofre de Ativos não se aplica aqui. Nenhuma correção foi necessária.
// LISTENER (module boot, guarda window.__rzListenerEscritaMinutaLigado):
// aoEscrever('minuta', ...) chama renderMinutas() — mesmo padrão já usado
// em index.html após saveAll (rzMinSeCarregado('renderMinutas')) pros
// saves que passam por saveAll; cobre também gerarMinutaNoCofre(), que não
// passa por saveAll e por isso não tinha esse retorno hoje (ainda que essa
// ação específica não mude a LISTA de modelos, o listener é genérico —
// reage a qualquer 'minuta', de qualquer origem, presente ou futura).
//
// R8 — FRAGMENTAÇÃO, FATIA 3 (A.8). Terceiro corte do index.html (Beta
// v1.142.0), mesmo método do financeiro.js/contratos.js: ES module SOB
// DEMANDA via import() no switchTab('tab-minutas'), pontes window[nome] no
// index pra quem chama de fora, rzMinSeCarregado() nos ganchos de recarga.
//
// O QUE MORA AQUI: tela tab-minutas (renderMinutas, ⋮, form em sheet, salvar/
// excluir modelo, ajuda de placeholders); wizard "Gerar de um contrato real"
// (minutização: extrai texto de DOCX/PDF, detecta placeholders com IA via
// minuta-detectar-placeholders, revisão, gera DOCX); geração da minuta
// preenchida (montarValoresPlaceholdersMinuta, preencherMinutaDocx,
// gerarMinutaContrato, gerarMinutaNoCofre, prontidão do contrato); escolha
// de minuta pra um imóvel (encontrarMinutaParaImovel, listarMinutasAplicaveis,
// picker, baixar minuta padrão). Helpers exclusivos (slugArquivo,
// dataYYYYMMDD, extensoData, mesesEntreDatas, escaparXml) vieram junto —
// verificado por assert que ninguém fora daqui os usa.
//
// O QUE FICOU NO index.html: `minutasContrato` (dado) + carregar/sincronizar
// MinutasContratoSupabase; contratação pública/vitrine (chama gerarMinutaNo
// Cofre/baixarMinutaPadraoImovel/encontrarMinutaParaImovel pelas pontes);
// HTML da seção (form/wizard) — sai com a gramática.
//
// ESTADO GLOBAL LIDO: minutasContrato, contratos, imoveis, tiposImovel/
// empreendimentosCadastrados, dbAuth, CONFIG_CLIENTE, CLIENTE_ID_SUPABASE,
// pessoaIdLogada. Exclusivo (`__minzEstado`) virou nível de módulo.
// Indentação de origem mantida (template literals). Strict verificado.
// ============================================================================

import { emitirEscrita, aoEscrever } from './raiz-eventos.js'; // v1.1.0 — Fase 1 do wrapper de escrita

export const VERSAO = '1.4.0'; // v-check: manter igual ao header

/** Ponto de entrada do switchTab('tab-minutas'). */
export function montarAbaMinutas() {
    renderMinutas();
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// v1.1.0 (Fase 1 do wrapper de escrita) — registra 1x por carregamento do
// módulo (guarda por window.*, mesmo mecanismo do piloto em index.html,
// pra não duplicar o listener). renderMinutas() já se protege sozinha se
// #lista-minutas não existir no DOM (fora da aba Minutas).
if (!window.__rzListenerEscritaMinutaLigado) {
    window.__rzListenerEscritaMinutaLigado = true;
    aoEscrever('minuta', () => { renderMinutas(); });
}

        export function escaparAtributoHtmlMinz(texto) {
            return String(texto || '')
                .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        }

        // --- Wizard "Gerar de um contrato real" (Parte 3) ---
        let __minzEstado = null;

        // Sheet de 2 passos: 1) nome, escopo e arquivo; 2) conferir o que a IA marcou.
        // Os ids dos campos são os de sempre, então processar/confirmar leem igual.
        export function abrirWizardMinutizacao() {
            __minzEstado = null;
            if (typeof abrirSheet !== 'function') return;
            const obrig = ' <i>*</i>';
            abrirSheet(rzSheetCabecalho('Gerar minuta de um contrato real', 'Passo 1 de 2 · contrato e escopo') + `
                <div class="rz-sh-b">
                    <div id="minz-passo-1" class="rz-passo">
                        <p class="rz-desc" style="margin-bottom:12px">Envie um contrato já assinado (Word ou PDF). A Raiz IA marca os dados que mudam de um contrato para outro — nomes, CPF, valores, datas — e você confere antes de salvar. O arquivo enviado não fica guardado: só o modelo, sem dado pessoal.</p>
                        <div class="rz-f"><label for="minz-nome">Nome da minuta${obrig}</label>
                            <input type="text" id="minz-nome" placeholder="Ex.: Locação comercial padrão"></div>
                        <div class="rz-f"><label for="minz-escopo">Vale para${obrig}</label>
                            <select id="minz-escopo" onchange="atualizarCampoEscopoMinz()">
                                <option value="geral">A empresa toda</option>
                                <option value="empreendimento">Um empreendimento</option>
                                <option value="tipo_imovel">Um tipo de imóvel</option>
                                <option value="imovel">Um imóvel</option>
                            </select></div>
                        <div class="rz-f hidden" id="minz-campo-empreendimento"><label for="minz-empreendimento-id">Empreendimento${obrig}</label>
                            <select id="minz-empreendimento-id"></select></div>
                        <div class="rz-f hidden" id="minz-campo-tipo"><label for="minz-tipo-imovel-id">Tipo de imóvel${obrig}</label>
                            <select id="minz-tipo-imovel-id"></select></div>
                        <div class="rz-f hidden" id="minz-campo-imovel"><label for="minz-imovel-resumo">Imóvel${obrig}</label>
                            <input type="hidden" id="minz-imovel-id" value="">
                            <button type="button" id="minz-imovel-resumo" class="rz-f-btn" onclick="abrirSeletorImovel(function(id, resumo) { document.getElementById('minz-imovel-id').value = id || ''; document.getElementById('minz-imovel-resumo').textContent = resumo || 'Escolha o imóvel'; })">Escolha o imóvel</button></div>
                        <div class="rz-f"><label for="minz-arquivo-input">Contrato assinado (.docx ou .pdf)${obrig}</label>
                            <input type="file" id="minz-arquivo-input" accept=".docx,.pdf"></div>
                    </div>
                    <div id="minz-passo-2" class="rz-passo hidden">
                        <p class="rz-desc" style="margin-bottom:12px">Confira cada trecho que a Raiz IA marcou. Troque o campo se ela errou, ou escolha "(não substituir)" para o trecho ficar como está.</p>
                        <div id="minz-lista-revisao"></div>
                    </div>
                </div>
                <div class="rz-sh-f" id="minz-rodape-1">
                    <button type="button" class="rz-btn rz-btn-2" onclick="fecharWizardMinutizacao()">Cancelar</button>
                    <button type="button" class="rz-btn rz-btn-ia" onclick="processarArquivoMinutizacao()"><svg data-lucide="sparkles"></svg>Ler com a Raiz IA</button>
                </div>
                <div class="rz-sh-f hidden" id="minz-rodape-2">
                    <button type="button" class="rz-btn rz-btn-2" onclick="voltarPasso1Minutizacao()">Voltar</button>
                    <button type="button" class="rz-btn rz-btn-1" onclick="confirmarMinutizacao()">Gerar minuta</button>
                </div>`, { aoFechar: () => { __minzEstado = null; } });
            popularFiltroSelectComId('minz-empreendimento-id', empreendimentosCadastrados);
            popularFiltroSelectComId('minz-tipo-imovel-id', tiposImovelCadastrados);
            atualizarCampoEscopoMinz();
            if (typeof rzIcones === 'function') rzIcones();
            setTimeout(() => document.getElementById('minz-nome')?.focus(), 60);
        }

        export function fecharWizardMinutizacao() {
            __minzEstado = null;
            if (typeof fecharSheet === 'function') fecharSheet(true);
        }

        // Mostra o passo pedido no Sheet aberto (corpo, rodapé e subtítulo do cabeçalho).
        function mostrarPassoMinz(n) {
            document.getElementById('minz-passo-1')?.classList.toggle('hidden', n !== 1);
            document.getElementById('minz-passo-2')?.classList.toggle('hidden', n !== 2);
            document.getElementById('minz-rodape-1')?.classList.toggle('hidden', n !== 1);
            document.getElementById('minz-rodape-2')?.classList.toggle('hidden', n !== 2);
            const sub = document.querySelector('#rz-sheet .rz-sh-h .rz-sub');
            if (sub) sub.textContent = n === 1 ? 'Passo 1 de 2 · contrato e escopo' : 'Passo 2 de 2 · confira os campos';
            const corpo = document.querySelector('#rz-sheet .rz-sh-b');
            if (corpo) corpo.scrollTop = 0;
        }

        export function atualizarCampoEscopoMinz() {
            const escopo = document.getElementById('minz-escopo').value;
            document.getElementById('minz-campo-empreendimento').classList.toggle('hidden', escopo !== 'empreendimento');
            document.getElementById('minz-campo-tipo').classList.toggle('hidden', escopo !== 'tipo_imovel');
            document.getElementById('minz-campo-imovel').classList.toggle('hidden', escopo !== 'imovel');
        }

        export async function processarArquivoMinutizacao() {
            const nome = document.getElementById('minz-nome').value.trim();
            const escopo = document.getElementById('minz-escopo').value;
            if (!nome) { rzAvisar('Dê um nome para a minuta.', 'danger'); return; }
            if (escopo === 'empreendimento' && !document.getElementById('minz-empreendimento-id').value) { rzAvisar('Escolha o empreendimento.', 'danger'); return; }
            if (escopo === 'tipo_imovel' && !document.getElementById('minz-tipo-imovel-id').value) { rzAvisar('Escolha o tipo de imóvel.', 'danger'); return; }
            if (escopo === 'imovel' && !document.getElementById('minz-imovel-id').value) { rzAvisar('Escolha o imóvel.', 'danger'); return; }

            const arquivoInput = document.getElementById('minz-arquivo-input');
            const arquivo = arquivoInput.files && arquivoInput.files[0];
            if (!arquivo) { rzAvisar('Envie o contrato real (.docx ou .pdf).', 'danger'); return; }
            const nomeMinusculo = arquivo.name.toLowerCase();
            const ehDocx = nomeMinusculo.endsWith('.docx');
            const ehPdf = nomeMinusculo.endsWith('.pdf');
            if (!ehDocx && !ehPdf) { rzAvisar('Só .docx ou .pdf.', 'danger'); return; }

            mostrarCarregamentoGlobal('Lendo o contrato...');
            try {
                const arrayBuffer = await arquivo.arrayBuffer();
                const textoOriginal = ehDocx
                    ? await extrairTextoDocxMinutizacao(arrayBuffer)
                    : await extrairTextoPdfMinutizacao(arrayBuffer);

                mostrarCarregamentoGlobal('Identificando os dados variáveis com IA...');
                const sugestoesBrutas = await chamarDeteccaoPlaceholdersIA(textoOriginal);

                __minzEstado = {
                    nome, escopo,
                    empreendimentoId: escopo === 'empreendimento' ? document.getElementById('minz-empreendimento-id').value : null,
                    tipoImovelId: escopo === 'tipo_imovel' ? document.getElementById('minz-tipo-imovel-id').value : null,
                    imovelId: escopo === 'imovel' ? document.getElementById('minz-imovel-id').value : null,
                    textoOriginal,
                    sugestoes: sugestoesBrutas.map(function(s, i) {
                        return {
                            id: 'sug_' + i,
                            trechoOriginal: s.trecho_original,
                            confianca: s.confianca,
                            // Já nasce com o valor sugerido pela IA escolhido —
                            // a pessoa só precisa mexer no que quiser trocar
                            // ou desmarcar, não escolher tudo do zero.
                            placeholderEscolhido: s.placeholder,
                        };
                    }),
                };

                esconderCarregamentoGlobal();

                if (__minzEstado.sugestoes.length === 0) {
                    mostrarToast('A Raiz IA não achou nenhum trecho que mude de contrato para contrato. Confira se o arquivo é o certo, ou cadastre o modelo .docx no "+".', 'aviso');
                }

                renderRevisaoMinutizacao();
                mostrarPassoMinz(2);
            } catch (err) {
                esconderCarregamentoGlobal();
                rzAvisar('Não consegui ler esse arquivo: ' + (err.message || String(err)), 'danger');
            }
        }

        export function renderRevisaoMinutizacao() {
            const container = document.getElementById('minz-lista-revisao');
            if (!container) return;
            if (!__minzEstado || __minzEstado.sugestoes.length === 0) {
                container.innerHTML = '<div class="rz-empty"><p>Nenhum trecho identificado.</p></div>';
                return;
            }
            const rotuloConfianca = { alta: 'alta', media: 'média', baixa: 'baixa' };
            container.innerHTML = __minzEstado.sugestoes.map(function(s) {
                // options montadas por linha para marcar o "selected" desta sugestão
                const opcoes = ['<option value="">(não substituir)</option>']
                    .concat(PLACEHOLDERS_MINUTA_OFICIAIS.map(function(p) {
                        return `<option value="${p}" ${p === s.placeholderEscolhido ? 'selected' : ''}>{{${p}}}</option>`;
                    })).join('');
                return `
                    <div class="rz-f">
                        <label for="minz-sel-${s.id}">"${escaparAtributoHtmlMinz(s.trechoOriginal)}"</label>
                        <select id="minz-sel-${s.id}" data-minz-id="${s.id}" onchange="atualizarPlaceholderEscolhidoMinz('${s.id}', this.value)">${opcoes}</select>
                        <span class="rz-hint">Certeza da Raiz IA: ${rotuloConfianca[s.confianca] || escaparAtributoHtmlMinz(s.confianca)}</span>
                    </div>`;
            }).join('');
        }

        export function atualizarPlaceholderEscolhidoMinz(id, valor) {
            if (!__minzEstado) return;
            const s = __minzEstado.sugestoes.find(x => x.id === id);
            if (s) s.placeholderEscolhido = valor; // '' = não substituir
        }

        export function voltarPasso1Minutizacao() { mostrarPassoMinz(1); }

        // Aplica as substituições CONFIRMADAS (placeholderEscolhido não
        // vazio) no texto extraído — todas as ocorrências idênticas desse
        // trecho, não só a primeira (um nome de locatário provavelmente
        // aparece mais de uma vez no contrato inteiro).
        export function aplicarSubstituicoesTextoMinutizacao(texto, sugestoesConfirmadas) {
            let resultado = texto;
            sugestoesConfirmadas.forEach(function(s) {
                if (!s.trechoOriginal || !s.placeholderEscolhido) return;
                resultado = resultado.split(s.trechoOriginal).join(`{{${s.placeholderEscolhido}}}`);
            });
            return resultado;
        }

        export async function confirmarMinutizacao() {
            if (!__minzEstado) return;

            const confirmadas = __minzEstado.sugestoes.filter(s => s.placeholderEscolhido);
            if (confirmadas.length === 0) {
                if (!await rzPerguntar({ titulo: 'Nenhum campo confirmado', impacto: 'A minuta fica com o texto do contrato real, sem nenhum campo variável, e não serve para reaproveitar. Continuar mesmo assim?', rotuloConfirmar: 'Continuar assim', rotuloCancelar: 'Voltar e confirmar campos' })) return;
            }

            mostrarCarregamentoGlobal('Gerando o modelo da minuta...');
            try {
                const textoComPlaceholders = aplicarSubstituicoesTextoMinutizacao(__minzEstado.textoOriginal, confirmadas);
                const linhas = [__minzEstado.nome].concat(textoComPlaceholders.split('\n'));
                const blob = await gerarDocxDoTextoMinutizacao(__minzEstado.nome, linhas);

                const nomeDescritivo = `minuta_${slugArquivo(__minzEstado.nome)}_v1_${dataYYYYMMDD()}.docx`;
                const nomeArquivo = `${CLIENTE_ID_SUPABASE}/minutas-modelo/${nomeDescritivo}`;
                const { error: errUpload } = await dbAuth.storage.from('contratos-documentos').upload(nomeArquivo, blob, { upsert: true });
                if (errUpload) throw errUpload;
                const { data: signedData, error: errSigned } = await dbAuth.storage.from('contratos-documentos').createSignedUrl(nomeArquivo, 315360000);
                if (errSigned) throw errSigned;

                const dados = {
                    id: 'minuta_' + Date.now() + Math.random().toString(36).substr(2, 4),
                    nome: __minzEstado.nome,
                    escopo: __minzEstado.escopo,
                    empreendimentoId: __minzEstado.empreendimentoId,
                    tipoImovelId: __minzEstado.tipoImovelId,
                    imovelId: __minzEstado.imovelId,
                    arquivoUrl: signedData.signedUrl,
                    arquivoNome: nomeDescritivo,
                    arquivoVersao: 1,
                    ativa: true,
                };
                minutasContrato.push(dados);

                registrarLog('minutas.minutizar_ia', { // v1.131 — código do catálogo
                    minutaNome: dados.nome, escopo: dados.escopo,
                    quantidadeSugestoes: __minzEstado.sugestoes.length, quantidadeConfirmadas: confirmadas.length,
                });
                emitirEscrita('minuta', { id: dados.id, acao: 'gerar-de-contrato-real' }); // v1.1.0 — Fase 1 do wrapper de escrita

                __minzEstado = null;
                if (typeof fecharSheet === 'function') fecharSheet(true);

                saveAll(true, 'Minuta gerada a partir do contrato real!', ['minutasContrato']);
            } catch (err) {
                esconderCarregamentoGlobal();
                rzAvisar('Não consegui gerar o modelo: ' + (err.message || String(err)), 'danger');
            }
        }

        // v1.122.0 (fatia 7b-ii parte 2) — o formulário de minuta virou
        // sheet da gramática. TODOS os ids dos campos foram preservados:
        // salvarMinuta() (upload .docx pro storage + gravação) continua
        // lendo por getElementById sem UMA linha alterada. editar = mesmo
        // sheet pré-preenchido. abrirFormularioMinuta/alternarFormulario
        // Minuta viraram aliases (chamadores antigos espalhados).
        export function abrirFormMinutaSheet(minutaId) {
            if (typeof abrirSheetForm !== 'function') return;
            const m = minutaId ? minutasContrato.find(x => x.id === minutaId) : null;
            abrirSheetForm({
                titulo: m ? 'Editar minuta' : 'Cadastrar minuta',
                sub: m ? m.nome : 'Modelo .docx com placeholders',
                rotuloSalvar: 'Salvar',
                corpo: `
                    <input type="hidden" id="minuta-id">
                    <div class="rz-f"><label for="minuta-nome">Nome da minuta <i>*</i></label>
                        <input type="text" id="minuta-nome" placeholder="Ex.: Locação comercial padrão"></div>
                    <div class="rz-f"><label for="minuta-escopo">Vale para <i>*</i></label>
                        <select id="minuta-escopo" onchange="atualizarCampoEscopoMinuta()">
                            <option value="geral">A empresa toda</option>
                            <option value="empreendimento">Um empreendimento</option>
                            <option value="tipo_imovel">Um tipo de imóvel</option>
                            <option value="imovel">Um imóvel</option>
                        </select></div>
                    <div id="minuta-campo-empreendimento" class="rz-f hidden"><label for="minuta-empreendimento-id">Empreendimento <i>*</i></label>
                        <select id="minuta-empreendimento-id"></select></div>
                    <div id="minuta-campo-tipo" class="rz-f hidden"><label for="minuta-tipo-imovel-id">Tipo de imóvel <i>*</i></label>
                        <select id="minuta-tipo-imovel-id"></select></div>
                    <div id="minuta-campo-imovel" class="rz-f hidden"><label for="minuta-imovel-resumo">Imóvel <i>*</i></label>
                        <input type="hidden" id="minuta-imovel-id" value="">
                        <button type="button" id="minuta-imovel-resumo" class="rz-f-btn" onclick="abrirSeletorImovel(function(id, resumo) { document.getElementById('minuta-imovel-id').value = id; document.getElementById('minuta-imovel-resumo').textContent = resumo; })">Escolha o imóvel</button></div>
                    <div class="rz-f"><label for="minuta-arquivo-input">Arquivo do modelo (.docx) <i>*</i></label>
                        <div id="minuta-arquivo-atual-info" class="rz-hint hidden">Arquivo atual: <span id="minuta-arquivo-atual-nome"></span> · enviar outro substitui</div>
                        <p id="minuta-arquivo-novo-nome" class="rz-hint"></p>
                        <input type="file" id="minuta-arquivo-input" accept=".docx,.pdf">
                        <button type="button" class="rz-btn rz-btn-3" onclick="abrirAjudaPlaceholdersMinuta()"><svg data-lucide="braces"></svg>Ver os campos que a minuta aceita</button></div>`,
                aoSalvar: async () => { await salvarMinuta({ preventDefault: () => {} }); return false; },
            });
            popularSelectsEscopoMinuta();
            if (m) {
                document.getElementById('minuta-id').value = m.id;
                document.getElementById('minuta-nome').value = m.nome;
                document.getElementById('minuta-escopo').value = m.escopo || 'geral';
                document.getElementById('minuta-empreendimento-id').value = m.empreendimentoId || '';
                document.getElementById('minuta-tipo-imovel-id').value = m.tipoImovelId || '';
                document.getElementById('minuta-imovel-id').value = m.imovelId || '';
                const imo = m.imovelId ? imoveis.find(i => i.id === m.imovelId) : null;
                if (imo) document.getElementById('minuta-imovel-resumo').textContent = `${imo.empreendimento} - ${imo.enderecoRua}, ${imo.enderecoNum}`;
                if (m.arquivoUrl) {
                    document.getElementById('minuta-arquivo-atual-nome').innerText = m.arquivoNome || 'arquivo-modelo.docx';
                    document.getElementById('minuta-arquivo-atual-info').classList.remove('hidden');
                }
            }
            atualizarCampoEscopoMinuta();
            rzIcones();
        }

        export function abrirFormularioMinuta() { abrirFormMinutaSheet(); }

        export function alternarFormularioMinuta() { abrirFormMinutaSheet(); }

        // v1.122.0 — chamada no fim de salvarMinuta(); os campos agora
        // vivem no sheet (morrem com ele), então: null-safe + fecharSheet.
        export function cancelarEdicaoMinuta() {
            const idEl = document.getElementById('minuta-id');
            if (idEl) idEl.value = '';
            if (typeof fecharSheet === 'function') fecharSheet();
        }

        export function popularSelectsEscopoMinuta() {
            popularFiltroSelectComId('minuta-empreendimento-id', empreendimentosCadastrados);
            popularFiltroSelectComId('minuta-tipo-imovel-id', tiposImovelCadastrados);
        }

        // v1.42.0 — variante de popularFiltroSelect que preserva o id real
        // como value (não o nome) — necessário aqui porque a minuta vincula
        // pelo id do empreendimento/tipo, não pelo nome.
        export function popularFiltroSelectComId(selectId, itens) {
            const select = document.getElementById(selectId);
            if (!select) return;
            const valorAtual = select.value || '';
            select.innerHTML = '<option value="">-- Selecione --</option>' +
                (itens || []).map(function(it) { return `<option value="${it.id}">${it.nome}</option>`; }).join('');
            select.value = valorAtual;
        }

        export function atualizarCampoEscopoMinuta() {
            const escopo = document.getElementById('minuta-escopo').value;
            document.getElementById('minuta-campo-empreendimento').classList.toggle('hidden', escopo !== 'empreendimento');
            document.getElementById('minuta-campo-tipo').classList.toggle('hidden', escopo !== 'tipo_imovel');
            document.getElementById('minuta-campo-imovel').classList.toggle('hidden', escopo !== 'imovel');
        }

        export function editarMinuta(id) { abrirFormMinutaSheet(id); }

        export async function salvarMinuta(e) {
            e.preventDefault();

            const escopo = document.getElementById('minuta-escopo').value;

            if (escopo === 'empreendimento' && !document.getElementById('minuta-empreendimento-id').value) {
                rzAvisar('Escolha o empreendimento desta minuta.', 'danger');
                return;
            }
            if (escopo === 'tipo_imovel' && !document.getElementById('minuta-tipo-imovel-id').value) {
                rzAvisar('Escolha o tipo de imóvel desta minuta.', 'danger');
                return;
            }
            if (escopo === 'imovel' && !document.getElementById('minuta-imovel-id').value) {
                rzAvisar('Escolha o imóvel desta minuta.', 'danger');
                return;
            }

            const id = document.getElementById('minuta-id').value;
            const arquivoInput = document.getElementById('minuta-arquivo-input');
            const arquivoNovo = arquivoInput.files && arquivoInput.files[0];

            if (!id && !arquivoNovo) {
                rzAvisar('Envie o arquivo .docx do modelo.', 'danger');
                return;
            }
            if (arquivoNovo && !arquivoNovo.name.toLowerCase().endsWith('.docx')) {
                const ehPdf = arquivoNovo.name.toLowerCase().endsWith('.pdf');
                // CORRIGIDO (v1.68.0, pedido explícito — "não estou
                // conseguindo anexar PDF"): antes o <input accept=".docx">
                // já impedia PDF de aparecer como selecionável no seletor
                // de arquivo do celular, então a pessoa nem chegava a ver
                // mensagem nenhuma — parecia simplesmente "não funciona".
                // Agora o seletor aceita PDF também (dá pra escolher), mas
                // a mensagem deixa claro que o PDF ainda não é processado
                // automaticamente aqui — é a funcionalidade de "gerar
                // minuta a partir de um contrato real" (Parte 3 da
                // especificação combinada), que ainda não foi construída,
                // só especificada. Isto NÃO é o mesmo cadastro de sempre
                // com um limite técnico bobo — é uma função futura
                // diferente que ainda não existe.
                rzResumo({ titulo: ehPdf ? 'PDF ainda não é convertido aqui' : 'Formato não aceito', linhas: [ehPdf
                    ? 'Gerar minuta a partir de um contrato real em PDF ainda está em desenvolvimento. Por enquanto, envie o modelo em .docx, já com os {{placeholders}}.'
                    : 'Só arquivos .docx (Word) ou .pdf são aceitos aqui. Se for outro formato, abra e use "Salvar como" .docx antes.'] });
                return;
            }

            const minutaExistente = id ? minutasContrato.find(m => m.id === id) : null;

            const dados = {
                id: id || 'minuta_' + Date.now() + Math.random().toString(36).substr(2, 4),
                nome: document.getElementById('minuta-nome').value.trim(),
                escopo: escopo,
                empreendimentoId: escopo === 'empreendimento' ? document.getElementById('minuta-empreendimento-id').value : null,
                tipoImovelId: escopo === 'tipo_imovel' ? document.getElementById('minuta-tipo-imovel-id').value : null,
                imovelId: escopo === 'imovel' ? document.getElementById('minuta-imovel-id').value : null,
                arquivoUrl: minutaExistente ? minutaExistente.arquivoUrl : null,
                arquivoNome: minutaExistente ? minutaExistente.arquivoNome : null,
                arquivoVersao: minutaExistente ? (minutaExistente.arquivoVersao || 1) : 1,
                ativa: true
            };

            if (arquivoNovo) {
                mostrarCarregamentoGlobal("Enviando arquivo do modelo...");
                try {
                    // CORRIGIDO (v1.67.0, pedido explícito — nome de arquivo
                    // inteligível): antes o nome salvo (arquivo_nome) e o
                    // path no Storage vinham do File.name bruto do upload —
                    // sem sanitizar sufixo de download duplicado do
                    // navegador (" (1)") nem se proteger de alguém reenviar
                    // um arquivo que já tinha sido baixado daqui antes (o
                    // nome anterior, com seu próprio timestamp, virava parte
                    // do nome novo). Agora o nome vem SEMPRE do campo "Nome
                    // da minuta" (nunca do File.name), com versão que sobe a
                    // cada reenvio em vez de empilhar timestamp:
                    // minuta_{slug}_v{n}_{data}.docx.
                    dados.arquivoVersao = (dados.arquivoVersao || 1) + (minutaExistente ? 1 : 0);
                    const nomeDescritivo = `minuta_${slugArquivo(dados.nome)}_v${dados.arquivoVersao}_${dataYYYYMMDD()}.docx`;
                    const nomeArquivo = `${CLIENTE_ID_SUPABASE}/minutas-modelo/${nomeDescritivo}`;
                    const { error: errUpload } = await dbAuth.storage.from('contratos-documentos').upload(nomeArquivo, arquivoNovo, { upsert: true });
                    if (errUpload) throw errUpload;
                    const { data: signedData, error: errSigned } = await dbAuth.storage.from('contratos-documentos').createSignedUrl(nomeArquivo, 315360000);
                    if (errSigned) throw errSigned;
                    dados.arquivoUrl = signedData.signedUrl;
                    dados.arquivoNome = nomeDescritivo;
                } catch (err) {
                    esconderCarregamentoGlobal();
                    rzAvisar('Não consegui enviar o arquivo: ' + (err.message || String(err)), 'danger');
                    return;
                }
                esconderCarregamentoGlobal();
            }

            if (id) {
                const idx = minutasContrato.findIndex(m => m.id === id);
                if (idx !== -1) minutasContrato[idx] = dados;
            } else {
                minutasContrato.push(dados);
            }

            cancelarEdicaoMinuta();

            registrarLog(id ? 'minutas.editar' : 'minutas.criar', { minutaNome: dados.nome, escopo: dados.escopo });
            emitirEscrita('minuta', { id: dados.id, acao: 'editar' }); // v1.1.0 — Fase 1 do wrapper de escrita (cria OU edita, mesmo popup)

            saveAll(true, "Minuta salva com sucesso!", ['minutasContrato']);
        }

        // CORRIGIDO (v1.67.0, achado em auditoria — vazamento de Storage):
        // excluir uma minuta só apagava a linha da tabela, nunca o arquivo
        // no bucket — todo .docx de modelo excluído ficava órfão. A URL
        // assinada guardada já contém o caminho real dentro do bucket
        // (.../object/sign/contratos-documentos/<path>?token=...), então dá
        // pra extrair sem precisar de uma coluna nova só pra isso. Falha ao
        // remover do Storage não impede a exclusão do cadastro (a linha sai
        // de qualquer forma) — só fica registrada no console pra investigar
        // depois, não trava a ação do usuário.
        export function extrairStoragePathDeUrlAssinada(url, bucket) {
            if (!url) return null;
            const marcador = `/object/sign/${bucket}/`;
            const idx = url.indexOf(marcador);
            if (idx === -1) return null;
            const resto = url.slice(idx + marcador.length);
            const semQuery = resto.split('?')[0];
            try { return decodeURIComponent(semQuery); } catch (e) { return semQuery; }
        }

        export async function excluirMinuta(id) {
            if (!await rzPerguntar({ titulo: 'Excluir minuta?', impacto: 'O modelo e o arquivo dele são apagados. Não dá para desfazer.', destrutivo: true, rotuloConfirmar: 'Excluir minuta' })) return;

            const minuta = minutasContrato.find(m => m.id === id);
            const storagePath = minuta ? extrairStoragePathDeUrlAssinada(minuta.arquivoUrl, 'contratos-documentos') : null;
            if (storagePath) {
                dbAuth.storage.from('contratos-documentos').remove([storagePath]).then(({ error }) => {
                    if (error) console.error('excluirMinuta: falha ao remover arquivo do Storage (linha já será excluída mesmo assim):', error.message);
                });
            }

            dbAuth.from('minutas_contrato').delete().eq('id', id).then(({ error }) => {
                if (error) logScreen('Erro ao excluir minuta no Supabase: ' + error.message, true);
            });

            minutasContrato = minutasContrato.filter(m => m.id !== id);

            registrarLog('minutas.excluir', { minutaId: id });
            emitirEscrita('minuta', { id, acao: 'excluir' }); // v1.1.0 — Fase 1 do wrapper de escrita

            saveAll(true, "Minuta excluída.", ['minutasContrato']);
        }

        // v1.122.0 — lista na gramática: .rz-row com ⋮ (Ver arquivo /
        // Editar / Excluir). Regras de escopo/nomes idênticas às antigas.
        export function renderMinutas() {
            const container = document.getElementById('lista-minutas');
            if (!container) return;
            if (!minutasContrato.length) {
                if (typeof rzVazio === 'function') {
                    container.className = '';
                    container.innerHTML = rzVazio({
                        dominio: 'contratos', id: 'minutas-lista',
                        titulo: 'Seu primeiro modelo de contrato',
                        beneficio: 'Com um modelo, a minuta sai preenchida com os dados do imóvel e do locatário — inclusive quando o interessado preenche o link de contratação. Envie um contrato já assinado e a Raiz IA monta o modelo.',
                        acaoIA: { rotulo: 'Gerar de um contrato real', codigo: 'minutas.minutizar_ia', aoTocar: () => abrirWizardMinutizacao() },
                        acaoManual: { rotulo: 'Enviar modelo .docx', codigo: 'minutas.criar', aoTocar: () => abrirFormMinutaSheet() },
                    });
                } else {
                    container.innerHTML = '<div class="rz-empty"><div class="rz-ic"><svg data-lucide="file-signature"></svg></div><p>Nenhuma minuta ainda.</p></div>';
                }
                rzIcones();
                return;
            }
            container.className = 'rz-card rz-list';
            const rotuloEscopo = { geral: 'Geral', empreendimento: 'Empreendimento', tipo_imovel: 'Tipo de imóvel', imovel: 'Imóvel' };
            container.innerHTML = minutasContrato.map(m => {
                let detalheEscopo = '';
                if (m.escopo === 'empreendimento') {
                    const e = empreendimentosCadastrados.find(x => x.id === m.empreendimentoId);
                    detalheEscopo = e ? e.nome : '-';
                } else if (m.escopo === 'tipo_imovel') {
                    const t = tiposImovelCadastrados.find(x => x.id === m.tipoImovelId);
                    detalheEscopo = t ? t.nome : '-';
                } else if (m.escopo === 'imovel') {
                    const imo = imoveis.find(x => x.id === m.imovelId);
                    detalheEscopo = imo ? `${imo.enderecoRua}, ${imo.enderecoNum}` : '-';
                }
                return `
                <div class="rz-row">
                    <div class="rz-ic"><svg data-lucide="file-signature"></svg></div>
                    <div class="rz-tx"><b>${rzEsc(m.nome)}</b><span>${rotuloEscopo[m.escopo] || m.escopo}${detalheEscopo ? ' · ' + rzEsc(detalheEscopo) : ''}</span></div>
                    <button type="button" onclick="abrirAcoesMinuta('${m.id}')" class="rz-more" aria-label="Mais ações"><svg data-lucide="ellipsis-vertical"></svg></button>
                </div>`;
            }).join('');
            rzIcones();
        }

        export function abrirAcoesMinuta(id) {
            const m = minutasContrato.find(x => x.id === id);
            if (!m || typeof abrirSheetAcoes !== 'function') return;
            const acoes = [];
            if (m.arquivoUrl) acoes.push({ icone: 'eye', titulo: 'Ver arquivo do modelo', sub: m.arquivoNome || '', aoTocar: () => window.open(m.arquivoUrl, '_blank') });
            acoes.push({ icone: 'pencil', titulo: 'Editar', codigo: 'minutas.editar', aoTocar: () => abrirFormMinutaSheet(m.id) });
            acoes.push({ icone: 'trash-2', titulo: 'Excluir', codigo: 'minutas.excluir', tipo: 'bad', aoTocar: () => excluirMinuta(m.id) });
            abrirSheetAcoes({ titulo: m.nome, sub: 'Minuta de contrato', acoes });
        }

        // v1.42.0 — janela de ajuda com a lista de placeholders disponíveis
        // (mesmo texto documentado na migration SQL, resumido para a tela).
        // Abre por cima do formulário da minuta (nível 2) ou sozinha; tocar no campo copia.
        export function abrirAjudaPlaceholdersMinuta() {
            const grupos = [
                { titulo: 'Empresa (locador)', itens: ['locador_nome', 'locador_cnpj', 'locador_responsavel', 'locador_endereco', 'locador_cidade'] },
                { titulo: 'Imóvel', itens: ['imovel_endereco', 'imovel_empreendimento', 'imovel_tipo', 'imovel_descricao'] },
                { titulo: 'Contrato', itens: ['aluguel_valor', 'aluguel_vencimento_dia', 'contrato_inicio', 'contrato_fim', 'contrato_prazo_meses', 'indice_reajuste'] },
                { titulo: 'Locatário (preenchido pelo interessado)', itens: ['locatario_nome', 'locatario_documento', 'locatario_doc_tipo', 'locatario_whatsapp', 'locatario_email', 'locatario_endereco_atual', 'locatario_profissao', 'locatario_estado_civil'] },
                { titulo: 'Data', itens: ['data_assinatura'] }
            ];
            if (typeof abrirSheet !== 'function') return;
            abrirSheet(rzSheetCabecalho('Campos da minuta', 'Toque para copiar') + `
                <div class="rz-sh-b">
                    <p class="rz-desc">Cole no texto do modelo, entre chaves duplas, nos pontos que mudam de um contrato para outro.</p>
                    ${grupos.map(g => `
                        <div class="rz-group">${g.titulo}</div>
                        <div class="rz-ph-lista">${g.itens.map(p => `<button type="button" class="rz-ph" onclick="rzCopiar('{{${p}}}', 'Copiado: {{${p}}}')">{{${p}}}</button>`).join('')}</div>
                    `).join('')}
                </div>`, { empilhar: true });
        }

        // v1.67.0 — helper de nome de arquivo intuitivo, reaproveitado por
        // salvarMinuta() e gerarMinutaNoCofre() (mesma lógica de sanitização
        // que já existia solta/duplicada em 3 outros pontos do arquivo —
        // aqui centralizada só pra uso novo, sem tocar nos 3 já existentes).
        export function slugArquivo(texto) {
            return (texto || '')
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')
                .slice(0, 60) || 'sem-nome';
        }

        export function dataYYYYMMDD(d) {
            const ref = d || new Date();
            return `${ref.getFullYear()}${String(ref.getMonth() + 1).padStart(2, '0')}${String(ref.getDate()).padStart(2, '0')}`;
        }

        export function encontrarMinutaParaImovel(imovelId) {
            const imo = imoveis.find(i => i.id === imovelId);
            if (!imo) return null;

            return minutasContrato.find(m => m.ativa !== false && m.escopo === 'imovel' && m.imovelId === imovelId)
                || minutasContrato.find(m => m.ativa !== false && m.escopo === 'tipo_imovel' && m.tipoImovelId === imo.tipoId)
                || minutasContrato.find(m => m.ativa !== false && m.escopo === 'empreendimento' && m.empreendimentoId === imo.empreendimentoId)
                || minutasContrato.find(m => m.ativa !== false && m.escopo === 'geral')
                || null;
        }

        // NOVO (30/08/2026) — pedido explícito do Nicola: "pode ter 2 ou
        // mais tipos de minuta aplicáveis a um mesmo imóvel... o sistema
        // deve permitir a escolha de qual minuta padrão usar". Diferente
        // de encontrarMinutaParaImovel() (resolve UMA só, a mais
        // específica, pro atalho rápido "Gerar Minuta"), esta devolve
        // TODAS as ativas que se aplicam, em qualquer nível da cascata —
        // usada só pelo picker de "Conferir minuta padrão".
        export function listarMinutasAplicaveis(imovelId) {
            const imo = imoveis.find(i => i.id === imovelId);
            if (!imo) return [];

            return minutasContrato.filter(m => {
                if (m.ativa === false) return false;
                if (m.escopo === 'imovel') return m.imovelId === imovelId;
                if (m.escopo === 'tipo_imovel') return m.tipoImovelId === imo.tipoId;
                if (m.escopo === 'empreendimento') return m.empreendimentoId === imo.empreendimentoId;
                if (m.escopo === 'geral') return true;
                return false;
            });
        }

        export function extensoData(dataStr) {
            if (!dataStr) return '';
            const meses = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
            const d = new Date(dataStr + 'T00:00:00');
            if (isNaN(d.getTime())) return dataStr;
            return `${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
        }

        export function mesesEntreDatas(inicio, fim) {
            if (!inicio || !fim) return '';
            const di = new Date(inicio + 'T00:00:00');
            const df = new Date(fim + 'T00:00:00');
            if (isNaN(di.getTime()) || isNaN(df.getTime())) return '';
            return Math.round((df - di) / (1000 * 60 * 60 * 24 * 30));
        }

        // v1.42.1 — monta o dicionário de placeholders a partir do contrato,
        // imóvel e empresa. Documentação completa de cada placeholder está
        // na migration SQL (migration_v2_minutas_contrato_e_processos_contratacao.sql).
        // ===================================================================
        // v1.46.0 — REGRA CANÔNICA DE PRONTIDÃO PARA MINUTA
        // Especificação 02_ESPECIFICACAO_PRONTIDAO_CONTRATO_MINUTA_v1.md.
        // "Assinando" é STATUS (fase do processo); isto aqui é PRONTIDÃO
        // (cadastro completo e válido pra virar documento). São coisas
        // diferentes — daqui pra frente, nenhum lugar do app decide se
        // mostra "Gerar Minuta" olhando só con.status.
        //
        // 4 camadas do documento:
        //  1) contrato completo pra assinatura — verificado aqui (síncrono,
        //     usa os MESMOS validadores que o formulário já usa: validarCPF/
        //     validarCNPJ/validarTelefoneBR/validarEmailFormato — nenhum
        //     validador novo foi inventado).
        //  2) dados relacionados válidos — verificado aqui (imóvel existe,
        //     empresa carregada).
        //  3) minuta aplicável e acessível — verificado aqui
        //     (encontrarMinutaParaImovel + arquivoUrl presente).
        //  4) placeholders do MODELO REAL preenchidos — só é possível
        //     conferir de verdade depois de abrir o .docx escolhido; isso
        //     acontece dentro de gerarMinutaContrato() (defesa final, ver
        //     abaixo), não aqui — repetir o download só pra pré-visualizar
        //     na ficha pesaria a UI sem necessidade real.
        // ===================================================================
        export function avaliarProntidaoContratoParaMinuta(con, imo) {

            const faltantes = [];
            const invalidos = [];

            if (!con.locatario) faltantes.push('Nome do locatário');

            if (!con.cpf) {
                faltantes.push('CPF/CNPJ do locatário');
            } else {
                const digitos = con.cpf.replace(/\D/g, '');
                const docOk = digitos.length === 11 ? validarCPF(digitos) : (digitos.length === 14 ? validarCNPJ(digitos) : false);
                if (!docOk) invalidos.push('CPF/CNPJ do locatário é inválido');
            }

            if (!con.inicio) faltantes.push('Data de início da vigência');
            if (!con.fim) faltantes.push('Data de fim da vigência');
            if (con.inicio && con.fim && new Date(con.fim + 'T00:00:00') <= new Date(con.inicio + 'T00:00:00')) {
                invalidos.push('Data de fim precisa ser depois do início');
            }

            if (!con.valor || con.valor <= 0) faltantes.push('Valor do aluguel (maior que zero)');

            if (!con.vencimentoDia || con.vencimentoDia < 1 || con.vencimentoDia > 31) faltantes.push('Dia de vencimento válido (1 a 31)');

            if (!con.reajuste) faltantes.push('Índice de reajuste');

            if (con.whatsapp) {
                const r = validarTelefoneBR(con.whatsapp);
                if (r.ok === false) invalidos.push('WhatsApp do locatário é inválido');
            }
            if (con.email) {
                const r = validarEmailFormato(con.email);
                if (r.ok === false) invalidos.push('E-mail do locatário é inválido');
            }

            // Camada 2 — relacionados
            if (!imo) faltantes.push('Imóvel vinculado válido');
            if (!CONFIG_CLIENTE || !CONFIG_CLIENTE.nomeEmpresa) faltantes.push('Dados da empresa (locador) carregados');

            // Camada 3 — minuta aplicável
            const minuta = imo ? encontrarMinutaParaImovel(imo.id) : null;
            const minutaAplicavel = !!(minuta && minuta.arquivoUrl);
            if (!minutaAplicavel) faltantes.push('Nenhuma minuta cadastrada se aplica a este imóvel (Configurações → Minutas)');

            const pronto = faltantes.length === 0 && invalidos.length === 0;

            return { pronto, faltantes, invalidos, minutaAplicavel };

        }

        // v1.42.1 — monta o dicionário de placeholders a partir do contrato,
        // imóvel e empresa. Documentação completa de cada placeholder está
        // na migration SQL (migration_v2_minutas_contrato_e_processos_contratacao.sql).
        // NOVO (30/08/2026) — 3º parâmetro `fiadores` (array, opcional):
        // placeholders fiador_1_*/fiador_2_*/etc. Fiador que não existe
        // fica com todas as chaves em '' — é assim que o mecanismo JÁ
        // EXISTENTE de checagem em preencherMinutaDocx() (placeholdersVazios
        // Detectados) descobre sozinho se a minuta escolhida precisa de
        // fiador e ele não foi cadastrado — nenhuma lógica de validação
        // nova foi criada aqui, só populado o dicionário.
        export function montarValoresPlaceholdersMinuta(con, imo, fiadores) {
            const enderecoEmpresa = [CONFIG_CLIENTE.endereco, CONFIG_CLIENTE.complemento, CONFIG_CLIENTE.bairro, CONFIG_CLIENTE.cidade, CONFIG_CLIENTE.uf].filter(Boolean).join(', ');
            const enderecoImovel = [imo?.enderecoRua, imo?.enderecoNum, imo?.enderecoComp, imo?.enderecoBairro, imo?.enderecoCidade].filter(Boolean).join(', ');

            const valores = {
                locador_nome: CONFIG_CLIENTE.nomeEmpresa || '',
                locador_cnpj: CONFIG_CLIENTE.cnpj || '',
                locador_responsavel: CONFIG_CLIENTE.nomeResponsavel || '',
                locador_endereco: enderecoEmpresa,
                locador_cidade: CONFIG_CLIENTE.cidade || '',
                imovel_endereco: enderecoImovel,
                imovel_empreendimento: imo?.empreendimento || '',
                imovel_tipo: imo?.tipo || '',
                imovel_descricao: imo?.descricao || '',
                aluguel_valor: con?.valor ? formatarMoedaBR(con.valor) : '',
                aluguel_vencimento_dia: con?.vencimentoDia || '',
                contrato_inicio: con?.inicio ? formatarDataBR(con.inicio) : '',
                contrato_fim: con?.fim ? formatarDataBR(con.fim) : '',
                contrato_prazo_meses: mesesEntreDatas(con?.inicio, con?.fim),
                indice_reajuste: con?.reajuste || '',
                locatario_nome: con?.locatario || '',
                locatario_documento: con?.cpf || '',
                locatario_doc_tipo: con?.docTipo || '',
                locatario_whatsapp: con?.whatsapp || '',
                locatario_email: con?.email || '',
                locatario_endereco_atual: con?.locatarioEnderecoAtual || '',
                locatario_profissao: con?.locatarioProfissao || '',
                locatario_estado_civil: con?.locatarioEstadoCivil || '',
                data_assinatura: extensoData(new Date().toISOString().slice(0, 10))
            };

            // Até 4 fiadores previstos nos placeholders (fiador_1_ a
            // fiador_4_) — na prática o normal é 0/1/2, mas não trava a
            // minuta se algum dia precisar de mais; fiador inexistente
            // simplesmente fica com string vazia em todas as chaves.
            for (let i = 1; i <= 4; i++) {
                const f = (fiadores || [])[i - 1] || null;
                const p = 'fiador_' + i + '_';
                valores[p + 'nome'] = f?.nome || '';
                valores[p + 'cpf'] = f?.cpf || '';
                valores[p + 'doc_tipo'] = f?.doc_tipo || '';
                valores[p + 'rg'] = f?.rg || '';
                valores[p + 'rg_orgao_expedidor'] = f?.rg_orgao_expedidor || '';
                valores[p + 'nacionalidade'] = f?.nacionalidade || '';
                valores[p + 'data_nascimento'] = f?.data_nascimento ? formatarDataBR(f.data_nascimento) : '';
                valores[p + 'profissao'] = f?.profissao || '';
                valores[p + 'estado_civil'] = f?.estado_civil || '';
                valores[p + 'regime_bens'] = f?.regime_bens || '';
                valores[p + 'conjuge_nome'] = f?.conjuge_nome || '';
                valores[p + 'conjuge_cpf'] = f?.conjuge_cpf || '';
                valores[p + 'conjuge_rg'] = f?.conjuge_rg || '';
                valores[p + 'conjuge_profissao'] = f?.conjuge_profissao || '';
                valores[p + 'whatsapp'] = f?.whatsapp || '';
                valores[p + 'email'] = f?.email || '';
                valores[p + 'endereco_atual'] = f?.endereco_atual || '';
                valores[p + 'imovel_matricula'] = f?.imovel_matricula || '';
                valores[p + 'imovel_cartorio_registro'] = f?.imovel_cartorio_registro || '';
                valores[p + 'imovel_endereco'] = f?.imovel_endereco || '';
            }
            // fiadores_qtd — útil pra um trecho condicional simples no
            // modelo tipo "Este contrato tem {{fiadores_qtd}} fiador(es)."
            valores.fiadores_qtd = (fiadores || []).length;

            return valores;
        }

        // v1.42.1 — escapa caracteres especiais de XML (o texto vai direto
        // dentro de um <w:t> do document.xml do Word) — sem isso, um nome
        // com "&" ou "<" quebraria o arquivo .docx gerado.
        export function escaparXml(texto) {
            return String(texto || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&apos;');
        }

        // v1.42.1 — CORAÇÃO da geração de minuta: abre o .docx (é um .zip
        // com XML dentro) via JSZip, funde runs de texto quebrados pelo
        // Word (spell-check/autocorreção costuma partir um "{{placeholder}}"
        // em vários <w:r> — sem isso, a substituição simples falharia em
        // arquivos editados manualmente no Word), substitui cada
        // {{placeholder}} pelo valor real, e gera um novo .docx (Blob) —
        // pronto pra baixar/enviar, sem precisar de nenhum servidor.
        export async function preencherMinutaDocx(arrayBufferDocx, valores) {
            const zip = await JSZip.loadAsync(arrayBufferDocx);

            const caminhoDocumento = 'word/document.xml';
            const arquivoXml = zip.file(caminhoDocumento);
            if (!arquivoXml) throw new Error('Arquivo .docx inválido (não encontrei word/document.xml dentro dele).');

            let xml = await arquivoXml.async('string');

            // Funde texto quebrado entre runs: uma sequência "...</w:t></w:r><w:r...><w:t...>..."
            // sem NADA de conteúdo relevante entre elas além de metadados de
            // formatação é comum quando o Word divide o texto ao redor de
            // marcas de correção ortográfica. Junta o CONTEÚDO de <w:t> de
            // runs adjacentes antes de fazer a substituição, preservando a
            // formatação do primeiro run da sequência (simplificação segura:
            // perde formatação mista dentro de um mesmo placeholder, que é
            // um caso raríssimo em campos curtos como estes).
            xml = xml.replace(/(<w:t[^>]*>)([^<]*)(<\/w:t>)(\s*<\/w:r>\s*<w:r[^>]*>\s*(?:<w:rPr>.*?<\/w:rPr>\s*)?<w:t[^>]*>)([^<]*)(<\/w:t>)/g,
                function(match, abre1, texto1, fecha1, meio, texto2) {
                    // só funde se pelo menos um dos dois pedaços contiver "{" ou "}"
                    // (evita mexer em texto normal do contrato à toa)
                    if ((texto1 + texto2).indexOf('{') === -1 && (texto1 + texto2).indexOf('}') === -1) return match;
                    return abre1 + texto1 + texto2 + fecha1;
                }
            );
            // roda a fusão de novo (encadeamentos de 3+ runs quebrados)
            for (let tentativa = 0; tentativa < 4; tentativa++) {
                const antes = xml;
                xml = xml.replace(/(<w:t[^>]*>)([^<]*\{[^<]*)(<\/w:t>)(\s*<\/w:r>\s*<w:r[^>]*>\s*(?:<w:rPr>.*?<\/w:rPr>\s*)?<w:t[^>]*>)([^<]*)(<\/w:t>)/g,
                    function(match, abre1, texto1, fecha1, meio, texto2) { return abre1 + texto1 + texto2 + fecha1; }
                );
                if (xml === antes) break;
            }

            // v1.46.0 — CAMADA 4 REAL da prontidão (Especificação de
            // Prontidão §5): só dá pra saber quais placeholders o MODELO
            // REAL usa depois de abri-lo — é aqui, não antes. Guarda o xml
            // ANTES da troca pra saber quais placeholders conhecidos
            // realmente apareciam no modelo E ficaram vazios (pendência de
            // negócio), e depois da troca sobra qualquer "{{...}}" que o
            // sistema não sabia preencher (placeholder desconhecido do
            // modelo — também bloqueia, evita "Nenhum placeholder residual"
            // falhar no teste de aceite).
            const xmlAntesDaTroca = xml;
            const placeholdersVaziosDetectados = [];

            Object.keys(valores).forEach(function(chave) {
                const placeholder = '{{' + chave + '}}';
                if (xmlAntesDaTroca.indexOf(placeholder) !== -1 && !valores[chave]) {
                    placeholdersVaziosDetectados.push(chave);
                }
                const valorEscapado = escaparXml(valores[chave]);
                xml = xml.split(placeholder).join(valorEscapado);
            });

            const residuaisMatch = xml.match(/\{\{[^}]{1,60}\}\}/g);
            const placeholdersResiduais = residuaisMatch ? [...new Set(residuaisMatch)] : [];

            zip.file(caminhoDocumento, xml);

            const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });

            return { blob, placeholdersVaziosDetectados, placeholdersResiduais };
        }

        export async function extrairTextoDocxMinutizacao(arrayBuffer) {
            const zip = await JSZip.loadAsync(arrayBuffer);
            const arquivoXml = zip.file('word/document.xml');
            if (!arquivoXml) throw new Error('Arquivo .docx inválido (não encontrei word/document.xml dentro dele).');
            let xml = await arquivoXml.async('string');
            xml = xml.replace(/<\/w:p>/g, '\n');
            xml = xml.replace(/<w:tab\/>/g, '\t');
            let texto = xml.replace(/<[^>]+>/g, '');
            texto = texto.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
            texto = texto.split('\n').map(l => l.replace(/[ \t]+/g, ' ').trim()).filter(l => l.length > 0).join('\n');
            return texto;
        }

        // Heurística de linha: pdf.js devolve os textos em fragmentos soltos
        // com posição (x,y) — sem heurística, tudo vira uma linha só por
        // página. Quebra em nova linha quando o Y muda mais que 2pt em
        // relação ao fragmento anterior (mudou de linha na página real).
        // CORRIGIDO (30/08/2026) — BUG REAL achado pelo Nicola testando com
        // um contrato real: palavras saíam quebradas ("c asado" em vez de
        // "casado", "9 15" em vez de "915", "s eja" em vez de "seja"). A
        // versão anterior inserida SEMPRE um espaço entre fragmentos
        // (`item.str + ' '`) — mas o pdf.js frequentemente devolve UMA
        // MESMA palavra partida em vários fragmentos (por kerning/hinting
        // da fonte no PDF original), sem espaço real entre eles. Agora só
        // insere espaço quando há um vão de verdade entre o fim de um
        // fragmento e o início do próximo (maior que ~30% da largura média
        // de caractere daquele fragmento) — palavra partida por kerning
        // (vão pequeno/zero) não ganha espaço; palavras realmente
        // separadas (vão maior) continuam ganhando.
        export async function extrairTextoPdfMinutizacao(arrayBuffer) {
            if (typeof pdfjsLib === 'undefined') throw new Error('Biblioteca de leitura de PDF não carregou — recarregue a página e tente de novo.');
            if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            }
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const paginas = [];
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                let linhaAtual = '';
                let yAnterior = null;
                let xFimAnterior = null;
                const linhasPagina = [];
                content.items.forEach(function(item) {
                    const y = item.transform[5];
                    const x = item.transform[4];
                    if (yAnterior !== null && Math.abs(y - yAnterior) > 2) {
                        if (linhaAtual.trim()) linhasPagina.push(linhaAtual.trim());
                        linhaAtual = '';
                        xFimAnterior = null;
                    }
                    if (item.str) {
                        // vão real entre o fim do fragmento anterior e o
                        // início deste — largura de caractere estimada a
                        // partir da escala horizontal do próprio fragmento
                        // (transform[0]), não um valor fixo (PDFs têm
                        // fontes/zoom diferentes entre si).
                        const larguraCharEstimada = Math.max(Math.abs(item.transform[0]) * 0.5, 1);
                        const vao = xFimAnterior !== null ? x - xFimAnterior : 0;
                        const precisaEspaco = xFimAnterior !== null
                            && !/^\s/.test(item.str)
                            && !linhaAtual.endsWith(' ')
                            && vao > larguraCharEstimada;
                        linhaAtual += (precisaEspaco ? ' ' : '') + item.str;
                        xFimAnterior = x + (item.width || 0);
                    }
                    yAnterior = y;
                });
                if (linhaAtual.trim()) linhasPagina.push(linhaAtual.trim());
                paginas.push(linhasPagina.join('\n'));
            }
            const texto = paginas.join('\n\n').trim();
            if (texto.length < 20) throw new Error('Não consegui ler texto neste PDF — se for um PDF escaneado (imagem, sem texto selecionável), não dá pra extrair automaticamente ainda. Tenta um PDF com texto de verdade, ou converte pra .docx.');
            return texto;
        }

        // --- Geração de um .docx novo, limpo, com formatação padrão ---
        // Estrutura OOXML mínima válida (testada e confirmada abrindo em
        // leitor de verdade antes de entrar aqui) — [Content_Types].xml +
        // _rels/.rels + word/document.xml + word/_rels/document.xml.rels +
        // word/styles.xml (2 estilos: Normal e Titulo) + docProps/core.xml
        // + docProps/app.xml. Reaproveita escaparXml() já existente (usada
        // por preencherMinutaDocx) — mesma função, um lugar só.
        export async function gerarDocxDoTextoMinutizacao(tituloDocumento, linhasTexto) {
            const zip = new JSZip();

            const contentTypes = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
                '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
                '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
                '<Default Extension="xml" ContentType="application/xml"/>' +
                '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
                '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>' +
                '<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>' +
                '<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>' +
                '</Types>';

            const relsRoot = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
                '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
                '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
                '<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>' +
                '<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>' +
                '</Relationships>';

            const docRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
                '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
                '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
                '</Relationships>';

            const styles = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
                '<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
                '<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/></w:rPr></w:rPrDefault></w:docDefaults>' +
                '<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>' +
                '<w:style w:type="paragraph" w:styleId="Titulo"><w:name w:val="Titulo"/><w:basedOn w:val="Normal"/><w:pPr><w:jc w:val="center"/></w:pPr><w:rPr><w:b/><w:sz w:val="28"/></w:rPr></w:style>' +
                '</w:styles>';

            const core = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
                '<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/">' +
                `<dc:title>${escaparXml(tituloDocumento)}</dc:title><dc:creator>Raiz Patrim\u00f4nio</dc:creator>` +
                '</cp:coreProperties>';

            const appXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
                '<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties">' +
                '<Application>Raiz Patrim\u00f4nio</Application></Properties>';

            const paragrafosXml = linhasTexto.map(function(linha, i) {
                if (i === 0) {
                    return `<w:p><w:pPr><w:pStyle w:val="Titulo"/></w:pPr><w:r><w:t xml:space="preserve">${escaparXml(linha)}</w:t></w:r></w:p>`;
                }
                if (!linha.trim()) return '<w:p/>';
                return `<w:p><w:pPr><w:jc w:val="both"/></w:pPr><w:r><w:t xml:space="preserve">${escaparXml(linha)}</w:t></w:r></w:p>`;
            }).join('');

            const documentXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
                '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
                `<w:body>${paragrafosXml}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1417" w:right="1417" w:bottom="1417" w:left="1417"/></w:sectPr></w:body>` +
                '</w:document>';

            zip.file('[Content_Types].xml', contentTypes);
            zip.file('_rels/.rels', relsRoot);
            zip.file('word/document.xml', documentXml);
            zip.file('word/_rels/document.xml.rels', docRels);
            zip.file('word/styles.xml', styles);
            zip.file('docProps/core.xml', core);
            zip.file('docProps/app.xml', appXml);

            return await zip.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        }

        // --- Chamada à IA (Edge Function nova, minuta-detectar-placeholders) ---
        export async function chamarDeteccaoPlaceholdersIA(texto) {
            const { data, error } = await dbAuth.functions.invoke('minuta-detectar-placeholders', {
                body: { cliente_id: CLIENTE_ID_SUPABASE, texto },
            });
            if (error) throw new Error(error.message || 'Falha ao chamar a detecção de placeholders por IA.');
            if (data?.erro) throw new Error(data.erro);
            return data?.sugestoes || [];
        }

        // CORRIGIDO (v1.67.0 — bug real achado em auditoria de paridade da
        // funcionalidade de Minutas): esta função gravava o anexo em
        // `contratos.anexos`, coluna que não existe mais na tabela desde a
        // migração do sistema de documentos pro Cofre (cofre_documentos +
        // cofre_documento_vinculos, ver gerarMinutaNoCofre() abaixo). O
        // `.update()` que gravava isso nunca checava erro — então o botão
        // "Gerar Minuta" da Ficha do Contrato subia o arquivo pro bucket
        // certo, mostrava toast de sucesso, mas o vínculo nunca era salvo:
        // o documento ficava órfão no Storage e nunca aparecia em lugar
        // nenhum (nem no box "Documento" da própria ficha, que já lê do
        // Cofre). Corrigido eliminando a duplicação: esta função agora só
        // resolve o imóvel do contrato e delega inteiramente pra
        // gerarMinutaNoCofre() — mesma prontidão, mesmo preenchimento,
        // mesmo destino (Cofre), sem lógica duplicada em dois lugares que
        // podem divergir de novo no futuro.
        // CORRIGIDO (30/08/2026, pedido explícito do Nicola testando):
        // antes "Gerar Minuta" nunca oferecia escolha (delegava direto pra
        // gerarMinutaNoCofre sem checar se havia mais de 1 minuta
        // aplicável) — só "Conferir minuta padrão" mostrava o picker, e
        // esse picker misturava as 2 ações (ver/gerar) na mesma tela.
        // Agora os 2 botões usam o MESMO listarMinutasAplicaveis() e o
        // MESMO abrirPickerMinutasAplicaveis(), só com o `modo` diferente
        // — "Gerar Minuta" só oferece "gerar" por opção, "Conferir minuta
        // padrão" só oferece "visualizar" por opção. Com só 1 aplicável,
        // os 2 continuam pulando o picker (comportamento idêntico a antes).
        export async function gerarMinutaContrato(contratoId) {
            const con = contratos.find(c => c.id === contratoId);
            if (!con) return;

            const aplicaveis = listarMinutasAplicaveis(con.imovelId);
            if (aplicaveis.length > 1) {
                abrirPickerMinutasAplicaveis(con.imovelId, aplicaveis, 'gerar');
                return;
            }
            await gerarMinutaNoCofre(con.imovelId);
        }

        // ===================================================================
        // v1.55.0 — NOVO: "Gerar minuta" a partir do menu Locação (pedido
        // explícito). Sobe pro COFRE (cofre-documentos + cofre_documentos +
        // cofre_documento_vinculos), como um documento tipo "Minuta
        // Contratual" já vinculado ao contrato. Reaproveita 100% a mesma
        // regra de prontidão/preenchimento (avaliarProntidaoContratoParaMinuta/
        // montarValoresPlaceholdersMinuta/preencherMinutaDocx) — só muda o
        // destino do upload.
        // ===================================================================
        // CORRIGIDO (v1.59.0 — pedido explícito): antes a validação rodava
        // em 2 etapas separadas (avaliarProntidaoContratoParaMinuta primeiro,
        // preencherMinutaDocx depois) — cada uma travava com seu próprio
        // alerta, então a pessoa corrigia o 1º aviso, clicava de novo, e só
        // aí via o 2º ("observação" do IMÓVEL, que o modelo de minuta usa
        // mas não fazia parte da checagem de prontidão do contrato). Agora
        // as duas checagens rodam ANTES de qualquer alerta, e tudo que
        // estiver faltando aparece junto, numa única mensagem.
        // v1.67.0 — desde esta versão, esta função também é o destino de
        // gerarMinutaContrato() (ver acima) — é o ÚNICO lugar que sobe
        // minuta preenchida de verdade, chamado a partir dos 2 pontos de
        // entrada (pill "Gerar Minuta" da Ficha do Contrato + menu
        // "Locação"). Nome do arquivo gerado também corrigido nesta versão
        // (pedido explícito): antes era só "Minuta - {locatário}.docx", sem
        // nenhuma referência a qual modelo deu origem; agora referencia o
        // nome da própria minuta, igual a convenção usada no cadastro do
        // modelo (slugArquivo/dataYYYYMMDD).
        // v1.70.0 (30/08/2026) — 2º parâmetro opcional `minutaIdEscolhida`:
        // quando informado (vindo do picker de "Conferir minuta padrão"
        // com mais de uma opção aplicável — ver listarMinutasAplicaveis),
        // usa ESSA minuta específica em vez de resolver sozinho por
        // encontrarMinutaParaImovel(). Sem o parâmetro, comportamento
        // idêntico a antes (botão "Gerar Minuta" continua resolvendo
        // sozinho pela mais específica).
        // Campo do modelo → onde se preenche e como se chama na tela.
        const CAMPO_MINUTA_ROTULO = {
            locador_nome: ['empresa', 'Nome da empresa'], locador_cnpj: ['empresa', 'CNPJ'], locador_responsavel: ['empresa', 'Responsável'],
            locador_endereco: ['empresa', 'Endereço'], locador_cidade: ['empresa', 'Cidade'],
            imovel_endereco: ['imovel', 'Endereço'], imovel_empreendimento: ['imovel', 'Empreendimento'], imovel_tipo: ['imovel', 'Tipo'], imovel_descricao: ['imovel', 'Descrição'],
            aluguel_valor: ['contrato', 'Valor do aluguel (maior que zero)'], aluguel_vencimento_dia: ['contrato', 'Dia de vencimento válido (1 a 31)'],
            contrato_inicio: ['contrato', 'Data de início da vigência'], contrato_fim: ['contrato', 'Data de fim da vigência'],
            contrato_prazo_meses: ['contrato', 'Prazo (início e fim da vigência)'], indice_reajuste: ['contrato', 'Índice de reajuste'],
            locatario_nome: ['contrato', 'Nome do locatário'], locatario_documento: ['contrato', 'CPF/CNPJ do locatário'], locatario_doc_tipo: ['contrato', 'Tipo de documento do locatário'],
            locatario_whatsapp: ['contrato', 'WhatsApp do locatário'], locatario_email: ['contrato', 'E-mail do locatário'],
            locatario_endereco_atual: ['contrato', 'Endereço atual do locatário'], locatario_profissao: ['contrato', 'Profissão do locatário'],
            locatario_estado_civil: ['contrato', 'Estado civil do locatário'],
        };
        const CAMPO_FIADOR_ROTULO = { nome: 'nome', cpf: 'CPF', doc_tipo: 'tipo de documento', rg: 'RG', rg_orgao_expedidor: 'órgão do RG', nacionalidade: 'nacionalidade',
            data_nascimento: 'data de nascimento', profissao: 'profissão', estado_civil: 'estado civil', regime_bens: 'regime de bens', conjuge_nome: 'nome do cônjuge',
            conjuge_cpf: 'CPF do cônjuge', conjuge_rg: 'RG do cônjuge', conjuge_profissao: 'profissão do cônjuge', whatsapp: 'WhatsApp', email: 'e-mail',
            endereco_atual: 'endereço atual', imovel_matricula: 'matrícula do imóvel de garantia', imovel_cartorio_registro: 'cartório do imóvel de garantia',
            imovel_endereco: 'endereço do imóvel de garantia' };

        // Recebe textos da conferência do contrato e {campo}/{residual} do modelo; mostra agrupado por
        // onde se preenche, cada grupo com o botão da tela certa.
        export function mostrarPendenciasMinuta(problemas, con, imo) {
            const grupos = { contrato: [], fiador: [], empresa: [], imovel: [], modelo: [] };
            const por = (g, texto) => { if (!grupos[g].includes(texto)) grupos[g].push(texto); };
            (problemas || []).forEach(pb => {
                if (typeof pb === 'string') {
                    if (/empresa/i.test(pb)) por('empresa', 'Dados da empresa');
                    else if (/^Imóvel vinculado/i.test(pb)) por('imovel', 'Imóvel ligado ao contrato');
                    else if (/minuta/i.test(pb)) por('modelo', 'Nenhuma minuta vale para este imóvel');
                    else por('contrato', pb);
                } else if (pb && pb.residual) {
                    por('modelo', 'O modelo usa {{' + pb.residual + '}}, que o Raiz não preenche');
                } else if (pb && pb.campo) {
                    const m = /^fiador_(\d+)_(.+)$/.exec(pb.campo);
                    if (m) por('fiador', 'Fiador ' + m[1] + ': ' + (CAMPO_FIADOR_ROTULO[m[2]] || m[2].replace(/_/g, ' ')));
                    else if (CAMPO_MINUTA_ROTULO[pb.campo]) por(CAMPO_MINUTA_ROTULO[pb.campo][0], CAMPO_MINUTA_ROTULO[pb.campo][1]);
                    else por('modelo', 'Campo {{' + pb.campo + '}} sem valor');
                }
            });
            const abrirContrato = () => { if (con && typeof editarContrato === 'function') editarContrato(con.id); };
            const cfg = [
                ['contrato', 'Contrato e locatário', 'Editar o contrato', abrirContrato],
                ['fiador', 'Fiadores', 'Editar o contrato', abrirContrato],
                ['empresa', 'Minha empresa', 'Abrir Minha empresa', () => switchTab('tab-minha-empresa')],
                ['imovel', 'Imóvel', 'Abrir o imóvel', () => { if (imo) window.location.hash = '#/ativo/' + imo.id; }],
                ['modelo', 'Modelo da minuta', 'Abrir Minutas', () => switchTab('tab-minutas')],
            ].filter(c => grupos[c[0]].length);
            const total = cfg.reduce((s, c) => s + grupos[c[0]].length, 0);
            const esc = (s) => (typeof rzEsc === 'function' ? rzEsc(s) : String(s));
            if (typeof abrirSheet !== 'function') {
                rzResumo({ titulo: 'Faltam dados para a minuta', linhas: cfg.flatMap(c => [c[1] + ':', ...grupos[c[0]].map(x => '• ' + x)]) });
                return;
            }
            const sheet = abrirSheet(rzSheetCabecalho('Faltam dados para a minuta', total === 1 ? '1 item para completar' : total + ' itens para completar') + `
                <div class="rz-sh-b">
                    ${cfg.map((c, i) => `<div class="rz-group">${esc(c[1])}</div>
                        <div class="rz-card"><ul class="rz-pend-lista">${grupos[c[0]].map(x => `<li>${esc(x)}</li>`).join('')}</ul>
                        <button type="button" class="rz-btn rz-btn-2 rz-wide" data-pend="${i}">${esc(c[2])}</button></div>`).join('')}
                </div>
                <div class="rz-sh-f"><button type="button" class="rz-btn rz-btn-1 rz-wide" onclick="fecharSheet()">Entendi</button></div>`);
            sheet.querySelectorAll('[data-pend]').forEach(b => b.addEventListener('click', () => {
                const acao = cfg[Number(b.getAttribute('data-pend'))][3];
                fecharSheet();
                setTimeout(acao, 0);
            }));
        }

        export async function gerarMinutaNoCofre(imovelId, minutaIdEscolhida) {
            const imo = imoveis.find(i => i.id === imovelId);
            if (!imo) return;

            const con = contratos.find(c => c.imovelId === imovelId && c.status === 'Assinando');
            if (!con) {
                rzAvisar('Este imóvel ainda não tem contrato "Assinando". Gere o link ou cadastre os dados do contrato antes.', 'danger');
                return;
            }

            const minuta = minutaIdEscolhida
                ? minutasContrato.find(m => m.id === minutaIdEscolhida && m.ativa !== false)
                : encontrarMinutaParaImovel(imovelId);
            if (!minuta || !minuta.arquivoUrl) {
                rzAvisar('Nenhuma minuta cadastrada serve para este imóvel.', 'danger');
                return;
            }

            mostrarCarregamentoGlobal('Verificando dados...');

            const prontidao = avaliarProntidaoContratoParaMinuta(con, imo);
            const problemasCombinados = [...prontidao.faltantes, ...prontidao.invalidos];

            // NOVO (30/08/2026) — fiadores do contrato, pra alimentar o
            // dicionário de placeholders (ver montarValoresPlaceholdersMinuta).
            let fiadoresDoContrato = [];
            try {
                const { data: fiadoresData, error: errFiadores } = await dbAuth.from('contrato_fiadores')
                    .select('*').eq('contrato_id', con.id).order('ordem');
                if (errFiadores) throw errFiadores;
                fiadoresDoContrato = fiadoresData || [];
            } catch (err) {
                console.error('gerarMinutaNoCofre: falha ao buscar fiadores (segue sem eles):', err.message || err);
            }

            let arrayBufferModelo, resultadoPreenchimento;
            try {
                const respostaModelo = await fetch(minuta.arquivoUrl);
                if (!respostaModelo.ok) throw new Error('Não consegui baixar o arquivo do modelo (HTTP ' + respostaModelo.status + ').');
                arrayBufferModelo = await respostaModelo.arrayBuffer();

                const valores = montarValoresPlaceholdersMinuta(con, imo, fiadoresDoContrato);
                resultadoPreenchimento = await preencherMinutaDocx(arrayBufferModelo, valores);

                resultadoPreenchimento.placeholdersVaziosDetectados.forEach(p => problemasCombinados.push({ campo: p }));
                resultadoPreenchimento.placeholdersResiduais.forEach(p => problemasCombinados.push({ residual: p }));
            } catch (err) {
                esconderCarregamentoGlobal();
                rzAvisar('Não consegui verificar o modelo de minuta: ' + (err.message || String(err)), 'danger');
                return;
            }

            if (problemasCombinados.length > 0) {
                esconderCarregamentoGlobal();
                mostrarPendenciasMinuta(problemasCombinados, con, imo);
                return;
            }

            mostrarCarregamentoGlobal('Gerando minuta...');

            try {

                // CORRIGIDO (v1.67.0, pedido explícito): nome intuitivo,
                // referenciando o modelo de origem — igual convenção usada
                // no cadastro da minuta (minuta_{slug}_v{n}_{data}.docx).
                const nomeArquivo = `contrato_${slugArquivo(con.locatario)}_${slugArquivo(minuta.nome)}_${dataYYYYMMDD()}.docx`;
                const nomeSanitizado = nomeArquivo.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9._-]/g, '_');
                const agora = new Date();
                const storagePath = `${CLIENTE_ID_SUPABASE}/${agora.getFullYear()}/${String(agora.getMonth() + 1).padStart(2, '0')}/minuta_${con.id}_${Date.now()}/${nomeSanitizado}`;

                const { error: errUpload } = await dbAuth.storage.from('cofre-documentos').upload(storagePath, resultadoPreenchimento.blob, { contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
                if (errUpload) throw errUpload;

                // Categoria "Minuta Contratual" — usa uma já cadastrada se
                // existir (busca por nome), sem criar categoria nova sem
                // necessidade nem travar a geração se não encontrar.
                let categoriaId = null;
                try {
                    const { data: cats } = await dbAuth.from('cofre_categorias').select('id, nome').eq('cliente_id', CLIENTE_ID_SUPABASE).ilike('nome', '%minuta%').limit(1);
                    if (cats && cats.length > 0) categoriaId = cats[0].id;
                } catch (e) { /* segue sem categoria, não bloqueia */ }

                const { data: docInserido, error: errDoc } = await dbAuth.from('cofre_documentos').insert({
                    cliente_id: CLIENTE_ID_SUPABASE,
                    nome_original: nomeArquivo,
                    nome_exibicao: nomeArquivo,
                    bucket: 'cofre-documentos',
                    storage_path: storagePath,
                    mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    extensao: 'docx',
                    categoria_id: categoriaId,
                    descricao: 'Minuta contratual gerada automaticamente a partir do modelo "' + minuta.nome + '".',
                    origem: 'app',
                    status: 'ativo'
                }).select('id').single();
                if (errDoc) throw errDoc;
                // v1.1.0 (Fase 1 do wrapper de escrita) — DUAS entidades,
                // porque são duas escritas diferentes nesta mesma operação:
                // a minuta foi gerada ('minuta') E um documento novo nasceu
                // no Cofre ('documento', entidade separada — quem escuta só
                // 'minuta' nunca saberia que o Cofre também mudou).
                emitirEscrita('minuta', { id: minuta.id, contratoId: con.id, acao: 'gerar-no-cofre' });
                emitirEscrita('documento', { id: docInserido.id, contratoId: con.id, acao: 'criar-via-minuta' });

                await dbAuth.from('cofre_documento_vinculos').insert({
                    cliente_id: CLIENTE_ID_SUPABASE,
                    documento_id: docInserido.id,
                    entidade_tipo: 'contrato',
                    entidade_id: con.id,
                    principal: true,
                    criado_por: pessoaIdLogada || null
                });

                // CORRIGIDO (v1.56.0 — pedido explícito): a geração pelo
                // botão nunca gravava no histórico do contrato. Mesmo
                // padrão usado em toda parte (historico_contrato, tipo
                // 'anexo' — enum já existente, é literalmente pra isso).
                const descricaoHistoricoMinuta = `Minuta contratual gerada e guardada no Cofre ("${nomeArquivo}"), a partir do modelo "${minuta.nome}".`;
                const { data: histInserido, error: errHistMinuta } = await dbAuth.from('historico_contrato').insert({
                    contrato_id: con.id, tipo: 'anexo', descricao: descricaoHistoricoMinuta
                }).select().single();
                if (!errHistMinuta) {
                    con.historico = con.historico || [];
                    con.historico.push({ data: histInserido.criado_em, descricao: descricaoHistoricoMinuta, tipo: 'anexo', _salvo: true });
                }

                esconderCarregamentoGlobal();
                registrarLog('minutas.gerar', { contratoId: con.id, minutaId: minuta.id, origem: 'cofre' }); // v1.131
                mostrarToast('Minuta gerada e guardada no Cofre deste contrato!', 'success');

                // CORRIGIDO (v1.58.0 — pedido explícito): o menu "Locação"
                // só fecha aqui, no sucesso — os alerts de validação acima
                // (contrato inexistente/dados faltando/sem minuta) não
                // fecham mais o menu, ele continua na tela depois que a
                // pessoa clica OK no alerta.
                document.getElementById('modal-opcoes-contratacao')?.remove();

                if (fichaImovelAtualId === imovelId) renderFichaImovelUnica(imo);
                rzConSeCarregado('reabrirFichaSeFor', con.id); // R8-2 — estado da ficha vive em contratos.js

            } catch (err) {
                esconderCarregamentoGlobal();
                rzAvisar('Não consegui gerar a minuta: ' + (err.message || String(err)), 'danger');
            }
        }

        // "Conferir minuta padrão" — pedido explícito: baixa o ARQUIVO da
        // minuta padrão (o modelo em si, sem preencher nada) — não confundir
        // com gerarMinutaContrato(), que preenche os dados de um contrato
        // específico. Aqui é só "dar uma olhada" no modelo que será usado.
        // v1.70.0 (30/08/2026) — quando houver MAIS DE UMA minuta aplicável
        // ao imóvel, abre um picker (pedido explícito do Nicola) em vez de
        // pegar a primeira sozinho — o cliente escolhe qual ver, e pode
        // seguir direto pro fluxo de geração com a escolhida
        // (gerarMinutaNoCofre(imovelId, minutaId)). Com só 1 aplicável,
        // comportamento idêntico a antes (abre direto, sem picker).
        export function baixarMinutaPadraoImovel(imovelId) {
            const aplicaveis = listarMinutasAplicaveis(imovelId);
            if (aplicaveis.length === 0) { rzAvisar('Nenhuma minuta padrão disponível para este imóvel.', 'danger'); return; }

            if (aplicaveis.length === 1) {
                window.open(aplicaveis[0].arquivoUrl, '_blank');
                registrarLog('minutas.conferir_padrao', { imovelId, minutaId: aplicaveis[0].id });
                return;
            }

            abrirPickerMinutasAplicaveis(imovelId, aplicaveis, 'visualizar');
        }

        // CORRIGIDO (30/08/2026) — `modo` ('gerar'|'visualizar') decide
        // qual ÚNICA ação cada opção do picker oferece — antes misturava
        // "Ver modelo em branco" e "Usar esta e gerar" na mesma tela,
        // pedido explícito do Nicola pra separar: quem clicou "Gerar
        // Minuta" quer escolher qual GERAR; quem clicou "Conferir minuta
        // padrão" quer escolher qual VER — não as duas coisas juntas.
        export function abrirPickerMinutasAplicaveis(imovelId, aplicaveis, modo) {
            if (typeof abrirSheetAcoes !== 'function') return;
            abrirSheetAcoes({
                titulo: modo === 'gerar' ? 'Qual modelo usar?' : 'Qual modelo ver?',
                sub: 'Mais de uma minuta vale para este imóvel',
                acoes: aplicaveis.map(m => ({
                    icone: modo === 'gerar' ? 'file-signature' : 'eye',
                    titulo: m.nome || 'Minuta',
                    sub: 'Vale para: ' + (ESCOPO_MINUTA_ROTULO[m.escopo] || m.escopo),
                    codigo: modo === 'gerar' ? 'minutas.gerar' : undefined,
                    aoTocar: modo === 'gerar' ? () => gerarMinutaNoCofre(imovelId, m.id) : () => window.open(m.arquivoUrl, '_blank'),
                })),
            });
            registrarLog('minutas.picker_aberto', { imovelId, qtdOpcoes: aplicaveis.length, modo });
        }
