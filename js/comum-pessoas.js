// ============================================================================
// comum-pessoas.js — Raiz Patrimônio · Administração compartilhada
// Versão: 1.216.0 · 19/10/2026
//
// v1.216.0 (19/10/2026, sessão 20261018-2344-temas, demanda 91a30125; FICHA_ROTINAS_E_ALERTAS_POR_TEMA_RAIZ v1.0.0, de acordo do Nicola 18/10 23:44) — avisos AGRUPADOS POR TEMA (Fiscal, Contador, Cartões…). buscarProativasDisponiveis
// passa a listar os avisos de verdade: toda funcionalidade de um tipo de alerta ativo (entra o índice publicado, que não
// era 'proativa') + os avisos da Raiz (convite diário, andamento de solicitação); recurso que não é aviso (NFS-e automática)
// sai. Cada aviso traz o tema e se o tema está LIGADO NA EMPRESA (Minha empresa › Rotinas): desligado na empresa aparece
// apagado, sem interruptor. A frequência só aparece no convite diário (é o único envio que ela muda).
// Versão anterior: 1.215.0 · 16/10/2026
//
// v1.215.0 (16/10/2026, sessão 20261016-0053-carga-silva, demanda 9404081c; pedido do Nicola 16/10 00:57) — Perfil de acesso,
// Criar acesso e Vincular login existente voltam a funcionar: a escolha do perfil pedia a coluna "nome", que a tabela perfis
// não tem; o select falhava, a lista vinha vazia e aparecia o aviso enganoso "só dentro do app principal". Agora lê
// codigo/descricao, mostra o nome do perfil pelo rótulo e, se falhar, diz que não carregou os perfis.
// Versão anterior: 1.214.0 · 14/10/2026
//
// v1.214.0 (14/10/2026, sessão 20261014-2215-ajustes-9d, demanda a05ad2ee; teste do Nicola 14/10 22:12 — "no menu ativos achei
// uns itens ainda grandinhos") — textos dentro de condição (sub/titulo com ? :) e dicionários de descrição também no limite
// da D6 (ação 24, descrição 28). Nada de comportamento mudou.
// Versão anterior: 1.213.0 · 14/10/2026
//
// v1.213.0 (14/10/2026, sessão 20261014-2145-onda9c-textos, demanda a05ad2ee; onda 9c do estudo PROTOTIPO_UX_DENSIDADE_RAMOS_RAIZ
// v1.2.0, D6 seção 10) — textos no limite: ação até 24 caracteres, descrição até 28, aviso até 40 com o resultado e tela
// vazia em 1 frase de até 40. A explicação longa fica na confirmação, quando existe. Nada de comportamento mudou.
// Versão anterior: 1.212.0 · 14/10/2026
//
// v1.212.0 (14/10/2026, sessão 20261014-0010-ativo-pessoa, demanda d6a6f577; de acordo do Nicola 14/10 00:08) — ações da
// pessoa ganham "Ativo da pessoa": abre o ativo vida ligado a ela; sem ativo, oferece ligar a um ativo vida que ainda
// não tem pessoa (fn_ativo_pessoa_vincular) ou criar o ativo dela já ligado (fn_ativo_pessoa_garantir). Não cria pessoa.
// --------------------------------------------------------------------------
// Versões anteriores (v1.211.0 … v1.211.0): CHANGELOG_MODULOS.md, na raiz do repositório — o
// gerar_versoes.py rola pra lá automaticamente tudo além das 5 versões
// mais recentes deste cabeçalho (VER-06).
export const VERSAO = '1.216.0'; // v-check (18/09/2026): lido por Dev › Versões — manter igual ao header
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
        ramoPadrao: row.ramo_padrao || null, // v1.209.0 — ramo em que a pessoa abre o app (null = Todo o patrimônio)
        parteRetiradas: row.parte_retiradas ?? null, // v1.210.0 — F13.8 (só leitura aqui)
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
        const [r1, r2, r3, r4, r5, r6] = await Promise.all([
            dbAuth.from('licencas').select('plano_codigo, data_expiracao').eq('cliente_id', clienteId).eq('status', 'ativo'),
            dbAuth.from('plano_funcionalidade').select('plano_codigo, funcionalidade_codigo'),
            dbAuth.from('funcionalidades').select('codigo, descricao, area, tipo').eq('ativo', true),
            dbAuth.from('alerta_tipos').select('funcionalidade_codigo, tema').eq('ativo', true),
            dbAuth.from('aviso_temas').select('codigo, nome, ordem, controle_empresa'),
            dbAuth.rpc('fn_empresa_temas_listar', { p_cliente_id: clienteId }),
        ]);
        const erro = [r1, r2, r3, r4, r5].find(r => r.error);
        if (erro) throw erro.error;

        // Só licenças vigentes (sem data de expiração, ou expirando no futuro).
        const planosVigentes = new Set((r1.data || [])
            .filter(l => !l.data_expiracao || l.data_expiracao > agora)
            .map(l => l.plano_codigo));
        const codigosLiberados = new Set((r2.data || [])
            .filter(pf => planosVigentes.has(pf.plano_codigo))
            .map(pf => pf.funcionalidade_codigo));
        // v1.216.0 — tema de cada aviso (catálogo de alertas) e estado do tema na empresa (Minha empresa › Rotinas)
        const temaDaFunc = new Map((r4.data || []).filter(a => a.funcionalidade_codigo).map(a => [a.funcionalidade_codigo, a.tema]));
        const temas = new Map((r5.data || []).map(t => [t.codigo, t]));
        const ligadoEmpresa = new Map(((r6 && !r6.error && r6.data) || []).map(t => [t.tema, t.alertas_ligados]));

        return (r3.data || [])
            .filter(f => codigosLiberados.has(f.codigo))
            .filter(f => temaDaFunc.has(f.codigo) || (f.tipo === 'proativa' && f.codigo.startsWith('alertar.')))
            .map(f => {
                const tema = temaDaFunc.get(f.codigo) || 'raiz';
                const t = temas.get(tema) || { nome: 'Raiz', ordem: 999, controle_empresa: false };
                return { ...f, tema, temaNome: t.nome, temaOrdem: t.ordem,
                         empresaLigada: !t.controle_empresa || ligadoEmpresa.get(tema) !== false,
                         temFrequencia: f.codigo === 'alertar.consolidado_carteira' };
            })
            .sort((x, y) => x.temaOrdem - y.temaOrdem || x.descricao.localeCompare(y.descricao));
    } catch (err) {
        console.warn('[comum-pessoas] Falha ao calcular proativas disponíveis por licença (seção de comunicações fica oculta):', err.message);
        return [];
    }
}

// v1.216.0 — lista de avisos agrupada por tema. `linhaHtml(f)` desenha cada aviso (cada tela tem as suas classes).
export function htmlAvisosPorTema(lista, linhaHtml) {
    const grupos = [];
    for (const f of lista) {
        let g = grupos.find(x => x.tema === f.tema);
        if (!g) { g = { tema: f.tema, nome: f.temaNome, itens: [] }; grupos.push(g); }
        g.itens.push(f);
    }
    const escT = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    return grupos.map(g => `<p class="rz-desc" style="margin:14px 0 2px;font-weight:700;color:var(--ink)">${escT(g.nome)}</p>`
        + g.itens.map(linhaHtml).join('')).join('');
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

    // v1.207.0 (etapa 6 · E) — quem vê todo mundo ganha a barra digitável e os chips por perfil (padrão de Partes).
    const comBusca = podeGerenciarOutras && typeof window !== 'undefined' && typeof window.rzBuscaInline === 'function';
    mountEl.innerHTML = `
        ${comBusca ? `<div class="rz-topo">
            <label class="rz-search rz-search-in"><svg data-lucide="search"></svg><input type="search" id="cp-busca-q" class="rz-raw" placeholder="Buscar nome, e-mail ou função" enterkeyhint="search" autocomplete="off" aria-label="Buscar pessoa"></label>
            <button type="button" id="cp-btn-nova" class="rz-ico-btn rz-primary" aria-label="Nova pessoa" title="Nova pessoa"><svg data-lucide="plus"></svg></button>
        </div>
        <div class="rz-chips" id="cp-chips" role="tablist" aria-label="Perfil" hidden></div>` : `<div class="rz-tabhead">
            <p>${autoFiltro && !podeVerTodas ? 'Seu cadastro, seus avisos e seus acessos recentes.' : 'Cadastro unificado de sócios e usuários do sistema — quem tem acesso ao app e a divisão societária da empresa.'}</p>
            ${podeGerenciarOutras ? '<button type="button" id="cp-btn-nova" class="rz-ico-btn rz-primary" aria-label="Nova pessoa" title="Nova pessoa"><svg data-lucide="plus"></svg></button>' : ''}
        </div>`}
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
            // perfis não tem coluna nome: pedir uma coluna que não existe faz o select falhar inteiro e a lista vir vazia (dem 9404081c)
            const { data, error } = await dbAuth.from('perfis').select('codigo, descricao, protegido, escopo').eq('escopo', 'empresa').order('codigo');
            if (error) { onToast?.('Não consegui carregar os perfis de acesso.', 'danger'); return null; }
            perfisCache = data || [];
        }
        const lista = perfisCache.filter(p => !p.protegido || perfilLogado === 'master');
        if (!lista.length) { onToast?.('Nenhum perfil disponível para você dar.', 'info'); return null; }
        if (typeof window.abrirSheetAcoes !== 'function') {
            onToast?.(AVISO_SO_APP, 'info'); return null; // v1.203.0 (F0.2b) — sem diálogo nativo; fora do app não há Sheet
        }
        return new Promise(resolve => {
            let escolhido = null;
            window.abrirSheetAcoes({ titulo, sub, acoes: lista.map(p => ({
                icone: p.protegido ? 'shield' : 'user', titulo: rotuloPerfil(p.codigo), sub: p.descricao || '',
                aoTocar: () => { escolhido = p.codigo; resolve(p.codigo); },
            })) });
            // fechar sem escolher → null (o sheet não tem hook de fechar aqui: usa polling leve)
            const iv = setInterval(() => { const aberto = document.getElementById('rz-veil')?.classList.contains('rz-on'); if (escolhido !== null || !aberto) { clearInterval(iv); if (escolhido === null) resolve(null); } }, 300);
        });
    }
    let proativasDisponiveis = [];
    let preferenciasMap = new Map();
    let controlaPartes = false; // v1.210.0 — F13.8
    try {
        [pessoas, modulosPorPerfil, proativasDisponiveis, preferenciasMap, controlaPartes] = await Promise.all([
            listarPessoas(dbAuth, clienteId),
            buscarModulosPorPerfil(dbAuth),
            buscarProativasDisponiveis(dbAuth, clienteId),
            buscarPreferenciasComunicacao(dbAuth, clienteId),
            dbAuth.from('clientes').select('controla_partes_retiradas').eq('id', clienteId).maybeSingle().then(r => !!r?.data?.controla_partes_retiradas, () => false),
        ]);
    } catch (err) {
        console.warn('[comum-pessoas] Falha ao carregar pessoas:', err.message);
        document.getElementById('cp-lista').innerHTML = '<div class="rz-empty"><p>Pessoas indisponíveis agora.</p></div>';
        return;
    }

    let filtroChip = 'todos', filtroTexto = ''; // v1.207.0
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
        // v1.207.0 — chips por perfil (só os que existem) + "Sem acesso"; o texto procura em nome, e-mail, WhatsApp e função
        const chipsEl = document.getElementById('cp-chips');
        const termo = filtroTexto.trim().toLowerCase();
        const bateTexto = (p) => !termo || [p.nome, p.email, p.whatsapp, p.funcao, rotuloPerfil(p.perfil)].some(c => (c || '').toString().toLowerCase().includes(termo));
        if (chipsEl) {
            // v1.208.0 — os chips são os perfis que existem; os números contam só quem bate com o texto da barra
            const comTexto = visiveis.filter(bateTexto);
            const cont = new Map();
            visiveis.forEach(p => { const k = p.perfil || '-'; if (!cont.has(k)) cont.set(k, 0); });
            comTexto.forEach(p => { const k = p.perfil || '-'; cont.set(k, cont.get(k) + 1); });
            const temSemAcesso = visiveis.some(p => !p.userId);
            const semAcesso = comTexto.filter(p => !p.userId).length;
            const ordem = ['master', 'admin', 'operador', 'consulta'];
            const perfis = [...cont.keys()].sort((x, y) => (ordem.indexOf(x) + 1 || 99) - (ordem.indexOf(y) + 1 || 99) || x.localeCompare(y));
            const chips = [['todos', 'Todas', comTexto.length], ...perfis.map(k => [k, k === '-' ? 'Sem perfil' : rotuloPerfil(k), cont.get(k)]), ...(temSemAcesso ? [['sem-acesso', 'Sem acesso', semAcesso]] : [])];
            if (!chips.some(c => c[0] === filtroChip)) filtroChip = 'todos';
            chipsEl.innerHTML = chips.map(([k, r, n]) => `<button type="button" role="tab" class="rz-chip${filtroChip === k ? ' rz-on' : ''}" data-cp-chip="${esc(k)}" aria-selected="${filtroChip === k}">${esc(r)} <span class="rz-n">${n}</span></button>`).join('');
            chipsEl.hidden = visiveis.length < 2;
        }
        const filtradas = visiveis.filter(p => {
            if (filtroChip === 'sem-acesso' && p.userId) return false;
            if (filtroChip !== 'todos' && filtroChip !== 'sem-acesso' && (p.perfil || '-') !== filtroChip) return false;
            return bateTexto(p);
        });
        if (chipsEl && filtradas.length === 0 && visiveis.length > 0) {
            lista.innerHTML = `<div class="rz-empty"><div class="rz-ic"><svg data-lucide="search"></svg></div><p>${esc(termo ? `Ninguém com "${filtroTexto.trim()}".` : 'Ninguém neste filtro.')}</p></div>`;
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
        const comFicha = typeof window.abrirSheet === 'function';
        lista.innerHTML = (chipsEl ? filtradas : visiveis).map(p => {
            const ehMaster = p.perfil === 'master';
            const icone = ehMaster ? 'shield-check' : 'user';
            const fato = p.perfil ? rotuloPerfil(p.perfil) : 'Sem perfil';
            const contexto = p.funcao || 'Sem função definida';
            // v1.207.0 — status de acesso à direita. v1.208.0 — o toque abre a lista de ações (⋮), sem pressão longa
            const status = chipsEl ? statusAcesso(p) : '';
            return `
                <div class="rz-row rz-link" data-acao="ficha" data-id="${p.id}">
                    <div class="rz-ic"><svg data-lucide="${icone}"></svg></div>
                    <div class="rz-tx"><b>${esc(p.nome || '(sem nome)')}</b><span>${esc(fato)} · ${esc(contexto)}</span></div>
                    ${chipsEl && comFicha ? `<div class="rz-rt">${status}</div><svg data-lucide="ellipsis-vertical" class="rz-chev"></svg>`
                        : `<button type="button" data-acao="mais" data-id="${p.id}" class="rz-more" aria-label="Mais ações"><svg data-lucide="ellipsis-vertical"></svg></button>`}
                </div>`;
        }).join('');
        icones();
    }
    function rotuloPerfil(k) { return ({ master: 'Master', admin: 'Administrador', operador: 'Operador', consulta: 'Consulta' })[k] || (k ? capitalizar(k) : 'Sem perfil'); }
    function statusAcesso(p) {
        const rs = typeof window.renderStatus === 'function' ? window.renderStatus : (s, x) => `<span class="rz-st rz-${s}">${esc(x)}</span>`;
        return p.userId ? rs('ok', 'Acessa') : rs('neu', 'Sem acesso');
    }
    renderLista();

    // ---------------------------------------------------------------
    // FICHA — leitura (Sheet), igual ao padrão de abrirFichaParte.
    // ---------------------------------------------------------------
    // v1.207.0 (etapa 6 · E; v1.208.0: grupos da lista de ações) — Dados · Acesso · Comunicação · Atividade. As ações são as do ⋮
    // (abrirAcoesPessoa), distribuídas por assunto, com as mesmas travas e a mesma checagem de acesso (codigo).
    // v1.209.0 (fase 5) — ramos ativos e contratados, na ordem do catálogo (index: rzRamoLiberado/rzRamoInfo)
    function ramosDaEmpresa() {
        if (typeof window.rzRamoLiberado !== 'function') return [];
        return ['imoveis', 'familia', 'outros', 'agro', 'pecuaria', 'varejo', 'investimentos'].filter(c => window.rzRamoLiberado(c));
    }
    async function escolherRamoPadrao(p) {
        if (typeof window.rzEscolher !== 'function') return;
        const opcoes = [{ valor: 'tudo', titulo: 'Todo o patrimônio', icone: 'layers' }]
            .concat(ramosDaEmpresa().map(c => ({ valor: c, titulo: window.rzNomeRamo?.(c) || c, icone: window.rzRamoInfo?.(c)?.icone || 'circle' })));
        const escolha = await window.rzEscolher({ titulo: 'Abrir o app em', sub: p.nome || '', opcoes });
        if (!escolha || escolha === (p.ramoPadrao || 'tudo')) return;
        const { data, error } = await dbAuth.rpc('fn_pessoa_ramo_padrao_definir', { p_cliente_id: clienteId, p_pessoa_alvo_id: p.id, p_ramo: escolha === 'tudo' ? null : escolha });
        if (error) { onToast?.(error.message, 'danger'); return; }
        onToast?.(data?.mensagem || 'Feito.', data?.ok ? 'success' : 'danger');
        if (data?.ok) { p.ramoPadrao = escolha === 'tudo' ? null : escolha; renderLista(); }
    }
    function acoesFichaPessoa(p) {
        const ehMaster = p.perfil === 'master';
        const perfilTravado = ehMaster && perfilLogado !== 'master';
        const protegidoExclusao = p.perfil === 'admin' || p.perfil === 'master';
        const temLogin = !!p.userId;
        const dados = [], acesso = [], comunicacao = [], atividade = [];
        if (!perfilTravado) dados.push({ icone: 'pencil', titulo: 'Editar dados', sub: 'Contato, função e cotas', codigo: 'pessoas.editar', aoTocar: () => abrirFormPessoaSheet(p.id) });
        else dados.push({ icone: 'lock', titulo: 'Dados do master', sub: 'Só o próprio master edita', aoTocar: null });
        if (protegidoExclusao) dados.push({ icone: 'lock', titulo: ehMaster ? 'Master protegido' : 'Admin protegido', sub: 'Fale com a Raiz', aoTocar: null });
        else dados.push({ icone: 'trash-2', titulo: 'Excluir pessoa', codigo: 'pessoas.excluir', tipo: 'bad', aoTocar: () => excluirPessoa(p.id) });
        if (!ehMaster) acesso.push({ icone: 'shield', titulo: 'Perfil de acesso', sub: rotuloPerfil(p.perfil), codigo: 'pessoas.editar', aoTocar: () => alterarPerfilPessoa(p.id) });
        else acesso.push({ icone: 'shield-check', titulo: 'Perfil de acesso', sub: 'Master — não muda pela tela', aoTocar: null });
        // v1.209.0 (fase 5, dem 680ee9f8) — ramo em que a pessoa abre o app; ela mesma ou admin/master; só com 2+ ramos contratados
        if (temLogin && (p.id === pessoaId || ['admin', 'master', 'master_plataforma'].includes(perfilLogado)) && ramosDaEmpresa().length > 1) {
            acesso.push({ icone: 'layers', titulo: 'Abrir o app em', sub: p.ramoPadrao ? (window.rzNomeRamo?.(p.ramoPadrao) || p.ramoPadrao) : 'Todo o patrimônio', codigo: 'pessoas.editar', aoTocar: () => escolherRamoPadrao(p) });
        }
        dados.push({ icone: 'heart-pulse', titulo: 'Ativo da pessoa', sub: 'Ligar ou criar o ativo', codigo: 'cofre.ativos.criar', aoTocar: () => abrirAtivoDaPessoa(p) }); // v1.212.0 (d6a6f577)
        acesso.push({ icone: 'wallet', titulo: 'Contas que vê', sub: ehMaster ? 'Vê todas as contas' : (ESCOPO_CONTAS_ROTULO[p.escopoContas] || 'Contas dela e quais contas ela vê'), codigo: 'financeiro.contas.ver', aoTocar: () => abrirContasPessoaSheet(p.id) });
        if (!perfilTravado) {
            if (temLogin) {
                if (p.whatsapp) acesso.push({ icone: 'message-circle', titulo: 'Convidar pelo WhatsApp', sub: 'Com o endereço do app', aoTocar: () => convidarPessoaWhatsapp(p) });
                if (protegidoExclusao) acesso.push({ icone: 'lock', titulo: 'Acesso protegido', sub: 'Admin e master', aoTocar: null });
                else acesso.push({ icone: 'user-x', titulo: 'Remover acesso', sub: 'A pessoa continua cadastrada', codigo: 'pessoas.editar', tipo: 'bad', aoTocar: () => desvincularAcessoPessoa(p.id) });
            } else {
                acesso.push({ icone: 'user-check', titulo: 'Criar acesso', sub: 'E-mail para criar a senha', codigo: 'pessoas.editar', aoTocar: () => criarAcessoPessoa(p.id) });
                acesso.push({ icone: 'link', titulo: 'Vincular login existente', sub: 'Pelo e-mail de quem já entra', codigo: 'pessoas.editar', aoTocar: () => vincularLoginPessoa(p.id) });
            }
        }
        if (proativasDisponiveis.length > 0) {
            comunicacao.push({ icone: 'bell', titulo: 'Avisos no WhatsApp', sub: p.whatsapp ? 'Quais avisos e quando' : 'Sem WhatsApp cadastrado', aoTocar: () => {
                if (p.id === pessoaId && typeof window.abrirPreferenciasComunicacao === 'function') { window.abrirPreferenciasComunicacao(); return; }
                abrirComunicacoesPessoaSheet(p.id);
            } });
        }
        if (autoFiltro && typeof carregarAcessosDaPessoa === 'function') {
            atividade.push({ icone: 'history', titulo: 'Acessos recentes', sub: 'Últimas entradas no app', aoTocar: () => abrirAcessosPessoaSheet(p.id) });
        }
        return { dados, acesso, comunicacao, atividade };
    }
    function convidarPessoaWhatsapp(p) {
        const d = String(p.whatsapp || '').replace(/\D/g, '');
        const numero = d.length >= 10 && d.length <= 11 ? '55' + d : d;
        const primeiro = (p.nome || '').trim().split(/\s+/)[0] || '';
        const empresa = (typeof CONFIG_CLIENTE !== 'undefined' && CONFIG_CLIENTE && CONFIG_CLIENTE.nomeEmpresa) || 'a empresa'; // global do index (let), não window
        const texto = `Olá${primeiro ? ', ' + primeiro : ''}! Você tem acesso a ${empresa} no Raiz Patrimônio. Entre em https://app.raizpatrimonio.com.br com o seu e-mail${p.email ? ' (' + p.email + ')' : ''}. Se ainda não definiu a senha, toque em "Esqueci minha senha" na tela de entrada.`;
        if (typeof window.rzDev === 'function') window.rzDev('whatsapp', numero, texto);
        else window.open('https://wa.me/' + numero + '?text=' + encodeURIComponent(texto), '_blank', 'noopener');
    }
    // Ficha de leitura (a de antes da v1.207.0) — aberta por "Ver dados" na lista de ações.
    function abrirFichaPessoa(id) {
        const p = pessoas.find(x => x.id === id);
        if (!p || typeof window.abrirSheet !== 'function') { onToast?.(AVISO_SO_APP, 'info'); return; }
        const kv = (r, v) => v ? `<div><small>${esc(r)}</small><b>${esc(v)}</b></div>` : '';
        const modulos = modulosPorPerfil.get(p.perfil);
        const modulosTxt = modulos && modulos.size ? Array.from(modulos).sort().join(', ') : 'Nenhum';
        const cabecalho = typeof window.rzSheetCabecalho === 'function'
            ? window.rzSheetCabecalho(p.nome || '(sem nome)', p.perfil ? rotuloPerfil(p.perfil) : 'Sem perfil')
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
                        ${controlaPartes && p.parteRetiradas != null ? kv('Parte nas retiradas extraordinárias', Number(p.parteRetiradas).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + '%') : ''}
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
        // v1.208.0 (Nicola 10/10 23:50) — no app, a lista de ações vem em grupos por assunto; "Ver dados" abre a ficha
        if (document.getElementById('cp-chips')) {
            const g = acoesFichaPessoa(p);
            const semAcao = (lista) => lista.map(a => (typeof a.aoTocar === 'function' ? a : { ...a, aoTocar: () => {} }));
            const grupos = [
                { titulo: 'Dados', acoes: semAcao([{ icone: 'id-card', titulo: 'Ver dados', sub: 'Contato, função e cotas', aoTocar: () => abrirFichaPessoa(p.id) }, ...g.dados]) },
                { titulo: 'Acesso', acoes: semAcao(g.acesso) },
                { titulo: 'Comunicação', acoes: semAcao(g.comunicacao) },
                { titulo: 'Atividade', acoes: semAcao(g.atividade) },
            ].filter(x => x.acoes.length);
            window.abrirSheetAcoes({ titulo: p.nome || '(sem nome)', sub: `${rotuloPerfil(p.perfil)}${p.funcao ? ' · ' + p.funcao : ''}`, grupos });
            return;
        }
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
            acoes.push({ icone: 'lock', titulo: 'Dados do master', sub: 'Só o próprio master edita', aoTocar: () => {} });
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
            acoes.push({ icone: 'bell', titulo: 'Comunicações', sub: 'Avisos no WhatsApp', aoTocar: () => {
                if (id === pessoaId && typeof window.abrirPreferenciasComunicacao === 'function') { window.abrirPreferenciasComunicacao(); return; }
                abrirComunicacoesPessoaSheet(p.id);
            } });
        }
        acoes.push({ icone: 'wallet', titulo: 'Contas', sub: 'As dela e as que vê', codigo: 'financeiro.contas.ver', aoTocar: () => abrirContasPessoaSheet(p.id) }); // v1.204.0
        if (autoFiltro && typeof carregarAcessosDaPessoa === 'function') {
            acoes.push({ icone: 'history', titulo: 'Acessos recentes', aoTocar: () => abrirAcessosPessoaSheet(p.id) });
        }
        if (!perfilTravado) {
            if (temLogin) {
                // v2.1.0 — pedido explícito: remover acesso também trava pra
                // admin, não só master (mesma proteção de "Excluir pessoa").
                if (protegidoExclusao) {
                    acoes.push({ icone: 'lock', titulo: 'Acesso protegido', sub: 'Admin e master', aoTocar: () => {} });
                } else {
                    acoes.push({ icone: 'user-x', titulo: 'Remover acesso', sub: 'A pessoa continua cadastrada', codigo: 'pessoas.editar', tipo: 'bad', aoTocar: () => desvincularAcessoPessoa(p.id) });
                }
            } else {
                acoes.push({ icone: 'user-check', titulo: 'Criar acesso', sub: 'E-mail para criar a senha', codigo: 'pessoas.editar', aoTocar: () => criarAcessoPessoa(p.id) });
                acoes.push({ icone: 'link', titulo: 'Vincular login existente', sub: 'Pelo e-mail de quem já entra', codigo: 'pessoas.editar', aoTocar: () => vincularLoginPessoa(p.id) });
            }
        }
        if (protegidoExclusao) {
            acoes.push({ icone: 'lock', titulo: ehMaster ? 'Master protegido' : 'Admin protegido', sub: 'Fale com a Raiz', aoTocar: () => {} });
        } else {
            acoes.push({ icone: 'trash-2', titulo: 'Excluir pessoa', codigo: 'pessoas.excluir', tipo: 'bad', aoTocar: () => excluirPessoa(p.id) });
        }
        window.abrirSheetAcoes({ titulo: p.nome || '(sem nome)', sub: p.perfil ? capitalizar(p.perfil) : 'Sem perfil', acoes });
    }

    // ---------------------------------------------------------------
    // CONTAS DA PESSOA (v1.204.0, P4a) — regra toda no banco.
    // ---------------------------------------------------------------
    // v1.212.0 (14/10/2026, demanda d6a6f577) — ativo vida da pessoa: abre se já existe; senão oferece ligar a um ativo
    // vida sem pessoa (fn_ativo_pessoa_vincular) ou criar o ativo dela (fn_ativo_pessoa_garantir). Não cria pessoa.
    async function abrirAtivoDaPessoa(p) {
        const abrir = (id) => { window.fecharSheet?.(); if (typeof window.switchTab === 'function') window.switchTab('tab-ativos'); setTimeout(() => window.abrirFichaAtivoNoChip?.(id, 'resumo'), 120); };
        const { data: ja, error: e1 } = await dbAuth.from('cofre_ativos').select('id').eq('cliente_id', clienteId).eq('entidade_origem_tipo', 'pessoa').eq('entidade_origem_id', p.id).neq('status', 'arquivado').maybeSingle();
        if (e1) { onToast?.(e1.message, 'danger'); return; }
        if (ja?.id) { abrir(ja.id); return; }
        const { data: soltos } = await dbAuth.from('cofre_ativos').select('id, nome_exibicao').eq('cliente_id', clienteId).eq('tipo_ativo', 'vida').eq('status', 'ativo').is('entidade_origem_tipo', null).order('nome_exibicao');
        const opcoes = (soltos || []).map(a => ({ valor: a.id, titulo: `Ligar a ${a.nome_exibicao}`, sub: 'Ativo já existente', icone: 'link' }))
            .concat([{ valor: '__criar', titulo: `Criar o ativo de ${p.nome}`, sub: 'Novo, já ligado', icone: 'plus' }]);
        const v = typeof window.rzEscolher === 'function' ? await window.rzEscolher({ titulo: `${p.nome} ainda não tem ativo`, opcoes }) : '__criar';
        if (!v) return;
        const r = v === '__criar'
            ? await dbAuth.rpc('fn_ativo_pessoa_garantir', { p_cliente_id: clienteId, p_titular_pessoa_id: p.id })
            : await dbAuth.rpc('fn_ativo_pessoa_vincular', { p_cliente_id: clienteId, p_ativo_id: v, p_titular_pessoa_id: p.id });
        if (r.error || !r.data?.ok) { onToast?.(r.error?.message || r.data?.mensagem || 'Não foi possível.', 'danger'); return; }
        onToast?.(v === '__criar' ? 'Ativo criado e ligado.' : 'Pessoa ligada ao ativo.', 'success');
        abrir(r.data.id || v);
    }

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
        const vazio = `<div class="rz-card"><div class="rz-empty"><div class="rz-ic"><svg data-lucide="wallet"></svg></div><p>${esc(p.nome || 'Esta pessoa')} ainda não tem conta própria. Crie no ativo dela › Controles › + › "Conta ou cartão".</p></div></div>`;
        const sheet = window.abrirSheet(cab + `
            <div class="rz-sh-b">
                <div class="rz-card rz-list"><div class="rz-row rz-link" role="button" tabindex="0" data-acao="contas-escopo">
                    <div class="rz-ic"><svg data-lucide="eye"></svg></div>
                    <div class="rz-tx"><b>Quem ela vê</b><span>${esc(ehMaster ? 'Todas as contas (master sempre vê todas)' : ESCOPO_CONTAS_ROTULO[p.escopoContas])}</span></div>
                    ${ehMaster ? '' : '<svg data-lucide="chevron-right" class="rz-chev"></svg>'}
                </div></div>
                <div class="rz-card-h" style="margin-top:6px"><h3>Contas dela</h3></div>
                ${minhas.length ? contasListaHtml(minhas) : vazio}
            </div>`, { empilhar: true });
        icones();
        const recarregar = () => { window.fecharSheet?.(); abrirContasPessoaSheet(p.id); };
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
            if (!f.empresaLigada) return `
                <div class="rz-row rz-pref" style="opacity:.5" data-linha-codigo="${esc(f.codigo)}">
                    <div class="rz-tx"><b>${esc(f.descricao)}</b><span>Desligado na empresa</span></div>
                </div>`; // v1.216.0
            return `
                <div class="rz-row rz-pref${f.temFrequencia ? ' rz-pref-2l' : ''}" data-linha-codigo="${esc(f.codigo)}">
                    <div class="rz-tx"><b>${esc(f.descricao)}</b></div>
                    ${f.temFrequencia ? `<select class="pc-frequencia" data-codigo="${esc(f.codigo)}" aria-label="Frequência" ${habilitado ? '' : 'disabled'}>${opcoesHtml}</select>` : ''}
                    <button type="button" role="switch" class="rz-switch pc-toggle" data-codigo="${esc(f.codigo)}" data-habilitado="${habilitado ? '1' : '0'}" aria-checked="${habilitado ? 'true' : 'false'}" aria-label="${esc(f.descricao)}"></button>
                </div>`;
        };
        window.abrirSheetForm({
            titulo: 'Comunicações', sub: p.nome, semRodape: true,
            corpo: (elCorpo) => {
                elCorpo.innerHTML = `
                    <p class="rz-desc">Vale para o app e o WhatsApp.</p>
                    ${semWhatsapp ? '<p class="rz-desc" style="color:var(--warning);margin-top:6px">Sem WhatsApp: os avisos não chegam.</p>' : ''}
                    <div>${proativasDisponiveis.length ? htmlAvisosPorTema(proativasDisponiveis, linhaHtml) : '<p class="rz-desc" style="margin-top:8px">Nenhum aviso disponível no plano atual.</p>'}</div>
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
            titulo: 'Vincular login existente', sub: 'De quem já entra no Raiz', rotuloSalvar: 'Vincular',
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
        if (linha) { if (document.getElementById('cp-chips')) abrirAcoesPessoa(linha.dataset.id); else abrirFichaPessoa(linha.dataset.id); return; } // v1.208.0
    });

    document.getElementById('cp-btn-nova')?.addEventListener('click', () => abrirFormPessoaSheet(null));
    // v1.207.0 (etapa 6 · E) — barra digitável e chips por perfil
    if (comBusca) {
        window.rzBuscaInline('cp-busca-q', (v) => { filtroTexto = v || ''; renderLista(); });
        document.getElementById('cp-chips')?.addEventListener('click', (ev) => {
            const c = ev.target.closest('[data-cp-chip]'); if (!c) return;
            filtroChip = c.dataset.cpChip; renderLista();
        });
    }
}
