// ============================================================================
// cofre-app.js — Raiz Patrimônio · Cofre de Documentos
// Versão: 1.3.2 · 25/08/2026
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
import { estado } from './cofre-estado.js';
import * as api from './cofre-api.js';
import { mostrarToast, fecharModal, abrirModal, refrescarIcones } from './cofre-ui.js';
import * as nav from './cofre-navegacao.js';
import * as docs from './cofre-documentos.js';
import * as ativos from './cofre-ativos.js';
import * as controles from './cofre-controles.js';

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
        case 'voltar-app': window.location.href = './'; break;
        case 'fechar-modal-generico': fecharModal('modal-generico'); break;

        // ---- busca global / configurações
        case 'abrir-busca-global': docs.abrirBuscaGlobal(); break;
        case 'fechar-busca-global': docs.fecharBuscaGlobal(); break;
        case 'abrir-menu-conta': abrirModal('modal-menu-conta'); break;
        case 'fechar-menu-conta': fecharModal('modal-menu-conta'); break;
        case 'menu-conta-em-breve': fecharModal('modal-menu-conta'); mostrarToast(`${alvo.dataset.rotulo}: em breve.`); break;
        case 'abrir-busca-ativos': abrirModal('modal-busca-ativos'); break;
        case 'fechar-busca-ativos': fecharModal('modal-busca-ativos'); break;
        case 'limpar-filtro-ativos':
            document.getElementById('filtro-ativo-tipo').value = '';
            document.getElementById('filtro-ativo-busca').value = '';
            ativos.renderAtivosLista('', '');
            break;
        case 'abrir-configuracoes-catalogo': fecharModal('modal-menu-conta'); docs.abrirConfiguracoes(); break;
        case 'abrir-sobre-cofre': fecharModal('modal-menu-conta'); abrirModal('modal-sobre-cofre'); break;
        case 'fechar-sobre-cofre': fecharModal('modal-sobre-cofre'); break;
        case 'abrir-bot': window.open('https://wa.me/5511978950609?text=' + encodeURIComponent('Olá, como o R.AI.Z pode me ajudar?'), '_blank', 'noopener'); break;
        case 'fechar-categorias': docs.fecharCategorias(); break;
        case 'salvar-categoria': await docs.salvarCategoria(); break;
        case 'abrir-subtipos-controle': fecharModal('modal-menu-conta'); await controles.abrirSubtiposControle(); break;
        case 'fechar-subtipos-controle': controles.fecharSubtiposControle(); break;
        case 'salvar-subtipo-controle': await controles.salvarSubtipoControle(); break;

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
        case 'arquivar-documento-atual': await docs.arquivarDocumentoAtual(); break;
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
        case 'abrir-form-ativo': ativos.abrirFormAtivo(); break;
        case 'fechar-form-ativo': ativos.fecharFormAtivo(); break;
        case 'salvar-ativo': await ativos.salvarAtivo(); break;
        case 'abrir-ativo': await ativos.abrirFichaAtivo(id); break;
        case 'voltar-ficha-ativo': ativos.fecharFichaAtivo(); break;
        case 'alternar-mais-acoes-ativo': ativos.alternarMaisAcoesAtivo(); break;
        // 'alternar-historico-ativo' removido (revisão DS, 25/08/2026) —
        // Histórico não é mais opção do Mais ações do box do Ativo.
        case 'excluir-ativo-atual': await ativos.excluirAtivoAtual(); break;
        case 'alternar-editar-ativo': ativos.alternarEditarAtivo(); break;
        case 'salvar-edicao-ativo': await ativos.salvarEdicaoAtivo(); break;
        case 'abrir-gestao-imovel': ativos.abrirGestaoImovel(); break;
        case 'abrir-documentos-ativo': abrirModal('modal-documentos-ativo'); break;
        case 'fechar-documentos-ativo': fecharModal('modal-documentos-ativo'); break;
        case 'abrir-fotos-ativo': abrirModal('modal-fotos-ativo'); break;
        case 'fechar-fotos-ativo': fecharModal('modal-fotos-ativo'); break;
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
        case 'abrir-editar-item': controles.abrirEditarItem(); break;
        case 'fechar-editar-item': controles.fecharEditarItem(); break;
        case 'salvar-edicao-item': await controles.salvarEdicaoItem(); break;
        case 'excluir-item-controle-atual': await controles.excluirItemControleAtual(); break;
        case 'alternar-mais-acoes-contatos-item': controles.alternarMaisAcoesContatosItem(); break;
        case 'alternar-form-contato-item': controles.alternarFormContatoItem(); break;
        case 'salvar-contato-item': await controles.salvarContatoItem(); break;

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
        case 'upload-vinculo-tipo-mudou': await docs.aoMudarTipoVinculoUpload(); break;
        case 'fd-vincular-tipo-mudou': await docs.aoMudarTipoVinculoAgora(); break;
        case 'alternar-vitrine-foto': await ativos.alternarVitrineFoto(alvo.dataset.fotoId, alvo.checked); break;
        case 'ic-tipo-mudou': controles.aoMudarTipoControleForm(); break;
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
        data_vencimento: oc.data_prevista_atual,
        ativoId: oc.cofre_itens_controle?.ativo_id || null,
    };
}

function renderAlertas() {
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

function abrirCriacaoAssistida(imovelId, imovel) {
    imovelPendenteCriacao = { id: imovelId, imovel };
    const endereco = imovel ? `${imovel.endereco_rua}, ${imovel.endereco_num || ''}` : 'este imóvel';
    document.getElementById('criacao-assistida-texto').textContent =
        `Ainda não existe um ativo do Cofre para ${endereco}. Quer criar agora, pra já guardar documentos, alertas e contatos ligados a ele?`;
    abrirModal('modal-criacao-assistida');
}

async function confirmarCriacaoAssistida() {
    if (!imovelPendenteCriacao) return;
    try {
        const novo = await api.criarAtivo({
            cliente_id: estado.clienteId, tipo_ativo: 'imovel',
            nome_exibicao: imovelPendenteCriacao.imovel ? `${imovelPendenteCriacao.imovel.endereco_rua}, ${imovelPendenteCriacao.imovel.endereco_num || ''}` : 'Imóvel',
            status: 'ativo', entidade_origem_tipo: 'imovel', entidade_origem_id: imovelPendenteCriacao.id, criado_por: estado.pessoa.id,
        });
        fecharModal('modal-criacao-assistida');
        estado.ativos = await api.listarAtivos(estado.clienteId);
        mostrarToast('Ativo criado ✅');
        await ativos.abrirFichaAtivo(novo.id);
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
});

window.addEventListener('cofre:montar-home', () => docs.montarHome());

window.addEventListener('cofre:abrir-ativo', (ev) => ativos.abrirFichaAtivo(ev.detail.id));
window.addEventListener('cofre:abrir-documento', (ev) => docs.abrirFichaDocumento(ev.detail.id));

window.addEventListener('cofre:upload-contextual', (ev) => {
    docs.abrirUploadContextual(ev.detail.entidadeTipo, ev.detail.entidadeId, ev.detail.nome);
});

window.addEventListener('cofre:contexto-imovel-sem-ativo', (ev) => abrirCriacaoAssistida(ev.detail.imovelId, ev.detail.imovel));

window.addEventListener('cofre:navegar-contexto', (ev) => nav.abrirContexto(ev.detail.tipo, ev.detail.ref, null));

window.addEventListener('cofre:recarregar-documentos', async () => {
    estado.documentos = await api.listarDocumentos(estado.clienteId);
    docs.montarHome();
    const telaAtual = document.querySelector('[data-screen]:not(.hidden)')?.dataset.screen;
    if (telaAtual === 'home') docs.montarHome();
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
// BOOT
// ============================================================================
nav.bootstrap().catch(err => {
    console.error('Falha no bootstrap do Cofre:', err);
    mostrarToast('Erro inesperado ao carregar o Cofre.', 'erro');
});
