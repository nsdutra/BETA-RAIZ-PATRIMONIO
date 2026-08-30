// Raiz Patrimônio — Central de Comunicações Omnichannel — UI App
// Beta v1.45.0
//
// v1.45.0 — NOVA renderizarAceite(): modal SEM botão de fechar/pular —
// pra comunicações com dispensavel=false (ex. aceite de Termos de Uso/
// Política de Privacidade/Termo de Beta, migradas pro motor de
// comunicações nesta entrega). Mesmo overlay/z-index dos outros modais
// (baseOverlay) — só não tem NENHUM jeito de fechar sem confirmar. Isso é
// deliberado: o Design System documenta esta como a única exceção
// aceitável de modal bloqueante, e aqui é justamente aceite de termo.
const ID='raiz-comunicacao-overlay';
export function fecharComunicacao(){ document.getElementById(ID)?.remove(); }
function svg(nome){
 const d={
  sprout:'<path d="M7 20h10"/><path d="M10 20c5.5-2.5 7-7 7-13-6 .5-10 4-10 9 0 2 1 3 3 4Z"/><path d="M9 13c-2.5-1-4-3-4-6 3 .2 5 1.5 6 3.5"/>',
  smartphone:'<rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/>',
  home:'<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/>'
 };
 return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="width:30px;height:30px">${d[nome]||d.sprout}</svg>`;
}
function baseOverlay(){
 fecharComunicacao();
 const o=document.createElement('div');o.id=ID;
 o.style.cssText='position:fixed;inset:0;z-index:480;background:rgba(23,33,30,.58);display:flex;align-items:center;justify-content:center;padding:20px;';
 document.body.appendChild(o);return o;
}
export function renderizarAceite({comunicacao,onConfirmar}){
 const o=baseOverlay();
 const url=comunicacao.conteudo?.url||'#';
 o.innerHTML=`<div style="width:100%;max-width:380px;background:var(--paper,#faf9f5);border-radius:18px;box-shadow:0 24px 60px -25px rgba(0,0,0,.55);overflow:hidden">
  <div style="padding:24px 24px 4px">
   <h2 style="font-family:'Bricolage Grotesque',sans-serif;font-size:19px;margin:0 0 6px;color:var(--ink,#17211e)">${comunicacao.titulo}</h2>
   <p style="font-size:13px;line-height:1.5;color:var(--sage,#6b857a);margin:0 0 16px">${comunicacao.mensagem||''}</p>
  </div>
  <div style="padding:0 24px">
   <a href="${url}" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:8px;padding:10px 12px;background:#f7f4ed;border-radius:10px;color:var(--pine,#1e3a32);font-weight:700;font-size:13px;text-decoration:none">📄 Ler ${comunicacao.titulo}</a>
  </div>
  <div style="padding:14px 24px 0">
   <label style="display:flex;align-items:flex-start;gap:8px;font-size:12px;color:var(--sage,#6b857a);cursor:pointer">
    <input type="checkbox" id="rc-aceite-checkbox" style="margin-top:2px">
    Li e concordo.
   </label>
  </div>
  <div style="padding:16px 24px 24px">
   <button id="rc-aceite-confirmar" type="button" disabled style="width:100%;border:0;border-radius:12px;background:var(--pine,#1e3a32);color:#fff;padding:13px;font-weight:800;cursor:not-allowed;opacity:.5">Aceitar e continuar</button>
  </div>
 </div>`;
 const checkbox=o.querySelector('#rc-aceite-checkbox'),btn=o.querySelector('#rc-aceite-confirmar');
 checkbox.addEventListener('change',()=>{
  btn.disabled=!checkbox.checked;
  btn.style.opacity=checkbox.checked?'1':'.5';
  btn.style.cursor=checkbox.checked?'pointer':'not-allowed';
 });
 btn.addEventListener('click',async()=>{
  btn.disabled=true;btn.textContent='Registrando...';
  try{ await onConfirmar?.(); }
  catch(e){ btn.disabled=false;btn.textContent='Aceitar e continuar';alert('Não foi possível registrar seu aceite. Tente novamente.');console.warn('[comunicacoes]',e.message); }
 });
}
export function renderizarOnboarding({comunicacao,estadoPwa,onFechar,onConcluir,onInstalar}){
 const passos=comunicacao.conteudo?.passos||[];let indice=0;const o=baseOverlay();
 o.innerHTML=`<div style="width:100%;max-width:380px;background:var(--paper,#faf9f5);border-radius:18px;box-shadow:0 24px 60px -25px rgba(0,0,0,.55);overflow:hidden">
 <div style="padding:18px 22px 0;text-align:right"><button id="rc-pular" type="button" style="border:0;background:none;color:var(--sage,#6b857a);font-size:13px;font-weight:600;cursor:pointer">Agora não</button></div>
 <div id="rc-conteudo" style="padding:4px 28px 18px;text-align:center"></div>
 <div id="rc-dots" style="display:flex;gap:6px;justify-content:center;padding:0 28px 14px"></div>
 <div style="padding:0 28px 28px;display:flex;gap:8px">
   <button id="rc-voltar" type="button" style="display:none;flex:.8;border:1px solid var(--line,#e6e3da);border-radius:12px;background:#fff;color:var(--ink,#17211e);padding:13px;font-weight:700;cursor:pointer">Voltar</button>
   <button id="rc-acao" type="button" style="flex:1.4;border:0;border-radius:12px;background:var(--pine,#1e3a32);color:white;padding:13px;font-weight:800;cursor:pointer">Próximo</button>
 </div></div>`;
 const c=o.querySelector('#rc-conteudo'),dots=o.querySelector('#rc-dots'),btn=o.querySelector('#rc-acao'),voltar=o.querySelector('#rc-voltar');

 function desenhar(){
  const p=passos[indice]||{},inst=p.id==='instalacao';let extra='';
  if(inst){
   if(estadoPwa.standalone){
    extra='<div style="margin-top:14px;background:#e8f5ed;border:1px solid #c5dfd0;border-radius:12px;padding:11px 12px;font-size:12px;color:#256f45;font-weight:700">✓ O Raiz já está instalado neste aparelho.<br><span style="font-weight:500;color:#4a5852">Você pode abrir pelo ícone na tela inicial.</span></div>';
   } else if(estadoPwa.ios){
    extra='<div style="text-align:left;background:#fff;border:1px solid var(--line,#e6e3da);border-radius:12px;padding:12px;margin-top:14px;font-size:12px"><b>No iPhone:</b><br>1. Toque em Compartilhar ⬆<br>2. Escolha “Adicionar à Tela de Início”<br>3. Toque em “Adicionar”</div>';
   } else if(estadoPwa.promptDisponivel){
    extra='<p style="font-size:11px;color:var(--sage,#6b857a);margin-top:12px">Toque no botão abaixo para abrir a instalação do aplicativo.</p>';
   } else {
    extra='<div style="margin-top:14px;background:#f7f4ed;border:1px solid var(--line,#e6e3da);border-radius:12px;padding:11px 12px;font-size:11px;color:var(--sage,#6b857a)">O navegador não disponibilizou a instalação neste momento. Você pode continuar normalmente e instalar depois pelo menu do navegador.</div>';
   }
  }
  c.innerHTML=`<div style="width:64px;height:64px;margin:4px auto 16px;border-radius:16px;background:#e8f5ed;display:flex;align-items:center;justify-content:center;color:var(--pine,#1e3a32)">${svg(p.icone)}</div>
  <div style="font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#8f632b;margin-bottom:7px">Passo ${indice+1} de ${passos.length}</div>
  <h2 style="font-family:'Bricolage Grotesque',sans-serif;font-size:20px;margin:0 0 7px">${p.titulo||comunicacao.titulo}</h2>
  <p style="font-size:13px;line-height:1.55;color:var(--sage,#6b857a);margin:0">${p.texto||''}</p>${extra}`;

  dots.innerHTML=passos.map((_,i)=>`<button type="button" data-slide="${i}" aria-label="Ir para passo ${i+1}" style="border:0;padding:0;height:6px;width:${i===indice?'24px':'6px'};border-radius:99px;background:${i===indice?'var(--pine,#1e3a32)':'var(--line,#e6e3da)'};cursor:pointer"></button>`).join('');
  [...dots.querySelectorAll('[data-slide]')].forEach(dot=>dot.addEventListener('click',()=>{ indice=Number(dot.dataset.slide); desenhar(); }));

  voltar.style.display=indice>0?'block':'none';
  btn.textContent=inst&&!estadoPwa.standalone&&!estadoPwa.ios&&estadoPwa.promptDisponivel
      ?'Instalar Raiz Patrimônio'
      :indice===passos.length-1?'Cadastrar primeiro imóvel':'Próximo';
 }

 o.querySelector('#rc-pular').addEventListener('click',()=>onFechar?.());
 voltar.addEventListener('click',()=>{ if(indice>0){indice--;desenhar();} });

 btn.addEventListener('click',async()=>{
  const p=passos[indice]||{};
  if(p.id==='instalacao'&&!estadoPwa.standalone&&!estadoPwa.ios&&estadoPwa.promptDisponivel){
    const resultado=await onInstalar?.();
    // Só avança automaticamente se a instalação foi aceita ou já estava instalada.
    // Se o usuário recusou/fechou, permanece no passo para poder tentar ou revisar.
    if(resultado?.resultado==='aceito'||resultado?.resultado==='ja_instalado'){
      indice=Math.min(indice+1,passos.length-1);
      desenhar();
    }
    return;
  }
  if(indice>=passos.length-1){await onConcluir?.();return;}
  indice++;desenhar();
 });
 desenhar();
}
export function renderizarNps({comunicacao,onFechar,onEnviar}){
 const o=baseOverlay();let nota=0;
 const estrelas=[1,2,3,4,5].map(n=>`<button type="button" data-nota="${n}" style="background:none;border:none;padding:4px;font-size:30px;color:#d1d5db">★</button>`).join('');
 o.innerHTML=`<div style="background:#fff;border-radius:16px;padding:24px;max-width:360px;width:100%;box-shadow:0 20px 50px -20px rgba(0,0,0,.4)">
 <p style="font-family:'Bricolage Grotesque',sans-serif;font-weight:700;font-size:17px;margin:0 0 4px;text-align:center">${comunicacao.titulo||'Como está sendo usar o Raiz?'}</p>
 <p style="font-size:13px;color:#4a5852;margin:0 0 16px;text-align:center">${comunicacao.mensagem||''}</p>
 <div id="rc-nps-estrelas" style="display:flex;justify-content:center;gap:8px;margin-bottom:16px">${estrelas}</div>
 <textarea id="rc-nps-comentario" placeholder="${comunicacao.conteudo?.placeholder||'Comentário (opcional)'}" rows="3" style="width:100%;border:1px solid var(--line,#e6e3da);border-radius:10px;padding:10px;font-size:13.5px;margin-bottom:14px;font-family:inherit;box-sizing:border-box"></textarea>
 <p id="rc-nps-erro" style="display:none;color:#c1463a;font-size:11px;margin:-8px 0 10px"></p>
 <div style="display:flex;gap:8px"><button id="rc-nps-fechar" type="button" style="flex:1;background:#f2efe7;color:#4a5852;font-weight:600;padding:10px;border-radius:999px;border:none">Agora não</button>
 <button id="rc-nps-enviar" type="button" style="flex:1.4;background:var(--pine,#1e3a32);color:#fff;font-weight:700;padding:10px;border-radius:999px;border:none">Enviar</button></div></div>`;
 const stars=[...o.querySelectorAll('[data-nota]')];
 stars.forEach(b=>b.addEventListener('click',()=>{nota=Number(b.dataset.nota);stars.forEach(s=>s.style.color=Number(s.dataset.nota)<=nota?'var(--brass,#c68a3b)':'#d1d5db');}));
 o.querySelector('#rc-nps-fechar').addEventListener('click',()=>onFechar?.());
 o.querySelector('#rc-nps-enviar').addEventListener('click',async()=>{
  const comentario=o.querySelector('#rc-nps-comentario').value.trim(),err=o.querySelector('#rc-nps-erro');
  if(!nota){err.textContent='Escolha uma nota de 1 a 5.';err.style.display='block';return;}
  err.style.display='none';await onEnviar?.({nota,comentario});
 });
}
