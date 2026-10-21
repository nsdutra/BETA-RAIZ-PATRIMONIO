// ============================================================================
// conta.js — Raiz Patrimônio · Conta e preferências: menu da conta, seção Sobre,
//            licença, preferências de comunicação e de alerta, atalhos de
//            configuração (Cofre, configuração inicial, cadastro do contador)
// Versão: 1.5.0 · 21/10/2026
//
// v1.5.0 (21/10/2026, sessão 20261021-1005-ux-onda1, demanda 15146a34; Nicola 21/10 10:02) — menu das iniciais: sai o ✕ (fecha arrastando ou tocando fora) e
//   o cartão verde ganha a largura toda; o plano aparece pelo nome ("Premium ampliado", não "Premium_ampliado").
// Versão anterior: 1.4.0 · 21/10/2026
//
// v1.4.0 (21/10/2026, sessão 20261021-0905-ux-ramo-menu, demanda 15146a34; de acordo do Nicola 21/10 09:01, protótipo
//   PROTOTIPO_REVISAO_USABILIDADE_RAIZ v1.4.0 seção 9) — menu das iniciais: cabeçalho verde com as iniciais, nome, empresa e
//   perfil, e o Trocar ali (sai o item "Trocar empresa"); itens sem descrição, com o valor à direita só quando ele informa
//   (plano, versão); placas de ícone neutras; Sair em cartão próprio no fim. Estilo no raiz.css 1.1.0.
// Versão anterior: 1.3.0 · 19/10/2026
//
// v1.3.0 (19/10/2026, sessão 20261018-2344-temas, demanda 91a30125; FICHA_ROTINAS_E_ALERTAS_POR_TEMA_RAIZ v1.0.0, de acordo do Nicola 18/10 23:44) — Minhas notificações: avisos agrupados por tema; o que está desligado na empresa aparece
// apagado (quem liga é o administrador em Minha empresa › Rotinas); a frequência só no convite diário.
// Versão anterior: 1.2.0 · 14/10/2026
//
// v1.2.0 (14/10/2026, sessão 20261014-2215-ajustes-9d, demanda a05ad2ee; Nicola 14/10 22:12: "ao sair da tela do contador
// apareceu a tela estranha") — abrirCadastroContador abre o formulário de contador como sheet por cima da tela atual, sem
// trocar para Partes: fechar ou salvar volta para onde a pessoa estava (Financeiro, Fiscal).
// Versão anterior: 1.1.0 · 14/10/2026
//
// v1.1.0 (14/10/2026, sessão 20261014-2145-onda9c-textos, demanda a05ad2ee; onda 9c do estudo PROTOTIPO_UX_DENSIDADE_RAMOS_RAIZ
// v1.2.0, D6 seção 10) — textos no limite: ação até 24 caracteres, descrição até 28, aviso até 40 com o resultado e tela
// vazia em 1 frase de até 40. A explicação longa fica na confirmação, quando existe. Nada de comportamento mudou.
// --------------------------------------------------------------------------
// Versões anteriores (v1.0.1 … v1.0.1): CHANGELOG_MODULOS.md, na raiz do repositório — o
// gerar_versoes.py rola pra lá automaticamente tudo além das 5 versões
// mais recentes deste cabeçalho (VER-06).
export const VERSAO = '1.5.0';  // v-check: lido por ⚙️ › Conta › Versões — manter igual ao header

// v1.71.0 — LGPD: tela de preferências de comunicação, 1 toggle por
// mensagem que permite opt-out (permite_opt_out=true) — substitui o
// toggle único "Comunicações comerciais" da v1.70.x. Mensagens
// obrigatórias (Termos de Uso, Política de Privacidade, Termo de
// Beta) não aparecem aqui — não fazem parte da lista retornada por
// fn_minhas_comunicacoes_opt_out() (permite_opt_out=false pra elas).
// Modal criado dinamicamente (mesmo padrão do overlay da Central de
// Comunicações) — não precisa de wrapper estático no HTML.
// v1.180.2 (13/09/2026) — MOTOR CENTRAL DE ALERTAS, Fase 5 (item 11 da
// §11 do Motor doc): "Minhas notificações" unifica duas coisas que
// viviam separadas — as preferências de ALERTA (antes só dentro do
// card da própria pessoa, na tela de Pessoas — a pessoa logada tinha
// que se achar na lista pra mexer nas próprias preferências) e as
// COMUNICAÇÕES DA RAIZ (esta tela já existia, "Preferências de
// comunicação" — o texto dela já dizia "avisos sobre contratos e
// imóveis não entram aqui", confirmando que sempre foi só a metade
// comercial). Renomeado o item do menu de "Preferências de
// comunicação" pra "Minhas notificações" (mesmo lugar, grupo Conta).
// Reaproveita buscarProativasDisponiveis/buscarPreferenciasComunicacao
// de comum-pessoas.js (mesma consulta que a tela de Pessoas já faz —
// v1.6.0, exportadas pra isso) em vez de reimplementar; grava com o
// MESMO upsert em pessoa_preferencias_comunicacao, só que pra
// pessoaIdLogada em vez de uma pessoa escolhida na lista.
// ATUALIZAÇÃO (v1.200.0) — a função comunicacaoProativaHtml() citada
// abaixo (card inline de Pessoas) foi removida na reescrita total de
// comum-pessoas.js (v2.0.0): um admin editar as preferências de
// OUTRA pessoa agora vive em abrirComunicacoesPessoaSheet(), aberto
// pelo ⋮ de cada pessoa (Sheet de formulário) — não desapareceu,
// só mudou de superfície. Esta tela ("Minhas notificações")
// continua sendo sobre "eu mesmo" e não muda.
// Minhas notificações: sheet único (era um overlay próprio com z-index fora da tabela).
// Cada interruptor grava na hora; o estado vive em aria-checked. (dem b8602a3a)
export async function abrirPreferenciasComunicacao() {
    abrirSheet(rzSheetCabecalho('Minhas notificações', 'O que você recebe automaticamente da Raiz') + `<div class="rz-sh-b">
        <div class="rz-card">
            <div class="rz-card-h"><h3>Alertas e avisos automáticos</h3></div>
            <p class="rz-desc">Vale para o app e o WhatsApp.</p>
            <div id="lista-preferencias-alertas">${typeof rzSkeletonSeguro === 'function' ? rzSkeletonSeguro('linhas', 2) : ''}</div>
        </div>
        <div class="rz-card">
            <div class="rz-card-h"><h3>Comunicações da Raiz</h3></div>
            <div id="lista-preferencias-comunicacao">${typeof rzSkeletonSeguro === 'function' ? rzSkeletonSeguro('linhas', 2) : ''}</div>
        </div>
    </div>`);

    // Seção 1 — alertas (reaproveita comum-pessoas.js; pessoaIdLogada,
    // não uma pessoa escolhida numa lista — esta tela é sempre sobre
    // "eu mesmo").
    try {
        const { buscarProativasDisponiveis, buscarPreferenciasComunicacao, FREQUENCIA_OPCOES, htmlAvisosPorTema } = await import('./comum-pessoas.js');
        const [proativas, preferenciasMap] = await Promise.all([
            buscarProativasDisponiveis(dbAuth, CLIENTE_ID_SUPABASE),
            buscarPreferenciasComunicacao(dbAuth, CLIENTE_ID_SUPABASE),
        ]);
        const listaAlertas = document.getElementById('lista-preferencias-alertas');
        if (!proativas.length) {
            listaAlertas.innerHTML = '<p class="rz-desc" style="margin-top:8px">Nenhum aviso no seu plano.</p>';
        } else {
            // v1.201.0 — mesmo padrão visual/comportamental do toggle de
            // "Comunicações da Raiz" logo abaixo: cada aviso salva na
            // hora ao ligar/desligar (ou trocar a frequência), sem
            // botão de salvar em lote (o botão saiu — pedido do
            // Nicola, "já que tera o componente de ligar ou desligar").
            listaAlertas.innerHTML = htmlAvisosPorTema(proativas, f => {
                if (!f.empresaLigada) return `<div class="rz-row rz-pref" style="opacity:.5">
                    <div class="rz-tx"><b>${rzEsc(f.descricao)}</b><span>Desligado na empresa</span></div></div>`; // v1.3.0
                const pref = preferenciasMap.get(`${pessoaIdLogada}|${f.codigo}`);
                const habilitado = pref ? pref.habilitado : true;
                const frequencia = pref ? pref.frequencia : 'semanal';
                const opcoesHtml = FREQUENCIA_OPCOES.map(o => `<option value="${o.valor}" ${frequencia === o.valor ? 'selected' : ''}>${o.rotulo}</option>`).join('');
                return `<div class="rz-row rz-pref${f.temFrequencia ? ' rz-pref-2l' : ''}">
                    <div class="rz-tx"><b>${rzEsc(f.descricao)}</b></div>
                    ${f.temFrequencia ? `<select class="pref-alerta-frequencia" data-codigo="${f.codigo}" aria-label="Frequência" ${habilitado ? '' : 'disabled'}>${opcoesHtml}</select>` : ''}
                    <button type="button" role="switch" class="rz-switch pref-alerta-toggle" data-codigo="${f.codigo}" data-habilitado="${habilitado ? '1' : '0'}"
                        aria-checked="${habilitado ? 'true' : 'false'}" aria-label="${rzEsc(f.descricao)}" onclick="alternarPreferenciaAlerta(this)"></button>
                </div>`;
            });
            listaAlertas.querySelectorAll('.pref-alerta-frequencia').forEach(sel => {
                sel.onchange = () => salvarPreferenciaAlerta(sel.dataset.codigo, listaAlertas.querySelector(`.pref-alerta-toggle[data-codigo="${sel.dataset.codigo}"]`)?.dataset.habilitado === '1', sel.value, sel);
            });
        }
    } catch (err) {
        const elA = document.getElementById('lista-preferencias-alertas');
        if (elA) elA.innerHTML = '<p class="rz-desc" style="margin-top:8px;color:var(--danger)">Não foi possível carregar seus avisos agora.</p>';
        console.warn('[minhas-notificacoes] falha ao carregar alertas:', err.message);
    }

    // Seção 2 — comunicações da Raiz (comportamento intacto, só o
    // container mudou de lugar dentro da mesma folha).
    try {
        const { data, error } = await dbAuth.rpc('fn_minhas_comunicacoes_opt_out', { p_cliente_id: CLIENTE_ID_SUPABASE });
        if (error) throw error;
        const lista = document.getElementById('lista-preferencias-comunicacao');
        if (!data || !data.length) {
            lista.innerHTML = '<p class="rz-desc">Nada a configurar agora.</p>';
            return;
        }
        lista.innerHTML = data.map(item => `
            <div class="rz-row rz-pref">
                <div class="rz-tx"><b>${rzEsc(item.titulo || (item.codigos && item.codigos[0]) || '')}</b></div>
                <button type="button" role="switch" class="rz-switch" data-plano-id="${item.plano_id}" data-ordem="${item.ordem}" data-atual="${item.optou_out ? '1' : '0'}"
                    aria-checked="${item.optou_out ? 'false' : 'true'}" aria-label="${rzEsc(item.titulo || '')}" onclick="alternarPreferenciaComunicacao(this)"></button>
            </div>`).join('');
    } catch (err) {
        const elC = document.getElementById('lista-preferencias-comunicacao');
        if (elC) elC.innerHTML = '<p class="rz-desc" style="color:var(--danger)">Não foi possível carregar suas preferências agora.</p>';
        console.warn('[preferencias-comunicacao] falha ao carregar:', err.message);
    }
}

// Nome como gente escreve ("NICOLA SANTOS DUTRA" → "Nicola Santos Dutra"); conectivos ficam minúsculos.
function rzNomeLegivel(t) {
    const s = String(t || '').trim();
    if (!s || s !== s.toUpperCase()) return s;
    return s.toLowerCase().split(/\s+/).map((p, i) => (i && /^(da|de|do|das|dos|e)$/.test(p)) ? p : p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
}

// Menu das iniciais (UXR-09, dem 15146a34): 4 grupos em cartões, valor à direita no lugar da descrição, Sair à parte.
// O cabeçalho é refeito por cima do .rz-sh-h que o abrirSheetAcoes cria — o mesmo elemento, para não perder o arraste.
// Sem ✕: fecha arrastando, tocando fora ou pelo voltar do celular.
export function abrirMenuConta() {
    const ir = (tab) => () => { rzMenuOrigemTab = tab; switchTab(tab); };
    const cod = LICENCA_ATUAL && LICENCA_ATUAL.plano_codigo ? String(LICENCA_ATUAL.plano_codigo) : '';
    const plano = cod ? (typeof escNomePlano === 'function' ? escNomePlano(cod) : (cod.charAt(0).toUpperCase() + cod.slice(1)).replace(/_/g, ' ')) : '';
    const empresa = (CONFIG_CLIENTE && CONFIG_CLIENTE.nomeEmpresa) || '';
    const nEmpresas = Array.isArray(pessoaRowsSelecaoEmpresa) ? pessoaRowsSelecaoEmpresa.length : 0;
    const perfil = perfilLogado ? String(perfilLogado).charAt(0).toUpperCase() + String(perfilLogado).slice(1) : '';
    const nome = rzNomeLegivel(socioLogado) || 'Conta';
    const sheet = abrirSheetAcoes({
        titulo: nome,
        sub: [empresa, perfil].filter(Boolean).join(' · '),
        grupos: [
            { titulo: 'Minha empresa', acoes: [
                { icone: 'building', titulo: 'Dados da empresa', aoTocar: ir('tab-minha-empresa') },
                { icone: 'users', titulo: 'Pessoas e acessos', codigo: 'pessoas.ver', aoTocar: ir('tab-pessoas') },
                { icone: 'badge-check', titulo: 'Licença e plano', sub: plano, aoTocar: ir('tab-licenca') },
                { icone: 'file-text', titulo: 'Relatórios', codigo: 'relatorios.ver', aoTocar: ir('tab-relatorios-catalogo') },
                { icone: 'file-check-2', titulo: 'Fiscal', codigo: 'fiscal.checkup', aoTocar: ir('tab-fiscal') },
            ]},
            { titulo: 'Cadastros e regras', acoes: [
                { icone: 'contact', titulo: 'Partes', codigo: 'contratos.ver', aoTocar: () => { partesFiltroPapel = 'todos'; ir('tab-partes')(); } },
                { icone: 'file-signature', titulo: 'Minutas de contrato', codigo: 'minutas.gerar', aoTocar: ir('tab-minutas') },
                { icone: 'landmark', titulo: 'Tipo de empreendimento', codigo: 'imoveis.editar', aoTocar: ir('tab-tipo-empreendimento') },
                { icone: 'sparkles', titulo: 'Regras de conciliação', codigo: 'conciliacao.configurar', aoTocar: ir('tab-regras-conciliacao') },
                { icone: 'link', titulo: 'Links compartilhados', codigo: 'vitrine.links.gerenciar', aoTocar: ir('tab-links-vitrine') },
                { icone: 'archive', titulo: 'Documentos arquivados', codigo: 'cofre.editar', aoTocar: () => abrirConfiguracaoCofre('arquivados') },
            ]},
            { titulo: 'Preferências', acoes: [
                { icone: 'bell', titulo: 'Notificações', aoTocar: abrirPreferenciasComunicacao },
                { icone: 'bot', titulo: 'Raiz IA no WhatsApp', aoTocar: abrirBotWhatsapp },
            ]},
            { titulo: 'Ajuda e conta', acoes: [
                { icone: 'life-buoy', titulo: 'Suporte', aoTocar: abrirSuporte },
                { icone: 'scroll-text', titulo: 'Termos e privacidade', aoTocar: () => window.open('https://raizpatrimonio.com.br/termos-de-uso', '_blank') },
                { icone: 'info', titulo: 'Sobre o app', sub: String(APP_VERSAO || '').replace(/^Beta v/, ''), codigo: 'sistema.versoes.ver', aoTocar: abrirVersoesDev },
            ]},
            { titulo: '', acoes: [
                { icone: 'log-out', tipo: 'bad', titulo: 'Sair', aoTocar: fazerLogoutSupabase },
            ]},
        ]
    });
    if (!sheet) return;
    sheet.classList.add('rz-menu-conta');
    const h = sheet.querySelector('.rz-sh-h');
    if (!h) return;
    const esc = (t) => String(t || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    h.classList.add('rz-mc-h');
    h.innerHTML = '<div class="rz-mc-id"><span class="rz-mc-av"></span><div class="rz-mc-tx"><b>' + esc(nome) + '</b><span>' +
        esc([empresa, perfil].filter(Boolean).join(' · ')) + '</span></div>' +
        (nEmpresas > 1 ? '<button type="button" class="rz-mc-trocar">Trocar</button>' : '') + '</div>';
    // as iniciais (ou a foto) do avatar do topo, sem os atributos de clique dele
    const av = document.querySelector('.rz-hdr .rz-avatar');
    const alvo = h.querySelector('.rz-mc-av');
    if (av && alvo) av.childNodes.forEach(n => alvo.appendChild(n.cloneNode(true)));
    if (alvo && !alvo.childNodes.length) alvo.textContent = nome.split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase();
    h.querySelector('.rz-mc-trocar')?.addEventListener('click', () => { fecharSheet(); rzTrocarEmpresa(); });
    if (typeof rzIcones === 'function') rzIcones();
}

// v1.65.0 (pedido explícito) — TODO o bloco de "Minha Empresa" saiu
// daqui: dev_carregarDadosEmpresa()/dev_salvarDadosEmpresa()/
// calcularLimiarOtsu()/processarUploadAssinatura()/
// salvarAssinaturaProcessada()/apagarAssinatura() foram absorvidas
// por js/comum-minha-empresa.js (módulo compartilhado — mesmo
// algoritmo de recorte/transparência da assinatura, copiado fiel).
// dev_carregarDadosEmpresa() vira ponte fina: nome mantido de
// propósito. Até v1.198.0 tinha 2 call sites externos (o dispatcher
// de tab-minha-empresa e dev_param_inicializar(), da extinta
// Parametrizações); v1.199.0 (bc9df144) eliminou dev_param_inicializar()
// junto com o resto do app-dev — só o dispatcher de tab-minha-empresa
// chama esta ponte agora.
export function dev_carregarDadosEmpresa() {
    const mount = document.getElementById('mount-minha-empresa');
    if (!mount) return;
    // Só remonta se a aba "Minha Empresa" está de fato ativa —
    // evita refetch/re-render invisível quando esta ponte é
    // chamada de dev_param_inicializar() com outra aba aberta.
    const secaoAtiva = document.querySelector('.tab-content.active')?.id;
    if (secaoAtiva !== 'tab-minha-empresa') return;
    import('./comum-minha-empresa.js').then(({ montarAbaMinhaEmpresa }) => {
        montarAbaMinhaEmpresa(mount, {
            dbAuth, clienteId: CLIENTE_ID_SUPABASE,
            onToast: mostrarToast,
            // F2.5b — os boxes do app que moram nos chips Documentos e Controles (F2.5b-2: Controles separado de Rotinas)
            extras: [
                { pane: 'documentos', el: document.getElementById('me-box-documentos') },
                { pane: 'controles', el: document.getElementById('me-box-controles') },
            ],
            registrarLog: registrarLog,
            onBrandingAtualizado: function() {
                // Recarrega CONFIG_CLIENTE (o módulo grava direto no
                // banco, não sabe nada do cache local do App) e
                // reaplica nos elementos de recibo/PDF — mesmo efeito
                // que a versão antiga tinha ao editar inline.
                dbAuth.from('clientes').select('*').eq('id', CLIENTE_ID_SUPABASE).maybeSingle().then(function(r) {
                    if (!r.data) return;
                    CONFIG_CLIENTE.nomeResponsavel = r.data.nome_responsavel || '';
                    CONFIG_CLIENTE.cnpj = r.data.cnpj || '';
                    CONFIG_CLIENTE.endereco = r.data.endereco || '';
                    CONFIG_CLIENTE.complemento = r.data.complemento || '';
                    CONFIG_CLIENTE.bairro = r.data.bairro || '';
                    CONFIG_CLIENTE.cidade = r.data.cidade || '';
                    CONFIG_CLIENTE.uf = r.data.uf || '';
                    CONFIG_CLIENTE.cidadeReciboFonte = r.data.cidade_recibo_fonte || 'empresa';
                    CONFIG_CLIENTE.assinaturaImgBase64 = r.data.assinatura_url || '';
                    CONFIG_CLIENTE.logoUrl = r.data.logo_url || ''; // v1.141.0 — logo agora é editável em Minha empresa
                    aplicarBrandingCliente();
                });
            },
        });
    }).catch(function(err) {
        console.warn('Falha ao carregar js/comum-minha-empresa.js:', err.message);
        mount.innerHTML = '<p class="text-xs text-red-500 text-center py-8">Não foi possível carregar a tela agora.</p>';
    });
    // v1.209.0 (pedido explícito) — box "Documentos da empresa",
    // independente de comum-minha-empresa.js (módulo compartilhado,
    // não é o lugar certo pra essa lógica — ver nota no topo de
    // js/cofre-documentos.js). Import separado, próprio
    // catch — uma falha aqui não pode derrubar o formulário acima.
    import('./cofre-documentos.js').then(function(docs) {
        docs.montarBoxDocumentosEmpresa();
    }).catch(function(err) {
        console.warn('Falha ao carregar js/cofre-documentos.js (box de documentos da empresa):', err.message);
    });
    // v1.324.0 (demanda a30da78b) — card "Controles da empresa", mesmo
    // padrão: import próprio, catch próprio (não derruba o resto da aba).
    import('./cofre-controles.js').then(function(ctrl) {
        ctrl.montarBoxControlesEmpresa();
    }).catch(function(err) {
        console.warn('Falha ao carregar js/cofre-controles.js (controles da empresa):', err.message);
    });
}

// ---------------- SOBRE: cartão de plano/licença ----------------
// FASE 1A (v1.39.2). Chamado uma vez após o login (entrarNoSistema),
// usando LICENCA_ATUAL (já carregado em entrarNaEmpresa). Não faz
// nova consulta — só formata o que já está em memória.
// v1.64.0 (pedido explícito) — REESCRITA COMPLETA: toda a lógica que
// morava aqui (branding + card de licença compacto + dúvidas/
// suporte + Sair) saiu pra js/comum-sobre.js (módulo compartilhado
// — App e Cofre importam o mesmo arquivo, nenhum dos dois "contém"
// a tela). Nome da função mantido de propósito — é chamada uma
// única vez, no fim do bootstrap pós-login (ver entrarNoSistema()),
// e trocar o nome obrigaria a caçar esse único call site também;
// manter o nome deixa esta ponte praticamente invisível pro resto
// do código.
export async function atualizarSecaoSobreLicenca() {
    const mount = document.getElementById('mount-sobre');
    if (!mount) return;
    try {
        const { montarAbaSobre } = await import('./comum-sobre.js');
        await montarAbaSobre(mount, {
            dbAuth, clienteId: CLIENTE_ID_SUPABASE, pessoaId: pessoaIdLogada,
            configCliente: CONFIG_CLIENTE,
            appVersao: APP_VERSAO,
            // v1.65.0 (pedido explícito) — "adicione a versão do
            // módulo do Cofre" na aba Sobre. A versão do Cofre
            // (segunda linha) precisa ser atualizada manualmente
            // aqui a cada deploy do Cofre — não existe hoje uma
            // fonte única compartilhada de versão de arquivo
            // estático entre index.html e cofre.html (2 arquivos
            // independentes, sem build). Ver nota completa em
            // js/comum-sobre.js v1.1.0. Versão dos bots NÃO precisa
            // de manutenção manual — vem ao vivo do banco.
            modulos: [
                { nome: 'App Raiz Patrimônio', versao: APP_VERSAO },
                { nome: 'Cofre de Documentos', versao: 'v1.21.1' },
            ],
            onLogout: fazerLogoutSupabase,
            onToast: mostrarToast,
        });
    } catch (err) {
        console.warn('Falha ao carregar js/comum-sobre.js:', err.message);
        mount.innerHTML = '<p class="text-xs text-red-500 text-center py-8">Não foi possível carregar a tela Sobre agora.</p>';
    }
}

export async function alternarPreferenciaComunicacao(btn) {
    const planoId = btn.dataset.planoId;
    const ordem = Number(btn.dataset.ordem);
    const optarOutAgora = btn.dataset.atual !== '1'; // estava ativado (atual=0) -> agora desliga
    btn.disabled = true;
    try {
        // v1.264.0 — troca de fn_definir_opt_out_comunicacao (1 id) para
        // fn_definir_opt_out_comunicacao_grupo (plano_id+ordem): o slot pode
        // ter mais de 1 comunicacao_id (par duplicado, ex. financeiro_recibos_v1/
        // controles_em_dia_v1) e o opt-out precisa valer pros dois de uma vez —
        // ver fn_minhas_comunicacoes_opt_out, que agora devolve por slot.
        const { error } = await dbAuth.rpc('fn_definir_opt_out_comunicacao_grupo', { p_plano_id: planoId, p_ordem: ordem, p_cliente_id: CLIENTE_ID_SUPABASE, p_optar_out: optarOutAgora });
        if (error) throw error;
        btn.dataset.atual = optarOutAgora ? '1' : '0';
        btn.setAttribute('aria-checked', optarOutAgora ? 'false' : 'true');
    } catch (err) {
        mostrarToast('Não foi possível salvar sua preferência.', 'danger');
        console.warn('[preferencias-comunicacao] falha ao alternar:', err.message);
    } finally {
        btn.disabled = false;
    }
}

// Chamada 1x em entrarNaEmpresa(), depois que socioLogado/
// perfilLogado/CONFIG_CLIENTE/LICENCA_ATUAL já estão todos
// preenchidos (mesmo ponto onde aplicarBrandingCliente() já roda).
// Atualiza 2 lugares: o avatar do botão do header (substitui o
// ícone genérico de pessoa) e o cabeçalho do próprio sheet do
// menu "Conta" (avatar maior + nome + empresa/perfil).
export function atualizarMenuContaHeader() {
    const iniciais = iniciaisNome(socioLogado);

    // --- avatar pequeno, botão do header ---
    const spanHeader = document.getElementById('iniciais-conta-avatar');
    const svgHeaderFallback = document.getElementById('icone-conta-avatar-fallback');
    if (spanHeader) {
        if (iniciais) {
            spanHeader.textContent = iniciais;
            spanHeader.classList.remove('hidden');
            if (svgHeaderFallback) svgHeaderFallback.classList.add('hidden');
        } else {
            // sem nome ainda (não deveria acontecer pós-login, mas
            // não custa manter o ícone genérico como rede de segurança)
            spanHeader.classList.add('hidden');
            if (svgHeaderFallback) svgHeaderFallback.classList.remove('hidden');
        }
    }

    // v1.115.0 (fatia 7) — o cabeçalho de identidade e o selo do
    // plano do sheet estático saíram: o menu é gerado na hora por
    // abrirMenuConta() (título = nome, sub = empresa · perfil, plano
    // no sub de "Licença e uso"). atualizarBadgePlanoMenu() foi
    // removida junto. Aqui só resta o cabeçalho global.
    atualizarContextoHeader();
}

// v1.93.0 (pedido explícito, 31/08/2026) — variante de
// abrirCofreDocumentos() pra abrir direto numa tela de
// CONFIGURAÇÃO do Cofre (Categoria de Documento, Sub-tipos/
// Modelos de item de controle) — 3 telas que só existiam dentro
// do próprio menu ⚙️ do Cofre, nunca tinham porta de entrada
// aqui. Mesmo padrão de URL de sempre (cliente_id sempre junto,
// parâmetro de URL nunca é autorização) — só troca contexto/ref
// por abrir. Ver cofre-navegacao.js v1.6.0/cofre-app.js v1.9.0.
// v1.115.0 (fatia 7) — deixou de sair do App pro cofre.html: a aba
// Ativos já embute o módulo inteiro, e cofre-app.js escuta o evento
// 'cofre:abrir-configuracao' (existia desde a v1.8.0 pro ?abrir=).
// Se o módulo ainda não carregou, espera o 'cofre:dados-carregados'
// uma vez e dispara em seguida. Era a última porta do menu pro
// cofre.html (roteiro §3 das PENDÊNCIAS).
export function abrirConfiguracaoCofre(tela) {
    const porCima = tela === 'arquivados'; // Sheet: a pessoa fica onde estava (dem b8602a3a)
    if (!porCima) switchTab('tab-ativos');
    const disparar = () => window.dispatchEvent(new CustomEvent('cofre:abrir-configuracao', { detail: { tela } }));
    if (Array.isArray(window.__cofreAtivos)) { setTimeout(disparar, 0); return; }
    window.addEventListener('cofre:dados-carregados', () => setTimeout(disparar, 80), { once: true });
    if (porCima) import('./ativos/ativos-boot.js').then(({ montarAtivosTab }) => montarAtivosTab(CLIENTE_ID_SUPABASE))
        .catch(err => { console.warn('[arquivados] módulo de Ativos:', err.message); switchTab('tab-ativos'); });
}

// v1.201.0 — par de "Alertas e avisos automáticos" (Minhas
// notificações, seção 1): mesmo padrão de salvar-na-hora de
// alternarPreferenciaComunicacao() acima, mas contra
// pessoa_preferencias_comunicacao (pessoaIdLogada) em vez de
// fn_definir_opt_out_comunicacao. Sem botão de salvar — o toggle e
// a frequência gravam sozinhos.
export async function salvarPreferenciaAlerta(codigo, habilitado, frequencia, origemEl) {
    if (origemEl) origemEl.disabled = true;
    try {
        const { error } = await dbAuth.from('pessoa_preferencias_comunicacao').upsert([{
            cliente_id: CLIENTE_ID_SUPABASE, pessoa_id: pessoaIdLogada, funcionalidade_codigo: codigo,
            habilitado, frequencia, atualizado_em: new Date().toISOString(),
        }], { onConflict: 'pessoa_id,funcionalidade_codigo' });
        if (error) throw error;
    } catch (err) {
        mostrarToast('Não foi possível salvar: ' + err.message, 'danger');
    } finally {
        if (origemEl) origemEl.disabled = false;
    }
}

export async function alternarPreferenciaAlerta(btn) {
    const codigo = btn.dataset.codigo;
    const novoHabilitado = btn.dataset.habilitado !== '1';
    const lista = btn.closest('#lista-preferencias-alertas');
    const sel = lista?.querySelector(`.pref-alerta-frequencia[data-codigo="${codigo}"]`);
    const frequencia = sel ? sel.value : 'semanal';
    btn.disabled = true;
    await salvarPreferenciaAlerta(codigo, novoHabilitado, frequencia);
    btn.dataset.habilitado = novoHabilitado ? '1' : '0';
    btn.setAttribute('aria-checked', novoHabilitado ? 'true' : 'false');
    if (sel) sel.disabled = !novoHabilitado;
    btn.disabled = false;
}

// ---------------- ABA LICENÇA — visão do próprio cliente ----------------
// v1.64.0 (pedido explícito) — REESCRITA COMPLETA: toda a lógica de
// busca/render que morava aqui (licença + funcionalidades com
// limite) saiu pra js/comum-licenca.js (módulo compartilhado — App
// e Cofre importam o mesmo arquivo). Esta função virou uma PONTE
// fina: mantém o mesmo nome/assinatura de antes de propósito, pra
// switchTab() (que chama inicializarLicenca() condicionalmente ao
// trocar pra 'tab-licenca') não precisar mudar nem uma linha.
//
// NOTA: esta ponte NÃO reaproveita LICENCA_ATUAL (a licença
// hardcoded pro módulo 'imoveis', usada pelas checagens de limite
// em verificarLimiteAntesDeAbrir()/o painel DEV — ver
// carregarLicencaAtual()). montarAbaLicenca() busca TODAS as
// licenças do cliente por conta própria (ver changelog de
// comum-licenca.js v1.0.0) — são responsabilidades diferentes que
// só coincidiam de usar o mesmo dado antes desta extração.
export async function inicializarLicenca() {
    const mount = document.getElementById('mount-licenca');
    if (!mount) return;
    try {
        const { montarAbaLicenca } = await import('./comum-licenca.js');
        await montarAbaLicenca(mount, { dbAuth, clienteId: CLIENTE_ID_SUPABASE, pessoaId: pessoaIdLogada, toast: mostrarToast });
    } catch (err) {
        console.warn('Falha ao carregar js/comum-licenca.js:', err.message);
        mount.innerHTML = '<p class="text-xs text-red-500 text-center py-8">Não foi possível carregar a tela de Licença agora.</p>';
    }
}

export function abrirConfiguracaoInicial() {
    if (window.podeUsar && !window.podeUsar('cofre.configuracao_inicial').ok) {
        mostrarToast(window.podeUsar('cofre.configuracao_inicial').motivo || 'Disponível em outro plano.', 'aviso');
        return;
    }
    switchTab('tab-ativos');
    const disparar = () => window.dispatchEvent(new CustomEvent('cofre:abrir-configuracao-inicial'));
    if (Array.isArray(window.__cofreAtivos)) { setTimeout(disparar, 0); return; }
    window.addEventListener('cofre:dados-carregados', () => setTimeout(disparar, 80), { once: true });
}

export async function carregarLicencaAtual() {
    if (!CLIENTE_ID_SUPABASE) return;
    try {
        const { data, error } = await dbAuth
            .from('licencas')
            .select('*')
            .eq('cliente_id', CLIENTE_ID_SUPABASE)
            .eq('modulo', 'imoveis')
            .maybeSingle();
        if (error) throw error;
        LICENCA_ATUAL = data || null;
    } catch (err) {
        console.warn('Falha ao carregar licença:', err.message);
        LICENCA_ATUAL = null;
    }
}

// v1.253.0 — atalho único "cadastrar contador": abre Partes (chip
// Prestadores) e o formulário de parte nova já como Contador.
// v1.2.0 (Nicola 14/10 22:12: "ao sair da tela do contador apareceu a tela de Partes") — o formulário abre como sheet
// por cima da tela atual (Financeiro, Fiscal), sem trocar de aba: fechar ou salvar volta para onde a pessoa estava.
export function abrirCadastroContador() {
    if (typeof partesFiltroPapel !== 'undefined') partesFiltroPapel = 'prestadores';
    abrirFormParteSheet(null, { tipoPrestador: 'contador' });
}
