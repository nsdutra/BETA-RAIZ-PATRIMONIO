// ============================================================================
// comum-endereco.js — Raiz Patrimônio · Componente de endereço
// Versão: 1.1.0 · 23/09/2026
//
// v1.1.0 (pedido do Nicola, 23/09/2026 — frente fiscal): o código IBGE do
// município deixa de ser campo oculto e aparece no bloco, com a nota "Vem do
// CEP · usado na nota fiscal (NFS-e)". A busca do CEP passa a rodar sozinha
// quando o CEP fica com 8 dígitos (antes só pelo botão Buscar) e SEMPRE
// atualiza o IBGE (antes só gravava se viesse valor). Leitura guarda só
// dígitos no IBGE. Campo e nota com classes .rz-f/.rz-hint (sem estilo solto).
//
// v1.0.0 — PLANO_IMPLEMENTACAO v1.0, etapa E6.2. Um componente no Design
// System, três consumidores previstos: ficha do ativo (cofre_ativos, colunas
// da E6.1), partes e contrato (backlog 11) — nenhum dos três é reescrito
// nesta entrega, só o componente nasce. Decisões do Nicola:
//   - CEP consultado DIRETO DO NAVEGADOR (ViaCEP) — sem Edge Function, sem
//     backend no meio. Falha de rede/CORS nunca trava o formulário: degrada
//     pra digitação manual, silenciosamente (log no console, sem alertar
//     o usuário com um toast por uma consulta que é só atalho).
//   - Botão "usar endereço de outro ativo" COPIA os campos, não vincula —
//     editar depois não afeta a origem.
// `endereco_tipo` não existe aqui de propósito: é o tipo_detalhe_id da E4
// (mesma coisa, decisão do Nicola) — este componente só lida com os 8
// campos de endereço + cidade/UF/IBGE que a E6.1 criou em cofre_ativos.
//
// Uso: renderizarBlocoEndereco(prefixo, valores) devolve o HTML pra colar
// dentro de um <form>; lerBlocoEndereco(prefixo) lê de volta um objeto no
// formato das colunas de cofre_ativos (endereco_rua, endereco_num, ...).
// IDs dos campos: `${prefixo}-cep`, `${prefixo}-rua`, etc.
// ============================================================================

export const VERSAO = '1.1.0'; // v-check: lido por Dev › Versões — manter igual ao header

const UF_OPCOES = ['', 'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
    'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

function escapeHtml(s) {
    return (s ?? '').toString().replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function val(v) { return escapeHtml(v ?? ''); }

// ============================================================================
// RENDER — bloco de endereço, gramática .rz-f (mesmo catálogo do resto do
// app, ver comum-minha-empresa.js v1.4.0). `valores` no formato das colunas
// de cofre_ativos: { endereco_rua, endereco_num, endereco_comp,
// endereco_bairro, endereco_cidade, uf, codigo_ibge_municipio, cep }.
// `opcoes.mostrarBotaoCopiar` (default true) controla se o botão "usar
// endereço de outro ativo" aparece — quem chama decide (não faz sentido no
// PRIMEIRO ativo de uma empresa nova, por exemplo).
// ============================================================================
export function renderizarBlocoEndereco(prefixo, valores = {}, opcoes = {}) {
    const v = valores || {};
    const mostrarCopiar = opcoes.mostrarBotaoCopiar !== false;
    const opcoesUF = UF_OPCOES.map(uf => `<option value="${uf}" ${uf === (v.uf || '') ? 'selected' : ''}>${uf || '—'}</option>`).join('');

    return `
        <div class="rz-f" style="max-width:180px">
            <label>CEP</label>
            <div style="display:flex;gap:8px">
                <input type="text" id="${prefixo}-cep" inputmode="numeric" maxlength="9" placeholder="00000-000" value="${val(v.cep)}" style="flex:1"
                    oninput="window.rzCepDigitado && window.rzCepDigitado('${prefixo}')">
                <button type="button" id="${prefixo}-btn-cep" onclick="window.rzConsultarCepBloco && window.rzConsultarCepBloco('${prefixo}')"
                    class="text-xs font-bold px-3 rounded-lg" style="background:var(--tile);color:var(--pine)">Buscar</button>
            </div>
            <span class="rz-hint" id="${prefixo}-cep-status"></span>
        </div>
        <div class="rz-f"><label>Rua</label><input type="text" id="${prefixo}-rua" value="${val(v.endereco_rua)}"></div>
        <div style="display:flex;gap:8px">
            <div class="rz-f" style="max-width:110px"><label>Número</label><input type="text" id="${prefixo}-num" value="${val(v.endereco_num)}"></div>
            <div class="rz-f" style="flex:1"><label>Complemento</label><input type="text" id="${prefixo}-comp" value="${val(v.endereco_comp)}"></div>
        </div>
        <div class="rz-f"><label>Bairro</label><input type="text" id="${prefixo}-bairro" value="${val(v.endereco_bairro)}"></div>
        <div style="display:flex;gap:8px">
            <div class="rz-f" style="flex:1"><label>Cidade</label><input type="text" id="${prefixo}-cidade" value="${val(v.endereco_cidade)}"></div>
            <div class="rz-f" style="max-width:90px"><label>UF</label><select id="${prefixo}-uf">${opcoesUF}</select></div>
        </div>
        <div class="rz-f">
            <label for="${prefixo}-ibge">Código do município (IBGE)</label>
            <input type="text" id="${prefixo}-ibge" inputmode="numeric" maxlength="7" placeholder="7 dígitos" value="${val(v.codigo_ibge_municipio)}">
            <span class="rz-hint">Vem do CEP ao buscar. Usado na nota fiscal (NFS-e) — confira se o CEP estiver vazio.</span>
        </div>
        ${mostrarCopiar ? `<button type="button" onclick="window.rzAbrirCopiarEndereco && window.rzAbrirCopiarEndereco('${prefixo}')"
            class="text-xs font-bold flex items-center gap-1" style="color:var(--sage)">
            <svg data-lucide="copy" style="width:13px;height:13px"></svg> Usar endereço de outro ativo
        </button>` : ''}
    `;
    // Contrato do botão acima: quem for usar este componente num form real
    // precisa definir window.rzAbrirCopiarEndereco(prefixo) — normalmente
    // algo como: pega a lista de ativos da empresa, chama
    // botaoCopiarDeAtivo(prefixo, lista) pra obter o HTML da escolha, e
    // mostra esse HTML do jeito que a tela já usa (modalGenerico, sheet).
    // Este componente não sabe buscar ativo nenhum sozinho — de propósito,
    // zero dependência (mesma filosofia de comum-pessoas.js/comum-minha-
    // empresa.js: nenhum import de outro módulo).
}

// ============================================================================
// LER — devolve exatamente o formato das colunas de cofre_ativos (E6.1).
// CEP sempre só dígitos (o `.replace` tira a máscara na leitura, igual ao
// padrão já usado em comum-minha-empresa.js).
// ============================================================================
export function lerBlocoEndereco(prefixo) {
    const g = id => (document.getElementById(`${prefixo}-${id}`)?.value || '').trim();
    return {
        cep: g('cep').replace(/\D/g, '') || null,
        endereco_rua: g('rua') || null,
        endereco_num: g('num') || null,
        endereco_comp: g('comp') || null,
        endereco_bairro: g('bairro') || null,
        endereco_cidade: g('cidade') || null,
        uf: g('uf').toUpperCase() || null,
        codigo_ibge_municipio: g('ibge').replace(/\D/g, '') || null,
    };
}

// ============================================================================
// CONSULTAR CEP — ViaCEP, direto do navegador. Nunca lança: quem chama
// sempre recebe um objeto ({ok:true,...} ou {ok:false}), nunca uma exceção
// — é assim que "falha de rede não pode travar o formulário" vira código,
// não só intenção. Nenhum dado do cliente é enviado, só o CEP.
// ============================================================================
export async function consultarCep(cep) {
    const limpo = (cep || '').replace(/\D/g, '');
    if (limpo.length !== 8) return { ok: false, motivo: 'cep_invalido' };

    try {
        const resp = await fetch(`https://viacep.com.br/ws/${limpo}/json/`);
        if (!resp.ok) return { ok: false, motivo: 'rede' };
        const dados = await resp.json();
        if (dados.erro) return { ok: false, motivo: 'nao_encontrado' };
        return {
            ok: true,
            endereco_rua: dados.logradouro || null,
            endereco_bairro: dados.bairro || null,
            endereco_cidade: dados.localidade || null,
            uf: dados.uf || null,
            codigo_ibge_municipio: dados.ibge || null,
        };
    } catch (err) {
        // Falha de rede/CORS — degrada em silêncio, digitação manual segue
        // disponível. Log só pra quem for investigar depois, não é erro do
        // usuário.
        console.warn('[comum-endereco] consultarCep falhou:', err?.message || err);
        return { ok: false, motivo: 'excecao' };
    }
}

// Bridge pro onclick inline do botão "Buscar" — preenche o próprio bloco.
// Só existe pra fechar o ciclo do componente sozinho; quem monta um form
// pode ignorar e chamar consultarCep() direto, se preferir orquestrar.
window.rzConsultarCepBloco = async function (prefixo) {
    const elStatus = document.getElementById(`${prefixo}-cep-status`);
    const elBtn = document.getElementById(`${prefixo}-btn-cep`);
    const cepInput = document.getElementById(`${prefixo}-cep`)?.value;
    if (elBtn) elBtn.disabled = true;
    if (elStatus) elStatus.textContent = 'Buscando...';

    const r = await consultarCep(cepInput);

    if (elBtn) elBtn.disabled = false;
    if (!r.ok) {
        if (elStatus) elStatus.textContent = r.motivo === 'cep_invalido' ? 'CEP incompleto — preencha manualmente.' : 'Não encontrado — preencha manualmente.';
        return;
    }
    const set = (id, valor) => { const el = document.getElementById(`${prefixo}-${id}`); if (el && valor) el.value = valor; };
    set('rua', r.endereco_rua);
    set('bairro', r.endereco_bairro);
    set('cidade', r.endereco_cidade);
    set('uf', r.uf);
    // v1.1.0 — o IBGE sempre acompanha o CEP (é o município da nota fiscal)
    const elIbge = document.getElementById(`${prefixo}-ibge`);
    if (elIbge) elIbge.value = r.codigo_ibge_municipio || '';
    if (elStatus) elStatus.textContent = r.codigo_ibge_municipio ? `Município: ${r.endereco_cidade || ''}${r.uf ? '/' + r.uf : ''} · IBGE ${r.codigo_ibge_municipio}` : '';
};

// v1.1.0 — busca sozinha quando o CEP completa 8 dígitos (1 vez por CEP)
window.rzCepDigitado = function (prefixo) {
    const el = document.getElementById(`${prefixo}-cep`);
    const dig = (el?.value || '').replace(/\D/g, '');
    if (dig.length !== 8 || el.dataset.rzCepBuscado === dig) return;
    el.dataset.rzCepBuscado = dig;
    window.rzConsultarCepBloco(prefixo);
};

// ============================================================================
// COPIAR DE OUTRO ATIVO — COPIA os campos pro bloco de destino, não vincula
// (decisão do Nicola: editar depois não pode afetar a origem). `listaAtivos`
// é responsabilidade de quem chama (normalmente os ativos da mesma empresa
// com endereço preenchido) — este módulo não sabe buscar ativo nenhum
// sozinho, só orquestra a cópia depois de escolhido.
//
// Devolve o HTML da lista de escolha (nunca null — string vazia quando não
// há candidato), pra quem chamar decidir COMO mostrar (modalGenerico,
// bottom sheet, o que já usa na tela de origem) — mesma filosofia "zero
// dependência" dos outros módulos comum-*.js (comum-pessoas.js,
// comum-minha-empresa.js: nenhum deles importa de cofre-ui.js; quem monta
// a UI ao redor é sempre quem chama).
// ============================================================================
export function botaoCopiarDeAtivo(prefixo, listaAtivos) {
    const comEndereco = (listaAtivos || []).filter(a => a.endereco_rua || a.endereco_cidade);
    if (comEndereco.length === 0) return '';

    return `<div class="space-y-1">` + comEndereco.map(a => `
        <button type="button" onclick="window.rzCopiarEnderecoDeAtivo && window.rzCopiarEnderecoDeAtivo('${prefixo}', ${JSON.stringify(a).replace(/"/g, '&quot;')})"
            class="w-full text-left p-3 rounded-xl border" style="border-color:var(--line)">
            <div class="text-sm font-bold">${escapeHtml(a.nome_exibicao || 'Ativo sem nome')}</div>
            <div class="text-xs" style="color:var(--muted)">${escapeHtml([a.endereco_rua, a.endereco_num, a.endereco_bairro, a.endereco_cidade].filter(Boolean).join(', '))}</div>
        </button>
    `).join('') + `</div>`;
}

// Bridge pro onclick do item da lista — cópia de verdade, campo a campo.
// É um `window.rz*` (mesmo padrão de window.abrirFichaAtivoNoChip etc.),
// não um import — mantém este módulo sem dependência de nenhum outro.
window.rzCopiarEnderecoDeAtivo = function (prefixo, ativo) {
    const set = (id, valor) => { const el = document.getElementById(`${prefixo}-${id}`); if (el) el.value = valor || ''; };
    set('cep', ativo.cep);
    set('rua', ativo.endereco_rua);
    set('num', ''); // número NÃO copia — é específico da unidade, não do endereço-base
    set('comp', '');
    set('bairro', ativo.endereco_bairro);
    set('cidade', ativo.endereco_cidade);
    set('uf', ativo.uf);
    set('ibge', ativo.codigo_ibge_municipio);
    // Fecha o modal se foi aberto via modalGenerico (cofre-ui.js) — mesmo
    // efeito de fecharModal('modal-generico'), sem precisar importar.
    document.getElementById('modal-generico')?.classList.add('hidden');
    window.dispatchEvent(new CustomEvent('rz:endereco-copiado', { detail: { prefixo } }));
};
