// Raiz Patrimônio — Central de Comunicações Omnichannel — Adaptador App
// Beta v1.43.0
import {configurarApiComunicacoes,registrarLoginComunicacoes,buscarComunicacoesCandidatas,registrarInteracao,responderNps} from './comunicacoes-api.js';
import {selecionarComunicacao} from './comunicacoes-regras.js';
import {renderizarOnboarding,renderizarNps,fecharComunicacao} from './comunicacoes-ui.js';
import {obterEstadoPwa,solicitarInstalacaoPwa} from './pwa-instalacao.js';

const loginsRegistrados=new Map();

async function seguro(c,ctx,evento,detalhe={}){
 try{await registrarInteracao({comunicacaoId:c.id,pessoaId:ctx.pessoaId,clienteId:ctx.clienteId,evento,detalhe});}
 catch(e){console.warn('[comunicacoes]',e.message);}
}
async function processar(ev){
 const ctx=ev.detail||{};if(!ctx.dbAuth||!ctx.pessoaId||!ctx.clienteId)return;
 configurarApiComunicacoes(ctx.dbAuth);
 try{
  const chaveLogin=`${ctx.clienteId}:${ctx.pessoaId}`;
  if(!loginsRegistrados.has(chaveLogin)){
    loginsRegistrados.set(chaveLogin,await registrarLoginComunicacoes({pessoaId:ctx.pessoaId,clienteId:ctx.clienteId}));
  }
  ctx.contadorLogin=loginsRegistrados.get(chaveLogin);
  const cand=await buscarComunicacoesCandidatas({pessoaId:ctx.pessoaId,clienteId:ctx.clienteId});
  const pwa=obterEstadoPwa();
  const regras={semImoveis:Number(ctx.quantidadeImoveis||0)===0,pwaInstalado:pwa.standalone,plano:ctx.plano||null,perfil:ctx.perfil||null,tela:ctx.tela||'inicio',dispositivo:pwa.navegador,contadorLogin:Number(ctx.contadorLogin||0),interacoesDesdeNps:0};
  const c=selecionarComunicacao(cand,regras);
  if(!c){ctx.onSemComunicacao?.();return;}
  await seguro(c,ctx,'exibiu',{tela:regras.tela,dispositivo:regras.dispositivo});
  if(c.tipo==='onboarding'&&c.formato==='modal'){
   renderizarOnboarding({comunicacao:c,estadoPwa:pwa,
    onFechar:async()=>{await seguro(c,ctx,'fechou',{motivo:'agora_nao'});fecharComunicacao();},
    onInstalar:async()=>{await seguro(c,ctx,'clicou',{acao:'instalar_pwa'});const r=await solicitarInstalacaoPwa();if(['aceito','ja_instalado'].includes(r.resultado))await seguro(c,ctx,'instalou',{resultado:r.resultado});return r;},
    onConcluir:async()=>{await seguro(c,ctx,'concluiu',{acao_final:'abrir_formulario_imovel'});fecharComunicacao();ctx.onAcaoFinal?.('abrir_formulario_imovel');}
   });return;
  }
  if(c.tipo==='nps'&&c.formato==='nps_modal'){
   renderizarNps({comunicacao:c,
    onFechar:async()=>{await seguro(c,ctx,'fechou',{motivo:'agora_nao'});fecharComunicacao();},
    onEnviar:async({nota,comentario})=>{await responderNps({comunicacaoId:c.id,pessoaId:ctx.pessoaId,clienteId:ctx.clienteId,nota,comentario});fecharComunicacao();ctx.onToast?.('Obrigado pelo feedback! 🙏','success');}
   });return;
  }
  await seguro(c,ctx,'erro',{motivo:'formato_app_nao_implementado',formato:c.formato});ctx.onSemComunicacao?.();
 }catch(e){console.warn('[comunicacoes] Falha:',e.message);ctx.onSemComunicacao?.();}
}
window.addEventListener('raiz:comunicacoes:processar',processar);
