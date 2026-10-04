// Raiz Patrimônio — Service Worker
// Versão: 3.0 · 04/10/2026
//
// v3.0 (UX F1.4b, demanda 38407410, sessão 20261003-1707-ux-base; plano aprovado pelo Nicola
// 04/10 15:46 — "abrir sem rede", só consulta) — o app passa a abrir sem rede.
//   · Página (navegação): rede primeiro (até 4 s); sem rede, a última cópia guardada.
//   · Módulos com versão na URL (?v=, vindos do import map): guardados pela própria URL —
//     versão nova = URL nova, então nunca há módulo preso (o problema da v2.0/v2.1). Na
//     instalação o SW já guarda todos os módulos listados no versoes.json.
//   · .js sem versão e versoes.json: rede primeiro (cache:'reload', como na v2.1); sem rede,
//     a última cópia.
//   · Bibliotecas das CDNs (supabase-js, Tailwind, Lucide, jsPDF…) e fontes: usa a cópia
//     guardada e atualiza em segundo plano.
//   · NUNCA guarda nada do Supabase (dado e login): o dado da carteira fica no IndexedDB do
//     app (index.html, rzFetchComCache), por empresa+login, apagado no Sair.
//   · Ao ativar, apaga os caches de versões antigas do SW.
//
// Versão anterior: 2.1 · 06/09/2026
// (abaixo, o histórico da v2.x — o "não faz cache" deixou de valer na v3.0)
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

var RZ_CACHE = 'raiz-app-v3';
var RZ_CDN = /^https:\/\/(cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com|unpkg\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)\//;

self.addEventListener('install', function (event) {
    self.skipWaiting();
    // guarda o app (página, ícones e todos os módulos versionados) — falha aqui não impede o SW
    event.waitUntil(
        caches.open(RZ_CACHE).then(function (cache) {
            return fetch('versoes.json', { cache: 'reload' }).then(function (r) { return r.json(); }).then(function (v) {
                var lista = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'versoes.json'];
                Object.keys((v && v.arquivos) || {}).forEach(function (arq) {
                    if (/^js\/.*\.js$/.test(arq)) lista.push(arq + '?v=' + v.arquivos[arq]);
                });
                return Promise.all(lista.map(function (u) {
                    return fetch(u, { cache: 'reload' }).then(function (resp) { if (resp.ok) return cache.put(u, resp); }).catch(function () {});
                }));
            }).catch(function () {});
        })
    );
});

self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(function (nomes) {
            return Promise.all(nomes.filter(function (n) { return n !== RZ_CACHE; }).map(function (n) { return caches.delete(n); }));
        }).then(function () { return self.clients.claim(); })
    );
});

function guardar(req, resp) {
    if (resp && (resp.ok || resp.type === 'opaque')) {
        var copia = resp.clone();
        caches.open(RZ_CACHE).then(function (c) { c.put(req, copia); }).catch(function () {});
    }
    return resp;
}
function redePrimeiro(req, opcoesFetch, limiteMs) {
    // navegação não aceita opções no fetch (modo 'navigate'): vai sem elas
    var rede = (opcoesFetch ? fetch(req, opcoesFetch) : fetch(req)).then(function (resp) { return guardar(req, resp); });
    var comLimite = limiteMs ? Promise.race([rede, new Promise(function (_, rej) { setTimeout(function () { rej(new Error('lento')); }, limiteMs); })]) : rede;
    return comLimite.catch(function () {
        var busca = req.mode === 'navigate'
            ? caches.match(req, { ignoreSearch: true }).then(function (c) { return c || caches.match('./').then(function (c2) { return c2 || caches.match('index.html'); }); })
            : caches.match(req, { ignoreVary: true });
        return busca.then(function (c) { return c || rede; });
    });
}
function cacheDepoisRede(req) {
    return caches.match(req).then(function (c) {
        if (c) return c;
        return fetch(req).then(function (resp) { return guardar(req, resp); });
    });
}
function cacheEAtualiza(req) {
    return caches.match(req).then(function (c) {
        var rede = fetch(req).then(function (resp) { return guardar(req, resp); }).catch(function () { return c; });
        return c || rede;
    });
}

self.addEventListener('fetch', function (event) {
    var req = event.request;
    if (req.method !== 'GET') return; // padrão do navegador
    var url = new URL(req.url);
    if (url.origin === self.location.origin) {
        if (req.mode === 'navigate') { event.respondWith(redePrimeiro(req, null, 4000)); return; }
        if (url.pathname.endsWith('.js') && url.searchParams.has('v')) { event.respondWith(cacheDepoisRede(req)); return; }
        if (url.pathname.endsWith('.js') || url.pathname.endsWith('versoes.json')) { event.respondWith(redePrimeiro(req, { cache: 'reload' })); return; }
        if (/\.(png|svg|ico|webp|json)$/.test(url.pathname)) { event.respondWith(cacheEAtualiza(req)); return; }
        return;
    }
    if (RZ_CDN.test(req.url)) { event.respondWith(cacheEAtualiza(req)); return; }
    // Supabase e o resto: sempre o padrão do navegador (nada de dado no cache do SW)
});
