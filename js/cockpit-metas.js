// =====================================================================
// RAIZ PATRIMÔNIO — js/cockpit-metas.js
// VERSÃO: Beta v1.0.0 (18/10/2026 — demanda 63649288)
// LINHAS: (ver versoes.json)
// -----------------------------------------------------------------
// NOVIDADES (Beta v1.0.0) (18/10/2026, sessão 20261018-2336-usos-lotes, demanda 63649288; FICHA_COCKPIT_METAS_RELATORIO_RAIZ
//   v1.0.0 e PROTOTIPO_COCKPIT_METAS_RELATORIO_RAIZ v1.0.0, tela 2, de acordo do Nicola 18/10 23:36) — cockpit C1, Metas do ano:
//   — Sheet "Metas de <ano> · <ramo>": uma linha por grupo de resultado (receita e cada grupo de despesa) com o real do ano
//     anterior e o do ano ao lado. Atalhos: Copiar do ano anterior, +N% sobre o ano anterior e Limpar.
//   — Ano inteiro (a tela compara com o proporcional aos meses que passaram) ou Mês a mês (12 valores por grupo).
//   — Em Todo o patrimônio, escolhe primeiro o ramo (ou Geral · sem ativo).
//   — Banco: fn_ramo_metas (leitura), fn_ramo_metas_sugerir (proposta) e fn_ramo_metas_salvar (grava e registra o log).
//     Sem o código resultados.metas, o sheet abre só para ler, com o motivo.
// -----------------------------------------------------------------
export const VERSAO = '1.0.0';

const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const esc = t => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const moeda = v => (typeof formatarMoedaBR === 'function' ? formatarMoedaBR(Number(v) || 0, { semCentavos: true }) : 'R$ ' + Math.round(Number(v) || 0));
const toast = (m, t) => { if (typeof mostrarToast === 'function') mostrarToast(m, t); };

// "360.000" · "360.000,50" · "360000" → número; vazio → null
function lerValor(txt) {
    const s = String(txt ?? '').replace(/[^\d,.-]/g, '').trim();
    if (!s) return null;
    const n = Number(s.includes(',') ? s.replace(/\./g, '').replace(',', '.') : s.replace(/\./g, ''));
    return Number.isFinite(n) && n >= 0 ? n : null;
}
const mostrarValor = v => v == null || v === '' ? '' : Number(v).toLocaleString('pt-BR', { maximumFractionDigits: 2 });

// Entrada. ramo: código do ramo, 'geral' ou null (Todo o patrimônio: escolhe o ramo antes).
// ramos: [{ codigo, nome, meta }] (de fn_hoje_por_ramo) para a escolha. aoSalvar: redesenhar o Hoje.
export function abrirMetasDoAno({ ano, ramo = null, ramoNome = '', ramos = [], aoSalvar } = {}) {
    if (!ano) ano = new Date().getFullYear();
    if (ramo) return abrirFormMetas({ ano, ramo, ramoNome, aoSalvar });
    const lista = [...(ramos || []).map(r => ({ codigo: r.codigo, nome: r.nome, meta: r.meta })), { codigo: 'geral', nome: 'Geral · sem ativo', meta: null }];
    window.abrirSheetAcoes({
        titulo: `Metas de ${ano}`, sub: 'De qual ramo?',
        acoes: lista.map(r => ({
            icone: r.codigo === 'geral' ? 'landmark' : 'target', titulo: r.nome,
            sub: r.meta ? `meta ${moeda(r.meta.ano)} no ano` : 'sem meta',
            aoTocar: () => abrirFormMetas({ ano, ramo: r.codigo, ramoNome: r.nome, aoSalvar }),
        })),
    });
}

async function abrirFormMetas({ ano, ramo, ramoNome, aoSalvar }) {
    const { data, error } = await dbAuth.rpc('fn_ramo_metas', { p_cliente_id: CLIENTE_ID_SUPABASE, p_ano: ano, p_ramo: ramo });
    if (error) { toast('Não deu para abrir as metas', 'danger'); console.warn('[metas]', error.message); return; }
    const d = data || {};
    const est = {
        modo: d.modo || 'ano',
        pode: d.pode_editar === true,
        grupos: (d.grupos || []).map(g => ({
            ...g,
            ano_v: g.meta_ano != null ? Number(g.meta_ano) : null,
            meses: Array.isArray(g.meses) ? g.meses.map(x => x == null ? null : Number(x)) : Array(12).fill(null),
        })),
        mostrarOutros: false,
    };
    const titulo = `Metas de ${ano} · ${ramoNome || (ramo === 'geral' ? 'Geral' : ramo)}`;
    window.abrirSheetForm({
        titulo,
        sub: est.pode ? 'Por grupo. A tela compara com o proporcional aos meses que passaram.' : (d.motivo || 'Só leitura.'),
        rotuloSalvar: 'Salvar metas',
        semRodape: !est.pode,
        corpo: el => { el._est = est; el._ramo = ramo; desenhar(el, est, ano); },
        aoSalvar: async el => {
            const e = el._est; lerTela(el, e);
            const linhas = e.grupos
                .filter(g => e.modo === 'ano' ? g.ano_v != null : g.meses.some(x => x != null))
                .map(g => e.modo === 'ano' ? { grupo_codigo: g.codigo, valor: g.ano_v } : { grupo_codigo: g.codigo, meses: g.meses });
            const r = await dbAuth.rpc('fn_ramo_metas_salvar', { p_cliente_id: CLIENTE_ID_SUPABASE, p_ano: ano, p_ramo: ramo, p_linhas: linhas, p_modo: e.modo });
            if (r.error) { toast(typeof rzMensagemDeErro === 'function' ? (rzMensagemDeErro(r.error.message) || 'Não deu para salvar') : 'Não deu para salvar', 'danger'); return false; }
            toast(linhas.length ? 'Metas salvas' : 'Metas limpas');
            if (typeof aoSalvar === 'function') aoSalvar();
            return true;
        },
    });
}

// meta do grupo no ano (ano inteiro ou soma dos meses)
const totalGrupo = (g, modo) => modo === 'ano' ? (g.ano_v || 0) : g.meses.reduce((s, x) => s + (Number(x) || 0), 0);

function resultadoMeta(est) {
    return est.grupos.reduce((s, g) => s + (g.direcao === 'entrada' ? 1 : -1) * totalGrupo(g, est.modo), 0);
}

function lerTela(el, est) {
    est.grupos.forEach(g => {
        if (est.modo === 'ano') {
            const i = el.querySelector(`[data-mt-ano="${g.codigo}"]`);
            if (i) g.ano_v = lerValor(i.value);
        } else {
            for (let m = 0; m < 12; m++) {
                const i = el.querySelector(`[data-mt-mes="${g.codigo}:${m}"]`);
                if (i) g.meses[m] = lerValor(i.value);
            }
        }
    });
}

function linhaGrupo(g, est, ano) {
    const ref = `${ano - 1}: ${moeda(g.anterior)}${Number(g.real) ? ` · ${ano}: ${moeda(g.real)}` : ''}`;
    const dis = est.pode ? '' : ' disabled';
    const tom = g.direcao === 'entrada' ? 'receita' : 'despesa';
    if (est.modo === 'ano') {
        return `<div class="rz-mt-g"><div class="rz-mt-tx"><b>${esc(g.nome)}</b><small>${tom} · ${esc(ref)}</small></div>
            <input inputmode="decimal" aria-label="Meta de ${esc(g.nome)}" data-mt-ano="${esc(g.codigo)}" value="${esc(mostrarValor(g.ano_v))}" placeholder="0"${dis}></div>`;
    }
    const meses = g.meses.map((v, m) => `<label><span>${MESES[m]}</span><input inputmode="decimal" aria-label="${esc(g.nome)} em ${MESES[m]}" data-mt-mes="${esc(g.codigo)}:${m}" value="${esc(mostrarValor(v))}" placeholder="0"${dis}></label>`).join('');
    return `<div class="rz-mt-g rz-mt-g-mes"><div class="rz-mt-tx"><b>${esc(g.nome)}</b><small>${tom} · ${esc(ref)} · total ${moeda(totalGrupo(g, 'mes'))}</small></div>
        <div class="rz-mt-meses">${meses}</div></div>`;
}

function desenhar(el, est, ano) {
    const usados = est.grupos.filter(g => g.usado || totalGrupo(g, est.modo) > 0);
    const outros = est.grupos.filter(g => !usados.includes(g));
    const atalhos = est.pode ? `<div class="rz-mt-at">
            <button type="button" class="rz-btn rz-btn-2" data-mt-acao="copiar">Copiar de ${ano - 1}</button>
            <span class="rz-mt-pct"><input inputmode="decimal" aria-label="Percentual sobre ${ano - 1}" data-mt-pct value="5">
            <button type="button" class="rz-btn rz-btn-2" data-mt-acao="pct">% sobre ${ano - 1}</button></span>
            <button type="button" class="rz-btn rz-btn-2" data-mt-acao="limpar">Limpar</button></div>` : '';
    const seg = `<div class="rz-seg" role="group" aria-label="Como definir">
            <button type="button" class="${est.modo === 'ano' ? 'rz-on' : ''}" data-mt-modo="ano"${est.pode ? '' : ' disabled'}>Ano inteiro</button>
            <button type="button" class="${est.modo === 'mes' ? 'rz-on' : ''}" data-mt-modo="mes"${est.pode ? '' : ' disabled'}>Mês a mês</button></div>`;
    const res = resultadoMeta(est);
    el.innerHTML = `${atalhos}${seg}
        ${usados.length ? usados.map(g => linhaGrupo(g, est, ano)).join('') : '<p class="rz-desc">O ramo não teve receita nem despesa em ' + (ano - 1) + '. Escolha os grupos em "+ outro grupo".</p>'}
        ${outros.length ? (est.mostrarOutros ? outros.map(g => linhaGrupo(g, est, ano)).join('')
            : `<button type="button" class="rz-btn rz-btn-2 rz-mt-mais" data-mt-acao="outros"${est.pode ? '' : ' disabled'}>+ outro grupo (${outros.length})</button>`) : ''}
        <div class="rz-mt-g rz-mt-tot"><div class="rz-mt-tx"><b>Resultado da meta</b><small>receitas − despesas, no ano</small></div><b data-mt-res class="${res < 0 ? 'rz-neg' : ''}">${moeda(res)}</b></div>
        ${est.modo === 'mes' ? '<p class="rz-desc">Trocar de modo deixa os valores do outro modo sem efeito (eles não se perdem até você salvar).</p>' : ''}`;
    ligar(el, est, ano);
}

function ligar(el, est, ano) {
    const atualizarTotal = () => {
        lerTela(el, est);
        const res = resultadoMeta(est);
        const b = el.querySelector('[data-mt-res]');
        if (b) { b.textContent = moeda(res); b.classList.toggle('rz-neg', res < 0); }
    };
    el.querySelectorAll('[data-mt-ano],[data-mt-mes]').forEach(i => i.addEventListener('input', atualizarTotal));
    el.querySelectorAll('[data-mt-modo]').forEach(b => b.addEventListener('click', () => {
        lerTela(el, est);
        const novo = b.dataset.mtModo;
        if (novo === est.modo) return;
        // passar de um modo para o outro leva o total: ano → 12 partes iguais; mês → soma
        est.grupos.forEach(g => {
            if (novo === 'mes' && g.ano_v != null && !g.meses.some(x => x != null)) g.meses = Array(12).fill(Math.round(g.ano_v / 12 * 100) / 100);
            if (novo === 'ano' && g.ano_v == null && g.meses.some(x => x != null)) g.ano_v = totalGrupo(g, 'mes');
        });
        est.modo = novo;
        desenhar(el, est, ano);
    }));
    const pctIn = el.querySelector('[data-mt-pct]');
    el.querySelectorAll('[data-mt-acao]').forEach(b => b.addEventListener('click', async () => {
        const acao = b.dataset.mtAcao;
        lerTela(el, est);
        if (acao === 'outros') { est.mostrarOutros = true; desenhar(el, est, ano); return; }
        if (acao === 'limpar') {
            est.grupos.forEach(g => { g.ano_v = null; g.meses = Array(12).fill(null); });
            desenhar(el, est, ano); return;
        }
        const pct = acao === 'pct' ? (lerValor(pctIn?.value) ?? 0) : 0;
        b.disabled = true;
        const { data, error } = await dbAuth.rpc('fn_ramo_metas_sugerir', { p_cliente_id: CLIENTE_ID_SUPABASE, p_ano: ano, p_ramo: el._ramo || null, p_pct: pct });
        b.disabled = false;
        if (error) { toast('Não deu para calcular', 'danger'); return; }
        const prop = Array.isArray(data) ? data : [];
        if (!prop.length) { toast(`Sem valores em ${ano - 1} para copiar`); return; }
        est.grupos.forEach(g => {
            const p = prop.find(x => x.grupo_codigo === g.codigo);
            const v = p ? Number(p.valor) : null;
            g.ano_v = v; g.meses = v == null ? Array(12).fill(null) : Array(12).fill(Math.round(v / 12 * 100) / 100);
        });
        desenhar(el, est, ano);
    }));
}
