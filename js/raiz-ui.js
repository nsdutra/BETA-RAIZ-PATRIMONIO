// ============================================================================
// raiz-ui.js — Raiz Patrimônio · Diálogos sem diálogo nativo (UXR-29/30)
// Versão: 1.8.0 · 23/10/2026
//
// v1.8.0 (23/10/2026, sessão 20261023-0915-computador-c6, demanda 15146a34; PROTOTIPO_COMPUTADOR_RAIZ v1.1.0 §11, de acordo do Nicola 23/10 08:51) — C6 · escala de letras: 17 tamanhos de letra escritos em número (font-size:13px etc.) trocados pelos da escala (--fs-mini 11 · --fs-sec 12,5 · --fs-corpo 14 · --fs-titulo 17; 16 px fica, por causa do zoom do iPhone em campo, e 18 px ou mais também — herói e números grandes). Nada muda de lugar; só o tamanho passa a ser o mesmo em todas as telas.
// Versão anterior: 1.7.0 · 23/10/2026
//
// v1.7.0 (23/10/2026, sessão 20261023-0025-computador-c2, demanda 15146a34; PROTOTIPO_COMPUTADOR_RAIZ v1.0.0 §7, de acordo do
//   Nicola 22/10 10:32 e "siga em frente" 23/10 00:22) — sheets no computador (≥ 1024 px com mouse): o sheet de AÇÕES abre
//   preso ao botão que o abriu, como menu de contexto (popover de 300 px); o de formulário e os demais seguem como painel à
//   direita, com o cabeçalho único do raiz.css 1.12.0. Classificação pelo conteúdo do sheet, sem mexer no abrirSheet do
//   index: só ações (.rz-act) e nenhum campo = ações. Sem clique recente (teclado, abertura por código) fica o painel.
// Versão anterior: 1.6.1 · 20/10/2026
//
// v1.6.1 (20/10/2026, sessão 20261020-1943-calendario-rapido, demanda b3aeefaf; Nicola 19:43 "não está atualizando o tempo de
// carregamento ao passar de 45 s, apenas ao chegar nos 60 s") — rzProgressoLeitura: a barra parava no tempo típico e só
// mudava o texto em 1,5× esse tempo. Agora a barra segue andando devagar (curva que nunca chega ao fim) e o texto passa por
// três estados: dentro do tempo típico · "um pouco mais que o normal, ainda lendo" · "arquivo longo… até 2 min".
// Versão anterior: 1.6.0 · 20/10/2026
//
// v1.6.0 (20/10/2026, sessão 20261019-2331-fatura-analise, demanda c36b09b2 — de acordo do Nicola 19/10 23:50) —
// rzProgressoLeitura, NOVO: o progresso por etapas da leitura de documento (cartão do arquivo, passos com ✓, barra,
// tempo decorrido com o tempo típico, "mantenha o app aberto") vira componente único, para importar fatura e extrato
// com a mesma experiência. Desenha dentro de um elemento (sheet já aberto) ou numa camada própria por cima da tela.
// Mantém a tela acesa e avisa antes de sair enquanto lê. Também em window.rzProgressoLeitura.
//
// Versão anterior: 1.5.0 · 14/10/2026
//
// v1.5.0 (14/10/2026, sessão 20261014-2145-onda9c-textos, demanda a05ad2ee; onda 9c do estudo PROTOTIPO_UX_DENSIDADE_RAMOS_RAIZ
// v1.2.0, D6 seção 10) — textos no limite: ação até 24 caracteres, descrição até 28, aviso até 40 com o resultado e tela
// vazia em 1 frase de até 40. A explicação longa fica na confirmação, quando existe. Nada de comportamento mudou.
// --------------------------------------------------------------------------
// Versões anteriores (v1.4.0 … v1.4.0): CHANGELOG_MODULOS.md, na raiz do repositório — o
// gerar_versoes.py rola pra lá automaticamente tudo além das 5 versões
// mais recentes deste cabeçalho (VER-06).
export const VERSAO = '1.8.0'; // v-check: lido por ⚙️ › Conta › Versões — manter igual ao header

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
    el.style.cssText = `background:${cor};color:#fff;padding:8px 8px 8px 18px;border-radius:10px;box-shadow:0 8px 20px -8px rgba(0,0,0,.35);font-size:var(--fs-corpo,14px);font-weight:600;display:flex;align-items:center;gap:12px;max-width:360px;opacity:0;transform:translateY(8px);transition:opacity .2s ease,transform .2s ease;`;
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
        const texto = impacto ? `<p style="font-size:var(--fs-corpo,14px);color:var(--ink);margin:0 0 12px;line-height:1.45">${esc(impacto)}</p>` : '';
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
            .map(l => `<p style="font-size:var(--fs-corpo,14px);color:var(--ink);margin:0 0 10px;line-height:1.45">${esc(l)}</p>`).join('');
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
        if (modo === 'cotas') return `<input type="number" inputmode="decimal" step="0.5" min="0" data-rzd-cotas="${k}" value="${i.cotas ?? ''}" aria-label="Cotas" style="${est};width:64px"><span style="color:var(--muted);font-size:var(--fs-corpo,14px)">cotas</span>`;
        if (modo === 'valor') return `<span style="color:var(--muted);font-size:var(--fs-corpo,14px)">R$</span><input type="number" inputmode="decimal" step="0.01" min="0" data-rzd-valor="${k}" value="${i.valor ?? ''}" aria-label="Valor" style="${est};width:96px">`;
        return `<input type="number" inputmode="decimal" step="0.01" min="0" max="100" data-rzd-pct="${k}" value="${i.percentual || ''}" aria-label="Percentual" style="${est};width:72px"><span style="color:var(--muted);font-size:var(--fs-corpo,14px)">%</span>`;
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
        corpo.innerHTML = (nota ? `<p style="margin:0 0 10px;font-size:var(--fs-corpo,14px);color:var(--muted);line-height:1.4">${esc(nota)}</p>` : '') + seg +
            (modo === 'valor' ? `<p style="margin:0 0 8px;font-size:var(--fs-sec,12.5px);color:var(--muted)">Total do movimento: <b style="color:var(--ink)">${moeda(base)}</b></p>` : '') +
            `<div class="rz-card rz-list">${lista.map(linha).join('') || '<div class="rz-empty"><p>Ninguém na divisão ainda.</p></div>'}</div>` +
            `<button type="button" class="rz-act" data-rzd-add><div class="rz-ic"><svg data-lucide="user-plus"></svg></div><div>${esc(rotuloAdicionar)}<small>${permitirExterno ? 'Pessoa cadastrada ou parte externa' : 'Pessoa cadastrada'}</small></div></button>` +
            (igualar && lista.length > 1 ? `<button type="button" class="rz-act" data-rzd-igual><div class="rz-ic"><svg data-lucide="equal"></svg></div><div>Dividir igual entre todos<small>${lista.length} pessoas · ${pctTxt(Math.floor(10000 / lista.length) / 100)} cada</small></div></button>` : '') +
            `<div data-rzd-soma style="display:flex;justify-content:space-between;align-items:baseline;margin-top:12px;padding-top:12px;border-top:1px solid var(--line);font-size:var(--fs-corpo,14px)">` +
            `<span style="color:var(--muted)"></span><div style="display:flex;gap:8px;align-items:baseline"><small style="color:var(--muted);font-size:var(--fs-sec,12.5px)">Soma</small><b style="font-size:var(--fs-titulo,17px)"></b></div></div>`;
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

// ============================================================================
// rzProgressoLeitura — progresso por etapas de uma leitura (documento, fatura, extrato)
// passos: textos na ordem; passoIa: índice do passo em que a Raiz IA trabalha (a barra anda por tempo nele).
// Devolve { passo(i), fim() }. fim() SEMPRE precisa ser chamado (inclusive no erro): solta a trava de saída.
// ============================================================================
const CSS_PROGRESSO = `
.rz-lp-camada{position:fixed;inset:0;z-index:400;background:rgba(23,33,30,.45);display:flex;align-items:flex-end;justify-content:center}
.rz-lp-camada .rz-lp{background:var(--card,#fff);border-radius:18px 18px 0 0;width:100%;max-width:520px;padding:18px 16px calc(18px + env(safe-area-inset-bottom))}
@media (min-width:768px){.rz-lp-camada{align-items:center}.rz-lp-camada .rz-lp{border-radius:var(--r-card,14px)}}
.rz-lp h3{font-family:var(--font-title,inherit);font-size:var(--fs-titulo,17px);margin:0 0 12px}
.rz-lp .rz-lp-arq{display:flex;gap:10px;align-items:center;background:var(--tile,#e9ece5);border-radius:10px;padding:9px 11px;font-size:var(--fs-sec,12.5px);margin:0 0 14px;overflow-wrap:anywhere}
.rz-lp .rz-lp-arq small{display:block;color:var(--muted,#6f7a76)}
.rz-lp ol{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px}
.rz-lp li{display:flex;gap:10px;align-items:center;font-size:var(--fs-corpo,14px);color:var(--muted,#6f7a76)}
.rz-lp .rz-lp-bola{width:22px;height:22px;border-radius:50%;border:2px solid var(--line,#e6e3da);flex:none;display:grid;place-items:center;font-size:var(--fs-sec,12.5px)}
.rz-lp li.feito{color:var(--ink,#17211e)}
.rz-lp li.feito .rz-lp-bola{background:var(--pine);border-color:var(--pine);color:#fff}
.rz-lp li.agora{color:var(--ink,#17211e);font-weight:600}
.rz-lp li.agora .rz-lp-bola{border-color:var(--brass,#c68a3b);border-top-color:transparent;animation:rzLpGira .9s linear infinite}
.rz-lp li.ia.agora{color:var(--brass-deep,#a86f27)}
@keyframes rzLpGira{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.rz-lp li.agora .rz-lp-bola{animation:none;border-top-color:var(--brass,#c68a3b)}}
.rz-lp .rz-lp-barra{height:6px;background:var(--tile,#e9ece5);border-radius:3px;margin:16px 0 8px;overflow:hidden}
.rz-lp .rz-lp-barra i{display:block;height:100%;width:0;background:var(--brass,#c68a3b);transition:width .6s}
.rz-lp .rz-lp-tempo{font-size:var(--fs-sec,12.5px);color:var(--muted,#6f7a76)}
.rz-lp .rz-lp-aviso{margin-top:14px;background:var(--brass-bg,#fbf1e2);border-radius:10px;padding:10px 12px;font-size:var(--fs-sec,12.5px);color:var(--brass-deep,#a86f27)}
`;
function rzLpEsc(t) { return String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
function rzLpBytes(n) { n = Number(n) || 0; return n >= 1048576 ? (n / 1048576).toFixed(1).replace('.', ',') + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB'; }
export function rzProgressoLeitura({ alvo = null, titulo = 'Lendo o arquivo', arquivo = null, passos = [], passoIa = 1, tempoTipicoS = 40 } = {}) {
    if (!document.getElementById('rz-lp-css')) {
        const st = document.createElement('style'); st.id = 'rz-lp-css'; st.textContent = CSS_PROGRESSO; document.head.appendChild(st);
    }
    let camada = null, caixa = alvo;
    if (!caixa) {
        camada = document.createElement('div'); camada.className = 'rz-lp-camada'; camada.setAttribute('role', 'dialog'); camada.setAttribute('aria-modal', 'true');
        caixa = document.createElement('div'); camada.appendChild(caixa); document.body.appendChild(camada);
    }
    const inicio = Date.now(); let inicioIa = null, atual = 0, wake = null, vivo = true;
    const bloquear = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', bloquear);
    if (typeof window.rzSheetTravar === 'function' && alvo) window.rzSheetTravar(true);
    if ('wakeLock' in navigator) navigator.wakeLock.request('screen').then(w => { wake = w; if (!vivo) w.release?.(); }).catch(() => {});
    const relogio = () => {
        if (!vivo) return;
        const s = Math.round((Date.now() - inicio) / 1000);
        const t = caixa.querySelector('.rz-lp-tempo');
        if (t) t.textContent = atual === passoIa
            ? (s <= tempoTipicoS ? `${s} s · costuma levar até ${tempoTipicoS < 60 ? tempoTipicoS + ' s' : Math.round(tempoTipicoS / 60) + ' min'}`
                : s < tempoTipicoS * 2 ? `${s} s · um pouco mais que o normal, ainda lendo`
                : `${s} s · arquivo longo: ainda lendo, pode levar até 2 min`)
            : `${s} s`; // v1.6.1 — três estados, sem "parar" entre o típico e 1,5×
        const b = caixa.querySelector('.rz-lp-barra i');
        if (b) {
            const fatia = 90 / Math.max(1, passos.length - 1);
            let pct = 6 + atual * fatia;
            if (atual === passoIa && inicioIa) pct += fatia * 0.95 * (1 - Math.exp(-1.6 * ((Date.now() - inicioIa) / 1000) / tempoTipicoS)); // v1.6.1 — nunca para
            b.style.width = Math.min(97, pct) + '%';
        }
    };
    const desenhar = () => {
        caixa.innerHTML = `<div class="rz-lp" aria-busy="true" aria-live="polite">
            ${camada ? `<h3>${rzLpEsc(titulo)}</h3>` : ''}
            ${arquivo ? `<div class="rz-lp-arq"><svg data-lucide="file-text" style="width:22px;height:22px;flex:none;color:var(--pine)"></svg><div><b>${rzLpEsc(arquivo.name || arquivo.nome || 'arquivo')}</b><small>${rzLpBytes(arquivo.size ?? arquivo.tamanho)}</small></div></div>` : ''}
            <ol>${passos.map((p, k) => `<li class="${k < atual ? 'feito' : (k === atual ? 'agora' : '')}${k === passoIa ? ' ia' : ''}"><span class="rz-lp-bola">${k < atual ? '✓' : ''}</span>${rzLpEsc(p)}</li>`).join('')}</ol>
            <div class="rz-lp-barra"><i></i></div><div class="rz-lp-tempo"></div>
            <div class="rz-lp-aviso">Mantenha o app aberto até terminar.</div></div>`;
        if (typeof window.rzIcones === 'function') window.rzIcones();
        relogio();
    };
    const timer = setInterval(relogio, 1000);
    desenhar();
    return {
        passo(i) { if (!vivo) return; atual = i; if (i === passoIa && !inicioIa) inicioIa = Date.now(); desenhar(); },
        fim() {
            if (!vivo) return; vivo = false; clearInterval(timer);
            window.removeEventListener('beforeunload', bloquear);
            if (typeof window.rzSheetTravar === 'function' && alvo) window.rzSheetTravar(false);
            try { wake?.release?.(); } catch (e) { /* segue */ }
            if (camada) camada.remove(); else caixa.innerHTML = '';
        },
    };
}

// ---------------------------------------------------------------------------
// Sheets no computador (v1.7.0). O abrirSheet do index troca o className do #rz-sheet a cada abertura; aqui só se olha o
// conteúdo depois que ele entra e se põe a classe do formato. ARMADILHA: o nível 2 (#rz-sheet-2) e o menu das iniciais
// (.rz-menu-conta, posicionado pelo raiz.css) ficam de fora.
let rzUltimoAlvo = null, rzUltimoAlvoEm = 0;
const rzDeskFino = () => window.matchMedia && window.matchMedia('(min-width:1024px) and (pointer:fine)').matches;
function rzSoAcoes(sheet) {
    const b = sheet.querySelector(':scope > .rz-sh-b');
    if (!b || sheet.querySelector('input,select,textarea,.rz-sh-f') || !b.querySelector('.rz-act')) return false;
    return [...b.children].every(c => c.matches('.rz-act, .rz-group') || (c.matches('.rz-card.rz-list') && [...c.children].every(x => x.matches('.rz-act'))));
}
// ARMADILHA: o observador também vê a classe que esta função põe no véu; ela só mexe quando o estado muda (senão, laço).
function rzFormatoSheet() {
    const veil = document.getElementById('rz-veil'), sheet = document.getElementById('rz-sheet');
    if (!veil || !sheet) return;
    const alvo = rzUltimoAlvo && document.contains(rzUltimoAlvo) && (Date.now() - rzUltimoAlvoEm) < 1500 ? rzUltimoAlvo : null;
    const pop = veil.classList.contains('rz-on') && rzDeskFino() && !sheet.classList.contains('rz-menu-conta') && !!alvo && rzSoAcoes(sheet);
    if (!pop) { if (veil.classList.contains('rz-dk-pop-veil')) veil.classList.remove('rz-dk-pop-veil'); return; }
    if (sheet.classList.contains('rz-dk-pop') && veil.classList.contains('rz-dk-pop-veil')) return; // já posicionado
    const r = alvo.getBoundingClientRect(), L = 300, M = 8;
    const x = Math.max(M, Math.min(window.innerWidth - L - M, r.right - L));
    veil.style.setProperty('--rz-pop-x', x + 'px');
    veil.style.setProperty('--rz-pop-y', (r.bottom + 6) + 'px');
    sheet.classList.add('rz-dk-pop');
    veil.classList.add('rz-dk-pop-veil');
    const h = sheet.offsetHeight; // medido já no formato de popover (altura do conteúdo)
    if (r.bottom + 6 + h > window.innerHeight - M) veil.style.setProperty('--rz-pop-y', Math.max(M, r.top - 6 - h) + 'px'); // não cabe embaixo: abre em cima
}
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    document.addEventListener('pointerdown', ev => {
        const a = ev.target && ev.target.closest ? ev.target.closest('button,[role="button"],a,.rz-row') : null;
        if (a && !a.closest('#rz-veil')) { rzUltimoAlvo = a; rzUltimoAlvoEm = Date.now(); }
    }, true);
    let rzObsSheet = null;
    const ligar = () => {
        const veil = document.getElementById('rz-veil'), sheet = document.getElementById('rz-sheet');
        if (!veil || !sheet || rzObsSheet) return !!rzObsSheet;
        rzObsSheet = new MutationObserver(() => rzFormatoSheet());
        rzObsSheet.observe(sheet, { childList: true });
        rzObsSheet.observe(veil, { attributes: true, attributeFilter: ['class'] });
        rzFormatoSheet();
        return true;
    };
    if (!ligar()) { // o véu nasce no primeiro sheet
        const obs = new MutationObserver(() => { if (ligar()) obs.disconnect(); });
        obs.observe(document.body, { childList: true });
    }
}

if (typeof window !== 'undefined') {
    window.rzProgressoLeitura = rzProgressoLeitura;
    window.rzEditarDivisao = rzEditarDivisao;
    window.rzToast = rzToast;
    window.rzConfirmar = rzConfirmar;
    window.rzEscolher = rzEscolher;
    window.rzAviso = rzAviso;
}
