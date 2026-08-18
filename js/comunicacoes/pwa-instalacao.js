// Raiz Patrimônio — instalação PWA
// Beta v1.43.0
import { detectarAmbiente } from './comunicacoes-regras.js';

let eventoInstalacao = null;

window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    eventoInstalacao = event;
});

window.addEventListener('appinstalled', () => {
    eventoInstalacao = null;
    window.dispatchEvent(new CustomEvent('raiz:pwa:instalado'));
});

export function obterEstadoPwa() {
    const ambiente = detectarAmbiente();
    return {
        ...ambiente,
        promptDisponivel: Boolean(eventoInstalacao)
    };
}

export async function solicitarInstalacaoPwa() {
    const estado = obterEstadoPwa();
    if (estado.standalone) return { resultado: 'ja_instalado' };
    if (eventoInstalacao) {
        eventoInstalacao.prompt();
        const escolha = await eventoInstalacao.userChoice;
        eventoInstalacao = null;
        return { resultado: escolha.outcome === 'accepted' ? 'aceito' : 'recusado' };
    }
    if (estado.ios) return { resultado: 'instruir_ios' };
    return { resultado: 'indisponivel' };
}
