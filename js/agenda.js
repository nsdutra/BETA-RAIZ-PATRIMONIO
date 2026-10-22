// =====================================================================
// RAIZ PATRIMÔNIO — js/agenda.js
// VERSÃO: Beta v1.12.0 (22/10/2026 — demanda 0e70b85a)
// LINHAS: (ver versoes.json)
// -----------------------------------------------------------------
// NOVIDADES (Beta v1.12.0) (22/10/2026, sessão 20261022-1155-vinculos-compromisso, demanda 0e70b85a; FICHA_RAIZ_IA_COMPROMISSO_RAIZ
//   v1.2.0, de acordo do Nicola 22/10 11:55) — NOVO COMPROMISSO: cortina "Novo compromisso" (o quê, data com dia da semana,
//   hora, para quem em chips — várias pessoas —, tipo, aviso Sem · 1 dia · 3 dias, valor e local), aberta pelo ⋮ da Agenda e
//   pela Raiz IA ("agende o exame de faixa do Murilo dia 14/11" chega preenchida). Grava fn_agenda_compromisso_criar: UM item,
//   as pessoas em `vinculos`. rzIaAgenda(): a Raiz IA despacha aqui compromisso, agenda (abre o período falado) e calendário.
//   Importar calendário: a linha para "Tomás e Murilo" manda as pessoas (fn_calendario_escolar_aplicar v4) e o título vai sem
//   os nomes (D4).
// Versão anterior (Beta v1.11.0):
// NOVIDADES (Beta v1.11.0) (21/10/2026, sessão 20261021-1735-ux-onda4, demanda 15146a34; Nicola 21/10 17:31: "ícones
//   estranhos na agenda") — o item de controle saía sempre com a chave inglesa (ícone do tipo "Ocorrência"), fosse cartão,
//   condomínio, obra ou inscrição. Agora usa o ícone do próprio item, o mesmo de Controles: o do subtipo, senão o do tipo
//   no catálogo (controle_tipos), senão a prancheta. Vale para o compromisso e para o alerta do Motor ligado a um item.
//   Uma leitura por período (ids do período), sem mudança no banco.
// Versão anterior (Beta v1.10.0):
// NOVIDADES (Beta v1.10.0) (21/10/2026, sessão 20261021-1342-calendario-generico, demanda 6f9e5b7d;
//   FICHA_CALENDARIO_GENERICO_RAIZ v1.1.0, D1–D3 ok do Nicola 21/10 13:08 e 13:42) — IMPORTAR CALENDÁRIO GENÉRICO. ⋮ da Agenda
//   › "Importar calendário" (escola, esporte, curso). No topo da revisão, o perfil lido (Escola · Esporte · Curso · Genérico),
//   que dá para trocar — a Edge refaz só a regra, sem ler de novo. Tipos do perfil (esporte: jogo, treino, torneio…).
//   Jogo com times: "Qual o time do Murilo?" com os times lidos como chips; a resposta marca os jogos dele, recolhe os de
//   outros times ("Outros times") e fica gravada nas Atividades da pessoa para a próxima vez. Prazo com valor (inscrição)
//   mostra o valor e vai com aviso 3 dias + repetição 2 (3 e 1 dia antes). Na agenda: troféu para "Esporte · ", paleta para
//   "Atividade · ".
// Versão anterior (Beta v1.9.4):
// NOVIDADES (Beta v1.9.4) (20/10/2026, sessão 20261020-2149-calendario-ja, demanda b3aeefaf; Nicola 21:49 "não vi
//   nenhuma menção de já está na agenda. Destaque… ao clicar na setinha pra abrir a cortina não funciona") — linha já
//   importada ganha o selo verde "✓ Já está na agenda" na 2ª linha (marcada de novo, vira aviso "vai repetir"); a seta
//   também abre e fecha os ajustes; a chave de origem não leva mais o nome da escola (igual à Edge, sugestoes.ts 1.1.0).
// Versão anterior (Beta v1.9.3):
// NOVIDADES (Beta v1.9.3) (20/10/2026, sessão 20261020-2117-calendario-lista, demanda b3aeefaf; Nicola 21:17 "os
//   componentes ao abrir a cortina ficam grandes. Murilo e Tomás · Evento na escola pode ficar numa linha só menor. A sala
//   também… e a confirmar. Abaixo as opções de alerta") — os ajustes da linha viram chips pequenos: 1ª linha Para quem ·
//   Tipo · Turma (tocar abre a lista de escolha por cima, sem campo de seleção grande); 2ª linha Aviso: Sem · 1 dia ·
//   3 dias | A confirmar (não coube na 1ª linha num celular de 400 px quando há turma).
// Versão anterior (Beta v1.9.2):
// NOVIDADES (Beta v1.9.2) (20/10/2026, sessão 20261020-1943-calendario-rapido, demanda b3aeefaf; Nicola 19:43 após a 1ª
//   importação real: "lista quebrada e grande… cada compromisso em no máximo 2 linhas · avisar 1 dia antes ou 3 dias · mostre
//   a data, ano e dia da semana") — a revisão do calendário fica em 2 linhas por compromisso: (1) marcar + título; (2) dia da
//   semana, data com ano, para quem, tipo e aviso. Tocar no texto abre os ajustes (filho, tipo, turma, Aviso: sem · 1 dia ·
//   3 dias, A confirmar); linha com data por turma já abre pedindo a turma. Envia lembrete_dias (fn_calendario_escolar_aplicar v2).
// Versão anterior (Beta v1.9.1):
// NOVIDADES (Beta v1.9.1) (20/10/2026, sessão 20261020-1926-importar-ajustes, demanda b3aeefaf; achado do Nicola 19:26 "ainda
//   sem aparecer o menu 3 pontos na agenda") — CORRIGIDO: o ⋮ da Agenda usava a classe rz-fin-lupa, que o index esconde em todo
//   o #main-content desde que a busca subiu para o topo — o botão existia, mas nunca aparecia (nem "Enviar a semana"). Ganha
//   classe própria (rz-ag-mais) com o mesmo visual.
// Versão anterior (Beta v1.9.0):
// NOVIDADES (Beta v1.9.0) (20/10/2026, sessão 20261020-1900-calendario-escolar, demanda b3aeefaf; FICHA_FAMILIA_CALENDARIO_E_FERIADOS_RAIZ v1.0.0, E3, de acordo do Nicola 20/10 18:34) — IMPORTAR
//   CALENDÁRIO ESCOLAR: ⋮ da Agenda › "Importar calendário escolar". Tela única: escolhe o PDF/foto (ou o que chegou pelo
//   WhatsApp e está no Cofre); a Edge calendario-escolar-ler sugere cada linha (filho pela série, lembrete de 3 dias em prova,
//   reunião e passeio, "a confirmar" em recuperação, optativa e reforço longo); outras séries, datas passadas e feriados já na
//   agenda ficam recolhidos. Marca/desmarca, troca tipo e filho, "Importar N" grava (fn_calendario_escolar_aplicar) e fecha.
//   Itens da escola ganham o ícone de mochila na Agenda.
// Versão anterior (Beta v1.8.0):
// NOVIDADES (Beta v1.8.0) (20/10/2026, sessão 20261020-1834-feriados, demanda bf1c1ba7; FICHA_FAMILIA_CALENDARIO_E_FERIADOS_RAIZ v1.0.0, de acordo do Nicola 20/10 18:34) — FERIADOS: a Agenda
//   traz o tipo 'feriado' de fn_agenda_periodo (rotina Feriados ligada em Minha empresa › Rotinas e alertas; nacionais e os das
//   UFs/cidades dos imóveis). Ícone party-popper, assunto novo "Feriados" no filtro, sempre Informativo (não pede ação) e o
//   toque mostra o feriado e a abrangência num aviso — não há tela para abrir.
// Versão anterior (Beta v1.7.0):
// NOVIDADES (Beta v1.7.0) — Nicola 19/10 12:16 (dem 9404081c, item 42; sessão 20261019-1250-carga-silva-patrimonio): a Agenda
//   abre no Mês e as abas ficam Mês · Semana · Alertas. A escolha da pessoa vale enquanto o app estiver aberto.
// Versão anterior (Beta v1.6.0):
// NOVIDADES (Beta v1.6.0) — Nicola 19/10 11:19 (dem 9404081c, itens 35 e 36; sessão 20261019-1125-carga-silva-ajustes):
//   — volta a lista de alertas de antes como a vista "Alertas", ao lado de Semana e Mês: é o bloco #agenda-lista do index
//     (busca, severidade, linhas e gestos de sempre, montarAlertasPatrimonio), mostrado logo abaixo das abas;
//   — na Semana, arrastar a faixa dos dias para os lados troca a semana; no Mês, arrastar a grade para cima/baixo troca o mês
//     (para cima = próximo). As setas ‹ › continuam.
// Versão anterior (Beta v1.5.0):
// NOVIDADES (Beta v1.5.0) — usos fatia 7 (FICHA_FATIA7_MEMBROS_RAIZ v1.2.0 §2A, de acordo do Nicola 16/10 00:05): entra o que
//   o relógio prevê para os animais (fn_agenda_periodo, tipo 'membro': parto previsto, diagnóstico, secagem, desmame), no
//   assunto Ativos; o toque abre a ficha do animal (cofre-membros.js). Sessão 20261016-0020-usos-fatia7.
// Versão anterior (Beta v1.4.0):
// NOVIDADES (Beta v1.4.0) — Nicola 14/10 21:26 ("a visão de lista prefiro eliminar ela. Pode retirar e deixar apenas
//   semana e mês"): a vista Lista sai; a Agenda abre na Semana (com a lista do dia embaixo) e tem só Semana · Mês. A
//   ação do ⋮ vira "Enviar a semana" (estudo D6, ação até 24 caracteres; a descrição continua dizendo o WhatsApp).
//   Sessão 20261014-2130-ajustes-9b.
// Versão anterior (Beta v1.3.0):
// NOVIDADES (Beta v1.3.0) — Nicola 14/10 09:50: as datas se vinculam ao FATO GERADOR, não a hoje. O alerta e o
//   compromisso pendentes ficam no dia de origem (ex.: o fechamento de 01/10 aparece em 01/10 com "Há 13d"), nas três
//   vistas. A Lista do mês de hoje mostra o mês inteiro por dia e, antes dele, o que ainda está pendente de meses
//   anteriores. O compromisso atrasado ganha o mesmo selo "Há Nd" das linhas de alerta. Sessão 20261014-0955-agenda-datas.
// Versão anterior (Beta v1.2.0):
// NOVIDADES (Beta v1.2.0) — teste do Nicola 14/10 08:58 ("as quantidades parecem estranhas (...) no grid da semana não
//   aparece nenhum compromisso, mas no grid do dia aparece. No mês também não está batendo (...) no filtro por tipo o
//   ideal seria abrir todo marcado"). Sessão 20261014-0900-agenda-contas.
//   — UM universo só (universo()) para linhas, números dos chips, pontos da grade e resumo da semana: o que se conta é
//     exatamente o que se vê. Antes os chips contavam compromissos escondidos pela regra de não repetir e as bordas da
//     grade, e a Semana/Mês não tinham os alertas.
//   — Alertas também na Semana e no Mês, no dia em que vencem (hoje + dias; rotina pronta e extrato ficam em hoje). Na
//     Lista, o que já venceu entra em hoje. Linha, gestos e regras do alerta continuam os de sempre.
//   — Status do alerta no filtro = o que a linha mostra: vencido (vermelho) conta como crítico; os demais pela
//     severidade dele. Nenhuma regra de alerta muda.
//   — Assunto abre com todos marcados; desmarca o que não quer ver ("Marcar todos" / "Desmarcar todos").
// Versão anterior (Beta v1.1.0):
// NOVIDADES (Beta v1.1.0) — revisão das três vistas, FICHA_ONDA_7_AGENDA_RAIZ v1.2.0 §7–§8 (D7.7 a D7.13; Nicola 14/10
//   00:51: "Gostei. Faria só 2 ajustes (...) Restante ok. Não mexer nas regras de alerta atuais"). Sessão
//   20261014-0055-agenda-vistas. O módulo passa a desenhar a Agenda inteira:
//   — Topo no padrão do Financeiro (D7.7): linha 1 = período como título (‹ outubro 2026 › / ‹ 12–18 out ›) e ⋮;
//     linha 2 = vistas Lista · Semana · Mês (abas sublinhadas); linha 3 = filtros.
//   — Filtros (D7.11): status (● Crítico · ● Atenção · ● Informativo, múltipla escolha) e o chip "Assunto ▾", que abre a
//     escolha múltipla (Ativos · Itens de controle · Contratos e usos · Ocorrências · Financeiro · Documentos). Valem nas
//     três vistas.
//   — Lista (D7.8 ajustada): lista corrente por dia, sem "Precisa de você". No mês atual começa em hoje: os alertas de
//     hoje (mesma linha, gestos e regras de sempre — linhaAlertaHtml/rzLigarGestosAlertas do index) e os compromissos
//     do dia; depois os próximos dias com algo. O compromisso que um alerta já mostra (mesma entidade, até 7 dias) não
//     se repete.
//   — Semana (D7.9): faixa de 7 dias com pontos de status + resumo + a lista do dia escolhido; abre em hoje.
//   — Mês: grade com pontos por status (antes por tipo) + a lista do dia.
//   — Status do compromisso (D7.10): atrasado = crítico; vence em até 7 dias = atenção; o resto = informativo. Calculado
//     aqui, no app (a troca do retorno da fn_agenda_periodo foi barrada duas vezes na confirmação do banco; nenhuma
//     regra de alerta muda — os alertas usam a severidade que já têm em alerta_tipos).
//   — Dia por hora (D7.13): a lista do dia separa "Dia todo" e os horários (r.hora) e marca o realizado (r.situacao);
//     hoje nada tem hora — fica pronto para o registro do dia (6b).
// Versão anterior (Beta v1.0.0):
// NOVIDADES (Beta v1.0.0) — onda 7a/7b (D14), FICHA_ONDA_7_AGENDA_RAIZ v1.0.0 aprovada pelo Nicola 14/10 00:09.
//   Semana e Mês lendo fn_agenda_periodo; chips de tipo; toque abre o lugar; ⋮ "Enviar a semana por WhatsApp".
// =====================================================================
// Depende de globais do index.html: dbAuth, CLIENTE_ID_SUPABASE, geralRamoFiltro, alertasVisiveisTodos,
// agruparEMapearAlertas, linhaAlertaHtml, rzOrdemAlertas, rzLigarGestosAlertas, rzEsc, rzIcones, rzSkeleton,
// formatarMoedaBR, abrirSheet, abrirSheetAcoes, rzSheetCabecalho, fecharSheet, abrirAlertaItemControle,
// abrirFichaContrato, switchTab, mostrarToast, rzDev.

export const VERSAO = '1.12.0';

const TIPOS = {
    ocorrencia:   { rotulo: 'Ocorrência',  icone: 'wrench',          dominio: 'ocorrencias' },
    recebimento:  { rotulo: 'Recebimento', icone: 'arrow-down-left', dominio: 'financeiro' },
    pagamento:    { rotulo: 'Pagamento',   icone: 'arrow-up-right',  dominio: 'financeiro' },
    contrato_fim: { rotulo: 'Contrato',    icone: 'file-x',          dominio: 'contratos' },
    reajuste:     { rotulo: 'Reajuste',    icone: 'trending-up',     dominio: 'contratos' },
    documento:    { rotulo: 'Documento',   icone: 'file-clock',      dominio: 'documentos' },
    membro:       { rotulo: 'Rebanho',     icone: 'beef',            dominio: 'ativos' }, // v1.5.0 (fatia 7)
    feriado:      { rotulo: 'Feriado',     icone: 'party-popper',    dominio: 'feriados' }, // v1.8.0 (bf1c1ba7)
};
const ASSUNTOS = [['ativos', 'Ativos'], ['itens', 'Itens de controle'], ['contratos', 'Contratos e usos'], ['ocorrencias', 'Ocorrências'], ['financeiro', 'Financeiro'], ['documentos', 'Documentos'], ['feriados', 'Feriados']]; // v1.8.0 — feriados
const STATUS = [['critico', 'Crítico'], ['atencao', 'Atenção'], ['informativo', 'Informativo']];
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const MES_CURTO = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const DIA_SEM = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
const JANELA_ATENCAO = 7; // D7.10

const st = { vista: 'mes', semana: null, mes: null, dia: null, status: new Set(), assuntos: null, dados: [], seq: 0, el: null, icones: new Map() };

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
const visivel = (it) => passaStatus(it.status) && passaAssunto(it.assunto);
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
    if (!st.mes) st.mes = new Date(hoje().getFullYear(), hoje().getMonth(), 1);
    if (!st.dia) st.dia = iso(hoje());
    if (!st.semana) st.semana = inicioSemana(hoje());
    if (!st.assuntos) st.assuntos = TODOS_ASSUNTOS();
    window.rzAgendaRedesenhar = () => { if (st.el && st.el.isConnected) desenhar(false); };
    await carregar();
}

// v1.6.0 (item 36) — a vista Alertas é a lista de alertas de sempre (#agenda-lista do index), logo abaixo das abas
function mostrarListaAlertas(mostrar) {
    const lista = document.getElementById('agenda-lista');
    if (!lista || !st.el) return;
    if (lista.previousElementSibling !== st.el) st.el.after(lista);
    lista.hidden = !mostrar;
}

async function carregar() {
    const meu = ++st.seq;
    mostrarListaAlertas(st.vista === 'alertas');
    if (st.vista === 'alertas') { desenhar(false); return; } // a lista vem do index (montarAlertasPatrimonio)
    const [de, ate] = periodo();
    desenhar(true);
    let dados = [];
    try {
        const ramo = (typeof geralRamoFiltro !== 'undefined' && geralRamoFiltro && geralRamoFiltro !== 'tudo') ? geralRamoFiltro : null;
        const { data, error } = await dbAuth.rpc('fn_agenda_periodo', { p_cliente_id: CLIENTE_ID_SUPABASE, p_de: iso(de), p_ate: iso(ate), p_ramo: ramo });
        if (error) throw error;
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
    const [de, ate] = intervaloContado();
    const base = carregando ? [] : universo(de, ate).filter(it => passaAssunto(it.assunto));
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
        </div>
        <div id="ag-corpo">${carregando ? (typeof rzSkeleton === 'function' ? rzSkeleton('lista', 4) : '') : (st.vista === 'semana' ? semanaHtml() : mesHtml())}</div>`;
    ligar();
    if (!carregando && typeof rzLigarGestosAlertas === 'function') {
        const m = st.el.querySelector('#ag-corpo');
        if (m && m.querySelector('[data-rz-alerta],[data-rz-grupo]')) rzLigarGestosAlertas(m); // gestos de sempre
    }
    rzIcones();
}

// ---- linhas
function linhaHtml(r, i) {
    const t = /^Escola · /.test(r.titulo || '') ? { icone: 'backpack', rotulo: 'Escola' }
        : /^Esporte · /.test(r.titulo || '') ? { icone: 'trophy', rotulo: 'Esporte' } // v1.10.0
        : /^Atividade · /.test(r.titulo || '') ? { icone: 'palette', rotulo: 'Atividade' }
        : r.entidade_tipo === 'item_controle' ? { icone: iconeDoItemAgenda(r.entidade_id), rotulo: 'Item de controle' } // v1.11.0
        : (TIPOS[r.tipo] || { icone: 'circle', rotulo: '' }); // v1.9.0
    const s = statusCompromisso(r);
    const sub = [r.sub, r.situacao === 'realizado' ? 'realizado' : ''].filter(Boolean).join(' · ') || t.rotulo;
    const diasAtraso = r.atrasado ? Math.round((hoje() - deIso(r.data)) / 86400000) : 0;
    const selo = diasAtraso > 0 ? ((typeof renderStatus === 'function') ? renderStatus('bad', `Há ${diasAtraso}d`) : `<span class="rz-st rz-bad">Há ${diasAtraso}d</span>`) : '';
    return `<button type="button" class="rz-row rz-link rz-ag-linha rz-ag-${s}" data-ag-i="${i}">
        <div class="rz-ic"><svg data-lucide="${r.situacao === 'realizado' ? 'check' : t.icone}"></svg></div>
        <div class="rz-tx"><b>${rzEsc(r.titulo || t.rotulo)}</b><span>${rzEsc(sub)}</span></div>
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
    return `<div class="rz-ag-grade" style="touch-action:pan-y">${faixa}</div>
        <p class="rz-ag-resumo"><b>${its.length}</b> na semana${crit ? ` · <span class="rz-ag-txt-critico"><b>${crit}</b> crítico${crit > 1 ? 's' : ''}</span>` : ''}</p>${listaDoDia(its)}`;
}

// ---- Mês
function mesHtml() {
    const [de, ate] = periodo();
    const its = universo(iso(de), iso(ate)).filter(visivel);
    const mesAtual = st.mes.getMonth();
    let grade = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map(s => `<div class="rz-ag-sem">${s}</div>`).join('');
    for (let k = 0; k < 42; k++) {
        const d = somaDias(de, k), di = iso(d);
        if (k >= 35 && d.getMonth() !== mesAtual) break; // 5 semanas bastam
        grade += `<button type="button" class="rz-ag-cel${d.getMonth() !== mesAtual ? ' rz-ag-fora' : ''}${di === st.dia ? ' rz-on' : ''}${di === iso(hoje()) ? ' rz-ag-cel-hoje' : ''}" data-ag-dia="${di}">
            <b>${d.getDate()}</b>${pontosDe(its, di)}</button>`;
    }
    return `<div class="rz-ag-grade" style="touch-action:pan-x">${grade}</div>${listaDoDia(its)}`;
}

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
    // v1.6.0 (item 35) — arrastar: Semana para os lados, Mês para cima/baixo (para cima/esquerda = próximo)
    const grade = st.el.querySelector('.rz-ag-grade');
    if (grade) {
        let x0 = null, y0 = null;
        grade.addEventListener('touchstart', (e) => { const t = e.touches[0]; x0 = t.clientX; y0 = t.clientY; }, { passive: true });
        grade.addEventListener('touchend', (e) => {
            if (x0 === null) return;
            const t = e.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0; x0 = y0 = null;
            if (st.vista === 'semana' && Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) navegar(dx < 0 ? 1 : -1);
            else if (st.vista === 'mes' && Math.abs(dy) > 40 && Math.abs(dy) > Math.abs(dx) * 1.3) navegar(dy < 0 ? 1 : -1);
        }, { passive: true });
    }
    st.el.querySelectorAll('[data-ag-st]').forEach(b => b.addEventListener('click', () => {
        const k = b.dataset.agSt; st.status.has(k) ? st.status.delete(k) : st.status.add(k); desenhar(false);
    }));
    const ass = st.el.querySelector('[data-ag-ass]');
    if (ass) ass.addEventListener('click', abrirAssunto);
    st.el.querySelectorAll('[data-ag-dia]').forEach(b => b.addEventListener('click', () => { st.dia = b.dataset.agDia; desenhar(false); }));
    st.el.querySelectorAll('[data-ag-i]').forEach(b => b.addEventListener('click', () => abrirCompromisso(st.dados[Number(b.dataset.agI)])));
    const mais = st.el.querySelector('[data-ag-mais]');
    if (mais) mais.addEventListener('click', () => abrirSheetAcoes({ titulo: 'Agenda', sub: tituloPeriodo(), acoes: [
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
    const base = universo(de, ate).filter(it => passaStatus(it.status)).map(it => it.assunto);
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
function abrirCompromisso(r) {
    if (!r) return;
    if (r.tipo === 'feriado') { if (typeof mostrarToast === 'function') mostrarToast(`${r.titulo} · ${r.sub || 'Nacional'}`); return; } // v1.8.0
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
            const { data } = await dbAuth.rpc('fn_agenda_periodo', { p_cliente_id: CLIENTE_ID_SUPABASE, p_de: iso(ini), p_ate: iso(fim), p_ramo: ramo });
            dados = data || [];
        } catch (_) { /* usa o que está na tela */ }
    }
    const linhas = [];
    for (let k = 0; k < 7; k++) {
        const d = somaDias(ini, k), di = iso(d);
        const doDia = dados.filter(r => r.data === di && passaStatus(statusCompromisso(r)) && passaAssunto(assuntoCompromisso(r)));
        if (!doDia.length) continue;
        linhas.push(`*${DIA_SEM[d.getDay()]} ${d.getDate()}/${String(d.getMonth() + 1).padStart(2, '0')}*`);
        doDia.forEach(r => linhas.push(`• ${r.hora ? String(r.hora).slice(0, 5) + ' ' : ''}${r.titulo}${r.valor != null ? ' · ' + moeda(r.valor) : ''}${r.atrasado ? ' (atrasado)' : ''}`));
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
        const CH = 'height:28px;padding:0 8px;font-size:12px;gap:2px';
        const seta = '<span style="font-size:9px;opacity:.6">▼</span>';
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
                    <span class="rz-sub" style="font-size:12px">Aviso</span>
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
        const CHP = 'height:28px;padding:0 10px;font-size:12px';
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
const COMP_TIPOS = [['generico', 'Compromisso'], ['esporte', 'Esporte'], ['escola', 'Escola'], ['atividade', 'Curso'], ['festa', 'Festa'], ['viagem', 'Viagem']];
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
    try { pessoas = await pessoasDaFamilia(); } catch (_) { /* sem pessoas: o aviso abaixo explica */ }
    const c = { titulo: pref.titulo || '', data: pref.data || '', hora: pref.hora || '', valor: pref.valor || null, local: pref.local || '',
        tipo: COMP_TIPOS.some(t => t[0] === pref.tipo) ? pref.tipo : 'generico', pessoas: new Set((pref.pessoas || []).filter(id => pessoas.some(p => p.id === id))),
        aviso: pref.aviso_dias != null ? pref.aviso_dias : (pref.valor ? 3 : 1) };
    const CH = 'height:32px;padding:0 11px;font-size:13px';
    const campo = 'width:100%;box-sizing:border-box;height:42px;border:1px solid var(--line);border-radius:10px;padding:0 12px;font:inherit;font-size:16px;background:#fff;color:var(--ink)';
    const rot = (t) => `<small class="rz-sub" style="display:block;margin:12px 0 5px">${t}</small>`;
    const diaSem = () => c.data ? `${calDiaSem(c.data)} ${calData(c.data)}/${c.data.slice(0, 4)}` : '';
    const desenhar = () => {
        const ok = c.titulo.trim() && c.data && c.pessoas.size;
        corpo.innerHTML = `
            ${rot('O quê')}<input id="cp-tit" style="${campo}" maxlength="140" placeholder="Ex.: exame de faixa de jiu-jitsu" value="${rzEsc(c.titulo)}">
            ${rot('Quando' + (c.data ? ` · <b>${diaSem()}</b>` : ''))}
            <div style="display:flex;gap:8px"><input id="cp-data" type="date" style="${campo};flex:1.4" value="${c.data}"><input id="cp-hora" type="time" style="${campo};flex:1" value="${c.hora}"></div>
            ${rot('Para quem')}<div style="display:flex;flex-wrap:wrap;gap:6px">${pessoas.length ? pessoas.map(p =>
                `<button type="button" class="rz-chip${c.pessoas.has(p.id) ? ' rz-on' : ''}" style="${CH}" data-cp-p="${p.id}">${rzEsc(p.nome)}</button>`).join('')
                + (pessoas.length > 1 ? `<button type="button" class="rz-chip" style="${CH}" data-cp-todos>${c.pessoas.size === pessoas.length ? 'Nenhum' : 'Todos'}</button>` : '')
                : '<span class="rz-sub">Cadastre as pessoas em Família para escolher aqui.</span>'}</div>
            ${rot('Tipo')}<div style="display:flex;flex-wrap:wrap;gap:6px">${COMP_TIPOS.map(([k, n]) => `<button type="button" class="rz-chip${c.tipo === k ? ' rz-on' : ''}" style="${CH}" data-cp-t="${k}">${n}</button>`).join('')}</div>
            ${rot('Aviso')}<div style="display:flex;flex-wrap:wrap;gap:6px">${[[0, 'Sem'], [1, '1 dia antes'], [3, c.valor ? '3 e 1 dia antes' : '3 dias antes']].map(([n, t]) =>
                `<button type="button" class="rz-chip${c.aviso === n ? ' rz-on' : ''}" style="${CH}" data-cp-a="${n}">${t}</button>`).join('')}</div>
            <div style="display:flex;gap:8px">
                <div style="flex:1">${rot('Valor (opcional)')}<input id="cp-valor" inputmode="decimal" style="${campo}" placeholder="R$ 0,00" value="${c.valor ? String(c.valor).replace('.', ',') : ''}"></div>
                <div style="flex:1.4">${rot('Local (opcional)')}<input id="cp-local" style="${campo}" maxlength="120" value="${rzEsc(c.local)}"></div>
            </div>
            ${c.valor ? '<small class="rz-sub" style="display:block;margin-top:6px">O valor entra como despesa prevista no Financeiro.</small>' : ''}
            <button type="button" class="rz-btn rz-btn-1 rz-ag-bt" id="cp-salvar"${ok ? '' : ' disabled'} style="margin-top:16px">${ok ? 'Salvar na agenda' : !c.titulo.trim() ? 'Diga o que é' : !c.data ? 'Escolha a data' : 'Escolha para quem'}</button>
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
        ['#cp-data', '#cp-hora', '#cp-valor'].forEach(q => corpo.querySelector(q).addEventListener('change', redesenhar));
        corpo.querySelectorAll('[data-cp-p]').forEach(b => b.addEventListener('click', () => { ler(); const id = b.dataset.cpP; c.pessoas.has(id) ? c.pessoas.delete(id) : c.pessoas.add(id); desenhar(); }));
        const todos = corpo.querySelector('[data-cp-todos]');
        if (todos) todos.addEventListener('click', () => { ler(); c.pessoas = c.pessoas.size === pessoas.length ? new Set() : new Set(pessoas.map(p => p.id)); desenhar(); });
        corpo.querySelectorAll('[data-cp-t]').forEach(b => b.addEventListener('click', () => { ler(); c.tipo = b.dataset.cpT; desenhar(); }));
        corpo.querySelectorAll('[data-cp-a]').forEach(b => b.addEventListener('click', () => { ler(); c.aviso = Number(b.dataset.cpA); desenhar(); }));
        corpo.querySelector('#cp-cancelar').addEventListener('click', () => fecharSheet(true));
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
            tipo: p.tipo_compromisso || 'generico', aviso_dias: p.aviso_dias, pessoas: p.pessoas_ids || [] });
    }
    // agenda: abre a Agenda no período falado (Semana até 7 dias; senão o Mês)
    const de = p.data ? deIso(p.data) : hoje();
    const dias = p.data && p.data_fim ? Math.round((deIso(p.data_fim) - deIso(p.data)) / 864e5) : 7;
    st.vista = dias <= 7 ? 'semana' : 'mes';
    st.mes = new Date(de.getFullYear(), de.getMonth(), 1); st.semana = inicioSemana(de); st.dia = iso(de);
    if (typeof window.irParaAbaRodape === 'function') window.irParaAbaRodape('tab-alertas'); else if (typeof switchTab === 'function') switchTab('tab-alertas');
    if ((p.pessoas || []).length) (window.rzToast || mostrarToast)(`Agenda de ${p.pessoas.join(', ')}`, { tipo: 'info' });
}
