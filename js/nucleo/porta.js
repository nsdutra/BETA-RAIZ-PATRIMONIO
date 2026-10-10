// ============================================================================
// nucleo/porta.js — Raiz Patrimônio · Núcleo de plataforma
//                   leitura do banco: os leitores que o boot usa para montar
//                   o estado do app (ativos, contratos, mensalidades, repasses,
//                   lançamentos, prestadores, pessoas, empreendimentos, tipos,
//                   minutas, links da vitrine, logs e a vitrine pública)
// Versão: 1.2.0 · 10/10/2026
//
// v1.2.0 (10/10/2026, sessão 20261010-1115-onda1b-escrita, demanda 6b11c602 — Onda 1b-1) — a porta
// ganha a ESCRITA: os 9 sincronizar* (5 de item + 4 de lista, mais os 3 atalhos de prestador) saíram
// do index.html pelo mesmo caminho da 1a, SEM UMA LINHA REESCRITA. Nenhum deles escreve em global do
// index — foi medido função a função, e a única suspeita (SOCIO_PADRAO em sincronizarImovelSupabase)
// era menção em comentário. O que eles PRECISAM são 5 arrays de estado vivo do index (contratos,
// mensalidades, pessoas, repasses, empreendimentosCadastrados), que o index reatribui a cada
// carregarTudo(): vêm por atualizarContexto() a cada chamada, pelo mesmo motivo de dbAuth — injetar
// por valor uma vez deixaria o módulo com a lista velha.
//
// NÃO vieram nesta onda, de propósito: carregarAtivosParaSelectSupabase e carregarPartesParaSelect-
// Supabase. Os caches deles (ativosParaSelect/partesParaSelect) têm 4 pontos de invalidação, e DOIS
// estão dentro do js/financeiro.js, que faz `partesParaSelect = null` direto. Mover o cache para cá
// sem mover a invalidação faria o seletor de partes nunca mais ver uma parte nova — falha silenciosa,
// sem erro na tela. Pede ficha própria (1b-2).
//// v1.1.0 (10/10/2026, sessão 20261010-0155-onda1-nucleo, demanda 6b11c602) — CORREÇÃO DE DEFEITO MEU,
// achado pelo Nicola no teste 5 da v1.0.0: a VITRINE PÚBLICA parou de abrir, com a mensagem genérica
// "Este link não abre mais: ele foi revogado, expirou ou está incompleto". Causa: instalarPorta()
// exigia clienteId, e a vitrine pública roda ANTES de qualquer login (index.html, ramo
// `ehVitrinePublica`) — ali CLIENTE_ID_SUPABASE ainda é null. O throw da instalação subia pela ponte e
// caía no catch do js/vitrine.js, que mostra a mensagem de link expirado para QUALQUER erro. O link
// estava perfeito; a porta é que se recusava a abrir. A guarda era mais rígida do que qualquer leitor
// precisa: dos 14, só resolverVitrinePublicaSupabase dispensa cliente_id — e é exatamente o único que
// roda sem sessão. Agora instalarPorta() exige só o db, e a exigência de cliente_id virou guarda POR
// CHAMADA, em chamar(): quem precisa de cliente_id e não tem falha com erro nomeado, em vez de
// consultar com null e devolver lista vazia em silêncio (que era o comportamento do index antigo).
//// v1.0.0 (10/10/2026, sessão 20261010-0155-onda1-nucleo, demanda 6b11c602 — Onda 1a da
// fragmentação, plano aprovado pelo Nicola 09/10 21:15) — primeiro módulo do núcleo.
// Os 13 leitores saíram do index.html SEM UMA LINHA REESCRITA: o corpo de cada um veio
// byte a byte, e o que mudou foi só ganhar "export" na frente e passar a resolver
// dbAuth / CLIENTE_ID_SUPABASE / CONFIG_CLIENTE / SOCIO_PADRAO e os 5 ajudantes de
// tradução pelas variáveis deste módulo, preenchidas uma vez por instalarPorta() —
// mesma convenção de injeção do comum-licenca.js. Os nomes das funções NÃO mudaram,
// então os 18 sítios de chamada do index seguem chamando carregarImoveisSupabase()
// como antes, pela ponte window[nome] (ver "PORTA DE LEITURA" no index.html).
//
// Por que estes 13 e não os outros: são os leitores PUROS — consultam e devolvem, sem
// escrever em nenhuma global do index. Os dois leitores com cache próprio
// (carregarAtivosParaSelectSupabase, carregarPartesParaSelectSupabase) e os 9
// sincronizar* (escrita) ficaram no index de propósito, para a Onda 1b: cache e
// escrita mexem em estado e pedem ficha própria.
//
// Os 5 ajudantes de tradução (converterDataISOparaBR, dataParaCompetencia,
// mapStatus*ParaAntigo) ficaram no index porque os sincronizar* também os usam —
// duplicar seria violação da CAN-03. Entram aqui por injeção.
// ============================================================================

export const VERSAO = '1.2.0';  // v-check: lido por ⚙️ › Conta › Versões — manter igual ao header

// ----------------------------------------------------------------------------
// Injeção do host (index.html ou cofre.html). Os leitores abaixo usam estes
// nomes exatamente como usavam no index, por isso as variáveis se chamam igual:
// é o que permite o corpo de cada leitor vir sem reescrita.
// ----------------------------------------------------------------------------
let dbAuth = null;
let CLIENTE_ID_SUPABASE = null;
let CONFIG_CLIENTE = null;
let SOCIO_PADRAO = null;
// --- estado vivo do index: REATRIBUÍDO a cada carregarTudo(). Chega fresco a cada chamada.
let contratos = [];
let mensalidades = [];
let pessoas = [];
let repasses = [];
let empreendimentosCadastrados = [];
// --- ajudantes que ficam no index (os escritores E a orquestradora sincronizarComSupabase usam)
let logScreen = null;
let competenciaParaData = null;
let converterDataBRparaISO = null;
let mapStatusAntigoParaSupabase = null;
let mapStatusContratoAntigoParaSupabase = null;
let mapStatusMensalidadeAntigoParaSupabase = null;
let obterPessoaIdPorNome = null;
let sincronizarListaComResiliencia = null;
let converterDataISOparaBR = null;
let dataParaCompetencia = null;
let mapStatusContratoSupabaseParaAntigo = null;
let mapStatusMensalidadeSupabaseParaAntigo = null;
let mapStatusSupabaseParaAntigo = null;

// ATENCAO (o defeito que isto evita): dbAuth, CLIENTE_ID_SUPABASE, CONFIG_CLIENTE e
// SOCIO_PADRAO sao REATRIBUIDOS pelo index (login, troca de empresa). Injetar por valor
// uma vez so deixaria este modulo com o valor velho depois da primeira troca — leitura
// do cliente errado. Por isso a ponte do index chama atualizarContexto() ANTES de cada
// leitura: os quatro vem sempre frescos. Os ajudantes nao, sao funcoes estaveis.
export function atualizarContexto({ db, clienteId, config = null, socioPadrao = null, estado = null }) {
    if (db) dbAuth = db;
    if (clienteId) CLIENTE_ID_SUPABASE = clienteId;
    CONFIG_CLIENTE = config;
    SOCIO_PADRAO = socioPadrao;
    // v1.2.0 — os 5 arrays de estado, pelo mesmo motivo do db: o index os REATRIBUI
    // (carregarTudo troca a referência). Guardar a referência antiga faria o escritor
    // procurar um contrato numa lista que não existe mais.
    if (estado) {
        if (estado.contratos) contratos = estado.contratos;
        if (estado.mensalidades) mensalidades = estado.mensalidades;
        if (estado.pessoas) pessoas = estado.pessoas;
        if (estado.repasses) repasses = estado.repasses;
        if (estado.empreendimentosCadastrados) empreendimentosCadastrados = estado.empreendimentosCadastrados;
    }
}

// A lista é uma só para não divergir entre o que se exige e o que se atribui — foi
// assim que a v1.0.0 exigiu clienteId sem precisar. (dem 6b11c602)
const AJUDANTES = [
    'converterDataISOparaBR', 'dataParaCompetencia',
    'mapStatusContratoSupabaseParaAntigo', 'mapStatusMensalidadeSupabaseParaAntigo',
    'mapStatusSupabaseParaAntigo',
    'logScreen', 'competenciaParaData', 'converterDataBRparaISO',
    'mapStatusAntigoParaSupabase', 'mapStatusContratoAntigoParaSupabase',
    'mapStatusMensalidadeAntigoParaSupabase', 'obterPessoaIdPorNome',
    'sincronizarListaComResiliencia'
];

export function instalarPorta({ db, clienteId = null, config = null, socioPadrao = null, ajudantes = {} }) {
    if (!db) throw new Error('[porta] instalarPorta sem db (cliente do Supabase)');
    // v1.1.0 — clienteId NÃO é exigido aqui de propósito: a vitrine pública instala a porta antes de
    // qualquer login. Quem exige é chamar(), por leitor, onde dá para dizer qual leitor faltou o quê.
    atualizarContexto({ db, clienteId, config, socioPadrao });
    // Falta de ajudante é erro de instalação, não de execução: avisa aqui, onde
    // dá para consertar, em vez de estourar no meio de uma leitura.
    const faltando = AJUDANTES.filter(n => typeof ajudantes[n] !== 'function');
    if (faltando.length) throw new Error('[porta] ajudante não injetado: ' + faltando.join(', '));
    converterDataISOparaBR = ajudantes.converterDataISOparaBR;
    dataParaCompetencia = ajudantes.dataParaCompetencia;
    mapStatusContratoSupabaseParaAntigo = ajudantes.mapStatusContratoSupabaseParaAntigo;
    mapStatusMensalidadeSupabaseParaAntigo = ajudantes.mapStatusMensalidadeSupabaseParaAntigo;
    mapStatusSupabaseParaAntigo = ajudantes.mapStatusSupabaseParaAntigo;
    // v1.2.0 — os da escrita
    logScreen = ajudantes.logScreen;
    competenciaParaData = ajudantes.competenciaParaData;
    converterDataBRparaISO = ajudantes.converterDataBRparaISO;
    mapStatusAntigoParaSupabase = ajudantes.mapStatusAntigoParaSupabase;
    mapStatusContratoAntigoParaSupabase = ajudantes.mapStatusContratoAntigoParaSupabase;
    mapStatusMensalidadeAntigoParaSupabase = ajudantes.mapStatusMensalidadeAntigoParaSupabase;
    obterPessoaIdPorNome = ajudantes.obterPessoaIdPorNome;
    sincronizarListaComResiliencia = ajudantes.sincronizarListaComResiliencia;
    return true;
}

export function portaInstalada() {
    // v1.1.0 — só o db. Com cliente_id era impossível a vitrine pública estar "instalada".
    return !!dbAuth;
}

// ----------------------------------------------------------------------------
// Os 13 leitores, como estavam no index.html
// ----------------------------------------------------------------------------

// Onda 12 (pedido explícito, 16/09/2026: "quero que exista já
// definitivamente apenas um caminho de escrita, na tabela de
// ativos... imoveis totalmente isolada, aguardando ser deletada")
// — fonte agora é só `cofre_ativos`, filtrando por CATEGORIA
// (tipo_ativo), não mais por vínculo com `imoveis`: cobre os 104
// imóveis LEGADOS (entidade_origem_tipo='imovel') e qualquer
// imóvel NOVO criado depois de hoje (nativo, sem vínculo nenhum
// — é assim que ele vira elegível pra contrato, que era o
// problema real por trás de toda essa frente).
// MUDANÇA DE SIGNIFICADO IMPORTANTE: `id` deste array deixou de
// ser imoveis.id — agora é SEMPRE cofre_ativos.id (o id do
// ativo), pros 2 casos. O nome do campo continua "id" (não
// renomeado — evita reescrever ~140 pontos que só fazem
// imoveis.find(i => i.id === con.imovelId), que continuam
// funcionando idênticos, contanto que os dois lados usem o
// mesmo espaço de id — e agora usam). Quem grava (sincronizarContratoSupabase,
// sincronizarImovelSupabase) já foi ajustado pra gravar ativo_id,
// nunca mais imovel_id — ver changelog de cada um.
// Condomínio/IPTU vêm de cofre_itens_controle (item de controle
// automático, E8 — dispara em QUALQUER insert de ativo, legado ou
// novo). Código do IPTU/foto de capa vêm de dados_especificos
// (backfill de 1x pros 104 legados; imóvel novo começa sem, até
// ganhar uma tela própria pra isso). `imoveis` não é mais
// consultada por esta função.
export async function carregarImoveisSupabase() {

    const { data: ativosRows, error: errAtivos } = await dbAuth
        .from('cofre_ativos')
        .select('*, empreendimentos(nome), ativo_tipos(nome)')
        .eq('cliente_id', CLIENTE_ID_SUPABASE)
        .eq('status', 'ativo')
        .in('tipo_ativo', ['imovel_predial', 'imovel_territorial']);

    if (errAtivos) throw errAtivos;

    const idsAtivos = (ativosRows || []).map(function(r) { return r.id; });

    let propriedades = [];
    if (idsAtivos.length > 0) {
        const { data: propRows, error: errProp } = await dbAuth
            .from('propriedade_ativo')
            .select('*, pessoas(nome)')
            .in('ativo_id', idsAtivos);
        if (errProp) throw errProp;
        propriedades = propRows || [];
    }

    // CORRIGIDO — sindicoId/manutencistaId eram deixados sempre vazios aqui,
    // por isso nunca apareciam no imóvel mesmo com o vínculo existindo em
    // "prestador_vinculo". Busca todos os vínculos vigentes (data_fim_vigencia
    // nula) de uma vez, e casa por empreendimento_id de cada imóvel.
    const { data: vinculosRows, error: errVinc } = await dbAuth
        .from('prestador_vinculo')
        .select('prestador_id, empreendimento_id, tipo_prestador')
        .is('data_fim_vigencia', null);
    if (errVinc) throw errVinc;
    const vinculosVigentes = vinculosRows || [];

    let itensIptuCondominio = [];
    if (idsAtivos.length > 0) {
        const { data: itensRows, error: errItens } = await dbAuth
            .from('cofre_itens_controle')
            .select('ativo_id, valor_previsto, cofre_controle_subtipos(nome)')
            .in('ativo_id', idsAtivos)
            .eq('ativo', true);
        if (errItens) throw errItens;
        itensIptuCondominio = itensRows || [];
    }

    return (ativosRows || []).map(function(row) {

        const divisao = {};
        propriedades
            .filter(function(p) { return p.ativo_id === row.id; })
            .forEach(function(p) {
                const nomeDono = p.tipo_proprietario === 'socio_interno'
                    ? (p.pessoas ? p.pessoas.nome : SOCIO_PADRAO)
                    : p.nome_externo;
                divisao[nomeDono] = p.percentual;
            });
        // CORRIGIDO — não preenche mais SOCIO_PADRAO=100 como default
        // quando não há dono cadastrado; fica vazio mesmo, refletindo a
        // realidade (imóvel sem divisão societária lançada ainda).

        const vinculoSindico = vinculosVigentes.find(function(v) { return v.empreendimento_id === row.empreendimento_id && v.tipo_prestador === 'sindico'; });
        const vinculoManutencista = vinculosVigentes.find(function(v) { return v.empreendimento_id === row.empreendimento_id && v.tipo_prestador === 'manutencista'; });

        const itensDoAtivo = itensIptuCondominio.filter(function(i) { return i.ativo_id === row.id; });
        const itemIptu = itensDoAtivo.find(function(i) { return i.cofre_controle_subtipos && i.cofre_controle_subtipos.nome === 'IPTU'; });
        const itemCondominio = itensDoAtivo.find(function(i) { return i.cofre_controle_subtipos && i.cofre_controle_subtipos.nome === 'Condomínio (boleto)'; });

        const dados = row.dados_especificos || {};

        return {
            id: row.id,
            ativoId: row.id, // mesmo valor de id agora — mantido pelo nome, pra quem já espera esse campo
            empreendimento: row.empreendimentos ? row.empreendimentos.nome : '',
            nomeExibicao: row.nome_exibicao || '', // v1.287.0 — nome do ativo no seletor de imóvel
            empreendimentoId: row.empreendimento_id || null,
            enderecoRua: row.endereco_rua || '',
            enderecoNum: row.endereco_num || '',
            enderecoComp: row.endereco_comp || '',
            enderecoBairro: row.endereco_bairro || '',
            enderecoCidade: row.endereco_cidade || '',
            finalidadeUso: row.finalidade_uso || 'long_stay',
            finalidadeUsoCadastrada: row.finalidade_uso || null, // v1.298.4 — sem o padrão; alerta "Imóvel sem finalidade de uso" lê daqui
            tipo: row.ativo_tipos ? row.ativo_tipos.nome : '',
            tipoId: row.tipo_detalhe_id || null,
            tamanho: row.area_m2 || 0,
            suites: 0,
            banheiros: 0,
            condominio: (itemCondominio && itemCondominio.valor_previsto != null) ? Number(itemCondominio.valor_previsto) : 0,
            iptu: (itemIptu && itemIptu.valor_previsto != null) ? Number(itemIptu.valor_previsto) : 0,
            codigoIPTU: dados.codigo_iptu || '',
            descricao: row.observacao || '',
            energiaRumo: dados.energia_disponivel ? 'Sim' : 'Não',
            valorMercado: row.valor_referencia || 0,
            valor: Number(dados.aluguel_desejado) || 0,
            fotos: dados.foto_capa_url ? [dados.foto_capa_url] : [], // único leitor (renderFiltroDocumentosFicha) está órfão, sem chamador — mantido só por compat de formato
            divisao: divisao,
            parteRumo: { [CONFIG_CLIENTE.nomeEmpresa || SOCIO_PADRAO]: 100 }, // ver nota de simplificação acima
            status: mapStatusSupabaseParaAntigo(row.situacao_uso),
            sindicoId: vinculoSindico ? vinculoSindico.prestador_id : '',
            manutencistaId: vinculoManutencista ? vinculoManutencista.prestador_id : ''
        };

    });

}

export async function carregarContratosSupabase() {

    const { data: contratosRows, error: errCon } = await dbAuth
        .from('contratos')
        .select('*')
        .eq('cliente_id', CLIENTE_ID_SUPABASE);
    if (errCon) throw errCon;

    const idsContratos = (contratosRows || []).map(function(c) { return c.id; });

    let historicos = [];
    let divisoesRepasse = [];
    if (idsContratos.length > 0) {
        const { data: histRows, error: errHist } = await dbAuth
            .from('historico_contrato')
            .select('*')
            .in('contrato_id', idsContratos)
            .order('criado_em', { ascending: true });
        if (errHist) throw errHist;
        historicos = histRows || [];

        const { data: divRows, error: errDiv } = await dbAuth
            .from('divisao_repasse_contrato')
            .select('*, pessoas(nome)')
            .in('contrato_id', idsContratos);
        if (errDiv) throw errDiv;
        divisoesRepasse = divRows || [];
    }

    return (contratosRows || []).map(function(row) {
        return {
            id: row.id,
            // Onda 12 (16/09/2026) — lê ativo_id agora, não mais
            // imovel_id. Os 68 contratos existentes já têm os
            // dois preenchidos (ativo_id foi derivado automatico
            // desde a fatia A.8, "passo 4a"); contrato novo nasce
            // só com ativo_id. imovelId (nome do campo, não
            // renomeado) passa a carregar um id de ativo — ver
            // carregarImoveisSupabase, mesmo espaço de id agora.
            imovelId: row.ativo_id || '',
            status: mapStatusContratoSupabaseParaAntigo(row.status),
            locatario: row.locatario || '',
            docTipo: row.doc_tipo || 'CPF',
            cpf: row.cpf || '',
            vencimentoDia: row.vencimento_dia || 15,
            alugelAntecipado: row.aluguel_antecipado ? 'Sim' : 'Não',
            whatsapp: row.whatsapp || '',
            email: row.email || '',
            inicio: row.inicio || '',
            fim: row.fim || '',
            valor: row.valor || 0,
            valorAnterior: row.valor_anterior || 0,
            reajusteAplicado: row.reajuste_aplicado ? 1 : 0,
            reajuste: row.reajuste || 'IPCA',
            // v1.27.0 (Bloco B, demandas 5ca973d6/854f6343) — dados que
            // geram os itens de controle de reajuste/revisional
            // (fn_contrato_itens_controle_gerar, migration v2). null
            // vira '' (não 0/12) pra o formulário distinguir "não
            // configurado" de "configurado com o valor 0" — ver
            // editarContrato().
            reajustePeriodicidadeMeses: row.reajuste_periodicidade_meses ?? '',
            reajusteTetoPct: row.reajuste_teto_pct ?? '',
            reajustePisoPct: row.reajuste_piso_pct ?? '',
            revisionalPeriodicidadeMeses: row.revisional_periodicidade_meses ?? '',
            iptuValor: row.iptu || 0,
            condominioValor: row.condominio || 0,
            locatarioEnderecoAtual: row.locatario_endereco_atual || '',
            locatarioProfissao: row.locatario_profissao || '',
            locatarioEstadoCivil: row.locatario_estado_civil || '',
            contatoNome: row.contato_nome || '',
            formaPagamento: row.forma_pagamento || 'PIX',
            anexos: (function() {
                // CORRIGIDO (bug real — anexo excluído continuava
                // aparecendo ao reabrir o contrato): a reconstrução
                // olhava só as entradas "tipo=anexo" (de quando o
                // arquivo foi adicionado), sem nunca checar se existia
                // uma entrada posterior de remoção para aquele mesmo
                // arquivo. O banco ficava certo (arquivo e entrada de
                // histórico realmente apagados), mas o arquivo
                // continuava "voltando" porque a entrada de ADIÇÃO
                // (que não foi apagada, só a de remoção que criei
                // depois é que não existe mais o alvo) nunca tinha
                // sido removida do histórico — então ela sozinha
                // reconstruía o anexo de novo. Corrigido: removerDocumentoContrato
                // agora também apaga a entrada de ADIÇÃO (não só cria
                // uma de remoção), então isso nem deveria mais
                // acontecer — mas o filtro abaixo fica como proteção
                // extra, ignorando qualquer "tipo=anexo" cujo nome
                // também apareça numa entrada "removido" mais recente.
                const nomesRemovidos = historicos
                    .filter(function(h) { return h.contrato_id === row.id && h.tipo === 'alteracao' && (h.descricao || '').startsWith('Documentos: removido '); })
                    .map(function(h) { return h.descricao.replace('Documentos: removido ', '').trim(); });

                return historicos
                    .filter(function(h) { return h.contrato_id === row.id && h.tipo === 'anexo' && h.anexo_url; })
                    .map(function(h) {
                        const matchTipo = (h.descricao || '').match(/\(([^)]+)\)\s*$/);
                        const matchNome = (h.descricao || '').match(/^Documento anexado:\s*(.*?)(?:\s*\([^)]+\))?$/);
                        return {
                            id: h.id,
                            nome: matchNome ? matchNome[1] : 'documento',
                            url: h.anexo_url,
                            tipo: matchTipo ? matchTipo[1] : 'Outros',
                            _salvo: true
                        };
                    })
                    .filter(function(a) { return !nomesRemovidos.includes(a.nome); });
            })(),
            descontoEnergia: row.desconto_energia || 0,
            condominioLocatario: row.condominio_locatario ? 'Sim' : 'Não',
            locatarioPagaIptu: row.locatario_paga_iptu ? 'Sim' : 'Não',
            divisaoRepasse: divisoesRepasse
                .filter(function(d) { return d.contrato_id === row.id; })
                .map(function(d) {
                    return {
                        nome: d.tipo_beneficiario === 'socio_interno' ? (d.pessoas ? d.pessoas.nome : '') : d.nome_externo,
                        percentual: d.percentual
                    };
                }),
            administradoraId: row.administradora_id || '',
            descricao: row.descricao || '',
            // CORRIGIDO (bug crítico — histórico explodindo, 10 mil+
            // linhas em poucos testes): entradas vindas do banco não
            // eram marcadas como "_salvo". Na próxima gravação, TODAS
            // eram tratadas como novas e reinseridas de novo — e como
            // o histórico já reinserido também não tinha "_salvo", a
            // PRÓXIMA gravação reinseria tudo de novo, e de novo,
            // crescendo cada vez mais rápido. Também guarda
            // "alteracoes" reconstruído a partir da descrição salva,
            // para o componente de histórico do contrato não mostrar
            // os detalhes em branco.
            historico: historicos
                .filter(function(h) { return h.contrato_id === row.id; })
                .map(function(h) {
                    // CORRIGIDO (demanda 9fe63ed8): a reconstrução
                    // anterior gerava sempre uma única linha genérica
                    // ("Alteração: - → <descrição completa>"), então a
                    // ficha de histórico do contrato nunca mostrava os
                    // campos alterados de fato (ex.: "Valor do
                    // aluguel: R$ 2.000,00 → R$ 2.200,00"), só o texto
                    // corrido inteiro. Agora faz o parse de volta do
                    // formato gravado em sincronizarContratoSupabase
                    // ("Campo: De → Para; Campo2: De2 → Para2", com
                    // sufixo opcional " (vigente desde ...)"),
                    // recuperando a lista de alterações campo a
                    // campo. Só cai no formato genérico de 1 linha se
                    // o texto não bater com esse padrão (ex.:
                    // histórico anterior a esta correção).
                    var alteracoesParseadas = null;
                    if (h.descricao) {
                        var textoSemSufixo = h.descricao.replace(/\s*\(vigente desde [^)]+\)\s*$/, '');
                        var partes = textoSemSufixo.split('; ');
                        var todasBateram = partes.length > 0 && partes.every(function(p) {
                            return /^.+?: .* → .*$/.test(p);
                        });
                        if (todasBateram) {
                            alteracoesParseadas = partes.map(function(p) {
                                var m = p.match(/^(.+?): (.*) → (.*)$/);
                                return { campo: m[1], de: m[2], para: m[3] };
                            });
                        }
                    }
                    return {
                        data: h.criado_em,
                        descricao: h.descricao,
                        tipo: h.tipo,
                        alteracoes: alteracoesParseadas || [{ campo: h.tipo === 'assinatura' ? 'Contrato criado' : 'Alteração', de: '-', para: h.descricao || '-' }],
                        _salvo: true
                    };
                })
        };
    });

}

export async function carregarMensalidadesSupabase() {
    const { data, error } = await dbAuth.from('mensalidades').select('*').eq('cliente_id', CLIENTE_ID_SUPABASE);
    if (error) throw error;
    return (data || []).map(function(row) {
        return {
            id: row.id,
            contratoId: row.contrato_id || '',
            referencia: dataParaCompetencia(row.competencia),
            status: mapStatusMensalidadeSupabaseParaAntigo(row.status),
            banco: row.banco || '-',
            dataPgto: converterDataISOparaBR(row.data_pgto),
            observacao: row.observacao || '',
            observacaoRecibo: row.observacao_recibo || '',
            valorConfirmado: row.valor_confirmado || 0,
            valorEnergia: row.valor_energia || 0,
            multaEncargos: row.multa_encargos ?? null, // v1.295.0 (RF-05)
            valorIptu: row.valor_iptu || 0,
            valorCondominio: row.valor_condominio || 0,
            // v1.260.0 (demanda d92a6dfc — valor bruto/líquido/taxa
            // editáveis) — os 3 campos já existiam na tabela desde a
            // Fase 2 fiscal, mas nunca eram lidos pro objeto em
            // memória; sem isso, o formulário de baixa e o ⋮
            // "Ajustar valores" não tinham o que mostrar.
            valorBruto: row.valor_bruto,
            valorTaxaAdm: row.valor_taxa_adm,
            valorBrutoEstimado: row.valor_bruto_estimado !== false,
            chaveTransacaoOrigem: row.chave_transacao_origem || '',
            envioLog: (row.envio_log && !Array.isArray(row.envio_log)) ? row.envio_log : null,
            // Entrega F.3/F.4 (21/09/2026) — default true no banco
            // (migration fechamento_pacote_contador_v1): todo item
            // baixado entra no pacote do contador, a menos que
            // alguém desmarque via ⋮ "Não incluir na contabilidade"
            // (fn_financeiro_incluir_contabilidade).
            incluirContabilidade: row.incluir_contabilidade !== false,
            contaId: row.conta_id || null, // v1.300.2 — P4a (filtro e troca de conta)
            divisaoAjustada: !!row.divisao_excecao // v1.314.1 — P4b B1b (divisão por exceção)
        };
    });
}

export async function carregarRepassesSupabase() {
    const { data, error } = await dbAuth.from('repasses').select('*, pessoas(nome)').eq('cliente_id', CLIENTE_ID_SUPABASE);
    if (error) throw error;
    return (data || []).map(function(row) {
        return {
            id: row.id,
            socio: row.pessoas ? row.pessoas.nome : '',
            mes: dataParaCompetencia(row.competencia),
            valor: row.valor || 0,
            dataReal: converterDataISOparaBR(row.data_real),
            timestamp: new Date(row.criado_em).getTime()
        };
    });
}

// v1.97.0 (NOVO, 01/09/2026) — Saídas/despesas. Lê direto de
// public.lancamentos (RLS por cliente_id já isola, mesmo padrão de
// mensalidades/partes) com embed de partes(nome) e
// cofre_ativos(nome_exibicao) — 1 query só, sem N+1 por card.
// direcao='saida' aqui: esta tela nunca escreve/lê 'entrada' (isso
// é sempre mensalidades, a fonte de verdade de recebimento).
export async function carregarLancamentosSupabase() {
    const { data, error } = await dbAuth.from('lancamentos')
        .select('*, partes(nome), cofre_ativos(nome_exibicao)')
        .eq('cliente_id', CLIENTE_ID_SUPABASE)
        .eq('direcao', 'saida');
    if (error) throw error;
    return (data || []).map(function(row) {
        return {
            id: row.id,
            descricao: row.descricao || '',
            categoria: row.categoria,
            valor: Number(row.valor || 0),
            competencia: row.competencia,
            vencimento: row.vencimento,
            status: row.status,
            dataPagamento: row.data_pagamento,
            formaPagamento: row.forma_pagamento,
            ativoId: row.ativo_id || null,
            ativoNome: row.cofre_ativos ? row.cofre_ativos.nome_exibicao : '',
            parteId: row.parte_id || null,
            parteNome: row.partes ? row.partes.nome : '',
            reembolsavel: !!row.reembolsavel,
            observacao: row.observacao || '',
            // v1.179.5 — pedido do Nicola (Resumo da conciliação):
            // sinal síncrono de "veio de uma conciliação de
            // extrato" — mesmo papel que chaveTransacaoOrigem já
            // cumpre pra mensalidades.
            origemTipo: row.origem_tipo || null,
            origemId: row.origem_id || null, // v1.289.0 — despesa da licença acha o comprovante pelo pagamento
            // Entrega F.3/F.4 — ver nota igual em carregarMensalidadesSupabase.
            incluirContabilidade: row.incluir_contabilidade !== false,
            contaId: row.conta_id || null, // v1.300.2 — P4a
            divisaoAjustada: !!row.divisao_excecao, // v1.314.1 — P4b B1b
            faturaId: row.fatura_id || null // v1.319.0 — P5a: compra de cartão (Saídas agrupa por fatura)
        };
    });
}

export async function carregarPrestadoresSupabase() {

    const { data: prestadoresRows, error: errPrest } = await dbAuth
        .from('prestadores')
        .select('*')
        .eq('cliente_id', CLIENTE_ID_SUPABASE);
    if (errPrest) throw errPrest;

    const idsPrestadores = (prestadoresRows || []).map(function(p) { return p.id; });

    let vinculos = [];
    if (idsPrestadores.length > 0) {
        const { data: vincRows, error: errVinc } = await dbAuth
            .from('prestador_vinculo')
            .select('*, empreendimentos(nome)')
            .in('prestador_id', idsPrestadores)
            .is('data_fim_vigencia', null); // só os vínculos ainda vigentes
        if (errVinc) throw errVinc;
        vinculos = vincRows || [];
    }

    const administradoras = [], sindicos = [], manutencistas = [];

    (prestadoresRows || []).forEach(function(p) {

        const nomesEmpreendimentos = vinculos
            .filter(function(v) { return v.prestador_id === p.id && v.empreendimento_id; })
            .map(function(v) { return v.empreendimentos ? v.empreendimentos.nome : null; })
            .filter(Boolean);

        if (p.tipo === 'imobiliaria') {
            administradoras.push({ id: p.id, nome: p.nome, docTipo: p.doc_tipo, documento: p.documento, taxaAdm: p.taxa_adm || 0, escopo: '' });
        } else if (p.tipo === 'sindico') {
            sindicos.push({ id: p.id, nome: p.nome, docTipo: p.doc_tipo, documento: p.documento, nomeContato: p.contato_nome, whatsapp: p.whatsapp, email: p.email, empreendimentos: nomesEmpreendimentos });
        } else if (p.tipo === 'manutencista') {
            manutencistas.push({ id: p.id, nome: p.nome, whatsapp: p.whatsapp, empreendimentos: nomesEmpreendimentos });
        }

    });

    return { administradoras: administradoras, sindicos: sindicos, manutencistas: manutencistas };

}

// ============================================================================
// ETAPA 3 (migração de dados) — camada de adaptação Supabase para PESSOAS
// (sócios + usuários do sistema, unificados — ver documento de arquitetura)
// ============================================================================
export async function carregarPessoasSupabase() {
    const { data, error } = await dbAuth.from('pessoas').select('*').eq('cliente_id', CLIENTE_ID_SUPABASE);
    if (error) throw error;
    return (data || []).map(function(row) {
        return {
            id: row.id,
            nome: row.nome,
            email: row.email,
            whatsapp: row.whatsapp,
            funcao: row.funcao,
            fotoUrl: row.foto_url,
            percentualCotasEmpresa: row.percentual_cotas_empresa,
            comunicacoes: row.comunicacoes || [],
            userId: row.user_id,
            perfil: row.perfil
        };
    });
}

export async function carregarEmpreendimentosSupabase() {
    const { data, error } = await dbAuth.from('empreendimentos').select('*').eq('cliente_id', CLIENTE_ID_SUPABASE).order('nome');
    if (error) throw error;
    return data || [];
}

export async function carregarTiposImovelSupabase() {
    const { data, error } = await dbAuth.from('tipos_imovel').select('*').eq('cliente_id', CLIENTE_ID_SUPABASE).order('nome');
    if (error) throw error;
    return data || [];
}

// ============================================================================
// MINUTAS DE CONTRATO — camada de adaptação Supabase (v1.42.0)
// ============================================================================
export async function carregarMinutasContratoSupabase() {
    const { data, error } = await dbAuth
        .from('minutas_contrato')
        .select('*')
        .eq('cliente_id', CLIENTE_ID_SUPABASE)
        .eq('ativa', true);
    if (error) throw error;
    return (data || []).map(function(row) {
        return {
            id: row.id,
            nome: row.nome,
            escopo: row.escopo,
            empreendimentoId: row.empreendimento_id || null,
            tipoImovelId: row.tipo_detalhe_id || row.tipo_imovel_id || null,
            imovelId: row.ativo_id || row.imovel_id || null,
            arquivoUrl: row.arquivo_url || null,
            arquivoNome: row.arquivo_nome || null,
            arquivoVersao: row.arquivo_versao || 1,
            ativa: row.ativa
        };
    });
}

export async function carregarLinksVitrineSupabase() {
    const { data, error } = await dbAuth.from('links_vitrine').select('*').eq('cliente_id', CLIENTE_ID_SUPABASE);
    if (error) throw error;
    return (data || []).map(function(row) {
        const criadoEmBrasilia = new Date(row.criado_em).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
        return {
            token: row.token,
            ids: (row.imovel_ids || []).join(','),
            criadoEm: row.criado_em,
            criadoEmBrasilia: criadoEmBrasilia,
            qtdImoveis: (row.imovel_ids || []).length
        };
    });
}

export async function carregarLogsSupabase(limite, filtros) {
    let query = dbAuth
        .from('log_acessos')
        .select('*, pessoas(nome)')
        .eq('cliente_id', CLIENTE_ID_SUPABASE)
        .order('criado_em', { ascending: false })
        .limit(limite || 200);

    if (filtros) {
        if (filtros.pessoaId) query = query.eq('pessoa_id', filtros.pessoaId);

        // Combina Área (entidade) + Ação, do jeito que o dado é gravado
        // ("imoveis.criar"). Se só a ação for escolhida (ex.: "criar"),
        // busca qualquer área terminando com essa ação — ou a ação exata,
        // para os casos sem ponto (login/logout).
        if (filtros.entidade && filtros.acao) {
            query = query.eq('acao', filtros.entidade + '.' + filtros.acao);
        } else if (filtros.entidade) {
            query = query.ilike('acao', filtros.entidade + '.%');
        } else if (filtros.acao) {
            query = query.or(`acao.eq.${filtros.acao},acao.ilike.%.${filtros.acao}`);
        }

        if (filtros.dataInicio) query = query.gte('criado_em', filtros.dataInicio + 'T00:00:00');
        if (filtros.dataFim) query = query.lte('criado_em', filtros.dataFim + 'T23:59:59');
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(function(row) {
        return {
            id: row.id,
            pessoaId: row.pessoa_id,
            pessoaNome: row.pessoas ? row.pessoas.nome : '(desconhecido)',
            acao: row.acao,
            detalhe: row.detalhe,
            criadoEm: row.criado_em
        };
    });
}

// Resolve o link público (token -> imóveis), SEM LOGIN — usada pela vitrine
// externa. Uma única consulta, já filtrada pelo próprio banco (RLS): o
// visitante nunca recebe o portfólio inteiro, só os imóveis daquele link
// específico. Substitui as DUAS chamadas antigas ao Apps Script (resolver
// token + buscar todos os imóveis para filtrar no navegador).
//
// v1.188.1 (Onda 12, E15.3 — pedido explícito 16/09/2026: "siga direto
// pra apontar a vitrine pra tabela de ativos, mesmo que quebre
// momentaneamente, não há consumo real de cliente hoje pra vitrine")
// — fonte trocada de `imoveis` pra `cofre_ativos`. RLS pública nova
// (migration e15_3_vitrine_publica_cofre_ativos_v1) + GRANT SELECT
// pra anon (e15_3_grants_anon_cofre_ativos_empreendimentos, faltava
// de origem — RLS sozinha não basta, tabela nunca tinha GRANT pra
// anon). idsDoLink continua sendo o MESMO uuid de sempre — é
// literalmente imoveis.id, que é também cofre_ativos.entidade_
// origem_id; links_vitrine não mudou nada. Campos que só existiam em
// `imoveis` e não têm mais consumidor de verdade (condominio/iptu —
// viraram item de controle automático; tipo — vem de ativo_tipos
// agora) saíram do retorno; energia_disponivel/aluguel vêm de
// dados_especificos (mesmo lugar que o formulário unificado já
// grava, E15.2.1); fotos vêm de cofre_ativo_fotos (publicar_vitrine),
// não mais de imoveis.fotos — alternarPublicarVitrineFoto()
// (cofre-api.js) simplificada junto, parou de escrever em `imoveis`.
// Achado no caminho: `status_imovel_enum` nem tem o valor 'vendido' —
// a regra antiga não tinha como excluir um imóvel vendido da
// vitrine; a nova filtra cofre_ativos.status='ativo' na própria RLS.
export async function resolverVitrinePublicaSupabase(token) {
    // Lida por fn_vitrine_publica_obter: confere o link e devolve só os campos da página.
    // A leitura direta das tabelas não serve ao visitante sem login (as regras usam
    // meus_clientes(), fechada para anon). Aceita links com id do ativo e com id antigo. (dem 5a84b9aa)
    const { data, error } = await dbAuth.rpc('fn_vitrine_publica_obter', { p_token: token });
    if (error) throw error;
    if (!data || !data.ok) throw new Error('Link não encontrado ou expirado.');
    window.__rzVitrinePublicaEmpresa = data.empresa || '';
    return (data.imoveis || []).map(function(row) {
        return {
            id: row.id,
            nomeExibicao: row.nome || '',
            empreendimento: row.empreendimento || '',
            enderecoRua: row.endereco_rua || '',
            enderecoNum: row.endereco_num || '',
            enderecoComp: row.endereco_comp || '',
            enderecoBairro: row.endereco_bairro || '',
            enderecoCidade: row.endereco_cidade || '',
            tipo: row.tipo || '',
            tamanho: Number(row.area_m2) || 0,
            descricao: row.descricao || '',
            energiaRumo: row.energia ? 'Sim' : 'Não',
            valor: Number(row.aluguel) || 0,
            fotos: (row.fotos || []).map(function(caminho) { return dbAuth.storage.from('imoveis-fotos').getPublicUrl(caminho).data.publicUrl; }),
            status: mapStatusSupabaseParaAntigo(row.situacao_uso)
        };
    });
}

// ----------------------------------------------------------------------------
// Os 9 escritores (sincronizar*), como estavam no index.html — Onda 1b-1
// ----------------------------------------------------------------------------

// Onda 12 (16/09/2026, pedido explícito: "quero que exista já
// definitivamente apenas um caminho de escrita, na tabela de
// ativos... imoveis totalmente isolada") — grava em cofre_ativos
// agora, não mais em `imoveis`. `imo.id` já É o id do ativo desde
// que carregarImoveisSupabase() trocou de fonte — não precisa
// mais resolver ativo_id por uma busca à parte, simplifica o
// resto da função também.
export async function sincronizarImovelSupabase(imo) {

    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(imo.id || '')) {
        throw new Error('sincronizarImovelSupabase: id de imóvel inválido — esta função só atualiza um imóvel já existente.');
    }

    const linha = {
        endereco_rua: imo.enderecoRua,
        endereco_num: imo.enderecoNum,
        endereco_comp: imo.enderecoComp,
        endereco_bairro: imo.enderecoBairro,
        endereco_cidade: imo.enderecoCidade,
        finalidade_uso: imo.finalidadeUso || 'long_stay',
        area_m2: imo.tamanho || null,
        situacao_uso: mapStatusAntigoParaSupabase(imo.status),
        observacao: imo.descricao || null,
        valor_referencia: imo.valorMercado || null
    };

    const { error } = await dbAuth.from('cofre_ativos').update(linha).eq('id', imo.id);
    if (error) throw error;
    const ativoId = imo.id;

    const nomesDivisao = Object.keys(imo.divisao || {});
    let linhasPropriedade = [];
    if (nomesDivisao.length > 0) {
        const { data: pessoasCliente } = await dbAuth.from('pessoas').select('id, nome').eq('cliente_id', CLIENTE_ID_SUPABASE);
        linhasPropriedade = nomesDivisao.map(function(nome) {
            // Casamento por nome completo OU só o primeiro nome — o formulário usa
            // nomes curtos (ex.: SOCIO_PADRAO = "Nicola"), mas pessoas.nome guarda o
            // nome completo ("Nicola Santos Dutra"). Sem isso, a comparação exata
            // nunca batia, e a divisão do sócio padrão nunca era gravada.
            const pessoaEncontrada = (pessoasCliente || []).find(function(p) {
                return p.nome === nome || p.nome.split(' ')[0] === nome;
            });
            return pessoaEncontrada
                ? { tipo_proprietario: 'socio_interno', pessoa_id: pessoaEncontrada.id, nome_externo: '', percentual: imo.divisao[nome] }
                : { tipo_proprietario: 'terceiro_externo', pessoa_id: '', nome_externo: nome, percentual: imo.divisao[nome] };
        });
    }

    // v1.101.0 (02/09/2026) — substituir_propriedade_ativo, mesma
    // RPC que o chip Propriedade (Ativos) e o popup "Divisão
    // Societária" usam, fonte única. ativoId já é o id certo —
    // Onda 12 tirou a busca extra que existia aqui antes.
    const { error: errProp } = await dbAuth.rpc('substituir_propriedade_ativo', {
        p_ativo_id: ativoId,
        p_linhas: linhasPropriedade
    });
    if (errProp) throw errProp;

    return ativoId;
}

export async function sincronizarImoveisSupabase(listaImoveis) {
    return sincronizarListaComResiliencia(listaImoveis, sincronizarImovelSupabase, 'imóvel');
}

// Onda 12 (16/09/2026, pedido explícito: "quero que exista já
// definitivamente apenas um caminho de escrita, na tabela de
// ativos") — grava ativo_id agora, não mais imovel_id.
// con.imovelId já É o id do ativo (mesmo campo de sempre — não
// renomeado — mas carregarImoveisSupabase()/"Qual imóvel?" no
// formulário de contrato agora populam com cofre_ativos.id, não
// mais imoveis.id, desde que a leitura trocou de fonte). Contrato
// novo nasce com imovel_id null pra sempre; contrato antigo (pré-
// Onda 12) mantém o imovel_id que já tinha — não é tocado aqui,
// só não recebe mais escrita nova.
export async function sincronizarContratoSupabase(con) {

    const linha = {
        cliente_id: CLIENTE_ID_SUPABASE,
        ativo_id: /^[0-9a-f]{8}-/i.test(con.imovelId || '') ? con.imovelId : null,
        status: mapStatusContratoAntigoParaSupabase(con.status),
        locatario: con.locatario,
        doc_tipo: con.docTipo || null,
        cpf: con.cpf || null,
        vencimento_dia: con.vencimentoDia || null,
        aluguel_antecipado: con.alugelAntecipado === 'Sim',
        whatsapp: con.whatsapp || null,
        email: con.email || null,
        // CORRIGIDO (bug real, achado 30/08/2026 durante a entrega
        // de Fiadores): estes 3 campos existem no formulário (dnc-
        // endereco/profissao/estado-civil), existem na tabela
        // contratos, e eram lidos em contratoDados — mas nunca
        // chegavam a entrar nesta `linha` persistida. Ficavam só
        // na memória local da sessão; qualquer preenchimento se
        // perdia ao recarregar a página. Usado por
        // montarValoresPlaceholdersMinuta() — sem isso, o
        // placeholder do locatário na minuta ficava vazio depois
        // do primeiro reload, mesmo tendo sido preenchido.
        locatario_endereco_atual: con.locatarioEnderecoAtual || null,
        locatario_profissao: con.locatarioProfissao || null,
        locatario_estado_civil: con.locatarioEstadoCivil || null,
        inicio: con.inicio || null,
        fim: con.fim || null,
        valor: con.valor || null,
        valor_anterior: con.valorAnterior || null,
        reajuste_aplicado: !!con.reajusteAplicado,
        reajuste: con.reajuste || null,
        // v1.27.0 (Bloco B, demandas 5ca973d6/854f6343) — undefined/''
        // (con.* já vem null do saveContrato quando o campo está em
        // branco) grava null, nunca 0 — o trigger
        // trg_contrato_gera_itens_reajuste_revisional só cria item
        // quando periodicidade/revisional NÃO é null.
        reajuste_periodicidade_meses: con.reajustePeriodicidadeMeses ?? null,
        reajuste_teto_pct: con.reajusteTetoPct ?? null,
        reajuste_piso_pct: con.reajustePisoPct ?? null,
        revisional_periodicidade_meses: con.revisionalPeriodicidadeMeses ?? null,
        iptu: con.iptuValor || null,
        condominio: con.condominioValor || null,
        contato_nome: con.contatoNome || null,
        forma_pagamento: con.formaPagamento || null,
        desconto_energia: con.descontoEnergia || null,
        condominio_locatario: con.condominioLocatario === 'Sim',
        locatario_paga_iptu: con.locatarioPagaIptu === 'Sim',
        administradora_id: /^[0-9a-f]{8}-/i.test(con.administradoraId || '') ? con.administradoraId : null,
        descricao: con.descricao || null
    };

    const idEhUuidValido = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(con.id || '');

    let contratoId;
    if (idEhUuidValido) {
        const { error } = await dbAuth.from('contratos').update(linha).eq('id', con.id);
        if (error) throw error;
        contratoId = con.id;
    } else {
        const { data: inserido, error } = await dbAuth.from('contratos').insert(linha).select('id').single();
        if (error) throw error;
        contratoId = inserido.id;
        con.id = contratoId;
    }

    // Histórico: grava só as entradas que ainda não têm confirmação de já
    // terem sido persistidas (marcadas com _salvo=true em memória depois
    // do primeiro save) — evita duplicar entradas antigas a cada edição.
    const entradasNovas = (con.historico || []).filter(function(h) { return !h._salvo; });
    for (const entrada of entradasNovas) {
        // CORRIGIDO v1.207.0 (demanda item 12/paridade) — uma edição
        // genérica que muda "Valor do aluguel" é, na prática, um
        // reajuste: precisa nascer com tipo='reajuste' (não
        // 'alteracao') pra sobreviver ao reload (carregarContratosSupabase
        // reconstrói `alteracoes` a partir só de h.tipo) e pro bot
        // (fn_diario_contratos_aniversario_reajuste) reconhecer a
        // revisão. Sem isso, tanto o App quanto o bot voltavam a
        // contar os 12 meses do zero depois de qualquer reload.
        const mudouValorAluguel = (entrada.alteracoes || []).some(function(a) { return a.campo === 'Valor do aluguel'; });
        const tipo = (entrada.alteracoes || []).some(function(a) { return a.campo === 'Contrato criado'; })
            ? 'assinatura'
            : mudouValorAluguel
                ? 'reajuste'
                : 'alteracao';
        const descricaoTexto = (entrada.alteracoes || [])
            .map(function(a) { return `${a.campo}: ${a.de} → ${a.para}`; })
            .join('; ');
        const { error: errHist } = await dbAuth.from('historico_contrato').insert({
            contrato_id: contratoId,
            tipo: tipo,
            descricao: descricaoTexto + (entrada.vigenteDesde ? ` (vigente desde ${entrada.vigenteDesde})` : '')
        });
        if (errHist) throw errHist;
        entrada._salvo = true;
    }

    // CORRIGIDO (bug real — documento anexado "sumia" ao atualizar a
    // página): não existia nenhuma gravação de "anexos" no banco — o
    // upload ia para o Storage, mas a URL nunca era salva em lugar
    // nenhum, só ficava na memória do navegador. Cada anexo novo vira
    // uma entrada de histórico (tipo "anexo"), a mesma tabela que já
    // guarda o resto do histórico do contrato.
    const anexosNovos = (con.anexos || []).filter(function(a) { return !a._salvo; });
    for (const anexo of anexosNovos) {
        const { error: errAnexo } = await dbAuth.from('historico_contrato').insert({
            contrato_id: contratoId,
            tipo: 'anexo',
            descricao: 'Documento anexado: ' + (anexo.nome || 'arquivo') + (anexo.tipo ? ' (' + anexo.tipo + ')' : ''),
            anexo_url: anexo.url || anexo.base64 || null
        });
        if (errAnexo) throw errAnexo;
        anexo._salvo = true;
    }

    // Divisão de repasse do contrato — mesma técnica de RPC (uma única
    // transação) usada em propriedade_imovel. Só grava se houver algo
    // (contrato sem divisão específica não mexe na tabela).
    if (con.divisaoRepasse && con.divisaoRepasse.length > 0) {
        const { data: pessoasCliente } = await dbAuth.from('pessoas').select('id, nome').eq('cliente_id', CLIENTE_ID_SUPABASE);
        const linhasDivisao = con.divisaoRepasse.map(function(d) {
            const pessoaEncontrada = (pessoasCliente || []).find(function(p) {
                return p.nome === d.nome || p.nome.split(' ')[0] === d.nome;
            });
            return pessoaEncontrada
                ? { tipo_beneficiario: 'socio_interno', pessoa_id: pessoaEncontrada.id, nome_externo: '', percentual: d.percentual }
                : { tipo_beneficiario: 'terceiro_externo', pessoa_id: '', nome_externo: d.nome, percentual: d.percentual };
        });

        const { error: errDiv } = await dbAuth.rpc('substituir_divisao_repasse_contrato', {
            p_contrato_id: contratoId,
            p_linhas: linhasDivisao
        });
        if (errDiv) throw errDiv;
    }

    // NOVO (30/08/2026) — Fiadores, mesmo padrão de divisaoRepasse
    // acima (RPC "substituir por completo"). Só mexe na tabela
    // quando con.fiadores vier definido (a trava em saveContrato()
    // garante isso só acontece quando fiadoresContratoAtual
    // realmente pertence a ESTE contrato) — undefined (não veio
    // deste fluxo) não toca em nada, evita apagar fiador já salvo
    // por engano num save vindo de outro caminho.
    if (Array.isArray(con.fiadores)) {
        const linhasFiadores = con.fiadores.map(function(f, i) {
            return Object.assign({}, f, { ordem: i + 1 });
        });
        const { error: errFiadores } = await dbAuth.rpc('substituir_fiadores_contrato', {
            p_contrato_id: contratoId,
            p_cliente_id: CLIENTE_ID_SUPABASE,
            p_linhas: linhasFiadores
        });
        if (errFiadores) throw errFiadores;
    }

    // v1.270.0 (demanda 11afd25f) — vincula/atualiza a Parte do
    // locatário (partes + partes_papeis, papel='locatario'), a mesma
    // tabela genérica que abrirFichaParteDoContrato() já usa pra abrir
    // a ficha da parte. Nunca apaga a Parte, só cria/atualiza; erro
    // aqui não derruba o salvamento do contrato (best-effort).
    if (con.locatario && con.cpf) {
        try {
            const { data: papelLocatario } = await dbAuth.from('partes_papeis')
                .select('parte_id')
                .eq('entidade_tipo', 'contrato').eq('entidade_id', contratoId)
                .eq('papel', 'locatario').eq('ativo', true).limit(1).maybeSingle();

            const dadosParteLocatario = {
                cliente_id: CLIENTE_ID_SUPABASE,
                nome: con.locatario,
                doc_tipo: con.docTipo || null,
                documento: con.cpf || null,
                whatsapp: con.whatsapp || null,
                email: con.email || null,
                contato_nome: con.contatoNome || null,
                profissao: con.locatarioProfissao || null,
                estado_civil: con.locatarioEstadoCivil || null,
                endereco: con.locatarioEnderecoAtual || null,
            };

            // v1.272.0 (demanda 3b458eb4) — quando o popup "Dados
            // Novo Contrato" leu o endereço pelo bloco estruturado
            // (comum-endereco.js), contratos.js manda os campos
            // também em con.enderecoLocatarioEstruturado, nas
            // mesmas colunas de `partes`. Só entra no UPDATE/
            // INSERT quando vier preenchido — nunca apaga o que já
            // estava salvo (editar sem tocar no endereço, ou
            // salvar por outro caminho sem CEP).
            const enderecoEstruturado = con.enderecoLocatarioEstruturado;
            if (enderecoEstruturado && (enderecoEstruturado.endereco_rua || enderecoEstruturado.endereco_cidade)) {
                ['endereco_rua', 'endereco_num', 'endereco_comp', 'endereco_bairro', 'endereco_cidade', 'uf', 'cep', 'codigo_ibge_municipio'].forEach(function(campo) {
                    if (enderecoEstruturado[campo]) dadosParteLocatario[campo] = enderecoEstruturado[campo];
                });
            }

            if (papelLocatario && papelLocatario.parte_id) {
                const { error: errParteUpd } = await dbAuth.from('partes').update(dadosParteLocatario).eq('id', papelLocatario.parte_id);
                if (errParteUpd) throw errParteUpd;
            } else {
                const { data: parteNovaLocatario, error: errParteIns } = await dbAuth.from('partes').insert(dadosParteLocatario).select('id').single();
                if (errParteIns) throw errParteIns;
                const { error: errPapelIns } = await dbAuth.from('partes_papeis').insert({
                    parte_id: parteNovaLocatario.id, papel: 'locatario',
                    entidade_tipo: 'contrato', entidade_id: contratoId, ativo: true,
                });
                if (errPapelIns) throw errPapelIns;
            }
        } catch (errParteLocatario) {
            logScreen('Aviso: falha ao sincronizar a Parte do locatário: ' + errParteLocatario.message, true);
        }
    }

    // v1.27.0 (Bloco B, demandas 5ca973d6/854f6343, pedido explícito
    // do Nicola: "ali mesmo no form já preencher o que precisa pro
    // item ser gerado") — best-effort (mesmo padrão de
    // substituir_divisao_repasse_contrato/substituir_fiadores_contrato
    // acima): a trigger do banco (trg_contrato_gera_itens_reajuste_revisional)
    // já chama isso sozinha a cada INSERT/UPDATE de reajuste/
    // reajuste_periodicidade_meses/revisional_periodicidade_meses —
    // esta chamada aqui é só pra não depender do próximo reload da
    // ficha pra aparecer na "Linha do tempo": o retorno da RPC não
    // é usado, erro aqui não derruba o salvamento do contrato (o
    // item continua sendo gerado pela trigger, só não aparece já
    // na tela sem um refresh).
    try {
        await dbAuth.rpc('fn_contrato_itens_controle_gerar', { p_contrato_id: contratoId });
    } catch (errItensControle) {
        logScreen('Aviso: falha ao gerar itens de controle de reajuste/revisional: ' + errItensControle.message, true);
    }

    return contratoId;

}

export async function sincronizarContratosSupabase(lista) {
    return sincronizarListaComResiliencia(lista, sincronizarContratoSupabase, 'contrato');
}

export async function sincronizarMensalidadeSupabase(men) {
    const linha = {
        cliente_id: CLIENTE_ID_SUPABASE,
        contrato_id: /^[0-9a-f]{8}-/i.test(men.contratoId || '') ? men.contratoId : null,
        competencia: competenciaParaData(men.referencia),
        status: mapStatusMensalidadeAntigoParaSupabase(men.status),
        banco: men.banco || null,
        data_pgto: converterDataBRparaISO(men.dataPgto),
        observacao: men.observacao || null,
        observacao_recibo: men.observacaoRecibo || null,
        valor_confirmado: men.valorConfirmado || null,
        valor_energia: men.valorEnergia || null,
        valor_iptu: men.valorIptu || null,
        valor_condominio: men.valorCondominio || null,
        ...(men.multaEncargos !== undefined ? { multa_encargos: men.multaEncargos } : {}), // v1.295.0 (RF-05) — só grava quando o fluxo mexeu
        // v1.260.0 (demanda d92a6dfc) — só grava quando a tela de
        // origem preencheu o par (rzAbrirBaixaMensalidade); se vier
        // undefined (outros fluxos que chamam esta função sem mexer
        // em bruto/taxa, ex. conciliação), não sobrescreve o que já
        // está gravado — por isso o "!== undefined", não "|| null".
        ...(men.valorBruto !== undefined ? { valor_bruto: men.valorBruto } : {}),
        ...(men.valorTaxaAdm !== undefined ? { valor_taxa_adm: men.valorTaxaAdm } : {}),
        ...(men.valorBrutoEstimado !== undefined ? { valor_bruto_estimado: men.valorBrutoEstimado } : {}),
        chave_transacao_origem: men.chaveTransacaoOrigem || null,
        // CORRIGIDO (bug real — "Log: Notificado via undefined (undefined)"
        // aparecendo mesmo sem nunca ter enviado nada): o padrão aqui era
        // "[]" (array vazio) em vez de null. Um array vazio é "verdadeiro"
        // em JavaScript, então a tela sempre achava que existia log
        // (checava só "if (men.envioLog)"), e tentava ler .canal/.data de
        // um array — que não tem essas propriedades, daí "undefined".
        envio_log: (men.envioLog && !Array.isArray(men.envioLog)) ? men.envioLog : null
    };

    const idEhUuidValido = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(men.id || '');

    if (idEhUuidValido) {
        const { error } = await dbAuth.from('mensalidades').update(linha).eq('id', men.id);
        if (error) throw error;
        return men.id;
    } else {
        const { data: inserido, error } = await dbAuth.from('mensalidades').insert(linha).select('id').single();
        if (error) throw error;
        men.id = inserido.id;
        return inserido.id;
    }
}

export async function sincronizarMensalidadesSupabase(lista) {
    return sincronizarListaComResiliencia(lista, sincronizarMensalidadeSupabase, 'mensalidade');
}

export async function sincronizarRepasseSupabase(rep) {
    const pessoaId = await obterPessoaIdPorNome(rep.socio);

    const linha = {
        cliente_id: CLIENTE_ID_SUPABASE,
        pessoa_id: pessoaId,
        competencia: competenciaParaData(rep.mes),
        valor: rep.valor || null,
        data_real: converterDataBRparaISO(rep.dataReal),
        // v1.178.8 — achado GRAVE do Nicola (repasses de sócio nunca
        // conciliavam sozinhos): o trigger de espelho (Etapa 3,
        // fn_repasse_espelha_fingerprint) sempre soube conciliar via
        // chave_transacao_origem — mas esta função nunca gravava esse
        // campo no INSERT, só existia no objeto em memória
        // (rep.chaveTransacaoOrigem). O dado nunca chegava no banco;
        // o trigger sempre via NULL e nunca conciliava. Repasse
        // lançado manualmente (sem origem de extrato) continua null,
        // sem problema — só não teria mesmo o que conciliar sozinho.
        chave_transacao_origem: rep.chaveTransacaoOrigem || null
    };

    const idEhUuidValido = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rep.id || '');

    if (idEhUuidValido) {
        const { error } = await dbAuth.from('repasses').update(linha).eq('id', rep.id);
        if (error) throw error;
        return rep.id;
    } else {
        const { data: inserido, error } = await dbAuth.from('repasses').insert(linha).select('id').single();
        if (error) throw error;
        rep.id = inserido.id;
        return inserido.id;
    }
}

export async function sincronizarRepassesSupabase(lista) {
    return sincronizarListaComResiliencia(lista, sincronizarRepasseSupabase, 'repasse');
}

export async function sincronizarMinutaContratoSupabase(item) {
    const idEhUuidValido = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id || '');

    const linha = {
        cliente_id: CLIENTE_ID_SUPABASE,
        nome: item.nome,
        escopo: item.escopo || 'geral',
        empreendimento_id: item.empreendimentoId || null,
        tipo_detalhe_id: item.tipoImovelId || null,
        ativo_id: item.imovelId || null,
        arquivo_url: item.arquivoUrl || null,
        arquivo_nome: item.arquivoNome || null,
        arquivo_versao: item.arquivoVersao || 1,
        ativa: item.ativa !== false
    };

    if (idEhUuidValido) {
        const { error } = await dbAuth.from('minutas_contrato').update(linha).eq('id', item.id);
        if (error) throw error;
        return item.id;
    } else {
        const { data: inserido, error } = await dbAuth.from('minutas_contrato').insert(linha).select('id').single();
        if (error) throw error;
        item.id = inserido.id;
        return inserido.id;
    }
}

export async function sincronizarMinutasContratoSupabase(lista) {
    return sincronizarListaComResiliencia(lista, sincronizarMinutaContratoSupabase, 'minuta');
}

export async function sincronizarPrestadorSupabase(item, tipoPrestador) {

    const idEhUuidValido = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id || '');

    const linha = {
        cliente_id: CLIENTE_ID_SUPABASE,
        tipo: tipoPrestador,
        pessoa_fisica_juridica: (item.docTipo === 'CNPJ') ? 'juridica' : 'fisica',
        nome: item.nome,
        doc_tipo: item.docTipo || null,
        documento: item.documento || null,
        contato_nome: item.nomeContato || null,
        whatsapp: item.whatsapp || null,
        email: item.email || null,
        taxa_adm: (item.taxaAdm === undefined || item.taxaAdm === null || item.taxaAdm === '') ? null : item.taxaAdm
    };

    let prestadorId;
    if (idEhUuidValido) {
        const { error } = await dbAuth.from('prestadores').update(linha).eq('id', item.id);
        if (error) throw error;
        prestadorId = item.id;
    } else {
        const { data: inserido, error } = await dbAuth.from('prestadores').insert(linha).select('id').single();
        if (error) throw error;
        prestadorId = inserido.id;
        item.id = prestadorId;
    }

    // Vínculo com empreendimentos — só se aplica a síndico e manutencista
    // (administradora se liga por contrato, ainda não migrado).
    if (tipoPrestador === 'sindico' || tipoPrestador === 'manutencista') {

        const nomesEmpreendimentos = item.empreendimentos || [];
        const hoje = new Date().toISOString().split('T')[0];
        const idsEmpreendimentosAtuais = [];

        for (const itemEmp of nomesEmpreendimentos) {

            // CORRIGIDO (bug real — vínculo de síndico/manutencista nunca
            // era gravado): lerChecksEmpreendimentosSindico() manda um
            // array de OBJETOS ({empreendimentoId, dataInicio, dataFim}),
            // mas aqui embaixo o código comparava como se fosse um array
            // de textos puros — a comparação nunca batia com nada, e todo
            // vínculo era silenciosamente ignorado (só aparecia no log).
            const nomeEmp = (typeof itemEmp === 'string') ? itemEmp : itemEmp.empreendimentoId;

            const empreendimentoObj = empreendimentosCadastrados.find(function(e) { return e.nome === nomeEmp; });
            if (!empreendimentoObj) {
                logScreen(`Empreendimento "${nomeEmp}" não encontrado em Parametrizações — vínculo ignorado.`, true);
                continue;
            }
            const empreendimentoId = empreendimentoObj.id;
            idsEmpreendimentosAtuais.push(empreendimentoId);

            const { data: vinculoExistente } = await dbAuth
                .from('prestador_vinculo')
                .select('id')
                .eq('prestador_id', prestadorId)
                .eq('empreendimento_id', empreendimentoId)
                .is('data_fim_vigencia', null)
                .limit(1);

            if (vinculoExistente && vinculoExistente.length > 0) continue; // já vinculado

            // Síndico: só 1 vigente por empreendimento — fecha o de outro
            // prestador antes de abrir o novo (efetiva a troca de síndico).
            if (tipoPrestador === 'sindico') {
                await dbAuth.from('prestador_vinculo')
                    .update({ data_fim_vigencia: hoje })
                    .eq('empreendimento_id', empreendimentoId)
                    .eq('tipo_prestador', 'sindico')
                    .is('data_fim_vigencia', null);
            }

            const { error: errVinc } = await dbAuth.from('prestador_vinculo').insert({
                prestador_id: prestadorId,
                tipo_prestador: tipoPrestador,
                empreendimento_id: empreendimentoId,
                data_inicio_vigencia: hoje
            });
            if (errVinc) throw errVinc;

        }

        // Empreendimentos desmarcados na tela: fecha a vigência (preserva
        // histórico em vez de apagar a linha).
        const { data: vinculosAtivos } = await dbAuth
            .from('prestador_vinculo')
            .select('id, empreendimento_id')
            .eq('prestador_id', prestadorId)
            .is('data_fim_vigencia', null);

        for (const v of (vinculosAtivos || [])) {
            if (!idsEmpreendimentosAtuais.includes(v.empreendimento_id)) {
                await dbAuth.from('prestador_vinculo').update({ data_fim_vigencia: hoje }).eq('id', v.id);
            }
        }

    }

    return prestadorId;

}

export async function sincronizarAdministradorasSupabase(lista) {
    return sincronizarListaComResiliencia(lista, function(item) { return sincronizarPrestadorSupabase(item, 'imobiliaria'); }, 'administradora');
}

export async function sincronizarSindicosSupabase(lista) {
    return sincronizarListaComResiliencia(lista, function(item) { return sincronizarPrestadorSupabase(item, 'sindico'); }, 'síndico');
}

export async function sincronizarManutencistasSupabase(lista) {
    return sincronizarListaComResiliencia(lista, function(item) { return sincronizarPrestadorSupabase(item, 'manutencista'); }, 'manutencista');
}

// ----------------------------------------------------------------------------
// Despacho com guarda por chamada (v1.1.0, ampliado na v1.2.0)
// ----------------------------------------------------------------------------
// A ponte do index chama chamar(nome, args) em vez de m[nome](...args). O motivo é
// a guarda: 13 dos 14 leitores filtram por CLIENTE_ID_SUPABASE e não fazem sentido
// sem ele; chamados com null devolveriam lista VAZIA em silêncio, que é o pior
// desfecho possível — tela vazia sem erro, ninguém sabe por quê. Aqui falham com o
// nome do leitor. O único que dispensa cliente_id é resolverVitrinePublicaSupabase:
// é lido por fn_vitrine_publica_obter, com RLS própria, e roda sem sessão. (dem 6b11c602)
const SEM_CLIENTE = new Set(['resolverVitrinePublicaSupabase']);

const FUNCOES = {
    // leitura (Onda 1a)
    carregarImoveisSupabase, carregarContratosSupabase, carregarMensalidadesSupabase,
    carregarRepassesSupabase, carregarLancamentosSupabase, carregarPrestadoresSupabase,
    carregarPessoasSupabase, carregarEmpreendimentosSupabase, carregarTiposImovelSupabase,
    carregarMinutasContratoSupabase, carregarLinksVitrineSupabase, carregarLogsSupabase,
    resolverVitrinePublicaSupabase,
    // escrita (Onda 1b-1)
    sincronizarImovelSupabase, sincronizarImoveisSupabase,
    sincronizarContratoSupabase, sincronizarContratosSupabase,
    sincronizarMensalidadeSupabase, sincronizarMensalidadesSupabase,
    sincronizarRepasseSupabase, sincronizarRepassesSupabase,
    sincronizarMinutaContratoSupabase, sincronizarMinutasContratoSupabase,
    sincronizarPrestadorSupabase, sincronizarAdministradorasSupabase,
    sincronizarSindicosSupabase, sincronizarManutencistasSupabase
};

export function chamar(nome, args) {
    const fn = FUNCOES[nome];
    if (!fn) throw new Error('[porta] leitor desconhecido: ' + nome);
    if (!dbAuth) throw new Error('[porta] ' + nome + ' antes de instalarPorta (sem db)');
    if (!CLIENTE_ID_SUPABASE && !SEM_CLIENTE.has(nome)) {
        throw new Error('[porta] ' + nome + ' sem CLIENTE_ID_SUPABASE — chamado antes de entrar numa empresa');
    }
    return fn(...args);
}
