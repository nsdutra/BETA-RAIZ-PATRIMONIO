// Raiz Patrimônio — Service Worker mínimo
//
// Propósito único: satisfazer o requisito de instalabilidade como PWA
// ("Adicionar à tela inicial"). NÃO faz cache agressivo de páginas ou dados
// de propósito — o sistema já tem seu próprio controle de modo offline via
// localStorage (ver CONFIG_CLIENTE / chaveLocal no HTML). Um service worker
// com cache próprio, além disso, criaria uma SEGUNDA camada de dados presos,
// exatamente o tipo de bug que já resolvemos na v1.2.1 com o cache do
// localStorage. Por isso este arquivo é deliberadamente simples.

self.addEventListener('install', function (event) {
    self.skipWaiting();
});

self.addEventListener('activate', function (event) {
    event.waitUntil(self.clients.claim());
});

// Deixa toda requisição seguir direto para a rede — nenhum cache próprio.
self.addEventListener('fetch', function (event) {
    // Sem cache: comportamento padrão do navegador.
});
