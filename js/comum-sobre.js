// ============================================================================
// comum-sobre.js — Raiz Patrimônio · Administração compartilhada
// Versão: 1.0.0 · 26/08/2026
//
// v1.0.0 — PRIMEIRA VERSÃO. Extraído de index.html (Beta v1.63.0 —
// aplicarBrandingCliente() [só a parte da aba Sobre] + atualizarSecaoSobreLicenca()
// + enviarFeedbackLivreSobre()) pra módulo compartilhado. Mesmo motivo e
// mesma sessão de comum-licenca.js — ver changelog completo lá, não
// repetido aqui. Este módulo importa comum-licenca.js pra saber qual
// licença mostrar no card compacto (buscarLicencaPrincipal) — nenhuma
// duplicação da lógica de licença entre os dois arquivos.
//
// O QUE FICOU DE FORA DE PROPÓSITO (continua no host, não neste
// módulo): logout de verdade (signOut + reload) — cada host pode querer
// um comportamento pós-logout diferente (ex.: redirecionar pra uma tela
// diferente), então este módulo só dispara `ctx.onLogout()`, nunca
// implementa o signOut ele mesmo. Mesmo princípio de callback já usado
// em comunicacoes-app.js (onToast/onAcaoFinal) dentro do próprio
// index.html.
//
// Diretriz Arquitetural: não cria seu próprio cliente Supabase — recebe
// `dbAuth` já autenticado do host, por parâmetro (ver nota completa em
// comum-licenca.js).
// ============================================================================

import { buscarLicencaPrincipal } from './comum-licenca.js';

export const COMUM_SOBRE_VERSAO = '1.0.0';

const WHATSAPP_SUPORTE_PADRAO = '5511947461828';
const EMAIL_SUPORTE_PADRAO = 'contato@raizpatrimonio.com.br';
const SITE_PADRAO = 'https://www.raizpatrimonio.com.br';

const NOMES_PLANO = { trial: 'Trial', standard: 'Standard', plus: 'Plus' };

// ----------------------------------------------------------------------------
// LOG (grava direto em log_acessos — mesma tabela/formato que
// registrarLog() já usa em index.html; sem depender de callback do host
// pra uma escrita tão simples e genérica quanto essa).
// ----------------------------------------------------------------------------
async function registrarLogSobre(dbAuth, clienteId, pessoaId, acao, detalhe) {
    try {
        await dbAuth.from('log_acessos').insert({
            cliente_id: clienteId, pessoa_id: pessoaId, acao, detalhe: detalhe || {},
        });
    } catch (err) {
        console.warn('[comum-sobre] Falha ao registrar log:', err.message);
    }
}

// ----------------------------------------------------------------------------
// CARD DE LICENÇA COMPACTO (banner de trial/upsell + convite de sócio)
// ----------------------------------------------------------------------------
async function montarLicencaBox(boxEl, ctx, licenca) {
    if (!licenca) {
        boxEl.classList.add('hidden');
        return;
    }
    const { dbAuth, clienteId, pessoaId, onToast, whatsappSuporte } = ctx;

    const nomePlano = NOMES_PLANO[licenca.plano_codigo] || licenca.plano_codigo;
    let linhaExpiracao = '';
    let botaoContratarHtml = '';
    let botaoCompartilharHtml = '';

    if (licenca.plano_codigo === 'trial' && licenca.data_expiracao) {
        const hoje = new Date();
        const expira = new Date(licenca.data_expiracao);
        const diasRestantes = Math.ceil((expira - hoje) / (1000 * 60 * 60 * 24));
        const textoData = expira.toLocaleDateString('pt-BR');

        linhaExpiracao = diasRestantes > 0
            ? `<p class="text-xs text-gray-500 mt-1">Expira em <strong>${textoData}</strong> — ${diasRestantes} dia${diasRestantes === 1 ? '' : 's'} restante${diasRestantes === 1 ? '' : 's'}.</p>`
            : `<p class="text-xs mt-1" style="color:var(--danger,#c1463a)">Seu teste expirou em ${textoData}.</p>`;

        botaoContratarHtml = `
            <a href="https://wa.me/${whatsappSuporte}?text=${encodeURIComponent('Oi! Testei o Raiz Patrimônio e quero contratar.')}" target="_blank"
               data-acao="contratar"
               class="flex items-center justify-center gap-2 w-full mt-3 py-2.5 rounded-lg text-white font-bold text-[13px] active:scale-95 transition" style="background:var(--pine)">
               <svg data-lucide="zap" style="width:16px;height:16px"></svg> Quero Contratar
            </a>`;

        // Convite de sócio pro trial (até 5 pessoas) — checa a vaga ao
        // vivo pra não oferecer o compartilhamento se já estiver lotado.
        try {
            const { count, error } = await dbAuth
                .from('pessoas')
                .select('id', { count: 'exact', head: true })
                .eq('cliente_id', clienteId);
            if (!error && count !== null) {
                if (count < 5) {
                    // "?convite=" tem que vir ANTES do "#", senão vira parte
                    // do fragmento em vez de query string de verdade.
                    const linkConvite = `${SITE_PADRAO}/?convite=${clienteId}#trial`;
                    const msgConvite = encodeURIComponent('Oi! Estou testando o Raiz Patrimônio e você pode entrar no mesmo teste grátis comigo. É só clicar aqui e se cadastrar: ' + linkConvite);
                    botaoCompartilharHtml = `
                        <a href="https://wa.me/?text=${msgConvite}" target="_blank"
                           data-acao="compartilhar"
                           class="flex items-center justify-center gap-2 w-full mt-2 py-2.5 rounded-lg font-bold text-[13px] border-2 active:scale-95 transition" style="border-color:var(--pine);color:var(--pine)">
                           <svg data-lucide="share-2" style="width:16px;height:16px"></svg> Compartilhar com sócio (${5 - count} vaga${5 - count === 1 ? '' : 's'})
                        </a>`;
                } else {
                    botaoCompartilharHtml = '<p class="text-[11px] text-gray-400 text-center mt-2">Limite de 5 pessoas neste teste atingido.</p>';
                }
            }
        } catch (err) {
            console.warn('[comum-sobre] Falha ao checar vagas do trial:', err.message);
        }
    }

    const corBadge = licenca.plano_codigo === 'trial'
        ? 'background:var(--brass-light,#f0c88a); color:var(--brass-deep,#a86f27)'
        : 'background:#e8f5ed; color:#2f8b57';

    boxEl.innerHTML = `
        <div class="flex items-center justify-between">
            <span class="text-[11px] text-gray-400 uppercase tracking-widest font-bold">Seu plano</span>
            <span class="text-[10px] font-bold px-2.5 py-1 rounded-full" style="${corBadge}">${nomePlano.toUpperCase()}</span>
        </div>
        ${linhaExpiracao}
        ${botaoContratarHtml}
        ${botaoCompartilharHtml}
    `;
    boxEl.classList.remove('hidden');
    if (typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();

    const btnContratar = boxEl.querySelector('[data-acao="contratar"]');
    if (btnContratar) btnContratar.addEventListener('click', () => {
        registrarLogSobre(dbAuth, clienteId, pessoaId, 'licenca.interesse_contratacao', { modulo: licenca.modulo, origem: 'sobre_licenca' });
    });
    const btnCompartilhar = boxEl.querySelector('[data-acao="compartilhar"]');
    if (btnCompartilhar) btnCompartilhar.addEventListener('click', () => {
        registrarLogSobre(dbAuth, clienteId, pessoaId, 'licenca.convite_compartilhado', { modulo: licenca.modulo });
    });
}

// ----------------------------------------------------------------------------
// TELA COMPLETA
// ----------------------------------------------------------------------------

// mountEl = elemento container já presente no DOM do host (ex.: <div
// id="mount-sobre"> dentro de <section id="tab-sobre">, no index.html).
// ctx = {
//   dbAuth, clienteId, pessoaId,
//   configCliente: { nomeEmpresa, cnpj, cidade, uf, logoUrl },
//   appVersao,                         // ex.: "BETA v1.63.0"
//   whatsappSuporte, emailSuporte,     // opcionais, têm padrão
//   onLogout(),                        // obrigatório pro botão "Sair" funcionar
//   onToast(mensagem, tipo),           // opcional — feedback visual do envio
// }
export async function montarAbaSobre(mountEl, ctx) {
    if (!mountEl) return;
    const {
        dbAuth, clienteId, pessoaId,
        configCliente = {}, appVersao = '',
        whatsappSuporte = WHATSAPP_SUPORTE_PADRAO, emailSuporte = EMAIL_SUPORTE_PADRAO,
        onLogout, onToast,
    } = ctx || {};

    const nome = configCliente.nomeEmpresa || 'RAIZ';
    const partesDados = [];
    if (configCliente.cnpj) partesDados.push('CNPJ: ' + configCliente.cnpj);
    const cidadeUf = [configCliente.cidade, configCliente.uf].filter(Boolean).join('/');
    if (cidadeUf) partesDados.push(cidadeUf);

    mountEl.innerHTML = `
        <div class="bg-white rounded-xl border border-gray-200 p-4 text-center mb-3">
            ${configCliente.logoUrl ? `<img src="${configCliente.logoUrl}" class="h-14 mx-auto mb-2" alt="Logo">` : ''}
            <h2 class="text-xl font-black text-slate-800 mb-0.5">${nome}</h2>
            <p class="text-xs text-gray-500">${partesDados.join(' · ')}</p>
        </div>

        <div id="comum-sobre-licenca-box" class="hidden bg-white rounded-xl border border-gray-200 p-4 mb-3"></div>

        <div class="bg-white rounded-xl border border-gray-200 p-4 mb-3">
            <p class="text-[11px] text-gray-400 uppercase tracking-widest font-bold mb-2">Dúvidas, suporte ou sugestões?</p>
            <div class="grid grid-cols-2 gap-2 mb-2.5">
                <a href="https://wa.me/${whatsappSuporte}" target="_blank" class="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl text-white font-bold text-[12px] shadow-sm active:scale-95 transition" style="background:var(--pine)">
                    <svg data-lucide="message-circle" style="width:17px;height:17px"></svg>
                    WhatsApp
                </a>
                <a href="mailto:${emailSuporte}" class="flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl font-bold text-[12px] border-2 active:scale-95 transition" style="border-color:var(--pine);color:var(--pine)">
                    <svg data-lucide="mail" style="width:17px;height:17px"></svg>
                    E-mail
                </a>
            </div>
            <label class="block text-[10.5px] font-bold text-gray-500 mb-1">Ou escreve aqui direto:</label>
            <textarea id="comum-sobre-feedback-texto" placeholder="Sugestão, dúvida ou algo travou..." rows="2" class="w-full p-2 border rounded-lg text-[12.5px] mb-1.5 box-border"></textarea>
            <button id="comum-sobre-btn-enviar-feedback" class="w-full bg-slate-700 text-white font-bold text-[12px] py-2 rounded-lg">Enviar</button>
        </div>

        <button id="comum-sobre-btn-sair" class="w-full bg-white border border-gray-200 text-gray-500 font-bold text-[12.5px] py-2.5 rounded-xl mb-3 flex items-center justify-center gap-2">
            <svg data-lucide="log-out" style="width:14px;height:14px"></svg> Sair
        </button>

        <p class="text-center text-[10.5px] text-gray-400 leading-relaxed pt-1 pb-2">
            Raiz Patrimônio <span class="font-mono font-bold">${appVersao}</span>
            · <a href="${SITE_PADRAO}" target="_blank" class="underline">raizpatrimonio.com.br</a>
        </p>
    `;
    if (typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();

    // -------- wiring (addEventListener, não onclick — módulo ES) --------
    const btnEnviar = document.getElementById('comum-sobre-btn-enviar-feedback');
    if (btnEnviar) btnEnviar.addEventListener('click', async () => {
        const campo = document.getElementById('comum-sobre-feedback-texto');
        const texto = campo ? campo.value.trim() : '';
        if (!texto) { onToast?.('Escreve alguma coisa antes de enviar.', 'danger'); return; }
        try {
            // NOTA: origem continua 'icone_suspenso' de propósito, mesmo o
            // campo não sendo mais um ícone flutuante há tempos — é o
            // valor histórico já usado em todo registro anterior desta
            // mesma tabela. Uma extração de código não é o momento de
            // também renomear um valor de dado; isso é uma decisão à
            // parte, pra não quebrar filtro/relatório que já exista em
            // cima do valor antigo.
            const { error } = await dbAuth.from('feedback').insert({
                cliente_id: clienteId, pessoa_id: pessoaId, origem: 'icone_suspenso', comentario: texto,
            });
            if (error) throw error;
            onToast?.('Feedback enviado, obrigado! 🙏', 'success');
            campo.value = '';
        } catch (err) {
            onToast?.('Não deu pra enviar agora. Tenta de novo mais tarde.', 'danger');
            console.warn('[comum-sobre] Erro ao enviar feedback:', err.message);
        }
    });

    const btnSair = document.getElementById('comum-sobre-btn-sair');
    if (btnSair) btnSair.addEventListener('click', () => { onLogout?.(); });

    // -------- card de licença compacto --------
    const licencaBox = document.getElementById('comum-sobre-licenca-box');
    if (licencaBox && dbAuth && clienteId) {
        try {
            const licenca = await buscarLicencaPrincipal(dbAuth, clienteId);
            await montarLicencaBox(licencaBox, { dbAuth, clienteId, pessoaId, onToast, whatsappSuporte }, licenca);
        } catch (err) {
            console.warn('[comum-sobre] Falha ao montar card de licença:', err.message);
            licencaBox.classList.add('hidden');
        }
    }
}
