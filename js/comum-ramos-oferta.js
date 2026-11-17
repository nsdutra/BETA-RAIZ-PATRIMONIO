// ============================================================================
// comum-ramos-oferta.js — Raiz Patrimônio · Lente de ramos, "Conheça novos ramos" e as 3 ofertas
// Versão: 1.1.0 · 17/11/2026
//
// v1.1.0 (17/11/2026, sessão 20261117-0830-upsell-ramos-ajustes, demanda dd9c5527; teste do Nicola 17/11 08:22/08:28,
// "Pode seguir") — card 1 mostra, pequeno, o valor do plano hoje e o vencimento; "Agora" diz até que dia é o proporcional
// (mesma conta da cobrança: fn_ramos_ofertas v2). Cards de subida mostram o vencimento do plano atual, o crédito a descontar
// até lá e o valor a pagar agora. Textos: Agro para qualquer lavoura; Pecuária com corte, leite e laticínios. Ramos chegam
// em ordem de preço (Agro junto de Pecuária).
// Versão anterior: 1.0.0 · 17/11/2026
//
// v1.0.0 (17/11/2026, sessão 20261116-2358-upsell-ramos, demanda dd9c5527; PROTOTIPO_RAMOS_OFERTAS_RAIZ v1.3.1 aprovado
// pelo Nicola 16/11 23:42; PLANO_EXECUCAO_UPSELL_RAMOS_RAIZ v1.1.0, de acordo 16/11 23:58) — primeira versão.
//   • abrirLente: a lente de ramos saiu do index.html para cá (mesmo comportamento) e ganhou, no fim, a linha apagada
//     "🔒 Conheça novos ramos" com os ícones dos ramos que a empresa ainda não tem.
//   • Carrossel: um cartão por ramo (ícone e cor do ramo, frase, 3 pontos e preço por mês); marca 1 ou mais;
//     ramo em preparação tem "Avise-me", que vira lead na Raiz (fn_ramo_avise_me, D4).
//   • Passo 2: 3 cards — 1) plano atual + ramos, sem desconto, cobrado proporcional até a renovação (D2, D3);
//     2) 1 degrau + ramos (recomendado); 3) 2 degraus + ramos — mensal ou trimestral, com o 1º mês (ou 1º ao 3º)
//     sem os ramos e o valor dos meses seguintes. Preços e limites vêm de fn_ramos_ofertas (mesmos da cobrança).
//   • Confirmar abre a cobrança Pix da Licença (comum-renovacao.js → abrirCobranca, com p_ramos). Degrau no Premium
//     abre a conversa (página Premium), como o resto do app.
// ============================================================================
export const VERSAO = '1.1.0'; // v-check: lido por Dev › Versões — manter igual ao header

const SITE_RAIZ = 'https://www.raizpatrimonio.com.br';
const brl = (n) => Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const brl0 = (n) => Number(n || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: Number(n) % 1 ? 2 : 0 });
const esc = (v) => (window.rzEsc ? window.rzEsc(v) : String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])));
const cor = (c) => `var(--ramo-cor-${c}, var(--sage))`;
const icone = (nome, cls = '') => `<svg data-lucide="${esc(nome || 'circle')}" class="${cls}"></svg>`;

// Texto de apresentação de cada ramo (protótipo v1.3.1). Preço, nome, ícone e situação vêm do banco.
const TEXTO = {
    familia: { frase: 'A rotina da família em paz. Os filhos, a casa e as contas de todos em dia, sem nada na cabeça.',
        pontos: ['Filhos: escola, vacinas, consultas e atividades, com aviso antes', 'Calendário da família, com o escolar lido pela Raiz IA', 'Despesas compartilhadas, divididas entre os responsáveis'] },
    agro: { frase: 'Qualquer lavoura acompanhada de perto (grãos, café, cana, frutas), com tempo para olhar o que importa.',
        pontos: ['Ciclo de cada cultura por talhão, do plantio à colheita', 'Aviso de aplicação e tarefa antes do prazo', 'Custo e resultado por safra e por cultura'] },
    pecuaria: { frase: 'Gado de corte ou de leite: cada lote no seu lugar e o manejo em dia, sem planilha.',
        pontos: ['Lotes de corte e leiteiros, com cabeças, entradas e saídas', 'Produção de leite e laticínios acompanhada', 'Vacinação e manejo com aviso; custo e resultado por lote'] },
    obras: { frase: 'A obra transparente, do orçamento à entrega, para quem constrói e para quem acompanha.',
        pontos: ['Orçamento e cronograma acompanhados de perto', 'Pagamentos e documentos da obra num lugar só', 'Diário com fotos para compartilhar'] },
    comercial: { frase: 'O que você vende e recebe, organizado e sem retrabalho.',
        pontos: ['O que você vende, o preço e o comprador', 'Recebíveis e cobranças do que foi vendido', 'Nota e envio ao contador sem retrabalho'] },
    investimentos: { frase: 'A carteira financeira junto com o resto do patrimônio.' },
    varejo: { frase: 'Pequenos negócios e lojas, com o mesmo cuidado.' },
};
// Destaques do que o plano de cima libera (só quando muda de família de plano).
const DESTAQUES = {
    patrimonio: ['Conciliação do extrato', 'Divisão entre sócios', 'Condomínio e IPTU no automático', 'Atendimento ao inquilino'],
    plus: ['Pacote do contador', 'Documentos fiscais', 'Retiradas extraordinárias'],
    premium: ['Método R.A.I.Z', 'Contas e cartão', 'Fluxo de caixa', 'Relatório executivo'],
};
const INFO = {
    uso: 'Mais uso é mais espaço no mesmo tipo de plano: mais ativos, itens de controle, contratos e pessoas. As funções continuam as mesmas.',
    func: 'Mais funções é um plano de cima: além de mais espaço, libera funções que o seu plano atual não tem.',
    atual: 'Seu plano continua o mesmo. Os ramos entram hoje e são cobrados só pelos dias até a renovação; depois, vencem junto com o plano.',
};
const fam = (c) => String(c || '').toLowerCase().replace(/_ampliado$/, '');

function css() {
    if (document.getElementById('rzro-css')) return;
    const st = document.createElement('style');
    st.id = 'rzro-css';
    st.textContent = `
.rzro-novos{display:flex;align-items:center;gap:10px;width:100%;margin-top:10px;padding:12px;border:1px dashed var(--line);border-radius:var(--r-card);background:var(--paper);text-align:left}
.rzro-ics{display:flex}.rzro-ics span{width:28px;height:28px;border-radius:9px;display:grid;place-items:center;color:var(--paper);opacity:.4;margin-right:-6px;border:2px solid var(--paper)}
.rzro-ics svg{width:14px;height:14px}
.rzro-novos b{display:block;font-size:var(--fs-corpo);color:var(--ink)}.rzro-novos small{color:var(--muted);font-size:var(--fs-sec)}
.rzro-car{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:12px;padding-bottom:6px;scrollbar-width:none}.rzro-car::-webkit-scrollbar{display:none}
.rzro-sl{flex:0 0 100%;scroll-snap-align:center;border-radius:var(--r-card);padding:18px;min-height:400px;display:flex;flex-direction:column;background:color-mix(in srgb,var(--rc) 9%,var(--card))}
.rzro-big{width:60px;height:60px;border-radius:18px;display:grid;place-items:center;color:var(--paper);background:var(--rc)}.rzro-big svg{width:30px;height:30px}
.rzro-sl h3{font-family:var(--font-title);font-size:var(--fs-titulo);margin-top:12px;color:var(--ink)}
.rzro-sl p{font-size:var(--fs-corpo);line-height:1.5;margin-top:6px;color:var(--ink)}
.rzro-sl ul{list-style:none;margin-top:12px;padding:0}.rzro-sl li{font-size:var(--fs-sec);padding:7px 0 7px 18px;position:relative;border-top:1px solid var(--line);color:var(--ink)}
.rzro-sl li:first-child{border-top:0}.rzro-sl li:before{content:"";position:absolute;left:2px;top:13px;width:8px;height:8px;border-radius:50%;background:var(--rc);opacity:.6}
.rzro-pr{margin-top:auto;padding-top:12px;display:flex;align-items:flex-end;justify-content:space-between;gap:10px}
.rzro-pr b{font-family:var(--font-title);font-size:22px;color:var(--ink)}.rzro-pr small{display:block;color:var(--muted);font-size:var(--fs-mini)}
.rzro-marcar{height:42px;padding:0 16px;border-radius:var(--r-pill);font-weight:700;border:2px solid var(--rc);color:var(--rc);background:var(--card)}
.rzro-marcar.on{background:var(--rc);color:var(--paper)}
.rzro-dots{display:flex;justify-content:center;gap:6px;margin:6px 0}.rzro-dots i{width:7px;height:7px;border-radius:50%;background:var(--line)}.rzro-dots i.on{background:var(--pine);width:18px;border-radius:4px}
.rzro-chips{display:flex;flex-wrap:wrap;gap:6px}.rzro-chips span{display:inline-flex;align-items:center;gap:6px;font-size:var(--fs-sec);font-weight:600;padding:3px 10px 3px 3px;border-radius:var(--r-pill);background:var(--tile)}
.rzro-chips i{width:20px;height:20px;border-radius:6px;display:grid;place-items:center;color:var(--paper);font-style:normal}.rzro-chips i svg{width:12px;height:12px}
.rzro-op{border:1px solid var(--line);border-radius:var(--r-card);padding:12px 14px;margin-top:14px;position:relative;background:var(--card)}
.rzro-op.on{border:2px solid var(--pine);background:color-mix(in srgb,var(--sprout) 6%,var(--card))}
.rzro-tag{position:absolute;top:-9px;left:12px;background:var(--sprout);color:var(--paper);font-size:var(--fs-mini);font-weight:700;padding:1px 8px;border-radius:var(--r-pill)}
.rzro-nm{font-size:var(--fs-mini);font-weight:700;color:var(--sage);display:flex;gap:6px;align-items:center}
.rzro-pl{font-size:var(--fs-corpo);font-weight:700;margin-top:2px}
.rzro-atual{font-size:var(--fs-mini);font-weight:700;color:var(--info);background:var(--info-bg);padding:1px 8px;border-radius:var(--r-pill);margin:0 4px}
.rzro-pa{display:flex;align-items:baseline;gap:6px;margin-top:4px}.rzro-pa b{font-family:var(--font-title);font-size:24px;color:var(--pine)}.rzro-pa span{font-size:var(--fs-sec);color:var(--muted)}
.rzro-mais{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;align-items:center}.rzro-mais span{font-size:var(--fs-mini);font-weight:600;padding:3px 8px;border-radius:var(--r-pill);background:var(--info-bg);color:var(--info)}
.rzro-mais span.fn{background:var(--success-bg);color:var(--success)}
.rzro-i{width:22px;height:22px;border-radius:50%;border:1.5px solid var(--sage);color:var(--sage);font:italic 700 11px Georgia,serif;display:inline-grid;place-items:center;background:none}
.rzro-info{font-size:var(--fs-sec);color:var(--ink);background:var(--tile);border-radius:var(--r-ctl);padding:8px 10px;margin-top:8px}
.rzro-per{display:flex;gap:16px;margin-top:10px}.rzro-per button{font-size:var(--fs-sec);font-weight:600;color:var(--muted);display:flex;align-items:center;gap:6px;background:none;border:0;padding:2px 0}
.rzro-per button:before{content:"";width:14px;height:14px;border-radius:50%;border:2px solid var(--sage);box-sizing:border-box}
.rzro-per button.on{color:var(--ink)}.rzro-per button.on:before{border:4px solid var(--pine)}
.rzro-vals{margin-top:8px;border-top:1px dashed var(--line);padding-top:4px}
.rzro-vals div{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;font-size:var(--fs-sec);padding:5px 0}
.rzro-vals b{font-size:var(--fs-corpo);white-space:nowrap}.rzro-vals small{display:block;font-size:var(--fs-mini);color:var(--success);font-weight:600}
.rzro-desc{margin-top:6px;font-size:var(--fs-sec);color:var(--success);font-weight:700;line-height:1.45}.rzro-desc small{display:block;font-weight:500;color:var(--ink)}
.rzro-alerta{margin-top:8px;background:var(--warning-bg);color:var(--warning);border-radius:var(--r-ctl);padding:7px 10px;font-size:var(--fs-sec);font-weight:600}
.rzro-hoje{font-size:var(--fs-mini);color:var(--muted);margin-top:6px}
.rzro-canc{font-size:var(--fs-mini);color:var(--muted);text-align:center;margin-top:12px}
.rzro-pe{position:sticky;bottom:0;background:var(--card);padding-top:10px;margin-top:10px;display:flex;flex-direction:column;gap:6px}`;
    document.head.appendChild(st);
}
function icones() { try { if (window.rzIcones) window.rzIcones(); else if (window.lucide) window.lucide.createIcons(); } catch (_) {} }
function abrir(cabecalho, corpoHtml) {
    css();
    const sheet = window.abrirSheet(window.rzSheetCabecalho(cabecalho.titulo, cabecalho.sub) + `<div class="rz-sh-b">${corpoHtml}</div>`);
    icones();
    return sheet;
}

// ---------------------------------------------------------------------------------------------------------------------
// Lente de ramos (saiu do index.html v1.490.46, mesmo comportamento) + "Conheça novos ramos"
// ---------------------------------------------------------------------------------------------------------------------
export function abrirLente(ctx) {
    const { ramos = [], licenciados = null, atual = 'tudo', escolher } = ctx;
    css();
    const item = (c, nome, sub, cr, lock, ic) =>
        `<button type="button" class="rz-act ${lock ? 'rz-off' : ''}" ${lock ? 'aria-disabled="true"' : `data-rz-ramo="${c}"`}>` +
        `<div class="rz-ic" style="background:${cr};color:var(--paper)">${icone(ic)}</div>` +
        `<div>${esc(nome)}${c === atual ? ' ✓' : ''}<small>${esc(sub)}</small></div></button>`;
    const meus = ramos.filter((r) => !licenciados || licenciados.includes(r.codigo));
    const novos = licenciados ? ramos.filter((r) => !licenciados.includes(r.codigo) && !['imoveis', 'outros'].includes(r.codigo)) : [];
    const corpo = item('tudo', 'Todo o patrimônio', 'Todos os ramos somados', 'var(--pine)', false, 'layers') +
        meus.map((r) => item(r.codigo, r.nome + (r.status === 'ativo' ? '' : ' · em breve'), r.descricao || '', cor(r.codigo), r.status !== 'ativo', r.icone)).join('') +
        (novos.length ? `<button type="button" class="rzro-novos" id="rzro-novos"><div class="rzro-ics">${novos.map((r) => `<span style="background:${cor(r.codigo)}">${icone(r.icone)}</span>`).join('')}</div>` +
            `<div style="flex:1;margin-left:8px"><b>🔒 Conheça novos ramos</b><small>${esc(novos.slice(0, 3).map((r) => r.nome).join(', '))}${novos.length > 3 ? ' e mais' : ''}</small></div>${icone('chevron-right')}</button>` : '');
    const sheet = window.abrirSheet(window.rzSheetCabecalho('Ver o app de', 'Vale para todas as abas até você trocar de novo.') + `<div class="rz-sh-b">${corpo}</div>`);
    sheet.querySelectorAll('[data-rz-ramo]').forEach((b) => b.addEventListener('click', () => { window.fecharSheet(); escolher(b.dataset.rzRamo); }));
    sheet.querySelector('#rzro-novos')?.addEventListener('click', () => conhecer(ctx));
    icones();
}

// ---------------------------------------------------------------------------------------------------------------------
// Carrossel
// ---------------------------------------------------------------------------------------------------------------------
async function carregar(ctx) {
    if (ctx._dados) return ctx._dados;
    const { data, error } = await ctx.dbAuth.rpc('fn_ramos_ofertas', { p_cliente_id: ctx.clienteId });
    if (error) throw error;
    ctx._dados = data;
    return data;
}

export async function conhecer(ctx, ini = 0) {
    let d;
    try { d = await carregar(ctx); } catch (e) { return ctx.toast?.(e?.message || 'Não foi possível carregar os ramos agora.', 'danger'); }
    if (!d?.ok) return ctx.toast?.(d?.mensagem || 'Os ramos ainda não estão disponíveis para a sua empresa.', 'danger');
    ctx.sel = ctx.sel || {};
    const lista = (d.ramos || []).filter((r) => !r.contratado);
    if (!lista.length) return ctx.toast?.('Sua empresa já tem todos os ramos disponíveis.', 'success');
    const soma = () => lista.filter((r) => ctx.sel[r.codigo]).reduce((s, r) => s + Number(r.preco || 0), 0);
    const n = () => lista.filter((r) => ctx.sel[r.codigo]).length;

    const slides = lista.map((r) => {
        const t = TEXTO[r.codigo] || { frase: r.descricao || '' };
        const on = !!ctx.sel[r.codigo];
        return `<div class="rzro-sl" style="--rc:${cor(r.codigo)}"><div class="rzro-big">${icone(r.icone)}</div>` +
            `<h3>Raiz ${esc(r.nome)}</h3><p>${esc(t.frase)}</p>` +
            (t.pontos ? `<ul>${t.pontos.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>` : '<p style="color:var(--muted)">Em preparação. Quer ser avisado quando chegar?</p>') +
            '<div class="rzro-pr">' + (r.em_breve
                ? `<div><small>Em breve</small></div><button type="button" class="rzro-marcar" data-av="${esc(r.codigo)}">Avise-me</button>`
                : `<div><b>${brl0(r.preco)}</b><small>por mês</small></div><button type="button" class="rzro-marcar ${on ? 'on' : ''}" data-m="${esc(r.codigo)}">${on ? '✓ Escolhido' : 'Quero este ramo'}</button>`) +
            '</div></div>';
    }).join('');
    const rodape = () => (n() ? `Continuar com ${n()} ramo${n() > 1 ? 's' : ''} · ${brl0(soma())} por mês` : 'Escolha pelo menos 1 ramo');
    const sheet = abrir({ titulo: 'Conheça novos ramos', sub: 'Deslize para o lado. Marque um ou mais ramos.' },
        `<div class="rzro-car" id="rzro-car">${slides}</div><div class="rzro-dots" id="rzro-dots">${lista.map((_, i) => `<i class="${i === ini ? 'on' : ''}"></i>`).join('')}</div>` +
        `<div class="rzro-pe"><button type="button" class="rz-btn rz-btn-1 rz-wide" id="rzro-cont" ${n() ? '' : 'disabled'}>${rodape()}</button></div>`);
    const car = sheet.querySelector('#rzro-car');
    const passo = () => car.clientWidth + 12;
    requestAnimationFrame(() => { car.scrollLeft = ini * passo(); });
    car.addEventListener('scroll', () => {
        const i = Math.round(car.scrollLeft / passo());
        sheet.querySelectorAll('#rzro-dots i').forEach((x, j) => x.classList.toggle('on', j === i));
    });
    sheet.querySelectorAll('[data-m]').forEach((b) => b.addEventListener('click', () => {
        const c = b.dataset.m; ctx.sel[c] = !ctx.sel[c];
        b.classList.toggle('on', ctx.sel[c]); b.textContent = ctx.sel[c] ? '✓ Escolhido' : 'Quero este ramo';
        const cont = sheet.querySelector('#rzro-cont'); cont.disabled = !n(); cont.textContent = rodape();
    }));
    sheet.querySelectorAll('[data-av]').forEach((b) => b.addEventListener('click', async () => {
        b.disabled = true;
        try {
            const { data, error } = await ctx.dbAuth.rpc('fn_ramo_avise_me', { p_cliente_id: ctx.clienteId, p_ramo: b.dataset.av });
            if (error) throw error;
            b.textContent = '✓ Vamos avisar';
            ctx.toast?.(data?.mensagem || 'Pronto! A Raiz avisa você.', 'success');
        } catch (e) { b.disabled = false; ctx.toast?.(e?.message || 'Não foi possível registrar agora.', 'danger'); }
    }));
    sheet.querySelector('#rzro-cont').addEventListener('click', () => { ctx.escolha = ctx.escolha || 'p1'; passo2(ctx); });
}

// ---------------------------------------------------------------------------------------------------------------------
// Passo 2 — os 3 cards
// ---------------------------------------------------------------------------------------------------------------------
function cartoes(d, rsSoma, per) {
    const degs = d.degraus || [];
    return degs.map((g) => {
        const atual = g.salto === 0;
        const soTri = !atual && g.mensal == null && g.trimestral != null;
        const temTri = !atual && g.trimestral != null;
        const meses = soTri || (temTri && per[g.codigo] === 't') ? 3 : 1;
        const mensal = Number(g.mensal ?? (g.trimestral ? g.trimestral / 3 : 0));
        const inicioMes = atual ? null : (meses === 3 ? Number(g.trimestral) / 3 : mensal);
        const tab = meses === 3 && g.trimestral_tabela ? Number(g.trimestral_tabela) / 3 : Number(g.mensal_tabela || 0);
        return { g, id: atual ? 'atual' : 'p' + g.salto, atual, soTri, temTri, meses, mensal, inicioMes,
            depois: mensal + rsSoma, tabMes: tab, desconto: tab ? tab - (inicioMes ?? mensal) : 0, ativos: Number(g.limites?.ativos || 0) };
    });
}

function passo2(ctx) {
    const d = ctx._dados;
    const rs = (d.ramos || []).filter((r) => ctx.sel[r.codigo]);
    const rsSoma = rs.reduce((s, r) => s + Number(r.preco || 0), 0);
    const nomes = rs.map((r) => r.nome).join(rs.length > 2 ? ', ' : ' e ').replace(/, ([^,]*)$/, ' e $1');
    const plural = rs.length > 1;
    ctx.per = ctx.per || {};
    const cs = cartoes(d, rsSoma, ctx.per);
    if (!cs.some((c) => c.id === ctx.escolha)) ctx.escolha = cs[1] ? cs[1].id : 'atual';
    const base = cs[0];
    const dias = Number(d.dias_ciclo || 30);
    const agora = Math.max(Math.round(rsSoma * dias / 30 * 100) / 100, 1);
    const usados = Number(d.atual?.ativos_usados || 0);
    const vence = d.atual?.vence_em ? new Date(d.atual.vence_em + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '';
    const credito = Number(d.atual?.credito || 0);

    let h = `<div class="rzro-chips">${rs.map((r) => `<span><i style="background:${cor(r.codigo)}">${icone(r.icone)}</i>${esc(r.nome)} · ${brl0(r.preco)}/mês</span>`).join('')}</div>`;
    cs.forEach((c) => {
        const g = c.g;
        const titulo = c.atual ? 'Manter o plano atual' : c.g.salto === 1 ? 'Subir 1 degrau' : 'Subir 2 degraus';
        let mais = '', infoK = 'atual';
        if (!c.atual) {
            const novas = fam(g.codigo) !== fam(base.g.codigo) ? (DESTAQUES[fam(g.codigo)] || []) : [];
            infoK = novas.length ? 'func' : 'uso';
            const lb = base.g.limites || {}, lg = g.limites || {};
            mais = `<div class="rzro-mais"><span>+${lg.ativos - lb.ativos} ativos</span><span>+${lg.itens - lb.itens} itens</span><span>+${lg.contratos - lb.contratos} contratos</span>` +
                novas.map((f) => `<span class="fn">${esc(f)}</span>`).join('') + `<button type="button" class="rzro-i" data-i="${infoK}">i</button></div>`;
        }
        const alerta = c.atual && c.ativos && usados / c.ativos >= 0.8 ? `<div class="rzro-alerta">⚠ Você já usou ${usados} de ${c.ativos} ativos.</div>` : '';
        const per = c.atual || !c.temTri ? '' : `<div class="rzro-per">${c.soTri ? '' : `<button type="button" data-pv="m" data-po="${c.id}" class="${c.meses === 1 ? 'on' : ''}">Mensal</button>`}` +
            `<button type="button" data-pv="t" data-po="${c.id}" class="${c.meses === 3 ? 'on' : ''}">Trimestral${c.soTri ? ' (entrada no Premium)' : ''}</button></div>`;
        let vals, extra;
        if (c.atual) {
            vals = `<div class="rzro-hoje">Seu plano hoje: ${brl0(c.mensal)} por mês${vence ? ` · vence em ${vence}` : ''}</div>` +
                `<div class="rzro-vals"><div><span>Agora<small style="color:var(--muted)">${esc(nomes)} proporcional${vence ? ` até ${vence} (${dias} dia${dias > 1 ? 's' : ''})` : ' até a renovação'}</small></span><b>${brl(agora)}</b></div>` +
                `<div><span>Depois, com o plano</span><b>${brl0(c.depois)} por mês</b></div></div>`;
            extra = `<div class="rzro-desc" style="color:var(--muted);font-weight:500">Sem desconto. ${esc(nomes)} entra${plural ? 'm' : ''} hoje. <button type="button" class="rzro-i" data-i="atual">i</button></div>`;
        } else {
            vals = `<div class="rzro-vals"><div><span>${c.meses === 3 ? '1º ao 3º mês' : '1º mês'}<small>${c.meses === 3 ? 'pagos de uma vez · ' : ''}${esc(nomes)} grátis</small></span><b>${brl0(c.inicioMes)}${c.meses === 3 ? ' por mês' : ''}</b></div>` +
                `<div><span>${c.meses === 3 ? 'Do 4º mês em diante' : 'Do 2º mês em diante'}</span><b>${brl0(c.depois)} por mês</b></div>` +
                (() => {
                    const primeiro = c.inicioMes * c.meses, cr = Math.min(credito, primeiro);
                    return `<div><span>Crédito do plano atual<small style="color:var(--muted)">${vence ? `o seu plano vence em ${vence}` : 'o que sobra do plano atual'}</small></span><b>− ${brl(cr)}</b></div>` +
                        `<div><span><b style="font-size:inherit">A pagar agora</b></span><b>${brl(primeiro - cr)}</b></div>`;
                })() + '</div>';
            extra = `<div class="rzro-desc">Você deixa de pagar ${brl0(rsSoma * c.meses)} em ${esc(nomes)}` +
                (c.desconto > 0 ? `<small>+ desconto de lançamento de ${brl0(c.desconto)} por mês no plano (de ${brl0(c.tabMes)} por ${brl0(c.inicioMes)}), garantido enquanto o plano estiver ativo.</small>` : '') +
                (g.conversa ? '<small>A entrada no Premium começa com uma conversa sobre o Método R.A.I.Z.</small>' : '') + '</div>';
        }
        h += `<div class="rzro-op ${ctx.escolha === c.id ? 'on' : ''}" data-o="${c.id}">${c.id === 'p1' ? '<span class="rzro-tag">Recomendado</span>' : ''}` +
            `<div class="rzro-nm">${titulo}</div>` +
            `<div class="rzro-pl">${esc(g.nome)}${c.atual ? '<span class="rzro-atual">atual</span>' : ''} + ${esc(nomes)}</div>` +
            `<div class="rzro-pa"><b>${c.ativos ? brl(c.depois / c.ativos) : '—'}</b><span>por ativo · até ${c.ativos} ativos</span></div>` +
            alerta + mais + per + vals + extra + '<div class="rzro-info" hidden></div></div>';
    });
    if (cs.length === 1) h += '<p class="rzro-canc">Você já está no maior plano. É só manter e adicionar os ramos.</p>';
    h += '<p class="rzro-canc">Em qualquer opção, você pode cancelar em até 7 dias sem custo.</p>' +
        '<div class="rzro-pe"><button type="button" class="rz-btn rz-btn-1 rz-wide" id="rzro-exp">Experimente já!</button>' +
        '<button type="button" class="rz-btn rz-btn-2 rz-wide" id="rzro-volta">Voltar aos ramos</button></div>';

    const sheet = abrir({ titulo: 'Escolha como seguir', sub: `Passo 2 de 2 · com ${nomes}` }, h);
    const corpo = sheet.querySelector('.rz-sh-b');
    const re = () => { const y = corpo.scrollTop; const s2 = passo2(ctx); const c2 = s2?.querySelector('.rz-sh-b'); if (c2) c2.scrollTop = y; };
    sheet.querySelectorAll('[data-i]').forEach((b) => b.addEventListener('click', (e) => {
        e.stopPropagation();
        const box = b.closest('.rzro-op')?.querySelector('.rzro-info');
        if (!box) return;
        box.hidden = !box.hidden || box.dataset.k !== b.dataset.i;
        box.dataset.k = b.dataset.i; box.textContent = INFO[b.dataset.i];
    }));
    sheet.querySelectorAll('[data-pv]').forEach((b) => b.addEventListener('click', (e) => {
        e.stopPropagation();
        const c = cs.find((x) => x.id === b.dataset.po);
        ctx.per[c.g.codigo] = b.dataset.pv; ctx.escolha = c.id; re();
    }));
    sheet.querySelectorAll('[data-o]').forEach((b) => b.addEventListener('click', () => { ctx.escolha = b.dataset.o; re(); }));
    sheet.querySelector('#rzro-volta').addEventListener('click', () => conhecer(ctx));
    sheet.querySelector('#rzro-exp').addEventListener('click', () => confirmar(ctx, cs.find((x) => x.id === ctx.escolha), rs));
    return sheet;
}

async function confirmar(ctx, c, rs) {
    if (!c) return;
    if (c.g.conversa && !c.atual) {
        window.open(SITE_RAIZ + '/premium/#agendar', '_blank', 'noopener');
        window.fecharSheet?.();
        return;
    }
    try {
        const { abrirCobranca } = await import('./comum-renovacao.js');
        const nomesRamos = Object.fromEntries((ctx._dados.ramos || []).map((r) => [r.codigo, r.nome]));
        await abrirCobranca({
            dbAuth: ctx.dbAuth, clienteId: ctx.clienteId, toast: ctx.toast,
            oferta: { plano_codigo: c.g.codigo, plano_nome: c.g.nome, periodo: c.atual ? 'mensal' : (c.meses === 3 ? 'trimestral' : 'mensal'),
                nome_oferta: `${c.g.nome}${c.atual ? ' (atual)' : ''} + ${rs.map((r) => r.nome).join(', ')}` },
            ramos: rs.map((r) => r.codigo), nomesRamos,
            voltar: () => passo2(ctx),
        });
    } catch (e) {
        ctx.toast?.(e?.message || 'Não foi possível abrir a cobrança.', 'danger');
    }
}
