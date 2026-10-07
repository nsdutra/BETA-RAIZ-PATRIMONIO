// ============================================================================
// cofre-ui.js — Raiz Patrimônio · Cofre de Documentos
// Versão: 1.7.1 · 07/10/2026
//
// v1.7.1 (07/10/2026, sessão 20261007-1721-rolo-changelog, demanda 2507d554 — VER-05, "de acordo" do Nicola 07/10 17:21) — SÓ
// CABEÇALHO: as versões além das 5 mais recentes rolaram para o CHANGELOG_MODULOS.md.
// Nenhuma linha de código mudou — conferido token a token contra o publicado.
//
// Versão anterior: 1.7.0 · 04/10/2026
//
// v1.7.0 (F1.1, teste 3 reprovado pelo Nicola 04/10 08:41, demanda c5d844a4, sessão 20261003-1707-ux-base) — escolher(): escolha em lista (rzEscolher do
// js/raiz-ui.js) para o Cofre; fechar sem escolher devolve null. No cofre.html avulso (sem
// Sheet), com 2 opções, cai no confirm() do navegador (OK = 1ª, Cancelar = 2ª) — mesma
// exceção única da UXR-30 já aceita para perguntar().
//
// Versão anterior: 1.6.0 · 04/10/2026
//
// v1.6.0 (F0.2b do PLANO_UX, demanda 9e4aca28, sessão 20261003-1707-ux-base, "de acordo" do Nicola 04/10 00:22 e 01:03; UXR-29/30) — perguntar() e avisarComDesfazer(): confirmação e aviso sem
// diálogo nativo para o Cofre e os módulos comum-* (que também rodam no cofre.html avulso).
// Dentro do app usam o Sheet/toast do js/raiz-ui.js; no cofre.html avulso (sem Sheet), a
// pergunta cai no confirm() do navegador — ÚNICO ponto permitido (exceção aprovada no plano).
//
// Versão anterior: 1.5.0 · 03/10/2026
//
// v1.5.0 (F0.4, demanda 717fc21d, sessão 20261003-1707-ux-base — teste 8
// reprovado pelo Nicola: "salvar sem nome não mostrou toast nem vibrou").
// Erro de validação de formulário é aviso NO PRÓPRIO FORMULÁRIO, não toast
// (UXR-29); faltava o háptico de erro (UXR-35) e o anúncio ao leitor de tela.
// Nova erroInline(el, msg): escreve o aviso, role="alert", vibra "error" pelo
// adaptador (rzDev) e rola o aviso para a vista. Módulos migram para ela
// quando forem tocados (UXR-02); primeiro uso: cofre-ativos.js 1.70.0.
//
// v1.4.0 (F0.4, demanda 717fc21d, sessão 20261003-1707-ux-base — teste 3
// reprovado pelo Nicola: "no Android não vibrou ao editar e salvar um ativo").
// CAUSA: o app tinha 2 toasts; Ativos usava este (#toast próprio, sem
// háptico), não o do index.html. mostrarToast passa a delegar ao toast único
// do app quando roda dentro dele (window.mostrarToast); no cofre.html avulso
// continua com o #toast local. Mesma assinatura, mesmo texto.
// --------------------------------------------------------------------------
// Versões anteriores (v1.2.0 … v1.3.1): CHANGELOG_MODULOS.md, na raiz do repositório — o
// gerar_versoes.py rola pra lá automaticamente tudo além das 5 versões
// mais recentes deste cabeçalho (VER-05).
export const VERSAO = '1.7.1'; // v-check (03/10/2026): lido por Dev › Versões — manter igual ao header
import { escapeHtml, BADGE_NEUTRO, BADGE_PENDENTE, BADGE_OK } from './cofre-validacoes.js';

// v1.5.0 — aviso de erro dentro do formulário (UXR-29/35): texto + leitor de
// tela + vibração de erro + rolagem até o aviso. Nunca lança.
export function erroInline(el, msg) {
    if (!el) return;
    el.textContent = msg;
    el.style.color = 'var(--danger)';
    el.setAttribute('role', 'alert');
    try { if (typeof window !== 'undefined' && typeof window.rzDev === 'function') window.rzDev('haptic', 'error'); } catch (_) {}
    try { el.scrollIntoView({ block: 'nearest' }); } catch (_) {}
}

// v1.6.0 (F0.2b) — confirmação sem diálogo nativo. Resolve true/false.
// { titulo, impacto, destrutivo, rotuloConfirmar, rotuloCancelar, icone } — mesma
// assinatura do rzConfirmar (js/raiz-ui.js). Fora do app (cofre.html avulso, sem
// Sheet) usa o confirm() do navegador: única exceção permitida pela UXR-30.
export function perguntar(opcoes = {}) {
    const w = typeof window !== 'undefined' ? window : null;
    if (w && typeof w.rzConfirmar === 'function' && typeof w.abrirSheet === 'function') return w.rzConfirmar(opcoes);
    const texto = [opcoes.titulo, opcoes.impacto].filter(Boolean).join('\n\n');
    return Promise.resolve(!!(w && w.confirm(texto))); // exceção UXR-30: cofre.html avulso
}

// v1.7.0 (F1.1) — escolha de 1 opção. { titulo, sub, opcoes: [{ valor, titulo, sub, icone }] }
// → Promise<valor|null>; null = fechou sem escolher.
export function escolher(opcoes = {}) {
    const w = typeof window !== 'undefined' ? window : null;
    if (w && typeof w.rzEscolher === 'function' && typeof w.abrirSheet === 'function') return w.rzEscolher(opcoes);
    const lista = opcoes.opcoes || [];
    if (!w || lista.length < 1) return Promise.resolve(null);
    if (lista.length === 1) return Promise.resolve(lista[0].valor);
    const texto = [opcoes.titulo, opcoes.sub, `OK = ${lista[0].titulo}\nCancelar = ${lista[1].titulo}`].filter(Boolean).join('\n\n');
    return Promise.resolve(w.confirm(texto) ? lista[0].valor : lista[1].valor); // exceção UXR-30: cofre.html avulso
}

// v1.6.0 (F0.2b) — aviso de sucesso com "Desfazer" por 5 s (ação reversível:
// desvincular, arquivar foto, tirar acesso). Fora do app, só o aviso.
export function avisarComDesfazer(msg, desfazer) {
    const w = typeof window !== 'undefined' ? window : null;
    if (w && typeof w.rzToast === 'function' && typeof desfazer === 'function') { w.rzToast(msg, { tipo: 'success', desfazer }); return; }
    mostrarToast(msg);
}

export function mostrarToast(msg, tipo) {
    // v1.4.0 — dentro do app principal, delega ao toast ÚNICO do index.html
    // (acima da bottom nav, aria-live, háptico pelo RaizDevice — UXR-29/35).
    // Guarda contra recursão: só delega se o global não for esta função.
    if (typeof window !== 'undefined' && typeof window.mostrarToast === 'function' && window.mostrarToast !== mostrarToast) {
        window.mostrarToast(msg, tipo === 'erro' ? 'danger' : (tipo === 'aviso' ? 'info' : 'success'));
        return;
    }
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.style.background = tipo === 'erro' ? 'var(--danger)' : (tipo === 'aviso' ? 'var(--warning)' : 'var(--pine)');
    el.classList.remove('hidden');
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(() => el.classList.add('hidden'), 3200);
}

export function abrirModal(id) {
    // v1.3.0 — fecha qualquer OUTRO .modal-overlay que já esteja aberto
    // antes de abrir este. document.querySelectorAll pega todos os
    // modais de nível 0 (não olha o modal-generico dinâmico à parte,
    // que também usa esta classe e já se recria do zero a cada
    // chamada — fechar ele junto é seguro, ele só perderia estado que
    // já ia ser descartado mesmo).
    document.querySelectorAll('.modal-overlay:not(.hidden)').forEach(el => {
        if (el.id !== id) el.classList.add('hidden');
    });
    document.getElementById(id)?.classList.remove('hidden');
    refrescarIcones();
}
export function fecharModal(id) {
    document.getElementById(id)?.classList.add('hidden');
}

// Modal genérico de conteúdo simples (título + corpo HTML) — usado por
// fluxos curtos (ex.: seletor de módulo, criação assistida) para não exigir
// um novo <div id="modal-..."> estático por interação pequena.
export function modalGenerico(titulo, corpoHtml) {
    let overlay = document.getElementById('modal-generico');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'modal-generico';
        overlay.className = 'modal-overlay hidden';
        // v1.3.1 (demanda c7c0cc6f) — z-index próprio, mais alto que o
        // .modal-overlay legado (96) — ver nota de topo do arquivo.
        overlay.style.zIndex = '460';
        overlay.innerHTML = `<div class="modal-box p-5">
            <div class="flex items-start justify-between mb-3">
                <h3 class="text-base font-bold pr-4" id="modal-generico-titulo"></h3>
                <button data-action="fechar-modal-generico" class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style="background:var(--pine)"><i data-lucide="x" class="text-white" style="width:16px;height:16px"></i></button>
            </div>
            <div id="modal-generico-corpo"></div>
        </div>`;
        document.body.appendChild(overlay);
    }
    document.getElementById('modal-generico-titulo').textContent = titulo;
    document.getElementById('modal-generico-corpo').innerHTML = corpoHtml;
    overlay.classList.remove('hidden');
    refrescarIcones();
}

export function refrescarIcones() {
    if (window.lucide) window.lucide.createIcons();
}

// Troca de aba genérica: dado um container de botões [data-tab-target] e um
// conjunto de painéis [data-tab-panel], ativa o painel correspondente.
// Usado tanto pela navegação principal quanto pelas subabas da ficha do
// ativo (mesmo motor, evita duplicar lógica — pedido do prompt corretivo:
// "não derivar tabs diretamente das tabelas do banco", ou seja, a navegação
// é sempre este único mecanismo, nunca ad-hoc por tela).
export function ativarAba(grupoSeletor, nomeAba) {
    const grupo = document.querySelector(grupoSeletor);
    if (!grupo) return;
    const grupoId = grupo.dataset.tabGroup;
    document.querySelectorAll(`[data-tab-panel][data-tab-group="${grupoId}"]`).forEach(p => p.classList.toggle('hidden', p.dataset.tabPanel !== nomeAba));
    document.querySelectorAll(`[data-tab-target][data-tab-group="${grupoId}"]`).forEach(b => b.classList.toggle('active', b.dataset.tabTarget === nomeAba));
}

// Ícone +/X do padrão liga/desliga (Design System §2.4) — reimplementado
// aqui 1x, reaproveitado por todo formulário colapsável do Cofre.
export function alternarToggle(btnId, painelId) {
    const painel = document.getElementById(painelId);
    const btn = document.getElementById(btnId);
    const aberto = painel.classList.toggle('hidden') === false;
    btn?.classList.toggle('ativo', aberto);
    const svg = btn?.querySelector('svg.raiz-icone-toggle');
    if (svg) {
        svg.innerHTML = aberto
            ? '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'
            : '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>';
    }
    return aberto;
}

// Badge de status de vínculo (triagem/empresa/vinculado) — Adendo §11.
// D-2 (revisão DS) — migrado pro badge oficial §14 (ver nota em
// cofre-validacoes.js). "Empresa" é tag de vínculo, não status de
// urgência — mapeado pro neutro (slate), não pro azul (que no App
// significa especificamente "Assinando/Em processamento").
export function chipStatusVinculoHtml(status) {
    const mapa = {
        triagem: { classe: BADGE_PENDENTE, texto: 'Em triagem' },
        empresa: { classe: BADGE_NEUTRO, texto: 'Geral da empresa' },
        vinculado: { classe: BADGE_OK, texto: 'Vinculado' },
    };
    const c = mapa[status] || mapa.triagem;
    return `<span class="${c.classe}">${escapeHtml(c.texto)}</span>`;
}
