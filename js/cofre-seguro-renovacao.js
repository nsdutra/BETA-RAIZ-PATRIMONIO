// ============================================================================
// cofre-seguro-renovacao.js — Raiz Patrimônio · Comparar cotações na renovação do seguro
// Versão: 1.0.0 · 24/11/2026
//
// v1.0.0 (24/11/2026, sessão 20261124-0916-seguros, demanda d03eb567; FICHA_COMPARATIVO_RENOVACAO_SEGUROS v1.3.0, de acordo
// do Nicola 24/11 16:15) — criação. Aberto pelo "Comparar cotações" do vencimento de um item de seguro: sobe as cotações no
// próprio item, pede o comparativo à Edge seguro-comparar, mostra preço, escolha de proposta e pagamento (só as formas da
// proposta), o que mudou, coberturas, assistências e pontos de atenção, abre o WhatsApp da corretora com a mensagem e aprova
// pela fn_item_controle_renovar. Os números vêm da Edge; o módulo só formata e soma a escolha.
// ============================================================================
export const VERSAO = '1.0.0';

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const g = (nome) => (typeof window !== 'undefined' && typeof window[nome] === 'function') ? window[nome] : null;
const icones = () => { if (typeof lucide !== 'undefined') lucide.createIcons(); };
const moeda = (v) => {
    if (v === null || v === undefined || isNaN(Number(v))) return '—';
    const f = g('formatarMoedaBR');
    return f ? f(Number(v)) : 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
const dataBR = (iso) => { if (!iso) return '—'; const [a, m, d] = String(iso).slice(0, 10).split('-'); return `${d}/${m}/${a}`; };
const pctTxt = (p) => p === null || p === undefined ? '' : `${p >= 0 ? '+' : ''}${String(p).replace('.', ',')}%`;
const aviso = (msg, tipo = 'info') => (g('rzToast') ? g('rzToast')(msg, tipo) : g('mostrarToast')?.(msg, tipo));
const MEIO = { debito: 'Débito em conta', cartao_seguradora: 'Cartão da seguradora', cartao: 'Cartão de crédito', boleto: 'Boleto', pix: 'Pix', outro: 'Outro' };

let st = null; // { item, ctx, sheet, dados, prop, meio, parc, ouvinte }

/**
 * Abre o comparativo de cotações de um item de seguro.
 * @param {object} item  item de controle ({ id, titulo, data_fim })
 * @param {object} ctx   { subirCotacao(), aposRenovar(item) → Promise }
 */
export async function abrirComparativoSeguro(item, ctx = {}) {
    const abrirSheet = g('abrirSheet'), cab = g('rzSheetCabecalho');
    if (!item || !abrirSheet || !cab) return;
    const sheet = abrirSheet(cab('Comparar cotações', item.titulo || 'Seguro') +
        `<div class="rz-sh-b">${carregandoHtml('Lendo as cotações deste seguro…')}</div>`,
        { aoFechar: () => { st = null; } });
    st = { item, ctx, sheet, dados: null, prop: 0, meio: null, parc: null };
    icones();
    await carregar('ler');
}

function carregandoHtml(texto) {
    return `<div class="rz-card"><div class="rz-empty"><div class="rz-ic rz-ia"><svg data-lucide="sparkles"></svg></div><p>${esc(texto)}</p></div></div>`;
}

async function chamar(corpo) {
    const { data, error } = await dbAuth.functions.invoke('seguro-comparar', { body: corpo });
    if (error) {
        let msg = error.message;
        try { const c = await error.context?.json?.(); if (c?.mensagem) msg = c.mensagem; } catch (_) { /* resposta sem corpo */ }
        throw new Error(msg);
    }
    if (!data?.ok) throw new Error(data?.mensagem || 'Não consegui comparar agora.');
    return data;
}

async function carregar(acao) {
    if (!st) return;
    const b = st.sheet.querySelector('.rz-sh-b');
    if (acao === 'gerar' && b) { b.innerHTML = carregandoHtml('Comparando as propostas… leva uns 30 segundos.'); icones(); }
    try {
        st.dados = await chamar({ acao, item_id: st.item.id });
    } catch (e) {
        if (b) b.innerHTML = `<div class="rz-card"><div class="rz-empty"><div class="rz-ic"><svg data-lucide="alert-circle"></svg></div><p>${esc(e?.message || e)}</p></div></div>`;
        rodape(); icones();
        return;
    }
    const c = st.dados.comparativo;
    if (c?.calculo?.propostas?.length) escolhaPadrao(c.calculo.propostas);
    desenhar();
}

// ---------- escolha: proposta, meio e parcelas (só o que está impresso na proposta) ----------
function rotuloProposta(p, todas) {
    const base = p.plano || p.nome || 'Proposta';
    const iguais = todas.filter(x => (x.plano || x.nome) === base).length > 1;
    if (!iguais) return base;
    const extra = [p.valor_de_novo === true ? 'com valor de novo' : p.valor_de_novo === false ? 'sem valor de novo' : null, p.desconto ? 'com desconto' : null].filter(Boolean).join(', ');
    return extra ? `${base} · ${extra}` : `${base} · ${moeda(p.premio_total)}`;
}
function escolhaPadrao(props) {
    // proposta mais barata; meio da última renovação aprovada ou débito; nunca o cartão da seguradora por padrão
    st.prop = 0;
    const p = props[0];
    const meios = [...new Set((p.formas || []).map(f => f.codigo))];
    st.meio = meios.find(m => m === 'debito') || meios.find(m => m !== 'cartao_seguradora') || meios[0] || null;
    const semJuros = (p.formas || []).filter(f => f.codigo === st.meio && !f.juros).sort((a, b) => b.parcelas - a.parcelas)[0];
    st.parc = semJuros ? semJuros.parcelas : ((p.formas || []).find(f => f.codigo === st.meio)?.parcelas ?? null);
}
function formaEscolhida() {
    const p = st.dados.comparativo.calculo.propostas[st.prop];
    return (p.formas || []).find(f => f.codigo === st.meio && f.parcelas === st.parc) || null;
}
function rotuloForma(f) {
    const base = f.parcelas === 1 ? `à vista ${moeda(f.primeira)}` : `${f.parcelas}x de ${moeda(f.demais ?? f.primeira)}`;
    return base + (f.juros ? ` · juros ${moeda(f.juros)}` : ' · sem juros');
}

// ---------- tela ----------
function desenhar() {
    const b = st?.sheet.querySelector('.rz-sh-b');
    if (!b) return;
    const d = st.dados, c = d.comparativo;
    const cotacoes = (d.documentos || []).filter(x => x.subtipo === 'seguro_cotacao');
    const novas = c ? cotacoes.filter(x => !(c.cotacoes_ids || []).includes(x.id)).length : 0;
    let h = '';
    if (!cotacoes.length) {
        h = `<div class="rz-card"><div class="rz-empty"><div class="rz-ic"><svg data-lucide="file-up"></svg></div>
            <p>Suba as cotações da renovação (PDF ou foto).<br><small style="color:var(--muted)">O Raiz lê cada uma e compara com a apólice de hoje.</small></p></div></div>`;
    } else if (!c || !c.calculo?.propostas?.length) {
        h = `<div class="rz-group">Cotações neste seguro</div><div class="rz-card rz-list">` + cotacoes.map(x =>
            `<div class="rz-row"><div class="rz-ic"><svg data-lucide="file-text"></svg></div><div class="rz-tx"><b>${esc(x.nome)}</b><span>${esc(dataBR(x.criado_em))}</span></div></div>`).join('') +
            `</div><p class="rz-hint" style="margin:8px 2px">Suba todas as que quiser comparar e toque em Comparar.</p>`;
    } else {
        h = (novas ? `<div class="rz-card"><div class="rz-row"><div class="rz-ic"><svg data-lucide="info"></svg></div><div class="rz-tx"><b>${novas} cotação(ões) nova(s)</b><span>Toque em Comparar de novo para incluir</span></div></div></div>` : '')
            + resumoHtml(c) + precoHtml(c) + escolhaHtml(c) + mudancasHtml(c) + coberturasHtml(c) + assistenciasHtml(c)
            + atencaoHtml(c) + corretoraHtml(c) + aprovarHtml(c);
    }
    b.innerHTML = h;
    ligar(b);
    rodape();
    icones();
}

function rodape() {
    const sh = st?.sheet; if (!sh) return;
    sh.querySelector('.rz-sh-f')?.remove();
    const temCot = (st.dados?.documentos || []).some(x => x.subtipo === 'seguro_cotacao');
    const jaTem = !!st.dados?.comparativo?.calculo?.propostas?.length;
    sh.insertAdjacentHTML('beforeend', `<div class="rz-sh-f">
        <button type="button" class="rz-btn rz-btn-2" data-sr-subir>Subir cotação</button>
        ${temCot ? `<button type="button" class="rz-btn rz-btn-1 rz-btn-ia" data-sr-gerar>${jaTem ? 'Comparar de novo' : 'Comparar'}</button>` : ''}</div>`);
    sh.querySelector('[data-sr-subir]')?.addEventListener('click', () => st?.ctx?.subirCotacao?.(st.item));
    sh.querySelector('[data-sr-gerar]')?.addEventListener('click', () => carregar('gerar'));
}

function resumoHtml(c) {
    const t = c.textos || {};
    return `<div class="rz-card rz-ia" style="padding:14px 16px"><span class="rz-ia-tag"><svg data-lucide="sparkles"></svg>Resumo do Raiz</span>
        ${(t.resumo || []).map(x => `<p class="rz-desc" style="margin:8px 0 0">${esc(x)}</p>`).join('')}
        ${t.na_pratica ? `<p class="rz-desc" style="margin:8px 0 0"><b>Na prática:</b> ${esc(t.na_pratica)}</p>` : ''}</div>`;
}

function precoHtml(c) {
    const k = c.calculo, ps = k.propostas;
    const linhas = [];
    if (k.base !== null && k.base !== undefined) linhas.push(`<div class="rz-row"><div class="rz-ic"><svg data-lucide="shield"></svg></div><div class="rz-tx"><b>Hoje</b><span>${esc(c.vigente?.plano || 'Apólice vigente')}</span></div><div class="rz-rt"><b>${esc(moeda(k.base))}</b></div></div>`);
    ps.forEach((p, i) => linhas.push(`<div class="rz-row"><div class="rz-ic"><svg data-lucide="file-text"></svg></div>
        <div class="rz-tx"><b>${esc(rotuloProposta(p, ps))}</b><span>${esc(p.seguradora || '')}${p.validade_ate ? ' · vale até ' + esc(dataBR(p.validade_ate)) : ''}</span></div>
        <div class="rz-rt"><b>${esc(moeda(p.premio_total))}</b>${p.pct_vigente !== null && p.pct_vigente !== undefined ? `<small class="rz-st${p.pct_vigente > 10 ? ' rz-warn' : ''}">${esc(pctTxt(p.pct_vigente))}</small>` : ''}</div></div>`));
    return `<div class="rz-group">Quanto custa no ano</div><div class="rz-card rz-list">${linhas.join('')}</div>`;
}

function escolhaHtml(c) {
    const ps = c.calculo.propostas, p = ps[st.prop];
    const meios = [...new Set((p.formas || []).map(f => f.codigo))];
    const formas = (p.formas || []).filter(f => f.codigo === st.meio).sort((a, b) => a.parcelas - b.parcelas);
    const f = formaEscolhida();
    if (!(p.formas || []).length) return `<div class="rz-group">Sua escolha</div><div class="rz-card"><div class="rz-chips">${ps.map((x, i) =>
        `<button type="button" class="rz-chip${i === st.prop ? ' rz-on' : ''}" data-sr-prop="${i}">${esc(rotuloProposta(x, ps))}</button>`).join('')}</div>
        <p class="rz-hint" style="margin:8px 0 0">A proposta não traz as formas de pagamento; combine com a corretora.</p></div>`;
    return `<div class="rz-group">Sua escolha</div><div class="rz-card" style="padding:12px 14px">
        <div class="rz-chips">${ps.map((x, i) => `<button type="button" class="rz-chip${i === st.prop ? ' rz-on' : ''}" data-sr-prop="${i}">${esc(rotuloProposta(x, ps))}</button>`).join('')}</div>
        <div class="rz-chips" style="margin-top:8px">${meios.map(m => `<button type="button" class="rz-chip${m === st.meio ? ' rz-on' : ''}" data-sr-meio="${esc(m)}">${esc(MEIO[m] || m)}</button>`).join('')}</div>
        <div class="rz-f" style="margin-top:8px"><label for="sr-parc">Parcelas</label><select id="sr-parc">${formas.map(x =>
            `<option value="${x.parcelas}"${x.parcelas === st.parc ? ' selected' : ''}>${esc(rotuloForma(x))}</option>`).join('')}</select></div>
        <div class="rz-row" style="padding:8px 0 0"><div class="rz-tx"><b>Total no ano</b><span>${f && c.calculo.base ? esc(pctTxt(Math.round((f.total - c.calculo.base) / c.calculo.base * 1000) / 10)) + ' sobre hoje' : ''}</span></div><div class="rz-rt"><b>${esc(moeda(f?.total))}</b></div></div>
        ${f?.juros ? `<p class="rz-hint" style="margin:4px 0 0">Com juros. Sem juros, o maior parcelamento deste meio é ${esc(String((formas.filter(x => !x.juros).pop() || {}).parcelas || 1))}x.</p>` : ''}</div>`;
}

function mudancasHtml(c) {
    const m = (c.calculo.mudancas || [])[st.prop] || [];
    if (!m.length || !c.vigente) return '';
    return `<div class="rz-group">O que mudou em relação a hoje</div><div class="rz-card rz-list">` + m.slice(0, 10).map(x =>
        `<div class="rz-row"><div class="rz-ic"><svg data-lucide="${x.tipo === 'valor_de_novo' ? 'alert-triangle' : x.tipo === 'premio_cobertura' ? 'trending-up' : 'info'}"></svg></div><div class="rz-tx"><span>${esc(x.texto)}</span></div></div>`).join('') + '</div>';
}

function coberturasHtml(c) {
    const linhas = (c.calculo.coberturas || []);
    if (!linhas.length) return '';
    const val = (x) => x ? `${x.lmi !== null && x.lmi !== undefined ? 'limite ' + moeda(x.lmi) : ''}${x.premio ? ' · custa ' + moeda(x.premio) : ''}${x.franquia ? ' · franquia ' + x.franquia : ''}` : 'não tem';
    const ofertadas = (c.calculo.propostas[st.prop]?.ofertadas || []);
    return `<div class="rz-group">O que está coberto</div><div class="rz-card rz-list">` + linhas.map(l =>
        `<div class="rz-row"><div class="rz-ic"><svg data-lucide="shield-check"></svg></div><div class="rz-tx"><b>${esc(l.nome)}</b>
          <span>Escolhida: ${esc(val(l.propostas[st.prop]))}</span>${c.vigente ? `<span>Hoje: ${esc(val(l.vigente))}</span>` : ''}</div></div>`).join('') + '</div>'
        + (ofertadas.length ? `<p class="rz-hint" style="margin:6px 2px 0">Não cobre (oferecido e não contratado): ${esc(ofertadas.join(', '))}.</p>` : '');
}

function assistenciasHtml(c) {
    const k = c.calculo, ps = k.propostas;
    if (!k.comuns?.length && !(k.exclusivas || []).some(e => e.length)) return '';
    const linhas = [];
    if (k.comuns?.length) linhas.push(`<div class="rz-row"><div class="rz-tx"><b>Em todas · ${k.comuns.length}</b><span>${esc(k.comuns.slice(0, 8).map(a => a.nome).join(', '))}${k.comuns.length > 8 ? '…' : ''}</span></div></div>`);
    (k.exclusivas || []).forEach((e, i) => { if (e.length) linhas.push(`<div class="rz-row"><div class="rz-tx"><b>Só em ${esc(rotuloProposta(ps[i], ps))} · ${e.length}</b><span>${esc(e.map(a => a.nome).join(', '))}</span></div></div>`); });
    return `<div class="rz-group">Assistências</div><div class="rz-card rz-list">${linhas.join('')}</div>`;
}

function atencaoHtml(c) {
    const p = (c.textos?.pontos_atencao || []);
    if (!p.length) return '';
    return `<div class="rz-group">Pontos de atenção</div><div class="rz-card rz-list">` + p.map(x =>
        `<div class="rz-row"><div class="rz-ic"><svg data-lucide="alert-circle"></svg></div><div class="rz-tx"><b>${esc(x.titulo)}</b><span>${esc(x.texto)}</span></div></div>`).join('') + '</div>';
}

// ---------- mensagem para a corretora (uma só; editada no próprio WhatsApp) ----------
function mensagem(c) {
    const t = c.textos || {}, ps = c.calculo.propostas, p = ps[st.prop], f = formaEscolhida();
    const nome = (st.dados.contato?.nome || '').split(' ')[0];
    const pontos = [...(t.mensagem_pontos || [])];
    if (st.meio && st.meio !== 'cartao_seguradora' && (p.formas || []).some(x => x.codigo === 'cartao_seguradora'))
        pontos.push('Não tenho o cartão da seguradora. Tem condição equivalente no débito ou em outro cartão?');
    const pag = f ? `${(MEIO[f.codigo] || f.meio).toLowerCase()}, ${f.parcelas === 1 ? 'à vista' : f.parcelas + 'x' + (f.juros ? ' com juros' : ' sem juros')}` : '';
    const linhas = [`Oi${nome && !/corretor|seguro|ltda/i.test(nome) ? ', ' + nome : ''}, tudo bem? ${t.mensagem_abertura || ''}`.trim(), '',
        ...pontos.map((x, i) => `${i + 1}) ${x}`), '',
        `Se o valor ficar bom, renovo no ${rotuloProposta(p, ps)}${pag ? ', com pagamento no ' + pag : ''}.`];
    if (c.calculo.validade_ate) linhas.push(`Como as cotações valem até ${dataBR(c.calculo.validade_ate)}, consegue me retornar antes disso? Obrigado!`);
    else linhas.push('Obrigado!');
    return linhas.join('\n');
}
function corretoraHtml(c) {
    const ct = st.dados.contato;
    return `<div class="rz-group">Falar com a corretora</div><div class="rz-card" style="padding:12px 14px">
        <p class="rz-hint" style="margin:0 0 8px">${esc(ct?.nome || 'Corretora')} · abre o seu WhatsApp com este texto; ajuste lá antes de enviar.</p>
        <div style="white-space:pre-line;background:var(--paper);border-radius:var(--r-ctl);padding:10px 12px" id="sr-msg">${esc(mensagem(c))}</div>
        ${ct?.whatsapp ? '' : `<div class="rz-f" style="margin-top:8px"><label for="sr-wa">WhatsApp da corretora</label><input type="tel" id="sr-wa" inputmode="tel" placeholder="(11) 90000-0000" value="${esc((c.vigente?.corretor?.telefone || c.calculo.propostas[0]?.corretor?.telefone || ''))}"></div>`}
        <div style="display:flex;gap:8px;margin-top:10px"><button type="button" class="rz-btn rz-btn-2" data-sr-wa><svg data-lucide="message-circle"></svg>Abrir no WhatsApp</button></div></div>`;
}
async function abrirWhatsApp(c) {
    const ct = st.dados.contato;
    const num = (ct?.whatsapp || document.getElementById('sr-wa')?.value || '').replace(/\D/g, '');
    if (num.length < 10) { aviso('Informe o WhatsApp da corretora.', 'erro'); return; }
    const tel = num.length <= 11 ? '55' + num : num;
    window.open(`https://wa.me/${tel}?text=${encodeURIComponent(mensagem(c))}`, '_blank', 'noopener');
    chamar({ acao: 'whatsapp', proposta_id: c.id, whatsapp: ct?.whatsapp ? null : num, contato_id: ct?.id || null, contato_nome: ct?.nome || c.vigente?.corretor?.nome || null })
        .then(() => { if (!ct?.whatsapp && st?.dados) st.dados.contato = { ...(ct || {}), whatsapp: num }; }).catch(() => {});
}

// ---------- aprovar ----------
function aprovarHtml(c) {
    const ps = c.calculo.propostas, p = ps[st.prop], f = formaEscolhida();
    if (c.resultado === 'ok' && c.aprovado) return `<div class="rz-card"><div class="rz-row"><div class="rz-ic"><svg data-lucide="check-circle-2"></svg></div><div class="rz-tx"><b>Renovação aprovada</b><span>${esc(dataBR(String(c.aprovado.em).slice(0, 10)))} · falta subir a apólice emitida</span></div></div></div>`;
    const ini = p.vigencia_inicio, fim = p.vigencia_fim;
    return `<div class="rz-group">Aprovar esta proposta</div><div class="rz-card" style="padding:12px 14px">
        <div class="rz-kv"><div><small>Proposta</small><b>${esc(rotuloProposta(p, ps))}</b></div>
        <div><small>Vigência</small><b>${esc(dataBR(ini))} a ${esc(dataBR(fim))}</b></div>
        <div><small>Pagamento</small><b>${f ? esc(MEIO[f.codigo] || f.meio) + ' · ' + esc(rotuloForma(f)) : '—'}</b></div>
        <div><small>Total</small><b>${esc(moeda(f?.total ?? p.premio_total))}</b></div></div>
        <p class="rz-hint" style="margin:8px 0 0">Atualiza a vigência e o valor do seguro, dá baixa no vencimento e abre a pendência da apólice emitida.</p>
        <div style="display:flex;gap:8px;margin-top:10px"><button type="button" class="rz-btn rz-btn-1" data-sr-aprovar${ini && fim ? '' : ' disabled'}>Aprovar e atualizar</button></div></div>`;
}
async function aprovar(c, btn) {
    const ps = c.calculo.propostas, p = ps[st.prop], f = formaEscolhida();
    const confirmar = g('rzConfirmar');
    if (confirmar) {
        const ok = await confirmar({ titulo: 'Aprovar a renovação?', impacto: `${rotuloProposta(p, ps)} · ${moeda(f?.total ?? p.premio_total)}. A vigência do seguro passa a ${dataBR(p.vigencia_inicio)} a ${dataBR(p.vigencia_fim)}.`, rotuloConfirmar: 'Aprovar' });
        if (!ok) return;
    }
    btn.disabled = true;
    try {
        const { data, error } = await dbAuth.rpc('fn_item_controle_renovar', {
            p_item_id: st.item.id, p_inicio: p.vigencia_inicio, p_fim: p.vigencia_fim,
            p_valor: f?.total ?? p.premio_total ?? null, p_parcelas: f?.parcelas ?? null, p_parcela_intervalo_dias: f && f.parcelas > 1 ? 30 : null,
            p_documento_id: p.documento_id || null, p_observacao: rotuloProposta(p, ps), p_proposta_id: c.id,
        });
        if (error) throw error;
        if (!data?.ok) throw new Error('Não consegui aprovar agora.');
        if (st.ctx?.aposRenovar) await st.ctx.aposRenovar({ ...st.item, data_base: p.vigencia_inicio, data_fim: p.vigencia_fim });
        aviso('Renovação aprovada', 'ok');
        await carregar('ler');
    } catch (e) {
        btn.disabled = false;
        const t = g('rzTraduzirErro');
        aviso(t ? t(e?.message || String(e)) : (e?.message || String(e)), 'erro');
    }
}

function ligar(b) {
    const c = st.dados?.comparativo;
    b.querySelectorAll('[data-sr-prop]').forEach(el => el.addEventListener('click', () => {
        st.prop = Number(el.dataset.srProp);
        const p = c.calculo.propostas[st.prop];
        if (!(p.formas || []).some(f => f.codigo === st.meio)) { const keep = st.prop; escolhaPadrao([p]); st.prop = keep; }
        const fs = (p.formas || []).filter(f => f.codigo === st.meio);
        if (!fs.some(f => f.parcelas === st.parc)) st.parc = (fs.filter(f => !f.juros).pop() || fs[0] || {}).parcelas ?? null;
        desenhar();
    }));
    b.querySelectorAll('[data-sr-meio]').forEach(el => el.addEventListener('click', () => {
        st.meio = el.dataset.srMeio;
        const fs = (c.calculo.propostas[st.prop].formas || []).filter(f => f.codigo === st.meio);
        st.parc = (fs.filter(f => !f.juros).pop() || fs[0] || {}).parcelas ?? null;
        desenhar();
    }));
    b.querySelector('#sr-parc')?.addEventListener('change', (ev) => { st.parc = Number(ev.target.value); desenhar(); });
    b.querySelector('[data-sr-wa]')?.addEventListener('click', () => abrirWhatsApp(c));
    b.querySelector('[data-sr-aprovar]')?.addEventListener('click', (ev) => aprovar(c, ev.currentTarget));
}
