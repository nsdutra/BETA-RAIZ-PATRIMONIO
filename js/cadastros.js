// ============================================================================
// cadastros.js — Raiz Patrimônio · Telas de cadastro do menu ⚙️
// Versão: 1.0.0 · 05/09/2026
//
// FATIA 7b-ii (parte 1) — primeiro módulo nascido sob a regra E0 do
// PLANO_FRAGMENTACAO_INDEX_v1_0.md ("nada novo nasce no index"). Telas
// Tipo de Imóvel e Tipo de Empreendimento reconstruídas na gramática
// (REGRAS §4/§9): .rz-tabhead com descrição + "+", lista .rz-row com ⋮
// (Renomear · Excluir), criação/renome via abrirSheetForm. O padrão
// antigo (h2 + raiz-btn-toggle + form inline Tipo A) morre com a
// migração. Minutas entra na parte 2 da fatia (amarrada ao motor de
// contratação — migra separada de propósito).
//
// PONTES com o index (padrão satélite validado pelo Cofre/comum-*):
//  - dbAuth: window.__raizDbAuth (exposto desde a v1.115).
//  - clienteId: parâmetro de montarCadastroTipos() (mesmo padrão do
//    montarAtivosTab).
//  - Validação de "em uso" e recarga dos selects do formulário de
//    imóvel: window.__raizCadastrosPonte (index v1.120) — a checagem
//    usa os arrays em memória do index (imoveis), idêntica à regra
//    antiga; a recarga reaproveita carregarTipos/Empreendimentos +
//    popularSelectsEmpreendimentoTipo do index sem duplicar nada.
//  - UI compartilhada: abrirSheetForm/abrirSheetAcoes/mostrarToast/
//    rzEsc/rzIcones são function declarations do script clássico do
//    index → acessíveis via window.
// ============================================================================

const db = () => window.__raizDbAuth;
const ponte = () => window.__raizCadastrosPonte || {};

const TELAS = {
    'tipo-imovel': {
        tabela: 'tipos_imovel',
        titulo: 'tipo de imóvel',
        plural: 'tipos de imóvel',
        descricao: 'Os nomes daqui viram as opções de "Tipo" no cadastro do imóvel. Excluir não apaga dado de imóvel existente — só deixa de aparecer como opção nova.',
        icone: 'home',
        emUso: (id) => (ponte().emUsoTipoImovel || (() => false))(id),
        msgEmUso: 'Há imóvel cadastrado com este tipo. Mude o tipo do(s) imóvel(is) antes de excluir.',
    },
    'empreendimentos': {
        tabela: 'empreendimentos',
        titulo: 'empreendimento',
        plural: 'empreendimentos',
        descricao: 'Empreendimentos agrupam imóveis e são a base dos vínculos de síndico e manutencista. Excluir não apaga dado de imóvel existente.',
        icone: 'landmark',
        emUso: (id) => (ponte().emUsoEmpreendimento || (() => false))(id),
        msgEmUso: 'Há imóvel cadastrado neste empreendimento. Mude o empreendimento do(s) imóvel(is) antes de excluir.',
    },
};

let clienteIdAtual = null;
const cache = {}; // chave da tela → [{id, nome}]

export async function montarCadastroTipos(clienteId, chave) {
    clienteIdAtual = clienteId;
    const cfg = TELAS[chave];
    const mount = document.getElementById('mount-' + chave);
    if (!cfg || !mount) return;
    mount.innerHTML = `
        <div class="rz-tabhead">
            <p>${cfg.descricao}</p>
            <button type="button" data-cad-novo="${chave}" title="Adicionar" aria-label="Adicionar" class="rz-ico-btn rz-primary"><svg data-lucide="plus"></svg></button>
        </div>
        <div class="rz-card rz-list" id="cad-lista-${chave}"><div class="rz-empty"><p>Carregando…</p></div></div>`;
    mount.querySelector('[data-cad-novo]').addEventListener('click', () => abrirFormNome(chave));
    if (window.rzIcones) window.rzIcones();
    await recarregar(chave);
}

async function recarregar(chave) {
    const cfg = TELAS[chave];
    const lista = document.getElementById('cad-lista-' + chave);
    try {
        const { data, error } = await db().from(cfg.tabela).select('id, nome').eq('cliente_id', clienteIdAtual).order('nome');
        if (error) throw error;
        cache[chave] = data || [];
    } catch (err) {
        console.warn('[cadastros] Falha ao carregar ' + cfg.tabela + ':', err.message);
        if (lista) lista.innerHTML = '<div class="rz-empty"><p>Não foi possível carregar agora.</p></div>';
        return;
    }
    render(chave);
}

function render(chave) {
    const cfg = TELAS[chave];
    const lista = document.getElementById('cad-lista-' + chave);
    if (!lista) return;
    const itens = cache[chave] || [];
    if (!itens.length) {
        lista.innerHTML = `<div class="rz-empty"><div class="rz-ic"><svg data-lucide="${cfg.icone}"></svg></div><p>Nenhum ${cfg.titulo} ainda. Toque no "+" pra cadastrar o primeiro.</p></div>`;
        if (window.rzIcones) window.rzIcones();
        return;
    }
    lista.innerHTML = itens.map(t => `
        <div class="rz-row">
            <div class="rz-ic"><svg data-lucide="${cfg.icone}"></svg></div>
            <div class="rz-tx"><b>${window.rzEsc ? window.rzEsc(t.nome) : t.nome}</b></div>
            <button type="button" data-cad-acoes="${t.id}" class="rz-more" aria-label="Mais ações"><svg data-lucide="ellipsis-vertical"></svg></button>
        </div>`).join('');
    lista.querySelectorAll('[data-cad-acoes]').forEach(btn =>
        btn.addEventListener('click', () => abrirAcoes(chave, btn.getAttribute('data-cad-acoes'))));
    if (window.rzIcones) window.rzIcones();
}

function abrirAcoes(chave, id) {
    const cfg = TELAS[chave];
    const item = (cache[chave] || []).find(t => t.id === id);
    if (!item || typeof window.abrirSheetAcoes !== 'function') return;
    window.abrirSheetAcoes({ titulo: item.nome, sub: 'Cadastro de ' + cfg.titulo, acoes: [
        { icone: 'pencil', titulo: 'Renomear', aoTocar: () => abrirFormNome(chave, item) },
        { icone: 'trash-2', titulo: 'Excluir', tipo: 'bad', aoTocar: () => excluir(chave, item) },
    ] });
}

function abrirFormNome(chave, item) {
    const cfg = TELAS[chave];
    if (typeof window.abrirSheetForm !== 'function') return;
    window.abrirSheetForm({
        titulo: item ? 'Renomear ' + cfg.titulo : 'Novo ' + cfg.titulo,
        sub: item ? item.nome : '',
        rotuloSalvar: item ? 'Salvar' : 'Cadastrar',
        corpo: `<label class="block text-xs font-bold text-gray-600">Nome</label>
                <input type="text" id="cad-nome-input" value="${item ? (window.rzEsc ? window.rzEsc(item.nome) : item.nome) : ''}" class="w-full p-2 border rounded mt-1 text-sm" placeholder="Ex.: ${chave === 'tipo-imovel' ? 'Apartamento' : 'Residencial Aurora'}">`,
        aoSalvar: async (el) => {
            const nome = (el.querySelector('#cad-nome-input')?.value || '').trim();
            if (!nome) { window.mostrarToast?.('Informe o nome.', 'danger'); return false; }
            const duplicado = (cache[chave] || []).some(t => t.nome.toLowerCase() === nome.toLowerCase() && (!item || t.id !== item.id));
            if (duplicado) { window.mostrarToast?.('Já existe um cadastro com este nome.', 'danger'); return false; }
            try {
                if (item) {
                    const { error } = await db().from(cfg.tabela).update({ nome }).eq('id', item.id);
                    if (error) throw error;
                } else {
                    const { error } = await db().from(cfg.tabela).insert({ cliente_id: clienteIdAtual, nome });
                    if (error) throw error;
                }
                window.mostrarToast?.(item ? 'Renomeado.' : 'Cadastrado.', 'success');
                await recarregar(chave);
                ponte().aoAlterar?.(chave);
            } catch (err) {
                window.mostrarToast?.('Não consegui salvar: ' + (err.message || String(err)), 'danger');
                return false;
            }
        },
    });
}

async function excluir(chave, item) {
    const cfg = TELAS[chave];
    if (cfg.emUso(item.id)) { window.mostrarToast?.(cfg.msgEmUso, 'danger'); return; }
    if (!confirm(`Excluir "${item.nome}"?`)) return;
    try {
        const { error } = await db().from(cfg.tabela).delete().eq('id', item.id);
        if (error) throw error;
        window.mostrarToast?.('Excluído.', 'success');
        await recarregar(chave);
        ponte().aoAlterar?.(chave);
    } catch (err) {
        window.mostrarToast?.('Não consegui excluir: ' + (err.message || String(err)), 'danger');
    }
}
