// ============================================================================
// nucleo/bibliotecas.js — Raiz Patrimônio · Núcleo de plataforma
//                         carregador único das bibliotecas pesadas (planilha,
//                         PDF, zip e captura de tela), sob demanda
// Versão: 1.0.0 · 21/10/2026
//
// v1.0.0 (21/10/2026, sessão 20261021-0857-libs-sob-demanda, demanda 6b11c602; de acordo do Nicola 21/10 08:57) — criação.
// xlsx, jsPDF, pdf.js, JSZip e html2canvas saem do <head> do index (1,9 MB de JavaScript processados em toda abertura)
// e passam a carregar na primeira vez que alguém exporta ou lê um arquivo.
//
// Uso num módulo:   const { jsPDF } = await carregarBiblioteca('jspdf');   — ou carregar e seguir usando XLSX.*
// Uso no index:     await (await import('./js/nucleo/bibliotecas.js')).carregarBibliotecas('jspdf', 'html2canvas');
//
// ARMADILHA: função SÍNCRONA que devolve algo feito com a biblioteca não pode chamar isto — o chamador assíncrono
// carrega antes e chama a síncrona depois (ex.: fechamento.js, antes de fechamentoMontarPdfPacote).
// As URLs com versão exata vivem só aqui.
// ============================================================================

export const VERSAO = '1.0.0'; // v-check: lido por ⚙️ › Conta › Versões — manter igual ao header

const PDF_WORKER = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// pronta(): devolve o objeto global quando a biblioteca já está carregada, senão null
const CATALOGO = {
    xlsx:        { url: 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js', pronta: () => window.XLSX || null },
    jspdf:       { url: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', pronta: () => (window.jspdf && window.jspdf.jsPDF ? window.jspdf : null) },
    pdfjs:       { url: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js', pronta: () => window.pdfjsLib || null },
    jszip:       { url: 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js', pronta: () => window.JSZip || null },
    html2canvas: { url: 'https://cdn.jsdelivr.net/npm/html2canvas-pro@2.2.4/dist/html2canvas-pro.min.js', pronta: () => window.html2canvas || null },
};

const emAndamento = {};

function preparar(nome, lib) {
    // o pdf.js lê o PDF num worker; sem o endereço dele, getDocument falha
    if (nome === 'pdfjs' && !lib.GlobalWorkerOptions.workerSrc) lib.GlobalWorkerOptions.workerSrc = PDF_WORKER;
    return lib;
}

// Devolve o objeto global da biblioteca. Carrega uma vez só; chamadas ao mesmo tempo esperam a mesma
// promessa. Se falhar (sem rede), a tag é retirada e a próxima chamada tenta de novo.
export function carregarBiblioteca(nome) {
    const item = CATALOGO[nome];
    if (!item) return Promise.reject(new Error('Biblioteca desconhecida: ' + nome));
    const ja = item.pronta();
    if (ja) return Promise.resolve(preparar(nome, ja));
    if (!emAndamento[nome]) {
        const tag = document.createElement('script');
        emAndamento[nome] = new Promise((ok, falha) => {
            tag.src = item.url;
            tag.async = true;
            tag.onload = () => { const lib = item.pronta(); lib ? ok(preparar(nome, lib)) : falha(new Error('Sem conexão. Tente de novo.')); };
            tag.onerror = () => falha(new Error('Sem conexão. Tente de novo.'));
            document.head.appendChild(tag);
        }).catch((e) => {
            delete emAndamento[nome];
            tag.remove();
            console.warn('[bibliotecas] falhou ao carregar', nome, item.url);
            throw e;
        });
    }
    return emAndamento[nome];
}

export function carregarBibliotecas(...nomes) {
    return Promise.all(nomes.map(carregarBiblioteca));
}
