// ============================================================================
// js/fiscal.js — Raiz Patrimônio · Fiscal (check-up da Reforma Tributária)
// Versão: 1.0.1 · 23/09/2026
//
// v1.0.1 — card Emissão: sem contador cadastrado, a linha "Contador" abre
// direto o cadastro já como Contador (window.abrirCadastroContador,
// index.html v1.253.0); com contador, continua levando a Partes.
//
// v1.0.0 (frente fiscal, Fase 3 — demanda 976fcbf6; decisões D1 e D3 do
// Nicola, 23/09/2026) — tela secundária ⚙️ › Empresa › Fiscal. Fatia lazy
// (carregada por carregarFiscal() no index.html na 1ª abertura), sem
// carregar*Supabase: toda a regra vive no banco.
//   · Card "Resultado do check-up": PJ = prontidão para a NFS-e (data por
//     regime + pendências); PF = resumo dos titulares.
//   · Card "Titulares" (PF): 1 linha por pessoa proprietária, com status
//     (Abaixo do limite · Atenção · Possível enquadramento). Tocar abre os
//     4 blocos de texto: regra, estimativa do sistema, orientação e quando
//     validar com o contador.
//   · Card "Dados que faltam": o que o check-up não conseguiu ver.
//     "Pendências de cadastro" abre o Checklist fiscal (fechamento.js).
//   · Card "Emissão": quem emite a nota (clientes.fiscal_responsavel_emissao),
//     contador cadastrado em Partes (fn_contadores_empresa) e a rotina
//     "NFS-e da competência".
//   · ⋮: "Registrar check-up" (grava o retrato imutável — fechamento_snapshot,
//     bloco checkup_fiscal), "Ver regras usadas" (versão e fonte de cada uma)
//     e a troca do ano analisado (este ano ⇄ próximo).
//   · Frase fixa no rodapé: "Calculado só com o que está no Raiz…".
// Fonte única: fn_fiscal_checkup / fn_fiscal_checkup_historico (porta
// fiscal.checkup: plano + perfil). Nunca afirma obrigação — "valide com seu
// contador" sempre visível no resultado amarelo/vermelho.
//
// ESTADO GLOBAL LIDO: dbAuth, CLIENTE_ID_SUPABASE, rzEsc, renderStatus,
// abrirSheet, abrirSheetAcoes, abrirSheetForm, rzSheetCabecalho, fecharSheet,
// mostrarToast, switchTab, rzIcones, podeUsar, window.fechamentoAbrirChecklistFiscalAtualizado.
// ============================================================================

export const VERSAO = '1.0.1'; // v-check: lido por ⚙️ › Conta › Versões — manter igual ao header

const FIS_ROTULO_RESULTADO = {
    verde: { sem: 'ok', txt: 'Abaixo do limite' },
    amarelo: { sem: 'warn', txt: 'Atenção' },
    vermelho: { sem: 'bad', txt: 'Possível enquadramento' },
};
const FIS_RESPONSAVEIS = [
    { v: 'usuario', l: 'Eu mesmo (pela empresa)' },
    { v: 'contador', l: 'O contador' },
];

let fisDados = null;       // último resultado de fn_fiscal_checkup
let fisAno = null;         // ano analisado (null = ano corrente)
let fisUltimoRetrato = null;
let fisEmissao = null;     // { responsavel, contador, rotina }

const fisEsc = (s) => (typeof rzEsc === 'function' ? rzEsc(s) : String(s ?? ''));
const fisMoeda = (v) => 'R$ ' + Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fisData = (iso) => (iso ? new Date(String(iso).length === 10 ? iso + 'T00:00:00' : iso).toLocaleDateString('pt-BR') : '—');
const fisAnoAtual = () => new Date().getFullYear();

function fisMount() { return document.getElementById('mount-fiscal'); }

function fisVazio(icone, texto) {
    return `<div class="rz-empty"><div class="rz-ic"><svg data-lucide="${icone}"></svg></div><p class="rz-desc">${fisEsc(texto)}</p></div>`;
}

/** Entrada da tela (switchTab('tab-fiscal') → carregarFiscal().then(m => m.fiscalMontar())). */
export async function fiscalMontar() {
    const el = fisMount(); if (!el) return;
    el.innerHTML = fisCabecalho() + fisVazio('loader', 'Calculando o check-up…');
    if (typeof rzIcones === 'function') rzIcones();
    const ano = fisAno || fisAnoAtual();
    try {
        const [ck, hist, emis] = await Promise.all([
            dbAuth.rpc('fn_fiscal_checkup', { p_cliente_id: CLIENTE_ID_SUPABASE, p_ano: ano, p_gravar: false }),
            dbAuth.rpc('fn_fiscal_checkup_historico', { p_cliente_id: CLIENTE_ID_SUPABASE, p_limite: 1 }),
            fisCarregarEmissao(),
        ]);
        if (ck.error) throw ck.error;
        fisDados = ck.data;
        fisUltimoRetrato = (!hist.error && hist.data && hist.data[0]) ? hist.data[0] : null;
        fisEmissao = emis;
        fisRender();
    } catch (e) {
        console.error('[fiscal] fn_fiscal_checkup', e);
        el.innerHTML = fisCabecalho() + fisVazio('alert-triangle', e?.message || 'Não consegui calcular o check-up agora.');
        if (typeof rzIcones === 'function') rzIcones();
    }
}

async function fisCarregarEmissao() {
    const out = { responsavel: null, contador: null, rotina: null };
    try {
        const [cli, cont, rot] = await Promise.all([
            dbAuth.from('clientes').select('fiscal_responsavel_emissao').eq('id', CLIENTE_ID_SUPABASE).maybeSingle(),
            dbAuth.rpc('fn_contadores_empresa', { p_cliente_id: CLIENTE_ID_SUPABASE }),
            dbAuth.rpc('fn_rotinas_empresa_listar', { p_cliente_id: CLIENTE_ID_SUPABASE }),
        ]);
        out.responsavel = cli.data?.fiscal_responsavel_emissao || null;
        out.contador = (!cont.error && cont.data && cont.data[0]) ? cont.data[0].nome : null;
        const r = (!rot.error && rot.data) ? rot.data.find(x => x.codigo === 'nfse_competencia') : null;
        out.rotina = r ? !!r.ligada : false;
    } catch (e) { console.warn('[fiscal] emissão', e); }
    return out;
}

function fisCabecalho() {
    const ano = fisAno || fisAnoAtual();
    return `
        <div class="rz-tabhead">
            <p class="rz-desc">Check-up da Reforma Tributária · ${ano}. Estimativa com os dados do Raiz; valide com seu contador.</p>
            <button type="button" class="rz-more" onclick="fiscalAbrirAcoes()" aria-label="Mais ações"><svg data-lucide="ellipsis-vertical"></svg></button>
        </div>`;
}

function fisBlocosTexto(t) {
    if (!t) return '';
    const bloco = (titulo, txt) => txt ? `<div class="rz-kv"><div class="rz-full"><small>${fisEsc(titulo)}</small><b>${fisEsc(txt)}</b></div></div>` : '';
    return bloco('Regra', t.regra) + bloco('Estimativa do sistema', t.estimativa) + bloco('O que fazer', t.orientacao) + bloco('Quando validar', t.validar);
}

function fisRender() {
    const el = fisMount(); if (!el || !fisDados) return;
    const d = fisDados, emp = d.empresa || {};
    const pj = d.natureza === 'pj';
    const tit = Array.isArray(d.titulares) ? d.titulares : [];
    window.RZ_FIS_TITULARES = tit; // ponte do onclick (índice → titular)

    // Resultado
    let resultado;
    if (pj) {
        const pronto = emp.prontidao === 'pronto';
        resultado = `
            <div class="rz-card">
                <div class="rz-card-h"><h3>Resultado do check-up</h3>${renderStatus(pronto ? 'ok' : 'warn', pronto ? 'Pronto para a nota' : 'Faltam dados')}</div>
                <p class="rz-desc">Contribuinte — nota obrigatória a partir de ${fisEsc(fisData(emp.obrigatoriedade_desde))}.</p>
                <div class="rz-kv">
                    <div><small>Contratos ativos</small><b>${emp.contratos_ativos ?? 0}</b></div>
                    <div><small>Imóveis alugados</small><b>${emp.imoveis_locados ?? 0}</b></div>
                    <div><small>Pendências que impedem a nota</small><b>${emp.pendencias_bloqueiam ?? 0}</b></div>
                    <div><small>Pedem atenção</small><b>${emp.pendencias_atencao ?? 0}</b></div>
                </div>
                ${fisBlocosTexto(emp.textos)}
            </div>`;
    } else {
        const cont = { verde: 0, amarelo: 0, vermelho: 0 };
        tit.forEach(t => { cont[t.resultado] = (cont[t.resultado] || 0) + 1; });
        const pior = cont.vermelho ? 'vermelho' : (cont.amarelo ? 'amarelo' : 'verde');
        const r = FIS_ROTULO_RESULTADO[pior];
        resultado = `
            <div class="rz-card">
                <div class="rz-card-h"><h3>Resultado do check-up</h3>${tit.length ? renderStatus(r.sem, r.txt) : ''}</div>
                <p class="rz-desc">Pessoa física: a análise é por titular, pela receita de aluguel de ${d.ano_anterior} e deste ano.</p>
                <div class="rz-kv">
                    <div><small>Possível enquadramento</small><b>${cont.vermelho}</b></div>
                    <div><small>Atenção</small><b>${cont.amarelo}</b></div>
                    <div><small>Abaixo do limite</small><b>${cont.verde}</b></div>
                    <div><small>Documento da PF a partir de</small><b>${fisEsc(fisData(emp.documento_pf_desde))}</b></div>
                </div>
            </div>`;
    }

    // Titulares (PF)
    const titulares = pj ? '' : `
        <div class="rz-card rz-list">
            <div class="rz-card-h"><h3>Titulares</h3><span class="rz-sub">${tit.length}</span></div>
            ${tit.length ? tit.map((t, i) => {
                const r = FIS_ROTULO_RESULTADO[t.resultado] || FIS_ROTULO_RESULTADO.amarelo;
                return `<div class="rz-row rz-link" onclick="fiscalAbrirTitular(${i})">
                    <div class="rz-ic${t.resultado === 'vermelho' ? ' rz-bad' : (t.resultado === 'amarelo' ? ' rz-warn' : '')}"><svg data-lucide="user"></svg></div>
                    <div class="rz-tx"><b>${fisEsc(t.nome || 'Titular')}</b><span>${fisMoeda(t.receita_ano_anterior)} em ${d.ano_anterior} · ${t.imoveis_ano_anterior || 0} imóvel(is)</span></div>
                    ${renderStatus(r.sem, r.txt)}
                </div>`;
            }).join('') : fisVazio('users', 'Nenhum imóvel com proprietário cadastrado (chip Propriedade do ativo).')}
        </div>`;

    // Dados que faltam
    const faltam = Array.isArray(d.dados_faltantes) ? d.dados_faltantes : [];
    window.RZ_FIS_FALTAM = faltam;
    const faltamHtml = `
        <div class="rz-card rz-list">
            <div class="rz-card-h"><h3>Dados que faltam</h3><span class="rz-sub">${faltam.length}</span></div>
            ${faltam.length ? faltam.map((f, i) => {
                const acao = f.campo === 'cadastro_nota' || f.campo === 'natureza' || f.campo === 'regime';
                return `<div class="rz-row${acao ? ' rz-link' : ''}"${acao ? ` onclick="fiscalTratarFaltante(${i})"` : ''}>
                    <div class="rz-ic rz-neu"><svg data-lucide="${f.campo === 'cadastro_nota' ? 'file-check-2' : 'info'}"></svg></div>
                    <div class="rz-tx"><span>${fisEsc(f.texto)}</span></div>
                    ${acao ? '<svg data-lucide="chevron-right" class="rz-chev"></svg>' : ''}
                </div>`;
            }).join('') : fisVazio('check', 'Nada faltando para o check-up.')}
        </div>`;

    // Emissão
    const e = fisEmissao || {};
    const resp = FIS_RESPONSAVEIS.find(x => x.v === e.responsavel);
    const emissao = `
        <div class="rz-card rz-list">
            <div class="rz-card-h"><h3>Emissão</h3></div>
            <div class="rz-row rz-link" onclick="fiscalEditarResponsavel()">
                <div class="rz-ic"><svg data-lucide="user-check"></svg></div>
                <div class="rz-tx"><b>Quem emite a nota</b><span>${fisEsc(resp ? resp.l : 'Ainda não definido')}</span></div>
                <svg data-lucide="chevron-right" class="rz-chev"></svg>
            </div>
            <div class="rz-row rz-link" onclick="${e.contador ? "switchTab('tab-partes')" : 'abrirCadastroContador()'}">
                <div class="rz-ic"><svg data-lucide="briefcase"></svg></div>
                <div class="rz-tx"><b>Contador</b><span>${fisEsc(e.contador || 'Nenhum cadastrado — toque para cadastrar')}</span></div>
                <svg data-lucide="chevron-right" class="rz-chev"></svg>
            </div>
            <div class="rz-row rz-link" onclick="switchTab('tab-minha-empresa')">
                <div class="rz-ic"><svg data-lucide="repeat"></svg></div>
                <div class="rz-tx"><b>Rotina "NFS-e da competência"</b><span>${e.rotina ? 'Ligada' : 'Desligada — ligue em Minha empresa › Rotinas'}</span></div>
                ${renderStatus(e.rotina ? 'ok' : 'neu', e.rotina ? 'Ligada' : 'Desligada')}
            </div>
        </div>`;

    const rodape = `<p class="rz-desc">${fisEsc(d.frase_fixa || '')}${fisUltimoRetrato ? ` Último check-up registrado em ${fisEsc(fisData(fisUltimoRetrato.criado_em))} (ano ${fisUltimoRetrato.ano}).` : ''}</p>`;

    el.innerHTML = fisCabecalho() + resultado + titulares + faltamHtml + emissao + rodape;
    if (typeof rzIcones === 'function') rzIcones();
}

/** Sheet com os 4 blocos de texto de um titular. */
export function fiscalAbrirTitular(i) {
    const t = (window.RZ_FIS_TITULARES || [])[i]; if (!t || typeof abrirSheet !== 'function') return;
    const r = FIS_ROTULO_RESULTADO[t.resultado] || FIS_ROTULO_RESULTADO.amarelo;
    const d = fisDados || {};
    const corpo = `
        <div class="rz-kv">
            <div><small>Receita ${d.ano_anterior}</small><b>${fisMoeda(t.receita_ano_anterior)}</b></div>
            <div><small>Imóveis em ${d.ano_anterior}</small><b>${t.imoveis_ano_anterior || 0}</b></div>
            <div><small>Receita ${d.ano} até hoje</small><b>${fisMoeda(t.receita_ano_corrente)}</b></div>
            <div><small>Imóveis em ${d.ano}</small><b>${t.imoveis_ano_corrente || 0}</b></div>
        </div>
        ${fisBlocosTexto(t.textos)}
        ${t.tem_valor_estimado ? '<p class="rz-desc">Parte dos valores é estimada a partir do líquido (taxa da administradora).</p>' : ''}`;
    abrirSheet(rzSheetCabecalho(t.nome || 'Titular', r.txt) + `<div class="rz-sh-b">${corpo}</div>`);
    if (typeof rzIcones === 'function') rzIcones();
}

export function fiscalTratarFaltante(i) {
    const f = (window.RZ_FIS_FALTAM || [])[i]; if (!f) return;
    if (f.campo === 'cadastro_nota') {
        if (typeof window.fechamentoAbrirChecklistFiscalAtualizado === 'function') window.fechamentoAbrirChecklistFiscalAtualizado();
        return;
    }
    switchTab('tab-minha-empresa');
}

export function fiscalAbrirAcoes() {
    if (typeof abrirSheetAcoes !== 'function') return;
    const atual = fisAno || fisAnoAtual();
    const outro = atual === fisAnoAtual() ? fisAnoAtual() + 1 : fisAnoAtual();
    abrirSheetAcoes({ titulo: 'Fiscal', sub: `Check-up ${atual}`, acoes: [
        { icone: 'camera', titulo: 'Registrar check-up', sub: 'Guarda o resultado de hoje com as regras usadas', codigo: 'fiscal.checkup', aoTocar: fiscalRegistrar },
        { icone: 'book-open', titulo: 'Ver regras usadas', sub: 'Versão e fonte de cada regra', aoTocar: fiscalAbrirRegras },
        { icone: 'calendar', titulo: `Analisar ${outro}`, sub: outro > fisAnoAtual() ? 'Projeção com a receita deste ano como ano anterior' : 'Voltar ao ano atual', aoTocar: () => { fisAno = outro; fiscalMontar(); } },
    ] });
}

export async function fiscalRegistrar() {
    try {
        const { data, error } = await dbAuth.rpc('fn_fiscal_checkup', { p_cliente_id: CLIENTE_ID_SUPABASE, p_ano: fisAno || fisAnoAtual(), p_gravar: true });
        if (error) throw error;
        fisDados = data;
        fisUltimoRetrato = { criado_em: new Date().toISOString(), ano: data?.ano };
        fisRender();
        mostrarToast('Check-up registrado.', 'success');
    } catch (e) {
        mostrarToast(e?.message || 'Não consegui registrar o check-up.', 'danger');
    }
}

export function fiscalAbrirRegras() {
    const regras = (fisDados && Array.isArray(fisDados.regras)) ? fisDados.regras : [];
    const MAT = { maduro: 'ok', parcial: 'warn', incerto: 'bad' };
    const corpo = regras.length ? `<div class="rz-card rz-list">${regras.map(r => `
        <div class="rz-row">
            <div class="rz-ic"><svg data-lucide="book-open"></svg></div>
            <div class="rz-tx"><b>${fisEsc(r.chave)} · v${fisEsc(r.versao)}</b><span>${fisEsc(r.valor)} — ${fisEsc(r.fonte || '')}</span></div>
            ${r.maturidade ? renderStatus(MAT[r.maturidade] || 'neu', r.maturidade) : renderStatus('neu', 'critério do sistema')}
        </div>`).join('')}</div>` : fisVazio('book-open', 'Nenhuma regra carregada.');
    abrirSheet(rzSheetCabecalho('Regras usadas', `Check-up ${fisDados?.ano || ''}`) + `<div class="rz-sh-b">${corpo}</div>`);
    if (typeof rzIcones === 'function') rzIcones();
}

export function fiscalEditarResponsavel() {
    if (typeof abrirSheetForm !== 'function') return;
    const atual = fisEmissao?.responsavel || '';
    abrirSheetForm({
        titulo: 'Quem emite a nota',
        sub: 'NFS-e do aluguel',
        rotuloSalvar: 'Salvar responsável',
        corpo: `
            <div class="rz-f">
                <label for="fis-resp">Responsável</label>
                <select id="fis-resp">
                    <option value=""${atual ? '' : ' selected'}>Ainda não definido</option>
                    ${FIS_RESPONSAVEIS.map(o => `<option value="${o.v}"${o.v === atual ? ' selected' : ''}>${fisEsc(o.l)}</option>`).join('')}
                </select>
                <span class="rz-hint">Emissão automática pelo Raiz ainda não está disponível.</span>
            </div>`,
        aoSalvar: async (corpoEl) => {
            const v = corpoEl.querySelector('#fis-resp')?.value || null;
            const { error } = await dbAuth.from('clientes').update({ fiscal_responsavel_emissao: v }).eq('id', CLIENTE_ID_SUPABASE);
            if (error) { mostrarToast(error.message || 'Não consegui salvar.', 'danger'); return false; }
            fisEmissao = { ...(fisEmissao || {}), responsavel: v };
            fisRender();
            mostrarToast('Responsável salvo.', 'success');
            return true;
        },
    });
}
