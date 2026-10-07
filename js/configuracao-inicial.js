// =====================================================================
// RAIZ PATRIMÔNIO — js/configuracao-inicial.js
// VERSÃO: Beta v1.0.0 (06/10/2026 — demandas 860233ca e be7cdd7c)
// LINHAS: (ver versoes.json)
// -----------------------------------------------------------------
// NOVIDADES (Beta v1.0.0) — frente D, fatia D2 (sessão 20261006-2348-setup-d2; "Estou de acordo" do
//   Nicola 06/10 23:48, plano PLANO_INDICADORES_E_SETUP_DOCUMENTOS v1.1.0; protótipo
//   PROTOTIPO_SETUP_DOCUMENTOS_RAIZ v1.1.0). Módulo novo, lazy (UI-05): só carrega quando a pessoa
//   toca em "Configuração inicial" no + de Ativos, no + de Contratos ou trata o alerta "Nenhum ativo
//   cadastrado". Sheet cheio com três passos:
//     — Escolher: o que a pessoa tem em mãos (lista de ativos, documentos dos ativos, contratos,
//       contas e apólices, documentos de pessoas) — fn_configuracao_inicial_iniciar.
//     — Enviar: um documento por vez, pelo MESMO leitor do Cofre (cofre-documentos.js,
//       abrirUploadConfiguracao); lista do que já foi com a situação de cada um — lido, confira,
//       com a equipe Raiz, descartado — fn_configuracao_inicial_resumo.
//     — Resumo: o que a carteira tem agora e o que ainda depende de alguém.
//   Nenhuma regra aqui: o banco decide o que é cada situação (CAN-01). Acesso pelo código
//   cofre.configuracao_inicial (o + mostra cadeado sem ele; o banco recusa).
// =====================================================================
// Depende de globais do index.html: dbAuth, CLIENTE_ID_SUPABASE, abrirSheet, fecharSheet,
// rzSheetCabecalho, rzEsc, rzIcones, mostrarToast, switchTab.

import * as docs from './cofre-documentos.js';

export const VERSAO = '1.0.0';

const TIPOS = [
    { c: 'lista_ativos', ic: 'list', t: 'Lista de ativos', d: 'Planilha ou PDF com seus imóveis, veículos e outros bens', cria: 'A equipe Raiz cadastra os ativos da lista', dica: 'Mande a planilha ou o PDF. A equipe Raiz cadastra os ativos e te avisa.' },
    { c: 'documentos_ativos', ic: 'building-2', t: 'Documentos dos ativos', d: 'Matrícula, escritura, IPTU, CRLV, nota fiscal', cria: 'Cria ou completa o ativo e os vencimentos', dica: 'Um documento por vez: PDF, foto ou arquivo de outro app.' },
    { c: 'contratos', ic: 'file-signature', t: 'Contratos de aluguel', d: 'Contrato assinado, em PDF ou foto', cria: 'Cria o contrato com os dados lidos', dica: 'Um contrato por vez. A Raiz IA pergunta se cria o contrato ou só guarda.' },
    { c: 'contas_apolices', ic: 'calendar-clock', t: 'Contas e apólices', d: 'Seguro, condomínio, boleto de IPTU', cria: 'Cria os vencimentos para o Raiz avisar', dica: 'Apólice, carnê ou boleto. O vencimento vira aviso.' },
    { c: 'documentos_pessoas', ic: 'id-card', t: 'Documentos de pessoas', d: 'RG, CNH, passaporte de sócios e locatários', cria: 'Guardado com acesso restrito', dica: 'Fica restrito: só quem tem acesso a documentos restritos vê.' },
];
const PADRAO = ['lista_ativos', 'documentos_ativos', 'contratos'];
const SITUACAO = {
    lido: ['ok', 'Pronto'], guardado: ['ok', 'Guardado'], confira: ['warn', 'Confira'],
    equipe: ['run', 'Com a equipe'], descartado: ['neu', 'Descartado'],
};
const FILTROS = [['todos', 'Todos'], ['voce', 'Precisa de você'], ['equipe', 'Com a equipe'], ['prontos', 'Prontos'], ['descartados', 'Descartados']];

let st = { tela: 'escolher', marcados: new Set(PADRAO), resumo: null, tipoAtual: null, filtro: 'todos' };

const esc = (t) => (typeof rzEsc === 'function' ? rzEsc(t) : String(t ?? ''));
const tipo = (c) => TIPOS.find(t => t.c === c) || { c, t: c, ic: 'file', d: '', cria: '', dica: '' };
const nDocs = (n) => `${n} documento${n === 1 ? '' : 's'}`;

async function rpc(nome, args) {
    const { data, error } = await dbAuth.rpc(nome, args);
    if (error) throw error;
    return data;
}

function esqueleto() {
    return (typeof window.rzSkeleton === 'function') ? window.rzSkeleton('cards', 2) : '<p class="rz-desc">Carregando…</p>';
}

function abrirCasca() {
    abrirSheet(rzSheetCabecalho('Configuração inicial', 'Sua carteira a partir dos documentos que você já tem') +
        `<div class="rz-sh-b" id="ci-corpo">${esqueleto()}</div>`, { classe: 'rz-cheio' });
}

export async function abrirConfiguracaoInicial() {
    abrirCasca();
    try {
        st.resumo = await rpc('fn_configuracao_inicial_resumo', { p_cliente_id: CLIENTE_ID_SUPABASE });
    } catch (err) {
        return falha(err);
    }
    const escolhidos = (st.resumo.tipos || []).map(t => t.tipo);
    if (escolhidos.length) {
        st.marcados = new Set(escolhidos);
        if (!escolhidos.includes(st.tipoAtual)) st.tipoAtual = escolhidos[0];
        st.tela = 'enviar';
    } else {
        st.tela = 'escolher';
    }
    desenhar();
}

function falha(err) {
    console.warn('[configuracao-inicial] falha ao carregar:', err?.message);
    const corpo = document.getElementById('ci-corpo');
    if (!corpo) return;
    corpo.innerHTML = `<div class="rz-card"><p class="rz-desc">Não deu para carregar agora.</p>
        <div class="rz-acts"><button type="button" class="rz-btn rz-btn-2" id="ci-tentar">Tentar de novo</button></div></div>`;
    corpo.querySelector('#ci-tentar')?.addEventListener('click', () => abrirConfiguracaoInicial());
}

function desenhar() {
    const corpo = document.getElementById('ci-corpo');
    if (!corpo) return;
    corpo.innerHTML = st.tela === 'escolher' ? telaEscolher() : st.tela === 'resumo' ? telaResumo() : telaEnviar();
    ligar(corpo);
    if (typeof rzIcones === 'function') rzIcones();
}

// ---------------------------------------------------------------- 1 · Escolher
function telaEscolher() {
    const jaIniciados = new Set((st.resumo?.tipos || []).map(t => t.tipo));
    const linhas = TIPOS.map(t => `
        <label class="rz-row rz-chk">
            <input type="checkbox" data-tipo="${t.c}" ${st.marcados.has(t.c) ? 'checked' : ''} ${jaIniciados.has(t.c) ? 'disabled' : ''}>
            <div class="rz-ic"><svg data-lucide="${t.ic}"></svg></div>
            <div class="rz-tx rz-wrap"><b>${esc(t.t)}</b><span>${esc(t.d)}</span><span>${esc(t.cria)}</span></div>
        </label>`).join('');
    const n = st.marcados.size;
    return `<p class="rz-desc">Marque o que você tem em mãos. A Raiz IA lê cada documento e cadastra para você. O que ela não conseguir ler, a equipe Raiz confere e te avisa.</p>
        <div class="rz-card">${linhas}</div>
        <div class="rz-acts">
            <button type="button" class="rz-btn rz-btn-1" id="ci-comecar" ${n ? '' : 'disabled'}>${n ? 'Começar a enviar' : 'Marque ao menos um'}</button>
            ${jaIniciados.size ? '<button type="button" class="rz-btn rz-btn-3" id="ci-voltar-enviar">Voltar aos envios</button>' : ''}
        </div>`;
}

// ---------------------------------------------------------------- 2 · Enviar
function grupoFiltro(d) {
    if (d.situacao === 'confira') return 'voce';
    if (d.situacao === 'equipe') return 'equipe';
    if (d.situacao === 'descartado') return 'descartados';
    return 'prontos';
}

function telaEnviar() {
    const r = st.resumo || {};
    const tipos = (r.tipos || []).map(t => t.tipo);
    if (!st.tipoAtual || !tipos.includes(st.tipoAtual)) st.tipoAtual = tipos[0];
    const atual = tipo(st.tipoAtual);
    const documentos = r.documentos || [];
    const c = r.contagem || {};
    const conta = (f) => f === 'todos' ? documentos.length : documentos.filter(d => grupoFiltro(d) === f).length;
    const visiveis = documentos.filter(d => st.filtro === 'todos' || grupoFiltro(d) === st.filtro);
    const enviadosPorTipo = Object.fromEntries((r.tipos || []).map(t => [t.tipo, t.documentos]));

    const linhas = visiveis.map(d => {
        const [sem, rot] = SITUACAO[d.situacao] || ['neu', d.situacao];
        const sub = [d.tipo_lido ? `Lido como ${d.tipo_lido}` : tipo(d.esperado).t, d.restrito ? 'restrito' : null].filter(Boolean).join(' · ');
        const clicavel = d.situacao !== 'descartado';
        return `<div class="rz-row${clicavel ? ' rz-link' : ''}" ${clicavel ? `data-doc="${esc(d.documento_id)}"` : ''}>
            <div class="rz-ic${d.situacao === 'confira' ? ' rz-warn' : ''}"><svg data-lucide="${tipo(d.esperado).ic}"></svg></div>
            <div class="rz-tx"><b>${esc(d.nome)}</b><span>${esc(sub)}</span></div>
            <div class="rz-rt"><span class="rz-st rz-${sem}">${esc(rot)}</span></div>
        </div>`;
    }).join('');

    return `<div class="rz-chips">${tipos.map(t => `<button type="button" class="rz-chip ${t === st.tipoAtual ? 'rz-on' : ''}" data-tipo-atual="${t}">${esc(tipo(t).t)} <span class="rz-n">${enviadosPorTipo[t] || 0}</span></button>`).join('')}
            <button type="button" class="rz-chip" id="ci-mais-tipos">+ Outro tipo</button></div>
        <div class="rz-card">
            <div class="rz-card-h"><b>${esc(atual.t)}</b></div>
            <p class="rz-desc">${esc(atual.dica)}</p>
            <div class="rz-acts"><button type="button" class="rz-btn rz-btn-1" id="ci-enviar"><svg data-lucide="upload"></svg> Enviar documento</button></div>
        </div>
        <p class="rz-desc">${nDocs(documentos.length)} · ${c.lidos || 0} pronto${(c.lidos || 0) === 1 ? '' : 's'} · ${c.confira || 0} para conferir · ${c.equipe || 0} com a equipe Raiz</p>
        ${documentos.length ? `<div class="rz-chips">${FILTROS.map(([k, rot]) => `<button type="button" class="rz-chip ${st.filtro === k ? 'rz-on' : ''}${k === 'voce' && conta(k) ? ' rz-warn' : ''}" data-filtro="${k}">${rot} <span class="rz-n">${conta(k)}</span></button>`).join('')}</div>
        <div class="rz-card">${linhas || '<p class="rz-desc">Nada neste filtro.</p>'}</div>` :
        `<div class="rz-card"><div class="rz-empty"><div class="rz-ic"><svg data-lucide="inbox"></svg></div><p>Nenhum documento ainda. Comece pelo botão acima.</p></div></div>`}
        <div class="rz-acts">
            <button type="button" class="rz-btn rz-btn-2" id="ci-depois">Terminar depois</button>
            <button type="button" class="rz-btn rz-btn-2" id="ci-resumo">Ver resumo</button>
        </div>`;
}

// ---------------------------------------------------------------- 3 · Resumo
function telaResumo() {
    const r = st.resumo || {};
    const cart = r.carteira || {};
    const c = r.contagem || {};
    const pend = (r.documentos || []).filter(d => d.situacao === 'confira' || d.situacao === 'equipe');
    const kpi = (v, rot) => `<div class="rz-kpi"><small>${rot}</small><b>${Number(v) || 0}</b></div>`;
    return `<div class="rz-card">
            <div class="rz-card-h"><b>Sua carteira agora</b></div>
            <div class="rz-kpis">${kpi(cart.ativos, 'Ativos')}${kpi(cart.contratos, 'Contratos')}${kpi(cart.itens_controle, 'Vencimentos sob controle')}${kpi(cart.documentos, 'Documentos')}</div>
        </div>
        <p class="rz-desc">${nDocs((r.documentos || []).length)} enviados na configuração · ${c.lidos || 0} prontos · ${c.descartados || 0} descartados</p>
        ${pend.length ? `<div class="rz-card"><div class="rz-card-h"><b>Ainda falta</b></div>${pend.map(d => {
            const [sem, rot] = SITUACAO[d.situacao];
            return `<div class="rz-row rz-link" data-doc="${esc(d.documento_id)}">
                <div class="rz-ic${d.situacao === 'confira' ? ' rz-warn' : ''}"><svg data-lucide="${d.situacao === 'equipe' ? 'life-buoy' : 'file-search'}"></svg></div>
                <div class="rz-tx"><b>${esc(d.nome)}</b><span>${d.situacao === 'equipe' ? 'A equipe Raiz confere e te avisa' : 'Abra e confirme o que a Raiz IA leu'}</span></div>
                <div class="rz-rt"><span class="rz-st rz-${sem}">${esc(rot)}</span></div></div>`;
        }).join('')}</div>` : ''}
        <div class="rz-acts">
            <button type="button" class="rz-btn rz-btn-1" id="ci-ver-ativos">Ver meus ativos</button>
            <button type="button" class="rz-btn rz-btn-2" id="ci-mais-docs">Mandar mais documentos</button>
        </div>`;
}

// ---------------------------------------------------------------- ações
function ligar(corpo) {
    corpo.querySelectorAll('input[data-tipo]').forEach(i => i.addEventListener('change', () => {
        if (i.checked) st.marcados.add(i.dataset.tipo); else st.marcados.delete(i.dataset.tipo);
        desenhar();
    }));
    corpo.querySelector('#ci-comecar')?.addEventListener('click', comecar);
    corpo.querySelector('#ci-voltar-enviar')?.addEventListener('click', () => { st.tela = 'enviar'; desenhar(); });
    corpo.querySelectorAll('[data-tipo-atual]').forEach(b => b.addEventListener('click', () => { st.tipoAtual = b.dataset.tipoAtual; desenhar(); }));
    corpo.querySelectorAll('[data-filtro]').forEach(b => b.addEventListener('click', () => { st.filtro = b.dataset.filtro; desenhar(); }));
    corpo.querySelector('#ci-mais-tipos')?.addEventListener('click', () => { st.tela = 'escolher'; desenhar(); });
    corpo.querySelector('#ci-enviar')?.addEventListener('click', enviar);
    corpo.querySelector('#ci-depois')?.addEventListener('click', () => {
        fecharSheet();
        mostrarToast('Tudo guardado. Você continua de onde parou pelo + de Ativos.');
    });
    corpo.querySelector('#ci-resumo')?.addEventListener('click', () => { st.tela = 'resumo'; desenhar(); });
    corpo.querySelector('#ci-mais-docs')?.addEventListener('click', () => { st.tela = 'enviar'; desenhar(); });
    corpo.querySelector('#ci-ver-ativos')?.addEventListener('click', () => {
        fecharSheet();
        if (typeof switchTab === 'function') switchTab('tab-ativos');
    });
    corpo.querySelectorAll('[data-doc]').forEach(el => el.addEventListener('click', () => {
        const id = el.dataset.doc;
        fecharSheet();
        window.dispatchEvent(new CustomEvent('cofre:abrir-documento', { detail: { id } }));
    }));
}

async function comecar() {
    const tipos = TIPOS.map(t => t.c).filter(c => st.marcados.has(c));
    if (!tipos.length) return;
    const btn = document.getElementById('ci-comecar');
    if (btn) btn.disabled = true;
    try {
        await rpc('fn_configuracao_inicial_iniciar', { p_cliente_id: CLIENTE_ID_SUPABASE, p_tipos: tipos });
        st.resumo = await rpc('fn_configuracao_inicial_resumo', { p_cliente_id: CLIENTE_ID_SUPABASE });
        st.tipoAtual = tipos.find(t => !(st.resumo.tipos || []).some(x => x.tipo === t && x.documentos)) || tipos[0];
        st.tela = 'enviar';
        desenhar();
    } catch (err) {
        if (btn) btn.disabled = false;
        mostrarToast('Não consegui começar agora: ' + (err?.message || 'erro'), 'aviso');
    }
}

function enviar() {
    const tipoEsperado = st.tipoAtual;
    if (!tipoEsperado) return;
    fecharSheet();
    docs.abrirUploadConfiguracao(tipoEsperado, aoVoltar);
}

// Chamado pelo leitor do Cofre quando o documento foi salvo, descartado ou o envio foi cancelado.
async function aoVoltar(res) {
    abrirCasca();
    try {
        st.resumo = await rpc('fn_configuracao_inicial_resumo', { p_cliente_id: CLIENTE_ID_SUPABASE });
    } catch (err) {
        return falha(err);
    }
    st.tela = 'enviar';
    desenhar();
    if (res?.mensagem) mostrarToast(res.mensagem);
}
