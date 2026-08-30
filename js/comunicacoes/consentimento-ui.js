// Raiz Patrimônio — Aceite de Termos/LGPD — UI App
// Beta v1.0.0 · 30/08/2026
//
// Mesmo padrão de overlay de comunicacoes-ui.js (baseOverlay + innerHTML +
// listeners), só que SEM botão de fechar nem onclick de fora — bloqueante
// de propósito. Decisão documentada aqui (mesmo espírito do Design System
// §9 pro Tipo A): a pessoa não pode continuar usando o app sem aceitar os
// termos vigentes, então este modal não tem nenhum jeito de fechar sem
// marcar o checkbox e confirmar.
const ID = 'raiz-aceite-termos-overlay';

const TITULOS = {
  termos_uso: 'Termos de Uso',
  politica_privacidade: 'Política de Privacidade',
  termo_beta: 'Termo de Aceite — Ambiente Beta/Teste'
};

export function fecharAceiteTermos() { document.getElementById(ID)?.remove(); }

function baseOverlay() {
  fecharAceiteTermos();
  const o = document.createElement('div');
  o.id = ID;
  // z-index acima do overlay da Central de Comunicações (480) — aceite de
  // termos tem prioridade sobre onboarding/NPS, nunca deve ficar por baixo.
  o.style.cssText = 'position:fixed;inset:0;z-index:490;background:rgba(23,33,30,.65);display:flex;align-items:center;justify-content:center;padding:20px;';
  document.body.appendChild(o);
  return o;
}

export function renderizarAceiteTermos({ pendentes, links, onConfirmar }) {
  const o = baseOverlay();
  const itensHtml = pendentes.map(tipo => {
    const url = links?.[tipo] || '#';
    const titulo = TITULOS[tipo] || tipo;
    return `<a href="${url}" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:8px;padding:10px 12px;background:#f7f4ed;border-radius:10px;color:var(--pine,#1e3a32);font-weight:700;font-size:13px;text-decoration:none;margin-bottom:8px">📄 ${titulo}</a>`;
  }).join('');

  o.innerHTML = `<div style="width:100%;max-width:400px;background:var(--paper,#faf9f5);border-radius:18px;box-shadow:0 24px 60px -25px rgba(0,0,0,.55);overflow:hidden">
    <div style="padding:24px 24px 4px">
      <h2 style="font-family:'Bricolage Grotesque',sans-serif;font-size:19px;margin:0 0 6px;color:var(--ink,#17211e)">Atualizamos nossos termos</h2>
      <p style="font-size:13px;line-height:1.5;color:var(--sage,#6b857a);margin:0 0 16px">Pra continuar usando o Raiz Patrimônio, é preciso ler e aceitar ${pendentes.length > 1 ? 'os documentos abaixo' : 'o documento abaixo'}.</p>
    </div>
    <div style="padding:0 24px">${itensHtml}</div>
    <div style="padding:14px 24px 0">
      <label style="display:flex;align-items:flex-start;gap:8px;font-size:12px;color:var(--sage,#6b857a);cursor:pointer">
        <input type="checkbox" id="rc-aceite-checkbox" style="margin-top:2px">
        Li e concordo com ${pendentes.length > 1 ? 'os documentos acima' : 'o documento acima'}.
      </label>
    </div>
    <div style="padding:16px 24px 24px">
      <button id="rc-aceite-confirmar" type="button" disabled style="width:100%;border:0;border-radius:12px;background:var(--pine,#1e3a32);color:#fff;padding:13px;font-weight:800;cursor:not-allowed;opacity:.5">Aceitar e continuar</button>
    </div>
  </div>`;

  const checkbox = o.querySelector('#rc-aceite-checkbox');
  const btn = o.querySelector('#rc-aceite-confirmar');
  checkbox.addEventListener('change', () => {
    btn.disabled = !checkbox.checked;
    btn.style.opacity = checkbox.checked ? '1' : '.5';
    btn.style.cursor = checkbox.checked ? 'pointer' : 'not-allowed';
  });
  btn.addEventListener('click', async () => {
    btn.disabled = true;
    btn.textContent = 'Registrando...';
    try {
      await onConfirmar?.();
      fecharAceiteTermos();
    } catch (e) {
      btn.disabled = false;
      btn.textContent = 'Aceitar e continuar';
      alert('Não foi possível registrar seu aceite. Tente novamente.');
      console.warn('[consentimento]', e.message);
    }
  });
}
