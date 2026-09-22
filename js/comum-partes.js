// ============================================================================
// comum-partes.js — Raiz Patrimônio · Componente de dados de Parte
// Versão: 1.0.0 · 22/09/2026
//
// v1.0.0 — demanda be42b19f ("Padronizar componente de Parte em todo o
// app"), achado do Nicola em revisão de telas (21/09/2026): o formulário/
// visualizador de uma Parte (locatário, fiador, proprietário, prestador...)
// não era único — cada tela reimplementava o seu, incompleto de um jeito
// diferente (uma sem endereço estruturado, outra sem profissão/estado
// civil, outra sem sequer abrir). Este módulo nasce com a MESMA filosofia
// "zero dependência" de comum-endereco.js/comum-pessoas.js/comum-minha-
// empresa.js: só monta HTML e lê de volta um objeto — nenhum import de
// cofre-ui.js, nenhuma chamada de rede. Quem chama decide COMO mostrar
// (abrirSheetForm, modalGenerico, sheetAcoes — cada tela já tem o seu) e
// faz a escrita (dbAuth.from('partes')...), exatamente como
// comum-endereco.js já faz pro bloco de endereço.
//
// Endereço não mora aqui: renderizarBlocoDadosParte() só cobre os campos
// "pessoais" (nome, documento, contato, profissão/estado civil). Quem
// monta o formulário completo de uma Parte compõe isto + o bloco de
// comum-endereco.js (renderizarBlocoEndereco/lerBlocoEndereco) — mesma
// composição que o próprio header de comum-endereco.js já previa
// ("partes e contrato", nenhum dos dois reescrito naquela entrega).
//
// Uso: renderizarBlocoDadosParte(prefixo, valores, opcoes) devolve o HTML
// pra colar dentro de um form; lerBlocoDadosParte(prefixo, opcoes) lê de
// volta um objeto no formato das colunas de `partes` (nome, documento,
// doc_tipo, whatsapp, email, nome_fantasia, profissao, estado_civil,
// contato_nome). formatarEnderecoParte(parte) devolve 1 string pronta pra
// exibir (kv de resumo, minuta) ou gravar na coluna antiga `endereco` —
// usa os campos estruturados quando existem, cai pro texto livre antigo
// em registros que nunca passaram pelo formulário novo (DAD-04: dado
// antigo não é apagado, só deixa de ser a fonte preferida).
// ============================================================================

export const VERSAO = '1.0.0'; // v-check: lido por ⚙️ › Conta › Versões — manter igual ao header

function escapeHtml(s) {
    return (s ?? '').toString().replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function val(v) { return escapeHtml(v ?? ''); }

const ESTADO_CIVIL_OPCOES = ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União estável'];

// ============================================================================
// RENDER — campos "pessoais" da Parte. `opcoes`:
//   mostrarDocumento (default true) — CPF/CNPJ, com id de indicador de
//     validação (`${prefixo}-doc-indicador`) pro CALLER ligar a máscara/
//     validação já usada em cada tela (formatarMascaraDocumentoGenerico
//     ou equivalente) — este módulo não valida documento sozinho, mesma
//     filosofia "zero dependência" do bloco de CEP em comum-endereco.js.
//   mostrarNomeFantasia (default false)
//   mostrarContatoNome (default false) — "nome de quem responde" (usado
//     em prestadores/locatário, não em fiador avulso)
//   mostrarProfissaoEstadoCivil (default true) — só faz sentido pra
//     pessoa física; quem chama pode esconder quando já sabe que é PJ.
//   camposObrigatorios (default ['nome']) — array de nomes de campo pra
//     marcar com "*"; puramente visual, cada tela mantém sua própria
//     validação no aoSalvar.
// ============================================================================
export function renderizarBlocoDadosParte(prefixo, valores = {}, opcoes = {}) {
    const v = valores || {};
    const obrig = new Set(opcoes.camposObrigatorios || ['nome']);
    const marca = (campo) => obrig.has(campo) ? ' <i style="color:var(--danger, #dc2626);font-style:normal">*</i>' : '';
    const mostrarDocumento = opcoes.mostrarDocumento !== false;
    const mostrarNomeFantasia = !!opcoes.mostrarNomeFantasia;
    const mostrarContatoNome = !!opcoes.mostrarContatoNome;
    const mostrarPF = opcoes.mostrarProfissaoEstadoCivil !== false;

    return `
        <div class="rz-f"><label>Nome${marca('nome')}</label><input type="text" id="${prefixo}-nome" value="${val(v.nome)}"></div>
        ${mostrarDocumento ? `
        <div class="rz-f"><label>Documento (CPF ou CNPJ)${marca('documento')}</label>
            <input type="text" id="${prefixo}-documento" value="${val(v.documento)}" placeholder="Só os números">
            <span class="rz-hint" id="${prefixo}-doc-indicador"></span>
        </div>` : ''}
        <div style="display:flex;gap:8px">
            <div class="rz-f" style="flex:1"><label>WhatsApp${marca('whatsapp')}</label><input type="tel" id="${prefixo}-whatsapp" value="${val(v.whatsapp)}" placeholder="(11) 91234-5678"></div>
            <div class="rz-f" style="flex:1"><label>E-mail${marca('email')}</label><input type="email" id="${prefixo}-email" value="${val(v.email)}"></div>
        </div>
        ${mostrarNomeFantasia ? `<div class="rz-f"><label>Nome fantasia</label><input type="text" id="${prefixo}-nome-fantasia" value="${val(v.nome_fantasia)}"></div>` : ''}
        ${mostrarContatoNome ? `<div class="rz-f"><label>Nome do contato</label><input type="text" id="${prefixo}-contato-nome" value="${val(v.contato_nome)}"></div>` : ''}
        ${mostrarPF ? `
        <div style="display:flex;gap:8px">
            <div class="rz-f" style="flex:1"><label>Profissão</label><input type="text" id="${prefixo}-profissao" value="${val(v.profissao)}"></div>
            <div class="rz-f" style="flex:1"><label>Estado civil</label>
                <select id="${prefixo}-estado-civil">
                    <option value="">—</option>
                    ${ESTADO_CIVIL_OPCOES.map(o => `<option ${v.estado_civil === o ? 'selected' : ''}>${o}</option>`).join('')}
                </select>
            </div>
        </div>` : ''}
    `;
}

// ============================================================================
// LER — devolve o formato das colunas de `partes` (subconjunto "pessoal";
// endereço fica com lerBlocoEndereco, de comum-endereco.js). doc_tipo é
// derivado da quantidade de dígitos, mesma regra já usada em toda a base
// (>11 dígitos = CNPJ).
// ============================================================================
export function lerBlocoDadosParte(prefixo, opcoes = {}) {
    const g = id => (document.getElementById(`${prefixo}-${id}`)?.value || '').trim();
    const documento = opcoes.mostrarDocumento !== false ? g('documento') : '';
    const digitos = documento.replace(/\D/g, '');
    const out = {
        nome: g('nome'),
        whatsapp: g('whatsapp') || null,
        email: g('email') || null,
    };
    if (opcoes.mostrarDocumento !== false) {
        out.documento = documento || null;
        out.doc_tipo = digitos.length > 11 ? 'CNPJ' : (digitos.length > 0 ? 'CPF' : null);
    }
    if (opcoes.mostrarNomeFantasia) out.nome_fantasia = g('nome-fantasia') || null;
    if (opcoes.mostrarContatoNome) out.contato_nome = g('contato-nome') || null;
    if (opcoes.mostrarProfissaoEstadoCivil !== false) {
        out.profissao = g('profissao') || null;
        out.estado_civil = g('estado-civil') || null;
    }
    return out;
}

// ============================================================================
// RESUMO — kv HTML só-leitura pra sheet/ficha (mesma classe .rz-kv/.rz-full
// já usada em todo o app — nenhum componente novo). `parte` no formato de
// uma linha de `partes` (nome/documento/doc_tipo/whatsapp/email/
// nome_fantasia/profissao/estado_civil/contato_nome + colunas de endereço
// estruturado OU a antiga `endereco`).
// ============================================================================
export function renderizarResumoParte(parte) {
    const p = parte || {};
    const kv = (r, v, cheio) => v ? `<div${cheio ? ' class="rz-full"' : ''}><small>${escapeHtml(r)}</small><b>${escapeHtml(String(v))}</b></div>` : '';
    const endereco = formatarEnderecoParte(p);
    return `<div class="rz-kv">
        ${kv('Documento', p.documento ? `${p.doc_tipo || ''} ${p.documento}`.trim() : '')}
        ${kv('Nome fantasia', p.nome_fantasia)}
        ${kv('WhatsApp', p.whatsapp)}
        ${kv('E-mail', p.email)}
        ${kv('Contato', p.contato_nome)}
        ${kv('Profissão', p.profissao)}
        ${kv('Estado civil', p.estado_civil)}
        ${kv('Endereço', endereco, true)}
    </div>`;
}

// ============================================================================
// ENDEREÇO EM 1 LINHA — usa as colunas estruturadas quando existe pelo
// menos rua ou cidade preenchida; cai pra `.endereco` (texto livre antigo)
// senão. É esta função que decide o que vai pro campo de exibição/minuta
// — nunca concatena os dois formatos juntos.
// ============================================================================
export function formatarEnderecoParte(parte) {
    const p = parte || {};
    if (p.endereco_rua || p.endereco_cidade) {
        return [
            [p.endereco_rua, p.endereco_num].filter(Boolean).join(', '),
            p.endereco_comp,
            p.endereco_bairro,
            [p.endereco_cidade, p.uf].filter(Boolean).join(' - '),
            p.cep,
        ].filter(Boolean).join(', ');
    }
    return p.endereco || '';
}
