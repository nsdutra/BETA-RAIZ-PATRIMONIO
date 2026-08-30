// Raiz Patrimônio — Aceite de Termos/LGPD — Adaptador App
// Beta v1.0.0 · 30/08/2026
//
// Escuta 'raiz:termos:verificar' (disparado por index.html no MESMO lugar
// que antes disparava 'raiz:comunicacoes:processar' diretamente — ver
// index.html, pós-login). Só depois de resolver o aceite (nada pendente,
// ou pendente e já confirmado) é que este módulo dispara
// 'raiz:comunicacoes:processar' — nunca os dois modais concorrem, e a
// Central de Comunicações (comunicacoes-app.js) não precisou mudar nada.
//
// Atualizar aqui a cada vez que um dos 3 documentos for revisado —
// precisa bater exatamente com "versao_documento" usado no changelog de
// cada documento (TERMOS_DE_USO_RAIZ_PATRIMONIO.md,
// POLITICA_DE_PRIVACIDADE_RAIZ_PATRIMONIO.md,
// TERMO_BETA_TESTE_RAIZ_PATRIMONIO.md).
import { configurarApiConsentimento, buscarTermosPendentes, registrarAceiteTermo } from './consentimento-api.js';
import { renderizarAceiteTermos } from './consentimento-ui.js';

const VERSOES_TERMOS_VIGENTES = {
  termos_uso: 'TU-v1.0-2026-08',
  politica_privacidade: 'PP-v1.0-2026-08',
  termo_beta: 'TB-v1.0-2026-08'
};

// TODO: trocar pelas URLs públicas reais assim que os 3 documentos forem
// publicados (ex. raiz-site ou GitHub Pages do próprio repo).
const LINKS_TERMOS = {
  termos_uso: 'https://www.raizpatrimonio.com.br/termos-de-uso',
  politica_privacidade: 'https://www.raizpatrimonio.com.br/politica-de-privacidade',
  termo_beta: 'https://www.raizpatrimonio.com.br/termo-beta'
};

async function processar(ev) {
  const ctx = ev.detail || {};
  if (!ctx.dbAuth || !ctx.pessoaId || !ctx.clienteId) return;
  configurarApiConsentimento(ctx.dbAuth);

  try {
    const pendentes = await buscarTermosPendentes(VERSOES_TERMOS_VIGENTES);
    if (pendentes.length > 0) {
      await new Promise((resolve, reject) => {
        renderizarAceiteTermos({
          pendentes,
          links: LINKS_TERMOS,
          onConfirmar: async () => {
            try {
              for (const tipo of pendentes) {
                await registrarAceiteTermo(tipo, VERSOES_TERMOS_VIGENTES[tipo], 'app');
              }
              resolve();
            } catch (e) { reject(e); }
          }
        });
      });
    }
  } catch (e) {
    // Falha ao checar/registrar aceite não pode travar o login inteiro —
    // loga e segue (mesma filosofia best-effort de comunicacoes-app.js).
    console.warn('[consentimento] Falha:', e.message);
  } finally {
    // Dispara a Central de Comunicações só agora — nunca antes do aceite
    // estar resolvido, nunca concorrendo com o modal de termos.
    if (ctx.comunicacoesDetail) {
      window.dispatchEvent(new CustomEvent('raiz:comunicacoes:processar', { detail: ctx.comunicacoesDetail }));
    }
  }
}
window.addEventListener('raiz:termos:verificar', processar);
