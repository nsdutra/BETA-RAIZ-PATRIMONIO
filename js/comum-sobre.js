// ============================================================================
// comum-sobre.js — Raiz Patrimônio · Administração compartilhada
// Versão: 1.4.0 · 08/10/2026
//
// v1.4.0 (UX F2.7c-1, demanda b8602a3a, sessão 20261003-1707-ux-base; plano F2.7c-1 aprovado pelo Nicola 08/10 12:51) — no app a tela Sobre
// sai e vira o sheet de Suporte: abrirSuporte(ctx) — WhatsApp, e-mail, página de contatos da Raiz,
// "Sugestão ou algo travou?" (mesmo envio de antes: feedback + demanda de suporte, agora em
// enviarSugestao) e o rodapé com a versão e os termos. montarAbaSobre continua para o cofre.html
// avulso; o card de plano dela usa htmlContratarConvidar de comum-licenca (uma fonte só).
//
// Versão anterior: 1.3.2 · 07/10/2026
//
// v1.3.1 (07/10/2026, sessão 20261007-1721-rolo-changelog, demanda 2507d554 — VER-06, "de acordo" do Nicola 07/10 17:21) — SÓ
// CABEÇALHO: as versões além das 5 mais recentes rolaram para o CHANGELOG_MODULOS.md.
// Nenhuma linha de código mudou — conferido token a token contra o publicado.
//
// Versão anterior: 1.3.0 · 13/09/2026
//
// v1.3.0 — pedido do Nicola: sugestão/feedback enviado pelo card "Dúvidas,
// suporte ou sugestões?" agora TAMBÉM vira uma demanda de Suporte
// (fn_demanda_criar, subtipo='suporte'), além de continuar gravando em
// `feedback` como sempre. Escopo deliberadamente mínimo — só essa conexão;
// o resto do Sistema de Demandas pro cliente (SLA, jornada completa) fica
// no backlog.
//
// v1.2.1 — constante VERSAO sincronizada com o header (estava presa em uma
// versão anterior desde o bump do header; ⚙️ › Versões lia a constante e
// acusava "cache segurou" sem haver cache). gerar_versoes.py v1.3 agora
// trava a entrega se header ≠ VERSAO.
//
// Versão anterior: 1.2.0 · 06/09/2026
//
// v1.2.0 — gramática (REGRAS §6/§7): caixa alta fora, badge do plano vira .rz-st,
// cards .rz-card com .rz-card-h, Enviar/Sair no catálogo de botões. Lógica intocada.
// --------------------------------------------------------------------------
// Versões anteriores (v1.1.2 … v1.1.2): CHANGELOG_MODULOS.md, na raiz do repositório — o
// gerar_versoes.py rola pra lá automaticamente tudo além das 5 versões
// mais recentes deste cabeçalho (VER-06).
export const VERSAO = '1.4.0'; // v-check (06/09/2026): lido por Dev › Versões — manter igual ao header
import { buscarLicencaPrincipal, htmlContratarConvidar, ligarContratarConvidar, LINK_CONTATOS_RAIZ } from './comum-licenca.js';

export const COMUM_SOBRE_VERSAO = '1.1.0';

const WHATSAPP_SUPORTE_PADRAO = '5511947461828';
const EMAIL_SUPORTE_PADRAO = 'contato@raizpatrimonio.com.br';
const SITE_PADRAO = 'https://www.raizpatrimonio.com.br';

const NOMES_PLANO = { trial: 'Trial', standard: 'Standard', plus: 'Plus' };

// Rótulo amigável por nome de Edge Function registrada em
// edge_function_versoes.funcao — cai no próprio nome técnico se a
// função ainda não estiver mapeada aqui (nunca esconde uma linha nova
// só por falta de rótulo bonito).
const NOMES_BOT = {
    'whatsapp-webhook': 'Bot WhatsApp',
    'diario-eventos': 'Diário de Eventos (proativo)',
};

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

// Versões dos bots (Edge Functions), ao vivo. RLS já filtra pra
// fn_sou_master() = true — pra qualquer outro perfil, isto sempre
// retorna [] (sem erro), então a seção correspondente na tela
// simplesmente não aparece (§16 do Design System — componente vazio não
// aparece).
async function buscarVersoesBots(dbAuth) {
    try {
        const { data, error } = await dbAuth
            .from('edge_function_versoes')
            .select('funcao, versao, ultimo_boot')
            .order('funcao');
        if (error) { console.warn('[comum-sobre] Falha ao buscar versões dos bots:', error.message); return []; }
        return data || [];
    } catch (err) {
        console.warn('[comum-sobre] Falha ao buscar versões dos bots:', err.message);
        return [];
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
    const { dbAuth, clienteId, pessoaId } = ctx;
    const nomePlano = NOMES_PLANO[licenca.plano_codigo] || licenca.plano_codigo;
    let linhaExpiracao = '';
    if (licenca.data_expiracao) {
        const expira = new Date(licenca.data_expiracao);
        const diasRestantes = Math.ceil((expira - new Date()) / 86400000);
        const textoData = expira.toLocaleDateString('pt-BR');
        linhaExpiracao = diasRestantes > 0
            ? `<p class="rz-desc">Expira em <b>${textoData}</b> — ${diasRestantes} dia${diasRestantes === 1 ? '' : 's'} restante${diasRestantes === 1 ? '' : 's'}.</p>`
            : `<p class="rz-desc" style="color:var(--danger)">Seu teste expirou em ${textoData}.</p>`;
    }
    boxEl.innerHTML = `<div class="rz-card-h"><h3>Seu plano</h3><span class="rz-st rz-ok">${nomePlano}</span></div>${linhaExpiracao}`;
    boxEl.classList.remove('hidden');
    // Contratar e convidar: a mesma função da tela Licença do app.
    const convite = await htmlContratarConvidar(dbAuth, clienteId, licenca);
    if (convite) {
        boxEl.insertAdjacentHTML('afterend', `<div id="comum-sobre-convite">${convite}</div>`);
        ligarContratarConvidar(document.getElementById('comum-sobre-convite'), { dbAuth, clienteId, pessoaId, licenca, origem: 'sobre_licenca' });
    }
    if (typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();
}

// Sugestão ou problema: grava em feedback e abre uma demanda de suporte (para o Raiz Gestão).
// A demanda é camada a mais — se falhar, o feedback já ficou salvo. A origem 'icone_suspenso'
// é o valor histórico da tabela; trocar quebraria filtros que já existem.
async function enviarSugestao({ dbAuth, clienteId, pessoaId }, texto) {
    const { error } = await dbAuth.from('feedback').insert({
        cliente_id: clienteId, pessoa_id: pessoaId, origem: 'icone_suspenso', comentario: texto,
    });
    if (error) throw error;
    try {
        const { error: erroDemanda } = await dbAuth.rpc('fn_demanda_criar', {
            p_cliente_id: clienteId, p_subtipo: 'suporte',
            p_titulo: texto.length > 80 ? texto.slice(0, 77) + '...' : texto,
            p_descricao: texto, p_chave_idempotencia: null, p_forcar: true,
            p_pessoa_id: null, p_canal: null,
        });
        if (erroDemanda) console.warn('[comum-sobre] feedback salvo, mas não virou demanda:', erroDemanda.message);
    } catch (errDemanda) {
        console.warn('[comum-sobre] feedback salvo, mas não virou demanda:', errDemanda?.message || errDemanda);
    }
}

// ----------------------------------------------------------------------------
// SUPORTE (sheet do app) — onde moram os contatos e a sugestão que estavam na tela Sobre.
// ctx = { abrirSheet, cabecalho(titulo, sub), dbAuth, clienteId, pessoaId, appVersao,
//         whatsappSuporte?, emailSuporte?, onToast? }
// ----------------------------------------------------------------------------
export function abrirSuporte(ctx = {}) {
    const {
        abrirSheet, cabecalho, dbAuth, clienteId, pessoaId, appVersao = '',
        whatsappSuporte = WHATSAPP_SUPORTE_PADRAO, emailSuporte = EMAIL_SUPORTE_PADRAO, onToast,
    } = ctx;
    if (typeof abrirSheet !== 'function') { window.open(`https://wa.me/${whatsappSuporte}`, '_blank'); return null; }
    const linha = (href, icone, titulo, sub) =>
        `<a class="rz-row rz-link" href="${href}" target="_blank" rel="noopener"><div class="rz-ic"><svg data-lucide="${icone}"></svg></div>` +
        `<div class="rz-tx"><b>${titulo}</b><span>${sub}</span></div><svg data-lucide="chevron-right" class="rz-chev"></svg></a>`;
    const corpo = `<div class="rz-sh-b">
        <div class="rz-card">
            ${linha(`https://wa.me/${whatsappSuporte}`, 'message-circle', 'WhatsApp', 'Fale com a equipe da Raiz')}
            ${linha(`mailto:${emailSuporte}`, 'mail', 'E-mail', emailSuporte)}
            ${linha(LINK_CONTATOS_RAIZ, 'globe', 'Página de contatos', 'raizpatrimonio.com.br')}
        </div>
        <div class="rz-card">
            <div class="rz-card-h"><h3>Sugestão ou algo travou?</h3></div>
            <div class="rz-f">
                <label for="rz-sup-texto">Conte para a gente</label>
                <textarea id="rz-sup-texto" rows="3" placeholder="O que aconteceu ou o que você gostaria de ver no Raiz"></textarea>
            </div>
            <button type="button" id="rz-sup-enviar" class="rz-btn rz-btn-1 rz-wide">Enviar sugestão</button>
        </div>
        <p class="rz-desc" style="text-align:center">Raiz Patrimônio ${appVersao ? '· ' + appVersao + ' ' : ''}· <a href="https://raizpatrimonio.com.br/termos-de-uso" target="_blank" rel="noopener" style="color:var(--pine)">Termos e privacidade</a></p>
    </div>`;
    const sheet = abrirSheet((typeof cabecalho === 'function' ? cabecalho('Suporte', 'WhatsApp, e-mail e sugestões') : '') + corpo);
    if (typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();
    const btn = sheet && sheet.querySelector('#rz-sup-enviar');
    if (btn) btn.addEventListener('click', async () => {
        const campo = sheet.querySelector('#rz-sup-texto');
        const texto = campo ? campo.value.trim() : '';
        if (!texto) { onToast?.('Escreva sua sugestão antes de enviar.', 'danger'); return; }
        btn.disabled = true;
        try {
            await enviarSugestao({ dbAuth, clienteId, pessoaId }, texto);
            onToast?.('Sugestão enviada. Obrigado!', 'success');
            campo.value = '';
        } catch (err) {
            onToast?.('Não deu para enviar agora. Tente de novo mais tarde.', 'danger');
            console.warn('[comum-sobre] Erro ao enviar sugestão:', err.message);
        } finally {
            btn.disabled = false;
        }
    });
    return sheet;
}

// ----------------------------------------------------------------------------
// TELA COMPLETA
// ----------------------------------------------------------------------------

// mountEl = elemento container já presente no DOM do host (ex.: <div
// id="mount-sobre"> dentro de <section id="tab-sobre">, no index.html).
// ctx = {
//   dbAuth, clienteId, pessoaId,
//   configCliente: { nomeEmpresa, cnpj, cidade, uf, logoUrl },
//   appVersao,                         // ex.: "BETA v1.64.0" — mantido por
//                                       // compat, aparece sozinho no rodapé
//   modulos: [{ nome, versao }],       // NOVO v1.1.0 — lista de módulos a
//                                       // mostrar na seção "Versões" (cada
//                                       // host monta a própria lista — ver
//                                       // nota de changelog no topo do
//                                       // arquivo sobre por que não há
//                                       // fonte única compartilhada ainda)
//   whatsappSuporte, emailSuporte,     // opcionais, têm padrão
//   onLogout(),                        // obrigatório pro botão "Sair" funcionar
//   onToast(mensagem, tipo),           // opcional — feedback visual do envio
// }
export async function montarAbaSobre(mountEl, ctx) {
    if (!mountEl) return;
    const {
        dbAuth, clienteId, pessoaId,
        configCliente = {}, appVersao = '', modulos = [],
        whatsappSuporte = WHATSAPP_SUPORTE_PADRAO, emailSuporte = EMAIL_SUPORTE_PADRAO,
        onLogout, onToast,
    } = ctx || {};

    const nome = configCliente.nomeEmpresa || 'RAIZ';
    const partesDados = [];
    if (configCliente.cnpj) partesDados.push('CNPJ: ' + configCliente.cnpj);
    const cidadeUf = [configCliente.cidade, configCliente.uf].filter(Boolean).join('/');
    if (cidadeUf) partesDados.push(cidadeUf);

    mountEl.innerHTML = `
        <div class="rz-card" style="text-align:center">
            ${configCliente.logoUrl ? `<img src="${configCliente.logoUrl}" class="h-14 mx-auto mb-2" alt="Logo">` : ''}
            <p class="mb-0.5" style="font-family:var(--font-title);font-size:18px;font-weight:600;color:var(--pine)">${nome}</p>
            <p class="text-xs text-gray-500">${partesDados.join(' · ')}</p>
        </div>

        <div id="comum-sobre-licenca-box" class="hidden rz-card"></div>

        <!-- v1.1.0 — seção "Versões": módulos (App/Cofre, o que o host
             passar em ctx.modulos) sempre aparece; bots só aparece se a
             query em edge_function_versoes voltar alguma linha (RLS
             restringe a fn_sou_master()) — ver montarVersoesBots(). -->
        <div id="comum-sobre-versoes-box" class="hidden rz-card">
            <div class="rz-card-h"><h3>Versões</h3></div>
            <div id="comum-sobre-versoes-modulos" class="space-y-1 text-[12px]"></div>
            <div id="comum-sobre-versoes-bots-wrap" class="hidden mt-2 pt-2 border-t border-slate-100">
                <p class="text-xs font-semibold mb-1" style="color:var(--muted)">Robô e functions</p>
                <div id="comum-sobre-versoes-bots" class="space-y-1 text-[12px]"></div>
            </div>
        </div>

        <div class="rz-card">
            <div class="rz-card-h"><h3>Dúvidas, suporte ou sugestões?</h3></div>
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
            <button id="comum-sobre-btn-enviar-feedback" class="rz-btn rz-btn-1 rz-wide">Enviar</button>
        </div>

        <button id="comum-sobre-btn-sair" class="rz-btn rz-btn-2 rz-wide" style="margin-bottom:12px">
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
            await enviarSugestao({ dbAuth, clienteId, pessoaId }, texto);
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
            await montarLicencaBox(licencaBox, { dbAuth, clienteId, pessoaId }, licenca);
        } catch (err) {
            console.warn('[comum-sobre] Falha ao montar card de licença:', err.message);
            licencaBox.classList.add('hidden');
        }
    }

    // -------- seção Versões (módulos + bots) --------
    const versoesBox = document.getElementById('comum-sobre-versoes-box');
    if (versoesBox) {
        const modulosHtml = (modulos || []).filter(m => m && m.nome).map(m => `
            <div class="flex justify-between"><span class="text-slate-600">${m.nome}</span><b class="font-mono">${m.versao || '—'}</b></div>
        `).join('');
        if (modulosHtml) {
            document.getElementById('comum-sobre-versoes-modulos').innerHTML = modulosHtml;
            versoesBox.classList.remove('hidden');
        }

        if (dbAuth) {
            try {
                const bots = await buscarVersoesBots(dbAuth);
                if (bots.length > 0) {
                    document.getElementById('comum-sobre-versoes-bots').innerHTML = bots.map(b => `
                        <div class="flex justify-between"><span class="text-slate-600">${NOMES_BOT[b.funcao] || b.funcao}</span><b class="font-mono">v${b.versao}</b></div>
                    `).join('');
                    document.getElementById('comum-sobre-versoes-bots-wrap').classList.remove('hidden');
                    versoesBox.classList.remove('hidden');
                }
            } catch (err) {
                console.warn('[comum-sobre] Falha ao montar versões dos bots:', err.message);
            }
        }
    }
}
