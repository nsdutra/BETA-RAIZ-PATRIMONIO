// ============================================================================
// comum-pessoas.js — Raiz Patrimônio · Administração compartilhada
// Versão: 1.201.0 · 18/09/2026
//
// v2.1.0 (COMUM_PESSOAS_VERSAO) / v1.201.0 (VERSAO, header) — 2 ajustes
// pedidos pelo Nicola em cima da reescrita v2.0.0:
//   1. "Remover acesso ao sistema" travava só pro master (perfilTravado) —
//      agora trava pra admin TAMBÉM (protegidoExclusao), mesma proteção
//      já usada em "Excluir pessoa". Reforçado com 2ª trava dentro de
//      desvincularAcessoPessoa() (mesmo padrão de excluirPessoa()).
//   2. "Comunicações", quando a linha é a PRÓPRIA pessoa logada, agora
//      abre window.abrirPreferenciasComunicacao() — a tela "Minhas
//      notificações" de index.html, redesenhada nesta mesma leva pra
//      salvar cada aviso na hora (toggle liga/desliga, sem botão de
//      salvar em lote) e usar o MESMO padrão visual nas duas seções
//      (Alertas e avisos automáticos · Comunicações da Raiz). Pra outra
//      pessoa (fluxo admin), continua abrindo abrirComunicacoesPessoaSheet()
//      local — só essa também ganhou o mesmo toggle com salvamento
//      imediato (a Raiz não se aplica a conta de terceiro, então essa
//      seção não entra aqui, só os avisos/alertas).
//
// Versão anterior: 1.200.0 · 18/09/2026
//
// v2.0.0 (COMUM_PESSOAS_VERSAO) / v1.200.0 (VERSAO, header) — pedido
// explícito do Nicola (18/09/2026): "A tela de pessoas ficou no formato
// antigo de leiaute, fora do padrão. Deve ser totalmente reescrita."
// REESCRITA TOTAL da camada de apresentação (render + interação). A
// camada de dados NÃO mudou — listarPessoas/buscarModulosPorPerfil/
// buscarProativasDisponiveis/buscarPreferenciasComunicacao/
// FREQUENCIA_OPCOES continuam com a mesma consulta e o mesmo formato de
// retorno (index.html "Minhas notificações", linha ~9219, importa 3
// delas direto — contrato preservado).
//
//   SAIU (gramática antiga, herdada do app-dev original, Tipo A):
//   - Cartão com expansão inline (toggle .hidden) + <input> nativos
//     sempre no DOM → virou Sheet de formulário (abrirFormPessoaSheet),
//     mesmo padrão do módulo Partes (index.html, abrirFormParteSheet).
//   - Botão único "Salvar pessoas" salvando TODOS os cartões de uma vez
//     (já apontado como frágil no changelog do v1.2.0 desta mesma
//     versão anterior — um re-render externo podia descartar edição não
//     salva) → cada pessoa salva por si, ao tocar "Salvar"/"Cadastrar"
//     no próprio Sheet. Sem "linha fantasma" pra pessoa nova: o "+"
//     abre o Sheet de nova pessoa direto — só existe 1 tipo de cadastro
//     aqui, mesmo padrão do "+" de Partes (não precisa de Sheet de
//     ações antes, só faz sentido pra "+" com mais de 1 opção, como em
//     Financeiro).
//   - Lápis/lixeira redondos (v1.4.0) e ⋮ solto → toda ação mora agora
//     no ⋮ único da linha (abrirAcoesPessoa · Sheet de ações), incluindo
//     Editar — "não existe terceiro ícone" (REGRAS_EXPERIENCIA §8).
//   - Badges de módulo (Imóveis/Cofre/Gestão) em cor Tailwind crua
//     (bg-blue-50 etc., achado antigo de UI/cor) saíram da linha (linha
//     não tem espaço pra chip por design, §8) e viraram texto dentro da
//     Ficha (.rz-kv "Acesso a módulos").
//   - Seção "Comunicações (avisos automáticos)" inline + botão de salvar
//     próprio (v1.1.0/v1.2.0) → Sheet de formulário dedicado
//     (abrirComunicacoesPessoaSheet), aberto pelo ⋮. Mesma consulta e
//     mesma gravação em pessoa_preferencias_comunicacao, zero mudança
//     de dado.
//   - "Acessos recentes" (div colapsável, v1.7.0) → Sheet de leitura
//     dedicado (abrirAcessosPessoaSheet), mesmo carregarAcessosDaPessoa
//     lazy de sempre (LGPD — minimização, só busca ao abrir).
//   - alert()/confirm()/prompt() nativos saíram de quase todo fluxo —
//     ficaram só os confirm() dos 2 DELETEs irreversíveis (excluir
//     pessoa, remover acesso), mesmo padrão aceito em excluirParte()
//     (index.html) pra ação destrutiva real.
//
//   NOVO — linha da lista (.rz-row), igual ao padrão de Partes: ícone
//   (user · shield-check se master) · nome · "Perfil · função" (1 fato +
//   1 contexto, §8) · toque na linha abre a Ficha (abrirFichaPessoa,
//   Sheet de leitura com .rz-card/.rz-kv), ⋮ abre o Sheet de ações.
//
//   ACHADO DE GOVERNANÇA (registrado, não corrigido nesta entrega —
//   fora do escopo de "reescrever a tela de Pessoas do App"):
//   cofre.html é página HTML separada (não carrega o <script> do
//   index.html) e NÃO define abrirSheet/abrirSheetAcoes/abrirSheetForm/
//   podeUsar/renderStatus — mesma lacuna já documentada no próprio
//   changelog de cofre.html v1.25.9 pra outras classes .rz-*. Este
//   módulo é compartilhado (montarPessoasCofre() em js/cofre-app.js
//   também o monta): dentro do Cofre standalone, toda ação que dependa
//   de Sheet (editar dados, perfil, comunicações, acessos recentes,
//   criar/vincular/remover acesso, e a própria Ficha de leitura) mostra
//   o mesmo aviso "Ações disponíveis só dentro do app principal." que
//   cofre-controles.js/cofre-ativos.js/cofre-documentos.js já usam pras
//   próprias ações Sheet-dependentes — NÃO é regressão desta entrega, é
//   o mesmo padrão de degradação já aceito no resto do Cofre (ver
//   demanda nova registrada nesta entrega). A lista de pessoas continua
//   visível lá. ctx continua 100% retrocompatível: nenhum campo novo
//   obrigatório, o call site do Cofre não muda.
//
// Versão anterior: 1.199.0 · 17/09/2026
//
// v1.7.0 (COMUM_PESSOAS_VERSAO) / v1.199.0 (VERSAO, header) — bc9df144,
// item 2 (17/09/2026): "aba Pessoas" ganha auto-filtro. ctx novo e todo
// OPCIONAL (pessoaId/autoFiltro/podeVerTodas/carregarAcessosDaPessoa) —
// call site do Cofre (js/cofre-app.js, montarPessoasCofre) não passa
// esses campos e continua exatamente como estava, sem autoFiltro.
//   - autoFiltro=true (App > Conta > Pessoas, novo call site em
//     index.html): por padrão renderLista() mostra só a pessoa cujo id é
//     ctx.pessoaId; quem tem podeVerTodas=true (calculado no host a
//     partir do codigo pessoas.ver_todas — perfil master da própria
//     empresa) vê todo mundo, com as mesmas regras de sempre (master
//     oculto de quem não é master).
//   - "+" (nova pessoa) e o rótulo do botão de salvar só aparecem/mudam
//     quando podeGerenciarOutras (= !autoFiltro || podeVerTodas) — no
//     modo "só eu" não faz sentido cadastrar outra pessoa.
//   - Novo atalho "Acessos recentes" por pessoa (acessosRecentesHtml()),
//     lazy (só busca ao expandir — minimização de dados, LGPD): usa o
//     callback ctx.carregarAcessosDaPessoa(pessoaId), que o host injeta
//     reaproveitando a MESMA consulta de log_acessos que alimentava a
//     extinta tela "Logs do Sistema" do app-dev — nenhuma lógica de
//     consulta nova, só um ponto de entrada por pessoa em vez de
//     multi-pessoa com filtros.
//   - Esta seção só aparece quando ctxUi.autoFiltro é true — o Cofre
//     nunca a vê.
//
// v1.6.0 — MOTOR CENTRAL DE ALERTAS, Fase 5: buscarProativasDisponiveis(),
// buscarPreferenciasComunicacao() e FREQUENCIA_OPCOES viram export — a
// tela nova "Minhas notificações" (index.html, menu Conta) reaproveita a
// MESMA consulta de licença×proativa e o MESMO mapa de preferências que
// esta tela já usa, em vez de reimplementar. Nenhuma lógica mudou aqui,
// só a visibilidade das 3 declarações.
//
// v1.5.1 — constante VERSAO sincronizada com o header (estava presa em uma
// versão anterior desde o bump do header; ⚙️ › Versões lia a constante e
// acusava "cache segurou" sem haver cache). gerar_versoes.py v1.3 agora
// trava a entrega se header ≠ VERSAO.
//
// v1.5.0 (A.5) — perfil escolhido em sheet a partir da tabela perfis (protegido só pra master);
// os 2 prompt() de perfil saíram. Nenhum nome de perfil chumbado no fluxo.
//
// v1.4.0 — gramática: ⋮ por pessoa (Editar/Remover com código do catálogo → cadeado por perfil)
// no lugar de lápis/lixeira redondos; título sem h2; + e Salvar no catálogo; perfil em
// sentence case. Lista de perfis do prompt continua (próxima leva).
//
// v1.3.1 — podeEditarPerfil lê podeUsar('pessoas.editar'). Lista de perfis do
// prompt e proteção do master ficam pro roteiro #6 (sheet + perfis.protegido).
//
// v1.3.0 — pedido explícito: "resolva as pendências de cores listadas".
// 9 usos de emerald-* trocados por token: 2 pares bg-emerald-50/text-
// emerald-700/border-emerald-200 (botões leves) → var(--sprout-light)/
// var(--pine)/var(--sprout); 2 bg-emerald-600 (ação principal) →
// var(--pine); 1 text-emerald-900 (título "Pessoas") → var(--pine) —
// mesmo hex oficial da marca, Tailwind emerald-900 (#064e3b) não bate
// exatamente com --pine (#1e3a32), por isso vale trocar mesmo em uso
// já "certo" visualmente.
//
// v1.2.0 (28/08/2026) — BUG REAL corrigido, reportado pelo Nicola: a
// seção de comunicações deixava clicar no checkbox/escolher frequência,
// mas nada era salvo. Causa: só existia UM caminho de salvamento (o botão
// "Salvar Pessoas" lá embaixo, fora da seção), que grava TUDO de uma vez
// (nome/e-mail/whatsapp/perfil/avisos de todos os cards). Clicar num
// checkbox muda o estado visual na hora (comportamento normal do
// navegador), dando a impressão de que já "pegou" — mas sem lembrar de
// rolar até o botão distante e clicar, nada persiste. Pior: qualquer
// re-render externo da aba (dev_renderPessoas, chamado por outras
// rotinas do app) reconstrói a lista inteira a partir do banco,
// descartando silenciosamente qualquer edição ainda não salva. Corrigido
// com um botão "Salvar avisos desta pessoa" dentro da própria seção —
// salva só aquilo, na hora, com feedback próprio — sem depender do botão
// de baixo nem do risco de um re-render apagar a edição no meio do
// caminho.
//
// v1.1.0 (28/08/2026) — NOVO, pedido explícito do Nicola: seção
// "Comunicações (avisos automáticos)" dentro do cadastro de cada pessoa —
// habilitar/desabilitar, por pessoa, quais avisos proativos ela recebe
// via WhatsApp e em qual frequência (diário/semanal/quinzenal/mensal/
// trimestral).
//
//   - Escopo = funcionalidades.tipo='proativa' AND ativo=true (conferido
//     contra o banco: 7 cadastradas, 5 ativas — batem exatamente com os
//     5 templates Meta já aprovados). Todas as 7 já tinham `descricao`
//     preenchida — usada como texto explicativo do escopo de cada uma,
//     mostrado direto pra pessoa (pedido explícito: "o escopo da função
//     deve aparecer ao usuário").
//   - Filtrado pela LICENÇA do cliente (licencas × plano_funcionalidade)
//     — só aparece pra configurar o que a empresa realmente contratou.
//     Mesmo raciocínio de clienteTemFuncionalidadeLicenca() no bot,
//     portado pra JS aqui (3 consultas + join, mesmo estilo de
//     buscarModulosPorPerfil, sem RPC nova).
//   - Nova tabela `pessoa_preferencias_comunicacao` (migration
//     pessoa_preferencias_comunicacao_v1, 28/08/2026) — mesmo padrão de
//     RLS/grants de `pessoas` (tabela irmã direta).
//   - Sem WhatsApp cadastrado na pessoa: seção continua aparecendo (não
//     trava), mas mostra aviso de que os envios não chegam até
//     preencher o número.
//   - Pessoa ainda não salva (sem id): seção mostra "salve primeiro",
//     mesmo padrão já usado pra "criar acesso".
//
// v1.0.0 — PRIMEIRA VERSÃO. Extraído de index.html (dev_renderPessoas()/
// dev_salvarPessoas()/dev_removerPessoa()/dev_criarAcessoParaPessoa()/
// dev_vincularLoginPessoa()/dev_desvincularLoginPessoa(), Beta v1.64.0)
// pra módulo compartilhado — pedido explícito: "faz também Minha Empresa
// e Pessoas, incluindo os acessos no módulo de imóveis e cofre".
//
// SOBRE "INCLUINDO OS ACESSOS" — leitura importante antes de usar isto:
// hoje o controle de acesso do sistema é por PERFIL (pessoas.perfil →
// perfil_funcionalidade → funcionalidades), não por pessoa individual.
// Ou seja, toda pessoa com o mesmo perfil (ex.: "operador") tem
// EXATAMENTE o mesmo acesso a módulos — não existe hoje um jeito de dar
// Cofre pra uma pessoa "operador" e negar pra outra "operador" da mesma
// empresa. O badge/campo "Acesso a módulos" mostra, por pessoa, quais
// módulos o PERFIL dela libera — calculado ao vivo a partir de
// perfil_funcionalidade + funcionalidades.area, nunca hardcoded. Editar
// o "Perfil de acesso" de uma pessoa continua sendo o único jeito de
// mudar o acesso dela.
//
// Diretriz Arquitetural: não cria seu próprio cliente Supabase pra
// leitura/escrita de conta — recebe `dbAuth` já autenticado do host, por
// parâmetro (ver nota completa em comum-licenca.js). Exceção pontual:
// criarAcessoPessoa() precisa de um 2º client TEMPORÁRIO, isolado
// (persistSession:false), pra criar o login de outra pessoa sem
// sobrescrever a sessão de quem está usando a tela. Usa a mesma URL/anon
// key pública já hardcoded em cofre-api.js (é chave pública, protegida
// por RLS no banco — não é segredo, mesmo padrão já replicado nesse
// outro arquivo).
// ============================================================================

export const VERSAO = '1.201.0'; // v-check (18/09/2026): lido por Dev › Versões — manter igual ao header
export const COMUM_PESSOAS_VERSAO = '2.1.0';

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
        <div class="rz-card rz-list" id="cp-lista"><p class="text-xs text-center text-gray-400 py-4">Carregando pessoas...</p></div>
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
            return prompt(titulo + ' — opções: ' + lista.map(p => p.codigo).join(', '), padrao);
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
            </div>`);
        sheet.querySelector('[data-acao="ficha-editar"]')?.addEventListener('click', () => abrirFormPessoaSheet(p.id));
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
                acoes.push({ icone: 'link', titulo: 'Vincular login existente', sub: 'Usuário já criado no Supabase', codigo: 'pessoas.editar', aoTocar: () => vincularLoginPessoa(p.id) });
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
            `<div><label class="block text-xs font-bold text-gray-600">${rot}</label><input type="${tipo}" id="${campoId}" value="${val}" ${extra} class="w-full p-2 border rounded mt-1 text-sm"></div>`;
        const dis = perfilTravado ? 'disabled' : '';
        window.abrirSheetForm({
            titulo: p ? 'Editar pessoa' : 'Nova pessoa',
            sub: p ? p.nome : 'Sócio ou usuário do sistema',
            rotuloSalvar: p ? 'Salvar' : 'Cadastrar',
            corpo: `
                ${campo('Nome *', 'pe-nome', v('nome'), 'text', `required ${dis}`)}
                <div class="grid grid-cols-2 gap-2">
                    ${campo('E-mail', 'pe-email', v('email'), 'email', dis)}
                    ${campo('WhatsApp', 'pe-whatsapp', v('whatsapp'), 'tel', dis)}
                </div>
                ${campo('Função na empresa', 'pe-funcao', v('funcao'), 'text', dis)}
                ${campo('% de cotas', 'pe-pct', p?.percentualCotasEmpresa ?? '', 'number', `min="0" max="100" step="0.01" ${dis}`)}
                ${perfilTravado ? '<p class="text-xs text-gray-400">Dados do master só podem ser alterados pelo próprio master.</p>' : ''}
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
                <div class="flex items-center gap-2 py-2 border-t border-gray-100" data-linha-codigo="${esc(f.codigo)}">
                    <span class="text-xs text-slate-700 flex-1 min-w-0">${esc(f.descricao)}</span>
                    <select class="pc-frequencia text-xs border rounded px-1 py-1 flex-none" data-codigo="${esc(f.codigo)}" ${habilitado ? '' : 'disabled'}>${opcoesHtml}</select>
                    <button type="button" class="pc-toggle" data-codigo="${esc(f.codigo)}" data-habilitado="${habilitado ? '1' : '0'}"
                        style="border:0;border-radius:999px;width:40px;height:22px;position:relative;cursor:pointer;flex:none;background:${habilitado ? 'var(--sprout,#3f8163)' : '#d7d2c4'};transition:background .15s">
                        <span style="position:absolute;top:2px;left:${habilitado ? '20px' : '2px'};width:18px;height:18px;border-radius:999px;background:#fff;transition:left .15s"></span>
                    </button>
                </div>`;
        };
        window.abrirSheetForm({
            titulo: 'Comunicações', sub: p.nome, semRodape: true,
            corpo: (elCorpo) => {
                elCorpo.innerHTML = `
                    <p class="text-xs text-gray-500">Envios por WhatsApp, pela manhã. Semanais saem às segundas; mensais, no dia 05.</p>
                    ${semWhatsapp ? '<p class="text-xs mt-1" style="color:var(--warning)">Sem WhatsApp cadastrado — os avisos não chegam até preencher o número.</p>' : ''}
                    <div class="mt-1">${proativasDisponiveis.length ? proativasDisponiveis.map(linhaHtml).join('') : '<p class="text-xs text-gray-400">Nenhum aviso disponível no plano atual.</p>'}</div>
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
                            btn.style.background = novoHabilitado ? 'var(--sprout)' : '#d7d2c4';
                            btn.querySelector('span').style.left = novoHabilitado ? '20px' : '2px';
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
        const sheet = window.abrirSheet(cabecalho + `<div class="rz-sh-b"><div id="ap-lista"><p class="text-xs text-gray-400">Carregando...</p></div></div>`);
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
        const perfil = await escolherPerfilSheet('Perfil de acesso', 'Login vinculado manualmente');
        if (!perfil) return;
        if (typeof window.abrirSheetForm !== 'function') { onToast?.(AVISO_SO_APP, 'info'); return; }
        window.abrirSheetForm({
            titulo: 'Vincular login existente', sub: 'Cole o UUID do usuário já criado', rotuloSalvar: 'Vincular',
            corpo: `<div><label class="block text-xs font-bold text-gray-600">UUID do usuário *</label>
                <input type="text" id="vi-uuid" class="w-full p-2 border rounded mt-1 text-sm" placeholder="Supabase → Authentication → Users">
                <p class="text-[11px] text-gray-400 mt-1">Copie o ID do usuário já criado no Supabase.</p></div>`,
            aoSalvar: async (el) => {
                const uuid = (el.querySelector('#vi-uuid')?.value || '').trim();
                if (!uuid) { onToast?.('Informe o UUID.', 'danger'); return false; }
                const { error } = await dbAuth.from('pessoas').update({ user_id: uuid, perfil: perfil.trim() }).eq('id', id);
                if (error) throw error;
                onToast?.('Login vinculado.', 'success');
                registrarLog?.('pessoas.acesso.aprovar', { pessoaId: id, perfil: perfil.trim(), via: 'vinculacao_manual' });
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
        if (!confirm('Remover o acesso ao sistema desta pessoa? Ela continua cadastrada, só perde o login.')) return;
        try {
            const { error } = await dbAuth.from('pessoas').update({ user_id: null, perfil: null }).eq('id', id);
            if (error) throw error;
            registrarLog?.('pessoas.acesso.revogar', { pessoaId: id });
            onToast?.('Acesso removido.', 'success');
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
        if (!confirm(`Excluir "${pessoa.nome}"? Esta ação não pode ser desfeita. Se ela tiver login, o acesso dela ao sistema também será removido.`)) return;
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
