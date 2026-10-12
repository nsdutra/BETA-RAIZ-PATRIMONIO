// ============================================================================
// grupo-visao.js — Raiz Patrimônio · Rateio em grupo: o card único (app e link)
// Versão: 1.0.0 · 12/10/2026
//
// v1.0.0 (12/10/2026, sessão 20261008-1231-pessoas-ativos, demanda 41d771c8; F13.10, ficha v3.1.0; de acordo do Nicola
// 12/10 03:27 "Pode implementar") — criação. O MESMO componente desenha o rateio na ficha do item de controle (app) e
// na página do link (grupo.html), "pra não haver discussão": mesmas linhas, mesma ordem, mesmos números, lidos da mesma
// função do banco (fn_grupo__visao, via fn_grupo_visao no app e fn_grupo_link_ler no link).
//   · cabeçalho com o título do item, o período e a situação (aberto: links valem até o rateio fechar);
//   · Balanço por pessoa (pagou, parte, saldo) em cor neutra, com sinal em palavras ("recebe", "deve");
//   · "Agrupar as contas": o menor número de pagamentos para zerar, com "Registrar pagamento";
//   · Lançamentos: despesas, pagamentos e ajustes; cancelados riscados com o motivo; tocar abre a divisão e o
//     "Cancelar" (no link, só o que a própria pessoa lançou);
//   · formulários "Lancei uma despesa" (igual, %, cotas ou valor) e "Paguei alguém", dentro do próprio card.
// Sem ícones de biblioteca e com estilo próprio (tokens do app com valor de reserva): funciona igual nos dois lugares.
// ============================================================================
export const VERSAO = '1.0.0';

const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = (v) => Number(v) || 0;
const moeda = (v) => 'R$ ' + num(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const dataBR = (iso) => { if (!iso) return ''; const [a, m, d] = String(iso).slice(0, 10).split('-'); return `${d}/${m}/${a}`; };
const hojeISO = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const r2 = (v) => Math.round(num(v) * 100) / 100;

const CSS = `
.gv{color:var(--ink,#17211e);font-family:var(--font-body,Inter,system-ui,sans-serif);font-size:15px}
.gv *{box-sizing:border-box}
.gv-h{display:flex;align-items:flex-start;gap:10px;margin-bottom:10px}.gv-h>div{flex:1;min-width:0}
.gv-h b{display:block;font:700 17px/1.2 var(--font-title,'Bricolage Grotesque',sans-serif);letter-spacing:-.01em}
.gv-h span{font-size:13px;color:var(--muted,#6f7a76)}
.gv-st{flex:none;font-size:12px;font-weight:600;padding:3px 9px;border-radius:999px;background:var(--info-bg,#e8f0f5);color:var(--info,#3d6b8c)}
.gv-st.gv-fim{background:#eef1ec;color:var(--sage,#6b857a)}
.gv-total{display:flex;justify-content:space-between;align-items:baseline;padding:10px 12px;border:1px solid var(--line,#e6e3da);border-radius:var(--r-ctl,10px);margin-bottom:12px}
.gv-total small{color:var(--muted,#6f7a76);font-size:13px}.gv-total b{font:700 19px var(--font-title,'Bricolage Grotesque',sans-serif);font-variant-numeric:tabular-nums}
.gv-g{font-size:12px;font-weight:600;color:var(--sage,#6b857a);margin:14px 0 4px;text-transform:none}
.gv-l{border:1px solid var(--line,#e6e3da);border-radius:var(--r-card,14px);background:var(--card,#fff);overflow:hidden}
.gv-r{display:flex;align-items:center;gap:10px;padding:11px 12px;border-bottom:1px solid var(--line,#e6e3da);width:100%;background:none;border-left:0;border-right:0;border-top:0;font:inherit;color:inherit;text-align:left}
.gv-r:last-child{border-bottom:0}.gv-r.gv-t{cursor:pointer}
.gv-r .gv-tx{flex:1;min-width:0}.gv-r .gv-tx b{display:block;font-weight:600;font-size:15px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gv-r .gv-tx span{display:block;font-size:13px;color:var(--muted,#6f7a76)}
.gv-r .gv-v{flex:none;text-align:right;font-variant-numeric:tabular-nums;font-weight:600}.gv-r .gv-v small{display:block;font-weight:400;font-size:12px;color:var(--muted,#6f7a76)}
.gv-r.gv-x .gv-tx b,.gv-r.gv-x .gv-v{text-decoration:line-through;color:var(--muted,#6f7a76)}
.gv .gv-r .gv-tx .gv-eu{display:inline-block;font-size:11px;font-weight:600;color:var(--pine,#1e3a32);background:var(--tile,#e9ece5);border-radius:999px;padding:1px 7px;margin-left:6px;vertical-align:1px}
.gv-det{padding:4px 12px 12px;border-bottom:1px solid var(--line,#e6e3da);font-size:13px;color:var(--muted,#6f7a76)}
.gv-det div{display:flex;justify-content:space-between;padding:2px 0}
.gv-acts{display:flex;gap:8px;margin:12px 0 4px;flex-wrap:wrap}
.gv-b{flex:1;min-width:140px;height:46px;border-radius:var(--r-ctl,10px);font:600 14px var(--font-body,Inter,sans-serif);cursor:pointer;border:1.5px solid var(--pine,#1e3a32);background:#fff;color:var(--pine,#1e3a32)}
.gv-b.gv-1{background:var(--pine,#1e3a32);color:#fff}.gv-b:disabled{opacity:.45;cursor:default}
.gv-b.gv-s{flex:none;min-width:0;height:34px;padding:0 12px;font-size:13px}
.gv-f{border:1px solid var(--line,#e6e3da);border-radius:var(--r-card,14px);padding:12px;margin:10px 0;background:var(--paper,#f4f3ee)}
.gv-f label{display:block;font-size:12px;font-weight:600;color:var(--sage,#6b857a);margin:8px 0 4px}
.gv-f input,.gv-f select{width:100%;height:44px;padding:0 10px;border:1.5px solid var(--line,#e6e3da);border-radius:var(--r-ctl,10px);font:inherit;font-size:16px;background:#fff;color:inherit}
.gv-row2{display:flex;gap:8px}.gv-row2>div{flex:1}
.gv-chips{display:flex;gap:6px;flex-wrap:wrap;margin:4px 0}
.gv-chip{height:34px;padding:0 12px;border-radius:999px;border:1px solid var(--line,#e6e3da);background:#fff;font:600 13px var(--font-body,Inter,sans-serif);color:var(--pine,#1e3a32);cursor:pointer}
.gv-chip.gv-on{background:var(--pine,#1e3a32);border-color:var(--pine,#1e3a32);color:#fff}
.gv-p{display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--line,#e6e3da)}.gv-p:last-child{border-bottom:0}
.gv-p input[type=checkbox]{width:22px;height:22px;flex:none}.gv-p span{flex:1;min-width:0}
.gv-p input.gv-n{width:96px;flex:none;text-align:right}
.gv-msg{font-size:13px;margin:6px 0;color:var(--muted,#6f7a76)}.gv-msg.gv-err{color:var(--danger,#c1463a)}
.gv-vazio{padding:14px 12px;font-size:14px;color:var(--muted,#6f7a76)}
`;
function garantirCss() {
    if (document.getElementById('gv-css')) return;
    const st = document.createElement('style'); st.id = 'gv-css'; st.textContent = CSS; document.head.appendChild(st);
}

/**
 * Monta o card do rateio.
 * @param {HTMLElement} el
 * @param {object} cfg { dados, modo: 'app'|'link', eu: participante_id (link), categorias: [{codigo, nome}] (só app), acoes: { lancar(d), cancelar(id, motivo) }, aoMudar(resposta) }
 *   acoes.* devolvem a resposta do banco ({ok, mensagem, dados?}). aoMudar recebe a resposta (o link troca os dados; o app recarrega).
 */
export function montarGrupoVisao(el, cfg) {
    garantirCss();
    const st = { form: null, aberto: null, msg: '', erro: false, ...cfg };
    const desenhar = () => { el.innerHTML = html(st); ligar(el, st, desenhar); };
    st.atualizar = (dados) => { st.dados = dados; desenhar(); };
    desenhar();
    return st;
}

function nomeDe(d, id) { return (d.participantes || []).find(p => p.id === id)?.nome || '—'; }
function primeiro(n) { return String(n || '').split(' ')[0]; }

function html(st) {
    const d = st.dados || {}, it = d.item || {}, aberto = d.status === 'aberto', eu = st.eu || null;
    const per = it.inicio ? `${dataBR(it.inicio)}${it.fim ? ' a ' + dataBR(it.fim) : ''}` : '';
    const parts = d.participantes || [];
    const nDesp = (d.lancamentos || []).filter(l => l.tipo === 'despesa' && !l.cancelado).length;
    const saldoTxt = (s) => (s > 0.004 ? `recebe ${moeda(s)}` : s < -0.004 ? `deve ${moeda(-s)}` : 'em dia');
    const balanco = parts.map(p => `<div class="gv-r"><div class="gv-tx"><b>${esc(p.nome)}${p.eu ? '<span class="gv-eu">você</span>' : ''}</b>
        <span>pagou ${moeda(p.pagou)} · parte ${moeda(p.parte)}${num(p.quitou_pago) || num(p.quitou_recebido) ? ` · acertos ${moeda(num(p.quitou_pago) - num(p.quitou_recebido))}` : ''}</span></div>
        <div class="gv-v">${saldoTxt(num(p.saldo))}</div></div>`).join('') || '<div class="gv-vazio">Sem participantes.</div>';
    const agrupar = (d.agrupar || []).map((a, k) => {
        const pode = aberto && (st.modo === 'app' || a.de_id === eu);
        return `<div class="gv-r"><div class="gv-tx"><b>${esc(primeiro(nomeDe(d, a.de_id)))} paga ${esc(primeiro(nomeDe(d, a.para_id)))}</b><span>${esc(nomeDe(d, a.de_id))} → ${esc(nomeDe(d, a.para_id))}</span></div>
            <div class="gv-v">${moeda(a.valor)}</div>${pode ? `<button type="button" class="gv-b gv-s" data-gv-quitar="${k}">Registrar</button>` : ''}</div>`;
    }).join('');
    const linhas = (d.lancamentos || []).map(l => {
        const minha = eu && l.tipo === 'despesa' ? (l.divisao?.itens || []).find(x => x.participante_id === eu) : null;
        const titulo = l.tipo === 'despesa' ? (l.descricao || 'Despesa') : l.tipo === 'quitacao' ? `${primeiro(nomeDe(d, l.pagador_id))} pagou ${primeiro(nomeDe(d, l.para_id))}` : `Ajuste: ${primeiro(nomeDe(d, l.pagador_id))} → ${primeiro(nomeDe(d, l.para_id))}`;
        const sub = l.tipo === 'despesa' ? `${dataBR(l.data)} · pago por ${primeiro(nomeDe(d, l.pagador_id))}${minha ? ` · sua parte ${moeda(minha.valor)}` : ''}`
            : `${dataBR(l.data)}${l.descricao ? ' · ' + esc(l.descricao) : ''}`;
        const det = st.aberto === l.id ? detalhe(st, d, l, aberto, eu) : '';
        return `<button type="button" class="gv-r gv-t${l.cancelado ? ' gv-x' : ''}" data-gv-l="${l.id}"><div class="gv-tx"><b>${esc(titulo)}</b><span>${l.cancelado ? 'Cancelado: ' + esc(l.cancelado_motivo || '') : sub}</span></div>
            <div class="gv-v">${moeda(l.valor)}</div></button>${det}`;
    }).join('') || '<div class="gv-vazio">Nenhum lançamento ainda.</div>';
    return `<div class="gv">
        <div class="gv-h"><div><b>${esc(it.titulo || 'Rateio')}</b><span>${esc(per)}${per ? ' · ' : ''}${parts.length} pessoas</span></div>
            <span class="gv-st${aberto ? '' : ' gv-fim'}">${aberto ? 'Aberto' : 'Fechado'}</span></div>
        <div class="gv-total"><small>Total do rateio · ${nDesp} despesa${nDesp === 1 ? '' : 's'}</small><b>${moeda(d.total)}</b></div>
        ${aberto ? `<div class="gv-acts"><button type="button" class="gv-b gv-1" data-gv-abrir="despesa">Lancei uma despesa</button><button type="button" class="gv-b" data-gv-abrir="quitacao">Paguei alguém</button></div>` : ''}
        ${st.msg ? `<p class="gv-msg${st.erro ? ' gv-err' : ''}">${esc(st.msg)}</p>` : ''}
        ${st.form ? formHtml(st, d) : ''}
        <div class="gv-g">Balanço</div><div class="gv-l">${balanco}</div>
        ${agrupar ? `<div class="gv-g">Agrupar as contas · ${(d.agrupar || []).length} pagamento${(d.agrupar || []).length === 1 ? '' : 's'} para zerar</div><div class="gv-l">${agrupar}</div>` : ''}
        <div class="gv-g">Lançamentos</div><div class="gv-l">${linhas}</div>
        ${aberto ? `<p class="gv-msg">${st.modo === 'link' ? 'Os links valem enquanto o rateio estiver aberto.' : 'Os links de cada pessoa valem enquanto o rateio estiver aberto.'}</p>` : ''}
    </div>`;
}

function detalhe(st, d, l, aberto, eu) {
    const itens = (l.divisao?.itens || []).map(x => `<div><span>${esc(nomeDe(d, x.participante_id))}</span><b>${moeda(x.valor)}</b></div>`).join('');
    const autor = l.lancado_por_participante_id ? nomeDe(d, l.lancado_por_participante_id) : (l.lancado_por_pessoa || '');
    const podeCancelar = aberto && !l.cancelado && (st.modo === 'app' || l.lancado_por_participante_id === eu);
    return `<div class="gv-det">${itens ? `<div style="font-weight:600;color:var(--ink,#17211e)"><span>Divisão (${esc({ igual: 'igual', percentual: '%', cotas: 'cotas', valor: 'valor' }[l.divisao?.modo] || '')})</span><span></span></div>${itens}` : ''}
        ${autor ? `<div><span>Lançado por</span><span>${esc(autor)}</span></div>` : ''}
        ${podeCancelar ? `<div style="gap:8px;margin-top:6px"><input type="text" data-gv-motivo placeholder="Motivo do cancelamento" style="flex:1;height:38px;border:1.5px solid var(--line,#e6e3da);border-radius:8px;padding:0 8px;font:inherit;font-size:15px"><button type="button" class="gv-b gv-s" data-gv-cancelar="${l.id}">Cancelar</button></div>` : ''}</div>`;
}

function formHtml(st, d) {
    const f = st.form, parts = d.participantes || [], eu = st.eu;
    const opts = (sel, excluir) => parts.filter(p => p.id !== excluir).map(p => `<option value="${p.id}"${p.id === sel ? ' selected' : ''}>${esc(p.nome)}</option>`).join('');
    if (f.tipo === 'quitacao') {
        return `<div class="gv-f" data-gv-form>
            <b>Paguei alguém</b>
            ${st.modo === 'app' ? `<label>Quem pagou</label><select data-gv-de>${opts(f.de, null)}</select>` : ''}
            <label>Para quem</label><select data-gv-para>${opts(f.para, st.modo === 'app' ? f.de : eu)}</select>
            <div class="gv-row2"><div><label>Valor (R$)</label><input type="number" inputmode="decimal" step="0.01" min="0" data-gv-valor value="${f.valor || ''}"></div>
            <div><label>Data</label><input type="date" data-gv-data value="${f.data || hojeISO()}"></div></div>
            <label>Observação (opcional)</label><input type="text" data-gv-desc value="${esc(f.descricao || '')}" placeholder="Pix, dinheiro…">
            <div class="gv-acts"><button type="button" class="gv-b" data-gv-fechar>Voltar</button><button type="button" class="gv-b gv-1" data-gv-enviar>Registrar pagamento</button></div></div>`;
    }
    const modo = f.modo || 'igual';
    const campo = (p) => {
        const v = f.itens?.[p.id];
        if (modo === 'igual') return '';
        const k = modo === 'percentual' ? 'percentual' : modo === 'cotas' ? 'cotas' : 'valor';
        return `<input class="gv-n" type="number" inputmode="decimal" step="0.01" min="0" data-gv-q="${p.id}" value="${v?.[k] ?? ''}" placeholder="${modo === 'percentual' ? '%' : modo === 'cotas' ? 'cotas' : 'R$'}">`;
    };
    return `<div class="gv-f" data-gv-form>
        <b>Lancei uma despesa</b>
        <label>Descrição</label><input type="text" data-gv-desc value="${esc(f.descricao || '')}" placeholder="Jantar, mercado, hospedagem…">
        <div class="gv-row2"><div><label>Valor (R$)</label><input type="number" inputmode="decimal" step="0.01" min="0" data-gv-valor value="${f.valor || ''}"></div>
        <div><label>Data</label><input type="date" data-gv-data value="${f.data || hojeISO()}"></div></div>
        ${st.modo === 'app' ? `<label>Quem pagou</label><select data-gv-pag>${opts(f.pagador, null)}</select>` : ''}
        ${(st.categorias || []).length ? `<label>Categoria (opcional, ajuda no fechamento)</label><select data-gv-cat><option value="">—</option>${st.categorias.map(c => `<option value="${esc(c.codigo)}"${c.codigo === f.categoria ? ' selected' : ''}>${esc(c.nome)}</option>`).join('')}</select>` : ''}
        <label>Dividir</label>
        <div class="gv-chips">${[['igual', 'Igual'], ['percentual', '%'], ['cotas', 'Cotas'], ['valor', 'Valor']].map(([m, t]) => `<button type="button" class="gv-chip${modo === m ? ' gv-on' : ''}" data-gv-modo="${m}">${t}</button>`).join('')}</div>
        <div>${parts.map(p => `<div class="gv-p"><input type="checkbox" data-gv-in="${p.id}"${f.itens?.[p.id] ? ' checked' : ''}><span>${esc(p.nome)}${p.eu ? ' (você)' : ''}</span>${f.itens?.[p.id] ? campo(p) : ''}</div>`).join('')}</div>
        <p class="gv-msg" data-gv-soma></p>
        <div class="gv-acts"><button type="button" class="gv-b" data-gv-fechar>Voltar</button><button type="button" class="gv-b gv-1" data-gv-enviar>Lançar</button></div></div>`;
}

function lerForm(el, st) {
    const f = st.form, q = (s) => el.querySelector(s);
    if (q('[data-gv-desc]')) f.descricao = q('[data-gv-desc]').value;
    if (q('[data-gv-valor]')) f.valor = q('[data-gv-valor]').value;
    if (q('[data-gv-data]')) f.data = q('[data-gv-data]').value;
    if (q('[data-gv-pag]')) f.pagador = q('[data-gv-pag]').value;
    if (q('[data-gv-cat]')) f.categoria = q('[data-gv-cat]').value;
    if (q('[data-gv-de]')) f.de = q('[data-gv-de]').value;
    if (q('[data-gv-para]')) f.para = q('[data-gv-para]').value;
    el.querySelectorAll('[data-gv-q]').forEach(i => {
        const k = f.modo === 'percentual' ? 'percentual' : f.modo === 'cotas' ? 'cotas' : 'valor';
        f.itens[i.dataset.gvQ] = { [k]: i.value };
    });
}

function somaTexto(st) {
    const f = st.form; if (!f || f.tipo !== 'despesa') return '';
    const ids = Object.keys(f.itens || {}); const total = r2(String(f.valor || '').replace(',', '.'));
    if (!ids.length) return 'Marque quem divide.';
    if (f.modo === 'igual') return total > 0 ? `${ids.length} pessoas · ${moeda(total / ids.length)} cada` : `${ids.length} pessoas`;
    if (f.modo === 'percentual') { const s = ids.reduce((t, k) => t + num(f.itens[k].percentual), 0); return `Soma ${r2(s).toLocaleString('pt-BR')}%${Math.abs(s - 100) < 0.01 ? '' : ' · precisa dar 100%'}`; }
    if (f.modo === 'cotas') { const s = ids.reduce((t, k) => t + num(f.itens[k].cotas), 0); return `${s} cotas`; }
    const s = ids.reduce((t, k) => t + num(f.itens[k].valor), 0); return `Soma ${moeda(s)}${Math.abs(s - total) < 0.01 ? '' : ` · precisa dar ${moeda(total)}`}`;
}

function ligar(el, st, desenhar) {
    const d = st.dados || {};
    el.querySelectorAll('[data-gv-abrir]').forEach(b => b.addEventListener('click', () => {
        const tipo = b.dataset.gvAbrir;
        const outros = (d.participantes || []).filter(p => p.id !== st.eu);
        st.form = tipo === 'despesa'
            ? { tipo, modo: 'igual', pagador: st.eu || (d.participantes || [])[0]?.id, itens: Object.fromEntries((d.participantes || []).map(p => [p.id, {}])), data: hojeISO() }
            : { tipo, de: st.eu || (d.participantes || [])[0]?.id, para: outros[0]?.id, data: hojeISO() };
        st.msg = ''; desenhar();
    }));
    el.querySelectorAll('[data-gv-quitar]').forEach(b => b.addEventListener('click', () => {
        const a = (d.agrupar || [])[Number(b.dataset.gvQuitar)]; if (!a) return;
        st.form = { tipo: 'quitacao', de: a.de_id, para: a.para_id, valor: a.valor, data: hojeISO() }; st.msg = ''; desenhar();
        el.querySelector('[data-gv-form]')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }));
    el.querySelectorAll('[data-gv-l]').forEach(b => b.addEventListener('click', () => { st.aberto = st.aberto === b.dataset.gvL ? null : b.dataset.gvL; desenhar(); }));
    el.querySelectorAll('[data-gv-cancelar]').forEach(b => b.addEventListener('click', async (ev) => {
        ev.stopPropagation();
        const motivo = (el.querySelector('[data-gv-motivo]')?.value || '').trim();
        if (!motivo) { st.msg = 'Diga o motivo do cancelamento.'; st.erro = true; desenhar(); return; }
        b.disabled = true;
        const r = await st.acoes.cancelar(b.dataset.gvCancelar, motivo);
        st.msg = r?.mensagem || ''; st.erro = !r?.ok; st.aberto = null;
        if (r?.ok) st.aoMudar?.(r); else desenhar();
    }));
    const form = el.querySelector('[data-gv-form]');
    if (!form) return;
    const somaEl = form.querySelector('[data-gv-soma]'); if (somaEl) somaEl.textContent = somaTexto(st);
    form.querySelectorAll('input').forEach(i => i.addEventListener('input', () => { lerForm(el, st); if (somaEl) somaEl.textContent = somaTexto(st); }));
    form.querySelector('[data-gv-de]')?.addEventListener('change', () => { lerForm(el, st); if (st.form.para === st.form.de) st.form.para = (d.participantes || []).find(p => p.id !== st.form.de)?.id; desenhar(); });
    form.querySelectorAll('[data-gv-modo]').forEach(b => b.addEventListener('click', () => { lerForm(el, st); st.form.modo = b.dataset.gvModo; Object.keys(st.form.itens).forEach(k => { st.form.itens[k] = {}; }); desenhar(); }));
    form.querySelectorAll('[data-gv-in]').forEach(c => c.addEventListener('change', () => { lerForm(el, st); if (c.checked) st.form.itens[c.dataset.gvIn] = {}; else delete st.form.itens[c.dataset.gvIn]; desenhar(); }));
    form.querySelector('[data-gv-fechar]')?.addEventListener('click', () => { st.form = null; st.msg = ''; desenhar(); });
    form.querySelector('[data-gv-enviar]')?.addEventListener('click', async (ev) => {
        lerForm(el, st);
        const f = st.form, valor = r2(String(f.valor || '').replace(',', '.'));
        if (!(valor > 0)) { st.msg = 'Informe o valor.'; st.erro = true; desenhar(); return; }
        let dados;
        if (f.tipo === 'despesa') {
            const ids = Object.keys(f.itens || {});
            if (!ids.length) { st.msg = 'Marque quem divide.'; st.erro = true; desenhar(); return; }
            const k = f.modo === 'percentual' ? 'percentual' : f.modo === 'cotas' ? 'cotas' : 'valor';
            dados = { tipo: 'despesa', descricao: (f.descricao || '').trim(), valor, data: f.data || hojeISO(), pagador_id: f.pagador || st.eu, categoria: f.categoria || null,
                divisao: { modo: f.modo, itens: ids.map(id => (f.modo === 'igual' ? { participante_id: id } : { participante_id: id, [k]: num(String(f.itens[id][k] || '').replace(',', '.')) })) } };
        } else {
            dados = { tipo: 'quitacao', descricao: (f.descricao || '').trim(), valor, data: f.data || hojeISO(), pagador_id: f.de || st.eu, para_id: f.para };
        }
        ev.currentTarget.disabled = true;
        const r = await st.acoes.lancar(dados);
        st.msg = r?.mensagem || (r?.ok ? 'Lançado.' : 'Não foi possível lançar.'); st.erro = !r?.ok;
        if (r?.ok) { st.form = null; st.aoMudar?.(r); } else desenhar();
    });
}
