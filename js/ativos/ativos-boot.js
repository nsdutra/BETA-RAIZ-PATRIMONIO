// ============================================================================
// js/ativos/ativos-boot.js — Raiz Patrimônio · Módulo Único, fatia frontend 1
// Versão: 1.1.0 · 31/08/2026
//
// Ponto de entrada da aba Ativos nova, chamado 1x pelo index.html (dentro de
// switchTab, na primeira vez que 'tab-ativos' é aberta). Faz 4 coisas, nesta
// ordem, e cada uma existe por um motivo específico encontrado ao investigar
// o Cofre antes de escrever qualquer linha daqui:
//
//  1) Injeta o HTML extraído (ativos-markup.js) dentro do container vazio.
//     Sem isso, cofre-navegacao.js/cofre-*.js não encontram os elementos
//     que esperam via getElementById e todo o boot falha.
//
//  2) Registra um listener 1x (`{ once: true }`) pro evento
//     'cofre:dados-carregados' — ver v1.1.0 abaixo pro que ele faz. Tem
//     que ser registrado ANTES do import de cofre-app.js (passo 4), senão
//     corre o risco de o evento disparar antes do listener existir.
//
//  3) Ajusta a URL pra incluir ?cliente_id=<empresa atual> ANTES de importar
//     o módulo do Cofre. nav.bootstrap() (cofre-navegacao.js) escolhe a
//     empresa pela lista de empresas da pessoa, na ordem em que vêm do
//     banco, a menos que ache ?cliente_id= na URL — sem isso, um usuário
//     multi-empresa (ex.: master em várias) poderia ver os ativos da
//     empresa errada na primeira abertura. Usa o parâmetro que o próprio
//     cofre-navegacao.js já sabe ler (nenhuma mudança no código do Cofre).
//     A URL é restaurada (history.replaceState) logo depois, sem reload —
//     não fica sujo na barra de endereço nem entra no histórico do navegador.
//
//  4) Importa ./cofre-app.js dinamicamente. O import já dispara
//     nav.bootstrap() sozinho (é a última linha do arquivo) — não precisa
//     chamar nada explicitamente depois.
//
// Reaproveita os arquivos js/cofre-*.js tal como estão — nenhum foi copiado
// nem modificado. cofre-api.js cria seu próprio cliente Supabase
// independente do dbAuth do index.html (mesmo projeto, mesma anon key,
// mesma sessão já autenticada no navegador) — redundante, mas é o mesmo
// comportamento que o Cofre já tem hoje como página separada; não é um
// risco novo introduzido por esta integração.
//
// v1.1.0 (31/08/2026, pedido explícito) — "no menu ativo, ainda aparece a
// visão geral do ativo e ao final os botões visão geral e ativo. Isto já
// deveria ter sido unificado." A v1.84.0 só tinha escondido o CABEÇALHO
// duplicado (item 1 do changelog anterior) — a Home interna do Cofre
// (KPIs de ativos/alertas/docs + triagem + "Atenção necessária", tela
// data-screen="home") continuava sendo a tela padrão ao abrir a aba
// Ativos, com o switcher Visão Geral/Ativos (nav.bottom-nav) visível por
// cima da lista. Isso duplicava a Visão Geral de verdade do App
// (tab-geral, que já existe fora), então virou ruído, não navegação útil.
//
// Corrigido SEM tocar em cofre-navegacao.js/cofre-app.js (ambos também
// usados pelo cofre.html standalone, que não deveria mudar de
// comportamento nenhum): esta camada de integração escuta o evento
// 'cofre:dados-carregados' (disparado dentro de carregarTudo(), já perto
// do fim de nav.bootstrap()) e, um instante depois (setTimeout 0 — dá
// tempo do próprio bootstrap() terminar de rodar montarHome()/
// mudarTela('home') antes da minha chamada, senão a minha seria
// sobrescrita pela dele alguns milissegundos depois), força a tela pra
// 'ativos' (lista) chamando as MESMAS funções que o botão "Ativos" do
// switcher antigo já chamava (mudarTela('ativos') + renderAtivosLista()
// com os filtros atuais) — zero lógica nova, só automatizei o clique.
//
// O switcher (nav.bottom-nav) passou de "reposicionado" (v1.84.0) pra
// ESCONDIDO de vez — nada foi removido de acesso, só a ÊNFASE: a Home
// interna (e a tela de Alertas, só alcançável a partir dela) continua
// existindo e alcançável por 1 ícone novo no topo da lista de Ativos
// (ver ativos-markup.js v1.1.0, botão "Visão geral do Cofre" — mesmo
// data-action="ir-home" de sempre). Nenhuma tela foi apagada, só deixou
// de ser a porta de entrada padrão.
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

    // v1.84.0 — cabeçalho duplicado escondido de vez (puro duplicado do
    // header do App, zero função perdida).
    // v1.1.0 (31/08/2026) — nav interna (switcher Visão Geral/Ativos), que
    // até aqui só tinha sido REPOSICIONADA (rodapé fixo -> topo), agora é
    // ESCONDIDA de vez — o item 2) logo abaixo já garante que a tela
    // padrão é 'ativos' (lista), e o acesso à Home/Alertas continua
    // existindo via 1 ícone novo dentro da própria lista (ver
    // ativos-markup.js). Escopado em #ativos-mount-point — não toca em
    // nenhum cofre-*.js nem no cofre.html standalone.
    if (!document.getElementById('ativos-boot-style-fix')) {
        const style = document.createElement('style');
        style.id = 'ativos-boot-style-fix';
        style.textContent = `
            #ativos-mount-point > #app-cofre > header { display: none !important; }
            #ativos-mount-point > #app-cofre > nav.bottom-nav { display: none !important; }
        `;
        document.head.appendChild(style);
    }

    // 2) v1.1.0 — registra ANTES do import (passo 4) o listener que força
    // a tela padrão pra 'ativos' assim que os dados do Cofre carregam.
    // Precisa estar pronto antes do 'cofre:dados-carregados' disparar lá
    // dentro de carregarTudo() (chamado por nav.bootstrap()) — registrar
    // depois do import correria o risco de perder o evento.
    window.addEventListener('cofre:dados-carregados', function forcarTelaAtivosPadrao() {
        // setTimeout(0): dá tempo de nav.bootstrap() terminar sua própria
        // sequência síncrona (que, sem contexto de URL — nunca há, nesta
        // integração — chama montarHome()/mudarTela('home') alguns
        // passos depois deste evento) ANTES da minha troca de tela rodar.
        // Sem o atraso, minha chamada aconteceria primeiro e seria
        // sobrescrita pela de dentro do bootstrap() logo em seguida.
        setTimeout(function () {
            Promise.all([
                import('../cofre-navegacao.js'),
                import('../cofre-ativos.js')
            ]).then(function ([nav, ativosMod]) {
                nav.mudarTela('ativos');
                const filtroTipo = document.getElementById('filtro-ativo-tipo');
                const filtroBusca = document.getElementById('filtro-ativo-busca');
                ativosMod.renderAtivosLista(filtroTipo ? filtroTipo.value : '', filtroBusca ? filtroBusca.value : '');
            }).catch(function (err) {
                // Falha aqui não é grave o bastante pra travar a aba —
                // pior caso, a pessoa vê a Home do Cofre (comportamento
                // antigo) em vez da lista direto. Só loga.
                console.warn('[ativos-boot] Não foi possível ir direto pra lista de Ativos:', err.message);
            });
        }, 0);
    }, { once: true });

    // 3) garante que o Cofre resolve a MESMA empresa que já está ativa no App
    const urlOriginal = window.location.href;
    const params = new URLSearchParams(window.location.search);
    if (clienteIdAtual) params.set('cliente_id', clienteIdAtual);
    const urlComContexto = window.location.pathname + '?' + params.toString() + window.location.hash;
    window.history.replaceState(window.history.state, '', urlComContexto);

    try {
        // 4) boot real do Cofre — nav.bootstrap() roda sozinho ao importar
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
