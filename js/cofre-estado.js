// ============================================================================
// cofre-estado.js — Raiz Patrimônio · Cofre de Documentos
// Versão: 1.5.1 · 07/10/2026
//
// v1.5.1 (07/10/2026, sessão 20261007-1721-rolo-changelog, demanda 2507d554 — VER-05, "de acordo" do Nicola 07/10 17:21) — SÓ
// CABEÇALHO: as versões além das 5 mais recentes rolaram para o CHANGELOG_MODULOS.md.
// Nenhuma linha de código mudou — conferido token a token contra o publicado.
//
// Versão anterior: 1.5.0 · 24/08/2026
//
// v1.21.6 — Removido botão "Arquivar" da ficha do documento + fix de RLS
// no excluir (2 policies de UPDATE sobrepostas viraram 1). Ver changelog
// completo em cofre.html. cofre-estado.js em si não mudou de conteúdo
// — só o COFRE_VERSAO abaixo. NOTA: o COFRE_VERSAO já estava '1.21.5'
// antes desta entrega, sem changelog correspondente — pulo não
// documentado de sessão anterior, não desta entrega (ver nota em
// cofre.html). Seguindo em 1.21.6 pra não fingir continuidade que não
// houve.
//
// v1.21.4 — BUG FIX: grupo de 4 botões da ficha do documento quebrando
// linha (flex-wrap → grid 2 colunas) — pedido explícito. Ver changelog
// completo em cofre.html. cofre-estado.js em si não mudou de conteúdo
// — só o COFRE_VERSAO abaixo.
//
// v1.21.3 — Botão "Vincular" no padrão dos outros (Baixar/Arquivar/
// Excluir) — pedido explícito. Ver changelog completo em cofre.html.
// cofre-estado.js em si não mudou de conteúdo — só o COFRE_VERSAO
// abaixo.
//
// v1.21.2 — Cabeçalho volta a usar o token --pine-deep (pedido
// explícito, reverte v1.21.1). Ver changelog completo em cofre.html.
// cofre-estado.js em si não mudou de conteúdo — só o COFRE_VERSAO
// abaixo.
// --------------------------------------------------------------------------
// Versões anteriores (v1.2.1 … v1.21.1): CHANGELOG_MODULOS.md, na raiz do repositório — o
// gerar_versoes.py rola pra lá automaticamente tudo além das 5 versões
// mais recentes deste cabeçalho (VER-05).
export const VERSAO = '1.5.1'; // v-check (06/09/2026): lido por Dev › Versões — manter igual ao header
export const COFRE_VERSAO = '1.26.0';

export const estado = {
    clienteId: null,
    pessoa: null,            // { id, nome, perfil, clienteNome }
    empresasDaPessoa: [],    // todas as linhas de `pessoas` deste usuário (multiempresa)
    categorias: [],
    documentos: [],
    ativos: [],
    ocorrenciasAbertas: [], // v6: substitui `eventos` — alertas derivados, ver cofre-validacoes.js ocorrenciaEmAlerta()
    contatos: [],
    contextoAtual: null,     // { tipo: 'ativo'|'imovel'|'contrato'|'pagamento'|'documento', ref: uuid|null, nome: string|null }
    documentoEmFoco: null,
    ativoEmFoco: null,
};
