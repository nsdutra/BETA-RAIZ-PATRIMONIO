// ============================================================================
// cofre-documentos.js — Raiz Patrimônio · Cofre de Documentos
// Versão: 2.0.0 · 09/09/2026
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
export const VERSAO = '2.0.0'; // v-check (06/09/2026): lido por Dev › Versões — manter igual ao header
import { estado } from './cofre-estado.js';
import * as api from './cofre-api.js';
import { mostrarToast, abrirModal, fecharModal, refrescarIcones } from './cofre-ui.js';
import {
    escapeHtml, formatarDataBR, formatarBytes, diasAte, chipVencimento,
    classificarStatusVinculo, rotuloStatusVinculo, rotuloTipoAtivo, iconeAtivo, rotuloTipoControle,
    BADGE_NEUTRO, BADGE_PENDENTE, BADGE_OK, BADGE_ALERTA, numeroWhatsAppComDDI,
} from './cofre-validacoes.js';

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
    if (!document.getElementById('kpi-total-ativos')) return;

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

// Revisão de design (25/08/2026, pedido explícito) — igualar 1:1 ao
// padrão "Atenção necessária" da Visão Geral do Imóveis (index.html
// #geral-atencao-lista): mesmo box de ícone (w-9 h-9 rounded-lg),
// mesma tipografia (título text-xs font-bold, legenda text-[11px]
// text-slate-500), mesmo chevron (#94a3b8), mesma borda
// (border-slate-200, rounded-xl, p-2.5). O ícone agora representa o
// TIPO DO ATIVO (mesmo glyph usado na aba Ativos — iconeAtivo()), não
// mais um selo genérico de vencimento. Badge "Vence em Xd" + data
// numa linha separada viraram UMA frase só (fraseVencimento()).
function fraseVencimento(dataVencimento, dias) {
    const dataFmt = formatarDataBR(dataVencimento);
    if (dias === null || dias === undefined) return `Vencimento: ${dataFmt}`;
    if (dias < 0) { const d = Math.abs(dias); return `Vencimento: ${dataFmt} · Venceu há ${d} dia${d === 1 ? '' : 's'}!`; }
    if (dias === 0) return `Vencimento: ${dataFmt} · Vence hoje!`;
    return `Vencimento: ${dataFmt} · Falta${dias === 1 ? '' : 'm'} ${dias} dia${dias === 1 ? '' : 's'}!`;
}

function corFraseVencimento(dias) {
    if (dias === null || dias === undefined) return 'text-slate-500';
    if (dias < 0) return 'text-red-700';
    if (dias <= 30) return 'text-amber-700';
    return 'text-slate-500';
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
        mostrarToast('Nenhum contato vinculado a este item ainda. Adicione um na ficha do item (Mais ações → Adicionar contato).', 'aviso');
        return;
    }
    const contato = contatos.find(c => c.whatsapp) || contatos.find(c => c.email) || contatos[0];
    const descricaoItem = tipo ? `${titulo} (${rotuloTipoControle(tipo)})` : titulo;
    const mensagem = `Olá! Poderia nos enviar uma cotação atualizada para a renovação do item de controle "${descricaoItem}"? Obrigado!`;

    if (contato.whatsapp) {
        // BUG FIX (25/08/2026) — ver mesma correção em acionarContatoItemDireto
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
let subtiposControle = null;   // cofre_controle_subtipos global + cliente (padrões de ocorrência)

function podeIA() { return window.podeUsar ? window.podeUsar('cofre.analisar_ia').ok : true; }
function podeControlar() { return window.podeUsar ? window.podeUsar('cofre.controles.criar').ok : true; }

export async function abrirUploadHome() { await abrirPickerUpload(null, true); }
export async function abrirUploadNoAtivoComIA(ativo) { if (ativo) await abrirPickerUpload({ entidadeTipo: 'ativo', entidadeId: ativo.id, nome: ativo.nome_exibicao, tipoAtivo: ativo.tipo_ativo }, true); }
export async function abrirUploadNoAtivoSemIA(ativo) { if (ativo) await abrirPickerUpload({ entidadeTipo: 'ativo', entidadeId: ativo.id, nome: ativo.nome_exibicao, tipoAtivo: ativo.tipo_ativo }, false); }
export async function abrirUploadContextualComFlag(entidadeTipo, entidadeId, nomeExibido, comIA) { await abrirPickerUpload({ entidadeTipo, entidadeId, nome: nomeExibido }, !!comIA); }
export async function abrirUploadContextual(entidadeTipo, entidadeId, nomeExibido) { await abrirPickerUpload({ entidadeTipo, entidadeId, nome: nomeExibido }, true); }

function rotuloEntidadeTipo(t) {
    return { ativo: 'Ativo', imovel: 'Imóvel', contrato: 'Contrato', pagamento: 'Pagamento', empresa: 'Empresa', item_controle: 'Item de controle' }[t] || t;
}

async function abrirPickerUpload(contexto, comIA) {
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
    abrirModal('modal-upload');
    refrescarIcones();
}

export function fecharUpload() { fecharModal('modal-upload'); }
export function escolherArquivoUpload() { document.getElementById('up-arquivo').click(); }
export function escolherCameraUpload() { document.getElementById('up-camera').click(); }

export async function aoSelecionarArquivoUpload(inputId = 'up-arquivo') {
    const f = document.getElementById(inputId).files[0];
    if (!f || !up) return;
    const statusEl = document.getElementById('up-status');
    if (f.size > LIMITE_ARQUIVO) { statusEl.textContent = '⚠️ Arquivo maior que 25MB.'; statusEl.style.color = 'var(--danger)'; document.getElementById(inputId).value = ''; return; }
    up.arquivo = f;
    up.comIA = document.getElementById('up-com-ia').checked && podeIA();
    await processarArquivoUpload();
}

async function processarArquivoUpload() {
    const statusEl = document.getElementById('up-status');
    const f = up.arquivo;
    statusEl.style.color = 'var(--sage)';
    statusEl.textContent = 'Enviando arquivo…';

    up.hash = await api.calcularHashSha256(f);
    if (up.hash && estado.documentos.some(d => d.hash_sha256 === up.hash)) {
        const existente = estado.documentos.find(d => d.hash_sha256 === up.hash);
        if (!confirm(`Este arquivo parece idêntico a "${existente.nome_exibicao}", já cadastrado. Enviar mesmo assim?`)) { statusEl.textContent = ''; return; }
    }
    up.documentoId = crypto.randomUUID();
    up.storagePath = api.montarStoragePath(estado.clienteId, up.documentoId, f.name);
    try {
        await api.uploadArquivoDocumento(up.storagePath, f);
    } catch (err) {
        statusEl.textContent = '❌ Falha no upload: ' + err.message; statusEl.style.color = 'var(--danger)'; return;
    }

    if (up.comIA && MIMES_IA.includes(f.type)) {
        statusEl.style.color = 'var(--brass, #b8860b)';
        statusEl.textContent = '✨ Lendo o documento com IA…';
        try {
            const resp = await api.analisarArquivoComIA(up.storagePath, f.type);
            if (resp?.analisado && resp.resultado) up.ia = resp.resultado;
            else mostrarToast(resp?.motivo || resp?.erro || 'A IA não conseguiu ler — preencha manualmente.', 'aviso');
            if (resp?.avisoLimite) mostrarToast(resp.avisoLimite, 'aviso');
        } catch (err) {
            console.warn('IA indisponível neste upload:', err.message);
            mostrarToast('IA indisponível agora — preencha manualmente.', 'aviso');
        }
    } else if (up.comIA) {
        mostrarToast('Word/Excel não passam pela IA — preencha os dados.', 'aviso');
    }

    try { await carregarApoioUpload(); } catch (err) { console.warn('apoio do upload:', err.message); }
    fecharModal('modal-upload');
    montarConfirmacaoUpload();
    abrirModal('modal-confirmar-upload');
    refrescarIcones();
}

async function carregarApoioUpload() {
    if (!estado.categorias?.length) estado.categorias = await api.listarCategorias(estado.clienteId);
    if (!gabaritoCategorias) gabaritoCategorias = await api.listarCategoriasGabarito();
    if (!subtiposControle) subtiposControle = await api.listarSubtiposControle(estado.clienteId);
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

function vinculoPermiteControle() {
    return !!up?.vinculo && (up.vinculo.tipo === 'ativo' || up.vinculo.tipo === 'contrato');
}

function montarConfirmacaoUpload() {
    const r = up.ia;
    const g = id => document.getElementById(id);
    g('uc-titulo').innerHTML = r ? '<i data-lucide="sparkles" style="width:16px;height:16px;color:var(--warning)"></i> Confira o que a IA leu' : 'Dados do documento';
    g('uc-tipo').textContent = r ? `${r.tipoDocumentoDetectado}${r.confianca === 'baixa' ? ' · leitura incerta, confira com atenção' : ''}` : `${up.arquivo.name} · ${formatarBytes(up.arquivo.size)}`;
    g('uc-resumo').classList.toggle('hidden', !r?.resumo);
    g('uc-resumo').textContent = r?.resumo || '';
    g('uc-status').textContent = '';

    // categorias: grupo › nome (optgroup por grupo)
    const cats = (estado.categorias || []).filter(c => c.ativo !== false);
    const grupos = {};
    cats.forEach(c => { const gr = c.grupo || 'outros'; (grupos[gr] = grupos[gr] || []).push(c); });
    g('uc-categoria').innerHTML = Object.keys(grupos).sort().map(gr =>
        `<optgroup label="${escapeHtml(rotuloGrupo(gr))}">${grupos[gr].map(c => `<option value="${c.id}">${escapeHtml(c.nome)}</option>`).join('')}</optgroup>`).join('');
    let catSugerida = null;
    if (r?.categoriaCodigoSugerido) catSugerida = cats.find(c => c.codigo === r.categoriaCodigoSugerido);
    if (!catSugerida && r?.categoriaSugerida) catSugerida = cats.find(c => c.nome.toLowerCase() === r.categoriaSugerida.toLowerCase());
    if (!catSugerida) catSugerida = cats.find(c => c.codigo === 'outros.outros') || cats[0];
    if (catSugerida) g('uc-categoria').value = catSugerida.id;

    g('uc-nome').value = r?.nomeSugerido || up.arquivo.name.replace(/\.[^.]+$/, '');
    g('uc-descricao').value = '';
    g('uc-data-documento').value = r?.dataDocumento || '';
    g('uc-validade').value = r?.validadeEm || '';
    g('uc-vig-inicio').value = r?.vigenciaInicio || '';
    g('uc-vig-fim').value = r?.vigenciaFim || '';
    g('uc-vigencia-bloco').classList.toggle('hidden', !(r?.vigenciaInicio || r?.vigenciaFim));

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
            g('up-vinculo-ia').innerHTML = cands.map((c, i) => `
                <label class="flex items-center gap-2 text-sm raiz-bloco-interno"><input type="radio" name="uc-vinculo-ia" value="${i}" data-action-change="uc-vinculo-ia-mudou" ${i === 0 ? 'checked' : ''}> ${escapeHtml(c.nome)} <span class="text-xs" style="color:var(--sage)">(${c.tipo === 'imovel' ? 'imóvel' : 'ativo'})</span></label>`).join('') + `
                <label class="flex items-center gap-2 text-sm raiz-bloco-interno"><input type="radio" name="uc-vinculo-ia" value="outro" data-action-change="uc-vinculo-ia-mudou"> Outro — escolher abaixo</label>`;
            up.vinculo = { tipo: cands[0].tipo, id: cands[0].id, nome: cands[0].nome };
            g('up-vinculo-livre').classList.add('hidden');
        }
    }

    // contatos
    const contatos = (r?.contatosSugeridos || []).filter(c => c?.nome);
    g('uc-contatos-bloco').classList.toggle('hidden', !contatos.length);
    g('uc-contatos-lista').innerHTML = contatos.map((c, i) => `
        <label class="flex items-center gap-2 text-sm raiz-bloco-interno"><input type="checkbox" class="uc-contato" value="${i}" checked> ${escapeHtml(c.nome)} <span class="text-xs" style="color:var(--sage)">${escapeHtml(c.papel || 'outro')}${c.telefone ? ' · ' + escapeHtml(c.telefone) : ''}</span></label>`).join('');

    g('up-restrito').checked = false;
    g('up-restrito-wrapper').classList.toggle('hidden', !(window.podeUsar ? window.podeUsar('cofre.ver_restrito').ok : false));

    aplicarPadroesCategoriaUpload(true);
}

function rotuloGrupo(gr) {
    return { imovel: 'Imóvel', contrato: 'Contrato', financeiro: 'Financeiro', societario: 'Societário', operacional: 'Operacional', veiculo: 'Veículo', vida: 'Vida e proteção', outros: 'Outros' }[gr] || gr;
}

// Troca de categoria (ou 1ª montagem): aplica os padrões parametrizados —
// manter arquivo e controlar vencimento — e pré-preenche o bloco de controle.
export function aplicarPadroesCategoriaUpload(primeira = false) {
    if (!up) return;
    const g = id => document.getElementById(id);
    up.padroes = padroesDaCategoria(g('uc-categoria').value);
    g('uc-manter-arquivo').checked = !!up.padroes.manterArquivo;
    const permite = vinculoPermiteControle() && podeControlar();
    const chk = g('uc-controlar');
    chk.disabled = !permite;
    g('uc-controlar-hint').textContent = !podeControlar() ? 'Controle de vencimento indisponível no seu plano.'
        : !vinculoPermiteControle() ? 'Vincule a um ativo ou contrato pra controlar o vencimento.'
        : 'Cria um item de controle com alerta no WhatsApp.';
    const dataFim = g('uc-vig-fim').value || g('uc-validade').value;
    chk.checked = permite && !!up.padroes.controleTipo && !!dataFim;
    g('uc-controle-bloco').classList.toggle('hidden', !chk.checked);
    if (up.padroes.controleTipo) g('uc-ctl-tipo').value = up.padroes.controleTipo;
    preencherSubtiposControleUpload(up.padroes.controleSubtipoId);
    g('uc-ctl-titulo').value = g('uc-nome').value;
    g('uc-ctl-data-inicio').value = g('uc-vig-inicio').value || g('uc-data-documento').value || new Date().toISOString().slice(0, 10);
    g('uc-ctl-data-fim').value = dataFim || '';
    aplicarPadraoSubtipoUpload();
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
        const compat = lista.filter(s => !s.tipo_ativo_aplicavel?.length || s.tipo_ativo_aplicavel.includes(tipoAtivo));
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
    if (tipo === 'ativo' || tipo === 'imovel') {
        buscaEl.classList.remove('hidden');
        buscaEl.value = '';
        buscaEl.placeholder = tipo === 'ativo' ? 'Digite o nome do ativo…' : 'Digite o endereço…';
        buscaEl.oninput = debounce(() => buscarCandidatosUpload(tipo, buscaEl.value), 250);
    } else {
        buscaEl.classList.add('hidden');
    }
    aplicarPadroesCategoriaUpload();
}

function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

async function buscarCandidatosUpload(tipo, termo) {
    const el = document.getElementById('up-vinculo-candidatos');
    if (!termo || termo.trim().length < 2) { el.innerHTML = ''; return; }
    const candidatos = tipo === 'ativo' ? await api.buscarCandidatosAtivo(estado.clienteId, termo) : await api.buscarCandidatosImovel(estado.clienteId, termo);
    if (candidatos.length === 0) { el.innerHTML = `<p class="text-xs" style="color:var(--sage)">Nada encontrado. Você pode salvar em triagem e resolver depois.</p>`; return; }
    el.innerHTML = candidatos.map(c => {
        const nome = tipo === 'ativo' ? c.nome_exibicao : `${c.endereco_rua}, ${c.endereco_num || ''}`;
        return `<button type="button" data-action="escolher-candidato-upload" data-tipo="${tipo}" data-id="${c.id}" data-nome="${escapeHtml(nome)}" data-tipo-ativo="${escapeHtml(c.tipo_ativo || '')}" class="w-full text-left text-xs border-2 border-slate-200 rounded-lg p-2 hover:border-emerald-700">${escapeHtml(nome)}</button>`;
    }).join('');
}

export function escolherCandidatoUpload(tipo, id, nome, tipoAtivo) {
    up.vinculo = { tipo, id, nome };
    if (tipoAtivo) up.tipoAtivo = tipoAtivo;
    document.getElementById('up-vinculo-candidatos').innerHTML = `<div class="raiz-bloco-interno text-xs flex items-center justify-between"><span>✅ ${escapeHtml(nome)}</span></div>`;
    document.getElementById('up-vinculo-busca').classList.add('hidden');
    aplicarPadroesCategoriaUpload();
}

export async function cancelarConfirmacaoUpload() {
    if (up?.storagePath) { try { await api.removerArquivoDocumento(up.storagePath); } catch (e) { /* melhor esforço */ } }
    fecharModal('modal-confirmar-upload');
    up = null;
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
    const controlar = g('uc-controlar').checked && !g('uc-controlar').disabled;
    if (!nome) return marcarErroConfirmacao('Informe o nome de exibição.');
    if (!categoriaId) return marcarErroConfirmacao('Selecione uma categoria.');
    if (controlar && !g('uc-ctl-data-fim').value) return marcarErroConfirmacao('Informe a data de vencimento do controle.');
    if (controlar && !g('uc-ctl-titulo').value.trim()) return marcarErroConfirmacao('Informe o título do controle.');

    statusEl.style.color = 'var(--sage)';
    statusEl.textContent = 'Salvando…';
    const f = up.arquivo;
    const nivelAcesso = g('up-restrito').checked ? 'restrito' : 'empresa';
    const dados = {
        data_documento: g('uc-data-documento').value || null, validade_em: g('uc-validade').value || g('uc-vig-fim').value || null,
        descricao: g('uc-descricao').value.trim() || null,
    };

    try {
        await api.inserirDocumento({
            id: up.documentoId, cliente_id: estado.clienteId, nome_original: f.name, nome_exibicao: nome,
            bucket: 'cofre-documentos', storage_path: up.storagePath, mime_type: f.type, extensao: (f.name.split('.').pop() || '').toLowerCase(),
            tamanho_bytes: f.size, hash_sha256: up.hash, categoria_id: categoriaId, tags: [], ...dados,
            nivel_acesso: nivelAcesso, origem: 'app', status: 'ativo', criado_por: estado.pessoa.id, arquivo_mantido: manter,
        });
    } catch (err) {
        await api.removerArquivoDocumento(up.storagePath);
        return marcarErroConfirmacao('Falha ao salvar (upload desfeito): ' + err.message);
    }

    const avisos = [];
    if (up.vinculo && up.vinculo.tipo !== 'triagem') {
        try { await api.inserirVinculo(estado.clienteId, up.documentoId, up.vinculo.tipo, up.vinculo.id, true, estado.pessoa.id); }
        catch (err) { avisos.push('vínculo: ' + err.message); }
    }

    // Auditoria: o que a IA leu × o que o cliente confirmou (A.12, RPC).
    if (up.ia) {
        const cat = estado.categorias.find(c => c.id === categoriaId);
        const confirmado = { categoriaCodigo: cat?.codigo || null, categoriaId, nome, ...dados, manterArquivo: manter, controlar };
        const igual = (cat?.codigo || null) === (up.ia.categoriaCodigoSugerido || null) && nome === (up.ia.nomeSugerido || '') &&
            (dados.data_documento || null) === (up.ia.dataDocumento || null);
        try { await api.registrarExtracao(up.documentoId, up.ia, igual ? 'confirmado' : 'corrigido', confirmado); }
        catch (err) { console.warn('auditoria da extração:', err.message); }
    }

    // Contatos marcados → cofre_contatos_acionamento (mesmo insert do antigo modal de sugestões)
    const marcados = [...document.querySelectorAll('.uc-contato:checked')].map(el => up.ia?.contatosSugeridos?.[parseInt(el.value, 10)]).filter(Boolean);
    for (const c of marcados) {
        try { await api.criarContato({ cliente_id: estado.clienteId, documento_id: up.documentoId, papel: c.papel || 'outro', nome: c.nome, telefone: c.telefone || null, email: c.email || null }); }
        catch (err) { avisos.push('contato ' + c.nome + ': ' + err.message); }
    }

    // Item de controle — mesmo caminho da tela Controles (cofre-controles.js).
    let itemCriado = null;
    if (controlar) {
        try {
            const ctl = await import('./cofre-controles.js');
            const recInt = parseInt(g('uc-ctl-rec-intervalo').value, 10) || null;
            itemCriado = await ctl.criarItemControleDeDocumento({
                ativoId: up.vinculo.tipo === 'ativo' ? up.vinculo.id : null,
                contratoId: up.vinculo.tipo === 'contrato' ? up.vinculo.id : null,
                tipo: g('uc-ctl-tipo').value, subtipoId: g('uc-ctl-subtipo').value || null,
                titulo: g('uc-ctl-titulo').value.trim(),
                dataBase: g('uc-ctl-data-inicio').value || g('uc-ctl-data-fim').value, dataFim: g('uc-ctl-data-fim').value,
                freqIntervalo: recInt, freqUnidade: recInt ? g('uc-ctl-rec-unidade').value : null,
                antecedencia: parseInt(g('uc-ctl-antecedencia').value, 10) || 0,
                repeticao: parseInt(g('uc-ctl-reforco').value, 10) || null,
                documentoId: up.documentoId,
            });
            await api.inserirVinculo(estado.clienteId, up.documentoId, 'item_controle', itemCriado.id, false, estado.pessoa.id);
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
    if (!manter) partes.push('só os dados guardados');
    mostrarToast(partes.join(' · ') + ' ✅');
    avisos.forEach(a => mostrarToast('Atenção — ' + a, 'aviso'));
    fecharModal('modal-confirmar-upload');
    up = null;
    window.dispatchEvent(new CustomEvent('cofre:recarregar-documentos'));
    if (itemCriado) window.dispatchEvent(new CustomEvent('cofre:recarregar-eventos'));
    if (marcados.length) window.dispatchEvent(new CustomEvent('cofre:recarregar-contatos'));
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
    if (d.arquivo_mantido === false) chips += `<span class="${BADGE_NEUTRO}">Só dados</span>`; // v2.0.0 (A.12)
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

// v1.x (03/09, Nicola: "deve ter opção de categorizar um documento sem
// categoria") — sheet com as categorias do cliente; grava categoria_id e
// recarrega a ficha + listas (cofre:recarregar-documentos).
export async function categorizarDocumentoAtual() {
    if (!docAtualId) return;
    if (typeof window.abrirSheetAcoes !== 'function') { mostrarToast('Disponível só dentro do app principal.', 'erro'); return; }
    const d = estado.documentos.find(x => x.id === docAtualId);
    window.abrirSheetAcoes({ titulo: 'Categorizar', sub: d?.nome_exibicao || '', acoes: (estado.categorias || []).map(c => ({
        icone: c.id === d?.categoria_id ? 'check' : 'tag', titulo: c.nome, sub: c.id === d?.categoria_id ? 'Categoria atual' : '',
        aoTocar: async () => {
            try {
                await api.atualizarDocumento(docAtualId, { categoria_id: c.id });
                if (d) d.categoria_id = c.id;
                mostrarToast(`Categoria: ${c.nome}`);
                window.dispatchEvent(new CustomEvent('cofre:recarregar-documentos'));
                await abrirFichaDocumento(docAtualId);
            } catch (e) { mostrarToast('Erro: ' + e.message, 'erro'); }
        }
    })) });
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
