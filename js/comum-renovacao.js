// ============================================================================
// comum-renovacao.js — Raiz Patrimônio · Renovação e ampliação de plano por Pix
// Versão: 1.3.4 · 07/10/2026
//
// v1.3.4 (07/10/2026, sessão 20261007-1721-rolo-changelog, demanda 2507d554 — VER-05, "de acordo" do Nicola 07/10 17:21) — SÓ
// CABEÇALHO: as versões além das 5 mais recentes rolaram para o CHANGELOG_MODULOS.md.
// Nenhuma linha de código mudou — conferido token a token contra o publicado.
//
// Versão anterior: 1.3.3 · 03/10/2026
//
// v1.3.3 (F0.3, demanda 29bed5eb, sessão 20261003-1707-ux-base, "de acordo" do Nicola 03/10 23:57) — nome único da IA: "Enviar pela Raiz IA" / "no WhatsApp da Raiz IA" e
// saudação nova da mensagem do comprovante (o bot não depende do nome no texto).
//
// Versão anterior: 1.3.2 · 02/10/2026
//
// v1.3.2 — pedido do Nicola (02/10 01:31): a cópia do comprovante no Cofre da
// empresa fica vinculada ao PAGAMENTO da licença (vínculo 'pagamento', id do
// item — a origem da despesa), não à empresa; é por esse vínculo que a despesa
// mostra "Ver comprovante". Versão anterior: 1.3.1.
//
// v1.3.1 — pedido do Nicola no teste da F11 (02/10 01:07): a tela depois do
// "Já paguei" deixa de falar em conferência do Pix e em plano que volta (o
// público não é de calote; se não pagar, a Raiz entra em contato). No lugar,
// um resumo da licença: vigência atual × nova vigência (expira_anterior vem
// do banco). A cópia do comprovante no Cofre da empresa já nasce vinculada à
// empresa (não vira "documento sem vínculo").
//
// Versão anterior: 1.3.0 · 01/10/2026
//
// v1.3.0 — FICHA F11 (demanda 45bb4875, aprovada pelo Nicola em 01/10 17:46):
// depois do "Já paguei" a tela diz se o plano JÁ ESTÁ LIBERADO (o banco libera
// na hora o período inteiro, com trava: recusa nos últimos 30 dias ou outra
// liberação ainda não conferida) ou se aguarda a Raiz. Dali: "Enviar
// comprovante" (foto ou PDF; o arquivo vai SÓ para o Cofre da Raiz Patrimônio,
// pasta comprovantes-pix — fn_licenca_comprovante_anexar), com a opção marcada
// pelo usuário de guardar também uma cópia no Cofre da própria empresa
// (cofre-api, mesmo caminho de "Enviar documento"); e "Enviar pelo R.AI.Z"
// (ícone bot, abre o WhatsApp do R.AI.Z com o código da cobrança) — este só
// aparece quando o R.AI.Z publicado já sabe receber comprovante (canal_raiz,
// devolvido pelo banco). Ao fechar, a aba de Licença e as cotas recarregam.
// --------------------------------------------------------------------------
// Versões anteriores (v1.0.0 … v1.2.0): CHANGELOG_MODULOS.md, na raiz do repositório — o
// gerar_versoes.py rola pra lá automaticamente tudo além das 5 versões
// mais recentes deste cabeçalho (VER-05).

export const VERSAO = '1.3.4'; // v-check (30/09/2026): lido por Dev › Versões — manter igual ao header

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
    if (c?.status === 'informado') return telaInformado({ dbAuth, clienteId, toast, c, plano: oferta.plano_nome });

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
                '<p class="text-xs" style="color:var(--muted);margin-top:10px">Pague no app do seu banco e toque em <b>Já paguei</b>. O plano é liberado na hora.</p>';
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
            telaInformado({ dbAuth, clienteId, toast, c: { ...c, ...data }, plano: oferta.plano_nome, pronto: true });
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

const NUMERO_RAIZ_BOT = '5511978950609'; // mesmo número de abrirBotWhatsapp() no index

function recarregarDepois() {
    try { if (typeof window.rzRecarregarLicenca === 'function') window.rzRecarregarLicenca(); } catch (_) {}
}

async function telaInformado({ dbAuth, clienteId, toast, c, plano, pronto = false }) {
    let s = c;
    if (!pronto) {
        try {
            const { data, error } = await dbAuth.rpc('fn_licenca_pagamento_informar', { p_item_id: c.item_id });
            if (!error && data) s = { ...c, ...data };
        } catch (_) { /* segue com o que tem */ }
    }
    const ate = s.expira_em ? new Date(s.expira_em).toLocaleDateString('pt-BR') : '';
    let topo;
    if (s.status === 'confirmado') {
        topo = `<p>${window.renderStatus('ok', 'Pagamento confirmado')}</p><p class="text-sm">Pix localizado. Seu plano${plano ? ' ' + esc(plano) : ''} está valendo${ate ? ' até <b>' + ate + '</b>' : ''}.</p>`;
    } else if (s.liberado) {
        const antes = s.expira_anterior ? new Date(s.expira_anterior).toLocaleDateString('pt-BR') : '';
        topo = `<p>${window.renderStatus('ok', 'Plano liberado')}</p><p class="text-sm">Seu plano${plano ? ' ' + esc(plano) : ''} já está valendo.</p>` +
            (ate ? `<div class="rz-kv" style="text-align:left;margin-top:8px">${antes ? `<div><small>Vigência anterior</small><b>até ${antes}</b></div>` : ''}<div><small>Nova vigência</small><b style="color:var(--success)">até ${ate}</b></div></div>` : '');
    } else {
        topo = `<p>${window.renderStatus('run', 'Aguardando a Raiz')}</p><p class="text-sm">Recebemos o seu aviso. A Raiz libera o plano em até 1 dia útil e você será avisado no app.</p>`;
    }
    const linhaComprovante = s.comprovante
        ? `<div class="rz-row"><div class="rz-ic"><svg data-lucide="file-check-2"></svg></div><div class="rz-tx"><b>Comprovante recebido</b><span>Obrigado! Ele ajuda a Raiz a conferir mais rápido</span></div></div>`
        : `<div class="rz-row rz-link" id="rnv-up"><div class="rz-ic"><svg data-lucide="upload"></svg></div><div class="rz-tx"><b>Enviar comprovante</b><span>Foto ou PDF do Pix</span></div><svg data-lucide="chevron-right" class="rz-chev"></svg></div>`;
    const linhaRaiz = (!s.comprovante && s.canal_raiz)
        ? `<div class="rz-row rz-link" id="rnv-raiz"><div class="rz-ic"><svg data-lucide="bot"></svg></div><div class="rz-tx"><b>Enviar pela Raiz IA</b><span>Mande o comprovante no WhatsApp da Raiz IA</span></div><svg data-lucide="chevron-right" class="rz-chev"></svg></div>` : '';
    const copia = s.comprovante ? '' :
        `<label class="text-xs" style="display:flex;gap:8px;align-items:flex-start;color:var(--muted);margin:2px 0 0"><input type="checkbox" id="rnv-copia" style="margin-top:2px"> Guardar também uma cópia no Cofre da minha empresa</label>`;

    window.abrirSheetForm({
        titulo: s.status === 'confirmado' ? 'Pagamento confirmado' : 'Pagamento informado',
        sub: [s.valor != null ? brl(s.valor) : '', s.txid || ''].filter(Boolean).join(' · '),
        semRodape: true,
        aoFechar: recarregarDepois,
        corpo: (el) => {
            el.innerHTML = `<div class="rz-empty" style="padding-bottom:8px"><svg data-lucide="${s.liberado || s.status === 'confirmado' ? 'badge-check' : 'clock'}"></svg>${topo}</div>` +
                `<div class="rz-card rz-list">${linhaComprovante}${linhaRaiz}</div>${copia}` +
                '<input type="file" id="rnv-arq" class="hidden" accept="image/*,application/pdf">';
            const inp = el.querySelector('#rnv-arq');
            el.querySelector('#rnv-up')?.addEventListener('click', () => inp?.click());
            inp?.addEventListener('change', async () => {
                const f = inp.files && inp.files[0];
                if (!f) return;
                const guardarCopia = !!el.querySelector('#rnv-copia')?.checked;
                await enviarComprovante({ dbAuth, clienteId, toast, item: s, arquivo: f, guardarCopia });
                telaInformado({ dbAuth, clienteId, toast, c: s, plano });
            });
            el.querySelector('#rnv-raiz')?.addEventListener('click', () => {
                const txt = encodeURIComponent(`Olá, Raiz IA! Vou enviar o comprovante do Pix do meu plano Raiz (cobrança ${s.txid || ''}).`);
                window.open(`https://wa.me/${NUMERO_RAIZ_BOT}?text=${txt}`, '_blank', 'noopener');
            });
        },
    });
}

const limparNome = (n) => String(n || 'comprovante').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80);

async function enviarComprovante({ dbAuth, clienteId, toast, item, arquivo, guardarCopia }) {
    if (arquivo.size > 10 * 1024 * 1024) { toast('Arquivo grande demais (máximo 10 MB).'); return; }
    const api = await import('./cofre-api.js');
    const mime = api.mimeDoArquivo(arquivo);
    try {
        const { data: rec, error: e1 } = await dbAuth.rpc('fn_recebedor_plataforma_id');
        if (e1 || !rec) throw e1 || new Error('Recebimento da Raiz não configurado.');
        const caminho = `${rec}/comprovantes-pix/${clienteId}/${Date.now()}-${limparNome(arquivo.name)}`;
        await api.uploadArquivoDocumento(caminho, arquivo);
        const { error: e2 } = await dbAuth.rpc('fn_licenca_comprovante_anexar', {
            p_item_id: item.item_id, p_storage_path: caminho, p_nome: arquivo.name || 'comprovante',
            p_mime: mime, p_tamanho: arquivo.size || null, p_canal: 'app',
        });
        if (e2) throw e2;
        toast('Comprovante enviado', 'success');
    } catch (e) {
        console.warn('[comum-renovacao] comprovante:', e?.message);
        toast(e?.message || 'Não foi possível enviar o comprovante.');
        return;
    }
    // cópia na empresa só quando o usuário marcou (F11 O2)
    if (guardarCopia) {
        try {
            const docId = crypto.randomUUID();
            const caminho = api.montarStoragePath(clienteId, docId, arquivo.name || 'comprovante');
            await api.uploadArquivoDocumento(caminho, arquivo);
            await api.inserirDocumento({
                id: docId, cliente_id: clienteId, nome_original: arquivo.name || 'comprovante',
                nome_exibicao: `Comprovante Pix — plano Raiz ${item.txid || ''}`.trim(), storage_path: caminho,
                mime_type: mime, tamanho_bytes: arquivo.size || null, origem: 'app', data_documento: new Date().toISOString().slice(0, 10),
                descricao: 'Comprovante do pagamento do plano Raiz Patrimônio.',
            });
            await api.inserirVinculo(clienteId, docId, 'pagamento', item.item_id, true, null);
            toast('Cópia guardada no Cofre da empresa', 'success');
        } catch (e) {
            console.warn('[comum-renovacao] cópia no Cofre:', e?.message);
            toast('O comprovante foi enviado à Raiz, mas não deu para guardar a cópia no seu Cofre.');
        }
    }
}
