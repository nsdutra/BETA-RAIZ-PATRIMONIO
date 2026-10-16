// ============================================================================
// cofre-membros.js — Raiz Patrimônio · Cofre de Documentos
// Versão: 1.0.0 · 16/10/2026
//
// v1.0.0 (16/10/2026, sessão 20261016-0020-usos-fatia7, demanda 3022603b; FICHA_FATIA7_MEMBROS_RAIZ v1.2.0, de acordo do
// Nicola 15/10 23:17 e 16/10 00:05, D7-1 a D7-14; PROTOTIPO_MEMBROS_LOTES_RAIZ v1.0.0) — criação (D7-7: módulo próprio).
// MEMBROS: o que vive dentro de um ativo sem ser ativo. No lote (bovino, suíno, equinos, ovinos e caprinos) é o ANIMAL
// (espécie, categoria, raça, nascimento ou safra; ciclo próprio de reprodução); na adega é o RÓTULO (garrafas, saldo,
// janela de consumo). Aqui moram: o card "Rebanho · N" ou "Garrafas · N" no Resumo da ficha do ativo (contagem por
// categoria e por fase, busca, lista, "+ Cadastrar"), a ficha do membro (dados, ciclo atual com as datas previstas,
// crias, histórico, lançamentos) e as folhas Cadastrar, Transferir, Registrar saída, Desfazer saída, Entrada/Saída/Ajuste
// de garrafas, Editar e Abrir ciclo. A regra mora no banco (CAN-02): fn_ativo_membros, fn_membro_detalhe,
// fn_membro_cadastrar, fn_membro_movimentar, fn_membro_desfazer_saida, fn_membro_editar e fn_membro_ciclo_abrir. O ciclo
// do animal usa a tela da execução da fatia 6 (cofre-controles.js, abrirExecucao).
// ============================================================================
export const VERSAO = '1.0.0'; // v-check: lido por ⚙️ › Conta › Versões — manter igual ao header
import { estado } from './cofre-estado.js';
import * as api from './cofre-api.js';
import { mostrarToast, refrescarIcones } from './cofre-ui.js';
import { escapeHtml, formatarDataBR, tipoDoCatalogo } from './cofre-validacoes.js';
import { emitirEscrita } from './raiz-eventos.js';

const esc = (s) => escapeHtml(s == null ? '' : String(s));
const moedaBR = (v) => (typeof window.formatarMoedaBR === 'function') ? window.formatarMoedaBR(v)
    : 'R$ ' + Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const status = (sem, rot) => (typeof window.renderStatus === 'function' ? window.renderStatus(sem, rot) : `<span class="rz-st rz-${sem}">${esc(rot)}</span>`);
function hojeISO() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
function diasAte(iso) { if (!iso) return null; const [y, m, d] = iso.split('-').map(Number); const h = new Date(); h.setHours(0, 0, 0, 0); return Math.round((new Date(y, m - 1, d) - h) / 86400000); }
function idadeTexto(meses) {
    if (meses == null) return '';
    if (meses < 1) return 'menos de 1 mês';
    if (meses < 24) return meses + (meses === 1 ? ' mês' : ' meses');
    const a = Math.floor(meses / 12); return a + ' anos';
}
const MOTIVO_SAIDA = { venda: 'Venda', morte: 'Morte', descarte: 'Descarte', doacao: 'Doação', outro: 'Outro' };
const JANELA = { na_janela: ['ok', 'Na janela'], antes: ['neu', 'Ainda cedo'], passou: ['warn', 'Passou da janela'], esgotado: ['neu', 'Esgotado'] };
// Fases por onde o animal pode entrar no cadastro (o banco confere com o catálogo do programa)
const FASES_CADASTRO = { bovino: [['vazia', 'Vazia (espera) desde'], ['apta', 'Apta a cobrir desde'], ['coberta', 'Coberta em']],
    suino: [['vazia', 'Vazia desde'], ['coberta', 'Coberta em']] };
const ICONE_MOV = { entrada: 'log-in', saida: 'log-out', transferencia: 'arrow-left-right', ajuste: 'sliders-horizontal', categoria: 'tag', desfazer_saida: 'undo-2' };

let cardAtual = null; // { ativo, busca, todos, saidos, dados }

function erroRpc(error, padrao) { mostrarToast((error && error.message) || padrao, 'erro'); }

// ============================================================================ card no Resumo da ficha do ativo
export async function montarCardMembros(a, opcoes = {}) {
    const painel = document.getElementById('fa-painel-resumo'); if (!painel) return;
    let card = document.getElementById('fa-card-membros');
    if (!card) {
        card = document.createElement('div'); card.className = 'rz-card hidden'; card.id = 'fa-card-membros';
        const ref = document.getElementById('fa-card-subativos') || painel.querySelector('.rz-card');
        if (ref) ref.insertAdjacentElement('afterend', card); else painel.prepend(card);
    }
    const mesmo = cardAtual && cardAtual.ativo.id === a.id;
    cardAtual = { ativo: a, busca: mesmo ? cardAtual.busca : '', todos: mesmo ? cardAtual.todos : false, saidos: mesmo ? cardAtual.saidos : false, dados: null, ...opcoes };
    const { data, error } = await api.dbAuth.rpc('fn_ativo_membros', { p_ativo_id: a.id, p_busca: cardAtual.busca || null,
        p_limite: cardAtual.todos ? 500 : 30, p_saidos: !!cardAtual.saidos });
    if (estado.ativoEmFoco && estado.ativoEmFoco.id !== a.id) return;
    if (error) { card.classList.add('hidden'); throw error; }
    if (!data || !data.tem_membros || !data.pode_ver) { card.classList.add('hidden'); card.innerHTML = ''; return; }
    cardAtual.dados = data;
    desenharCard(card, data);
}
window.__rzRecarregarMembros = () => { if (cardAtual && estado.ativoEmFoco?.id === cardAtual.ativo.id) montarCardMembros(cardAtual.ativo).catch(() => {}); };

function linhaMembroHtml(m, d) {
    const qtd = d.modo === 'quantidade';
    let sub, rt = '';
    if (qtd) {
        sub = m.janela_de || m.janela_ate ? `Beber de ${m.janela_de || '…'} a ${m.janela_ate || '…'}` : (m.safra ? '' : 'Sem safra');
        const j = JANELA[m.janela];
        rt = `<b>${Number(m.saldo || 0).toLocaleString('pt-BR')}</b>${j ? ' ' + status(j[0], j[1]) : ''}`;
    } else {
        sub = [m.categoria_nome, idadeTexto(m.idade_meses), m.fase].filter(Boolean).join(' · ');
        if (m.situacao === 'saiu') rt = status('neu', 'Saiu');
        else if (m.aviso?.data) {
            const n = diasAte(m.aviso.data);
            rt = status(n < 0 ? 'bad' : n <= 15 ? 'warn' : 'run', `${m.aviso.rotulo} ${formatarDataBR(m.aviso.data).slice(0, 5)}`);
        }
    }
    return `<div class="rz-row rz-link" role="button" tabindex="0" data-mb-abrir="${esc(m.id)}"><div class="rz-ic"><i data-lucide="${qtd ? 'wine' : 'beef'}"></i></div>
        <div class="rz-tx"><b>${esc(m.identificador)}${qtd && m.safra ? ' ' + esc(m.safra) : ''}${m.nome ? ' · ' + esc(m.nome) : ''}</b><span>${esc(sub)}</span></div>
        ${rt ? `<div class="rz-rt">${rt}</div>` : ''}</div>`;
}

function desenharCard(card, d) {
    const qtd = d.modo === 'quantidade';
    const plural = d.plural || 'Membros', sing = (d.singular || 'membro').toLowerCase();
    const resumo = qtd ? `${Number(d.saldo_total || 0).toLocaleString('pt-BR')} garrafas em ${d.total} rótulo${d.total === 1 ? '' : 's'}`
        : (d.avisos ? `${d.avisos} aviso${d.avisos === 1 ? '' : 's'} perto` : '');
    const chips = qtd ? '' : [
        ...(d.por_categoria || []).map(c => `<span class="rz-mb-cnt"><b>${c.qtd}</b> ${esc(c.nome)}</span>`),
        ...(d.por_fase || []).map(f => `<span class="rz-mb-cnt rz-mb-fase"><b>${f.qtd}</b> ${esc(f.fase)}</span>`),
    ].join('');
    const busca = (d.total > 8 || cardAtual.busca) ? `<div class="rz-f rz-mb-busca"><input type="search" id="mb-busca" placeholder="Buscar por ${qtd ? 'rótulo' : 'brinco ou nome'}" value="${esc(cardAtual.busca)}" aria-label="Buscar"></div>` : '';
    const lista = (d.lista || []).map(m => linhaMembroHtml(m, d)).join('');
    const vazio = cardAtual.busca ? '<p class="rz-desc">Nada com essa busca.</p>'
        : `<p class="rz-desc" style="margin:4px 0 8px">${qtd ? 'Nenhum rótulo ainda. Cada rótulo guarda as garrafas, a safra e a janela de consumo.'
            : 'Nenhum animal ainda. Cada animal tem brinco, categoria, idade e, nas fêmeas, o ciclo de reprodução.'}</p>`;
    const semPrograma = !qtd && d.total > 0 && !(d.programas || []).length && ['bovino', 'suino'].includes(d.especie)
        ? `<p class="rz-hint" style="margin:6px 0 0">Para o ciclo de reprodução das fêmeas, aceite o programa em Controles › Programas.</p>` : '';
    card.innerHTML = `<div class="rz-card-h"><h3>${esc(plural)} · ${d.total}</h3><span class="rz-sub">${esc(resumo)}</span></div>
        ${chips ? `<div class="rz-mb-cnts">${chips}</div>` : ''}${busca}
        ${lista ? `<div class="rz-list">${lista}</div>` : vazio}
        ${d.mais ? `<button type="button" class="rz-btn rz-btn-3 rz-wide" data-mb-todos>Ver todos (${d.filtrados})</button>` : ''}
        ${d.saidos ? `<button type="button" class="rz-btn rz-btn-3 rz-wide" data-mb-saidos>${cardAtual.saidos ? 'Esconder os que saíram' : `Ver os que saíram (${d.saidos})`}</button>` : ''}
        ${semPrograma}
        ${d.pode_criar ? `<button type="button" class="rz-add" data-mb-novo><i data-lucide="plus"></i>Cadastrar ${esc(sing)}</button>` : ''}`;
    card.classList.remove('hidden');
    refrescarIcones();
    card.querySelectorAll('[data-mb-abrir]').forEach(el => {
        const ir = () => abrirFichaMembro(el.dataset.mbAbrir);
        el.addEventListener('click', ir);
        el.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); ir(); } });
    });
    card.querySelector('[data-mb-novo]')?.addEventListener('click', () => abrirFolhaCadastrar(d));
    card.querySelector('[data-mb-todos]')?.addEventListener('click', () => { cardAtual.todos = true; montarCardMembros(cardAtual.ativo).catch(() => {}); });
    card.querySelector('[data-mb-saidos]')?.addEventListener('click', () => { cardAtual.saidos = !cardAtual.saidos; montarCardMembros(cardAtual.ativo).catch(() => {}); });
    const inp = card.querySelector('#mb-busca');
    if (inp) {
        let t = null;
        inp.addEventListener('input', () => {
            clearTimeout(t);
            t = setTimeout(async () => {
                cardAtual.busca = inp.value.trim();
                await montarCardMembros(cardAtual.ativo).catch(() => {});
                const novo = document.getElementById('mb-busca');
                if (novo) { novo.focus(); novo.setSelectionRange(novo.value.length, novo.value.length); }
            }, 350);
        });
    }
}

async function aposMudar(ativoId) {
    emitirEscrita('ativo', { id: ativoId || estado.ativoEmFoco?.id, acao: 'membros' });
    window.dispatchEvent(new CustomEvent('cofre:recarregar-eventos'));
    if (cardAtual) await montarCardMembros(cardAtual.ativo).catch(() => {});
}

// ============================================================================ ficha do membro
export async function abrirFichaMembro(id) {
    if (typeof window.abrirSheet !== 'function') { mostrarToast('Abra pelo app principal.', 'erro'); return; }
    const { data: d, error } = await api.dbAuth.rpc('fn_membro_detalhe', { p_membro_id: id });
    if (error) { erroRpc(error, 'Não consegui abrir.'); return; }
    if (!d?.pode_ver) { mostrarToast('Seu perfil não vê este cadastro.', 'erro'); return; }
    const m = d.membro, qtd = m.modo === 'quantidade';
    const titulo = m.identificador + (qtd && m.safra ? ' ' + m.safra : '') + (m.nome ? ' · ' + m.nome : '');
    const sub = qtd ? `${Number(m.saldo || 0).toLocaleString('pt-BR')} garrafas · ${d.ativo.nome}`
        : [m.categoria_nome, idadeTexto(m.idade_meses), m.situacao === 'saiu' ? 'saiu em ' + formatarDataBR(m.saida_data) : d.ativo.nome].filter(Boolean).join(' · ');
    const aberto = (d.ciclos || []).find(c => c.situacao !== 'fechado');
    const fechados = (d.ciclos || []).filter(c => c.situacao === 'fechado');
    let corpo = '';
    if (aberto) {
        const prev = (aberto.previstas || []).filter(p => p.aviso).map(p => {
            const n = diasAte(p.data);
            return `<div class="rz-row"><div class="rz-tx"><b>${esc(p.aviso)}</b><span>${esc(p.nome)}${p.automatica ? ' · muda sozinha na data' : ' · você confirma'}</span></div>
                <div class="rz-rt">${status(n < 0 ? 'bad' : n <= 15 ? 'warn' : 'run', formatarDataBR(p.data))}</div></div>`;
        }).join('');
        corpo += `<div class="rz-card rz-mb-ciclo"><div class="rz-card-h"><h3>${esc(aberto.programa)} · ${esc(aberto.nome)}</h3>
                <span class="rz-sub">${aberto.fase_atual ? esc(aberto.fase_atual.nome) + (aberto.fase_atual.inicio ? ' desde ' + formatarDataBR(aberto.fase_atual.inicio) : '') : ''}</span></div>
            ${prev ? `<div class="rz-list">${prev}</div>` : '<p class="rz-desc">Sem data prevista agora: a próxima fase começa pela sua ação.</p>'}
            <button type="button" class="rz-btn rz-btn-2 rz-wide" data-mb-ciclo="${esc(aberto.ativo_programa_id)}|${esc(aberto.id)}"><i data-lucide="heart-pulse"></i> Ver o ciclo</button></div>`;
    } else if (!qtd && (d.programas_abrir || []).length && d.pode_gerir_ciclos) {
        corpo += `<div class="rz-card"><p class="rz-desc">Sem ciclo aberto. Abra o de ${esc(d.programas_abrir[0].nome.toLowerCase())} para as datas de cobertura, diagnóstico e parto.</p>
            <button type="button" class="rz-btn rz-btn-2 rz-wide" data-mb-abrir-ciclo><i data-lucide="heart-pulse"></i> Abrir ciclo</button></div>`;
    }
    const dados = qtd ? [
        ['Safra', m.safra], ['Uva', m.dados?.uva], ['Produtor', m.dados?.produtor],
        ['Janela de consumo', (m.dados?.janela_de || m.dados?.janela_ate) ? `${m.dados.janela_de || '…'} a ${m.dados.janela_ate || '…'}` : null],
        ['Situação', JANELA[m.janela]?.[1]], ['Observação', m.dados?.observacao],
    ] : [
        ['Espécie', m.especie_nome], ['Sexo', m.sexo === 'femea' ? 'Fêmea' : 'Macho'], ['Raça', m.raca],
        ['Nascimento', m.nascimento ? formatarDataBR(m.nascimento) : (m.safra ? 'Safra ' + m.safra : null)],
        ['Categoria', m.categoria_nome ? m.categoria_nome + (m.categoria_manual ? ' (escolhida)' : ' (pela idade)') : null],
        ['Partos', m.sexo === 'femea' && m.partos ? m.partos : null],
        ['Mãe', m.mae ? m.mae.identificador + (m.mae.nome ? ' · ' + m.mae.nome : '') : null],
        ['Origem', m.dados?.origem === 'comprado' ? 'Comprado' + (m.dados?.compra_valor ? ' · ' + moedaBR(m.dados.compra_valor) : '') : m.dados?.origem === 'nascido' ? 'Nascido na propriedade' : null],
        ['Peso de entrada', m.dados?.peso ? m.dados.peso + ' kg' : null], ['Entrada', formatarDataBR(m.entrada_data)],
        ['Saída', m.situacao === 'saiu' ? `${MOTIVO_SAIDA[m.saida_motivo] || m.saida_motivo} em ${formatarDataBR(m.saida_data)}` : null],
        ['Observação', m.dados?.observacao],
    ];
    corpo += `<div class="rz-group rz-group-t"><span>Dados</span></div><div class="rz-card rz-list">${dados.filter(x => x[1] != null && x[1] !== '')
        .map(x => `<div class="rz-row"><div class="rz-tx"><span>${esc(x[0])}</span><b>${esc(x[1])}</b></div></div>`).join('')}</div>`;
    if ((d.crias || []).length) corpo += `<div class="rz-group rz-group-t"><span>Crias · ${d.crias.length}</span></div><div class="rz-card rz-list">${d.crias.map(c =>
        `<div class="rz-row rz-link" role="button" tabindex="0" data-mb-cria="${esc(c.id)}"><div class="rz-tx"><b>${esc(c.identificador)}${c.nome ? ' · ' + esc(c.nome) : ''}</b>
            <span>${esc([c.sexo === 'femea' ? 'Fêmea' : 'Macho', c.nascimento ? 'nasceu ' + formatarDataBR(c.nascimento) : '', c.situacao === 'saiu' ? 'saiu' : ''].filter(Boolean).join(' · '))}</span></div><i data-lucide="chevron-right"></i></div>`).join('')}</div>`;
    if (fechados.length) corpo += `<div class="rz-group rz-group-t"><span>Ciclos anteriores · ${fechados.length}</span></div><div class="rz-card rz-list">${fechados.map(c =>
        `<div class="rz-row rz-link" role="button" tabindex="0" data-mb-ciclo="${esc(c.ativo_programa_id)}|${esc(c.id)}"><div class="rz-tx"><b>${esc(c.nome)}</b>
            <span>${esc(formatarDataBR(c.inicio) + ' a ' + formatarDataBR(c.fim) + (c.resultado?.saida ? ' · encerrado na saída' : ''))}</span></div><i data-lucide="chevron-right"></i></div>`).join('')}</div>`;
    if ((d.lancamentos || []).length) corpo += `<div class="rz-group rz-group-t"><span>Financeiro</span></div><div class="rz-card rz-list">${d.lancamentos.map(l =>
        `<div class="rz-row"><div class="rz-tx"><b>${esc(l.descricao || (l.direcao === 'entrada' ? 'Receita' : 'Despesa'))}</b><span>${esc((l.status === 'previsto' ? 'Previsto · ' : 'Pago · ') + (l.data ? formatarDataBR(l.data) : ''))}</span></div>
            <div class="rz-rt"><b>${l.direcao === 'saida' ? '−' : ''}${moedaBR(l.valor)}</b></div></div>`).join('')}</div>`;
    const ROT_MOV = { entrada: 'Entrada', saida: 'Saída', transferencia: 'Transferência', ajuste: 'Ajuste', categoria: 'Categoria', desfazer_saida: 'Saída desfeita' };
    corpo += `<div class="rz-group rz-group-t"><span>Histórico</span></div><div class="rz-card rz-list">${(d.movimentos || []).map(v => {
        const det = v.tipo === 'transferencia' ? `${v.de || '?'} → ${v.para || '?'}`
            : v.tipo === 'categoria' ? `${v.dados?.de || '—'} → ${v.dados?.para || '—'}${v.motivo ? ' · ' + v.motivo : ''}`
            : [v.quantidade != null && qtd ? Math.abs(Number(v.quantidade)).toLocaleString('pt-BR') + ' garrafa' + (Math.abs(Number(v.quantidade)) === 1 ? '' : 's') : '',
               MOTIVO_SAIDA[v.motivo] || v.motivo, v.valor ? moedaBR(v.valor) : ''].filter(Boolean).join(' · ');
        return `<div class="rz-row"><div class="rz-ic"><i data-lucide="${ICONE_MOV[v.tipo] || 'circle-dot'}"></i></div><div class="rz-tx"><b>${esc(ROT_MOV[v.tipo] || v.tipo)}</b><span>${esc(det)}</span></div>
            <div class="rz-rt"><span class="rz-sub">${esc(formatarDataBR(v.data))}</span></div></div>`;
    }).join('')}</div>`;
    const acoes = [];
    if (d.pode_movimentar) {
        if (m.situacao === 'saiu') acoes.push(`<button type="button" class="rz-btn rz-btn-2" data-mb-acao="desfazer">Desfazer a saída</button>`);
        else if (qtd) {
            acoes.push(`<button type="button" class="rz-btn rz-btn-1" data-mb-acao="mov">Entrada ou saída</button>`);
            acoes.push(`<button type="button" class="rz-btn rz-btn-3" data-mb-acao="mais">Mais</button>`);
        } else {
            acoes.push(`<button type="button" class="rz-btn rz-btn-2" data-mb-acao="transferir">Transferir</button>`);
            acoes.push(`<button type="button" class="rz-btn rz-btn-2" data-mb-acao="saida">Registrar saída</button>`);
            acoes.push(`<button type="button" class="rz-btn rz-btn-3" data-mb-acao="editar">Editar</button>`);
        }
    }
    const sheet = window.abrirSheet(window.rzSheetCabecalho(titulo, sub) + `<div class="rz-sh-b">${corpo}</div>`
        + (acoes.length ? `<div class="rz-sh-f rz-exec-acoes">${acoes.join('')}</div>` : ''));
    refrescarIcones();
    sheet.querySelectorAll('[data-mb-ciclo]').forEach(b => b.addEventListener('click', async () => {
        const [ap, ci] = b.dataset.mbCiclo.split('|');
        const ctl = await import('./cofre-controles.js');
        ctl.abrirExecucao(ap, ci);
    }));
    sheet.querySelectorAll('[data-mb-cria]').forEach(b => b.addEventListener('click', () => abrirFichaMembro(b.dataset.mbCria)));
    sheet.querySelector('[data-mb-abrir-ciclo]')?.addEventListener('click', () => abrirFolhaAbrirCiclo(d));
    sheet.querySelectorAll('[data-mb-acao]').forEach(b => b.addEventListener('click', () => {
        const a = b.dataset.mbAcao;
        if (a === 'transferir') abrirFolhaTransferir(d);
        else if (a === 'saida') abrirFolhaSaida(d);
        else if (a === 'editar') abrirFolhaEditar(d);
        else if (a === 'desfazer') abrirFolhaDesfazer(d);
        else if (a === 'mov') abrirFolhaGarrafas(d);
        else if (a === 'mais' && typeof window.abrirSheetAcoes === 'function') window.abrirSheetAcoes({ titulo, sub: d.ativo.nome, empilhar: true, acoes: [
            { icone: 'sliders-horizontal', titulo: 'Ajustar o saldo', sub: 'Contagem da adega', codigo: 'ativos.membros.movimentar', aoTocar: () => abrirFolhaGarrafas(d, 'ajuste') },
            { icone: 'arrow-left-right', titulo: 'Transferir', sub: 'Para outra adega', codigo: 'ativos.membros.movimentar', aoTocar: () => abrirFolhaTransferir(d) },
            { icone: 'pencil', titulo: 'Editar', codigo: 'ativos.membros.movimentar', aoTocar: () => abrirFolhaEditar(d) },
        ] });
    }));
}
window.__rzAbrirFichaMembro = (id) => abrirFichaMembro(id);

// ============================================================================ folhas
function campo(id, rotulo, html, dica = '') {
    return `<div class="rz-f"><label for="${id}">${rotulo}</label>${html}${dica ? `<span class="rz-hint">${dica}</span>` : ''}</div>`;
}
function selectHtml(id, opcoes, valor = '', extra = '') {
    return `<select id="${id}" ${extra}>${opcoes.map(([v, r]) => `<option value="${esc(v)}" ${String(v) === String(valor ?? '') ? 'selected' : ''}>${esc(r)}</option>`).join('')}</select>`;
}
const val = (el, id) => (el.querySelector('#' + id)?.value || '').trim();

function abrirFolhaCadastrar(d) {
    const qtd = d.modo === 'quantidade', hoje = hojeISO(), ano = new Date().getFullYear();
    const sing = (d.singular || 'membro').toLowerCase();
    if (qtd) {
        window.abrirSheetForm({
            titulo: 'Cadastrar rótulo', sub: d.ativo.nome, rotuloSalvar: 'Cadastrar',
            corpo: campo('mb-ident', 'Rótulo', '<input type="text" id="mb-ident" maxlength="60" placeholder="Ex.: Malbec Reserva">')
                + `<div class="rz-mb-2">${campo('mb-safra', 'Safra <small>(opcional)</small>', `<input type="number" id="mb-safra" inputmode="numeric" min="1900" max="${ano}" placeholder="${ano - 5}">`)}
                   ${campo('mb-qtd', 'Garrafas', '<input type="number" id="mb-qtd" inputmode="numeric" min="0" step="1" value="1">')}</div>`
                + `<div class="rz-mb-2">${campo('mb-jde', 'Beber a partir de <small>(ano)</small>', `<input type="number" id="mb-jde" inputmode="numeric" min="1900" max="2200">`)}
                   ${campo('mb-jate', 'Beber até <small>(ano)</small>', `<input type="number" id="mb-jate" inputmode="numeric" min="1900" max="2200">`)}</div>`
                + campo('mb-uva', 'Uva <small>(opcional)</small>', '<input type="text" id="mb-uva" maxlength="80" placeholder="Ex.: Malbec">')
                + campo('mb-prod', 'Produtor <small>(opcional)</small>', '<input type="text" id="mb-prod" maxlength="80">')
                + campo('mb-valor', 'Valor pago <small>(opcional)</small>', '<input type="number" id="mb-valor" inputmode="decimal" min="0" step="0.01">'),
            aoSalvar: async (el) => {
                const dados = { identificador: val(el, 'mb-ident'), safra: val(el, 'mb-safra') || null, quantidade: val(el, 'mb-qtd') || 0,
                    janela_de: val(el, 'mb-jde') || null, janela_ate: val(el, 'mb-jate') || null, uva: val(el, 'mb-uva') || null,
                    produtor: val(el, 'mb-prod') || null, valor: val(el, 'mb-valor') || null };
                if (!dados.identificador) { mostrarToast('Diga o rótulo.', 'erro'); return false; }
                return cadastrar(d.ativo.id, dados);
            },
        });
        return;
    }
    const cat = d.catalogo || [];
    const esp0 = d.especie || cat[0]?.codigo;
    const especies = cat.filter(e => e.codigo === esp0 || (['ovino', 'caprino'].includes(esp0) && ['ovino', 'caprino'].includes(e.codigo)));
    const temPrograma = (d.programas || []).length > 0;
    window.abrirSheetForm({
        titulo: 'Cadastrar ' + sing, sub: d.ativo.nome, rotuloSalvar: 'Cadastrar',
        corpo: (el) => {
            el.innerHTML = (especies.length > 1 ? campo('mb-esp', 'Espécie', selectHtml('mb-esp', especies.map(e => [e.codigo, e.nome]), esp0)) : '')
                + campo('mb-ident', 'Identificação', '<input type="text" id="mb-ident" maxlength="60" placeholder="Brinco, chip ou tatuagem">')
                + campo('mb-nome', 'Nome <small>(opcional)</small>', '<input type="text" id="mb-nome" maxlength="60" placeholder="Ex.: Mimosa">')
                + campo('mb-sexo', 'Sexo', selectHtml('mb-sexo', [['femea', 'Fêmea'], ['macho', 'Macho']], 'femea'))
                + `<div class="rz-mb-2">${campo('mb-nasc', 'Nascimento', `<input type="date" id="mb-nasc" max="${hoje}">`)}
                   ${campo('mb-safra', 'ou safra <small>(ano)</small>', `<input type="number" id="mb-safra" inputmode="numeric" min="1990" max="${ano}" placeholder="${ano - 3}">`)}</div>`
                + `<div id="mb-cat-box"></div>`
                + campo('mb-raca', 'Raça <small>(opcional)</small>', '<input type="text" id="mb-raca" maxlength="60" list="mb-racas" placeholder="Escolha ou escreva"><datalist id="mb-racas"></datalist>')
                + `<div id="mb-partos-box"></div>`
                + campo('mb-origem', 'Origem', selectHtml('mb-origem', [['', 'Não informar'], ['nascido', 'Nascido na propriedade'], ['comprado', 'Comprado']], ''))
                + `<div id="mb-compra-box" class="hidden">${campo('mb-compra', 'Valor da compra <small>(opcional)</small>', '<input type="number" id="mb-compra" inputmode="decimal" min="0" step="0.01">')}</div>`
                + `<div class="rz-mb-2">${campo('mb-peso', 'Peso de entrada <small>(kg)</small>', '<input type="number" id="mb-peso" inputmode="decimal" min="0" step="0.1">')}
                   ${campo('mb-entrada', 'Entrou no lote em', `<input type="date" id="mb-entrada" value="${hoje}" max="${hoje}">`)}</div>`
                + `<div id="mb-repro-box"></div>`;
            const atualizar = () => {
                const esp = el.querySelector('#mb-esp')?.value || esp0, sexo = el.querySelector('#mb-sexo')?.value || 'femea';
                const e = cat.find(x => x.codigo === esp) || {};
                const cats = (e.categorias || []).filter(c => c.sexo === sexo);
                const catAtual = el.querySelector('#mb-cat')?.value || '';
                el.querySelector('#mb-cat-box').innerHTML = campo('mb-cat', 'Categoria', selectHtml('mb-cat', [['', 'Pela idade (sugerida)'], ...cats.map(c => [c.codigo, c.nome])], catAtual),
                    'Sem escolher, a categoria segue a idade e os partos sozinha.');
                el.querySelector('#mb-racas').innerHTML = (e.racas || []).map(r => `<option value="${esc(r)}"></option>`).join('');
                const femea = sexo === 'femea';
                el.querySelector('#mb-partos-box').innerHTML = femea ? campo('mb-partos', 'Partos <small>(opcional)</small>', '<input type="number" id="mb-partos" inputmode="numeric" min="0" step="1" placeholder="0">') : '';
                const fases = FASES_CADASTRO[esp];
                el.querySelector('#mb-repro-box').innerHTML = femea && temPrograma && fases ? `<div class="rz-group rz-group-t"><span>Reprodução</span></div>
                    <div class="rz-mb-2">${campo('mb-fase', 'Situação', selectHtml('mb-fase', fases, fases[0][0]))}
                    ${campo('mb-fase-data', 'Data', `<input type="date" id="mb-fase-data" max="${hoje}">`)}</div>
                    <span class="rz-hint">A fêmea em idade de reprodução já entra no ciclo. Com a data da cobertura, o app prevê o diagnóstico, a secagem e o parto.</span>` : '';
            };
            atualizar();
            el.querySelector('#mb-esp')?.addEventListener('change', atualizar);
            el.querySelector('#mb-sexo').addEventListener('change', atualizar);
            el.querySelector('#mb-origem').addEventListener('change', () => el.querySelector('#mb-compra-box').classList.toggle('hidden', el.querySelector('#mb-origem').value !== 'comprado'));
        },
        aoSalvar: async (el) => {
            const dados = { especie: el.querySelector('#mb-esp')?.value || esp0, identificador: val(el, 'mb-ident'), nome: val(el, 'mb-nome') || null,
                sexo: val(el, 'mb-sexo'), nascimento: val(el, 'mb-nasc') || null, safra: val(el, 'mb-safra') || null, categoria: val(el, 'mb-cat') || null,
                raca: val(el, 'mb-raca') || null, partos: val(el, 'mb-partos') || null, origem: val(el, 'mb-origem') || null,
                compra_valor: val(el, 'mb-compra') || null, peso: val(el, 'mb-peso') || null, entrada_data: val(el, 'mb-entrada') || null,
                ciclo_fase: val(el, 'mb-fase') || null, ciclo_data: val(el, 'mb-fase-data') || null };
            if (!dados.identificador) { mostrarToast('Diga a identificação.', 'erro'); return false; }
            if (!dados.nascimento && !dados.safra) { mostrarToast('Diga o nascimento ou a safra.', 'erro'); return false; }
            return cadastrar(d.ativo.id, dados);
        },
    });
}
async function cadastrar(ativoId, dados) {
    const { data, error } = await api.dbAuth.rpc('fn_membro_cadastrar', { p_ativo_id: ativoId, p_dados: dados, p_canal: 'app' });
    if (error) { erroRpc(error, 'Não foi possível cadastrar.'); return false; }
    mostrarToast(data?.ciclo_id ? 'Cadastrado, com ciclo aberto.' : 'Cadastrado.', 'sucesso');
    setTimeout(() => aposMudar(ativoId), 0);
    return true;
}

function destinosDe(d) {
    const modo = d.membro.modo;
    return (estado.ativos || []).filter(x => x.id !== d.ativo.id && x.status === 'ativo' && tipoDoCatalogo(x.tipo_detalhe_id)?.modo_membro === modo)
        .sort((x, y) => String(x.nome_exibicao).localeCompare(String(y.nome_exibicao), 'pt-BR'));
}
function abrirFolhaTransferir(d) {
    const dest = destinosDe(d), hoje = hojeISO();
    if (!dest.length) { mostrarToast('Não há outro lote para receber.', 'erro'); return; }
    window.abrirSheetForm({
        titulo: 'Transferir ' + d.membro.identificador, sub: 'Sai de ' + d.ativo.nome, rotuloSalvar: 'Transferir', empilhar: true,
        corpo: campo('mb-dest', 'Para', selectHtml('mb-dest', dest.map(x => [x.id, x.nome_exibicao])))
            + campo('mb-data', 'Em', `<input type="date" id="mb-data" value="${hoje}" max="${hoje}">`)
            + campo('mb-mot', 'Motivo <small>(opcional)</small>', '<input type="text" id="mb-mot" maxlength="200" placeholder="Ex.: secou, vai para o pasto das secas">')
            + (d.membro.modo === 'individuo' ? '<p class="rz-desc">O ciclo aberto segue com o animal quando o destino tem o mesmo programa.</p>' : ''),
        aoSalvar: async (el) => movimentar(d, 'transferencia', { para_ativo_id: val(el, 'mb-dest'), data: val(el, 'mb-data'), motivo: val(el, 'mb-mot') || null }),
    });
}
function abrirFolhaSaida(d) {
    const hoje = hojeISO();
    window.abrirSheetForm({
        titulo: 'Saída de ' + d.membro.identificador, sub: d.ativo.nome, rotuloSalvar: 'Registrar saída', empilhar: true,
        corpo: (el) => {
            el.innerHTML = campo('mb-mot', 'Motivo', selectHtml('mb-mot', Object.entries(MOTIVO_SAIDA), 'venda'))
                + campo('mb-data', 'Em', `<input type="date" id="mb-data" value="${hoje}" max="${hoje}">`)
                + `<div id="mb-valor-box">${campo('mb-valor', 'Valor da venda', '<input type="number" id="mb-valor" inputmode="decimal" min="0" step="0.01">', 'Entra uma receita prevista no Financeiro, com destino neste animal.')}</div>`
                + campo('mb-obs', 'Observação <small>(opcional)</small>', '<input type="text" id="mb-obs" maxlength="200">')
                + '<p class="rz-desc">O ciclo aberto fecha junto. Se foi engano, use "Desfazer a saída" na ficha.</p>';
            el.querySelector('#mb-mot').addEventListener('change', () => el.querySelector('#mb-valor-box').classList.toggle('hidden', el.querySelector('#mb-mot').value !== 'venda'));
        },
        aoSalvar: async (el) => {
            const motivo = val(el, 'mb-mot');
            return movimentar(d, 'saida', { motivo, data: val(el, 'mb-data'), valor: motivo === 'venda' ? (val(el, 'mb-valor') || null) : null, observacao: val(el, 'mb-obs') || null });
        },
    });
}
function abrirFolhaGarrafas(d, tipo0 = 'saida') {
    const hoje = hojeISO();
    window.abrirSheetForm({
        titulo: d.membro.identificador + (d.membro.safra ? ' ' + d.membro.safra : ''), sub: `Saldo ${Number(d.membro.saldo || 0).toLocaleString('pt-BR')} garrafas`, rotuloSalvar: 'Registrar', empilhar: true,
        corpo: (el) => {
            el.innerHTML = campo('mb-tipo', 'Movimento', selectHtml('mb-tipo', [['saida', 'Saída (consumo, presente, venda)'], ['entrada', 'Entrada (compra, presente)'], ['ajuste', 'Ajustar o saldo (contagem)']], tipo0))
                + campo('mb-qtd', tipo0 === 'ajuste' ? 'Saldo contado' : 'Garrafas', '<input type="number" id="mb-qtd" inputmode="numeric" min="0" step="1" value="1">')
                + campo('mb-data', 'Em', `<input type="date" id="mb-data" value="${hoje}" max="${hoje}">`)
                + campo('mb-mot', 'Motivo <small id="mb-mot-op">(opcional)</small>', '<input type="text" id="mb-mot" maxlength="200" placeholder="Ex.: jantar de aniversário">');
            const sel = el.querySelector('#mb-tipo');
            const ajustar = () => {
                el.querySelector('label[for="mb-qtd"]').textContent = sel.value === 'ajuste' ? 'Saldo contado' : 'Garrafas';
                el.querySelector('#mb-mot-op').textContent = sel.value === 'ajuste' ? '' : '(opcional)';
            };
            sel.addEventListener('change', ajustar); ajustar();
        },
        aoSalvar: async (el) => {
            const tipo = val(el, 'mb-tipo');
            if (tipo === 'ajuste' && !val(el, 'mb-mot')) { mostrarToast('Diga o motivo do ajuste.', 'erro'); return false; }
            return movimentar(d, tipo, { quantidade: val(el, 'mb-qtd'), data: val(el, 'mb-data'), motivo: val(el, 'mb-mot') || null });
        },
    });
}
async function movimentar(d, tipo, dados) {
    const { data, error } = await api.dbAuth.rpc('fn_membro_movimentar', { p_membro_id: d.membro.id, p_tipo: tipo, p_dados: dados, p_canal: 'app' });
    if (error) { erroRpc(error, 'Não foi possível registrar.'); return false; }
    mostrarToast(tipo === 'transferencia' ? 'Transferido.' : tipo === 'saida' && d.membro.modo === 'individuo' ? 'Saída registrada.' : 'Registrado.', 'sucesso');
    setTimeout(async () => { await aposMudar(d.ativo.id); if (tipo !== 'transferencia') abrirFichaMembro(d.membro.id); }, 0);
    return true;
}
function abrirFolhaDesfazer(d) {
    window.abrirSheetForm({
        titulo: 'Desfazer a saída', sub: d.membro.identificador, rotuloSalvar: 'Desfazer', empilhar: true,
        corpo: campo('mb-mot', 'Motivo', '<input type="text" id="mb-mot" maxlength="200" placeholder="Ex.: venda cancelada">')
            + '<p class="rz-desc">O animal volta ao lote e o ciclo fechado na saída reabre. A receita da venda, se houver, continua no Financeiro.</p>',
        aoSalvar: async (el) => {
            const motivo = val(el, 'mb-mot');
            if (!motivo) { mostrarToast('Diga o motivo.', 'erro'); return false; }
            const { error } = await api.dbAuth.rpc('fn_membro_desfazer_saida', { p_membro_id: d.membro.id, p_motivo: motivo, p_canal: 'app' });
            if (error) { erroRpc(error, 'Não foi possível desfazer.'); return false; }
            mostrarToast('Saída desfeita.', 'sucesso');
            setTimeout(async () => { await aposMudar(d.ativo.id); abrirFichaMembro(d.membro.id); }, 0);
            return true;
        },
    });
}
function abrirFolhaEditar(d) {
    const m = d.membro, qtd = m.modo === 'quantidade', hoje = hojeISO(), ano = new Date().getFullYear();
    const corpo = qtd
        ? campo('mb-ident', 'Rótulo', `<input type="text" id="mb-ident" maxlength="60" value="${esc(m.identificador)}">`)
            + campo('mb-safra', 'Safra', `<input type="number" id="mb-safra" inputmode="numeric" min="1900" max="${ano}" value="${esc(m.safra || '')}">`)
            + `<div class="rz-mb-2">${campo('mb-jde', 'Beber a partir de', `<input type="number" id="mb-jde" min="1900" max="2200" value="${esc(m.dados?.janela_de || '')}">`)}
               ${campo('mb-jate', 'Beber até', `<input type="number" id="mb-jate" min="1900" max="2200" value="${esc(m.dados?.janela_ate || '')}">`)}</div>`
            + campo('mb-uva', 'Uva', `<input type="text" id="mb-uva" maxlength="80" value="${esc(m.dados?.uva || '')}">`)
            + campo('mb-prod', 'Produtor', `<input type="text" id="mb-prod" maxlength="80" value="${esc(m.dados?.produtor || '')}">`)
        : campo('mb-ident', 'Identificação', `<input type="text" id="mb-ident" maxlength="60" value="${esc(m.identificador)}">`)
            + campo('mb-nome', 'Nome', `<input type="text" id="mb-nome" maxlength="60" value="${esc(m.nome || '')}">`)
            + `<div class="rz-mb-2">${campo('mb-nasc', 'Nascimento', `<input type="date" id="mb-nasc" max="${hoje}" value="${esc(m.nascimento || '')}">`)}
               ${campo('mb-safra', 'ou safra', `<input type="number" id="mb-safra" min="1990" max="${ano}" value="${esc(m.safra || '')}">`)}</div>`
            + campo('mb-cat', 'Categoria', selectHtml('mb-cat', [['auto', 'Pela idade (sugerida)'], ...((d.catalogo?.categorias) || []).map(c => [c.codigo, c.nome])], m.categoria_manual ? m.categoria : 'auto'))
            + campo('mb-raca', 'Raça', `<input type="text" id="mb-raca" maxlength="60" list="mb-racas" value="${esc(m.raca || '')}"><datalist id="mb-racas">${((d.catalogo?.racas) || []).map(r => `<option value="${esc(r)}"></option>`).join('')}</datalist>`)
            + (m.sexo === 'femea' ? campo('mb-partos', 'Partos', `<input type="number" id="mb-partos" min="0" step="1" value="${esc(m.partos || 0)}">`, 'O parto confirmado no ciclo já soma sozinho.') : '')
            + campo('mb-peso', 'Peso de entrada (kg)', `<input type="number" id="mb-peso" min="0" step="0.1" value="${esc(m.dados?.peso || '')}">`);
    window.abrirSheetForm({
        titulo: 'Editar ' + m.identificador, sub: d.ativo.nome, rotuloSalvar: 'Salvar', empilhar: true,
        corpo: corpo + campo('mb-obs', 'Observação', `<input type="text" id="mb-obs" maxlength="200" value="${esc(m.dados?.observacao || '')}">`),
        aoSalvar: async (el) => {
            const dados = qtd
                ? { identificador: val(el, 'mb-ident'), safra: val(el, 'mb-safra'), janela_de: val(el, 'mb-jde') || null, janela_ate: val(el, 'mb-jate') || null,
                    uva: val(el, 'mb-uva') || null, produtor: val(el, 'mb-prod') || null, observacao: val(el, 'mb-obs') || null }
                : { identificador: val(el, 'mb-ident'), nome: val(el, 'mb-nome'), nascimento: val(el, 'mb-nasc'), safra: val(el, 'mb-safra'),
                    categoria: val(el, 'mb-cat') || 'auto', raca: val(el, 'mb-raca'), partos: val(el, 'mb-partos') || null, peso: val(el, 'mb-peso') || null,
                    observacao: val(el, 'mb-obs') || null };
            if (!dados.identificador) { mostrarToast('Diga a identificação.', 'erro'); return false; }
            const { error } = await api.dbAuth.rpc('fn_membro_editar', { p_membro_id: m.id, p_dados: dados, p_canal: 'app' });
            if (error) { erroRpc(error, 'Não foi possível salvar.'); return false; }
            mostrarToast('Cadastro salvo.', 'sucesso');
            setTimeout(async () => { await aposMudar(d.ativo.id); abrirFichaMembro(m.id); }, 0);
            return true;
        },
    });
}
function abrirFolhaAbrirCiclo(d) {
    const progs = d.programas_abrir || [], hoje = hojeISO();
    if (!progs.length) return;
    window.abrirSheetForm({
        titulo: 'Abrir ciclo', sub: d.membro.identificador, rotuloSalvar: 'Abrir', empilhar: true,
        corpo: (el) => {
            el.innerHTML = (progs.length > 1 ? campo('mb-prog', 'Programa', selectHtml('mb-prog', progs.map(p => [p.id, p.nome]))) : '')
                + `<div id="mb-fase-box"></div>` + campo('mb-data', 'Desde', `<input type="date" id="mb-data" value="${hoje}" max="${hoje}">`,
                    'Com a data da cobertura, o app prevê o diagnóstico, a secagem e o parto.');
            const pintar = () => {
                const p = progs.find(x => x.id === (el.querySelector('#mb-prog')?.value || progs[0].id)) || progs[0];
                el.querySelector('#mb-fase-box').innerHTML = campo('mb-fase', 'Começa em', selectHtml('mb-fase', (p.fases || []).map(f => [f.codigo, f.nome])));
            };
            pintar();
            el.querySelector('#mb-prog')?.addEventListener('change', pintar);
        },
        aoSalvar: async (el) => {
            const ap = el.querySelector('#mb-prog')?.value || progs[0].id;
            const { data, error } = await api.dbAuth.rpc('fn_membro_ciclo_abrir', { p_membro_id: d.membro.id, p_ativo_programa_id: ap,
                p_data: val(el, 'mb-data') || null, p_fase_codigo: val(el, 'mb-fase') || null, p_canal: 'app' });
            if (error) { erroRpc(error, 'Não foi possível abrir.'); return false; }
            mostrarToast('Ciclo aberto.', 'sucesso');
            setTimeout(async () => { await aposMudar(d.ativo.id); abrirFichaMembro(d.membro.id); }, 0);
            return true;
        },
    });
}
// Cria cadastrada no parto (D7-12): chamada pela tela do ciclo (cofre-controles.js) depois de confirmar o parto.
export async function cadastrarCria(mae, dados) {
    const { data, error } = await api.dbAuth.rpc('fn_membro_cadastrar', { p_ativo_id: mae.ativo_id,
        p_dados: { ...dados, especie: mae.especie, mae_id: mae.id, origem: 'nascido', entrada_data: dados.nascimento }, p_canal: 'app' });
    if (error) { erroRpc(error, 'A cria não foi cadastrada.'); return null; }
    return data;
}
