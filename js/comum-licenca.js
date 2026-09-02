// ============================================================================
// comum-licenca.js — Raiz Patrimônio · Administração compartilhada
// Versão: 1.1.0 · 02/09/2026
//
// v1.1.0 — pedido explícito: "resolva as pendências de cores listadas".
// 3 usos de emerald-* trocados: barra de uso (era bg-emerald-500, é
// status semântico — DS §14 — virou var(--success), par de
// var(--danger)/var(--warning) que os outros 2 estados já usavam
// hardcoded fora de token também, corrigidos junto); nome do plano e
// status viraram var(--pine).
//
// v1.0.0 — PRIMEIRA VERSÃO. Extraído de index.html (Beta v1.63.0 —
// inicializarLicenca()/carregarLicencaAtual()) pra módulo compartilhado —
// pedido explícito do usuário: Pessoas/Minha Empresa/Licença/Sobre são
// telas de ADMINISTRAÇÃO DO CLIENTE (empresa), não do módulo Imóveis —
// hoje moram só dentro de index.html, mas o Cofre (e módulos futuros)
// também precisam delas. Em vez de duplicar HTML/lógica em cada app (o
// que index.html v1.62.3 já vinha evitando com um deep-link pra cá —
// ?ir=tab-licenca — como remendo temporário), este módulo vira a ÚNICA
// fonte: qualquer host importa e chama montarAbaLicenca(). Começando por
// Licença e Sobre (menos funções/elementos); Pessoas e Minha Empresa
// ficam pra uma próxima rodada, mesmo padrão.
//
// MUDANÇA DE CONCEITO nesta extração (não é só mover código de lugar):
// a versão antiga buscava só a licença do módulo 'imoveis', hardcoded
// (`.eq('modulo', 'imoveis')` em 3 pontos diferentes de index.html).
// Essa tela agora é de administração GERAL do cliente, então busca TODAS
// as licenças do cliente_id, sem filtro de módulo. Confirmado contra o
// banco ao vivo (Supabase MCP, 26/08/2026): hoje são 10 clientes com
// licença só de 'imoveis' e 1 cliente com 'imoveis'+'gestao' — ou seja,
// pra quase todo mundo o resultado visual continua sendo exatamente 1
// card, idêntico a antes. Mas quando o Cofre (ou outro módulo futuro)
// ganhar sua própria linha em `licencas`, ela aparece aqui sozinha, sem
// precisar tocar neste arquivo de novo.
//
// Diretriz Arquitetural (mesma já usada no Cofre — ver cofre-api.js, e
// em comunicacoes-app.js dentro do próprio index.html): este módulo NÃO
// cria seu próprio cliente Supabase. Recebe `dbAuth` (o client já
// autenticado do app hospedeiro) por parâmetro em toda função — evita
// abrir uma 2ª sessão/round-trip de auth dentro da mesma página. Quem
// hospeda (index.html, cofre.html, ou um módulo futuro) é quem decide
// COMO obtém esse client; este arquivo só usa o que recebe.
// ============================================================================

export const COMUM_LICENCA_VERSAO = '1.0.0';

// ----------------------------------------------------------------------------
// CAMADA DE DADOS
// ----------------------------------------------------------------------------

// Todas as licenças do cliente, qualquer módulo — sem filtro de
// propósito (ver nota de changelog acima).
export async function listarLicencasDoCliente(dbAuth, clienteId) {
    if (!clienteId) return [];
    const { data, error } = await dbAuth
        .from('licencas')
        .select('*')
        .eq('cliente_id', clienteId)
        .order('modulo', { ascending: true });
    if (error) {
        console.warn('[comum-licenca] Falha ao listar licenças:', error.message);
        return [];
    }
    return data || [];
}

// "Licença principal" — resumo de UMA licença só, usado pelo card
// compacto da aba Sobre (ou qualquer tela que não precise da lista
// inteira). Prioridade: 1ª ATIVA do módulo 'imoveis' > 1ª ATIVA
// qualquer > 1ª da lista mesmo que inativa > null. 'imoveis' como
// preferência é só continuidade do comportamento de antes (é o produto
// principal hoje) — não é uma regra de negócio nova.
export function escolherLicencaPrincipal(licencas) {
    if (!licencas || licencas.length === 0) return null;
    const ativas = licencas.filter(l => l.status === 'ativo');
    const pool = ativas.length > 0 ? ativas : licencas;
    return pool.find(l => l.modulo === 'imoveis') || pool[0];
}

export async function buscarLicencaPrincipal(dbAuth, clienteId) {
    return escolherLicencaPrincipal(await listarLicencasDoCliente(dbAuth, clienteId));
}

// Funcionalidades com limite configurado pro plano de UMA licença —
// mesma consulta de antes (index.html inicializarLicenca()), só
// parametrizada por módulo em vez de sempre 'imoveis' na hora de checar
// o uso via fn_verificar_limite.
async function buscarFuncionalidadesDoPlano(dbAuth, clienteId, licenca) {
    // Sem "join" embutido de propósito (herdado da versão original) —
    // reduz a chance de quebrar por nome de relação/FK que este módulo
    // não tem como confirmar sozinho contra o schema de cada instalação.
    const { data: funcs, error: errFuncs } = await dbAuth
        .from('plano_funcionalidade')
        .select('*')
        .eq('plano_codigo', licenca.plano_codigo)
        .not('limite', 'is', null);
    if (errFuncs) throw errFuncs;
    if (!funcs || funcs.length === 0) return [];

    // Nomes amigáveis (nome_comercial) em vez do código técnico bruto —
    // busca separada; se falhar, segue com o código técnico mesmo
    // (nunca quebra a tela toda por causa disso).
    let nomesComerciais = {};
    try {
        const codigos = funcs.map(f => f.funcionalidade_codigo).filter(Boolean);
        const { data: info } = await dbAuth
            .from('funcionalidades').select('codigo, nome_comercial').in('codigo', codigos);
        (info || []).forEach(fi => { if (fi.nome_comercial) nomesComerciais[fi.codigo] = fi.nome_comercial; });
    } catch (errNomes) {
        console.warn('[comum-licenca] Nomes comerciais indisponíveis, seguindo com código técnico:', errNomes.message);
    }

    const usos = await Promise.all(funcs.map(f => {
        const codigo = f.funcionalidade_codigo || f.funcionalidade || f.codigo;
        return dbAuth.rpc('fn_verificar_limite', { p_cliente_id: clienteId, p_modulo: licenca.modulo, p_funcionalidade: codigo })
            .then(r => Array.isArray(r.data) ? r.data[0] : r.data)
            .catch(() => null);
    }));

    return funcs.map((f, i) => {
        const codigo = f.funcionalidade_codigo || f.funcionalidade || f.codigo || '-';
        return {
            codigo,
            rotulo: nomesComerciais[codigo] || codigo,
            usado: (usos[i] && usos[i].usado != null) ? usos[i].usado : 0,
            limite: f.limite,
            limiteAviso: f.limite_aviso,
        };
    });
}

// ----------------------------------------------------------------------------
// CAMADA DE UI
// ----------------------------------------------------------------------------

const NOMES_MODULO = { imoveis: 'Imóveis', cofre: 'Cofre de Documentos', gestao: 'Gestão' };

function cardLicencaHtml(licenca, funcionalidades, mostrarRotuloModulo) {
    const nomePlano = licenca.plano_codigo || '-';
    const status = (licenca.status || '-').toUpperCase();
    const inicio = licenca.data_inicio ? new Date(licenca.data_inicio).toLocaleDateString('pt-BR') : '-';
    const fim = licenca.data_expiracao ? new Date(licenca.data_expiracao).toLocaleDateString('pt-BR') : 'sem data de expiração';

    const tituloModulo = mostrarRotuloModulo
        ? `<p class="text-[11px] font-black uppercase tracking-wide mb-1" style="color:var(--brass-deep)">${NOMES_MODULO[licenca.modulo] || licenca.modulo}</p>`
        : '';

    const funcsHtml = funcionalidades.length === 0
        ? '<p class="text-xs text-gray-500 text-center py-4">Este plano não tem funcionalidades com limite configurado.</p>'
        : funcionalidades.map(f => {
            const pct = f.limite ? Math.min(100, Math.round((f.usado / f.limite) * 100)) : 0;
            // v1.4.0 (02/09/2026) — barra de uso é status semântico
            // (perigo/atenção/OK), token certo por definição (DS §14).
            const corBarraStyle = pct >= 100 ? 'background:var(--danger)' : (pct >= 80 ? 'background:var(--warning)' : 'background:var(--success)');
            return `
                <div class="border-2 border-slate-300 rounded-xl p-2.5">
                    <div class="flex justify-between items-center mb-1">
                        <span class="text-xs font-bold text-slate-700">${f.rotulo}</span>
                        <span class="text-[11px] font-bold text-slate-500">${f.usado} / ${f.limite}</span>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-1.5">
                        <div class="h-1.5 rounded-full" style="width:${pct}%;${corBarraStyle}"></div>
                    </div>
                    ${f.limiteAviso ? `<p class="text-[10px] text-gray-400 mt-1">Aviso a partir de ${f.limiteAviso}</p>` : ''}
                </div>`;
        }).join('');

    return `
        <div class="bg-white rounded-xl border border-gray-200 p-4 mb-4">
            ${tituloModulo}
            <p class="text-[11px] text-gray-400 uppercase tracking-widest font-bold mb-3">Plano Atual</p>
            <div class="space-y-2">
                <div class="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span class="text-sm font-bold text-slate-700">Plano:</span>
                    <span class="text-sm font-black" style="color:var(--pine)">${nomePlano}</span>
                </div>
                <div class="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span class="text-sm font-bold text-slate-700">Status:</span>
                    <span class="text-sm font-bold" style="color:var(--pine)">${status}</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-sm font-bold text-slate-700">Vigência:</span>
                    <span class="text-sm font-bold text-slate-600">${inicio} até ${fim}</span>
                </div>
            </div>
        </div>
        <div class="bg-white rounded-xl border border-gray-200 p-4 mb-4">
            <p class="text-[11px] text-gray-400 uppercase tracking-widest font-bold mb-3">Funcionalidades Ativas com Limites</p>
            <div class="space-y-3 max-h-96 overflow-y-auto">${funcsHtml}</div>
        </div>`;
}

// Ponto de entrada da tela. mountEl = elemento container já presente no
// DOM do host (ex.: <div id="mount-licenca"> dentro de <section
// id="tab-licenca">, no index.html). ctx = { dbAuth, clienteId }.
//
// Chamar de novo a qualquer momento re-renderiza do zero (idempotente) —
// mesmo comportamento de "sob demanda" que switchTab('tab-licenca') já
// fazia em index.html chamando inicializarLicenca().
export async function montarAbaLicenca(mountEl, ctx) {
    if (!mountEl) return;
    const { dbAuth, clienteId } = ctx || {};

    mountEl.innerHTML = '<p class="text-xs text-gray-500 text-center py-8">Carregando funcionalidades...</p>';

    if (!clienteId || !dbAuth) {
        mountEl.innerHTML = '<p class="text-xs text-gray-500 text-center py-8">Nenhuma empresa carregada.</p>';
        return;
    }

    try {
        const licencas = await listarLicencasDoCliente(dbAuth, clienteId);

        if (licencas.length === 0) {
            mountEl.innerHTML = `
                <div class="bg-white rounded-xl border border-gray-200 p-4 mb-4">
                    <p class="text-[11px] text-gray-400 uppercase tracking-widest font-bold mb-3">Plano Atual</p>
                    <p class="text-sm text-gray-500 text-center py-4">Nenhuma licença encontrada para esta empresa.</p>
                </div>`;
            return;
        }

        // Rótulo de módulo só aparece quando há mais de 1 licença — pra
        // quem tem só 'imoveis' (praticamente todo mundo hoje), a tela
        // fica pixel-idêntica à versão anterior.
        const mostrarRotuloModulo = licencas.length > 1;

        const blocos = await Promise.all(licencas.map(async (lic) => {
            try {
                const funcs = await buscarFuncionalidadesDoPlano(dbAuth, clienteId, lic);
                return cardLicencaHtml(lic, funcs, mostrarRotuloModulo);
            } catch (err) {
                console.warn('[comum-licenca] Falha ao carregar funcionalidades do módulo', lic.modulo, ':', err.message);
                return cardLicencaHtml(lic, [], mostrarRotuloModulo) +
                    '<p class="text-[11px] text-red-500 text-center -mt-2 mb-4">Não foi possível carregar as funcionalidades deste plano agora.</p>';
            }
        }));

        mountEl.innerHTML = blocos.join('');
        if (typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();

    } catch (err) {
        console.warn('[comum-licenca] Erro ao carregar Licença:', err.message);
        mountEl.innerHTML = '<p class="text-xs text-red-500 text-center py-8">Não foi possível carregar as funcionalidades agora. Tente novamente em instantes.</p>';
    }
}
