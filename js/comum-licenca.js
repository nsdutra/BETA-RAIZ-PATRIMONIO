// ============================================================================
// comum-licenca.js — Raiz Patrimônio · Administração compartilhada
// Versão: 1.6.0 · 08/10/2026
//
// v1.6.0 (UX F2.7c-1, demanda b8602a3a, sessão 20261003-1707-ux-base; plano F2.7c-1 aprovado pelo Nicola 08/10 12:51) — a tela Sobre saiu do
// app e o que era de plano veio para cá:
//   · "Contratar e convidar" (teste): "Quero contratar" pelo WhatsApp e o convite para o mesmo teste
//     (até 5 pessoas); licença paga: "Indicar o Raiz". htmlContratarConvidar/ligarContratarConvidar são
//     exportadas e a Sobre do cofre.html usa as mesmas (uma fonte só).
//   · "Dúvidas sobre o plano?" leva à página de contatos da Raiz (LINK_CONTATOS_RAIZ, raizpatrimonio.com.br/#falar).
//   · Tela no padrão: descrição no topo, status do plano numa das 5 semânticas, plano e vigência em
//     .rz-kv, limites em linhas com barra .rz-uso-bar; sem texto abaixo de 12 px nem cor Tailwind;
//     esqueleto no carregamento. ctx ganha pessoaId (log do convite).
//   · Vigência e dias restantes leem a data como dia local (antes mostravam um dia a menos).
//
// Versão anterior: 1.5.3 · 07/10/2026
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
// --------------------------------------------------------------------------
// Versões anteriores (v1.3.1 … v1.3.1): CHANGELOG_MODULOS.md, na raiz do repositório — o
// gerar_versoes.py rola pra lá automaticamente tudo além das 5 versões
// mais recentes deste cabeçalho (VER-06).
export const VERSAO = '1.6.0'; // v-check (22/09/2026): lido por Dev › Versões — manter igual ao header
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
const NOMES_PLANO = { trial: 'Teste grátis', standard: 'Standard', plus: 'Plus', premium: 'Premium' };
const WHATSAPP_RAIZ = '5511947461828';
const SITE_RAIZ = 'https://www.raizpatrimonio.com.br';
// Página de contatos da Raiz: Licença e Suporte apontam para o mesmo endereço.
export const LINK_CONTATOS_RAIZ = SITE_RAIZ + '/#falar';
const VAGAS_TESTE = 5;

function esc(v) {
    return String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function nomePlano(codigo) {
    return NOMES_PLANO[codigo] || (codigo ? codigo.charAt(0).toUpperCase() + codigo.slice(1) : '—');
}
// Data só com dia (AAAA-MM-DD) é lida como meia-noite UTC e no Brasil vira o dia anterior;
// por isso monta a data local a partir das partes.
function dataLocal(v) {
    if (!v) return null;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(v));
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(v);
}
function diasAte(data) {
    if (!data) return null;
    return Math.ceil((dataLocal(data) - new Date()) / 86400000);
}
// Status do plano numa das 5 semânticas (REGRAS §9): o número de dias é o rótulo.
function statusLicenca(l) {
    const dias = diasAte(l.data_expiracao);
    if (l.status && l.status !== 'ativo') return { cls: 'rz-bad', txt: l.status.charAt(0).toUpperCase() + l.status.slice(1) };
    if (dias !== null && dias <= 0) return { cls: 'rz-bad', txt: 'Vencido' };
    if (dias !== null && dias <= 15) return { cls: 'rz-warn', txt: `Vence em ${dias} d` };
    return { cls: 'rz-ok', txt: 'Ativo' };
}

async function registrarLogLicenca(dbAuth, clienteId, pessoaId, acao, detalhe) {
    try {
        await dbAuth.from('log_acessos').insert({ cliente_id: clienteId, pessoa_id: pessoaId || null, acao, detalhe: detalhe || {} });
    } catch (err) {
        console.warn('[comum-licenca] Falha ao registrar log:', err.message);
    }
}

function linhaLink({ href, icone, titulo, sub, acao, ia }) {
    return `<a class="rz-row rz-link" href="${esc(href)}" target="_blank" rel="noopener"${acao ? ` data-rz-lic-acao="${esc(acao)}"` : ''}>` +
        `<div class="rz-ic${ia ? ' rz-ia' : ''}"><svg data-lucide="${esc(icone)}"></svg></div>` +
        `<div class="rz-tx"><b>${esc(titulo)}</b>${sub ? `<span>${esc(sub)}</span>` : ''}</div>` +
        `<svg data-lucide="chevron-right" class="rz-chev"></svg></a>`;
}

// Contratar e convidar. Em teste (licença com data de expiração): "Quero contratar" e o convite
// para entrar no mesmo teste (até 5 pessoas, vaga conferida ao vivo). Licença paga: indicar o Raiz
// a outra pessoa. Uma fonte só: a tela Sobre do cofre.html usa a mesma função.
export async function htmlContratarConvidar(dbAuth, clienteId, licenca) {
    if (!licenca) return '';
    const linhas = [];
    if (licenca.data_expiracao) {
        linhas.push(linhaLink({
            href: `https://wa.me/${WHATSAPP_RAIZ}?text=${encodeURIComponent('Oi! Testei o Raiz Patrimônio e quero contratar.')}`,
            icone: 'zap', titulo: 'Quero contratar', sub: 'Fale com a Raiz pelo WhatsApp', acao: 'contratar',
        }));
        try {
            const { count, error } = await dbAuth.from('pessoas').select('id', { count: 'exact', head: true }).eq('cliente_id', clienteId);
            if (!error && count !== null) {
                const vagas = VAGAS_TESTE - count;
                if (vagas > 0) {
                    // "?convite=" vem antes do "#": depois dele viraria fragmento, não parâmetro.
                    const link = `${SITE_RAIZ}/?convite=${clienteId}#trial`;
                    const msg = 'Oi! Estou testando o Raiz Patrimônio e você pode entrar no mesmo teste grátis comigo. É só clicar aqui e se cadastrar: ' + link;
                    linhas.push(linhaLink({ href: `https://wa.me/?text=${encodeURIComponent(msg)}`, icone: 'share-2', titulo: 'Convidar alguém para o teste', sub: `${vagas} vaga${vagas === 1 ? '' : 's'} — entra na mesma empresa`, acao: 'convidar' }));
                } else {
                    linhas.push(`<div class="rz-row"><div class="rz-ic rz-neu"><svg data-lucide="users"></svg></div><div class="rz-tx"><b>Teste completo</b><span>As ${VAGAS_TESTE} vagas do teste já estão em uso</span></div></div>`);
                }
            }
        } catch (err) {
            console.warn('[comum-licenca] Falha ao checar vagas do teste:', err.message);
        }
    } else {
        const msg = 'Uso o Raiz Patrimônio para cuidar do patrimônio e recomendo. Dá para testar grátis: ' + SITE_RAIZ + '/#trial';
        linhas.push(linhaLink({ href: `https://wa.me/?text=${encodeURIComponent(msg)}`, icone: 'share-2', titulo: 'Indicar o Raiz', sub: 'Mande o link do teste grátis para quem também cuida de patrimônio', acao: 'indicar' }));
    }
    return `<div class="rz-card"><div class="rz-card-h"><h3>${licenca.data_expiracao ? 'Contratar e convidar' : 'Convidar'}</h3></div>${linhas.join('')}</div>`;
}

export function ligarContratarConvidar(raiz, { dbAuth, clienteId, pessoaId, licenca, origem } = {}) {
    const LOG = { contratar: 'licenca.interesse_contratacao', convidar: 'licenca.convite_compartilhado', indicar: 'licenca.indicacao_compartilhada' };
    (raiz || document).querySelectorAll('[data-rz-lic-acao]').forEach(el => el.addEventListener('click', () => {
        const acao = LOG[el.dataset.rzLicAcao];
        if (acao) registrarLogLicenca(dbAuth, clienteId, pessoaId, acao, { modulo: licenca?.modulo, origem: origem || 'licenca' });
    }));
}

function cardLicencaHtml(licenca, funcionalidades, mostrarRotuloModulo) {
    const st = statusLicenca(licenca);
    const inicio = licenca.data_inicio ? dataLocal(licenca.data_inicio).toLocaleDateString('pt-BR') : '—';
    const fim = licenca.data_expiracao ? dataLocal(licenca.data_expiracao).toLocaleDateString('pt-BR') : 'sem data de término';
    const titulo = mostrarRotuloModulo ? `Plano · ${esc(NOMES_MODULO[licenca.modulo] || licenca.modulo)}` : 'Plano atual';

    // Barra de uso na cor da semântica: 100% = perigo, a partir de 80% = atenção.
    const funcsHtml = funcionalidades.length === 0
        ? '<p class="rz-desc">Este plano não tem limite configurado.</p>'
        : funcionalidades.map(f => {
            const pct = f.limite ? Math.min(100, Math.round((f.usado / f.limite) * 100)) : 0;
            const sem = pct >= 100 ? 'rz-bad' : pct >= 80 ? 'rz-warn' : 'rz-ok';
            const unidade = f.cotaTipo === 'bytes' ? ' MB' : '';
            const conta = f.cotaTipo === 'estoque' ? 'em uso' : f.cotaTipo === 'bytes' ? 'de espaço' : 'no mês';
            return `<div class="rz-row rz-uso">
                <div class="rz-tx"><b>${esc(f.rotulo)}</b><span>${f.usado}${unidade} de ${f.limite}${unidade} ${conta}${f.limiteAviso ? ` · aviso a partir de ${f.limiteAviso}` : ''}</span>
                <div class="rz-uso-bar"><i class="${sem}" style="width:${pct}%"></i></div></div>
            </div>`;
        }).join('');

    return `
        <div class="rz-card">
            <div class="rz-card-h"><h3>${titulo}</h3><span class="rz-st ${st.cls}">${esc(st.txt)}</span></div>
            <div class="rz-kv">
                <div><small>Plano</small><b>${esc(nomePlano(licenca.plano_codigo))}</b></div>
                <div><small>Vigência</small><b>${esc(inicio)} até ${esc(fim)}</b></div>
            </div>
            ${licenca.modulo === 'imoveis' ? `<div class="rz-row rz-link" data-rz-renovar="1" style="margin-top:8px"><div class="rz-ic"><svg data-lucide="refresh-cw"></svg></div><div class="rz-tx"><b>Renovar ou ampliar o plano</b><span>Ver ofertas e pagar por Pix</span></div><svg data-lucide="chevron-right" class="rz-chev"></svg></div>` : ''}
        </div>
        <div class="rz-card">
            <div class="rz-card-h"><h3>Limites do plano</h3></div>
            ${funcsHtml}
        </div>`;
}

const CARD_DUVIDAS = `<div class="rz-card"><div class="rz-card-h"><h3>Dúvidas sobre o plano?</h3></div>${linhaLink({ href: LINK_CONTATOS_RAIZ, icone: 'message-circle', titulo: 'Fale com a Raiz', sub: 'Contatos na página raizpatrimonio.com.br' })}</div>`;

// Ponto de entrada da tela. mountEl = container do host (index.html: #mount-licenca).
// ctx = { dbAuth, clienteId, pessoaId, toast }. Chamar de novo redesenha do zero.
export async function montarAbaLicenca(mountEl, ctx) {
    if (!mountEl) return;
    const { dbAuth, clienteId, pessoaId } = ctx || {};
    const topo = '<div class="rz-tabhead"><p>O plano da sua empresa, o quanto já foi usado, e como contratar, ampliar ou convidar alguém.</p></div>';

    mountEl.innerHTML = topo + (typeof window !== 'undefined' && typeof window.rzSkeleton === 'function' ? window.rzSkeleton('cards', 2) : '<p class="rz-desc">Carregando…</p>');

    if (!clienteId || !dbAuth) {
        mountEl.innerHTML = topo + '<div class="rz-card"><p class="rz-desc">Nenhuma empresa carregada.</p></div>';
        return;
    }

    try {
        const licencas = await listarLicencasDoCliente(dbAuth, clienteId);

        if (licencas.length === 0) {
            mountEl.innerHTML = topo + `
                <div class="rz-card"><div class="rz-empty"><div class="rz-ic"><svg data-lucide="badge-check"></svg></div><p>Nenhum plano encontrado para esta empresa. Fale com a Raiz para ativar o seu.</p></div></div>` + CARD_DUVIDAS;
            if (typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();
            return;
        }

        // Nome do módulo no título só quando há mais de uma licença.
        const mostrarRotuloModulo = licencas.length > 1;

        const blocos = await Promise.all(licencas.map(async (lic) => {
            try {
                const funcs = await buscarFuncionalidadesDoPlano(dbAuth, clienteId, lic);
                return cardLicencaHtml(lic, funcs, mostrarRotuloModulo);
            } catch (err) {
                console.warn('[comum-licenca] Falha ao carregar funcionalidades do módulo', lic.modulo, ':', err.message);
                return cardLicencaHtml(lic, [], mostrarRotuloModulo) +
                    '<p class="rz-desc" style="color:var(--danger);margin-bottom:12px">Não foi possível carregar os limites deste plano agora.</p>';
            }
        }));

        const principal = escolherLicencaPrincipal(licencas);
        const convite = await htmlContratarConvidar(dbAuth, clienteId, principal);

        mountEl.innerHTML = topo + blocos.join('') + convite + CARD_DUVIDAS;
        ligarContratarConvidar(mountEl, { dbAuth, clienteId, pessoaId, licenca: principal, origem: 'licenca' });
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
        mountEl.innerHTML = topo + '<div class="rz-card"><p class="rz-desc" style="color:var(--danger)">Não foi possível carregar o plano agora. Tente de novo em instantes.</p></div>';
    }
}
