// ============================================================================
// js/fechamento.js — Raiz Patrimônio · Fechamento da competência
// Versão: 1.6.2 · 23/09/2026
//
// v1.6.2 (pedido do Nicola, 23/09/2026) — "Compartilhar com o contador" sem
// contador cadastrado não para mais num aviso: leva direto a Partes com o
// formulário de parte nova já como Contador (window.abrirCadastroContador,
// index.html v1.253.0).
//
// v1.6.1 (frente fiscal, Fase 3 — demanda 976fcbf6) — nova exportação
// fechamentoAbrirChecklistFiscalAtualizado(): relê as pendências no banco
// (fn_fiscal_pendencias_cadastro) e abre o checklist, independentemente de a
// rotina "NFS-e da competência" estar ligada. Chamada pela tela Fiscal
// (js/fiscal.js, card "Dados que faltam"), que pode abrir antes de o
// Financeiro ter carregado o estado fiscal da sessão.
//
// v1.6.0 (frente fiscal, Fase 2 — demanda 976fcbf6; decisões D2 e D6 do
// Nicola, 23/09/2026):
//   · Checklist fiscal passa a vir de UMA função do banco,
//     fn_fiscal_pendencias_cadastro (a lógica em JS saiu). Resolve o achado
//     A4: contratos novos entram (antes o filtro por imovel_id os deixava de
//     fora), lê o documento da parte locatária (não só contratos.cpf) e o
//     CIB passa a valer só para imóvel alugado (antes contava veículo).
//     Grupos novos: Empresa (documento, município-sede) e Imóvel
//     (destinação, município, CIB).
//   · D6: tocar num locatário sem documento abre o campo CPF/CNPJ ali
//     mesmo (Sheet de formulário) e grava por
//     fn_contrato_tomador_documento_definir (parte + contrato, com dígito
//     conferido). Sem permissão de editar contrato, a linha abre o contrato.
//     Depois de salvar, o checklist volta atualizado. O mesmo locatário
//     pode estar em vários contratos (1 cadastro em Partes): o documento
//     vale para todos e o aviso diz quantos foram resolvidos.
//   · D2: o contador é lido de Partes (fn_contadores_empresa) e o pacote vai
//     com p_contador_parte_id. O banco ainda aceita o id antigo de
//     prestadores, então a versão anterior deste arquivo continua
//     funcionando até o deploy.
//
// v1.5.0 (demanda 7bdcb8d4, pedido explícito do Nicola 23/09/2026): o card
// de competência perdeu o ⋮ ("nao deve ter menu de 3 pontinhos no seletor
// de competencia") e o Checklist fiscal virou um dos 6 botões do Financeiro.
// Este módulo deixou de desenhar a célula Fechar/Abrir e o chip Fiscal: agora
// só publica o estado (fechamentoPublicarEstado → window.RZ_FIN_FECHAMENTO /
// window.RZ_FIN_FISCAL) e pede o redesenho a financeiro.js v1.20.0
// (financeiroRedesenharQuadrantes), que pinta os 6 botões e o cadeado do mês
// a partir do mesmo estado. fechamentoAbrirAcoes() continua exportada (ponte
// existente), mas nenhuma tela chama mais.
//
// v1.4.0 (demanda 0e40951a — redesenho do Financeiro, pedido explícito do
// Nicola) — fechamentoRenderBotaoDedicado(): (1) ícone do botão
// Fechar/Abrir competência estava INVERTIDO (mostrava cadeado aberto pra
// competência FECHADA e cadeado fechado pra ABERTA — o desenho descrevia a
// ação, não o estado; corrigido pra refletir o estado de verdade). (2)
// alvo trocou de um ícone solto (.rz-ico-btn, ids fin-botao-fechamento-*)
// pra uma célula do grid 2x2 novo (.rz-fin-quad, ids
// fin-quad-fechamento-*) — ver financeiroQuadrantesHtml(), financeiro.js
// v1.18.0, e o card de competência (index.html v1.245.0), que perdeu o
// chip "Fiscal" e a mensagem aberta/fechada por pedido explícito ("no
// componente da compentencia nao deve ter tag de fiscal, nem msg de
// aberta ou fechada") — o checklist fiscal continua acessível pelo ⋮
// (fechamentoAbrirAcoes), só saiu do CARD.
//
// v1.3.0 (22/09/2026 — Fase 1 do wrapper de escrita, rollout Financeiro —
// pedido do Nicola 22/09/2026, ver js/raiz-eventos.js v1.0.0 e o piloto em
// cofre-ativos.js v1.59.0/index.html v1.239.0): fechamento.js passa a
// chamar emitirEscrita('competencia', {...}) logo depois de CADA escrita
// real confirmada no banco, pra módulos de fora saberem que uma competência
// mudou de estado:
//   · fechamentoAbrirSheetFechar() — dentro do aoSalvar do Sheet, logo
//     depois de fn_fechamento_fechar não dar erro. acao: 'fechar'.
//   · fechamentoAbrirSheetReabrir() — dentro do aoSalvar do Sheet, logo
//     depois de fn_fechamento_reabrir não dar erro. acao: 'reabrir'.
//   · fechamentoGerarEcompartilhar() CONFERIDA e deixada de fora: a RPC que
//     ela chama (fn_pacote_contador_montar) MONTA o pacote a partir do
//     bloco 'contabil' já gravado no fechamento_snapshot (imutável desde o
//     fechar) — não achei nenhum insert/update de um registro novo de
//     "compartilhamento" nem no client nem indício de tabela pra isso; o
//     resto da função é só gerar PDF (client-side, jsPDF) e compartilhar
//     (navigator.share ou wa.me/mailto) — nada disso é escrita de entidade.
//     Se um dia existir um registro de "compartilhado em X, por Y" no
//     banco, esta função passa a ser candidata a emitir também.
//   · Listener próprio (aoEscrever, guard window.__rzListenerEscritaFecha
//     mentoLigado) registrado dentro de fechamentoAtualizarCard() — não há
//     um "boot" único e separado neste módulo (mesma situação de
//     financeiro.js — funções soltas, sem classe/inicializador); esta é a
//     função chamada toda vez que o card do Fechamento precisa refletir o
//     estado atual (abrir a aba, trocar de mês, ou depois de fechar/
//     reabrir), então é o ponto mais natural. Guard evita registrar de novo
//     a cada chamada (ela roda várias vezes por sessão). Ao ouvir
//     'competencia', só rechama fechamentoAtualizarCard() — redundante com
//     a chamada direta que fechar/reabrir já fazem (dobra o refresh nesses
//     2 casos, inofensivo), mas cobre o caso de outro módulo vir a escrever
//     nessa entidade no futuro sem financeiro.js precisar saber.
//   · Zero mudança de lógica de negócio, RPC, payload ou texto de tela —
//     só a chamada nova de emitirEscrita() e o import do módulo.
//
// v1.2.1 (21/09/2026) — 2 correções (QUA-01, achadas nesta mesma entrega,
// revisando o v1.2.0 antes de considerar pronto, nenhuma reportada por uso
// real):
//   · fechamentoRenderCorpo passa a espelhar window.RZ_FIN_COMPETENCIA_FECHADA
//     (boolean) toda vez que resolve o estado — financeiro.js usa isso pra
//     tirar Estornar/"Não incluir na contabilidade" do ⋮ de Recebimentos/
//     Saídas quando a competência do item está fechada (REGRAS §11.1: só
//     Recibo e Ver detalhes continuam ali; o trigger de banco já bloqueava a
//     GRAVAÇÃO, mas o menu continuava oferecendo a ação como se desse certo).
//   · O comentário "COMO É CHAMADO" abaixo (linha ~122 da v1.2.0) dizia que
//     fechamentoAtualizarCard() só era chamado de dentro de
//     financeiroRenderCabecalho('conciliacao') — exatamente o oposto do que
//     o changelog do v1.2.0 prometia ("botão dedicado visível nos 3 chips...
//     não só aqui"): o botão existia no HTML das 3 abas, mas só era
//     REDESENHADO quando o usuário abria o chip Fechamento — flipar o mês
//     em Recebimentos/Saídas deixava o cadeado com o estado do mês anterior
//     (ou vazio, no boot). Corrigido do lado de financeiro.js
//     (financeiroRenderCabecalho passa a chamar fechamentoAtualizarCard()
//     nas 3 abas, não só 'conciliacao' — ver financeiro.js v1.15.0).
//
// v1.2.0 (21/09/2026) — Entrega F.3 (redesenhada) — Compartilhamento com o
// contador, decisão do Nicola (21/09/2026, substitui o desenho anterior de
// token/link de acesso ao sistema — ver REGRAS_EXPERIENCIA_RAIZ v3.22.0
// §11.1 e Demanda do backlog do mecanismo de token, registrada para uma
// fase posterior de acesso direto do contador).
//   · Fechar/Reabrir a competência SAI do ⋮ e ganha um botão dedicado
//     (cadeado), visível nos 3 chips de nível superior do Financeiro
//     (Recebimentos · Saídas · Fechamento) — não só aqui. O ícone e o
//     rótulo alternam sozinhos: aberto → "lock" ("Fechar competência");
//     fechado → "lock-open" ("Abrir competência"). Tocar o botão vai direto
//     ao Sheet de formulário de sempre (fechar pede observação opcional,
//     reabrir exige motivo) — sem mais passar pelo Sheet de ações
//     intermediário, que só tinha essa opção.
//   · O ⋮ do card passa a abrir só "Compartilhar com o contador" — nova
//     ação desta entrega.
//   · Compartilhar com o contador: o usuário escolhe 1+ competências JÁ
//     FECHADAS (nunca fecha mais de uma de uma vez — cada competência
//     continua fechando sozinha, um retrato por vez) e o contador
//     cadastrado (prestadores.tipo='contador', mesmo padrão de
//     administradora/síndico/manutencista — reaproveita a tabela
//     existente, sem tabela nova). Cada competência vira um PDF, montado
//     com jsPDF (já carregado no app, mesmo padrão de
//     baixarRelatorioPdfLocal() no index.html) a partir do bloco
//     'contabil' do fechamento_snapshot — nunca recalculado, então editar
//     um lançamento depois de fechar não muda o PDF.
//   · Envio é "compartilhamento nativo": quando o navegador suporta
//     navigator.share() com arquivo (a maioria dos celulares), abre
//     direto a folha de compartilhamento do sistema com o(s) PDF(s)
//     anexados de verdade — inclusive pra WhatsApp. Sem esse suporte
//     (a maioria dos desktops), baixa o(s) PDF(s) e abre wa.me (número do
//     contador) ou mailto: (e-mail do contador) só com o texto-resumo,
//     porque nenhum dos dois esquemas de URL consegue anexar arquivo —
//     o rótulo do botão avisa "anexe o PDF baixado".
//   · O QUE ENTRA NO PACOTE (decisão do Nicola, 21/09/2026): todo item
//     baixado (pago/recebido), seja a baixa manual ou por conciliação de
//     extrato — não exige mais conciliação bancária. Fica de fora só o
//     que a própria empresa desmarcar manualmente (⋮ da linha de
//     Recebimentos/Saídas, "Não incluir na contabilidade" — ver
//     financeiro.js v1.5.0, coluna incluir_contabilidade). Repasses
//     entram como uma 3ª lista (extrato_fingerprints.destino_tipo=
//     'repasse'). Tudo isso é calculado no banco
//     (fn_fechamento_calcular_contabil) e gravado como um 2º bloco do
//     mesmo snapshot ('contabil') no momento do fechar — não existe
//     como consulta em tempo real.
//   · Retificação: como o snapshot é imutável, corrigir um lançamento de
//     uma competência já fechada exige reabrir → editar → fechar de novo
//     (o botão dedicado é o mesmo dos dois passos). Um trigger no banco
//     (fn_trg_bloquear_edicao_competencia_fechada, migration
//     fechamento_pacote_contador_v1) bloqueia UPDATE em mensalidades/
//     lancamentos de competência fechada mesmo fora deste módulo —
//     inclusive edição direta de tela, sem passar por nenhuma função
//     daqui. Só permite ver detalhe e gerar recibo, nunca alterar.
//   · Novo bloco de KPIs no card do Fechamento (fn_financeiro_totalizador_
//     fechamento): pendente / não controlado / recebido / pago da
//     competência, mesmo padrão visual dos 4 KPIs de Recebimentos/Saídas.
//   · CORRIGIDO (achado revisando esta mesma entrega, antes de qualquer
//     uso real): o cadastro de contador (prestadores.tipo='contador') não
//     tinha NENHUM caminho de tela — o <select> "Atua como prestador?" da
//     tela de Partes (index.html, abrirFormParteSheet — hoje o único lugar
//     que cria/edita administradora/síndico/manutencista, desde que as 3
//     abas antigas foram fundidas em Partes na v1.119.0) só tinha essas 3
//     opções. Adicionado "Contador" ao <select> — salva em partes.tipo_
//     prestador e espelha pra prestadores.tipo via sincronizarPrestadorDaParte,
//     mesmo mecanismo dos outros 3 papéis. O aviso desta função também
//     apontava pro destino errado ("Empresa › Rotinas") — corrigido pra
//     "Partes › Prestadores".
//
// v1.1.0 (21/09/2026) — Entrega F3.1 (Chip Fiscal e checklist de CIB),
// PLANO_IMPLEMENTACAO_RESULTADOS_MERCADO_FISCAL v2.0.0, FASE F3. Objetivo:
// a empresa vê o que falta pra emitir NFS-e quando a obrigatoriedade
// chegar, SEM emitir nada ainda e SEM nenhum texto afirmar que o cliente é
// contribuinte. Sem migration nova (reaproveita os tipos/funções de AL.2):
//   · Chip "Fiscal" novo no card de competência do Fechamento (ao lado do
//     status "Fechado"), só aparece com a rotina nfse_competencia ligada
//     (fn_rotinas_empresa_listar — mesmo padrão de
//     financeiroVerificarRotinaFechamento em financeiro.js, checado aqui
//     de novo porque os módulos são isolados de propósito, sem import
//     direto). Mostra "Fiscal OK" (verde) quando não há pendência, ou a
//     contagem (âmbar) quando há.
//   · Toque no chip abre um checklist por imóvel com 2 perguntas: CIB
//     preenchido? (fn_diario_cib_pendente, MESMA função que já alimenta o
//     alerta de estado cib_pendente da AL.2 — fonte única, nunca diverge
//     do que a Central de Alertas mostra) e o contrato ativo do imóvel tem
//     documento do locatário? (contratos.cpf — rótulo "CPF/CNPJ" na ficha
//     do contrato, campo obrigatório lá; consulta nova, client-side, sem
//     RPC — não existe alerta de estado pra isso ainda, natureza puramente
//     de cadastro). Cada item do checklist navega pro lugar de sempre pra
//     corrigir (CIB: switchTab('tab-ativos') + abrirFichaAtivoNoChip(id,
//     'resumo'), mesmo destino do case 'ativo/ficha' de
//     rzAbrirDestinoAlerta; documento: abrirFichaContrato(id), mesmo
//     destino do case 'contrato/ficha') — nenhuma edição inline nova,
//     nenhuma duplicação da UX de edição que a AL.3/AL.6 já resolveram
//     pros alertas.
//   · Fiscal é status DA CARTEIRA (não da competência selecionada) —
//     verificado 1x por sessão (fechamentoRotinaFiscalLigada !== null),
//     igual ao padrão de financeiroRotinaFechamentoLigada — não refaz a
//     consulta a cada troca de mês no card.
//
// Entrega F.2 (PLANO_IMPLEMENTACAO_RESULTADOS_MERCADO_FISCAL v2.0.0,
// REGRAS_EXPERIENCIA_RAIZ v3.19.0 §11.1) — módulo novo: fechar/reabrir a
// competência + retrato financeiro.
//
// ESCOPO DESTA ENTREGA (decisão explícita do Nicola, 21/09/2026,
// AskUserQuestion): só fechar/reabrir + o retrato "financeiro" (Previsto/
// Recebido/Pago, mesma regra de fn_financeiro_totalizadores). O retrato de
// Distribuição (extrato de sócio, calcularExtratoSocio() em index.html)
// fica pra uma entrega seguinte, com mais tempo pra validar o rateio
// contra dado real antes de congelar num snapshot imutável — este módulo
// NÃO toca em calcularExtratoSocio().
//
// Migrations: fechamento_estrutura_v1 (fn_fechamento_verificar/fechar/
// reabrir + tabela fechamento_snapshot) e fechamento_pacote_contador_v1
// (v1.2.0 — incluir_contabilidade, bloco 'contabil', fn_pacote_contador_
// montar, fn_financeiro_totalizador_fechamento, fn_fechamento_listar_
// fechadas, gatilho de bloqueio de edição).
//
// COMO É CHAMADO:
//   · financeiro.js chama a ponte global fechamentoAtualizarCard() de
//     dentro de financeiroRenderCabecalho('conciliacao') — módulos
//     isolados, sem import direto entre os dois (mesmo padrão de
//     isolamento dos demais módulos do app).
//   · A competência mostrada aqui é a MESMA da Recebimentos/Saídas — como
//     os dois módulos não se importam, financeiro.js espelha
//     financeiroCompetenciaAtual em window.RZ_FIN_COMPETENCIA (ISO
//     'YYYY-MM-01') toda vez que muda; este módulo só lê essa variável.
//   · onclick do HTML estático (#fin-fechamento-card) chama
//     fechamentoAbrirAcoes() via ponte global instalada no index.html
//     (mesmo padrão de carregarFinanceiro/carregarResultados); o chip
//     Fiscal (v1.1.0) chama fechamentoAbrirChecklistFiscal() e o botão
//     dedicado (v1.2.0, nos 3 chips) chama fechamentoAlternarBotao() pela
//     mesma ponte.
//
// ESTADO GLOBAL LIDO/ESCRITO DAQUI: dbAuth, CLIENTE_ID_SUPABASE,
// pessoaIdLogada, mostrarToast, abrirSheetAcoes, abrirSheetForm, abrirSheet,
// rzSheetCabecalho, fecharSheet, rzEsc, renderStatus, formatarMoedaBR,
// switchTab, abrirFichaContrato, window.abrirFichaAtivoNoChip,
// window.jspdf, CONFIG_CLIENTE (todos já globais no index.html clássico —
// mesmo acesso que financeiro.js já faz).
// ============================================================================

export const VERSAO = '1.6.2'; // v-check: lido por ⚙️ › Conta › Versões — manter igual ao header

// v1.3.0 (Fase 1 do wrapper de escrita, rollout Financeiro) — emitirEscrita
// é o evento padrão pra "algo mudou que módulos DE FORA deste arquivo podem
// precisar saber" (ver changelog do topo). aoEscrever usado só pelo listener
// interno registrado em fechamentoAtualizarCard(), logo abaixo.
import { emitirEscrita, aoEscrever } from './raiz-eventos.js';

let fechamentoUltimoEstado = null; // último resultado de fn_fechamento_verificar (cache pro Sheet de ações e pro botão dedicado)
let fechamentoCarregando = false;

// v1.1.0 (Entrega F3.1) — status fiscal é da CARTEIRA, não da competência
// selecionada: verificado 1x por sessão, igual financeiroRotinaFechamentoLigada.
let fechamentoRotinaFiscalLigada = null; // null = não verificado ainda; true/false = ligada/desligada
let fechamentoFiscalPendencias = []; // v1.6.0 — linhas de fn_fiscal_pendencias_cadastro

// v1.4.0 (demanda 0e40951a, redesenho do Financeiro) — ids trocados de
// fin-botao-fechamento-* (ícone solto) pra fin-quad-fechamento-* (célula do
// grid 2x2 novo, ver financeiroQuadrantesHtml em financeiro.js).
// v1.5.0 (demanda 7bdcb8d4) — FECHAMENTO_IDS_BOTAO saiu: o botão Fechar/Abrir
// (e os outros 5) é desenhado por financeiro.js a partir do estado publicado
// em window.RZ_FIN_FECHAMENTO / window.RZ_FIN_FISCAL (ver fechamentoPublicarEstado).
const FECHAMENTO_IDS_KPI = {
    pendente: 'fin-kpi-fech-pendente', naoControlado: 'fin-kpi-fech-nao-controlado',
    recebido: 'fin-kpi-fech-recebido', pago: 'fin-kpi-fech-pago',
};

function fechamentoCompetenciaAtual() {
    if (typeof window !== 'undefined' && window.RZ_FIN_COMPETENCIA) return window.RZ_FIN_COMPETENCIA;
    const h = new Date();
    return `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, '0')}-01`;
}

function fechamentoPessoaLogada() {
    return (typeof pessoaIdLogada !== 'undefined' && pessoaIdLogada) ? pessoaIdLogada : null;
}

function fechamentoMoeda(v) {
    return (typeof formatarMoedaBR === 'function') ? formatarMoedaBR(Number(v || 0)) : `R$ ${Number(v || 0).toFixed(2)}`;
}

/** Desenha o card de competência do Fechamento (status + corpo + botão
 * dedicado + KPIs). Chamado 1x por abertura da aba Fechamento e por flip
 * de competência (financeiroRenderCabecalho('conciliacao'), ver
 * financeiro.js) — e também precisa redesenhar o botão dedicado nas
 * outras 2 abas (Recebimentos/Saídas), que não têm corpo/status próprios. */
export async function fechamentoAtualizarCard() {
    // v1.3.0 (Fase 1 do wrapper de escrita) — assina 1x por boot o evento
    // padrão de escrita pra 'competencia' (ver changelog do topo). Guard
    // por window.* de propósito: fechamentoAtualizarCard roda várias vezes
    // por sessão (abrir a aba, trocar de mês, fechar/reabrir), um listener
    // duplicado dispararia o refresh 2x+ a cada escrita.
    if (!window.__rzListenerEscritaFechamentoLigado) {
        window.__rzListenerEscritaFechamentoLigado = true;
        aoEscrever('competencia', () => { fechamentoAtualizarCard(); });
    }
    const elStatus = document.getElementById('fin-fechamento-status');
    const elCorpo = document.getElementById('fin-fechamento-corpo');
    if (elCorpo) elCorpo.textContent = 'Verificando…';
    if (elStatus) elStatus.innerHTML = '';
    fechamentoCarregando = true;
    // v1.5.0 — competência nova ainda não verificada: botões voltam ao estado
    // neutro ("Verificando…") em vez de mostrar o status do mês anterior.
    if (typeof window !== 'undefined') window.RZ_FIN_FECHAMENTO = null;
    fechamentoPublicarEstado();
    try {
        const { data, error } = await dbAuth.rpc('fn_fechamento_verificar', {
            p_cliente_id: CLIENTE_ID_SUPABASE,
            p_competencia: fechamentoCompetenciaAtual(),
        });
        if (error) throw error;
        const linha = (data && data[0]) || null;
        fechamentoUltimoEstado = linha;
        fechamentoRenderCorpo(linha);
    } catch (e) {
        console.error('[fechamento] fn_fechamento_verificar', e);
        fechamentoUltimoEstado = null;
        if (elCorpo) elCorpo.textContent = 'Não consegui verificar o fechamento deste mês agora.';
    } finally {
        fechamentoCarregando = false;
    }
    fechamentoPublicarEstado(); // v1.5.0 — financeiro.js redesenha os 6 botões + cadeado
    fechamentoAtualizarKpis(); // v1.2.0 — não bloqueia o corpo acima
    fechamentoAtualizarFiscal(); // v1.1.0 — não bloqueia o corpo acima; 1x por sessão (guard interno)
}

/** v1.5.0 (demanda 7bdcb8d4, pedido explícito do Nicola 23/09/2026: "Os
 * botoes devem sinalizar seus status... a depender do status da
 * compentencia") — antes (v1.2.0–v1.4.0) este módulo desenhava sozinho a
 * célula Fechar/Abrir (fechamentoRenderBotaoDedicado) e o chip Fiscal
 * (fechamentoRenderFiscalChip). Agora são 6 botões que dependem do mesmo
 * estado (Adicionar trava com a competência fechada, Contador fica verde,
 * Fiscal e Atrasados mostram pendência), então o desenho foi pra UM lugar
 * só — financeiroQuadrantesHtml(), js/financeiro.js — e este módulo só
 * PUBLICA o estado em window e pede o redesenho (ponte window, módulos
 * isolados — mesmo padrão de window.RZ_FIN_COMPETENCIA_FECHADA). */
function fechamentoPublicarEstado() {
    if (typeof window === 'undefined') return;
    const linha = fechamentoUltimoEstado;
    if (linha && !fechamentoCarregando) {
        const uf = linha.ultimo_fechamento || {};
        const p = linha.pendencias || {};
        window.RZ_FIN_FECHAMENTO = {
            status: linha.status,
            fechadoEm: uf.fechado_em || null,
            motivo: linha.motivo_bloqueio || null,
            pendencias: {
                tem: !!p.tem_pendencia,
                recebimentosEmAtraso: Number(p.recebimentos_em_atraso || 0),
                saidasEmAtraso: Number(p.saidas_em_atraso || 0),
            },
        };
    } else if (!linha && !fechamentoCarregando) {
        // falha ao verificar: sai do "Verificando…" (estado neutro de aberta;
        // o toque em Fechar já avisa que o fechamento está indisponível).
        window.RZ_FIN_FECHAMENTO = { status: 'indisponivel', fechadoEm: null, motivo: null, pendencias: { tem: false, recebimentosEmAtraso: 0, saidasEmAtraso: 0 } };
    }
    window.RZ_FIN_FISCAL = (fechamentoRotinaFiscalLigada === null) ? null : {
        ligada: !!fechamentoRotinaFiscalLigada,
        total: fechamentoFiscalPendencias.length,
    };
    if (typeof window.financeiroRedesenharQuadrantes === 'function') window.financeiroRedesenharQuadrantes();
}

/** v1.2.0 — clique do botão dedicado: vai direto pro Sheet de formulário
 * certo, conforme o estado atual (nunca os dois juntos, REGRAS §11.1). */
export function fechamentoAlternarBotao() {
    if (fechamentoCarregando) return;
    const linha = fechamentoUltimoEstado;
    if (!linha || linha.status === 'sem_rotina') {
        if (typeof mostrarToast === 'function') mostrarToast(linha?.motivo_bloqueio || 'Fechamento indisponível para esta empresa.', 'info');
        return;
    }
    if (linha.status === 'concluido') fechamentoAbrirSheetReabrir();
    else fechamentoAbrirSheetFechar();
}

/** v1.2.0 — os 4 KPIs (pendente/não controlado/recebido/pago) do chip
 * Fechamento, mesmo padrão visual dos KPIs de Recebimentos/Saídas — nunca
 * somado no cliente, sempre de fn_financeiro_totalizador_fechamento. */
async function fechamentoAtualizarKpis() {
    const algumEl = document.getElementById(FECHAMENTO_IDS_KPI.pendente);
    if (!algumEl) return; // aba Fechamento ainda não montada nesta sessão
    Object.values(FECHAMENTO_IDS_KPI).forEach(id => { const el = document.getElementById(id); if (el) el.textContent = '...'; });
    try {
        const { data, error } = await dbAuth.rpc('fn_financeiro_totalizador_fechamento', {
            p_cliente_id: CLIENTE_ID_SUPABASE,
            p_competencia: fechamentoCompetenciaAtual(),
        });
        if (error) throw error;
        const l = (data && data[0]) || {};
        const setar = (id, qtde, valor) => {
            const el = document.getElementById(id);
            if (el) el.textContent = `${fechamentoMoeda(valor)} (${qtde || 0})`;
        };
        setar(FECHAMENTO_IDS_KPI.pendente, l.pendente_qtde, l.pendente_valor);
        setar(FECHAMENTO_IDS_KPI.naoControlado, l.nao_controlado_qtde, l.nao_controlado_valor);
        setar(FECHAMENTO_IDS_KPI.recebido, l.recebido_qtde, l.recebido_valor);
        setar(FECHAMENTO_IDS_KPI.pago, l.pago_qtde, l.pago_valor);
    } catch (e) {
        console.error('[fechamento] fn_financeiro_totalizador_fechamento', e);
        Object.values(FECHAMENTO_IDS_KPI).forEach(id => { const el = document.getElementById(id); if (el) el.textContent = 'R$ 0 (0)'; });
    }
}

/** Entrega F3.1 — verifica se a rotina nfse_competencia está ligada e, se
 * sim, busca as pendências do checklist. Status da rotina é verificado 1x
 * por sessão (é da carteira, não da competência). v1.6.0: as pendências vêm
 * de fn_fiscal_pendencias_cadastro (fonte única); forcar=true relê só as
 * pendências (depois de corrigir um cadastro pelo próprio checklist). */
async function fechamentoAtualizarFiscal(forcar = false) {
    if (fechamentoRotinaFiscalLigada !== null && !forcar) { fechamentoRenderFiscalChip(); return; }
    if (fechamentoRotinaFiscalLigada === null) {
        try {
            const { data: rotinas, error: eRot } = await dbAuth.rpc('fn_rotinas_empresa_listar', { p_cliente_id: CLIENTE_ID_SUPABASE });
            if (eRot) throw eRot;
            const linhaRotina = (rotinas || []).find(r => r.codigo === 'nfse_competencia');
            fechamentoRotinaFiscalLigada = !!(linhaRotina && linhaRotina.ligada);
        } catch (e) {
            console.error('[fechamento] fn_rotinas_empresa_listar (fiscal)', e);
            fechamentoRotinaFiscalLigada = false; // falha de rede: botão fica neutro, nunca mostra pendência não confirmada
            fechamentoRenderFiscalChip();
            return;
        }
    }
    if (!fechamentoRotinaFiscalLigada) { fechamentoRenderFiscalChip(); return; }

    try {
        const { data, error } = await dbAuth.rpc('fn_fiscal_pendencias_cadastro', { p_cliente_id: CLIENTE_ID_SUPABASE });
        if (error) throw error;
        fechamentoFiscalPendencias = data || [];
    } catch (e) {
        console.error('[fechamento] fn_fiscal_pendencias_cadastro', e);
        fechamentoFiscalPendencias = []; // não mostra número que não confirmou
    }
    fechamentoRenderFiscalChip();
}

/** v1.6.1 — relê as pendências e abre o checklist (sem depender da rotina). */
export async function fechamentoAbrirChecklistFiscalAtualizado() {
    try {
        const { data, error } = await dbAuth.rpc('fn_fiscal_pendencias_cadastro', { p_cliente_id: CLIENTE_ID_SUPABASE });
        if (error) throw error;
        fechamentoFiscalPendencias = data || [];
    } catch (e) {
        console.error('[fechamento] fn_fiscal_pendencias_cadastro', e);
        if (typeof mostrarToast === 'function') mostrarToast('Não consegui carregar as pendências agora.', 'danger');
        return;
    }
    fechamentoAbrirChecklistFiscal();
}

// v1.5.0 (demanda 7bdcb8d4) — o chip Fiscal virou o botão "Fiscal" dos 6
// (financeiro.js); aqui só publica o estado.
function fechamentoRenderFiscalChip() {
    fechamentoPublicarEstado();
}

/** Checklist fiscal (v1.6.0): o que falta no cadastro para a NFS-e sair,
 * agrupado por Empresa · Locatário · Imóvel. Nunca afirma que a empresa é
 * contribuinte — só mostra o que falta. Nada é emitido a partir daqui. */
const FECHAMENTO_FISCAL_GRUPOS = [
    { chave: 'empresa', titulo: 'Empresa', tipos: ['empresa_sem_documento', 'empresa_sem_municipio'] },
    { chave: 'tomador', titulo: 'Documento do locatário', tipos: ['tomador_sem_documento', 'tomador_documento_invalido'] },
    { chave: 'imovel', titulo: 'Imóvel', tipos: ['imovel_sem_destinacao', 'imovel_sem_municipio', 'imovel_sem_cib'] },
];

export function fechamentoAbrirChecklistFiscal() {
    if (typeof abrirSheet !== 'function') return;
    const esc = (typeof rzEsc === 'function') ? rzEsc : (s) => String(s ?? '');
    const pend = fechamentoFiscalPendencias || [];
    const podeEditarContrato = (typeof podeUsar === 'function') ? !!podeUsar('contratos.editar')?.ok : true;
    const idx = new Map(pend.map((p, i) => [i, p]));
    window.RZ_FIN_FISCAL_PEND = pend; // ponte do onclick (índice → linha), mesmo padrão dos demais window.RZ_FIN_*
    const linhaHtml = (p, i) => {
        const icone = p.entidade_tipo === 'contrato' ? 'user-x' : (p.entidade_tipo === 'empresa' ? 'building-2' : 'home');
        const tom = p.gravidade === 'atencao' ? 'rz-warn' : 'rz-bad';
        return `
        <div class="rz-row rz-link" onclick="fechamentoTratarPendenciaFiscal(${i})">
            <div class="rz-ic ${tom}"><svg data-lucide="${icone}"></svg></div>
            <div class="rz-tx"><b>${esc(p.titulo)}</b><span>${esc(p.detalhe || '')}</span></div>
            <svg data-lucide="chevron-right" class="rz-chev"></svg>
        </div>`;
    };
    const secoes = FECHAMENTO_FISCAL_GRUPOS.map(g => {
        const itens = [...idx.entries()].filter(([, p]) => g.tipos.includes(p.tipo));
        if (!itens.length) return '';
        return `<div class="rz-group">${esc(g.titulo)} (${itens.length})</div>
            <div class="rz-card rz-list">${itens.map(([i, p]) => linhaHtml(p, i)).join('')}</div>`;
    }).join('');
    const vazio = `<div class="rz-empty"><div class="rz-ic"><svg data-lucide="file-check-2"></svg></div><p class="rz-desc">Nenhuma pendência de cadastro para a NFS-e.</p></div>`;
    const dica = podeEditarContrato ? 'Toque num locatário para preencher o CPF/CNPJ aqui mesmo.' : '';
    const corpo = `
        <p class="rz-desc">O que falta no cadastro para emitir a NFS-e quando a obrigatoriedade chegar. Nada é emitido a partir daqui.${dica ? ' ' + dica : ''}</p>
        ${pend.length ? secoes : vazio}`;
    abrirSheet(rzSheetCabecalho('Checklist fiscal', pend.length ? `${pend.length} pendência${pend.length > 1 ? 's' : ''}` : 'Tudo certo') + `<div class="rz-sh-b">${corpo}</div>`);
    if (typeof rzIcones === 'function') rzIcones();
}

/** v1.6.0 — toque numa linha do checklist. Locatário sem documento (D6):
 * campo CPF/CNPJ no próprio Sheet de formulário. Demais: leva ao cadastro
 * certo (ficha do ativo, contrato ou Minha empresa). */
export function fechamentoTratarPendenciaFiscal(i) {
    const p = (window.RZ_FIN_FISCAL_PEND || [])[i];
    if (!p) return;
    const podeEditarContrato = (typeof podeUsar === 'function') ? !!podeUsar('contratos.editar')?.ok : true;
    if (p.entidade_tipo === 'contrato' && podeEditarContrato && typeof abrirSheetForm === 'function') {
        fechamentoAbrirFormDocumentoTomador(p);
        return;
    }
    fecharSheet();
    if (p.entidade_tipo === 'contrato') {
        if (typeof window.abrirFichaContrato === 'function') window.abrirFichaContrato(p.entidade_id);
    } else if (p.entidade_tipo === 'ativo') {
        switchTab('tab-ativos');
        if (typeof window.abrirFichaAtivoNoChip === 'function') window.abrirFichaAtivoNoChip(p.entidade_id, 'resumo');
    } else {
        switchTab('tab-minha-empresa');
    }
}

function fechamentoAbrirFormDocumentoTomador(p) {
    const esc = (typeof rzEsc === 'function') ? rzEsc : (s) => String(s ?? '');
    abrirSheetForm({
        titulo: 'Documento do locatário',
        sub: p.titulo,
        rotuloSalvar: 'Salvar documento',
        corpo: `
            <div class="rz-f">
                <label for="fech-doc-tomador">CPF ou CNPJ <i>*</i></label>
                <input type="text" id="fech-doc-tomador" inputmode="text" autocomplete="off" maxlength="18" placeholder="Só números (CNPJ pode ter letras)">
            </div>
            <p class="rz-desc">${esc(p.detalhe || '')}. Fica gravado no cadastro do locatário em Partes e vale para todos os contratos dele.</p>`,
        aoSalvar: async (corpoEl) => {
            const doc = (corpoEl.querySelector('#fech-doc-tomador')?.value || '').trim();
            if (!doc) { mostrarToast('Informe o CPF ou CNPJ.', 'danger'); return false; }
            const { data, error } = await dbAuth.rpc('fn_contrato_tomador_documento_definir', { p_contrato_id: p.entidade_id, p_documento: doc });
            if (error) { mostrarToast(error.message || 'Não consegui salvar o documento.', 'danger'); return false; }
            emitirEscrita('contrato', { id: p.entidade_id, acao: 'editar' });
            const antes = fechamentoFiscalPendencias.filter(x => x.entidade_tipo === 'contrato').length;
            await fechamentoAtualizarFiscal(true);
            const resolvidos = antes - fechamentoFiscalPendencias.filter(x => x.entidade_tipo === 'contrato').length;
            // o mesmo locatário pode estar em vários contratos (1 cadastro em Partes): o documento vale para todos
            const txt = data?.reaproveitou_parte ? 'Documento salvo — o contrato passou a usar o cadastro que já existia em Partes.'
                : (resolvidos > 1 ? `Documento salvo — vale para os ${resolvidos} contratos deste locatário.` : 'Documento salvo.');
            mostrarToast(txt, 'success');
            setTimeout(() => fechamentoAbrirChecklistFiscal(), 0); // volta ao checklist já atualizado
            return true;
        },
    });
}

function fechamentoRenderCorpo(linha) {
    const elStatus = document.getElementById('fin-fechamento-status');
    const elCorpo = document.getElementById('fin-fechamento-corpo');
    // CORRIGIDO (achado nesta entrega, QUA-01) — o ⋮ de Recebimentos/Saídas
    // (rzAcoesMensalidade/rzAcoesDespesa, financeiro.js) precisa saber se a
    // competência em tela está fechada, pra parar de oferecer
    // Estornar/"Não incluir na contabilidade" nesse caso (REGRAS §11.1: só
    // Recibo e Ver detalhes continuam disponíveis — o trigger de banco já
    // bloqueia a gravação, mas o menu não devia nem oferecer a ação).
    // Espelhado em window, mesmo padrão de window.RZ_FIN_COMPETENCIA —
    // módulos isolados não se importam.
    if (typeof window !== 'undefined') window.RZ_FIN_COMPETENCIA_FECHADA = !!(linha && linha.status === 'concluido');
    if (!linha) { if (elCorpo) elCorpo.textContent = ''; return; }

    if (linha.status === 'sem_rotina') {
        if (elStatus) elStatus.innerHTML = '';
        if (elCorpo) elCorpo.textContent = linha.motivo_bloqueio || 'Rotina de fechamento desligada.';
        return;
    }

    if (linha.status === 'concluido') {
        if (elStatus && typeof renderStatus === 'function') elStatus.innerHTML = renderStatus('ok', 'Fechado');
        const uf = linha.ultimo_fechamento || {};
        const fin = uf.recebimentos ? uf : null; // ultimo_fechamento carrega recebimentos/saidas/meta/fechado_em direto
        const partes = [];
        if (fin) {
            partes.push(`Previsto ${fechamentoMoeda(fin.recebimentos.previsto)} · Recebido ${fechamentoMoeda(fin.recebimentos.realizado)} · Pago ${fechamentoMoeda(fin.saidas.realizado)}`);
        }
        if (uf.fechado_em) {
            const d = new Date(uf.fechado_em);
            partes.push(`Fechada em ${d.toLocaleDateString('pt-BR')}`);
        }
        if (uf.meta && uf.meta.observacao) partes.push(`Observação: ${uf.meta.observacao}`);
        if (linha.pendencias && linha.pendencias.tem_pendencia) partes.push('Há lançamentos em atraso neste mês desde o fechamento.');
        if (elCorpo) elCorpo.textContent = partes.join(' · ');
        return;
    }

    // aberto
    if (elStatus) elStatus.innerHTML = '';
    if (elCorpo) {
        elCorpo.textContent = (linha.pendencias && linha.pendencias.tem_pendencia)
            ? 'Ainda não fechada — há lançamentos em atraso neste mês.'
            : 'Ainda não fechada.';
    }
}

function fechamentoResumoPendencia(linha) {
    if (!linha || !linha.pendencias || !linha.pendencias.tem_pendencia) return null;
    const partes = [];
    if (Number(linha.pendencias.recebimentos_em_atraso) > 0) partes.push(`${fechamentoMoeda(linha.pendencias.recebimentos_em_atraso)} em atraso (Recebimentos)`);
    if (Number(linha.pendencias.saidas_em_atraso) > 0) partes.push(`${fechamentoMoeda(linha.pendencias.saidas_em_atraso)} vencido (Saídas)`);
    return partes.join(' · ') || null;
}

/** v1.2.0 — ⋮ do card passa a abrir só "Compartilhar com o contador"
 * (Fechar/Reabrir saiu daqui, ver fechamentoAlternarBotao acima). */
export function fechamentoAbrirAcoes() {
    if (typeof abrirSheetAcoes !== 'function') return;
    // v1.4.0 (demanda 0e40951a) — "Checklist fiscal" (chip #fin-fiscal-chip
    // que morava solto no card de competência) voltou a viver aqui — o
    // pedido explícito do Nicola foi tirar a TAG do card, não a
    // funcionalidade. Só aparece se a rotina nfse_competencia estiver
    // ligada (mesma regra de sempre — fechamentoRotinaFiscalLigada).
    const acoes = [];
    if (fechamentoRotinaFiscalLigada) {
        const total = fechamentoFiscalPendencias.length;
        acoes.push({ icone: 'file-check-2', titulo: 'Checklist fiscal', sub: total === 0 ? 'Tudo certo' : `${total} pendência(s)`, aoTocar: fechamentoAbrirChecklistFiscal });
    }
    acoes.push({ icone: 'send', titulo: 'Compartilhar com o contador', aoTocar: fechamentoAbrirCompartilharContador });
    abrirSheetAcoes({ titulo: 'Fechamento da competência', acoes });
}

function fechamentoAbrirSheetFechar() {
    if (typeof abrirSheetForm !== 'function') return;
    const linha = fechamentoUltimoEstado;
    const avisoPendencia = fechamentoResumoPendencia(linha);
    abrirSheetForm({
        titulo: 'Fechar a competência',
        sub: avisoPendencia ? `Ainda há pendência (${avisoPendencia}) — fechar mesmo assim registra o retrato com isso em aberto.` : 'O retrato desta competência fica registrado, mesmo que algo mude depois.',
        rotuloSalvar: 'Fechar a competência',
        corpo: `<label class="text-xs font-bold text-slate-600">Observação (opcional)</label>
                <textarea id="fechamento-obs" class="w-full p-2.5 border rounded-lg text-sm mt-1" rows="3" placeholder="Ex.: fechado após conciliar o extrato do mês"></textarea>`,
        aoSalvar: async (corpoEl) => {
            const obs = corpoEl.querySelector('#fechamento-obs')?.value.trim() || null;
            const { error } = await dbAuth.rpc('fn_fechamento_fechar', {
                p_cliente_id: CLIENTE_ID_SUPABASE,
                p_competencia: fechamentoCompetenciaAtual(),
                p_observacao: obs,
                p_pessoa_id: fechamentoPessoaLogada(),
            });
            if (error) { if (typeof mostrarToast === 'function') mostrarToast('Erro ao fechar: ' + error.message, 'danger'); return false; }
            // v1.3.0 (Fase 1 do wrapper de escrita) — ver changelog do topo.
            emitirEscrita('competencia', { competencia: fechamentoCompetenciaAtual(), acao: 'fechar' });
            if (typeof mostrarToast === 'function') mostrarToast('Competência fechada.', 'success');
            fechamentoAtualizarCard();
        },
    });
}

function fechamentoAbrirSheetReabrir() {
    if (typeof abrirSheetForm !== 'function') return;
    const ocorrenciaId = fechamentoUltimoEstado?.ocorrencia_id;
    if (!ocorrenciaId) return;
    abrirSheetForm({
        titulo: 'Reabrir a competência',
        sub: 'Desfaz o fechamento — o retrato anterior continua registrado, e um novo é gerado no próximo fechamento (inclusive o pacote do contador). Explique o motivo.',
        rotuloSalvar: 'Reabrir a competência',
        corpo: `<label class="text-xs font-bold text-slate-600">Motivo da reabertura</label>
                <textarea id="fechamento-motivo" class="w-full p-2.5 border rounded-lg text-sm mt-1" rows="3" placeholder="Ex.: preciso corrigir um lançamento deste mês"></textarea>`,
        aoSalvar: async (corpoEl) => {
            const motivo = corpoEl.querySelector('#fechamento-motivo')?.value.trim() || '';
            if (!motivo) { if (typeof mostrarToast === 'function') mostrarToast('Informe o motivo da reabertura.', 'danger'); return false; }
            const { error } = await dbAuth.rpc('fn_fechamento_reabrir', {
                p_ocorrencia_id: ocorrenciaId,
                p_motivo: motivo,
                p_pessoa_id: fechamentoPessoaLogada(),
            });
            if (error) { if (typeof mostrarToast === 'function') mostrarToast('Erro ao reabrir: ' + error.message, 'danger'); return false; }
            // v1.3.0 (Fase 1 do wrapper de escrita) — ver changelog do topo.
            emitirEscrita('competencia', { competencia: fechamentoCompetenciaAtual(), acao: 'reabrir', ocorrenciaId });
            if (typeof mostrarToast === 'function') mostrarToast('Competência reaberta.', 'success');
            fechamentoAtualizarCard();
        },
    });
}

// ----------------------------------------------------------------------------
// v1.2.0 — Compartilhar com o contador (Entrega F.3 redesenhada)
// ----------------------------------------------------------------------------

/** Sheet: escolher contador cadastrado + canal + 1 ou mais competências
 * já fechadas. Sem contador cadastrado ou sem competência fechada, avisa
 * e não abre (nada de sheet vazio). */
export async function fechamentoAbrirCompartilharContador() {
    if (typeof abrirSheetForm !== 'function') return;

    let contadores = [];
    try {
        // v1.6.0 (D2) — fonte única: Partes (fn_contadores_empresa). id = parte.
        const { data, error } = await dbAuth.rpc('fn_contadores_empresa', { p_cliente_id: CLIENTE_ID_SUPABASE });
        if (error) throw error;
        contadores = (data || []).map(c => ({ id: c.parte_id, nome: c.nome, whatsapp: c.whatsapp, email: c.email }));
    } catch (e) {
        console.error('[fechamento] buscar contador cadastrado', e);
        if (typeof mostrarToast === 'function') mostrarToast('Não consegui buscar o contador cadastrado agora.', 'danger');
        return;
    }
    if (!contadores.length) {
        // CORRIGIDO — o rótulo original apontava pra "Empresa › Rotinas",
        // destino errado: contador se cadastra em Partes (chip Prestadores,
        // campo "Atua como prestador?" → Contador), mesma tela de
        // administradora/síndico/manutencista (index.html, abrirFormParteSheet).
        if (typeof mostrarToast === 'function') mostrarToast('Nenhum contador cadastrado ainda — cadastre agora.', 'info');
        if (typeof window.abrirCadastroContador === 'function') window.abrirCadastroContador();
        return;
    }

    let fechadas = [];
    try {
        const { data, error } = await dbAuth.rpc('fn_fechamento_listar_fechadas', { p_cliente_id: CLIENTE_ID_SUPABASE, p_limite: 12 });
        if (error) throw error;
        fechadas = data || [];
    } catch (e) {
        console.error('[fechamento] listar competências fechadas', e);
        if (typeof mostrarToast === 'function') mostrarToast('Não consegui listar as competências fechadas agora.', 'danger');
        return;
    }
    if (!fechadas.length) {
        if (typeof mostrarToast === 'function') mostrarToast('Nenhuma competência fechada ainda.', 'info');
        return;
    }

    const rzEscSafe = (typeof rzEsc === 'function') ? rzEsc : (s) => String(s ?? '');
    const rotuloMes = (iso) => new Date(iso + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    const opcoesContador = contadores.map(c => `<option value="${c.id}">${rzEscSafe(c.nome)}</option>`).join('');
    const opcoesCompetencia = fechadas.map((f, i) => `
        <label class="rz-row" style="cursor:pointer">
            <input type="checkbox" class="fechamento-comp-check" value="${f.competencia}" ${i === 0 ? 'checked' : ''} style="margin-right:10px">
            <div class="rz-tx"><b>${rzEscSafe(rotuloMes(f.competencia))}</b></div>
        </label>`).join('');

    abrirSheetForm({
        titulo: 'Compartilhar com o contador',
        sub: 'Gera 1 PDF por competência selecionada, a partir do retrato já fechado (nunca recalculado).',
        rotuloSalvar: 'Gerar e compartilhar',
        corpo: `
            <label class="text-xs font-bold text-slate-600">Contador</label>
            <select id="fechamento-contador-sel" class="w-full p-2.5 border rounded-lg text-sm mt-1 mb-3">${opcoesContador}</select>
            <label class="text-xs font-bold text-slate-600">Canal</label>
            <select id="fechamento-canal-sel" class="w-full p-2.5 border rounded-lg text-sm mt-1 mb-3">
                <option value="whatsapp">WhatsApp</option>
                <option value="email">E-mail</option>
            </select>
            <label class="text-xs font-bold text-slate-600">Competências</label>
            <div class="rz-card rz-list mt-1">${opcoesCompetencia}</div>
        `,
        aoSalvar: async (corpoEl) => {
            const contadorId = corpoEl.querySelector('#fechamento-contador-sel')?.value;
            const canal = corpoEl.querySelector('#fechamento-canal-sel')?.value || 'whatsapp';
            const comps = [...corpoEl.querySelectorAll('.fechamento-comp-check:checked')].map(el => el.value);
            if (!comps.length) { if (typeof mostrarToast === 'function') mostrarToast('Selecione ao menos uma competência.', 'danger'); return false; }
            await fechamentoGerarEcompartilhar(contadorId, canal, comps);
        },
    });
}

/** Monta 1 pacote por competência (fn_pacote_contador_montar, lendo o
 * bloco 'contabil' do snapshot), gera os PDFs (jsPDF) e compartilha:
 * navigator.share() com os arquivos de verdade quando o navegador
 * suporta (a maioria dos celulares — inclusive pra WhatsApp); senão baixa
 * o(s) PDF(s) e abre wa.me/mailto só com o texto-resumo, avisando que o
 * PDF precisa ser anexado à mão (nenhum dos dois esquemas de URL
 * consegue anexar arquivo — limitação do próprio navegador/protocolo,
 * não do Raiz). */
async function fechamentoGerarEcompartilhar(contadorId, canal, competencias) {
    if (typeof mostrarToast === 'function') mostrarToast('Gerando pacote…', 'info');
    const pacotes = [];
    let contadorInfo = null;
    for (const comp of competencias) {
        try {
            const { data, error } = await dbAuth.rpc('fn_pacote_contador_montar', {
                p_cliente_id: CLIENTE_ID_SUPABASE, p_competencia: comp, p_contador_parte_id: contadorId,
            });
            if (error) throw error;
            const linha = data && data[0];
            if (!linha) continue;
            contadorInfo = contadorInfo || { nome: linha.contador_nome, whatsapp: linha.contador_whatsapp, email: linha.contador_email };
            pacotes.push(linha);
        } catch (e) {
            console.error('[fechamento] montar pacote do contador', comp, e);
            if (typeof mostrarToast === 'function') mostrarToast(`Erro ao montar o pacote de ${comp}: ${e.message}`, 'danger');
        }
    }
    if (!pacotes.length) return;

    let arquivos;
    try {
        arquivos = pacotes.map(p => fechamentoMontarPdfPacote(p));
    } catch (e) {
        console.error('[fechamento] montar PDF do pacote', e);
        if (typeof mostrarToast === 'function') mostrarToast('Não consegui montar o PDF agora.', 'danger');
        return;
    }

    let compartilhouNativo = false;
    if (typeof navigator !== 'undefined' && navigator.canShare) {
        try {
            const files = arquivos.map(a => new File([a.blob], a.nome, { type: 'application/pdf' }));
            if (navigator.canShare({ files })) {
                await navigator.share({ files, title: 'Pacote do contador', text: fechamentoTextoResumo(pacotes) });
                compartilhouNativo = true;
            }
        } catch (e) {
            compartilhouNativo = false; // usuário cancelou ou o navegador recusou — segue pro fallback abaixo
        }
    }

    if (!compartilhouNativo) {
        arquivos.forEach(a => a.pdf.save(a.nome));
        const texto = encodeURIComponent(fechamentoTextoResumo(pacotes) + `\n\n(${arquivos.length > 1 ? 'PDFs baixados' : 'PDF baixado'} — anexe antes de enviar)`);
        if (canal === 'whatsapp') {
            const numero = (contadorInfo?.whatsapp || '').replace(/\D/g, '');
            if (!numero) { if (typeof mostrarToast === 'function') mostrarToast('Contador sem WhatsApp cadastrado — PDF baixado, envie manualmente.', 'info'); return; }
            window.open(`https://wa.me/${numero}?text=${texto}`, '_blank');
        } else {
            const email = contadorInfo?.email || '';
            if (!email) { if (typeof mostrarToast === 'function') mostrarToast('Contador sem e-mail cadastrado — PDF baixado, envie manualmente.', 'info'); return; }
            window.open(`mailto:${email}?subject=${encodeURIComponent('Pacote do fechamento')}&body=${texto}`, '_blank');
        }
    }
    if (typeof mostrarToast === 'function') mostrarToast('Pacote pronto.', 'success');
}

function fechamentoOrigemRotulo(o) {
    if (!o || o === 'manual') return 'Manual';
    if (o === 'extrato') return 'Extrato bancário';
    if (String(o).startsWith('automatico:')) return 'Automático · ' + String(o).split(':')[1];
    return String(o);
}

/** Constrói o PDF do pacote a partir do bloco 'contabil' do snapshot
 * (linha.dados.recebimentos/saidas/repasses) — mesmo padrão de
 * baixarRelatorioPdfLocal() no index.html (jsPDF puro, sem
 * html2canvas). */
function fechamentoMontarPdfPacote(linha) {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    const margin = 12;
    let y = 15;
    const mesRotulo = new Date(linha.competencia + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    const nomeEmpresa = (typeof CONFIG_CLIENTE !== 'undefined' && CONFIG_CLIENTE && CONFIG_CLIENTE.nomeEmpresa) ? CONFIG_CLIENTE.nomeEmpresa : 'RAIZ PATRIMÔNIO';

    pdf.setFont('Helvetica', 'bold'); pdf.setFontSize(14); pdf.setTextColor(26, 54, 93);
    pdf.text(`${nomeEmpresa.toUpperCase()} — PACOTE DO CONTADOR`, margin, y);
    pdf.setFont('Helvetica', 'normal'); pdf.setFontSize(10); pdf.setTextColor(113, 128, 150);
    y += 7; pdf.text(`Competência: ${mesRotulo}`, margin, y);
    y += 5; pdf.text(`Fechado em: ${new Date(linha.fechado_em).toLocaleString('pt-BR')}`, margin, y);
    y += 3; pdf.line(margin, y + 2, pdf.internal.pageSize.getWidth() - margin, y + 2);
    y += 10;

    const dados = linha.dados || {};
    const recebimentos = dados.recebimentos || [];
    const saidas = dados.saidas || [];
    const repasses = dados.repasses || [];

    const totalRec = recebimentos.reduce((s, i) => s + Number(i.valor || 0), 0);
    const totalSai = saidas.reduce((s, i) => s + Number(i.valor || 0), 0);
    const totalRep = repasses.reduce((s, i) => s + Number(i.valor || 0), 0);
    pdf.setFont('Helvetica', 'bold'); pdf.setFontSize(10); pdf.setTextColor(26, 54, 93);
    pdf.text(`Recebido: ${fechamentoMoeda(totalRec)}   ·   Pago: ${fechamentoMoeda(totalSai)}   ·   Repasses: ${fechamentoMoeda(totalRep)}`, margin, y);
    y += 10;

    const secao = (titulo, itens, colunas) => {
        if (y > 265) { pdf.addPage(); y = 15; }
        pdf.setFont('Helvetica', 'bold'); pdf.setFontSize(11); pdf.setTextColor(26, 54, 93);
        pdf.text(`${titulo} (${itens.length})`, margin, y); y += 6;
        pdf.setFont('Helvetica', 'normal'); pdf.setFontSize(9); pdf.setTextColor(45, 55, 72);
        if (!itens.length) { pdf.text('Nenhum lançamento.', margin, y); y += 8; return; }
        itens.forEach(it => {
            if (y > 275) { pdf.addPage(); y = 15; }
            pdf.text(colunas(it), margin, y);
            y += 5.5;
        });
        y += 5;
    };

    secao('Recebimentos', recebimentos, (i) =>
        `${i.data_pgto ? new Date(i.data_pgto).toLocaleDateString('pt-BR') : '—'}  ·  ${fechamentoMoeda(i.valor)}  ·  ${fechamentoOrigemRotulo(i.origem)}`);
    secao('Saídas', saidas, (i) =>
        `${i.data_pagamento ? new Date(i.data_pagamento).toLocaleDateString('pt-BR') : '—'}  ·  ${fechamentoMoeda(i.valor)}  ·  ${i.categoria || ''}  ·  ${fechamentoOrigemRotulo(i.origem)}`);
    secao('Repasses', repasses, (i) =>
        `${i.data ? new Date(i.data).toLocaleDateString('pt-BR') : '—'}  ·  ${fechamentoMoeda(i.valor)}  ·  ${i.razao_social || ''}`);

    const nomeArquivo = `pacote-contador-${linha.competencia}.pdf`;
    return { pdf, blob: pdf.output('blob'), nome: nomeArquivo };
}

function fechamentoTextoResumo(pacotes) {
    const linhas = pacotes.map(p => {
        const mes = new Date(p.competencia + 'T00:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        const dados = p.dados || {};
        const totalRec = (dados.recebimentos || []).reduce((s, i) => s + Number(i.valor || 0), 0);
        const totalSai = (dados.saidas || []).reduce((s, i) => s + Number(i.valor || 0), 0);
        return `${mes}: recebido ${fechamentoMoeda(totalRec)}, pago ${fechamentoMoeda(totalSai)}`;
    });
    return `Pacote do fechamento:\n${linhas.join('\n')}`;
}
