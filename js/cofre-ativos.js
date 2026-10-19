// ============================================================================
// cofre-ativos.js — Raiz Patrimônio · Cofre de Documentos
// Versão: 1.118.0 · 19/10/2026
//
// v1.118.0 (19/10/2026, sessão 20261019-0850-carga-silva-l5a, demanda 9404081c; FICHA_LOTES_4_5 v1.1.0 com D3 e D4 do Nicola
// 18/10, item 30 escolhido em 19/10 08:50) — L5-A: lista de Ativos agrupada por ramo e empreendimento em Todo o patrimônio
// (só empreendimento numa lente; empreendimento vale para qualquer ativo); faixa "▾ N áreas" abre e fecha os sub-ativos e a
// linha volta a entrar na ficha (seta ›); chips de segmento na ordem do catálogo; "Novo bem rural"/"Novo imóvel" pelo ramo
// (rotuloNovoAtivo, exemplosNovoAtivo); na edição, trocar o tipo também troca os blocos de endereço e dados do imóvel.
// Versão anterior: 1.117.0 · 18/10/2026
//
// v1.117.0 (18/10/2026, sessão 20261018-2343-carga-silva-l4a, demanda 9404081c; FICHA_LOTES_4_5 v1.1.0, de acordo do Nicola
// 18/10 23:43) — L4-B/L4-C e ajustes do teste de 18/10: campo "tamanho" (número + unidade: ha, alqueire mineiro, alqueire
// paulista, m²) e "coordenadas" (latitude e longitude) no cadastro e na edição; fazenda, sítio, chácara e terreno rural sem
// rua/número e sem "dados do imóvel": sede (município, UF, CEP) vai também para as colunas de endereço e a área total para
// area_m2; edição respeita os blocos do catálogo; "Aluguel esperado" só em tipo com uso de renda; casa cadastrada na lente
// Família já nasce com Moradia (D2); etiqueta curta no card de áreas (só o nome do uso); ficha e "Adicionar uso" esperam o
// catálogo (Arrendamento aparecia só depois de abrir o cadastro).
// Versão anterior: 1.116.0 · 18/10/2026
//
// v1.116.0 (18/10/2026, sessão 20261018-2343-carga-silva-l4a, demanda 9404081c; FICHA_LOTES_4_5 v1.1.0, de acordo do Nicola
// 18/10 23:43) — L4-A: lista de Ativos com etiqueta curta (só o nome do uso), "Disponível" na mesma cor fora do imóvel
// predial, nome em até 2 linhas e recuo menor das áreas, "Sem contrato" só no imóvel predial e ícone do tipo nas fazendas;
// proprietário opcional (linha vazia não bloqueia o salvar); cabeçalho e menus do sub-ativo com o nome do tipo do catálogo;
// edição do sub-ativo respeita o contexto do catálogo (sem empreendimento e valor).
// Versão anterior: 1.115.0 · 16/10/2026
//
// v1.115.0 (16/10/2026, sessão 20261016-0105-usos-fatia7-fix, demanda 3022603b; achado do Nicola 16/10 01:03, "Não veio opção
// de lote pecuária"; "Pode publicar a correção" 01:10) — o 1º seletor do novo ativo ganha as categorias Agro e Pecuária
// (CATEGORIAS_ATIVO era fixa sem elas: na lente Pecuária o filtro ficava vazio e caía na lista inteira; no Agro faltavam
// lavoura, talhão e máquinas). Nada mais muda.
// Versão anterior: 1.114.0 · 16/10/2026
//
// v1.114.0 (16/10/2026, sessão 20261016-0053-carga-silva, demanda 9404081c; planos dos lotes 1–3 aprovados pelo Nicola 16/10 00:53)
// — Adicionar uso segue a lente "Ver o app de" (Moradia aparece na Casa em Família e em Todo o patrimônio); a situação é
// relida depois de cadastrar (lista sem "Disponível" falso e sub-ativos com etiqueta), com a Situação gravada como reserva;
// Situação e Finalidade de uso saem do formulário de edição (vêm do uso); ficha mostra o tipo do catálogo (Fazenda, não
// Terreno) e o ramo pelo nome; contador de Usos e contratos conta os usos; histórico diz "Uso iniciado"/"Uso excluído" com
// período e motivo, sem Desfazer na exclusão; sai "Ver todos os contratos"; Compartilhar só com uso Disponível ou Em venda;
// grupos "Sem empreendimento"/"Outros ativos" sem parênteses.
// --------------------------------------------------------------------------
// Versões anteriores (v1.113.0 … v1.113.0): CHANGELOG_MODULOS.md, na raiz do repositório — o
// gerar_versoes.py rola pra lá automaticamente tudo além das 5 versões
// mais recentes deste cabeçalho (VER-06).
export const VERSAO = '1.118.0'; // v-check: lido por ⚙️ › Conta › Versões — manter igual ao header
import { estado } from './cofre-estado.js';
import * as api from './cofre-api.js';
import { mostrarToast, erroInline, refrescarIcones, alternarToggle, abrirModal, fecharModal, modalGenerico, perguntar, avisarComDesfazer, escolher } from './cofre-ui.js';
import { mudarTela } from './cofre-navegacao.js';
import {
    escapeHtml, formatarDataBR, diasAte, chipVencimento, mascarar,
    rotuloTipoAtivo, iconeAtivo, validarCamposAtivo,
    obterCamposPorTipo, listarTiposPorCategoria, inicializarCatalogoTiposAtivo, tipoDoCatalogo, categoriasDoRamo, blocosDoFormulario,
    tiposDoCatalogo as _catalogoAtivoTiposLista } from './cofre-validacoes.js';
import { montarControlesAtivo, aplicarMotorNoChipControles, reiniciarChipControlesDoMotor } from './cofre-controles.js';
// E6.2 — retorno usado de forma síncrona em salvarAtivo/salvarEdicaoAtivo
// (lerBlocoEndereco), por isso import estático (ver nota em technical-
// learnings: bridge window[nome] só serve fire-and-forget).
import { renderizarBlocoEndereco, lerBlocoEndereco } from './comum-endereco.js';
// v1.59.0 (Fase 1 do wrapper de escrita, demanda de arquitetura discutida
// em sessão anterior) — emitirEscrita() é o evento padrão pra "algo mudou
// que módulos DE FORA do Cofre podem precisar saber" (cofre:recarregar-
// ativos continua existindo do jeito que está, só serve o Cofre por
// dentro). Piloto único desta entrega: salvarEdicaoAtivo() (ver
// changelog do topo do arquivo).
import { emitirEscrita } from './raiz-eventos.js';
import { rzEditarDivisao } from './raiz-ui.js'; // v1.76.0 — editor único de divisão
import { rzMostrarBloqueio, recarregarFuncionalidadesLiberadas } from './comum-licenca.js'; // v1.62.0 — porta de licença

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
// Entrega R.4 — última sugestão de revisão de valor carregada pelo card
// (montarFinanceiroAtivo); as 3 ações do card (abrirRevisarValor,
// manterValorRevisao, adiarRevisaoValor) leem daqui, sem 2ª consulta.
let revisaoValorAtual = null;

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
// F2.4 — as 8 categorias do formulário de ativo (fonte única: seletor #at-tipo e chips de convite).
const CATEGORIAS_ATIVO = ['imovel_predial', 'imovel_territorial', 'agro', 'pecuaria', 'veiculo', 'embarcacao', 'aeronave', 'vida', 'bem_valor', 'outro']; // v1.115.0: agro e pecuaria
// Valores antigos de tipo_ativo → categoria atual (mesma ponte de rotuloTipoAtivo).
const CATEGORIA_POR_TIPO = { imovel: 'imovel_predial', terreno: 'imovel_territorial', veiculo_blindado: 'veiculo', vida_protecao: 'vida', obra_arte: 'bem_valor', colecao_bem_valor: 'bem_valor' };
// Rótulo curto do chip de convite (sem "Outro": convite genérico não convida a nada).
const ROTULO_CONVITE = { imovel_predial: 'Imóvel', imovel_territorial: 'Terreno', veiculo: 'Veículo', embarcacao: 'Embarcação', aeronave: 'Aeronave', vida: 'Vida e proteção', bem_valor: 'Obra e bem de valor' };
function categoriaDoAtivo(tipo) { return CATEGORIA_POR_TIPO[tipo] || tipo; }

// F2.4 — convite: abre "Novo ativo" já com a categoria escolhida.
export async function abrirFormAtivoComCategoria(categoria) {
    await abrirFormAtivo();
    const sel = document.getElementById('at-tipo');
    if (sel && CATEGORIAS_ATIVO.includes(categoria)) { sel.value = categoria; aoMudarTipoAtivo(); }
}
// Convite de categoria vazia: a mesma escolha do vazio — Raiz IA primeiro, formulário depois.
// Sem as folhas do app (cofre.html avulso) vai direto ao formulário. (dem b8602a3a)
function abrirConviteCategoria(cat) {
    const rot = ROTULO_CONVITE[cat] || 'bem';
    if (typeof window.abrirSheetAcoes !== 'function') { abrirFormAtivoComCategoria(cat); return; }
    window.abrirSheetAcoes({ titulo: `Cadastrar ${rot.toLowerCase()}`, sub: 'Como você quer cadastrar?', acoes: [
        { icone: 'sparkles', tipo: 'ia', titulo: 'Enviar documento', codigo: 'cofre.analisar_ia', sub: 'Foto ou arquivo', aoTocar: () => window.dispatchEvent(new CustomEvent('cofre:abrir-upload-home')) },
        { icone: 'plus', titulo: 'Preencher na mão', codigo: 'cofre.ativos.criar', sub: `Formulário já em ${rot}`, aoTocar: () => abrirFormAtivoComCategoria(cat) },
    ]});
}
if (typeof window !== 'undefined') window.__rzConviteAtivo = (cat) => abrirConviteCategoria(cat);

// F2.4 — pior severidade entre os alertas do Motor ligados a ativos (ponto do chip "Com alerta").
function piorSeveridadeAtivos() {
    try {
        const fonte = (typeof alertasVisiveisTodos !== 'undefined' && alertasVisiveisTodos && alertasVisiveisTodos.length) ? alertasVisiveisTodos
            : ((typeof geralVisiveisTodos !== 'undefined' && geralVisiveisTodos) || []);
        const deAtivo = fonte.filter(r => r.detalhe?.ativo_id || r.entidade_tipo === 'ativo');
        if (deAtivo.some(r => r.severidade === 'critico')) return 'rz-bad';
    } catch (_) { /* sem Motor (cofre.html) */ }
    return 'rz-warn';
}

export function popularSelectTipoAtivo() {
    const sel = document.getElementById('at-tipo');
    if (!sel) return;
    // v1.85.0 (F21) — refeito a cada abertura: só as categorias com tipo no ramo da lente (todas em Todo o patrimônio)
    const doRamo = categoriasDoRamo(ramoDaLente());
    let lista = doRamo ? CATEGORIAS_ATIVO.filter(c => doRamo.includes(c)) : CATEGORIAS_ATIVO;
    // v1.102.0 (usos fatia 3) — subativo: só as categorias que têm tipo que pode ser subativo (catálogo, pode_ser_subativo)
    // v1.107.0 (fatia 3b, D3b-1) — e do ramo do principal; o seletor de categoria some (um seletor só, o do tipo)
    if (subativoDe) lista = [...new Set(tiposSubativoPermitidos().map(t => t.categoria))];
    sel.closest('.rz-f')?.classList.toggle('hidden', !!subativoDe);
    const atual = sel.value;
    sel.innerHTML = (lista.length ? lista : CATEGORIAS_ATIVO).map(t => `<option value="${t}">${rotuloTipoAtivo(t)}</option>`).join('');
    if (atual && lista.includes(atual)) sel.value = atual;
    return;
    // v2.0.0-front (E5) — as 8 categorias macro (E4.1), não mais os 10
    // valores específicos antigos. O tipo específico (Apartamento, Carro
    // blindado...) vira o 2º seletor, #at-tipo-detalhe, populado por
    // categoria via atualizarSelectTipoDetalhe().
    sel.innerHTML = CATEGORIAS_ATIVO // F2.4 — mesma lista dos chips de convite
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
    // v1.85.0 (F21) — no novo ativo (sem valor atual), só os tipos do ramo da lente e de ramo já ativo
    if (prefixoId === 'at-' && subativoDe) { // v1.107.0 (fatia 3b) — todos os tipos permitidos num seletor só
        const atual = sel.value;
        const tipos = tiposSubativoPermitidos();
        wrap.classList.remove('hidden');
        const rot = wrap.querySelector('label'); if (rot) rot.textContent = 'Tipo';
        sel.innerHTML = tipos.map(t => `<option value="${t.id}" data-categoria="${t.categoria}">${escapeHtml(t.nome)}</option>`).join('');
        if (atual && tipos.some(t => t.id === atual)) sel.value = atual;
        const selCat = document.getElementById('at-tipo');
        const cat = sel.selectedOptions[0]?.dataset.categoria;
        if (selCat && cat && selCat.value !== cat) selCat.value = cat;
        return;
    }
    const rotDet = wrap.querySelector('label'); if (rotDet && prefixoId === 'at-') rotDet.textContent = 'Tipo específico';
    const tipos = listarTiposPorCategoria(categoria, valorAtualId ? null : { ramo: ramoDaLente() });
    wrap.classList.toggle('hidden', tipos.length === 0);
    sel.innerHTML = tipos.map(t => `<option value="${t.id}"${t.id === valorAtualId ? ' selected' : ''}>${escapeHtml(t.nome)}</option>`).join('');
}

// v1.102.0 (usos fatia 3) — Unidade e Área pedem "nova/cadastrada"; Integrante e o genérico, "novo/cadastrado"
const femSubativo = (singular) => /^(unidade|área|area)$/i.test(String(singular || '').trim());
// v1.107.0 (fatia 3b, D3b-1) — tipos que podem ser unidade, área ou integrante DESTE principal: pode_ser_subativo e do
// mesmo ramo (Agro e Pecuária juntos). O banco confere a mesma regra (fn_trg_ativo_principal).
const grupoRamo = (r) => (r === 'agro' || r === 'pecuaria') ? 'agro' : (r || '');
function podeSerSubativoDe(tipoId, ramoPrincipal) {
    const t = tipoDoCatalogo(tipoId);
    return !!(t && t.pode_ser_subativo && grupoRamo(t.ramo) === grupoRamo(ramoPrincipal));
}
function tiposSubativoPermitidos() {
    const ramo = subativoDe?.ramo;
    return CATEGORIAS_ATIVO.flatMap(c => listarTiposPorCategoria(c).map(t => ({ ...t, categoria: c })))
        .filter(t => podeSerSubativoDe(t.id, ramo));
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

// v1.64.0 (demanda 43448a36) — finalidade de uso vale para TODO ativo.
function renderizarCampoFinalidadeUso(prefixo, v = {}) {
    const optSel = (val) => val === (v.finalidade_uso || '') ? ' selected' : '';
    return `
        <div class="rz-f">
            <label>Finalidade de uso</label>
            <select id="${prefixo}finalidade-uso" onchange="window.__ativoMudarFinalidadeUso('${prefixo}')">
                <option value=""${optSel('')}>— não informado —</option>
                ${FINALIDADES_USO_ATIVO.map(f => `<option value="${f.v}"${optSel(f.v)}>${f.l}</option>`).join('')}
            </select>
            <span class="rz-hint">Aluguel (long ou short stay), arrendamento e revenda contam como Comercial; o resto, e o vazio, como Família.</span>
        </div>`;
}

// Universal — qualquer tipo de ativo.
function renderizarBlocoEmpreendimentoValor(prefixo, v = {}, empreendimentos = [], { comFinalidade = false } = {}) {
    return `
        <div class="rz-f">
            <label>Empreendimento</label>
            <select id="${prefixo}empreendimento-id" onchange="window.__ativoMudarEmpreendimento('${prefixo}')">
                <option value="">— nenhum —</option>
                ${empreendimentos.map(e => `<option value="${e.id}"${e.id === v.empreendimento_id ? ' selected' : ''}>${escapeHtml(e.nome)}</option>`).join('')}
                <option value="__novo__">+ Novo empreendimento</option>
            </select>
            <input type="text" id="${prefixo}empreendimento-novo-nome" placeholder="Nome do empreendimento" class="hidden" style="margin-top:6px">
        </div>
        <div class="rz-f">
            <label>Valor de referência (R$)</label>
            <input type="number" step="0.01" id="${prefixo}valor-referencia" value="${v.valor_referencia ?? ''}">
        </div>
        ${''/* Finalidade de uso vem do uso vigente (dem 091b87d4, 9404081c): fora do formulário */}
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
    const lido = {
        empreendimento_id: empreendimentoId || null,
        valor_referencia: valorReferencia,
        valor_referencia_em: valorReferencia !== null ? new Date().toISOString().slice(0, 10) : null,
    };
    // v1.64.0 — só existe aqui quando o ativo não é imóvel (imóvel lê em lerBlocoImovel).
    const selFinalidade = document.getElementById(prefixo + 'finalidade-uso');
    if (selFinalidade) lido.finalidade_uso = selFinalidade.value || null;
    return lido;
}

// Só categoria imóvel. Aluguel esperado (achado no teste real: pergunta
// direta do Nicola — "qual campo é o aluguel esperado?" — resposta:
// nenhum, ele não existia) só aparece quando a finalidade de uso é
// comercial (documento DE_PARA §5: valor de aluguel é
// dados_especificos.aluguel_desejado, NUNCA imoveis.valor_mercado/
// cofre_ativos.valor_referencia — são conceitos diferentes: um é o que
// se pede pra alugar, o outro é quanto o bem vale).
function renderizarBlocoImovel(prefixo, v = {}, opcoes = {}) {
    const optSel = (val, campo) => val === (v[campo] || '') ? ' selected' : '';
    const finalidadeInfo = FINALIDADES_USO_ATIVO.find(f => f.v === (v.finalidade_uso || ''));
    // v1.107.0 (fatia 3b, F3b-5) — no cadastro, Finalidade e Situação de uso saem (vêm do uso; demanda 091b87d4) e o
    // aluguel esperado fica sempre à vista
    const cadastro = !!opcoes.cadastro;
    // v1.117.0 (L4-6, dem 9404081c) — só aparece em tipo que aceita uso de renda no catálogo (tem_uso_renda); tipo sem catálogo
    // carregado segue como antes. Valor já gravado continua à vista na edição (nunca esconder dado preenchido).
    const tipoBloco = tipoDoCatalogo(opcoes.tipoDetalheId ?? v.tipo_detalhe_id);
    const rendaOk = !tipoBloco || tipoBloco.tem_uso_renda !== false || v.dados_especificos?.aluguel_desejado != null;
    const aluguelVisivel = (cadastro || finalidadeInfo?.comercial) && rendaOk ? '' : ' hidden';
    // v1.66.0 — editando um ativo que já tem situação de uso, destinação
    // ou CIB preenchidos, o bloco "mais campos" nasce ABERTO (nunca
    // esconde dado que a pessoa já preencheu antes). Só nasce escondido
    // quando os 3 estão vazios (criação, ou edição de imóvel que nunca
    // preencheu nada ali).
    const temCamposAvancados = !!(v.cib || v.destinacao);
    const maisCamposClasse = temCamposAvancados ? '' : ' hidden';
    const maisCamposTexto = temCamposAvancados ? '− Ocultar campos avançados' : '+ Mostrar mais campos';
    return `
        <div class="rz-f">
            <label>Área (m²)</label>
            <input type="number" step="0.01" id="${prefixo}area-m2" value="${v.area_m2 ?? ''}">
        </div>
        <div id="${prefixo}aluguel-wrapper" class="rz-f${aluguelVisivel}">
            <label>Aluguel esperado (R$)</label>
            <input type="number" step="0.01" id="${prefixo}aluguel-desejado" value="${v.dados_especificos?.aluguel_desejado ?? ''}">
        </div>
        <button type="button" id="${prefixo}toggle-mais-campos" data-action="ativo-toggle-mais-campos" data-prefixo="${prefixo}" class="sm:col-span-2 text-xs font-semibold" style="color:var(--sprout);text-align:left;background:none;border:none;padding:4px 0;cursor:pointer">${maisCamposTexto}</button>
        <div id="${prefixo}mais-campos" class="${maisCamposClasse.trim()} sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
            ${v.id ? renderizarCampoDestinacao(prefixo, v) : ''}
            <div class="rz-f">
                <label>CIB (NFS-e) <button type="button" data-action="fa-info-cib" class="text-slate-400" title="O que é isso?" aria-label="O que é isso?" style="line-height:0;display:inline-flex;vertical-align:middle;margin-left:4px"><svg data-lucide="info" style="width:13px;height:13px"></svg></button></label>
                <input type="text" id="${prefixo}cib" value="${escapeHtml(v.cib || '')}" placeholder="Cadastro do imóvel na NFS-e nacional">
            </div>
        </div>
        <div class="rz-f sm:col-span-2">
            <label>Observação</label>
            <textarea id="${prefixo}observacao" rows="2">${escapeHtml(v.observacao || '')}</textarea>
        </div>
    `;
}

// v1.63.0 — destinação (residencial × não residencial) para a NFS-e.
// Valor '' = "pelo tipo" (o banco deriva de ativo_tipos.destinacao_padrao).
const DESTINACOES_ATIVO = [
    { v: 'residencial', l: 'Residencial' },
    { v: 'nao_residencial', l: 'Não residencial' },
];
function renderizarCampoDestinacao(prefixo, v) {
    const manual = v.destinacao_origem === 'manual';
    const atualPeloTipo = !manual && v.destinacao ? DESTINACOES_ATIVO.find(d => d.v === v.destinacao)?.l : null;
    const rotuloTipo = atualPeloTipo ? `Pelo tipo do imóvel (hoje: ${atualPeloTipo.toLowerCase()})` : 'Pelo tipo do imóvel (sem padrão — escolha)';
    const sel = (val) => (manual ? v.destinacao === val : val === '') ? ' selected' : '';
    return `
        <div class="rz-f">
            <label>Destinação (NFS-e) <button type="button" data-action="fa-info-destinacao" class="text-slate-400" title="O que é isso?" aria-label="O que é isso?" style="line-height:0;display:inline-flex;vertical-align:middle;margin-left:4px"><svg data-lucide="info" style="width:13px;height:13px"></svg></button></label>
            <select id="${prefixo}destinacao">
                <option value=""${sel('')}>${escapeHtml(rotuloTipo)}</option>
                ${DESTINACOES_ATIVO.map(d => `<option value="${d.v}"${sel(d.v)}>${d.l}</option>`).join('')}
            </select>
        </div>`;
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
            // Situação e Finalidade saem do formulário (vêm do uso, no banco): campo ausente = undefined, que o update ignora.
            // Armadilha: mandar null apagaria o que fn_ativo_derivar_uso_campos gravou.
            finalidade_uso: document.getElementById(prefixo + 'finalidade-uso') ? txt('finalidade-uso') : undefined,
            situacao_uso: document.getElementById(prefixo + 'situacao-uso') ? txt('situacao-uso') : undefined,
            observacao: txt('observacao'),
            cib: txt('cib'),
        },
        // v1.63.0 — undefined quando o campo não está na tela (criação)
        destinacao: document.getElementById(prefixo + 'destinacao') ? (txt('destinacao') || null) : undefined,
        aluguelDesejado: num('aluguel-desejado'),
    };
}

// v1.118.0 (L5-3, dem 9404081c, D3) — "Novo …" pelo ramo da lente (ativo_ramos.unidade_singular): Novo imóvel, Novo bem rural,
// Nova obra, Novo lote… Em Todo o patrimônio, "Novo ativo". Também o "o que cadastrar" do + (segmentos do ramo).
export function rotuloNovoAtivo() {
    const r = ramoDaLente();
    const un = r !== 'tudo' && typeof rzRamoInfo === 'function' ? rzRamoInfo(r)?.unidade_singular : null;
    if (!un) return 'Novo ativo';
    const fem = /(a|ção|ão)$/i.test(un.split(' ')[0]) && !/^(dia|mapa|sistema)$/i.test(un);
    return `${fem ? 'Nova' : 'Novo'} ${un}`;
}
export function exemplosNovoAtivo() {
    const r = ramoDaLente();
    if (r === 'tudo' || !_catalogoAtivoTiposLista().length) return 'Imóvel, veículo, arte…';
    const segs = [];
    _catalogoAtivoTiposLista().filter(t => t.ramo === r).sort((x, y) => (x.ordem ?? 999) - (y.ordem ?? 999))
        .forEach(t => { if (t.segmento && !segs.includes(t.segmento)) segs.push(t.segmento); });
    return segs.length ? segs.slice(0, 3).join(', ') + (segs.length > 3 ? '…' : '') : 'Imóvel, veículo, arte…';
}
if (typeof window !== 'undefined') { window.rzRotuloNovoAtivo = rotuloNovoAtivo; window.rzExemplosNovoAtivo = exemplosNovoAtivo; }

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
        segmentoChip = null;
    }
    // v1.85.0 (F21) — sem o catálogo de tipos não dá para saber ramo e segmento: carrega uma vez e redesenha
    if (!_catalogoTiposAtivoCarregado && ramoDaLente() !== 'tudo') {
        garantirCatalogoTiposAtivo().then(() => { if (_catalogoTiposAtivoCarregado) redesenharComFiltros(); });
    }
    recalcularGruposChip();
    const ramoLente = ramoDaLente();

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

    const ativoBateComBusca = (a, resumo) => !termo || ativoBateComTexto(a, resumo, termo, ocorrenciasPorAtivo); // F2.3b

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

    const soComAlerta = !!GRUPOS_CHIP_TIPO[chipAtivoAtual]?.alerta; // v1.75.0 (F2.2)
    const comAlerta = soComAlerta ? ativosComAlerta(ocorrenciasPorAtivo) : null;
    const lista = principais().filter(a => {
        if (ramoLente !== 'tudo' && ramoDoAtivoLista(a) !== ramoLente) return false; // v1.85.0 (F21)
        if (segmentoChip && segmentoDoAtivo(a) !== segmentoChip) return false; // v1.85.0 (F22)
        if (tiposFiltro && tiposFiltro.length && !tiposFiltro.includes(a.tipo_ativo)) return false;
        if (comAlerta && !comAlerta.has(a.id)) return false;
        // v1.41.0 (16/09/2026, achado no teste real — "Casa de Campo cai
        // em Outros ativos") — ehCategoriaImovel(a.tipo_ativo) no lugar
        // de entidade_origem_tipo==='imovel': cobre imóvel nativo (Onda
        // 12) também, não só os 104 legados. resumoImoveisPorId agora é
        // chaveado por a.id (buscarResumoImoveisParaCards, cofre-api.js).
        const resumo = ehCategoriaImovel(a.tipo_ativo) ? resumoImoveisPorId.get(a.id) : null;
        if (!ativoBateComBusca(a, resumo)) return false;
        if (!ativoBateComStatus(a, resumo)) return false;
        if (!ativoBateComAlerta(a)) return false;
        return true;
    });

    const container = document.getElementById('ativos-lista');

    // v1.7.0 (pedido explícito, 01/09/2026: "a lista de ativos está bem
    // diferente da lista antiga de imóveis... prefiro o padrão da lista
    // antiga, favor ajustar") — agrupamento por empreendimento. Ativos
    // que não são imóvel (sem empreendimento) caem em "(Outros ativos)",
    // sempre por último.
    // CORRIGIDO v1.47.0 (pedido explícito — "agrupe os itens na tela pelo
    // tipo empreendimento") — o agrupamento só ligava com mais de 10
    // imóveis no total da carteira; carteira pequena (ex.: 8 imóveis, 1
    // único empreendimento "Capital", + 3 outros ativos) ficava sempre em
    // lista plana, sem agrupar nunca. Grupo sempre ativo agora — com 1
    // empreendimento só, vira 1 cabeçalho ("Capital (8)"), o que já é
    // informação (mostra que a carteira toda está concentrada ali).
    // v1.118.0 (L5-1, dem 9404081c, 22bd8095, 5dd5f88c) — Todo o patrimônio agrupa por RAMO e, dentro, por EMPREENDIMENTO; numa
    // lente, só por empreendimento. Empreendimento vale para qualquer ativo (empreendimento_id), não só imóvel. "Sem
    // empreendimento" fica no fim do ramo, e some como cabeçalho quando o ramo não tem nenhum empreendimento.
    if (_empreendimentosCache === null) garantirEmpreendimentos().then(() => redesenharComFiltros()).catch(() => {});
    const nomeEmp = (a) => {
        const resumo = ehCategoriaImovel(a.tipo_ativo) ? resumoImoveisPorId.get(a.id) : null;
        return resumo?.empreendimento || (a.empreendimento_id && (_empreendimentosCache || []).find(e => e.id === a.empreendimento_id)?.nome) || '';
    };
    const SEM_EMP = 'Sem empreendimento';
    const porEmp = (l) => {
        const g = {};
        l.forEach(a => { const k = nomeEmp(a) || SEM_EMP; (g[k] = g[k] || []).push(a); });
        return Object.keys(g).sort((x, y) => x === SEM_EMP ? 1 : y === SEM_EMP ? -1 : x.localeCompare(y, 'pt-BR')).map(k => ({ nome: k, itens: g[k] }));
    };
    const ordemRamos = typeof RZ_RAMOS !== 'undefined' ? RZ_RAMOS.map(r => r.codigo) : [];
    const blocos = [];
    if (ramoLente === 'tudo') {
        const g = {};
        lista.forEach(a => { const r = ramoDoAtivoLista(a) || 'outros'; (g[r] = g[r] || []).push(a); });
        Object.keys(g).sort((x, y) => (ordemRamos.indexOf(x) + 1 || 99) - (ordemRamos.indexOf(y) + 1 || 99))
            .forEach(r => blocos.push({ ramo: r, itens: g[r], emps: porEmp(g[r]) }));
    } else blocos.push({ ramo: null, itens: lista, emps: porEmp(lista) });
    // F2.4 (UXR-15) — carteira só com imóveis: um card de convite no FIM da lista (nunca no topo).
    const soImoveis = principais().length > 0 && principais().every(a => ehCategoriaImovel(categoriaDoAtivo(a.tipo_ativo)));
    const cardConvite = soImoveis && chipAtivoAtual === 0 && !termo ? `
        <div class="rz-card rz-convite-card">
            <b>Seu patrimônio vai além dos imóveis</b>
            <p class="rz-desc">Cadastre também veículos, obras de arte, seguros de vida e outros bens — tudo no mesmo lugar, com os vencimentos sob controle.</p>
            <button type="button" class="rz-btn rz-btn-2" data-action="abrir-acoes-ativos" style="margin-top:10px">Cadastrar outro bem</button>
        </div>` : '';
    ultimaContagemAtivos = lista.length;
    atualizarRotuloBuscaAtivos();
    // v1.96.0 (UX onda 4, D9) — agrupador com total: a soma do valor de referência dos ativos do grupo, à direita
    const compacto = (v) => (typeof window.formatarValorCompacto === 'function' ? window.formatarValorCompacto(v) : Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }));
    const totalGrupo = (l) => { const c = l.filter(a => a.valor_referencia != null); return c.length ? compacto(c.reduce((t, a) => t + Number(a.valor_referencia || 0), 0)) : ''; };
    const nomeRamoTela = (r) => (typeof window.rzNomeRamo === 'function' ? window.rzNomeRamo(r) : r);
    const grupoHtml = (titulo, itens) => `
        ${titulo ? `<div class="rz-group rz-group-t"><span>${escapeHtml(titulo)} · ${itens.length}</span>${totalGrupo(itens) ? `<b>${totalGrupo(itens)}</b>` : ''}</div>` : ''}
        <div class="rz-card rz-list">${itens.map(ativoComSubativosHtml).join('')}</div>`;
    container.innerHTML = blocos.map(bl => {
        const soSem = bl.emps.length === 1 && bl.emps[0].nome === SEM_EMP;
        const corpo = soSem ? grupoHtml(bl.ramo ? '' : null, bl.itens) : bl.emps.map(e => grupoHtml(e.nome, e.itens)).join('');
        if (!bl.ramo) return corpo;
        const cor = `var(--ramo-cor-${bl.ramo.replace(/[^a-z_]/g, '')}, var(--sage))`;
        return `<div class="rz-group rz-group-t rz-group-ramo" style="--ramo-grupo:${cor}"><span><i aria-hidden="true"></i>${escapeHtml(nomeRamoTela(bl.ramo))} · ${bl.itens.length}</span>${totalGrupo(bl.itens) ? `<b>${totalGrupo(bl.itens)}</b>` : ''}</div>` + corpo;
    }).join('') + cardConvite;

    const vazio = document.getElementById('ativos-estado-vazio');
    vazio.classList.toggle('hidden', principais().length !== 0);
    container.classList.toggle('hidden', principais().length === 0);
    if (principais().length === 0) desenharVazioAtivos(vazio);
    renderChipsAtivos();
    refrescarIcones();
}

// Carteira vazia. O texto é o do passo "Comece pelo primeiro imóvel" da campanha de onboarding,
// palavra por palavra: a pessoa lê o mesmo convite no modal e aqui. Sem rzVazio (cofre.html
// avulso) fica o vazio que veio no markup. (dem b8602a3a)
const TEXTO_PRIMEIRO_IMOVEL = 'Cadastre um imóvel — ou envie uma foto, documento, contrato aluguel ou Guia IPTU e a Raiz IA preenche por você. Depois você adiciona contrato e acompanha os recebimentos.';
function desenharVazioAtivos(el) {
    const gate = window.podeUsar ? window.podeUsar('cofre.ver') : { ok: true };
    if (!gate.ok) { explicarListaVazia(el); return; }
    if (typeof window.rzVazio !== 'function') return;
    el.innerHTML = window.rzVazio({
        dominio: 'ativos', id: 'ativos-lista',
        titulo: 'Comece pelo primeiro imóvel',
        beneficio: TEXTO_PRIMEIRO_IMOVEL,
        acaoIA: { rotulo: 'Enviar documento', codigo: 'cofre.analisar_ia', aoTocar: () => window.dispatchEvent(new CustomEvent('cofre:abrir-upload-home')) },
        acaoManual: { rotulo: 'Cadastrar primeiro imóvel', codigo: 'cofre.ativos.criar', aoTocar: () => abrirFormAtivoComCategoria('imovel_predial') },
    });
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
// v1.85.0 (F21/F22) — a lista de chips passa a ser recalculada pela lente (recalcularGruposChip): em Todo o
// patrimônio, um chip por ramo (tocar troca a lente); num ramo, um chip por segmento. Esta é a lista de antes,
// que ainda vale enquanto o catálogo de ramos não carregou.
let GRUPOS_CHIP_TIPO = [
    { rotulo: 'Todos', tipos: null },
    // v1.75.0 (F2.2) — chip de ação: tipos [] = sem filtro de tipo; filtra pelos ativos com alerta
    { rotulo: 'Com alerta', tipos: [], alerta: true },
    // v1.32.1 (E4.2 fatia B) — cada grupo aceita valor antigo E novo
    { rotulo: 'Imóveis', tipos: ['imovel', 'terreno', 'imovel_predial', 'imovel_territorial'] },
    { rotulo: 'Veículos', tipos: ['veiculo', 'veiculo_blindado'] },
    // pessoa é ativo de gestão, não de patrimônio: recorte próprio, fora de "Outros" (dem f3e6cd27)
    { rotulo: 'Pessoas', tipos: ['vida'] },
    { rotulo: 'Outros', tipos: ['vida_protecao', 'obra_arte', 'aeronave', 'embarcacao', 'colecao_bem_valor', 'outro', 'bem_valor'] },
];

// Índice do chip ativo — 0 ("Todos") é o estado inicial. Só muda quando
// a própria pessoa clica num chip (aplicarFiltroChipAtivos); escolher um
// subtipo fino pelo dropdown do modal não mexe aqui de propósito (são 2
// filtros independentes, o dropdown fino não tem chip correspondente 1:1).
let chipAtivoAtual = 0;
let segmentoChip = null; // v1.85.0 (F22) — segmento do chip aceso, num ramo

// ---- Ramo da lente (F21) -------------------------------------------------------------------------
const ramoDaLente = () => (typeof window !== 'undefined' && typeof window.rzRamoAtual === 'function') ? window.rzRamoAtual() : 'tudo';
function ramoDoAtivoLista(a) {
    const det = tipoDoCatalogo(a.tipo_detalhe_id);
    if (typeof rzRamoDoAtivo === 'function') return rzRamoDoAtivo({ id: a.id, ramo: a.ramo, modelo_repouso: a.modelo_repouso, tipo_ativo: a.tipo_ativo, tipo_detalhe: det }); // F25: modelo vigente
    return det?.ramo || 'outros';
}
const segmentoDoAtivo = (a) => tipoDoCatalogo(a.tipo_detalhe_id)?.segmento || 'Outros';
// v1.102.0 (usos fatia 3, D3-2) — a lista e os contadores mostram só os principais; unidade, área e integrante aparecem
// dentro do principal (card no Resumo). estado.ativos continua com todos (a ficha do subativo abre por ele; a busca acha).
const principais = () => estado.ativos.filter(a => !a.ativo_principal_id);
const ativosDoRamo = () => { const r = ramoDaLente(); return r === 'tudo' ? principais() : principais().filter(a => ramoDoAtivoLista(a) === r); };
function recalcularGruposChip() {
    if (typeof rzRamoInfo !== 'function' || typeof RZ_RAMOS === 'undefined') return; // cofre.html avulso: chips de sempre
    const r = ramoDaLente();
    const base = [{ rotulo: 'Todos', tipos: null }, { rotulo: 'Com alerta', tipos: [], alerta: true }];
    if (r === 'tudo') {
        GRUPOS_CHIP_TIPO = base.concat(RZ_RAMOS.filter(x => typeof rzRamoLiberado === 'function' ? rzRamoLiberado(x.codigo) : x.status === 'ativo').map(x => ({ rotulo: x.nome, tipos: [], ramo: x.codigo }))); // v1.112.0: só ramos contratados
    } else {
        // v1.118.0 (L5-2, D3) — segmentos na ordem do catálogo (menor ativo_tipos.ordem do segmento), não alfabética:
        // Agro = Propriedades rurais · Lavouras · Máquinas agrícolas · Estruturas
        const ordem = new Map();
        ativosDoRamo().forEach(a => { const sg = segmentoDoAtivo(a); const o = tipoDoCatalogo(a.tipo_detalhe_id)?.ordem ?? 999; if (!ordem.has(sg) || o < ordem.get(sg)) ordem.set(sg, o); });
        GRUPOS_CHIP_TIPO = base.concat([...ordem.keys()].sort((x, y) => (ordem.get(x) - ordem.get(y)) || x.localeCompare(y, 'pt-BR')).map(sg => ({ rotulo: sg, tipos: [], segmento: sg })));
    }
    if (chipAtivoAtual >= GRUPOS_CHIP_TIPO.length) { chipAtivoAtual = 0; segmentoChip = null; }
}
if (typeof window !== 'undefined') {
    window.addEventListener('raiz:ramo', () => {
        chipAtivoAtual = 0; segmentoChip = null;
        if (document.getElementById('ativos-lista')) renderAtivosLista('', document.getElementById('filtro-ativo-busca')?.value || '');
    });
}

// Ativos que passam pela busca (texto, tipo fino, situação, alerta) — sem o recorte do chip. É sobre eles
// que os chips contam: com a busca ligada, o número do chip é o que aparece ao tocar nele. (dem 1f98c359)
function ativosDaBusca() {
    const termo = (campoFiltro('filtro-ativo-busca')?.value || '').toLowerCase().trim();
    const tipoFino = campoFiltro('filtro-ativo-tipo')?.value || '';
    const filtroStatus = campoFiltro('filtro-ativo-status')?.value || '';
    const filtroAlerta = campoFiltro('filtro-ativo-alerta')?.value || '';
    if (!termo && !tipoFino && !filtroStatus && !filtroAlerta) return ativosDoRamo();
    const ocorrenciasPorAtivo = {};
    estado.ocorrenciasAbertas.forEach(oc => {
        const idAtivo = oc.cofre_itens_controle?.ativo_id;
        if (idAtivo) (ocorrenciasPorAtivo[idAtivo] = ocorrenciasPorAtivo[idAtivo] || []).push(oc);
    });
    return ativosDoRamo().filter(a => {
        if (tipoFino && a.tipo_ativo !== tipoFino) return false;
        const resumo = ehCategoriaImovel(a.tipo_ativo) ? resumoImoveisPorId.get(a.id) : null;
        if (termo && !ativoBateComTexto(a, resumo, termo, ocorrenciasPorAtivo)) return false;
        if (filtroStatus) {
            const [campo, valor] = filtroStatus.split(':');
            if (campo === 'prop' && resumo?.status !== valor) return false;
            if (campo === 'ativo' && (a.status || 'ativo') !== valor) return false;
        }
        if (filtroAlerta) {
            const tem = (ocorrenciasPorAtivo[a.id] || []).length > 0;
            if (filtroAlerta === 'com' ? !tem : tem) return false;
        }
        return true;
    });
}

function renderChipsAtivos() {
    const wrap = document.getElementById('ativos-chips-tipo');
    if (!wrap) return; // cofre.html standalone não tem este container ainda — no-op seguro
    const comAlerta = ativosComAlerta(); // v1.75.0 (F2.2)
    const base = ativosDaBusca(); // dem 1f98c359 — o contador conta o que a busca deixou
    // F2.4 (UXR-13/14/15) — Todos → ação (com ponto) → recorte (só grupos com ativo) → convite.
    const pt = piorSeveridadeAtivos();
    const chips = GRUPOS_CHIP_TIPO.map((g, i) => {
        const qtd = g.alerta ? base.filter(a => comAlerta.has(a.id)).length
            : g.ramo ? principais().filter(a => ramoDoAtivoLista(a) === g.ramo).length // v1.85.0 (F21) — chip de ramo
            : g.segmento ? base.filter(a => segmentoDoAtivo(a) === g.segmento).length // v1.85.0 (F22) — chip de segmento
            : (g.tipos ? base.filter(a => g.tipos.includes(a.tipo_ativo)).length : base.length);
        const ativo = i === chipAtivoAtual;
        if (g.alerta && !qtd && !ativo) return ''; // chip de ação só aparece com contador > 0 (UXR-15)
        if (g.tipos && g.tipos.length && !qtd && !ativo) return ''; // recorte vazio vira convite (abaixo)
        if ((g.ramo || g.segmento) && !qtd && !ativo) return ''; // v1.85.0 — ramo/segmento vazio não aparece
        const ponto = g.alerta && qtd ? `<span class="rz-pt ${pt}" aria-hidden="true"></span>` : '';
        return `<button type="button" data-action="filtrar-ativos-chip" data-chip-indice="${i}" class="rz-chip${ativo ? ' rz-on' : ''}">${ponto}${escapeHtml(g.rotulo)} <span class="rz-n">${qtd}</span></button>`;
    }).join('');
    const temCategoria = new Set(principais().map(a => categoriaDoAtivo(a.tipo_ativo)));
    const convites = principais().length && ramoDaLente() === 'tudo' ? CATEGORIAS_ATIVO.filter(c => ROTULO_CONVITE[c] && !temCategoria.has(c))
        .map(c => `<button type="button" class="rz-chip rz-chip-convite" onclick="window.__rzConviteAtivo && window.__rzConviteAtivo('${c}')" aria-label="Cadastrar ${escapeHtml(ROTULO_CONVITE[c])}">+ ${escapeHtml(ROTULO_CONVITE[c])} <span class="rz-n">0</span></button>`).join('') : '';
    wrap.innerHTML = chips + convites;
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

// ---- Busca da lista (F2.3, dem fcd3008d) -------------------------------------------------------
let ultimaContagemAtivos = 0;
const campoFiltro = (id) => document.getElementById(id);

// v1.89.0 (dem 28aa5ce1) — barra digitável (v1.90.0: sem ícone de filtros; os chips já filtram).
function atualizarRotuloBuscaAtivos() {
    if (typeof window === 'undefined') return;
    const oculto = campoFiltro('filtro-ativo-busca');
    if (typeof window.rzBuscaInline === 'function') {
        const el = window.rzBuscaInline('ativos-busca-q', (v) => { if (oculto) oculto.value = v; redesenharComFiltros(); });
        // vindo de fora (busca universal, limpar): a barra mostra o termo; nunca reescreve enquanto a pessoa digita
        if (el && oculto && document.activeElement !== el && el.value.trim() !== oculto.value) { el.value = oculto.value; el._rzMarcar && el._rzMarcar(); }
    }
}

// × da barra (dem 1f98c359): limpa texto, tipo fino, situação e alerta; o chip escolhido continua.
function limparBuscaAtivos() {
    ['filtro-ativo-busca', 'filtro-ativo-tipo', 'filtro-ativo-status', 'filtro-ativo-alerta'].forEach(id => { if (campoFiltro(id)) campoFiltro(id).value = ''; });
    redesenharComFiltros();
}

function redesenharComFiltros() {
    const tipo = campoFiltro('filtro-ativo-tipo')?.value || '';
    // tipo fino escolhido na busca vale sobre o chip; sem ele, o chip aceso continua valendo
    const tipos = tipo || (chipAtivoAtual > 0 ? GRUPOS_CHIP_TIPO[chipAtivoAtual]?.tipos : '');
    renderAtivosLista(tipos, campoFiltro('filtro-ativo-busca')?.value || '');
}

// Critério de texto da lista de Ativos, usado também pela busca universal do Hoje (F2.3b): o número
// que o Hoje mostra é o mesmo que a lista mostra depois de "Ver todos". termo já em minúsculas.
function ativoBateComTexto(a, resumo, termo, ocorrenciasPorAtivo) {
    if ((a.nome_exibicao || '').toLowerCase().includes(termo)) return true;
    if (resumo?.contratoPrincipal?.locatario && resumo.contratoPrincipal.locatario.toLowerCase().includes(termo)) return true;
    const ocorrencias = ocorrenciasPorAtivo[a.id] || [];
    return ocorrencias.some(oc => (oc.cofre_itens_controle?.titulo || '').toLowerCase().includes(termo));
}

// Busca universal do Hoje (F2.3b): ativos que batem com o texto, já no formato de linha do resultado.
export function buscarAtivosTexto(termoBruto) {
    const termo = String(termoBruto || '').toLowerCase().trim();
    if (!termo) return [];
    const ocorrenciasPorAtivo = {};
    estado.ocorrenciasAbertas.forEach(oc => {
        const idAtivo = oc.cofre_itens_controle?.ativo_id;
        if (idAtivo) (ocorrenciasPorAtivo[idAtivo] = ocorrenciasPorAtivo[idAtivo] || []).push(oc);
    });
    return estado.ativos.filter(a => {
        const resumo = ehCategoriaImovel(a.tipo_ativo) ? resumoImoveisPorId.get(a.id) : null;
        return ativoBateComTexto(a, resumo, termo, ocorrenciasPorAtivo);
    }).map(a => {
        const resumo = ehCategoriaImovel(a.tipo_ativo) ? resumoImoveisPorId.get(a.id) : null;
        const sub = [resumo?.empreendimento, resumo?.contratoPrincipal?.locatario].filter(Boolean).join(' · ') || rotuloTipoAtivo(a.tipo_ativo);
        return { id: a.id, nome: a.nome_exibicao || 'Ativo', sub, icone: iconeAtivo(a.tipo_ativo) };
    });
}

// "Ver todos" da busca universal: a lista de Ativos com o termo na barra e os demais filtros limpos.
export function verAtivosComTexto(termoBruto) {
    ['filtro-ativo-tipo', 'filtro-ativo-status', 'filtro-ativo-alerta'].forEach(id => { if (campoFiltro(id)) campoFiltro(id).value = ''; });
    if (campoFiltro('filtro-ativo-busca')) campoFiltro('filtro-ativo-busca').value = String(termoBruto || '').trim();
    renderAtivosLista('', campoFiltro('filtro-ativo-busca')?.value || '');
}

// Sheet de busca da lista de Ativos (no app). No cofre.html avulso, o dispatch abre o popup de sempre.
export function abrirBuscaAtivos() {
    if (typeof window.rzAbrirBuscaTela !== 'function') return;
    const opcoes = (id) => Array.from(campoFiltro(id)?.options || []).map(o => ({ valor: o.value, rotulo: o.textContent.trim() }));
    const grupo = (titulo, id) => ({ titulo, opcoes: opcoes(id), valor: () => campoFiltro(id)?.value || '',
        aoEscolher: (v) => { if (campoFiltro(id)) campoFiltro(id).value = v; redesenharComFiltros(); } });
    window.rzAbrirBuscaTela({
        titulo: 'Filtros', semTexto: true, // v1.89.0 — o texto é digitado na barra da tela
        grupos: [grupo('Tipo', 'filtro-ativo-tipo'), grupo('Situação', 'filtro-ativo-status'), grupo('Alerta', 'filtro-ativo-alerta')],
        contar: () => ultimaContagemAtivos, nomes: ['ativo', 'ativos'],
        aoLimpar: () => { ['filtro-ativo-tipo', 'filtro-ativo-status', 'filtro-ativo-alerta'].forEach(id => { if (campoFiltro(id)) campoFiltro(id).value = ''; }); redesenharComFiltros(); }, // v1.89.0 — o texto da barra fica
    });
}

// Chamada pelo dispatch central (cofre-app.js, case 'filtrar-ativos-chip').
// Limpa o dropdown fino do modal de propósito — os 2 filtros de tipo não
// deveriam ficar "brigando" (um mostrando subtipo, outro mostrando
// grupo); clicar um chip sempre volta o dropdown fino pra "Todos os tipos".
export function aplicarFiltroChipAtivos(indice) {
    if (indice < 0 || indice >= GRUPOS_CHIP_TIPO.length) return;
    const g = GRUPOS_CHIP_TIPO[indice];
    if (g.ramo && typeof window.escolherGeralRamo === 'function') { window.escolherGeralRamo(g.ramo); return; } // v1.85.0 — troca a lente
    chipAtivoAtual = indice;
    segmentoChip = g.segmento || null;
    const selTipo = document.getElementById('filtro-ativo-tipo');
    if (selTipo) selTipo.value = '';
    const termoAtual = document.getElementById('filtro-ativo-busca')?.value || '';
    renderAtivosLista(g.segmento ? [] : g.tipos, termoAtual);
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

// NOVO v1.47.0 (pedido explícito — "para itens diferentes de imóvel,
// inclua informação do documento como placa, pra identificar o bem",
// depois de retirar o texto de categoria do card) — 1 campo estruturado
// por tipo (dados_especificos, ver CAMPOS_POR_TIPO_ATIVO_FALLBACK em
// cofre-validacoes.js) escolhido como "o" identificador oficial do bem:
// o mesmo que já é obrigatório no cadastro pra esse tipo, quando existe
// um. Tipo sem documento oficial (obra de arte, coleção, "outro") não
// tem chave aqui — o card cai só no valor, sem inventar rótulo vazio.
const CAMPO_IDENTIFICADOR_POR_TIPO = {
    veiculo: 'placa', veiculo_blindado: 'placa',
    aeronave: 'matricula_aeronave',
    embarcacao: 'registro_capitania',
    terreno: 'matricula', imovel: 'matricula', imovel_predial: 'matricula', imovel_territorial: 'matricula',
};
function identificadorDocumentoAtivo(a) {
    const campo = CAMPO_IDENTIFICADOR_POR_TIPO[a.tipo_ativo];
    if (!campo) return null;
    return a.dados_especificos?.[campo] || null;
}

// v1.108.0 (fatia 3c, Nicola 14/10 23:22: "os ativos queria que abrissem como as despesas no financeiro ou os alertas
// agrupados") — o principal com unidades, áreas ou integrantes ganha "N integrantes" na 2ª linha e, no lugar da seta, o
// chevron para baixo que abre os subativos logo abaixo, recuados (mesma gramática dos meses do Financeiro). Tocar no resto
// da linha continua abrindo a ficha.
const subativosAbertos = new Set();
function ativoComSubativosHtml(a) {
    const subs = estado.ativos.filter(x => x.ativo_principal_id === a.id && (x.status || 'ativo') === 'ativo')
        .sort((x, y) => String(x.nome_exibicao).localeCompare(String(y.nome_exibicao), 'pt-BR'));
    if (!subs.length) return ativoCardHtml(a);
    const info = typeof rzRamoInfo === 'function' ? rzRamoInfo(a.ramo) : null;
    const nomeSub = (subs.length === 1 ? info?.nome_subativo_singular : info?.nome_subativo_plural) || (subs.length === 1 ? 'subativo' : 'subativos');
    const aberto = subativosAbertos.has(a.id);
    let html = ativoCardHtml(a);
    // v1.109.0 (3c, Nicola 23:34: "o item agrupado ficou ruim… borda do ícone na cor do ramo") — o grupo aparece no ícone
    // (borda na cor do ramo + o número de subativos); o selo fica só com a classe ("Disponível"), sem o resumo "0 de 1…"
    const corRamo = `var(--ramo-cor-${(a.ramo || 'outros').replace(/[^a-z_]/g, '')})`;
    html = html.replace('<div class="rz-row rz-link"', `<div class="rz-row rz-link" style="--ramo-grupo:${corRamo}"`);
    html = html.replace(/<div class="rz-ic"([^>]*)>/, (m0, at) => `<div class="rz-ic rz-ic-grupo"${at.replace(' style="overflow:hidden"', '')} title="${subs.length} ${escapeHtml(nomeSub.toLowerCase())}">`);
    html = html.replace(/(<div class="rz-ic rz-ic-grupo"[^>]*>[\s\S]*?)(<\/div>)/, `$1<span class="rz-ic-n">${subs.length}</span>$2`);
    const st = typeof window.rzStatusDoAtivo === 'function' ? window.rzStatusDoAtivo(a.id) : null;
    if (st && st.rotulo && st.classe && st.rotulo !== st.classe) html = html.replace(escapeHtml(st.rotulo), escapeHtml(st.classe)).replace(st.rotulo, st.classe);
    // v1.118.0 (item 30 da dem 9404081c, Nicola 19/10 08:50) — a linha entra na ficha (seta ›, como qualquer ativo) e a faixa
    // "▾ N áreas" logo abaixo abre e fecha os sub-ativos. Antes o chevron pequeno no lugar da seta fazia as duas coisas parecerem
    // a mesma; quem tocava na linha para abrir as áreas caía na ficha.
    const rotFaixa = `${subs.length} ${nomeSub.toLowerCase()}`;
    const faixa = `<button type="button" class="rz-subs-faixa" data-subs-toggle="${a.id}" aria-expanded="${aberto}"
        onclick="event.stopPropagation(); window.__rzAlternarSubativos && window.__rzAlternarSubativos('${a.id}', this)"
        style="--ramo-grupo:${corRamo}"><span><svg data-lucide="${aberto ? 'chevron-up' : 'chevron-down'}"></svg>${escapeHtml(rotFaixa)}</span></button>`;
    const filhos = subs.map(x => ativoCardHtml(x).replace('<div class="rz-row rz-link"', `<div class="rz-row rz-link rz-sub-row" style="padding-left:12px;margin-left:10px;--ramo-grupo:${corRamo}"`)).join('');
    return html + faixa + `<div class="rz-subs${aberto ? '' : ' hidden'}" data-subs-de="${a.id}">${filhos}</div>`;
}
window.__rzAlternarSubativos = (id, btn) => {
    const lista = document.querySelector(`[data-subs-de="${id}"]`);
    if (!lista) return;
    const abrir = lista.classList.contains('hidden');
    lista.classList.toggle('hidden', !abrir);
    if (abrir) subativosAbertos.add(id); else subativosAbertos.delete(id);
    if (btn) { btn.setAttribute('aria-expanded', String(abrir)); const ic = btn.querySelector('svg, i'); if (ic) ic.outerHTML = `<svg data-lucide="${abrir ? 'chevron-up' : 'chevron-down'}"></svg>`; }
    refrescarIcones();
};

function ativoCardHtml(a) {
    const ocorrenciasDoAtivo = estado.ocorrenciasAbertas.filter(oc => oc.cofre_itens_controle?.ativo_id === a.id);
    const proximo = ocorrenciasDoAtivo.map(oc => diasAte(oc.data_prevista_atual)).filter(d => d !== null).sort((x, y) => x - y)[0];
    // v1.21.0 — alerta de vencimento na MESMA linguagem do status (Nicola:
    // "tags diferentes ficou ruim"): ponto + rótulo via renderStatus.
    const rsA = (sem, t) => (typeof window.renderStatus === 'function') ? window.renderStatus(sem, t) : `<span class="rz-st rz-${sem}">${t}</span>`;
    // v1.44.0 (pedido explícito, 16/09) — "reduza o componente que mostra
    // o alarme": "Em dia" saiu (não é alarme, é ausência de um — repetia
    // o card inteiro sem alerta nenhum); só ocupa a extrema direita quando
    // há de fato algo a tratar (vencido ou vencendo em ≤30d), curto, como
    // o sinal de quantidade do Outlook.
    // CORRIGIDO v1.47.0 (padrão "há/em xx d", achado pelo Nicola —
    // print mostrando "29 dias" no card do ativo em vez de "Em 29d"):
    // só o dia exato do vencimento é 'warn' (marrom, "vai virar
    // problema"); o resto do prazo ainda não vencido é 'run' (azul,
    // REGRAS_EXPERIENCIA §9 — mesma semântica de "A vencer"/"A pagar").
    const chip = proximo === undefined || proximo === null || proximo > 30 ? null
        : proximo < 0 ? { html: rsA('bad', `há ${Math.abs(proximo)}d`) }
        : proximo === 0 ? { html: rsA('warn', 'Vence hoje') }
        : { html: rsA('run', `Em ${proximo}d`) };
    // CORRIGIDO v1.47.0 (pedido explícito, achado no print — valores com
    // casa decimal poluindo a lista) — sem decimais aqui (lista); o valor
    // exato com centavos continua em toda tela que precisa dele (ficha
    // do ativo, financeiro), formatarMoedaBR()/fmtMoeda locais de sempre,
    // intocados.
    const fmtMoeda = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 });
    const identificadorDocumento = identificadorDocumentoAtivo(a);
    // v1.52.0 — valor de mercado (a.valor_referencia) movido pro escopo
    // compartilhado da função: agora usado tanto no ramo de imóvel quanto
    // no card genérico (ver notas abaixo).
    const valorFmt = a.valor_referencia != null ? fmtMoeda(a.valor_referencia) : null;

    // v1.7.0 — ativo do tipo imóvel COM resumo carregado: mesma "cara"
    // exata da lista antiga de Imóveis (montarCabecalhoImovelHtml, no
    // index.html) — avatar com foto real (ou casinha), título
    // "Empreendimento · Tipo · Finalidade", endereço, situação
    // (locatário/status à esquerda, aluguel à direita) e selo de status
    // colorido (Vago=âmbar/Assinando=azul/Alugado=verde/demais=cinza).
    // Sem resumo ainda carregado (1ª renderização, antes do bulk fetch
    // resolver) ou ativo de outro tipo: cai no card genérico de sempre.
    const resumoImovel = ehCategoriaImovel(a.tipo_ativo) ? resumoImoveisPorId.get(a.id) : null;

    if (resumoImovel) {
        const principal = resumoImovel.contratoPrincipal;
        // v1.20.0 (Nicola 03/09): "sem contrato mostrando Alugado" — o status
        // do imóvel legado (imoveis.status) fica desatualizado; a TAG passa a
        // ser derivada do contrato principal: vigente → Alugado, assinando →
        // Assinando, uso próprio → Em uso, senão Vago. E "Uso Pessoal / Long
        // Stay" sai do título (redundante com a tag).
        const usoProprio = resumoImovel.finalidadeUso === 'uso_proprio';
        // v1.21.0 — BUG: o status do contrato no resumo vem MINÚSCULO do banco
        // ('ativo'); a comparação com 'Ativo' deixava tudo "Vago".
        const stPrincipal = String(principal?.status || '').toLowerCase();
        // v1.97.0 (usos fatia 0) — sem contrato vigente, a etiqueta vem do uso de hoje (fn_entidade_status, ativo_usos):
        // "Vago" passa a "Disponível"; Uso próprio e Uso férias aparecem pelo nome, em cinza.
        const stHoje = typeof window.rzStatusDoAtivo === 'function' ? window.rzStatusDoAtivo(a.id) : null;
        const usoHoje = stHoje && !stHoje.contrato_id && stHoje.modelo && stHoje.modelo !== 'vago' ? stHoje.nome : null;
        // sem status carregado, cai na Situação gravada (derivada do uso no banco), nunca em "Disponível" por omissão
        const semStatus = { disponivel: 'Disponível', em_uso: 'Em uso', alugado: 'Alugado', assinando: 'Assinando' }[a.situacao_uso] || '';
        const situacao = (stPrincipal === 'ativo') ? 'Alugado'
            : (stPrincipal === 'assinando') ? 'Assinando'
            : usoHoje ? usoHoje
            : stHoje ? 'Disponível'
            : semStatus || (usoProprio ? 'Em uso' : '');
        const alugado = situacao === 'Alugado';
        // "Disponível" em vinho só onde vago custa (imóvel predial de renda); fazenda, terreno e área ficam em cinza, como no
        // card genérico — a mesma situação não pode ter duas cores na mesma lista (dem 9404081c, pedido de 18/10)
        const predial = a.tipo_ativo === 'imovel_predial' || a.tipo_ativo === 'imovel';
        const rsSem = { Alugado: 'ok', Assinando: 'run', 'Disponível': predial ? 'warn' : 'neu' }[situacao] || 'neu';
        const badgeHtml = !situacao ? '' : (typeof window.renderStatus === 'function') ? window.renderStatus(rsSem, situacao) : `<span class="rz-st rz-${rsSem}">${situacao}</span>`;

        // v1.45.0 (17/09/2026, pedido explícito) — a linha "Empreendimento ·
        // Tipo" (titulo) SAIU de dentro da caixa: o agrupador da lista
        // (.rz-group, "CANAÃ (6)") já mostra o empreendimento, e o Nicola
        // pediu explicitamente pra tirar essa redundância. O endereço
        // (a.nome_exibicao) vira a linha de título do card (única linha
        // que identifica QUAL imóvel é, agora que "Canaã · Casa" saiu).
        // CORRIGIDO v1.52.0 (19/09/2026, rodada 10, pedido explícito —
        // "a descrição do card de ativos na lista de ativos ainda não está
        // legal... na 2a linha, o valor de mercado, sem casa decimal. na 3a
        // linha o nome locatario. na quarta linha, o valor do aluguel...
        // Em itens nao alugados, no lugar do aluguel coloque sem contrato e
        // no lugar do valor do aluguel, deixe em branco") — a v1.51.0
        // (comentário removido, histórico) ainda juntava "tipo de uso +
        // valor de mercado" na linha 2 e usava 3 textos de status
        // diferentes (Assinando/Uso próprio/Sem contrato cadastrado) na
        // linha 3; pedido de hoje simplifica pra 4 linhas ainda mais
        // diretas: (1) nome [já era o <h3>], (2) só valor de mercado,
        // (3) locatário OU "Sem contrato" (o selo colorido à direita já
        // diferencia Assinando/Em uso/Vago — não precisa repetir o texto
        // aqui), (4) aluguel — que só aparece quando alugado (senão fica
        // em branco, ou seja, a linha nem é renderizada).
        // "Sem contrato" só no imóvel predial; fazenda, gleba e terreno sem contrato não ganham linha (dem 9404081c, 18/10)
        const linhaLocatario = alugado ? (principal.locatario || 'Locatário não informado') : (predial ? 'Sem contrato' : '');
        const aluguelFmt = alugado && principal.valor != null ? `${fmtMoeda(principal.valor)}/mês` : null;

        // v1.51.0 — ícone/avatar centralizado na ALTURA da caixa. Imóvel com
        // resumo agora tem até 4 linhas de texto (nome + valor + locatário
        // + aluguel) — mais alto que o card genérico (nome + 1 linha) de
        // propósito, ver nota acima.
        return `<div class="rz-row rz-link" role="button" tabindex="0" data-action="abrir-ativo" data-id="${a.id}" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">
            <div class="rz-ic"${resumoImovel.foto ? ' style="overflow:hidden"' : ''}>
                ${resumoImovel.foto ? `<img src="${resumoImovel.foto}" class="w-full h-full object-cover">` : `<svg data-lucide="${predial ? 'home' : iconeAtivo(a.tipo_ativo)}"></svg>`}
            </div>
            <div class="rz-tx">
                <b style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;white-space:normal;word-break:break-word">${escapeHtml(a.nome_exibicao)}</b>
                ${valorFmt ? `<span>${escapeHtml(valorFmt)}</span>` : ''}
                ${linhaLocatario ? `<span>${escapeHtml(linhaLocatario)}</span>` : ''}
                ${aluguelFmt ? `<span>${escapeHtml(aluguelFmt)}</span>` : ''}
            </div>
            <div class="rz-rt">
                ${badgeHtml}
                ${chip ? chip.html : ''}
            </div>
            <svg data-lucide="chevron-right" class="rz-chev"></svg>
        </div>`;
    }

    // Card genérico (ativos que não são imóvel, ou imóvel sem resumo
    // ainda carregado). CORRIGIDO v1.52.0 (19/09/2026, rodada 10, pedido
    // explícito — "para os demais ativos, na 1 linha coloque o nome do
    // ativo, na 2a linha o valor de mercado sem casa decimal, na 3a linha
    // modelo e a 4a linha um identificador como placa ou identificacao ou
    // registro") — a v1.47.0 (comentário removido, histórico) juntava
    // identificador + valor numa linha só, separados por "·". Agora 4
    // linhas fixas, 1 informação por linha, mesmo espírito do card de
    // imóvel acima: (1) nome, (2) valor de mercado, (3) modelo
    // (dados_especificos.modelo — só existe pra veículo/veículo
    // blindado/aeronave/embarcação; tipo sem esse campo simplesmente não
    // mostra a linha), (4) identificador oficial do bem (placa/matrícula/
    // registro — identificadorDocumentoAtivo(), calculado acima, já por
    // tipo). Linha ausente (sem valor/modelo/identificador) não deixa
    // "·" solto nem linha em branco — some inteira, como já era o padrão
    // no resto da lista.
    const modeloAtivo = a.dados_especificos?.modelo || null;
    // v1.97.0 (usos fatia 0) — selo do status de hoje (classe · modelo), o mesmo da ficha e do bot
    const stGen = typeof window.rzStatusDoAtivo === 'function' ? window.rzStatusDoAtivo(a.id) : null;
    const rotSit = { disponivel: ['warn', 'Disponível'], em_uso: ['neu', 'Em uso'], alugado: ['ok', 'Alugado'], assinando: ['run', 'Assinando'] }[a.situacao_uso];
    // na lista vai só o nome do uso (Lavoura, Disponível, Moradia); "Em produção · Lavoura" fica no topo da ficha (dem 9404081c, 18/10)
    const seloGen = typeof window.renderStatus !== 'function' ? ''
        : stGen ? window.renderStatus(stGen.sem, stGen.contrato_status === 'assinando' ? stGen.rotulo : stGen.nome)
        : rotSit ? window.renderStatus(rotSit[0], rotSit[1]) : ''; // sem status carregado: a Situação gravada (derivada do uso)
    return `<div class="rz-row rz-link" role="button" tabindex="0" data-action="abrir-ativo" data-id="${a.id}" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">
        <div class="rz-ic"><svg data-lucide="${iconeAtivo(a.tipo_ativo)}"></svg></div>
        <div class="rz-tx">
            <b style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;white-space:normal;word-break:break-word">${escapeHtml(a.nome_exibicao)}</b>
            ${valorFmt ? `<span>${escapeHtml(valorFmt)}</span>` : ''}
            ${modeloAtivo ? `<span>${escapeHtml(modeloAtivo)}</span>` : ''}
            ${identificadorDocumento ? `<span>${escapeHtml(identificadorDocumento)}</span>` : ''}
        </div>
        ${(seloGen || chip) ? `<div class="rz-rt">${seloGen}${chip ? chip.html : ''}</div>` : ''}
        <svg data-lucide="chevron-right" class="rz-chev"></svg>
    </div>`;
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
// v1.102.0 (usos fatia 3) — opcoes.principal = { id, nome, singular }: o formulário cadastra uma unidade, área ou
// integrante dentro desse ativo (cota cofre.subativos.criar, só tipos que podem ser subativo, sem valor de referência).
let subativoDe = null;
export async function abrirFormAtivo(opcoes = {}) {
    const principal = opcoes && opcoes.principal && opcoes.principal.id ? opcoes.principal : null;
    // v1.62.0 (8b2d37d7) — cota/plano/perfil ANTES do formulário (ACE-04).
    if (rzMostrarBloqueio(principal ? 'cofre.subativos.criar' : 'cofre.ativos.criar')) return;
    subativoDe = principal;
    document.getElementById('at-status').textContent = '';
    await garantirCatalogoTiposAtivo();
    await garantirEmpreendimentos(); // E15.2 — pro seletor no bloco imóvel
    popularSelectTipoAtivo(); // v1.85.0 (F21) — categorias do ramo da lente
    const tituloForm = document.querySelector('#form-ativo-wrapper h3');
    if (tituloForm) tituloForm.textContent = subativoDe ? `${femSubativo(subativoDe.singular) ? 'Nova' : 'Novo'} ${subativoDe.singular.toLowerCase()} · ${subativoDe.nome}` : rotuloNovoAtivo();
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
    subativoDe = null; // v1.102.0 — o próximo Novo ativo volta ao normal
}

export async function aoMudarTipoAtivo() {
    const tipo = document.getElementById('at-tipo').value;
    // v1.41.0 (16/09/2026, pedido explícito do Nicola, achado no teste
    // real) — seletor "Qual imóvel?" (vincular a um imóvel já existente)
    // removido do form de CRIAR ativo. Desde o único caminho de escrita
    // da Onda 12, criar sempre nasce ativo nativo em cofre_ativos direto
    // — não existe mais ganho em "vincular" a um dos 104 legados em vez
    // de só criar; a opção só confundia (e tinha um texto de rodapé,
    // "vinculado a um imóvel existente: não duplica dados", que não
    // fazia mais sentido nenhum). Ver atualizarCamposEstruturadosAtivo()
    // e salvarAtivo() logo abaixo — os 2 perderam o branch "vinculado".
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
    // v1.41.0 (16/09/2026) — sem branch "vinculado a existente" mais: o
    // form de criar sempre gera ativo nativo (ver aoMudarTipoAtivo()).
    // E5 — tipo_detalhe_id (uuid) do 2º seletor, quando existir; some
    // pra undefined se o seletor não existir ou estiver escondido (sem
    // tipo específico cadastrado pra essa categoria) — obterCamposPorTipo
    // trata null igual a "só os campos de categoria", comportamento de
    // antes da E5.
    const selDetalhe = document.getElementById('at-tipo-detalhe');
    const tipoDetalheId = selDetalhe && selDetalhe.value ? selDetalhe.value : null;
    const contexto = subativoDe ? 'subativo' : 'ativo';
    document.getElementById('at-campos-estruturados').innerHTML = renderizarCamposEstruturados(tipo, {}, 'at-campo-', tipoDetalheId, contexto);
    // v1.107.0 (fatia 3b) — exemplo do nome pelo tipo (ativo_tipos.exemplo_nome)
    const inNome = document.getElementById('at-nome');
    if (inNome) inNome.placeholder = tipoDoCatalogo(tipoDetalheId)?.exemplo_nome ? 'ex.: ' + tipoDoCatalogo(tipoDetalheId).exemplo_nome : '';

    // v1.107.0 (fatia 3b, F3b-1) — os blocos fixos vêm do catálogo (ativo_tipos_campos, tipo_dado 'bloco', por contexto).
    // Sem catálogo de blocos, o formulário de antes: empreendimento/valor para todos, endereço e dados do imóvel para imóvel.
    const blocos = blocosDoFormulario(tipo, tipoDetalheId, contexto);
    const tem = (b) => blocos ? blocos.has(b) : (b === 'empreendimento' || b === 'valor_referencia' || b === 'divisao_societaria'
        || ((b === 'endereco' || b === 'dados_imovel') && ehCategoriaImovel(tipo)));
    blocosFormAtual = { tem };

    // E15.2 (achado no teste real, 16/09/2026) — empreendimento/valor de referência valem pra QUALQUER tipo de ativo.
    // v1.107.0 (fatia 3b, F3b-5) — a finalidade sai do cadastro: vem do uso (demanda 091b87d4).
    const wrapEmpVal = document.getElementById('at-empreendimento-valor-wrapper');
    if (wrapEmpVal) {
        const mostraEmpVal = tem('empreendimento') || tem('valor_referencia');
        wrapEmpVal.classList.toggle('hidden', !mostraEmpVal);
        wrapEmpVal.innerHTML = mostraEmpVal ? renderizarBlocoEmpreendimentoValor('at-empval-', {}, _empreendimentosCache || [], { comFinalidade: false }) : '';
        if (mostraEmpVal && !tem('empreendimento')) document.getElementById('at-empval-empreendimento-id')?.closest('.rz-f')?.classList.add('hidden');
        if (mostraEmpVal && !tem('valor_referencia')) document.getElementById('at-empval-valor-referencia')?.closest('.rz-f')?.classList.add('hidden');
    }

    // v1.32.0 (E6.2) — endereço estruturado. v1.107.0 — no subativo, só o complemento: o resto vem do principal.
    const wrapEndereco = document.getElementById('at-endereco-wrapper');
    if (wrapEndereco) {
        const soComplemento = !tem('endereco') && tem('endereco_complemento');
        const mostraEnd = tem('endereco') || soComplemento;
        wrapEndereco.classList.toggle('hidden', !mostraEnd);
        if (mostraEnd) {
            const pr = soComplemento && subativoDe ? (estado.ativos.find(x => x.id === subativoDe.id) || {}) : {};
            wrapEndereco.innerHTML = renderizarBlocoEndereco('at-endereco', soComplemento ? { ...pr, endereco_comp: '' } : {}, { mostrarBotaoCopiar: false });
            if (soComplemento) {
                const comp = document.getElementById('at-endereco-comp');
                wrapEndereco.querySelectorAll('.rz-f').forEach(f => { if (!f.contains(comp)) f.classList.add('hidden'); });
                const rotComp = comp?.closest('.rz-f')?.querySelector('label'); if (rotComp) rotComp.textContent = 'Complemento (o resto do endereço vem de ' + subativoDe.nome + ')';
            }
        } else wrapEndereco.innerHTML = '';
    }

    // E15.2 ("A2") — dados do imóvel (área, aluguel esperado, CIB, observação). v1.107.0 — sem Finalidade e Situação.
    const wrapImovel = document.getElementById('at-imovel-wrapper');
    if (wrapImovel) {
        wrapImovel.classList.toggle('hidden', !tem('dados_imovel'));
        wrapImovel.innerHTML = tem('dados_imovel') ? renderizarBlocoImovel('at-imovel-', {}, { cadastro: true, tipoDetalheId }) : '';
    }
    // divisão societária (wrapper no markup)
    document.getElementById('naf-pe-wrapper')?.classList.toggle('hidden', !tem('divisao_societaria'));
}
let blocosFormAtual = null; // v1.107.0 — o salvarAtivo lê daqui o que o formulário mostrou

// E5 — chamado pelo data-action-change do #at-tipo-detalhe: só precisa
// re-renderizar os campos (o tipo/categoria não mudou), não o resto do
// form inteiro.
export function aoMudarTipoDetalheAtivo() {
    // v1.107.0 (fatia 3b) — subativo: o seletor único traz a categoria do tipo escolhido
    if (subativoDe) {
        const cat = document.getElementById('at-tipo-detalhe')?.selectedOptions[0]?.dataset.categoria;
        const selCat = document.getElementById('at-tipo');
        if (cat && selCat) selCat.value = cat;
    }
    atualizarCamposEstruturadosAtivo();
}

// v1.117.0 (L4-B, dem 9404081c) — tipo_dado 'tamanho' (número + unidade, gravado "186 ha") e 'coordenadas' (latitude e
// longitude, gravado "-21.2500, -45.0000"). A área em ha/alqueire também vira m² na coluna area_m2 (areaM2DoTamanho), para o
// Resultado e os relatórios continuarem lendo um número só. Alqueire mineiro = 4,84 ha; paulista = 2,42 ha.
const M2_POR_UNIDADE = { 'ha': 10000, 'alqueire mineiro': 48400, 'alqueire paulista': 24200, 'm²': 1 };
function separarTamanho(v, unidades) {
    const m = String(v ?? '').trim().match(/^(-?[\d.,]+)\s*(.*)$/);
    if (!m) return { valor: '', unidade: unidades[0] || '' };
    const un = unidades.includes(m[2]) ? m[2] : (unidades[0] || m[2]);
    return { valor: m[1].replace(',', '.'), unidade: un };
}
export function areaM2DoTamanho(texto) {
    const m = String(texto ?? '').trim().match(/^(-?[\d.]+)\s*(.*)$/);
    if (!m || !(m[2] in M2_POR_UNIDADE)) return null;
    return Math.round(parseFloat(m[1]) * M2_POR_UNIDADE[m[2]] * 100) / 100;
}
function renderizarCamposEstruturados(tipo, valores, prefixoId = 'at-campo-', tipoDetalheId = null, contexto = 'ativo') {
    const campos = obterCamposPorTipo(tipo, tipoDetalheId, contexto);
    // v1.107.0 (fatia 3b) — campo em lista (catálogo, opcoes); valor antigo fora da lista continua aparecendo
    const controle = (c) => {
        const v = valores[c.chave] || '';
        if (c.tipo === 'lista' && Array.isArray(c.opcoes)) {
            const ops = v && !c.opcoes.includes(v) ? [...c.opcoes, v] : c.opcoes;
            return `<select id="${prefixoId}${c.chave}"><option value="">—</option>${ops.map(o => `<option${o === v ? ' selected' : ''}>${escapeHtml(o)}</option>`).join('')}</select>`;
        }
        if (c.tipo === 'tamanho') {
            const uns = Array.isArray(c.opcoes) && c.opcoes.length ? c.opcoes : ['m²'];
            const t = separarTamanho(v, uns);
            return `<div style="display:flex;gap:8px"><input type="number" step="any" min="0" inputmode="decimal" id="${prefixoId}${c.chave}" value="${escapeHtml(t.valor)}" style="flex:1;min-width:0">` +
                `<select id="${prefixoId}${c.chave}-un" aria-label="Unidade" style="flex:0 0 auto;width:auto">${uns.map(u => `<option${u === t.unidade ? ' selected' : ''}>${escapeHtml(u)}</option>`).join('')}</select></div>`;
        }
        if (c.tipo === 'coordenadas') {
            const [la, ln] = String(v).split(',').map(x => (x || '').trim());
            return `<div style="display:flex;gap:8px"><input type="text" inputmode="decimal" id="${prefixoId}${c.chave}-lat" value="${escapeHtml(la || '')}" placeholder="Latitude (ex.: -21.2510)" style="flex:1;min-width:0">` +
                `<input type="text" inputmode="decimal" id="${prefixoId}${c.chave}-lng" value="${escapeHtml(ln || '')}" placeholder="Longitude (ex.: -45.0012)" style="flex:1;min-width:0"></div>`;
        }
        return `<input type="${c.tipo === 'number' ? 'number' : c.tipo === 'date' ? 'date' : 'text'}" id="${prefixoId}${c.chave}" value="${escapeHtml(v)}">`;
    };
    return campos.map(c => `
        <div class="rz-f">
            <label>${escapeHtml(c.label)} ${c.obrigatorio ? '<i>*</i>' : ''}</label>
            ${controle(c)}
        </div>`).join('');
}

function lerCamposEstruturados(tipo, prefixoId = 'at-campo-', tipoDetalheId = null, contexto = 'ativo') {
    const campos = obterCamposPorTipo(tipo, tipoDetalheId, contexto);
    const dados = {};
    for (const c of campos) {
        if (c.tipo === 'tamanho') {
            const n = (document.getElementById(`${prefixoId}${c.chave}`)?.value || '').trim().replace(',', '.');
            const un = document.getElementById(`${prefixoId}${c.chave}-un`)?.value || '';
            if (n) dados[c.chave] = `${n} ${un}`.trim();
            continue;
        }
        if (c.tipo === 'coordenadas') {
            const la = (document.getElementById(`${prefixoId}${c.chave}-lat`)?.value || '').trim().replace(',', '.');
            const ln = (document.getElementById(`${prefixoId}${c.chave}-lng`)?.value || '').trim().replace(',', '.');
            if (la || ln) dados[c.chave] = `${la}, ${ln}`;
            continue;
        }
        const el = document.getElementById(`${prefixoId}${c.chave}`);
        if (el && el.value.trim()) dados[c.chave] = el.value.trim();
    }
    return dados;
}
// v1.117.0 (L4-B) — imóvel rural sem o bloco de endereço: município, UF e CEP da sede vão também para as colunas de endereço
// (lista, relatórios e busca por cidade seguem funcionando); a área total vai para area_m2.
function enderecoDaSedeRural(dados) {
    if (!dados || !(dados.municipio_sede || dados.uf_sede || dados.cep)) return null;
    return { endereco_cidade: dados.municipio_sede || null, uf: (dados.uf_sede || '').toUpperCase() || null,
             cep: (dados.cep || '').replace(/\D/g, '') || null };
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
    const contextoForm = subativoDe ? 'subativo' : 'ativo'; // v1.107.0 (fatia 3b)
    const dadosEspecificos = lerCamposEstruturados(tipo, 'at-campo-', tipoDetalheId, contextoForm);

    const erros = validarCamposAtivo(tipo, nome, dadosEspecificos, tipoDetalheId, contextoForm);
    if (erros.length) { erroInline(statusEl, '⚠️ ' + erros[0]); return; }

    // v1.107.0 (fatia 3b) — divisão societária só quando o formulário mostrou o bloco; o subativo herda a do principal
    const comDivisao = blocosFormAtual ? blocosFormAtual.tem('divisao_societaria') : true;
    // v1.11.0 (NOVO, 02/09/2026) — mesma validação de soma=100% que o
    // chip Propriedade usa, agora também na criação (DB também valida
    // via trigger — dupla checagem, nunca confia só no cliente).
    const somaPropriedade = comDivisao ? propriedadeSomaAtual() : 100;
    // proprietário é opcional (Nicola 16/10, dem 9404081c item 17a): sem nenhuma linha passa; com linhas, a soma tem de dar 100%
    // linha sem pessoa e sem nome (a que o formulário traz pronta) conta como "sem proprietário", não como erro
    propriedadeLinhasEmEdicao = (propriedadeLinhasEmEdicao || []).filter(l => l.pessoa_id || (l.nome_externo || '').trim());
    const temLinhasDono = comDivisao && propriedadeLinhasEmEdicao.length > 0;
    if (temLinhasDono && Math.round(propriedadeSomaAtual() * 100) / 100 !== 100) {
        erroInline(statusEl, `⚠️ A soma da divisão societária precisa ser 100% (está em ${propriedadeSomaAtual()}%).`);
        return;
    }
    for (const l of (comDivisao ? propriedadeLinhasEmEdicao : [])) {
        const temNome = l.tipo_proprietario === 'socio_interno' ? !!l.pessoa_id : !!(l.nome_externo && l.nome_externo.trim());
        if (!temNome) { erroInline(statusEl, '⚠️ Preencha o sócio/nome de todas as linhas da divisão societária.'); return; }
    }

    // v1.41.0 (16/09/2026, pedido explícito) — sem "Qual imóvel?" mais:
    // categoria imóvel sempre cria nativo, direto em cofre_ativos, via
    // criarImovelEAtivo(). Não existe mais o modo "vinculado a um
    // existente" no form de CRIAR (a ficha de EDITAR de um imóvel legado
    // continua funcionando igual, isto é só o formulário de criação).
    const ehImovel = ehCategoriaImovel(tipo);
    const principal = subativoDe; // v1.102.0 (usos fatia 3) — unidade, área ou integrante nasce dentro do principal

    const payload = { cliente_id: estado.clienteId, tipo_ativo: tipo, tipo_detalhe_id: tipoDetalheId, nome_exibicao: nome, status: 'ativo', dados_especificos: dadosEspecificos, criado_por: estado.pessoa.id };
    if (principal) payload.ativo_principal_id = principal.id;

    // E15.2 (achado no teste real, 16/09/2026) — empreendimento/valor de
    // referência valem pra QUALQUER tipo de ativo; área/finalidade/
    // situação/aluguel/observação só categoria imóvel.
    const empvalLido = await lerBlocoEmpreendimentoValor('at-empval-', estado.clienteId);
    let enderecoLido = null, camposImovelLido = null, aluguelDesejado = null;
    if (ehImovel) {
        // v1.117.0 (L4-B) — tipo rural esconde o endereço urbano e os dados do imóvel (catálogo, linha 'oculto'): lê da sede
        const temEnd = blocosFormAtual ? blocosFormAtual.tem('endereco') || blocosFormAtual.tem('endereco_complemento') : true;
        const temImovel = blocosFormAtual ? blocosFormAtual.tem('dados_imovel') : true;
        enderecoLido = temEnd ? lerBlocoEndereco('at-endereco') : enderecoDaSedeRural(dadosEspecificos);
        const lidoImovel = temImovel ? lerBlocoImovel('at-imovel-') : { camposImovel: { area_m2: areaM2DoTamanho(dadosEspecificos.area) }, aluguelDesejado: null };
        camposImovelLido = lidoImovel.camposImovel;
        aluguelDesejado = lidoImovel.aluguelDesejado;
        if (aluguelDesejado !== null) payload.dados_especificos.aluguel_desejado = aluguelDesejado;
    }

    try {
        let novoAtivo;
        if (ehImovel) {
            const imovelDados = {
                ...(enderecoLido || {}),
                empreendimento_id: empvalLido?.empreendimento_id ?? null,
                valor_mercado: empvalLido?.valor_referencia ?? null,
                valor: aluguelDesejado,
                tamanho: camposImovelLido?.area_m2 ?? null,
                finalidade_uso: camposImovelLido?.finalidade_uso || null,
                status: camposImovelLido?.situacao_uso || null,
                descricao: camposImovelLido?.observacao || null,
                cib: camposImovelLido?.cib || null,
                ativo_principal_id: principal?.id || null,
            };
            novoAtivo = await api.criarImovelEAtivo(estado.clienteId, nome, tipo, imovelDados, tipoDetalheId, payload.dados_especificos);
        } else {
            Object.assign(payload, empvalLido);
            if (principal) { payload.valor_referencia = null; payload.valor_referencia_em = null; }
            novoAtivo = await api.criarAtivo(payload);
        }
        // Divisão societária gravada logo em seguida, já com o id do
        // ativo recém-criado — mesma RPC do chip Propriedade, nenhuma
        // lógica duplicada. criarImovelEAtivo devolve {ativo_id,
        // imovel_id}; criarAtivo devolve a linha inteira (.id) — os dois
        // formatos coexistem aqui de propósito.
        const paraApi = (ls) => ls.map(l => ({
            tipo_proprietario: l.tipo_proprietario,
            pessoa_id: l.pessoa_id || '',
            nome_externo: l.nome_externo || '',
            percentual: parseFloat(l.percentual) || 0
        }));
        // v1.107.0 (fatia 3b) — sem o bloco: subativo copia a divisão do principal; vida não tem divisão
        if (comDivisao) await api.salvarPropriedadeAtivo(novoAtivo.ativo_id || novoAtivo.id, paraApi(propriedadeLinhasEmEdicao));
        else if (principal) {
            const doPrincipal = await api.buscarPropriedadeDoAtivo(principal.id).catch(() => []);
            if (doPrincipal && doPrincipal.length) await api.salvarPropriedadeAtivo(novoAtivo.ativo_id || novoAtivo.id, paraApi(doPrincipal));
        }

        // v1.117.0 (L4-C, decisão D2) — cadastrado pela lente de outro ramo (Casa na lente Família): o ativo fica no ramo do tipo
        // e já nasce com o uso daquele ramo (Moradia, hoje); é o uso que o mostra na lente. Falha no uso não desfaz o cadastro.
        let usoLente = null;
        const lenteCad = ramoDaLente();
        const detCad = tipoDoCatalogo(tipoDetalheId);
        if (!principal && lenteCad !== 'tudo' && detCad && detCad.ramo !== lenteCad && detCad.usos_por_ramo?.[lenteCad]) {
            usoLente = detCad.usos_por_ramo[lenteCad];
            const hoje = new Date(); const iso = new Date(hoje.getTime() - hoje.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
            const { error: eUso } = await api.dbAuth.rpc('fn_ativo_uso_iniciar', { p_ativo_id: novoAtivo.ativo_id || novoAtivo.id, p_modelo: usoLente,
                p_inicio: iso, p_fim: null, p_observacao: null, p_canal: 'app' });
            if (eUso) { console.warn('[cofre-ativos] uso da lente:', eUso.message); mostrarToast('Cadastrado, mas o uso não foi iniciado: ' + eUso.message, 'aviso'); usoLente = false; }
        }
        if (usoLente !== false) mostrarToast(principal ? `${principal.singular} cadastrad${femSubativo(principal.singular) ? 'a' : 'o'} em ${principal.nome} ✅` : ehImovel ? 'Imóvel cadastrado ✅' : 'Ativo cadastrado ✅');
        document.getElementById('at-nome').value = '';
        fecharFormAtivo();
        // o ativo nasce com uso (repouso do tipo): relê o status antes de repintar, senão a lista mostra o ativo novo sem
        // etiqueta e o cache antigo segura "Disponível" (dem 9404081c, itens 25 e 26)
        try { if (typeof window.rzRecarregarUsosRamo === 'function') await window.rzRecarregarUsosRamo(); } catch (e) { console.warn('[cofre-ativos] status:', e?.message || e); }
        window.dispatchEvent(new CustomEvent('cofre:recarregar-ativos'));
        recarregarFuncionalidadesLiberadas().catch(() => {}); // v1.62.0 — cota mudou
        // v1.102.0 — volta para a ficha do principal com o card atualizado
        if (principal && ativoAtualId === principal.id && estado.ativoEmFoco) montarSubativosAtivo(estado.ativoEmFoco).catch(() => {});
    } catch (err) {
        // v1.62.0 — porta do banco (c3_porta_amigos_v1): texto já vem no
        // padrão do design system; mostra como aviso e atualiza a porta.
        if (String(err?.details || '').startsWith('rz_porta:')) {
            statusEl.textContent = err.message; statusEl.style.color = 'var(--warning)';
            recarregarFuncionalidadesLiberadas().catch(() => {});
            return;
        }
        erroInline(statusEl, '❌ ' + err.message);
    }
}

// ============================================================================
// FICHA DO ATIVO — abre SEMPRE em Resumo (Adendo §7.1)
// ============================================================================
export async function abrirFichaAtivo(id, chipInicial = 'resumo') {
    const a = estado.ativos.find(x => x.id === id) || await api.buscarAtivoPorId(id);
    if (!a) { mostrarToast('Ativo não encontrado.', 'erro'); return; }
    // a ficha lê o tipo do catálogo (cabeçalho, usos permitidos, campos): sem esperar o catálogo, quem abre a ficha direto
    // via "Terreno" e só os usos do ramo, sem Arrendamento (dem 9404081c, 18/10)
    await garantirCatalogoTiposAtivo();
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
            <span>${escapeHtml(tipoDoCatalogo(a.tipo_detalhe_id)?.nome || rotuloTipoAtivo(a.tipo_ativo))}</span>
        </div>
        <span id="fa-status-selo">${statusAtivoHtml(a)}</span>
        <button type="button" data-action="abrir-acoes-ativo" class="rz-more rz-more-topo" aria-label="Ações do ativo"><i data-lucide="ellipsis-vertical"></i></button>
    `; // v1.94.0 (UX onda 3, D11) — o ⋮ do topo reúne todas as ações do ativo, em grupos
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
        seguro(montarUsosAtivo, 'montarUsosAtivo'), // v1.86.0 (F25)
        seguro(montarOcupacaoAtivo, 'montarOcupacaoAtivo'), // v1.92.0
        seguro(montarFotosAtivo, 'montarFotosAtivo'),
        seguro(montarFinanceiroAtivo, 'montarFinanceiroAtivo'),
        seguro(montarPropriedadeAtivo, 'montarPropriedadeAtivo'),
        seguro(montarSubativosAtivo, 'montarSubativosAtivo'), // v1.102.0 (usos fatia 3)
        seguro(montarMembrosAtivo, 'montarMembrosAtivo'), // v1.113.0 (usos fatia 7)
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
const CHIP_CODIGO = { contratos: 'contratos.ver', controles: 'cofre.controles.ver', financeiro: 'mensal.ver', movimento: 'mensal.ver', arquivos: 'cofre.ver' };
export function faTrocarAba(nomeAba) {
    // v1.17.0 — chips .rz-chip: destaque é só a classe .rz-on (sem style
    // inline). Compatibilidade: 'dados' → 'resumo', 'propriedade' → 'resumo',
    // 'documentos'/'fotos' → 'arquivos' (quem chamava com os nomes antigos
    // continua caindo no lugar certo).
    const mapa = { dados: 'resumo', propriedade: 'resumo', documentos: 'arquivos', fotos: 'arquivos', financeiro: 'movimento' }; // v1.92.0 — Performance virou parte do Financeiro
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
    if (alvo === 'movimento' && estado.ativoEmFoco) montarMovimentoAtivo(estado.ativoEmFoco); // v1.91.0 — carrega ao abrir
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
    if (a.status === 'baixado') return r('neu', 'Baixado'); // v1.99.0 (fatia 1, D-P19)
    // v1.97.0 (usos fatia 0, D-P18/D-P26) — o selo é o status de hoje: classe · modelo do uso vigente (fn_entidade_status)
    const st = typeof window.rzStatusDoAtivo === 'function' ? window.rzStatusDoAtivo(a.id) : null;
    if (st) return r(st.sem, st.rotulo);
    return r('ok', 'Ativo');
}

// v1.17.0 — "Mais ações" abre SHEET (REGRAS §6): dados, não HTML; a
// destrutiva vai por último em vermelho sozinha (abrirSheetAcoes ordena).
function sheetOuAviso(config) {
    if (typeof window.abrirSheetAcoes === 'function') { window.abrirSheetAcoes(config); return true; }
    mostrarToast('Abra pelo app principal.', 'erro');
    return false;
}

export function fecharFichaAtivo() {
    mudarTela('ativos');
    window.dispatchEvent(new CustomEvent('cofre:recarregar-ativos'));
}

export async function abrirAcoesAtivo() {
    const a = estado.ativoEmFoco;
    if (!a) return;
    // v1.99.0 (fatia 1, máquina de status) — o grupo Situação vem do catálogo de transições (fn_entidade_status → acoes):
    // Registrar venda, Registrar baixa, Arquivar (antes "Excluir ativo"), Reativar e Desfazer venda/baixa, conforme o
    // status do ativo. Sem a máquina (falha de rede), fica o caminho de antes.
    let maquina = null;
    try {
        const { data, error } = await api.dbAuth.rpc('fn_entidade_status', { p_entidade: 'ativo', p_id: a.id, p_cliente_id: null });
        if (!error && Array.isArray(data?.[a.id]?.acoes)) maquina = data[a.id].acoes;
    } catch (e) { console.warn('[cofre-ativos] ações do ativo:', e?.message || e); }
    // Imóvel (do cadastro antigo ou criado direto como ativo): "Editar" cobre endereço e valores, e
    // "Compartilhar" manda o link — o link guarda o id do ativo.
    const ehCategoriaImovelAtivo = ehCategoriaImovel(a.tipo_ativo);
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
    acoes.push({ icone: 'pencil', titulo: 'Editar', codigo: 'cofre.editar', sub: ehCategoriaImovelAtivo ? 'Endereço, valores e uso' : 'Campos deste tipo', aoTocar: () => { faTrocarAba('resumo'); alternarEditarAtivo(); } });
    acoes.push({ icone: 'image-plus', titulo: 'Adicionar fotos', codigo: 'cofre.editar', aoTocar: () => { faTrocarAba('arquivos'); faTrocarSegArquivos('fotos'); document.getElementById('fa-foto-input')?.click(); } });
    // Compartilhar: WhatsApp já com os dados e o link deste imóvel (o link guarda o id do ativo). (dem ed5accfe)
    // vitrine só para o que está em oferta: uso de hoje com classe Disponível ou Em venda (Nicola 15/10 22:39, dem 9404081c item 9b)
    const stOferta = typeof window.rzStatusDoAtivo === 'function' ? window.rzStatusDoAtivo(a.id) : null;
    const emOferta = stOferta ? ['Disponível', 'Em venda'].includes(stOferta.classe) : a.situacao_uso === 'disponivel';
    if (ehCategoriaImovelAtivo && emOferta && a.status !== 'vendido' && typeof window.compartilharImovelDoAtivo === 'function') acoes.push({ icone: 'share-2', titulo: 'Compartilhar', codigo: 'vitrine.gerar', sub: 'Pelo WhatsApp', aoTocar: () => window.compartilharImovelDoAtivo(a.id) });
    // Fase R / Entrega R.3 (20/09/2026) — esqueleto sem IA. O botão aparece
    // sempre (nenhuma consulta nova só pra decidir se esconde); duplicidade
    // é recusada no banco por fn_revisao_valor_ativo_iniciar, com toast de
    // erro claro — evita uma 2ª chamada de rede só pra pré-checar aqui.
    // v1.110.0 (fatia 4, D4-4) — "Iniciar revisão anual" saiu daqui: a revisão de valor é item dos programas (Controles ›
    // Programas). abrirIniciarRevisaoAnual() fica sem chamador, guardada só para rollback.
    if (!maquina && a.status !== 'vendido') acoes.push({ icone: 'tag', titulo: 'Marcar como vendido', codigo: 'cofre.editar', sub: 'Desliga os alertas', aoTocar: () => marcarAtivoVendidoAtual() });
    if (!maquina) acoes.push({ icone: 'trash-2', titulo: 'Excluir ativo', codigo: 'cofre.excluir', tipo: 'bad', aoTocar: () => excluirAtivoAtual() });
    // v1.94.0 (UX onda 3, D11) — é o ⋮ do topo da ficha: todas as ações do ativo em grupos curtos (os ⋮ dos cabeçalhos
    // dos cards saíram). Situação (vender, excluir) por último.
    const situacaoAntiga = acoes.filter(x => x.titulo === 'Marcar como vendido' || x.titulo === 'Excluir ativo');
    const situacao = maquina ? maquina.map(m => acaoDaMaquinaAtivo(a, m)) : situacaoAntiga;
    const fora = a.registro_contabil === 'fora';
    // v1.102.0 (usos fatia 3) — unidades, áreas, integrantes: do fn_ativo_estrutura (já lido pelo card do Resumo)
    let grupoSub = null;
    try { grupoSub = acoesSubativos(a, await carregarEstruturaAtivo(a)); } catch (e) { console.warn('[cofre-ativos] estrutura do ativo:', e?.message || e); }
    if (a.status && a.status !== 'ativo') { // vendido, baixado, arquivado: só a situação (desfazer, reativar)
        sheetOuAviso({ titulo: a.nome_exibicao, sub: tipoDoCatalogo(a.tipo_detalhe_id)?.nome || rotuloTipoAtivo(a.tipo_ativo), grupos: [{ titulo: 'Situação', acoes: situacao }].filter(g => g.acoes.length) });
        return;
    }
    const grupos = [
        { titulo: 'Ativo', acoes: [
            // v1.101.0 (Nicola 14/10 00:40: "Carregar documento e adicionar via IA duplicado… Deixe uma como Raiz IA apenas.
            // Retire também upload documento") — um item só, que abre a Raiz IA já falando deste ativo
            { icone: 'sparkles', tipo: 'ia', titulo: 'Raiz IA', sub: 'Pergunte ou registre', aoTocar: () => abrirRaizIaDoAtivo(a) },
            ...acoes.filter(x => !situacaoAntiga.includes(x)),
        ] },
        ...(grupoSub ? [grupoSub] : []),
        { titulo: 'Usos e contratos', acoes: [
            { icone: 'plus', titulo: 'Adicionar uso', codigo: 'ativos.usos.iniciar', sub: 'Aluguel, temporada…', aoTocar: () => abrirAdicionarModeloAtivo() },
            ...acaoConcluirUsoVigente(a),
        ] },
        { titulo: 'Controles', acoes: [
            { icone: 'plus', titulo: 'Novo item de controle', codigo: 'cofre.controles.criar', sub: 'Seguro, tributo, vistoria', aoTocar: () => window.__rzAbrirFormControle?.() },
            { icone: 'package', titulo: 'Programas', codigo: 'programas.ver', sub: 'Pacotes prontos de itens', aoTocar: () => abrirProgramasDoAtivo() }, // v1.110.0
        ] },
        { titulo: 'Financeiro', acoes: [
            { icone: 'plus', titulo: 'Novo lançamento', codigo: 'saidas.registrar', sub: 'Saída ligada a este ativo', aoTocar: () => abrirNovoLancamentoDoAtivo() },
            { icone: 'wallet', titulo: 'Ver no Financeiro', codigo: 'mensal.ver', sub: 'Todas as saídas deste ativo', aoTocar: () => abrirSaidasDoAtivo() },
            { icone: 'scale', titulo: 'Ver o balanço completo', codigo: 'repasses.ver', sub: 'Pessoas e quitações', aoTocar: () => movAbrirBalanco() },
        ] },
        { titulo: 'Propriedade', acoes: [
            { icone: 'pie-chart', titulo: 'Editar divisão', codigo: 'imoveis.divisao', sub: 'Sócios e percentuais', aoTocar: () => abrirEditarPropriedadeAtivo() },
            { icone: fora ? 'plus-circle' : 'ban', titulo: fora ? 'Incluir na contabilidade' : 'Tirar da contabilidade', codigo: 'imoveis.divisao',
              sub: fora ? 'Volta ao pacote do contador' : 'Não vai ao contador', aoTocar: () => alternarRegistroContabilAtivo() },
        ] },
        { titulo: 'Situação', acoes: situacao },
    ].filter(g => g.acoes.length);
    sheetOuAviso({ titulo: a.nome_exibicao, sub: tipoDoCatalogo(a.tipo_detalhe_id)?.nome || rotuloTipoAtivo(a.tipo_ativo), grupos });
}

// ============================================================================
// MÁQUINA DE STATUS (fatia 1) — v1.99.0. Toda mudança de situação do ativo, do uso e do item passa pela porta única
// fn_status_transicionar (a mesma do bot), que confere o catálogo status_transicoes, o código da ação e o motivo, e grava
// status_historico + log_acessos. Desfazer é transição nova (fn_status_desfazer), nunca apaga.
// ============================================================================
// v1.101.0 — Raiz IA a partir do ativo: abre a mesma Raiz IA do botão em destaque, com o nome do ativo no campo
function abrirRaizIaDoAtivo(a) {
    if (typeof window.abrirSheetRaizIA !== 'function') { mostrarToast('Abra pelo app principal.', 'erro'); return; }
    window.abrirSheetRaizIA();
    setTimeout(() => { const q = document.getElementById('rz-ia-q'); if (q && !q.value) { q.value = a.nome_exibicao + ': '; q.focus(); q.dispatchEvent(new Event('input')); } }, 80);
}
// v1.101.0 (Nicola 14/10 00:40: "Venda só pelo uso Revenda") — Registrar venda no ⋮ do uso Revenda, pela porta única
function abrirVendaPelaRevenda(a, u) {
    if (typeof window.abrirSheetForm !== 'function') { mostrarToast('Abra pelo app principal.', 'erro'); return; }
    const hoje = hojeLocalUso();
    window.abrirSheetForm({
        titulo: 'Registrar venda', sub: a.nome_exibicao, rotuloSalvar: 'Registrar venda',
        corpo: `<p class="rz-desc" style="margin:0 0 8px">A Revenda termina na data, os itens de controle são concluídos e o ativo sai das listas. Dá para desfazer pelo Histórico.</p>
            <div class="rz-f" style="margin-bottom:0"><label for="fa-venda-data">Data da venda</label><input type="date" id="fa-venda-data" value="${hoje}" min="${u.inicio}" max="${hoje}"></div>`,
        aoSalvar: async () => {
            const data = document.getElementById('fa-venda-data')?.value || hoje;
            const { data: r, error } = await api.dbAuth.rpc('fn_status_transicionar', { p_entidade: 'uso', p_id: u.uso_id, p_acao: 'vender', p_dados: { data }, p_canal: 'app' });
            if (error) { mostrarToast(error.message || 'Não foi possível registrar a venda.', 'erro'); return false; }
            mostrarToast(r?.mensagem || 'Venda registrada.', 'sucesso');
            a.status = r?.para || 'vendido';
            await aposMudarUso(a);
            window.dispatchEvent(new CustomEvent('cofre:recarregar-eventos'));
            return true;
        },
    });
}
const MOTIVOS_BAIXA = ['Perda total', 'Sinistro', 'Doação', 'Óbito', 'Descarte', 'Outro'];
function acaoDaMaquinaAtivo(a, m) {
    const ICONE = { vender: 'tag', baixar: 'file-minus', arquivar: 'archive', reativar: 'rotate-ccw', desfazer_venda: 'undo-2', desfazer_baixa: 'undo-2' };
    const SUB = { vender: 'Encerra o uso e os itens', baixar: 'Perda, sinistro, doação',
        arquivar: 'Itens pausados até reativar', reativar: 'Volta e retoma os itens',
        desfazer_venda: 'Volta com os usos de antes', desfazer_baixa: 'Volta com os usos de antes' };
    return { icone: ICONE[m.acao] || 'circle-dot', titulo: m.rotulo, codigo: m.codigo, sub: SUB[m.acao] || '', tipo: m.tipo === 'perigo' ? 'bad' : undefined,
        aoTocar: () => abrirTransicaoAtivo(a, m) };
}
async function abrirTransicaoAtivo(a, m) {
    if (typeof window.abrirSheetForm !== 'function') { mostrarToast('Abra pelo app principal.', 'erro'); return; }
    const hoje = hojeLocalUso();
    const comData = ['vender', 'baixar', 'arquivar'].includes(m.acao);
    // v1.102.0 (usos fatia 3, D3-5) — principal com unidades/áreas/integrantes: elas seguem (mesma ação em cada uma)
    // ou ficam (viram ativos soltos). O banco recusa sem a escolha.
    let est = null;
    if (comData) { try { est = await carregarEstruturaAtivo(a); } catch (_) { /* sem estrutura, o banco avisa */ } }
    const subs = Array.isArray(est?.subativos) ? est.subativos : [];
    const verbo = { vender: 'vendid', baixar: 'baixad', arquivar: 'arquivad' }[m.acao] || 'feit';
    const fem = femSubativo(est?.singular);
    const campoSubs = subs.length ? `<div class="rz-f"><label>${escapeHtml(est.plural)} (${subs.length})</label>
        <label style="display:flex;gap:8px;align-items:flex-start;font-weight:normal;margin:4px 0"><input type="radio" name="fa-tr-subs" value="seguir" checked> <span>Seguem: ${fem ? 'todas são' : 'todos são'} ${verbo}${fem ? 'as' : 'os'} junto, cada ${fem ? 'uma' : 'um'} com seu histórico</span></label>
        <label style="display:flex;gap:8px;align-items:flex-start;font-weight:normal;margin:4px 0"><input type="radio" name="fa-tr-subs" value="ficar"> <span>Ficam: viram ativos soltos na lista (contam no limite de ativos)</span></label></div>` : '';
    const campoData = comData ? `<div class="rz-f"><label for="fa-tr-data">${m.acao === 'vender' ? 'Data da venda' : m.acao === 'baixar' ? 'Data da baixa' : 'A partir de'}</label><input type="date" id="fa-tr-data" value="${hoje}" max="${hoje}"></div>` : '';
    const campoMotivo = m.acao === 'baixar'
        ? `<div class="rz-f"><label for="fa-tr-tipo">Motivo</label><select id="fa-tr-tipo">${MOTIVOS_BAIXA.map(x => `<option>${x}</option>`).join('')}</select></div>
           <div class="rz-f" style="margin-bottom:0"><label for="fa-tr-motivo">Detalhe <small>(opcional)</small></label><input type="text" id="fa-tr-motivo" maxlength="200"></div>`
        : m.exige_motivo ? `<div class="rz-f" style="margin-bottom:0"><label for="fa-tr-motivo">Motivo</label><input type="text" id="fa-tr-motivo" maxlength="200" placeholder="Ex.: registrado por engano"></div>` : '';
    const aviso = m.acao === 'arquivar' ? '<p class="rz-desc" style="margin:0 0 8px">O ativo sai das listas e os itens de controle ficam pausados. Dá para reativar pelo ⋮.</p>'
        : (m.acao === 'vender' || m.acao === 'baixar') ? '<p class="rz-desc" style="margin:0 0 8px">O uso de hoje termina na data e os itens de controle são concluídos. Com contrato vigente, encerre o contrato antes.</p>' : '';
    window.abrirSheetForm({
        titulo: m.rotulo, sub: a.nome_exibicao, corpo: aviso + campoSubs + campoData + campoMotivo, rotuloSalvar: m.rotulo,
        aoSalvar: async () => {
            const dados = {};
            if (comData) { dados.data = document.getElementById('fa-tr-data')?.value || hoje; }
            if (subs.length) dados.subativos = document.querySelector('input[name="fa-tr-subs"]:checked')?.value || 'seguir';
            const det = (document.getElementById('fa-tr-motivo')?.value || '').trim();
            if (m.acao === 'baixar') dados.motivo = (document.getElementById('fa-tr-tipo')?.value || 'Outro') + (det ? ': ' + det : '');
            else if (det) dados.motivo = det;
            if (m.exige_motivo && !dados.motivo) { mostrarToast('Diga o motivo.', 'erro'); return false; }
            const { data, error } = await api.dbAuth.rpc('fn_status_transicionar', { p_entidade: 'ativo', p_id: a.id, p_acao: m.acao, p_dados: dados, p_canal: 'app' });
            if (error) { mostrarToast(error.message || 'Não foi possível.', 'erro'); return false; }
            mostrarToast(data?.mensagem || 'Feito.', 'sucesso');
            a.status = data?.para || a.status;
            estruturaAtual = null; // v1.102.0 — os subativos podem ter mudado junto
            if (dados.subativos) window.dispatchEvent(new CustomEvent('cofre:recarregar-ativos'));
            await aposMudarUso(a);
            window.dispatchEvent(new CustomEvent('cofre:recarregar-eventos'));
            return true;
        },
    });
}
// ⋮ de um uso: Concluir e Excluir, como a máquina deixa (fn_ativo_usos → acoes)
function acoesDoUso(a, u) {
    return (u.acoes || []).map(m => m.acao === 'vender'
        ? { icone: 'tag', titulo: 'Registrar venda', codigo: m.codigo, sub: 'Encerra a revenda', aoTocar: () => abrirVendaPelaRevenda(a, u) }
        : m.acao === 'concluir'
        ? { icone: 'flag', titulo: 'Concluir ' + u.nome.toLowerCase(), codigo: m.codigo, sub: 'O ativo volta ao repouso', aoTocar: () => abrirConcluirUsoAtivo(a, u) }
        : { icone: 'trash-2', titulo: 'Excluir ' + u.nome.toLowerCase(), codigo: m.codigo, tipo: 'bad', sub: 'Lançado por engano', aoTocar: () => abrirExcluirUsoAtivo(a, u) });
}
function abrirExcluirUsoAtivo(a, u) {
    if (typeof window.abrirSheetForm !== 'function') { mostrarToast('Abra pelo app principal.', 'erro'); return; }
    window.abrirSheetForm({
        titulo: 'Excluir ' + u.nome.toLowerCase(), sub: `${a.nome_exibicao} · ${formatarDataBR(u.inicio)} → ${u.fim ? formatarDataBR(u.fim) : 'sem fim'}`, rotuloSalvar: 'Excluir',
        corpo: `<p class="rz-desc" style="margin:0 0 8px">O uso some da linha do tempo e o repouso cobre o período. O histórico guarda o que era, e dá para desfazer.</p>
            <div class="rz-f" style="margin-bottom:0"><label for="fa-uso-exc">Motivo</label><input type="text" id="fa-uso-exc" maxlength="200" placeholder="Ex.: lançado por engano"></div>`,
        aoSalvar: async () => {
            const motivo = (document.getElementById('fa-uso-exc')?.value || '').trim();
            if (!motivo) { mostrarToast('Diga o motivo.', 'erro'); return false; }
            const { data, error } = await api.dbAuth.rpc('fn_status_transicionar', { p_entidade: 'uso', p_id: u.uso_id, p_acao: 'excluir', p_dados: { motivo }, p_canal: 'app' });
            if (error) { mostrarToast(error.message || 'Não foi possível excluir.', 'erro'); return false; }
            mostrarToast(data?.mensagem || 'Uso excluído.', 'sucesso');
            await aposMudarUso(a);
            return true;
        },
    });
}
// ============================================================================
// SUBATIVOS (usos fatia 3) — v1.102.0. Um ativo principal (fazenda, galpão, conjunto, terreno, família, pessoa provedora)
// tem unidades, áreas ou integrantes: ativos de verdade, com uso, contrato, itens e status próprios, que apontam para ele
// (cofre_ativos.ativo_principal_id). O nome na tela vem do ramo do principal (ativo_ramos.nome_subativo_*), lido por
// fn_ativo_estrutura — a mesma leitura que o bot vai usar. Um nível só; as regras moram no banco (trg_ativo_principal).
// ============================================================================
let estruturaAtual = null; // { id, e } da ficha aberta — o ⋮ e a pergunta seguir/ficar leem daqui
async function carregarEstruturaAtivo(a) {
    if (estruturaAtual && estruturaAtual.id === a.id) return estruturaAtual.e;
    const { data, error } = await api.dbAuth.rpc('fn_ativo_estrutura', { p_ativo_id: a.id });
    if (error) throw error;
    estruturaAtual = { id: a.id, e: data || {} };
    return estruturaAtual.e;
}
function rotuloStatusSubativo(st) {
    if (!st) return { sem: 'neu', rotulo: 'Sem uso' };
    const classe = st.classe || 'Sem uso', nome = st.nome || classe;
    const semFn = typeof window.rzSemantica === 'function' ? window.rzSemantica : (typeof rzSemantica === 'function' ? rzSemantica : null);
    // card de áreas mostra só o nome do uso (Lavoura, Disponível), como a lista; classe + nome não cabe ao lado do nome (dem 9404081c, 18/10)
    return { sem: semFn ? semFn(classe) : 'neu', rotulo: nome };
}
// v1.113.0 (usos fatia 7, D7-3/D7-14) — card "Rebanho · N" ou "Garrafas · N" quando o tipo tem membros
// (ativo_tipos.modo_membro); o card, a ficha do membro e as folhas moram em cofre-membros.js (carregado só aqui).
async function montarMembrosAtivo(a) {
    const t = tipoDoCatalogo(a.tipo_detalhe_id);
    if (!t || !t.modo_membro || t.modo_membro === 'nenhum') {
        const c = document.getElementById('fa-card-membros'); if (c) { c.classList.add('hidden'); c.innerHTML = ''; }
        return;
    }
    const mod = await import('./cofre-membros.js');
    if (ativoAtualId !== a.id) return;
    await mod.montarCardMembros(a);
}

async function montarSubativosAtivo(a) {
    const painel = document.getElementById('fa-painel-resumo'); if (!painel) return;
    let card = document.getElementById('fa-card-subativos');
    if (!card) {
        card = document.createElement('div'); card.className = 'rz-card hidden'; card.id = 'fa-card-subativos';
        const primeiro = painel.querySelector('.rz-card');
        if (primeiro) primeiro.insertAdjacentElement('afterend', card); else painel.prepend(card);
    }
    estruturaAtual = null;
    let e;
    try { e = await carregarEstruturaAtivo(a); } catch (err) { card.classList.add('hidden'); throw err; }
    if (ativoAtualId !== a.id) return;
    const r = typeof window.renderStatus === 'function' ? window.renderStatus : (c, t) => `<span class="rz-st rz-neu">${escapeHtml(t || c)}</span>`;
    const sing = e.singular || 'Subativo', plur = e.plural || 'Subativos';
    // subativo: contexto no cabeçalho e o caminho de volta ao principal
    if (e.principal) {
        const ctx = document.querySelector('#fa-cabecalho .rz-tx span');
        if (ctx) ctx.textContent = `${tipoDoCatalogo(a.tipo_detalhe_id)?.nome || rotuloTipoAtivo(a.tipo_ativo)} · ${sing} de ${e.principal.nome}`;
        card.innerHTML = `<div class="rz-card-h"><h3>${escapeHtml(sing)} de</h3></div>
            <div class="rz-row rz-link" role="button" tabindex="0" data-sub-abrir="${e.principal.id}"><div class="rz-ic"><i data-lucide="corner-left-up"></i></div>
                <div class="rz-tx"><b>${escapeHtml(e.principal.nome)}</b><span>Ativo principal · toque para abrir</span></div></div>`;
        card.classList.remove('hidden');
    } else if (e.aceita) {
        const subs = Array.isArray(e.subativos) ? e.subativos : [];
        const emUso = subs.filter(x => x.status && x.status.repouso === false).length;
        const linhas = subs.map(x => {
            const st = rotuloStatusSubativo(x.status);
            return `<div class="rz-row rz-link" role="button" tabindex="0" data-sub-abrir="${x.id}"><div class="rz-ic"><i data-lucide="${iconeAtivo(estado.ativos.find(y => y.id === x.id)?.tipo_ativo || a.tipo_ativo)}"></i></div>
                <div class="rz-tx"><b>${escapeHtml(x.nome)}</b><span>${escapeHtml(x.tipo || '')}</span></div><div class="rz-rt">${r(st.sem, st.rotulo)}</div>
                <button type="button" class="rz-more" data-sub-menu="${x.id}" aria-label="Ações de ${escapeHtml(x.nome)}"><i data-lucide="ellipsis-vertical"></i></button></div>`; // v1.108.0 (3c) — ⋮ como nas outras linhas
        }).join('');
        const vazio = `<p class="rz-desc" style="margin:4px 0 8px">${femSubativo(sing) ? 'Nenhuma' : 'Nenhum'} ${escapeHtml(sing.toLowerCase())} ainda. Cada ${femSubativo(sing) ? 'uma' : 'um'} tem uso, contratos e itens próprios, e este ativo mostra o resumo.</p>`;
        card.innerHTML = `<div class="rz-card-h"><h3>${escapeHtml(plur)}</h3><span class="rz-sub">${subs.length ? `${emUso} de ${subs.length} em uso` : ''}</span></div>
            ${subs.length ? `<div class="rz-list">${linhas}</div>` : vazio}
            ${e.pode_criar ? `<button type="button" class="rz-add" data-sub-novo="1"><i data-lucide="plus"></i>Adicionar ${escapeHtml(sing.toLowerCase())}</button>` : ''}`; // v1.108.0 (3c) — mesmo "+ Adicionar" dos outros cards
        card.classList.remove('hidden');
    } else {
        card.classList.add('hidden'); card.innerHTML = '';
    }
    card.querySelectorAll('[data-sub-abrir]').forEach(el => {
        const ir = () => abrirFichaAtivo(el.dataset.subAbrir);
        el.addEventListener('click', ir);
        el.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); ir(); } });
    });
    card.querySelector('[data-sub-novo]')?.addEventListener('click', () => abrirNovoSubativo(a, e));
    // v1.108.0 (fatia 3c) — ⋮ do subativo na ficha do principal: Abrir e Tirar de <principal>
    card.querySelectorAll('[data-sub-menu]').forEach(b => b.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const sub = estado.ativos.find(x => x.id === b.dataset.subMenu); if (!sub) return;
        sheetOuAviso({ titulo: sub.nome_exibicao, sub: `${e.singular || 'Subativo'} de ${a.nome_exibicao}`, acoes: [
            { icone: 'arrow-up-right', titulo: 'Abrir', aoTocar: () => abrirFichaAtivo(sub.id) },
            { icone: 'unlink', titulo: `Tirar de ${a.nome_exibicao}`, codigo: 'cofre.editar', sub: 'Vira um ativo solto na lista',
              aoTocar: () => abrirTirarDoPrincipal(sub, { principal: { id: a.id, nome: a.nome_exibicao } }, () => { estruturaAtual = null; montarSubativosAtivo(a); }) },
        ] });
    }));
    refrescarIcones();
}
function abrirNovoSubativo(a, e) {
    abrirFormAtivo({ principal: { id: a.id, nome: a.nome_exibicao, singular: e.singular || 'Subativo', ramo: a.ramo } });
}
// Vincular um ativo já cadastrado (solto) como unidade, área ou integrante deste principal
async function abrirVincularSubativo(a, e) {
    if (typeof window.abrirSheetForm !== 'function') { mostrarToast('Abra pelo app principal.', 'erro'); return; }
    await garantirCatalogoTiposAtivo();
    const temSubs = new Set(estado.ativos.filter(x => x.ativo_principal_id).map(x => x.ativo_principal_id));
    const candidatos = estado.ativos.filter(x => x.id !== a.id && !x.ativo_principal_id && !temSubs.has(x.id)
        && (x.status || 'ativo') === 'ativo' && podeSerSubativoDe(x.tipo_detalhe_id, a.ramo)) // v1.107.0 — só do ramo do principal
        .sort((x, y) => String(x.nome_exibicao).localeCompare(String(y.nome_exibicao), 'pt-BR'));
    const sing = (e.singular || 'subativo').toLowerCase();
    if (!candidatos.length) { mostrarToast(`Nenhum ativo livre. Use "Adicionar ${sing}".`, 'erro'); return; }
    window.abrirSheetForm({
        titulo: 'Vincular ativo existente', sub: a.nome_exibicao, rotuloSalvar: 'Vincular',
        corpo: `<p class="rz-desc" style="margin:0 0 8px">O ativo passa a aparecer dentro de ${escapeHtml(a.nome_exibicao)}, com uso, contratos e itens que já tem. O valor de referência dele deixa de contar: o valor do principal é o total.</p>
            <div class="rz-f" style="margin-bottom:0"><label for="fa-sub-vinc">Ativo</label><select id="fa-sub-vinc">${candidatos.map(x => `<option value="${x.id}">${escapeHtml(x.nome_exibicao)} · ${escapeHtml(tipoDoCatalogo(x.tipo_detalhe_id)?.nome || rotuloTipoAtivo(x.tipo_ativo))}</option>`).join('')}</select></div>`,
        aoSalvar: async () => {
            const id = document.getElementById('fa-sub-vinc')?.value; if (!id) return false;
            const { error } = await api.dbAuth.rpc('fn_ativo_principal_definir', { p_ativo_id: id, p_principal_id: a.id, p_canal: 'app' });
            if (error) { mostrarToast(error.message || 'Não foi possível vincular.', 'erro'); return false; }
            mostrarToast(`Vinculado a ${a.nome_exibicao}.`, 'sucesso');
            const x = estado.ativos.find(y => y.id === id); if (x) { x.ativo_principal_id = a.id; x.valor_referencia = null; }
            window.dispatchEvent(new CustomEvent('cofre:recarregar-ativos'));
            recarregarFuncionalidadesLiberadas().catch(() => {});
            estruturaAtual = null; await montarSubativosAtivo(a);
            return true;
        },
    });
}
// Tirar do principal: o subativo vira ativo solto (passa a contar no limite de ativos)
function abrirTirarDoPrincipal(a, e, depois = null) {
    if (typeof window.abrirSheetForm !== 'function') { mostrarToast('Abra pelo app principal.', 'erro'); return; }
    window.abrirSheetForm({
        titulo: `Tirar de ${e.principal.nome}`, sub: a.nome_exibicao, rotuloSalvar: 'Tirar',
        corpo: `<p class="rz-desc" style="margin:0">${escapeHtml(a.nome_exibicao)} vira um ativo solto na lista, com o uso, os contratos e os itens que já tem. Conta no limite de ativos do plano. Dá para vincular de novo pelo ⋮ de ${escapeHtml(e.principal.nome)}.</p>`,
        aoSalvar: async () => {
            const { error } = await api.dbAuth.rpc('fn_ativo_principal_definir', { p_ativo_id: a.id, p_principal_id: null, p_canal: 'app' });
            if (error) { mostrarToast(error.message || 'Não foi possível.', 'erro'); return false; }
            mostrarToast(`${a.nome_exibicao} agora é um ativo solto.`, 'sucesso');
            a.ativo_principal_id = null;
            window.dispatchEvent(new CustomEvent('cofre:recarregar-ativos'));
            recarregarFuncionalidadesLiberadas().catch(() => {});
            estruturaAtual = null;
            if (depois) depois(); else await montarSubativosAtivo(a);
            return true;
        },
    });
}
// ⋮ da ficha: o grupo do subativo (Adicionar / Vincular no principal; Tirar no subativo)
function acoesSubativos(a, e) {
    if (!e) return null;
    const sing = (e.singular || 'Subativo').toLowerCase();
    if (e.principal) return { titulo: e.singular || 'Subativo', acoes: [
        { icone: 'corner-left-up', titulo: `Abrir ${e.principal.nome}`, sub: 'O ativo principal', aoTocar: () => abrirFichaAtivo(e.principal.id) },
        { icone: 'unlink', titulo: `Tirar de ${e.principal.nome}`, codigo: 'cofre.editar', sub: 'Vira um ativo solto na lista', aoTocar: () => abrirTirarDoPrincipal(a, e) },
    ] };
    if (!e.aceita) return null;
    return { titulo: e.plural || 'Subativos', acoes: [
        { icone: 'plus', titulo: `Adicionar ${sing}`, codigo: 'cofre.subativos.criar', sub: 'Cadastro novo', aoTocar: () => abrirNovoSubativo(a, e) },
        { icone: 'link', titulo: 'Vincular ativo existente', codigo: 'cofre.subativos.criar', sub: 'Um ativo já cadastrado', aoTocar: () => abrirVincularSubativo(a, e) },
    ] };
}

// Card Histórico (chip Usos e contratos): o que mudou no ativo, com Desfazer quando a mudança permite
async function montarHistoricoStatusAtivo(a) {
    const usos = document.getElementById('fa-card-usos'); if (!usos) return;
    let card = document.getElementById('fa-card-historico');
    if (!card) {
        card = document.createElement('div'); card.className = 'rz-card'; card.id = 'fa-card-historico';
        card.innerHTML = '<div class="rz-card-h"><h3>Histórico</h3></div><div id="fa-historico-lista"></div>';
        usos.insertAdjacentElement('afterend', card);
    }
    const lista = card.querySelector('#fa-historico-lista');
    try {
        const { data, error } = await api.dbAuth.from('status_historico').select('id, de, para, gatilho, motivo, pessoa_id, canal, criado_em, desfaz_id, dados')
            .eq('entidade', 'ativo').eq('entidade_id', a.id).order('criado_em', { ascending: false }).limit(20);
        if (error) throw error;
        if (ativoAtualId && ativoAtualId !== a.id) return;
        const linhas = data || [];
        card.classList.toggle('hidden', !linhas.length);
        if (!linhas.length) { lista.innerHTML = ''; return; }
        const desfeitas = new Set(linhas.map(h => h.desfaz_id).filter(Boolean));
        const ids = [...new Set(linhas.map(h => h.pessoa_id).filter(Boolean))];
        const nomes = {};
        if (ids.length) {
            const { data: ps } = await api.dbAuth.from('pessoas').select('id, nome').in('id', ids);
            (ps || []).forEach(p => { nomes[p.id] = (p.nome || '').split(' ')[0]; });
        }
        const quando = (t) => { const d = new Date(t); return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }) + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); };
        lista.innerHTML = linhas.map((h, i) => {
            // exclusão de uso é definitiva: não oferece Desfazer, mesmo nas linhas antigas gravadas como desfazíveis (dem 9404081c, item 20)
            const exclusao = h.dados?.acao === 'excluir_uso';
            const pode = h.dados?.desfazivel && !exclusao && !desfeitas.has(h.id) && !h.desfaz_id;
            const quem = h.gatilho === 'acao' ? (nomes[h.pessoa_id] || 'você') : 'automático · rotina diária';
            const dataBr = (d) => d ? d.split('-').reverse().join('/') : '';
            const uE = exclusao ? h.dados?.uso : null;
            const periodo = uE ? `${dataBr(uE.inicio)} → ${uE.fim ? dataBr(uE.fim) : 'sem fim'}` : '';
            const det = [periodo, h.motivo ? 'Motivo: ' + h.motivo : '', quem, quando(h.criado_em)].filter(Boolean).join(' · ');
            const titulo = exclusao ? `Uso excluído: ${h.de || 'uso'}`
                : !h.de ? `Uso iniciado: ${h.para || '—'}`
                : `${h.de} → ${h.para || '—'}`;
            return `<div class="rz-row"><div class="rz-ic${desfeitas.has(h.id) ? ' rz-neu' : ''}"><i data-lucide="${h.desfaz_id ? 'undo-2' : exclusao ? 'trash-2' : 'arrow-right-left'}"></i></div>
                <div class="rz-tx"><b>${escapeHtml(titulo)}${desfeitas.has(h.id) ? ' <small>(desfeito)</small>' : ''}</b><span>${escapeHtml(det)}</span></div>
                ${pode ? `<button type="button" class="rz-more" data-hist-i="${i}" aria-label="Ações da mudança"><i data-lucide="ellipsis-vertical"></i></button>` : ''}</div>`;
        }).join('');
        lista.querySelectorAll('[data-hist-i]').forEach(b => b.addEventListener('click', (ev) => {
            ev.stopPropagation(); const h = linhas[Number(b.dataset.histI)];
            sheetOuAviso({ titulo: `${h.de} → ${h.para}`, sub: quando(h.criado_em), acoes: [
                { icone: 'undo-2', titulo: 'Desfazer', codigo: 'status.desfazer', sub: 'O motivo fica no histórico', aoTocar: () => abrirDesfazerHistorico(a, h) },
            ] });
        }));
        refrescarIcones();
    } catch (e) { console.warn('[cofre-ativos] histórico:', e?.message || e); }
}
function abrirDesfazerHistorico(a, h) {
    if (typeof window.abrirSheetForm !== 'function') { mostrarToast('Abra pelo app principal.', 'erro'); return; }
    window.abrirSheetForm({
        titulo: 'Desfazer', sub: `${h.de} → ${h.para}`, rotuloSalvar: 'Desfazer',
        corpo: `<div class="rz-f" style="margin-bottom:0"><label for="fa-desf-mot">Motivo</label><input type="text" id="fa-desf-mot" maxlength="200" placeholder="Ex.: registrado no ativo errado"></div>`,
        aoSalvar: async () => {
            const motivo = (document.getElementById('fa-desf-mot')?.value || '').trim();
            if (!motivo) { mostrarToast('Diga o motivo.', 'erro'); return false; }
            const { data, error } = await api.dbAuth.rpc('fn_status_desfazer', { p_historico_id: h.id, p_motivo: motivo, p_canal: 'app' });
            if (error) { mostrarToast(error.message || 'Não foi possível desfazer.', 'erro'); return false; }
            mostrarToast(data?.mensagem || 'Desfeito.', 'sucesso');
            if (data?.para) a.status = data.para;
            await aposMudarUso(a);
            window.dispatchEvent(new CustomEvent('cofre:recarregar-eventos'));
            return true;
        },
    });
}

// Fase R / Entrega R.3 (20/09/2026) — "Iniciar revisão anual" (esqueleto
// sem IA): pede a data da última revisão de valor (o usuário sabe quando
// avaliou por último; sem isso não dá pra calcular o próximo ciclo) e
// chama fn_revisao_valor_ativo_iniciar via api.iniciarRevisaoValorAtivo().
// A sugestão da IA com memória de cálculo (REGRAS §10, card "Performance")
// só chega em R.4, depois de indicador_valores nascer na Fase B1.1.
function abrirIniciarRevisaoAnual(a) {
    if (typeof window.abrirSheetForm !== 'function') { mostrarToast('Abra pelo app principal.', 'erro'); return; }
    const hoje = new Date().toISOString().slice(0, 10);
    const corpo = `<div class="rz-f" style="margin-bottom:0"><label>Data da última revisão de valor</label>
        <input type="date" id="fa-revisao-data" max="${hoje}" value="${hoje}">
        <span class="rz-hint">O próximo aviso nasce 1 ano depois desta data, com 30 dias de antecedência.</span>
    </div>`;
    window.abrirSheetForm({
        titulo: 'Iniciar revisão anual', sub: a.nome_exibicao, corpo, rotuloSalvar: 'Iniciar',
        aoSalvar: async () => {
            const data = document.getElementById('fa-revisao-data')?.value;
            if (!data) { mostrarToast('Informe a data da última revisão.', 'erro'); return false; }
            try {
                await api.iniciarRevisaoValorAtivo(a.id, data);
                mostrarToast('Revisão anual iniciada.', 'sucesso');
                window.dispatchEvent(new CustomEvent('cofre:recarregar-ativos'));
                return true;
            } catch (err) {
                mostrarToast('Falha ao iniciar: ' + err.message, 'erro');
                return false;
            }
        }
    });
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
    if (usosAtivoId !== a.id) faAtualizarContador('contratos', 0);
    if (sub) sub.textContent = '';

    // v1.41.0 (16/09/2026, BUG REAL do teste real — print "Casa de Campo,
    // tipo Imóvel, Ativo" mostrando a msg vermelha) — ehCategoriaImovel()
    // no lugar de entidade_origem_tipo==='imovel': a checagem antiga só
    // reconhecia os 104 imóveis legados vinculados; um imóvel NATIVO
    // (criado após a Onda 12, sem esse vínculo) caía sempre aqui, mesmo
    // sendo genuinamente do tipo imóvel.
    // v1.86.0 (F25) — fora de imóvel o card Contratos some; o chip mostra só os Usos.
    document.getElementById('fa-card-contratos')?.classList.toggle('hidden', !ehCategoriaImovel(a.tipo_ativo));
    if (!ehCategoriaImovel(a.tipo_ativo)) return;

    try {
        // v1.17.2 — BUG (print 03/09 12:32): "0 vigentes · 1 encerrado" com
        // a linha "Ativo". contratos.status é MINÚSCULO no banco ('ativo',
        // 'assinando', 'finalizado'); a comparação com 'Ativo' (capitalizado,
        // herdada do texto do v1.5.0) nunca batia. Normalizado uma vez aqui.
        // v1.41.0 — buscarContratosDoAtivo(a.id) no lugar de
        // buscarContratosDoImovel(a.entidade_origem_id): filtra por
        // ativo_id agora, não imovel_id — sem isto, contrato NOVO de
        // imóvel LEGADO também sumiria daqui (achado no mesmo teste).
        const lista = (await api.buscarContratosDoAtivo(a.id)).map(c => ({ ...c, st: String(c.status || '').toLowerCase() }));
        // v1.88.0 (F25c) — o modelo de cada contrato (Aluguel, Temporada…)
        try {
            const [mc, mm] = await Promise.all([
                api.dbAuth.from('contratos').select('id, modelo').eq('ativo_id', a.id),
                api.dbAuth.from('operacao_modelos').select('codigo, nome'),
            ]);
            const nomeM = Object.fromEntries((mm.data || []).map(x => [x.codigo, x.nome]));
            const modC = Object.fromEntries((mc.data || []).map(x => [x.id, nomeM[x.modelo] || x.modelo]));
            lista.forEach(c => { c.modeloNome = modC[c.id] || ''; });
        } catch (e) { /* sem o nome do modelo a lista segue igual */ }
        const vigentes = lista.filter(c => c.st === 'ativo' || c.st === 'assinando');
        faAtualizarContador('contratos', Math.max(vigentes.length, usosAtivoId === a.id ? usosContagemFicha : 0));
        if (sub) sub.textContent = lista.length ? `${vigentes.length} vigente${vigentes.length === 1 ? '' : 's'} · ${lista.length - vigentes.length} encerrado${lista.length - vigentes.length === 1 ? '' : 's'}` : '';
        if (!lista.length) {
            // v1.17.0 — único card vazio que RENDERIZA sem ação própria
            // (exceção documentada, REGRAS §6): a contratação nasce na aba
            // Contratos do App, não daqui.
            // v1.68.0 (demanda 11afd25f) — vazio com ação própria, mesmo
            // padrão do vazio de Ativos ("+ Novo ativo").
            painel.innerHTML = `<div class="rz-empty"><div class="rz-ic"><i data-lucide="file-text"></i></div><p>Nenhum contrato pra este imóvel ainda.</p><div class="rz-acts"><button type="button" class="rz-btn rz-btn-1" onclick="window.__rzAdicionarModeloAtivo && window.__rzAdicionarModeloAtivo()"><i data-lucide="plus"></i> Adicionar</button></div></div>`;
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
                    <span>${c.modeloNome ? escapeHtml(c.modeloNome) + ' · ' : ''}${c.inicio ? formatarDataBR(c.inicio) : ''}${c.fim ? ' → ' + formatarDataBR(c.fim) : ''}</span>
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
// USOS DO ATIVO (F25) — v1.87.0 (Nicola 10/10 20:33): só a barra consolidada. Os usos nascem do contrato e
// dos itens de uso (não há cadastro manual na tela); o catálogo de modelos diz o que aparece em "adicionar"; o repouso
// é configuração por tipo de ativo e não aparece ao usuário. Lê fn_ativo_usos (usos + trechos sem uso).
// ============================================================================
const nomeRamoUso = (c) => (typeof window.rzNomeRamo === 'function' ? window.rzNomeRamo(c) : c);

// v1.95.0 (Nicola 12/10 02:31: "juntar os dois cards ocupação e uso, e trazer tudo num só. A própria barra deveria ser
// filtrada por ano … ver os meses do ano com as letras iniciais. Apenas o % ocupação basta") — um card só, "Usos": no
// cabeçalho ‹ ano ›; a barra mostra 1/jan a 31/dez do ano escolhido, com os usos na cor do ramo, a marca de hoje e as
// iniciais dos meses embaixo (o mês atual em destaque); no pé, só a ocupação do ano em %. O card de Ocupação some.
// O card aparece mesmo sem uso (convite + "+ Adicionar uso").
let usosAtivoId = null, usosAno = null, usosLinhas = [];
let usosLinhasTodas = []; // v1.98.0 — usos com registro, inclusive repouso (para tirar o modelo de hoje das opções)
let usoVigenteFicha = null; // v1.97.0 — uso de hoje (não repouso) da ficha aberta, para o "Concluir" do ⋮
// v1.97.0 — "hoje" no fuso do aparelho (o toISOString é UTC e virava o dia depois das 21h em Brasília)
const hojeLocalUso = () => new Date().toLocaleDateString('sv-SE');
const USOS_MESES = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
let usosContagemFicha = 0;
export async function montarUsosAtivo(a) {
    const card = document.getElementById('fa-card-usos');
    const painel = document.getElementById('fa-usos-lista');
    if (!painel) return;
    const sub = document.getElementById('fa-usos-sub');
    try {
        const { data, error } = await api.dbAuth.rpc('fn_ativo_usos', { p_ativo_id: a.id });
        if (error) throw error;
        if (ativoAtualId && ativoAtualId !== a.id) return;
        usosLinhas = (data || []).filter(u => u.uso_id); usosLinhasTodas = usosLinhas; // v1.97.0 — trechos sem registro (buracos) ficam de fora; o repouso entra
        const usos = usosLinhas.filter(u => !u.repouso);
        if (usosAtivoId !== a.id) { usosAtivoId = a.id; usosAno = new Date().getFullYear(); }
        card?.classList.remove('hidden');
        // o chip conta usos (contrato espelhado também é uso): imóvel em Lavoura, Moradia etc. não pode mostrar 0 (dem 9404081c, 26b)
        usosContagemFicha = usos.length;
        faAtualizarContador('contratos', usos.length);
        const hoje = hojeLocalUso();
        const vig = usos.find(u => u.inicio <= hoje && (!u.fim || u.fim >= hoje))
            || usosLinhas.find(u => u.inicio <= hoje && (!u.fim || u.fim >= hoje)); // v1.97.0 — sem uso, o repouso de hoje
        usoVigenteFicha = usos.find(u => u.inicio <= hoje && (!u.fim || u.fim >= hoje)) || null;
        if (sub) sub.textContent = '';
        if (!usosLinhas.length) {
            painel.innerHTML = `<p class="rz-desc" style="margin:2px 0 6px">Nenhum uso ainda.</p>`;
            return;
        }
        await desenharUsosAno(a, vig);
    } catch (err) {
        console.warn('[cofre-ativos] montarUsosAtivo falhou:', err?.message || err);
    } finally {
        if (!ativoAtualId || ativoAtualId === a.id) montarHistoricoStatusAtivo(a); // v1.99.0 — card Histórico
    }
}

async function desenharUsosAno(a, vig) {
    const painel = document.getElementById('fa-usos-lista'); if (!painel) return;
    const sub = document.getElementById('fa-usos-sub');
    const hojeD = new Date(), hoje = hojeLocalUso(), anoHoje = hojeD.getFullYear();
    const usos = usosLinhas.filter(u => !u.repouso);
    const anoMin = Number(String(usosLinhas[0]?.inicio || anoHoje).slice(0, 4));
    const anoMax = Math.max(anoHoje, ...usos.map(u => u.fim ? Number(u.fim.slice(0, 4)) : anoHoje + 1));
    const Y = usosAno = Math.min(anoMax, Math.max(anoMin, usosAno));
    if (sub) sub.innerHTML = `<span class="rz-uso-ano"><button type="button" data-uso-ano="-1" aria-label="Ano anterior"${Y <= anoMin ? ' disabled' : ''}><i data-lucide="chevron-left"></i></button><b>${Y}</b><button type="button" data-uso-ano="1" aria-label="Próximo ano"${Y >= anoMax ? ' disabled' : ''}><i data-lucide="chevron-right"></i></button></span>`;
    const t0 = Date.UTC(Y, 0, 1), t1 = Date.UTC(Y + 1, 0, 1), dia = 864e5;
    const pos = (d) => Math.max(0, Math.min(100, ((new Date(d + 'T00:00:00Z').getTime() - t0) / (t1 - t0)) * 100));
    const fimTxt = (u) => u.fim ? formatarDataBR(u.fim) : 'sem fim';
    // v1.97.0 (usos fatia 0) — o repouso (Disponível, Guardado…) entra esmaecido, em cinza; os usos na cor do ramo
    const segs = usosLinhas.filter(u => u.inicio < `${Y + 1}-01-01` && (!u.fim || u.fim >= `${Y}-01-01`)).map(u => {
        const l = pos(u.inicio), r = u.fim ? pos(u.fim) + 100 / 365 : 100, w = Math.max(1, Math.min(100, r) - l);
        const cor = u.repouso ? 'var(--muted);opacity:.35' : `var(--ramo-cor-${u.ramo}, var(--sage))`;
        return `<i class="rz-uso-seg${u.repouso ? ' rz-uso-rep' : ''}" title="${escapeHtml(`${u.nome}: ${formatarDataBR(u.inicio)} → ${fimTxt(u)}`)}" style="left:${l}%;width:${w}%;background:${cor}"></i>`; }).join('');
    const marcaHoje = Y === anoHoje ? `<i class="rz-uso-hoje" title="Hoje" style="left:${pos(hoje)}%"></i>` : '';
    const meses = USOS_MESES.map((m, i) => `<span${Y === anoHoje && i === hojeD.getMonth() ? ' class="rz-on"' : ''}>${m}</span>`).join('');
    painel.innerHTML = `<div class="rz-uso-barra">${segs}${marcaHoje}</div><div class="rz-uso-meses">${meses}</div>
        <div class="rz-uso-pe"><span>${vig && Y === anoHoje ? `Hoje: ${escapeHtml(vig.nome)}${vig.repouso ? '' : ' · ' + escapeHtml(nomeRamoUso(vig.ramo))}` : `${usos.length} uso${usos.length === 1 ? '' : 's'} no total`}</span><span>Ocupação <b id="fa-uso-ocup">…</b></span></div>`;
    // v1.98.0 (teste do Nicola 13/10 23:27: "cadastrei uso próprio mas não aparece pra eu excluir nem encerrar") — os usos
    // do ano viram linhas abaixo da barra; o uso sem contrato vigente tem ⋮ com "Concluir" (UXR-49); o de contrato abre o
    // contrato. O repouso não vira linha (é o que sobra entre os usos).
    const doAno = usos.filter(u => u.inicio < `${Y + 1}-01-01` && (!u.fim || u.fim >= `${Y}-01-01`)).sort((x, y) => y.inicio.localeCompare(x.inicio));
    if (doAno.length) {
        const vigenteHoje = (u) => u.inicio <= hoje && (!u.fim || u.fim >= hoje);
        const linhas = doAno.map((u, i) => {
            const acao = !u.contrato_id && (u.acoes || []).length > 0; // v1.99.0 — o que a máquina deixa (Concluir, Excluir)
            const per = `${formatarDataBR(u.inicio)} → ${fimTxt(u)}${vigenteHoje(u) ? ' · hoje' : (u.inicio > hoje ? ' · a começar' : '')}`;
            return `<div class="rz-row${u.contrato_id ? ' rz-link' : ''}" data-uso-i="${i}"${u.contrato_id ? ' role="button" tabindex="0"' : ''}>
                <div class="rz-ic"><i data-lucide="${u.contrato_id ? 'file-text' : 'user-check'}"></i></div>
                <div class="rz-tx"><b>${escapeHtml(u.nome)}</b><span>${escapeHtml(per)}</span>${u.observacao && !u.contrato_id ? `<span>${escapeHtml(u.observacao)}</span>` : ''}</div>
                ${acao ? `<button type="button" class="rz-more" data-uso-mais="${i}" aria-label="Ações do uso"><i data-lucide="ellipsis-vertical"></i></button>` : (u.contrato_id ? '<i data-lucide="chevron-right" class="rz-chev"></i>' : '')}
            </div>`; }).join('');
        painel.insertAdjacentHTML('beforeend', `<div class="rz-list" style="margin-top:8px">${linhas}</div>`);
        painel.querySelectorAll('[data-uso-i]').forEach(el => {
            const u = doAno[Number(el.dataset.usoI)];
            if (u.contrato_id) el.addEventListener('click', () => abrirContratoNoApp(u.contrato_id));
        });
        painel.querySelectorAll('[data-uso-mais]').forEach(b => b.addEventListener('click', (ev) => {
            ev.stopPropagation(); const u = doAno[Number(b.dataset.usoMais)];
            sheetOuAviso({ titulo: u.nome, sub: `${formatarDataBR(u.inicio)} → ${fimTxt(u)}`, acoes: acoesDoUso(a, u) });
        }));
    }
    painel.closest('.rz-card')?.querySelectorAll('[data-uso-ano]').forEach(b => b.addEventListener('click', (ev) => {
        ev.stopPropagation(); usosAno = Y + Number(b.dataset.usoAno); desenharUsosAno(a, vig); }));
    refrescarIcones();
    // ocupação do ano: fn_performance_ativo (dias alugado × vago); sem dado, a conta pelos usos do próprio ano
    let taxa = null;
    const p = await api.buscarPerformanceAtivo(a.id, Y);
    if (usosAno !== Y || usosAtivoId !== a.id) return;
    if (p && p.dias_alugado != null) { const al = Number(p.dias_alugado || 0), va = Number(p.dias_vago || 0); if (al + va > 0) taxa = Math.round(al * 1000 / (al + va)) / 10; }
    if (taxa == null) {
        const fimAno = Y === anoHoje ? Date.parse(hoje + 'T00:00:00Z') + dia : t1, base = (fimAno - t0) / dia;
        let ocup = 0;
        usos.forEach(u => { const i = Math.max(t0, Date.parse(u.inicio + 'T00:00:00Z')), f = Math.min(fimAno, u.fim ? Date.parse(u.fim + 'T00:00:00Z') + dia : fimAno); if (f > i) ocup += (f - i) / dia; });
        if (base > 0) taxa = Math.round(Math.min(1, ocup / base) * 1000) / 10;
    }
    const el = document.getElementById('fa-uso-ocup'); if (el) el.textContent = taxa == null ? '—' : String(taxa).replace('.', ',') + '%';
}

// ============================================================================
// PERFORMANCE (Entrega A.7, PLANO_IMPLEMENTACAO_RESULTADOS_MERCADO_FISCAL
// v2.0.0 / ESP v1.3.0 §8) — chip "Financeiro" (nome interno inalterado,
// data-fa-aba="financeiro") virou "Performance": 2 KPIs do ano, gráfico de
// recebimento mês a mês e o grid de 10 campos com a mediana da carteira
// pra comparar (C4). O grid de Movimentações que existia aqui saiu (C5) —
// é operação, mora no Financeiro por competência (ESP §10.1); o botão
// "Mais ações" deste chip (abrirAcoesFinanceiroAtivo) continua igual,
// levando pra lá. Card "Revisão anual de valor" (C6) fica fora — critério
// de pronto próprio, Entrega R.4, depende de indicador_valores (Fase B1.1)
// que ainda não existe (mesma razão da R.3 já ter deixado só o esqueleto
// sem sugestão de IA).
// ============================================================================
async function montarFinanceiroAtivo(a) {
    const painelResumo = document.getElementById('fa-financeiro-resumo');
    const painelGrafico = document.getElementById('fa-financeiro-grafico');
    const painelGrid = document.getElementById('fa-financeiro-grid');
    const painelRevisao = document.getElementById('fa-financeiro-revisao');
    if (!painelResumo || !painelGrafico || !painelGrid) return;

    painelResumo.innerHTML = `<div style="grid-column:1/-1">${rzSk('texto', 2)}</div>`;
    painelGrafico.innerHTML = '';
    painelGrid.innerHTML = '';
    if (painelRevisao) painelRevisao.innerHTML = '';
    revisaoValorAtual = null;

    const ano = new Date().getFullYear();
    // Entrega R.4 — sugestão de revisão de valor busca junto (mesmo Promise.
    // all), sempre; não muda o carregamento de perf/mensal se falhar (ver
    // buscarSugestaoRevisaoValor, devolve null em qualquer erro).
    const [perf, mensal, revisao] = await Promise.all([
        api.buscarPerformanceAtivo(a.id, ano),
        api.buscarResultadoMensalAtivo(a.id, estado.clienteId, ano),
        api.buscarSugestaoRevisaoValor(a.id),
    ]);

    if (!perf) {
        painelResumo.innerHTML = `<p class="rz-desc" style="grid-column:1/-1;color:var(--danger)">Não foi possível carregar a performance agora.</p>`;
        return;
    }

    painelResumo.innerHTML = montarKpisPerformanceAtivo(perf);
    painelGrafico.innerHTML = montarGraficoRecebimentoAtivo(mensal);
    painelGrid.innerHTML = montarGridPerformanceAtivo(perf);
    if (painelRevisao) {
        revisaoValorAtual = revisao || null;
        painelRevisao.innerHTML = revisao ? montarCardRevisaoValor(revisao) : '';
    }
    refrescarIcones();
}

function fmtMoedaAtivo(v) { return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
function fmtPctAtivo(v) { return v == null ? '—' : `${v}%`; }

// 2 KPIs do ano (ESP §8, ponto 1) — mesmo formato único .rz-kpi (REGRAS
// §9) já usado no resto da ficha; troca o recorte de 6 meses que existia
// aqui (fn_fluxo_financeiro_ativo) pelo ano corrente, direto de
// fn_performance_ativo — mesma chamada que já alimenta o gráfico e o grid,
// nenhuma 2ª fonte de dado pro mesmo período.
function montarKpisPerformanceAtivo(perf) {
    return `
        <div class="rz-kpi rz-in"><small>Recebido no ano</small><b>${fmtMoedaAtivo(perf.receita_ano)}</b></div>
        <div class="rz-kpi"><small>Saídas no ano</small><b>${fmtMoedaAtivo(perf.saidas_ano)}</b></div>`;
}

// Gráfico "Recebimento mês a mês" (ESP §8, ponto 2 — novo). Mesmo desenho
// de barras de montarGraficoMensal() (resultados.js), simplificado: aqui
// é sempre recebimento (nunca negativo), então 1 cor só, sem linha de
// média nem rótulo de pico/vale.
function montarGraficoRecebimentoAtivo(mensal) {
    const NOMES_MES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    if (!mensal || !mensal.length || !mensal.some(m => Number(m.recebido) > 0)) {
        return `<div class="rz-card"><div class="rz-card-h"><h3>Recebimento mês a mês</h3></div><p class="rz-desc" style="margin-top:8px">Sem recebimento neste ano.</p></div>`;
    }
    const valores = mensal.map(m => Number(m.recebido) || 0);
    const max = Math.max(...valores, 0) || 1;
    const barras = mensal.map((m, i) => {
        const alturaPct = Math.max(2, (valores[i] / max) * 100);
        return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%">
            <div title="${NOMES_MES[m.mes - 1]}: ${fmtMoedaAtivo(valores[i])}" style="width:70%;height:${alturaPct}%;border-radius:3px 3px 0 0;background:var(--sprout)"></div>
            <small style="font-size:9.5px;color:var(--muted);margin-top:3px">${NOMES_MES[m.mes - 1]}</small>
        </div>`;
    }).join('');
    return `<div class="rz-card">
        <div class="rz-card-h"><h3>Recebimento mês a mês</h3></div>
        <div style="height:120px;display:flex;align-items:flex-end;gap:3px;margin-top:14px">${barras}</div>
    </div>`;
}

// Grid de 10 campos (ESP §8, ponto 3 / C4-C5). Mesma anatomia .rz-kv de
// montarPerformanceGrid() (resultados.js) — a "Rentabilidade" carrega a
// mediana da carteira JUNTO na mesma linha (não é um 11º campo: é o
// mesmo campo com o número de comparação ao lado, que é o que "pra
// comparar" pede), honestamente omitida quando o ativo é não-comercial
// (fn_performance_ativo já devolve null nesse caso, mesma regra da
// ESP §4.3 aplicada em Resultados). "Dias alugado/vago" saem null pra
// ativo de finalidade diferente de long_stay — mesma honestidade, "—" em
// vez de inventar.
function montarGridPerformanceAtivo(perf) {
    const kv = (r, v) => `<div><small>${r}</small><b>${v}</b></div>`;
    const rentabilidadeTxt = perf.rentabilidade_pct == null ? '—'
        : `${fmtPctAtivo(perf.rentabilidade_pct)}${perf.rentabilidade_mediana_carteira_pct != null ? ` · carteira ${fmtPctAtivo(perf.rentabilidade_mediana_carteira_pct)}` : ''}`;
    const linhas = [
        kv('Resultado líquido', fmtMoedaAtivo(perf.resultado_liquido)),
        kv('Rentabilidade', rentabilidadeTxt),
        kv('Receita do ano', fmtMoedaAtivo(perf.receita_ano)),
        kv('Patrimônio', fmtMoedaAtivo(perf.patrimonio) + (perf.patrimonio_revisado_em ? ` <small style="font-weight:400">· revisado ${formatarDataBR(perf.patrimonio_revisado_em)}</small>` : '')),
        kv('Tributos', fmtMoedaAtivo(perf.tributos)),
        kv('Manutenção', fmtMoedaAtivo(perf.manutencao)),
        kv('Seguros', fmtMoedaAtivo(perf.seguros)),
        kv('Inadimplência', fmtMoedaAtivo(perf.inadimplencia_valor)),
    ];
    // v1.60.0 (demanda 44f30857, item 2) — ícone (i) explicando as 10
    // métricas do card, mesmo padrão já usado em Resultados (resultados.js,
    // botaoInfoCard) — só que aqui abre modalGenerico (cofre-ui.js), a UI
    // nativa do Cofre, em vez do abrirSheet do app principal (os 2
    // convivem — cada módulo usa a UI que já tinha).
    return `<div class="rz-card">
        <div class="rz-card-h" style="justify-content:space-between"><h3>Indicadores do ano</h3><button type="button" data-action="fa-info-performance" class="text-slate-400" title="O que é isso?" aria-label="O que é isso?" style="line-height:0"><svg data-lucide="info" style="width:14px;height:14px"></svg></button></div>
        <div class="rz-kv">${linhas.join('')}</div>
    </div>`;
}

// v1.60.0 (demanda 44f30857, item 2 — achado do Nicola: "chip Performance
// (tela do ativo)... incluir um botão/ícone 'i' explicando as métricas
// exibidas") — 1 explicação por campo do grid acima, mesmo texto/tom das
// info-sheets já escritas em resultados.js.
export function abrirInfoPerformanceAtivo() {
    const itens = [
        ['Resultado líquido', 'Recebido menos saídas deste ativo no ano corrente.'],
        ['Rentabilidade', 'O resultado do ano dividido pelo valor de mercado do ativo. "carteira" ao lado é a mediana de todos os ativos comerciais desta carteira, pra comparar — some quando o ativo é não-comercial.'],
        ['Receita do ano', 'Tudo o que foi efetivamente recebido no ano (aluguéis pagos).'],
        ['Patrimônio', 'O valor de mercado cadastrado para este ativo.'],
        ['Dias alugado / vago no ano', 'Quantos dias, dentro do ano corrente, o ativo passou alugado e vago — só calculado para imóveis de uso long stay.'],
        ['Tributos, Manutenção, Seguros', 'Total gasto no ano em cada categoria de despesa deste ativo.'],
        ['Inadimplência', 'Total ainda em atraso nos contratos deste ativo.'],
    ];
    modalGenerico('Sobre o card Performance', `<div class="rz-card"><div class="rz-kv">${
        itens.map(([r, v]) => `<div class="rz-full"><small>${escapeHtml(r)}</small><b style="font-weight:500;font-size:12.5px">${escapeHtml(v)}</b></div>`).join('')
    }</div></div>`);
}

// v1.65.0 (demanda 2bb6705e, item 6) — mesmo padrão de
// abrirInfoPerformanceAtivo() acima: 1 explicação curta pro campo técnico
// "CIB (NFS-e)" do formulário de imóvel/ativo.
export function abrirInfoCib() {
    const itens = [
        ['O que é', 'Identificador único do imóvel criado pela Reforma Tributária — uma espécie de "CPF do imóvel". Atribuído automaticamente pelo cartório de registro de imóveis, sem exigir nenhuma ação do proprietário.'],
        ['Por que aparece aqui', 'A partir de 01/12/2026 ele passa a ser exigido na nota fiscal de serviço (NFS-e) de aluguel. Se ainda não tiver o número, pode deixar o campo em branco por enquanto.'],
    ];
    modalGenerico('O que é o CIB?', `<div class="rz-card"><div class="rz-kv">${
        itens.map(([r, v]) => `<div class="rz-full"><small>${escapeHtml(r)}</small><b style="font-weight:500;font-size:12.5px">${escapeHtml(v)}</b></div>`).join('')
    }</div></div>`);
}

// v1.67.0 (demanda 1163097a) — mesmo padrão de abrirInfoCib() acima, pro
// campo "Situação de uso" do mesmo bloco "+ Mostrar mais campos".
export function abrirInfoSituacaoUso() {
    const itens = [
        ['O que é', 'Em que estado o imóvel está agora — campo informativo, não entra em nenhum cálculo do sistema.'],
        ['Disponível / Ocioso', 'Vago, sem contrato nem processo de locação em andamento.'],
        ['Alugado / Em uso', 'Já ocupado — por contrato de locação vigente ou uso próprio.'],
        ['Reservado / Assinando', 'Tem interessado ou contrato em processo de assinatura.'],
        ['Manutenção / Em breve', 'Temporariamente indisponível ou prestes a ficar pronto para uso.'],
    ];
    modalGenerico('Sobre a Situação de uso', `<div class="rz-card"><div class="rz-kv">${
        itens.map(([r, v]) => `<div class="rz-full"><small>${escapeHtml(r)}</small><b style="font-weight:500;font-size:12.5px">${escapeHtml(v)}</b></div>`).join('')
    }</div></div>`);
}

// v1.67.0 (demanda 1163097a) — mesmo padrão, pro campo "Destinação
// (NFS-e)" (renderizarCampoDestinacao()).
export function abrirInfoDestinacao() {
    const itens = [
        ['O que é', 'Se o imóvel é Residencial ou Não residencial para efeito da nota fiscal de serviço (NFS-e) de aluguel.'],
        ['Pelo tipo do imóvel', 'Sem escolha manual, o sistema usa o padrão do tipo cadastrado (ex.: apartamento = residencial). Você pode sobrepor escolhendo manualmente.'],
        ['Por que aparece aqui', 'A partir de 01/12/2026 a NFS-e de aluguel passa a exigir essa classificação.'],
    ];
    modalGenerico('Sobre a Destinação (NFS-e)', `<div class="rz-card"><div class="rz-kv">${
        itens.map(([r, v]) => `<div class="rz-full"><small>${escapeHtml(r)}</small><b style="font-weight:500;font-size:12.5px">${escapeHtml(v)}</b></div>`).join('')
    }</div></div>`);
}

// v1.66.0 (demanda ec7d8a9f, item 5) — "+ Mostrar mais campos" do bloco
// imóvel (renderizarBlocoImovel). prefixo chega pelo data-prefixo do
// próprio botão — funciona em criação e edição sem distinguir os 2 casos.
export function alternarCamposAvancadosImovel(prefixo) {
    const bloco = document.getElementById(prefixo + 'mais-campos');
    const btn = document.getElementById(prefixo + 'toggle-mais-campos');
    if (!bloco || !btn) return;
    const vaiAbrir = bloco.classList.contains('hidden');
    bloco.classList.toggle('hidden', !vaiAbrir);
    btn.textContent = vaiAbrir ? '− Ocultar campos avançados' : '+ Mostrar mais campos';
}

function fmtSinalPctAtivo(v) {
    if (v == null) return '';
    const n = Number(v);
    const sinal = n > 0 ? '+' : '';
    return `${sinal}${n.toFixed(1).replace('.', ',')}%`;
}

// ============================================================================
// REVISÃO ANUAL DE VALOR (Entrega R.4, ESP §8.1/C6) — card no chip
// Performance, só aparece quando o ativo tem uma revisão em andamento
// (`rev` vem null de fn_revisao_valor_sugerir quando não tem, e
// montarFinanceiroAtivo nem chama esta função). Sugestão da IA + memória
// de cálculo já ABERTA (mesma mecânica do reajuste/renovação, ESP §7 —
// nunca "quanto vale?", sempre um número proposto pronto pra confirmar,
// corrigir ou adiar). Vocabulário (RV7): "valor cadastrado"/"sugestão",
// nunca "avaliação"/"laudo"/"valor de mercado" — a própria função no banco
// já devolve os textos da memória de cálculo nesse vocabulário; aqui só
// formata valor/data/selo de prazo.
// ============================================================================
function montarCardRevisaoValor(rev) {
    const r = typeof window.renderStatus === 'function' ? window.renderStatus : (c, t) => `<span class="rz-st rz-${c}">${escapeHtml(t)}</span>`;
    const dias = diasAte(rev.data_prevista_atual);
    const pill = dias == null ? '' : dias < 0 ? r('bad', `há ${Math.abs(dias)}d`) : dias === 0 ? r('warn', 'Vence hoje') : r('run', `Em ${dias}d`);
    const valorAtualTxt = rev.valor_atual != null ? fmtMoedaAtivo(rev.valor_atual) : '—';
    const revisadoTxt = rev.valor_revisado_em ? ` <small style="font-weight:400">· revisado ${formatarDataBR(rev.valor_revisado_em)}</small>` : '';
    const temSugestao = rev.valor_sugerido != null && Number(rev.sugestao_pct) !== 0;
    const sugestaoLinha = temSugestao
        ? `<div><small>Sugestão da IA ✨</small><b>${fmtMoedaAtivo(rev.valor_sugerido)}</b> <small style="font-weight:600">${fmtSinalPctAtivo(rev.sugestao_pct)}</small></div>`
        : '';
    const memoria = (rev.memoria_calculo || []).map(m => `<li>${escapeHtml(m)}</li>`).join('');
    return `<div class="rz-card">
        <div class="rz-card-h" style="justify-content:space-between"><h3>Revisão anual de valor</h3>${pill}</div>
        <p class="rz-desc" style="margin-top:2px">Item de controle do ativo · anual · a IA já prepara a sugestão</p>
        <div class="rz-kv" style="margin-top:10px">
            <div><small>Valor cadastrado</small><b>${valorAtualTxt}</b>${revisadoTxt}</div>
            ${sugestaoLinha}
        </div>
        ${memoria ? `<div class="rz-desc" style="margin-top:10px"><b style="display:block;margin-bottom:4px;color:var(--ink)">Como a IA chegou aí</b><ul style="margin:0;padding-left:18px">${memoria}</ul></div>` : ''}
        <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;align-items:center">
            <button class="rz-btn rz-btn-1 rz-sm" data-action="fa-revisar-valor">Revisar valor</button>
            <button class="rz-btn rz-btn-3 rz-sm" data-action="fa-revisao-adiar">Adiar 30 dias</button>
            <button class="rz-btn rz-btn-3 rz-sm" data-action="fa-revisao-manter">Manter o valor</button>
        </div>
    </div>`;
}

// "Revisar valor" (RV4 — ação abre o sheet direto, com a sugestão já
// calculada). Campo editável pré-preenchido com a sugestão (ou o valor
// cadastrado, quando não há sugestão — IVG-R ainda sem histórico); origem
// gravada em fn_revisao_valor_aplicar diferencia se o usuário aceitou o
// número da IA ou editou (auditoria, não afeta o resultado).
export function abrirRevisarValor() {
    const rev = revisaoValorAtual;
    if (!rev) return;
    if (typeof window.abrirSheetForm !== 'function') { mostrarToast('Abra pelo app principal.', 'erro'); return; }
    const valorInicial = rev.valor_sugerido ?? rev.valor_atual ?? '';
    const memoria = (rev.memoria_calculo || []).map(m => `<li>${escapeHtml(m)}</li>`).join('');
    const corpo = `
        <div class="rz-f">
            <label>Valor</label>
            <input type="number" step="0.01" id="fa-revisao-valor" value="${valorInicial}">
            <span class="rz-hint">Valor cadastrado hoje: ${rev.valor_atual != null ? fmtMoedaAtivo(rev.valor_atual) : '—'}</span>
        </div>
        ${memoria ? `<div class="rz-desc" style="margin-top:4px"><b style="display:block;margin-bottom:4px;color:var(--ink)">Como a IA chegou aí</b><ul style="margin:0;padding-left:18px">${memoria}</ul></div>` : ''}
    `;
    window.abrirSheetForm({
        titulo: 'Revisar valor', sub: estado.ativoEmFoco?.nome_exibicao, corpo, rotuloSalvar: 'Confirmar',
        aoSalvar: async () => {
            const valor = Number(document.getElementById('fa-revisao-valor')?.value);
            if (!valor || valor <= 0) { mostrarToast('Informe um valor válido.', 'erro'); return false; }
            const origem = rev.valor_sugerido != null && valor === Number(rev.valor_sugerido) ? 'sugestao_ia' : 'editado_manual';
            try {
                await api.aplicarRevisaoValor(rev.ocorrencia_id, valor, origem);
                mostrarToast('Revisão aplicada.', 'sucesso');
                await montarFinanceiroAtivo(estado.ativoEmFoco);
                return true;
            } catch (err) {
                mostrarToast('Falha ao aplicar: ' + err.message, 'erro');
                return false;
            }
        }
    });
}

// "Manter o valor" (ação terciária, um toque — RV6: mesmo assim grava a
// data de revisão e dá baixa na ocorrência, senão o alerta voltaria amanhã
// como se nada tivesse sido revisado).
export async function manterValorRevisao() {
    const rev = revisaoValorAtual;
    if (!rev) return;
    if (rev.valor_atual == null) { mostrarToast('Cadastre o valor do ativo antes.', 'erro'); return; }
    try {
        await api.aplicarRevisaoValor(rev.ocorrencia_id, rev.valor_atual, 'manter_valor');
        mostrarToast('Valor mantido — revisão confirmada.', 'sucesso');
        await montarFinanceiroAtivo(estado.ativoEmFoco);
    } catch (err) {
        mostrarToast('Falha ao confirmar: ' + err.message, 'erro');
    }
}

// "Adiar 30 dias" (ação terciária, um toque — reusa api.reagendarOcorrencia,
// já existente pra qualquer ocorrência do Cofre, cofre-controles.js v1.x —
// não duplica lógica, só empurra data_prevista_atual; não toca no valor).
export async function adiarRevisaoValor() {
    const rev = revisaoValorAtual;
    if (!rev) return;
    const base = rev.data_prevista_atual ? new Date(rev.data_prevista_atual + 'T00:00:00') : new Date();
    base.setDate(base.getDate() + 30);
    const novaData = base.toISOString().slice(0, 10);
    try {
        await api.reagendarOcorrencia(rev.ocorrencia_id, novaData);
        mostrarToast('Revisão adiada em 30 dias.', 'sucesso');
        await montarFinanceiroAtivo(estado.ativoEmFoco);
    } catch (err) {
        mostrarToast('Falha ao adiar: ' + err.message, 'erro');
    }
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
        mostrarToast('Abra pelo app principal.', 'erro');
    }
}

// v1.19.0 — contratação e sheet de ações do chip Contratos (ponte pro App:
export function abrirNovoContratoDoAtivo() {
    const a = estado.ativoEmFoco;
    // v1.41.0 — ehCategoriaImovel() no lugar de entidade_origem_tipo,
    // mesma correção do resto desta rodada (consistência; ver nota em
    // montarContratosAtivo acima).
    if (!ehCategoriaImovel(a?.tipo_ativo)) { mostrarToast('Contrato de locação é só de imóvel.', 'erro'); return; }
    if (typeof window.switchTab === 'function' && typeof window.criarContratoParaImovel === 'function') {
        window.fichaContratoOrigem = { tipo: 'ativo', id: a.id };
        // v1.31.1 (E0.1 / A6) — switchTab('tab-contratos') saiu: o formulario
        // de contrato agora vive no <body> e abre por cima da ficha do ativo.
        // v1.41.0 (16/09/2026, BUG REAL) — a.id no lugar de
        // a.entidade_origem_id: criarContratoParaImovel() faz
        // imoveis.find(i => i.id === imovelId), e o array `imoveis` usa o
        // id do próprio ativo desde o único caminho de escrita (Onda 12) —
        // pra imóvel nativo, entidade_origem_id é sempre undefined, o find
        // sempre falhava (if (!imo) return — sem toast, sem erro, nada
        // acontecia). A ponte em si sempre existiu (lazy-load em
        // index.html); só o parâmetro estava errado.
        window.criarContratoParaImovel(a.id);
    } else mostrarToast('Abra pelo app principal.', 'erro');
}
// v1.20.0 (Nicola: "faltaram gerar minuta, compartilhar link e as outras
// opções que tinham pra iniciar um novo contrato") — iniciarProcessoContratacao
// do App cria o processo e abre o menu completo (dados do locatário por
// link, WhatsApp, minuta padrão, gerar minuta). O menu em si ainda é o
// Tipo B antigo — vira sheet na fatia 9.
export function iniciarContratacaoDoAtivo() {
    const a = estado.ativoEmFoco;
    if (!ehCategoriaImovel(a?.tipo_ativo)) { mostrarToast('Contrato de locação é só de imóvel.', 'erro'); return; }
    if (typeof window.iniciarProcessoContratacao !== 'function') { abrirNovoContratoDoAtivo(); return; }
    window.fichaContratoOrigem = { tipo: 'ativo', id: a.id };
    // v1.41.0 — mesma correção acima: a.id, não a.entidade_origem_id.
    window.iniciarProcessoContratacao(a.id);
}
// v1.68.0 (demanda 11afd25f) — escolha de "Novo contrato" a partir do ativo:
// os 3 caminhos lado a lado, um passo antes de qualquer formulário.
export function abrirEscolhaNovoContratoDoAtivo() {
    const a = estado.ativoEmFoco;
    if (!ehCategoriaImovel(a?.tipo_ativo)) { mostrarToast('Contrato de locação é só de imóvel.', 'erro'); return; }
    const escM = window.rzContratoModeloNovo && window.rzContratoModeloNovo.ativo_id === a.id ? window.rzContratoModeloNovo.nome : ''; // F25c
    sheetOuAviso({ titulo: escM ? 'Contrato de ' + escM.toLowerCase() : 'Novo contrato', sub: a.nome_exibicao, acoes: [
        { icone: 'sparkles', tipo: 'ia', titulo: 'Carregar documento', codigo: 'cofre.analisar_ia', sub: 'A IA lê o contrato', aoTocar: () => window.__rzUploadAtivo?.(true) },
        { icone: 'plus', titulo: 'Novo contrato', codigo: 'contratos.criar', sub: 'Já com este imóvel', aoTocar: () => abrirNovoContratoDoAtivo() },
        { icone: 'link', titulo: 'Pedir dados do locatário', codigo: 'contratos.criar', sub: 'Link, WhatsApp e minuta', aoTocar: () => iniciarContratacaoDoAtivo() },
    ] });
}
if (typeof window !== 'undefined') window.__rzNovoContratoAtivo = abrirEscolhaNovoContratoDoAtivo;

// v1.88.0 (F25c, Nicola 10/10 20:56) — "Adicionar": os modelos disponíveis para este ativo. O modelo é só a escolha;
// quem é cadastrado é o contrato, que grava o modelo (nucleo/porta.js lê window.rzContratoModeloNovo).
export async function abrirAdicionarModeloAtivo() {
    const a = estado.ativoEmFoco; if (!a) return;
    await garantirCatalogoTiposAtivo();
    // sem o tipo, a lista caía só no Aluguel (sem Arrendamento): se o catálogo falhou, lê o código do tipo direto
    const tipo = tipoDoCatalogo(a.tipo_detalhe_id)?.codigo
        || (a.tipo_detalhe_id ? (await api.dbAuth.from('ativo_tipos').select('codigo').eq('id', a.tipo_detalhe_id).maybeSingle()).data?.codigo : null);
    const ramoAtivo = ramoDoAtivoLista(a);
    let lista = [], tiposContrato = [];
    // v1.112.0 (fatia 6a) — Lavoura (acordo safra) inicia como uso sem contrato; o ciclo da safra vem na fatia 6b
    const semContrato = m => m.acordo === 'nenhum' || m.acordo === 'safra' || m.acordo === 'lote'; // v1.113.0: lote (Leite, Corte) sem contrato (D7-2)
    try {
        const db = api.dbAuth;
        // v1.97.0 (usos fatia 0) — além dos acordos (contrato, reserva), os usos sem acordo: Uso próprio (universal) e os do
        // ramo do ativo permitidos pelo tipo (Uso férias, Moradia, Guardado…). D-P10: só modelos do ramo do ativo — vínculo
        // e cadastro, não acesso. "Disponível" é o repouso e não se escolhe: ele volta sozinho quando o uso termina.
        const [mt, mods, lic, tps] = await Promise.all([
            tipo ? db.from('operacao_modelo_tipos').select('modelo').eq('tipo', tipo).eq('permite_uso', true) : Promise.resolve({ data: [] }),
            db.from('operacao_modelos').select('codigo, ramo, nome, descricao, acordo, status, ordem, universal').in('acordo', ['contrato', 'reserva', 'nenhum', 'safra', 'lote']).order('ordem'), // v1.112.0: safra (Lavoura) é uso sem contrato
            db.rpc('fn_cliente_ramos', { p_cliente_id: estado.clienteId }),
            db.from('contrato_tipos').select('codigo, nome, descricao, modelo, status, ordem').order('ordem'), // v1.101.0 (fatia 2)
        ]);
        tiposContrato = tps.data || [];
        const permite = new Set((mt.data || []).map(x => x.modelo));
        const licenciados = (lic.data || []).map(x => typeof x === 'string' ? x : Object.values(x)[0]);
        // v1.98.0 (Nicola 13/10 23:27: "um item em uso próprio não pode trazer uso próprio como opção") — o modelo em que
        // o ativo está hoje (uso ou repouso) sai da lista dos usos sem contrato
        const hoje = hojeLocalUso();
        const modelosHoje = new Set((usosAtivoId === a.id ? usosLinhasTodas : [])
            .filter(u => u.inicio <= hoje && (!u.fim || u.fim >= hoje)).map(u => u.modelo));
        const stHoje = typeof window.rzStatusDoAtivo === 'function' ? window.rzStatusDoAtivo(a.id) : null;
        if (stHoje?.modelo) modelosHoje.add(stHoje.modelo);
        lista = (mods.data || []).filter(m => {
            if (m.codigo === 'vago') return false;
            if (semContrato(m) && modelosHoje.has(m.codigo)) return false;
            // Usos sem contrato seguem a lente "Ver o app de" (Nicola 16/10 00:48, dem 9404081c): com ramo escolhido, os do ramo
            // da lente ligados ao tipo; sem filtro, os ligados ao tipo em qualquer ramo liberado. Universais sempre.
            // Armadilha: filtrar pelo ramo do ATIVO escondia Moradia (ramo Família) da Casa (ramo Imóveis).
            if (semContrato(m)) {
                if (m.universal) return true;
                const ligado = permite.has(m.codigo) || (!tipo && m.ramo === ramoAtivo);
                const lente = ramoDaLente();
                return ligado && (lente === 'tudo' ? (licenciados.includes(m.ramo) || m.ramo === ramoAtivo) : m.ramo === lente);
            }
            return permite.has(m.codigo) || (!tipo && m.codigo === 'aluguel');
        });
        lista = lista.map(m => ({ ...m, livre: m.status === 'ativo' && (m.universal || licenciados.includes(m.ramo)) }));
    } catch (e) { console.warn('[cofre-ativos] modelos:', e?.message || e); }
    if (!lista.length) { abrirEscolhaNovoContratoDoAtivo(); return; } // sem catálogo: o caminho de sempre (aluguel)
    const nomeRamo = (c) => (typeof window.rzNomeRamo === 'function' ? window.rzNomeRamo(c) : c);
    const acordos = lista.filter(m => !semContrato(m)), livres = lista.filter(m => semContrato(m));
    // v1.101.0 (fatia 2, D-P30) — um contrato por TIPO (contrato_tipos): o modelo diz o uso, o tipo diz o acordo
    // (típico simples, típico longo, atípico…). Modelo sem tipo no catálogo segue como antes.
    const porTipo = [];
    acordos.forEach(m => {
        const tps = tiposContrato.filter(t => t.modelo === m.codigo);
        if (!tps.length) { porTipo.push({ m, t: null }); return; }
        tps.forEach(t => porTipo.push({ m, t }));
    });
    sheetOuAviso({ titulo: 'Adicionar uso', sub: a.nome_exibicao, acoes: [
        ...porTipo.filter(x => x.t).map(({ m, t }) => {
            const livre = m.livre && t.status === 'ativo';
            return { icone: m.acordo === 'reserva' ? 'calendar-days' : 'file-text', codigo: 'contratos.criar',
                titulo: t.nome + (livre ? '' : ' · em breve'),
                sub: livre ? (t.descricao || m.nome) : (t.status !== 'ativo' || m.status !== 'ativo' ? 'Chega em breve' : `Ramo ${nomeRamo(m.ramo)} não contratado`),
                aoTocar: () => {
                    if (!livre) { mostrarToast(t.status !== 'ativo' || m.status !== 'ativo' ? 'Este tipo de contrato chega em breve.' : `O ramo ${nomeRamo(m.ramo)} não está contratado.`, 'aviso'); return; }
                    window.rzContratoModeloNovo = { ativo_id: a.id, modelo: m.codigo, nome: t.nome, tipo_contrato: t.codigo, ate: Date.now() + 30 * 60 * 1000 };
                    abrirEscolhaNovoContratoDoAtivo();
                } };
        }),
        ...porTipo.filter(x => !x.t).map(({ m }) => m).map(m => ({
            icone: m.acordo === 'reserva' ? 'calendar-days' : 'file-text', codigo: 'contratos.criar',
            titulo: 'Contrato de ' + m.nome.toLowerCase() + (m.livre ? '' : ' · em breve'),
            sub: m.livre ? (m.descricao || nomeRamo(m.ramo)) : (m.status !== 'ativo' ? 'Chega em breve' : `Ramo ${nomeRamo(m.ramo)} não contratado`),
            aoTocar: () => {
                if (!m.livre) { mostrarToast(m.status !== 'ativo' ? 'Este modelo chega em breve.' : `O ramo ${nomeRamo(m.ramo)} não está contratado.`, 'aviso'); return; }
                window.rzContratoModeloNovo = { ativo_id: a.id, modelo: m.codigo, nome: m.nome, ate: Date.now() + 30 * 60 * 1000 };
                abrirEscolhaNovoContratoDoAtivo();
            },
        })),
        ...livres.map(m => ({
            icone: m.codigo === 'revenda' ? 'tag' : m.acordo === 'safra' ? 'sprout' : m.acordo === 'lote' ? 'beef' : m.ramo === 'obras' ? 'hard-hat' : 'user-check', codigo: 'ativos.usos.iniciar',
            titulo: m.nome + (m.livre ? '' : ' · em breve'),
            sub: m.livre ? (m.descricao || 'Sem contrato: só o período de uso') : 'Chega em breve',
            aoTocar: () => {
                if (!m.livre) { mostrarToast('Este modelo chega em breve.', 'aviso'); return; }
                abrirIniciarUsoAtivo(a, m);
            },
        })),
    ] });
}

// v1.97.0 (usos fatia 0) — uso sem contrato (Uso próprio, Uso férias, Guardado…): período e observação. A regra mora no
// banco (fn_ativo_uso_iniciar, a mesma do bot): recusa modelo de contrato, cruzamento com outro uso, e faz o repouso
// ceder; grava status_historico e log_acessos ativos.usos.iniciar.
function abrirIniciarUsoAtivo(a, m) {
    if (typeof window.abrirSheetForm !== 'function') { mostrarToast('Abra pelo app principal.', 'erro'); return; }
    const hoje = hojeLocalUso();
    const corpo = `<div class="rz-f"><label for="fa-uso-ini">Começa em</label><input type="date" id="fa-uso-ini" value="${hoje}"></div>
        <div class="rz-f"><label for="fa-uso-fim">Termina em <small>(opcional)</small></label><input type="date" id="fa-uso-fim" min="${hoje}">
        <span class="rz-hint">Sem data, o uso fica aberto até você concluir pelo ⋮ do uso. Ao terminar, o ativo volta ao repouso (Disponível, Guardado…).</span></div>
        <div class="rz-f" style="margin-bottom:0"><label for="fa-uso-obs">Observação <small>(opcional)</small></label><input type="text" id="fa-uso-obs" maxlength="200" placeholder="Ex.: férias da família"></div>`;
    window.abrirSheetForm({
        titulo: m.nome, sub: a.nome_exibicao, corpo, rotuloSalvar: 'Iniciar uso',
        aoSalvar: async () => {
            const ini = document.getElementById('fa-uso-ini')?.value, fim = document.getElementById('fa-uso-fim')?.value || null;
            const obs = (document.getElementById('fa-uso-obs')?.value || '').trim() || null;
            if (!ini) { mostrarToast('Informe quando o uso começa.', 'erro'); return false; }
            if (fim && fim < ini) { mostrarToast('O fim não pode ser antes do início.', 'erro'); return false; }
            const { error } = await api.dbAuth.rpc('fn_ativo_uso_iniciar', { p_ativo_id: a.id, p_modelo: m.codigo, p_inicio: ini, p_fim: fim, p_observacao: obs, p_canal: 'app' });
            if (error) { mostrarToast(error.message || 'Não foi possível iniciar o uso.', 'erro'); return false; }
            mostrarToast(`${m.nome} registrado.`, 'sucesso');
            await aposMudarUso(a);
            return true;
        },
    });
}

// v1.97.0 — "Concluir <uso>" no ⋮ da ficha: só para o uso de hoje que não é contrato nem repouso
function acaoConcluirUsoVigente(a) {
    const u = usoVigenteFicha;
    if (!u || u.contrato_id || u.repouso || usosAtivoId !== a.id) return [];
    return [{ icone: 'flag', titulo: 'Concluir ' + u.nome.toLowerCase(), codigo: 'ativos.usos.concluir', sub: 'Desde ' + formatarDataBR(u.inicio) + ' · depois volta ao repouso', aoTocar: () => abrirConcluirUsoAtivo(a, u) }];
}
function abrirConcluirUsoAtivo(a, u) {
    if (typeof window.abrirSheetForm !== 'function') { mostrarToast('Abra pelo app principal.', 'erro'); return; }
    const hoje = hojeLocalUso();
    const corpo = `<div class="rz-f"><label for="fa-uso-fim2">Último dia do uso</label><input type="date" id="fa-uso-fim2" min="${u.inicio}" value="${hoje < u.inicio ? u.inicio : hoje}">
        <span class="rz-hint">No dia seguinte o ativo volta ao repouso (Disponível, Guardado…).</span></div>
        <div class="rz-f" style="margin-bottom:0"><label for="fa-uso-mot">Motivo <small>(opcional)</small></label><input type="text" id="fa-uso-mot" maxlength="200"></div>`;
    window.abrirSheetForm({
        titulo: 'Concluir ' + u.nome.toLowerCase(), sub: a.nome_exibicao, corpo, rotuloSalvar: 'Concluir',
        aoSalvar: async () => {
            const fim = document.getElementById('fa-uso-fim2')?.value;
            const mot = (document.getElementById('fa-uso-mot')?.value || '').trim() || null;
            if (!fim) { mostrarToast('Informe o último dia do uso.', 'erro'); return false; }
            const { error } = await api.dbAuth.rpc('fn_ativo_uso_concluir', { p_uso_id: u.uso_id, p_fim: fim, p_motivo: mot, p_canal: 'app' });
            if (error) { mostrarToast(error.message || 'Não foi possível concluir o uso.', 'erro'); return false; }
            mostrarToast(`${u.nome} concluído.`, 'sucesso');
            await aposMudarUso(a);
            return true;
        },
    });
}
// depois de iniciar ou concluir: relê o status (lente, selo, lista) e repinta o card Usos e o topo da ficha
async function aposMudarUso(a) {
    try { if (typeof window.rzRecarregarUsosRamo === 'function') await window.rzRecarregarUsosRamo(); } catch (e) { console.warn('[cofre-ativos] status:', e?.message || e); }
    const selo = document.getElementById('fa-status-selo');
    if (selo) selo.innerHTML = statusAtivoHtml(a);
    await montarUsosAtivo(a); // v1.99.0 — remonta também o card Histórico
    window.dispatchEvent(new CustomEvent('cofre:recarregar-ativos'));
}
if (typeof window !== 'undefined') window.__rzAdicionarModeloAtivo = abrirAdicionarModeloAtivo;

export function abrirAcoesPropriedade() {
    const a = estado.ativoEmFoco; if (!a) return;
    const fora = a.registro_contabil === 'fora';
    sheetOuAviso({ titulo: 'Propriedade', sub: a.nome_exibicao, acoes: [
        { icone: 'pencil', titulo: 'Editar divisão', codigo: 'imoveis.divisao', sub: 'Sócios e percentuais', aoTocar: () => abrirEditarPropriedadeAtivo() },
        // v1.72.0 (P2 Ficha 3, demanda cad6ec67) — eixo contábil do ativo (cofre_ativos.registro_contabil)
        { icone: fora ? 'plus-circle' : 'ban', titulo: fora ? 'Incluir na contabilidade' : 'Tirar da contabilidade', codigo: 'imoveis.divisao',
          sub: fora ? 'Volta ao pacote do contador' : 'Não vai ao contador',
          aoTocar: () => alternarRegistroContabilAtivo() },
    ] });
}

// v1.72.0 (P2 Ficha 3, demanda cad6ec67) — alterna o eixo contábil do ativo.
// "fora" = patrimônio fora da PJ (pessoa física, sócio externo): continua no
// Raiz para controle e distribuição, mas fn_fechamento_calcular_contabil
// deixa de levar recebimentos e lançamentos dele ao pacote do contador.
// Pacotes já gerados não mudam (snapshot imutável).
async function alternarRegistroContabilAtivo() {
    const a = estado.ativoEmFoco; if (!a) return;
    const novo = a.registro_contabil === 'fora' ? 'empresa' : 'fora';
    try {
        await api.atualizarAtivo(a.id, { registro_contabil: novo });
        a.registro_contabil = novo;
        emitirEscrita('ativo', { id: a.id, acao: 'registro_contabil' });
        mostrarToast(novo === 'fora' ? 'Ativo fora da contabilidade da empresa' : 'Ativo de volta à contabilidade da empresa', 'sucesso');
        // v1.111.0 (demanda 4a28ad50, D5) — incluiu com o "Envio ao contador" desligado: permite, mas avisa que não vai ao pacote
        if (novo === 'empresa') {
            try {
                const { data: rot } = await api.dbAuth.rpc('fn_rotinas_empresa_listar', { p_cliente_id: estado.clienteId });
                const envio = (rot || []).find(r => r.codigo === 'envio_contador');
                if (envio && !envio.ligada) setTimeout(() => mostrarToast('Ligue o Envio ao contador em Rotinas', 'info'), 1800);
            } catch (_) { /* aviso é só ajuda */ }
        }
        await montarPropriedadeAtivo(a);
    } catch (err) {
        mostrarToast('Não consegui alterar: ' + (err.message || err), 'erro');
    }
}

// v1.72.0 — linha de leitura no fim do chip Propriedade (o toque abre o ⋮).
function registroContabilLinhaHtml(a) {
    const fora = a.registro_contabil === 'fora';
    return `<div class="rz-row rz-link" role="button" tabindex="0" onclick="window.__rzAcoesPropriedade && window.__rzAcoesPropriedade()">
            <div class="rz-ic${fora ? ' rz-neu' : ''}"><i data-lucide="${fora ? 'ban' : 'landmark'}"></i></div>
            <div class="rz-tx"><b>Contabilidade da empresa</b><span>${fora ? 'Fora — não vai ao pacote do contador' : 'Entra no pacote do contador'}</span></div>
            <div class="rz-rt"><span class="rz-st rz-${fora ? 'neu' : 'ok'}">${fora ? 'Fora' : 'Entra'}</span></div>
            <button type="button" class="rz-more" aria-label="Ações da propriedade" onclick="event.stopPropagation(); window.__rzAcoesPropriedade && window.__rzAcoesPropriedade()"><i data-lucide="ellipsis-vertical"></i></button>
        </div>`;
}
if (typeof window !== 'undefined') window.__rzAcoesPropriedade = () => abrirAcoesPropriedade();
// v1.67.0 (demanda c0d255e3, retorno do piloto — "no botão de cadastro
// novo... deixe claro que ele pode adicionar um documento-IA ou cadastrar
// via tela") — "Carregar documento" entra como 1ª opção, igual ao "+" da
// aba Ativos (case 'abrir-acoes-ativos', cofre-app.js) e ao chip Anexos
// deste mesmo ativo (abrirAcoesAnexos() abaixo): documento com IA já
// preenche os itens de controle sozinho (mesma chamada,
// window.__rzUploadAtivo?.(true)) — antes, essa opção só existia no chip
// Anexos, sem nenhuma pista aqui em Itens de controle.
export function abrirAcoesControlesAtivo() {
    const a = estado.ativoEmFoco; if (!a) return;
    sheetOuAviso({ titulo: 'Itens de controle', sub: a.nome_exibicao, acoes: [
        { icone: 'sparkles', tipo: 'ia', titulo: 'Carregar documento', codigo: 'cofre.analisar_ia', sub: 'A IA preenche os itens', aoTocar: () => window.__rzUploadAtivo?.(true) },
        { icone: 'plus', titulo: 'Novo item de controle', codigo: 'cofre.controles.criar', sub: 'Seguro, tributo, vistoria', aoTocar: () => window.__rzAbrirFormControle?.() },
        { icone: 'package', titulo: 'Programas', codigo: 'programas.ver', sub: 'Pacotes prontos de itens', aoTocar: () => abrirProgramasDoAtivo() }, // v1.110.0
    ] });
}
// v1.110.0 (fatia 4) — a lista de programas mora em cofre-controles.js (window.__rzAbrirProgramas); abre no chip Controles
function abrirProgramasDoAtivo() {
    if (typeof window.__rzAbrirProgramas !== 'function') { mostrarToast('Abra pelo app principal.', 'erro'); return; }
    if (typeof faTrocarAba === 'function') faTrocarAba('controles');
    window.__rzAbrirProgramas();
}

// ============================================================================
// v1.92.0 — CHIP FINANCEIRO DO ATIVO (F13 4c etapas 3 e 4). Balanço pendente no topo (⋮ com o balanço completo),
// contas e extraordinárias do ativo pessoa, a visão por competência (rzFinCompetencias, a mesma do contrato) e os
// indicadores do ano no fim. Lê fn_balanco_pessoas e fn_retiradas_extraordinarias; o resto vem do Financeiro.
// ============================================================================
let movAtivoId = null;
const MOV_NATUREZA = { distribuicao: 'distribuição', reembolso: 'reembolso', adiantamento: 'adiantamento', rateio: 'rateio', extraordinaria: 'retirada extraordinária' };
const movEsc = (t) => escapeHtml(String(t ?? ''));

export async function montarMovimentoAtivo(a) {
    const corpo = document.getElementById('fa-movimento-corpo');
    if (!corpo || !a) return;
    movAtivoId = a.id;
    const pessoaId = a.entidade_origem_tipo === 'pessoa' ? a.entidade_origem_id : null;
    corpo.innerHTML = `<div id="fa-mov-topo">${rzSk('linhas', 2)}</div><div id="fa-mov-comp"></div>`;
    refrescarIcones();
    if (typeof window.rzFinCompetencias === 'function') window.rzFinCompetencias('fa-mov-comp', { ativoId: a.id, pessoaId, nome: a.nome_exibicao });
    else document.getElementById('fa-mov-comp').innerHTML = `<p class="rz-desc">O financeiro do ativo abre só dentro do app principal.</p>`;
    try {
        const db = api.dbAuth, cli = estado.clienteId, hoje = new Date().toISOString().slice(0, 10);
        const ok = (r, nome) => { if (r?.error) throw new Error(`${nome}: ${r.error.message || r.error}`); return r?.data || []; };
        const [rB, rX, rC] = await Promise.all([
            db.rpc('fn_balanco_pessoas', { p_cliente_id: cli, p_ate: hoje, p_ativo_id: pessoaId ? null : a.id }),
            pessoaId ? db.rpc('fn_retiradas_extraordinarias', { p_cliente_id: cli, p_pessoa_id: pessoaId, p_de: `${hoje.slice(0, 4)}-01-01`, p_ate: hoje }) : Promise.resolve({ data: [] }),
            pessoaId ? db.from('conta_controle').select('id, nome, tipo, final_identificador, situacao, dia_vencimento, cartao_principal_id').eq('cliente_id', cli).eq('titular_tipo', 'pessoa').eq('pessoa_id', pessoaId) : Promise.resolve({ data: [] }),
        ]);
        if (movAtivoId !== a.id) return;
        const bal = ok(rB, 'balanço').filter(l => Math.abs(Number(l.valor || 0)) > 0.004 && (!pessoaId || l.pessoa_id === pessoaId));
        const contas = ok(rC, 'contas');
        // v1.103.0 — cartão adicional: total das compras dele na última fatura do principal
        const resumoAd = {};
        if (contas.some(c => c.cartao_principal_id)) {
            try {
                const { data } = await db.rpc('fn_fatura_listar', { p_cliente_id: cli });
                for (const f of (data?.dados || [])) for (const ad of (f.adicionais || []))
                    if (!resumoAd[ad.id]) resumoAd[ad.id] = { principal: f.cartao_nome, competencia: f.competencia, soma: Number(ad.soma || 0), qtd: Number(ad.qtd || 0) };
            } catch (e) { console.warn('[cofre-ativos] faturas do adicional:', e?.message || e); }
            if (movAtivoId !== a.id) return;
        }
        movDesenharTopo(a, pessoaId, bal, ok(rX, 'extraordinárias'), contas, resumoAd);
    } catch (err) {
        console.warn('[cofre-ativos] financeiro do ativo falhou:', err?.message || err);
        const t = document.getElementById('fa-mov-topo');
        if (t) t.innerHTML = `<div class="rz-card"><p class="rz-desc" style="color:var(--danger)">Não consegui ler o balanço agora.<br><small>${movEsc(err?.message || err)}</small></p></div>`;
    }
}

function movDesenharTopo(a, pessoaId, bal, ex, contas, resumoAd = {}) {
    const t = document.getElementById('fa-mov-topo'); if (!t) return;
    const fmt = fmtMoedaAtivo, nomeAtivo = a.nome_exibicao || 'Pessoa';
    const pn = (x) => String(x || '').split(' ')[0]; // primeiro nome: a frase cabe na linha
    const total = bal.reduce((s, l) => s + Math.abs(Number(l.valor || 0)), 0);
    const linha = (l, i) => {
        const v = Number(l.valor || 0), quem = pn(l.nome || nomeAtivo), contra = l.contraparte_tipo === 'caixa' ? 'Empresa' : pn(l.contraparte_nome);
        const frase = v > 0 ? `${contra} deve a ${quem}` : `${quem} deve ${l.contraparte_tipo === 'caixa' ? 'à' : 'a'} ${contra}`;
        return `<div class="rz-row rz-link" role="button" tabindex="0" data-mov-bal="${i}">
            <div class="rz-ic${v > 0 ? '' : ' rz-neu'}"><i data-lucide="${v > 0 ? 'arrow-down-left' : 'arrow-up-right'}"></i></div>
            <div class="rz-tx"><b>${movEsc(frase)}</b><span>${movEsc(MOV_NATUREZA[l.natureza] || l.natureza)}</span></div>
            <div class="rz-rt"><b>${fmt(Math.abs(v))}</b><small style="display:block;text-align:right;color:var(--pine)">Quitar ›</small></div></div>`;
    };
    const cardBal = `<div class="rz-card rz-list"><div class="rz-card-h" style="padding-top:10px;margin-bottom:0"><h3>Balanço pendente</h3><span class="rz-sub">${bal.length ? fmt(total) + ' em aberto' : 'nada em aberto'}</span></div>` +
        (bal.length ? bal.map(linha).join('') : `<p class="rz-desc" style="margin:4px 14px 10px">${pessoaId ? 'Nada em aberto com ' + movEsc(nomeAtivo) : 'Nada em aberto ligado a este ativo'}.</p>`) + '</div>';
    const cardContas = contas.length ? `<div class="rz-card rz-list"><div class="rz-card-h" style="padding-top:10px;margin-bottom:0"><h3>Contas e cartões</h3><span class="rz-sub">${contas.length}</span></div>` +
        contas.map(c => { const cartao = c.tipo === 'cartao_credito'; const r = c.cartao_principal_id ? resumoAd[c.id] : null;
            const mes = r?.competencia ? new Date(r.competencia + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }).replace('.', '') : '';
            const sub = c.cartao_principal_id ? `Adicional${r?.principal ? ' do ' + r.principal : ''}${c.dia_vencimento ? ' · vence dia ' + c.dia_vencimento : ''}` // v1.103.0
                : cartao ? `Cartão de crédito${c.dia_vencimento ? ' · vence dia ' + c.dia_vencimento : ''}` : 'Conta';
            return `<div class="rz-row"><div class="rz-ic"><i data-lucide="${cartao ? 'credit-card' : 'landmark'}"></i></div>
                <div class="rz-tx"><b>${movEsc(c.nome)}${c.final_identificador ? ' ··' + movEsc(c.final_identificador) : ''}</b><span>${movEsc(sub)}${c.situacao !== 'ativa' ? ' · encerrada' : ''}</span></div>${r ? `<div class="rz-rt"><b>${fmt(r.soma)}</b><small style="display:block;text-align:right;color:var(--muted)">fatura ${movEsc(mes)}</small></div>` : ''}</div>`; }).join('') + '</div>' : '';
    const cardExtra = ex.length ? `<div class="rz-card"><div class="rz-card-h"><h3>Retiradas extraordinárias</h3><span class="rz-sub">não abatem o saldo a retirar</span></div>
        <div class="rz-kv"><div><small>No ano</small><b>${fmt(ex[0].total_ano)}</b></div><div><small>Acumulado</small><b>${fmt(ex[0].total_acumulado)}</b></div><div><small>Retiradas no ano</small><b>${ex.length}</b></div></div>
        <div class="rz-list" style="margin-top:8px"><div class="rz-row rz-link" role="button" tabindex="0" data-mov-relret><div class="rz-ic"><i data-lucide="file-text"></i></div><div class="rz-tx"><b>Ver relatório</b><span>Retiradas extraordinárias de ${movEsc(nomeAtivo)}</span></div><i data-lucide="chevron-right" class="rz-chev"></i></div></div></div>` : ''; // v1.93.0 — F13.8
    t.innerHTML = cardBal + cardContas + cardExtra;
    t.querySelectorAll('[data-mov-bal]').forEach(b => b.addEventListener('click', (ev) => { ev.stopPropagation(); movQuitar(a, bal[Number(b.dataset.movBal)]); }));
    t.querySelector('[data-mov-relret]')?.addEventListener('click', () => { if (typeof window.abrirRelatorioExecutivo === 'function') window.abrirRelatorioExecutivo('retiradas', { pessoaId, pessoaNome: nomeAtivo }); });
    refrescarIcones();
}

function movQuitar(a, l) {
    if (!l) return;
    if (typeof window.balancoQuitar !== 'function') { mostrarToast('Abra pelo app principal.', 'erro'); return; }
    window.balancoQuitar({ pessoaId: l.pessoa_id, nome: l.nome || a.nome_exibicao, chave: l.pessoa_id },
        { contraparteTipo: l.contraparte_tipo, contraparteId: l.contraparte_id || null, contraparteNome: l.contraparte_nome || 'Empresa', natureza: l.natureza, valor: Number(l.valor || 0), ultimo: l.ultimo_movimento });
}
function movAbrirBalanco() {
    if (typeof window.switchTab !== 'function') { mostrarToast('Abra pelo app principal.', 'erro'); return; }
    window.switchTab('tab-socios');
    if (typeof window.balancoVista === 'function') setTimeout(() => window.balancoVista('pessoas'), 60);
}

// v1.92.0 — Ocupação (antes no grid da Performance): dias alugado e vago e a taxa, por ano ou somando todos os anos
// desde o primeiro contrato. Só aparece para ativo que tem a medida (fn_performance_ativo devolve nulo nos outros).
async function montarOcupacaoAtivo(a) { // v1.95.0 — a ocupação foi para o card Usos (desenharUsosAno); este card fica escondido
    document.getElementById('fa-card-ocupacao')?.classList.add('hidden');
}

export function abrirAcoesFinanceiroAtivo() {
    const a = estado.ativoEmFoco; if (!a) return;
    sheetOuAviso({ titulo: 'Financeiro', sub: a.nome_exibicao, acoes: [
        { icone: 'scale', titulo: 'Ver o balanço completo', codigo: 'repasses.ver', sub: 'Pessoas e quitações', aoTocar: () => movAbrirBalanco() }, // v1.92.0
        { icone: 'plus', titulo: 'Novo lançamento', codigo: 'saidas.registrar', sub: 'Saída ligada a este ativo', aoTocar: () => abrirNovoLancamentoDoAtivo() },
        { icone: 'wallet', titulo: 'Ver no Financeiro', codigo: 'mensal.ver', sub: 'Todas as saídas deste ativo', aoTocar: () => abrirSaidasDoAtivo() },
    ] });
}
export function abrirAcoesAnexos() {
    const a = estado.ativoEmFoco; if (!a) return;
    sheetOuAviso({ titulo: 'Anexos', sub: a.nome_exibicao, acoes: [
        { icone: 'sparkles', titulo: 'Documento com IA', codigo: 'cofre.analisar_ia', sub: 'Matrícula, IPTU, apólice', tipo: 'ia', aoTocar: () => window.__rzUploadAtivo?.(true) },
        { icone: 'upload', titulo: 'Upload simples', codigo: 'cofre.upload', sub: 'Só guarda o arquivo', aoTocar: () => window.__rzUploadAtivo?.(false) },
        { icone: 'camera', titulo: 'Adicionar fotos', codigo: 'cofre.editar', aoTocar: () => { faTrocarSegArquivos('fotos'); document.getElementById('fa-foto-input')?.click(); } },
    ] });
}
export function abrirAcoesContratosAtivo() {
    const a = estado.ativoEmFoco; if (!a) return;
    sheetOuAviso({ titulo: 'Contratos', sub: a.nome_exibicao, acoes: [
        { icone: 'plus', titulo: 'Adicionar uso', codigo: 'ativos.usos.iniciar', sub: 'Aluguel, temporada…', aoTocar: () => abrirAdicionarModeloAtivo() }, // v1.88.0 (F25c); v1.97.0 usos sem contrato
    ] });
}

export function abrirNovoLancamentoDoAtivo() {
    const a = estado.ativoEmFoco;
    if (!a) return;
    if (typeof window.switchTab === 'function' && typeof window.abrirNovaDespesa === 'function') {
        window.switchTab('tab-saidas');
        window.abrirNovaDespesa(a.id);
    } else {
        mostrarToast('Abra pelo app principal.', 'erro');
    }
}

export function abrirSaidasDoAtivo() {
    const a = estado.ativoEmFoco;
    if (!a) return;
    if (typeof window.switchTab === 'function' && typeof window.abrirSaidasFiltradasPorAtivo === 'function') {
        window.switchTab('tab-saidas');
        window.abrirSaidasFiltradasPorAtivo(a.id, a.nome_exibicao);
    } else {
        mostrarToast('Abra pelo app principal.', 'erro');
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
    lista.innerHTML = rzSk('linhas', 2);

    const linhas = await api.buscarPropriedadeDoAtivo(a.id);

    if (!linhas.length) {
        lista.innerHTML = `<div class="rz-empty"><div class="rz-ic"><i data-lucide="users"></i></div><p>Sem divisão de propriedade ainda.</p></div>` + registroContabilLinhaHtml(a);
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
    // v1.108.0 (fatia 3c, Nicola 14/10 23:22: "o sócio não permite clicar e editar") — sócio tocável, com ⋮ (Editar divisão)
    lista.innerHTML = linhas.map(l => `
        <div class="rz-row rz-link" role="button" tabindex="0" onclick="window.__rzAcoesPropriedade && window.__rzAcoesPropriedade()">
            <div class="rz-ic"><i data-lucide="${l.nome_pessoa ? 'user' : 'user-round'}"></i></div>
            <div class="rz-tx"><b>${escapeHtml(l.nome_pessoa || l.nome_externo || 'Sem nome')}</b><span>${l.nome_pessoa ? 'Sócio' : 'Parte externa'}</span></div>
            <div class="rz-rt"><b style="color:var(--sprout)">${Number(l.percentual)}%</b></div>
            <button type="button" class="rz-more" aria-label="Ações da propriedade" onclick="event.stopPropagation(); window.__rzAcoesPropriedade && window.__rzAcoesPropriedade()"><i data-lucide="ellipsis-vertical"></i></button>
        </div>`).join('') + registroContabilLinhaHtml(a); // v1.72.0 (P2 Ficha 3)
    refrescarIcones();
}

function propriedadeSomaAtual() {
    return propriedadeLinhasEmEdicao.reduce((s, l) => s + (parseFloat(l.percentual) || 0), 0);
}

function propriedadeLinhaHtml(l, idx) {
    const ehInterno = l.tipo_proprietario === 'socio_interno';
    const optsPessoas = (propriedadePessoasCache || []).map(p =>
        `<option value="${p.id}" ${ehInterno && l.pessoa_id === p.id ? 'selected' : ''}>${escapeHtml(p.nome)}</option>`).join('');
    // v1.42.0 (16/09/2026) — hex solto em style="" (#cbd5e1, #f8fafc)
    // trocado por tokens (var(--line), var(--r-ctl)) — achado no mesmo
    // teste real que pediu a conversão pra .rz-f do resto do form
    // (DS §6: "nunca hex em style=''"). Layout continua em LINHA
    // horizontal (3 controles + botão remover) — não cabe na gramática
    // .rz-f (vertical, label acima do campo), por isso o estilo é
    // replicado nos tokens em vez de usar a classe.
    const estiloCampo = 'width:100%;height:38px;padding:0 8px;border:1.5px solid var(--line);border-radius:var(--r-ctl);font-size:12px;background:#fff;color:var(--ink)';
    return `
        <div class="flex gap-2 items-start" data-propriedade-linha="${idx}">
            <div class="flex-1 space-y-1">
                <select onchange="window.__peMudarTipo(${idx}, this.value)" style="${estiloCampo}">
                    <option value="socio_interno" ${ehInterno ? 'selected' : ''}>Sócio interno</option>
                    <option value="terceiro_externo" ${!ehInterno ? 'selected' : ''}>Outro (nome livre)</option>
                </select>
                ${ehInterno
                    ? `<select onchange="window.__peMudarPessoa(${idx}, this.value)" style="${estiloCampo}"><option value="">— selecionar —</option>${optsPessoas}</select>`
                    : `<input type="text" value="${escapeHtml(l.nome_externo || '')}" oninput="window.__peMudarNomeExterno(${idx}, this.value)" placeholder="Nome" style="${estiloCampo}">`}
            </div>
            <input type="number" step="0.01" value="${l.percentual ?? ''}" oninput="window.__peMudarPercentual(${idx}, this.value)" style="${estiloCampo};width:70px" placeholder="%">
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
    // v1.76.0 — no app, o editor único de divisão; o formulário abaixo fica só para o cofre.html avulso
    if (typeof window !== 'undefined' && typeof window.abrirSheet === 'function') {
        rzEditarDivisao({
            titulo: 'Divisão de propriedade', sub: a.nome_exibicao || a.nome || '',
            itens: linhasAtuais.map(l => ({ pessoa_id: l.tipo_proprietario === 'socio_interno' ? l.pessoa_id : null, nome_externo: l.tipo_proprietario === 'socio_interno' ? null : l.nome_externo,
                nome: l.nome_pessoa || l.nome_externo || '', percentual: l.percentual })),
            candidatos: (propriedadePessoasCache || []).map(p => ({ id: p.id, nome: p.nome, sub: 'Sócio' })),
            permitirExterno: true, rotuloAdicionar: 'Adicionar dono',
            aoSalvar: async (itens) => {
                await api.salvarPropriedadeAtivo(a.id, itens.map(i => ({
                    tipo_proprietario: i.pessoa_id ? 'socio_interno' : 'terceiro_externo',
                    pessoa_id: i.pessoa_id || '', nome_externo: i.pessoa_id ? '' : i.nome_externo, percentual: i.percentual })));
                mostrarToast('Divisão de propriedade salva.', 'sucesso');
                await montarPropriedadeAtivo(a);
                return true;
            }
        });
        return;
    }
    propriedadeLinhasEmEdicao = linhasAtuais.length
        ? linhasAtuais.map(l => ({ tipo_proprietario: l.tipo_proprietario, pessoa_id: l.pessoa_id, nome_externo: l.nome_externo, percentual: l.percentual }))
        : [{ tipo_proprietario: 'socio_interno', pessoa_id: null, nome_externo: null, percentual: 100 }];

    modalGenerico('Editar divisão de propriedade', `
        <div id="pe-linhas" class="space-y-2 mb-2"></div>
        <button onclick="window.__peAdicionarLinha()" class="text-xs font-bold px-2.5 py-1.5 rounded-full flex items-center gap-1 mb-3" style="background:var(--tile);color:var(--ink);border:1px solid var(--line)">
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

    propriedadeLinhasEmEdicao = (propriedadeLinhasEmEdicao || []).filter(l => l.pessoa_id || (l.nome_externo || '').trim());
    const soma = propriedadeSomaAtual();
    const temLinhas = propriedadeLinhasEmEdicao.length > 0;
    if (temLinhas && Math.round(soma * 100) / 100 !== 100) {
        mostrarToast(`A soma precisa dar 100% (está em ${soma}%).`, 'erro');
        return;
    }
    for (const l of propriedadeLinhasEmEdicao) {
        const temNome = l.tipo_proprietario === 'socio_interno' ? !!l.pessoa_id : !!(l.nome_externo && l.nome_externo.trim());
        if (!temNome) { mostrarToast('Preencha o nome em todas as linhas.', 'erro'); return; }
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
            a.cib ? `<div><small>CIB (NFS-e)</small><b>${escapeHtml(a.cib)}</b></div>` : '',
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
            // CIB vive em cofre_ativos (não em `imoveis`, tabela isolada
            // desde a Onda 12) — por isso lê de `a.cib` direto, não de
            // resumoImovel, mesmo neste ramo "vinculado".
            campo('CIB (NFS-e)', a.cib ? escapeHtml(a.cib) : ''),
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
            : `<p class="rz-desc">Sem endereço, IPTU ou valor ainda.</p>`;
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
        resumo.innerHTML = `<p class="rz-desc${ehImovelVinculado ? ' mt-2' : ''}">Nenhum campo específico ainda.</p>`;
    } else {
        const kv = camposPreenchidos.map(c => `<div><small>${escapeHtml(c.label)}</small><b>${c.mascarar ? mascarar(dados[c.chave]) : escapeHtml(dados[c.chave])}</b></div>`).join('');
        resumo.innerHTML = `<div class="rz-kv${ehImovelVinculado ? ' mt-2' : ''}">${kv}</div>`;
    }
    if (a.tipo_ativo === 'vida') { resumo.insertAdjacentHTML('beforeend', '<div id="fa-pessoa-cad" class="mt-2"></div>'); desenharPessoaDoAtivo(a); } // v1.100.0 (d6a6f577)

    refrescarIcones();
}

// ============================================================================
// v1.100.0 (14/10/2026, demanda d6a6f577; de acordo do Nicola 14/10 00:08: "opção 1, 2 e 3 (...) não quero que crie
// pessoa automaticamente") — vínculo do ativo vida com a pessoa do cadastro (cofre_ativos.entidade_origem_tipo/_id,
// F16). Ligar, trocar e desligar pela fn_ativo_pessoa_vincular, que recusa pessoa já ligada a outro ativo. A pessoa do
// cadastro não dá acesso ao app (acesso é login + perfil, em Pessoas); ela é o titular das contas e o lado do Balanço.
// Nenhuma pessoa nasce sozinha: só se liga quem já está em Pessoas.
// ============================================================================
function desenharPessoaDoAtivo(a) {
    const alvo = document.getElementById('fa-pessoa-cad');
    if (!alvo) return;
    const ligada = a.entidade_origem_tipo === 'pessoa' && a.entidade_origem_id;
    // v1.108.0 (fatia 3c, Nicola 14/10 23:22: "a pessoa vinculada está diferente do integrante") — linha comum da ficha,
    // sem caixa própria: ícone, nome e ⋮ (Trocar, Desligar), como o integrante e o sócio
    alvo.innerHTML = `<div class="rz-list" style="border-top:1px solid var(--line);margin-top:10px"><div class="rz-row rz-link" role="button" tabindex="0" data-acao="pessoa-cad">
        <div class="rz-ic${ligada ? '' : ' rz-neu'}"><i data-lucide="${ligada ? 'user-check' : 'user-plus'}"></i></div>
        <div class="rz-tx"><b id="fa-pessoa-cad-nome">${ligada ? 'carregando…' : 'Ligar a uma pessoa do cadastro'}</b><span>${ligada ? 'Pessoa do cadastro · titular das contas' : 'Titular de contas e cartões'}</span></div>
        ${ligada ? '<button type="button" class="rz-more" data-acao="pessoa-cad-menu" aria-label="Ações da pessoa do cadastro"><i data-lucide="ellipsis-vertical"></i></button>' : '<i data-lucide="chevron-right" class="rz-chev"></i>'}</div></div>`;
    refrescarIcones();
    if (ligada) {
        api.dbAuth.from('pessoas').select('nome').eq('id', a.entidade_origem_id).maybeSingle().then(({ data }) => {
            const el = document.getElementById('fa-pessoa-cad-nome'); if (el) el.textContent = data?.nome || 'Pessoa ligada';
        });
    }
    alvo.querySelector('[data-acao="pessoa-cad"]')?.addEventListener('click', () => acoesPessoaDoAtivo(a));
    alvo.querySelector('[data-acao="pessoa-cad-menu"]')?.addEventListener('click', (ev) => { ev.stopPropagation(); acoesPessoaDoAtivo(a); });
}
async function acoesPessoaDoAtivo(a) {
    const ligada = a.entidade_origem_tipo === 'pessoa' && a.entidade_origem_id;
    if (!ligada) { await ligarPessoaAoAtivo(a); return; }
    const v = await escolher({ titulo: 'Pessoa do cadastro', sub: 'Titular das contas do ativo', opcoes: [
        { valor: 'trocar', titulo: 'Trocar a pessoa', sub: 'Outra pessoa de Pessoas', icone: 'repeat' },
        { valor: 'desligar', titulo: 'Desligar', sub: 'As contas mantêm o titular', icone: 'unlink' },
    ] });
    if (v === 'trocar') await ligarPessoaAoAtivo(a);
    else if (v === 'desligar') {
        if (!await perguntar({ titulo: 'Desligar a pessoa deste ativo?', impacto: 'Contas e cartões novos não poderão nascer aqui até ligar de novo. Os já criados não mudam.', rotuloConfirmar: 'Desligar' })) return;
        await gravarPessoaDoAtivo(a, null);
    }
}
/** Escolhe uma pessoa de Pessoas (sem outro ativo ligado) e liga ao ativo vida. Devolve o id da pessoa ou null. */
export async function ligarPessoaAoAtivo(a) {
    if (!a?.id) return null;
    const db = api.dbAuth, cli = estado.clienteId;
    const [rP, rA] = await Promise.all([
        db.from('pessoas').select('id, nome, user_id').eq('cliente_id', cli).order('nome'),
        db.from('cofre_ativos').select('id, entidade_origem_id').eq('cliente_id', cli).eq('entidade_origem_tipo', 'pessoa').neq('status', 'arquivado'),
    ]);
    if (rP.error) { mostrarToast('Erro: ' + rP.error.message, 'erro'); return null; }
    const ocupadas = new Set((rA.data || []).filter(x => x.id !== a.id).map(x => x.entidade_origem_id));
    const livres = (rP.data || []).filter(p => !ocupadas.has(p.id));
    if (!livres.length) {
        mostrarToast('Cadastre a pessoa em Pessoas antes.', 'aviso');
        return null;
    }
    const id = await escolher({ titulo: `Ligar ${a.nome_exibicao || 'este ativo'} a`, sub: 'Não dá acesso ao app', opcoes:
        livres.map(p => ({ valor: p.id, titulo: p.nome, sub: p.user_id ? 'Tem acesso ao app' : 'Sem acesso ao app', icone: 'user' })) });
    if (!id) return null;
    return await gravarPessoaDoAtivo(a, id) ? id : null;
}
async function gravarPessoaDoAtivo(a, pessoaId) {
    const { data, error } = await api.dbAuth.rpc('fn_ativo_pessoa_vincular', { p_cliente_id: estado.clienteId, p_ativo_id: a.id, p_titular_pessoa_id: pessoaId });
    if (error || !data?.ok) { mostrarToast(error?.message || data?.mensagem || 'Não foi possível ligar.', 'erro'); return false; }
    a.entidade_origem_tipo = pessoaId ? 'pessoa' : null;
    a.entidade_origem_id = pessoaId;
    if (estado.ativoEmFoco?.id === a.id) { estado.ativoEmFoco.entidade_origem_tipo = a.entidade_origem_tipo; estado.ativoEmFoco.entidade_origem_id = pessoaId; }
    mostrarToast(pessoaId ? 'Pessoa ligada ao ativo.' : 'Pessoa desligada do ativo.');
    desenharPessoaDoAtivo(a);
    emitirEscrita('ativo', { id: a.id, acao: pessoaId ? 'pessoa_ligar' : 'pessoa_desligar' });
    return true;
}

function documentosDoAtivo(ativoId) {
    return estado.documentos.filter(d => (d.cofre_documento_vinculos || []).some(v => v.entidade_tipo === 'ativo' && v.entidade_id === ativoId));
}

export async function excluirAtivoAtual() {
    const a = estado.ativoEmFoco;
    if (!a) return;
    if (!await perguntar({ titulo: `Excluir ${a.nome_exibicao}?`, impacto: 'A exclusão fica registrada e não dá para desfazer pelo app.', destrutivo: true, rotuloConfirmar: 'Excluir ativo' })) return;
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
    if (!await perguntar({ titulo: `Marcar ${a.nome_exibicao} como vendido?`, impacto: 'Os itens de controle vinculados (seguro, manutenção, tributo) param de gerar alerta e o ativo sai da lista principal. Histórico e documentos ficam guardados.', rotuloConfirmar: 'Marcar como vendido' })) return;
    try {
        await api.marcarAtivoVendido(a.id);
        await api.registrarLogAcessos(estado.clienteId, estado.pessoa.id, 'cofre.editar', { ativoId: a.id, nome: a.nome_exibicao, acao: 'marcar_vendido' });
        mostrarToast('Ativo vendido. Alertas desligados.');
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
    // sub-ativo (talhão, área, unidade) herda empreendimento e valor do principal: a edição esconde o bloco, como o cadastro
    // (contexto do catálogo). Sem o bloco, a leitura grava null nos dois — que é o certo para sub-ativo (dem 9404081c, L4-4)
    const ctxEdicao = a.ativo_principal_id ? 'subativo' : 'ativo';
    const blocosEdicao = blocosDoFormulario(a.tipo_ativo, a.tipo_detalhe_id, ctxEdicao);
    const mostraEmpVal = !blocosEdicao || blocosEdicao.has('empreendimento') || blocosEdicao.has('valor_referencia');
    const blocoEmpreendimentoValor = !mostraEmpVal ? '' : `<div class="rz-campos-imovel grid grid-cols-1 sm:grid-cols-2 gap-3">${renderizarBlocoEmpreendimentoValor('fa-editar-empval-', a, _empreendimentosCache || [], { comFinalidade: !ehCategoriaImovel(a.tipo_ativo) })}</div>`;
    // v1.117.0 (L4-B) — o catálogo decide os blocos também na edição (imóvel rural sem rua e número, sem "dados do imóvel")
    const edTemEnd = !blocosEdicao || blocosEdicao.has('endereco');
    const edTemImovel = !blocosEdicao || blocosEdicao.has('dados_imovel');
    // ativo rural cadastrado antes do L4-B: a sede e a área vêm das colunas até a pessoa salvar
    const de0 = a.dados_especificos || {};
    const valoresEdicao = (!edTemEnd && ehCategoriaImovel(a.tipo_ativo))
        ? { ...de0, municipio_sede: de0.municipio_sede || a.endereco_cidade || '', uf_sede: de0.uf_sede || a.uf || '', cep: de0.cep || a.cep || '',
            area: de0.area || (a.area_m2 ? `${Math.round(a.area_m2 / 100) / 100} ha` : '') }
        : de0;
    const blocoEndereco = ehCategoriaImovel(a.tipo_ativo)
        ? `<div class="rz-campos-endereco${edTemEnd ? '' : ' hidden'}">${renderizarBlocoEndereco('fa-editar-endereco', a, { mostrarBotaoCopiar: false })}</div>`
        : '';
    const blocoImovel = ehCategoriaImovel(a.tipo_ativo)
        ? `<div class="rz-campos-imovel${edTemImovel ? '' : ' hidden'} grid grid-cols-1 sm:grid-cols-2 gap-2">${renderizarBlocoImovel('fa-editar-imovel-', a)}</div>`
        : '';
    // E5 — tipo específico (dentro da categoria, que continua somente-
    // leitura — ver nota abaixo) é editável: corrige um ativo classificado
    // errado, ou completa um que nunca teve tipo_detalhe_id (criado antes
    // da E5). Categoria sem tipo cadastrado no catálogo: tiposDetalhe fica
    // [], o bloco não aparece — comportamento de antes.
    // E15.3 (demanda abd1a73f, 18/09/2026) — destravado pra VINCULADO
    // também: o receio de E15.2 (mudar só o tipo_detalhe_id descasaria de
    // `imoveis.tipo_id`, que "outras partes do sistema legado" liam) não
    // se aplica mais — Onda 12 (16/09/2026, comentário logo abaixo em
    // salvarEdicaoAtivo) já tinha parado de escrever em `imoveis` daqui, e
    // levantamento confirmou 0 função/tela ativa lendo imoveis.tipo_id
    // hoje (fica só como histórico congelado). vinculado e avulso
    // convergem: mesmo <select>, mesmo salvarEdicaoAtivo() de sempre.
    const tiposDetalhe = listarTiposPorCategoria(a.tipo_ativo);
    const blocoTipoDetalhe = tiposDetalhe.length
        ? `<div class="rz-f"><label>Tipo específico</label><select id="fa-editar-tipo-detalhe" data-action-change="ativo-tipo-detalhe-editar-mudou">${tiposDetalhe.map(t => `<option value="${t.id}"${t.id === a.tipo_detalhe_id ? ' selected' : ''}>${escapeHtml(t.nome)}</option>`).join('')}</select></div>`
        : '';
    if (typeof window.abrirSheetForm === 'function') {
        const campos =
            // categoria crua ("agro") não é texto de tela: mostra o ramo pelo nome do catálogo (dem 9404081c, item 16d)
            `<div class="rz-f"><label>Ramo</label><input type="text" value="${escapeHtml(typeof window.rzNomeRamo === 'function' && a.ramo ? window.rzNomeRamo(a.ramo) : rotuloTipoAtivo(a.tipo_ativo))}" disabled></div>` +
            blocoTipoDetalhe + blocoEmpreendimentoValor +
            `<div class="rz-f"><label>Nome de exibição <i>*</i></label><input type="text" id="fa-editar-nome" value="${escapeHtml(a.nome_exibicao)}"></div>` +
            `<div class="rz-campos-estruturados" id="fa-editar-campos-estruturados">${renderizarCamposEstruturados(a.tipo_ativo, valoresEdicao, 'fa-editar-campo-', a.tipo_detalhe_id, ctxEdicao)}</div>` +
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
    // esse nível pra todo mundo (vinculado incluso desde a E15.3).
    document.getElementById('fa-editar-campos').innerHTML =
        `<div class="sm:col-span-2"><label class="text-xs font-semibold block mb-1" style="color:var(--sage)">Tipo</label><input type="text" value="${escapeHtml(rotuloTipoAtivo(a.tipo_ativo))}" disabled class="w-full border-2 border-slate-200 rounded-xl p-2 text-sm bg-slate-50 text-slate-500"></div>` +
        (tiposDetalhe.length ? `<div class="sm:col-span-2"><label class="text-xs font-semibold block mb-1">Tipo específico</label><select id="fa-editar-tipo-detalhe" data-action-change="ativo-tipo-detalhe-editar-mudou" class="w-full border-2 border-slate-300 rounded-xl p-2 text-sm">${tiposDetalhe.map(t => `<option value="${t.id}"${t.id === a.tipo_detalhe_id ? ' selected' : ''}>${escapeHtml(t.nome)}</option>`).join('')}</select></div>` : '') +
        blocoEmpreendimentoValor +
        `<div class="sm:col-span-2"><label class="text-xs font-semibold block mb-1">Nome de exibição</label><input type="text" id="fa-editar-nome" value="${escapeHtml(a.nome_exibicao)}" class="w-full border-2 border-slate-300 rounded-xl p-2 text-sm"></div>` +
        `<div id="fa-editar-campos-estruturados" class="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">${renderizarCamposEstruturados(a.tipo_ativo, valoresEdicao, 'fa-editar-campo-', a.tipo_detalhe_id, ctxEdicao)}</div>` +
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
    if (wrap) wrap.innerHTML = renderizarCamposEstruturados(a.tipo_ativo, a.dados_especificos || {}, 'fa-editar-campo-', tipoDetalheId, a.ativo_principal_id ? 'subativo' : 'ativo');
    // v1.118.0 — trocar o tipo também troca os blocos (Terreno urbano → Fazenda esconde rua e número, e o contrário)
    const bl = blocosDoFormulario(a.tipo_ativo, tipoDetalheId, a.ativo_principal_id ? 'subativo' : 'ativo');
    document.querySelector('.rz-campos-endereco')?.classList.toggle('hidden', !!bl && !bl.has('endereco'));
    document.querySelector('.rz-campos-imovel')?.classList.toggle('hidden', !!bl && !bl.has('dados_imovel'));
}

export async function salvarEdicaoAtivo() {
    const a = estado.ativoEmFoco;
    const nome = document.getElementById('fa-editar-nome').value.trim();
    if (!nome) { mostrarToast('Nome não pode ficar vazio.', 'erro'); return false; }
    const selDetalhe = document.getElementById('fa-editar-tipo-detalhe');
    // Sem seletor no DOM (categoria sem tipo específico cadastrado no
    // catálogo — ver alternarEditarAtivo, blocoTipoDetalhe fica vazio):
    // mantém o tipo_detalhe_id que o ativo já tinha, não apaga.
    const tipoDetalheId = selDetalhe ? (selDetalhe.value || null) : a.tipo_detalhe_id;
    const dados = lerCamposEstruturados(a.tipo_ativo, 'fa-editar-campo-', tipoDetalheId, a.ativo_principal_id ? 'subativo' : 'ativo');
    const errosEd = validarCamposAtivo(a.tipo_ativo, nome, dados, tipoDetalheId, a.ativo_principal_id ? 'subativo' : 'ativo').filter(e => !/obrigatório/.test(e));
    if (errosEd.length) { mostrarToast(errosEd[0], 'erro'); return false; } // v1.117.0 — coordenadas e tamanho também na edição
    const patch = { nome_exibicao: nome, tipo_detalhe_id: tipoDetalheId, dados_especificos: dados };
    // Onda 12 (16/09/2026) — empreendimento/valor de referência são
    // universais (qualquer tipo de ativo); entram no mesmo `patch` pra
    // TODOS os casos agora — cofre_ativos é o único destino de escrita.
    const empValLido = await lerBlocoEmpreendimentoValor('fa-editar-empval-', estado.clienteId);
    // v1.32.0 (E6.2) — só lê os blocos de endereço/imóvel se foram
    // renderizados (categoria imóvel); nos demais tipos os campos não
    // existem no DOM.
    // Onda 12 (16/09/2026, pedido explícito: "único caminho de escrita,
    // na tabela de ativos... imoveis totalmente isolada") — vinculado
    // PAROU de escrever em `imoveis` (api.atualizarImovel retirada
    // daqui). trg_imovel_atualiza_ativo (banco) só espelhava imoveis→
    // cofre_ativos; sem escrita em imoveis, ele nunca mais dispara —
    // fica dormente, não precisa ser removido. Aluguel esperado é
    // SEMPRE dados_especificos.
    // v1.117.0 (L4-B) — só lê o que a edição mostrou: tipo rural grava a sede nas colunas de endereço e a área em area_m2
    const blocosSalvar = blocosDoFormulario(a.tipo_ativo, tipoDetalheId, a.ativo_principal_id ? 'subativo' : 'ativo');
    if (ehCategoriaImovel(a.tipo_ativo) && blocosSalvar && !blocosSalvar.has('endereco') && !blocosSalvar.has('dados_imovel')) {
        const area = areaM2DoTamanho(dados.area);
        Object.assign(patch, enderecoDaSedeRural(dados) || {}, empValLido, area !== null ? { area_m2: area } : {});
    } else if (ehCategoriaImovel(a.tipo_ativo)) {
        const enderecoLido = lerBlocoEndereco('fa-editar-endereco');
        const { camposImovel, aluguelDesejado, destinacao } = lerBlocoImovel('fa-editar-imovel-');
        if (aluguelDesejado !== null) dados.aluguel_desejado = aluguelDesejado;
        // Onda 12 (16/09/2026, pedido explícito: "único caminho de
        // escrita, na tabela de ativos") — vinculado e avulso convergem:
        // os dois gravam em cofre_ativos direto agora, no mesmo `patch`
        // que desce pra api.atualizarAtivo() logo abaixo.
        // api.atualizarImovel() (escrevia em `imoveis`, retirada) não é
        // mais chamada daqui — imóvel vinculado ou não, edição de ativo
        // só toca cofre_ativos. `imoveis` fica intocada, isolada.
        Object.assign(patch, enderecoLido, empValLido, {
            area_m2: camposImovel.area_m2,
            finalidade_uso: camposImovel.finalidade_uso,
            situacao_uso: camposImovel.situacao_uso,
            observacao: camposImovel.observacao,
            cib: camposImovel.cib,
        });
        // v1.63.0 — destinação: escolha explícita vira 'manual'; "pelo tipo"
        // manda null/null e o banco deriva de novo (trg_cofre_ativos_destinacao).
        if (destinacao !== undefined) {
            patch.destinacao = destinacao;
            patch.destinacao_origem = destinacao ? 'manual' : null;
        }
    } else {
        // não-imóvel: só empreendimento/valor, direto em cofre_ativos
        Object.assign(patch, empValLido);
    }
    try {
        await api.atualizarAtivo(a.id, patch);
        // v1.61.0 — BUG REAL achado pelo Nicola testando o wrapper: editar um
        // ativo, salvar, reabrir a MESMA edição sem fazer mais nada e o form
        // mostrava o valor ANTIGO. Causa: `a` aqui é a MESMA referência que
        // vive dentro de `estado.ativos` (abrirFichaAtivo monta `a` via
        // `estado.ativos.find(...)`, ver linha ~1655, e só cai pro fetch de
        // rede se não achar no array local) — só o banco era atualizado, o
        // objeto local nunca era. `cofre:recarregar-ativos` (linha abaixo) é
        // fire-and-forget: o listener recarrega `estado.ativos` de forma
        // assíncrona, mas o `await abrirFichaAtivo(a.id)` logo depois roda
        // ANTES desse recarregamento terminar — então ele lia o array ainda
        // velho. A ficha em si não mostrava o sintoma porque os painéis
        // (montarDadosAtivo etc.) buscam alguns dados direto do banco; o
        // FORM de edição (alternarEditarAtivo) não — ele confia direto nos
        // campos de `a`. Fix: aplica o mesmo `patch` já confirmado no banco
        // também no objeto local, na hora — não depende mais de esperar o
        // recarregamento assíncrono pra ficar consistente.
        Object.assign(a, patch);
        // v1.63.0 — "pelo tipo": o banco preencheu a destinação; traz o valor real.
        if ('destinacao' in patch && patch.destinacao === null) {
            const fresco = await api.buscarAtivoPorId(a.id).catch(() => null);
            if (fresco) { a.destinacao = fresco.destinacao; a.destinacao_origem = fresco.destinacao_origem; }
        }
        await api.registrarLogAcessos(estado.clienteId, estado.pessoa.id, 'cofre.editar', { ativoId: a.id, acao: 'editar_ativo' });
        mostrarToast('Ativo atualizado');
        window.dispatchEvent(new CustomEvent('cofre:recarregar-ativos'));
        // v1.59.0 (Fase 1 do wrapper de escrita, piloto) — index.html escuta
        // isto pra saber que precisa refazer `imoveis` (array legado, só
        // atualizado no boot) e redesenhar a Visão Geral se ela estiver
        // aberta agora — ver aoEscrever('ativo', ...) em index.html.
        emitirEscrita('ativo', { id: a.id, acao: 'editar' });
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
// v1.41.0 (16/09/2026) — o único chamador (contratos.js, "Abrir o
// imóvel" na ficha do contrato) passa con.imovelId, que desde o único
// caminho de escrita da Onda 12 É o id do próprio ativo (cofre_ativos.id
// — carregarContratosSupabase lê row.ativo_id → imovelId), não mais
// entidade_origem_id. Busca direta por x.id resolve os 2 mundos (legado
// e nativo) com a mesma linha — nem precisa mais checar entidade_origem_tipo.
window.rzAbrirAtivoDoImovel = function (imovelId) {
    const a = (estado.ativos || []).find(x => x.id === imovelId);
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
    if (typeof window.editarImovel !== 'function') { mostrarToast('Abra pelo app principal.', 'erro'); return; }
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
            <div class="rz-tx"><b>${escapeHtml(d.nome_exibicao)}</b><span>${escapeHtml((estado.categorias || []).find(c => c.id === d.categoria_id)?.nome || 'Documento')}${d.origem === 'bot_whatsapp' ? ' · pela Raiz IA' : ''}${d.criado_em ? ' · ' + formatarDataBR(String(d.criado_em).slice(0, 10)) : ''}</span></div>
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
            ? 'Envie escritura, IPTU ou apólice e a Raiz IA lê os dados e cria os vencimentos. Toque no ⋮ › Adicionar documento com IA.'
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
    // v1.41.0 (16/09/2026) — window.imoveis (array ponte do App,
    // carregarImoveisSupabase em cofre-api.js) tem .id = id do próprio
    // ativo desde o único caminho de escrita da Onda 12, não mais
    // entidade_origem_id — o lookup antigo nunca mais batia, nem pra
    // imóvel legado. entidade_origem_tipo continua o gate certo aqui
    // (só imóvel legado pode ter foto base64 velha; nativo nunca teve).
    if (a?.entidade_origem_tipo !== 'imovel' || !Array.isArray(window.imoveis)) return [];
    const imo = window.imoveis.find(i => i.id === a.id);
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
            erroInline(statusEl, '❌ ' + err.message);
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
    // F0.2b — a remoção só arquiva a foto: sem pergunta, com "Desfazer".
    try {
        await api.excluirFotoAtivo(fotoId);
        const ativoDaFoto = estado.ativoEmFoco;
        await montarFotosAtivo(ativoDaFoto);
        avisarComDesfazer('Foto removida.', async () => {
            try { await api.restaurarFotoAtivo(fotoId); await montarFotosAtivo(ativoDaFoto); mostrarToast('Foto de volta.'); }
            catch (e) { mostrarToast('Não consegui desfazer: ' + e.message, 'erro'); }
        });
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
        mostrarToast(valor ? 'A foto aparece nos links compartilhados.' : 'A foto saiu dos links compartilhados.');
    } catch (err) { mostrarToast('Erro: ' + err.message, 'erro'); }
}

// Histórico do Ativo removido (revisão DS, 25/08/2026) — pedido explícito:
// não deve ter opção "Histórico" no Mais ações do box do Ativo.
// api.listarHistoricoAtivo() (cofre-api.js) foi mantida — infraestrutura
// de log genérica, pode servir outro consumidor no futuro.


// v1.74.0 (UX F1.4a, demanda c71f617c) — esqueleto no lugar de "Carregando…" (UXR, REGRAS §8).
// window.rzSkeleton vive no index.html; no cofre.html avulso cai no texto de antes.
function rzSk(tipo, n) {
    return (typeof window !== 'undefined' && typeof window.rzSkeleton === 'function')
        ? window.rzSkeleton(tipo, n)
        : '<p class="rz-desc">Carregando…</p>';
}

// v1.75.0 (UX F2.2) — ativos com alerta: Motor de Alertas (index.html, window.rzAtivosComAlerta)
// + ocorrências de item de controle em aberto. Set de ids de cofre_ativos.
function ativosComAlerta(ocorrenciasPorAtivo) {
    const ids = new Set();
    try { if (typeof window !== 'undefined' && typeof window.rzAtivosComAlerta === 'function') window.rzAtivosComAlerta().forEach(id => ids.add(id)); } catch (_) { /* sem Motor (cofre.html) */ }
    if (ocorrenciasPorAtivo) Object.keys(ocorrenciasPorAtivo).forEach(id => ids.add(id));
    else (estado.ocorrenciasAbertas || []).forEach(oc => { const id = oc.cofre_itens_controle?.ativo_id; if (id) ids.add(id); });
    return ids;
}
