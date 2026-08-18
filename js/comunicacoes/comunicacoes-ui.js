// Raiz Patrimônio — Central de Comunicações — UI
// Beta v1.43.0

const ID_OVERLAY = 'raiz-comunicacao-overlay';

function svgIcon(nome) {
    const icons = {
        sprout: '<path d="M7 20h10"/><path d="M10 20c5.5-2.5 7-7 7-13-6 .5-10 4-10 9 0 2 1 3 3 4Z"/><path d="M9 13c-2.5-1-4-3-4-6 3 .2 5 1.5 6 3.5"/>',
        smartphone: '<rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/>',
        home: '<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/>'
    };
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:30px;height:30px">${icons[nome] || icons.sprout}</svg>`;
}

export function fecharComunicacao() {
    document.getElementById(ID_OVERLAY)?.remove();
}

export function renderizarOnboarding({ comunicacao, estadoPwa, onFechar, onConcluir, onInstalar }) {
    fecharComunicacao();
    const passos = comunicacao.conteudo?.passos || [];
    let indice = 0;

    const overlay = document.createElement('div');
    overlay.id = ID_OVERLAY;
    overlay.style.cssText = 'position:fixed;inset:0;z-index:480;background:rgba(23,33,30,.58);display:flex;align-items:center;justify-content:center;padding:20px;';
    overlay.innerHTML = `
      <div style="width:100%;max-width:380px;background:var(--paper,#faf9f5);border-radius:18px;box-shadow:0 24px 60px -25px rgba(0,0,0,.55);overflow:hidden">
        <div style="padding:18px 22px 0;text-align:right">
          <button id="raiz-com-pular" type="button" style="border:0;background:none;color:var(--sage,#6b857a);font-size:13px;font-weight:600;cursor:pointer">Agora não</button>
        </div>
        <div id="raiz-com-conteudo" style="padding:4px 28px 18px;text-align:center"></div>
        <div id="raiz-com-dots" style="display:flex;gap:6px;justify-content:center;padding:0 28px 14px"></div>
        <div style="padding:0 28px 28px">
          <button id="raiz-com-acao" type="button" style="width:100%;border:0;border-radius:12px;background:var(--pine,#1e3a32);color:white;padding:13px;font-weight:800;cursor:pointer">Próximo</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    const conteudo = overlay.querySelector('#raiz-com-conteudo');
    const dots = overlay.querySelector('#raiz-com-dots');
    const btn = overlay.querySelector('#raiz-com-acao');
    const pular = overlay.querySelector('#raiz-com-pular');

    function desenhar() {
        const passo = passos[indice] || {};
        const ehInstalacao = passo.id === 'instalacao';
        let complemento = '';
        if (ehInstalacao) {
            if (estadoPwa.standalone) {
                complemento = '<p style="font-size:12px;color:var(--success,#2f8b57);font-weight:700;margin-top:12px">✓ O Raiz já está instalado neste aparelho.</p>';
            } else if (estadoPwa.ios) {
                complemento = '<div style="text-align:left;background:#fff;border:1px solid var(--line,#e6e3da);border-radius:12px;padding:12px;margin-top:14px;font-size:12px;color:var(--ink,#17211e)"><b>No iPhone:</b><br>1. Toque em Compartilhar ⬆<br>2. Escolha “Adicionar à Tela de Início”<br>3. Toque em “Adicionar”</div>';
            } else if (!estadoPwa.promptDisponivel) {
                complemento = '<p style="font-size:11px;color:var(--sage,#6b857a);margin-top:12px">A opção de instalação aparecerá quando o navegador disponibilizá-la. Você pode continuar normalmente.</p>';
            }
        }
        conteudo.innerHTML = `
          <div style="width:64px;height:64px;margin:4px auto 16px;border-radius:16px;background:var(--success-bg,#e8f5ed);display:flex;align-items:center;justify-content:center;color:var(--pine,#1e3a32)">${svgIcon(passo.icone)}</div>
          <div style="font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--brass-deep,#8f632b);margin-bottom:7px">Passo ${indice + 1} de ${passos.length}</div>
          <h2 style="font-family:'Bricolage Grotesque',sans-serif;font-size:20px;color:var(--ink,#17211e);margin:0 0 7px">${passo.titulo || comunicacao.titulo}</h2>
          <p style="font-size:13px;line-height:1.55;color:var(--sage,#6b857a);margin:0">${passo.texto || comunicacao.mensagem || ''}</p>
          ${complemento}`;
        dots.innerHTML = passos.map((_, i) =>
            `<span style="height:6px;width:${i === indice ? '24px' : '6px'};border-radius:99px;background:${i === indice ? 'var(--pine,#1e3a32)' : 'var(--line,#e6e3da)'}"></span>`
        ).join('');
        if (ehInstalacao && !estadoPwa.standalone && !estadoPwa.ios && estadoPwa.promptDisponivel) {
            btn.textContent = 'Instalar Raiz Patrimônio';
        } else if (indice === passos.length - 1) {
            btn.textContent = 'Cadastrar primeiro imóvel';
        } else {
            btn.textContent = 'Próximo';
        }
    }

    pular.addEventListener('click', () => onFechar?.());

    btn.addEventListener('click', async () => {
        const passo = passos[indice] || {};
        if (passo.id === 'instalacao' && !estadoPwa.standalone && !estadoPwa.ios && estadoPwa.promptDisponivel) {
            await onInstalar?.();
            indice += 1;
            desenhar();
            return;
        }
        if (indice >= passos.length - 1) {
            await onConcluir?.();
            return;
        }
        indice += 1;
        desenhar();
    });

    desenhar();
}
