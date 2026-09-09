// ============================================================================
// comum-minha-empresa.js — Raiz Patrimônio · Administração compartilhada
// Versão: 1.5.0 · 09/09/2026
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

export const VERSAO = '1.5.0'; // v-check (06/09/2026): lido por Dev › Versões — manter igual ao header
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
        if (!confirm('Remover o logo? O nome da empresa volta a aparecer no lugar.')) return;
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
        if (!confirm('Remover a assinatura atual? O recibo passará a sair com o espaço em branco até uma nova ser enviada.')) return;
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
