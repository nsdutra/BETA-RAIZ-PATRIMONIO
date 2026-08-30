// Raiz Patrimônio — Central de Comunicações Omnichannel — Adaptador App
// Beta v1.45.0
//
// v1.45.0 — pedido explícito do Nicola (frente de conformidade LGPD):
// Termos de Uso/Política de Privacidade/Termo de Beta migraram pro motor
// de comunicações (dispensavel=false, formato='modal_bloqueante',
// prioridade máxima, 1ª msg do plano Onboarding — ver migrations
// 30/08/2026). Substitui os módulos separados js/comunicacoes/
// consentimento-{api,ui,app}.js, que ficam obsoletos (não removidos do
// repo automaticamente — Nicola remove na próxima limpeza). index.html/
// cofre-navegacao.js voltam a disparar 'raiz:comunicacoes:processar'
// direto, sem o wrapper 'raiz:termos:verificar' que existia antes.
//
// v1.44.0 — pedido explícito do Nicola (não duplicar lógica entre app e
// bot, implementar no banco): a escolha de qual comunicação mostrar
// agora vem de fn_comunicacao_proxima_app (via buscarProximaComunicacao,
// comunicacoes-api.js) — não mais de selecionarComunicacao()/
// comunicacoes-regras.js local. O bot (whatsapp-webhook) passa a chamar
// a MESMA função no banco (fn_comunicacao_proxima_servico), com canal
// diferente — nenhum dos dois reimplementa a decisão.
//
// comunicacoes-regras.js NÃO foi removido — tests/comunicacoes.test.js
// ainda testa comparar()/regraAtendida()/selecionarComunicacao() como
// funções puras isoladas; deixar existir não causa mal, só não é mais
// chamado por este arquivo.
//
// onConcluir agora lê c.conteudo?.acao_final dinamicamente (antes vinha
// hardcoded 'abrir_formulario_imovel') — necessário desde que passou a
// existir a variante "ativo" do onboarding (acao_final=
// 'abrir_formulario_ativo', usada pelo Cofre — ver cofre-app.js).
//
// ctx.quantidadeImoveis/ctx.plano/ctx.perfil (index.html ainda os passa
// no detail do evento) não são mais lidos aqui — o banco calcula tudo
// isso sozinho a partir de pessoa_id/cliente_id. Não precisei tocar em
// index.html pra parar de mandar esses campos: são só ignorados agora,
// sem custo, e removê-los de lá é limpeza opcional pra outra hora.
import {configurarApiComunicacoes,registrarLoginComunicacoes,buscarProximaComunicacao,registrarInteracao,responderNps} from './comunicacoes-api.js';
import {renderizarOnboarding,renderizarNps,renderizarAceite,fecharComunicacao} from './comunicacoes-ui.js';
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
  const pwa=obterEstadoPwa();
  // Só o que é genuinamente de sessão/local — o resto o banco calcula.
  const ctxCliente={pwaInstalado:pwa.standalone,tela:ctx.tela||'inicio',dispositivo:pwa.navegador};
  const c=await buscarProximaComunicacao({pessoaId:ctx.pessoaId,clienteId:ctx.clienteId,ctxCliente});
  if(!c){ctx.onSemComunicacao?.();return;}
  await seguro(c,ctx,'exibiu',{tela:ctxCliente.tela,dispositivo:ctxCliente.dispositivo});
  // NOVO (v1.45.0) — dispensavel=false vem ANTES dos outros formatos:
  // aceite obrigatório nunca deve cair no fallback "formato não
  // implementado" mesmo que o formato mude no futuro. Só cobre
  // tipo='onboarding' por enquanto (o único caso real hoje).
  if(c.dispensavel===false&&c.formato==='modal_bloqueante'){
   renderizarAceite({comunicacao:c,
    onConfirmar:async()=>{await seguro(c,ctx,'aceitou',{});fecharComunicacao();ctx.onAcaoConcluida?.(c.codigo);
     // Encadeia: pode ter mais 1 pendente (ex. Política logo após Termos).
     window.dispatchEvent(new CustomEvent('raiz:comunicacoes:processar',{detail:ctx}));}
   });return;
  }
  if(c.tipo==='onboarding'&&c.formato==='modal'){
   renderizarOnboarding({comunicacao:c,estadoPwa:pwa,
    onFechar:async()=>{await seguro(c,ctx,'fechou',{motivo:'agora_nao'});fecharComunicacao();},
    onInstalar:async()=>{await seguro(c,ctx,'clicou',{acao:'instalar_pwa'});const r=await solicitarInstalacaoPwa();if(['aceito','ja_instalado'].includes(r.resultado))await seguro(c,ctx,'instalou',{resultado:r.resultado});return r;},
    onConcluir:async()=>{const acao=c.conteudo?.acao_final||'abrir_formulario_imovel';await seguro(c,ctx,'concluiu',{acao_final:acao});fecharComunicacao();ctx.onAcaoFinal?.(acao);}
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
