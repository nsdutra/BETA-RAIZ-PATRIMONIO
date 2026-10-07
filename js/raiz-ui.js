// ============================================================================
// raiz-ui.js — Raiz Patrimônio · Diálogos sem diálogo nativo (UXR-29/30)
// Versão: 1.2.0 · 07/10/2026
//
// v1.2.0 (07/10/2026, sessão 20261007-0158-financeiro, demanda f3e6cd27 — pedido do Nicola
// 01:58: "há 3 telas distintas, padronize"): componente ÚNICO rzEditarDivisao para toda
// divisão em % entre pessoas — exceção de um lançamento (Financeiro), divisão do contrato e do
// imóvel (Divisão Societária) e propriedade do ativo (Ativos). Linha compacta numa só altura:
// nome (e o que é: sócio, parte externa ou o valor) · campo % · remover; "Adicionar pessoa"
// (pessoas cadastradas ou nome livre, quando permitido); soma ao vivo com o que falta; rodapé
// Cancelar | Salvar, Salvar só liga em 100% com todos os nomes. Também em window.rzEditarDivisao.
//
// Versão anterior: 1.1.0 · 04/10/2026
//
// v1.1.0 (F1.1 do PLANO_UX, demanda c5d844a4, sessão 20261003-1707-ux-base, "Aprovado.
// Siga" do Nicola 04/10 08:09; DIRETRIZES UXR-28) — rzConfirmar, rzEscolher e rzAviso
// abrem com { empilhar: true }: com um sheet já aberto, vão para o NÍVEL 2 da pilha
// (index.html 1.298.0) e o sheet de baixo volta intacto ao responder ou fechar. Sem sheet
// aberto, nada muda. Assinaturas iguais.
//
// Versão anterior: 1.0.0 · 03/10/2026
//
// v1.0.0 (03/10/2026, sessão 20261003-2250-financeiro, demanda 94245176,
// decisão D25 do Nicola) — módulo NOVO com os 3 substitutos que a DIRETRIZES
// UXR-30 exige no lugar de alert()/confirm()/prompt(), na assinatura do
// PLANO_UX_PWA_ATUAL (fatia F0.2), para a frente UX adotar sem reescrever:
//   rzToast(msg, { tipo, desfazer, rotuloDesfazer, duracao })
//   rzConfirmar({ titulo, impacto, destrutivo, rotuloConfirmar, rotuloCancelar }) → Promise<boolean>
//   rzEscolher({ titulo, sub, opcoes: [{ valor, titulo, sub, icone }] })        → Promise<valor|null>
// e 1 auxiliar para o caso que o alert() fazia e nenhum dos 3 cobre — um
// resumo de várias linhas que a pessoa precisa ler (ex.: fim da importação
// do extrato):
//   rzAviso({ titulo, linhas, rotulo })                                          → Promise<void>
//
// Tudo é Sheet (única superfície modal, REGRAS §2) montado pelos helpers que
// já existem no index.html (abrirSheet / fecharSheet / rzSheetCabecalho /
// mostrarToast / rzDev) — nenhuma superfície nova, nenhum CSS novo. Sheet
// fechado pelo X, por toque fora ou por arraste conta como "Cancelar".
// Destrutivo segue REGRAS §6: a confirmação vira o último item vermelho de um
// Sheet de ações (nunca botão vermelho em rodapé) e dispara o háptico
// 'warning' (UXR-35). Também publica window.rzToast/rzConfirmar/rzEscolher/
// rzAviso para código inline do index.html.
// ============================================================================
export const VERSAO = '1.2.0'; // v-check: lido por ⚙️ › Conta › Versões — manter igual ao header

const esc = (v) => String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const g = (nome) => (typeof window !== 'undefined' && typeof window[nome] === 'function') ? window[nome] : null;

function cabecalho(titulo, sub) {
    const f = g('rzSheetCabecalho');
    if (f) return f(titulo, sub);
    return `<div class="rz-sh-h"><div style="flex:1;min-width:0"><h3>${esc(titulo)}</h3>${sub ? `<span class="rz-sub">${esc(sub)}</span>` : ''}</div>` +
        `<button type="button" class="rz-x" onclick="fecharSheet()" aria-label="Fechar"><svg data-lucide="x"></svg></button></div>`;
}

function haptic(tipo) { const d = g('rzDev'); if (d) d('haptic', tipo); }

/** Toast acima da bottom nav (UXR-29). Sem `desfazer`, usa o mostrarToast de
 * sempre (mesma cor, ícone e háptico). Com `desfazer`, mostra o botão
 * "Desfazer" por 5 s e chama a função se a pessoa tocar. tipo: 'success' |
 * 'danger' | 'info' ('erro' e 'aviso' são aceitos como sinônimos). */
export function rzToast(mensagem, opcoes = {}) {
    const tipoBruto = typeof opcoes === 'string' ? opcoes : (opcoes.tipo || 'success');
    const tipo = ({ erro: 'danger', aviso: 'info', ok: 'success' })[tipoBruto] || tipoBruto;
    const desfazer = typeof opcoes === 'object' ? opcoes.desfazer : null;
    const mostrar = g('mostrarToast');
    if (typeof desfazer !== 'function') {
        if (mostrar) return mostrar(esc(mensagem), tipo);
        console.info('[rzToast]', mensagem);
        return;
    }
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.setAttribute('role', 'status');
        container.setAttribute('aria-live', 'polite');
        document.body.appendChild(container);
    }
    const cor = tipo === 'danger' ? 'var(--danger)' : 'var(--pine)';
    const el = document.createElement('div');
    el.style.cssText = `background:${cor};color:#fff;padding:8px 8px 8px 18px;border-radius:10px;box-shadow:0 8px 20px -8px rgba(0,0,0,.35);font-size:15px;font-weight:600;display:flex;align-items:center;gap:12px;max-width:360px;opacity:0;transform:translateY(8px);transition:opacity .2s ease,transform .2s ease;`;
    el.innerHTML = `<span style="flex:1">${esc(mensagem)}</span><button type="button" style="min-height:40px;padding:0 12px;border-radius:8px;background:rgba(255,255,255,.16);color:#fff;font-weight:700;border:0">${esc(opcoes.rotuloDesfazer || 'Desfazer')}</button>`;
    container.appendChild(el);
    haptic(tipo === 'danger' ? 'error' : 'success');
    requestAnimationFrame(() => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; });
    let usado = false;
    const sumir = () => { el.style.opacity = '0'; el.style.transform = 'translateY(8px)'; setTimeout(() => el.remove(), 220); };
    el.querySelector('button').addEventListener('click', () => { if (usado) return; usado = true; sumir(); try { desfazer(); } catch (e) { console.error('[rzToast] desfazer', e); } });
    setTimeout(() => { if (!usado) sumir(); }, opcoes.duracao || 5000);
}

/** Confirmação como Sheet (substitui confirm()). Resolve true só no toque em
 * confirmar; X, toque fora ou arraste resolvem false. */
export function rzConfirmar({ titulo = 'Confirmar', impacto = '', destrutivo = false, rotuloConfirmar = 'Confirmar', rotuloCancelar = 'Cancelar', icone } = {}) {
    return new Promise((resolve) => {
        const abrir = g('abrirSheet'), fechar = g('fecharSheet');
        if (!abrir || !fechar) { resolve(false); return; }
        let decidido = false;
        const decidir = (v) => { if (decidido) return; decidido = true; resolve(v); };
        const texto = impacto ? `<p style="font-size:15px;color:var(--ink);margin:0 0 12px;line-height:1.45">${esc(impacto)}</p>` : '';
        let html;
        if (destrutivo) {
            html = cabecalho(titulo) + `<div class="rz-sh-b">${texto}` +
                `<button type="button" class="rz-act rz-bad" data-rz-ok><div class="rz-ic rz-bad"><svg data-lucide="${esc(icone || 'trash-2')}"></svg></div><div>${esc(rotuloConfirmar)}</div></button>` +
                `<button type="button" class="rz-act" data-rz-cancelar><div class="rz-ic"><svg data-lucide="x"></svg></div><div>${esc(rotuloCancelar)}</div></button></div>`;
            haptic('warning');
        } else {
            html = cabecalho(titulo) + `<div class="rz-sh-b">${texto}</div>` +
                `<div class="rz-sh-f"><button type="button" class="rz-btn rz-btn-2" data-rz-cancelar>${esc(rotuloCancelar)}</button>` +
                `<button type="button" class="rz-btn rz-btn-1" data-rz-ok>${esc(rotuloConfirmar)}</button></div>`;
        }
        const sheet = abrir(html, { aoFechar: () => decidir(false), empilhar: true });
        sheet.querySelector('[data-rz-ok]')?.addEventListener('click', () => { decidir(true); fechar(); });
        sheet.querySelector('[data-rz-cancelar]')?.addEventListener('click', () => { decidir(false); fechar(); });
    });
}

/** Escolha de 1 opção numa lista (substitui prompt() numerado). */
export function rzEscolher({ titulo = 'Escolher', sub = '', opcoes = [] } = {}) {
    return new Promise((resolve) => {
        const abrir = g('abrirSheet'), fechar = g('fecharSheet');
        if (!abrir || !fechar || !opcoes.length) { resolve(null); return; }
        let decidido = false;
        const decidir = (v) => { if (decidido) return; decidido = true; resolve(v); };
        const itens = opcoes.map((o, i) => `<button type="button" class="rz-act" data-rz-i="${i}"><div class="rz-ic"><svg data-lucide="${esc(o.icone || 'chevron-right')}"></svg></div>` +
            `<div>${esc(o.titulo)}${o.sub ? `<small>${esc(o.sub)}</small>` : ''}</div></button>`).join('');
        const sheet = abrir(cabecalho(titulo, sub) + `<div class="rz-sh-b">${itens}</div>`, { aoFechar: () => decidir(null), empilhar: true });
        sheet.querySelectorAll('[data-rz-i]').forEach(b => b.addEventListener('click', () => {
            decidir(opcoes[Number(b.dataset.rzI)].valor); fechar();
        }));
    });
}

/** Resumo de várias linhas para ler e fechar (o que o alert() longo fazia). */
export function rzAviso({ titulo = 'Aviso', linhas = [], rotulo = 'Entendi' } = {}) {
    return new Promise((resolve) => {
        const abrir = g('abrirSheet'), fechar = g('fecharSheet');
        if (!abrir || !fechar) { resolve(); return; }
        const corpo = (Array.isArray(linhas) ? linhas : [linhas]).filter(Boolean)
            .map(l => `<p style="font-size:15px;color:var(--ink);margin:0 0 10px;line-height:1.45">${esc(l)}</p>`).join('');
        const sheet = abrir(cabecalho(titulo) + `<div class="rz-sh-b">${corpo}</div>` +
            `<div class="rz-sh-f"><button type="button" class="rz-btn rz-btn-1 rz-wide" data-rz-ok>${esc(rotulo)}</button></div>`, { aoFechar: () => resolve(), empilhar: true });
        sheet.querySelector('[data-rz-ok]')?.addEventListener('click', () => fechar());
    });
}

/** Editor único de divisão em % entre pessoas (v1.2.0).
 * itens: [{ pessoa_id, nome_externo, nome, percentual }] · candidatos: [{ id, nome, sub }]
 * aoSalvar(itens) → Promise<boolean> (true fecha). Valor de cada parte aparece quando há valorBase. */
export function rzEditarDivisao({ titulo = 'Editar divisão', sub = '', nota = '', itens = [], candidatos = [], permitirExterno = false,
                                  valorBase = null, rotuloSalvar = 'Salvar divisão', rotuloAdicionar = 'Adicionar pessoa', aoSalvar } = {}) {
    const abrir = g('abrirSheet'), fechar = g('fecharSheet');
    if (!abrir || !fechar) return;
    const lista = itens.map(i => ({ pessoa_id: i.pessoa_id || null, nome_externo: i.pessoa_id ? null : (i.nome_externo || ''), nome: i.nome || i.nome_externo || '', percentual: Number(i.percentual) || 0 }));
    const nomeCand = Object.fromEntries((candidatos || []).map(c => [c.id, c.nome]));
    const soma = () => Math.round(lista.reduce((t, i) => t + (Number(i.percentual) || 0), 0) * 100) / 100;
    const pctTxt = (v) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + '%';
    const moeda = (v) => 'R$\u00a0' + Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const valida = () => Math.abs(soma() - 100) < 0.01 && lista.length > 0 && lista.every(i => i.pessoa_id || String(i.nome_externo || '').trim());
    const linhaSub = (i) => valorBase != null ? moeda(Number(valorBase) * (Number(i.percentual) || 0) / 100) : (i.pessoa_id ? 'Pessoa cadastrada' : 'Parte externa');
    const linha = (i, k) => `<div class="rz-row" style="gap:10px;padding-top:10px;padding-bottom:10px">
        <div class="rz-tx" style="flex:1;min-width:0">${i.pessoa_id
            ? `<b style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(nomeCand[i.pessoa_id] || i.nome)}</b>`
            : `<input type="text" data-rzd-nome="${k}" value="${esc(i.nome_externo || '')}" placeholder="Nome da parte externa" aria-label="Nome" style="box-sizing:border-box;width:100%;height:40px;padding:0 10px;border:1.5px solid var(--line);border-radius:var(--r-ctl);font:inherit;font-size:16px;background:var(--card);color:var(--ink)">`}
            <span data-rzd-sub="${k}">${esc(linhaSub(i))}</span></div>
        <div style="display:flex;align-items:center;gap:4px;flex:none"><input type="number" inputmode="decimal" step="0.01" min="0" max="100" data-rzd-pct="${k}" value="${i.percentual || ''}" aria-label="Percentual" style="box-sizing:border-box;width:72px;height:44px;padding:0 8px;border:1.5px solid var(--line);border-radius:var(--r-ctl);font:inherit;font-size:16px;text-align:right;background:var(--card);color:var(--ink)"><span style="color:var(--muted);font-size:15px">%</span></div>
        <button type="button" data-rzd-tirar="${k}" aria-label="Tirar da divisão" style="flex:none;width:40px;height:44px;border:0;background:none;color:var(--muted);display:grid;place-items:center;cursor:pointer"><svg data-lucide="trash-2" style="width:18px;height:18px"></svg></button>
    </div>`;
    const html = cabecalho(titulo, sub) + `<div class="rz-sh-b" data-rzd-corpo></div>` +
        `<div class="rz-sh-f"><button type="button" class="rz-btn rz-btn-2" data-rzd-cancelar>Cancelar</button><button type="button" class="rz-btn rz-btn-1" data-rzd-salvar>${esc(rotuloSalvar)}</button></div>`;
    const sheet = abrir(html, {});
    const corpo = sheet.querySelector('[data-rzd-corpo]');
    const btnSalvar = sheet.querySelector('[data-rzd-salvar]');
    const atualizarSoma = () => {
        const s2 = soma(), ok = Math.abs(s2 - 100) < 0.01;
        const el = corpo.querySelector('[data-rzd-soma]');
        if (el) {
            el.querySelector('b').textContent = pctTxt(s2);
            el.querySelector('b').style.color = ok ? 'var(--success)' : 'var(--danger)';
            el.querySelector('span').textContent = ok ? '' : (s2 < 100 ? `falta ${pctTxt(100 - s2)}` : `passou ${pctTxt(s2 - 100)}`);
        }
        btnSalvar.disabled = !valida();
    };
    const desenhar = () => {
        corpo.innerHTML = (nota ? `<p style="margin:0 0 10px;font-size:14px;color:var(--muted);line-height:1.4">${esc(nota)}</p>` : '') +
            `<div class="rz-card rz-list">${lista.map(linha).join('') || '<div class="rz-empty"><p>Ninguém na divisão ainda.</p></div>'}</div>` +
            `<button type="button" class="rz-act" data-rzd-add><div class="rz-ic"><svg data-lucide="user-plus"></svg></div><div>${esc(rotuloAdicionar)}<small>${permitirExterno ? 'Pessoa cadastrada ou parte externa' : 'Pessoa cadastrada'}</small></div></button>` +
            `<div data-rzd-soma style="display:flex;justify-content:space-between;align-items:baseline;margin-top:12px;padding-top:12px;border-top:1px solid var(--line);font-size:15px">` +
            `<span style="color:var(--muted)"></span><div style="display:flex;gap:8px;align-items:baseline"><small style="color:var(--muted);font-size:13px">Soma</small><b style="font-size:17px"></b></div></div>`;
        // a frase "falta x%" fica à esquerda, a soma à direita
        const somaEl = corpo.querySelector('[data-rzd-soma]');
        somaEl.querySelector('b').style.fontWeight = '700';
        corpo.querySelectorAll('[data-rzd-pct]').forEach(inp => inp.addEventListener('input', () => {
            const k = Number(inp.dataset.rzdPct);
            lista[k].percentual = parseFloat(String(inp.value).replace(',', '.')) || 0;
            const subEl = corpo.querySelector(`[data-rzd-sub="${k}"]`); if (subEl) subEl.textContent = linhaSub(lista[k]);
            atualizarSoma();
        }));
        corpo.querySelectorAll('[data-rzd-nome]').forEach(inp => inp.addEventListener('input', () => { lista[Number(inp.dataset.rzdNome)].nome_externo = inp.value; atualizarSoma(); }));
        corpo.querySelectorAll('[data-rzd-tirar]').forEach(b => b.addEventListener('click', () => { lista.splice(Number(b.dataset.rzdTirar), 1); desenhar(); }));
        corpo.querySelector('[data-rzd-add]')?.addEventListener('click', async () => {
            const ja = new Set(lista.map(i => i.pessoa_id).filter(Boolean));
            const opcoes = (candidatos || []).filter(c => c.id && !ja.has(c.id)).map(c => ({ valor: c.id, titulo: c.nome, sub: c.sub || '', icone: 'user' }));
            if (permitirExterno) opcoes.push({ valor: '__externo', titulo: 'Parte externa', sub: 'Alguém sem cadastro: digite o nome', icone: 'user-round' });
            if (!opcoes.length) { rzToast('Todas as pessoas cadastradas já estão na divisão.', { tipo: 'info' }); return; }
            const v = await rzEscolher({ titulo: rotuloAdicionar, opcoes });
            if (!v) return;
            const falta = Math.max(0, Math.round((100 - soma()) * 100) / 100);
            lista.push(v === '__externo' ? { pessoa_id: null, nome_externo: '', nome: '', percentual: falta } : { pessoa_id: v, nome_externo: null, nome: nomeCand[v] || '', percentual: falta });
            desenhar();
            if (v === '__externo') corpo.querySelector(`[data-rzd-nome="${lista.length - 1}"]`)?.focus();
        });
        const ic = g('rzIcones'); if (ic) ic();
        atualizarSoma();
    };
    desenhar();
    sheet.querySelector('[data-rzd-cancelar]')?.addEventListener('click', () => fechar());
    btnSalvar.addEventListener('click', async () => {
        if (!valida()) return;
        btnSalvar.disabled = true;
        try {
            const ok = typeof aoSalvar === 'function'
                ? await aoSalvar(lista.map(i => ({ pessoa_id: i.pessoa_id, nome_externo: i.pessoa_id ? null : String(i.nome_externo || '').trim(), nome: i.pessoa_id ? (nomeCand[i.pessoa_id] || i.nome) : String(i.nome_externo || '').trim(), percentual: Number(i.percentual) || 0 })))
                : true;
            if (ok !== false) fechar();
        } catch (e) {
            console.error('[rzEditarDivisao] salvar', e);
            rzToast('Não foi possível salvar: ' + (e?.message || e), { tipo: 'danger' });
        } finally { btnSalvar.disabled = !valida(); }
    });
    return sheet;
}

if (typeof window !== 'undefined') {
    window.rzEditarDivisao = rzEditarDivisao;
    window.rzToast = rzToast;
    window.rzConfirmar = rzConfirmar;
    window.rzEscolher = rzEscolher;
    window.rzAviso = rzAviso;
}
