// ============================================================================
// cofre-navegacao.js — Raiz Patrimônio · Cofre de Documentos
// Versão: 1.1.3 · 24/08/2026
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
    document.getElementById('tela-bootstrap').classList.add('hidden');
    document.getElementById('app-cofre').classList.remove('hidden');
    // Categorias não é mais aba de navegação (Adendo §3) — vive atrás do
    // ícone de engrenagem no header. Esconder o ícone inteiro pra quem não
    // tem cofre.categorias evita abrir um modal vazio sem explicação.
    const podeCategorias = await api.pessoaTemFuncionalidade(estado.pessoa.perfil, 'cofre.categorias').catch(() => false);
    if (!podeCategorias) {
        document.querySelector('[data-action="abrir-configuracoes"]')?.classList.add('hidden');
    }
    refrescarIcones();

    await carregarTudo();

    if (contextoParam && refParam) {
        await abrirContexto(contextoParam, refParam, nomeParam);
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

function falhaAcesso(mensagem) {
    document.getElementById('erro-acesso-msg').textContent = mensagem;
    document.getElementById('tela-bootstrap').classList.add('hidden');
    document.getElementById('tela-erro-acesso').classList.remove('hidden');
    refrescarIcones();
}

async function carregarTudo() {
    const [categorias, documentos, ativos, eventos, contatos] = await Promise.all([
        api.listarCategorias(estado.clienteId).catch(e => { mostrarToast('Erro ao carregar categorias: ' + e.message, 'erro'); return []; }),
        api.listarDocumentos(estado.clienteId).catch(e => { mostrarToast('Erro ao carregar documentos: ' + e.message, 'erro'); return []; }),
        api.listarAtivos(estado.clienteId).catch(e => { mostrarToast('Erro ao carregar ativos: ' + e.message, 'erro'); return []; }),
        api.listarEventosPendentes(estado.clienteId).catch(e => { mostrarToast('Erro ao carregar alertas: ' + e.message, 'erro'); return []; }),
        api.listarContatos(estado.clienteId).catch(e => { mostrarToast('Erro ao carregar contatos: ' + e.message, 'erro'); return []; }),
    ]);
    estado.categorias = categorias;
    estado.documentos = documentos;
    estado.ativos = ativos;
    estado.eventos = eventos;
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
        window.dispatchEvent(new CustomEvent('cofre:abrir-ativo', { detail: { id: ativo.id } }));
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
