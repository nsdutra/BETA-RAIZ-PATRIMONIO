// ============================================================================
// nucleo/calendario.js — Raiz Patrimônio · Núcleo de plataforma · calendário único (rzCalendario)
// Versão: 1.1.0 · 13/11/2026
//
// v1.1.0 (13/11/2026, sessão 20261113-1405-f2a-ajustes; teste T-2945 do Nicola 13/11 14:05: "exibir uma legenda") — no modo
// 'app' a legenda é sempre a mesma e completa (confirmado, aguardando, crítico, atenção, informativo e hoje), e não só o que
// aparece no mês; "bloqueado pelo uso" entra quando há dia bloqueado. Versão anterior: 1.0.0
//
// v1.0.0 (13/11/2026, sessão 20261113-0712-crm-f2a; FICHA_CRM_AGENDA_OCUPACAO_RAIZ v1.2.0 F2a, aprovada pelo Nicola 12/11 08:44;
// PLANO_EXECUCAO_CRM_F2A_RAIZ v1.0.0, ida 13/11 07:12) — criação. Um componente só para o mês: Agenda, chip Usos da ficha do
// ativo e, depois, a tela Disponibilidade e a vitrine (DESIGN_SYSTEM v2.51.0 §6.3). Nenhuma tela desenha grade de mês própria.
//
// O QUE ELE FAZ: devolve o HTML do mês (cabeçalho dos dias da semana, um botão por dia, legenda). Não busca nada no banco
// e não liga eventos: quem chama liga o toque pelo atributo data-cal-dia (yyyy-mm-dd), do jeito que preferir.
//
// REGRAS (DS §6.3):
//   · fundo do dia por SITUAÇÃO, nunca por ramo: aguardando (tracejado) > confirmado > bloqueado pelo uso > neutro;
//   · pontos (até 3) para o que tem data mas não tem situação (vencimento, aniversário…), na cor do status (UXR-54):
//     crítico, atenção, informativo;
//   · hoje = traço inferior na cor do ramo (a única cor de ramo no calendário); selecionado = borda --ink;
//   · modo 'publico' (vitrine): só livre ou indisponível — sem nomes, pontos nem situação de terceiros.
//
// USO:
//   rzCalendario({ ano: 2026, mes: 10 /* 0..11 */, itens: [{ dia: '2026-11-14', ate: '2026-11-16', sit: 'conf'|'pend'|null,
//                  st: 'critico'|'atencao'|'informativo' }], bloqueados: ['2026-11-20', …], sel: '2026-11-14', modo: 'app'|'publico' })
// ============================================================================

export const VERSAO = '1.1.0';

const DW = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const pad = (n) => String(n).padStart(2, '0');
const isoDe = (a, m, d) => `${a}-${pad(m + 1)}-${pad(d)}`;
const hojeIso = () => { const d = new Date(); return isoDe(d.getFullYear(), d.getMonth(), d.getDate()); };
const cobre = (it, di) => it && it.dia && (it.dia === di || (it.ate && it.dia <= di && di <= it.ate));

export function rzCalendario({ ano, mes, itens = [], bloqueados = [], sel = null, modo = 'app', legenda = true } = {}) {
    const primeiro = new Date(ano, mes, 1).getDay();
    const n = new Date(ano, mes + 1, 0).getDate();
    const hoje = hojeIso();
    const bloq = new Set(bloqueados || []);
    const tem = { conf: false, pend: false, bloq: false, cr: false, at: false, in: false };
    let h = DW.map(d => `<div class="rz-cal-dw" aria-hidden="true">${d}</div>`).join('');
    for (let i = 0; i < primeiro; i++) h += '<div class="rz-cal-d rz-cal-vz" aria-hidden="true"></div>';
    for (let d = 1; d <= n; d++) {
        const di = isoDe(ano, mes, d);
        const its = itens.filter(it => cobre(it, di));
        let cls = '';
        if (modo === 'publico') cls = (its.some(a => a.sit) || bloq.has(di)) ? 'rz-cal-bloq' : '';
        else if (its.some(a => a.sit === 'pend')) cls = 'rz-cal-pend';
        else if (its.some(a => a.sit === 'conf')) cls = 'rz-cal-conf';
        else if (bloq.has(di)) cls = 'rz-cal-bloq';
        if (cls) tem[cls.slice(7)] = true;
        let pts = '';
        if (modo !== 'publico') {
            const semSit = its.filter(a => !a.sit);
            const ordem = { critico: 0, atencao: 1, informativo: 2 };
            pts = semSit.slice().sort((a, b) => (ordem[a.st] ?? 2) - (ordem[b.st] ?? 2)).slice(0, 3).map(a => {
                const c = a.st === 'critico' ? 'cr' : a.st === 'atencao' ? 'at' : 'in';
                tem[c] = true;
                return `<i class="${c === 'in' ? '' : c}"></i>`;
            }).join('');
        }
        const rotulo = `${d}${cls === 'rz-cal-pend' ? ', aguardando' : cls === 'rz-cal-conf' ? ', confirmado' : cls === 'rz-cal-bloq' ? ', indisponível' : ''}${its.length && modo !== 'publico' ? `, ${its.length} ${its.length > 1 ? 'itens' : 'item'}` : ''}`;
        h += `<button type="button" class="rz-cal-d ${cls}${di === sel ? ' rz-cal-sel' : ''}${di === hoje ? ' rz-cal-hoje' : ''}" data-cal-dia="${di}" aria-label="${rotulo}"${di === sel ? ' aria-pressed="true"' : ''}>${d}${pts ? `<span class="rz-cal-pts">${pts}</span>` : ''}</button>`;
    }
    let leg = '';
    if (legenda) {
        const hach = 'background:repeating-linear-gradient(45deg,var(--tile),var(--tile) 3px,var(--card) 3px,var(--card) 6px)';
        leg = modo === 'publico'
            ? `<span><i style="${hach}"></i>indisponível</span><span><i style="background:var(--tile)"></i>livre</span>`
            : ['<span><i style="background:var(--info-bg);border:1px solid var(--info)"></i>confirmado</span>',
               '<span><i style="background:var(--warning-bg);border:1px dashed var(--warning)"></i>aguardando</span>',
               (tem.bloq || bloq.size) && `<span><i style="${hach}"></i>bloqueado pelo uso</span>`,
               '<span><i class="pt" style="background:var(--danger)"></i>crítico</span>',
               '<span><i class="pt" style="background:var(--warning)"></i>atenção</span>',
               '<span><i class="pt" style="background:var(--sage)"></i>informativo</span>',
               '<span><i class="hj"></i>hoje</span>'].filter(Boolean).join('');
    }
    return `<div class="rz-cal" role="grid" aria-label="Calendário">${h}</div>${leg ? `<div class="rz-cal-leg">${leg}</div>` : ''}`;
}

// Situação de uma linha da agenda (fn_agenda_periodo_v2) para o calendário: o que tem hora ou espera aprovação pinta o dia;
// o resto (vencimentos, aniversários, documentos) vira ponto na cor do status.
export function rzCalItemDaAgenda(r, status) {
    const sit = r.situacao === 'aguardando' ? 'pend' : (r.inicio_em && r.situacao !== 'realizado') ? 'conf' : null;
    let ate = null;
    if (r.fim_em) { const f = new Date(r.fim_em); if (!isNaN(f)) ate = isoDe(f.getFullYear(), f.getMonth(), f.getDate()); } // dia local
    return { dia: r.data, ate: ate && ate > r.data ? ate : null, sit, st: status };
}
