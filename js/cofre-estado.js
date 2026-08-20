// ============================================================================
// cofre-estado.js — Raiz Patrimônio · Cofre de Documentos
// Versão: 1.1.0 · 19/08/2026
//
// Estado em memória, único, desta aba do navegador. Não é um framework de
// estado — é um objeto simples exportado por referência, para os módulos de
// tela (navegacao/documentos/ativos) lerem e escreverem sem precisar
// importar uns aos outros (evita ciclo de import).
// ============================================================================
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
