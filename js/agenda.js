// =====================================================================
// RAIZ PATRIMÔNIO — js/agenda.js
// VERSÃO: Beta v1.25.1 (28/11/2026 — o termo da lupa também nos números dos chips)
// LINHAS: (ver versoes.json)
// -----------------------------------------------------------------
// NOVIDADES (Beta v1.25.1) (28/11/2026, teste no ar) — os números dos chips de status e a lista de assuntos também contam só o que bate
// com o termo da lupa. Versão anterior: 1.25.0
// NOVIDADES (Beta v1.25.0) (28/11/2026, sessão 20261128-0050-lupa-global, demanda c0e5dcbc; FICHA_BUSCA_E_FILTRO_DAS_TELAS_RAIZ v1.3.0,
// Nicola 28/11 00:34 e 00:47) — a lupa do topo é a mesma em todo o app: aqui o termo filtra compromissos, reservas, reuniões e
// alertas do período (título, bem, quem, assunto, complemento), nos números e nas linhas. O filtro por bem fica só no chip
// "Ativo ▾"; a lupa não abre mais a escolha do bem (v1.23.0). Versão anterior: 1.24.1
// NOVIDADES (Beta v1.24.1) (27/11/2026, teste no ar) — a busca da agenda pedia 120 dias e a função aceita até 62: agora −14 a +45 dias.
// Versão anterior: 1.24.0
// NOVIDADES (Beta v1.24.0) (27/11/2026, sessão 20261127-2235-busca-geral; FICHA_BUSCA_E_FILTRO_DAS_TELAS_RAIZ v1.1.0, D3 de acordo do
// Nicola 27/11 22:31) — buscarAgendaTexto: a busca geral (lupa do Hoje e do Resumo) acha compromissos da agenda. Versão anterior: 1.23.1
// NOVIDADES (Beta v1.23.1) (27/11/2026, teste no ar) — o botão da lupa ganha data-lupa: no computador a tela da Agenda também tem a
// busca de alertas, e a lupa do topo abria essa. Versão anterior: 1.23.0
// NOVIDADES (Beta v1.23.0) (27/11/2026, sessão 20261127-2210-busca-filtro; FICHA_BUSCA_E_FILTRO_DAS_TELAS_RAIZ v1.1.0, de acordo do
// Nicola 27/11 21:59 e 22:05) — a lupa do topo sempre abre a escolha do bem (filtrado, a lista começa por "Todos os bens"); com bem
// filtrado a lupa fica dourada. Versão anterior: 1.22.0
// NOVIDADES (Beta v1.22.0) (24/11/2026, sessão 20261124-1843-agenda-linha, demanda 4fa77b06; FICHA_AGENDA_LINHA_UNICA_RAIZ v1.0.0,
// de acordo do Nicola 24/11 18:43) — a agenda e o "Enviar a semana" leem fn_agenda_linhas: título curto, ícone, quem e bem vêm
// prontos do banco, os mesmos do robô (sem endereço nem final de cartão repetido, documento e item do mesmo dia numa linha só).
// Reserva: v2 e, depois, v1, como antes. Versão anterior: 1.21.0
// NOVIDADES (Beta v1.21.0) (18/11/2026, sessão 20261118-1850-financeiro-lente-5bc, demanda 679b2700; LEVANTAMENTO_LENTE_MULTI_RAMO_RAIZ v1.0.0 fatias 5b e 5c, de acordo do Nicola 18/11 14:36 e 18:45) — com 2+ ramos marcados na lente
// (window.RZ_RAMOS_LENTE), o calendário e o "Enviar a semana" chamam fn_agenda_periodo(_v2) uma vez por ramo e juntam os
// compromissos sem repetir (window.rzRpcPorRamos, js/nucleo/lente.js). Versão anterior: 1.20.0
// NOVIDADES (Beta v1.20.0) (16/11/2026, sessão 20261116-0853-doc-criar-item, demanda 711f52e5; FICHA_DOCUMENTO_CRIAR_ITEM_AGENDA_RAIZ
// v1.0.0, de acordo do Nicola 16/11 08:53) — abrirNovoCompromisso(pref) aceita pref.aoSalvar(resultado, idsVinculados) e
// pref.aoCancelar(): quem abriu a cortina (a ficha do documento) termina o trabalho depois de salvar ou volta ao cancelar.
// Versão anterior: 1.19.0
// NOVIDADES (Beta v1.19.0) (14/11/2026, sessão 20261114-1910-crm-reuniao-1; FICHA_REUNIAO_LEAD_GOOGLE_MEET_RAIZ v1.0.2) — reunião
// confirmada com link do Google Meet (cofre_ocorrencias_controle.evento_externo) abre "Entrar no Meet" e "Detalhes".
// Versão anterior: 1.18.0
// -----------------------------------------------------------------
// NOVIDADES (Beta v1.18.0) (14/11/2026, sessão 20261114-1045-crm-f2b-2, demanda 09277cba; PLANO_EXECUCAO_CRM_F2B_A_F4 v1.0.1,
// entrega 2) — ⋮ da Agenda ganha "Reserva ou reunião com hora" (js/agenda-form.js: formulário único com aviso de conflito);
// tocar num pedido aguardando (reunião tracejada ou pré-reserva) abre Aprovar · Outra data · Recusar. Versão anterior: 1.17.0
// -----------------------------------------------------------------
// NOVIDADES (Beta v1.17.0) (13/11/2026, sessão 20261113-1910-reajuste-desde; Nicola 13/11 19:06: "Retire a opção de movimentar
// os meses e semanas com dedo. Está atrapalhando rolar os compromissos.") — sai o arrastar do Mês e da Semana e o touch-action
// que travava a rolagem por cima do calendário; troca só pelas setas. Exporta linhaCompromissoHtml e abrirCompromissoAgenda para
// o card Calendário da ficha do ativo. Versão anterior: 1.16.0
// --------------------------------------------------------------------------
// Versões anteriores (v1.16.0 … v1.16.0): CHANGELOG_MODULOS.md, na raiz do repositório — o
// gerar_versoes.py rola pra lá automaticamente tudo além das 5 versões
// mais recentes deste cabeçalho (VER-06).
import { rzCalendario, rzCalItemDaAgenda } from './nucleo/calendario.js'; // v1.16.0 — calendário único (DS §6.3)

export const VERSAO = '1.25.1';

const TIPOS = {
    ocorrencia:   { rotulo: 'Ocorrência',  icone: 'wrench',          dominio: 'ocorrencias' },
    recebimento:  { rotulo: 'Recebimento', icone: 'arrow-down-left', dominio: 'financeiro' },
    pagamento:    { rotulo: 'Pagamento',   icone: 'arrow-up-right',  dominio: 'financeiro' },
    contrato_fim: { rotulo: 'Contrato',    icone: 'file-x',          dominio: 'contratos' },
    reajuste:     { rotulo: 'Reajuste',    icone: 'trending-up',     dominio: 'contratos' },
    documento:    { rotulo: 'Documento',   icone: 'file-clock',      dominio: 'documentos' },
    membro:       { rotulo: 'Rebanho',     icone: 'beef',            dominio: 'ativos' }, // v1.5.0 (fatia 7)
    feriado:      { rotulo: 'Feriado',     icone: 'party-popper',    dominio: 'feriados' }, // v1.8.0 (bf1c1ba7)
    pedido_reserva: { rotulo: 'Pedido de reserva', icone: 'calendar-clock', dominio: 'ocorrencias' }, // v1.16.0 (CRM F2a)
};
const ASSUNTOS = [['ativos', 'Ativos'], ['itens', 'Itens de controle'], ['contratos', 'Contratos e usos'], ['ocorrencias', 'Ocorrências'], ['financeiro', 'Financeiro'], ['documentos', 'Documentos'], ['feriados', 'Feriados']]; // v1.8.0 — feriados
const STATUS = [['critico', 'Crítico'], ['atencao', 'Atenção'], ['informativo', 'Informativo']];
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const MES_CURTO = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const DIA_SEM = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const JANELA_ATENCAO = 7; // D7.10

const st = { vista: 'mes', semana: null, mes: null, dia: null, status: new Set(), assuntos: null, dados: [], seq: 0, el: null, icones: new Map(),
    ativo: null, texto: '' }; // v1.16.0 — { id, nome } do filtro por bem (chip Ativo ▾); v1.25.0 — texto: termo da lupa do topo

// v1.11.0 — ícone do item de controle (id → nome lucide), na regra de Controles (iconeDoItem, cofre-controles.js):
// subtipo › tipo no catálogo › conta (cartão ou banco) › prancheta. Lê só os ids que ainda não tem.
let catalogoIconesControle = null;
async function carregarIconesDosItens(ids) {
    const faltam = [...new Set(ids)].filter(id => id && !st.icones.has(id));
    if (!faltam.length) return;
    try {
        if (!catalogoIconesControle) {
            const { data } = await dbAuth.from('controle_tipos').select('codigo,icone').eq('ativo', true);
            catalogoIconesControle = new Map((data || []).filter(x => x.icone).map(x => [x.codigo, x.icone]));
        }
        const { data, error } = await dbAuth.from('cofre_itens_controle').select('id,tipo,cofre_controle_subtipos(nome,icone)').in('id', faltam.slice(0, 300));
        if (error) throw error;
        (data || []).forEach(it => {
            const sub = it.cofre_controle_subtipos;
            const ic = sub?.icone || catalogoIconesControle.get(it.tipo)
                || (it.tipo === 'conta' ? (/cart[ãa]o/i.test(sub?.nome || '') ? 'credit-card' : 'landmark') : 'clipboard-check');
            st.icones.set(it.id, ic);
        });
    } catch (e) { console.warn('[agenda] ícones dos itens:', e?.message || e); } // sem ícone próprio, fica a prancheta
}
const iconeDoItemAgenda = (id) => st.icones.get(id) || 'clipboard-check';

// ---- datas (data local, ISO yyyy-mm-dd)
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const deIso = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const somaDias = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const inicioSemana = (d) => somaDias(d, -((d.getDay() + 6) % 7)); // segunda
const hoje = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const moeda = (v) => (v == null ? '' : (typeof formatarMoedaBR === 'function' ? formatarMoedaBR(v) : Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })));

// ---- status e assunto
function statusCompromisso(r) { // D7.10 — só para o compromisso da Agenda
    if (r.tipo === 'feriado') return 'informativo'; // v1.8.0 — feriado não pede ação
    if (r.severidade) return r.severidade;
    if (r.atrasado) return 'critico';
    return deIso(r.data) <= somaDias(hoje(), JANELA_ATENCAO) ? 'atencao' : 'informativo';
}
const assuntoCompromisso = (r) => r.dominio || (TIPOS[r.tipo] || {}).dominio || 'itens';
function assuntoAlerta(a) { // alerta do Motor → assunto do filtro (só leitura; a regra do alerta não muda)
    const et = a.entidade_tipo;
    if (et === 'ativo') return 'ativos';
    if (et === 'contrato') return 'contratos';
    if (et === 'documento') return 'documentos';
    if (et === 'item_controle') return a.dominio === 'financeiro' ? 'financeiro' : 'itens';
    if (a.dominio === 'financeiro' || a.dominio === 'fiscal') return 'financeiro';
    if (a.dominio === 'cadastro') return 'ativos';
    return 'itens';
}
// v1.3.0 — o alerta fica na data do FATO GERADOR (Nicola 14/10 09:50: "um alerta há 14 dias pendente que foi originado
// de algo no dia 01.10 tem que aparecer no 01.10 com a tag de alerta há 14 dias"), pela mesma leitura da linha do alerta:
// prazo (dias até vencer; negativo = já venceu) → hoje + dias; extrato desatualizado e rotina pronta contam dias DESDE o
// fato → hoje − |dias|; sem dias → hoje. Vencido aparece vermelho na linha e conta como crítico; os outros pela severidade.
const ehRotina = (a) => (typeof ROTINA_PRONTA_ALERTA !== 'undefined' && ROTINA_PRONTA_ALERTA.includes(a.tipo_alerta)) || a.tipo_alerta === 'extrato_desatualizado';
const dataAlerta = (a) => a.dias == null ? iso(hoje()) : iso(somaDias(hoje(), ehRotina(a) ? -Math.abs(a.dias) : a.dias));
function statusAlerta(a) {
    if (a.severidade === 'critico') return 'critico';
    if (!ehRotina(a) && a.dias != null && a.dias < 0) return 'critico';
    return a.severidade === 'atencao' ? 'atencao' : 'informativo';
}
const TODOS_ASSUNTOS = () => new Set(ASSUNTOS.map(a => a[0]));
const passaStatus = (s) => !st.status.size || st.status.has(s);
const passaAssunto = (a) => st.assuntos.has(a); // v1.2.0 — começa com todos marcados; desmarcar tira

function periodo() { // o que se busca no banco: a grade inteira (Mês/Lista) ou a semana
    if (st.vista === 'semana') return [st.semana, somaDias(st.semana, 6)];
    const ini = new Date(st.mes.getFullYear(), st.mes.getMonth(), 1);
    const fim = new Date(st.mes.getFullYear(), st.mes.getMonth() + 1, 0);
    return [inicioSemana(ini), somaDias(inicioSemana(fim), 6)];
}
function tituloPeriodo() {
    if (st.vista !== 'semana') return `${MESES[st.mes.getMonth()]} ${st.mes.getFullYear()}`;
    const a = st.semana, b = somaDias(st.semana, 6);
    return a.getMonth() === b.getMonth() ? `${a.getDate()}–${b.getDate()} ${MES_CURTO[a.getMonth()]}` : `${a.getDate()} ${MES_CURTO[a.getMonth()]} – ${b.getDate()} ${MES_CURTO[b.getMonth()]}`;
}
const mesTemHoje = () => st.mes.getFullYear() === hoje().getFullYear() && st.mes.getMonth() === hoje().getMonth();
// (alertasVisiveisTodos é um `let` do index: lido pelo nome, não por window)
const alertasMotor = () => (typeof alertasVisiveisTodos !== 'undefined' && Array.isArray(alertasVisiveisTodos)) ? alertasVisiveisTodos : [];

// v1.2.0 — UM universo para tudo (linhas, números dos chips, pontos, resumo): o mesmo conjunto em todas as contas.
// Cada item: { tipo: 'c'|'a', dia, status, assunto, r (compromisso) | a (alerta), i (índice em st.dados) }.
// v1.3.0 — tudo no dia do fato gerador, nas três vistas (o que está pendente leva a tag "há N dias").
function universo(de, ate) {
    const alertas = alertasMotor();
    const entAlerta = new Set(alertas.map(a => a.entidade_id).filter(Boolean));
    const limiteDup = iso(somaDias(hoje(), JANELA_ATENCAO));
    const itens = [];
    alertas.forEach(a => {
        if (st.ativo && ((a.detalhe && a.detalhe.ativo_id) || (a.entidade_tipo === 'ativo' ? a.entidade_id : null)) !== st.ativo.id) return; // v1.16.0 — filtro por bem
        const dia = dataAlerta(a);
        if (dia >= de && dia <= ate) itens.push({ tipo: 'a', dia, status: statusAlerta(a), assunto: assuntoAlerta(a), a });
    });
    st.dados.forEach((r, i) => {
        if (entAlerta.has(r.entidade_id) && r.data <= limiteDup) return; // o alerta já mostra (não repete)
        const dia = r.data;
        if (dia >= de && dia <= ate) itens.push({ tipo: 'c', dia, status: statusCompromisso(r), assunto: assuntoCompromisso(r), r, i });
    });
    return itens;
}
// v1.25.0 — termo da lupa do topo: bate em qualquer texto da linha (e do detalhe do alerta), sem acento nem maiúscula
const semAcento = (v) => String(v ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const textoDoItem = (it) => { const o = it.r || it.a || {}; return semAcento([it.assunto, ...Object.values(o), ...Object.values(o.detalhe || {})].filter(v => typeof v === 'string').join(' ')); };
const passaTexto = (it) => !st.texto.trim() || textoDoItem(it).includes(semAcento(st.texto.trim()));
const visivel = (it) => passaStatus(it.status) && passaAssunto(it.assunto) && passaTexto(it);
function intervaloContado() { // o que os números contam (sem as bordas da grade)
    if (st.vista === 'semana') return [iso(st.semana), iso(somaDias(st.semana, 6))];
    const ini = iso(new Date(st.mes.getFullYear(), st.mes.getMonth(), 1)), fim = iso(new Date(st.mes.getFullYear(), st.mes.getMonth() + 1, 0));
    return [ini, fim];
}

// ---- entrada (chamada pelo index: rzAgendaVista)
export async function montarAgenda(vista, el) {
    st.el = el || st.el;
    if (!st.el) return;
    st.vista = ['semana', 'mes', 'alertas'].includes(vista) ? vista : (st.vista || 'mes'); // v1.6.0 — + Alertas; sem vista: mantém a atual
    if (agDesk()) st.vista = 'mes'; // v1.13.0 — no computador o mês e os pendentes estão sempre à vista
    if (!st.mes) st.mes = new Date(hoje().getFullYear(), hoje().getMonth(), 1);
    if (!st.dia) st.dia = iso(hoje());
    if (!st.semana) st.semana = inicioSemana(hoje());
    if (!st.assuntos) st.assuntos = TODOS_ASSUNTOS();
    window.rzAgendaRedesenhar = () => { if (st.el && st.el.isConnected) desenhar(false); };
    await carregar();
}

// v1.6.0 (item 36) — a vista Alertas é a lista de alertas de sempre (#agenda-lista do index), logo abaixo das abas
// v1.13.0 — no computador ela é o bloco Pendentes da coluna da direita (desenharComputador a põe lá)
function mostrarListaAlertas(mostrar) {
    const lista = document.getElementById('agenda-lista');
    if (!lista || !st.el) return;
    if (agDesk()) return;
    if (lista.previousElementSibling !== st.el) st.el.after(lista);
    lista.hidden = !mostrar;
}
const agDesk = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(min-width:1024px)').matches;

// v1.21.0 — a mesma linha da agenda vinda de dois ramos aparece uma vez só
const chaveAgenda = (r) => [r.data, r.tipo, r.entidade_tipo, r.entidade_id, r.ocorrencia_id, r.titulo, r.hora].join('|');
async function carregar() {
    const meu = ++st.seq;
    mostrarListaAlertas(st.vista === 'alertas');
    if (st.vista === 'alertas') { desenhar(false); return; } // a lista vem do index (montarAlertasPatrimonio)
    const [de, ate] = periodo();
    desenhar(true);
    let dados = [];
    try {
        const ramo = (typeof geralRamoFiltro !== 'undefined' && geralRamoFiltro && geralRamoFiltro !== 'tudo') ? geralRamoFiltro : null;
        // v1.16.0 — v2: severidade, assunto, hora e situação vêm do banco; filtro por bem (p_ativos)
        const args = { p_cliente_id: CLIENTE_ID_SUPABASE, p_de: iso(de), p_ate: iso(ate), p_ramo: ramo };
        const rpcAg = (nome, a) => (window.RZ_RAMOS_LENTE && window.rzRpcPorRamos) ? window.rzRpcPorRamos(nome, a, chaveAgenda) : dbAuth.rpc(nome, a); // v1.21.0
        // linha única (a mesma do robô); reserva: v2, depois v1
        let { data, error } = await rpcAg('fn_agenda_linhas', { ...args, p_ativos: st.ativo ? [st.ativo.id] : null });
        if (error) {
            console.warn('[agenda] fn_agenda_linhas:', error.message);
            ({ data, error } = await rpcAg('fn_agenda_periodo_v2', { ...args, p_ativos: st.ativo ? [st.ativo.id] : null }));
        }
        if (error) { // reserva: a v1 de sempre (sem filtro por bem no banco — filtra aqui)
            console.warn('[agenda] fn_agenda_periodo_v2:', error.message);
            ({ data, error } = await rpcAg('fn_agenda_periodo', args));
            if (error) throw error;
            if (st.ativo) data = (data || []).filter(r => r.ativo_id === st.ativo.id);
        }
        dados = data || [];
    } catch (e) {
        if (meu !== st.seq) return;
        console.error('[agenda] fn_agenda_periodo:', e?.message || e);
        const c = st.el.querySelector('#ag-corpo');
        if (c) c.innerHTML = '<p class="rz-desc rz-ag-nada">Não consegui carregar a agenda agora.</p>';
        return;
    }
    if (meu !== st.seq) return; // chegou um período mais novo
    await carregarIconesDosItens([...dados.filter(r => r.entidade_tipo === 'item_controle').map(r => r.entidade_id),
        ...alertasMotor().filter(a => a.entidade_tipo === 'item_controle').map(a => a.entidade_id)]); // v1.11.0
    if (meu !== st.seq) return;
    st.dados = dados;
    desenhar(false);
}

// ---- moldura: título (linha 1), vistas (linha 2), filtros (linha 3), corpo
function desenhar(carregando) {
    // ARMADILHA: no computador a #agenda-lista (do index) mora dentro de st.el; sai antes do innerHTML, senão é destruída
    const listaAl = document.getElementById('agenda-lista');
    if (listaAl && st.el && st.el.contains(listaAl)) st.el.after(listaAl);
    if (agDesk() && st.vista !== 'alertas') return desenharComputador(carregando);
    const [de, ate] = intervaloContado();
    const base = carregando ? [] : universo(de, ate).filter(it => passaAssunto(it.assunto) && passaTexto(it));
    const conta = (s) => base.filter(it => it.status === s).length;
    const todos = st.assuntos.size === ASSUNTOS.length;
    const rotAss = todos ? 'Assunto' : !st.assuntos.size ? 'Nenhum assunto' : st.assuntos.size === 1 ? ASSUNTOS.find(a => st.assuntos.has(a[0]))[1] : `Assunto · ${st.assuntos.size} de ${ASSUNTOS.length}`;
    const abas = `<div class="rz-seg rz-fin-abas" role="tablist" aria-label="Vista da agenda">
            ${[['mes', 'Mês'], ['semana', 'Semana'], ['alertas', 'Alertas']].map(([k, n]) => `<button type="button" class="${st.vista === k ? 'rz-on' : ''}" data-ag-vista="${k}">${n}</button>`).join('')}
        </div>`;
    if (st.vista === 'alertas') { // v1.6.0 — título fixo, sem setas de período; a busca e a severidade são as da lista
        st.el.innerHTML = `<div class="rz-fin-topo"><div class="rz-mes-bar rz-mes-titulo"><span class="rz-mes-centro"><b class="rz-mes-label">Alertas</b></span></div></div>${abas}`;
        ligar(); rzIcones(); return;
    }
    st.el.innerHTML = `
        <div class="rz-fin-topo">
            <div class="rz-mes-bar rz-mes-titulo">
                <button type="button" class="rz-ico-btn" data-ag-nav="-1" aria-label="Anterior"><svg data-lucide="chevron-left"></svg></button>
                <span class="rz-mes-centro"><b class="rz-mes-label">${rzEsc(tituloPeriodo())}</b></span>
                <button type="button" class="rz-ico-btn" data-ag-nav="1" aria-label="Próximo"><svg data-lucide="chevron-right"></svg></button>
            </div>
            <button type="button" class="rz-ico-btn rz-ag-mais" data-ag-mais aria-label="Mais ações" style="background:none;box-shadow:none;border:0;color:var(--ink)"><svg data-lucide="more-vertical"></svg></button>
        </div>
        ${abas}
        <div class="rz-chips rz-ag-chips">
            ${STATUS.map(([k, n]) => `<button type="button" class="rz-chip${st.status.has(k) ? ' rz-on' : ''}" data-ag-st="${k}"><span class="rz-ag-pt rz-ag-${k}"></span>${n}${carregando ? '' : ` <span class="rz-n">${conta(k)}</span>`}</button>`).join('')}
            <button type="button" class="rz-chip rz-ag-ass${todos ? '' : ' rz-on'}" data-ag-ass>${rzEsc(rotAss)} <svg data-lucide="chevron-down"></svg></button>
                    ${chipAtivoHtml()}
        </div>
        <div id="ag-corpo">${carregando ? (typeof rzSkeleton === 'function' ? rzSkeleton('lista', 4) : '') : (st.vista === 'semana' ? semanaHtml() : mesHtml())}</div>${buscaLupaHtml()}`;
    ligar();
    if (!carregando && typeof rzLigarGestosAlertas === 'function') {
        const m = st.el.querySelector('#ag-corpo');
        if (m && m.querySelector('[data-rz-alerta],[data-rz-grupo]')) rzLigarGestosAlertas(m); // gestos de sempre
    }
    rzIcones();
}

// ---- linhas
function linhaHtml(r, i) {
    const t = r.icone ? { icone: r.icone, rotulo: '' } // ícone pronto da fn_agenda_linhas (o mesmo do robô)
        : /^Escola · /.test(r.titulo || '') ? { icone: 'backpack', rotulo: 'Escola' }
        : /^Esporte · /.test(r.titulo || '') ? { icone: 'trophy', rotulo: 'Esporte' } // v1.10.0
        : /^Atividade · /.test(r.titulo || '') ? { icone: 'palette', rotulo: 'Atividade' }
        : r.entidade_tipo === 'item_controle' ? { icone: iconeDoItemAgenda(r.entidade_id), rotulo: 'Item de controle' } // v1.11.0
        : (TIPOS[r.tipo] || { icone: 'circle', rotulo: '' }); // v1.9.0
    const s = statusCompromisso(r);
    const faixa = r.inicio_em ? [r.inicio_em, r.fim_em].filter(Boolean).map(x => new Date(x).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })).join('–') : ''; // v1.16.0
    const quem = r.titulo_curto != null ? [r.bem_curto, r.quem].filter(Boolean).join(' · ') : r.sub;
    const sub = [faixa, quem, r.situacao === 'realizado' ? 'realizado' : '', r.situacao === 'aguardando' ? 'aguardando' : ''].filter(Boolean).join(' · ') || t.rotulo;
    const diasAtraso = r.atrasado ? Math.round((hoje() - deIso(r.data)) / 86400000) : 0;
    const selo = diasAtraso > 0 ? ((typeof renderStatus === 'function') ? renderStatus('bad', `Há ${diasAtraso}d`) : `<span class="rz-st rz-bad">Há ${diasAtraso}d</span>`) : '';
    return `<button type="button" class="rz-row rz-link rz-ag-linha rz-ag-${s}" data-ag-i="${i}">
        <div class="rz-ic"><svg data-lucide="${r.situacao === 'realizado' ? 'check' : t.icone}"></svg></div>
        <div class="rz-tx"><b>${rzEsc(r.titulo_curto || r.titulo || t.rotulo)}</b><span>${rzEsc(sub)}</span></div>
        ${selo}${r.valor != null ? `<span class="rz-ag-valor">${moeda(r.valor)}</span>` : ''}</button>`;
}
// D7.13 — dia por hora: "Dia todo" primeiro; depois um bloco por horário (quando o registro do dia trouxer hora)
function blocoComps(its) {
    const semHora = its.filter(it => !it.r.hora), comHora = its.filter(it => it.r.hora).sort((a, b) => String(a.r.hora).localeCompare(String(b.r.hora)));
    if (!comHora.length) return its.map(it => linhaHtml(it.r, it.i)).join('');
    let h = semHora.length ? `<div class="rz-ag-hora">Dia todo</div>${semHora.map(it => linhaHtml(it.r, it.i)).join('')}` : '';
    let ultima = '';
    comHora.forEach(it => { const hh = String(it.r.hora).slice(0, 5); if (hh !== ultima) { h += `<div class="rz-ag-hora">${hh}</div>`; ultima = hh; } h += linhaHtml(it.r, it.i); });
    return h;
}
// alertas: agrupados e desenhados pela função de sempre (linhaAlertaHtml), UMA chamada por tela; cada grupo vai para
// o dia mais cedo dos seus alertas
function alertasPorDia(itensAlerta) {
    const porDia = new Map();
    if (!itensAlerta.length || typeof agruparEMapearAlertas !== 'function' || typeof linhaAlertaHtml !== 'function') return porDia;
    const diaDaChave = new Map(itensAlerta.map(it => [it.a.alerta_chave, it.dia]));
    const itemDaChave = new Map(itensAlerta.filter(it => it.a.entidade_tipo === 'item_controle').map(it => [it.a.alerta_chave, it.a.entidade_id])); // v1.11.0
    const mapeados = agruparEMapearAlertas(itensAlerta.map(it => it.a));
    if (typeof rzOrdemAlertas === 'function') mapeados.sort(rzOrdemAlertas);
    mapeados.forEach(m => {
        const chaves = m.alertaChave ? [m.alertaChave] : (m.grupoChaves || []);
        const dia = chaves.map(c => diaDaChave.get(c)).filter(Boolean).sort()[0] || iso(hoje());
        if (!porDia.has(dia)) porDia.set(dia, []);
        // v1.11.0 — alerta de UM item de controle: troca a chave inglesa (ícone da categoria no index) pelo ícone do item
        const item = m.alertaChave ? itemDaChave.get(m.alertaChave) : null;
        const html = linhaAlertaHtml(m);
        porDia.get(dia).push(item && st.icones.has(item) ? html.replace('data-lucide="wrench"', `data-lucide="${st.icones.get(item)}"`) : html);
    });
    return porDia;
}
const rotDia = (di) => { const d = deIso(di); return `${DIA_SEM[d.getDay()]} ${d.getDate()}${di === iso(hoje()) ? ' · hoje' : ''}`; };
function cardDoDia(di, its, alertaHtml) {
    const comps = its.filter(it => it.tipo === 'c');
    return `<div class="rz-card rz-list">${(alertaHtml || []).join('')}${blocoComps(comps)}</div>`;
}

// ---- pontos por status, do mesmo universo
function pontosDe(its, di) {
    const ss = new Set(its.filter(it => it.dia === di).map(it => it.status));
    return `<span class="rz-ag-pts">${['critico', 'atencao', 'informativo'].filter(s => ss.has(s)).map(s => `<i class="rz-ag-${s}"></i>`).join('')}</span>`;
}
function listaDoDia(its) {
    const d = deIso(st.dia);
    const doDia = its.filter(it => it.dia === st.dia);
    const alertas = alertasPorDia(doDia.filter(it => it.tipo === 'a'));
    return `<div class="rz-group rz-ag-dia${st.dia === iso(hoje()) ? ' rz-ag-hoje' : ''}">${DIA_SEM[d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}<span>${doDia.length || '—'}</span></div>
        ${doDia.length ? cardDoDia(st.dia, doDia, alertas.get(st.dia)) : '<p class="rz-desc rz-ag-nada">Nada neste dia.</p>'}`;
}

// ---- Semana (D7.9): faixa de 7 dias + resumo + dia
function semanaHtml() {
    const a = iso(st.semana), b = iso(somaDias(st.semana, 6));
    const its = universo(a, b).filter(visivel);
    let faixa = '';
    for (let k = 0; k < 7; k++) {
        const d = somaDias(st.semana, k), di = iso(d);
        faixa += `<button type="button" class="rz-ag-cel${di === st.dia ? ' rz-on' : ''}${di === iso(hoje()) ? ' rz-ag-cel-hoje' : ''}" data-ag-dia="${di}">
            <small>${DIA_SEM[d.getDay()]}</small><b>${d.getDate()}</b>${pontosDe(its, di)}</button>`;
    }
    const crit = its.filter(it => it.status === 'critico').length;
    return `<div class="rz-ag-grade">${faixa}</div>
        <p class="rz-ag-resumo"><b>${its.length}</b> na semana${crit ? ` · <span class="rz-ag-txt-critico"><b>${crit}</b> crítico${crit > 1 ? 's' : ''}</span>` : ''}</p>${listaDoDia(its)}`;
}

// ---- Computador (v1.13.0): mês e filtros à esquerda; Pendentes, o dia e os próximos 7 dias à direita
function desenharComputador(carregando) {
    const [de, ate] = intervaloContado();
    const base = carregando ? [] : universo(de, ate).filter(it => passaAssunto(it.assunto) && passaTexto(it));
    const conta = (s) => base.filter(it => it.status === s).length;
    const todos = st.assuntos.size === ASSUNTOS.length;
    const rotAss = todos ? 'Assunto' : !st.assuntos.size ? 'Nenhum assunto' : st.assuntos.size === 1 ? ASSUNTOS.find(a => st.assuntos.has(a[0]))[1] : `Assunto · ${st.assuntos.size} de ${ASSUNTOS.length}`;
    let grade = '', direita = '';
    if (carregando) { grade = typeof rzSkeleton === 'function' ? rzSkeleton('cards', 1) : ''; direita = typeof rzSkeleton === 'function' ? rzSkeleton('lista', 4) : ''; }
    else {
        const [pd, pa] = periodo();
        const its = universo(iso(pd), iso(pa)).filter(visivel);
        grade = gradeMesHtml(its);
        direita = listaDoDia(its) + proximosDiasHtml(its);
    }
    st.el.innerHTML = `<div class="rz-ag-dk">
        <div class="rz-ag-dk-e">
            <div class="rz-card rz-ag-dk-mes">
                <div class="rz-ag-dk-topo">
                    <button type="button" class="rz-ico-btn" data-ag-nav="-1" aria-label="Anterior"><svg data-lucide="chevron-left"></svg></button>
                    <b>${rzEsc(tituloPeriodo())}</b>
                    <button type="button" class="rz-ico-btn" data-ag-nav="1" aria-label="Próximo"><svg data-lucide="chevron-right"></svg></button>
                    <button type="button" class="rz-ico-btn rz-ag-mais" data-ag-mais aria-label="Mais ações"><svg data-lucide="more-vertical"></svg></button>
                </div>${grade}
            </div>
            <div class="rz-card"><div class="rz-card-h"><h3>Mostrar</h3></div>
                <div class="rz-chips rz-ag-chips">
                    ${STATUS.map(([k, n]) => `<button type="button" class="rz-chip${st.status.has(k) ? ' rz-on' : ''}" data-ag-st="${k}"><span class="rz-ag-pt rz-ag-${k}"></span>${n}${carregando ? '' : ` <span class="rz-n">${conta(k)}</span>`}</button>`).join('')}
                    <button type="button" class="rz-chip rz-ag-ass${todos ? '' : ' rz-on'}" data-ag-ass>${rzEsc(rotAss)} <svg data-lucide="chevron-down"></svg></button>
                    ${chipAtivoHtml()}
                </div>
            </div>
        </div>
        <div class="rz-ag-dk-d"><div id="ag-pend-slot"><div class="rz-group">Pendentes</div></div><div id="ag-corpo">${direita}</div></div>
    </div>${buscaLupaHtml()}`;
    const lista = document.getElementById('agenda-lista'), slot = st.el.querySelector('#ag-pend-slot');
    if (lista && slot) { slot.appendChild(lista); lista.hidden = false; }
    ligar();
    if (!carregando && typeof rzLigarGestosAlertas === 'function') {
        const m = st.el.querySelector('#ag-corpo');
        if (m && m.querySelector('[data-rz-alerta],[data-rz-grupo]')) rzLigarGestosAlertas(m);
    }
    rzIcones();
}
function proximosDiasHtml(its) {
    const linhas = [];
    for (let k = 1; k <= 7; k++) {
        const d = somaDias(deIso(st.dia), k), di = iso(d);
        const doDia = its.filter(it => it.dia === di);
        if (!doDia.length) continue;
        const nomes = doDia.map(it => it.tipo === 'c' ? (it.r.titulo || '') : (it.a.titulo || '')).filter(Boolean);
        linhas.push(`<button type="button" class="rz-row rz-link" data-ag-dia="${di}"><div class="rz-tx"><b>${DIA_SEM[d.getDay()]} ${d.getDate()} · ${doDia.length} ${doDia.length > 1 ? 'itens' : 'item'}</b><span>${rzEsc(nomes.slice(0, 3).join(' · '))}</span></div><svg data-lucide="chevron-right" class="rz-chev"></svg></button>`);
    }
    return linhas.length ? `<div class="rz-group">Próximos 7 dias</div><div class="rz-card rz-list">${linhas.join('')}</div>` : '';
}

// ---- Mês
function mesHtml() {
    const [de, ate] = periodo();
    const its = universo(iso(de), iso(ate)).filter(visivel);
    return `${gradeMesHtml(its)}${listaDoDia(its)}`;
}
// v1.16.0 (CRM F2a) — o mês é o componente único (js/nucleo/calendario.js, DS §6.3); a grade própria saiu.
// Compromisso com hora ou aguardando pinta o dia (situação); o resto vira ponto na cor do status.
function gradeMesHtml(its) {
    const itens = its.map(it => it.tipo === 'c' ? rzCalItemDaAgenda(it.r, it.status) : { dia: it.dia, sit: null, st: it.status });
    return `<div class="rz-ag-calmes">${rzCalendario({ ano: st.mes.getFullYear(), mes: st.mes.getMonth(), itens, sel: st.dia })}</div>`;
}
// v1.16.0 — chip do filtro por bem
function chipAtivoHtml() {
    return st.ativo
        ? `<button type="button" class="rz-chip rz-on" data-ag-ativo>${rzEsc(st.ativo.nome)} <svg data-lucide="x" data-ag-ativo-x></svg></button>`
        : `<button type="button" class="rz-chip" data-ag-ativo>Ativo <svg data-lucide="chevron-down"></svg></button>`;
}
let ativosAgenda = null;
async function escolherAtivoAgenda() {
    if (!ativosAgenda) {
        const { data, error } = await dbAuth.from('cofre_ativos').select('id,nome_exibicao,tipo_ativo')
            .eq('cliente_id', CLIENTE_ID_SUPABASE).eq('status', 'ativo').order('nome_exibicao');
        if (error) { console.warn('[agenda] ativos:', error.message); if (typeof mostrarToast === 'function') mostrarToast('Não consegui carregar os bens.'); return; }
        ativosAgenda = (data || []).filter(a => a.nome_exibicao);
    }
    const acoes = ativosAgenda.map(a => ({ icone: 'box', titulo: a.nome_exibicao, sub: a.tipo_ativo || '',
        aoTocar: () => { st.ativo = { id: a.id, nome: a.nome_exibicao }; carregar(); } }));
    if (st.ativo) acoes.unshift({ icone: 'x', titulo: 'Todos os bens', sub: 'Tirar o filtro', aoTocar: () => { st.ativo = null; carregar(); } });
    abrirSheetAcoes({ titulo: 'Agenda de um bem', sub: 'O calendário mostra só o que é dele', acoes });
}
// v1.25.0 — campo escondido que a lupa do topo (js/busca-filtro.js) preenche com o termo do app; o bem fica no chip Ativo ▾
const buscaLupaHtml = () => `<label class="rz-search" data-lupa style="display:none"><input type="search" data-ag-texto tabindex="-1" aria-hidden="true" value="${rzEsc(st.texto)}"></label>`;

// ---- eventos
function ligar() {
    st.el.querySelectorAll('[data-ag-vista]').forEach(b => b.addEventListener('click', () => {
        const v = b.dataset.agVista;
        if (v === st.vista) return;
        if (v === 'semana') { st.semana = inicioSemana(deIso(st.dia)); }
        else if (v === 'mes') { const d = deIso(st.dia); st.mes = new Date(d.getFullYear(), d.getMonth(), 1); }
        st.vista = v;
        carregar();
    }));
    st.el.querySelectorAll('[data-ag-nav]').forEach(b => b.addEventListener('click', () => navegar(Number(b.dataset.agNav))));
    // v1.17.0 (Nicola 13/11 19:06) — sem arrastar para trocar mês/semana: atrapalhava rolar os compromissos. Só as setas.
    st.el.querySelectorAll('[data-ag-st]').forEach(b => b.addEventListener('click', () => {
        const k = b.dataset.agSt; st.status.has(k) ? st.status.delete(k) : st.status.add(k); desenhar(false);
    }));
    const ass = st.el.querySelector('[data-ag-ass]');
    if (ass) ass.addEventListener('click', abrirAssunto);
    st.el.querySelectorAll('[data-ag-dia]').forEach(b => b.addEventListener('click', () => { st.dia = b.dataset.agDia; desenhar(false); }));
    st.el.querySelectorAll('[data-cal-dia]').forEach(b => b.addEventListener('click', () => { st.dia = b.dataset.calDia; desenhar(false); })); // v1.16.0
    const chipAt = st.el.querySelector('[data-ag-ativo]');
    if (chipAt) chipAt.addEventListener('click', (ev) => {
        if (st.ativo && ev.target.closest('[data-ag-ativo-x]')) { st.ativo = null; carregar(); return; }
        escolherAtivoAgenda();
    });
    const txt = st.el.querySelector('[data-ag-texto]'); // v1.25.0
    if (txt) txt.addEventListener('input', () => { if (txt.value !== st.texto) { st.texto = txt.value; desenhar(false); } });
    if (typeof window.rzHdrBuscaSync === 'function') window.rzHdrBuscaSync();
    st.el.querySelectorAll('[data-ag-i]').forEach(b => b.addEventListener('click', () => abrirCompromisso(st.dados[Number(b.dataset.agI)])));
    const mais = st.el.querySelector('[data-ag-mais]');
    if (mais) mais.addEventListener('click', () => abrirSheetAcoes({ titulo: 'Agenda', sub: tituloPeriodo(), acoes: [
        { icone: 'calendar-clock', titulo: 'Reserva ou reunião com hora', sub: 'Com aviso de conflito no bem', codigo: 'agenda.reservar', aoTocar: () => setTimeout(() => import('./agenda-form.js').then(m => m.abrirFormularioAgenda({ ativoId: st.ativo?.id, data: st.dia, aoSalvar: carregar })), 50) }, // v1.18.0
        { icone: 'calendar-plus', titulo: 'Novo compromisso', sub: 'Para uma ou mais pessoas', aoTocar: () => setTimeout(() => abrirNovoCompromisso(), 50) }, // v1.12.0
        { icone: 'send', titulo: 'Enviar a semana', sub: 'Compartilhar com uma pessoa', aoTocar: enviarSemana },
        { icone: 'file-up', titulo: 'Importar calendário', sub: 'Escola, esporte, curso · PDF ou foto', aoTocar: () => setTimeout(abrirImportarCalendario, 50) }, // v1.10.0
    ] }));
}

function navegar(n) {
    if (st.vista === 'semana') {
        st.semana = somaDias(st.semana, 7 * n);
        const h = iso(hoje()); st.dia = (h >= iso(st.semana) && h <= iso(somaDias(st.semana, 6))) ? h : iso(st.semana);
    } else if (st.vista === 'mes') {
        st.mes = new Date(st.mes.getFullYear(), st.mes.getMonth() + n, 1);
        st.dia = mesTemHoje() ? iso(hoje()) : iso(st.mes);
    } else return;
    carregar();
}

// Assunto (D7.11; v1.2.0 lógica do Nicola 14/10: abre com TODOS marcados, desmarca o que não quer ver)
function abrirAssunto() {
    const marcados = new Set(st.assuntos);
    const [de, ate] = intervaloContado();
    const base = universo(de, ate).filter(it => passaStatus(it.status) && passaTexto(it)).map(it => it.assunto);
    const corpo = () => ASSUNTOS.map(([k, n]) => `<button type="button" class="rz-row rz-link rz-ag-op${marcados.has(k) ? ' rz-on' : ''}" data-ag-op="${k}">
            <span class="rz-ag-ck">${marcados.has(k) ? '<svg data-lucide="check"></svg>' : ''}</span>
            <div class="rz-tx"><b>${n}</b></div><span class="rz-ag-valor">${base.filter(x => x === k).length}</span></button>`).join('')
        + `<button type="button" class="rz-btn rz-btn-1 rz-ag-bt" data-ag-aplicar${marcados.size ? '' : ' disabled'}>${marcados.size ? 'Mostrar' : 'Marque ao menos um'}</button>
           <button type="button" class="rz-btn rz-ag-bt" data-ag-todos>${marcados.size === ASSUNTOS.length ? 'Desmarcar todos' : 'Marcar todos'}</button>`;
    const sh = abrirSheet(rzSheetCabecalho('Assunto', 'Desmarque o que não quer ver') + `<div class="rz-sh-b" id="ag-ass-corpo">${corpo()}</div>`);
    const ligarOps = () => {
        const c = sh.querySelector('#ag-ass-corpo');
        const redesenhar = () => { c.innerHTML = corpo(); ligarOps(); rzIcones(); };
        c.querySelectorAll('[data-ag-op]').forEach(o => o.addEventListener('click', () => {
            const k = o.dataset.agOp; marcados.has(k) ? marcados.delete(k) : marcados.add(k); redesenhar();
        }));
        c.querySelector('[data-ag-aplicar]').addEventListener('click', () => { if (!marcados.size) return; st.assuntos = marcados; fecharSheet(); desenhar(false); });
        c.querySelector('[data-ag-todos]').addEventListener('click', () => {
            if (marcados.size === ASSUNTOS.length) marcados.clear(); else ASSUNTOS.forEach(a => marcados.add(a[0]));
            redesenhar();
        });
    };
    ligarOps(); rzIcones();
}

// Toque no compromisso: abre o lugar dele pelos caminhos que já existem.
// v1.17.0 — a linha e o toque da Agenda para o card Calendário da ficha do ativo (cofre-ativos.js 1.154.0)
export function linhaCompromissoHtml(r, i) { return linhaHtml(r, i); }
export function abrirCompromissoAgenda(r) { return abrirCompromisso(r); }

// v1.24.0 (D3, Nicola 27/11 22:31) — busca geral (lupa do Hoje e do Resumo): compromissos, vencimentos, reservas e reuniões de 14 dias
// atrás até 45 dias à frente (v1.24.1: fn_agenda_linhas aceita até 62 dias), pela mesma linha do robô (fn_agenda_linhas); bate no título, no bem, em quem e no complemento.
export async function buscarAgendaTexto(termo) {
    const t = String(termo || '').trim().toLowerCase();
    if (t.length < 2 || typeof CLIENTE_ID_SUPABASE === 'undefined' || !CLIENTE_ID_SUPABASE) return [];
    const h = hoje();
    const { data, error } = await dbAuth.rpc('fn_agenda_linhas', { p_cliente_id: CLIENTE_ID_SUPABASE, p_de: iso(somaDias(h, -14)), p_ate: iso(somaDias(h, 45)) });
    if (error) throw error;
    const dmy = (d) => (d ? `${d.slice(8, 10)}/${d.slice(5, 7)}` : '');
    return (data || []).filter(r => [r.titulo, r.sub, r.quem, r.bem_curto].some(c => String(c || '').toLowerCase().includes(t)))
        .slice(0, 30).map((r, i) => ({ id: String(i), nome: r.titulo_curto || r.titulo || 'Compromisso', icone: r.icone || 'calendar',
            sub: [dmy(r.data) + (r.hora ? ' ' + String(r.hora).slice(0, 5) : ''), r.sub].filter(Boolean).join(' · '), linha: r }));
}
function abrirCompromisso(r) {
    if (!r) return;
    if (r.tipo === 'feriado') { if (typeof mostrarToast === 'function') mostrarToast(`${r.titulo} · ${r.sub || 'Nacional'}`); return; } // v1.8.0
    if (r.entidade_tipo === 'processo' || r.situacao === 'aguardando') { import('./agenda-form.js').then(m => m.abrirDecisaoPedido(r, carregar)); return; } // v1.18.0 — Aprovar · Outra data · Recusar
    if (r.entidade_tipo === 'item_controle' && r.ocorrencia_id && r.inicio_em && !r._semMeet) { // v1.19.0 — reunião com Meet
        dbAuth.from('cofre_ocorrencias_controle').select('evento_externo').eq('id', r.ocorrencia_id).maybeSingle().then(({ data }) => {
            const link = data && data.evento_externo && !data.evento_externo.cancelado_em ? data.evento_externo.link : '';
            if (!link || typeof abrirSheetAcoes !== 'function') return abrirCompromisso({ ...r, _semMeet: true });
            abrirSheetAcoes({ titulo: r.titulo || 'Reunião', sub: 'Google Meet', acoes: [
                { icone: 'video', titulo: 'Entrar no Meet', sub: link.replace('https://', ''), aoTocar: () => window.open(link, '_blank', 'noopener') },
                { icone: 'file-text', titulo: 'Detalhes', sub: 'Item de controle', aoTocar: () => abrirAlertaItemControle(r.entidade_id, r.ativo_id || '') },
            ] });
        });
        return;
    }
    if (r.entidade_tipo === 'item_controle') { abrirAlertaItemControle(r.entidade_id, r.ativo_id || ''); return; }
    if (r.entidade_tipo === 'contrato') { abrirFichaContrato(r.entidade_id); return; }
    if (r.entidade_tipo === 'membro') { import('./cofre-membros.js').then(m => m.abrirFichaMembro(r.entidade_id)).catch(() => mostrarToast('Não consegui abrir.')); return; } // v1.5.0
    if (r.entidade_tipo === 'documento') { switchTab('tab-ativos'); setTimeout(() => window.dispatchEvent(new CustomEvent('cofre:abrir-documento', { detail: { id: r.entidade_id } })), 120); return; }
    // recebimento e pagamento: o Financeiro no mês do vencimento
    switchTab(r.tipo === 'recebimento' ? 'tab-mensal' : 'tab-saidas');
    const atual = window.RZ_FIN_COMPETENCIA || iso(new Date(hoje().getFullYear(), hoje().getMonth(), 1));
    const meses = (Number(r.data.slice(0, 4)) - Number(atual.slice(0, 4))) * 12 + (Number(r.data.slice(5, 7)) - Number(atual.slice(5, 7)));
    if (meses && typeof window.financeiroMudarCompetencia === 'function') window.financeiroMudarCompetencia(meses);
    if (typeof mostrarToast === 'function') mostrarToast(`${r.titulo} · vence ${r.data.split('-').reverse().join('/')}`);
}

// 7b — texto curto da semana do dia escolhido, pelo adaptador do aparelho (respeita os filtros).
async function enviarSemana() {
    const ini = inicioSemana(deIso(st.dia)), fim = somaDias(ini, 6);
    let dados = st.dados;
    const cobre = st.dados.length && iso(ini) >= iso(periodo()[0]) && iso(fim) <= iso(periodo()[1]);
    if (!cobre) {
        try {
            const ramo = (typeof geralRamoFiltro !== 'undefined' && geralRamoFiltro && geralRamoFiltro !== 'tudo') ? geralRamoFiltro : null;
            const argsS = { p_cliente_id: CLIENTE_ID_SUPABASE, p_de: iso(ini), p_ate: iso(fim), p_ramo: ramo };
            const { data } = (window.RZ_RAMOS_LENTE && window.rzRpcPorRamos) ? await window.rzRpcPorRamos('fn_agenda_linhas', argsS, chaveAgenda) : await dbAuth.rpc('fn_agenda_linhas', argsS); // linha única
            dados = data || [];
        } catch (_) { /* usa o que está na tela */ }
    }
    const linhas = [];
    for (let k = 0; k < 7; k++) {
        const d = somaDias(ini, k), di = iso(d);
        const doDia = dados.filter(r => r.data === di && passaStatus(statusCompromisso(r)) && passaAssunto(assuntoCompromisso(r)));
        if (!doDia.length) continue;
        linhas.push(`*${DIA_SEM[d.getDay()]} ${d.getDate()}/${String(d.getMonth() + 1).padStart(2, '0')}*`);
        doDia.forEach(r => linhas.push(`• ${r.hora ? String(r.hora).slice(0, 5) + ' ' : ''}${r.titulo_curto || r.titulo}${r.valor != null ? ' · ' + moeda(r.valor) : ''}${r.atrasado ? ' (atrasado)' : ''}`));
    }
    const cab = `Agenda ${ini.getDate()}/${String(ini.getMonth() + 1).padStart(2, '0')} a ${fim.getDate()}/${String(fim.getMonth() + 1).padStart(2, '0')}`;
    const texto = linhas.length ? `${cab}\n\n${linhas.join('\n')}` : `${cab}\n\nNada marcado nesta semana.`;
    if (typeof rzDev === 'function') rzDev('whatsapp', '', texto);
    else window.open('https://wa.me/?text=' + encodeURIComponent(texto), '_blank');
}

// ---- v1.9.0 (b3aeefaf) — IMPORTAR CALENDÁRIO ESCOLAR. Tela única: escolhe o arquivo (ou o que chegou pelo WhatsApp e está
// no Cofre), a Edge calendario-escolar-ler devolve as linhas já sugeridas; a pessoa marca/desmarca, troca tipo e filho e
// confirma — fn_calendario_escolar_aplicar grava só o que foi marcado e a tela fecha. Reimportar = refazer (o que já está
// na agenda vem desmarcado, "já na agenda"). Nada fica pendente entre uma vez e outra.
const CAL_NORM = (t) => String(t ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const calChave = (_escola, ativo, data, tituloChave) => `calendario:${ativo}:${data}:${tituloChave}`.slice(0, 300); // v1.9.4 — sem a escola (o nome lido varia)
const calData = (d) => d ? `${d.slice(8, 10)}/${d.slice(5, 7)}` : '';
// v1.9.2 — "sex 06/11/2026"; período "seg 19/10 – qui 29/10/2026"
const calDiaSem = (d) => DIA_SEM[new Date(d + 'T12:00:00').getDay()];
// v1.9.3 — lista de escolha do app (js/raiz-ui.js), carregada só quando usada
const calEscolher = async (o) => (window.rzEscolher || (await import('./raiz-ui.js')).rzEscolher)(o);
const calQuando = (ini, fim) => (!fim || fim === ini) ? `${calDiaSem(ini)} ${calData(ini)}/${ini.slice(0, 4)}`
    : `${calDiaSem(ini)} ${calData(ini)}${ini.slice(0, 4) !== fim.slice(0, 4) ? '/' + ini.slice(0, 4) : ''} – ${calDiaSem(fim)} ${calData(fim)}/${fim.slice(0, 4)}`;
const CAL_RECOLHIDO = { outra_serie: 'Outras séries', outro_grupo: 'Outros grupos', passado: 'Datas que já passaram', feriado_na_agenda: 'Feriados que já estão na agenda' };
// v1.10.0 — nomes dos recolhidos pelo perfil (série/turma na escola, categoria/time no esporte)
const CAL_RECOLHIDO_PERFIL = { esporte: { outra_serie: 'Outras categorias', outro_grupo: 'Outros times' }, curso: { outra_serie: 'Outros módulos', outro_grupo: 'Outras turmas' } };
const calCasaGrupo = (g, grupos) => { const a = CAL_NORM(g); return !!a && (grupos || []).some(x => { const b = CAL_NORM(x); return b === a || b.split(' ').includes(a) || a.split(' ').includes(b); }); };

export async function abrirImportarCalendario() { // v1.9.0 — exportada também para o atalho de outras telas
    const sh = abrirSheet(rzSheetCabecalho('Importar calendário', 'Escola, esporte, curso — você confere tudo antes de entrar na agenda') + '<div class="rz-sh-b" id="cal-corpo"><p class="rz-sub">Carregando…</p></div>', { classe: 'rz-cheio' });
    const corpo = sh.querySelector('#cal-corpo');
    let recebidos = [];
    try {
        const { data } = await dbAuth.from('cofre_documentos').select('id, nome_exibicao, criado_em, origem')
            .eq('cliente_id', CLIENTE_ID_SUPABASE).eq('subtipo_codigo', 'calendario_escolar').eq('status', 'ativo').is('arquivo_descartado_em', null)
            .order('criado_em', { ascending: false }).limit(5);
        recebidos = data || [];
    } catch (_) { /* sem lista: só o botão de escolher */ }
    corpo.innerHTML = `
        <input type="file" id="cal-arq" accept="application/pdf,image/*" style="display:none">
        <button type="button" class="rz-act" id="cal-escolher"><div class="rz-ic rz-ia"><svg data-lucide="file-up"></svg></div><div>Escolher PDF ou foto do calendário<small>A Raiz IA lê as datas e separa o que é de cada pessoa</small></div></button>
        ${recebidos.length ? `<p class="rz-sub" style="margin:14px 0 6px">Já está no Cofre</p>` + recebidos.map(d => `
        <button type="button" class="rz-act" data-cal-doc="${d.id}"><div class="rz-ic"><svg data-lucide="calendar-days"></svg></div><div>${rzEsc(d.nome_exibicao || 'Calendário')}<small>${d.origem === 'bot_whatsapp' ? 'Recebido pelo WhatsApp' : 'Enviado pelo app'} · ${calData(String(d.criado_em).slice(0, 10))}</small></div></button>`).join('') : ''}
        <div id="cal-prog"></div>`;
    rzIcones();
    const ler = async (body, arquivo) => {
        corpo.querySelectorAll('.rz-act').forEach(b => b.style.display = 'none');
        const prog = window.rzProgressoLeitura ? window.rzProgressoLeitura({ alvo: corpo.querySelector('#cal-prog'), arquivo, passoIa: 1, tempoTipicoS: 25,
            passos: ['Enviando o calendário', 'Raiz IA lendo as datas', 'Separando por pessoa', 'Pronto'] }) : { passo() {}, fim() {} };
        try {
            prog.passo(1);
            const { data, error } = await dbAuth.functions.invoke('calendario-escolar-ler', { body: { cliente_id: CLIENTE_ID_SUPABASE, ...body } });
            if (error || !data?.ok) {
                let msg = data?.erro || 'Não consegui ler esse calendário.';
                try { const j = await error?.context?.json?.(); if (j?.erro) msg = j.erro; } catch (_) { /* mantém a mensagem */ }
                throw new Error(msg);
            }
            prog.passo(2); prog.fim();
            revisarCalendario(sh, data, (perfil) => ler({ documento_id: data.documento_id, perfil }, null)); // v1.10.0 — trocar o perfil
        } catch (e) {
            prog.fim();
            corpo.querySelectorAll('.rz-act').forEach(b => b.style.display = '');
            (window.rzToast || mostrarToast)(e.message || 'Falha na leitura.', { tipo: 'danger' });
        }
    };
    corpo.querySelector('#cal-escolher').addEventListener('click', () => corpo.querySelector('#cal-arq').click());
    corpo.querySelector('#cal-arq').addEventListener('change', async (ev) => {
        const f = ev.target.files?.[0]; if (!f) return;
        ler({ arquivo_base64: await arquivoParaBase64(f), mime_type: f.type || 'application/pdf', nome_arquivo: f.name }, f);
    });
    corpo.querySelectorAll('[data-cal-doc]').forEach(b => b.addEventListener('click', () => ler({ documento_id: b.dataset.calDoc }, null)));
}

function revisarCalendario(sh, r, trocarPerfil) {
    const corpo = sh.querySelector('#cal-corpo');
    const opc = r.opcoes || []; const cats = r.categorias || {};
    // v1.10.0 — aviso que a Edge sugeriu (prazo 3, jogo 1…); recolhidos com o nome do perfil
    const linhas = (r.sugestoes || []).map(s => ({ ...s, aviso: s.lembrete_dias != null ? s.lembrete_dias : (s.lembrete ? 3 : 0) })); // v1.9.2 — aviso em dias (0, 1 ou 3)
    const nomesRec = { ...CAL_RECOLHIDO, ...(CAL_RECOLHIDO_PERFIL[r.perfil] || {}) };
    const perguntas = (r.perguntas || []).filter(q => (q.opcoes || []).length);
    const respondidas = {}; const atividades = [];
    const rotGrupo = String(r.rotulos?.grupo || 'grupo').toLowerCase();
    const editando = new Set(linhas.filter(l => l.situacao === 'escolher_turma').map(l => l.id)); // v1.9.2
    const visiveis = () => linhas.filter(l => !CAL_RECOLHIDO[l.situacao]);
    const recolhidas = () => linhas.filter(l => CAL_RECOLHIDO[l.situacao]);
    // v1.10.0 — resposta do grupo: marca as linhas do time escolhido, recolhe as de outros times, guarda para gravar
    const responder = (pessoaId, grupo) => {
        respondidas[pessoaId] = grupo;
        const q = perguntas.find(x => x.pessoa_id === pessoaId);
        atividades.push({ ativo_id: pessoaId, perfil: r.perfil, organizacao: r.organizacao || r.escola || '', nivel: q?.nivel || null, grupo });
        linhas.filter(l => l.situacao === 'escolher_grupo' && l.ativo_id === pessoaId).forEach(l => {
            if (calCasaGrupo(grupo, l.grupos)) { l.situacao = 'sugerido'; l.marcado = true; l.motivo = null; }
            else { l.situacao = 'outro_grupo'; l.marcado = false; l.motivo = `Outro ${rotGrupo} (${q?.nome || ''}: ${grupo})`; }
        });
    };
    let abertos = new Set();
    // v1.9.2 — 2 linhas por compromisso; os ajustes abrem ao tocar no texto
    const linhaHtml = (l) => {
        const para = (opc.find(o => o.id === l.ativo_id) || {}).nome || l.para || '—';
        const det = [calQuando(l.data_inicio, l.data_fim), l.valor ? moeda(l.valor) : '', para, cats[l.categoria] || '', // v1.10.0 — valor logo depois da data
            l.situacao === 'escolher_turma' ? 'escolha a turma' : l.situacao === 'escolher_grupo' ? `escolha o ${rotGrupo}` : (l.aviso ? `aviso ${l.aviso} dia${l.aviso > 1 ? 's' : ''} antes` : 'sem aviso'),
            l.a_confirmar ? 'a confirmar' : '', l.motivo && CAL_RECOLHIDO[l.situacao] ? l.motivo : ''].filter(Boolean).join(' · ');
        const aberto = editando.has(l.id);
        // v1.9.4 — destaque do que já foi importado; marcado de novo, avisa que repete
        const ja = l.situacao === 'ja_na_agenda'
            ? `<span style="color:${l.marcado ? 'var(--warning,#b45309)' : 'var(--success,#2f7a55)'};font-weight:700">${l.marcado ? '⚠ Já está na agenda — vai repetir' : '✓ Já está na agenda'}</span> · ` : '';
        // v1.9.3 — ajustes em chips pequenos: Para · Tipo · Turma · A confirmar numa linha; Aviso na linha de baixo
        const CH = 'height:28px;padding:0 8px;font-size:var(--fs-sec,12.5px);gap:2px';
        const seta = '<span style="font-size:var(--fs-mini,11px);opacity:.6">▼</span>';
        const turmaAtual = l.turmas && l.situacao !== 'escolher_turma' ? l.turmas.find(t => t.data === l.data_inicio) : null;
        const turma = l.turmas
            ? `<button type="button" class="rz-chip${l.situacao === 'escolher_turma' ? ' rz-warn' : ''}" style="${CH}" data-cal-turma="${l.id}">${turmaAtual ? rzEsc(turmaAtual.turma) : 'Turma'}${seta}</button>` : '';
        const ed = aberto ? `<div style="margin:6px 0 2px 34px">
                <div style="display:flex;flex-wrap:wrap;gap:5px">
                    <button type="button" class="rz-chip" style="${CH}" data-cal-para="${l.id}"><span style="max-width:92px;overflow:hidden;text-overflow:ellipsis">${rzEsc(para)}</span>${seta}</button>
                    <button type="button" class="rz-chip" style="${CH}" data-cal-cat="${l.id}"><span style="max-width:104px;overflow:hidden;text-overflow:ellipsis">${rzEsc(cats[l.categoria] || 'Tipo')}</span>${seta}</button>
                    ${turma}
                </div>
                <div style="display:flex;flex-wrap:wrap;gap:5px;align-items:center;margin-top:6px">
                    <span class="rz-sub" style="font-size:var(--fs-sec,12.5px)">Aviso</span>
                    ${[[0, 'Sem'], [1, '1 dia'], [3, '3 dias']].map(([n, t]) => `<button type="button" class="rz-chip${l.aviso === n ? ' rz-on' : ''}" style="${CH}" data-cal-av="${l.id}" data-n="${n}">${t}</button>`).join('')}
                    <span style="width:1px;height:18px;background:var(--line);margin:0 2px"></span>
                    <button type="button" class="rz-chip${l.a_confirmar ? ' rz-on' : ''}" style="${CH}" data-cal-conf="${l.id}">A confirmar</button>
                </div>
            </div>` : '';
        return `<div class="rz-ag-op${l.marcado ? ' rz-on' : ''}" style="padding:8px 0;border-bottom:1px solid var(--line)">
            <div style="display:flex;gap:10px;align-items:flex-start">
                <button type="button" class="rz-ag-ck" data-cal-ck="${l.id}" aria-label="Importar">${l.marcado ? '<svg data-lucide="check"></svg>' : ''}</button>
                <button type="button" data-cal-ed="${l.id}" style="flex:1;min-width:0;text-align:left;background:none;border:0;padding:0;font:inherit;color:inherit">
                    <b style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${rzEsc(l.titulo)}</b>
                    <small class="rz-sub" style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${ja}${rzEsc(det)}</small>
                </button>
                <button type="button" data-cal-ed="${l.id}" aria-label="${aberto ? 'Fechar ajustes' : 'Abrir ajustes'}" style="flex:none;background:none;border:0;padding:2px 0 8px 8px;color:var(--muted)"><svg data-lucide="${aberto ? 'chevron-up' : 'chevron-down'}" style="width:16px;height:16px"></svg></button>
            </div>${ed}</div>`;
    };
    const desenhar = () => {
        const marcadas = linhas.filter(l => l.marcado && l.ativo_id);
        const grupos = Object.entries(nomesRec).map(([k, n]) => [k, n, recolhidas().filter(l => l.situacao === k)]).filter(g => g[2].length);
        const CHP = 'height:28px;padding:0 10px;font-size:var(--fs-sec,12.5px)';
        // v1.10.0 — perfil (dá para trocar) e perguntas de grupo ("Qual o time do Murilo?")
        const perfisHtml = (r.perfis || []).length ? `<div style="display:flex;flex-wrap:wrap;gap:5px;margin:0 0 8px">${r.perfis.map(p =>
            `<button type="button" class="rz-chip${p.codigo === r.perfil ? ' rz-on' : ''}" style="${CHP}" data-cal-perfil="${p.codigo}">${rzEsc(p.nome)}</button>`).join('')}</div>` : '';
        const pergHtml = perguntas.filter(q => !respondidas[q.pessoa_id]).map(q => `<div class="rz-card" style="padding:10px 12px;margin:0 0 8px">
            <b style="display:block;margin-bottom:6px">Qual o ${rzEsc(String(q.rotulo || 'grupo').toLowerCase())} de ${rzEsc(q.nome)}?${q.nivel ? ` <small class="rz-sub">(${rzEsc(q.nivel)})</small>` : ''}</b>
            <div style="display:flex;flex-wrap:wrap;gap:5px">${q.opcoes.map(o => `<button type="button" class="rz-chip" style="${CHP}" data-cal-gr="${q.pessoa_id}" data-v="${rzEsc(o)}">${rzEsc(o)}</button>`).join('')}</div>
            <small class="rz-sub" style="display:block;margin-top:6px">Fica gravado no cadastro de ${rzEsc(q.nome)} para as próximas importações.</small></div>`).join('');
        corpo.innerHTML = `
            ${perfisHtml}
            <p class="rz-sub" style="margin:0 0 6px">${rzEsc(r.escola || 'Escola')}${r.periodo ? ' · ' + rzEsc(r.periodo) : ''} — ${visiveis().length} sugeridos, ${recolhidas().length} recolhidos</p>
            ${pergHtml}
            ${(r.avisos || []).map(a => `<p class="rz-sub" style="color:var(--danger);margin:0 0 6px">${rzEsc(a)}</p>`).join('')}
            ${visiveis().map(linhaHtml).join('') || '<p class="rz-sub">Nada para a família neste calendário.</p>'}
            ${grupos.map(([k, n, ls]) => `<button type="button" class="rz-row rz-link" data-cal-grupo="${k}" style="margin-top:10px"><div class="rz-tx"><b>${n} (${ls.length})</b></div><span class="rz-sub">${abertos.has(k) ? 'esconder' : 'ver'}</span></button>
                ${abertos.has(k) ? ls.map(linhaHtml).join('') : ''}`).join('')}
            <button type="button" class="rz-btn rz-btn-1 rz-ag-bt" id="cal-aplicar"${marcadas.length ? '' : ' disabled'}>${marcadas.length ? `Importar ${marcadas.length} para a agenda` : 'Marque ao menos uma linha'}</button>
            <button type="button" class="rz-btn rz-ag-bt" id="cal-cancelar">Cancelar</button>`;
        rzIcones(); ligar();
    };
    const acha = (id) => linhas.find(l => l.id === id);
    const ligar = () => {
        corpo.querySelectorAll('[data-cal-ck]').forEach(b => b.addEventListener('click', () => { const l = acha(b.dataset.calCk); l.marcado = !l.marcado; desenhar(); }));
        corpo.querySelectorAll('[data-cal-av]').forEach(b => b.addEventListener('click', () => { const l = acha(b.dataset.calAv); l.aviso = Number(b.dataset.n); desenhar(); })); // v1.9.2
        corpo.querySelectorAll('[data-cal-ed]').forEach(b => b.addEventListener('click', () => { const id = b.dataset.calEd; editando.has(id) ? editando.delete(id) : editando.add(id); desenhar(); }));
        corpo.querySelectorAll('[data-cal-conf]').forEach(b => b.addEventListener('click', () => { const l = acha(b.dataset.calConf); l.a_confirmar = !l.a_confirmar; desenhar(); }));
        // v1.9.3 — escolha por lista (rzEscolher, empilhada sobre a cortina) no lugar do <select>
        corpo.querySelectorAll('[data-cal-para]').forEach(b => b.addEventListener('click', async () => {
            const l = acha(b.dataset.calPara);
            const v = await calEscolher({ titulo: 'Para quem', opcoes: opc.map(o => ({ titulo: o.nome, sub: o.completo && o.completo !== o.nome ? o.completo : '', icone: 'user', valor: o.id })) });
            if (v) { l.ativo_id = v; desenhar(); }
        }));
        corpo.querySelectorAll('[data-cal-cat]').forEach(b => b.addEventListener('click', async () => {
            const l = acha(b.dataset.calCat);
            const v = await calEscolher({ titulo: 'Tipo', opcoes: Object.entries(cats).map(([k, n]) => ({ titulo: n, icone: k === l.categoria ? 'check' : 'tag', valor: k })) });
            if (v) { l.categoria = v; desenhar(); }
        }));
        corpo.querySelectorAll('[data-cal-turma]').forEach(b => b.addEventListener('click', async () => {
            const l = acha(b.dataset.calTurma);
            const v = await calEscolher({ titulo: 'Turma', sub: l.titulo, opcoes: l.turmas.map(t => ({ titulo: t.turma, sub: calQuando(t.data, t.data), icone: 'users', valor: t.data })) });
            if (!v) return;
            l.data_inicio = v; l.data_fim = v; l.marcado = true; if (l.situacao === 'escolher_turma') l.situacao = 'sugerido'; desenhar();
        }));
        corpo.querySelectorAll('[data-cal-grupo]').forEach(b => b.addEventListener('click', () => { const k = b.dataset.calGrupo; abertos.has(k) ? abertos.delete(k) : abertos.add(k); desenhar(); }));
        corpo.querySelectorAll('[data-cal-gr]').forEach(b => b.addEventListener('click', () => { responder(b.dataset.calGr, b.dataset.v); desenhar(); })); // v1.10.0
        corpo.querySelectorAll('[data-cal-perfil]').forEach(b => b.addEventListener('click', () => { // v1.10.0
            if (b.dataset.calPerfil === r.perfil || typeof trocarPerfil !== 'function') return;
            corpo.innerHTML = '<div id="cal-prog"></div>'; trocarPerfil(b.dataset.calPerfil);
        }));
        corpo.querySelector('#cal-cancelar').addEventListener('click', () => fecharSheet(true));
        corpo.querySelector('#cal-aplicar').addEventListener('click', aplicar);
    };
    const aplicar = async () => {
        const marcadas = linhas.filter(l => l.marcado && l.ativo_id);
        if (!marcadas.length) return;
        const bt = corpo.querySelector('#cal-aplicar'); bt.disabled = true; bt.textContent = 'Importando…';
        // v1.12.0 — opção de grupo ("Tomás e Murilo") vira a lista de pessoas; o título vai sem os nomes (D4)
        const individuais = opc.filter(o => !/ e /.test(o.nome || ''));
        const pessoasDe = (id) => {
            const o = opc.find(x => x.id === id); if (!o || !/ e /.test(o.nome || '')) return null;
            const ids = String(o.nome).split(/\s*(?:,| e )\s*/).map(n => (individuais.find(x => CAL_NORM(x.nome) === CAL_NORM(n)) || {}).id);
            return ids.length > 1 && ids.every(Boolean) ? ids : null;
        };
        const payload = marcadas.map(l => {
            return { titulo: l.titulo, data_inicio: l.data_inicio, data_fim: l.data_fim || l.data_inicio,
                ativo_id: l.ativo_id, pessoas: pessoasDe(l.ativo_id), lembrete: l.aviso > 0, lembrete_dias: l.aviso, a_confirmar: !!l.a_confirmar, // v1.9.2
                perfil: r.perfil || 'escola', valor: l.valor || null, repeticao_dias: l.aviso === 3 ? (l.repeticao_dias || 0) : 0, // v1.10.0
                descricao: [cats[l.categoria] || '', l.descricao || ''].filter(Boolean).join(' · ') || null,
                origem_chave: calChave(r.escola || 'Escola', l.ativo_id, l.data_inicio, l.titulo_chave) };
        });
        atividades.forEach((a, i) => { if (payload[i]) payload[i].atividade = a; }); // v1.10.0 — o time escolhido vai para o cadastro da pessoa
        const { data, error } = await dbAuth.rpc('fn_calendario_escolar_aplicar', { p_cliente_id: CLIENTE_ID_SUPABASE, p_documento_id: r.documento_id || null, p_linhas: payload });
        if (error) { bt.disabled = false; bt.textContent = `Importar ${marcadas.length} para a agenda`; (window.rzToast || mostrarToast)(error.message, { tipo: 'danger' }); return; }
        fecharSheet(true);
        (window.rzToast || mostrarToast)(data?.mensagem || 'Calendário importado.', { tipo: 'success' });
        if (st.el && st.mes) carregar(); // a Agenda aberta redesenha com o que entrou
    };
    desenhar();
}

// ---- v1.12.0 (0e70b85a) — NOVO COMPROMISSO (⋮ da Agenda e Raiz IA). Um item só, com as pessoas em `vinculos`
// (fn_agenda_compromisso_criar). Sem valor: aviso 1 dia; com valor: 3 dias e de novo 1 dia (vira despesa prevista).
const COMP_TIPOS = [['generico', 'Compromisso'], ['esporte', 'Esporte'], ['escola', 'Escola'], ['atividade', 'Curso'], ['festa', 'Festa'], ['viagem', 'Viagem'], ['manutencao', 'Manutenção']];
// "Vincular a": pessoas da família (sem o grupo) e os bens ativos, na ordem da natureza do pedido (imóvel, veículo ou pessoa)
async function alvosVincular(natureza) {
    const { data } = await dbAuth.from('cofre_ativos').select('id, nome_exibicao, ativo_principal_id, tipo_ativo')
        .eq('cliente_id', CLIENTE_ID_SUPABASE).eq('status', 'ativo').limit(200);
    const lista = data || [];
    const principais = new Set(lista.filter(a => a.tipo_ativo === 'vida').map(a => a.ativo_principal_id).filter(Boolean));
    const ordem = (t) => {
        const imo = /^imovel/.test(t), vei = t === 'veiculo', pes = t === 'vida';
        if (natureza === 'imovel') return imo ? 0 : pes ? 1 : vei ? 3 : 2;
        if (natureza === 'veiculo') return vei ? 0 : pes ? 1 : imo ? 3 : 2;
        return pes ? 0 : imo ? 1 : vei ? 2 : 3;
    };
    return lista.filter(a => !(a.tipo_ativo === 'vida' && principais.has(a.id)))
        .map(a => ({ id: a.id, tipo: a.tipo_ativo, completo: a.nome_exibicao,
            nome: a.tipo_ativo === 'vida' ? String(a.nome_exibicao || '').split(/\s+/)[0] : String(a.nome_exibicao || '') }))
        .sort((x, y) => ordem(x.tipo) - ordem(y.tipo) || x.nome.localeCompare(y.nome));
}
async function pessoasDaFamilia() {
    const { data } = await dbAuth.from('cofre_ativos').select('id, nome_exibicao, ativo_principal_id')
        .eq('cliente_id', CLIENTE_ID_SUPABASE).eq('tipo_ativo', 'vida').eq('status', 'ativo').limit(60);
    const lista = data || [];
    const principais = new Set(lista.map(a => a.ativo_principal_id).filter(Boolean));
    return lista.filter(a => !principais.has(a.id)).map(a => ({ id: a.id, nome: String(a.nome_exibicao || '').split(/\s+/)[0], completo: a.nome_exibicao }))
        .sort((x, y) => x.nome.localeCompare(y.nome));
}
export async function abrirNovoCompromisso(pref = {}) {
    const sh = abrirSheet(rzSheetCabecalho('Novo compromisso', 'Entra na agenda de cada pessoa escolhida') + '<div class="rz-sh-b" id="cp-corpo"><p class="rz-sub">Carregando…</p></div>');
    const corpo = sh.querySelector('#cp-corpo');
    let pessoas = [];
    try { pessoas = await alvosVincular(pref.natureza); } catch (_) { /* sem lista: o aviso abaixo explica */ }
    const c = { titulo: pref.titulo || '', data: pref.data || '', hora: pref.hora || '', valor: pref.valor || null, local: pref.local || '',
        tipo: COMP_TIPOS.some(t => t[0] === pref.tipo) ? pref.tipo : 'generico', pessoas: new Set((pref.pessoas || []).filter(id => pessoas.some(p => p.id === id))),
        aviso: pref.aviso_dias != null ? pref.aviso_dias : (pref.valor ? 3 : 1),
        precisao: ['mes', 'ano'].includes(pref.data_precisao) && pref.data ? pref.data_precisao : 'dia' };
    // data dita só com o mês ou só com o ano: Início · Fim · Mesmo dia de hoje
    const opcoesVagas = () => {
        if (c.precisao === 'dia' || !c.data) return [];
        const a = Number(c.data.slice(0, 4)), m = Number(c.data.slice(5, 7)), h = new Date();
        const ult = (aa, mm) => new Date(aa, mm, 0).getDate();
        const d = (aa, mm, dd) => `${aa}-${String(mm).padStart(2, '0')}-${String(Math.min(dd, ult(aa, mm))).padStart(2, '0')}`;
        return c.precisao === 'ano'
            ? [['Início', d(a, 1, 1)], ['Fim do ano', d(a, 12, 31)], ['Mesmo dia de hoje', d(a, h.getMonth() + 1, h.getDate())]]
            : [['Início', d(a, m, 1)], ['Fim do mês', d(a, m, 31)], ['Mesmo dia de hoje', d(a, m, h.getDate())]];
    };
    const CH = 'height:32px;padding:0 11px;font-size:var(--fs-sec,12.5px)';
    const campo = 'width:100%;box-sizing:border-box;height:42px;border:1px solid var(--line);border-radius:10px;padding:0 12px;font:inherit;font-size:16px;background:#fff;color:var(--ink)';
    const rot = (t) => `<small class="rz-sub" style="display:block;margin:12px 0 5px">${t}</small>`;
    const diaSem = () => c.data ? `${calDiaSem(c.data)} ${calData(c.data)}/${c.data.slice(0, 4)}` : '';
    const desenhar = () => {
        const ok = c.titulo.trim() && c.data && c.pessoas.size;
        corpo.innerHTML = `
            ${rot('O quê')}<input id="cp-tit" style="${campo}" maxlength="140" placeholder="Ex.: exame de faixa de jiu-jitsu" value="${rzEsc(c.titulo)}">
            ${rot('Quando' + (c.data ? ` · <b>${diaSem()}</b>` : ''))}
            <div style="display:flex;gap:8px"><input id="cp-data" type="date" style="${campo};flex:1.4" value="${c.data}"><input id="cp-hora" type="time" style="${campo};flex:1" value="${c.hora}"></div>
            ${opcoesVagas().length ? `<small class="rz-sub" style="display:block;margin:8px 0 5px">Você disse só ${c.precisao === 'ano' ? 'o ano' : 'o mês'}. Quando?</small><div style="display:flex;flex-wrap:wrap;gap:6px">${opcoesVagas().map(([t, d]) =>
                `<button type="button" class="rz-chip" style="${CH}" data-cp-d="${d}">${t} · ${calData(d)}</button>`).join('')}</div>` : ''}
            ${rot('Vincular a')}<div style="display:flex;flex-wrap:wrap;gap:6px">${pessoas.length ? pessoas.map(p =>
                `<button type="button" class="rz-chip${c.pessoas.has(p.id) ? ' rz-on' : ''}" style="${CH}" data-cp-p="${p.id}">${rzEsc(p.nome)}</button>`).join('')
                + (pessoas.filter(p => p.tipo === 'vida').length > 1 ? `<button type="button" class="rz-chip" style="${CH}" data-cp-todos>${pessoas.filter(p => p.tipo === 'vida').every(p => c.pessoas.has(p.id)) ? 'Nenhuma pessoa' : 'Todas as pessoas'}</button>` : '')
                : '<span class="rz-sub">Cadastre pessoas em Família ou bens em Patrimônio para escolher aqui.</span>'}</div>
            ${rot('Tipo')}<div style="display:flex;flex-wrap:wrap;gap:6px">${COMP_TIPOS.map(([k, n]) => `<button type="button" class="rz-chip${c.tipo === k ? ' rz-on' : ''}" style="${CH}" data-cp-t="${k}">${n}</button>`).join('')}</div>
            ${rot('Aviso')}<div style="display:flex;flex-wrap:wrap;gap:6px">${[[0, 'Sem'], [1, '1 dia antes'], [3, c.valor ? '3 e 1 dia antes' : '3 dias antes']].map(([n, t]) =>
                `<button type="button" class="rz-chip${c.aviso === n ? ' rz-on' : ''}" style="${CH}" data-cp-a="${n}">${t}</button>`).join('')}</div>
            <div style="display:flex;gap:8px">
                <div style="flex:1">${rot('Valor (opcional)')}<input id="cp-valor" inputmode="decimal" style="${campo}" placeholder="R$ 0,00" value="${c.valor ? String(c.valor).replace('.', ',') : ''}"></div>
                <div style="flex:1.4">${rot('Local (opcional)')}<input id="cp-local" style="${campo}" maxlength="120" value="${rzEsc(c.local)}"></div>
            </div>
            ${c.valor ? '<small class="rz-sub" style="display:block;margin-top:6px">O valor entra como despesa prevista no Financeiro.</small>' : ''}
            <button type="button" class="rz-btn rz-btn-1 rz-ag-bt" id="cp-salvar"${ok ? '' : ' disabled'} style="margin-top:16px">${ok ? 'Salvar na agenda' : !c.titulo.trim() ? 'Diga o que é' : !c.data ? 'Escolha a data' : 'Escolha a que vincular'}</button>
            <button type="button" class="rz-btn rz-ag-bt" id="cp-cancelar">Cancelar</button>`;
        ligar();
    };
    const ler = () => {
        c.titulo = corpo.querySelector('#cp-tit').value; c.data = corpo.querySelector('#cp-data').value; c.hora = corpo.querySelector('#cp-hora').value;
        c.local = corpo.querySelector('#cp-local').value;
        const v = Number(String(corpo.querySelector('#cp-valor').value || '').replace(/[^0-9,.-]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.'));
        c.valor = isFinite(v) && v > 0 ? Math.round(v * 100) / 100 : null;
    };
    const redesenhar = () => { ler(); desenhar(); };
    const ligar = () => {
        ['#cp-tit', '#cp-local'].forEach(q => corpo.querySelector(q).addEventListener('change', redesenhar));
        corpo.querySelector('#cp-tit').addEventListener('input', () => { const b = corpo.querySelector('#cp-salvar'); ler(); b.disabled = !(c.titulo.trim() && c.data && c.pessoas.size); });
        corpo.querySelector('#cp-data').addEventListener('change', () => { c.precisao = 'dia'; redesenhar(); });
        ['#cp-hora', '#cp-valor'].forEach(q => corpo.querySelector(q).addEventListener('change', redesenhar));
        corpo.querySelectorAll('[data-cp-p]').forEach(b => b.addEventListener('click', () => { ler(); const id = b.dataset.cpP; c.pessoas.has(id) ? c.pessoas.delete(id) : c.pessoas.add(id); desenhar(); }));
        const todos = corpo.querySelector('[data-cp-todos]');
        if (todos) todos.addEventListener('click', () => {
            ler(); const vidas = pessoas.filter(p => p.tipo === 'vida').map(p => p.id);
            const todas = vidas.every(id => c.pessoas.has(id)); vidas.forEach(id => todas ? c.pessoas.delete(id) : c.pessoas.add(id)); desenhar();
        });
        corpo.querySelectorAll('[data-cp-d]').forEach(b => b.addEventListener('click', () => { ler(); c.data = b.dataset.cpD; c.precisao = 'dia'; desenhar(); }));
        corpo.querySelectorAll('[data-cp-t]').forEach(b => b.addEventListener('click', () => { ler(); c.tipo = b.dataset.cpT; desenhar(); }));
        corpo.querySelectorAll('[data-cp-a]').forEach(b => b.addEventListener('click', () => { ler(); c.aviso = Number(b.dataset.cpA); desenhar(); }));
        corpo.querySelector('#cp-cancelar').addEventListener('click', () => { fecharSheet(true); if (typeof pref.aoCancelar === 'function') pref.aoCancelar(); });
        corpo.querySelector('#cp-salvar').addEventListener('click', salvar);
    };
    const salvar = async () => {
        ler();
        const bt = corpo.querySelector('#cp-salvar'); bt.disabled = true; bt.textContent = 'Salvando…';
        const ordem = pessoas.filter(p => c.pessoas.has(p.id)).map(p => p.id);
        const { data, error } = await dbAuth.rpc('fn_agenda_compromisso_criar', { p_cliente_id: CLIENTE_ID_SUPABASE, p_canal: 'app', p_compromisso: {
            titulo: c.titulo.trim(), data: c.data, hora: c.hora || null, valor: c.valor, local: c.local.trim() || null, tipo: c.tipo,
            aviso_dias: c.aviso, pessoas: ordem } });
        if (error) { (window.rzToast || mostrarToast)(error.message, { tipo: 'danger' }); desenhar(); return; }
        fecharSheet(true);
        (window.rzToast || mostrarToast)(data?.ja_existia ? 'Este compromisso já estava na agenda.' : `Na agenda: ${diaSem()}${data?.pessoas ? ' · ' + data.pessoas : ''}`, { tipo: 'success' });
        if (st.el && st.el.isConnected && st.mes) carregar();
        if (typeof pref.aoSalvar === 'function') { try { await pref.aoSalvar(data, ordem); } catch (e) { console.warn('[agenda] aoSalvar:', e?.message || e); } } // v1.20.0
    };
    desenhar(); rzIcones();
}

// v1.12.0 — a Raiz IA (index) despacha aqui: compromisso (cortina preenchida), agenda (abre o período falado), calendário.
export function rzIaAgenda(ac, texto) {
    const p = (ac && ac.parametros) || {};
    if (ac.intencao === 'calendario') return abrirImportarCalendario();
    if (ac.intencao === 'compromisso') {
        if ((p.pessoas_nao_achadas || []).length) (window.rzToast || mostrarToast)(`Não achei: ${p.pessoas_nao_achadas.join(', ')} — escolha abaixo.`, { tipo: 'info' });
        return abrirNovoCompromisso({ titulo: p.descricao || texto || '', data: p.data || '', hora: p.hora || '', valor: p.valor || null, local: p.local || '',
            tipo: p.tipo_compromisso || 'generico', aviso_dias: p.aviso_dias, pessoas: p.pessoas_ids || [],
            natureza: p.natureza || null, data_precisao: p.data_precisao || 'dia' });
    }
    // agenda: abre a Agenda no período falado (Semana até 7 dias; senão o Mês)
    const de = p.data ? deIso(p.data) : hoje();
    const dias = p.data && p.data_fim ? Math.round((deIso(p.data_fim) - deIso(p.data)) / 864e5) : 7;
    st.vista = dias <= 7 ? 'semana' : 'mes';
    st.mes = new Date(de.getFullYear(), de.getMonth(), 1); st.semana = inicioSemana(de); st.dia = iso(de);
    if (typeof window.irParaAbaRodape === 'function') window.irParaAbaRodape('tab-alertas'); else if (typeof switchTab === 'function') switchTab('tab-alertas');
    if ((p.pessoas || []).length) (window.rzToast || mostrarToast)(`Agenda de ${p.pessoas.join(', ')}`, { tipo: 'info' });
}
