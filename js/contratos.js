// ============================================================================
// contratos.js — Raiz Patrimônio · Contratos (lista · ficha · formulário ·
//                 status/reajuste/detalhes · fiadores · documentos · histórico)
// Versão: 1.44.1 · 07/10/2026
//
// v1.44.1 (07/10/2026, sessão 20261007-1721-rolo-changelog, demanda 2507d554 — VER-05, "de acordo" do Nicola 07/10 17:21) — SÓ
// CABEÇALHO: as versões além das 5 mais recentes rolaram para o CHANGELOG_MODULOS.md.
// Nenhuma linha de código mudou — conferido token a token contra o publicado.
//
// Versão anterior: 1.44.0 · 07/10/2026
//
// v1.44.0 (UX F2.4, demanda 6f2c8d16, sessão 20261003-1707-ux-base; plano aprovado pelo Nicola 07/10 09:11;
// UXR-13/14/15) — chips da lista de Contratos na ordem Todos → ação → estado:
//   Todos · ● Com alerta · ● A reajustar · ● Vencendo 90 d · Vigentes · Assinando · Encerrados.
//   · Os 3 de ação vêm do Motor de Alertas (mesmo número da aba Alertas): "A reajustar" =
//     reajuste_aniversario, "Vencendo 90 d" = contrato_encerramento (inclui vencido), "Com alerta" =
//     qualquer alerta ligado ao contrato. Ponto na cor do pior alerta; só aparecem com contador > 0.
//     Sem os alertas carregados, cai na regra local de antes (revisão, vencido, assinando).
//   · Vigentes e Encerrados sempre aparecem (Encerrados por último); Assinando só com contador > 0.
//
// Versão anterior: 1.43.0 · 07/10/2026
//
// v1.43.0 (demanda b94ef7d5, sessão 20261007-0231-vinculos-reativar; plano aprovado pelo Nicola 07/10 02:31) —
// chip Partes da ficha do contrato ganha o grupo "Encerrados" (fiador e cônjuge anuente encerrados,
// com a data); ⋮ de um encerrado: "Reativar" (volta ao contrato com os dados de antes —
// fn_vinculo_reativar) e "Excluir" (fn_vinculo_excluir). Excluídos não aparecem.
//
// Versão anterior: 1.42.0 · 07/10/2026
//
// v1.42.0 (demanda b94ef7d5, sessão 20261007-0005-vinculos-chips; plano aprovado pelo Nicola 07/10 00:05) —
// ⋮ do fiador no chip Partes ganha "Encerrar fiador" (troca real: sai da lista do contrato e fica no
// histórico da parte, com o cônjuge anuente) via fn_vinculo_encerrar; "Remover fiador" vira
// "Excluir fiador" (cadastro errado — mesmo caminho de antes, que agora exclui o vínculo).
//
// Versão anterior: 1.41.0 · 06/10/2026
//
// v1.41.0 (frente D, fatia D2 — demandas 860233ca e be7cdd7c; sessão 20261006-2348-setup-d2; "Estou de
// acordo" do Nicola 06/10 23:48) — (1) o + de Contratos (e o vazio da lista, que usa o mesmo sheet) ganha
// "Configuração inicial" (pedido do Nicola: "a opção também no card de contratos"). (2) be7cdd7c:
// abrirNovoContratoDoDocumento({ ativoId, dados, documentoId, aoTerminar }) abre o formulário de contrato
// preenchido com o que a Raiz IA leu do contrato (locatário, documento, valor, dia, início, fim, índice);
// ao salvar, o documento é anexado ao contrato (evento cofre:vincular-documento, cofre-documentos.js).
// Nada é gravado sem a pessoa salvar o formulário.
// --------------------------------------------------------------------------
// Versões anteriores (v1.0.1 … v1.40.0): CHANGELOG_MODULOS.md, na raiz do repositório — o
// gerar_versoes.py rola pra lá automaticamente tudo além das 5 versões
// mais recentes deste cabeçalho (VER-05).

import { avaliarProntidaoContratoParaMinuta } from './minutas.js'; // v1.0.1
import { emitirEscrita, aoEscrever } from './raiz-eventos.js'; // v1.18.0 — Fase 1 do wrapper de escrita
// v1.28.0 (demanda 11afd25f) — endereço do locatário no formulário único de
// contrato passa a ser o bloco estruturado (mesmo componente que cofre-ativos.js
// já importa estaticamente). Sem dependência circular: os dois módulos não
// importam nada.
import { renderizarBlocoEndereco, lerBlocoEndereco } from './comum-endereco.js';
import { formatarEnderecoParte } from './comum-partes.js';

export const VERSAO = '1.44.1'; // v-check: lido por ⚙️ › Conta › Versões — manter igual ao header

/** Ponto de entrada do switchTab('tab-contratos'). */
export function montarAbaContratos() {
    renderContratos();
    if (typeof lucide !== 'undefined') lucide.createIcons();
}
/** Recarrega a ficha se ela estiver aberta neste contrato (usado pelo index). */
export function reabrirFichaSeFor(contratoId) {
    if (fichaContratoAtualId === contratoId) abrirFichaContrato(contratoId);
}

// v1.18.0 (Fase 1 do wrapper de escrita) — registra 1x por carregamento do
// módulo (módulo ES é singleton por URL; guarda por window.* de propósito,
// mesmo mecanismo já usado em index.html pro piloto de 'ativo', pra não
// duplicar o listener num cenário de re-import). A ficha aberta já se
// auto-recarrega (chamada direta logo após cada emitirEscrita('contrato',
// ...) abaixo) — reagir a ela AQUI TAMBÉM dobraria o fetch de fiadores/
// ocorrências à toa a cada salvamento. O que faltava mesmo era a LISTA:
// renderContratos() só rodava ao entrar na aba (montarAbaContratos) ou usar
// a busca (linha ~3984) — uma escrita feita de outro ponto do app (ex.: a
// partir da ficha do imóvel/ativo) nunca a atualizava sem F5.
if (!window.__rzListenerEscritaContratoLigado) {
    window.__rzListenerEscritaContratoLigado = true;
    aoEscrever('contrato', () => { renderContratos(); });
}

// v1.20.0 (demanda 0e40951a, complemento) — este módulo nunca escutava
// 'mensalidade' (só emite/ouve a própria 'contrato'): o card "Financeiro"
// da Ficha (fc-painel-cobrancas, mensalidadesDoContrato) não se atualizava
// sozinho quando um recebimento nascia de FORA da ficha (ex.: pelo
// quadrante Adicionar em Financeiro). reabrirFichaSeFor() já existe (usada
// por outras 12 funções deste arquivo) — só reaproveitada aqui.
if (!window.__rzListenerEscritaMensalidadeContratoLigado) {
    window.__rzListenerEscritaMensalidadeContratoLigado = true;
    aoEscrever('mensalidade', () => {
        // v1.22.0 — só redesenha a ficha se ela for a tela VISÍVEL (abrirFichaContrato faz switchTab)
        if (fichaContratoAtualId && document.getElementById('tab-contrato-ficha')?.classList.contains('active')) reabrirFichaSeFor(fichaContratoAtualId);
    });
}
// v1.22.0 (e19d6739) — edição de Parte propaga o nome para contratos.locatario
// (index.html salvarParteSheet) e avisa com detalhe.contratoIds.
if (!window.__rzListenerEscritaParteContratoLigado) {
    window.__rzListenerEscritaParteContratoLigado = true;
    aoEscrever('parte', (d) => {
        const ids = (d && d.contratoIds) || [];
        if (!ids.length) return;
        if (typeof renderContratos === 'function') renderContratos();
        if (fichaContratoAtualId && ids.includes(fichaContratoAtualId) && document.getElementById('tab-contrato-ficha')?.classList.contains('active')) abrirFichaContrato(fichaContratoAtualId);
    });
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

        // v1.26.0 (demanda 3b458eb4) — mesma trava acima, agora pro
        // endereço ESTRUTURADO (rua/número/bairro/cidade/UF/CEP) lido do
        // bloco comum-endereco.js no popup "Dados Novo Contrato"
        // (salvarDadosNovoContratoPopup). saveContrato() só inclui isto no
        // payload quando pertencer a ESTE MESMO contrato — nunca sobra de
        // outro popup aberto antes.
        let enderecoLocatarioEstruturadoAtual = null;
        let enderecoLocatarioEstruturadoAtualPertenceAoId = null;

        const FIADOR_CAMPO_VAZIO = {
            nome: '', doc_tipo: 'CPF', cpf: '', rg: '', rg_orgao_expedidor: '',
            nacionalidade: 'brasileiro(a)', data_nascimento: '', profissao: '', estado_civil: '',
            regime_bens: '', conjuge_nome: '', conjuge_cpf: '', conjuge_rg: '', conjuge_profissao: '',
            whatsapp: '', email: '', endereco_atual: '',
            possui_imovel_proprio: false, imovel_matricula: '', imovel_cartorio_registro: '', imovel_endereco: ''
        };

        // v1.28.0 (demanda 11afd25f) — 2 travas novas, porque o formulário
        // único de contrato passa a carregar fiadores SEMPRE (antes só o
        // popup "Dados Novo Contrato" carregava):
        //   · snapshot: saveContrato() só manda fiadores pro banco quando a
        //     lista MUDOU desde que foi carregada — editar o telefone do
        //     locatário não reescreve (delete+insert) os fiadores de ninguém;
        //   · erro ao carregar NÃO vira "lista vazia deste contrato" (antes
        //     virava, e um save em seguida apagaria os fiadores salvos): o
        //     dono fica null e saveContrato() simplesmente não toca neles.
        // fiadoresListaAlvoId: onde renderFiadoresPopup() desenha — o
        // formulário único usa #con-fiadores-lista; o sheet "Fiadores do
        // contrato" continua usando #dnc-fiadores-lista.
        let fiadoresContratoAtualSnapshot = '[]';
        let fiadoresListaAlvoId = 'dnc-fiadores-lista';

        export async function carregarFiadoresContrato(contratoId) {
            fiadoresContratoAtualPertenceAoId = contratoId || '__novo__';
            fiadoresContratoAtualSnapshot = '[]';
            if (!contratoId) { fiadoresContratoAtual = []; return; }
            const { data, error } = await dbAuth.from('contrato_fiadores')
                .select('*').eq('contrato_id', contratoId).order('ordem');
            if (error) { console.error('carregarFiadoresContrato:', error.message); fiadoresContratoAtual = []; fiadoresContratoAtualPertenceAoId = null; return; }
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
            fiadoresContratoAtualSnapshot = JSON.stringify(fiadoresContratoAtual);
        }

        // v1.28.0 (demanda 11afd25f) — lista de fiadores que saveContrato()
        // manda pro banco: undefined (não toca em nada) quando a lista não é
        // deste contrato OU não mudou desde que foi carregada.
        function fiadoresParaSalvar(idContrato) {
            if (fiadoresContratoAtualPertenceAoId !== (idContrato || '__novo__')) return undefined;
            if (JSON.stringify(fiadoresContratoAtual) === fiadoresContratoAtualSnapshot) return undefined;
            return fiadoresContratoAtual.filter(function(f) { return f.nome && f.cpf; });
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
            fiadoresListaAlvoId = 'dnc-fiadores-lista'; // v1.28.0 — este sheet desenha na própria lista

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
                emitirEscrita('contrato', { id: contratoId, acao: 'editar-fiadores' }); // v1.18.0 — Fase 1 do wrapper de escrita
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
            // v1.28.0 (demanda 11afd25f) — alvo configurável: formulário único
            // de contrato (#con-fiadores-lista) ou sheet de fiadores (#dnc-...).
            const listaEl = document.getElementById(fiadoresListaAlvoId) || document.getElementById('dnc-fiadores-lista');
            if (!listaEl) return;

            if (fiadoresContratoAtual.length === 0) {
                listaEl.innerHTML = '<p style="font-size:12px;color:#94a3b8;">Nenhum fiador cadastrado. Nem todo contrato precisa — só adicione se a minuta escolhida exigir.</p>';
                return;
            }

            listaEl.innerHTML = fiadoresContratoAtual.map(function(f, i) {
                const campo = function(rotulo, chave, tipo, obrigatorioVisual) {
                    tipo = tipo || 'text';
                    const v = (f[chave] || '').toString().replace(/"/g, '&quot;');
                    return `<div class="rz-f"><label>${rotulo}${obrigatorioVisual ? ' <i>*</i>' : ''}</label>
                        <input type="${tipo}" value="${v}" onchange="atualizarCampoFiador(${i}, '${chave}', this.value)"></div>`;
                };
                return `
                <div class="rz-card" style="margin-bottom:12px">
                    <div class="rz-card-h"><h3>Fiador ${i + 1}</h3>
                        <button type="button" onclick="removerFiadorPopup(${i})" class="rz-btn rz-sm rz-btn-3" style="color:var(--danger);text-decoration-color:var(--danger-bg)">Remover</button>
                    </div>
                    <div class="rz-f2">
                        ${campo('Nome completo', 'nome', 'text', true)}
                        ${campo('CPF/CNPJ', 'cpf', 'text', true)}
                    </div>
                    <div class="rz-f2">
                        ${campo('RG', 'rg')}
                        ${campo('Órgão expedidor', 'rg_orgao_expedidor')}
                        ${campo('Nacionalidade', 'nacionalidade')}
                        ${campo('Data de nascimento', 'data_nascimento', 'date')}
                    </div>
                    <div class="rz-f2">
                        ${campo('Profissão', 'profissao')}
                        <div class="rz-f"><label>Estado civil</label>
                            <select onchange="atualizarCampoFiador(${i}, 'estado_civil', this.value)">
                                <option value="">-- Selecione --</option>
                                ${['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União estável'].map(op => `<option ${f.estado_civil === op ? 'selected' : ''}>${op}</option>`).join('')}
                            </select>
                        </div>
                        <div class="rz-f"><label>Regime de bens</label>
                            <select onchange="atualizarCampoFiador(${i}, 'regime_bens', this.value)">
                                <option value="">-- Se casado(a) --</option>
                                ${['Comunhão parcial de bens', 'Comunhão universal de bens', 'Separação total de bens', 'Separação obrigatória de bens', 'Participação final nos aquestos'].map(op => `<option ${f.regime_bens === op ? 'selected' : ''}>${op}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <p class="rz-desc" style="margin:0 0 8px">Cônjuge — assina junto se casado(a) fora de separação total ou obrigatória de bens (art. 1.647 do Código Civil).</p>
                    <div class="rz-f2">
                        ${campo('Nome do cônjuge', 'conjuge_nome')}
                        ${campo('CPF do cônjuge', 'conjuge_cpf')}
                        ${campo('RG do cônjuge', 'conjuge_rg')}
                        ${campo('Profissão do cônjuge', 'conjuge_profissao')}
                    </div>
                    <div class="rz-f2">
                        ${campo('WhatsApp', 'whatsapp')}
                        ${campo('E-mail', 'email', 'email')}
                    </div>
                    <div class="rz-f"><label>Endereço atual</label>
                        <textarea rows="2" onchange="atualizarCampoFiador(${i}, 'endereco_atual', this.value)">${(f.endereco_atual || '').replace(/</g, '&lt;')}</textarea>
                    </div>
                    <label class="rz-row rz-chk" style="padding:8px 0;border-top:0;min-height:44px">
                        <input type="checkbox" ${f.possui_imovel_proprio ? 'checked' : ''} onchange="atualizarCampoFiador(${i}, 'possui_imovel_proprio', this.checked)"> <span style="font-size:15px">Possui imóvel próprio quitado (garantia patrimonial)</span>
                    </label>
                    <div class="rz-f2">
                        ${campo('Matrícula do imóvel', 'imovel_matricula')}
                        ${campo('Cartório de registro', 'imovel_cartorio_registro')}
                        <div style="grid-column:1/-1">${campo('Endereço do imóvel', 'imovel_endereco')}</div>
                    </div>
                </div>`;
            }).join('')
            // v1.28.0 (demanda 11afd25f, Nicola: "não vi opção de cadastrar mais
            // fiadores") — o card de cada fiador é longo; o botão do topo some
            // da vista. Repete a ação no fim da lista.
            + `<button type="button" onclick="adicionarFiadorPopup()" class="rz-btn rz-btn-3" style="margin-top:2px"><svg data-lucide="user-plus"></svg> Adicionar outro fiador</button>`;
            if (typeof lucide !== 'undefined') lucide.createIcons();
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
                return `<div class="rz-row" style="cursor:default">
                    <div class="rz-tx"><b>${s.nome}</b></div>
                    <div style="display:flex;align-items:center;gap:6px;flex:none">
                        <input type="number" value="${s.pct}" min="0" max="100" inputmode="decimal" onchange="atualizarPctDivisaoContrato(${index}, this.value)" style="width:84px;text-align:right;font-weight:600">
                        <span style="font-size:13px;color:var(--muted)">%</span>
                        <button type="button" onclick="removerSocioContrato(${index})" class="rz-ico-btn" style="width:40px;height:40px;box-shadow:none;color:var(--danger)" aria-label="Remover sócio"><svg data-lucide="x" style="width:18px;height:18px"></svg></button>
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

        export async function adicionarSocioContrato() {
            const nomesJaAdicionados = divisaoContratoAtual.map(s => s.nome);
            const pessoasDisponiveis = pessoas.filter(p => p.percentualCotasEmpresa > 0 && !nomesJaAdicionados.includes(p.nome));

            // v1.39.0 (F0.2a) — prompt() numerado virou escolha em lista + Sheet de nome livre.
            const escolha = await rzEscolherUm({
                titulo: 'Adicionar sócio ao rateio', sub: 'Sócio com cotas ou terceiro de fora',
                opcoes: [
                    ...pessoasDisponiveis.map((p, i) => ({ valor: String(i), titulo: p.nome, sub: (p.percentualCotasEmpresa || 0) + '% de cotas', icone: 'user' })),
                    { valor: 'externo', titulo: 'Outro beneficiário', sub: 'Terceiro, não cadastrado em Pessoas', icone: 'user-plus' },
                ],
            });
            if (escolha === null) return;
            if (escolha === 'externo') {
                const nomeExterno = await rzPedirTexto({ titulo: 'Terceiro externo', rotulo: 'Nome do terceiro', rotuloSalvar: 'Adicionar' });
                if (!nomeExterno) return;
                divisaoContratoAtual.push({ nome: nomeExterno, pct: 0 });
                renderDivisaoContrato();
                return;
            }
            const pessoaEscolhida = pessoasDisponiveis[Number(escolha)];
            if (!pessoaEscolhida) return;

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

        // v1.25.0 (demanda 11afd25f + ec7d8a9f) — "+ Mostrar mais campos" do
        // formulário de contrato, mesmo padrão de alternarCamposAvancadosImovel()
        // (cofre-ativos.js v1.66.0): só campos OPCIONAIS ficam atrás dele (IPTU/
        // condomínio, forma de pagamento, índice de reajuste, rateio,
        // administradora, documentos, observação) — nenhum campo com "*"
        // (obrigatório) entra aqui. Estado inicial é decidido por
        // editarContrato()/cancelarEdicaoContrato(), não por esta função.
        export function alternarCamposAvancadosContrato() {
            const bloco = document.getElementById('con-campos-avancados');
            const btn = document.getElementById('con-toggle-mais-campos');
            if (!bloco || !btn) return;
            const vaiAbrir = bloco.classList.contains('hidden');
            bloco.classList.toggle('hidden', !vaiAbrir);
            btn.textContent = vaiAbrir ? '− Ocultar campos avançados' : '+ Mostrar mais campos';
            if (vaiAbrir) bloco.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

                rzResumo({ titulo: 'Não dá para excluir', linhas: ['Este contrato tem lançamentos mensais.', 'Apague primeiro os lançamentos em Financeiro › Recebimentos (só os não recebidos podem ser apagados).'] });

                return;

            }

            if (!await rzPerguntar({ titulo: 'Excluir contrato?', impacto: `O contrato de ${con.locatario || 'locação'} é apagado. Não dá para desfazer.`, destrutivo: true, rotuloConfirmar: 'Excluir contrato' })) return;

            mostrarCarregamentoGlobal('Excluindo contrato...');

            try {

                await dbAuth.from('processos_contratacao').update({ contrato_id: null }).eq('contrato_id', id);

                // v1.31.0 — itens de controle do contrato (reajuste/revisional)
                // saem antes: a FK cofre_itens_controle_contrato_id_fkey não é
                // cascade e barrava a exclusão. Ocorrências caem em cascata.
                const { error: errItens } = await dbAuth.from('cofre_itens_controle').delete().eq('contrato_id', id);
                if (errItens) throw errItens;

                const { error } = await dbAuth.from('contratos').delete().eq('id', id);
                if (error) throw error;

                contratos = contratos.filter(c => c.id !== id);

                registrarLog('contratos.excluir', { contratoId: id, locatario: con.locatario });
                emitirEscrita('contrato', { id, acao: 'excluir' }); // v1.18.0 — Fase 1 do wrapper de escrita

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
                rzAvisar('Não consegui excluir o contrato: ' + (err.message || String(err)), 'danger');
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
            if (!con.whatsapp) { rzAvisar('Este contrato não tem o WhatsApp do locatário.', 'danger'); return; }
            if (!imo || !imo.codigoIPTU) { rzAvisar('Este imóvel não tem o código do IPTU.', 'danger'); return; }
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
        // v1.27.0 (Bloco B) — ganhou 2 parâmetros opcionais: ocorrenciaId
        // (quando aberto a partir da "Linha do tempo", fecha aquela
        // ocorrência específica em vez de criar um lançamento avulso) e
        // subtipoCodigo (só pra rotular o sheet como "revisão" quando a
        // ocorrência é de revisional_contrato — a mecânica de salvar é a
        // mesma, fn_contrato_reajustar cuida de fechar o tipo certo). Sem
        // os 2 parâmetros (chamada antiga, botão "Aplicar o reajuste
        // contratual"), comportamento 100% igual ao de antes.
        export function lancarReajusteContrato(contratoId, ocorrenciaId, subtipoCodigo) {
            const con = contratos.find(c => c.id === contratoId);
            if (!con) return;
            if (con.status === 'Assinando') { mostrarToast('Contrato ainda em assinatura — ative o contrato antes de reajustar.', 'danger'); return; } // v1.32.0
            if (typeof podeUsar === 'function' && rzMostrarBloqueio('contratos.reajustar')) return;
            const ehRevisional = subtipoCodigo === 'revisional_contrato';
            const hoje = new Date().toISOString().slice(0, 10);
            const corpo = `
                <p class="text-xs text-slate-500 mb-3">Valor atual: <b>${formatarMoedaBR(con.valor)}/mês</b>${con.reajuste ? ' · índice ' + rzEsc(con.reajuste) : ''}</p>
                <div class="grid grid-cols-2 gap-2 mb-3">
                    <div><label class="block text-xs font-bold text-gray-600">Novo valor (R$) <span style="color:var(--danger)">*</span></label><input type="number" step="0.01" id="rj-valor" oninput="calcularPctReajustePopup(${con.valor})" class="w-full p-2 border rounded text-sm mt-1"></div>
                    <div><label class="block text-xs font-bold text-gray-600">% de ${ehRevisional ? 'variação' : 'reajuste'}</label><input type="number" step="0.01" id="rj-pct" oninput="calcularValorReajustePopup(${con.valor})" class="w-full p-2 border rounded text-sm mt-1"></div>
                </div>
                <div class="mb-3"><label class="block text-xs font-bold text-gray-600">Vale a partir de <span style="color:var(--danger)">*</span></label><input type="date" id="rj-vigencia" value="${hoje}" class="w-full p-2 border rounded text-sm mt-1"><p class="text-[10.5px] text-slate-500 mt-1">O valor vigente do contrato é atualizado agora; cobranças já geradas não mudam.</p></div>
                <div class="mb-3"><label class="block text-xs font-bold text-gray-600">Observação</label><textarea id="rj-obs" rows="2" placeholder="${ehRevisional ? 'Ex.: revisão judicial/negociada, conforme cláusula X' : 'Ex.: IGP-M acumulado 12 meses, conforme cláusula 5'}" class="w-full p-2 border rounded text-sm mt-1"></textarea></div>
                <div class="mb-1"><label class="block text-xs font-bold text-gray-600">Documento ${ehRevisional ? 'da revisão' : 'do reajuste'}</label><input type="file" id="rj-arquivo" accept=".pdf,.jpg,.jpeg,.png,.docx" class="w-full text-sm mt-1"><p class="text-[10.5px] text-slate-500 mt-1">Aditivo, notificação ou cálculo. Vai pro Cofre, vinculado a este contrato.</p></div>`;
            abrirSheetForm({
                titulo: ehRevisional ? 'Registrar revisão do contrato' : 'Reajustar contrato', sub: con.locatario || '', corpo,
                rotuloSalvar: ehRevisional ? 'Registrar revisão' : 'Registrar reajuste',
                aoSalvar: () => { salvarReajusteContratoPopup(con.id, ocorrenciaId || null, subtipoCodigo || null); return false; },
            });
            preencherReajusteEstimado(con);
        }

        // v1.31.0 (pedido do Nicola 01/10/2026) — Novo valor e % chegam
        // preenchidos com a simulação pelo índice cadastrado (o mesmo
        // "Valor reajustado (estimado)" do card Pelo contrato), venha a
        // chamada da Linha do tempo, do Resumo ou do menu. Só preenche
        // campo vazio; falha da simulação deixa o formulário em branco.
        async function preencherReajusteEstimado(con) {
            try {
                const { data, error } = await dbAuth.rpc('fn_simular_reajuste_contrato', { p_contrato_id: con.id });
                if (error) throw error;
                const sim = Array.isArray(data) ? data[0] : data;
                if (!sim || sim.valor_reajustado == null) return;
                const elValor = document.getElementById('rj-valor');
                const elPct = document.getElementById('rj-pct');
                if (elValor && !elValor.value) elValor.value = String(Math.round(Number(sim.valor_reajustado) * 100) / 100);
                if (elPct && !elPct.value && sim.acumulado_12m_pct != null) elPct.value = String(Math.round(Number(sim.acumulado_12m_pct) * 100) / 100);
            } catch (err) {
                console.warn('[contratos] simulação para pré-preencher o reajuste falhou (não bloqueando):', err.message);
            }
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

        // v1.27.0 (Bloco B) — ganhou o parâmetro opcional ocorrenciaId,
        // repassado como p_ocorrencia_id pra fn_contrato_reajustar: quando
        // vem preenchido (clique na "Linha do tempo"), a função fecha
        // AQUELA ocorrência (reajuste ou revisional, ela decide pelo item)
        // em vez de inserir um lançamento avulso novo. Sem o parâmetro
        // (chamada antiga, botão solto), comportamento idêntico a antes.
        export async function salvarReajusteContratoPopup(contratoId, ocorrenciaId, subtipoCodigo) {
            const ehRevisional = subtipoCodigo === 'revisional_contrato';
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

            mostrarCarregamentoGlobal(ehRevisional ? 'Registrando revisão...' : 'Registrando reajuste...');
            try {
                // v1.X (A.6, migration contratos_fn_reajustar_v1) — mesma ordem
                // de salvarRenovacaoContratoPopup: o anexo sobe ANTES da RPC,
                // pra já nascer vinculado (p_documento_id) na ocorrência criada
                // pela função central — antes o documento só era anexado
                // DEPOIS do registro em historico_contrato, num fluxo à parte.
                let docId = null;
                if (arquivoReajuste && typeof window.rzAnexarArquivoEntidade === 'function') {
                    try {
                        docId = await window.rzAnexarArquivoEntidade('contrato', contratoId, arquivoReajuste, {
                            nome: `Reajuste ${vigencia.slice(5, 7)}/${vigencia.slice(0, 4)} — ${con.locatario || ''}`.trim(),
                            descricao: `Reajuste de aluguel vigente desde ${formatarDataBR(vigencia)}.`, dataDocumento: vigencia, categoriaSugerida: 'reajuste|aditivo|contrato',
                        });
                    } catch (errDoc) { mostrarToast('O anexo falhou, o reajuste segue sem ele: ' + (errDoc.message || errDoc), 'danger'); }
                }

                // v1.X (A.6) — CORRIGIDO: antes gravava direto em
                // contratos.update() + historico_contrato.insert() (sem
                // função central, driblando DEM-04/CAN-03 — regra de
                // negócio duplicada fora do banco). Agora passa por
                // fn_contrato_reajustar, a mesma função central que a Ficha
                // › Renovação usa como ação "Aplicar o reajuste contratual"
                // (nível 1) — ela atualiza contratos.valor/valor_anterior/
                // reajuste_aplicado e grava a ocorrência em
                // cofre_ocorrencias_controle (tipo='reajuste'), não mais em
                // historico_contrato (tabela legada).
                const { error } = await dbAuth.rpc('fn_contrato_reajustar', {
                    p_contrato_id: contratoId, p_novo_valor: novoValor, p_indice: con.reajuste || null,
                    p_percentual: pct, p_vigencia: vigencia, p_observacao: obs || null, p_documento_id: docId,
                    p_ocorrencia_id: ocorrenciaId || null,
                });
                if (error) throw error;
                emitirEscrita('contrato', { id: contratoId, acao: 'reajuste' }); // v1.18.0 — Fase 1 do wrapper de escrita

                // v1.177.0 — Parte G do plano de conciliação: sem isto, os
                // recebimentos futuros já gerados (horizonte de 90 dias)
                // ficam com o valor ANTIGO depois do reajuste — só
                // recalcula o que ainda está em aberto, sem chave de
                // transação, sem recibo enviado e sem documento fiscal
                // (fn_mensalidades_realinhar já filtra isso no banco).
                let mensalidadesRealinhadas = 0;
                try {
                    const { data: realinhadas, error: errRealinhar } = await dbAuth.rpc('fn_mensalidades_realinhar', { p_contrato_id: contratoId });
                    if (errRealinhar) throw errRealinhar;
                    mensalidadesRealinhadas = (realinhadas || []).length;
                } catch (errRealinhar) {
                    devLog('ERRO_REAJUSTE', 'fn_mensalidades_realinhar falhou (reajuste já salvo, não bloqueia): ' + (errRealinhar.message || errRealinhar));
                }

                let descricao = `${ehRevisional ? 'Revisão' : 'Reajuste'} de aluguel: ${formatarMoedaBR(valorAntigo)} → ${formatarMoedaBR(novoValor)} (${pct >= 0 ? '+' : ''}${pct}%), vigente desde ${formatarDataBR(vigencia)}.`;
                if (obs) descricao += ' ' + obs;
                if (docId) descricao += ' [documento anexado no Cofre]';
                // Otimista (mesmo padrão de salvarRenovacaoContratoPopup): a
                // ocorrência já foi gravada pela RPC acima, isto só reflete
                // na tela sem esperar um novo round-trip de leitura.
                con.historico = con.historico || [];
                con.historico.push({ data: new Date().toISOString(), descricao, tipo: ehRevisional ? 'revisional' : 'reajuste', _salvo: true });

                con.valor = novoValor;
                con.valorAnterior = valorAntigo;
                con.reajusteAplicado = true;

                esconderCarregamentoGlobal();
                fecharModalCampoContrato();
                mostrarToast(mensalidadesRealinhadas > 0
                    ? `${ehRevisional ? 'Revisão registrada' : 'Reajuste registrado'}! ${mensalidadesRealinhadas} recebimento(s) futuro(s) atualizado(s).`
                    : (ehRevisional ? 'Revisão registrada!' : 'Reajuste registrado!'), 'success');
                registrarLog('contratos.reajustar', { contratoId, ocorrenciaId: ocorrenciaId || null, valorAntigo, novoValor, vigencia, documentoId: docId, mensalidadesRealinhadas });
                if (fichaImovelAtualId === con.imovelId) renderFichaImovelUnica(imoveis.find(i => i.id === con.imovelId));
                if (fichaContratoAtualId === contratoId) abrirFichaContrato(contratoId);
            } catch (err) {
                esconderCarregamentoGlobal();
                mostrarToast(`Não consegui registrar ${ehRevisional ? 'a revisão' : 'o reajuste'}: ` + (err.message || String(err)), 'danger'); // v1.133
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

        // v1.28.0 (demanda 11afd25f, pedido explícito do Nicola: "ao optar por
        // dados novo contrato o formulário é diferente do cadastrar contrato
        // manualmente. Devem ser idênticos") — o popup "Dados Novo Contrato"
        // (dnc-*, ~250 linhas de HTML próprio) deixou de existir. Ele nunca
        // teve gravação própria: copiava os campos pro formulário completo
        // escondido e chamava saveContrato(). Agora QUEM ABRE é o próprio
        // formulário completo — o que o popup tinha de melhor foi pra lá:
        // endereço do locatário estruturado (CEP com busca), fiadores na
        // mesma tela (0, 1, 2 ou mais) e o contrato "Assinando" com os dados
        // que o interessado preencheu pelo link já carregado
        // (criarContratoParaImovel faz isso). O nome continua exportado só
        // por compatibilidade com quem ainda chamar por ele.
        export async function abrirDadosNovoContratoPopup(imovelId) {
            return criarContratoParaImovel(imovelId);
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
                    // v1.18.0 (Fase 1 do wrapper de escrita) — este ramo faz a
                    // MESMA exclusão de excluirContrato() (linha ~805), só que
                    // inline (chega aqui quando não há pendência financeira a
                    // decidir); sem emitir aqui, essa exclusão nunca avisava
                    // ninguém, diferente do caminho que passa por
                    // excluirContrato() de verdade.
                    emitirEscrita('contrato', { id: contratoId, acao: 'excluir' });

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
                emitirEscrita('contrato', { id: contratoId, acao: 'status' }); // v1.18.0 — Fase 1 do wrapper de escrita

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
                        // Onda 12 (16/09/2026) — grava em cofre_ativos
                        // agora (situacao_uso), não mais em `imoveis`.
                        // imo.id já é o id do ativo.
                        await dbAuth.from('cofre_ativos').update({ situacao_uso: mapStatusAntigoParaSupabase(novoStatusImovel) }).eq('id', imo.id);
                    }
                }

                esconderCarregamentoGlobal();
                fecharModalCampoContrato();
                mostrarToast('Status do contrato atualizado!', 'success');
                registrarLog('contratos.editar', { contratoId, o_que: 'status', statusAntigo, statusNovo: acao }); // v1.131

                // NOVO (30/08/2026) — pedido explícito do Nicola: ao ativar
                // um contrato que ainda não tem NENHUM item a receber
                // gerado (comum quando o contrato pula direto pra Ativo,
                // sem passar por Assinando — ver v1.73.0), gera já os
                // recebimentos. v1.X (10/09/2026) — passou a chamar
                // fn_gerar_mensalidades_horizonte (banco, 90 dias), não só a
                // competência atual — mesma RPC do botão "Gerar Mês" e do
                // cron diário. Silencioso se não gerar nada (ex.: contrato
                // com início no futuro além do horizonte) — não é erro.
                //
                // v1.3.0 (11/09/2026) — Etapa 7 da conciliação (Parte G.2
                // item 2 do plano): fn_gerar_mensalidades_horizonte só gera
                // PRA FRENTE, a partir de hoje — contrato com início no
                // passado nunca tinha os meses já vencidos cobertos por
                // ela. Antes disso era o botão "Gerar mês" que completava
                // (agora removido, Etapa 7). Pergunta antes de gerar
                // retroativo — nunca decide sozinho.
                if (acao === 'Ativo' && !mensalidades.some(m => m.contratoId === contratoId)) {
                    const hoje = new Date();
                    const primeiroDiaMesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
                    const inicioContrato = con.inicio ? new Date(con.inicio + 'T00:00:00') : null;
                    const mesesRetroativos = [];
                    if (inicioContrato && inicioContrato < primeiroDiaMesAtual) {
                        const cursor = new Date(inicioContrato.getFullYear(), inicioContrato.getMonth(), 1);
                        while (cursor < primeiroDiaMesAtual) {
                            mesesRetroativos.push(`${String(cursor.getMonth() + 1).padStart(2, '0')}/${cursor.getFullYear()}`);
                            cursor.setMonth(cursor.getMonth() + 1);
                        }
                    }

                    let geradasRetroativo = 0;
                    if (mesesRetroativos.length > 0) {
                        const primeiroMes = mesesRetroativos[0];
                        const rotuloRange = mesesRetroativos.length === 1 ? primeiroMes : `${primeiroMes} a ${mesesRetroativos[mesesRetroativos.length - 1]}`;
                        const querRetroativo = await rzPerguntar({
                            titulo: 'Criar recebimentos retroativos?',
                            impacto: `Este contrato começa em ${primeiroMes}. Criar também os recebimentos de ${rotuloRange} (${mesesRetroativos.length} ${mesesRetroativos.length === 1 ? 'mês' : 'meses'})?`,
                            rotuloConfirmar: 'Criar retroativos', rotuloCancelar: 'Só daqui para frente',
                        });
                        if (querRetroativo) {
                            for (const ref of mesesRetroativos) {
                                const [mesRef, anoRef] = ref.split('/');
                                try {
                                    const { data: geradasRef, error: erroRetro } = await dbAuth.rpc('fn_gerar_mensalidades_competencia', {
                                        p_cliente_id: CLIENTE_ID_SUPABASE, p_referencia: `${anoRef}-${mesRef}-01`, p_contrato_id: contratoId,
                                    });
                                    if (erroRetro) throw erroRetro;
                                    geradasRetroativo += (geradasRef || []).length;
                                } catch (errRetro) {
                                    devLog('ERRO_ATIVACAO', `Falha ao gerar retroativo ${ref}: ${(errRetro.message || errRetro)}`);
                                }
                            }
                        }
                    }

                    const { data: geradas, error: erroGerar } = await dbAuth.rpc('fn_gerar_mensalidades_horizonte', {
                        p_cliente_id: CLIENTE_ID_SUPABASE, p_contrato_id: contratoId, p_dias_horizonte: 90,
                    });
                    if (erroGerar) {
                        console.warn('fn_gerar_mensalidades_horizonte falhou na ativação:', erroGerar.message);
                    }
                    const totalGerado = (erroGerar ? 0 : (geradas || []).length) + geradasRetroativo;
                    if (totalGerado > 0) {
                        mensalidades = await carregarMensalidadesSupabase();
                        mostrarToast(`${totalGerado} item(ns) a receber gerado(s)${geradasRetroativo > 0 ? ', incluindo retroativos' : ', até 90 dias'}.`, 'success');
                        registrarLog('mensalidades.gerar_automatico_ativacao', { contratoId, quantidade: totalGerado, retroativos: geradasRetroativo });
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
                rzAvisar('Não consegui alterar o status: ' + (err.message || String(err)), 'danger');
            }
        }

        // CORRIGIDO (v1.50.0) — BUG REAL relatado: "Could not find the
        // '_local' column of 'contratos'". Causa: __local era removido de
        // patchDb via destructuring, mas depois RE-ADICIONADO ao objeto
        // final antes de mandar pro Supabase ({ ...patchDb, __local }) —
        // então a coluna literal "__local" ia direto pro update() e o
        // PostgREST rejeitava. Corrigido: __local agora é um parâmetro
        // SEPARADO, nunca entra no objeto que vai pro banco.
        // v1.18.0 (Fase 1 do wrapper de escrita) — ganhou o 6º parâmetro
        // `acaoEmitir` (default 'observacao'): esta função é a persistência
        // REAL usada por salvarDadosLocatarioContrato ('editar-locatario')
        // e salvarDetalhesContrato ('editar-detalhes') — cada chamador passa
        // o acao mais específico dele aqui, em vez de emitir por conta
        // própria, senão a mesma gravação disparava emitirEscrita('contrato',
        // ...) duas vezes (uma genérica, uma específica) pra um único save.
        export async function salvarObservacaoContrato(contratoId, patchDb, localPatch, textoObs, tituloLog, acaoEmitir = 'observacao') {
            mostrarCarregamentoGlobal('Salvando...');
            try {
                const { error } = await dbAuth.from('contratos').update(patchDb).eq('id', contratoId);
                if (error) throw error;
                emitirEscrita('contrato', { id: contratoId, acao: acaoEmitir });

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
                rzAvisar('Não consegui salvar: ' + (err.message || String(err)), 'danger');
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
            salvarObservacaoContrato(contratoId, patch, localPatch, obs, 'Dados do locatário atualizados', 'editar-locatario'); // v1.18.0
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
                                    ${['PIX','Boleto','Dinheiro','Transferência','Cheque'].map(f => `<option ${((con.formaPagamento==='Depósito'?'Transferência':con.formaPagamento)||'PIX')===f?'selected':''}>${f}</option>`).join('')}
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
        // v1.15.0 (demanda be42b19f, item 2 — achado do Nicola: "editar
        // uma parte (ex. 'editar locador') hoje não abre nada") — os 3
        // tipos de chip eram <span>, sem onclick nenhum ("Sem ação de
        // clicar" dizia o comentário original de propósito, mas esta tela
        // (abrirDetalhesContrato) também é aberta a partir do botão
        // "Detalhes" do contrato ATIVO, index.html, não só de contratos
        // finalizados — então "sem ação" virou o próprio bug relatado).
        // Locatário e Fiador viram <button>, despachando o MESMO evento
        // 'cofre:abrir-ficha-parte' que o chip "Partes" da ficha nova usa
        // (agora com listener de verdade em index.html, corrigido nesta
        // mesma demanda) — os dois já vêm com parte_id resolvido nesta
        // consulta, sem precisar de uma 2ª função só pra isso. Divisão
        // (recebe X%) abre o popup de rateio já existente
        // (abrirAcoesDistribuicaoContrato, demanda 44f30857 item 4) — não
        // é edição de UMA parte, mas é a ação equivalente disponível hoje.
        export async function montarChipsPartesContrato(con) {
            const mount = document.getElementById('mdt-partes');
            if (!mount) return;
            try {
                const [locatarioRes, fiadoresRes, divisaoRes] = await Promise.all([
                    dbAuth.from('partes_papeis').select('parte_id').eq('entidade_tipo', 'contrato').eq('entidade_id', con.id).eq('papel', 'locatario').eq('ativo', true).limit(1).maybeSingle(),
                    dbAuth.from('partes_papeis').select('parte_id, partes(nome)').eq('entidade_tipo', 'contrato').eq('entidade_id', con.id).eq('papel', 'fiador').eq('ativo', true),
                    dbAuth.from('divisao_repasse_contrato').select('nome_externo, percentual, pessoas(nome)').eq('contrato_id', con.id)
                ]);
                const chipBtn = (rotulo, onclick) => `<button type="button" onclick="${onclick}" class="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-300">${rotulo}</button>`;
                const chipSpan = (rotulo) => `<span class="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-300">${rotulo}</span>`;
                const abrirParteJs = (parteId) => `window.dispatchEvent(new CustomEvent('cofre:abrir-ficha-parte', { detail: { id: '${parteId}' } }))`;
                const chips = [];
                if (con.locatario) {
                    const rot = `${escapeHtmlSaidas(con.locatario)} · Locatário`;
                    chips.push(locatarioRes.data?.parte_id ? chipBtn(rot, abrirParteJs(locatarioRes.data.parte_id)) : chipSpan(rot));
                }
                (fiadoresRes.data || []).forEach(f => {
                    if (f.partes?.nome && f.parte_id) chips.push(chipBtn(`${escapeHtmlSaidas(f.partes.nome)} · Fiador`, abrirParteJs(f.parte_id)));
                });
                (divisaoRes.data || []).forEach(d => {
                    const nome = d.pessoas?.nome || d.nome_externo;
                    if (nome) chips.push(chipBtn(`${escapeHtmlSaidas(nome)} · Recebe ${Number(d.percentual)}%`, `abrirAcoesDistribuicaoContrato('${con.id}')`));
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
            salvarObservacaoContrato(contratoId, patch, localPatch, obs, 'Detalhes do contrato atualizados', 'editar-detalhes'); // v1.18.0
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
                // v1.39.1 — o banco exige 100% (trigger da divisão): não há "salvar assim"
                rzAvisar(`A divisão do contrato precisa somar 100%. Hoje está em ${total.toFixed(1)}%.`, 'danger');
                return;
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
                emitirEscrita('contrato', { id: contratoId, acao: 'divisao' }); // v1.18.0 — Fase 1 do wrapper de escrita
                con.divisaoRepasse = validas.map(d => ({ nome: d.nome, percentual: parseFloat(d.pct) || 0 }));
                esconderCarregamentoGlobal();
                fecharModalCampoContrato();
                mostrarToast('Divisão do contrato salva!', 'success');
                registrarLog('imoveis.divisao', { contratoId }); // v1.131
                if (fichaImovelAtualId === con.imovelId) renderFichaImovelUnica(imoveis.find(i => i.id === con.imovelId));
                // v1.15.0 (demanda 44f30857, item 4) — o popup agora também é
                // aberto a partir da ficha do CONTRATO (card "Distribuição"),
                // não só da ficha do imóvel; sem isto o card ficava com o
                // valor antigo até a próxima navegação.
                if (fichaContratoAtualId === contratoId) montarDistribuicaoContrato(contratoId);
            } catch (err) {
                esconderCarregamentoGlobal();
                rzAvisar('Não consegui salvar: ' + (err.message || String(err)), 'danger');
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
            if (!con) { rzAvisar('Contrato não encontrado.', 'danger'); return; }

            const imo = imoveis.find(i => i.id === con.imovelId);
            const enderecoImo = imo ? `${imo.empreendimento || ''} - ${imo.enderecoRua || ''}, ${imo.enderecoNum || ''}` : '-';
            // v1.13.1 — CORRIGIDO (achado por Nicola em teste manual): a ordenação
            // comparava a string "referencia" (formato "MM/YYYY") direto por
            // localeCompare, então o MÊS pesava mais que o ANO e agrupava tudo
            // por mês (todos os "12/*" antes de todos os "11/*", etc.) em vez de
            // decrescente real por competência. Chave de ordenação agora é
            // "AAAAMM", igual ao padrão já usado no filtro de competência do
            // financeiro.js (linha ~3066).
            const chaveCompetenciaContrato = (ref) => {
                const [m, a] = (ref || '').split('/');
                return `${a || '0000'}${(m || '00').padStart(2, '0')}`;
            };
            const mensalidadesDoContrato = mensalidades.filter(m => m.contratoId === con.id).slice().sort((a, b) => chaveCompetenciaContrato(b.referencia).localeCompare(chaveCompetenciaContrato(a.referencia)));
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
            // de entidade (.rz-entity), chips e cards com rodapé único.
            // "Mais ações" abre sheet (abrirSheetAcoes); os painéis inline
            // #fc-mais-acoes e #fc-doc-acoes saíram. Nenhuma função de
            // negócio mudou — só quem as chama (verHistoricoContrato,
            // gerarMinutaContrato, excluirContrato, abrirCofreDocumentos,
            // abrirEdicaoFiadoresPopup…).
            // v1.X (A.6, ESP §7/REGRAS §10) — 5º chip "Renovação" (Resumo ·
            // Cobranças · Renovação · Partes · Anexos): contrato, mercado e
            // as 4 alternativas da ficha. Escopo reduzido (mesmo padrão da
            // A.3): "Pelo contrato" é 100% dado real (aluguel, índice
            // cadastrado, próximo aniversário calculado a partir de
            // con.inicio — nunca do padrão de âncora móvel já registrado
            // como bug na demanda a9488469); "Pelo mercado" fica em estado
            // vazio honesto (Fase de Indicadores do roadmap, mesma frase da
            // A.3 em resultados.js) — não existe indicador_series/valores
            // no banco pra estimar faixa/confiança/situação nem pra montar
            // o argumento de "Negociar acima do índice" (IA).
            const rs = (sem, txt) => (typeof renderStatus === 'function') ? renderStatus(sem, txt) : `<span class="rz-st rz-${sem}">${txt}</span>`;
            const vencidoFicha = contratoVencido(con), revisarFicha = contratoPrecisaRevisao(con);
            const statusFicha = vencidoFicha ? rs('bad', 'Vencido')
                : (con.status === 'Assinando' || contratoAguardandoAssinatura(con)) ? rs('run', 'Assinando')
                : revisarFicha ? rs('warn', 'Reajustar')
                : con.status === 'Ativo' ? rs('ok', 'Vigente')
                : con.status === 'Suspenso' ? rs('warn', 'Suspenso')
                : rs('neu', con.status === 'Finalizado' ? 'Encerrado' : (con.status || '—'));
            const enderecoCurto = imo ? `${imo.enderecoRua || ''}, ${imo.enderecoNum || ''}` : '—';
            // v1.23.0 (demanda d92a6dfc) — só pra exibir "Recebimento
            // esperado" no card Condições; mesma conta do formulário
            // (atualizarValorLiquidoEsperado, index.html).
            const fcAdmFicha = con.administradoraId ? (typeof administradoras !== 'undefined' ? administradoras.find(a => a.id === con.administradoraId) : null) : null;
            // CORRIGIDO (v1.7.0 — demanda 53ca281b, print do Nicola: 11/2026
            // e 12/2026 "Em atraso" sem terem vencido ainda): m.status ===
            // 'Inadimplente' cobre TANTO "pendente" (ainda não venceu)
            // QUANTO "atrasado" de verdade — mapStatusMensalidadeSupabaseParaAntigo()
            // (index.html) junta os dois no mesmo rótulo antigo de propósito
            // (é usado em outro lugar, tela de "Alterar status", pra decidir
            // se há pendência financeira nenhuma — aí "não pago" é a
            // pergunta certa). AQUI, pra exibição, o certo é a mesma
            // checagem de data que financeiro.js já usa (mensalidadeEmAtraso/
            // mensalidadeAVencer, index.html) — nunca reimplementada, só
            // reaproveitada.
            const atrasadas = mensalidadesDoContrato.filter(m => mensalidadeEmAtraso(m));
            const totalAtrasado = atrasadas.reduce((t, m) => t + (Number(m.valorConfirmado) || 0), 0);
            const ultimasSeis = mensalidadesDoContrato.slice(0, 6);
            const statusMensal = (m) => m.status === 'Pago' ? rs('ok', 'Pago') : mensalidadeEmAtraso(m) ? rs('bad', 'Em atraso') : rs('run', 'A receber');
            const iconeMensal = (m) => m.status === 'Pago' ? 'arrow-down-left' : mensalidadeEmAtraso(m) ? 'alarm-clock' : 'clock';
            const classeMensal = (m) => mensalidadeEmAtraso(m) ? ' rz-bad' : '';
            // CORRIGIDO v1.11.0 (18/09/2026, rodada 10 — achado do Nicola:
            // "seguir o mesmo padrão do chip financeiro do ativo: título na
            // 1ª linha, abaixo apenas a data sem label") — a linha de
            // mensalidade mostrava "Vencido"/"A vencer" como TEXTO quando
            // não havia m.dataPgto ainda gravada (mesma minoria de casos já
            // mapeada em financeiro.js v1.10.0), em vez de uma data de
            // verdade — e o status já está no badge à direita (statusMensal),
            // repetir em palavra na esquerda é o label redundante que o
            // Nicola pediu pra tirar. dataVencMensal() monta a data real a
            // partir de referencia (MM/YYYY) + vencimentoDia do contrato.
            const dataVencMensal = (m) => {
                if (m.dataPgto) return formatarDataBR(m.dataPgto);
                const p = (m.referencia || '').split('/');
                return p.length === 2 ? `${String(con.vencimentoDia || 15).padStart(2, '0')}/${p[0]}/${p[1]}` : '';
            };
            const abreArquivos = (con.status === 'Ativo' || con.status === 'Assinando');
            const irFinanceiro = `document.getElementById('men-filtro-imovel').value='${con.imovelId}'; document.getElementById('men-filtro-imovel-resumo').textContent='${(imo ? imo.empreendimento : '-').replace(/'/g, "")}'; switchTab('tab-mensal'); renderMensalidades();`;
            const kv = (r, v) => `<div><small>${r}</small><b>${v}</b></div>`;

            // v1.X (A.6) — aniversário do contrato = data de assinatura
            // (con.inicio) + 12 meses, repetido até cair no futuro. Âncora
            // FIXA, de propósito: nunca deriva do último evento de
            // histórico (esse é o padrão de âncora móvel já achado como bug
            // em fn_diario_contratos_aniversario_reajuste, demanda a9488469
            // — produção-sensível, fora do escopo desta entrega). Serve só
            // pra mostrar "em quantos dias" na Ficha; não alimenta nenhum
            // alerta nem substitui contratoPrecisaRevisao().
            let proxAniversarioStr = null, diasParaAniversario = null;
            if (con.inicio) {
                const inicioDt = new Date(con.inicio + 'T00:00:00');
                if (!isNaN(inicioDt)) {
                    const hojeSemHora = new Date(); hojeSemHora.setHours(0, 0, 0, 0);
                    const prox = new Date(inicioDt);
                    prox.setFullYear(prox.getFullYear() + 1);
                    while (prox <= hojeSemHora) prox.setFullYear(prox.getFullYear() + 1);
                    proxAniversarioStr = prox.toISOString().slice(0, 10);
                    diasParaAniversario = Math.round((prox - hojeSemHora) / 86400000);
                }
            }
            document.getElementById('ficha-contrato-conteudo').innerHTML = `
                <div class="rz-entity">
                    <div class="rz-ic"><svg data-lucide="${con.status === 'Assinando' ? 'file-signature' : 'file-text'}"></svg></div>
                    <div class="rz-tx"><b>${escapeHtmlSaidas(con.locatario || 'Locatário não informado')}</b><span>${escapeHtmlSaidas(enderecoCurto)} · ${formatarMoedaBR(con.valor)}/mês</span></div>
                    ${statusFicha}
                </div>
                <div class="rz-chips" id="fc-chips">
                    <button type="button" class="rz-chip rz-on" data-fc-chip="resumo" onclick="fcTrocarChip('resumo')">Resumo</button>
                    <button type="button" class="rz-chip ${atrasadas.length ? 'rz-warn' : ''}" data-fc-chip="cobrancas" onclick="fcTrocarChip('cobrancas')">Financeiro <span class="rz-n">${atrasadas.length}</span></button>
                    <button type="button" class="rz-chip" data-fc-chip="renovacao" onclick="fcTrocarChip('renovacao')">Reajuste</button>
                    <button type="button" class="rz-chip" data-fc-chip="partes" onclick="fcTrocarChip('partes')">Partes <span class="rz-n">${1 + fiadoresDaFicha.length}</span></button>
                    <button type="button" class="rz-chip" data-fc-chip="arquivos" onclick="fcTrocarChip('arquivos')">Anexos <span class="rz-n" id="fc-chip-n-arquivos">0</span></button>
                </div>

                <div class="fc-painel" id="fc-painel-resumo">
                    ${temAlertaFicha ? `
                    <div class="rz-card ${vencidoFicha ? 'rz-critico' : 'rz-atencao'}">
                        <div class="rz-card-h"><h3>Precisa de atenção</h3>${vencidoFicha ? rs('bad', 'Vencido') : rs('warn', con.status === 'Assinando' ? 'Assinatura' : 'Reajuste')}</div>
                        <p class="rz-desc">${vencidoFicha ? 'A vigência terminou e o contrato continua ativo.' : (con.status === 'Assinando' ? 'Aguardando revisão e assinatura.' : 'Reajuste ou revisão pendente pela regra do contrato.')}${con.status === 'Assinando' && !prontidaoFicha.pronto ? ` Minuta ainda indisponível — faltam ${prontidaoFicha.faltantes.length + prontidaoFicha.invalidos.length} dado(s).` : ''}</p>
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
                            ${fcAdmFicha ? kv('Recebimento esperado', `Bruto ${formatarMoedaBR(con.valor)} · taxa ${fcAdmFicha.taxaAdm || 0}% · líquido ${formatarMoedaBR(con.valor * (1 - (fcAdmFicha.taxaAdm || 0) / 100))}`) : ''}
                            ${kv('Imóvel', escapeHtmlSaidas(imo ? `${imo.empreendimento || ''} · ${enderecoCurto}` : '—'))}
                        </div>
                    </div>
                    <div class="rz-card" id="fc-card-ocorrencias">
                        <div class="rz-card-h"><h3>Ocorrências</h3><span class="rz-sub" id="fc-ocorrencias-status"></span><button type="button" onclick="abrirAcoesFichaContrato('${con.id}')" class="rz-more" aria-label="Mais ações"><svg data-lucide="ellipsis-vertical"></svg></button></div>
                        <div id="fc-ocorrencias">${rzSk('linhas', 2)}</div>
                    </div>
                    <!-- NOVO (19/09/2026, rodada 10, pedido explícito: "no chip
                         resumo de um contrato, deve aparecer a visão de
                         distribuição deste contrato abaixo de ocorrências.
                         Utilize o mesmo modelo que aparece nos ativos
                         (propriedade) na aba resumo") — mesmo markup
                         (.rz-card > .rz-card-h com h3+rz-sub+rz-more, lista em
                         .rz-row) do card "Propriedade" da ficha do ativo
                         (ativos-markup.js, montarPropriedadeAtivo em
                         cofre-ativos.js) — só a fonte de dado muda:
                         divisao_repasse_contrato (rateio do aluguel entre
                         proprietários), não propriedade_ativo (dono do bem).
                         montarDistribuicaoContrato() abaixo. -->
                    <div class="rz-card" id="fc-card-distribuicao">
                        <div class="rz-card-h"><h3>Distribuição</h3><span class="rz-sub">Rateio do aluguel entre proprietários</span><button type="button" onclick="abrirAcoesDistribuicaoContrato('${con.id}')" class="rz-more" aria-label="Mais ações"><svg data-lucide="ellipsis-vertical"></svg></button></div>
                        <div id="fc-distribuicao">${rzSk('linhas', 2)}</div>
                    </div>
                </div>

                <div class="fc-painel hidden" id="fc-painel-cobrancas">
                    <div class="rz-card ${atrasadas.length ? 'rz-critico' : ''}">
                        <div class="rz-card-h"><h3>Financeiro</h3>${atrasadas.length ? rs('bad', `${formatarMoedaBR(totalAtrasado)} em atraso`) : (ultimasSeis.length ? rs('ok', 'Em dia') : '')}<button type="button" onclick="abrirAcoesCobrancasContrato('${con.id}')" class="rz-more" aria-label="Mais ações"><svg data-lucide="ellipsis-vertical"></svg></button></div>
                        <!-- v1.116.0 (pedido explícito: "colocar no ⋮ a
                             opção de tratar aquele recebimento") — cada
                             linha ganhou ⋮ chamando rzAcoesMensalidade(),
                             a mesma sheet (Dar baixa/Recibo/Estornar/
                             Excluir) já usada em Financeiro › Recebimentos
                             (fatia 5); nenhuma lógica nova.
                             CORRIGIDO v1.116.0→18/09/2026 (rodada 8, "se
                             clicar nela, vai pra aba financeira") — a linha
                             inteira virou clicável, trocando pra Financeiro
                             antes de abrir a sheet.
                             CORRIGIDO DE NOVO v1.15.0 (demanda 44f30857,
                             item 3 — achado do Nicola, 21/09/2026: "Dar
                             baixa"/"Excluir" no ⋮ deveriam agir direto,
                             não navegar) — o fix de 18/09 foi longe demais:
                             fez até o ⋮ (que só deveria agir no lugar)
                             navegar, porque o clique nele borbulhava pro
                             onclick da linha. Agora o ⋮ tem handler PRÓPRIO
                             (event.stopPropagation() + rzAcoesMensalidade
                             direto, sem trocar de aba) — só o clique no
                             RESTO da linha (fora do ⋮) continua indo pra
                             Financeiro. rzAcoesMensalidade/as ações do
                             menu (Dar baixa/Excluir/Estornar) não dependem
                             de tab-mensal estar visível — leem/escrevem no
                             array global mensalidades, o mesmo em
                             qualquer aba. -->
                        ${ultimasSeis.length ? ultimasSeis.map(m => `
                        <div class="rz-row" onclick="switchTab('tab-mensal'); rzAcoesMensalidade('${m.id}')" style="cursor:pointer">
                            <div class="rz-ic${classeMensal(m)}"><svg data-lucide="${iconeMensal(m)}"></svg></div>
                            <div class="rz-tx"><b>${escapeHtmlSaidas(m.referencia || '—')}</b><span>${dataVencMensal(m)}</span></div>
                            <div class="rz-rt"><b>${formatarMoedaBR(m.valorConfirmado)}</b>${statusMensal(m)}</div>
                            <button type="button" class="rz-more" aria-label="Mais ações" onclick="event.stopPropagation(); rzAcoesMensalidade('${m.id}')"><svg data-lucide="ellipsis-vertical"></svg></button>
                        </div>`).join('') : `<div class="rz-empty"><div class="rz-ic"><svg data-lucide="wallet"></svg></div><p>Nenhum recebimento lançado ainda. Eles nascem na aba Financeiro a cada competência.</p></div>`}

                    </div>
                </div>

                <div class="fc-painel hidden" id="fc-painel-renovacao">
                    ${(diasParaAniversario !== null && diasParaAniversario <= 30) ? `
                    <div class="rz-card rz-atencao">
                        <div class="rz-card-h"><h3>Aniversário do contrato em ${diasParaAniversario <= 0 ? 'até hoje' : diasParaAniversario + (diasParaAniversario === 1 ? ' dia' : ' dias')}</h3>${rs('warn', 'Reajuste')}</div>
                        <p class="rz-desc" id="fc-reaj-alerta-texto" data-aniversario="${escapeHtmlSaidas(formatarDataBR(proxAniversarioStr))}">O contrato completa 12 meses em ${formatarDataBR(proxAniversarioStr)}. Pelo índice cadastrado${con.reajuste ? ' (' + escapeHtmlSaidas(con.reajuste) + ')' : ''}, a regra do contrato permite reajustar o aluguel a partir dessa data.</p>
                    </div>` : ''}
                    <div class="rz-card">
                        <div class="rz-card-h" style="justify-content:space-between"><h3>Pelo contrato</h3><button type="button" onclick="abrirInfoReajusteContrato()" class="text-slate-400" title="O que é isso?" aria-label="O que é isso?" style="line-height:0"><svg data-lucide="info" style="width:14px;height:14px"></svg></button></div>
                        <div class="rz-kv">
                            ${kv('Aluguel atual', `${formatarMoedaBR(con.valor)}/mês`)}
                            ${kv('Índice cadastrado', escapeHtmlSaidas(con.reajuste || '—'))}
                            ${kv('Próximo aniversário', proxAniversarioStr ? formatarDataBR(proxAniversarioStr) : '—')}
                            ${kv('Acumulado 12m', '<span id="fc-reaj-acumulado">—</span>')}
                            ${kv('Valor reajustado (estimado)', '<span id="fc-reaj-valor-estimado">—</span>')}
                        </div>
                        <p class="rz-desc" id="fc-reaj-memoria" style="margin-top:6px">Calculando pelo índice cadastrado...</p>
                    </div>
                    <div class="rz-card">
                        <div class="rz-card-h" style="justify-content:space-between"><h3>Pelo mercado</h3><span style="opacity:.6" title="Estimativa por IA">✨</span></div>
                        <div class="rz-empty" style="padding:14px 8px">
                            <div class="rz-ic"><svg data-lucide="line-chart"></svg></div>
                            <p>Faixa estimada, confiança e situação de mercado ainda não foram construídas — item separado do roadmap (não depende só dos índices já capturados do Banco Central, precisa de uma fonte de imóveis comparáveis).</p>
                        </div>
                    </div>
                    <!-- v1.31.0 — "Pelo mercado" antes da Linha do tempo; card "O que você pode fazer" removido (pedido do Nicola 01/10). -->
                    <!-- v1.27.0 (Bloco B, demandas 5ca973d6/854f6343) — linha do
                         tempo de reajuste e revisão: lê fn_contrato_itens_controle_listar
                         (itens cofre_itens_controle com contrato_id, subtipo
                         reajuste_contrato/revisional_contrato, + ocorrências
                         passadas e futuras). Cada ocorrência em aberto é
                         clicável e abre o mesmo sheet de "Aplicar o reajuste
                         contratual" (lancarReajusteContrato), agora levando a
                         ocorrência (fecha ela via fn_contrato_reajustar
                         p_ocorrencia_id, em vez de criar um lançamento avulso).
                         Contratos sem periodicidade configurada (a maioria
                         hoje — sem backfill, pedido explícito do Nicola)
                         simplesmente não têm item aqui; card mostra vazio. -->
                    <div class="rz-card" id="fc-card-itens-controle">
                        <div class="rz-card-h"><h3>Linha do tempo</h3><span class="rz-sub">Reajuste e revisão</span></div>
                        <div id="fc-itens-controle">${rzSk('linhas', 2)}</div>
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
                        <!-- v1.21.0 (demanda 3cc64651, pedido explícito do Nicola
                             23/09/2026: "ainda nao permite o clique na parte...
                             ao editar locatario ou parte ainda mostra tela de
                             transicao") — linha volta a ser clicável e abre o
                             FORMULÁRIO da parte direto (sem o ⋮ no meio); o ⋮
                             continua, com Editar + Adicionar parte. -->
                        <div class="rz-row rz-link" onclick="abrirEditarLocatarioContrato('${con.id}')">
                            <div class="rz-ic"><svg data-lucide="user"></svg></div>
                            <div class="rz-tx"><b>${escapeHtmlSaidas(con.locatario || 'Locatário não informado')}</b><span>Locatário${con.cpf ? ' · ' + escapeHtmlSaidas((con.docTipo || 'CPF') + ' ' + con.cpf) : ''}</span></div>
                            <button type="button" onclick="event.stopPropagation(); abrirAcoesLocatarioContrato('${con.id}')" class="rz-more" aria-label="Mais ações"><svg data-lucide="ellipsis-vertical"></svg></button>
                        </div>
                        ${fiadoresDaFicha.length ? fiadoresDaFicha.map((f, iFiador) => `
                        <div class="rz-row rz-link" onclick="abrirFormFiadorContrato('${con.id}', ${iFiador})">
                            <div class="rz-ic"><svg data-lucide="shield-check"></svg></div>
                            <div class="rz-tx"><b>${(f.nome || '').replace(/</g, '&lt;')}</b><span>Fiador · ${f.doc_tipo || 'CPF'} ${f.cpf || ''}${f.estado_civil ? ' · ' + f.estado_civil : ''}${f.possui_imovel_proprio ? ' · imóvel em garantia' : ''}</span></div>
                            <button type="button" onclick="event.stopPropagation(); abrirAcoesFiadorContrato('${con.id}', ${iFiador})" class="rz-more" aria-label="Mais ações"><svg data-lucide="ellipsis-vertical"></svg></button>
                        </div>`).join('') : `<div class="rz-empty" style="padding-top:8px"><p>Nenhum fiador. Adicione se a minuta exigir.</p></div>`}
                        <div id="fc-partes-encerrados"></div>

                    </div>
                </div>

                <div class="fc-painel hidden" id="fc-painel-arquivos">
                    <div class="rz-chips" id="fc-anexos-chips"></div>
                    <div class="rz-card">
                        <div class="rz-card-h"><h3 id="fc-anexos-titulo">Anexos</h3><span class="rz-sub" id="fc-anexos-sub"></span>${abreArquivos ? `<button type="button" onclick="abrirAcoesAnexosContrato('${con.id}')" class="rz-more" aria-label="Mais ações"><svg data-lucide="ellipsis-vertical"></svg></button>` : ''}</div>
                        ${abreArquivos
                            ? `<div id="fc-documentos">${rzSk('linhas', 2)}</div>`
                            : `<div class="rz-empty"><div class="rz-ic"><svg data-lucide="archive"></svg></div><p>Contrato encerrado: os documentos ficam guardados no Cofre.</p></div>`}
                    </div>
                </div>`;
            const btnVoltar = document.getElementById('fc-voltar');
            if (btnVoltar) btnVoltar.innerHTML = `<svg data-lucide="chevron-left"></svg> ${window.fichaContratoOrigem?.tipo === 'ativo' ? 'Ativo' : 'Contratos'}`;
            switchTab('tab-contrato-ficha');
            if (typeof lucide !== 'undefined') lucide.createIcons();
            if (abreArquivos) montarDocumentosContrato(con.id);
            montarOcorrenciasContrato(con.id); // v1.1.0 — A.10
            montarPartesEncerradasContrato(con.id); // v1.43.0 — demanda b94ef7d5
            montarDistribuicaoContrato(con.id); // NOVO (19/09/2026, rodada 10)
            montarSimulacaoReajusteContrato(con.id); // v1.14.0 (B1.2)
            montarItensControleContrato(con.id); // v1.27.0 (Bloco B)
        }

        // NOVO (19/09/2026, rodada 10, pedido explícito: "visão de
        // distribuição deste contrato abaixo de ocorrências... mesmo modelo
        // que aparece nos ativos (propriedade) na aba resumo") — mesma
        // fonte que montarChipsPartesContrato() (acima, popup antigo
        // "Detalhes do Contrato") já lê, divisao_repasse_contrato, mas
        // renderizada como .rz-row (ícone + nome + %), igual a
        // montarPropriedadeAtivo() (cofre-ativos.js) — não como pill/chip,
        // que era o formato do popup antigo. Não duplica escrita nenhuma —
        // a divisão continua editável só pelo formulário de Editar contrato
        // (exibirDivisaoImovelNoContrato), que já existe; ⋮ deste card
        // (abrirAcoesDistribuicaoContrato, abaixo) só abre um atalho pra lá.
        export async function montarDistribuicaoContrato(contratoId) {
            const el = document.getElementById('fc-distribuicao');
            if (!el || fichaContratoAtualId !== contratoId) return;
            try {
                const { data, error } = await dbAuth.from('divisao_repasse_contrato')
                    .select('nome_externo, percentual, pessoas(nome)')
                    .eq('contrato_id', contratoId);
                if (error) throw error;
                const linhas = data || [];
                if (!linhas.length) {
                    el.innerHTML = `<div class="rz-empty"><div class="rz-ic"><svg data-lucide="users"></svg></div><p>Sem divisão cadastrada ainda. Sem ela, o aluguel recebido não sabe pra quem repassar.</p></div>`;
                } else {
                    el.innerHTML = linhas.map(l => {
                        const nome = l.pessoas?.nome || l.nome_externo || 'Sem nome';
                        return `<div class="rz-row">
                            <div class="rz-ic"><svg data-lucide="${l.pessoas?.nome ? 'user' : 'user-round'}"></svg></div>
                            <div class="rz-tx"><b>${escapeHtmlSaidas(nome)}</b><span>${l.pessoas?.nome ? 'Sócio' : 'Parte externa'}</span></div>
                            <div class="rz-rt"><b style="color:var(--sprout)">${Number(l.percentual)}%</b></div>
                        </div>`;
                    }).join('');
                }
                if (typeof lucide !== 'undefined') lucide.createIcons();
            } catch (err) {
                el.innerHTML = `<p class="text-xs text-red-500">Não consegui carregar a distribuição.</p>`;
                console.warn('Falha ao carregar distribuição do contrato (não bloqueando):', err.message);
            }
        }

        // v1.15.0 (demanda 44f30857, item 4) — CORRIGIDO: "Editar divisão"
        // abria o formulário INTEIRO de editar contrato (editarContrato),
        // só pra chegar numa seção de rateio no meio de um form gigante —
        // achado do Nicola em revisão de tela. Passa a abrir DIRETO o popup
        // "Alterações" de divisão societária (abrirAlteracoesDivisaoSocietaria,
        // index.html) — o MESMO popup que a ficha do imóvel já usa pro card
        // "Divisão Societária" ("nos moldes da tela de rateio de propriedade
        // do imóvel"), sem duplicar formulário nenhum. O popup mostra as 2
        // seções (Divisão do Imóvel e Divisão do Contrato) — mantido assim de
        // propósito: deixa claro que são 2 rateios distintos, e quem entra
        // pela ficha do contrato pode querer ajustar os dois.
        export function abrirAcoesDistribuicaoContrato(contratoId) {
            const con = contratos.find(c => c.id === contratoId);
            if (!con || typeof abrirSheetAcoes !== 'function') return;
            abrirSheetAcoes({ titulo: 'Distribuição', sub: con.locatario || '', acoes: [
                { icone: 'pencil', titulo: 'Editar divisão', codigo: 'contratos.editar', sub: 'Sócios, percentuais e partes externas', aoTocar: () => {
                    if (typeof abrirAlteracoesDivisaoSocietaria === 'function') abrirAlteracoesDivisaoSocietaria(con.imovelId, con.id);
                    else editarContrato(con.id); // fallback defensivo, não deveria acontecer em produção
                } },
            ] });
        }

        // ===================================================================
        // v1.14.0 (B1.2, PLANO_IMPLEMENTACAO_RESULTADOS_MERCADO_FISCAL v2.0.0,
        // migration mercado_reajuste_simulador_v1) — chip Renovação › "Pelo
        // contrato": Acumulado 12m / Valor reajustado (estimado) saem do "—"
        // fixo e passam a chamar fn_simular_reajuste_contrato, sempre pelo
        // ÍNDICE CADASTRADO no contrato (nunca o mais favorável — ESP §13.5
        // C3). É só simulação: quem aplica de verdade é fn_contrato_reajustar
        // (A.6, ação "Aplicar o reajuste contratual" — nível 1, único da
        // tela). Fora do escopo aqui: "Pelo mercado" (faixa/confiança/
        // situação) e "Negociar acima do índice" — dependem de imóvel
        // comparável, que ainda não existe (ideia registrada em separado,
        // demanda 1afb0d06).
        // ===================================================================
        function fmtSinalPctContrato(v) {
            if (v == null) return null;
            const n = Number(v);
            return (n >= 0 ? '+' : '') + n.toFixed(2).replace('.', ',') + '%';
        }

        export async function montarSimulacaoReajusteContrato(contratoId) {
            const elAcumulado = document.getElementById('fc-reaj-acumulado');
            const elValor = document.getElementById('fc-reaj-valor-estimado');
            const elMemoria = document.getElementById('fc-reaj-memoria');
            const elAlerta = document.getElementById('fc-reaj-alerta-texto');
            if (!elAcumulado || fichaContratoAtualId !== contratoId) return;
            try {
                const { data, error } = await dbAuth.rpc('fn_simular_reajuste_contrato', { p_contrato_id: contratoId });
                if (error) throw error;
                const sim = Array.isArray(data) ? data[0] : data;
                if (!sim) return;

                elAcumulado.textContent = fmtSinalPctContrato(sim.acumulado_12m_pct) || '—';
                elValor.textContent = sim.valor_reajustado != null ? formatarMoedaBR(sim.valor_reajustado) : '—';

                // Memória de cálculo aberta — mesmo padrão de transparência já
                // usado na revisão de valor do ativo (R.4): mostra o texto que
                // a própria função devolveu, nunca reconstrói o raciocínio
                // em JS (a explicação vive na função, não duplicada aqui).
                if (elMemoria) {
                    const linhas = Array.isArray(sim.memoria_calculo) ? sim.memoria_calculo : [];
                    if (linhas.length) { elMemoria.textContent = linhas.join(' '); elMemoria.style.display = ''; }
                    else { elMemoria.style.display = 'none'; }
                }

                // Card de atenção (aniversário ≤30 dias): completa a leitura
                // da IA com o número simulado ("...o aluguel vai de X para
                // Y"), mesma frase do mockup (ESP §7) — sem citar "faixa
                // estimada de mercado", que não faz parte desta entrega.
                if (elAlerta && sim.acumulado_12m_pct != null && sim.valor_reajustado != null) {
                    const dataAniversario = elAlerta.dataset.aniversario || '';
                    const indiceRotulo = sim.indice_nome ? sim.indice_nome.split(' — ')[0] : (sim.indice_texto_cadastrado || '');
                    elAlerta.textContent = `O contrato completa 12 meses em ${dataAniversario}. Pelo índice cadastrado (${indiceRotulo}), o aluguel vai de ${formatarMoedaBR(sim.valor_atual)} para ${formatarMoedaBR(sim.valor_reajustado)}.`;
                }
            } catch (err) {
                if (elMemoria) elMemoria.textContent = 'Não consegui simular o reajuste agora.';
                console.warn('Falha ao simular reajuste do contrato (não bloqueando):', err.message);
            }
        }

        // v1.27.0 (Bloco B, demandas 5ca973d6/854f6343, 30/09/2026, pedido
        // explícito do Nicola: "arrume uma forma de listar as ocorrências de
        // reajustes e de revisionais... permitindo que dali se execute as
        // funcoes de reajuste. O mesmo pra revisionais") — card "Linha do
        // tempo" do chip Renovação: lista os itens de controle de reajuste
        // e revisional do contrato (fn_contrato_itens_controle_listar) com
        // suas ocorrências passadas (concluídas) e futuras (em aberto);
        // clicar numa ocorrência em aberto abre o mesmo sheet de reajuste
        // (lancarReajusteContrato), agora levando o id da ocorrência —
        // fecha ELA (fn_contrato_reajustar p_ocorrencia_id) em vez de criar
        // um lançamento avulso novo. Não depende de con.* (mapeamento em
        // index.html) — lê tudo direto da RPC, por isso não precisa esperar
        // os campos novos do formulário (index.html, entrega separada).
        export async function montarItensControleContrato(contratoId) {
            const el = document.getElementById('fc-itens-controle');
            if (!el || fichaContratoAtualId !== contratoId) return;
            try {
                const { data, error } = await dbAuth.rpc('fn_contrato_itens_controle_listar', { p_contrato_id: contratoId });
                if (error) throw error;
                const linhas = data || [];
                if (!linhas.length) {
                    el.innerHTML = `<div class="rz-empty"><div class="rz-ic"><svg data-lucide="calendar-clock"></svg></div><p>Sem reajuste ou revisão parametrizados neste contrato ainda.</p></div>`;
                    return;
                }
                const rotuloTipo = codigo => codigo === 'revisional_contrato' ? 'Revisional' : 'Reajuste';
                const iconeTipo = codigo => codigo === 'revisional_contrato' ? 'scale' : 'trending-up';
                // v1.29.0 — rs() local (antes só existia dentro de abrirFichaContrato → ReferenceError aqui)
                const rs = (sem, txt) => (typeof renderStatus === 'function') ? renderStatus(sem, txt) : `<span class="rz-st rz-${sem}">${txt}</span>`;
                el.innerHTML = linhas.map(l => {
                    const statusBadge = l.status_execucao === 'concluido' ? rs('ok', 'Concluído')
                        : l.status_execucao === 'cancelado' ? rs('neu', 'Cancelado')
                        : l.status_execucao === 'aberto' ? rs('run', 'Em aberto')
                        : '';
                    const dataTxt = l.data_prevista ? formatarDataBR(l.data_prevista) : '—';
                    const pctTxt = l.percentual_reajuste != null ? ' · ' + fmtSinalPctContrato(l.percentual_reajuste) : '';
                    const emAssinaturaLt = (contratos.find(c => c.id === contratoId) || {}).status === 'Assinando'; // v1.32.0
                    const clicavel = l.status_execucao === 'aberto' && !!l.ocorrencia_id && !emAssinaturaLt;
                    return `<div class="rz-row${clicavel ? ' rz-link' : ''}"${clicavel ? ` onclick="lancarReajusteContrato('${contratoId}', '${l.ocorrencia_id}', '${l.subtipo_codigo}')"` : ''}>
                        <div class="rz-ic"><svg data-lucide="${iconeTipo(l.subtipo_codigo)}"></svg></div>
                        <div class="rz-tx"><b>${rotuloTipo(l.subtipo_codigo)}</b><span>${dataTxt}${pctTxt}</span></div>
                        <div class="rz-rt">${statusBadge}${clicavel ? '<svg data-lucide="chevron-right" class="rz-chev"></svg>' : ''}</div>
                    </div>`;
                }).join('');
                if (typeof lucide !== 'undefined') lucide.createIcons();
            } catch (err) {
                el.innerHTML = `<p class="text-xs text-red-500">Não consegui carregar reajuste/revisão.</p>`;
                console.warn('Falha ao carregar itens de controle do contrato (não bloqueando):', err.message);
            }
        }

        // v1.15.0 (demanda 44f30857, item 2 — achado do Nicola: "chip
        // Reajuste (tela do contrato)... incluir um botão/ícone 'i'
        // explicando as métricas exibidas") — mesmo padrão das info-sheets
        // já usadas em resultados.js (abrirInfoReajustes etc.): abrirSheet/
        // rzSheetCabecalho são globais do app principal, acessíveis daqui
        // sem import (mesma razão de dbAuth/mostrarToast já serem usados
        // livremente neste arquivo).
        export function abrirInfoReajusteContrato() {
            const itens = [
                ['Aluguel atual', 'O valor de aluguel cadastrado neste contrato hoje.'],
                ['Índice cadastrado', 'O índice de reajuste escrito no contrato (texto livre, ex.: "IPCA", "IGP-M") — o simulador só reconhece IPCA, IGP-M, INCC-DI, IVG-R, Selic e CDI.'],
                ['Próximo aniversário', 'A data em que o contrato completa 12 meses e a regra contratual permite reajustar.'],
                ['Acumulado 12m', 'A variação do índice cadastrado nos últimos 12 meses capturados (fonte: Banco Central) — sempre o mesmo índice do contrato, nunca outro mais favorável.'],
                ['Valor reajustado (estimado)', 'Aluguel atual × (1 + acumulado 12m). É uma simulação — só é aplicado de verdade quando você confirma "Aplicar o reajuste contratual".'],
            ];
            abrirSheet(rzSheetCabecalho('Sobre o card "Pelo contrato"') +
                `<div class="rz-sh-b"><div class="rz-card"><div class="rz-kv">${
                    itens.map(([r, v]) => `<div class="rz-full"><small>${rzEsc(r)}</small><b style="font-weight:500;font-size:12.5px">${rzEsc(v)}</b></div>`).join('')
                }</div></div></div>`);
        }

        // v1.24.0 (demanda 1163097a) — mesmo padrão acima, pro campo
        // "Aluguel Antecipado?" do formulário de contrato.
        export function abrirInfoAluguelAntecipado() {
            const itens = [
                ['O que é', 'Define se o aluguel deste contrato é pago DENTRO do mês de referência (antecipado) ou no mês seguinte.'],
                ['Sim', 'O inquilino paga a competência do próprio mês ainda dentro dele.'],
                ['Não', 'Paga a competência do mês anterior — modelo mais comum no mercado.'],
            ];
            abrirSheet(rzSheetCabecalho('Sobre o Aluguel Antecipado') +
                `<div class="rz-sh-b"><div class="rz-card"><div class="rz-kv">${
                    itens.map(([r, v]) => `<div class="rz-full"><small>${rzEsc(r)}</small><b style="font-weight:500;font-size:12.5px">${rzEsc(v)}</b></div>`).join('')
                }</div></div></div>`);
        }

        // v1.24.0 (demanda 1163097a) — mesmo padrão, pro campo "Desconto
        // Energia (%)".
        export function abrirInfoDescontoEnergia() {
            const itens = [
                ['O que é', 'Percentual de desconto sobre o aluguel repassado ao inquilino quando o imóvel participa do programa de energia por assinatura.'],
                ['Sugestão automática', 'Ao escolher, num contrato novo, um imóvel com esse programa ativo, o campo já vem com 10% — pode ajustar livremente.'],
                ['Onde entra', 'Compõe o cálculo do valor líquido esperado do contrato.'],
            ];
            abrirSheet(rzSheetCabecalho('Sobre o Desconto de Energia') +
                `<div class="rz-sh-b"><div class="rz-card"><div class="rz-kv">${
                    itens.map(([r, v]) => `<div class="rz-full"><small>${rzEsc(r)}</small><b style="font-weight:500;font-size:12.5px">${rzEsc(v)}</b></div>`).join('')
                }</div></div></div>`);
        }

        // v1.24.0 (demanda c0d255e3) — "+" de Contratos: mesma escolha do
        // "+" de Ativos (abrir-acoes-ativos, cofre-app.js) — Carregar
        // documento (IA) primeiro, cadastro manual depois. Reaproveita
        // abrirSheetAcoes/abrirUploadDocumentoNoApp (globais do app
        // principal, index.html), sem import — mesma razão de
        // abrirSheet/rzSheetCabecalho acima.
        // v1.28.0 (demanda 11afd25f / c0d255e3, pedido do Nicola: "falta atalho
        // de novo contrato no ativo") — aceita o imóvel opcional. Com imóvel,
        // "Novo contrato" já abre com ele escolhido (e com o contrato
        // Assinando, se o interessado já preencheu pelo link) e entra a
        // terceira opção, coleta de dados por link/WhatsApp e minuta — que
        // deixou de oferecer "Dados novo contrato" lá dentro (vitrine.js
        // 1.2.2): a escolha é feita aqui, um passo antes.
        export function abrirEscolhaNovoContrato(imovelId) {
            const comImovel = typeof imovelId === 'string' && imovelId;
            const abrirManual = () => comImovel ? criarContratoParaImovel(imovelId) : abrirFormularioContrato();
            if (typeof abrirSheetAcoes !== 'function') { abrirManual(); return; }
            const acoes = [
                { icone: 'sparkles', tipo: 'ia', titulo: 'Carregar documento', codigo: 'cofre.upload', sub: 'A IA classifica e sugere o vínculo', aoTocar: () => (typeof abrirUploadDocumentoNoApp === 'function') && abrirUploadDocumentoNoApp() },
                { icone: 'plus', titulo: 'Novo contrato', codigo: 'contratos.criar', sub: comImovel ? 'Formulário já com este imóvel' : 'Preencher os dados na tela', aoTocar: abrirManual },
            ];
            // v1.41.0 (D2) — configuração inicial também a partir de Contratos.
            if (!comImovel && typeof abrirConfiguracaoInicial === 'function') {
                acoes.splice(1, 0, { icone: 'list-checks', tipo: 'ia', titulo: 'Configuração inicial', codigo: 'cofre.configuracao_inicial', sub: 'Mande os contratos e documentos que você já tem', aoTocar: () => abrirConfiguracaoInicial() });
            }
            if (comImovel && typeof iniciarProcessoContratacao === 'function') {
                acoes.push({ icone: 'link', titulo: 'Coletar dados do locatário', codigo: 'contratos.criar', sub: 'Link, WhatsApp e minuta', aoTocar: () => iniciarProcessoContratacao(imovelId) });
            }
            abrirSheetAcoes({ titulo: 'Novo contrato', sub: 'Como você quer cadastrar?', acoes });
        }

        // ===================================================================
        // v1.1.0 — A.10: card "Ocorrências" do contrato + Renovar contrato
        // ===================================================================
        let ocorrenciasContratoAtual = []; // cache da ficha aberta (pra sheet de ações)

        const OC_CONTRATO_ROTULO = { prevista: 'Prevista', revisional: 'Revisional', renovacao: 'Renovação', reajuste: 'Reajuste', sinistro: 'Sinistro', alteracao: 'Alteração', assinatura: 'Assinatura', anexo: 'Anexo', nota: 'Anotação', documento: 'Documento', pagamento: 'Pagamento', servico: 'Serviço', uso: 'Uso' };
        const OC_CONTRATO_ICONE = { prevista: 'calendar-clock', revisional: 'calendar-clock', renovacao: 'refresh-cw', reajuste: 'trending-up', sinistro: 'triangle-alert', alteracao: 'pencil', assinatura: 'file-signature', anexo: 'paperclip', nota: 'sticky-note', documento: 'file-text', pagamento: 'banknote', servico: 'wrench', uso: 'gauge' };
        const LIMITE_OCORRENCIAS_CARD = 8;

        export async function montarOcorrenciasContrato(contratoId) {
            const el = document.getElementById('fc-ocorrencias');
            const elSt = document.getElementById('fc-ocorrencias-status');
            if (!el || fichaContratoAtualId !== contratoId) return;
            try {
                const { data, error } = await dbAuth.from('cofre_ocorrencias_controle')
                    .select('id, tipo, status_execucao, data_prevista_atual, tratamento_descricao, valor_a_receber, receber_ate, percentual_reajuste, documento_id, criado_em')
                    .eq('contrato_id', contratoId);
                if (error) throw error;
                const todas = data || [];
                const abertas = todas.filter(o => o.status_execucao === 'aberto').sort((a, b) => (a.data_prevista_atual || '').localeCompare(b.data_prevista_atual || ''));
                const fechadas = todas.filter(o => o.status_execucao !== 'aberto').sort((a, b) => (b.data_prevista_atual || '').localeCompare(a.data_prevista_atual || '') || (b.criado_em || '').localeCompare(a.criado_em || ''));
                ocorrenciasContratoAtual = todas;
                if (elSt) elSt.innerHTML = todas.length ? `${abertas.length} em aberto · ${fechadas.length} registrada${fechadas.length === 1 ? '' : 's'}` : '';
                if (!todas.length) {
                    el.innerHTML = `<div class="rz-empty"><div class="rz-ic"><svg data-lucide="calendar-check"></svg></div><p>Nada registrado ainda. Reajustes, renovações e alterações aparecem aqui.</p></div>`;
                } else {
                    // v1.6.0 (pedido explícito, 16/09/2026) — 3 mudanças neste card:
                    // (1) o chip colorido (rz-rt/renderStatus) saiu — esse padrão é
                    //     de alertas/status, e aqui só repetia o rótulo que já está
                    //     no texto+ícone; urgência (vencido/vence em Xd) virou parte
                    //     do subtítulo, não desaparece; (2) TODA linha ficou clicável
                    //     (antes só as abertas) — fechada/cancelada abre um resumo
                    //     só-leitura em vez de nada; (3) "Ver tudo"/Histórico saiu —
                    //     a ocorrência já É o histórico, o link duplicava.
                    const linhas = [...abertas, ...fechadas].slice(0, LIMITE_OCORRENCIAS_CARD).map(oc => {
                        const aberta = oc.status_execucao === 'aberto';
                        const rot = OC_CONTRATO_ROTULO[oc.tipo] || rzEsc(oc.tipo || 'Ocorrência');
                        const ic = OC_CONTRATO_ICONE[oc.tipo] || 'circle-dot';
                        let cls = '', urgencia = '';
                        if (aberta) {
                            const dias = Math.round((new Date(oc.data_prevista_atual + 'T00:00:00') - new Date(new Date().toDateString())) / 86400000);
                            if (dias < 0) { urgencia = `há ${Math.abs(dias)}d`; cls = ' rz-bad'; }
                            else if (dias === 0) { urgencia = 'Vence hoje'; cls = ' rz-warn'; }
                            // CORRIGIDO v1.8.0 (padrão "há/em xx d") — mesma correção da
                            // rodada em cofre-ativos.js/cofre-controles.js: prazo ainda
                            // não vencido usa "Em Xd", não o número cru.
                            else if (dias <= 30) { urgencia = `Em ${dias}d`; cls = ''; }
                        } else if (oc.status_execucao === 'cancelado') { urgencia = 'Cancelada'; cls = ' rz-neu'; }
                        const titulo = aberta ? `${rot} · vence ${formatarDataBR(oc.data_prevista_atual)}` : `${rot} · ${formatarDataBR(oc.data_prevista_atual)}`;
                        const desc = [urgencia, oc.tratamento_descricao ? rzEsc(oc.tratamento_descricao) : ''].filter(Boolean).join(' · ')
                            || (aberta ? 'Toque pra tratar ou reagendar' : '');
                        return `<div class="rz-row rz-row-oc rz-link" onclick="abrirOcorrenciaContrato('${oc.id}')">
                            <div class="rz-ic${cls}"><svg data-lucide="${ic}"></svg></div>
                            <div class="rz-tx"><b>${titulo}</b><span>${desc}</span></div>
                            <svg data-lucide="${aberta ? 'ellipsis-vertical' : 'chevron-right'}" class="rz-chev"></svg>
                        </div>`;
                    }).join('');
                    el.innerHTML = linhas;
                }
            } catch (err) {
                el.innerHTML = `<p class="rz-desc">Não consegui carregar as ocorrências: ${rzEsc(err.message || String(err))}</p>`;
            }
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        // v1.6.0 (pedido explícito, 16/09/2026) — despacha o clique de
        // qualquer linha de ocorrência: aberta continua abrindo o menu de
        // ações (Dar baixa/Reagendar/Renovar); fechada/cancelada abre um
        // resumo só-leitura (abrirDetalheOcorrenciaContrato) — antes não
        // fazia nada ao tocar.
        export function abrirOcorrenciaContrato(ocorrenciaId) {
            const oc = ocorrenciasContratoAtual.find(o => o.id === ocorrenciaId);
            if (!oc) return;
            if (oc.status_execucao === 'aberto') { abrirAcoesOcorrenciaContrato(ocorrenciaId); return; }
            abrirDetalheOcorrenciaContrato(ocorrenciaId);
        }

        // v1.15.0 (demanda 44f30857, item 5) — CORRIGIDO: achado do Nicola
        // clicando numa ocorrência já concluída (ex. tipo "Assinatura") —
        // o campo Descrição (texto livre, pode ser longo) dividia a mesma
        // grade de 2 colunas dos campos curtos (Tipo, Status, datas...),
        // então ficava espremido numa metade da linha. Mesma classe .rz-full
        // que .rz-kv já define pra isso (grid-column:1/-1) — reaproveitada,
        // não um componente novo — só faltava marcar a linha da Descrição.
        export function abrirDetalheOcorrenciaContrato(ocorrenciaId) {
            const oc = ocorrenciasContratoAtual.find(o => o.id === ocorrenciaId);
            if (!oc) return;
            const con = contratos.find(c => c.id === fichaContratoAtualId);
            const rot = OC_CONTRATO_ROTULO[oc.tipo] || oc.tipo;
            const statusLabel = oc.status_execucao === 'cancelado' ? 'Cancelada' : 'Concluída';
            const linhas = [
                ['Tipo', rot],
                ['Status', statusLabel],
                ['Data prevista', formatarDataBR(oc.data_prevista_atual)],
                ['Registrada em', formatarDataBR((oc.criado_em || '').slice(0, 10))],
                oc.valor_a_receber ? ['Valor', formatarMoedaBR(oc.valor_a_receber)] : null,
                oc.percentual_reajuste ? ['% de reajuste', `${oc.percentual_reajuste}%`] : null,
                oc.receber_ate ? ['A receber até', formatarDataBR(oc.receber_ate)] : null,
                oc.tratamento_descricao ? ['Descrição', oc.tratamento_descricao, true] : null,
            ].filter(Boolean);
            const corpo = `<div class="rz-kv">${linhas.map(([r, v, cheio]) => `<div${cheio ? ' class="rz-full"' : ''}><small>${rzEsc(r)}</small><b>${rzEsc(String(v))}</b></div>`).join('')}</div>`;
            abrirSheetForm({ titulo: rot, sub: con?.locatario || '', corpo, semRodape: true });
        }

        export function abrirAcoesOcorrenciaContrato(ocorrenciaId) {
            const oc = ocorrenciasContratoAtual.find(o => o.id === ocorrenciaId);
            if (!oc || oc.status_execucao !== 'aberto') return;
            const con = contratos.find(c => c.id === fichaContratoAtualId);
            const rot = OC_CONTRATO_ROTULO[oc.tipo] || oc.tipo;
            const sub = `${con?.locatario || ''} · vence ${formatarDataBR(oc.data_prevista_atual)}`;
            const acoes = [
                { icone: 'check', titulo: 'Dar baixa', codigo: 'cofre.ocorrencias.tratar', sub: 'Marca como tratada, com descrição opcional', aoTocar: () => abrirSheetForm({ titulo: 'Dar baixa', sub, rotuloSalvar: 'Confirmar baixa',
                    corpo: `<div class="rz-f"><label>Descrição da baixa</label><textarea id="occ-baixa-descricao" rows="3" placeholder="Opcional — o que foi feito, com quem, valor"></textarea></div>`,
                    aoSalvar: () => { salvarBaixaOcorrenciaContrato(oc.id); return false; } }) },
                { icone: 'calendar', titulo: 'Reagendar', codigo: 'cofre.ocorrencias.reagendar', sub: 'Muda a data prevista', aoTocar: () => abrirSheetForm({ titulo: 'Reagendar', sub, rotuloSalvar: 'Confirmar novo prazo',
                    corpo: `<div class="rz-f"><label>Nova data prevista <i>*</i></label><input type="date" id="occ-reagendar-data" value="${oc.data_prevista_atual}"></div>`,
                    aoSalvar: () => { salvarReagendarOcorrenciaContrato(oc.id); return false; } }) },
            ];
            if (oc.tipo === 'renovacao' || oc.tipo === 'revisional') acoes.unshift({ icone: 'refresh-cw', titulo: 'Renovar contrato', codigo: 'contratos.estender', sub: 'Novo fim, valor e documento — baixa esta ocorrência', aoTocar: () => renovarContrato(fichaContratoAtualId, oc.id) });
            abrirSheetAcoes({ titulo: `${rot} · ${formatarDataBR(oc.data_prevista_atual)}`, sub: con?.locatario || 'Contrato', acoes });
        }

        export async function salvarBaixaOcorrenciaContrato(ocorrenciaId) {
            const descricao = document.getElementById('occ-baixa-descricao')?.value.trim() || null;
            mostrarCarregamentoGlobal('Dando baixa...');
            try {
                const { error } = await dbAuth.from('cofre_ocorrencias_controle').update({
                    status_execucao: 'concluido', tratado_em: new Date().toISOString(), tratado_por: pessoaIdLogada || null, tratamento_descricao: descricao,
                }).eq('id', ocorrenciaId);
                if (error) throw error;
                emitirEscrita('contrato', { id: fichaContratoAtualId, ocorrenciaId, acao: 'baixa-ocorrencia' }); // v1.18.0 — Fase 1 do wrapper de escrita
                esconderCarregamentoGlobal(); fecharSheet(); mostrarToast('Baixa registrada!', 'success');
                registrarLog('cofre.ocorrencias.tratar', { ocorrenciaId, contratoId: fichaContratoAtualId });
                montarOcorrenciasContrato(fichaContratoAtualId);
            } catch (err) { esconderCarregamentoGlobal(); mostrarToast('Não consegui dar baixa: ' + (err.message || String(err)), 'danger'); }
        }

        export async function salvarReagendarOcorrenciaContrato(ocorrenciaId) {
            const data = document.getElementById('occ-reagendar-data')?.value;
            if (!data) { mostrarToast('Informe a nova data.', 'danger'); return; }
            mostrarCarregamentoGlobal('Reagendando...');
            try {
                const { error } = await dbAuth.from('cofre_ocorrencias_controle').update({ data_prevista_atual: data }).eq('id', ocorrenciaId);
                if (error) throw error;
                emitirEscrita('contrato', { id: fichaContratoAtualId, ocorrenciaId, acao: 'reagendar-ocorrencia' }); // v1.18.0 — Fase 1 do wrapper de escrita
                esconderCarregamentoGlobal(); fecharSheet(); mostrarToast('Reagendada!', 'success');
                registrarLog('cofre.ocorrencias.reagendar', { ocorrenciaId, contratoId: fichaContratoAtualId, data });
                montarOcorrenciasContrato(fichaContratoAtualId);
            } catch (err) { esconderCarregamentoGlobal(); mostrarToast('Não consegui reagendar: ' + (err.message || String(err)), 'danger'); }
        }

        // --- Renovar contrato -------------------------------------------------
        export function renovarContrato(contratoId, ocorrenciaOrigemId = null) {
            const con = contratos.find(c => c.id === contratoId);
            if (!con) return;
            if (con.status === 'Assinando') { mostrarToast('Contrato ainda em assinatura — ative o contrato antes de renovar.', 'danger'); return; } // v1.32.0
            if (typeof podeUsar === 'function' && rzMostrarBloqueio('contratos.estender')) return;
            const fimAtual = con.fim || '';
            const proximoDia = fimAtual ? new Date(fimAtual + 'T00:00:00') : new Date();
            if (fimAtual) proximoDia.setDate(proximoDia.getDate() + 1);
            const sugestaoVigencia = proximoDia.toISOString().slice(0, 10);
            const sugestaoFim = (() => { const d = new Date((fimAtual || new Date().toISOString().slice(0, 10)) + 'T00:00:00'); d.setFullYear(d.getFullYear() + 1); return d.toISOString().slice(0, 10); })();
            const corpo = `
                <p class="text-xs text-slate-500 mb-3">Vigência atual: <b>${formatarDataBR(con.inicio)} → ${fimAtual ? formatarDataBR(fimAtual) : 'sem fim'}</b> · aluguel <b>${formatarMoedaBR(con.valor)}/mês</b></p>
                <div class="mb-3"><label class="block text-xs font-bold text-gray-600">Novo fim da vigência <span style="color:var(--danger)">*</span></label><input type="date" id="rn-fim" value="${sugestaoFim}" min="${fimAtual}" class="w-full p-2 border rounded text-sm mt-1"></div>
                <div class="grid grid-cols-2 gap-2 mb-3">
                    <div><label class="block text-xs font-bold text-gray-600">Novo valor (R$)</label><input type="number" step="0.01" id="rn-valor" value="${con.valor}" oninput="calcularPctRenovacaoPopup(${con.valor})" class="w-full p-2 border rounded text-sm mt-1"></div>
                    <div><label class="block text-xs font-bold text-gray-600">% de reajuste</label><input type="number" step="0.01" id="rn-pct" value="0" oninput="calcularValorRenovacaoPopup(${con.valor})" class="w-full p-2 border rounded text-sm mt-1"></div>
                </div>
                <div class="mb-3"><label class="block text-xs font-bold text-gray-600">Valor vale a partir de</label><input type="date" id="rn-vigencia" value="${sugestaoVigencia}" class="w-full p-2 border rounded text-sm mt-1"><p class="text-[10.5px] text-slate-500 mt-1">Mantendo o mesmo valor, só a vigência é estendida. Cobranças já geradas não mudam.</p></div>
                <div class="mb-3"><label class="block text-xs font-bold text-gray-600">Observação</label><textarea id="rn-obs" rows="2" placeholder="Ex.: aditivo assinado em cartório; renovação por mais 12 meses" class="w-full p-2 border rounded text-sm mt-1"></textarea></div>
                <div class="mb-1"><label class="block text-xs font-bold text-gray-600">Documento da renovação</label><input type="file" id="rn-arquivo" accept=".pdf,.jpg,.jpeg,.png,.docx" class="w-full text-sm mt-1"><p class="text-[10.5px] text-slate-500 mt-1">Aditivo ou termo de renovação. Vai pro Cofre, vinculado a este contrato.</p></div>`;
            abrirSheetForm({
                titulo: 'Renovar contrato', sub: con.locatario || '', corpo, rotuloSalvar: 'Registrar renovação',
                aoSalvar: () => { salvarRenovacaoContratoPopup(con.id, ocorrenciaOrigemId); return false; },
            });
        }

        export function calcularPctRenovacaoPopup(valorAtual) {
            const novo = parseFloat(document.getElementById('rn-valor').value);
            if (isNaN(novo) || !valorAtual) return;
            document.getElementById('rn-pct').value = (((novo - valorAtual) / valorAtual) * 100).toFixed(2);
        }

        export function calcularValorRenovacaoPopup(valorAtual) {
            const pct = parseFloat(document.getElementById('rn-pct').value);
            if (isNaN(pct)) return;
            document.getElementById('rn-valor').value = (valorAtual * (1 + pct / 100)).toFixed(2);
        }

        export async function salvarRenovacaoContratoPopup(contratoId, ocorrenciaOrigemId) {
            const con = contratos.find(c => c.id === contratoId);
            if (!con) return;
            const novoFim = document.getElementById('rn-fim').value;
            const novoValor = parseFloat(document.getElementById('rn-valor').value);
            const vigencia = document.getElementById('rn-vigencia').value || null;
            const obs = document.getElementById('rn-obs').value.trim();
            const arquivo = document.getElementById('rn-arquivo')?.files?.[0] || null;
            if (!novoFim) { mostrarToast('Informe o novo fim da vigência.', 'danger'); return; }
            if (con.fim && novoFim <= con.fim) { mostrarToast('O novo fim precisa ser depois de ' + formatarDataBR(con.fim) + '.', 'danger'); return; }
            if (!isNaN(novoValor) && novoValor <= 0) { mostrarToast('Valor inválido.', 'danger'); return; }

            mostrarCarregamentoGlobal('Registrando renovação...');
            try {
                let docId = null;
                if (arquivo && typeof window.rzAnexarArquivoEntidade === 'function') {
                    try {
                        docId = await window.rzAnexarArquivoEntidade('contrato', contratoId, arquivo, {
                            nome: `Renovação até ${formatarDataBR(novoFim)} — ${con.locatario || ''}`.trim(),
                            descricao: `Renovação contratual até ${formatarDataBR(novoFim)}.${obs ? ' ' + obs : ''}`, dataDocumento: vigencia || novoFim, categoriaSugerida: 'renovacao|aditivo|contrato',
                        });
                    } catch (errDoc) { mostrarToast('O anexo falhou, a renovação segue sem ele: ' + (errDoc.message || errDoc), 'danger'); }
                }
                const { data: ocId, error } = await dbAuth.rpc('fn_contrato_renovar', {
                    p_contrato_id: contratoId, p_novo_fim: novoFim, p_novo_valor: isNaN(novoValor) ? null : novoValor,
                    p_vigencia: vigencia, p_observacao: obs || null, p_documento_id: docId,
                });
                if (error) throw error;
                emitirEscrita('contrato', { id: contratoId, acao: 'renovar' }); // v1.18.0 — Fase 1 do wrapper de escrita

                // v1.X (10/09/2026) — fim mudou: garante os recebimentos até
                // 90 dias à frente também (insert-only, nunca mexe no que já
                // existe — nem pendente nem pago). Mesma RPC do botão "Gerar
                // Mês"/ativação/cron.
                const { data: geradasRenov, error: erroGerarRenov } = await dbAuth.rpc('fn_gerar_mensalidades_horizonte', {
                    p_cliente_id: CLIENTE_ID_SUPABASE, p_contrato_id: contratoId, p_dias_horizonte: 90,
                });
                if (erroGerarRenov) console.warn('fn_gerar_mensalidades_horizonte falhou na renovação:', erroGerarRenov.message);
                else if ((geradasRenov || []).length > 0) mensalidades = await carregarMensalidadesSupabase();

                // v1.177.0 — Parte G do plano de conciliação: fn_gerar_mensalidades_horizonte
                // é insert-only (nunca atualiza o que já existe) — se a renovação também
                // mudou o valor, os meses já gerados por um horizonte anterior ficam com
                // o valor velho. Só roda quando o valor de fato mudou.
                if (!isNaN(novoValor) && novoValor !== con.valor) {
                    try {
                        await dbAuth.rpc('fn_mensalidades_realinhar', { p_contrato_id: contratoId });
                    } catch (errRealinhar) {
                        devLog('ERRO_RENOVACAO', 'fn_mensalidades_realinhar falhou (renovação já salva, não bloqueia): ' + (errRealinhar.message || errRealinhar));
                    }
                }

                // A ocorrência de revisão/renovação que originou a ação é baixada (v2.0 §4.3)
                if (ocorrenciaOrigemId) {
                    await dbAuth.from('cofre_ocorrencias_controle').update({ status_execucao: 'concluido', tratado_em: new Date().toISOString(), tratado_por: pessoaIdLogada || null, tratamento_descricao: `Renovado até ${formatarDataBR(novoFim)}` }).eq('id', ocorrenciaOrigemId).eq('status_execucao', 'aberto');
                }
                const valorAntigo = con.valor;
                con.fim = novoFim;
                if (!isNaN(novoValor) && novoValor !== valorAntigo) { con.valor = novoValor; con.valorAnterior = valorAntigo; con.reajusteAplicado = true; }
                con.historico = con.historico || [];
                con.historico.push({ data: new Date().toISOString(), descricao: `Renovação até ${formatarDataBR(novoFim)}${!isNaN(novoValor) && novoValor !== valorAntigo ? ` · ${formatarMoedaBR(valorAntigo)} → ${formatarMoedaBR(novoValor)}` : ''}${obs ? '. ' + obs : ''}`, tipo: 'renovacao', _salvo: true });

                esconderCarregamentoGlobal(); fecharSheet();
                mostrarToast('Renovação registrada!', 'success');
                registrarLog('contratos.estender', { contratoId, novoFim, novoValor: isNaN(novoValor) ? null : novoValor, vigencia, documentoId: docId, ocorrenciaId: ocId });
                if (fichaImovelAtualId === con.imovelId) renderFichaImovelUnica(imoveis.find(i => i.id === con.imovelId));
                if (fichaContratoAtualId === contratoId) abrirFichaContrato(contratoId);
            } catch (err) {
                esconderCarregamentoGlobal();
                mostrarToast('Não consegui registrar a renovação: ' + (err.message || String(err)), 'danger');
            }
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
        // NOVO (18/09/2026) — Editar dados na Ficha da Parte (abrirFichaParte,
        // cofre-controles.js) dispara 'cofre:recarregar-partes'; o chip
        // Partes do contrato (nome exibido no chip) recarrega junto — mesmo
        // padrão do listener de documentos acima.
        window.addEventListener('cofre:recarregar-partes', () => { const con = contratos.find(c => c.id === fichaContratoAtualId); if (con) montarChipsPartesContrato(con); });

        // v1.113.0 — ⋮ dos cards da ficha do contrato (rodapés saíram; toda
        // ação vive no ⋮ ou no toque). Sheets de dados, não HTML.
        export function abrirAcoesCobrancasContrato(contratoId) {
            const con = contratos.find(c => c.id === contratoId); if (!con || typeof abrirSheetAcoes !== 'function') return;
            const imo = imoveis.find(i => i.id === con.imovelId);
            abrirSheetAcoes({ titulo: 'Cobranças', sub: con.locatario || '', acoes: [
                // v1.20.0 (demanda 0e40951a, complemento — pedido explícito do
                // Nicola, 22/09/2026: "adicione esta possibilidade tb no card
                // financeiro do contrato") — abrirNovoRecebimento é de
                // financeiro.js (módulo isolado, ver window[nome] em index.html);
                // contratoId já vai pronto, o form abre sem seletor de contrato.
                { icone: 'plus', titulo: 'Adicionar recebimento', sub: 'Lança um recebimento avulso para este contrato', aoTocar: () => { if (typeof window.abrirNovoRecebimento === 'function') window.abrirNovoRecebimento(contratoId); } },
                { icone: 'wallet', titulo: 'Ver no Financeiro', codigo: 'mensal.ver', sub: 'Todas as competências deste imóvel', aoTocar: () => { document.getElementById('men-filtro-imovel').value = con.imovelId; document.getElementById('men-filtro-imovel-resumo').textContent = (imo ? imo.empreendimento : '-'); switchTab('tab-mensal'); renderMensalidades(); } },
            ] });
        }

        // NOVO (18/09/2026, pedido explícito: "o atalho de editar locatário
        // dentro de partes de um contrato está abrindo o formulário antigo
        // de um novo contrato") — abrirEdicaoContratoContextual() abre o
        // formulário INTEIRO de edição do contrato (imóvel/valores/datas),
        // não um editor da parte — pra mudar telefone/endereço do
        // locatário isso forçava abrir o form do contrato inteiro sem
        // nada óbvio de "locatário" ali dentro. Todo locatário/fiador de
        // contrato JÁ tem uma linha própria em partes_papeis (conferido no
        // banco: 68/68 contratos ativos com papel='locatario') — resolve o
        // parte_id e abre a Ficha da Parte (cofre-controles.js
        // abrirFichaParte, mesmo fluxo do item de controle — telefone,
        // endereço etc. + Editar/Acionar por WhatsApp/e-mail pelo ⋮).
        // Fallback (parte ainda sem linha em partes_papeis, caso raro):
        // mantém o form do contrato como estava, com aviso.
        async function abrirFichaParteDoContrato(contratoId, papel) {
            try {
                const { data, error } = await dbAuth.from('partes_papeis').select('parte_id').eq('entidade_tipo', 'contrato').eq('entidade_id', contratoId).eq('papel', papel).eq('ativo', true).limit(1).maybeSingle();
                if (error) throw error;
                if (!data?.parte_id) {
                    mostrarToast('Esta parte ainda não tem cadastro próprio — abrindo pelo formulário do contrato.', 'aviso');
                    abrirEdicaoContratoContextual(contratoId, 'fichaContrato', contratoId);
                    return;
                }
                window.dispatchEvent(new CustomEvent('cofre:abrir-ficha-parte', { detail: { id: data.parte_id } }));
            } catch (err) {
                mostrarToast('Erro ao abrir a parte: ' + (err.message || String(err)), 'danger');
            }
        }

        // v1.21.0 (demanda 3cc64651, pedido explícito do Nicola 23/09/2026:
        // "Ao clicar no menu 3 pontinhos da parte, nao aparece opcao
        // adicionar parte. so editar. ainda nao permite o clique na parte.
        // ao editar locatario ou parte ainda mostra tela de transicao") —
        // retoma o que be42b19f/176b3145 deixaram de fora NESTE card:
        //   · tocar na linha abre o formulário da parte direto
        //     (locatário → form da parte; fiador → form de 1 fiador);
        //   · todo ⋮ de parte tem "Adicionar parte", que vai direto pro
        //     formulário de cadastro (fiador novo), sem lista no meio;
        //   · "Fiadores do contrato" (lista inteira num sheet) saiu deste
        //     caminho — era a tela intermediária que 176b3145 já apontava.
        //     abrirEdicaoFiadoresPopup continua existindo pra quem a chama
        //     de fora (fluxo de criação).
        export function abrirAcoesPartesContrato(contratoId) {
            const con = contratos.find(c => c.id === contratoId); if (!con || typeof abrirSheetAcoes !== 'function') return;
            const acoes = [];
            if (!con.locatario) acoes.push({ icone: 'user-plus', titulo: 'Adicionar locatário', codigo: 'contratos.editar', sub: 'Quem aluga o imóvel', aoTocar: () => abrirFichaParteDoContrato(con.id, 'locatario') });
            acoes.push({ icone: 'user-plus', titulo: 'Adicionar parte', codigo: 'contratos.editar', sub: 'Novo fiador do contrato', aoTocar: () => adicionarParteContrato(con.id) });
            abrirSheetAcoes({ titulo: 'Partes', sub: con.locatario || '', acoes });
        }

        export function abrirAcoesLocatarioContrato(contratoId) {
            const con = contratos.find(c => c.id === contratoId); if (!con || typeof abrirSheetAcoes !== 'function') return;
            const temLocatario = !!con.locatario;
            abrirSheetAcoes({ titulo: con.locatario || 'Locatário', sub: 'Locatário', acoes: [
                { icone: 'pencil', titulo: temLocatario ? 'Editar locatário' : 'Adicionar locatário', codigo: 'contratos.editar', sub: 'Telefone, e-mail, endereço, documento', aoTocar: () => abrirFichaParteDoContrato(con.id, 'locatario') },
                { icone: 'user-plus', titulo: 'Adicionar parte', codigo: 'contratos.editar', sub: 'Novo fiador do contrato', aoTocar: () => adicionarParteContrato(con.id) },
            ] });
        }

        // v1.21.0 — ponte do toque na linha do locatário (abrirFichaParteDoContrato
        // é interna do módulo).
        export function abrirEditarLocatarioContrato(contratoId) {
            return abrirFichaParteDoContrato(contratoId, 'locatario');
        }

        // v1.21.0 — "Adicionar parte" do contrato: sem locatário, o que falta
        // é o locatário; com locatário, a parte que se acrescenta é fiador.
        export function adicionarParteContrato(contratoId) {
            const con = contratos.find(c => c.id === contratoId); if (!con) return;
            if (!con.locatario) return abrirFichaParteDoContrato(contratoId, 'locatario');
            return abrirFormFiadorContrato(contratoId, null);
        }

        // v1.21.0 — ⋮ de UM fiador (index = posição na lista, mesma ordem de
        // contrato_fiadores.ordem usada pela ficha e por carregarFiadoresContrato).
        export async function abrirAcoesFiadorContrato(contratoId, index) {
            const con = contratos.find(c => c.id === contratoId); if (!con || typeof abrirSheetAcoes !== 'function') return;
            await carregarFiadoresContrato(contratoId);
            const i = Number.isInteger(index) ? index : 0;
            const f = fiadoresContratoAtual[i];
            abrirSheetAcoes({ titulo: f?.nome || 'Fiador', sub: 'Fiador', acoes: [
                { icone: 'pencil', titulo: 'Editar fiador', codigo: 'contratos.editar', sub: 'Documento, cônjuge, contato, imóvel em garantia', aoTocar: () => abrirFormFiadorContrato(con.id, i) },
                { icone: 'user-plus', titulo: 'Adicionar parte', codigo: 'contratos.editar', sub: 'Novo fiador do contrato', aoTocar: () => abrirFormFiadorContrato(con.id, null) },
                { icone: 'archive', titulo: 'Encerrar fiador', codigo: 'contratos.editar', sub: 'Troca real. Sai do contrato e fica no histórico da parte', aoTocar: () => encerrarFiadorDireto(con.id, i) },
                { icone: 'trash-2', titulo: 'Excluir fiador', codigo: 'contratos.editar', tipo: 'bad', sub: 'Cadastro errado. Sai também do histórico da parte', aoTocar: () => removerFiadorDireto(con.id, i) },
            ] });
        }

        // v1.43.0 (demanda b94ef7d5) — grupo "Encerrados" no chip Partes: fiador e cônjuge
        // anuente encerrados (troca real), com a data. Excluídos não aparecem (a linha some).
        // ⋮: Reativar (fn_vinculo_reativar devolve ao contrato com RG, cônjuge e imóvel guardados no
        // encerramento) ou Excluir (fn_vinculo_excluir). Ouvintes por JS — sem ponte no window.
        export async function montarPartesEncerradasContrato(contratoId) {
            const mount = document.getElementById('fc-partes-encerrados'); if (!mount) return;
            try {
                const { data, error } = await dbAuth.from('partes_papeis')
                    .select('id, papel, encerrado_em, partes(nome, doc_tipo, documento)')
                    .eq('entidade_tipo', 'contrato').eq('entidade_id', contratoId).eq('ativo', false)
                    .in('papel', ['fiador', 'conjuge_anuente']).order('encerrado_em', { ascending: false });
                if (error) throw error;
                const lista = data || [];
                if (!lista.length) { mount.innerHTML = ''; return; }
                const rot = { fiador: 'Fiador', conjuge_anuente: 'Cônjuge anuente' };
                mount.innerHTML = `<div class="rz-group">Encerrados · ${lista.length}</div>` + lista.map(v => `
                    <div class="rz-row">
                        <div class="rz-ic"><svg data-lucide="${v.papel === 'fiador' ? 'shield-check' : 'heart-handshake'}"></svg></div>
                        <div class="rz-tx"><b>${escapeHtmlSaidas(v.partes?.nome || 'Parte')}</b><span>${rot[v.papel] || v.papel}${v.encerrado_em ? ' · encerrado em ' + new Date(v.encerrado_em).toLocaleDateString('pt-BR') : ''}</span></div>
                        <span class="rz-st rz-neu">Encerrado</span>
                        <button type="button" class="rz-more" data-enc-papel="${v.id}" aria-label="Ações do vínculo encerrado"><svg data-lucide="ellipsis-vertical"></svg></button>
                    </div>`).join('');
                mount.querySelectorAll('[data-enc-papel]').forEach(btn => btn.addEventListener('click', (ev) => {
                    ev.stopPropagation();
                    const v = lista.find(x => x.id === btn.dataset.encPapel); if (!v) return;
                    abrirAcoesEncerradoContrato(contratoId, v, rot[v.papel] || v.papel);
                }));
                if (typeof lucide !== 'undefined') lucide.createIcons();
            } catch (err) {
                mount.innerHTML = '';
                console.warn('[contratos] encerrados do contrato:', err.message || err);
            }
        }
        function abrirAcoesEncerradoContrato(contratoId, v, rotulo) {
            if (typeof abrirSheetAcoes !== 'function') return;
            const nome = v.partes?.nome || 'Parte';
            abrirSheetAcoes({ titulo: `${rotulo} · ${nome}`, sub: 'Vínculo encerrado', acoes: [
                { icone: 'rotate-ccw', titulo: 'Reativar', codigo: 'contratos.editar', sub: v.papel === 'fiador' ? 'Volta a ser fiador deste contrato, com os dados de antes' : 'Volta como cônjuge anuente do fiador', aoTocar: () => acaoEncerradoContrato(contratoId, v, 'fn_vinculo_reativar') },
                { icone: 'trash-2', tipo: 'bad', titulo: 'Excluir', codigo: 'contratos.editar', sub: 'Cadastro errado. Sai também do histórico da parte', aoTocar: () => acaoEncerradoContrato(contratoId, v, 'fn_vinculo_excluir') },
            ] });
        }
        async function acaoEncerradoContrato(contratoId, v, funcao) {
            const nome = v.partes?.nome || 'a parte';
            const excluir = funcao === 'fn_vinculo_excluir';
            const ok = excluir
                ? await rzPerguntar({ titulo: 'Excluir vínculo?', impacto: `${nome} sai também do histórico da parte. Não dá para desfazer.`, destrutivo: true, rotuloConfirmar: 'Excluir vínculo' })
                : await rzPerguntar({ titulo: 'Reativar?', impacto: `${nome} volta a este contrato${v.papel === 'fiador' ? ' como fiador, com os dados de antes' : ''}.`, rotuloConfirmar: 'Reativar' });
            if (!ok) return;
            try {
                const { data, error } = await dbAuth.rpc(funcao, { p_papel_id: v.id });
                if (error) throw error;
                mostrarToast((data && data.mensagem) || (excluir ? 'Vínculo excluído.' : 'Vínculo reativado.'), 'success');
                if (fichaContratoAtualId === contratoId) abrirFichaContrato(contratoId);
            } catch (err) {
                mostrarToast('Não consegui ' + (excluir ? 'excluir' : 'reativar') + ': ' + (err.message || String(err)), 'danger');
            }
        }

        // v1.42.0 (demanda b94ef7d5) — encerrar = troca real: a regra mora no banco
        // (fn_vinculo_encerrar tira o fiador de contrato_fiadores e encerra o vínculo dele e do
        // cônjuge anuente em partes_papeis, que vira histórico na ficha da parte).
        export async function encerrarFiadorDireto(contratoId, index) {
            await carregarFiadoresContrato(contratoId);
            const f = fiadoresContratoAtual[index]; if (!f) return;
            const doc = String(f.cpf || '').replace(/\D/g, '');
            if (!await rzPerguntar({ titulo: 'Encerrar fiador?', impacto: `${f.nome || 'O fiador'} deixa de ser fiador deste contrato e fica no histórico da parte${f.conjuge_nome ? ', junto com o cônjuge anuente' : ''}.`, rotuloConfirmar: 'Encerrar fiador' })) return;
            try {
                const { data: papeis, error: errPapeis } = await dbAuth.from('partes_papeis')
                    .select('id, partes!inner(documento)')
                    .eq('entidade_tipo', 'contrato').eq('entidade_id', contratoId).eq('papel', 'fiador').eq('ativo', true);
                if (errPapeis) throw errPapeis;
                const papel = (papeis || []).find(pp => String(pp.partes?.documento || '').replace(/\D/g, '') === doc);
                if (!papel) throw new Error('não achei o vínculo deste fiador na parte');
                const { data, error } = await dbAuth.rpc('fn_vinculo_encerrar', { p_papel_id: papel.id });
                if (error) throw error;
                mostrarToast((data && data.mensagem) || 'Fiador encerrado.', 'success');
                if (fichaContratoAtualId === contratoId) abrirFichaContrato(contratoId);
            } catch (err) {
                mostrarToast('Não consegui encerrar: ' + (err.message || String(err)), 'danger');
            }
        }

        // v1.21.0 (demanda 3cc64651) — formulário de UM fiador, direto (novo
        // quando index é null). Mesmos campos do editor antigo em lista
        // (renderFiadoresPopup), na gramática única (.rz-f). Salvar regrava a
        // lista inteira pelo mesmo RPC de sempre (substituir_fiadores_contrato
        // — delete+insert por contrato), trocando só este fiador; os outros
        // seguem intactos, na mesma ordem.
        export async function abrirFormFiadorContrato(contratoId, index) {
            if (typeof abrirSheetForm !== 'function') return;
            if (contratoId && !idEhUuidValido(contratoId)) {
                const conTmp = contratos.find(c => c.id === contratoId);
                if (conTmp) { mostrarCarregamentoGlobal('Só um instante, ainda sincronizando...'); await aguardarIdRealDoContrato(conTmp); contratoId = conTmp.id; esconderCarregamentoGlobal(); }
            }
            await carregarFiadoresContrato(contratoId);
            const novo = !Number.isInteger(index) || !fiadoresContratoAtual[index];
            const f = novo ? Object.assign({}, FIADOR_CAMPO_VAZIO) : fiadoresContratoAtual[index];
            const con = contratos.find(c => c.id === contratoId) || {};
            const e = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
            const campo = (rot, id, val, tipo = 'text', obrig = false) =>
                `<div class="rz-f"><label for="${id}">${rot}${obrig ? ' <i>*</i>' : ''}</label><input type="${tipo}" id="${id}" value="${e(val)}"></div>`;
            const sel = (rot, id, val, opcoes, vazio) =>
                `<div class="rz-f"><label for="${id}">${rot}</label><select id="${id}"><option value="">${vazio}</option>${opcoes.map(o => `<option ${val === o ? 'selected' : ''}>${o}</option>`).join('')}</select></div>`;
            const corpo = `
                <div class="rz-f2">${campo('Nome completo', 'ff-nome', f.nome, 'text', true)}${campo('CPF/CNPJ', 'ff-cpf', f.cpf, 'text', true)}</div>
                <div class="rz-f2">${campo('RG', 'ff-rg', f.rg)}${campo('Órgão expedidor', 'ff-rg-orgao', f.rg_orgao_expedidor)}</div>
                <div class="rz-f2">${campo('Nacionalidade', 'ff-nacionalidade', f.nacionalidade)}${campo('Data de nascimento', 'ff-nascimento', f.data_nascimento, 'date')}</div>
                <div class="rz-f2">${campo('Profissão', 'ff-profissao', f.profissao)}${sel('Estado civil', 'ff-estado-civil', f.estado_civil, ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União estável'], '— selecione —')}</div>
                ${sel('Regime de bens', 'ff-regime', f.regime_bens, ['Comunhão parcial de bens', 'Comunhão universal de bens', 'Separação total de bens', 'Separação obrigatória de bens', 'Participação final nos aquestos'], '— se casado(a) —')}
                <p class="rz-desc" style="font-size:11.5px;margin:0 0 8px">Cônjuge: assina junto se casado(a) fora de separação total/obrigatória (Art. 1.647 do Código Civil).</p>
                <div class="rz-f2">${campo('Nome do cônjuge', 'ff-conj-nome', f.conjuge_nome)}${campo('CPF do cônjuge', 'ff-conj-cpf', f.conjuge_cpf)}</div>
                <div class="rz-f2">${campo('RG do cônjuge', 'ff-conj-rg', f.conjuge_rg)}${campo('Profissão do cônjuge', 'ff-conj-prof', f.conjuge_profissao)}</div>
                <div class="rz-f2">${campo('WhatsApp', 'ff-whatsapp', f.whatsapp)}${campo('E-mail', 'ff-email', f.email, 'email')}</div>
                <div class="rz-f"><label for="ff-endereco">Endereço atual</label><textarea id="ff-endereco" rows="2">${e(f.endereco_atual)}</textarea></div>
                <label style="display:flex;align-items:center;gap:8px;font-size:13px;margin:4px 0 10px"><input type="checkbox" id="ff-possui-imovel" ${f.possui_imovel_proprio ? 'checked' : ''}> Possui imóvel próprio quitado (garantia)</label>
                <div class="rz-f2">${campo('Matrícula do imóvel', 'ff-imovel-matricula', f.imovel_matricula)}${campo('Cartório de registro', 'ff-imovel-cartorio', f.imovel_cartorio_registro)}</div>
                ${campo('Endereço do imóvel', 'ff-imovel-endereco', f.imovel_endereco)}`;
            abrirSheetForm({
                titulo: novo ? 'Novo fiador' : 'Editar fiador',
                sub: novo ? (con.locatario ? `Contrato de ${con.locatario}` : 'Fiador do contrato') : (f.nome || ''),
                corpo, rotuloSalvar: novo ? 'Adicionar' : 'Salvar',
                aoSalvar: async (el) => {
                    const v = (id) => (el.querySelector('#' + id)?.value || '').trim();
                    const cpf = v('ff-cpf');
                    const dados = {
                        nome: v('ff-nome'), cpf, doc_tipo: cpf.replace(/\D/g, '').length > 11 ? 'CNPJ' : (f.doc_tipo || 'CPF'),
                        rg: v('ff-rg'), rg_orgao_expedidor: v('ff-rg-orgao'), nacionalidade: v('ff-nacionalidade'), data_nascimento: v('ff-nascimento'),
                        profissao: v('ff-profissao'), estado_civil: v('ff-estado-civil'), regime_bens: v('ff-regime'),
                        conjuge_nome: v('ff-conj-nome'), conjuge_cpf: v('ff-conj-cpf'), conjuge_rg: v('ff-conj-rg'), conjuge_profissao: v('ff-conj-prof'),
                        whatsapp: v('ff-whatsapp'), email: v('ff-email'), endereco_atual: v('ff-endereco'),
                        possui_imovel_proprio: !!el.querySelector('#ff-possui-imovel')?.checked,
                        imovel_matricula: v('ff-imovel-matricula'), imovel_cartorio_registro: v('ff-imovel-cartorio'), imovel_endereco: v('ff-imovel-endereco'),
                    };
                    if (!dados.nome || !dados.cpf) { mostrarToast('Nome e CPF/CNPJ do fiador são obrigatórios.', 'danger'); return false; }
                    const lista = fiadoresContratoAtual.slice();
                    if (novo) lista.push(dados); else lista[index] = Object.assign({}, lista[index], dados);
                    const linhas = lista.filter(x => x.nome && x.cpf).map((x, i) => Object.assign({}, x, { ordem: i + 1 }));
                    const { error } = await dbAuth.rpc('substituir_fiadores_contrato', { p_contrato_id: contratoId, p_cliente_id: CLIENTE_ID_SUPABASE, p_linhas: linhas });
                    if (error) { mostrarToast('Não consegui salvar o fiador: ' + error.message, 'danger'); return false; }
                    fiadoresContratoAtual = lista;
                    emitirEscrita('contrato', { id: contratoId, acao: 'editar-fiadores' });
                    mostrarToast(novo ? 'Fiador adicionado.' : 'Fiador salvo.', 'success');
                    if (fichaContratoAtualId === contratoId) abrirFichaContrato(contratoId);
                    return true;
                },
            });
        }

        export async function abrirSeletorRemoverFiador(contratoId) {
            if (!fiadoresContratoAtual.length) { mostrarToast('Nenhum fiador pra remover.', 'danger'); return; }
            if (fiadoresContratoAtual.length === 1) { removerFiadorDireto(contratoId, 0); return; }
            abrirSheetAcoes({ titulo: 'Remover qual fiador?', acoes: fiadoresContratoAtual.map((f, i) => ({ icone: 'shield-check', titulo: f.nome || `Fiador ${i + 1}`, tipo: 'bad', aoTocar: () => removerFiadorDireto(contratoId, i) })) });
        }

        // v1.39.1 (F0.2a, teste 2 — Nicola 04/10 00:52) — remover fiador DESVINCULA a parte do
        // contrato (a parte continua cadastrada): é o caso de "Desfazer" da regra aprovada. O toast
        // ganha "Desfazer" por 5 s, que regrava a lista anterior pela mesma RPC.
        export async function removerFiadorDireto(contratoId, index) {
            const antes = fiadoresContratoAtual.filter(f => f.nome && f.cpf).map((f, i) => Object.assign({}, f, { ordem: i + 1 }));
            const removido = fiadoresContratoAtual[index];
            const linhas = fiadoresContratoAtual.filter((_, i) => i !== index).filter(f => f.nome && f.cpf).map((f, i) => Object.assign({}, f, { ordem: i + 1 }));
            const gravar = (lista) => dbAuth.rpc('substituir_fiadores_contrato', { p_contrato_id: contratoId, p_cliente_id: CLIENTE_ID_SUPABASE, p_linhas: lista });
            mostrarCarregamentoGlobal('Removendo...');
            try {
                const { error } = await gravar(linhas);
                if (error) throw error;
                esconderCarregamentoGlobal();
                if (fichaContratoAtualId === contratoId) abrirFichaContrato(contratoId);
                const msg = `${removido?.nome || 'Fiador'} saiu do contrato.`;
                const desfazer = async () => {
                    const { error: errVolta } = await gravar(antes);
                    if (errVolta) { rzAvisar('Não consegui desfazer: ' + errVolta.message, 'danger'); return; }
                    rzAvisar('Fiador de volta ao contrato.', 'success');
                    if (fichaContratoAtualId === contratoId) abrirFichaContrato(contratoId);
                };
                if (window.rzToast) window.rzToast(msg, { tipo: 'success', desfazer }); else rzAvisar(msg, 'success');
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
            // v1.32.0 — em Assinando não há reajuste nem renovação (contrato ainda não vigente)
            const emAssinatura = con.status === 'Assinando';
            // v1.34.0 (pedido do Nicola, 02/10/2026 01:55) — "Dados do contrato"
            // (só leitura) entra no topo, em qualquer status; "Abrir o imóvel" saiu.
            const acaoDados = { icone: 'file-text', titulo: 'Dados do contrato', codigo: 'contratos.ver', sub: 'Ver tudo o que está cadastrado, sem editar', aoTocar: () => abrirDadosContratoLeitura(con.id) };
            const acoes = emAssinatura ? [acaoDados] : [acaoDados,
                { icone: 'trending-up', titulo: 'Reajustar contrato', codigo: 'contratos.reajustar', sub: 'Novo valor, vigência e documento', aoTocar: () => lancarReajusteContrato(con.id) },
                { icone: 'refresh-cw', titulo: 'Renovar contrato', codigo: 'contratos.estender', sub: 'Novo fim de vigência, valor e documento', aoTocar: () => renovarContrato(con.id) }, // v1.1.0 — A.10
                // v1.6.0 (pedido explícito, 16/09) — "Histórico" saiu daqui:
                // o card "Ocorrências" da própria ficha (Resumo) já é o
                // histórico — cada linha agora abre (aberta = ações, fechada =
                // resumo), o link redundante só confundia com 2 caminhos pro
                // mesmo lugar.
            ];
            if (con.status === 'Assinando' && pront.pronto) acoes.push({ icone: 'file-signature', titulo: 'Gerar minuta', codigo: 'minutas.gerar', sub: 'PDF a partir dos dados do contrato', aoTocar: () => gerarMinutaContrato(con.id) });
            // v1.116.0 — ações de status por estado do contrato (pedido
            // explícito). "As regras" continuam 100% em
            // abrirAlterarStatusContrato/salvarAlterarStatusContrato (data
            // de vigência, observação, o que fazer com mensalidades em
            // aberto) — cada item aqui só pré-seleciona a ação nesse mesmo
            // formulário (abrirAcaoStatusContrato), não duplica a lógica.
            if (con.status === 'Assinando') {
                acoes.push({ icone: 'check-circle-2', titulo: 'Ativar contrato', codigo: 'contratos.editar', sub: 'Conferir os dados e salvar — vira Ativo', aoTocar: () => ativarContratoPeloFormulario(con.id) }); // v1.32.0
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

        // v1.34.0 (pedido do Nicola, 02/10/2026) — "Dados do contrato": tudo o que
        // está cadastrado no contrato, em leitura (sheet .rz-kv, mesmo padrão dos
        // "Sobre o ..."). Para alterar continua valendo "Editar contrato".
        export function abrirDadosContratoLeitura(contratoId) {
            const con = contratos.find(c => c.id === contratoId);
            if (!con || typeof abrirSheet !== 'function') return;
            const imo = imoveis.find(i => i.id === con.imovelId);
            const adm = (typeof administradoras !== 'undefined' ? administradoras : []).find(a => a.id === con.administradoraId);
            const vazio = '<span style="color:var(--muted)">—</span>';
            const v = (x) => (x === null || x === undefined || x === '') ? vazio : rzEsc(String(x));
            const moeda = (x) => (Number(x) > 0 ? rzEsc(formatarMoedaBR(Number(x))) : vazio);
            const data = (x) => (x ? rzEsc(formatarDataBR(x)) : vazio);
            const pct = (x) => (x === null || x === undefined || x === '' ? vazio : rzEsc(String(x).replace('.', ',')) + '%');
            const meses = (x) => (x ? rzEsc(String(x)) + (Number(x) === 1 ? ' mês' : ' meses') : vazio);
            const linha = (r, val, cheio) => `<div${cheio ? ' class="rz-full"' : ''}><small>${rzEsc(r)}</small><b style="font-weight:500;font-size:13px">${val}</b></div>`;
            const card = (titulo, linhas) => `<div class="rz-card"><p class="rz-group" style="margin-top:0">${rzEsc(titulo)}</p><div class="rz-kv">${linhas.join('')}</div></div>`;
            const corpo =
                card('Contrato', [
                    linha('Imóvel', imo ? v(`${imo.enderecoRua || ''}, ${imo.enderecoNum || ''}${imo.enderecoComp ? ' - ' + imo.enderecoComp : ''}`) : vazio, true),
                    linha('Status', v(con.status)),
                    linha('Aluguel', moeda(con.valor)),
                    linha('Início', data(con.inicio)),
                    linha('Fim', data(con.fim)),
                    linha('Vencimento', con.vencimentoDia ? 'Dia ' + v(con.vencimentoDia) : vazio),
                    linha('Aluguel antecipado', v(con.alugelAntecipado)),
                    linha('Forma de pagamento', v(con.formaPagamento)),
                    linha('Desconto energia', Number(con.descontoEnergia) > 0 ? pct(con.descontoEnergia) : vazio),
                    linha('Administradora', adm ? v(adm.nome) : 'Gestão direta', true),
                ]) +
                card('Revisionais', [
                    linha('Índice de reajuste', v(con.reajuste)),
                    linha('Reajuste a cada', meses(con.reajustePeriodicidadeMeses)),
                    linha('Teto do reajuste', pct(con.reajusteTetoPct)),
                    linha('Piso do reajuste', pct(con.reajustePisoPct)),
                    linha('Revisão a cada', con.revisionalPeriodicidadeMeses ? meses(con.revisionalPeriodicidadeMeses) : 'Sem cláusula de revisional', true),
                ]) +
                card('Encargos', [
                    linha('Locatário paga IPTU', v(con.locatarioPagaIptu)),
                    linha('Valor IPTU', moeda(con.iptuValor)),
                    linha('Locatário paga condomínio', v(con.condominioLocatario)),
                    linha('Valor condomínio', moeda(con.condominioValor)),
                ]) +
                card('Locatário', [
                    linha('Nome', v(con.locatario), true),
                    linha(con.docTipo === 'CNPJ' ? 'CNPJ' : 'CPF/CNPJ', v(con.cpf)),
                    linha('Estado civil', v(con.locatarioEstadoCivil)),
                    linha('Profissão', v(con.locatarioProfissao)),
                    linha('WhatsApp', v(con.whatsapp)),
                    linha('E-mail', v(con.email), true),
                    linha('Endereço atual', v(con.locatarioEnderecoAtual), true),
                    linha('Pessoa de contato', v(con.contatoNome), true),
                ]) +
                `<p class="rz-desc" style="margin:4px 2px 0">Fiadores, documentos e histórico ficam nos chips da ficha. Para alterar, use Editar contrato.</p>`;
            abrirSheet(rzSheetCabecalho('Dados do contrato', con.locatario || '') + `<div class="rz-sh-b">${corpo}</div>`);
            registrarLog('contratos.ver', { contratoId: con.id, acao: 'dados_leitura' });
        }

        // v1.116.0 — abre o formulário já existente (abrirAlterarStatusContrato)
        // com a ação desejada pré-selecionada no <select>. Reaproveita 100%
        // das regras dele (opções válidas por transição, pendentes de
        // mensalidade, sincronização do status do imóvel).
        // v1.32.0 (pedido do Nicola 02/10) — ativar um contrato em Assinando
        // abre o formulário completo, preenchido, com status Ativo: a pessoa
        // completa e confere os dados e salva (saveContrato), voltando à ficha.
        export function ativarContratoPeloFormulario(contratoId) {
            if (typeof podeUsar === 'function' && rzMostrarBloqueio('contratos.editar')) return;
            abrirEdicaoContratoContextual(contratoId, 'fichaContrato', contratoId);
            const sel = document.getElementById('con-status');
            if (sel) sel.value = 'Ativo';
            mostrarToast('Confira e complete os dados. Ao salvar, o contrato fica Ativo.', 'info');
        }

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
                    // CORRIGIDO v1.11.0 (18/09/2026) — bucket/storage_path
                    // entraram no select: abrirAcoesAnexoContrato() (abaixo)
                    // precisa deles pra Baixar/Excluir sem depender do Cofre.
                    .select('id, criado_em, cofre_documentos!inner(id, nome_exibicao, mime_type, status, bucket, storage_path)')
                    .eq('entidade_tipo', 'contrato').eq('entidade_id', contratoId)
                    .order('criado_em', { ascending: false });
                if (error) throw error;
                __docsContratoAtual = (data || []).filter(v => v.cofre_documentos && v.cofre_documentos.status === 'ativo');
                // v1.110.0 (fatia 4) — .rz-row + vazio único; contador do chip Arquivos
                const nArq = document.getElementById('fc-chip-n-arquivos');
                if (nArq) nArq.textContent = String(__docsContratoAtual.length);
                fcMontarChipsAnexos();
                el.innerHTML = __docsContratoAtual.length ? __docsContratoAtual.map((v) => `
                    <div class="rz-row rz-link" onclick="abrirAcoesAnexoContrato('${v.id}')">
                        <div class="rz-ic"><svg data-lucide="${(v.cofre_documentos.mime_type || '').startsWith('image/') ? 'image' : 'file-text'}"></svg></div>
                        <div class="rz-tx"><b>${escapeHtmlSaidas(v.cofre_documentos.nome_exibicao || 'Documento')}</b><span>${v.criado_em ? new Date(v.criado_em).toLocaleDateString('pt-BR') : ''}</span></div>
                        <svg data-lucide="chevron-right" class="rz-chev"></svg>
                    </div>`).join('') : `<div class="rz-empty"><div class="rz-ic"><svg data-lucide="file-plus-2"></svg></div><p>Nenhum documento neste contrato. A minuta assinada guardada aqui fica a um toque.</p></div>`;
                if (typeof lucide !== 'undefined') lucide.createIcons();
            } catch (err) {
                el.innerHTML = `<p class="text-xs text-red-500">Não consegui carregar os documentos.</p>`;
                console.warn('Falha ao carregar documentos do contrato (não bloqueando):', err.message);
            }
        }

        // CORRIGIDO v1.11.0 (18/09/2026, rodada 10 — achado do Nicola: "o X
        // no chip Anexos não permite clicar nem ver as ações, trava — só ao
        // clicar em voltar é que abre a Ficha") — CAUSA RAIZ (root-cause, não
        // só o sintoma): a v1.10.0 (rodada 9) trocou o X por
        // data-action="abrir-documento", copiando o padrão de
        // cofre-ativos.js montarDocumentosAtivo(). Só que esse padrão
        // funciona ali porque cofre-ativos.js só RODA depois que o módulo
        // Cofre já bootou (é preciso ter aberto a aba Ativos pra chegar
        // numa ficha de ativo) — nesse ponto, cofre-app.js (que registra o
        // ÚNICO listener document.addEventListener('click', ...) que
        // interpreta [data-action]) já está carregado, e o próprio HTML da
        // Ficha do Documento (#modal-ficha-doc, ids fd-*, injetado por
        // ativos-markup.js) já existe no DOM. A aba Contratos é acessível
        // DIRETO do app principal, sem nunca passar por Ativos — nesse
        // caso, js/cofre-app.js (que só é importado dinamicamente dentro de
        // montarAtivosTab(), ao abrir Ativos pela 1ª vez na sessão — ver
        // js/ativos/ativos-boot.js) nunca chega a rodar, então nem o
        // listener existe, nem #modal-ficha-doc está no DOM: o toque não
        // fazia ABSOLUTAMENTE NADA (dava a impressão de "travado"). O
        // "abre ao voltar" batido pelo Nicola bate com isso: só funcionava
        // depois de a pessoa ter passado pela aba Ativos em algum momento
        // da mesma sessão (o que faz o Cofre bootar de verdade).
        // FIX: em vez de depender da Ficha do Documento do Cofre (módulo
        // que pode nunca ter carregado a partir de Contratos), a linha
        // agora abre um sheet de ações AUTOCONTIDO (abrirAcoesAnexoContrato
        // abaixo), Baixar/Excluir, usando dbAuth.storage direto — MESMO
        // padrão zero-dependência-do-Cofre já usado em abrirDocumentoFicha/
        // removerDocumentoFichaAtual (index.html, ficha do imóvel antiga),
        // não inventado agora. abrirAcoesAnexosContrato() (plural, cabeçalho
        // "..." do box, upload) não muda — continua igual.
        export function abrirAcoesAnexoContrato(vinculoId) {
            const v = __docsContratoAtual.find(x => x.id === vinculoId);
            const doc = v?.cofre_documentos;
            if (!doc || typeof abrirSheetAcoes !== 'function') { mostrarToast('Documento não encontrado.', 'danger'); return; }
            abrirSheetAcoes({ titulo: doc.nome_exibicao || 'Documento', acoes: [
                { icone: 'download', titulo: 'Baixar', aoTocar: () => baixarAnexoContrato(doc) },
                { icone: 'trash-2', titulo: 'Excluir', tipo: 'bad', aoTocar: () => excluirAnexoContrato(vinculoId, doc) },
            ] });
        }

        async function baixarAnexoContrato(doc) {
            try {
                const { data, error } = await dbAuth.storage.from(doc.bucket || 'cofre-documentos').createSignedUrl(doc.storage_path, 120);
                if (error) throw error;
                window.open(data.signedUrl, '_blank');
            } catch (err) {
                mostrarToast('Erro ao abrir o documento: ' + (err.message || String(err)), 'danger');
            }
        }

        async function excluirAnexoContrato(vinculoId, doc) {
            if (!await rzPerguntar({ titulo: 'Excluir documento?', impacto: 'Ele sai também do Cofre e não dá para desfazer.', destrutivo: true, rotuloConfirmar: 'Excluir documento' })) return;
            try {
                const { error: errVinculo } = await dbAuth.from('cofre_documento_vinculos').delete().eq('id', vinculoId);
                if (errVinculo) throw errVinculo;
                const { error: errDoc } = await dbAuth.from('cofre_documentos').delete().eq('id', doc.id);
                if (errDoc) throw errDoc;
                if (doc.bucket && doc.storage_path) {
                    const { error: errStorage } = await dbAuth.storage.from(doc.bucket).remove([doc.storage_path]);
                    if (errStorage) console.warn('Vínculo excluído, mas o arquivo no Storage não pôde ser removido (órfão, não crítico):', errStorage.message);
                }
                mostrarToast('Documento excluído.');
                if (fichaContratoAtualId) montarDocumentosContrato(fichaContratoAtualId);
            } catch (err) {
                mostrarToast('Erro ao excluir: ' + (err.message || String(err)), 'danger');
            }
        }

        // REMOVIDAS (18/09/2026, pedido explícito: "retirar o X e colocar as
        // ações padrões do documento, abrindo o form de arquivo") —
        // abrirDocumentoContratoAtual() (abria o arquivo cru numa aba nova) e
        // removerDocumentoContratoAtual() (X de exclusão direta, sem
        // confirmação padronizada) saíram de vez. A linha usou
        // data-action="abrir-documento" na v1.10.0 (rodada 9) — trocado na
        // v1.11.0 (rodada 10) por abrirAcoesAnexoContrato() acima, pela
        // causa raiz documentada ali (data-action dependia do módulo Cofre
        // ter bootado, o que não acontece vindo direto de Contratos).
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
                rzAvisar('Não consegui carregar o documento: ' + (err.message || String(err)), 'danger');
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

        // v1.41.0 (be7cdd7c) — contrato aberto a partir de um documento lido pela Raiz IA.
        let documentoParaVincularContrato = null;
        let aoTerminarContratoDoDocumento = null;

        export async function abrirNovoContratoDoDocumento({ ativoId = null, dados = {}, documentoId = null, aoTerminar = null } = {}) {
            const d = dados || {};
            const temAssinando = ativoId && contratos.some(c => c.imovelId === ativoId && c.status === 'Assinando');
            if (ativoId && !temAssinando && imoveis.some(i => i.id === ativoId)) await criarContratoParaImovel(ativoId);
            else await abrirFormularioContrato();
            const wrapper = document.getElementById('form-contrato-wrapper');
            if (!wrapper || wrapper.classList.contains('hidden')) return; // limite do plano barrou a abertura
            if (ativoId && temAssinando) { const sel = document.getElementById('con-imovel'); if (sel) sel.value = ativoId; }
            const iso = (v) => { const t = String(v || '').trim(); if (/^\d{4}-\d{2}-\d{2}/.test(t)) return t.slice(0, 10); const m = t.match(/^(\d{2})\/(\d{2})\/(\d{4})/); return m ? `${m[3]}-${m[2]}-${m[1]}` : ''; };
            const num = (v) => { if (v == null || v === '') return ''; if (typeof v === 'number') return String(v); const t = String(v).replace(/[^\d,.-]/g, ''); return t.includes(',') ? t.replace(/\./g, '').replace(',', '.') : t; };
            const pôr = (id, v, ev = 'change') => { const el = document.getElementById(id); if (!el || v == null || v === '') return; el.value = v; el.dispatchEvent(new Event(ev, { bubbles: true })); };
            const partes = Array.isArray(d.partes) ? d.partes : [];
            const loc = partes.find(p => String(p.papel || '').toLowerCase().startsWith('locat')) || null;
            pôr('con-locatario', loc?.nome, 'input');
            pôr('con-cpf', loc?.documento || loc?.cpf_cnpj, 'input');
            pôr('con-valor', num(d.valor_aluguel ?? d.valor), 'input');
            const dia = parseInt(d.dia_vencimento, 10);
            if (dia >= 1 && dia <= 31) pôr('con-vencimento-dia', String(dia), 'input');
            const ini = iso(d.vigencia_inicio || d.data_inicio || d.data_assinatura);
            const fim = iso(d.vigencia_fim || d.data_fim);
            pôr('con-inicio', ini); pôr('con-fim', fim);
            const indice = String(d.indice_reajuste || d.indice || '').toUpperCase();
            if (indice) pôr('con-reajuste', indice.includes('IGP') ? 'IGP-M' : 'IPCA');
            if (ini && fim) { const hoje = new Date().toISOString().slice(0, 10); pôr('con-status', ini <= hoje && hoje <= fim ? 'Ativo' : 'Assinando'); }
            documentoParaVincularContrato = documentoId || null;
            aoTerminarContratoDoDocumento = typeof aoTerminar === 'function' ? aoTerminar : null;
            mostrarToast('Confira os dados lidos pela Raiz IA e salve o contrato.');
        }

        export async function abrirFormularioContrato() {
            documentoParaVincularContrato = null; aoTerminarContratoDoDocumento = null; // v1.41.0

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

                rzAvisar(`Já são 5 documentos do tipo "${tipo}", o máximo. Remova algum antes de adicionar.`, 'danger');

                inputElement.value = '';

                return;

            }

            const count = Math.min(files.length, vagas);

            if (files.length > vagas) {

                rzAvisar(`Cabem só mais ${vagas} documento(s) do tipo "${tipo}" (máximo de 5). Vão os ${count} primeiro(s).`, 'info');

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

            if (falhas > 0) rzAvisar(`${falhas} documento(s) não puderam ser enviados.`, 'danger');

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

            if (!await rzPerguntar({ titulo: 'Remover documento?', impacto: `"${doc.nome}" é apagado de vez. Não dá para desfazer.`, destrutivo: true, rotuloConfirmar: 'Remover documento' })) return;

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
                    rzAvisar('O documento saiu da tela, mas a limpeza no banco falhou: ' + err.message, 'danger');
                    logScreen('Erro ao remover documento: ' + err.message, true);
                }
            }

            documentosCarregadosContrato = documentosCarregadosContrato.filter(d => d.id !== docId);

            renderPreviewDocumentosContrato();

            if (document.getElementById('con-id').value) {
                renderHistoricoContratoInline(contratos.find(c => c.id === document.getElementById('con-id').value));
            }

        }

        export async function saveContrato(e) {

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
                    rzAvisar('A soma do rateio precisa dar 100%. Hoje está em ' + somaDivisaoContrato + '%.', 'danger');
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
            if(!imoId) { rzAvisar('Escolha o imóvel do contrato.', 'danger'); return false; }

            if(docTipo === 'CPF' && !validarCPF(docVal)) {

                rzAvisar('O CPF informado não é válido.', 'danger');
                return false;

            }

            if(docTipo === 'CNPJ' && !validarCNPJ(docVal)) {

                rzAvisar('O CNPJ informado não é válido.', 'danger');
                return false;

            }

            // v1.27.0 (Bloco B) — mesma regra da CHECK contratos_reajuste_piso_teto_check
            // no banco; valida aqui pra dar um aviso em português em vez de
            // deixar a gravação inteira do contrato falhar com o erro cru
            // do Postgres.
            const reajusteTetoVal = document.getElementById('con-reajuste-teto').value.trim();
            const reajustePisoVal = document.getElementById('con-reajuste-piso').value.trim();
            if (reajusteTetoVal !== '' && reajustePisoVal !== '' && parseFloat(reajustePisoVal) > parseFloat(reajusteTetoVal)) {
                rzAvisar('O piso do reajuste não pode ser maior que o teto.', 'danger');
                return false;
            }

            // v1.28.0 (demanda 11afd25f) — endereço do locatário vem do bloco
            // estruturado do formulário único (lerEnderecoLocatarioDoForm);
            // o texto concatenado continua indo pra locatario_endereco_atual
            // (placeholder de minuta, mesmo formato de sempre) e os campos
            // separados vão pra Parte do locatário (sincronizarContratoSupabase).
            const enderecoLido = lerEnderecoLocatarioDoForm(id);
            if (!enderecoLido.ok) { rzAvisar(enderecoLido.mensagem, 'danger'); return false; }
            document.getElementById('con-locatario-endereco').value = enderecoLido.texto;

            // Lógica de "Novo Valor": o campo sempre abre em branco. Se o usuário

            // digitou algo nele, o valor ATUAL do contrato (antes desta edição) vira

            // valorAnterior, e o valor digitado passa a ser o novo valor vigente. Se

            // o campo ficou em branco, o valor vigente não muda nesta edição.

            const contratoExistente = id ? contratos.find(c => c.id === id) : null;

            const novoValorDigitado = parseFloat(document.getElementById('con-valor-anterior').value);

            // v1.41.0 (Fase 1) — vigência da alteração é obrigatória sempre que
            // houver um novo valor/reajuste digitado no painel de reajuste.
            if (!isNaN(novoValorDigitado) && novoValorDigitado > 0 && !document.getElementById('con-vigente-desde').value) {
                rzAvisar('Informe a partir de quando o novo valor vale (vigência).', 'danger');
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

                // v1.25.0 — só em memória local (sincronizarContratoSupabase,
                // index.html, monta a `linha` persistida campo a campo e não
                // inclui isto); usado por salvarContratoIndividual() para saber
                // se oferece "cadastrar fiador agora" só em contrato NOVO.
                _novo: !id,

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
                // v1.28.0 — só quando a lista é deste contrato E mudou desde
                // que foi carregada (fiadoresParaSalvar, ver comentário lá).
                fiadores: fiadoresParaSalvar(id),

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

                // v1.26.0 (demanda 3b458eb4) — mesma trava do fiadores acima:
                // só entra no payload quando o endereço estruturado foi lido
                // PRA ESTE MESMO contrato no popup "Dados Novo Contrato".
                // sincronizarContratoSupabase() (index.html) usa isto pra
                // gravar rua/número/bairro/cidade/UF/CEP na Parte do
                // locatário, além do texto livre de sempre.
                enderecoLocatarioEstruturado: (enderecoLocatarioEstruturadoAtualPertenceAoId === (id || '__novo__'))
                    ? enderecoLocatarioEstruturadoAtual
                    : undefined,

                inicio: document.getElementById('con-inicio').value,

                fim: dataFim,

                valor: valorFinal,

                valorAnterior: valorAnteriorFinal,

                reajusteAplicado: parseFloat(document.getElementById('con-reajuste-aplicado').value) || 0,

                reajuste: document.getElementById('con-reajuste').value,

                // v1.27.0 (Bloco B, demandas 5ca973d6/854f6343) — em branco
                // vira null (não 0), pra sincronizarContratoSupabase()
                // gravar null nas colunas e o banco entender "não
                // configurado" (as CHECK de contratos_reajuste_* e o
                // trigger tratam null como "sem reajuste/revisional
                // automático aqui", nunca como zero).
                reajustePeriodicidadeMeses: (function() {
                    const v = document.getElementById('con-reajuste-periodicidade').value.trim();
                    return v === '' ? null : parseInt(v, 10);
                })(),
                reajusteTetoPct: (function() {
                    const v = document.getElementById('con-reajuste-teto').value.trim();
                    return v === '' ? null : parseFloat(v);
                })(),
                reajustePisoPct: (function() {
                    const v = document.getElementById('con-reajuste-piso').value.trim();
                    return v === '' ? null : parseFloat(v);
                })(),
                revisionalPeriodicidadeMeses: (function() {
                    const v = document.getElementById('con-revisional-periodicidade').value.trim();
                    return v === '' ? null : parseInt(v, 10);
                })(),

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

                const alteracoesIniciais = [{ campo: 'Contrato criado', de: '-', para: `${contratoDados.locatario} — ${formatarMoedaBR(contratoDados.valor)}/mês` }];

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

            // v1.31.0 — o contexto de retorno é lido ANTES de gravar e usado
            // DEPOIS (ver abaixo), com o id real devolvido pelo banco.
            const ctxRetorno = contextoRetornoEdicaoContrato;
            contextoRetornoEdicaoContrato = null;

            // CORRIGIDO (causa real da demora de ~10s ao salvar 1 contrato):
            // mesmo já restringindo a ROTA para "contratos" em saveAll(), a
            // função por trás dela ainda percorria TODOS os contratos da
            // empresa (11, na Rabelo Testes) a cada gravação — historico,
            // anexos e divisão de CADA UM, não só do editado. Agora sincroniza
            // só o contrato específico que mudou; o resto (renderizações,
            // localStorage) continua igual, é tudo local e rápido.
            // v1.31.0 — ESPERA gravar (o banco devolve o id real e o trigger
            // cria reajuste/revisional) antes de reabrir qualquer ficha.
            const gravou = await salvarContratoIndividual(contratoDados, imovelParaSincronizar);

            registrarLog(id ? 'contratos.editar' : 'contratos.criar', { contratoId: contratoDados.id, locatario: contratoDados.locatario });

            // v1.45.0 (Correção de Direção UX) — "salvar retorna à ficha",
            // nunca à lista, quando a edição foi aberta a partir de um
            // contexto (ficha do imóvel ou ficha do próprio contrato).
            // v1.31.0 — contrato NOVO sem contexto abre a própria ficha.
            if (gravou !== false) {
                // v1.41.0 (be7cdd7c) — contrato nascido de um documento: anexa o documento ao contrato.
                if (documentoParaVincularContrato && !id) {
                    window.dispatchEvent(new CustomEvent('cofre:vincular-documento', { detail: { documentoId: documentoParaVincularContrato, entidadeTipo: 'contrato', entidadeId: contratoDados.id } }));
                }
                documentoParaVincularContrato = null;
                if (aoTerminarContratoDoDocumento) { const f = aoTerminarContratoDoDocumento; aoTerminarContratoDoDocumento = null; setTimeout(f, 700); }
                if (ctxRetorno && ctxRetorno.tipo === 'fichaImovel') {
                    abrirFichaImovel(ctxRetorno.id);
                } else if ((ctxRetorno && ctxRetorno.tipo === 'fichaContrato') || !id) {
                    abrirFichaContrato(contratoDados.id);
                }
                window.dispatchEvent(new CustomEvent('cofre:recarregar-ativos'));
                // v1.33.0 (demanda 854f6343) — imóvel sem item de IPTU/condomínio:
                // oferece criar (não bloqueia o salvar; erro aqui só vira aviso).
                setTimeout(() => { oferecerItensEncargoContrato(contratoDados).catch(err => console.warn('[contratos] encargos:', err.message)); }, 400);
            }

            } catch (err) {

                rzResumo({ titulo: 'Não consegui salvar o contrato', linhas: [err.message, 'Se continuar, envie esta mensagem ao suporte da Raiz.'] });

                devLog("ERRO_SALVAR_CONTRATO", `Falha ao salvar contrato: ${err.message}`, err);

                return false;

            }

        }

        // ===================================================================
        // v1.33.0 (demanda 854f6343, pedido do Nicola: "imóvel sem item — o
        // formulário oferece criar") — depois de salvar um contrato vigente,
        // se ele trata de IPTU/condomínio (locatário paga, ou valor informado)
        // e o imóvel ainda não tem o item de controle correspondente, abre um
        // sheet para criar: 1º vencimento + valor (vem do contrato). Quem cria
        // é o banco (fn_contrato_criar_item_encargo): item no IMÓVEL, com quem
        // paga já definido pelo contrato e a 1ª ocorrência; pago pelo
        // locatário não gera saída no Financeiro.
        // ===================================================================
        // v1.36.0 (encargos v3, plano aprovado 02/10 23:47): cada contrato tem o
        // SEU item de IPTU e de condomínio, um por ano, com responsável fixo. O
        // banco calcula o rateio (fn_contrato_criar_item_encargo): IPTU devido =
        // valor anual × dias do contrato no ano ÷ dias do ano, nas parcelas que
        // faltam até dezembro; condomínio por competência a partir do 1º
        // vencimento, mês parcial proporcional aos dias. O período do ano sem
        // contrato vira o item "vago" do proprietário, mantido pelo banco. O
        // sheet só ANTECIPA a conta para o usuário conferir — a regra é do banco.
        const ENCARGOS_CONTRATO = [
            { codigo: 'iptu_global', nome: 'IPTU', paga: c => c.locatarioPagaIptu === 'Sim', valor: c => Number(c.iptuValor) || 0, dica: 'Próxima parcela do carnê, ou a cota única' },
            { codigo: 'condominio', nome: 'Condomínio', paga: c => c.condominioLocatario === 'Sim', valor: c => Number(c.condominioValor) || 0, dica: 'Vencimento do boleto do 1º mês a lançar' },
        ];

        const isoDia = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const dataLocal = iso => { const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number); return new Date(y, m - 1, d); };
        const diasEntre = (a, b) => Math.round((dataLocal(b) - dataLocal(a)) / 86400000) + 1;
        const brData = iso => String(iso).slice(0, 10).split('-').reverse().join('/');

        // período do contrato dentro do ano (mesma regra do banco)
        function periodoContratoNoAno(con, ano) {
            const ini = [con.inicio && String(con.inicio).slice(0, 10), `${ano}-01-01`].filter(Boolean).sort().pop();
            const fim = [con.fim && String(con.fim).slice(0, 10), `${ano}-12-31`].filter(Boolean).sort()[0];
            return ini <= fim ? { ini, fim, dias: diasEntre(ini, fim), diasAno: diasEntre(`${ano}-01-01`, `${ano}-12-31`) } : null;
        }

        // parcelas que faltam até dezembro: mensais a partir do 1º vencimento, no máximo n
        function parcelasIptuAteDezembro(dataIso, n) {
            if (!dataIso) return 0;
            const mes = Number(dataIso.slice(5, 7));
            return Math.max(0, Math.min(Math.max(1, Number(n) || 1), 12 - mes + 1));
        }

        // condomínio: competências do período a partir do mês do 1º vencimento, mês parcial proporcional
        function competenciasCondominio(per, ano, desdeIso, valorMensal) {
            const out = [];
            for (let m = 1; m <= 12; m++) {
                const ini = `${ano}-${String(m).padStart(2, '0')}-01`;
                if (desdeIso && ini < desdeIso.slice(0, 8) + '01') continue;
                const fim = isoDia(new Date(ano, m, 0));
                const a = per.ini > ini ? per.ini : ini, b = per.fim < fim ? per.fim : fim;
                if (a > b) continue;
                const d = diasEntre(a, b), dm = diasEntre(ini, fim);
                out.push({ m, d, dm, valor: Math.round(valorMensal * d / dm * 100) / 100 });
            }
            return out;
        }

        export async function oferecerItensEncargoContrato(con) {
            if (!con || !idEhUuidValido(con.id) || !con.imovelId) return;
            // v1.36.1 (pedido do Nicola 03/10 11:20): só com o contrato ATIVO — em
            // Assinando a data e o contrato ainda não estão confirmados. Ao ativar
            // (formulário salvo com status Ativo) o sheet aparece.
            if (con.status !== 'Ativo') return;
            const candidatos = ENCARGOS_CONTRATO.filter(e => e.paga(con) || e.valor(con) > 0);
            if (!candidatos.length) return;
            const hojeIso = isoDia(new Date());
            // ano de referência: o atual, ou o do início do contrato se ele começa depois
            const anoRef = Math.max(new Date().getFullYear(), Number(String(con.inicio || '').slice(0, 4)) || 0);
            const per = periodoContratoNoAno(con, anoRef);
            if (!per) return;
            const { data: subtipos, error: e1 } = await dbAuth.from('cofre_controle_subtipos').select('id, codigo').in('codigo', candidatos.map(e => e.codigo));
            if (e1) throw e1;
            const { data: itens, error: e2 } = await dbAuth.from('cofre_itens_controle').select('subtipo_id, recorrente, data_base, contrato_id, rateio')
                .eq('ativo_id', con.imovelId).eq('ativo', true).in('subtipo_id', (subtipos || []).map(x => x.id));
            if (e2) throw e2;
            const codigoDe = id => (subtipos || []).find(x => x.id === id)?.codigo;
            // já resolvido: item deste contrato no ano, ou item do modelo anterior (recorrente ou do ano)
            const existentes = new Set((itens || []).filter(i => i.rateio
                ? (i.contrato_id === con.id && Number(i.rateio.ano) === anoRef)
                : (i.recorrente || Number(String(i.data_base || '').slice(0, 4)) === anoRef)).map(i => codigoDe(i.subtipo_id)));
            const faltando = candidatos.filter(e => !existentes.has(e.codigo));
            if (!faltando.length || typeof abrirSheetForm !== 'function') return;

            // padrões de IPTU da cidade do imóvel (calendário + parte padrão)
            let cal = null, credor = '';
            const subIptu = (subtipos || []).find(x => x.codigo === 'iptu_global');
            if (subIptu && faltando.some(e => e.codigo === 'iptu_global')) {
                try {
                    const { data: atv } = await dbAuth.from('cofre_ativos').select('uf, codigo_ibge_municipio').eq('id', con.imovelId).maybeSingle();
                    if (atv?.codigo_ibge_municipio || atv?.uf) {
                        const { data: cals } = await dbAuth.from('cofre_calendario_tributo').select('municipio_ibge, uf, parcelas')
                            .eq('subtipo_id', subIptu.id).eq('exercicio', anoRef).eq('ativo', true);
                        cal = (cals || []).find(c => atv.codigo_ibge_municipio && c.municipio_ibge === atv.codigo_ibge_municipio)
                            || (cals || []).find(c => !c.municipio_ibge && atv.uf && c.uf === atv.uf) || null;
                        const { data: pp } = await dbAuth.rpc('fn_parte_padrao_resolver', { p_subtipo_id: subIptu.id, p_uf: atv.uf || null, p_municipio_ibge: atv.codigo_ibge_municipio || null, p_exercicio: anoRef });
                        credor = (Array.isArray(pp) ? pp[0]?.nome : pp?.nome) || '';
                    }
                } catch (err) { console.warn('[contratos] padrões de IPTU:', err.message); }
            }
            const datasCal = cal ? (cal.parcelas || []).map(p => `${anoRef}-${String(p.mes).padStart(2, '0')}-${String(p.dia).padStart(2, '0')}`).sort() : [];
            const restantesCal = datasCal.filter(d => d >= hojeIso);
            const pctTxt = `${(100 * per.dias / per.diasAno).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
            const periodoTxt = `${brData(per.ini)} a ${brData(per.fim)} = ${per.dias} dias (${pctTxt} de ${per.diasAno})`;

            const blocoIptu = (e) => `
                    <div class="rz-f2" style="margin-top:8px">
                        <div class="rz-f"><label>IPTU do ano (R$) <i>*</i></label><input type="number" step="0.01" min="0" data-campo="valor" value="${e.valor(con) || ''}"><span class="rz-hint">Valor total do carnê de ${anoRef}</span></div>
                        <div class="rz-f"><label>Parcelas no ano${cal ? '' : ' <i>*</i>'}</label><input type="number" min="1" max="12" step="1" data-campo="parcelas" value="${cal ? (datasCal.length || 1) : 1}"${cal ? ' disabled' : ''}><span class="rz-hint">${cal ? 'Calendário da cidade' : '1 = à vista'}</span></div>
                    </div>
                    <div class="rz-f2">
                        <div class="rz-f"><label>1º vencimento <i>*</i></label><input type="date" data-campo="data" value="${cal ? (restantesCal[0] || '') : ''}"><span class="rz-hint">${e.dica}</span></div>
                        <div class="rz-f"></div>
                    </div>
                    <div class="rz-f"><span class="rz-hint" data-campo="resumo"></span></div>`;
            const blocoCond = (e) => `
                    <div class="rz-f2" style="margin-top:8px">
                        <div class="rz-f"><label>Valor mensal (R$) <i>*</i></label><input type="number" step="0.01" min="0" data-campo="valor" value="${e.valor(con) || ''}"></div>
                        <div class="rz-f"><label>1º vencimento <i>*</i></label><input type="date" data-campo="data"><span class="rz-hint">${e.dica}</span></div>
                    </div>
                    <div class="rz-f"><span class="rz-hint" data-campo="resumo"></span></div>`;

            const corpo = `<p class="rz-desc" style="margin:0 2px 10px">Cada contrato tem o seu item de ${faltando.map(e => e.nome).join(' e de ')} em ${anoRef}, proporcional ao período dele no ano: <b>${periodoTxt}</b>. O período sem contrato fica num item "vago" do proprietário, criado automaticamente.</p>` +
                faltando.map(e => `
                <div class="rz-card" data-encargo="${e.codigo}">
                    <label style="display:flex;align-items:center;gap:8px;font-weight:600;font-size:14px;color:var(--ink)">
                        <input type="checkbox" data-campo="criar" checked> ${e.nome} ${anoRef} deste contrato
                        <span class="rz-st rz-${e.paga(con) ? 'run' : 'neu'}" style="margin-left:auto">${e.paga(con) ? 'Paga: locatário' : 'Paga: proprietário'}</span>
                    </label>
                    ${e.codigo === 'iptu_global' ? blocoIptu(e) : blocoCond(e)}
                </div>`).join('');

            // memória de cálculo antecipada (o banco refaz a mesma conta ao criar)
            const atualizarResumo = (corpoEl) => {
                corpoEl.querySelectorAll('[data-encargo]').forEach(el => {
                    const res = el.querySelector('[data-campo="resumo"]'); if (!res) return;
                    const valor = parseFloat(el.querySelector('[data-campo="valor"]').value) || 0;
                    const d = el.querySelector('[data-campo="data"]').value;
                    if (el.dataset.encargo === 'iptu_global') {
                        const devido = Math.round(valor * per.dias / per.diasAno * 100) / 100;
                        const n = cal ? datasCal.filter(x => d && x >= d).length : parcelasIptuAteDezembro(d, el.querySelector('[data-campo="parcelas"]').value);
                        res.textContent = valor > 0
                            ? `IPTU ${formatarMoedaBR(valor)} × ${per.dias}/${per.diasAno} dias (${pctTxt}) = devido ${formatarMoedaBR(devido)}` +
                              (d && n ? ` · ${n === 1 ? 'à vista' : `${n} parcelas de ${formatarMoedaBR(Math.round(devido / n * 100) / 100)}`}` : ' · informe o 1º vencimento') +
                              (credor ? ` · Credor: ${credor}` : '')
                            : 'Informe o IPTU do ano para ver o valor devido por este contrato.';
                    } else {
                        const comps = d ? competenciasCondominio(per, anoRef, d, valor) : [];
                        const total = Math.round(comps.reduce((t, c) => t + c.valor, 0) * 100) / 100;
                        const parciais = comps.filter(c => c.d < c.dm).map(c => `${String(c.m).padStart(2, '0')}/${anoRef}: ${c.d}/${c.dm} dias`);
                        res.textContent = valor > 0 && d
                            ? (comps.length ? `${comps.length} competência(s) de ${String(comps[0].m).padStart(2, '0')} a ${String(comps[comps.length - 1].m).padStart(2, '0')}/${anoRef} = ${formatarMoedaBR(total)}${parciais.length ? ' · proporcional: ' + parciais.join('; ') : ''}` : 'Nenhuma competência do contrato a partir dessa data.')
                            : 'Informe o valor mensal e o 1º vencimento.';
                    }
                });
            };

            const sheetEnc = abrirSheetForm({
                titulo: 'Itens do imóvel', sub: con.locatario || '', corpo, rotuloSalvar: 'Criar', rotuloCancelar: 'Agora não',
                aoSalvar: async (corpoEl) => {
                    const escolhidos = [...corpoEl.querySelectorAll('[data-encargo]')].filter(el => el.querySelector('[data-campo="criar"]').checked);
                    for (const el of escolhidos) {
                        const d = el.querySelector('[data-campo="data"]').value;
                        const valor = parseFloat(el.querySelector('[data-campo="valor"]').value);
                        if (!(valor > 0)) {
                            mostrarToast(el.dataset.encargo === 'iptu_global' ? 'Informe o IPTU do ano.' : 'Informe o valor mensal do condomínio.', 'danger');
                            el.querySelector('[data-campo="valor"]').focus();
                            return false;
                        }
                        if (!d) {
                            mostrarToast('Informe o 1º vencimento de cada item que vai criar.', 'danger');
                            el.querySelector('[data-campo="data"]').focus();
                            return false;
                        }
                        if (Number(d.slice(0, 4)) !== anoRef) {
                            mostrarToast(`Os itens são de ${anoRef}: use um vencimento em ${anoRef}.`, 'danger');
                            el.querySelector('[data-campo="data"]').focus();
                            return false;
                        }
                    }
                    let criados = 0;
                    for (const el of escolhidos) {
                        const parc = el.querySelector('[data-campo="parcelas"]');
                        const { error } = await dbAuth.rpc('fn_contrato_criar_item_encargo', {
                            p_contrato_id: con.id, p_codigo: el.dataset.encargo,
                            p_data_base: el.querySelector('[data-campo="data"]').value,
                            p_valor: parseFloat(el.querySelector('[data-campo="valor"]').value),
                            p_parcelas: parc ? Math.max(1, parseInt(parc.value, 10) || 1) : null,
                        });
                        if (error) { mostrarToast('Não consegui criar o item: ' + error.message, 'danger'); return false; }
                        criados++;
                    }
                    if (criados) {
                        mostrarToast(criados === 1 ? 'Item criado no imóvel.' : `${criados} itens criados no imóvel.`, 'success');
                        registrarLog('contratos.editar', { contratoId: con.id, acao: 'encargo_item_criado', quantidade: criados, ano: anoRef });
                        window.dispatchEvent(new CustomEvent('cofre:recarregar-ativos'));
                        window.dispatchEvent(new CustomEvent('cofre:recarregar-eventos'));
                    }
                    return true;
                },
            });
            const corpoEnc = sheetEnc?.querySelector('#rz-sheet-corpo');
            if (corpoEnc) {
                corpoEnc.querySelectorAll('[data-encargo] input').forEach(i => i.addEventListener('input', () => atualizarResumo(corpoEnc)));
                atualizarResumo(corpoEnc);
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
            // v1.28.0 (demanda 11afd25f) — bloco estruturado; os campos
            // separados chegam logo abaixo (Parte do locatário, assíncrono).
            montarEnderecoLocatarioForm({}, con.locatarioEnderecoAtual || '');
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

            // v1.27.0 (Bloco B) — reflete o que JÁ está salvo no contrato,
            // nunca o padrão de contrato novo (12/branco): um contrato dos
            // 72 já cadastrados, sem periodicidade configurada, tem que
            // continuar sem periodicidade depois de editado e salvo de
            // novo — sem isso, QUALQUER edição de um contrato antigo (até
            // trocar o telefone do locatário) geraria um item de reajuste
            // pra ele, o backfill que o Nicola pediu explicitamente pra não
            // fazer ("só de renovação que faltam").
            document.getElementById('con-reajuste-periodicidade').value = con.reajustePeriodicidadeMeses ?? '';
            document.getElementById('con-reajuste-teto').value = con.reajusteTetoPct ?? '';
            document.getElementById('con-reajuste-piso').value = con.reajustePisoPct ?? '';
            document.getElementById('con-revisional-periodicidade').value = con.revisionalPeriodicidadeMeses ?? '';

            document.getElementById('con-contato-nome').value = con.contatoNome || '';

            document.getElementById('con-forma-pagamento').value = (con.formaPagamento === 'Depósito' ? 'Transferência' : con.formaPagamento) || 'PIX'; // v1.38.0 (F0.3)

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

            // v1.25.0 (demanda 11afd25f + ec7d8a9f) — ao editar, os campos
            // opcionais já nascem visíveis (mesma regra do bloco "mais campos"
            // de imóvel: nunca esconder dado que a pessoa já preencheu antes).
            document.getElementById('con-campos-avancados')?.classList.remove('hidden');
            const btnAvancadoEditar = document.getElementById('con-toggle-mais-campos');
            if (btnAvancadoEditar) btnAvancadoEditar.textContent = '− Ocultar campos avançados';

            renderHistoricoContratoInline(con);

            // v1.17.0 (demanda c75076ed, item 2 — "remover o componente de
            // Histórico do formulário de criação, só faz sentido depois que
            // o contrato já existe") — mesmo mecanismo de #secao-avancada-
            // -contrato (linha acima): mostra ao EDITAR, esconde ao criar
            // (ver cancelarEdicaoContrato).
            document.getElementById('con-historico-bloco')?.classList.remove('hidden');

            document.getElementById('form-contrato-titulo').innerText = "Editar contrato";

            // v1.28.0 (demanda 11afd25f) — fiadores na mesma tela e endereço
            // separado do locatário, os dois lidos do banco. Enquanto carrega,
            // o dono da lista de fiadores fica null: um "Salvar" apressado
            // não toca nos fiadores (ver fiadoresParaSalvar).
            fiadoresListaAlvoId = 'con-fiadores-lista';
            fiadoresContratoAtual = [];
            fiadoresContratoAtualPertenceAoId = null;
            const listaFiadoresEl = document.getElementById('con-fiadores-lista');
            if (listaFiadoresEl) listaFiadoresEl.innerHTML = '<p style="font-size:12px;color:var(--muted)">Carregando fiadores...</p>';
            (async function() {
                let cid = con.id;
                if (!idEhUuidValido(cid)) { await aguardarIdRealDoContrato(con); cid = con.id; }
                const campoId = document.getElementById('con-id');
                if (!campoId || (campoId.value !== id && campoId.value !== cid)) return; // o formulário já é de outro contrato
                if (campoId.value !== cid) campoId.value = cid;
                const [enderecoParte] = await Promise.all([carregarEnderecoParteLocatario(cid), carregarFiadoresContrato(cid)]);
                if (document.getElementById('con-id')?.value !== cid) return;
                renderFiadoresPopup();
                if (enderecoParte && (enderecoParte.endereco_rua || enderecoParte.endereco_cidade) && !enderecoLocatarioFormPreenchido()) {
                    montarEnderecoLocatarioForm(enderecoParte, con.locatarioEnderecoAtual || '');
                }
            })();

            document.getElementById('form-contrato-wrapper').classList.remove('hidden');

            sincronizarBotaoToggleContrato();

            window.scrollTo({top: 0, behavior: 'smooth'});

            } catch (err) {

                rzAvisar('Não consegui abrir a edição do contrato: ' + err.message, 'danger');

                devLog("ERRO_EDITAR_CONTRATO", `Falha ao abrir edição: ${err.message}`, err);

            }

        }

        // ===================================================================
        // v1.28.0 (demanda 11afd25f) — formulário único de contrato: endereço
        // estruturado do locatário e fiadores na mesma tela.
        // ===================================================================
        // Bloco de endereço com prefixo 'con-loc' (ids con-loc-cep, -rua, -num,
        // -comp, -bairro, -cidade, -uf, -ibge), dentro de
        // #con-locatario-endereco-bloco. #con-locatario-endereco (hidden)
        // guarda o texto livre já salvo no contrato — contratos antigos e os
        // que vieram do link público só têm esse texto; ele aparece como dica
        // e é mantido se o bloco ficar em branco (nunca apaga o que já existe).
        function montarEnderecoLocatarioForm(valores, textoSalvo) {
            const alvo = document.getElementById('con-locatario-endereco-bloco');
            if (!alvo) return;
            alvo.innerHTML = renderizarBlocoEndereco('con-loc', valores || {}, { mostrarBotaoCopiar: false });
            const salvoEl = document.getElementById('con-locatario-endereco-salvo');
            if (salvoEl) {
                const temEstruturado = !!(valores && (valores.endereco_rua || valores.endereco_cidade));
                salvoEl.textContent = (textoSalvo && !temEstruturado)
                    ? 'Endereço salvo hoje: ' + textoSalvo + '. Preencha os campos acima para separar rua, número e cidade (em branco, ele continua como está).'
                    : '';
                salvoEl.classList.toggle('hidden', !salvoEl.textContent);
            }
        }

        function enderecoLocatarioFormPreenchido() {
            return ['cep', 'rua', 'num', 'bairro', 'cidade'].some(function(k) {
                return ((document.getElementById('con-loc-' + k) || {}).value || '').trim() !== '';
            });
        }

        // Campos separados do endereço, lidos da Parte do locatário (partes +
        // partes_papeis, papel='locatario') — onde sincronizarContratoSupabase
        // (index.html) grava rua/número/cidade/UF/CEP desde a v1.272.0.
        async function carregarEnderecoParteLocatario(contratoId) {
            if (!idEhUuidValido(contratoId)) return null;
            try {
                const { data: papel } = await dbAuth.from('partes_papeis').select('parte_id')
                    .eq('entidade_tipo', 'contrato').eq('entidade_id', contratoId)
                    .eq('papel', 'locatario').eq('ativo', true).limit(1).maybeSingle();
                if (!papel || !papel.parte_id) return null;
                const { data: parte } = await dbAuth.from('partes')
                    .select('endereco_rua, endereco_num, endereco_comp, endereco_bairro, endereco_cidade, uf, cep, codigo_ibge_municipio')
                    .eq('id', papel.parte_id).maybeSingle();
                return parte || null;
            } catch (err) {
                console.warn('[contratos] Falha ao ler o endereço da Parte do locatário:', err.message);
                return null;
            }
        }

        // Usado por saveContrato(): devolve o texto que vai pro contrato
        // (locatario_endereco_atual) e deixa os campos separados prontos pra
        // Parte (enderecoLocatarioEstruturadoAtual, mesma trava por id).
        function lerEnderecoLocatarioDoForm(idContrato) {
            enderecoLocatarioEstruturadoAtual = null;
            enderecoLocatarioEstruturadoAtualPertenceAoId = idContrato || '__novo__';
            const textoSalvo = ((document.getElementById('con-locatario-endereco') || {}).value || '').trim();
            if (!document.getElementById('con-loc-rua')) {
                return textoSalvo ? { ok: true, texto: textoSalvo } : { ok: false, mensagem: '⚠️ Preencha o endereço do locatário.' };
            }
            const estruturado = lerBlocoEndereco('con-loc');
            if (estruturado.endereco_rua || estruturado.endereco_cidade) {
                enderecoLocatarioEstruturadoAtual = estruturado;
                return { ok: true, texto: formatarEnderecoParte(estruturado) };
            }
            if (textoSalvo) return { ok: true, texto: textoSalvo };
            return { ok: false, mensagem: '⚠️ Preencha o endereço do locatário (ao menos rua e cidade).' };
        }

        // Estado de fiadores do formulário único: lista vazia de contrato novo.
        function prepararFiadoresFormNovo() {
            fiadoresListaAlvoId = 'con-fiadores-lista';
            fiadoresContratoAtual = [];
            fiadoresContratoAtualPertenceAoId = '__novo__';
            fiadoresContratoAtualSnapshot = '[]';
            renderFiadoresPopup();
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
        export async function criarContratoParaImovel(imovelId) {
            let imo = imoveis.find(i => i.id === imovelId);

            // v1.23.1 (demanda 303e68dc) — o ativo pode ainda não estar no
            // array `imoveis` em memória logo após ser cadastrado: a
            // atualização é assíncrona (aoEscrever('ativo', ...), index.html)
            // e pode não ter terminado quando o usuário já toca em "Cadastrar
            // contrato manualmente" a partir do próprio ativo recém-criado.
            // Antes, `if (!imo) return;` falhava em silêncio. Tenta 1 recarga
            // direta do Supabase antes de desistir de verdade.
            if (!imo) {
                try {
                    imoveis = await carregarImoveisSupabase();
                    try { localStorage.setItem(chaveLocal('imoveis'), JSON.stringify(imoveis)); } catch (e) { /* cache best-effort */ }
                } catch (err) {
                    devLog('ERRO_CRIAR_CONTRATO_IMOVEL', `Falha ao recarregar imóveis: ${err.message}`, err);
                }
                imo = imoveis.find(i => i.id === imovelId);
            }

            if (!imo) {
                mostrarToast('Não encontrei este imóvel — atualize a página e tente de novo.', 'danger');
                return;
            }

            const contratoAssinandoExistente = contratos.find(c => c.imovelId === imovelId && c.status === 'Assinando');

            // v1.3.1 (E0.1 / A6) — switchTab('tab-contratos') e o setTimeout(150)
            // sairam: o wrapper agora vive no <body> (rzMoverFormContratoParaBody,
            // index.html v1.181.0), entao o formulario abre por cima de onde o
            // usuario estiver, sem trocar de aba e sem esperar a aba aparecer.
            // cancelarEdicaoContrato() aqui e so RESET de formulario, nao um
            // cancelamento de verdade: a origem (ficha do ativo) e preservada,
            // senao o reset ja consumia window.fichaContratoOrigem e o Cancelar
            // seguinte nao sabia mais para onde voltar.
            const origemAoAbrir = window.fichaContratoOrigem;
            window.fichaContratoOrigem = null;
            cancelarEdicaoContrato();
            window.fichaContratoOrigem = origemAoAbrir;

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

            // v1.28.0 (demanda 11afd25f) — mesmos padrões que o antigo popup
            // "Dados Novo Contrato" usava: aluguel do imóvel e vencimento dia 5
            // (os dois continuam editáveis).
            const campoValorNovo = document.getElementById('con-valor');
            if (campoValorNovo && !campoValorNovo.value && imo.valor) campoValorNovo.value = imo.valor;
            const campoVencNovo = document.getElementById('con-vencimento-dia');
            if (campoVencNovo && !campoVencNovo.value) campoVencNovo.value = 5;

            document.getElementById('form-contrato')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        export function cancelarEdicaoContrato() {

            activeConId = null;

            document.getElementById('con-id').value = '';

            document.getElementById('form-contrato').reset();

            // v1.28.0 (demanda 11afd25f) — hidden não volta com reset(); o
            // bloco de endereço e a lista de fiadores nascem vazios.
            document.getElementById('con-locatario-endereco').value = '';
            montarEnderecoLocatarioForm({}, '');
            prepararFiadoresFormNovo();

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

            // v1.25.0 (demanda 11afd25f + ec7d8a9f) — contrato novo nasce com os
            // campos opcionais escondidos (formulário mais curto); editarContrato()
            // reabre ao editar um contrato existente.
            const blocoAvancadoReset = document.getElementById('con-campos-avancados');
            if (blocoAvancadoReset) blocoAvancadoReset.classList.add('hidden');
            const btnAvancadoReset = document.getElementById('con-toggle-mais-campos');
            if (btnAvancadoReset) btnAvancadoReset.textContent = '+ Mostrar mais campos';

            renderHistoricoContratoInline(null);

            // v1.17.0 (demanda c75076ed, item 2) — contrato novo não tem
            // histórico ainda (o primeiro item só nasce ao salvar); esconde
            // a caixa inteira em vez de mostrar vazia. editarContrato() é
            // quem mostra de novo, ao abrir um contrato já existente.
            document.getElementById('con-historico-bloco')?.classList.add('hidden');

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

            if (alertas.length > 0) rzResumo({ titulo: 'Alertas do contrato', linhas: alertas }); else rzAvisar('Sem alertas para este contrato.', 'success');

        }

        // v1.110.0 (fatia 4) — chips de filtro da lista de Contratos, em 1
        // linha (.rz-chips), com contador. Só escrevem no <select> e no
        // checkbox que já existiam no overlay de busca — renderContratos()
        // continua sendo a única função que filtra.
        let contratosChipAtual = 'todos';

        // F2.4 — conjuntos dos chips de ação, lidos do Motor de Alertas (aba Alertas ou Hoje). Sem os
        // alertas carregados, cai na regra local de sempre. Devolve também o pior alerta de cada conjunto.
        function contratosPorAcao() {
            let fonte = [];
            try {
                fonte = (typeof alertasVisiveisTodos !== 'undefined' && alertasVisiveisTodos && alertasVisiveisTodos.length) ? alertasVisiveisTodos
                    : ((typeof geralVisiveisTodos !== 'undefined' && geralVisiveisTodos) || []);
            } catch (_) { fonte = []; }
            const sets = { alerta: new Set(), reajustar: new Set(), vencendo: new Set() };
            const critico = { alerta: false, reajustar: false, vencendo: false };
            if (fonte.length) {
                fonte.forEach(r => {
                    const id = r.entidade_tipo === 'contrato' ? r.entidade_id : (r.detalhe?.contrato_id || null);
                    if (!id) return;
                    const crit = r.severidade === 'critico';
                    sets.alerta.add(id); if (crit) critico.alerta = true;
                    if (r.tipo_alerta === 'reajuste_aniversario') { sets.reajustar.add(id); if (crit) critico.reajustar = true; }
                    if (r.tipo_alerta === 'contrato_encerramento') { sets.vencendo.add(id); if (crit) critico.vencendo = true; }
                });
            } else {
                const em90 = new Date(); em90.setDate(em90.getDate() + 90);
                contratos.forEach(c => {
                    const venc = contratoVencido(c) || (c.status === 'Ativo' && c.fim && new Date(c.fim + 'T00:00:00') <= em90);
                    if (contratoPrecisaRevisao(c)) sets.reajustar.add(c.id);
                    if (venc) sets.vencendo.add(c.id);
                    if (contratoPrecisaRevisao(c) || contratoVencido(c) || contratoAguardandoAssinatura(c) || venc) sets.alerta.add(c.id);
                    if (contratoVencido(c)) { critico.alerta = true; critico.vencendo = true; }
                });
            }
            return { sets, critico };
        }

        export function renderChipsContratos() {
            const wrap = document.getElementById('contratos-chips');
            if (!wrap) return;
            // F2.4 (UXR-13/14/15) — Todos → ação (ponto, só > 0) → estado (Vigentes e Encerrados sempre).
            const { sets, critico } = contratosPorAcao();
            const ids = new Set(contratos.map(c => c.id));
            const conta = set => [...set].filter(id => ids.has(id)).length;
            const grupos = [
                { chave: 'todos', rotulo: 'Todos', qtd: contratos.length, sempre: true },
                { chave: 'alerta', rotulo: 'Com alerta', qtd: conta(sets.alerta), acao: true, crit: critico.alerta },
                { chave: 'reajustar', rotulo: 'A reajustar', qtd: conta(sets.reajustar), acao: true, crit: critico.reajustar },
                { chave: 'vencendo', rotulo: 'Vencendo 90 d', qtd: conta(sets.vencendo), acao: true, crit: critico.vencendo },
                { chave: 'Ativo', rotulo: 'Vigentes', qtd: contratos.filter(c => c.status === 'Ativo').length, sempre: true },
                { chave: 'Assinando', rotulo: 'Assinando', qtd: contratos.filter(c => c.status === 'Assinando').length },
                { chave: 'Finalizado', rotulo: 'Encerrados', qtd: contratos.filter(c => c.status === 'Finalizado').length, sempre: true },
            ];
            wrap.innerHTML = grupos.filter(g => g.sempre || g.qtd > 0 || contratosChipAtual === g.chave).map(g => {
                const ponto = g.acao && g.qtd ? `<span class="rz-pt ${g.crit ? 'rz-bad' : 'rz-warn'}" aria-hidden="true"></span>` : '';
                return `<button type="button" onclick="filtrarContratosPorChip('${g.chave}')" class="rz-chip ${contratosChipAtual === g.chave ? 'rz-on' : ''}">${ponto}${g.rotulo} <span class="rz-n">${g.qtd}</span></button>`;
            }).join('');
        }

        export function filtrarContratosPorChip(chave) {
            contratosChipAtual = chave;
            const sel = document.getElementById('contratos-filtro-status');
            const chk = document.getElementById('contratos-filtro-somente-alerta');
            const deAcao = ['alerta', 'reajustar', 'vencendo'].includes(chave); // F2.4
            if (sel) sel.value = (chave === 'todos' || deAcao) ? 'todos' : chave;
            if (chk) chk.checked = deAcao;
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

            let conjuntosAcao = null; // F2.4 — calculado 1x por desenho, só se o filtro de alerta estiver ligado
            const passaFiltroContrato = (con) => {
                const imoDoContrato = imoveis.find(i => i.id === con.imovelId);
                if (fEmpCon !== 'todos' && (!imoDoContrato || imoDoContrato.empreendimento !== fEmpCon)) return false;
                if (fStatusCon !== 'todos' && con.status !== fStatusCon) return false;
                if (fImovelIdCon !== 'todos' && con.imovelId !== fImovelIdCon) return false;
                if (fLocatarioCon !== 'todos' && con.locatario !== fLocatarioCon) return false;
                // v1.44.2 — checkbox "só com alerta", ligado a partir da
                // Visão Geral ou manualmente aqui na própria aba.
                if (document.getElementById('contratos-filtro-somente-alerta')?.checked) {
                    // F2.4 — com um chip de ação aceso, filtra pelo conjunto dele (Motor); marcado à mão
                    // no filtro, vale "Com alerta"
                    const chave = ['alerta', 'reajustar', 'vencendo'].includes(contratosChipAtual) ? contratosChipAtual : 'alerta';
                    if (!conjuntosAcao) conjuntosAcao = contratosPorAcao().sets;
                    if (!conjuntosAcao[chave].has(con.id)) return false;
                }
                return true;
            };

            // v7.3.3 — Os números-resumo (removidos da tela em v1.99.0,
            // "não tem o resumo de contratos no topo" — nenhuma outra aba
            // primária tinha essa caixa) não são mais exibidos, mas o
            // filtro em si continua igual.
            //
            // Onda 12 (16/09/2026, pedido explícito: "retirar a faixa de
            // aviso no topo da tela de contratos") — banner-revisao-
            // contratos ("⚠️ Você tem alertas em contratos!") removido
            // daqui e do index.html: resíduo de antes do Motor de
            // Alertas, redundante desde a v1.110.0 — cada contrato já
            // mostra o motivo certo no próprio status da linha
            // (statusContratoHtml logo abaixo: Vencido/Reajustar/
            // Assinando), então um aviso genérico no topo só duplicava a
            // informação sem dizer qual contrato. pendentesRevisao/
            // vencidos saíram junto — só existiam pra alimentar o banner.

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
                // v1.28.0 (demanda 11afd25f) — sem filtro, o vazio ganha o
                // atalho "+ Novo contrato" (mesmo padrão do vazio de Ativos).
                const comFiltroCon = fStatusCon !== 'todos' || fEmpCon !== 'todos' || fLocatarioCon !== 'todos';
                container.innerHTML = `<div class="rz-card"><div class="rz-empty"><div class="rz-ic"><svg data-lucide="file-text"></svg></div><p>Nenhum contrato ${comFiltroCon ? 'neste filtro' : 'ainda'}. Um contrato vigente é o que transforma um imóvel em receita.</p>${comFiltroCon ? '' : '<div class="rz-acts"><button type="button" class="rz-btn rz-btn-1" onclick="abrirEscolhaNovoContrato()"><svg data-lucide="plus"></svg> Novo contrato</button></div>'}</div></div>`;
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


// v1.40.0 (UX F1.4a, demanda c71f617c) — esqueleto no lugar de "Carregando…" (UXR, REGRAS §8).
// window.rzSkeleton vive no index.html; no cofre.html avulso cai no texto de antes.
function rzSk(tipo, n) {
    return (typeof window !== 'undefined' && typeof window.rzSkeleton === 'function')
        ? window.rzSkeleton(tipo, n)
        : '<p class="rz-desc">Carregando…</p>';
}
