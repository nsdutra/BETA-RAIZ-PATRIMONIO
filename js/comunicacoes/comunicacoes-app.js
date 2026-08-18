// Raiz Patrimônio — Central de Comunicações — Orquestrador
// Beta v1.43.0
import { configurarApiComunicacoes, buscarComunicacoesElegiveis, registrarInteracao } from './comunicacoes-api.js';
import { selecionarComunicacao } from './comunicacoes-regras.js';
import { renderizarOnboarding, fecharComunicacao } from './comunicacoes-ui.js';
import { obterEstadoPwa, solicitarInstalacaoPwa } from './pwa-instalacao.js';

let ultimaContexto = null;

async function registrarSeguro(comunicacao, contexto, evento, detalhe = {}) {
    try {
        await registrarInteracao({
            comunicacaoId: comunicacao.id,
            pessoaId: contexto.pessoaId,
            clienteId: contexto.clienteId,
            evento,
            detalhe
        });
    } catch (erro) {
        console.warn('[comunicacoes] Falha ao registrar interação:', erro.message);
    }
}

async function processarComunicacoes(evento) {
    const ctx = evento.detail || {};
    if (!ctx.dbAuth || !ctx.pessoaId || !ctx.clienteId) return;
    ultimaContexto = ctx;
    configurarApiComunicacoes(ctx.dbAuth);

    try {
        const candidatas = await buscarComunicacoesElegiveis({
            pessoaId: ctx.pessoaId,
            clienteId: ctx.clienteId
        });
        const pwa = obterEstadoPwa();
        const contextoRegras = {
            semImoveis: Number(ctx.quantidadeImoveis || 0) === 0,
            pwaInstalado: pwa.standalone,
            plano: ctx.plano || null,
            perfil: ctx.perfil || null,
            tela: ctx.tela || 'inicio',
            dispositivo: pwa.navegador
        };
        const comunicacao = selecionarComunicacao(candidatas, contextoRegras);

        if (!comunicacao) {
            ctx.onSemComunicacao?.();
            return;
        }

        await registrarSeguro(comunicacao, ctx, 'exibiu', {
            tela: contextoRegras.tela,
            dispositivo: contextoRegras.dispositivo,
            pwa_instalado: pwa.standalone
        });

        if (comunicacao.tipo === 'onboarding' && comunicacao.formato === 'modal') {
            renderizarOnboarding({
                comunicacao,
                estadoPwa: pwa,
                onFechar: async () => {
                    await registrarSeguro(comunicacao, ctx, 'fechou', { motivo: 'agora_nao' });
                    fecharComunicacao();
                },
                onInstalar: async () => {
                    await registrarSeguro(comunicacao, ctx, 'clicou', { acao: 'instalar_pwa' });
                    const resultado = await solicitarInstalacaoPwa();
                    if (resultado.resultado === 'aceito' || resultado.resultado === 'ja_instalado') {
                        await registrarSeguro(comunicacao, ctx, 'instalou', { resultado: resultado.resultado });
                    }
                    return resultado;
                },
                onConcluir: async () => {
                    await registrarSeguro(comunicacao, ctx, 'concluiu', { acao_final: 'abrir_formulario_imovel' });
                    fecharComunicacao();
                    ctx.onAcaoFinal?.('abrir_formulario_imovel');
                }
            });
            return;
        }

        // Fase 1 só implementa modal de onboarding. Formatos futuros falham sem bloquear o app.
        await registrarSeguro(comunicacao, ctx, 'erro', { motivo: 'formato_nao_implementado' });
        ctx.onSemComunicacao?.();
    } catch (erro) {
        console.warn('[comunicacoes] Falha ao processar central:', erro.message);
        ctx.onSemComunicacao?.();
    }
}

window.addEventListener('raiz:comunicacoes:processar', processarComunicacoes);
