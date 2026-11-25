// ============================================================================
// js/nucleo/campos.js — Raiz Patrimônio · campos montados por catálogo (formulário e leitura)
// Versão: 1.0.0 · 25/11/2026
//
// v1.0.0 (25/11/2026, sessão 20261125-1954-investimentos-i1-2, demanda 09dff31b; FICHA_F10_CATALOGO_CAMPOS_CONTRATO_RAIZ v1.0.0,
// fase 1, de acordo do Nicola 25/11 19:54 "F10 ok") — criação. Desenha, liga e lê os campos de um catálogo (hoje o de contratos,
// contrato_tipos_campos; os ativos passam a usar este mesmo módulo na fase 2 da F10). Cada campo traz chave, label, tipo_dado
// (text, number, date, lista, moeda, percentual, dia, parte, oculto), destino (coluna:<nome> ou dados:<chave>), obrigatorio,
// opcoes (jsonb) e ajuda (o texto do "i"). Regras das opcoes: placeholder, max, min, inteiro, padrao, itens [[valor, rótulo]],
// mostrar_se {chave: valor} (+ obrigatorio_se_visivel), depois_de <chave>, max "hoje", so_criacao (só no Novo), so_formulario
// (não aparece em Condições), sufixo/prefixo e ate_desde <chave> (texto em Condições), valor/texto (oculto), papel, papeis_lista,
// doc_destino, rotulo_doc, novo e padrao_nome (parte).
// ============================================================================
export const VERSAO = '1.0.0';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const hojeIso = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const dataBR = (d) => (d ? String(d).slice(0, 10).split('-').reverse().join('/') : '—');
const moedaBR = (v) => (typeof formatarMoedaBR === 'function' ? formatarMoedaBR(Number(v || 0)) : 'R$ ' + Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
const num = (v) => { const s = String(v ?? '').trim().replace(/\s/g, ''); if (!s) return null; const n = Number(s.includes(',') ? s.replace(/\./g, '').replace(',', '.') : s); return Number.isFinite(n) ? n : null; };
const op = (c) => c.opcoes || {};

// Junta as linhas do modelo com as do tipo: a do tipo substitui a do modelo pela chave; ativo = false esconde.
export function mesclarCatalogo(linhas, tipo) {
    const porChave = new Map();
    (linhas || []).filter(l => !l.tipo_contrato).forEach(l => porChave.set(l.chave, l));
    (linhas || []).filter(l => l.tipo_contrato === tipo).forEach(l => porChave.set(l.chave, l));
    return [...porChave.values()].filter(l => l.ativo !== false).sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
}

// Valor atual de um campo numa linha (contrato): coluna:x → row[x]; dados:y → row.dados_modelo[y]
export function valorDoCampo(c, row) {
    const [onde, nome] = String(c.destino).split(':');
    return onde === 'coluna' ? row?.[nome] : (row?.dados_modelo || {})[nome];
}

const id = (prefixo, c) => `${prefixo}${c.chave}`;
const visivelPor = (c) => (op(c).mostrar_se ? Object.entries(op(c).mostrar_se) : null);

// HTML do formulário. ctx: { novo, prefixo, row, partes: {usados, outras}, infoBtn: (campo) => html }
export function camposHtml(campos, ctx = {}) {
    const p = ctx.prefixo || 'cc-';
    const row = ctx.row || {};
    const vis = (c) => {
        const cond = visivelPor(c); if (!cond) return true;
        return cond.every(([k, v]) => {
            const ref = campos.find(x => x.chave === k);
            const atual = ref ? (valorDoCampo(ref, row) ?? op(ref).padrao) : null;
            return String(atual ?? '') === String(v);
        });
    };
    return campos.filter(c => !(op(c).so_criacao && !ctx.novo) && c.tipo_dado !== 'oculto').map(c => {
        const o = op(c), cid = id(p, c);
        const atual = valorDoCampo(c, row);
        const val = atual ?? (ctx.novo ? o.padrao : null);
        const rot = `${esc(c.label)}${c.obrigatorio || o.obrigatorio_se_visivel ? ' <i>*</i>' : ''}${ctx.infoBtn && c.ajuda ? ' ' + ctx.infoBtn(c) : ''}`;
        let ctl = '';
        switch (c.tipo_dado) {
            case 'lista':
                ctl = `<select id="${cid}" data-cc-chave="${esc(c.chave)}">${(o.itens || []).map(([k, r]) => `<option value="${esc(k)}"${String(k) === String(val ?? '') ? ' selected' : ''}>${esc(r)}</option>`).join('')}</select>`;
                break;
            case 'date':
                ctl = `<input type="date" id="${cid}" data-cc-chave="${esc(c.chave)}"${o.max === 'hoje' ? ` max="${hojeIso()}"` : ''} value="${esc(val ? String(val).slice(0, 10) : (ctx.novo && c.chave === 'inicio' ? hojeIso() : ''))}">`;
                break;
            case 'moeda': case 'number': case 'percentual': case 'dia':
                ctl = `<input type="number" id="${cid}" data-cc-chave="${esc(c.chave)}" step="${c.tipo_dado === 'number' && o.inteiro || c.tipo_dado === 'dia' ? '1' : '0.01'}"${o.min != null ? ` min="${o.min}"` : ' min="0"'}${o.max != null && o.max !== 'hoje' ? ` max="${o.max}"` : ''} inputmode="decimal"${o.placeholder ? ` placeholder="${esc(o.placeholder)}"` : ''} value="${val != null && val !== '' ? esc(val) : ''}">`;
                break;
            case 'parte': {
                const pts = ctx.partes || { usados: [], outras: [] };
                const todas = [...pts.usados, ...pts.outras];
                const atualNome = String(val || o.padrao_nome || '').toLowerCase();
                const achada = atualNome ? todas.find(x => String(x.nome).toLowerCase() === atualNome) : null;
                const escolha = achada ? achada.id : (atualNome || !todas.length) ? '__nova__' : '';
                const opt = (x) => `<option value="${esc(x.id)}"${x.id === escolha ? ' selected' : ''}>${esc(x.nome)}</option>`;
                ctl = `<select id="${cid}" data-cc-chave="${esc(c.chave)}" data-cc-parte>${['<option value="">— escolher —</option>',
                    pts.usados.length ? `<optgroup label="Já usados">${pts.usados.map(opt).join('')}</optgroup>` : '',
                    pts.outras.length ? `<optgroup label="Outras partes da empresa">${pts.outras.map(opt).join('')}</optgroup>` : '',
                    `<option value="__nova__"${escolha === '__nova__' ? ' selected' : ''}>+ Cadastrar ${esc(o.novo || 'novo')}</option>`].join('')}</select>
                    <p class="rz-desc hidden" id="${cid}-info"></p>
                    <div class="rz-f2${escolha === '__nova__' ? '' : ' hidden'}" id="${cid}-nova"><div class="rz-f"><label for="${cid}-nome">Nome</label><input type="text" id="${cid}-nome" maxlength="80" value="${esc(achada ? '' : (val || o.padrao_nome || ''))}"></div>
                    <div class="rz-f"><label for="${cid}-doc">${esc(o.rotulo_doc || 'CNPJ')}</label><input type="text" id="${cid}-doc" inputmode="numeric" maxlength="18" placeholder="00.000.000/0000-00" value="${esc(achada ? '' : ((row.dados_modelo || {})[String(o.doc_destino || '').split(':')[1]] || ''))}"></div></div>`;
                break;
            }
            default:
                ctl = `<input type="text" id="${cid}" data-cc-chave="${esc(c.chave)}"${o.max ? ` maxlength="${o.max}"` : ''}${o.placeholder ? ` placeholder="${esc(o.placeholder)}"` : ''} value="${esc(val ?? '')}">`;
        }
        return `<div class="rz-f${vis(c) ? '' : ' hidden'}" data-cc-campo="${esc(c.chave)}"><label for="${cid}">${rot}</label>${ctl}</div>`;
    }).join('');
}

// Liga mostrar_se e o seletor de parte. Chamar depois que o formulário estiver na tela.
export function ligarCampos(raiz, campos, ctx = {}) {
    const p = ctx.prefixo || 'cc-';
    const pts = ctx.partes || { usados: [], outras: [] }, todas = [...pts.usados, ...pts.outras];
    const atualizar = () => {
        campos.forEach(c => {
            const cond = visivelPor(c); if (!cond) return;
            const ok = cond.every(([k, v]) => String(raiz.querySelector(`#${p}${k}`)?.value ?? '') === String(v));
            raiz.querySelector(`[data-cc-campo="${c.chave}"]`)?.classList.toggle('hidden', !ok);
        });
    };
    campos.forEach(c => raiz.querySelector(`#${id(p, c)}`)?.addEventListener('change', atualizar));
    campos.filter(c => c.tipo_dado === 'parte').forEach(c => {
        const sel = raiz.querySelector(`#${id(p, c)}`); if (!sel) return;
        const mostrar = () => {
            const v = sel.value, pt = todas.find(x => x.id === v);
            raiz.querySelector(`#${id(p, c)}-nova`)?.classList.toggle('hidden', v !== '__nova__');
            const info = raiz.querySelector(`#${id(p, c)}-info`);
            if (info) { info.classList.toggle('hidden', !pt); info.textContent = pt ? (pt.documento ? `${op(c).rotulo_doc || 'CNPJ'} ${pt.documento} · do cadastro` : 'Sem documento no cadastro: complete em Partes.') : ''; }
        };
        sel.addEventListener('change', mostrar); mostrar();
    });
    atualizar();
}

// Lê e valida. Devolve { ok, erro, colunas: {}, dados: {}, parte: { campo, id, nome, doc } | null }
export function lerCampos(raiz, campos, ctx = {}) {
    const p = ctx.prefixo || 'cc-';
    const pts = ctx.partes || { usados: [], outras: [] }, todas = [...pts.usados, ...pts.outras];
    const colunas = {}, dados = {};
    let parte = null;
    const grava = (destino, v) => { const [onde, nome] = String(destino).split(':'); if (onde === 'coluna') colunas[nome] = v; else dados[nome] = v; };
    const lido = {};
    for (const c of campos) {
        const o = op(c);
        if (c.tipo_dado === 'oculto') { if (o.valor !== undefined) grava(c.destino, o.valor); continue; }
        if (o.so_criacao && !ctx.novo) continue;
        const caixa = raiz.querySelector(`[data-cc-campo="${c.chave}"]`);
        const visivel = caixa && !caixa.classList.contains('hidden');
        const el = raiz.querySelector(`#${id(p, c)}`);
        if (!el) continue;
        const obrig = c.obrigatorio || (o.obrigatorio_se_visivel && visivel);
        if (!visivel) { if (visivelPor(c)) grava(c.destino, null); continue; }
        let v = String(el.value ?? '').trim();
        if (c.tipo_dado === 'parte') {
            if (!v) { if (obrig) return { ok: false, erro: `Escolha ${c.label.toLowerCase()} ou cadastre.` }; continue; }
            const pt = todas.find(x => x.id === v);
            const nome = pt ? pt.nome : String(raiz.querySelector(`#${id(p, c)}-nome`)?.value || '').trim();
            const doc = pt ? (pt.documento || '') : String(raiz.querySelector(`#${id(p, c)}-doc`)?.value || '').trim();
            if (!nome) return { ok: false, erro: `Informe o nome (${c.label.toLowerCase()}).` };
            grava(c.destino, nome);
            if (o.doc_destino) grava(o.doc_destino, doc || null);
            parte = { campo: c, id: pt ? pt.id : null, nome, doc, papel: o.papel || null };
            lido[c.chave] = nome;
            continue;
        }
        if (!v) { if (obrig) return { ok: false, erro: `Informe ${c.label.toLowerCase()}.` }; grava(c.destino, null); continue; }
        if (['moeda', 'number', 'percentual', 'dia'].includes(c.tipo_dado)) {
            const n = num(v);
            if (n === null) return { ok: false, erro: `${c.label}: número inválido.` };
            if ((o.inteiro || c.tipo_dado === 'dia') && !Number.isInteger(n)) return { ok: false, erro: `${c.label}: use um número inteiro.` };
            if (o.min != null && n < o.min) return { ok: false, erro: `${c.label}: mínimo ${o.min}.` };
            if (o.max != null && o.max !== 'hoje' && n > o.max) return { ok: false, erro: `${c.label}: máximo ${o.max}.` };
            if (c.tipo_dado === 'moeda' && !(n > 0) && obrig) return { ok: false, erro: `Informe ${c.label.toLowerCase()}.` };
            grava(c.destino, n); lido[c.chave] = n; continue;
        }
        if (c.tipo_dado === 'date') {
            if (o.max === 'hoje' && v > hojeIso()) return { ok: false, erro: `${c.label}: até hoje.` };
            if (o.depois_de && lido[o.depois_de] && v <= lido[o.depois_de]) return { ok: false, erro: `${c.label} precisa ser depois de ${(campos.find(x => x.chave === o.depois_de)?.label || o.depois_de).toLowerCase()}.` };
        }
        grava(c.destino, v); lido[c.chave] = v;
    }
    return { ok: true, colunas, dados, parte };
}

// Texto de cada campo para o card Condições: [{ chave, rotulo, texto, ajuda, cheio }]
export function camposTexto(campos, row) {
    const somaDias = (iso, n) => { const d = new Date(String(iso).slice(0, 10) + 'T12:00:00'); d.setDate(d.getDate() + Number(n || 0)); return d.toISOString().slice(0, 10); };
    return campos.filter(c => !op(c).so_formulario).map(c => {
        const o = op(c);
        let v = valorDoCampo(c, row);
        if (c.tipo_dado === 'oculto') return o.texto ? { chave: c.chave, rotulo: c.label, texto: o.texto, ajuda: c.ajuda } : null;
        if (v === null || v === undefined || v === '') return null;
        let t;
        switch (c.tipo_dado) {
            case 'lista': t = (o.itens || []).find(([k]) => String(k) === String(v))?.[1] || String(v); break;
            case 'date': t = dataBR(v); break;
            case 'moeda': t = moedaBR(v); break;
            case 'percentual': t = Number(v).toLocaleString('pt-BR', { maximumFractionDigits: 2 }); break;
            case 'number': case 'dia': t = Number(v).toLocaleString('pt-BR', { maximumFractionDigits: 2 }); break;
            case 'parte': {
                const doc = o.doc_destino ? valorDoCampo({ destino: o.doc_destino }, row) : null;
                t = [v, doc].filter(Boolean).join(' · ');
                break;
            }
            default: t = String(v);
        }
        if (o.prefixo) t = o.prefixo + t;
        if (o.sufixo) t = t + o.sufixo;
        if (o.ate_desde) { const base = valorDoCampo(campos.find(x => x.chave === o.ate_desde) || { destino: 'coluna:' + o.ate_desde }, row); if (base) t += ` (até ${dataBR(somaDias(base, v))})`; }
        return { chave: c.chave, rotulo: c.label, texto: t, ajuda: c.ajuda, cheio: c.tipo_dado === 'parte' };
    }).filter(Boolean);
}
