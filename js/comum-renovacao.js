// ============================================================================
// comum-renovacao.js — Raiz Patrimônio · Renovação e ampliação de plano por Pix
// Versão: 1.2.0 · 01/10/2026
//
// v1.2.0 — AJUSTES DO TESTE DO NICOLA (01/10, 13:32), só apresentação:
// (1) cada opção ganha "Escolher ›" à direita; (2) linhas mais baixas: o anual
// mostra "cheio riscado + preço" numa linha e a economia em texto verde curto
// (sai a pílula), sub "12 meses, à vista" (o "pagamento à vista" cortava);
// (3) nome do plano alinhado à esquerda com as linhas Mensal/Anual;
// (4) aviso único no topo: quando vence (ou venceu) o plano atual, crédito do
// que não foi usado na troca, valor final calculado ao escolher, "por enquanto
// só Pix" — sai o rodapé; (5) na tela do Pix, "Voltar aos planos" no lugar de
// "Fechar" (volta à lista, não à Licença); (6) subtítulo com o nome comercial.
//
// Versão anterior: 1.1.0 · 30/09/2026
//
// v1.1.0 — AJUSTES DO TESTE DO NICOLA (30/09, 20:37): (1) texto curto no topo
// explicando o que muda entre os planos; (2) ofertas agrupadas por plano, com
// a capacidade de cada um (ativos, contratos, pessoas, itens de controle,
// perguntas à IA por mês, espaço no Cofre) lida de plano_funcionalidade —
// nada escrito à mão, segue o que o banco diz; (3) nos anuais, preço cheio
// (12 × o mensal do mesmo plano) riscado, preço à vista e "Economize R$ X (Y%)".
// Só apresentação: valor e BR Code continuam vindo do banco (fn_licenca_cobranca_criar).
//
// Versão anterior: 1.0.0 · 30/09/2026
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

export const VERSAO = '1.2.0'; // v-check (30/09/2026): lido por Dev › Versões — manter igual ao header

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

const ROTULO_CAPACIDADE = {
    'Novo ativo': ['ativos', 1], 'Novo contrato': ['contratos', 2], 'Nova pessoa': ['pessoas', 3],
    'Novo item de controle': ['itens de controle', 4], 'Perguntar à Raiz IA': ['perguntas à Raiz IA por mês', 5],
    'Espaço no Cofre': ['no Cofre', 6],
};

// Capacidade de cada plano, direto do catálogo (leitura liberada a quem está logado).
async function buscarCapacidades(dbAuth, codigos) {
    const out = {};
    try {
        const [pf, fn] = await Promise.all([
            dbAuth.from('plano_funcionalidade').select('plano_codigo,funcionalidade_codigo,limite').in('plano_codigo', codigos).gt('limite', 0),
            dbAuth.from('funcionalidades').select('codigo,nome_comercial'),
        ]);
        const nome = Object.fromEntries((fn.data || []).map((f) => [f.codigo, f.nome_comercial]));
        (pf.data || []).forEach((r) => {
            const def = ROTULO_CAPACIDADE[nome[r.funcionalidade_codigo]];
            if (!def) return;
            const n = Number(r.limite);
            const txt = def[0] === 'no Cofre' ? `${(n / 1024).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} GB no Cofre` : `${n} ${def[0]}`;
            (out[r.plano_codigo] = out[r.plano_codigo] || []).push([def[1], txt]);
        });
        Object.keys(out).forEach((k) => { out[k] = out[k].sort((a, b) => a[0] - b[0]).map((x) => x[1]).join(' · '); });
    } catch (e) { console.warn('[comum-renovacao] capacidades:', e.message); }
    return out;
}

const rotuloOferta = (o) => {
    const p = String(o.nome_oferta || '').split(' — ');
    const r = (p.length > 1 ? p.slice(1).join(' — ') : rotuloPeriodo(o.periodo)).trim();
    return r.charAt(0).toUpperCase() + r.slice(1);
};

// Cheio do anual = 12 × maior mensal do mesmo plano; só aparece quando de fato há economia.
function economiaAnual(o, ofertas) {
    if (o.periodo !== 'anual') return null;
    const mensais = ofertas.filter((x) => x.plano_codigo === o.plano_codigo && x.periodo === 'mensal').map((x) => Number(x.preco));
    if (!mensais.length) return null;
    const cheio = Math.max(...mensais) * 12;
    const preco = Number(o.preco);
    if (!(cheio > preco)) return null;
    return { cheio, eco: cheio - preco, pct: Math.round(((cheio - preco) / cheio) * 100) };
}

function linhaOferta(o, i, ofertas) {
    const e = economiaAnual(o, ofertas);
    const precoHtml = e
        ? `<span style="white-space:nowrap"><s style="color:var(--muted);font-size:12px;font-weight:500">${brl(e.cheio)}</s> <b>${brl(o.preco)}</b></span>` +
          `<small style="color:var(--success);font-size:11.5px;font-weight:600;white-space:nowrap">Economize ${brl(e.eco)} (${e.pct}%)</small>`
        : `<b>${brl(o.preco)}</b>`;
    return `<div class="rz-row rz-link" data-i="${i}" style="padding:9px 0;gap:8px"><div class="rz-tx"><b>${esc(rotuloOferta(o))}</b>` +
        `<span>${o.periodo === 'anual' ? '12 meses, à vista' : 'todo mês'}</span></div>` +
        `<div class="rz-rt" style="gap:1px">${precoHtml}</div>` +
        `<span style="display:flex;align-items:center;color:var(--pine);font-size:12px;font-weight:600;flex:none">Escolher<svg data-lucide="chevron-right" style="width:16px;height:16px"></svg></span></div>`;
}

function blocoPlano(grupo, caps) {
    const o = grupo[0].o;
    const tag = grupo.some((g) => g.o.eh_renovacao) ? window.renderStatus('run', 'Seu plano')
        : o.eh_ampliado_sugerido ? window.renderStatus('ok', 'Sugerido') : '';
    return `<div class="rz-card rz-list"><div style="padding:10px 0 2px"><div style="display:flex;justify-content:space-between;gap:8px;align-items:center"><b style="font-size:15px">${esc(o.plano_nome)}</b>${tag}</div>` +
        (caps[o.plano_codigo] ? `<p class="text-xs" style="color:var(--muted);margin:2px 0 0">Até ${esc(caps[o.plano_codigo])}</p>` : '') + '</div>' +
        grupo.map((g) => linhaOferta(g.o, g.i, g.todas)).join('') + '</div>';
}

// Vigência do plano atual (módulo imoveis), para o aviso do topo.
async function buscarVigencia(dbAuth, clienteId) {
    try {
        const { data } = await dbAuth.from('licencas').select('status,data_expiracao').eq('cliente_id', clienteId).eq('modulo', 'imoveis').maybeSingle();
        return data || null;
    } catch (e) { console.warn('[comum-renovacao] vigência:', e.message); return null; }
}

function avisoTopo(vig, nomeAtual) {
    let venc = '';
    if (vig?.data_expiracao) {
        const fim = new Date(vig.data_expiracao);
        const dias = Math.ceil((fim - new Date()) / 86400000);
        const data = fim.toLocaleDateString('pt-BR');
        venc = dias >= 0
            ? `Seu plano${nomeAtual ? ' ' + esc(nomeAtual) : ''} vence em <b>${data}</b> (${dias === 0 ? 'hoje' : dias === 1 ? 'amanhã' : `em ${dias} dias`}). Renovando antes, você não perde os dias que faltam.`
            : `Seu plano${nomeAtual ? ' ' + esc(nomeAtual) : ''} <b style="color:var(--danger)">venceu em ${data}</b>.`;
    }
    return '<div class="rz-card" style="border-left:4px solid var(--info)">' +
        (venc ? `<p class="text-sm" style="margin:0 0 6px">${venc}</p>` : '') +
        '<p class="text-xs" style="color:var(--muted);margin:0 0 4px">Os planos mudam na capacidade: ativos, contratos, pessoas, itens de controle, perguntas à Raiz IA por mês e espaço no Cofre. O Ampliado é o mesmo plano com mais capacidade, e o anual sai mais barato que 12 meses no mensal.</p>' +
        '<p class="text-xs" style="color:var(--muted);margin:0 0 4px">Ao trocar de plano, o que você ainda não usou do atual entra como crédito. O valor final é calculado quando você escolhe a opção.</p>' +
        '<p class="text-xs" style="margin:0"><b>Por enquanto, aceitamos pagamento só por Pix.</b></p></div>';
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
    const nomeAtual = (ofertas.find((o) => o.eh_renovacao) || {}).plano_nome || atual;
    const [caps, vig] = await Promise.all([
        buscarCapacidades(dbAuth, [...new Set(ofertas.map((o) => o.plano_codigo))]),
        buscarVigencia(dbAuth, clienteId),
    ]);
    const voltar = () => abrirRenovacao({ dbAuth, clienteId, toast, planoPreferido });
    const grupos = [];
    ofertas.forEach((o, i) => {
        let g = grupos.find((x) => x[0].o.plano_codigo === o.plano_codigo);
        if (!g) { g = []; grupos.push(g); }
        g.push({ o, i, todas: ofertas });
    });
    window.abrirSheetForm({
        titulo: 'Renovar ou ampliar o plano',
        sub: nomeAtual ? `Plano atual: ${nomeAtual}` : 'Pagamento por Pix',
        semRodape: true,
        corpo: (el) => {
            el.innerHTML = avisoTopo(vig, nomeAtual) + grupos.map((g) => blocoPlano(g, caps)).join('');
            el.querySelectorAll('.rz-row[data-i]').forEach((row) =>
                row.addEventListener('click', () => telaCobranca({ dbAuth, clienteId, oferta: ofertas[Number(row.dataset.i)], toast: aviso, voltar })));
        },
    });
}

function telaVazia(msg) {
    window.abrirSheetForm({
        titulo: 'Renovar ou ampliar o plano', semRodape: true,
        corpo: `<div class="rz-empty"><svg data-lucide="info"></svg><p>${esc(msg)}</p></div>`,
    });
}

async function telaCobranca({ dbAuth, clienteId, oferta, toast, voltar }) {
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

    const sheet = window.abrirSheetForm({
        titulo: oferta.nome_oferta || oferta.plano_nome,
        sub: `${brl(c.valor)} · ${rotuloPeriodo(c.periodo || oferta.periodo)}`,
        rotuloSalvar: 'Já paguei',
        rotuloCancelar: 'Voltar aos planos',
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
    // v1.2.0 — o botão secundário volta à lista de planos (o X continua fechando tudo).
    const btnVoltar = sheet?.querySelector('.rz-sh-f .rz-btn-2');
    if (btnVoltar && typeof voltar === 'function') {
        btnVoltar.removeAttribute('onclick');
        btnVoltar.addEventListener('click', (ev) => { ev.preventDefault(); voltar(); });
    }
}

function telaInformado(c) {
    window.abrirSheetForm({
        titulo: 'Pagamento informado', sub: c.valor != null ? brl(c.valor) : '', semRodape: true,
        corpo: `<div class="rz-empty"><svg data-lucide="clock"></svg><p>${window.renderStatus('run', 'Aguardando confirmação')}</p>` +
            '<p class="text-sm">Recebemos o seu aviso. A Raiz confere o Pix e libera o plano em até 1 dia útil. Você será avisado no app.</p></div>',
    });
}
