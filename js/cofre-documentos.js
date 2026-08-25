// ============================================================================
// cofre-documentos.js — Raiz Patrimônio · Cofre de Documentos
// Versão: 1.3.1 · 25/08/2026
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
import { estado } from './cofre-estado.js';
import * as api from './cofre-api.js';
import { mostrarToast, abrirModal, fecharModal, refrescarIcones } from './cofre-ui.js';
import {
    escapeHtml, formatarDataBR, formatarBytes, diasAte, chipVencimento,
    classificarStatusVinculo, rotuloStatusVinculo, rotuloTipoAtivo, iconeAtivo,
    BADGE_NEUTRO, BADGE_PENDENTE, BADGE_OK, BADGE_ALERTA,
} from './cofre-validacoes.js';

// D-2 (revisão DS) — helper local: mesma regra que chipStatusVinculoHtml()
// de cofre-ui.js, mas retornando só a classe (as 2 chamadas deste arquivo
// já montam o próprio <span>/<button>). Evita repetir o ternário 2x.
function classeBadgeVinculo(status) {
    return status === 'triagem' ? BADGE_PENDENTE : (status === 'empresa' ? BADGE_NEUTRO : BADGE_OK);
}

let uploadContexto = null; // { entidadeTipo, entidadeId, nome } | null quando livre
let vinculoEscolhidoUpload = null; // { tipo, id, nome } | null (triagem)
let docAtualId = null;
let pularAnaliseIAProximoUpload = false; // true = "Upload simples" (pedido explícito, sem IA)

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
        data_vencimento: oc.data_prevista_atual,
    };
}

export function montarHome() {
    document.getElementById('kpi-total-ativos').textContent = estado.ativos.length;
    document.getElementById('kpi-total-docs').textContent = estado.documentos.length;

    const alertasView = estado.ocorrenciasAbertas.map(ocorrenciaParaAlertaViewHome);
    const vencendo = alertasView.filter(e => { const d = diasAte(e.data_vencimento); return d !== null && d >= 0 && d <= 30; });
    const vencidos = alertasView.filter(e => { const d = diasAte(e.data_vencimento); return d !== null && d < 0; });
    document.getElementById('kpi-vencendo').textContent = vencendo.length;
    document.getElementById('kpi-vencidos').textContent = vencidos.length;

    const emTriagem = estado.documentos.filter(d => classificarStatusVinculo(d.cofre_documento_vinculos) === 'triagem');
    const wrapperTriagem = document.getElementById('home-triagem-wrapper');
    wrapperTriagem.classList.toggle('hidden', emTriagem.length === 0);
    document.getElementById('home-lista-triagem').innerHTML = emTriagem.slice(0, 5).map(docCardCompactoHtml).join('');

    const listaAlertas = [...vencidos, ...vencendo].slice(0, 5);
    document.getElementById('home-lista-alertas').innerHTML = listaAlertas.length
        ? listaAlertas.map(alertaCardHtml).join('')
        : `<p class="text-xs" style="color:var(--sage)">Nenhum vencimento nos próximos 30 dias. 🎉</p>`;

    refrescarIcones();
}

export function alertaCardHtml(e) {
    const dias = diasAte(e.data_vencimento);
    const chip = chipVencimento(dias);
    return `<button data-action="abrir-item-controle" data-id="${e.itemControleId || ''}" class="w-full text-left raiz-bloco-interno flex items-center justify-between gap-2">
        <div class="min-w-0"><p class="text-sm font-semibold truncate">${escapeHtml(e.titulo)}</p><p class="text-xs" style="color:var(--sage)">${formatarDataBR(e.data_vencimento)}</p></div>
        <div class="flex items-center gap-2 flex-shrink-0">
            ${chip ? `<span class="${chip.classe}">${escapeHtml(chip.texto)}</span>` : ''}
            <i data-lucide="chevron-right" style="width:14px;height:14px;color:var(--sage)"></i>
        </div>
    </button>`;
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
// UPLOAD — dois caminhos (prompt corretivo §11)
// ============================================================================
export async function abrirUploadHome() {
    uploadContexto = null;
    vinculoEscolhidoUpload = null;
    document.getElementById('upload-contexto-legenda').textContent = 'Sem contexto pré-definido — escolha onde este documento se encaixa, ou deixe em triagem.';
    document.getElementById('up-vinculo-travado').classList.add('hidden');
    document.getElementById('up-vinculo-livre').classList.remove('hidden');
    document.getElementById('up-vinculo-tipo').value = 'triagem';
    document.getElementById('up-vinculo-candidatos').innerHTML = '';
    document.getElementById('up-vinculo-busca').classList.add('hidden');
    await preencherCategoriasSelect();
    limparFormularioUpload();
    document.getElementById('up-restrito-wrapper').classList.toggle('hidden', !['master', 'admin'].includes(estado.pessoa.perfil));
    abrirModal('modal-upload');
}

// Upload contextual — chamado de dentro da ficha do ativo OU de um deep
// link contexto=contrato|pagamento vindo de Imóveis. Vínculo já vem
// preenchido e TRAVADO (prompt corretivo §11-A: "NÃO perguntar de novo").
export async function abrirUploadNoAtivoComIA(ativo) {
    if (!ativo) return;
    pularAnaliseIAProximoUpload = false;
    await abrirUploadContextual('ativo', ativo.id, ativo.nome_exibicao);
}

export async function abrirUploadNoAtivoSemIA(ativo) {
    if (!ativo) return;
    pularAnaliseIAProximoUpload = true;
    await abrirUploadContextual('ativo', ativo.id, ativo.nome_exibicao);
}

export async function abrirUploadContextual(entidadeTipo, entidadeId, nomeExibido) {
    uploadContexto = { entidadeTipo, entidadeId, nome: nomeExibido || null };
    vinculoEscolhidoUpload = { tipo: entidadeTipo, id: entidadeId, nome: nomeExibido || rotuloEntidadeTipo(entidadeTipo) };

    document.getElementById('upload-contexto-legenda').textContent = `Este documento já sai vinculado a: ${nomeExibido || rotuloEntidadeTipo(entidadeTipo)}.${pularAnaliseIAProximoUpload ? ' Upload simples — sem análise por IA.' : ' Com análise por IA após salvar.'}`;
    document.getElementById('up-vinculo-travado').classList.remove('hidden');
    document.getElementById('up-vinculo-travado').innerHTML = `<i data-lucide="link" style="width:14px;height:14px;display:inline"></i> ${escapeHtml(nomeExibido || rotuloEntidadeTipo(entidadeTipo))}`;
    document.getElementById('up-vinculo-livre').classList.add('hidden');

    await preencherCategoriasSelect();
    limparFormularioUpload();
    document.getElementById('up-restrito-wrapper').classList.toggle('hidden', !['master', 'admin'].includes(estado.pessoa.perfil));
    abrirModal('modal-upload');
    refrescarIcones();
}

function rotuloEntidadeTipo(t) {
    return { ativo: 'Ativo', imovel: 'Imóvel', contrato: 'Contrato', pagamento: 'Pagamento', empresa: 'Empresa' }[t] || t;
}

function limparFormularioUpload() {
    ['up-arquivo', 'up-nome', 'up-descricao', 'up-data-documento', 'up-validade'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    document.getElementById('up-arquivo-info').textContent = '';
    document.getElementById('up-status').textContent = '';
    document.getElementById('up-restrito').checked = false;
}

async function preencherCategoriasSelect() {
    document.getElementById('up-categoria').innerHTML = estado.categorias.map(c => `<option value="${c.id}">${escapeHtml(c.nome)}</option>`).join('');
}

export function fecharUpload() {
    fecharModal('modal-upload');
}

export function aoSelecionarArquivoUpload() {
    const f = document.getElementById('up-arquivo').files[0];
    if (!f) return;
    const LIMITE = 25 * 1024 * 1024;
    const infoEl = document.getElementById('up-arquivo-info');
    if (f.size > LIMITE) {
        infoEl.textContent = '⚠️ Arquivo maior que 25MB.';
        infoEl.style.color = 'var(--danger)';
        document.getElementById('up-arquivo').value = '';
        return;
    }
    infoEl.textContent = `${f.name} · ${formatarBytes(f.size)}`;
    infoEl.style.color = 'var(--sage)';
    if (!document.getElementById('up-nome').value) document.getElementById('up-nome').value = f.name.replace(/\.[^.]+$/, '');
}

// Troca de tipo de vínculo no upload livre — mostra busca de candidato
// quando aplicável (prompt corretivo §19.3, mas aqui no App, não no bot)
export async function aoMudarTipoVinculoUpload() {
    const tipo = document.getElementById('up-vinculo-tipo').value;
    const buscaEl = document.getElementById('up-vinculo-busca');
    const candidatosEl = document.getElementById('up-vinculo-candidatos');
    vinculoEscolhidoUpload = tipo === 'triagem' ? null : (tipo === 'empresa' ? { tipo: 'empresa', id: null, nome: 'Empresa (geral)' } : null);
    candidatosEl.innerHTML = '';
    if (tipo === 'ativo' || tipo === 'imovel') {
        buscaEl.classList.remove('hidden');
        buscaEl.value = '';
        buscaEl.placeholder = tipo === 'ativo' ? 'Digite o nome do ativo…' : 'Digite o endereço…';
        buscaEl.oninput = debounce(() => buscarCandidatosUpload(tipo, buscaEl.value), 250);
    } else {
        buscaEl.classList.add('hidden');
    }
}

function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

async function buscarCandidatosUpload(tipo, termo) {
    const el = document.getElementById('up-vinculo-candidatos');
    if (!termo || termo.trim().length < 2) { el.innerHTML = ''; return; }
    const candidatos = tipo === 'ativo' ? await api.buscarCandidatosAtivo(estado.clienteId, termo) : await api.buscarCandidatosImovel(estado.clienteId, termo);
    if (candidatos.length === 0) { el.innerHTML = `<p class="text-xs" style="color:var(--sage)">Nada encontrado. Você pode salvar em triagem e resolver depois.</p>`; return; }
    el.innerHTML = candidatos.map(c => {
        const nome = tipo === 'ativo' ? c.nome_exibicao : `${c.endereco_rua}, ${c.endereco_num || ''}`;
        return `<button type="button" data-action="escolher-candidato-upload" data-tipo="${tipo}" data-id="${c.id}" data-nome="${escapeHtml(nome)}" class="w-full text-left text-xs border-2 border-slate-200 rounded-lg p-2 hover:border-emerald-700">${escapeHtml(nome)}</button>`;
    }).join('');
}

export function escolherCandidatoUpload(tipo, id, nome) {
    vinculoEscolhidoUpload = { tipo, id, nome };
    document.getElementById('up-vinculo-candidatos').innerHTML = `<div class="raiz-bloco-interno text-xs flex items-center justify-between"><span>✅ ${escapeHtml(nome)}</span></div>`;
    document.getElementById('up-vinculo-busca').classList.add('hidden');
}

export async function salvarUpload() {
    const arquivo = document.getElementById('up-arquivo').files[0];
    const nome = document.getElementById('up-nome').value.trim();
    const categoriaId = document.getElementById('up-categoria').value;
    const statusEl = document.getElementById('up-status');

    if (!arquivo) return marcarErroUpload('Selecione um arquivo.');
    if (!nome) return marcarErroUpload('Informe o nome de exibição.');
    if (!categoriaId) return marcarErroUpload('Selecione uma categoria.');

    statusEl.style.color = 'var(--sage)';
    statusEl.textContent = 'Calculando hash e enviando arquivo…';

    const hash = await api.calcularHashSha256(arquivo);
    if (hash && estado.documentos.some(d => d.hash_sha256 === hash)) {
        const existente = estado.documentos.find(d => d.hash_sha256 === hash);
        if (!confirm(`Este arquivo parece idêntico a "${existente.nome_exibicao}", já cadastrado. Enviar mesmo assim?`)) { statusEl.textContent = ''; return; }
    }

    const documentoId = crypto.randomUUID();
    const storagePath = api.montarStoragePath(estado.clienteId, documentoId, arquivo.name);

    try {
        await api.uploadArquivoDocumento(storagePath, arquivo);
    } catch (err) {
        statusEl.textContent = '❌ Falha no upload: ' + err.message;
        statusEl.style.color = 'var(--danger)';
        return;
    }

    const tags = []; // campo de tags livre removido da v1.1.0 do modal (mantido no schema) — pode ser reintroduzido sem migration
    const nivelAcesso = document.getElementById('up-restrito').checked ? 'restrito' : 'empresa';

    let docInserido;
    try {
        docInserido = await api.inserirDocumento({
            id: documentoId, cliente_id: estado.clienteId, nome_original: arquivo.name, nome_exibicao: nome,
            bucket: 'cofre-documentos', storage_path: storagePath, mime_type: arquivo.type, extensao: (arquivo.name.split('.').pop() || '').toLowerCase(),
            tamanho_bytes: arquivo.size, hash_sha256: hash, categoria_id: categoriaId,
            descricao: document.getElementById('up-descricao').value.trim() || null, tags,
            data_documento: document.getElementById('up-data-documento').value || null,
            validade_em: document.getElementById('up-validade').value || null,
            nivel_acesso: nivelAcesso, origem: 'app', status: 'ativo', criado_por: estado.pessoa.id,
        });
    } catch (err) {
        await api.removerArquivoDocumento(storagePath);
        statusEl.textContent = '❌ Falha ao salvar metadados (upload desfeito): ' + err.message;
        statusEl.style.color = 'var(--danger)';
        return;
    }

    if (vinculoEscolhidoUpload) {
        try {
            await api.inserirVinculo(estado.clienteId, documentoId, vinculoEscolhidoUpload.tipo, vinculoEscolhidoUpload.id, true, estado.pessoa.id);
        } catch (err) {
            mostrarToast('Documento salvo, mas o vínculo falhou: ' + err.message, 'aviso');
        }
    }

    await api.registrarLogAcessos(estado.clienteId, estado.pessoa.id, 'cofre.upload', {
        documento_id: documentoId, nome, categoria_id: categoriaId,
        ativoId: vinculoEscolhidoUpload?.tipo === 'ativo' ? vinculoEscolhidoUpload.id : undefined,
    });

    mostrarToast('Documento salvo no Cofre ✅');
    fecharUpload();
    window.dispatchEvent(new CustomEvent('cofre:recarregar-documentos'));

    // FASE 2 (20/08/2026) — dispara a análise por IA depois de salvar. Não
    // bloqueia nem atrasa o "documento salvo" acima — roda em segundo
    // plano e só abre um modal se encontrar algo útil pra sugerir.
    // v1.1.1 (24/08/2026) — "Upload simples" (pedido explícito) pula essa
    // análise; "Com IA" mantém o comportamento de sempre.
    if (!pularAnaliseIAProximoUpload) {
        analisarAposUpload(documentoId, !!vinculoEscolhidoUpload);
    }
    pularAnaliseIAProximoUpload = false;
}

function marcarErroUpload(msg) {
    const el = document.getElementById('up-status');
    el.textContent = '⚠️ ' + msg;
    el.style.color = 'var(--danger)';
}

// ============================================================================
// FASE 2 — análise por IA após o upload (20/08/2026)
// ============================================================================
let sugestaoIaAtual = null; // { documentoId, resultado, vinculoJaDefinido }

async function analisarAposUpload(documentoId, vinculoJaDefinido) {
    let resposta;
    try {
        resposta = await api.analisarDocumentoComIA(documentoId);
    } catch (err) {
        console.warn('Análise por IA não disponível para este documento:', err.message);
        return;
    }
    if (!resposta?.analisado || !resposta.resultado) return;

    const r = resposta.resultado;
    const temAlgoUtil = r.categoriaSugerida || (!vinculoJaDefinido && r.candidatosVinculo.length > 0) || r.alertasSugeridos[0] || r.contatosSugeridos[0];
    if (!temAlgoUtil) return;

    sugestaoIaAtual = { documentoId, resultado: r, vinculoJaDefinido };
    montarModalSugestoesIA();
    abrirModal('modal-sugestoes-ia');
}

function montarModalSugestoesIA() {
    const { resultado: r, vinculoJaDefinido } = sugestaoIaAtual;
    document.getElementById('sug-tipo-detectado').textContent = r.tipoDocumentoDetectado;

    const categoriaExiste = r.categoriaSugerida && estado.categorias.some(c => c.nome.toLowerCase() === r.categoriaSugerida.toLowerCase());
    document.getElementById('sug-categoria-bloco').classList.toggle('hidden', !categoriaExiste);
    if (categoriaExiste) document.getElementById('sug-categoria-nome').textContent = r.categoriaSugerida;

    const vinculoBloco = document.getElementById('sug-vinculo-bloco');
    const mostrarVinculo = !vinculoJaDefinido && r.candidatosVinculo.length > 0;
    vinculoBloco.classList.toggle('hidden', !mostrarVinculo);
    if (mostrarVinculo) {
        document.getElementById('sug-vinculo-opcoes').innerHTML = r.candidatosVinculo.map((c, i) => `
            <label class="flex items-center gap-2 text-sm raiz-bloco-interno">
                <input type="radio" name="sug-vinculo" value="${i}" ${i === 0 ? 'checked' : ''}> ${escapeHtml(c.nome)} <span class="text-xs" style="color:var(--sage)">(${c.tipo})</span>
            </label>`).join('') + `
            <label class="flex items-center gap-2 text-sm raiz-bloco-interno">
                <input type="radio" name="sug-vinculo" value="nenhum"> Nenhum — deixar em triagem
            </label>`;
    }

    // v6: sugestão de alerta pela IA não vira mais evento avulso (ver nota em
    // aplicarSugestoesIA) — bloco escondido até termos um fluxo real de
    // "criar item de controle a partir da sugestão".
    document.getElementById('sug-alerta-bloco').classList.add('hidden');

    const contato = r.contatosSugeridos[0];
    document.getElementById('sug-contato-bloco').classList.toggle('hidden', !contato?.nome);
    if (contato?.nome) {
        document.getElementById('sug-contato-texto').textContent = contato.nome + (contato.telefone ? ` · ${contato.telefone}` : '');
    }

    document.getElementById('sug-status').textContent = '';
}

export function ignorarSugestoesIA() {
    fecharModal('modal-sugestoes-ia');
    sugestaoIaAtual = null;
}

export async function aplicarSugestoesIA() {
    if (!sugestaoIaAtual) return;
    const { documentoId, resultado: r } = sugestaoIaAtual;
    const statusEl = document.getElementById('sug-status');
    statusEl.textContent = 'Aplicando…';
    statusEl.style.color = 'var(--sage)';

    try {
        if (document.getElementById('sug-aplicar-categoria')?.checked && !document.getElementById('sug-categoria-bloco').classList.contains('hidden')) {
            const cat = estado.categorias.find(c => c.nome.toLowerCase() === r.categoriaSugerida.toLowerCase());
            if (cat) await api.atualizarDocumento(documentoId, { categoria_id: cat.id, data_documento: r.dataDocumento, validade_em: r.validadeEm });
        } else if (r.dataDocumento || r.validadeEm) {
            await api.atualizarDocumento(documentoId, { data_documento: r.dataDocumento, validade_em: r.validadeEm });
        }

        if (!document.getElementById('sug-vinculo-bloco').classList.contains('hidden')) {
            const escolhaRadio = document.querySelector('input[name="sug-vinculo"]:checked')?.value;
            if (escolhaRadio && escolhaRadio !== 'nenhum') {
                const c = r.candidatosVinculo[parseInt(escolhaRadio, 10)];
                await api.inserirVinculo(estado.clienteId, documentoId, c.tipo, c.id, true, estado.pessoa.id);
            }
        }

        // v6: sugestão de alerta pela IA não cria mais evento avulso (tabela
        // cofre_eventos removida) — alertas agora só existem via Item de
        // Controle. Checkbox "aplicar alerta" desativada no formulário (ver
        // montarModalSugestoesIA) até termos um fluxo de "criar item de
        // controle a partir da sugestão da IA" (pendente).

        const contato = r.contatosSugeridos[0];
        if (document.getElementById('sug-aplicar-contato')?.checked && contato?.nome) {
            await api.criarContato({
                cliente_id: estado.clienteId, documento_id: documentoId, papel: contato.papel || 'outro',
                nome: contato.nome, telefone: contato.telefone, email: contato.email,
            });
        }

        mostrarToast('Sugestões aplicadas ✅');
        fecharModal('modal-sugestoes-ia');
        sugestaoIaAtual = null;
        window.dispatchEvent(new CustomEvent('cofre:recarregar-documentos'));
        window.dispatchEvent(new CustomEvent('cofre:recarregar-ativos'));
        window.dispatchEvent(new CustomEvent('cofre:recarregar-contatos'));
    } catch (err) {
        statusEl.textContent = '❌ ' + err.message;
        statusEl.style.color = 'var(--danger)';
    }
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
    if (tipo === 'ativo' || tipo === 'imovel') {
        buscaEl.classList.remove('hidden');
        buscaEl.value = '';
        buscaEl.oninput = debounce(async () => {
            const termo = buscaEl.value;
            if (termo.trim().length < 2) { document.getElementById('fd-va-candidatos').innerHTML = ''; return; }
            const candidatos = tipo === 'ativo' ? await api.buscarCandidatosAtivo(estado.clienteId, termo) : await api.buscarCandidatosImovel(estado.clienteId, termo);
            document.getElementById('fd-va-candidatos').innerHTML = candidatos.map(c => {
                const nome = tipo === 'ativo' ? c.nome_exibicao : `${c.endereco_rua}, ${c.endereco_num || ''}`;
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

    document.getElementById('fd-nome').textContent = d.nome_exibicao;

    const statusVinculo = classificarStatusVinculo(d.cofre_documento_vinculos);
    const cat = estado.categorias.find(c => c.id === d.categoria_id);
    document.getElementById('fd-contexto-label').textContent = cat ? cat.nome : 'Sem categoria';

    const dias = diasAte(d.validade_em);
    const chip = chipVencimento(dias);
    let chips = `<span class="${classeBadgeVinculo(statusVinculo)}">${escapeHtml(rotuloStatusVinculo(statusVinculo))}</span>`;
    if (d.nivel_acesso === 'restrito') chips += `<span class="${BADGE_ALERTA}">Restrito</span>`;
    if (chip) chips += `<span class="${chip.classe}">${escapeHtml(chip.texto)}</span>`;
    document.getElementById('fd-chips').innerHTML = chips;

    document.getElementById('fd-meta').innerHTML = `
        <p><strong>Enviado em:</strong> ${formatarDataBR((d.criado_em || '').slice(0, 10))}</p>
        <p><strong>Tamanho:</strong> ${formatarBytes(d.tamanho_bytes)}</p>
        <p><strong>Origem:</strong> ${d.origem === 'bot_whatsapp' ? 'WhatsApp' : 'App'}</p>
        ${d.descricao ? `<p><strong>Descrição:</strong> ${escapeHtml(d.descricao)}</p>` : ''}
    `;

    const vincs = d.cofre_documento_vinculos || [];
    const emTriagem = vincs.length === 0;
    document.getElementById('fd-vincular-agora-wrapper').classList.toggle('hidden', !emTriagem);
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
    try {
        const url = await api.gerarSignedUrl(d.bucket, d.storage_path, 120);
        window.open(url, '_blank');
        await api.registrarLogAcessos(estado.clienteId, estado.pessoa.id, 'cofre.baixar', { documento_id: d.id });
    } catch (err) {
        mostrarToast('Erro ao gerar link de download: ' + err.message, 'erro');
    }
}

export async function arquivarDocumentoAtual() {
    if (!confirm('Arquivar este documento?')) return;
    try {
        await api.atualizarDocumento(docAtualId, { status: 'arquivado' });
        mostrarToast('Documento arquivado.');
        fecharFichaDoc();
        window.dispatchEvent(new CustomEvent('cofre:recarregar-documentos'));
    } catch (err) { mostrarToast('Erro: ' + err.message, 'erro'); }
}

export async function excluirDocumentoAtual() {
    if (!confirm('Excluir este documento? Esta ação fica registrada e não pode ser desfeita pela interface.')) return;
    const d = estado.documentos.find(x => x.id === docAtualId);
    try {
        await api.atualizarDocumento(docAtualId, { status: 'excluido', excluido_em: new Date().toISOString(), excluido_por: estado.pessoa.id });
        await api.registrarLogAcessos(estado.clienteId, estado.pessoa.id, 'cofre.excluir', { documento_id: docAtualId, nome: d?.nome_exibicao });
        mostrarToast('Documento excluído.');
        fecharFichaDoc();
        window.dispatchEvent(new CustomEvent('cofre:recarregar-documentos'));
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
    } catch (err) { mostrarToast('Erro: ' + err.message, 'erro'); }
}

function renderizarCategorias() {
    document.getElementById('categorias-lista').innerHTML = estado.categorias.map(c =>
        `<div class="raiz-bloco-interno flex items-center justify-between"><span class="text-sm">${escapeHtml(c.nome)}</span><span class="text-xs" style="color:var(--sage)">${escapeHtml(c.grupo || '')}</span></div>`
    ).join('') || `<p class="text-xs" style="color:var(--sage)">Nenhuma categoria.</p>`;
}
