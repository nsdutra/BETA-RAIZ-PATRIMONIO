// ============================================================================
// cofre-controles.js — Raiz Patrimônio · Cofre de Documentos
// Versão: 1.65.0 · 20/10/2026
//
// v1.65.0 (20/10/2026, sessão 20261020-2340-controles-grupos, demanda 9404081c; Nicola 23:28 e 23:37, de acordo com ajustes;
//   PROTOTIPO_CONTROLES_GRUPOS_RAIZ v1.0.0) — chip Controles da ficha: (1) os itens fora de programa ficam em grupos pela
//   categoria do catálogo (controle_tipos, na ordem dele), depois dos programas; (2) grupo e programa no desenho do item
//   agrupado da lista de Ativos — ícone com a quantidade, a etiqueta do item mais urgente, a seta que abre e fecha e a linha
//   que liga os itens; sem a frase "próximo"; (3) com mais de 8 itens, o grupo sem nada nos próximos 30 dias começa fechado;
//   (4) ícone do item pelo subtipo (cofre_controle_subtipos.icone) ou pela categoria (controle_tipos.icone), e não troca pelo
//   relógio quando vence (a cor da placa e a etiqueta avisam); (5) título curto na ficha: sem o nome do ativo no fim e sem o
//   subtipo no começo; a linha de baixo traz a data (Válido até…, a data do evento). Com uma categoria só e sem programa, a
//   lista fica sem grupo.
// Versão anterior: 1.64.0 · 19/10/2026
//
// v1.64.0 (19/10/2026, sessão 20261019-2217-carga-silva-arrend, demanda 9404081c item 56; pedido do Nicola 22:17, print do Lili Dog
// › "Saúde do pet · 0 itens") — o ⋮ do programa ganha "Excluir programa" (fn_programa_excluir): sem vínculo, sai com os itens
// que ele criou, as safras/etapas e as ocorrências em aberto; o item que já existia no ativo antes do aceite só sai do programa.
// Com vínculo (lançamento, ocorrência tratada, documento, rateio), o banco recusa com a lista e a dica de usar Concluir.
// Depois o programa volta a aparecer como sugerido.
// Versão anterior: 1.63.1 · 19/10/2026
//
// v1.63.1 (19/10/2026, sessão 20261019-2141-carga-silva-safra2, demanda 9404081c item 54; print do Nicola 19/10 21:38) — na tela
// da safra: os itens (Agora, Da safra inteira, Do programa) voltam a ocupar a largura toda, alinhados à esquerda (a linha
// solta fora de .rz-list ficava estreita e centrada); o ⋮ da fase e "Corrigir <safra>" abrem por cima da safra (empilhar),
// então escolher Corrigir datas, Voltar, Pular ou Editar não fecha a tela da safra, e ela volta atualizada ao salvar.
// Versão anterior: 1.63.0 · 19/10/2026
//
// v1.63.0 (19/10/2026, sessão 20261019-1931-carga-silva-correcoes, demanda 9404081c item 53, de acordo do Nicola 19:31) —
// CORRIGIR o que foi cadastrado errado na execução do programa: botão "Corrigir" na safra (ou ciclo) com Editar a safra
// (início, fim previsto, nome e, se fechada, a data do fechamento — fn_ciclo_editar) e Excluir a safra (fn_ciclo_excluir:
// antes mostra os vínculos de fn_ciclo_vinculos — lançamentos, ocorrências tratadas, documentos, rateios — e diz o que
// desfazer; sem vínculo, apaga com as fases e os itens). Na fase concluída ou em andamento, "Corrigir datas"
// (fn_fase_datas), também com a safra fechada. "Abrir a safra" ganha a data de referência (p_inicio): uma safra já em
// curso abre no ano e na fase certos. "Excluir item de vez" recusa item com lançamento no Financeiro.
// Versão anterior: 1.62.0 · 16/10/2026
//
// v1.62.0 (16/10/2026, sessão 20261016-0020-usos-fatia7, demanda 3022603b; FICHA_FATIA7_MEMBROS_RAIZ v1.2.0, de acordo do Nicola
// 15/10 23:17 e 16/10 00:05, D7-4, D7-11, D7-12) — CICLO DO ANIMAL na tela da execução: o programa por animal (Reprodução
// bovina e suína) mostra no lote "N animais em ciclo" e a lista; o ciclo do animal mostra as fases com a data prevista
// (muda sozinha ou você confirma), "Registrar" a próxima (cobertura, diagnóstico positivo, parto com a cria cadastrada
// ligada à mãe, ou outra fase adiante), "Diagnóstico negativo" (volta para Apta) e Fechar/Abrir o próximo ciclo. Depois de
// mudar, o card do rebanho recarrega (cofre-membros.js).
// --------------------------------------------------------------------------
// Versões anteriores (v1.61.0 … v1.61.0): CHANGELOG_MODULOS.md, na raiz do repositório — o
// gerar_versoes.py rola pra lá automaticamente tudo além das 5 versões
// mais recentes deste cabeçalho (VER-06).
export const VERSAO = '1.65.0'; // v-check: lido por ⚙️ › Conta › Versões — manter igual ao header
import { estado } from './cofre-estado.js';
import * as api from './cofre-api.js';
import { mostrarToast, refrescarIcones, abrirModal, fecharModal, modalGenerico, perguntar, escolher, avisarComDesfazer } from './cofre-ui.js';
import { mudarTela } from './cofre-navegacao.js';
import { abrirUploadContextual } from './cofre-documentos.js';
import {
    escapeHtml, formatarDataBR, diasAte, chipVencimento,
    rotuloTipoControle, rotuloStatusOcorrencia, rotuloFrequencia, rotuloTipoAtivo, iconeAtivo,
    numeroWhatsAppComDDI,
    inicializarCatalogoTiposAtivo, listarTiposPorCategoria,
    definirCatalogoTiposControle,
} from './cofre-validacoes.js';
// v1.31.0 (demanda be42b19f, "componente único de Parte") — Ficha e
// formulário de uma Parte passam a montar seus campos com o MESMO
// componente que Configurações › Partes usa (comum-partes.js, novo) +
// o bloco de endereço estruturado (comum-endereco.js, já existia — seu
// próprio header já previa "partes" como consumidor futuro).
import { renderizarBlocoDadosParte, lerBlocoDadosParte, renderizarResumoParte, formatarEnderecoParte } from './comum-partes.js';
import { renderizarBlocoEndereco, lerBlocoEndereco } from './comum-endereco.js';
// v1.32.0 (Fase 1 do wrapper de escrita, rollout Cofre de Documentos/
// Controles) — emitirEscrita() é o evento padrão pra "algo mudou que
// módulos DE FORA do Cofre podem precisar saber" (cofre:recarregar-eventos/
// -documentos/-partes continuam existindo do jeito que estão, só servem o
// Cofre por dentro — ver changelog do topo do arquivo). aoEscrever() usado
// pelo listener module-level, perto de 'cofre:recarregar-partes'.
import { emitirEscrita, aoEscrever } from './raiz-eventos.js';
import { montarGrupoVisao } from './grupo-visao.js'; // v1.52.0 — F13.10

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
// v1.49.0 (demanda a30da78b) — card "Controles da empresa" (⚙️ › Minha empresa):
// itens da empresa (sem ativo), filtro próprio e o vínculo do formulário "Novo item"
// ('empresa' quando aberto pelo card; null no fluxo de sempre, a partir do ativo).
let itensEmpresaAtual = [];
let filtroControlesEmpresa = 'ativos';
let novoItemVinculo = null;
let ocorrenciaEmAcao = null; // { ocorrenciaId, modo: 'tratar'|'reagendar'|'estornar' }
// E14.4 — contatosDoItemAtual/contatoEmEdicaoId removidas (Contatos
// unificado com Partes, ver comentário mais abaixo).

// ============================================================================
// v1.49.0 (demanda a30da78b, item 2 — plano aprovado pelo Nicola 07/10 20:14)
// CARD "CONTROLES DA EMPRESA" em ⚙️ › Minha empresa. Mesmo padrão do box
// "Documentos da empresa" (cofre-documentos.js): vive fora da árvore de telas
// do Cofre, chamado por dev_carregarDadosEmpresa() (index.html) a cada abertura
// da aba, listeners próprios (data-me-*) em vez de data-action — o handler
// global do Cofre abriria a ficha sem trocar de aba. Ficha e formulário são os
// MESMOS do item do ativo: abrir troca para a aba Ativos (onde moram) e o
// "< Voltar" / Fechar devolvem para Minha empresa.
// ============================================================================
function clienteIdDisponivel() {
    // eslint-disable-next-line no-undef
    return estado.clienteId || (typeof CLIENTE_ID_SUPABASE !== 'undefined' ? CLIENTE_ID_SUPABASE : null);
}
async function garantirCofrePronto() {
    if (typeof window.switchTab === 'function') window.switchTab('tab-ativos');
    if (!estado.clienteId) {
        await new Promise(resolve => {
            window.addEventListener('cofre:dados-carregados', resolve, { once: true });
            setTimeout(resolve, 8000);
        });
    }
}
export async function montarBoxControlesEmpresa() {
    const alvo = document.getElementById('me-controles');
    const btnAdd = document.getElementById('me-ctrl-add');
    if (!alvo) return;
    if (btnAdd && !btnAdd.dataset.ligado) { btnAdd.dataset.ligado = '1'; btnAdd.addEventListener('click', abrirNovoItemEmpresa); }
    const clienteId = clienteIdDisponivel();
    if (!clienteId) return;
    if (!itensEmpresaAtual.length) alvo.innerHTML = rzSk('linhas', 2);
    try { itensEmpresaAtual = await api.listarItensControleEmpresa(clienteId); }
    catch (err) {
        alvo.innerHTML = `<p class="text-xs" style="color:var(--danger)">Não consegui carregar os controles da empresa.</p>`;
        console.warn('[controles] itens da empresa:', err.message);
        return;
    }
    renderizarControlesEmpresa();
}
function renderizarControlesEmpresa() {
    const alvo = document.getElementById('me-controles');
    if (!alvo) return;
    if (!itensEmpresaAtual.length) {
        alvo.innerHTML = `<div class="rz-empty"><div class="rz-ic"><i data-lucide="building-2"></i></div><p>Nenhum controle da empresa ainda.</p></div>`;
        refrescarIcones();
        return;
    }
    const nEnc = itensEmpresaAtual.filter(i => i.ativo === false).length;
    if (!nEnc) filtroControlesEmpresa = 'ativos';
    const lista = itensEmpresaAtual.filter(i => filtroControlesEmpresa === 'encerrados' ? i.ativo === false : i.ativo !== false);
    const chip = (k, r, n) => `<button type="button" class="rz-chip ${filtroControlesEmpresa === k ? 'rz-on' : ''}" data-me-ctrl-filtro="${k}">${r} <span class="rz-n">${n}</span></button>`;
    const chips = nEnc ? `<div class="rz-chips" style="margin-bottom:6px">${chip('ativos', 'Ativos', itensEmpresaAtual.length - nEnc)}${chip('encerrados', 'Encerrados', nEnc)}</div>` : '';
    // mesma linha do box do ativo (itemResumoHtml), trocando o data-action pelo atributo próprio
    alvo.innerHTML = chips + (lista.length
        ? lista.map(i => itemResumoHtml(i)).join('').replace(/data-action="abrir-item-controle" data-id=/g, 'data-me-ctrl-item=')
        : `<div class="rz-empty"><p>Nenhum item ${filtroControlesEmpresa === 'encerrados' ? 'encerrado' : 'ativo'}.</p></div>`);
    alvo.querySelectorAll('[data-me-ctrl-filtro]').forEach(b => b.addEventListener('click', () => { filtroControlesEmpresa = b.dataset.meCtrlFiltro; renderizarControlesEmpresa(); }));
    alvo.querySelectorAll('[data-me-ctrl-item]').forEach(r => r.addEventListener('click', () => abrirItemControleDaEmpresa(r.dataset.meCtrlItem)));
    refrescarIcones();
}
export async function abrirItemControleDaEmpresa(itemId) {
    await garantirCofrePronto();
    await abrirFichaItemControle(itemId);
    itemControleOrigemTela = 'empresa-app';
}
export async function abrirNovoItemEmpresa() {
    await garantirCofrePronto();
    await abrirFormControle({ vinculo: 'empresa' });
}
window.addEventListener('cofre:recarregar-eventos', () => {
    if (document.getElementById('me-controles') && document.getElementById('tab-minha-empresa')?.classList.contains('active')) montarBoxControlesEmpresa();
});

// ============================================================================
// BOX "CONTROLES" na ficha do ativo — lista-resumo clicável
// ============================================================================
export async function montarControlesAtivo(a) {
    try {
        // v1.60.0 (fatia 4) — os programas do ativo vêm junto; falha neles não derruba a lista de itens
        const [itens] = await Promise.all([api.listarItensControleAtivo(a.id, true), carregarProgramasAtivo(a.id),
            carregarCatalogoTiposControle()]); // v1.20.0 — inclui encerrados (filtro local); o catálogo dá ícone e ordem dos grupos
        itensDoAtivoAtual = itens;
        ativoControlesAtual = a;
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
// v1.39.0 — complemento neutro do cabeçalho do card Controles: itens encerrados
// e itens com alertas desligados não contam no contador e ficavam sem sinal.
function comComplementoControles(baseHtml) {
    const enc = itensDoAtivoAtual.filter(i => i.ativo === false).length;
    const semAlerta = itensDoAtivoAtual.filter(i => i.ativo !== false && i.alerta_ativo === false).length;
    const partes = [];
    if (enc) partes.push(`${enc} encerrado${enc === 1 ? '' : 's'}`);
    if (semAlerta) partes.push(`${semAlerta} sem alerta`);
    if (!partes.length) return baseHtml;
    return `${baseHtml || ''} <span class="rz-sub">· ${partes.join(' · ')}</span>`; // v1.45.0 — sem style inline (REGRAS §17)
}
function atualizarEstadoChipControles() {
    const ativos = itensDoAtivoAtual.filter(i => i.ativo !== false); // v1.20.0 — encerrados não contam
    if (typeof window.faAtualizarContadorFicha === 'function') window.faAtualizarContadorFicha('controles', ativos.length, false);
    const cab = document.getElementById('fa-controles-status');
    if (!cab) return;
    if (motorDecidiuChipControles) return; // o Motor já falou; não sobrescreve
    cab.innerHTML = comComplementoControles(ativos.length ? statusHtml('neu', `${ativos.length} ite${ativos.length === 1 ? 'm' : 'ns'}`) : '');
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
        if (cab) cab.innerHTML = comComplementoControles(ativos.length ? statusHtml('ok', 'Em dia') : '');
        return;
    }

    // Urgente de verdade: vencido, vence hoje, ou sem data pra comparar
    // (pendência de documento). dias>0 sozinho NUNCA acende o chip.
    const urgentes = lista.filter(x => x.dias === null || x.dias <= 0);

    if (!urgentes.length) {
        chip?.classList.remove('rz-warn');
        if (cab) cab.innerHTML = comComplementoControles(statusHtml('ok', 'Em dia'));
        return;
    }

    chip?.classList.add('rz-warn');
    if (!cab) return;

    const vencidos = urgentes.filter(x => x.dias !== null && x.dias < 0).length;
    if (vencidos) { cab.innerHTML = comComplementoControles(statusHtml('bad', `${vencidos} vencido${vencidos === 1 ? '' : 's'}`)); return; }

    const venceHoje = urgentes.filter(x => x.dias === 0).length;
    if (venceHoje) { cab.innerHTML = comComplementoControles(statusHtml('warn', venceHoje === 1 ? 'Vence hoje' : `${venceHoje} vencem hoje`)); return; }

    // Sem data: o motivo é o tipo mais frequente entre os alertas do ativo.
    const contagem = {};
    urgentes.forEach(x => { contagem[x.tipo_alerta] = (contagem[x.tipo_alerta] || 0) + 1; });
    const tipo = Object.keys(contagem).sort((a, b) => contagem[b] - contagem[a])[0];
    const n = contagem[tipo];
    const rot = ROTULO_ALERTA_CHIP[tipo] || ['pendência', 'pendências'];
    cab.innerHTML = comComplementoControles(statusHtml('warn', `${n} ${n === 1 ? rot[0] : rot[1]}`));
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
    const sugeridos = filtroControles === 'ativos' ? programasSugeridosHtml() : ''; // v1.60.0 (fatia 4)
    if (!itensDoAtivoAtual.length) {
        // v1.13.0 — vazio no formato único (REGRAS §9): a ação fica no
        // rodapé do card ("Novo item"), por isso o vazio não repete botão.
        alvo.innerHTML = sugeridos + (sugeridos && !(programasAtual?.ativos || []).length ? ''
            : `<div class="rz-empty"><div class="rz-ic"><i data-lucide="shield"></i></div><p>Nenhum item de controle ainda.</p></div>`)
            + programasAgrupadosHtml([]);
        ligarAcoesProgramas(alvo);
        refrescarIcones();
        return;
    }
    alvo.innerHTML = chipsControlesHtml() + sugeridos + (programasAgrupadosHtml(lista)
        || `<div class="rz-empty"><p>Nenhum item ${filtroControles === 'encerrados' ? 'encerrado' : 'ativo'}.</p></div>`);
    ligarAcoesProgramas(alvo);
    refrescarIcones();
}

// ============================================================================
// v1.60.0 (usos fatia 4 — FICHA_FATIA4_PROGRAMAS_RAIZ v1.2.0, D4-1 a D4-7) — PROGRAMAS. O programa é um pacote de itens com
// nome ("Veículo": IPVA, licenciamento, seguro, revisão), oferecido pelo tipo do ativo ou pelo uso de hoje. Regra e catálogo
// no banco (CAN-02): fn_ativo_programas diz o que sugerir e o que está ativo; fn_programa_aceitar cria só os marcados (e
// liga o item que já existe); fn_programa_recusar é o "Agora não"; Pausar, Retomar e Concluir passam pela porta única.
// ============================================================================
let programasAtual = null;   // resposta de fn_ativo_programas: { pode_ver, pode_aceitar, sugeridos, ativos, outros, em_breve }
let programasAtivoId = null;
async function carregarProgramasAtivo(ativoId) {
    programasAtivoId = ativoId; programasAtual = null;
    try {
        const { data, error } = await api.dbAuth.rpc('fn_ativo_programas', { p_ativo_id: ativoId });
        if (error) throw error;
        if (programasAtivoId === ativoId) programasAtual = data || null;
    } catch (e) { console.warn('[cofre-controles] programas do ativo:', e?.message || e); }
}
function programaPorCodigo(codigo) {
    return [...(programasAtual?.sugeridos || []), ...(programasAtual?.outros || [])].find(p => p.codigo === codigo) || null;
}
function programasSugeridosHtml() {
    const lista = programasAtual?.pode_ver ? (programasAtual.sugeridos || []) : [];
    const pode = !!programasAtual?.pode_aceitar;
    return lista.map(p => {
        const marcados = (p.itens || []).filter(i => i.marcado || i.ja_existe).map(i => i.titulo);
        const nomes = (marcados.length ? marcados : (p.itens || []).map(i => i.titulo));
        const resumo = nomes.slice(0, 4).join(', ') + (nomes.length > 4 ? '…' : '');
        return `<div class="rz-prog-sug"><small>Programa sugerido</small><b>${escapeHtml(p.nome)}</b><span class="rz-desc">${escapeHtml(resumo)}</span>
            ${pode ? `<div class="rz-seq-btns"><button type="button" class="rz-btn rz-btn-1 rz-sm" data-prog-aceitar="${escapeHtml(p.codigo)}">Aceitar</button>
            <button type="button" class="rz-btn rz-btn-3 rz-sm" data-prog-recusar="${escapeHtml(p.codigo)}">Agora não</button></div>`
            : '<span class="rz-desc"><i data-lucide="lock"></i> Seu perfil só vê os programas.</span>'}</div>`;
    }).join('');
}
// Itens agrupados no desenho do item agrupado da lista de Ativos: programas primeiro (com o ⋮ e o botão da safra/obra) e
// depois os avulsos por categoria do catálogo. O grupo é só agrupamento: o toque abre e fecha; quem abre ficha é o item.
const gruposControlesAbertos = new Map(); // `${ativoId}:${chave}` → aberto (true/false) enquanto o app estiver aberto
const ORDEM_SEM = { bad: 0, warn: 1, run: 2, ok: 3, neu: 4 };
function piorStatusItens(its) {
    return its.map(statusDoItem).sort((x, y) => ORDEM_SEM[x[0]] - ORDEM_SEM[y[0]])[0] || ['ok', 'Em dia'];
}
function grupoControlesHtml(g, aberto, cor) {
    const pior = piorStatusItens(g.itens);
    const etiqueta = ['bad', 'warn', 'run'].includes(pior[0]) ? `<div class="rz-rt">${statusHtml(pior[0], pior[1])}</div>` : '';
    const mais = g.prog && (g.prog.acoes || []).length
        ? `<button type="button" class="rz-more" data-prog-mais="${g.prog.id}" aria-label="Ações do programa ${escapeHtml(g.nome)}"><i data-lucide="ellipsis-vertical"></i></button>` : '';
    const sub = g.prog && g.prog.situacao === 'pausado' ? '<span>Pausado · os itens não avisam</span>' : '';
    return `<div class="rz-row rz-link rz-ctl-grp" role="button" tabindex="0" aria-expanded="${aberto}" data-ctl-grp="${escapeHtml(g.k)}" style="--ramo-grupo:${cor}">
            <div class="rz-ic rz-ic-grupo"><i data-lucide="${escapeHtml(g.icone)}"></i><span class="rz-ic-n">${g.itens.length}</span></div>
            <div class="rz-tx"><b>${escapeHtml(g.nome)}</b>${sub}</div>${etiqueta}${mais}
            <span class="rz-ctl-tog"><i data-lucide="${aberto ? 'chevron-up' : 'chevron-down'}" class="rz-chev"></i></span></div>`
        + (g.exBtn || '')
        + `<div class="rz-subs rz-ctl-subs${aberto ? '' : ' hidden'}" data-ctl-subs="${escapeHtml(g.k)}" style="--ramo-grupo:${cor}">`
        + g.itens.map(i => itemResumoHtml(i).replace('<div class="rz-row rz-link"', '<div class="rz-row rz-link rz-sub-row"')).join('') + '</div>';
}
function programasAgrupadosHtml(lista) {
    const progs = filtroControles === 'ativos' && programasAtual?.pode_ver ? (programasAtual.ativos || []) : [];
    if (filtroControles !== 'ativos') return lista.map(i => itemResumoHtml(i)).join('');
    const grupos = [];
    const usados = new Set();
    progs.forEach(p => {
        const its = lista.filter(i => i.ativo_programa_id === p.id);
        its.forEach(i => usados.add(i.id));
        const ex = p.execucao; // obra (etapas), safra (ciclo e fases) ou animais em ciclo
        const exBtn = !ex ? '' : ex.por_membro ? (ex.em_ciclo ? `<button type="button" class="rz-prog-exec" data-prog-exec="${p.id}"><i data-lucide="heart-pulse"></i>Ver os animais em ciclo</button>` : '')
            : `<button type="button" class="rz-prog-exec" data-prog-exec="${p.id}"><i data-lucide="${ex.tem_etapas ? 'hard-hat' : 'sprout'}"></i>${ex.aberta ? 'Ver' : 'Abrir'} a ${ex.tem_etapas ? 'obra' : escapeHtml((ex.ciclo_rotulo || 'safra').toLowerCase())}</button>`;
        grupos.push({ k: 'p:' + p.id, nome: p.nome, itens: its, icone: 'package', prog: p, exBtn });
    });
    const resto = lista.filter(i => !usados.has(i.id));
    const cat = catalogoTiposControle || [];
    const ordemCat = (t) => { const c = cat.find(x => x.codigo === t); return c ? (c.ordem ?? 999) : 999; };
    const tipos = [...new Set(resto.map(i => i.tipo))].sort((x, y) => ordemCat(x) - ordemCat(y));
    // uma categoria só e nenhum programa: o grupo não ajuda, fica a lista
    if (!grupos.length && tipos.length <= 1) return resto.map(i => itemResumoHtml(i)).join('');
    tipos.forEach(t => {
        const c = cat.find(x => x.codigo === t);
        grupos.push({ k: 'c:' + t, nome: c?.nome || rotuloTipoControle(t), itens: resto.filter(i => i.tipo === t), icone: c?.icone || 'clipboard-check' });
    });
    const muitos = lista.length > 8;
    const aId = ativoControlesAtual?.id || '';
    const cor = `var(--ramo-cor-${String(ativoControlesAtual?.ramo || 'geral').replace(/[^a-z_]/g, '')}, var(--line))`;
    return grupos.map(g => {
        const chave = `${aId}:${g.k}`;
        if (!gruposControlesAbertos.has(chave)) {
            const tranquilo = !g.itens.some(i => { const d = diasProximaOcorrencia(i); return d !== null && d <= 30; });
            gruposControlesAbertos.set(chave, !(muitos && tranquilo));
        }
        return grupoControlesHtml(g, gruposControlesAbertos.get(chave), cor);
    }).join('');
}
function ligarAcoesProgramas(alvo) {
    alvo.querySelectorAll('[data-prog-aceitar]').forEach(b => b.addEventListener('click', () => abrirAceitarPrograma(b.dataset.progAceitar)));
    alvo.querySelectorAll('[data-prog-recusar]').forEach(b => b.addEventListener('click', () => recusarPrograma(b.dataset.progRecusar, b)));
    alvo.querySelectorAll('[data-prog-mais]').forEach(b => b.addEventListener('click', (ev) => { ev.stopPropagation(); abrirAcoesPrograma(b.dataset.progMais); }));
    alvo.querySelectorAll('[data-prog-exec]').forEach(b => b.addEventListener('click', (ev) => { ev.stopPropagation(); abrirExecucao(b.dataset.progExec); })); // v1.61.0
    // abre e fecha o grupo pelo toque no cabeçalho; o estado fica guardado enquanto o app está aberto
    alvo.querySelectorAll('[data-ctl-grp]').forEach(el => {
        const alternar = () => {
            const k = el.dataset.ctlGrp, lista = alvo.querySelector(`[data-ctl-subs="${CSS.escape(k)}"]`); if (!lista) return;
            const abrir = lista.classList.contains('hidden');
            lista.classList.toggle('hidden', !abrir);
            gruposControlesAbertos.set(`${ativoControlesAtual?.id || ''}:${k}`, abrir);
            el.setAttribute('aria-expanded', String(abrir));
            const tog = el.querySelector('.rz-ctl-tog'); if (tog) tog.innerHTML = `<i data-lucide="${abrir ? 'chevron-up' : 'chevron-down'}" class="rz-chev"></i>`;
            refrescarIcones();
        };
        el.addEventListener('click', alternar);
        el.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); alternar(); } });
    });
}
async function recarregarControlesDoAtivo() {
    const a = estado.ativoEmFoco; if (!a) return;
    await montarControlesAtivo(a);
}
// Folha "Aceitar <programa>": uma caixa por item; a data só quando o item pede (vence em, última vez em, 1ª data e valor).
function itemAceitarHtml(it, k, hoje) {
    const freq = it.recorrente ? rotuloFrequencia(it.frequencia_intervalo, it.frequencia_unidade) : 'Uma vez';
    const sub = it.ja_existe ? 'Já existe neste ativo · entra no programa' : freq;
    const campo = (rot, tipo, nome, extra = '') => `<div class="rz-f"><label for="pa-${k}-${nome}">${rot}</label><input type="${tipo}" id="pa-${k}-${nome}" data-campo="${nome}" ${extra}></div>`;
    let campos = '';
    if (!it.ja_existe) {
        if (it.data_pedida === 'vencimento') campos = campo('Vence em', 'date', 'data');
        else if (it.data_pedida === 'ultima_vez') campos = campo('Última vez em', 'date', 'data', `max="${hoje}"`);
        else if (it.data_pedida === 'pagamento') campos = campo(it.recorrente ? '1ª data' : 'Data', 'date', 'data', `value="${hoje}"`)
            + campo('Valor previsto', 'number', 'valor', 'step="0.01" min="0" inputmode="decimal" placeholder="Opcional"')
            + (it.recorrente ? campo('Até', 'date', 'ate') : '');
        else campos = campo(it.recorrente ? 'Próxima em' : 'Quando', 'date', 'data', `value="${hoje}"`);
    }
    return `<div class="rz-prog-it" data-k="${k}"><label class="rz-row rz-chk"><input type="checkbox" data-prog-item="${it.modelo_id}" ${it.marcado || it.ja_existe ? 'checked' : ''}>
        <div class="rz-tx"><b>${escapeHtml(it.titulo)}</b><span>${escapeHtml(sub)}</span></div></label>${campos ? `<div class="rz-prog-campos">${campos}</div>` : ''}</div>`;
}
function abrirAceitarPrograma(codigo) {
    const p = programaPorCodigo(codigo); const a = estado.ativoEmFoco;
    if (!p || !a) { mostrarToast('Programa não encontrado.', 'erro'); return; }
    if (typeof window.abrirSheetForm !== 'function') { mostrarToast('Abra pelo app principal.', 'erro'); return; }
    const hoje = hojeLocalISO();
    const itens = p.itens || [];
    window.abrirSheetForm({
        titulo: 'Aceitar ' + p.nome, sub: a.nome_exibicao, rotuloSalvar: 'Aceitar', empilhar: true,
        corpo: (el) => {
            el.innerHTML = `<p class="rz-desc">Marque o que quer acompanhar. Só os marcados viram itens.</p><div class="rz-list">${itens.map((it, k) => itemAceitarHtml(it, k, hoje)).join('')}</div>`;
            const btn = el.closest('.rz-sheet')?.querySelector('#rz-sheet-salvar');
            const contar = () => { const n = el.querySelectorAll('[data-prog-item]:checked').length; if (btn) btn.textContent = n ? `Aceitar ${n} ite${n === 1 ? 'm' : 'ns'}` : 'Aceitar'; };
            el.addEventListener('change', contar); contar();
        },
        aoSalvar: async (el) => {
            const marcados = [...el.querySelectorAll('.rz-prog-it')].filter(d => d.querySelector('[data-prog-item]')?.checked).map(d => {
                const it = itens[Number(d.dataset.k)];
                const v = (n) => (d.querySelector(`[data-campo="${n}"]`)?.value || '').trim();
                return { it, data: v('data'), valor: v('valor'), ate: v('ate') };
            });
            if (!marcados.length) { mostrarToast('Marque ao menos um item.', 'erro'); return false; }
            const falta = marcados.find(x => !x.it.ja_existe && (x.it.data_pedida === 'vencimento' || x.it.data_pedida === 'ultima_vez') && !x.data);
            if (falta) { mostrarToast(`${falta.it.data_pedida === 'vencimento' ? 'Diga quando vence' : 'Diga a última vez'}: ${falta.it.titulo}.`, 'erro'); return false; }
            const { data, error } = await api.dbAuth.rpc('fn_programa_aceitar', { p_ativo_id: a.id, p_programa: p.codigo, p_canal: 'app',
                p_itens: marcados.map(x => ({ modelo_id: x.it.modelo_id, data: x.data || null, valor: x.valor || null, ate: x.ate || null })) });
            if (error) { mostrarToast(error.message || 'Não foi possível aceitar.', 'erro'); return false; }
            mostrarToast(data?.mensagem || 'Programa aceito.', 'sucesso');
            emitirEscrita('controle', { ativo: a.id, acao: 'programa_aceitar', programa: p.codigo });
            window.dispatchEvent(new CustomEvent('cofre:recarregar-eventos'));
            await recarregarControlesDoAtivo();
            return true;
        },
    });
}
async function recusarPrograma(codigo, botao) {
    const a = estado.ativoEmFoco; if (!a) return;
    if (botao) botao.disabled = true;
    const { error } = await api.dbAuth.rpc('fn_programa_recusar', { p_ativo_id: a.id, p_programa: codigo, p_canal: 'app' });
    if (error) { if (botao) botao.disabled = false; mostrarToast(error.message || 'Não foi possível.', 'erro'); return; }
    mostrarToast('Sugestão guardada em Programas.', 'sucesso');
    await recarregarControlesDoAtivo();
}
function abrirAcoesPrograma(id) {
    const p = (programasAtual?.ativos || []).find(x => x.id === id); if (!p) return;
    const ICONE = { pausar: 'pause', retomar: 'play', concluir: 'check', reabrir: 'rotate-ccw' };
    const SUB = { pausar: 'Os itens param de avisar', retomar: 'Os itens voltam a avisar', concluir: 'Encerra o programa e os itens' };
    const ex = p.execucao; // v1.61.0 (fatia 6b)
    const exAcao = ex?.por_membro ? (ex.em_ciclo ? [{ icone: 'heart-pulse', codigo: 'ciclos.ver', titulo: 'Ver os animais em ciclo',
        sub: `${ex.em_ciclo} em ciclo`, aoTocar: () => abrirExecucao(p.id) }] : []) : ex ? [{ icone: ex.tem_etapas ? 'hard-hat' : 'sprout', codigo: 'ciclos.ver',
        titulo: `${ex.aberta ? 'Ver' : 'Abrir'} a ${ex.tem_etapas ? 'obra' : (ex.ciclo_rotulo || 'ciclo').toLowerCase()}`,
        sub: ex.aberta ? `${ex.fase_atual || ''} (${ex.posicao} de ${ex.total})` : (ex.tem_etapas ? 'Etapas e custo' : 'Fases e custo'), aoTocar: () => abrirExecucao(p.id) }] : [];
    sheetAcoes({ titulo: p.nome, sub: estado.ativoEmFoco?.nome_exibicao || '', acoes: [...exAcao, ...(p.acoes || []).map(m => ({
        icone: ICONE[m.acao] || 'circle-dot', titulo: m.rotulo + ' programa', codigo: m.codigo, sub: SUB[m.acao] || '', aoTocar: () => transicionarPrograma(p, m) })),
        { icone: 'trash-2', titulo: 'Excluir programa', codigo: 'programas.aceitar', sub: 'Só sem vínculo', tipo: 'bad', aoTocar: () => excluirPrograma(p) }] }); // v1.64.0
}
// v1.64.0 (item 56) — excluir o programa aceito por engano (ou sem uso). A regra (vínculos, item que já existia) fica no banco.
function excluirPrograma(p) {
    if (typeof window.abrirSheetForm !== 'function') { mostrarToast('Abra pelo app principal.', 'erro'); return; }
    const n = Number(p.qtd_itens ?? p.itens ?? 0) || 0;
    window.abrirSheetForm({
        titulo: 'Excluir ' + p.nome, sub: estado.ativoEmFoco?.nome_exibicao || '', rotuloSalvar: 'Excluir',
        corpo: `<p class="rz-desc">Sai o programa${n ? ' com os itens que ele criou' : ''}, as safras ou etapas e as ocorrências em aberto. Item que já existia no ativo continua, só fora do programa. Não dá para desfazer.</p>
            <p class="rz-desc">Com lançamento, ocorrência tratada, documento ou rateio, o app mostra o que desfazer. Para guardar o histórico, use Concluir.</p>
            <div class="rz-f"><label for="prog-x-motivo">Motivo</label><input type="text" id="prog-x-motivo" maxlength="200" placeholder="Ex.: aceitei por engano"></div>`,
        aoSalvar: async (el) => {
            const motivo = (el.querySelector('#prog-x-motivo')?.value || '').trim();
            if (!motivo) { mostrarToast('Diga o motivo.', 'erro'); return false; }
            const { data, error } = await api.dbAuth.rpc('fn_programa_excluir', { p_ativo_programa_id: p.id, p_motivo: motivo, p_canal: 'app' });
            if (error) { mostrarToast(error.message || 'Não foi possível excluir.', 'erro'); return false; }
            mostrarToast(data?.mensagem || 'Programa excluído.', 'sucesso');
            emitirEscrita('controle', { ativo: estado.ativoEmFoco?.id, acao: 'programa_excluir' });
            window.dispatchEvent(new CustomEvent('cofre:recarregar-eventos'));
            await recarregarControlesDoAtivo();
            return true;
        },
    });
}
async function transicionarPrograma(p, m) {
    const executar = async (motivo) => {
        const { error } = await api.dbAuth.rpc('fn_status_transicionar', { p_entidade: 'programa', p_id: p.id, p_acao: m.acao,
            p_dados: motivo ? { motivo } : {}, p_canal: 'app' });
        if (error) { mostrarToast(error.message || 'Não foi possível.', 'erro'); return false; }
        mostrarToast(m.acao === 'pausar' ? 'Programa pausado.' : m.acao === 'retomar' ? 'Programa retomado.' : m.acao === 'concluir' ? 'Programa concluído.' : 'Programa reaberto.', 'sucesso');
        emitirEscrita('controle', { ativo: estado.ativoEmFoco?.id, acao: 'programa_' + m.acao });
        window.dispatchEvent(new CustomEvent('cofre:recarregar-eventos'));
        await recarregarControlesDoAtivo();
        return true;
    };
    if (!m.exige_motivo) { await executar(null); return; }
    if (typeof window.abrirSheetForm !== 'function') { mostrarToast('Abra pelo app principal.', 'erro'); return; }
    window.abrirSheetForm({
        titulo: m.rotulo + ' ' + p.nome, sub: estado.ativoEmFoco?.nome_exibicao || '', rotuloSalvar: m.rotulo,
        corpo: `<div class="rz-f"><label for="prog-trans-motivo">Motivo</label><input type="text" id="prog-trans-motivo" maxlength="200" placeholder="Ex.: carro vendido, obra entregue"></div>
            <p class="rz-desc">Os itens do programa encerram junto.</p>`,
        aoSalvar: async () => {
            const motivo = (document.getElementById('prog-trans-motivo')?.value || '').trim();
            if (!motivo) { mostrarToast('Diga o motivo.', 'erro'); return false; }
            return executar(motivo);
        },
    });
}
// "Programas": todos os que servem ao ativo — ativos (abre o ⋮) e os outros (Aceitar), inclusive os de "Agora não".
export async function abrirTodosProgramas() {
    const a = estado.ativoEmFoco; if (!a) return;
    if (!programasAtual || programasAtivoId !== a.id) await carregarProgramasAtivo(a.id);
    const P = programasAtual;
    if (!P) { mostrarToast('Não consegui ler os programas.', 'erro'); return; }
    if (!P.pode_ver) { mostrarToast('Seu perfil não vê programas.', 'erro'); return; }
    const ROT = { disponivel: 'Disponível', recusado: 'Você disse "Agora não"', concluido: 'Concluído antes' };
    const acoes = [
        ...(P.ativos || []).map(p => ({ icone: p.situacao === 'pausado' ? 'pause' : 'package-check', titulo: p.nome,
            sub: p.situacao === 'pausado' ? 'Pausado' : 'Ativo', aoTocar: () => abrirAcoesPrograma(p.id) })),
        ...(P.outros || []).map(p => ({ icone: 'package-plus', titulo: p.nome, codigo: 'programas.aceitar',
            sub: (ROT[p.situacao] || 'Disponível') + ' · aceitar', aoTocar: () => abrirAceitarPrograma(p.codigo) })),
    ];
    if (!acoes.length) { mostrarToast('Nenhum programa para este ativo.', 'erro'); return; }
    sheetAcoes({ titulo: 'Programas', sub: a.nome_exibicao, acoes });
}
window.__rzAbrirProgramas = () => abrirTodosProgramas();

// ============================================================================
// v1.61.0 (usos fatia 6b — FICHA_FATIA6_CICLOS_E_FASES_RAIZ v1.2.0, D6-1 a D6-13) — EXECUÇÃO do programa: a obra (etapas que
// não se repetem) e a safra (ciclo que se repete, com fases). Regra no banco (CAN-02): fn_execucao_detalhe diz o que mostrar;
// fn_execucao_abrir, fn_fase_avancar, fn_fase_mover, fn_ciclo_fechar, fn_ciclo_reabrir e fn_execucao_concluir mudam; o custo
// vem dos lançamentos com destino na fase, no ciclo ou no programa (F6-7). "Fase" na safra, "etapa" na obra.
// ============================================================================
const SIT_FASE = { concluida: ['check', 'Concluída'], atual: ['circle-dot', 'Em andamento'], pendente: ['circle', 'A seguir'], pulada: ['minus', 'Pulada'] };
const execRot = (d) => d?.programa?.tem_etapas ? { fase: 'etapa', Fase: 'Etapa', exec: 'obra', Exec: 'Obra' }
    : { fase: 'fase', Fase: 'Fase', exec: (d?.programa?.ciclo_rotulo || 'Ciclo').toLowerCase(), Exec: d?.programa?.ciclo_rotulo || 'Ciclo' };
async function lerExecucao(apId, cicloId = null) {
    const { data, error } = await api.dbAuth.rpc('fn_execucao_detalhe', { p_ativo_programa_id: apId, p_ciclo_id: cicloId });
    if (error) { mostrarToast(error.message || 'Não consegui abrir.', 'erro'); return null; }
    if (!data?.pode_ver) { mostrarToast('Seu perfil não vê a execução.', 'erro'); return null; }
    return data;
}
async function aposMudarExecucao(apId, cicloId) {
    emitirEscrita('controle', { ativo: estado.ativoEmFoco?.id, acao: 'execucao' });
    window.dispatchEvent(new CustomEvent('cofre:recarregar-eventos'));
    await recarregarControlesDoAtivo();
    if (typeof window.__rzRecarregarMembros === 'function') window.__rzRecarregarMembros(); // v1.62.0 (fatia 7)
    if (apId) abrirExecucao(apId, cicloId);
}
function linhaFaseHtml(f, d) {
    const [ic, rot] = SIT_FASE[f.situacao] || ['circle', f.situacao];
    const quando = f.situacao === 'atual' && f.inicio ? 'desde ' + formatarDataBR(f.inicio)
        : f.situacao === 'concluida' && f.fim ? 'até ' + formatarDataBR(f.fim)
        : f.inicio_previsto ? 'prevista ' + formatarDataBR(f.inicio_previsto) : '';
    const custo = Number(f.realizado || 0) + Number(f.a_pagar || 0);
    const sub = [rot, quando, f.situacao === 'pulada' && f.motivo ? f.motivo : '', custo ? moedaBR(custo) + (f.custo_previsto ? ' de ' + moedaBR(f.custo_previsto) : '') : (f.custo_previsto ? 'previsto ' + moedaBR(f.custo_previsto) : '')]
        .filter(Boolean).join(' · ');
    // v1.63.0 — na fase em andamento e (safra fechada) na concluída, o ⋮ traz "Corrigir datas"
    const mexe = d.pode_gerir && (d.ciclo?.situacao !== 'fechado' || f.situacao === 'concluida');
    return `<div class="rz-exec-f rz-exec-${f.situacao}"><span class="rz-exec-ic"><i data-lucide="${ic}"></i></span>
        <div class="rz-tx"><b>${escapeHtml(f.nome)}</b><span>${escapeHtml(sub)}</span></div>
        ${mexe ? `<button type="button" class="rz-more" data-exec-fase="${f.id}" aria-label="Ações de ${escapeHtml(f.nome)}"><i data-lucide="ellipsis-vertical"></i></button>` : ''}</div>`;
}
function linhaItemExecHtml(i) {
    const prox = i.proximo?.data ? (diasAte(i.proximo.data) < 0 ? 'Venceu ' : 'Próximo ') + formatarDataBR(i.proximo.data) : 'Sem pendência';
    const val = i.valor_previsto ? ' · ' + moedaBR(i.valor_previsto) : '';
    return `<button type="button" class="rz-row" data-exec-item="${i.id}"><div class="rz-tx"><b>${escapeHtml(i.titulo)}</b><span>${escapeHtml(prox + val)}</span></div><i data-lucide="chevron-right"></i></button>`;
}
// A tela da execução: as fases (ou etapas) com situação e custo, o custo somado, os itens de agora e as ações.
export async function abrirExecucao(apId, cicloId = null) {
    if (typeof window.abrirSheet !== 'function') { mostrarToast('Abra pelo app principal.', 'erro'); return; }
    const d = await lerExecucao(apId, cicloId); if (!d) return;
    if (d.por_membro && !d.ciclo) { abrirListaPorMembro(d); return; } // v1.62.0 (fatia 7): programa por animal
    if (d.membro) { abrirExecucaoMembro(d); return; }
    const R = execRot(d), P = d.programa, C = d.ciclo;
    const titulo = P.nome + (C ? ' · ' + C.nome : '');
    const sub = !d.aberta ? (P.tem_etapas ? 'Obra ainda não aberta' : 'Nenhuma ' + R.exec + ' aberta')
        : C?.situacao === 'fechado' ? `${R.Exec} fechada em ${formatarDataBR(C.fim)}`
        : d.fase_atual ? `${R.Fase} atual: ${d.fase_atual.nome}` : '';
    const ciclosChips = (d.ciclos || []).length > 1 ? `<div class="rz-chips" style="margin:0 0 10px">${d.ciclos.map(c =>
        `<button type="button" class="rz-chip ${c.id === C?.id ? 'rz-on' : ''}" data-exec-ciclo="${c.id}">${escapeHtml(c.nome)}</button>`).join('')}</div>` : '';
    const custo = d.custo || {};
    const res = C?.resultado && C.situacao === 'fechado' ? (P.resultado_campos || []).map(rc => C.resultado[rc.campo] != null
        ? `<span><b>${rc.unidade && rc.unidade.startsWith('R$') ? moedaBR(C.resultado[rc.campo]) : escapeHtml(String(C.resultado[rc.campo]))}</b> ${escapeHtml(rc.unidade && !rc.unidade.startsWith('R$') ? rc.unidade : '')} ${escapeHtml(rc.rotulo)}</span>` : '').join('') : '';
    const custoHtml = d.aberta ? `<div class="rz-exec-custo"><span><b>${moedaBR(custo.realizado || 0)}</b> pago</span><span><b>${moedaBR(custo.a_pagar || 0)}</b> a pagar</span>${custo.previsto ? `<span><b>${moedaBR(custo.previsto)}</b> previsto</span>` : ''}${res}</div>` : '';
    const porEscopo = (e) => (d.itens || []).filter(i => i.escopo === e);
    const grupo = (rot, lista) => lista.length ? `<div class="rz-group rz-group-t"><span>${escapeHtml(rot)} · ${lista.length}</span></div><div class="rz-list" style="padding:0">` + lista.map(linhaItemExecHtml).join('') + '</div>' : ''; // v1.63.1
    const itensHtml = d.aberta && C?.situacao !== 'fechado'
        ? grupo(d.fase_atual ? 'Agora: ' + d.fase_atual.nome : 'Agora', porEscopo('fase')) + grupo('Da ' + R.exec + ' inteira', porEscopo('ciclo')) + grupo('Do programa', porEscopo('programa'))
        : grupo('Do programa', porEscopo('programa'));
    const sugN = (d.sugestoes_fase || []).length + (d.sugestoes_ciclo || []).length;
    const acoes = [];
    if (d.pode_gerir && P.situacao === 'ativo') {
        if (!d.aberta || (C && C.situacao === 'fechado' && !(d.ciclos || []).some(c => c.situacao !== 'fechado')))
            acoes.push(`<button type="button" class="rz-btn rz-btn-1" data-exec-abrir>${P.tem_etapas ? 'Abrir a obra' : (d.ciclos || []).length ? 'Abrir a próxima' : 'Abrir a ' + R.exec}</button>`);
        else if (C?.situacao !== 'fechado') {
            if (d.proxima) acoes.push(`<button type="button" class="rz-btn rz-btn-1" data-exec-avancar>Avançar para ${escapeHtml(d.proxima.nome)}</button>`);
            acoes.push(P.tem_etapas ? `<button type="button" class="rz-btn ${d.proxima ? 'rz-btn-2' : 'rz-btn-1'}" data-exec-concluir>Concluir a obra</button>`
                : `<button type="button" class="rz-btn ${d.proxima ? 'rz-btn-2' : 'rz-btn-1'}" data-exec-fechar>Fechar a ${escapeHtml(R.exec)}</button>`);
            if (sugN) acoes.push(`<button type="button" class="rz-btn rz-btn-3" data-exec-incluir>+ Do catálogo</button>`);
        }
    }
    if (C?.situacao === 'fechado' && d.pode_reabrir && !(d.ciclos || []).some(c => c.situacao !== 'fechado'))
        acoes.push(`<button type="button" class="rz-btn rz-btn-3" data-exec-reabrir>Reabrir ${escapeHtml(C.nome)}</button>`);
    if (C && d.pode_gerir) acoes.push(`<button type="button" class="rz-btn rz-btn-3" data-exec-corrigir>Corrigir ${escapeHtml(C.nome)}</button>`); // v1.63.0
    const corpo = ciclosChips + custoHtml
        + (d.aberta ? `<div class="rz-exec-fases">${(d.fases || []).map(f => linhaFaseHtml(f, d)).join('')}</div>`
            : `<p class="rz-desc">${P.tem_etapas ? 'Escolha as etapas desta obra a partir do modelo. Cada uma terá os seus itens e o seu custo.'
                : 'A ' + R.exec + ' começa em ' + R.Fase.toLowerCase() + ' pela data e traz os itens de cada fase.'}</p>`)
        + itensHtml;
    const sheet = window.abrirSheet(window.rzSheetCabecalho(titulo, sub) + `<div class="rz-sh-b">${corpo}</div>`
        + (acoes.length ? `<div class="rz-sh-f rz-exec-acoes">${acoes.join('')}</div>` : ''));
    refrescarIcones();
    sheet.querySelectorAll('[data-exec-ciclo]').forEach(b => b.addEventListener('click', () => abrirExecucao(apId, b.dataset.execCiclo)));
    sheet.querySelectorAll('[data-exec-item]').forEach(b => b.addEventListener('click', () => { window.fecharSheet(); abrirFichaItemControle(b.dataset.execItem); }));
    sheet.querySelectorAll('[data-exec-fase]').forEach(b => b.addEventListener('click', (ev) => { ev.stopPropagation(); abrirAcoesFase(d, b.dataset.execFase); }));
    sheet.querySelector('[data-exec-abrir]')?.addEventListener('click', () => P.tem_etapas ? abrirFolhaAbrirObra(d) : abrirFolhaAbrirCiclo(d));
    sheet.querySelector('[data-exec-avancar]')?.addEventListener('click', () => abrirFolhaAvancar(d));
    sheet.querySelector('[data-exec-fechar]')?.addEventListener('click', () => abrirFolhaFecharCiclo(d));
    sheet.querySelector('[data-exec-concluir]')?.addEventListener('click', () => abrirFolhaConcluirObra(d));
    sheet.querySelector('[data-exec-incluir]')?.addEventListener('click', () => abrirFolhaIncluirItens(d));
    sheet.querySelector('[data-exec-reabrir]')?.addEventListener('click', () => abrirFolhaReabrirCiclo(d));
    sheet.querySelector('[data-exec-corrigir]')?.addEventListener('click', () => abrirAcoesCorrigirCiclo(d));
}
window.__rzAbrirExecucao = (apId, cicloId) => abrirExecucao(apId, cicloId);

// ============================================================================
// v1.62.0 (usos fatia 7 — FICHA_FATIA7_MEMBROS_RAIZ v1.2.0, D7-4, D7-11, D7-12) — CICLO DO ANIMAL. O programa por animal
// (Reprodução bovina, Reprodução suína) tem um ciclo para cada fêmea; no lote ele mostra a lista dos animais em ciclo.
// No ciclo do animal: as fases com as datas previstas (o relógio: diagnóstico, secagem, parto, desmame), "Registrar"
// a próxima fase (cobertura, diagnóstico positivo, parto com a cria) com escolha de outra fase adiante, "Diagnóstico
// negativo" (volta a Apta/Vazia) e Fechar. A fase final fecha o ciclo e abre o próximo sozinha (fn_fase_avancar).
// ============================================================================
function abrirListaPorMembro(d) {
    const lista = d.membros || [];
    const sheet = window.abrirSheet(window.rzSheetCabecalho(d.programa.nome, `${lista.length} ${lista.length === 1 ? 'animal' : 'animais'} em ciclo`)
        + `<div class="rz-sh-b">${lista.length ? `<div class="rz-card rz-list">${lista.map(m => `<button type="button" class="rz-row" data-pm-ciclo="${m.ciclo_id}">
            <div class="rz-tx"><b>${escapeHtml(m.identificador)}${m.nome ? ' · ' + escapeHtml(m.nome) : ''}</b><span>${escapeHtml((m.ciclo || '') + (m.fase ? ' · ' + m.fase : ''))}</span></div>
            <i data-lucide="chevron-right"></i></button>`).join('')}</div>` : '<p class="rz-desc">Nenhum animal em ciclo. O ciclo abre pela ficha do animal, no card do rebanho.</p>'}</div>`);
    refrescarIcones();
    sheet.querySelectorAll('[data-pm-ciclo]').forEach(b => b.addEventListener('click', () => abrirExecucao(d.programa.id, b.dataset.pmCiclo)));
}
const ehParto = (f) => f && f.aviso === 'Parto previsto';
const ehDiag = (f) => f && /^Diagn/.test(f.aviso || '');
function rotuloRegistrar(f) {
    if (!f) return '';
    if (ehParto(f)) return 'Registrar o parto';
    if (ehDiag(f)) return 'Diagnóstico positivo';
    if (f.codigo === 'coberta') return 'Registrar a cobertura';
    return 'Avançar para ' + f.nome;
}
function abrirExecucaoMembro(d) {
    const P = d.programa, C = d.ciclo, M = d.membro;
    const aberto = C && C.situacao !== 'fechado';
    const titulo = `${M.identificador}${M.nome ? ' · ' + M.nome : ''}`;
    const sub = `${P.nome} · ${C?.nome || ''}${aberto && d.fase_atual ? ' · ' + d.fase_atual.nome : C?.situacao === 'fechado' ? ' · fechado em ' + formatarDataBR(C.fim) : ''}`;
    const ciclosChips = (d.ciclos || []).length > 1 ? `<div class="rz-chips" style="margin:0 0 10px">${d.ciclos.map(c =>
        `<button type="button" class="rz-chip ${c.id === C?.id ? 'rz-on' : ''}" data-exec-ciclo="${c.id}">${escapeHtml(c.nome)}</button>`).join('')}</div>` : '';
    const linhaFase = (f) => {
        const [ic, rot] = SIT_FASE[f.situacao] || ['circle', f.situacao];
        const n = f.inicio_previsto ? diasAte(f.inicio_previsto) : null;
        const quando = f.situacao === 'atual' && f.inicio ? 'desde ' + formatarDataBR(f.inicio)
            : f.situacao === 'concluida' && f.fim ? 'até ' + formatarDataBR(f.fim)
            : f.inicio_previsto ? (f.aviso || 'prevista') + ' ' + formatarDataBR(f.inicio_previsto) + (f.automatica ? ' · muda sozinha' : ' · você confirma') : '';
        const sub2 = [rot, quando, f.situacao === 'pulada' && f.motivo ? f.motivo : ''].filter(Boolean).join(' · ');
        const mexe = d.pode_gerir && aberto && f.situacao !== 'atual';
        return `<div class="rz-exec-f rz-exec-${f.situacao}${n != null && f.situacao === 'pendente' && n < 0 ? ' rz-exec-atraso' : ''}"><span class="rz-exec-ic"><i data-lucide="${ic}"></i></span>
            <div class="rz-tx"><b>${escapeHtml(f.nome)}</b><span>${escapeHtml(sub2)}</span></div>
            ${mexe ? `<button type="button" class="rz-more" data-exec-fase="${f.id}" aria-label="Ações de ${escapeHtml(f.nome)}"><i data-lucide="ellipsis-vertical"></i></button>` : ''}</div>`;
    };
    const res = C?.resultado || {};
    const resTxt = Object.entries(res).filter(([k, v]) => v && typeof v === 'object' && v.data).map(([k, v]) => {
        const f = (d.fases || []).find(x => x.codigo === k);
        const ROT = { diagnostico: 'diagnóstico', cria: 'cria', nascidos_vivos: 'nascidos vivos', natimortos: 'natimortos', touro: 'touro ou sêmen' };
        const extra = Object.entries(v).filter(([kk]) => kk !== 'data').map(([kk, vv]) => `${ROT[kk] || kk.replace(/_/g, ' ')}: ${vv === 'femea' ? 'fêmea' : vv}`).join(', ');
        return `<span><b>${escapeHtml(f ? f.nome : k)}</b> ${escapeHtml(formatarDataBR(v.data))}${extra ? ' · ' + escapeHtml(extra) : ''}</span>`;
    }).join('');
    const prox = d.proxima ? (d.fases || []).find(f => f.id === d.proxima.id) : null;
    const atual = (d.fases || []).find(f => f.situacao === 'atual');
    const acoes = [];
    if (d.pode_gerir && P.situacao === 'ativo') {
        if (aberto) {
            if (prox) acoes.push(`<button type="button" class="rz-btn rz-btn-1" data-mb-registrar>${escapeHtml(rotuloRegistrar(prox))}</button>`);
            if (ehDiag(prox)) acoes.push(`<button type="button" class="rz-btn rz-btn-2" data-mb-negativo>Diagnóstico negativo</button>`);
            acoes.push(`<button type="button" class="rz-btn rz-btn-3" data-exec-fechar>Fechar o ciclo</button>`);
        } else if (M.situacao !== 'saiu' && !(d.ciclos || []).some(c => c.situacao !== 'fechado')) {
            acoes.push(`<button type="button" class="rz-btn rz-btn-1" data-mb-novo-ciclo>Abrir o próximo ciclo</button>`);
        }
    }
    if (C?.situacao === 'fechado' && d.pode_reabrir && M.situacao !== 'saiu' && !(d.ciclos || []).some(c => c.situacao !== 'fechado'))
        acoes.push(`<button type="button" class="rz-btn rz-btn-3" data-exec-reabrir>Reabrir ${escapeHtml(C.nome)}</button>`);
    const corpo = ciclosChips + (resTxt ? `<div class="rz-exec-custo">${resTxt}</div>` : '')
        + `<div class="rz-exec-fases">${(d.fases || []).map(linhaFase).join('')}</div>`
        + ((d.itens || []).length ? `<div class="rz-group rz-group-t"><span>Itens · ${d.itens.length}</span></div><div class="rz-list" style="padding:0">` + d.itens.map(linhaItemExecHtml).join('') + '</div>' : '') // v1.63.1
        + `<button type="button" class="rz-btn rz-btn-3 rz-wide" data-mb-ficha style="margin-top:10px"><i data-lucide="beef"></i> Ficha de ${escapeHtml(M.identificador)}</button>`;
    const sheet = window.abrirSheet(window.rzSheetCabecalho(titulo, sub) + `<div class="rz-sh-b">${corpo}</div>`
        + (acoes.length ? `<div class="rz-sh-f rz-exec-acoes">${acoes.join('')}</div>` : ''));
    refrescarIcones();
    sheet.querySelectorAll('[data-exec-ciclo]').forEach(b => b.addEventListener('click', () => abrirExecucao(P.id, b.dataset.execCiclo)));
    sheet.querySelectorAll('[data-exec-item]').forEach(b => b.addEventListener('click', () => { window.fecharSheet(); abrirFichaItemControle(b.dataset.execItem); }));
    sheet.querySelectorAll('[data-exec-fase]').forEach(b => b.addEventListener('click', (ev) => { ev.stopPropagation(); abrirAcoesFase(d, b.dataset.execFase); }));
    sheet.querySelector('[data-mb-registrar]')?.addEventListener('click', () => abrirFolhaRegistrarFase(d));
    sheet.querySelector('[data-mb-negativo]')?.addEventListener('click', () => diagnosticoNegativo(d, atual));
    sheet.querySelector('[data-exec-fechar]')?.addEventListener('click', () => abrirFolhaFecharCiclo(d));
    sheet.querySelector('[data-exec-reabrir]')?.addEventListener('click', () => abrirFolhaReabrirCiclo(d));
    sheet.querySelector('[data-mb-novo-ciclo]')?.addEventListener('click', async () => {
        const { data, error } = await api.dbAuth.rpc('fn_membro_ciclo_abrir', { p_membro_id: M.id, p_ativo_programa_id: P.id, p_canal: 'app' });
        if (error) { mostrarToast(error.message || 'Não foi possível abrir.', 'erro'); return; }
        mostrarToast('Ciclo aberto.', 'sucesso');
        aposMudarExecucao(data?.ativo_programa_id || P.id, data?.ciclo_id || null);
    });
    sheet.querySelector('[data-mb-ficha]')?.addEventListener('click', async () => { const mb = await import('./cofre-membros.js'); mb.abrirFichaMembro(M.id); });
}
// Registrar a próxima fase do animal: a data, a fase (a próxima ou outra adiante) e, no parto, a cria (D7-12).
function abrirFolhaRegistrarFase(d) {
    const M = d.membro, hoje = hojeLocalISO();
    const atual = (d.fases || []).find(f => f.situacao === 'atual');
    const adiante = (d.fases || []).filter(f => f.situacao === 'pendente' && (!atual || f.ordem > atual.ordem));
    if (!adiante.length) return;
    const suino = M.especie === 'suino';
    window.abrirSheetForm({
        titulo: rotuloRegistrar(adiante[0]), sub: `${M.identificador} · ${d.ciclo.nome}`, rotuloSalvar: 'Registrar', empilhar: true,
        corpo: (el) => {
            el.innerHTML = (adiante.length > 1 ? `<div class="rz-f"><label for="mbf-fase">Fase</label><select id="mbf-fase">${adiante.map((f, i) =>
                    `<option value="${f.id}" ${i === 0 ? 'selected' : ''}>${escapeHtml(f.nome)}${i ? ' (pula as do meio)' : ''}</option>`).join('')}</select></div>` : '')
                + `<div class="rz-f"><label for="mbf-data">Em</label><input type="date" id="mbf-data" value="${hoje}" max="${hoje}"></div><div id="mbf-extra"></div>`;
            const pintar = () => {
                const f = adiante.find(x => x.id === (el.querySelector('#mbf-fase')?.value || adiante[0].id)) || adiante[0];
                el.querySelector('#mbf-extra').innerHTML = ehParto(f) ? (suino
                    ? `<div class="rz-f"><label for="mbf-vivos">Nascidos vivos</label><input type="number" id="mbf-vivos" inputmode="numeric" min="0" step="1"></div>
                       <div class="rz-f"><label for="mbf-mortos">Natimortos <small>(opcional)</small></label><input type="number" id="mbf-mortos" inputmode="numeric" min="0" step="1"></div>`
                    : `<div class="rz-f"><label for="mbf-cria-sexo">Cria</label><select id="mbf-cria-sexo"><option value="femea">Fêmea</option><option value="macho">Macho</option><option value="natimorto">Natimorto</option></select></div>
                       <label class="rz-row rz-chk"><input type="checkbox" id="mbf-cria-cad" checked><div class="rz-tx"><b>Cadastrar a cria agora</b><span>No mesmo lote, ligada à mãe</span></div></label>
                       <div class="rz-f" id="mbf-cria-id-box"><label for="mbf-cria-id">Identificação da cria</label><input type="text" id="mbf-cria-id" maxlength="60" placeholder="Brinco"></div>`)
                    + '<p class="rz-desc">O parto soma na mãe e fecha o ciclo quando é a última fase; o próximo abre sozinho.</p>'
                    : f.codigo === 'coberta' ? `<div class="rz-f"><label for="mbf-touro">Touro ou sêmen <small>(opcional)</small></label><input type="text" id="mbf-touro" maxlength="80"></div>
                       <p class="rz-desc">Com a data da cobertura, o app prevê o diagnóstico, a secagem e o parto.</p>` : '';
                const cad = el.querySelector('#mbf-cria-cad'), sx = el.querySelector('#mbf-cria-sexo');
                const ver = () => { const box = el.querySelector('#mbf-cria-id-box'); if (box) box.classList.toggle('hidden', !cad?.checked || sx?.value === 'natimorto'); };
                cad?.addEventListener('change', ver); sx?.addEventListener('change', ver); ver();
            };
            pintar();
            el.querySelector('#mbf-fase')?.addEventListener('change', pintar);
        },
        aoSalvar: async (el) => {
            const f = adiante.find(x => x.id === (el.querySelector('#mbf-fase')?.value || adiante[0].id)) || adiante[0];
            const data = el.querySelector('#mbf-data')?.value || hoje;
            const dados = {};
            const v = (id) => (el.querySelector('#' + id)?.value || '').trim();
            if (ehParto(f)) {
                if (suino) { if (v('mbf-vivos') !== '') dados.nascidos_vivos = Number(v('mbf-vivos')); if (v('mbf-mortos') !== '') dados.natimortos = Number(v('mbf-mortos')); }
                else dados.cria = v('mbf-cria-sexo');
            }
            if (f.codigo === 'coberta' && v('mbf-touro')) dados.touro = v('mbf-touro');
            if (ehDiag(f)) dados.diagnostico = 'positivo';
            const criaCad = ehParto(f) && !suino && el.querySelector('#mbf-cria-cad')?.checked && dados.cria !== 'natimorto';
            if (criaCad && !v('mbf-cria-id')) { mostrarToast('Diga a identificação da cria.', 'erro'); return false; }
            const { data: r, error } = await api.dbAuth.rpc('fn_fase_avancar', { p_ativo_programa_id: d.programa.id, p_ciclo_id: d.ciclo.id,
                p_data: data, p_canal: 'app', p_para_fase_id: f.id, p_dados: Object.keys(dados).length ? dados : null });
            if (error) { mostrarToast(error.message || 'Não foi possível registrar.', 'erro'); return false; }
            let criaOk = false;
            if (criaCad) {
                const mb = await import('./cofre-membros.js');
                criaOk = !!(await mb.cadastrarCria({ ...M, ativo_id: M.ativo_id }, { identificador: v('mbf-cria-id'), sexo: dados.cria, nascimento: data }));
            }
            mostrarToast(criaOk ? 'Parto e cria registrados.' : (r?.ciclo_novo_id ? 'Registrado; novo ciclo aberto.' : 'Registrado.'), 'sucesso');
            setTimeout(() => aposMudarExecucao(d.programa.id, r?.ciclo_novo_id || d.ciclo.id), 0);
            return true;
        },
    });
}
// Diagnóstico negativo: volta para Apta a cobrir (ou a fase de antes da cobertura) e as datas previstas somem.
function diagnosticoNegativo(d, atual) {
    const antes = (d.fases || []).filter(f => atual && f.ordem < atual.ordem && (f.situacao === 'concluida' || f.situacao === 'pulada'));
    const alvo = antes.find(f => f.codigo === 'apta') || antes[antes.length - 1];
    if (!alvo) { mostrarToast('Não há fase anterior para voltar.', 'erro'); return; }
    window.abrirSheetForm({
        titulo: 'Diagnóstico negativo', sub: `${d.membro.identificador} · ${d.ciclo.nome}`, rotuloSalvar: 'Voltar para ' + alvo.nome, empilhar: true,
        corpo: `<p class="rz-desc">${escapeHtml(d.membro.identificador)} volta para ${escapeHtml(alvo.nome)} e as datas previstas da cobertura saem. Registre a nova cobertura quando houver.</p>`,
        aoSalvar: async () => {
            const { error } = await api.dbAuth.rpc('fn_fase_mover', { p_fase_id: alvo.id, p_acao: 'voltar', p_motivo: 'Diagnóstico negativo', p_canal: 'app' });
            if (error) { mostrarToast(error.message || 'Não foi possível.', 'erro'); return false; }
            mostrarToast('Voltou para ' + alvo.nome + '.', 'sucesso');
            setTimeout(() => aposMudarExecucao(d.programa.id, d.ciclo.id), 0);
            return true;
        },
    });
}
function caixasSugestoesHtml(lista, prefixo) {
    return (lista || []).map(s => `<label class="rz-row rz-chk"><input type="checkbox" data-${prefixo}="${s.modelo_id}" ${s.marcado ? 'checked' : ''}>
        <div class="rz-tx"><b>${escapeHtml(s.titulo)}</b><span>${escapeHtml(s.recorrente ? rotuloFrequencia(s.frequencia_intervalo, s.frequencia_unidade) : 'Uma vez')}</span></div></label>`).join('');
}
function abrirFolhaAbrirObra(d) {
    const modelo = d.modelo_etapas || [];
    window.abrirSheetForm({
        titulo: 'Abrir a obra', sub: d.programa.nome, rotuloSalvar: 'Abrir a obra', empilhar: true,
        corpo: `<p class="rz-desc">Marque as etapas desta obra, na ordem. Tire as que não se aplicam e inclua as próprias.</p>
            <div class="rz-list">${modelo.map(m => `<label class="rz-row rz-chk"><input type="checkbox" data-etapa="${m.id}" ${m.opcional ? '' : 'checked'}>
                <div class="rz-tx"><b>${escapeHtml(m.nome)}</b><span>${m.opcional ? 'Opcional' : 'Do modelo'}</span></div></label>`).join('')}</div>
            <div class="rz-f"><label for="ex-proprias">Etapas próprias <small>(opcional)</small></label><input type="text" id="ex-proprias" maxlength="200" placeholder="Ex.: Muro de divisa, Piscina">
            <span class="rz-hint">Separe por vírgula. Entram depois das do modelo.</span></div>`,
        aoSalvar: async (el) => {
            const etapas = [...el.querySelectorAll('[data-etapa]:checked')].map(c => ({ fase_id: c.dataset.etapa }));
            (el.querySelector('#ex-proprias')?.value || '').split(',').map(s => s.trim()).filter(Boolean).forEach(nome => etapas.push({ nome }));
            if (!etapas.length) { mostrarToast('Marque ao menos uma etapa.', 'erro'); return false; }
            const { data, error } = await api.dbAuth.rpc('fn_execucao_abrir', { p_ativo_programa_id: d.programa.id, p_etapas: etapas, p_canal: 'app' });
            if (error) { mostrarToast(error.message || 'Não foi possível abrir.', 'erro'); return false; }
            mostrarToast('Obra aberta.', 'sucesso');
            setTimeout(() => aposMudarExecucao(d.programa.id, null), 0);
            return true;
        },
    });
}
function abrirFolhaAbrirCiclo(d) {
    const R = execRot(d);
    window.abrirSheetForm({
        titulo: 'Abrir a ' + R.exec, sub: d.programa.nome, rotuloSalvar: 'Abrir', empilhar: true,
        corpo: `<p class="rz-desc">A ${escapeHtml(R.exec)} começa na fase do mês e já traz os itens marcados por padrão. As fases que já passaram ficam como puladas.</p>
            <div class="rz-f"><label for="ex-ref">Data de referência</label><input type="date" id="ex-ref" value="${hojeLocalISO()}" max="${hojeLocalISO()}">
            <span class="rz-hint">${escapeHtml(R.Exec)} e ${escapeHtml(R.fase)} saem desta data. Para ${ehFem(R) ? 'uma' : 'um'} já em curso, use a data em que estava.</span></div>
            <div class="rz-f"><label for="ex-nome">Nome <small>(opcional)</small></label><input type="text" id="ex-nome" maxlength="60" placeholder="Pelo padrão, a partir da data"></div>`,
        aoSalvar: async (el) => {
            const nome = (el.querySelector('#ex-nome')?.value || '').trim() || null;
            const ref = el.querySelector('#ex-ref')?.value || null; // v1.63.0 (item 53): p_inicio já existia no banco
            const { data, error } = await api.dbAuth.rpc('fn_execucao_abrir', { p_ativo_programa_id: d.programa.id, p_nome: nome, p_inicio: ref, p_canal: 'app' });
            if (error) { mostrarToast(error.message || 'Não foi possível abrir.', 'erro'); return false; }
            mostrarToast(R.Exec + ' aberta.', 'sucesso');
            setTimeout(() => aposMudarExecucao(d.programa.id, data?.ciclo_id || null), 0);
            return true;
        },
    });
}
// Avançar (D6-3): cada item aberto da fase é levado para a próxima (padrão) ou concluído; os da próxima vêm marcados.
function abrirFolhaAvancar(d) {
    const R = execRot(d);
    const abertos = (d.itens || []).filter(i => i.escopo === 'fase' && i.situacao === 'ativo');
    const hoje = hojeLocalISO();
    window.abrirSheetForm({
        titulo: 'Avançar para ' + d.proxima.nome, sub: d.programa.nome + (d.ciclo ? ' · ' + d.ciclo.nome : ''), rotuloSalvar: 'Avançar', empilhar: true,
        corpo: `<div class="rz-f"><label for="ex-data">${escapeHtml(d.fase_atual?.nome || R.Fase)} termina em</label><input type="date" id="ex-data" value="${hoje}" max="${hoje}"></div>
            ${abertos.length ? `<div class="rz-group rz-group-t"><span>Itens abertos de ${escapeHtml(d.fase_atual?.nome || '')}</span></div>
            <div class="rz-list">${abertos.map(i => `<div class="rz-row"><div class="rz-tx"><b>${escapeHtml(i.titulo)}</b></div>
                <select data-aberto="${i.id}" aria-label="O que fazer com ${escapeHtml(i.titulo)}"><option value="levar">Levar</option><option value="concluir">Concluir</option></select></div>`).join('')}</div>` : ''}
            ${(d.proxima.sugestoes || []).length ? `<div class="rz-group rz-group-t"><span>Itens de ${escapeHtml(d.proxima.nome)}</span></div>
            <div class="rz-list">${caixasSugestoesHtml(d.proxima.sugestoes, 'nova')}</div>` : ''}`,
        aoSalvar: async (el) => {
            const data = el.querySelector('#ex-data')?.value || hoje;
            const p_abertos = [...el.querySelectorAll('[data-aberto]')].map(s => ({ item_id: s.dataset.aberto, acao: s.value }));
            const p_itens_nova = [...el.querySelectorAll('[data-nova]:checked')].map(c => ({ modelo_id: c.dataset.nova }));
            const { data: r, error } = await api.dbAuth.rpc('fn_fase_avancar', { p_ativo_programa_id: d.programa.id, p_ciclo_id: d.ciclo?.id || null,
                p_abertos, p_itens_nova, p_data: data, p_canal: 'app' });
            if (error) { mostrarToast(error.message || 'Não foi possível avançar.', 'erro'); return false; }
            mostrarToast(d.proxima.nome + ' em andamento.', 'sucesso');
            setTimeout(() => aposMudarExecucao(d.programa.id, d.ciclo?.id || null), 0);
            return true;
        },
    });
}
function abrirAcoesFase(d, faseId) {
    const f = (d.fases || []).find(x => x.id === faseId); if (!f) return;
    const R = execRot(d);
    const acoes = [];
    const fechado = d.ciclo?.situacao === 'fechado';
    if (!d.membro && (f.situacao === 'concluida' || f.situacao === 'atual'))
        acoes.push({ icone: 'calendar-cog', titulo: 'Corrigir datas', codigo: 'ciclos.gerir', sub: f.situacao === 'atual' ? 'Início desta ' + R.fase : 'Início e fim', aoTocar: () => abrirFolhaDatasFase(d, f) });
    if (fechado) { if (acoes.length) sheetAcoes({ titulo: f.nome, sub: d.programa.nome, acoes, empilhar: true }); return; }
    if (f.situacao === 'pendente') acoes.push({ icone: 'skip-forward', titulo: 'Pular ' + R.fase, codigo: 'ciclos.gerir', sub: 'Com o motivo', aoTocar: () => moverFase(d, f, 'pular') });
    if (f.situacao === 'pulada') acoes.push({ icone: 'undo-2', titulo: 'Retomar ' + R.fase, codigo: 'ciclos.gerir', sub: 'Volta para a lista', aoTocar: () => moverFase(d, f, 'retomar') });
    if (f.situacao === 'concluida') acoes.push({ icone: 'rotate-ccw', titulo: 'Voltar para esta', codigo: 'ciclos.gerir', sub: 'A atual volta para a lista', aoTocar: () => moverFase(d, f, 'voltar') });
    if (!acoes.length) return;
    sheetAcoes({ titulo: f.nome, sub: d.programa.nome, acoes, empilhar: true }); // v1.63.1: por cima da safra
}
function moverFase(d, f, acao) {
    const ROT = { pular: 'Pular', retomar: 'Retomar', voltar: 'Voltar para' };
    window.abrirSheetForm({
        titulo: ROT[acao] + ' ' + f.nome, sub: d.programa.nome, rotuloSalvar: ROT[acao], empilhar: true,
        corpo: `<div class="rz-f"><label for="ex-motivo">Motivo</label><input type="text" id="ex-motivo" maxlength="200" placeholder="Ex.: não se aplica nesta obra"></div>`,
        aoSalvar: async (el) => {
            const motivo = (el.querySelector('#ex-motivo')?.value || '').trim();
            if (!motivo) { mostrarToast('Diga o motivo.', 'erro'); return false; }
            const { error } = await api.dbAuth.rpc('fn_fase_mover', { p_fase_id: f.id, p_acao: acao, p_motivo: motivo, p_canal: 'app' });
            if (error) { mostrarToast(error.message || 'Não foi possível.', 'erro'); return false; }
            mostrarToast('Feito.', 'sucesso');
            setTimeout(() => aposMudarExecucao(d.programa.id, d.ciclo?.id || null), 0);
            return true;
        },
    });
}
// ---------------------------------------------------------------------------------------------------------------------------
// v1.63.0 (item 53) — CORRIGIR: editar a safra, excluir a safra criada errada (só sem vínculo) e corrigir as datas da fase.
// Regra no banco: fn_ciclo_editar, fn_ciclo_excluir, fn_ciclo_vinculos e fn_fase_datas; aqui só a folha e o aviso.
// ---------------------------------------------------------------------------------------------------------------------------
const ehFem = (R) => /a$/.test(R.exec);
function abrirAcoesCorrigirCiclo(d) {
    const R = execRot(d), C = d.ciclo; if (!C) return;
    sheetAcoes({ titulo: 'Corrigir ' + C.nome, sub: d.programa.nome, empilhar: true, acoes: [
        { icone: 'pencil', titulo: 'Editar ' + (ehFem(R) ? 'a ' : 'o ') + R.exec, codigo: 'ciclos.gerir', sub: 'Início, fim e nome', aoTocar: () => abrirFolhaEditarCiclo(d) },
        { icone: 'list-checks', titulo: 'Ver vínculos', codigo: 'ciclos.gerir', sub: 'O que está ligado', aoTocar: () => mostrarVinculosCiclo(d, false) },
        { icone: 'trash-2', titulo: 'Excluir ' + (ehFem(R) ? 'a ' : 'o ') + R.exec, codigo: 'ciclos.gerir', sub: 'Só sem vínculo', tipo: 'bad', aoTocar: () => mostrarVinculosCiclo(d, true) },
    ] });
}
function abrirFolhaEditarCiclo(d) {
    const R = execRot(d), C = d.ciclo, hoje = hojeLocalISO();
    const fechado = C.situacao === 'fechado';
    window.abrirSheetForm({
        titulo: 'Editar ' + C.nome, sub: d.programa.nome, rotuloSalvar: 'Salvar', empilhar: true,
        corpo: `<div class="rz-f"><label for="cc-inicio">Início</label><input type="date" id="cc-inicio" value="${escapeHtml(C.inicio || '')}"></div>
            <div class="rz-f"><label for="cc-fim-prev">Fim previsto</label><input type="date" id="cc-fim-prev" value="${escapeHtml(C.fim_previsto || '')}"></div>
            ${fechado ? `<div class="rz-f"><label for="cc-fim">Fechad${ehFem(R) ? 'a' : 'o'} em</label><input type="date" id="cc-fim" value="${escapeHtml(C.fim || '')}" max="${hoje}"></div>` : ''}
            <div class="rz-f"><label for="cc-nome">Nome <small>(opcional)</small></label><input type="text" id="cc-nome" maxlength="60" placeholder="Pelo padrão, a partir do início">
            <span class="rz-hint">Hoje: ${escapeHtml(C.nome)}. Em branco, o nome segue o início.</span></div>
            <div class="rz-f"><label for="cc-motivo">Motivo</label><input type="text" id="cc-motivo" maxlength="200" placeholder="Ex.: cadastrei com o ano errado"></div>
            <p class="rz-desc">As datas das fases não mudam sozinhas: se ficarem fora, corrija cada uma pelo ⋮ da fase.</p>`,
        aoSalvar: async (el) => {
            const v = (id) => (el.querySelector('#' + id)?.value || '').trim();
            if (!v('cc-motivo')) { mostrarToast('Diga o motivo.', 'erro'); return false; }
            const { data, error } = await api.dbAuth.rpc('fn_ciclo_editar', { p_ciclo_id: C.id, p_inicio: v('cc-inicio') || null,
                p_fim_previsto: v('cc-fim-prev') || null, p_nome: v('cc-nome') || null, p_fim: fechado ? (v('cc-fim') || null) : null,
                p_motivo: v('cc-motivo'), p_canal: 'app' });
            if (error) { mostrarToast(error.message || 'Não foi possível corrigir.', 'erro'); return false; }
            mostrarToast(data?.mensagem || 'Corrigido.', (data?.fases_fora || []).length ? 'aviso' : 'sucesso');
            setTimeout(() => aposMudarExecucao(d.programa.id, C.id), 0);
            return true;
        },
    });
}
async function mostrarVinculosCiclo(d, excluir) {
    const R = execRot(d), C = d.ciclo;
    const { data: v, error } = await api.dbAuth.rpc('fn_ciclo_vinculos', { p_ciclo_id: C.id });
    if (error) { mostrarToast(error.message || 'Não consegui ler os vínculos.', 'erro'); return; }
    const linha = (ic, t, s) => `<div class="rz-row"><span class="rz-ic"><i data-lucide="${ic}"></i></span><div class="rz-tx"><b>${escapeHtml(t)}</b>${s ? `<span>${escapeHtml(s)}</span>` : ''}</div></div>`;
    const blocos = [
        ['Lançamentos no Financeiro', (v.lancamentos || []).map(l => linha('receipt', l.descricao, [l.data ? formatarDataBR(l.data) : '', l.valor != null ? moedaBR(l.valor) : ''].filter(Boolean).join(' · ')))],
        ['Ocorrências tratadas', (v.ocorrencias_tratadas || []).map(o => linha('check-check', o.item, o.data ? formatarDataBR(o.data) : ''))],
        ['Documentos', (v.documentos || []).map(x => linha('file-text', x.nome, ''))],
        ['Rateios', (v.rateios || []).map(x => linha('users-round', x.item, ''))],
    ].filter(([, l]) => l.length);
    const lista = blocos.map(([t, l]) => `<div class="rz-group rz-group-t"><span>${escapeHtml(t)} · ${l.length}</span></div><div class="rz-list">${l.join('')}</div>`).join('');
    const como = '<p class="rz-desc">Para excluir, desfaça antes: desaloque ou exclua o lançamento no Financeiro, reabra a ocorrência no item, desvincule o documento no Cofre e reabra o rateio.</p>';
    const resumo = `${v.fases} ${R.fase}s e ${v.itens} ${v.itens === 1 ? 'item' : 'itens'}`;
    if (!excluir || v.total > 0) {
        window.abrirSheetForm({
            titulo: (v.total ? 'Vínculos de ' : 'Sem vínculos em ') + C.nome, sub: d.programa.nome, rotuloSalvar: 'Entendi', empilhar: true,
            corpo: v.total ? lista + como : `<p class="rz-desc">Nada no Financeiro, no Cofre ou em rateio está ligado ${ehFem(R) ? 'a esta' : 'a este'} ${escapeHtml(R.exec)} (${escapeHtml(resumo)}). Dá para editar ou excluir.</p>`,
            aoSalvar: async () => true,
        });
        return;
    }
    window.abrirSheetForm({
        titulo: 'Excluir ' + C.nome, sub: d.programa.nome, rotuloSalvar: 'Excluir', empilhar: true,
        corpo: `<p class="rz-desc">Sai ${ehFem(R) ? 'a' : 'o'} ${escapeHtml(R.exec)} com ${escapeHtml(resumo)} e as ocorrências em aberto. Não há vínculos. Não dá para desfazer.</p>
            ${C.situacao === 'fechado' ? '' : '<p class="rz-desc">Se houver ' + (ehFem(R) ? 'uma' : 'um') + ' ' + escapeHtml(R.exec) + ' fechad' + (ehFem(R) ? 'a' : 'o') + ' antes, ' + (ehFem(R) ? 'ela pode ser reaberta' : 'ele pode ser reaberto') + ' depois.</p>'}
            <div class="rz-f"><label for="cc-motivo-x">Motivo</label><input type="text" id="cc-motivo-x" maxlength="200" placeholder="Ex.: abri por engano"></div>`,
        aoSalvar: async (el) => {
            const motivo = (el.querySelector('#cc-motivo-x')?.value || '').trim();
            if (!motivo) { mostrarToast('Diga o motivo.', 'erro'); return false; }
            const { data, error } = await api.dbAuth.rpc('fn_ciclo_excluir', { p_ciclo_id: C.id, p_motivo: motivo, p_canal: 'app' });
            if (error) { mostrarToast(error.message || 'Não foi possível excluir.', 'erro'); return false; }
            mostrarToast(data?.mensagem || 'Excluído.', 'sucesso');
            const outro = (d.ciclos || []).filter(c => c.id !== C.id).slice(-1)[0];
            setTimeout(() => aposMudarExecucao(d.programa.id, outro?.id || null), 0);
            return true;
        },
    });
}
function abrirFolhaDatasFase(d, f) {
    const R = execRot(d), hoje = hojeLocalISO();
    const conc = f.situacao === 'concluida';
    window.abrirSheetForm({
        titulo: 'Datas de ' + f.nome, sub: d.programa.nome + (d.ciclo ? ' · ' + d.ciclo.nome : ''), rotuloSalvar: 'Salvar', empilhar: true,
        corpo: `<div class="rz-f"><label for="fd-inicio">Começou em</label><input type="date" id="fd-inicio" value="${escapeHtml(f.inicio || '')}" max="${hoje}"></div>
            ${conc ? `<div class="rz-f"><label for="fd-fim">Terminou em</label><input type="date" id="fd-fim" value="${escapeHtml(f.fim || '')}" max="${hoje}"></div>` : ''}
            <div class="rz-f"><label for="fd-motivo">Motivo</label><input type="text" id="fd-motivo" maxlength="200" placeholder="Ex.: avancei antes da hora"></div>
            <p class="rz-desc">As datas ficam dentro ${ehFem(R) ? 'da' : 'do'} ${escapeHtml(R.exec)} e na ordem das ${escapeHtml(R.fase)}s vizinhas. Para desfazer o avanço, use "Voltar para esta" na ${escapeHtml(R.fase)} anterior.</p>`,
        aoSalvar: async (el) => {
            const v = (id) => (el.querySelector('#' + id)?.value || '').trim();
            if (!v('fd-motivo')) { mostrarToast('Diga o motivo.', 'erro'); return false; }
            const { data, error } = await api.dbAuth.rpc('fn_fase_datas', { p_fase_id: f.id, p_inicio: v('fd-inicio') || null,
                p_fim: conc ? (v('fd-fim') || null) : null, p_motivo: v('fd-motivo'), p_canal: 'app' });
            if (error) { mostrarToast(error.message || 'Não foi possível corrigir.', 'erro'); return false; }
            mostrarToast(data?.mensagem || 'Datas corrigidas.', 'sucesso');
            setTimeout(() => aposMudarExecucao(d.programa.id, d.ciclo?.id || null), 0);
            return true;
        },
    });
}
function abrirFolhaFecharCiclo(d) {
    const R = execRot(d), C = d.ciclo;
    const campos = (d.programa.resultado_campos || []).filter(rc => !rc.calculado);
    window.abrirSheetForm({
        titulo: 'Fechar ' + C.nome, sub: d.programa.nome, rotuloSalvar: 'Fechar', empilhar: true,
        corpo: campos.map(rc => `<div class="rz-f"><label for="ex-r-${escapeHtml(rc.campo)}">${escapeHtml(rc.rotulo)}${rc.unidade ? ' (' + escapeHtml(rc.unidade) + ')' : ''}</label>
                <input type="number" inputmode="decimal" step="0.01" min="0" id="ex-r-${escapeHtml(rc.campo)}" data-res="${escapeHtml(rc.campo)}"></div>`).join('')
            + `<p class="rz-desc">O custo sai dos lançamentos com destino ${/a$/.test(R.exec) ? 'nesta' : 'neste'} ${escapeHtml(R.exec)}: ${moedaBR(Number(d.custo?.realizado || 0) + Number(d.custo?.a_pagar || 0))} até agora. Os itens abertos encerram junto.</p>
            <label class="rz-row rz-chk"><input type="checkbox" id="ex-proxima" ${d.membro ? '' : 'checked'}><div class="rz-tx"><b>${d.membro ? 'Abrir o próximo ciclo' : (/a$/.test(R.exec) ? 'Abrir a próxima ' : 'Abrir o próximo ') + escapeHtml(R.exec)}</b><span>${d.membro ? 'Começa em ' + escapeHtml((d.fases || [])[0]?.nome || 'Vazia') + ' hoje' : 'Com os itens de padrão'}</span></div></label>`,
        aoSalvar: async (el) => {
            const res = {};
            el.querySelectorAll('[data-res]').forEach(i => { if (i.value !== '') res[i.dataset.res] = Number(i.value); });
            const { data, error } = await api.dbAuth.rpc('fn_ciclo_fechar', { p_ciclo_id: C.id, p_resultado: res,
                p_proximo: !!el.querySelector('#ex-proxima')?.checked, p_canal: 'app' });
            if (error) { mostrarToast(error.message || 'Não foi possível fechar.', 'erro'); return false; }
            mostrarToast(R.Exec + (/a$/.test(R.exec) ? ' fechada.' : ' fechado.'), 'sucesso');
            setTimeout(() => aposMudarExecucao(d.programa.id, data?.proximo?.ciclo_id || C.id), 0);
            return true;
        },
    });
}
function abrirFolhaReabrirCiclo(d) {
    const C = d.ciclo;
    window.abrirSheetForm({
        titulo: 'Reabrir ' + C.nome, sub: d.programa.nome, rotuloSalvar: 'Reabrir', empilhar: true,
        corpo: `<div class="rz-f"><label for="ex-motivo">Motivo</label><input type="text" id="ex-motivo" maxlength="200" placeholder="Ex.: faltou lançar a sacaria"></div>`,
        aoSalvar: async (el) => {
            const motivo = (el.querySelector('#ex-motivo')?.value || '').trim();
            if (!motivo) { mostrarToast('Diga o motivo.', 'erro'); return false; }
            const { error } = await api.dbAuth.rpc('fn_ciclo_reabrir', { p_ciclo_id: C.id, p_motivo: motivo, p_canal: 'app' });
            if (error) { mostrarToast(error.message || 'Não foi possível.', 'erro'); return false; }
            mostrarToast(C.nome + (d.membro ? ' reaberto.' : ' reaberta.'), 'sucesso');
            setTimeout(() => aposMudarExecucao(d.programa.id, C.id), 0);
            return true;
        },
    });
}
// Concluir a obra (D6-7 / D4-12): o lote pode virar Casa; o uso Construção conclui e o repouso volta.
function abrirFolhaConcluirObra(d) {
    const a = estado.ativoEmFoco;
    const tipos = [...listarTiposPorCategoria('imovel_predial', { ramo: 'tudo' })];
    window.abrirSheetForm({
        titulo: 'Concluir a obra', sub: a?.nome_exibicao || d.programa.nome, rotuloSalvar: 'Concluir', empilhar: true,
        corpo: `<div class="rz-f"><label for="ex-tipo">O ativo passa a ser</label><select id="ex-tipo"><option value="">Manter o tipo de hoje</option>
                ${tipos.map(t => `<option value="${t.id}">${escapeHtml(t.nome)}</option>`).join('')}</select>
                <span class="rz-hint">Ex.: o lote vira Casa. O tipo anterior fica no histórico.</span></div>
            <div class="rz-f"><label for="ex-motivo">Observação <small>(opcional)</small></label><input type="text" id="ex-motivo" maxlength="200" placeholder="Ex.: habite-se emitido"></div>
            <p class="rz-desc">As etapas que faltam ficam como puladas, os itens da obra encerram e o uso Construção termina hoje.</p>`,
        aoSalvar: async (el) => {
            const novo = el.querySelector('#ex-tipo')?.value || null;
            const motivo = (el.querySelector('#ex-motivo')?.value || '').trim() || null;
            const { error } = await api.dbAuth.rpc('fn_execucao_concluir', { p_ativo_programa_id: d.programa.id,
                p_dados: { novo_tipo_id: novo, motivo }, p_canal: 'app' });
            if (error) { mostrarToast(error.message || 'Não foi possível concluir.', 'erro'); return false; }
            mostrarToast('Obra concluída.', 'sucesso');
            setTimeout(async () => {
                emitirEscrita('ativo', { id: a?.id, acao: 'obra_concluida' });
                await aposMudarExecucao(null, null);
                if (typeof window.__rzRecarregarFichaAtivo === 'function') window.__rzRecarregarFichaAtivo();
            }, 0);
            return true;
        },
    });
}
function abrirFolhaIncluirItens(d) {
    const R = execRot(d);
    const fase = d.sugestoes_fase || [], ciclo = d.sugestoes_ciclo || [];
    window.abrirSheetForm({
        titulo: 'Incluir do catálogo', sub: d.programa.nome, rotuloSalvar: 'Incluir', empilhar: true,
        corpo: (fase.length ? `<div class="rz-group rz-group-t"><span>${escapeHtml(d.fase_atual?.nome || R.Fase)}</span></div><div class="rz-list">${caixasSugestoesHtml(fase.map(s => ({ ...s, marcado: false })), 'inc-fase')}</div>` : '')
            + (ciclo.length ? `<div class="rz-group rz-group-t"><span>Da ${escapeHtml(R.exec)} inteira</span></div><div class="rz-list">${caixasSugestoesHtml(ciclo.map(s => ({ ...s, marcado: false })), 'inc-ciclo')}</div>` : ''),
        aoSalvar: async (el) => {
            const f = [...el.querySelectorAll('[data-inc-fase]:checked')].map(c => ({ modelo_id: c.dataset.incFase }));
            const c = [...el.querySelectorAll('[data-inc-ciclo]:checked')].map(x => ({ modelo_id: x.dataset.incCiclo }));
            if (!f.length && !c.length) { mostrarToast('Marque ao menos um item.', 'erro'); return false; }
            for (const [escopo, itens] of [['fase', f], ['ciclo', c]]) {
                if (!itens.length) continue;
                const { error } = await api.dbAuth.rpc('fn_execucao_itens_adicionar', { p_ativo_programa_id: d.programa.id, p_escopo: escopo, p_itens: itens, p_canal: 'app' });
                if (error) { mostrarToast(error.message || 'Não foi possível incluir.', 'erro'); return false; }
            }
            mostrarToast('Itens incluídos.', 'sucesso');
            setTimeout(() => aposMudarExecucao(d.programa.id, d.ciclo?.id || null), 0);
            return true;
        },
    });
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
// v1.50.0 (F18) — item de conta (tipo 'conta'): cartão ou conta corrente. O item guarda só conta_id, e a conta
// não é lida direto pelo app (conta_controle sem grant de tabela, só pelas funções); a descrição que a
// fn_conta_item_sincronizar grava diz se é cartão, e uma ocorrência ligada a fatura confirma.
function ehItemCartao(item) {
    return item?.tipo === 'conta' && (item.cofre_controle_subtipos?.nome === 'Cartão de crédito' || /^Fatura do cartão/.test(item.descricao || '') || (item.cofre_ocorrencias_controle || []).some(o => o.origem === 'fatura'));
}
function iconeItemConta(item) { return ehItemCartao(item) ? 'credit-card' : 'landmark'; }

// Status do item na semântica única: ok "Em dia", run "Em Nd" (até 30 dias), warn "Vence hoje", bad "Há Nd"; neu para
// encerrado, pausado e sem aviso. Fonte única da linha e da etiqueta do grupo.
function statusDoItem(item) {
    if (item.ativo === false) return item.situacao === 'pausado' ? ['warn', 'Pausado'] : ['neu', 'Concluído'];
    if (item.alerta_ativo === false) return ['neu', item.tipo === 'conta' ? 'Sem aviso' : 'Alertas desligados'];
    const dias = diasProximaOcorrencia(item);
    if (dias !== null && dias < 0) return ['bad', `Há ${Math.abs(dias)}d`];
    if (dias === 0) return ['warn', 'Vence hoje'];
    if (dias !== null && dias <= 30) return ['run', `Em ${dias}d`];
    return ['ok', 'Em dia'];
}
// Ícone do item: o do subtipo, senão o da categoria (catálogo); conta separa cartão de conta corrente
function iconeDoItem(item) {
    if (item.cofre_controle_subtipos?.icone) return item.cofre_controle_subtipos.icone;
    if (item.tipo === 'conta') return iconeItemConta(item);
    const c = (catalogoTiposControle || []).find(x => x.codigo === item.tipo);
    return c?.icone || ({ seguro: 'shield', tributo: 'receipt', manutencao: 'wrench' }[item.tipo] || 'clipboard-check');
}
// Título curto na ficha do ativo: tira " — <nome do ativo>" do fim e "<subtipo> — " do começo (o grupo e a linha de baixo
// já dizem isso). Só na tela; o título gravado não muda.
function tituloCurtoItem(item) {
    let t = String(item.titulo || '');
    const nomeAtivo = ativoControlesAtual?.nome_exibicao;
    if (nomeAtivo && item.ativo_id === ativoControlesAtual?.id) {
        const fim = ' — ' + nomeAtivo;
        if (t.length > fim.length && t.endsWith(fim)) t = t.slice(0, -fim.length);
    }
    const sub = item.cofre_controle_subtipos?.nome;
    const k = t.indexOf(' — ');
    if (sub && k > 0) {
        const cab = t.slice(0, k).trim().toLowerCase();
        if (cab && sub.toLowerCase().startsWith(cab)) t = t.slice(k + 3);
    }
    return t || String(item.titulo || '');
}
function subtituloItem(item) {
    const pagaLoc = item.responsavel_pagamento === 'locatario' ? ' · Paga: locatário' : '';
    const sub = item.cofre_controle_subtipos?.nome || rotuloTipoControle(item.tipo);
    if (!item.data_fim) return sub + pagaLoc;
    if (item.tipo === 'evento') return `${sub} · ${formatarDataBR(item.data_fim)}${pagaLoc}`;
    return `Válido até ${formatarDataBR(item.data_fim)}${pagaLoc}`;
}
function itemResumoHtml(item) {
    const [sem, rotulo] = statusDoItem(item);
    const encerrado = item.ativo === false;
    const icone = encerrado ? (item.situacao === 'pausado' ? 'pause' : 'archive')
        : (item.alerta_ativo === false && item.tipo !== 'conta' ? 'bell-off' : iconeDoItem(item));
    const classeIc = { bad: ' rz-bad', warn: ' rz-warn', neu: ' rz-neu' }[sem] || '';
    return `<div class="rz-row rz-link" data-action="abrir-item-controle" data-id="${item.id}">
        <div class="rz-ic${classeIc}"><i data-lucide="${escapeHtml(icone)}"></i></div>
        <div class="rz-tx"><b>${escapeHtml(tituloCurtoItem(item))}</b><span>${escapeHtml(subtituloItem(item))}</span></div>
        <div class="rz-rt">${statusHtml(sem, rotulo)}</div>
        <i data-lucide="chevron-right" class="rz-chev"></i>
    </div>`;
}

// v1.13.0 (fatia 3, REGRAS §6) — "Mais ações" do card Controles abre
// SHEET (dados, não HTML). "Criar item" saiu daqui: virou a ação nomeada
// do rodapé ("Novo item"). Ficam as configurações que antes só eram
// alcançáveis pelo menu da conta.
export function abrirAcoesControles() { // v1.13.0 — era alternarMaisAcoesControles
    if (typeof window.abrirSheetAcoes !== 'function') { mostrarToast('Abra pelo app principal.', 'erro'); return; }
    window.abrirSheetAcoes({
        titulo: 'Itens de controle',
        sub: estado.ativoEmFoco?.nome_exibicao || '',
        acoes: [
            { icone: 'layers', titulo: 'Modelos de item', codigo: 'cofre.controles.editar', sub: 'Modelos prontos', aoTocar: () => abrirModelosControle() },
            { icone: 'tags', titulo: 'Tipos de controle', codigo: 'cofre.controles.editar', sub: 'Seguro, tributo, manutenção', aoTocar: () => abrirSubtiposControle() },
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
    mount.innerHTML = rzSk('linhas', 2);

    const linhas = await api.buscarPartesDoItemControle(item.id);
    // v1.48.0 (demanda b94ef7d5) — encerrados do item, abaixo das partes ativas
    let encerrados = [];
    try {
        const { data, error } = await api.dbAuth.from('partes_papeis').select('id, papel, encerrado_em, partes(nome)')
            .eq('entidade_tipo', 'item_controle').eq('entidade_id', item.id).eq('ativo', false).order('encerrado_em', { ascending: false });
        if (error) throw error;
        encerrados = data || [];
    } catch (err) { console.warn('[cofre-controles] encerrados do item:', err.message || err); }

    // v1.13.0 (fatia 3b-i) — de pills pra .rz-row (REGRAS §8: pill é só
    // filtro/sub-navegação). Toque abre o editor de partes.
    if (!linhas.length) {
        mount.innerHTML = `<div class="rz-empty"><div class="rz-ic"><i data-lucide="users"></i></div><p>Nenhuma parte ainda.</p></div>`;
        anexarEncerradosItem(mount, item, encerrados);
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
    anexarEncerradosItem(mount, item, encerrados);
    refrescarIcones();
}

// v1.48.0 (demanda b94ef7d5) — grupo "Encerrados" (troca real, com data) + ⋮ Reativar/Excluir.
function anexarEncerradosItem(mount, item, encerrados) {
    if (!encerrados || !encerrados.length) return;
    const bloco = document.createElement('div');
    bloco.innerHTML = `<div class="rz-group">Encerrados · ${encerrados.length}</div>` + encerrados.map(v => `
        <div class="rz-row">
            <div class="rz-ic"><i data-lucide="briefcase"></i></div>
            <div class="rz-tx"><b>${escapeHtml(v.partes?.nome || 'Parte')}</b><span>${escapeHtml(rotuloPapelParteItem(v.papel))}${v.encerrado_em ? ' · encerrado em ' + new Date(v.encerrado_em).toLocaleDateString('pt-BR') : ''}</span></div>
            <span class="rz-st rz-neu">Encerrado</span>
            <button type="button" class="rz-more" data-enc-item="${v.id}" aria-label="Ações do vínculo encerrado"><i data-lucide="ellipsis-vertical"></i></button>
        </div>`).join('');
    mount.appendChild(bloco);
    bloco.querySelectorAll('[data-enc-item]').forEach(btn => btn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        const v = encerrados.find(x => x.id === btn.dataset.encItem); if (!v) return;
        const nome = v.partes?.nome || 'Parte';
        sheetAcoes({ titulo: `${rotuloPapelParteItem(v.papel)} · ${nome}`, sub: 'Vínculo encerrado', acoes: [
            { icone: 'rotate-ccw', titulo: 'Reativar', codigo: 'cofre.controles.editar', sub: 'Volta a responder pelo item', aoTocar: () => acaoEncerradoItem(item, v, 'fn_vinculo_reativar') },
            { icone: 'trash-2', tipo: 'bad', titulo: 'Excluir', codigo: 'cofre.controles.editar', sub: 'Sai também do histórico', aoTocar: () => acaoEncerradoItem(item, v, 'fn_vinculo_excluir') },
        ] });
    }));
}
async function acaoEncerradoItem(item, v, funcao) {
    const nome = v.partes?.nome || 'a parte';
    const excluir = funcao === 'fn_vinculo_excluir';
    const ok = excluir
        ? await perguntar({ titulo: 'Excluir vínculo?', impacto: `${nome} sai também do histórico da parte. Não dá para desfazer.`, destrutivo: true, rotuloConfirmar: 'Excluir vínculo' })
        : await perguntar({ titulo: 'Reativar?', impacto: `${nome} volta a este item.`, rotuloConfirmar: 'Reativar' });
    if (!ok) return;
    try {
        const { data, error } = await api.dbAuth.rpc(funcao, { p_papel_id: v.id });
        if (error) throw error;
        mostrarToast((data && data.mensagem) || (excluir ? 'Vínculo excluído.' : 'Vínculo reativado.'));
        await montarPartesItemControle(item);
        emitirEscrita('controle', { id: item.id, acao: 'editar-partes' });
    } catch (err) { mostrarToast('Erro: ' + (err.message || String(err)), 'erro'); }
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
            mostrarToast('Preencha a parte em todas as linhas.', 'erro');
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
        emitirEscrita('controle', { id: item.id, acao: 'editar-partes' }); // v1.32.0
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
// v1.43.0 — reserva, só se a chamada ao banco falhar; alinhada à fn_categoria_lancamento_do_item.
const CATEGORIA_DESPESA_POR_TIPO_ITEM = { seguro: 'seguro', manutencao: 'manutencao', tributo: 'tributo', despesa: 'tecnologia_assinaturas' };

// v1.43.0 — catálogo de tipos de item (tabela controle_tipos, demanda 2923ff4d).
let catalogoTiposControle = null;
let ativoControlesAtual = null; // ativo da ficha aberta: nome (título curto) e ramo (cor da linha dos grupos)
async function carregarCatalogoTiposControle() {
    if (catalogoTiposControle) return catalogoTiposControle;
    try {
        const { data, error } = await api.dbAuth.from('controle_tipos')
            .select('codigo,nome,ordem,icone,selecionavel_app,categoria_lancamento_padrao').eq('ativo', true).order('ordem');
        if (error) throw error;
        catalogoTiposControle = data || [];
        definirCatalogoTiposControle(catalogoTiposControle);
    } catch (err) { console.warn('[controles] catálogo de tipos:', err.message); catalogoTiposControle = null; }
    return catalogoTiposControle;
}
function popularComboTipoControle(selectId, tipoAtual, tiposPermitidos) {
    const sel = document.getElementById(selectId);
    if (!sel || !catalogoTiposControle?.length) return; // sem catálogo, fica o markup de reserva
    let lista = catalogoTiposControle.filter(t => t.selecionavel_app || t.codigo === tipoAtual);
    // v1.45.0 — nasce do ativo: só tipos com subtipo válido para ele (se a lista vier vazia, não filtra)
    if (tiposPermitidos && tiposPermitidos.size) { const f = lista.filter(t => tiposPermitidos.has(t.codigo) || t.codigo === tipoAtual); if (f.length) lista = f; }
    sel.innerHTML = lista.map(t => `<option value="${escapeHtml(t.codigo)}">${escapeHtml(t.nome)}</option>`).join('');
}

export async function abrirNovoLancamentoDoItem() {
    const item = itemEmFoco;
    if (!item) return;
    if (typeof window.switchTab !== 'function' || typeof window.abrirNovaDespesa !== 'function') {
        mostrarToast('Abra pelo app principal.', 'erro');
        return;
    }
    const partes = await api.buscarPartesDoItemControle(item.id);
    let categoriaDoItem = null; // v1.43.0 — mesma regra da ocorrência (banco)
    try { const { data } = await api.dbAuth.rpc('fn_categoria_lancamento_do_item', { p_item: item.id }); categoriaDoItem = data || null; }
    catch (err) { console.warn('[controles] categoria do item:', err.message); }
    categoriaDoItem = categoriaDoItem || CATEGORIA_DESPESA_POR_TIPO_ITEM[item.tipo] || 'outro';
    window.switchTab('tab-saidas');
    window.abrirNovaDespesa(item.ativo_id || null, {
        descricao: item.titulo,
        categoria: categoriaDoItem,
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
    await carregarCatalogoTiposControle(); // v1.51.0 — rótulo do tipo ("Contas e cartões", não "conta") já na 1ª abertura
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
    // v1.49.0 (demanda a30da78b) — item aberto pelo card "Controles da empresa":
    // volta para ⚙️ › Minha empresa (a troca de aba remonta o card).
    if (origem === 'empresa-app' && typeof window.switchTab === 'function') {
        window.switchTab('tab-minha-empresa');
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
    const statusItem = item.ativo === false ? (item.situacao === 'pausado' ? statusHtml('warn', 'Pausado') : statusHtml('neu', 'Concluído')) // v1.20.0; v1.56.0 situação
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
        // v1.36.0 (demanda 854f6343) — definido pelo contrato vigente do imóvel
        ((item.responsavel_pagamento || ['tributo', 'taxa'].includes(item.tipo)) ? kv('Quem paga', escapeHtml(item.rateio
            ? (item.rateio.vago ? 'Proprietário · imóvel sem contrato' : item.responsavel_pagamento === 'locatario' ? 'Locatário (contrato) · sem saída no Financeiro' : 'Proprietário (contrato)')
            : ({ locatario: 'Locatário na vigência do contrato · sem saída no Financeiro nesse período', proprietario: 'Proprietário', condominio: 'Condomínio' }[item.responsavel_pagamento] || (item.responsavel_pagamento || 'Proprietário (padrão)')))) : '') +
        (item.valor_previsto ? kv('Valor previsto', `${moedaBR(item.valor_previsto)}${(item.parcelas || 1) > 1 ? ` · ${item.parcelas}× de ${moedaBR(item.valor_previsto / item.parcelas)}` : ''}`) : '') + // v1.20.0
        memoriaRateioHtml(item, kv);

    // v1.34.0 (demanda 4a609dbb) — clicar no alerta "documento pendente"
    // abria a ficha sem nenhum indicador de que falta o documento; esse
    // aviso hoje só existia na tela de Subtipos. Mesma condição do alerta
    // (fn_diario_cofre_documento_pendente): documento_esperado=true no
    // subtipo e nenhum documento vinculado ao item OU ao ativo dono dele.
    const avisoDoc = document.getElementById('fic-aviso-documento-pendente');
    if (avisoDoc) {
        const exigeDocumento = item.ativo !== false && item.alerta_ativo !== false && !!item.cofre_controle_subtipos?.documento_esperado;
        const temDocumento = documentosDoItemControle(item.id).length > 0 ||
            (item.ativo_id && (estado.documentos || []).some(d => (d.cofre_documento_vinculos || []).some(v => v.entidade_tipo === 'ativo' && v.entidade_id === item.ativo_id)));
        avisoDoc.classList.toggle('hidden', !(exigeDocumento && !temDocumento));
    }
    renderizarDocumentosItemControle();

    const elOc = document.getElementById('fic-ocorrencia');
    const elOcSt = document.getElementById('fic-ocorrencia-status');
    const abertas = ocorrencias.filter(o => o.status_execucao === 'aberto').length;
    if (elOcSt) elOcSt.innerHTML = ocorrencias.length ? `<span class="rz-sub">${abertas} em aberto · ${ocorrencias.length - abertas} concluída${ocorrencias.length - abertas === 1 ? '' : 's'}</span>` : '';
    if (!ocorrencias.length) {
        elOc.innerHTML = `<div class="rz-empty"><div class="rz-ic"><i data-lucide="calendar-check"></i></div><p>Nenhuma ocorrência gerada ainda.</p></div>`;
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
            // v1.50.0 — o valor saiu do título (cortava no celular) e abre a linha de baixo. Cartão (F18): a
            // ocorrência ligada à fatura diz "Fatura importada/paga"; sem fatura, "Esperando a fatura".
            const valorOc = oc.valor_real ?? oc.valor_previsto;
            const daFatura = oc.origem === 'fatura' && !!oc.origem_id;
            let textoOc = oc.tratamento_descricao ? escapeHtml(oc.tratamento_descricao) : (aberta ? (oc.descricao ? escapeHtml(oc.descricao.replace(/\n+/g, ' · ')) : 'Toque pra tratar ou reagendar') : rotuloStatusOcorrencia(oc.status_execucao));
            if (daFatura) textoOc = aberta ? 'Fatura importada · toque para abrir' : 'Fatura paga · toque para abrir';
            else if (aberta && ehItemCartao(item)) textoOc = 'Esperando a fatura';
            const prefixoOc = aberta ? 'Vence ' : (oc.status_execucao === 'concluido' ? (daFatura ? 'Paga · ' : 'Tratada · ') : '');
            return `<div class="rz-row rz-link" data-action="abrir-acoes-ocorrencia" data-id="${oc.id}">
                <div class="rz-ic${cls}"><i data-lucide="${ic}"></i></div>
                <div class="rz-tx"><b>${prefixoOc}${formatarDataBR(oc.data_prevista_atual)}</b><span>${valorOc ? `${moedaBR(valorOc)} · ` : ''}${textoOc}</span></div>
                <div class="rz-rt">${statusHtml(sem, rot)}</div>
                <i data-lucide="ellipsis-vertical" class="rz-chev"></i>
            </div>`;
        }).join('');
    }

    montarPartesItemControle(item);
    montarCardGrupo(item); // v1.52.0 — F13.10

    // ---- Box Alertas vinculados: REMOVIDO (v6) — a própria ocorrência
    // (acima) já É o alerta; não existe mais cadastro de alerta avulso.
    // ---- Box Contatos vinculados: REMOVIDO (E14.4, "A5") — unificado
    // com Partes, ver comentário em montarPartesItemControle().

    refrescarIcones();
}

// ============================================================================
// v1.52.0 — F13.10 · RATEIO EM GRUPO (card do item, abrir, participantes, fechar, reabrir)
// O card é o mesmo componente da página do link (grupo-visao.js). Tudo passa pelas funções fn_grupo_* do banco.
// ============================================================================
let grupoDados = null;
const grupoEsc = (t) => escapeHtml(String(t ?? ''));
async function rpcGrupo(fn, args) {
    const { data, error } = await api.dbAuth.rpc(fn, args);
    if (error) return { ok: false, mensagem: error.message };
    return data || { ok: false, mensagem: 'Sem resposta do banco.' };
}
function grupoLink(token) { return `${location.origin}/grupo.html#t=${token}`; }
function garantirContainerGrupo() {
    let el = document.getElementById('fic-grupo');
    if (el) return el;
    const oc = document.getElementById('fic-ocorrencia')?.closest('.rz-card');
    if (!oc) return null;
    el = document.createElement('div'); el.id = 'fic-grupo'; el.className = 'rz-card';
    oc.parentNode.insertBefore(el, oc);
    return el;
}
async function montarCardGrupo(item) {
    const el = garantirContainerGrupo(); if (!el) return;
    if (!item?.grupo_status) { el.hidden = true; el.innerHTML = ''; grupoDados = null; return; }
    el.hidden = false;
    el.innerHTML = `<div class="rz-card-h"><h3>Rateio em grupo</h3><button type="button" class="rz-more" data-grupo-menu aria-label="Ações do rateio"><i data-lucide="ellipsis-vertical"></i></button></div><div data-grupo-corpo><p class="rz-desc">Carregando…</p></div>`;
    el.querySelector('[data-grupo-menu]').addEventListener('click', () => abrirAcoesGrupo(item));
    refrescarIcones();
    const r = await rpcGrupo('fn_grupo_visao', { p_item_id: item.id });
    const corpo = el.querySelector('[data-grupo-corpo]');
    if (!r.ok) { corpo.innerHTML = `<p class="rz-desc">Não foi possível carregar o rateio: ${grupoEsc(r.mensagem)}</p>`; return; }
    grupoDados = r.dados;
    const categorias = await categoriasSaidaGrupo().catch(() => []);
    montarGrupoVisao(corpo, {
        dados: r.dados, modo: 'app', eu: null, categorias,
        acoes: {
            lancar: (d) => rpcGrupo('fn_grupo_lancar', { p_item_id: item.id, p_dados: d }),
            cancelar: (id, motivo) => rpcGrupo('fn_grupo_cancelar', { p_lancamento_id: id, p_motivo: motivo }),
        },
        aoMudar: () => montarCardGrupo(item),
    });
}
function abrirAcoesGrupo(item) {
    if (!grupoDados) return;
    const aberto = grupoDados.status === 'aberto';
    sheetAcoes({ titulo: 'Rateio em grupo', sub: `${(grupoDados.participantes || []).length} pessoas · ${moedaBR(grupoDados.total || 0)}`, acoes: aberto ? [
        { icone: 'link', titulo: 'Participantes e links', sub: 'Links, incluir ou tirar', aoTocar: () => abrirParticipantesGrupo(item) },
        { icone: 'check-check', titulo: 'Fechar o rateio', codigo: 'grupos.gerenciar', sub: 'Leva as partes ao Financeiro', aoTocar: () => abrirFecharRateio(item) },
    ] : [
        { icone: 'rotate-ccw', titulo: 'Reabrir o rateio', codigo: 'grupos.gerenciar', sub: 'Tira do Financeiro', aoTocar: () => reabrirRateio(item) },
    ] });
}
function enviarLinkGrupo(item, p, link) {
    const tel = String(link.telefone || '').replace(/\D/g, '');
    const txt = `Oi, ${String(p.nome || '').split(' ')[0]}! Este é o seu link do rateio "${item.titulo}" no Raiz: ${grupoLink(link.token)}\nPara entrar, confirme o seu celular. Lá você vê o balanço e lança o que pagou.`;
    window.open(`https://wa.me/${tel}?text=${encodeURIComponent(txt)}`, '_blank', 'noopener');
}
async function copiarLinkGrupo(link) {
    try { await navigator.clipboard.writeText(grupoLink(link.token)); mostrarToast('Link copiado.', 'sucesso'); }
    catch (e) { mostrarToast('Não consegui copiar. Link: ' + grupoLink(link.token), 'info'); }
}
function abrirParticipantesGrupo(item) {
    const d = grupoDados; if (!d) return;
    const links = Object.fromEntries((d.links || []).map(l => [l.participante_id, l]));
    sheetAcoes({ titulo: 'Participantes e links', sub: `${(d.participantes || []).length} de 10 · cada um pelo link`, acoes: [
        ...(d.participantes || []).map(p => ({ icone: p.do_raiz ? 'user' : 'user-round', titulo: p.nome, sub: links[p.id]?.telefone ? `+${links[p.id].telefone}${p.do_raiz ? ' · do Raiz' : ''}` : 'sem celular: não abre o link',
            aoTocar: () => sheetAcoes({ titulo: p.nome, sub: 'Link pessoal do rateio', acoes: [
                ...(links[p.id]?.telefone ? [{ icone: 'send', titulo: 'Enviar pelo WhatsApp', sub: 'Pelo WhatsApp', aoTocar: () => enviarLinkGrupo(item, p, links[p.id]) }] : []),
                { icone: 'copy', titulo: 'Copiar link', aoTocar: () => copiarLinkGrupo(links[p.id]) },
                { icone: 'user-minus', titulo: 'Tirar do rateio', codigo: 'grupos.gerenciar', tipo: 'bad', sub: 'Só quem não tem lançamento', aoTocar: async () => {
                    const r = await rpcGrupo('fn_grupo_participante_remover', { p_item_id: item.id, p_participante_id: p.id });
                    mostrarToast(r.mensagem || '', r.ok ? 'sucesso' : 'erro'); if (r.ok) montarCardGrupo(item);
                } },
            ] }) })),
        ...((d.participantes || []).length < 10 ? [{ icone: 'user-plus', titulo: 'Incluir participante', codigo: 'grupos.gerenciar', sub: 'Do Raiz ou de fora', aoTocar: () => incluirParticipanteGrupo(item) }] : []),
    ] });
}
async function pessoasDaEmpresaGrupo() {
    const { data } = await api.dbAuth.from('pessoas').select('id, nome, whatsapp').eq('cliente_id', clienteIdDisponivel()).order('nome');
    return data || [];
}
function linhaExternoGrupo(k) {
    return `<div class="rz-row" data-gx="${k}" style="gap:8px;padding:8px 0"><input type="text" data-gx-nome placeholder="Nome" aria-label="Nome" style="flex:1;min-width:0;height:44px;padding:0 10px;border:1.5px solid var(--line);border-radius:var(--r-ctl);font:inherit;font-size:16px">
        <input type="tel" data-gx-tel placeholder="Celular com DDD" aria-label="Celular" style="width:150px;height:44px;padding:0 10px;border:1.5px solid var(--line);border-radius:var(--r-ctl);font:inherit;font-size:16px"></div>`;
}
async function incluirParticipanteGrupo(item) {
    const v = await escolher({ titulo: 'Incluir participante', opcoes: [
        { valor: 'raiz', titulo: 'Pessoa do Raiz', sub: 'Pessoas da empresa', icone: 'user' },
        { valor: 'fora', titulo: 'Pessoa de fora', sub: 'Só nome e celular', icone: 'user-round' }] });
    if (!v) return;
    let part = null;
    if (v === 'raiz') {
        const ja = new Set((grupoDados?.links || []).map(l => l.pessoa_id).filter(Boolean));
        const pes = (await pessoasDaEmpresaGrupo()).filter(p => !ja.has(p.id));
        if (!pes.length) { mostrarToast('Todos já estão no rateio.', 'info'); return; }
        const id = await escolher({ titulo: 'Pessoa do Raiz', opcoes: pes.map(p => ({ valor: p.id, titulo: p.nome, sub: p.whatsapp || 'sem celular no cadastro', icone: 'user' })) });
        if (!id) return; part = { pessoa_id: id };
        await gravarParticipanteGrupo(item, part);
    } else {
        const sheet = window.abrirSheet(window.rzSheetCabecalho('Pessoa de fora', 'O link dela só abre com este celular') + `<div class="rz-sh-b">${linhaExternoGrupo(0)}</div>
            <div class="rz-sh-f"><button type="button" class="rz-btn rz-btn-2" data-gx-cancelar>Cancelar</button><button type="button" class="rz-btn rz-btn-1" data-gx-ok>Incluir</button></div>`);
        sheet.querySelector('[data-gx-cancelar]').addEventListener('click', () => window.fecharSheet());
        sheet.querySelector('[data-gx-ok]').addEventListener('click', async () => {
            part = { nome: sheet.querySelector('[data-gx-nome]').value.trim(), telefone: sheet.querySelector('[data-gx-tel]').value.trim() };
            window.fecharSheet(); await gravarParticipanteGrupo(item, part);
        });
    }
}
async function gravarParticipanteGrupo(item, part) {
    const r = await rpcGrupo('fn_grupo_participante_incluir', { p_item_id: item.id, p_participante: part });
    mostrarToast(r.mensagem || '', r.ok ? 'sucesso' : 'erro');
    if (r.ok) { await montarCardGrupo(item); abrirParticipantesGrupo(item); }
}
export async function abrirNovoRateio(item) {
    item = item || itemEmFoco; if (!item || typeof window.abrirSheet !== 'function') return;
    const pes = await pessoasDaEmpresaGrupo();
    const sheet = window.abrirSheet(window.rzSheetCabecalho('Abrir rateio', item.titulo) + `<div class="rz-sh-b">
        <p class="rz-desc" style="margin:0 0 8px">Cada pessoa recebe o próprio link e entra com o celular. Até 10 pessoas. Enquanto o rateio está aberto, nada vai para o financeiro.</p>
        <div class="rz-group">Pessoas do Raiz</div><div class="rz-card rz-list">${pes.map(p => `<label class="rz-row" style="gap:10px;cursor:pointer"><input type="checkbox" data-gp="${p.id}" style="width:22px;height:22px;flex:none"><div class="rz-tx"><b>${grupoEsc(p.nome)}</b><span>${grupoEsc(p.whatsapp || 'sem celular: usa só o app')}</span></div></label>`).join('') || '<p class="rz-desc" style="padding:10px">Nenhuma pessoa cadastrada.</p>'}</div>
        <div class="rz-group">Pessoas de fora</div><div data-gx-lista>${linhaExternoGrupo(0)}</div>
        <button type="button" class="rz-act" data-gx-mais><div class="rz-ic"><i data-lucide="user-plus"></i></div><div>Mais uma pessoa de fora<small>Nome e celular com DDD</small></div></button>
        <p class="rz-desc" data-gp-conta style="margin-top:8px"></p>
    </div><div class="rz-sh-f"><button type="button" class="rz-btn rz-btn-2" data-gp-cancelar>Cancelar</button><button type="button" class="rz-btn rz-btn-1" data-gp-ok>Abrir rateio</button></div>`);
    let k = 1;
    const coletar = () => {
        const lista = [...sheet.querySelectorAll('[data-gp]:checked')].map(c => ({ pessoa_id: c.dataset.gp }));
        sheet.querySelectorAll('[data-gx]').forEach(r => { const nome = r.querySelector('[data-gx-nome]').value.trim(), tel = r.querySelector('[data-gx-tel]').value.trim(); if (nome || tel) lista.push({ nome, telefone: tel }); });
        return lista;
    };
    const contar = () => { const n = coletar().length; sheet.querySelector('[data-gp-conta]').textContent = `${n} de 10 pessoas`; sheet.querySelector('[data-gp-ok]').disabled = n < 2 || n > 10; };
    sheet.addEventListener('input', contar); sheet.addEventListener('change', contar);
    sheet.querySelector('[data-gx-mais]').addEventListener('click', () => { sheet.querySelector('[data-gx-lista]').insertAdjacentHTML('beforeend', linhaExternoGrupo(k++)); contar(); });
    sheet.querySelector('[data-gp-cancelar]').addEventListener('click', () => window.fecharSheet());
    sheet.querySelector('[data-gp-ok]').addEventListener('click', async (ev) => {
        ev.currentTarget.disabled = true;
        const r = await rpcGrupo('fn_grupo_abrir', { p_item_id: item.id, p_participantes: coletar() });
        if (!r.ok) { mostrarToast(r.mensagem || 'Não foi possível abrir o rateio.', 'erro'); ev.currentTarget.disabled = false; return; }
        window.fecharSheet(); mostrarToast(r.mensagem || 'Rateio aberto.', 'sucesso');
        emitirEscrita('item_controle', { id: item.id, acao: 'rateio_abrir' });
        await recarregarFichaItemControle();
        abrirParticipantesGrupo(itemEmFoco);
    });
    refrescarIcones(); contar();
}
let grupoCatCache = null;
async function categoriasSaidaGrupo() {
    if (grupoCatCache) return grupoCatCache;
    const { data } = await api.dbAuth.from('lancamento_categorias').select('codigo, nome, categoria_pai, ordem').eq('direcao', 'saida').eq('ativo', true).order('ordem');
    const pais = new Set((data || []).map(c => c.categoria_pai).filter(Boolean));
    const nomePai = Object.fromEntries((data || []).map(c => [c.codigo, c.nome]));
    grupoCatCache = (data || []).filter(c => !pais.has(c.codigo) && !['pagamento_grupo', 'acerto_entre_pessoas', 'repasse_socio'].includes(c.codigo))
        .map(c => ({ codigo: c.codigo, nome: c.categoria_pai ? `${nomePai[c.categoria_pai] || ''} › ${c.nome}` : c.nome }));
    return grupoCatCache;
}
async function contasParaGrupo() {
    const { data } = await api.dbAuth.rpc('fn_contas_listar', { p_cliente_id: clienteIdDisponivel() });
    let lista = Array.isArray(data?.dados) ? data.dados : [];
    if (!lista.length) { const r = await api.dbAuth.from('conta_controle').select('id, nome, tipo, titular_tipo, pessoa_id, situacao, padrao').eq('cliente_id', clienteIdDisponivel()); lista = r.data || []; }
    return lista.filter(c => c && c.id && c.tipo !== 'cartao_credito' && (c.situacao || 'ativa') === 'ativa');
}
export async function abrirFecharRateio(item) {
    item = item || itemEmFoco; const d = grupoDados; if (!item || !d || typeof window.abrirSheet !== 'function') return;
    const comSaldo = (d.participantes || []).filter(p => Math.abs(Number(p.saldo) || 0) > 0.009);
    if (comSaldo.length) { mostrarToast(`Há saldo com ${comSaldo.length}. Acerte antes de fechar.`, 'erro'); return; }
    const [cats, contas] = await Promise.all([categoriasSaidaGrupo(), contasParaGrupo()]);
    const pessoaDe = Object.fromEntries((d.links || []).map(l => [l.participante_id, l.pessoa_id]));
    const raiz = (d.participantes || []).filter(p => p.do_raiz);
    // parte de cada pessoa do Raiz por categoria sugerida (despesas não canceladas)
    const porPessoa = raiz.map(p => {
        const mapa = {};
        (d.lancamentos || []).filter(l => l.tipo === 'despesa' && !l.cancelado).forEach(l => {
            const it = (l.divisao?.itens || []).find(x => x.participante_id === p.id); if (!it) return;
            const k = l.categoria_sugerida || ''; mapa[k] = Math.round(((mapa[k] || 0) + Number(it.valor)) * 100) / 100;
        });
        const pid = pessoaDe[p.id];
        const conta = contas.find(c => c.titular_tipo === 'pessoa' && c.pessoa_id === pid) || contas.find(c => c.padrao) || contas[0];
        return { p, pid, conta: conta?.id || '', levar: Number(p.parte) > 0, itens: Object.entries(mapa).map(([cat, valor]) => ({ cat, valor })) };
    });
    const hoje = new Date(); const hojeISO = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
    const est = 'height:44px;padding:0 8px;border:1.5px solid var(--line);border-radius:var(--r-ctl);font:inherit;font-size:15px;background:var(--card);color:var(--ink)';
    const opCat = (sel) => `<option value="">— escolha a categoria —</option>` + cats.map(c => `<option value="${c.codigo}"${c.codigo === sel ? ' selected' : ''}>${grupoEsc(c.nome)}</option>`).join('');
    const opConta = (sel) => contas.map(c => `<option value="${c.id}"${c.id === sel ? ' selected' : ''}>${grupoEsc(c.nome)}</option>`).join('');
    const sheet = window.abrirSheet(window.rzSheetCabecalho('Fechar o rateio', `${item.titulo} · ${moedaBR(d.total || 0)}`) + `<div class="rz-sh-b" data-fr-corpo></div>
        <div class="rz-sh-f"><button type="button" class="rz-btn rz-btn-2" data-fr-cancelar>Cancelar</button><button type="button" class="rz-btn rz-btn-1" data-fr-ok>Fechar o rateio</button></div>`);
    const corpo = sheet.querySelector('[data-fr-corpo]');
    const soma = (x) => Math.round(x.itens.reduce((t, i) => t + (Number(i.valor) || 0), 0) * 100) / 100;
    const desenhar = () => {
        corpo.innerHTML = `<p class="rz-desc" style="margin:0 0 8px">Os saldos estão zerados. Para cada pessoa do Raiz, a parte dela vira despesa no financeiro, na conta e nas categorias abaixo. Quem é de fora não entra no financeiro; o histórico fica no rateio. Os links param de abrir.</p>
            <div class="rz-f"><label>Data dos lançamentos</label><input type="date" data-fr-data value="${hojeISO}" style="${est};width:100%"></div>` +
            (porPessoa.length ? porPessoa.map((x, i) => `<div class="rz-card" style="padding:12px 14px;margin:10px 0">
                <label style="display:flex;align-items:center;gap:10px;font-weight:600"><input type="checkbox" data-fr-levar="${i}"${x.levar ? ' checked' : ''} style="width:22px;height:22px">${grupoEsc(x.p.nome)} · parte ${moedaBR(x.p.parte)}</label>
                ${x.levar ? `<div class="rz-f"><label>Conta</label><select data-fr-conta="${i}" style="${est};width:100%">${opConta(x.conta)}</select></div>
                ${x.itens.map((it, j) => `<div style="display:flex;gap:6px;margin-top:6px"><select data-fr-cat="${i}:${j}" style="${est};flex:1;min-width:0">${opCat(it.cat)}</select><input type="number" step="0.01" min="0" inputmode="decimal" data-fr-val="${i}:${j}" value="${it.valor}" style="${est};width:110px;text-align:right"></div>`).join('')}
                <button type="button" class="rz-btn rz-btn-3" data-fr-mais="${i}" style="height:36px;margin-top:4px">+ outra categoria</button>
                <p class="rz-desc" style="margin:4px 0 0;color:${Math.abs(soma(x) - Number(x.p.parte)) < 0.01 ? 'var(--muted)' : 'var(--danger)'}">Soma ${moedaBR(soma(x))} de ${moedaBR(x.p.parte)}</p>` : '<p class="rz-desc" style="margin:4px 0 0">Não vai ao financeiro.</p>'}
            </div>`).join('') : '<p class="rz-desc">Ninguém do Raiz no rateio.</p>');
        corpo.querySelectorAll('[data-fr-levar]').forEach(c => c.addEventListener('change', () => { porPessoa[Number(c.dataset.frLevar)].levar = c.checked; desenhar(); }));
        corpo.querySelectorAll('[data-fr-conta]').forEach(c => c.addEventListener('change', () => { porPessoa[Number(c.dataset.frConta)].conta = c.value; }));
        corpo.querySelectorAll('[data-fr-cat]').forEach(c => c.addEventListener('change', () => { const [i, j] = c.dataset.frCat.split(':').map(Number); porPessoa[i].itens[j].cat = c.value; }));
        corpo.querySelectorAll('[data-fr-val]').forEach(c => c.addEventListener('change', () => { const [i, j] = c.dataset.frVal.split(':').map(Number); porPessoa[i].itens[j].valor = Number(String(c.value).replace(',', '.')) || 0; desenhar(); }));
        corpo.querySelectorAll('[data-fr-mais]').forEach(b => b.addEventListener('click', () => { porPessoa[Number(b.dataset.frMais)].itens.push({ cat: '', valor: 0 }); desenhar(); }));
    };
    desenhar();
    sheet.querySelector('[data-fr-cancelar]').addEventListener('click', () => window.fecharSheet());
    sheet.querySelector('[data-fr-ok]').addEventListener('click', async (ev) => {
        const errado = porPessoa.find(x => x.levar && (Math.abs(soma(x) - Number(x.p.parte)) >= 0.01 || !x.conta || x.itens.some(i => Number(i.valor) > 0 && !i.cat)));
        if (errado) { mostrarToast(`Confira ${errado.p.nome}: soma, conta e categoria.`, 'erro'); return; }
        ev.currentTarget.disabled = true;
        const registros = porPessoa.filter(x => x.levar && Number(x.p.parte) > 0).map(x => ({ pessoa_id: x.pid, conta_id: x.conta, itens: x.itens.filter(i => Number(i.valor) > 0).map(i => ({ categoria: i.cat, valor: Number(i.valor) })) }));
        const r = await rpcGrupo('fn_grupo_fechar', { p_item_id: item.id, p_registros: registros, p_data: corpo.querySelector('[data-fr-data]').value || null });
        if (!r.ok) { mostrarToast(r.mensagem || 'Não foi possível fechar.', 'erro'); ev.currentTarget.disabled = false; return; }
        window.fecharSheet(); mostrarToast(r.mensagem || 'Rateio fechado.', 'sucesso');
        emitirEscrita('lancamento', { origem: 'rateio', item: item.id, acao: 'fechar' });
        await recarregarFichaItemControle();
    });
}
async function reabrirRateio(item) {
    item = item || itemEmFoco; if (!item || typeof window.abrirSheet !== 'function') return;
    const sheet = window.abrirSheet(window.rzSheetCabecalho('Reabrir o rateio', item.titulo) + `<div class="rz-sh-b">
        <p class="rz-desc" style="margin:0 0 8px">Os lançamentos que o fechamento levou ao financeiro saem, e os links voltam a abrir. Não dá se algum deles já foi conciliado.</p>
        <div class="rz-f"><label>Motivo</label><input type="text" data-rr-motivo style="width:100%;height:44px;padding:0 10px;border:1.5px solid var(--line);border-radius:var(--r-ctl);font:inherit;font-size:16px"></div></div>
        <div class="rz-sh-f"><button type="button" class="rz-btn rz-btn-2" data-rr-cancelar>Cancelar</button><button type="button" class="rz-btn rz-btn-1" data-rr-ok>Reabrir</button></div>`);
    sheet.querySelector('[data-rr-cancelar]').addEventListener('click', () => window.fecharSheet());
    sheet.querySelector('[data-rr-ok]').addEventListener('click', async () => {
        const motivo = sheet.querySelector('[data-rr-motivo]').value.trim();
        if (!motivo) { mostrarToast('Diga o motivo.', 'erro'); return; }
        const r = await rpcGrupo('fn_grupo_reabrir', { p_item_id: item.id, p_motivo: motivo });
        if (!r.ok) { mostrarToast(r.mensagem || 'Não foi possível reabrir.', 'erro'); return; }
        window.fecharSheet(); mostrarToast(r.mensagem || 'Rateio reaberto.', 'sucesso');
        emitirEscrita('lancamento', { origem: 'rateio', item: item.id, acao: 'reabrir' });
        await recarregarFichaItemControle();
    });
}

// v1.13.0 (fatia 3b-i, REGRAS §6) — os 3 painéis inline de "Mais ações"
// da ficha do item saíram. Dados → sheet (Excluir); Partes → sheet
// (Editar partes); Documentos/Contatos passaram a ter a ação nomeada
// direto no rodapé (sem "Mais ações"). Nomes antigos mantidos como alias.
function sheetAcoes(config) {
    if (typeof window.abrirSheetAcoes !== 'function') { mostrarToast('Abra pelo app principal.', 'erro'); return; }
    window.abrirSheetAcoes(config);
}
// v1.56.0 (fatia 1, máquina de status — FICHA_FATIA1_MAQUINA_STATUS_RAIZ v1.0.0) — o ⋮ do item mostra os verbos que a máquina
// permite a partir da situação (Ativo · Pausado · Concluído): Pausar, Retomar, Concluir e Reabrir passam pela porta única
// fn_status_transicionar (a mesma do bot), que grava status_historico e log. "Encerrar item" virou Concluir, com motivo.
export async function abrirAcoesDadosItem() {
    const item = itemEmFoco; if (!item) return;
    let maquina = null;
    try {
        const { data, error } = await api.dbAuth.rpc('fn_entidade_status', { p_entidade: 'item_controle', p_id: item.id, p_cliente_id: null });
        if (!error && Array.isArray(data?.acoes)) maquina = data.acoes;
    } catch (e) { console.warn('[cofre-controles] ações do item:', e?.message || e); }
    const ICONE = { pausar: 'pause', retomar: 'play', concluir: 'check', reabrir: 'rotate-ccw' };
    const SUB = { pausar: 'Para de gerar ocorrências e alertas; as vencidas ficam para tratar', retomar: 'Volta a gerar ocorrências a partir de hoje',
        concluir: 'Encerra o item com o motivo; o histórico fica em "Encerrados"', reabrir: 'Volta a gerar ocorrências e alertas' };
    const doCatalogo = (maquina || []).map(m => ({ icone: ICONE[m.acao] || 'circle-dot', titulo: m.rotulo + (m.acao === 'concluir' || m.acao === 'reabrir' ? ' item' : ''),
        codigo: m.codigo, sub: SUB[m.acao] || '', aoTocar: () => transicionarItemAtual(item, m) }));
    const ativoItem = (item.situacao || (item.ativo === false ? 'concluido' : 'ativo')) === 'ativo';
    sheetAcoes({ titulo: item.titulo, sub: rotuloTipoControle(item.tipo), acoes: [
        ...(ativoItem && !item.grupo_status ? [{ icone: 'users-round', titulo: 'Abrir rateio', codigo: 'grupos.gerenciar', sub: 'Dividir despesas por link', aoTocar: () => abrirNovoRateio(item) }] : []), // v1.52.0
        ...(item.grupo_status === 'fechado' ? [{ icone: 'rotate-ccw', titulo: 'Reabrir o rateio', codigo: 'grupos.gerenciar', sub: 'Tira do Financeiro', aoTocar: () => reabrirRateio(item) }] : []),
        ...(ativoItem ? [{ icone: 'pencil', titulo: 'Editar item', codigo: 'cofre.controles.editar', aoTocar: () => abrirEditarItem() }] : []),
        ...(maquina ? doCatalogo : (item.ativo === false ? [ // sem a máquina (falha de rede): o caminho de antes
            { icone: 'rotate-ccw', titulo: 'Reabrir item', codigo: 'cofre.controles.editar', sub: 'Volta a gerar alertas', aoTocar: () => reabrirItemControleAtual() },
        ] : [
            { icone: 'archive', titulo: 'Encerrar item', codigo: 'cofre.controles.desativar', aoTocar: () => encerrarItemControleAtual() },
        ])),
        { icone: 'trash-2', titulo: 'Excluir item de vez', codigo: 'cofre.controles.desativar', sub: 'Só sem ocorrência tratada', tipo: 'bad', aoTocar: () => excluirItemControleAtual() },
    ] });
}

// v1.56.0 — uma transição do item pela porta única; pede o motivo quando o catálogo exige
async function transicionarItemAtual(item, m) {
    const executar = async (motivo) => {
        const { data, error } = await api.dbAuth.rpc('fn_status_transicionar', { p_entidade: 'item_controle', p_id: item.id, p_acao: m.acao,
            p_dados: motivo ? { motivo } : {}, p_canal: 'app' });
        if (error) { mostrarToast(error.message || 'Não foi possível.', 'erro'); return false; }
        mostrarToast(m.acao === 'pausar' ? 'Item pausado.' : m.acao === 'retomar' ? 'Item retomado — as próximas ocorrências voltam a ser geradas.'
            : m.acao === 'concluir' ? 'Item concluído.' : 'Item reaberto.', 'sucesso');
        emitirEscrita('controle', { id: item.id, acao: m.acao });
        window.dispatchEvent(new CustomEvent('cofre:recarregar-eventos'));
        if (m.para === 'ativo') await recarregarFichaItemControle(); else voltarFichaItemControle();
        return true;
    };
    if (!m.exige_motivo) { await executar(null); return; }
    if (typeof window.abrirSheetForm !== 'function') { mostrarToast('Abra pelo app principal.', 'erro'); return; }
    window.abrirSheetForm({
        titulo: m.rotulo + ' ' + item.titulo, sub: rotuloTipoControle(item.tipo), rotuloSalvar: m.rotulo,
        corpo: `<div class="rz-f" style="margin-bottom:0"><label for="ic-trans-motivo">Motivo</label><input type="text" id="ic-trans-motivo" maxlength="200" placeholder="${m.acao === 'concluir' ? 'Ex.: apólice não renovada, vendido' : 'Ex.: lançado por engano'}"></div>`,
        aoSalvar: async () => {
            const motivo = (document.getElementById('ic-trans-motivo')?.value || '').trim();
            if (!motivo) { mostrarToast('Diga o motivo.', 'erro'); return false; }
            return executar(motivo);
        },
    });
}
// v1.33.0 (demanda 3cc64651, pedido explícito do Nicola 23/09/2026: "Ao
// clicar no menu 3 pontinhos da parte, nao aparece opcao adicionar parte.
// so editar... ao editar locatario ou parte ainda mostra tela de transicao")
// — o ⋮ tinha só "Editar partes", que abria o editor da LISTA de vínculos
// ("Editar partes do item", modal com "+ Adicionar parte" dentro): era a
// tela intermediária. Agora:
//   · "Adicionar parte" → formulário curto direto (qual parte + papel),
//     grava na hora (abrirAdicionarParteItem);
//   · editar os dados de uma parte = tocar na linha (já abria o form da
//     parte direto — cofre-app.js, case 'abrir-ficha-parte');
//   · "Remover parte" → escolhe qual e grava (abrirRemoverParteItem).
// abrirEditarPartesItem (editor de lista) continua exportada, fora do ⋮.
export async function abrirAcoesPartesItem() {
    const item = itemEmFoco; if (!item) return;
    const atuais = await api.buscarPartesDoItemControle(item.id);
    const acoes = [
        { icone: 'user-plus', titulo: 'Adicionar parte', codigo: 'cofre.controles.editar', sub: 'Quem responde por este item', aoTocar: () => abrirAdicionarParteItem() },
        { icone: 'receipt', titulo: 'Gerar despesa', codigo: 'saidas.registrar', sub: 'A parte como fornecedor', aoTocar: () => abrirNovoLancamentoDoItem() },
    ];
    if (atuais.length) {
        acoes.push({ icone: 'archive', titulo: 'Encerrar vínculo', codigo: 'cofre.controles.editar', sub: 'Fica no histórico da parte', aoTocar: () => abrirEncerrarParteItem(atuais) });
        acoes.push({ icone: 'user-minus', titulo: 'Excluir vínculo', codigo: 'cofre.controles.editar', tipo: 'bad', sub: 'O cadastro da parte fica', aoTocar: () => abrirRemoverParteItem(atuais) });
    };
    sheetAcoes({ titulo: 'Partes do item', sub: item.titulo, acoes });
}

// v1.33.0 — "Adicionar parte" direto: escolhe uma parte já cadastrada (ou
// cria uma nova só com o nome — mesmo criarParteRapida de antes) e o papel.
// Sem nenhuma parte ainda, a parte padrão do subtipo (E14.3 — prefeitura,
// órgão recolhedor) vem sugerida no topo da lista, como no editor antigo.
export async function abrirAdicionarParteItem() {
    const item = itemEmFoco; if (!item) return;
    if (typeof window.abrirSheetForm !== 'function') { mostrarToast('Disponível só dentro do app principal.', 'erro'); return; }
    if (partesClienteCache === null) partesClienteCache = await api.listarPartesCliente(estado.clienteId);
    const atuais = await api.buscarPartesDoItemControle(item.id);
    let padrao = null;
    if (!atuais.length && item.subtipo_id) {
        try { padrao = await api.resolverPartePadrao(item.subtipo_id, item.cofre_ativos?.codigo_ibge_municipio, item.cofre_ativos?.uf); } catch (_) { padrao = null; }
    }
    const optsPartes = [
        '<option value="">— escolher —</option>',
        padrao ? `<option value="__padrao__:${padrao.id}">★ ${escapeHtml(padrao.nome)} (sugerida)</option>` : '',
        ...(partesClienteCache || []).map(p => `<option value="${p.id}">${escapeHtml(p.nome)}</option>`),
        '<option value="__nova__">+ Cadastrar parte nova</option>',
    ].join('');
    const optsPapeis = PAPEIS_PARTE_ITEM.map(p => `<option value="${p.v}"${p.v === 'prestador' ? ' selected' : ''}>${escapeHtml(p.l)}</option>`).join('');
    window.abrirSheetForm({
        titulo: 'Adicionar parte',
        sub: item.titulo || '',
        rotuloSalvar: 'Adicionar',
        corpo: `
            <div class="rz-f"><label for="pia-parte">Parte <i>*</i></label><select id="pia-parte" onchange="window.__piaMudarParte(this.value)">${optsPartes}</select></div>
            <div class="rz-f hidden" id="pia-wrap-nome"><label for="pia-nome">Nome da parte nova <i>*</i></label><input type="text" id="pia-nome" placeholder="Os demais dados você completa tocando na parte"></div>
            <div class="rz-f"><label for="pia-papel">Papel neste item</label><select id="pia-papel">${optsPapeis}</select></div>`,
        aoSalvar: async (el) => {
            const escolha = el.querySelector('#pia-parte')?.value || '';
            const papel = el.querySelector('#pia-papel')?.value || 'prestador';
            const nomeNovo = (el.querySelector('#pia-nome')?.value || '').trim();
            if (!escolha) { mostrarToast('Escolha a parte.', 'erro'); return false; }
            if (escolha === '__nova__' && !nomeNovo) { mostrarToast('Informe o nome da parte nova.', 'erro'); return false; }
            try {
                let parteId = escolha;
                if (escolha === '__nova__') {
                    const { data: novaParte, error } = await api.criarParteRapida(estado.clienteId, nomeNovo);
                    if (error) throw error;
                    parteId = novaParte.id;
                    partesClienteCache = null;
                } else if (escolha.startsWith('__padrao__:')) {
                    parteId = await api.materializarPartePadrao(estado.clienteId, escolha.slice('__padrao__:'.length));
                    partesClienteCache = null;
                }
                const linhas = atuais.map(l => ({ parte_id: l.parte_id, papel: l.papel }));
                if (linhas.some(l => l.parte_id === parteId && l.papel === papel)) { mostrarToast('Essa parte já tem esse papel no item.', 'erro'); return false; }
                linhas.push({ parte_id: parteId, papel });
                await api.salvarPartesItemControle(item.id, linhas);
                mostrarToast('Parte adicionada.');
                await montarPartesItemControle(item);
                emitirEscrita('controle', { id: item.id, acao: 'editar-partes' });
                return true;
            } catch (err) {
                mostrarToast('Erro ao adicionar: ' + (err.message || String(err)), 'erro');
                return false;
            }
        },
    });
}
window.__piaMudarParte = (valor) => {
    const wrap = document.getElementById('pia-wrap-nome');
    if (wrap) wrap.classList.toggle('hidden', valor !== '__nova__');
    const papel = document.getElementById('pia-papel');
    if (papel && String(valor).startsWith('__padrao__:')) papel.value = 'orgao_recolhedor'; // mesma regra do editor antigo (__piUsarPartePadrao)
};

// v1.33.0 — "Remover parte": escolher qual tira o vínculo e grava na hora
// (o toque na parte é a confirmação; o cadastro da parte não é apagado).
export function abrirRemoverParteItem(atuais) {
    const item = itemEmFoco; if (!item || !atuais?.length) return;
    sheetAcoes({ titulo: 'Excluir qual vínculo?', sub: item.titulo, acoes: atuais.map((l, i) => ({
        icone: 'user-minus', tipo: 'bad', titulo: l.nome || 'Parte', sub: rotuloPapelParteItem(l.papel),
        aoTocar: async () => {
            try {
                await api.salvarPartesItemControle(item.id, atuais.filter((_, j) => j !== i).map(x => ({ parte_id: x.parte_id, papel: x.papel })));
                mostrarToast('Parte removida do item.');
                await montarPartesItemControle(item);
                emitirEscrita('controle', { id: item.id, acao: 'editar-partes' });
            } catch (err) { mostrarToast('Erro ao remover: ' + (err.message || String(err)), 'erro'); }
        },
    })) });
}
// v1.47.0 (demanda b94ef7d5) — "Encerrar vínculo": troca real (ex.: síndico ou seguradora
// substituídos). A parte sai do item e o vínculo fica no histórico dela (fn_vinculo_encerrar).
export function abrirEncerrarParteItem(atuais) {
    const item = itemEmFoco; if (!item || !atuais?.length) return;
    sheetAcoes({ titulo: 'Encerrar qual vínculo?', sub: item.titulo, acoes: atuais.map(l => ({
        icone: 'archive', titulo: l.nome || 'Parte', sub: rotuloPapelParteItem(l.papel),
        aoTocar: async () => {
            if (!await perguntar({ titulo: 'Encerrar vínculo?', impacto: `${l.nome || 'A parte'} sai deste item e o vínculo fica no histórico da parte.`, rotuloConfirmar: 'Encerrar vínculo' })) return;
            try {
                const { data, error } = await api.dbAuth.rpc('fn_vinculo_encerrar', { p_papel_id: l.id });
                if (error) throw error;
                mostrarToast((data && data.mensagem) || 'Vínculo encerrado.');
                await montarPartesItemControle(item);
                emitirEscrita('controle', { id: item.id, acao: 'editar-partes' });
            } catch (err) { mostrarToast('Erro ao encerrar: ' + (err.message || String(err)), 'erro'); }
        },
    })) });
}
export function abrirAcoesDocsItem() {
    sheetAcoes({ titulo: 'Documentos do item', sub: itemEmFoco?.titulo || '', acoes: [
        { icone: 'upload', titulo: 'Carregar documento', codigo: 'cofre.upload', sub: 'Apólice, guia ou laudo', tipo: 'ia', aoTocar: () => carregarNovoDocumentoItem() },
    ] });
}
// E14.4 — abrirAcoesContatosItem/alternarMaisAcoesContatosItem
// removidas (Contatos unificado com Partes). v1.33.0 — "Adicionar parte"
// saiu de dentro de "Editar partes" e virou ação direta do ⋮ (acima).
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
            <div class="rz-tx rz-link" data-action="abrir-documento" data-id="${d.id}"><b>${escapeHtml(d.nome_exibicao || 'Documento')}</b><span>${d.origem === 'bot_whatsapp' ? 'Pela Raiz IA' : 'Documento'}${d.criado_em ? ' · ' + formatarDataBR(String(d.criado_em).slice(0, 10)) : ''}</span></div>
            <button type="button" data-action="excluir-documento-do-item" data-vinculo-id="${vinculo?.id || ''}" title="Remover deste item" class="rz-ico-btn" style="width:36px;height:36px"><i data-lucide="x" style="width:16px;height:16px;color:var(--muted)"></i></button>
        </div>`;
    }).join('') : `<div class="rz-empty"><div class="rz-ic"><i data-lucide="file-plus-2"></i></div><p>Nenhum documento vinculado.</p></div>`;
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
    // v1.42.0 (F0.2b) — desvincular é reversível: sem pergunta, com "Desfazer" no aviso.
    const item = itemEmFoco;
    try {
        const linhaAntes = await api.lerVinculo(vinculoId);
        await api.removerVinculo(vinculoId);
        estado.documentos = await api.listarDocumentos(estado.clienteId);
        renderizarDocumentosItemControle();
        avisarComDesfazer('Documento desvinculado do item. Ele continua no Cofre.', async () => {
            try {
                await api.restaurarVinculo(linhaAntes);
                estado.documentos = await api.listarDocumentos(estado.clienteId);
                renderizarDocumentosItemControle();
                window.dispatchEvent(new CustomEvent('cofre:recarregar-documentos'));
                mostrarToast('Documento de volta ao item.');
            } catch (e) { mostrarToast('Não consegui desfazer: ' + e.message, 'erro'); }
        });
        window.dispatchEvent(new CustomEvent('cofre:recarregar-documentos'));
        emitirEscrita('controle', { id: item?.id, acao: 'excluir-documento' }); // v1.32.0
    } catch (err) { mostrarToast('Erro: ' + err.message, 'erro'); }
}

// v1.13.0 (fatia 3b-i, REGRAS §3/§15) — o par "Tratar | Reagendar" por
// linha e os 3 formulários inline saíram. Toque na ocorrência abre um
// SHEET DE AÇÕES (Dar baixa · Reagendar · Estornar conforme o status);
// cada ação abre um SHEET DE FORMULÁRIO (abrirSheetForm) com os MESMOS
// ids de campo de antes (#oc-tratar-descricao, #oc-reagendar-data), então
// confirmarTratar/Reagendar/EstornarOcorrencia continuam iguais.
// v1.53.0 — só se exclui o que foi criado à mão (app, Gestão, Claude, IA, documento) e ainda não foi concluído;
// o que a frequência/parcela/fatura/histórico do contrato gera se cancela (a regra recriaria a excluída).
const OC_ORIGENS_GERADAS = ['regra', 'parcelamento', 'fatura', 'historico_contrato'];
export function ocorrenciaPodeExcluir(oc) {
    return !!oc && oc.status_execucao !== 'concluido' && oc.tipo !== 'grupo_rateio' && !OC_ORIGENS_GERADAS.includes(oc.origem);
}
function ocorrenciaPorId(id) {
    return (itemEmFoco?.cofre_ocorrencias_controle || []).find(o => o.id === id);
}
export async function abrirAcoesOcorrencia(ocorrenciaId) {
    const oc = ocorrenciaPorId(ocorrenciaId);
    if (!oc) return;
    if (oc.tipo === 'grupo_rateio') { // v1.52.0 — F13.10: a ocorrência do rateio se trata pelo card
        document.getElementById('fic-grupo')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
        mostrarToast(oc.status_execucao === 'aberto' ? 'Este é o rateio do item: lance, quite e feche pelo card "Rateio em grupo".' : 'Rateio fechado. Para mudar, use "Reabrir o rateio" no ⋮ do item.', 'info');
        return;
    }
    const acoes = [];
    const item = itemEmFoco;
    const lanc = (oc.origem === 'fatura' && oc.origem_id) ? null : await lancamentoDaOcorrencia(oc.id); // v1.50.0 — atalho e detalhe
    // v1.50.0 (F18) — ocorrência do cartão ligada à fatura: abre a fatura. A baixa e o estorno dela vêm do pagamento
    // da fatura (fn_fatura_pagar_interna / estorno da conciliação), então "Dar baixa" e "Estornar" não aparecem aqui.
    if (oc.origem === 'fatura' && oc.origem_id) {
        acoes.push({ icone: 'credit-card', titulo: 'Abrir fatura', sub: `${(oc.valor_real ?? oc.valor_previsto) ? moedaBR(oc.valor_real ?? oc.valor_previsto) + ' · ' : ''}no Financeiro`,
            aoTocar: () => abrirFaturaDaOcorrencia(oc.origem_id) });
        abrirSheetOcorrencia(oc, null, acoes, `Fatura · vence ${formatarDataBR(oc.data_prevista_atual)}`);
        return;
    }
    if (oc.status_execucao === 'aberto' && ehItemCartao(item)) {
        acoes.push({ icone: 'file-up', tipo: 'ia', titulo: 'Importar fatura', codigo: 'cartao.importar', sub: 'PDF ou foto', aoTocar: () => importarFaturaDoItem(item) });
    }
    // v1.50.0 — atalho para o lançamento que a ocorrência gerou no Financeiro (quando existe)
    if (lanc) {
        acoes.push({ icone: 'wallet', titulo: 'Ver no Financeiro', sub: `${moedaBR(lanc.valor)} · ${lanc.status === 'realizado' ? 'pago' : 'previsto'} · ${String(lanc.competencia || '').slice(5, 7)}/${String(lanc.competencia || '').slice(0, 4)}`,
            aoTocar: () => abrirLancamentoNoFinanceiro(lanc) });
    }
    if (oc.status_execucao === 'aberto') {
        acoes.push({ icone: 'check', titulo: 'Dar baixa', codigo: 'cofre.ocorrencias.tratar', sub: 'Marca como tratada', aoTocar: () => alternarAcaoOcorrencia(ocorrenciaId, 'tratar') });
        acoes.push({ icone: 'calendar', titulo: 'Reagendar', codigo: 'cofre.ocorrencias.reagendar', sub: 'Muda a data prevista', aoTocar: () => alternarAcaoOcorrencia(ocorrenciaId, 'reagendar') });
    } else if (oc.status_execucao === 'concluido') {
        acoes.push({ icone: 'undo-2', titulo: 'Estornar', codigo: 'cofre.ocorrencias.estornar', sub: 'Volta para "Em aberto"', tipo: 'bad', aoTocar: () => alternarAcaoOcorrencia(ocorrenciaId, 'estornar') });
    }
    // v1.53.0 — cancelar, reabrir e excluir (Nicola 13/10 22:44)
    if (oc.status_execucao === 'aberto') {
        acoes.push({ icone: 'x-circle', titulo: 'Cancelar', codigo: 'cofre.ocorrencias.tratar', sub: 'Não vai acontecer', aoTocar: () => alternarAcaoOcorrencia(ocorrenciaId, 'cancelar') });
    } else if (oc.status_execucao === 'cancelado') {
        acoes.push({ icone: 'rotate-ccw', titulo: 'Reabrir', codigo: 'cofre.ocorrencias.tratar', sub: 'Volta para "Em aberto"', aoTocar: () => alternarAcaoOcorrencia(ocorrenciaId, 'reabrir') });
    }
    if (ocorrenciaPodeExcluir(oc)) {
        acoes.push({ icone: 'trash-2', titulo: 'Excluir', codigo: 'cofre.ocorrencias.tratar', tipo: 'bad', sub: 'Apaga de vez, com o previsto', aoTocar: () => alternarAcaoOcorrencia(ocorrenciaId, 'excluir') });
    }
    abrirSheetOcorrencia(oc, lanc, acoes, `Ocorrência · ${formatarDataBR(oc.data_prevista_atual)}`); // v1.50.0 — detalhes + ações (a cancelada também abre)
}

// v1.50.0 — detalhes da ocorrência no topo do sheet de ações (Nicola 10/10 23:25).
function detalhesOcorrenciaHtml(oc, lanc) {
    const kv = (r, v) => `<div><small>${escapeHtml(r)}</small><b>${v}</b></div>`;
    const comp = String(oc.competencia || '');
    const origem = { fatura: 'Fatura do cartão', regra: 'Frequência do item', parcelamento: 'Parcela do item', documento: 'Documento' }[oc.origem] || (oc.origem || '—');
    const reagendada = oc.data_prevista_original && oc.data_prevista_original !== oc.data_prevista_atual;
    return `<div class="rz-kv" style="margin-bottom:14px">` +
        kv('Situação', escapeHtml(rotuloStatusOcorrencia(oc.status_execucao))) +
        kv('Prevista para', formatarDataBR(oc.data_prevista_atual) + (reagendada ? ` <small>(era ${formatarDataBR(oc.data_prevista_original)})</small>` : '')) +
        (comp ? kv('Competência', `${comp.slice(5, 7)}/${comp.slice(0, 4)}`) : '') +
        kv('Valor previsto', oc.valor_previsto != null ? moedaBR(oc.valor_previsto) : '—') +
        (oc.valor_real != null ? kv(oc.origem === 'fatura' ? 'Valor pago' : 'Valor realizado', moedaBR(oc.valor_real)) : '') +
        (oc.tratado_em ? kv('Baixa em', formatarDataBR(String(oc.tratado_em).slice(0, 10))) : '') +
        kv('Origem', escapeHtml(origem)) +
        (oc.tratamento_descricao ? kv('Descrição da baixa', escapeHtml(oc.tratamento_descricao)) : '') +
        (oc.descricao ? kv('Observação', escapeHtml(oc.descricao.replace(/\n+/g, ' · '))) : '') +
        (lanc ? kv('No Financeiro', `${moedaBR(lanc.valor)} · ${lanc.status === 'realizado' ? 'pago' : 'previsto'}`) : '') +
        `</div>`;
}
function abrirSheetOcorrencia(oc, lanc, acoes, titulo) {
    if (typeof window.abrirSheetAcoes !== 'function') { mostrarToast('Abra pelo app principal.', 'erro'); return; }
    const sheet = window.abrirSheetAcoes({ titulo, sub: itemEmFoco?.titulo || '', acoes });
    sheet?.querySelector('.rz-sh-b')?.insertAdjacentHTML('afterbegin', detalhesOcorrenciaHtml(oc, lanc));
}

// v1.50.0 (F18) — atalhos da ocorrência para o Financeiro. As funções do Financeiro moram em js/financeiro.js e
// chegam pelo window (index.html as expõe); fora do app principal, avisa.
function abrirFaturaDaOcorrencia(faturaId) {
    if (typeof window.fecharSheet === 'function') window.fecharSheet();
    if (typeof window.financeiroAbrirFatura !== 'function') { mostrarToast('Abra pelo app principal.', 'erro'); return; }
    setTimeout(() => window.financeiroAbrirFatura(faturaId), 30);
}
function importarFaturaDoItem(item) {
    if (typeof window.fecharSheet === 'function') window.fecharSheet();
    if (typeof window.financeiroImportarFatura !== 'function') { mostrarToast('Abra pelo app principal.', 'erro'); return; }
    setTimeout(() => window.financeiroImportarFatura({ cartaoId: item?.conta_id || null }), 30);
}
async function lancamentoDaOcorrencia(ocorrenciaId) {
    try {
        const { data } = await api.dbAuth.from('lancamentos').select('id, valor, status, competencia, ativo_id')
            .eq('origem_tipo', 'ocorrencia_controle').eq('origem_id', ocorrenciaId).limit(1);
        return (data || [])[0] || null;
    } catch (e) { console.warn('[cofre-controles] lançamento da ocorrência:', e?.message || e); return null; }
}
function abrirLancamentoNoFinanceiro(lanc) {
    if (typeof window.switchTab !== 'function') { mostrarToast('Abra pelo app principal.', 'erro'); return; }
    if (typeof window.fecharSheet === 'function') window.fecharSheet();
    window.switchTab('tab-saidas');
    // vai para o mês do lançamento pelo ‹ › do próprio Financeiro (único que muda a competência)
    const atual = window.RZ_FIN_COMPETENCIA || new Date().toISOString().slice(0, 7) + '-01';
    const meses = (Number(lanc.competencia.slice(0, 4)) - Number(atual.slice(0, 4))) * 12 + (Number(lanc.competencia.slice(5, 7)) - Number(atual.slice(5, 7)));
    if (meses && typeof window.financeiroMudarCompetencia === 'function') window.financeiroMudarCompetencia(meses);
    mostrarToast(`Lançamento de ${moedaBR(lanc.valor)} em Saídas, ${lanc.competencia.slice(5, 7)}/${lanc.competencia.slice(0, 4)}.`);
}

export function alternarAcaoOcorrencia(ocorrenciaId, modo) {
    const oc = ocorrenciaPorId(ocorrenciaId);
    if (!oc) return;
    if (typeof window.abrirSheetForm !== 'function') { mostrarToast('Abra pelo app principal.', 'erro'); return; }
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
    } else if (modo === 'cancelar') { // v1.53.0
        window.abrirSheetForm({ titulo: 'Cancelar ocorrência', sub, rotuloSalvar: 'Confirmar cancelamento',
            corpo: `<div class="rz-f"><label>Motivo</label><textarea id="oc-cancelar-motivo" rows="3" placeholder="Opcional — por que não vai acontecer"></textarea></div>
                <p class="rz-desc">Fica no histórico como cancelada${oc.valor_previsto ? '; o lançamento previsto sai do Financeiro' : ''}. Dá para reabrir depois.</p>`,
            aoSalvar: async () => { await confirmarCancelarOcorrencia(ocorrenciaId); } });
    } else if (modo === 'reabrir') {
        window.abrirSheetForm({ titulo: 'Reabrir ocorrência', sub, rotuloSalvar: 'Reabrir',
            corpo: `<p class="rz-desc">A ocorrência volta para "Em aberto". Isso fica registrado no histórico.</p>`,
            aoSalvar: async () => { await confirmarReabrirOcorrencia(ocorrenciaId); } });
    } else if (modo === 'excluir') {
        window.abrirSheetForm({ titulo: 'Excluir ocorrência', sub, rotuloSalvar: 'Excluir de vez',
            corpo: `<p class="rz-desc">A ocorrência some do item${oc.valor_previsto ? ' e o lançamento previsto sai do Financeiro' : ''}. Não dá para desfazer — se só não vai acontecer, prefira Cancelar.</p>`,
            aoSalvar: async () => { await confirmarExcluirOcorrencia(ocorrenciaId); } });
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
        const itemId = itemEmFoco?.id; // capturado antes de recarregarFichaItemControle() reatribuir itemEmFoco
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
        emitirEscrita('controle', { id: itemId, ocorrenciaId, acao: 'tratar-ocorrencia' }); // v1.32.0
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
        const itemId = itemEmFoco?.id;
        await recarregarFichaItemControle();
        window.dispatchEvent(new CustomEvent('cofre:recarregar-eventos')); // BUG FIX 25/08/2026 — ver nota em confirmarTratarOcorrencia
        emitirEscrita('controle', { id: itemId, ocorrenciaId, acao: 'reagendar-ocorrencia' }); // v1.32.0
    } catch (err) { mostrarToast('Erro: ' + err.message, 'erro'); }
}

export async function confirmarEstornarOcorrencia(ocorrenciaId) {
    try {
        await api.estornarOcorrencia(ocorrenciaId);
        await registrarHistoricoOcorrenciaLocal(ocorrenciaId, 'estornar', { status_execucao: 'concluido' }, { status_execucao: 'aberto' }, 'Estorno solicitado pelo usuário');
        await api.registrarLogAcessos(estado.clienteId, estado.pessoa.id, 'cofre.ocorrencias.estornar', { ativoId: estado.ativoEmFoco?.id, ocorrenciaId });
        mostrarToast('Ocorrência estornada ✅');
        ocorrenciaEmAcao = null;
        const itemId = itemEmFoco?.id;
        await recarregarFichaItemControle();
        window.dispatchEvent(new CustomEvent('cofre:recarregar-eventos')); // BUG FIX 25/08/2026 — ver nota em confirmarTratarOcorrencia
        emitirEscrita('controle', { id: itemId, ocorrenciaId, acao: 'estornar-ocorrencia' }); // v1.32.0
    } catch (err) { mostrarToast('Erro: ' + err.message, 'erro'); }
}

// v1.53.0 — cancelar · reabrir · excluir ocorrência (Nicola 13/10 22:44). Escrita direta como as vizinhas; o espelho
// do banco (fn_ocorrencia_espelha_despesa) cuida do lançamento previsto.
async function depoisDeMudarOcorrencia(ocorrenciaId, acao, msg) {
    mostrarToast(msg);
    ocorrenciaEmAcao = null;
    const itemId = itemEmFoco?.id;
    await recarregarFichaItemControle();
    window.dispatchEvent(new CustomEvent('cofre:recarregar-eventos'));
    emitirEscrita('controle', { id: itemId, ocorrenciaId, acao });
}
export async function confirmarCancelarOcorrencia(ocorrenciaId) {
    const motivo = document.getElementById('oc-cancelar-motivo')?.value.trim() || null;
    try {
        const { error } = await api.dbAuth.from('cofre_ocorrencias_controle').update({
            status_execucao: 'cancelado', tratado_em: new Date().toISOString(), tratado_por: estado.pessoa.id, tratamento_descricao: motivo,
        }).eq('id', ocorrenciaId);
        if (error) throw error;
        await registrarHistoricoOcorrenciaLocal(ocorrenciaId, 'cancelar', { status_execucao: 'aberto' }, { status_execucao: 'cancelado' }, motivo);
        await api.registrarLogAcessos(estado.clienteId, estado.pessoa.id, 'cofre.ocorrencias.tratar', { ativoId: estado.ativoEmFoco?.id, ocorrenciaId, acao: 'cancelar' });
        await depoisDeMudarOcorrencia(ocorrenciaId, 'cancelar-ocorrencia', 'Ocorrência cancelada');
    } catch (err) { mostrarToast('Erro: ' + err.message, 'erro'); }
}
export async function confirmarReabrirOcorrencia(ocorrenciaId) {
    try {
        const { error } = await api.dbAuth.from('cofre_ocorrencias_controle').update({
            status_execucao: 'aberto', tratado_em: null, tratado_por: null, tratamento_descricao: null,
        }).eq('id', ocorrenciaId);
        if (error) throw error;
        await registrarHistoricoOcorrenciaLocal(ocorrenciaId, 'reabrir', { status_execucao: 'cancelado' }, { status_execucao: 'aberto' }, null);
        await api.registrarLogAcessos(estado.clienteId, estado.pessoa.id, 'cofre.ocorrencias.tratar', { ativoId: estado.ativoEmFoco?.id, ocorrenciaId, acao: 'reabrir' });
        await depoisDeMudarOcorrencia(ocorrenciaId, 'reabrir-ocorrencia', 'Ocorrência reaberta');
    } catch (err) { mostrarToast('Erro: ' + err.message, 'erro'); }
}
export async function confirmarExcluirOcorrencia(ocorrenciaId) {
    const oc = ocorrenciaPorId(ocorrenciaId);
    if (!ocorrenciaPodeExcluir(oc)) { mostrarToast('Não dá para excluir. Use Cancelar.', 'erro'); return; }
    try {
        // o histórico vem antes: a linha fica no histórico do item (o vínculo com a ocorrência vira nulo na exclusão)
        await registrarHistoricoOcorrenciaLocal(ocorrenciaId, 'excluir', { status_execucao: oc.status_execucao, data_prevista_atual: oc.data_prevista_atual, descricao: oc.descricao || null }, null, null);
        const { error } = await api.dbAuth.from('cofre_ocorrencias_controle').delete().eq('id', ocorrenciaId);
        if (error) throw error;
        await api.registrarLogAcessos(estado.clienteId, estado.pessoa.id, 'cofre.ocorrencias.tratar', { ativoId: estado.ativoEmFoco?.id, ocorrenciaId, acao: 'excluir' });
        await depoisDeMudarOcorrencia(ocorrenciaId, 'excluir-ocorrencia', 'Ocorrência excluída');
    } catch (err) {
        mostrarToast(/foreign key|violates/i.test(err.message || '') ? 'Esta ocorrência já entrou num fechamento — use Cancelar.' : 'Erro: ' + err.message, 'erro');
    }
}

// ---- Editar / Excluir item
// Revisão DS (25/08/2026) — edição do item de controle virou bottom-sheet
// (Tipo B, #modal-editar-item-controle), substituindo o painel inline
// antigo (fic-editar-wrapper). Também ganhou os campos de frequência
// (antes só dava pra editar título/subtipo/antecedência) — necessário
// pra poder detectar mudança que "impacta os alertas possíveis" (pedido
// explícito) e oferecer regenerar as ocorrências futuras.
// v1.38.0 (encargos v3, demanda 854f6343) — memória de cálculo do item de IPTU/
// condomínio por responsável (cofre_itens_controle.rateio, calculado pelo banco).
// Só exibe: o valor do item continua editável; se foi ajustado, mostra os dois.
function memoriaRateioHtml(item, kv) {
    const r = item.rateio;
    if (!r || !r.ano) return '';
    const br = iso => String(iso).slice(0, 10).split('-').reverse().join('/');
    const pct = v => `${Number(v || 0).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%`;
    const periodos = (r.periodos || []).map(p => `${br(p.inicio)} a ${br(p.fim)}`).join('; ') || '—';
    let conta;
    if (r.codigo === 'iptu_global') {
        conta = `IPTU ${r.ano}: ${moedaBR(r.base)} × ${r.dias}/${r.dias_ano} dias (${pct(r.pct)}) = <b>${moedaBR(r.devido)}</b>`;
    } else {
        const comps = (r.competencias || []).map(c => `${String(c.mes).padStart(2, '0')}/${r.ano}: ${c.dias < c.dias_mes ? `${c.dias}/${c.dias_mes} dias → ` : ''}${moedaBR(c.valor)}`);
        conta = `Mensal ${moedaBR(r.base)} · ${comps.length} competência(s) = <b>${moedaBR(r.devido)}</b>${comps.length ? '<br>' + escapeHtml(comps.join(' · ')) : ''}`;
    }
    const ajustado = item.valor_previsto != null && Math.abs(Number(item.valor_previsto) - Number(r.devido || 0)) >= 0.01
        ? `<br>Valor do item ajustado para ${moedaBR(item.valor_previsto)}` : '';
    return kv(r.vago ? 'Período sem contrato' : 'Período do contrato', escapeHtml(periodos)) +
        kv('Memória de cálculo', conta + ajustado);
}

export async function abrirEditarItem() {
    const item = itemEmFoco;
    // v1.54.0 (demanda 1f9a8d04) — item de conta ou cartão (F18, conta_id): nome, tipo, início e vencimento são da conta;
    // o item acompanha (fn_conta_item_sincronizar, mão única). Editar aqui desfazia o vínculo — vai para a ficha da conta.
    if (item?.conta_id) {
        const escolha = await escolher({
            titulo: 'Este item é de uma conta do Financeiro',
            sub: 'Edite pela conta ou cartão',
            opcoes: [{ valor: 'conta', titulo: 'Editar a conta ou o cartão', sub: 'No Financeiro', icone: 'credit-card' }],
        });
        if (escolha !== 'conta') return;
        try {
            const me = await import('./comum-minha-empresa.js');
            const res = await me.buscarContas(api.dbAuth, estado.clienteId, true);
            const conta = (res?.dados || []).find(c => c.id === item.conta_id);
            if (!conta) { mostrarToast('Você não tem acesso a esta conta.', 'erro'); return; }
            await me.abrirFichaConta({
                dbAuth: api.dbAuth, clienteId: estado.clienteId, conta,
                onToast: (m, t) => mostrarToast(m, t === 'danger' ? 'erro' : undefined),
                aoSalvar: () => recarregarFichaItemControle(),
            });
        } catch (err) { mostrarToast('Erro: ' + err.message, 'erro'); }
        return;
    }
    // v1.37.0 — o catálogo de subtipos precisa estar carregado antes de montar
    // o seletor; sem ele o subtipo aparecia vazio e o salvar gravava null.
    if (!subtiposCache) {
        try { subtiposCache = await api.listarSubtiposControle(estado.clienteId); }
        catch (err) { console.warn('[controles] catálogo de subtipos:', err.message); }
    }
    await carregarCatalogoTiposControle(); // v1.43.0
    popularComboTipoControle('fic-ed-tipo', item.tipo);
    const selTipoEd = document.getElementById('fic-ed-tipo');
    // v1.39.0 — o tipo do próprio item nunca some do combo (despesa abria em branco).
    if (selTipoEd && item.tipo && !Array.from(selTipoEd.options).some(o => o.value === item.tipo)) {
        const opTipo = document.createElement('option');
        opTipo.value = item.tipo;
        opTipo.textContent = String(rotuloTipoControle(item.tipo)).replace(/^./, c => c.toUpperCase());
        selTipoEd.appendChild(opTipo);
    }
    selTipoEd.value = item.tipo;
    popularSelectSubtipoEm('fic-ed-subtipo', item.tipo, item.subtipo_id);
    // garantia: o subtipo do próprio item nunca some do seletor
    const selSub = document.getElementById('fic-ed-subtipo');
    if (selSub && item.subtipo_id && selSub.value !== item.subtipo_id) {
        const op = document.createElement('option');
        op.value = item.subtipo_id;
        op.textContent = item.cofre_controle_subtipos?.nome || 'Subtipo atual';
        selSub.appendChild(op);
        selSub.value = item.subtipo_id;
    }
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
    if (!tipo) { mostrarToast('Escolha o tipo do item.', 'erro'); return; } // v1.39.0
    if (!titulo) { mostrarToast('Informe um título.', 'erro'); return; }
    if (!dataInicio) { mostrarToast('Informe a data início.', 'erro'); return; }
    if (direcaoAlerta === 'fim' && !dataFim) { mostrarToast('Informe a data fim.', 'erro'); return; }
    if (dataFim && dataFim < dataInicio) { mostrarToast('A data fim vem antes do início.', 'erro'); return; }

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

    // v1.44.0 — a decisão sobre as ocorrências vem ANTES de gravar: fechar sem escolher
    // não salva nada (o formulário continua aberto para ajustar ou desistir).
    let regenerar = false;
    if (mudouGeracaoAlertas) {
        const escolha = await escolher({
            titulo: 'Esta mudança afeta os alertas',
            sub: 'Início, fim ou frequência',
            opcoes: [
                { valor: 'regerar', titulo: 'Salvar e regerar', sub: 'Só as próximas', icone: 'refresh-cw' },
                { valor: 'manter', titulo: 'Salvar e manter as atuais', sub: 'As atuais ficam como estão', icone: 'check' },
            ],
        });
        if (escolha === null) { mostrarToast('Nada foi salvo.', 'aviso'); return; }
        regenerar = escolha === 'regerar';
    }

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
            // v1.44.0 — a escolha (regerar ou manter) já foi feita antes de gravar
            if (regenerar) {
                const hojeISO = hojeLocalISO(); // v1.54.0 (5b4934d5) — data local; toISOString() virava o dia depois das 21h
                await api.excluirOcorrenciasAbertasFuturasDoItem(item.id, hojeISO);
                const itemAtualizado = { ...item, ...depois };
                // Revisão 25/08/2026 — regenerar respeita a direção
                // escolhida: "fim" ancora retroativamente na data fim
                // nova, "inicio" mantém o comportamento de sempre
                // (pra frente a partir de hoje).
                const payloads = direcaoAlerta === 'fim'
                    ? gerarOcorrenciasHorizonteRetroativo(itemAtualizado, dataFim, freqIntervalo, freqUnidade)
                    : gerarOcorrenciasHorizonte(itemAtualizado, dataInicio || hojeISO, freqIntervalo, freqUnidade); // v1.54.0 — o ciclo segue o dia do início (avança até hoje), não recomeça no dia da edição
                await api.criarOcorrenciasControleBatch(payloads);
                await api.registrarLogAcessos(estado.clienteId, estado.pessoa.id, 'cofre.controles.editar', { itemId: item.id, ocorrenciasGeradas: payloads.length });
                mostrarToast(`Item atualizado · ${payloads.length} refeitas`);
            } else {
                mostrarToast('Item atualizado');
            }
        } else {
            mostrarToast('Item atualizado ✅');
        }

        fecharEditarItem();
        await recarregarFichaItemControle();
        window.dispatchEvent(new CustomEvent('cofre:recarregar-eventos'));
        emitirEscrita('controle', { id: item.id, acao: 'editar' }); // v1.32.0
    } catch (err) { mostrarToast('Erro: ' + err.message, 'erro'); }
}

// v1.20.0 — A.10/v2.2: Encerrar (soft) — abertas e despesas previstas somem
// por trigger; concluídas e realizadas ficam. Documentos vinculados não são
// tocados (continuam no item, visível em "Encerrados").
export async function encerrarItemControleAtual() {
    const item = itemEmFoco; if (!item) return;
    const abertas = (item.cofre_ocorrencias_controle || []).filter(o => o.status_execucao === 'aberto').length;
    if (!await perguntar({ titulo: `Encerrar ${item.titulo}?`, impacto: `Ele para de gerar ocorrências e alertas${abertas ? ` (${abertas} em aberto somem, com as despesas previstas delas)` : ''}. O que já foi tratado fica no histórico, em "Encerrados". Dá para reabrir depois.`, rotuloConfirmar: 'Encerrar item' })) return;
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
        mostrarToast('Item reaberto');
        await recarregarFichaItemControle();
        window.dispatchEvent(new CustomEvent('cofre:recarregar-eventos'));
    } catch (err) { mostrarToast('Erro: ' + err.message, 'erro'); }
}

export async function excluirItemControleAtual() {
    const item = itemEmFoco;
    if (itemEmFoco?.grupo_status) { mostrarToast('Item com rateio não pode ser excluído.', 'erro'); return; } // v1.52.0
    // v1.20.0 — exclusão DE VERDADE (v2.2). Guarda no banco: com ocorrência
    // tratada, o DELETE falha com a mensagem do trigger (mostrada abaixo).
    if ((item.cofre_ocorrencias_controle || []).some(o => o.status_execucao === 'concluido')) {
        mostrarToast('Tem ocorrência tratada. Use Encerrar.', 'erro'); return;
    }
    // v1.63.0 (item 53) — com lançamento no Financeiro o vínculo se perderia em silêncio: avisa o que desfazer
    try {
        const { count } = await api.dbAuth.from('lancamentos').select('id', { count: 'exact', head: true }).eq('item_controle_id', item.id);
        if (count) { mostrarToast(`Tem ${count} ${count === 1 ? 'lançamento' : 'lançamentos'} no Financeiro: desvincule ou use Encerrar.`, 'erro'); return; }
    } catch (e) { console.warn('[cofre-controles] lançamentos do item:', e?.message || e); }
    if (!await perguntar({ titulo: `Excluir ${item.titulo} de vez?`, impacto: 'Ele some com as ocorrências em aberto e as despesas previstas delas. Não dá para desfazer. Para só parar os alertas e manter o histórico, use "Encerrar item".', destrutivo: true, rotuloConfirmar: 'Excluir item de vez' })) return;

    // Documentos vinculados a este item (pedido explícito, 25/08/2026) —
    // pergunta SEPARADA, só se houver algum: apagar de vez, ou manter
    // (nesse caso só desvincula — o documento continua guardado no
    // Cofre e passa a aparecer em "Em triagem" na Visão Geral,
    // classificarStatusVinculo já trata isso sozinho pra qualquer
    // documento sem vínculo nenhum).
    const docsDoItem = documentosDoItemControle(item.id);
    let apagarDocumentos = false;
    if (docsDoItem.length > 0) {
        apagarDocumentos = await perguntar({
            titulo: 'E os documentos do item?',
            impacto: `Este item tem ${docsDoItem.length} documento(s): "${docsDoItem.map(d => d.nome_exibicao).join('", "')}". Apagar também, ou manter guardados no Cofre (ficam em "Em triagem" para vincular)?`,
            destrutivo: true, rotuloConfirmar: 'Apagar os documentos também', rotuloCancelar: 'Manter guardados no Cofre',
        });
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
        emitirEscrita('controle', { id: item.id, acao: 'excluir' }); // v1.32.0
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
                { icone: 'pencil', titulo: 'Editar dados', codigo: 'cofre.controles.editar', sub: 'Nome, documento e contato', aoTocar: () => abrirEditarParte(parteId) },
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

// v1.32.0 (Fase 1 do wrapper de escrita) — escuta emitirEscrita('controle',
// ...) 1x por carga do módulo (guarda por window.*, mesmo padrão do piloto
// em index.html/cofre-ativos.js v1.59.0 — aqui é defensivo: um módulo ES só
// roda uma vez mesmo, mas segue a convenção pedida). Se a Ficha do Item de
// Controle estiver aberta (itemEmFoco) com o MESMO id que escreveu (ou sem
// id no detalhe — ex.: config-controle não usa esta entidade, então na
// prática sempre há id aqui), recarrega a ficha inteira
// (recarregarFichaItemControle, já reatribui itemEmFoco do banco) — cobre
// editar partes, tratar/reagendar/estornar ocorrência e editar o próprio
// item refletindo sem F5 em qualquer outra ficha aberta da mesma entidade.
if (!window.__rzListenerEscritaControleLigado) {
    window.__rzListenerEscritaControleLigado = true;
    aoEscrever('controle', (detalhe) => {
        if (itemEmFoco && (!detalhe?.id || detalhe.id === itemEmFoco.id)) {
            recarregarFichaItemControle();
        }
    });
}

// ============================================================================
// CRIAR ITEM DE CONTROLE (formulário na ficha do ativo)
// ============================================================================
export async function abrirFormControle(opcoes) {
    // v1.49.0 (demanda a30da78b) — { vinculo: 'empresa' } vem do card "Controles da
    // empresa": subtipos pela regra vínculo:empresa, sem modelos do ativo, sem ativo.
    novoItemVinculo = opcoes?.vinculo === 'empresa' ? 'empresa' : null;
    await carregarCatalogoTiposControle(); // v1.43.0
    popularComboTipoControle('ic-tipo', null);
    if (!subtiposCache) {
        try { subtiposCache = await api.listarSubtiposControle(estado.clienteId); }
        catch (err) { mostrarToast('Erro ao carregar catálogo: ' + err.message, 'erro'); return; }
    }
    // v1.20.2 (E0.2 / A8) — catálogo do seletor filtrado pelo tipo do ativo
    // em foco (embarcação mostra 12 subtipos, não 109). Se a busca filtrada
    // falhar, cai no catálogo completo em vez de travar o formulário.
    const tipoAtivoFoco = novoItemVinculo === 'empresa' ? null : (estado.ativoEmFoco?.tipo_ativo || null);
    if (novoItemVinculo === 'empresa') {
        try { subtiposDoAtivoCache = { tipoAtivo: '__empresa', lista: await api.listarSubtiposControleEmpresa(estado.clienteId) }; }
        catch (err) { subtiposDoAtivoCache = { tipoAtivo: null, lista: null }; }
    } else if (tipoAtivoFoco && subtiposDoAtivoCache.tipoAtivo !== tipoAtivoFoco) {
        try { subtiposDoAtivoCache = { tipoAtivo: tipoAtivoFoco, lista: await api.listarSubtiposControle(estado.clienteId, tipoAtivoFoco) }; }
        catch (err) { subtiposDoAtivoCache = { tipoAtivo: null, lista: null }; }
    }
    if (!tipoAtivoFoco && novoItemVinculo !== 'empresa') subtiposDoAtivoCache = { tipoAtivo: null, lista: null };
    if (!modelosCache) {
        try { modelosCache = await api.listarModelosItemControle(estado.clienteId); }
        catch (err) { modelosCache = []; /* não bloqueia a criação manual se os modelos falharem ao carregar */ }
    }
    // v1.45.0 — tipos limitados aos que têm subtipo válido para o ativo; abre no primeiro
    if (subtiposDoAtivoCache.lista) popularComboTipoControle('ic-tipo', null, new Set(subtiposDoAtivoCache.lista.map(s => s.tipo)));
    // v1.55.0 (47eed96b) — conta e cartão nascem pelo item: no ativo vida (pessoa) e nos Controles da empresa, a opção
    // "Conta ou cartão" fecha este formulário e abre o cadastro da conta com o titular preso (o banco cria o item junto).
    oferecerContaNoNovoItem();
    const tipoInicialIc = document.getElementById('ic-tipo').options[0]?.value || 'seguro';
    document.getElementById('ic-tipo').value = tipoInicialIc;
    popularSelectSubtipo(tipoInicialIc);
    document.getElementById('ic-titulo').value = '';
    document.getElementById('ic-data-base').value = '';
    document.getElementById('ic-data-fim').value = '';
    document.getElementById('ic-direcao-alerta').value = 'inicio';
    document.getElementById('ic-freq-intervalo').value = '';
    document.getElementById('ic-freq-unidade').value = 'mes';
    document.getElementById('ic-antecedencia').value = '7';
    aoMudarFrequenciaItemControle(); // E14.2 — form abre com parcelas visível (recorrente vazio)
    renderizarModelosSugeridosForm();
    ligarCaminhoNovoItem(); // v1.45.0
    abrirModal('modal-criar-item-controle');
}

// v1.55.0 (47eed96b) — opção "Conta ou cartão" no tipo do novo item (só ativo vida e Controles da empresa).
// O vínculo com a pessoa vem do próprio ativo: cofre_ativos.entidade_origem_tipo = 'pessoa' e entidade_origem_id = a
// pessoa do cadastro (F16). Ela vira o titular da conta; fn_conta_salvar → fn_conta_item_sincronizar acha o mesmo ativo
// por esse vínculo e cria o item nele. Ativo vida sem pessoa ligada não cria conta (aviso).
const OPCAO_CONTA_NOVO_ITEM = '__conta';
function oferecerContaNoNovoItem() {
    const sel = document.getElementById('ic-tipo');
    if (!sel) return;
    sel.querySelector(`option[value="${OPCAO_CONTA_NOVO_ITEM}"]`)?.remove();
    const empresa = novoItemVinculo === 'empresa';
    if (!empresa && estado.ativoEmFoco?.tipo_ativo !== 'vida') return;
    const op = document.createElement('option');
    op.value = OPCAO_CONTA_NOVO_ITEM;
    op.textContent = 'Conta ou cartão';
    sel.appendChild(op);
    if (!sel.dataset.rzConta) {
        sel.dataset.rzConta = '1';
        sel.addEventListener('change', () => { if (sel.value === OPCAO_CONTA_NOVO_ITEM) abrirNovaContaPeloItem(); });
    }
}
async function abrirNovaContaPeloItem() {
    const empresa = novoItemVinculo === 'empresa';
    const ativo = empresa ? null : estado.ativoEmFoco;
    let pessoaId = null;
    if (!empresa) {
        const { data, error } = await api.dbAuth.from('cofre_ativos').select('entidade_origem_tipo, entidade_origem_id').eq('id', ativo?.id).maybeSingle();
        if (error || data?.entidade_origem_tipo !== 'pessoa' || !data?.entidade_origem_id) {
            // v1.57.0 (d6a6f577) — sem pessoa ligada: oferece ligar agora (só pessoas que já existem em Pessoas)
            const voltarTipo = () => { const sel = document.getElementById('ic-tipo'); if (sel) { sel.value = sel.options[0]?.value || ''; popularSelectSubtipo(sel.value); atualizarCaminhoNovoItem(); } };
            const ligar = await perguntar({ titulo: 'Este ativo ainda não tem pessoa do cadastro', impacto: 'A conta ou o cartão precisa de um titular: a pessoa de Pessoas que este ativo representa. Ligar não dá acesso ao app.', rotuloConfirmar: 'Ligar agora' });
            if (!ligar) { voltarTipo(); return; }
            const ca = await import('./cofre-ativos.js');
            pessoaId = await ca.ligarPessoaAoAtivo(ativo);
            if (!pessoaId) { voltarTipo(); return; }
        } else pessoaId = data.entidade_origem_id;
    }
    fecharFormControle();
    try {
        const me = await import('./comum-minha-empresa.js');
        await me.abrirFichaConta({
            dbAuth: api.dbAuth, clienteId: estado.clienteId,
            fixarPessoaId: pessoaId, fixarEmpresa: empresa,
            onToast: (m, t) => mostrarToast(m, t === 'danger' ? 'erro' : undefined),
            aoSalvar: async () => {
                if (!empresa && ativo?.id) { itensDoAtivoAtual = await api.listarItensControleAtivo(ativo.id); renderizarListaControles(); }
                window.dispatchEvent(new CustomEvent('cofre:recarregar-eventos'));
                emitirEscrita('controle', { acao: 'criar_conta' });
            },
        });
    } catch (err) { mostrarToast('Erro: ' + err.message, 'erro'); }
}

// v1.45.0 — linha de chips com o caminho do novo item: ativo · tipo de ativo · tipo · subtipo.
function ligarCaminhoNovoItem() {
    const selTipo = document.getElementById('ic-tipo');
    const selSub = document.getElementById('ic-subtipo');
    if (!selTipo || !selSub) return;
    let caminho = document.getElementById('ic-caminho');
    if (!caminho) {
        caminho = document.createElement('div');
        caminho.id = 'ic-caminho';
        caminho.className = 'rz-chips';
        selTipo.parentElement?.insertAdjacentElement('beforebegin', caminho);
        selTipo.addEventListener('change', () => setTimeout(atualizarCaminhoNovoItem, 0));
        selSub.addEventListener('change', atualizarCaminhoNovoItem);
    }
    atualizarCaminhoNovoItem();
}
function atualizarCaminhoNovoItem() {
    const caminho = document.getElementById('ic-caminho');
    if (!caminho) return;
    const a = novoItemVinculo === 'empresa' ? null : estado.ativoEmFoco; // v1.49.0
    const selTipo = document.getElementById('ic-tipo');
    const selSub = document.getElementById('ic-subtipo');
    const partes = [novoItemVinculo === 'empresa' ? 'Minha empresa' : '', a?.nome_exibicao, a?.tipo_ativo ? rotuloTipoAtivo(a.tipo_ativo) : '',
        selTipo?.value ? selTipo.options[selTipo.selectedIndex]?.text : '',
        selSub?.value ? selSub.options[selSub.selectedIndex]?.text : ''].filter(Boolean);
    caminho.innerHTML = partes.map(p => `<span class="rz-chip">${escapeHtml(p)}</span>`).join('');
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
    const ativo = novoItemVinculo === 'empresa' ? null : estado.ativoEmFoco; // v1.49.0 — modelos são por tipo de ativo
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
    mostrarToast('Modelo aplicado. Falta a data início.');
}

export function fecharFormControle() {
    fecharModal('modal-criar-item-controle');
    // v1.49.0 (demanda a30da78b) — aberto pelo card da empresa: volta para Minha empresa
    if (novoItemVinculo === 'empresa') {
        novoItemVinculo = null;
        if (typeof window.switchTab === 'function') window.switchTab('tab-minha-empresa');
    }
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

// v1.34.0 (demanda ed2774ee) — trocar o subtipo no formulário de novo item de
// controle sugere a antecedência padrão do subtipo (antecedencia_padrao_dias),
// mesmo padrão já usado no upload de documento com controle vinculado
// (aplicarPadraoSubtipoUpload, cofre-documentos.js). Antes o campo nascia
// sempre com o número fixo '7', mesmo trocando o subtipo.
export function aoMudarSubtipoControleForm() {
    const subtipoId = document.getElementById('ic-subtipo')?.value;
    if (!subtipoId) return;
    const lista = subtiposDoAtivoCache.lista || subtiposCache || [];
    const s = lista.find(x => x.id === subtipoId);
    const campo = document.getElementById('ic-antecedencia');
    if (s && s.antecedencia_padrao_dias != null && campo) campo.value = s.antecedencia_padrao_dias;
}

export async function salvarItemControle() {
    const empresa = novoItemVinculo === 'empresa'; // v1.49.0 (demanda a30da78b)
    const a = empresa ? null : estado.ativoEmFoco;
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

    if (!empresa && !a) { mostrarToast('Abra o item a partir de um ativo.', 'erro'); return; } // v1.49.0
    if (!tipo) { mostrarToast('Escolha o tipo do item.', 'erro'); return; } // v1.39.0
    if (!titulo) { mostrarToast('Informe o título do item.', 'erro'); return; }
    if (!dataBase) { mostrarToast('Informe a data início.', 'erro'); return; }
    // Pedido explícito (25/08/2026): gerar retroativo exige saber a partir
    // de onde contar pra trás — sem data fim não tem como.
    if (direcaoAlerta === 'fim' && !dataFim) { mostrarToast('Informe a data fim.', 'erro'); return; }
    if (dataFim && dataFim < dataBase) { mostrarToast('A data fim vem antes do início.', 'erro'); return; }

    try {
        const item = await api.criarItemControle({
            cliente_id: estado.clienteId, ativo_id: empresa ? null : a.id, empresa_id: empresa ? estado.clienteId : null, // v1.49.0
            tipo, subtipo_id: subtipoId, titulo,
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

        await api.registrarLogAcessos(estado.clienteId, estado.pessoa.id, 'cofre.controles.criar', { ativoId: a?.id || null, empresa, itemId: item.id, ocorrenciasGeradas: payloads.length });
        mostrarToast(`Item criado · ${payloads.length} ocorrências`);
        fecharFormControle(); // v1.49.0 — no caso da empresa, já volta para Minha empresa (remonta o card)
        if (!empresa) {
            itensDoAtivoAtual = await api.listarItensControleAtivo(a.id);
            renderizarListaControles();
        }
        window.dispatchEvent(new CustomEvent('cofre:recarregar-eventos')); // atualiza Home/Visão Geral com as novas ocorrências
        emitirEscrita('controle', { id: item.id, acao: 'criar' }); // v1.32.0
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
    emitirEscrita('controle', { id: item.id, acao: 'criar-de-documento' }); // v1.32.0
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

// v1.54.0 (5b4934d5) — "hoje" no fuso do aparelho (AAAA-MM-DD), sem passar por UTC.
function hojeLocalISO() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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
        let acao;
        if (subtipoEmEdicao) {
            await api.atualizarSubtipoControle(subtipoEmEdicao, nome, documentoEsperado);
            mostrarToast('Subtipo atualizado ✅');
            cancelarEdicaoSubtipo();
            acao = 'editar-subtipo';
        } else {
            await api.criarSubtipoControle(estado.clienteId, tipo, nome, documentoEsperado);
            mostrarToast('Subtipo criado ✅');
            document.getElementById('subtipo-nome').value = '';
            document.getElementById('subtipo-documento-esperado').checked = false;
            acao = 'criar-subtipo';
        }
        subtiposCache = await api.listarSubtiposControle(estado.clienteId);
        renderizarSubtiposControle();
        emitirEscrita('config-controle', { acao }); // v1.32.0 (baixa prioridade — catálogo, não item)
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
    if (!await perguntar({ titulo: `Excluir o subtipo ${s.nome}?`, impacto: 'Ele deixa de aparecer para novos itens.', destrutivo: true, rotuloConfirmar: 'Excluir subtipo' })) return;
    try {
        await api.arquivarSubtipoControle(id);
        mostrarToast('Subtipo excluído.');
        if (subtipoEmEdicao === id) cancelarEdicaoSubtipo();
        subtiposCache = await api.listarSubtiposControle(estado.clienteId);
        renderizarSubtiposControle();
        emitirEscrita('config-controle', { id, acao: 'excluir-subtipo' }); // v1.32.0 (baixa prioridade)
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
            <p class="rz-group">${escapeHtml(rotuloTipoControle(tipo))}</p>
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
        let acao;
        if (modeloEmEdicao) {
            await api.atualizarModeloItemControle(modeloEmEdicao, payload);
            mostrarToast('Modelo atualizado ✅');
            cancelarEdicaoModelo();
            acao = 'editar-modelo';
        } else {
            await api.criarModeloItemControle({ ...payload, cliente_id: estado.clienteId });
            mostrarToast('Modelo criado ✅');
            document.getElementById('modelo-titulo').value = '';
            document.getElementById('modelo-freq-intervalo').value = '';
            acao = 'criar-modelo';
        }
        modelosCache = await api.listarModelosItemControle(estado.clienteId);
        renderizarModelosControle();
        emitirEscrita('config-controle', { acao }); // v1.32.0 (baixa prioridade — catálogo, não item)
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
    if (!await perguntar({ titulo: `Excluir o modelo ${m.titulo_sugerido}?`, impacto: 'Ele deixa de aparecer como atalho ao criar itens.', destrutivo: true, rotuloConfirmar: 'Excluir modelo' })) return;
    try {
        await api.arquivarModeloItemControle(id);
        mostrarToast('Modelo excluído.');
        if (modeloEmEdicao === id) cancelarEdicaoModelo();
        modelosCache = await api.listarModelosItemControle(estado.clienteId);
        renderizarModelosControle();
        emitirEscrita('config-controle', { id, acao: 'excluir-modelo' }); // v1.32.0 (baixa prioridade)
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
            <p class="rz-group">${escapeHtml(rotuloTipoAtivo(tipoAtivo))}</p>
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


// v1.46.0 (UX F1.4a, demanda c71f617c) — esqueleto no lugar de "Carregando…" (UXR, REGRAS §8).
// window.rzSkeleton vive no index.html; no cofre.html avulso cai no texto de antes.
function rzSk(tipo, n) {
    return (typeof window !== 'undefined' && typeof window.rzSkeleton === 'function')
        ? window.rzSkeleton(tipo, n)
        : '<p class="rz-desc">Carregando…</p>';
}
