// ============================================================================
// js/ativos/ativos-boot.js — Raiz Patrimônio · Módulo Único, fatia frontend 1
// Versão: 1.0.0 · 31/08/2026
//
// Ponto de entrada da aba Ativos nova, chamado 1x pelo index.html (dentro de
// switchTab, na primeira vez que 'tab-ativos' é aberta). Faz 3 coisas, nesta
// ordem, e cada uma existe por um motivo específico encontrado ao investigar
// o Cofre antes de escrever qualquer linha daqui:
//
//  1) Injeta o HTML extraído (ativos-markup.js) dentro do container vazio.
//     Sem isso, cofre-navegacao.js/cofre-*.js não encontram os elementos
//     que esperam via getElementById e todo o boot falha.
//
//  2) Ajusta a URL pra incluir ?cliente_id=<empresa atual> ANTES de importar
//     o módulo do Cofre. nav.bootstrap() (cofre-navegacao.js) escolhe a
//     empresa pela lista de empresas da pessoa, na ordem em que vêm do
//     banco, a menos que ache ?cliente_id= na URL — sem isso, um usuário
//     multi-empresa (ex.: master em várias) poderia ver os ativos da
//     empresa errada na primeira abertura. Usa o parâmetro que o próprio
//     cofre-navegacao.js já sabe ler (nenhuma mudança no código do Cofre).
//     A URL é restaurada (history.replaceState) logo depois, sem reload —
//     não fica sujo na barra de endereço nem entra no histórico do navegador.
//
//  3) Importa ./cofre-app.js dinamicamente. O import já dispara
//     nav.bootstrap() sozinho (é a última linha do arquivo) — não precisa
//     chamar nada explicitamente depois.
//
// Reaproveita os arquivos js/cofre-*.js tal como estão — nenhum foi copiado
// nem modificado. cofre-api.js cria seu próprio cliente Supabase
// independente do dbAuth do index.html (mesmo projeto, mesma anon key,
// mesma sessão já autenticada no navegador) — redundante, mas é o mesmo
// comportamento que o Cofre já tem hoje como página separada; não é um
// risco novo introduzido por esta integração.
// ============================================================================

let ativosJaInicializado = false;

export async function montarAtivosTab(clienteIdAtual) {
    if (ativosJaInicializado) return;
    ativosJaInicializado = true;

    const container = document.getElementById('ativos-mount-point');
    if (!container) {
        console.error('[ativos-boot] #ativos-mount-point não existe no index.html.');
        return;
    }

    // 1) injeta o markup extraído do Cofre
    const { ATIVOS_MARKUP } = await import('./ativos-markup.js');
    container.innerHTML = ATIVOS_MARKUP;

    // v1.84.0 — pedido do Nicola, testando a v1.80.0: o Cofre trouxe o
    // próprio cabeçalho e a própria nav interna (Home/Ativos) junto,
    // duplicando o que o App já mostra por fora. Correção só de CSS,
    // escopada em #ativos-mount-point — não toca em nenhum cofre-*.js:
    //  - cabeçalho: escondido de vez (puro duplicado do header do App,
    //    zero função perdida).
    //  - nav interna: NÃO escondida — ela alterna Home/Triagem (alertas)
    //    x Ativos (lista) dentro do próprio Cofre, esconder quebraria o
    //    acesso a uma das duas telas. Só reposicionada do rodapé fixo
    //    (que brigava visualmente com a barra de baixo do App) pro topo,
    //    como sub-aba compacta. Os cliques (data-action) continuam
    //    funcionando exatamente como antes.
    if (!document.getElementById('ativos-boot-style-fix')) {
        const style = document.createElement('style');
        style.id = 'ativos-boot-style-fix';
        style.textContent = `
            #ativos-mount-point > #app-cofre > header { display: none !important; }
            #ativos-mount-point > #app-cofre > nav.bottom-nav {
                position: static !important;
                box-shadow: none !important;
                border-bottom: 1px solid var(--line, #e6e3da);
                border-top: none !important;
            }
            #ativos-mount-point > #app-cofre > nav.bottom-nav .max-w-md { max-width: 100% !important; }
        `;
        document.head.appendChild(style);
    }

    // 2) garante que o Cofre resolve a MESMA empresa que já está ativa no App
    const urlOriginal = window.location.href;
    const params = new URLSearchParams(window.location.search);
    if (clienteIdAtual) params.set('cliente_id', clienteIdAtual);
    const urlComContexto = window.location.pathname + '?' + params.toString() + window.location.hash;
    window.history.replaceState(window.history.state, '', urlComContexto);

    try {
        // 3) boot real do Cofre — nav.bootstrap() roda sozinho ao importar
        await import('../cofre-app.js');
    } catch (err) {
        console.error('[ativos-boot] Falha ao carregar o módulo Ativos:', err);
        container.innerHTML = '<div class="p-6 text-center text-sm" style="color:var(--sage)">Não foi possível carregar Ativos agora. Toque novamente ou recarregue a página.</div>';
        ativosJaInicializado = false; // permite tentar de novo numa próxima tentativa
    } finally {
        // restaura a URL visível, sem reload e sem entrar no histórico
        window.history.replaceState(window.history.state, '', urlOriginal);
    }
}
