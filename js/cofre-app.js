// ============================================================================
// cofre-app.js — Raiz Patrimônio · Cofre de Documentos
// Versão: 1.46.0 · 09/10/2026
//
// v1.46.0 (UX F2.3a, demanda fcd3008d, sessão 20261003-1707-ux-base; "Estou de acordo com f2.3 e opcao a" do Nicola 09/10 20:52) —
// "abrir-busca-ativos" abre a busca em Sheet (ativos.abrirBuscaAtivos) quando o app tem Sheet; no
// cofre.html avulso continua o popup de sempre.
//
// Versão anterior: 1.45.0 · 08/10/2026
//
// v1.45.0 (UX F2.8, demanda ed5accfe, sessão 20261003-1707-ux-base; "Sim. Faça 1 e 2 agora" do Nicola 08/10 20:09) — "+" de Ativos: "Montar vitrine" vira "Compartilhar imóveis".
//
// Versão anterior: 1.44.2 · 07/10/2026
//
// v1.44.1 (07/10/2026, sessão 20261007-1721-rolo-changelog, demanda 2507d554 — VER-06, "de acordo" do Nicola 07/10 17:21) — SÓ
// CABEÇALHO: as versões além das 5 mais recentes rolaram para o CHANGELOG_MODULOS.md.
// Nenhuma linha de código mudou — conferido token a token contra o publicado.
//
// Versão anterior: 1.44.0 · 06/10/2026
//
// v1.44.0 (frente D, fatia D2 — demanda 860233ca; sessão 20261006-2348-setup-d2; "Estou de acordo" do
// Nicola 06/10 23:48) — o + de Ativos ganha "Configuração inicial" (código cofre.configuracao_inicial;
// sem ele, aparece com cadeado e motivo). O evento cofre:abrir-configuracao-inicial (disparado pelo
// index.html: + de Contratos e alerta "Nenhum ativo cadastrado") abre a mesma tela, que vive em
// js/configuracao-inicial.js e só carrega quando é usada (UI-05).
//
// Versão anterior: 1.43.0 · 03/10/2026
//
// v1.43.0 (F0.3, demanda 29bed5eb, sessão 20261003-1707-ux-base, "de acordo" do Nicola 03/10 23:57) — nome único da IA: o atalho do bot abre "Raiz IA no WhatsApp" pelo
// adaptador (rzDev, UXR-40), com a saudação nova.
// --------------------------------------------------------------------------
// Versões anteriores (v1.42.0 … v1.42.0): CHANGELOG_MODULOS.md, na raiz do repositório — o
// gerar_versoes.py rola pra lá automaticamente tudo além das 5 versões
// mais recentes deste cabeçalho (VER-06).
export const VERSAO = '1.46.0'; // v-check (28/09/2026): lido por Dev › Versões — manter igual ao header
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
            // v1.21.0 — telas antigas de Imóveis desligadas: volta pra Ativos
            if (typeof window.switchTab === 'function') window.switchTab('tab-ativos');
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
        case 'abrir-busca-ativos': if (typeof window.rzAbrirBuscaTela === 'function') ativos.abrirBuscaAtivos(); else abrirModal('modal-busca-ativos'); break; // F2.3
        // v1.25.0 (fatia 7, REGRAS §4) — "+" da aba Ativos abre sheet de
        // ações (Novo ativo · Carregar documento · Montar vitrine) em vez
        // de 3 ícones soltos. IA no topo (§16.5): o upload é lido pela IA.
        case 'abrir-acoes-ativos':
            if (typeof window.abrirSheetAcoes !== 'function') { await ativos.abrirFormAtivo(); break; }
            window.abrirSheetAcoes({ titulo: 'Ativos', sub: 'O que você quer fazer?', acoes: [
                { icone: 'sparkles', tipo: 'ia', titulo: 'Carregar documento', codigo: 'cofre.upload', sub: 'A IA classifica e sugere o vínculo', aoTocar: () => docs.abrirUploadHome() },
                // v1.44.0 (D2) — configuração inicial pelos documentos que a pessoa já tem
                { icone: 'list-checks', tipo: 'ia', titulo: 'Configuração inicial', codigo: 'cofre.configuracao_inicial', sub: 'Cadastre a carteira mandando os documentos que você já tem', aoTocar: () => abrirConfiguracaoInicialModulo() },
                { icone: 'plus', titulo: 'Novo ativo', codigo: 'cofre.ativos.criar', sub: 'Imóvel, veículo, obra de arte…', aoTocar: () => ativos.abrirFormAtivo() },
                { icone: 'share-2', titulo: 'Compartilhar imóveis', codigo: 'vitrine.gerar', sub: 'Escolha os imóveis e mande um link só', aoTocar: () => { if (typeof window.switchTab === 'function') window.switchTab('tab-vitrine'); } }
            ]});
            break;
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
        case 'abrir-bot': (window.rzDev ? window.rzDev('whatsapp', '5511978950609', 'Olá, Raiz IA! Como você pode me ajudar?') : window.open('https://wa.me/5511978950609?text=' + encodeURIComponent('Olá, Raiz IA! Como você pode me ajudar?'), '_blank', 'noopener')); break;
        case 'fechar-categorias': docs.fecharCategorias(); break;
        case 'salvar-categoria': await docs.salvarCategoria(); break;
        case 'abrir-documentos-arquivados': fecharModal('modal-menu-conta'); await docs.abrirDocumentosArquivados(); break; // v1.31.0
        case 'fechar-documentos-arquivados': docs.fecharDocumentosArquivados(); break;
        case 'restaurar-documento-arquivado': await docs.restaurarDocumentoArquivado(alvo.dataset.id); break;
        case 'vincular-documento-arquivado': await docs.vincularDocumentoArquivado(alvo.dataset.id); break;
        case 'excluir-documento-arquivado-de-vez': await docs.excluirDocumentoArquivadoDeVez(alvo.dataset.id); break;
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
        case 'up-escolher-camera': docs.escolherCameraUpload(); break;
        case 'up-escolher-arquivo': docs.escolherArquivoUpload(); break;
        case 'cancelar-confirmacao-upload': await docs.cancelarConfirmacaoUpload(); break;
        case 'salvar-confirmacao-upload': await docs.salvarConfirmacaoUpload(); break;
        case 'uc-reler-tipo': await docs.relerComoTipoUpload(); break; // v1.27.0
        case 'up-tentar-outra-foto': docs.tentarOutraFotoUpload(); break; // v1.28.0
        case 'up-pdf-destravar': await docs.destravarPdfUpload(); break; // v1.29.0 (A.24)
        case 'up-pdf-sem-leitura': await docs.enviarPdfSemLeituraUpload(); break; // v1.29.0 (A.24)
        case 'up-enviar-assim-mesmo': await docs.enviarAssimMesmoUpload(); break; // v1.28.0
        case 'uc-criar-ativo': docs.abrirCriarAtivoDoDocumento(); break; // v1.28.0
        case 'uc-cancelar-criar-ativo': docs.cancelarCriarAtivoDoDocumento(); break; // v1.28.0
        case 'abrir-documento': await docs.abrirFichaDocumento(id); break;
        case 'alternar-editar-alerta': docs.alternarEditarAlerta(id); break;
        case 'confirmar-editar-alerta': await docs.confirmarEditarAlerta(id); break;
        case 'excluir-alerta': await docs.excluirAlerta(id); break;
        case 'fechar-ficha-doc': docs.fecharFichaDoc(); break;
        case 'baixar-documento-atual': await docs.baixarDocumentoAtual(); break;
        case 'excluir-documento-atual': await docs.excluirDocumentoAtual(); break;
        case 'ir-para-vinculo': await docs.irParaVinculo(alvo.dataset.tipo, alvo.dataset.id); break;
        case 'escolher-candidato-upload': docs.escolherCandidatoUpload(alvo.dataset.tipo, alvo.dataset.id, alvo.dataset.nome, alvo.dataset.tipoAtivo); break;

        // ---- "Vincular agora" (o modal de sugestões da IA saiu na v1.26.0 — confirmação acontece antes de salvar)
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
        case 'alternar-mais-acoes-ativo':
        case 'abrir-acoes-ativo': ativos.abrirAcoesAtivo(); break;
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
            if (typeof window.abrirCadastroImovelModal === 'function') {
                // v1.21.0 — o modal vive no <body> (index v1.108.0): abre em
                // cima da lista de Ativos; ao fechar, recarrega a lista.
                window.__rzAposFecharImovel = () => window.dispatchEvent(new CustomEvent('cofre:recarregar-ativos'));
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
            else mostrarToast('Compartilhar imóveis só funciona dentro do app.', 'erro');
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
        // v1.20.0 (fatia 3) — segmento Documentos·Fotos do chip Arquivos e
        // toque na linha de contrato (abre na aba Contratos do App)
        case 'fa-seg-arquivos': ativos.faTrocarSegArquivos(alvo.dataset.faSeg); break;
        case 'fa-abrir-contrato-app': ativos.abrirContratoNoApp(alvo.dataset.contratoId); break;
        // Entrega R.4 (22/09/2026) — card "Revisão anual de valor" do chip
        // Performance (cofre-ativos.js v1.58.0): as 3 ações leem o estado
        // local `revisaoValorAtual` do módulo, sem precisar de dataset.
        case 'fa-revisar-valor': ativos.abrirRevisarValor(); break;
        case 'fa-revisao-adiar': await ativos.adiarRevisaoValor(); break;
        case 'fa-revisao-manter': await ativos.manterValorRevisao(); break;
        // demanda 44f30857, item 2 (22/09/2026) — ícone (i) do card Performance
        case 'fa-info-performance': ativos.abrirInfoPerformanceAtivo(); break;
        case 'fa-info-cib': ativos.abrirInfoCib(); break;
        case 'fa-info-situacao-uso': ativos.abrirInfoSituacaoUso(); break;
        case 'fa-info-destinacao': ativos.abrirInfoDestinacao(); break;
        case 'ativo-toggle-mais-campos': ativos.alternarCamposAvancadosImovel(alvo.dataset.prefixo); break;
        case 'fa-novo-contrato-imovel': ativos.abrirNovoContratoDoAtivo(); break;
        case 'fa-iniciar-contratacao': ativos.iniciarContratacaoDoAtivo(); break;
        // v1.24.0 — ⋮ dos cards da ficha (sem rodapé)
        case 'fa-acoes-propriedade': ativos.abrirAcoesPropriedade(); break;
        case 'fa-acoes-financeiro': ativos.abrirAcoesFinanceiroAtivo(); break;
        case 'fa-acoes-anexos': ativos.abrirAcoesAnexos(); break;
        case 'abrir-acoes-docs-item': controles.abrirAcoesDocsItem(); break;
        case 'abrir-acoes-partes-linha': controles.abrirAcoesPartesItem(); break;
        case 'categorizar-documento-atual': await docs.categorizarDocumentoAtual(); break;
        // v1.32.5 (pedido explícito, 18/09/2026: "Nos detalhes do arquivo deve
        // ser possivel editar o nome") — lapiseira ao lado do #fd-nome na
        // Ficha do Documento (ver changelog de cofre-documentos.js v2.18.0).
        case 'editar-nome-documento-atual': await docs.editarNomeDocumentoAtual(); break;
        case 'fa-acoes-contratos': ativos.abrirAcoesContratosAtivo(); break;
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
        case 'alternar-mais-acoes-fotos-ativo': ativos.abrirSeletorFotosAtivo(); break;
        case 'abrir-upload-no-ativo-ia': docs.abrirUploadNoAtivoComIA(estado.ativoEmFoco); break;
        case 'abrir-upload-no-ativo-simples': docs.abrirUploadNoAtivoSemIA(estado.ativoEmFoco); break;
        case 'abrir-form-controle': await controles.abrirFormControle(); break;
        case 'alternar-mais-acoes-controles':
        case 'abrir-acoes-controles': ativos.abrirAcoesControlesAtivo(); break;
        case 'fechar-form-controle': controles.fecharFormControle(); break;
        case 'salvar-item-controle': await controles.salvarItemControle(); break;
        // v1.20.0 (fatia 3b-i) — ficha do item de controle na gramática:
        // toque na ocorrência abre sheet de ações; Mais ações de Dados e
        // Partes abrem sheet. 'alternar-acao-ocorrencia' continua valendo
        // (abre o sheet de formulário do modo pedido).
        case 'abrir-acoes-ocorrencia': controles.abrirAcoesOcorrencia(alvo.dataset.id); break;
        case 'abrir-acoes-dados-item': controles.abrirAcoesDadosItem(); break;
        case 'abrir-acoes-partes-item': controles.abrirAcoesPartesItem(); break;
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
        case 'encerrar-item-controle-atual': await controles.encerrarItemControleAtual(); break;   // v1.30.0 — A.10
        case 'reabrir-item-controle-atual': await controles.reabrirItemControleAtual(); break;     // v1.30.0 — A.10
        case 'filtrar-controles-encerrados': controles.filtrarControles(alvo.dataset.chave); break; // v1.30.0 — A.10
        // v1.18.0 (NOVO, 02/09/2026) — chip "Partes" do item de controle.
        case 'abrir-editar-partes-item': await controles.abrirEditarPartesItem(); break;
        case 'fi-salvar-partes-item': await controles.salvarPartesItemAtual(); break;
        case 'fi-gerar-despesa-item': await controles.abrirNovoLancamentoDoItem(); break;
        case 'alternar-mais-acoes-dados-item': controles.alternarMaisAcoesDadosItem(); break;
        case 'alternar-mais-acoes-doc-item': controles.alternarMaisAcoesDocItem(); break;
        case 'carregar-novo-documento-item': controles.carregarNovoDocumentoItem(); break;
        case 'excluir-documento-do-item': await controles.excluirDocumentoDoItem(alvo.dataset.vinculoId); break;
        // E14.4 ("A5") — Contatos unificado com Partes; os 6 cases de
        // contato-item saíram, 1 novo no lugar (atalho de WhatsApp, que
        // migrou pra dentro da lista de Partes).
        case 'acionar-parte-item-direto': controles.acionarParteItemDireto(alvo.dataset.whatsapp); break;
        // v1.35.0 (demanda be42b19f, item 4 — BUG REAL achado por mim
        // revisando o pedido do Nicola "clicar numa parte listada deveria
        // abrir um resumo"): montarPartesItemControle() (cofre-controles.js
        // v1.18.0, 18/09/2026) já marca cada linha com
        // data-action="abrir-ficha-parte" — mas este despachante nunca
        // teve o case correspondente, então o clique não fazia NADA (nem
        // erro no console). abrirFichaParte() já existe e já é completa
        // (dados + Editar/Acionar por WhatsApp/e-mail) — só faltava esta
        // linha pra ligar o clique a ela.
        // v1.36.0 (demanda 176b3145, pedido explícito do Nicola,
        // 22/09/2026 — padronizar a experiência de Parte em todos os
        // locais: "ao clicar nela já entra no form pra edição... eliminar
        // telas intermediárias") — a Ficha (view + vínculos) era uma tela
        // intermediária antes do Editar. Passa a abrir o form de edição
        // direto (window.abrirFormParteSheet, index.html — mesmo form da
        // aba Configurações › Partes); abrirFichaParte() (cofre-controles.js)
        // fica como fallback se por algum motivo o global não existir
        // ainda (index.html não carregado nessa ordem).
        case 'abrir-ficha-parte':
            if (typeof window.abrirFormParteSheet === 'function') await window.abrirFormParteSheet(alvo.dataset.id);
            else await controles.abrirFichaParte(alvo.dataset.id);
            break;

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
        // E5 — 2º seletor (tipo específico dentro da categoria), um case
        // pro form de criar e outro pro de editar (wrappers/prefixos de
        // campo diferentes, ver cofre-ativos.js).
        case 'ativo-tipo-detalhe-mudou': ativos.aoMudarTipoDetalheAtivo(); break;
        case 'ativo-tipo-detalhe-editar-mudou': ativos.aoMudarTipoDetalheEditarAtivo(); break;
        case 'ic-freq-mudou': controles.aoMudarFrequenciaItemControle(); break; // E14.2
        case 'upload-vinculo-tipo-mudou': await docs.aoMudarTipoVinculoUpload(); break;
        case 'uc-categoria-mudou': docs.aplicarPadroesCategoriaUpload(); break;
        case 'uc-tipo-doc-mudou': docs.aoMudarTipoDocUpload(); break; // v1.27.0
        case 'uc-validade-mudou': docs.aoMudarValidadeUpload(); break; // v1.27.0
        case 'uc-controlar-mudou': docs.aoMudarControlarUpload(); break;
        case 'uc-ctl-tipo-mudou': docs.aoMudarTipoControleUpload(); break;
        case 'uc-ctl-subtipo-mudou': docs.aplicarPadraoSubtipoUpload(); break;
        case 'uc-vinculo-ia-mudou': docs.aoMudarVinculoIaUpload(); break;
        case 'fd-vincular-tipo-mudou': await docs.aoMudarTipoVinculoAgora(); break;
        case 'alternar-vitrine-foto': await ativos.alternarVitrineFoto(alvo.dataset.fotoId, alvo.checked); break;
        case 'ic-tipo-mudou': controles.aoMudarTipoControleForm(); break;
        case 'ic-subtipo-mudou': controles.aoMudarSubtipoControleForm(); break; // v1.38.0 (demanda ed2774ee)
        case 'modelo-tipo-mudou': controles.aoMudarTipoModeloControleForm(); break;
        case 'modelo-categoria-mudou': controles.aoMudarCategoriaModeloControleForm(); break; // v1.26.0 rodada 3
        case 'fic-ed-tipo-mudou': controles.aoMudarTipoEditarItemForm(); break;
        default: break;
    }
});

// input de arquivo (upload) tem handler próprio simples — não passa por
// data-action porque `change` de <input type=file> já é bem específico.
document.getElementById('up-arquivo')?.addEventListener('change', () => docs.aoSelecionarArquivoUpload('up-arquivo'));
document.getElementById('up-camera')?.addEventListener('change', () => docs.aoSelecionarArquivoUpload('up-camera')); // v1.26.0
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
// v1.22.0 — ponte pro App: "Carregar documento" no contrato usa o MESMO
// modal de upload do ativo (abrirUploadContextual), em vez de sair pro
// cofre.html (Nicola 03/09: "abre o cofre… esta tela deve sumir").
window.rzAbrirUploadContextual = (tipo, id, nome) => docs.abrirUploadContextual(tipo, id, nome);
// v1.25.1 (fatia 7 seguinte, "anexos do contrato sem as 3 opções") —
// versão com flag de IA explícito, pro sheet de Anexos do contrato
// (index.html) oferecer "com IA" / "simples", igual ao de Ativos.
window.rzAbrirUploadContextualComFlag = (tipo, id, nome, comIA) => docs.abrirUploadContextualComFlag(tipo, id, nome, comIA);
window.rzAnexarArquivoEntidade = (tipo, id, arquivo, opts) => docs.anexarArquivoEntidade(tipo, id, arquivo, opts); // v1.25.3 — anexo programático (reajuste)
// v1.24.0 — pontes pros sheets de ⋮ (os botões de rodapé que chamavam estas
// funções via data-action saíram do markup)
window.__rzAbrirFormControle = () => controles.abrirFormControle();
window.__rzAbrirModelosControle = () => controles.abrirModelosControle();
window.__rzAbrirSubtiposControle = () => controles.abrirSubtiposControle();
window.__rzUploadAtivo = (ia) => ia ? docs.abrirUploadNoAtivoComIA(estado.ativoEmFoco) : docs.abrirUploadNoAtivoSemIA(estado.ativoEmFoco);
window.addEventListener('cofre:dados-carregados', () => {
    window.__cofreCategorias = estado.categorias; // v1.24.0 — chips de categoria dos anexos do contrato (App)
    window.__cofreAtivos = estado.ativos; // v1.24.0 — alerta 'contrato vigente em ativo vendido' (App)
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
    else if (tela === 'arquivados') await docs.abrirDocumentosArquivados(); // v1.32.0 — corrige o menu real (abrirMenuConta/abrirMenuTiposModelos, index.html); o antigo modal-menu-conta (ativos-markup.js) está morto desde a v1.115.0, achado no relato do Nicola (10/09)
});

window.addEventListener('cofre:montar-home', () => docs.montarHome());

window.addEventListener('cofre:abrir-ativo', (ev) => ativos.abrirFichaAtivo(ev.detail.id));
// NOVO (v1.x, 29/08/2026) — acionado pela Central de Comunicações
// (onboarding variante "ativo", ver cofre-navegacao.js bootstrap()) ao
// concluir o passo final: abre o form de cadastro de ativo, mesmo botão
// "+" que a tela já usa.
window.addEventListener('cofre:abrir-form-ativo', () => ativos.abrirFormAtivo());
// v1.25.0 (fatia 7) — upload livre acionado de fora da aba (sheet do Raiz
// IA no cabeçalho global, index.html abrirUploadDocumentoNoApp()).
window.addEventListener('cofre:abrir-upload-home', () => docs.abrirUploadHome());
// v1.44.0 (D2) — configuração inicial (módulo lazy; + de Contratos e alerta chegam por este evento).
function abrirConfiguracaoInicialModulo() {
    return import('./configuracao-inicial.js').then(m => m.abrirConfiguracaoInicial())
        .catch(err => { console.warn('[cofre] configuracao-inicial.js:', err?.message); mostrarToast('Não deu para abrir a configuração inicial agora.', 'aviso'); });
}
window.addEventListener('cofre:abrir-configuracao-inicial', () => abrirConfiguracaoInicialModulo());
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
    // v1.XX.0 — BUG REAL achado ao vivo pelo Nicola (22/09/2026): editou o
    // empreendimento de um ativo, salvou, e a "lista de imóveis" continuou
    // mostrando o ativo no grupo antigo. Causa: a LISTA não agrupa/exibe a
    // partir de `estado.ativos` (que este listener já recarregava certo) —
    // ela lê `resumoImoveisPorId` (cofre-ativos.js), um Map carregado 1x só
    // (carregarResumoImoveisParaCards(), disparado em 'cofre:dados-carregados'
    // no boot) com empreendimento/status/tipo/finalidade/foto/contrato
    // principal de cada imóvel — e nada nunca mandava recarregar esse Map
    // depois de uma escrita. Mesma classe de bug já vista em
    // estado.ativoEmFoco (fix v1.61.0) e no chip "Fiscal OK" (fechamento.js)
    // — cache de módulo que nunca invalida. Fix: chama
    // carregarResumoImoveisParaCards() aqui (já re-renderiza a lista sozinha,
    // preservando o filtro/chip atual — troca o antigo `ativos.
    // renderAtivosLista()` sem argumentos, que também tinha o efeito colateral
    // de resetar o filtro a cada edição).
    await ativos.carregarResumoImoveisParaCards();
    docs.montarHome();
});
// E14.4 — 'cofre:recarregar-contatos' removido: só reatribuía
// estado.contatos, que nada no app lê (achado ao investigar — cache
// morto desde antes desta sessão). listarContatos() saiu de
// cofre-api.js junto.
window.addEventListener('cofre:recarregar-eventos', async () => {
    estado.ocorrenciasAbertas = await api.listarOcorrenciasAbertasComItem(estado.clienteId);
    docs.montarHome();
    const telaAtual = document.querySelector('[data-screen]:not(.hidden)')?.dataset.screen;
    if (telaAtual === 'alertas') renderAlertas();
    if (telaAtual === 'ficha-ativo' && estado.ativoEmFoco) ativos.abrirFichaAtivo(estado.ativoEmFoco.id, document.querySelector('.fa-subtab.rz-on')?.dataset.faAba || 'resumo'); // v1.42.0 — mantém o chip aberto
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
