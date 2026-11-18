// ============================================================================
// nucleo/lente.js — Raiz Patrimônio · Núcleo de plataforma · lente de ramos com um ou mais ramos
// Versão: 1.1.0 · 18/11/2026
//
// v1.1.0 (18/11/2026, sessão 20261118-1850-financeiro-lente-5bc, demanda 679b2700; LEVANTAMENTO_LENTE_MULTI_RAMO_RAIZ v1.0.0 fatias 5b e 5c, de acordo do Nicola 18/11 14:36 e 18:45) — rpcPorRamos (window.rzRpcPorRamos): com 2+ ramos, Alertas e Agenda chamam a função do banco
// uma vez por ramo marcado (p_ramo) e juntam as listas sem repetir (pela chave de cada linha). As funções continuam com um ramo
// (sem banco novo). Versão anterior: 1.0.0
//
// v1.0.0 (18/11/2026, sessão 20261118-1440-financeiro-lente, demanda 679b2700; FICHA_REVISAO_FINANCEIRO_RAIZ v1.0.0, Onda 5 · D1;
// LEVANTAMENTO_LENTE_MULTI_RAMO_RAIZ v1.0.0, fatia 5a, de acordo do Nicola 18/11 14:36 "De acordo com 5a e a estratégia") —
// criação. O sheet "Ver o app de" passa a ter caixas de marcar: Todo o patrimônio + cada ramo contratado; o botão diz o que
// vai ver ("Ver Imóveis + Comercial"). "Conheça novos ramos" continua no comum-ramos-oferta.js (conhecer).
//
// O QUE ELE FAZ: desenha a escolha e chama ctx.escolher(r, ramos) do index:
//   · todos marcados → escolher('tudo');
//   · um marcado    → escolher('<ramo>') (a cor do ramo, como sempre);
//   · dois ou mais  → escolher('tudo', ['imoveis', 'comercial']): o index guarda a lista em window.RZ_RAMOS_LENTE e mantém
//     geralRamoFiltro = 'tudo'. Assim, quem ainda não sabe de "vários ramos" mostra Todo o patrimônio (fatias 5b e 5c), e
//     quem já sabe (cabeçalho, Financeiro › Resumo, Patrimônio, árvore do Hoje) lê a lista.
// Não guarda nada: a lente não fica salva (Q3); o app abre em Todo ou no ramo padrão da pessoa.
// ============================================================================
export const VERSAO = '1.1.0';

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const icones = () => { if (typeof lucide !== 'undefined') lucide.createIcons(); };

function css() {
    if (document.getElementById('rz-lente-css')) return;
    const s = document.createElement('style');
    s.id = 'rz-lente-css';
    s.textContent = `
.rz-lente{position:relative}
.rz-lente .rz-lente-n{position:absolute;top:-3px;right:-3px;min-width:16px;height:16px;border-radius:999px;background:var(--paper,#f4f3ee);color:var(--pine,#1e3a32);font:700 10px/16px Inter,system-ui,sans-serif;text-align:center;padding:0 4px;box-shadow:0 0 0 1.5px var(--pine,#1e3a32)}
.rz-lm-l{display:flex;align-items:center;gap:12px;width:100%;min-height:56px;padding:8px 4px;border:0;border-bottom:1px solid var(--line,#e6e3da);background:none;text-align:left;cursor:pointer;font:500 15px Inter,system-ui,sans-serif;color:var(--ink,#17211e)}
.rz-lm-l:last-child{border-bottom:0}
.rz-lm-l .rz-ic{width:36px;height:36px;border-radius:10px;display:grid;place-items:center;color:var(--paper,#f4f3ee);flex:none}
.rz-lm-l .rz-ic svg{width:18px;height:18px}
.rz-lm-l small{display:block;font-size:12px;color:var(--muted,#6f7a76);font-weight:400}
.rz-lm-l .rz-lm-tx{flex:1;min-width:0}
.rz-lm-l .rz-lm-ck{width:22px;height:22px;border-radius:6px;border:2px solid var(--line,#c9d0ca);display:grid;place-items:center;flex:none}
.rz-lm-l.rz-on .rz-lm-ck{background:var(--pine,#1e3a32);border-color:var(--pine,#1e3a32);color:#fff}
.rz-lm-l .rz-lm-ck svg{width:14px;height:14px}
.rz-lm-l[aria-disabled="true"]{opacity:.5;cursor:default}
.rz-lm-novos{display:flex;align-items:center;gap:10px;width:100%;margin-top:12px;padding:10px 12px;border:1px dashed var(--line,#c9d0ca);border-radius:12px;background:none;cursor:pointer;text-align:left;font:600 14px Inter,system-ui,sans-serif;color:var(--ink,#17211e)}
.rz-lm-novos small{display:block;font-weight:400;font-size:12px;color:var(--muted,#6f7a76)}`;
    document.head.appendChild(s);
}

/**
 * Abre a lente. ctx: { dbAuth, clienteId, toast, ramos (catálogo RZ_RAMOS), licenciados (array ou null),
 * atual ('tudo' ou código), varios (array ou null), escolher(r, ramos) }
 */
export function abrirLenteRamos(ctx) {
    css();
    const { ramos = [], licenciados = null, atual = 'tudo', varios = null } = ctx;
    const meus = ramos.filter((r) => r.status === 'ativo' && (!licenciados || licenciados.includes(r.codigo)));
    const breve = ramos.filter((r) => r.status !== 'ativo' && (!licenciados || licenciados.includes(r.codigo)));
    const novos = licenciados ? ramos.filter((r) => !licenciados.includes(r.codigo) && r.codigo !== 'outros') : [];
    const todos = meus.map((r) => r.codigo);
    let sel = new Set(Array.isArray(varios) && varios.length ? varios : atual === 'tudo' ? todos : [atual]);
    const nomeDe = (c) => meus.find((r) => r.codigo === c)?.nome || c;

    const desenhar = (sheet) => {
        const tudoOn = todos.every((c) => sel.has(c));
        const ck = (on) => `<span class="rz-lm-ck">${on ? '<svg data-lucide="check"></svg>' : ''}</span>`;
        const linha = (c, nome, sub, cor, ic, on, lock) =>
            `<button type="button" class="rz-lm-l${on ? ' rz-on' : ''}" ${lock ? 'aria-disabled="true"' : `data-lm="${esc(c)}"`} role="checkbox" aria-checked="${on}">
               <span class="rz-ic" style="background:${cor}"><svg data-lucide="${esc(ic || 'circle')}"></svg></span>
               <span class="rz-lm-tx">${esc(nome)}<small>${esc(sub || '')}</small></span>${lock ? '' : ck(on)}</button>`;
        const marcados = todos.filter((c) => sel.has(c));
        const rotulo = !marcados.length ? 'Marque ao menos um ramo' : tudoOn ? 'Ver todo o patrimônio' : 'Ver ' + marcados.map(nomeDe).join(' + ');
        sheet.querySelector('.rz-sh-b').innerHTML =
            linha('tudo', 'Todo o patrimônio', 'Todos os ramos somados', 'var(--pine,#1e3a32)', 'layers', tudoOn, false) +
            meus.map((r) => linha(r.codigo, r.nome, r.descricao, `var(--ramo-cor-${r.codigo}, var(--sage))`, r.icone, sel.has(r.codigo), false)).join('') +
            breve.map((r) => linha(r.codigo, r.nome + ' · em breve', r.descricao, `var(--ramo-cor-${r.codigo}, var(--sage))`, r.icone, false, true)).join('') +
            (novos.length ? `<button type="button" class="rz-lm-novos" data-lm-novos><svg data-lucide="lock"></svg><span style="flex:1">Conheça novos ramos<small>${esc(novos.slice(0, 3).map((r) => r.nome).join(', '))}${novos.length > 3 ? ' e mais' : ''}</small></span><svg data-lucide="chevron-right"></svg></button>` : '');
        const pe = sheet.querySelector('.rz-sh-f');
        pe.innerHTML = `<button type="button" class="rz-btn rz-btn-1 rz-wide" data-lm-ver ${marcados.length ? '' : 'disabled'}>${esc(rotulo)}</button>`;
        sheet.querySelectorAll('[data-lm]').forEach((b) => b.addEventListener('click', () => {
            const c = b.dataset.lm;
            if (c === 'tudo') sel = tudoOn ? new Set() : new Set(todos);
            else if (sel.has(c)) sel.delete(c); else sel.add(c);
            desenhar(sheet);
        }));
        sheet.querySelector('[data-lm-novos]')?.addEventListener('click', () => {
            import('../comum-ramos-oferta.js').then((m) => m.conhecer(ctx)).catch(() => ctx.toast?.('Não foi possível abrir os ramos agora.', 'danger'));
        });
        pe.querySelector('[data-lm-ver]')?.addEventListener('click', () => {
            const lista = todos.filter((c) => sel.has(c));
            if (!lista.length) return;
            window.fecharSheet?.();
            if (lista.length === todos.length) ctx.escolher('tudo');
            else if (lista.length === 1) ctx.escolher(lista[0]);
            else ctx.escolher('tudo', lista);
        });
        icones();
    };

    const sheet = window.abrirSheet(window.rzSheetCabecalho('Ver o app de', 'Marque um ou mais ramos. Vale para todas as abas até você trocar de novo.') +
        '<div class="rz-sh-b"></div><div class="rz-sh-f"></div>');
    if (sheet) desenhar(sheet);
}

/** Selo com o número de ramos no botão da lente (o index chama depois de desenhar o ícone). */
export function seloLente(bt, varios) {
    css();
    if (!bt) return;
    bt.querySelector('.rz-lente-n')?.remove();
    if (Array.isArray(varios) && varios.length > 1) bt.insertAdjacentHTML('beforeend', `<b class="rz-lente-n">${varios.length}</b>`);
}
/** v1.1.0 — chama a função uma vez por ramo e junta as linhas sem repetir; devolve { data, error } como o dbAuth.rpc. */
export async function rpcPorRamos(nome, args, ramos, chave) {
    const rs = await Promise.all(ramos.map((r) => dbAuth.rpc(nome, { ...args, p_ramo: r })));
    const erro = rs.find((x) => x.error);
    if (erro) return { data: null, error: erro.error };
    const vistos = new Set(), data = [];
    rs.forEach((x) => (x.data || []).forEach((l) => { const k = chave(l); if (!vistos.has(k)) { vistos.add(k); data.push(l); } }));
    return { data, error: null };
}
if (typeof window !== 'undefined') {
    window.rzRpcPorRamos = (nome, args, chave) => rpcPorRamos(nome, args, window.RZ_RAMOS_LENTE || [], chave);
}
if (typeof window !== 'undefined') window.rzSeloLente = seloLente; // o index pinta o selo sem importar (só existe vários ramos depois da lente aberta)
