// ============================================================================
// cofre-estado.js — Raiz Patrimônio · Cofre de Documentos
// Versão: 1.1.0 · 19/08/2026
//
// Estado em memória, único, desta aba do navegador. Não é um framework de
// estado — é um objeto simples exportado por referência, para os módulos de
// tela (navegacao/documentos/ativos) lerem e escreverem sem precisar
// importar uns aos outros (evita ciclo de import).
// ============================================================================
// ============================================================================
// cofre-estado.js — Raiz Patrimônio · Cofre de Documentos
// Versão: 1.3.1 · 24/08/2026
//
// v1.3.1 — bump de COFRE_VERSAO: header simplificado (sem seletor de
// módulos), cofre-app.js v1.1.2 / cofre-navegacao.js v1.1.1.
//
// v1.3.0 — bump de COFRE_VERSAO: nova aba Controles na ficha do ativo
// (criar item de controle + tratar/reagendar/estornar ocorrência), módulo
// novo cofre-controles.js v1.0.0.
//
// v1.2.1 — bump de COFRE_VERSAO acompanhando cofre-ativos.js/cofre-validacoes.js
// v1.1.1 (novos tipos de ativo veiculo_blindado/obra_arte).
//
// Estado em memória, único, desta aba do navegador. Não é um framework de
// estado — é um objeto simples exportado por referência, para os módulos de
// tela (navegacao/documentos/ativos) lerem e escreverem sem precisar
// importar uns aos outros (evita ciclo de import).
// ============================================================================

// Fonte única da versão exibida (badge do header) — sincronizada com o
// comentário de cabeçalho de cofre.html. Atualizar aqui a cada entrega
// (mesma regra de sincronia de 3 pontos já usada no app principal).
export const COFRE_VERSAO = '1.3.1';

export const estado = {
    clienteId: null,
    pessoa: null,            // { id, nome, perfil, clienteNome }
    empresasDaPessoa: [],    // todas as linhas de `pessoas` deste usuário (multiempresa)
    categorias: [],
    documentos: [],
    ativos: [],
    eventos: [],
    contatos: [],
    contextoAtual: null,     // { tipo: 'ativo'|'imovel'|'contrato'|'pagamento'|'documento', ref: uuid|null, nome: string|null }
    documentoEmFoco: null,
    ativoEmFoco: null,
};
