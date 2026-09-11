// ============================================================================
// imoveis.js — Raiz Patrimônio · Imóveis (lista · ficha · formulário ·
//               fotos do Cofre · seletor · status/step do cadastro)
// Versão: 1.5.0 · 11/09/2026
//
// v1.5.0 — PAREI DE CHUTAR. Este bug ("Editar dados do imóvel não abre")
// já me enganou 3 vezes: cada tentativa corrigiu um problema real, mas
// nenhuma era A causa. O motivo de eu errar sempre: qualquer exceção no
// meio da população dos ~20 campos matava a função ANTES da linha que
// exibe o modal — em silêncio absoluto, sem erro no console visível pro
// usuário. Agora: o preenchimento foi extraído pra
// preencherCamposFormularioImovel() e roda dentro de try/catch — se
// estourar, o erro REAL aparece na tela; e o modal abre MESMO ASSIM,
// porque campo não preenchido é muito menos grave que tela que não abre.
// Se ainda falhar, o próximo teste finalmente dirá o motivo.
// (resetStepsImovel saiu do caminho — é no-op desde a v1.47.0, conferido.)
//
// v1.4.0 — CAUSA RAIZ do "Editar dados do imóvel não abre", enfim achada
// (3ª tentativa; as 2 anteriores corrigiram problemas reais, mas não ESTE).
// renderPreviewFotosImovel() fazia previewContainer.innerHTML direto num
// container que EU MESMO removi do formulário no A.9 (v1.163.0, corte do
// upload base64) — e editarImovel() chama essa função ANTES de tirar o
// 'hidden' do modal. Resultado: a execução morria no meio, sem erro
// visível, e a tela nunca aparecia. Na v1.163.0 eu tinha tornado 2 outros
// usos do mesmo id null-safe e deixei passar justamente o que estava no
// caminho crítico. Varri os 71 ids que este módulo referencia contra o
// index.html pra achar outros iguais — os demais órfãos estão em telas
// mortas ou já protegidos.
//
// v1.3.0 — BUG REAL: o bug do "Editar dados do imóvel" PERSISTIA depois do
// fix da v1.2.0 (esse estava certo, mas resolvia outra coisa). Causa real:
// rzMoverFormImovelParaBody() — que move o formulário pro <body>, chamada
// DIRETO NO BOOT do index.html, antes de qualquer interação — tinha vindo
// pra cá na extração do A.8 por engano. Uma função de boot dentro de um
// módulo lazy nunca roda a tempo. Voltou pro index.html (mesma categoria
// dos 4 carregar/sincronizar de antes, só que essa eu não tinha visto).
//
// v1.2.0 — BUG REAL achado pelo Nicola: "Editar dados do imóvel" (a partir
// do Ativo, via abrirGestaoImovel em cofre-ativos.js) não abria nada, sem
// nenhum aviso. Causa: editarImovel(id) procurava no array `imoveis`
// (carregado pelo boot do index.html) e retornava em silêncio se não
// achasse — corrida real entre esse boot e o boot independente do Cofre/
// Ativos. Agora recarrega uma vez antes de desistir, e avisa com toast se
// mesmo assim não achar. Não é bug de ponte (a ponte window.editarImovel
// do A.8 está correta) — é timing de dado.
//
// v1.1.0 — BUG REAL achado pelo Nicola (boot travava: "Falha ao buscar
// imóveis: Failed to fetch dynamically imported module"). Causa: a v1.0.0
// tinha levado carregarImoveisSupabase/sincronizarImovelSupabase/
// sincronizarImoveisSupabase/carregarTiposImovelSupabase junto — mas esses
// 4 são a camada de DADO/BOOT, não de tela, e o app carrega o array
// `imoveis` antes da primeira renderização. Voltaram pra index.html — mesmo
// padrão que contratos.js/minutas.js/financeiro.js já seguiam (nunca
// levaram seus carregar*Supabase/sincronizar*Supabase, só a UI). 47 funções
// ficam aqui, as 4 de dado saíram.
//
// R8 — FRAGMENTAÇÃO, FATIA 5 (A.8), combinada com o Nicola em 10/09/2026 como
// parte do caminho B (imóveis → ativos): mesmo método de contratos.js/
// vitrine.js/minutas.js/financeiro.js — ES module SOB DEMANDA via import()
// no switchTab, pontes window[nome] no index pra quem chama de fora,
// rzImoSeCarregado() nos ganchos de recarga (saveAll etc., pra não forçar o
// import só por causa de um save em outra aba).
//
// ESTADO GLOBAL LIDO/ESCRITO DAQUI: imoveis, contratos, mensalidades,
// pessoas, tiposImovelCadastrados, empreendimentosCadastrados, dbAuth,
// CONFIG_CLIENTE, CLIENTE_ID_SUPABASE, pessoaIdLogada, fichaImovelAtualId,
// imoveisFiltroAlertaContrato. Não redeclarado aqui — mesma convenção das
// fatias anteriores (script clássico e módulo compartilham o Global
// Environment Record; ver contratos.js para a mesma nota).
//
// 51 funções movidas verbatim (extração por balanceamento de chaves,
// conferida função a função — 0 sobreposição, 0 corte no meio). Nenhuma
// lógica mudou nesta fatia; só o "onde mora o código". valor_previsto/
// parcelas do A.10 e a publicação real de vitrine do A.9 já estavam
// aplicados nas versões anteriores e vieram junto sem alteração.
//
// PENDENTE (próximo passo do caminho B, passo 4): ainda lê `imoveis.fotos`
// puro em vários pontos (lightbox, miniatura do card) — só mostra o que
// está publicado na vitrine, não todas as fotos do Cofre; e `contratos`
// ainda referencia `imovel_id`, não `ativo_id`. Os dois ficam pra quando a
// fatia de Contratos migrar (passo 4), não escopo desta entrega.
// ============================================================================

export const VERSAO = '1.5.0'; // v-check: lido por ⚙️ › Conta › Versões — manter igual ao header


        export function abrirSeletorImovel(callback, permiteTodos) {
            _seletorImovelCallback = callback;
            _seletorImovelPermiteTodos = !!permiteTodos;
            const busca = document.getElementById('seletor-imovel-busca');
            if (busca) busca.value = '';
            renderListaSeletorImovel(imoveis);
            document.getElementById('modal-seletor-imovel').classList.remove('hidden');
        }


        export function fecharSeletorImovel() {
            document.getElementById('modal-seletor-imovel').classList.add('hidden');
        }

        export function abrirBuscaImoveis() {
            const modal = document.getElementById('modal-busca-imoveis');
            modal.classList.remove('hidden');
            modal.onclick = (ev) => { if (ev.target === modal) fecharBuscaImoveis(); };
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }


        export function fecharBuscaImoveis() {
            document.getElementById('modal-busca-imoveis').classList.add('hidden');
        }


        export function limparBuscaImoveis() {
            document.getElementById('imoveis-busca-texto').value = '';
            document.getElementById('imoveis-filtro-status').value = 'todos';
            const emp = document.getElementById('imoveis-filtro-emp');
            if (emp) emp.value = 'todos';
            const alerta = document.getElementById('imoveis-filtro-alerta');
            if (alerta) alerta.value = 'todos';
            renderImoveis();
            rzVitSeCarregado('renderVitrine');
        }


        export function renderListaSeletorImovel(lista) {
            const container = document.getElementById('seletor-imovel-lista');
            if (!container) return;

            let html = '';

            if (_seletorImovelPermiteTodos) {
                html += `<button type="button" onclick="selecionarImovelDoSeletor('', 'Todos os Imóveis')" class="w-full text-left p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 active:scale-[0.98] transition">
                    <span class="font-bold text-slate-700 text-sm"><svg data-lucide="list" style="width:14px;height:14px;display:inline;vertical-align:-2px"></svg> Todos os Imóveis</span>
                </button>`;
            }

            if (lista.length === 0) {
                html += '<p class="text-gray-400 text-sm p-4 text-center">Nenhum imóvel encontrado.</p>';
            } else {
                html += lista.map(function(imo) {
                    const endereco = (imo.enderecoRua || '') + ', ' + (imo.enderecoNum || '') + (imo.enderecoComp ? ' - ' + imo.enderecoComp : '');
                    const resumo = '[' + (imo.empreendimento || '-') + '] ' + endereco;
                    const statusCor = imo.status === 'Alugado' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-700';
                    return `<button type="button" onclick="selecionarImovelDoSeletor('${imo.id}', '${resumo.replace(/'/g, "\\'")}')" class="w-full text-left p-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 active:scale-[0.98] transition">
                        <div class="flex items-center gap-2 mb-1 flex-wrap">
                            <span class="text-[10px] font-bold px-1.5 py-0.5 rounded-full ${statusCor}">${imo.status || '-'}</span>
                            <span class="font-bold text-slate-800 text-sm">${imo.empreendimento || '-'}</span>
                        </div>
                        <p class="text-[12px] text-slate-500"><svg data-lucide="map-pin" style="width:11px;height:11px;display:inline;vertical-align:-1px"></svg> ${endereco}</p>
                        <p class="text-[12px] text-slate-500"><svg data-lucide="banknote" style="width:11px;height:11px;display:inline;vertical-align:-1px"></svg> R$ ${(imo.valor || 0).toLocaleString('pt-BR')}</p>
                    </button>`;
                }).join('');
            }

            container.innerHTML = html;
            if (typeof lucide !== 'undefined') lucide.createIcons();

        }


        export function filtrarListaSeletorImovel() {
            const termo = (document.getElementById('seletor-imovel-busca').value || '').toLowerCase();
            const filtrado = imoveis.filter(function(imo) {
                return (imo.empreendimento || '').toLowerCase().includes(termo)
                    || (imo.enderecoRua || '').toLowerCase().includes(termo)
                    || (imo.enderecoComp || '').toLowerCase().includes(termo)
                    || (imo.enderecoBairro || '').toLowerCase().includes(termo);
            });
            renderListaSeletorImovel(filtrado);
        }


        export function selecionarImovelDoSeletor(id, resumo) {
            fecharSeletorImovel();
            if (_seletorImovelCallback) _seletorImovelCallback(id, resumo);
        }





        export function normalizarImovel(raw) {

            try {

                logScreen(`Normalizando imóvel ID: ${raw.id || raw.ID || 'S/ID'}.`);

                let fotosTratadas = [];

                if (raw.fotos || raw.Fotos) {

                    const rawFotos = raw.fotos || raw.Fotos;

                    if (Array.isArray(rawFotos)) {

                        fotosTratadas = rawFotos;

                    } else if (typeof rawFotos === 'string') {

                        if (rawFotos.trim().startsWith('[')) {

                            try {

                                fotosTratadas = JSON.parse(rawFotos);

                            } catch(e) {

                                fotosTratadas = [];

                            }

                        } else if (rawFotos.trim() !== '') {

                            fotosTratadas = rawFotos.split(',').map(f => f.trim());

                        }

                    }

                }

                let divisaoTratada = { [SOCIO_PADRAO]: 100 };

                if (raw.divisao || raw.Divisao || raw.divisao_socios) {

                    const rawDiv = raw.divisao || raw.Divisao || raw.divisao_socios;

                    if (typeof rawDiv === 'object') {

                        divisaoTratada = rawDiv;

                    } else if (typeof rawDiv === 'string') {

                        try {

                            divisaoTratada = JSON.parse(rawDiv);

                        } catch(e) {

                            divisaoTratada = { [SOCIO_PADRAO]: 100 };

                        }

                    }

                }

                return {

                    id: raw.id || raw.ID || raw.id_imovel || 'imo_' + Date.now() + Math.random().toString(36).substr(2, 4),

                    empreendimento: raw.empreendimento || raw.Empreendimento || raw.nome_empreendimento || 'Canaã',

                    enderecoRua: raw.enderecoRua || raw.endereco || raw.rua || raw.Endereco || raw.Rua || '',

                    enderecoNum: raw.enderecoNum || raw.numero || raw.Num || raw.Numero || '',

                    enderecoComp: raw.enderecoComp || raw.complemento || raw.Complemento || '',

                    enderecoBairro: raw.enderecoBairro || raw.bairro || raw.Bairro || '',

                    enderecoCidade: raw.enderecoCidade || raw.cidade || raw.Cidade || 'Belo Horizonte',

                    tipo: raw.tipo || raw.Tipo || 'Apartamento',

                    tamanho: raw.tamanho || raw.Tamanho || 0,

                    suites: raw.suites || raw.Suites || 0,

                    banheiros: raw.banheiros || raw.banheiros || 0,

                    condominio: parseFloat(raw.condominio || raw.Condominio || 0) || 0,

                    iptu: parseFloat(raw.iptu || raw.IPTU || 0) || 0,

                    codigoIPTU: raw.codigoIPTU || raw.codigo_iptu || '',

                    manutencaoNome: raw.manutencaoNome || raw.manutencao_nome || '',

                    manutencaoZap: raw.manutencaoZap || raw.manutencao_zap || '',

                    descricao: raw.descricao || raw.Descricao || '',

                    energiaRumo: raw.energiaRumo || raw.energia_rumo || 'Não',

                    valorMercado: parseFloat(raw.valorMercado || raw.valor_mercado || 0) || 0,

                    parteRumo: (function() {

                        const d = raw.parteRumo || raw.parte_rumo;

                        if (d && typeof d === 'object' && !Array.isArray(d)) return d;

                        if (typeof d === 'string' && d.trim().startsWith('{')) {

                            try { return JSON.parse(d); } catch(e) { return { "Rumo": 100 }; }

                        }

                        return { "Rumo": 100 };

                    })(),

                    valor: parseFloat(raw.valor || raw.Valor || raw.aluguel_alvo || 0) || 0,

                    fotos: fotosTratadas,

                    divisao: divisaoTratada,

                    status: raw.status || raw.Status || 'Vago'

                };

            } catch (err) {

                logScreen(`Falha de normalização no imóvel: ${err.message}`, true);

                return null;

            }

        }


        export function renderPreviewFotosImovel() {

            const previewContainer = document.getElementById('form-images-preview-container');

            // v1.4.0 — CAUSA RAIZ do "Editar dados do imóvel não abre"
            // (achado 10/09/2026, depois de 2 tentativas que erraram o
            // alvo): este container foi REMOVIDO do formulário no A.9
            // (v1.163.0, corte do upload base64), mas esta função continuou
            // fazendo previewContainer.innerHTML direto — estourava aqui.
            // Como editarImovel() chama esta função ANTES de tirar o
            // 'hidden' do modal, a execução morria no meio e a tela nunca
            // aparecia, sem erro visível pro usuário. Na v1.163.0 eu tornei
            // 2 outros usos do mesmo id null-safe e deixei passar
            // justamente este.
            if (!previewContainer) return;

            previewContainer.innerHTML = fotosCarregadasBase64.map((base64Data, idxFoto) => `

                <div class="relative inline-block" style="width:40px; height:40px;">

                    <img src="${base64Data}" onclick="abrirLightboxGeral(fotosCarregadasBase64, ${idxFoto})" class="w-10 h-10 object-cover rounded border cursor-pointer active:scale-90 transition">

                    <button type="button" onclick="removerFotoImovel(${idxFoto})" title="Remover" class="absolute flex items-center justify-center leading-none font-bold" style="top:-4px; right:-4px; width:14px; height:14px; font-size:9px; background:var(--danger); color:#fff; border-radius:9999px; border:1.5px solid #fff;"><svg data-lucide="x" style="width:14px;height:14px"></svg></button>

                </div>

            `).join('');

            if (typeof lucide !== 'undefined') lucide.createIcons();

        }


        export function removerFotoImovel(idx) {

            fotosCarregadasBase64.splice(idx, 1);

            renderPreviewFotosImovel();

        }


        export async function abrirFormularioImovel() {

            // FASE 1A (v1.39.0) — checa limite do plano ANTES de abrir o
            // formulário de criação. Se estourou, mostra banner de
            // contratação em vez do formulário (o trigger no banco bloqueia
            // de qualquer forma, isto aqui é só pra melhor experiência).
            const permitido = await verificarLimiteAntesDeAbrir('imoveis.criar', 'form_imovel');
            if (!permitido) return;

            cancelarEdicaoImovel();

            document.getElementById('form-imovel-wrapper').classList.remove('hidden');

            sincronizarBotaoToggleImovel();

            window.scrollTo({top: 0, behavior: 'smooth'});

        }

        export function abrirCadastroImovelModal() {
            abrirFormularioImovel();
        }

        export function fecharCadastroImovelModal() {
            cancelarEdicaoImovel();
        }


        export function alternarFormularioImovel() {

            const wrapper = document.getElementById('form-imovel-wrapper');

            if (wrapper && !wrapper.classList.contains('hidden')) {
                cancelarEdicaoImovel();
            } else {
                abrirFormularioImovel();
            }

        }


        export function sincronizarBotaoToggleImovel() {

            const wrapper = document.getElementById('form-imovel-wrapper');
            const btn = document.getElementById('btn-toggle-imovel');
            if (!wrapper || !btn) return;
            const aberto = !wrapper.classList.contains('hidden');
            btn.classList.toggle('ativo', aberto);
            atualizarIconeToggle(btn, aberto);

        }

        export function irParaStepImovel(destino) {

            for (let i = 1; i <= 3; i++) {
                const stepDiv = document.getElementById('imo-step-' + i);
                if (stepDiv) stepDiv.classList.toggle('hidden', i !== destino);
                const dot = document.getElementById('imo-step-dot-' + i);
                if (dot) {
                    dot.style.width = (i === destino) ? '24px' : '6px';
                    dot.style.background = (i === destino) ? 'var(--sprout)' : 'var(--line)';
                }
            }

            const wrapper = document.getElementById('form-imovel-wrapper');
            if (wrapper) window.scrollTo({top: Math.max(wrapper.offsetTop - 10, 0), behavior: 'smooth'});

        }


        export function validarStepImovel(step) {

            const container = document.getElementById('imo-step-' + step);
            if (!container) return true;

            const campos = container.querySelectorAll('[required]');

            for (const campo of campos) {
                if (!campo.value || !campo.value.trim()) {
                    campo.focus();
                    const labelEl = campo.previousElementSibling;
                    const nomeCampo = labelEl ? labelEl.textContent.replace('*', '').trim() : 'este campo';
                    mostrarToast('Preencha "' + nomeCampo + '" antes de continuar.', 'danger');
                    return false;
                }
            }

            return true;

        }


        export function avancarStepImovel(atual) {

            if (!validarStepImovel(atual)) return;

            irParaStepImovel(atual + 1);

        }


        export function voltarStepImovel(atual) {

            irParaStepImovel(atual - 1);

        }


        export function resetStepsImovel() {
            // v1.47.0 — no-op de propósito (ver comentário acima de
            // irParaStepImovel). Mantida como função pra não quebrar os 2
            // chamadores existentes (alternarFormularioImovel/editarImovel).
        }


        export function saveImovel(e) {

            e.preventDefault();

            const id = document.getElementById('imo-id').value;

            let divisao = {};

            let somaPct = 0;

            sociosAdicionais.forEach(socio => {

                divisao[socio.nome] = socio.pct;

                somaPct += socio.pct;

            });

            if (sociosAdicionais.length === 0) {

                alert("⚠️ Adicione ao menos um sócio na divisão de propriedade (toque no ➕).");

                return;

            }

            if(somaPct !== 100) {

                alert("⚠️ A soma societária precisa ser exatamente 100%. Total atual: " + somaPct + "%");

                return;

            }

            // Lembra esta divisão para o próximo cadastro NOVO, só durante esta
            // sessão do app (reinicia sozinho ao recarregar a página).
            ultimaDivisaoUsada = JSON.parse(JSON.stringify(sociosAdicionais));

            // REMOVIDO: construção/validação de "parteRumo" — unificado dentro
            // da própria divisão de sócios (sociosAdicionais já cobre internos
            // e externos, e sua soma já é validada mais acima).

            const empreendimentoSalvo = document.getElementById('imo-empreendimento').value;

            const tipoSalvo = document.getElementById('imo-tipo').value;

            const ruaSalva = document.getElementById('imo-endereco-rua').value;

            const bairroSalvo = document.getElementById('imo-endereco-bairro').value;

            const cidadeSalva = document.getElementById('imo-endereco-cidade').value;

            const dados = {

                id: id || 'imo_' + Date.now(),

                empreendimento: empreendimentoSalvo,

                enderecoRua: ruaSalva,

                enderecoNum: document.getElementById('imo-endereco-num').value,

                enderecoComp: document.getElementById('imo-endereco-comp').value,

                enderecoBairro: bairroSalvo,

                enderecoCidade: cidadeSalva,

                tipo: tipoSalvo,

                finalidadeUso: document.getElementById('imo-finalidade-uso').value,

                tamanho: document.getElementById('imo-tamanho').value,

                suites: document.getElementById('imo-suites').value,

                banheiros: document.getElementById('imo-banheiros').value,

                condominio: parseFloat(document.getElementById('imo-condominio').value) || 0,

                iptu: parseFloat(document.getElementById('imo-iptu').value) || 0,

                codigoIPTU: document.getElementById('imo-iptu-codigo').value.trim(),

                descricao: document.getElementById('imo-descricao').value.trim(),

                energiaRumo: document.getElementById('imo-energia-rumo').value,

                valorMercado: parseFloat(document.getElementById('imo-valor-mercado').value) || 0,

                valor: parseFloat(document.getElementById('imo-valor').value) || 0,

                // v1.163.0 (A.9) — fotos não entram mais por aqui (widget removido
                // do formulário, v1.163.0). Salvar sempre preserva o que já está em
                // imoveis.fotos (hoje só URLs públicas sincronizadas pela vitrine —
                // ver alternarPublicarVitrineFoto, cofre-api.js 1.23.0); nunca mais
                // escreve fotosCarregadasBase64 aqui.
                fotos: id ? (imoveis.find(i => i.id === id).fotos || []) : [],

                divisao: divisao,

                status: id
                    ? statusAoEditarFinalidadeUso(imoveis.find(i => i.id === id).finalidadeUso, document.getElementById('imo-finalidade-uso').value, imoveis.find(i => i.id === id).status, id)
                    : statusInicialPorFinalidadeUso(document.getElementById('imo-finalidade-uso').value),

                // v7.3.3 — sindicoId/manutencistaId são calculados por cascata
                // (a partir do empreendimento) em recalcularVinculosSindicos() e
                // recalcularVinculosManutencistas(); aqui apenas preservamos o
                // valor já calculado para não perdê-lo ao salvar o imóvel.
                sindicoId: id ? (imoveis.find(i => i.id === id).sindicoId || '') : '',

                manutencistaId: id ? (imoveis.find(i => i.id === id).manutencistaId || '') : ''

            };

            devLog("FORM_IMOVEL", `Tentativa de gravação do imóvel. ID: ${dados.id}`, dados);

            if(id) {

                const idx = imoveis.findIndex(i => i.id === id);

                imoveis[idx] = dados;

            } else {

                imoveis.push(dados);

                // Só ao CRIAR um imóvel novo (nunca ao editar um já existente)
                // atualiza o que o próximo cadastro vai vir pré-preenchido.
                ultimoImovelCadastrado = {
                    empreendimento: dados.empreendimento,
                    tipo: dados.tipo,
                    enderecoRua: dados.enderecoRua,
                    enderecoNum: dados.enderecoNum,
                    enderecoBairro: dados.enderecoBairro,
                    enderecoCidade: dados.enderecoCidade,
                    tamanho: dados.tamanho,
                    descricao: dados.descricao,
                    valor: dados.valor,
                    condominio: dados.condominio,
                    iptu: dados.iptu,
                    valorMercado: dados.valorMercado,
                    energiaRumo: dados.energiaRumo
                };

            }

            document.getElementById('form-imovel').reset();

            fotosCarregadasBase64 = [];

            (document.getElementById('form-images-preview-container') || {}).innerHTML = ''; // v1.163.0 — container saiu do form (A.9); null-safe

            

            document.getElementById('imo-empreendimento').value = empreendimentoSalvo;

            document.getElementById('imo-tipo').value = tipoSalvo;

            document.getElementById('imo-endereco-rua').value = ruaSalva;

            document.getElementById('imo-endereco-bairro').value = bairroSalvo;

            document.getElementById('imo-endereco-cidade').value = cidadeSalva;

            cancelarEdicaoImovel();

            // v1.45.0 (Correção de Direção UX) — "salvar retorna à ficha
            // atualizada". editarImovel(id) só é chamada de dentro da
            // ficha agora (o card da lista não chama mais editar
            // diretamente), então isso cobre 100% dos casos de edição real;
            // cadastro NOVO (id vazio) continua voltando pra lista, como
            // sempre foi.
            // v1.108.0 — só reabre a Ficha do Imóvel (legada) se ela era a
            // tela ativa; editando pela ficha do ATIVO, quem recarrega é o
            // hook __rzAposFecharImovel (cancelarEdicaoImovel acima).
            if (id && fichaImovelAtualId === id && document.getElementById('tab-imoveis')?.classList.contains('active')) {
                abrirFichaImovel(id);
            }

            // v7.3.3 — Recalcula os vínculos, pois o empreendimento salvo pode já
            // ter síndico/manutencista cadastrados em Serviços.
            recalcularVinculosSindicos();

            recalcularVinculosManutencistas();

            registrarLog(id ? 'imoveis.editar' : 'imoveis.criar', { empreendimento: dados.empreendimento, endereco: dados.enderecoRua + ', ' + dados.enderecoNum });

            saveAll(true, "Imóvel salvo com sucesso!", ['imoveis']);

        }


        export async function editarImovel(id) {

            // v1.5.0 — INSTRUMENTAÇÃO (10/09/2026): este bug ("não abre",
            // sem erro nenhum) já me enganou 3 vezes porque QUALQUER exceção
            // no meio da população dos campos matava a função em silêncio,
            // antes da linha que exibe o modal. Agora: (1) o preenchimento
            // dos campos roda dentro de try/catch — se estourar, mostra o
            // erro REAL na tela e no console, em vez de sumir; (2) o modal é
            // aberto MESMO ASSIM, porque um campo que não preencheu é muito
            // menos grave do que a tela não abrir. Preencher campo é
            // acessório; abrir a tela é o essencial.
            let imo = imoveis.find(i => i.id === id);

            if (!imo) {
                imoveis = await carregarImoveisSupabase();
                imo = imoveis.find(i => i.id === id);
            }
            if (!imo) { mostrarToast('Não consegui carregar este imóvel — tenta de novo em alguns segundos.', 'danger'); return; }

            try {
                preencherCamposFormularioImovel(imo);
            } catch (err) {
                console.error('[imoveis] Falha ao preencher o formulário:', err);
                mostrarToast('Abri o formulário, mas um campo falhou: ' + (err.message || err), 'danger');
            }

            document.getElementById('form-imovel-titulo').innerText = "Editar imóvel";
            document.getElementById('form-imovel-wrapper').classList.remove('hidden');
            sincronizarBotaoToggleImovel();
            window.scrollTo({ top: 0, behavior: 'smooth' });

        }

        // Extraído de editarImovel (v1.5.0) — só o preenchimento dos campos,
        // pra poder isolar num try/catch sem arriscar a abertura do modal.
        function preencherCamposFormularioImovel(imo) {

            document.getElementById('imo-empreendimento').value = imo.empreendimento || 'Canaã';

            document.getElementById('imo-endereco-rua').value = imo.enderecoRua || '';

            document.getElementById('imo-endereco-num').value = imo.enderecoNum || '';

            document.getElementById('imo-endereco-comp').value = imo.enderecoComp || '';

            document.getElementById('imo-endereco-bairro').value = imo.enderecoBairro || '';

            document.getElementById('imo-endereco-cidade').value = imo.enderecoCidade || '';

            document.getElementById('imo-tipo').value = imo.tipo;

            document.getElementById('imo-finalidade-uso').value = imo.finalidadeUso || 'long_stay';

            document.getElementById('imo-tamanho').value = imo.tamanho;

            document.getElementById('imo-suites').value = imo.suites || 0;

            document.getElementById('imo-banheiros').value = imo.banheiros || 0;

            document.getElementById('imo-condominio').value = imo.condominio || 0;

            document.getElementById('imo-iptu').value = imo.iptu || 0;

            document.getElementById('imo-iptu-codigo').value = imo.codigoIPTU || '';

            exibirSindicoVinculado(imo);

            exibirManutencistaVinculado(imo);

            document.getElementById('imo-descricao').value = imo.descricao || '';

            document.getElementById('imo-energia-rumo').value = imo.energiaRumo || 'Não';

            document.getElementById('imo-valor').value = imo.valor;

            document.getElementById('imo-valor-mercado').value = imo.valorMercado || 0;

            

            fotosCarregadasBase64 = imo.fotos || [];

            renderPreviewFotosImovel();

            sociosAdicionais = [];

            let pctRuyterEdicao = 100;

            if(imo.divisao) {

                pctRuyterEdicao = imo.divisao[SOCIO_PADRAO] || 0;

                Object.keys(imo.divisao).forEach(nome => {

                    if(nome !== SOCIO_PADRAO) sociosAdicionais.push({ nome: nome, pct: imo.divisao[nome] });

                });

            }

            renderSocioInputs(pctRuyterEdicao);

        }


        export function cancelarEdicaoImovel() {

            document.getElementById('form-imovel').reset();

            document.getElementById('imo-id').value = '';

            document.getElementById('form-imovel-titulo').innerText = "Cadastrar imóvel";

            resetStepsImovel();

            // Lembra a última divisão usada NESTA sessão do app (limpa sozinho ao
            // recarregar a página, pois "ultimaDivisaoUsada" é só uma variável em
            // memória) — evita ter que redigitar a mesma divisão em cadastros
            // consecutivos, sem fixar um "padrão" permanente como antes.
            // v1.41.0 (Fase 1) — se ainda não há divisão salva nesta sessão (1º
            // cadastro), pré-preenche com 100% para o sócio de MAIOR % de cotas
            // da empresa (em vez de ficar em branco). A partir do 2º cadastro,
            // volta a valer o padrão societário salvo no cadastro anterior.
            if (ultimaDivisaoUsada) {
                sociosAdicionais = JSON.parse(JSON.stringify(ultimaDivisaoUsada));
            } else {
                const socioMaiorCota = pessoas
                    .filter(p => p.percentualCotasEmpresa > 0)
                    .sort((a, b) => (b.percentualCotasEmpresa || 0) - (a.percentualCotasEmpresa || 0))[0];
                sociosAdicionais = socioMaiorCota ? [{ nome: socioMaiorCota.nome, pct: 100 }] : [];
            }

            fotosCarregadasBase64 = [];

            (document.getElementById('form-images-preview-container') || {}).innerHTML = ''; // v1.163.0 — container saiu do form (A.9); null-safe

            renderSocioInputs();

            popularSelectsEmpreendimentoTipo();

            // Pré-preenche o formulário de "novo imóvel" com os dados do
            // último imóvel CRIADO nesta sessão (não conta editar um já
            // existente) — poupa redigitar campos que se repetem entre
            // imóveis do mesmo lote/empreendimento. Complemento, foto e
            // código do IPTU ficam sempre em branco, de propósito — são os
            // que mais variam de um imóvel para o outro.
            if (ultimoImovelCadastrado) {
                document.getElementById('imo-empreendimento').value = ultimoImovelCadastrado.empreendimento || '';
                document.getElementById('imo-tipo').value = ultimoImovelCadastrado.tipo || '';
                document.getElementById('imo-endereco-rua').value = ultimoImovelCadastrado.enderecoRua || '';
                document.getElementById('imo-endereco-num').value = ultimoImovelCadastrado.enderecoNum || '';
                document.getElementById('imo-endereco-bairro').value = ultimoImovelCadastrado.enderecoBairro || '';
                document.getElementById('imo-endereco-cidade').value = ultimoImovelCadastrado.enderecoCidade || '';
                document.getElementById('imo-tamanho').value = ultimoImovelCadastrado.tamanho || '';
                document.getElementById('imo-descricao').value = ultimoImovelCadastrado.descricao || '';
                document.getElementById('imo-valor').value = ultimoImovelCadastrado.valor || '';
                document.getElementById('imo-condominio').value = ultimoImovelCadastrado.condominio || '';
                document.getElementById('imo-iptu').value = ultimoImovelCadastrado.iptu || '';
                document.getElementById('imo-valor-mercado').value = ultimoImovelCadastrado.valorMercado || '';
                document.getElementById('imo-energia-rumo').value = ultimoImovelCadastrado.energiaRumo || 'Não';
            }

            document.getElementById('imo-sindico-secao').classList.add('hidden');

            document.getElementById('imo-manutencao-secao').classList.add('hidden');

            document.getElementById('form-imovel-wrapper').classList.add('hidden');

            sincronizarBotaoToggleImovel();

            // v1.49.0 — "ao fechar, voltar à mesma tela que originou a
            // abertura dos Detalhes" (pedido explícito). fichaOrigemAoEditarImovel
            // só é setado por abrirDetalhesImovel(); fluxo normal de
            // cadastro (botão "+" da lista) deixa null e nada muda aqui.
            if (fichaOrigemAoEditarImovel) {
                const origem = fichaOrigemAoEditarImovel;
                fichaOrigemAoEditarImovel = null;
                if (origem === 'tab-imovel-ficha' && fichaImovelAtualId) {
                    abrirFichaImovel(fichaImovelAtualId);
                } else {
                    switchTab(origem);
                }
            }
            // v1.108.0 — quando a edição foi aberta pela FICHA DO ATIVO
            // (abrirGestaoImovel em cofre-ativos.js), o módulo deixa aqui o
            // que fazer ao fechar (recarregar a ficha). O modal agora vive
            // no <body> (ver rzMoverFormImovelParaBody), então a ficha
            // nunca saiu da tela — só precisa ser atualizada.
            document.getElementById('imo-blocos-ficha')?.classList.remove('hidden');
            if (typeof window.__rzAposFecharImovel === 'function') {
                const f = window.__rzAposFecharImovel;
                window.__rzAposFecharImovel = null;
                try { f(); } catch (e) { console.error('[rz] aposFecharImovel', e); }
            }

        }


        export function abrirLightboxImovelSalvo(imovelId, indiceInicial) {

            const imo = imoveis.find(i => i.id === imovelId);

            if (!imo || !imo.fotos) return;

            abrirLightboxGeral(imo.fotos, indiceInicial);

        }


        export async function excluirImovel(id) {

            const imo = imoveis.find(i => i.id === id);

            if (!imo) return;

            const temContrato = contratos.some(c => c.imovelId === id);

            if (temContrato) {

                alert("⚠️ Não é possível excluir este imóvel: existe pelo menos 1 contrato vinculado a ele. Exclua ou desvincule o(s) contrato(s) primeiro.");

                return;

            }

            if (!confirm(`Confirma a exclusão do imóvel "${imo.empreendimento} - ${imo.enderecoRua}, ${imo.enderecoNum}"? Esta ação não pode ser desfeita.`)) return;

            // CORRIGIDO — antes removia da tela e registrava o log ANTES de saber
            // se a exclusão no Supabase realmente funcionou (o "then" era disparado
            // sem aguardar). Se falhasse (ex.: id ainda não sincronizado), a tela
            // mostrava como excluído mesmo com a linha continuando no banco. Agora
            // espera a confirmação antes de mexer na tela.
            const { error } = await dbAuth.from('imoveis').delete().eq('id', id);

            if (error) {
                alert("❌ Falha ao excluir o imóvel: " + error.message + "\n\nNada foi removido. Se o imóvel foi criado agora mesmo, aguarde a confirmação de salvamento e tente de novo.");
                logScreen('Erro ao excluir imóvel no Supabase: ' + error.message, true);
                return;
            }

            imoveis = imoveis.filter(i => i.id !== id);

            registrarLog('imoveis.excluir', { imovelId: id, empreendimento: imo.empreendimento, endereco: imo.enderecoRua + ', ' + imo.enderecoNum });

            saveAll(true, "Imóvel excluído com sucesso.", ['imoveis']);

            // v1.45.0 — se a exclusão foi feita de dentro da ficha deste
            // imóvel, volta pra lista (a ficha não existe mais).
            if (fichaImovelAtualId === id) {
                voltarDaFichaImovel();
            }

        }


        export function filtrarImoveisPorAlertaContrato(tipo) {
            // v1.108.0 — lista de imóveis desligada: alerta de contrato leva
            // pra aba Contratos (onde o alerta é tratado).
            imoveisFiltroAlertaContrato = tipo;
            switchTab('tab-contratos');
        }


        export function limparFiltroAlertaContratoImoveis() {
            imoveisFiltroAlertaContrato = null;
            renderImoveis();
        }


        export function renderImoveis() {

            const container = document.getElementById('lista-imoveis');

            if(!container) return;

            container.innerHTML = '';

            

            logScreen(`Disparada renderImoveis(). Array possui ${imoveis.length} registros em memória.`);

            // CORRIGIDO — "con-imovel" e "filtro-imovel" deixaram de ser <select>
            // nativo (no celular, cortava o texto sem solução real dentro do
            // próprio componente). Agora são um input escondido (guarda o valor)
            // + botão que abre o seletor customizado com busca e cards completos
            // (abrirSeletorImovel). Não precisa mais reconstruir opções aqui —
            // só preservar o valor já selecionado, se houver.
            const selectCon = document.getElementById('con-imovel');

            const selConVal = selectCon ? selectCon.value : '';

            const selectFiltro = document.getElementById('filtro-imovel');

            const selFilVal = selectFiltro ? selectFiltro.value : 'todos';

            popularFiltroSelect('imoveis-filtro-emp', imoveis.map(i => i.empreendimento));

            const fEmpImo = document.getElementById('imoveis-filtro-emp')?.value || 'todos';

            const fStatusImo = document.getElementById('imoveis-filtro-status')?.value || 'todos';

            const fImovelIdImo = document.getElementById('imoveis-filtro-imovel-id')?.value || 'todos';

            // v1.47.0 — busca por texto livre: endereço completo + locatário
            // do contrato principal (obterContratosContextuaisDoImovel, já
            // existente desde v1.45.0 — não dupliquei a lógica de achar o
            // contrato do imóvel).
            const termoBuscaImo = (document.getElementById('imoveis-busca-texto')?.value || '').trim().toLowerCase();

            const imovelBateComBuscaTexto = (imo) => {
                if (!termoBuscaImo) return true;
                const principal = obterContratoPrincipalDoImovel(imo.id);
                const campos = [imo.enderecoRua, imo.enderecoNum, imo.enderecoComp, imo.enderecoBairro, imo.enderecoCidade, imo.empreendimento, principal ? principal.locatario : ''];
                return campos.some(c => (c || '').toString().toLowerCase().includes(termoBuscaImo));
            };

            // CORRIGIDO (v1.57.0 — pedido explícito): o filtro de alerta
            // deixou de ser um mecanismo paralelo com banner (só acessível
            // vindo da Visão Geral) e virou um filtro de verdade, visível
            // no overlay de busca, igual aos demais. Reaproveita
            // obterContratosContextuaisDoImovel/contratoAguardandoAssinatura/
            // contratoPrecisaRevisao/contratoVencido já existentes — nenhuma
            // lógica de alerta duplicada.
            const fAlertaImo = document.getElementById('imoveis-filtro-alerta')?.value || 'todos';

            const imovelBateComFiltroAlerta = (imo) => {
                if (fAlertaImo === 'todos') return true;
                const contratosDoImovel = obterContratosContextuaisDoImovel(imo.id);
                if (fAlertaImo === 'qualquer') {
                    return contratosDoImovel.some(c => contratoAguardandoAssinatura(c) || contratoPrecisaRevisao(c) || contratoVencido(c));
                }
                if (fAlertaImo === 'assinando') {
                    return contratosDoImovel.some(c => contratoAguardandoAssinatura(c));
                }
                if (fAlertaImo === 'revisao') {
                    return contratosDoImovel.some(c => contratoPrecisaRevisao(c));
                }
                if (fAlertaImo === 'vencido') {
                    return contratosDoImovel.some(c => contratoVencido(c));
                }
                return true;
            };

            // v7.3.3 — Os números-resumo agora refletem os filtros ativos
            // (empreendimento/status), e não mais o total geral de imóveis.
            const imoveisFiltradosParaContagem = imoveis.filter(imo =>
                (fEmpImo === 'todos' || imo.empreendimento === fEmpImo) &&
                (fStatusImo === 'todos' || imo.status === fStatusImo) &&
                (fImovelIdImo === 'todos' || imo.id === fImovelIdImo) &&
                imovelBateComBuscaTexto(imo) &&
                imovelBateComFiltroAlerta(imo)
            );

            { const _el = document.getElementById('total-imoveis-contador'); if (_el) _el.innerText = imoveisFiltradosParaContagem.length; } // v1.134 — null-guard (cabeçalho antigo removido)

            { const _el = document.getElementById('imoveis-vagos-contador'); if (_el) _el.innerText = imoveisFiltradosParaContagem.filter(i => i.status === 'Vago').length; } // v1.134 — null-guard (cabeçalho antigo removido)

            { const _el = document.getElementById('imoveis-alugados-contador'); if (_el) _el.innerText = imoveisFiltradosParaContagem.filter(i => i.status === 'Alugado').length; } // v1.134 — null-guard (cabeçalho antigo removido)

            // v1.47.0 — antes cada card ia direto pro container via
            // `container.innerHTML +=`; agora acumula num array primeiro,
            // porque com >10 imóveis a lista precisa ser agrupada por
            // empreendimento (pedido explícito) — decidido só depois que
            // todos os cards já foram montados.
            const cardsImovelPorEmpreendimento = {};

            imoveis.slice().sort((a, b) => (a.empreendimento || '').localeCompare(b.empreendimento || '')).forEach((imo, index) => {

                const passaFiltroImovel = (fEmpImo === 'todos' || imo.empreendimento === fEmpImo) &&

                                          (fStatusImo === 'todos' || imo.status === fStatusImo) &&

                                          (fImovelIdImo === 'todos' || imo.id === fImovelIdImo) &&

                                          imovelBateComBuscaTexto(imo) &&

                                          imovelBateComFiltroAlerta(imo);

                if (!passaFiltroImovel) return;

                try {

                    let divSoc = '';

                    if (imo.divisao) {

                        for(let s in imo.divisao) divSoc += `${s}: ${imo.divisao[s]}% | `;

                    } else {

                        divSoc = "Sem divisão cadastrada";

                    }

                    const endExibivel = `${imo.enderecoRua || ''}, ${imo.enderecoNum || ''} ${imo.enderecoComp ? ' - ' + imo.enderecoComp : ''}, ${imo.enderecoBairro || ''}, ${imo.enderecoCidade || ''}`;

                    const badgeEnergia = imo.energiaRumo === 'Sim' ? `<span class="text-[11px] font-bold px-1.5 py-0.5 rounded raiz-badge-atributo ml-1"><svg data-lucide="zap" style="width:11px;height:11px;display:inline;vertical-align:-1px"></svg></span>` : '';

                    const linha2 = `${endExibivel}${imo.descricao ? ' — ' + imo.descricao : ''}`;

                    // v1.47.0 — card da lista agora é a mesma "cara" da ficha:
                    // avatar (foto real se houver, senão ícone de casinha) +
                    // locatário + aluguel do contrato principal. Reaproveita
                    // obterContratoPrincipalDoImovel (v1.45.0) — não duplica
                    // lógica de achar o contrato do imóvel.
                    const cardHtml = `

                        <!-- v1.45.0 (Correção de Direção UX) — Lista → Ficha →
                             Ação. O card inteiro chama abrirFichaImovel (nunca
                             editarImovel). -->
                        <!-- CORRIGIDO (v1.46.0) — role="button"+tabindex+teclado. -->
                        <!-- v1.49.0 — reaproveita montarCabecalhoImovelHtml(),
                             mesma formatação exata do topo da ficha (pedido
                             explícito: "idêntica"). Ícone de locatário (👤)
                             removido daqui e da ficha. -->
                        <div onclick="abrirFichaImovel('${imo.id}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); abrirFichaImovel('${imo.id}');}" role="button" tabindex="0" class="bg-white p-3 rounded-xl shadow-sm border border-gray-200 cursor-pointer active:bg-gray-50 transition">
                            ${montarCabecalhoImovelHtml(imo)}
                        </div>

                    `;

                    const chaveGrupo = imo.empreendimento || '(Sem empreendimento)';

                    (cardsImovelPorEmpreendimento[chaveGrupo] = cardsImovelPorEmpreendimento[chaveGrupo] || []).push(cardHtml);

                } catch(renderErr) {

                    logScreen(`Falha renderizando imóvel index [${index}]: ${renderErr.message}`, true);

                }

            });

            // v1.47.0 — decide agrupar por empreendimento (>10 imóveis no
            // total da empresa, não só no resultado filtrado — é um traço
            // do porte da carteira, não do filtro do momento) ou lista
            // plana, como sempre foi.
            const nomesGrupos = Object.keys(cardsImovelPorEmpreendimento).sort((a, b) => a.localeCompare(b));

            if (imoveis.length > 10) {

                container.innerHTML = nomesGrupos.map(nome => `
                    <div class="mb-1">
                        <p class="text-[11px] font-bold uppercase tracking-wide text-slate-500 px-1 mb-2 mt-4 first:mt-0">${nome} <span class="text-slate-400">(${cardsImovelPorEmpreendimento[nome].length})</span></p>
                        <div class="space-y-3">${cardsImovelPorEmpreendimento[nome].join('')}</div>
                    </div>
                `).join('');

            } else {

                container.innerHTML = nomesGrupos.map(nome => cardsImovelPorEmpreendimento[nome].join('')).join('');

            }

            if (typeof lucide !== 'undefined') lucide.createIcons();

            // Restaura o valor guardado (input escondido) E o texto do botão —
            // como não são mais <select>, o texto exibido não se atualiza
            // sozinho, precisa ser recalculado a partir do imóvel selecionado.
            if(selectCon) {
                selectCon.value = selConVal;
                const imoSelecionadoCon = imoveis.find(i => i.id === selConVal);
                const resumoCon = document.getElementById('con-imovel-resumo');
                if (resumoCon) resumoCon.textContent = imoSelecionadoCon
                    ? `[${imoSelecionadoCon.empreendimento || '-'}] ${imoSelecionadoCon.enderecoRua || ''}, ${imoSelecionadoCon.enderecoNum || ''}`
                    : '-- Escolha o Imóvel --';
            }

            if(selectFiltro) {
                selectFiltro.value = selFilVal;
                const imoSelecionadoFiltro = imoveis.find(i => i.id === selFilVal);
                const resumoFiltro = document.getElementById('filtro-imovel-resumo');
                if (resumoFiltro) resumoFiltro.textContent = imoSelecionadoFiltro
                    ? `[${imoSelecionadoFiltro.empreendimento || '-'}] ${imoSelecionadoFiltro.enderecoRua || ''}, ${imoSelecionadoFiltro.enderecoNum || ''}`
                    : 'Todos os Imóveis';
            }

            if (typeof lucide !== 'undefined') lucide.createIcons();

        }

        export function imovelIsentoDeAlertas(imovelId) {
            const imo = imoveis.find(i => i.id === imovelId);
            return !!imo && (imo.finalidadeUso === 'uso_proprio' || imo.finalidadeUso === 'temporada');
        }

        export function obterContratosContextuaisDoImovel(imovelId) {
            return contratos
                .filter(c => c.imovelId === imovelId)
                .slice()
                .sort((a, b) => (PRIORIDADE_STATUS_CONTRATO[a.status] || 9) - (PRIORIDADE_STATUS_CONTRATO[b.status] || 9));
        }


        export function obterContratoPrincipalDoImovel(imovelId) {
            const lista = obterContratosContextuaisDoImovel(imovelId);
            return lista.length > 0 ? lista[0] : null;
        }


        export function montarCabecalhoImovelHtml(imo) {
            const foto = (imo.fotos && Array.isArray(imo.fotos) && imo.fotos.length > 0 && typeof imo.fotos[0] === 'string' && imo.fotos[0].length > 5) ? imo.fotos[0] : null;
            const endExibivel = `${imo.enderecoRua || ''}, ${imo.enderecoNum || ''}${imo.enderecoComp ? ' - ' + imo.enderecoComp : ''}, ${imo.enderecoBairro || ''}, ${imo.enderecoCidade || ''}`;
            const principal = obterContratoPrincipalDoImovel(imo.id);

            // CORRIGIDO (v1.58.0 — pedido explícito): situação virou uma
            // linha flex (locatário/status à esquerda, aluguel à direita),
            // sem negrito, sem "/mês". Endereço não quebra mais em 1 linha
            // só (truncate removido) — mostra rua/número/complemento/
            // bairro/cidade inteiros, quebrando quantas linhas precisar.
            let situacaoEsquerda, situacaoDireita;
            if (!principal) {
                situacaoEsquerda = 'Sem contrato cadastrado';
                situacaoDireita = '';
            } else if (principal.status === 'Finalizado') {
                situacaoEsquerda = 'Sem contrato em andamento';
                situacaoDireita = '';
            } else {
                situacaoEsquerda = (principal.locatario || '-') + (principal.status !== 'Ativo' ? ` · ${principal.status}` : '');
                situacaoDireita = formatarMoedaBR(principal.valor);
            }

            return `
                <div class="flex gap-3 items-start">
                    <div class="w-12 h-12 rounded-xl raiz-bg-sprout-light text-emerald-800 flex items-center justify-center flex-none overflow-hidden">
                        ${foto ? `<img src="${foto}" class="w-full h-full object-cover">` : `<svg data-lucide="home" style="width:20px;height:20px"></svg>`}
                    </div>
                    <div class="flex-1 min-w-0">
                        <h3 class="text-xs font-extrabold text-emerald-950 truncate">${imo.empreendimento || 'Canaã'} · ${imo.tipo} · ${rotuloFinalidadeUso(imo.finalidadeUso)}</h3>
                        <div class="text-xs text-slate-500">${endExibivel}</div>
                        <div class="flex items-center justify-between gap-2 mt-1">
                            <span class="text-xs text-slate-700 truncate">${situacaoEsquerda}</span>
                            ${situacaoDireita ? `<span class="text-xs text-slate-700 flex-none">${situacaoDireita}</span>` : ''}
                        </div>
                    </div>
                    <span class="text-[11px] font-bold px-1.5 py-0.5 rounded flex-none ${imo.status==='Vago'?'bg-amber-100 text-amber-800':(imo.status==='Assinando'?'bg-blue-100 text-blue-800':(imo.status==='Alugado'?'bg-green-100 text-green-800':'bg-slate-100 text-slate-700'))}">${imo.status}</span>
                </div>`;
        }


        export function abrirFichaImovel(id) {

            fichaImovelAtualId = id;

            // v1.61.5 (I-5c) — só grava a origem se estamos vindo de fora
            // da própria ficha (evita perder a origem real ao reabrir após
            // salvar uma edição, ver linhas 13740/13912/14656/16393).
            const abaAtivaAntes = document.querySelector('.tab-content.active')?.id;
            if (abaAtivaAntes && abaAtivaAntes !== 'tab-imovel-ficha') {
                fichaImovelOrigemTab = abaAtivaAntes;
            }

            const imo = imoveis.find(i => i.id === id);
            if (!imo) { alert('Imóvel não encontrado.'); return; }

            document.getElementById('ficha-imovel-head').innerHTML = `
                <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    ${montarCabecalhoImovelHtml(imo)}
                    <!-- v1.49.0 — "Editar imóvel"/"Excluir" removidos daqui
                         (pedido explícito) — a única entrada de edição
                         agora é "Detalhes" dentro de "Mais ações". -->
                    <div class="flex items-center justify-end mt-3 pt-3 border-t border-slate-100">
                        <button onclick="alternarMaisAcoesFichaImovel()" class="text-xs font-bold text-slate-500 flex items-center gap-1">Mais ações <svg data-lucide="chevron-down" id="fi-mais-acoes-seta" style="width:13px;height:13px"></svg></button>
                    </div>
                    <div id="fi-mais-acoes" class="hidden mt-2 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5 justify-end">
                        <button onclick="abrirDetalhesImovel('${imo.id}')" class="text-[11px] font-bold px-2.5 py-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300 flex items-center gap-1"><svg data-lucide="file-text" style="width:11px;height:11px"></svg> Detalhes</button>
                        <button onclick="copyResumo('${(`${imo.enderecoRua || ''}, ${imo.enderecoNum || ''}`).replace(/'/g, "")}', '${imo.tipo}', ${imo.valor}, ${imo.suites || 0}, ${imo.condominio || 0})" class="text-[11px] font-bold px-2.5 py-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300 flex items-center gap-1"><svg data-lucide="copy" style="width:11px;height:11px"></svg> Copiar resumo</button>
                        ${imo.status === 'Vago' ? `<button onclick="criarContratoParaImovel('${imo.id}')" class="text-[11px] font-bold px-2.5 py-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300 flex items-center gap-1"><svg data-lucide="file-plus" style="width:11px;height:11px"></svg> Criar contrato</button>` : ''}
                        ${imo.codigoIPTU ? `<button onclick="acionarZapIptuImovel('${imo.id}')" class="text-[11px] font-bold px-2.5 py-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300 flex items-center gap-1"><svg data-lucide="message-circle" style="width:11px;height:11px"></svg> Enviar IPTU</button>` : ''}
                        <button onclick="abrirCofreDocumentos('imovel', '${imo.id}')" class="text-[11px] font-bold px-2.5 py-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300 flex items-center gap-1"><svg data-lucide="upload" style="width:11px;height:11px"></svg> Documentos</button>
                        <label for="fi-foto-input" class="text-[11px] font-bold px-2.5 py-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300 flex items-center gap-1" style="cursor:pointer"><svg data-lucide="image-plus" style="width:11px;height:11px"></svg> Fotos</label>
                        ${!contratos.some(c => c.imovelId === imo.id) ? `<button onclick="excluirImovel('${imo.id}')" class="text-[11px] font-bold px-2.5 py-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300 flex items-center gap-1"><svg data-lucide="trash-2" style="width:11px;height:11px"></svg> Excluir</button>` : ''}
                    </div>
                </div>`;

            switchTab('tab-imovel-ficha');
            renderFichaImovelUnica(imo);
            montarFotosImovelDoCofre(imo.id);

        }

        export function abrirDetalhesImovel(id) {
            const imo = imoveis.find(i => i.id === id);
            if (!imo) return;

            document.getElementById('modal-campo-contrato')?.remove();

            const empOpts = document.getElementById('imo-empreendimento').innerHTML;
            const tipoOpts = document.getElementById('imo-tipo').innerHTML;

            const modal = document.createElement('div');
            modal.id = 'modal-campo-contrato';
            modal.style = 'position:fixed;inset:0;z-index:96;display:flex;align-items:flex-end;justify-content:center;background:rgba(23,33,30,.5);';
            modal.innerHTML = `
                <div style="background:#fff;border-radius:16px 16px 0 0;max-width:480px;width:100%;padding:16px;max-height:85vh;overflow-y:auto;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                        <h3 style="font-size:14px;font-weight:bold;color:#1e293b;">Detalhes do Imóvel</h3>
                        <button onclick="fecharModalCampoContrato()" style="background:#e2e8f0;border:none;border-radius:9999px;width:26px;height:26px;flex:none;">✕</button>
                    </div>
                    <div style="display:flex;flex-direction:column;gap:8px;">
                        <div style="display:flex;gap:8px;">
                            <div style="flex:1;"><label style="font-size:11px;font-weight:bold;color:#64748b;">Empreendimento <span style="color:var(--danger)">*</span></label><select id="mdi-empreendimento" required style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;background:#f8fafc;">${empOpts}</select></div>
                            <div style="flex:1;"><label style="font-size:11px;font-weight:bold;color:#64748b;">Tipo <span style="color:var(--danger)">*</span></label><select id="mdi-tipo" required style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;background:#f8fafc;">${tipoOpts}</select></div>
                        </div>
                        <div><label style="font-size:11px;font-weight:bold;color:#64748b;">Endereço (rua/avenida) <span style="color:var(--danger)">*</span></label><input type="text" id="mdi-endereco-rua" required value="${(imo.enderecoRua || '').replace(/"/g, '')}" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;"></div>
                        <div style="display:flex;gap:8px;">
                            <div style="flex:1;"><label style="font-size:11px;font-weight:bold;color:#64748b;">Número <span style="color:var(--danger)">*</span></label><input type="text" id="mdi-endereco-num" required value="${(imo.enderecoNum || '').replace(/"/g, '')}" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;"></div>
                            <div style="flex:1;"><label style="font-size:11px;font-weight:bold;color:#64748b;">Complemento</label><input type="text" id="mdi-endereco-comp" value="${(imo.enderecoComp || '').replace(/"/g, '')}" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;"></div>
                        </div>
                        <div style="display:flex;gap:8px;">
                            <div style="flex:1;"><label style="font-size:11px;font-weight:bold;color:#64748b;">Bairro <span style="color:var(--danger)">*</span></label><input type="text" id="mdi-endereco-bairro" required value="${(imo.enderecoBairro || '').replace(/"/g, '')}" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;"></div>
                            <div style="flex:1;"><label style="font-size:11px;font-weight:bold;color:#64748b;">Cidade <span style="color:var(--danger)">*</span></label><input type="text" id="mdi-endereco-cidade" required value="${(imo.enderecoCidade || '').replace(/"/g, '')}" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;"></div>
                        </div>
                        <div style="display:flex;gap:8px;">
                            <div style="flex:1;">
                                <label style="font-size:11px;font-weight:bold;color:#64748b;">Uso do imóvel <span style="color:var(--danger)">*</span></label>
                                <select id="mdi-finalidade-uso" required style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;background:#f8fafc;">
                                    <option value="long_stay">Long Stay (locação)</option>
                                    <option value="uso_proprio">Uso próprio</option>
                                    <option value="temporada">Temporada</option>
                                    <option value="comercial">Comercial</option>
                                    <option value="outro">Outro</option>
                                </select>
                            </div>
                            <div style="flex:1;"><label style="font-size:11px;font-weight:bold;color:#64748b;">Tamanho (m²) <span style="color:var(--danger)">*</span></label><input type="number" id="mdi-tamanho" required value="${imo.tamanho || 0}" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;"></div>
                        </div>
                        <div><label style="font-size:11px;font-weight:bold;color:#64748b;">Descrição <span style="color:var(--danger)">*</span></label><textarea id="mdi-descricao" required rows="3" placeholder="Ex.: conjunto de salas 901 a 915 do 9º pavimento, com 4 vagas de garagem (números 40, 41, 47 e 48) no pavimento G3" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;">${(imo.descricao || '').replace(/</g, '&lt;')}</textarea><p style="font-size:10px;color:#94a3b8;margin-top:2px;">Inclua aqui detalhes que a minuta pode precisar — numeração de salas/unidades, vagas de garagem, características especiais.</p></div>
                        <div style="display:flex;gap:8px;">
                            <!-- CORRIGIDO (v1.57.0 — pedido explícito): rótulo
                                 "Valor do aluguel" → "Expectativa aluguel"
                                 (é o valor esperado/anunciado do imóvel, não
                                 o valor do contrato em si — esse fica no
                                 contrato). -->
                            <div style="flex:1;"><label style="font-size:11px;font-weight:bold;color:#64748b;">Expectativa aluguel (R$) <span style="color:var(--danger)">*</span></label><input type="number" id="mdi-valor" required value="${imo.valor || 0}" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;"></div>
                            <div style="flex:1;"><label style="font-size:11px;font-weight:bold;color:#64748b;">Valor de mercado (R$)</label><input type="number" id="mdi-valor-mercado" value="${imo.valorMercado || 0}" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;"></div>
                        </div>
                        <div style="display:flex;gap:8px;">
                            <div style="flex:1;"><label style="font-size:11px;font-weight:bold;color:#64748b;">Condomínio (R$)</label><input type="number" id="mdi-condominio" value="${imo.condominio || 0}" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;"></div>
                            <div style="flex:1;"><label style="font-size:11px;font-weight:bold;color:#64748b;">IPTU (R$)</label><input type="number" id="mdi-iptu" value="${imo.iptu || 0}" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;"></div>
                        </div>
                        <div style="display:flex;gap:8px;">
                            <div style="flex:1;"><label style="font-size:11px;font-weight:bold;color:#64748b;">Código do IPTU</label><input type="text" id="mdi-iptu-codigo" value="${(imo.codigoIPTU || '').replace(/"/g, '')}" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;"></div>
                            <div style="flex:1;">
                                <!-- CORRIGIDO (v1.57.0 — pedido explícito):
                                     "Energia solidária" → "Energia" + ícone
                                     "i" explicando do que se trata. -->
                                <label style="font-size:11px;font-weight:bold;color:#64748b;display:flex;align-items:center;gap:4px;">Energia
                                    <button type="button" onclick="alert('Identifica se o imóvel pode se beneficiar do saldo de energia gerada por usina solar do proprietário na rede da concessionária.')" title="O que é isso?" style="width:15px;height:15px;border-radius:9999px;background:#e2e8f0;color:#475569;font-size:10px;font-weight:bold;border:none;line-height:15px;padding:0;">i</button>
                                </label>
                                <select id="mdi-energia-rumo" style="width:100%;padding:8px;border:1px solid #cbd5e1;border-radius:6px;font-size:13px;margin-top:2px;background:#f8fafc;">
                                    <option value="Não" ${imo.energiaRumo !== 'Sim' ? 'selected' : ''}>Não</option>
                                    <option value="Sim" ${imo.energiaRumo === 'Sim' ? 'selected' : ''}>Sim</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div style="display:flex;gap:8px;margin-top:14px;">
                        <button onclick="fecharModalCampoContrato()" style="flex:1;background:#f1f5f9;color:#475569;font-weight:bold;font-size:13px;padding:10px;border:none;border-radius:8px;">Fechar</button>
                        <button onclick="salvarDetalhesImovelPopup('${imo.id}')" style="flex:1;background:var(--sprout);color:#fff;font-weight:bold;font-size:13px;padding:10px;border:none;border-radius:8px;">Salvar</button>
                    </div>
                </div>`;
            document.body.appendChild(modal);
            modal.onclick = (ev) => { if (ev.target === modal) modal.remove(); };
            document.getElementById('mdi-empreendimento').value = imo.empreendimento || '';
            document.getElementById('mdi-tipo').value = imo.tipo || '';
            document.getElementById('mdi-finalidade-uso').value = imo.finalidadeUso || 'long_stay';
        }


        export async function salvarDetalhesImovelPopup(imovelId) {
            const imo = imoveis.find(i => i.id === imovelId);
            if (!imo) return;

            imo.empreendimento = document.getElementById('mdi-empreendimento').value;
            imo.tipo = document.getElementById('mdi-tipo').value;
            // NOVO (30/08/2026) — status acompanha a mudança de Uso aqui
            // também (ver statusAoEditarFinalidadeUso) — antes só o
            // formulário principal (saveImovel) fazia isso, e só na
            // criação; agora os 2 pontos de edição de Uso ficam
            // consistentes entre si.
            imo.status = statusAoEditarFinalidadeUso(imo.finalidadeUso, document.getElementById('mdi-finalidade-uso').value, imo.status, imo.id);
            imo.finalidadeUso = document.getElementById('mdi-finalidade-uso').value;
            imo.tamanho = parseFloat(document.getElementById('mdi-tamanho').value) || 0;
            imo.enderecoRua = document.getElementById('mdi-endereco-rua').value.trim();
            imo.enderecoNum = document.getElementById('mdi-endereco-num').value.trim();
            imo.enderecoComp = document.getElementById('mdi-endereco-comp').value.trim();
            imo.enderecoBairro = document.getElementById('mdi-endereco-bairro').value.trim();
            imo.enderecoCidade = document.getElementById('mdi-endereco-cidade').value.trim();
            imo.descricao = document.getElementById('mdi-descricao').value.trim();
            imo.valor = parseFloat(document.getElementById('mdi-valor').value) || 0;
            imo.valorMercado = parseFloat(document.getElementById('mdi-valor-mercado').value) || 0;
            imo.condominio = parseFloat(document.getElementById('mdi-condominio').value) || 0;
            imo.iptu = parseFloat(document.getElementById('mdi-iptu').value) || 0;
            imo.codigoIPTU = document.getElementById('mdi-iptu-codigo').value.trim();
            imo.energiaRumo = document.getElementById('mdi-energia-rumo').value;
            // fotos/divisao ficam como já estavam — este popup não os toca.

            mostrarCarregamentoGlobal('Salvando...');
            try {
                await sincronizarImovelSupabase(imo);
                esconderCarregamentoGlobal();
                fecharModalCampoContrato();
                mostrarToast('Imóvel atualizado!', 'success');
                registrarLog('imoveis.detalhes', { imovelId });
                if (fichaImovelAtualId === imovelId) renderFichaImovelUnica(imo);
                if (document.querySelector('.tab-content.active')?.id === 'tab-imoveis') renderImoveis();
            } catch (err) {
                esconderCarregamentoGlobal();
                alert('❌ Não consegui salvar: ' + (err.message || String(err)));
            }
        }


        export function alternarMaisAcoesFichaImovel() {
            const el = document.getElementById('fi-mais-acoes');
            const seta = document.getElementById('fi-mais-acoes-seta');
            if (!el) return;
            el.classList.toggle('hidden');
            if (seta) seta.style.transform = el.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }


        export async function buscarOuCriarAtivoCofreDoImovel(imovelId) {
            const { data: existente, error: errBusca } = await dbAuth
                .from('cofre_ativos').select('id')
                .eq('cliente_id', CLIENTE_ID_SUPABASE).eq('entidade_origem_tipo', 'imovel').eq('entidade_origem_id', imovelId)
                .maybeSingle();
            if (errBusca) throw errBusca;
            if (existente) return existente.id;

            const imo = imoveis.find(i => i.id === imovelId);
            const nomeExibicao = imo ? `${imo.enderecoRua || ''}, ${imo.enderecoNum || ''}`.trim().replace(/^,\s*/, '') || 'Imóvel' : 'Imóvel';
            const { data: novo, error: errCria } = await dbAuth.from('cofre_ativos').insert({
                cliente_id: CLIENTE_ID_SUPABASE, tipo_ativo: 'imovel', nome_exibicao: nomeExibicao, status: 'ativo',
                entidade_origem_tipo: 'imovel', entidade_origem_id: imovelId,
                identificadores: {}, dados_especificos: {}, criado_por: pessoaIdLogada || null,
            }).select('id').single();
            if (errCria) throw errCria;
            return novo.id;
        }


        export async function montarFotosImovelDoCofre(imovelId) {
            const box = document.getElementById('fi-box-fotos');
            if (!box) return;
            try {
                const { data: ativoExistente } = await dbAuth
                    .from('cofre_ativos').select('id')
                    .eq('cliente_id', CLIENTE_ID_SUPABASE).eq('entidade_origem_tipo', 'imovel').eq('entidade_origem_id', imovelId)
                    .maybeSingle();
                if (!ativoExistente) { box.classList.add('hidden'); __fotosImovelCache = []; __fotosImovelUrlsCache = []; return; }
                __ativoCofreDoImovelIdCache = ativoExistente.id;

                const { data: fotos, error } = await dbAuth.from('cofre_ativo_fotos').select('*').eq('ativo_id', ativoExistente.id).eq('status', 'ativo').order('ordem');
                if (error) throw error;
                __fotosImovelCache = fotos || [];
                if (!__fotosImovelCache.length) { box.classList.add('hidden'); __fotosImovelUrlsCache = []; return; }
                box.classList.remove('hidden');
                __fotosImovelUrlsCache = await Promise.all(__fotosImovelCache.map(async f => {
                    try { const { data } = await dbAuth.storage.from(f.bucket).createSignedUrl(f.storage_path, 600); return data ? data.signedUrl : null; }
                    catch (e) { return null; }
                }));
                document.getElementById('fi-fotos-grid').innerHTML = __fotosImovelCache.map((f, i) => `
                    <div class="relative flex-none">
                        <img src="${__fotosImovelUrlsCache[i] || ''}" onclick="abrirLightboxGeral(__fotosImovelUrlsCache, ${i})" class="w-16 h-16 object-cover rounded-lg border border-slate-200 cursor-pointer">
                        <button onclick="removerFotoImovelDoCofre('${f.id}', '${imovelId}')" title="Remover" class="absolute -top-1.5 -right-1.5 bg-white border border-slate-300 rounded-full w-5 h-5 flex items-center justify-center shadow-sm"><svg data-lucide="x" style="width:11px;height:11px;color:#64748b"></svg></button>
                    </div>`).join('');
                if (typeof lucide !== 'undefined') lucide.createIcons();
            } catch (err) {
                box.classList.add('hidden');
                console.warn('Falha ao carregar fotos do imóvel (Cofre, não bloqueando):', err.message);
            }
        }


        export function alternarMaisAcoesFotosImovel() {
            const el = document.getElementById('fi-fotos-acoes');
            const seta = document.getElementById('fi-fotos-seta');
            if (!el) return;
            el.classList.toggle('hidden');
            if (seta) seta.style.transform = el.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }


        export async function enviarFotosImovelParaCofre(imovelId) {
            const input = document.getElementById('fi-foto-input');
            const arquivos = input.files;
            if (!arquivos.length) return;
            mostrarCarregamentoGlobal('Enviando fotos...');
            try {
                const ativoId = await buscarOuCriarAtivoCofreDoImovel(imovelId);
                let ordem = __fotosImovelCache.length;
                for (const arquivo of arquivos) {
                    const fotoId = crypto.randomUUID();
                    const nomeSanitizado = arquivo.name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9._-]/g, '_');
                    const path = `${CLIENTE_ID_SUPABASE}/ativos/${ativoId}/fotos/${fotoId}_${nomeSanitizado}`;
                    const { error: errUpload } = await dbAuth.storage.from('cofre-documentos').upload(path, arquivo, { contentType: arquivo.type || 'image/jpeg' });
                    if (errUpload) throw errUpload;
                    const { error: errInsert } = await dbAuth.from('cofre_ativo_fotos').insert({
                        id: fotoId, cliente_id: CLIENTE_ID_SUPABASE, ativo_id: ativoId, bucket: 'cofre-documentos',
                        storage_path: path, nome_arquivo: arquivo.name, ordem: ordem++, criado_por: pessoaIdLogada || null,
                    });
                    if (errInsert) throw errInsert;
                }
                input.value = '';
                esconderCarregamentoGlobal();
                mostrarToast('Fotos enviadas ✅', 'success');
                await montarFotosImovelDoCofre(imovelId);
            } catch (err) {
                esconderCarregamentoGlobal();
                alert('❌ Não consegui enviar as fotos: ' + (err.message || String(err)));
            }
        }


        export async function removerFotoImovelDoCofre(fotoId, imovelId) {
            if (!confirm('Remover esta foto?')) return;
            try {
                const { error } = await dbAuth.from('cofre_ativo_fotos').update({ status: 'arquivado' }).eq('id', fotoId);
                if (error) throw error;
                mostrarToast('Foto removida.', 'success');
                await montarFotosImovelDoCofre(imovelId);
            } catch (err) {
                alert('❌ Erro ao remover: ' + (err.message || String(err)));
            }
        }


        export function voltarDaFichaImovel() {
            // v1.61.5 (I-5c, revisão DS §4.2) — antes ia sempre pra
            // tab-imoveis, fixo. Agora respeita a aba de origem real
            // (ex.: aberta a partir da Ficha do Contrato deve voltar pra
            // lá, não pra Imóveis) — fallback pro mapa estático apenas se
            // a origem não foi capturada por algum motivo.
            const destino = fichaImovelOrigemTab || TAB_PARENT_MAP['tab-imovel-ficha'] || 'tab-imoveis';
            fichaImovelAtualId = null;
            fichaImovelOrigemTab = null;
            switchTab(destino);
        }

        export function renderFichaImovelUnica(imo) {

            const el = document.getElementById('ficha-imovel-content');
            if (!imo || !el) return;

            const todosDoImovel = obterContratosContextuaisDoImovel(imo.id);
            const operacionais = todosDoImovel.filter(c => c.status !== 'Finalizado');
            const finalizados = todosDoImovel.filter(c => c.status === 'Finalizado');

            const corBadgeStatusContrato = (status) => status === 'Ativo' ? 'bg-green-100 text-green-800'
                : status === 'Assinando' ? 'bg-blue-100 text-blue-800'
                : status === 'Suspenso' ? 'bg-amber-100 text-amber-800'
                : 'bg-slate-100 text-slate-700';

            const htmlContrato = operacionais.length > 0
                ? operacionais.map(con => montarBoxContratoFicha(con, imo, corBadgeStatusContrato)).join('')
                : montarBoxSemContratoFicha(imo, finalizados);

            const idsContratosDoImovel = todosDoImovel.map(c => c.id);
            const mensalidadesDoImovel = mensalidades.filter(m => idsContratosDoImovel.includes(m.contratoId))
                .slice().sort((a, b) => (b.referencia || '').localeCompare(a.referencia || '')).slice(0, 3);

            // v1.49.0 — CORRIGIDO: box Financeiro compactado (ocupa menos
            // altura — linhas mais finas, sem borda por item) e ganhou
            // "Mais ações" (à direita, cinza) com "Histórico financeiro"
            // (reaproveita o mesmo filtro por imóvel que "Ver financeiro
            // completo" já usava, só que abrindo direto na aba cheia).
            // v1.51.0 — CORRIGIDO: "Inadimplente" agora aparece como
            // "Pendente" na ficha (só rótulo de exibição — o enum/dado real
            // no banco continua 'Inadimplente', não toquei em schema).
            // Clique no item foi removido (pedido explícito). Botão
            // renomeado "Histórico financeiro" → "Financeiro"; abre a aba
            // cheia já filtrada por este imóvel (ver nota no changelog
            // sobre "deste contrato" vs "deste imóvel").
            // CORRIGIDO (v1.58.0 — pedido explícito): boxes vazios não
            // aparecem mais (Financeiro sem lançamento, Serviços sem
            // síndico/manutencista, Divisão sem nada cadastrado) — EXCEÇÃO
            // explícita: o box Contrato sempre aparece, mesmo vazio
            // (montarBoxSemContratoFicha já cobre esse caso, com "Mais
            // ações → Locação"). Documentos é decidido depois, de forma
            // assíncrona, dentro de renderFiltroDocumentosFicha().
            const htmlFinanceiro = mensalidadesDoImovel.length === 0 ? '' : `
                <div class="bg-white p-3 rounded-xl shadow-sm border border-gray-200">
                    <h3 class="font-bold text-sm raiz-text-pine">Financeiro</h3>
                    <div class="mt-1.5">
                    ${mensalidadesDoImovel.map(m => `
                        <div class="flex items-center gap-2 py-1.5 border-b border-slate-50 last:border-0">
                            <svg data-lucide="${m.status==='Pago'?'check-circle-2':'clock'}" style="width:14px;height:14px;flex:none;color:${m.status==='Pago'?'var(--success)':'var(--danger)'}"></svg>
                            <div class="flex-1 min-w-0 text-xs font-bold truncate">${m.referencia || '-'} <span class="font-normal text-slate-400">· ${m.status === 'Pago' ? 'Pago' : 'Pendente'}</span></div>
                            <div class="text-xs font-bold flex-none">${formatarMoedaBR(m.valorConfirmado)}</div>
                        </div>`).join('')}
                    </div>
                    <div class="flex justify-end mt-3 pt-3 border-t border-slate-100">
                        <button onclick="alternarMaisAcoesFinanceiroFicha()" class="text-xs font-bold text-slate-500 flex items-center gap-1">Mais ações <svg data-lucide="chevron-down" id="fi-financeiro-seta" style="width:13px;height:13px"></svg></button>
                    </div>
                    <div id="fi-financeiro-acoes" class="hidden mt-2 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5 justify-end">
                        <button onclick="abrirFinanceiroFiltradoImovel('${imo.id}', '${(imo.empreendimento || '-').replace(/'/g, "")}')" class="text-[11px] font-bold px-2.5 py-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300 flex items-center gap-1"><svg data-lucide="wallet" style="width:11px;height:11px"></svg> Financeiro</button>
                    </div>
                </div>`;

            // Box: Foto — MOVIDO (27/08/2026, pedido explícito: "depois do
            // box financeiro. deixe o espaçamento padrão entre os
            // boxes") — antes vivia em ficha-imovel-head (junto do
            // cabeçalho), agora entra na MESMA concatenação de
            // el.innerHTML abaixo, logo após htmlFinanceiro — herda o
            // "space-y-3" do container automaticamente, sem precisar de
            // margem própria. Input de arquivo (fi-foto-input) migrou
            // junto — só precisa existir no DOM antes da pessoa clicar,
            // não importa se está fisicamente antes ou depois da pill
            // "Fotos" no Mais ações de Dados do imóvel (que aponta pra cá
            // via for=). Reaproveita cofre_ativo_fotos — como essa tabela
            // é ativo_id-scoped (não tem entidade_tipo/entidade_id
            // genérico), o imóvel precisa de um "ativo" Cofre
            // correspondente (buscarOuCriarAtivoCofreDoImovel() acha ou
            // cria sozinho, só no primeiro envio de foto).
            const htmlFoto = `
                <input type="file" id="fi-foto-input" accept="image/*" multiple class="hidden" onchange="enviarFotosImovelParaCofre('${imo.id}')">
                <div id="fi-box-fotos" class="hidden bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <h3 class="font-bold text-sm raiz-text-pine">Foto</h3>
                    <div id="fi-fotos-grid" class="flex flex-wrap gap-2 mt-2"></div>
                    <div class="flex justify-end mt-3 pt-3 border-t border-slate-100">
                        <button onclick="alternarMaisAcoesFotosImovel()" class="text-xs font-bold text-slate-500 flex items-center gap-1">Mais ações <svg data-lucide="chevron-down" id="fi-fotos-seta" style="width:13px;height:13px"></svg></button>
                    </div>
                    <div id="fi-fotos-acoes" class="hidden mt-2 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5 justify-end">
                        <label for="fi-foto-input" class="text-[11px] font-bold px-2.5 py-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300 flex items-center gap-1" style="cursor:pointer"><svg data-lucide="image-plus" style="width:11px;height:11px"></svg> Adicionar fotos</label>
                    </div>
                </div>`;

            // v1.49.0 — CORRIGIDO: link direto pro Cofre removido do box
            // (pedido explícito "retirar por enquanto"). Vira um resumo com
            // filtro por tipo, mostrado inline aqui mesmo (sem sair da
            // ficha) — ver renderFiltroDocumentosFicha().
            const htmlDocumentos = `
                <div id="ficha-imovel-box-documentos" class="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <h3 class="font-bold text-sm raiz-text-pine">Documentos</h3>
                    <div id="ficha-imovel-doc-filtros" class="flex flex-wrap gap-1.5 mt-2"></div>
                    <div id="ficha-imovel-doc-lista" class="mt-2 space-y-1.5">
                        <p class="text-[11px] text-slate-500">Carregando...</p>
                    </div>
                </div>`;

            // v1.49.0 — Serviços ganhou "Mais ações" (cinza, à direita) com
            // "Vincular prestadores serviços" (leva pra Configurações onde
            // o vínculo por empreendimento já é gerenciado — não recriei
            // essa lógica aqui) e "Chamar manutenção" (mesma ação de
            // sempre). Ícone verde da chave/ferramenta ao lado do contato
            // removido (pedido explícito).
            const sind = sindicos.find(s => s.id === imo.sindicoId);
            const man = manutencistas.find(m => m.id === imo.manutencistaId);
            const htmlServicos = (!sind && !man) ? '' : `
                <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <h3 class="font-bold text-sm raiz-text-pine">Serviços</h3>
                    <div class="mt-2 space-y-2">
                        ${sind ? `
                        <div class="min-w-0"><div class="text-xs font-bold truncate">${sind.nome}</div><div class="text-[11px] text-slate-500">Síndico${sind.whatsapp ? ' · ' + sind.whatsapp : ''}</div></div>` : ''}
                        ${man ? `
                        <div class="min-w-0 ${sind ? 'pt-2 border-t border-slate-100' : ''}"><div class="text-xs font-bold truncate">${man.nome}</div><div class="text-[11px] text-slate-500">Manutenção${man.whatsapp ? ' · ' + man.whatsapp : ''}</div></div>` : ''}
                    </div>
                    <div class="flex justify-end mt-3 pt-3 border-t border-slate-100">
                        <button onclick="alternarMaisAcoesServicosFicha()" class="text-xs font-bold text-slate-500 flex items-center gap-1">Mais ações <svg data-lucide="chevron-down" id="fi-servicos-seta" style="width:13px;height:13px"></svg></button>
                    </div>
                    <div id="fi-servicos-acoes" class="hidden mt-2 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5 justify-end">
                        <!-- v1.51.0 — CORRIGIDO (pedido explícito): 1 botão
                             "Vincular prestadores serviços" virou 2 botões
                             separados. -->
                        <button onclick="abrirVincularSindico()" class="text-[11px] font-bold px-2.5 py-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300 flex items-center gap-1"><svg data-lucide="link" style="width:11px;height:11px"></svg> Vincular síndico</button>
                        <button onclick="abrirVincularManutencista()" class="text-[11px] font-bold px-2.5 py-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300 flex items-center gap-1"><svg data-lucide="link" style="width:11px;height:11px"></svg> Vincular manutencista</button>
                        ${man && man.whatsapp ? `<button onclick="acionarManutencaoWhatsApp('${man.whatsapp}', '${(man.nome || '').replace(/'/g, "")}', '${(imo.empreendimento || '').replace(/'/g, "")}', '')" class="text-[11px] font-bold px-2.5 py-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-300 flex items-center gap-1"><svg data-lucide="wrench" style="width:11px;height:11px"></svg> Chamar manutenção</button>` : ''}
                    </div>
                </div>`;

            // v1.49.0 — NOVA: box Divisão Societária (imóvel + contrato),
            // abaixo de Serviços (pedido explícito).
            const contratoDivisaoRef = operacionais[0] || null;
            const temDivisaoImovel = imo.divisao && typeof imo.divisao === 'object' && Object.keys(imo.divisao).length > 0;
            const temDivisaoContrato = contratoDivisaoRef && Array.isArray(contratoDivisaoRef.divisaoRepasse) && contratoDivisaoRef.divisaoRepasse.length > 0;
            const htmlDivisaoSocietaria = (!temDivisaoImovel && !temDivisaoContrato) ? '' : montarBoxDivisaoSocietaria(imo, contratoDivisaoRef);

            el.innerHTML = htmlContrato + htmlFinanceiro + htmlFoto + htmlDocumentos + htmlServicos + htmlDivisaoSocietaria;

            if (typeof lucide !== 'undefined') lucide.createIcons();

            renderFiltroDocumentosFicha(imo, todosDoImovel);

        }

        export async function salvarDivisaoImovelPopup(imovelId) {
            const imo = imoveis.find(i => i.id === imovelId);
            if (!imo) return;
            const validas = __divisaoPopupImovel.filter(s => s.nome && s.nome.trim());
            const total = validas.reduce((s, x) => s + (parseFloat(x.pct) || 0), 0);
            if (validas.length > 0 && Math.abs(total - 100) > 0.5) {
                if (!confirm(`A soma dos percentuais é ${total.toFixed(1)}%, não 100%. Salvar mesmo assim?`)) return;
            }

            mostrarCarregamentoGlobal('Salvando divisão...');
            try {
                const { data: ativoRow, error: errAtivo } = await dbAuth.from('cofre_ativos')
                    .select('id').eq('entidade_origem_tipo', 'imovel').eq('entidade_origem_id', imovelId).single();
                if (errAtivo || !ativoRow) throw new Error('Não achei o ativo correspondente a este imóvel (cofre_ativos).');

                // Mesma resolução pessoa_id/nome_externo que
                // sincronizarContratoSupabase/salvarDivisaoContratoPopup já
                // fazem — não inventei uma segunda regra de negócio.
                const linhas = validas.map(s => {
                    const pessoaEncontrada = (pessoas || []).find(p => p.nome === s.nome || p.nome.split(' ')[0] === s.nome);
                    return pessoaEncontrada
                        ? { tipo_proprietario: 'socio_interno', pessoa_id: pessoaEncontrada.id, nome_externo: '', percentual: parseFloat(s.pct) || 0 }
                        : { tipo_proprietario: 'terceiro_externo', pessoa_id: '', nome_externo: s.nome.trim(), percentual: parseFloat(s.pct) || 0 };
                });

                const { error } = await dbAuth.rpc('substituir_propriedade_ativo', { p_ativo_id: ativoRow.id, p_linhas: linhas });
                if (error) throw error;

                const novoObj = {};
                validas.forEach(s => { novoObj[s.nome.trim()] = parseFloat(s.pct) || 0; });
                imo.divisao = novoObj;
                esconderCarregamentoGlobal();
                mostrarToast('Divisão do imóvel salva!', 'success');
                registrarLog('imoveis.divisao_societaria', { imovelId });
                if (fichaImovelAtualId === imovelId) renderFichaImovelUnica(imo);
            } catch (err) {
                esconderCarregamentoGlobal();
                alert('❌ Não consegui salvar: ' + (err.message || String(err)));
            }
        }



        export function acionarZapIptuImovel(imovelId) {

            const imo = imoveis.find(i => i.id === imovelId);

            if (!imo) return;

            // CORRIGIDO (v1.46.0) — antes usava contratos.find(...) e
            // escolhia o primeiro contrato Ativo em silêncio, mesmo se
            // houvesse mais de um. Especificação Múltiplos Contratos, Parte
            // A §7 (exemplo explícito: "IPTU/WhatsApp"): 0→informar,
            // 1→executar, >1→seletor.
            const elegiveis = contratos.filter(c => c.imovelId === imovelId && c.status === 'Ativo' && c.whatsapp);

            if (elegiveis.length === 0) {
                alert("⚠️ Não há um contrato ativo com WhatsApp cadastrado para este imóvel.");
                return;
            }

            if (elegiveis.length > 1) {
                abrirSeletorContratoParaAcao('Enviar IPTU para qual contrato?', elegiveis, (con) => executarZapIptu(imo, con));
                return;
            }

            executarZapIptu(imo, elegiveis[0]);

        }
