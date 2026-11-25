// ============================================================================
// js/contrato-catalogo.js — Raiz Patrimônio · contrato por catálogo (formulário e Condições pelo tipo)
// Versão: 1.0.0 · 25/11/2026
//
// v1.0.0 (25/11/2026, sessão 20261125-1954-investimentos-i1-2, demanda 09dff31b; FICHA_F10_CATALOGO_CAMPOS_CONTRATO_RAIZ v1.0.0,
// fase 1, e PLANO_EXECUCAO_I1_2_APLICACAO_FINANCEIRO_RAIZ v1.1.0 item A; de acordo do Nicola 25/11 19:54 "F10 ok") — criação.
// Para os tipos de contrato com contrato_tipos.formulario = 'catalogo' (hoje os 7 de aplicação): o ⋮ › Editar abre o formulário
// montado por contrato_tipos_campos (js/nucleo/campos.js), e o card Condições mostra os mesmos campos, cada um com o "i" da
// ajuda. Os dados ficam onde já estavam (F10-a): coluna:<nome> em contratos, dados:<chave> em contratos.dados_modelo. O campo
// "parte" (ex.: emissor) escolhe da lista de partes da empresa ou cadastra, e grava o papel do contrato em partes_papeis.
// ============================================================================
import { mesclarCatalogo, camposHtml, ligarCampos, lerCampos, camposTexto } from './nucleo/campos.js';

export const VERSAO = '1.0.0';

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const toast = (m, t) => (typeof mostrarToast === 'function' ? mostrarToast(m, t) : console.log(m));
const db = () => (typeof dbAuth !== 'undefined' ? dbAuth : window.dbAuth);
const icones = () => { if (typeof refrescarIcones === 'function') refrescarIcones(); else if (window.lucide) window.lucide.createIcons(); };

let tiposCache = null;
export async function tiposContrato() {
    if (tiposCache) return tiposCache;
    const { data, error } = await db().from('contrato_tipos').select('codigo, nome, modelo, formulario');
    if (error) throw error;
    tiposCache = data || [];
    return tiposCache;
}
const catalogoCache = new Map();
export async function camposDoTipo(codigo) {
    if (catalogoCache.has(codigo)) return catalogoCache.get(codigo);
    const tipos = await tiposContrato();
    const t = tipos.find(x => x.codigo === codigo);
    if (!t) return [];
    const { data, error } = await db().from('contrato_tipos_campos').select('*').eq('ativo', true)
        .or(`tipo_contrato.eq.${codigo},and(modelo.eq.${t.modelo},tipo_contrato.is.null)`);
    if (error) throw error;
    // a linha do tipo com ativo = false precisa entrar para esconder a do modelo: busca de novo sem o filtro de ativo
    const { data: desl } = await db().from('contrato_tipos_campos').select('*').eq('tipo_contrato', codigo).eq('ativo', false);
    const campos = mesclarCatalogo([...(data || []), ...(desl || [])], codigo);
    catalogoCache.set(codigo, campos);
    return campos;
}

// partes da empresa para o campo "parte": primeiro as que já têm um dos papéis da lista
export async function partesParaCampo(clienteId, papeis = []) {
    const [{ data: pts }, { data: pps }] = await Promise.all([
        db().from('partes').select('id, nome, documento').eq('cliente_id', clienteId).order('nome'),
        papeis.length ? db().from('partes_papeis').select('parte_id').in('papel', papeis).eq('ativo', true) : Promise.resolve({ data: [] }),
    ]);
    const usados = new Set((pps || []).map(x => x.parte_id));
    const l = (pts || []).map(p => ({ ...p, usado: usados.has(p.id) }));
    return { usados: l.filter(p => p.usado), outras: l.filter(p => !p.usado) };
}

// acha a parte pelo documento (ou pelo nome) ou cria
export async function parteGarantir(clienteId, nome, doc) {
    const dig = String(doc || '').replace(/\D/g, '');
    const { data } = dig ? await db().from('partes').select('id, documento').eq('cliente_id', clienteId).not('documento', 'is', null)
        : await db().from('partes').select('id').eq('cliente_id', clienteId).ilike('nome', nome).limit(1);
    const achada = dig ? (data || []).find(p => String(p.documento || '').replace(/\D/g, '') === dig) : (data || [])[0];
    if (achada) return achada.id;
    const { data: nova, error } = await db().from('partes').insert({ cliente_id: clienteId, nome, doc_tipo: dig ? (dig.length > 11 ? 'CNPJ' : 'CPF') : null, documento: dig ? doc : null })
        .select('id').single();
    if (error) throw error;
    return nova.id;
}

// grava o papel do contrato (ex.: emissor): encerra o anterior se mudou
export async function papelDoContratoGravar(contratoId, clienteId, parte) {
    if (!parte?.papel) return;
    const parteId = parte.id || await parteGarantir(clienteId, parte.nome, parte.doc);
    const { data: atuais } = await db().from('partes_papeis').select('id, parte_id').eq('entidade_tipo', 'contrato').eq('entidade_id', contratoId).eq('papel', parte.papel).eq('ativo', true);
    if ((atuais || []).some(x => x.parte_id === parteId)) return;
    for (const x of (atuais || [])) await db().from('partes_papeis').update({ ativo: false, encerrado_em: new Date().toISOString() }).eq('id', x.id);
    const { error } = await db().from('partes_papeis').insert({ parte_id: parteId, papel: parte.papel, entidade_tipo: 'contrato', entidade_id: contratoId, ativo: true });
    if (error) throw error;
}

// botão "i" de um campo (abre a ajuda)
export const infoBtn = (c) => `<button type="button" class="rz-i" data-cc-info="${esc(c.chave)}" aria-label="O que é ${esc(c.label)}?"><svg data-lucide="info"></svg></button>`;
export function ligarInfos(raiz, campos) {
    raiz.querySelectorAll('[data-cc-info]').forEach(b => {
        if (b.dataset.ccLigado) return; b.dataset.ccLigado = '1';
        b.addEventListener('click', (ev) => {
            ev.preventDefault(); ev.stopPropagation();
            const c = campos.find(x => x.chave === b.dataset.ccInfo); if (!c) return;
            if (typeof rzAviso === 'function') rzAviso({ titulo: c.label, linhas: [c.ajuda || ''] }); else toast(c.ajuda || '');
        });
    });
}

// Condições pelo catálogo: devolve o HTML das linhas .rz-kv
export function condicoesHtml(campos, row) {
    return camposTexto(campos, row).map(x => `<div${x.cheio ? ' class="rz-full"' : ''}><small>${esc(x.rotulo)}${x.ajuda ? ' ' + infoBtn({ chave: x.chave, label: x.rotulo }) : ''}</small><b>${esc(x.texto)}</b></div>`).join('');
}

// Formulário de edição pelo catálogo (⋮ › Editar)
export async function abrirEditarContratoCatalogo(contratoId, { aoSalvar } = {}) {
    if (typeof abrirSheetForm !== 'function') { toast('Abra pelo app principal.', 'erro'); return; }
    if (typeof rzMostrarBloqueio === 'function' && rzMostrarBloqueio('contratos.editar')) return;
    const { data: row, error } = await db().from('contratos').select('id, cliente_id, ativo_id, tipo_contrato, modelo, descricao, inicio, fim, valor, status, dados_modelo').eq('id', contratoId).maybeSingle();
    if (error || !row) { toast(error?.message || 'Contrato não encontrado.', 'erro'); return; }
    let campos = [];
    try { campos = await camposDoTipo(row.tipo_contrato); } catch (e) { toast(e?.message || 'Não consegui ler os campos do tipo.', 'erro'); return; }
    const campoParte = campos.find(c => c.tipo_dado === 'parte');
    let partes = { usados: [], outras: [] };
    if (campoParte) { try { partes = await partesParaCampo(row.cliente_id, campoParte.opcoes?.papeis_lista || []); } catch (e) { console.warn('[contrato-catalogo] partes:', e?.message || e); } }
    const tipoNome = (tiposCache || []).find(t => t.codigo === row.tipo_contrato)?.nome || 'Contrato';
    const ctx = { novo: false, prefixo: 'cce-', row, partes, infoBtn };
    abrirSheetForm({
        titulo: row.modelo === 'investimento' ? 'Editar aplicação' : 'Editar contrato', sub: tipoNome,
        corpo: camposHtml(campos, ctx), rotuloSalvar: 'Salvar',
        aoSalvar: async () => {
            const r = lerCampos(document, campos, ctx);
            if (!r.ok) { toast(r.erro, 'erro'); return false; }
            const dados = { ...(row.dados_modelo || {}), ...r.dados };
            Object.keys(dados).forEach(k => { if (dados[k] === null) delete dados[k]; });
            const { error: e1 } = await db().from('contratos').update({ ...r.colunas, dados_modelo: dados }).eq('id', row.id);
            if (e1) { toast(e1.message || 'Não consegui salvar.', 'erro'); return false; }
            try { await papelDoContratoGravar(row.id, row.cliente_id, r.parte); } catch (e) { console.warn('[contrato-catalogo] papel:', e?.message || e); }
            toast('Salvo', 'sucesso');
            try { if (typeof window.carregarContratosSupabase === 'function' && typeof contratos !== 'undefined') contratos = await window.carregarContratosSupabase(); } catch (_) { /* a ficha relê do banco */ } // eslint-disable-line no-global-assign
            if (aoSalvar) aoSalvar(); else if (typeof window.abrirFichaContrato === 'function') window.abrirFichaContrato(row.id);
            return true;
        },
    });
    setTimeout(() => { ligarCampos(document, campos, ctx); ligarInfos(document, campos); icones(); }, 0);
}
