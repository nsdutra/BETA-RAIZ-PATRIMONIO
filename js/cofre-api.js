// ============================================================================
// cofre-api.js — Raiz Patrimônio · Cofre de Documentos
// Versão: 1.4.0 · 25/08/2026
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
export const dbAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
        .select('*, cofre_documento_vinculos(entidade_tipo, entidade_id, principal)')
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

// ============================================================================
// ALERTAS — DERIVADOS de cofre_ocorrencias_controle (v6, pedido explícito):
// não existe mais cadastro de alerta separado (cofre_eventos foi removida
// do banco). Um item de controle com alerta_ativo=true já É o
// alerta — mesmo padrão do App em Imóveis (Vago/Contrato a vencer são
// calculados a partir do estado real, nunca cadastrados à parte).
// ============================================================================
export async function listarOcorrenciasAbertasComItem(clienteId) {
    const { data, error } = await dbAuth.from('cofre_ocorrencias_controle')
        .select('*, cofre_itens_controle(ativo_id, titulo, tipo, antecedencia_alerta_dias, alerta_ativo)')
        .eq('cliente_id', clienteId).eq('status_execucao', 'aberto')
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

// Novo subtipo de controle (pedido explícito, 25/08/2026 — gestão de
// subtipos não existia em lugar nenhum da tela; RLS também só tinha
// SELECT, precisou de policy nova, ver migration
// cofre_controle_subtipos_write_policy_v1). SEMPRE com cliente_id do
// tenant atual — nunca cliente_id null (isso é reservado ao catálogo-
// base do sistema, compartilhado entre todos os clientes, ver seed
// original da tabela). `codigo` é gerado a partir do nome (slug), com
// sufixo numérico se colidir com um já existente do mesmo cliente
// (UNIQUE (cliente_id, codigo) no banco).
export async function criarSubtipoControle(clienteId, tipo, nome) {
    const codigoBase = nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'subtipo';
    let codigo = codigoBase;
    for (let tentativa = 1; tentativa <= 20; tentativa++) {
        const { error } = await dbAuth.from('cofre_controle_subtipos').insert({ cliente_id: clienteId, tipo, codigo, nome });
        if (!error) return;
        if (error.code === '23505' && tentativa < 20) { codigo = `${codigoBase}_${tentativa + 1}`; continue; }
        throw error;
    }
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
        .select('*, cofre_ocorrencias_controle(*), cofre_controle_subtipos(nome)')
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
