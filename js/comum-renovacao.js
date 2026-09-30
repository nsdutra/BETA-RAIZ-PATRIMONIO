// ============================================================================
// comum-renovacao.js — Raiz Patrimônio · Renovação e ampliação de plano por Pix
// Versão: 1.0.0 · 30/09/2026
//
// v1.0.0 — CRIAÇÃO (demanda 1899fe67, ficha F10 v1.0.0, frente 1).
// Tela em Sheet (única superfície modal — REGRAS §2) que:
//   1. lista as ofertas de fn_ofertas_renovacao (renovação do plano atual,
//      plano ampliado sugerido e upgrades), com nome e preço;
//   2. ao escolher, chama fn_licenca_cobranca_criar — o VALOR e o BR CODE
//      vêm do banco, nunca do navegador — e mostra QR + "Pix copia e cola",
//      o código da cobrança (txid) e o crédito pró-rata quando houver;
//   3. "Já paguei" chama fn_licenca_pagamento_informar; a confirmação é do
//      Gestão (fn_gestao_pagamento_confirmar).
// Se a cobrança anterior foi recusada, o motivo aparece em destaque.
// Sem tabela, coluna ou função nova: consome só o que a F10 criou.
// O QR é desenhado por qrcode-generator 1.4.4 (MIT), carregado sob demanda do
// jsdelivr (mesma origem já usada pelo app); se não carregar, o "copia e cola"
// continua funcionando sozinho.
// ============================================================================

export const VERSAO = '1.0.0'; // v-check (30/09/2026): lido por Dev › Versões — manter igual ao header

const QR_URL = 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.js';
let _qrPromessa = null;

const brl = (n) => Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const esc = (v) => (window.rzEsc ? window.rzEsc(v) : String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])));

function carregarQr() {
    if (typeof window.qrcode === 'function') return Promise.resolve(window.qrcode);
    if (_qrPromessa) return _qrPromessa;
    _qrPromessa = new Promise((resolve) => {
        const s = document.createElement('script');
        s.src = QR_URL;
        s.onload = () => resolve(typeof window.qrcode === 'function' ? window.qrcode : null);
        s.onerror = () => { _qrPromessa = null; resolve(null); };
        document.head.appendChild(s);
    });
    return _qrPromessa;
}

// SVG do QR (módulos escuros num único <path>); quiet zone de 4 módulos.
async function qrSvg(texto) {
    const qr = await carregarQr();
    if (!qr) return '';
    try {
        const q = qr(0, 'M');
        q.addData(texto);
        q.make();
        const n = q.getModuleCount(), m = 4, tam = n + m * 2;
        let d = '';
        for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c + m} ${r + m}h1v1h-1z`;
        return `<svg viewBox="0 0 ${tam} ${tam}" width="100%" height="100%" role="img" aria-label="QR Code Pix" shape-rendering="crispEdges"><rect width="${tam}" height="${tam}" fill="#fff"/><path d="${d}" fill="#000"/></svg>`;
    } catch (e) {
        console.warn('[comum-renovacao] QR:', e.message);
        return '';
    }
}

// Reutilizado pelo aviso de limite (comunicacoes-app): mesma fonte, mesma ordem.
export async function buscarOfertas(dbAuth, clienteId) {
    const { data, error } = await dbAuth.rpc('fn_ofertas_renovacao', { p_cliente_id: clienteId });
    if (error) throw error;
    return (data || []).slice().sort((a, b) =>
        (b.eh_renovacao - a.eh_renovacao) || (b.eh_ampliado_sugerido - a.eh_ampliado_sugerido) || (a.preco - b.preco));
}

export const rotuloPeriodo = (p) => (p === 'anual' ? 'anual' : 'mensal');

function linhaOferta(o, i) {
    const tag = o.eh_renovacao ? window.renderStatus('run', 'Renovação')
        : o.eh_ampliado_sugerido ? window.renderStatus('ok', 'Sugerido') : '';
    return `<div class="rz-row rz-link" data-i="${i}"><div class="rz-tx"><b>${esc(o.nome_oferta || o.plano_nome)}</b>` +
        `<span>${esc(o.plano_nome)} · ${rotuloPeriodo(o.periodo)}</span></div>` +
        `<div class="rz-rt"><b>${brl(o.preco)}</b>${tag ? `<br>${tag}` : ''}</div></div>`;
}

export async function abrirRenovacao({ dbAuth, clienteId, toast, planoPreferido = null } = {}) {
    if (!window.abrirSheetForm || !dbAuth || !clienteId) return;
    const aviso = (m, t = 'danger') => (typeof toast === 'function' ? toast(m, t) : console.warn(m));

    window.abrirSheetForm({ titulo: 'Renovar ou ampliar o plano', sub: 'Pagamento por Pix', corpo: '<p class="text-xs text-slate-500 py-6 text-center">Carregando ofertas...</p>', semRodape: true });
    let ofertas = [];
    try {
        ofertas = await buscarOfertas(dbAuth, clienteId);
    } catch (e) {
        console.warn('[comum-renovacao] ofertas:', e.message);
        return telaVazia('Não foi possível carregar as ofertas agora. Tente de novo em instantes.');
    }
    if (planoPreferido) {
        const ix = ofertas.findIndex((o) => o.plano_codigo === planoPreferido);
        if (ix > 0) ofertas.unshift(ofertas.splice(ix, 1)[0]);
    }
    if (!ofertas.length) return telaVazia('Não há ofertas disponíveis para o seu plano no momento. Fale com a Raiz.');

    const atual = ofertas[0].plano_atual || '';
    window.abrirSheetForm({
        titulo: 'Renovar ou ampliar o plano',
        sub: atual ? `Plano atual: ${atual}` : 'Pagamento por Pix',
        semRodape: true,
        corpo: (el) => {
            el.innerHTML = `<div class="rz-card rz-list">${ofertas.map(linhaOferta).join('')}</div>` +
                '<p class="text-xs" style="color:var(--muted)">O valor é calculado pela Raiz. Ao trocar de plano, o que você ainda não usou do plano atual entra como crédito.</p>';
            el.querySelectorAll('.rz-row[data-i]').forEach((row) =>
                row.addEventListener('click', () => telaCobranca({ dbAuth, clienteId, oferta: ofertas[Number(row.dataset.i)], toast: aviso })));
        },
    });
}

function telaVazia(msg) {
    window.abrirSheetForm({
        titulo: 'Renovar ou ampliar o plano', semRodape: true,
        corpo: `<div class="rz-empty"><svg data-lucide="info"></svg><p>${esc(msg)}</p></div>`,
    });
}

async function telaCobranca({ dbAuth, clienteId, oferta, toast }) {
    let c;
    try {
        const { data, error } = await dbAuth.rpc('fn_licenca_cobranca_criar', { p_cliente_id: clienteId, p_plano: oferta.plano_codigo, p_periodo: oferta.periodo });
        if (error) throw error;
        c = data;
    } catch (e) {
        return toast(e?.message || 'Não foi possível gerar a cobrança.');
    }
    if (c?.status === 'informado') return telaInformado(c);

    const svgQr = c.brcode ? await qrSvg(c.brcode) : '';
    const recusa = c.aviso_recusa
        ? `<div class="rz-card" style="border-left:4px solid var(--danger)"><b style="color:var(--danger)">Pagamento anterior não confirmado</b><p class="text-sm" style="margin-top:4px">${esc(c.aviso_recusa)}</p></div>` : '';
    const credito = Number(c.credito) > 0 ? `<div><small>Crédito do plano atual</small><b>− ${brl(c.credito)}</b></div>` : '';

    window.abrirSheetForm({
        titulo: oferta.nome_oferta || oferta.plano_nome,
        sub: `${brl(c.valor)} · ${rotuloPeriodo(c.periodo || oferta.periodo)}`,
        rotuloSalvar: 'Já paguei',
        rotuloCancelar: 'Fechar',
        corpo: (el) => {
            el.innerHTML = recusa +
                (svgQr ? `<div style="width:220px;height:220px;margin:4px auto 10px;background:var(--card);border:1px solid var(--line);border-radius:var(--r-card);padding:6px">${svgQr}</div>` : '') +
                `<div class="rz-kv"><div><small>Valor a pagar</small><b>${brl(c.valor)}</b></div><div><small>Código da cobrança</small><b>${esc(c.txid)}</b></div>${credito}` +
                `<div class="rz-full"><small>Pix copia e cola</small><b id="rnv-code" style="font-size:12px;font-weight:500;user-select:all">${esc(c.brcode || '')}</b></div></div>` +
                '<div style="margin-top:10px"><button type="button" class="rz-btn rz-btn-2 rz-wide" id="rnv-copiar"><svg data-lucide="copy"></svg>Copiar código Pix</button></div>' +
                '<p class="text-xs" style="color:var(--muted);margin-top:10px">Pague no app do seu banco e toque em <b>Já paguei</b>. A Raiz confere o recebimento e libera o plano; você será avisado.</p>';
            el.querySelector('#rnv-copiar')?.addEventListener('click', async () => {
                const code = c.brcode || '';
                try { await navigator.clipboard.writeText(code); toast('Código Pix copiado', 'success'); }
                catch (_) {
                    const r = document.createRange(); r.selectNodeContents(el.querySelector('#rnv-code'));
                    const s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
                    toast('Selecione e copie o código', 'success');
                }
            });
        },
        aoSalvar: async () => {
            const { data, error } = await dbAuth.rpc('fn_licenca_pagamento_informar', { p_item_id: c.item_id });
            if (error) throw error;
            telaInformado({ ...c, ...data });
            return false; // mantém o Sheet aberto na tela de "informado"
        },
    });
}

function telaInformado(c) {
    window.abrirSheetForm({
        titulo: 'Pagamento informado', sub: c.valor != null ? brl(c.valor) : '', semRodape: true,
        corpo: `<div class="rz-empty"><svg data-lucide="clock"></svg><p>${window.renderStatus('run', 'Aguardando confirmação')}</p>` +
            '<p class="text-sm">Recebemos o seu aviso. A Raiz confere o Pix e libera o plano em até 1 dia útil. Você será avisado no app.</p></div>',
    });
}
