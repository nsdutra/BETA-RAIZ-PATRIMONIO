// ============================================================================
// cofre-estado.js — Raiz Patrimônio · Cofre de Documentos
// Versão: 1.5.0 · 24/08/2026
//
// v1.5.1 — guarda defensiva no bootstrap (cofre-navegacao.js v1.1.3).
//
// v1.5.0 — item de controle ganhou tela própria (ver cofre-controles.js
// v1.1.0); Contatos saiu da ficha do ativo (agora vincula a Item de
// Controle); Documentos/Fotos viraram ações em "Mais ações" (modais
// próprios, não boxes fixos); upload com 2 caminhos (IA / simples).
// CORRIGIDO: header desta seção estava duplicado numa entrega anterior e
// COFRE_VERSAO tinha ficado presa em 1.3.1 mesmo com o changelog já
// falando de v1.4.0 — consolidado num único bloco de novo.
//
// v1.4.0 — bump maior de COFRE_VERSAO: ficha do ativo virou tela (não
// modal com abas), header idêntico ao padrão do App (empresa + selo de
// módulo), exclusão de ativo, valor estimado universal.
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
export const COFRE_VERSAO = '1.5.1';

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
