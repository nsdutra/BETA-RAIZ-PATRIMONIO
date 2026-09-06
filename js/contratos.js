// ============================================================================
// contratos.js — Raiz Patrimônio · Contratos (lista · ficha · formulário ·
//                 status/reajuste/detalhes · fiadores · documentos · histórico)
// Versão: 1.0.0 · 06/09/2026
//
// R8 — FRAGMENTAÇÃO, FATIA 2 (A.8). Segundo corte do index.html (Beta
// v1.141.0), mesmo método do financeiro.js v1.0.0 (R8-1): ES module SOB
// DEMANDA via import() no switchTab, pontes window[nome] no index pra quem
// chama de fora, rzConSeCarregado() nos ganchos de recarga.
//
// O QUE MORA AQUI (camada de tela + ações de tab-contratos / tab-contrato-ficha
// e do formulário do contrato):
//   · Lista: renderContratos, chips de filtro, busca, alertas do contrato.
//   · Ficha: abrirFichaContrato, ⋮ dos cards (cobranças, partes, locatário,
//     fiador, anexos, condições, status), documentos do contrato, voltar.
//   · Formulário: abrirFormularioContrato/saveContrato/editarContrato/
//     cancelarEdicaoContrato, validações, painel de reajuste do form, divisão
//     de repasse do contrato, documentos no form (processarMultiplosDocumentos,
//     preview, remover, upload pro Storage), fiadores (popup + standalone).
//   · Popups/sheets: reajuste, alterar status (+ efeitos nas mensalidades),
//     dados do novo contrato, observação, dados do locatário, detalhes,
//     outros contratos do imóvel, divisão, excluir, seletor de contrato pra
//     ação, criar contrato a partir do imóvel/ativo, edição contextual.
//   · Histórico: verHistoricoContrato e o inline do formulário.
//
// O QUE FICOU NO index.html, DE PROPÓSITO:
//   · Dados e sincronização: `contratos`, carregar/sincronizarContratoSupabase,
//     normalizarContrato, salvarContratoIndividual, mapStatusContrato*.
//   · Regras lidas por outras telas: contratoVencido, contratoPrecisaRevisao,
//     contratoAguardandoAssinatura, obterUltimaVigenciaValor (Alertas, Visão
//     Geral, Resultados), obterContratosContextuaisDoImovel/
//     obterContratoPrincipalDoImovel/montarResumoContagemContratos (ativo).
//   · Minutas (tab-minutas, gerarMinuta*, placeholders) — domínio próprio,
//     candidato a minutas.js. Contratação pública/vitrine — idem.
//   · montarBoxContratoFicha/montarBoxSemContratoFicha — ficha ANTIGA do
//     imóvel (tab-imoveis, desligada na v1.108); saem junto com ela.
//   · fecharModalCampoContrato e o container #modal-campo-contrato —
//     genéricos (despesa, retirada, divisão também usam).
//   · __divisaoPopupContrato — popup de divisão compartilhado com o imóvel.
//   · activeConId — do motor de recibo/PDF.
//   · HTML das seções (formulário do contrato, filtros) — sai com a gramática.
//
// COMO É CHAMADO:
//   · switchTab('tab-contratos') → carregarContratos().then(m => m.montarAbaContratos()).
//   · Ficha: abrirFichaContrato(id) (ponte) — Visão Geral, ativo (cofre-ativos
//     via window.*), minuta gerada, financeiro.
//   · Ganchos de recarga (saveAll, carga inicial) usam rzConSeCarregado('renderContratos').
//   · reabrirFichaSeFor(id): usado por gerarMinutaNoCofre (index) pra
//     recarregar a ficha depois de anexar a minuta, sem ler estado do módulo.
//
// ESTADO GLOBAL LIDO/ESCRITO DAQUI: contratos, imoveis, mensalidades, pessoas,
// administradoras, dbAuth, CONFIG_CLIENTE, CLIENTE_ID_SUPABASE, pessoaIdLogada,
// fichaImovelAtualId, activeConId, __divisaoPopupContrato. Estado EXCLUSIVO
// virou nível de módulo (11 declarações abaixo).
//
// INDENTAÇÃO mantida (8 espaços) de propósito — template literals com quebra
// de linha; reindentar mudaria strings. Strict verificado (sem global
// implícita/arguments/with).
// ============================================================================

export const VERSAO = '1.0.0'; // v-check: lido por ⚙️ › Conta › Versões — manter igual ao header

/** Ponto de entrada do switchTab('tab-contratos'). */
export function montarAbaContratos() {
    renderContratos();
    if (typeof lucide !== 'undefined') lucide.createIcons();
}
/** Recarrega a ficha se ela estiver aberta neste contrato (usado pelo index). */
export function reabrirFichaSeFor(contratoId) {
    if (fichaContratoAtualId === contratoId) abrirFichaContrato(contratoId);
}

        // Mostra (só leitura) a divisão de sócios já cadastrada no imóvel, para
        // conferência antes de salvar o contrato — não é editável por aqui; se
        // estiver errada, corrige-se na Divisão de Sócios do próprio imóvel.
        // Divisão de repasse DO CONTRATO — pré-preenchida com a divisão do
        // imóvel ao escolher/trocar o imóvel, mas editável só para este
        // contrato (não altera a divisão do imóvel). Mesmo padrão de
        // adicionar/remover/ajustar % já usado em Imóveis.
        let divisaoContratoAtual = [];

        // NOVO (30/08/2026) — Fiadores do contrato, pedido explícito do
        // Nicola. Mesmo espírito de divisaoContratoAtual (estado local
        // editado no popup "Dados Novo Contrato", persistido junto do
        // contrato via sincronizarContratoSupabase → substituir_fiadores_
        // contrato, mesmo padrão delete+insert de substituir_divisao_
        // repasse_contrato). Ao contrário da divisão (poucos campos,
        // prompt() basta), fiador tem ~15 campos — inputs inline com
        // atualizarCampoFiador(index, campo, valor) como handler único
        // delegado, em vez de uma função por campo.
        let fiadoresContratoAtual = [];

        // Trava de segurança: registra de QUAL contrato fiadoresContratoAtual
        // foi carregado. saveContrato() só inclui fiadores no payload se
        // baterem com o id sendo salvo agora — evita que uma sobra de
        // fiadoresContratoAtual de um popup aberto antes (outro contrato,
        // ou nenhum) seja gravada em cima do contrato errado caso
        // saveContrato() seja chamado por outro caminho (form-contrato
        // legado) sem passar por carregarFiadoresContrato() antes.
        let fiadoresContratoAtualPertenceAoId = null;

        const FIADOR_CAMPO_VAZIO = {
            nome: '', doc_tipo: 'CPF', cpf: '', rg: '', rg_orgao_expedidor: '',
            nacionalidade: 'brasileiro(a)', data_nascimento: '', profissao: '', estado_civil: '',
            regime_bens: '', conjuge_nome: '', conjuge_cpf: '', conjuge_rg: '', conjuge_profissao: '',
            whatsapp: '', email: '', endereco_atual: '',
            possui_imovel_proprio: false, imovel_matricula: '', imovel_cartorio_registro: '', imovel_endereco: ''
        };

        export async function carregarFiadoresContrato(contratoId) {
            fiadoresContratoAtualPertenceAoId = contratoId || '__novo__';
            if (!contratoId) { fiadoresContratoAtual = []; return; }
            const { data, error } = await dbAuth.from('contrato_fiadores')
                .select('*').eq('contrato_id', contratoId).order('ordem');
            if (error) { console.error('carregarFiadoresContrato:', error.message); fiadoresContratoAtual = []; return; }
            fiadoresContratoAtual = (data || []).map(function(f) {
                return {
                    nome: f.nome || '', doc_tipo: f.doc_tipo || 'CPF', cpf: f.cpf || '',
                    rg: f.rg || '', rg_orgao_expedidor: f.rg_orgao_expedidor || '',
                    nacionalidade: f.nacionalidade || 'brasileiro(a)', data_nascimento: f.data_nascimento || '',
                    profissao: f.profissao || '', estado_civil: f.estado_civil || '', regime_bens: f.regime_bens || '',
                    conjuge_nome: f.conjuge_nome || '', conjuge_cpf: f.conjuge_cpf || '',
                    conjuge_rg: f.conjuge_rg || '', conjuge_profissao: f.conjuge_profissao || '',
                    whatsapp: f.whatsapp || '', email: f.email || '', endereco_atual: f.endereco_atual || '',
                    possui_imovel_proprio: !!f.possui_imovel_proprio, imovel_matricula: f.imovel_matricula || '',
                    imovel_cartorio_registro: f.imovel_cartorio_registro || '', imovel_endereco: f.imovel_endereco || ''
                };
            });
        }

        export function adicionarFiadorPopup() {
            fiadoresContratoAtual.push(Object.assign({}, FIADOR_CAMPO_VAZIO));
            renderFiadoresPopup();
        }

        export function removerFiadorPopup(index) {
            fiadoresContratoAtual.splice(index, 1);
            renderFiadoresPopup();
        }

        export function atualizarCampoFiador(index, campo, valor) {
            if (!fiadoresContratoAtual[index]) return;
            fiadoresContratoAtual[index][campo] = (campo === 'possui_imovel_proprio') ? !!valor : valor;
        }

        // NOVO (30/08/2026) — popup FOCADO só em fiadores, independente do
        // status do contrato. abrirDadosNovoContratoPopup() só reconhece
        // contrato com status 'Assinando' (é o fluxo de criação) — pra um
        // contrato já 'Ativo' (ou qualquer outro status), este é o
        // caminho pra editar fiadores sem precisar passar pelo formulário
        // completo/legado (editarContrato(), que "Editar contrato" da
        // ficha ainda chama). Salva direto via substituir_fiadores_
        // contrato() — não mexe em nenhum outro campo do contrato, não
        // precisa passar por saveContrato().
        export async function abrirEdicaoFiadoresPopup(contratoId) {
            // NOVO (30/08/2026) — mesma proteção de abrirDadosNovoContratoPopup
            // contra id temporário ainda não sincronizado (ver comentário
            // completo em aguardarIdRealDoContrato).
            if (contratoId && !idEhUuidValido(contratoId)) {
                const con = contratos.find(c => c.id === contratoId);
                if (con) {
                    mostrarCarregamentoGlobal('Só um instante, ainda sincronizando...');
                    await aguardarIdRealDoContrato(con);
                    contratoId = con.id;
                    esconderCarregamentoGlobal();
                }
            }
            await carregarFiadoresContrato(contratoId);

            // v1.128.0 (fatia 9b 2/3) — invólucro Tipo B → sheet da gramática.
            // A lista (renderFiadoresPopup → #dnc-fiadores-lista) é a mesma do
            // "Dados novo contrato" e fica intocada até a 9b 3/3. Salvar =
            // salvarFiadoresStandalone (RPC substituir_fiadores_contrato), que
            // agora fecha o sheet.
            const corpo = `
                <p class="text-xs text-slate-500 mb-2">Nem todo contrato precisa de fiador — só adicione se a minuta exigir.</p>
                <div id="dnc-fiadores-lista"></div>
                <button type="button" class="rz-btn rz-btn-2 rz-wide" style="margin-top:8px" onclick="adicionarFiadorPopup()"><svg data-lucide="user-plus"></svg> Adicionar fiador</button>`;
            abrirSheetForm({
                titulo: 'Fiadores do contrato', sub: (contratos.find(c => c.id === contratoId) || {}).locatario || '', corpo, rotuloSalvar: 'Salvar',
                aoSalvar: () => { salvarFiadoresStandalone(contratoId); return false; },
            });
            renderFiadoresPopup();
            if (typeof rzIcones === 'function') rzIcones();
        }

        export async function salvarFiadoresStandalone(contratoId) {
            const btn = document.querySelector('#modal-fiadores-standalone button[onclick^="salvarFiadoresStandalone"]');
            if (btn) btn.disabled = true;
            try {
                const linhas = fiadoresContratoAtual
                    .filter(f => f.nome && f.cpf)
                    .map((f, i) => Object.assign({}, f, { ordem: i + 1 }));
                const { error } = await dbAuth.rpc('substituir_fiadores_contrato', {
                    p_contrato_id: contratoId,
                    p_cliente_id: CLIENTE_ID_SUPABASE,
                    p_linhas: linhas
                });
                if (error) throw error;
                document.getElementById('modal-fiadores-standalone')?.remove();
                if (document.getElementById('dnc-fiadores-lista') && typeof fecharSheet === 'function') fecharSheet(); // v1.128 — sheet
                if (fichaContratoAtualId === contratoId) abrirFichaContrato(contratoId);
                mostrarToast('Fiadores salvos.', 'success');
            } catch (err) {
                mostrarToast('Não consegui salvar os fiadores: ' + (err.message || String(err)), 'danger'); // v1.128 — sem alert()
            } finally {
                if (btn) btn.disabled = false;
            }
        }

        // Estilo inline igual ao resto do popup "Dados Novo Contrato"
        // (mesma classe de input/label já usada lá — não inventei um
        // padrão visual novo).
        export function renderFiadoresPopup() {
            const listaEl = document.getElementById('dnc-fiadores-lista');
            if (!listaEl) return;

            if (fiadoresContratoAtual.length === 0) {
                listaEl.innerHTML = '<p style="font-size:12px;color:#94a3b8;">Nenhum fiador cadastrado. Nem todo contrato precisa — só adicione se a minuta escolhida exigir.</p>';
                return;
            }

            listaEl.innerHTML = fiadoresContratoAtual.map(function(f, i) {
                const campo = function(rotulo, chave, tipo, obrigatorioVisual) {
                    tipo = tipo || 'text';
                    const v = (f[chave] || '').toString().replace(/"/g, '&quot;');
                    return `<div style="flex:1;min-width:140px;"><label style="font-size:10px;font-weight:bold;color:#64748b;">${rotulo}${obrigatorioVisual ? ' <span style="color:var(--danger)">*</span>' : ''}</label>
                        <input type="${tipo}" value="${v}" onchange="atualizarCampoFiador(${i}, '${chave}', this.value)" style="width:100%;padding:6px;border:1px solid #cbd5e1;border-radius:6px;font-size:12px;margin-top:2px;"></div>`;
                };
                return `
                <div style="border:1px solid #e2e8f0;border-radius:10px;padding:10px;margin-bottom:8px;background:#f8fafc;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                        <span style="font-size:11px;font-weight:bold;color:#334155;">Fiador ${i + 1}</span>
                        <button type="button" onclick="removerFiadorPopup(${i})" style="color:#ef4444;font-weight:bold;font-size:11px;background:none;border:none;">Remover ✕</button>
                    </div>
                    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px;">
                        ${campo('Nome completo', 'nome', 'text', true)}
                        ${campo('CPF/CNPJ', 'cpf', 'text', true)}
                    </div>
                    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px;">
                        ${campo('RG', 'rg')}
                        ${campo('Órgão expedidor', 'rg_orgao_expedidor')}
                        ${campo('Nacionalidade', 'nacionalidade')}
                        ${campo('Data de nascimento', 'data_nascimento', 'date')}
                    </div>
                    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px;">
                        ${campo('Profissão', 'profissao')}
                        <div style="flex:1;min-width:140px;"><label style="font-size:10px;font-weight:bold;color:#64748b;">Estado civil</label>
                            <select onchange="atualizarCampoFiador(${i}, 'estado_civil', this.value)" style="width:100%;padding:6px;border:1px solid #cbd5e1;border-radius:6px;font-size:12px;margin-top:2px;background:#fff;">
                                <option value="">-- Selecione --</option>
                                ${['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União estável'].map(op => `<option ${f.estado_civil === op ? 'selected' : ''}>${op}</option>`).join('')}
                            </select>
                        </div>
                        <div style="flex:1;min-width:180px;"><label style="font-size:10px;font-weight:bold;color:#64748b;">Regime de bens</label>
                            <select onchange="atualizarCampoFiador(${i}, 'regime_bens', this.value)" style="width:100%;padding:6px;border:1px solid #cbd5e1;border-radius:6px;font-size:12px;margin-top:2px;background:#fff;">
                                <option value="">-- Se casado(a) --</option>
                                ${['Comunhão parcial de bens', 'Comunhão universal de bens', 'Separação total de bens', 'Separação obrigatória de bens', 'Participação final nos aquestos'].map(op => `<option ${f.regime_bens === op ? 'selected' : ''}>${op}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <p style="font-size:10px;color:#94a3b8;margin:0 0 4px;">Cônjuge (obrigatório assinar junto se casado(a) fora de separação total/obrigatória de bens — Art. 1.647 do Código Civil):</p>
                    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px;">
                        ${campo('Nome do cônjuge', 'conjuge_nome')}
                        ${campo('CPF do cônjuge', 'conjuge_cpf')}
                        ${campo('RG do cônjuge', 'conjuge_rg')}
                        ${campo('Profissão do cônjuge', 'conjuge_profissao')}
                    </div>
                    <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:6px;">
                        ${campo('WhatsApp', 'whatsapp')}
                        ${campo('E-mail', 'email', 'email')}
                    </div>
                    <div style="margin-bottom:6px;"><label style="font-size:10px;font-weight:bold;color:#64748b;">Endereço atual</label>
                        <textarea rows="2" onchange="atualizarCampoFiador(${i}, 'endereco_atual', this.value)" style="width:100%;padding:6px;border:1px solid #cbd5e1;border-radius:6px;font-size:12px;margin-top:2px;">${(f.endereco_atual || '').replace(/</g, '&lt;')}</textarea>
                    </div>
                    <label style="font-size:11px;display:flex;align-items:center;gap:6px;margin-bottom:6px;">
                        <input type="checkbox" ${f.possui_imovel_proprio ? 'checked' : ''} onchange="atualizarCampoFiador(${i}, 'possui_imovel_proprio', this.checked)"> Possui imóvel próprio quitado (garantia patrimonial)
                    </label>
                    <div style="display:flex;flex-wrap:wrap;gap:6px;">
                        ${campo('Matrícula do imóvel', 'imovel_matricula')}
                        ${campo('Cartório de registro', 'imovel_cartorio_registro')}
                        ${campo('Endereço do imóvel', 'imovel_endereco')}
                    </div>
                </div>`;
            }).join('');
        }

        export function exibirDivisaoImovelNoContrato(imovelId, divisaoJaSalva) {
            const box = document.getElementById('con-divisao-imovel-info');
            if (!box) return;

            if (divisaoJaSalva && divisaoJaSalva.length > 0) {
                // Editando contrato existente — usa a divisão específica já
                // salva para ELE, não a do imóvel (podem ter sido ajustadas).
                divisaoContratoAtual = divisaoJaSalva.map(function(d) { return { nome: d.nome, pct: d.percentual }; });
            } else {
                const imo = imoveis.find(i => i.id === imovelId);
                const divisaoImovel = imo ? (imo.divisao || {}) : {};
                divisaoContratoAtual = Object.entries(divisaoImovel).map(function(e) { return { nome: e[0], pct: e[1] }; });
            }

            box.classList.remove('hidden');
            renderDivisaoContrato();
        }

        export function renderDivisaoContrato() {
            const listaEl = document.getElementById('con-divisao-imovel-lista');
            if (!listaEl) return;

            if (divisaoContratoAtual.length === 0) {
                listaEl.innerHTML = '<p class="text-amber-600"><svg data-lucide="alert-triangle" style="width:14px;height:14px;display:inline;vertical-align:-2px"></svg> Nenhum sócio na divisão — toque no <svg data-lucide="plus" style="width:13px;height:13px;display:inline;vertical-align:-2px"></svg> para adicionar.</p>';
                return;
            }

            listaEl.innerHTML = divisaoContratoAtual.map(function(s, index) {
                return `<div class="flex items-center justify-between gap-2">
                    <span class="text-slate-700 truncate">${s.nome}</span>
                    <div class="flex items-center gap-1 flex-none">
                        <input type="number" value="${s.pct}" min="0" max="100" onchange="atualizarPctDivisaoContrato(${index}, this.value)" class="w-14 p-1 border rounded text-center font-bold text-[11px]">
                        <span class="text-[10px]">%</span>
                        <button type="button" onclick="removerSocioContrato(${index})" class="text-red-500 font-bold px-1"><svg data-lucide="x" style="width:14px;height:14px"></svg></button>
                    </div>
                </div>`;
            }).join('');
            if (typeof lucide !== 'undefined') lucide.createIcons();

        }

        export function atualizarPctDivisaoContrato(index, valor) {
            divisaoContratoAtual[index].pct = parseFloat(valor) || 0;
        }

        export function removerSocioContrato(index) {
            divisaoContratoAtual.splice(index, 1);
            renderDivisaoContrato();
        }

        export function adicionarSocioContrato() {
            const nomesJaAdicionados = divisaoContratoAtual.map(s => s.nome);
            const pessoasDisponiveis = pessoas.filter(p => p.percentualCotasEmpresa > 0 && !nomesJaAdicionados.includes(p.nome));

            const opcoesTexto = pessoasDisponiveis.map((p, i) => `${i + 1}. ${p.nome} (${p.percentualCotasEmpresa}% de cotas)`).join('\n');
            const opcaoExterno = pessoasDisponiveis.length + 1;

            const escolha = prompt(
                "Escolha o sócio pelo número:\n\n" +
                (opcoesTexto ? opcoesTexto + '\n' : '') +
                opcaoExterno + ". Outro (terceiro externo)"
            );
            if (!escolha) return;

            const indice = parseInt(escolha) - 1;

            if (indice === pessoasDisponiveis.length) {
                const nomeExterno = prompt("Nome do terceiro externo:");
                if (!nomeExterno || !nomeExterno.trim()) return;
                divisaoContratoAtual.push({ nome: nomeExterno.trim(), pct: 0 });
                renderDivisaoContrato();
                return;
            }

            const pessoaEscolhida = pessoasDisponiveis[indice];
            if (!pessoaEscolhida) return alert("Opção inválida.");

            divisaoContratoAtual.push({ nome: pessoaEscolhida.nome, pct: pessoaEscolhida.percentualCotasEmpresa || 0 });
            renderDivisaoContrato();
        }

        export function validarWhatsappContrato() {
            const input = document.getElementById('con-whatsapp');
            if (!input) return;
            aplicarIndicadorValidacao('con-whatsapp-indicador', validarTelefoneBR(input.value), 'Telefone válido', false);
        }

        export function validarEmailContrato() {
            const input = document.getElementById('con-email');
            if (!input) return;
            aplicarIndicadorValidacao('con-email-indicador', validarEmailFormato(input.value), 'E-mail válido');
        }

        // v1.41.2 — painel de reajuste do contrato: mesma experiência do
        // "..." de "Líquido" na aba Mensal (alternarMenuBaixaExtra) — um
        // único botão toggle que abre/fecha o painel logo abaixo do campo,
        // sem botões próprios de Salvar/Fechar (quem persiste é "Salvar
        // Contrato", no fim do formulário). O botão fica com fundo escuro
        // enquanto o painel está aberto (classe .ativo, mesmo padrão dos
        // botões "+").
        export function alternarPainelReajusteContrato() {

            const secao = document.getElementById('secao-avancada-contrato');
            const btn = document.getElementById('btn-toggle-reajuste-contrato');
            if (!secao) return;

            secao.classList.toggle('hidden');
            const aberto = !secao.classList.contains('hidden');
            if (btn) btn.classList.toggle('ativo', aberto);

            if (aberto) secao.scrollIntoView({ behavior: 'smooth', block: 'center' });

        }

        export function calcularReajustePorNovoValor() {

            const valorAtual = parseFloat(document.getElementById('con-valor').value) || 0;

            const novoValor = parseFloat(document.getElementById('con-valor-anterior').value);

            const campoReajuste = document.getElementById('con-reajuste-aplicado');

            if (!valorAtual || isNaN(novoValor)) { return; }

            const pct = ((novoValor - valorAtual) / valorAtual) * 100;

            campoReajuste.value = pct.toFixed(2);

        }

        export function calcularNovoValorPorReajuste() {

            const valorAtual = parseFloat(document.getElementById('con-valor').value) || 0;

            const pct = parseFloat(document.getElementById('con-reajuste-aplicado').value);

            const campoNovoValor = document.getElementById('con-valor-anterior');

            if (!valorAtual || isNaN(pct)) { return; }

            const novoValor = valorAtual * (1 + pct / 100);

            campoNovoValor.value = novoValor.toFixed(2);

        }

        // CORRIGIDO (v1.53.0) — DOIS BUGS REAIS relatados juntos, mesma
        // causa raiz:
        // 1) "confirma a exclusão mas o contrato continua no banco" — o
        //    delete() disparava sem "await" e sem checar erro de verdade
        //    (só logava no devlog, nunca avisava a pessoa); a lista local
        //    era filtrada e "sucesso" aparecia ANTES de saber se o banco
        //    realmente apagou. Corrigido: agora aguarda e só confirma
        //    sucesso depois do banco confirmar.
        // 2) 409 Conflict "especialmente em Assinando" — CONFIRMADO no
        //    schema: processos_contratacao.contrato_id_fkey NÃO tem
        //    ON DELETE CASCADE (diferente de historico_contrato/
        //    divisao_repasse_contrato/mensalidades, que têm). Todo
        //    contrato nascido da Vitrine (status Assinando) tem uma linha
        //    em processos_contratacao apontando pra ele — a FK travava a
        //    exclusão. Corrigido: desvincula essa referência antes de
        //    excluir (contrato_id = null no processo, o processo em si
        //    não é apagado, só para de apontar pro contrato excluído).
        export async function excluirContrato(id) {

            const con = contratos.find(c => c.id === id);

            if (!con) return;

            const temMensalidade = mensalidades.some(m => m.contratoId === id);

            if (temMensalidade) {

                alert("⚠️ Não é possível excluir este contrato: existem lançamentos mensais vinculados a ele. Apague os lançamentos mensais primeiro (na aba Mensal, apenas os não recebidos podem ser apagados).");

                return;

            }

            if (!confirm(`Confirma a exclusão do contrato de "${con.locatario}"? Esta ação não pode ser desfeita.`)) return;

            mostrarCarregamentoGlobal('Excluindo contrato...');

            try {

                await dbAuth.from('processos_contratacao').update({ contrato_id: null }).eq('contrato_id', id);

                const { error } = await dbAuth.from('contratos').delete().eq('id', id);
                if (error) throw error;

                contratos = contratos.filter(c => c.id !== id);

                registrarLog('contratos.excluir', { contratoId: id, locatario: con.locatario });

                esconderCarregamentoGlobal();
                mostrarToast('Contrato excluído com sucesso.', 'success');

                // v1.45.0 — se a exclusão foi feita de dentro da ficha deste
                // contrato, volta pra lista (a ficha não existe mais). Se a
                // ficha do imóvel dono deste contrato estava aberta, redesenha
                // ela pra não continuar mostrando o contrato excluído.
                if (fichaContratoAtualId === id) {
                    voltarDaFichaContrato();
                } else if (fichaImovelAtualId === con.imovelId) {
                    abrirFichaImovel(fichaImovelAtualId);
                }

            } catch (err) {
                esconderCarregamentoGlobal();
                alert('❌ Não consegui excluir o contrato: ' + (err.message || String(err)));
            }

        }

        // v1.45.0 — rastreia de onde uma edição de contrato foi aberta
        // (ficha do imóvel ou ficha do próprio contrato), pra saber pra
        // onde voltar depois de salvar. null = fluxo antigo (lista geral
        // de Contratos), comportamento inalterado.
        let contextoRetornoEdicaoContrato = null;

        export function abrirEdicaoContratoContextual(contratoId, origemTipo, origemId) {
            contextoRetornoEdicaoContrato = { tipo: origemTipo, id: origemId };
            switchTab('tab-contratos');
            editarContrato(contratoId);
        }

        // "Compartilhar IPTU" — pedido explícito: copia o código do IPTU E
        // abre o WhatsApp pro locatário DESTE contrato específico (aqui não
        // há ambiguidade de qual contrato — já estamos dentro de um). Avisa
        // em tela se faltar WhatsApp ou código do IPTU.
        export function compartilharIptuContrato(contratoId) {
            const con = contratos.find(c => c.id === contratoId);
            if (!con) return;
            const imo = imoveis.find(i => i.id === con.imovelId);
            if (!con.whatsapp) { alert('⚠️ Este contrato não tem WhatsApp do locatário cadastrado.'); return; }
            if (!imo || !imo.codigoIPTU) { alert('⚠️ Este imóvel não tem código de IPTU cadastrado.'); return; }
            const txt = `Olá! Segue o código do IPTU do imóvel ${imo.empreendimento || ''} (${imo.enderecoRua || ''}, ${imo.enderecoNum || ''}) para consulta e pagamento: ${imo.codigoIPTU}`;
            if (navigator.clipboard) navigator.clipboard.writeText(imo.codigoIPTU).catch(() => {});
            window.open(`https://api.whatsapp.com/send?phone=55${con.whatsapp}&text=${encodeURIComponent(txt)}`, '_blank');
            registrarLog('contratos.compartilhar_iptu', { contratoId });
        }

        // CORRIGIDO (v1.51.0) — "Reajuste" estava abrindo o formulário
        // INTEIRO do contrato (v1.49.0 tentou reaproveitar o painel
        // existente, mas ele vive dentro do formulário completo — pedido
        // explícito era um menu suspenso curto, só com os campos de
        // reajuste). Agora é um popup dedicado (mesmo padrão visual de
        // "Dados locatário"), persiste direto: contratos.valor/
        // valor_anterior/reajuste_aplicado + historico_contrato — sem abrir
        // o formulário completo.
        // v1.133.0 — REAJUSTE CONTRATUAL em sheet (pedido do Nicola, 06/09):
        // novo valor, % (calculado), vigência, observação e ANEXO (documento
        // do reajuste guardado no Cofre já vinculado ao contrato). Mesmos ids
        // rj-* do popup antigo — salvarReajusteContratoPopup segue igual, só
        // ganhou o anexo. Entrada: ⋮ da ficha ("Reajustar contrato") e o
        // botão antigo da lista.
        export function lancarReajusteContrato(contratoId) {
            const con = contratos.find(c => c.id === contratoId);
            if (!con) return;
            if (typeof podeUsar === 'function' && rzMostrarBloqueio('contratos.reajustar')) return;
            const hoje = new Date().toISOString().slice(0, 10);
            const corpo = `
                <p class="text-xs text-slate-500 mb-3">Valor atual: <b>${formatarMoedaBR(con.valor)}/mês</b>${con.indiceReajuste ? ' · índice ' + rzEsc(con.indiceReajuste) : ''}</p>
                <div class="grid grid-cols-2 gap-2 mb-3">
                    <div><label class="block text-xs font-bold text-gray-600">Novo valor (R$) <span style="color:var(--danger)">*</span></label><input type="number" step="0.01" id="rj-valor" oninput="calcularPctReajustePopup(${con.valor})" class="w-full p-2 border rounded text-sm mt-1"></div>
                    <div><label class="block text-xs font-bold text-gray-600">% de reajuste</label><input type="number" step="0.01" id="rj-pct" oninput="calcularValorReajustePopup(${con.valor})" class="w-full p-2 border rounded text-sm mt-1"></div>
                </div>
                <div class="mb-3"><label class="block text-xs font-bold text-gray-600">Vale a partir de <span style="color:var(--danger)">*</span></label><input type="date" id="rj-vigencia" value="${hoje}" class="w-full p-2 border rounded text-sm mt-1"><p class="text-[10.5px] text-slate-500 mt-1">O valor vigente do contrato é atualizado agora; cobranças já geradas não mudam.</p></div>
                <div class="mb-3"><label class="block text-xs font-bold text-gray-600">Observação</label><textarea id="rj-obs" rows="2" placeholder="Ex.: IGP-M acumulado 12 meses, conforme cláusula 5" class="w-full p-2 border rounded text-sm mt-1"></textarea></div>
                <div class="mb-1"><label class="block text-xs font-bold text-gray-600">Documento do reajuste</label><input type="file" id="rj-arquivo" accept=".pdf,.jpg,.jpeg,.png,.docx" class="w-full text-sm mt-1"><p class="text-[10.5px] text-slate-500 mt-1">Aditivo, notificação ou cálculo. Vai pro Cofre, vinculado a este contrato.</p></div>`;
            abrirSheetForm({
                titulo: 'Reajustar contrato', sub: con.locatario || '', corpo, rotuloSalvar: 'Registrar reajuste',
                aoSalvar: () => { salvarReajusteContratoPopup(con.id); return false; },
            });
        }

        export function calcularPctReajustePopup(valorAtual) {
            const novo = parseFloat(document.getElementById('rj-valor').value);
            if (isNaN(novo) || !valorAtual) return;
            document.getElementById('rj-pct').value = (((novo - valorAtual) / valorAtual) * 100).toFixed(2);
        }

        export function calcularValorReajustePopup(valorAtual) {
            const pct = parseFloat(document.getElementById('rj-pct').value);
            if (isNaN(pct)) return;
            document.getElementById('rj-valor').value = (valorAtual * (1 + pct / 100)).toFixed(2);
        }

        export async function salvarReajusteContratoPopup(contratoId) {
            const con = contratos.find(c => c.id === contratoId);
            if (!con) return;

            const novoValor = parseFloat(document.getElementById('rj-valor').value);
            const pct = parseFloat(document.getElementById('rj-pct').value) || 0;
            const vigencia = document.getElementById('rj-vigencia').value;
            const obs = document.getElementById('rj-obs').value.trim();

            const arquivoReajuste = document.getElementById('rj-arquivo')?.files?.[0] || null; // v1.133
            if (isNaN(novoValor) || novoValor <= 0) { mostrarToast('Informe o novo valor.', 'danger'); return; }
            if (!vigencia) { mostrarToast('Informe a partir de quando vale.', 'danger'); return; }

            const valorAntigo = con.valor;

            mostrarCarregamentoGlobal('Registrando reajuste...');
            try {
                const { error } = await dbAuth.from('contratos').update({
                    valor: novoValor, valor_anterior: valorAntigo, reajuste_aplicado: true
                }).eq('id', contratoId);
                if (error) throw error;

                let descricao = `Reajuste de aluguel: ${formatarMoedaBR(valorAntigo)} → ${formatarMoedaBR(novoValor)} (${pct >= 0 ? '+' : ''}${pct}%), vigente desde ${formatarDataBR(vigencia)}.`;
                if (obs) descricao += ' ' + obs;
                // v1.133 — anexo: guarda no Cofre vinculado ao contrato (motor do Cofre, sem abrir o sheet de upload)
                let docId = null;
                if (arquivoReajuste && typeof window.rzAnexarArquivoEntidade === 'function') {
                    try {
                        docId = await window.rzAnexarArquivoEntidade('contrato', contratoId, arquivoReajuste, {
                            nome: `Reajuste ${vigencia.slice(5, 7)}/${vigencia.slice(0, 4)} — ${con.locatario || ''}`.trim(),
                            descricao: descricao, dataDocumento: vigencia, categoriaSugerida: 'reajuste|aditivo|contrato',
                        });
                        descricao += ' [documento anexado no Cofre]';
                    } catch (errDoc) { mostrarToast('Reajuste salvo, mas o anexo falhou: ' + (errDoc.message || errDoc), 'danger'); }
                }
                const { data: inserida, error: errHist } = await dbAuth.from('historico_contrato').insert({ contrato_id: contratoId, tipo: 'reajuste', descricao }).select().single();
                if (!errHist) {
                    con.historico = con.historico || [];
                    con.historico.push({ data: inserida.criado_em, descricao, tipo: 'reajuste', _salvo: true });
                }

                con.valor = novoValor;
                con.valorAnterior = valorAntigo;
                con.reajusteAplicado = true;

                esconderCarregamentoGlobal();
                fecharModalCampoContrato();
                mostrarToast('Reajuste registrado!', 'success');
                registrarLog('contratos.reajustar', { contratoId, valorAntigo, novoValor, vigencia, documentoId: docId }); // v1.133
                if (fichaImovelAtualId === con.imovelId) renderFichaImovelUnica(imoveis.find(i => i.id === con.imovelId));
                if (fichaContratoAtualId === contratoId) abrirFichaContrato(contratoId);
            } catch (err) {
                esconderCarregamentoGlobal();
                mostrarToast('Não consegui registrar o reajuste: ' + (err.message || String(err)), 'danger'); // v1.133
            }
        }

        // ===================================================================
        // v1.52.0 — "Alterar status" do contrato (pedido explícito): popup
        // com Suspender/Encerrar/Excluir + data + observação (vira histórico)
        // + tratamento de pendências financeiras quando houver mensalidades
        // 'Inadimplente' vinculadas (dar baixa sem pagamento = status
        // 'Isento', já existente no app; dar baixa como pago = status
        // 'Pago'; excluir = remove os lançamentos). "Excluir contrato" só
        // delega pra excluirContrato() já existente, que já bloqueia se
        // houver mensalidades vinculadas — não dupliquei essa trava.
        // ===================================================================
        // CORRIGIDO (v1.57.0 — pedido explícito): agora inclui Ativo/
        // Assinando como opções de status (antes só tinha Suspender/
        // Encerrar/Excluir). NUNCA mostra o status em que o contrato já
        // está — a lista de opções é montada dinamicamente, excluindo o
        // status atual.
        export function abrirAlterarStatusContrato(contratoId) {
            const con = contratos.find(c => c.id === contratoId);
            if (!con) return;
            const pendentes = mensalidades.filter(m => m.contratoId === contratoId && m.status === 'Inadimplente');

            // CORRIGIDO (v1.58.0 — pedido explícito): contrato que já teve
            // algum pagamento não pode voltar pra "Assinando" (não faz
            // sentido — já passou dessa fase).
            const jaTevePagamento = mensalidades.some(m => m.contratoId === contratoId && m.status === 'Pago');

            const todasOpcoes = [
                { valor: 'Ativo', rotulo: 'Marcar como Ativo' },
                { valor: 'Assinando', rotulo: 'Marcar como Assinando' },
                { valor: 'Suspenso', rotulo: 'Suspender contrato' },
                { valor: 'Finalizado', rotulo: 'Encerrar contrato' },
                { valor: 'excluir', rotulo: 'Excluir contrato' },
            ];
            const opcoesDisponiveis = todasOpcoes.filter(o => {
                if (o.valor === 'excluir') return true;
                if (o.valor === con.status) return false;
                if (o.valor === 'Assinando' && jaTevePagamento) return false;
                return true;
            });

            // v1.127.0 (fatia 9b) — popup Tipo B → sheet da gramática. Mesmos
            // ids (asc-acao/asc-data/asc-obs/asc-pendentes): salvarAlterarStatus
            // Contrato e abrirAcaoStatusContrato (pré-seleção) continuam
            // intocados. Fecha via fecharModalCampoContrato() (que agora
            // também fecha o sheet quando o formulário aberto é este).
            const hoje = new Date().toISOString().slice(0, 10);
            const corpo = `
                <div class="mb-3"><label class="block text-xs font-bold text-gray-600">Ação</label>
                    <select id="asc-acao" class="w-full p-2 border rounded text-sm mt-1 bg-gray-50">${opcoesDisponiveis.map(o => `<option value="${o.valor}">${o.rotulo}</option>`).join('')}</select></div>
                <div class="grid grid-cols-2 gap-2 mb-3">
                    <div><label class="block text-xs font-bold text-gray-600">Data de vigência</label><input type="date" id="asc-data" value="${hoje}" class="w-full p-2 border rounded text-sm mt-1"></div>
                    <div><label class="block text-xs font-bold text-gray-600">Status atual</label><div class="mt-1 p-2 text-sm text-slate-600">${con.status || '—'}</div></div>
                </div>
                <div class="mb-3"><label class="block text-xs font-bold text-gray-600">Observação</label><textarea id="asc-obs" rows="2" placeholder="Opcional" class="w-full p-2 border rounded text-sm mt-1"></textarea></div>
                ${pendentes.length > 0 ? `
                <div class="rz-card" style="border-color:var(--wine-light);margin-bottom:0">
                    <p class="text-xs font-semibold" style="color:var(--wine)">${pendentes.length} recebimento${pendentes.length === 1 ? '' : 's'} em aberto neste contrato. O que fazer com ele${pendentes.length === 1 ? '' : 's'}?</p>
                    <select id="asc-pendentes" class="w-full p-2 border rounded text-sm mt-2">
                        <option value="baixar_sem_pagamento">Dar baixa sem pagamento</option>
                        <option value="baixar_pago">Dar baixa como pago</option>
                        <option value="excluir">Excluir os pendentes</option>
                    </select>
                </div>` : ''}`;
            abrirSheetForm({
                titulo: 'Alterar status do contrato', sub: con.locatario || '', corpo, rotuloSalvar: 'Salvar',
                aoSalvar: () => { salvarAlterarStatusContrato(con.id); return false; },
            });
        }

        export async function aguardarIdRealDoContrato(con, tentativasMax = 20) {
            let tentativas = 0;
            while (!idEhUuidValido(con.id) && tentativas < tentativasMax) {
                await new Promise(r => setTimeout(r, 250));
                tentativas++;
            }
            return idEhUuidValido(con.id);
        }

        export async function abrirDadosNovoContratoPopup(imovelId) {
            const imo = imoveis.find(i => i.id === imovelId);
            if (!imo) return;

            // CORRIGIDO (bug real, achado 30/08/2026 testando Fiadores,
            // mas pré-existente — não introduzido agora): o filtro antigo
            // (`c.status === 'Assinando'`) só reconhecia o contrato
            // enquanto ele estivesse "Assinando" — assim que salvo, o
            // status vira 'Ativo' direto (ver salvarDadosNovoContratoPopup,
            // linha con-status) e este popup PARAVA de encontrar o
            // contrato que ele mesmo acabou de criar. Reabrir "Dados Novo
            // Contrato" depois de salvar mostrava tudo vazio de novo
            // (fiador incluso) e, se salvo de novo, CRIAVA UM CONTRATO
            // DUPLICADO em vez de atualizar o existente. Corrigido usando
            // o mesmo helper que o resto do sistema já usa pra achar "o"
            // contrato de um imóvel (obterContratoPrincipalDoImovel —
            // prioriza Ativo > Assinando > Suspenso > Finalizado).
            const con = obterContratoPrincipalDoImovel(imovelId);

            // NOVO (30/08/2026) — ver comentário de aguardarIdRealDoContrato
            // acima: se o contrato encontrado ainda tem id temporário
            // (sincronização em andamento), espera resolver antes de
            // buscar fiadores — sem isso, a busca falhava silenciosamente.
            if (con && !idEhUuidValido(con.id)) {
                mostrarCarregamentoGlobal('Só um instante, ainda sincronizando...');
                await aguardarIdRealDoContrato(con);
                esconderCarregamentoGlobal();
            }

            // NOVO (30/08/2026) — carrega fiadores já cadastrados pra este
            // contrato (se existir) antes de montar o HTML do popup.
            await carregarFiadoresContrato(con?.id || null);

            document.getElementById('modal-campo-contrato')?.remove();

            const admOpts = document.getElementById('con-administradora').innerHTML;

            const modal = document.createElement('div');
            modal.id = 'modal-campo-contrato';
            modal.style = 'position:fixed;inset:0;z-index:96;display:flex;align-items:flex-end;justify-content:center;background:rgba(23,33,30,.5);';
            modal.innerHTML = `
                <div style="background:#fff;border-radius:16px 16px 0 0;max-width:480px;width:100%;padding:16px;max-height:85vh;overflow-y:auto;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                        <h3 style="font-size:14px;font-weight:bold;color:#1e293b;">Dados Novo Contrato</h3>
                        <button onclick="fecharModalCampoContrato()" style="background:#e2e8f0;border:none;border-radius:9999px;width:26px;height:26px;flex:none;">✕</button>
                    </div>
                    <p style="font-size:11px;color:#64748b;margin-bottom:10px;">${imo.empreendimento || '-'} — ${imo.enderecoRua || ''}, ${imo.enderecoNum || ''}</p>
                    <div style="display:flex;flex-direction:column;gap:8px;">
                        <div><label style="font-size:11px;font-weight:bold;color:#64748b;">Nome do locatário <span style="color:var(--danger)">*</span></label><input id="dnc-locatario" required value="${(con?.locatario || '').replace(/"/g, '')}" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;"></div>
                        <div><label style="font-size:11px;font-weight:bold;color:#64748b;">CPF/CNPJ <span style="color:var(--danger)">*</span></label><input id="dnc-cpf" required value="${con?.cpf || ''}" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;"></div>
                        <div style="display:flex;gap:8px;">
                            <div style="flex:1;"><label style="font-size:11px;font-weight:bold;color:#64748b;">WhatsApp <span style="color:var(--danger)">*</span></label><input id="dnc-whatsapp" required value="${con?.whatsapp || ''}" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;"></div>
                            <div style="flex:1;"><label style="font-size:11px;font-weight:bold;color:#64748b;">E-mail <span style="color:var(--danger)">*</span></label><input id="dnc-email" required type="email" value="${con?.email || ''}" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;"></div>
                        </div>
                        <!-- pedido explícito: mais 1 linha nesse campo -->
                        <div><label style="font-size:11px;font-weight:bold;color:#64748b;">Endereço atual do locatário <span style="color:var(--danger)">*</span></label><textarea id="dnc-endereco" required rows="3" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;">${(con?.locatarioEnderecoAtual || '').replace(/</g, '&lt;')}</textarea></div>
                        <div style="display:flex;gap:8px;">
                            <div style="flex:1;"><label style="font-size:11px;font-weight:bold;color:#64748b;">Profissão <span style="color:var(--danger)">*</span></label><input id="dnc-profissao" required value="${(con?.locatarioProfissao || '').replace(/"/g, '')}" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;"></div>
                            <div style="flex:1;"><label style="font-size:11px;font-weight:bold;color:#64748b;">Estado civil <span style="color:var(--danger)">*</span></label>
                                <select id="dnc-estado-civil" required style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;background:#f8fafc;">
                                    <option value="">-- Selecione --</option>
                                    <option ${con?.locatarioEstadoCivil==='Solteiro(a)'?'selected':''}>Solteiro(a)</option>
                                    <option ${con?.locatarioEstadoCivil==='Casado(a)'?'selected':''}>Casado(a)</option>
                                    <option ${con?.locatarioEstadoCivil==='Divorciado(a)'?'selected':''}>Divorciado(a)</option>
                                    <option ${con?.locatarioEstadoCivil==='Viúvo(a)'?'selected':''}>Viúvo(a)</option>
                                    <option ${con?.locatarioEstadoCivil==='União estável'?'selected':''}>União estável</option>
                                </select>
                            </div>
                        </div>
                        <div style="display:flex;gap:8px;">
                            <div style="flex:1;"><label style="font-size:11px;font-weight:bold;color:#64748b;">Início vigência <span style="color:var(--danger)">*</span></label><input type="date" id="dnc-inicio" required value="${con?.inicio || ''}" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;"></div>
                            <div style="flex:1;"><label style="font-size:11px;font-weight:bold;color:#64748b;">Fim vigência <span style="color:var(--danger)">*</span></label><input type="date" id="dnc-fim" required value="${con?.fim || ''}" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;"></div>
                        </div>
                        <div style="display:flex;gap:8px;">
                            <!-- pedido explícito: permite editar valor do
                                 aluguel e (a "descrição", ver campo abaixo)
                                 diretamente aqui, no início do contrato. -->
                            <div style="flex:1;"><label style="font-size:11px;font-weight:bold;color:#64748b;">Valor do aluguel (R$) <span style="color:var(--danger)">*</span></label><input type="number" id="dnc-valor" required value="${con?.valor || imo.valor || 0}" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;"></div>
                            <div style="flex:1;"><label style="font-size:11px;font-weight:bold;color:#64748b;">Dia de vencimento <span style="color:var(--danger)">*</span></label><input type="number" id="dnc-vencimento-dia" required min="1" max="31" value="${con?.vencimentoDia || 5}" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;"></div>
                        </div>
                        <div style="display:flex;gap:8px;">
                            <div style="flex:1;"><label style="font-size:11px;font-weight:bold;color:#64748b;">Forma de pagamento</label>
                                <select id="dnc-forma-pgto" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;background:#f8fafc;">
                                    <option ${con?.formaPagamento==='PIX'?'selected':''}>PIX</option>
                                    <option ${con?.formaPagamento==='Boleto'?'selected':''}>Boleto</option>
                                    <option ${con?.formaPagamento==='Depósito'?'selected':''}>Depósito</option>
                                </select>
                            </div>
                            <div style="flex:1;"><label style="font-size:11px;font-weight:bold;color:#64748b;">Índice de reajuste <span style="color:var(--danger)">*</span></label><input id="dnc-reajuste" required value="${con?.reajuste || 'IPCA'}" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;"></div>
                        </div>
                        <div><label style="font-size:11px;font-weight:bold;color:#64748b;">Administradora</label><select id="dnc-administradora" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;background:#f8fafc;">${admOpts}</select></div>
                        <div style="display:flex;gap:8px;">
                            <div style="flex:1;"><label style="font-size:11px;font-weight:bold;color:#64748b;">Locatário paga condomínio</label>
                                <select id="dnc-condominio-locatario" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;background:#f8fafc;">
                                    <option value="Não" ${con?.condominioLocatario!=='Sim'?'selected':''}>Não</option>
                                    <option value="Sim" ${con?.condominioLocatario==='Sim'?'selected':''}>Sim</option>
                                </select>
                            </div>
                            <div style="flex:1;"><label style="font-size:11px;font-weight:bold;color:#64748b;">Locatário paga IPTU</label>
                                <select id="dnc-iptu-locatario" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;background:#f8fafc;">
                                    <option value="Não" ${con?.locatarioPagaIptu!=='Sim'?'selected':''}>Não</option>
                                    <option value="Sim" ${con?.locatarioPagaIptu==='Sim'?'selected':''}>Sim</option>
                                </select>
                            </div>
                        </div>
                        <!-- "descrição" pedida: campo livre, vira histórico
                             ao salvar (mesmo padrão de observação usado nos
                             demais popups desta ficha). -->
                        <div><label style="font-size:11px;font-weight:bold;color:#64748b;">Descrição / observação</label><textarea id="dnc-descricao" rows="2" placeholder="Escreva aqui uma observação..." style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;"></textarea></div>

                        <!-- NOVO (30/08/2026) — Fiadores, pedido explícito do
                             Nicola. 0, 1, 2 ou mais por contrato. -->
                        <div style="border-top:1px solid #e2e8f0;padding-top:10px;margin-top:4px;">
                            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                                <span style="font-size:12px;font-weight:bold;color:#1e293b;">Fiadores</span>
                                <button type="button" onclick="adicionarFiadorPopup()" style="background:var(--pine);color:#fff;font-weight:bold;font-size:11px;padding:6px 10px;border:none;border-radius:6px;">+ Adicionar fiador</button>
                            </div>
                            <div id="dnc-fiadores-lista"></div>
                        </div>
                    </div>
                    <div style="display:flex;gap:8px;margin-top:14px;">
                        <button onclick="salvarDadosNovoContratoPopup('${imovelId}', ${con ? `'${con.id}'` : 'null'})" style="flex:1;background:var(--pine);color:#fff;font-weight:bold;font-size:13px;padding:10px;border:none;border-radius:8px;">Salvar</button>
                        <button onclick="fecharModalCampoContrato()" style="flex:1;background:#f1f5f9;color:#475569;font-weight:bold;font-size:13px;padding:10px;border:none;border-radius:8px;">Sair</button>
                    </div>
                </div>`;
            document.body.appendChild(modal);
            modal.onclick = (ev) => { if (ev.target === modal) modal.remove(); };
            renderFiadoresPopup();
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        export function salvarDadosNovoContratoPopup(imovelId, contratoId) {
            // Validação simples (os "required" no HTML não bloqueiam
            // sozinhos porque este popup não é um <form> — mesma checagem
            // que os demais campos obrigatórios desta ficha já fazem).
            const camposObrigatorios = ['dnc-locatario', 'dnc-cpf', 'dnc-whatsapp', 'dnc-email', 'dnc-endereco', 'dnc-profissao', 'dnc-estado-civil', 'dnc-inicio', 'dnc-fim', 'dnc-valor', 'dnc-vencimento-dia', 'dnc-reajuste'];
            for (const campoId of camposObrigatorios) {
                const el = document.getElementById(campoId);
                if (!el || !el.value || !el.value.toString().trim()) {
                    alert('⚠️ Preencha todos os campos obrigatórios (*).');
                    el?.focus();
                    return;
                }
            }

            // Escreve nos campos REAIS do formulário completo (escondido) e
            // chama saveContrato() sem duplicar validação/persistência/
            // diff/histórico — tudo isso já existe lá.
            document.getElementById('con-id').value = contratoId || '';
            document.getElementById('con-imovel').value = imovelId;
            // CORRIGIDO (30/08/2026, pedido explícito do Nicola: "salvando
            // contrato e ele não tá gerando um contrato no status
            // assinando"): contrato novo por este popup pulava direto pra
            // 'Ativo', nunca passava por 'Assinando' — inconsistente com o
            // resto do sistema, que trata 'Assinando' como "aguardando
            // revisão/assinatura" (mesmo status que o formulário público
            // da Vitrine usa) e é EXIGIDO por gerarMinutaNoCofre() pra
            // achar o contrato ("Ainda não há um contrato 'Assinando'
            // para este imóvel..."). Cadastrar via "Dados Novo Contrato"
            // (staff, não Vitrine) agora também nasce 'Assinando' — vira
            // 'Ativo' depois, de propósito, via "Alterar Status" (mesmo
            // fluxo que já dispara a geração automática de item a
            // receber — ver salvarAlterarStatusContrato()).
            document.getElementById('con-status').value = contratoId ? (contratos.find(c => c.id === contratoId)?.status || 'Assinando') : 'Assinando';
            document.getElementById('con-locatario').value = document.getElementById('dnc-locatario').value.trim();
            document.getElementById('con-cpf').value = document.getElementById('dnc-cpf').value.trim();
            formatarMascaraDocumento();
            document.getElementById('con-whatsapp').value = document.getElementById('dnc-whatsapp').value.trim();
            document.getElementById('con-email').value = document.getElementById('dnc-email').value.trim();
            document.getElementById('con-locatario-endereco').value = document.getElementById('dnc-endereco').value.trim();
            document.getElementById('con-locatario-profissao').value = document.getElementById('dnc-profissao').value.trim();
            document.getElementById('con-locatario-estado-civil').value = document.getElementById('dnc-estado-civil').value;
            document.getElementById('con-inicio').value = document.getElementById('dnc-inicio').value;
            document.getElementById('con-fim').value = document.getElementById('dnc-fim').value;
            document.getElementById('con-valor').value = document.getElementById('dnc-valor').value;
            document.getElementById('con-vencimento-dia').value = document.getElementById('dnc-vencimento-dia').value;
            document.getElementById('con-forma-pagamento').value = document.getElementById('dnc-forma-pgto').value;
            document.getElementById('con-reajuste').value = document.getElementById('dnc-reajuste').value.trim();
            document.getElementById('con-administradora').value = document.getElementById('dnc-administradora').value;
            document.getElementById('con-condominio-locatario').value = document.getElementById('dnc-condominio-locatario').value;
            document.getElementById('con-iptu-locatario').value = document.getElementById('dnc-iptu-locatario').value;
            document.getElementById('con-antecipado').value = document.getElementById('con-antecipado').value || 'Sim';

            // Sem painel de reajuste aqui (pedido explícito) — os campos
            // dele ficam em branco, saveContrato() já trata isso como "sem
            // reajuste nesta gravação".
            document.getElementById('con-valor-anterior').value = '';
            document.getElementById('con-vigente-desde').value = '';

            sugerirDescontoEnergia();
            exibirDivisaoImovelNoContrato(imovelId, contratoId ? contratos.find(c => c.id === contratoId)?.divisaoRepasse : undefined);

            const descricaoTexto = document.getElementById('dnc-descricao').value.trim();

            // CORRIGIDO (bug real, 30/08/2026, pedido explícito do Nicola):
            // saveContrato() agora retorna `false` quando alguma validação
            // barra a gravação (ver changelog completo dentro dela) — antes
            // esse retorno nunca era checado aqui, e o popup fechava
            // normalmente (parecendo sucesso) mesmo quando nada tinha sido
            // salvo de verdade (ex.: CPF de teste inválido). Sem isso, o
            // fluxo abaixo (histórico da descrição, fechar modal) rodava
            // em cima de um contrato que nunca existiu.
            const salvou = saveContrato({ preventDefault: () => {} });
            if (salvou === false) return;

            // Descrição/observação vira histórico à parte (mesmo padrão dos
            // demais popups desta ficha) — saveContrato() não tem campo de
            // observação livre, só o diff estruturado.
            if (descricaoTexto) {
                const idFinal = contratoId || contratos[contratos.length - 1]?.id;
                const conFinal = contratos.find(c => c.id === idFinal);
                if (conFinal) {
                    dbAuth.from('historico_contrato').insert({ contrato_id: conFinal.id, tipo: 'alteracao', descricao: descricaoTexto }).select().single().then(({ data, error }) => {
                        if (!error && data) {
                            conFinal.historico = conFinal.historico || [];
                            conFinal.historico.push({ data: data.criado_em, descricao: descricaoTexto, tipo: 'alteracao', _salvo: true });
                        }
                    });
                }
            }

            fecharModalCampoContrato();
            if (fichaImovelAtualId === imovelId) setTimeout(() => renderFichaImovelUnica(imoveis.find(i => i.id === imovelId)), 300);
        }

        export async function salvarAlterarStatusContrato(contratoId) {
            const con = contratos.find(c => c.id === contratoId);
            if (!con) return;

            const acao = document.getElementById('asc-acao').value;
            const data = document.getElementById('asc-data').value;
            const obs = document.getElementById('asc-obs').value.trim();
            const pendentesEl = document.getElementById('asc-pendentes');
            const decisaoPendentes = pendentesEl ? pendentesEl.value : null;

            mostrarCarregamentoGlobal(acao === 'excluir' ? 'Excluindo...' : 'Atualizando status...');
            try {
                const pendentes = mensalidades.filter(m => m.contratoId === contratoId && m.status === 'Inadimplente');

                if (decisaoPendentes && pendentes.length > 0) {
                    const ids = pendentes.map(m => m.id);
                    if (decisaoPendentes === 'excluir') {
                        const { error: errDel } = await dbAuth.from('mensalidades').delete().in('id', ids);
                        if (errDel) throw errDel;
                        mensalidades = mensalidades.filter(m => !ids.includes(m.id));
                    } else {
                        const novoStatusDb = decisaoPendentes === 'baixar_pago' ? 'pago' : 'isento';
                        const { error: errUpd } = await dbAuth.from('mensalidades').update({ status: novoStatusDb, data_pgto: data }).in('id', ids);
                        if (errUpd) throw errUpd;
                        mensalidades.forEach(m => { if (ids.includes(m.id)) { m.status = decisaoPendentes === 'baixar_pago' ? 'Pago' : 'Isento'; m.dataPgto = data; } });
                    }
                }

                if (acao === 'excluir') {
                    // v1.53.0 — mesma correção de excluirContrato(): desvincula
                    // processos_contratacao antes (FK sem CASCADE) e aguarda
                    // o delete de verdade antes de confirmar sucesso.
                    if (decisaoPendentes === 'baixar_sem_pagamento' || decisaoPendentes === 'baixar_pago') {
                        // se a decisão foi "dar baixa" (não excluir), ainda
                        // sobra o lançamento vinculado — excluirContrato()
                        // bloqueia de propósito nesse caso (mesma trava de
                        // segurança de sempre, não contornada aqui).
                        esconderCarregamentoGlobal();
                        fecharModalCampoContrato();
                        excluirContrato(contratoId);
                        return;
                    }

                    await dbAuth.from('processos_contratacao').update({ contrato_id: null }).eq('contrato_id', contratoId);
                    const { error: errDelCon } = await dbAuth.from('contratos').delete().eq('id', contratoId);
                    if (errDelCon) throw errDelCon;

                    contratos = contratos.filter(c => c.id !== contratoId);
                    registrarLog('contratos.excluir', { contratoId, locatario: con.locatario });

                    esconderCarregamentoGlobal();
                    fecharModalCampoContrato();
                    mostrarToast('Contrato excluído com sucesso.', 'success');

                    if (fichaContratoAtualId === contratoId) {
                        voltarDaFichaContrato();
                    } else if (fichaImovelAtualId === con.imovelId) {
                        abrirFichaImovel(fichaImovelAtualId);
                    }
                    return;
                }

                const statusDb = mapStatusContratoAntigoParaSupabase(acao);
                const { error } = await dbAuth.from('contratos').update({ status: statusDb }).eq('id', contratoId);
                if (error) throw error;

                const statusAntigo = con.status;
                con.status = acao;

                const descricao = `Status alterado: ${statusAntigo} → ${acao}, em ${formatarDataBR(data)}.` + (obs ? ' ' + obs : '');
                const { data: inserida, error: errHist } = await dbAuth.from('historico_contrato').insert({ contrato_id: contratoId, tipo: 'alteracao', descricao }).select().single();
                if (!errHist) {
                    con.historico = con.historico || [];
                    con.historico.push({ data: inserida.criado_em, descricao, tipo: 'alteracao', _salvo: true });
                }

                // v1.57.0 — CORRIGIDO/AMPLIADO: antes só tratava o caso de
                // ficar sem contrato operacional (→ Vago). Agora também
                // sincroniza quando o contrato vira Ativo (→ imóvel
                // Alugado) ou Assinando (→ imóvel Assinando) — mesma
                // lógica que já existia em saveContrato() pro fluxo normal
                // de criação, agora consistente aqui também.
                const imo = imoveis.find(i => i.id === con.imovelId);
                if (imo) {
                    const aindaTemOperacional = contratos.some(c => c.imovelId === imo.id && c.status !== 'Finalizado');
                    let novoStatusImovel = imo.status;
                    if (!aindaTemOperacional) {
                        novoStatusImovel = 'Vago';
                    } else if (acao === 'Ativo') {
                        novoStatusImovel = 'Alugado';
                    } else if (acao === 'Assinando') {
                        novoStatusImovel = 'Assinando';
                    }
                    if (novoStatusImovel !== imo.status) {
                        imo.status = novoStatusImovel;
                        await dbAuth.from('imoveis').update({ status: mapStatusAntigoParaSupabase(novoStatusImovel) }).eq('id', imo.id);
                    }
                }

                esconderCarregamentoGlobal();
                fecharModalCampoContrato();
                mostrarToast('Status do contrato atualizado!', 'success');
                registrarLog('contratos.editar', { contratoId, o_que: 'status', statusAntigo, statusNovo: acao }); // v1.131

                // NOVO (30/08/2026) — pedido explícito do Nicola: ao ativar
                // um contrato que ainda não tem NENHUM item a receber
                // gerado (comum quando o contrato pula direto pra Ativo,
                // sem passar por Assinando — ver v1.73.0), gera já a
                // competência atual pra ESSE contrato só (gerarMensalidades
                // Para Competencia com contratoIdFiltro — mesma rotina do
                // botão manual do Financeiro, trava anti-duplicidade já
                // embutida). Silencioso se não gerar nada (ex.: contrato
                // com início no futuro) — não é erro, só não há nada a
                // cobrar ainda.
                if (acao === 'Ativo' && !mensalidades.some(m => m.contratoId === contratoId)) {
                    const hoje = new Date();
                    const refAtual = String(hoje.getMonth() + 1).padStart(2, '0') + '/' + hoje.getFullYear();
                    const idsGerados = [];
                    const qtdGerada = gerarMensalidadesParaCompetencia(refAtual, idsGerados, contratoId);
                    if (qtdGerada > 0) {
                        await saveAll(true, null, ['mensalidades'], idsGerados);
                        mostrarToast('Item a receber de ' + refAtual + ' gerado.', 'success');
                        registrarLog('mensalidades.gerar_automatico_ativacao', { contratoId, referencia: refAtual });
                    }
                }

                if (fichaImovelAtualId === con.imovelId) renderFichaImovelUnica(imoveis.find(i => i.id === con.imovelId));
                if (fichaContratoAtualId === contratoId) abrirFichaContrato(contratoId);
                // CORRIGIDO (bug real, 30/08/2026): alterar o status do
                // contrato JÁ atualizava imo.status corretamente (ver
                // bloco logo acima) e já persistia no Supabase — só
                // faltava mandar a LISTA de imóveis se redesenhar com o
                // dado novo. Sem isso, o card na lista só mostrava o
                // status certo depois de um F5 (que busca tudo de novo do
                // banco) — o dado sempre esteve certo, só a tela não
                // repintava sozinha.
                if (document.querySelector('.tab-content.active')?.id === 'tab-imoveis') renderImoveis();
            } catch (err) {
                esconderCarregamentoGlobal();
                alert('❌ Não consegui alterar o status: ' + (err.message || String(err)));
            }
        }

        // CORRIGIDO (v1.50.0) — BUG REAL relatado: "Could not find the
        // '_local' column of 'contratos'". Causa: __local era removido de
        // patchDb via destructuring, mas depois RE-ADICIONADO ao objeto
        // final antes de mandar pro Supabase ({ ...patchDb, __local }) —
        // então a coluna literal "__local" ia direto pro update() e o
        // PostgREST rejeitava. Corrigido: __local agora é um parâmetro
        // SEPARADO, nunca entra no objeto que vai pro banco.
        export async function salvarObservacaoContrato(contratoId, patchDb, localPatch, textoObs, tituloLog) {
            mostrarCarregamentoGlobal('Salvando...');
            try {
                const { error } = await dbAuth.from('contratos').update(patchDb).eq('id', contratoId);
                if (error) throw error;

                const con = contratos.find(c => c.id === contratoId);
                if (con && localPatch) Object.assign(con, localPatch);

                if (textoObs && con) {
                    const descricao = `${tituloLog}: ${textoObs}`;
                    const { data: inserida, error: errHist } = await dbAuth.from('historico_contrato').insert({ contrato_id: contratoId, tipo: 'alteracao', descricao }).select().single();
                    if (!errHist) {
                        con.historico = con.historico || [];
                        con.historico.push({ data: inserida.criado_em, descricao, tipo: 'alteracao', _salvo: true });
                    }
                }

                esconderCarregamentoGlobal();
                fecharModalCampoContrato();
                mostrarToast('Salvo!', 'success');
                registrarLog('contratos.editar', { contratoId, o_que: tituloLog }); // v1.131 — código do catálogo; o título vai no detalhe
                if (con && fichaImovelAtualId === con.imovelId) renderFichaImovelUnica(imoveis.find(i => i.id === con.imovelId));
                if (fichaContratoAtualId === contratoId) abrirFichaContrato(contratoId);
            } catch (err) {
                esconderCarregamentoGlobal();
                alert('❌ Não consegui salvar: ' + (err.message || String(err)));
            }
        }

        export function abrirDadosLocatarioContrato(contratoId) {
            const con = contratos.find(c => c.id === contratoId);
            if (!con) return;
            document.getElementById('modal-campo-contrato')?.remove();

            const modal = document.createElement('div');
            modal.id = 'modal-campo-contrato';
            modal.style = 'position:fixed;inset:0;z-index:96;display:flex;align-items:flex-end;justify-content:center;background:rgba(23,33,30,.5);';
            modal.innerHTML = `
                <div style="background:#fff;border-radius:16px 16px 0 0;max-width:480px;width:100%;padding:16px;max-height:85vh;overflow-y:auto;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                        <h3 style="font-size:14px;font-weight:bold;color:#1e293b;">Dados do Locatário</h3>
                        <button onclick="fecharModalCampoContrato()" style="background:#e2e8f0;border:none;border-radius:9999px;width:26px;height:26px;flex:none;">✕</button>
                    </div>
                    <div style="display:flex;flex-direction:column;gap:8px;">
                        <div><label style="font-size:11px;font-weight:bold;color:#64748b;">Nome do locatário</label><input id="mdl-nome" value="${(con.locatario||'').replace(/"/g,'')}" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;"></div>
                        <div><label style="font-size:11px;font-weight:bold;color:#64748b;">CPF/CNPJ</label><input id="mdl-cpf" value="${con.cpf||''}" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;"></div>
                        <div><label style="font-size:11px;font-weight:bold;color:#64748b;">Pessoa de contato</label><input id="mdl-contato" value="${(con.contatoNome||'').replace(/"/g,'')}" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;"></div>
                        <div><label style="font-size:11px;font-weight:bold;color:#64748b;">WhatsApp</label><input id="mdl-whatsapp" value="${con.whatsapp||''}" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;"></div>
                        <div><label style="font-size:11px;font-weight:bold;color:#64748b;">E-mail</label><input id="mdl-email" value="${con.email||''}" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;"></div>
                        <div><label style="font-size:11px;font-weight:bold;color:#64748b;">Endereço do locatário</label><input id="mdl-endereco" value="${(con.locatarioEnderecoAtual||'').replace(/"/g,'')}" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;"></div>
                        <div><label style="font-size:11px;font-weight:bold;color:#64748b;">Profissão</label><input id="mdl-profissao" value="${(con.locatarioProfissao||'').replace(/"/g,'')}" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;"></div>
                        <div><label style="font-size:11px;font-weight:bold;color:#64748b;">Estado civil</label>
                            <select id="mdl-estadocivil" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;background:#f8fafc;">
                                <option value="">-- Selecione --</option>
                                <option ${con.locatarioEstadoCivil==='Solteiro(a)'?'selected':''}>Solteiro(a)</option>
                                <option ${con.locatarioEstadoCivil==='Casado(a)'?'selected':''}>Casado(a)</option>
                                <option ${con.locatarioEstadoCivil==='Divorciado(a)'?'selected':''}>Divorciado(a)</option>
                                <option ${con.locatarioEstadoCivil==='Viúvo(a)'?'selected':''}>Viúvo(a)</option>
                                <option ${con.locatarioEstadoCivil==='União estável'?'selected':''}>União estável</option>
                            </select>
                        </div>
                        <div><label style="font-size:11px;font-weight:bold;color:#64748b;">Observação (fica registrada no histórico)</label><textarea id="mdl-obs" rows="2" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;"></textarea></div>
                    </div>
                    <div style="display:flex;gap:8px;margin-top:14px;">
                        <button onclick="fecharModalCampoContrato()" style="flex:1;background:#f1f5f9;color:#475569;font-weight:bold;font-size:13px;padding:10px;border:none;border-radius:8px;">Fechar</button>
                        <button onclick="salvarDadosLocatarioContrato('${con.id}')" style="flex:1;background:var(--pine);color:#fff;font-weight:bold;font-size:13px;padding:10px;border:none;border-radius:8px;">Salvar</button>
                    </div>
                </div>`;
            document.body.appendChild(modal);
            modal.onclick = (ev) => { if (ev.target === modal) modal.remove(); };
        }

        export function salvarDadosLocatarioContrato(contratoId) {
            const patch = {
                locatario: document.getElementById('mdl-nome').value.trim(),
                cpf: document.getElementById('mdl-cpf').value.trim(),
                contato_nome: document.getElementById('mdl-contato').value.trim() || null,
                whatsapp: document.getElementById('mdl-whatsapp').value.trim(),
                email: document.getElementById('mdl-email').value.trim() || null,
                locatario_endereco_atual: document.getElementById('mdl-endereco').value.trim() || null,
                locatario_profissao: document.getElementById('mdl-profissao').value.trim() || null,
                locatario_estado_civil: document.getElementById('mdl-estadocivil').value || null,
            };
            const localPatch = {
                locatario: patch.locatario, cpf: patch.cpf, contatoNome: patch.contato_nome || '',
                whatsapp: patch.whatsapp, email: patch.email || '',
                locatarioEnderecoAtual: patch.locatario_endereco_atual || '',
                locatarioProfissao: patch.locatario_profissao || '',
                locatarioEstadoCivil: patch.locatario_estado_civil || '',
            };
            const obs = document.getElementById('mdl-obs').value.trim();
            salvarObservacaoContrato(contratoId, patch, localPatch, obs, 'Dados do locatário atualizados');
        }

        export function abrirDetalhesContrato(contratoId) {
            const con = contratos.find(c => c.id === contratoId);
            if (!con) return;
            const imo = imoveis.find(i => i.id === con.imovelId);
            document.getElementById('modal-campo-contrato')?.remove();

            const modal = document.createElement('div');
            modal.id = 'modal-campo-contrato';
            modal.style = 'position:fixed;inset:0;z-index:96;display:flex;align-items:flex-end;justify-content:center;background:rgba(23,33,30,.5);';
            modal.innerHTML = `
                <div style="background:#fff;border-radius:16px 16px 0 0;max-width:480px;width:100%;padding:16px;max-height:85vh;overflow-y:auto;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                        <h3 style="font-size:14px;font-weight:bold;color:#1e293b;">Detalhes do Contrato</h3>
                        <button onclick="fecharModalCampoContrato()" style="background:#e2e8f0;border:none;border-radius:9999px;width:26px;height:26px;flex:none;">✕</button>
                    </div>
                    <!-- v1.17.0 (NOVO, 02/09/2026, pedido explícito: "as partes
                         devem ser vários chips e aparecer... num contrato
                         (locatario, fiador, rateio-divisao do aluguel entre
                         proprietários)") — só EXIBIÇÃO aqui, mesmo visual pill
                         do chip Partes (item de controle) e Propriedade
                         (Ativos). Não duplica os fluxos de escrita já
                         existentes de locatário/fiador/divisão (cada um
                         continua editável pelos próprios popups de sempre —
                         "Dados do locatário"/"Divisão do contrato") — junta
                         os 3 numa visão só, lida de 3 fontes diferentes
                         (contrato.locatario texto, partes_papeis fiador,
                         divisao_repasse_contrato). -->
                    <div id="mdt-partes" class="flex flex-wrap gap-1.5 mb-3 pb-3" style="border-bottom:1px solid var(--line)">
                        <span class="text-[11px]" style="color:var(--sage)">Carregando partes...</span>
                    </div>
                    <div style="display:flex;flex-direction:column;gap:8px;">
                        <div style="display:flex;gap:8px;">
                            <div style="flex:1;"><label style="font-size:11px;font-weight:bold;color:#64748b;">Início vigência</label><input type="date" id="mdt-inicio" value="${con.inicio||''}" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;"></div>
                            <div style="flex:1;"><label style="font-size:11px;font-weight:bold;color:#64748b;">Fim vigência</label><input type="date" id="mdt-fim" value="${con.fim||''}" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;"></div>
                        </div>
                        <div><label style="font-size:11px;font-weight:bold;color:#64748b;">Desconto energia (%)</label><input type="number" id="mdt-desconto-energia" value="${con.descontoEnergia||0}" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;"></div>
                        <div style="display:flex;gap:8px;">
                            <div style="flex:1;"><label style="font-size:11px;font-weight:bold;color:#64748b;">Locatário paga IPTU</label>
                                <select id="mdt-iptu" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;background:#f8fafc;">
                                    <option value="Não" ${con.locatarioPagaIptu!=='Sim'?'selected':''}>Não</option>
                                    <option value="Sim" ${con.locatarioPagaIptu==='Sim'?'selected':''}>Sim (${formatarMoedaBR(imo?imo.iptu:0)})</option>
                                </select>
                            </div>
                            <div style="flex:1;"><label style="font-size:11px;font-weight:bold;color:#64748b;">Locatário paga condomínio</label>
                                <select id="mdt-condominio" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;background:#f8fafc;">
                                    <option value="Não" ${con.condominioLocatario!=='Sim'?'selected':''}>Não</option>
                                    <option value="Sim" ${con.condominioLocatario==='Sim'?'selected':''}>Sim (${formatarMoedaBR(imo?imo.condominio:0)})</option>
                                </select>
                            </div>
                        </div>
                        <div><label style="font-size:11px;font-weight:bold;color:#64748b;">Administradora</label>
                            <select id="mdt-administradora" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;background:#f8fafc;">
                                <option value="">-- Nenhuma --</option>
                                ${administradoras.map(a => `<option value="${a.id}" ${con.administradoraId===a.id?'selected':''}>${a.nome}</option>`).join('')}
                            </select>
                        </div>
                        <div style="display:flex;gap:8px;">
                            <div style="flex:1;"><label style="font-size:11px;font-weight:bold;color:#64748b;">Forma de pagamento</label>
                                <select id="mdt-forma-pgto" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;background:#f8fafc;">
                                    <option ${con.formaPagamento==='PIX'?'selected':''}>PIX</option>
                                    <option ${con.formaPagamento==='Boleto'?'selected':''}>Boleto</option>
                                    <option ${con.formaPagamento==='Depósito'?'selected':''}>Depósito</option>
                                </select>
                            </div>
                            <div style="flex:1;"><label style="font-size:11px;font-weight:bold;color:#64748b;">Índice de reajuste</label><input id="mdt-reajuste" value="${con.reajuste||'IPCA'}" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;"></div>
                        </div>
                        <div><label style="font-size:11px;font-weight:bold;color:#64748b;">Observação (fica registrada no histórico)</label><textarea id="mdt-obs" rows="2" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;"></textarea></div>
                    </div>
                    <div style="display:flex;gap:8px;margin-top:14px;">
                        <button onclick="fecharModalCampoContrato()" style="flex:1;background:#f1f5f9;color:#475569;font-weight:bold;font-size:13px;padding:10px;border:none;border-radius:8px;">Fechar</button>
                        <button onclick="salvarDetalhesContrato('${con.id}')" style="flex:1;background:var(--pine);color:#fff;font-weight:bold;font-size:13px;padding:10px;border:none;border-radius:8px;">Salvar</button>
                    </div>
                </div>`;
            document.body.appendChild(modal);
            modal.onclick = (ev) => { if (ev.target === modal) modal.remove(); };
            montarChipsPartesContrato(con);
        }

        // v1.17.0 (NOVO) — busca as 3 fontes em paralelo e monta os chips.
        // Sem ação de clicar (só exibição) — os 3 fluxos de escrita
        // continuam nos próprios popups de sempre.
        export async function montarChipsPartesContrato(con) {
            const mount = document.getElementById('mdt-partes');
            if (!mount) return;
            try {
                const [fiadoresRes, divisaoRes] = await Promise.all([
                    dbAuth.from('partes_papeis').select('partes(nome)').eq('entidade_tipo', 'contrato').eq('entidade_id', con.id).eq('papel', 'fiador').eq('ativo', true),
                    dbAuth.from('divisao_repasse_contrato').select('nome_externo, percentual, pessoas(nome)').eq('contrato_id', con.id)
                ]);
                const chips = [];
                if (con.locatario) chips.push(`<span class="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-300">${escapeHtmlSaidas(con.locatario)} · Locatário</span>`);
                (fiadoresRes.data || []).forEach(f => {
                    if (f.partes?.nome) chips.push(`<span class="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-300">${escapeHtmlSaidas(f.partes.nome)} · Fiador</span>`);
                });
                (divisaoRes.data || []).forEach(d => {
                    const nome = d.pessoas?.nome || d.nome_externo;
                    if (nome) chips.push(`<span class="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-300">${escapeHtmlSaidas(nome)} · Recebe ${Number(d.percentual)}%</span>`);
                });
                mount.innerHTML = chips.length ? chips.join('') : `<span class="text-[11px]" style="color:var(--sage)">Nenhuma parte cadastrada ainda.</span>`;
            } catch (err) {
                mount.innerHTML = `<span class="text-[11px] text-red-500">Não consegui carregar as partes agora.</span>`;
                logScreen('Erro ao montar chips de partes do contrato: ' + err.message, true);
            }
        }

        // CORRIGIDO (v1.53.0) — BUG REAL relatado: "invalid input syntax for
        // type boolean: 'Sim'". condominio_locatario é boolean no banco
        // (confirmado no schema), mas eu mandava a STRING 'Sim'/'Não' direto
        // — só locatario_paga_iptu (linha acima) já convertia certo.
        export function salvarDetalhesContrato(contratoId) {
            const patch = {
                inicio: document.getElementById('mdt-inicio').value || null,
                fim: document.getElementById('mdt-fim').value || null,
                desconto_energia: parseFloat(document.getElementById('mdt-desconto-energia').value) || 0,
                locatario_paga_iptu: document.getElementById('mdt-iptu').value === 'Sim',
                condominio_locatario: document.getElementById('mdt-condominio').value === 'Sim',
                administradora_id: document.getElementById('mdt-administradora').value || null,
                forma_pagamento: document.getElementById('mdt-forma-pgto').value,
                reajuste: document.getElementById('mdt-reajuste').value.trim() || 'IPCA',
            };
            const localPatch = {
                inicio: patch.inicio, fim: patch.fim, descontoEnergia: patch.desconto_energia,
                locatarioPagaIptu: patch.locatario_paga_iptu ? 'Sim' : 'Não',
                condominioLocatario: patch.condominio_locatario ? 'Sim' : 'Não',
                administradoraId: patch.administradora_id || '',
                formaPagamento: patch.forma_pagamento, reajuste: patch.reajuste,
            };
            const obs = document.getElementById('mdt-obs').value.trim();
            salvarObservacaoContrato(contratoId, patch, localPatch, obs, 'Detalhes do contrato atualizados');
        }

        // "Outros contratos" — lista os FINALIZADOS deste imóvel, mais
        // antigos primeiro por data de fim (pedido: decrescente por data de
        // fim vigência), cada um com seu próprio Mais ações (Dados
        // locatário/Detalhes/Históricos) mas 100% somente leitura — os
        // popups acima continuam abrindo (mostram os dados), só que sem
        // oferecer "Salvar" fazer sentido aqui não foi pedido para bloquear
        // tecnicamente; o pedido foi "nada poderá ser editado", então aqui
        // uso variantes somente-leitura dos mesmos popups.
        export function abrirOutrosContratosImovel(imovelId) {
            const antigos = contratos.filter(c => c.imovelId === imovelId && c.status === 'Finalizado')
                .slice().sort((a, b) => (b.fim || '').localeCompare(a.fim || ''));

            document.getElementById('modal-campo-contrato')?.remove();
            const modal = document.createElement('div');
            modal.id = 'modal-campo-contrato';
            modal.style = 'position:fixed;inset:0;z-index:96;display:flex;align-items:flex-end;justify-content:center;background:rgba(23,33,30,.5);';
            modal.innerHTML = `
                <div style="background:#fff;border-radius:16px 16px 0 0;max-width:480px;width:100%;padding:16px;max-height:85vh;overflow-y:auto;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                        <h3 style="font-size:14px;font-weight:bold;color:#1e293b;">Outros Contratos</h3>
                        <button onclick="fecharModalCampoContrato()" style="background:#e2e8f0;border:none;border-radius:9999px;width:26px;height:26px;flex:none;">✕</button>
                    </div>
                    ${antigos.length === 0 ? `<p style="font-size:12px;color:#94a3b8;">Nenhum contrato finalizado para este imóvel.</p>` : antigos.map(con => `
                        <div style="border:1px solid #e2e8f0;border-radius:10px;padding:10px;margin-bottom:8px;">
                            <p style="font-size:12px;font-weight:bold;">${con.locatario || '-'}</p>
                            <p style="font-size:11px;color:#64748b;">${formatarDataBR(con.inicio)} até ${formatarDataBR(con.fim)} · ${formatarMoedaBR(con.valor)}/mês</p>
                            <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;">
                                <button onclick="abrirDadosLocatarioContrato('${con.id}')" style="font-size:10px;font-weight:bold;padding:5px 10px;border-radius:9999px;background:#f1f5f9;color:#475569;border:1px solid #cbd5e1;">Dados locatário</button>
                                <button onclick="abrirDetalhesContrato('${con.id}')" style="font-size:10px;font-weight:bold;padding:5px 10px;border-radius:9999px;background:#f1f5f9;color:#475569;border:1px solid #cbd5e1;">Detalhes</button>
                                <button onclick="verHistoricoContrato('${con.id}')" style="font-size:10px;font-weight:bold;padding:5px 10px;border-radius:9999px;background:#f1f5f9;color:#475569;border:1px solid #cbd5e1;">Históricos</button>
                            </div>
                        </div>`).join('')}
                </div>`;
            document.body.appendChild(modal);
            modal.onclick = (ev) => { if (ev.target === modal) modal.remove(); };
        }

        // v1.99.0 (NOVO, 02/09/2026) — overlay de busca da aba Contratos.
        export function abrirBuscaContratos() {
            const modal = document.getElementById('modal-busca-contratos');
            modal.classList.remove('hidden');
            modal.onclick = (ev) => { if (ev.target === modal) fecharBuscaContratos(); };
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        export function fecharBuscaContratos() {
            document.getElementById('modal-busca-contratos').classList.add('hidden');
        }

        export async function salvarDivisaoContratoPopup(contratoId) {
            const con = contratos.find(c => c.id === contratoId);
            if (!con) return;
            const validas = __divisaoPopupContrato.filter(s => s.nome && s.nome.trim());
            const total = validas.reduce((s, x) => s + (parseFloat(x.pct) || 0), 0);
            if (validas.length > 0 && Math.abs(total - 100) > 0.5) {
                if (!confirm(`A soma dos percentuais é ${total.toFixed(1)}%, não 100%. Salvar mesmo assim?`)) return;
            }

            // Mesma resolução pessoa_id/nome_externo que sincronizarContratoSupabase
            // já fazia — não inventei uma segunda regra de negócio.
            const linhasDivisao = validas.map(d => {
                const pessoaEncontrada = (pessoas || []).find(p => p.nome === d.nome || p.nome.split(' ')[0] === d.nome);
                return pessoaEncontrada
                    ? { tipo_beneficiario: 'socio_interno', pessoa_id: pessoaEncontrada.id, nome_externo: '', percentual: parseFloat(d.pct) || 0 }
                    : { tipo_beneficiario: 'terceiro_externo', pessoa_id: '', nome_externo: d.nome.trim(), percentual: parseFloat(d.pct) || 0 };
            });

            mostrarCarregamentoGlobal('Salvando divisão...');
            try {
                const { error } = await dbAuth.rpc('substituir_divisao_repasse_contrato', {
                    p_contrato_id: contratoId, p_linhas: linhasDivisao
                });
                if (error) throw error;
                con.divisaoRepasse = validas.map(d => ({ nome: d.nome, percentual: parseFloat(d.pct) || 0 }));
                esconderCarregamentoGlobal();
                fecharModalCampoContrato();
                mostrarToast('Divisão do contrato salva!', 'success');
                registrarLog('imoveis.divisao', { contratoId }); // v1.131
                if (fichaImovelAtualId === con.imovelId) renderFichaImovelUnica(imoveis.find(i => i.id === con.imovelId));
            } catch (err) {
                esconderCarregamentoGlobal();
                alert('❌ Não consegui salvar: ' + (err.message || String(err)));
            }
        }

        // ===================================================================
        // v1.45.0 (Correção de Direção UX) — FICHA DO CONTRATO
        // Mesmo padrão Lista → Ficha → Ação aplicado à lista geral de
        // Contratos. Reaproveita 100% verHistoricoContrato()/
        // gerarMinutaContrato() já existentes — só leitura + atalhos.
        // ===================================================================
        let fichaContratoAtualId = null;

        export async function abrirFichaContrato(id) {

            fichaContratoAtualId = id;
            const con = contratos.find(c => c.id === id);
            if (!con) { alert('Contrato não encontrado.'); return; }

            const imo = imoveis.find(i => i.id === con.imovelId);
            const enderecoImo = imo ? `${imo.empreendimento || ''} - ${imo.enderecoRua || ''}, ${imo.enderecoNum || ''}` : '-';
            const mensalidadesDoContrato = mensalidades.filter(m => m.contratoId === con.id).slice().sort((a, b) => (b.referencia || '').localeCompare(a.referencia || ''));
            const ultimas = mensalidadesDoContrato.slice(0, 4);

            // NOVO (30/08/2026) — Fiadores, pra exibir no detalhe do
            // contrato (pedido explícito). Busca direto (não reaproveita
            // fiadoresContratoAtual — é estado do POPUP de edição, essa
            // ficha é só leitura e pode ser aberta sem o popup nunca ter
            // rodado nesta sessão).
            let fiadoresDaFicha = [];
            try {
                const { data: fiadoresFichaData, error: errFiadoresFicha } = await dbAuth.from('contrato_fiadores')
                    .select('*').eq('contrato_id', con.id).order('ordem');
                if (errFiadoresFicha) throw errFiadoresFicha;
                fiadoresDaFicha = fiadoresFichaData || [];
                window.__fiadoresFichaAtual = fiadoresDaFicha;
            } catch (err) {
                console.error('abrirFichaContrato: falha ao buscar fiadores:', err.message || err);
            }

            const corBadge = con.status === 'Ativo' ? 'bg-green-100 text-green-800'
                : con.status === 'Assinando' ? 'bg-blue-100 text-blue-800'
                : con.status === 'Suspenso' ? 'bg-amber-100 text-amber-800'
                : 'bg-slate-100 text-slate-700';

            const temAlertaFicha = contratoPrecisaRevisao(con) || contratoVencido(con) || contratoAguardandoAssinatura(con);

            // v1.46.0 — prontidão canônica, calculada uma vez e reaproveitada
            // no HTML abaixo (evita chamar avaliarProntidaoContratoParaMinuta
            // várias vezes na mesma renderização).
            const prontidaoFicha = avaliarProntidaoContratoParaMinuta(con, imo);

            // v1.110.0 (fatia 4 da gramática única, REGRAS §6/§9/§10/§11) —
            // ficha do contrato no mesmo padrão da ficha do ativo: cabeçalho
            // de entidade (.rz-entity), 4 chips (Resumo · Cobranças · Partes ·
            // Arquivos) e cards com rodapé único. "Mais ações" abre sheet
            // (abrirSheetAcoes); os painéis inline #fc-mais-acoes e
            // #fc-doc-acoes saíram. Nenhuma função de negócio mudou — só
            // quem as chama (verHistoricoContrato, gerarMinutaContrato,
            // excluirContrato, abrirCofreDocumentos, abrirEdicaoFiadoresPopup…).
            const rs = (sem, txt) => (typeof renderStatus === 'function') ? renderStatus(sem, txt) : `<span class="rz-st rz-${sem}">${txt}</span>`;
            const vencidoFicha = contratoVencido(con), revisarFicha = contratoPrecisaRevisao(con);
            const statusFicha = vencidoFicha ? rs('bad', 'Vencido')
                : (con.status === 'Assinando' || contratoAguardandoAssinatura(con)) ? rs('run', 'Assinando')
                : revisarFicha ? rs('warn', 'Reajustar')
                : con.status === 'Ativo' ? rs('ok', 'Vigente')
                : con.status === 'Suspenso' ? rs('warn', 'Suspenso')
                : rs('neu', con.status === 'Finalizado' ? 'Encerrado' : (con.status || '—'));
            const enderecoCurto = imo ? `${imo.enderecoRua || ''}, ${imo.enderecoNum || ''}` : '—';
            const atrasadas = mensalidadesDoContrato.filter(m => m.status === 'Inadimplente');
            const totalAtrasado = atrasadas.reduce((t, m) => t + (Number(m.valorConfirmado) || 0), 0);
            const ultimasSeis = mensalidadesDoContrato.slice(0, 6);
            const statusMensal = (m) => m.status === 'Pago' ? rs('ok', 'Pago') : m.status === 'Inadimplente' ? rs('bad', 'Em atraso') : rs('run', 'A receber');
            const iconeMensal = (m) => m.status === 'Pago' ? 'arrow-down-left' : m.status === 'Inadimplente' ? 'alarm-clock' : 'clock';
            const classeMensal = (m) => m.status === 'Inadimplente' ? ' rz-bad' : '';
            const abreArquivos = (con.status === 'Ativo' || con.status === 'Assinando');
            const irFinanceiro = `document.getElementById('men-filtro-imovel').value='${con.imovelId}'; document.getElementById('men-filtro-imovel-resumo').textContent='${(imo ? imo.empreendimento : '-').replace(/'/g, "")}'; switchTab('tab-mensal'); renderMensalidades();`;
            const kv = (r, v) => `<div><small>${r}</small><b>${v}</b></div>`;
            document.getElementById('ficha-contrato-conteudo').innerHTML = `
                <div class="rz-entity">
                    <div class="rz-ic"><svg data-lucide="${con.status === 'Assinando' ? 'file-signature' : 'file-text'}"></svg></div>
                    <div class="rz-tx"><b>${escapeHtmlSaidas(con.locatario || 'Locatário não informado')}</b><span>${escapeHtmlSaidas(enderecoCurto)} · ${formatarMoedaBR(con.valor)}/mês</span></div>
                    ${statusFicha}
                </div>
                <div class="rz-chips" id="fc-chips">
                    <button type="button" class="rz-chip rz-on" data-fc-chip="resumo" onclick="fcTrocarChip('resumo')">Resumo</button>
                    <button type="button" class="rz-chip ${atrasadas.length ? 'rz-warn' : ''}" data-fc-chip="cobrancas" onclick="fcTrocarChip('cobrancas')">Cobranças <span class="rz-n">${atrasadas.length}</span></button>
                    <button type="button" class="rz-chip" data-fc-chip="partes" onclick="fcTrocarChip('partes')">Partes <span class="rz-n">${1 + fiadoresDaFicha.length}</span></button>
                    <button type="button" class="rz-chip" data-fc-chip="arquivos" onclick="fcTrocarChip('arquivos')">Anexos <span class="rz-n" id="fc-chip-n-arquivos">0</span></button>
                </div>

                <div class="fc-painel" id="fc-painel-resumo">
                    ${temAlertaFicha ? `
                    <div class="rz-card ${vencidoFicha ? 'rz-critico' : 'rz-atencao'}">
                        <div class="rz-card-h"><h3>Precisa de atenção</h3>${vencidoFicha ? rs('bad', 'Vencido') : rs('warn', con.status === 'Assinando' ? 'Assinatura' : 'Reajuste')}</div>
                        <p class="rz-desc">${vencidoFicha ? 'A vigência terminou e o contrato continua ativo.' : (con.status === 'Assinando' ? 'Gerado pela Vitrine — aguardando revisão e assinatura.' : 'Reajuste ou revisão pendente pela regra do contrato.')}${con.status === 'Assinando' && !prontidaoFicha.pronto ? ` Minuta ainda indisponível — faltam ${prontidaoFicha.faltantes.length + prontidaoFicha.invalidos.length} dado(s).` : ''}</p>
                        <div class="rz-card-f"><button type="button" onclick="verAlertasContrato('${con.id}')" class="rz-btn rz-btn-1 rz-sm"><svg data-lucide="bell"></svg> Ver alertas</button></div>
                    </div>` : ''}
                    <div class="rz-card">
                        <div class="rz-card-h"><h3>Condições</h3><button type="button" onclick="abrirAcoesFichaContrato('${con.id}')" class="rz-more" aria-label="Mais ações"><svg data-lucide="ellipsis-vertical"></svg></button></div>
                        <div class="rz-kv">
                            ${kv('Início', formatarDataBR(con.inicio))}
                            ${kv('Fim', formatarDataBR(con.fim))}
                            ${kv('Vencimento', `Dia ${con.vencimentoDia || 15}`)}
                            ${kv('Reajuste', escapeHtmlSaidas(con.reajuste || '—'))}
                            ${kv('Aluguel', `${formatarMoedaBR(con.valor)}/mês`)}
                            ${kv('Imóvel', escapeHtmlSaidas(imo ? `${imo.empreendimento || ''} · ${enderecoCurto}` : '—'))}
                        </div>
                    </div>
                </div>

                <div class="fc-painel hidden" id="fc-painel-cobrancas">
                    <div class="rz-card ${atrasadas.length ? 'rz-critico' : ''}">
                        <div class="rz-card-h"><h3>Cobranças</h3>${atrasadas.length ? rs('bad', `${formatarMoedaBR(totalAtrasado)} em atraso`) : (ultimasSeis.length ? rs('ok', 'Em dia') : '')}<button type="button" onclick="abrirAcoesCobrancasContrato('${con.id}')" class="rz-more" aria-label="Mais ações"><svg data-lucide="ellipsis-vertical"></svg></button></div>
                        <!-- v1.116.0 (pedido explícito: "colocar no ⋮ a
                             opção de tratar aquele recebimento") — cada
                             linha ganhou ⋮ chamando rzAcoesMensalidade(),
                             a mesma sheet (Dar baixa/Recibo/Estornar/
                             Excluir) já usada em Financeiro › Recebimentos
                             (fatia 5); nenhuma lógica nova. -->
                        ${ultimasSeis.length ? ultimasSeis.map(m => `
                        <div class="rz-row">
                            <div class="rz-ic${classeMensal(m)}"><svg data-lucide="${iconeMensal(m)}"></svg></div>
                            <div class="rz-tx"><b>${escapeHtmlSaidas(m.referencia || '—')}</b><span>${m.status === 'Pago' && m.dataPgto ? 'Pago em ' + formatarDataBR(m.dataPgto) : (m.status === 'Inadimplente' ? 'Vencido' : 'A vencer')}</span></div>
                            <div class="rz-rt"><b>${formatarMoedaBR(m.valorConfirmado)}</b>${statusMensal(m)}</div>
                            <button type="button" onclick="rzAcoesMensalidade('${m.id}')" class="rz-more" aria-label="Mais ações"><svg data-lucide="ellipsis-vertical"></svg></button>
                        </div>`).join('') : `<div class="rz-empty"><div class="rz-ic"><svg data-lucide="wallet"></svg></div><p>Nenhum recebimento lançado ainda. Eles nascem na aba Financeiro a cada competência.</p></div>`}

                    </div>
                </div>

                <div class="fc-painel hidden" id="fc-painel-partes">
                    <div class="rz-card">
                        <div class="rz-card-h"><h3>Partes</h3><span class="rz-sub">Locatário e garantias</span><button type="button" onclick="abrirAcoesPartesContrato('${con.id}')" class="rz-more" aria-label="Mais ações"><svg data-lucide="ellipsis-vertical"></svg></button></div>
                        <!-- v1.116.0 (pedido explícito: "a edição deve estar
                             à frente de cada parte") — linha deixou de ser
                             clicável inteira (o ícone ali era um
                             ellipsis-vertical fingindo de seta, fora de
                             REGRAS §9); cada linha (locatário e cada
                             fiador) ganhou seu próprio ⋮. -->
                        <div class="rz-row">
                            <div class="rz-ic"><svg data-lucide="user"></svg></div>
                            <div class="rz-tx"><b>${escapeHtmlSaidas(con.locatario || 'Locatário não informado')}</b><span>Locatário${con.cpf ? ' · ' + escapeHtmlSaidas((con.docTipo || 'CPF') + ' ' + con.cpf) : ''}</span></div>
                            <button type="button" onclick="abrirAcoesLocatarioContrato('${con.id}')" class="rz-more" aria-label="Mais ações"><svg data-lucide="ellipsis-vertical"></svg></button>
                        </div>
                        ${fiadoresDaFicha.length ? fiadoresDaFicha.map(f => `
                        <div class="rz-row">
                            <div class="rz-ic"><svg data-lucide="shield-check"></svg></div>
                            <div class="rz-tx"><b>${(f.nome || '').replace(/</g, '&lt;')}</b><span>Fiador · ${f.doc_tipo || 'CPF'} ${f.cpf || ''}${f.estado_civil ? ' · ' + f.estado_civil : ''}${f.possui_imovel_proprio ? ' · imóvel em garantia' : ''}</span></div>
                            <button type="button" onclick="abrirAcoesFiadorContrato('${con.id}')" class="rz-more" aria-label="Mais ações"><svg data-lucide="ellipsis-vertical"></svg></button>
                        </div>`).join('') : `<div class="rz-empty" style="padding-top:8px"><p>Nenhum fiador. Adicione se a minuta exigir.</p></div>`}

                    </div>
                </div>

                <div class="fc-painel hidden" id="fc-painel-arquivos">
                    <div class="rz-chips" id="fc-anexos-chips"></div>
                    <div class="rz-card">
                        <div class="rz-card-h"><h3 id="fc-anexos-titulo">Anexos</h3><span class="rz-sub" id="fc-anexos-sub"></span>${abreArquivos ? `<button type="button" onclick="abrirAcoesAnexosContrato('${con.id}')" class="rz-more" aria-label="Mais ações"><svg data-lucide="ellipsis-vertical"></svg></button>` : ''}</div>
                        ${abreArquivos
                            ? `<div id="fc-documentos"><p class="rz-desc">Carregando...</p></div>`
                            : `<div class="rz-empty"><div class="rz-ic"><svg data-lucide="archive"></svg></div><p>Contrato encerrado: os documentos ficam guardados no Cofre.</p></div>`}
                    </div>
                </div>`;
            const btnVoltar = document.getElementById('fc-voltar');
            if (btnVoltar) btnVoltar.innerHTML = `<svg data-lucide="chevron-left"></svg> ${window.fichaContratoOrigem?.tipo === 'ativo' ? 'Ativo' : 'Contratos'}`;
            switchTab('tab-contrato-ficha');
            if (typeof lucide !== 'undefined') lucide.createIcons();
            if (abreArquivos) montarDocumentosContrato(con.id);
        }

        // v1.111.0 — "Carregar documento" do contrato no MESMO modal do ativo
        // (cofre-documentos.abrirUploadContextual via ponte
        // window.rzAbrirUploadContextual, cofre-app.js v1.22.0). Antes ia pro
        // cofre.html (tela do módulo Cofre, que o Nicola pediu pra sumir).
        // Depois de salvar, o Cofre dispara 'cofre:recarregar-documentos' —
        // a lista do contrato é recarregada abaixo.
        export function rzCarregarDocumentoContrato(contratoId) {
            const con = contratos.find(c => c.id === contratoId);
            if (typeof window.rzAbrirUploadContextual === 'function') {
                window.rzAbrirUploadContextual('contrato', contratoId, con?.locatario || 'Contrato');
            } else {
                abrirCofreDocumentos('contrato', contratoId);
            }
        }

        window.addEventListener('cofre:recarregar-documentos', () => { if (fichaContratoAtualId) montarDocumentosContrato(fichaContratoAtualId); });

        // v1.113.0 — ⋮ dos cards da ficha do contrato (rodapés saíram; toda
        // ação vive no ⋮ ou no toque). Sheets de dados, não HTML.
        export function abrirAcoesCobrancasContrato(contratoId) {
            const con = contratos.find(c => c.id === contratoId); if (!con || typeof abrirSheetAcoes !== 'function') return;
            const imo = imoveis.find(i => i.id === con.imovelId);
            abrirSheetAcoes({ titulo: 'Cobranças', sub: con.locatario || '', acoes: [
                { icone: 'wallet', titulo: 'Ver no Financeiro', codigo: 'mensal.ver', sub: 'Todas as competências deste imóvel', aoTocar: () => { document.getElementById('men-filtro-imovel').value = con.imovelId; document.getElementById('men-filtro-imovel-resumo').textContent = (imo ? imo.empreendimento : '-'); switchTab('tab-mensal'); renderMensalidades(); } },
            ] });
        }

        export function abrirAcoesPartesContrato(contratoId) {
            const con = contratos.find(c => c.id === contratoId); if (!con || typeof abrirSheetAcoes !== 'function') return;
            const temFiador = (window.__fiadoresFichaAtual || []).length > 0;
            abrirSheetAcoes({ titulo: 'Partes', sub: con.locatario || '', acoes: [
                { icone: 'pencil', titulo: 'Editar locatário', codigo: 'contratos.editar', sub: 'Dados no formulário do contrato', aoTocar: () => abrirEdicaoContratoContextual(con.id, 'fichaContrato', con.id) },
                { icone: 'user-plus', titulo: temFiador ? 'Editar fiadores' : 'Adicionar fiador', codigo: 'contratos.editar', sub: 'Garantias exigidas pela minuta', aoTocar: () => abrirEdicaoFiadoresPopup(con.id) },
            ] });
        }

        export function abrirAcoesLocatarioContrato(contratoId) {
            const con = contratos.find(c => c.id === contratoId); if (!con || typeof abrirSheetAcoes !== 'function') return;
            abrirSheetAcoes({ titulo: con.locatario || 'Locatário', sub: 'Locatário', acoes: [
                { icone: 'pencil', titulo: 'Editar locatário', codigo: 'contratos.editar', sub: 'Nome, CPF/CNPJ, contato, endereço', aoTocar: () => abrirEdicaoContratoContextual(con.id, 'fichaContrato', con.id) },
            ] });
        }

        // v1.116.0 (pedido explícito, "edição à frente de cada parte") —
        // ⋮ de cada linha de fiador. Não existe editor de 1 fiador só
        // (a UI já existente, abrirEdicaoFiadoresPopup, edita a lista
        // inteira de uma vez — reaproveitado aqui pra "Editar"). Remover
        // é direto: chama o mesmo RPC (substituir_fiadores_contrato) que
        // "Salvar" do popup usa, só que já filtrado, sem abrir tela.
        export async function abrirAcoesFiadorContrato(contratoId) {
            const con = contratos.find(c => c.id === contratoId); if (!con || typeof abrirSheetAcoes !== 'function') return;
            await carregarFiadoresContrato(contratoId);
            abrirSheetAcoes({ titulo: 'Fiador', sub: con.locatario || '', acoes: [
                { icone: 'pencil', titulo: 'Editar fiadores', codigo: 'contratos.editar', sub: 'Abre a lista completa de garantias', aoTocar: () => abrirEdicaoFiadoresPopup(con.id) },
                { icone: 'trash-2', titulo: 'Remover fiador', codigo: 'contratos.editar', tipo: 'bad', aoTocar: () => abrirSeletorRemoverFiador(con.id) },
            ] });
        }

        export async function abrirSeletorRemoverFiador(contratoId) {
            if (!fiadoresContratoAtual.length) { mostrarToast('Nenhum fiador pra remover.', 'danger'); return; }
            if (fiadoresContratoAtual.length === 1) { removerFiadorDireto(contratoId, 0); return; }
            abrirSheetAcoes({ titulo: 'Remover qual fiador?', acoes: fiadoresContratoAtual.map((f, i) => ({ icone: 'shield-check', titulo: f.nome || `Fiador ${i + 1}`, tipo: 'bad', aoTocar: () => removerFiadorDireto(contratoId, i) })) });
        }

        export async function removerFiadorDireto(contratoId, index) {
            const linhas = fiadoresContratoAtual.filter((_, i) => i !== index).filter(f => f.nome && f.cpf).map((f, i) => Object.assign({}, f, { ordem: i + 1 }));
            mostrarCarregamentoGlobal('Removendo...');
            try {
                const { error } = await dbAuth.rpc('substituir_fiadores_contrato', { p_contrato_id: contratoId, p_cliente_id: CLIENTE_ID_SUPABASE, p_linhas: linhas });
                if (error) throw error;
                esconderCarregamentoGlobal();
                mostrarToast('Fiador removido.', 'success');
                if (fichaContratoAtualId === contratoId) abrirFichaContrato(contratoId);
            } catch (err) {
                esconderCarregamentoGlobal();
                mostrarToast('Não consegui remover: ' + (err.message || String(err)), 'danger');
            }
        }

        // v1.116.0 (pedido explícito: "o chip de anexos de contrato ainda
        // está diferente do de ativos, não traz as 3 opções") — ganhou
        // "Upload simples" (mesmo par IA/simples de Ativos, via
        // window.rzAbrirUploadContextualComFlag, cofre-documentos v1.8.0)
        // e "Gerar minuta", quando o contrato está pronto pra isso —
        // mesma regra (avaliarProntidaoContratoParaMinuta) já usada no ⋮
        // da ficha inteira, não duplicada.
        export function abrirAcoesAnexosContrato(contratoId) {
            const con = contratos.find(c => c.id === contratoId); if (!con || typeof abrirSheetAcoes !== 'function') return;
            const imo = imoveis.find(i => i.id === con.imovelId);
            const pront = avaliarProntidaoContratoParaMinuta(con, imo);
            const acoes = [
                { icone: 'sparkles', titulo: 'Adicionar documento com IA', codigo: 'cofre.analisar_ia', sub: 'Minuta, aditivo, recibo — com leitura por IA', tipo: 'ia', aoTocar: () => window.rzAbrirUploadContextualComFlag ? window.rzAbrirUploadContextualComFlag('contrato', con.id, con.locatario || 'Contrato', true) : rzCarregarDocumentoContrato(con.id) },
                { icone: 'upload', titulo: 'Upload simples', codigo: 'cofre.upload', sub: 'Só guarda o arquivo', aoTocar: () => window.rzAbrirUploadContextualComFlag?.('contrato', con.id, con.locatario || 'Contrato', false) },
            ];
            if (con.status === 'Assinando' && pront.pronto) acoes.push({ icone: 'file-signature', titulo: 'Gerar minuta', codigo: 'minutas.gerar', sub: 'PDF a partir dos dados do contrato', aoTocar: () => gerarMinutaContrato(con.id) });
            abrirSheetAcoes({ titulo: 'Anexos', sub: con.locatario || '', acoes });
        }

        // v1.113.0 — chips de categoria dos anexos do contrato (mesmo padrão do ativo)
        let fcFiltroAnexo = 'todos';

        export function fcMontarChipsAnexos() {
            const wrap = document.getElementById('fc-anexos-chips'); if (!wrap) return;
            const cats = new Map();
            __docsContratoAtual.forEach(v => { const k = v.cofre_documentos?.categoria_id || 'sem'; cats.set(k, (cats.get(k) || 0) + 1); });
            const nome = id => id === 'sem' ? 'Sem categoria' : ((window.__cofreCategorias || []).find(c => c.id === id)?.nome || 'Documento');
            const chips = [{ chave: 'todos', rotulo: 'Todos', n: __docsContratoAtual.length }, ...[...cats.entries()].map(([id, n]) => ({ chave: id, rotulo: nome(id), n }))];
            if (!chips.some(c => c.chave === fcFiltroAnexo)) fcFiltroAnexo = 'todos';
            wrap.innerHTML = chips.map(c => `<button type="button" onclick="fcFiltrarAnexos('${c.chave}')" class="rz-chip ${fcFiltroAnexo === c.chave ? 'rz-on' : ''}">${escapeHtmlSaidas(c.rotulo)} <span class="rz-n">${c.n}</span></button>`).join('');
        }

        export function fcFiltrarAnexos(chave) {
            fcFiltroAnexo = chave;
            document.querySelectorAll('#fc-anexos-chips .rz-chip').forEach(b => b.classList.toggle('rz-on', b.textContent.trim().startsWith(chave === 'todos' ? 'Todos' : '')));
            fcMontarChipsAnexos();
            document.querySelectorAll('#fc-documentos .rz-row').forEach((r, i) => { const v = __docsContratoAtual[i]; r.classList.toggle('hidden', !(chave === 'todos' || (v?.cofre_documentos?.categoria_id || 'sem') === chave)); });
        }

        // v1.110.0 — chips da ficha do contrato (4 painéis no mesmo innerHTML)
        export function fcTrocarChip(nome) {
            document.querySelectorAll('#fc-chips .rz-chip').forEach(b => b.classList.toggle('rz-on', b.dataset.fcChip === nome));
            document.querySelectorAll('.fc-painel').forEach(p => p.classList.toggle('hidden', p.id !== 'fc-painel-' + nome));
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        // v1.110.0 — "Mais ações" da ficha do contrato em SHEET (REGRAS §6).
        // Histórico · Documentos no Cofre · Gerar minuta (se pronta) ·
        // Excluir (vermelha, por último). Ver alertas mora no card de atenção.
        export function abrirAcoesFichaContrato(contratoId) {
            const con = contratos.find(c => c.id === contratoId);
            if (!con) return;
            if (typeof abrirSheetAcoes !== 'function') { alternarMaisAcoesFichaContrato(); return; }
            const imo = imoveis.find(i => i.id === con.imovelId);
            const pront = avaliarProntidaoContratoParaMinuta(con, imo);
            const acoes = [
                { icone: 'trending-up', titulo: 'Reajustar contrato', codigo: 'contratos.reajustar', sub: 'Novo valor, vigência e documento', aoTocar: () => lancarReajusteContrato(con.id) },
                    { icone: 'history', titulo: 'Histórico', codigo: 'contratos.historico.ver', sub: 'Assinatura, reajustes e alterações', aoTocar: () => verHistoricoContrato(con.id) },
            ];
            if (con.status === 'Assinando' && pront.pronto) acoes.push({ icone: 'file-signature', titulo: 'Gerar minuta', codigo: 'minutas.gerar', sub: 'PDF a partir dos dados do contrato', aoTocar: () => gerarMinutaContrato(con.id) });
            if (typeof window.rzAbrirAtivoDoImovel === 'function') acoes.push({ icone: 'house', titulo: 'Abrir o imóvel', codigo: 'cofre.ver', sub: imo ? `${imo.enderecoRua || ''}, ${imo.enderecoNum || ''}` : '', aoTocar: () => window.rzAbrirAtivoDoImovel(con.imovelId) });
            // v1.116.0 — ações de status por estado do contrato (pedido
            // explícito). "As regras" continuam 100% em
            // abrirAlterarStatusContrato/salvarAlterarStatusContrato (data
            // de vigência, observação, o que fazer com mensalidades em
            // aberto) — cada item aqui só pré-seleciona a ação nesse mesmo
            // formulário (abrirAcaoStatusContrato), não duplica a lógica.
            if (con.status === 'Assinando') {
                acoes.push({ icone: 'check-circle-2', titulo: 'Ativar contrato', codigo: 'contratos.editar', sub: 'Assinatura concluída — vira Ativo', aoTocar: () => abrirAcaoStatusContrato(con.id, 'Ativo') });
            }
            if (con.status === 'Ativo') {
                acoes.push({ icone: 'pause-circle', titulo: 'Suspender contrato', codigo: 'contratos.editar', aoTocar: () => abrirAcaoStatusContrato(con.id, 'Suspenso') });
                acoes.push({ icone: 'square-check-big', titulo: 'Encerrar contrato', codigo: 'contratos.editar', aoTocar: () => abrirAcaoStatusContrato(con.id, 'Finalizado') });
            }
            if (con.status === 'Suspenso') {
                acoes.push({ icone: 'play-circle', titulo: 'Reativar contrato', codigo: 'contratos.editar', aoTocar: () => abrirAcaoStatusContrato(con.id, 'Ativo') });
                acoes.push({ icone: 'square-check-big', titulo: 'Encerrar contrato', codigo: 'contratos.editar', aoTocar: () => abrirAcaoStatusContrato(con.id, 'Finalizado') });
            }
            acoes.push({ icone: 'trash-2', titulo: 'Excluir contrato', codigo: 'contratos.excluir', tipo: 'bad', aoTocar: () => excluirContrato(con.id) });
            abrirSheetAcoes({ titulo: con.locatario || 'Contrato', sub: imo ? `${imo.enderecoRua || ''}, ${imo.enderecoNum || ''}` : '', acoes });
        }

        // v1.116.0 — abre o formulário já existente (abrirAlterarStatusContrato)
        // com a ação desejada pré-selecionada no <select>. Reaproveita 100%
        // das regras dele (opções válidas por transição, pendentes de
        // mensalidade, sincronização do status do imóvel).
        export function abrirAcaoStatusContrato(contratoId, valorAcao) {
            abrirAlterarStatusContrato(contratoId);
            const sel = document.getElementById('asc-acao');
            if (sel && [...sel.options].some(o => o.value === valorAcao)) sel.value = valorAcao;
        }

        export function alternarMaisAcoesFichaContrato() {
            const el = document.getElementById('fc-mais-acoes');
            const seta = document.getElementById('fc-mais-acoes-seta');
            if (!el) return;
            el.classList.toggle('hidden');
            if (seta) seta.style.transform = el.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        // ===================================================================
        // Box "Documento" da Ficha do Contrato — NOVO (26/08/2026, pedido
        // explícito): "para um contrato ativo ou assinando, deve ter a
        // opção de documentos similar à do módulo de ativos anexo". Mesma
        // referência de box de documento já usada no Cofre (item de
        // controle): linha clicável abre via signed URL, "x" remove só o
        // vínculo (documento continua guardado, vira "Em triagem" no
        // Cofre), "Carregar novo" no Mais ações — upload direto pro Cofre,
        // mesmo padrão de storage já usado em gerarMinutaNoCofre().
        // ===================================================================
        let __docsContratoAtual = [];

        export function alternarMaisAcoesDocContrato() {
            const el = document.getElementById('fc-doc-acoes');
            const seta = document.getElementById('fc-doc-seta');
            if (!el) return;
            el.classList.toggle('hidden');
            if (seta) seta.style.transform = el.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        export async function montarDocumentosContrato(contratoId) {
            const el = document.getElementById('fc-documentos');
            if (!el) return;
            try {
                const { data, error } = await dbAuth
                    .from('cofre_documento_vinculos')
                    // NOVO (30/08/2026) — criado_em (do vínculo, é quando o
                    // documento passou a valer PRA ESSE contrato — pedido
                    // explícito: faltava data/hora no box).
                    .select('id, criado_em, cofre_documentos!inner(id, nome_exibicao, mime_type, status)')
                    .eq('entidade_tipo', 'contrato').eq('entidade_id', contratoId)
                    .order('criado_em', { ascending: false });
                if (error) throw error;
                __docsContratoAtual = (data || []).filter(v => v.cofre_documentos && v.cofre_documentos.status === 'ativo');
                // v1.110.0 (fatia 4) — .rz-row + vazio único; contador do chip Arquivos
                const nArq = document.getElementById('fc-chip-n-arquivos');
                if (nArq) nArq.textContent = String(__docsContratoAtual.length);
                fcMontarChipsAnexos();
                el.innerHTML = __docsContratoAtual.length ? __docsContratoAtual.map((v, i) => `
                    <div class="rz-row">
                        <div class="rz-ic"><svg data-lucide="${(v.cofre_documentos.mime_type || '').startsWith('image/') ? 'image' : 'file-text'}"></svg></div>
                        <div class="rz-tx rz-link" onclick="abrirDocumentoContratoAtual(${i})"><b>${v.cofre_documentos.nome_exibicao || 'Documento'}</b><span>${v.criado_em ? new Date(v.criado_em).toLocaleDateString('pt-BR') : ''} · toque pra abrir</span></div>
                        <button type="button" onclick="removerDocumentoContratoAtual(${i})" title="Remover deste contrato" class="rz-ico-btn" style="width:36px;height:36px"><svg data-lucide="x" style="width:16px;height:16px;color:var(--muted)"></svg></button>
                    </div>`).join('') : `<div class="rz-empty"><div class="rz-ic"><svg data-lucide="file-plus-2"></svg></div><p>Nenhum documento neste contrato. A minuta assinada guardada aqui fica a um toque.</p></div>`;
                if (typeof lucide !== 'undefined') lucide.createIcons();
            } catch (err) {
                el.innerHTML = `<p class="text-xs text-red-500">Não consegui carregar os documentos.</p>`;
                console.warn('Falha ao carregar documentos do contrato (não bloqueando):', err.message);
            }
        }

        export async function abrirDocumentoContratoAtual(indice) {
            const v = __docsContratoAtual[indice];
            if (!v) return;
            try {
                const { data: doc, error } = await dbAuth.from('cofre_documentos').select('bucket, storage_path').eq('id', v.cofre_documentos.id).single();
                if (error) throw error;
                const { data: signed, error: errSigned } = await dbAuth.storage.from(doc.bucket).createSignedUrl(doc.storage_path, 120);
                if (errSigned) throw errSigned;
                window.open(signed.signedUrl, '_blank', 'noopener');
            } catch (err) {
                alert('❌ Não consegui abrir o documento: ' + (err.message || String(err)));
            }
        }

        // CORRIGIDO (30/08/2026, pedido explícito do Nicola: "não está
        // sendo possível excluir"): antes só desvinculava (o documento
        // continuava existindo no Cofre, "Em triagem") — nome do botão e
        // da confirmação diziam "Remover"/desvincular, mas o pedido era
        // "excluir" de verdade. Agora apaga o arquivo do Storage + a linha
        // de cofre_documentos + o vínculo — os 3, não só o vínculo. Não
        // reaproveitável depois (diferente do "Em triagem" de antes) —
        // por isso a confirmação agora avisa que é definitivo.
        export async function removerDocumentoContratoAtual(indice) {
            const v = __docsContratoAtual[indice];
            if (!v) return;
            if (!confirm('Excluir este documento definitivamente?\n\nNão fica guardado no Cofre depois — essa ação não pode ser desfeita.')) return;
            try {
                const { data: doc, error: errBusca } = await dbAuth.from('cofre_documentos').select('bucket, storage_path').eq('id', v.cofre_documentos.id).single();
                if (errBusca) throw errBusca;

                const { error: errVinculo } = await dbAuth.from('cofre_documento_vinculos').delete().eq('id', v.id);
                if (errVinculo) throw errVinculo;

                const { error: errDoc } = await dbAuth.from('cofre_documentos').delete().eq('id', v.cofre_documentos.id);
                if (errDoc) throw errDoc;

                if (doc?.bucket && doc?.storage_path) {
                    const { error: errStorage } = await dbAuth.storage.from(doc.bucket).remove([doc.storage_path]);
                    if (errStorage) console.warn('Linha excluída, mas o arquivo no Storage não pôde ser removido (órfão, não crítico):', errStorage.message);
                }

                mostrarToast('Documento excluído.', 'success');
                montarDocumentosContrato(fichaContratoAtualId);
            } catch (err) {
                alert('❌ Erro ao excluir: ' + (err.message || String(err)));
            }
        }

        // ÓRFÃ (27/08/2026, pedido explícito) — nenhum botão do HTML aponta
        // mais pra cá. Substituída por abrirCofreDocumentos('contrato', id),
        // que leva pro MESMO fluxo rico (Com IA/Upload simples) já usado
        // pelo Item de Controle no Cofre — "usar as mesmas funções", em vez
        // de manter este upload bespoke, mais simples e sem IA, só pra
        // Contrato. Mantida no código (não apagada), inofensiva.
        export async function carregarNovoDocumentoContrato(contratoId) {
            const input = document.getElementById('fc-doc-input');
            const arquivo = input.files[0];
            input.value = '';
            if (!arquivo) return;
            mostrarCarregamentoGlobal('Enviando documento...');
            try {
                const nomeSanitizado = arquivo.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9._-]/g, '_');
                const agora = new Date();
                const storagePath = `${CLIENTE_ID_SUPABASE}/${agora.getFullYear()}/${String(agora.getMonth() + 1).padStart(2, '0')}/contrato_${contratoId}_${Date.now()}/${nomeSanitizado}`;

                const { error: errUpload } = await dbAuth.storage.from('cofre-documentos').upload(storagePath, arquivo, { contentType: arquivo.type || 'application/octet-stream' });
                if (errUpload) throw errUpload;

                const { data: docInserido, error: errDoc } = await dbAuth.from('cofre_documentos').insert({
                    cliente_id: CLIENTE_ID_SUPABASE, nome_original: arquivo.name, nome_exibicao: arquivo.name,
                    bucket: 'cofre-documentos', storage_path: storagePath, mime_type: arquivo.type || null,
                    extensao: (arquivo.name.split('.').pop() || '').toLowerCase(), origem: 'app', status: 'ativo',
                }).select('id').single();
                if (errDoc) throw errDoc;

                await dbAuth.from('cofre_documento_vinculos').insert({
                    cliente_id: CLIENTE_ID_SUPABASE, documento_id: docInserido.id, entidade_tipo: 'contrato',
                    entidade_id: contratoId, principal: false, criado_por: pessoaIdLogada || null,
                });

                esconderCarregamentoGlobal();
                mostrarToast('Documento carregado ✅', 'success');
                montarDocumentosContrato(contratoId);
            } catch (err) {
                esconderCarregamentoGlobal();
                alert('❌ Não consegui carregar o documento: ' + (err.message || String(err)));
            }
        }

        export function voltarDaFichaContrato() {
            fichaContratoAtualId = null;
            // v1.111.0 — Nicola 03/09: "ao chegar num contrato a partir de um
            // ativo, ao voltar aparece a lista de contratos". cofre-ativos.js
            // deixa window.fichaContratoOrigem = {tipo:'ativo', id}; aqui o
            // Voltar respeita a origem real (REGRAS §3: "‹ Pai real").
            const origem = window.fichaContratoOrigem; window.fichaContratoOrigem = null;
            if (origem && origem.tipo === 'ativo' && origem.id && typeof window.abrirFichaAtivoNoChip === 'function') {
                switchTab('tab-ativos');
                window.abrirFichaAtivoNoChip(origem.id, 'contratos');
                return;
            }
            switchTab('tab-contratos');
        }

        export async function abrirFormularioContrato() {

            // FASE 1A (v1.39.0) — mesmo mecanismo de abrirFormularioImovel().
            const permitido = await verificarLimiteAntesDeAbrir('contratos.criar', 'form_contrato');
            if (!permitido) return;

            cancelarEdicaoContrato();

            document.getElementById('form-contrato-wrapper').classList.remove('hidden');

            sincronizarBotaoToggleContrato();

            window.scrollTo({top: 0, behavior: 'smooth'});

        }

        // v1.41.0 (Fase 2) — mesmo padrão liga/desliga do botão "+" de
        // Imóveis: toca de novo fecha o formulário (equivalente ao antigo X
        // vermelho); se estiver fechado, abre um cadastro novo.
        export function alternarFormularioContrato() {

            const wrapper = document.getElementById('form-contrato-wrapper');

            if (wrapper && !wrapper.classList.contains('hidden')) {
                cancelarEdicaoContrato();
            } else {
                abrirFormularioContrato();
            }

        }

        export function sincronizarBotaoToggleContrato() {

            const wrapper = document.getElementById('form-contrato-wrapper');
            const btn = document.getElementById('btn-toggle-contrato');
            if (!wrapper || !btn) return;
            const aberto = !wrapper.classList.contains('hidden');
            btn.classList.toggle('ativo', aberto);
            atualizarIconeToggle(btn, aberto);

        }

        // v1.46.0 — seletor genérico pra "ação que precisa de UM contrato,
        // mas o imóvel pode ter mais de um elegível" (Especificação
        // Múltiplos Contratos, Parte A §7: 0→informar, 1→executar,
        // >1→seletor explícito — nunca escolher o primeiro em silêncio).
        // Reaproveitável por qualquer ação futura do mesmo tipo, não só IPTU.
        export function abrirSeletorContratoParaAcao(titulo, listaContratos, callback) {
            let overlay = document.getElementById('overlay-seletor-contrato-acao');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'overlay-seletor-contrato-acao';
                overlay.style.cssText = 'position:fixed; inset:0; z-index:460; background:rgba(15,23,42,0.6); display:flex; align-items:flex-end; justify-content:center;';
                document.body.appendChild(overlay);
            }
            overlay.innerHTML = `
                <div style="background:#fff; border-radius:20px 20px 0 0; padding:20px; max-width:420px; width:100%; max-height:70vh; overflow-y:auto;">
                    <p style="font-weight:800; font-size:15px; color:var(--ink); margin-bottom:4px;">${titulo}</p>
                    <p style="font-size:12px; color:var(--sage); margin-bottom:12px;">Este imóvel tem mais de um contrato elegível — escolha qual.</p>
                    ${listaContratos.map((con, i) => `
                        <button data-idx-seletor-contrato="${i}" style="width:100%; text-align:left; padding:12px; border:1px solid #e6e3da; border-radius:12px; margin-bottom:8px; background:#fff;">
                            <b style="font-size:13px;">${(con.locatario || '-').replace(/</g, '')}</b>
                            <div style="font-size:11px; color:var(--sage);">${con.status}${con.whatsapp ? ' · ' + con.whatsapp : ''}</div>
                        </button>`).join('')}
                    <button id="btn-cancelar-seletor-contrato-acao" style="width:100%; text-align:center; padding:10px; color:var(--sage); font-weight:700; font-size:13px; background:none; border:none;">Cancelar</button>
                </div>`;
            overlay.querySelectorAll('[data-idx-seletor-contrato]').forEach(btn => {
                btn.onclick = () => { overlay.remove(); callback(listaContratos[parseInt(btn.dataset.idxSeletorContrato, 10)]); };
            });
            document.getElementById('btn-cancelar-seletor-contrato-acao').onclick = () => overlay.remove();
        }

        let documentosCarregadosContrato = [];

        // Documentos vão para um bucket PRIVADO (diferente das fotos) — geramos
        // um link assinado de validade longa (~10 anos) na hora do upload, para
        // não precisar reconstruir o link toda vez que alguém for abrir.
        export async function enviarDocumentoContratoStorage(file, tipo) {
            const nomeArquivo = `${CLIENTE_ID_SUPABASE}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${file.name}`;
            const { error } = await dbAuth.storage.from('contratos-documentos').upload(nomeArquivo, file);
            if (error) throw error;
            const { data, error: errSigned } = await dbAuth.storage.from('contratos-documentos').createSignedUrl(nomeArquivo, 315360000);
            if (errSigned) throw errSigned;
            return data.signedUrl;
        }

        export async function processarMultiplosDocumentos(inputElement, tipo) {

            const files = inputElement.files;

            if (!files || files.length === 0) return;

            const existentesDoTipo = documentosCarregadosContrato.filter(d => (d.tipo || 'Outros') === tipo).length;

            const vagas = 5 - existentesDoTipo;

            if (vagas <= 0) {

                alert(`⚠️ Você já tem 5 documentos do tipo "${tipo}" (o máximo). Remova algum antes de adicionar novos.`);

                inputElement.value = '';

                return;

            }

            const count = Math.min(files.length, vagas);

            if (files.length > vagas) {

                alert(`⚠️ Só há espaço para mais ${vagas} documento(s) do tipo "${tipo}" (máximo de 5). Os ${count} primeiro(s) selecionado(s) serão usados.`);

            }

            const previewContainer = document.getElementById(`con-doc-preview-${tipo}`);

            previewContainer.innerHTML += `<p class="text-gray-400" id="msg-processando-docs-${tipo}">🔄 Enviando...</p>`;

            let falhas = 0;

            for (let i = 0; i < count; i++) {

                const file = files[i];

                try {
                    const url = await enviarDocumentoContratoStorage(file, tipo);
                    documentosCarregadosContrato.push({ id: 'doc_' + Date.now() + Math.random().toString(36).substr(2, 4), nome: file.name, url: url, tipo: tipo });
                } catch (err) {
                    falhas++;
                    devLog("ERRO_DOCUMENTOS", `Falha ao enviar o arquivo ${file.name}: ${err.message}`);
                }

            }

            const msg = document.getElementById(`msg-processando-docs-${tipo}`);
            if (msg) msg.remove();

            renderPreviewDocumentosContrato();

            if (falhas > 0) alert(`⚠️ ${falhas} documento(s) não puderam ser enviados.`);

        }

        export function renderPreviewDocumentosContrato() {

            ['Contrato', 'Aditivo', 'Outros'].forEach(tipo => {

                const previewContainer = document.getElementById(`con-doc-preview-${tipo}`);

                if (!previewContainer) return;

                const docsDoTipo = documentosCarregadosContrato.filter(d => (d.tipo || 'Outros') === tipo);

                previewContainer.innerHTML = docsDoTipo.map(d => {

                    const nome = d.nome || 'Documento';

                    // Documentos ainda não salvos (base64) abrem numa nova aba a partir do

                    // próprio dado local; documentos já salvos (link do Drive) abrem pelo link.

                    const linkAbrir = d.base64 || d.url || (typeof d === 'string' ? d : '#');

                    return `

                        <div class="flex items-center justify-between bg-white border rounded px-2 py-1">

                            <a href="${linkAbrir}" target="_blank" class="text-slate-700 underline truncate flex-1">📎 ${nome}</a>

                            <button type="button" onclick="removerDocumentoContrato('${d.id}')" title="Remover" class="ml-2 text-red-600 font-bold text-[11px] flex-none"><svg data-lucide="x" style="width:14px;height:14px"></svg></button>

                        </div>

                    `;

                }).join('');

            });

            if (typeof lucide !== 'undefined') lucide.createIcons();

        }

        export async function removerDocumentoContrato(docId) {

            const doc = documentosCarregadosContrato.find(d => d.id === docId);
            if (!doc) return;

            if (!confirm(`Remover o documento "${doc.nome}"? Isso apaga o arquivo de vez, não dá pra desfazer.`)) return;

            // CORRIGIDO (bug real — excluir documento não apagava nada de
            // verdade): antes só tirava da lista em memória. Se o documento já
            // tinha sido salvo (tem _salvo=true, veio de uma entrada real de
            // histórico), agora: apaga o arquivo do Storage, apaga a entrada de
            // histórico correspondente, e registra uma NOVA entrada de
            // histórico documentando a remoção.
            if (doc._salvo && doc.url) {
                try {
                    const match = doc.url.match(/contratos-documentos\/([^?]+)/);
                    if (match) {
                        const caminho = decodeURIComponent(match[1]);
                        const { error: errStorage } = await dbAuth.storage.from('contratos-documentos').remove([caminho]);
                        if (errStorage) logScreen('Aviso: falha ao apagar arquivo do Storage: ' + errStorage.message, true);
                    }

                    if (doc.id) {
                        const { error: errHist } = await dbAuth.from('historico_contrato').delete().eq('id', doc.id);
                        if (errHist) logScreen('Aviso: falha ao apagar entrada de histórico do documento: ' + errHist.message, true);
                    }

                    const conId = document.getElementById('con-id').value;
                    let novaEntradaHistorico = null;
                    if (conId) {
                        const { data: inserida } = await dbAuth.from('historico_contrato').insert({
                            contrato_id: conId,
                            tipo: 'alteracao',
                            descricao: 'Documentos: removido ' + doc.nome
                        }).select().single();
                        novaEntradaHistorico = inserida;
                    }

                    // CORRIGIDO (bug real — reabrir o mesmo contrato, na mesma
                    // sessão, sem recarregar a página, mostrava o anexo já
                    // excluído de volta, e sem a entrada de remoção no
                    // histórico): a remoção só atualizava o array local do
                    // formulário (documentosCarregadosContrato), nunca o
                    // registro do contrato dentro do array global "contratos"
                    // — então reabrir lia a versão antiga. Agora atualiza os
                    // dois.
                    if (conId) {
                        const conGlobal = contratos.find(c => c.id === conId);
                        if (conGlobal) {
                            conGlobal.anexos = (conGlobal.anexos || []).filter(a => a.id !== doc.id);
                            if (novaEntradaHistorico) {
                                conGlobal.historico = conGlobal.historico || [];
                                conGlobal.historico.push({
                                    data: novaEntradaHistorico.criado_em,
                                    descricao: novaEntradaHistorico.descricao,
                                    tipo: novaEntradaHistorico.tipo,
                                    alteracoes: [{ campo: 'Alteração', de: '-', para: novaEntradaHistorico.descricao }],
                                    _salvo: true
                                });
                            }
                        }
                    }
                } catch (err) {
                    alert('⚠️ O documento foi removido da tela, mas houve uma falha ao limpar tudo no banco: ' + err.message);
                    logScreen('Erro ao remover documento: ' + err.message, true);
                }
            }

            documentosCarregadosContrato = documentosCarregadosContrato.filter(d => d.id !== docId);

            renderPreviewDocumentosContrato();

            if (document.getElementById('con-id').value) {
                renderHistoricoContratoInline(contratos.find(c => c.id === document.getElementById('con-id').value));
            }

        }

        export function saveContrato(e) {

            e.preventDefault();

            // CORRIGIDO (bug real — anexo duplicado no Storage, 2 virou 4): sem
            // essa trava, um toque duplo no botão disparava dois salvamentos
            // quase juntos, e cada um enviava os mesmos anexos novos de novo.
            const btnSalvar = document.getElementById('btn-salvar-con');
            if (btnSalvar && btnSalvar.disabled) return false;
            if (btnSalvar) { btnSalvar.disabled = true; setTimeout(function() { btnSalvar.disabled = false; }, 4000); }

            try {

            let imovelParaSincronizar = null;

            const id = document.getElementById('con-id').value;

            const imoId = document.getElementById('con-imovel').value;

            const docTipo = tipoDocumentoDetectado();

            const docVal = document.getElementById('con-cpf').value.trim();

            // Divisão do contrato — se houver algum item, soma precisa ser 100%
            // (mesma regra do imóvel). Se estiver vazia, é permitido salvar
            // assim mesmo (contrato sem divisão específica cadastrada ainda).
            if (divisaoContratoAtual.length > 0) {
                const somaDivisaoContrato = divisaoContratoAtual.reduce(function(acc, s) { return acc + (s.pct || 0); }, 0);
                if (somaDivisaoContrato !== 100) {
                    alert("⚠️ A soma do rateio deste contrato precisa ser exatamente 100%. Total atual: " + somaDivisaoContrato + "%");
                    return false;
                }
            }

            const dataFim = document.getElementById('con-fim').value;

            devLog("FORM_CONTRATO", `Iniciando rotina de submissão. ID: ${id || 'NOVO'}, Imovel ID: ${imoId}`);

            // CORRIGIDO (bug real, 30/08/2026, pedido explícito do Nicola:
            // "salvando contrato e ele não tá gerando um contrato"): estas
            // validações sempre existiram e sempre pararam a gravação —
            // mas NENHUMA delas era vista por quem chamava saveContrato()
            // diretamente (salvarDadosNovoContratoPopup, o popup "Dados
            // Novo Contrato"). O alert() aparecia e sumia rápido, e a
            // função de fora, sem checar o retorno, fechava o popup do
            // mesmo jeito — parecia que tinha salvo, mas nada tinha ido
            // pro banco (CPF de teste inválido é a causa mais comum: um
            // CPF que não passa no dígito verificador barra aqui,
            // silenciosamente, pro caller). Todo ponto de saída antecipada
            // desta função agora retorna `false` explicitamente — quem
            // chama por fora (ver salvarDadosNovoContratoPopup) confere
            // isso antes de fechar/mostrar sucesso.
            if(!imoId) { alert("⚠️ Selecione um imóvel."); return false; }

            if(docTipo === 'CPF' && !validarCPF(docVal)) {

                alert("⚠️ O documento informado não é um CPF válido.");
                return false;

            }

            if(docTipo === 'CNPJ' && !validarCNPJ(docVal)) {

                alert("⚠️ O documento informado não é um CNPJ válido.");
                return false;

            }

            // Lógica de "Novo Valor": o campo sempre abre em branco. Se o usuário

            // digitou algo nele, o valor ATUAL do contrato (antes desta edição) vira

            // valorAnterior, e o valor digitado passa a ser o novo valor vigente. Se

            // o campo ficou em branco, o valor vigente não muda nesta edição.

            const contratoExistente = id ? contratos.find(c => c.id === id) : null;

            const novoValorDigitado = parseFloat(document.getElementById('con-valor-anterior').value);

            // v1.41.0 (Fase 1) — vigência da alteração é obrigatória sempre que
            // houver um novo valor/reajuste digitado no painel de reajuste.
            if (!isNaN(novoValorDigitado) && novoValorDigitado > 0 && !document.getElementById('con-vigente-desde').value) {
                alert("⚠️ Informe a vigência da alteração (data a partir de quando o novo valor passa a valer).");
                return false;
            }

            let valorFinal, valorAnteriorFinal;

            // CORRIGIDO (v1.60.0) — BUG REAL, PRÉ-EXISTENTE (não introduzido
            // nesta sessão): quando editando um contrato já existente e o
            // painel de reajuste (con-valor-anterior) estava vazio, o
            // código simplesmente reaproveitava contratoExistente.valor —
            // IGNORANDO por completo o que estivesse digitado no campo
            // "Valor do aluguel" (con-valor) na tela. Editar o valor
            // diretamente (fora do fluxo de reajuste) nunca persistia,
            // sempre voltava pro valor antigo ao reabrir. Corrigido: agora
            // con-valor é sempre a fonte de verdade da base; o painel de
            // reajuste só ENTRA COMO SUBSTITUIÇÃO quando estiver
            // preenchido de propósito (fluxo de reajuste continua
            // idêntico a antes).
            if (!isNaN(novoValorDigitado) && novoValorDigitado > 0) {

                valorAnteriorFinal = contratoExistente ? contratoExistente.valor : 0;

                valorFinal = novoValorDigitado;

            } else {

                valorFinal = parseFloat(document.getElementById('con-valor').value) || (contratoExistente ? contratoExistente.valor : 0) || 0;

                valorAnteriorFinal = contratoExistente ? (contratoExistente.valorAnterior || 0) : 0;

            }

            let contratoDados = {

                id: id || 'con_' + Date.now(),

                imovelId: imoId,

                divisaoRepasse: divisaoContratoAtual.map(function(s) { return { nome: s.nome, percentual: s.pct }; }),

                // NOVO (30/08/2026) — mesmo padrão de divisaoRepasse: lê
                // direto do estado global fiadoresContratoAtual (populado
                // pelo popup "Dados Novo Contrato"). Cards sem nome/cpf
                // preenchido são descartados aqui (evita persistir linha
                // vazia se o usuário só clicou "+ Adicionar fiador" e
                // desistiu) — mesma regra que substituir_fiadores_
                // contrato() também aplica no banco, em dobro de propósito.
                // SÓ inclui se fiadoresContratoAtual foi carregado PRA
                // ESTE MESMO contrato (trava contra sobra de outro popup —
                // ver comentário em fiadoresContratoAtualPertenceAoId).
                fiadores: (fiadoresContratoAtualPertenceAoId === (id || '__novo__'))
                    ? fiadoresContratoAtual.filter(function(f) { return f.nome && f.cpf; })
                    : undefined,

                status: document.getElementById('con-status').value,

                locatario: document.getElementById('con-locatario').value,

                docTipo: docTipo,

                cpf: docVal,

                vencimentoDia: parseInt(document.getElementById('con-vencimento-dia').value),

                alugelAntecipado: document.getElementById('con-antecipado').value,

                whatsapp: document.getElementById('con-whatsapp').value.trim(),

                email: document.getElementById('con-email').value.trim(),

                // v1.46.0 — CORRIGIDO: antes não existiam neste objeto,
                // então eram apagados em silêncio a cada save de um
                // contrato que já tinha esses dados (vindos da Vitrine/bot).
                locatarioEnderecoAtual: document.getElementById('con-locatario-endereco').value.trim(),
                locatarioProfissao: document.getElementById('con-locatario-profissao').value.trim(),
                locatarioEstadoCivil: document.getElementById('con-locatario-estado-civil').value,

                inicio: document.getElementById('con-inicio').value,

                fim: dataFim,

                valor: valorFinal,

                valorAnterior: valorAnteriorFinal,

                reajusteAplicado: parseFloat(document.getElementById('con-reajuste-aplicado').value) || 0,

                reajuste: document.getElementById('con-reajuste').value,

                condominioLocatario: document.getElementById('con-condominio-locatario').value,
                locatarioPagaIptu: document.getElementById('con-iptu-locatario').value,

                // v1.41.4 — voltaram a ser campos próprios/editáveis do
                // contrato (pré-preenchidos com o valor do imóvel só ao
                // cadastrar um contrato NOVO — ver sugerirDescontoEnergia).
                iptuValor: parseFloat(document.getElementById('con-iptu-valor').value) || 0,
                condominioValor: parseFloat(document.getElementById('con-condominio-valor').value) || 0,

                administradoraId: document.getElementById('con-administradora').value,

                contatoNome: document.getElementById('con-contato-nome').value.trim(),

                formaPagamento: document.getElementById('con-forma-pagamento').value,

                descontoEnergia: parseFloat(document.getElementById('con-desconto-energia').value) || 0,

                // CORRIGIDO (bug crítico — causa real da duplicação de histórico
                // relatada): "iptu" estava na lista de campos monitorados para
                // detectar mudança, mas NUNCA era lido de nenhum campo do
                // formulário (não existe tela para editá-lo ainda) — ficava sempre
                // "undefined", então TODA gravação, mesmo sem nenhuma mudança
                // real, detectava uma "alteração fantasma" de IPTU e criava um
                // histórico novo. Preserva o valor existente até esse campo ganhar
                // uma tela de verdade.
                iptu: contratoExistente ? contratoExistente.iptu : 0,

                anexos: documentosCarregadosContrato.length > 0

                    ? documentosCarregadosContrato

                    : (id ? (contratos.find(c => c.id === id).anexos || []) : []),

                historico: []

            };

            devLog("FORM_CONTRATO", "Payload do Contrato Estruturado:", contratoDados);

            if(id) {

                const idx = contratos.findIndex(c => c.id === id);

                if(idx !== -1) {

                    const anterior = contratos[idx];

                    const historicoExistente = anterior.historico || [];

                    const agora = new Date().toISOString();

                    const vigenteDesdeInput = document.getElementById('con-vigente-desde');

                    // Data a partir da qual o novo valor passa a valer de fato (usada no

                    // rateio proporcional de mensalidades). Se o campo não existir/estiver

                    // vazio, assume a data de hoje.

                    const vigenteDesde = (vigenteDesdeInput && vigenteDesdeInput.value)

                        ? vigenteDesdeInput.value

                        : new Date().toISOString().split('T')[0];

                    // Compara os campos relevantes do contrato anterior com os novos valores.

                    // IMPORTANTE: uma única entrada de histórico é registrada por edição

                    // (contendo a lista de todos os campos alterados naquela ação), e não

                    // uma entrada separada por campo — evita poluir o histórico quando o

                    // usuário altera vários campos de uma vez só.

                    const camposMonitorados = [

                        { campo: 'valor', rotulo: 'Valor do aluguel' },

                        { campo: 'status', rotulo: 'Status do contrato' },

                        { campo: 'vencimentoDia', rotulo: 'Dia de vencimento' },

                        { campo: 'inicio', rotulo: 'Início da vigência' },

                        { campo: 'fim', rotulo: 'Data de término' },

                        { campo: 'reajusteAplicado', rotulo: 'Reajuste aplicado' },

                        { campo: 'reajuste', rotulo: 'Índice de reajuste' },

                        { campo: 'iptu', rotulo: 'IPTU contratual' },

                        { campo: 'locatario', rotulo: 'Locatário' },

                        { campo: 'docTipo', rotulo: 'Tipo de documento' },

                        { campo: 'cpf', rotulo: 'Documento (CPF/CNPJ)' },

                        { campo: 'whatsapp', rotulo: 'WhatsApp' },

                        { campo: 'email', rotulo: 'E-mail' },

                        { campo: 'alugelAntecipado', rotulo: 'Aluguel antecipado' },

                        { campo: 'administradoraId', rotulo: 'Administradora' },

                        { campo: 'contatoNome', rotulo: 'Pessoa de contato' },

                        { campo: 'formaPagamento', rotulo: 'Forma de pagamento' },

                        { campo: 'descontoEnergia', rotulo: 'Desconto de energia' },

                        { campo: 'condominioLocatario', rotulo: 'Condomínio a cargo do locatário' },

                        { campo: 'iptuValor', rotulo: 'Valor do IPTU' },

                        { campo: 'condominioValor', rotulo: 'Valor do Condomínio' }

                    ];

                    const alteracoes = [];

                    camposMonitorados.forEach(({ campo, rotulo }) => {

                        let valorAntigo = anterior[campo];

                        let valorNovo = contratoDados[campo];

                        // CORRIGIDO — "Administradora" mostrava o UUID cru no
                        // histórico em vez do nome (o único campo monitorado que é
                        // uma referência para outra tabela, não um valor direto).
                        if (campo === 'administradoraId') {
                            const admAntiga = administradoras.find(a => a.id === valorAntigo);
                            const admNova = administradoras.find(a => a.id === valorNovo);
                            valorAntigo = admAntiga ? admAntiga.nome : (valorAntigo ? '-' : null);
                            valorNovo = admNova ? admNova.nome : (valorNovo ? '-' : null);
                        }

                        if (String(valorAntigo ?? '') !== String(valorNovo ?? '')) {

                            alteracoes.push({ campo: rotulo, de: valorAntigo ?? '-', para: valorNovo ?? '-' });

                        }

                    });

                    // CORRIGIDO (bug real — histórico não sendo gerado ao mudar só a
                    // divisão ou só anexar documento): essas duas coisas não estavam
                    // na lista de campos monitorados acima, então uma edição que só
                    // mexesse nelas não contava como "alteração" nenhuma.
                    const divisaoAntigaTexto = JSON.stringify((anterior.divisaoRepasse || []).map(d => `${d.nome}:${d.percentual}`).sort());
                    const divisaoNovaTexto = JSON.stringify((contratoDados.divisaoRepasse || []).map(d => `${d.nome}:${d.percentual}`).sort());
                    if (divisaoAntigaTexto !== divisaoNovaTexto) {
                        const resumoAntigo = (anterior.divisaoRepasse || []).map(d => `${d.nome} ${d.percentual}%`).join(', ') || '-';
                        const resumoNovo = (contratoDados.divisaoRepasse || []).map(d => `${d.nome} ${d.percentual}%`).join(', ') || '-';
                        alteracoes.push({ campo: 'Divisão de rateio', de: resumoAntigo, para: resumoNovo });
                    }

                    // REMOVIDO — este bloco criava uma SEGUNDA entrada de
                    // histórico genérica ("Documentos: - → nome") toda vez que
                    // um anexo era enviado, duplicando a entrada específica que
                    // já é criada pelo loop dedicado em sincronizarContratoSupabase
                    // (essa sim carrega a URL do arquivo de verdade).

                    // v1.41.0 (Fase 1) — caixa de observação: sempre em branco;
                    // se o usuário digitou algo, entra como mais um item dentro
                    // da MESMA entrada de histórico deste salvamento (não cria
                    // uma entrada separada — mantém o padrão de "1 histórico por
                    // salvamento com todas as alterações").
                    const observacaoDigitada = (document.getElementById('con-observacao-nova').value || '').trim();
                    if (observacaoDigitada) {
                        alteracoes.push({ campo: 'Observação', de: '-', para: observacaoDigitada });
                    }

                    contratoDados.historico = alteracoes.length > 0

                        ? [...historicoExistente, { data: agora, vigenteDesde: vigenteDesde, alteracoes: alteracoes }]

                        : historicoExistente;

                    contratos[idx] = contratoDados;

                    devLog("FORM_CONTRATO", `Contrato existente ID: ${id} modificado no index: ${idx}. ${alteracoes.length} campo(s) alterado(s) registrados em 1 entrada de histórico.`);

                }

            } else {

                const alteracoesIniciais = [{ campo: 'Contrato criado', de: '-', para: `${contratoDados.locatario} — R$ ${contratoDados.valor}/mês` }];

                const observacaoDigitadaNovo = (document.getElementById('con-observacao-nova').value || '').trim();
                if (observacaoDigitadaNovo) {
                    alteracoesIniciais.push({ campo: 'Observação', de: '-', para: observacaoDigitadaNovo });
                }

                contratoDados.historico = [{

                    data: new Date().toISOString(),

                    vigenteDesde: contratoDados.inicio,

                    alteracoes: alteracoesIniciais

                }];

                contratos.push(contratoDados);

                devLog("FORM_CONTRATO", "Novo contrato adicionado ao banco local.");

                // CORRIGIDO (v1.50.0 — pedido explícito): antes marcava
                // SEMPRE como "Alugado", mesmo quando o contrato nascia em
                // "Assinando" (ex.: criado a partir de "Iniciar
                // contratação"). Agora reflete o status real do contrato —
                // só vira "Alugado" quando o contrato já está Ativo.
                const imIdx = imoveis.findIndex(i => i.id === imoId);

                if(imIdx !== -1) {

                    imoveis[imIdx].status = contratoDados.status === 'Assinando' ? 'Assinando' : 'Alugado';

                    imovelParaSincronizar = imoveis[imIdx];

                    devLog("FORM_CONTRATO", `Imóvel ID: ${imoId} localizado e atualizado para status '${imoveis[imIdx].status}'`);

                } else {

                    devLog("FORM_CONTRATO_AVISO", `Imóvel com ID: ${imoId} não foi localizado na memória para atualizar para 'Alugado'.`);

                }

            }

            document.getElementById('form-contrato').reset();

            documentosCarregadosContrato = [];

            renderPreviewDocumentosContrato();

            cancelarEdicaoContrato();

            // v1.45.0 (Correção de Direção UX) — "salvar retorna à ficha",
            // nunca à lista, quando a edição foi aberta a partir de um
            // contexto (ficha do imóvel ou ficha do próprio contrato).
            if (contextoRetornoEdicaoContrato) {
                const ctxRetorno = contextoRetornoEdicaoContrato;
                contextoRetornoEdicaoContrato = null;
                if (ctxRetorno.tipo === 'fichaImovel') {
                    abrirFichaImovel(ctxRetorno.id);
                } else if (ctxRetorno.tipo === 'fichaContrato') {
                    abrirFichaContrato(contratoDados.id);
                }
            }

            registrarLog(id ? 'contratos.editar' : 'contratos.criar', { contratoId: contratoDados.id, locatario: contratoDados.locatario });

            // CORRIGIDO (causa real da demora de ~10s ao salvar 1 contrato):
            // mesmo já restringindo a ROTA para "contratos" em saveAll(), a
            // função por trás dela ainda percorria TODOS os contratos da
            // empresa (11, na Rabelo Testes) a cada gravação — historico,
            // anexos e divisão de CADA UM, não só do editado. Agora sincroniza
            // só o contrato específico que mudou; o resto (renderizações,
            // localStorage) continua igual, é tudo local e rápido.
            salvarContratoIndividual(contratoDados, imovelParaSincronizar);

            } catch (err) {

                alert("⚠️ Erro ao salvar o contrato: " + err.message + "\n\nPor favor, copie esta mensagem e me envie para eu corrigir.");

                devLog("ERRO_SALVAR_CONTRATO", `Falha ao salvar contrato: ${err.message}`, err);

                return false;

            }

        }

        export function editarContrato(id) {

            try {

            activeConId = id;

            const con = contratos.find(c => c.id === id);

            if(!con) return;

            renderImoveis();

            document.getElementById('con-id').value = con.id;

            // v1.41.0 (Fase 1) — caixa de observação sempre em branco ao abrir
            // um contrato para edição (não é um campo persistente do contrato).
            document.getElementById('con-observacao-nova').value = '';

            document.getElementById('con-imovel').value = con.imovelId;

            const imoDoContrato = imoveis.find(i => i.id === con.imovelId);
            const resumoBtnCon = document.getElementById('con-imovel-resumo');
            if (resumoBtnCon) resumoBtnCon.textContent = imoDoContrato
                ? `[${imoDoContrato.empreendimento || '-'}] ${imoDoContrato.enderecoRua || ''}, ${imoDoContrato.enderecoNum || ''}`
                : '-- Escolha o Imóvel --';

            exibirDivisaoImovelNoContrato(con.imovelId, con.divisaoRepasse);

            document.getElementById('con-status').value = con.status || 'Ativo';

            document.getElementById('con-locatario').value = con.locatario;

            document.getElementById('con-cpf').value = con.cpf;

            // v1.46.0 — CORRIGIDO: campos novos no formulário (ver changelog).
            document.getElementById('con-locatario-endereco').value = con.locatarioEnderecoAtual || '';
            document.getElementById('con-locatario-profissao').value = con.locatarioProfissao || '';
            document.getElementById('con-locatario-estado-civil').value = con.locatarioEstadoCivil || '';

            formatarMascaraDocumento();

            document.getElementById('con-vencimento-dia').value = con.vencimentoDia || 15;

            document.getElementById('con-antecipado').value = con.alugelAntecipado || 'Sim';

            document.getElementById('con-whatsapp').value = con.whatsapp || '';

            validarWhatsappContrato();

            document.getElementById('con-email').value = con.email || '';

            validarEmailContrato();

            document.getElementById('con-inicio').value = con.inicio;

            document.getElementById('con-fim').value = con.fim;

            document.getElementById('con-valor').value = con.valor;

            // "Novo Valor" e "% Reajuste" sempre abrem em branco — só se preenche

            // quando o usuário está de fato lançando um reajuste nesta edição.

            document.getElementById('con-valor-anterior').value = '';

            document.getElementById('con-reajuste-aplicado').value = '';

            document.getElementById('con-reajuste').value = con.reajuste;

            document.getElementById('con-contato-nome').value = con.contatoNome || '';

            document.getElementById('con-forma-pagamento').value = con.formaPagamento || 'PIX';

            document.getElementById('con-desconto-energia').value = con.descontoEnergia || 0;

            document.getElementById('con-condominio-locatario').value = con.condominioLocatario || 'Não';
            document.getElementById('con-iptu-locatario').value = con.locatarioPagaIptu || 'Não';

            // v1.41.4 — ao editar, usa o valor que já está salvo no
            // contrato (não busca de novo no imóvel — sugerirDescontoEnergia()
            // só pré-preenche a partir do imóvel em contrato NOVO, detecta
            // "edição" pelo próprio con-id já setado acima).
            document.getElementById('con-iptu-valor').value = con.iptuValor || 0;
            document.getElementById('con-condominio-valor').value = con.condominioValor || 0;

            sugerirDescontoEnergia();

            popularDropdownAdministradoras();

            document.getElementById('con-administradora').value = con.administradoraId || '';

            atualizarValorLiquidoEsperado();

            document.getElementById('con-vigente-desde').value = '';

            documentosCarregadosContrato = con.anexos || [];

            renderPreviewDocumentosContrato();

            // Seção avançada começa fechada — o usuário abre só se for reajustar.

            document.getElementById('secao-avancada-contrato').classList.add('hidden');

            document.getElementById('btn-toggle-reajuste-contrato')?.classList.remove('ativo');

            document.getElementById('btn-toggle-reajuste-contrato')?.classList.remove('hidden');

            renderHistoricoContratoInline(con);

            document.getElementById('form-contrato-titulo').innerText = "Editar contrato";

            document.getElementById('form-contrato-wrapper').classList.remove('hidden');

            sincronizarBotaoToggleContrato();

            window.scrollTo({top: 0, behavior: 'smooth'});

            } catch (err) {

                alert("⚠️ Erro ao abrir a edição do contrato: " + err.message);

                devLog("ERRO_EDITAR_CONTRATO", `Falha ao abrir edição: ${err.message}`, err);

            }

        }

        // Atalho a partir do card do imóvel vago: vai para a aba Contratos, abre
        // um contrato novo, e já deixa o imóvel escolhido.
        // CORRIGIDO (v1.57.0 — pedido explícito):
        // 1) mensagem de confirmação removida — abrir o formulário não
        //    precisa mais de "Confirma a criação..." antes.
        // 2) se já existir um contrato "Assinando" pra este imóvel (dados
        //    que o locatário preencheu pelo link), abre ELE pra edição
        //    (reaproveita editarContrato() já existente, com todos os
        //    dados dele pré-carregados) — só abre formulário em branco se
        //    realmente não houver nenhum contrato ainda.
        export function criarContratoParaImovel(imovelId) {
            const imo = imoveis.find(i => i.id === imovelId);
            if (!imo) return;

            const contratoAssinandoExistente = contratos.find(c => c.imovelId === imovelId && c.status === 'Assinando');

            switchTab('tab-contratos');
            cancelarEdicaoContrato();

            // Pequeno atraso — a troca de aba pode levar um instante para o
            // conteúdo ficar visível de verdade; preencher e rolar direto na
            // sequência às vezes rodava antes disso, parecendo que nada abriu.
            setTimeout(function() {
                document.getElementById('form-contrato-wrapper').classList.remove('hidden');

                sincronizarBotaoToggleContrato();

                if (contratoAssinandoExistente) {
                    editarContrato(contratoAssinandoExistente.id);
                    return;
                }

                document.getElementById('con-imovel').value = imovelId;
                const resumoBtn = document.getElementById('con-imovel-resumo');
                if (resumoBtn) resumoBtn.textContent = `[${imo.empreendimento || '-'}] ${imo.enderecoRua || ''}, ${imo.enderecoNum || ''}`;

                sugerirDescontoEnergia();
                exibirDivisaoImovelNoContrato(imovelId);

                document.getElementById('form-contrato')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 150);
        }

        export function cancelarEdicaoContrato() {

            activeConId = null;

            document.getElementById('con-id').value = '';

            document.getElementById('form-contrato').reset();

            const resumoBtnConReset = document.getElementById('con-imovel-resumo');
            if (resumoBtnConReset) resumoBtnConReset.textContent = '-- Escolha o Imóvel --';

            const boxDivisaoReset = document.getElementById('con-divisao-imovel-info');
            if (boxDivisaoReset) boxDivisaoReset.classList.add('hidden');
            divisaoContratoAtual = [];

            document.getElementById('form-contrato-titulo').innerText = "Novo contrato de locação";

            documentosCarregadosContrato = [];

            renderPreviewDocumentosContrato();

            const indicador = document.getElementById('con-doc-indicador');

            if (indicador) indicador.innerText = '';

            const secaoAvancada = document.getElementById('secao-avancada-contrato');

            if (secaoAvancada) secaoAvancada.classList.add('hidden');

            // v1.41.2 — a cortina de reajuste (e o botão "..." que a abre) só
            // fazem sentido ao EDITAR um contrato já existente (reajustar um
            // valor vigente). Ao cadastrar um contrato novo, o botão "..."
            // fica escondido — não há "valor anterior" para reajustar ainda.
            const btnReajuste = document.getElementById('btn-toggle-reajuste-contrato');
            if (btnReajuste) { btnReajuste.classList.add('hidden'); btnReajuste.classList.remove('ativo'); }

            renderHistoricoContratoInline(null);

            document.getElementById('form-contrato-wrapper').classList.add('hidden');

            sincronizarBotaoToggleContrato();

            renderImoveis();
            // v1.112.0 — Nicola: "ao cancelar, cai na lista" — se o formulário
            // foi aberto pela ficha do ATIVO (cofre-ativos deixa
            // window.fichaContratoOrigem), volta pra ela no chip Contratos.
            const origemCon = window.fichaContratoOrigem;
            if (origemCon && origemCon.tipo === 'ativo' && origemCon.id && typeof window.abrirFichaAtivoNoChip === 'function') {
                window.fichaContratoOrigem = null;
                switchTab('tab-ativos');
                window.abrirFichaAtivoNoChip(origemCon.id, 'contratos');
            }

        }

        export function verAlertasContrato(id) {

            const con = contratos.find(c => c.id === id);

            if (!con) return;

            const alertas = [];

            if (contratoVencido(con)) {

                alertas.push("🔴 Contrato vencido sem renovação/aditivo (vigência terminou em " + formatarDataBR(con.fim) + ").");

            }

            if (contratoPrecisaRevisao(con)) {

                alertas.push("🟠 Pendente de revisão/reajuste — sem alteração de valor desde " + formatarDataBR(obterUltimaVigenciaValor(con)) + " (mais de 12 meses).");

            }

            // v1.44.2 — novo alerta
            if (contratoAguardandoAssinatura(con)) {

                alertas.push("🔵 Contrato gerado pela Vitrine, aguardando revisão e assinatura — ainda não está Ativo.");

            }

            alert(alertas.length > 0 ? alertas.join("\n\n") : "Sem alertas para este contrato.");

        }

        // v1.110.0 (fatia 4) — chips de filtro da lista de Contratos, em 1
        // linha (.rz-chips), com contador. Só escrevem no <select> e no
        // checkbox que já existiam no overlay de busca — renderContratos()
        // continua sendo a única função que filtra.
        let contratosChipAtual = 'todos';

        export function renderChipsContratos() {
            const wrap = document.getElementById('contratos-chips');
            if (!wrap) return;
            const comAlerta = contratos.filter(c => contratoPrecisaRevisao(c) || contratoVencido(c) || contratoAguardandoAssinatura(c)).length;
            const grupos = [
                { chave: 'todos', rotulo: 'Todos', qtd: contratos.length },
                { chave: 'Ativo', rotulo: 'Vigentes', qtd: contratos.filter(c => c.status === 'Ativo').length },
                { chave: 'alerta', rotulo: 'Com alerta', qtd: comAlerta, warn: comAlerta > 0 },
                { chave: 'Assinando', rotulo: 'Assinando', qtd: contratos.filter(c => c.status === 'Assinando').length },
                { chave: 'Finalizado', rotulo: 'Encerrados', qtd: contratos.filter(c => c.status === 'Finalizado').length },
            ];
            wrap.innerHTML = grupos.map(g => `<button type="button" onclick="filtrarContratosPorChip('${g.chave}')" class="rz-chip ${contratosChipAtual === g.chave ? 'rz-on' : ''} ${g.warn ? 'rz-warn' : ''}">${g.rotulo} <span class="rz-n">${g.qtd}</span></button>`).join('');
        }

        export function filtrarContratosPorChip(chave) {
            contratosChipAtual = chave;
            const sel = document.getElementById('contratos-filtro-status');
            const chk = document.getElementById('contratos-filtro-somente-alerta');
            if (sel) sel.value = (chave === 'todos' || chave === 'alerta') ? 'todos' : chave;
            if (chk) chk.checked = chave === 'alerta';
            renderContratos();
        }

        export function renderContratos() {

            const container = document.getElementById('lista-contratos');

            if(!container) return;

            container.innerHTML = '';

            popularFiltroSelect('contratos-filtro-emp', imoveis.map(i => i.empreendimento));

            popularFiltroSelect('contratos-filtro-locatario', contratos.map(c => c.locatario));

            const fEmpCon = document.getElementById('contratos-filtro-emp')?.value || 'todos';

            const fStatusCon = document.getElementById('contratos-filtro-status')?.value || 'todos';

            const fImovelIdCon = document.getElementById('contratos-filtro-imovel-id')?.value || 'todos';

            const fLocatarioCon = document.getElementById('contratos-filtro-locatario')?.value || 'todos';

            const passaFiltroContrato = (con) => {
                const imoDoContrato = imoveis.find(i => i.id === con.imovelId);
                if (fEmpCon !== 'todos' && (!imoDoContrato || imoDoContrato.empreendimento !== fEmpCon)) return false;
                if (fStatusCon !== 'todos' && con.status !== fStatusCon) return false;
                if (fImovelIdCon !== 'todos' && con.imovelId !== fImovelIdCon) return false;
                if (fLocatarioCon !== 'todos' && con.locatario !== fLocatarioCon) return false;
                // v1.44.2 — checkbox "só com alerta", ligado a partir da
                // Visão Geral ou manualmente aqui na própria aba.
                if (document.getElementById('contratos-filtro-somente-alerta')?.checked) {
                    if (!(contratoPrecisaRevisao(con) || contratoVencido(con) || contratoAguardandoAssinatura(con))) return false;
                }
                return true;
            };

            // v7.3.3 — Os números-resumo (removidos da tela em v1.99.0,
            // "não tem o resumo de contratos no topo" — nenhuma outra aba
            // primária tinha essa caixa) não são mais exibidos, mas o
            // filtro em si continua igual.
            const pendentesRevisao = contratos.filter(contratoPrecisaRevisao).length;

            const vencidos = contratos.filter(contratoVencido).length;

            const bannerRevisao = document.getElementById('banner-revisao-contratos');

            if (bannerRevisao) {

                bannerRevisao.classList.toggle('hidden', (pendentesRevisao + vencidos) === 0);

                bannerRevisao.innerText = (pendentesRevisao + vencidos) > 0 ? "⚠️ Você tem alertas em contratos!" : '';

            }

            // v1.110.0 (fatia 4 da gramática única, REGRAS §8/§9/§10) — lista
            // em .rz-row agrupada por empreendimento (.rz-group) dentro de
            // .rz-card.rz-list, status "ponto + rótulo" via renderStatus
            // (alerta do contrato vira o status: Vencido = bad, Reajustar =
            // warn, Assinando = run, Vigente = ok, demais = neu) e chips de
            // filtro em 1 linha (renderChipsContratos). Toque na linha abre a
            // ficha; o ícone do alerta virou a semântica da placa.
            renderChipsContratos();
            const rs = (sem, txt) => (typeof renderStatus === 'function') ? renderStatus(sem, txt) : `<span class="rz-st rz-${sem}">${txt}</span>`;
            const statusContratoHtml = (con) => {
                if (contratoVencido(con)) return rs('bad', 'Vencido');
                if (contratoAguardandoAssinatura(con) || con.status === 'Assinando') return rs('run', 'Assinando');
                if (contratoPrecisaRevisao(con)) return rs('warn', 'Reajustar');
                if (con.status === 'Ativo') return rs('ok', 'Vigente');
                if (con.status === 'Suspenso') return rs('warn', 'Suspenso');
                return rs('neu', con.status === 'Finalizado' ? 'Encerrado' : (con.status || '—'));
            };
            const ordenados = contratos.filter(passaFiltroContrato).sort((a, b) => {
                const imoA = imoveis.find(i => i.id === a.imovelId);
                const imoB = imoveis.find(i => i.id === b.imovelId);
                const empA = imoA ? imoA.empreendimento : '';
                const empB = imoB ? imoB.empreendimento : '';
                return empA.localeCompare(empB) || (a.locatario || '').localeCompare(b.locatario || '');
            });
            if (!ordenados.length) {
                container.innerHTML = `<div class="rz-card"><div class="rz-empty"><div class="rz-ic"><svg data-lucide="file-text"></svg></div><p>Nenhum contrato ${fStatusCon !== 'todos' || fEmpCon !== 'todos' || fLocatarioCon !== 'todos' ? 'neste filtro' : 'ainda'}. Um contrato vigente é o que transforma um imóvel em receita.</p></div></div>`;
                if (typeof lucide !== 'undefined') lucide.createIcons();
                return;
            }
            const empDe = (c) => { const im = imoveis.find(i => i.id === c.imovelId); return im ? (im.empreendimento || 'Sem empreendimento') : 'Sem imóvel'; };
            let html = '', grupoAtual = null;
            ordenados.forEach(con => {
                const imo = imoveis.find(i => i.id === con.imovelId);
                const emp = empDe(con);
                if (emp !== grupoAtual) {
                    if (grupoAtual !== null) html += '</div>';
                    const qtd = ordenados.filter(c => empDe(c) === emp).length;
                    html += `<div class="rz-group">${escapeHtmlSaidas(emp)} · ${qtd}</div><div class="rz-card rz-list">`;
                    grupoAtual = emp;
                }
                const vencido = contratoVencido(con);
                const revisar = contratoPrecisaRevisao(con);
                const assinando = con.status === 'Assinando' || contratoAguardandoAssinatura(con);
                const encerrado = !(con.status === 'Ativo' || con.status === 'Assinando' || con.status === 'Suspenso');
                const classeIc = vencido ? ' rz-bad' : (revisar ? ' rz-warn' : (encerrado ? ' rz-neu' : ''));
                const icone = vencido ? 'alarm-clock' : (assinando ? 'file-signature' : (encerrado ? 'archive' : 'file-text'));
                const endereco = imo ? `${imo.enderecoRua || ''}, ${imo.enderecoNum || ''}${imo.enderecoComp ? ' · ' + imo.enderecoComp : ''}` : '—';
                const extras = [];
                if (imo && imo.energiaRumo === 'Sim' && con.descontoEnergia > 0) extras.push('energia c/ desconto');
                if (con.anexos && con.anexos.length > 0) extras.push(`${con.anexos.length} anexo${con.anexos.length > 1 ? 's' : ''}`);
                if (con.fim) extras.push(`até ${formatarDataBR(con.fim)}`);
                html += `
                    <div class="rz-row rz-link" role="button" tabindex="0" onclick="abrirFichaContrato('${con.id}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); abrirFichaContrato('${con.id}');}">
                        <div class="rz-ic${classeIc}"><svg data-lucide="${icone}"></svg></div>
                        <div class="rz-tx"><b>${escapeHtmlSaidas(con.locatario || 'Locatário não informado')}</b><span>${escapeHtmlSaidas(endereco)}${extras.length ? ' · ' + extras.join(' · ') : ''}</span></div>
                        <div class="rz-rt"><b>${formatarMoedaBR(con.valor)}</b>${statusContratoHtml(con)}</div>
                        <svg data-lucide="chevron-right" class="rz-chev"></svg>
                    </div>`;
            });
            if (grupoAtual !== null) html += '</div>';
            container.innerHTML = html;
            if (typeof lucide !== 'undefined') lucide.createIcons();

        }

        // ============================================================================
        // Histórico do contrato — versão inline (dentro do próprio formulário de
        // edição), em ordem CRESCENTE (mais antigo primeiro). Mesmo estilo visual
        // do modal (verHistoricoContrato), só que sempre visível e com
        // abrir/fechar individual por item + botão "abrir/fechar todos".
        // ============================================================================
        let historicosContratoAbertos = {}; // { indice: true/false } — reseta a cada abertura de formulário

        export function renderHistoricoContratoInline(con) {
            const contador = document.getElementById('con-historico-contador');
            const lista = document.getElementById('con-historico-lista');
            if (!lista) return;

            const historico = (con && con.historico) ? con.historico : [];
            if (contador) contador.textContent = `(${historico.length})`;

            if (historico.length === 0) {
                lista.innerHTML = con
                    ? '<p class="text-[11px] text-gray-400 italic">Nenhum histórico registrado ainda.</p>'
                    : '<p class="text-[11px] text-gray-400 italic">O primeiro histórico ("assinatura") será criado automaticamente ao salvar este contrato.</p>';
                return;
            }

            historicosContratoAbertos = {}; // reseta o estado de abertos a cada render de contrato diferente

            // CORRIGIDO — ordem agora decrescente (mais recente primeiro),
            // como pedido. [...historico] evita alterar o array original.
            lista.innerHTML = [...historico].reverse().map(function(h, index) {
                const dataFormatada = h.data ? new Date(h.data).toLocaleString('pt-BR') : '-';
                const vigenciaFormatada = h.vigenteDesde ? formatarDataBR(h.vigenteDesde) : '-';
                const qtdAlteracoes = (h.alteracoes || []).length;
                const tituloResumo = (h.alteracoes && h.alteracoes[0]) ? h.alteracoes[0].campo : 'Alteração';

                return `
                    <div class="border border-slate-200 rounded-lg overflow-hidden">
                        <button type="button" onclick="alternarHistoricoContratoItem(${index})" class="w-full flex items-center justify-between p-1.5 bg-white text-left">
                            <span class="text-[11px] text-slate-600"><strong>${dataFormatada}</strong> — ${tituloResumo}${qtdAlteracoes > 1 ? ` +${qtdAlteracoes - 1}` : ''}</span>
                            <span id="con-historico-seta-${index}" class="text-slate-400 text-[10px]">▼</span>
                        </button>
                        <div id="con-historico-corpo-${index}" class="hidden p-2 bg-slate-50 text-[11px] space-y-1">
                            <div class="text-slate-400">Vigente desde ${vigenciaFormatada}</div>
                            ${(h.alteracoes || []).map(a => `<div class="text-slate-700">• <strong>${a.campo}:</strong> ${a.de} → ${a.para}</div>`).join('')}
                        </div>
                    </div>
                `;
            }).join('');
        }

        export function alternarHistoricoContratoItem(index) {
            const corpo = document.getElementById('con-historico-corpo-' + index);
            const seta = document.getElementById('con-historico-seta-' + index);
            if (!corpo) return;
            const abrir = corpo.classList.contains('hidden');
            corpo.classList.toggle('hidden');
            if (seta) seta.textContent = abrir ? '▲' : '▼';
            historicosContratoAbertos[index] = abrir;
        }

        // CORRIGIDO — antes decidia "abrir ou fechar" só pelo TEXTO do botão,
        // que podia ficar dessincronizado se o usuário já tivesse aberto/
        // fechado itens individualmente. Agora checa o estado de verdade: se
        // ALGUM item estiver fechado, o próximo clique abre todos; só fecha
        // todos quando já estão todos abertos.
        export function alternarTodosHistoricosContrato() {
            const btn = document.getElementById('btn-alternar-historicos-contrato');
            const corpos = document.querySelectorAll('[id^="con-historico-corpo-"]');
            const existeAlgumFechado = Array.from(corpos).some(function(c) { return c.classList.contains('hidden'); });
            const abrirTodos = existeAlgumFechado;
            corpos.forEach(function(corpo) {
                corpo.classList.toggle('hidden', !abrirTodos);
                const index = corpo.id.replace('con-historico-corpo-', '');
                const seta = document.getElementById('con-historico-seta-' + index);
                if (seta) seta.textContent = abrirTodos ? '▲' : '▼';
            });
            if (btn) btn.textContent = abrirTodos ? 'Fechar todos' : 'Abrir todos';
        }

        export function verHistoricoContrato(id) {

            const con = contratos.find(c => c.id === id);

            if (!con) return;

            const historico = con.historico || [];

            let corpoHtml;

            if (historico.length === 0) {

                corpoHtml = `<p style="color:#64748b; font-size:13px;">Nenhuma alteração registrada ainda.</p>`;

            } else {

                const linhas = [...historico].reverse().map(h => {

                    const dataFormatada = h.data ? new Date(h.data).toLocaleString('pt-BR') : '-';

                    const vigenciaFormatada = h.vigenteDesde ? formatarDataBR(h.vigenteDesde) : '-';

                    const listaAlteracoes = (h.alteracoes || []).map(a =>

                        `<div style="font-size:13px; color:#1e293b; padding-left:4px;">• <strong>${a.campo}:</strong> ${a.de} → ${a.para}</div>`

                    ).join('');

                    // CORRIGIDO (v1.53.0) — BUG REAL relatado duas vezes com
                    // sintomas diferentes ("observação sumida" em Dados
                    // locatário/Detalhes, "reajuste sem detalhes" no
                    // histórico): esta função só renderizava h.alteracoes[],
                    // nunca h.descricao — todo histórico gravado pelos popups
                    // novos (Dados locatário/Detalhes/Reajuste/Alterar
                    // status) usa "descricao" (texto livre, com a observação
                    // já embutida), então aparecia como linha vazia, sem
                    // nenhum texto visível.
                    const linhaDescricao = h.descricao ? `<div style="font-size:13px; color:#1e293b; padding-left:4px;">${h.descricao}</div>` : '';

                    return `

                        <div style="border-bottom:1px solid #e2e8f0; padding:8px 0;">

                            <div style="font-size:11px; color:#94a3b8;">${dataFormatada}${h.vigenteDesde ? ' — vigente desde ' + vigenciaFormatada : ''}</div>

                            ${linhaDescricao}

                            ${listaAlteracoes}

                        </div>

                    `;

                }).join('');

                corpoHtml = linhas;

            }

            // CORRIGIDO (v1.57.0 — pedido explícito): mesmo padrão visual
            // dos demais popups suspensos ("Dados locatário" etc.) — sobe
            // de baixo pra cima, não mais centralizado no meio da tela.
            let modal = document.getElementById('modal-historico-contrato');

            if (!modal) {

                modal = document.createElement('div');

                modal.id = 'modal-historico-contrato';

                document.body.appendChild(modal);

            }

            modal.style.cssText = 'position:fixed; inset:0; z-index:96; background:rgba(23,33,30,.5); display:flex; align-items:flex-end; justify-content:center;';

            modal.innerHTML = `

                <div style="background:#fff; border-radius:16px 16px 0 0; padding:16px; width:100%; max-width:480px; max-height:85vh; overflow-y:auto;">

                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">

                        <h3 style="font-size:14px; font-weight:bold; color:#1e293b;">Histórico — ${con.locatario}</h3>

                        <button onclick="document.getElementById('modal-historico-contrato').remove()" style="background:#e2e8f0;border:none;border-radius:9999px;width:26px;height:26px;flex:none;">✕</button>

                    </div>

                    ${corpoHtml}

                </div>

            `;

            modal.onclick = (ev) => { if (ev.target === modal) modal.remove(); };

        }
