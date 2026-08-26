// ============================================================================
// comum-minha-empresa.js — Raiz Patrimônio · Administração compartilhada
// Versão: 1.0.0 · 26/08/2026
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

    const val = (v) => v == null ? '' : v;

    mountEl.innerHTML = `
        <p class="text-[11px] text-gray-500 mb-4">Dados da sua empresa, usados para preencher recibos e documentos gerados pelo sistema.</p>

        <div class="bg-white p-4 rounded-xl shadow-sm mb-6 space-y-3 border border-gray-200">
            <div>
                <label class="block text-xs font-bold text-gray-600">Nome da Empresa</label>
                <input type="text" id="cme-nome" disabled class="w-full p-2 border rounded mt-1 text-sm bg-gray-100 text-gray-500" value="${val(dados.nome_empresa)}">
                <p class="text-[11px] text-gray-400 mt-0.5">Não pode ser alterado nem excluído por aqui.</p>
            </div>

            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label class="block text-xs font-bold text-gray-600">CPF/CNPJ</label>
                    <input type="text" id="cme-cnpj" placeholder="Só digitar os números" class="w-full p-2 border rounded mt-1 text-sm" value="${val(dados.cnpj)}">
                </div>
                <div>
                    <label class="block text-xs font-bold text-gray-600">Responsável (assina o recibo)</label>
                    <input type="text" id="cme-responsavel" class="w-full p-2 border rounded mt-1 text-sm" value="${val(dados.nome_responsavel)}">
                </div>
            </div>

            <div class="grid grid-cols-3 gap-2">
                <div class="col-span-2">
                    <label class="block text-xs font-bold text-gray-600">Endereço / Logradouro</label>
                    <input type="text" id="cme-endereco" class="w-full p-2 border rounded mt-1 text-sm" value="${val(dados.endereco)}">
                </div>
                <div>
                    <label class="block text-xs font-bold text-gray-600">Complemento</label>
                    <input type="text" id="cme-complemento" class="w-full p-2 border rounded mt-1 text-sm" value="${val(dados.complemento)}">
                </div>
            </div>

            <div class="grid grid-cols-2 gap-2">
                <div>
                    <label class="block text-xs font-bold text-gray-600">Bairro</label>
                    <input type="text" id="cme-bairro" class="w-full p-2 border rounded mt-1 text-sm" value="${val(dados.bairro)}">
                </div>
                <div>
                    <label class="block text-xs font-bold text-gray-600">Cidade</label>
                    <input type="text" id="cme-cidade" class="w-full p-2 border rounded mt-1 text-sm" value="${val(dados.cidade)}">
                </div>
            </div>

            <div class="grid grid-cols-3 gap-2">
                <div>
                    <label class="block text-xs font-bold text-gray-600">UF</label>
                    <input type="text" id="cme-uf" maxlength="2" class="w-full p-2 border rounded mt-1 text-sm uppercase" value="${val(dados.uf)}">
                </div>
                <div class="col-span-2">
                    <label class="block text-xs font-bold text-gray-600">Cidade impressa no recibo</label>
                    <select id="cme-cidade-recibo-fonte" class="w-full p-2 border rounded mt-1 text-sm bg-gray-50">
                        <option value="empresa" ${dados.cidade_recibo_fonte !== 'imovel' ? 'selected' : ''}>Cidade da empresa (a de cima)</option>
                        <option value="imovel" ${dados.cidade_recibo_fonte === 'imovel' ? 'selected' : ''}>Cidade do imóvel alugado</option>
                    </select>
                </div>
            </div>

            <button id="cme-btn-salvar" class="w-full bg-emerald-600 text-white p-2.5 rounded-lg font-bold text-sm shadow">Salvar Dados da Empresa</button>

            <div class="pt-3 border-t border-gray-200">
                <label class="block text-xs font-bold text-gray-600 mb-1">Assinatura para o Recibo</label>
                <p class="text-[11px] text-gray-400 mb-2">Tire uma foto da assinatura numa folha em branco — o sistema trata a imagem automaticamente (fundo transparente, traço em preto) para caber no recibo.</p>

                <div id="cme-assinatura-preview-container" class="${dados.assinatura_url ? '' : 'hidden'} mb-2 p-3 bg-[repeating-conic-gradient(#e5e7eb_0%_25%,white_0%_50%)] bg-[length:16px_16px] rounded-lg border border-gray-200 flex items-center justify-center">
                    <img id="cme-assinatura-preview" class="max-h-20" alt="Assinatura" src="${val(dados.assinatura_url)}">
                </div>

                <div class="flex gap-1.5">
                    <input type="file" id="cme-assinatura-input" accept="image/*" capture="environment" class="hidden">
                    <button id="cme-btn-assinatura" type="button" class="flex-1 flex items-center justify-center gap-1.5 bg-white border border-slate-300 text-slate-700 font-bold text-xs py-2.5 rounded-lg shadow-sm active:scale-95 transition"><svg data-lucide="camera" style="width:14px;height:14px"></svg> <span id="cme-assinatura-btn-texto">${dados.assinatura_url ? 'Trocar Assinatura' : 'Enviar Assinatura'}</span></button>
                    <button id="cme-btn-apagar-assinatura" type="button" title="Apagar assinatura" class="${dados.assinatura_url ? '' : 'hidden'} w-10 h-10 flex-none flex items-center justify-center bg-red-50 border border-red-200 text-red-600 rounded-full active:scale-90 transition"><svg data-lucide="trash-2" style="width:15px;height:15px"></svg></button>
                </div>
            </div>
        </div>
    `;
    if (typeof window !== 'undefined' && window.lucide) window.lucide.createIcons();

    // -------- salvar dados --------
    document.getElementById('cme-btn-salvar').addEventListener('click', async () => {
        // Mesma observação da versão original: se a coluna ainda não
        // existir em `clientes` no Supabase, o update abaixo falha com
        // "column does not exist" — nesse caso é preciso rodar
        // `ALTER TABLE public.clientes ADD COLUMN IF NOT EXISTS <col> text;`
        const payload = {
            nome_responsavel: document.getElementById('cme-responsavel').value.trim() || null,
            cnpj: document.getElementById('cme-cnpj').value.trim() || null,
            endereco: document.getElementById('cme-endereco').value.trim() || null,
            complemento: document.getElementById('cme-complemento').value.trim() || null,
            bairro: document.getElementById('cme-bairro').value.trim() || null,
            cidade: document.getElementById('cme-cidade').value.trim() || null,
            uf: document.getElementById('cme-uf').value.trim().toUpperCase() || null,
            cidade_recibo_fonte: document.getElementById('cme-cidade-recibo-fonte').value,
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
            document.getElementById('cme-assinatura-btn-texto').textContent = 'Trocar Assinatura';
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
            document.getElementById('cme-assinatura-btn-texto').textContent = 'Enviar Assinatura';
            onBrandingAtualizado?.();
        } catch (err) {
            onToast?.('Falha ao remover: ' + err.message, 'danger');
        }
    });
}
