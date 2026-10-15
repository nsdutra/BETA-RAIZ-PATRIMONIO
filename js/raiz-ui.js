// ============================================================================
// raiz-ui.js — Raiz Patrimônio · Diálogos sem diálogo nativo (UXR-29/30)
// Versão: 1.5.0 · 14/10/2026
//
// v1.5.0 (14/10/2026, sessão 20261014-2145-onda9c-textos, demanda a05ad2ee; onda 9c do estudo PROTOTIPO_UX_DENSIDADE_RAMOS_RAIZ
// v1.2.0, D6 seção 10) — textos no limite: ação até 24 caracteres, descrição até 28, aviso até 40 com o resultado e tela
// vazia em 1 frase de até 40. A explicação longa fica na confirmação, quando existe. Nada de comportamento mudou.
// Versão anterior: 1.4.0 · 11/10/2026
//
// v1.4.0 (11/10/2026, sessão 20261008-1231-pessoas-ativos, demanda f3e6cd27; bloco "Produto, já registrado", Nicola 11/10 18:41 ("quero evoluir com Produto, já registrado"); F13 §3.5 e F13.4) — rzEditarDivisao
// ganha a opção modos: true, com o seletor "%  ·  Cotas  ·  Valor" no topo (Valor só quando há valorBase), como no
// Splitwise:
//   · Cotas: cada pessoa recebe um número de cotas (1, 2, 1,5…) e o percentual sai da proporção;
//   · Valor: cada pessoa recebe um valor em R$; a soma precisa bater com o total do movimento;
//   · o percentual continua sendo o que o banco soma; o modo, as cotas e o valor vão juntos em cada linha para a
//     folha reabrir igual (fn_divisao_excecao_definir já guarda desde a F13.4);
//   · "Dividir igual" funciona nos três modos.
// Sem a opção, o editor é o de sempre (só %). aoSalvar recebe (itens, { igual, modo }), e cada item traz modo, cotas, valor.
//
// Versão anterior: 1.3.0 · 11/10/2026
//
// v1.3.0 (11/10/2026, sessão 20261008-1231-pessoas-ativos, demanda f3e6cd27; F13 §3.5) — rzEditarDivisao ganha a opção
// igualar: true, que mostra "Dividir igual entre todos" (percentuais iguais; o arredondamento fica com o primeiro, que é
// quem pagou). O retorno de aoSalvar passa a trazer igual: true quando a divisão ficou igual. Sem a opção, nada muda.
//
// Versão anterior: 1.2.0 · 07/10/2026
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
// --------------------------------------------------------------------------
// Versões anteriores (v1.0.0 … v1.0.0): CHANGELOG_MODULOS.md, na raiz do repositório — o
// gerar_versoes.py rola pra lá automaticamente tudo além das 5 versões
// mais recentes deste cabeçalho (VER-06).
export const VERSAO = '1.5.0'; // v-check: lido por ⚙️ › Conta › Versões — manter igual ao header

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

/** Editor único de divisão entre pessoas (v1.2.0; modos % · cotas · valor desde a v1.4.0).
 * itens: [{ pessoa_id, nome_externo, nome, percentual, modo?, cotas?, valor? }] · candidatos: [{ id, nome, sub }]
 * aoSalvar(itens, { igual, modo }) → Promise<boolean> (true fecha). Valor de cada parte aparece quando há valorBase.
 * modos: true liga o seletor % · Cotas · Valor (Valor só com valorBase). O percentual é sempre o que vai para o banco. */
export function rzEditarDivisao({ titulo = 'Editar divisão', sub = '', nota = '', itens = [], candidatos = [], permitirExterno = false,
                                  valorBase = null, rotuloSalvar = 'Salvar divisão', rotuloAdicionar = 'Adicionar pessoa', aoSalvar, igualar = false,
                                  modos = false } = {}) {
    const abrir = g('abrirSheet'), fechar = g('fecharSheet');
    if (!abrir || !fechar) return;
    const base = Number(valorBase) || 0;
    const modosOk = modos ? (base > 0 ? ['percentual', 'cotas', 'valor'] : ['percentual', 'cotas']) : ['percentual'];
    const r2 = (v) => Math.round((Number(v) || 0) * 100) / 100;
    const lista = itens.map(i => ({ pessoa_id: i.pessoa_id || null, nome_externo: i.pessoa_id ? null : (i.nome_externo || ''), nome: i.nome || i.nome_externo || '',
        percentual: Number(i.percentual) || 0, cotas: i.cotas != null ? Number(i.cotas) : null, valor: i.valor != null ? Number(i.valor) : null }));
    let modo = modosOk.includes(itens[0]?.modo) ? itens[0].modo : 'percentual';
    const nomeCand = Object.fromEntries((candidatos || []).map(c => [c.id, c.nome]));
    const soma = () => Math.round(lista.reduce((t, i) => t + (Number(i.percentual) || 0), 0) * 100) / 100;
    const somaCotas = () => lista.reduce((t, i) => t + (Number(i.cotas) || 0), 0);
    const somaValor = () => r2(lista.reduce((t, i) => t + (Number(i.valor) || 0), 0));
    const pctTxt = (v) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + '%';
    const moeda = (v) => 'R$ ' + Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const numTxt = (v) => Number(v || 0).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
    // cotas e valor → percentual (4 casas; o arredondamento fica com o primeiro, que costuma ser quem pagou)
    const recalcular = () => {
        if (modo === 'percentual' || !lista.length) return;
        const tot = modo === 'cotas' ? somaCotas() : base;
        if (!(tot > 0)) { lista.forEach(i => { i.percentual = 0; }); return; }
        lista.forEach(i => { i.percentual = Math.round((Number(modo === 'cotas' ? i.cotas : i.valor) || 0) * 1000000 / tot) / 10000; });
        if (modo === 'cotas' || Math.abs(somaValor() - base) < 0.01) {
            const resto = Math.round((100 - lista.slice(1).reduce((t, i) => t + i.percentual, 0)) * 10000) / 10000;
            lista[0].percentual = resto;
        }
    };
    // ao trocar de modo, parte do que já está na folha
    const converterPara = (novo) => {
        if (novo === 'cotas') lista.forEach(i => { if (!(Number(i.cotas) > 0)) i.cotas = 1; });
        if (novo === 'valor') lista.forEach(i => { if (i.valor == null || modo !== 'valor') i.valor = r2(base * (Number(i.percentual) || 0) / 100); });
        modo = novo; recalcular();
    };
    const valida = () => {
        if (!lista.length || !lista.every(i => i.pessoa_id || String(i.nome_externo || '').trim())) return false;
        if (modo === 'cotas') return lista.every(i => Number(i.cotas) > 0);
        if (modo === 'valor') return Math.abs(somaValor() - base) < 0.01 && lista.every(i => Number(i.valor) >= 0);
        return Math.abs(soma() - 100) < 0.01;
    };
    const linhaSub = (i) => {
        const val = base > 0 ? moeda(base * (Number(i.percentual) || 0) / 100) : '';
        if (modo === 'cotas') return `${pctTxt(i.percentual)}${val ? ' · ' + val : ''}`;
        if (modo === 'valor') return pctTxt(i.percentual);
        return val || (i.pessoa_id ? 'Pessoa cadastrada' : 'Parte externa');
    };
    const campo = (i, k) => {
        const est = 'box-sizing:border-box;height:44px;padding:0 8px;border:1.5px solid var(--line);border-radius:var(--r-ctl);font:inherit;font-size:16px;text-align:right;background:var(--card);color:var(--ink)';
        if (modo === 'cotas') return `<input type="number" inputmode="decimal" step="0.5" min="0" data-rzd-cotas="${k}" value="${i.cotas ?? ''}" aria-label="Cotas" style="${est};width:64px"><span style="color:var(--muted);font-size:14px">cotas</span>`;
        if (modo === 'valor') return `<span style="color:var(--muted);font-size:14px">R$</span><input type="number" inputmode="decimal" step="0.01" min="0" data-rzd-valor="${k}" value="${i.valor ?? ''}" aria-label="Valor" style="${est};width:96px">`;
        return `<input type="number" inputmode="decimal" step="0.01" min="0" max="100" data-rzd-pct="${k}" value="${i.percentual || ''}" aria-label="Percentual" style="${est};width:72px"><span style="color:var(--muted);font-size:15px">%</span>`;
    };
    const linha = (i, k) => `<div class="rz-row" style="gap:10px;padding-top:10px;padding-bottom:10px">
        <div class="rz-tx" style="flex:1;min-width:0">${i.pessoa_id
            ? `<b style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(nomeCand[i.pessoa_id] || i.nome)}</b>`
            : `<input type="text" data-rzd-nome="${k}" value="${esc(i.nome_externo || '')}" placeholder="Nome da parte externa" aria-label="Nome" style="box-sizing:border-box;width:100%;height:40px;padding:0 10px;border:1.5px solid var(--line);border-radius:var(--r-ctl);font:inherit;font-size:16px;background:var(--card);color:var(--ink)">`}
            <span data-rzd-sub="${k}">${esc(linhaSub(i))}</span></div>
        <div style="display:flex;align-items:center;gap:4px;flex:none">${campo(i, k)}</div>
        <button type="button" data-rzd-tirar="${k}" aria-label="Tirar da divisão" style="flex:none;width:40px;height:44px;border:0;background:none;color:var(--muted);display:grid;place-items:center;cursor:pointer"><svg data-lucide="trash-2" style="width:18px;height:18px"></svg></button>
    </div>`;
    const html = cabecalho(titulo, sub) + `<div class="rz-sh-b" data-rzd-corpo></div>` +
        `<div class="rz-sh-f"><button type="button" class="rz-btn rz-btn-2" data-rzd-cancelar>Cancelar</button><button type="button" class="rz-btn rz-btn-1" data-rzd-salvar>${esc(rotuloSalvar)}</button></div>`;
    const sheet = abrir(html, {});
    const corpo = sheet.querySelector('[data-rzd-corpo]');
    const btnSalvar = sheet.querySelector('[data-rzd-salvar]');
    const atualizarSoma = () => {
        const el = corpo.querySelector('[data-rzd-soma]');
        if (el) {
            let total, ok, falta;
            if (modo === 'cotas') { const c = somaCotas(); total = `${numTxt(c)} ${c === 1 ? 'cota' : 'cotas'}`; ok = valida(); falta = ok ? '' : 'toda pessoa precisa de cota'; }
            else if (modo === 'valor') { const v = somaValor(); total = moeda(v); ok = Math.abs(v - base) < 0.01; falta = ok ? '' : (v < base ? `falta ${moeda(base - v)}` : `passou ${moeda(v - base)}`); }
            else { const s2 = soma(); total = pctTxt(s2); ok = Math.abs(s2 - 100) < 0.01; falta = ok ? '' : (s2 < 100 ? `falta ${pctTxt(100 - s2)}` : `passou ${pctTxt(s2 - 100)}`); }
            el.querySelector('b').textContent = total;
            el.querySelector('b').style.color = ok ? 'var(--success)' : 'var(--danger)';
            el.querySelector('span').textContent = falta;
        }
        lista.forEach((i, k) => { const subEl = corpo.querySelector(`[data-rzd-sub="${k}"]`); if (subEl) subEl.textContent = linhaSub(i); });
        btnSalvar.disabled = !valida();
    };
    const desenhar = () => {
        const seg = modosOk.length > 1 ? `<div class="rz-chips" style="margin:0 0 10px">${modosOk.map(m => `<button type="button" class="rz-chip${modo === m ? ' rz-on' : ''}" data-rzd-modo="${m}">${m === 'percentual' ? '%' : m === 'cotas' ? 'Cotas' : 'Valor'}</button>`).join('')}</div>` : '';
        corpo.innerHTML = (nota ? `<p style="margin:0 0 10px;font-size:14px;color:var(--muted);line-height:1.4">${esc(nota)}</p>` : '') + seg +
            (modo === 'valor' ? `<p style="margin:0 0 8px;font-size:13px;color:var(--muted)">Total do movimento: <b style="color:var(--ink)">${moeda(base)}</b></p>` : '') +
            `<div class="rz-card rz-list">${lista.map(linha).join('') || '<div class="rz-empty"><p>Ninguém na divisão ainda.</p></div>'}</div>` +
            `<button type="button" class="rz-act" data-rzd-add><div class="rz-ic"><svg data-lucide="user-plus"></svg></div><div>${esc(rotuloAdicionar)}<small>${permitirExterno ? 'Pessoa cadastrada ou parte externa' : 'Pessoa cadastrada'}</small></div></button>` +
            (igualar && lista.length > 1 ? `<button type="button" class="rz-act" data-rzd-igual><div class="rz-ic"><svg data-lucide="equal"></svg></div><div>Dividir igual entre todos<small>${lista.length} pessoas · ${pctTxt(Math.floor(10000 / lista.length) / 100)} cada</small></div></button>` : '') +
            `<div data-rzd-soma style="display:flex;justify-content:space-between;align-items:baseline;margin-top:12px;padding-top:12px;border-top:1px solid var(--line);font-size:15px">` +
            `<span style="color:var(--muted)"></span><div style="display:flex;gap:8px;align-items:baseline"><small style="color:var(--muted);font-size:13px">Soma</small><b style="font-size:17px"></b></div></div>`;
        const somaEl = corpo.querySelector('[data-rzd-soma]');
        somaEl.querySelector('b').style.fontWeight = '700';
        corpo.querySelectorAll('[data-rzd-modo]').forEach(b => b.addEventListener('click', () => { if (b.dataset.rzdModo !== modo) { converterPara(b.dataset.rzdModo); desenhar(); } }));
        corpo.querySelectorAll('[data-rzd-pct]').forEach(inp => inp.addEventListener('input', () => {
            lista[Number(inp.dataset.rzdPct)].percentual = parseFloat(String(inp.value).replace(',', '.')) || 0; atualizarSoma();
        }));
        corpo.querySelectorAll('[data-rzd-cotas]').forEach(inp => inp.addEventListener('input', () => {
            lista[Number(inp.dataset.rzdCotas)].cotas = parseFloat(String(inp.value).replace(',', '.')) || 0; recalcular(); atualizarSoma();
        }));
        corpo.querySelectorAll('[data-rzd-valor]').forEach(inp => inp.addEventListener('input', () => {
            lista[Number(inp.dataset.rzdValor)].valor = parseFloat(String(inp.value).replace(',', '.')) || 0; recalcular(); atualizarSoma();
        }));
        corpo.querySelectorAll('[data-rzd-nome]').forEach(inp => inp.addEventListener('input', () => { lista[Number(inp.dataset.rzdNome)].nome_externo = inp.value; atualizarSoma(); }));
        corpo.querySelectorAll('[data-rzd-tirar]').forEach(b => b.addEventListener('click', () => { lista.splice(Number(b.dataset.rzdTirar), 1); recalcular(); desenhar(); }));
        corpo.querySelector('[data-rzd-igual]')?.addEventListener('click', () => { // v1.3.0; nos três modos desde a v1.4.0
            const n = lista.length; if (!n) return;
            if (modo === 'cotas') lista.forEach(i => { i.cotas = 1; });
            else if (modo === 'valor') { const cada = Math.floor(base * 100 / n) / 100; lista.forEach(i => { i.valor = cada; }); lista[0].valor = r2(base - cada * (n - 1)); }
            else { const cada = Math.floor(10000 / n) / 100; lista.forEach(i => { i.percentual = cada; }); lista[0].percentual = Math.round((100 - cada * (n - 1)) * 100) / 100; }
            recalcular(); desenhar();
        });
        corpo.querySelector('[data-rzd-add]')?.addEventListener('click', async () => {
            const ja = new Set(lista.map(i => i.pessoa_id).filter(Boolean));
            const opcoes = (candidatos || []).filter(c => c.id && !ja.has(c.id)).map(c => ({ valor: c.id, titulo: c.nome, sub: c.sub || '', icone: 'user' }));
            if (permitirExterno) opcoes.push({ valor: '__externo', titulo: 'Parte externa', sub: 'Sem cadastro, só o nome', icone: 'user-round' });
            if (!opcoes.length) { rzToast('Todos já estão na divisão.', { tipo: 'info' }); return; }
            const v = await rzEscolher({ titulo: rotuloAdicionar, opcoes });
            if (!v) return;
            const falta = Math.max(0, Math.round((100 - soma()) * 100) / 100);
            const novo = v === '__externo' ? { pessoa_id: null, nome_externo: '', nome: '', percentual: falta } : { pessoa_id: v, nome_externo: null, nome: nomeCand[v] || '', percentual: falta };
            novo.cotas = 1; novo.valor = Math.max(0, r2(base - somaValor()));
            lista.push(novo);
            recalcular(); desenhar();
            if (v === '__externo') corpo.querySelector(`[data-rzd-nome="${lista.length - 1}"]`)?.focus();
        });
        const ic = g('rzIcones'); if (ic) ic();
        atualizarSoma();
    };
    recalcular();
    desenhar();
    sheet.querySelector('[data-rzd-cancelar]')?.addEventListener('click', () => fechar());
    btnSalvar.addEventListener('click', async () => {
        if (!valida()) return;
        btnSalvar.disabled = true;
        try {
            const igual = lista.length > 1 && (modo === 'cotas'
                ? lista.every(i => Number(i.cotas) === Number(lista[0].cotas))
                : lista.slice(1).every(i => Math.abs(Number(i.percentual) - Number(lista[1].percentual)) < 0.01) && Math.abs(Number(lista[0].percentual) - Number(lista[1].percentual)) < 0.05);
            const ok = typeof aoSalvar === 'function'
                ? await aoSalvar(lista.map(i => ({ pessoa_id: i.pessoa_id, nome_externo: i.pessoa_id ? null : String(i.nome_externo || '').trim(), nome: i.pessoa_id ? (nomeCand[i.pessoa_id] || i.nome) : String(i.nome_externo || '').trim(),
                                 percentual: Number(i.percentual) || 0, modo, cotas: modo === 'cotas' ? Number(i.cotas) || 0 : null, valor: modo === 'valor' ? r2(i.valor) : null })),
                                 { igual, modo })
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
