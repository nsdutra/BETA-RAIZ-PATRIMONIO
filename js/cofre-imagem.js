// ============================================================================
// js/cofre-imagem.js — Qualidade e pré-tratamento da foto (antes da IA)
// Raiz Patrimônio · Versão: 1.1.0 · 10/09/2026
//
// v1.1.0 (A.24) — PDF PROTEGIDO POR SENHA. Tudo no celular, com o pdf.js e o
// jsPDF que o app já carrega — a senha NUNCA sai do aparelho:
//   detectarPdfProtegido(file) → true quando o pdf.js pede senha;
//   destravarPdf(file, senha)  → abre com a senha, renderiza cada página em
//                                JPEG e monta um PDF novo (jsPDF), sem senha,
//                                pra IA ler. O ORIGINAL protegido é o que fica
//                                no Cofre; o destravado sobe em tmp-ia/ e é
//                                apagado depois (mesmo caminho da foto tratada).
//   Senha errada → erro 'senha_incorreta' (a tela pede de novo).
//
// v1.0.0 — itens 2 e 3 do ajuste de arquitetura de 09/09 (quality gate +
// pré-processamento leve), implementados NO CLIENTE: custo zero, latência
// zero, nenhuma chamada de IA gasta com foto ruim. Não depende de OCR
// externo — a decisão sobre Document AI segue em aberto (A.23).
//
// O que faz, nesta ordem:
//   1. medirQualidade()  — resolução, nitidez (variância do laplaciano),
//      iluminação (média/percentis), glare (área saturada), enquadramento
//      (borda clara do documento tocando a margem = cortado) e orientação
//      (retrato/paisagem contra o esperado do tipo de documento).
//   2. avaliarFoto()     — devolve {ok, bloqueios[], avisos[], medidas} com
//      MENSAGEM PRONTA em português, no tom do produto ("Enquadre os quatro
//      cantos", "Há reflexo sobre o documento").
//   3. tratarImagem()    — recorte da área do documento (quando detectada com
//      folga), correção de orientação e ajuste LEVE de contraste. Nunca
//      binariza, nunca satura: elementos visuais (selo, foto, QR) precisam
//      sobreviver. Devolve um Blob NOVO; o ORIGINAL nunca é alterado nem
//      substituído (o original é o que vai pro Cofre).
//
// Limiares ficam em LIMIARES, num só lugar, pra calibrar com uso real.
// Só roda em image/*; PDF passa direto (texto nativo não precisa disso).
// ============================================================================

export const VERSAO = '1.1.0'; // v-check: lido por Dev › Versões — manter igual ao header

const LIMIARES = {
    larguraMinima: 900,           // abaixo disso, texto de documento não sobrevive
    larguraMinimaAviso: 1400,
    nitidezBloqueio: 45,          // variância do laplaciano (escala 0-255)
    nitidezAviso: 110,
    brilhoMinimo: 55,             // média 0-255
    brilhoMaximo: 215,
    glareBloqueio: 0.045,         // fração de pixels estourados (>250) em mancha
    glareAviso: 0.02,
    margemCortada: 0.012,         // massa de tinta encostando na borda
    ladoMaximoTratado: 2200,      // reduz antes de mandar (economiza token/tempo)
};

// ---------------------------------------------------------------- utilidades
function carregarImagem(blobOuFile) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(blobOuFile);
        const img = new Image();
        img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('não foi possível abrir a imagem')); };
        img.src = url;
    });
}

function paraCanvas(img, ladoMaximo) {
    const escala = Math.min(1, ladoMaximo / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas');
    c.width = Math.round(img.naturalWidth * escala);
    c.height = Math.round(img.naturalHeight * escala);
    c.getContext('2d', { willReadFrequently: true }).drawImage(img, 0, 0, c.width, c.height);
    return c;
}

function cinza(ctx, w, h) {
    const d = ctx.getImageData(0, 0, w, h).data;
    const g = new Float32Array(w * h);
    for (let i = 0, p = 0; i < d.length; i += 4, p++) g[p] = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    return g;
}

// Variância do laplaciano: o indicador clássico de foco. Alto = nítido.
function nitidez(g, w, h) {
    let soma = 0, soma2 = 0, n = 0;
    for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
            const i = y * w + x;
            const l = 4 * g[i] - g[i - 1] - g[i + 1] - g[i - w] - g[i + w];
            soma += l; soma2 += l * l; n++;
        }
    }
    if (!n) return 0;
    const m = soma / n;
    return soma2 / n - m * m;
}

// Glare = pixels quase brancos AGRUPADOS (fundo branco de papel não conta:
// olhamos só o que está estourado, >250, e exigimos vizinhança igual).
function glare(g, w, h) {
    let estourados = 0;
    for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
            const i = y * w + x;
            if (g[i] > 250 && g[i - 1] > 248 && g[i + 1] > 248 && g[i - w] > 248 && g[i + w] > 248) estourados++;
        }
    }
    return estourados / (w * h);
}

// Tinta encostando na borda = documento/texto cortado.
function bordasComTinta(g, w, h) {
    const media = g.reduce((a, b) => a + b, 0) / g.length;
    const limite = media * 0.62; // "escuro" relativo à foto, não absoluto
    const faixa = Math.max(2, Math.round(Math.min(w, h) * 0.012));
    const conta = (px) => px < limite ? 1 : 0;
    let topo = 0, base = 0, esq = 0, dir = 0;
    for (let x = 0; x < w; x++) for (let k = 0; k < faixa; k++) { topo += conta(g[k * w + x]); base += conta(g[(h - 1 - k) * w + x]); }
    for (let y = 0; y < h; y++) for (let k = 0; k < faixa; k++) { esq += conta(g[y * w + k]); dir += conta(g[y * w + (w - 1 - k)]); }
    return {
        topo: topo / (w * faixa), base: base / (w * faixa),
        esquerda: esq / (h * faixa), direita: dir / (h * faixa),
    };
}

// Caixa do documento: linhas/colunas que têm conteúdo diferente do fundo.
function caixaDoDocumento(g, w, h) {
    const media = g.reduce((a, b) => a + b, 0) / g.length;
    const limite = media * 0.78;
    const linhas = new Float32Array(h), colunas = new Float32Array(w);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (g[y * w + x] < limite) { linhas[y]++; colunas[x]++; }
    const primeiro = (arr, min) => { for (let i = 0; i < arr.length; i++) if (arr[i] > min) return i; return -1; };
    const ultimo = (arr, min) => { for (let i = arr.length - 1; i >= 0; i--) if (arr[i] > min) return i; return -1; };
    const y0 = primeiro(linhas, w * 0.02), y1 = ultimo(linhas, w * 0.02);
    const x0 = primeiro(colunas, h * 0.02), x1 = ultimo(colunas, h * 0.02);
    if (y0 < 0 || x0 < 0 || y1 <= y0 || x1 <= x0) return null;
    return { x0, y0, x1, y1, largura: x1 - x0, altura: y1 - y0 };
}

// ------------------------------------------------------------------ medições
export async function medirQualidade(file) {
    const img = await carregarImagem(file);
    const larguraReal = img.naturalWidth, alturaReal = img.naturalHeight;
    const c = paraCanvas(img, 1000); // medir em imagem pequena é rápido e suficiente
    const ctx = c.getContext('2d', { willReadFrequently: true });
    const g = cinza(ctx, c.width, c.height);
    const brilho = g.reduce((a, b) => a + b, 0) / g.length;
    const ordenado = Float32Array.from(g).sort();
    return {
        largura: larguraReal, altura: alturaReal, megapixels: +(larguraReal * alturaReal / 1e6).toFixed(1),
        nitidez: +nitidez(g, c.width, c.height).toFixed(1),
        brilho: +brilho.toFixed(1),
        p05: ordenado[Math.floor(ordenado.length * 0.05)], p95: ordenado[Math.floor(ordenado.length * 0.95)],
        glare: +glare(g, c.width, c.height).toFixed(4),
        bordas: bordasComTinta(g, c.width, c.height),
        caixa: caixaDoDocumento(g, c.width, c.height),
        proporcao: +(larguraReal / alturaReal).toFixed(2),
        canvasLargura: c.width, canvasAltura: c.height,
    };
}

// ---------------------------------------------------------------- quality gate
// Devolve { ok, bloqueios: [{codigo, mensagem}], avisos: [...], medidas }.
// `ok=false` significa: NÃO gastar IA — peça outra foto.
export async function avaliarFoto(file, opcoes = {}) {
    if (!file?.type?.startsWith('image/')) return { ok: true, bloqueios: [], avisos: [], medidas: null, aplicavel: false };
    let m;
    try { m = await medirQualidade(file); }
    catch { return { ok: true, bloqueios: [], avisos: [], medidas: null, aplicavel: false }; } // na dúvida, deixa passar
    const bloqueios = [], avisos = [];
    const b = m.bordas;

    if (m.largura < LIMIARES.larguraMinima)
        bloqueios.push({ codigo: 'resolucao', mensagem: 'A foto ficou pequena demais para ler o texto. Aproxime o celular e tire outra, preenchendo a tela com o documento.' });
    else if (m.largura < LIMIARES.larguraMinimaAviso)
        avisos.push({ codigo: 'resolucao_baixa', mensagem: 'A foto está no limite de resolução — se algum campo vier errado, tire outra mais perto.' });

    if (m.nitidez < LIMIARES.nitidezBloqueio)
        bloqueios.push({ codigo: 'desfoque', mensagem: 'A foto ficou desfocada. Apoie o celular, espere focar e tente de novo.' });
    else if (m.nitidez < LIMIARES.nitidezAviso)
        avisos.push({ codigo: 'nitidez_baixa', mensagem: 'A foto está um pouco tremida — confira os números depois da leitura.' });

    if (m.brilho < LIMIARES.brilhoMinimo)
        bloqueios.push({ codigo: 'escuro', mensagem: 'A foto ficou escura demais. Procure um lugar mais iluminado e tente de novo.' });
    else if (m.brilho > LIMIARES.brilhoMaximo)
        avisos.push({ codigo: 'claro', mensagem: 'A foto está bem clara — se o texto sumir em alguma parte, tire outra com menos luz direta.' });

    if (m.glare > LIMIARES.glareBloqueio)
        bloqueios.push({ codigo: 'glare', mensagem: 'Há reflexo sobre o documento. Incline um pouco o celular e tire outra foto.' });
    else if (m.glare > LIMIARES.glareAviso)
        avisos.push({ codigo: 'glare_leve', mensagem: 'Há um brilho sobre o documento — confira se nenhum campo ficou apagado.' });

    const lados = [b.topo, b.base, b.esquerda, b.direita].filter(v => v > LIMIARES.margemCortada).length;
    if (lados >= 2)
        bloqueios.push({ codigo: 'cortado', mensagem: 'Parte do documento ficou fora da foto. Enquadre os quatro cantos e tente novamente.' });
    else if (lados === 1)
        avisos.push({ codigo: 'quase_cortado', mensagem: 'O documento está encostando na borda da foto — confira se não faltou nada.' });

    // Orientação: só avisa (o tratamento gira quando o tipo espera paisagem).
    const esperado = opcoes.orientacaoEsperada || null; // 'paisagem' | 'retrato' | null
    if (esperado === 'paisagem' && m.proporcao < 0.85) avisos.push({ codigo: 'orientacao', mensagem: 'Este documento costuma ser mais largo que alto — vamos girar para leitura.' });
    if (esperado === 'retrato' && m.proporcao > 1.2) avisos.push({ codigo: 'orientacao', mensagem: 'Este documento costuma ser mais alto que largo — vamos girar para leitura.' });

    return { ok: bloqueios.length === 0, bloqueios, avisos, medidas: m, aplicavel: true };
}

// ---------------------------------------------------------- pré-processamento
// Recorte com folga + orientação + contraste LEVE. Devolve { blob, aplicado[],
// largura, altura } ou null quando não vale a pena mexer.
export async function tratarImagem(file, opcoes = {}) {
    if (!file?.type?.startsWith('image/')) return null;
    let m;
    try { m = await medirQualidade(file); } catch { return null; }
    const aplicado = [];
    const img = await carregarImagem(file);

    // 1) recorte: só quando a caixa é claramente menor que a foto (documento
    // no meio da mesa). Folga de 3% pra não comer borda de selo/moldura.
    let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
    if (m.caixa) {
        const fx = img.naturalWidth / m.canvasLargura, fy = img.naturalHeight / m.canvasAltura;
        const folgaX = m.caixa.largura * fx * 0.03, folgaY = m.caixa.altura * fy * 0.03;
        const cx0 = Math.max(0, m.caixa.x0 * fx - folgaX), cy0 = Math.max(0, m.caixa.y0 * fy - folgaY);
        const cx1 = Math.min(img.naturalWidth, m.caixa.x1 * fx + folgaX), cy1 = Math.min(img.naturalHeight, m.caixa.y1 * fy + folgaY);
        const areaCaixa = (cx1 - cx0) * (cy1 - cy0), areaFoto = img.naturalWidth * img.naturalHeight;
        if (areaCaixa / areaFoto < 0.82 && areaCaixa / areaFoto > 0.12) {
            sx = cx0; sy = cy0; sw = cx1 - cx0; sh = cy1 - cy0; aplicado.push('recorte');
        }
    }

    // 2) orientação
    const esperado = opcoes.orientacaoEsperada || null;
    const proporcaoRecorte = sw / sh;
    let girar = 0;
    if (esperado === 'paisagem' && proporcaoRecorte < 0.85) girar = 90;
    if (esperado === 'retrato' && proporcaoRecorte > 1.2) girar = 90;
    if (girar) aplicado.push('orientacao');

    // 3) desenha (reduzindo se for gigante) e ajusta contraste de leve
    const escala = Math.min(1, LIMIARES.ladoMaximoTratado / Math.max(sw, sh));
    const larguraFinal = Math.round((girar ? sh : sw) * escala);
    const alturaFinal = Math.round((girar ? sw : sh) * escala);
    if (escala < 1) aplicado.push('reducao');
    const out = document.createElement('canvas');
    out.width = larguraFinal; out.height = alturaFinal;
    const octx = out.getContext('2d', { willReadFrequently: true });
    octx.imageSmoothingQuality = 'high';
    if (girar) { octx.translate(larguraFinal / 2, alturaFinal / 2); octx.rotate(Math.PI / 2); octx.translate(-alturaFinal / 2, -larguraFinal / 2); octx.drawImage(img, sx, sy, sw, sh, 0, 0, alturaFinal, larguraFinal); octx.setTransform(1, 0, 0, 1, 0, 0); }
    else octx.drawImage(img, sx, sy, sw, sh, 0, 0, larguraFinal, alturaFinal);

    // contraste leve só quando a foto está "lavada" (faixa dinâmica curta).
    if (m.p95 - m.p05 < 120) {
        const dados = octx.getImageData(0, 0, out.width, out.height);
        const d = dados.data;
        const min = Math.max(0, m.p05 - 8), max = Math.min(255, m.p95 + 8);
        const ganho = 255 / Math.max(1, max - min);
        for (let i = 0; i < d.length; i += 4) {
            d[i] = Math.min(255, Math.max(0, (d[i] - min) * ganho));
            d[i + 1] = Math.min(255, Math.max(0, (d[i + 1] - min) * ganho));
            d[i + 2] = Math.min(255, Math.max(0, (d[i + 2] - min) * ganho));
        }
        octx.putImageData(dados, 0, 0);
        aplicado.push('contraste');
    }

    if (!aplicado.length) return null; // nada a ganhar: manda o original mesmo
    const blob = await new Promise(res => out.toBlob(res, 'image/jpeg', 0.92));
    if (!blob || blob.size > file.size * 1.6) return null; // não piora o upload
    return { blob, aplicado, largura: out.width, altura: out.height, medidas: m };
}

// Resumo curto pra gravar em log/auditoria (item 12 — métricas).
export function resumoQualidade(avaliacao, tratamento) {
    if (!avaliacao?.medidas) return null;
    const m = avaliacao.medidas;
    return {
        largura: m.largura, altura: m.altura, megapixels: m.megapixels,
        nitidez: m.nitidez, brilho: m.brilho, glare: m.glare,
        bloqueios: avaliacao.bloqueios.map(b => b.codigo),
        avisos: avaliacao.avisos.map(a => a.codigo),
        tratamento: tratamento?.aplicado ?? [],
        versao_qualidade: VERSAO,
    };
}


// ============================================================================
// v1.1.0 — PDF protegido por senha (A.24)
// ============================================================================
function pdfjs() {
    if (typeof pdfjsLib === 'undefined') throw new Error('Biblioteca de PDF não carregou — recarregue a página.');
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    return pdfjsLib;
}

// Devolve true quando o PDF exige senha pra abrir. PDF normal → false.
export async function detectarPdfProtegido(file) {
    if (!file || !/pdf/i.test(file.type || file.name || '')) return false;
    try {
        const data = await file.arrayBuffer();
        const tarefa = pdfjs().getDocument({ data, password: '' });
        // pdf.js chama onPassword quando precisa de senha — é o nosso sinal.
        let precisa = false;
        tarefa.onPassword = (_cb, motivo) => { precisa = true; tarefa.destroy(); };
        try { const doc = await tarefa.promise; await doc.destroy(); } catch (e) { if (precisa) return true; if (/password/i.test(String(e?.name || e?.message))) return true; }
        return precisa;
    } catch { return false; }
}

// Abre com a senha e devolve { blob (PDF sem senha), paginas } — ou lança
// 'senha_incorreta'. Renderiza em ~150 dpi: bom pra leitura, leve pra subir.
export async function destravarPdf(file, senha) {
    const lib = pdfjs();
    const data = await file.arrayBuffer();
    let doc;
    try {
        doc = await lib.getDocument({ data, password: senha }).promise;
    } catch (e) {
        if (/password/i.test(String(e?.name || e?.message))) throw new Error('senha_incorreta');
        throw e;
    }
    const { jsPDF } = window.jspdf || {};
    if (!jsPDF) throw new Error('Biblioteca de PDF (jsPDF) não carregou — recarregue a página.');
    let out = null;
    const paginas = Math.min(doc.numPages, 20); // documentos pessoais têm 1–5 páginas; 20 é folga
    for (let i = 1; i <= paginas; i++) {
        const page = await doc.getPage(i);
        const vp1 = page.getViewport({ scale: 1 });
        const escala = Math.min(2, 1600 / Math.max(vp1.width, vp1.height)); // ~150 dpi em A4
        const vp = page.getViewport({ scale: escala });
        const c = document.createElement('canvas'); c.width = Math.round(vp.width); c.height = Math.round(vp.height);
        await page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
        const jpeg = c.toDataURL('image/jpeg', 0.85);
        const larguraMm = vp1.width * 0.3528, alturaMm = vp1.height * 0.3528; // pt → mm
        if (!out) out = new jsPDF({ unit: 'mm', format: [larguraMm, alturaMm], orientation: larguraMm > alturaMm ? 'landscape' : 'portrait' });
        else out.addPage([larguraMm, alturaMm], larguraMm > alturaMm ? 'landscape' : 'portrait');
        out.addImage(jpeg, 'JPEG', 0, 0, larguraMm, alturaMm);
    }
    await doc.destroy();
    return { blob: out.output('blob'), paginas };
}
