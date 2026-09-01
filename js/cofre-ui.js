// ============================================================================
// cofre-ui.js — Raiz Patrimônio · Cofre de Documentos
// Versão: 1.3.0 · 01/09/2026
//
// v1.3.0 (pedido explícito, 01/09/2026: "apenas um modal deve ser
// aberto por vez") — abrirModal() passou a fechar qualquer outro
// .modal-overlay que já estivesse aberto antes de abrir o novo. Antes,
// nada impedia 2+ modais ficarem abertos ao mesmo tempo se um fluxo
// disparasse um modal de dentro de outro sem fechar o anterior
// primeiro.
//
// v1.2.0 — D-2 (revisão DS): chipStatusVinculoHtml() migrada pro badge
// oficial §14 (BADGE_NEUTRO/BADGE_PENDENTE/BADGE_OK, importados de
// cofre-validacoes.js) — removido prefixo "chip " (classe já vem
// completa). Sem mudança de comportamento.
//
// Helpers de DOM reutilizáveis: toast, abrir/fechar modal, troca de aba
// genérica, template de card, indicador de "liga/desliga" (Design System
// v1.43.0 §2). Não importa cofre-api.js — não sabe nada de Supabase.
// ============================================================================
import { escapeHtml, BADGE_NEUTRO, BADGE_PENDENTE, BADGE_OK } from './cofre-validacoes.js';

export function mostrarToast(msg, tipo) {
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
