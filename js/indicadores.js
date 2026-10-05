// =====================================================================
// RAIZ PATRIMÔNIO — js/indicadores.js
// VERSÃO: Beta v1.0.0 (04/10/2026 — demanda e42f649b)
// LINHAS: (ver versoes.json)
// -----------------------------------------------------------------
// NOVIDADES (Beta v1.0.0) — frente 5, fatia 5B (sessão 20261004-1800-indicadores; "De acordo
//   com D1 e 5B" e "Simulador ipca, incc e igpm. Demais não." do Nicola, 04/10 22:06; protótipo
//   PROTOTIPO_INDICADORES_RAIZ v1.0.0). Módulo novo, lazy (UI-05): só carrega quando a pessoa toca
//   em "Ver todos" no card Indicadores (Hoje › Resultados). Abre um sheet cheio com três recortes
//   do mesmo conteúdo, em segmento (UXR-16):
//     — Mês a mês: tabela meses × 6 indicadores (só meses fechados), acumulado no ano e em 12
//       meses — fn_indicadores_mensal.
//     — Sua carteira: contratos e receita por índice; índice ponderado da carteira contra cada
//       indicador em 12, 24 e 36 meses — fn_carteira_indices_resumo.
//     — Simulador: destino IPCA, IGP-M ou INCC-DI; janela 12/24/36 meses (média por ano); por
//       contrato e no total, respeitando piso e teto; texto-proposta montado por regra no banco,
//       com a ressalva de não ser recomendação — fn_simular_troca_indice_carteira.
//   Nenhuma conta de índice aqui: o módulo só desenha o que o banco devolve (CAN-01/CAN-03).
//   Acesso pelo código resultados.indicadores (quem chama checa podeUsar; o banco recusa sem ele).
// =====================================================================
// Depende de globais do index.html: dbAuth, CLIENTE_ID_SUPABASE, abrirSheet, rzSheetCabecalho,
// rzEsc, rzIcones, formatarMoedaBR.

export const VERSAO = '1.0.0';

const NOME = { ipca: 'IPCA', igpm: 'IGP-M', inccdi: 'INCC-DI', selic: 'Selic', cdi: 'CDI', ivgr: 'IVG-R' };
const ORDEM = ['ipca', 'igpm', 'inccdi', 'selic', 'cdi', 'ivgr'];
const DESTINOS = ['ipca', 'igpm', 'inccdi'];
const MES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const COR = { ipca: 'var(--sprout)', igpm: 'var(--wine)', inccdi: 'var(--info)' };

let estado = { aba: 'mes', ano: new Date().getFullYear(), janelaCart: 12, destino: 'ipca', janelaSim: 12 };
let cache = {};

const esc = (t) => (typeof rzEsc === 'function' ? rzEsc(t) : String(t ?? ''));
const pct = (v, sinal = true) => v == null ? '—' : (sinal && Number(v) >= 0 ? '+' : '') + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';
const brl = (v) => formatarMoedaBR(Number(v) || 0, { semCentavos: true });
const brlS = (v) => (Number(v) >= 0 ? '+' : '−') + formatarMoedaBR(Math.abs(Number(v) || 0), { semCentavos: true });
const comp = (iso) => { if (!iso) return ''; const [a, m] = String(iso).split('-'); return `${MES[(+m || 1) - 1]}/${String(a).slice(2)}`; };
const nomeInd = (c) => NOME[c] || 'Sem índice reconhecido';

export function abrirTelaIndicadores(ano) {
    if (ano) estado.ano = Number(ano);
    estado.aba = 'mes';
    cache = {};
    abrirSheet(rzSheetCabecalho('Indicadores', 'Hoje › Resultados') +
        `<div class="rz-sh-b">
            <div class="rz-seg" role="tablist" id="ind-seg">
                <button type="button" data-a="mes">Mês a mês</button>
                <button type="button" data-a="cart">Sua carteira</button>
                <button type="button" data-a="sim">Simulador</button>
            </div>
            <div id="ind-corpo"></div>
        </div>`, { classe: 'rz-cheio' });
    document.querySelectorAll('#ind-seg button').forEach(b => b.addEventListener('click', () => { estado.aba = b.dataset.a; desenhar(); }));
    desenhar();
}

function esqueleto() {
    return (typeof window.rzSkeleton === 'function') ? window.rzSkeleton('cards', 2) : '<p class="rz-desc">Carregando…</p>';
}

function falha(corpo) {
    corpo.innerHTML = `<div class="rz-card"><p class="rz-desc">Não deu para carregar agora.</p>
        <button type="button" class="rz-btn rz-btn-2" id="ind-tentar" style="margin-top:10px">Tentar de novo</button></div>`;
    corpo.querySelector('#ind-tentar')?.addEventListener('click', () => { cache = {}; desenhar(); });
}

async function desenhar() {
    document.querySelectorAll('#ind-seg button').forEach(b => b.classList.toggle('rz-on', b.dataset.a === estado.aba));
    const corpo = document.getElementById('ind-corpo');
    if (!corpo) return;
    corpo.innerHTML = esqueleto();
    try {
        if (estado.aba === 'mes') corpo.innerHTML = await telaMes();
        else if (estado.aba === 'cart') corpo.innerHTML = await telaCarteira();
        else corpo.innerHTML = await telaSimulador();
        ligar(corpo);
        if (typeof rzIcones === 'function') rzIcones();
    } catch (err) {
        console.warn('[indicadores] falha ao carregar:', err?.message);
        falha(corpo);
    }
}

function ligar(corpo) {
    corpo.querySelectorAll('[data-ano]').forEach(b => b.addEventListener('click', () => { estado.ano = Number(b.dataset.ano); delete cache.mes; desenhar(); }));
    corpo.querySelectorAll('[data-jc]').forEach(b => b.addEventListener('click', () => { estado.janelaCart = Number(b.dataset.jc); desenhar(); }));
    corpo.querySelectorAll('[data-dest]').forEach(b => b.addEventListener('click', () => { estado.destino = b.dataset.dest; desenhar(); }));
    corpo.querySelectorAll('[data-js]').forEach(b => b.addEventListener('click', () => { estado.janelaSim = Number(b.dataset.js); desenhar(); }));
}

async function rpc(nome, args) {
    const { data, error } = await dbAuth.rpc(nome, args);
    if (error) throw error;
    return data;
}

// ---------------------------------------------------------------- Mês a mês
const TD = 'text-align:right;padding:9px 8px;border-top:1px solid var(--line);white-space:nowrap';
const TD1 = 'text-align:left;padding:9px 12px;border-top:1px solid var(--line);position:sticky;left:0;background:var(--card);white-space:nowrap';

async function telaMes() {
    const chave = 'mes' + estado.ano;
    const d = cache[chave] || (cache[chave] = await rpc('fn_indicadores_mensal', { p_ano: estado.ano }));
    const anoAtual = new Date().getFullYear();
    const anos = [anoAtual - 2, anoAtual - 1, anoAtual];
    const celula = (v) => v == null
        ? `<td style="${TD};color:var(--muted)">—</td>`
        : `<td style="${TD}${Number(v) < 0 ? ';color:var(--danger)' : ''}">${pct(v, false)}</td>`;
    const linhas = (d.meses || []).map(m =>
        `<tr><td style="${TD1}">${comp(m.competencia)}</td>${ORDEM.map(c => celula(m.valores?.[c])).join('')}</tr>`).join('');
    const tot = (rotulo, obj) => `<tr style="font-weight:700">
        <td style="${TD1};background:var(--tile)">${rotulo}</td>
        ${ORDEM.map(c => `<td style="${TD};background:var(--tile)">${pct(obj?.[c], false)}</td>`).join('')}</tr>`;
    const a12 = Object.fromEntries(ORDEM.map(c => [c, d.acumulados?.[c]?.a12]));
    return `<div class="rz-chips">${anos.map(a => `<button type="button" class="rz-chip ${estado.ano === a ? 'rz-on' : ''}" data-ano="${a}">${a}</button>`).join('')}</div>
        <div class="rz-card" style="padding:8px 0">
            <div style="overflow-x:auto">
                <table style="border-collapse:separate;border-spacing:0;font-size:13px;min-width:520px;width:100%;font-variant-numeric:tabular-nums">
                    <thead><tr style="color:var(--muted);font-size:12px">
                        <th style="text-align:left;padding:8px 12px;position:sticky;left:0;background:var(--card)">Mês</th>
                        ${ORDEM.map(c => `<th style="text-align:right;padding:8px">${NOME[c]}</th>`).join('')}</tr></thead>
                    <tbody>
                        ${linhas || `<tr><td colspan="7" style="padding:12px" class="rz-desc">Sem meses fechados neste ano.</td></tr>`}
                        ${tot('No ano', d.acum_ano)}
                        ${estado.ano === anoAtual ? tot('12 meses', a12) : ''}
                    </tbody>
                </table>
            </div>
        </div>
        <p class="rz-desc">"—" = o índice daquele mês ainda não saiu. IVG-R aparece como variação sobre o mês anterior. O mês em andamento (Selic e CDI) não entra. Arraste a tabela para o lado.</p>`;
}

// ---------------------------------------------------------------- Sua carteira
async function telaCarteira() {
    const d = cache.cart || (cache.cart = await rpc('fn_carteira_indices_resumo', { p_cliente_id: CLIENTE_ID_SUPABASE }));
    if (!d.contratos) {
        return `<div class="rz-card"><div class="rz-empty" style="padding:14px 8px"><p>Nenhum contrato ativo com valor para comparar.</p></div></div>`;
    }
    const j = estado.janelaCart, k = 'a' + j;
    const pond = d.ponderado?.[k];
    const comp1 = [{ n: 'Sua carteira', v: pond, me: true }, ...ORDEM.map(c => ({ n: NOME[c], v: d.indicadores?.[c]?.[k] }))];
    const max = Math.max(...comp1.map(x => Number(x.v) || 0), 0.01);
    const grupos = d.grupos || [];
    return `<div class="rz-card">
            <div class="rz-card-h" style="justify-content:space-between"><b>Contratos por índice</b><span class="rz-desc">${d.contratos} ativos · ${brl(d.receita)}/mês</span></div>
            <div style="display:flex;height:14px;border-radius:7px;overflow:hidden;margin:10px 0 8px">${grupos.map(g => `<i style="display:block;width:${g.pct_receita}%;background:${COR[g.codigo] || 'var(--sage)'}"></i>`).join('')}</div>
            ${grupos.map(g => `<div style="display:flex;align-items:center;gap:8px;font-size:13px;margin:4px 0"><span style="width:9px;height:9px;border-radius:50%;background:${COR[g.codigo] || 'var(--sage)'}"></span>
                <span style="flex:1">${esc(nomeInd(g.codigo))} · ${g.contratos} contrato${g.contratos > 1 ? 's' : ''}</span><b>${String(g.pct_receita).replace('.', ',')}% da receita</b></div>`).join('')}
        </div>
        <div class="rz-card">
            <div class="rz-card-h" style="justify-content:space-between"><b>Seu índice ponderado × mercado</b></div>
            <div class="rz-chips" style="margin-top:8px">${[12, 24, 36].map(x => `<button type="button" class="rz-chip ${j === x ? 'rz-on' : ''}" data-jc="${x}">${x} meses</button>`).join('')}</div>
            ${comp1.map(x => `<div style="margin:8px 0">
                <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px"><span>${x.n}</span><b style="${x.me ? 'color:var(--sprout)' : ''}">${pct(x.v)}</b></div>
                <div style="height:8px;background:var(--tile);border-radius:4px"><i style="display:block;height:100%;border-radius:4px;width:${x.v == null ? 0 : Math.max(0, Number(x.v)) / max * 100}%;background:${x.me ? 'var(--sprout)' : 'var(--sage)'}"></i></div>
            </div>`).join('')}
            <p class="rz-desc" style="margin-top:8px">Índice ponderado = média dos índices dos seus contratos, pesada pelo aluguel de cada um, no acumulado de ${j} meses. Mostra quanto a receita sobe por reajuste, comparado à inflação e aos juros.</p>
        </div>`;
}

// ---------------------------------------------------------------- Simulador
async function telaSimulador() {
    const chave = `sim-${estado.destino}-${estado.janelaSim}`;
    const d = cache[chave] || (cache[chave] = await rpc('fn_simular_troca_indice_carteira', {
        p_cliente_id: CLIENTE_ID_SUPABASE, p_codigo: estado.destino, p_janela_meses: estado.janelaSim }));
    const seletores = `<p class="rz-desc" style="margin:2px 0 6px">Trocar a carteira para</p>
        <div class="rz-chips">${DESTINOS.map(c => `<button type="button" class="rz-chip ${estado.destino === c ? 'rz-on' : ''}" data-dest="${c}">${NOME[c]}</button>`).join('')}</div>
        <p class="rz-desc" style="margin:2px 0 6px">Janela</p>
        <div class="rz-chips">${[12, 24, 36].map(x => `<button type="button" class="rz-chip ${estado.janelaSim === x ? 'rz-on' : ''}" data-js="${x}">${x} meses</button>`).join('')}</div>`;
    if (!d.ok) return seletores + `<div class="rz-card"><p class="rz-desc">${esc(d.mensagem || 'Sem histórico suficiente para esta janela.')}</p></div>`;
    const t = d.totais || {};
    if (!t.contratos) return seletores + `<div class="rz-card"><p class="rz-desc">Nenhum contrato ativo com valor para simular.</p></div>`;
    const dif = Number(t.diferenca_mensal) || 0;
    const linhas = (d.contratos || []).map((c, i) => `<div class="rz-row" style="${i ? '' : 'border-top:0'}">
        <div class="rz-tx"><b style="display:block;font-weight:600;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(c.nome)}</b>
            <span class="rz-desc">${esc(nomeInd(c.indice_atual))} ${c.reajuste_atual == null ? '—' : brl(c.reajuste_atual)} → ${NOME[d.destino]} ${brl(c.reajuste_simulado)}${(c.piso != null || c.teto != null) ? ' · com piso/teto' : ''}</span></div>
        <div class="rz-rt"><b style="font-size:14px;${c.ja_esta ? '' : (Number(c.diferenca_mensal) >= 0 ? 'color:var(--success)' : 'color:var(--danger)')}">${c.ja_esta ? 'já está' : brlS(c.diferenca_mensal)}</b></div>
    </div>`).join('');
    return seletores + `
        <div style="background:var(--pine);color:var(--card);border-radius:16px;padding:14px 16px;margin-bottom:12px">
            <small style="font-size:12px;opacity:.85">${t.mudam ? `Se os ${t.mudam} contrato${t.mudam > 1 ? 's' : ''} fora do ${NOME[d.destino]} mudassem para ele` : `Todos os contratos já estão no ${NOME[d.destino]}`}</small>
            <div style="font-family:'Bricolage Grotesque',sans-serif;font-size:26px;font-weight:700">${brlS(dif)} por mês</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,.18)">
                <div><small style="font-size:12px;opacity:.85">No ano</small><b style="display:block;font-size:17px">${brlS(dif * 12)}</b></div>
                <div><small style="font-size:12px;opacity:.85">Reajuste médio simulado</small><b style="display:block;font-size:17px">${pct(t.reajuste_medio_simulado)}</b></div>
            </div>
        </div>
        <div class="rz-card">
            <div class="rz-card-h" style="justify-content:space-between"><b>Por contrato</b><span class="rz-desc">reajuste por mês</span></div>
            ${linhas}
            <p class="rz-desc" style="margin-top:10px">${estado.janelaSim === 12 ? 'Acumulado dos últimos 12 meses fechados.' : `Média por ano equivalente nos últimos ${estado.janelaSim} meses.`} Respeita piso e teto de cada contrato${t.com_piso_ou_teto ? '' : ' (nenhum destes contratos tem piso ou teto cadastrado)'}.</p>
        </div>
        <div style="border:1px solid var(--line);background:var(--tile);border-radius:14px;padding:12px 14px;margin-bottom:12px;font-size:14px">
            <div style="color:var(--pine);font-weight:600;margin-bottom:6px">O que os números dizem</div>
            <p style="margin:0">${esc(d.texto_proposta)}</p>
        </div>`;
}
