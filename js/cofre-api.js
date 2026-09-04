// ============================================================================
// cofre-api.js — Raiz Patrimônio · Cofre de Documentos
// Versão: 1.16.0 · 04/09/2026
//
// v1.16.0 — reaproveita window.__raizDbAuth quando roda dentro do App
// (GoTrueClient duplicado, fatia 7). Standalone inalterado.
//
// v1.15.0 — gerarSignedUrl resolve bucket 'externo' (URL como está) e
// 'imoveis-fotos' (público, getPublicUrl) — fotos migradas do cadastro antigo.
//
// v1.14.0 — funções novas pro chip "Partes" do item de controle:
// listarPartesCliente (todas as partes do cliente, não só sócios
// internos), buscarPartesDoItemControle/salvarPartesItemControle (RPCs
// fn_partes_do_item_controle/substituir_partes_item_controle),
// criarParteRapida (nome só, mesmo espírito do fornecedor "+ Novo" do
// popup de despesa em index.html).
//
// v1.13.0 — salvarPropriedadeImovel() removida (função morta desde a
// v1.12.0 — nada mais chamava). Comentários da função de leitura
// corrigidos (não decide mais entre 2 tabelas, só lê propriedade_ativo).
//
// v1.12.0 — listarPessoasInternas() ganhou percentual_cotas_empresa no
// select (pedido explícito: formulário de Novo Ativo precisa pré-popular
// a divisão societária com o sócio de maior cota, mesmo default do
// formulário antigo de imóvel). salvarPropriedadeImovel() mantida no
// arquivo mas sem chamador ativo agora (chip passou a gravar só em
// propriedade_ativo, "no chip de propriedade, só apresente o dos
// ativos") — não removida porque a RPC por trás (substituir_propriedade_
// imovel) continua ativa noutro lugar do App (popup "Divisão Societária"
// da ficha antiga do imóvel) e pode ser útil se esse popup for corrigido
// (ver achado reportado ao Nicola: hoje ele grava num campo
// imoveis.divisao que não existe no schema — bug pré-existente, não
// desta sessão).
//
// v1.11.0 — chip "Propriedade" (NOVO, pedido explícito: "todos os
// ativos devem ter a definição da propriedade com % de sócio na tabela
// correspondente"): buscarPropriedadeDoAtivo() (lê fn_propriedade_do_ativo,
// que decide sozinha propriedade_imovel vs propriedade_ativo),
// salvarPropriedadeAtivo()/salvarPropriedadeImovel() (escrita, 1 RPC
// cada, nenhuma reescrita da lógica existente pro caso imóvel),
// listarPessoasInternas() (sócios internos pro seletor do editor).
//
// v1.10.0 — buscarFluxoFinanceiroAtivo(ativoId): nova, pedido explícito
// ("adicione a um ativo um novo chip de fluxo financeiro"). Chama a RPC
// fn_fluxo_financeiro_ativo (nova, SECURITY INVOKER — RLS de cliente_id
// já existente em mensalidades/contratos/lancamentos/partes faz o
// isolamento sozinha, sem precisar elevar privilégio). Só LEITURA — a
// escrita (novo lançamento) não duplica lógica aqui, é sempre uma ponte
// pra abrirNovaDespesa() do App (index.html), mesmo princípio já usado
// em abrirGestaoImovel(). Testado como authenticated real antes de
// entrar (SET LOCAL ROLE authenticated + RLS), não só via este client
// SECURITY INVOKER assumido.
//
// v1.9.0 — buscarResumoImoveisParaCards(clienteId): nova, pedido
// explícito ("perdeu a formatação da lista... como referência a lista
// de imóveis antiga") — alimenta o enriquecimento visual dos cards de
// ativos do tipo imóvel na lista unificada. 1 query só (join embutido),
// nunca por card.
//
// v1.8.0 — buscarContratosDoImovel(imovelId): nova, pedido explícito
// ("evoluir a exemplo do protótipo") — alimenta a aba Contratos nova da
// ficha do ativo. Leitura pura, mesma tabela/RLS que o App já usa.
//
// v1.7.0 — buscarResumoImovelOrigem(imovelId): nova, busca uso/tipo_locacao/
// iptu/valor_mercado/codigo_iptu de imoveis — fecha a lacuna da ficha do
// ativo não trazer esses campos pra imóvel vinculado (ver changelog de
// cofre-ativos.js v1.4.0 pro consumo). Erro engolido de propósito (retorna
// null) — se o imóvel de origem não existir mais, a ficha não deve quebrar.
//
// v1.6.0 — nova marcarAtivoVendido(id): muda cofre_ativos.status pra
// 'vendido' e desativa em cascata cofre_itens_controle.alerta_ativo dos
// itens vinculados — pedido explícito do Nicola. Ver cofre-ativos.js
// v1.3.0 pro fluxo completo (confirm, toast, disparo de
// cofre:recarregar-eventos).
//
// v1.5.0 — criarSubtipoControle() e atualizarSubtipoControle() ganham
// parâmetro documentoEsperado (default false), gravado em
// cofre_controle_subtipos.documento_esperado — ver changelog de
// cofre-controles.js v1.7.0 pro fluxo completo.
//
// v1.4.2 — REVISÃO DE DESIGN (pedido explícito): listarOcorrenciasAbertasComItem()
// ganhou embed aninhado cofre_ativos(nome_exibicao, tipo_ativo) dentro
// de cofre_itens_controle — o card de alerta da Home/Alertas agora
// mostra o nome e o tipo (ícone) do ativo, não só o título do item.
//
// v1.4.1 — BUG FIX CRÍTICO (achado pelo usuário): listarOcorrenciasAbertasComItem()
// fazia um embed comum (LEFT JOIN) de cofre_itens_controle, sem !inner —
// em PostgREST isso só decide se o objeto embutido vem null ou
// preenchido, NÃO filtra a linha pai pela coluna do filho. Resultado:
// excluir um item de controle (arquivarItemControle, soft-delete —
// ativo=false, nunca mexe nas ocorrências) deixava as ocorrências
// ABERTAS desse item pra sempre nos resultados, porque nada filtrava
// por cofre_itens_controle.ativo. Corrigido com
// `cofre_itens_controle!inner(...)` + `.eq('cofre_itens_controle.ativo', true)`.
// Como esta função alimenta estado.ocorrenciasAbertas (fonte única
// consumida por Home/KPIs, card do Ativo na lista, e tela cheia de
// Alertas), 1 correção resolveu os 3 sintomas relatados de uma vez.
//
// v1.4.0 — MODELOS DE ITEM DE CONTROLE POR TIPO DE ATIVO (pedido
// explícito): listarModelosItemControle()/criarModeloItemControle() —
// mesmo padrão de escopo (global + cliente) de listarSubtiposControle.
// Depende de migration cofre_modelos_item_controle_v1.
//
// v1.3.0 — GESTÃO DE SUBTIPOS DE ITEM DE CONTROLE (pedido explícito):
// nova criarSubtipoControle() — sempre grava com cliente_id do tenant
// atual (nunca null, reservado ao catálogo-base compartilhado), codigo
// gerado por slug do nome com retry de sufixo se colidir (UNIQUE
// (cliente_id, codigo) no banco). Precisou de policy de escrita nova
// (cofre_controle_subtipos_write_policy_v1) — a tabela só tinha SELECT.
//
// v1.2.1 — BUG FIX CRÍTICO (não documentado aqui na hora — só no
// changelog do cofre.html v1.8.1; corrigido agora, tarde, mas correto):
// listarOcorrenciasAbertasComItem() selecionava `alerta_habilitado` de
// dentro de `cofre_itens_controle` — coluna que NUNCA existiu ali (é
// `alerta_ativo`; `alerta_habilitado` é de `cofre_ocorrencias_controle`,
// tabela diferente). Causava 400 Bad Request em toda carga da Visão
// Geral do Cofre. Confirmado contra o schema live do Supabase antes de
// corrigir, não o dump do projeto (pode estar desatualizado).
//
// v1.2.0 — LIMPEZA v6: removida listarOcorrenciasAbertas() duplicada
// (função correta e em uso é listarOcorrenciasAbertasComItem, de sessão
// anterior). Nova criarOcorrenciasControleBatch() — geração de múltiplas
// ocorrências de uma vez (horizonte de 120 dias, ver cofre-controles.js).
//
// v1.1.3 — CORREÇÃO DE BUG: migration_cofre_alarmes_fase1_nucleo_v1 deu
// GRANT só pra service_role nas tabelas de controle, esquecendo
// authenticated — Postgres barrava com "permission denied" antes mesmo de
// avaliar a RLS. Corrigido em migration_cofre_alarmes_fix_grants_v3
// (banco). Também: atualizarEvento/excluirEvento/listarEventosPorItemControle,
// atualizarItemControle/arquivarItemControle/buscarItemControlePorId,
// listarContatosPorItemControle — suporte à ficha própria de Item de
// Controle (ver cofre-controles.js v1.1.0).
//
// v1.1.2 — arquivarAtivo() (soft-delete de ativo, mesmo padrão de
// excluirDocumentoAtual: UPDATE status='arquivado', nunca DELETE físico).
//
// v1.1.1 — funções de acesso a cofre_itens_controle/cofre_ocorrencias_controle/
// cofre_controle_subtipos/históricos (módulo de Alarmes, Fase 1 núcleo).
// Escrita direta via Supabase client, protegida por RLS já aplicada em
// migration_cofre_alarmes_fase1_nucleo_v1 — sem RPC dedicada nesta rodada.
//
// Única camada que fala com o Supabase. cofre-ativos.js/cofre-documentos.js/
// cofre-navegacao.js chamam funções daqui — nenhuma delas monta uma query
// supabase-js diretamente (Diretriz Arquitetural — Passo 2: responsabilidade
// única por módulo).
// ============================================================================

const SUPABASE_URL = 'https://oduwpttbbemypiypjsux.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kdXdwdHRiYmVteXBpeXBqc3V4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyODEyOTcsImV4cCI6MjEwMDg1NzI5N30.9-cu1CV1wPbo5UH1G2eAsWqsvS54AWNuQZOlifc9a7w';

// `supabase` global vem do script UMD carregado no <head> do cofre.html
// (https://unpkg.com/@supabase/supabase-js@2) — mesma convenção do app
// principal, sem bundler.
const { createClient } = window.supabase;
// v1.16.0 (fatia 7) — GoTrueClient duplicado: dentro do App (index.html)
// já existe um cliente autenticado, exposto em window.__raizDbAuth; criar
// um segundo com a mesma chave gerava o aviso "Multiple GoTrueClient
// instances" e duas sessões disputando o mesmo storage. No cofre.html
// standalone a global não existe e o módulo cria o dele, como sempre.
export const dbAuth = window.__raizDbAuth || createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================================================
// SESSÃO / BOOTSTRAP
// ============================================================================
export async function obterUsuarioAtual() {
    const { data } = await dbAuth.auth.getUser();
    return data?.user ?? null;
}

export async function listarEmpresasDaPessoa(userId) {
    const { data, error } = await dbAuth
        .from('pessoas')
        .select('id, nome, perfil, cliente_id, clientes(nome_empresa)')
        .eq('user_id', userId);
    if (error) throw error;
    return data || [];
}

// Checagem de módulo/funcionalidade — INFERIDO/PARCIAL (ver HANDOFF v1.1.0
// item "Permissão e licença"): checa perfil_funcionalidade; NÃO checa ainda
// `licencas.modulo='cofre'` (decisão explícita do proprietário: aprofundar
// controle de acesso/licença em trilha paralela dedicada, não nesta rodada).
export async function pessoaTemFuncionalidade(perfil, funcionalidade) {
    const { data, error } = await dbAuth
        .from('perfil_funcionalidade')
        .select('funcionalidade_codigo')
        .eq('perfil_codigo', perfil)
        .eq('funcionalidade_codigo', funcionalidade);
    if (error) throw error;
    return (data || []).length > 0;
}

// ============================================================================
// CATEGORIAS
// ============================================================================
export async function listarCategorias(clienteId) {
    const { data, error } = await dbAuth.from('cofre_categorias').select('*').eq('cliente_id', clienteId).eq('ativo', true).order('ordem');
    if (error) throw error;
    return data || [];
}

export async function criarCategoria(clienteId, nome, grupo, ordem) {
    const { error } = await dbAuth.from('cofre_categorias').insert({ cliente_id: clienteId, nome, grupo: grupo || null, ordem });
    if (error) throw error;
}

// ============================================================================
// DOCUMENTOS
// ============================================================================
export async function listarDocumentos(clienteId) {
    const { data, error } = await dbAuth
        .from('cofre_documentos')
        .select('*, cofre_documento_vinculos(id, entidade_tipo, entidade_id, principal)')
        .eq('cliente_id', clienteId)
        .neq('status', 'excluido')
        .order('criado_em', { ascending: false });
    if (error) throw error;
    return data || [];
}

export async function buscarDocumentoPorId(id) {
    const { data, error } = await dbAuth
        .from('cofre_documentos')
        .select('*, cofre_documento_vinculos(entidade_tipo, entidade_id, principal)')
        .eq('id', id)
        .maybeSingle();
    if (error) throw error;
    return data;
}

export async function calcularHashSha256(file) {
    try {
        const buffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
        console.warn('Hash SHA-256 indisponível neste navegador:', e);
        return null;
    }
}

export function montarStoragePath(clienteId, documentoId, nomeOriginal) {
    const agora = new Date();
    const nomeSanitizado = nomeOriginal.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9._-]/g, '_');
    return `${clienteId}/${agora.getFullYear()}/${String(agora.getMonth() + 1).padStart(2, '0')}/${documentoId}/${nomeSanitizado}`;
}

export async function uploadArquivoDocumento(storagePath, file) {
    const { error } = await dbAuth.storage.from('cofre-documentos').upload(storagePath, file, { contentType: file.type, upsert: false });
    if (error) throw error;
}

export async function removerArquivoDocumento(storagePath) {
    await dbAuth.storage.from('cofre-documentos').remove([storagePath]);
}

export async function inserirDocumento(payload) {
    const { data, error } = await dbAuth.from('cofre_documentos').insert(payload).select().single();
    if (error) throw error;
    return data;
}

export async function atualizarDocumento(id, patch) {
    const { error } = await dbAuth.from('cofre_documentos').update(patch).eq('id', id);
    if (error) throw error;
}

// Soft-delete do documento em si (não só desvincular) — mesma convenção
// de exclusão de todo o Cofre (status='excluido', já filtrado em
// listarDocumentos). Usado quando o usuário escolhe apagar os
// documentos junto ao excluir um item de controle (pedido explícito,
// 25/08/2026).
export async function excluirDocumentoCompleto(id) {
    const { error } = await dbAuth.from('cofre_documentos').update({ status: 'excluido' }).eq('id', id);
    if (error) throw error;
}

export async function inserirVinculo(clienteId, documentoId, entidadeTipo, entidadeId, principal, pessoaId) {
    const { error } = await dbAuth.from('cofre_documento_vinculos').insert({
        cliente_id: clienteId, documento_id: documentoId, entidade_tipo: entidadeTipo,
        entidade_id: entidadeId, principal: !!principal, criado_por: pessoaId,
    });
    if (error) throw error;
}

export async function removerVinculo(vinculoId) {
    const { error } = await dbAuth.from('cofre_documento_vinculos').delete().eq('id', vinculoId);
    if (error) throw error;
}

export async function gerarSignedUrl(bucket, path, segundos = 120) {
    // v1.15.0 — fotos migradas do cadastro antigo (03/09): bucket 'externo'
    // guarda a URL inteira em storage_path (Google Drive); 'imoveis-fotos' é
    // bucket PÚBLICO — URL pública direta, sem assinatura (RLS de storage
    // não cobre createSignedUrl nele e a thumbnail vinha quebrada).
    if (bucket === 'externo') return path;
    if (bucket === 'imoveis-fotos') return dbAuth.storage.from(bucket).getPublicUrl(path).data.publicUrl;
    const { data, error } = await dbAuth.storage.from(bucket).createSignedUrl(path, segundos);
    if (error) throw error;
    return data.signedUrl;
}

// ============================================================================
// RESOLUÇÃO DE NOME DE VÍNCULO — Adendo Cofre Contextual §10: vínculos devem
// ser apresentados com NOME resolvido e navegáveis, nunca só "entidade_tipo".
// ============================================================================
export async function resolverNomesDeEntidades(clienteId, refs) {
    // refs: [{ tipo, id }] — retorna Map("tipo:id" -> { nome, subtitulo })
    const porTipo = {};
    for (const r of refs) {
        if (!r.id) continue;
        (porTipo[r.tipo] ??= new Set()).add(r.id);
    }
    const resultado = new Map();

    if (porTipo.imovel) {
        const { data } = await dbAuth.from('imoveis').select('id, endereco_rua, endereco_num').eq('cliente_id', clienteId).in('id', [...porTipo.imovel]);
        for (const i of (data || [])) resultado.set(`imovel:${i.id}`, { nome: `${i.endereco_rua}, ${i.endereco_num || ''}`, subtitulo: 'Imóvel' });
    }
    if (porTipo.contrato) {
        const { data } = await dbAuth.from('contratos').select('id, locatario').eq('cliente_id', clienteId).in('id', [...porTipo.contrato]);
        for (const c of (data || [])) resultado.set(`contrato:${c.id}`, { nome: c.locatario, subtitulo: 'Contrato' });
    }
    if (porTipo.ativo) {
        const { data } = await dbAuth.from('cofre_ativos').select('id, nome_exibicao, tipo_ativo').eq('cliente_id', clienteId).in('id', [...porTipo.ativo]);
        for (const a of (data || [])) resultado.set(`ativo:${a.id}`, { nome: a.nome_exibicao, subtitulo: 'Ativo' });
    }
    if (porTipo.pagamento) {
        const { data } = await dbAuth.from('mensalidades').select('id, competencia, contratos(locatario)').eq('cliente_id', clienteId).in('id', [...porTipo.pagamento]);
        for (const m of (data || [])) resultado.set(`pagamento:${m.id}`, { nome: `Pagamento ${formatarCompetenciaCurta(m.competencia)} · ${m.contratos?.locatario ?? ''}`, subtitulo: 'Pagamento' });
    }
    if (porTipo.pessoa) {
        const { data } = await dbAuth.from('pessoas').select('id, nome').eq('cliente_id', clienteId).in('id', [...porTipo.pessoa]);
        for (const p of (data || [])) resultado.set(`pessoa:${p.id}`, { nome: p.nome, subtitulo: 'Pessoa' });
    }
    if (porTipo.prestador) {
        const { data } = await dbAuth.from('prestadores').select('id, nome').eq('cliente_id', clienteId).in('id', [...porTipo.prestador]);
        for (const p of (data || [])) resultado.set(`prestador:${p.id}`, { nome: p.nome, subtitulo: 'Prestador' });
    }
    if (porTipo.empreendimento) {
        const { data } = await dbAuth.from('empreendimentos').select('id, nome').eq('cliente_id', clienteId).in('id', [...porTipo.empreendimento]);
        for (const e of (data || [])) resultado.set(`empreendimento:${e.id}`, { nome: e.nome, subtitulo: 'Empreendimento' });
    }
    return resultado;
}

function formatarCompetenciaCurta(competenciaISO) {
    if (!competenciaISO) return '';
    const [ano, mes] = competenciaISO.slice(0, 7).split('-');
    return `${mes}/${ano}`;
}

// ============================================================================
// FASE 2 — análise por IA (20/08/2026)
// ============================================================================
export async function analisarDocumentoComIA(documentoId) {
    const { data, error } = await dbAuth.functions.invoke('cofre-extrair-documento', { body: { documento_id: documentoId } });
    if (error) throw error;
    return data; // { analisado: boolean, resultado?: {...}, motivo?: string, erro?: string }
}

// ============================================================================
// CANDIDATOS — associação de documento a ativo/imóvel por texto digitado
// (prompt corretivo §19.3: "não limitar a Empresa/Nenhum"). Busca textual
// simples (ilike) — usada tanto no upload quanto no "Vincular agora" pós-
// triagem, e também pra resolver os candidatos sugeridos pela IA (Fase 2:
// a IA só sugere o TEXTO de busca, a resolução contra o banco é sempre
// esta mesma função, nunca um ID inventado pela IA).
// ============================================================================
export async function buscarCandidatosAtivo(clienteId, termo) {
    const { data, error } = await dbAuth.from('cofre_ativos').select('id, nome_exibicao, tipo_ativo').eq('cliente_id', clienteId).eq('status', 'ativo').ilike('nome_exibicao', `%${termo}%`).limit(5);
    if (error) throw error;
    return data || [];
}

export async function buscarCandidatosImovel(clienteId, termo) {
    const { data, error } = await dbAuth.from('imoveis').select('id, endereco_rua, endereco_num').eq('cliente_id', clienteId).ilike('endereco_rua', `%${termo}%`).limit(5);
    if (error) throw error;
    return data || [];
}

// ============================================================================
// ATIVOS
// ============================================================================
export async function listarAtivos(clienteId) {
    const { data, error } = await dbAuth.from('cofre_ativos').select('*').eq('cliente_id', clienteId).eq('status', 'ativo').order('criado_em', { ascending: false });
    if (error) throw error;
    return data || [];
}

export async function buscarAtivoPorId(id) {
    const { data, error } = await dbAuth.from('cofre_ativos').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
}

export async function buscarAtivoPorOrigemImovel(clienteId, imovelId) {
    const { data, error } = await dbAuth.from('cofre_ativos').select('*').eq('cliente_id', clienteId).eq('entidade_origem_tipo', 'imovel').eq('entidade_origem_id', imovelId).maybeSingle();
    if (error) throw error;
    return data;
}

// NOVO (31/08/2026, trem v1.85) — a ficha do ativo, pro caso de imóvel
// vinculado ao App (entidade_origem_tipo='imovel'), até aqui só mostrava
// um texto genérico + botão "Abrir gestão do imóvel", sem trazer o dado
// aqui dentro. IPTU/valor de mercado/uso/tipo de locação existem em
// imoveis desde v1.77.0 mas nunca eram buscados pela ficha do Cofre —
// esta função fecha essa lacuna. Erro é engolido (retorna null) de
// propósito: se o imóvel de origem não existir mais por algum motivo,
// a ficha não deve quebrar, só não mostra o resumo extra.
// v1.8.0 — SELECT ampliado (pedido explícito, "evoluir a exemplo do
// protótipo"): a aba Dados da ficha do ativo passou a mostrar a grade
// completa (Inscrição imobiliária, UF/Município, Endereço completo),
// não só uso/valor/IPTU — precisou de cib + os campos de endereço, que
// antes esta função não buscava.
export async function buscarResumoImovelOrigem(imovelId) {
    try {
        const { data, error } = await dbAuth.from('imoveis')
            .select('uso, tipo_locacao, iptu, valor_mercado, codigo_iptu, cib, endereco_rua, endereco_num, endereco_bairro, endereco_cidade, uf')
            .eq('id', imovelId)
            .maybeSingle();
        if (error) throw error;
        return data;
    } catch (e) {
        console.warn('[cofre-api] buscarResumoImovelOrigem falhou:', e);
        return null;
    }
}

// NOVO (31/08/2026, pedido explícito, "evoluir a exemplo do protótipo")
// — aba Contratos da ficha do ativo. Leitura pura da tabela contratos
// (mesma tabela que o App usa, mesma RLS, mesma conexão redundante já
// aceita — ver ativos-boot.js) — NENHUMA lógica de negócio de contrato
// (reajuste, minuta, rescisão) foi duplicada aqui, só listagem. Erro é
// engolido (retorna array vazio) de propósito, mesmo padrão de
// buscarResumoImovelOrigem: a ficha do ativo não deve quebrar por causa
// de uma busca acessória.
export async function buscarContratosDoImovel(imovelId) {
    try {
        const { data, error } = await dbAuth.from('contratos')
            .select('id, status, locatario, valor, inicio, fim')
            .eq('imovel_id', imovelId)
            .order('inicio', { ascending: false });
        if (error) throw error;
        return data || [];
    } catch (e) {
        console.warn('[cofre-api] buscarContratosDoImovel falhou:', e);
        return [];
    }
}

// v1.10.0 (NOVO, pedido explícito, 01/09/2026) — chip "Financeiro" da
// ficha do ativo. 1 chamada só (RPC já une entradas+saídas e calcula os
// totais de 6 meses no banco, ver migration fn_fluxo_financeiro_ativo) —
// nenhum join feito aqui no cliente. Funciona pra QUALQUER tipo_ativo
// (não só imóvel): entradas só existem quando o ativo referencia um
// imóvel do App (a RPC já resolve isso sozinha), saídas funcionam pra
// qualquer um, via ativo_id direto — nenhuma dependência de "imoveis"
// nova sendo introduzida aqui, propositalmente (ver Diretrizes Técnicas).
export async function buscarFluxoFinanceiroAtivo(ativoId) {
    try {
        const { data, error } = await dbAuth.rpc('fn_fluxo_financeiro_ativo', { p_ativo_id: ativoId });
        if (error) throw error;
        const linha = (data && data[0]) || { total_entradas_6m: 0, total_saidas_6m: 0, itens: [] };
        return {
            totalEntradas6m: Number(linha.total_entradas_6m || 0),
            totalSaidas6m: Number(linha.total_saidas_6m || 0),
            itens: linha.itens || []
        };
    } catch (e) {
        console.warn('[cofre-api] buscarFluxoFinanceiroAtivo falhou:', e);
        return { totalEntradas6m: 0, totalSaidas6m: 0, itens: [] };
    }
}

// v1.12.0 (02/09/2026) — "no chip de propriedade, só apresente o dos
// ativos": fn_propriedade_do_ativo agora só lê propriedade_ativo,
// sempre (não tem mais ramo pra propriedade_imovel — dado já migrado,
// ver migration da sessão). Comentário antigo (v1.11.0) que dizia
// "decide sozinha entre as 2 tabelas" ficou desatualizado, corrigido.
export async function buscarPropriedadeDoAtivo(ativoId) {
    try {
        const { data, error } = await dbAuth.rpc('fn_propriedade_do_ativo', { p_ativo_id: ativoId });
        if (error) throw error;
        return data || [];
    } catch (e) {
        console.warn('[cofre-api] buscarPropriedadeDoAtivo falhou:', e);
        return [];
    }
}

export async function salvarPropriedadeAtivo(ativoId, linhas) {
    const { error } = await dbAuth.rpc('substituir_propriedade_ativo', { p_ativo_id: ativoId, p_linhas: linhas });
    if (error) throw error;
}

// Sócios internos (pessoas da própria empresa) — pro seletor "sócio
// interno" do editor de divisão de propriedade. Mesmo padrão de query
// já usado em outros pontos deste arquivo (dbAuth.from('pessoas')).
export async function listarPessoasInternas(clienteId) {
    try {
        const { data, error } = await dbAuth.from('pessoas')
            .select('id, nome, percentual_cotas_empresa')
            .eq('cliente_id', clienteId)
            .order('nome');
        if (error) throw error;
        return data || [];
    } catch (e) {
        console.warn('[cofre-api] listarPessoasInternas falhou:', e);
        return [];
    }
}

// v1.16.0 (NOVO, 02/09/2026, pedido explícito: "as partes devem ser
// vários chips e aparecer... em itens de controle (prestadores)") —
// diferente de listarPessoasInternas (só sócios/funcionários da própria
// empresa), esta traz TODAS as partes do cliente — inclui prestadores
// externos (corretor, seguradora, síndico terceirizado etc.), pro
// seletor do editor de partes do item de controle.
export async function listarPartesCliente(clienteId) {
    try {
        const { data, error } = await dbAuth.from('partes')
            .select('id, nome')
            .eq('cliente_id', clienteId)
            .order('nome');
        if (error) throw error;
        return data || [];
    } catch (e) {
        console.warn('[cofre-api] listarPartesCliente falhou:', e);
        return [];
    }
}

export async function buscarPartesDoItemControle(itemControleId) {
    try {
        const { data, error } = await dbAuth.rpc('fn_partes_do_item_controle', { p_item_controle_id: itemControleId });
        if (error) throw error;
        return data || [];
    } catch (e) {
        console.warn('[cofre-api] buscarPartesDoItemControle falhou:', e);
        return [];
    }
}

export async function salvarPartesItemControle(itemControleId, linhas) {
    const { error } = await dbAuth.rpc('substituir_partes_item_controle', { p_item_controle_id: itemControleId, p_linhas: linhas });
    if (error) throw error;
}

// Criação rápida de parte (nome só, mesmo espírito do fornecedor "+
// Novo" do popup de despesa em index.html) — usada pelo editor de
// Partes do item de controle quando a parte ainda não existe.
export async function criarParteRapida(clienteId, nome) {
    return await dbAuth.from('partes').insert({ cliente_id: clienteId, nome }).select('id, nome').single();
}


// NOVO (31/08/2026, pedido explícito) — "perdeu a formatação da lista
// com ícones, tamanho e cores... como referência a tela a lista de
// imóveis antiga". A lista unificada de Ativos mostrava só nome+tipo
// genérico pros imóveis (perdendo empreendimento/status colorido/
// locatário/aluguel que a lista antiga de Imóveis sempre teve). Busca
// tudo de uma vez só (1 query de imóveis com join embutido — mesmo
// padrão PostgREST já usado por carregarImoveisSupabase() no
// index.html, `tipos_imovel(nome), empreendimentos(nome)` — + 1 query
// de contratos), monta um Map por imóvel — ativoCardHtml() só lê daqui,
// nunca faz busca por card (isso sim causaria lentidão de verdade numa
// lista de 49+ itens). Mesmo mapeamento de status Supabase→rótulo e
// mesma prioridade de "contrato principal" que o index.html usa
// (mapStatusSupabaseParaAntigo/PRIORIDADE_STATUS_CONTRATO) — não
// inventei um critério novo, copiei o critério real.
const PRIORIDADE_STATUS_CONTRATO_CARD = { Ativo: 1, Assinando: 2, Suspenso: 3, Finalizado: 4 };
const STATUS_IMOVEL_SUPABASE_PARA_ROTULO = { disponivel: 'Vago', alugado: 'Alugado', assinando: 'Assinando', manutencao: 'Vago', reservado: 'Vago', em_uso: 'Em uso', em_breve: 'Em Breve' };

export async function buscarResumoImoveisParaCards(clienteId) {
    const resumo = new Map();
    try {
        const { data: imoveisRows, error: e1 } = await dbAuth.from('imoveis')
            .select('id, status, finalidade_uso, fotos, tipos_imovel(nome), empreendimentos(nome)')
            .eq('cliente_id', clienteId);
        if (e1) throw e1;

        const { data: contratosRows, error: e2 } = await dbAuth.from('contratos')
            .select('imovel_id, status, locatario, valor')
            .eq('cliente_id', clienteId);
        if (e2) throw e2;

        (imoveisRows || []).forEach(imo => {
            const contratosDoImovel = (contratosRows || [])
                .filter(c => c.imovel_id === imo.id)
                .sort((a, b) => (PRIORIDADE_STATUS_CONTRATO_CARD[a.status] || 9) - (PRIORIDADE_STATUS_CONTRATO_CARD[b.status] || 9));
            const foto = (Array.isArray(imo.fotos) && imo.fotos.length > 0 && typeof imo.fotos[0] === 'string' && imo.fotos[0].length > 5) ? imo.fotos[0] : null;
            resumo.set(imo.id, {
                empreendimento: imo.empreendimentos?.nome || '',
                tipo: imo.tipos_imovel?.nome || '',
                finalidadeUso: imo.finalidade_uso || '',
                status: STATUS_IMOVEL_SUPABASE_PARA_ROTULO[imo.status] || 'Vago',
                foto,
                contratoPrincipal: contratosDoImovel[0] || null
            });
        });
    } catch (e) {
        console.warn('[cofre-api] buscarResumoImoveisParaCards falhou:', e);
    }
    return resumo;
}

export async function criarAtivo(payload) {
    const { data, error } = await dbAuth.from('cofre_ativos').insert(payload).select().single();
    if (error) throw error;
    return data;
}

export async function atualizarAtivo(id, patch) {
    const { error } = await dbAuth.from('cofre_ativos').update(patch).eq('id', id);
    if (error) throw error;
}

export async function arquivarAtivo(id) {
    const { error } = await dbAuth.from('cofre_ativos').update({ status: 'arquivado' }).eq('id', id);
    if (error) throw error;
}

// NOVO (29/08/2026, pedido explícito) — marca o ativo como vendido E
// desativa em cascata o alerta dos itens de controle vinculados
// (cofre_itens_controle.alerta_ativo=false — mesmo campo que a varredura
// proativa alertar.cofre_item_vencendo do diario-eventos já filtra por
// `.eq('alerta_ativo', true)`, então isso já corta o alerta de ponta a
// ponta, sem precisar mexer no servidor). Os itens em si continuam
// existindo (não vira ativo=false neles) — só param de gerar aviso; o
// histórico (documentos, ocorrências já tratadas) permanece intacto e
// consultável na ficha, caso precise no futuro.
export async function marcarAtivoVendido(id) {
    const { error: erroAtivo } = await dbAuth.from('cofre_ativos').update({ status: 'vendido' }).eq('id', id);
    if (erroAtivo) throw erroAtivo;
    const { error: erroItens } = await dbAuth.from('cofre_itens_controle').update({ alerta_ativo: false }).eq('ativo_id', id);
    if (erroItens) throw erroItens;
}

export async function buscarImovelPorId(id) {
    const { data, error } = await dbAuth.from('imoveis').select('id, endereco_rua, endereco_num, endereco_bairro, endereco_cidade').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
}

export async function listarImoveisDoCliente(clienteId) {
    const { data, error } = await dbAuth.from('imoveis').select('id, endereco_rua, endereco_num').eq('cliente_id', clienteId).order('endereco_rua');
    if (error) throw error;
    return data || [];
}

// ============================================================================
// FOTOS
// ============================================================================
export async function listarFotosAtivo(ativoId) {
    const { data, error } = await dbAuth.from('cofre_ativo_fotos').select('*').eq('ativo_id', ativoId).eq('status', 'ativo').order('ordem');
    if (error) throw error;
    return data || [];
}

export async function inserirFotoAtivo(payload) {
    const { error } = await dbAuth.from('cofre_ativo_fotos').insert(payload);
    if (error) throw error;
}

export async function alternarPublicarVitrineFoto(fotoId, valor) {
    const { error } = await dbAuth.from('cofre_ativo_fotos').update({ publicar_vitrine: valor }).eq('id', fotoId);
    if (error) throw error;
}

export async function excluirFotoAtivo(fotoId) {
    // BUG FIX (25/08/2026, achado pelo usuário) — 'excluido' não existe
    // no CHECK constraint de status desta tabela (só aceita
    // 'ativo'/'arquivado', confirmado direto no banco antes de
    // corrigir) — todo clique em excluir foto quebrava com erro 500.
    const { error } = await dbAuth.from('cofre_ativo_fotos').update({ status: 'arquivado' }).eq('id', fotoId);
    if (error) throw error;
}

// ============================================================================
// ALERTAS — DERIVADOS de cofre_ocorrencias_controle (v6, pedido explícito):
// não existe mais cadastro de alerta separado (cofre_eventos foi removida
// do banco). Um item de controle com alerta_ativo=true já É o
// alerta — mesmo padrão do App em Imóveis (Vago/Contrato a vencer são
// calculados a partir do estado real, nunca cadastrados à parte).
// ============================================================================
export async function listarOcorrenciasAbertasComItem(clienteId) {
    // BUG FIX (25/08/2026) — ver changelog anterior sobre !inner.
    // Revisão de design (25/08/2026, pedido explícito) — embed de
    // cofre_ativos(nome_exibicao, tipo_ativo) acrescentado: o card de
    // alerta agora mostra o ícone do TIPO do ativo + nome do ativo, não
    // só o título do item de controle (ver alertaCardHtml em
    // cofre-documentos.js).
    const { data, error } = await dbAuth.from('cofre_ocorrencias_controle')
        .select('*, cofre_itens_controle!inner(ativo_id, titulo, tipo, antecedencia_alerta_dias, alerta_ativo, cofre_ativos(nome_exibicao, tipo_ativo))')
        .eq('cliente_id', clienteId).eq('status_execucao', 'aberto').eq('cofre_itens_controle.ativo', true)
        .order('data_prevista_atual');
    if (error) throw error;
    return data || [];
}

// ============================================================================
// CONTATOS
// ============================================================================
export async function listarContatos(clienteId) {
    const { data, error } = await dbAuth.from('cofre_contatos_acionamento').select('*').eq('cliente_id', clienteId).order('nome');
    if (error) throw error;
    return data || [];
}

export async function criarContato(payload) {
    const { error } = await dbAuth.from('cofre_contatos_acionamento').insert(payload);
    if (error) throw error;
}

export async function atualizarContato(id, patch) {
    const { error } = await dbAuth.from('cofre_contatos_acionamento').update(patch).eq('id', id);
    if (error) throw error;
}

// DELETE de verdade (não soft-delete) — cofre_contatos_acionamento não
// tem coluna status/ativo, diferente do resto do Cofre. Dado de baixo
// risco (nome/telefone/e-mail), nenhuma outra tabela referencia um
// contato excluído, então não há necessidade de preservar histórico
// aqui como acontece com item/ativo/documento.
export async function excluirContato(id) {
    const { error } = await dbAuth.from('cofre_contatos_acionamento').delete().eq('id', id);
    if (error) throw error;
}

// ============================================================================
// CONTROLES / OCORRÊNCIAS — módulo de Alarmes (Fase 1, núcleo). Escrita
// direta via RLS (cofre_itens_controle_write / cofre_ocorrencias_controle_write,
// migration_cofre_alarmes_fase1_nucleo_v1) — sem RPC dedicada nesta rodada;
// autorização real continua no servidor (RLS), não só escondida na UI.
// ============================================================================
export async function listarSubtiposControle(clienteId) {
    const { data, error } = await dbAuth.from('cofre_controle_subtipos').select('*')
        .or(`cliente_id.is.null,cliente_id.eq.${clienteId}`).eq('ativo', true)
        .order('tipo').order('nome');
    if (error) throw error;
    return data || [];
}

// Modelos de item de controle por tipo de ativo (pedido explícito,
// 25/08/2026) — mesmo padrão de escopo que listarSubtiposControle()
// (global + do cliente). Usado pra pré-preencher a criação de item de
// controle a partir do tipo de ativo (App e, futuramente, bot).
export async function listarModelosItemControle(clienteId) {
    const { data, error } = await dbAuth.from('cofre_modelos_item_controle').select('*, cofre_controle_subtipos(nome)')
        .or(`cliente_id.is.null,cliente_id.eq.${clienteId}`).eq('ativo', true)
        .order('tipo_ativo').order('tipo');
    if (error) throw error;
    return data || [];
}

export async function criarModeloItemControle(payload) {
    const { error } = await dbAuth.from('cofre_modelos_item_controle').insert(payload);
    if (error) throw error;
}

export async function atualizarModeloItemControle(id, patch) {
    const { error } = await dbAuth.from('cofre_modelos_item_controle').update(patch).eq('id', id);
    if (error) throw error;
}

// Soft-delete (ativo=false) — mesmo padrão de excluir usado em todo o
// Cofre (arquivarItemControle/arquivarAtivo), nunca DELETE de verdade.
export async function arquivarModeloItemControle(id) {
    const { error } = await dbAuth.from('cofre_modelos_item_controle').update({ ativo: false }).eq('id', id);
    if (error) throw error;
}

// Novo subtipo de controle (pedido explícito, 25/08/2026 — gestão de
// subtipos não existia em lugar nenhum da tela; RLS também só tinha
// SELECT, precisou de policy nova, ver migration
// cofre_controle_subtipos_write_policy_v1). SEMPRE com cliente_id do
// tenant atual — nunca cliente_id null (isso é reservado ao catálogo-
// base do sistema, compartilhado entre todos os clientes, ver seed
// original da tabela). `codigo` é gerado a partir do nome (slug), com
// sufixo numérico se colidir com um já existente do mesmo cliente
// (UNIQUE (cliente_id, codigo) no banco).
// NOVO (29/08/2026) — parâmetro documentoEsperado (pedido explícito do
// Nicola): sinaliza se itens deste subtipo devem ter documento anexado.
// Alimenta fn_diario_cofre_documento_pendente() no diario-eventos.
export async function criarSubtipoControle(clienteId, tipo, nome, documentoEsperado = false) {
    const codigoBase = nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'subtipo';
    let codigo = codigoBase;
    for (let tentativa = 1; tentativa <= 20; tentativa++) {
        const { error } = await dbAuth.from('cofre_controle_subtipos').insert({ cliente_id: clienteId, tipo, codigo, nome, documento_esperado: documentoEsperado });
        if (!error) return;
        if (error.code === '23505' && tentativa < 20) { codigo = `${codigoBase}_${tentativa + 1}`; continue; }
        throw error;
    }
}

// Edita NOME e documento_esperado (25/08/2026 + 29/08/2026) — nunca o
// `codigo` (chave usada internamente/em referências), nem o `tipo`
// (mudar de seguro/manutenção/tributo depois de criado deixaria
// qualquer item de controle já usando esse subtipo apontando pro grupo
// errado no dropdown).
export async function atualizarSubtipoControle(id, nome, documentoEsperado = false) {
    const { error } = await dbAuth.from('cofre_controle_subtipos').update({ nome, documento_esperado: documentoEsperado }).eq('id', id);
    if (error) throw error;
}

// Soft-delete (ativo=false) — mesmo padrão do resto do Cofre.
export async function arquivarSubtipoControle(id) {
    const { error } = await dbAuth.from('cofre_controle_subtipos').update({ ativo: false }).eq('id', id);
    if (error) throw error;
}

export async function listarItensControleAtivo(ativoId) {
    const { data, error } = await dbAuth.from('cofre_itens_controle')
        .select('*, cofre_ocorrencias_controle(*), cofre_controle_subtipos(nome)')
        .eq('ativo_id', ativoId).eq('ativo', true).order('criado_em');
    if (error) throw error;
    return data || [];
}

export async function criarItemControle(payload) {
    const { data, error } = await dbAuth.from('cofre_itens_controle').insert(payload).select().single();
    if (error) throw error;
    return data;
}

export async function atualizarItemControle(id, patch) {
    const { error } = await dbAuth.from('cofre_itens_controle').update(patch).eq('id', id);
    if (error) throw error;
}

export async function arquivarItemControle(id) {
    const { error } = await dbAuth.from('cofre_itens_controle').update({ ativo: false }).eq('id', id);
    if (error) throw error;
}

export async function buscarItemControlePorId(id) {
    const { data, error } = await dbAuth.from('cofre_itens_controle')
        .select('*, cofre_ocorrencias_controle(*), cofre_controle_subtipos(nome), cofre_ativos(nome_exibicao, tipo_ativo)')
        .eq('id', id).single();
    if (error) throw error;
    return data;
}

export async function listarContatosPorItemControle(itemControleId) {
    const { data, error } = await dbAuth.from('cofre_contatos_acionamento').select('*').eq('item_controle_id', itemControleId).order('nome');
    if (error) throw error;
    return data || [];
}

export async function criarOcorrenciasControleBatch(payloads) {
    const { error } = await dbAuth.from('cofre_ocorrencias_controle').insert(payloads);
    if (error) throw error;
}

export async function criarOcorrenciaControle(payload) {
    const { data, error } = await dbAuth.from('cofre_ocorrencias_controle').insert(payload).select().single();
    if (error) throw error;
    return data;
}

export async function tratarOcorrencia(id, pessoaId, descricao) {
    const { error } = await dbAuth.from('cofre_ocorrencias_controle').update({
        status_execucao: 'concluido', tratado_em: new Date().toISOString(), tratado_por: pessoaId,
        tratamento_descricao: descricao || null,
    }).eq('id', id);
    if (error) throw error;
}

export async function reagendarOcorrencia(id, novaData) {
    const { error } = await dbAuth.from('cofre_ocorrencias_controle').update({ data_prevista_atual: novaData }).eq('id', id);
    if (error) throw error;
}

export async function estornarOcorrencia(id) {
    const { error } = await dbAuth.from('cofre_ocorrencias_controle').update({
        status_execucao: 'aberto', tratado_em: null, tratado_por: null, tratamento_descricao: null,
    }).eq('id', id);
    if (error) throw error;
}

// Usada na regeneração de ocorrências após editar a frequência de um item
// (pedido explícito — ver salvarEdicaoItem em cofre-controles.js). Só
// apaga ocorrências FUTURAS ainda em aberto (data_prevista_atual >= hoje)
// — nunca toca em ocorrências já vencidas (continuam pendentes de
// verdade, independente da frequência ter mudado) nem em concluídas
// (histórico real do que já foi feito).
export async function excluirOcorrenciasAbertasFuturasDoItem(itemControleId, apartirDeISO) {
    const { error } = await dbAuth.from('cofre_ocorrencias_controle')
        .delete()
        .eq('item_controle_id', itemControleId)
        .eq('status_execucao', 'aberto')
        .gte('data_prevista_atual', apartirDeISO);
    if (error) throw error;
}

export async function registrarHistoricoOcorrencia(payload) {
    const { error } = await dbAuth.from('cofre_ocorrencias_historico').insert(payload);
    if (error) console.error('registrarHistoricoOcorrencia:', error.message);
}

export async function registrarHistoricoItemControle(payload) {
    const { error } = await dbAuth.from('cofre_itens_controle_historico').insert(payload);
    if (error) console.error('registrarHistoricoItemControle:', error.message);
}

// ============================================================================
// HISTÓRICO — reaproveita log_acessos existente (prompt corretivo §16:
// "reaproveitar logs/eventos existentes quando possível"), filtrado por
// ação cofre.* e, quando possível, pelo ativo/documento no `detalhe` jsonb.
// ============================================================================
export async function registrarLogAcessos(clienteId, pessoaId, acao, detalhe) {
    const { error } = await dbAuth.from('log_acessos').insert({ cliente_id: clienteId, pessoa_id: pessoaId, acao, detalhe });
    if (error) console.error('registrarLogAcessos:', error.message);
}

export async function listarHistoricoAtivo(clienteId, ativoId, limite = 30) {
    const { data, error } = await dbAuth
        .from('log_acessos').select('id, acao, detalhe, criado_em, pessoas(nome)')
        .eq('cliente_id', clienteId).like('acao', 'cofre.%')
        .contains('detalhe', { ativoId })
        .order('criado_em', { ascending: false }).limit(limite);
    if (error) { console.error('listarHistoricoAtivo:', error.message); return []; }
    return data || [];
}
