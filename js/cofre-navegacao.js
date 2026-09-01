// ============================================================================
// cofre-navegacao.js — Raiz Patrimônio · Cofre de Documentos
// Versão: 1.6.1 · 01/09/2026
//
// v1.6.1 — BUG REAL corrigido, achado pelo Nicola via console do
// navegador ("Falha no bootstrap do Cofre: TypeError: Cannot read
// properties of null (reading 'classList') at Module.bootstrap"):
// causa raiz era o prefetch do index.html (v1.95.0) chamando import()
// em vez de <link rel="modulepreload"> — import() executa o módulo
// (dispara bootstrap() automaticamente, sem o HTML do Cofre existir
// ainda). Corrigido na origem (ver index.html v1.96.1), mas
// bootstrap()/falhaAcesso() também ganharam guarda defensiva aqui
// (2ª camada, mesmo padrão já usado em montarHome()/renderAlertas())
// — custa pouco blindar contra a mesma classe de erro acontecer de
// novo por outro caminho.
//
// v1.6.0 — bootstrap() ganhou suporte a ?abrir=categorias|subtipos|
// modelos (pedido explícito, 31/08/2026): abre direto uma tela de
// configuração do Cofre que só tinha porta de entrada dentro do próprio
// menu ⚙️ do Cofre até agora — agora alcançável também pelo menu
// Configurações do App (index.html, abrirConfiguracaoCofre()). Mesmo
// espírito de segurança do contexto/ref já existente: parâmetro de URL
// nunca é autorização, só sugestão de navegação.
//
// v1.5.0 — REVERTIDO pra 'raiz:comunicacoes:processar' direto (mesma
// reversão de index.html v1.71.0). Termos de Uso/Política de Privacidade/
// Termo de Beta migraram pro motor de comunicações de verdade — não
// precisam mais de um wrapper próprio antes de disparar a Central de
// Comunicações. js/comunicacoes/consentimento-app.js (usado por este
// arquivo desde a v1.4.0) fica obsoleto, junto com consentimento-{api,
// ui}.js — não são mais importados por cofre.html (tag removida).
//
// v1.4.0 — Aceite de Termos/LGPD entra ANTES da Central de Comunicações
// também aqui (mesma mudança de index.html v1.70.0) — dispatch trocou de
// 'raiz:comunicacoes:processar' pra 'raiz:termos:verificar'. Sem isso,
// quem loga direto pelo Cofre passava batido pelo modal de aceite de
// Termos de Uso/Política de Privacidade/Termo de Beta. Ver changelog
// completo no bloco do bootstrap() mais abaixo, e em
// js/comunicacoes/consentimento-app.js (módulo novo, compartilhado com
// index.html).
//
// v1.3.0 — pedido explícito do Nicola: Central de Comunicações Omnichannel
// passa a rodar também no Cofre (antes só existia em index.html). Novo
// dispatch de 'raiz:comunicacoes:processar' no fim de bootstrap(), mesmo
// evento/módulo compartilhado (js/comunicacoes/*.js) que o app principal
// usa — onAcaoFinal trata 'abrir_formulario_ativo' (dispara
// 'cofre:abrir-form-ativo', ver cofre-app.js) e é defensivo com
// 'abrir_formulario_imovel' (não deveria ocorrer aqui, mas não trava se
// ocorrer). Não precisa mais passar quantidadeImoveis/plano/perfil no
// detail — a seleção agora é decidida no banco (fn_comunicacao_proxima_app)
// a partir de pessoaId/clienteId.
//
// v1.2.0 (28/08/2026) — BUG REAL corrigido: abrirContexto('imovel', ...)
// quando o ativo já existe (caminho mais comum) disparava só
// 'cofre:abrir-ativo' (ficha, sem upload) — agora dispara
// 'cofre:upload-contextual' direto, igual contrato/pagamento sempre
// fizeram. Botão "Documentos" do Imóvel no app nunca chegava no
// formulário de anexar arquivo.
//
// v1.1.3 — guarda defensiva em cofre-nome-empresa (evita "Cannot set
// properties of null" se o elemento não existir por algum motivo — ex.:
// cache de navegador com HTML antigo enquanto o JS já é o novo).
//
// v1.1.2 — header: nome da empresa passa a ser o título principal
// (#cofre-nome-empresa), com selo "Cofre" ao lado (identificação de
// módulo). badge-empresa-atual agora mostra só o nome da pessoa (empresa
// já aparece acima, sem duplicar).
//
// v1.1.1 — abrirSeletorModulo() marcada DEPRECATED (não mais chamada); ver
// cofre-app.js v1.1.2 (novo data-action="voltar-app", header simplificado).
//
// v1.1.0 — CORREÇÃO DE ARQUITETURA (substitui o bootstrap simplista da
// v1.0.0, que só aceitava ?cliente_id=). Implementa o contrato do prompt
// corretivo §5:
//   1. valida Supabase Auth
//   2. resolve empresas da pessoa
//   3. resolve contexto/ref DENTRO das empresas autorizadas
//   4. (licença do módulo — deferido, ver HANDOFF item 18)
//   5. valida perfil/funcionalidade (cofre.ver)
//   6. RLS faz a validação final no banco, em toda query subsequente
//   7. abre diretamente a tela/ficha correta
//
// `ref` é sempre revalidado contra o banco (nunca confiado da URL — "URL
// nunca é autorização", Adendo §5/§18). `nome` (quando vem na URL, ver
// alias do protótipo de Imóveis) é usado só como legenda cosmética
// imediata, e é IMEDIATAMENTE substituído pelo nome real assim que a
// consulta volta — nunca fica sozinho como fonte de verdade.
// ============================================================================
import { estado, COFRE_VERSAO } from './cofre-estado.js';
import * as api from './cofre-api.js';
import { normalizarContexto } from './cofre-validacoes.js';
import { mostrarToast, modalGenerico, refrescarIcones } from './cofre-ui.js';

export async function bootstrap() {
    const params = new URLSearchParams(window.location.search);
    const contextoParam = normalizarContexto(params.get('contexto'));
    const refParam = params.get('ref');
    const nomeParam = params.get('nome'); // cosmético apenas — ver cabeçalho
    const clienteIdCompat = params.get('cliente_id'); // compatibilidade v1.0.0
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
    const podeCategorias = await api.pessoaTemFuncionalidade(estado.pessoa.perfil, 'cofre.categorias').catch(() => false);
    if (!podeCategorias) {
        document.querySelector('[data-action="abrir-configuracoes"]')?.classList.add('hidden');
    }
    refrescarIcones();

    await carregarTudo();

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
    const [categorias, documentos, ativos, ocorrenciasAbertas, contatos] = await Promise.all([
        api.listarCategorias(estado.clienteId).catch(e => { mostrarToast('Erro ao carregar categorias: ' + e.message, 'erro'); return []; }),
        api.listarDocumentos(estado.clienteId).catch(e => { mostrarToast('Erro ao carregar documentos: ' + e.message, 'erro'); return []; }),
        api.listarAtivos(estado.clienteId).catch(e => { mostrarToast('Erro ao carregar ativos: ' + e.message, 'erro'); return []; }),
        api.listarOcorrenciasAbertasComItem(estado.clienteId).catch(e => { mostrarToast('Erro ao carregar alertas: ' + e.message, 'erro'); return []; }),
        api.listarContatos(estado.clienteId).catch(e => { mostrarToast('Erro ao carregar contatos: ' + e.message, 'erro'); return []; }),
    ]);
    estado.categorias = categorias;
    estado.documentos = documentos;
    estado.ativos = ativos;
    estado.ocorrenciasAbertas = ocorrenciasAbertas;
    estado.contatos = contatos;

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
    document.querySelectorAll('[data-screen]').forEach(el => el.classList.toggle('hidden', el.dataset.screen !== nome));
    document.querySelectorAll('[data-nav-item]').forEach(el => el.classList.toggle('active', el.dataset.navItem === nome));
    window.scrollTo(0, 0);
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
