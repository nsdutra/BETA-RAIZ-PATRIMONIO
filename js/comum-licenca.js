// ============================================================================
// comum-licenca.js — Raiz Patrimônio · Administração compartilhada
// Versão: 1.5.3 · 07/10/2026
//
// v1.5.2 (07/10/2026, sessão 20261007-1721-rolo-changelog, demanda 2507d554 — VER-06, "de acordo" do Nicola 07/10 17:21) — SÓ
// CABEÇALHO: as versões além das 5 mais recentes rolaram para o CHANGELOG_MODULOS.md.
// Nenhuma linha de código mudou — conferido token a token contra o publicado.
//
// Versão anterior: 1.5.1 · 01/10/2026
//
// v1.5.1 — pedido do Nicola (01/10): a lista "Limites do plano" deixa de ter
// rolagem própria (max-h-96 overflow-y-auto saiu); a tela rola inteira.
//
// Versão anterior: 1.5.0 · 30/09/2026
//
// v1.5.0 — RENOVAR OU AMPLIAR (demanda 1899fe67, ficha F10, frente 1). O card
// "Plano atual" ganha uma linha "Renovar ou ampliar o plano" (só para o módulo
// imoveis, que é o que fn_ofertas_renovacao cobre) que abre o Sheet de
// js/comum-renovacao.js (ofertas, QR Pix, "Já paguei"). ctx.toast é opcional.
// Nenhuma regra de porta/limite mudou.
//
// Versão anterior: 1.4.0 · 22/09/2026
//
// v1.4.0 — PORTA DE LICENÇA COMPARTILHADA (demanda 8b2d37d7, C4 do soft
// launch). FUNCIONALIDADES_LIBERADAS / carregarFuncionalidadesLiberadas() /
// podeUsar() / rzMostrarBloqueio() existiam só no <script> inline do
// index.html; o cofre.html nunca definia window.podeUsar, então todo gate
// defensivo do Cofre (window.podeUsar ? … : true) caía no permissivo e os
// botões "Novo ativo" abriam o formulário sem cadeado (quem barrava era a
// trigger no INSERT, com texto cru do Postgres). A lógica mudou-se para cá,
// SEM mudança de regra: mesma RPC (fn_funcionalidades_liberadas), mesmos
// textos, mesmo "código ausente do catálogo = liberado" (o furo 1 da
// 70159adb segue registrado lá; não entra nesta fatia).
//   · carregarFuncionalidadesLiberadas(dbAuth, clienteId, perfil, {toast})
//   · recarregarFuncionalidadesLiberadas() — mesma empresa/perfil da última
//     carga (usado depois de criar um item que consome cota)
//   · podeUsar(codigo) / rzMostrarBloqueio(codigo)
//   · aplicarCadeados(raiz) — todo elemento com data-rz-codigo ganha
//     .rz-off + aria-disabled + title com o motivo (ACE-04: bloqueado
//     aparece com cadeado e motivo, não some)
//   · instalarPortaGlobal({dbAuth, clienteId, perfil, toast}) — para hosts
//     que não têm porta própria (cofre.html standalone): publica
//     window.podeUsar/rzMostrarBloqueio e recarrega ao voltar para a aba.
// O index.html passou a delegar para cá (v1.248.0): uma lógica só (CAN-03).
//
// Versão anterior: 1.3.1 · 07/09/2026
//
// v1.3.1 — CORREÇÃO: a v1.3.0 fazia select('...cota_tipo') direto em
// `funcionalidades`, coluna derrubada horas depois na unificação com
// comercial.categoria_licenca (migration
// unificar_categoria_licenca_fn_uso_funcionalidade_v1). O select falhava
// (capturado pelo try/catch), então TODA linha caía no fallback: nome
// técnico bruto em vez de nome comercial, e "mensal" pra tudo (a Rumo
// mostraria "49/50 no mês" em vez de "49/50 em uso"). Corrigido: busca só
// nome_comercial ali; cota_tipo agora deriva de id_categoria (que já vem
// de plano_funcionalidade) + comercial.categoria_licenca.item, com a
// MESMA regra que fn_funcionalidades_liberadas usa no banco.
// --------------------------------------------------------------------------
// Versões anteriores (v1.0.0 … v1.3.0): CHANGELOG_MODULOS.md, na raiz do repositório — o
// gerar_versoes.py rola pra lá automaticamente tudo além das 5 versões
// mais recentes deste cabeçalho (VER-06).

export const VERSAO = '1.5.3'; // v-check (22/09/2026): lido por Dev › Versões — manter igual ao header
export const COMUM_LICENCA_VERSAO = '1.0.0';

// ----------------------------------------------------------------------------
// PORTA DE LICENÇA (v1.4.0) — plano → perfil → limite, lida de uma vez da RPC
// fn_funcionalidades_liberadas (a mesma regra do bot). Estado do módulo: uma
// instância por página (o import map do index.html e o import estático do
// Cofre resolvem para o mesmo arquivo).
// ----------------------------------------------------------------------------
let _liberadas = new Map();
let _ultimaCarga = null;       // { dbAuth, clienteId, perfil }
let _toast = null;             // (texto, tipo) => void, fornecido pelo host

export async function carregarFuncionalidadesLiberadas(dbAuth, clienteId, perfil, opcoes = {}) {
    if (typeof opcoes.toast === 'function') _toast = opcoes.toast;
    _liberadas = new Map();
    if (!dbAuth || !clienteId || !perfil) return _liberadas;
    _ultimaCarga = { dbAuth, clienteId, perfil };
    try {
        const { data, error } = await dbAuth.rpc('fn_funcionalidades_liberadas', { p_cliente_id: clienteId, p_perfil: perfil });
        if (error) throw error;
        (data || []).forEach(f => _liberadas.set(f.codigo, f));
    } catch (err) {
        console.warn('[comum-licenca] carregarFuncionalidadesLiberadas:', err.message);
    }
    return _liberadas;
}

export async function recarregarFuncionalidadesLiberadas() {
    if (!_ultimaCarga) return _liberadas;
    const { dbAuth, clienteId, perfil } = _ultimaCarga;
    await carregarFuncionalidadesLiberadas(dbAuth, clienteId, perfil);
    aplicarCadeados();
    return _liberadas;
}

export function funcionalidadesLiberadasCarregadas() { return _liberadas.size > 0; }

// Retorna { ok, motivo, rotulo, limite, usado, avisar, textoCurto, textoLongo }.
// Código ausente do catálogo = liberado (não inventa bloqueio) — mas avisa no
// console pra virar linha no catálogo depois. As frases batem com
// fn_porta_texto() no banco (migration c3_porta_amigos_v1): mudou aqui, muda lá.
export function podeUsar(codigo) {
    if (!codigo) return { ok: true, motivo: null };
    const f = _liberadas.get(codigo);
    if (!f) {
        if (_liberadas.size) console.warn('podeUsar: código fora do catálogo:', codigo);
        return { ok: true, motivo: null, rotulo: codigo };
    }
    const rot = f.rotulo || codigo;
    const t = {
        sem_licenca:     ['Não incluído no plano',      f.aviso_padrao || `"${rot}" não faz parte do plano atual da empresa. Fale com a Raiz pra ampliar.`],
        // estoque = teto do que existe; bytes = MB; mensal = eventos do mês.
        limite_atingido: f.cota_tipo === 'estoque'
            ? [`Limite do plano (${f.usado} de ${f.limite})`, f.aviso_padrao || `Sua empresa chegou ao teto de ${f.limite} em "${rot}" do plano atual. Fale com a Raiz pra ampliar.`]
            : f.cota_tipo === 'bytes'
            ? [`Espaço esgotado (${f.usado} de ${f.limite} MB)`, f.aviso_padrao || `Sua empresa usou os ${f.limite} MB de armazenamento do plano atual. Fale com a Raiz pra ampliar.`]
            : [`Limite do mês (${f.usado} de ${f.limite})`, f.aviso_padrao || `Sua empresa já usou os ${f.limite} de "${rot}" deste mês. Fale com a Raiz pra ampliar.`],
        sem_perfil:      ['Sem permissão no seu perfil', `Seu perfil não tem "${rot}". Peça ao administrador da empresa.`],
    }[f.motivo] || [null, null];
    return { ok: !f.motivo, motivo: f.motivo, rotulo: rot, limite: f.limite, usado: f.usado, avisar: f.avisar, textoCurto: t[0], textoLongo: t[1] };
}

// true = bloqueado (e já avisou). Mesmo contrato do inline antigo do index.
export function rzMostrarBloqueio(codigo) {
    const b = podeUsar(codigo);
    if (b.ok) return false;
    if (_toast) _toast(b.textoLongo, b.motivo === 'sem_perfil' ? 'danger' : 'info');
    else console.warn('[comum-licenca] bloqueado:', b.textoLongo);
    return true;
}

// ACE-04 — elemento com data-rz-codigo fica opaco, com cadeado e o motivo no
// title. O clique continua chegando na ação, que chama rzMostrarBloqueio().
export function aplicarCadeados(raiz) {
    const base = raiz || (typeof document !== 'undefined' ? document : null);
    if (!base || !base.querySelectorAll) return;
    base.querySelectorAll('[data-rz-codigo]').forEach(el => {
        if (el.dataset.rzTituloOriginal === undefined) el.dataset.rzTituloOriginal = el.getAttribute('title') || '';
        const b = podeUsar(el.getAttribute('data-rz-codigo'));
        el.classList.toggle('rz-off', !b.ok);
        el.setAttribute('aria-disabled', b.ok ? 'false' : 'true');
        el.setAttribute('title', b.ok ? el.dataset.rzTituloOriginal : (b.textoCurto || 'Indisponível'));
    });
}

// Host sem porta própria (cofre.html standalone). Se o host já publicou
// window.podeUsar (index.html), não sobrescreve — só aplica os cadeados.
let _instalada = false;
export async function instalarPortaGlobal({ dbAuth, clienteId, perfil, toast } = {}) {
    if (typeof window === 'undefined') return;
    if (typeof toast === 'function' && !_toast) _toast = toast;
    const hostTemPorta = typeof window.podeUsar === 'function' && !window.podeUsar.__rzModulo;
    if (!hostTemPorta) {
        await carregarFuncionalidadesLiberadas(dbAuth, clienteId, perfil, { toast });
        const pu = (c) => podeUsar(c); pu.__rzModulo = true;
        window.podeUsar = pu;
        window.rzMostrarBloqueio = (c) => rzMostrarBloqueio(c);
        if (!_instalada) {
            _instalada = true;
            let ultima = Date.now();
            document.addEventListener('visibilitychange', async () => {
                if (document.visibilityState !== 'visible' || Date.now() - ultima < 60000) return;
                ultima = Date.now();
                await recarregarFuncionalidadesLiberadas();
            });
        }
    }
    aplicarCadeados();
}

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
    let cotaTipos = {}; // v1.3.1 — mensal | estoque | bytes, derivado da categoria (ver abaixo)
    try {
        const codigos = funcs.map(f => f.funcionalidade_codigo).filter(Boolean);
        const { data: info } = await dbAuth
            .from('funcionalidades').select('codigo, nome_comercial').in('codigo', codigos);
        (info || []).forEach(fi => { if (fi.nome_comercial) nomesComerciais[fi.codigo] = fi.nome_comercial; });
    } catch (errNomes) {
        console.warn('[comum-licenca] Nomes comerciais indisponíveis, seguindo com código técnico:', errNomes.message);
    }
    // v1.3.1 — cota_tipo NÃO existe mais em funcionalidades (derrubada na
    // unificação com comercial.categoria_licenca, 07/09). `funcs` (de
    // plano_funcionalidade) já traz `id_categoria`; busca só o item da
    // categoria (tabela de 5 linhas) e deriva com a MESMA regra da RPC
    // fn_funcionalidades_liberadas (item_custodia→estoque,
    // bytes_custodia→bytes, resto→mensal) — pra nunca divergir do que o
    // resto do app mostra.
    try {
        const idsCategoria = [...new Set(funcs.map(f => f.id_categoria).filter(Boolean))];
        if (idsCategoria.length) {
            const { data: cats } = await dbAuth.schema('comercial')
                .from('categoria_licenca').select('id_categoria_licenca, item').in('id_categoria_licenca', idsCategoria);
            const itemPorCategoria = {};
            (cats || []).forEach(c => { itemPorCategoria[c.id_categoria_licenca] = c.item; });
            funcs.forEach(f => {
                const item = itemPorCategoria[f.id_categoria];
                const codigo = f.funcionalidade_codigo || f.funcionalidade || f.codigo;
                cotaTipos[codigo] = item === 'item_custodia' ? 'estoque' : item === 'bytes_custodia' ? 'bytes' : 'mensal';
            });
        }
    } catch (errCat) {
        console.warn('[comum-licenca] Categoria de cota indisponível, assumindo mensal:', errCat.message);
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
            cotaTipo: cotaTipos[codigo] || 'mensal',
        };
    });
}

// ----------------------------------------------------------------------------
// CAMADA DE UI
// ----------------------------------------------------------------------------

const NOMES_MODULO = { imoveis: 'Imóveis', cofre: 'Cofre de Documentos', gestao: 'Gestão' };

function cardLicencaHtml(licenca, funcionalidades, mostrarRotuloModulo) {
    const nomePlano = licenca.plano_codigo || '-';
    const status = licenca.status ? licenca.status.charAt(0).toUpperCase() + licenca.status.slice(1) : '-'; // v1.2.0 — sentence case
    const inicio = licenca.data_inicio ? new Date(licenca.data_inicio).toLocaleDateString('pt-BR') : '-';
    const fim = licenca.data_expiracao ? new Date(licenca.data_expiracao).toLocaleDateString('pt-BR') : 'sem data de expiração';

    const tituloModulo = mostrarRotuloModulo
        ? `<p class="text-xs font-semibold mb-1" style="color:var(--muted)">${NOMES_MODULO[licenca.modulo] || licenca.modulo}</p>`
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
                        <span class="text-xs font-bold text-slate-700">${f.rotulo} <span class="text-[10px] font-normal text-slate-400">· ${f.cotaTipo === 'estoque' ? 'em uso' : f.cotaTipo === 'bytes' ? 'MB' : 'no mês'}</span></span>
                        <span class="text-[11px] font-bold ${pct >= 100 ? 'text-red-600' : pct >= 80 ? 'text-amber-600' : 'text-slate-500'}">${f.usado}${f.cotaTipo === 'bytes' ? ' MB' : ''} / ${f.limite}${f.cotaTipo === 'bytes' ? ' MB' : ''}</span>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-1.5">
                        <div class="h-1.5 rounded-full" style="width:${pct}%;${corBarraStyle}"></div>
                    </div>
                    ${f.limiteAviso ? `<p class="text-[10px] text-gray-400 mt-1">Aviso a partir de ${f.limiteAviso}</p>` : ''}
                </div>`;
        }).join('');

    return `
        <div class="rz-card">
            ${tituloModulo}
            <div class="rz-card-h"><h3>Plano atual</h3></div>
            <div class="space-y-2">
                <div class="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span class="text-sm text-slate-600">Plano</span>
                    <span class="text-sm font-black" style="color:var(--pine)">${nomePlano}</span>
                </div>
                <div class="flex justify-between items-center pb-2 border-b border-gray-200">
                    <span class="text-sm text-slate-600">Status</span>
                    <span class="text-sm font-bold" style="color:var(--pine)">${status}</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-sm text-slate-600">Vigência</span>
                    <span class="text-sm font-bold text-slate-600">${inicio} até ${fim}</span>
                </div>
            </div>
            ${licenca.modulo === 'imoveis' ? `<div class="rz-row rz-link" data-rz-renovar="1" style="margin-top:8px"><div class="rz-ic"><svg data-lucide="refresh-cw"></svg></div><div class="rz-tx"><b>Renovar ou ampliar o plano</b><span>Ver ofertas e pagar por Pix</span></div><svg data-lucide="chevron-right" class="rz-chev"></svg></div>` : ''}
        </div>
        <div class="rz-card">
            <div class="rz-card-h"><h3>Limites do plano</h3><span class="rz-sub">o que conta em cada cota está ao lado do nome</span></div>
            <div class="space-y-3">${funcsHtml}</div>
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
                <div class="rz-card">
                    <div class="rz-card-h"><h3>Plano atual</h3></div>
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
        mountEl.querySelectorAll('[data-rz-renovar]').forEach((el) => el.addEventListener('click', async () => {
            try {
                const { abrirRenovacao } = await import('./comum-renovacao.js');
                await abrirRenovacao({ dbAuth, clienteId, toast: ctx.toast });
            } catch (err) {
                console.warn('[comum-licenca] Falha ao abrir renovação:', err.message);
                if (typeof ctx.toast === 'function') ctx.toast('Não foi possível abrir a renovação agora.', 'danger');
            }
        }));
        if (typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();

    } catch (err) {
        console.warn('[comum-licenca] Erro ao carregar Licença:', err.message);
        mountEl.innerHTML = '<p class="text-xs text-red-500 text-center py-8">Não foi possível carregar as funcionalidades agora. Tente novamente em instantes.</p>';
    }
}
