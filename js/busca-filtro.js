// ============================================================================
// busca-filtro.js — Raiz Patrimônio · lupa do topo: um termo só, para o app todo
// Versão: 1.0.1 · 28/11/2026
//
// v1.0.1 (28/11/2026, teste no ar) — o termo vai para os campos de TODAS as telas, não só da aberta: limpar dentro da ficha de um
// bem deixava a lista de Ativos ainda filtrada ao voltar (a lista estava escondida, e voltar da ficha não é troca de tela).
// Versão anterior: 1.0.0
//
// v1.0.0 (28/11/2026, sessão 20261128-0050-lupa-global, demanda c0e5dcbc; FICHA_BUSCA_E_FILTRO_DAS_TELAS_RAIZ v1.3.0, Nicola 28/11
// 00:34 "o componente de busca é global e seu comportamento não varia por botão" e 00:47 "ao navegar entre botões e ações o
// filtro fica ativo; só sai se o usuário limpar ou filtrar algo diferente; mover para o módulo, se for o momento, já faça") —
// criação. As funções da lupa saem do index.html (rzBuscaDaTela, rzHdrBusca, rzHdrBuscaSync, rzHdrBuscaLimpar, v1.390.0 a
// v1.490.116) e passam a guardar UM termo para o app:
//   · tocar na lupa abre sempre a mesma caixa no topo, centrada na lupa, com o termo escrito e selecionado;
//   · tela com lista (Patrimônio, Contratos, Pessoas, Agenda, Financeiro): o termo filtra a lista da tela;
//   · tela sem lista (Hoje, Resumo, vitrine…): enquanto a caixa está aberta, a busca geral aparece logo abaixo do topo;
//   · trocar de botão, de aba ou de ação mantém o termo e a lupa dourada; só sai com o × ou trocando o termo.
//   · trocar de empresa limpa o termo (os dados são outros).
// O index só carrega este módulo (import no boot); o HTML da caixa e da lupa continua no index.
// ============================================================================
export const VERSAO = '1.0.1';

const $ = (id) => document.getElementById(id);
const SEM_LISTA = new Set(['hoje-busca-q']); // o Hoje tem a busca geral na própria tela: a lupa usa o painel
let termo = '', empresa = null, painel = null, proxy = null, buscaGeral = null;

// o campo de busca da tela aberta (escondido pelo CSS desde a v1.390.0): o marcado data-lupa, senão o 1º visível com campo
function campoDaTela() {
    const sec = document.querySelector('#main-content .tab-content.active'); if (!sec) return null;
    const oculto = (b) => { for (let p = b; p && p !== sec; p = p.parentElement) if (p.hidden || p.classList.contains('hidden')) return true; return false; };
    const vis = [...sec.querySelectorAll('.rz-search')].filter(b => !oculto(b) && b.querySelector('input'));
    const inp = (vis.find(b => b.hasAttribute('data-lupa')) || vis[0])?.querySelector('input');
    return inp && !SEM_LISTA.has(inp.id) ? inp : null;
}
// escreve o termo no campo da tela (só se mudou: a tela redesenha uma vez)
function aplicar(inp) {
    if (!inp || inp.value === termo) return;
    inp.value = termo; inp.dispatchEvent(new Event('input', { bubbles: true }));
}
// v1.0.1 — os campos que a lupa comanda (as barras escondidas pelo CSS da v1.390.0 e o da Agenda), em todas as telas
const CAMPOS = '#main-content .rz-topo > .rz-search input, #main-content .rz-fin-busca input, #main-content [data-lupa] input';
const aplicarTodos = () => document.querySelectorAll(CAMPOS).forEach(i => { if (!SEM_LISTA.has(i.id)) aplicar(i); });
const pintarLupa = () => $('btn-busca-header')?.classList.toggle('rz-filtrado', !!termo.trim());

// painel da busca geral, logo abaixo do topo (telas sem lista); usa a busca universal do index sobre um campo invisível
function garantirPainel() {
    if (painel) return;
    painel = document.createElement('div'); painel.id = 'rz-hdr-busca-res'; painel.className = 'rz-busca-res rz-hdr-busca-res'; painel.hidden = true;
    proxy = document.createElement('input'); proxy.type = 'search'; proxy.hidden = true; painel.appendChild(proxy);
    const res = document.createElement('div'); painel.appendChild(res);
    document.body.appendChild(painel);
    painel.addEventListener('pointerdown', (e) => e.preventDefault()); // tocar num resultado não tira o foco da caixa antes do clique
    if (typeof window.rzLigarBuscaUniversal === 'function') buscaGeral = window.rzLigarBuscaUniversal(proxy, res, fechar);
}
function mostrarPainel(on) {
    if (!painel) return;
    if (on) { const h = document.querySelector('.rz-hdr')?.getBoundingClientRect(); painel.style.top = Math.round(h ? h.bottom : 0) + 'px'; }
    painel.hidden = !on;
}
function termoGeral() { proxy.value = termo; proxy.dispatchEvent(new Event('input', { bubbles: true })); if (!termo.trim()) buscaGeral?.desenharRecentes?.(); }

function fechar() {
    $('rz-hdr-busca')?.classList.remove('rz-aberta'); document.querySelector('.rz-hdr')?.classList.remove('rz-buscando');
    mostrarPainel(false); pintarLupa();
    if (document.activeElement === $('rz-hdr-busca-q')) $('rz-hdr-busca-q').blur(); // escolheu um resultado: fecha o teclado
}

// troca de tela, aba ou empresa: fecha a caixa e leva o termo para a tela nova
export function sincronizar() {
    const id = typeof CLIENTE_ID_SUPABASE !== 'undefined' ? CLIENTE_ID_SUPABASE : null;
    if (id !== empresa) { empresa = id; termo = ''; }
    if (document.activeElement !== $('rz-hdr-busca-q')) fechar(); else pintarLupa();
    aplicarTodos();
    setTimeout(aplicarTodos, 400); // a tela pode redesenhar a barra logo depois de abrir
}

export function abrir() {
    const caixa = $('rz-hdr-busca'), q = $('rz-hdr-busca-q'), lupa = $('btn-busca-header'), hdr = document.querySelector('.rz-hdr');
    if (!caixa || !q || !lupa || !hdr) return;
    if (caixa.classList.contains('rz-aberta')) { q.blur(); return; }
    const inp = campoDaTela();
    const hr = hdr.getBoundingClientRect(), lr = lupa.getBoundingClientRect();
    caixa.style.right = (hr.right - lr.left + 4) + 'px';
    caixa.style.top = (lr.top - hr.top + lr.height / 2 - 22) + 'px'; // centrada na lupa (v1.490.116)
    q.value = termo; q.placeholder = inp?.placeholder || 'Buscar bens, contratos, pessoas, agenda, lançamentos';
    if (!inp) { garantirPainel(); termoGeral(); mostrarPainel(true); }
    q.oninput = () => {
        termo = q.value; pintarLupa();
        aplicarTodos();
        if (!campoDaTela() && proxy) termoGeral();
    };
    q.onkeydown = (ev) => {
        if (ev.key !== 'Enter') return;
        ev.preventDefault();
        const alvo = campoDaTela();
        if (alvo) { alvo.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' })); q.blur(); }
    };
    q.onblur = () => setTimeout(() => { if (document.activeElement !== q) fechar(); }, 120);
    caixa.classList.add('rz-aberta'); hdr.classList.add('rz-buscando');
    q.focus(); q.select(); // no mesmo toque: o iPhone só abre o teclado assim (v1.490.116)
}

// × da caixa: tira o filtro do app todo e deixa a caixa aberta para outro termo
export function limpar() {
    const q = $('rz-hdr-busca-q'); if (!q) return;
    if (q.value) { q.value = ''; q.oninput ? q.oninput() : (termo = '', pintarLupa()); }
    q.focus();
}

export const termoAtual = () => termo;

window.rzHdrBusca = abrir; window.rzHdrBuscaSync = sincronizar; window.rzHdrBuscaLimpar = limpar;
window.rzBuscaTermo = termoAtual;
sincronizar();
