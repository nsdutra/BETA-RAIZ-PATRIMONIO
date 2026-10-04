// ============================================================================
// raiz-device.js — Raiz Patrimônio · Adaptador único de dispositivo
// Versão: 1.0.0 · 03/10/2026
//
// v1.0.0 (F0.4 do PLANO_UX_PWA_ATUAL, demanda 717fc21d, sessão
// 20261003-1707-ux-base; regras UXR-35/40/41 das DIRETRIZES_UX_RAIZ_2026).
// Criação. NENHUMA tela chama API de aparelho direto (navigator.share,
// navigator.vibrate, wa.me, mailto:, câmera, clipboard, geolocalização…):
// chama RaizDevice.<função>(). Hoje cada função tem a implementação WEB; na
// migração para o Capacitor só o corpo destas funções muda (os pontos estão
// marcados com "CAPACITOR:"), sem tocar em nenhuma tela.
//
// Contrato:
//   - toda função é segura de chamar em qualquer navegador: o que o aparelho
//     não suporta devolve { ok:false, motivo } ou false — NUNCA lança;
//   - nada aqui mostra alerta, confirm ou prompt (UXR-30);
//   - háptico sempre acompanha um sinal visual de quem chamou (UXR-35).
//
// Disponível como módulo (import { RaizDevice } from './raiz-device.js') e
// como window.RaizDevice (para o código inline do index.html e dos módulos
// legados).
// ============================================================================

export const VERSAO = '1.0.0'; // v-check: lido por ⚙️ › Conta › Versões — manter igual ao header

const ua = (typeof navigator !== 'undefined' && navigator.userAgent) || '';

// ---------------------------------------------------------------------------
// plataforma
// ---------------------------------------------------------------------------
function plataforma() {
    // CAPACITOR: Capacitor.getPlatform() → 'ios' | 'android' | 'web'
    const cap = typeof window !== 'undefined' && window.Capacitor && window.Capacitor.getPlatform;
    if (cap) return { tipo: window.Capacitor.getPlatform(), nativo: true, instalado: true };
    const ios = /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && typeof document !== 'undefined' && 'ontouchend' in document);
    const android = /Android/i.test(ua);
    const instalado = typeof window !== 'undefined' && (
        (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
        window.navigator.standalone === true);
    return { tipo: ios ? 'ios' : (android ? 'android' : 'web'), nativo: false, instalado: !!instalado };
}

// ---------------------------------------------------------------------------
// háptico — mapa da UXR-35
// ---------------------------------------------------------------------------
const PADROES_HAPTICO = {
    success: [12, 40, 18],
    error: [30, 50, 30, 50, 30],
    warning: [25],
    selection: [6],
    light: [8],
};
function reduzirMovimento() {
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (_) { return false; }
}
function haptic(tipo = 'light') {
    // CAPACITOR: @capacitor/haptics → Haptics.notification({type}) / Haptics.selectionStart() / Haptics.impact({style:'light'})
    try {
        if (reduzirMovimento()) return false;
        if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return false; // Safari/iOS: sem vibração na web
        return navigator.vibrate(PADROES_HAPTICO[tipo] || PADROES_HAPTICO.light);
    } catch (_) { return false; }
}

// ---------------------------------------------------------------------------
// abrir link externo
// ---------------------------------------------------------------------------
function abrirExterno(url, { mesmaJanela = false } = {}) {
    // CAPACITOR: @capacitor/browser → Browser.open({url}) para http(s); App.openUrl para esquemas (mailto:, tel:, whatsapp:)
    try {
        if (!url) return { ok: false, motivo: 'sem_url' };
        const esquema = /^(mailto:|tel:|sms:)/i.test(url);
        if (mesmaJanela || esquema) { window.location.href = url; return { ok: true }; }
        const w = window.open(url, '_blank', 'noopener');
        if (!w) { window.location.href = url; } // bloqueador de pop-up: abre na mesma aba
        return { ok: true };
    } catch (e) { return { ok: false, motivo: String(e && e.message || e) }; }
}

function soDigitos(v) { return String(v || '').replace(/\D/g, ''); }

function whatsapp(numero, texto = '') {
    // CAPACITOR: mesmo link (App Links abre o WhatsApp instalado); nada muda além do abrirExterno
    const n = soDigitos(numero);
    const url = 'https://wa.me/' + n + (texto ? '?text=' + encodeURIComponent(texto) : '');
    return abrirExterno(url);
}

function email({ para = '', assunto = '', corpo = '' } = {}) {
    const q = [];
    if (assunto) q.push('subject=' + encodeURIComponent(assunto));
    if (corpo) q.push('body=' + encodeURIComponent(corpo));
    return abrirExterno('mailto:' + encodeURIComponent(para).replace(/%40/g, '@') + (q.length ? '?' + q.join('&') : ''));
}

// ---------------------------------------------------------------------------
// compartilhar (share sheet do sistema)
// ---------------------------------------------------------------------------
async function share({ titulo = '', texto = '', url = '', arquivos = [] } = {}) {
    // CAPACITOR: @capacitor/share → Share.share({title, text, url, files}) (arquivos via Filesystem)
    try {
        const dados = {};
        if (titulo) dados.title = titulo;
        if (texto) dados.text = texto;
        if (url) dados.url = url;
        if (arquivos && arquivos.length) {
            if (navigator.canShare && navigator.canShare({ files: arquivos })) dados.files = arquivos;
            else return { ok: false, motivo: 'arquivo_nao_suportado' };
        }
        if (!navigator.share) return { ok: false, motivo: 'sem_share' };
        await navigator.share(dados);
        return { ok: true };
    } catch (e) {
        if (e && e.name === 'AbortError') return { ok: false, motivo: 'cancelado' };
        return { ok: false, motivo: String(e && e.message || e) };
    }
}
function podeCompartilharArquivo() {
    try { return !!(navigator.canShare && navigator.canShare({ files: [new File([''], 'x.pdf', { type: 'application/pdf' })] })); } catch (_) { return false; }
}

// ---------------------------------------------------------------------------
// arquivo e câmera
// ---------------------------------------------------------------------------
function escolherArquivo({ aceitar = '*/*', multiplo = false, camera = false } = {}) {
    // CAPACITOR: @capacitor/camera (Camera.getPhoto) para camera:true; @capawesome/capacitor-file-picker para o resto
    return new Promise((resolve) => {
        try {
            const inp = document.createElement('input');
            inp.type = 'file';
            inp.accept = aceitar;
            if (multiplo) inp.multiple = true;
            if (camera) inp.setAttribute('capture', 'environment');
            inp.style.display = 'none';
            inp.addEventListener('change', () => { resolve({ ok: true, arquivos: Array.from(inp.files || []) }); inp.remove(); }, { once: true });
            document.body.appendChild(inp);
            inp.click();
        } catch (e) { resolve({ ok: false, motivo: String(e && e.message || e), arquivos: [] }); }
    });
}
function scan() {
    // CAPACITOR: @capacitor-mlkit/document-scanner (recorte automático) — na web, foto pela câmera traseira
    return escolherArquivo({ aceitar: 'image/*,application/pdf', camera: true });
}

// ---------------------------------------------------------------------------
// área de transferência
// ---------------------------------------------------------------------------
const clipboard = {
    // CAPACITOR: @capacitor/clipboard → Clipboard.read() / Clipboard.write({string})
    async ler() {
        try { if (!navigator.clipboard || !navigator.clipboard.readText) return { ok: false, motivo: 'sem_clipboard' };
              return { ok: true, texto: await navigator.clipboard.readText() }; }
        catch (e) { return { ok: false, motivo: String(e && e.message || e) }; }
    },
    async escrever(texto) {
        try { if (!navigator.clipboard || !navigator.clipboard.writeText) return { ok: false, motivo: 'sem_clipboard' };
              await navigator.clipboard.writeText(String(texto ?? '')); return { ok: true }; }
        catch (e) { return { ok: false, motivo: String(e && e.message || e) }; }
    },
};

// ---------------------------------------------------------------------------
// localização (pedida só no momento do uso — UXR-39)
// ---------------------------------------------------------------------------
function localizacao({ timeoutMs = 10000 } = {}) {
    // CAPACITOR: @capacitor/geolocation → Geolocation.getCurrentPosition()
    return new Promise((resolve) => {
        if (!navigator.geolocation) return resolve({ ok: false, motivo: 'sem_geolocalizacao' });
        navigator.geolocation.getCurrentPosition(
            (p) => resolve({ ok: true, lat: p.coords.latitude, lng: p.coords.longitude, precisao: p.coords.accuracy }),
            (e) => resolve({ ok: false, motivo: e && e.code === 1 ? 'negado' : 'indisponivel' }),
            { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 60000 });
    });
}

// ---------------------------------------------------------------------------
// voz (reconhecimento) — disponibilidade; a gravação + transcrição pelo
// Gemini entra na F4.1
// ---------------------------------------------------------------------------
const voz = {
    // CAPACITOR: @capacitor-community/speech-recognition
    disponivel() {
        return typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    },
};

// ---------------------------------------------------------------------------
// notificações — local agora; push (assinatura) entra na F4.2 [ficha]
// ---------------------------------------------------------------------------
const notify = {
    // CAPACITOR: @capacitor/local-notifications
    async local({ titulo = 'Raiz Patrimônio', corpo = '', tag } = {}) {
        try {
            if (typeof Notification === 'undefined') return { ok: false, motivo: 'sem_notificacao' };
            if (Notification.permission === 'default') await Notification.requestPermission();
            if (Notification.permission !== 'granted') return { ok: false, motivo: 'negado' };
            const reg = navigator.serviceWorker && await navigator.serviceWorker.getRegistration();
            if (reg && reg.showNotification) await reg.showNotification(titulo, { body: corpo, tag });
            else new Notification(titulo, { body: corpo, tag });
            return { ok: true };
        } catch (e) { return { ok: false, motivo: String(e && e.message || e) }; }
    },
    push: {
        // CAPACITOR: @capacitor/push-notifications (FCM/APNs). Web Push + tabela de assinaturas: F4.2, com ficha APV-03
        async assinar() { return { ok: false, motivo: 'nao_implementado_F4.2' }; },
    },
};

// ---------------------------------------------------------------------------
// biometria / passkey — disponibilidade; fluxo de entrar na F4.5
// ---------------------------------------------------------------------------
const biometria = {
    // CAPACITOR: @capgo/capacitor-native-biometric (Face ID / digital)
    async disponivel() {
        try {
            if (typeof PublicKeyCredential === 'undefined' || !PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) return false;
            return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        } catch (_) { return false; }
    },
};

export const RaizDevice = Object.freeze({
    VERSAO, plataforma, haptic, abrirExterno, whatsapp, email, share, podeCompartilharArquivo,
    escolherArquivo, scan, clipboard, localizacao, voz, notify, biometria,
});

if (typeof window !== 'undefined') window.RaizDevice = RaizDevice;
export default RaizDevice;
