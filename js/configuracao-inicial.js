// =====================================================================
// RAIZ PATRIMÔNIO — js/configuracao-inicial.js
// VERSÃO: Beta v1.2.0 (06/11/2026 — demanda 4e22902f)
// LINHAS: (ver versoes.json)
// -----------------------------------------------------------------
// NOVIDADES (Beta v1.2.0) (06/11/2026, sessão 20261106-0036-config-voz, demanda 4e22902f; FICHA_CONFIG_INICIAL_POR_VOZ_RAIZ
//   v1.1.0, "Estou de acordo" do Nicola 06/11 00:36) — CONFIGURAÇÃO INICIAL POR VOZ OU TEXTO. No topo do passo Escolher (e
//   pelo "+ Falar" do passo Enviar), o cartão "Fale sobre seus ativos, contratos e documentos" com o microfone do aparelho
//   (RaizDevice.voz) e o mínimo de cada coisa (vindo da fn_configuracao_inicial_contexto). A fala vai à raiz-ia-registrar
//   1.5.0 (modo cadastro) e volta como rascunho + simulação; o passo novo "Entendi isto" lista cada item com ✓ ou "falta X",
//   tocável para corrigir digitando, com "Corrigir falando", Confirmar e Descartar. Confirmar grava pela
//   fn_configuracao_inicial_gravar (sem IA; chave de idempotência do rascunho) e leva ao Resumo, com "Completar" em cada
//   item criado. O mínimo é conferido no banco; aqui só se mostra (CAN-01).
// Versão anterior (Beta v1.1.0):
// NOVIDADES (Beta v1.1.0) (14/10/2026, sessão 20261014-2145-onda9c-textos, demanda a05ad2ee; onda 9c do estudo, D6 seção 10) — textos no
//   limite: ação até 24, descrição até 28, aviso e tela vazia até 40 caracteres. Nada de comportamento mudou.
// Versão anterior (Beta v1.0.1):
// NOVIDADES (Beta v1.0.1) — sessão 20261007-0207-ia-falha ("Pode fazer sim" do Nicola 07/10 02:07):
//   o erro ao começar ("Não consegui começar agora…") saía como toast VERDE com ✓ — o tipo 'aviso'
//   não existe no mostrarToast do app e caía no padrão de sucesso. Passa a 'danger' (vermelho, com a
//   mensagem traduzida pelo rzMensagemDeErro). O erro em si (chave de idempotência global) foi
//   corrigido no banco pela migration setup_configuracao_inicial_v4.
// Versão anterior: Beta v1.0.0 (06/10/2026)
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
// rzSheetCabecalho, rzEsc, rzIcones, mostrarToast, switchTab. Opcionais: RaizDevice (voz), abrirFichaContrato.

import * as docs from './cofre-documentos.js';

export const VERSAO = '1.2.0';

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

let st = { tela: 'escolher', marcados: new Set(PADRAO), resumo: null, tipoAtual: null, filtro: 'todos',
    ctx: null, rascunho: null, sim: null, lendo: false, editando: null, criados: null, telaAntesDaFala: 'escolher' };

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
    abrirSheet(rzSheetCabecalho('Configuração inicial', 'Fale ou mande os documentos que você já tem') +
        `<div class="rz-sh-b" id="ci-corpo">${esqueleto()}</div>`, { classe: 'rz-cheio' });
}

export async function abrirConfiguracaoInicial() {
    abrirCasca();
    try {
        [st.resumo, st.ctx] = await Promise.all([
            rpc('fn_configuracao_inicial_resumo', { p_cliente_id: CLIENTE_ID_SUPABASE }),
            rpc('fn_configuracao_inicial_contexto', { p_cliente_id: CLIENTE_ID_SUPABASE }).catch(() => null),
        ]);
    } catch (err) {
        return falha(err);
    }
    if (st.rascunho?.itens?.length) { st.tela = 'entendi'; return desenhar(); } // rascunho em aberto volta para a conferência
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
    corpo.innerHTML = st.tela === 'escolher' ? telaEscolher() : st.tela === 'resumo' ? telaResumo()
        : st.tela === 'falar' ? cartaoFalar(true) : st.tela === 'entendi' ? telaEntendi() : telaEnviar();
    ligar(corpo);
    ligarFala(corpo);
    if (typeof rzIcones === 'function') rzIcones();
}

// ---------------------------------------------------------------- 0 · Falar (v1.2.0)
const vozOk = () => !!(window.RaizDevice && window.RaizDevice.voz && window.RaizDevice.voz.disponivel());

function minimosHtml() {
    const m = st.ctx?.minimos;
    if (!m) return '';
    const lista = (x) => Array.isArray(x) ? x.join(', ') : '';
    const placa = (m.obrigatorios_catalogo?.veiculo || []).map(o => String(o.rotulo).toLowerCase()).join(', ');
    const linhas = [
        ['home', 'Imóvel', lista(m.imovel)],
        ['car', 'Veículo', `o que é${placa ? ', ' + placa : ''} e o valor estimado`],
        ['gem', 'Outro bem', lista(m.outro_bem)],
        ['file-signature', 'Aluguel', lista(m.contrato)],
        ['calendar-clock', 'Conta ou vencimento', lista(m.vencimento)],
    ];
    return `<p class="rz-desc"><b>O mínimo de cada coisa</b></p>` + linhas.map(([ic, t, d]) =>
        `<div class="rz-row"><div class="rz-ic"><svg data-lucide="${ic}"></svg></div><div class="rz-tx rz-wrap"><b>${esc(t)}</b><span>${esc(d)}</span></div></div>`).join('')
        + `<p class="rz-desc">Documento pessoal (RG, CPF, CNH) não entra por voz — esse vai por foto, com acesso restrito.</p>`;
}

// Campo da fala: o mesmo desenho do campo da Raiz IA (microfone do aparelho + texto).
function campoFala(placeholder) {
    return `<div class="rz-ia-campo"><textarea id="ci-ia-q" class="rz-raw" rows="2" maxlength="4000" placeholder="${esc(placeholder)}" aria-label="${esc(placeholder)}"></textarea>`
        + (vozOk() ? '<button type="button" class="rz-ia-mic" id="ci-ia-mic" aria-label="Falar"><svg data-lucide="mic"></svg></button>' : '')
        + '<button type="button" class="rz-ia-enviar" id="ci-ia-enviar" aria-label="Enviar"><svg data-lucide="arrow-up"></svg></button></div>'
        + `<p class="rz-ia-dica" id="ci-ia-dica">${st.lendo ? '<span class="rz-roda" aria-hidden="true"></span> Raiz IA está entendendo…' : 'Toque no microfone e fale, ou escreva.'}</p>`;
}

function cartaoFalar(cheio) {
    return `<div class="rz-card">
        <div class="rz-card-h"><b>Fale sobre seus ativos, contratos e documentos</b></div>
        <p class="rz-desc">Conte o que tem — imóveis, aluguéis, carros, contas que vencem. A Raiz IA monta a lista e você confere antes de gravar.</p>
        ${campoFala('Ex.: “Tenho o apto 81 na Rua das Flores, em BH, vale uns 650 mil, alugado para o João por 2.500, vence dia 10, firmado em março de 2025”')}
        ${cheio ? minimosHtml() : `<details class="rz-desc"><summary>O mínimo de cada coisa</summary>${minimosHtml()}</details>`}
    </div>${cheio ? `<div class="rz-acts"><button type="button" class="rz-btn rz-btn-2" id="ci-voltar-fala">Voltar</button></div>` : ''}`;
}

function ligarFala(corpo) {
    const q = corpo.querySelector('#ci-ia-q'), env = corpo.querySelector('#ci-ia-enviar'), mic = corpo.querySelector('#ci-ia-mic');
    if (!q || !env) return;
    if (st.lendo) { q.readOnly = true; env.disabled = true; if (mic) mic.disabled = true; }
    env.addEventListener('click', () => falar(q.value));
    let escuta = null;
    mic?.addEventListener('click', () => {
        if (escuta) { escuta.parar(); return; }
        mic.classList.add('rz-ouvindo'); q.placeholder = 'Ouvindo…';
        escuta = window.RaizDevice.voz.ouvir({
            aoTexto: (t) => { q.value = t; },
            aoFim: (t, erro) => {
                mic.classList.remove('rz-ouvindo'); escuta = null;
                if (t) falar(t); else if (erro && erro !== 'no-speech' && erro !== 'aborted') mostrarToast('Não ouvi. Fale de novo ou escreva.', 'danger');
            },
        });
        if (!escuta.ok) { mic.classList.remove('rz-ouvindo'); escuta = null; mostrarToast('Sem voz neste aparelho. Escreva.', 'danger'); }
    });
    corpo.querySelector('#ci-voltar-fala')?.addEventListener('click', () => { st.tela = st.telaAntesDaFala || 'escolher'; desenhar(); });
}

// Fala ou correção → raiz-ia-registrar (modo cadastro) → rascunho + simulação
async function falar(texto) {
    texto = String(texto || '').trim();
    if (texto.length < 3 || st.lendo) return;
    if (typeof rzMostrarBloqueio === 'function' && rzMostrarBloqueio('ia.usar')) return;
    st.lendo = true; desenhar();
    try {
        const { data, error } = await dbAuth.functions.invoke('raiz-ia-registrar', {
            body: { modo: 'cadastro', cliente_id: CLIENTE_ID_SUPABASE, texto, rascunho: st.rascunho, canal_entrada: 'voz' } });
        if (error || data?.erro) throw new Error(data?.erro || error?.message || 'erro');
        if (!data.rascunho?.itens?.length) {
            mostrarToast(data.erro_ia ? 'Não entendi agora. Tente de novo.' : 'Não achei nada para cadastrar.', 'danger');
        } else {
            st.rascunho = data.rascunho; st.sim = data.simulacao;
            if (data.contexto) st.ctx = { ...(st.ctx || {}), ...data.contexto };
            st.tela = 'entendi'; st.editando = null;
        }
    } catch (err) {
        mostrarToast('Não entendi: ' + (err?.message || 'erro'), 'danger');
    } finally {
        st.lendo = false; desenhar();
    }
}

// ---------------------------------------------------------------- 0b · Entendi isto (v1.2.0)
const brl = (n) => n == null ? '' : n >= 1e6 ? `R$ ${(n / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} mi`
    : n >= 1e4 ? `R$ ${Math.round(n / 1000).toLocaleString('pt-BR')} mil` : `R$ ${Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const dataBR = (d) => d ? `${d.slice(8, 10)}/${d.slice(5, 7)}/${d.slice(0, 4)}` : '';
const nomeDoBem = (it) => it.ativo_id ? ((st.ctx?.ativos || []).find(a => a.id === it.ativo_id)?.nome || 'bem')
    : ((st.rascunho?.itens || []).find(x => x.ref === it.ativo_ref)?.nome || 'bem não informado');

function rotulo(it) {
    if (it.tipo === 'ativo') {
        if (it.existente_id) return [(st.ctx?.ativos || []).find(a => a.id === it.existente_id)?.nome || 'Bem', 'já cadastrado — vou só completar'];
        const t = (st.ctx?.tipos || []).find(x => x.codigo === it.tipo_codigo);
        return [it.nome || t?.nome || 'Bem', [t?.nome, it.cidade ? `${it.cidade}${it.uf ? '/' + it.uf : ''}` : '', it.campos?.placa ? `placa ${it.campos.placa}` : '', it.valor_estimado ? `vale ~${brl(it.valor_estimado)}` : ''].filter(Boolean).join(' · ')];
    }
    if (it.tipo === 'contrato') return [`Aluguel de ${nomeDoBem(it)}`, [it.locatario, it.valor ? brl(it.valor) : '', it.vencimento_dia ? `vence dia ${it.vencimento_dia}` : '', it.inicio ? `firmado em ${dataBR(it.inicio)}` : ''].filter(Boolean).join(' · ')];
    const v = (st.ctx?.vencimentos || []).find(x => x.codigo === it.subtipo)?.nome || it.titulo || 'Vencimento';
    return [`${v} de ${nomeDoBem(it)}`, [it.data ? `vence ${dataBR(it.data)}` : '', it.valor ? brl(it.valor) : '', it.recorrencia === 'mensal' ? 'todo mês' : it.recorrencia === 'unica' ? 'uma vez' : 'todo ano'].filter(Boolean).join(' · ')];
}
function iconeItem(it) {
    if (it.tipo === 'contrato') return 'file-signature';
    if (it.tipo === 'vencimento') return 'calendar-clock';
    const cod = it.tipo_codigo || (st.ctx?.ativos || []).find(a => a.id === it.existente_id)?.tipo;
    const cat = (st.ctx?.tipos || []).find(t => t.codigo === cod)?.categoria || '';
    return cat.startsWith('imovel') ? 'home' : cat === 'veiculo' ? 'car' : 'gem';
}

function telaEntendi() {
    const r = st.rascunho || { itens: [] };
    const porRef = Object.fromEntries(((st.sim?.itens) || []).map(x => [x.ref, x]));
    const ok = r.itens.filter(i => porRef[i.ref]?.ok).length;
    const linhas = r.itens.map((it, k) => {
        const s = porRef[it.ref] || {};
        const [titulo, sub] = rotulo(it);
        const aberto = st.editando === it.ref;
        return `<div class="rz-row rz-link" data-editar="${esc(it.ref)}">
                <div class="rz-ic${s.ok ? '' : ' rz-warn'}"><svg data-lucide="${iconeItem(it)}"></svg></div>
                <div class="rz-tx rz-wrap"><b>${k + 1}. ${esc(titulo)}</b><span>${esc(sub)}</span>${s.ok ? '' : `<span class="rz-warn">Falta ${esc((s.faltando || []).join(', '))}</span>`}</div>
                <div class="rz-rt"><span class="rz-st rz-${s.ok ? 'ok' : 'warn'}">${s.ok ? 'Pronto' : 'Completar'}</span></div>
            </div>${aberto ? formItem(it) : ''}`;
    }).join('');
    const fora = r.itens.length - ok;
    return `<p class="rz-desc">Entendi isto — <b>vou cadastrar ${ok} ${ok === 1 ? 'item' : 'itens'}</b>.${fora ? ` ${fora === 1 ? 'O item' : `Os ${fora} itens`} com “Completar” fica${fora === 1 ? '' : 'm'} de fora até você completar — toque para corrigir.` : ' Toque num item para corrigir.'}</p>
        <div class="rz-card">${linhas}</div>
        <div class="rz-card"><div class="rz-card-h"><b>Corrigir falando</b></div>${campoFala('Ex.: “no item 2 o valor é 2.800” · “tira o item 3”')}</div>
        <div class="rz-acts">
            <button type="button" class="rz-btn rz-btn-1" id="ci-confirmar" ${ok && !st.lendo ? '' : 'disabled'}>Confirmar e gravar</button>
            <button type="button" class="rz-btn rz-btn-3" id="ci-descartar">Descartar</button>
        </div>`;
}

// Campos por tipo de item — só o que o rascunho tem; o resto se completa no app depois de gravar.
function formItem(it) {
    const opt = (lista, atual) => lista.map(([v, t]) => `<option value="${esc(v)}" ${v === atual ? 'selected' : ''}>${esc(t)}</option>`).join('');
    const bens = [...(st.rascunho?.itens || []).filter(x => x.tipo === 'ativo' && !x.existente_id).map(x => ['ref:' + x.ref, x.nome || 'Bem']),
        ...(st.ctx?.ativos || []).map(a => ['id:' + a.id, a.nome])];
    const bemAtual = it.ativo_id ? 'id:' + it.ativo_id : it.ativo_ref ? 'ref:' + it.ativo_ref : '';
    const campo = (k, rot, tipo = 'text', v = '') => `<div><label>${esc(rot)}</label><input data-campo="${k}" type="${tipo}" value="${esc(v ?? '')}" ${tipo === 'number' ? 'inputmode="decimal" step="any"' : ''}></div>`;
    let corpo = '';
    if (it.tipo === 'ativo' && !it.existente_id) {
        corpo = `<div><label>O que é</label><select data-campo="tipo_codigo"><option value=""></option>${opt((st.ctx?.tipos || []).map(t => [t.codigo, t.nome]), it.tipo_codigo)}</select></div>`
            + campo('nome', 'Nome', 'text', it.nome) + campo('cidade', 'Cidade', 'text', it.cidade) + campo('uf', 'UF', 'text', it.uf)
            + campo('valor_estimado', 'Valor estimado (R$)', 'number', it.valor_estimado) + campo('placa', 'Placa (veículo)', 'text', it.campos?.placa);
    } else if (it.tipo === 'contrato') {
        corpo = `<div><label>Imóvel</label><select data-campo="bem"><option value=""></option>${opt(bens, bemAtual)}</select></div>`
            + campo('locatario', 'Inquilino', 'text', it.locatario) + campo('valor', 'Valor (R$)', 'number', it.valor)
            + campo('vencimento_dia', 'Dia do vencimento', 'number', it.vencimento_dia) + campo('inicio', 'Data em que foi firmado', 'date', it.inicio);
    } else if (it.tipo === 'vencimento') {
        corpo = `<div><label>Bem</label><select data-campo="bem"><option value=""></option>${opt(bens, bemAtual)}</select></div>`
            + `<div><label>O que é</label><select data-campo="subtipo"><option value="">Outro</option>${opt((st.ctx?.vencimentos || []).map(v => [v.codigo, v.nome]), it.subtipo)}</select></div>`
            + campo('titulo', 'Nome (se for outro)', 'text', it.titulo) + campo('data', 'Próximo vencimento', 'date', it.data)
            + campo('valor', 'Valor (R$)', 'number', it.valor)
            + `<div><label>Repete</label><select data-campo="recorrencia">${opt([['mensal', 'Todo mês'], ['anual', 'Todo ano'], ['unica', 'Uma vez']], it.recorrencia || 'anual')}</select></div>`;
    }
    return `<div class="rz-card rz-f" data-form="${esc(it.ref)}">${corpo}
        <div class="rz-acts"><button type="button" class="rz-btn rz-btn-1" data-aplicar="${esc(it.ref)}">Aplicar</button>
        <button type="button" class="rz-btn rz-btn-3" data-remover="${esc(it.ref)}">Remover item</button></div></div>`;
}

async function simular() {
    st.sim = st.rascunho?.itens?.length
        ? await rpc('fn_configuracao_inicial_gravar', { p_cliente_id: CLIENTE_ID_SUPABASE, p_rascunho: st.rascunho, p_simular: true })
        : { itens: [], gravaveis: 0, fora: 0 };
}

async function aplicarEdicao(ref, corpo) {
    const it = (st.rascunho?.itens || []).find(x => x.ref === ref);
    const form = corpo.querySelector(`[data-form="${CSS.escape(ref)}"]`);
    if (!it || !form) return;
    const val = (k) => form.querySelector(`[data-campo="${k}"]`)?.value?.trim() ?? undefined;
    const num = (k) => { const v = val(k); if (v === undefined || v === '') return undefined; const n = Number(String(v).replace(',', '.')); return Number.isFinite(n) ? n : undefined; };
    const set = (k, v) => { if (v === undefined || v === '') delete it[k]; else it[k] = v; };
    if (it.tipo === 'ativo') {
        set('tipo_codigo', val('tipo_codigo')); set('nome', val('nome')); set('cidade', val('cidade'));
        set('uf', (val('uf') || '').toUpperCase().slice(0, 2)); set('valor_estimado', num('valor_estimado'));
        const placa = (val('placa') || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
        it.campos = { ...(it.campos || {}) }; if (placa) it.campos.placa = placa; else delete it.campos.placa;
    } else {
        const bem = val('bem') || '';
        delete it.ativo_id; delete it.ativo_ref;
        if (bem.startsWith('id:')) it.ativo_id = bem.slice(3); else if (bem.startsWith('ref:')) it.ativo_ref = bem.slice(4);
        if (it.tipo === 'contrato') {
            set('locatario', val('locatario')); set('valor', num('valor')); set('vencimento_dia', num('vencimento_dia')); set('inicio', val('inicio'));
        } else {
            set('subtipo', val('subtipo')); set('titulo', val('titulo')); set('data', val('data')); set('valor', num('valor')); set('recorrencia', val('recorrencia'));
        }
    }
    st.editando = null;
    try { await simular(); } catch (err) { mostrarToast('Não conferi: ' + (err?.message || 'erro'), 'danger'); }
    desenhar();
}

async function confirmar() {
    const btn = document.getElementById('ci-confirmar');
    if (btn) btn.disabled = true;
    try {
        const r = await rpc('fn_configuracao_inicial_gravar', { p_cliente_id: CLIENTE_ID_SUPABASE, p_rascunho: st.rascunho, p_simular: false,
            p_chave_idempotencia: 'app:' + (st.rascunho?.chave || '') });
        st.criados = (r?.criados || []).filter(c => c.acao !== 'ja_existia');
        st.rascunho = null; st.sim = null; st.editando = null;
        mostrarToast(`${st.criados.length} ${st.criados.length === 1 ? 'item cadastrado' : 'itens cadastrados'}`);
        try { st.resumo = await rpc('fn_configuracao_inicial_resumo', { p_cliente_id: CLIENTE_ID_SUPABASE }); } catch (_) { /* o resumo fica o de antes */ }
        try { st.ctx = await rpc('fn_configuracao_inicial_contexto', { p_cliente_id: CLIENTE_ID_SUPABASE }); } catch (_) { /* idem */ }
        st.tela = 'resumo';
        desenhar();
    } catch (err) {
        if (btn) btn.disabled = false;
        mostrarToast('Não gravei: ' + (err?.message || 'erro'), 'danger');
    }
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
    return `${cartaoFalar(false)}
        <p class="rz-desc">Ou marque os documentos que você tem em mãos. A Raiz IA lê cada documento e cadastra para você. O que ela não conseguir ler, a equipe Raiz confere e te avisa.</p>
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
            <button type="button" class="rz-chip" id="ci-mais-tipos">+ Outro tipo</button>
            <button type="button" class="rz-chip" id="ci-ir-falar"><svg data-lucide="mic"></svg> Falar</button></div>
        <div class="rz-card">
            <div class="rz-card-h"><b>${esc(atual.t)}</b></div>
            <p class="rz-desc">${esc(atual.dica)}</p>
            <div class="rz-acts"><button type="button" class="rz-btn rz-btn-1" id="ci-enviar"><svg data-lucide="upload"></svg> Enviar documento</button></div>
        </div>
        <p class="rz-desc">${nDocs(documentos.length)} · ${c.lidos || 0} pronto${(c.lidos || 0) === 1 ? '' : 's'} · ${c.confira || 0} para conferir · ${c.equipe || 0} com a equipe Raiz</p>
        ${documentos.length ? `<div class="rz-chips">${FILTROS.map(([k, rot]) => `<button type="button" class="rz-chip ${st.filtro === k ? 'rz-on' : ''}${k === 'voce' && conta(k) ? ' rz-warn' : ''}" data-filtro="${k}">${rot} <span class="rz-n">${conta(k)}</span></button>`).join('')}</div>
        <div class="rz-card">${linhas || '<p class="rz-desc">Nada neste filtro.</p>'}</div>` :
        `<div class="rz-card"><div class="rz-empty"><div class="rz-ic"><svg data-lucide="inbox"></svg></div><p>Nenhum documento ainda.</p></div></div>`}
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
    const ic = { ativo: 'home', contrato: 'file-signature', vencimento: 'calendar-clock' };
    const criados = (st.criados || []).length ? `<div class="rz-card"><div class="rz-card-h"><b>Cadastrado agora</b></div>${st.criados.map(c => `
            <div class="rz-row rz-link" data-completar="${esc(c.tipo)}" data-id="${esc(c.tipo === 'vencimento' ? (c.ativo_id || '') : c.id)}" data-ativo="${esc(c.ativo_id || '')}">
                <div class="rz-ic"><svg data-lucide="${ic[c.tipo] || 'file'}"></svg></div>
                <div class="rz-tx"><b>${esc(c.nome || '')}</b><span>${c.acao === 'completado' ? 'Completado' : 'Criado'} · complete no app</span></div>
                <div class="rz-rt"><span class="rz-st rz-ok">Completar</span></div></div>`).join('')}</div>` : '';
    return `${criados}<div class="rz-card">
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
        mostrarToast('Guardado. Continue pelo + de Ativos.');
    });
    corpo.querySelector('#ci-resumo')?.addEventListener('click', () => { st.tela = 'resumo'; desenhar(); });
    corpo.querySelector('#ci-mais-docs')?.addEventListener('click', () => { st.tela = 'enviar'; desenhar(); });
    corpo.querySelector('#ci-ver-ativos')?.addEventListener('click', () => {
        fecharSheet();
        if (typeof switchTab === 'function') switchTab('tab-ativos');
    });
    // v1.2.0 — por voz
    corpo.querySelector('#ci-ir-falar')?.addEventListener('click', () => { st.telaAntesDaFala = st.tela; st.tela = 'falar'; desenhar(); });
    corpo.querySelectorAll('[data-editar]').forEach(el => el.addEventListener('click', () => {
        st.editando = st.editando === el.dataset.editar ? null : el.dataset.editar; desenhar();
    }));
    corpo.querySelectorAll('[data-aplicar]').forEach(b => b.addEventListener('click', () => aplicarEdicao(b.dataset.aplicar, corpo)));
    corpo.querySelectorAll('[data-remover]').forEach(b => b.addEventListener('click', async () => {
        const ref = b.dataset.remover;
        st.rascunho.itens = st.rascunho.itens.filter(x => x.ref !== ref);
        st.rascunho.itens.forEach(x => { if (x.ativo_ref === ref) delete x.ativo_ref; });
        st.editando = null;
        if (!st.rascunho.itens.length) { st.rascunho = null; st.sim = null; st.tela = 'escolher'; return desenhar(); }
        try { await simular(); } catch (_) { /* mostra o que tem */ }
        desenhar();
    }));
    corpo.querySelector('#ci-confirmar')?.addEventListener('click', confirmar);
    corpo.querySelector('#ci-descartar')?.addEventListener('click', () => {
        st.rascunho = null; st.sim = null; st.editando = null; st.tela = 'escolher';
        mostrarToast('Descartado — nada foi gravado.'); desenhar();
    });
    corpo.querySelectorAll('[data-completar]').forEach(el => el.addEventListener('click', () => {
        const t = el.dataset.completar, id = el.dataset.id;
        fecharSheet();
        if (t === 'contrato' && typeof window.abrirFichaContrato === 'function') window.abrirFichaContrato(id);
        else if (id) window.dispatchEvent(new CustomEvent('cofre:abrir-ativo', { detail: { id } }));
        else if (typeof switchTab === 'function') switchTab('tab-ativos');
    }));
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
        mostrarToast('Não consegui começar agora: ' + (err?.message || 'erro'), 'danger'); // v1.0.1
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
