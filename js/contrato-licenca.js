// =====================================================================
// RAIZ PATRIMÔNIO — js/contrato-licenca.js
// Versão: 1.1.0 · 25/11/2026
// -----------------------------------------------------------------
// v1.1.0 (25/11/2026, sessão 20261125-0029-investimentos-i1, demanda e5d269c2; PLANO_EXECUCAO_I1_CONTA_E_APLICACOES_RAIZ v1.2.0) —
//   aplicação do ramo Investimentos (contrato de modelo 'investimento'): depois de esconder o que o tipo não usa, a ficha passa
//   para o js/investimentos.js (aplicarFichaAplicacao: título, faixa, Condições, Valor, Movimentos, Itens, Financeiro e Partes).
//   Versão anterior: 1.0.0
// v1.0.0 (15/11/2026, sessão 20261115-1835-licencas-l3, demandas 285a0058 R4 e 954b4cca; FICHA_LICENCAS_LEADS_RAIZ v1.4.0
// §3.3, §4.3 e §4.5 — de acordo do Nicola 15/11 17:34 e 18:33) — criação.
//   · aplicarSecoesFicha: a ficha do contrato segue contrato_tipos.ficha_secoes ("chip" ou "chip.card"; vazio = ficha
//     de sempre). Esconde chips e cards fora da lista e monta os que só existem aqui: chip "Uso e limites" (limites do
//     plano × uso, uso do mês com ‹ mês ›, acervo), chip "Comunicações" (comunicações e campanhas com filtro), card NPS
//     no Resumo e card "Aceites do contratante" em Anexos. Os dados vêm da fn_licenca_contrato_painel (só master).
//   · Contrato de licença: título com o contratante, "Mensalidade" no lugar de "Aluguel" e Condições com plano,
//     carência, cortesia e valor a confirmar.
//   · abrirFormCarencia: "Carência" no ⋮ de Condições de qualquer contrato — grava a ocorrência 'carencia' (o combinado
//     fica na própria ocorrência; a geração de mensalidades segue a carência, licencas_contratos_l2_v1) e oferece marcar
//     como isentas as mensalidades pendentes dos meses inteiros dentro do período (o aluguel; encargos não mudam).
// =====================================================================
export const VERSAO = '1.1.0';

const esc = (s) => (typeof rzEsc === 'function' ? rzEsc(s) : String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])));
const toast = (m, t) => (typeof mostrarToast === 'function' ? mostrarToast(m, t) : console.log(m));
const icones = () => { if (typeof refrescarIcones === 'function') refrescarIcones(); else if (window.lucide) window.lucide.createIcons(); };
const dataBR = (d) => (d ? (typeof formatarDataBR === 'function' ? formatarDataBR(String(d).slice(0, 10)) : String(d).slice(0, 10).split('-').reverse().join('/')) : '—');
const moeda = (v) => (typeof formatarMoedaBR === 'function' ? formatarMoedaBR(v) : `R$ ${Number(v || 0).toFixed(2)}`);
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const nomeMes = (iso) => { const [a, m] = String(iso).split('-'); return `${MESES[Number(m) - 1]} ${a}`; };
const NOMES_PLANO = { Premium: 'Premium', premium: 'Premium', essencial: 'Essencial', essencial_ampliado: 'Essencial Ampliado', plus: 'Plus' };
const AREA = { conciliacao: 'Conciliação', mensal: 'Financeiro', contratos: 'Contratos', cofre: 'Cofre', lancamentos: 'Lançamentos', cartao: 'Cartões', comunicacoes: 'Comunicações', ia: 'Raiz IA', bot: 'Robô', programas: 'Programas', ciclos: 'Ciclos' };

const card = (titulo, sub, corpo, extra = '') => `<div class="rz-card"${extra}><div class="rz-card-h"><h3>${esc(titulo)}</h3>${sub ? `<span class="rz-sub">${esc(sub)}</span>` : ''}</div>${corpo}</div>`;
const linha = (ic, t, s, rt) => `<div class="rz-row"><div class="rz-ic"><svg data-lucide="${ic}"></svg></div><div class="rz-tx"><b>${esc(t)}</b>${s ? `<span>${esc(s)}</span>` : ''}</div>${rt ? `<div class="rz-rt">${rt}</div>` : ''}</div>`;
const st = (sem, txt) => `<span class="rz-st rz-${sem}">${esc(txt)}</span>`;
const vazio = (txt) => `<p class="rz-desc" style="margin:4px 0 0">${esc(txt)}</p>`;

async function painel(contratoId, secao, mes) {
    const { data, error } = await dbAuth.rpc('fn_licenca_contrato_painel', { p_contrato_id: contratoId, p_secao: secao, p_mes: mes || null });
    if (error) throw error;
    return data || {};
}

// ---------------------------------------------------------------------
// Seções da ficha por tipo de contrato
// ---------------------------------------------------------------------
export async function aplicarSecoesFicha(con, secoes) {
    const raiz = document.getElementById('ficha-contrato-conteudo');
    if (!raiz || !Array.isArray(secoes) || !secoes.length) return;
    const tem = (s) => secoes.includes(s);
    const chipsAlvo = secoes.filter(s => !s.includes('.'));
    // 1. chips e painéis que existem na ficha padrão: esconde os que o tipo não usa
    raiz.querySelectorAll('#fc-chips [data-fc-chip]').forEach(b => { if (!tem(b.dataset.fcChip)) b.classList.add('hidden'); });
    // 2. cards marcados (data-fc-secao="chip.card") fora da lista saem
    raiz.querySelectorAll('[data-fc-secao]').forEach(el => { if (!tem(el.dataset.fcSecao)) el.classList.add('hidden'); });
    if (con.modelo === 'investimento') { // v1.1.0 — aplicação do ramo Investimentos
        import('./investimentos.js').then(m => m.aplicarFichaAplicacao(con, raiz)).catch(e => console.warn('[contrato-licenca] aplicação:', e?.message || e));
        icones();
        return;
    }
    const licenca = con.modelo === 'licenca_uso';
    if (licenca) ajustarLicenca(con, raiz);
    // 3. chips só desta ficha, na ordem da lista
    const chips = raiz.querySelector('#fc-chips');
    const novos = { uso_limites: 'Uso e limites', comunicacoes: 'Comunicações' };
    chipsAlvo.filter(c => novos[c]).forEach(c => {
        const depois = chipsAlvo.slice(chipsAlvo.indexOf(c) + 1).map(x => chips.querySelector(`[data-fc-chip="${x}"]`)).find(Boolean);
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'rz-chip'; b.dataset.fcChip = c; b.textContent = novos[c];
        b.addEventListener('click', () => { window.fcTrocarChip && window.fcTrocarChip(c); carregarPainel(con, c); });
        chips.insertBefore(b, depois || null);
        const p = document.createElement('div');
        p.className = 'fc-painel hidden'; p.id = 'fc-painel-' + c;
        p.innerHTML = typeof rzSk === 'function' ? rzSk('cards', 2) : '';
        raiz.querySelector('#fc-painel-arquivos')?.before(p) || raiz.appendChild(p);
    });
    // 4. cards só desta ficha
    if (tem('resumo.nps')) {
        const alvo = raiz.querySelector('[data-fc-secao="resumo.condicoes"]');
        alvo?.insertAdjacentHTML('afterend', `<div class="rz-card" id="fc-card-nps"><div class="rz-card-h"><h3>NPS</h3></div>${typeof rzSk === 'function' ? rzSk('linhas', 1) : ''}</div>`);
        carregarNps(con);
    }
    if (tem('arquivos.aceites')) {
        const p = raiz.querySelector('#fc-painel-arquivos');
        p?.insertAdjacentHTML('afterbegin', `<div class="rz-card" id="fc-card-aceites"><div class="rz-card-h"><h3>Aceites do contratante</h3><span class="rz-sub">o que viu ao entrar</span></div><div id="fc-aceites">${typeof rzSk === 'function' ? rzSk('linhas', 2) : ''}</div></div>`);
        carregarAceites(con);
    }
    icones();
}

function ajustarLicenca(con, raiz) {
    const dm = con.dadosModelo || {};
    // título: o contratante (o "imóvel" da licença não tem endereço)
    const tit = raiz.querySelector('.rz-entity .rz-tx b');
    if (tit) tit.textContent = con.locatario || 'Contratante';
    const sub = raiz.querySelector('.rz-entity .rz-tx span');
    if (sub) sub.textContent = ['Licença de uso', NOMES_PLANO[dm.plano] || dm.plano].filter(Boolean).join(' · ');
    const faixa = raiz.querySelector('.rz-fc-faixa small');
    if (faixa) faixa.textContent = dm.cortesia ? 'Cortesia' : 'Mensalidade';
    const kv = raiz.querySelector('[data-fc-secao="resumo.condicoes"] .rz-kv');
    if (kv) {
        const k = (r, v) => `<div><small>${esc(r)}</small><b>${v}</b></div>`;
        kv.innerHTML = [
            k('Plano', esc(NOMES_PLANO[dm.plano] || dm.plano || '—')),
            k('Início', dataBR(con.inicio)),
            k('Vencimento', `Dia ${con.vencimentoDia || 1}`),
            k(dm.cortesia ? 'Valor' : 'Mensalidade', dm.cortesia ? 'Cortesia, sem cobrança' : `${moeda(con.valor)}/mês${dm.valor_a_confirmar ? ' · a confirmar' : ''}`),
            k('Cobrança', esc(con.formaPagamento || 'PIX')),
            k('Data-base da licença', 'criação da empresa'),
        ].join('') + '<div class="rz-full" id="fc-lic-carencia"></div>';
        // a carência vem das ocorrências (o card as lê); aqui só o resumo
        dbAuth.from('cofre_ocorrencias_controle').select('inicio_em, fim_em').eq('contrato_id', con.id).eq('tipo', 'carencia').neq('status_execucao', 'cancelado')
            .order('fim_em', { ascending: false }).limit(1).then(({ data }) => {
                const c = (data || [])[0]; const el = document.getElementById('fc-lic-carencia');
                if (el && c) el.innerHTML = `<small>Carência</small><b>${dataBR(c.inicio_em)} a ${dataBR(c.fim_em)}</b>`;
            });
    }
}

async function carregarNps(con) {
    const el = document.getElementById('fc-card-nps'); if (!el) return;
    try {
        const d = await painel(con.id, 'nps');
        const ult = (d.notas || [])[0];
        const corpo = ult
            ? `<div class="rz-kpis" style="margin:0"><div class="rz-kpi"><small>Última nota</small><b>${ult.nota} de ${d.escala || 5}</b></div><div class="rz-kpi"><small>Média 90 dias</small><b>${d.media_90 ?? '—'}</b></div></div>
               ${ult.comentario ? `<p class="rz-desc" style="margin:10px 2px 0">"${esc(ult.comentario)}" — ${esc(ult.pessoa || '')}</p>` : ''}`
            : vazio('Ainda sem nota desta empresa.');
        el.innerHTML = `<div class="rz-card-h"><h3>NPS</h3>${ult ? `<span class="rz-sub">última em ${dataBR(ult.quando)}</span>` : ''}</div>${corpo}`;
    } catch (e) { el.innerHTML = `<div class="rz-card-h"><h3>NPS</h3></div>${vazio(e.message || 'Não consegui ler o NPS.')}`; }
}

async function carregarAceites(con) {
    const el = document.getElementById('fc-aceites'); if (!el) return;
    try {
        const d = await painel(con.id, 'aceites');
        const itens = d.itens || [];
        el.innerHTML = itens.length ? `<div class="rz-list">${itens.map(a => {
            const ok = a.aceito_em && (a.versao_aceita || 0) >= (a.versao_atual || 1);
            const ic = a.codigo.includes('privacidade') ? 'shield-check' : a.codigo.includes('beta') ? 'sparkles' : 'scroll-text';
            const s = a.aceito_em ? `versão ${a.versao_aceita || 1} · ${a.pessoa || '—'} em ${dataBR(a.aceito_em)} · ${a.canal || 'app'}` : 'Ainda não aceito';
            return `<div class="rz-row${a.url ? ' rz-link' : ''}"${a.url ? ` role="button" tabindex="0" onclick="window.open('${esc(a.url)}','_blank','noopener')"` : ''}>
                <div class="rz-ic"><svg data-lucide="${ic}"></svg></div><div class="rz-tx"><b>${esc(a.titulo || a.codigo)}</b><span>${esc(s)}</span></div>
                <div class="rz-rt">${ok ? st('ok', 'Aceito') : st('warn', 'Pendente')}</div></div>`;
        }).join('')}</div>` : vazio('Nenhum termo encontrado.');
        icones();
    } catch (e) { el.innerHTML = vazio(e.message || 'Não consegui ler os aceites.'); }
}

const estadoUso = {};
async function carregarPainel(con, chip) {
    const el = document.getElementById('fc-painel-' + chip); if (!el) return;
    try {
        if (chip === 'uso_limites') {
            const mes = estadoUso[con.id];
            const d = await painel(con.id, 'uso', mes);
            const lim = (d.limites || []).map(l => {
                const p = l.limite ? Math.round((l.usado / l.limite) * 100) : 0;
                const tipo = l.tipo === 'mensal' ? 'no mês' : l.tipo === 'bytes' ? 'MB' : '';
                return `<div class="rz-row rz-uso"><div class="rz-tx"><b>${esc(l.rotulo)}</b><span>${l.usado} de ${l.limite}${tipo ? ' ' + tipo : ''}</span></div><div class="rz-rt">${st(p >= 80 ? 'warn' : 'neu', p + '%')}</div></div>
                    <div class="rz-uso-bar${p >= 80 ? ' rz-warn' : ''}"><i style="width:${Math.min(100, p)}%"></i></div>`;
            }).join('');
            const atual = d.mes, primeiro = d.primeiro_mes, hoje = new Date().toISOString().slice(0, 7) + '-01';
            const somar = (iso, n) => { const [a, m] = iso.split('-').map(Number); const x = new Date(Date.UTC(a, m - 1 + n, 1)); return x.toISOString().slice(0, 10); };
            const nav = (n, ic, ok) => `<button type="button" class="rz-more" ${ok ? `data-uso-nav="${somar(atual, n)}"` : 'disabled style="opacity:.3"'} aria-label="${n < 0 ? 'Mês anterior' : 'Próximo mês'}"><svg data-lucide="${ic}"></svg></button>`;
            const ac = d.acervo || {};
            el.innerHTML = card('Limites do plano', '', lim || vazio('O plano desta empresa não tem limites.'))
                + `<div class="rz-card" style="margin-top:12px"><div class="rz-card-h"><h3 style="white-space:nowrap">Uso no mês</h3><span style="flex:1"></span>${nav(-1, 'chevron-left', atual > primeiro)}<span class="rz-sub" style="min-width:110px;text-align:center">${esc(nomeMes(atual))}</span>${nav(1, 'chevron-right', atual < hoje)}</div>
                   <div class="rz-kpis" style="margin:0"><div class="rz-kpi"><small>Acessos</small><b>${d.acessos}</b></div><div class="rz-kpi"><small>Pessoas que usaram</small><b>${d.pessoas_usaram} de ${d.pessoas_total}</b></div>
                   <div class="rz-kpi"><small>Dias com uso</small><b>${d.dias_com_uso} de ${d.dias_no_mes}</b></div><div class="rz-kpi"><small>O que mais usaram</small><b style="font-size:14px">${esc((d.mais_usado || []).map(x => AREA[x.acao] || x.acao).join(', ') || '—')}</b></div></div></div>`
                + card('Acervo', 'volumes', `<div class="rz-list">${linha('file-text', 'Contratos', '', `<b>${ac.contratos ?? 0}</b>`)}${linha('wallet', 'Lançamentos', '', `<b>${ac.lancamentos ?? 0}</b>`)}${linha('wrench', 'Itens de controle', '', `<b>${ac.itens_controle ?? 0}</b>`)}${linha('file-check-2', 'Documentos no Cofre', '', `<b>${ac.documentos ?? 0}</b>`)}</div>`, ' style="margin-top:12px"');
            el.querySelectorAll('[data-uso-nav]').forEach(b => b.addEventListener('click', () => { estadoUso[con.id] = b.dataset.usoNav; carregarPainel(con, chip); }));
        } else if (chip === 'comunicacoes') {
            const d = await painel(con.id, 'comunicacoes');
            const itens = d.itens || [];
            const ROT = { upsell: 'Campanhas', adocao: 'Adoção', onboarding: 'Boas-vindas e termos', nps: 'NPS' };
            const EV = { exibiu: 'Viu', aceitou: 'Aceitou', respondeu: 'Respondeu', clicou: 'Clicou', concluiu: 'Concluiu', confirmou_interesse: 'Quis saber mais', opt_in: 'Aceitou receber', opt_out: 'Não quer receber' };
            const filtro = estadoUso['com_' + con.id] || 'todas';
            const tipos = [...new Set(itens.map(i => i.tipo))];
            const vis = itens.filter(i => filtro === 'todas' || i.tipo === filtro);
            const chip2 = (k, r, n) => `<button type="button" class="rz-chip${filtro === k ? ' rz-on' : ''}" data-com-f="${k}">${esc(r)} <span class="rz-n">${n}</span></button>`;
            el.innerHTML = `<div class="rz-chips">${chip2('todas', 'Todas', itens.length)}${tipos.map(t => chip2(t, ROT[t] || t, itens.filter(i => i.tipo === t).length)).join('')}</div>`
                + card('Comunicações e campanhas', 'últimas 40', vis.length ? `<div class="rz-list">${vis.map(i => linha(i.tipo === 'upsell' ? 'megaphone' : i.tipo === 'nps' ? 'star' : i.tipo === 'onboarding' ? 'scroll-text' : 'sparkles',
                    i.titulo || i.codigo, `${dataBR(i.quando)} · ${i.pessoa || '—'} · ${i.canal}`, st(['aceitou', 'respondeu', 'concluiu', 'confirmou_interesse', 'opt_in'].includes(i.evento) ? 'ok' : i.evento === 'opt_out' ? 'warn' : 'neu', EV[i.evento] || i.evento))).join('')}</div>` : vazio('Nada com esse filtro.'));
            el.querySelectorAll('[data-com-f]').forEach(b => b.addEventListener('click', () => { estadoUso['com_' + con.id] = b.dataset.comF; carregarPainel(con, chip); }));
        }
    } catch (e) { el.innerHTML = card(chip === 'uso_limites' ? 'Uso e limites' : 'Comunicações', '', vazio(e.message || 'Não consegui ler agora.')); }
    icones();
}

// ---------------------------------------------------------------------
// Carência (qualquer contrato) — ⋮ de Condições
// ---------------------------------------------------------------------
export function abrirFormCarencia(con, aoSalvar) {
    if (typeof abrirSheetForm !== 'function') return;
    const hoje = new Date().toISOString().slice(0, 10);
    abrirSheetForm({
        titulo: 'Carência', sub: con.locatario || 'Contrato', rotuloSalvar: 'Registrar',
        corpo: `<p class="rz-desc" style="margin:0 0 10px">Nesse período a mensalidade do contrato não é gerada (mês parcial sai proporcional). Encargos como IPTU e condomínio continuam.</p>
            <div class="rz-f2 rz-f2-curto"><div class="rz-f"><label for="car-ini">De</label><input type="date" id="car-ini" value="${hoje}"></div>
            <div class="rz-f"><label for="car-fim">Até (inclusive)</label><input type="date" id="car-fim"></div></div>
            <div class="rz-f" style="margin-bottom:0"><label for="car-comb">O combinado</label><textarea id="car-comb" rows="3" maxlength="600" placeholder="Ex.: inquilino faz a reforma da cozinha durante a carência"></textarea></div>`,
        aoSalvar: async () => {
            const ini = document.getElementById('car-ini')?.value, fim = document.getElementById('car-fim')?.value;
            const comb = (document.getElementById('car-comb')?.value || '').trim();
            if (!ini || !fim) { toast('Informe o início e o fim da carência.', 'erro'); return false; }
            if (fim < ini) { toast('O fim vem depois do início.', 'erro'); return false; }
            if (!comb) { toast('Escreva o combinado — ele fica registrado na ocorrência.', 'erro'); return false; }
            const { error } = await dbAuth.from('cofre_ocorrencias_controle').insert({
                cliente_id: CLIENTE_ID_SUPABASE, contrato_id: con.id, tipo: 'carencia', status_execucao: 'aberto',
                inicio_em: ini + 'T00:00:00-03:00', fim_em: fim + 'T00:00:00-03:00', descricao: comb, origem: 'app',
                competencia: ini.slice(0, 7) + '-01', data_prevista_original: ini, data_prevista_atual: ini,
            });
            if (error) { toast(error.message || 'Não consegui registrar a carência.', 'erro'); return false; }
            // mensalidades pendentes de meses inteiros dentro da carência → isentas (só com o de acordo)
            const ultimoDia = (iso) => { const [a, m] = iso.split('-').map(Number); return new Date(Date.UTC(a, m, 0)).toISOString().slice(0, 10); };
            const { data: pend } = await dbAuth.from('mensalidades').select('id, competencia, valor_confirmado').eq('contrato_id', con.id).eq('status', 'pendente');
            const dentro = (pend || []).filter(m => m.competencia >= ini && ultimoDia(m.competencia) <= fim); // mês inteiro dentro
            setTimeout(async () => {
                if (dentro.length && typeof rzPerguntar === 'function' && await rzPerguntar({ titulo: 'Mensalidades já geradas',
                    impacto: `${dentro.length} ${dentro.length === 1 ? 'mensalidade pendente cai' : 'mensalidades pendentes caem'} inteira${dentro.length === 1 ? '' : 's'} na carência. Marcar como isenta${dentro.length === 1 ? '' : 's'}?`,
                    rotuloConfirmar: 'Marcar como isentas', rotuloCancelar: 'Deixar como estão' })) {
                    const ids = dentro.map(m => m.id);
                    const { error: e2 } = await dbAuth.from('mensalidades').update({ status: 'isento' }).in('id', ids).eq('status', 'pendente');
                    if (e2) toast(e2.message || 'Não consegui marcar as mensalidades.', 'erro');
                    else { try { mensalidades.forEach(m => { if (ids.includes(m.id)) m.status = 'Isento'; }); } catch (_) { /* lista global ainda não carregada */ } }
                }
                aoSalvar && aoSalvar();
            }, 60);
            toast('Carência registrada.', 'sucesso');
            return true;
        },
    });
}
