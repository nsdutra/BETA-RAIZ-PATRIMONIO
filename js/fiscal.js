// ============================================================================
// js/fiscal.js — Raiz Patrimônio · Fiscal (check-up da Reforma Tributária)
// Versão: 1.5.0 · 25/09/2026
//
// v1.5.0 (demanda d92a6dfc, pedido do Nicola 24/09 18:50 + decisão 25/09
// "Restante de acordo. Pode implementar."): recebimento com bruto estimado
// (valor_estimado, sem administradora confirmada) ganha ação "Confirmar
// valor bruto" (fiscalConfirmarBruto) — mostra bruto/taxa/líquido e grava
// via fn_mensalidade_valores_ajustar (acao 'confirmar_bruto'), sem mudar
// os números, só tirando a marca de estimado. KPI "Bruto estimado: N"
// aparece no topo quando há algum; botão "Confirmar bruto pelo contrato"
// (fiscalConfirmarBrutoLote) some quando não há nenhum estimado no mês.
// Migration: migration_valor_bruto_liquido_v1.sql (fn_fiscal_competencia/
// fn_fiscal_recebimentos_status ganham valor_confirmado/valor_taxa_adm).
//
// v1.4.0 (pedido do Nicola, 23/09/2026): os 4 textos do check-up (regra,
// estimativa, o que fazer, quando validar) ganham contexto — cartão "Como
// o check-up chegou a este resultado" — e aparecem INTEIROS (classe
// .rz-wrap, index.html v1.258.0: sem corte com "…"). Nome dos rótulos mais
// claros ("A regra da lei", "O que o Raiz calculou", "O que fazer agora",
// "Quando falar com o contador").
//
// v1.3.0 (achados do Nicola testando na Albuquerque, 23/09/2026, com prints):
//   · Fiscal da competência: sem ⋮ no topo e sem o cartão de avisos
//     ("obrigatória a partir de…", "Só consulta" — são acesso e alerta, que
//     já têm lugar próprio). As funções viram 6 botões logo abaixo do mês,
//     no mesmo formato dos 6 do Financeiro (.rz-fin-quad): Preparar ·
//     Cadastro · Anexar XML · Contador · Quem emite · Check-up. Sem o plano,
//     o botão aparece indisponível com o motivo (mesma regra de sempre).
//     O "‹ Financeiro" saiu: o voltar agora é o do app (index.html v1.257.0 —
//     botão de voltar do celular e atalho "‹ Voltar" no topo).
//   · Linha "Falta dado": cada pendência vira uma ação "Completar …" que abre
//     o campo ali mesmo (antes levava ao checklist sem dizer o quê).
//     fiscalCompletarPendencia(p, depois) é a função única de completar no
//     contexto — usada também pelo checklist (fechamento.js v1.9.0) e pelo
//     alerta (index.html). Grava por fn_fiscal_pendencia_completar
//     (migration fiscal_pendencia_completar_v1): CPF/CNPJ do locatário ou da
//     empresa, destinação, município (pelo CEP, ViaCEP → código IBGE) e CIB.
//   · Check-up: sem ⋮ no topo — Registrar check-up, Ver regras usadas e a
//     troca do ano viram o cartão "Ações", no mesmo formato de Emissão; os 4
//     textos (regra, estimativa, o que fazer, quando validar) viram linhas de
//     lista (antes, texto grande em negrito fora do padrão).
//
// v1.2.0 (frente fiscal, Fase 6 — demanda 976fcbf6): fiscalCompetenciaMontar
// ganha o 2º parâmetro abrirMensalidadeId — com ele, a tela já abre as ações
// daquele recebimento (⋮ "Nota fiscal" do Financeiro, financeiro.js v1.23.0,
// via window.abrirFiscalCompetencia do index.html v1.255.0). O mês pode vir
// do alerta de notas pendentes (Motor, destino financeiro/fiscal).
//
// v1.1.0 (frente fiscal, Fase 5 — demanda 976fcbf6; decisão D7 do Nicola,
// preparação em lote) — tela nova "Fiscal da competência" (section
// tab-fiscal-competencia, aberta pelo botão Fiscal do Financeiro via
// window.abrirFiscalCompetencia, index.html v1.254.0). Toda a regra vive no
// banco: fn_fiscal_competencia (leitura) + fn_fiscal_documento_detalhe
// (rascunho/DPS) + as RPCs da Fase 4 (preparar, registrar emitida, cancelar,
// descartar, enviar ao contador, "não gera nota").
//   · Voltar ao Financeiro, barra do mês (começa no mês do Financeiro,
//     window.RZ_FIN_COMPETENCIA), cabeçalho "obrigatória desde …", quem
//     emite (toque edita), aviso com o motivo quando o plano/perfil não
//     inclui documentos fiscais.
//   · 4 KPIs + "Preparar todos (N)" (D7) com confirmação e o resultado
//     (criados/recusados com motivo).
//   · Segmento Recebimentos · Notas · Cadastro (Cadastro abre o checklist
//     fiscal atualizado, sem trocar a lista).
//   · Ações por linha conforme o status fiscal; ações que gravam levam o
//     código fiscal.documentos (cadeado + motivo pelo abrirSheetAcoes).
//   · Rascunho da nota: campos da DPS na ordem do Emissor Nacional com
//     "Copiar" por campo e "Copiar tudo"; itens; histórico.
//   · Anexar XML da NFS-e: sobe o arquivo para o Cofre (categoria Nota
//     fiscal, cofre-api.js) e chama a Edge cofre-extrair-documento 1.9, que
//     registra/casa a nota. Exige também cofre.upload (regra do Storage).
//   · fiscalEditarResponsavel ganha o parâmetro `depois` (redesenha a tela
//     de onde foi chamado).
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
// ESTADO GLOBAL LIDO: dbAuth, CLIENTE_ID_SUPABASE, pessoaIdLogada, rzMostrarBloqueio, rzEsc, renderStatus,
// abrirSheet, abrirSheetAcoes, abrirSheetForm, rzSheetCabecalho, fecharSheet,
// mostrarToast, switchTab, rzIcones, podeUsar, window.fechamentoAbrirChecklistFiscalAtualizado.
// ============================================================================

export const VERSAO = '1.5.0'; // v-check: lido por ⚙️ › Conta › Versões — manter igual ao header

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
        <p class="rz-desc">Check-up da Reforma Tributária · ${ano}. Estimativa com os dados do Raiz; valide com seu contador.</p>`;
}

function fisBlocosTexto(t) {
    if (!t) return '';
    const linha = (icone, titulo, txt) => txt ? `<div class="rz-row"><div class="rz-ic rz-neu"><svg data-lucide="${icone}"></svg></div><div class="rz-tx rz-wrap"><b>${fisEsc(titulo)}</b><span>${fisEsc(txt)}</span></div></div>` : '';
    const corpo = linha('book-open', 'A regra da lei', t.regra) + linha('calculator', 'O que o Raiz calculou', t.estimativa)
        + linha('list-checks', 'O que fazer agora', t.orientacao) + linha('user-check', 'Quando falar com o contador', t.validar);
    return corpo ? `<div class="rz-card rz-list"><div class="rz-card-h"><h3>Como o check-up chegou a este resultado</h3></div>${corpo}</div>` : '';
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
            </div>
            ${fisBlocosTexto(emp.textos)}`;
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

    const anoAtual = fisAno || fisAnoAtual();
    const outroAno = anoAtual === fisAnoAtual() ? fisAnoAtual() + 1 : fisAnoAtual();
    const bloqueioCk = (typeof podeUsar === 'function') ? podeUsar('fiscal.checkup') : { ok: true };
    const acoesCk = `
        <div class="rz-card rz-list">
            <div class="rz-card-h"><h3>Ações</h3></div>
            <div class="rz-row rz-link" onclick="fiscalRegistrarComPorta()">
                <div class="rz-ic"><svg data-lucide="${bloqueioCk.ok ? 'camera' : 'lock'}"></svg></div>
                <div class="rz-tx"><b>Registrar check-up</b><span>${fisEsc(bloqueioCk.ok ? 'Guarda o resultado de hoje com as regras usadas' : (bloqueioCk.textoCurto || 'Não incluído no plano'))}</span></div>
                <svg data-lucide="chevron-right" class="rz-chev"></svg>
            </div>
            <div class="rz-row rz-link" onclick="fiscalAbrirRegras()">
                <div class="rz-ic"><svg data-lucide="book-open"></svg></div>
                <div class="rz-tx"><b>Ver regras usadas</b><span>Versão e fonte de cada regra</span></div>
                <svg data-lucide="chevron-right" class="rz-chev"></svg>
            </div>
            <div class="rz-row rz-link" onclick="fiscalTrocarAno()">
                <div class="rz-ic"><svg data-lucide="calendar"></svg></div>
                <div class="rz-tx"><b>Analisar ${outroAno}</b><span>${outroAno > fisAnoAtual() ? 'Projeção com a receita deste ano como ano anterior' : 'Voltar ao ano atual'}</span></div>
                <svg data-lucide="chevron-right" class="rz-chev"></svg>
            </div>
        </div>`;

    el.innerHTML = fisCabecalho() + resultado + titulares + faltamHtml + emissao + acoesCk + rodape;
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

/** v1.3.0 — cartão Ações: troca o ano analisado (este ⇄ próximo). */
export function fiscalTrocarAno() {
    const atual = fisAno || fisAnoAtual();
    fisAno = atual === fisAnoAtual() ? fisAnoAtual() + 1 : fisAnoAtual();
    fiscalMontar();
}

/** v1.3.0 — cartão Ações: registrar respeita a porta (cadeado com motivo). */
export function fiscalRegistrarComPorta() {
    if (typeof rzMostrarBloqueio === 'function' && rzMostrarBloqueio('fiscal.checkup')) return;
    fiscalRegistrar();
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

export function fiscalEditarResponsavel(depois) {
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
            if (typeof depois === 'function') depois();
            mostrarToast('Responsável salvo.', 'success');
            return true;
        },
    });
}

// ============================================================================
// v1.1.0 — FISCAL DA COMPETÊNCIA (Fase 5)
// ============================================================================
const FC_STATUS = {
    a_preparar: { sem: 'warn', txt: 'A preparar', ic: 'file-plus-2' },
    falta_dado: { sem: 'bad', txt: 'Falta dado', ic: 'alert-triangle' },
    preparada: { sem: 'run', txt: 'Preparada', ic: 'file-pen-line' },
    com_contador: { sem: 'run', txt: 'Com o contador', ic: 'briefcase' },
    emitida: { sem: 'ok', txt: 'Emitida', ic: 'file-check-2' },
    aguardando_recebimento: { sem: 'neu', txt: 'Aguardando pagamento', ic: 'hourglass' },
    sem_nota: { sem: 'neu', txt: 'Não gera nota', ic: 'file-x-2' },
};
const FC_DOC_STATUS = {
    preparada: { sem: 'run', txt: 'Preparada' },
    pendente: { sem: 'run', txt: 'Preparada' },
    emitida: { sem: 'ok', txt: 'Emitida' },
    cancelada: { sem: 'bad', txt: 'Cancelada' },
    descartada: { sem: 'neu', txt: 'Descartada' },
    substituida: { sem: 'neu', txt: 'Substituída' },
    erro: { sem: 'bad', txt: 'Erro' },
};
const FC_XML_RESULTADO = {
    vinculada_ao_preparado: 'Nota registrada como emitida e ligada ao rascunho.',
    vinculada_ao_recebimento: 'Nota registrada e ligada ao recebimento.',
    sem_vinculo: 'Nota registrada, mas nenhum recebimento combina (mesmo locatário e valor). Ela aparece em Notas.',
    ambigua_sem_vinculo: 'Nota registrada sem ligação: mais de um recebimento combina. Ela aparece em Notas.',
    ja_importada: 'Esta nota já estava registrada.',
};
const FC_MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const FC_COD = 'fiscal.documentos';

let fcComp = null;        // 'YYYY-MM-01'
let fcDados = null;       // último fn_fiscal_competencia
let fcAba = 'recebimentos';
let fcDetalhe = null;     // último fn_fiscal_documento_detalhe

const fcIcones = () => { if (typeof rzIcones === 'function') rzIcones(); };
const fcErro = (e, padrao) => mostrarToast(e?.message || padrao, 'danger');
function fcMount() { return document.getElementById('mount-fiscal-competencia'); }
function fcHojeComp() { const h = new Date(); return `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, '0')}-01`; }
function fcRotuloComp(iso) { const [a, m] = String(iso).split('-'); return `${FC_MESES[Number(m) - 1]} ${a}`; }
function fcBloqueado() { return typeof rzMostrarBloqueio === 'function' && rzMostrarBloqueio(FC_COD); }

/** Entrada: window.abrirFiscalCompetencia() (index.html) → switchTab + montar. */
export async function fiscalCompetenciaMontar(comp, abrirMensalidadeId) {
    if (comp) fcComp = String(comp).slice(0, 7) + '-01';
    if (!fcComp) fcComp = (typeof window !== 'undefined' && window.RZ_FIN_COMPETENCIA) || fcHojeComp();
    const el = fcMount(); if (!el) return;
    el.innerHTML = fcTopo() + fisVazio('loader', 'Carregando a competência…');
    fcIcones();
    try {
        const { data, error } = await dbAuth.rpc('fn_fiscal_competencia', { p_cliente_id: CLIENTE_ID_SUPABASE, p_competencia: fcComp });
        if (error) throw error;
        fcDados = data;
        if (abrirMensalidadeId) fcAba = 'recebimentos';
        fcRender();
        if (abrirMensalidadeId) {
            const i = (fcDados.recebimentos || []).findIndex(r => r.mensalidade_id === abrirMensalidadeId);
            if (i >= 0) fiscalCompetenciaAbrirRecebimento(i);
            else mostrarToast('Este recebimento não está na lista fiscal deste mês.', 'info');
        }
    } catch (e) {
        console.error('[fiscal] fn_fiscal_competencia', e?.code || '');
        el.innerHTML = fcTopo() + fisVazio('alert-triangle', e?.message || 'Não consegui carregar a competência agora.');
        fcIcones();
    }
}

export function fiscalCompetenciaMudar(delta) {
    const [a, m] = String(fcComp || fcHojeComp()).split('-').map(Number);
    const d = new Date(a, m - 1 + Number(delta || 0), 1);
    fcComp = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
    fiscalCompetenciaMontar();
}

export function fiscalCompetenciaAba(aba) {
    if (aba === 'cadastro') {
        if (typeof window.fechamentoAbrirChecklistFiscalAtualizado === 'function') window.fechamentoAbrirChecklistFiscalAtualizado();
        return;
    }
    fcAba = aba === 'notas' ? 'notas' : 'recebimentos';
    fcRender();
}

function fcTopo() {
    return `
        <p class="rz-desc">Notas fiscais (NFS-e) dos aluguéis do mês.</p>
        <div class="rz-mes-bar">
            <button type="button" class="rz-ico-btn" onclick="fiscalCompetenciaMudar(-1)" aria-label="Mês anterior"><svg data-lucide="chevron-left"></svg></button>
            <span class="rz-mes-centro"><b class="rz-mes-label">${fisEsc(fcRotuloComp(fcComp || fcHojeComp()))}</b></span>
            <button type="button" class="rz-ico-btn" onclick="fiscalCompetenciaMudar(1)" aria-label="Próximo mês"><svg data-lucide="chevron-right"></svg></button>
        </div>`;
}

// v1.3.0 — os 6 botões abaixo do mês (mesmo formato dos 6 do Financeiro).
function fcBotoes(d) {
    const k = d.kpis || {};
    const docs = Array.isArray(d.documentos) ? d.documentos : [];
    const nPreparar = Number(k.a_preparar || 0);
    const nFalta = Number(k.falta_dado || 0);
    const rasc = docs.filter(x => x.status === 'preparada' && !x.enviado_contador_em).length;
    const bloq = (typeof podeUsar === 'function') ? podeUsar(FC_COD) : { ok: true };
    const trava = bloq.ok ? null : (bloq.textoCurto || 'Não incluído no plano');
    const resp = FIS_RESPONSAVEIS.find(x => x.v === d.responsavel_emissao);
    const quad = ({ icone, estado = '', titulo, explicacao, onclick, off = false }) => `
        <button type="button" class="rz-fin-quad${off ? ' rz-off' : ''}" onclick="${onclick}"${off ? ' aria-disabled="true"' : ''}>
            <div class="rz-ic${estado ? ' rz-' + estado : ''}"><svg data-lucide="${off ? 'lock' : icone}"></svg></div>
            <div class="rz-tx"><b>${fisEsc(titulo)}</b><small>${fisEsc(explicacao)}</small></div>
        </button>`;
    return `<div class="rz-fin-quad-grid">
        ${quad({ icone: 'files', estado: nPreparar ? 'warn' : 'ok', titulo: 'Preparar', off: !!trava,
                 explicacao: trava || (nPreparar ? `${nPreparar} nota(s) a preparar` : 'Nada a preparar'), onclick: 'fiscalCompetenciaPrepararTodos()' })}
        ${quad({ icone: 'list-checks', estado: nFalta ? 'bad' : 'ok', titulo: 'Cadastro',
                 explicacao: nFalta ? `${nFalta} com dado faltando` : 'Nada faltando no mês', onclick: "fiscalCompetenciaAba('cadastro')" })}
        ${quad({ icone: 'file-code-2', titulo: 'Anexar XML', off: !!trava,
                 explicacao: trava || 'Nota emitida fora do Raiz', onclick: 'fiscalCompetenciaAnexarXml()' })}
        ${quad({ icone: 'send', estado: rasc ? 'warn' : '', titulo: 'Contador', off: !!trava,
                 explicacao: trava || (rasc ? `${rasc} rascunho(s) a enviar` : 'Nenhum rascunho a enviar'), onclick: 'fiscalCompetenciaEnviarContador()' })}
        ${quad({ icone: 'user-check', titulo: 'Quem emite',
                 explicacao: resp ? resp.l : 'Toque para definir', onclick: 'fiscalEditarResponsavel(fiscalCompetenciaMontar)' })}
        ${quad({ icone: 'landmark', titulo: 'Check-up', explicacao: 'Reforma Tributária', onclick: "switchTab('tab-fiscal')" })}
    </div>`;
}

function fcRender() {
    const el = fcMount(); if (!el || !fcDados) return;
    const d = fcDados, k = d.kpis || {};
    const rec = Array.isArray(d.recebimentos) ? d.recebimentos : [];
    const docs = Array.isArray(d.documentos) ? d.documentos : [];
    window.RZ_FC_RECEBIMENTOS = rec; // ponte do onclick (índice → linha)

    const nPreparar = Number(k.a_preparar || 0);
    const kpis = `
        <div class="rz-kpis">
            <div class="rz-kpi"><small>A preparar</small><b>${nPreparar}</b></div>
            <div class="rz-kpi${k.falta_dado ? ' rz-bad' : ''}"><small>Falta dado</small><b>${k.falta_dado || 0}</b></div>
            <div class="rz-kpi"><small>Preparadas${k.com_contador ? ' · com o contador' : ''}</small><b>${Number(k.preparada || 0) + Number(k.com_contador || 0)}</b></div>
            <div class="rz-kpi rz-in"><small>Emitidas</small><b>${k.emitida || 0}</b></div>
        </div>
        <p class="rz-desc">${k.total || 0} recebimento(s) no mês · ${k.aguardando_recebimento || 0} aguardando pagamento · ${k.sem_nota || 0} sem nota.${Number(k.bruto_estimado || 0) > 0 ? ` <b>${k.bruto_estimado} com bruto estimado</b> — toque no recebimento pra confirmar.` : ''}</p>`;

    const seg = `
        <div class="rz-seg">
            <button type="button" class="${fcAba === 'recebimentos' ? 'rz-on' : ''}" onclick="fiscalCompetenciaAba('recebimentos')">Recebimentos</button>
            <button type="button" class="${fcAba === 'notas' ? 'rz-on' : ''}" onclick="fiscalCompetenciaAba('notas')">Notas (${docs.length})</button>
        </div>`;

    let lista;
    if (fcAba === 'notas') {
        lista = `<div class="rz-card rz-list">${docs.length ? docs.map(x => {
            const st = FC_DOC_STATUS[x.status] || { sem: 'neu', txt: x.status };
            const itens = Number(x.itens || 0);
            return `<div class="rz-row rz-link" onclick="fiscalCompetenciaAbrirDocumento('${fisEsc(x.documento_id)}')">
                <div class="rz-ic${x.status === 'emitida' ? '' : ' rz-neu'}"><svg data-lucide="${x.tem_xml ? 'file-code-2' : 'file-text'}"></svg></div>
                <div class="rz-tx"><b>${x.numero ? 'Nota nº ' + fisEsc(x.numero) : 'Rascunho'}</b><span>${fisEsc(x.tomador_nome || 'Tomador')} · ${fisMoeda(x.valor_total)}${itens > 1 ? ` · ${itens} recebimentos` : ''}${x.enviado_contador_em ? ' · enviada ao contador' : ''}</span></div>
                ${renderStatus(st.sem, st.txt)}
            </div>`;
        }).join('') : fisVazio('file-text', 'Nenhuma nota nesta competência.')}</div>`;
    } else {
        lista = `<div class="rz-card rz-list">${rec.length ? rec.map((r, i) => {
            const st = FC_STATUS[r.status_fiscal] || FC_STATUS.a_preparar;
            const extra = r.status_fiscal === 'falta_dado' && r.pendencias?.length ? ` · ${fisEsc(fcPendTexto(r.pendencias[0]))}`
                : (r.numero ? ` · nota nº ${fisEsc(r.numero)}` : '');
            return `<div class="rz-row rz-link" onclick="fiscalCompetenciaAbrirRecebimento(${i})">
                <div class="rz-ic${st.sem === 'bad' ? ' rz-bad' : (st.sem === 'warn' ? ' rz-warn' : '')}"><svg data-lucide="${st.ic}"></svg></div>
                <div class="rz-tx"><b>${fisEsc(r.imovel || 'Imóvel')}</b><span>${fisEsc(r.tomador_nome || 'Locatário')} · ${fisMoeda(r.valor_bruto)}${r.valor_estimado ? ' (estimado)' : ''}${extra}</span></div>
                ${renderStatus(st.sem, st.txt)}
            </div>`;
        }).join('') : fisVazio('calendar', 'Nenhum recebimento nesta competência.')}</div>`;
    }

    el.innerHTML = fcTopo() + fcBotoes(d) + kpis + seg + lista;
    fcIcones();
}

// ------------------------------------------------ botões da tela (v1.3.0)
export function fiscalCompetenciaAnexarXml() { fcEscolherXml(); }

export function fiscalCompetenciaEnviarContador() {
    if (fcBloqueado()) return;
    const prep = (fcDados?.documentos || []).filter(x => x.status === 'preparada' && !x.enviado_contador_em);
    if (!prep.length) { mostrarToast('Nenhum rascunho a enviar. Para mandar o pacote do mês, use Financeiro › Contador.', 'info'); return; }
    abrirSheetForm({
        titulo: `Marcar ${prep.length} rascunho(s) como enviados`, sub: fcRotuloComp(fcComp), rotuloSalvar: 'Marcar como enviados',
        corpo: `<p class="rz-desc">Registra a data de envio ao contador. Para mandar os arquivos (PDF com os campos de cada nota, planilha e XML), use Financeiro › Contador — ele já marca sozinho.</p>`,
        aoSalvar: async () => { await fcEnviarContador(prep.map(x => x.documento_id)); return true; },
    });
}

// v1.3.0 — pendência pode vir como objeto {tipo, entidade_tipo, entidade_id, detalhe, campo} ou texto (versão antiga do banco)
function fcPendTexto(p) { return typeof p === 'string' ? p : (p?.detalhe || ''); }

// ------------------------------------------------------------ preparar (D7)
export function fiscalCompetenciaPrepararTodos() {
    if (fcBloqueado()) return;
    const rec = (fcDados?.recebimentos || []).filter(r => r.status_fiscal === 'a_preparar');
    if (!rec.length) { mostrarToast('Nada a preparar nesta competência.', 'info'); return; }
    const total = rec.reduce((s, r) => s + Number(r.valor_bruto || 0), 0);
    abrirSheetForm({
        titulo: `Preparar ${rec.length} nota(s)`,
        sub: fcRotuloComp(fcComp),
        rotuloSalvar: `Preparar ${rec.length}`,
        corpo: `<p class="rz-desc">O Raiz monta um rascunho por recebimento pago, somando ${fisMoeda(total)}. Nada é enviado à Receita: você (ou o contador) emite no Emissor Nacional e depois registra a nota aqui.</p>`,
        aoSalvar: () => fcPreparar(rec.map(r => r.mensalidade_id)),
    });
}

async function fcPreparar(ids) {
    const { data, error } = await dbAuth.rpc('fn_fiscal_documento_preparar', { p_mensalidade_ids: ids, p_canal: 'app' });
    if (error) { fcErro(error, 'Não consegui preparar.'); return false; }
    const criados = (data?.criados || []).filter(c => !c.ja_existia).length;
    const recusados = data?.recusados || [];
    await fiscalCompetenciaMontar();
    if (!recusados.length) { mostrarToast(`${criados} rascunho(s) preparado(s).`, 'success'); return true; }
    const nomes = new Map((fcDados?.recebimentos || []).map(r => [r.mensalidade_id, r.imovel]));
    setTimeout(() => {
        abrirSheet(rzSheetCabecalho(`${criados} preparado(s), ${recusados.length} recusado(s)`, 'Veja o motivo de cada um') +
            `<div class="rz-sh-b"><div class="rz-card rz-list">${recusados.map(r => `
                <div class="rz-row"><div class="rz-ic rz-warn"><svg data-lucide="alert-triangle"></svg></div>
                    <div class="rz-tx"><b>${fisEsc(nomes.get(r.mensalidade_id) || 'Recebimento')}</b><span>${fisEsc(r.motivo)}</span></div></div>`).join('')}</div></div>`);
        fcIcones();
    }, 50);
    return true;
}

// ----------------------------------------------------- ações do recebimento
export function fiscalCompetenciaAbrirRecebimento(i) {
    const r = (window.RZ_FC_RECEBIMENTOS || [])[i]; if (!r) return;
    const st = FC_STATUS[r.status_fiscal] || FC_STATUS.a_preparar;
    const acoes = [];
    const semNota = { icone: 'file-x-2', titulo: 'Este recebimento não gera nota', sub: 'Registre o motivo (ex.: caução, reembolso)', codigo: FC_COD, aoTocar: () => fcMarcarSemNota(r) };
    switch (r.status_fiscal) {
        case 'a_preparar':
            acoes.push({ icone: 'file-plus-2', titulo: 'Preparar a nota', sub: 'Monta o rascunho com os dados do contrato', codigo: FC_COD, aoTocar: async () => { await fcPreparar([r.mensalidade_id]); } });
            acoes.push(semNota);
            break;
        case 'falta_dado':
            (r.pendencias || []).forEach(p => {
                if (typeof p === 'string') { acoes.push({ icone: 'list-checks', titulo: 'Completar o cadastro', sub: p, aoTocar: () => fiscalCompetenciaAba('cadastro') }); return; }
                const c = FC_CAMPO_PEND[p.campo];
                acoes.push(c
                    ? { icone: c.icone, titulo: c.acao, sub: p.detalhe, aoTocar: () => fiscalCompletarPendencia(p, () => fiscalCompetenciaMontar()) }
                    : { icone: 'list-checks', titulo: 'Ver no checklist', sub: p.detalhe, aoTocar: () => fiscalCompetenciaAba('cadastro') });
            });
            acoes.push(semNota);
            break;
        case 'preparada': case 'com_contador':
            acoes.push({ icone: 'clipboard-copy', titulo: 'Ver rascunho e copiar dados', sub: 'Campos na ordem do Emissor Nacional', aoTocar: () => fiscalCompetenciaAbrirDocumento(r.documento_id) });
            acoes.push({ icone: 'file-check-2', titulo: 'Registrar nota emitida', sub: 'Número e/ou chave de acesso', codigo: FC_COD, aoTocar: () => fcRegistrarEmitida(r.documento_id) });
            acoes.push({ icone: 'file-code-2', titulo: 'Anexar XML da nota', sub: 'Registra sozinho e guarda no Cofre', codigo: FC_COD, aoTocar: () => fcEscolherXml() });
            acoes.push({ icone: 'trash-2', tipo: 'bad', titulo: 'Descartar rascunho', sub: 'O recebimento volta para "a preparar"', codigo: FC_COD, aoTocar: () => fcDescartar(r.documento_id) });
            break;
        case 'emitida':
            acoes.push({ icone: 'file-text', titulo: 'Ver a nota', sub: r.numero ? `Nota nº ${r.numero}` : 'Dados e histórico', aoTocar: () => fiscalCompetenciaAbrirDocumento(r.documento_id) });
            acoes.push({ icone: 'file-code-2', titulo: 'Anexar XML da nota', sub: 'Guarda no Cofre, ligado à nota', codigo: FC_COD, aoTocar: () => fcEscolherXml() });
            acoes.push({ icone: 'ban', tipo: 'bad', titulo: 'Registrar cancelamento', sub: 'Depois de cancelar no Emissor Nacional', codigo: FC_COD, aoTocar: () => fcCancelar(r.documento_id) });
            break;
        case 'aguardando_recebimento':
            acoes.push({ icone: 'hourglass', titulo: 'Aguardando pagamento', sub: 'A nota é preparada depois que o pagamento for registrado', aoTocar: () => {} });
            acoes.push(semNota);
            break;
        case 'sem_nota':
            acoes.push({ icone: 'undo-2', titulo: 'Desfazer "não gera nota"', sub: r.motivo_sem_nota ? `Motivo: ${r.motivo_sem_nota}` : '', codigo: FC_COD, aoTocar: () => fcDesfazerSemNota(r) });
            break;
    }
    // v1.5.0 (demanda d92a6dfc) — bruto estimado (sem administradora
    // confirmada): confirma este recebimento só, ou todos os do mesmo
    // contrato de uma vez. Grava por fn_mensalidade_valores_ajustar/
    // fn_mensalidade_bruto_confirmar_lote — os números não mudam, só sai
    // a marca de "estimado".
    if (r.valor_estimado) {
        acoes.push({ icone: 'badge-check', titulo: 'Confirmar valor bruto', sub: `${fisMoeda(r.valor_bruto)} bruto · ${fisMoeda(r.valor_taxa_adm)} taxa · ${fisMoeda(r.valor_confirmado)} líquido`, codigo: 'mensal.baixar', aoTocar: () => fcConfirmarBruto(r) });
        acoes.push({ icone: 'badge-check', titulo: 'Confirmar bruto pelo contrato', sub: 'Todos os recebimentos estimados deste contrato', codigo: 'mensal.baixar', aoTocar: () => fcConfirmarBrutoLote(r) });
    }
    abrirSheetAcoes({ titulo: r.imovel || 'Recebimento', sub: `${st.txt} · ${fisMoeda(r.valor_bruto)}${r.valor_estimado ? ' (estimado)' : ''}`, acoes });
}

async function fcConfirmarBruto(r) {
    const { error } = await dbAuth.rpc('fn_mensalidade_valores_ajustar', {
        p_mensalidade_id: r.mensalidade_id, p_valor_bruto: r.valor_bruto, p_valor_taxa_adm: r.valor_taxa_adm || 0,
        p_valor_confirmado: r.valor_confirmado, p_motivo: 'Confirmado a partir do valor estimado do contrato.',
        p_pessoa_id: (typeof pessoaIdLogada !== 'undefined' ? pessoaIdLogada : null), p_canal: 'app', p_acao: 'confirmar_bruto',
    });
    if (error) { fcErro(error, 'Não consegui confirmar.'); return; }
    mostrarToast('Valor bruto confirmado.', 'success');
    fiscalCompetenciaMontar();
}

async function fcConfirmarBrutoLote(r) {
    const { data, error } = await dbAuth.rpc('fn_mensalidade_bruto_confirmar_lote', {
        p_contrato_id: r.contrato_id, p_pessoa_id: (typeof pessoaIdLogada !== 'undefined' ? pessoaIdLogada : null), p_canal: 'app',
    });
    if (error) { fcErro(error, 'Não consegui confirmar em lote.'); return; }
    const pulados = Number(data?.pulados || 0);
    mostrarToast(`${data?.confirmados || 0} recebimento(s) confirmado(s)${pulados ? ` · ${pulados} pulado(s) (competência fechada)` : ''}.`, 'success');
    fiscalCompetenciaMontar();
}

function fcMarcarSemNota(r) {
    abrirSheetForm({
        titulo: 'Não gera nota', sub: r.imovel || '', rotuloSalvar: 'Salvar',
        corpo: `<div class="rz-f"><label for="fc-motivo">Motivo</label><textarea id="fc-motivo" rows="3" maxlength="300" placeholder="Ex.: devolução de caução, reembolso de despesa"></textarea>
            <span class="rz-hint">Fica registrado no histórico fiscal.</span></div>`,
        aoSalvar: async (c) => {
            const motivo = (c.querySelector('#fc-motivo')?.value || '').trim();
            if (!motivo) { mostrarToast('Informe o motivo.', 'info'); return false; }
            const { error } = await dbAuth.rpc('fn_fiscal_marcar_nao_aplicavel', { p_mensalidade_id: r.mensalidade_id, p_motivo: motivo, p_canal: 'app' });
            if (error) { fcErro(error, 'Não consegui salvar.'); return false; }
            mostrarToast('Marcado: não gera nota.', 'success');
            fiscalCompetenciaMontar();
            return true;
        },
    });
}

async function fcDesfazerSemNota(r) {
    const { error } = await dbAuth.rpc('fn_fiscal_marcar_nao_aplicavel', { p_mensalidade_id: r.mensalidade_id, p_motivo: null, p_canal: 'app' });
    if (error) { fcErro(error, 'Não consegui desfazer.'); return; }
    mostrarToast('Desfeito. O recebimento volta para a lista.', 'success');
    fiscalCompetenciaMontar();
}

function fcRegistrarEmitida(documentoId) {
    const hoje = new Date().toISOString().slice(0, 10);
    const contador = fcDados?.responsavel_emissao === 'contador';
    abrirSheetForm({
        titulo: 'Registrar nota emitida', sub: 'Emitida fora do Raiz', rotuloSalvar: 'Registrar',
        corpo: `
            <div class="rz-f"><label for="fc-num">Número da nota</label><input id="fc-num" inputmode="numeric" maxlength="20"></div>
            <div class="rz-f"><label for="fc-chave">Chave de acesso (50 dígitos)</label><input id="fc-chave" inputmode="numeric" maxlength="60">
                <span class="rz-hint">Informe o número, a chave ou os dois. Com o XML em mãos, prefira "Anexar XML".</span></div>
            <div class="rz-f"><label for="fc-data">Data de emissão</label><input id="fc-data" type="date" value="${hoje}"></div>
            <div class="rz-f"><label for="fc-origem">Quem emitiu</label><select id="fc-origem">
                <option value="emissor_nacional"${contador ? '' : ' selected'}>Eu, no Emissor Nacional</option>
                <option value="contador"${contador ? ' selected' : ''}>O contador</option></select></div>`,
        aoSalvar: async (c) => {
            const numero = (c.querySelector('#fc-num')?.value || '').trim() || null;
            const chave = (c.querySelector('#fc-chave')?.value || '').replace(/\D/g, '') || null;
            if (!numero && !chave) { mostrarToast('Informe o número ou a chave de acesso.', 'info'); return false; }
            if (chave && chave.length !== 50) { mostrarToast('A chave de acesso tem 50 dígitos. Confira.', 'info'); return false; }
            const { error } = await dbAuth.rpc('fn_fiscal_documento_registrar_emitido', {
                p_documento_id: documentoId, p_numero: numero, p_chave_acesso: chave,
                p_emitida_em: c.querySelector('#fc-data')?.value || null, p_serie: null,
                p_origem: c.querySelector('#fc-origem')?.value || 'emissor_nacional', p_cofre_documento_id: null, p_canal: 'app',
            });
            if (error) { fcErro(error, 'Não consegui registrar.'); return false; }
            mostrarToast('Nota registrada como emitida.', 'success');
            fiscalCompetenciaMontar();
            return true;
        },
    });
}

function fcDescartar(documentoId) {
    abrirSheetForm({
        titulo: 'Descartar rascunho', sub: 'Nada foi emitido', rotuloSalvar: 'Descartar',
        corpo: `<div class="rz-f"><label for="fc-motivo">Motivo (opcional)</label><input id="fc-motivo" maxlength="200"></div>
            <p class="rz-desc">O recebimento volta para "a preparar". O rascunho fica no histórico.</p>`,
        aoSalvar: async (c) => {
            const { error } = await dbAuth.rpc('fn_fiscal_documento_descartar', { p_documento_id: documentoId, p_motivo: (c.querySelector('#fc-motivo')?.value || '').trim() || null, p_canal: 'app' });
            if (error) { fcErro(error, 'Não consegui descartar.'); return false; }
            mostrarToast('Rascunho descartado.', 'success');
            fiscalCompetenciaMontar();
            return true;
        },
    });
}

function fcCancelar(documentoId) {
    abrirSheetForm({
        titulo: 'Registrar cancelamento', sub: 'Cancele primeiro no Emissor Nacional', rotuloSalvar: 'Registrar cancelamento',
        corpo: `<div class="rz-f"><label for="fc-motivo">Motivo do cancelamento</label><textarea id="fc-motivo" rows="3" maxlength="300"></textarea>
            <span class="rz-hint">O Raiz só registra; o cancelamento vale quando feito no Emissor Nacional. O arquivo da nota continua guardado no Cofre.</span></div>`,
        aoSalvar: async (c) => {
            const motivo = (c.querySelector('#fc-motivo')?.value || '').trim();
            if (!motivo) { mostrarToast('Informe o motivo do cancelamento.', 'info'); return false; }
            const { error } = await dbAuth.rpc('fn_fiscal_documento_cancelar', { p_documento_id: documentoId, p_motivo: motivo, p_canal: 'app' });
            if (error) { fcErro(error, 'Não consegui registrar o cancelamento.'); return false; }
            mostrarToast('Cancelamento registrado. O recebimento pode ser preparado de novo.', 'success');
            fiscalCompetenciaMontar();
            return true;
        },
    });
}

async function fcEnviarContador(ids) {
    const { data, error } = await dbAuth.rpc('fn_fiscal_documento_enviar_contador', { p_documento_ids: ids, p_canal: 'app' });
    if (error) { fcErro(error, 'Não consegui marcar.'); return; }
    mostrarToast(`${data?.marcados ?? ids.length} rascunho(s) marcados como enviados ao contador.`, 'success');
    fiscalCompetenciaMontar();
}

// ------------------------------------------------ rascunho / DPS / histórico
export async function fiscalCompetenciaAbrirDocumento(documentoId) {
    if (!documentoId) return;
    try {
        const { data, error } = await dbAuth.rpc('fn_fiscal_documento_detalhe', { p_documento_id: documentoId });
        if (error) throw error;
        fcDetalhe = data;
    } catch (e) { fcErro(e, 'Não consegui abrir o documento.'); return; }
    const d = fcDetalhe;
    const st = FC_DOC_STATUS[d.status] || { sem: 'neu', txt: d.status };
    const dps = Array.isArray(d.dps) ? d.dps : [];
    window.RZ_FC_DPS = dps;
    let grupo = null;
    const campos = dps.map((c, i) => {
        const cab = c.grupo !== grupo ? `${grupo === null ? '' : '</div>'}<div class="rz-group">${fisEsc(c.grupo)}</div><div class="rz-card rz-list">` : '';
        grupo = c.grupo;
        const tem = c.valor !== null && c.valor !== undefined && String(c.valor) !== '';
        return cab + `<div class="rz-row${tem ? ' rz-link' : ''}"${tem ? ` onclick="fiscalCompetenciaCopiar(${i})"` : ''}>
            <div class="rz-tx"><b>${fisEsc(c.rotulo)}</b><span>${tem ? fisEsc(c.valor) : 'Não informado'}</span></div>
            ${tem ? '<svg data-lucide="copy" class="rz-chev"></svg>' : renderStatus('warn', 'Falta')}
        </div>`;
    }).join('') + (dps.length ? '</div>' : '');
    const avisos = (d.avisos || []).length ? `<div class="rz-card rz-list">${d.avisos.map(a => `
        <div class="rz-row"><div class="rz-ic rz-warn"><svg data-lucide="alert-triangle"></svg></div><div class="rz-tx"><span>${fisEsc(a)}</span></div></div>`).join('')}</div>` : '';
    const itens = (d.itens || []).length > 1 ? `<div class="rz-group">Recebimentos nesta nota</div><div class="rz-card rz-list">${d.itens.map(it => `
        <div class="rz-row"><div class="rz-tx"><b>${fisEsc(it.imovel)}</b><span>${fisMoeda(it.valor)}${it.valor_estimado ? ' (estimado)' : ''}</span></div></div>`).join('')}</div>` : '';
    const ACAO = { preparar: 'Preparado', registrar_emitido: 'Registrada como emitida', importar_xml: 'XML importado', cancelar: 'Cancelada', descartar: 'Descartado', enviar_contador: 'Enviado ao contador' };
    const hist = (d.historico || []).length ? `<div class="rz-group">Histórico</div><div class="rz-card rz-list">${d.historico.map(h => `
        <div class="rz-row"><div class="rz-tx"><b>${fisEsc(ACAO[h.acao] || h.acao)}</b><span>${fisEsc(fisData(h.quando))}${h.quem ? ' · ' + fisEsc(h.quem) : ''}${h.motivo ? ' · ' + fisEsc(h.motivo) : ''}</span></div></div>`).join('')}</div>` : '';
    const topo = d.status === 'preparada'
        ? `<p class="rz-desc">Toque num campo para copiar e colar no Emissor Nacional. Depois de emitir, volte e registre a nota.</p>
           <button type="button" class="rz-btn rz-btn-1 rz-wide" onclick="fiscalCompetenciaCopiarTudo()"><svg data-lucide="clipboard-copy"></svg> Copiar tudo</button>`
        : (d.chave_acesso ? `<p class="rz-desc">Chave de acesso: ${fisEsc(d.chave_acesso)}</p>` : '');
    abrirSheet(rzSheetCabecalho(d.numero ? `Nota nº ${d.numero}` : 'Rascunho da nota', `${st.txt} · ${fisMoeda(d.valor_total)}`) +
        `<div class="rz-sh-b">${topo}${avisos}${campos}${itens}${hist}</div>`);
    fcIcones();
}

async function fcCopiarTexto(txt, ok) {
    try { await navigator.clipboard.writeText(txt); mostrarToast(ok, 'success'); }
    catch (e) { mostrarToast('Não consegui copiar neste navegador.', 'danger'); }
}
export function fiscalCompetenciaCopiar(i) {
    const c = (window.RZ_FC_DPS || [])[i]; if (!c || c.valor == null) return;
    fcCopiarTexto(String(c.valor), `${c.rotulo} copiado.`);
}
export function fiscalCompetenciaCopiarTudo() {
    const dps = window.RZ_FC_DPS || [];
    fcCopiarTexto(dps.map(c => `${c.rotulo}: ${c.valor ?? '—'}`).join('\n'), 'Dados da nota copiados.');
}

// -------------------------------------------------------------- XML da NFS-e
function fcEscolherXml() {
    if (fcBloqueado()) return;
    if (typeof podeUsar === 'function' && !podeUsar('cofre.upload').ok) {
        if (typeof rzMostrarBloqueio === 'function') rzMostrarBloqueio('cofre.upload');
        return;
    }
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = '.xml,application/xml,text/xml';
    inp.className = 'hidden';
    inp.addEventListener('change', () => { const f = inp.files && inp.files[0]; inp.remove(); if (f) fcEnviarXml(f); });
    document.body.appendChild(inp);
    inp.click();
}

async function fcEnviarXml(file) {
    if (!/\.xml$/i.test(file.name || '')) { mostrarToast('Escolha o arquivo .xml da nota.', 'info'); return; }
    if (file.size > 2 * 1024 * 1024) { mostrarToast('XML grande demais para uma NFS-e (limite 2 MB).', 'info'); return; }
    mostrarToast('Lendo a nota…', 'info');
    let api;
    try { api = await import('./cofre-api.js'); } catch (e) { fcErro(e, 'Não consegui carregar o Cofre.'); return; }
    const documentoId = crypto.randomUUID();
    const path = api.montarStoragePath(CLIENTE_ID_SUPABASE, documentoId, file.name);
    try {
        const hash = await api.calcularHashSha256(file);
        await api.uploadArquivoDocumento(path, file);
        try {
            await api.inserirDocumento({
                id: documentoId, cliente_id: CLIENTE_ID_SUPABASE, nome_original: file.name, nome_exibicao: file.name,
                bucket: 'cofre-documentos', storage_path: path, mime_type: 'application/xml', extensao: 'xml',
                tamanho_bytes: file.size, hash_sha256: hash, categoria_id: fcDados?.categoria_nota_fiscal_id || null,
                descricao: `NFS-e · competência ${fcRotuloComp(fcComp)}`, tags: ['nfse'], data_documento: null, validade_em: null,
                nivel_acesso: 'empresa', origem: 'app', status: 'ativo', criado_por: (typeof pessoaIdLogada !== 'undefined' ? pessoaIdLogada : null),
            });
        } catch (e) { await api.removerArquivoDocumento(path); throw e; }
    } catch (e) { fcErro(e, 'Não consegui enviar o arquivo.'); return; }

    try {
        const { data, error } = await dbAuth.functions.invoke('cofre-extrair-documento', { body: { documento_id: documentoId } });
        if (error) throw error;
        if (!data?.analisado) {
            mostrarToast(data?.motivo || 'Não consegui ler a nota. O arquivo ficou no Cofre.', 'info');
        } else {
            const res = data.fiscal?.resultado;
            mostrarToast(FC_XML_RESULTADO[res] || 'Nota registrada.', 'success');
            if (data.nfse?.competencia && data.nfse.competencia.slice(0, 7) !== String(fcComp).slice(0, 7)) {
                fcComp = data.nfse.competencia.slice(0, 7) + '-01'; // a nota é de outro mês: mostra o mês dela
            }
        }
    } catch (e) {
        console.error('[fiscal] cofre-extrair-documento (xml)', e?.message || '');
        mostrarToast('O arquivo foi para o Cofre, mas não consegui ler a nota agora.', 'danger');
    }
    fiscalCompetenciaMontar();
}

// ============================================================================
// v1.3.0 — COMPLETAR PENDÊNCIA NO CONTEXTO (função única: linha da tela,
// checklist do fechamento e alerta). Grava por fn_fiscal_pendencia_completar.
// ============================================================================
const FC_CAMPO_PEND = {
    documento: { acao: 'Completar CPF/CNPJ do locatário', icone: 'user' },
    cnpj: { acao: 'Corrigir CPF/CNPJ da empresa', icone: 'building-2' },
    destinacao: { acao: 'Informar a destinação do imóvel', icone: 'home' },
    codigo_ibge_municipio: { acao: 'Informar o município do imóvel (pelo CEP)', icone: 'map-pin' },
    municipio_sede_ibge: { acao: 'Informar o município da empresa (pelo CEP)', icone: 'map-pin' },
    cib: { acao: 'Informar o CIB do imóvel', icone: 'hash' },
};

/** p = {entidade_tipo, entidade_id, campo, detalhe, titulo?}; depois() roda depois de salvar. */
export function fiscalCompletarPendencia(p, depois) {
    if (!p || typeof abrirSheetForm !== 'function') return;
    const c = FC_CAMPO_PEND[p.campo];
    if (!c) { mostrarToast('Este dado se completa no cadastro.', 'info'); return; }
    const municipio = p.campo === 'codigo_ibge_municipio' || p.campo === 'municipio_sede_ibge';
    let corpo;
    if (p.campo === 'destinacao') {
        corpo = `<div class="rz-f"><label for="fcp-valor">Destinação <i>*</i></label><select id="fcp-valor">
                    <option value="">Escolha…</option><option value="residencial">Residencial</option><option value="nao_residencial">Não residencial</option></select>
                 <span class="rz-hint">Define o código do serviço (NBS) na nota.</span></div>`;
    } else if (municipio) {
        corpo = `<div class="rz-f"><label for="fcp-cep">CEP <i>*</i></label><input id="fcp-cep" inputmode="numeric" maxlength="9" placeholder="00000-000">
                 <span class="rz-hint">O código do município (IBGE) vem do CEP.</span></div>
                 <div class="rz-f"><label for="fcp-ibge">Ou o código IBGE (7 dígitos)</label><input id="fcp-ibge" inputmode="numeric" maxlength="7"></div>`;
    } else if (p.campo === 'cib') {
        corpo = `<div class="rz-f"><label for="fcp-valor">CIB <i>*</i></label><input id="fcp-valor" maxlength="30" autocomplete="off">
                 <span class="rz-hint">Cadastro Imobiliário Brasileiro (não é o código do município).</span></div>`;
    } else {
        corpo = `<div class="rz-f"><label for="fcp-valor">CPF ou CNPJ <i>*</i></label><input id="fcp-valor" maxlength="18" autocomplete="off" placeholder="Só números (CNPJ pode ter letras)">
                 ${p.entidade_tipo === 'contrato' ? '<span class="rz-hint">Fica no cadastro do locatário em Partes e vale para todos os contratos dele.</span>' : ''}</div>`;
    }
    abrirSheetForm({
        titulo: c.acao, sub: p.titulo || p.detalhe || '', rotuloSalvar: 'Salvar',
        corpo: corpo + (p.detalhe ? `<p class="rz-desc">${fisEsc(p.detalhe)}</p>` : ''),
        aoSalvar: async (el) => {
            const valor = { valor: (el.querySelector('#fcp-valor')?.value || '').trim() };
            if (municipio) {
                const ibge = (el.querySelector('#fcp-ibge')?.value || '').replace(/\D/g, '');
                const cep = (el.querySelector('#fcp-cep')?.value || '').replace(/\D/g, '');
                if (ibge) { valor.valor = ibge; if (cep) valor.cep = cep; }
                else {
                    if (cep.length !== 8) { mostrarToast('Informe o CEP (8 dígitos) ou o código IBGE.', 'info'); return false; }
                    let r = { ok: false };
                    try { const m = await import('./comum-endereco.js'); r = await m.consultarCep(cep); } catch (e) { r = { ok: false }; }
                    if (!r.ok || !r.codigo_ibge_municipio) { mostrarToast('Não achei esse CEP. Confira ou informe o código IBGE.', 'info'); return false; }
                    Object.assign(valor, { valor: r.codigo_ibge_municipio, cep, uf: r.uf, cidade: r.endereco_cidade });
                }
            } else if (!valor.valor) { mostrarToast('Preencha o valor.', 'info'); return false; }
            const { error } = await dbAuth.rpc('fn_fiscal_pendencia_completar', {
                p_cliente_id: CLIENTE_ID_SUPABASE, p_entidade_tipo: p.entidade_tipo, p_entidade_id: p.entidade_id, p_campo: p.campo, p_valor: valor,
            });
            if (error) { mostrarToast(error.message || 'Não consegui salvar.', 'danger'); return false; }
            mostrarToast(valor.cidade ? `Salvo: ${valor.cidade}${valor.uf ? '/' + valor.uf : ''}.` : 'Salvo.', 'success');
            if (typeof depois === 'function') setTimeout(() => depois(), 0);
            return true;
        },
    });
}
