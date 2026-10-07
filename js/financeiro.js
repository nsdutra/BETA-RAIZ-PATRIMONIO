// ============================================================================
// financeiro.js — Raiz Patrimônio · Financeiro (Recebimentos · Atrasados · Saídas
//                  · conciliação de extrato · recibo · detalhe do recebimento)
// Versão: 1.38.0 · 07/10/2026
//
// v1.38.0 (07/10/2026, sessão 20261007-1845-financeiro, demanda f3e6cd27 — P5a.2, plano P5 v1.3.0 com de acordo
// do Nicola 07/10 18:45; ajustes do protótipo pedidos 12:52) — CARTÃO: (1) a sugestão da compra segue o padrão
// da conciliação: "Parece: categoria · ativo · fornecedor" na lista e a etiqueta ✨ com a confiança; sai o botão
// "Aceitar" — o toque abre a confirmação (como no extrato). (2) Ações da compra classificada: Mudar classificação,
// Voltar para em aberto (D47), Resumo da conciliação (data e hora, origem "Fatura de cartão", modo, quem, canal —
// colunas F7) e Excluir compra com o aviso "só volta importando a fatura de novo" (D47). (3) Importar: a
// conferência compara com a fatura no banco (simulação): novas, já na fatura e no Raiz e não vieram no arquivo
// (marcar para excluir); fatura já paga só recebe compra nova com confirmação. (4) Extrato: "Parece:" também
// mostra o ativo do destino sugerido, na lista e na confirmação. (5) Cartão sai das contas de lançamento (nova
// despesa, trocar conta, filtro) — o banco recusa (F8). Versão anterior: 1.37.2.
//
// Versão anterior: 1.37.2 · 07/10/2026
//
// v1.37.1 (07/10/2026, sessão 20261007-1721-rolo-changelog, demanda 2507d554 — VER-06, "de acordo" do Nicola 07/10 17:21) — SÓ
// CABEÇALHO: as versões além das 5 mais recentes rolaram para o CHANGELOG_MODULOS.md.
// Nenhuma linha de código mudou — conferido token a token contra o publicado.
//
// Versão anterior: 1.37.0 · 07/10/2026
//
// v1.37.0 (07/10/2026, sessão 20261007-0910-financeiro, demanda f3e6cd27 — P5a, fichas F1–F5 com de
// acordo do Nicola 07/10 09:09; protótipo PROTOTIPO_CARTAO_FATURA_RAIZ v1.0.0) — CARTÃO DE CRÉDITO:
// (1) Saídas mostram cada fatura como UMA linha (soma das compras do mês, "N a classificar", status
// da fatura); toque abre a fatura (financeiroAbrirFatura). (2) Fatura: fechamento, vencimento, total,
// conta que paga, progresso; "A classificar" em cima com a sugestão do Raiz e "Aceitar"; "Selecionar"
// classifica em lote; toque na compra: Classificar (categoria em árvore, ativo, fornecedor — inclusive
// cadastrar —, "Sempre assim"), Divisão (editor único) e Excluir compra. (3) "Marcar como paga" (baixa
// manual; com extrato, a regra CT03 liga sozinha). (4) Lançar ganha "Importar fatura do cartão (IA)"
// (código cartao.importar): cartão, PDF/foto lido pela IA, conferência (mês, total × soma, final do
// cartão) e importação. Toda regra no banco (fn_fatura_listar/importar/item_classificar/baixar).
// Versão anterior: 1.36.0.
//
// Versão anterior: 1.36.0 · 07/10/2026
//
// v1.36.0 (07/10/2026, sessão 20261007-0205-financeiro, demanda f3e6cd27 — teste do Nicola 02:03;
// decisões D39/D40): Outras receitas ganham as mesmas ações do recebimento — "Conta" (trocar a conta,
// com mais de 1 conta) e "Divisão" (quem arca: propriedade do ativo, inclusive veículo e outros
// ativos, ou ajustada só nesta receita). A Distribuição passa a considerar essas receitas (banco).
// Toda receita da lista abre o sheet (antes só as manuais); estornar/excluir continuam só nas
// manuais. A linha mostra "divisão ajustada" quando houver exceção. Versão anterior: 1.35.1.
//
// v1.35.1 (07/10/2026, sessão 20261007-0158-financeiro — pedido do Nicola 01:58: "tela amontoada,
// padronize as 3"): "Editar divisão" passa a usar o editor único rzEditarDivisao (raiz-ui 1.2.0),
// o mesmo da divisão do contrato/imóvel e da propriedade do ativo. Versão anterior: 1.35.0.
// --------------------------------------------------------------------------
// Versões anteriores (v1.35.0 … v1.35.0): CHANGELOG_MODULOS.md, na raiz do repositório — o
// gerar_versoes.py rola pra lá automaticamente tudo além das 5 versões
// mais recentes deste cabeçalho (VER-06).
export const VERSAO = '1.38.0'; // v-check: lido por ⚙️ › Conta › Versões — manter igual ao header

// v1.17.0 (Fase 1 do wrapper de escrita, rollout Financeiro) — emitirEscrita
// é o evento padrão pra "algo mudou que módulos DE FORA deste arquivo podem
// precisar saber" (ver changelog do topo). aoEscrever usado só pelo listener
// interno registrado em montarAbaFinanceiro(), logo abaixo.
import { emitirEscrita, aoEscrever } from './raiz-eventos.js';
// v1.28.0 (UXR-30, D25) — substitutos dos diálogos nativos (js/raiz-ui.js 1.0.0).
import { rzToast, rzConfirmar, rzAviso, rzEscolher, rzEditarDivisao } from './raiz-ui.js';

/** Ponto de entrada do switchTab (1 chamada por troca de aba; barato). */
export function montarAbaFinanceiro(tabId) {
    // v1.30.1 — rotinas podem ter sido ligadas/desligadas em Minha empresa
    // desde a última visita: reverifica nesta entrada (fechamento também).
    financeiroRotinaReverificar = true;
    if (typeof window !== 'undefined') window.__rzFinRotinasEpoca = (window.__rzFinRotinasEpoca || 0) + 1;
    // v1.17.0 (Fase 1 do wrapper de escrita) — assina 1x por boot o evento
    // padrão de escrita pras 4 entidades que este módulo emite (despesa/
    // mensalidade/conciliacao/recibo — ver changelog do topo). Guard por
    // window.* de propósito: montarAbaFinanceiro roda a cada troca de aba,
    // um listener duplicado dispararia o refresh 2x a cada escrita (mesmo
    // cuidado do listener 'ativo' em index.html). Sem um "boot" único e
    // separado neste módulo (é só um objeto de funções soltas, sem classe/
    // inicializador), este é o ponto mais natural: primeira função chamada
    // sempre que a aba Financeiro é aberta. Só redesenha a aba que estiver
    // ATIVA agora — as outras já se resolvem sozinhas ao serem abertas
    // (montarAbaFinanceiro busca de novo a cada entrada).
    if (!window.__rzListenerEscritaFinanceiroLigado) {
        window.__rzListenerEscritaFinanceiroLigado = true;
        aoEscrever('*', (detalhe) => {
            if (!['despesa', 'mensalidade', 'conciliacao', 'recibo', 'receita', 'repasse'].includes(detalhe.entidade)) return;
            if (document.getElementById('tab-socios')?.classList.contains('active')) { if (detalhe.entidade !== 'repasse') renderDistribuicao(); return; } // v1.29.0 — a própria tela já recarrega depois de lançar/excluir retirada
            if (document.getElementById('tab-mensal')?.classList.contains('active')) { financeiroRenderCabecalho('mensal'); renderMensalidades(); renderOutrasReceitas(); }
            else if (document.getElementById('tab-inadimplencia')?.classList.contains('active')) { renderInadimplencia(); }
            else if (document.getElementById('tab-saidas')?.classList.contains('active')) { financeiroRenderCabecalho('saidas'); renderSaidas(); }
            else if (document.getElementById('tab-conciliacao')?.classList.contains('active')) { financeiroRenderCabecalho('conciliacao'); carregarConciliacaoUnificada(); }
        });
    }
    if (tabId === 'tab-mensal') { financeiroRenderCabecalho('mensal'); renderMensalidades(); renderOutrasReceitas(); }
    else if (tabId === 'tab-socios') { renderDistribuicao(); } // v1.29.0 — Distribuição (P1b)
    else if (tabId === 'tab-inadimplencia') { renderInadimplencia(); }
    else if (tabId === 'tab-saidas') { financeiroRenderCabecalho('saidas'); renderSaidas(); }
    // v1.178.2 — Etapa 7/8 + retirada do painel de Pendências legado:
    // Conciliação é aba própria, só carregarConciliacaoUnificada() agora
    // (renderPendenciasExtrato() removida — painel legado retirado).
    else if (tabId === 'tab-conciliacao') { financeiroRenderCabecalho('conciliacao'); carregarConciliacaoUnificada(); }
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// v1.16.0 (demanda 60284322) — ver changelog do topo do arquivo.
export function resetarFinanceiroParaAbaInicial() {
    financeiroCompetenciaAtual = null;
}

// ============================================================================
// ENTREGA F.1 (21/09/2026 — PLANO_IMPLEMENTACAO_RESULTADOS_MERCADO_FISCAL
// v2.0.0, REGRAS_EXPERIENCIA_RAIZ v3.18.0 §11) — "Totalizadores e
// reordenação do Financeiro (preservando chips e listas)".
//
// Card de competência (‹ Mês/Ano ›) sozinho no topo de Recebimentos e
// Saídas + camada de chips de nível superior (Recebimentos · Saídas ·
// Fechamento, substituindo o antigo .rz-seg — REGRAS §7: "NUNCA chips e
// segmento para a mesma decisão") + 4 KPIs de totalizador que agora vêm de
// fn_financeiro_totalizadores (banco), nunca de soma no cliente.
//
// DECISÃO TÉCNICA (registrada pra não repetir a investigação): o card de
// competência é um estado NOVO e independente do <select> escondido
// (men-filtro-competencia/saidas-filtro-competencia) que a lupa de Buscar já
// usa pra filtrar a LISTA. Cheguei a cogitar unificar os dois, mas
// popularFiltrosSaidas()/popularFiltrosMensal() só aceitam, como valor do
// select, uma competência que já tenha lançamento/mensalidade carregado —
// qualquer valor fora da lista de opções é descartado e volta pra "todos"
// (linha 554/558 acima). Isso quebraria o caso mais comum de um flip de
// mês: navegar pra um mês futuro (ou um mês já 100% quitado) que ainda não
// tem nada na lista. Por isso o card de competência SÓ alimenta os 4 KPIs
// (via RPC, que devolve zero de boa pra mês vazio); a lista continua
// exatamente como hoje, agrupada por todas as competências, com seu próprio
// filtro (Buscar) intocado. Unificar os dois de verdade é trabalho da
// Entrega F.2 (Fechamento da competência), que introduz a competência
// "corrente" de verdade (fn_fechamento_verificar/fechar/reabrir).
//
// REVISTO NA ENTREGA F.3 (21/09/2026 — achado do Nicola: "uma vez que tem
// o chip do mês no topo, não precisa mais ter os agrupamentos e filtros
// por competência"): a cautela acima segue válida para o CARD (continua
// alimentando só os 4 KPIs), mas a LISTA deixou de ter filtro/agrupamento
// próprio de competência — renderMensalidades()/renderSaidas() agora leem
// financeiroCompetenciaAtual direto (mesma fonte do card) e mostram só
// essa competência, sem agrupar por mês. O <select> escondido
// (men-/saidas-filtro-competencia) e o agrupamento colapsável
// (gruposMensalAbertos/gruposSaidasAbertos, alternarGrupoMensal/Saidas)
// saíram junto — deixaram de ter consumidor. Um mês futuro/vazio agora
// mostra a lista vazia mesmo (mesmo comportamento do KPI zerado) — é a
// consequência aceita da unificação, não um bug.
let financeiroCompetenciaAtual = null; // 'YYYY-MM-01'; null = ainda não inicializada (usa o mês corrente)
let financeiroRotinaFechamentoClienteId = null; // v1.30.1
let financeiroRotinaReverificar = false; // v1.30.1 — true a cada entrada na aba
let financeiroRotinaFechamentoLigada = null; // null = ainda não verificado nesta sessão; true/false depois

function financeiroCompetenciaHojeISO() {
    const h = new Date();
    return `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, '0')}-01`;
}

// Entrega F.2 — único ponto que ESCREVE financeiroCompetenciaAtual, pra
// nunca esquecer de espelhar em window.RZ_FIN_COMPETENCIA (fechamento.js
// lê essa variável; módulos isolados não se importam, ver nota do topo).
function financeiroDefinirCompetencia(iso) {
    financeiroCompetenciaAtual = iso;
    if (typeof window !== 'undefined') window.RZ_FIN_COMPETENCIA = iso;
}

function financeiroCompetenciaLabel(iso) {
    const nomes = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const [ano, mes] = iso.split('-');
    return `${nomes[parseInt(mes, 10) - 1]}/${ano}`;
}

/** Flip ‹ › do card de competência — reage em qual das 3 abas estiver
 * ativa agora (Entrega F.2: Fechamento também tem o card, ver
 * financeiroRenderCabecalho e js/fechamento.js).
 * Entrega F.4 (21/09/2026, pedido explícito — REVERTE a decisão da F.1/F.2
 * registrada aqui antes) — Conciliação deixou de ter filtro de competência
 * próprio: agora ela também recarrega a LISTA no flip de mês (não só o
 * card), igual Recebimentos/Saídas. */
export function financeiroMudarCompetencia(delta) {
    if (!financeiroCompetenciaAtual) financeiroDefinirCompetencia(financeiroCompetenciaHojeISO());
    const [ano, mes] = financeiroCompetenciaAtual.split('-').map(Number);
    const passo = (document.getElementById('tab-socios')?.classList.contains('active') && distribModo === 'ano') ? delta * 12 : delta; // v1.29.0 — Distribuição no modo Ano anda de ano em ano
    const d = new Date(ano, (mes - 1) + passo, 1);
    financeiroDefinirCompetencia(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`);
    if (document.getElementById('tab-mensal')?.classList.contains('active')) montarAbaFinanceiro('tab-mensal');
    else if (document.getElementById('tab-saidas')?.classList.contains('active')) montarAbaFinanceiro('tab-saidas');
    else if (document.getElementById('tab-conciliacao')?.classList.contains('active')) montarAbaFinanceiro('tab-conciliacao');
    else if (document.getElementById('tab-socios')?.classList.contains('active')) montarAbaFinanceiro('tab-socios');
}

/** Seletor de nível Recebimentos · Saídas · Fechamento — 1 cópia por aba
 * (tab-mensal/tab-saidas/tab-conciliacao), cada uma sempre com a SUA
 * própria opção marcada .rz-on (não é um estado compartilhado — quem
 * decide qual está "ativa" é em qual das 3 seções esta cópia vive).
 * Entrega F.4 (21/09/2026, pedido explícito — "deve seguir o padrao do
 * seletor da tela de visao geral") — virou .rz-seg (era .rz-chips desde a
 * F.1). Fechamento desligado por rotina continua "bloqueado com motivo"
 * (REGRAS §7/§11 — semântica de chip, não de segmento), só que agora como
 * opção .rz-off dentro do próprio .rz-seg (CSS genérico, não mais preso a
 * .rz-chip). CORRIGIDO (QUA-01, achado revisando esta função): o contador
 * da badge comparava `x.status`, campo que não existe em
 * extrato_fingerprints (é `status_conciliacao`) — a badge nunca mostrava
 * nada de verdade. Agora conta em cima do próprio cache, que desde esta
 * entrega só guarda pendente+não controlado (ver carregarConciliacaoUnificada). */
function financeiroChipsNivelHtml(aba) {
    // v1.28.0 (UXR-25, demanda 94245176) — 4ª opção "Distribuição" (retiradas
    // e distribuição por sócio, vinda de Resultados — D24 do estudo de UX).
    // Gate do catálogo repasses.ver: sem direito, aparece com cadeado e o
    // toque mostra o motivo (REGRAS regra 9, ACE-04) — nunca some.
    // "Recebimentos" tem rótulo curto em tela estreita (.rz-seg-4, index.html).
    const fechamentoOff = financeiroRotinaFechamentoLigada === false;
    const distrib = (typeof podeUsar === 'function') ? podeUsar('repasses.ver') : { ok: true };
    const itens = [
        { chave: 'mensal', rotulo: '<span class="rz-seg-l">Recebimentos</span><span class="rz-seg-s">Receb.</span>', tab: 'tab-mensal' },
        { chave: 'saidas', rotulo: 'Saídas', tab: 'tab-saidas' },
        { chave: 'conciliacao', rotulo: 'Conciliação', tab: 'tab-conciliacao', off: fechamentoOff }, // v1.21.0 — pedido explícito: "Mude o titulo da aba fechamento para conciliacao"
        { chave: 'socios', rotulo: 'Distribuição', tab: 'tab-socios', bloqueio: distrib.ok ? null : 'repasses.ver' },
    ];
    return itens.map(it => {
        const off = it.off || !!it.bloqueio;
        const classes = [it.chave === aba ? 'rz-on' : '', off ? 'rz-off' : ''].filter(Boolean).join(' ');
        const onclick = it.bloqueio ? `rzMostrarBloqueio('${it.bloqueio}')` : (it.off ? 'rzTocarChipFechamentoDesligado()' : `switchTab('${it.tab}')`);
        const nPend = it.chave === 'conciliacao' ? conciliacaoUniCache.filter(x => x.status_conciliacao === 'pendente').length : 0;
        const contador = nPend ? ` <span class="rz-n">${nPend}</span>` : '';
        return `<button type="button" class="${classes}" onclick="${onclick}"${off ? ' aria-disabled="true"' : ''}>${it.rotulo}${contador}</button>`;
    }).join('');
}

function financeiroRedesenharChipsNivel() {
    ['mensal', 'saidas', 'conciliacao'].forEach(aba => {
        const el = document.getElementById(`fin-chips-nivel-${aba}`);
        if (el) el.innerHTML = financeiroChipsNivelHtml(aba);
    });
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ============================================================================
// v1.18.0 (demanda 0e40951a — redesenho do Financeiro, pedido explícito do
// Nicola 22/09/2026): "Reorganizar os botoes... para as funcoes, extrato,
// adicionar, abrir/fechar compentencia, compartilhar com contador: colocar
// a esquerda o botão e uma explicação da funcao na frente. Colocar 2
// botoes a direita e dois a esquerda como se fosse 4 quadrantes, 1 pra
// cada função. As 4 funcoes sao aplicaveis as 3 telas." Substitui a fileira
// de ícones soltos (.rz-ico-btn) que existia nos 3 cabeçalhos — grid 2x2
// (.rz-fin-quad-grid, index.html) com ícone+título+explicação por célula,
// texto QUEBRANDO linha de propósito (era a causa do achado "mensagens
// saindo da tela"). O 3º quadrante (Fechar/Reabrir) é preenchido por
// js/fechamento.js (fechamentoRenderBotaoDedicado, mesmo id
// fin-quad-fechamento-${aba}) — módulos isolados, mesmo padrão de ponte já
// usado pro card de competência (ver financeiroRenderCabecalho).
//
// v1.19.0 (pedido explícito do Nicola, 22/09/2026, em resposta direto à
// pergunta feita na entrega anterior) — "Adicionar" DEIXOU de ser
// contextual: a decisão "não existe criar recebimento avulso" (v1.6.5)
// foi revertida — abrirNovoRecebimento() abaixo é a funcionalidade nova.
// O quadrante agora abre abrirAcoesAdicionarFinanceiro(), mesmo menu nas
// 3 abas, com 2 ações (Novo recebimento / Nova despesa).
// v1.20.0 (demanda 7bdcb8d4, pedido explícito do Nicola 23/09/2026: "Fazer
// caber 6 botoes, trazendo a opcao fiscal para um dos botoes... Os botoes
// devem sinalizar seus status (sinalizar com cor do icone ou do botao) a
// depender do status da compentencia, ex nao posso adicionar mais itens se
// ja ta fechada") — grid 3x2, mesma ordem nas 3 abas:
//   Extrato · Adicionar · Fechar/Abrir competência · Contador · Fiscal · Atrasados
// O ESTADO vem de js/fechamento.js, publicado em window (módulos isolados,
// mesmo padrão de window.RZ_FIN_COMPETENCIA_FECHADA):
//   window.RZ_FIN_FECHAMENTO — null enquanto verifica a competência; depois
//     { status: 'aberto'|'concluido'|'sem_rotina', fechadoEm, motivo,
//       pendencias: { tem, recebimentosEmAtraso, saidasEmAtraso } }
//   window.RZ_FIN_FISCAL — null enquanto verifica; depois { ligada, total, notas } (notas: v1.23.0)
// fechamento.js chama financeiroRedesenharQuadrantes() quando o estado muda.
// Regras de status:
//   · competência FECHADA → Adicionar indisponível (toque explica e aponta
//     pro "Abrir competência"); Fechar vira "Abrir" com cadeado verde e a
//     data do fechamento; Contador verde (pronto pra enviar).
//   · ABERTA → Fechar com ícone de atenção se há atraso; Contador apagado
//     (continua tocável: envia competências anteriores já fechadas).
//   · rotina de fechamento desligada → Fechar e Contador indisponíveis,
//     toque leva a Empresa › Rotinas (mesmo destino do chip Fechamento).
//   · Fiscal: verde sem pendência, atenção com N pendências, indisponível
//     com a rotina nfse_competencia desligada.
//   · Atrasados: vermelho com o valor em atraso, verde quando não há.
// Extrato fica sempre disponível: o import cobre várias datas e o banco já
// bloqueia gravação em competência fechada (trigger), então travar aqui
// esconderia o extrato dos outros meses.
function financeiroMesExtenso(iso) {
    const nomes = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
    return nomes[parseInt(String(iso || financeiroCompetenciaHojeISO()).split('-')[1], 10) - 1];
}

// v1.28.0 (UXR-25, demanda 94245176 — absorve a F3.4 do PLANO_UX) — a grade
// 3x2 vira o card "Rotinas de <mês>", com 4 linhas e estado: Fechar/Reabrir o
// mês · Contador · Fiscal · Atrasados. Importar e Adicionar saíram da grade e
// foram para o "+" do topo (abrirLancarFinanceiro, UXR-12). Os ESTADOS são os
// mesmos da v1.20.0 (window.RZ_FIN_FECHAMENTO / RZ_FIN_FISCAL, publicados por
// js/fechamento.js) — só a forma mudou: linha (.rz-row) com placa, título,
// 1 linha de contexto e status (renderStatus), em vez de botão de grade.
// Rotina desligada aparece desabilitada com o motivo (UXR-25) e leva a
// Empresa › Rotinas, como antes.
function financeiroRotinasHtml(aba) {
    const esc = (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
    const st = (cod, rot) => (typeof renderStatus === 'function') ? renderStatus(cod, rot) : esc(rot);
    const linha = ({ icone, sem = '', titulo, sub, status = '', onclick, off = false }) => `
        <div class="rz-row rz-link${off ? ' rz-off' : ''}" role="button" tabindex="0" onclick="${esc(onclick)}"${off ? ' aria-disabled="true"' : ''}>
            <div class="rz-ic${sem ? ' rz-' + sem : ''}"><svg data-lucide="${off ? 'lock' : icone}"></svg></div>
            <div class="rz-tx"><b>${esc(titulo)}</b><span>${esc(sub)}</span></div>
            <div class="rz-rt">${status}</div>
            <svg data-lucide="chevron-right" class="rz-chev"></svg>
        </div>`;

    const est = (typeof window !== 'undefined') ? (window.RZ_FIN_FECHAMENTO || null) : null;
    const fis = (typeof window !== 'undefined') ? (window.RZ_FIN_FISCAL || null) : null;
    const rotinaOff = financeiroRotinaFechamentoLigada === false || est?.status === 'sem_rotina';
    const fechada = est?.status === 'concluido';
    const pend = est?.pendencias || null;

    let fechar;
    if (rotinaOff) {
        fechar = linha({ icone: 'lock-open', titulo: 'Fechar o mês', sub: 'Rotina de fechamento desligada', status: st('neu', 'Desligada'), off: true, onclick: 'rzTocarChipFechamentoDesligado()' });
    } else if (!est) {
        fechar = linha({ icone: 'lock-open', sem: 'neu', titulo: 'Fechar o mês', sub: 'Verificando…', onclick: 'fechamentoAlternarBotao()' });
    } else if (fechada) {
        const quando = est.fechadoEm ? `Fechado em ${new Date(est.fechadoEm).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}` : 'Fechado';
        fechar = linha({ icone: 'lock', sem: pend?.tem ? 'warn' : '', titulo: 'Reabrir o mês', sub: quando, status: st('ok', 'Fechado'), onclick: 'fechamentoAlternarBotao()' });
    } else {
        fechar = linha({ icone: 'lock-open', sem: pend?.tem ? 'warn' : '', titulo: 'Fechar o mês',
                         sub: pend?.tem ? 'Há atrasos neste mês' : 'Fecha a competência', status: st(pend?.tem ? 'warn' : 'neu', 'Aberto'), onclick: 'fechamentoAlternarBotao()' });
    }

    const contador = rotinaOff
        ? linha({ icone: 'send', titulo: 'Contador', sub: 'Rotina de fechamento desligada', status: st('neu', 'Desligada'), off: true, onclick: 'rzTocarChipFechamentoDesligado()' })
        : linha({ icone: 'send', titulo: 'Contador', sub: fechada ? 'Pacote deste mês' : 'Meses já fechados',
                  status: fechada ? st('ok', 'Pronto') : st('neu', 'Aguardando'), onclick: 'fechamentoAbrirCompartilharContador()' });

    let fiscal;
    if (!fis) {
        fiscal = linha({ icone: 'file-check-2', sem: 'neu', titulo: 'Fiscal', sub: 'Verificando…', onclick: 'abrirFiscalCompetencia()' });
    } else if (!fis.ligada) {
        fiscal = linha({ icone: 'file-check-2', titulo: 'Fiscal', sub: 'Rotina fiscal desligada', status: st('neu', 'Desligada'), off: true, onclick: 'financeiroIrParaRotinas()' });
    } else if (fis.notas && (fis.notas.aPreparar + fis.notas.preparadas) > 0) {
        const n = fis.notas.aPreparar + fis.notas.preparadas; // v1.23.0 — notas do mês primeiro
        fiscal = linha({ icone: 'file-check-2', sem: 'warn', titulo: 'Fiscal', sub: `${n} nota${n > 1 ? 's' : ''} a preparar`, status: st('warn', String(n)), onclick: 'abrirFiscalCompetencia()' });
    } else if (fis.total === 0) {
        fiscal = linha({ icone: 'file-check-2', titulo: 'Fiscal', sub: 'Pronto para NFS-e', status: st('ok', 'Em dia'), onclick: 'abrirFiscalCompetencia()' });
    } else {
        fiscal = linha({ icone: 'file-check-2', sem: 'warn', titulo: 'Fiscal', sub: `${fis.total} pendência${fis.total > 1 ? 's' : ''} para NFS-e`, status: st('warn', String(fis.total)), onclick: 'abrirFiscalCompetencia()' });
    }

    const valorAtraso = Number(pend?.recebimentosEmAtraso || 0);
    // sem rotina / falha de verificação: o banco não calculou pendências — neutro, nunca "nada em atraso"
    const atrasados = (!est || est.status === 'sem_rotina' || est.status === 'indisponivel')
        ? linha({ icone: 'alarm-clock', sem: 'neu', titulo: 'Atrasados', sub: 'Todos os meses', onclick: 'abrirTelaAtrasados()' })
        : valorAtraso > 0
            ? linha({ icone: 'alarm-clock', sem: 'bad', titulo: 'Atrasados', sub: 'Em atraso neste mês', status: st('bad', formatarMoedaBR(valorAtraso)), onclick: 'abrirTelaAtrasados()' })
            : linha({ icone: 'alarm-clock', titulo: 'Atrasados', sub: 'Nada em atraso neste mês', status: st('ok', 'Em dia'), onclick: 'abrirTelaAtrasados()' });

    return `<div class="rz-card rz-list"><div class="rz-card-h" style="padding-top:10px;margin-bottom:0"><h3>Rotinas de ${financeiroMesExtenso(financeiroCompetenciaAtual)}</h3></div>${fechar}${contador}${fiscal}${atrasados}</div>`;
}

// v1.20.0 — cadeado ao lado do mês (#fin-competencia-lock-*), só com a
// competência fechada (pedido explícito). Mesmo estado dos botões.
function financeiroRenderCadeadoCompetencia() {
    const fechada = (typeof window !== 'undefined') && window.RZ_FIN_FECHAMENTO?.status === 'concluido';
    ['mensal', 'saidas', 'conciliacao'].forEach(aba => {
        const el = document.getElementById(`fin-competencia-lock-${aba}`);
        if (el) el.classList.toggle('hidden', !fechada);
    });
}

// v1.20.0 — chamado por js/fechamento.js (ponte window) sempre que o estado
// da competência ou do fiscal muda. Redesenha os 6 botões das 3 abas (só as
// já montadas) e o cadeado.
export function financeiroRedesenharQuadrantes() {
    ['mensal', 'saidas', 'conciliacao'].forEach(aba => {
        const el = document.getElementById(`fin-rotinas-${aba}`); // v1.28.0 — card Rotinas (era a grade fin-quadrantes-*)
        if (el) el.innerHTML = financeiroRotinasHtml(aba);
    });
    financeiroRenderCadeadoCompetencia();
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// v1.20.0 — toque no Fiscal indisponível: leva a Empresa › Rotinas (mesmo
// destino/padrão de rzTocarChipFechamentoDesligado).
export function financeiroIrParaRotinas() {
    if (typeof mostrarToast === 'function') mostrarToast('A rotina fiscal (NFS-e) está desligada. Ative em Empresa › Rotinas.', 'info');
    switchTab('tab-minha-empresa');
    setTimeout(() => document.getElementById('cme-rotinas-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
}

// v1.28.0 (UXR-10/12, demanda 94245176) — o "+" do topo do Financeiro abre
// "Lançar": um Sheet só com o que era Importar + Adicionar (a v1.19.0/v1.21.0
// tinha 2 botões e 2 menus). IA no topo (rzOrdenarAcoes). Competência fechada:
// Adicionar recebimento/saída aparecem com o motivo e o toque explica — o
// mesmo bloqueio da grade antiga. "Falar um lançamento" (UXR-12) só entra
// quando a Raiz IA embutida existir (F4.1); "Importar fatura de cartão" entra
// na onda P5 com código próprio no catálogo (REGRAS regra 9: sem código, não
// entra no menu). Reprocessar fica disponível só a partir de Conciliação.
export function abrirLancarFinanceiro(aba) {
    if (typeof abrirSheetAcoes !== 'function') return;
    const fechada = (typeof window !== 'undefined') && window.RZ_FIN_FECHAMENTO?.status === 'concluido';
    const avisoFechada = () => rzToast('Competência fechada. Reabra o mês em "Rotinas" para lançar algo nele.', { tipo: 'info' });
    const acoes = [
        { icone: 'file-down', tipo: 'ia', titulo: 'Importar extrato (IA)', codigo: 'conciliacao.importar', sub: 'Excel do Itaú, PDF ou foto — a Raiz IA concilia', aoTocar: () => document.getElementById('extrato-file-input')?.click() },
        { icone: 'credit-card', tipo: 'ia', titulo: 'Importar fatura do cartão (IA)', codigo: 'cartao.importar', sub: 'PDF ou foto — compra por compra, com o que o Raiz já aprendeu', aoTocar: () => financeiroImportarFatura() }, // v1.37.0 (P5a)
        { icone: 'file-plus', tipo: 'ia', titulo: 'Ler um documento (IA)', codigo: 'cofre.analisar_ia', sub: 'Comprovante, boleto ou nota — a Raiz IA classifica e vincula', aoTocar: () => { if (typeof abrirUploadDocumentoNoApp === 'function') abrirUploadDocumentoNoApp(); } },
        { icone: 'arrow-down-left', titulo: 'Adicionar recebimento', sub: fechada ? 'Competência fechada — reabra para lançar' : 'De um contrato ou sem contrato', aoTocar: () => fechada ? avisoFechada() : abrirAdicionarRecebimento() },
        { icone: 'arrow-up-right', titulo: 'Adicionar saída', sub: fechada ? 'Competência fechada — reabra para lançar' : 'Despesa, tributo, manutenção', aoTocar: () => fechada ? avisoFechada() : abrirNovaDespesa() },
    ];
    if (aba === 'conciliacao') {
        acoes.push({ icone: 'refresh-cw', titulo: 'Reprocessar pendências', codigo: 'conciliacao.resolver', sub: 'Refaz a comparação nas pendências, se algo mudou depois da importação', aoTocar: () => reprocessarConciliacaoPendente() });
    }
    abrirSheetAcoes({ titulo: 'Lançar', sub: financeiroCompetenciaLabel(financeiroCompetenciaAtual || financeiroCompetenciaHojeISO()), acoes });
}

// v1.28.0 — barra de busca do topo (UXR-10/11): abre o filtro da lista da aba
// em que está (os mesmos overlays de antes; a busca universal é a F2.3).
export function abrirBuscaFinanceiro(aba) {
    if (aba === 'saidas') return abrirBuscaSaidas();
    if (aba === 'conciliacao') return abrirBuscaConciliacao();
    return abrirBuscaMensal();
}

// Mantidas por compatibilidade (ponte window do index.html e chamadas antigas):
// as duas abrem o mesmo "Lançar".
export function abrirAcoesAdicionarFinanceiro() { abrirLancarFinanceiro(); }

// ============================================================================
// v1.19.0 (demanda 0e40951a, complemento — pedido explícito do Nicola,
// 22/09/2026, em resposta à pergunta feita na entrega anterior sobre o
// quadrante "Adicionar"): "O quadrante 'Adicionar' deve permitir adicionar
// um recebimento ou uma despesas. Como adicionar um recebimento e uma
// funcionalidade nova, adicione esta possibilidade tb no card financeiro
// do contrato. Ao criar um recebimento, perguntar se ja quer entrar
// recebido ou a receber. Se for recebido entrar com a baixa finalizada, e
// se for em aberto, inclui-lo no ha receber."
//
// abrirNovoRecebimento(contratoIdPreSelecionado) — 2 pontos de entrada:
//   · Financeiro › Recebimentos/Saídas/Fechamento, quadrante Adicionar →
//     abrirNovoRecebimento() SEM contrato (mostra um <select> com todos os
//     contratos 'Ativo' — mensalidade sem contrato_id não aparece em
//     nenhuma lista do app, ver renderMensalidades()/abrirFichaContrato()).
//   · card "Financeiro" da Ficha do contrato (contratos.js,
//     abrirAcoesCobrancasContrato) → abrirNovoRecebimento(contratoId) JÁ
//     com o contrato certo, sem seletor.
//
// Grava direto em `mensalidades` (mesma tabela de sempre, sem RPC nova —
// mesmo padrão de escrita client-side que liquidarMensalidade/
// sincronizarMensalidadeSupabase já usam). Campos NÃO preenchidos aqui
// (multa/taxa/energia/iptu/condominio, envio_log, chave_transacao_origem)
// ficam null — só existem depois de uma baixa/conciliação de verdade,
// mesmo comportamento de uma mensalidade nascida do cron/fn_gerar_
// mensalidades_competencia. valor_confirmado é o ÚNICO campo de valor
// da tabela (conferido no schema) — serve tanto de "previsto" (linha
// pendente) quanto de "pago" (linha liquidada), exatamente como as
// mensalidades que nascem do contrato.
// "Já recebido" grava status='pago' + data_pgto/banco direto — SEM passar
// por liquidarMensalidade() (que é pra dar baixa numa pendente já
// existente) — "entrar com a baixa finalizada" é um único INSERT.
// "A receber" grava status='pendente', data_pgto/banco null — dataVencMensal()
// (renderMensalidades/abrirFichaContrato) já sabe calcular a data de
// vencimento exibida a partir de referencia + con.vencimentoDia quando
// data_pgto vem vazio (mesmo fallback usado pra mensalidade legada).
// ============================================================================
export async function abrirNovoRecebimento(contratoIdPreSelecionado) {
    if (typeof abrirSheetForm !== 'function') return;
    const con = contratoIdPreSelecionado ? contratos.find(c => c.id === contratoIdPreSelecionado) : null;

    let campoContrato;
    if (con) {
        campoContrato = `<input type="hidden" id="nrec-contrato" value="${con.id}">
            <div class="rz-f"><label>Contrato</label><div style="padding:8px 0 2px;font-size:13px;font-weight:bold;color:var(--pine)">${escapeHtmlSaidas(con.locatario || 'Locatário')}</div></div>`;
    } else {
        const ativos = contratos.filter(c => c.status === 'Ativo').slice()
            .sort((a, b) => (a.locatario || '').localeCompare(b.locatario || ''));
        if (!ativos.length) {
            mostrarToast('Nenhum contrato ativo para lançar um recebimento.', 'danger');
            return;
        }
        const optsContrato = `<option value="">— selecionar —</option>` + ativos.map(c => {
            const imo = imoveis.find(i => i.id === c.imovelId);
            const rotulo = `${escapeHtmlSaidas(c.locatario || 'Locatário')} — ${escapeHtmlSaidas(imo ? (imo.empreendimento || imo.enderecoRua || '') : '')}`;
            return `<option value="${c.id}">${rotulo}</option>`;
        }).join('');
        campoContrato = `<div class="rz-f"><label>Contrato <i>*</i></label><select id="nrec-contrato" onchange="nrecAoTrocarContrato(this.value)">${optsContrato}</select></div>`;
    }

    const competenciaPadrao = dataParaCompetencia(financeiroCompetenciaAtual || financeiroCompetenciaHojeISO());
    const opcoesComp = [...new Set([competenciaPadrao, ...gerarProximasCompetencias(3)])];
    const optsCompetencia = opcoesComp.map(c => `<option value="${c}" ${c === competenciaPadrao ? 'selected' : ''}>${c}</option>`).join('');

    const corpo = `
        ${campoContrato}
        <div class="rz-f2">
            <div class="rz-f"><label>Competência <i>*</i></label><select id="nrec-competencia">${optsCompetencia}</select></div>
            <div class="rz-f"><label>Valor (R$) <i>*</i></label><input type="number" step="0.01" id="nrec-valor" value="${con?.valor ?? ''}"></div>
        </div>
        <div class="rz-f"><label>Situação <i>*</i></label>
            <input type="hidden" id="nrec-situacao" value="receber">
            <div class="rz-seg" id="nrec-seg-situacao">
                <button type="button" class="rz-on" data-v="receber" onclick="nrecAlternarSituacao('receber')">A receber</button>
                <button type="button" data-v="recebido" onclick="nrecAlternarSituacao('recebido')">Já recebido</button>
            </div>
        </div>
        <div id="nrec-campos-baixa" class="hidden">
            <div class="rz-f2">
                <div class="rz-f"><label>Forma de recebimento</label><select id="nrec-banco"><option value="PIX">PIX</option><option value="Boleto">Boleto</option><option value="Dinheiro">Dinheiro</option><option value="Transferência">Transferência</option><option value="Cheque">Cheque</option></select></div>
                <div class="rz-f"><label>Data do recebimento <i>*</i></label><input type="date" id="nrec-data" value="${new Date().toISOString().slice(0, 10)}"></div>
            </div>
        </div>
        <div class="rz-f"><label>Observação</label><input type="text" id="nrec-observacao" placeholder="Opcional"></div>`;

    abrirSheetForm({
        titulo: 'Novo recebimento', sub: con ? (con.locatario || '') : 'Recebimento avulso',
        corpo, rotuloSalvar: 'Salvar',
        aoSalvar: () => salvarNovoRecebimento(),
    });
}

// Só usado quando o contrato NÃO veio pré-selecionado (seletor visível) —
// pré-preenche o valor com o aluguel do contrato, mesmo padrão de sugestão
// de valor de montarPopupDespesa() (sugestoes.valor).
export function nrecAoTrocarContrato(contratoId) {
    const con = contratos.find(c => c.id === contratoId);
    const campoValor = document.getElementById('nrec-valor');
    if (campoValor) campoValor.value = con?.valor ?? '';
}

export function nrecAlternarSituacao(v) {
    const seg = document.getElementById('nrec-seg-situacao');
    if (seg) seg.querySelectorAll('button').forEach(b => b.classList.toggle('rz-on', b.dataset.v === v));
    const campo = document.getElementById('nrec-situacao');
    if (campo) campo.value = v;
    const camposBaixa = document.getElementById('nrec-campos-baixa');
    if (camposBaixa) camposBaixa.classList.toggle('hidden', v !== 'recebido');
}

export async function salvarNovoRecebimento() {
    const contratoId = document.getElementById('nrec-contrato')?.value;
    const competencia = document.getElementById('nrec-competencia')?.value;
    const valor = parseFloat(document.getElementById('nrec-valor')?.value);
    const situacao = document.getElementById('nrec-situacao')?.value || 'receber';
    const observacao = document.getElementById('nrec-observacao')?.value.trim();

    if (!contratoId) { mostrarToast('Selecione o contrato.', 'danger'); return false; }
    if (!competencia || isNaN(valor)) { mostrarToast('Preencha competência e valor.', 'danger'); return false; }

    const con = contratos.find(c => c.id === contratoId);
    if (!con) { mostrarToast('Contrato não encontrado.', 'danger'); return false; }

    const competenciaISO = competenciaParaData(competencia);
    // Mesma checagem que fn_gerar_mensalidades_competencia já faz no banco
    // (não deixa 2 mensalidades pro mesmo contrato na mesma competência) —
    // replicada aqui pra avisar ANTES de gravar (client-side, mensalidades
    // já carregadas na sessão; não é constraint de banco).
    if (mensalidades.some(m => m.contratoId === contratoId && m.referencia === competencia)) {
        mostrarToast('Este contrato já tem um recebimento lançado nessa competência.', 'danger');
        return false;
    }

    let banco = null, dataPgto = null;
    if (situacao === 'recebido') {
        banco = document.getElementById('nrec-banco')?.value || null;
        dataPgto = document.getElementById('nrec-data')?.value || null;
        if (!dataPgto) { mostrarToast('Informe a data do recebimento.', 'danger'); return false; }
    }

    mostrarCarregamentoGlobal('Salvando...');
    try {
        const linha = {
            cliente_id: CLIENTE_ID_SUPABASE,
            contrato_id: contratoId,
            competencia: competenciaISO,
            status: situacao === 'recebido' ? 'pago' : 'pendente',
            banco,
            data_pgto: dataPgto,
            observacao: observacao || null,
            valor_confirmado: valor,
        };
        const { data: criado, error } = await dbAuth.from('mensalidades').insert(linha).select('id').single();
        if (error) throw error;

        mensalidades = await carregarMensalidadesSupabase();
        // v1.19.0 (Fase 1 do wrapper de escrita) — ver changelog do topo.
        emitirEscrita('mensalidade', { id: criado.id, contratoId, acao: 'criar' });
        esconderCarregamentoGlobal();
        mostrarToast('Recebimento criado.', 'success');
        renderMensalidades();
        renderInadimplencia();
        if (typeof renderSociosDistribricao === 'function') renderSociosDistribricao();
    } catch (err) {
        esconderCarregamentoGlobal();
        mostrarToast('Erro ao criar recebimento: ' + err.message, 'danger');
        logScreen('Erro ao criar recebimento manual: ' + err.message, true);
        return false;
    }
}

// REGRAS §11/§7 ("regra 9 do §0"): chip que representa uma rotina desligada
// aparece desabilitado, com o motivo, e leva a Empresa › Rotinas — mesmo
// destino/padrão já usado pelos 5 alertas de rotina de escopo empresa
// (rzAbrirDestinoAlerta, case 'empresa/rotinas', Entrega AL.3).
async function financeiroVerificarRotinaFechamento() {
    // v1.30.1 — reverifica a cada entrada na aba (financeiroRotinaReverificar)
    // e quando a empresa muda; antes era 1x por sessão e ligar/desligar a
    // rotina em Minha empresa só aparecia depois de recarregar a página.
    const mesmaEmpresa = financeiroRotinaFechamentoClienteId === CLIENTE_ID_SUPABASE;
    if (financeiroRotinaFechamentoLigada !== null && mesmaEmpresa && !financeiroRotinaReverificar) return;
    financeiroRotinaReverificar = false;
    financeiroRotinaFechamentoClienteId = CLIENTE_ID_SUPABASE;
    const anterior = financeiroRotinaFechamentoLigada;
    try {
        const { data, error } = await dbAuth.rpc('fn_rotinas_empresa_listar', { p_cliente_id: CLIENTE_ID_SUPABASE });
        if (error) throw error;
        const linha = (data || []).find(r => r.codigo === 'fechamento_mensal');
        financeiroRotinaFechamentoLigada = linha ? !!linha.ligada : true; // rotina fora do catálogo não deve travar o chip
    } catch (e) {
        console.error('[financeiro] fn_rotinas_empresa_listar', e);
        financeiroRotinaFechamentoLigada = (anterior === null || !mesmaEmpresa) ? true : anterior; // falha de rede nunca trava o chip — só a rotina desligada de propósito trava
    }
    if (mesmaEmpresa && anterior === financeiroRotinaFechamentoLigada) return; // v1.30.1 — nada mudou, não redesenha
    financeiroRedesenharChipsNivel();
    financeiroRedesenharQuadrantes(); // v1.20.0 — Fechar/Contador dependem da rotina
}

export function rzTocarChipFechamentoDesligado() {
    if (typeof mostrarToast === 'function') mostrarToast('Fechamento mensal está desligado para esta empresa. Toque pra ativar em Empresa › Rotinas.', 'info');
    switchTab('tab-minha-empresa');
    setTimeout(() => document.getElementById('cme-rotinas-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
}

// 4 KPIs de totalizador — SEMPRE de fn_financeiro_totalizadores (banco),
// nunca somados no cliente (REGRAS §11). aba: 'mensal' (Recebimentos) ou
// 'saidas' (Saídas); Fechamento mantém o próprio hero (Pendentes/
// Conciliados), que não muda nesta entrega.
// v1.27.2 — lista de Saídas sempre fresca (mesma fonte dos totais).
let financeiroSaidasCarregando = false;
async function financeiroRecarregarSaidas() {
    if (financeiroSaidasCarregando || typeof carregarLancamentosSupabase !== 'function') return;
    financeiroSaidasCarregando = true;
    try {
        lancamentos = await carregarLancamentosSupabase();
        renderSaidas();
    } catch (e) {
        console.warn('[financeiro] recarregar saídas:', e.message);
    } finally { financeiroSaidasCarregando = false; }
}

// ---------------------------------------------------------------------------
// v1.33.0 — CONTAS (P4a). Regra no banco: fn_contas_listar já devolve só as
// contas visíveis e diz se a funcionalidade está liberada (Premium).
// ---------------------------------------------------------------------------
let financeiroContasInfo = { clienteId: null, liberado: false, contas: [] };
let financeiroContaFiltro = null; // null = todas as visíveis
let financeiroContasCarregando = null;
async function financeiroGarantirContas() {
    if (financeiroContasInfo.clienteId === CLIENTE_ID_SUPABASE) return financeiroContasInfo;
    if (financeiroContasCarregando) return financeiroContasCarregando;
    financeiroContasCarregando = (async () => {
        try {
            const { data, error } = await dbAuth.rpc('fn_contas_listar', { p_cliente_id: CLIENTE_ID_SUPABASE });
            if (error) throw error;
            const ativasP5 = (data?.dados || []).filter(c => c.situacao === 'ativa'); // v1.38.0 — cartão nunca é conta de lançamento (F8)
            financeiroContasInfo = { clienteId: CLIENTE_ID_SUPABASE, liberado: !!data?.liberado, contas: ativasP5.filter(c => c.tipo !== 'cartao_credito'), cartoes: ativasP5.filter(c => c.tipo === 'cartao_credito') };
        } catch (e) {
            console.warn('[financeiro] contas:', e.message);
            financeiroContasInfo = { clienteId: CLIENTE_ID_SUPABASE, liberado: false, contas: [] };
        }
        financeiroContaFiltro = null;
        financeiroContasCarregando = null;
        return financeiroContasInfo;
    })();
    return financeiroContasCarregando;
}
function financeiroContasMultiplas() {
    return financeiroContasInfo.clienteId === CLIENTE_ID_SUPABASE && financeiroContasInfo.liberado && financeiroContasInfo.contas.length > 1;
}
function financeiroNomeConta(id) {
    const c = financeiroContasInfo.contas.find(x => x.id === id);
    return c ? c.nome : '';
}
function financeiroChipContaHtml() {
    if (!financeiroContasMultiplas()) return '';
    const nome = financeiroContaFiltro ? financeiroNomeConta(financeiroContaFiltro) || 'Conta' : 'Todas';
    return `<button type="button" onclick="financeiroEscolherContaFiltro()" class="rz-chip ${financeiroContaFiltro ? 'rz-on' : ''}">Conta: ${escapeHtmlSaidas(nome)} ▾</button>`;
}
export async function financeiroEscolherContaFiltro() {
    if (!financeiroContasMultiplas() || typeof window.rzEscolher !== 'function') return;
    const opcoes = [{ valor: '__todas', titulo: 'Todas as contas', icone: 'layers' }]
        .concat(financeiroContasInfo.contas.map(c => ({ valor: c.id, titulo: c.nome, sub: c.titular_tipo === 'empresa' ? 'Empresa' : (c.titular_nome || ''), icone: c.titular_tipo === 'empresa' ? 'building-2' : 'user' })));
    const v = await window.rzEscolher({ titulo: 'Ver qual conta', opcoes });
    if (!v) return;
    financeiroContaFiltro = v === '__todas' ? null : v;
    if (document.getElementById('tab-mensal')?.classList.contains('active')) { financeiroAtualizarKpis('mensal'); renderMensalidades(); renderOutrasReceitas(); }
    if (document.getElementById('tab-saidas')?.classList.contains('active')) { financeiroAtualizarKpis('saidas'); renderSaidas(); }
}
// ---------------------------------------------------------------------------
// v1.35.0 (P4b · B1b) — DIVISÃO: quem arca com o movimento. Leitura e escrita no
// banco (fn_divisao_movimento / fn_divisao_excecao_definir); a tela só mostra.
// ---------------------------------------------------------------------------
const DIVISAO_ORIGEM = {
    excecao: 'Ajustada só neste lançamento',
    contrato: 'Pela divisão do contrato',
    propriedade: 'Pela propriedade do imóvel',
    empresa: 'Fica com a empresa (sem imóvel nem divisão)'
};
const pctBR = (v) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + '%';
function financeiroAcaoDivisao(origemTipo, id, valor, ajustada, aoMudar) {
    return [{ icone: 'split', titulo: ajustada ? 'Divisão: ajustada' : 'Divisão', sub: ajustada ? 'Ajustada só neste lançamento' : 'Quem arca com este valor',
        aoTocar: () => financeiroAbrirDivisao(origemTipo, id, valor, aoMudar) }];
}
async function financeiroAbrirDivisao(origemTipo, id, valor, aoMudar) {
    const { data, error } = await dbAuth.rpc('fn_divisao_movimento', { p_origem_tipo: origemTipo, p_origem_id: id });
    if (error) { rzToast('Não consegui ler a divisão: ' + error.message, { tipo: 'danger' }); return; }
    const linhas = Array.isArray(data) ? data : [];
    const origem = linhas[0]?.origem || 'empresa';
    const esc = (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
    const compFechada = window.RZ_FIN_COMPETENCIA_FECHADA === true;
    const rows = linhas.map(l => `<div class="rz-row"><div class="rz-ic${l.origem === 'empresa' ? ' rz-neu' : ''}"><svg data-lucide="${l.origem === 'empresa' ? 'building-2' : 'user'}"></svg></div>
        <div class="rz-tx"><b>${esc(l.nome)}</b><span>${formatarMoedaBR(Number(valor || 0) * Number(l.percentual || 0) / 100)}${l.pessoa_id || l.origem === 'empresa' ? '' : ' · externo'}</span></div>
        <div class="rz-rt"><b>${pctBR(l.percentual)}</b></div></div>`).join('');
    const nota = compFechada ? '<p style="margin:8px 0 0;font-size:13px;color:var(--muted)">Competência fechada: a divisão só muda reabrindo o fechamento.</p>' : '';
    const botoes = compFechada ? '' : `<div class="rz-sh-f">${origem === 'excecao' ? '<button type="button" class="rz-btn rz-btn-2" data-div-padrao>Voltar ao padrão</button>' : ''}<button type="button" class="rz-btn rz-btn-1${origem === 'excecao' ? '' : ' rz-wide'}" data-div-editar>Editar divisão</button></div>`;
    const sheet = abrirSheet(rzSheetCabecalho('Divisão', DIVISAO_ORIGEM[origem] || '') + `<div class="rz-sh-b"><div class="rz-card rz-list">${rows}</div>${nota}</div>${botoes}`);
    sheet.querySelector('[data-div-editar]')?.addEventListener('click', () => {
        if (typeof podeUsar === 'function' && !podeUsar('financeiro.divisao.editar').ok) { window.rzMostrarBloqueio?.('financeiro.divisao.editar'); return; }
        financeiroEditarDivisao(origemTipo, id, valor, origem === 'empresa' ? [] : linhas, aoMudar);
    });
    sheet.querySelector('[data-div-padrao]')?.addEventListener('click', async () => {
        if (typeof podeUsar === 'function' && !podeUsar('financeiro.divisao.editar').ok) { window.rzMostrarBloqueio?.('financeiro.divisao.editar'); return; }
        await financeiroGravarDivisao(origemTipo, id, [], aoMudar);
        fecharSheet();
    });
}
async function financeiroGravarDivisao(origemTipo, id, itens, aoMudar) {
    const { data, error } = await dbAuth.rpc('fn_divisao_excecao_definir', { p_origem_tipo: origemTipo, p_origem_id: id, p_itens: itens });
    if (error) { rzToast(error.message, { tipo: 'danger' }); return false; }
    rzToast(data?.mensagem || 'Feito.', { tipo: data?.ok ? 'success' : 'danger' });
    if (!data?.ok) return false;
    aoMudar?.(data.acao === 'divisao_ajustada');
    return true;
}
function financeiroEditarDivisao(origemTipo, id, valor, atuais, aoMudar) {
    // v1.35.1 — editor único de divisão (raiz-ui rzEditarDivisao), o mesmo do contrato e do ativo
    const lista = (typeof pessoas !== 'undefined' && Array.isArray(pessoas)) ? pessoas : [];
    rzEditarDivisao({
        titulo: 'Editar divisão', sub: 'Só este lançamento', nota: 'O contrato e a propriedade do imóvel não mudam.',
        itens: atuais.map(l => ({ pessoa_id: l.pessoa_id || null, nome_externo: l.pessoa_id ? null : (l.nome_externo || l.nome), nome: l.nome, percentual: Number(l.percentual) })),
        candidatos: lista.filter(p => p.id).sort((a, b) => String(a.nome).localeCompare(String(b.nome)))
            .map(p => ({ id: p.id, nome: p.nome, sub: Number(p.percentualCotasEmpresa) > 0 ? 'Sócio' : '' })),
        permitirExterno: true, valorBase: Number(valor || 0),
        aoSalvar: (itens) => financeiroGravarDivisao(origemTipo, id, itens.map(i => ({ pessoa_id: i.pessoa_id, nome_externo: i.nome_externo, percentual: i.percentual })), aoMudar)
    });
}

/** Linha "Conta: <nome>" nos sheets de recebimento/despesa (só com mais de 1 conta). */
function financeiroAcaoConta(origemTipo, id, contaId, aoMudar) {
    if (!financeiroContasMultiplas()) return [];
    return [{ icone: 'wallet', titulo: `Conta: ${financeiroNomeConta(contaId) || '—'}`, sub: 'Trocar a conta deste movimento', codigo: 'financeiro.contas.escolher',
        aoTocar: async () => {
            if (typeof window.rzEscolher !== 'function') return;
            const v = await window.rzEscolher({ titulo: 'Mover para a conta', opcoes: financeiroContasInfo.contas.map(c => ({ valor: c.id, titulo: c.nome, sub: c.id === contaId ? 'Conta atual' : (c.titular_tipo === 'empresa' ? 'Empresa' : (c.titular_nome || '')), icone: c.titular_tipo === 'empresa' ? 'building-2' : 'user' })) });
            if (!v || v === contaId) return;
            const { data, error } = await dbAuth.rpc('fn_lancamento_definir_conta', { p_origem_tipo: origemTipo, p_origem_id: id, p_conta_id: v });
            if (error) { mostrarToast(error.message, 'danger'); return; }
            mostrarToast(data?.mensagem || 'Feito.', data?.ok ? 'success' : 'danger');
            if (data?.ok) aoMudar?.(v);
        } }];
}

async function financeiroAtualizarKpis(aba) {
    const tipo = aba === 'mensal' ? 'recebimento' : 'saida';
    const comp = financeiroCompetenciaAtual || financeiroCompetenciaHojeISO();
    const idsMensal = { previsto: 'fin-kpi-mensal-previsto', realizado: 'mensal-resumo-recebido', em_atraso: 'mensal-resumo-atraso', em_aberto: 'mensal-resumo-avencer' };
    const idsSaidas = { previsto: 'saidas-resumo-total', realizado: 'saidas-resumo-pago', em_atraso: 'saidas-resumo-atrasado', em_aberto: 'saidas-resumo-avencer' };
    const ids = aba === 'mensal' ? idsMensal : idsSaidas;
    // Zera visualmente enquanto busca (evita mostrar o total do mês anterior
    // por 1 instante como se já fosse do mês novo).
    Object.values(ids).forEach(id => { const el = document.getElementById(id); if (el) el.textContent = '...'; });
    try {
        const contasPrimeiraVez = financeiroContasInfo.clienteId !== CLIENTE_ID_SUPABASE; // v1.33.0
        await financeiroGarantirContas();
        if (contasPrimeiraVez && financeiroContasMultiplas()) { if (aba === 'mensal') renderMensalidades(); else renderSaidas(); } // chip "Conta" aparece
        const { data, error } = await dbAuth.rpc('fn_financeiro_totalizadores_por_conta', { p_cliente_id: CLIENTE_ID_SUPABASE, p_competencia: comp, p_tipo: tipo, p_conta_id: financeiroContaFiltro });
        if (error) throw error;
        const linha = (data && data[0]) || { previsto: 0, realizado: 0, em_atraso: 0, em_aberto: 0 };
        Object.entries(ids).forEach(([campo, id]) => {
            const el = document.getElementById(id);
            if (el) el.textContent = formatarMoedaBR(Number(linha[campo] || 0));
        });
    } catch (e) {
        console.error('[financeiro] fn_financeiro_totalizadores', e);
        Object.values(ids).forEach(id => { const el = document.getElementById(id); if (el) el.textContent = 'R$ 0'; });
        if (typeof mostrarToast === 'function') mostrarToast('Não consegui calcular os totais deste mês agora.', 'danger');
    }
}

/** Desenha o cabeçalho novo (competência + chips de nível) de uma das 3
 * abas do grupo Financeiro. Chamado 1x por troca de aba (montarAbaFinanceiro)
 * e pelo flip de competência. */
function financeiroRenderCabecalho(aba) {
    if (!financeiroCompetenciaAtual) financeiroDefinirCompetencia(financeiroCompetenciaHojeISO());
    const elLabel = document.getElementById(`fin-competencia-label-${aba}`);
    if (elLabel) elLabel.textContent = financeiroCompetenciaLabel(financeiroCompetenciaAtual);
    const elChips = document.getElementById(`fin-chips-nivel-${aba}`);
    if (elChips) elChips.innerHTML = financeiroChipsNivelHtml(aba);
    // v1.28.0 — card "Rotinas de <mês>" (UXR-25) no lugar da grade 3x2.
    const elRot = document.getElementById(`fin-rotinas-${aba}`);
    if (elRot) elRot.innerHTML = financeiroRotinasHtml(aba);
    financeiroRenderCadeadoCompetencia(); // v1.20.0 (demanda 7bdcb8d4)
    financeiroVerificarRotinaFechamento(); // v1.30.1 — a função decide se precisa ir ao banco
    if (aba === 'mensal' || aba === 'saidas') financeiroAtualizarKpis(aba);
    if (aba === 'saidas') financeiroRecarregarSaidas(); // v1.27.2
    // Entrega F.2 — card de Fechar/Reabrir dentro do chip Fechamento
    // (REGRAS §11.1). Ponte global pra js/fechamento.js, módulo isolado
    // (mesmo padrão de mostrarToast/abrirSheetAcoes usados aqui).
    // CORRIGIDO v1.15.0 (QUA-01, achado nesta mesma entrega) — antes só
    // chamava pra aba==='conciliacao'; o botão dedicado (cadeado) vive nos
    // 3 chips (REGRAS §11.1), então precisa ser redesenhado nos 3, não só
    // quando o usuário abre Fechamento — senão Recebimentos/Saídas ficavam
    // com o cadeado do estado errado (ou vazio) até visitar Fechamento
    // pelo menos 1x na sessão. fechamentoAtualizarCard já redesenha os 3
    // botões de uma vez (FECHAMENTO_IDS_BOTAO), então chamar aqui pras 3
    // abas não duplica nada.
    if (typeof fechamentoAtualizarCard === 'function') fechamentoAtualizarCard();
}

        let gruposInadimplenciaAbertos = null; // v1.179.1 — idem, cortinas de Atrasados
        let mensalChipStatus = 'todos'; // v1.178.9 — chip de status (Recebimentos): todos · pago · atrasado · a_vencer

        // v1.52.0 — overlay de busca da aba Cobrança, mesmo padrão.
        // v1.179.1 — achado do Nicola: caminho pra Atrasados mais visível —
        // toque em "Em atraso" (hero de Recebimentos) mostra o "< Voltar"
        // condicional lá, mesmo padrão de btn-voltar-financeiro/-saidas.
        export function abrirTelaAtrasados() {
            switchTab('tab-inadimplencia');
            document.getElementById('btn-voltar-inadimplencia')?.classList.remove('hidden');
        }

        export function abrirBuscaInadimplencia() {
            const modal = document.getElementById('modal-busca-inadimplencia');
            modal.classList.remove('hidden');
            modal.onclick = (ev) => { if (ev.target === modal) fecharBuscaInadimplencia(); };
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        export function fecharBuscaInadimplencia() {
            document.getElementById('modal-busca-inadimplencia').classList.add('hidden');
        }

        // v1.51.0 — "Financeiro" no box da ficha abre a aba cheia já
        // filtrada por este imóvel, com "< Voltar" pra retornar. Fora deste
        // fluxo (uso normal pela barra inferior), o botão de voltar
        // continua escondido — só aparece quando entrou por aqui.
        let financeiroFiltradoOrigem = null;

        export function abrirFinanceiroFiltradoImovel(imovelId, nomeEmpreendimento) {
            financeiroFiltradoOrigem = fichaImovelAtualId;
            document.getElementById('men-filtro-imovel').value = imovelId;
            document.getElementById('men-filtro-imovel-resumo').textContent = nomeEmpreendimento;
            switchTab('tab-mensal');
            document.getElementById('btn-voltar-financeiro')?.classList.remove('hidden');
            renderMensalidades();
        }

        export function voltarDoFinanceiroFiltrado() {
            document.getElementById('btn-voltar-financeiro')?.classList.add('hidden');
            document.getElementById('men-filtro-imovel').value = 'todos';
            document.getElementById('men-filtro-imovel-resumo').textContent = 'Todos';
            const origem = financeiroFiltradoOrigem;
            financeiroFiltradoOrigem = null;
            if (origem) { abrirFichaImovel(origem); } else { renderMensalidades(); }
        }

        // "Atrasado" NUNCA é lido de um campo gravado — sempre calculado
        // (vencimento < hoje). Mesma lição já aprendida em Recebimentos
        // (v1.63.0): gravar esse estado já causou bug de badge errado.
        export function estaAtrasadaDespesa(d) {
            if (d.status !== 'previsto' || !d.vencimento) return false;
            const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
            return new Date(d.vencimento + 'T00:00:00') < hoje;
        }

        // ENTREGA F.3 (21/09/2026) — perdeu o <select> de competência (ver
        // nota grande no topo do arquivo): a lista agora lê
        // financeiroCompetenciaAtual direto, sem popular opção nenhuma pra
        // isso. Ativo/Fornecedor continuam exatamente como antes.
        export function popularFiltrosSaidas() {
            const selAtivo = document.getElementById('saidas-filtro-ativo-select');
            const selFornecedor = document.getElementById('saidas-filtro-fornecedor');
            if (!selAtivo || !selFornecedor) return;

            const valAtivo = selAtivo.value || 'todos';
            const valForn = selFornecedor.value || 'todos';

            const ativosUsados = [...new Map(lancamentos.filter(d => d.ativoId).map(d => [d.ativoId, d.ativoNome])).entries()];
            selAtivo.innerHTML = '<option value="todos">Todos</option>' + ativosUsados.map(([id, nome]) => `<option value="${id}">${escapeHtmlSaidas(nome)}</option>`).join('');
            selAtivo.value = ativosUsados.some(([id]) => id === valAtivo) ? valAtivo : 'todos';

            const fornecedoresUsados = [...new Map(lancamentos.filter(d => d.parteId).map(d => [d.parteId, d.parteNome])).entries()];
            selFornecedor.innerHTML = '<option value="todos">Todos</option>' + fornecedoresUsados.map(([id, nome]) => `<option value="${id}">${escapeHtmlSaidas(nome)}</option>`).join('');
            selFornecedor.value = fornecedoresUsados.some(([id]) => id === valForn) ? valForn : 'todos';
        }

        // v1.6.5 — achado do Nicola: "Atrasado" do hero de Saídas filtra a
        // própria lista (mesmo <select> escondido que "Buscar" já usa) em
        // vez de navegar — Saídas não tem uma tela de inadimplência própria
        // como Recebimentos tem (tab-inadimplencia é só de recebimento).
        export function filtrarSaidasPorStatus(status) {
            const sel = document.getElementById('saidas-filtro-status');
            if (!sel) return;
            sel.value = status;
            renderSaidas();
            document.getElementById('lista-saidas')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // v1.178.9 — achado do Nicola: chips de status em Saídas, mesmo
        // padrão de Recebimentos — reaproveita o <select> escondido
        // (saidas-filtro-status) que "Buscar" já usava como guarda de estado.
        export function renderChipsSaidas(filtradas) {
            const wrap = document.getElementById('saidas-chips-status');
            if (!wrap) return;
            const statusD = (d) => d.status === 'realizado' ? 'pago' : estaAtrasadaDespesa(d) ? 'atrasado' : 'a_vencer';
            const contagem = { todos: filtradas.length, pago: 0, atrasado: 0, a_vencer: 0 };
            filtradas.forEach(d => { contagem[statusD(d)]++; });
            const atual = document.getElementById('saidas-filtro-status')?.value || 'todos';
            const chips = [
                { chave: 'todos', rotulo: 'Todas', n: contagem.todos },
                { chave: 'pago', rotulo: 'Pagas', n: contagem.pago },
                { chave: 'a_vencer', rotulo: 'A vencer', n: contagem.a_vencer },
                { chave: 'atrasado', rotulo: 'Atrasadas', n: contagem.atrasado },
            ];
            wrap.innerHTML = chips.map(c => `<button type="button" onclick="filtrarSaidasPorChip('${c.chave}')" class="rz-chip ${atual === c.chave ? 'rz-on' : ''}">${c.rotulo} <span class="rz-n">${c.n}</span></button>`).join('') + financeiroChipContaHtml(); // v1.33.0
        }

        // Chip — mesmo <select> de sempre, sem o scroll do toque no hero
        // (os chips já ficam colados na lista, não precisam rolar até ela).
        export function filtrarSaidasPorChip(chave) {
            const sel = document.getElementById('saidas-filtro-status');
            if (!sel) return;
            sel.value = chave;
            renderSaidas();
        }

        // v1.179.2 — achado do Nicola: padroniza Saídas com Recebimentos —
        // toque na linha abre um menu (⋮) com as opções daquele status, em
        // vez de pular direto pro formulário completo. "Estornar pagamento"
        // vira opção direta do menu pra quem já pagou (mesma agilidade que
        // Recebimentos já tinha) — Ver detalhe/Dar baixa continuam abrindo
        // o formulário de sempre (despesa não tem baixa "leve" separada
        // como mensalidade tem).
        // v1.29.0 (RF-18.22/18.25, parte Financeiro — demanda 4a369778) — de
        // onde a despesa veio: quando nasceu de uma ocorrência de item de
        // controle (origem_tipo='ocorrencia_controle'), devolve o item, a data
        // da ocorrência e o vínculo (ativo ou "da empresa") para o ⋮ mostrar
        // e abrir a ficha do item (ponte abrirAlertaItemControle do index).
        async function origemDaDespesa(d) {
            if (d.origemTipo !== 'ocorrencia_controle' || !d.origemId) return null;
            try {
                const { data, error } = await dbAuth.from('cofre_ocorrencias_controle')
                    .select('id, competencia, data_prevista_atual, item_controle_id, cofre_itens_controle(id, titulo, ativo_id, contrato_id, empresa_id)')
                    .eq('cliente_id', CLIENTE_ID_SUPABASE).eq('id', d.origemId).maybeSingle();
                if (error || !data) return null;
                const item = data.cofre_itens_controle || {};
                return { itemId: item.id || data.item_controle_id, ativoId: item.ativo_id || null, titulo: item.titulo || 'Item de controle',
                         data: data.data_prevista_atual || data.competencia, daEmpresa: !item.ativo_id && !item.contrato_id };
            } catch (e) { console.warn('[financeiro] origem da despesa:', e.message); return null; }
        }

        // v1.27.3 — comprovante guardado no Cofre da empresa para a despesa da licença.
        async function comprovanteDaDespesa(d) {
            if (d.origemTipo !== 'licenca' || !d.origemId) return null;
            try {
                const { data } = await dbAuth.from('cofre_documento_vinculos')
                    .select('documento_id, cofre_documentos(storage_path, bucket, nome_exibicao, status)')
                    .eq('cliente_id', CLIENTE_ID_SUPABASE).eq('entidade_tipo', 'pagamento').eq('entidade_id', d.origemId);
                const doc = (data || []).map(v => v.cofre_documentos).find(x => x && x.status !== 'excluido');
                if (!doc) return null;
                const { data: s } = await dbAuth.storage.from(doc.bucket || 'cofre-documentos').createSignedUrl(doc.storage_path, 600);
                return s?.signedUrl || null;
            } catch (e) { console.warn('[financeiro] comprovante da despesa:', e.message); return null; }
        }

        export async function rzAcoesDespesa(id) {
            const d = lancamentos.find(x => x.id === id); if (!d || typeof abrirSheetAcoes !== 'function') return;
            const [urlComprovante, origem] = await Promise.all([comprovanteDaDespesa(d), origemDaDespesa(d)]);
            // v1.29.0 (RF-18.22) — 1ª ação mostra de onde a despesa veio e abre o item.
            const acaoOrigem = origem ? [{ icone: 'link-2', titulo: `Origem: ${origem.titulo}`,
                sub: `Ocorrência de ${formatarDataBR(origem.data)}${origem.daEmpresa ? ' · da empresa' : ''}`,
                aoTocar: () => { if (typeof abrirAlertaItemControle === 'function') abrirAlertaItemControle(origem.itemId, origem.ativoId); } }] : [];
            // v1.10.0 (18/09/2026, rodada 10 — achado do Nicola: "continua
            // muito texto na frente da data" na linha de Saídas) — a linha
            // da lista virou só descrição + data nua (ver renderSaidas()
            // abaixo); categoria/parte/ativo/reembolsável, que saíram da
            // linha, entram aqui no sub do sheet de ações (ao tocar no
            // item), que é onde o Nicola pediu pra aparecerem agora
            // ("ao clicar no item, aí sim deve aparecer maiores informações").
            // v1.29.0 (RF-18.25) — vínculo à vista: sem ativo, diz "da empresa".
            const sub = `${rotuloCategoriaSaida(d.categoria)}${d.parteNome ? ' · ' + escapeHtmlSaidas(d.parteNome) : ''}${d.ativoNome ? ' · ' + escapeHtmlSaidas(d.ativoNome) : ' · da empresa'}${d.reembolsavel ? ' · reembolsável' : ''}`;
            if (d.status === 'realizado') {
                const acoesRealizado = [
                    ...acaoOrigem,
                    { icone: 'eye', titulo: 'Ver detalhe', aoTocar: () => abrirEditarDespesa(id) },
                ];
                if (urlComprovante) acoesRealizado.push({ icone: 'file-check-2', titulo: 'Ver comprovante', sub: 'Comprovante do Pix guardado no Cofre', aoTocar: () => rzDev('abrirExterno', urlComprovante) });
                // CORRIGIDO v1.15.0 — mesma regra de rzAcoesMensalidade
                // acima (REGRAS §11.1: competência fechada só permite ver
                // detalhes, nunca alterar).
                const compFechada = typeof window !== 'undefined' && window.RZ_FIN_COMPETENCIA_FECHADA === true;
                if (!compFechada) {
                    acoesRealizado.push({ icone: 'undo-2', titulo: 'Estornar pagamento', sub: 'Volta pra "a pagar"', tipo: 'bad', aoTocar: () => estornarPagamentoDespesa(id) });
                }
                // v1.179.5 — mesmo critério de rzAcoesMensalidade: só
                // aparece quando esta despesa veio de fato de uma
                // conciliação de extrato (origem_tipo='extrato' — despesa
                // criada pelo formulário normal não tem isso).
                if (d.origemTipo === 'extrato') {
                    acoesRealizado.push({ icone: 'info', titulo: 'Resumo da conciliação', sub: 'Data, origem, modo e canal', aoTocar: () => abrirResumoConciliacaoPorDestino('lancamento', id) });
                }
                // Entrega F.3/F.4 — mesma ação/mesma regra de rzAcoesMensalidade.
                if (!compFechada) {
                    acoesRealizado.push({
                        icone: d.incluirContabilidade === false ? 'plus-circle' : 'ban',
                        titulo: d.incluirContabilidade === false ? 'Incluir na contabilidade' : 'Não incluir na contabilidade',
                        sub: 'Controla o pacote enviado ao contador no fechamento',
                        codigo: 'financeiro.contabilidade_ajustar',
                        aoTocar: () => alternarIncluirContabilidade('lancamento', id),
                    });
                }
                acoesRealizado.push(...financeiroAcaoConta('lancamento', id, d.contaId, (v) => { d.contaId = v; renderSaidas(); })); // v1.33.0
                acoesRealizado.push(...financeiroAcaoDivisao('lancamento', id, d.valor, d.divisaoAjustada, (aj) => { d.divisaoAjustada = aj; renderSaidas(); })); // v1.35.0
                abrirSheetAcoes({ titulo: escapeHtmlSaidas(d.descricao || 'Despesa'), sub, acoes: acoesRealizado });
                return;
            }
            abrirSheetAcoes({ titulo: estaAtrasadaDespesa(d) ? 'Em atraso' : 'A pagar', sub, acoes: [
                ...acaoOrigem,
                ...financeiroAcaoConta('lancamento', id, d.contaId, (v) => { d.contaId = v; renderSaidas(); }), // v1.33.0
                ...financeiroAcaoDivisao('lancamento', id, d.valor, d.divisaoAjustada, (aj) => { d.divisaoAjustada = aj; renderSaidas(); }), // v1.35.0
                { icone: 'check', titulo: 'Dar baixa / editar', sub: 'Abre o formulário completo', aoTocar: () => abrirEditarDespesa(id) },
                { icone: 'trash-2', titulo: 'Excluir despesa', tipo: 'bad', aoTocar: () => excluirDespesa(id) },
            ] });
        }

        // Entrega F.3/F.4 (21/09/2026, pedido explícito) — alterna o flag
        // incluir_contabilidade de 1 mensalidade/lançamento, via RPC central
        // (fn_financeiro_incluir_contabilidade — valida a funcionalidade
        // financeiro.contabilidade_ajustar de novo no banco, nunca confia só
        // no `codigo` do sheet). Usada por rzAcoesMensalidade/rzAcoesDespesa
        // acima. Item fora da contabilidade nunca some da lista (continua
        // "baixado" normalmente) — só sai do pacote enviado ao contador no
        // fechamento (fn_fechamento_calcular_contabil).
        export async function alternarIncluirContabilidade(tipo, id) {
            const lista = tipo === 'mensalidade' ? mensalidades : lancamentos;
            const item = lista.find(x => x.id === id);
            if (!item) return;
            const novoValor = item.incluirContabilidade === false;
            mostrarCarregamentoGlobal(novoValor ? 'Incluindo na contabilidade…' : 'Excluindo da contabilidade…');
            try {
                const { error } = await dbAuth.rpc('fn_financeiro_incluir_contabilidade', { p_tipo: tipo, p_id: id, p_incluir: novoValor });
                if (error) throw error;
                item.incluirContabilidade = novoValor;
                // v1.17.0 (Fase 1 do wrapper de escrita) — ver changelog do topo.
                emitirEscrita(tipo === 'mensalidade' ? 'mensalidade' : 'despesa', { id, acao: 'incluir_contabilidade' });
                esconderCarregamentoGlobal();
                if (typeof mostrarToast === 'function') mostrarToast(novoValor ? 'Incluído no pacote da contabilidade.' : 'Não entra mais no pacote da contabilidade.', 'success');
                if (tipo === 'mensalidade') renderMensalidades(); else renderSaidas();
            } catch (e) {
                esconderCarregamentoGlobal();
                if (typeof mostrarToast === 'function') mostrarToast('Não consegui atualizar: ' + e.message, 'danger');
            }
        }

        export function renderSaidas() {
            const container = document.getElementById('lista-saidas');
            if (!container) return;
            if (!catalogoCategoriasLanc) carregarCatalogoCategorias().then(c => { if (c) renderSaidas(); }); // v1.31.0 — 1ª carga redesenha com nome/ícone do catálogo

            popularFiltrosSaidas();

            const fStatus = document.getElementById('saidas-filtro-status')?.value || 'todos';
            const fCategoria = document.getElementById('saidas-filtro-categoria')?.value || 'todos';
            const fAtivo = document.getElementById('saidas-filtro-ativo')?.value || 'todos';
            const fFornecedor = document.getElementById('saidas-filtro-fornecedor')?.value || 'todos';
            const termoBusca = (document.getElementById('saidas-busca-texto')?.value || '').trim().toLowerCase();

            // ENTREGA F.3 (21/09/2026 — achado do Nicola: com o card de
            // competência no topo, a lista não precisa mais do próprio
            // filtro/agrupamento por mês) — a lista mostra só a competência
            // do card (financeiroCompetenciaAtual), a mesma que alimenta os
            // 4 KPIs (ver nota grande no topo do arquivo). O <select>
            // escondido (saidas-filtro-competencia) e o agrupamento
            // colapsável (gruposSaidasAbertos/alternarGrupoSaidas) saíram.
            const compAtualRef = dataParaCompetencia(financeiroCompetenciaAtual || financeiroCompetenciaHojeISO());

            // v1.178.9 — achado do Nicola: filtros sem o status (pro hero e
            // pros chips contarem sem o próprio chip se esconder da contagem).
            const filtradasSemStatus = lancamentos.filter(d => {
                if (dataParaCompetencia(d.competencia) !== compAtualRef) return false;
                if (financeiroContaFiltro && d.contaId !== financeiroContaFiltro) return false; // v1.33.0
                if (fCategoria !== 'todos' && d.categoria !== fCategoria) return false;
                if (fAtivo !== 'todos' && d.ativoId !== fAtivo) return false;
                if (fFornecedor !== 'todos' && d.parteId !== fFornecedor) return false;
                if (termoBusca) {
                    const campos = [d.descricao, d.parteNome, d.ativoNome];
                    if (!campos.some(c => (c || '').toLowerCase().includes(termoBusca))) return false;
                }
                return true;
            });
            renderChipsSaidas(filtradasSemStatus);

            const filtradas = filtradasSemStatus.filter(d => {
                const atrasada = estaAtrasadaDespesa(d);
                if (fStatus === 'pago' && d.status !== 'realizado') return false;
                if (fStatus === 'atrasado' && !atrasada) return false;
                if (fStatus === 'a_vencer' && (d.status === 'realizado' || atrasada)) return false;
                return true;
            });

            // ENTREGA F.1 (21/09/2026) — os 4 KPIs (Previsto/Pago/Vencido/A
            // pagar) SAÍRAM daqui: vêm de fn_financeiro_totalizadores,
            // escopados pela competência do card do topo
            // (financeiroCompetenciaAtual), via financeiroAtualizarKpis
            // ('saidas') — chamada por financeiroRenderCabecalho() a cada
            // troca de aba/flip de mês, não a cada renderSaidas().

            if (!filtradas.length) {
                container.innerHTML = `<p class="text-xs text-center py-8" style="color:var(--sage)">Nenhuma despesa encontrada.</p>`;
                return;
            }

            // v1.178.9 — achado do Nicola: lista "sai da ordem" depois de
            // dar baixa — não tinha ordenação estável, ficava na ordem que
            // `lancamentos` vinha do banco (que muda a cada recarregamento,
            // não é cronológica). Ordena por vencimento (paga usa a data de
            // pagamento) — mesma leitura natural de sempre, estável entre renders.
            const itens = [...filtradas].sort((a, b) => {
                const da = (a.status === 'realizado' && a.dataPagamento) ? a.dataPagamento : a.vencimento;
                const db = (b.status === 'realizado' && b.dataPagamento) ? b.dataPagamento : b.vencimento;
                return (da || '').localeCompare(db || '');
            });

            // v1.179.2 — achados do Nicola: (1) padroniza com Recebimentos —
            // toque abre o menu (⋮) de opções do status, não pula direto
            // pro formulário; (2) ícone por categoria (repasse, tributo,
            // seguro etc. cada um com o seu, não só pago/atrasado/a-vencer);
            // (3) descrição limpa — mesma função que já tira "SAÍDA BOLETO
            // PAGO"/"PIX TRANSF"/TED etc. na Conciliação
            // (limparRotuloConciliacao), aplicada aqui também.
            const rsS = (sem, t) => (typeof renderStatus === 'function') ? renderStatus(sem, t) : `<span class="rz-st rz-${sem}">${t}</span>`;
            // Entrega F.3/F.4 — mesmo rótulo curto de origem de renderMensalidades().
            const origemSaidaHtml = (d) => {
                const partes = [];
                partes.push(d.origemTipo === 'extrato' ? 'Extrato' : 'Manual');
                if (d.incluirContabilidade === false) partes.push('Fora da contabilidade');
                return ' · ' + partes.join(' · ');
            };
            // v1.37.0 (P5a, RF-19.9) — compras de cartão viram UMA linha por fatura (a soma das
            // compras desta competência); toque abre a fatura item a item (financeiroAbrirFatura).
            const porFatura = new Map();
            const linhasLista = [];
            itens.forEach(d => {
                if (!d.faturaId) { linhasLista.push({ d }); return; }
                if (!porFatura.has(d.faturaId)) { const g = { faturaId: d.faturaId, itens: [] }; porFatura.set(d.faturaId, g); linhasLista.push({ g }); }
                porFatura.get(d.faturaId).itens.push(d);
            });
            if (porFatura.size && financeiroFaturasInfo.clienteId !== CLIENTE_ID_SUPABASE && !financeiroFaturasCarregando) {
                financeiroGarantirFaturas().then(() => renderSaidas());
            }
            const cards = linhasLista.map(({ d, g }) => {
                if (g) return financeiroLinhaFaturaHtml(g, rsS);
                const atrasada = estaAtrasadaDespesa(d);
                const pago = d.status === 'realizado';
                const st = pago ? rsS('ok', 'Pago') : atrasada ? rsS('bad', 'Em atraso') : rsS('run', 'A pagar');
                const ic = categoriaDoCatalogo(d.categoria)?.icone || ICONE_POR_CATEGORIA_SAIDA[d.categoria] || 'circle-dollar-sign'; // v1.31.0
                const descricaoLimpa = limparRotuloConciliacao(d.descricao);
                return `
                    <div class="rz-row rz-link" onclick="rzAcoesDespesa('${d.id}')">
                        <div class="rz-ic${atrasada && !pago ? ' rz-bad' : ''}"><svg data-lucide="${ic}"></svg></div>
                        <div class="rz-tx"><b>${escapeHtmlSaidas(descricaoLimpa)}</b><span>${d.vencimento ? formatarDataBR(pago && d.dataPagamento ? d.dataPagamento : d.vencimento) : ''}${pago ? origemSaidaHtml(d) : ''}${d.divisaoAjustada ? ' · divisão ajustada' : ''}</span></div>
                        <div class="rz-rt"><b class="rz-out">− ${formatarMoedaBR(d.valor)}</b>${st}</div>
                        <svg data-lucide="ellipsis-vertical" class="rz-chev"></svg>
                    </div>`;
            }).join('');
            container.innerHTML = `<div class="rz-card rz-list">${cards}</div>`;

            if (typeof lucide !== 'undefined') lucide.createIcons();
        }


        // ====================================================================
        // v1.37.0 (07/10/2026, P5a — fichas F1–F5, de acordo do Nicola 09:09) — CARTÃO DE CRÉDITO.
        // Regra no banco: fn_fatura_listar (consolidado e itens), fn_fatura_importar,
        // fn_fatura_item_classificar (um ou em lote, "Sempre assim"), fn_fatura_baixar; leitura do
        // PDF/foto pela Edge extrato-extrair-transacoes (tipo 'fatura_cartao'). A tela só mostra.
        // ====================================================================
        let financeiroFaturasInfo = { clienteId: null, porId: {} };
        let financeiroFaturasCarregando = null;
        function financeiroGarantirFaturas(forcar) {
            if (!forcar && financeiroFaturasInfo.clienteId === CLIENTE_ID_SUPABASE) return Promise.resolve(financeiroFaturasInfo);
            if (financeiroFaturasCarregando) return financeiroFaturasCarregando;
            financeiroFaturasCarregando = (async () => {
                try {
                    const { data, error } = await dbAuth.rpc('fn_fatura_listar', { p_cliente_id: CLIENTE_ID_SUPABASE });
                    if (error) throw error;
                    financeiroFaturasInfo = { clienteId: CLIENTE_ID_SUPABASE, porId: Object.fromEntries((data?.dados || []).map(f => [f.id, f])) };
                } catch (e) {
                    console.warn('[financeiro] faturas:', e.message);
                    financeiroFaturasInfo = { clienteId: CLIENTE_ID_SUPABASE, porId: {} };
                }
                financeiroFaturasCarregando = null;
                return financeiroFaturasInfo;
            })();
            return financeiroFaturasCarregando;
        }
        function financeiroNomeCartao(f) { return f ? `${f.cartao_nome}${f.final ? ' ·· ' + f.final : ''}` : 'Fatura do cartão'; }
        function financeiroStatusFatura(f, rs) {
            if (!f) return rs('run', 'A pagar');
            if (f.status === 'paga') return rs('ok', 'Paga');
            if (f.status === 'paga_parcial') return rs('warn', 'Paga em parte');
            const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
            return (f.data_vencimento && new Date(f.data_vencimento + 'T00:00:00') < hoje) ? rs('bad', 'Em atraso') : rs('run', 'A pagar');
        }
        function financeiroLinhaFaturaHtml(g, rs) {
            const f = financeiroFaturasInfo.porId[g.faturaId];
            const soma = g.itens.reduce((t, i) => t + Number(i.valor || 0), 0);
            const ac = g.itens.filter(i => i.categoria === 'a_classificar').length;
            const quem = f && f.titular_tipo === 'pessoa' ? `Cartão de ${escapeHtmlSaidas(f.titular_nome || '')} · ` : '';
            const venc = f?.data_vencimento ? `vence ${formatarDataBR(f.data_vencimento)} · ` : '';
            const qtd = g.itens.length === 1 ? '1 compra' : `${g.itens.length} compras`;
            return `
                    <div class="rz-row rz-link" onclick="financeiroAbrirFatura('${g.faturaId}')">
                        <div class="rz-ic rz-ia"><svg data-lucide="credit-card"></svg></div>
                        <div class="rz-tx"><b>Fatura ${escapeHtmlSaidas(financeiroNomeCartao(f))}</b><span>${ac ? `<b style="color:var(--brass-deep);display:inline;font-weight:600">${ac} a classificar</b> · ` : ''}${quem}${venc}${qtd}</span></div>
                        <div class="rz-rt"><b class="rz-out">− ${formatarMoedaBR(soma)}</b>${financeiroStatusFatura(f, rs)}</div>
                        <svg data-lucide="chevron-right" class="rz-chev"></svg>
                    </div>`;
        }

        /** Tela da fatura (Sheet): cabeçalho, "A classificar" com a sugestão do Raiz, classificadas, lote. */
        export async function financeiroAbrirFatura(faturaId, opcoes = {}) {
            if (typeof abrirSheet !== 'function') return;
            const { data, error } = await dbAuth.rpc('fn_fatura_listar', { p_cliente_id: CLIENTE_ID_SUPABASE, p_fatura_id: faturaId });
            if (error || !data?.ok) { rzToast(error?.message || data?.mensagem || 'Não consegui abrir a fatura.', { tipo: 'danger' }); return; }
            await carregarCatalogoCategorias();
            const f = data.dados;
            financeiroFaturasInfo.porId[f.id] = { ...f, itens: undefined };
            const itens = f.itens || [];
            const ac = itens.filter(i => i.categoria === 'a_classificar');
            const ok = itens.filter(i => i.categoria !== 'a_classificar');
            const rs = (sem, t) => (typeof renderStatus === 'function') ? renderStatus(sem, t) : `<span class="rz-st rz-${sem}">${t}</span>`;
            const sel = new Set(opcoes.selecionados || []);
            let selecionando = !!opcoes.selecionando;
            const pode = (c) => typeof podeUsar !== 'function' || podeUsar(c).ok;
            const podeClassificar = pode('cartao.classificar');
            const nomeCat = (c) => categoriaDoCatalogo(c)?.nome || rotuloCategoriaSaida(c);
            const icCat = (c) => c === 'a_classificar' ? 'circle-help' : (categoriaDoCatalogo(c)?.icone || ICONE_POR_CATEGORIA_SAIDA[c] || 'circle-dollar-sign');
            const compra = (i) => i.compra ? 'Compra ' + formatarDataBR(i.compra) : '';
            const parcela = (i) => { const m = /parcela ([0-9]+\/[0-9]+)/.exec(i.observacao || ''); return m ? ' · parcela ' + m[1] : ''; };
            const linha = (i, pend) => {
                const s = i.sugestao || {};
                const temSug = pend && s.categoria;
                const textoSug = temSug ? financeiroTextoSugestaoCartao(s, nomeCat) : ''; // v1.38.0 — categoria · ativo · fornecedor
                const confSug = Math.round(Number(s.confianca || 0));
                const valorTxt = Number(i.valor) < 0 ? `<b class="rz-in">+ ${formatarMoedaBR(Math.abs(i.valor))}</b>` : `<b class="rz-out">− ${formatarMoedaBR(i.valor)}</b>`;
                const extra = pend ? '' : ` · ${escapeHtmlSaidas(nomeCat(i.categoria))}${i.ativo_nome ? ' · ' + escapeHtmlSaidas(i.ativo_nome) : ''}${i.parte_nome ? ' · ' + escapeHtmlSaidas(i.parte_nome) : ''}${i.divisao_ajustada ? ' · divisão ajustada' : ''}`;
                return `<div class="rz-row rz-link" data-fat-item="${i.id}">
                    ${selecionando && pend ? `<div style="flex:none;width:24px;height:24px;border-radius:7px;border:2px solid ${sel.has(i.id) ? 'var(--pine)' : 'var(--line)'};background:${sel.has(i.id) ? 'var(--pine)' : 'transparent'};display:grid;place-items:center;color:#fff;font-size:14px;font-weight:700">${sel.has(i.id) ? '✓' : ''}</div>` : ''}
                    <div class="rz-ic${temSug ? (confSug < 70 ? ' rz-warn' : ' rz-ia') : (pend ? ' rz-warn' : '')}"><svg data-lucide="${temSug ? 'sparkles' : icCat(i.categoria)}"></svg></div>
                    <div class="rz-tx"><b>${escapeHtmlSaidas(i.descricao)}</b><span>${temSug ? 'Parece: ' + escapeHtmlSaidas(textoSug) + ' · ' : ''}${compra(i)}${parcela(i)}${extra}</span></div>
                    <div class="rz-rt">${valorTxt}${temSug ? `<span class="rz-ia-tag"><svg data-lucide="sparkles"></svg>${confSug}%</span>` : ''}</div>
                </div>`;
            };
            const classificadas = itens.length - ac.length;
            const pct = itens.length ? Math.round(classificadas * 100 / itens.length) : 100;
            const quem = f.titular_tipo === 'pessoa' ? `Cartão de ${f.titular_nome}` : 'Empresa';
            const corpo = `
                <div class="rz-card">
                    <div style="display:flex;justify-content:space-between;gap:12px;padding:4px 0;font-size:14px"><span style="color:var(--muted)">Fechamento</span><b>${f.data_fechamento ? formatarDataBR(f.data_fechamento) : '—'}</b></div>
                    <div style="display:flex;justify-content:space-between;gap:12px;padding:4px 0;font-size:14px"><span style="color:var(--muted)">Vencimento</span><b>${f.data_vencimento ? formatarDataBR(f.data_vencimento) : '—'}</b></div>
                    <div style="display:flex;justify-content:space-between;gap:12px;padding:4px 0;font-size:14px"><span style="color:var(--muted)">Total da fatura</span><b>${formatarMoedaBR(f.valor_total)}</b></div>
                    ${Math.abs(Number(f.valor_total) - Number(f.soma_itens)) > 0.01 ? `<div style="display:flex;justify-content:space-between;gap:12px;padding:4px 0;font-size:14px"><span style="color:var(--muted)">Soma das compras</span><b style="color:var(--danger)">${formatarMoedaBR(f.soma_itens)}</b></div>` : ''}
                    ${f.valor_pago ? `<div style="display:flex;justify-content:space-between;gap:12px;padding:4px 0;font-size:14px"><span style="color:var(--muted)">Pago</span><b>${formatarMoedaBR(f.valor_pago)}${f.data_pagamento ? ' em ' + formatarDataBR(f.data_pagamento) : ''}</b></div>` : ''}
                    <div style="display:flex;justify-content:space-between;gap:12px;padding:4px 0;font-size:14px"><span style="color:var(--muted)">Paga pela conta</span><b>${escapeHtmlSaidas(f.conta_pagadora_nome || '—')}</b></div>
                    <div style="height:8px;border-radius:999px;background:var(--tile);overflow:hidden;margin:10px 0 4px"><i style="display:block;height:100%;width:${pct}%;background:var(--sprout)"></i></div>
                    <span class="rz-hint">${classificadas} de ${itens.length} ${itens.length === 1 ? 'compra classificada' : 'compras classificadas'}</span>
                </div>
                <div style="display:flex;gap:8px;margin:0 0 12px">
                    ${ac.length && podeClassificar ? `<button type="button" class="rz-btn rz-btn-2" style="flex:1" data-fat-selecionar>${selecionando ? 'Cancelar seleção' : 'Selecionar'}</button>` : ''}
                    ${f.status !== 'paga' ? `<button type="button" class="rz-btn rz-btn-2" style="flex:1" data-fat-baixar>Marcar como paga</button>` : ''}
                </div>
                ${ac.length ? `<div class="rz-group">A classificar · ${ac.length}</div><div class="rz-card rz-list">${ac.map(i => linha(i, true)).join('')}</div>` : ''}
                ${ok.length ? `<div class="rz-group">Classificadas · ${ok.length}</div><div class="rz-card rz-list">${ok.map(i => linha(i, false)).join('')}</div>` : ''}
                ${ac.length ? '' : '<span class="rz-hint" style="display:block;margin-top:8px">Tudo classificado. Da próxima fatura, o Raiz já usa o que você ensinou.</span>'}`;
            const rodape = selecionando ? `<div class="rz-sh-f"><button type="button" class="rz-btn rz-btn-2" data-fat-selecionar>Cancelar</button><button type="button" class="rz-btn rz-btn-1" data-fat-lote ${sel.size ? '' : 'disabled'}>Classificar ${sel.size || ''}</button></div>` : '';
            const sheet = abrirSheet(rzSheetCabecalho(`Fatura ${financeiroNomeCartao(f)}`, `${financeiroCompetenciaLabel(f.competencia)} · ${quem} · ${f.status === 'paga' ? 'paga' : f.status === 'paga_parcial' ? 'paga em parte' : 'a pagar'}`) +
                `<div class="rz-sh-b">${corpo}</div>${rodape}`, { classe: 'rz-cheio' });
            const reabrir = (extra = {}) => financeiroAbrirFatura(faturaId, { selecionando, selecionados: [...sel], ...extra });
            sheet.querySelectorAll('[data-fat-selecionar]').forEach(b => b.addEventListener('click', () => financeiroAbrirFatura(faturaId, { selecionando: !selecionando, selecionados: [] })));
            sheet.querySelector('[data-fat-baixar]')?.addEventListener('click', () => financeiroBaixarFatura(f));
            sheet.querySelector('[data-fat-lote]')?.addEventListener('click', () => financeiroClassificarItens(itens.filter(i => sel.has(i.id)), faturaId));
            sheet.querySelectorAll('[data-fat-item]').forEach(row => row.addEventListener('click', () => {
                const id = row.dataset.fatItem;
                if (selecionando) {
                    if (!ac.some(i => i.id === id)) return;
                    if (sel.has(id)) sel.delete(id); else sel.add(id);
                    reabrir();
                    return;
                }
                const i = itens.find(x => x.id === id);
                if (i) financeiroAcoesItemFatura(i, f);
            }));
        }

        function financeiroTextoSugestaoCartao(s, nomeCat) {
            return [s.categoria_nome || nomeCat(s.categoria), s.ativo_nome, s.parte_nome].filter(Boolean).join(' · ');
        }

        function financeiroAcoesItemFatura(i, f) {
            const acoes = [];
            const pend = i.categoria === 'a_classificar';
            const s = i.sugestao || {};
            const nomeCat = (c) => categoriaDoCatalogo(c)?.nome || rotuloCategoriaSaida(c);
            if (pend && s.categoria) {
                acoes.push({ icone: 'sparkles', tipo: 'ia', titulo: financeiroTextoSugestaoCartao(s, nomeCat), sub: `Confiança: ${Math.round(Number(s.confianca || 0))}%`, codigo: 'cartao.classificar',
                    aoTocar: () => financeiroGravarClassificacao([i.id], { categoria: s.categoria, ativo_id: s.ativo_id || null, parte_id: s.parte_id || null, divisao: null, sempre_assim: false }, f.id) });
            }
            acoes.push({ icone: 'tags', titulo: pend ? (s.categoria ? 'Classificar de outro jeito' : 'Classificar') : 'Mudar classificação', sub: 'Categoria, ativo, fornecedor e "Sempre assim"', codigo: 'cartao.classificar', manterAberto: true,
                aoTocar: () => financeiroClassificarItens([i], f.id) });
            if (!pend) {
                acoes.push({ icone: 'undo-2', titulo: 'Voltar para em aberto', sub: 'Volta para "A classificar" para editar de novo', codigo: 'cartao.classificar',
                    aoTocar: () => financeiroGravarClassificacao([i.id], { categoria: 'a_classificar', ativo_id: null, parte_id: null, divisao: null, sempre_assim: false }, f.id) });
                acoes.push({ icone: 'info', titulo: 'Resumo da conciliação', sub: 'Data, origem, modo e canal', aoTocar: () => financeiroResumoCompraCartao(i, f) });
            }
            acoes.push(...financeiroAcaoDivisao('lancamento', i.id, Math.abs(Number(i.valor)), i.divisao_ajustada, () => financeiroAbrirFatura(f.id)));
            acoes.push({ icone: 'trash-2', titulo: 'Excluir compra', sub: 'Só volta importando a fatura de novo', tipo: 'bad', codigo: 'cartao.importar',
                aoTocar: async () => {
                    if (!await rzConfirmar({ titulo: 'Excluir esta compra?', impacto: `"${i.descricao}" sai da fatura de vez. Ela só volta importando a fatura de novo.`, destrutivo: true, rotuloConfirmar: 'Excluir compra' })) return;
                    const { error } = await dbAuth.from('lancamentos').delete().eq('id', i.id);
                    if (error) { rzToast(error.message, { tipo: 'danger' }); return; }
                    if (typeof registrarLog === 'function') registrarLog('cartao.excluir_compra', { lancamento_id: i.id, fatura_id: f.id, descricao: i.descricao, valor: i.valor, compra: i.compra });
                    rzToast('Compra excluída. Ela só volta importando a fatura de novo.', { tipo: 'success' });
                    financeiroDepoisDeMudarFatura(f.id);
                } });
            abrirSheetAcoes({ titulo: escapeHtmlSaidas(i.descricao), sub: `${i.compra ? 'Compra ' + formatarDataBR(i.compra) + ' · ' : ''}${formatarMoedaBR(Math.abs(i.valor))}`, acoes });
        }

        /** Resumo da conciliação da compra de cartão — mesmo formato do extrato (data e hora, origem, modo, canal). */
        async function financeiroResumoCompraCartao(i, f) {
            await carregarRegrasConciliacao();
            const dataHora = i.conciliado_em
                ? new Date(i.conciliado_em).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                : 'Não registrado';
            const regra = i.conciliacao_regra ? nomeRegraConc(i.conciliacao_regra) : '';
            const modo = i.conciliacao_forma === 'automatica' ? `Automático (regra)${regra ? ' · ' + regra : ''}`
                : i.conciliacao_forma === 'sugestao' ? `Sugestão confirmada${regra ? ' · ' + regra : ''}`
                : i.conciliacao_forma === 'manual' ? 'Manual'
                : 'Não registrado (compra de antes desta função existir)';
            const canal = i.conciliacao_forma === 'automatica' ? '—'
                : i.conciliacao_canal === 'app' ? 'App' : i.conciliacao_canal === 'bot' ? 'Bot (WhatsApp)' : 'Não registrado';
            const linha = (rotulo, valor) => `<div class="flex justify-between items-start gap-3 py-2" style="border-bottom:1px solid var(--line)">
                <span class="text-xs font-bold text-gray-600">${rotulo}</span>
                <span class="text-sm text-right" style="color:var(--pine)">${rzEsc(valor)}</span>
            </div>`;
            abrirSheet(rzSheetCabecalho('Resumo da conciliação', `${i.descricao} · − ${formatarMoedaBR(Math.abs(i.valor))}`) +
                `<div class="rz-sh-b">
                    ${linha('Data e hora', dataHora)}
                    ${linha('Origem', `Fatura de cartão — ${financeiroNomeCartao(f)}`)}
                    ${linha('Modo', modo)}
                    ${i.conciliado_por_nome ? linha('Por', i.conciliado_por_nome) : ''}
                    ${linha('Canal', canal)}
                </div>`, { empilhar: true });
        }

        /** Form de classificação (1 ou várias compras): categoria (árvore), ativo, fornecedor, Sempre assim. */
        async function financeiroClassificarItens(lista, faturaId) {
            if (!lista.length || typeof abrirSheetForm !== 'function') return;
            const [ativosOpts, partesOpts] = await Promise.all([carregarAtivosParaSelectSupabase(), carregarPartesParaSelectSupabase(), carregarCatalogoCategorias()]);
            const um = lista.length === 1 ? lista[0] : null;
            const sug = um?.sugestao || {};
            const catAtual = um ? (um.categoria !== 'a_classificar' ? um.categoria : (sug.categoria || '')) : '';
            const cat = (catalogoCategoriasLanc || []).filter(c => c.codigo !== 'a_classificar');
            const grupos = cat.filter(c => !c.categoria_pai && c.direcao === 'saida' && cat.some(x => x.categoria_pai === c.codigo));
            const grupoAtual = cat.find(c => c.codigo === catAtual)?.categoria_pai || '';
            const optsFolhas = (g) => `<option value="">${g ? '— escolha a subcategoria —' : '— escolha a categoria primeiro —'}</option>` +
                cat.filter(c => c.categoria_pai === g && c.direcao === 'saida').map(c => `<option value="${c.codigo}" ${c.codigo === catAtual ? 'selected' : ''}>${escapeHtmlSaidas(c.nome)}</option>`).join('');
            const ativoAtual = um ? (um.ativo_id || sug.ativo_id || '') : '';
            const parteAtual = um ? (um.parte_id || sug.parte_id || '') : '';
            const est = [...new Set(lista.map(i => i.estabelecimento).filter(Boolean))];
            const corpo = `
                <div class="rz-f"><label>Categoria <i>*</i></label><select id="fat-cat-grupo"><option value="">— escolha a categoria —</option>${grupos.map(g => `<option value="${g.codigo}" ${g.codigo === grupoAtual ? 'selected' : ''}>${escapeHtmlSaidas(g.nome)}</option>`).join('')}</select></div>
                <div class="rz-f"><label>Subcategoria <i>*</i></label><select id="fat-cat">${optsFolhas(grupoAtual)}</select></div>
                <div class="rz-f"><label>Ativo (opcional)</label><select id="fat-ativo"><option value="">${um ? 'Nenhum (despesa da empresa)' : 'Manter como está'}</option>${ativosOpts.map(a => `<option value="${a.id}" ${a.id === ativoAtual ? 'selected' : ''}>${escapeHtmlSaidas(a.nome_exibicao)}</option>`).join('')}</select></div>
                <div class="rz-f"><label>Fornecedor (opcional)</label><select id="fat-parte"><option value="">${um ? 'Nenhum' : 'Manter como está'}</option>${partesOpts.map(p => `<option value="${p.id}" ${p.id === parteAtual ? 'selected' : ''}>${escapeHtmlSaidas(p.nome)}</option>`).join('')}<option value="__novo__">+ Cadastrar como fornecedor</option></select>
                    <input type="text" id="fat-parte-novo" placeholder="Nome do fornecedor" value="${escapeHtmlSaidas(um ? um.descricao : '')}" style="display:none;margin-top:6px">
                    <span class="rz-hint">Escolhendo o fornecedor, o Raiz reconhece este nome nas próximas faturas e extratos.</span></div>
                ${est.length ? `<label class="rz-row rz-chk"><input type="checkbox" id="fat-sempre" ${um && um.categoria === 'a_classificar' ? '' : ''}><div class="rz-tx"><b>Sempre assim</b><span>Da próxima vez, compras de ${escapeHtmlSaidas(est.length === 1 ? '"' + est[0] + '"' : 'estes estabelecimentos')} já entram classificadas</span></div></label>` : ''}`;
            const sheet = abrirSheetForm({
                titulo: um ? 'Classificar compra' : `Classificar ${lista.length} compras`,
                sub: um ? `${um.descricao} · ${formatarMoedaBR(Math.abs(um.valor))}` : formatarMoedaBR(lista.reduce((t, i) => t + Number(i.valor || 0), 0)),
                corpo, rotuloSalvar: 'Classificar', empilhar: true,
                aoSalvar: async (el) => {
                    const categoria = el.querySelector('#fat-cat').value;
                    if (!categoria) { rzToast('Escolha a subcategoria.', { tipo: 'danger' }); return false; }
                    let parteId = el.querySelector('#fat-parte').value || null;
                    if (parteId === '__novo__') {
                        const nome = el.querySelector('#fat-parte-novo').value.trim();
                        if (!nome) { rzToast('Informe o nome do fornecedor.', { tipo: 'danger' }); return false; }
                        const { data: np, error: ep } = await dbAuth.from('partes').insert({ cliente_id: CLIENTE_ID_SUPABASE, nome }).select('id').single();
                        if (ep) { rzToast(ep.message, { tipo: 'danger' }); return false; }
                        parteId = np.id;
                        if (typeof partesParaSelect !== 'undefined') partesParaSelect = null; // eslint-disable-line no-global-assign
                    }
                    return financeiroGravarClassificacao(lista.map(i => i.id), {
                        categoria, ativo_id: el.querySelector('#fat-ativo').value || null, parte_id: parteId, divisao: null,
                        sempre_assim: !!el.querySelector('#fat-sempre')?.checked,
                    }, faturaId);
                },
            });
            const sg = sheet?.querySelector('#fat-cat-grupo');
            sg?.addEventListener('change', () => { sheet.querySelector('#fat-cat').innerHTML = optsFolhas(sg.value); });
            const sp = sheet?.querySelector('#fat-parte');
            sp?.addEventListener('change', () => { sheet.querySelector('#fat-parte-novo').style.display = sp.value === '__novo__' ? 'block' : 'none'; });
        }

        async function financeiroGravarClassificacao(ids, v, faturaId) {
            const { data, error } = await dbAuth.rpc('fn_fatura_item_classificar', {
                p_lancamento_ids: ids, p_categoria: v.categoria, p_ativo_id: v.ativo_id, p_parte_id: v.parte_id,
                p_divisao: v.divisao, p_sempre_assim: !!v.sempre_assim,
            });
            if (error || !data?.ok) { rzToast(error?.message || data?.mensagem || 'Não consegui classificar.', { tipo: 'danger' }); return false; }
            rzToast(data.mensagem, { tipo: 'success' });
            emitirEscrita('despesa', { id: ids[0], acao: 'classificar_cartao' });
            financeiroDepoisDeMudarFatura(faturaId);
            return true;
        }

        function financeiroDepoisDeMudarFatura(faturaId) {
            financeiroGarantirFaturas(true);
            financeiroRecarregarSaidas();
            setTimeout(() => financeiroAbrirFatura(faturaId), 30); // depois do fecharSheet do form
        }

        /** Baixa manual da fatura (quando não há extrato; com extrato, a CT03 liga sozinha). */
        function financeiroBaixarFatura(f) {
            if (typeof abrirSheetForm !== 'function') return;
            const falta = Number(f.valor_total) - Number(f.valor_pago || 0);
            const contas = (financeiroContasInfo.contas || []).filter(c => (c.tipo || 'conta') === 'conta');
            abrirSheetForm({
                titulo: 'Marcar fatura como paga', sub: `Fatura ${financeiroNomeCartao(f)}`, rotuloSalvar: 'Confirmar pagamento', empilhar: true,
                corpo: `<p class="rz-hint" style="margin:0 0 10px">Se o pagamento aparecer no extrato, o Raiz liga sozinho à fatura. Use aqui quando não houver extrato.</p>
                    <div class="rz-f2">
                        <div class="rz-f"><label>Valor pago (R$)</label><input type="number" step="0.01" id="fb-valor" value="${falta.toFixed(2)}"></div>
                        <div class="rz-f"><label>Data</label><input type="date" id="fb-data" value="${new Date().toISOString().slice(0, 10)}"></div>
                    </div>
                    ${contas.length > 1 ? `<div class="rz-f"><label>Conta</label><select id="fb-conta">${contas.map(c => `<option value="${c.id}" ${c.id === f.conta_pagadora_id ? 'selected' : ''}>${escapeHtmlSaidas(c.nome)}</option>`).join('')}</select></div>` : ''}`,
                aoSalvar: async (el) => {
                    const valor = parseFloat(el.querySelector('#fb-valor').value);
                    if (!(valor > 0)) { rzToast('Informe o valor pago.', { tipo: 'danger' }); return false; }
                    const conta = el.querySelector('#fb-conta')?.value || null;
                    const { data, error } = await dbAuth.rpc('fn_fatura_baixar', { p_fatura_id: f.id, p_valor: valor, p_data: el.querySelector('#fb-data').value || null, p_conta_id: conta && conta !== f.conta_pagadora_id ? conta : null });
                    if (error || !data?.ok) { rzToast(error?.message || data?.mensagem || 'Não consegui registrar.', { tipo: 'danger' }); return false; }
                    rzToast(data.mensagem, { tipo: 'success' });
                    emitirEscrita('despesa', { id: f.id, acao: 'pagar_fatura' });
                    financeiroDepoisDeMudarFatura(f.id);
                    return true;
                },
            });
        }

        /** Lançar › Importar fatura do cartão: escolhe o cartão, lê o PDF/foto com IA, confere e importa. */
        export async function financeiroImportarFatura() {
            if (typeof abrirSheetForm !== 'function') return;
            await financeiroGarantirContas();
            const cartoes = financeiroContasInfo.cartoes || []; // v1.38.0
            if (!cartoes.length) {
                rzAviso({ titulo: 'Cadastre o cartão primeiro', linhas: ['Em Configurações › Empresa › Contas, toque em "+" e escolha o tipo "Cartão de crédito", com o dia do fechamento, o dia do vencimento e a conta que paga a fatura.'] });
                return;
            }
            let lido = null;
            const desenhar = (el) => {
                const optsCartao = cartoes.map(c => `<option value="${c.id}">${escapeHtmlSaidas(c.nome)}${c.final_identificador ? ' ·· ' + c.final_identificador : ''} (${escapeHtmlSaidas(c.titular_tipo === 'empresa' ? 'Empresa' : (c.titular_nome || ''))})</option>`).join('');
                el.innerHTML = `
                    <div class="rz-f"><label>Cartão</label><select id="fi-cartao">${optsCartao}</select></div>
                    <input type="file" id="fi-arquivo" accept="application/pdf,image/*" style="display:none">
                    <button type="button" class="rz-act" id="fi-escolher"><div class="rz-ic rz-ia"><svg data-lucide="file-up"></svg></div><div>Escolher PDF ou foto da fatura<small>A Raiz IA lê as compras; você confere antes de importar</small></div></button>
                    <div id="fi-conf"></div>`;
                el.querySelector('#fi-escolher').addEventListener('click', () => el.querySelector('#fi-arquivo').click());
                el.querySelector('#fi-arquivo').addEventListener('change', async (ev) => {
                    const file = ev.target.files?.[0]; if (!file) return;
                    mostrarCarregamentoGlobal('Lendo a fatura com IA...');
                    try {
                        const base64 = await arquivoParaBase64(file);
                        const { data, error } = await dbAuth.functions.invoke('extrato-extrair-transacoes', { body: { arquivo_base64: base64, mime_type: file.type || 'application/pdf', cliente_id: CLIENTE_ID_SUPABASE, tipo: 'fatura_cartao' } });
                        esconderCarregamentoGlobal();
                        if (error) throw new Error(error.message || 'Falha ao ler a fatura.');
                        if (!data?.extraido) { rzToast(data?.motivo || data?.erro || 'Não consegui ler essa fatura.', { tipo: 'danger' }); return; }
                        lido = data.resultado;
                        conferir(el);
                    } catch (e) { esconderCarregamentoGlobal(); rzToast(e.message, { tipo: 'danger' }); }
                });
            };
            let sim = null; // v1.38.0 — resultado da simulação (fn_fatura_importar com simular)
            const simular = async (el) => {
                const box = el.querySelector('#fi-sim'); if (!box) return;
                box.innerHTML = '<p class="rz-hint">Comparando com o que já está na fatura…</p>';
                const { data, error } = await dbAuth.rpc('fn_fatura_importar', {
                    p_cliente_id: CLIENTE_ID_SUPABASE, p_cartao_id: el.querySelector('#fi-cartao').value, p_competencia: el.querySelector('#fi-comp').value,
                    p_cabecalho: { simular: true }, p_itens: lido.itens.map(i => ({ data: i.data, descricao: i.descricao, valor: i.valor, parcela: i.parcela })),
                });
                if (error || !data?.ok) { box.innerHTML = `<p class="rz-hint" style="color:var(--danger)">${escapeHtmlSaidas(error?.message || data?.mensagem || 'Não consegui comparar.')}</p>`; sim = null; return; }
                sim = data.dados;
                const linhaLida = (i) => `<div class="rz-row"><div class="rz-tx"><b>${escapeHtmlSaidas(i.descricao)}</b><span>${formatarDataBR(i.data)}${i.parcela ? ' · parcela ' + escapeHtmlSaidas(i.parcela) : ''}</span></div><div class="rz-rt">${Number(i.valor) < 0 ? `<b class="rz-in">+ ${formatarMoedaBR(Math.abs(i.valor))}</b>` : `<b class="rz-out">− ${formatarMoedaBR(i.valor)}</b>`}</div></div>`;
                const novos = (sim.novos || []).map(k => lido.itens[k]).filter(Boolean);
                const nRep = (sim.repetidos || []).length;
                const falt = sim.faltando || [];
                box.innerHTML = `
                    ${sim.fatura_status === 'paga' && novos.length ? `<label class="rz-row rz-chk"><input type="checkbox" id="fi-conf-paga"><div class="rz-tx"><b>A fatura já está paga</b><span>Marque para acrescentar ${novos.length} ${novos.length === 1 ? 'compra nova' : 'compras novas'}; ela volta para "paga em parte" se o total mudar</span></div></label>` : ''}
                    <div class="rz-group">Novas · ${novos.length}</div>
                    ${novos.length ? `<div class="rz-card rz-list">${novos.map(linhaLida).join('')}</div>` : '<p class="rz-hint">Nenhuma compra nova neste arquivo.</p>'}
                    ${nRep ? `<div class="rz-group">Já estão na fatura · ${nRep}</div><p class="rz-hint">Não entram de novo.</p>` : ''}
                    ${falt.length ? `<div class="rz-group">No Raiz e não vieram neste arquivo · ${falt.length}</div>
                        <div class="rz-card rz-list">${falt.map(x => `<label class="rz-row rz-chk"><input type="checkbox" data-fi-excluir="${x.id}"><div class="rz-tx"><b>${escapeHtmlSaidas(x.descricao)}</b><span>${x.compra ? 'Compra ' + escapeHtmlSaidas(x.compra) + ' · ' : ''}marque para excluir</span></div><div class="rz-rt"><b class="rz-out">− ${formatarMoedaBR(x.valor)}</b></div></label>`).join('')}</div>` : ''}`;
                const btn = document.getElementById('rz-sheet-salvar');
                if (btn) btn.textContent = novos.length ? `Importar ${novos.length}` : 'Atualizar fatura';
            };
            const conferir = (el) => {
                const venc = lido.dataVencimento || '';
                const comp = venc ? venc.slice(0, 7) + '-01' : (financeiroCompetenciaAtual || financeiroCompetenciaHojeISO());
                const meses = [-1, 0, 1].map(d => { const x = new Date(comp + 'T00:00:00'); x.setMonth(x.getMonth() + d); return x.toISOString().slice(0, 7) + '-01'; });
                const soma = lido.itens.reduce((t, i) => t + Number(i.valor || 0), 0);
                const cart = cartoes.find(c => c.id === el.querySelector('#fi-cartao').value);
                const finalDiverge = lido.finalCartao && cart?.final_identificador && lido.finalCartao !== cart.final_identificador;
                el.querySelector('#fi-escolher').style.display = 'none';
                el.querySelector('#fi-conf').innerHTML = `
                    ${finalDiverge ? `<p class="rz-hint" style="color:var(--danger);margin:0 0 8px">A fatura é do final ${escapeHtmlSaidas(lido.finalCartao)} e o cartão escolhido é ${escapeHtmlSaidas(cart.final_identificador)}. Confira o cartão.</p>` : ''}
                    <div class="rz-f"><label>Mês da fatura</label><select id="fi-comp">${meses.map(m => `<option value="${m}" ${m === comp ? 'selected' : ''}>${financeiroCompetenciaLabel(m)}</option>`).join('')}</select></div>
                    <div class="rz-card">
                        <div style="display:flex;justify-content:space-between;gap:12px;padding:4px 0;font-size:14px"><span style="color:var(--muted)">Vencimento</span><b>${venc ? formatarDataBR(venc) : 'pelo dia do cartão'}</b></div>
                        <div style="display:flex;justify-content:space-between;gap:12px;padding:4px 0;font-size:14px"><span style="color:var(--muted)">Total da fatura</span><b>${lido.valorTotal != null ? formatarMoedaBR(lido.valorTotal) : '—'}</b></div>
                        <div style="display:flex;justify-content:space-between;gap:12px;padding:4px 0;font-size:14px"><span style="color:var(--muted)">Soma das compras</span><b ${lido.valorTotal != null && Math.abs(soma - lido.valorTotal) > 0.01 ? 'style="color:var(--danger)"' : ''}>${formatarMoedaBR(soma)}</b></div>
                    </div>
                    <span class="rz-hint">${lido.itens.length} ${lido.itens.length === 1 ? 'compra lida' : 'compras lidas'} no arquivo</span>
                    <div id="fi-sim"></div>`;
                if (typeof rzIcones === 'function') rzIcones();
                el.querySelector('#fi-comp').addEventListener('change', () => simular(el));
                el.querySelector('#fi-cartao').addEventListener('change', () => simular(el));
                simular(el);
            };
            abrirSheetForm({
                titulo: 'Importar fatura do cartão', sub: 'PDF ou foto', rotuloSalvar: 'Importar',
                corpo: (el) => desenhar(el),
                aoSalvar: async (el) => {
                    if (!lido) { rzToast('Escolha o PDF ou a foto da fatura.', { tipo: 'danger' }); return false; }
                    if (!sim) { rzToast('Aguarde a comparação com a fatura.', { tipo: 'info' }); return false; }
                    const confirmarPaga = !!el.querySelector('#fi-conf-paga')?.checked;
                    if (el.querySelector('#fi-conf-paga') && !confirmarPaga) { rzToast('A fatura já está paga: marque a confirmação para acrescentar as compras novas.', { tipo: 'danger' }); return false; }
                    const excluir = [...el.querySelectorAll('[data-fi-excluir]:checked')].map(x => x.dataset.fiExcluir);
                    if (excluir.length && !await rzConfirmar({ titulo: `Excluir ${excluir.length} ${excluir.length === 1 ? 'compra' : 'compras'}?`, impacto: 'Saem da fatura de vez. Só voltam importando a fatura de novo.', destrutivo: true, rotuloConfirmar: 'Excluir e importar' })) return false;
                    const cartaoId = el.querySelector('#fi-cartao').value;
                    const { data, error } = await dbAuth.rpc('fn_fatura_importar', {
                        p_cliente_id: CLIENTE_ID_SUPABASE, p_cartao_id: cartaoId, p_competencia: el.querySelector('#fi-comp').value,
                        p_cabecalho: { data_vencimento: lido.dataVencimento, data_fechamento: lido.dataFechamento, valor_total: lido.valorTotal, confirmar_paga: confirmarPaga },
                        p_itens: lido.itens.map(i => ({ data: i.data, descricao: i.descricao, valor: i.valor, parcela: i.parcela })),
                    });
                    if (error || !data?.ok) { rzToast(error?.message || data?.mensagem || 'Não consegui importar.', { tipo: 'danger' }); return false; }
                    for (const id of excluir) {
                        const { error: eDel } = await dbAuth.from('lancamentos').delete().eq('id', id);
                        if (eDel) { rzToast('Não consegui excluir uma compra: ' + eDel.message, { tipo: 'danger' }); break; }
                        if (typeof registrarLog === 'function') registrarLog('cartao.excluir_compra', { lancamento_id: id, fatura_id: data.id, origem: 'reimportacao' });
                    }
                    rzToast(data.mensagem + (excluir.length ? ` ${excluir.length} ${excluir.length === 1 ? 'compra excluída' : 'compras excluídas'}.` : ''), { tipo: 'success' });
                    emitirEscrita('despesa', { id: data.id, acao: 'importar_fatura' });
                    financeiroGarantirFaturas(true);
                    financeiroRecarregarSaidas();
                    setTimeout(() => financeiroAbrirFatura(data.id), 30);
                    return true;
                },
            });
        }

        // v1.31.0 — catálogo de categorias (tabela lancamento_categorias, demanda 2923ff4d)
        let catalogoCategoriasLanc = null;
        let catalogoCategoriasCarregando = null;
        export function carregarCatalogoCategorias() {
            if (catalogoCategoriasLanc) return Promise.resolve(catalogoCategoriasLanc);
            if (!catalogoCategoriasCarregando) {
                catalogoCategoriasCarregando = (async () => {
                    try {
                        const { data, error } = await dbAuth.from('lancamento_categorias')
                            .select('codigo,nome,direcao,categoria_pai,icone,ordem,grupo_resultado,contabilidade_padrao').eq('ativo', true).order('ordem'); // v1.34.0
                        if (error) throw error;
                        catalogoCategoriasLanc = data || [];
                    } catch (err) { console.warn('[financeiro] catálogo de categorias:', err.message); }
                    catalogoCategoriasCarregando = null;
                    return catalogoCategoriasLanc;
                })();
            }
            return catalogoCategoriasCarregando;
        }
        function categoriaDoCatalogo(v) { return (catalogoCategoriasLanc || []).find(c => c.codigo === v) || null; }
        // v1.34.0 — chips de classificação da folha: resultado (grupo_resultado) e contabilidade
        function chipsClassificacaoLanc(folha, contab) {
            const partes = [];
            if (folha) partes.push(folha.grupo_resultado === 'fora_resultado' ? 'Fora do resultado' : 'Entra no resultado');
            if (contab != null) partes.push(contab ? 'Contabilidade: sim' : 'Contabilidade: não');
            return partes;
        }
        let despContabEdicao = null; // v1.34.0 — na edição, o incluir_contabilidade gravado (só leitura)

        export function rotuloCategoriaSaida(v) {
            const doCatalogo = categoriaDoCatalogo(v); // v1.31.0
            if (doCatalogo) return doCatalogo.nome;
            const mapa = { iptu: 'IPTU', condominio: 'Condomínio', manutencao: 'Manutenção', seguro: 'Seguro', taxa_adm: 'Taxa administrativa', tributo: 'Tributo', repasse_socio: 'Repasse a sócio', tecnologia_assinaturas: 'Tecnologia e assinaturas', reembolso: 'Reembolso', aluguel: 'Aluguel (repasse a terceiro)', outro: 'Outro' };
            return mapa[v] || v;
        }

        // v1.179.2 — achado do Nicola: ícone por categoria na lista de
        // Saídas (repasse, tributo, seguro etc. cada um com o seu), em vez
        // de só variar por status pago/atrasado/a-vencer.
        const ICONE_POR_CATEGORIA_SAIDA = {
            iptu: 'landmark', condominio: 'building-2', manutencao: 'wrench',
            seguro: 'shield-check', taxa_adm: 'percent', tributo: 'receipt',
            repasse_socio: 'arrow-left-right', reembolso: 'rotate-ccw',
            aluguel: 'key-round', tecnologia_assinaturas: 'cloud', outro: 'circle-dollar-sign'
        };

        // v1.13.0 — alternarGrupoSaidas() removida (Entrega F.3): a lista
        // deixou de agrupar por competência, não tem mais o que expandir/
        // recolher (ver nota grande no topo do arquivo).

        export function abrirBuscaSaidas() {
            const modal = document.getElementById('modal-busca-saidas');
            modal.classList.remove('hidden');
            modal.onclick = (ev) => { if (ev.target === modal) fecharBuscaSaidas(); };
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        export function fecharBuscaSaidas() {
            document.getElementById('modal-busca-saidas').classList.add('hidden');
        }

        // "Ver tudo em Saídas" a partir do chip Financeiro da ficha do
        // ativo (cofre-ativos.js v1.10.0) — mesmo espírito de
        // abrirFinanceiroFiltradoImovel, adaptado: a origem aqui é o
        // MÓDULO Ativos (que vive numa pilha de navegação própria,
        // switchTab('tab-ativos') simplesmente revela o que já estava
        // montado lá dentro — não precisa reabrir a ficha explicitamente).
        let saidasFiltradasOrigemAtiva = false;

        export function abrirSaidasFiltradasPorAtivo(ativoId, nomeAtivo) {
            saidasFiltradasOrigemAtiva = true;
            document.getElementById('saidas-filtro-ativo').value = ativoId;
            const selAtivo = document.getElementById('saidas-filtro-ativo-select');
            popularFiltrosSaidas();
            if (selAtivo) selAtivo.value = ativoId;
            document.getElementById('btn-voltar-saidas')?.classList.remove('hidden');
            renderSaidas();
        }

        export function voltarDasSaidasFiltradas() {
            document.getElementById('btn-voltar-saidas')?.classList.add('hidden');
            document.getElementById('saidas-filtro-ativo').value = 'todos';
            const selAtivo = document.getElementById('saidas-filtro-ativo-select');
            if (selAtivo) selAtivo.value = 'todos';
            saidasFiltradasOrigemAtiva = false;
            switchTab('tab-ativos');
        }

        // ---- Popup Tipo B (Nova Despesa / Editar Despesa) ----
        let despesaEmEdicaoId = null;

        // v1.17.0 (NOVO, 02/09/2026) — 3º parâmetro opcional `sugestoes`:
        // { descricao, categoria, partes: [{parte_id, nome}] } — vindo da
        // ponte abrirNovoLancamentoDoItem() (cofre-controles.js). Pedido
        // explícito: "vai precisar de um controle de qual a parte é pra
        // alocar a despesa já que podemos ter mais que 1 parte
        // cadastrada" — quando o item tem 2+ partes, mostra um chip por
        // parte pra escolher qual delas é o fornecedor DESTE lançamento
        // específico (não dá pra adivinhar sozinho).
        export async function abrirNovaDespesa(ativoIdPreSelecionado, sugestoes) {
            despesaEmEdicaoId = null;
            await montarPopupDespesa(null, ativoIdPreSelecionado || null, sugestoes || null);
        }

        export async function abrirEditarDespesa(id) {
            despesaEmEdicaoId = id;
            const d = lancamentos.find(x => x.id === id);
            await montarPopupDespesa(d, null, null);
        }

        export async function montarPopupDespesa(d, ativoPreSelecionadoId, sugestoes) {
            mostrarCarregamentoGlobal('Carregando...');
            const [ativosOpts, partesOpts] = await Promise.all([carregarAtivosParaSelectSupabase(), carregarPartesParaSelectSupabase(), carregarCatalogoCategorias()]);
            esconderCarregamentoGlobal();

            document.getElementById('modal-campo-contrato')?.remove();

            const ehEdicao = !!d;
            const jaFoiPaga = ehEdicao && d.status === 'realizado';
            const ativoSelecionado = d ? d.ativoId : ativoPreSelecionadoId;

            // Se só tem 1 sugestão de parte, já pré-seleciona (não faz
            // sentido perguntar quando não há escolha real); com 2+, o
            // select some sem valor e os chips ficam clicáveis.
            const parteSugeridaUnica = sugestoes?.partes?.length === 1 ? sugestoes.partes[0].parte_id : null;

            const optsAtivos = `<option value="">Nenhum (despesa avulsa)</option>` + ativosOpts.map(a =>
                `<option value="${a.id}" ${a.id === ativoSelecionado ? 'selected' : ''}>${escapeHtmlSaidas(a.nome_exibicao)}</option>`).join('');
            const optsPartes = `<option value="">— selecionar —</option>` + partesOpts.map(p =>
                `<option value="${p.id}" ${(p.id === d?.parteId || p.id === parteSugeridaUnica) ? 'selected' : ''}>${escapeHtmlSaidas(p.nome)}</option>`).join('') +
                `<option value="__novo__">+ Novo fornecedor</option>`;
            // v1.32.0 — árvore: Categoria (nível 1 de saída) → Subcategoria (folhas). Sem nível 1
            // no catálogo, cai na lista única da v1.31.0 (e esta na fixa, se o catálogo falhar).
            const categoriaAtualDesp = d?.categoria || sugestoes?.categoria || null;
            const catDesp = catalogoCategoriasLanc || [];
            const gruposDesp = catDesp.filter(c => !c.categoria_pai && c.direcao === 'saida' && catDesp.some(f => f.categoria_pai === c.codigo));
            const usarArvoreDesp = gruposDesp.length > 0;
            const grupoAtualDesp = usarArvoreDesp ? (catDesp.find(c => c.codigo === categoriaAtualDesp)?.categoria_pai || '') : '';
            let listaCategoriasDesp;
            if (usarArvoreDesp) listaCategoriasDesp = grupoAtualDesp ? catDesp.filter(c => c.categoria_pai === grupoAtualDesp).map(c => c.codigo) : [];
            else listaCategoriasDesp = catDesp.length
                ? catDesp.filter(c => c.direcao !== 'entrada' || c.codigo === categoriaAtualDesp).map(c => c.codigo)
                : ['iptu', 'condominio', 'manutencao', 'seguro', 'taxa_adm', 'tributo', 'repasse_socio', 'reembolso', 'aluguel', 'tecnologia_assinaturas', 'outro'];
            if (categoriaAtualDesp && !listaCategoriasDesp.includes(categoriaAtualDesp)) listaCategoriasDesp.push(categoriaAtualDesp);
            const optsGruposDesp = `<option value="">— escolha a categoria —</option>` + gruposDesp
                .map(g => `<option value="${g.codigo}" ${g.codigo === grupoAtualDesp ? 'selected' : ''}>${escapeHtmlSaidas(g.nome)}</option>`).join('');
            const optsCategorias = (usarArvoreDesp ? `<option value="">${grupoAtualDesp ? '— escolha a subcategoria —' : '— escolha a categoria primeiro —'}</option>` : '') + listaCategoriasDesp
                .map(v => `<option value="${v}" ${v === categoriaAtualDesp ? 'selected' : ''}>${rotuloCategoriaSaida(v)}</option>`).join('');
            const optsFormaPagamento = ['pix', 'boleto', 'transferencia', 'dinheiro', 'outro']
                .map(v => `<option value="${v}" ${v === d?.formaPagamento ? 'selected' : ''}>${v.charAt(0).toUpperCase() + v.slice(1)}</option>`).join('');

            // v1.179.2 — achado do Nicola: vencimento agora pré-preenche a
            // partir da sugestão (data do pagamento na Conciliação) — a
            // competência precisa seguir junto, senão o dropdown mostra o
            // mês corrente enquanto o vencimento mostra outro mês.
            const competenciaPadrao = d ? dataParaCompetencia(d.competencia) : dataParaCompetencia(sugestoes?.vencimento || new Date().toISOString().slice(0, 10));
            const opcoesComp = [...new Set([competenciaPadrao, ...gerarProximasCompetencias(3)])];
            const optsCompetencia = opcoesComp.map(c => `<option value="${c}" ${c === competenciaPadrao ? 'selected' : ''}>${c}</option>`).join('');

            const modal = document.createElement('div');
            modal.id = 'modal-campo-contrato';
            modal.style = 'position:fixed;inset:0;z-index:96;display:flex;align-items:flex-end;justify-content:center;background:rgba(23,33,30,.5);';
            modal.innerHTML = `
                <div style="background:#fff;border-radius:16px 16px 0 0;max-width:480px;width:100%;padding:16px;max-height:88vh;overflow-y:auto;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                        <h3 style="font-size:14px;font-weight:bold;color:#1e293b;">${ehEdicao ? 'Detalhes da despesa' : 'Nova despesa'}</h3>
                        <button onclick="fecharPopupDespesa()" style="background:#e2e8f0;border:none;border-radius:9999px;width:26px;height:26px;flex:none;">✕</button>
                    </div>
                    <div style="display:flex;flex-direction:column;gap:8px;">
                        <div>
                            <label style="font-size:11px;font-weight:bold;color:#64748b;">Descrição <span style="color:var(--danger)">*</span></label>
                            <input id="desp-descricao" type="text" value="${escapeHtmlSaidas(d?.descricao || sugestoes?.descricao || '')}" placeholder="Ex: Reparo de infiltração — suíte" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;">
                        </div>
                        ${usarArvoreDesp ? `<div class="rz-f">
                            <label for="desp-categoria-grupo">Categoria <i>*</i></label>
                            <select id="desp-categoria-grupo">${optsGruposDesp}</select>
                        </div>
                        <div class="rz-f">
                            <label for="desp-categoria">Subcategoria <i>*</i></label>
                            <select id="desp-categoria">${optsCategorias}</select>
                        </div>
                        ${ehEdicao ? '' : `<label class="rz-row rz-chk"><input type="checkbox" id="desp-contab" checked><div class="rz-tx"><b>Entra na contabilidade</b><span>Vai no pacote do contador; sugerido pela subcategoria</span></div></label>`}` : ''}
                        <div class="grid grid-cols-2 gap-2">
                            <div${usarArvoreDesp ? ' class="hidden"' : ''}>
                                <label style="font-size:11px;font-weight:bold;color:#64748b;">Categoria <span style="color:var(--danger)">*</span></label>
                                <select id="${usarArvoreDesp ? 'desp-categoria-legado' : 'desp-categoria'}" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;background:#f8fafc;">${optsCategorias}</select>
                            </div>
                            <div>
                                <label style="font-size:11px;font-weight:bold;color:#64748b;">Valor (R$) <span style="color:var(--danger)">*</span></label>
                                <input id="desp-valor" type="number" step="0.01" value="${d?.valor ?? sugestoes?.valor ?? ''}" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;">
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                            <div>
                                <label style="font-size:11px;font-weight:bold;color:#64748b;">Vencimento <span style="color:var(--danger)">*</span></label>
                                <input id="desp-vencimento" type="date" value="${d?.vencimento || sugestoes?.vencimento || ''}" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;">
                            </div>
                            <div>
                                <label style="font-size:11px;font-weight:bold;color:#64748b;">Competência <span style="color:var(--danger)">*</span></label>
                                <select id="desp-competencia" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;background:#f8fafc;">${optsCompetencia}</select>
                            </div>
                        </div>
                        <div>
                            <label style="font-size:11px;font-weight:bold;color:#64748b;">Ativo vinculado (opcional)</label>
                            <select id="desp-ativo" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;background:#f8fafc;">${optsAtivos}</select>
                        </div>
                        <div>
                            <label style="font-size:11px;font-weight:bold;color:#64748b;">Fornecedor / beneficiário</label>
                            ${sugestoes?.partes?.length > 1 ? `
                            <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:2px;margin-bottom:6px;">
                                ${sugestoes.partes.map(p => `<button type="button" onclick="document.getElementById('desp-fornecedor').value='${p.parte_id}'; alternarNovoFornecedor('${p.parte_id}');" style="font-size:11px;font-weight:bold;padding:5px 10px;border-radius:9999px;background:var(--sprout-light);color:var(--pine);border:1px solid var(--sprout);">${escapeHtmlSaidas(p.nome)}</button>`).join('')}
                            </div>
                            <p style="font-size:10px;color:#94a3b8;margin-top:-4px;margin-bottom:4px;">Este item tem mais de uma parte — toque em quem deve receber esta despesa.</p>` : ''}
                            <select id="desp-fornecedor" onchange="alternarNovoFornecedor(this.value)" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;background:#f8fafc;">${optsPartes}</select>
                            <input id="desp-fornecedor-novo-nome" type="text" placeholder="Nome do novo fornecedor" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:6px;display:none;">
                            <p style="font-size:10px;color:#94a3b8;margin-top:2px;">Vira um cadastro em Partes, mesmo que incompleto — dá pra completar depois.</p>
                        </div>
                        ${financeiroContasMultiplas() && (typeof podeUsar !== 'function' || podeUsar('financeiro.contas.escolher').ok) ? `<div class="rz-f"><label>Conta</label><select id="desp-conta">${financeiroContasInfo.contas.map(c => `<option value="${c.id}" ${(d?.contaId ? d.contaId === c.id : (c.padrao && c.titular_tipo === 'empresa')) ? 'selected' : ''}>${escapeHtmlSaidas(c.nome)}</option>`).join('')}</select></div>` : ''}
                        <div style="display:flex;align-items:flex-start;gap:8px;background:#f8fafc;border-radius:8px;padding:8px;">
                            <input id="desp-reembolsavel" type="checkbox" ${d?.reembolsavel ? 'checked' : ''} style="margin-top:2px;">
                            <label for="desp-reembolsavel" style="font-size:11px;color:#475569;">Reembolsável — não entra no cálculo de líquido dos sócios</label>
                        </div>
                        ${(() => {
                            // v1.6.0 — Etapa 8: só mostra quando a linha do extrato tem
                            // documento (CPF/CNPJ) — fn_conciliacao_sempre_assim exige
                            // documento pra criar a memória (senão não tem como
                            // reconhecer "este favorecido de novo" com segurança).
                            if (ehEdicao || !despesaOrigemFingerprintId) return '';
                            const fpOrigem = conciliacaoUniCache.find(x => x.id === despesaOrigemFingerprintId);
                            if (!fpOrigem?.documento_original) return '';
                            return `<div style="display:flex;align-items:flex-start;gap:8px;background:var(--brass-bg,#f7ecd9);border-radius:8px;padding:8px;">
                                <input id="desp-sempre-assim" type="checkbox" style="margin-top:2px;">
                                <label for="desp-sempre-assim" style="font-size:11px;color:var(--brass-deep,#8a5a1f);">Sempre fazer assim com este favorecido — próximas vezes a conciliação registra sozinha, nesta categoria (dá pra desfazer)</label>
                            </div>`;
                        })()}
                        <div>
                            <label style="font-size:11px;font-weight:bold;color:#64748b;">Observação</label>
                            <textarea id="desp-observacao" rows="2" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;resize:none;">${escapeHtmlSaidas(d?.observacao || '')}</textarea>
                        </div>
                        ${ehEdicao && !jaFoiPaga ? `
                        <div style="border-top:1px dashed #e6e3da;padding-top:10px;margin-top:2px;">
                            <p style="font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:.02em;color:var(--brass-deep);margin-bottom:6px;">Dar baixa</p>
                            <div class="grid grid-cols-2 gap-2">
                                <div>
                                    <label style="font-size:11px;font-weight:bold;color:#64748b;">Data do pagamento</label>
                                    <input id="desp-data-pgto" type="date" value="${new Date().toISOString().slice(0, 10)}" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;">
                                </div>
                                <div>
                                    <label style="font-size:11px;font-weight:bold;color:#64748b;">Forma de pagamento</label>
                                    <select id="desp-forma-pgto" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;background:#f8fafc;"><option value="">— não definida —</option>${optsFormaPagamento}</select>
                                </div>
                            </div>
                            <button onclick="confirmarPagamentoDespesa('${d.id}')" style="width:100%;margin-top:8px;background:var(--success);color:#fff;font-weight:bold;font-size:13px;padding:9px;border:none;border-radius:8px;">✓ Confirmar pagamento</button>
                        </div>` : ''}
                        ${jaFoiPaga ? `
                        <div style="background:var(--success-bg);border-radius:8px;padding:10px;">
                            <p style="font-size:12px;color:#166534;font-weight:bold;">✓ Paga em ${formatarDataBR(d.dataPagamento)}${d.formaPagamento ? ' via ' + d.formaPagamento.toUpperCase() : ''}</p>
                            <button onclick="estornarPagamentoDespesa('${d.id}')" style="margin-top:6px;background:transparent;border:none;color:#92400e;font-size:11px;font-weight:bold;text-decoration:underline;padding:0;">Estornar pagamento</button>
                        </div>` : ''}
                    </div>
                    <div style="display:flex;gap:8px;margin-top:14px;">
                        <button onclick="fecharPopupDespesa()" style="flex:1;background:#f1f5f9;color:#475569;font-weight:bold;font-size:13px;padding:10px;border:none;border-radius:8px;">Fechar</button>
                        <button onclick="salvarDespesa()" style="flex:1;background:var(--pine);color:#fff;font-weight:bold;font-size:13px;padding:10px;border:none;border-radius:8px;">Salvar</button>
                    </div>
                    ${ehEdicao ? `<button onclick="excluirDespesa('${d.id}')" style="width:100%;margin-top:10px;background:transparent;border:none;color:var(--danger);font-size:11px;font-weight:bold;padding:4px;">Excluir despesa</button>` : ''}
                </div>`;
            document.body.appendChild(modal);
            modal.onclick = (ev) => { if (ev.target === modal) modal.remove(); };
            despContabEdicao = ehEdicao ? d?.incluirContabilidade !== false : null; // v1.34.0
            ligarCascataCategoriaDesp(); // v1.32.0
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        // v1.32.0 — Categoria → Subcategoria e linha de chips com o caminho escolhido.
        function ligarCascataCategoriaDesp() {
            const selGrupo = document.getElementById('desp-categoria-grupo');
            const selSub = document.getElementById('desp-categoria');
            if (!selSub) return;
            let caminho = document.getElementById('desp-caminho');
            if (!caminho) {
                caminho = document.createElement('div');
                caminho.id = 'desp-caminho';
                caminho.className = 'rz-chips';
                (selGrupo ? selGrupo.parentElement : selSub.closest('.grid'))?.insertAdjacentElement('beforebegin', caminho);
            }
            const atualizar = () => {
                const ativoSel = document.getElementById('desp-ativo');
                const nomeAtivo = ativoSel && ativoSel.value ? ativoSel.options[ativoSel.selectedIndex]?.text : '';
                const grupo = selGrupo && selGrupo.value ? selGrupo.options[selGrupo.selectedIndex]?.text : '';
                const sub = selSub.value ? selSub.options[selSub.selectedIndex]?.text : '';
                const valor = parseFloat(document.getElementById('desp-valor')?.value);
                const chkContab = document.getElementById('desp-contab'); // v1.34.0
                const classif = chipsClassificacaoLanc(selSub.value ? categoriaDoCatalogo(selSub.value) : null, chkContab ? chkContab.checked : despContabEdicao);
                const partes = ['Saída', nomeAtivo, grupo, sub, isNaN(valor) ? '' : valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), ...classif].filter(Boolean);
                caminho.innerHTML = partes.map(p => `<span class="rz-chip">${escapeHtmlSaidas(p)}</span>`).join('');
            };
            if (selGrupo) selGrupo.addEventListener('change', () => {
                const g = selGrupo.value;
                const folhas = (catalogoCategoriasLanc || []).filter(c => c.categoria_pai === g);
                selSub.innerHTML = `<option value="">${g ? '— escolha a subcategoria —' : '— escolha a categoria primeiro —'}</option>` +
                    folhas.map(f => `<option value="${f.codigo}">${escapeHtmlSaidas(f.nome)}</option>`).join('');
                if (folhas.length === 1) selSub.value = folhas[0].codigo;
                atualizar();
            });
            // v1.34.0 — a subcategoria sugere "Entra na contabilidade" (contabilidade_padrao)
            const sugerirContab = () => {
                const chk = document.getElementById('desp-contab');
                const folha = selSub.value ? categoriaDoCatalogo(selSub.value) : null;
                if (chk && folha) chk.checked = folha.contabilidade_padrao !== false;
            };
            selSub.addEventListener('change', () => { sugerirContab(); atualizar(); });
            if (selGrupo) selGrupo.addEventListener('change', () => { sugerirContab(); atualizar(); });
            document.getElementById('desp-contab')?.addEventListener('change', atualizar);
            document.getElementById('desp-valor')?.addEventListener('input', atualizar);
            document.getElementById('desp-ativo')?.addEventListener('change', atualizar);
            atualizar();
        }

        // "MM/AAAA" das próximas N competências a partir de hoje — só pro
        // select de Competência ter opções futuras plausíveis além da
        // atual (não é geração de lançamento nenhum, só rótulo de mês).
        export function gerarProximasCompetencias(n) {
            const lista = [];
            const base = new Date();
            for (let i = 0; i < n; i++) {
                const d = new Date(base.getFullYear(), base.getMonth() + i, 1);
                lista.push(String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear());
            }
            return lista;
        }

        export function alternarNovoFornecedor(valor) {
            document.getElementById('desp-fornecedor-novo-nome').style.display = (valor === '__novo__') ? 'block' : 'none';
        }

        export function fecharPopupDespesa() {
            document.getElementById('modal-campo-contrato')?.remove();
            despesaEmEdicaoId = null;
            despesaOrigemFingerprintId = null;
        }

        export async function salvarDespesa() {
            const descricao = document.getElementById('desp-descricao').value.trim();
            const categoria = document.getElementById('desp-categoria').value;
            const valor = parseFloat(document.getElementById('desp-valor').value);
            const vencimento = document.getElementById('desp-vencimento').value;
            const competencia = document.getElementById('desp-competencia').value;
            const ativoId = document.getElementById('desp-ativo').value || null;
            const reembolsavel = document.getElementById('desp-reembolsavel').checked;
            const observacao = document.getElementById('desp-observacao').value.trim();
            const fornecedorSel = document.getElementById('desp-fornecedor').value;
            const novoFornecedorNome = document.getElementById('desp-fornecedor-novo-nome').value.trim();

            if (!descricao || !categoria || isNaN(valor) || !vencimento || !competencia) {
                mostrarToast('Preencha descrição, categoria, valor, vencimento e competência.', 'danger');
                return;
            }
            if (fornecedorSel === '__novo__' && !novoFornecedorNome) {
                mostrarToast('Informe o nome do novo fornecedor, ou selecione um existente.', 'danger');
                return;
            }

            mostrarCarregamentoGlobal('Salvando...');
            // v1.17.0 (Fase 1 do wrapper de escrita) — id capturado fora do
            // if/editar/senão/criar pra poder emitir emitirEscrita() depois
            // dos dois caminhos com o id certo (ver changelog do topo).
            let idParaEventoDespesa = despesaEmEdicaoId || null;
            try {
                let parteId = (fornecedorSel && fornecedorSel !== '__novo__') ? fornecedorSel : null;

                // Fornecedor novo: cria a `parte` PRIMEIRO (mesmo que
                // incompleta — só nome), nunca grava texto livre no
                // lançamento (pedido explícito do Nicola, 01/09/2026).
                if (fornecedorSel === '__novo__') {
                    const { data: novaParte, error: errParte } = await dbAuth.from('partes')
                        .insert({ cliente_id: CLIENTE_ID_SUPABASE, nome: novoFornecedorNome })
                        .select('id, nome').single();
                    if (errParte) throw errParte;
                    parteId = novaParte.id;
                    partesParaSelect = null; // invalida cache — próxima abertura já traz o novo
                }

                const payload = {
                    cliente_id: CLIENTE_ID_SUPABASE,
                    direcao: 'saida',
                    categoria, descricao, valor,
                    vencimento, competencia: competenciaParaData(competencia),
                    ativo_id: ativoId, parte_id: parteId,
                    reembolsavel, observacao: observacao || null
                };
                // v1.33.0 — conta escolhida (campo só aparece com mais de 1 conta; sem ele o banco põe a padrão)
                const selConta = document.getElementById('desp-conta');
                if (selConta && selConta.value) payload.conta_id = selConta.value;

                if (despesaEmEdicaoId) {
                    const { error } = await dbAuth.from('lancamentos').update(payload).eq('id', despesaEmEdicaoId);
                    if (error) throw error;
                } else {
                    // v2 — módulo Apoio ao Contador: se veio da conciliação
                    // (despesaOrigemFingerprintId setado por "Nova despesa"),
                    // marca origem_tipo='extrato' (mesma convenção de
                    // fn_extrato_criar_saida — já era um valor aceito no
                    // CHECK) e, depois de criar, vincula o fingerprint de
                    // volta — sem duplicar a lógica de criação, só fecha o
                    // laço com o que já existia.
                    const chkContab = document.getElementById('desp-contab'); // v1.34.0
                    const { data: criado, error } = await dbAuth.from('lancamentos').insert({
                        ...payload, status: 'previsto',
                        ...(chkContab ? { incluir_contabilidade: chkContab.checked } : {}),
                        origem_tipo: despesaOrigemFingerprintId ? 'extrato' : 'manual',
                        origem_id: despesaOrigemFingerprintId || null,
                    }).select('id').single();
                    if (error) throw error;
                    idParaEventoDespesa = criado.id;
                    if (despesaOrigemFingerprintId) {
                        const { error: erroVinculo } = await dbAuth.from('extrato_fingerprints').update({
                            status_conciliacao: 'conciliado', destino_tipo: 'lancamento', destino_id: criado.id, conciliado_em: new Date().toISOString(),
                        }).eq('id', despesaOrigemFingerprintId);
                        if (erroVinculo) devLog('ERRO_CONCILIACAO', 'Despesa criada, mas não consegui vincular o extrato: ' + erroVinculo.message);

                        // v1.6.0 — Etapa 8 (Parte B.5/R12 do plano): "Sempre
                        // fazer assim" — cria a regra do cliente
                        // (fn_conciliacao_sempre_assim) ANTES de zerar
                        // despesaOrigemFingerprintId. Não bloqueia o salvamento
                        // já feito se falhar (documento pode ter sumido, etc.).
                        const querSempreAssim = document.getElementById('desp-sempre-assim')?.checked;
                        if (querSempreAssim) {
                            try {
                                await dbAuth.rpc('fn_conciliacao_sempre_assim', {
                                    p_fingerprint_id: despesaOrigemFingerprintId, p_acao: 'criar_saida_categoria',
                                    p_acao_params: { categoria },
                                });
                            } catch (errMemoria) {
                                devLog('ERRO_CONCILIACAO', 'fn_conciliacao_sempre_assim falhou (despesa já salva, não bloqueia): ' + (errMemoria.message || errMemoria));
                            }
                        }

                        despesaOrigemFingerprintId = null;
                        if (document.getElementById('conc-uni-lista')) await carregarConciliacaoUnificada();
                    }
                }

                lancamentos = await carregarLancamentosSupabase();
                // v1.17.0 (Fase 1 do wrapper de escrita) — ver changelog do topo.
                emitirEscrita('despesa', { id: idParaEventoDespesa, acao: despesaEmEdicaoId ? 'editar' : 'criar' });
                esconderCarregamentoGlobal();
                mostrarToast('Despesa salva.', 'success');
                fecharPopupDespesa();
                renderSaidas();
                if (typeof renderSociosDistribricao === 'function') renderSociosDistribricao();
            } catch (err) {
                esconderCarregamentoGlobal();
                mostrarToast('Erro ao salvar despesa: ' + err.message, 'danger');
                logScreen('Erro ao salvar despesa: ' + err.message, true);
            }
        }

        export async function confirmarPagamentoDespesa(id) {
            const dataPgto = document.getElementById('desp-data-pgto').value;
            const formaPgto = document.getElementById('desp-forma-pgto').value || null;
            if (!dataPgto) { mostrarToast('Informe a data do pagamento.', 'danger'); return; }

            mostrarCarregamentoGlobal('Salvando...');
            try {
                const { error } = await dbAuth.from('lancamentos').update({
                    status: 'realizado', data_pagamento: dataPgto, forma_pagamento: formaPgto
                }).eq('id', id);
                if (error) throw error;
                lancamentos = await carregarLancamentosSupabase();
                // v1.17.0 (Fase 1 do wrapper de escrita) — ver changelog do topo.
                emitirEscrita('despesa', { id, acao: 'confirmar_pagamento' });
                esconderCarregamentoGlobal();
                mostrarToast('Pagamento confirmado.', 'success');
                fecharPopupDespesa();
                renderSaidas();
                if (typeof renderSociosDistribricao === 'function') renderSociosDistribricao();
            } catch (err) {
                esconderCarregamentoGlobal();
                mostrarToast('Erro ao confirmar pagamento: ' + err.message, 'danger');
                logScreen('Erro ao confirmar pagamento de despesa: ' + err.message, true);
            }
        }

        export async function estornarPagamentoDespesa(id) {
            if (!await rzConfirmar({ titulo: 'Estornar pagamento', impacto: 'A despesa volta para "previsto" e sai do caixa deste mês.', rotuloConfirmar: 'Estornar pagamento' })) return;
            mostrarCarregamentoGlobal('Salvando...');
            try {
                const { error } = await dbAuth.from('lancamentos').update({
                    status: 'previsto', data_pagamento: null, forma_pagamento: null
                }).eq('id', id);
                if (error) throw error;
                // v1.5.0 — Etapa 7/8: fn_lancamento_espelha_fingerprint (trigger,
                // Etapa 3) já resetou o fingerprint na linha UPDATE acima — só
                // atualiza a tela de conciliação, se estiver aberta.
                await atualizarConciliacaoSeAberta();
                lancamentos = await carregarLancamentosSupabase();
                // v1.17.0 (Fase 1 do wrapper de escrita) — ver changelog do topo.
                emitirEscrita('despesa', { id, acao: 'estornar_pagamento' });
                esconderCarregamentoGlobal();
                mostrarToast('Pagamento estornado.', 'success');
                fecharPopupDespesa();
                renderSaidas();
                if (typeof renderSociosDistribricao === 'function') renderSociosDistribricao();
            } catch (err) {
                esconderCarregamentoGlobal();
                mostrarToast('Erro ao estornar pagamento: ' + err.message, 'danger');
                logScreen('Erro ao estornar pagamento de despesa: ' + err.message, true);
            }
        }

        export async function excluirDespesa(id) {
            if (!await rzConfirmar({ titulo: 'Excluir despesa', impacto: 'A despesa some do Financeiro. Não dá para desfazer.', destrutivo: true, rotuloConfirmar: 'Excluir despesa' })) return;
            mostrarCarregamentoGlobal('Excluindo...');
            try {
                const { error } = await dbAuth.from('lancamentos').delete().eq('id', id);
                if (error) throw error;
                lancamentos = lancamentos.filter(d => d.id !== id);
                // v1.17.0 (Fase 1 do wrapper de escrita) — ver changelog do topo.
                emitirEscrita('despesa', { id, acao: 'excluir' });
                esconderCarregamentoGlobal();
                mostrarToast('Despesa excluída.', 'success');
                fecharPopupDespesa();
                renderSaidas();
                if (typeof renderSociosDistribricao === 'function') renderSociosDistribricao();
            } catch (err) {
                esconderCarregamentoGlobal();
                mostrarToast('Erro ao excluir despesa: ' + err.message, 'danger');
                logScreen('Erro ao excluir despesa: ' + err.message, true);
            }
        }

        // ===================================================================
        // v1.48.0 — RECORTE DA TELA FINANCEIRO PARA 1 RECEBIMENTO (pedido
        // explícito: "abrir uma nova aba com um recorte das funções da aba
        // financeiro daquele recebimento mantendo comportamento conforme
        // aquela aba"). Os cards abaixo são construídos com a MESMA
        // convenção de IDs que renderMensalidades() já usa
        // (banco-ID/data-ID/valor-ID/obs-ID/energia-ID/multa-ID/taxa-admin-
        // ID) — por isso liquidarMensalidade()/recalcularTotalBaixaExtra()/
        // alternarMenuBaixaExtra() funcionam aqui sem nenhuma alteração
        // nelas. Não é a mesma função de renderização (a de lá desenha
        // MUITOS itens agrupados por competência; esta desenha só 1), mas é
        // o mesmo comportamento de negócio, ponta a ponta.
        // ===================================================================
        let recebimentoDetalheAtualId = null;

        // v1.6.3 — Etapa 8, achado do Nicola: "Voltar" não sabia que podia
        // ter vindo da Conciliação — sempre caía no padrão (tab-mensal),
        // mesmo quando a tela foi aberta a partir de um item já conciliado.
        let recebimentoDetalheVeioDaConciliacao = false;

        export function abrirRecebimentoDetalhe(mensalidadeId, origemConciliacao) {
            if (origemConciliacao !== undefined) recebimentoDetalheVeioDaConciliacao = !!origemConciliacao;

            recebimentoDetalheAtualId = mensalidadeId;
            const men = mensalidades.find(m => m.id === mensalidadeId);
            if (!men) { rzToast('Recebimento não encontrado.', { tipo: 'danger' }); return; }

            const con = contratos.find(c => c.id === men.contratoId);
            if (!con) { rzToast('Contrato deste recebimento não encontrado.', { tipo: 'danger' }); return; }

            const imo = imoveis.find(i => i.id === con.imovelId);
            const localImovel = imo ? `${imo.empreendimento || ''} - ${imo.enderecoRua || ''}, ${imo.enderecoNum || ''}${imo.enderecoComp ? ' - ' + imo.enderecoComp : ''}` : '';

            const el = document.getElementById('recebimento-detalhe-conteudo');
            if (!el) return;

            if (men.status === 'Pago') {

                const log = men.envioLog ? `<p class="text-[11px] raiz-text-pine font-semibold"><svg data-lucide="mail" style="width:11px;height:11px;display:inline;vertical-align:-1px"></svg> Log: Notificado via ${men.envioLog.canal} (${men.envioLog.data})</p>` : `<p class="text-[11px] text-gray-400"><svg data-lucide="alert-triangle" style="width:11px;height:11px;display:inline;vertical-align:-1px"></svg> Envio pendente</p>`;
                const txtObs = men.observacao ? `<p class="text-[11px] text-amber-800 italic bg-amber-50 p-1 rounded mt-1"><svg data-lucide="file-text" style="width:11px;height:11px;display:inline;vertical-align:-1px"></svg> Nota interna: ${men.observacao}</p>` : '';
                const txtObsRecibo = men.observacaoRecibo ? `<p class="text-[11px] text-emerald-800 italic raiz-bg-sprout-light p-1 rounded mt-1"><svg data-lucide="receipt" style="width:11px;height:11px;display:inline;vertical-align:-1px"></svg> No recibo: ${men.observacaoRecibo}</p>` : '';
                const txtEnergia = men.valorEnergia > 0 ? `<p class="text-[11px] text-yellow-700 font-semibold"><svg data-lucide="zap" style="width:11px;height:11px;display:inline;vertical-align:-1px"></svg> Energia (controle interno, fora do recibo): R$ ${fmtBR(men.valorEnergia)}</p>` : '';

                el.innerHTML = `
                    <div class="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500">
                        <p class="text-sm font-bold text-gray-900">${con.locatario}</p>
                        <p class="text-xs text-gray-500 mt-0.5">Ref: ${men.referencia} | ${formatarMoedaBR(men.valorConfirmado)} (${men.banco} - ${formatarDataBR(men.dataPgto)})</p>
                        ${localImovel ? `<p class="text-xs text-gray-400 mt-1"><svg data-lucide="map-pin" style="width:12px;height:12px;display:inline;vertical-align:-1px"></svg> ${localImovel}</p>` : ''}
                        ${log}${txtObs}${txtObsRecibo}${txtEnergia}
                        <div class="flex gap-2 mt-3">
                            <button onclick="abrirModalOpcoesRecibo('${men.id}', '${con.id}')" class="flex-1 raiz-bg-pine text-white text-sm py-2.5 rounded-lg font-bold shadow">📄 Recibo</button>
                            <button onclick="estornarMensalidadeERefletirDetalhe('${men.id}')" class="flex-1 bg-red-50 text-red-600 border border-red-200 text-sm py-2.5 rounded-lg font-bold">Estornar</button>
                        </div>
                    </div>`;

            } else {

                const partesRef = (men.referencia || '').split('/');
                const diaVenc = con.vencimentoDia || 15;
                const dataPadraoVenc = partesRef.length === 2 ? `${partesRef[1]}-${partesRef[0]}-${diaVenc < 10 ? '0' + diaVenc : diaVenc}` : '';

                // CORRIGIDO (v1.63.0 — pedido explícito, 25/08/2026): antes
                // todo lançamento não pago virava "Atrasado" aqui, mesmo um
                // lançamento futuro (vencimento ainda não chegou). Agora só
                // usa o badge/borda de atraso quando mensalidadeEmAtraso()
                // confirma que o vencimento já passou.
                const estaAtrasado = mensalidadeEmAtraso(men);
                const corBorda = estaAtrasado ? 'border-amber-500' : 'border-slate-300';
                const badgeStatus = estaAtrasado
                    ? `<span class="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded font-black">Atrasado</span>`
                    : `<span class="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded font-black">A vencer</span>`;

                el.innerHTML = `
                    <div class="bg-white p-4 rounded-xl shadow-sm border-l-4 ${corBorda} space-y-2">
                        <div class="flex justify-between items-start">
                            <div>
                                <p class="text-sm font-bold text-slate-900">${con.locatario}</p>
                                <p class="text-xs text-gray-500">Ref: ${men.referencia}</p>
                                ${localImovel ? `<p class="text-xs text-gray-400">📍 ${localImovel}</p>` : ''}
                            </div>
                            <div class="flex items-center gap-1">
                                ${badgeStatus}
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <label class="block text-[11px] font-bold text-gray-500">Forma de Recebimento</label>
                                <select id="banco-${men.id}" class="w-full border p-1.5 rounded bg-gray-50"><option value="PIX">PIX</option><option value="Boleto">Boleto</option><option value="Depósito">Depósito</option></select>
                            </div>
                            <div>
                                <label class="block text-[11px] font-bold text-gray-500">Dia Recebimento</label>
                                <input type="date" id="data-${men.id}" value="${dataPadraoVenc}" class="w-full border p-1 rounded bg-gray-50 text-center">
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <label class="block text-[11px] font-bold text-gray-500">Líquido (R$)</label>
                                <div class="flex items-center gap-1">
                                    <input type="number" id="valor-${men.id}" value="${men.valorConfirmado || 0}" oninput="recalcularTotalBaixaExtra('${men.id}')" class="w-full border p-1.5 rounded bg-gray-50 font-bold raiz-text-pine">
                                    <button type="button" id="btn-baixa-extra-${men.id}" onclick="alternarMenuBaixaExtra('${men.id}')" title="Energia, multa e taxa" class="raiz-btn-toggle-mini flex-none text-[10px] bg-slate-100 border border-slate-300 rounded-full w-7 h-7 flex items-center justify-center font-bold text-slate-600"><svg data-lucide="more-horizontal" style="width:13px;height:13px"></svg></button>
                                </div>
                            </div>
                            <div>
                                <label class="block text-[11px] font-bold text-gray-500">Observações Internas</label>
                                <input type="text" id="obs-${men.id}" placeholder="Ex: Desconto" class="w-full border p-1.5 rounded bg-gray-50">
                            </div>
                        </div>
                        <div id="menu-baixa-extra-${men.id}" class="hidden bg-slate-50 border border-slate-200 rounded-lg p-2 space-y-1.5">
                            ${imo && imo.energiaRumo === 'Sim' ? `
                            <div>
                                <label class="block text-[11px] font-bold text-yellow-700"><svg data-lucide="zap" style="width:12px;height:12px;display:inline;vertical-align:-1px"></svg> Energia (controle interno)</label>
                                <input type="number" id="energia-${men.id}" value="0" class="w-full border border-yellow-300 p-1 rounded bg-yellow-50 font-bold text-yellow-800 text-sm">
                            </div>` : ''}
                            <div>
                                <label class="block text-[11px] font-bold text-red-700"><svg data-lucide="alert-triangle" style="width:12px;height:12px;display:inline;vertical-align:-1px"></svg> Multa (soma ao líquido)</label>
                                <input type="number" id="multa-${men.id}" value="0" data-multa-anterior="0" oninput="recalcularTotalBaixaExtra('${men.id}')" class="w-full border border-red-300 p-1 rounded bg-red-50 font-bold text-red-800 text-sm">
                            </div>
                            <div>
                                <label class="block text-[11px] font-bold text-slate-700">🏢 Taxa da Administradora</label>
                                <input type="number" id="taxa-admin-${men.id}" value="${men.taxaAdmSugerida || 0}" oninput="recalcularTotalBaixaExtra('${men.id}')" class="w-full border border-slate-300 p-1 rounded bg-white font-bold text-slate-700 text-sm">
                            </div>
                            <div class="grid grid-cols-2 gap-2">
                                <div>
                                    <label class="block text-[11px] font-bold text-slate-500">IPTU (informativo)</label>
                                    <input type="number" id="iptu-${men.id}" value="${men.valorIptu || 0}" class="w-full border border-slate-300 p-1 rounded bg-white text-slate-700 text-sm">
                                </div>
                                <div>
                                    <label class="block text-[11px] font-bold text-slate-500">Condomínio (informativo)</label>
                                    <input type="number" id="condominio-${men.id}" value="${men.valorCondominio || 0}" class="w-full border border-slate-300 p-1 rounded bg-white text-slate-700 text-sm">
                                </div>
                            </div>
                            <div class="pt-1.5 border-t border-slate-300 text-xs text-slate-600">
                                <div class="flex justify-between"><span>Multa</span><span id="resumo-multa-${men.id}">R$ 0,00</span></div>
                                <div class="flex justify-between"><span>Taxa Adm.</span><span id="resumo-taxa-${men.id}">R$ 0,00</span></div>
                                <div class="flex justify-between"><span>Líquido</span><span id="resumo-liquido-${men.id}">R$ 0,00</span></div>
                                <div class="flex justify-between font-black text-slate-800 pt-1 border-t border-slate-200 mt-1"><span>Total</span><span id="resumo-total-${men.id}">R$ 0,00</span></div>
                            </div>
                        </div>
                        <!-- CORRIGIDO (v1.52.0 — pedido explícito): ícone de
                             lixeira isolado removido; "Excluir" virou botão
                             de texto ao lado de "Dar Baixa", mesmo padrão de
                             par de botões usado nos itens já baixados
                             (Recibo/Estornar). -->
                        <div class="flex gap-2">
                            <button onclick="liquidarMensalidadeERefletirDetalhe('${men.id}')" class="flex-1 raiz-bg-pine text-white text-sm py-2 rounded font-bold shadow">Dar Baixa</button>
                            <button onclick="excluirLancamentoMensal('${men.id}')" class="flex-1 bg-red-50 text-red-600 border border-red-200 text-sm py-2 rounded font-bold">Excluir</button>
                        </div>
                    </div>`;

            }

            switchTab('tab-recebimento-detalhe');
            if (typeof lucide !== 'undefined') lucide.createIcons();

        }

        export function voltarDoRecebimentoDetalhe() {
            recebimentoDetalheAtualId = null;
            if (recebimentoDetalheVeioDaConciliacao) { recebimentoDetalheVeioDaConciliacao = false; switchTab('tab-conciliacao'); return; }
            if (fichaImovelAtualId) { abrirFichaImovel(fichaImovelAtualId); return; }
            switchTab('tab-mensal');
        }

        // Wrappers finos só pra redesenhar ESTE recorte depois da ação —
        // liquidarMensalidade()/estornarMensalidade() em si não mudaram
        // nada (continuam as mesmas usadas pela aba Financeiro inteira).
        export async function liquidarMensalidadeERefletirDetalhe(menId) {
            await liquidarMensalidade(menId);
            if (recebimentoDetalheAtualId === menId) abrirRecebimentoDetalhe(menId);
        }

        export function estornarMensalidadeERefletirDetalhe(menId) {
            estornarMensalidade(menId);
            if (recebimentoDetalheAtualId === menId) setTimeout(() => abrirRecebimentoDetalhe(menId), 50);
        }

        // v1.177.0 — Etapa 7 da conciliação (Parte G do plano): gerarMensalidades()
        // ("Gerar Mês") saiu — o cron (diario-eventos) já gera os recebimentos dos
        // próximos 90 dias sozinho pra todo contrato ativo com valor cadastrado, e
        // ativar/renovar contrato chamam o mesmo horizonte na hora
        // (fn_gerar_mensalidades_horizonte, contratos.js). mensal.gerar continua
        // no catálogo de funcionalidades como argumento comercial (D16 do plano).

        // Menu extra de baixa (energia/multa/taxa) — abre um painel ao lado do
        // campo Líquido. Multa soma automaticamente ao líquido (idempotente:
        // guarda a multa anterior num data-attribute para não somar 2x se o
        // usuário editar o valor da multa depois de já ter somado uma vez).
        export function alternarMenuBaixaExtra(menId) {
            const menu = document.getElementById('menu-baixa-extra-' + menId);
            const btn = document.getElementById('btn-baixa-extra-' + menId);
            if (!menu) return;
            menu.classList.toggle('hidden');
            const aberto = !menu.classList.contains('hidden');
            if (btn) btn.classList.toggle('ativo', aberto);
            if (aberto) recalcularTotalBaixaExtra(menId);
        }

        export function recalcularTotalBaixaExtra(menId) {
            const inputLiquido = document.getElementById('valor-' + menId);
            const inputMulta = document.getElementById('multa-' + menId);
            const inputTaxa = document.getElementById('taxa-admin-' + menId);
            if (!inputLiquido) return;

            if (inputMulta) {
                const multaAtual = parseFloat(inputMulta.value) || 0;
                const multaAnterior = parseFloat(inputMulta.dataset.multaAnterior || '0') || 0;
                const delta = multaAtual - multaAnterior;
                if (delta !== 0) {
                    const liquidoAtual = parseFloat(inputLiquido.value) || 0;
                    inputLiquido.value = (liquidoAtual + delta).toFixed(2);
                    inputMulta.dataset.multaAnterior = String(multaAtual);
                }
            }

            const liquido = parseFloat(inputLiquido.value) || 0;
            const multa = inputMulta ? (parseFloat(inputMulta.value) || 0) : 0;
            const taxa = inputTaxa ? (parseFloat(inputTaxa.value) || 0) : 0;
            const total = liquido + multa + taxa;

            const fmt = function(v) { return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
            const resumoMulta = document.getElementById('resumo-multa-' + menId);
            const resumoTaxa = document.getElementById('resumo-taxa-' + menId);
            const resumoLiquido = document.getElementById('resumo-liquido-' + menId);
            const resumoTotal = document.getElementById('resumo-total-' + menId);
            if (resumoMulta) resumoMulta.textContent = fmt(multa);
            if (resumoTaxa) resumoTaxa.textContent = fmt(taxa);
            if (resumoLiquido) resumoLiquido.textContent = fmt(liquido);
            if (resumoTotal) resumoTotal.textContent = fmt(total);
        }

        // v1.24.0 (demanda d92a6dfc) — recálculo entre os 3 campos do bloco
        // "Valores" do Dar baixa (bruto/taxa/líquido). Mexeu em bruto ou
        // taxa: o líquido é sempre bruto menos taxa (é assim que a geração
        // mensal já calcula). Mexeu direto no líquido (ex.: o valor que
        // realmente caiu na conta veio diferente do esperado): o bruto fica
        // fixo — é o aluguel do contrato — e quem se ajusta é a taxa.
        // Encadeia com recalcularTotalBaixaExtra pro delta de multa
        // continuar valendo por cima do líquido recém-calculado.
        export function recalcularValoresBaixaBruto(menId, origem) {
            const inputBruto = document.getElementById('bruto-' + menId);
            const inputTaxa = document.getElementById('taxa-' + menId);
            const inputLiquido = document.getElementById('valor-' + menId);
            if (!inputBruto || !inputTaxa || !inputLiquido) return;
            const bruto = parseFloat(inputBruto.value) || 0;
            const taxa = parseFloat(inputTaxa.value) || 0;
            const liquido = parseFloat(inputLiquido.value) || 0;
            if (origem === 'liquido') {
                inputTaxa.value = Math.max(0, bruto - liquido).toFixed(2);
            } else {
                inputLiquido.value = Math.max(0, bruto - taxa).toFixed(2);
            }
            if (typeof recalcularTotalBaixaExtra === 'function') recalcularTotalBaixaExtra(menId);
        }

        export async function liquidarMensalidade(menId) {

            const banco = document.getElementById(`banco-${menId}`).value;

            const dataManual = document.getElementById(`data-${menId}`).value;

            const valorManual = parseFloat(document.getElementById(`valor-${menId}`).value);

            let obsManual = document.getElementById(`obs-${menId}`).value.trim();

            const campoEnergia = document.getElementById(`energia-${menId}`);

            const valorEnergiaManual = campoEnergia ? (parseFloat(campoEnergia.value) || 0) : 0;

            // CORRIGIDO (bug real — valores de multa lançados no menu ⋯
            // nunca eram lidos nem salvos em lugar nenhum; ao estornar, sumiam
            // para sempre). Não existe coluna própria pra multa, então —
            // igual já acontecia com energia — o valor vira um resumo dentro
            // da observação DO RECIBO (observacaoRecibo, que sai impressa no
            // "Vale ressaltar que..."), separada da observação interna
            // (observacao, que nunca aparece pro locatário).
            // v1.24.0 — a "Taxa Adm." SAIU daqui (virou o campo estruturado
            // bruto-/taxa-, que grava em valor_bruto/valor_taxa_adm — ver
            // abaixo — em vez de ficar só como texto solto na observação).
            const campoMulta = document.getElementById(`multa-${menId}`);
            const valorMulta = campoMulta ? (parseFloat(campoMulta.value) || 0) : 0;
            const campoIptu = document.getElementById(`iptu-${menId}`);
            const campoCondominio = document.getElementById(`condominio-${menId}`);
            const valorIptuManual = campoIptu ? (parseFloat(campoIptu.value) || 0) : 0;
            const valorCondominioManual = campoCondominio ? (parseFloat(campoCondominio.value) || 0) : 0;

            // v1.24.0 (demanda d92a6dfc) — bruto/taxa do bloco "Valores";
            // quando o form não tiver esses campos (chamador antigo/teste),
            // não mexe no que já estava gravado.
            const campoBrutoNovo = document.getElementById(`bruto-${menId}`);
            const campoTaxaNova = document.getElementById(`taxa-${menId}`);
            const valorBrutoNovo = campoBrutoNovo ? (parseFloat(campoBrutoNovo.value) || 0) : undefined;
            const valorTaxaNova = campoTaxaNova ? (parseFloat(campoTaxaNova.value) || 0) : undefined;

            const resumoExtras = [];
            if (valorEnergiaManual > 0) resumoExtras.push(`Energia: R$ ${fmtBR(valorEnergiaManual)}`);
            if (valorMulta > 0) resumoExtras.push(`Multa: R$ ${fmtBR(valorMulta)}`);
            if (resumoExtras.length > 0) {
                obsManual = (obsManual ? obsManual + ' | ' : '') + resumoExtras.join(' | ');
            }

            if (!dataManual || isNaN(valorManual)) { rzToast('Preencha data e valor.', { tipo: 'danger' }); return false; }

            const idx = mensalidades.findIndex(m => m.id === menId);

            // CORRIGIDO (v1.39.4) — antes, se o id não fosse encontrado
            // (linha renderizada com id antigo — ver comentário em saveAll),
            // essa função simplesmente terminava aqui sem avisar nada.
            // Agora autocorrige: redesenha a lista com os ids atuais e avisa.
            if (idx === -1) {
                mostrarToast('Essa linha estava desatualizada — lista atualizada, tenta de novo.', 'danger');
                renderMensalidades();
                return;
            }

            mensalidades[idx].status = 'Pago';
            mensalidades[idx].banco = banco;
            mensalidades[idx].dataPgto = dataManual.split('-').reverse().join('/');
            mensalidades[idx].valorConfirmado = valorManual;
            mensalidades[idx].observacaoRecibo = obsManual;
            mensalidades[idx].valorEnergia = valorEnergiaManual;
            mensalidades[idx].valorIptu = valorIptuManual;
            mensalidades[idx].valorCondominio = valorCondominioManual;
            // v1.29.0 (RF-05, d11a092e) — multa/juros também na coluna própria
            // (mensalidades.multa_encargos); o texto do recibo continua igual.
            mensalidades[idx].multaEncargos = valorMulta > 0 ? valorMulta : null;
            // v1.24.0 (demanda d92a6dfc) — grava bruto/taxa junto com o
            // líquido; marca como não-mais-estimado (o usuário confirmou os
            // 3 valores na hora da baixa).
            if (valorBrutoNovo !== undefined) {
                mensalidades[idx].valorBruto = valorBrutoNovo;
                mensalidades[idx].valorTaxaAdm = valorTaxaNova;
                mensalidades[idx].valorBrutoEstimado = false;
            }

            registrarLog('mensal.baixar', { mensalidadeId: menId, referencia: mensalidades[idx].referencia, valor: valorManual, banco: banco, via: 'manual' });

            // CORRIGIDO (v1.39.4) — antes chamava saveAll(true, ..., ['mensalidades']),
            // que resincroniza a lista INTEIRA de mensalidades (todo o
            // histórico da empresa), uma linha de cada vez, sequencial. Numa
            // empresa com bastante histórico isso demorava vários segundos
            // pra confirmar 1 baixa. Agora sincroniza só a linha alterada.
            mostrarCarregamentoGlobal("Salvando na nuvem...");
            try {
                await sincronizarMensalidadeSupabase(mensalidades[idx]);
                localStorage.setItem(chaveLocal('mensalidades'), JSON.stringify(mensalidades));
                // v1.17.0 (Fase 1 do wrapper de escrita) — ver changelog do topo.
                emitirEscrita('mensalidade', { id: menId, acao: 'baixar' });
                esconderCarregamentoGlobal();
                mostrarToast("Pagamento registrado com sucesso!", 'success');
                renderMensalidades();
                renderInadimplencia();
                renderSociosDistribricao();
                renderRelatorios();
            } catch (err) {
                esconderCarregamentoGlobal();
                rzToast('Não consegui salvar o pagamento: ' + err.message, { tipo: 'danger' });
                logScreen('Erro ao dar baixa (mensalidade ' + menId + '): ' + err.message, true);
            }

        }

        export function borderEstornoCheck(menId) {

             // Função mantida de backup caso necessário

        }

        export async function estornarMensalidade(menId) {

            if (!await rzConfirmar({ titulo: 'Estornar recebimento', impacto: 'O recebimento volta para "a receber" e sai do caixa deste mês.', rotuloConfirmar: 'Estornar recebimento' })) return;

            const idx = mensalidades.findIndex(m => m.id === menId);

            if(idx !== -1) {

                mensalidades[idx].status = 'Inadimplente';

                mensalidades[idx].banco = '-';

                mensalidades[idx].chaveTransacaoOrigem = '';
                mensalidades[idx].multaEncargos = null; // v1.29.0 (RF-05) — estorno zera a multa da baixa

                const con = contratos.find(c => c.id === mensalidades[idx].contratoId);

                const partesRef = mensalidades[idx].referencia.split('/');

                const diaVenc = con ? (con.vencimentoDia || 15) : 15;

                const diaPgoString = diaVenc < 10 ? '0' + diaVenc : diaVenc;

                mensalidades[idx].dataPgto = `${diaPgoString}/${partesRef[0]}/${partesRef[1]}`;

                registrarLog('mensal.estornar', { mensalidadeId: menId, referencia: mensalidades[idx].referencia });

                // v1.5.0 — Etapa 7/8: fn_mensalidade_espelha_fingerprint (trigger,
                // Etapa 3) reseta o fingerprint sozinho quando saveAll grava o status
                // (encadeado com .then — saveAll não é aguardada aqui, mesmo padrão
                // já usado nesta função antes desta mudança).
                // v1.17.0 (Fase 1 do wrapper de escrita) — saveAll aqui é
                // fire-and-forget (já era antes desta mudança); emite só
                // depois de confirmado (dentro do .then), ver changelog do topo.
                saveAll(true, "Pagamento estornado.", ['mensalidades']).then(() => {
                    atualizarConciliacaoSeAberta();
                    emitirEscrita('mensalidade', { id: menId, acao: 'estornar' });
                });

            }

        }

        export function normalizarNomeParaComparacao(nome) {

            return (nome || '').toUpperCase()

                .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // remove acentos

                .replace(/[.\-\/]/g, ' ')

                .replace(/\b(LTDA|SA|S A|ME|EIRELI|EPP|CONSULTORIA|IMOBILIARIA|IMOBILIARIOS|IMOVEIS|PARTICIPACOES|EMPREENDIMENTOS|SERVICOS|NEGOCIOS|CORRETAGEM|GESTAO|COMERCIO|CENTRO)\b/g, '')

                .replace(/\s+/g, ' ')

                .trim();

        }

        export function nomesParecem(a, b) {

            const na = normalizarNomeParaComparacao(a);

            const nb = normalizarNomeParaComparacao(b);

            if (!na || !nb) return false;

            if (na.includes(nb) || nb.includes(na)) return true;

            const palavrasA = na.split(' ').filter(p => p.length >= 3);

            const palavrasB = nb.split(' ').filter(p => p.length >= 3);

            if (palavrasA.length === 0 || palavrasB.length === 0) return false;

            const comuns = palavrasA.filter(p => palavrasB.includes(p));

            return comuns.length >= 1 && (comuns.length / Math.min(palavrasA.length, palavrasB.length)) >= 0.5;

        }

        export function nomesIguaisSocio(a, b) {

            const na = normalizarNomeParaComparacao(a);

            const nb = normalizarNomeParaComparacao(b);

            if (!na || !nb) return false;

            return na.includes(nb) || nb.includes(na);

        }

        // NOVO (v1.66.2) — arquivo de PDF/foto de extrato agora vai pra
        // extração via IA (Edge Function extrato-extrair-transacoes,
        // reaproveita a MESMA extrairTransacoesExtratoIA que o bot já usa
        // desde a v2.23 — não é um parser novo, é a mesma extração
        // chamada por um caminho diferente). xlsx/xls continua 100% local
        // via SheetJS, sem gastar IA — decisão do Nicola: já sabemos que é
        // um extrato (o botão que a pessoa clicou já é essa intenção),
        // então não faz sentido gastar IA em classificação nenhuma, só na
        // leitura de tabela que realmente precisa (PDF não tem célula).
        export function arquivoEhExtratoImagemOuPdf(file) {
            const nome = (file.name || '').toLowerCase();
            return file.type === 'application/pdf' || file.type.startsWith('image/') ||
                nome.endsWith('.pdf') || nome.endsWith('.jpg') || nome.endsWith('.jpeg') || nome.endsWith('.png');
        }

        export async function processarExtratoViaIA(file, inputElement) {

            mostrarCarregamentoGlobal("Lendo extrato bancário com IA...");

            try {

                const base64 = await arquivoParaBase64(file);

                const { data, error } = await dbAuth.functions.invoke('extrato-extrair-transacoes', {
                    body: { arquivo_base64: base64, mime_type: file.type || 'application/pdf', cliente_id: CLIENTE_ID_SUPABASE },
                });

                if (error) throw new Error(error.message || 'Falha ao chamar a extração por IA.');

                if (!data?.extraido) {
                    esconderCarregamentoGlobal();
                    rzToast(data?.motivo || 'Não consegui ler as transações desse arquivo.', { tipo: 'danger' });
                    inputElement.value = '';
                    return;
                }

                // v1.6.0 — Etapa 8 (achado A3/A4, "a alavanca nº 1"): o
                // extrator (_shared_extrato 1.4) já separa historico/
                // razaoSocial/documento — antes esta função ainda usava só
                // t.descricao pra tudo e documento ficava sempre '', então
                // nem app nem a conciliação conseguiam achar contrato por
                // CPF/CNPJ em PDF/foto, só por nome (tolerância maior).
                const transacoes = (data.resultado.transacoes || []).map(t => ({
                    dataISO: t.data,
                    valor: t.tipo === 'debito' ? -Math.abs(t.valor) : Math.abs(t.valor),
                    descricao: (t.historico || t.descricao || '').toUpperCase(),
                    razaoSocial: t.razaoSocial || t.descricao || '',
                    documento: t.documento || '',
                }));

                esconderCarregamentoGlobal();

                if (transacoes.length === 0) {
                    rzToast('Nenhum lançamento válido encontrado nesse arquivo.', { tipo: 'danger' });
                    inputElement.value = '';
                    return;
                }

                // v1.6.0 — banco detectado pela IA agora É gravado (achado
                // A5), não só mostrado no toast. 'Banco (PDF/foto)' quando a
                // IA não identifica — nunca mais 'Itaú' chutado.
                const bancoDetectado = data.resultado.banco || 'Banco (PDF/foto)';
                const tituloResumo = data.resultado.banco
                    ? `📥 Extrato do ${data.resultado.banco} lido via IA!`
                    : '📥 Extrato lido via IA!';

                await conciliarTransacoes(transacoes, tituloResumo, bancoDetectado);

            } catch (err) {

                esconderCarregamentoGlobal();

                rzToast('Não consegui ler o arquivo: ' + err.message, { tipo: 'danger' });

                devLog("ERRO_EXTRATO_IA", `Falha ao processar extrato via IA: ${err.message}`);

            }

            inputElement.value = '';

        }

        export async function processarExtratoImportado(inputElement) {

            const file = inputElement.files[0];

            if (!file) return;

            if (arquivoEhExtratoImagemOuPdf(file)) {
                await processarExtratoViaIA(file, inputElement);
                return;
            }

            mostrarCarregamentoGlobal("Lendo extrato bancário...");

            try {

                const buffer = await file.arrayBuffer();

                const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });

                const nomeAba = workbook.SheetNames.includes('Lançamentos') ? 'Lançamentos' : workbook.SheetNames[0];

                const linhas = XLSX.utils.sheet_to_json(workbook.Sheets[nomeAba], { header: 1, raw: true });

                // Localiza a linha de cabeçalho de verdade (a que contém "Data" e "Lançamento"),

                // já que os primeiros registros do extrato são metadados (nome, agência, conta).

                let idxCabecalho = -1;

                for (let i = 0; i < linhas.length; i++) {

                    const linha = (linhas[i] || []).map(c => String(c || '').toLowerCase());

                    if (linha.some(c => c.includes('data')) && linha.some(c => c.includes('lançamento') || c.includes('lancamento'))) {

                        idxCabecalho = i;

                        break;

                    }

                }

                if (idxCabecalho === -1) {

                    esconderCarregamentoGlobal();

                    rzAviso({ titulo: 'Formato não reconhecido', linhas: ['Não consegui identificar o formato do extrato.', 'Confira se é o extrato detalhado do Itaú (.xlsx) e tente de novo — ou envie o PDF ou uma foto, que a Raiz IA lê.'] });

                    return;

                }

                const transacoes = [];

                for (let i = idxCabecalho + 1; i < linhas.length; i++) {

                    const linha = linhas[i] || [];

                    const [dataRaw, lancamento, razaoSocial, documento, valorRaw] = linha;

                    if (!dataRaw || valorRaw === undefined || valorRaw === null || valorRaw === '') continue;

                    const descricao = String(lancamento || '').toUpperCase();

                    if (descricao.includes('SALDO')) continue; // linha de saldo do dia, não é lançamento real

                    const valor = parseFloat(valorRaw);

                    if (isNaN(valor) || valor === 0) continue;

                    const dataISO = converterDataExcelParaISO(dataRaw);

                    if (!dataISO) continue;

                    transacoes.push({ dataISO, descricao, razaoSocial: String(razaoSocial || '').trim(), documento: String(documento || '').trim(), valor });

                }

                esconderCarregamentoGlobal();

                if (transacoes.length === 0) {

                    rzToast('Nenhum lançamento válido encontrado nesse arquivo.', { tipo: 'danger' });

                    return;

                }

                await conciliarTransacoes(transacoes);

            } catch (err) {

                esconderCarregamentoGlobal();

                rzToast('Não consegui ler o arquivo: ' + err.message, { tipo: 'danger' });

                devLog("ERRO_EXTRATO", `Falha ao processar extrato: ${err.message}`);

            }

            inputElement.value = '';

        }

        // v1.6.0 — Etapa 8 do plano (achado A5): banco_origem gravado sempre
        // como 'Itaú' fixo, mesmo quando a IA já detecta o banco real do PDF/
        // foto (resultado.banco, já mostrado no toast mas nunca persistido).
        // bancoOrigem agora é parâmetro — .xlsx (Itaú, formato próprio) usa o
        // default; IA passa o banco detectado (ou 'Banco (PDF/foto)' se a IA
        // não identificar).
        export async function conciliarTransacoes(transacoes, tituloResumo, bancoOrigem = 'Itaú') {

            // IMPORTANTE: os "fingerprints" continuam sendo registrados para fins de

            // auditoria (histórico de tudo que já foi importado), mas NÃO bloqueiam

            // mais uma nova tentativa de conciliação. Motivo: um item conciliado

            // (automática ou manualmente) pode ser estornado depois — e se o mesmo

            // extrato for reimportado, a conciliação precisa conseguir tentar de novo.

            //

            // v3_15 (12/09/2026) — achado do Nicola: pendencias_extrato foi
            // dropada de verdade (não só parou de ser usada) — chavesJaPendentes
            // e a checagem de "pendência já existe" (que dependiam dela, direto
            // ou via fn_classificar_pagamento_contrato) saíram junto.
            const chavesJaPagas = new Set(mensalidades.filter(m => m.status === 'Pago' && m.chaveTransacaoOrigem).map(m => m.chaveTransacaoOrigem));

            const chavesJaRepassadas = new Set(repasses.filter(r => r.chaveTransacaoOrigem).map(r => r.chaveTransacaoOrigem));

            const novosFingerprints = [];

            // NOVO (v1.66.9, 28/08/2026) — rastreadores dos itens realmente
            // tocados nesta importação, pra saveAll() no final sincronizar só
            // isso (itensAlterados) em vez da carteira inteira — mesmo
            // princípio já aplicado nos botões pontuais de pendência
            // (v1.66.7), agora estendido pro caminho de importação em lote.
            const idsMensalidadesAlteradas = [];

            let qtdConciliados = 0, qtdRepasses = 0, qtdPendencias = 0, qtdIgnorados = 0, qtdJaProcessadas = 0;

            // CORREÇÃO: antes de tentar conciliar qualquer coisa, garante que as

            // mensalidades das competências realmente cobertas pelo extrato já

            // existem. Sem isso, um pagamento de abril podia acabar batendo (por

            // coincidência de valor) numa mensalidade de agosto que já existia,

            // só porque a de abril ainda nem tinha sido gerada. Gera tanto o mês da

            // transação quanto o mês anterior, pois cobre tanto contratos com

            // aluguel antecipado quanto em atraso.

            const competenciasDoExtrato = new Set();

            transacoes.forEach(t => {

                const [ano, mes] = t.dataISO.split('-');

                const ref = `${mes}/${ano}`;

                competenciasDoExtrato.add(ref);

                competenciasDoExtrato.add(mesAnteriorRef(ref));

            });

            // v1.5.0 — Etapa 7 da conciliação (Parte G do plano): sai o gerador
            // JS local (gerarMensalidadesParaCompetencia/construirLinhaDoTempoValor/
            // valorVigenteEm, index.html) — chama a MESMA RPC de banco que "Gerar
            // mês" e o cron (diario-eventos) já usam, fonte única em todos os
            // caminhos. A RPC grava direto no banco (não passa mais pelo array em
            // memória + saveAll) — recarrega antes da conciliação usar a lista logo
            // abaixo, senão as mensalidades recém-geradas não apareceriam como
            // candidatas no laço de match.
            for (const ref of competenciasDoExtrato) {
                const [mesRef, anoRef] = ref.split('/');
                const referenciaISO = `${anoRef}-${String(mesRef).padStart(2, '0')}-01`;
                try {
                    await dbAuth.rpc('fn_gerar_mensalidades_competencia', { p_cliente_id: CLIENTE_ID_SUPABASE, p_referencia: referenciaISO });
                } catch (err) {
                    devLog('ERRO_CONCILIACAO', `Falha ao gerar mensalidades de ${ref}: ${err.message}`);
                }
            }
            mensalidades = await carregarMensalidadesSupabase();

            // NOVO (v1.66.2, 27/08/2026) — virou for...of (era forEach) porque
            // o bloco de crédito agora faz 1 chamada assíncrona à RPC
            // compartilhada por transação (fn_classificar_pagamento_contrato).
            // ATENÇÃO se mexer aqui de novo: todo `return;` de dentro de um
            // forEach vira `continue;` num for...of — um `return` aqui dentro
            // sairia da função INTEIRA na primeira transação, não só pulando
            // pra próxima (armadilha clássica dessa conversão).
            for (const t of transacoes) {

                const chave = `${t.dataISO}|${t.valor.toFixed(2)}|${t.razaoSocial.toUpperCase()}`;

                // v1.2 — mantém a referência pra poder marcar o resultado da
                // conciliação (match/pendência/ignorado) no próprio objeto,
                // sem precisar re-buscar por chave depois.
                const fpAtual = { chave, data: t.dataISO, valor: t.valor, razaoSocial: t.razaoSocial, documento: t.documento, banco: bancoOrigem, importadoEm: new Date().toISOString() };
                novosFingerprints.push(fpAtual);

                const [ano, mes] = t.dataISO.split('-');

                const referenciaDoMes = `${mes}/${ano}`;

                const dataBR = formatarDataBR(t.dataISO);

                if (t.valor > 0) {

                    // ENTRADA — tenta conciliar com uma mensalidade pendente

                    if (t.descricao.includes('RENDIMENTO')) { qtdIgnorados++; continue; }

                    const nomeSocioEntrada = obterSociosConhecidos().find(s => nomesIguaisSocio(s, t.razaoSocial));

                    if (nomeSocioEntrada) { qtdIgnorados++; continue; } // entrada de sócio não é aluguel

                    // Essa transação já pagou uma mensalidade que continua paga —
                    // checagem rápida local (evita até tentar achar contrato de novo);
                    // complementar à RPC abaixo, mesmo espírito de
                    // conciliarRecebimento() no bot.

                    if (chavesJaPagas.has(chave)) { qtdJaProcessadas++; continue; }

                    // Ordem de tentativa para achar o contrato: 1º pelo nome do

                    // locatário, 2º pelo documento (CPF/CNPJ) do extrato.

                    const documentoLimpo = (t.documento || '').replace(/\D/g, '');

                    let contratoCandidato = contratos.find(c => nomesParecem(c.locatario, t.razaoSocial));

                    if (!contratoCandidato && documentoLimpo) {

                        contratoCandidato = contratos.find(c => (c.cpf || '').replace(/\D/g, '') === documentoLimpo);

                    }

                    if (!contratoCandidato) {

                        // v3_15 (12/09/2026) — achado do Nicola: checagem
                        // contra pendencias_extrato (chavesJaPendentes) saiu
                        // — a tabela foi dropada. O índice único de
                        // extrato_fingerprints (data+valor, corrigido nesta
                        // mesma sessão pra tolerar variação de texto da IA)
                        // já é a proteção real contra reimportação duplicada.

                        // v1.6.1 — Etapa 8, resto (retirada do painel de
                        // Pendências legado, achado do Nicola testando no
                        // celular): sem contrato identificado, a linha só
                        // fica 'pendente' em extrato_fingerprints (já
                        // gravado acima) — a tela de Conciliação mostra e
                        // "Buscar manualmente" resolve. Não duplica mais em
                        // pendencias_extrato.
                        qtdPendencias++;

                        continue;

                    }

                    // NOVO (v1.66.2, 27/08/2026) — RPC compartilhada app+bot
                    // (fn_classificar_pagamento_contrato, migration
                    // conciliacao_rpc_compartilhada_v1) decide o resto: já
                    // conciliado / pendência duplicada / match único /
                    // confirmação dupla / não identificado. Substitui a busca
                    // local de matchUnico + soma de 2 + criação incondicional
                    // de pendência que existiam aqui — motor ÚNICO agora,
                    // compartilhado com conciliarRecebimento() no bot (antes
                    // eram 2 reimplementações paralelas — causa raiz confirmada
                    // de 26 falsos-positivos achados na Rumo em 27/08/2026:
                    // Geneticenter/julho com chave NULL de reconciliação
                    // manual, HWN/julho com chave gravada diferente da chave
                    // da nova transação, mesma transação real).
                    const { data: cls, error: erroCls } = await dbAuth.rpc('fn_classificar_pagamento_contrato', {
                        p_contrato_id: contratoCandidato.id, p_data_transacao: t.dataISO, p_valor: t.valor, p_chave: chave,
                    });
                    if (erroCls) devLog("ERRO_RPC_CONCILIACAO", `fn_classificar_pagamento_contrato falhou pra ${t.razaoSocial}: ${erroCls.message}`);

                    const referenciaEsperada = (cls && cls.referencia_esperada)
                        || ((contratoCandidato.alugelAntecipado !== 'Sim') ? mesAnteriorRef(referenciaDoMes) : referenciaDoMes);

                    if (cls && cls.classificacao === 'ja_conciliado') {
                        qtdJaProcessadas++;
                        continue;
                    }

                    // v3_15 — classificação 'pendencia_ja_existe' não existe
                    // mais (a RPC compartilhada parou de retorná-la — ver
                    // migration dropar_pendencias_extrato_e_codigo_morto).

                    if (cls && cls.classificacao === 'match_unico' && cls.mensalidade_id) {

                        const idx = mensalidades.findIndex(m => m.id === cls.mensalidade_id);

                        if (idx === -1) {
                            // Rede de segurança: RPC apontou uma mensalidade que não está
                            // no array em memória (dessincronizado) — fica 'pendente' em
                            // extrato_fingerprints (v1.6.1, não duplica mais em
                            // pendencias_extrato) em vez de quebrar ou falhar silenciosamente.
                            qtdPendencias++;
                            continue;
                        }

                        mensalidades[idx].status = 'Pago';

                        mensalidades[idx].banco = 'PIX/TED (extrato)';

                        mensalidades[idx].dataPgto = dataBR;

                        mensalidades[idx].valorConfirmado = t.valor;

                        mensalidades[idx].chaveTransacaoOrigem = chave;

                        // v1.2 — espelha em extrato_fingerprints (só o status,
                        // não muda nada da conciliação de entrada em si) pra
                        // tela unificada de conciliação (protótipo aprovado,
                        // Tudo/Entradas/Saídas) enxergar entrada e saída pela
                        // mesma fonte, sem tocar no match que já funciona.
                        fpAtual.statusConciliacao = 'conciliado';
                        fpAtual.destinoTipo = 'mensalidade';
                        fpAtual.destinoId = cls.mensalidade_id;

                        // Sobrescreve a observação (não acumula) — evita texto duplicado

                        // quando o mesmo item é conciliado, estornado e reconciliado.

                        mensalidades[idx].observacao = `Conciliado automaticamente via extrato — pagador: ${t.razaoSocial}`;

                        idsMensalidadesAlteradas.push(mensalidades[idx].id);

                        registrarLog('mensal.baixar', { mensalidadeId: cls.mensalidade_id, referencia: referenciaEsperada, valor: t.valor, banco: 'PIX/TED (extrato)', via: 'conciliacao_automatica' });

                        qtdConciliados++;

                        // v3_15 (12/09/2026) — bloco que resolvia uma
                        // pendência antiga em pendencias_extrato removido:
                        // a tabela foi dropada, não existe mais "pendência
                        // aberta numa tabela separada" pra fechar aqui —
                        // extrato_fingerprints já reflete o estado certo
                        // sozinho.

                        continue;

                    }

                    if (cls && cls.classificacao === 'confirmacao_dupla' && Array.isArray(cls.mensalidade_ids_sugeridas) && cls.mensalidade_ids_sugeridas.length === 2) {

                        // v1.6.1 — Etapa 8, resto: painel de Pendências legado
                        // saiu (achado do Nicola) — a ação especial "Sim, são
                        // os 2 meses" (confirmarPendenciaDupla) que existia só
                        // ali não tem equivalente na tela nova ainda. GAP
                        // CONHECIDO, registrado aqui de propósito (não
                        // escondido): por ora a linha só fica 'pendente' —
                        // "Buscar manualmente" vincula a 1 mensalidade só, não
                        // divide o pagamento entre as 2. Retomar se um caso
                        // real aparecer — não achei nenhum na base da Rumo ao
                        // investigar isto.
                        qtdPendencias++;

                        continue;

                    }

                    // v3_15 (12/09/2026) — checagem local contra
                    // pendencias_extrato removida (tabela dropada) — o
                    // índice único de extrato_fingerprints já cobre isso.

                    // v1.6.1 — Etapa 8, resto: 'nao_identificado' (ou a RPC

                    // falhou) — a linha já ficou 'pendente' em

                    // extrato_fingerprints (gravado acima); não duplica mais

                    // em pendencias_extrato (painel legado retirado, achado

                    // do Nicola). Nunca descarta silenciosamente — só conta

                    // pra revisão manual na tela de Conciliação.

                    qtdPendencias++;

                } else {

                    // SAÍDA — só interessa se for repasse para um dos 4 sócios conhecidos.
                    // (inalterado — repasse fica fora do escopo desta unificação, que
                    // era especificamente sobre entrada/aluguel)

                    const nomeSocio = obterSociosConhecidos().find(s => nomesIguaisSocio(s, t.razaoSocial));

                    if (nomeSocio) {

                        // Essa transação já virou um repasse antes — não duplica ao

                        // reimportar o mesmo extrato.

                        if (chavesJaRepassadas.has(chave)) { qtdJaProcessadas++; continue; }

                        // Usa apenas o primeiro nome do sócio ao lançar o repasse

                        // (ex: "RUYTER CARLOS DA SILVA" -> "Ruyter"), consistente com

                        // como os sócios são identificados no resto do sistema.

                        const primeiroNomeSocio = nomeSocio.split(' ')[0];

                        const primeiroNomeFormatado = primeiroNomeSocio.charAt(0) + primeiroNomeSocio.slice(1).toLowerCase();

                        repasses.push({

                            id: 'rep_' + Date.now() + Math.random().toString(36).substr(2, 4),

                            socio: primeiroNomeFormatado, mes: referenciaDoMes, valor: Math.abs(t.valor),

                            dataReal: dataBR, timestamp: Date.now(), chaveTransacaoOrigem: chave

                        });

                        qtdRepasses++;

                    } else {

                        qtdIgnorados++; // boleto pago a terceiro, tarifa, DARF etc — descarta

                    }

                }

            }

            esconderBannerPendencia();

            await gravarFingerprintsExtratoSupabase(novosFingerprints);

            extratoFingerprints = extratoFingerprints.concat(novosFingerprints);

            // v1.6.0 — Etapa 8 do plano: fim da importação chama o motor de
            // regras novo (fn_conciliacao_aplicar, banco) uma vez só — trata
            // sozinho o que ficou pendente e o laço acima não resolve
            // (rendimento, tarifa, repasse de administradora, "sempre fazer
            // assim" do cliente). Mesma RPC que o bot chama no fim do lote
            // (whatsapp-webhook v2.55) — fonte única dos dois canais. Erro
            // aqui não derruba a importação já feita; "Reprocessar" resolve depois.
            let resumoMotor = [];
            try {
                const { data: resumoRpc, error: erroMotor } = await dbAuth.rpc('fn_conciliacao_aplicar', { p_cliente_id: CLIENTE_ID_SUPABASE, p_ids: null });
                if (erroMotor) throw erroMotor;
                resumoMotor = resumoRpc || [];
            } catch (errMotor) {
                devLog('ERRO_CONCILIACAO', 'fn_conciliacao_aplicar falhou no fim da importação (não crítico): ' + (errMotor.message || errMotor));
            }

            // CORRIGIDO (v1.66.9, 28/08/2026) — mesmo bug real já corrigido
            // nos botões pontuais de pendência (v1.66.7): saveAll(true,
            // null) sem `rotas` sincronizava as 9 rotas inteiras, mesmo essa
            // importação só podendo tocar mensalidades/repasses — nunca
            // imóveis, contratos, administradoras, síndicos, manutencistas
            // ou minutas. Dentro de mensalidades, `itensAlterados` limita
            // ainda mais: só os IDs realmente tocados nesta importação
            // (gerados ou conciliados), não a carteira inteira — um extrato
            // de 30 transações não paga mais o custo de ressincronizar
            // centenas de mensalidades que não mudaram nada.
            // `rotas` só inclui o que teve pelo menos 1 item tocado nesta
            // rodada, pra não gastar uma sincronização à toa quando, por
            // exemplo, nenhum repasse foi identificado.
            // v3_15 (12/09/2026) — rota 'pendenciasExtrato' removida
            // (tabela dropada).
            const rotasTocadas = [];
            if (idsMensalidadesAlteradas.length > 0) rotasTocadas.push('mensalidades');
            if (qtdRepasses > 0) rotasTocadas.push('repasses');

            if (rotasTocadas.length > 0) {
                await saveAll(true, null, rotasTocadas, {
                    mensalidades: idsMensalidadesAlteradas,
                });
            }

            // v1.17.0 (Fase 1 do wrapper de escrita) — emite mesmo quando
            // rotasTocadas ficou vazia: gravarFingerprintsExtratoSupabase()
            // e fn_conciliacao_aplicar() (acima) já escreveram no banco
            // nesse caso também (fingerprints + o que o motor de regras
            // resolveu sozinho). Ver changelog do topo.
            emitirEscrita('conciliacao', { acao: 'importar', qtdConciliados, qtdRepasses, qtdPendencias });

            // v1.28.0 (UXR-30) — o resumo que era diálogo nativo vira Sheet de leitura (rzAviso).
            const tratadosMotor = resumoMotor.reduce((t, r) => t + (r.quantidade || 0), 0);
            rzAviso({
                titulo: String(tituloResumo || 'Importação concluída').replace(/^[^A-Za-zÀ-ú]+/, '').replace(/!$/, ''),
                linhas: [
                    `${qtdConciliados} recebimento(s) conciliado(s) automaticamente.`,
                    `${qtdRepasses} retirada(s) de sócio lançada(s).`,
                    tratadosMotor > 0 ? `${tratadosMotor} linha(s) tratada(s) sozinha(s) pelas regras (rendimento, tarifa, administradora…).` : '',
                    `${qtdPendencias} item(ns) precisam da sua revisão em Conciliação.`,
                    qtdIgnorados > 0 ? `${qtdIgnorados} lançamento(s) sem ação automática — confira em Conciliação.` : '',
                    qtdJaProcessadas > 0 ? `${qtdJaProcessadas} transação(ões) já estava(m) conciliada(s) antes — nada novo feito.` : '',
                ],
            });

            if (document.getElementById('conc-uni-lista')) await carregarConciliacaoUnificada();

        }

        // v1.178.2 — retirada do painel de Pendências legado: reprocessar
        // buscava pendências em pendenciasExtrato (agora congelado, só
        // dados históricos) — fonte trocada pra extrato_fingerprints
        // (status_conciliacao='pendente'), a mesma que a Conciliação usa.
        // Reconstrói e passa pelo MESMO pipeline de sempre
        // (conciliarTransacoes → conciliarRecebimento →
        // fn_classificar_pagamento_contrato) — idempotente por natureza (a
        // chave é a mesma, o trigger de banco ignora o insert duplicado do
        // fingerprint, só a reclassificação roda de novo). conciliarTransacoes
        // já chama fn_conciliacao_aplicar no fim (Etapa 8) — saída pendente
        // (que este reprocessamento não tenta re-casar sozinho) também ganha
        // uma chance pelo motor novo de graça.
        // v1.178.9 — achado do Nicola: Importar + Reprocessar viraram 1
        // botão só, que abre este menu com as duas opções (antes eram um
        // card cheio + um link separado, ocupando 2 blocos no topo da aba).
        // v1.28.0 — o menu "Importar" fundiu-se no "Lançar" do "+" (UXR-12).
        export function abrirAcoesImportarConciliacao() { abrirLancarFinanceiro('conciliacao'); }

        export async function reprocessarConciliacaoPendente() {

            const { data: pendentesFp, error: erroFp } = await dbAuth.from('extrato_fingerprints')
                .select('id, data, valor, razao_social, documento_original')
                .eq('cliente_id', CLIENTE_ID_SUPABASE).eq('status_conciliacao', 'pendente').eq('direcao', 'entrada');

            if (erroFp) { mostrarToast('Erro ao buscar pendências: ' + erroFp.message, 'danger'); return; }

            if (!pendentesFp || pendentesFp.length === 0) {

                rzToast('Não há entradas pendentes para reprocessar agora.', { tipo: 'info' });

                return;

            }

            if (!await rzConfirmar({ titulo: 'Reprocessar pendências', impacto: `${pendentesFp.length} entrada(s) pendente(s). A Raiz tenta achar contrato e recebimento de novo para cada uma.`, rotuloConfirmar: 'Reprocessar' })) return;

            mostrarCarregamentoGlobal("Reprocessando conciliação...");

            const transacoesReconstituidas = pendentesFp.map(p => ({

                dataISO: p.data, valor: Math.abs(parseFloat(p.valor)),

                razaoSocial: p.razao_social || '', documento: p.documento_original || '', descricao: ''

            }));

            await conciliarTransacoes(transacoesReconstituidas, '🔄 Reprocessamento concluído!', 'Itaú');

        }

        // v1.178.2 — painel de Pendências legado retirado (achado do
        // Nicola testando no celular; migração conferida em banco antes de
        // tirar: as 30 pendências reais da Rumo já tinham fingerprint
        // correspondente, 2 corrigidas por dessincronia, 28 seguem
        // 'pendente' e já visíveis/acionáveis na Conciliação nova — nenhum
        // dado perdido). Removidas: renderPendenciasExtrato,
        // alternarGrupoPendencias, vincularPendenciaExtrato,
        // confirmarPendenciaDupla, descartarPendenciaExtrato,
        // gruposPendenciasAbertos. "Confirmação dupla" (1 pagamento cobrindo
        // 2 meses) fica no backlog — pedido explícito do Nicola (incomum;
        // nenhum caso real achado na base da Rumo ao investigar).


        // v1.177.0 — alternarPainelGerarMes() removida (Etapa 7 — painel
        // "Gerar mês" não existe mais, ver comentário em gerarMensalidades).
        // alternarPainelConciliacao() também removida (Etapa 7/8) —
        // "painel-conciliacao-wrapper" virou a aba própria tab-conciliacao,
        // sempre visível quando a aba está ativa; montarAbaFinanceiro()
        // já chama carregarConciliacaoUnificada()/renderPendenciasExtrato()
        // direto ao entrar na aba.

        // ============================================================================
        // v1.X — Módulo Apoio ao Contador, Etapa 2B: CONCILIAÇÃO UNIFICADA
        // (protótipo Tudo/Entradas/Saídas aprovado pelo Nicola, 10/09/2026).
        // Lê extrato_fingerprints direto (fonte única desde a Etapa 1/2B — a
        // importação já espelha o resultado da entrada aqui, e a saída nasce
        // aqui). Entrada pendente continua sendo tratada pelo painel de
        // Pendências de sempre (não reimplementado); aqui a ação de entrada
        // pendente só aponta pra lá. Saída usa as RPCs da Etapa 2A
        // inteiras: fn_extrato_sugerir_destino/vincular_saida/criar_saida/
        // marcar_nao_controlado/estornar_vinculo.
        // ============================================================================
        let conciliacaoUniCache = [];
        let conciliacaoUniSegmento = 'tudo'; // só o <select> "Tipo" do modal Buscar/Filtrar usa isso agora (Entrega F.4 — chip de segmento saiu da tela)
        let despesaOrigemFingerprintId = null; // v2 — setado quando "Nova despesa" é aberta a partir da conciliação; salvarDespesa() usa isso pra vincular o fingerprint de volta

        // v1.5.0 (Etapa 7/8 da conciliação) — a função que morava aqui
        // (ressincronizarFingerprintAposEstorno) fazia, na mão, exatamente o
        // que fn_mensalidade_espelha_fingerprint/fn_lancamento_espelha_fingerprint
        // (triggers de banco, Etapa 3 do plano) agora fazem sozinhos sempre
        // que o status sai de 'pago' — inclusive limpando regra_codigo, que
        // esta função não fazia. Fica só o refresh da tela, se estiver aberta.
        async function atualizarConciliacaoSeAberta() {
            if (document.getElementById('conc-uni-lista')) await carregarConciliacaoUnificada();
        }

        // v1.6.0 — Etapa 8: sugestões em lote (fn_conciliacao_sugestoes, 1
        // chamada só pra lista inteira) — antes cada linha só buscava
        // sugestão no toque (fn_extrato_sugerir_destino/recebimento,
        // continuam existindo, usadas no fallback de toque em
        // abrirAcoesConciliacaoLinha). Mapa por fingerprint_id.
        let conciliacaoUniSugestoes = {};

        // Entrega F.4 (21/09/2026, pedido explícito) — a lista de Conciliação
        // deixou de trazer os últimos 200 lançamentos de qualquer mês: agora
        // segue a MESMA competência do card do topo (financeiroCompetenciaAtual)
        // e só traz o que ainda precisa de atenção (pendente/não controlado —
        // igual escopo de fn_financeiro_totalizador_fechamento, mesmo campo
        // `data` usado lá). O que já foi conciliado/baixado aparece em
        // Recebimentos/Saídas (mensalidade paga/lançamento realizado), não
        // mais aqui — ver renderMensalidades/renderSaidas.
        export async function carregarConciliacaoUnificada() {
            const lista = document.getElementById('conc-uni-lista');
            if (!lista) return;
            lista.innerHTML = `<p class="text-xs text-center py-3" style="color:var(--sage)">Carregando…</p>`;
            await carregarRegrasConciliacao(); // v1.29.0 (RF-09)
            try {
                const comp = financeiroCompetenciaAtual || financeiroCompetenciaHojeISO();
                const [ano, mes] = comp.split('-').map(Number);
                const inicioMes = `${ano}-${String(mes).padStart(2, '0')}-01`;
                const fimMes = `${mes === 12 ? ano + 1 : ano}-${String(mes === 12 ? 1 : mes + 1).padStart(2, '0')}-01`;
                const { data, error } = await dbAuth.from('extrato_fingerprints')
                    .select('id, data, valor, direcao, razao_social, documento_original, status_conciliacao, destino_tipo, destino_id, observacao_usuario, chave, regra_codigo')
                    .eq('cliente_id', CLIENTE_ID_SUPABASE)
                    .in('status_conciliacao', ['pendente', 'nao_controlado'])
                    .gte('data', inicioMes).lt('data', fimMes)
                    .order('data', { ascending: false });
                if (error) throw error;
                conciliacaoUniCache = data || [];

                conciliacaoUniSugestoes = {};
                try {
                    const { data: sugestoes, error: erroSug } = await dbAuth.rpc('fn_conciliacao_sugestoes', { p_cliente_id: CLIENTE_ID_SUPABASE, p_ids: null });
                    if (!erroSug) (sugestoes || []).forEach(s => { if (s.regra_codigo) conciliacaoUniSugestoes[s.fingerprint_id] = s; });
                } catch (eSug) { /* sem sugestão em lote — linha cai no fluxo de toque de sempre, não bloqueia a lista */ }

                renderConciliacaoUnificada();
            } catch (err) {
                lista.innerHTML = `<p class="text-xs text-center py-3" style="color:var(--wine)">Não consegui carregar: ${err.message}</p>`;
            }
        }

        // v1.179.0 — achado do Nicola: lupa de filtro na Conciliação.
        export function abrirBuscaConciliacao() {
            document.getElementById('conc-busca-tipo').value = conciliacaoUniSegmento;
            atualizarCamposTipoConciliacao();
            popularFiltrosConciliacao();
            document.getElementById('modal-busca-conciliacao')?.classList.remove('hidden');
        }
        export function fecharBuscaConciliacao() {
            document.getElementById('modal-busca-conciliacao')?.classList.add('hidden');
        }
        export function limparBuscaConciliacao() {
            document.getElementById('conc-busca-texto').value = '';
            document.getElementById('conc-busca-tipo').value = 'tudo';
            document.getElementById('conc-filtro-locatario').value = 'todos';
            document.getElementById('conc-filtro-empreendimento').value = 'todos';
            document.getElementById('conc-filtro-categoria').value = 'todos';
            document.getElementById('conc-filtro-ativo').value = 'todos';
            document.getElementById('conc-filtro-fornecedor').value = 'todos';
            filtrarConciliacaoSegmento('tudo');
            atualizarCamposTipoConciliacao();
        }
        // Mostra só o grupo de campos que faz sentido pro tipo escolhido —
        // esses filtros pressupõem já saber a direção (Entrada usa os campos
        // de Recebimentos; Saída, os de Saídas).
        export function atualizarCamposTipoConciliacao() {
            const tipo = document.getElementById('conc-busca-tipo')?.value || 'tudo';
            document.getElementById('conc-campos-entrada')?.classList.toggle('hidden', tipo !== 'entrada');
            document.getElementById('conc-campos-saida')?.classList.toggle('hidden', tipo !== 'saida');
        }
        // Preenche os selects a partir dos contratos/lançamentos já
        // carregados — mesma fonte que Recebimentos/Saídas usam.
        function popularFiltrosConciliacao() {
            const selLoc = document.getElementById('conc-filtro-locatario');
            const selEmp = document.getElementById('conc-filtro-empreendimento');
            const selAtivo = document.getElementById('conc-filtro-ativo');
            const selForn = document.getElementById('conc-filtro-fornecedor');
            if (!selLoc) return;
            const locatarios = [...new Set(contratos.map(c => c.locatario).filter(Boolean))].sort();
            const vLoc = selLoc.value;
            selLoc.innerHTML = '<option value="todos">Todos</option>' + locatarios.map(l => `<option value="${escapeHtmlSaidas(l)}">${escapeHtmlSaidas(l)}</option>`).join('');
            selLoc.value = locatarios.includes(vLoc) ? vLoc : 'todos';

            const empreendimentos = [...new Set(imoveis.map(i => i.empreendimento).filter(Boolean))].sort();
            const vEmp = selEmp.value;
            selEmp.innerHTML = '<option value="todos">Todos</option>' + empreendimentos.map(e => `<option value="${escapeHtmlSaidas(e)}">${escapeHtmlSaidas(e)}</option>`).join('');
            selEmp.value = empreendimentos.includes(vEmp) ? vEmp : 'todos';

            const ativosUsados = [...new Map(lancamentos.filter(d => d.ativoId).map(d => [d.ativoId, d.ativoNome])).entries()];
            const vAtivo = selAtivo.value;
            selAtivo.innerHTML = '<option value="todos">Todos</option>' + ativosUsados.map(([id, nome]) => `<option value="${id}">${escapeHtmlSaidas(nome)}</option>`).join('');
            selAtivo.value = ativosUsados.some(([id]) => id === vAtivo) ? vAtivo : 'todos';

            const fornecedoresUsados = [...new Map(lancamentos.filter(d => d.parteId).map(d => [d.parteId, d.parteNome])).entries()];
            const vForn = selForn.value;
            selForn.innerHTML = '<option value="todos">Todos</option>' + fornecedoresUsados.map(([id, nome]) => `<option value="${id}">${escapeHtmlSaidas(nome)}</option>`).join('');
            selForn.value = fornecedoresUsados.some(([id]) => id === vForn) ? vForn : 'todos';
        }

        // Entrega F.4 (21/09/2026) — o segmento Tudo/Entradas/Saídas
        // (#conc-uni-seg) saiu da tela; esta função continua existindo só
        // pelo <select> "Tipo" do modal Buscar/Filtrar (conc-busca-tipo),
        // que ainda decide quais campos condicionais mostrar
        // (atualizarCamposTipoConciliacao) e filtra por direção.
        export function filtrarConciliacaoSegmento(seg) {
            conciliacaoUniSegmento = seg;
            renderConciliacaoUnificada();
        }

        // filtrarConciliacaoChip() removida (Entrega F.4) — os chips de
        // status (Todos/Pendentes/Conciliados/Não controlado) saíram da
        // tela: a lista já só traz pendente+não controlado (ver
        // carregarConciliacaoUnificada), não tem mais o que filtrar por chip.

        // v1.6.3 — Etapa 8, pedido explícito do Nicola testando no celular
        // ("o que significa pendente?"): legenda dos 4 status/chips, num
        // sheet em vez de texto sempre visível (economiza espaço).
        export function explicarStatusConciliacao() {
            const itens = [
                ['Pendente', 'A linha do extrato ainda não foi ligada a nenhum recebimento ou despesa — precisa de confirmação (quando o sistema sugere) ou vínculo manual.'],
                ['Automáticas', 'O sistema já concluiu sozinho, com base em regras (aluguel do locatário identificado, repasse de administradora, rendimento de aplicação, tarifa bancária...). É um subconjunto de "Conciliados" — dá pra desfazer a qualquer momento.'],
                ['Conciliados', 'Já tem um destino definido — recebimento ou despesa —, automático ou feito à mão. Inclui as Automáticas.'],
                ['Não controlado', 'Você (ou o sistema, numa regra automática) decidiu que essa linha não precisa de acompanhamento — ex.: rendimento pequeno, tarifa. Fica guardada, mas fora do fluxo de cobrança/despesas.'],
            ];
            abrirSheet(rzSheetCabecalho('O que significa cada status') +
                `<div class="rz-sh-b"><div class="rz-card"><div class="rz-kv">${
                    itens.map(([r, v]) => `<div class="rz-full"><small>${rzEsc(r)}</small><b style="font-weight:500;font-size:12.5px">${rzEsc(v)}</b></div>`).join('')
                }</div></div></div>`);
        }

        // v1.6.0 — Etapa 8: chip "automaticas" é derivado (conciliado +
        // regra_codigo preenchido), não um valor de status_conciliacao
        // direto — cobre tanto o motor novo quanto R03/R06 (motor atual +
        // espelho, Etapa 3), que também gravam regra_codigo.
        // v1.29.0 (RF-09, demanda 4a369778, d9937a2b) — nome e categoria das
        // regras deixam de ser listas fixas aqui: vêm de conciliacao_regras
        // (CAN-03). Nome = coluna `nome` (a da empresa vence a da plataforma);
        // categoria sugerida = acao_params.categoria (preenchido nas regras
        // R08/R09/R10/R13/R14/R15 da plataforma, migration
        // conciliacao_regras_categoria_param). Antes de carregar, mostra o código.
        let regrasConcCache = null;
        async function carregarRegrasConciliacao() {
            if (regrasConcCache) return regrasConcCache;
            const mapa = {};
            try {
                const { data, error } = await dbAuth.from('conciliacao_regras')
                    .select('codigo, nome, acao_params, cliente_id, versao').eq('ativa', true)
                    .or(`cliente_id.is.null,cliente_id.eq.${CLIENTE_ID_SUPABASE}`);
                if (error) throw error;
                (data || []).sort((a, b) => (a.cliente_id ? 1 : 0) - (b.cliente_id ? 1 : 0) || (a.versao || 0) - (b.versao || 0)).forEach(r => {
                    const atual = mapa[r.codigo] || {};
                    mapa[r.codigo] = { nome: r.nome || atual.nome, categoria: r.acao_params?.categoria || atual.categoria || null };
                });
                regrasConcCache = mapa;
            } catch (e) { console.warn('[financeiro] regras de conciliação:', e.message); }
            return mapa;
        }
        const CERTEZA_TOTAL = { CT01: 'Certeza total', CT02: 'Certeza total' };
        function nomeRegraConc(codigo) {
            if (!codigo) return '';
            return regrasConcCache?.[codigo]?.nome || CERTEZA_TOTAL[codigo] || codigo;
        }
        function categoriaRegraConc(codigo) { return regrasConcCache?.[codigo]?.categoria || 'outro'; }

        // v1.6.3 — Etapa 8, achado do Nicola: razão social de saída/entrada
        // vem do banco já com o tipo de transação embutido na frente
        // ("SAÍDA BOLETO PAGO CONDOMINIO - CONDOMINIO EDIFICIO..."),
        // redundante com o segmento Entradas/Saídas que já mostra a direção.
        // Limpa só na EXIBIÇÃO (não mexe no dado gravado). Padrão real do
        // extrato Itaú: o trecho depois do ÚLTIMO " - " é o nome completo
        // do favorecido/pagador — o que vem antes é histórico do banco
        // (tipo de transação), sem valor de identificação, descartado
        // aqui. Sem "- " (rendimento/tarifa, sem contraparte de verdade),
        // só tira o prefixo de direção. Tipo (boleto/PIX/TED) não é
        // mostrado à parte — decisão do Nicola, "ou não trazer".
        function limparRotuloConciliacao(razaoSocial) {
            if (!razaoSocial) return '—';
            const partes = razaoSocial.split(' - ');
            if (partes.length >= 2) return partes[partes.length - 1].trim() || razaoSocial;
            let texto = razaoSocial.replace(/^(SAÍDA|ENTRADA)\s+/i, '');
            // v1.6.4 — Etapa 8, achado do Nicola: sem " - " ainda sobrava
            // "PIX TRANSF"/"TED" e a referência do banco antes do nome
            // ("TED 033.0944.HWN ENGENHARIA LTDA" continuava quase inteiro).
            texto = texto.replace(/^(PIX\s+TRANSF\.?|PIX\s+ENVIADO|PIX\s+RECEBIDO|TED|DOC|BOLETO\s+PAGO)\s+/i, '');
            // Referência numérica do banco ("033.0944.") ou nome truncado +
            // data ("ADRIANO09/07 ") logo no início — tira só se sobrar algo
            // depois, nunca esvazia o texto.
            let semRef = texto.replace(/^[\d.]+\s*/, '');
            semRef = semRef.replace(/^[A-Z]+\d{2}\/\d{2}\s+/i, '');
            return (semRef.trim() || texto.trim() || razaoSocial);
        }

        // v1.6.5 — agrupamento por competência (alternarGrupoConciliacao)
        // REMOVIDO na Entrega F.4 (21/09/2026, pedido explícito — "perder o
        // agrupamento de competencia"): a lista já é 1 competência só (a do
        // card do topo), não tem mais o que agrupar/expandir por mês.

        // Uma linha (as 3 variações — automática, com sugestão, ou simples)
        // — extraída da função de render pra poder ser reusada por grupo.
        function linhaConciliacaoUniHtml(f) {
            const entrada = f.direcao === 'entrada';
            const valorFmt = formatarMoedaBR(Math.abs(parseFloat(f.valor)));
            const automatica = f.status_conciliacao === 'conciliado' && !!f.regra_codigo;
            const sug = f.status_conciliacao === 'pendente' ? conciliacaoUniSugestoes[f.id] : null;
            // v1.179.3 — achado do Nicola comparando com o design system do
            // projeto: esta função usava divs com estilo próprio (bg
            // colorido no ícone, badge de status sem a bolinha, sem
            // .rz-card.rz-list no grupo) — igual em espírito ao de
            // Recebimentos/Saídas, mas sem usar as MESMAS classes. Reescrita
            // pra usar .rz-row/.rz-ic/.rz-tx/.rz-rt/.rz-chev e renderStatus()
            // (a única função que decide cor de status, REGRAS §10 — é dali
            // que vem a bolinha antes do texto, via .rz-st::before) —
            // mesmo tamanho de ícone (42px/20px), mesmo ⋮ (.rz-chev),
            // mesma tag de status em toda a tela agora.
            const rs = (sem, t) => (typeof renderStatus === 'function') ? renderStatus(sem, t) : `<span class="rz-st rz-${sem}">${t}</span>`;
            const valorSpan = `<b class="${entrada ? 'rz-in' : 'rz-out'}">${entrada ? '+' : '−'} ${valorFmt}</b>`;

            if (automatica) {
                const nomeRegra = nomeRegraConc(f.regra_codigo);
                return `<div class="rz-row rz-link" onclick="abrirAcoesConciliacaoLinha('${f.id}')">
                    <div class="rz-ic rz-ia"><svg data-lucide="sparkles"></svg></div>
                    <div class="rz-tx"><b>${escapeHtmlSaidas(limparRotuloConciliacao(f.razao_social))}</b><span>Automático · ${escapeHtmlSaidas(nomeRegra)}</span></div>
                    <div class="rz-rt">${valorSpan}</div>
                    <svg data-lucide="ellipsis-vertical" class="rz-chev"></svg>
                </div>`;
            }

            if (sug) {
                const confPct = Math.round((sug.confianca || 0));
                const semConfianca = confPct < 70 ? 'warn' : 'ia';
                return `<div class="rz-row rz-link" onclick="abrirAcoesConciliacaoLinha('${f.id}')">
                    <div class="rz-ic rz-${semConfianca}"><svg data-lucide="sparkles"></svg></div>
                    <div class="rz-tx"><b>${escapeHtmlSaidas(limparRotuloConciliacao(f.razao_social))}</b><span>Parece: ${escapeHtmlSaidas(sug.detalhe || nomeRegraConc(sug.regra_codigo))}${conciliacaoAtivoDaSugestao(sug) ? ' · ' + escapeHtmlSaidas(conciliacaoAtivoDaSugestao(sug)) : ''}</span></div>
                    <div class="rz-rt">${valorSpan}<span class="rz-ia-tag"><svg data-lucide="sparkles"></svg>${confPct}%</span></div>
                    <svg data-lucide="ellipsis-vertical" class="rz-chev"></svg>
                </div>`;
            }

            const badge = f.status_conciliacao === 'pendente' ? rs('warn', 'Pendente')
                : f.status_conciliacao === 'conciliado' ? rs('ok', 'Conciliado')
                : rs('neu', 'Não controlado');
            return `<div class="rz-row rz-link" onclick="abrirAcoesConciliacaoLinha('${f.id}')">
                <div class="rz-ic"><svg data-lucide="${entrada ? 'arrow-down-left' : 'arrow-up-right'}"></svg></div>
                <div class="rz-tx"><b>${escapeHtmlSaidas(limparRotuloConciliacao(f.razao_social))}</b><span>${formatarDataBR(f.data)}</span></div>
                <div class="rz-rt">${valorSpan}${badge}</div>
                <svg data-lucide="ellipsis-vertical" class="rz-chev"></svg>
            </div>`;
        }

        // Entrega F.4 (21/09/2026, pedido explícito) — reescrita: a lista já
        // chega do banco escopada à competência do card do topo e só com
        // pendente/não controlado (carregarConciliacaoUnificada); esta
        // função ficou só com os filtros de busca (texto/locatário/
        // empreendimento/categoria/ativo/fornecedor) e virou lista FLAT —
        // sem agrupar por competência (só sobra 1 mês) e sem chip de status
        // (só sobram 2 status possíveis, ambos sempre visíveis). O hero
        // "Conciliação do período" saiu (ver index.html) — quem resume agora
        // são os 4 KPIs do chip Fechamento (fin-kpi-fech-*, js/fechamento.js
        // fechamentoAtualizarKpis), nunca somados aqui no cliente.
        // v1.38.0 — ativo do destino sugerido (despesa prevista ou recebimento do contrato), para "Parece: … · ativo"
        function conciliacaoAtivoDaSugestao(sug) {
            if (!sug?.destino_id) return '';
            if (sug.destino_tipo === 'lancamento') return (lancamentos.find(x => x.id === sug.destino_id)?.ativoNome) || '';
            if (sug.destino_tipo === 'mensalidade') {
                const m = mensalidades.find(x => x.id === sug.destino_id);
                const con = m ? contratos.find(c => c.id === m.contratoId) : null;
                const imo = con ? imoveis.find(i => i.id === con.imovelId) : null;
                return imo ? (imo.empreendimento || imo.enderecoRua || '') : '';
            }
            return '';
        }

        function renderConciliacaoUnificada() {
            const lista = document.getElementById('conc-uni-lista');
            if (!lista) return;

            const termoConc = (document.getElementById('conc-busca-texto')?.value || '').trim().toLowerCase();
            const fLocConc = document.getElementById('conc-filtro-locatario')?.value || 'todos';
            const fEmpConc = document.getElementById('conc-filtro-empreendimento')?.value || 'todos';
            const fCatConc = document.getElementById('conc-filtro-categoria')?.value || 'todos';
            const fAtivoConc = document.getElementById('conc-filtro-ativo')?.value || 'todos';
            const fFornConc = document.getElementById('conc-filtro-fornecedor')?.value || 'todos';

            const filtrados = conciliacaoUniCache.filter(f => {
                if (conciliacaoUniSegmento !== 'tudo' && f.direcao !== conciliacaoUniSegmento) return false;
                if (termoConc && !(f.razao_social || '').toLowerCase().includes(termoConc)) return false;
                if ((fLocConc !== 'todos' || fEmpConc !== 'todos') && f.direcao === 'entrada') {
                    const men = f.destino_tipo === 'mensalidade' ? mensalidades.find(m => m.id === f.destino_id) : null;
                    const con = men ? contratos.find(c => c.id === men.contratoId) : null;
                    const imo = con ? imoveis.find(i => i.id === con.imovelId) : null;
                    if (fLocConc !== 'todos' && con?.locatario !== fLocConc) return false;
                    if (fEmpConc !== 'todos' && imo?.empreendimento !== fEmpConc) return false;
                }
                if ((fCatConc !== 'todos' || fAtivoConc !== 'todos' || fFornConc !== 'todos') && f.direcao === 'saida') {
                    const lanc = f.destino_tipo === 'lancamento' ? lancamentos.find(l => l.id === f.destino_id) : null;
                    if (fCatConc !== 'todos' && lanc?.categoria !== fCatConc) return false;
                    if (fAtivoConc !== 'todos' && lanc?.ativoId !== fAtivoConc) return false;
                    if (fFornConc !== 'todos' && lanc?.parteId !== fFornConc) return false;
                }
                return true;
            });

            // Badge do chip Fechamento (financeiroChipsNivelHtml) conta em
            // cima do cache cheio (não do filtrado) — atualiza aqui porque é
            // esta função que dá o "aviso de chegada" dos dados do mês.
            financeiroRedesenharChipsNivel();

            if (!filtrados.length) {
                lista.innerHTML = `<p class="text-xs text-center py-4" style="color:var(--sage)">Nenhuma pendência de conciliação nesta competência.</p>`;
                return;
            }

            // Mais recente primeiro — sem agrupador (Entrega F.4: 1 mês só,
            // não tem por que colapsar/expandir).
            const ordenados = [...filtrados].sort((a, b) => (b.data || '').localeCompare(a.data || ''));
            lista.innerHTML = `<div class="rz-card rz-list">${ordenados.map(linhaConciliacaoUniHtml).join('')}</div>`;

            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        // v1.6.0 — ficha completa do item sugerido, antes de confirmar
        // (mesmo padrão do protótipo v3.3, pedido explícito do Nicola).
        export function verSugestaoConciliacao(fingerprintId) {
            const f = conciliacaoUniCache.find(x => x.id === fingerprintId);
            const sug = conciliacaoUniSugestoes[fingerprintId];
            if (!f || !sug) return;
            const entrada = f.direcao === 'entrada';
            const valorAbs = Math.abs(parseFloat(f.valor)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            abrirSheetAcoes({
                titulo: limparRotuloConciliacao(f.razao_social),
                sub: `${entrada ? '+' : '−'} R$ ${valorAbs} · ${formatarDataBR(f.data)}`,
                acoes: [
                    { icone: 'sparkles', tipo: 'ia', titulo: (sug.detalhe || nomeRegraConc(sug.regra_codigo)) + (conciliacaoAtivoDaSugestao(sug) ? ' · ' + conciliacaoAtivoDaSugestao(sug) : ''), sub: `Confiança: ${Math.round(sug.confianca || 0)}%`, aoTocar: () => confirmarSugestaoConciliacao(fingerprintId) },
                    { icone: 'search', titulo: entrada ? 'Buscar outro recebimento' : 'Buscar outra saída', aoTocar: () => abrirAcoesConciliacaoLinha(fingerprintId) },
                ],
            });
        }

        // v1.6.0 — Confirmar inline: despacha pra RPC certa conforme a ação
        // sugerida. Ações ambíguas (soma de 2+, valor divergente, memória do
        // cliente sem parâmetro exposto) caem no fluxo de toque de sempre
        // em vez de arriscar confirmar errado — falha fechada, mesmo
        // princípio do motor no banco.
        export async function confirmarSugestaoConciliacao(fingerprintId) {
            const f = conciliacaoUniCache.find(x => x.id === fingerprintId);
            const sug = conciliacaoUniSugestoes[fingerprintId];
            if (!f || !sug) return;

            if (sug.acao === 'nao_controlar') {
                return confirmarNaoControlarConciliacao(fingerprintId, sug.detalhe || null);
            }
            if (sug.acao === 'dar_baixa' && sug.destino_tipo === 'mensalidade' && sug.destino_id) {
                return confirmarVincularConciliacaoRecebimento(fingerprintId, sug.destino_id, f);
            }
            if (sug.acao === 'vincular_saida_prevista' && sug.destino_tipo === 'lancamento' && sug.destino_id) {
                return confirmarVincularConciliacaoSaida(fingerprintId, sug.destino_id);
            }
            if (sug.acao === 'sugerir_categoria') {
                const categoria = categoriaRegraConc(sug.regra_codigo);
                // v1.178.9 — achado do Nicola: DARF/tributo sugerido como
                // categoria genérica "tributo" — mas o texto do banco não
                // carrega QUAL tributo (IRPJ/CSLL/PIS/COFINS/DAS/GPS...), a
                // guia em si é que teria isso, não a linha do extrato. Em
                // vez de criar direto (chutando "tributo" sem detalhe), abre
                // o formulário de despesa pré-preenchido — usuário
                // especifica na descrição antes de salvar. Outras categorias
                // (condomínio, seguro, manutenção, taxa adm.) continuam
                // criando direto — não têm essa ambiguidade de subtipo.
                if (categoria === 'tributo') {
                    fecharSheet();
                    despesaOrigemFingerprintId = fingerprintId;
                    return abrirNovaDespesa(null, { descricao: `${f.razao_social} — especifique o tributo (IRPJ, CSLL, PIS, COFINS, DAS...)`, categoria, valor: Math.abs(parseFloat(f.valor)), vencimento: f.data });
                }
                return confirmarCriarSaidaConciliacao(fingerprintId, categoria, f.razao_social);
            }
            // R04 soma, R05 valor divergente, R12 memória sem params expostos
            // etc. — sem ação segura pra confirmar sozinha: abre o fluxo de
            // toque normal (mesmas RPCs de sugestão pontual).
            return abrirAcoesConciliacaoLinha(fingerprintId);
        }

        export async function abrirAcoesConciliacaoLinha(fingerprintId) {
            const f = conciliacaoUniCache.find(x => x.id === fingerprintId);
            if (!f) return;
            const entrada = f.direcao === 'entrada';
            const valorAbs = Math.abs(parseFloat(f.valor)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            const sub = `${entrada ? '+' : '−'} R$ ${valorAbs} · ${formatarDataBR(f.data)}`;

            // v1.179.2 — achado do Nicola: já conciliado (automático ou não)
            // abre um menu com "Ver detalhe" (tela nativa de sempre) e
            // "Desfazer" (só desvincula da conciliação) em vez de pular
            // direto pra tela nativa — Desfazer deixou de ser um ícone
            // avulso na linha, agora é opção do menu, igual pendente/não
            // controlado.
            if (f.status_conciliacao === 'conciliado' && f.destino_id) {
                const nomeRegra = f.regra_codigo ? nomeRegraConc(f.regra_codigo) : null;
                // v1.25.0 (demanda fb6576c1) — canal='bot' já é gravado pela Edge
                // Function whatsapp-webhook mesmo quando a IA decide sozinha, sem
                // regra do motor (regra_codigo null) — antes isso caía em "Manual".
                // v1.179.5 — achado do Nicola: item de entrada conciliado só
                // tinha "Ver detalhe"+"Desfazer" — faltava "Recibo" direto,
                // mesmo padrão que Recebimentos já tem (ver linha ~2957).
                // "Desfazer" renomeado pra "Estornar", mesmo rótulo usado em
                // Recebimentos/Saídas — era a mesma ação, nome diferente.
                const acoesConciliado = [
                    { icone: 'eye', titulo: 'Ver detalhe', aoTocar: () => { entrada ? abrirRecebimentoDetalhe(f.destino_id, true) : abrirEditarDespesa(f.destino_id); } },
                ];
                if (entrada) {
                    const menConciliada = mensalidades.find(m => m.id === f.destino_id);
                    if (menConciliada) {
                        acoesConciliado.push({ icone: 'receipt', titulo: 'Recibo', sub: 'Gerar ou reenviar', aoTocar: () => abrirModalOpcoesRecibo(menConciliada.id, menConciliada.contratoId) });
                    }
                }
                acoesConciliado.push({ icone: 'undo-2', titulo: 'Estornar', sub: 'Volta pra pendente — só desvincula, não apaga o recebimento/despesa', tipo: 'bad', aoTocar: () => confirmarEstornarConciliacaoSaida(fingerprintId) });
                acoesConciliado.push({ icone: 'info', titulo: 'Resumo da conciliação', sub: 'Data, origem, modo e canal', aoTocar: () => abrirResumoConciliacao(fingerprintId) });
                abrirSheetAcoes({ titulo: limparRotuloConciliacao(f.razao_social), sub: sub + (nomeRegra ? ' · Automático (regra) · ' + nomeRegra : f.canal === 'bot' ? ' · Automático (IA/WhatsApp)' : ' · Manual'), acoes: acoesConciliado });
                return;
            }
            if (f.status_conciliacao === 'nao_controlado') {
                abrirSheetAcoes({ titulo: limparRotuloConciliacao(f.razao_social), sub: sub + (f.observacao_usuario ? ' · ' + f.observacao_usuario : ''), acoes: [
                    { icone: 'rotate-ccw', titulo: 'Reabrir', sub: 'Volta pra pendente', aoTocar: () => confirmarEstornarConciliacaoSaida(fingerprintId) },
                    { icone: 'info', titulo: 'Resumo da conciliação', sub: 'Data, origem, modo e canal', aoTocar: () => abrirResumoConciliacao(fingerprintId) },
                ] });
                return;
            }

            // Pendente — busca sugestão (banco), RPC diferente por direção.
            mostrarCarregamentoGlobal('Buscando sugestão…');
            let candidatos = [];
            let categoriaSugerida = null;
            try {
                if (entrada) {
                    const { data, error } = await dbAuth.rpc('fn_extrato_sugerir_recebimento', { p_fingerprint_id: fingerprintId });
                    if (!error) candidatos = data || [];
                } else {
                    const { data, error } = await dbAuth.rpc('fn_extrato_sugerir_destino', { p_fingerprint_id: fingerprintId });
                    if (!error) {
                        candidatos = (data || []).filter(c => c.lancamento_id);
                        const linhaSugestao = (data || []).find(c => c.categoria_sugerida_se_nova);
                        if (linhaSugestao) categoriaSugerida = linhaSugestao.categoria_sugerida_se_nova;
                    }
                }
            } catch (e) { /* segue sem sugestão, não bloqueia */ }
            esconderCarregamentoGlobal();

            // v1.25.0 (demanda 835aea49) — esta lista vem de fn_extrato_sugerir_*
            // (escala 0-1, comparação só por valor/data), diferente do motor de
            // regras (fn_conciliacao_avaliar, escala 0-100, já cacheado em
            // conciliacaoUniSugestoes) que alimenta verSugestaoConciliacao. Pra
            // MESMA linha não mostrar 2 % diferentes conforme o sheet, quando o
            // candidato do topo aqui é o MESMO destino que o motor de regras já
            // sugeriu, reaproveita a confiança/detalhe do motor em vez de
            // recalcular por outra conta.
            const sugCache = conciliacaoUniSugestoes[fingerprintId];
            const acoes = [];
            if (entrada) {
                candidatos.forEach((c, i) => {
                    const mesmoDoMotor = i === 0 && sugCache && sugCache.destino_id === c.mensalidade_id;
                    const pct = mesmoDoMotor ? Math.round(sugCache.confianca || 0) : Math.round((c.confianca || 0) * 100);
                    acoes.push({
                        icone: i === 0 ? 'check' : 'link', titulo: `${i === 0 ? 'Confirmar' : 'Vincular'}: ${c.locatario}`,
                        sub: `Ref ${c.referencia} · R$ ${fmtBR(c.valor)} · ${pct}% de confiança`,
                        aoTocar: () => confirmarVincularConciliacaoRecebimento(fingerprintId, c.mensalidade_id, f),
                    });
                });
                acoes.push({ icone: 'search', titulo: 'Buscar manualmente', sub: candidatos.length ? 'Ver outros recebimentos em aberto' : 'Nenhuma sugestão — escolha entre os recebimentos em aberto', aoTocar: () => abrirBuscarMensalidadeManual(fingerprintId) });
            } else {
                candidatos.forEach((c, i) => {
                    const mesmoDoMotor = i === 0 && sugCache && sugCache.destino_id === c.lancamento_id;
                    const pct = mesmoDoMotor ? Math.round(sugCache.confianca || 0) : Math.round((c.confianca || 0) * 100);
                    acoes.push({
                        icone: i === 0 ? 'check' : 'link', titulo: `${i === 0 ? 'Confirmar' : 'Vincular'}: ${c.descricao || c.categoria || 'despesa prevista'}`,
                        sub: `R$ ${fmtBR(c.valor)} · vence ${formatarDataBR(c.vencimento)} · ${pct}% de confiança`,
                        aoTocar: () => confirmarVincularConciliacaoSaida(fingerprintId, c.lancamento_id),
                    });
                });
                // "Nova despesa" abre a tela nativa já preenchida (abrirNovaDespesa
                // já aceita `sugestoes` — não crio ficha própria).
                acoes.push({ icone: 'plus', titulo: 'Nova despesa', sub: categoriaSugerida ? `Sugestão: ${categoriaSugerida}` : 'Abre o formulário de despesa', aoTocar: () => { fecharSheet(); despesaOrigemFingerprintId = fingerprintId; abrirNovaDespesa(null, { descricao: f.razao_social, categoria: categoriaSugerida || undefined, valor: Math.abs(parseFloat(f.valor)), vencimento: f.data }); } });
                acoes.push({ icone: 'arrow-left-right', titulo: 'Marcar como repasse', sub: 'Repasse de sócio ou similar', aoTocar: () => confirmarMarcarComoRepasse(fingerprintId) });
            }
            acoes.push({ icone: 'eye-off', titulo: 'Não controlar', sub: 'A linha do banco continua guardada', aoTocar: () => abrirFormNaoControlarConciliacao(fingerprintId) });

            abrirSheetAcoes({ titulo: limparRotuloConciliacao(f.razao_social) || (entrada ? 'Entrada' : 'Saída'), sub, acoes });
        }

        // NOVO (v1.179.5) — pedido explícito do Nicola: um resumo de
        // proveniência pra qualquer item já conciliado ou não controlado —
        // data/hora, origem (extrato bancário vs comprovante avulso), modo
        // (automático + regra, ou manual) e canal (app ou bot, só quando
        // manual). Chamável de qualquer lugar (Conciliação, Recebimentos,
        // Saídas) — por isso busca o fingerprint fresco se não achar no
        // cache da Conciliação (as outras abas não carregam esse cache).
        async function abrirResumoConciliacao(fingerprintId) {
            await carregarRegrasConciliacao(); // v1.29.0 (RF-09)
            let f = conciliacaoUniCache.find(x => x.id === fingerprintId);
            if (!f) {
                mostrarCarregamentoGlobal('Carregando…');
                const { data, error } = await dbAuth.from('extrato_fingerprints').select('*').eq('id', fingerprintId).maybeSingle();
                esconderCarregamentoGlobal();
                if (error || !data) { mostrarToast('Não achei essa conciliação.', 'danger'); return; }
                f = data;
            }

            const entrada = f.direcao === 'entrada';
            const valorAbs = Math.abs(parseFloat(f.valor)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            const dataHora = f.conciliado_em
                ? new Date(f.conciliado_em).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                : 'Não registrado';

            // Origem: hoje só existem 2 fontes reais (comprovante avulso via
            // WhatsApp, ou extrato bancário importado) — "relatório de
            // administrador" ainda não existe como fonte, aparece sozinho
            // aqui quando existir (basta um novo valor de banco_origem).
            const origem = !f.banco_origem ? 'Não registrado'
                : f.banco_origem === 'WhatsApp' ? 'Comprovante avulso (enviado por WhatsApp)'
                : `Extrato bancário — ${f.banco_origem}`;

            // v1.25.0 (demanda fb6576c1) — "Modo: Manual" aparecia até pra
            // comprovante que o bot conciliou sozinho via IA (regra_codigo
            // null — a Edge Function whatsapp-webhook não usa o motor de
            // regras, mas grava canal='bot' igual). Rótulo próprio agora.
            const automaticoRegra = f.status_conciliacao === 'conciliado' && !!f.regra_codigo;
            const automaticoBot = f.status_conciliacao === 'conciliado' && !f.regra_codigo && f.canal === 'bot';
            const modo = automaticoRegra ? `Automático (regra) · ${nomeRegraConc(f.regra_codigo)}`
                : automaticoBot ? 'Automático (IA/WhatsApp)'
                : (f.status_conciliacao === 'conciliado' || f.status_conciliacao === 'nao_controlado') ? 'Manual'
                : 'Não registrado';

            // Canal só faz sentido quando manual — automático por regra é o
            // motor agindo sozinho, não um canal escolhido por alguém.
            const canal = automaticoRegra ? '—'
                : f.canal === 'app' ? 'App'
                : f.canal === 'bot' ? 'Bot (WhatsApp)'
                : 'Não registrado (item de antes desta função existir)';

            const linha = (rotulo, valor) => `<div class="flex justify-between items-start gap-3 py-2" style="border-bottom:1px solid var(--line)">
                <span class="text-xs font-bold text-gray-600">${rotulo}</span>
                <span class="text-sm text-right" style="color:var(--pine)">${rzEsc(valor)}</span>
            </div>`;

            abrirSheet(rzSheetCabecalho('Resumo da conciliação', `${limparRotuloConciliacao(f.razao_social)} · ${entrada ? '+' : '−'} R$ ${valorAbs}`) +
                `<div class="rz-sh-b">
                    ${linha('Data e hora', dataHora)}
                    ${linha('Origem', origem)}
                    ${linha('Modo', modo)}
                    ${linha('Canal', canal)}
                </div>`);
        }

        // Variante por destino (recebimento/despesa) — usada em Recebimentos/
        // Saídas, que não carregam conciliacaoUniCache nem sabem o
        // fingerprintId de cara (só sabem a que mensalidade/lançamento
        // pertencem). Busca o fingerprint pela ponta destino_tipo/destino_id
        // e reaproveita o mesmo resumo.
        async function abrirResumoConciliacaoPorDestino(destinoTipo, destinoId) {
            mostrarCarregamentoGlobal('Carregando…');
            const { data, error } = await dbAuth.from('extrato_fingerprints').select('id').eq('destino_tipo', destinoTipo).eq('destino_id', destinoId).maybeSingle();
            esconderCarregamentoGlobal();
            if (error || !data) { mostrarToast('Não achei o registro de conciliação.', 'danger'); return; }
            return abrirResumoConciliacao(data.id);
        }

        // v1.179.2 — achado do Nicola: "Marcar como repasse" criava uma
        // despesa genérica (categoria repasse_socio) sem saber QUAL sócio —
        // agora usa o mecanismo de repasse de verdade (mesma tabela que a
        // importação usa, mesmo trigger de espelho que já concilia sozinho
        // — corrigido nesta sessão pra casar por data+valor). Tenta
        // identificar o sócio pelo nome do pagador; se não achar, pergunta.
        export function confirmarMarcarComoRepasse(fingerprintId) {
            const f = conciliacaoUniCache.find(x => x.id === fingerprintId);
            if (!f) return;
            const nomeAuto = obterSociosConhecidos().find(s => nomesIguaisSocio(s, f.razao_social));
            if (nomeAuto) { criarRepasseDireto(fingerprintId, nomeAuto); return; }
            const socios = obterSociosConhecidos();
            if (!socios.length) { mostrarToast('Nenhum sócio cadastrado com cota em contrato — cadastre em Partes primeiro.', 'danger'); return; }
            abrirSheetAcoes({ titulo: 'Qual sócio?', sub: 'Não identifiquei pelo nome do pagador — escolha', acoes: socios.map(s => ({
                icone: 'user', titulo: s, aoTocar: () => criarRepasseDireto(fingerprintId, s)
            })) });
        }

        async function criarRepasseDireto(fingerprintId, nomeSocioCompleto) {
            const f = conciliacaoUniCache.find(x => x.id === fingerprintId);
            if (!f) return;
            fecharSheet();
            mostrarCarregamentoGlobal('Registrando repasse…');
            try {
                const primeiroNome = nomeSocioCompleto.split(' ')[0];
                const primeiroNomeFormatado = primeiroNome.charAt(0) + primeiroNome.slice(1).toLowerCase();
                const rep = {
                    id: 'rep_' + Date.now() + Math.random().toString(36).substr(2, 4),
                    socio: primeiroNomeFormatado, mes: dataParaCompetencia(f.data), valor: Math.abs(f.valor),
                    dataReal: formatarDataBR(f.data), timestamp: Date.now(), chaveTransacaoOrigem: f.chave || null
                };
                await sincronizarRepasseSupabase(rep);
                // v1.17.0 (Fase 1 do wrapper de escrita) — ver changelog do topo.
                emitirEscrita('conciliacao', { id: fingerprintId, acao: 'marcar_repasse' });
                esconderCarregamentoGlobal(); mostrarToast('Repasse registrado!', 'success');
                registrarLog('conciliacao.marcar_repasse', { fingerprintId, socio: primeiroNomeFormatado });
                await carregarConciliacaoUnificada();
            } catch (err) { esconderCarregamentoGlobal(); mostrarToast('Erro: ' + err.message, 'danger'); }
        }

        async function confirmarVincularConciliacaoRecebimento(fingerprintId, mensalidadeId, f) {
            fecharSheet();
            mostrarCarregamentoGlobal('Vinculando…');
            try {
                const { error } = await dbAuth.rpc('fn_extrato_vincular_recebimento', {
                    p_mensalidade_id: mensalidadeId, p_valor: f.valor, p_data: f.data,
                    p_razao_social: f.razao_social, p_chave: f.chave || null,
                });
                if (error) throw error;
                // v1.179.5 — pedido do Nicola (Resumo da conciliação): marca
                // o canal desta confirmação manual. Sem trigger disputando
                // esse campo (diferente de regra_codigo), seguro fazer aqui.
                await dbAuth.from('extrato_fingerprints').update({ canal: 'app' }).eq('id', fingerprintId);
                mensalidades = await carregarMensalidadesSupabase();
                // v1.17.0 (Fase 1 do wrapper de escrita) — ver changelog do topo.
                emitirEscrita('conciliacao', { id: fingerprintId, acao: 'vincular_recebimento', mensalidadeId });
                esconderCarregamentoGlobal(); mostrarToast('Vinculado!', 'success');
                registrarLog('conciliacao.vincular_recebimento', { fingerprintId, mensalidadeId });
                await carregarConciliacaoUnificada();
            } catch (err) { esconderCarregamentoGlobal(); mostrarToast('Erro: ' + err.message, 'danger'); }
        }

        // v1.6.1 — Etapa 8, resto (retirada do painel de Pendências legado a
        // pedido do Nicola): busca manual de verdade, substitui a dependência
        // de "role até o painel antigo, escolha no <select> gigante". Mesmo
        // filtro de mensalidade em aberto que o painel antigo usava
        // (status 'Inadimplente' cobre pendente e atrasado — ver
        // mapStatusMensalidadeSupabaseParaAntigo), agora buscável por nome.
        export function abrirBuscarMensalidadeManual(fingerprintId) {
            const f = conciliacaoUniCache.find(x => x.id === fingerprintId);
            if (!f) return;
            const abertas = mensalidades.filter(m => m.status === 'Inadimplente').map(m => {
                const c = contratos.find(x => x.id === m.contratoId);
                const imo = c ? imoveis.find(i => i.id === c.imovelId) : null;
                const local = imo ? `${imo.empreendimento}${imo.enderecoRua ? ' - ' + imo.enderecoRua : ''}` : '';
                return { id: m.id, nome: c ? c.locatario : '(sem contrato)', ctx: `Ref ${m.referencia}${local ? ' · ' + local : ''}`, valor: m.valorConfirmado };
            }).sort((a, b) => a.nome.localeCompare(b.nome));

            const valorAbs = Math.abs(parseFloat(f.valor)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            const corpoLista = abertas.length
                ? abertas.map(l => `<div class="rz-row rz-link" data-txt="${rzEsc(l.nome.toLowerCase())}" onclick="selecionarMensalidadeManual('${fingerprintId}','${l.id}')"><div class="rz-ic"><svg data-lucide="file-text"></svg></div><div class="rz-tx"><b>${rzEsc(l.nome)}</b><span>${rzEsc(l.ctx)}</span></div><div class="rz-rt"><b>R$ ${Number(l.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</b></div></div>`).join('')
                : '<p style="font-size:13px;color:var(--sage);padding:8px 0">Nenhum recebimento em aberto no momento.</p>';

            abrirSheet(rzSheetCabecalho('Vincular a um recebimento', `${limparRotuloConciliacao(f.razao_social)} · R$ ${valorAbs} · ${formatarDataBR(f.data)}`) +
                `<div class="rz-sh-b">
                    <div class="rz-f"><label>Buscar locatário</label><input id="vm-busca" oninput="filtrarVincularManual(this.value)" placeholder="Nome do locatário"></div>
                    <div class="rz-card rz-list"><div id="vm-lista">${corpoLista}</div></div>
                </div>`);
        }

        export function filtrarVincularManual(termo) {
            const t = (termo || '').toLowerCase();
            document.querySelectorAll('#vm-lista .rz-row').forEach(r => r.classList.toggle('hidden', !r.dataset.txt.includes(t)));
        }

        export function selecionarMensalidadeManual(fingerprintId, mensalidadeId) {
            const f = conciliacaoUniCache.find(x => x.id === fingerprintId);
            if (f) confirmarVincularConciliacaoRecebimento(fingerprintId, mensalidadeId, f);
        }

        async function confirmarVincularConciliacaoSaida(fingerprintId, lancamentoId) {
            fecharSheet();
            mostrarCarregamentoGlobal('Vinculando…');
            try {
                const { error } = await dbAuth.rpc('fn_extrato_vincular_saida', { p_fingerprint_id: fingerprintId, p_lancamento_id: lancamentoId });
                if (error) throw error;
                await dbAuth.from('extrato_fingerprints').update({ canal: 'app' }).eq('id', fingerprintId);
                // v1.178.8 — achado do Nicola: abrir uma despesa já
                // conciliada caía no formulário de "nova" — abrirEditarDespesa
                // busca em `lancamentos` (array em memória), que nunca era
                // recarregado depois de vincular/criar saída aqui.
                lancamentos = await carregarLancamentosSupabase();
                // v1.17.0 (Fase 1 do wrapper de escrita) — ver changelog do topo.
                emitirEscrita('conciliacao', { id: fingerprintId, acao: 'vincular_saida', lancamentoId });
                esconderCarregamentoGlobal(); mostrarToast('Vinculado!', 'success');
                registrarLog('conciliacao.vincular_saida', { fingerprintId, lancamentoId });
                await carregarConciliacaoUnificada();
            } catch (err) { esconderCarregamentoGlobal(); mostrarToast('Erro: ' + err.message, 'danger'); }
        }

        async function confirmarCriarSaidaConciliacao(fingerprintId, categoria, descricao) {
            fecharSheet();
            mostrarCarregamentoGlobal('Criando saída…');
            try {
                const { error } = await dbAuth.rpc('fn_extrato_criar_saida', { p_fingerprint_id: fingerprintId, p_categoria: categoria, p_descricao: descricao || null });
                if (error) throw error;
                await dbAuth.from('extrato_fingerprints').update({ canal: 'app' }).eq('id', fingerprintId);
                lancamentos = await carregarLancamentosSupabase();
                // v1.17.0 (Fase 1 do wrapper de escrita) — ver changelog do topo.
                emitirEscrita('conciliacao', { id: fingerprintId, acao: 'criar_saida' });
                esconderCarregamentoGlobal(); mostrarToast('Saída criada!', 'success');
                registrarLog('conciliacao.criar_saida', { fingerprintId, categoria });
                await carregarConciliacaoUnificada();
            } catch (err) { esconderCarregamentoGlobal(); mostrarToast('Erro: ' + err.message, 'danger'); }
        }

        function abrirFormNaoControlarConciliacao(fingerprintId) {
            abrirSheetForm({
                titulo: 'Não controlar', sub: 'A linha do banco continua guardada',
                corpo: `<div class="mb-1"><label class="block text-xs font-bold text-gray-600">Observação (opcional)</label><textarea id="nc-obs" rows="2" class="w-full p-2 border rounded text-sm mt-1"></textarea></div>`,
                rotuloSalvar: 'Confirmar',
                aoSalvar: () => { confirmarNaoControlarConciliacao(fingerprintId, document.getElementById('nc-obs').value); return false; },
            });
        }

        async function confirmarNaoControlarConciliacao(fingerprintId, observacao) {
            fecharSheet();
            mostrarCarregamentoGlobal('Salvando…');
            try {
                const { error } = await dbAuth.rpc('fn_extrato_marcar_nao_controlado', { p_fingerprint_id: fingerprintId, p_observacao: observacao || null });
                if (error) throw error;
                await dbAuth.from('extrato_fingerprints').update({ canal: 'app' }).eq('id', fingerprintId);
                // v1.17.0 (Fase 1 do wrapper de escrita) — ver changelog do topo.
                emitirEscrita('conciliacao', { id: fingerprintId, acao: 'nao_controlado' });
                esconderCarregamentoGlobal(); mostrarToast('Marcado como não controlado.', 'success');
                registrarLog('conciliacao.nao_controlado', { fingerprintId });
                await carregarConciliacaoUnificada();
            } catch (err) { esconderCarregamentoGlobal(); mostrarToast('Erro: ' + err.message, 'danger'); }
        }

        // v1.6.0 — Etapa 8: exportada — agora também chamada via onclick=""
        // (string HTML, escopo global) na linha "Automática" da lista, além
        // do aoTocar de sempre (closure de módulo, não precisava de export).
        export async function confirmarEstornarConciliacaoSaida(fingerprintId) {
            fecharSheet();
            if (!await rzConfirmar({ titulo: 'Estornar conciliação', impacto: 'Se a despesa foi criada a partir desta linha, ela some; se já existia, volta para prevista.', rotuloConfirmar: 'Estornar' })) return;
            (async () => {
                mostrarCarregamentoGlobal('Estornando…');
                try {
                    const { error } = await dbAuth.rpc('fn_extrato_estornar_vinculo', { p_fingerprint_id: fingerprintId });
                    if (error) throw error;
                    // v1.17.0 (Fase 1 do wrapper de escrita) — ver changelog do topo.
                    emitirEscrita('conciliacao', { id: fingerprintId, acao: 'estornar' });
                    esconderCarregamentoGlobal(); mostrarToast('Estornado.', 'success');
                    registrarLog('conciliacao.estornar_saida', { fingerprintId });
                    await carregarConciliacaoUnificada();
                } catch (err) { esconderCarregamentoGlobal(); mostrarToast('Erro: ' + err.message, 'danger'); }
            })();
        }

        export async function excluirLancamentoMensal(menId) {

            const men = mensalidades.find(m => m.id === menId);

            // CORRIGIDO (v1.39.4) — mesmo problema de id desatualizado do
            // liquidarMensalidade (ver saveAll). Antes só dava "return"
            // silencioso; agora autocorrige e avisa.
            if (!men) {
                mostrarToast('Essa linha estava desatualizada — lista atualizada, tenta de novo.', 'danger');
                renderMensalidades();
                return;
            }

            if (men.status !== 'Inadimplente') {

                rzToast('Só dá para excluir o que ainda não foi recebido. Para reverter uma baixa, use "Estornar".', { tipo: 'info' });

                return;

            }

            if (!await rzConfirmar({ titulo: 'Excluir recebimento', impacto: 'O recebimento pendente some do Financeiro. Não dá para desfazer.', destrutivo: true, rotuloConfirmar: 'Excluir recebimento' })) return;

            // CORRIGIDO (v1.39.4) — antes o delete() disparava SEM await (fire
            // and forget) e o código seguia em frente imediatamente, sem saber
            // se deu certo. Se desse erro, o item já tinha sumido da tela
            // (removido do array logo depois) e da lista local salva — ou
            // seja, o usuário via "excluído com sucesso" mesmo se a exclusão
            // real no banco tivesse falhado. Agora aguarda a confirmação do
            // banco antes de tirar da tela.
            mostrarCarregamentoGlobal("Excluindo...");
            try {
                const { error } = await dbAuth.from('mensalidades').delete().eq('id', menId);
                if (error) throw error;

                mensalidades = mensalidades.filter(m => m.id !== menId);
                registrarLog('mensal.excluir', { mensalidadeId: menId, referencia: men.referencia });
                localStorage.setItem(chaveLocal('mensalidades'), JSON.stringify(mensalidades));
                // v1.17.0 (Fase 1 do wrapper de escrita) — ver changelog do topo.
                emitirEscrita('mensalidade', { id: menId, acao: 'excluir' });

                esconderCarregamentoGlobal();
                mostrarToast("Lançamento excluído.", 'success');
                renderMensalidades();
                renderInadimplencia();
                renderSociosDistribricao();
                renderRelatorios();
            } catch (err) {
                esconderCarregamentoGlobal();
                rzToast('Não consegui excluir: ' + err.message, { tipo: 'danger' });
                logScreen('Erro ao excluir mensalidade: ' + err.message, true);
            }

        }

        // ENTREGA F.3 (21/09/2026) — perdeu o <select> de competência (ver
        // nota grande no topo do arquivo): a lista agora lê
        // financeiroCompetenciaAtual direto, sem popular opção nenhuma pra
        // isso. Locatário/Empreendimento/Imóvel continuam como antes.
        export function popularFiltrosMensal() {

            const selLoc = document.getElementById('men-filtro-locatario');

            const selImo = document.getElementById('men-filtro-imovel');

            const selEmp = document.getElementById('men-filtro-empreendimento');

            if (!selLoc || !selImo) return;

            const valLoc = selLoc.value || 'todos';

            const valImo = selImo.value || 'todos';

            const locatarios = [...new Set(contratos.map(c => c.locatario))].sort();

            selLoc.innerHTML = '<option value="todos">Todos</option>' + locatarios.map(l => `<option value="${l}">${l}</option>`).join('');

            // CORRIGIDO — "men-filtro-imovel" agora é o mesmo seletor customizado
            // usado em Contrato/Métricas (input escondido + botão), não precisa
            // mais reconstruir opções aqui.
            if (selEmp) popularFiltroSelect('men-filtro-empreendimento', imoveis.map(i => i.empreendimento));

            // Restaura a seleção anterior (o padrão inicial já é "todos" via option acima).

            selLoc.value = locatarios.includes(valLoc) ? valLoc : 'todos';

            selImo.value = imoveis.some(i => i.id === valImo) ? valImo : 'todos';

            const imoSelecionadoMen = imoveis.find(i => i.id === selImo.value);
            const resumoBtnMen = document.getElementById('men-filtro-imovel-resumo');
            if (resumoBtnMen) resumoBtnMen.textContent = imoSelecionadoMen
                ? `[${imoSelecionadoMen.empreendimento || '-'}] ${imoSelecionadoMen.enderecoRua || ''}, ${imoSelecionadoMen.enderecoNum || ''}`
                : 'Todos';

        }

        // v1.6.5 — rzAcoesRecebimentos() removida (achado do Nicola): o "+"
        // que a chamava saiu de Recebimentos — Importar/Reprocessar/Painel
        // de conciliação (o menu que ela abria) ficaram redundantes com a
        // aba própria de Conciliação. "Gerar mês" já tinha saído antes
        // (v1.177.0, Etapa 7).

        export function rzAcoesMensalidade(menId) {
            const men = mensalidades.find(m => m.id === menId); if (!men || typeof abrirSheetAcoes !== 'function') return;
            const con = contratos.find(c => c.id === men.contratoId) || {};
            // v1.10.0 (18/09/2026, rodada 10) — imóvel e banco saíram da
            // linha da lista (renderMensalidades acima, achado "muito texto
            // na frente da data") e entram aqui, no sub do sheet que abre
            // ao tocar no item — "ao clicar, aí sim maiores informações".
            const imo = imoveis.find(i => i.id === con.imovelId);
            const localImovel = imo ? `${imo.empreendimento || ''} · ${imo.enderecoRua || ''}, ${imo.enderecoNum || ''}` : '';
            const sub = `${con.locatario || ''} · ${men.referencia}${localImovel ? ' · ' + localImovel : ''}${men.banco ? ' · ' + men.banco : ''}`;
            if (men.status === 'Pago') {
                const acoesPago = [
                    { icone: 'receipt', titulo: 'Recibo', sub: 'Gerar ou reenviar', codigo: 'recibo.gerar', aoTocar: () => abrirModalOpcoesRecibo(men.id, con.id) },
                ];
                // v1.23.0 (Fase 6 fiscal) — status fiscal do recebimento no
                // subtítulo; o toque abre a tela Fiscal da competência já nas
                // ações dele. Só com a rotina fiscal ligada (mesma regra do botão).
                if (window.RZ_FIN_FISCAL?.ligada && typeof window.abrirFiscalCompetencia === 'function') {
                    const ROTULO_FISCAL = { a_preparar: 'A preparar', falta_dado: 'Falta dado para a nota', preparada: 'Rascunho preparado',
                        com_contador: 'Com o contador', emitida: 'Nota emitida', sem_nota: 'Não gera nota', aguardando_recebimento: 'Aguardando pagamento' };
                    const stFiscal = window.RZ_FIN_FISCAL_REC ? window.RZ_FIN_FISCAL_REC[men.id] : null;
                    acoesPago.push({ icone: 'file-check-2', titulo: 'Nota fiscal', sub: ROTULO_FISCAL[stFiscal] || 'Preparar, ver ou registrar a NFS-e',
                                     aoTocar: () => window.abrirFiscalCompetencia(window.RZ_FIN_COMPETENCIA || null, men.id) });
                }
                // CORRIGIDO v1.15.0 (REGRAS §11.1, achado nesta mesma
                // entrega) — competência fechada permite só "gerar recibo e
                // ver detalhes, nunca alterar" (pedido explícito). O trigger
                // fn_trg_bloquear_edicao_competencia_fechada já barra a
                // GRAVAÇÃO de Estornar/incluir_contabilidade no banco; sem
                // este `if`, o menu continuava oferecendo as duas ações como
                // se fossem dar certo, só falhando (com um erro cru) depois
                // do toque. window.RZ_FIN_COMPETENCIA_FECHADA vem de
                // fechamento.js (ponte, módulos isolados).
                const compFechada = typeof window !== 'undefined' && window.RZ_FIN_COMPETENCIA_FECHADA === true;
                if (!compFechada) {
                    acoesPago.push({ icone: 'undo-2', titulo: 'Estornar', sub: 'Volta pra "a receber"', tipo: 'bad', codigo: 'mensal.estornar', aoTocar: () => estornarMensalidade(men.id) });
                    // v1.24.0 (demanda d92a6dfc) — correção pós-baixa de
                    // bruto/taxa/líquido, com motivo obrigatório e
                    // auditoria (fn_mensalidade_valores_ajustar); mesma
                    // trava de competência fechada das ações acima.
                    acoesPago.push({ icone: 'sliders-horizontal', titulo: 'Ajustar valores', sub: 'Bruto, taxa e líquido — fica registrado o motivo', codigo: 'mensal.baixar', aoTocar: () => abrirAjusteValoresMensalidade(men.id) });
                }
                // v1.179.5 — pedido do Nicola: "Resumo da conciliação" em
                // todo item conciliado, não só na aba Conciliação — só
                // aparece quando esta mensalidade veio de fato de uma
                // conciliação (chaveTransacaoOrigem só é setado por
                // fn_extrato_vincular_recebimento; "Dar baixa" manual pelo
                // formulário não passa por ali, não tem o que resumir).
                if (men.chaveTransacaoOrigem) {
                    acoesPago.push({ icone: 'info', titulo: 'Resumo da conciliação', sub: 'Data, origem, modo e canal', aoTocar: () => abrirResumoConciliacaoPorDestino('mensalidade', men.id) });
                }
                // Entrega F.3/F.4 (21/09/2026, pedido explícito) — todo item
                // baixado entra no pacote do contador por padrão; esta ação
                // permite desmarcar (ou remarcar) 1 item, controlada pela
                // funcionalidade financeiro.contabilidade_ajustar (ACE-03) —
                // rzMostrarBloqueio(a.codigo) barra sozinho quem não tem
                // acesso, mesmo padrão das outras ações com `codigo`. Some
                // com a competência fechada (ver comentário acima).
                if (!compFechada) {
                    acoesPago.push({
                        icone: men.incluirContabilidade === false ? 'plus-circle' : 'ban',
                        titulo: men.incluirContabilidade === false ? 'Incluir na contabilidade' : 'Não incluir na contabilidade',
                        sub: 'Controla o pacote enviado ao contador no fechamento',
                        codigo: 'financeiro.contabilidade_ajustar',
                        aoTocar: () => alternarIncluirContabilidade('mensalidade', men.id),
                    });
                }
                acoesPago.push(...financeiroAcaoConta('mensalidade', men.id, men.contaId, (v) => { men.contaId = v; renderMensalidades(); })); // v1.33.0
                acoesPago.push(...financeiroAcaoDivisao('mensalidade', men.id, Number(men.valorConfirmado ?? men.valor ?? 0), men.divisaoAjustada, (aj) => { men.divisaoAjustada = aj; renderMensalidades(); })); // v1.35.0
                abrirSheetAcoes({ titulo: 'Recebimento', sub, acoes: acoesPago });
                return;
            }
            const emAtraso = mensalidadeEmAtraso(men);
            const valorMen = Number(men.valorConfirmado ?? men.valor ?? 0);
            abrirSheetAcoes({ titulo: emAtraso ? 'Em atraso' : 'A receber', sub, acoes: [
                { icone: 'check', titulo: 'Dar baixa', sub: 'Registrar o recebimento', codigo: 'mensal.baixar', aoTocar: () => rzAbrirBaixaMensalidade(men.id) },
                ...(emAtraso ? [{ icone: 'message-circle', titulo: 'Cobrar pelo WhatsApp', sub: 'Mensagem ao locatário, com o Pix da empresa', codigo: 'cobrar.lembrete',
                    aoTocar: () => dispararCobrancaWhatsAppDirect(con.whatsapp, `Locatário: ${con.locatario || ''}`, `- Competência ${men.referencia}: R$ ${valorMen.toLocaleString('pt-BR')}`, valorMen) }] : []),
                ...financeiroAcaoConta('mensalidade', men.id, men.contaId, (v) => { men.contaId = v; renderMensalidades(); }), // v1.33.0
                ...financeiroAcaoDivisao('mensalidade', men.id, valorMen, men.divisaoAjustada, (aj) => { men.divisaoAjustada = aj; renderMensalidades(); }), // v1.35.0
                { icone: 'trash-2', titulo: 'Excluir lançamento', tipo: 'bad', codigo: 'mensal.excluir', aoTocar: () => excluirLancamentoMensal(men.id) },
            ] });
        }

        export function rzAbrirBaixaMensalidade(menId) {
            const men = mensalidades.find(m => m.id === menId); if (!men || typeof abrirSheetForm !== 'function') return;
            const con = contratos.find(c => c.id === men.contratoId) || {};
            const imo = imoveis.find(i => i.id === con.imovelId);
            const partesRef = men.referencia.split('/');
            const diaVenc = con.vencimentoDia || 15;
            const dataPadrao = `${partesRef[1]}-${partesRef[0]}-${diaVenc < 10 ? '0' + diaVenc : diaVenc}`;
            const temEnergia = imo?.energiaRumo === 'Sim';
            // v1.24.0 — bruto/taxa vêm do que a geração mensal já calculou
            // (fn_gerar_mensalidades_competencia grava os 3 desde a Fase 2
            // fiscal); sem administradora os 2 são iguais ao líquido.
            const bruto0 = men.valorBruto != null ? men.valorBruto : (men.valorConfirmado || 0);
            const taxa0 = men.valorTaxaAdm || 0;
            // mesmos ids que liquidarMensalidade() lê — o sheet vive no <body>
            const corpo = `
                <div class="rz-f2">
                    <div class="rz-f"><label>Forma de recebimento</label><select id="banco-${men.id}"><option value="PIX">PIX</option><option value="Boleto">Boleto</option><option value="Dinheiro">Dinheiro</option><option value="Transferência">Transferência</option><option value="Cheque">Cheque</option></select></div>
                    <div class="rz-f"><label>Data do recebimento <i>*</i></label><input type="date" id="data-${men.id}" value="${dataPadrao}"></div>
                </div>
                <div class="rz-group" style="margin-top:4px">Valores</div>
                <div class="rz-f2">
                    <div class="rz-f"><label>Aluguel bruto (R$)</label><input type="number" step="0.01" id="bruto-${men.id}" value="${bruto0}" oninput="recalcularValoresBaixaBruto('${men.id}','bruto')"></div>
                    <div class="rz-f"><label>Taxa da administradora (R$)</label><input type="number" step="0.01" id="taxa-${men.id}" value="${taxa0}" oninput="recalcularValoresBaixaBruto('${men.id}','taxa')"></div>
                </div>
                <div class="rz-f2">
                    <div class="rz-f"><label>Líquido recebido (R$) <i>*</i></label><input type="number" step="0.01" id="valor-${men.id}" value="${men.valorConfirmado || 0}" oninput="recalcularValoresBaixaBruto('${men.id}','liquido')"></div>
                    <div class="rz-f"><label>Observação interna</label><input type="text" id="obs-${men.id}" placeholder="Ex.: desconto"></div>
                </div>
                <span class="rz-hint">Sem administradora, taxa é 0 e o líquido é igual ao bruto.</span>
                <div class="rz-group" style="margin-top:4px">Extras</div>
                <div class="rz-f2">
                    ${temEnergia ? `<div class="rz-f"><label>Energia (R$)</label><input type="number" step="0.01" id="energia-${men.id}" value="0"></div>` : ''}
                    <div class="rz-f"><label>Multa / juros (R$)</label><input type="number" step="0.01" id="multa-${men.id}" value="0" data-multa-anterior="0" oninput="recalcularTotalBaixaExtra('${men.id}')"></div>
                </div>`;
            abrirSheetForm({ titulo: 'Dar baixa', sub: `${con.locatario || ''} · ${men.referencia} · ${formatarMoedaBR(men.valorConfirmado)}`, corpo, rotuloSalvar: 'Confirmar recebimento',
                aoSalvar: async () => (await liquidarMensalidade(men.id)) });
        }

        // v1.24.0 (demanda d92a6dfc) — correção de bruto/taxa/líquido de um
        // recebimento JÁ pago (⋮ "Ajustar valores"). Diferente do Dar baixa
        // (gravação direta): passa por fn_mensalidade_valores_ajustar, que
        // exige motivo, grava histórico (mensalidade_valores_historico) e
        // respeita o mesmo trigger de competência fechada da tabela.
        export function abrirAjusteValoresMensalidade(menId) {
            const men = mensalidades.find(m => m.id === menId); if (!men || typeof abrirSheetForm !== 'function') return;
            const con = contratos.find(c => c.id === men.contratoId) || {};
            const bruto0 = men.valorBruto != null ? men.valorBruto : (men.valorConfirmado || 0);
            const taxa0 = men.valorTaxaAdm || 0;
            const corpo = `
                <div class="rz-f2">
                    <div class="rz-f"><label>Aluguel bruto (R$) <i>*</i></label><input type="number" step="0.01" id="aj-bruto-${men.id}" value="${bruto0}" oninput="recalcularAjusteValores('${men.id}','bruto')"></div>
                    <div class="rz-f"><label>Taxa da administradora (R$)</label><input type="number" step="0.01" id="aj-taxa-${men.id}" value="${taxa0}" oninput="recalcularAjusteValores('${men.id}','taxa')"></div>
                </div>
                <div class="rz-f"><label>Líquido recebido (R$) <i>*</i></label><input type="number" step="0.01" id="aj-liquido-${men.id}" value="${men.valorConfirmado || 0}" oninput="recalcularAjusteValores('${men.id}','liquido')"></div>
                <div class="rz-f"><label>Motivo do ajuste <i>*</i></label><textarea id="aj-motivo-${men.id}" rows="2" maxlength="300" placeholder="Ex.: taxa da administradora veio diferente do previsto"></textarea>
                    <span class="rz-hint">Fica registrado no histórico deste recebimento.</span></div>`;
            abrirSheetForm({
                titulo: 'Ajustar valores', sub: `${con.locatario || ''} · ${men.referencia} · ${formatarMoedaBR(men.valorConfirmado)}`,
                corpo, rotuloSalvar: 'Salvar ajuste',
                aoSalvar: async () => {
                    const bruto = parseFloat(document.getElementById(`aj-bruto-${men.id}`)?.value);
                    const taxa = parseFloat(document.getElementById(`aj-taxa-${men.id}`)?.value) || 0;
                    const liquido = parseFloat(document.getElementById(`aj-liquido-${men.id}`)?.value);
                    const motivo = (document.getElementById(`aj-motivo-${men.id}`)?.value || '').trim();
                    if (isNaN(bruto) || isNaN(liquido)) { mostrarToast('Preencha bruto e líquido.', 'info'); return false; }
                    if (!motivo) { mostrarToast('Informe o motivo do ajuste.', 'info'); return false; }
                    const { data, error } = await dbAuth.rpc('fn_mensalidade_valores_ajustar', {
                        p_mensalidade_id: men.id, p_valor_bruto: bruto, p_valor_taxa_adm: taxa, p_valor_confirmado: liquido,
                        p_motivo: motivo, p_pessoa_id: (typeof pessoaIdLogada !== 'undefined' ? pessoaIdLogada : null), p_canal: 'app',
                        p_acao: 'ajuste_pos_baixa',
                    });
                    if (error) { rzToast('Não consegui ajustar: ' + error.message, { tipo: 'danger' }); return false; }
                    const idx = mensalidades.findIndex(m => m.id === men.id);
                    if (idx !== -1) {
                        mensalidades[idx].valorBruto = data?.valor_bruto ?? bruto;
                        mensalidades[idx].valorTaxaAdm = data?.valor_taxa_adm ?? taxa;
                        mensalidades[idx].valorConfirmado = data?.valor_confirmado ?? liquido;
                        mensalidades[idx].valorBrutoEstimado = false;
                    }
                    mostrarToast('Valores ajustados.', 'success');
                    renderMensalidades();
                    return true;
                },
            });
        }

        // v1.24.0 — mesmo recálculo do Dar baixa, com os ids "aj-" do sheet
        // de "Ajustar valores".
        export function recalcularAjusteValores(menId, origem) {
            const inputBruto = document.getElementById('aj-bruto-' + menId);
            const inputTaxa = document.getElementById('aj-taxa-' + menId);
            const inputLiquido = document.getElementById('aj-liquido-' + menId);
            if (!inputBruto || !inputTaxa || !inputLiquido) return;
            const bruto = parseFloat(inputBruto.value) || 0;
            const taxa = parseFloat(inputTaxa.value) || 0;
            const liquido = parseFloat(inputLiquido.value) || 0;
            if (origem === 'liquido') {
                inputTaxa.value = Math.max(0, bruto - liquido).toFixed(2);
            } else {
                inputLiquido.value = Math.max(0, bruto - taxa).toFixed(2);
            }
        }

        // v1.178.8 — rzAcoesGrupoMensal() removida junto (achado do Nicola —
        // era o único trigger do menu que só tinha "apagar atrasados").

        // v1.178.9 — achado do Nicola: chips de status em Recebimentos,
        // mesmo padrão .rz-chip de Partes/Conciliação.
        export function renderChipsMensal(filtradas) {
            const wrap = document.getElementById('mensal-chips-status');
            if (!wrap) return;
            const statusMen = (men) => men.status === 'Pago' ? 'pago' : mensalidadeEmAtraso(men) ? 'atrasado' : 'a_vencer';
            const contagem = { todos: filtradas.length, pago: 0, atrasado: 0, a_vencer: 0 };
            filtradas.forEach(men => { contagem[statusMen(men)]++; });
            const chips = [
                { chave: 'todos', rotulo: 'Todos', n: contagem.todos },
                { chave: 'pago', rotulo: 'Pagos', n: contagem.pago },
                { chave: 'a_vencer', rotulo: 'A vencer', n: contagem.a_vencer },
                { chave: 'atrasado', rotulo: 'Em atraso', n: contagem.atrasado },
            ];
            wrap.innerHTML = chips.map(c => `<button type="button" onclick="filtrarMensalPorChip('${c.chave}')" class="rz-chip ${mensalChipStatus === c.chave ? 'rz-on' : ''}">${c.rotulo} <span class="rz-n">${c.n}</span></button>`).join('') + financeiroChipContaHtml(); // v1.33.0
        }

        export function filtrarMensalPorChip(chave) {
            mensalChipStatus = chave;
            renderMensalidades();
        }

        export function renderMensalidades() {
            const container = document.getElementById('lista-mensalidades');
            if (!container) return;

            popularFiltrosMensal();

            const fLoc = document.getElementById('men-filtro-locatario')?.value || 'todos';
            const fImo = document.getElementById('men-filtro-imovel')?.value || 'todos';
            const fEmp = document.getElementById('men-filtro-empreendimento')?.value || 'todos';

            // v1.55.0 — NOVO: busca por texto livre (endereço/locatário/
            // bairro), mesmo padrão de Imóveis.
            const termoBuscaMen = (document.getElementById('men-busca-texto')?.value || '').trim().toLowerCase();

            // ENTREGA F.3 (21/09/2026 — achado do Nicola: com o card de
            // competência no topo, a lista não precisa mais do próprio
            // filtro/agrupamento por mês) — mostra só a competência do card
            // (financeiroCompetenciaAtual), a mesma que alimenta os 4 KPIs
            // (ver nota grande no topo do arquivo). O <select> escondido
            // (men-filtro-competencia) e o agrupamento colapsável
            // (gruposMensalAbertos/alternarGrupoMensal) saíram.
            const compAtualRef = dataParaCompetencia(financeiroCompetenciaAtual || financeiroCompetenciaHojeISO());

            const filtradas = mensalidades.filter(men => {
                if (men.referencia !== compAtualRef) return false;
                if (financeiroContaFiltro && men.contaId !== financeiroContaFiltro) return false; // v1.33.0
                const con = contratos.find(c => c.id === men.contratoId);
                if (!con) return false;
                if (fLoc !== 'todos' && con.locatario !== fLoc) return false;
                if (fImo !== 'todos' && con.imovelId !== fImo) return false;
                const imo = imoveis.find(i => i.id === con.imovelId);
                if (fEmp !== 'todos') {
                    if (!imo || imo.empreendimento !== fEmp) return false;
                }
                if (termoBuscaMen) {
                    const campos = [con.locatario, imo?.enderecoRua, imo?.enderecoNum, imo?.enderecoBairro, imo?.enderecoCidade, imo?.empreendimento];
                    if (!campos.some(c => (c || '').toString().toLowerCase().includes(termoBuscaMen))) return false;
                }
                return true;
            });

            // v1.178.9 — achado do Nicola: chips de status. Conta em cima do
            // que já passou pelos outros filtros (locatário/imóvel/busca),
            // sem o chip — senão o próprio chip escondia sua opção
            // "vizinha" da contagem. Aplica o chip DEPOIS de contar.
            renderChipsMensal(filtradas);
            const statusMen = (men) => men.status === 'Pago' ? 'pago' : mensalidadeEmAtraso(men) ? 'atrasado' : 'a_vencer';
            const filtradasComChip = mensalChipStatus === 'todos' ? filtradas : filtradas.filter(men => statusMen(men) === mensalChipStatus);

            // ENTREGA F.1 (21/09/2026) — os 4 KPIs (Previsto/Recebido/Em
            // atraso/A receber) SAÍRAM daqui: vêm de
            // fn_financeiro_totalizadores, escopados pela competência do
            // card do topo, via financeiroAtualizarKpis('mensal').

            if (!filtradasComChip.length) {
                container.innerHTML = `<p class="text-xs text-center py-8" style="color:var(--sage)">Nenhum recebimento encontrado.</p>`;
                return;
            }

            // v1.114.0 (FATIA 5 da gramática única, REGRAS §9/§10/§11) — cada
            // mensalidade é uma .rz-row com status nas 5 semânticas (Pago ok ·
            // Em atraso bad · A vencer run). O TOQUE na linha abre o sheet de
            // ações do lançamento (rzAcoesMensalidade): Dar baixa (sheet de
            // formulário com os MESMOS ids banco-/data-/valor-/obs-/energia-/
            // multa-/taxa-admin-${id}, então liquidarMensalidade() não mudou)
            // · Excluir; pago → Recibo · Estornar.
            const rsM = (sem, t) => (typeof renderStatus === 'function') ? renderStatus(sem, t) : `<span class="rz-st rz-${sem}">${t}</span>`;
            // v1.10.0 (18/09/2026, rodada 10 — achado do Nicola: "continua
            // muito texto na frente da data, deve ter apenas a data") —
            // status (Pago/Em atraso/A vencer) já está no badge à direita
            // (rsM), não precisa repetir em texto. dataVencMensal() cobre o
            // caso sem dataPgto ainda gravada: monta a data de vencimento de
            // verdade a partir de referencia (MM/YYYY) + vencimentoDia do
            // contrato, em vez do texto cru "dia N" (sem mês/ano).
            const dataVencMensal = (m, con) => {
                if (m.dataPgto) return formatarDataBR(m.dataPgto);
                const p = (m.referencia || '').split('/');
                return p.length === 2 ? `${String(con.vencimentoDia || 15).padStart(2, '0')}/${p[0]}/${p[1]}` : '';
            };
            // Entrega F.3/F.4 (21/09/2026, pedido explícito — "deve entrar
            // na aba de recebimento com status de baixado e suas
            // informações da conciliação, manual ou via extrato") — rótulo
            // curto de origem, direto na linha (detalhe completo — modo,
            // regra, canal — continua no toque, "Resumo da conciliação").
            const origemMensalHtml = (m) => {
                const partes = [];
                partes.push(m.chaveTransacaoOrigem ? 'Extrato' : 'Manual');
                if (m.incluirContabilidade === false) partes.push('Fora da contabilidade');
                return ' · ' + partes.join(' · ');
            };
            const itens = filtradasComChip.slice().sort((a, b) => {
                const conA = contratos.find(c => c.id === a.contratoId);
                const conB = contratos.find(c => c.id === b.contratoId);
                const imoA = conA ? imoveis.find(i => i.id === conA.imovelId) : null;
                const imoB = conB ? imoveis.find(i => i.id === conB.imovelId) : null;
                const empA = imoA ? imoA.empreendimento : '';
                const empB = imoB ? imoB.empreendimento : '';
                return empA.localeCompare(empB) || (conA?.locatario || '').localeCompare(conB?.locatario || '');
            });
            const linhas = itens.map(men => {
                const con = contratos.find(c => c.id === men.contratoId) || {};
                if (men.status === 'Pago') {
                    return `<div class="rz-row rz-link" onclick="rzAcoesMensalidade('${men.id}')">
                        <div class="rz-ic"><svg data-lucide="arrow-down-left"></svg></div>
                        <div class="rz-tx"><b>${escapeHtmlSaidas(con.locatario || 'Locatário')}</b><span>${dataVencMensal(men, con)}${origemMensalHtml(men)}${men.divisaoAjustada ? ' · divisão ajustada' : ''}</span></div>
                        <div class="rz-rt"><b>${formatarMoedaBR(men.valorConfirmado)}</b>${rsM('ok', 'Pago')}</div>
                        <svg data-lucide="ellipsis-vertical" class="rz-chev"></svg>
                    </div>`;
                }
                const atrasada = mensalidadeEmAtraso(men);
                // v1.179.3 — achado do Nicola: ícone por TIPO de recebimento
                // (entrada — mesma seta de sempre), não por status — status
                // já está na tag (rsM), não precisa repetir mudando a forma
                // do ícone. Cor ainda muda (rz-bad) quando atrasada, só a
                // forma que ficou fixa.
                return `<div class="rz-row rz-link" onclick="rzAcoesMensalidade('${men.id}')">
                    <div class="rz-ic${atrasada ? ' rz-bad' : ''}"><svg data-lucide="arrow-down-left"></svg></div>
                    <div class="rz-tx"><b>${escapeHtmlSaidas(con.locatario || 'Locatário')}</b><span>${dataVencMensal(men, con)}${men.divisaoAjustada ? ' · divisão ajustada' : ''}</span></div>
                    <div class="rz-rt"><b>${formatarMoedaBR(men.valorConfirmado)}</b>${atrasada ? rsM('bad', 'Em atraso') : rsM('run', 'A vencer')}</div>
                    <svg data-lucide="ellipsis-vertical" class="rz-chev"></svg>
                </div>`;
            }).join('');
            container.innerHTML = `<div class="rz-card rz-list">${linhas}</div>`;

            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        // v1.13.0 — alternarGrupoMensal() removida (Entrega F.3): a lista
        // deixou de agrupar por competência, não tem mais o que expandir/
        // recolher (ver nota grande no topo do arquivo).

        // v1.178.8 — rzAcoesGrupoMensal() e apagarInadimplentesDoGrupo()
        // removidas (achado do Nicola: "apagar lançamentos em atraso" no
        // menu da competência não faz sentido e atrapalha o padrão — era a
        // ÚNICA opção desse menu, então o ⋮ do grupo saiu junto).

        export function abrirModalOpcoesRecibo(menId, conId) {

            activeMenId = menId;

            activeConId = conId;

            const con = contratos.find(c => c.id === conId);

            const men = mensalidades.find(m => m.id === menId);

            if(!con || !men) return;

            const imo = imoveis.find(i => i.id === con.imovelId);

            const empName = imo ? imo.empreendimento : 'Patrimônio';

            // v1.121.0 — UI virou sheet da gramática (REGRAS §3/§16): faixa
            // de observações (mesmo id do campo, salvarObservacaoRecibo
            // intocada) + 4 ações. Toda a montagem do PDF abaixo continua
            // idêntica — o template oculto pdf-* não mudou.
            const sheetRecibo = abrirSheetAcoes({ titulo: 'Recibo de aluguel', sub: `${con.locatario} · ${men.referencia} (${empName})`, acoes: [
                { icone: 'eye', titulo: 'Visualizar na tela', aoTocar: () => dispararAcaoDoMenu('visualizar') },
                { icone: 'download', titulo: 'Gerar e baixar PDF', sub: 'Documento oficial com numeração', aoTocar: () => dispararAcaoDoMenu('pdf') },
                { icone: 'message-circle', titulo: 'Enviar pelo WhatsApp', aoTocar: () => dispararAcaoDoMenu('zap') },
                { icone: 'mail', titulo: 'Enviar por e-mail', aoTocar: () => dispararAcaoDoMenu('email') },
            ] });
            const corpoRecibo = sheetRecibo.querySelector('.rz-sh-b');
            if (corpoRecibo) corpoRecibo.insertAdjacentHTML('afterbegin', `
                <div style="margin-bottom:10px">
                    <label class="block text-xs font-bold text-gray-600">Observações do recibo (opcional)</label>
                    <p class="text-[10.5px] text-slate-500 mb-1">Completa a frase: <em>"Vale ressaltar que …"</em> · salva ao sair do campo.</p>
                    <textarea id="modal-recibo-observacoes" rows="2" onblur="salvarObservacaoRecibo()" placeholder="Ex: não foi cobrada a taxa de limpeza este mês" class="w-full p-2 border rounded text-sm"></textarea>
                </div>`);

            document.getElementById('pdf-locatario').innerText = con.locatario;

            document.getElementById('pdf-cpf').innerText = con.cpf;

            document.getElementById('pdf-valor').innerText = men.valorConfirmado.toLocaleString('pt-BR', {minimumFractionDigits:2});

            document.getElementById('pdf-extenso').innerText = valorPorExtenso(men.valorConfirmado);

            document.getElementById('pdf-endereco').innerText = imo ? `${imo.enderecoRua || ''}, ${imo.enderecoNum || ''} ${imo.enderecoComp ? ' - ' + imo.enderecoComp : ''}, ${imo.enderecoBairro || ''}, ${imo.enderecoCidade || ''}` : '';

            document.getElementById('pdf-mes').innerText = men.referencia;

            document.getElementById('pdf-data').innerText = formatarDataBR(men.dataPgto);

            if (men.observacaoRecibo && men.observacaoRecibo.trim() !== '') {

                document.getElementById('pdf-obs-texto').innerHTML = ` Vale ressaltar que ${men.observacaoRecibo}.`;

            } else {

                document.getElementById('pdf-obs-texto').innerHTML = '';

            }

            document.getElementById('pdf-data-emissao').innerText = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

            const campoObsRecibo = document.getElementById('modal-recibo-observacoes');
            if (campoObsRecibo) campoObsRecibo.value = men.observacaoRecibo || '';

            // Cidade impressa no recibo: vem da empresa ou do imóvel, conforme
            // escolhido em Parametrizações.
            const cidadeEmissao = document.getElementById('pdf-cidade-emissao');
            if (cidadeEmissao) {
                cidadeEmissao.textContent = (CONFIG_CLIENTE.cidadeReciboFonte === 'imovel' && imo && imo.enderecoCidade)
                    ? imo.enderecoCidade
                    : (CONFIG_CLIENTE.cidade || '');
            }

        }

        // Salva a observação DO RECIBO direto na mensalidade (campo separado da
        // observação interna — observacaoRecibo é o que sai impresso no
        // "Vale ressaltar que..." do recibo; observacao nunca aparece pro
        // locatário) — chamado ao sair do campo (onblur), sem precisar de um
        // botão de salvar separado.
        export function salvarObservacaoRecibo() {
            const men = mensalidades.find(m => m.id === activeMenId);
            if (!men) return;
            const novoTexto = (document.getElementById('modal-recibo-observacoes').value || '').trim();
            if (novoTexto === (men.observacaoRecibo || '')) return; // nada mudou, não gasta uma gravação à toa
            men.observacaoRecibo = novoTexto;
            document.getElementById('pdf-obs-texto').innerHTML = novoTexto ? ` Vale ressaltar que ${novoTexto}.` : '';
            // v1.17.0 (Fase 1 do wrapper de escrita) — saveAll aqui é
            // fire-and-forget (já era antes desta mudança); emite só depois
            // de confirmado (dentro do .then), ver changelog do topo.
            saveAll(true, "Observação do recibo salva.", ['mensalidades']).then(() => {
                emitirEscrita('recibo', { id: men.id, acao: 'observacao' });
            });
        }

        export function fecharModalOpcoes() { fecharSheet(); } // v1.121.0 — o modal virou sheet

        export function dispararAcaoDoMenu(opcao) {

            fecharModalOpcoes();

            if (opcao !== 'visualizar') {
                registrarLog('recibo.gerar', { mensalidadeId: activeMenId, contratoId: activeConId, canal: opcao });
            }

            if(opcao === 'visualizar') {

                document.getElementById('pdf-wrapper').classList.remove('hidden');

            } else if(opcao === 'pdf') {

                baixarArquivoPdfLocal();

            } else if(opcao === 'zap') {

                ejecutarCanalComunicação('zap');

            } else if(opcao === 'email') {

                ejecutarCanalComunicação('email');

            }

        }

        export function renderInadimplencia() {
            const container = document.getElementById('lista-inadimplencia');
            if(!container) return;
            container.innerHTML = '';
            
            const tipoAgrupamento = document.getElementById('inad-tipo-agrupamento').value;
            const fMes = document.getElementById('inad-filtro-mes').value || 'todos';
            const fAlvo = document.getElementById('inad-filtro-alvo').value || 'todos';
            // v1.55.0 — NOVO: busca por texto livre, mesmo padrão de
            // Imóveis/Financeiro.
            const termoBuscaInad = (document.getElementById('inad-busca-texto')?.value || '').trim().toLowerCase();
            let totalInad = 0;
            let totalLancadoGeral = 0;
            let totalEnergiaRecebida = 0;
            let itensPendentes = [];
            // CORRIGIDO (v1.63.0 — pedido explícito, 25/08/2026): esta aba é
            // de COBRANÇA de verdade (o botão "Cobrar Grupo" abaixo dispara
            // WhatsApp de notificação de débito pro locatário) — um
            // lançamento futuro (vencimento ainda não chegou) não pode
            // aparecer aqui como pendência, senão o app manda cobrança de
            // aluguel que ainda nem venceu. Itens "a vencer" são só
            // contados (avisoAVencerQtd/Valor), pra um aviso informativo,
            // nunca listados/cobrados nesta tela.
            let avencerQtd = 0, avencerValor = 0;
            mensalidades.forEach(men => {
                const con = contratos.find(c => c.id === men.contratoId);
                if(!con) return;
                
                totalLancadoGeral += men.valorConfirmado;
                
                if(fMes !== 'todos' && men.referencia !== fMes) return;
                if(fAlvo !== 'todos' && con.id !== fAlvo) return;
                const imoDaBusca = imoveis.find(i => i.id === con.imovelId);
                if (termoBuscaInad) {
                    const campos = [con.locatario, imoDaBusca?.enderecoRua, imoDaBusca?.enderecoNum, imoDaBusca?.enderecoBairro, imoDaBusca?.enderecoCidade, imoDaBusca?.empreendimento];
                    if (!campos.some(c => (c || '').toString().toLowerCase().includes(termoBuscaInad))) return;
                }
                if(mensalidadeEmAtraso(men)) {
                    totalInad += men.valorConfirmado;
                    const imo = imoveis.find(i => i.id === con.imovelId);
                    itensPendentes.push({ men, con, imo });
                } else if (men.status === 'Inadimplente') {
                    // Não pago, mas ainda não venceu — "a vencer", nunca
                    // cobrança. Fica de fora da lista e do total desta aba.
                    avencerQtd++;
                    avencerValor += men.valorConfirmado;
                } else if (men.valorEnergia > 0) {
                    // Energia é controle interno, à parte do aluguel — nunca soma nos
                    // indicadores de inadimplência/ocupação, apenas informativo aqui.
                    totalEnergiaRecebida += men.valorEnergia;
                }
            });
            document.getElementById('inad-total-geral').innerText = "R$ " + totalInad.toLocaleString('pt-BR', {minimumFractionDigits:2});
            const taxa = totalLancadoGeral > 0 ? ((totalInad / totalLancadoGeral) * 100).toFixed(1) : 0;
            document.getElementById('inad-taxa').innerText = taxa + "%";
            // v1.179.3 — achado do Nicola: aviso de "lançamentos futuros que
            // não entram aqui" removido — avencerQtd/avencerValor continuam
            // calculados (usados só pra excluir esses itens da lista/total
            // desta aba, não pra exibição).
            const energiaBox = document.getElementById('inad-energia-recebida');
            if (energiaBox) {
                if (totalEnergiaRecebida > 0) {
                    energiaBox.classList.remove('hidden');
                    energiaBox.innerText = `⚡ Energia recebida no período (controle interno, à parte do aluguel): R$ ${totalEnergiaRecebida.toLocaleString('pt-BR', {minimumFractionDigits:2})}`;
                } else {
                    energiaBox.classList.add('hidden');
                }
            }
            if(itensPendentes.length === 0) {
                container.innerHTML = `<p class="text-xs text-center text-gray-400 py-4">Nenhum débito em aberto localizado.</p>`;
                return;
            }
            // Ordena por empreendimento e locatário — dentro de cada locatário,
            // mantém a competência mais recente primeiro.
            itensPendentes.sort((a, b) => {
                const empA = a.imo ? a.imo.empreendimento : '';
                const empB = b.imo ? b.imo.empreendimento : '';
                const porEmpreendimento = empA.localeCompare(empB);
                if (porEmpreendimento !== 0) return porEmpreendimento;
                const porLocatario = (a.con.locatario || '').localeCompare(b.con.locatario || '');
                if (porLocatario !== 0) return porLocatario;
                const [ma, aa] = a.men.referencia.split('/');
                const [mb, ab] = b.men.referencia.split('/');
                return (ab + mb).localeCompare(aa + ma);
            });
            let groups = {};
            itensPendentes.forEach(item => {
                let chaveGrupo = '';
                if(tipoAgrupamento === 'competencia') chaveGrupo = `Competência: ${item.men.referencia}`;
                else if(tipoAgrupamento === 'locatario') chaveGrupo = `Locatário: ${item.con.locatario}`;
                else if(tipoAgrupamento === 'imovel') chaveGrupo = `Imóvel: ${item.imo ? item.imo.empreendimento : 'Não Vinculado'}`;
                if(!groups[chaveGrupo]) groups[chaveGrupo] = [];
                groups[chaveGrupo].push(item);
            });
            // v1.179.1 — primeira vez que renderiza, abre só o 1º grupo por
            // padrão (mesmo comportamento de gruposMensalAbertos/gruposSaidasAbertos).
            if (gruposInadimplenciaAbertos === null) {
                const primeiraChave = Object.keys(groups)[0];
                gruposInadimplenciaAbertos = new Set(primeiraChave ? [primeiraChave] : []);
            }
            for(let nomeGrupo in groups) {
                let subItensHtml = '';
                let totalGrupo = 0;
                let listaCobrancaAgrupada = [];
                let locatarioCelular = "";
                groups[nomeGrupo].forEach(item => {
                    totalGrupo += item.men.valorConfirmado;
                    listaCobrancaAgrupada.push(`- Competência ${item.men.referencia}: R$ ${item.men.valorConfirmado.toLocaleString('pt-BR')}`);
                    locatarioCelular = item.con.whatsapp;
                    // CORRIGIDO — mesmo padrão de endereço (com pin, número e
                    // complemento) já usado na aba Mensal, em vez de só a rua com
                    // o rótulo "Endereço:".
                    const localImovelInad = item.imo
                        ? `${item.imo.empreendimento || ''} - ${item.imo.enderecoRua || ''}, ${item.imo.enderecoNum || ''}${item.imo.enderecoComp ? ' - ' + item.imo.enderecoComp : ''}`
                        : '-';
                    // v1.114.0 (fatia 5) — .rz-row; toque abre o sheet do lançamento
                    // (Dar baixa · Excluir), igual à aba Recebimentos.
                    // v1.179.3 — mesmo ícone de tipo (arrow-down-left) que
                    // Recebimentos agora usa, por consistência — cor
                    // (rz-bad) já basta pra sinalizar atraso, sem precisar
                    // mudar a forma.
                    subItensHtml += `
                        <div class="rz-row rz-link" onclick="rzAcoesMensalidade('${item.men.id}')">
                            <div class="rz-ic rz-bad"><svg data-lucide="arrow-down-left"></svg></div>
                            <div class="rz-tx"><b>${escapeHtmlSaidas(item.con.locatario || 'Locatário')} · ${item.men.referencia}</b><span>${escapeHtmlSaidas(localImovelInad)}</span></div>
                            <div class="rz-rt"><b>${formatarMoedaBR(item.men.valorConfirmado)}</b>${(typeof renderStatus === 'function') ? renderStatus('bad', 'Em atraso') : ''}</div>
                            <svg data-lucide="ellipsis-vertical" class="rz-chev"></svg>
                        </div>`;
                });
                const descConsolidada = listaCobrancaAgrupada.join('\\n');
                // v1.41.0 (Fase 2) — "Cobrar Grupo" só faz sentido quando o
                // agrupamento é por Locatário (é o único caso em que o grupo
                // representa, de fato, tudo que uma mesma pessoa/empresa deve).
                // Nos demais agrupamentos (Mês/Competência, Empreendimento),
                // o cabeçalho do grupo fica só com o título, sem o botão —
                // formatação idêntica em qualquer agrupamento (sem variar
                // conforme o locatário).
                // v1.114.0 — "Cobrar pelo WhatsApp" (só no agrupamento por
                // locatário, como antes) vira o ⋮ do grupo → sheet. É a cobrança
                // via WhatsApp que já existia (dispararCobrancaWhatsAppDirect,
                // link wa.me), não o Robô.
                const rzIdGrupo = 'rz-inad-' + Math.random().toString(36).slice(2, 8);
                window.__rzCobrancaGrupo = window.__rzCobrancaGrupo || {};
                window.__rzCobrancaGrupo[rzIdGrupo] = { celular: locatarioCelular, titulo: nomeGrupo, itens: descConsolidada, total: totalGrupo };
                // v1.179.1 — achado do Nicola: agrupamento virou cortina
                // colapsável de verdade (chevron + toque no cabeçalho),
                // mesmo padrão das outras 3 abas — antes era só texto fixo,
                // sempre aberto, sem alternarGrupoInadimplencia().
                const grupoIdInad = 'grupo-inad-' + rzIdGrupo;
                const abertoInad = gruposInadimplenciaAbertos.has(nomeGrupo);
                container.innerHTML += `
                    <div class="rz-group" style="display:flex;align-items:center;gap:8px;cursor:pointer" onclick="alternarGrupoInadimplencia('${grupoIdInad}', '${nomeGrupo.replace(/'/g, "\\'")}')">
                        <span style="flex:1">${escapeHtmlSaidas(nomeGrupo)} · ${formatarMoedaBR(totalGrupo)}</span>
                        ${tipoAgrupamento === 'locatario' ? `<button type="button" onclick="event.stopPropagation(); rzAcoesGrupoInadimplencia('${rzIdGrupo}')" class="rz-more" aria-label="Mais ações" style="margin:0"><svg data-lucide="ellipsis-vertical"></svg></button>` : ''}
                        <svg data-lucide="chevron-down" id="${grupoIdInad}-seta" style="width:16px;height:16px;transform:rotate(${abertoInad ? '180' : '0'}deg)"></svg>
                    </div>
                    <div id="${grupoIdInad}" class="rz-card rz-list rz-critico ${abertoInad ? '' : 'hidden'}">${subItensHtml}</div>`;
            }
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        export function alternarGrupoInadimplencia(grupoId, nomeGrupo) {
            const el = document.getElementById(grupoId);
            const seta = document.getElementById(grupoId + '-seta');
            if (!el) return;
            el.classList.toggle('hidden');
            const aberto = !el.classList.contains('hidden');
            if (seta) seta.style.transform = `rotate(${aberto ? 180 : 0}deg)`;
            if (aberto) gruposInadimplenciaAbertos.add(nomeGrupo); else gruposInadimplenciaAbertos.delete(nomeGrupo);
        }

        export function rzAcoesGrupoInadimplencia(id) {
            const g = (window.__rzCobrancaGrupo || {})[id]; if (!g || typeof abrirSheetAcoes !== 'function') return;
            abrirSheetAcoes({ titulo: g.titulo, sub: `${formatarMoedaBR(g.total)} em aberto`, acoes: [
                { icone: 'message-circle', titulo: 'Cobrar pelo WhatsApp', codigo: 'cobrar.lembrete', sub: 'Abre a conversa com a lista de competências', aoTocar: () => dispararCobrancaWhatsAppDirect(g.celular, g.titulo, g.itens, g.total) },
            ] });
        }

        export async function dispararCobrancaWhatsAppDirect(celular, grupoTitle, itensText, valorTotal) {
            if (!celular || celular.length < 5) { rzToast('Celular do locatário não cadastrado.', { tipo: 'danger' }); return; }
            let pix = null;
            try {
                const { data } = await dbAuth.rpc('fn_pix_brcode_empresa', { p_cliente_id: CLIENTE_ID_SUPABASE, p_valor: Number(valorTotal) || 0 });
                pix = data || null;
            } catch (e) { console.warn('[financeiro] Pix da empresa:', e.message); }
            if (typeof abrirSheetForm !== 'function') return enviarCobrancaWhatsApp(celular, grupoTitle, itensText, valorTotal, null);
            abrirSheetForm({
                titulo: 'Cobrar pelo WhatsApp', sub: `${grupoTitle} · ${formatarMoedaBR(valorTotal)}`,
                rotuloSalvar: 'Abrir WhatsApp', rotuloCancelar: 'Cancelar',
                corpo: pix
                    ? `<label class="text-sm" style="display:flex;gap:10px;align-items:flex-start"><input type="checkbox" id="fin-cob-pix" checked style="margin-top:3px"><span><b>Incluir o Pix da empresa</b><br><span class="text-xs" style="color:var(--muted)">Chave ${(window.rzEsc||String)(pix.chave)} (${(window.rzEsc||String)(pix.nome)})${pix.brcode ? ' e Pix copia e cola com o valor total' : ''}.</span></span></label>`
                    : `<p class="text-sm" style="margin:0">A empresa ainda não tem chave Pix cadastrada; a cobrança sai sem Pix.</p><p class="text-xs" style="color:var(--muted);margin:6px 0 0">Cadastre em Conta › Empresa › Minha empresa › Pix para cobrança de aluguel.</p>`,
                aoSalvar: (el) => {
                    const incluir = !!(pix && el.querySelector('#fin-cob-pix')?.checked);
                    enviarCobrancaWhatsApp(celular, grupoTitle, itensText, valorTotal, incluir ? pix : null);
                    if (!incluir || !pix.brcode) return true;
                    // 2º passo: o código sozinho, para o locatário copiar com um toque longo
                    el.innerHTML = `<p class="text-sm" style="margin:0 0 8px"><b>1. Cobrança enviada.</b> Volte aqui e mande o código em uma mensagem separada: assim o locatário copia só o Pix.</p>` +
                        `<button type="button" class="rz-btn rz-btn-1 rz-wide" id="fin-cob-code"><svg data-lucide="copy"></svg>2. Enviar o código Pix</button>`;
                    if (typeof rzIcones === 'function') rzIcones();
                    el.closest('.rz-sheet')?.querySelector('.rz-sh-f')?.classList.add('hidden');
                    el.querySelector('#fin-cob-code').addEventListener('click', () => {
                        rzDev('whatsapp', '55' + celular, pix.brcode); // v1.28.0 (UXR-41) — pelo adaptador
                        if (typeof fecharSheet === 'function') fecharSheet();
                    });
                    return false;
                },
            });
        }

        function enviarCobrancaWhatsApp(celular, grupoTitle, itensText, valorTotal, pix) {

            if(!celular || celular.length < 5) {

                rzToast('Celular do locatário não cadastrado.', { tipo: 'danger' });

                return;

            }

            const formatText = itensText.replace(/\\n/g, '\n');

            const txt = `⚠️ *${CONFIG_CLIENTE.nomeEmpresa.toUpperCase()} - NOTIFICAÇÃO DE CAIXA*\nRef: *${grupoTitle}*\n\nConstam em aberto os seguintes lançamentos pendentes:\n${formatText}\n\n*Total Consolidado: R$ ${valorTotal.toLocaleString('pt-BR')}*\n\nQualquer dúvida sobre a conciliação, estamos à disposição.`
                + (pix ? `\n\n💠 *Pague por Pix*\nChave: ${pix.chave}\nRecebedor: ${pix.nome}` + (pix.brcode ? `\n\nNa próxima mensagem envio o *Pix copia e cola* com o valor total — é só tocar e segurar para copiar.` : '') : '');

            rzDev('whatsapp', '55' + celular, txt); // v1.28.0 (UXR-41) — pelo adaptador

        }

// ============================================================================
// v1.29.0 (03/10/2026, demanda 4a369778 — P1b da ESP_FINANCEIRO v2.3.0)
// RECEITA AVULSA (RF-18.17, f2fffd26) e OUTRAS RECEITAS em Recebimentos.
// "Adicionar recebimento" pergunta antes: De um contrato (o fluxo de sempre,
// abrirNovoRecebimento) ou Sem contrato — que grava um lançamento de ENTRADA
// em `lancamentos` (categoria 'outro' até a migration de vocabulário da F5,
// D17; origem_tipo 'manual'). O card "Outras receitas" lista as entradas
// sem contrato da competência (inclui as licenças registradas pelo Gestão).
// v1.30.0 (P2 Ficha 5) — entram nos 4 KPIs de Recebimentos: a soma é feita
// no banco (fn_financeiro_totalizadores), nunca no cliente (REGRAS §11).
// ============================================================================
export async function abrirAdicionarRecebimento() {
    const v = await rzEscolher({ titulo: 'Adicionar recebimento', opcoes: [
        { valor: 'contrato', icone: 'file-text', titulo: 'De um contrato', sub: 'Aluguel ou outro valor de um contrato ativo' },
        { valor: 'avulso', icone: 'arrow-down-left', titulo: 'Sem contrato', sub: 'Juros, venda, reembolso, outra receita' },
    ] });
    if (v === 'contrato') abrirNovoRecebimento();
    else if (v === 'avulso') abrirReceitaAvulsa();
}

export async function abrirReceitaAvulsa() {
    if (typeof abrirSheetForm !== 'function') return;
    let ativos = [];
    try { ativos = (typeof carregarAtivosParaSelectSupabase === 'function') ? await carregarAtivosParaSelectSupabase() : []; } catch (e) { ativos = []; }
    const esc = (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
    const hoje = new Date().toISOString().slice(0, 10);
    const optsAtivo = `<option value="">Nenhum — receita da empresa</option>` + ativos.map(a => `<option value="${a.id}">${esc(a.nome_exibicao)}</option>`).join('');
    // v1.34.0 — a entrada é classificada: Categoria (nível 1 de entrada) → Subcategoria
    const cat = (await carregarCatalogoCategorias()) || [];
    const gruposEnt = cat.filter(c => !c.categoria_pai && c.direcao === 'entrada' && cat.some(f => f.categoria_pai === c.codigo));
    const optsGrupoEnt = `<option value="">— escolha a categoria —</option>` + gruposEnt.map(g => `<option value="${g.codigo}">${esc(g.nome)}</option>`).join('');
    const corpo = `
        <div class="rz-f"><label>Descrição <i>*</i></label><input type="text" id="rav-descricao" placeholder="Ex.: Juros da aplicação"></div>
        <div class="rz-f"><label for="rav-grupo">Categoria <i>*</i></label><select id="rav-grupo">${optsGrupoEnt}</select></div>
        <div class="rz-f"><label for="rav-categoria">Subcategoria <i>*</i></label><select id="rav-categoria"><option value="">— escolha a categoria primeiro —</option></select></div>
        <div class="rz-chips" id="rav-caminho"></div>
        <label class="rz-row rz-chk"><input type="checkbox" id="rav-contab" checked><div class="rz-tx"><b>Entra na contabilidade</b><span>Vai no pacote do contador; sugerido pela subcategoria</span></div></label>
        <div class="rz-f2 rz-f2-curto">
            <div class="rz-f"><label>Valor (R$) <i>*</i></label><input type="number" step="0.01" inputmode="decimal" id="rav-valor"></div>
            <div class="rz-f"><label>Data <i>*</i></label><input type="date" id="rav-data" value="${hoje}"></div>
        </div>
        <div class="rz-f"><label>Situação</label>
            <input type="hidden" id="rav-situacao" value="recebido">
            <div class="rz-seg" id="rav-seg">
                <button type="button" class="rz-on" data-v="recebido">Já recebido</button>
                <button type="button" data-v="receber">A receber</button>
            </div>
        </div>
        <div class="rz-f"><label>Ativo (opcional)</label><select id="rav-ativo">${optsAtivo}</select></div>`;
    const sheet = abrirSheetForm({
        titulo: 'Receita sem contrato', sub: 'Entra em Recebimentos › Outras receitas',
        corpo, rotuloSalvar: 'Registrar receita',
        aoSalvar: () => salvarReceitaAvulsa(),
    });
    // v1.34.0 — cascata, sugestão de contabilidade e chips do caminho
    const selG = sheet?.querySelector('#rav-grupo'), selC = sheet?.querySelector('#rav-categoria'), chkC = sheet?.querySelector('#rav-contab');
    const atualizarRav = () => {
        const caminho = sheet?.querySelector('#rav-caminho');
        if (!caminho) return;
        const folha = selC?.value ? categoriaDoCatalogo(selC.value) : null;
        const partes = ['Entrada', selG?.value ? selG.options[selG.selectedIndex]?.text : '', folha?.nome || '', ...chipsClassificacaoLanc(folha, chkC ? chkC.checked : null)].filter(Boolean);
        caminho.innerHTML = partes.map(p => `<span class="rz-chip">${esc(p)}</span>`).join('');
    };
    selG?.addEventListener('change', () => {
        const folhas = cat.filter(c => c.categoria_pai === selG.value);
        selC.innerHTML = `<option value="">${selG.value ? '— escolha a subcategoria —' : '— escolha a categoria primeiro —'}</option>` + folhas.map(f => `<option value="${f.codigo}">${esc(f.nome)}</option>`).join('');
        if (folhas.length === 1) { selC.value = folhas[0].codigo; if (chkC) chkC.checked = folhas[0].contabilidade_padrao !== false; }
        atualizarRav();
    });
    selC?.addEventListener('change', () => { const f = categoriaDoCatalogo(selC.value); if (chkC && f) chkC.checked = f.contabilidade_padrao !== false; atualizarRav(); });
    chkC?.addEventListener('change', atualizarRav);
    atualizarRav();
    sheet?.querySelectorAll('#rav-seg button').forEach(b => b.addEventListener('click', () => {
        sheet.querySelectorAll('#rav-seg button').forEach(x => x.classList.toggle('rz-on', x === b));
        sheet.querySelector('#rav-situacao').value = b.dataset.v;
    }));
}

async function salvarReceitaAvulsa() {
    const descricao = (document.getElementById('rav-descricao')?.value || '').trim();
    const valor = parseFloat(document.getElementById('rav-valor')?.value);
    const data = document.getElementById('rav-data')?.value;
    const recebido = document.getElementById('rav-situacao')?.value !== 'receber';
    const ativoId = document.getElementById('rav-ativo')?.value || null;
    const categoria = document.getElementById('rav-categoria')?.value || ''; // v1.34.0
    const incluirContab = document.getElementById('rav-contab') ? document.getElementById('rav-contab').checked : true;
    if (!descricao) { rzToast('Informe a descrição.', { tipo: 'danger' }); return false; }
    if (!categoria) { rzToast('Escolha a categoria e a subcategoria.', { tipo: 'danger' }); return false; }
    if (!(valor > 0)) { rzToast('Informe um valor maior que zero.', { tipo: 'danger' }); return false; }
    if (!data) { rzToast('Informe a data.', { tipo: 'danger' }); return false; }
    const linha = {
        cliente_id: CLIENTE_ID_SUPABASE, direcao: 'entrada', categoria, incluir_contabilidade: incluirContab, descricao, valor, // v1.34.0
        competencia: data.slice(0, 8) + '01', vencimento: data, data_pagamento: recebido ? data : null,
        status: recebido ? 'realizado' : 'previsto', ativo_id: ativoId, origem_tipo: 'manual', reembolsavel: false,
    };
    const { data: ins, error } = await dbAuth.from('lancamentos').insert(linha).select('id').single();
    if (error) { rzToast('Não consegui registrar: ' + error.message, { tipo: 'danger' }); return false; }
    if (typeof registrarLog === 'function') registrarLog('mensal.receita_avulsa', { lancamentoId: ins?.id, valor, recebido });
    emitirEscrita('receita', { id: ins?.id, acao: 'criar' });
    rzToast('Receita registrada');
    if (document.getElementById('tab-mensal')?.classList.contains('active')) renderOutrasReceitas();
    return true;
}

export async function renderOutrasReceitas() {
    const alvo = document.getElementById('fin-outras-receitas');
    if (!alvo) return;
    const comp = financeiroCompetenciaAtual || financeiroCompetenciaHojeISO();
    const esc = (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
    let linhas = [];
    try {
        const { data, error } = await dbAuth.from('lancamentos')
            .select('id, descricao, valor, status, vencimento, data_pagamento, origem_tipo, conta_id, divisao_excecao') // v1.36.0
            .eq('cliente_id', CLIENTE_ID_SUPABASE).eq('direcao', 'entrada').eq('competencia', comp)
            .match(financeiroContaFiltro ? { conta_id: financeiroContaFiltro } : {}) // v1.33.0
            .order('vencimento', { ascending: true });
        if (error) throw error;
        linhas = data || [];
    } catch (e) { console.warn('[financeiro] outras receitas:', e.message); alvo.innerHTML = ''; return; }
    if (!linhas.length) { alvo.innerHTML = ''; return; }
    window.__rzOutrasReceitas = linhas;
    const st = (cod, rot) => (typeof renderStatus === 'function') ? renderStatus(cod, rot) : esc(rot);
    alvo.innerHTML = `<div class="rz-card rz-list"><div class="rz-card-h" style="padding-top:10px;margin-bottom:0"><h3>Outras receitas</h3></div>` +
        linhas.map(l => {
            const recebido = l.status === 'realizado';
            const origem = l.origem_tipo === 'licenca' ? 'Licença' : (l.origem_tipo === 'extrato' ? 'Extrato' : 'Manual');
            const tocavel = true; // v1.36.0 — toda receita abre o sheet (Conta e Divisão); estornar/excluir só nas manuais
            return `<div class="rz-row${tocavel ? ' rz-link' : ''}"${tocavel ? ` role="button" tabindex="0" onclick="rzAcoesReceitaAvulsa('${l.id}')"` : ''}>
                <div class="rz-ic"><svg data-lucide="arrow-down-left"></svg></div>
                <div class="rz-tx"><b>${esc(l.descricao || 'Receita')}</b><span>${formatarDataBR(l.data_pagamento || l.vencimento)} · ${origem}${l.divisao_excecao ? ' · divisão ajustada' : ''}</span></div>
                <div class="rz-rt"><b class="rz-in">+${formatarMoedaBR(Number(l.valor || 0))}</b>${st(recebido ? 'ok' : 'run', recebido ? 'Recebido' : 'A receber')}</div>
                ${tocavel ? '<svg data-lucide="ellipsis-vertical" class="rz-chev"></svg>' : ''}
            </div>`;
        }).join('') + '</div>';
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

export function rzAcoesReceitaAvulsa(id) {
    const l = (window.__rzOutrasReceitas || []).find(x => x.id === id);
    if (!l || typeof abrirSheetAcoes !== 'function') return;
    const acoes = [];
    const manual = l.origem_tipo === 'manual';
    if (manual) {
        if (l.status !== 'realizado') acoes.push({ icone: 'check', titulo: 'Marcar como recebida', sub: 'Usa a data de hoje', aoTocar: () => alterarReceitaAvulsa(id, 'receber') });
        else acoes.push({ icone: 'undo-2', titulo: 'Voltar para a receber', aoTocar: () => alterarReceitaAvulsa(id, 'estornar') });
    }
    acoes.push(...financeiroAcaoConta('lancamento', id, l.conta_id, (v) => { l.conta_id = v; renderOutrasReceitas(); })); // v1.36.0
    acoes.push(...financeiroAcaoDivisao('lancamento', id, Number(l.valor || 0), !!l.divisao_excecao, () => renderOutrasReceitas())); // v1.36.0 (D39)
    if (manual) acoes.push({ icone: 'trash-2', tipo: 'bad', titulo: 'Excluir receita', aoTocar: () => alterarReceitaAvulsa(id, 'excluir') });
    abrirSheetAcoes({ titulo: l.descricao || 'Receita', sub: `${formatarMoedaBR(Number(l.valor || 0))} · sem contrato`, acoes });
}

async function alterarReceitaAvulsa(id, acao) {
    let q;
    if (acao === 'excluir') {
        if (!await rzConfirmar({ titulo: 'Excluir receita', impacto: 'A receita sai de Outras receitas. Não dá para desfazer.', destrutivo: true, rotuloConfirmar: 'Excluir receita' })) return;
        q = dbAuth.from('lancamentos').delete();
    } else if (acao === 'receber') {
        q = dbAuth.from('lancamentos').update({ status: 'realizado', data_pagamento: new Date().toISOString().slice(0, 10) });
    } else {
        q = dbAuth.from('lancamentos').update({ status: 'previsto', data_pagamento: null });
    }
    const { error } = await q.eq('cliente_id', CLIENTE_ID_SUPABASE).eq('id', id).eq('origem_tipo', 'manual').eq('direcao', 'entrada');
    if (error) { rzToast('Não consegui salvar: ' + error.message, { tipo: 'danger' }); return; }
    if (typeof registrarLog === 'function') registrarLog('mensal.receita_avulsa', { lancamentoId: id, acao });
    emitirEscrita('receita', { id, acao });
    rzToast(acao === 'excluir' ? 'Receita excluída' : (acao === 'receber' ? 'Receita recebida' : 'Receita a receber'));
    renderOutrasReceitas();
}

// ============================================================================
// v1.29.0 (03/10/2026, demanda 4a369778 — P1b, RF-19.10 + RF-14/RF-19.8 sem
// Premium) — DISTRIBUIÇÃO (tab-socios), 4ª opção do segmento do Financeiro.
// O número vem do BANCO: fn_apurar_distribuicao(cliente, competência) — cota
// de cada sócio nos recebimentos pagos pela divisão do contrato
// (divisao_repasse_contrato; sem ela, a propriedade do ativo), menos a cota
// das despesas do imóvel, menos as retiradas da competência. Antes a tela
// somava no JS a partir da divisão do imóvel legado (calcularExtratoSocio),
// sem descontar despesas — por isso o "saldo" pode mudar: agora é líquido.
// Modo Ano soma as competências do ano (1 chamada por mês, em paralelo).
// Retirada grava em `repasses` por pessoa_id (beneficiário externo, sem
// pessoa cadastrada, não pode receber retirada — aparece com o motivo).
// Vocabulário de tela: "retirada", "saldo a retirar"; "repasse" não aparece.
// ============================================================================
let distribModo = 'mes';      // 'mes' | 'ano'
let distribBusca = '';
let distribDados = null;      // { linhas: [...], retiradas: [...], periodo }

function distribMeses() {
    const comp = financeiroCompetenciaAtual || financeiroCompetenciaHojeISO();
    if (distribModo === 'mes') return [comp];
    const ano = comp.slice(0, 4);
    const hoje = financeiroCompetenciaHojeISO();
    const out = [];
    for (let m = 1; m <= 12; m++) {
        const iso = `${ano}-${String(m).padStart(2, '0')}-01`;
        if (iso > hoje) break;
        out.push(iso);
    }
    return out.length ? out : [comp];
}

// REL-14/REL-16: negativo como "−R$ 1.234,56" e competência como "jul/2026".
function moedaSinal(v) { const n = Number(v || 0); return n < -0.004 ? '−' + formatarMoedaBR(-n) : formatarMoedaBR(Math.abs(n) < 0.005 ? 0 : n); }
function compCurta(iso) {
    const m = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'][parseInt(String(iso).slice(5, 7), 10) - 1];
    return m ? `${m}/${String(iso).slice(0, 4)}` : String(iso || '');
}

function distribPeriodoRotulo() {
    const comp = financeiroCompetenciaAtual || financeiroCompetenciaHojeISO();
    if (distribModo === 'ano') return comp.slice(0, 4);
    const m = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'][parseInt(comp.slice(5, 7), 10) - 1];
    return `${m}/${comp.slice(0, 4)}`; // REL-16
}

async function distribCarregar() {
    const meses = distribMeses();
    const respostas = await Promise.all(meses.map(m => dbAuth.rpc('fn_apurar_distribuicao', { p_cliente_id: CLIENTE_ID_SUPABASE, p_competencia: m })));
    const erro = respostas.find(r => r.error);
    if (erro) throw erro.error;
    const mapa = new Map();
    respostas.forEach(r => (r.data || []).forEach(x => {
        const chave = x.beneficiario_pessoa_id || ('ext:' + (x.beneficiario_nome_externo || x.nome_exibicao));
        const a = mapa.get(chave) || { chave, pessoaId: x.beneficiario_pessoa_id || null, nome: x.nome_exibicao, entradas: 0, saidas: 0, liquido: 0, reembolso: 0, retirado: 0, saldo: 0 };
        a.entradas += Number(x.entradas || 0); a.saidas += Number(x.saidas || 0); a.liquido += Number(x.liquido_apurado || 0);
        a.reembolso += Number(x.reembolso || 0); // v1.35.0 (B4) — despesa paga da própria conta volta ao sócio
        a.retirado += Number(x.ja_repassado || 0); a.saldo += Number(x.saldo_pendente || 0);
        mapa.set(chave, a);
    }));
    const { data: ret, error: errRet } = await dbAuth.from('repasses')
        .select('id, pessoa_id, competencia, valor, data_real, pessoas(nome)')
        .eq('cliente_id', CLIENTE_ID_SUPABASE).gte('competencia', meses[0]).lte('competencia', meses[meses.length - 1])
        .order('data_real', { ascending: false });
    if (errRet) throw errRet;
    // retirada de quem não teve cota no período: a função não devolve a pessoa — entra com cota zero
    (ret || []).forEach(r => {
        if (mapa.has(r.pessoa_id)) return;
        const a = { chave: r.pessoa_id, pessoaId: r.pessoa_id, nome: r.pessoas?.nome || 'Sócio', entradas: 0, saidas: 0, liquido: 0, reembolso: 0, retirado: 0, saldo: 0, soRetirada: true };
        mapa.set(r.pessoa_id, a);
    });
    mapa.forEach(a => { if (a.soRetirada) { const v = (ret || []).filter(r => r.pessoa_id === a.pessoaId).reduce((t, r) => t + Number(r.valor || 0), 0); a.retirado = v; a.saldo = -v; } });
    const linhas = [...mapa.values()].sort((a, b) => b.saldo - a.saldo || a.nome.localeCompare(b.nome));
    distribDados = { linhas, retiradas: ret || [], periodo: distribPeriodoRotulo(), meses };
}

export async function renderDistribuicao() {
    const corpo = document.getElementById('distrib-corpo');
    if (!corpo) return;
    if (!financeiroCompetenciaAtual) financeiroDefinirCompetencia(financeiroCompetenciaHojeISO());
    const elLabel = document.getElementById('fin-competencia-label-socios');
    if (elLabel) elLabel.textContent = distribModo === 'ano' ? financeiroCompetenciaAtual.slice(0, 4) : financeiroCompetenciaLabel(financeiroCompetenciaAtual);
    corpo.innerHTML = `<p class="text-xs text-center py-3" style="color:var(--sage)">Carregando…</p>`;
    try { await distribCarregar(); }
    catch (e) {
        console.error('[financeiro] distribuição', e);
        corpo.innerHTML = `<div class="rz-card"><div class="rz-empty"><div class="rz-ic"><svg data-lucide="alert-circle"></svg></div><p>Não consegui calcular a distribuição agora.</p></div></div>`;
        return;
    }
    distribDesenhar();
}

function distribDesenhar() {
    const corpo = document.getElementById('distrib-corpo');
    if (!corpo || !distribDados) return;
    const esc = (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
    const st = (cod, rot) => (typeof renderStatus === 'function') ? renderStatus(cod, rot) : esc(rot);
    const { linhas, retiradas, periodo } = distribDados;
    const soma = (k) => linhas.reduce((t, l) => t + l[k], 0); // soma de linhas já calculadas pelo banco — só agrega o que a função devolveu
    const anoTxt = (financeiroCompetenciaAtual || '').slice(0, 4);
    const chips = `<div class="rz-chips">
        <button type="button" class="rz-chip${distribModo === 'mes' ? ' rz-on' : ''}" onclick="distribMudarModo('mes')">Mês</button>
        <button type="button" class="rz-chip${distribModo === 'ano' ? ' rz-on' : ''}" onclick="distribMudarModo('ano')">Ano ${esc(anoTxt)}</button>
    </div>`;
    const kpis = `<div class="rz-kpis">
        <div class="rz-kpi rz-in"><small>Cotas recebidas</small><b>${formatarMoedaBR(soma('entradas'))}</b></div>
        <div class="rz-kpi"><small>(−) Despesas</small><b>${formatarMoedaBR(soma('saidas'))}</b></div>
        <div class="rz-kpi"><small>Retirado</small><b>${formatarMoedaBR(soma('retirado'))}</b></div>
        <div class="rz-kpi"><small>Saldo a retirar</small><b>${moedaSinal(soma('saldo'))}</b></div>
    </div>`;
    const filtro = distribBusca.trim().toLowerCase();
    const visiveis = linhas.filter(l => !filtro || l.nome.toLowerCase().includes(filtro));
    const statusSaldo = (l) => l.saldo > 0.004 ? st('run', `${formatarMoedaBR(l.saldo)} a retirar`)
        : l.saldo < -0.004 ? st('warn', `${formatarMoedaBR(-l.saldo)} a mais`) : st('ok', 'Em dia');
    const lista = visiveis.length
        ? `<div class="rz-card rz-list"><div class="rz-card-h" style="padding-top:10px;margin-bottom:0"><h3>Por sócio</h3><span class="rz-sub">${esc(periodo)}</span></div>` +
          visiveis.map(l => `<div class="rz-row rz-link" role="button" tabindex="0" onclick="abrirFichaSocioDistribuicao('${esc(l.chave)}')">
                <div class="rz-ic${l.pessoaId ? '' : ' rz-neu'}"><svg data-lucide="user"></svg></div>
                <div class="rz-tx"><b>${esc(l.nome)}</b><span>Líquido ${moedaSinal(l.liquido)}${l.reembolso > 0.004 ? ' · reembolso ' + formatarMoedaBR(l.reembolso) : ''} · retirado ${formatarMoedaBR(l.retirado)}${l.pessoaId ? '' : ' · externo'}</span></div>
                <div class="rz-rt">${statusSaldo(l)}</div>
                <svg data-lucide="chevron-right" class="rz-chev"></svg>
            </div>`).join('') + '</div>'
        : `<div class="rz-card"><div class="rz-empty"><div class="rz-ic"><svg data-lucide="users"></svg></div><p>${filtro ? 'Nenhum sócio com esse nome.' : `Nenhuma cota apurada em ${esc(periodo)}. A cota nasce dos recebimentos pagos de contratos com divisão definida.`}</p></div></div>`;
    const nomePorId = Object.fromEntries(linhas.filter(l => l.pessoaId).map(l => [l.pessoaId, l.nome]));
    const ultimas = retiradas.length
        ? `<div class="rz-card rz-list"><div class="rz-card-h" style="padding-top:10px;margin-bottom:0"><h3>Retiradas</h3><span class="rz-sub">${esc(periodo)}</span></div>` +
          retiradas.slice(0, 20).map(r => `<div class="rz-row rz-link" role="button" tabindex="0" onclick="rzAcoesRetirada('${r.id}')">
                <div class="rz-ic"><svg data-lucide="arrow-up-right"></svg></div>
                <div class="rz-tx"><b>${esc(r.pessoas?.nome || nomePorId[r.pessoa_id] || 'Sócio')}</b><span>${formatarDataBR(r.data_real || r.competencia)} · ref. ${esc(compCurta(r.competencia))}</span></div>
                <div class="rz-rt"><b class="rz-out">−${formatarMoedaBR(Number(r.valor || 0))}</b></div>
                <svg data-lucide="ellipsis-vertical" class="rz-chev"></svg>
            </div>`).join('') + '</div>'
        : '';
    corpo.innerHTML = chips + kpis + lista + ultimas;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

export function distribMudarModo(modo) { distribModo = modo === 'ano' ? 'ano' : 'mes'; renderDistribuicao(); }
export function distribFiltrar(texto) { distribBusca = String(texto || ''); distribDesenhar(); }

export function abrirLancarDistribuicao() {
    if (typeof abrirSheetAcoes !== 'function') return;
    abrirSheetAcoes({ titulo: 'Distribuição', sub: distribPeriodoRotulo(), acoes: [
        { icone: 'arrow-up-right', titulo: 'Lançar retirada', codigo: 'repasses.registrar', sub: 'Valor que um sócio retirou da empresa', aoTocar: () => abrirLancarRetirada() },
    ] });
}

export function abrirFichaSocioDistribuicao(chave) {
    const l = distribDados?.linhas.find(x => x.chave === chave);
    if (!l || typeof abrirSheet !== 'function') return;
    const esc = (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
    const ret = (distribDados.retiradas || []).filter(r => r.pessoa_id && r.pessoa_id === l.pessoaId);
    const kv = (rot, val, forte) => `<div class="rz-full" style="display:flex;justify-content:space-between;gap:12px"><small>${esc(rot)}</small><b style="${forte ? 'font-weight:700' : 'font-weight:500'}">${moedaSinal(val)}</b></div>`;
    const linhasRet = ret.length ? `<div class="rz-group">Retiradas</div><div class="rz-card rz-list">` + ret.map(r => `<div class="rz-row"><div class="rz-ic"><svg data-lucide="arrow-up-right"></svg></div><div class="rz-tx"><b>${formatarDataBR(r.data_real || r.competencia)}</b><span>ref. ${esc(compCurta(r.competencia))}</span></div><div class="rz-rt"><b class="rz-out">−${formatarMoedaBR(Number(r.valor || 0))}</b></div></div>`).join('') + '</div>' : '';
    const pode = (typeof podeUsar === 'function') ? podeUsar('repasses.registrar') : { ok: true };
    const motivo = !l.pessoaId ? 'Beneficiário externo — cadastre a pessoa em Pessoas para lançar retirada' : (!pode.ok ? (pode.textoCurto || 'Sem permissão') : '');
    const sheet = abrirSheet(rzSheetCabecalho(l.nome, `${distribDados.periodo} · visão competência`) + `<div class="rz-sh-b">
        <div class="rz-card"><div class="rz-kv" style="grid-template-columns:1fr">
            ${kv('Cotas recebidas', l.entradas)}${kv('(−) Despesas do imóvel', l.saidas)}${kv('(=) Líquido apurado', l.liquido, true)}${l.reembolso > 0.004 ? kv('(+) Reembolso · pago da própria conta', l.reembolso) : ''}${kv('(−) Retirado', l.retirado)}${kv('(=) Saldo a retirar', l.saldo, true)}
        </div></div>${linhasRet}
        ${motivo ? `<p style="margin:8px 0 0;font-size:13px;color:var(--muted)">${esc(motivo)}</p>` : ''}
        <button type="button" class="rz-act" data-rz-compartilhar><div class="rz-ic"><svg data-lucide="share"></svg></div><div>Compartilhar resumo<small>WhatsApp do sócio ou outro app</small></div></button>
    </div><div class="rz-sh-f"><button type="button" class="rz-btn rz-btn-1 rz-wide" data-rz-retirada ${motivo ? 'disabled' : ''}>Lançar retirada</button></div>`);
    sheet.querySelector('[data-rz-retirada]')?.addEventListener('click', () => { fecharSheet(); abrirLancarRetirada(l.pessoaId, l.saldo); });
    sheet.querySelector('[data-rz-compartilhar]')?.addEventListener('click', () => compartilharResumoSocio(l));
}

function compartilharResumoSocio(l) {
    const p = (typeof pessoas !== 'undefined' && Array.isArray(pessoas)) ? pessoas.find(x => x.id === l.pessoaId) : null;
    const txt = `Distribuição · ${l.nome} · ${distribDados.periodo}\n` +
        `Cotas recebidas: ${formatarMoedaBR(l.entradas)}\n(−) Despesas do imóvel: ${formatarMoedaBR(l.saidas)}\n` +
        `(=) Líquido apurado: ${moedaSinal(l.liquido)}\n` + (l.reembolso > 0.004 ? `(+) Reembolso: ${formatarMoedaBR(l.reembolso)}\n` : '') +
        `(−) Retirado: ${formatarMoedaBR(l.retirado)}\n(=) Saldo a retirar: ${moedaSinal(l.saldo)}`;
    const num = String(p?.whatsapp || '').replace(/\D/g, '');
    if (num.length >= 10) rzDev('whatsapp', num.length <= 11 ? '55' + num : num, txt);
    else rzDev('share', { titulo: `Distribuição · ${l.nome}`, texto: txt });
}

export function abrirLancarRetirada(pessoaIdPre, valorSugerido) {
    if (typeof podeUsar === 'function' && !podeUsar('repasses.registrar').ok) { if (typeof rzMostrarBloqueio === 'function') rzMostrarBloqueio('repasses.registrar'); return; }
    if (typeof abrirSheetForm !== 'function') return;
    const esc = (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
    const candidatos = new Map();
    (distribDados?.linhas || []).filter(l => l.pessoaId).forEach(l => candidatos.set(l.pessoaId, l.nome));
    if (typeof pessoas !== 'undefined' && Array.isArray(pessoas)) pessoas.filter(p => Number(p.percentualCotasEmpresa) > 0).forEach(p => { if (!candidatos.has(p.id)) candidatos.set(p.id, p.nome); });
    if (!candidatos.size) { rzToast('Nenhum sócio cadastrado. Cadastre em Pessoas, com o percentual de cotas.', { tipo: 'info' }); return; }
    const optsSocio = [...candidatos.entries()].sort((a, b) => a[1].localeCompare(b[1]))
        .map(([id, nome]) => `<option value="${id}" ${id === pessoaIdPre ? 'selected' : ''}>${esc(nome)}</option>`).join('');
    const base = financeiroCompetenciaAtual || financeiroCompetenciaHojeISO();
    const comps = [];
    for (let i = -12; i <= 1; i++) { const d = new Date(Number(base.slice(0, 4)), Number(base.slice(5, 7)) - 1 + i, 1); comps.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`); }
    const optsComp = comps.reverse().map(c => `<option value="${c}" ${c === base ? 'selected' : ''}>${financeiroCompetenciaLabel(c)}</option>`).join('');
    const hoje = new Date().toISOString().slice(0, 10);
    const sug = Number(valorSugerido) > 0 ? String(Math.round(Number(valorSugerido) * 100) / 100) : '';
    abrirSheetForm({
        titulo: 'Lançar retirada', sub: 'Valor que o sócio retirou da empresa',
        corpo: `
            <div class="rz-f"><label>Sócio <i>*</i></label><select id="ret-pessoa">${optsSocio}</select></div>
            <div class="rz-f"><label>Mês de referência <i>*</i></label><select id="ret-competencia">${optsComp}</select></div>
            <div class="rz-f2 rz-f2-curto">
                <div class="rz-f"><label>Valor (R$) <i>*</i></label><input type="number" step="0.01" inputmode="decimal" id="ret-valor" value="${sug}"></div>
                <div class="rz-f"><label>Data da retirada <i>*</i></label><input type="date" id="ret-data" value="${hoje}"></div>
            </div>`,
        rotuloSalvar: 'Lançar retirada',
        aoSalvar: () => salvarRetirada(),
    });
}

async function salvarRetirada() {
    const pessoaId = document.getElementById('ret-pessoa')?.value;
    const competencia = document.getElementById('ret-competencia')?.value;
    const valor = parseFloat(document.getElementById('ret-valor')?.value);
    const dataReal = document.getElementById('ret-data')?.value;
    if (!pessoaId || !competencia) { rzToast('Escolha o sócio e o mês.', { tipo: 'danger' }); return false; }
    if (!(valor > 0)) { rzToast('Informe um valor maior que zero.', { tipo: 'danger' }); return false; }
    if (!dataReal) { rzToast('Informe a data da retirada.', { tipo: 'danger' }); return false; }
    const { data: ins, error } = await dbAuth.from('repasses')
        .insert({ cliente_id: CLIENTE_ID_SUPABASE, pessoa_id: pessoaId, competencia, valor, data_real: dataReal }).select('id').single();
    if (error) { rzToast('Não consegui lançar a retirada: ' + error.message, { tipo: 'danger' }); return false; }
    // mantém a lista em memória do app (Resultados, PDF por sócio) igual ao banco
    try {
        const nome = (typeof pessoas !== 'undefined' && Array.isArray(pessoas)) ? (pessoas.find(p => p.id === pessoaId)?.nome || '') : '';
        if (typeof repasses !== 'undefined' && Array.isArray(repasses)) {
            repasses.push({ id: ins.id, socio: nome, mes: dataParaCompetencia(competencia), valor, dataReal: dataReal.split('-').reverse().join('/'), timestamp: Date.now() });
        }
    } catch (e) { /* lista em memória é conveniência */ }
    if (typeof registrarLog === 'function') registrarLog('repasses.registrar', { repasseId: ins.id, pessoaId, competencia, valor });
    emitirEscrita('repasse', { id: ins.id, acao: 'registrar' });
    rzToast('Retirada lançada');
    renderDistribuicao();
    return true;
}

export function rzAcoesRetirada(id) {
    const r = (distribDados?.retiradas || []).find(x => x.id === id);
    if (!r || typeof abrirSheetAcoes !== 'function') return;
    abrirSheetAcoes({ titulo: `Retirada · ${r.pessoas?.nome || 'Sócio'}`, sub: `${formatarMoedaBR(Number(r.valor || 0))} · ${formatarDataBR(r.data_real || r.competencia)}`, acoes: [
        { icone: 'trash-2', tipo: 'bad', titulo: 'Excluir retirada', codigo: 'repasses.excluir', aoTocar: () => excluirRetirada(id) },
    ] });
}

async function excluirRetirada(id) {
    const r = (distribDados?.retiradas || []).find(x => x.id === id);
    if (!r) return;
    if (!await rzConfirmar({ titulo: 'Excluir retirada', impacto: `${formatarMoedaBR(Number(r.valor || 0))} de ${r.pessoas?.nome || 'Sócio'} volta para o saldo a retirar.`, destrutivo: true, rotuloConfirmar: 'Excluir retirada' })) return;
    const { error } = await dbAuth.from('repasses').delete().eq('cliente_id', CLIENTE_ID_SUPABASE).eq('id', id);
    if (error) { rzToast('Não consegui excluir: ' + error.message, { tipo: 'danger' }); return; }
    try { if (typeof repasses !== 'undefined' && Array.isArray(repasses)) { const i = repasses.findIndex(x => x.id === id); if (i !== -1) repasses.splice(i, 1); } } catch (e) { /* idem */ }
    if (typeof registrarLog === 'function') registrarLog('repasses.excluir', { repasseId: id, valor: r.valor });
    emitirEscrita('repasse', { id, acao: 'excluir' });
    rzToast('Retirada excluída');
    renderDistribuicao();
}
