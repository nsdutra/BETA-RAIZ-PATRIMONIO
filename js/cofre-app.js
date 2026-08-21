// ============================================================================
// cofre-app.js — Raiz Patrimônio · Cofre de Documentos
// Versão: 1.1.0 · 19/08/2026
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

// ============================================================================
// DELEGAÇÃO DE CLIQUE — um único listener cobre todo elemento (estático ou
// gerado dinamicamente) com [data-action].
// ============================================================================
document.addEventListener('click', async (ev) => {
    const alvo = ev.target.closest('[data-action]');
    if (!alvo) return;
    const acao = alvo.dataset.action;
    const id = alvo.dataset.id;

    switch (acao) {
        // ---- navegação principal
        case 'ir-home': nav.mudarTela('home'); docs.montarHome(); break;
        case 'ir-ativos': nav.mudarTela('ativos'); ativos.renderAtivosLista(document.getElementById('filtro-ativo-tipo').value, document.getElementById('filtro-ativo-busca').value); break;
        case 'ir-alertas': nav.mudarTela('alertas'); renderAlertas(); break;
        case 'abrir-seletor-modulo': nav.abrirSeletorModulo(); break;
        case 'fechar-modal-generico': fecharModal('modal-generico'); break;

        // ---- busca global / configurações
        case 'abrir-busca-global': docs.abrirBuscaGlobal(); break;
        case 'fechar-busca-global': docs.fecharBuscaGlobal(); break;
        case 'abrir-configuracoes': docs.abrirConfiguracoes(); break;
        case 'fechar-categorias': docs.fecharCategorias(); break;
        case 'salvar-categoria': await docs.salvarCategoria(); break;

        // ---- documentos
        case 'abrir-upload-home': await docs.abrirUploadHome(); break;
        case 'fechar-upload': docs.fecharUpload(); break;
        case 'salvar-upload': await docs.salvarUpload(); break;
        case 'abrir-documento': await docs.abrirFichaDocumento(id); break;
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
        case 'alternar-form-ativo': ativos.alternarFormAtivo(); break;
        case 'salvar-ativo': await ativos.salvarAtivo(); break;
        case 'abrir-ativo': await ativos.abrirFichaAtivo(id); break;
        case 'fechar-ficha-ativo': ativos.fecharFichaAtivo(); break;
        case 'mudar-aba-ativo': ativos.mudarAbaFichaAtivo(alvo.dataset.tabTarget); break;
        case 'alternar-editar-ativo': ativos.alternarEditarAtivo(); break;
        case 'salvar-edicao-ativo': await ativos.salvarEdicaoAtivo(); break;
        case 'abrir-gestao-imovel': ativos.abrirGestaoImovel(); break;
        case 'abrir-upload-no-ativo': ativos.abrirUploadNoAtivo(); break;
        case 'abrir-evento-no-ativo': ativos.abrirEventoNoAtivo(); break;
        case 'abrir-contato-no-ativo': ativos.abrirContatoNoAtivo(); break;
        case 'salvar-contato-no-ativo': await ativos.salvarContatoNoAtivo(); break;

        // ---- alertas
        case 'alternar-form-evento': alternarFormEvento(); break;
        case 'salvar-evento': await salvarEvento(); break;

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
// ALERTAS — tela própria (fora dos módulos de tela porque é pequena e usa
// só api.js diretamente; se crescer, extrair para cofre-alertas.js)
// ============================================================================
function renderAlertas() {
    document.getElementById('alertas-lista').innerHTML = [...estado.eventos]
        .sort((a, b) => (a.data_vencimento || '') > (b.data_vencimento || '') ? 1 : -1)
        .map(docs.alertaCardHtml).join('');
    document.getElementById('alertas-estado-vazio').classList.toggle('hidden', estado.eventos.length !== 0);
    document.getElementById('alertas-lista').classList.toggle('hidden', estado.eventos.length === 0);
    refrescarIcones();
}

let eventoAtivoPreDefinido = null;

function alternarFormEvento() {
    const painel = document.getElementById('form-evento-wrapper');
    const abrindo = painel.classList.contains('hidden');
    painel.classList.toggle('hidden');
    document.getElementById('btn-toggle-evento').classList.toggle('ativo', abrindo);
    if (abrindo) {
        document.getElementById('ev-ativo').innerHTML = '<option value="">(nenhum)</option>' + estado.ativos.map(a => `<option value="${a.id}">${a.nome_exibicao}</option>`).join('');
        if (eventoAtivoPreDefinido) {
            document.getElementById('ev-ativo').value = eventoAtivoPreDefinido;
            document.getElementById('ev-ativo').disabled = true;
        } else {
            document.getElementById('ev-ativo').disabled = false;
        }
    }
}

async function salvarEvento() {
    const titulo = document.getElementById('ev-titulo').value.trim();
    const vencimento = document.getElementById('ev-vencimento').value;
    const statusEl = document.getElementById('ev-status');
    if (!titulo || !vencimento) { statusEl.textContent = '⚠️ Preencha título e vencimento.'; statusEl.style.color = 'var(--danger)'; return; }
    try {
        await api.criarEvento({
            cliente_id: estado.clienteId, ativo_id: document.getElementById('ev-ativo').value || null,
            tipo_evento: document.getElementById('ev-tipo').value, titulo, data_vencimento: vencimento,
            antecedencia_dias: parseInt(document.getElementById('ev-antecedencia').value, 10) || 15,
            status: 'pendente', criado_por: estado.pessoa.id,
        });
        mostrarToast('Alerta cadastrado ✅');
        document.getElementById('ev-titulo').value = '';
        eventoAtivoPreDefinido = null;
        alternarFormEvento();
        estado.eventos = await api.listarEventosPendentes(estado.clienteId);
        renderAlertas();
    } catch (err) { statusEl.textContent = '❌ ' + err.message; statusEl.style.color = 'var(--danger)'; }
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

window.addEventListener('cofre:evento-contextual', (ev) => {
    eventoAtivoPreDefinido = ev.detail.ativoId;
    nav.mudarTela('alertas');
    const painel = document.getElementById('form-evento-wrapper');
    if (painel.classList.contains('hidden')) alternarFormEvento();
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

// ============================================================================
// BOOT
// ============================================================================
nav.bootstrap().catch(err => {
    console.error('Falha no bootstrap do Cofre:', err);
    mostrarToast('Erro inesperado ao carregar o Cofre.', 'erro');
});
