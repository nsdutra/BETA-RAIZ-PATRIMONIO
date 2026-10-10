// ============================================================================
// conta.js — Raiz Patrimônio · Conta e preferências: menu da conta, seção Sobre,
//            licença, preferências de comunicação e de alerta, atalhos de
//            configuração (Cofre, configuração inicial, cadastro do contador)
// Versão: 1.0.0 · 10/10/2026
//
// v1.0.0 (10/10/2026, sessão 20261010-1500-onda2b-conta, demanda 6b11c602 — Onda 2b da
// fragmentação, plano aprovado pelo Nicola 09/10 21:15) — 13 telas saíram do index.html
// SEM UMA LINHA REESCRITA: cada função veio byte a byte e só ganhou "export". Chegam de
// volta pela ponte rzPonteModulo, a mesma dos outros módulos R8.
//
// Sem injeção, como no js/partes.js (Onda 2a): `let` no topo do script clássico do index
// está no escopo léxico global, que um módulo ES alcança como nome livre e sempre no valor
// corrente. As 3 globais que este módulo ESCREVE — partesFiltroPapel, rzMenuOrigemTab e
// LICENCA_ATUAL — foram conferidas uma a uma como `let` do index.
//
// O QUE NÃO VEIO NESTA FATIA, de propósito:
//  · entrarNaEmpresa, mostrarSelecaoEmpresa, escolherEmpresa, rzTrocarEmpresa e
//    renderizarListaSelecaoEmpresa. São o boot e a troca de empresa, e atribuem
//    CLIENTE_ID_SUPABASE — estado de sessão. É o escopo da Onda 1c, que pede ficha própria:
//    mover o dono do estado junto com as telas que o consomem misturaria duas decisões.
//  · configurarFiltrosIniciais (345 bytes). O entrarNoSistema a chama SOLTA, sem await;
//    virar assíncrona poderia deixar o primeiro render com o filtro errado. Não vale o risco
//    por 345 bytes — é a mesma classe de armadilha do montarBoxDivisaoSocietaria.
// ============================================================================

export const VERSAO = '1.0.0';  // v-check: lido por ⚙️ › Conta › Versões — manter igual ao header

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
            <p class="rz-desc">Pelo WhatsApp, pela manhã. Semanais saem às segundas; mensais, no dia 5.</p>
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
        const { buscarProativasDisponiveis, buscarPreferenciasComunicacao, FREQUENCIA_OPCOES } = await import('./js/comum-pessoas.js');
        const [proativas, preferenciasMap] = await Promise.all([
            buscarProativasDisponiveis(dbAuth, CLIENTE_ID_SUPABASE),
            buscarPreferenciasComunicacao(dbAuth, CLIENTE_ID_SUPABASE),
        ]);
        const listaAlertas = document.getElementById('lista-preferencias-alertas');
        if (!proativas.length) {
            listaAlertas.innerHTML = '<p class="rz-desc" style="margin-top:8px">Nenhum aviso automático disponível no seu plano.</p>';
        } else {
            // v1.201.0 — mesmo padrão visual/comportamental do toggle de
            // "Comunicações da Raiz" logo abaixo: cada aviso salva na
            // hora ao ligar/desligar (ou trocar a frequência), sem
            // botão de salvar em lote (o botão saiu — pedido do
            // Nicola, "já que tera o componente de ligar ou desligar").
            listaAlertas.innerHTML = proativas.map(f => {
                const pref = preferenciasMap.get(`${pessoaIdLogada}|${f.codigo}`);
                const habilitado = pref ? pref.habilitado : true;
                const frequencia = pref ? pref.frequencia : 'semanal';
                const opcoesHtml = FREQUENCIA_OPCOES.map(o => `<option value="${o.valor}" ${frequencia === o.valor ? 'selected' : ''}>${o.rotulo}</option>`).join('');
                return `<div class="rz-row rz-pref rz-pref-2l">
                    <div class="rz-tx"><b>${rzEsc(f.descricao)}</b></div>
                    <select class="pref-alerta-frequencia" data-codigo="${f.codigo}" aria-label="Frequência" ${habilitado ? '' : 'disabled'}>${opcoesHtml}</select>
                    <button type="button" role="switch" class="rz-switch pref-alerta-toggle" data-codigo="${f.codigo}" data-habilitado="${habilitado ? '1' : '0'}"
                        aria-checked="${habilitado ? 'true' : 'false'}" aria-label="${rzEsc(f.descricao)}" onclick="alternarPreferenciaAlerta(this)"></button>
                </div>`;
            }).join('');
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
            lista.innerHTML = '<p class="rz-desc">Nenhuma preferência configurável no momento.</p>';
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

export function abrirMenuConta() {
    const ir = (tab) => () => { rzMenuOrigemTab = tab; switchTab(tab); };
    const plano = LICENCA_ATUAL && LICENCA_ATUAL.plano_codigo ? ('Plano ' + LICENCA_ATUAL.plano_codigo.charAt(0).toUpperCase() + LICENCA_ATUAL.plano_codigo.slice(1)) : 'Plano e consumo';
    const empresa = (CONFIG_CLIENTE && CONFIG_CLIENTE.nomeEmpresa) || '';
    const nEmpresas = Array.isArray(pessoaRowsSelecaoEmpresa) ? pessoaRowsSelecaoEmpresa.length : 0;
    const minhaEmpresa = [
        { icone: 'building', titulo: 'Dados da empresa', sub: 'Cadastro, fiscal, Pix, rotinas e documentos', aoTocar: ir('tab-minha-empresa') },
        { icone: 'users', titulo: 'Pessoas e acessos', sub: 'Quem usa o Raiz e o que cada um pode ver', codigo: 'pessoas.ver', aoTocar: ir('tab-pessoas') },
        { icone: 'badge-check', titulo: 'Licença e plano', sub: plano, aoTocar: ir('tab-licenca') },
        { icone: 'file-text', titulo: 'Relatórios', sub: 'Fluxo de caixa, gerencial, resultados e distribuição', codigo: 'relatorios.ver', aoTocar: ir('tab-relatorios-catalogo') }, // v1.313.1 — pedido do Nicola 07/10
        { icone: 'file-check-2', titulo: 'Fiscal', sub: 'Check-up da Reforma Tributária', codigo: 'fiscal.checkup', aoTocar: ir('tab-fiscal') }, // fica aqui até a etapa 6 (F2.5a)
    ];
    if (nEmpresas > 1) minhaEmpresa.unshift({ icone: 'repeat', titulo: 'Trocar empresa', sub: 'Você acessa ' + nEmpresas + ' empresas', aoTocar: rzTrocarEmpresa });
    abrirSheetAcoes({
        titulo: socioLogado || 'Conta',
        sub: perfilLogado ? (empresa + ' · ' + perfilLogado) : empresa,
        grupos: [
            { titulo: 'Minha empresa', acoes: minhaEmpresa },
            { titulo: 'Cadastros e regras', acoes: [
                { icone: 'contact', titulo: 'Partes', sub: 'Locatários, fiadores, proprietários, prestadores', codigo: 'contratos.ver', aoTocar: () => { partesFiltroPapel = 'todos'; ir('tab-partes')(); } },
                { icone: 'file-signature', titulo: 'Minutas de contrato', sub: 'Modelos para gerar o contrato preenchido', codigo: 'minutas.gerar', aoTocar: ir('tab-minutas') },
                { icone: 'landmark', titulo: 'Tipo de empreendimento', sub: 'Como os imóveis se agrupam na carteira', codigo: 'imoveis.editar', aoTocar: ir('tab-tipo-empreendimento') },
                { icone: 'sparkles', tipo: 'ia', titulo: 'Regras de conciliação', sub: 'O que o sistema decide sozinho', codigo: 'conciliacao.configurar', aoTocar: ir('tab-regras-conciliacao') },
                { icone: 'link', titulo: 'Links compartilhados', sub: 'Links de imóveis enviados a interessados', codigo: 'vitrine.links.gerenciar', aoTocar: ir('tab-links-vitrine') },
                { icone: 'archive', titulo: 'Documentos arquivados', sub: 'Restaurar, vincular ou excluir de vez', codigo: 'cofre.editar', aoTocar: () => abrirConfiguracaoCofre('arquivados') },
            ]},
            { titulo: 'Preferências', acoes: [
                { icone: 'bell', titulo: 'Notificações', sub: 'O que chega no app, no WhatsApp e no e-mail', aoTocar: abrirPreferenciasComunicacao },
                { icone: 'bot', titulo: 'Raiz IA no WhatsApp', sub: 'Consultas e avisos pelo WhatsApp', aoTocar: abrirBotWhatsapp },
            ]},
            { titulo: 'Ajuda e conta', acoes: [
                { icone: 'life-buoy', titulo: 'Suporte', sub: 'WhatsApp, e-mail e sugestões', aoTocar: abrirSuporte },
                { icone: 'scroll-text', titulo: 'Termos e privacidade', sub: 'Como o Raiz trata os seus dados', aoTocar: () => window.open('https://raizpatrimonio.com.br/termos-de-uso', '_blank') },
                { icone: 'info', titulo: 'Sobre o app', sub: APP_VERSAO, codigo: 'sistema.versoes.ver', aoTocar: abrirVersoesDev }, // era "Versões" (v1.244.0, 472927ba)
                { icone: 'log-out', titulo: 'Sair', sub: 'Encerra a sessão neste aparelho', aoTocar: fazerLogoutSupabase },
            ]},
        ]
    });
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
    import('./js/comum-minha-empresa.js').then(({ montarAbaMinhaEmpresa }) => {
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
    import('./js/cofre-documentos.js').then(function(docs) {
        docs.montarBoxDocumentosEmpresa();
    }).catch(function(err) {
        console.warn('Falha ao carregar js/cofre-documentos.js (box de documentos da empresa):', err.message);
    });
    // v1.324.0 (demanda a30da78b) — card "Controles da empresa", mesmo
    // padrão: import próprio, catch próprio (não derruba o resto da aba).
    import('./js/cofre-controles.js').then(function(ctrl) {
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
        const { montarAbaSobre } = await import('./js/comum-sobre.js');
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
    if (porCima) import('./js/ativos/ativos-boot.js').then(({ montarAtivosTab }) => montarAtivosTab(CLIENTE_ID_SUPABASE))
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
        const { montarAbaLicenca } = await import('./js/comum-licenca.js');
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
export function abrirCadastroContador() {
    if (typeof partesFiltroPapel !== 'undefined') partesFiltroPapel = 'prestadores';
    switchTab('tab-partes');
    setTimeout(() => abrirFormParteSheet(null, { tipoPrestador: 'contador' }), 0);
}
