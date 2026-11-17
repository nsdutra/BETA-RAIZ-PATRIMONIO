// ============================================================================
// ativo-forma-pagamento.js — Raiz Patrimônio · Forma de pagamento do bem
// Versão: 1.0.0 · 16/11/2026
// v1.0.0 (16/11/2026, sessão 20261114-2342-investimentos-patrimonio, demanda fd3898f7; FICHA_FORMA_DE_PAGAMENTO_DO_BEM_RAIZ
//   v2.0.0, "Agora sim. Pode seguir em frente." — Nicola 16/11 21:46; só do plano Patrimônio em diante) — criação.
//   "Como foi pago?" monta o fluxo de pagamento da compra: as partes de cada forma vêm do catálogo de modelos
//   (cofre_modelos_item_controle, escopo forma_pagamento) — aqui não mora regra de forma, só a tela. Cada parte, por pessoa
//   que paga (a conta de quem paga), vira um item de controle com as ocorrências e as saídas previstas (natureza
//   Investimento). Datas passadas: pergunta sempre se já foram pagas. O card Valor do bem mostra o resumo da compra no total
//   e por pessoa (fn_ativo_resumo_compra) e oferece atualizar os proprietários quando o % do fluxo difere do cadastro.
// Código de acesso: cofre.ativos.forma_pagamento (planos Patrimônio, Premium e Gestão).
// ============================================================================
export const VERSAO = '1.0.0'; // v-check: lido por ⚙️ › Conta › Versões — manter igual ao header
import { estado } from './cofre-estado.js';
import * as api from './cofre-api.js';
import { mostrarToast, refrescarIcones, perguntar, escolher } from './cofre-ui.js';
import { escapeHtml, formatarDataBR } from './cofre-validacoes.js';
import { criarItemParcelado, abrirTodosProgramas } from './cofre-controles.js';
import { emitirEscrita } from './raiz-eventos.js';

export const CODIGO_FORMA = 'cofre.ativos.forma_pagamento';

// Nome e explicação de cada forma (só texto de tela; as partes vêm do banco)
const FORMAS = [
    { valor: 'ja_quitado', titulo: 'Já quitado', sub: 'Bem pago; só registra o valor e a data da compra', icone: 'badge-check' },
    { valor: 'a_vista', titulo: 'À vista', sub: 'Um pagamento, mais custos da compra', icone: 'banknote' },
    { valor: 'entrada_parcelas', titulo: 'Entrada + parcelas', sub: 'Sinal e pagamentos com datas e valores livres', icone: 'list-ordered' },
    { valor: 'planta', titulo: 'Compra na planta', sub: 'Sinal, mensais, intercaladas e chaves', icone: 'building-2' },
    { valor: 'construcao_coletiva', titulo: 'Construção coletiva', sub: 'Abre o programa da obra', icone: 'hard-hat' },
    { valor: 'financiamento', titulo: 'Financiamento', sub: 'Entrada e parcelas ao banco', icone: 'landmark' },
];
export const rotuloForma = (f) => FORMAS.find(x => x.valor === f)?.titulo || '';

const moeda = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const num = (el) => { const v = parseFloat(String(el?.value ?? '').replace(',', '.')); return Number.isFinite(v) ? v : null; };
const hojeIso = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const somarMeses = (iso, m) => {
    const [y, mo, d] = iso.split('-').map(Number);
    const dt = new Date(Date.UTC(y, mo - 1 + m, 1));
    const ultimo = new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth() + 1, 0)).getUTCDate();
    dt.setUTCDate(Math.min(d, ultimo));
    return dt.toISOString().slice(0, 10);
};
export const formaPagamentoLiberada = () => typeof window === 'undefined' || typeof window.podeUsar !== 'function' || window.podeUsar(CODIGO_FORMA).ok === true;

// ---- Resumo no card Valor do bem ------------------------------------------------------------------------------
export async function montarPagamentoNoCard(a, card) {
    if (!card || !formaPagamentoLiberada()) return;
    const { data: r, error } = await api.dbAuth.rpc('fn_ativo_resumo_compra', { p_ativo_id: a.id });
    if (error || !r) return;
    card.querySelector('[data-fp-bloco]')?.remove();
    if (!r.forma && !(r.parcelas > 0)) return;
    const pessoas = (r.pessoas || []).filter(p => Number(p.total) > 0 || p.pct_propriedade != null);
    const prox = r.proxima ? `Próxima: ${formatarDataBR(r.proxima.vencimento)} · ${moeda(r.proxima.valor)}` : '';
    const situacao = r.quitado_em ? `Quitado em ${formatarDataBR(r.quitado_em)}` : prox;
    const pct = Number(r.total_parcelas) > 0 ? Math.round(Number(r.pago) / Number(r.total_parcelas) * 100) : null;
    const linhaPessoa = (p) => `<div class="rz-row"><div class="rz-tx"><b>${escapeHtml(p.nome || 'Sem pagante')}</b>
        <span>${Number(p.total) > 0 ? `Pagou ${escapeHtml(moeda(p.pago))} de ${escapeHtml(moeda(p.total))}` : 'Sem pagamentos no fluxo'}${p.pct_fluxo != null && Number(p.total) > 0 ? ` · ${String(p.pct_fluxo).replace('.', ',')}% do fluxo` : ''}${p.pct_propriedade != null ? ` · ${String(p.pct_propriedade).replace('.', ',')}% proprietário` : ''}</span></div></div>`;
    const bloco = document.createElement('div');
    bloco.setAttribute('data-fp-bloco', '');
    bloco.innerHTML = `<div class="rz-group">Pagamento${r.forma ? ' · ' + escapeHtml(rotuloForma(r.forma)) : ''}</div>
        ${r.parcelas > 0 ? `<div class="rz-kv">
            <div><small>Pago</small><b>${escapeHtml(moeda(r.pago))}</b><small>${r.pagas} de ${r.parcelas} pagamentos${pct != null ? ` · ${pct}%` : ''}</small></div>
            <div><small>A pagar</small><b>${escapeHtml(moeda(r.a_pagar))}</b>${situacao ? `<small>${escapeHtml(situacao)}</small>` : ''}</div>
        </div>` : ''}
        ${pessoas.length ? `<div class="rz-list">${pessoas.map(linhaPessoa).join('')}</div>` : ''}
        ${r.propriedade_difere ? `<button type="button" class="rz-act" data-fp-prop><div class="rz-ic"><i data-lucide="users"></i></div><div>Atualizar proprietários<small>O % pago por pessoa difere do cadastro</small></div></button>` : ''}`;
    card.appendChild(bloco);
    bloco.querySelector('[data-fp-prop]')?.addEventListener('click', () => atualizarProprietarios(a, r));
    refrescarIcones?.();
}

async function atualizarProprietarios(a, r) {
    const pagantes = (r.pessoas || []).filter(p => Number(p.total) > 0 && p.nome !== 'Sem pagante');
    if (!pagantes.length) return;
    if (pagantes.some(p => !p.pessoa_id)) {
        mostrarToast('Há quem pague por conta sem titular cadastrado: ajuste a divisão na Propriedade.', 'aviso');
        if (typeof window.abrirEditarPropriedadeAtivo === 'function') window.abrirEditarPropriedadeAtivo();
        return;
    }
    // % do fluxo arredondado para fechar 100
    const total = pagantes.reduce((s, p) => s + Number(p.total), 0);
    let resto = 100;
    const linhas = pagantes.map((p, i) => {
        const pc = i === pagantes.length - 1 ? Math.round(resto * 100) / 100 : Math.round(Number(p.total) / total * 10000) / 100;
        resto -= pc;
        return { tipo_proprietario: 'socio_interno', pessoa_id: p.pessoa_id, nome_externo: '', percentual: pc, nome: p.nome };
    });
    const ok = await perguntar({
        titulo: 'Atualizar proprietários pelo fluxo?',
        impacto: linhas.map(l => `${l.nome}: ${String(l.percentual).replace('.', ',')}%`).join(' · ') + '. Substitui a divisão de propriedade do bem.',
        rotuloConfirmar: 'Atualizar', rotuloCancelar: 'Manter', icone: 'users',
    });
    if (!ok) return;
    try {
        await api.salvarPropriedadeAtivo(a.id, linhas.map(({ nome, ...l }) => l));
        mostrarToast('Proprietários atualizados.', 'sucesso');
        emitirEscrita('ativo', { id: a.id, acao: 'propriedade-pelo-fluxo' });
        window.dispatchEvent(new CustomEvent('cofre:recarregar-ativos'));
    } catch (e) { mostrarToast('Não foi possível atualizar: ' + (e.message || 'erro'), 'erro'); }
}

// ---- "Como foi pago?" ------------------------------------------------------------------------------------------
export async function abrirFormaPagamento(a, opcoes = {}) {
    if (!formaPagamentoLiberada()) { if (typeof window.rzMostrarBloqueio === 'function') window.rzMostrarBloqueio(CODIGO_FORMA); return; }
    const forma = await escolher({ titulo: 'Como o bem foi pago?', sub: a.nome_exibicao, opcoes: FORMAS });
    if (!forma) return;
    if (forma === 'construcao_coletiva') {
        mostrarToast('Comece o programa Construção coletiva: as mensalidades da obra entram como pagamento da compra.', 'sucesso');
        if (typeof abrirTodosProgramas === 'function') abrirTodosProgramas();
        return;
    }
    const [{ data: compra }, { data: modelos, error: eMod }, contas, donos] = await Promise.all([
        api.dbAuth.from('ativo_valores').select('valor, data_base').eq('ativo_id', a.id).eq('tipo', 'aquisicao').maybeSingle(),
        api.dbAuth.from('cofre_modelos_item_controle').select('id, subtipo_id, titulo_sugerido, frequencia_intervalo, frequencia_unidade, parcelas, automatico, criado_em')
            .eq('escopo_tipo', 'forma_pagamento').eq('escopo_valor', forma).eq('ativo', true).is('cliente_id', null).order('criado_em'),
        listarContas(),
        api.dbAuth.from('propriedade_ativo').select('pessoa_id, nome_externo, percentual').eq('ativo_id', a.id).then(x => x.data || [], () => []),
    ]);
    if (eMod) { mostrarToast('Catálogo de formas indisponível.', 'erro'); return; }
    abrirFormulario(a, forma, compra || null, modelos || [], contas, donos, opcoes);
}

async function listarContas() {
    try {
        const { data } = await api.dbAuth.rpc('fn_contas_listar', { p_cliente_id: estado.clienteId });
        const lista = Array.isArray(data?.dados) ? data.dados : [];
        return lista.filter(c => c && c.id && c.tipo !== 'cartao_credito' && (c.situacao || 'ativa') === 'ativa');
    } catch (_) { return []; }
}

const tipoParte = (m) => (Array.isArray(m.parcelas) && m.parcelas.length === 1) ? 'unica'
    : (m.frequencia_intervalo && m.frequencia_unidade) ? 'serie' : 'livre';

function abrirFormulario(a, forma, compra, modelos, contas, donos, opcoes) {
    if (typeof window.abrirSheetForm !== 'function') { mostrarToast('Abra pelo app principal.', 'erro'); return; }
    const hoje = hojeIso();
    const donosComConta = donos.filter(d => d.pessoa_id && contas.some(c => c.pessoa_id === d.pessoa_id));
    const podeDividir = donosComConta.length > 1 && donosComConta.length === donos.length;
    const opcoesPagante = (padrao) => `<option value="">Quem paga…</option>${podeDividir ? `<option value="__donos__"${padrao === '__donos__' ? ' selected' : ''}>Dividir pelos proprietários</option>` : ''}`
        + contas.map(c => `<option value="${escapeHtml(c.id)}"${padrao === c.id ? ' selected' : ''}>${escapeHtml(c.nome || 'Conta')}</option>`).join('');
    const padraoPagante = podeDividir ? '__donos__' : (contas.find(c => c.padrao)?.id || contas[0]?.id || '');
    const linhaLivre = (k) => `<div class="rz-kv" data-fp-livre><div class="rz-f"><label>Data</label><input type="date" data-fp-d="${k}"></div><div class="rz-f"><label>Valor (R$)</label><input type="number" step="0.01" min="0" inputmode="decimal" data-fp-v="${k}"></div></div>`;
    const blocoParte = (m, i) => {
        const t = tipoParte(m);
        const freq = t === 'serie' ? (Number(m.frequencia_intervalo) === 1 ? 'todo mês' : `a cada ${m.frequencia_intervalo} meses`) : '';
        const campos = t === 'unica'
            ? `<div class="rz-kv"><div class="rz-f"><label>Valor (R$)</label><input type="number" step="0.01" min="0" inputmode="decimal" data-fp-valor></div><div class="rz-f"><label>Data</label><input type="date" data-fp-data></div></div>`
            : t === 'serie'
            ? `<div class="rz-kv"><div class="rz-f"><label>Valor da parcela (R$)</label><input type="number" step="0.01" min="0" inputmode="decimal" data-fp-valor></div><div class="rz-f"><label>Parcelas</label><input type="number" min="1" max="480" step="1" inputmode="numeric" data-fp-n></div></div>
               <div class="rz-f"><label>1º vencimento <small>(${escapeHtml(freq)})</small></label><input type="date" data-fp-data></div>`
            : `<div data-fp-livres>${linhaLivre(0)}${linhaLivre(1)}</div><button type="button" class="rz-act" data-fp-mais><div class="rz-ic"><i data-lucide="plus"></i></div><div>Mais um pagamento</div></button>`;
        return `<div class="rz-card" data-fp-parte="${i}" style="margin-bottom:10px">
            <label class="rz-row" style="gap:10px;cursor:pointer"><input type="checkbox" data-fp-on${m.automatico ? ' checked' : ''} style="width:22px;height:22px"><div class="rz-tx"><b>${escapeHtml(m.titulo_sugerido)}</b></div></label>
            <div data-fp-campos${m.automatico ? '' : ' class="hidden"'}>${campos}
            <div class="rz-f" style="margin-bottom:0"><label>Quem paga</label><select data-fp-pag>${opcoesPagante(padraoPagante)}</select></div></div>
        </div>`;
    };
    const ehQuitado = forma === 'ja_quitado';
    window.abrirSheetForm({
        titulo: rotuloForma(forma), sub: a.nome_exibicao, rotuloSalvar: 'Salvar',
        corpo: (el) => {
            el.innerHTML = `<div class="rz-f"><label for="fp-compra-valor">Valor da compra (R$)</label><input type="number" step="0.01" min="0" inputmode="decimal" id="fp-compra-valor" value="${compra ? Number(compra.valor) : ''}"></div>
                <div class="rz-f"><label for="fp-compra-data">Data da compra</label><input type="date" id="fp-compra-data" max="${hoje}" value="${compra ? compra.data_base : ''}">
                <span class="rz-hint">${ehQuitado ? 'Entra no valor do patrimônio, não no caixa do período.' : 'É o custo do bem. O caixa conta só os pagamentos abaixo.'}</span></div>
                ${ehQuitado ? '' : (contas.length ? '' : '<p class="rz-desc">Cadastre a conta de quem paga em Financeiro › Contas para dividir por pessoa.</p>') + modelos.map(blocoParte).join('')}`;
            el.addEventListener('change', (ev) => {
                const on = ev.target.closest('[data-fp-on]');
                if (on) on.closest('[data-fp-parte]').querySelector('[data-fp-campos]').classList.toggle('hidden', !on.checked);
            });
            el.addEventListener('click', (ev) => {
                const mais = ev.target.closest('[data-fp-mais]');
                if (!mais) return;
                const lista = mais.previousElementSibling;
                lista.insertAdjacentHTML('beforeend', linhaLivre(lista.children.length));
            });
        },
        aoSalvar: async (el) => salvar(a, forma, compra, modelos, contas, donos, el, opcoes),
    });
}

function lerPartes(modelos, el) {
    const partes = [];
    for (const [i, m] of modelos.entries()) {
        const box = el.querySelector(`[data-fp-parte="${i}"]`);
        if (!box || !box.querySelector('[data-fp-on]').checked) continue;
        const t = tipoParte(m);
        let ocs = [];
        if (t === 'unica') {
            const v = num(box.querySelector('[data-fp-valor]')), d = box.querySelector('[data-fp-data]').value;
            if (!(v > 0) || !d) throw new Error(`${m.titulo_sugerido}: informe valor e data.`);
            ocs = [{ data: d, valor: v }];
        } else if (t === 'serie') {
            const v = num(box.querySelector('[data-fp-valor]')), n = parseInt(box.querySelector('[data-fp-n]').value, 10), d = box.querySelector('[data-fp-data]').value;
            if (!(v > 0) || !(n >= 1 && n <= 480) || !d) throw new Error(`${m.titulo_sugerido}: informe valor, parcelas e 1º vencimento.`);
            for (let k = 0; k < n; k++) ocs.push({ data: somarMeses(d, k * Number(m.frequencia_intervalo)), valor: v });
        } else {
            box.querySelectorAll('[data-fp-livre]').forEach(r => {
                const d = r.querySelector('[data-fp-d]').value, v = num(r.querySelector('[data-fp-v]'));
                if (d || v) { if (!(v > 0) || !d) throw new Error(`${m.titulo_sugerido}: cada pagamento precisa de data e valor.`); ocs.push({ data: d, valor: v }); }
            });
            if (!ocs.length) throw new Error(`${m.titulo_sugerido}: informe ao menos um pagamento, ou desmarque.`);
            const datas = ocs.map(o => o.data);
            if (new Set(datas).size !== datas.length) throw new Error(`${m.titulo_sugerido}: dois pagamentos na mesma data — some os dois.`);
            ocs.sort((x, y) => x.data.localeCompare(y.data));
        }
        const pag = box.querySelector('[data-fp-pag]').value;
        partes.push({ modelo: m, ocs, pag });
    }
    return partes;
}

// Divide os valores entre quem paga; o último leva a sobra do arredondamento
function dividir(ocs, fatias) {
    return fatias.map((f, idx) => ({
        ...f,
        ocs: ocs.map(o => {
            const antes = fatias.slice(0, idx).reduce((s, g) => s + Math.round(o.valor * g.pct) / 100, 0);
            const v = idx === fatias.length - 1 ? Math.round((o.valor - antes) * 100) / 100 : Math.round(o.valor * f.pct) / 100;
            return { data: o.data, valor: v };
        }).filter(o => o.valor > 0),
    }));
}

async function salvar(a, forma, compra, modelos, contas, donos, el, opcoes) {
    const valorCompra = num(el.querySelector('#fp-compra-valor'));
    const dataCompra = el.querySelector('#fp-compra-data').value || null;
    if (!(valorCompra > 0) || !dataCompra) { mostrarToast('Informe o valor e a data da compra.', 'erro'); return false; }
    if (dataCompra > hojeIso()) { mostrarToast('A data da compra não pode ser futura.', 'erro'); return false; }
    let partes = [];
    if (forma !== 'ja_quitado') {
        try { partes = lerPartes(modelos, el); } catch (e) { mostrarToast(e.message, 'erro'); return false; }
        if (!partes.length) { mostrarToast('Marque ao menos uma parte do pagamento.', 'erro'); return false; }
        if (partes.some(p => !p.pag)) { mostrarToast('Escolha quem paga em cada parte.', 'erro'); return false; }
    }
    // Datas passadas: pergunta sempre (decisão do Nicola, 16/11)
    const hoje = hojeIso();
    const vencidas = partes.reduce((s, p) => s + p.ocs.filter(o => o.data < hoje).length, 0);
    let jaPagas = false;
    if (vencidas) {
        const r = await escolher({
            titulo: `${vencidas} ${vencidas === 1 ? 'pagamento tem' : 'pagamentos têm'} data passada`, sub: 'Já foram pagos?',
            opcoes: [{ valor: 'sim', titulo: 'Sim, já foram pagos', sub: 'Entram baixados na data de cada um', icone: 'check' },
                     { valor: 'nao', titulo: 'Não, estão em aberto', sub: 'Ficam como contas a pagar', icone: 'clock' }],
        });
        if (!r) return false;
        jaPagas = r === 'sim';
    }
    const { error: eReg } = await api.dbAuth.rpc('fn_ativo_valor_registrar', {
        p_ativo_id: a.id, p_tipo: 'aquisicao', p_data_base: dataCompra, p_valor: valorCompra,
        p_lancamento_id: null, p_observacao: null, p_canal: 'app', p_forma: forma,
    });
    if (eReg) { mostrarToast('A compra não foi registrada: ' + (eReg.message || 'erro'), 'erro'); return false; }

    let criados = 0;
    const nomeConta = (id) => contas.find(c => c.id === id)?.nome || '';
    try {
        for (const p of partes) {
            let fatias;
            if (p.pag === '__donos__') {
                const soma = donos.reduce((s, d) => s + Number(d.percentual || 0), 0) || 100;
                fatias = donos.map(d => { const c = contas.find(x => x.pessoa_id === d.pessoa_id && x.padrao) || contas.find(x => x.pessoa_id === d.pessoa_id); return { contaId: c.id, nome: c.nome, pct: Number(d.percentual || 0) / soma * 100 }; });
            } else fatias = [{ contaId: p.pag, nome: nomeConta(p.pag), pct: 100 }];
            for (const f of dividir(p.ocs, fatias)) {
                if (!f.ocs.length) continue;
                await criarItemParcelado({
                    ativoId: a.id, subtipoId: p.modelo.subtipo_id, contaId: f.contaId,
                    titulo: fatias.length > 1 ? `${p.modelo.titulo_sugerido} — ${f.nome}` : p.modelo.titulo_sugerido,
                    ocorrencias: f.ocs, jaPagas,
                });
                criados++;
            }
        }
    } catch (e) {
        mostrarToast(`Compra registrada, mas parte do fluxo falhou (${criados} itens criados): ${e.message || 'erro'}`, 'erro');
        opcoes.aoConcluir?.();
        return true;
    }
    mostrarToast(forma === 'ja_quitado' ? 'Compra registrada como quitada.' : `Fluxo de pagamento criado (${criados} ${criados === 1 ? 'item' : 'itens'} nos Controles).`, 'sucesso');
    emitirEscrita('ativo', { id: a.id, acao: 'forma-pagamento', forma });
    opcoes.aoConcluir?.();
    return true;
}
