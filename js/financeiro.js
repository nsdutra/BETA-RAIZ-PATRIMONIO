// ============================================================================
// financeiro.js — Raiz Patrimônio · Financeiro (Recebimentos · Atrasados · Saídas
//                  · conciliação de extrato · recibo · detalhe do recebimento)
// Versão: 1.2.0 · 10/09/2026
//
// v1.2.0 — módulo Apoio ao Contador, etapa 2B (investigação + fix mínimo,
// 10/09/2026): a importação de extrato levava o documento (CPF/CNPJ) só até
// a classificação, nunca até extrato_fingerprints (documento_original,
// Etapa 1, ficava sempre null). Corrigido. E o resultado do match de
// entrada passa a ser espelhado no próprio fingerprint (status_conciliacao/
// destino_tipo/destino_id) — só isso, NADA da lógica de match em si mudou —
// pra uma futura tela unificada (protótipo já aprovado) poder ler entrada e
// saída pela mesma fonte. Achado no caminho: saída hoje só reconhece
// repasse pros sócios conhecidos; todo o resto (condomínio, DARF, boleto de
// terceiro) já virava fingerprint mas era descartado — com
// documento_original preenchido, essas linhas já ficam prontas pra tela de
// conciliação de saída usar (fn_extrato_sugerir_destino etc., Etapa 2A) sem
// precisar de mais nenhuma mudança na importação.
//
// v1.1.0 — módulo Apoio ao Contador, item 6 do plano (10/09/2026):
// gerarMensalidades() ("Gerar Mês") passa a chamar fn_gerar_mensalidades_
// competencia (banco) em vez da função JS local — fonte única a partir de
// agora, compartilhada com o disparo automático de contratos.js e o cron.
// saveAll() não entra mais nesta rota; recarrega mensalidades direto do
// banco depois da RPC.
//
// R8 — FRAGMENTAÇÃO, FATIA 1 (A.8, roteiro v4.7). Primeiro corte do
// Financeiro pra fora do index.html (Beta v1.138.0). Decisão do Nicola
// (06/09): "o definitivo de uma vez, o padrão mesmo" — ES module carregado
// SOB DEMANDA via import() no switchTab (mesmo mecanismo de
// js/ativos/ativos-boot.js e js/cadastros.js), não script clássico nem
// module carregado no boot.
//
// O QUE MORA AQUI (camada de tela + ações das abas tab-mensal /
// tab-inadimplencia / tab-saidas / tab-recebimento-detalhe):
//   · Recebimentos: renderMensalidades, sheets ⋮ (rzAcoes*), dar baixa /
//     estornar / excluir lançamento, Gerar mês, detalhe do recebimento.
//   · Atrasados: renderInadimplencia, cobrança por WhatsApp.
//   · Saídas: renderSaidas, popup de despesa (novo/editar/pagar/estornar/
//     excluir), filtros, entrada "Ver tudo em Saídas" vinda da ficha do ativo.
//   · Conciliação: importar extrato (planilha local ou IA), conciliar,
//     reprocessar, painel de pendências (vincular/confirmar/descartar).
//   · Recibo: sheet de opções (visualizar/PDF/WhatsApp/e-mail) e observação.
//
// O QUE FICOU NO index.html, DE PROPÓSITO (relação, não fusão — §18.3 do Cofre):
//   · Dados e sincronização: `mensalidades`, `lancamentos`, `pendenciasExtrato`,
//     `repasses`, carregar*/sincronizar*Supabase, normalizarMensalidade,
//     gerarMensalidadesParaCompetencia/valorVigenteEm (o contrato também
//     gera mês), mensalidadeEmAtraso/AVencer (Alertas e Visão Geral usam).
//   · Motor de PDF do recibo/relatórios (baixarArquivoPdfLocal,
//     ejecutarCanalComunicação, activeMenId/activeConId) — compartilhado com
//     Resultados. Este módulo só ABRE o sheet e delega.
//   · Helpers de uso geral: escapeHtmlSaidas (16 leitores fora daqui),
//     alternarGrupoSocio/gruposSociosFechados (Distribuição também usa),
//     competenciaParaData/dataParaCompetencia (a cópia duplicada que existia
//     dentro do bloco de Saídas foi apagada — vale a do index, que trata nulo
//     e faz padStart; saída idêntica pros valores válidos).
//   · O HTML das abas (filtros, painéis) — sai daqui quando o Financeiro
//     passar pela gramática própria (Financeiro+, A.6): mover markup 2x
//     seria retrabalho.
//
// COMO É CHAMADO:
//   · switchTab('tab-mensal' | 'tab-inadimplencia' | 'tab-saidas') →
//     carregarFinanceiro().then(m => m.montarAbaFinanceiro(tabId)).
//   · Quem chama de fora (onclick do HTML estático, ficha do contrato,
//     cofre-ativos.js/cofre-controles.js via window.*) passa pelas PONTES
//     globais instaladas no index.html: window[nome] = (...a) =>
//     carregarFinanceiro().then(m => m[nome](...a)). Nenhum HTML mudou.
//   · Ganchos de recarga de dados (saveAll, salvar contrato, carga inicial)
//     usam rzFinSeCarregado('renderX') — só redesenham se o módulo já está
//     no ar; ao abrir a aba depois, montarAbaFinanceiro desenha do zero.
//
// ESTADO GLOBAL LIDO/ESCRITO DAQUI (declarado no index, escopo léxico
// global compartilhado): mensalidades, lancamentos, pendenciasExtrato,
// extratoFingerprints, partesParaSelect (invalida cache), activeMenId,
// activeConId, contratos, imoveis, repasses, dbAuth, CONFIG_CLIENTE,
// CLIENTE_ID_SUPABASE, fichaImovelAtualId, SOCIOS_CONHECIDOS,
// administradoras, manutencistas. Estado EXCLUSIVO do Financeiro virou
// `let` de módulo (7 variáveis abaixo).
//
// INDENTAÇÃO: mantida a de origem (8 espaços) de propósito — vários
// template literals (texto de WhatsApp, HTML) contêm quebras de linha;
// reindentar mudaria strings. Diff contra o index anterior fica 1:1.
//
// Código é strict por ser module: varredura prévia não achou global
// implícita, `arguments` nem `with` (o único `this` está dentro de string).
// ============================================================================

export const VERSAO = '1.2.0'; // v-check: lido por ⚙️ › Conta › Versões — manter igual ao header

/** Ponto de entrada do switchTab (1 chamada por troca de aba; barato). */
export function montarAbaFinanceiro(tabId) {
    if (tabId === 'tab-mensal') { renderMensalidades(); renderPendenciasExtrato(); }
    else if (tabId === 'tab-inadimplencia') { renderInadimplencia(); }
    else if (tabId === 'tab-saidas') { renderSaidas(); }
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

        let gruposSaidasAbertos = null;

        let gruposMensalAbertos = null; // null = ainda não inicializado (abre só o mês mais recente)

        // v1.52.0 — overlay de busca da aba Cobrança, mesmo padrão.
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

        export function popularFiltrosSaidas() {
            const selComp = document.getElementById('saidas-filtro-competencia');
            const selAtivo = document.getElementById('saidas-filtro-ativo-select');
            const selFornecedor = document.getElementById('saidas-filtro-fornecedor');
            if (!selComp || !selAtivo || !selFornecedor) return;

            const valComp = selComp.value || 'todos';
            const valAtivo = selAtivo.value || 'todos';
            const valForn = selFornecedor.value || 'todos';

            const competencias = [...new Set(lancamentos.map(d => dataParaCompetencia(d.competencia)))]
                .sort((a, b) => { const [ma, aa] = a.split('/'); const [mb, ab] = b.split('/'); return (ab + mb).localeCompare(aa + ma); });
            selComp.innerHTML = '<option value="todos">Todas</option>' + competencias.map(c => `<option value="${c}">${c}</option>`).join('');
            selComp.value = competencias.includes(valComp) ? valComp : 'todos';

            const ativosUsados = [...new Map(lancamentos.filter(d => d.ativoId).map(d => [d.ativoId, d.ativoNome])).entries()];
            selAtivo.innerHTML = '<option value="todos">Todos</option>' + ativosUsados.map(([id, nome]) => `<option value="${id}">${escapeHtmlSaidas(nome)}</option>`).join('');
            selAtivo.value = ativosUsados.some(([id]) => id === valAtivo) ? valAtivo : 'todos';

            const fornecedoresUsados = [...new Map(lancamentos.filter(d => d.parteId).map(d => [d.parteId, d.parteNome])).entries()];
            selFornecedor.innerHTML = '<option value="todos">Todos</option>' + fornecedoresUsados.map(([id, nome]) => `<option value="${id}">${escapeHtmlSaidas(nome)}</option>`).join('');
            selFornecedor.value = fornecedoresUsados.some(([id]) => id === valForn) ? valForn : 'todos';
        }

        export function renderSaidas() {
            const container = document.getElementById('lista-saidas');
            if (!container) return;

            popularFiltrosSaidas();

            const fComp = document.getElementById('saidas-filtro-competencia')?.value || 'todos';
            const fStatus = document.getElementById('saidas-filtro-status')?.value || 'todos';
            const fCategoria = document.getElementById('saidas-filtro-categoria')?.value || 'todos';
            const fAtivo = document.getElementById('saidas-filtro-ativo')?.value || 'todos';
            const fFornecedor = document.getElementById('saidas-filtro-fornecedor')?.value || 'todos';
            const termoBusca = (document.getElementById('saidas-busca-texto')?.value || '').trim().toLowerCase();

            const filtradas = lancamentos.filter(d => {
                if (fComp !== 'todos' && dataParaCompetencia(d.competencia) !== fComp) return false;
                if (fCategoria !== 'todos' && d.categoria !== fCategoria) return false;
                if (fAtivo !== 'todos' && d.ativoId !== fAtivo) return false;
                if (fFornecedor !== 'todos' && d.parteId !== fFornecedor) return false;
                const atrasada = estaAtrasadaDespesa(d);
                if (fStatus === 'pago' && d.status !== 'realizado') return false;
                if (fStatus === 'atrasado' && !atrasada) return false;
                if (fStatus === 'a_vencer' && (d.status === 'realizado' || atrasada)) return false;
                if (termoBusca) {
                    const campos = [d.descricao, d.parteNome, d.ativoNome];
                    if (!campos.some(c => (c || '').toLowerCase().includes(termoBusca))) return false;
                }
                return true;
            });

            // ---- resumo (hero) — sempre sobre TODAS as saídas da
            // competência mais recente do conjunto filtrado, não sobre a
            // lista já filtrada por status (senão o resumo "sumiria"
            // junto com o filtro que ele mesmo descreve).
            const competenciaAtual = dataParaCompetencia(new Date().toISOString().slice(0, 10));
            const doMes = lancamentos.filter(d => dataParaCompetencia(d.competencia) === competenciaAtual);
            const totalMes = doMes.reduce((s, d) => s + d.valor, 0);
            const totalPago = doMes.filter(d => d.status === 'realizado').reduce((s, d) => s + d.valor, 0);
            const totalAtrasado = doMes.filter(d => estaAtrasadaDespesa(d)).reduce((s, d) => s + d.valor, 0);
            const totalAVencer = totalMes - totalPago - totalAtrasado;
            document.getElementById('saidas-resumo-competencia').textContent = competenciaAtual;
            document.getElementById('saidas-resumo-total').textContent = formatarMoedaBR(totalMes);
            document.getElementById('saidas-resumo-pago').textContent = formatarMoedaBR(totalPago);
            document.getElementById('saidas-resumo-avencer').textContent = formatarMoedaBR(totalAVencer);
            document.getElementById('saidas-resumo-atrasado').textContent = formatarMoedaBR(totalAtrasado);

            // ---- lista agrupada por competência, mesmo padrão de Recebimentos
            const grupos = {};
            filtradas.forEach(d => { const c = dataParaCompetencia(d.competencia); (grupos[c] = grupos[c] || []).push(d); });
            const competenciasOrdenadas = Object.keys(grupos).sort((a, b) => {
                const [ma, aa] = a.split('/'), [mb, ab] = b.split('/');
                return (ab + mb).localeCompare(aa + ma);
            });

            if (gruposSaidasAbertos === null) {
                gruposSaidasAbertos = new Set(competenciasOrdenadas.length > 0 ? [competenciasOrdenadas[0]] : []);
            }

            if (!competenciasOrdenadas.length) {
                container.innerHTML = `<p class="text-xs text-center py-8" style="color:var(--sage)">Nenhuma despesa encontrada.</p>`;
                return;
            }

            container.innerHTML = competenciasOrdenadas.map(comp => {
                const itens = grupos[comp];
                const totalGrupo = itens.reduce((s, d) => s + d.valor, 0);
                const aberto = gruposSaidasAbertos.has(comp);

                // v1.114.0 (fatia 5) — .rz-row com status nas 5 semânticas; o
                // toque abre a despesa (formulário existente, abrirEditarDespesa).
                const rsS = (sem, t) => (typeof renderStatus === 'function') ? renderStatus(sem, t) : `<span class="rz-st rz-${sem}">${t}</span>`;
                const cards = itens.map(d => {
                    const atrasada = estaAtrasadaDespesa(d);
                    const pago = d.status === 'realizado';
                    const st = pago ? rsS('ok', 'Pago') : atrasada ? rsS('bad', 'Em atraso') : rsS('run', 'A pagar');
                    const ic = pago ? 'arrow-up-right' : atrasada ? 'alarm-clock' : 'clock';
                    return `
                        <div class="rz-row rz-link" onclick="abrirEditarDespesa('${d.id}')">
                            <div class="rz-ic${atrasada && !pago ? ' rz-bad' : ''}"><svg data-lucide="${ic}"></svg></div>
                            <div class="rz-tx"><b>${escapeHtmlSaidas(d.descricao)}</b><span>${rotuloCategoriaSaida(d.categoria)}${d.parteNome ? ' · ' + escapeHtmlSaidas(d.parteNome) : ''}${d.ativoNome ? ' · ' + escapeHtmlSaidas(d.ativoNome) : ''}${d.vencimento ? ' · ' + (pago ? 'pago' : 'vence') + ' ' + formatarDataBR(pago && d.dataPagamento ? d.dataPagamento : d.vencimento) : ''}${d.reembolsavel ? ' · reembolsável' : ''}</span></div>
                            <div class="rz-rt"><b class="rz-out">− ${formatarMoedaBR(d.valor)}</b>${st}</div>
                            <svg data-lucide="chevron-right" class="rz-chev"></svg>
                        </div>`;
                }).join('');
                return `
                    <div class="rz-group" style="display:flex;align-items:center;gap:8px;cursor:pointer" onclick="alternarGrupoSaidas('${comp}')">
                        <span style="flex:1">${comp} · ${formatarMoedaBR(totalGrupo)}</span>
                        <svg data-lucide="chevron-down" style="width:16px;height:16px;transform:rotate(${aberto ? '180' : '0'}deg)"></svg>
                    </div>
                    <div class="rz-card rz-list ${aberto ? '' : 'hidden'}">${cards}</div>`;
            }).join('');

            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        export function rotuloCategoriaSaida(v) {
            const mapa = { iptu: 'IPTU', condominio: 'Condomínio', manutencao: 'Manutenção', seguro: 'Seguro', taxa_adm: 'Taxa administrativa', tributo: 'Tributo', repasse_socio: 'Repasse a sócio', reembolso: 'Reembolso', aluguel: 'Aluguel (repasse a terceiro)', outro: 'Outro' };
            return mapa[v] || v;
        }

        export function alternarGrupoSaidas(comp) {
            if (gruposSaidasAbertos.has(comp)) gruposSaidasAbertos.delete(comp); else gruposSaidasAbertos.add(comp);
            renderSaidas();
        }

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
            const [ativosOpts, partesOpts] = await Promise.all([carregarAtivosParaSelectSupabase(), carregarPartesParaSelectSupabase()]);
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
            const optsCategorias = ['iptu', 'condominio', 'manutencao', 'seguro', 'taxa_adm', 'tributo', 'repasse_socio', 'reembolso', 'aluguel', 'outro']
                .map(v => `<option value="${v}" ${v === (d?.categoria || sugestoes?.categoria) ? 'selected' : ''}>${rotuloCategoriaSaida(v)}</option>`).join('');
            const optsFormaPagamento = ['pix', 'boleto', 'transferencia', 'dinheiro', 'outro']
                .map(v => `<option value="${v}" ${v === d?.formaPagamento ? 'selected' : ''}>${v.charAt(0).toUpperCase() + v.slice(1)}</option>`).join('');

            const competenciaPadrao = d ? dataParaCompetencia(d.competencia) : dataParaCompetencia(new Date().toISOString().slice(0, 10));
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
                        <div class="grid grid-cols-2 gap-2">
                            <div>
                                <label style="font-size:11px;font-weight:bold;color:#64748b;">Categoria <span style="color:var(--danger)">*</span></label>
                                <select id="desp-categoria" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;background:#f8fafc;">${optsCategorias}</select>
                            </div>
                            <div>
                                <label style="font-size:11px;font-weight:bold;color:#64748b;">Valor (R$) <span style="color:var(--danger)">*</span></label>
                                <input id="desp-valor" type="number" step="0.01" value="${d?.valor ?? ''}" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;">
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                            <div>
                                <label style="font-size:11px;font-weight:bold;color:#64748b;">Vencimento <span style="color:var(--danger)">*</span></label>
                                <input id="desp-vencimento" type="date" value="${d?.vencimento || ''}" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;">
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
                        <div style="display:flex;align-items:flex-start;gap:8px;background:#f8fafc;border-radius:8px;padding:8px;">
                            <input id="desp-reembolsavel" type="checkbox" ${d?.reembolsavel ? 'checked' : ''} style="margin-top:2px;">
                            <label for="desp-reembolsavel" style="font-size:11px;color:#475569;">Reembolsável — não entra no cálculo de líquido dos sócios</label>
                        </div>
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
            if (typeof lucide !== 'undefined') lucide.createIcons();
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

                if (despesaEmEdicaoId) {
                    const { error } = await dbAuth.from('lancamentos').update(payload).eq('id', despesaEmEdicaoId);
                    if (error) throw error;
                } else {
                    const { error } = await dbAuth.from('lancamentos').insert({ ...payload, status: 'previsto' });
                    if (error) throw error;
                }

                lancamentos = await carregarLancamentosSupabase();
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
            if (!confirm('Estornar este pagamento? A despesa volta a "previsto".')) return;
            mostrarCarregamentoGlobal('Salvando...');
            try {
                const { error } = await dbAuth.from('lancamentos').update({
                    status: 'previsto', data_pagamento: null, forma_pagamento: null
                }).eq('id', id);
                if (error) throw error;
                lancamentos = await carregarLancamentosSupabase();
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
            if (!confirm('Excluir esta despesa? Ação não pode ser desfeita.')) return;
            mostrarCarregamentoGlobal('Excluindo...');
            try {
                const { error } = await dbAuth.from('lancamentos').delete().eq('id', id);
                if (error) throw error;
                lancamentos = lancamentos.filter(d => d.id !== id);
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

        export function abrirRecebimentoDetalhe(mensalidadeId) {

            recebimentoDetalheAtualId = mensalidadeId;
            const men = mensalidades.find(m => m.id === mensalidadeId);
            if (!men) { alert('Recebimento não encontrado.'); return; }

            const con = contratos.find(c => c.id === men.contratoId);
            if (!con) { alert('Contrato deste recebimento não encontrado.'); return; }

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

        // v1.X — A.10/módulo contador: "Gerar Mês" agora chama a RPC
        // fn_gerar_mensalidades_competencia (banco) em vez da função JS local
        // gerarMensalidadesParaCompetencia — que fica só como referência
        // histórica, não é mais chamada daqui. saveAll() não entra mais nesta
        // rota: a RPC já grava direto, só recarrega mensalidades do banco
        // (mesmo mapeamento de sempre, carregarMensalidadesSupabase) e
        // redesenha.
        export async function gerarMensalidades() {

            const selectRef = document.getElementById('men-referencia');

            const ref = selectRef.value;

            if(!contratos || contratos.length === 0) {

                alert("⚠️ Não há contratos cadastrados.");

                return;

            }

            const [mes, ano] = ref.split('/').map(Number);
            const referenciaISO = `${ano}-${String(mes).padStart(2, '0')}-01`;

            mostrarCarregamentoGlobal('Gerando mês...');
            try {
                const { data, error } = await dbAuth.rpc('fn_gerar_mensalidades_competencia', {
                    p_cliente_id: CLIENTE_ID_SUPABASE, p_referencia: referenciaISO,
                });
                if (error) throw error;

                mensalidades = await carregarMensalidadesSupabase();

                const idxAtual = arrayCompetencias.indexOf(ref);

                if(idxAtual !== -1 && idxAtual + 1 < arrayCompetencias.length) {

                    selectRef.value = arrayCompetencias[idxAtual + 1];

                }

                registrarLog('mensal.gerar', { referencia: ref, geradas: (data || []).length });
                esconderCarregamentoGlobal();
                mostrarToast(`${(data || []).length} mensalidade(s) gerada(s) para ${ref}.`, 'success');
                renderMensalidades();
                renderInadimplencia();
                renderRelatorios();
                renderSociosDistribricao();
            } catch (err) {
                esconderCarregamentoGlobal();
                alert('⚠️ Falha ao gerar mensalidades: ' + (err.message || String(err)));
            }

        }

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

        export async function liquidarMensalidade(menId) {

            const banco = document.getElementById(`banco-${menId}`).value;

            const dataManual = document.getElementById(`data-${menId}`).value;

            const valorManual = parseFloat(document.getElementById(`valor-${menId}`).value);

            let obsManual = document.getElementById(`obs-${menId}`).value.trim();

            const campoEnergia = document.getElementById(`energia-${menId}`);

            const valorEnergiaManual = campoEnergia ? (parseFloat(campoEnergia.value) || 0) : 0;

            // CORRIGIDO (bug real — valores de multa/taxa lançados no menu ⋯
            // nunca eram lidos nem salvos em lugar nenhum; ao estornar, sumiam
            // para sempre). Não existe coluna própria para isso na tabela de
            // mensalidades, então — igual já acontecia com energia — o valor
            // vira um resumo dentro da observação DO RECIBO (observacaoRecibo,
            // que sai impressa no "Vale ressaltar que..."), separada da
            // observação interna (observacao, que nunca aparece pro locatário).
            const campoMulta = document.getElementById(`multa-${menId}`);
            const campoTaxa = document.getElementById(`taxa-admin-${menId}`);
            const valorMulta = campoMulta ? (parseFloat(campoMulta.value) || 0) : 0;
            const valorTaxa = campoTaxa ? (parseFloat(campoTaxa.value) || 0) : 0;

            const resumoExtras = [];
            if (valorEnergiaManual > 0) resumoExtras.push(`Energia: R$ ${fmtBR(valorEnergiaManual)}`);
            if (valorMulta > 0) resumoExtras.push(`Multa: R$ ${fmtBR(valorMulta)}`);
            if (valorTaxa > 0) resumoExtras.push(`Taxa Adm.: R$ ${fmtBR(valorTaxa)}`);
            if (resumoExtras.length > 0) {
                obsManual = (obsManual ? obsManual + ' | ' : '') + resumoExtras.join(' | ');
            }

            if(!dataManual || isNaN(valorManual)) return alert("Preencha data e valor.");

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
                esconderCarregamentoGlobal();
                mostrarToast("Pagamento registrado com sucesso!", 'success');
                renderMensalidades();
                renderInadimplencia();
                renderSociosDistribricao();
                renderRelatorios();
                renderPendenciasExtrato();
            } catch (err) {
                esconderCarregamentoGlobal();
                alert('⚠️ Falha ao salvar o pagamento: ' + err.message);
                logScreen('Erro ao dar baixa (mensalidade ' + menId + '): ' + err.message, true);
            }

        }

        export function borderEstornoCheck(menId) {

             // Função mantida de backup caso necessário

        }

        export function estornarMensalidade(menId) {

            if(!confirm("Confirmar estorno do caixa?")) return;

            const idx = mensalidades.findIndex(m => m.id === menId);

            if(idx !== -1) {

                mensalidades[idx].status = 'Inadimplente';

                mensalidades[idx].banco = '-';

                mensalidades[idx].chaveTransacaoOrigem = '';

                const con = contratos.find(c => c.id === mensalidades[idx].contratoId);

                const partesRef = mensalidades[idx].referencia.split('/');

                const diaVenc = con ? (con.vencimentoDia || 15) : 15;

                const diaPgoString = diaVenc < 10 ? '0' + diaVenc : diaVenc;

                mensalidades[idx].dataPgto = `${diaPgoString}/${partesRef[0]}/${partesRef[1]}`;

                registrarLog('mensal.estornar', { mensalidadeId: menId, referencia: mensalidades[idx].referencia });

                saveAll(true, "Pagamento estornado.", ['mensalidades']);

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
                    alert('⚠️ ' + (data?.motivo || 'Não consegui ler as transações desse arquivo.'));
                    inputElement.value = '';
                    return;
                }

                // Formato do extrator de IA é diferente do parser de xlsx
                // (um "descricao" só, sem coluna de documento separada) —
                // mapeia pro mesmo formato que conciliarTransacoes() já
                // espera, sinal negativo pra débito (mesma convenção do
                // parser de xlsx logo abaixo).
                const transacoes = (data.resultado.transacoes || []).map(t => ({
                    dataISO: t.data,
                    valor: t.tipo === 'debito' ? -Math.abs(t.valor) : Math.abs(t.valor),
                    descricao: (t.descricao || '').toUpperCase(),
                    razaoSocial: t.descricao || '',
                    documento: '',
                }));

                esconderCarregamentoGlobal();

                if (transacoes.length === 0) {
                    alert("⚠️ Nenhum lançamento válido encontrado nesse arquivo.");
                    inputElement.value = '';
                    return;
                }

                const tituloResumo = data.resultado.banco
                    ? `📥 Extrato do ${data.resultado.banco} lido via IA!`
                    : '📥 Extrato lido via IA!';

                await conciliarTransacoes(transacoes, tituloResumo);

            } catch (err) {

                esconderCarregamentoGlobal();

                alert("⚠️ Falha ao ler o arquivo: " + err.message);

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

                    alert("⚠️ Não consegui identificar o formato do extrato. Verifique se é um extrato detalhado do Itaú (.xlsx) e tente novamente.");

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

                    alert("⚠️ Nenhum lançamento válido encontrado nesse arquivo.");

                    return;

                }

                await conciliarTransacoes(transacoes);

            } catch (err) {

                esconderCarregamentoGlobal();

                alert("⚠️ Falha ao ler o arquivo: " + err.message);

                devLog("ERRO_EXTRATO", `Falha ao processar extrato: ${err.message}`);

            }

            inputElement.value = '';

        }

        export async function conciliarTransacoes(transacoes, tituloResumo) {

            // IMPORTANTE: os "fingerprints" continuam sendo registrados para fins de

            // auditoria (histórico de tudo que já foi importado), mas NÃO bloqueiam

            // mais uma nova tentativa de conciliação. Motivo: um item conciliado

            // (automática ou manualmente) pode ser estornado depois — e se o mesmo

            // extrato for reimportado, a conciliação precisa conseguir tentar de novo.

            //

            // A proteção real contra duplicidade é rastrear, em cada mensalidade/

            // repasse, qual transação exata (chave = data+valor+pagador) o gerou.

            // Antes de conciliar uma transação, verificamos se ela já pagou algo que

            // continua pago — se sim, essa transação já foi "usada" e não deve gerar

            // outro lançamento (nem pendência), mesmo que essa mesma linha do extrato

            // seja importada de novo.

            const chavesJaPendentes = new Set(pendenciasExtrato.filter(p => p.status === 'Pendente').map(p => `${p.data}|${p.valor.toFixed(2)}|${p.razaoSocial.toUpperCase()}`));

            const chavesJaPagas = new Set(mensalidades.filter(m => m.status === 'Pago' && m.chaveTransacaoOrigem).map(m => m.chaveTransacaoOrigem));

            const chavesJaRepassadas = new Set(repasses.filter(r => r.chaveTransacaoOrigem).map(r => r.chaveTransacaoOrigem));

            const novosFingerprints = [];

            // NOVO (v1.66.9, 28/08/2026) — rastreadores dos itens realmente
            // tocados nesta importação, pra saveAll() no final sincronizar só
            // isso (itensAlterados) em vez da carteira inteira — mesmo
            // princípio já aplicado nos botões pontuais de pendência
            // (v1.66.7), agora estendido pro caminho de importação em lote.
            const idsMensalidadesAlteradas = [];
            const idsPendenciasAlteradas = [];

            let qtdConciliados = 0, qtdRepasses = 0, qtdPendencias = 0, qtdIgnorados = 0, qtdJaPendentes = 0, qtdJaProcessadas = 0;

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

            competenciasDoExtrato.forEach(ref => gerarMensalidadesParaCompetencia(ref, idsMensalidadesAlteradas));

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
                const fpAtual = { chave, data: t.dataISO, valor: t.valor, razaoSocial: t.razaoSocial, documento: t.documento, importadoEm: new Date().toISOString() };
                novosFingerprints.push(fpAtual);

                const [ano, mes] = t.dataISO.split('-');

                const referenciaDoMes = `${mes}/${ano}`;

                const dataBR = formatarDataBR(t.dataISO);

                if (t.valor > 0) {

                    // ENTRADA — tenta conciliar com uma mensalidade pendente

                    if (t.descricao.includes('RENDIMENTO')) { qtdIgnorados++; continue; }

                    const nomeSocioEntrada = SOCIOS_CONHECIDOS.find(s => nomesIguaisSocio(s, t.razaoSocial));

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

                        // CORRIGIDO (v1.66.3, 28/08/2026) — BUG REAL reportado: reimportar
                        // o mesmo extrato duplicava pendências sem contrato identificado,
                        // porque este ramo específico nunca checava chavesJaPendentes antes
                        // de empurrar uma pendência nova (só o ramo COM contrato tinha essa
                        // checagem, adicionada como rede de segurança depois da RPC). Também
                        // grava `chave` agora — o banco tem um índice único parcial
                        // (cliente_id, chave) WHERE status='Pendente' desde 28/08/2026, que
                        // é a proteção definitiva contra isso mesmo se este check falhar.
                        if (chavesJaPendentes.has(chave)) { qtdJaPendentes++; continue; }

                        // Sem contrato identificado — a RPC exige contrato_id, não dá
                        // pra chamar. Vai direto pra revisão manual, igual sempre foi.
                        pendenciasExtrato.push({

                            id: 'pex_' + Date.now() + Math.random().toString(36).substr(2, 4),

                            data: t.dataISO, valor: t.valor, razaoSocial: t.razaoSocial, documento: t.documento,

                            tipo: 'nao_identificado', referenciaSugerida: referenciaDoMes, status: 'Pendente',

                            contratoIdSugerido: null,

                            mensalidadeIdsSugeridas: [], chave

                        });

                        idsPendenciasAlteradas.push(pendenciasExtrato[pendenciasExtrato.length - 1].id);

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

                    if (cls && cls.classificacao === 'pendencia_ja_existe') {
                        qtdJaPendentes++;
                        continue;
                    }

                    if (cls && cls.classificacao === 'match_unico' && cls.mensalidade_id) {

                        const idx = mensalidades.findIndex(m => m.id === cls.mensalidade_id);

                        if (idx === -1) {
                            // Rede de segurança: RPC apontou uma mensalidade que não está
                            // no array em memória (dessincronizado) — trata como não
                            // identificado em vez de quebrar ou falhar silenciosamente.
                            pendenciasExtrato.push({
                                id: 'pex_' + Date.now() + Math.random().toString(36).substr(2, 4),
                                data: t.dataISO, valor: t.valor, razaoSocial: t.razaoSocial, documento: t.documento,
                                tipo: 'nao_identificado', referenciaSugerida: referenciaEsperada, status: 'Pendente',
                                contratoIdSugerido: contratoCandidato.id,
                                mensalidadeIdsSugeridas: [], chave
                            });
                            idsPendenciasAlteradas.push(pendenciasExtrato[pendenciasExtrato.length - 1].id);
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

                        // Se havia uma pendência aberta para essa mesma linha do extrato

                        // (de uma importação anterior que não achou o match), resolve ela.

                        const pendenciaAntiga = pendenciasExtrato.find(p => p.status === 'Pendente' && `${p.data}|${p.valor.toFixed(2)}|${p.razaoSocial.toUpperCase()}` === chave);

                        if (pendenciaAntiga) { pendenciaAntiga.status = 'Resolvido'; idsPendenciasAlteradas.push(pendenciaAntiga.id); }

                        continue;

                    }

                    if (cls && cls.classificacao === 'confirmacao_dupla' && Array.isArray(cls.mensalidade_ids_sugeridas) && cls.mensalidade_ids_sugeridas.length === 2) {

                        pendenciasExtrato.push({

                            id: 'pex_' + Date.now() + Math.random().toString(36).substr(2, 4),

                            data: t.dataISO, valor: t.valor, razaoSocial: t.razaoSocial, documento: t.documento,

                            tipo: 'confirmacao_dupla', referenciaSugerida: referenciaEsperada, status: 'Pendente',

                            contratoIdSugerido: contratoCandidato.id,

                            mensalidadeIdsSugeridas: cls.mensalidade_ids_sugeridas, chave

                        });

                        idsPendenciasAlteradas.push(pendenciasExtrato[pendenciasExtrato.length - 1].id);

                        qtdPendencias++;

                        continue;

                    }

                    // Já existe uma pendência EM ABERTO para essa exata linha do extrato

                    // (checagem local, complementar — a RPC já cobre isso por
                    // contrato+competência; isto aqui é rede de segurança extra
                    // pro caso da RPC falhar/retornar null).

                    if (chavesJaPendentes.has(chave)) { qtdJaPendentes++; continue; }

                    // 'nao_identificado' (ou a RPC falhou) — nunca descarta

                    // silenciosamente, sempre cai em pendência pra revisão manual.

                    pendenciasExtrato.push({

                        id: 'pex_' + Date.now() + Math.random().toString(36).substr(2, 4),

                        data: t.dataISO, valor: t.valor, razaoSocial: t.razaoSocial, documento: t.documento,

                        tipo: 'nao_identificado', referenciaSugerida: referenciaEsperada, status: 'Pendente',

                        contratoIdSugerido: contratoCandidato.id,

                        mensalidadeIdsSugeridas: [], chave

                    });

                    idsPendenciasAlteradas.push(pendenciasExtrato[pendenciasExtrato.length - 1].id);

                    qtdPendencias++;

                } else {

                    // SAÍDA — só interessa se for repasse para um dos 4 sócios conhecidos.
                    // (inalterado — repasse fica fora do escopo desta unificação, que
                    // era especificamente sobre entrada/aluguel)

                    const nomeSocio = SOCIOS_CONHECIDOS.find(s => nomesIguaisSocio(s, t.razaoSocial));

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

            // CORRIGIDO (v1.66.9, 28/08/2026) — mesmo bug real já corrigido
            // nos botões pontuais de pendência (v1.66.7): saveAll(true,
            // null) sem `rotas` sincronizava as 9 rotas inteiras, mesmo essa
            // importação só podendo tocar mensalidades/pendenciasExtrato/
            // repasses — nunca imóveis, contratos, administradoras, síndicos,
            // manutencistas ou minutas. Dentro de mensalidades/
            // pendenciasExtrato, `itensAlterados` limita ainda mais: só os
            // IDs realmente tocados nesta importação (gerados, conciliados,
            // ou pendência resolvida/criada), não a carteira inteira — um
            // extrato de 30 transações não paga mais o custo de
            // ressincronizar centenas de mensalidades que não mudaram nada.
            // `rotas` só inclui o que teve pelo menos 1 item tocado nesta
            // rodada, pra não gastar uma sincronização à toa quando, por
            // exemplo, nenhum repasse foi identificado.
            const rotasTocadas = [];
            if (idsMensalidadesAlteradas.length > 0) rotasTocadas.push('mensalidades');
            if (idsPendenciasAlteradas.length > 0) rotasTocadas.push('pendenciasExtrato');
            if (qtdRepasses > 0) rotasTocadas.push('repasses');

            if (rotasTocadas.length > 0) {
                await saveAll(true, null, rotasTocadas, {
                    mensalidades: idsMensalidadesAlteradas,
                    pendenciasExtrato: idsPendenciasAlteradas,
                });
            }

            alert(

                `${tituloResumo || '📥 Importação concluída!'}\n\n` +

                `✅ ${qtdConciliados} recebimento(s) conciliado(s) automaticamente\n` +

                `💸 ${qtdRepasses} repasse(s) de sócio lançado(s)\n` +

                `❓ ${qtdPendencias} item(ns) precisam da sua revisão (veja abaixo)\n` +

                `🚫 ${qtdIgnorados} lançamento(s) descartado(s) (rendimentos, tarifas, pagamentos a terceiros)\n` +

                (qtdJaProcessadas > 0 ? `♻️ ${qtdJaProcessadas} transação(ões) já estava(m) conciliada(s) antes — nada novo feito\n` : '') +

                (qtdJaPendentes > 0 ? `⏭️ ${qtdJaPendentes} já tinham uma pendência em aberto igual (não duplicados)` : '')

            );

        }

        export async function reprocessarConciliacaoPendente() {

            const pendentesNaoIdentificados = pendenciasExtrato.filter(p => p.status === 'Pendente' && p.tipo === 'nao_identificado');

            if (pendentesNaoIdentificados.length === 0) {

                alert("Não há pendências do tipo 'não identificado' para reprocessar agora.");

                return;

            }

            if (!confirm(`Reprocessar ${pendentesNaoIdentificados.length} pendência(s)? Isso gera novamente os recebimentos da(s) competência(s) envolvida(s) e tenta conciliar cada pendência de novo.`)) return;

            mostrarCarregamentoGlobal("Reprocessando conciliação...");

            // Reconstrói cada pendência como se fosse uma linha de extrato, reusando

            // exatamente a mesma lógica de conciliação usada na importação de arquivo.

            const transacoesReconstituidas = pendentesNaoIdentificados.map(p => ({

                dataISO: p.data,

                valor: p.valor,

                razaoSocial: p.razaoSocial,

                documento: p.documento || '',

                descricao: ''

            }));

            await conciliarTransacoes(transacoesReconstituidas, '🔄 Reprocessamento concluído!');

        }

        let gruposPendenciasAbertos = null;

        export function renderPendenciasExtrato() {

            const wrapper = document.getElementById('painel-pendencias-extrato-wrapper');

            const container = document.getElementById('painel-pendencias-extrato');

            if (!wrapper || !container) return;

            const pendentesTotal = pendenciasExtrato.filter(p => p.status === 'Pendente');

            wrapper.classList.toggle('hidden', pendentesTotal.length === 0);

            // Popular os 4 filtros a partir dos contratos sugeridos das próprias pendências.

            const contratosSugeridos = pendentesTotal.map(p => p.contratoIdSugerido ? contratos.find(c => c.id === p.contratoIdSugerido) : null).filter(Boolean);

            popularFiltroSelect('pex-filtro-locatario', contratosSugeridos.map(c => c.locatario));

            const selectPexCompetencia = document.getElementById('pex-filtro-competencia');

            if (selectPexCompetencia) {

                const valorAtualComp = selectPexCompetencia.value || 'todos';

                // Normaliza qualquer formato herdado (ex: data ISO antiga) para

                // MM/AAAA, igual ao filtro da Fila de Recebimentos, e ordena

                // cronologicamente (não em ordem alfabética, que ficaria errado).

                const competenciasUnicas = [...new Set(pendentesTotal.map(p => normalizarCompetencia(p.referenciaSugerida)).filter(Boolean))]

                    .sort((a, b) => { const [ma, aa] = a.split('/'), [mb, ab] = b.split('/'); return (aa + ma).localeCompare(ab + mb); });

                selectPexCompetencia.innerHTML = '<option value="todos">Todas</option>' + competenciasUnicas.map(c => `<option value="${c}">${c}</option>`).join('');

                selectPexCompetencia.value = (valorAtualComp === 'todos' || competenciasUnicas.includes(valorAtualComp)) ? valorAtualComp : 'todos';

            }

            popularFiltroSelect('pex-filtro-empreendimento', contratosSugeridos.map(c => { const imo = imoveis.find(i => i.id === c.imovelId); return imo ? imo.empreendimento : null; }));

            const selectPexImovel = document.getElementById('pex-filtro-imovel');

            if (selectPexImovel) {

                const valorAtualImovel = selectPexImovel.value || 'todos';

                const imoveisUnicos = [...new Map(contratosSugeridos.map(c => imoveis.find(i => i.id === c.imovelId)).filter(Boolean).map(i => [i.id, i])).values()];

                selectPexImovel.innerHTML = '<option value="todos">Todos</option>' + imoveisUnicos.map(i => `<option value="${i.id}">${i.empreendimento} - ${i.enderecoRua}</option>`).join('');

                selectPexImovel.value = (valorAtualImovel === 'todos' || imoveisUnicos.some(i => i.id === valorAtualImovel)) ? valorAtualImovel : 'todos';

            }

            const fLocatario = document.getElementById('pex-filtro-locatario')?.value || 'todos';

            const fCompetencia = document.getElementById('pex-filtro-competencia')?.value || 'todos';

            const fEmpreendimento = document.getElementById('pex-filtro-empreendimento')?.value || 'todos';

            const fImovel = document.getElementById('pex-filtro-imovel')?.value || 'todos';

            const pendentes = pendentesTotal.filter(p => {

                const con = p.contratoIdSugerido ? contratos.find(c => c.id === p.contratoIdSugerido) : null;

                const imo = con ? imoveis.find(i => i.id === con.imovelId) : null;

                if (fLocatario !== 'todos' && (!con || con.locatario !== fLocatario)) return false;

                if (fCompetencia !== 'todos' && normalizarCompetencia(p.referenciaSugerida) !== fCompetencia) return false;

                if (fEmpreendimento !== 'todos' && (!imo || imo.empreendimento !== fEmpreendimento)) return false;

                if (fImovel !== 'todos' && (!con || con.imovelId !== fImovel)) return false;

                return true;

            });

            const resumo = document.getElementById('pex-resumo');

            if (resumo) {

                const somaPendentes = pendentes.reduce((acc, p) => acc + p.valor, 0);

                resumo.innerText = `R$ ${somaPendentes.toLocaleString('pt-BR', {minimumFractionDigits:2})} (${pendentes.length})`;

            }

            // Agrupa por competência sugerida, igual à Fila de Recebimentos — cada

            // grupo pode ser fechado/aberto, e mantém o estado entre ações.

            const grupos = {};

            pendentes.forEach(p => {

                const ref = normalizarCompetencia(p.referenciaSugerida) || 'Sem competência';

                if (!grupos[ref]) grupos[ref] = [];

                grupos[ref].push(p);

            });

            const competenciasOrdenadas = Object.keys(grupos).sort((a, b) => {

                const [ma, aa] = (a.split('/')[0] ? a.split('/') : ['00','0000']), [mb, ab] = (b.split('/')[0] ? b.split('/') : ['00','0000']);

                return (ab + mb).localeCompare(aa + ma);

            });

            if (gruposPendenciasAbertos === null) {

                gruposPendenciasAbertos = new Set(competenciasOrdenadas.length > 0 ? [competenciasOrdenadas[0]] : []);

            }

            container.innerHTML = competenciasOrdenadas.map(ref => {

                const itensGrupo = grupos[ref];

                const htmlItens = itensGrupo.map(p => {

                    const con = p.contratoIdSugerido ? contratos.find(c => c.id === p.contratoIdSugerido) : null;

                    if (p.tipo === 'confirmacao_dupla') {

                        return `

                            <div class="bg-white p-3 rounded-xl shadow-sm border-l-4 border-purple-500">

                                <p class="text-xs font-bold text-slate-900">${p.razaoSocial}</p>

                                <p class="text-[13px] text-gray-500">Recebido em ${formatarDataBR(p.data)}: R$ ${fmtBR(p.valor)} — valor bate com <strong>2 mensalidades pendentes</strong> de ${con ? con.locatario : '-'}. Confirma que são os 2 meses?</p>

                                <div class="flex gap-2 mt-2">

                                    <button onclick="confirmarPendenciaDupla('${p.id}')" class="flex-1 raiz-bg-pine text-white text-[13px] py-1.5 rounded font-bold"><svg data-lucide="check" style="width:14px;height:14px;display:inline;vertical-align:-2px"></svg> Sim, são os 2 meses</button>

                                    <button onclick="descartarPendenciaExtrato('${p.id}')" class="flex-1 bg-slate-100 text-slate-700 text-[13px] py-1.5 rounded font-bold border">Descartar</button>

                                </div>

                            </div>`;

                    }

                    const opcoesMensalidades = mensalidades.filter(m => m.status === 'Inadimplente').map(m => {

                        const c = contratos.find(c => c.id === m.contratoId);

                        const imo = c ? imoveis.find(i => i.id === c.imovelId) : null;

                        const local = imo ? `${imo.empreendimento} - ${imo.enderecoRua || ''}, ${imo.enderecoNum || ''}${imo.enderecoComp ? ' - ' + imo.enderecoComp : ''}` : '';

                        return `<option value="${m.id}">${c ? c.locatario : '?'} — Ref ${m.referencia} — R$ ${fmtBR(m.valorConfirmado)}${local ? ' — ' + local : ''}</option>`;

                    }).join('');

                    return `

                        <div class="bg-white p-3 rounded-xl shadow-sm border-l-4 border-amber-500">

                            <p class="text-xs font-bold text-slate-900">${p.razaoSocial || '(sem nome)'}</p>

                            <p class="text-[13px] text-gray-500">Recebido em ${formatarDataBR(p.data)}: <strong>R$ ${fmtBR(p.valor)}</strong> — não identificado automaticamente.</p>

                            <select id="vincular-${p.id}" class="w-full border p-1.5 rounded text-[13px] mt-2 bg-gray-50">

                                <option value="">-- Vincular a uma mensalidade pendente --</option>

                                ${opcoesMensalidades}

                            </select>

                            <div class="flex gap-2 mt-2">

                                <button onclick="vincularPendenciaExtrato('${p.id}')" class="flex-1 raiz-bg-pine text-white text-[13px] py-1.5 rounded font-bold">Vincular</button>

                                <button onclick="descartarPendenciaExtrato('${p.id}')" class="flex-1 bg-slate-100 text-slate-700 text-[13px] py-1.5 rounded font-bold border">Descartar</button>

                            </div>

                        </div>`;

                }).join('');

                const grupoId = 'grupo-pex-' + ref.replace('/', '-');

                const aberto = gruposPendenciasAbertos.has(ref);

                return `

                    <div class="mb-3">

                        <button type="button" onclick="alternarGrupoPendencias('${ref}')" class="w-full bg-red-700 text-white p-3 rounded-xl flex justify-between items-center shadow">

                            <span class="font-bold text-sm">📅 ${ref} <span id="${grupoId}-seta">${aberto ? '▲' : '▼'}</span></span>

                            <span class="text-[11px] bg-red-900/40 px-2 py-0.5 rounded">${itensGrupo.length} item(ns)</span>

                        </button>

                        <div id="${grupoId}" class="${aberto ? '' : 'hidden'} space-y-2 mt-2">${htmlItens}</div>

                    </div>

                `;

            }).join('');

            if (typeof lucide !== 'undefined') lucide.createIcons();

        }

        export function alternarGrupoPendencias(ref) {

            const grupoId = 'grupo-pex-' + ref.replace('/', '-');

            const div = document.getElementById(grupoId);

            const seta = document.getElementById(`${grupoId}-seta`);

            if (!div) return;

            div.classList.toggle('hidden');

            const aberto = !div.classList.contains('hidden');

            if (seta) seta.innerText = aberto ? '▲' : '▼';

            if (aberto) gruposPendenciasAbertos.add(ref); else gruposPendenciasAbertos.delete(ref);

        }

        export function vincularPendenciaExtrato(pendId) {

            const select = document.getElementById(`vincular-${pendId}`);

            const menId = select.value;

            if (!menId) return alert("Escolha uma mensalidade antes de vincular.");

            const pend = pendenciasExtrato.find(p => p.id === pendId);

            const idxMen = mensalidades.findIndex(m => m.id === menId);

            if (!pend || idxMen === -1) return;

            mensalidades[idxMen].status = 'Pago';

            mensalidades[idxMen].banco = 'PIX/TED (extrato)';

            mensalidades[idxMen].dataPgto = formatarDataBR(pend.data);

            mensalidades[idxMen].valorConfirmado = pend.valor;

            mensalidades[idxMen].chaveTransacaoOrigem = `${pend.data}|${pend.valor.toFixed(2)}|${pend.razaoSocial.toUpperCase()}`;

            mensalidades[idxMen].observacao = `Conciliado manualmente — pagador: ${pend.razaoSocial}`;

            pend.status = 'Resolvido';

            saveAll(true, "Recebimento vinculado com sucesso!", ['mensalidades', 'pendenciasExtrato'], { mensalidades: [menId], pendenciasExtrato: [pendId] });

        }

        export function confirmarPendenciaDupla(pendId) {

            const pend = pendenciasExtrato.find(p => p.id === pendId);

            if (!pend) return;

            const chaveOrigem = `${pend.data}|${pend.valor.toFixed(2)}|${pend.razaoSocial.toUpperCase()}`;

            pend.mensalidadeIdsSugeridas.forEach(menId => {

                const idxMen = mensalidades.findIndex(m => m.id === menId);

                if (idxMen !== -1 && mensalidades[idxMen].status === 'Inadimplente') {

                    mensalidades[idxMen].status = 'Pago';

                    mensalidades[idxMen].banco = 'PIX/TED (extrato)';

                    mensalidades[idxMen].dataPgto = formatarDataBR(pend.data);

                    mensalidades[idxMen].chaveTransacaoOrigem = chaveOrigem;

                    mensalidades[idxMen].observacao = `Conciliado via pagamento agrupado de 2 meses — pagador: ${pend.razaoSocial}`;

                }

            });

            pend.status = 'Resolvido';

            saveAll(true, "As 2 mensalidades foram marcadas como pagas!", ['mensalidades', 'pendenciasExtrato'], { mensalidades: pend.mensalidadeIdsSugeridas || [], pendenciasExtrato: [pendId] });

        }

        export function descartarPendenciaExtrato(pendId) {

            const pend = pendenciasExtrato.find(p => p.id === pendId);

            if (!pend) return;

            if (!confirm("Confirma descartar este lançamento? Ele não será mais sugerido para conciliação.")) return;

            pend.status = 'Descartado';

            saveAll(true, "Lançamento descartado.", ['pendenciasExtrato'], { pendenciasExtrato: [pendId] });

        }

        // v1.41.0 (Fase 2) — botões "+"/"Conciliar" agora mudam de cor
        // (liga/desliga) conforme o painel está aberto ou fechado, em vez de
        // usar um X vermelho separado para fechar. classe .ativo definida no
        // bloco de design tokens (CSS) no <head>.
        export function alternarPainelGerarMes() {

            const painel = document.getElementById('painel-gerar-mes');
            const btn = document.getElementById('btn-toggle-gerar-mes');

            painel.classList.toggle('hidden');

            const aberto = !painel.classList.contains('hidden');
            if (btn) { btn.classList.toggle('ativo', aberto); atualizarIconeToggle(btn, aberto); }

        }

        export function alternarPainelConciliacao() {

            const painel = document.getElementById('painel-conciliacao-wrapper');
            const btn = document.getElementById('btn-toggle-conciliar'); // v1.114.0 — pode não existir
            if (!painel) return;
            painel.classList.toggle('hidden');
            const aberto = !painel.classList.contains('hidden');
            if (btn) { btn.classList.toggle('ativo', aberto); atualizarIconeToggle(btn, aberto); }

            // Ao abrir, garante que a lista de pendências (se houver) já
            // apareça renderizada, sem esperar o próximo evento.
            if (aberto) renderPendenciasExtrato();

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

                alert("⚠️ Só é possível excluir lançamentos ainda não recebidos. Este já foi baixado — use 'Estornar' se precisar reverter.");

                return;

            }

            if (!confirm("Confirma a exclusão deste lançamento mensal pendente?")) return;

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

                esconderCarregamentoGlobal();
                mostrarToast("Lançamento excluído.", 'success');
                renderMensalidades();
                renderInadimplencia();
                renderSociosDistribricao();
                renderRelatorios();
                renderPendenciasExtrato();
            } catch (err) {
                esconderCarregamentoGlobal();
                alert('⚠️ Falha ao excluir: ' + err.message);
                logScreen('Erro ao excluir mensalidade: ' + err.message, true);
            }

        }

        export function popularFiltrosMensal() {

            const selComp = document.getElementById('men-filtro-competencia');

            const selLoc = document.getElementById('men-filtro-locatario');

            const selImo = document.getElementById('men-filtro-imovel');

            const selEmp = document.getElementById('men-filtro-empreendimento');

            if (!selComp || !selLoc || !selImo) return;

            const valComp = selComp.value || 'todos';

            const valLoc = selLoc.value || 'todos';

            const valImo = selImo.value || 'todos';

            const competencias = [...new Set(mensalidades.map(m => m.referencia))].sort((a, b) => {

                const [ma, aa] = a.split('/'); const [mb, ab] = b.split('/');

                return (aa + ma).localeCompare(ab + mb);

            });

            selComp.innerHTML = '<option value="todos">Todas</option>' + competencias.map(c => `<option value="${c}">${c}</option>`).join('');

            const locatarios = [...new Set(contratos.map(c => c.locatario))].sort();

            selLoc.innerHTML = '<option value="todos">Todos</option>' + locatarios.map(l => `<option value="${l}">${l}</option>`).join('');

            // CORRIGIDO — "men-filtro-imovel" agora é o mesmo seletor customizado
            // usado em Contrato/Métricas (input escondido + botão), não precisa
            // mais reconstruir opções aqui.
            if (selEmp) popularFiltroSelect('men-filtro-empreendimento', imoveis.map(i => i.empreendimento));

            // Restaura a seleção anterior (o padrão inicial já é "todos" via option acima).

            selComp.value = competencias.includes(valComp) ? valComp : 'todos';

            selLoc.value = locatarios.includes(valLoc) ? valLoc : 'todos';

            selImo.value = imoveis.some(i => i.id === valImo) ? valImo : 'todos';

            const imoSelecionadoMen = imoveis.find(i => i.id === selImo.value);
            const resumoBtnMen = document.getElementById('men-filtro-imovel-resumo');
            if (resumoBtnMen) resumoBtnMen.textContent = imoSelecionadoMen
                ? `[${imoSelecionadoMen.empreendimento || '-'}] ${imoSelecionadoMen.enderecoRua || ''}, ${imoSelecionadoMen.enderecoNum || ''}`
                : 'Todos';

        }

        // v1.114.0 (fatia 5) — sheets do lançamento de recebimento
        export function rzAcoesRecebimentos() {
            if (typeof abrirSheetAcoes !== 'function') { alternarPainelGerarMes(); return; }
            abrirSheetAcoes({ titulo: 'Recebimentos', acoes: [
                { icone: 'sparkles', titulo: 'Importar extrato bancário', codigo: 'conciliacao.importar', sub: 'Concilia os pagamentos automaticamente', tipo: 'ia', aoTocar: () => document.getElementById('extrato-file-input')?.click() },
                { icone: 'calendar-plus', titulo: 'Gerar mês', codigo: 'mensal.gerar', sub: 'Lançamentos de todos os contratos vigentes', aoTocar: () => { const p = document.getElementById('painel-gerar-mes'); if (p && p.classList.contains('hidden')) alternarPainelGerarMes(); p?.scrollIntoView({ behavior: 'smooth', block: 'start' }); } },
                { icone: 'refresh-cw', titulo: 'Reprocessar conciliação', codigo: 'conciliacao.resolver', sub: 'Refaz a comparação extrato × recebimentos', aoTocar: () => reprocessarConciliacaoPendente() },
                { icone: 'clipboard-list', titulo: 'Painel de conciliação', codigo: 'conciliacao.ver', sub: 'Pendências do último extrato', aoTocar: () => { const w = document.getElementById('painel-conciliacao-wrapper'); if (w && w.classList.contains('hidden')) alternarPainelConciliacao(); w?.scrollIntoView({ behavior: 'smooth', block: 'start' }); } },
            ] });
        }

        export function rzAcoesMensalidade(menId) {
            const men = mensalidades.find(m => m.id === menId); if (!men || typeof abrirSheetAcoes !== 'function') return;
            const con = contratos.find(c => c.id === men.contratoId) || {};
            const sub = `${con.locatario || ''} · ${men.referencia}`;
            if (men.status === 'Pago') {
                abrirSheetAcoes({ titulo: 'Recebimento', sub, acoes: [
                    { icone: 'receipt', titulo: 'Recibo', sub: 'Gerar ou reenviar', codigo: 'recibo.gerar', aoTocar: () => abrirModalOpcoesRecibo(men.id, con.id) },
                    { icone: 'undo-2', titulo: 'Estornar', sub: 'Volta pra "a receber"', tipo: 'bad', codigo: 'mensal.estornar', aoTocar: () => estornarMensalidade(men.id) },
                ] });
                return;
            }
            abrirSheetAcoes({ titulo: mensalidadeEmAtraso(men) ? 'Em atraso' : 'A receber', sub, acoes: [
                { icone: 'check', titulo: 'Dar baixa', sub: 'Registrar o recebimento', codigo: 'mensal.baixar', aoTocar: () => rzAbrirBaixaMensalidade(men.id) },
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
            // mesmos ids que liquidarMensalidade() lê — o sheet vive no <body>
            const corpo = `
                <div class="rz-f2">
                    <div class="rz-f"><label>Forma de recebimento</label><select id="banco-${men.id}"><option value="PIX">PIX</option><option value="Boleto">Boleto</option><option value="Dinheiro">Dinheiro</option><option value="Transferência">Transferência</option><option value="Cheque">Cheque</option></select></div>
                    <div class="rz-f"><label>Data do recebimento <i>*</i></label><input type="date" id="data-${men.id}" value="${dataPadrao}"></div>
                </div>
                <div class="rz-f2">
                    <div class="rz-f"><label>Líquido (R$) <i>*</i></label><input type="number" step="0.01" id="valor-${men.id}" value="${men.valorConfirmado || 0}" oninput="recalcularTotalBaixaExtra('${men.id}')"></div>
                    <div class="rz-f"><label>Observação interna</label><input type="text" id="obs-${men.id}" placeholder="Ex.: desconto"></div>
                </div>
                <div class="rz-group" style="margin-top:4px">Extras</div>
                <div class="rz-f2">
                    ${temEnergia ? `<div class="rz-f"><label>Energia (R$)</label><input type="number" step="0.01" id="energia-${men.id}" value="0"></div>` : ''}
                    <div class="rz-f"><label>Multa / juros (R$)</label><input type="number" step="0.01" id="multa-${men.id}" value="0" data-multa-anterior="0" oninput="recalcularTotalBaixaExtra('${men.id}')"></div>
                    <div class="rz-f"><label>Taxa da administradora (R$)</label><input type="number" step="0.01" id="taxa-admin-${men.id}" value="${men.taxaAdmSugerida || 0}" oninput="recalcularTotalBaixaExtra('${men.id}')"></div>
                </div>`;
            abrirSheetForm({ titulo: 'Dar baixa', sub: `${con.locatario || ''} · ${men.referencia} · ${formatarMoedaBR(men.valorConfirmado)}`, corpo, rotuloSalvar: 'Confirmar recebimento',
                aoSalvar: async () => { await liquidarMensalidade(men.id); } });
        }

        export function rzAcoesGrupoMensal(ref) {
            if (typeof abrirSheetAcoes !== 'function') return;
            abrirSheetAcoes({ titulo: `Competência ${ref}`, acoes: [
                { icone: 'trash-2', titulo: 'Apagar lançamentos em atraso deste mês', codigo: 'mensal.excluir', sub: 'Só os que ainda não foram pagos e já venceram', tipo: 'bad', aoTocar: () => apagarInadimplentesDoGrupo(ref) },
            ] });
        }

        export function renderMensalidades() {

            const container = document.getElementById('lista-mensalidades');

            if(!container) return;

            popularFiltrosMensal();

            const fComp = document.getElementById('men-filtro-competencia')?.value || 'todos';

            const fLoc = document.getElementById('men-filtro-locatario')?.value || 'todos';

            const fImo = document.getElementById('men-filtro-imovel')?.value || 'todos';

            const fEmp = document.getElementById('men-filtro-empreendimento')?.value || 'todos';

            // v1.55.0 — NOVO: busca por texto livre (endereço/locatário/
            // bairro), mesmo padrão de Imóveis.
            const termoBuscaMen = (document.getElementById('men-busca-texto')?.value || '').trim().toLowerCase();

            const filtradas = mensalidades.filter(men => {

                if (fComp !== 'todos' && men.referencia !== fComp) return false;

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

            // Agrupa por competência (Ref), sempre em ordem decrescente (mês mais

            // recente primeiro) — cada grupo pode ser expandido/recolhido.

            const grupos = {};

            filtradas.forEach(men => {

                if (!grupos[men.referencia]) grupos[men.referencia] = [];

                grupos[men.referencia].push(men);

            });

            const competenciasOrdenadas = Object.keys(grupos).sort((a, b) => {

                const [ma, aa] = a.split('/'), [mb, ab] = b.split('/');

                return (ab + mb).localeCompare(aa + ma);

            });

            // Preserva quais grupos estavam abertos/fechados entre re-renderizações

            // (ex: ao dar baixa ou excluir um item, o grupo não deve fechar sozinho).

            // Na primeira vez, abre só o mês mais recente por padrão.

            if (gruposMensalAbertos === null) {

                gruposMensalAbertos = new Set(competenciasOrdenadas.length > 0 ? [competenciasOrdenadas[0]] : []);

            }

            const hoje = new Date();

            // v1.114.0 (FATIA 5 da gramática única, REGRAS §9/§10/§11) — cada
            // competência vira .rz-group + .rz-card.rz-list; cada mensalidade é
            // uma .rz-row com status nas 5 semânticas (Pago ok · Em atraso bad ·
            // A vencer run). O TOQUE na linha abre o sheet de ações do
            // lançamento (rzAcoesMensalidade): Dar baixa (sheet de formulário
            // com os MESMOS ids banco-/data-/valor-/obs-/energia-/multa-/taxa-
            // admin-${id}, então liquidarMensalidade() não mudou) · Excluir;
            // pago → Recibo · Estornar. Os formulários inline por card, os 4
            // botões por card e o cabeçalho verde-escuro do grupo saíram.
            // KPIs do período no topo (rzKpisMensal). Grupos continuam
            // recolhíveis (alternarGrupoMensal) — toque no rótulo do mês.
            let kTotRecebido = 0, kTotAtraso = 0, kTotAVencer = 0;
            const rsM = (sem, t) => (typeof renderStatus === 'function') ? renderStatus(sem, t) : `<span class="rz-st rz-${sem}">${t}</span>`;
            const htmlGrupos = competenciasOrdenadas.map((ref) => {
                const itensGrupo = grupos[ref].slice().sort((a, b) => {

                    const conA = contratos.find(c => c.id === a.contratoId);

                    const conB = contratos.find(c => c.id === b.contratoId);

                    const imoA = conA ? imoveis.find(i => i.id === conA.imovelId) : null;

                    const imoB = conB ? imoveis.find(i => i.id === conB.imovelId) : null;

                    const empA = imoA ? imoA.empreendimento : '';

                    const empB = imoB ? imoB.empreendimento : '';

                    return empA.localeCompare(empB) || (conA?.locatario || '').localeCompare(conB?.locatario || '');

                });

                let recebidoGrupo = 0, inadimplenteGrupo = 0, avencerGrupo = 0;
                let qtdRecebido = 0, qtdInadimplente = 0, qtdAVencer = 0;
                const linhas = itensGrupo.map(men => {
                    const con = contratos.find(c => c.id === men.contratoId) || {};
                    const imo = imoveis.find(i => i.id === con.imovelId);
                    const localImovel = imo ? `${imo.empreendimento || ''} · ${imo.enderecoRua || ''}, ${imo.enderecoNum || ''}` : '';
                    if (men.status === 'Pago') {
                        recebidoGrupo += men.valorConfirmado; qtdRecebido++;
                        return `<div class="rz-row rz-link" onclick="rzAcoesMensalidade('${men.id}')">
                            <div class="rz-ic"><svg data-lucide="arrow-down-left"></svg></div>
                            <div class="rz-tx"><b>${escapeHtmlSaidas(con.locatario || 'Locatário')}</b><span>${escapeHtmlSaidas(localImovel)}${men.dataPgto ? ' · pago em ' + formatarDataBR(men.dataPgto) : ''}${men.banco ? ' · ' + escapeHtmlSaidas(men.banco) : ''}</span></div>
                            <div class="rz-rt"><b>${formatarMoedaBR(men.valorConfirmado)}</b>${rsM('ok', 'Pago')}</div>
                            <svg data-lucide="ellipsis-vertical" class="rz-chev"></svg>
                        </div>`;
                    }
                    const atrasada = mensalidadeEmAtraso(men);
                    if (atrasada) { inadimplenteGrupo += men.valorConfirmado; qtdInadimplente++; } else { avencerGrupo += men.valorConfirmado; qtdAVencer++; }
                    return `<div class="rz-row rz-link" onclick="rzAcoesMensalidade('${men.id}')">
                        <div class="rz-ic${atrasada ? ' rz-bad' : ''}"><svg data-lucide="${atrasada ? 'alarm-clock' : 'clock'}"></svg></div>
                        <div class="rz-tx"><b>${escapeHtmlSaidas(con.locatario || 'Locatário')}</b><span>${escapeHtmlSaidas(localImovel)} · vence dia ${con.vencimentoDia || 15}</span></div>
                        <div class="rz-rt"><b>${formatarMoedaBR(men.valorConfirmado)}</b>${atrasada ? rsM('bad', 'Em atraso') : rsM('run', 'A vencer')}</div>
                        <svg data-lucide="ellipsis-vertical" class="rz-chev"></svg>
                    </div>`;
                }).join('');
                kTotRecebido += recebidoGrupo; kTotAtraso += inadimplenteGrupo; kTotAVencer += avencerGrupo;
                const grupoId = 'grupo-mensal-' + ref.replace('/', '-');
                const abertoPorPadrao = gruposMensalAbertos.has(ref);
                const resumo = [qtdRecebido ? `${qtdRecebido} pago${qtdRecebido > 1 ? 's' : ''}` : '', qtdInadimplente ? `${qtdInadimplente} em atraso` : '', qtdAVencer ? `${qtdAVencer} a vencer` : ''].filter(Boolean).join(' · ');
                return `
                    <div class="rz-group" style="display:flex;align-items:center;gap:8px;cursor:pointer" onclick="alternarGrupoMensal('${ref}')">
                        <span style="flex:1">${ref} · ${resumo}</span>
                        ${qtdInadimplente > 0 ? `<button type="button" onclick="event.stopPropagation(); rzAcoesGrupoMensal('${ref}')" class="rz-more" aria-label="Mais ações" style="margin:0"><svg data-lucide="ellipsis-vertical"></svg></button>` : ''}
                        <svg data-lucide="chevron-down" id="${grupoId}-seta" style="width:16px;height:16px;transform:rotate(${abertoPorPadrao ? '180' : '0'}deg)"></svg>
                    </div>
                    <div id="${grupoId}" class="rz-card rz-list ${abertoPorPadrao ? '' : 'hidden'}">${linhas}</div>`;
            }).join('');
            container.innerHTML = `<div class="rz-kpis">
                <div class="rz-kpi rz-in"><small>Recebido no período</small><b>${formatarMoedaBR(kTotRecebido)}</b></div>
                <div class="rz-kpi rz-bad"><small>Em atraso</small><b>${formatarMoedaBR(kTotAtraso)}</b></div>
                <div class="rz-kpi" style="grid-column:1/-1"><small>A vencer</small><b>${formatarMoedaBR(kTotAVencer)}</b></div>
            </div>` + htmlGrupos;

            if (typeof lucide !== 'undefined') lucide.createIcons();

        }

        export function alternarGrupoMensal(ref) {
            const grupoId = 'grupo-mensal-' + ref.replace('/', '-');
            const el = document.getElementById(grupoId);
            const seta = document.getElementById(grupoId + '-seta');
            if (!el) return;
            el.classList.toggle('hidden');
            const aberto = !el.classList.contains('hidden');
            if (seta) seta.style.transform = `rotate(${aberto ? 180 : 0}deg)`;
            if (aberto) gruposMensalAbertos.add(ref); else gruposMensalAbertos.delete(ref);
        }

        export function apagarInadimplentesDoGrupo(ref) {

            // CORRIGIDO (v1.63.0 — pedido explícito, 25/08/2026): antes
            // apagava TODO mensalidade 'Inadimplente' da competência, sem
            // checar vencimento — se o grupo tivesse contratos com dias de
            // vencimento diferentes (um já vencido, outro ainda não), um
            // lançamento "A vencer" podia ser apagado junto sem aparecer
            // nem no botão nem na confirmação. Agora usa mensalidadeEmAtraso()
            // pra apagar exatamente o mesmo recorte que o botão mostra.
            const alvo = mensalidades.filter(m => m.referencia === ref && mensalidadeEmAtraso(m));
            const qtd = alvo.length;

            if (qtd === 0) return;

            if (!confirm(`Confirma apagar os ${qtd} lançamento(s) atrasado(s) da competência ${ref}? Lançamentos já recebidos ou ainda a vencer NÃO são afetados.`)) return;

            const idsAlvo = new Set(alvo.map(m => m.id));
            mensalidades = mensalidades.filter(m => !idsAlvo.has(m.id));

            saveAll(true, `${qtd} lançamento(s) atrasado(s) de ${ref} apagado(s).`, ['mensalidades']);

        }

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
            saveAll(true, "Observação do recibo salva.", ['mensalidades']);
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
            // v1.63.0 — NOVO aviso informativo: lançamentos futuros existem
            // (contam pro caixa esperado) mas não aparecem nesta aba porque
            // ainda não venceram — evita a leitura de "sumiu"/"a taxa está
            // errada". Mesmo container de aviso leve já usado pra energia
            // (id-a-vencer-aviso), estilo neutro (slate), não vermelho/
            // amarelo — não é um alerta, é só uma nota de contexto.
            const avisoAVencer = document.getElementById('inad-a-vencer-aviso');
            if (avisoAVencer) {
                if (avencerQtd > 0) {
                    avisoAVencer.classList.remove('hidden');
                    avisoAVencer.innerText = `ℹ️ ${avencerQtd} lançamento${avencerQtd > 1 ? 's' : ''} futuro${avencerQtd > 1 ? 's' : ''} (R$ ${avencerValor.toLocaleString('pt-BR', {minimumFractionDigits:2})}) ainda não venceu${avencerQtd > 1 ? 'ram' : ''} — não entra${avencerQtd > 1 ? 'm' : ''} aqui. Consulte na aba Financeiro.`;
                } else {
                    avisoAVencer.classList.add('hidden');
                }
            }
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
                    subItensHtml += `
                        <div class="rz-row rz-link" onclick="rzAcoesMensalidade('${item.men.id}')">
                            <div class="rz-ic rz-bad"><svg data-lucide="alarm-clock"></svg></div>
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
                container.innerHTML += `
                    <div class="rz-group" style="display:flex;align-items:center;gap:8px">
                        <span style="flex:1">${escapeHtmlSaidas(nomeGrupo)} · ${formatarMoedaBR(totalGrupo)}</span>
                        ${tipoAgrupamento === 'locatario' ? `<button type="button" onclick="rzAcoesGrupoInadimplencia('${rzIdGrupo}')" class="rz-more" aria-label="Mais ações" style="margin:0"><svg data-lucide="ellipsis-vertical"></svg></button>` : ''}
                    </div>
                    <div class="rz-card rz-list rz-critico">${subItensHtml}</div>`;
            }
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        export function rzAcoesGrupoInadimplencia(id) {
            const g = (window.__rzCobrancaGrupo || {})[id]; if (!g || typeof abrirSheetAcoes !== 'function') return;
            abrirSheetAcoes({ titulo: g.titulo, sub: `${formatarMoedaBR(g.total)} em aberto`, acoes: [
                { icone: 'message-circle', titulo: 'Cobrar pelo WhatsApp', codigo: 'cobrar.lembrete', sub: 'Abre a conversa com a lista de competências', aoTocar: () => dispararCobrancaWhatsAppDirect(g.celular, g.titulo, g.itens, g.total) },
            ] });
        }

        export function dispararCobrancaWhatsAppDirect(celular, grupoTitle, itensText, valorTotal) {

            if(!celular || celular.length < 5) {

                alert("⚠️ Celular do locatário não cadastrado.");

                return;

            }

            const formatText = itensText.replace(/\\n/g, '\n');

            const txt = `⚠️ *${CONFIG_CLIENTE.nomeEmpresa.toUpperCase()} - NOTIFICAÇÃO DE CAIXA*\nRef: *${grupoTitle}*\n\nConstam em aberto os seguintes lançamentos pendentes:\n${formatText}\n\n*Total Consolidado: R$ ${valorTotal.toLocaleString('pt-BR')}*\n\nQualquer dúvida sobre a conciliação, estamos à disposição.`;

            window.open(`https://api.whatsapp.com/send?phone=55${celular}&text=${encodeURIComponent(txt)}`, '_blank');

        }
