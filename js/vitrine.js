// ============================================================================
// vitrine.js — Raiz Patrimônio · Compartilhar imóveis (links públicos de imóveis, lightbox)
//               e contratação pública (formulário do interessado via link)
// Versão: 1.5.0 · 09/10/2026
//
// v1.5.0 (UX F2.3a, demanda fcd3008d, sessão 20261003-1707-ux-base; "Estou de acordo com f2.3 e opcao a" do Nicola 09/10 20:52) —
// busca de "Compartilhar imóveis" em Sheet (abrirBuscaVitrine): texto ao vivo (nome, tipo, empreendimento,
// endereço) e chips de Situação e Empreendimento, com "Ver n imóveis"; o popup de filtro saiu.
//
// Versão anterior: 1.4.1 · 08/10/2026
//
// v1.4.1 (correções do teste da F2.8, Nicola 08/10 20:39; demanda ed5accfe, sessão 20261003-1707-ux-base) — página
// pública no tema claro do app (fundo --paper, cards brancos, nome da empresa em --pine) com "Fechar" no padrão de
// botão-ícone (era um "Sair" escuro mal formatado); a tela "Compartilhar imóveis" relê os imóveis ao abrir — o imóvel
// recém-cadastrado só aparecia depois de sair e entrar no app.
//
// Versão anterior: 1.4.0 · 08/10/2026
//
// v1.4.0 (UX F2.8, demandas ed5accfe, 5a84b9aa, b056f2ff e cf0f8f2e, sessão 20261003-1707-ux-base; "Sim. Faça 1 e 2
// agora" do Nicola 08/10 20:09) — "Vitrine" vira "Compartilhar". Um imóvel: compartilharImovelDoAtivo abre o
// WhatsApp já com os dados e o link (⋮ da ficha do ativo). Vários: a tela vira lista com seleção e o botão
// "Compartilhar n imóveis" (WhatsApp, Copiar link, Abrir a página), com um link só. Mensagem e lista mostram só o
// que está preenchido (some ", , ," e "R$ 0"). O link é gerado com código aleatório forte e salvo uma vez; o falso
// "Falha de conexão" (chamava dev_carregarLinks, removida na v1.199.0 do index) sai. Página pública: lê pela
// fn_vitrine_publica_obter (visitante sem login), mostra o nome da empresa e esconde campo vazio. Contratação:
// reaproveita o link pendente e válido do mesmo imóvel em vez de criar outro a cada toque; o formulário público
// manda o endereço também separado (rua, número, complemento, bairro, cidade, UF, CEP).
//
// Versão anterior: 1.3.5 · 07/10/2026
//
// v1.3.4 (07/10/2026, sessão 20261007-1721-rolo-changelog, demanda 2507d554 — VER-06, "de acordo" do Nicola 07/10 17:21) — SÓ
// CABEÇALHO: as versões além das 5 mais recentes rolaram para o CHANGELOG_MODULOS.md.
// Nenhuma linha de código mudou — conferido token a token contra o publicado.
//
// Versão anterior: 1.3.3 · 04/10/2026
//
// v1.3.3 (F0.2b do PLANO_UX, demanda 9e4aca28, sessão 20261003-1707-ux-base; UXR-29/30) — zero diálogo nativo: os alert() viram rzAvisar/rzResumo.
// --------------------------------------------------------------------------
// Versões anteriores (v1.3.2 … v1.3.2): CHANGELOG_MODULOS.md, na raiz do repositório — o
// gerar_versoes.py rola pra lá automaticamente tudo além das 5 versões
// mais recentes deste cabeçalho (VER-06).
import { encontrarMinutaParaImovel } from './minutas.js'; // retorno usado de forma síncrona — import, não ponte

export const VERSAO = '1.5.0'; // v-check: manter igual ao header

/** Ponto de entrada do switchTab('tab-vitrine'). */
export async function montarAbaVitrine() {
    renderVitrine();
    if (typeof lucide !== 'undefined') lucide.createIcons();
    // Relê do banco ao abrir: o imóvel cadastrado agora no Cofre ainda não está na lista em memória.
    try {
        imoveis = await carregarImoveisSupabase();
        if (document.getElementById('tab-vitrine') && !document.getElementById('tab-vitrine').classList.contains('hidden')) renderVitrine();
    } catch (err) { console.warn('[compartilhar] não consegui reler os imóveis:', err.message); }
}

        // v1.47.0 — overlay de busca da Vitrine (mesmo padrão do de Imóveis
        // acima, IDs próprios: vitrine-filtro-emp/status, que já existiam
        // como <select> visíveis num card fixo — só migraram de lugar).
        // Busca de Compartilhar imóveis em Sheet (F2.3). Campos guardadores em #vitrine-filtros-estado (index).
        let ultimaContagemVitrine = 0;
        const campoVit = (id) => document.getElementById(id);
        function atualizarRotuloBuscaVitrine() {
            if (typeof rzRotuloBusca !== 'function') return;
            const n = ['vitrine-filtro-status', 'vitrine-filtro-emp'].filter(id => (campoVit(id)?.value || 'todos') !== 'todos').length;
            rzRotuloBusca('vitrine-busca-btn', 'Buscar imóvel para compartilhar', campoVit('vitrine-filtro-texto')?.value || '', n);
        }
        export function abrirBuscaVitrine() {
            if (typeof rzAbrirBuscaTela !== 'function') return;
            popularFiltroSelect('vitrine-filtro-emp', imoveis.map(i => i.empreendimento));
            const opcoes = (id) => Array.from(campoVit(id)?.options || []).map(o => ({ valor: o.value, rotulo: o.value === 'todos' ? 'Todos' : o.textContent.trim() }));
            const grupo = (titulo, id) => ({ titulo, opcoes: opcoes(id), valor: () => campoVit(id)?.value || 'todos', aoEscolher: (v) => { campoVit(id).value = v; renderVitrine(); } });
            const grupos = [grupo('Situação', 'vitrine-filtro-status')];
            if (opcoes('vitrine-filtro-emp').length > 2) grupos.push(grupo('Empreendimento', 'vitrine-filtro-emp'));
            rzAbrirBuscaTela({
                titulo: 'Buscar imóveis', placeholder: 'Nome, tipo, empreendimento ou endereço',
                termo: () => campoVit('vitrine-filtro-texto')?.value || '',
                aoTermo: (v) => { campoVit('vitrine-filtro-texto').value = v; renderVitrine(); },
                grupos, contar: () => ultimaContagemVitrine, nomes: ['imóvel', 'imóveis'],
                aoLimpar: () => { campoVit('vitrine-filtro-texto').value = ''; campoVit('vitrine-filtro-status').value = 'todos'; campoVit('vitrine-filtro-emp').value = 'todos'; renderVitrine(); },
            });
        }

        export function fecharBuscaVitrine() { if (typeof fecharSheet === 'function') fecharSheet(); }

        // ---- Compartilhar imóveis: texto, link e tela de seleção ------------------------------
        const escV = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
        const moedaV = (v) => Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

        // Nome do imóvel para lista e mensagem: o nome do ativo; sem ele, tipo · empreendimento.
        export function tituloImovelCompartilhar(imo) {
            return (imo && imo.nomeExibicao) || [imo?.tipo, imo?.empreendimento].filter(Boolean).join(' · ') || 'Imóvel';
        }

        // Endereço só com as partes preenchidas ("Rua X, 301 - Apto 2, Bairro, Cidade").
        export function enderecoCurtoImovel(imo) {
            if (!imo) return '';
            const rua = [imo.enderecoRua, imo.enderecoNum].filter(Boolean).join(', ');
            const ruaComp = rua && imo.enderecoComp ? rua + ' - ' + imo.enderecoComp : rua;
            return [ruaComp, imo.enderecoBairro, imo.enderecoCidade].filter(Boolean).join(', ');
        }

        function resumoImovelTexto(imo) {
            const linhas = ['🏠 *' + tituloImovelCompartilhar(imo) + '*'];
            const end = enderecoCurtoImovel(imo);
            if (end) linhas.push('📍 ' + end);
            if (Number(imo.tamanho) > 0) linhas.push('📐 ' + moedaV(imo.tamanho) + ' m²');
            if (Number(imo.valor) > 0) linhas.push('💰 Aluguel: R$ ' + moedaV(imo.valor) + '/mês');
            if (Number(imo.condominio) > 0) linhas.push('🏢 Condomínio: R$ ' + moedaV(imo.condominio));
            return linhas.join('\n');
        }

        export function textoCompartilharImoveis(lista, link) {
            const empresa = (typeof CONFIG_CLIENTE !== 'undefined' && CONFIG_CLIENTE && CONFIG_CLIENTE.nomeEmpresa) || '';
            const n = lista.length;
            const intro = n === 1
                ? (empresa ? '*' + empresa + '* separou este imóvel para você:' : 'Separei este imóvel para você:')
                : (empresa ? '*' + empresa + '* separou ' + n + ' imóveis para você:' : 'Separei ' + n + ' imóveis para você:');
            return [intro, '', lista.map(resumoImovelTexto).join('\n\n'), '', 'Fotos e detalhes: ' + link].join('\n');
        }

        // Código do link: 8 caracteres de um alfabeto sem letras parecidas, sorteados com crypto.
        function novoCodigoLink() {
            const alfa = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
            const bytes = new Uint8Array(8);
            (window.crypto || window.msCrypto).getRandomValues(bytes);
            return Array.from(bytes, b => alfa[b % alfa.length]).join('');
        }

        // Um compartilhamento = um código, salvo uma vez só, mesmo que a pessoa toque em WhatsApp e
        // depois em Copiar. O WhatsApp e a cópia saem no mesmo toque (o navegador bloqueia abrir
        // janela ou copiar depois de uma espera); a gravação corre junto.
        function prepararCompartilhamento(ids) {
            const token = novoCodigoLink();
            const url = window.location.href.split('?')[0].split('#')[0] + '?v=' + token;
            let salvo = null;
            const salvar = () => {
                if (!salvo) {
                    salvo = criarLinkVitrineSupabase(token, ids).then(() => {
                        if (Array.isArray(links)) links.push({ token, ids: ids.join(','), criadoEm: new Date().toISOString(), criadoEmBrasilia: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }), qtdImoveis: ids.length });
                        if (typeof carregarLinksVitrine === 'function' && document.querySelector('.tab-content.active')?.id === 'tab-links-vitrine') carregarLinksVitrine();
                        try { registrarLog('vitrine.gerar', { token, qtdImoveis: ids.length }); } catch (_) { /* log não bloqueia */ }
                        return true;
                    }).catch((err) => {
                        console.error('[compartilhar] link não salvo:', err);
                        salvo = null;
                        mostrarToast('Não consegui salvar o link. Confira a internet e tente de novo.', 'danger');
                        return false;
                    });
                }
                return salvo;
            };
            return { token, url, salvar };
        }

        function imoveisPorIds(ids) {
            return ids.map(id => (Array.isArray(imoveis) ? imoveis.find(i => i.id === id) : null)).filter(Boolean);
        }

        function enviarWhatsAppCompartilhar(lista, comp) {
            const texto = textoCompartilharImoveis(lista, comp.url);
            if (typeof rzDev === 'function') rzDev('whatsapp', '', texto);
            else window.open('https://wa.me/?text=' + encodeURIComponent(texto), '_blank', 'noopener');
            comp.salvar();
        }

        // ⋮ da ficha do ativo (cofre-ativos) e ⋮ de uma linha da lista: abre o WhatsApp já com
        // os dados e o link deste imóvel.
        export function compartilharImovelDoAtivo(ativoId) {
            const lista = imoveisPorIds([String(ativoId)]);
            if (!lista.length) { mostrarToast('Não encontrei este imóvel. Atualize a tela e tente de novo.', 'danger'); return; }
            enviarWhatsAppCompartilhar(lista, prepararCompartilhamento([String(ativoId)]));
        }

        // Sheet de "Compartilhar n imóveis": um link só para todos os escolhidos.
        export function abrirCompartilharSelecionados(idsEscolhidos) {
            const ids = (idsEscolhidos || Array.from(vitSelecionados)).map(String);
            const lista = imoveisPorIds(ids);
            if (!lista.length) { mostrarToast('Escolha ao menos um imóvel.', 'danger'); return; }
            const comp = prepararCompartilhamento(lista.map(i => i.id));
            const n = lista.length;
            abrirSheetAcoes({
                titulo: n === 1 ? 'Compartilhar 1 imóvel' : 'Compartilhar ' + n + ' imóveis',
                sub: 'Um link só, com fotos e detalhes',
                acoes: [
                    { icone: 'message-circle', titulo: 'Enviar pelo WhatsApp', sub: 'Mensagem com o resumo e o link', codigo: 'vitrine.gerar', aoTocar: () => enviarWhatsAppCompartilhar(lista, comp) },
                    { icone: 'copy', titulo: 'Copiar link', codigo: 'vitrine.gerar', aoTocar: () => {
                        comp.salvar();
                        if (typeof rzCopiar === 'function') rzCopiar(comp.url, 'Link copiado.', 'Não consegui copiar; use "Abrir a página".');
                        else navigator.clipboard.writeText(comp.url).then(() => mostrarToast('Link copiado.', 'success'));
                    } },
                    { icone: 'external-link', titulo: 'Abrir a página', sub: 'Veja como o interessado recebe', codigo: 'vitrine.gerar', aoTocar: () => {
                        const janela = window.open('', '_blank');
                        comp.salvar().then(ok => { if (ok && janela) janela.location.href = comp.url; else if (janela) janela.close(); });
                    } },
                ],
            });
        }

        // Compatibilidade: chamadas antigas (botão da tela, cofre-ativos antigo).
        export function copyResumo() { abrirCompartilharSelecionados(); }

        // Seleção da tela "Compartilhar imóveis" (vale enquanto o app está aberto).
        const vitSelecionados = new Set();

        export function alternarSelecaoVitrine(id) {
            if (vitSelecionados.has(id)) vitSelecionados.delete(id); else vitSelecionados.add(id);
            const linha = document.querySelector('[data-vit-id="' + CSS.escape(id) + '"]');
            if (linha) desenharSelecaoLinha(linha, vitSelecionados.has(id));
            atualizarBarraCompartilhar();
        }

        function desenharSelecaoLinha(linha, marcada) {
            linha.setAttribute('aria-checked', marcada ? 'true' : 'false');
            const ic = linha.querySelector('.rz-ic');
            if (ic) {
                ic.classList.toggle('rz-ok', marcada);
                ic.innerHTML = '<svg data-lucide="' + (marcada ? 'check' : 'house') + '"></svg>';
                if (typeof rzIcones === 'function') rzIcones(); else if (typeof lucide !== 'undefined') lucide.createIcons();
            }
        }

        function atualizarBarraCompartilhar() {
            const btn = document.getElementById('vit-compartilhar');
            if (!btn) return;
            const visiveis = new Set(Array.from(document.querySelectorAll('#lista-vitrine [data-vit-id]')).map(el => el.getAttribute('data-vit-id')));
            for (const id of Array.from(vitSelecionados)) if (!visiveis.has(id)) vitSelecionados.delete(id);
            const n = vitSelecionados.size;
            btn.disabled = n === 0;
            btn.textContent = n === 0 ? 'Escolha os imóveis' : (n === 1 ? 'Compartilhar 1 imóvel' : 'Compartilhar ' + n + ' imóveis');
        }

        function abrirAcoesLinhaVitrine(id) {
            const imo = imoveisPorIds([id])[0];
            if (!imo) return;
            abrirSheetAcoes({
                titulo: tituloImovelCompartilhar(imo), sub: enderecoCurtoImovel(imo) || imo.status || '',
                acoes: [
                    { icone: 'message-circle', titulo: 'Compartilhar só este', sub: 'Abre o WhatsApp com os dados e o link', codigo: 'vitrine.gerar', aoTocar: () => compartilharImovelDoAtivo(id) },
                    { icone: 'house', titulo: 'Abrir a ficha', aoTocar: () => { window.location.hash = '#/ativo/' + id; } },
                ],
            });
        }

        export function renderVitrine() {
            const container = document.getElementById('lista-vitrine');
            if (!container) return;

            popularFiltroSelect('vitrine-filtro-emp', imoveis.map(i => i.empreendimento));
            const fEmp = document.getElementById('vitrine-filtro-emp').value;
            const fStat = document.getElementById('vitrine-filtro-status').value;

            const normV = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
            const fTexto = normV(campoVit('vitrine-filtro-texto')?.value).trim();
            const lista = imoveis.filter(imo => (fEmp === 'todos' || imo.empreendimento === fEmp) && (fStat === 'todos' || imo.status === fStat)
                && (!fTexto || normV([tituloImovelCompartilhar(imo), imo.tipo, imo.empreendimento, enderecoCurtoImovel(imo)].join(' ')).includes(fTexto)));
            ultimaContagemVitrine = lista.length;
            atualizarRotuloBuscaVitrine();

            if (!lista.length) {
                container.className = '';
                container.innerHTML = imoveis.length
                    ? '<div class="rz-card"><div class="rz-empty"><p>Nenhum imóvel neste filtro.</p></div></div>'
                    : (typeof rzVazio === 'function'
                        ? rzVazio({ dominio: 'ativos', id: 'compartilhar-sem-imovel', titulo: 'Nada para compartilhar ainda', beneficio: 'Cadastre um imóvel e mande para interessados um link com fotos e detalhes, pelo WhatsApp.', acaoManual: { rotulo: 'Cadastrar imóvel', codigo: 'cofre.ativos.criar', aoTocar: () => { if (typeof rzAbrirMaisAtivos === 'function') rzAbrirMaisAtivos(); } } })
                        : '<div class="rz-empty"><p>Nenhum imóvel cadastrado.</p></div>');
                atualizarBarraCompartilhar();
                if (typeof rzIcones === 'function') rzIcones();
                return;
            }

            container.className = 'rz-card rz-list';
            container.innerHTML = lista.map(imo => {
                const marcada = vitSelecionados.has(imo.id);
                const sub = [imo.status, enderecoCurtoImovel(imo), Number(imo.valor) > 0 ? 'R$ ' + moedaV(imo.valor) + '/mês' : ''].filter(Boolean).join(' · ');
                return `<div class="rz-row rz-link" role="checkbox" tabindex="0" aria-checked="${marcada}" data-vit-id="${escV(imo.id)}">
                    <div class="rz-ic${marcada ? ' rz-ok' : ''}"><svg data-lucide="${marcada ? 'check' : 'house'}"></svg></div>
                    <div class="rz-tx"><b>${escV(tituloImovelCompartilhar(imo))}</b>${sub ? `<span>${escV(sub)}</span>` : ''}</div>
                    <button type="button" class="rz-more" data-vit-acoes="${escV(imo.id)}" aria-label="Ações do imóvel"><svg data-lucide="ellipsis-vertical"></svg></button>
                </div>`;
            }).join('');

            container.querySelectorAll('[data-vit-id]').forEach(linha => {
                const id = linha.getAttribute('data-vit-id');
                linha.addEventListener('click', (ev) => { if (ev.target.closest('[data-vit-acoes]')) return; alternarSelecaoVitrine(id); });
                linha.addEventListener('keydown', (ev) => { if (ev.key === ' ' || ev.key === 'Enter') { ev.preventDefault(); alternarSelecaoVitrine(id); } });
            });
            container.querySelectorAll('[data-vit-acoes]').forEach(b => b.addEventListener('click', (ev) => { ev.stopPropagation(); abrirAcoesLinhaVitrine(b.getAttribute('data-vit-acoes')); }));
            atualizarBarraCompartilhar();
            if (typeof rzIcones === 'function') rzIcones(); else if (typeof lucide !== 'undefined') lucide.createIcons();
        }

        export async function iniciarProcessoContratacao(imovelId) {

            let imo = imoveis.find(i => i.id === imovelId);

            // v1.2.1 (demanda 303e68dc) — recarrega 1x do Supabase antes de
            // desistir (mesmo padrão de contratos.js, criarContratoParaImovel).
            if (!imo) {
                try {
                    imoveis = await carregarImoveisSupabase();
                } catch (err) {
                    console.warn('[vitrine] falha ao recarregar imóveis:', err);
                }
                imo = imoveis.find(i => i.id === imovelId);
            }

            if (!imo) {
                mostrarToast('Não encontrei este imóvel — atualize a página e tente de novo.', 'danger');
                return;
            }

            // Uso do Imóvel (revisão DS, 25/08/2026) — pedido explícito:
            // imóvel de uso pessoal nunca pode ter contrato de aluguel.
            // Guarda única aqui (função-fonte) cobre todos os pontos de
            // entrada: pill "Locação" da Ficha (montarBoxSemContratoFicha),
            // reabertura de processo "Assinando", e a Vitrine pública.
            if (imo.finalidadeUso === 'uso_proprio') {
                rzResumo({ titulo: 'Imóvel de uso pessoal', linhas: ['Este imóvel está marcado como "Uso Pessoal" e não pode ter contrato de aluguel.', 'Se isso mudou, altere o "Uso do imóvel" no cadastro antes de continuar.'] });
                return;
            }

            mostrarCarregamentoGlobal("Preparando processo de contratação...");

            try {
                // Link pendente e ainda válido do mesmo imóvel: reaproveita, em vez de abrir outro a cada toque. (dem b056f2ff)
                const { data: pendentes } = await dbAuth.from('processos_contratacao').select('id, token')
                    .eq('cliente_id', CLIENTE_ID_SUPABASE).eq('ativo_id', imovelId).eq('status', 'aguardando_preenchimento')
                    .gt('expira_em', new Date().toISOString()).order('criado_em', { ascending: false }).limit(1);
                if (pendentes && pendentes.length) {
                    esconderCarregamentoGlobal();
                    abrirModalOpcoesContratacao(imo, pendentes[0].token, pendentes[0].id);
                    return;
                }

                const token = (crypto.randomUUID ? crypto.randomUUID() : (Date.now() + '-' + Math.random().toString(36).slice(2))).replace(/-/g, '');

                // v1.41.0 (16/09/2026, pendência 46dc7300) — ativo_id no
                // lugar de imovel_id: `imovelId` aqui é sempre
                // cofre_ativos.id (o array `imoveis` usa esse espaço de id
                // desde o único caminho de escrita da Onda 12), e
                // processos_contratacao.imovel_id tem FK real pra
                // imoveis.id — gravar o id do ativo ali quebrava (ou
                // quebraria) pra QUALQUER imóvel, legado ou nativo. Coluna
                // ativo_id nova (migration processos_contratacao_ativo_id),
                // testada ponta a ponta antes de entregar (criar processo
                // → fn_processo_publico_obter → fn_processo_publico_
                // preencher → contrato criado com ativo_id certo).
                const linha = {
                    cliente_id: CLIENTE_ID_SUPABASE,
                    ativo_id: imovelId,
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
                rzAvisar('Não consegui iniciar a contratação agora. Tente de novo em instantes; se continuar, fale com o suporte da Raiz.', 'danger'); console.warn('[vitrine] iniciar contratação', err);
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
            const endereco = enderecoCurtoImovel(imo) || tituloImovelCompartilhar(imo);
            const mensagemZap = `Olá! Para darmos andamento à locação do imóvel ${enderecoCurtoImovel(imo) ? 'em ' + endereco : tituloImovelCompartilhar(imo)}, preciso de alguns dados seus para gerar o contrato:\n\n- Nome completo\n- CPF ou CNPJ\n- WhatsApp\n- E-mail\n- Endereço atual\n- Profissão\n- Estado civil\n\nVocê pode preencher direto por este link: ${link}`;
            const minuta = encontrarMinutaParaImovel(imo.id);
            // v1.2.2 — "Dados novo contrato" saiu daqui (ver changelog).
            // v1.3.0 (demanda 11afd25f, teste f26a) — link e WhatsApp de coleta não
            // dependem de minuta (fn_processo_publico_obter/preencher não leem minuta):
            // aparecem sempre. Só as ações de minuta exigem minuta padrão.
            const acoes = [];
            {
                acoes.push(
                    { icone: 'copy', titulo: 'Gerar link para coleta de dados', codigo: 'contratos.criar', sub: 'Vale por 15 dias · interessado preenche sozinho', aoTocar: () => { registrarLog('contratacao.link_gerado', { imovelId: imo.id, processoId }); dbAuth.from('processos_contratacao').update({ origem: 'link' }).eq('id', processoId); if (typeof rzCopiar === 'function') rzCopiar(link, 'Link copiado.'); else { navigator.clipboard.writeText(link); mostrarToast('Link copiado.', 'success'); } } },
                    { icone: 'message-circle', titulo: 'Abrir WhatsApp com os dados pedidos', codigo: 'contratos.criar', aoTocar: () => { registrarLog('contratacao.whatsapp_aberto', { imovelId: imo.id, processoId }); dbAuth.from('processos_contratacao').update({ origem: 'whatsapp_manual' }).eq('id', processoId); window.open('https://api.whatsapp.com/send?text=' + encodeURIComponent(mensagemZap), '_blank'); } },
                );
            }
            if (minuta) {
                acoes.push(
                    { icone: 'download', titulo: 'Conferir minuta padrão', codigo: 'minutas.gerar', aoTocar: () => baixarMinutaPadraoImovel(imo.id) },
                    { icone: 'file-signature', titulo: 'Gerar minuta', codigo: 'minutas.gerar', sub: 'A partir de um contrato Assinando já com os dados', aoTocar: () => gerarMinutaNoCofre(imo.id) }
                );
            }
            abrirSheetAcoes({
                titulo: 'Locação', sub: endereco, acoes,
                grupos: minuta ? null : [
                    { titulo: 'Coleta de dados', acoes: acoes.slice() },
                    { titulo: 'Sem minuta padrão cadastrada', acoes: [
                        { icone: 'file-signature', titulo: 'Cadastrar minuta padrão', codigo: 'minutas.gerar', sub: 'Necessária só pra conferir e gerar a minuta', aoTocar: () => switchTab('tab-minutas') }
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
                    p_estado_civil: document.getElementById('cp-estado-civil').value || null,
                    // Partes do endereço: vão para a Parte do interessado e aparecem separadas no contrato. (dem cf0f8f2e)
                    p_endereco_rua: document.getElementById('cp-endereco-rua').value.trim() || null,
                    p_endereco_num: document.getElementById('cp-endereco-num').value.trim() || null,
                    p_endereco_comp: document.getElementById('cp-endereco-comp').value.trim() || null,
                    p_endereco_bairro: document.getElementById('cp-endereco-bairro').value.trim() || null,
                    p_endereco_cidade: document.getElementById('cp-endereco-cidade').value.trim() || null,
                    p_uf: document.getElementById('cp-endereco-uf').value || null,
                    p_cep: document.getElementById('cp-endereco-cep').value.trim() || null
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
                rzAvisar('Não consegui enviar seus dados agora. Verifique a internet e tente de novo.', 'danger');
                btn.disabled = false;
                btn.innerText = textoOriginalBtn;
            }

        }

        // v1.115.0 (fatia 7) — a geração do link saiu de dentro do handler
        // da tela pra gerarLinkVitrineParaIds(ids), pra ser reaproveitada
        // pelo ⋮ do ativo ("Gerar vitrine", cofre-ativos.js v1.22.0). O
        // resultado deixou de ser confirm()/alert() (3 popups) e virou sheet
        // com Copiar · WhatsApp · Abrir (REGRAS §3) + toast nos erros.
        // Botão da tela e chamadas antigas: levam ao mesmo "Compartilhar" de agora.
        export function gerarLinkVitrine() { abrirCompartilharSelecionados(); }

        export function gerarVitrineDoImovel(imovelId) {
            if (!imovelId) { mostrarToast('Não encontrei este imóvel.', 'danger'); return; }
            compartilharImovelDoAtivo(String(imovelId));
        }

        export function gerarLinkVitrineParaIds(idsSelecionados) { abrirCompartilharSelecionados(idsSelecionados); }

        export async function verificarFiltroVitrineExterna() {

            const urlParams = new URLSearchParams(window.location.search);

            const temAssetsAntigo = urlParams.get('viewShowcase') === 'true' && urlParams.get('assets');

            const temTokenCurto = !!urlParams.get('v');

            if (!temAssetsAntigo && !temTokenCurto) return; // não é um link de vitrine, segue fluxo normal do sistema

            // Mostra imediatamente uma tela de carregamento dedicada da vitrine —

            // nunca deixa o visitante público ver a tela de login do sistema

            // principal, nem por um instante, enquanto o token é resolvido.

            document.body.className = 'rz-pub-body';
            document.body.innerHTML = `
                <div class="rz-pub">
                    <header class="rz-pub-h">
                        <div class="rz-pub-h-tx">
                            <h1 id="vitrine-publica-empresa">Imóveis selecionados</h1>
                            <p id="vitrine-publica-sub">Separados para você</p>
                        </div>
                        <button type="button" class="rz-ico-btn" onclick="sairDaVitrinePublica()" title="Fechar" aria-label="Fechar"><svg data-lucide="x"></svg></button>
                    </header>
                    <div id="external-showcase-container">
                        <p class="rz-pub-msg">Carregando os imóveis…</p>
                    </div>
                </div>
                <div id="lightbox-vitrine" class="hidden fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
                    <button onclick="fecharLightboxVitrine()" class="absolute top-4 right-4 text-white" aria-label="Fechar foto"><svg data-lucide="x" style="width:24px;height:24px"></svg></button>
                    <button onclick="navegarLightboxVitrine(-1)" class="absolute left-2 text-white px-3 py-6" aria-label="Foto anterior"><svg data-lucide="chevron-left" style="width:28px;height:28px"></svg></button>
                    <img id="lightbox-vitrine-img" class="max-h-[85vh] max-w-full rounded-lg object-contain" alt="">
                    <button onclick="navegarLightboxVitrine(1)" class="absolute right-2 text-white px-3 py-6" aria-label="Próxima foto"><svg data-lucide="chevron-right" style="width:28px;height:28px"></svg></button>
                    <p id="lightbox-vitrine-contador" class="absolute bottom-4 text-white text-[13px]"></p>
                </div>
            `;
            if (typeof lucide !== 'undefined') lucide.createIcons();

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
                    const empresaPublica = window.__rzVitrinePublicaEmpresa || '';
                    if (empresaPublica) {
                        document.getElementById('vitrine-publica-empresa').textContent = empresaPublica;
                        document.getElementById('vitrine-publica-sub').textContent = 'Imóveis selecionados para você';
                        document.title = empresaPublica + ' · Imóveis';
                    }

                } catch (e) {

                    document.getElementById('external-showcase-container').innerHTML =
                        `<p class="rz-pub-msg">Este link não abre mais: ele foi revogado, expirou ou está incompleto. Peça um novo a quem te enviou.</p>`;
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
                        slideFotos = '<div class="rz-pub-fotos">' + imo.fotos.map((foto, idx) =>
                            `<img src="${escV(foto)}" alt="Foto ${idx + 1} de ${escV(tituloImovelCompartilhar(imo))}" onclick="abrirLightboxVitrineImovel('${escV(imo.id)}', ${idx})">`).join('') + '</div>';
                    }
                    const badgeEnergia = imo.energiaRumo === 'Sim'
                        ? `<p class="rz-pub-info"><svg data-lucide="zap"></svg>Energia disponível: desconto na conta de energia</p>`
                        : '';

                    const endPub = enderecoCurtoImovel(imo);
                    const tituloPub = tituloImovelCompartilhar(imo);
                    const subPub = imo.nomeExibicao ? [imo.tipo, imo.empreendimento].filter(Boolean).join(' · ') : '';
                    listContainer.innerHTML += `
                        <article class="rz-card rz-pub-card">
                            ${subPub ? `<span class="rz-tag">${escV(subPub)}</span>` : ''}
                            <h2>${escV(tituloPub)}</h2>
                            ${endPub ? `<p class="rz-pub-end"><svg data-lucide="map-pin"></svg>${escV(endPub)}</p>` : ''}
                            ${Number(imo.tamanho) > 0 ? `<p class="rz-pub-info">${moedaV(imo.tamanho)} m²</p>` : ''}
                            ${imo.descricao ? `<p class="rz-pub-desc">${escV(imo.descricao)}</p>` : ''}
                            ${badgeEnergia}
                            ${slideFotos}
                            <div class="rz-pub-valor"><span>Aluguel</span><b>${Number(imo.valor) > 0 ? 'R$ ' + moedaV(imo.valor) + '/mês' : 'Sob consulta'}</b></div>
                        </article>
                    `;

                }

            });

            if (exibidos === 0) {
                listContainer.innerHTML = '<p class="rz-pub-msg">Os imóveis deste link não estão mais disponíveis.</p>';
            }
            if (typeof lucide !== 'undefined') lucide.createIcons();

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

                document.body.className = 'rz-pub-body';
                document.body.innerHTML = `<div class="rz-pub rz-pub-fim"><h1>${escV(window.__rzVitrinePublicaEmpresa || 'Até logo')}</h1><p>Você já pode fechar esta aba.</p></div>`;

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
