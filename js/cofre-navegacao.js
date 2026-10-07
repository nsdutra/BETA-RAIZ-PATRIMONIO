// ============================================================================
// cofre-navegacao.js — Raiz Patrimônio · Cofre de Documentos
// Versão: 1.9.2 · 07/10/2026
//
// v1.9.2 (07/10/2026, sessão 20261007-1721-rolo-changelog, demanda 2507d554) — ordem do
// cabeçalho corrigida: a linha "Versão:" estava DEPOIS das entradas de changelog, e o
// versao_de() do publicar_raiz.py lê a primeira versão que aparece nas 60 primeiras linhas.
// Resultado: a checagem de base lia 1.9.0 enquanto o versoes.json e o export const diziam
// 1.9.1 — o próximo deploy deste arquivo seria barrado por divergência falsa. Era o único
// dos 34 módulos com o cabeçalho nessa ordem. Nenhuma linha de código mudou.
//
// Versão anterior: 1.9.1 · 07/10/2026
//
// v1.9.0 (04/10/2026) — UX F1.3 (demanda 798e7b64): mudarTela() guarda a
// rolagem da tela que sai e devolve a da lista ao voltar (Ativos, Início,
// Alertas). Fichas ('ficha-*') abrem sempre no topo. O mapa é
// window.__rzRolagem com chave 'cofre:<tela>', o mesmo que o index.html usa
// para a aba Ativos; no App, só rola a janela quando a aba Ativos está à
// vista (senão mexeria na rolagem de outra aba).
//
// v1.8.0 (22/09/2026) — PORTA DE LICENÇA NO BOOT (demanda 8b2d37d7, C4).
// bootstrap() passa a instalar a porta compartilhada (js/comum-licenca.js
// v1.4.0, instalarPortaGlobal) em paralelo com carregarTudo(). No cofre.html
// standalone isso publica window.podeUsar/window.rzMostrarBloqueio pela 1ª
// vez — todos os gates defensivos do Cofre (window.podeUsar ? … : true)
// deixam de cair no permissivo. Embutido no App (index.html), o host já tem
// a porta e ela não é sobrescrita; só os cadeados (data-rz-codigo) são
// aplicados. Falha na porta não derruba o boot (a trava de banco segue
// valendo, com a mensagem do design system — c3_porta_amigos_v1).
//
// v1.9.1 (07/10/2026, sessão 20261007-1721-rolo-changelog, demanda 2507d554 — VER-05, "de acordo" do Nicola 07/10 17:21) — SÓ
// CABEÇALHO: as versões além das 5 mais recentes rolaram para o CHANGELOG_MODULOS.md.
// Nenhuma linha de código mudou — conferido token a token contra o publicado.
//
// Versão anterior: 1.9.0 · 04/10/2026
//
// Versão anterior: 1.8.0 · 22/09/2026
//
// v1.7.1 (15/09/2026) — PLANO_IMPLEMENTACAO v1.0, etapa E14.4:
// listarContatos() saiu de carregarTudo() — estado.contatos nunca era
// lido por nada no app (achado ao investigar a E14.4), 1 query a menos
// no boot do Cofre.
// --------------------------------------------------------------------------
// Versões anteriores (v1.6.1 … v1.7.0): CHANGELOG_MODULOS.md, na raiz do repositório — o
// gerar_versoes.py rola pra lá automaticamente tudo além das 5 versões
// mais recentes deste cabeçalho (VER-05).
export const VERSAO = '1.9.2'; // v-check (04/10/2026): lido por Dev › Versões — manter igual ao header
import { estado, COFRE_VERSAO } from './cofre-estado.js';
import * as api from './cofre-api.js';
import { normalizarContexto } from './cofre-validacoes.js';
import { mostrarToast, modalGenerico, refrescarIcones } from './cofre-ui.js';
import { instalarPortaGlobal } from './comum-licenca.js'; // v1.8.0 — porta de licença compartilhada

export async function bootstrap() {
    const params = new URLSearchParams(window.location.search);
    const contextoParam = normalizarContexto(params.get('contexto'));
    const refParam = params.get('ref');
    const nomeParam = params.get('nome'); // cosmético apenas — ver cabeçalho
    // v1.7.0 — o global vem primeiro: é imune à restauração da URL feita
    // pelo ativos-boot.js. A URL segue valendo pro cofre.html standalone.
    const clienteIdCompat = window.__raizClienteId || params.get('cliente_id'); // compatibilidade v1.0.0
    // v1.4.0 (31/08/2026, pedido explícito) — 'categorias'|'subtipos'|
    // 'modelos': abre direto uma tela de CONFIGURAÇÃO do Cofre, vinda do
    // menu Configurações do App (index.html, abrirConfiguracaoCofre()) —
    // essas 3 telas só tinham porta de entrada dentro do próprio menu ⚙️
    // do Cofre até agora. Mesmo espírito de contexto/ref (parâmetro de
    // URL nunca é autorização, só sugestão de navegação — a checagem de
    // permissão de verdade continua sendo cofre.categorias/etc. dentro
    // de cada função abrirConfiguracoes()/abrirSubtiposControle()/
    // abrirModelosControle()).
    const abrirParam = params.get('abrir');

    const user = await api.obterUsuarioAtual();
    if (!user) return falhaAcesso('Sua sessão expirou. Volte ao Raiz Patrimônio e faça login novamente.');

    let pessoaRows;
    try {
        pessoaRows = await api.listarEmpresasDaPessoa(user.id);
    } catch (err) {
        return falhaAcesso('Erro ao verificar seu acesso: ' + err.message);
    }
    if (!pessoaRows || pessoaRows.length === 0) return falhaAcesso('Sua conta não tem acesso a nenhuma empresa no Raiz Patrimônio.');

    // Empresa: prioriza cliente_id explícito (compat), senão a primeira —
    // deep link por contexto (imovel/contrato/ativo/...) não precisa saber
    // a empresa de antemão quando só há uma; com múltiplas empresas e sem
    // cliente_id explícito, tenta cada uma até achar o objeto referenciado
    // (nunca revela em qual empresa o objeto existe se a pessoa não tiver
    // acesso a ela — só itera as que a PRÓPRIA pessoa já pode ver).
    estado.empresasDaPessoa = pessoaRows;
    let escolhida = clienteIdCompat ? pessoaRows.find(p => p.cliente_id === clienteIdCompat) : null;

    if (!escolhida && refParam && contextoParam) {
        escolhida = await tentarResolverEmpresaPorContexto(pessoaRows, contextoParam, refParam);
    }
    if (!escolhida && clienteIdCompat) {
        // pediram uma empresa específica e a pessoa não tem acesso a ela:
        // melhor dizer isso do que abrir outra empresa silenciosamente.
        return falhaAcesso('Sua conta não tem acesso aos ativos desta empresa.');
    }
    if (!escolhida) escolhida = pessoaRows[0];

    estado.clienteId = escolhida.cliente_id;
    estado.pessoa = { id: escolhida.id, nome: escolhida.nome, perfil: escolhida.perfil, clienteNome: escolhida.clientes?.nome_empresa || '' };

    let liberado;
    try {
        liberado = await api.pessoaTemFuncionalidade(estado.pessoa.perfil, 'cofre.ver');
    } catch (err) {
        return falhaAcesso('Erro ao checar permissão: ' + err.message);
    }
    if (!liberado) return falhaAcesso(`Seu perfil (${estado.pessoa.perfil}) não tem acesso ao módulo Cofre nesta empresa.`);

    document.getElementById('cofre-nome-empresa') && (document.getElementById('cofre-nome-empresa').textContent = estado.pessoa.clienteNome || 'Empresa');
    const elSobreVersao = document.getElementById('sobre-versao-cofre');
    if (elSobreVersao) elSobreVersao.textContent = 'v' + COFRE_VERSAO;
    const badgeVersao = document.getElementById('badge-versao-cofre');
    if (badgeVersao) badgeVersao.textContent = 'v' + COFRE_VERSAO;
    // v1.6.1 (01/09/2026) — guarda defensiva: 2ª camada de proteção
    // contra bootstrap() rodar antes do HTML do Cofre existir no DOM
    // (a causa real do crash foi corrigida na origem — ver
    // prefetchModuloAtivos() no index.html — mas custa pouco blindar
    // aqui também, mesmo padrão já usado em montarHome()/renderAlertas()).
    document.getElementById('tela-bootstrap')?.classList.add('hidden');
    document.getElementById('app-cofre')?.classList.remove('hidden');
    // Categorias não é mais aba de navegação (Adendo §3) — vive atrás do
    // ícone de engrenagem no header. Esconder o ícone inteiro pra quem não
    // tem cofre.categorias evita abrir um modal vazio sem explicação.
    // v1.6.2 (04/09/2026, "Ativos está demorando pra aparecer") — esta
    // checagem só decide se um ícone fica escondido; não precisa bloquear
    // carregarTudo() (5 consultas em paralelo, o grosso do carregamento).
    // Dispara as duas ao mesmo tempo em vez de esperar uma pra começar a
    // outra — economiza 1 ida ao banco no caminho crítico.
    const promessaCategorias = api.pessoaTemFuncionalidade(estado.pessoa.perfil, 'cofre.categorias').catch(() => false);
    // v1.8.0 — porta de licença (cadeado + aviso antes do formulário).
    const promessaPorta = instalarPortaGlobal({ dbAuth: api.dbAuth, clienteId: estado.clienteId, perfil: estado.pessoa.perfil, toast: mostrarToast })
        .catch(err => console.warn('[cofre-navegacao] porta de licença indisponível:', err?.message || err));
    const promessaTudo = carregarTudo();
    const podeCategorias = await promessaCategorias;
    if (!podeCategorias) {
        document.querySelector('[data-action="abrir-configuracoes"]')?.classList.add('hidden');
    }
    refrescarIcones();

    await promessaTudo;
    await promessaPorta;

    // v1.5.0 (30/08/2026) — REVERTIDO pra chamar 'raiz:comunicacoes:processar'
    // direto de novo (era assim até v1.3.0). O wrapper 'raiz:termos:verificar'
    // (v1.4.0) ficou obsoleto: Termos de Uso/Política de Privacidade/Termo de
    // Beta migraram pro motor de comunicações de verdade — comunicacoes-
    // app.js (compartilhado com index.html) trata isso sozinho agora.
    window.dispatchEvent(new CustomEvent('raiz:comunicacoes:processar', {
        detail: {
            dbAuth: api.dbAuth,
            pessoaId: estado.pessoa.id,
            clienteId: estado.clienteId,
            tela: 'cofre-home',
            onAcaoFinal: function (acao) {
                if (acao === 'abrir_formulario_ativo') window.dispatchEvent(new CustomEvent('cofre:abrir-form-ativo'));
                // Defensivo: a variante "imóvel" pertence ao app principal — não
                // deveria disparar aqui, mas não pode travar se disparar.
                else if (acao === 'abrir_formulario_imovel') mostrarToast('Esse cadastro fica no Raiz Patrimônio (app principal).', 'info');
            },
            onToast: function (msg, tipo) { mostrarToast(msg, tipo); }
        }
    }));

    if (contextoParam && refParam) {
        await abrirContexto(contextoParam, refParam, nomeParam);
    } else if (abrirParam) {
        montarHome();
        mudarTela('home');
        window.dispatchEvent(new CustomEvent('cofre:abrir-configuracao', { detail: { tela: abrirParam } }));
    } else {
        montarHome();
        mudarTela('home');
    }
}

async function tentarResolverEmpresaPorContexto(pessoaRows, contexto, ref) {
    for (const p of pessoaRows) {
        try {
            let existe = false;
            if (contexto === 'ativo') existe = (await api.buscarAtivoPorId(ref))?.cliente_id === p.cliente_id;
            else if (contexto === 'documento') existe = (await api.buscarDocumentoPorId(ref))?.cliente_id === p.cliente_id;
            else if (contexto === 'imovel') existe = !!(await api.buscarImovelPorId(ref));
            if (existe) return p;
        } catch { /* segue tentando a próxima empresa, sem vazar erro específico */ }
    }
    return null;
}

// v1.6.1 (01/09/2026) — mesma guarda defensiva de bootstrap(): #tela-
// erro-acesso é um placeholder vazio no contexto embutido (não tem
// #erro-acesso-msg dentro) — sem isso, um perfil sem 'cofre.ver'
// crasharia aqui igual ao bug do bootstrap() achado pelo Nicola.
function falhaAcesso(mensagem) {
    const elMsg = document.getElementById('erro-acesso-msg');
    if (elMsg) elMsg.textContent = mensagem;
    document.getElementById('tela-bootstrap')?.classList.add('hidden');
    document.getElementById('tela-erro-acesso')?.classList.remove('hidden');
    refrescarIcones();
}

async function carregarTudo() {
    // E14.4 — listarContatos() saiu daqui: estado.contatos nunca era lido
    // por nada no app (achado ao investigar a E14.4) — 1 query a menos
    // no boot do Cofre.
    const [categorias, documentos, ativos, ocorrenciasAbertas] = await Promise.all([
        api.listarCategorias(estado.clienteId).catch(e => { mostrarToast('Erro ao carregar categorias: ' + e.message, 'erro'); return []; }),
        api.listarDocumentos(estado.clienteId).catch(e => { mostrarToast('Erro ao carregar documentos: ' + e.message, 'erro'); return []; }),
        api.listarAtivos(estado.clienteId).catch(e => { mostrarToast('Erro ao carregar ativos: ' + e.message, 'erro'); return []; }),
        api.listarOcorrenciasAbertasComItem(estado.clienteId).catch(e => { mostrarToast('Erro ao carregar alertas: ' + e.message, 'erro'); return []; }),
    ]);
    estado.categorias = categorias;
    estado.documentos = documentos;
    estado.ativos = ativos;
    estado.ocorrenciasAbertas = ocorrenciasAbertas;

    window.dispatchEvent(new CustomEvent('cofre:dados-carregados'));
}

// ============================================================================
// RESOLUÇÃO DE DEEP LINK — abre diretamente a tela/ficha, não a lista
// ============================================================================
export async function abrirContexto(tipo, ref, nomeCosmetico) {
    estado.contextoAtual = { tipo, ref, nome: nomeCosmetico || null };

    if (tipo === 'ativo') {
        const ativo = estado.ativos.find(a => a.id === ref);
        if (!ativo) { mostrarToast('Ativo não encontrado ou sem autorização nesta empresa.', 'erro'); mudarTela('home'); return; }
        window.dispatchEvent(new CustomEvent('cofre:abrir-ativo', { detail: { id: ref } }));
        return;
    }
    if (tipo === 'documento') {
        const doc = estado.documentos.find(d => d.id === ref) || await api.buscarDocumentoPorId(ref);
        if (!doc || doc.cliente_id !== estado.clienteId) { mostrarToast('Documento não encontrado ou sem autorização nesta empresa.', 'erro'); mudarTela('home'); return; }
        window.dispatchEvent(new CustomEvent('cofre:abrir-documento', { detail: { id: ref } }));
        return;
    }
    if (tipo === 'imovel') {
        // Ativo derivado de imóvel pode não existir ainda — cria-o
        // silenciosamente NÃO é permitido (nada de registro crítico sem
        // confirmação); em vez disso, oferece criar ao entrar no contexto.
        let ativo = await api.buscarAtivoPorOrigemImovel(estado.clienteId, ref).catch(() => null);
        if (!ativo) {
            const imovel = await api.buscarImovelPorId(ref).catch(() => null);
            window.dispatchEvent(new CustomEvent('cofre:contexto-imovel-sem-ativo', { detail: { imovelId: ref, imovel } }));
            mudarTela('home');
            return;
        }
        // CORRIGIDO (28/08/2026) — BUG REAL reportado: o botão "Documentos"
        // no Mais ações do Imóvel (index.html) levava pro Cofre mas nunca
        // abria o formulário de upload — este é o caminho mais comum (o
        // ativo já existe na maioria das vezes, depois do primeiro uso).
        // Antes disparava 'cofre:abrir-ativo' (só a ficha do ativo, sem
        // upload nenhum); contrato/pagamento sempre dispararam
        // 'cofre:upload-contextual' direto — mesma função abrirCofreDocumentos()
        // do app pros dois casos, comportamento tinha que ser igual.
        window.dispatchEvent(new CustomEvent('cofre:upload-contextual', { detail: { entidadeTipo: 'ativo', entidadeId: ativo.id, nome: nomeCosmetico } }));
        mudarTela('home');
        return;
    }
    if (tipo === 'contrato' || tipo === 'pagamento') {
        // Sem ficha própria no Cofre para contrato/pagamento nesta versão —
        // abre a home já com o formulário de upload contextual pré-aberto e
        // o vínculo pré-selecionado (documento primeiro dentro de um
        // contexto já conhecido, ver prompt corretivo §11-A).
        window.dispatchEvent(new CustomEvent('cofre:upload-contextual', { detail: { entidadeTipo: tipo, entidadeId: ref, nome: nomeCosmetico } }));
        mudarTela('home');
        return;
    }
    mudarTela('home');
}

// ============================================================================
// TELAS PRINCIPAIS — Home / Ativos / Alertas (Documentos e Categorias NÃO
// são abas de primeiro nível — Adendo §3: "busca documental é ferramenta
// secundária", "Categorias é configuração, não atividade diária")
// ============================================================================
export function mudarTela(nome) {
    // v1.9.0 (UX F1.3) — rolagem por tela; ver cabeçalho
    const mapa = (window.__rzRolagem = window.__rzRolagem || {});
    const abaAtivos = document.getElementById('tab-ativos');
    const aVista = !abaAtivos || abaAtivos.classList.contains('active');
    const saindo = document.querySelector('[data-screen]:not(.hidden)')?.dataset.screen || null;
    if (aVista && saindo && saindo !== nome) mapa['cofre:' + saindo] = Math.max(0, Math.round(window.scrollY || 0));
    document.querySelectorAll('[data-screen]').forEach(el => el.classList.toggle('hidden', el.dataset.screen !== nome));
    document.querySelectorAll('[data-nav-item]').forEach(el => el.classList.toggle('active', el.dataset.navItem === nome));
    const ehFicha = /^ficha/.test(nome);
    if (ehFicha) mapa['cofre:' + nome] = 0;
    const alvo = ehFicha ? 0 : (mapa['cofre:' + nome] || 0);
    if (aVista && saindo !== nome) { // mesma tela de novo (ex.: recarregar a lista): não mexe na rolagem
        try { if (typeof window.rzRolagemCancelar === 'function') window.rzRolagemCancelar(); } catch (_) { /* App ausente */ }
        window.scrollTo(0, alvo);
        // a lista pode estar terminando de desenhar: tenta de novo, se ninguém mexeu
        if (alvo > 0) {
            let ultimo = window.scrollY || 0;
            [150, 450].forEach(ms => setTimeout(() => {
                if (Math.abs((window.scrollY || 0) - ultimo) > 4 || document.querySelector('[data-screen]:not(.hidden)')?.dataset.screen !== nome) return;
                window.scrollTo(0, alvo); ultimo = window.scrollY || 0;
            }, ms));
        }
    }
    refrescarIcones();
}

function montarHome() {
    window.dispatchEvent(new CustomEvent('cofre:montar-home'));
}

// ============================================================================
// SELETOR DE MÓDULOS — DEPRECATED (v1.3.1, 24/08/2026). Substituído por um
// botão simples "< Voltar" no header (data-action="voltar-app" em
// cofre-app.js), a pedido explícito: sem seletor/modal, navegação direta.
// Função mantida (não removida) para não quebrar nenhuma referência externa
// remanescente; não é mais chamada por nenhum data-action do cofre.html.
// ============================================================================
export function abrirSeletorModulo() {
    const nomeEmpresa = estado.pessoa?.clienteNome || '';
    const corpo = `<div class="space-y-2">
        <a href="./" class="block w-full border border-slate-300 rounded-xl p-3 text-left hover:border-slate-400">
            <b>Imóveis</b><div class="text-xs" style="color:var(--sage)">Contratos, recebimentos, métricas e distribuição</div>
        </a>
        <div class="w-full border-2 rounded-xl p-3 text-left" style="border-color:var(--pine); background:var(--success-bg)">
            <b>Cofre</b><div class="text-xs" style="color:var(--sage)">Ativos, documentos, alertas e vitrine patrimonial</div>
        </div>
    </div>
    <p class="text-xs mt-3" style="color:var(--sage)">${nomeEmpresa ? 'Empresa atual: ' + nomeEmpresa : ''}</p>`;
    modalGenerico('Módulos', corpo);
}
