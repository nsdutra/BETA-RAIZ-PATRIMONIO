// Raiz Patrimônio — Central de Comunicações Omnichannel — Regras puras
// Beta v1.43.0
export function detectarAmbiente(navigatorLike=navigator,windowLike=window){
 const ua=navigatorLike.userAgent||'';
 const ios=/iPad|iPhone|iPod/.test(ua)||(navigatorLike.platform==='MacIntel'&&navigatorLike.maxTouchPoints>1);
 const android=/Android/i.test(ua);
 const standalone=Boolean(windowLike.matchMedia&&windowLike.matchMedia('(display-mode: standalone)').matches)||navigatorLike.standalone===true;
 return {ios,android,standalone,navegador:ios?'ios':android?'android':'outro'};
}
export function comparar(atual,operador,esperado){
 if(operador==='eq') return atual===esperado;
 if(operador==='neq') return atual!==esperado;
 if(operador==='in') return Array.isArray(esperado)&&esperado.includes(atual);
 if(operador==='gte') return Number(atual)>=Number(esperado);
 if(operador==='lte') return Number(atual)<=Number(esperado);
 return false;
}
export function regraAtendida(regra,ctx){
 const mapa={
  sem_imoveis:()=>Boolean(ctx.semImoveis)===Boolean(regra.valor),
  pwa_nao_instalado:()=>Boolean(!ctx.pwaInstalado)===Boolean(regra.valor),
  plano:()=>comparar(ctx.plano,regra.operador,regra.valor),
  perfil:()=>comparar(ctx.perfil,regra.operador,regra.valor),
  tela:()=>comparar(ctx.tela,regra.operador,regra.valor),
  dispositivo:()=>comparar(ctx.dispositivo,regra.operador,regra.valor),
  contador_login:()=>comparar(ctx.contadorLogin,regra.operador,regra.valor),
  interacoes_desde_nps:()=>comparar(ctx.interacoesDesdeNps,regra.operador,regra.valor)
 };
 return mapa[regra.tipo_regra]?mapa[regra.tipo_regra]():false;
}
export function comunicacaoAtendeRegras(comunicacao,ctx){
 const regras=comunicacao.regras||[];
 if(!regras.length) return true;
 const grupos=[...new Set(regras.map(r=>Number(r.grupo_regra||1)))];
 return grupos.some(g=>regras.filter(r=>Number(r.grupo_regra||1)===g).every(r=>regraAtendida(r,ctx)));
}
export function selecionarComunicacao(lista,ctx){
 return [...(lista||[])]
   .filter(c=>!c.concluida)
   .filter(c=>comunicacaoAtendeRegras(c,ctx))
   .sort((a,b)=>(b.prioridade||0)-(a.prioridade||0))[0]||null;
}
