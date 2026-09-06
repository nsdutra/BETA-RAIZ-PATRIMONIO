// Raiz Patrimônio — Service Worker mínimo
// Versão: 2.1 · 06/09/2026
//
// Propósito único: satisfazer o requisito de instalabilidade como PWA
// ("Adicionar à tela inicial"). NÃO faz cache agressivo de páginas ou dados
// de propósito — o sistema já tem seu próprio controle de modo offline via
// localStorage (ver CONFIG_CLIENTE / chaveLocal no HTML). Um service worker
// com cache próprio, além disso, criaria uma SEGUNDA camada de dados presos,
// exatamente o tipo de bug que já resolvemos na v1.2.1 com o cache do
// localStorage. Por isso este arquivo é deliberadamente simples.
//
// v2.1 (06/09/2026) — Dev › Versões mostrou 6 módulos presos mesmo com a v2.0
// no ar: cache:'no-cache' só REVALIDA (e o Android nem sempre revalida
// módulos). Agora cache:'reload' = vai à rede sempre, ignorando o cache
// HTTP local, pra todo .js e pro versoes.json do próprio site. GitHub Pages
// responde rápido; o custo é 1 ida por módulo por carga, sem cache pelo SW.
// Também: 'install' e 'activate' seguem com skipWaiting + clients.claim.
//
// v2.0 (05/09/2026) — BUG REAL (print do Nicola: "Sobre" mostrava Cofre
// v1.21.1 com o GitHub em 1.26.0): os módulos importados por import()
// (js/cofre-*.js, js/comum-*.js, js/cadastros.js…) ficavam presos no cache
// HTTP do navegador — hard refresh recarrega o index, mas os import()
// disparados depois (prefetch em idle) voltavam a usar a cópia velha.
// Correção sem criar cache: pra todo .js do próprio site, o SW busca com
// cache:'no-cache' — o navegador REVALIDA no GitHub Pages (ETag → 304 quando
// não mudou, custo mínimo) em vez de servir do cache sem perguntar. Nada é
// guardado pelo SW; se estiver offline, cai no comportamento padrão.

self.addEventListener('install', function (event) {
    self.skipWaiting();
});

self.addEventListener('activate', function (event) {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function (event) {
    var url = new URL(event.request.url);
    var ehJsDoSite = url.origin === self.location.origin && (url.pathname.endsWith('.js') || url.pathname.endsWith('versoes.json'));
    if (!ehJsDoSite || event.request.method !== 'GET') return; // padrão do navegador
    event.respondWith(
        fetch(event.request, { cache: 'reload' }).catch(function () { return fetch(event.request); })
    );
});
