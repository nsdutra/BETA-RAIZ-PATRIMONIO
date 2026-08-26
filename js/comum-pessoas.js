// ============================================================================
// comum-pessoas.js — Raiz Patrimônio · Administração compartilhada
// Versão: 1.0.0 · 26/08/2026
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
// empresa. Confirmado contra o banco ao vivo (26/08/2026): 'imoveis.ver'
// e 'cofre.ver' estão liberados pra TODOS os 5 perfis (admin, consulta,
// master, master_plataforma, operador) — ou seja, hoje não há NENHUMA
// diferenciação de acesso a módulo entre perfis.
//
// O que este módulo faz: mostra, por pessoa, quais módulos o PERFIL dela
// libera (badge "Acessos" — calculado ao vivo a partir de
// perfil_funcionalidade + funcionalidades.area, nunca hardcoded — se um
// perfil for restringido no futuro, o badge reflete sozinho, sem
// precisar tocar neste arquivo). É visibilidade nova que não existia
// antes nesta tela — não é controle NOVO por pessoa (isso exigiria uma
// decisão de produto/schema à parte: um override por pessoa além do
// perfil, ou popular perfil_funcionalidade de forma diferente por
// perfil). Editar o "Perfil de acesso" de uma pessoa (dropdown já
// existente, mantido) continua sendo o único jeito de mudar o acesso
// dela — exatamente como já funcionava.
//
// Diretriz Arquitetural: não cria seu próprio cliente Supabase pra
// leitura/escrita de conta — recebe `dbAuth` já autenticado do host, por
// parâmetro (ver nota completa em comum-licenca.js). Exceção pontual:
// dev_criarAcessoParaPessoa() precisa de um 2º client TEMPORÁRIO,
// isolado (persistSession:false), pra criar o login de outra pessoa sem
// sobrescrever a sessão de quem está usando a tela — mesma proteção já
// existente na versão original (era o bug real de "perda de sessão"
// documentado lá). Usa a mesma URL/anon key pública já hardcoded em
// cofre-api.js (é chave pública, protegida por RLS no banco — não é
// segredo, mesmo padrão já replicado nesse outro arquivo).
// ============================================================================

export const COMUM_PESSOAS_VERSAO = '1.0.0';

const SUPABASE_URL = 'https://oduwpttbbemypiypjsux.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kdXdwdHRiYmVteXBpeXBqc3V4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyODEyOTcsImV4cCI6MjEwMDg1NzI5N30.9-cu1CV1wPbo5UH1G2eAsWqsvS54AWNuQZOlifc9a7w';

// area (funcionalidades.area) → módulo de exibição. Áreas ausentes deste
// mapa (ex.: "pessoas", "dev", "plataforma", "autenticar", "prestadores",
// "ia_whatsapp") são transversais/internas, não aparecem como badge de
// módulo — não é omissão, é proposital (não são "um módulo" pro
// usuário final).
const AREA_PARA_MODULO = {
    imoveis: 'Imóveis', contratos: 'Imóveis', mensal: 'Imóveis', repasses: 'Imóveis',
    vitrine: 'Imóveis', conciliacao: 'Imóveis', tributos_custos: 'Imóveis', relatorios: 'Imóveis',
    cofre: 'Cofre', cofre_documentos: 'Cofre',
    gestao: 'Gestão',
};

// ----------------------------------------------------------------------------
// CAMADA DE DADOS
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
        console.warn('[comum-pessoas] Falha ao calcular acessos por perfil (badges de módulo ficam ocultos):', err.message);
    }
    return mapa;
}

// ----------------------------------------------------------------------------
// UI
// ----------------------------------------------------------------------------

function escapeAttr(s) { return (s || '').toString().replace(/"/g, '&quot;'); }

function badgesAcessoHtml(modulosPorPerfil, perfil) {
    if (!perfil) return '';
    const set = modulosPorPerfil.get(perfil);
    if (!set || set.size === 0) return '';
    const cores = { 'Imóveis': 'bg-blue-50 text-blue-700', 'Cofre': 'bg-amber-50 text-amber-700', 'Gestão': 'bg-slate-100 text-slate-600' };
    return `<div class="flex flex-wrap gap-1 mt-1">${Array.from(set).sort().map(m =>
        `<span class="text-[10px] font-bold px-1.5 py-0.5 rounded ${cores[m] || 'bg-slate-100 text-slate-600'}">${m}</span>`
    ).join('')}</div>`;
}

function cartaoPessoaHtml(p, idx, ctxUi) {
    const { perfilLogado, modulosPorPerfil } = ctxUi;
    const temLogin = !!p.userId;
    const ehMaster = p.perfil === 'master';
    const perfilTravado = ehMaster && perfilLogado !== 'master';
    const podeEditarPerfil = !ehMaster && (perfilLogado === 'master' || perfilLogado === 'admin');
    const idSeguro = p.id || ('novo-' + idx);
    const ehNova = !p.id;

    const botaoRemover = ehMaster
        ? `<span title="Usuários master não podem ser removidos por aqui" class="w-7 h-7 flex-none flex items-center justify-center text-gray-300"><svg data-lucide="lock" style="width:14px;height:14px"></svg></span>`
        : `<button type="button" data-acao="remover" data-id="${p.id || ''}" title="Remover" class="w-7 h-7 flex-none flex items-center justify-center bg-red-50 text-red-600 rounded-full border border-red-200"><svg data-lucide="trash-2" style="width:14px;height:14px"></svg></button>`;

    const botaoAcesso = temLogin && !perfilTravado
        ? `<button type="button" data-acao="desvincular" data-id="${p.id}" class="w-full flex items-center justify-center gap-1.5 bg-red-50 text-red-600 border border-red-200 text-[11px] py-2 rounded-lg font-bold"><svg data-lucide="user-x" style="width:13px;height:13px"></svg> Remover acesso ao sistema</button>`
        : (!temLogin && p.id ? `
            <button type="button" data-acao="criar-acesso" data-id="${p.id}" class="w-full flex items-center justify-center gap-1.5 bg-emerald-600 text-white text-[11px] py-2 rounded-lg font-bold"><svg data-lucide="user-check" style="width:13px;height:13px"></svg> Criar Acesso (envia e-mail para definir senha)</button>
            <button type="button" data-acao="vincular" data-id="${p.id}" class="w-full text-gray-500 text-[10px] py-1 underline">ou vincular a um login já existente no Supabase</button>
          ` : (!temLogin && !p.id ? '<p class="text-gray-400 text-[10px]">Salve esta pessoa antes de criar o acesso.</p>' : ''));

    return `
        <div class="bg-white p-3 rounded-xl shadow-sm border border-gray-200" data-pessoa-id="${p.id || ''}">
            <div class="flex items-center justify-between gap-2">
                <button type="button" data-acao="alternar-detalhe" data-alvo="${idSeguro}" class="flex-1 min-w-0 text-left">
                    <p class="text-xs font-bold text-slate-900 truncate">${(p.nome || '(sem nome)')}${ehMaster ? ' <svg data-lucide="shield-check" style="width:12px;height:12px;display:inline;vertical-align:-1px;color:var(--pine)"></svg>' : ''}</p>
                    <p class="text-[11px] text-gray-500 truncate">${p.funcao || 'Sem função definida'} · <span class="font-bold uppercase">${p.perfil || 'sem perfil'}</span></p>
                    ${badgesAcessoHtml(modulosPorPerfil, p.perfil)}
                </button>
                <div class="flex gap-1.5 flex-none">
                    <button type="button" data-acao="alternar-detalhe" data-alvo="${idSeguro}" title="Editar" class="w-7 h-7 flex items-center justify-center bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200"><svg data-lucide="pencil" style="width:14px;height:14px"></svg></button>
                    ${botaoRemover}
                </div>
            </div>

            <div id="pessoa-detalhe-${idSeguro}" class="${ehNova ? '' : 'hidden'} mt-3 pt-3 border-t border-gray-100 space-y-2">
                <div>
                    <label class="block text-[11px] font-bold text-gray-500">Nome <span style="color:var(--danger)">*</span></label>
                    <input type="text" class="pessoa-nome w-full p-1.5 border rounded mt-0.5 text-[12px] font-bold" value="${escapeAttr(p.nome)}" placeholder="Nome completo" ${perfilTravado ? 'disabled' : ''}>
                </div>
                <div>
                    <label class="block text-[11px] font-bold text-gray-500">E-mail</label>
                    <input type="email" class="pessoa-email w-full p-1.5 border rounded mt-0.5 text-[12px]" value="${p.email || ''}" placeholder="nome@email.com" ${perfilTravado ? 'disabled' : ''}>
                </div>
                <div>
                    <label class="block text-[11px] font-bold text-gray-500">WhatsApp</label>
                    <input type="tel" class="pessoa-whatsapp w-full p-1.5 border rounded mt-0.5 text-[12px]" value="${p.whatsapp || ''}" placeholder="(11) 91234-5678" ${perfilTravado ? 'disabled' : ''}>
                </div>
                <div>
                    <label class="block text-[11px] font-bold text-gray-500">Função na empresa</label>
                    <input type="text" class="pessoa-funcao w-full p-1.5 border rounded mt-0.5 text-[12px]" value="${p.funcao || ''}" placeholder="Opcional" ${perfilTravado ? 'disabled' : ''}>
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="block text-[11px] font-bold text-gray-500">% de cotas</label>
                        <input type="number" min="0" max="100" step="0.01" class="pessoa-pct-cotas w-full p-1.5 border rounded mt-0.5 text-[12px]" value="${p.percentualCotasEmpresa || ''}" placeholder="Ex.: 50" ${perfilTravado ? 'disabled' : ''}>
                    </div>
                    <div>
                        <label class="block text-[11px] font-bold text-gray-500">Perfil de acesso</label>
                        <select class="pessoa-perfil w-full p-1.5 border rounded mt-0.5 text-[12px] ${podeEditarPerfil ? '' : 'bg-gray-100 text-gray-400'}" ${podeEditarPerfil ? '' : 'disabled'} title="${ehMaster ? 'Perfil master não pode ser alterado pela tela, nem pelo próprio master — só direto no banco' : (podeEditarPerfil ? '' : 'Só master ou admin podem alterar o perfil de acesso')}">
                            <option value="operador" ${p.perfil === 'operador' ? 'selected' : ''}>operador</option>
                            <option value="consulta" ${p.perfil === 'consulta' ? 'selected' : ''}>consulta</option>
                            <option value="admin" ${p.perfil === 'admin' ? 'selected' : ''}>admin</option>
                            ${ehMaster ? `<option value="master" selected>master</option>` : ''}
                        </select>
                        ${podeEditarPerfil ? `<p class="text-[10px] text-gray-400 mt-1">Acesso a módulo depende do perfil — ver badges acima.</p>` : ''}
                    </div>
                </div>
                ${botaoAcesso}
            </div>
        </div>`;
}

// mountEl = elemento container já presente no DOM do host. ctx = {
//   dbAuth, clienteId, perfilLogado,   // perfil de quem está LOGADO agora
//                                       // (rege trava de master/permissão
//                                       // de editar perfil — mesma regra
//                                       // de sempre)
//   onToast(mensagem, tipo),           // opcional
//   registrarLog(acao, detalhe),       // opcional
// }
export async function montarAbaPessoas(mountEl, ctx) {
    if (!mountEl) return;
    const { dbAuth, clienteId, perfilLogado, onToast, registrarLog } = ctx || {};

    mountEl.innerHTML = `
        <div class="flex items-center gap-3 mb-4">
            <h2 class="text-lg font-bold text-emerald-900 flex-1">Pessoas</h2>
            <button type="button" id="cp-btn-nova" class="raiz-btn-toggle w-11 h-11 flex-none flex items-center justify-center bg-white text-slate-700 border border-slate-300 rounded-full shadow active:scale-90 transition" title="Nova pessoa"><svg class="raiz-icone-toggle w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></button>
        </div>
        <p class="text-[11px] text-gray-500 mb-4">Cadastro unificado de sócios e usuários do sistema — quem tem acesso ao app e a divisão societária da empresa.</p>
        <div id="cp-lista" class="space-y-3 mb-4"><p class="text-xs text-center text-gray-400 py-4">Carregando pessoas...</p></div>
        <button type="button" id="cp-btn-salvar" class="w-full bg-emerald-600 text-white p-2.5 rounded-lg font-bold text-sm shadow">Salvar Pessoas</button>
    `;

    if (!dbAuth || !clienteId) {
        document.getElementById('cp-lista').innerHTML = '<p class="text-xs text-gray-500 text-center py-4">Nenhuma empresa carregada.</p>';
        return;
    }

    let pessoas = [];
    let modulosPorPerfil = new Map();
    try {
        [pessoas, modulosPorPerfil] = await Promise.all([
            listarPessoas(dbAuth, clienteId),
            buscarModulosPorPerfil(dbAuth),
        ]);
    } catch (err) {
        console.warn('[comum-pessoas] Falha ao carregar pessoas:', err.message);
        document.getElementById('cp-lista').innerHTML = '<p class="text-xs text-red-500 text-center py-4">Não foi possível carregar as pessoas agora.</p>';
        return;
    }

    function renderLista() {
        const lista = document.getElementById('cp-lista');
        if (!lista) return;
        const visiveis = perfilLogado === 'master' ? pessoas : pessoas.filter(p => p.perfil !== 'master');
        if (visiveis.length === 0) {
            lista.innerHTML = '<p class="text-xs text-center text-gray-400 py-4">Nenhuma pessoa cadastrada. Toque no "+" para adicionar.</p>';
            return;
        }
        lista.innerHTML = visiveis.map((p, idx) => cartaoPessoaHtml(p, idx, { perfilLogado, modulosPorPerfil })).join('');
        if (typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();
    }
    renderLista();

    // -------- delegação de eventos, escopada ao container (não document —
    // evita colisão com outros módulos que também delegam) --------
    mountEl.addEventListener('click', async (ev) => {
        const alvo = ev.target.closest('[data-acao]');
        if (!alvo) return;
        const acao = alvo.dataset.acao;
        const id = alvo.dataset.id;

        if (acao === 'alternar-detalhe') {
            document.getElementById('pessoa-detalhe-' + alvo.dataset.alvo)?.classList.toggle('hidden');
            return;
        }

        if (acao === 'remover') {
            if (!id) { pessoas = pessoas.filter(p => p.id !== null); renderLista(); return; }
            const pessoa = pessoas.find(p => p.id === id);
            if (pessoa && (pessoa.perfil === 'admin' || pessoa.perfil === 'master')) {
                alert('🔒 Usuários master não podem ser excluídos por aqui — é uma proteção proposital, contra remover o próprio administrador por engano. Se for realmente necessário, precisa ser feito direto no banco.');
                return;
            }
            if (!confirm('Remover esta pessoa? Se ela tiver login, o acesso dela ao sistema também será removido.')) return;
            try {
                const { error } = await dbAuth.from('pessoas').delete().eq('id', id);
                if (error) throw error;
                pessoas = pessoas.filter(p => p.id !== id);
                renderLista();
                registrarLog?.('pessoas.excluir', { pessoaId: id });
            } catch (err) {
                alert('❌ Falha ao remover: ' + err.message);
            }
            return;
        }

        if (acao === 'vincular') {
            const uuid = prompt('Cole aqui o UUID do usuário (Supabase → Authentication → Users → copiar o ID do usuário já criado):');
            if (!uuid) return;
            const perfil = prompt('Perfil de acesso — opções: admin, operador, consulta' + (perfilLogado === 'master' ? ', master' : ''), 'operador');
            if (!perfil) return;
            try {
                const { error } = await dbAuth.from('pessoas').update({ user_id: uuid.trim(), perfil: perfil.trim() }).eq('id', id);
                if (error) throw error;
                alert('✅ Login vinculado com sucesso.');
                registrarLog?.('pessoas.acesso.aprovar', { pessoaId: id, perfil: perfil.trim(), via: 'vinculacao_manual' });
                pessoas = await listarPessoas(dbAuth, clienteId);
                renderLista();
            } catch (err) {
                alert('❌ Falha ao vincular login: ' + err.message + '\n\nConfira se o UUID está certo e se já não está vinculado a outra pessoa deste mesmo cliente.');
            }
            return;
        }

        if (acao === 'desvincular') {
            if (!confirm('Remover o acesso ao sistema desta pessoa? Ela continua cadastrada, só perde o login.')) return;
            try {
                const { error } = await dbAuth.from('pessoas').update({ user_id: null, perfil: null }).eq('id', id);
                if (error) throw error;
                registrarLog?.('pessoas.acesso.revogar', { pessoaId: id });
                pessoas = await listarPessoas(dbAuth, clienteId);
                renderLista();
            } catch (err) {
                alert('❌ Falha: ' + err.message);
            }
            return;
        }

        if (acao === 'criar-acesso') {
            const pessoa = pessoas.find(p => p.id === id);
            if (!pessoa) return;
            if (!pessoa.email) { alert('⚠️ Esta pessoa não tem e-mail cadastrado. Preencha o e-mail antes de criar o acesso.'); return; }
            if (pessoa.userId) { alert('Esta pessoa já tem acesso ao sistema.'); return; }

            const perfilEscolhido = prompt('Perfil de acesso para ' + pessoa.nome + ':\n\nOpções: admin, operador, consulta' + (perfilLogado === 'master' ? ', master' : ''), 'operador');
            if (!perfilEscolhido) return;

            const senhaAleatoria = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10).toUpperCase() + '!1';

            try {
                // Client TEMPORÁRIO, isolado (persistSession:false) — nunca
                // toca no localStorage da sessão de quem está usando a
                // tela. Ver nota completa no changelog do topo do arquivo.
                const { createClient } = window.supabase;
                const clienteTemp = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

                const { data: signUpData, error: signUpError } = await clienteTemp.auth.signUp({ email: pessoa.email, password: senhaAleatoria });
                if (signUpError) { alert('❌ Falha ao criar acesso: ' + signUpError.message); return; }

                const { error: updateError } = await dbAuth.from('pessoas').update({ user_id: signUpData.user.id, perfil: perfilEscolhido.trim() }).eq('id', id);
                if (updateError) { alert('❌ Conta criada, mas falhou ao vincular à pessoa: ' + updateError.message); return; }

                await clienteTemp.auth.resetPasswordForEmail(pessoa.email, { redirectTo: window.location.href.split('?')[0].split('#')[0] });

                registrarLog?.('pessoas.acesso.criar', { pessoaId: id, nome: pessoa.nome, email: pessoa.email, perfil: perfilEscolhido.trim() });
                onToast?.('Acesso criado — e-mail de definição de senha enviado.', 'success');
                pessoas = await listarPessoas(dbAuth, clienteId);
                renderLista();
            } catch (err) {
                alert('❌ Falha ao criar acesso: ' + err.message);
            }
            return;
        }
    });

    document.getElementById('cp-btn-nova').addEventListener('click', () => {
        pessoas.push({ id: null, nome: '', email: '', whatsapp: '', funcao: '', percentualCotasEmpresa: null, userId: null, perfil: null });
        renderLista();
        const lista = document.getElementById('cp-lista');
        if (lista && lista.lastElementChild) lista.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    document.getElementById('cp-btn-salvar').addEventListener('click', async () => {
        const lista = document.getElementById('cp-lista');
        const cards = lista.querySelectorAll('[data-pessoa-id]');
        let algumErro = false;

        for (const card of cards) {
            const id = card.getAttribute('data-pessoa-id');
            const nomeInput = card.querySelector('.pessoa-nome');
            const nome = nomeInput.value.trim();
            if (!nome) continue; // ignora linhas sem nome preenchido
            if (nomeInput.disabled) continue; // trava de segurança (perfil master travado)

            const pctInput = card.querySelector('.pessoa-pct-cotas');
            const perfilInput = card.querySelector('.pessoa-perfil');

            const dadosPessoa = {
                cliente_id: clienteId,
                nome,
                email: card.querySelector('.pessoa-email').value.trim() || null,
                whatsapp: card.querySelector('.pessoa-whatsapp').value.trim() || null,
                funcao: card.querySelector('.pessoa-funcao').value.trim() || null,
                percentual_cotas_empresa: (pctInput && pctInput.value !== '') ? parseFloat(pctInput.value) : null,
            };
            // Perfil só é gravado se a pessoa já tem login (select vem
            // desabilitado e sem valor útil quando não tem) — evita
            // sobrescrever com lixo.
            if (perfilInput && !perfilInput.disabled) dadosPessoa.perfil = perfilInput.value;

            try {
                if (id) {
                    const { error } = await dbAuth.from('pessoas').update(dadosPessoa).eq('id', id);
                    if (error) throw error;
                } else {
                    const { error } = await dbAuth.from('pessoas').insert(dadosPessoa);
                    if (error) throw error;
                }
            } catch (err) {
                algumErro = true;
                console.warn('[comum-pessoas] Erro ao salvar pessoa "' + nome + '":', err.message);
            }
        }

        try {
            pessoas = await listarPessoas(dbAuth, clienteId);
        } catch { /* mantém lista atual se o reload falhar */ }
        renderLista();
        alert(algumErro ? '⚠️ Alguma(s) pessoa(s) não foram salvas — veja o console para detalhes.' : '✅ Pessoas salvas com sucesso.');
    });
}
