// ============================================================================
// comum-minha-empresa.js — Raiz Patrimônio · Administração compartilhada
// Versão: 1.10.1 · 04/10/2026
//
// v1.10.1 (04/10/2026, sessão 20261004-1540-financeiro, demanda f3e6cd27 — teste
// da P4a, de acordo do Nicola): "Excluir conta" sempre aparece nas ações da
// conta (fn_conta_excluir). Sem movimento, apaga; com movimento, o banco
// responde explicando e sugerindo "Encerrar conta". "Encerrar" também passa a
// aparecer na padrão de uma pessoa (o banco aceita quando é a única conta
// dela). A padrão da empresa continua protegida. Versão anterior: 1.10.0.
//
// v1.10.0 (04/10/2026, sessão 20261004-1245-financeiro, demanda f3e6cd27 — P4a,
// fichas A1–A6 aprovadas pelo Nicola 12:43) — card novo "Contas" no fim da
// tela: a "Conta da empresa" (P3) e as contas de cada pessoa. "+" abre a ficha
// da conta em Sheet (nome, titular, banco, 4 finais, contabilidade,
// conciliação); toque na linha abre Editar / Definir como padrão / Encerrar.
// Toda regra mora no banco (fn_contas_listar, fn_conta_salvar,
// fn_conta_definir_padrao, fn_conta_encerrar — as mesmas que o bot chama).
// Sem Premium, o card mostra só a conta da empresa e uma linha com cadeado e
// o motivo (ACE-04). Versão anterior: 1.9.0.
//
// v1.9.0 (F0.2b do PLANO_UX, demanda 9e4aca28, sessão 20261003-1707-ux-base; UXR-29/30) — zero diálogo nativo: remover logo e remover assinatura viram
// perguntar() do cofre-ui (Sheet com item vermelho).
//
// Versão anterior: 1.8.0 · 01/10/2026
//
// v1.8.0 (F12, demanda 3a1a5ef5, aprovada em 01/10/2026) — card novo "Pix para
// cobrança de aluguel": Chave Pix (clientes.pix_chave) e Nome do recebedor
// (clientes.pix_recebedor_nome; vazio = nome da empresa). Colunas já existiam
// (F10). A cidade do Pix vem do endereço da sede. Hoje a chave é usada na
// cobrança de aluguel pelo WhatsApp, de forma opcional na hora de cobrar.
// Mesmo salvar de sempre (salvarDadosEmpresa). Versão anterior: 1.7.0.
//
// v1.7.0 (frente fiscal, Fase 2 — demanda 976fcbf6) — card "Perfil fiscal e
// societário" ganha "Inscrição municipal" (clientes.inscricao_municipal,
// coluna nova, opcional; até 30 caracteres, conferido também no banco).
// Mesmo salvar de sempre (salvarDadosEmpresa). Quem emite a nota
// (fiscal_responsavel_emissao) fica para a tela Fiscal, fases seguintes.
//
// v1.6.0 (Fase R / Entrega R.2, 20/09/2026) — Card "Rotinas": lista as 5
// rotinas de empresa do catálogo (cofre_controle_subtipos, tipo='rotina',
// titular_escopo 'empresa' — fechamento mensal, envio ao contador, NFS-e
// da competência, relatório da carteira, indicadores de mercado) via
// fn_rotinas_empresa_listar. Toque na linha abre Sheet de ações (⋮,
// abrirSheetAcoes já global no host) com "Ligar rotina" (codigo
// cofre.controles.criar — ACE-01: aparece travada com cadeado/motivo se o
// plano não incluir, igual a qualquer outro item do catálogo) ou "Desligar
// rotina". Camada de dados nova (buscarRotinasEmpresa/ligarRotinaEmpresa/
// desligarRotinaEmpresa) chama fn_rotina_empresa_ligar/fn_rotina_empresa_
// desligar/fn_rotinas_empresa_listar (migration rotinas_funcoes_ligar_
// desligar_listar_v1). Segue o mesmo princípio do resto do arquivo: módulo
// não pressupõe host, mas usa window.abrirSheetAcoes/window.renderStatus/
// window.podeUsar (via codigo na ação) quando disponíveis, com fallback
// degradado (toast "só disponível dentro do app principal") quando não.
//
// v1.5.0 (A.5.1, 09/09/2026) — CEP, telefone, e-mail e site da empresa:
// colunas criadas em `clientes` (migration a5_1_clientes_cep_telefone_email_
// site_v1, CHECK de CEP 8 dígitos e e-mail). Campos no card de contato e
// de endereço; CEP salvo só com dígitos.
//
// Versão anterior: 1.4.0 · 06/09/2026
//
// v1.4.0 — TELA COMPLETA NA GRAMÁTICA (print do Nicola 20:16: "modelo antigo
// com formatação ruim; traga os campos completos"). Formulário reescrito no
// catálogo .rz-f/.rz-f2/.rz-seg (antes era Tailwind solto: alturas e labels
// desiguais). 4 cards: Identificação (natureza PF/PJ em segmento → rótulo e
// máscara CPF/CNPJ, responsável, pessoa de contato) · Endereço da sede (UF em
// select, código IBGE do município) · Recibos e documentos (cidade do recibo,
// papel na locação, LOGO com upload reduzido no navegador) · Perfil fiscal e
// societário (regime tributário, distribuição de lucros — enums do banco).
// Todos os campos são colunas que JÁ existem em `clientes`; nenhuma coluna
// nova (regra do Nicola). Sem coluna no banco, logo fora da tela: CEP,
// telefone, e-mail e site da empresa — decisão pendente (PENDÊNCIAS A.5).
// Gate parametros.empresa.editar: sem permissão, tudo em leitura (inputs
// desabilitados, botões de upload também). Documento gravado com máscara.
// Índice também passou a recarregar CONFIG_CLIENTE.logoUrl após salvar.
//
// v1.3.1 — 06/09/2026 · constante VERSAO sincronizada.
//
// v1.3.1 — constante VERSAO sincronizada com o header (estava presa em uma
// versão anterior desde o bump do header; ⚙️ › Versões lia a constante e
// acusava "cache segurou" sem haver cache). gerar_versoes.py v1.3 agora
// trava a entrega se header ≠ VERSAO.
//
// Versão anterior: 1.3.0 · 06/09/2026
//
// v1.3.0 — layout na gramática (print do Nicola): tabhead com descrição, card
// "Dados da empresa" com .rz-card-h, labels leves, assinatura em card próprio.
//
// v1.2.0 — gramática: botões no catálogo (Salvar = rz-btn-1, assinatura = rz-btn-2 + rz-ico-btn),
// sentence case; gate parametros.empresa.editar (sem permissão = só leitura, com motivo).
//
// v1.1.0 — pedido explícito: "resolva as pendências de cores listadas".
// bg-emerald-600 (único uso deste arquivo) trocado por var(--pine) —
// era o botão de ação principal (Salvar), token certo por definição
// (DS §12: "Ação principal → background:var(--pine)").
//
// v1.0.0 — PRIMEIRA VERSÃO. Extraído de index.html (dev_carregarDadosEmpresa()/
// dev_salvarDadosEmpresa()/processarUploadAssinatura()/calcularLimiarOtsu()/
// salvarAssinaturaProcessada()/apagarAssinatura(), Beta v1.64.0) pra
// módulo compartilhado — pedido explícito: "faz também Minha Empresa e
// Pessoas" (mesma sessão/motivo de comum-sobre.js/comum-licenca.js — ver
// changelog completo lá, não repetido aqui).
//
// DIFERENÇA em relação à versão original: o índex.html lia/escrevia
// direto em CONFIG_CLIENTE (objeto global carregado no login). Este
// módulo NÃO depende de CONFIG_CLIENTE existir no host — busca a linha
// de `clientes` sozinho (mesmo princípio de comum-licenca.js: módulo
// compartilhado não pressupõe variável global de nenhum host
// específico). Depois de salvar, chama `ctx.onBrandingAtualizado?.()`
// pra avisar o host que pode querer atualizar CONFIG_CLIENTE/branding
// (index.html usa isso pra refletir no recibo em PDF; Cofre não tem
// recibo, então simplesmente não passa esse callback).
//
// Diretriz Arquitetural: não cria seu próprio cliente Supabase — recebe
// `dbAuth` já autenticado do host, por parâmetro (ver nota completa em
// comum-licenca.js).
// ============================================================================

export const VERSAO = '1.10.1'; // v-check (20/09/2026): lido por Dev › Versões — manter igual ao header
import { perguntar } from './cofre-ui.js'; // v1.9.0 (F0.2b) — sem diálogo nativo
import { rzMostrarBloqueio as rzBloqueio, podeUsar as podeUsarMod } from './comum-licenca.js'; // v1.10.0 — porta de licença (contas)
export const COMUM_MINHA_EMPRESA_VERSAO = '1.0.0';

// ----------------------------------------------------------------------------
// CAMADA DE DADOS
// ----------------------------------------------------------------------------
export async function buscarDadosEmpresa(dbAuth, clienteId) {
    const { data, error } = await dbAuth.from('clientes').select('*').eq('id', clienteId).maybeSingle();
    if (error) throw error;
    return data;
}

async function salvarDadosEmpresa(dbAuth, clienteId, dados) {
    const { error } = await dbAuth.from('clientes').update(dados).eq('id', clienteId);
    if (error) throw error;
}

async function salvarAssinatura(dbAuth, clienteId, dataUrlOuNull) {
    const { error } = await dbAuth.from('clientes').update({ assinatura_url: dataUrlOuNull }).eq('id', clienteId);
    if (error) throw error;
}

// ----------------------------------------------------------------------------
// PROCESSAMENTO DE ASSINATURA (100% no navegador, canvas — nenhuma foto
// crua é enviada a lugar nenhum) — cópia fiel do algoritmo original.
// ----------------------------------------------------------------------------

// Método de Otsu — acha, a partir do histograma de brilho da própria
// imagem, o ponto de corte que melhor separa dois grupos (traço de
// caneta vs. papel/fundo). Mais confiável que um número fixo chutado,
// que falha quando a foto tem sombra ou iluminação desigual.
function calcularLimiarOtsu(px) {
    const histograma = new Array(256).fill(0);
    let totalPixels = 0;
    for (let i = 0; i < px.length; i += 4) {
        const luminancia = Math.round(0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2]);
        histograma[luminancia]++;
        totalPixels++;
    }
    let somaTotal = 0;
    for (let t = 0; t < 256; t++) somaTotal += t * histograma[t];

    let somaFundo = 0, pesoFundo = 0, melhorVariancia = 0, melhorLimiar = 128;
    for (let t = 0; t < 256; t++) {
        pesoFundo += histograma[t];
        if (pesoFundo === 0) continue;
        const pesoTraco = totalPixels - pesoFundo;
        if (pesoTraco === 0) break;
        somaFundo += t * histograma[t];
        const mediaFundo = somaFundo / pesoFundo;
        const mediaTraco = (somaTotal - somaFundo) / pesoTraco;
        const variancia = pesoFundo * pesoTraco * (mediaFundo - mediaTraco) ** 2;
        if (variancia > melhorVariancia) { melhorVariancia = variancia; melhorLimiar = t; }
    }
    return melhorLimiar;
}

// Recebe um <input type=file>, devolve uma Promise que resolve com o
// data URL (PNG) já processado (fundo transparente, traço em preto,
// recortado só na área com tinta).
function processarArquivoAssinatura(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Falha ao ler o arquivo.'));
        reader.onload = (e) => {
            const img = new Image();
            img.onerror = () => reject(new Error('Arquivo não é uma imagem válida.'));
            img.onload = () => {
                const maxLargura = 800;
                const escala = Math.min(1, maxLargura / img.width);
                const canvas = document.createElement('canvas');
                canvas.width = img.width * escala;
                canvas.height = img.height * escala;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const px = imgData.data;

                const limiar = calcularLimiarOtsu(px);
                const faixaSuave = 15;
                for (let i = 0; i < px.length; i += 4) {
                    const luminancia = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
                    let alpha;
                    if (luminancia <= limiar - faixaSuave) alpha = 255;
                    else if (luminancia >= limiar + faixaSuave) alpha = 0;
                    else alpha = 255 * (1 - (luminancia - (limiar - faixaSuave)) / (2 * faixaSuave));
                    px[i] = 20; px[i + 1] = 20; px[i + 2] = 30; // preto levemente azulado (tinta de caneta)
                    px[i + 3] = alpha;
                }
                ctx.putImageData(imgData, 0, 0);

                // Recorta só a caixa que envolve os pixels com tinta (alpha > 128),
                // com margem pequena — evita o traço minúsculo cercado de vazio.
                let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0, encontrouTraco = false;
                for (let y = 0; y < canvas.height; y++) {
                    for (let x = 0; x < canvas.width; x++) {
                        const alpha = px[(y * canvas.width + x) * 4 + 3];
                        if (alpha > 128) {
                            encontrouTraco = true;
                            if (x < minX) minX = x;
                            if (x > maxX) maxX = x;
                            if (y < minY) minY = y;
                            if (y > maxY) maxY = y;
                        }
                    }
                }

                let canvasFinal = canvas;
                if (encontrouTraco) {
                    const margem = 12;
                    const recX = Math.max(0, minX - margem);
                    const recY = Math.max(0, minY - margem);
                    const recW = Math.min(canvas.width, maxX + margem) - recX;
                    const recH = Math.min(canvas.height, maxY + margem) - recY;
                    canvasFinal = document.createElement('canvas');
                    canvasFinal.width = recW;
                    canvasFinal.height = recH;
                    canvasFinal.getContext('2d').drawImage(canvas, recX, recY, recW, recH, 0, 0, recW, recH);
                }

                resolve(canvasFinal.toDataURL('image/png'));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// ----------------------------------------------------------------------------
// UI
// ----------------------------------------------------------------------------

// mountEl = elemento container já presente no DOM do host. ctx = {
//   dbAuth, clienteId,
//   onToast(mensagem, tipo),          // opcional
//   onBrandingAtualizado(),           // opcional — chamado depois de
//                                      // salvar (dados ou assinatura),
//                                      // pro host atualizar seu próprio
//                                      // cache de branding se tiver um
//   registrarLog(acao, detalhe),      // opcional — se o host quiser
//                                      // manter seu próprio log_acessos
//                                      // com a mesma convenção de nome
//                                      // de ação já usada (ex.: index.html)
// }
export async function montarAbaMinhaEmpresa(mountEl, ctx) {
    if (!mountEl) return;
    const { dbAuth, clienteId, onToast, onBrandingAtualizado, registrarLog } = ctx || {};

    mountEl.innerHTML = '<p class="text-xs text-gray-500 text-center py-8">Carregando dados da empresa...</p>';
    if (!dbAuth || !clienteId) {
        mountEl.innerHTML = '<p class="text-xs text-gray-500 text-center py-8">Nenhuma empresa carregada.</p>';
        return;
    }

    let dados;
    try {
        dados = await buscarDadosEmpresa(dbAuth, clienteId);
    } catch (err) {
        console.warn('[comum-minha-empresa] Falha ao carregar dados da empresa:', err.message);
        mountEl.innerHTML = '<p class="text-xs text-red-500 text-center py-8">Não foi possível carregar os dados da empresa agora.</p>';
        return;
    }
    if (!dados) {
        mountEl.innerHTML = '<p class="text-xs text-gray-500 text-center py-8">Empresa não encontrada.</p>';
        return;
    }

    const esc = (v) => (v == null ? '' : String(v)).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const val = (v) => esc(v);
    const sel = (atual, valor) => atual === valor ? 'selected' : '';
    // natureza: pf/pj (coluna `natureza`). Sem valor gravado, infere pelo doc_tipo
    // ou pelo tamanho do documento (11 dígitos = CPF) — só pra pré-selecionar.
    const digitos = (v) => (v || '').replace(/\D/g, '');
    const naturezaInicial = dados.natureza || (dados.doc_tipo === 'CPF' ? 'pf' : dados.doc_tipo === 'CNPJ' ? 'pj' : (digitos(dados.cnpj).length === 11 ? 'pf' : 'pj'));
    const gate = (window.podeUsar && !window.podeUsar('parametros.empresa.editar').ok) ? window.podeUsar('parametros.empresa.editar') : null;
    const opcoesUF = ['', 'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']
        .map(uf => `<option value="${uf}" ${sel((dados.uf || '').toUpperCase(), uf)}>${uf || '—'}</option>`).join('');

    // Rótulos dos enums do banco (regime_tributario_enum / modelo_distribuicao_enum /
    // papel_na_locacao CHECK) — os VALORES são os do banco, só o texto é humano.
    const REGIMES = [['', 'Não informado'], ['pessoa_fisica', 'Pessoa física (carnê-leão)'], ['simples_nacional', 'Simples Nacional'], ['lucro_presumido', 'Lucro presumido'], ['lucro_real', 'Lucro real']];
    const MODELOS = [['', 'Não informado'], ['retirada_livre_sem_controle', 'Retirada livre, sem controle'], ['retirada_livre_com_controle', 'Retirada livre, com controle'], ['programada_percentual_fixo', 'Programada, percentual fixo'], ['programada_percentual_variavel', 'Programada, percentual variável']];
    const PAPEIS = [['', 'Não informado'], ['proprietario', 'Proprietário (aluga o que é seu)'], ['administradora', 'Administradora (aluga para terceiros)'], ['ambos', 'Os dois']];
    const opts = (lista, atual) => lista.map(([v, t]) => `<option value="${v}" ${sel(atual || '', v)}>${t}</option>`).join('');

    mountEl.innerHTML = `
        <div class="rz-tabhead"><p>Dados da sua empresa, usados em recibos, minutas e na leitura tributária do patrimônio.</p></div>

        ${gate ? `<div class="rz-card" style="margin-bottom:12px"><p class="text-xs" style="color:var(--wine)">🔒 ${esc(gate.textoCurto)} — esta tela está só em leitura.</p></div>` : ''}

        <div class="rz-card"><div class="rz-card-h"><h3>Identificação</h3></div>
            <div class="rz-f"><label>Nome da empresa</label>
                <input type="text" id="cme-nome" disabled value="${val(dados.nome_empresa)}" style="background:var(--tile);color:var(--muted)">
                <span class="rz-hint">Não pode ser alterado nem excluído por aqui.</span>
            </div>
            <div class="rz-f"><label>Natureza</label>
                <div class="rz-seg" id="cme-natureza" style="margin-bottom:0">
                    <button type="button" data-v="pj" class="${naturezaInicial === 'pj' ? 'rz-on' : ''}">Pessoa jurídica</button>
                    <button type="button" data-v="pf" class="${naturezaInicial === 'pf' ? 'rz-on' : ''}">Pessoa física</button>
                </div>
            </div>
            <div class="rz-f2">
                <div class="rz-f"><label id="cme-doc-label">${naturezaInicial === 'pf' ? 'CPF' : 'CNPJ'}</label>
                    <input type="text" id="cme-cnpj" inputmode="numeric" placeholder="${naturezaInicial === 'pf' ? '000.000.000-00' : '00.000.000/0000-00'}" value="${val(dados.cnpj)}">
                </div>
                <div class="rz-f"><label>Responsável <i title="assina o recibo">*</i></label>
                    <input type="text" id="cme-responsavel" placeholder="Quem assina o recibo" value="${val(dados.nome_responsavel)}">
                </div>
            </div>
            <div class="rz-f"><label>Pessoa de contato</label>
                <input type="text" id="cme-contato" placeholder="Com quem a Raiz fala" value="${val(dados.pessoa_contato_nome)}">
            </div>
            <div class="rz-f2">
                <div class="rz-f"><label>Telefone</label><input type="tel" id="cme-telefone" inputmode="tel" placeholder="(11) 90000-0000" value="${val(dados.telefone)}"></div>
                <div class="rz-f"><label>E-mail</label><input type="email" id="cme-email" inputmode="email" placeholder="contato@empresa.com.br" value="${val(dados.email)}"></div>
            </div>
            <div class="rz-f" style="margin-bottom:0"><label>Site</label><input type="url" id="cme-site" inputmode="url" placeholder="https://" value="${val(dados.site)}"></div>
        </div>

        <div class="rz-card" id="cme-pix-card"><div class="rz-card-h"><h3>Pix para cobrança de aluguel</h3></div>
            <div class="rz-f"><label>Chave Pix</label>
                <input type="text" id="cme-pix-chave" maxlength="77" placeholder="CPF/CNPJ, e-mail, celular ou chave aleatória" value="${val(dados.pix_chave)}">
            </div>
            <div class="rz-f" style="margin-bottom:0"><label>Nome do recebedor</label>
                <input type="text" id="cme-pix-nome" maxlength="25" placeholder="${val(dados.nome_empresa)}" value="${val(dados.pix_recebedor_nome)}">
                <span class="rz-hint">Hoje a chave é usada na cobrança de aluguel pelo WhatsApp: na hora de cobrar você escolhe se inclui a chave e o Pix copia e cola com o valor. Vazio = nome da empresa.</span>
            </div>
        </div>

        <div class="rz-card"><div class="rz-card-h"><h3>Endereço da sede</h3></div>
            <div class="rz-f" style="max-width:180px"><label>CEP</label><input type="text" id="cme-cep" inputmode="numeric" maxlength="9" placeholder="00000-000" value="${val(dados.cep)}"></div>
            <div class="rz-f2" style="grid-template-columns:2fr 1fr">
                <div class="rz-f"><label>Endereço</label><input type="text" id="cme-endereco" placeholder="Rua e número" value="${val(dados.endereco)}"></div>
                <div class="rz-f"><label>Complemento</label><input type="text" id="cme-complemento" value="${val(dados.complemento)}"></div>
            </div>
            <div class="rz-f2">
                <div class="rz-f"><label>Bairro</label><input type="text" id="cme-bairro" value="${val(dados.bairro)}"></div>
                <div class="rz-f"><label>Cidade</label><input type="text" id="cme-cidade" value="${val(dados.cidade)}"></div>
            </div>
            <div class="rz-f2" style="grid-template-columns:1fr 2fr">
                <div class="rz-f" style="margin-bottom:0"><label>UF</label><select id="cme-uf">${opcoesUF}</select></div>
                <div class="rz-f" style="margin-bottom:0"><label>Código IBGE do município</label>
                    <input type="text" id="cme-ibge" inputmode="numeric" maxlength="7" placeholder="7 dígitos" value="${val(dados.municipio_sede_ibge)}">
                    <span class="rz-hint">Usado nos tributos municipais (IPTU, ISS) e na NFS-e.</span>
                </div>
            </div>
        </div>

        <div class="rz-card"><div class="rz-card-h"><h3>Recibos e documentos</h3></div>
            <div class="rz-f"><label>Cidade impressa no recibo</label>
                <select id="cme-cidade-recibo-fonte">
                    <option value="empresa" ${dados.cidade_recibo_fonte !== 'imovel' ? 'selected' : ''}>Cidade da empresa (a de cima)</option>
                    <option value="imovel" ${dados.cidade_recibo_fonte === 'imovel' ? 'selected' : ''}>Cidade do imóvel alugado</option>
                </select>
            </div>
            <div class="rz-f"><label>Papel na locação</label>
                <select id="cme-papel">${opts(PAPEIS, dados.papel_na_locacao)}</select>
                <span class="rz-hint">Define como o sistema lê contratos e repasses.</span>
            </div>
            <div class="rz-f" style="margin-bottom:0"><label>Logo</label>
                <div id="cme-logo-preview-wrap" class="${dados.logo_url ? '' : 'hidden'}" style="padding:10px;border:1.5px solid var(--line);border-radius:var(--r-ctl);display:flex;align-items:center;justify-content:center;margin-bottom:6px"><img id="cme-logo-preview" alt="Logo" style="max-height:56px" src="${val(dados.logo_url)}"></div>
                <div class="flex gap-1.5">
                    <input type="file" id="cme-logo-input" accept="image/*" class="hidden">
                    <button id="cme-btn-logo" type="button" class="rz-btn rz-btn-2" style="flex:1" ${gate ? 'disabled' : ''}><svg data-lucide="image" style="width:14px;height:14px"></svg> <span id="cme-logo-btn-texto">${dados.logo_url ? 'Trocar logo' : 'Enviar logo'}</span></button>
                    <button id="cme-btn-apagar-logo" type="button" title="Remover logo" aria-label="Remover logo" class="${dados.logo_url ? '' : 'hidden'} rz-ico-btn" ${gate ? 'disabled' : ''}><svg data-lucide="trash-2" style="width:15px;height:15px"></svg></button>
                </div>
                <span class="rz-hint">Aparece no topo do app e na abertura. PNG ou JPG; o sistema reduz para o tamanho certo.</span>
            </div>
        </div>

        <div class="rz-card"><div class="rz-card-h"><h3>Perfil fiscal e societário</h3></div>
            <div class="rz-f"><label>Regime tributário</label>
                <select id="cme-regime">${opts(REGIMES, dados.regime_tributario)}</select>
            </div>
            <div class="rz-f"><label>Inscrição municipal</label>
                <input type="text" id="cme-im" maxlength="30" placeholder="Se a prefeitura exigir" value="${val(dados.inscricao_municipal)}">
                <span class="rz-hint">Opcional na NFS-e nacional; alguns municípios pedem.</span>
            </div>
            <div class="rz-f" style="margin-bottom:0"><label>Distribuição de lucros</label>
                <select id="cme-modelo">${opts(MODELOS, dados.modelo_distribuicao_lucros)}</select>
                <span class="rz-hint">Alimenta a leitura tributária em Resultados e os sinais da reforma.</span>
            </div>
        </div>

        <button id="cme-btn-salvar" class="rz-btn rz-btn-1 rz-wide" ${gate ? 'disabled style="opacity:.5"' : ''} style="margin-bottom:12px">Salvar dados da empresa</button>

        <div class="rz-card"><div class="rz-card-h"><h3>Assinatura para o recibo</h3></div>
            <span class="rz-hint" style="display:block;margin-bottom:8px">Tire uma foto da assinatura numa folha em branco — o sistema trata a imagem automaticamente (fundo transparente, traço em preto) para caber no recibo.</span>
            <div id="cme-assinatura-preview-container" class="${dados.assinatura_url ? '' : 'hidden'} mb-2 p-3 bg-[repeating-conic-gradient(#e5e7eb_0%_25%,white_0%_50%)] bg-[length:16px_16px] rounded-lg border border-gray-200 flex items-center justify-center">
                <img id="cme-assinatura-preview" class="max-h-20" alt="Assinatura" src="${val(dados.assinatura_url)}">
            </div>
            <div class="flex gap-1.5">
                <input type="file" id="cme-assinatura-input" accept="image/*" capture="environment" class="hidden">
                <button id="cme-btn-assinatura" type="button" class="rz-btn rz-btn-2" style="flex:1" ${gate ? 'disabled' : ''}><svg data-lucide="camera" style="width:14px;height:14px"></svg> <span id="cme-assinatura-btn-texto">${dados.assinatura_url ? 'Trocar assinatura' : 'Enviar assinatura'}</span></button>
                <button id="cme-btn-apagar-assinatura" type="button" title="Apagar assinatura" aria-label="Apagar assinatura" class="${dados.assinatura_url ? '' : 'hidden'} rz-ico-btn" ${gate ? 'disabled' : ''}><svg data-lucide="trash-2" style="width:15px;height:15px"></svg></button>
            </div>
        </div>

        <div id="cme-rotinas-card"></div>
        <div id="cme-contas-card"></div>
    `;
    if (typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();
    if (gate) mountEl.querySelectorAll('input,select').forEach(el => { if (el.id !== 'cme-nome') el.disabled = true; });

    // -------- natureza (segmento) + máscara do documento --------
    let natureza = naturezaInicial;
    const inpDoc = document.getElementById('cme-cnpj');
    const mascarar = (v) => {
        const d = digitos(v).slice(0, natureza === 'pf' ? 11 : 14);
        if (natureza === 'pf') return d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        return d.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2');
    };
    inpDoc.addEventListener('input', () => { inpDoc.value = mascarar(inpDoc.value); });
    mountEl.querySelectorAll('#cme-natureza button').forEach(b => b.addEventListener('click', () => {
        if (gate) return;
        natureza = b.dataset.v;
        mountEl.querySelectorAll('#cme-natureza button').forEach(x => x.classList.toggle('rz-on', x === b));
        document.getElementById('cme-doc-label').textContent = natureza === 'pf' ? 'CPF' : 'CNPJ';
        inpDoc.placeholder = natureza === 'pf' ? '000.000.000-00' : '00.000.000/0000-00';
        inpDoc.value = mascarar(inpDoc.value);
    }));

    // -------- salvar dados --------
    document.getElementById('cme-btn-salvar').addEventListener('click', async () => {
        const g = (id) => (document.getElementById(id).value || '').trim();
        const doc = digitos(g('cme-cnpj'));
        if (doc && doc.length !== (natureza === 'pf' ? 11 : 14)) { onToast?.((natureza === 'pf' ? 'CPF' : 'CNPJ') + ' incompleto.', 'danger'); inpDoc.focus(); return; }
        const ibge = digitos(g('cme-ibge'));
        if (ibge && ibge.length !== 7) { onToast?.('Código IBGE tem 7 dígitos.', 'danger'); document.getElementById('cme-ibge').focus(); return; }
        // Documento gravado COM máscara (é como sai impresso no recibo; a
        // Rumo já está assim). doc_tipo acompanha a natureza escolhida.
        const payload = {
            natureza,
            doc_tipo: natureza === 'pf' ? 'CPF' : 'CNPJ',
            cnpj: doc ? mascarar(doc) : null,
            nome_responsavel: g('cme-responsavel') || null,
            pessoa_contato_nome: g('cme-contato') || null,
            telefone: g('cme-telefone') || null,
            email: g('cme-email') || null,
            site: g('cme-site') || null,
            cep: (g('cme-cep') || '').replace(/\D/g, '') || null,
            endereco: g('cme-endereco') || null,
            complemento: g('cme-complemento') || null,
            bairro: g('cme-bairro') || null,
            cidade: g('cme-cidade') || null,
            uf: g('cme-uf').toUpperCase() || null,
            municipio_sede_ibge: ibge || null,
            cidade_recibo_fonte: g('cme-cidade-recibo-fonte'),
            papel_na_locacao: g('cme-papel') || null,
            regime_tributario: g('cme-regime') || null,
            inscricao_municipal: g('cme-im') || null,
            pix_chave: g('cme-pix-chave') || null,
            pix_recebedor_nome: g('cme-pix-nome') || null,
            modelo_distribuicao_lucros: g('cme-modelo') || null,
        };
        try {
            await salvarDadosEmpresa(dbAuth, clienteId, payload);
            onToast?.('Dados da empresa salvos.', 'success');
            registrarLog?.('parametros.empresa.editar', {});
            onBrandingAtualizado?.();
        } catch (err) {
            onToast?.('Falha ao salvar: ' + err.message, 'danger');
        }
    });

    // -------- logo (data URL reduzida, mesmo princípio da assinatura: nada
    // sai do navegador além do resultado final) --------
    const inputLogo = document.getElementById('cme-logo-input');
    document.getElementById('cme-btn-logo').addEventListener('click', () => inputLogo.click());
    inputLogo.addEventListener('change', async () => {
        const file = inputLogo.files && inputLogo.files[0]; if (!file) return;
        try {
            const dataUrl = await reduzirImagem(file, 480, 160);
            await salvarDadosEmpresa(dbAuth, clienteId, { logo_url: dataUrl });
            document.getElementById('cme-logo-preview').src = dataUrl;
            document.getElementById('cme-logo-preview-wrap').classList.remove('hidden');
            document.getElementById('cme-btn-apagar-logo').classList.remove('hidden');
            document.getElementById('cme-logo-btn-texto').textContent = 'Trocar logo';
            registrarLog?.('parametros.empresa.editar', { campo: 'logo' });
            onBrandingAtualizado?.();
        } catch (err) { onToast?.('Falha ao salvar o logo: ' + err.message, 'danger'); }
    });
    document.getElementById('cme-btn-apagar-logo').addEventListener('click', async () => {
        if (!await perguntar({ titulo: 'Remover o logo?', impacto: 'O nome da empresa volta a aparecer no lugar.', destrutivo: true, rotuloConfirmar: 'Remover logo', icone: 'image-off' })) return;
        try {
            await salvarDadosEmpresa(dbAuth, clienteId, { logo_url: null });
            document.getElementById('cme-logo-preview-wrap').classList.add('hidden');
            document.getElementById('cme-btn-apagar-logo').classList.add('hidden');
            document.getElementById('cme-logo-btn-texto').textContent = 'Enviar logo';
            onBrandingAtualizado?.();
        } catch (err) { onToast?.('Falha ao remover: ' + err.message, 'danger'); }
    });

    // -------- assinatura --------
    const inputAssinatura = document.getElementById('cme-assinatura-input');
    document.getElementById('cme-btn-assinatura').addEventListener('click', () => inputAssinatura.click());
    inputAssinatura.addEventListener('change', async () => {
        const file = inputAssinatura.files && inputAssinatura.files[0];
        if (!file) return;
        try {
            const dataUrl = await processarArquivoAssinatura(file);
            await salvarAssinatura(dbAuth, clienteId, dataUrl);
            document.getElementById('cme-assinatura-preview').src = dataUrl;
            document.getElementById('cme-assinatura-preview-container').classList.remove('hidden');
            document.getElementById('cme-btn-apagar-assinatura').classList.remove('hidden');
            document.getElementById('cme-assinatura-btn-texto').textContent = 'Trocar assinatura';
            registrarLog?.('parametros.assinatura.editar', {});
            onBrandingAtualizado?.();
        } catch (err) {
            onToast?.('Falha ao salvar assinatura: ' + err.message, 'danger');
            console.warn('[comum-minha-empresa] Erro no processamento/salvamento da assinatura:', err.message);
        }
    });

    const btnApagarAssinatura = document.getElementById('cme-btn-apagar-assinatura');
    if (btnApagarAssinatura) btnApagarAssinatura.addEventListener('click', async () => {
        if (!await perguntar({ titulo: 'Remover a assinatura?', impacto: 'O recibo sai com o espaço em branco até uma nova ser enviada.', destrutivo: true, rotuloConfirmar: 'Remover assinatura' })) return;
        try {
            await salvarAssinatura(dbAuth, clienteId, null);
            document.getElementById('cme-assinatura-preview-container').classList.add('hidden');
            btnApagarAssinatura.classList.add('hidden');
            document.getElementById('cme-assinatura-btn-texto').textContent = 'Enviar assinatura';
            onBrandingAtualizado?.();
        } catch (err) {
            onToast?.('Falha ao remover: ' + err.message, 'danger');
        }
    });

    // -------- rotinas da empresa (R.2, Fase R) --------
    await renderRotinasCard();
    // -------- contas (v1.10.0, P4a) --------
    await renderContasCard(document.getElementById('cme-contas-card'), { dbAuth, clienteId, onToast });

    async function renderRotinasCard() {
        const alvo = document.getElementById('cme-rotinas-card');
        if (!alvo) return;
        let rotinas;
        try {
            rotinas = await buscarRotinasEmpresa(dbAuth, clienteId);
        } catch (err) {
            console.warn('[comum-minha-empresa] Falha ao carregar rotinas:', err.message);
            alvo.innerHTML = '';
            return;
        }
        if (!rotinas || !rotinas.length) { alvo.innerHTML = ''; return; }

        const r = typeof window.renderStatus === 'function' ? window.renderStatus : (c, t) => `<span class="rz-st rz-${esc(c)}">${esc(t || c)}</span>`;
        alvo.innerHTML = `
            <div class="rz-card"><div class="rz-card-h"><h3>Rotinas</h3></div>
                <div class="rz-list">
                    ${rotinas.map(rt => `
                        <div class="rz-row" data-rotina-codigo="${esc(rt.codigo)}" data-rotina-item="${rt.item_id || ''}" style="cursor:pointer">
                            <div class="rz-ic${rt.ligada ? '' : ' rz-neu'}"><i data-lucide="${ICONES_ROTINA_EMPRESA[rt.codigo] || 'repeat'}"></i></div>
                            <div class="rz-tx">
                                <b>${esc(rt.nome)}</b>
                                <span>${rt.ligada ? 'Mensal · aviso ' + (rt.antecedencia_alerta_dias ?? 5) + ' dias antes' : 'Desligada'}</span>
                            </div>
                            <div class="rz-rt">${rt.ligada ? r('ok', 'Ligada') : r('neu', 'Desligada')}</div>
                            <button type="button" class="rz-more" aria-label="Mais ações"><i data-lucide="ellipsis-vertical"></i></button>
                        </div>`).join('')}
                </div>
                <span class="rz-hint" style="display:block;margin-top:8px">Rotinas ligadas viram itens de controle da empresa e aparecem em Controles perto do prazo.</span>
            </div>`;
        if (typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();

        alvo.querySelectorAll('[data-rotina-codigo]').forEach(row => row.addEventListener('click', () => {
            const codigo = row.getAttribute('data-rotina-codigo');
            const itemId = row.getAttribute('data-rotina-item');
            const rt = rotinas.find(x => x.codigo === codigo);
            if (!rt) return;
            const abrirSheet = typeof window.abrirSheetAcoes === 'function' ? window.abrirSheetAcoes : null;
            if (!abrirSheet) { onToast?.('Ação só disponível dentro do app principal.', 'danger'); return; }

            if (rt.ligada) {
                abrirSheet({
                    titulo: rt.nome, sub: 'Rotina da empresa',
                    acoes: [{
                        titulo: 'Desligar rotina', sub: 'Para de gerar controle mensal', icone: 'power-off',
                        aoTocar: async () => {
                            try {
                                await desligarRotinaEmpresa(dbAuth, itemId, 'Desligada pelo usuário em Minha Empresa');
                                onToast?.('Rotina desligada.', 'success');
                                registrarLog?.('cofre.controles.desativar', { subtipo: codigo });
                                renderRotinasCard();
                            } catch (err) { onToast?.('Falha ao desligar: ' + err.message, 'danger'); }
                        }
                    }]
                });
            } else {
                abrirSheet({
                    titulo: rt.nome, sub: 'Rotina da empresa',
                    acoes: [{
                        titulo: 'Ligar rotina', sub: 'Cria um item de controle mensal', icone: 'power', codigo: 'cofre.controles.criar',
                        aoTocar: async () => {
                            try {
                                await ligarRotinaEmpresa(dbAuth, clienteId, codigo);
                                onToast?.('Rotina ligada.', 'success');
                                registrarLog?.('cofre.controles.criar', { subtipo: codigo, origem: 'rotina' });
                                renderRotinasCard();
                            } catch (err) { onToast?.('Falha ao ligar: ' + err.message, 'danger'); }
                        }
                    }]
                });
            }
        }));
    }
}

// ----------------------------------------------------------------------------
// CONTAS (v1.10.0, P4a) — cadastro de contas de controle. Exportado para a ficha
// da pessoa (comum-pessoas.js) reaproveitar a mesma ficha da conta.
// ----------------------------------------------------------------------------
const escC = (v) => (v == null ? '' : String(v)).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export async function buscarContas(dbAuth, clienteId, incluirEncerradas = false) {
    const { data, error } = await dbAuth.rpc('fn_contas_listar', { p_cliente_id: clienteId, p_incluir_encerradas: incluirEncerradas });
    if (error) throw error;
    return data || { ok: false, dados: [], liberado: false };
}

export function contaLinhaSub(c) {
    const partes = [c.titular_tipo === 'empresa' ? 'Empresa' : (c.titular_nome || 'Pessoa')];
    if (c.instituicao) partes.push(c.instituicao + (c.final_identificador ? ' ••' + c.final_identificador : ''));
    else if (c.final_identificador) partes.push('••' + c.final_identificador);
    if (c.titular_tipo === 'pessoa' && !c.incorpora_contabil) partes.push('fora da contabilidade');
    return partes.join(' · ');
}

export function contasListaHtml(contas, { linhaBloqueio = false } = {}) {
    const st = typeof window.renderStatus === 'function' ? window.renderStatus : (c, t) => `<span class="rz-st rz-${escC(c)}">${escC(t || c)}</span>`;
    const linhas = contas.map(c => `
        <div class="rz-row rz-link" role="button" tabindex="0" data-conta-id="${escC(c.id)}">
            <div class="rz-ic${c.situacao === 'ativa' ? '' : ' rz-neu'}"><svg data-lucide="${c.titular_tipo === 'empresa' ? 'building-2' : 'user'}"></svg></div>
            <div class="rz-tx"><b>${escC(c.nome)}</b><span>${escC(contaLinhaSub(c))}</span></div>
            <div class="rz-rt">${c.situacao !== 'ativa' ? st('neu', 'Encerrada') : (c.padrao ? st('ok', 'Padrão') : '')}</div>
            <svg data-lucide="chevron-right" class="rz-chev"></svg>
        </div>`).join('');
    const bloqueio = linhaBloqueio ? `
        <div class="rz-row rz-link rz-off" role="button" tabindex="0" data-conta-bloqueio="1">
            <div class="rz-ic rz-neu"><svg data-lucide="lock"></svg></div>
            <div class="rz-tx"><b>Contas dos sócios</b><span>${escC((podeUsarMod('financeiro.contas.ver').textoCurto) || 'Disponível no plano Premium')}</span></div>
        </div>` : '';
    return `<div class="rz-card rz-list">${linhas}${bloqueio}</div>`;
}

async function pessoasDaEmpresa(dbAuth, clienteId) {
    const { data } = await dbAuth.from('pessoas').select('id, nome').eq('cliente_id', clienteId).order('nome');
    return data || [];
}

/** Ficha da conta (criar ou editar) em Sheet. `fixarPessoaId` prende o titular (ficha da pessoa). */
export async function abrirFichaConta({ dbAuth, clienteId, conta = null, fixarPessoaId = null, onToast, aoSalvar }) {
    if (typeof window.abrirSheetForm !== 'function') return;
    if (rzBloqueio('financeiro.contas.editar')) return;
    const pessoas = await pessoasDaEmpresa(dbAuth, clienteId);
    const titularAtual = conta ? (conta.titular_tipo === 'empresa' ? 'empresa' : conta.pessoa_id) : (fixarPessoaId || 'empresa');
    const travarTitular = !!conta || !!fixarPessoaId;
    const optsTit = [`<option value="empresa" ${titularAtual === 'empresa' ? 'selected' : ''}>Empresa</option>`]
        .concat(pessoas.map(p => `<option value="${escC(p.id)}" ${titularAtual === p.id ? 'selected' : ''}>${escC(p.nome)}</option>`)).join('');
    window.abrirSheetForm({
        titulo: conta ? 'Editar conta' : 'Nova conta',
        sub: conta ? conta.nome : 'Conta da empresa ou de uma pessoa',
        rotuloSalvar: conta ? 'Salvar' : 'Criar conta',
        corpo: `
            <div class="rz-f"><label>Nome da conta</label><input type="text" id="cc-nome" maxlength="60" placeholder="Ex.: Conta Itaú da empresa" value="${escC(conta?.nome)}"></div>
            <div class="rz-f"><label>Titular</label><select id="cc-titular" ${travarTitular ? 'disabled' : ''}>${optsTit}</select>
                ${conta ? '<span class="rz-hint">O titular não muda depois de criada.</span>' : ''}</div>
            <div class="rz-f2">
                <div class="rz-f"><label>Banco</label><input type="text" id="cc-inst" maxlength="40" placeholder="Opcional" value="${escC(conta?.instituicao)}"></div>
                <div class="rz-f"><label>4 últimos números</label><input type="text" id="cc-final" inputmode="numeric" maxlength="4" placeholder="Opcional" value="${escC(conta?.final_identificador)}"></div>
            </div>
            <label class="text-sm" id="cc-contabil-wrap" style="display:flex;gap:10px;align-items:flex-start;margin-bottom:10px"><input type="checkbox" id="cc-contabil" ${conta ? (conta.incorpora_contabil ? 'checked' : '') : 'checked'} style="margin-top:3px"><span><b>Entra na contabilidade da empresa</b><br><span class="text-xs" style="color:var(--muted)">Desmarque para conta pessoal que não vai para o contador.</span></span></label>
            <label class="text-sm" style="display:flex;gap:10px;align-items:flex-start"><input type="checkbox" id="cc-conciliar" ${conta ? (conta.conciliar ? 'checked' : '') : 'checked'} style="margin-top:3px"><span><b>Conciliar extrato desta conta</b></span></label>
            <span class="rz-hint" style="display:block;margin-top:10px">Guardamos só os 4 últimos números, nunca a conta inteira.</span>`,
        aoSalvar: async (el) => {
            const tit = el.querySelector('#cc-titular').value;
            const { data, error } = await dbAuth.rpc('fn_conta_salvar', {
                p_cliente_id: clienteId, p_conta_id: conta?.id || null,
                p_nome: el.querySelector('#cc-nome').value,
                p_titular_tipo: tit === 'empresa' ? 'empresa' : 'pessoa',
                p_titular_pessoa_id: tit === 'empresa' ? null : tit,
                p_instituicao: el.querySelector('#cc-inst').value,
                p_final_identificador: el.querySelector('#cc-final').value,
                p_incorpora_contabil: tit === 'empresa' ? true : el.querySelector('#cc-contabil').checked,
                p_conciliar: el.querySelector('#cc-conciliar').checked,
            });
            if (error) { onToast?.(error.message, 'danger'); return false; }
            if (!data?.ok) { onToast?.(data?.mensagem || 'Não foi possível salvar.', 'danger'); return false; }
            onToast?.(data.mensagem, 'success');
            aoSalvar?.();
        },
    });
    const sel = document.getElementById('cc-titular');
    const wrap = document.getElementById('cc-contabil-wrap');
    const ajustar = () => { if (wrap) wrap.style.display = sel.value === 'empresa' ? 'none' : 'flex'; };
    sel?.addEventListener('change', ajustar); ajustar();
    const fin = document.getElementById('cc-final');
    fin?.addEventListener('input', () => { fin.value = fin.value.replace(/\D/g, '').slice(0, 4); });
}

/** Ações da conta (toque na linha): Editar · Definir como padrão · Encerrar. */
export function abrirAcoesConta({ dbAuth, clienteId, conta, onToast, aoMudar, fixarPessoaId = null }) {
    if (typeof window.abrirSheetAcoes !== 'function') return;
    const rpc = async (fn, args) => {
        const { data, error } = await dbAuth.rpc(fn, args);
        if (error) { onToast?.(error.message, 'danger'); return; }
        onToast?.(data?.mensagem || (data?.ok ? 'Feito.' : 'Não foi possível.'), data?.ok ? 'success' : 'danger');
        if (data?.ok) aoMudar?.();
    };
    const acoes = [];
    if (conta.situacao === 'ativa') {
        acoes.push({ titulo: 'Editar', sub: 'Nome, banco, 4 finais, contabilidade', icone: 'pencil', codigo: 'financeiro.contas.editar',
            aoTocar: () => abrirFichaConta({ dbAuth, clienteId, conta, fixarPessoaId, onToast, aoSalvar: aoMudar }) });
        if (!conta.padrao) acoes.push({ titulo: 'Definir como padrão', sub: 'Lançamentos sem conta escolhida vão para ela', icone: 'star', codigo: 'financeiro.contas.editar',
            aoTocar: () => rpc('fn_conta_definir_padrao', { p_conta_id: conta.id }) });
        if (!(conta.padrao && conta.titular_tipo === 'empresa')) acoes.push({ titulo: 'Encerrar conta', sub: 'O histórico continua no Financeiro', icone: 'archive', tipo: 'bad', codigo: 'financeiro.contas.editar',
            aoTocar: async () => {
                const ok = await perguntar({ titulo: 'Encerrar a conta?', impacto: `"${conta.nome}" deixa de aparecer para novos lançamentos. O que já foi lançado nela continua.`, destrutivo: true, rotuloConfirmar: 'Encerrar conta' });
                if (ok) rpc('fn_conta_encerrar', { p_conta_id: conta.id, p_motivo: null });
            } });
    }
    // v1.10.1 — sempre visível; o banco decide e explica (sem movimento apaga; com movimento sugere Encerrar).
    acoes.push({ titulo: 'Excluir conta', sub: 'Só conta sem nenhum movimento', icone: 'trash-2', tipo: 'bad', codigo: 'financeiro.contas.editar',
        aoTocar: async () => {
            const ok = await perguntar({ titulo: 'Excluir a conta?', impacto: `"${conta.nome}" será apagada. Se ela já tiver movimento, o sistema avisa e nada muda.`, destrutivo: true, rotuloConfirmar: 'Excluir conta' });
            if (!ok) return;
            const { data, error } = await dbAuth.rpc('fn_conta_excluir', { p_conta_id: conta.id });
            if (error) { onToast?.(error.message, 'danger'); return; }
            if (data?.ok) { onToast?.(data.mensagem, 'success'); aoMudar?.(); return; }
            if (data?.acao === 'tem_movimento' && typeof window.rzAviso === 'function') { window.rzAviso({ titulo: 'Esta conta não pode ser apagada', linhas: [data.mensagem] }); return; }
            onToast?.(data?.mensagem || 'Não foi possível excluir.', 'danger');
        } });
    window.abrirSheetAcoes({ titulo: conta.nome, sub: contaLinhaSub(conta), acoes });
}

async function renderContasCard(alvo, { dbAuth, clienteId, onToast }) {
    if (!alvo) return;
    let res;
    try { res = await buscarContas(dbAuth, clienteId, true); }
    catch (err) { console.warn('[comum-minha-empresa] contas:', err.message); alvo.innerHTML = ''; return; }
    const contas = (res.dados || []);
    const liberado = !!res.liberado;
    alvo.innerHTML = `
        <div class="rz-card" style="padding-bottom:6px"><div class="rz-card-h"><h3>Contas</h3>
            <button type="button" class="rz-more" id="cme-conta-nova" aria-label="Nova conta"><svg data-lucide="${liberado ? 'plus' : 'lock'}"></svg></button></div>
            <span class="rz-hint" style="display:block;margin-bottom:8px">De onde sai e para onde entra cada valor. Sem escolher, tudo vai para a conta padrão.</span>
        </div>
        ${contasListaHtml(contas, { linhaBloqueio: !liberado })}`;
    if (window.lucide) window.lucide.createIcons();
    const recarregar = () => renderContasCard(alvo, { dbAuth, clienteId, onToast });
    alvo.querySelector('#cme-conta-nova')?.addEventListener('click', () => {
        if (!liberado) { rzBloqueio('financeiro.contas.ver'); return; }
        abrirFichaConta({ dbAuth, clienteId, onToast, aoSalvar: recarregar });
    });
    alvo.querySelector('[data-conta-bloqueio]')?.addEventListener('click', () => rzBloqueio('financeiro.contas.ver'));
    alvo.querySelectorAll('[data-conta-id]').forEach(row => row.addEventListener('click', () => {
        const c = contas.find(x => x.id === row.dataset.contaId);
        if (!c) return;
        if (!liberado) { rzBloqueio('financeiro.contas.ver'); return; }
        abrirAcoesConta({ dbAuth, clienteId, conta: c, onToast, aoMudar: recarregar });
    }));
}

// Ícone lucide por subtipo de rotina de empresa (catálogo cofre_controle_subtipos, tipo='rotina').
const ICONES_ROTINA_EMPRESA = {
    fechamento_mensal: 'calendar-check',
    envio_contador: 'send',
    nfse_competencia: 'file-text',
    relatorio_carteira: 'clipboard-list',
    indicadores_mercado: 'trending-up',
};

// ----------------------------------------------------------------------------
// ROTINAS DA EMPRESA (R.2, Fase R) — camada de dados. RPCs SECURITY DEFINER
// (migration rotinas_funcoes_ligar_desligar_listar_v1): fn_rotina_empresa_ligar
// checa fn_checar_funcionalidade('cofre.controles.criar') antes de inserir
// (ACE-01 — declaração de uso sobre acesso que o plano já dá, nunca um gate novo).
// ----------------------------------------------------------------------------
async function buscarRotinasEmpresa(dbAuth, clienteId) {
    const { data, error } = await dbAuth.rpc('fn_rotinas_empresa_listar', { p_cliente_id: clienteId });
    if (error) throw error;
    return data || [];
}

async function ligarRotinaEmpresa(dbAuth, clienteId, subtipoCodigo) {
    const { error } = await dbAuth.rpc('fn_rotina_empresa_ligar', { p_cliente_id: clienteId, p_subtipo_codigo: subtipoCodigo });
    if (error) throw error;
}

async function desligarRotinaEmpresa(dbAuth, itemId, motivo) {
    const { error } = await dbAuth.rpc('fn_rotina_empresa_desligar', { p_item_id: itemId, p_motivo: motivo || null });
    if (error) throw error;
}

// Reduz uma imagem no navegador (canvas) pra caber em maxW×maxH, devolvendo
// PNG em data URL. Usado pelo logo — mesma filosofia da assinatura: o arquivo
// original nunca sai do aparelho; só o resultado pequeno vai pro banco.
function reduzirImagem(file, maxW, maxH) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
            const k = Math.min(1, maxW / img.width, maxH / img.height);
            const c = document.createElement('canvas');
            c.width = Math.max(1, Math.round(img.width * k)); c.height = Math.max(1, Math.round(img.height * k));
            c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
            URL.revokeObjectURL(url);
            resolve(c.toDataURL('image/png'));
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Imagem inválida')); };
        img.src = url;
    });
}
