// =====================================================================
// RAIZ PATRIMÔNIO — js/raiz-eventos.js
// VERSÃO: Beta v1.0.0 (22/09/2026 — Fase 1 do wrapper de escrita)
// LINHAS: (ver versoes.json)
// ---------------------------------------------------------------------
// CONTEXTO (backlog discutido em sessão anterior, registrado em memória):
// "tela desatualizada após criar/editar/excluir (cross, todo o app) —
// plano B (wrapper único de escrita + evento padrão) primeiro, A
// (Supabase Realtime) depois." Este arquivo é o plano B: hoje o app já
// tem vários eventos locais ad-hoc (cofre:recarregar-ativos,
// cofre:dados-carregados, cofre:abrir-ativo — cada um só conhecido por
// quem o criou, um nome novo por caso). Isso resolve o caso a caso, mas
// não dá um jeito ÚNICO de perguntar "alguém escreveu algo que me
// interessa?" de fora do módulo que escreveu.
//
// Este módulo não troca nenhum dos eventos existentes (cofre:* continuam
// exatamente como estão, são internos ao Cofre) — ele é a peça NOVA pra
// avisar módulos que NÃO SE CONHECEM entre si (ex.: Ativos escreve,
// Visão Geral em index.html precisa saber, sem Ativos ter que saber que
// Visão Geral existe).
//
// ESCOPO DESTA ENTREGA (decisão do Nicola, 22/09/2026 — AskUserQuestion,
// "Utilitário + 1 piloto testado"): o utilitário nasce pronto pra
// qualquer escrita do app, mas só foi efetivamente ADOTADO num piloto —
// salvarEdicaoAtivo() (cofre-ativos.js) → Visão Geral (index.html),
// ver changelog de ambos. Adoção no resto do app (Contratos, Financeiro,
// Resultados, etc.) fica pra uma rodada dedicada futura — este arquivo,
// sozinho, não muda o comportamento de nenhum outro módulo.
// ---------------------------------------------------------------------
// API:
//   emitirEscrita(entidade, detalhe?)      — avisa que algo mudou.
//   aoEscrever(entidade, callback)         — escuta; devolve cancelamento.
//   executarEscrita(entidade, fnEscrita, detalhe?) — roda a escrita e só
//     avisa se ela NÃO lançar (açúcar opcional; emitirEscrita direto
//     depois de um try/catch já existente funciona igual de bem).
// =====================================================================

export const VERSAO = '1.0.0';

const NOME_EVENTO = 'raiz:escrita';

/**
 * Avisa que uma escrita aconteceu. `entidade` é uma string curta e
 * estável (ex.: 'ativo', 'contrato', 'mensalidade', 'despesa') — quem
 * escuta filtra por ela. `detalhe` é livre (ex.: { id, acao: 'editar' }).
 */
export function emitirEscrita(entidade, detalhe) {
    if (!entidade) {
        console.warn('[raiz-eventos] emitirEscrita chamado sem entidade — ignorado.');
        return;
    }
    window.dispatchEvent(new CustomEvent(NOME_EVENTO, { detail: { entidade, ...(detalhe || {}) } }));
}

/**
 * Assina o evento de escrita. `entidade` filtra (só chama `callback`
 * quando bater); passe '*' pra ouvir qualquer escrita. Devolve uma
 * função de cancelamento — chame quando a tela some, pra não vazar
 * listener (mesmo cuidado de qualquer addEventListener manual).
 */
export function aoEscrever(entidade, callback) {
    if (typeof callback !== 'function') {
        console.warn('[raiz-eventos] aoEscrever chamado sem callback — ignorado.');
        return () => {};
    }
    const handler = (ev) => {
        const detalhe = (ev && ev.detail) || {};
        if (entidade === '*' || detalhe.entidade === entidade) callback(detalhe);
    };
    window.addEventListener(NOME_EVENTO, handler);
    return () => window.removeEventListener(NOME_EVENTO, handler);
}

/**
 * Roda `fnEscrita` (a chamada RPC/insert/update em si, sem argumentos —
 * quem chama já fecha os parâmetros num arrow function) e, só se ela NÃO
 * lançar, emite o evento padrão pra `entidade`. Relança qualquer erro
 * sem emitir nada — mesmo contrato de um try/catch normal, não engole
 * exceção nenhuma.
 */
export async function executarEscrita(entidade, fnEscrita, detalhe) {
    const resultado = await fnEscrita();
    emitirEscrita(entidade, detalhe);
    return resultado;
}
