// ============================================================================
// comum-pessoas.js — Raiz Patrimônio · Administração compartilhada
// Versão: 1.206.0 · 08/10/2026
//
// v1.206.0 (UX F2.7c-2, demanda b8602a3a, sessão 20261003-1707-ux-base; plano F2.7c-2 aprovado pelo Nicola 08/10 14:04) — Pessoas e acessos no
// padrão: esqueleto no lugar de "Carregando…" (lista e acessos recentes); formulário da pessoa com o
// campo único (.rz-f, rótulo acima) e E-mail/WhatsApp em .rz-f2 (uma coluna no celular); sheet de
// Comunicações da pessoa com as linhas de Minhas notificações (.rz-pref-2l) e o interruptor
// .rz-switch (estado em aria-checked, sem cor em style).
//
// Versão anterior: 1.205.0 · 08/10/2026
//
// v1.205.0 (UX F2.7b, demanda b8602a3a, sessão 20261003-1707-ux-base; plano F2.7 aprovado pelo Nicola 07/10 20:05; achado do teste da F2.7a em 08/10 08:12) — Pessoas sem ninguém
// cadastrado usa a caixa rzVazio do app ("Quem usa o Raiz com você" + "Adicionar pessoa" para quem pode
// gerenciar). Pessoa que não se achou e o cofre.html avulso (sem rzVazio) mantêm o vazio de antes.
//
// Versão anterior: 1.204.2 · 07/10/2026
//
// v1.204.1 (07/10/2026, sessão 20261007-1721-rolo-changelog, demanda 2507d554 — VER-06, "de acordo" do Nicola 07/10 17:21) — SÓ
// CABEÇALHO: as versões além das 5 mais recentes rolaram para o CHANGELOG_MODULOS.md.
// Nenhuma linha de código mudou — conferido token a token contra o publicado.
//
// Versão anterior: 1.204.0 · 04/10/2026
//
// v1.204.0 (04/10/2026, sessão 20261004-1245-financeiro, demanda f3e6cd27 — P4a,
// aprovada pelo Nicola 12:43) — contas da pessoa: card "Contas" na ficha e ação
// "Contas" no ⋮. Mostra as contas de que a pessoa é titular (criar, editar,
// padrão, encerrar — mesma ficha de Minha empresa) e "Quem ela vê": Todas ·
// Só as dela · As dela e as da empresa (fn_pessoa_escopo_contas_definir, só
// master). Master sempre vê todas. Sem Premium, a ação aparece com cadeado.
// Versão anterior: 1.203.0.
//
// v1.203.0 (F0.2b do PLANO_UX, demanda 9e4aca28, sessão 20261003-1707-ux-base; UXR-29/30) — zero diálogo nativo: excluir pessoa vira perguntar() (Sheet,
// item vermelho); tirar acesso não pergunta mais e ganha "Desfazer" (devolve login e perfil);
// o prompt() de perfil fora do app virou aviso.
// --------------------------------------------------------------------------
// Versões anteriores (v1.202.0 … v1.202.0): CHANGELOG_MODULOS.md, na raiz do repositório — o
// gerar_versoes.py rola pra lá automaticamente tudo além das 5 versões
// mais recentes deste cabeçalho (VER-06).
export const VERSAO = '1.206.0'; // v-check (18/09/2026): lido por Dev › Versões — manter igual ao header
import { perguntar, avisarComDesfazer } from './cofre-ui.js'; // v1.203.0 (F0.2b) — sem diálogo nativo
import { buscarContas, contasListaHtml, abrirFichaConta, abrirAcoesConta } from './comum-minha-empresa.js'; // v1.204.0 — contas da pessoa (P4a)
import { rzMostrarBloqueio as rzBloqueio } from './comum-licenca.js'; // v1.204.0
export const COMUM_PESSOAS_VERSAO = '2.1.0';
// v1.204.0 — rótulos do escopo de contas (pessoas.escopo_contas)
const ESCOPO_CONTAS_ROTULO = { propria_mais_empresa: 'Vê as contas dela e as da empresa', propria: 'Vê só as contas dela', todas: 'Vê todas as contas' };

const SUPABASE_URL = 'https://oduwpttbbemypiypjsux.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kdXdwdHRiYmVteXBpeXBqc3V4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyODEyOTcsImV4cCI6MjEwMDg1NzI5N30.9-cu1CV1wPbo5UH1G2eAsWqsvS54AWNuQZOlifc9a7w';

// area (funcionalidades.area) → módulo de exibição. Áreas ausentes deste
// mapa (ex.: "pessoas", "dev", "plataforma", "autenticar", "prestadores",
// "ia_whatsapp") são transversais/internas, não aparecem como módulo —
// não é omissão, é proposital (não são "um módulo" pro usuário final).
const AREA_PARA_MODULO = {
    imoveis: 'Imóveis', contratos: 'Imóveis', mensal: 'Imóveis', repasses: 'Imóveis',
    vitrine: 'Imóveis', conciliacao: 'Imóveis', tributos_custos: 'Imóveis', relatorios: 'Imóveis',
    cofre: 'Cofre', cofre_documentos: 'Cofre',
    gestao: 'Gestão',
};

// v1.1 — rótulos de frequência de comunicação proativa. Texto do envio
// (dias/horário) documentado uma vez só aqui — pedido explícito do
// Nicola: "avise que os envios são por WhatsApp e saem durante a manhã,
// informe que as semanais saem as segundas e as mensais saem dia 05".
export const FREQUENCIA_OPCOES = [
    { valor: 'diario', rotulo: 'Diário' },
    { valor: 'semanal', rotulo: 'Semanal (segundas)' },
    { valor: 'quinzenal', rotulo: 'Quinzenal' },
    { valor: 'mensal', rotulo: 'Mensal (dia 05)' },
    { valor: 'trimestral', rotulo: 'Trimestral' },
];

// ----------------------------------------------------------------------------
// CAMADA DE DADOS — intocada nesta reescrita (só a apresentação mudou).
// ----------------------------------------------------------------------------
export async function listarPessoas(dbAuth, clienteId) {
    const { data, error } = await dbAuth.from('pessoas').select('*').eq('cliente_id', clienteId);
    if (error) throw error;
    return (data || []).map(row => ({
        id: row.id, nome: row.nome, email: row.email, whatsapp: row.whatsapp,
        funcao: row.funcao, percentualCotasEmpresa: row.percentual_cotas_empresa,
        userId: row.user_id, perfil: row.perfil,
        escopoContas: row.escopo_contas || 'propria_mais_empresa', // v1.204.0
    }));
}

// Módulos que cada PERFIL libera, calculado ao vivo (sem embed —
// 2 consultas simples + join em JS, mesmo princípio já usado em
// comum-licenca.js: reduz risco de quebrar por FK/relação não
// confirmada). Retorna Map perfil_codigo → Set(nomeModulo).
async function buscarModulosPorPerfil(dbAuth) {
    const mapa = new Map();
    try {
        const [{ data: vinculos, error: e1 }, { data: funcs, error: e2 }] = await Promise.all([
            dbAuth.from('perfil_funcionalidade').select('perfil_codigo, funcionalidade_codigo'),
            dbAuth.from('funcionalidades').select('codigo, area'),
        ]);
        if (e1 || e2) throw (e1 || e2);
        const areaPorCodigo = new Map((funcs || []).map(f => [f.codigo, f.area]));
        (vinculos || []).forEach(v => {
            const area = areaPorCodigo.get(v.funcionalidade_codigo);
            const modulo = AREA_PARA_MODULO[area];
            if (!modulo) return;
            if (!mapa.has(v.perfil_codigo)) mapa.set(v.perfil_codigo, new Set());
            mapa.get(v.perfil_codigo).add(modulo);
        });
    } catch (err) {
        console.warn('[comum-pessoas] Falha ao calcular acessos por perfil (campo "Acesso a módulos" fica oculto):', err.message);
    }
    return mapa;
}

// ----------------------------------------------------------------------------
// COMUNICAÇÕES PROATIVAS — intocado nesta reescrita (só a apresentação,
// dentro do Sheet, mudou). Ver changelog v1.1.0 acima pro histórico
// completo da funcionalidade.
// ----------------------------------------------------------------------------
export async function buscarProativasDisponiveis(dbAuth, clienteId) {
    try {
        const agora = new Date().toISOString();
        const [{ data: licencas, error: e1 }, { data: planoFunc, error: e2 }, { data: funcs, error: e3 }] = await Promise.all([
            dbAuth.from('licencas').select('plano_codigo, data_expiracao').eq('cliente_id', clienteId).eq('status', 'ativo'),
            dbAuth.from('plano_funcionalidade').select('plano_codigo, funcionalidade_codigo'),
            dbAuth.from('funcionalidades').select('codigo, descricao, area').eq('tipo', 'proativa').eq('ativo', true),
        ]);
        if (e1 || e2 || e3) throw (e1 || e2 || e3);

        // Só licenças vigentes (sem data de expiração, ou expirando no futuro).
        const planosVigentes = new Set((licencas || [])
            .filter(l => !l.data_expiracao || l.data_expiracao > agora)
            .map(l => l.plano_codigo));

        const codigosLiberados = new Set((planoFunc || [])
            .filter(pf => planosVigentes.has(pf.plano_codigo))
            .map(pf => pf.funcionalidade_codigo));

        return (funcs || [])
            .filter(f => codigosLiberados.has(f.codigo))
            .sort((a, b) => a.descricao.localeCompare(b.descricao));
    } catch (err) {
        console.warn('[comum-pessoas] Falha ao calcular proativas disponíveis por licença (seção de comunicações fica oculta):', err.message);
        return [];
    }
}

export async function buscarPreferenciasComunicacao(dbAuth, clienteId) {
    const mapa = new Map(); // chave: `${pessoaId}|${funcionalidadeCodigo}` -> { habilitado, frequencia }
    try {
        const { data, error } = await dbAuth
            .from('pessoa_preferencias_comunicacao')
            .select('pessoa_id, funcionalidade_codigo, habilitado, frequencia')
            .eq('cliente_id', clienteId);
        if (error) throw error;
        (data || []).forEach(p => {
            mapa.set(`${p.pessoa_id}|${p.funcionalidade_codigo}`, { habilitado: p.habilitado, frequencia: p.frequencia });
        });
    } catch (err) {
        console.warn('[comum-pessoas] Falha ao carregar preferências de comunicação (assume padrão pra todas):', err.message);
    }
    return mapa;
}

// ----------------------------------------------------------------------------
// CAMADA DE APRESENTAÇÃO — reescrita total (v2.0.0). Gramática igual ao
// módulo Partes (index.html): .rz-row na lista, Sheets pra tudo o mais.
// Os helpers abrirSheet/abrirSheetAcoes/abrirSheetForm/podeUsar/
// renderStatus são globais do App (window.*, expostos por Object.assign
// em index.html) — indisponíveis no Cofre standalone (cofre.html não
// carrega aquele <script>). Toda chamada é defensiva
// (typeof window.X === 'function') com o MESMO aviso de fallback já
// usado em cofre-controles.js/cofre-ativos.js/cofre-documentos.js pras
// próprias ações Sheet-dependentes: "Ações disponíveis só dentro do app
// principal." — ver ACHADO DE GOVERNANÇA no changelog do topo.
// ----------------------------------------------------------------------------

function esc(v) {
    return String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function capitalizar(s) {
    return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function icones() {
    if (typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();
}

const AVISO_SO_APP = 'Ações disponíveis só dentro do app principal.';

// mountEl = elemento container já presente no DOM do host. ctx = {
//   dbAuth, clienteId, perfilLogado,   // perfil de quem está LOGADO agora
//                                       // (rege trava de master/permissão
//                                       // de editar perfil — mesma regra
//                                       // de sempre)
//   onToast(mensagem, tipo),           // opcional
//   registrarLog(acao, detalhe),       // opcional
//
//   -- v1.7.0 (bc9df144, item 2) — campos OPCIONAIS (Cofre não os passa):
//   pessoaId,             // id da pessoa logada agora
//   autoFiltro,            // true = ativa a regra "só eu, a não ser que eu
//                          // possa ver todo mundo" (App > Conta > Pessoas).
//   podeVerTodas,          // true = (com autoFiltro) mostra TODAS as
//                          // pessoas da empresa — só deve vir true pra
//                          // quem tem o codigo pessoas.ver_todas.
//   carregarAcessosDaPessoa(pessoaId), // opcional; alimenta o Sheet
//                          // "Acessos recentes".
// }
export async function montarAbaPessoas(mountEl, ctx) {
    if (!mountEl) return;
    const { dbAuth, clienteId, perfilLogado, onToast, registrarLog, pessoaId, autoFiltro, podeVerTodas, carregarAcessosDaPessoa } = ctx || {};
    // Só quem pode ver todo mundo (ou telas que não pedem auto-filtro, como
    // o Cofre) gerencia pessoas ALHEIAS — adicionar, remover, editar de
    // outra pessoa. No modo "só eu" o "+" some (não faz sentido cadastrar
    // outra pessoa numa tela que só mostra a si mesmo).
    const podeGerenciarOutras = !autoFiltro || podeVerTodas;

    mountEl.innerHTML = `
        <div class="rz-tabhead">
            <p>${autoFiltro && !podeVerTodas ? 'Seu cadastro, seus avisos e seus acessos recentes.' : 'Cadastro unificado de sócios e usuários do sistema — quem tem acesso ao app e a divisão societária da empresa.'}</p>
            ${podeGerenciarOutras ? '<button type="button" id="cp-btn-nova" class="rz-ico-btn rz-primary" aria-label="Nova pessoa" title="Nova pessoa"><svg data-lucide="plus"></svg></button>' : ''}
        </div>
        <div class="rz-card rz-list" id="cp-lista">${(typeof window !== 'undefined' && typeof window.rzSkeleton === 'function' ? window.rzSkeleton('linhas', 3) : '<p class="rz-desc">Carregando…</p>')}</div>
    `;

    if (!dbAuth || !clienteId) {
        document.getElementById('cp-lista').innerHTML = '<div class="rz-empty"><p>Nenhuma empresa carregada.</p></div>';
        return;
    }

    let pessoas = [];
    let modulosPorPerfil = new Map();
    // v1.5.0 (A.5) — perfil escolhido em SHEET, lendo a tabela `perfis`
    // (escopo empresa) e `protegido`: perfil protegido (master, admin) só
    // aparece pra quem é master. Fallback prompt() quando Sheet indisponível
    // (Cofre standalone).
    let perfisCache = null;
    async function escolherPerfilSheet(titulo, sub, padrao = 'operador') {
        if (!perfisCache) {
            const { data } = await dbAuth.from('perfis').select('codigo, nome, descricao, protegido, escopo').eq('escopo', 'empresa').order('codigo');
            perfisCache = data || [];
        }
        const lista = perfisCache.filter(p => !p.protegido || perfilLogado === 'master');
        if (!lista.length || typeof window.abrirSheetAcoes !== 'function') {
            onToast?.(AVISO_SO_APP, 'info'); return null; // v1.203.0 (F0.2b) — sem diálogo nativo; fora do app não há Sheet
        }
        return new Promise(resolve => {
            let escolhido = null;
            window.abrirSheetAcoes({ titulo, sub, acoes: lista.map(p => ({
                icone: p.protegido ? 'shield' : 'user', titulo: p.nome || p.codigo, sub: p.descricao || '',
                aoTocar: () => { escolhido = p.codigo; resolve(p.codigo); },
            })) });
            // fechar sem escolher → null (o sheet não tem hook de fechar aqui: usa polling leve)
            const iv = setInterval(() => { const aberto = document.getElementById('rz-veil')?.classList.contains('rz-on'); if (escolhido !== null || !aberto) { clearInterval(iv); if (escolhido === null) resolve(null); } }, 300);
        });
    }
    let proativasDisponiveis = [];
    let preferenciasMap = new Map();
    try {
        [pessoas, modulosPorPerfil, proativasDisponiveis, preferenciasMap] = await Promise.all([
            listarPessoas(dbAuth, clienteId),
            buscarModulosPorPerfil(dbAuth),
            buscarProativasDisponiveis(dbAuth, clienteId),
            buscarPreferenciasComunicacao(dbAuth, clienteId),
        ]);
    } catch (err) {
        console.warn('[comum-pessoas] Falha ao carregar pessoas:', err.message);
        document.getElementById('cp-lista').innerHTML = '<div class="rz-empty"><p>Não foi possível carregar as pessoas agora.</p></div>';
        return;
    }

    function renderLista() {
        const lista = document.getElementById('cp-lista');
        if (!lista) return;
        // Com autoFiltro ligado, por padrão só a própria pessoa logada
        // aparece; só quem tem pessoas.ver_todas (podeVerTodas=true,
        // calculado no host via podeUsar) vê todo mundo — aí sim com a
        // mesma regra de sempre (master oculto de quem não é master).
        // Sem autoFiltro (Cofre), nada muda.
        const visiveis = autoFiltro
            ? (podeVerTodas
                ? (perfilLogado === 'master' ? pessoas : pessoas.filter(p => p.perfil !== 'master'))
                : pessoas.filter(p => p.id === pessoaId))
            : (perfilLogado === 'master' ? pessoas : pessoas.filter(p => p.perfil !== 'master'));
        if (visiveis.length === 0 && !(autoFiltro && !podeVerTodas) && typeof window.rzVazio === 'function') {
            lista.innerHTML = window.rzVazio({
                dominio: 'pessoas', id: 'pessoas',
                titulo: 'Quem usa o Raiz com você',
                beneficio: 'Convide sua equipe, sócios ou família e defina o que cada pessoa pode ver e fazer.',
                acaoManual: podeGerenciarOutras ? { rotulo: 'Adicionar pessoa', aoTocar: () => abrirFormPessoaSheet(null) } : null,
            });
            icones();
            return;
        }
        if (visiveis.length === 0) {
            const msg = autoFiltro && !podeVerTodas
                ? 'Não achamos seu cadastro de pessoa. Fale com quem administra esta empresa.'
                : (podeGerenciarOutras ? 'Nenhuma pessoa cadastrada. Toque no "+" para adicionar.' : 'Nenhuma pessoa cadastrada.');
            lista.innerHTML = `<div class="rz-empty"><div class="rz-ic"><svg data-lucide="users"></svg></div><p>${esc(msg)}</p></div>`;
            icones();
            return;
        }
        lista.innerHTML = visiveis.map(p => {
            const ehMaster = p.perfil === 'master';
            const icone = ehMaster ? 'shield-check' : 'user';
            const fato = p.perfil ? capitalizar(p.perfil) : 'Sem perfil';
            const contexto = p.funcao || 'Sem função definida';
            return `
                <div class="rz-row rz-link" data-acao="ficha" data-id="${p.id}">
                    <div class="rz-ic"><svg data-lucide="${icone}"></svg></div>
                    <div class="rz-tx"><b>${esc(p.nome || '(sem nome)')}</b><span>${esc(fato)} · ${esc(contexto)}</span></div>
                    <button type="button" data-acao="mais" data-id="${p.id}" class="rz-more" aria-label="Mais ações"><svg data-lucide="ellipsis-vertical"></svg></button>
                </div>`;
        }).join('');
        icones();
    }
    renderLista();

    // ---------------------------------------------------------------
    // FICHA — leitura (Sheet), igual ao padrão de abrirFichaParte.
    // ---------------------------------------------------------------
    function abrirFichaPessoa(id) {
        const p = pessoas.find(x => x.id === id);
        if (!p || typeof window.abrirSheet !== 'function') { onToast?.(AVISO_SO_APP, 'info'); return; }
        const kv = (r, v) => v ? `<div><small>${esc(r)}</small><b>${esc(v)}</b></div>` : '';
        const modulos = modulosPorPerfil.get(p.perfil);
        const modulosTxt = modulos && modulos.size ? Array.from(modulos).sort().join(', ') : 'Nenhum';
        const cabecalho = typeof window.rzSheetCabecalho === 'function'
            ? window.rzSheetCabecalho(p.nome || '(sem nome)', p.perfil ? capitalizar(p.perfil) : 'Sem perfil')
            : `<div class="rz-sh-h"><h3>${esc(p.nome || '(sem nome)')}</h3></div>`;
        const sheet = window.abrirSheet(cabecalho + `
            <div class="rz-sh-b">
                <div class="rz-card">
                    <div class="rz-card-h"><h3>Dados</h3><button type="button" data-acao="ficha-editar" class="rz-more" aria-label="Editar"><svg data-lucide="pencil"></svg></button></div>
                    <div class="rz-kv">
                        ${kv('E-mail', p.email)}
                        ${kv('WhatsApp', p.whatsapp)}
                        ${kv('Função na empresa', p.funcao)}
                        ${p.percentualCotasEmpresa != null ? kv('% de cotas', String(p.percentualCotasEmpresa).replace('.', ',') + '%') : ''}
                        ${kv('Acesso a módulos', modulosTxt)}
                        ${kv('Acesso ao sistema', p.userId ? 'Sim' : 'Não')}
                    </div>
                </div>
                <div class="rz-card rz-list"><div class="rz-row rz-link" role="button" tabindex="0" data-acao="ficha-contas">
                    <div class="rz-ic"><svg data-lucide="wallet"></svg></div>
                    <div class="rz-tx"><b>Contas</b><span>${esc(p.perfil === 'master' ? 'Vê todas as contas' : ESCOPO_CONTAS_ROTULO[p.escopoContas] || '')}</span></div>
                    <svg data-lucide="chevron-right" class="rz-chev"></svg>
                </div></div>
            </div>`);
        sheet.querySelector('[data-acao="ficha-editar"]')?.addEventListener('click', () => abrirFormPessoaSheet(p.id));
        sheet.querySelector('[data-acao="ficha-contas"]')?.addEventListener('click', () => abrirContasPessoaSheet(p.id));
        icones();
    }

    // ---------------------------------------------------------------
    // SHEET DE AÇÕES (⋮) — hub central: editar, perfil, comunicações,
    // acessos recentes, acesso ao sistema, excluir. Mesma ordenação de
    // abrirSheetAcoes (IA no topo · normal · destrutiva por último).
    // ---------------------------------------------------------------
    function abrirAcoesPessoa(id) {
        const p = pessoas.find(x => x.id === id);
        if (!p) return;
        if (typeof window.abrirSheetAcoes !== 'function') { onToast?.(AVISO_SO_APP, 'info'); return; }
        const ehMaster = p.perfil === 'master';
        // Dados básicos do master só editáveis pelo próprio master —
        // ninguém mais, nem admin (mesma trava de sempre).
        const perfilTravado = ehMaster && perfilLogado !== 'master';
        // Perfil master nunca é editável pela tela, nem pelo próprio
        // master — só direto no banco (mesma trava de sempre).
        const protegidoExclusao = p.perfil === 'admin' || p.perfil === 'master';
        const temLogin = !!p.userId;

        const acoes = [
            { icone: 'id-card', titulo: 'Abrir ficha', sub: 'Dados e acessos', aoTocar: () => abrirFichaPessoa(p.id) },
        ];
        if (!perfilTravado) {
            acoes.push({ icone: 'pencil', titulo: 'Editar dados', codigo: 'pessoas.editar', aoTocar: () => abrirFormPessoaSheet(p.id) });
        } else {
            acoes.push({ icone: 'lock', titulo: 'Dados protegidos do master', sub: 'Só o próprio master edita', aoTocar: () => {} });
        }
        if (!ehMaster) {
            acoes.push({ icone: 'shield', titulo: 'Perfil de acesso', sub: p.perfil ? capitalizar(p.perfil) : 'Sem perfil', codigo: 'pessoas.editar', aoTocar: () => alterarPerfilPessoa(p.id) });
        }
        if (proativasDisponiveis.length > 0) {
            // v2.1.0 — pra pessoa logada (a própria linha), abre a MESMA tela
            // "Minhas notificações" (index.html), que já junta alertas +
            // comunicações da Raiz numa peça só; pra outra pessoa (fluxo
            // admin), a Raiz não se aplica (é conta de terceiro) — fica só
            // o Sheet local de alertas.
            acoes.push({ icone: 'bell', titulo: 'Comunicações', sub: 'Avisos automáticos por WhatsApp', aoTocar: () => {
                if (id === pessoaId && typeof window.abrirPreferenciasComunicacao === 'function') { window.abrirPreferenciasComunicacao(); return; }
                abrirComunicacoesPessoaSheet(p.id);
            } });
        }
        acoes.push({ icone: 'wallet', titulo: 'Contas', sub: 'Contas dela e quais contas ela vê', codigo: 'financeiro.contas.ver', aoTocar: () => abrirContasPessoaSheet(p.id) }); // v1.204.0
        if (autoFiltro && typeof carregarAcessosDaPessoa === 'function') {
            acoes.push({ icone: 'history', titulo: 'Acessos recentes', aoTocar: () => abrirAcessosPessoaSheet(p.id) });
        }
        if (!perfilTravado) {
            if (temLogin) {
                // v2.1.0 — pedido explícito: remover acesso também trava pra
                // admin, não só master (mesma proteção de "Excluir pessoa").
                if (protegidoExclusao) {
                    acoes.push({ icone: 'lock', titulo: 'Acesso protegido', sub: 'Admin e master não perdem o acesso por aqui', aoTocar: () => {} });
                } else {
                    acoes.push({ icone: 'user-x', titulo: 'Remover acesso ao sistema', sub: 'A pessoa continua cadastrada', codigo: 'pessoas.editar', tipo: 'bad', aoTocar: () => desvincularAcessoPessoa(p.id) });
                }
            } else {
                acoes.push({ icone: 'user-check', titulo: 'Criar acesso', sub: 'Envia e-mail para definir senha', codigo: 'pessoas.editar', aoTocar: () => criarAcessoPessoa(p.id) });
                acoes.push({ icone: 'link', titulo: 'Vincular login existente', sub: 'Pelo e-mail de quem já entra no Raiz', codigo: 'pessoas.editar', aoTocar: () => vincularLoginPessoa(p.id) });
            }
        }
        if (protegidoExclusao) {
            acoes.push({ icone: 'lock', titulo: ehMaster ? 'Master não pode ser removido por aqui' : 'Admin não pode ser removido por aqui', sub: 'Fale com a Raiz', aoTocar: () => {} });
        } else {
            acoes.push({ icone: 'trash-2', titulo: 'Excluir pessoa', codigo: 'pessoas.excluir', tipo: 'bad', aoTocar: () => excluirPessoa(p.id) });
        }
        window.abrirSheetAcoes({ titulo: p.nome || '(sem nome)', sub: p.perfil ? capitalizar(p.perfil) : 'Sem perfil', acoes });
    }

    // ---------------------------------------------------------------
    // CONTAS DA PESSOA (v1.204.0, P4a) — regra toda no banco.
    // ---------------------------------------------------------------
    async function abrirContasPessoaSheet(id) {
        const p = pessoas.find(x => x.id === id);
        if (!p || typeof window.abrirSheet !== 'function') { onToast?.(AVISO_SO_APP, 'info'); return; }
        let res;
        try { res = await buscarContas(dbAuth, clienteId, true); }
        catch (err) { onToast?.('Não foi possível carregar as contas agora.', 'danger'); return; }
        if (!res.liberado) { rzBloqueio('financeiro.contas.ver'); return; }
        const minhas = (res.dados || []).filter(c => c.titular_tipo === 'pessoa' && c.pessoa_id === p.id);
        const ehMaster = p.perfil === 'master';
        const cab = typeof window.rzSheetCabecalho === 'function' ? window.rzSheetCabecalho('Contas', p.nome || '') : `<div class="rz-sh-h"><h3>Contas</h3></div>`;
        const vazio = `<div class="rz-card"><div class="rz-empty"><div class="rz-ic"><svg data-lucide="wallet"></svg></div><p>${esc(p.nome || 'Esta pessoa')} ainda não tem conta própria. Toque no "+" para criar.</p></div></div>`;
        const sheet = window.abrirSheet(cab + `
            <div class="rz-sh-b">
                <div class="rz-card rz-list"><div class="rz-row rz-link" role="button" tabindex="0" data-acao="contas-escopo">
                    <div class="rz-ic"><svg data-lucide="eye"></svg></div>
                    <div class="rz-tx"><b>Quem ela vê</b><span>${esc(ehMaster ? 'Todas as contas (master sempre vê todas)' : ESCOPO_CONTAS_ROTULO[p.escopoContas])}</span></div>
                    ${ehMaster ? '' : '<svg data-lucide="chevron-right" class="rz-chev"></svg>'}
                </div></div>
                <div class="rz-card-h" style="margin-top:6px"><h3>Contas dela</h3><button type="button" data-acao="contas-nova" class="rz-more" aria-label="Nova conta"><svg data-lucide="plus"></svg></button></div>
                ${minhas.length ? contasListaHtml(minhas) : vazio}
            </div>`, { empilhar: true });
        icones();
        const recarregar = () => { window.fecharSheet?.(); abrirContasPessoaSheet(p.id); };
        sheet.querySelector('[data-acao="contas-nova"]')?.addEventListener('click', () =>
            abrirFichaConta({ dbAuth, clienteId, fixarPessoaId: p.id, onToast, aoSalvar: recarregar }));
        sheet.querySelectorAll('[data-conta-id]').forEach(row => row.addEventListener('click', () => {
            const c = minhas.find(x => x.id === row.dataset.contaId);
            if (c) abrirAcoesConta({ dbAuth, clienteId, conta: c, fixarPessoaId: p.id, onToast, aoMudar: recarregar });
        }));
        sheet.querySelector('[data-acao="contas-escopo"]')?.addEventListener('click', async () => {
            if (ehMaster) return;
            if (rzBloqueio('financeiro.contas.escopo')) return;
            if (typeof window.rzEscolher !== 'function') return;
            const escolha = await window.rzEscolher({ titulo: 'Quem ela vê', sub: p.nome || '', opcoes: [
                { valor: 'propria_mais_empresa', titulo: 'As dela e as da empresa', sub: 'Padrão', icone: 'building-2' },
                { valor: 'propria', titulo: 'Só as dela', icone: 'user' },
                { valor: 'todas', titulo: 'Todas as contas', sub: 'Inclui as dos outros sócios', icone: 'users' },
            ] });
            if (!escolha || escolha === p.escopoContas) return;
            const { data, error } = await dbAuth.rpc('fn_pessoa_escopo_contas_definir', { p_cliente_id: clienteId, p_pessoa_alvo_id: p.id, p_escopo: escolha });
            if (error) { onToast?.(error.message, 'danger'); return; }
            onToast?.(data?.mensagem || 'Feito.', data?.ok ? 'success' : 'danger');
            if (data?.ok) { p.escopoContas = escolha; recarregar(); }
        });
    }

    // ---------------------------------------------------------------
    // SHEET DE FORMULÁRIO — dados básicos (nome/e-mail/whatsapp/função/
    // % de cotas). Perfil de acesso fica fora daqui de propósito (ação
    // própria no ⋮, mesmo padrão de sempre — perfil nunca é um campo de
    // formulário solto, é uma decisão protegida por catálogo).
    // ---------------------------------------------------------------
    function abrirFormPessoaSheet(id) {
        if (typeof window.abrirSheetForm !== 'function') { onToast?.(AVISO_SO_APP, 'info'); return; }
        const p = id ? pessoas.find(x => x.id === id) : null;
        const ehMaster = p?.perfil === 'master';
        const perfilTravado = ehMaster && perfilLogado !== 'master';
        const v = campo => esc((p && p[campo]) || '');
        const campo = (rot, campoId, val, tipo = 'text', extra = '') =>
            `<div class="rz-f"><label for="${campoId}">${rot}</label><input type="${tipo}" id="${campoId}" value="${val}" ${extra}></div>`;
        const dis = perfilTravado ? 'disabled' : '';
        window.abrirSheetForm({
            titulo: p ? 'Editar pessoa' : 'Nova pessoa',
            sub: p ? p.nome : 'Sócio ou usuário do sistema',
            rotuloSalvar: p ? 'Salvar' : 'Cadastrar',
            corpo: `
                ${campo('Nome *', 'pe-nome', v('nome'), 'text', `required ${dis}`)}
                <div class="rz-f2">
                    ${campo('E-mail', 'pe-email', v('email'), 'email', dis)}
                    ${campo('WhatsApp', 'pe-whatsapp', v('whatsapp'), 'tel', dis)}
                </div>
                ${campo('Função na empresa', 'pe-funcao', v('funcao'), 'text', dis)}
                ${campo('% de cotas', 'pe-pct', p?.percentualCotasEmpresa ?? '', 'number', `min="0" max="100" step="0.01" ${dis}`)}
                ${perfilTravado ? '<p class="rz-hint">Dados do master só podem ser alterados pelo próprio master.</p>' : ''}
            `,
            aoSalvar: (el) => salvarPessoaSheet(el, id || null),
        });
    }

    async function salvarPessoaSheet(el, id) {
        const g = campoId => (el.querySelector('#' + campoId)?.value || '').trim();
        const nome = g('pe-nome');
        if (!nome) { onToast?.('Informe o nome.', 'danger'); return false; }
        const pctRaw = g('pe-pct');
        const dados = {
            cliente_id: clienteId,
            nome,
            email: g('pe-email') || null,
            whatsapp: g('pe-whatsapp') || null,
            funcao: g('pe-funcao') || null,
            percentual_cotas_empresa: pctRaw !== '' ? parseFloat(pctRaw) : null,
        };
        if (id) {
            const { error } = await dbAuth.from('pessoas').update(dados).eq('id', id);
            if (error) throw error;
        } else {
            const { error } = await dbAuth.from('pessoas').insert(dados);
            if (error) throw error;
        }
        onToast?.(id ? 'Pessoa atualizada.' : 'Pessoa cadastrada.', 'success');
        registrarLog?.(id ? 'pessoas.editar' : 'pessoas.criar', { pessoaId: id });
        pessoas = await listarPessoas(dbAuth, clienteId);
        renderLista();
    }

    // ---------------------------------------------------------------
    // PERFIL DE ACESSO — decisão protegida, nunca um campo de form solto.
    // ---------------------------------------------------------------
    async function alterarPerfilPessoa(id) {
        const pessoa = pessoas.find(p => p.id === id);
        if (!pessoa) return;
        const novoPerfil = await escolherPerfilSheet('Perfil de acesso', pessoa.nome, pessoa.perfil || 'operador');
        if (!novoPerfil) return;
        try {
            const { error } = await dbAuth.from('pessoas').update({ perfil: novoPerfil.trim() }).eq('id', id);
            if (error) throw error;
            registrarLog?.('pessoas.perfil.alterar', { pessoaId: id, perfil: novoPerfil.trim() });
            onToast?.('Perfil atualizado.', 'success');
            pessoas = await listarPessoas(dbAuth, clienteId);
            renderLista();
        } catch (err) {
            onToast?.('Falha ao atualizar perfil: ' + err.message, 'danger');
        }
    }

    // ---------------------------------------------------------------
    // COMUNICAÇÕES (outra pessoa, fluxo admin) — v2.1.0: cada aviso salva
    // na hora ao ligar/desligar o toggle (ou trocar a frequência), mesmo
    // padrão visual/comportamental de "Comunicações da Raiz" em Minhas
    // notificações (index.html) — sem botão de salvar em lote. Pra pessoa
    // logada, o ⋮ abre window.abrirPreferenciasComunicacao() em vez desta
    // função (ver abrirAcoesPessoa) — essa junta Raiz + alertas.
    // ---------------------------------------------------------------
    async function salvarPreferenciaComunicacaoPessoa(pessoaAlvoId, codigo, habilitado, frequencia) {
        const { error } = await dbAuth.from('pessoa_preferencias_comunicacao').upsert([{
            cliente_id: clienteId, pessoa_id: pessoaAlvoId, funcionalidade_codigo: codigo,
            habilitado, frequencia, atualizado_em: new Date().toISOString(),
        }], { onConflict: 'pessoa_id,funcionalidade_codigo' });
        if (error) throw error;
        preferenciasMap.set(`${pessoaAlvoId}|${codigo}`, { habilitado, frequencia });
        registrarLog?.('pessoas.comunicacoes.salvar', { pessoaId: pessoaAlvoId, codigo, habilitado, frequencia });
    }

    function abrirComunicacoesPessoaSheet(id) {
        if (typeof window.abrirSheetForm !== 'function') { onToast?.(AVISO_SO_APP, 'info'); return; }
        const p = pessoas.find(x => x.id === id);
        if (!p) return;
        const semWhatsapp = !p.whatsapp;
        const linhaHtml = f => {
            const pref = preferenciasMap.get(`${p.id}|${f.codigo}`);
            const habilitado = pref ? pref.habilitado : true; // sem linha salva = padrão do sistema
            const frequencia = pref ? pref.frequencia : 'semanal';
            const opcoesHtml = FREQUENCIA_OPCOES.map(o => `<option value="${o.valor}" ${frequencia === o.valor ? 'selected' : ''}>${o.rotulo}</option>`).join('');
            return `
                <div class="rz-row rz-pref rz-pref-2l" data-linha-codigo="${esc(f.codigo)}">
                    <div class="rz-tx"><b>${esc(f.descricao)}</b></div>
                    <select class="pc-frequencia" data-codigo="${esc(f.codigo)}" aria-label="Frequência" ${habilitado ? '' : 'disabled'}>${opcoesHtml}</select>
                    <button type="button" role="switch" class="rz-switch pc-toggle" data-codigo="${esc(f.codigo)}" data-habilitado="${habilitado ? '1' : '0'}" aria-checked="${habilitado ? 'true' : 'false'}" aria-label="${esc(f.descricao)}"></button>
                </div>`;
        };
        window.abrirSheetForm({
            titulo: 'Comunicações', sub: p.nome, semRodape: true,
            corpo: (elCorpo) => {
                elCorpo.innerHTML = `
                    <p class="rz-desc">Pelo WhatsApp, pela manhã. Semanais saem às segundas; mensais, no dia 5.</p>
                    ${semWhatsapp ? '<p class="rz-desc" style="color:var(--warning);margin-top:6px">Sem WhatsApp cadastrado — os avisos não chegam até preencher o número.</p>' : ''}
                    <div>${proativasDisponiveis.length ? proativasDisponiveis.map(linhaHtml).join('') : '<p class="rz-desc" style="margin-top:8px">Nenhum aviso disponível no plano atual.</p>'}</div>
                `;
                elCorpo.querySelectorAll('.pc-toggle').forEach(btn => {
                    btn.addEventListener('click', async () => {
                        const codigo = btn.dataset.codigo;
                        const novoHabilitado = btn.dataset.habilitado !== '1';
                        const sel = elCorpo.querySelector(`.pc-frequencia[data-codigo="${codigo}"]`);
                        const frequencia = sel ? sel.value : 'semanal';
                        btn.disabled = true;
                        try {
                            await salvarPreferenciaComunicacaoPessoa(p.id, codigo, novoHabilitado, frequencia);
                            btn.dataset.habilitado = novoHabilitado ? '1' : '0';
                            btn.setAttribute('aria-checked', novoHabilitado ? 'true' : 'false');
                            if (sel) sel.disabled = !novoHabilitado;
                        } catch (err) {
                            onToast?.('Não foi possível salvar: ' + err.message, 'danger');
                        } finally {
                            btn.disabled = false;
                        }
                    });
                });
                elCorpo.querySelectorAll('.pc-frequencia').forEach(sel => {
                    sel.addEventListener('change', async () => {
                        const codigo = sel.dataset.codigo;
                        const btn = elCorpo.querySelector(`.pc-toggle[data-codigo="${codigo}"]`);
                        const habilitado = btn ? btn.dataset.habilitado === '1' : true;
                        sel.disabled = true;
                        try {
                            await salvarPreferenciaComunicacaoPessoa(p.id, codigo, habilitado, sel.value);
                        } catch (err) {
                            onToast?.('Não foi possível salvar: ' + err.message, 'danger');
                        } finally {
                            sel.disabled = false;
                        }
                    });
                });
            },
        });
    }

    // ---------------------------------------------------------------
    // ACESSOS RECENTES — Sheet de leitura, lazy (LGPD — minimização: só
    // busca ao abrir).
    // ---------------------------------------------------------------
    async function abrirAcessosPessoaSheet(id) {
        if (typeof window.abrirSheet !== 'function') { onToast?.(AVISO_SO_APP, 'info'); return; }
        const p = pessoas.find(x => x.id === id);
        if (!p) return;
        const cabecalho = typeof window.rzSheetCabecalho === 'function' ? window.rzSheetCabecalho('Acessos recentes', p.nome) : `<div class="rz-sh-h"><h3>Acessos recentes</h3></div>`;
        const sheet = window.abrirSheet(cabecalho + `<div class="rz-sh-b"><div id="ap-lista">${(typeof window !== 'undefined' && typeof window.rzSkeleton === 'function' ? window.rzSkeleton('linhas', 3) : '<p class="rz-desc">Carregando…</p>')}</div></div>`);
        const listaEl = sheet.querySelector('#ap-lista');
        if (typeof carregarAcessosDaPessoa !== 'function') {
            if (listaEl) listaEl.innerHTML = '<div class="rz-empty"><p>Indisponível nesta tela.</p></div>';
            return;
        }
        try {
            const logs = await carregarAcessosDaPessoa(id);
            if (!listaEl) return;
            listaEl.innerHTML = (logs && logs.length)
                ? logs.map(l => `<div class="rz-row"><div class="rz-ic"><svg data-lucide="log-in"></svg></div><div class="rz-tx"><b>${esc(l.acao)}</b><span>${esc(new Date(l.criadoEm).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }))}</span></div></div>`).join('')
                : '<div class="rz-empty"><p>Nenhum acesso registrado ainda.</p></div>';
            icones();
        } catch (err) {
            if (listaEl) listaEl.innerHTML = '<div class="rz-empty"><p>Não foi possível carregar agora.</p></div>';
        }
    }

    // ---------------------------------------------------------------
    // ACESSO AO SISTEMA — criar/vincular/remover. Mesma lógica de
    // sempre, só a superfície (Sheet em vez de botão inline) mudou.
    // ---------------------------------------------------------------
    async function criarAcessoPessoa(id) {
        const pessoa = pessoas.find(p => p.id === id);
        if (!pessoa) return;
        if (!pessoa.email) { onToast?.('Esta pessoa não tem e-mail cadastrado. Preencha o e-mail antes de criar o acesso.', 'danger'); return; }
        if (pessoa.userId) { onToast?.('Esta pessoa já tem acesso ao sistema.', 'info'); return; }
        const perfilEscolhido = await escolherPerfilSheet('Perfil de acesso', pessoa.nome);
        if (!perfilEscolhido) return;
        const senhaAleatoria = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10).toUpperCase() + '!1';
        try {
            // Client TEMPORÁRIO, isolado (persistSession:false) — nunca
            // toca no localStorage da sessão de quem está usando a tela.
            const { createClient } = window.supabase;
            const clienteTemp = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

            const { data: signUpData, error: signUpError } = await clienteTemp.auth.signUp({ email: pessoa.email, password: senhaAleatoria });
            if (signUpError) { onToast?.('Falha ao criar acesso: ' + signUpError.message, 'danger'); return; }

            const { error: updateError } = await dbAuth.from('pessoas').update({ user_id: signUpData.user.id, perfil: perfilEscolhido.trim() }).eq('id', id);
            if (updateError) { onToast?.('Conta criada, mas falhou ao vincular à pessoa: ' + updateError.message, 'danger'); return; }

            await clienteTemp.auth.resetPasswordForEmail(pessoa.email, { redirectTo: window.location.href.split('?')[0].split('#')[0] });

            registrarLog?.('pessoas.acesso.criar', { pessoaId: id, nome: pessoa.nome, email: pessoa.email, perfil: perfilEscolhido.trim() });
            onToast?.('Acesso criado — e-mail de definição de senha enviado.', 'success');
            pessoas = await listarPessoas(dbAuth, clienteId);
            renderLista();
        } catch (err) {
            onToast?.('Falha ao criar acesso: ' + err.message, 'danger');
        }
    }

    async function vincularLoginPessoa(id) {
        const pessoaVinc = pessoas.find(p => p.id === id);
        const perfil = await escolherPerfilSheet('Perfil de acesso', 'Login vinculado manualmente');
        if (!perfil) return;
        if (typeof window.abrirSheetForm !== 'function') { onToast?.(AVISO_SO_APP, 'info'); return; }
        window.abrirSheetForm({
            titulo: 'Vincular login existente', sub: 'Pessoa que já entra no Raiz com um e-mail', rotuloSalvar: 'Vincular',
            // v1.202.0 (F0.3) — e-mail em vez do UUID do Supabase; a função do banco
            // confere quem pede (admin/master da empresa), acha o login e grava o log.
            corpo: `<div class="rz-f"><label for="vi-email">E-mail do login</label>
                <input type="email" id="vi-email" inputmode="email" autocomplete="off" value="${esc(pessoaVinc?.email || '')}" placeholder="nome@exemplo.com">
                <p class="rz-hint">O mesmo e-mail que a pessoa usa para entrar no Raiz.</p></div>`,
            aoSalvar: async (el) => {
                const email = (el.querySelector('#vi-email')?.value || '').trim();
                if (!email) { onToast?.('Informe o e-mail do login.', 'danger'); return false; }
                const { error } = await dbAuth.rpc('fn_pessoa_vincular_login_por_email', { p_pessoa_id: id, p_email: email, p_perfil: perfil.trim() });
                if (error) { onToast?.(error.message || 'Não consegui vincular o login.', 'danger'); return false; }
                onToast?.('Login vinculado.', 'success');
                pessoas = await listarPessoas(dbAuth, clienteId);
                renderLista();
            },
        });
    }

    async function desvincularAcessoPessoa(id) {
        // Trava dupla (já refletida em não oferecer a ação no Sheet, ver
        // abrirAcoesPessoa) — admin/master não perdem o acesso por aqui,
        // mesma proteção de excluirPessoa, contra remover o próprio
        // administrador por engano mesmo se chamado por outro caminho.
        const pessoa = pessoas.find(p => p.id === id);
        if (pessoa && (pessoa.perfil === 'admin' || pessoa.perfil === 'master')) {
            onToast?.('Usuários admin/master não podem ter o acesso removido por aqui — proteção proposital.', 'danger');
            return;
        }
        // v1.203.0 (F0.2b) — tirar o acesso é reversível (a pessoa continua cadastrada):
        // sem pergunta, com "Desfazer" no aviso, que devolve login e perfil.
        const acessoAntes = pessoa ? { user_id: pessoa.userId ?? pessoa.user_id ?? null, perfil: pessoa.perfil ?? null } : null;
        try {
            const { error } = await dbAuth.from('pessoas').update({ user_id: null, perfil: null }).eq('id', id);
            if (error) throw error;
            registrarLog?.('pessoas.acesso.revogar', { pessoaId: id });
            const desfazer = acessoAntes && acessoAntes.user_id ? async () => {
                const { error: errVolta } = await dbAuth.from('pessoas').update(acessoAntes).eq('id', id);
                if (errVolta) { onToast?.('Não consegui desfazer: ' + errVolta.message, 'danger'); return; }
                registrarLog?.('pessoas.acesso.aprovar', { pessoaId: id, perfil: acessoAntes.perfil, via: 'desfazer' });
                onToast?.('Acesso devolvido.', 'success');
                pessoas = await listarPessoas(dbAuth, clienteId);
                renderLista();
            } : null;
            if (desfazer) avisarComDesfazer('Acesso removido. A pessoa continua cadastrada.', desfazer); else onToast?.('Acesso removido.', 'success');
            pessoas = await listarPessoas(dbAuth, clienteId);
            renderLista();
        } catch (err) {
            onToast?.('Falha: ' + err.message, 'danger');
        }
    }

    async function excluirPessoa(id) {
        const pessoa = pessoas.find(p => p.id === id);
        if (!pessoa) return;
        // Trava dupla (já refletida em não oferecer a ação no Sheet, ver
        // abrirAcoesPessoa) — proteção contra remover o próprio
        // administrador/master por engano, mesmo se chamado por outro
        // caminho no futuro.
        if (pessoa.perfil === 'admin' || pessoa.perfil === 'master') {
            onToast?.('Usuários admin/master não podem ser excluídos por aqui — proteção proposital.', 'danger');
            return;
        }
        if (!await perguntar({ titulo: `Excluir ${pessoa.nome}?`, impacto: 'Não dá para desfazer. Se ela tiver login, o acesso ao sistema também sai.', destrutivo: true, rotuloConfirmar: 'Excluir pessoa' })) return;
        try {
            const { error } = await dbAuth.from('pessoas').delete().eq('id', id);
            if (error) throw error;
            pessoas = pessoas.filter(p => p.id !== id);
            registrarLog?.('pessoas.excluir', { pessoaId: id });
            onToast?.('Pessoa excluída.', 'success');
            renderLista();
        } catch (err) {
            onToast?.('Não consegui excluir: ' + (err.message || String(err)), 'danger');
        }
    }

    // -------- delegação de eventos, escopada ao container (não document —
    // evita colisão com outros módulos que também delegam) --------
    mountEl.addEventListener('click', (ev) => {
        const maisBtn = ev.target.closest('[data-acao="mais"]');
        if (maisBtn) { abrirAcoesPessoa(maisBtn.dataset.id); return; }
        const linha = ev.target.closest('[data-acao="ficha"]');
        if (linha) { abrirFichaPessoa(linha.dataset.id); return; }
    });

    document.getElementById('cp-btn-nova')?.addEventListener('click', () => abrirFormPessoaSheet(null));
}
