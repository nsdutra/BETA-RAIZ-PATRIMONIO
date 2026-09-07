// ============================================================================
// vitrine.js — Raiz Patrimônio · Vitrine (links públicos de imóveis, lightbox)
//               e contratação pública (formulário do interessado via link)
// Versão: 1.0.0 · 06/09/2026
//
// R8 — FRAGMENTAÇÃO, FATIA 4 (A.8). Quarto corte do index.html (Beta
// v1.143.0), mesmo método das fatias 1–3: ES module SOB DEMANDA, pontes
// window[nome] no index, rzVitSeCarregado() nos ganchos de recarga.
//
// O QUE MORA AQUI: aba Vitrine (renderVitrine, busca, gerar link de 1 ou N
// imóveis), modo público ?v=<token> (verificarFiltroVitrineExterna — troca o
// <body> inteiro pela vitrine, lightbox de fotos, sair), modo público
// ?contratar=<token> (iniciarModoContratacaoPublica, validação e envio do
// formulário do interessado), início do processo de contratação a partir do
// imóvel/ativo (iniciarProcessoContratacao, abrirModalOpcoesContratacao) e o
// resumo pro WhatsApp (copyResumo).
//
// COMO É CHAMADO: switchTab('tab-vitrine') → montarAbaVitrine(); boot público
// (window.onload) importa o módulo ANTES de seguir quando a URL tem ?contratar
// ou ?v/?viewShowcase — a vitrine pública nunca deixa o visitante ver o login,
// então o import é aguardado (await) e só então o boot continua, igual ao
// comportamento anterior. Sem parâmetro público, o módulo não é baixado.
// cofre-ativos.js chama window.gerarVitrineDoImovel/iniciarProcessoContratacao
// (pontes). Ficha antiga do imóvel usa copyResumo/iniciarProcessoContratacao
// por onclick (pontes).
//
// O QUE FICOU NO index.html: dados (`processosContratacao`, links_vitrine —
// carregar/criar/apagar/resolverVitrinePublicaSupabase, usados no boot e no
// Dev), validarCNPJ (Partes e contrato também usam), banner de contratação
// do PLANO (mostrarBannerContratacao — é licença, não vitrine), HTML das
// telas públicas e da aba (sai com a gramática).
//
// ESTADO GLOBAL LIDO: imoveis, contratos, processosContratacao, CONFIG_CLIENTE,
// CLIENTE_ID_SUPABASE, dbAuth. Exclusivo (4) virou nível de módulo.
// Indentação de origem mantida. Strict verificado.
// ============================================================================

import { encontrarMinutaParaImovel } from './minutas.js'; // retorno usado de forma síncrona — import, não ponte

export const VERSAO = '1.0.0'; // v-check: manter igual ao header

/** Ponto de entrada do switchTab('tab-vitrine'). */
export function montarAbaVitrine() {
    renderVitrine();
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

        // v1.47.0 — overlay de busca da Vitrine (mesmo padrão do de Imóveis
        // acima, IDs próprios: vitrine-filtro-emp/status, que já existiam
        // como <select> visíveis num card fixo — só migraram de lugar).
        export function abrirBuscaVitrine() {
            const modal = document.getElementById('modal-busca-vitrine');
            modal.classList.remove('hidden');
            modal.onclick = (ev) => { if (ev.target === modal) fecharBuscaVitrine(); };
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        export function fecharBuscaVitrine() {
            document.getElementById('modal-busca-vitrine').classList.add('hidden');
        }

        export function copyResumo(end, tipo, val, suites, cond) {

            const txt = `🏠 *${CONFIG_CLIENTE.nomeEmpresa.toUpperCase()} - OPORTUNIDADE*\n📍 *Tipo:* ${tipo}\n📍 *Endereço:* ${end}\n💰 *Valor Locação:* R$ ${val.toLocaleString('pt-BR')}\n📦 *Condomínio:* R$ ${cond}`;

            navigator.clipboard.writeText(txt);

            alert("Resumo de locação copiado!");

        }

        export function renderVitrine() {

            const container = document.getElementById('lista-vitrine');

            if(!container) return;

            container.innerHTML = '';

            popularFiltroSelect('vitrine-filtro-emp', imoveis.map(i => i.empreendimento));

            const fEmp = document.getElementById('vitrine-filtro-emp').value;

            const fStat = document.getElementById('vitrine-filtro-status').value;

            imoveis.forEach(imo => {

                if(fEmp !== 'todos' && imo.empreendimento !== fEmp) return;

                if(fStat !== 'todos' && imo.status !== fStat) return;

                // Espelha exatamente o que aparece no link público da vitrine — todas

                // as fotos (não só a primeira) e os mesmos campos (até Energia).

                // Código do IPTU e demais dados internos (manutenção, sócios) NUNCA

                // aparecem aqui, igual no link público.

                let fotosHtml = '';

                if (imo.fotos && imo.fotos.length > 0) {

                    fotosHtml = '<div class="flex gap-1.5 overflow-x-auto py-2">' +

                        imo.fotos.map((foto, idx) => `<img src="${foto}" onclick="event.stopPropagation(); abrirLightboxImovelSalvo('${imo.id}', ${idx})" class="w-16 h-16 object-cover rounded-lg border flex-none cursor-pointer">`).join('') +

                        '</div>';

                }

                const badgeEnergia = imo.energiaRumo === 'Sim'

                    ? `<span class="text-[11px] font-bold px-1.5 py-0.5 rounded raiz-badge-atributo ml-1"><svg data-lucide="zap" style="width:11px;height:11px;display:inline;vertical-align:-1px"></svg></span>`

                    : '';

                container.innerHTML += `

                    <div class="bg-white p-3 rounded-xl border border-gray-200">

                        <div class="flex gap-3 items-start">

                            <input type="checkbox" data-id="${imo.id}" class="vitrine-checkbox w-4 h-4 text-emerald-600 rounded mt-1">

                            <div class="flex-1 min-w-0">

                                <span class="text-[11px] font-bold px-1.5 py-0.5 rounded ${imo.status==='Vago'?'bg-amber-100 text-amber-800':(imo.status==='Assinando'?'bg-blue-100 text-blue-800':'bg-green-100 text-green-800')}">${imo.status}</span>${badgeEnergia}

                                <p class="text-xs font-bold mt-1 text-slate-900">${imo.empreendimento} - ${imo.tipo}</p>

                                <p class="text-[11px] text-gray-500">${imo.enderecoRua || ''}, ${imo.enderecoNum || ''}${imo.enderecoComp ? ' - ' + imo.enderecoComp : ''}, ${imo.enderecoBairro || ''}, ${imo.enderecoCidade || ''}</p>

                                <p class="text-[11px] text-gray-500">Tamanho: ${imo.tamanho}m² | Suítes: ${imo.suites} | WC: ${imo.banheiros}</p>

                                <p class="text-[11px] text-gray-500">Condomínio: R$ ${imo.condominio} | IPTU: R$ ${imo.iptu}</p>

                                ${imo.descricao ? `<p class="text-[11px] text-gray-400 italic mt-0.5">${imo.descricao}</p>` : ''}

                                <p class="text-[13px] font-black raiz-text-pine mt-1">Aluguel: R$ ${imo.valor.toLocaleString('pt-BR')}</p>

                            </div>

                            <!-- v1.49.0 — "Iniciar Contratação" removido do
                                 card da Vitrine (pedido explícito) — o
                                 fluxo continua existindo, só que agora só
                                 pela ficha do imóvel (box Contrato → Mais
                                 ações → Iniciar contratação). -->
                            <button onclick="event.stopPropagation(); copyResumo('${(imo.enderecoRua || '') + ', ' + (imo.enderecoNum || '')}', '${imo.tipo}', ${imo.valor || 0}, ${imo.suites || 0}, ${imo.condominio || 0})" title="Copiar resumo para WhatsApp" class="w-8 h-8 flex-none flex items-center justify-center bg-slate-100 text-slate-700 rounded-full border border-slate-300"><svg data-lucide="copy" style="width:12px;height:12px;display:inline;vertical-align:-1px"></svg></button>

                        </div>

                        ${fotosHtml}

                    </div>

                `;

            });

            if (typeof lucide !== 'undefined') lucide.createIcons();

        }

        export async function iniciarProcessoContratacao(imovelId) {

            const imo = imoveis.find(i => i.id === imovelId);
            if (!imo) return;

            // Uso do Imóvel (revisão DS, 25/08/2026) — pedido explícito:
            // imóvel de uso pessoal nunca pode ter contrato de aluguel.
            // Guarda única aqui (função-fonte) cobre todos os pontos de
            // entrada: pill "Locação" da Ficha (montarBoxSemContratoFicha),
            // reabertura de processo "Assinando", e a Vitrine pública.
            if (imo.finalidadeUso === 'uso_proprio') {
                alert('⚠️ Este imóvel está marcado como "Uso Pessoal" — não é possível criar um contrato de aluguel para ele.\n\nSe isso mudou, altere o "Uso do imóvel" no cadastro (Detalhes do Imóvel) antes de continuar.');
                return;
            }

            mostrarCarregamentoGlobal("Preparando processo de contratação...");

            try {
                const token = (crypto.randomUUID ? crypto.randomUUID() : (Date.now() + '-' + Math.random().toString(36).slice(2))).replace(/-/g, '');

                const linha = {
                    cliente_id: CLIENTE_ID_SUPABASE,
                    imovel_id: imovelId,
                    token: token,
                    status: 'aguardando_preenchimento',
                    origem: null // definido no clique de "Gerar Link" ou "Abrir WhatsApp"
                };

                const { data: inserido, error } = await dbAuth.from('processos_contratacao').insert(linha).select('id').single();
                if (error) throw error;

                esconderCarregamentoGlobal();

                abrirModalOpcoesContratacao(imo, token, inserido.id);

            } catch (err) {
                esconderCarregamentoGlobal();
                alert('❌ Não consegui iniciar o processo de contratação: ' + (err.message || String(err)) + '\n\nSe o erro mencionar "processos_contratacao" ou "relation does not exist", a migration do módulo de Minutas ainda não foi rodada no banco.');
            }

        }

        // v1.116.0 (pedido explícito: "para um novo contrato ou em
        // assinatura, deixar as opções do print no menu 3 bolinhas") —
        // popup HTML solto (bottom-sheet com estilo inline, fora da
        // gramática) virou abrirSheetAcoes. Nenhuma regra de negócio
        // mudou: mesmo token, mesmo registrarLog, mesma checagem de
        // minuta padrão (encontrarMinutaParaImovel) pra decidir se
        // mostra as 4 opções ou o aviso "cadastre uma minuta".
        export function abrirModalOpcoesContratacao(imo, token, processoId) {
            if (typeof abrirSheetAcoes !== 'function') return;
            const link = `https://app.raizpatrimonio.com.br/?contratar=${token}`;
            const endereco = `${imo.enderecoRua || ''}, ${imo.enderecoNum || ''}${imo.enderecoComp ? ' - ' + imo.enderecoComp : ''}, ${imo.enderecoBairro || ''}`;
            const mensagemZap = `Olá! Para darmos andamento à locação do imóvel em ${endereco}, preciso de alguns dados seus para gerar o contrato:\n\n- Nome completo\n- CPF ou CNPJ\n- WhatsApp\n- E-mail\n- Endereço atual\n- Profissão\n- Estado civil\n\nVocê pode preencher direto por este link: ${link}`;
            const minuta = encontrarMinutaParaImovel(imo.id);
            const acoes = [
                { icone: 'file-plus', titulo: 'Dados novo contrato', codigo: 'contratos.criar', sub: 'Preencher você mesmo, direto no formulário', aoTocar: () => abrirDadosNovoContratoPopup(imo.id) },
            ];
            if (minuta) {
                acoes.push(
                    { icone: 'copy', titulo: 'Gerar link para coleta de dados', codigo: 'contratos.criar', sub: 'Vale por 15 dias · interessado preenche sozinho', aoTocar: () => { registrarLog('contratacao.link_gerado', { imovelId: imo.id, processoId }); dbAuth.from('processos_contratacao').update({ origem: 'link' }).eq('id', processoId); navigator.clipboard.writeText(link); mostrarToast('Link copiado!', 'success'); } },
                    { icone: 'message-circle', titulo: 'Abrir WhatsApp com os dados pedidos', codigo: 'contratos.criar', aoTocar: () => { registrarLog('contratacao.whatsapp_aberto', { imovelId: imo.id, processoId }); dbAuth.from('processos_contratacao').update({ origem: 'whatsapp_manual' }).eq('id', processoId); window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(mensagemZap), '_blank'); } },
                    { icone: 'download', titulo: 'Conferir minuta padrão', codigo: 'minutas.gerar', aoTocar: () => baixarMinutaPadraoImovel(imo.id) },
                    { icone: 'file-signature', titulo: 'Gerar minuta', codigo: 'minutas.gerar', sub: 'A partir de um contrato Assinando já com os dados', aoTocar: () => gerarMinutaNoCofre(imo.id) }
                );
            }
            abrirSheetAcoes({
                titulo: 'Locação', sub: endereco, acoes,
                grupos: minuta ? null : [
                    { titulo: 'Dados', acoes: [acoes[0]] },
                    { titulo: 'Sem minuta padrão cadastrada', acoes: [
                        { icone: 'file-signature', titulo: 'Cadastrar minuta padrão', codigo: 'minutas.gerar', sub: 'Necessária pra link, WhatsApp e geração de minuta', aoTocar: () => switchTab('tab-minutas') }
                    ] }
                ]
            });
        }

        let processoContratacaoAtual = null;

        let tokenContratacaoPublicaAtual = null;

        export async function iniciarModoContratacaoPublica(token) {

            document.getElementById('tela-contratacao-publica').classList.remove('hidden');
            tokenContratacaoPublicaAtual = token;

            try {
                const { data: linhas, error } = await dbAuth
                    .rpc('fn_processo_publico_obter', { p_token: token });

                if (error) throw error;

                const processo = Array.isArray(linhas) ? linhas[0] : linhas;

                // A RPC já valida token+status='aguardando_preenchimento'+prazo —
                // se vier vazio, é porque o link expirou, já foi usado, ou não existe.
                if (!processo) {
                    mostrarErroContratacaoPublica('Este link não é mais válido — já foi usado ou expirou. Peça um novo link a quem te enviou este.');
                    return;
                }

                processoContratacaoAtual = processo;

                const resumoImovel = processo.imovel_endereco_rua
                    ? `${processo.imovel_endereco_rua}, ${processo.imovel_endereco_num || ''}${processo.imovel_endereco_comp ? ' - ' + processo.imovel_endereco_comp : ''}, ${processo.imovel_endereco_bairro || ''}, ${processo.imovel_endereco_cidade || ''}`
                    : 'Imóvel selecionado';

                document.getElementById('contratacao-publica-imovel-resumo').textContent = resumoImovel;
                document.getElementById('contratacao-publica-carregando').classList.add('hidden');
                document.getElementById('contratacao-publica-form-wrapper').classList.remove('hidden');

            } catch (err) {
                console.error('Erro ao carregar processo de contratação:', err);
                mostrarErroContratacaoPublica('Não consegui carregar os dados deste link agora. Tente de novo em alguns instantes.');
            }

        }

        export function mostrarErroContratacaoPublica(mensagem) {
            document.getElementById('contratacao-publica-carregando').classList.add('hidden');
            document.getElementById('contratacao-publica-erro-texto').textContent = mensagem;
            document.getElementById('contratacao-publica-erro').classList.remove('hidden');
        }

        // CORRIGIDO (v1.51.0) — pedido explícito: fechar tenta fechar a
        // ABA/janela do navegador (window.close(), só funciona se a aba foi
        // aberta via script/link direto — é o caso normal de quem abre o
        // link do WhatsApp). Se o navegador não permitir fechar (guia digitada
        // manualmente, por exemplo), cai num aviso simples em vez de mandar
        // pra landing page.
        export function fecharTelaContratacaoPublica() {
            window.close();
            setTimeout(() => {
                document.body.innerHTML = '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#152a24;color:#fff;font-family:sans-serif;text-align:center;padding:24px;"><p style="font-size:14px;">Você já pode fechar esta aba.</p></div>';
            }, 300);
        }

        // v1.44.2 — monta o texto único salvo em interessado_endereco_atual
        // a partir dos campos estruturados do formulário (rua/número/
        // complemento/bairro/cidade/UF/CEP). Não criei colunas novas na
        // tabela pra isso — ver observação no HANDOFF sobre essa decisão.
        export function montarEnderecoContratacaoPublica() {
            const rua = document.getElementById('cp-endereco-rua').value.trim();
            const num = document.getElementById('cp-endereco-num').value.trim();
            const comp = document.getElementById('cp-endereco-comp').value.trim();
            const bairro = document.getElementById('cp-endereco-bairro').value.trim();
            const cidade = document.getElementById('cp-endereco-cidade').value.trim();
            const uf = document.getElementById('cp-endereco-uf').value;
            const cep = document.getElementById('cp-endereco-cep').value.trim();

            if (!rua && !num && !bairro && !cidade && !cep) return null;

            let partes = rua;
            if (num) partes += (partes ? ', ' : '') + num;
            if (comp) partes += ' - ' + comp;
            if (bairro) partes += (partes ? ', ' : '') + bairro;
            if (cidade) partes += (partes ? ', ' : '') + cidade + (uf ? '/' + uf : '');
            else if (uf) partes += (partes ? ' - ' : '') + uf;
            if (cep) partes += (partes ? ' - CEP ' : 'CEP ') + cep;

            return partes || null;
        }

        // v1.45.0 (Correção de Direção UX — item 8.3) — localiza o primeiro
        // campo inválido do formulário público antes do submit, reaproveitando
        // os mesmos validadores que já existem (validarCPF/validarCNPJ,
        // validarTelefoneBR, validarEmailFormato, validarCEPFormato) — nenhuma
        // regra de validação nova foi inventada, só a checagem "qual é o
        // primeiro problema" antes de mandar pro Supabase.
        export function primeiroCampoInvalidoContratacaoPublica() {

            const nome = document.getElementById('cp-nome').value.trim();
            if (!nome) return { id: 'cp-nome', indicadorId: 'cp-nome-erro', msg: 'Informe o nome completo.' };

            const doc = document.getElementById('cp-documento').value.replace(/\D/g, '');
            if (!doc) return { id: 'cp-documento', indicadorId: 'cp-doc-indicador', msg: 'Informe o CPF ou CNPJ.' };
            const docOk = doc.length === 11 ? validarCPF(doc) : (doc.length === 14 ? validarCNPJ(doc) : false);
            if (!docOk) return { id: 'cp-documento', indicadorId: 'cp-doc-indicador', msg: 'CPF/CNPJ inválido — confira os números.' };

            const telResultado = validarTelefoneBR(document.getElementById('cp-whatsapp').value);
            if (telResultado.vazio) return { id: 'cp-whatsapp', indicadorId: 'cp-whatsapp-indicador', msg: 'Informe o WhatsApp.' };
            if (telResultado.ok === false) return { id: 'cp-whatsapp', indicadorId: 'cp-whatsapp-indicador', msg: telResultado.motivo };

            const emailResultado = validarEmailFormato(document.getElementById('cp-email').value);
            if (emailResultado.vazio) return { id: 'cp-email', indicadorId: 'cp-email-indicador', msg: 'Informe o e-mail.' };
            if (emailResultado.ok === false) return { id: 'cp-email', indicadorId: 'cp-email-indicador', msg: emailResultado.motivo };

            // v1.54.0 — CORRIGIDO (pedido explícito): TODOS os campos do
            // formulário público agora são obrigatórios, não só bairro/
            // cidade/CEP.
            if (!document.getElementById('cp-endereco-rua').value.trim()) return { id: 'cp-endereco-rua', indicadorId: null, msg: 'Informe o endereço (rua/avenida).' };
            if (!document.getElementById('cp-endereco-num').value.trim()) return { id: 'cp-endereco-num', indicadorId: null, msg: 'Informe o número.' };
            if (!document.getElementById('cp-endereco-comp').value.trim()) return { id: 'cp-endereco-comp', indicadorId: null, msg: 'Informe o complemento (ou "N/A" se não houver).' };
            if (!document.getElementById('cp-endereco-bairro').value.trim()) return { id: 'cp-endereco-bairro', indicadorId: null, msg: 'Informe o bairro.' };
            if (!document.getElementById('cp-endereco-cidade').value.trim()) return { id: 'cp-endereco-cidade', indicadorId: null, msg: 'Informe a cidade.' };
            if (!document.getElementById('cp-endereco-uf').value) return { id: 'cp-endereco-uf', indicadorId: null, msg: 'Selecione o estado (UF).' };

            const cepResultado = validarCEPFormato(document.getElementById('cp-endereco-cep').value);
            if (cepResultado.vazio) return { id: 'cp-endereco-cep', indicadorId: 'cp-cep-indicador', msg: 'Informe o CEP.' };
            if (cepResultado.ok === false) return { id: 'cp-endereco-cep', indicadorId: 'cp-cep-indicador', msg: cepResultado.motivo };

            if (!document.getElementById('cp-profissao').value.trim()) return { id: 'cp-profissao', indicadorId: null, msg: 'Informe a profissão.' };
            if (!document.getElementById('cp-estado-civil').value) return { id: 'cp-estado-civil', indicadorId: null, msg: 'Selecione o estado civil.' };

            return null;
        }

        export function mostrarErroCampoContratacaoPublica(campoInvalido) {
            const indicador = document.getElementById(campoInvalido.indicadorId);
            if (indicador) {
                indicador.innerText = '⚠️ ' + campoInvalido.msg;
                indicador.className = 'raiz-indicador-inline text-[11px] mt-0.5 h-3 text-red-600 font-bold';
            }
            const input = document.getElementById(campoInvalido.id);
            if (input) {
                input.classList.add('border-red-400');
                input.scrollIntoView({ block: 'center', behavior: 'smooth' });
                input.focus();
            }
        }

        export async function enviarFormularioContratacaoPublico(e) {
            e.preventDefault();

            if (!processoContratacaoAtual) return;

            // v1.45.0 — checa o primeiro campo inválido ANTES de mexer no
            // botão/backend; foca e rola até ele, mostra a mensagem no
            // mesmo indicador que o campo já usa (não inventa um padrão
            // visual novo).
            const campoInvalido = primeiroCampoInvalidoContratacaoPublica();
            if (campoInvalido) {
                mostrarErroCampoContratacaoPublica(campoInvalido);
                return;
            }

            const btn = document.getElementById('btn-enviar-contratacao-publica');
            const textoOriginalBtn = btn.innerText;
            btn.disabled = true;
            btn.innerText = 'Enviando...';

            const documento = document.getElementById('cp-documento').value.trim();
            const digitosDoc = documento.replace(/\D/g, '');

            try {
                // v1.76.0 — trocado de UPDATE direto (dbAuth.from(...).update(...))
                // pra RPC (fn_processo_publico_preencher): a função revalida
                // token+status+prazo no servidor antes de gravar, e o status
                // final ('preenchido') é decidido dentro da função, nunca
                // aceito do cliente — fecha a mesma exposição corrigida na
                // leitura (ver comentário no início de iniciarModoContratacaoPublica).
                const { error } = await dbAuth.rpc('fn_processo_publico_preencher', {
                    p_token: tokenContratacaoPublicaAtual,
                    p_nome: document.getElementById('cp-nome').value.trim(),
                    p_doc_tipo: digitosDoc.length > 11 ? 'CNPJ' : 'CPF',
                    p_documento: documento,
                    p_whatsapp: document.getElementById('cp-whatsapp').value.trim(),
                    p_email: document.getElementById('cp-email').value.trim() || null,
                    p_endereco_atual: montarEnderecoContratacaoPublica(),
                    p_profissao: document.getElementById('cp-profissao').value.trim() || null,
                    p_estado_civil: document.getElementById('cp-estado-civil').value || null
                });

                if (error) throw error;

                document.getElementById('contratacao-publica-form-wrapper').classList.add('hidden');
                document.getElementById('contratacao-publica-sucesso').classList.remove('hidden');
                // v1.45.0 — o formulário pode ter ficado rolado lá embaixo;
                // sem isso, a mensagem de sucesso aparecia fora da área
                // visível em telas pequenas.
                document.getElementById('tela-contratacao-publica').scrollTo({ top: 0, behavior: 'smooth' });
                if (typeof lucide !== 'undefined') lucide.createIcons();

            } catch (err) {
                console.error('Erro ao enviar dados de contratação:', err);
                alert('❌ Não consegui enviar seus dados agora. Verifique sua internet e tente de novo.\n\n' + (err.message || String(err)));
                btn.disabled = false;
                btn.innerText = textoOriginalBtn;
            }

        }

        // v1.115.0 (fatia 7) — a geração do link saiu de dentro do handler
        // da tela pra gerarLinkVitrineParaIds(ids), pra ser reaproveitada
        // pelo ⋮ do ativo ("Gerar vitrine", cofre-ativos.js v1.22.0). O
        // resultado deixou de ser confirm()/alert() (3 popups) e virou sheet
        // com Copiar · WhatsApp · Abrir (REGRAS §3) + toast nos erros.
        export function gerarLinkVitrine() {
            const checkboxes = document.querySelectorAll('.vitrine-checkbox:checked');
            if (checkboxes.length === 0) {
                mostrarToast('Escolha ao menos um imóvel.', 'danger');
                return;
            }
            const idsSelecionados = [];
            checkboxes.forEach(cb => idsSelecionados.push(cb.getAttribute('data-id')));
            gerarLinkVitrineParaIds(idsSelecionados);
        }

        export function gerarVitrineDoImovel(imovelId) {
            if (!imovelId) { mostrarToast('Este ativo não está ligado a um imóvel.', 'danger'); return; }
            gerarLinkVitrineParaIds([String(imovelId)]);
        }

        export function gerarLinkVitrineParaIds(idsSelecionados) {
            // Gera um token curto e aleatório (6 caracteres) e registra a associação
            // token -> ids no Supabase, para não expor os IDs internos na URL pública.
            const token = Math.random().toString(36).substr(2, 6).toUpperCase();
            criarLinkVitrineSupabase(token, idsSelecionados).then(() => {
                links.push({
                    token: token,
                    ids: idsSelecionados.join(','),
                    criadoEm: new Date().toISOString(),
                    criadoEmBrasilia: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
                    qtdImoveis: idsSelecionados.length
                });
                dev_carregarLinks();
                registrarLog('vitrine.gerar', { token: token, qtdImoveis: idsSelecionados.length });
                const localUrl = window.location.href.split('?')[0];
                const linkFinal = `${localUrl}?v=${token}`;
                const textoWhats = encodeURIComponent(`Confira ${idsSelecionados.length > 1 ? 'estes imóveis' : 'este imóvel'}: ${linkFinal}`);
                const copiar = () => navigator.clipboard.writeText(linkFinal).then(() => mostrarToast('Link copiado.', 'success')).catch(() => mostrarToast('Não consegui copiar; use "Abrir a vitrine".', 'danger'));
                copiar();
                abrirSheetAcoes({ titulo: 'Vitrine pronta', sub: linkFinal, acoes: [
                    { icone: 'copy', titulo: 'Copiar link', sub: 'Já foi copiado; toque pra copiar de novo', aoTocar: copiar },
                    { icone: 'message-circle', titulo: 'Enviar pelo WhatsApp', aoTocar: () => window.open(`https://wa.me/?text=${textoWhats}`, '_blank') },
                    { icone: 'external-link', titulo: 'Abrir a vitrine', aoTocar: () => window.open(linkFinal, '_blank') }
                ]});
            }).catch((err) => {
                mostrarToast('Falha de conexão ao gerar o link. Verifique sua internet e tente de novo.', 'danger');
                console.error("Erro ao gerar link de vitrine:", err);
            });
        }

        export async function verificarFiltroVitrineExterna() {

            const urlParams = new URLSearchParams(window.location.search);

            const temAssetsAntigo = urlParams.get('viewShowcase') === 'true' && urlParams.get('assets');

            const temTokenCurto = !!urlParams.get('v');

            if (!temAssetsAntigo && !temTokenCurto) return; // não é um link de vitrine, segue fluxo normal do sistema

            // Mostra imediatamente uma tela de carregamento dedicada da vitrine —

            // nunca deixa o visitante público ver a tela de login do sistema

            // principal, nem por um instante, enquanto o token é resolvido.

            document.body.innerHTML = `

                <div class="max-w-md mx-auto p-4 space-y-6 bg-emerald-900 min-h-screen text-white">

                    <div class="text-center py-4 border-b border-emerald-800 relative">

                        <button onclick="sairDaVitrinePublica()" class="absolute top-3 right-0 text-xs font-bold text-slate-300 bg-emerald-800 border border-emerald-700 rounded-full px-3 py-1.5 active:scale-95 transition"><svg data-lucide="x" style="width:14px;height:14px"></svg> Sair</button>

                        <h1 class="text-2xl font-black text-emerald-400">${CONFIG_CLIENTE.nomeEmpresa}</h1>

                        <p class="text-[11px] text-gray-400 uppercase tracking-widest mt-1">Vitrine de Imóveis Selecionados</p>

                    </div>

                    <div id="external-showcase-container" class="space-y-4">

                        <p class="text-xs text-center text-slate-400 py-12 animate-pulse">🔄 Carregando vitrine...</p>

                    </div>

                </div>

                <div id="lightbox-vitrine" class="hidden fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">

                    <button onclick="fecharLightboxVitrine()" class="absolute top-4 right-4 text-white text-2xl font-bold"><svg data-lucide="x" style="width:16px;height:16px"></svg></button>

                    <button onclick="navegarLightboxVitrine(-1)" class="absolute left-2 text-white text-3xl font-bold px-2">‹</button>

                    <img id="lightbox-vitrine-img" class="max-h-[85vh] max-w-full rounded-lg object-contain">

                    <button onclick="navegarLightboxVitrine(1)" class="absolute right-2 text-white text-3xl font-bold px-2">›</button>

                    <p id="lightbox-vitrine-contador" class="absolute bottom-4 text-white text-xs"></p>

                </div>

            `;

            let listIds = null;

            if (temAssetsAntigo) {

                // Formato antigo (link com IDs expostos) — mantido por compatibilidade

                // com links já enviados antes da mudança para o link curto mascarado.

                listIds = urlParams.get('assets').split(',');

            } else if (temTokenCurto) {

                // ETAPA 3 — antes eram 2 chamadas ao Apps Script (resolver token +
                // buscar TODOS os imóveis para filtrar no navegador — um vazamento
                // de portfólio inteiro que já tínhamos corrigido no backend antigo,
                // mas o front nunca chegou a usar a versão corrigida). Agora é uma
                // única consulta ao Supabase, já filtrada pela política de RLS —
                // o visitante nunca recebe nada além dos imóveis daquele link.
                try {

                    imoveis = await resolverVitrinePublicaSupabase(urlParams.get('v'));
                    listIds = imoveis.map(function(i) { return i.id; });

                } catch (e) {

                    document.getElementById('external-showcase-container').innerHTML =
                        `<p class="text-xs text-center text-red-400 py-12"><svg data-lucide="alert-triangle" style="width:14px;height:14px;display:inline;vertical-align:-2px"></svg> Link inválido, expirado, ou falha ao carregar.<br>${e.message || ''}</p>`;
                    return;

                }

            }

            if (!listIds) return;

            // v1.43.1 — vitrine pública não usa mais o Apps Script legado.
            // Como não existe sessão autenticada, registra no schema comercial,
            // na mesma tabela de eventos públicos já usada pela landing.
            try {
                dbAuth.schema('comercial').from('eventos_landing').insert({
                    pagina: 'app_vitrine',
                    referrer: document.referrer || null,
                    utm_source: 'app',
                    utm_medium: 'vitrine_publica',
                    utm_campaign: 'acesso_vitrine',
                    user_agent: navigator.userAgent
                }).then(function(res) {
                    if (res.error) console.warn('Falha ao registrar acesso à vitrine:', res.error.message);
                });
            } catch (err) {
                console.warn('Falha ao registrar acesso à vitrine:', err.message);
            }

            const listContainer = document.getElementById('external-showcase-container');

            listContainer.innerHTML = '';

            let exibidos = 0;

            listIds.forEach(id => {

                const imo = imoveis.find(i => i.id === id);

                if (imo) {

                    exibidos++;

                    let slideFotos = '';

                    if (imo.fotos && imo.fotos.length > 0) {

                        slideFotos = '<div class="flex gap-2 overflow-x-auto py-2">';

                        imo.fotos.forEach((foto, idx) => {

                            slideFotos += `<img src="${foto}" onclick="abrirLightboxVitrineImovel('${imo.id}', ${idx})" class="w-48 h-32 object-cover rounded-xl border border-emerald-700 flex-none cursor-pointer active:scale-95 transition">`;

                        });

                        slideFotos += '</div>';

                    }

                    const badgeEnergia = imo.energiaRumo === 'Sim'

                        ? `<div class="mt-2 bg-yellow-900/40 border border-yellow-700 rounded-lg p-2 text-[11px] text-yellow-200"><svg data-lucide="zap" style="width:12px;height:12px;display:inline;vertical-align:-1px"></svg> <strong>Energia disponível</strong> — desconto na conta de energia.</div>`

                        : '';

                    listContainer.innerHTML += `

                        <div class="bg-emerald-950 p-4 rounded-2xl border border-emerald-800">

                            <span class="bg-emerald-900 text-emerald-100 text-[11px] font-bold px-2 py-0.5 rounded">${imo.tipo}</span>

                            <h3 class="text-base font-bold mt-2">${imo.empreendimento}</h3>

                            <p class="text-xs text-slate-400">📍 ${imo.enderecoRua || ''}, ${imo.enderecoNum || ''}${imo.enderecoComp ? ' - ' + imo.enderecoComp : ''}, ${imo.enderecoBairro || ''}, ${imo.enderecoCidade || ''}</p>

                            <p class="text-[11px] text-slate-500 mt-1">Tamanho: ${imo.tamanho}m²</p>

                            <p class="text-[11px] text-slate-500">Condomínio: R$ ${imo.condominio} | IPTU: R$ ${imo.iptu}</p>

                            ${imo.descricao ? `<p class="text-[11px] text-slate-300 mt-2 italic">${imo.descricao}</p>` : ''}

                            ${badgeEnergia}

                            ${slideFotos}

                            <div class="mt-3 pt-3 border-t border-emerald-900 flex justify-between items-baseline">

                                <span class="text-[11px] text-slate-400">Locação Integral</span>

                                <span class="text-lg font-black text-emerald-400">R$ ${imo.valor.toLocaleString('pt-BR')}/mês</span>

                            </div>

                        </div>

                    `;

                }

            });

            if (exibidos === 0) {

                listContainer.innerHTML = '<p class="text-xs text-center text-red-400 py-12">Nenhum imóvel disponível para exibição direta.</p>';

            }

        }

        let lightboxVitrineFotos = [];

        let lightboxVitrineIndex = 0;

        export function abrirLightboxVitrineImovel(imovelId, indiceInicial) {

            const imo = imoveis.find(i => i.id === imovelId);

            if (!imo || !imo.fotos) return;

            abrirLightboxVitrine(imo.fotos, indiceInicial);

        }

        export function abrirLightboxVitrine(fotos, indiceInicial) {

            lightboxVitrineFotos = fotos;

            lightboxVitrineIndex = indiceInicial;

            atualizarLightboxVitrine();

            document.getElementById('lightbox-vitrine').classList.remove('hidden');

        }

        export function fecharLightboxVitrine() {

            document.getElementById('lightbox-vitrine').classList.add('hidden');

        }

        // v7.4.0 — Botão "Sair" na vitrine pública. window.close() só funciona
        // se a aba foi aberta via script; em links visitados diretamente
        // (o caso mais comum aqui), o navegador bloqueia por segurança — por
        // isso mostramos uma tela de despedida como plano B.
        export function sairDaVitrinePublica() {

            window.close();

            setTimeout(function () {

                document.body.innerHTML = `

                    <div class="max-w-md mx-auto p-4 min-h-screen bg-emerald-900 text-white flex items-center justify-center text-center">

                        <div>

                            <h1 class="text-2xl font-black text-emerald-400 mb-2">${CONFIG_CLIENTE.nomeEmpresa}</h1>

                            <p class="text-sm text-slate-300">Você já pode fechar esta aba.</p>

                        </div>

                    </div>

                `;

            }, 150);

        }

        export function navegarLightboxVitrine(direcao) {

            lightboxVitrineIndex = (lightboxVitrineIndex + direcao + lightboxVitrineFotos.length) % lightboxVitrineFotos.length;

            atualizarLightboxVitrine();

        }

        export function atualizarLightboxVitrine() {

            document.getElementById('lightbox-vitrine-img').src = lightboxVitrineFotos[lightboxVitrineIndex];

            document.getElementById('lightbox-vitrine-contador').innerText = `${lightboxVitrineIndex + 1} / ${lightboxVitrineFotos.length}`;

        }
