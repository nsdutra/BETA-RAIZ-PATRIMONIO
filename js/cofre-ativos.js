// ============================================================================
// cofre-ativos.js — Raiz Patrimônio · Cofre de Documentos
// Versão: 1.1.5 · 25/08/2026
//
// v1.1.5 — box "Dados do ativo": vira descrição corrida + badge de status
// (Ativo/Arquivado), igual ao padrão de card do Imóvel — antes era tabela
// label:valor. Card da lista de ativos: fonte igual ao Imóvel (text-xs
// font-extrabold, era text-sm font-semibold). Box "Alertas" removido (v6 —
// alertas agora só existem via Item de Controle). ativoCardHtml() lê
// estado.ocorrenciasAbertas em vez do estado.eventos morto.
//
// v1.1.4 — Contatos removido da ficha do ativo (pedido explícito: contatos
// agora vinculam a Item de Controle, não ao ativo direto — ver
// cofre-controles.js). Documentos/Fotos deixam de ser boxes fixos e viram
// ações em "Mais ações" (abrem modal-documentos-ativo/modal-fotos-ativo).
// montarAlertasAtivo() passa a excluir eventos já vinculados a um item de
// controle (esses aparecem na ficha do item, não duplicados aqui).
//
// v1.1.3 — MUDANÇA ESTRUTURAL: ficha do ativo deixa de ser modal com abas
// e passa a ser tela cheia (data-screen="ficha-ativo") com boxes empilhados
// (Dados/Documentos/Controles/Alertas/Contatos/Fotos), padrão idêntico à
// ficha do imóvel no App principal (pedido explícito — "menu suspenso com
// abas não é o padrão do projeto"). Histórico passa a viver em "Mais ações"
// do box Dados, mesma convenção usada no box de Contrato da ficha do
// imóvel. Nova ação excluirAtivoAtual() (soft-delete, "Mais ações →
// Excluir", vermelho discreto conforme Design System §1).
//
// v1.1.2 — abrirFichaAtivo() passa a montar também a aba Controles (novo
// módulo cofre-controles.js), junto de Resumo/Documentos/Alertas/Contatos.
//
// v1.1.1 — select de tipo de ativo passa a incluir veiculo_blindado e
// obra_arte (ver cofre-validacoes.js v1.1.1 para rótulo/ícone/campos).
//
// Ativo Controlado como entidade rica: Lista → Ficha → Editar (Adendo §6).
// Ficha abre sempre em Resumo (nunca direto em Documentos — era o desvio
// da v1.0.0 que este arquivo corrige). Campos estruturados por tipo em vez
// do campo único "identificadores" da v1.0.0 (prompt corretivo §10).
// ============================================================================
import { estado } from './cofre-estado.js';
import * as api from './cofre-api.js';
import { mostrarToast, refrescarIcones, alternarToggle } from './cofre-ui.js';
import { mudarTela } from './cofre-navegacao.js';
import {
    escapeHtml, formatarDataBR, diasAte, chipVencimento, mascarar,
    rotuloTipoAtivo, iconeAtivo, CAMPOS_POR_TIPO_ATIVO, validarCamposAtivo,
} from './cofre-validacoes.js';
import { montarControlesAtivo } from './cofre-controles.js';

let ativoAtualId = null;

// ============================================================================
// LISTA (tela Ativos)
// ============================================================================
export function popularSelectTipoAtivo() {
    const sel = document.getElementById('at-tipo');
    if (!sel || sel.options.length) return;
    sel.innerHTML = ['veiculo', 'veiculo_blindado', 'imovel', 'terreno', 'vida_protecao', 'obra_arte', 'outro']
        .map(t => `<option value="${t}">${rotuloTipoAtivo(t)}</option>`).join('');
}

export function renderAtivosLista(filtroTipo = '', filtroTexto = '') {
    const termo = filtroTexto.toLowerCase().trim();
    const lista = estado.ativos.filter(a => {
        if (filtroTipo && a.tipo_ativo !== filtroTipo) return false;
        if (termo && !a.nome_exibicao.toLowerCase().includes(termo)) return false;
        return true;
    });
    document.getElementById('ativos-lista').innerHTML = lista.map(ativoCardHtml).join('');
    document.getElementById('ativos-estado-vazio').classList.toggle('hidden', estado.ativos.length !== 0);
    document.getElementById('ativos-lista').classList.toggle('hidden', estado.ativos.length === 0);
    refrescarIcones();
}

function ativoCardHtml(a) {
    // Card = identidade + status + contexto + próxima ação (Adendo §20) —
    // sem fileira de ícones de ação; o card inteiro abre a ficha.
    const ocorrenciasDoAtivo = estado.ocorrenciasAbertas.filter(oc => oc.cofre_itens_controle?.ativo_id === a.id);
    const proximo = ocorrenciasDoAtivo.map(oc => diasAte(oc.data_prevista_atual)).filter(d => d !== null).sort((x, y) => x - y)[0];
    const chip = chipVencimento(proximo);
    return `<button data-action="abrir-ativo" data-id="${a.id}" class="card-ativo w-full p-3 text-left flex items-center gap-3">
        <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style="background:var(--success-bg)"><i data-lucide="${iconeAtivo(a.tipo_ativo)}" style="width:18px;height:18px;color:var(--success)"></i></div>
        <div class="min-w-0 flex-1">
            <p class="text-xs font-extrabold truncate">${escapeHtml(a.nome_exibicao)}</p>
            <p class="text-xs" style="color:var(--sage)">${escapeHtml(rotuloTipoAtivo(a.tipo_ativo))}</p>
        </div>
        ${chip ? `<span class="chip ${chip.classe} flex-shrink-0">${escapeHtml(chip.texto)}</span>` : ''}
    </button>`;
}

// ============================================================================
// FORMULÁRIO — NOVO ATIVO (campos estruturados por tipo, §10)
// ============================================================================
export function alternarFormAtivo() {
    alternarToggle('btn-toggle-ativo', 'form-ativo-wrapper');
    aoMudarTipoAtivo();
}

export async function aoMudarTipoAtivo() {
    const tipo = document.getElementById('at-tipo').value;
    document.getElementById('at-origem-imovel-wrapper').classList.toggle('hidden', tipo !== 'imovel');
    if (tipo === 'imovel') {
        const imoveis = await api.listarImoveisDoCliente(estado.clienteId);
        document.getElementById('at-origem-imovel').innerHTML = imoveis.map(i => `<option value="${i.id}">${escapeHtml(i.endereco_rua)}, ${escapeHtml(i.endereco_num || '')}</option>`).join('') || '<option value="">Nenhum imóvel cadastrado</option>';
    }
    document.getElementById('at-campos-estruturados').innerHTML = renderizarCamposEstruturados(tipo, {});
}

function renderizarCamposEstruturados(tipo, valores, prefixoId = 'at-campo-') {
    const campos = CAMPOS_POR_TIPO_ATIVO[tipo] || [];
    return campos.map(c => `
        <div>
            <label class="text-xs font-semibold block mb-1">${escapeHtml(c.label)} ${c.obrigatorio ? '<span style="color:var(--danger)">*</span>' : ''}</label>
            <input type="${c.tipo === 'number' ? 'number' : c.tipo === 'date' ? 'date' : 'text'}" id="${prefixoId}${c.chave}" value="${escapeHtml(valores[c.chave] || '')}" class="w-full border-2 border-slate-300 rounded-xl p-2 text-sm">
        </div>`).join('') || `<p class="text-xs sm:col-span-2" style="color:var(--sage)">Sem campos estruturados adicionais para este tipo.</p>`;
}

function lerCamposEstruturados(tipo, prefixoId = 'at-campo-') {
    const campos = CAMPOS_POR_TIPO_ATIVO[tipo] || [];
    const dados = {};
    for (const c of campos) {
        const el = document.getElementById(`${prefixoId}${c.chave}`);
        if (el && el.value.trim()) dados[c.chave] = el.value.trim();
    }
    return dados;
}

export async function salvarAtivo() {
    const tipo = document.getElementById('at-tipo').value;
    const nome = document.getElementById('at-nome').value.trim();
    const statusEl = document.getElementById('at-status');
    const dadosEspecificos = lerCamposEstruturados(tipo);

    const erros = validarCamposAtivo(tipo, nome, dadosEspecificos);
    if (erros.length) { statusEl.textContent = '⚠️ ' + erros[0]; statusEl.style.color = 'var(--danger)'; return; }

    const payload = { cliente_id: estado.clienteId, tipo_ativo: tipo, nome_exibicao: nome, status: 'ativo', dados_especificos: dadosEspecificos, criado_por: estado.pessoa.id };
    if (tipo === 'imovel') {
        const imovelId = document.getElementById('at-origem-imovel').value;
        if (!imovelId) { statusEl.textContent = '⚠️ Selecione o imóvel.'; statusEl.style.color = 'var(--danger)'; return; }
        payload.entidade_origem_tipo = 'imovel';
        payload.entidade_origem_id = imovelId;
    }

    try {
        await api.criarAtivo(payload);
        mostrarToast('Ativo cadastrado ✅');
        document.getElementById('at-nome').value = '';
        alternarFormAtivo();
        window.dispatchEvent(new CustomEvent('cofre:recarregar-ativos'));
    } catch (err) { statusEl.textContent = '❌ ' + err.message; statusEl.style.color = 'var(--danger)'; }
}

// ============================================================================
// FICHA DO ATIVO — abre SEMPRE em Resumo (Adendo §7.1)
// ============================================================================
export async function abrirFichaAtivo(id) {
    const a = estado.ativos.find(x => x.id === id) || await api.buscarAtivoPorId(id);
    if (!a) { mostrarToast('Ativo não encontrado.', 'erro'); return; }
    ativoAtualId = id;
    estado.ativoEmFoco = a;

    document.getElementById('fa-nome').textContent = a.nome_exibicao;
    document.getElementById('fa-tipo').textContent = rotuloTipoAtivo(a.tipo_ativo);
    document.getElementById('fa-editar-wrapper').classList.add('hidden');
    document.getElementById('fa-historico-wrapper').classList.add('hidden');
    document.getElementById('fa-mais-acoes').classList.add('hidden');

    montarDadosAtivo(a);
    montarDocumentosAtivo(a);
    await montarControlesAtivo(a);
    await montarFotosAtivo(a);
    await montarHistoricoAtivo(a);

    mudarTela('ficha-ativo');
}

export function fecharFichaAtivo() {
    mudarTela('ativos');
    window.dispatchEvent(new CustomEvent('cofre:recarregar-ativos'));
}

export function alternarMaisAcoesAtivo() {
    document.getElementById('fa-mais-acoes').classList.toggle('hidden');
}

export function alternarHistoricoAtivo() {
    document.getElementById('fa-historico-wrapper').classList.toggle('hidden');
}

// ---- Dados do ativo (box 1 — campos estruturados por tipo, incl. valor estimado)
function montarDadosAtivo(a) {
    const origemWrapper = document.getElementById('fa-resumo-origem-imovel');
    origemWrapper.classList.toggle('hidden', a.entidade_origem_tipo !== 'imovel');

    // Descrição corrida (não tabela) + badge de status, mesmo padrão do
    // card/ficha de Imóvel no App (pedido explícito).
    const camposDefinidos = CAMPOS_POR_TIPO_ATIVO[a.tipo_ativo] || [];
    const dados = a.dados_especificos || {};
    const valoresPreenchidos = camposDefinidos
        .filter(c => dados[c.chave])
        .map(c => c.mascarar ? mascarar(dados[c.chave]) : dados[c.chave]);
    const descricaoCorrida = valoresPreenchidos.length
        ? valoresPreenchidos.map(v => escapeHtml(v)).join(' · ')
        : 'Sem dados estruturados cadastrados ainda.';

    const badgeStatus = a.status === 'arquivado'
        ? `<span class="text-[11px] font-bold px-1.5 py-0.5 rounded flex-none" style="background:var(--danger-bg); color:var(--danger)">Arquivado</span>`
        : `<span class="text-[11px] font-bold px-1.5 py-0.5 rounded flex-none" style="background:var(--success-bg); color:var(--success)">Ativo</span>`;

    document.getElementById('fa-resumo-dados').innerHTML = `
        <div class="flex items-start justify-between gap-2">
            <p class="text-xs flex-1" style="color:var(--sage)">${descricaoCorrida}</p>
            ${badgeStatus}
        </div>`;

    refrescarIcones();
}

function documentosDoAtivo(ativoId) {
    return estado.documentos.filter(d => (d.cofre_documento_vinculos || []).some(v => v.entidade_tipo === 'ativo' && v.entidade_id === ativoId));
}

export async function excluirAtivoAtual() {
    const a = estado.ativoEmFoco;
    if (!a) return;
    if (!confirm(`Excluir "${a.nome_exibicao}"? Esta ação fica registrada e não pode ser desfeita pela interface.`)) return;
    try {
        await api.arquivarAtivo(a.id);
        await api.registrarLogAcessos(estado.clienteId, estado.pessoa.id, 'cofre.excluir', { ativoId: a.id, nome: a.nome_exibicao });
        mostrarToast('Ativo excluído.');
        fecharFichaAtivo();
    } catch (err) { mostrarToast('Erro: ' + err.message, 'erro'); }
}

// ---- Editar (secundário, dentro do Resumo — Adendo §7.2/§9.2)
export function alternarEditarAtivo() {
    const aberto = !document.getElementById('fa-editar-wrapper').classList.contains('hidden');
    if (aberto) { document.getElementById('fa-editar-wrapper').classList.add('hidden'); return; }
    const a = estado.ativoEmFoco;
    document.getElementById('fa-editar-campos').innerHTML =
        `<div class="sm:col-span-2"><label class="text-xs font-semibold block mb-1">Nome de exibição</label><input type="text" id="fa-editar-nome" value="${escapeHtml(a.nome_exibicao)}" class="w-full border-2 border-slate-300 rounded-xl p-2 text-sm"></div>` +
        renderizarCamposEstruturados(a.tipo_ativo, a.dados_especificos || {}, 'fa-editar-campo-');
    document.getElementById('fa-editar-wrapper').classList.remove('hidden');
}

export async function salvarEdicaoAtivo() {
    const a = estado.ativoEmFoco;
    const nome = document.getElementById('fa-editar-nome').value.trim();
    if (!nome) { mostrarToast('Nome não pode ficar vazio.', 'erro'); return; }
    const dados = lerCamposEstruturados(a.tipo_ativo, 'fa-editar-campo-');
    try {
        await api.atualizarAtivo(a.id, { nome_exibicao: nome, dados_especificos: dados });
        await api.registrarLogAcessos(estado.clienteId, estado.pessoa.id, 'cofre.editar', { ativoId: a.id, acao: 'editar_ativo' });
        mostrarToast('Ativo atualizado ✅');
        window.dispatchEvent(new CustomEvent('cofre:recarregar-ativos'));
        await abrirFichaAtivo(a.id); // "Salvar edição → voltar para a ficha atualizada" (§9.2)
    } catch (err) { mostrarToast('Erro: ' + err.message, 'erro'); }
}

export function abrirGestaoImovel() {
    const a = estado.ativoEmFoco;
    if (a?.entidade_origem_tipo === 'imovel' && a.entidade_origem_id) {
        window.location.href = `./?abrir=imovel&ref=${encodeURIComponent(a.entidade_origem_id)}`;
    }
}

// ---- Documentos
function montarDocumentosAtivo(a) {
    const docs = documentosDoAtivo(a.id);
    document.getElementById('fa-tab-documentos').innerHTML = docs.length
        ? docs.map(d => `<button data-action="abrir-documento" data-id="${d.id}" class="w-full text-left raiz-bloco-interno flex items-center justify-between"><span class="text-sm">${escapeHtml(d.nome_exibicao)}</span><i data-lucide="chevron-right" style="width:14px;height:14px;color:var(--sage)"></i></button>`).join('')
        : `<p class="text-xs" style="color:var(--sage)">Nenhum documento vinculado a este ativo ainda.</p>`;
}

// ---- Documentos: upload agora é via modal-documentos-ativo (2 ações: IA/
// upload simples — cofre-documentos.js abrirUploadNoAtivoComIA/SemIA).
// A antiga abrirUploadNoAtivo() (fechava a ficha e ia pro upload global)
// foi removida — não fazia sentido depois que Documentos virou modal
// próprio dentro da ficha, sem precisar sair dela.

// ---- Alertas: box REMOVIDO da ficha do ativo (v6, pedido explícito) —
// alertas agora são 100% derivados de Itens de Controle (ver box
// "Controles" e a ficha própria de cada item, cofre-controles.js). Não
// existe mais cadastro de alerta avulso por ativo.

// ---- Contatos: REMOVIDO desta ficha (pedido explícito) — contatos agora
// vinculam a um Item de Controle, não ao Ativo direto. Ver
// js/cofre-controles.js (abrirFichaItemControle, box "Contatos vinculados").

// ---- Fotos (privado por padrão; "selecionada p/ Vitrine" ≠ publicado — Adendo §16/§17)
async function montarFotosAtivo(a) {
    const fotos = await api.listarFotosAtivo(a.id);
    renderizarGridFotos(fotos);
    const inputFoto = document.getElementById('fa-foto-input');
    inputFoto.value = '';
    inputFoto.onchange = () => enviarFotosAtivo(a.id);
}

function renderizarGridFotos(fotos) {
    const grid = document.getElementById('fa-fotos-grid');
    grid.innerHTML = fotos.length ? fotos.map(f => `
        <div class="relative">
            <div class="aspect-square rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center"><i data-lucide="image" style="color:var(--sage)"></i></div>
            <label class="flex items-center gap-1 text-[10px] mt-1">
                <input type="checkbox" data-action-change="alternar-vitrine-foto" data-foto-id="${f.id}" ${f.publicar_vitrine ? 'checked' : ''}> Selecionada p/ Vitrine
            </label>
        </div>`).join('') : `<p class="text-xs col-span-3" style="color:var(--sage)">Nenhuma foto ainda.</p>`;
    refrescarIcones();
}

async function enviarFotosAtivo(ativoId) {
    const arquivos = document.getElementById('fa-foto-input').files;
    const statusEl = document.getElementById('fa-status');
    if (!arquivos.length) return;
    statusEl.textContent = 'Enviando fotos…'; statusEl.style.color = 'var(--sage)';
    let ordem = 0;
    for (const arquivo of arquivos) {
        const fotoId = crypto.randomUUID();
        const path = `${estado.clienteId}/ativos/${ativoId}/fotos/${fotoId}_${arquivo.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        try {
            await api.uploadArquivoDocumento(path, arquivo); // mesmo bucket/serviço de upload que documentos
            await api.inserirFotoAtivo({ id: fotoId, cliente_id: estado.clienteId, ativo_id: ativoId, bucket: 'cofre-documentos', storage_path: path, nome_arquivo: arquivo.name, ordem: ordem++, criado_por: estado.pessoa.id });
        } catch (err) {
            statusEl.textContent = '❌ ' + err.message; statusEl.style.color = 'var(--danger)';
        }
    }
    statusEl.textContent = 'Fotos enviadas ✅'; statusEl.style.color = 'var(--success)';
    renderizarGridFotos(await api.listarFotosAtivo(ativoId));
}

export async function alternarVitrineFoto(fotoId, valor) {
    try {
        await api.alternarPublicarVitrineFoto(fotoId, valor);
        mostrarToast(valor ? 'Foto selecionada para a Vitrine (publicação real ainda não implementada — ver HANDOFF).' : 'Foto removida da seleção.', 'aviso');
    } catch (err) { mostrarToast('Erro: ' + err.message, 'erro'); }
}

// ---- Histórico (Adendo §16 — reaproveita log_acessos)
async function montarHistoricoAtivo(a) {
    const eventos = await api.listarHistoricoAtivo(estado.clienteId, a.id);
    document.getElementById('fa-tab-historico').innerHTML = eventos.length
        ? eventos.map(ev => `<div class="raiz-bloco-interno text-xs"><b>${escapeHtml(rotuloAcaoHistorico(ev.acao))}</b><div style="color:var(--sage)">${escapeHtml(ev.pessoas?.nome || '')} · ${formatarDataBR((ev.criado_em || '').slice(0, 10))}</div></div>`).join('')
        : `<p class="text-xs" style="color:var(--sage)">Sem histórico registrado ainda.</p>`;
}

function rotuloAcaoHistorico(acao) {
    return { 'cofre.upload': 'Documento anexado', 'cofre.editar': 'Ativo editado', 'cofre.excluir': 'Documento excluído', 'cofre.baixar': 'Documento baixado' }[acao] || acao;
}
