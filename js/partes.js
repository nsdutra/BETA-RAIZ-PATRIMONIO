// ============================================================================
// partes.js — Raiz Patrimônio · Partes (pessoas do negócio): lista, busca,
//             ficha, papéis, vínculos, empreendimentos e acesso de sócio
// Versão: 1.0.0 · 10/10/2026
//
// v1.0.0 (10/10/2026, sessão 20261010-1425-onda2a-partes, demanda 6b11c602 — Onda 2a da
// fragmentação, plano aprovado pelo Nicola 09/10 21:15) — 30 telas de Partes saíram do
// index.html SEM UMA LINHA REESCRITA: cada função veio byte a byte e só ganhou "export".
//
// POR QUE AQUI NÃO HÁ INJEÇÃO, diferente do js/nucleo/porta.js: `let` no topo de um
// <script> clássico entra no escopo léxico global, que um módulo ES alcança como NOME
// LIVRE — e sempre no valor corrente, porque a resolução é no binding, não numa cópia.
// Isso não é teoria: o js/financeiro.js já lê `contratos` e chama `arquivoParaBase64()`
// assim hoje, sem import nenhum. Então dbAuth, CLIENTE_ID_SUPABASE, pessoas, imoveis e as
// funções do index que ficaram (renderPartes, pendenciasParte, logScreen, mostrarToast…)
// são usadas aqui como estavam. O porta.js injeta por ter nascido antes desta prova; não
// vou reescrevê-lo só por isso — está publicado e testado.
//
// O QUE FICOU NO INDEX de propósito:
//  · as 16 funções do domínio que DEVOLVEM VALOR e são síncronas (renderPartes,
//    pendenciasParte, parteEhPrestador, obterSociosConhecidos, calcularExtratoSocio…).
//    A ponte é assíncrona: quem faz `const x = pendenciasParte(p)` receberia uma Promise
//    e quebraria em silêncio. É o mesmo motivo pelo qual montarBoxDivisaoSocietaria não
//    se mudou — o js/imoveis.js a usa dentro de uma concatenação de innerHTML.
//  · carregarPartesParaSelectSupabase — tem cache com invalidação dentro do financeiro.js
//    (demanda 5e737cff, Onda 1b-2).
//  · obterPessoaIdPorNome — é injetada no js/nucleo/porta.js; tirá-la daqui quebraria
//    a instalação da porta.
//  · renderSociosDistribricao e abrirFichaParte — 377 bytes somados, chamadas por módulos;
//    mover ambas aumentaria a superfície por quase nada.
//
// Chamadas de fora chegam pela ponte window[nome] do index (bloco "PARTES"), que é o
// mesmo rzPonteModulo dos outros módulos R8.
// ============================================================================

export const VERSAO = '1.0.0';  // v-check: lido por ⚙️ › Conta › Versões — manter igual ao header

// FORMULÁRIO — abrirSheetForm; campos base sempre, campos de
// prestador aparecem quando o papel escolhido pede (pedido: "a
// depender do papel os campos são ajustados em tela").
// v1.240.0 (demanda be42b19f, item 5 — "formulário fora do padrão
// novo, endereço fora do padrão") — vira async pra poder importar
// comum-endereco.js (E6.2) antes de montar o corpo; o campo único
// "Endereço" (texto livre) sai, entra o bloco estruturado
// (renderizarBlocoEndereco — CEP com busca automática, rua/número/
// bairro/cidade/UF), o MESMO componente que a ficha do ativo já
// usa. Resto do formulário (nome, documento, prestador, profissão/
// estado civil) continua igual — já era o "padrão novo" que os
// outros pontos de entrada (Item de Controle, chip Partes do
// contrato) estavam atrás.
// v1.253.0 — 2º parâmetro opcional { tipoPrestador } pré-seleciona
// "Atua como prestador?" numa parte NOVA (usado por
// abrirCadastroContador, vindo do botão Contador do Financeiro e da
// tela Fiscal quando não há contador cadastrado).
export async function abrirFormParteSheet(parteId, opcoes = {}) {
    if (typeof abrirSheetForm !== 'function') return;
    let pt = parteId ? partesCliente.find(x => x.id === parteId) : null;
    // v1.244.0 (demanda 176b3145 — padronizar experiência de Parte
    // em todos os locais) — parteId pode chegar aqui vindo de uma
    // tela que NUNCA carregou `partesCliente` (esse array só é
    // buscado ao abrir a aba Configurações › Partes — lazy-load
    // v1.96.0), ex.: clicar direto no locatário/fiador de um
    // contrato, ou numa parte de item de controle, sem nunca ter
    // passado pela aba Partes na sessão. Sem este fallback, o form
    // abria em branco como "Nova parte" mesmo sendo uma edição — e
    // salvar SOBRESCREVERIA a parte existente com campos vazios
    // (risco real de perda de dado). Busca a parte direto no banco
    // se não achou no array local.
    if (parteId && !pt) {
        try {
            const { data } = await dbAuth.from('partes').select('*').eq('id', parteId).maybeSingle();
            pt = data || null;
        } catch (err) { console.warn('[partes] Falha ao buscar parte direto do banco:', err.message); }
    }
    const v = (campo) => rzEsc((pt && pt[campo]) || '');
    const tipoPrest = pt?.tipo_prestador || (!pt && opcoes?.tipoPrestador) || '';
    const campo = (rot, id, val, tipo = 'text', extra = '') =>
        `<div class="rz-f"><label for="${id}">${rot}</label><input type="${tipo}" id="${id}" value="${val}" ${extra}></div>`;
    let blocoEndereco = `${campo('Endereço', 'parte-endereco', v('endereco'))}`; // fallback se o import falhar
    try {
        const { renderizarBlocoEndereco } = await import('./js/comum-endereco.js');
        blocoEndereco = renderizarBlocoEndereco('parte', pt || {}, { mostrarBotaoCopiar: false });
    } catch (err) { console.warn('[partes] Falha ao carregar bloco de endereço, usando campo simples:', err.message); }
    // F2.5c — parte existente abre como FICHA com chips (Dados · Vínculos — F2.5c-2); o chip Dados
    // é o próprio formulário (o toque na parte continua indo direto para a edição — pedido de 22/09).
    const ficha = !!pt;
    const papeisPt = pt ? (papeisPorParte[pt.id] || []) : [];
    const faltaPt = ficha ? pendenciasParte(pt, papeisPt) : [];
    const paneInicial = ['dados', 'vinculos'].includes(opcoes?.pane) ? opcoes.pane : 'dados';
    const chipsFicha = ficha ? `
        <div class="rz-chips" data-pf-chips role="tablist" aria-label="Ficha da parte">${[['dados', 'Dados'], ['vinculos', 'Vínculos']].map(([k, r]) => {
            const n = k === 'dados' ? faltaPt.length : 0;
            return `<button type="button" role="tab" data-pf-chip="${k}" class="rz-chip${k === paneInicial ? ' rz-on' : ''}${k === 'dados' && n ? ' rz-warn' : ''}" aria-selected="${k === paneInicial}">${r} <span class="rz-n" data-pf-n="${k}"${k === 'dados' && n ? '' : ' hidden'}>${n}</span></button>`;
        }).join('')}</div>` : '';
    const blocoFalta = faltaPt.length ? `
        <div class="rz-card"><div class="rz-card-h"><h3>Falta para recibo, minuta e cobrança</h3></div>
            <div class="rz-list">${faltaPt.map(f => `
                <div class="rz-row rz-link" role="button" tabindex="0" data-pf-ir="${f.campo}"><div class="rz-tx"><b>${rzEsc(f.rotulo)}</b></div><div class="rz-rt">${renderStatus('warn', 'Falta')}</div></div>`).join('')}</div>
        </div>` : '';
    const sheetParte = abrirSheetForm({
        titulo: ficha ? pt.nome : (tipoPrest === 'contador' ? 'Cadastrar contador' : 'Nova parte'),
        sub: ficha ? ([pt.documento ? `${pt.doc_tipo || 'Doc'} ${pt.documento}` : '', [...new Set(papeisPt.map(pp => PARTES_ROTULO_PAPEL[pp] || pp))].join(' · ')].filter(Boolean).join(' · ') || 'Sem papel atribuído') : (tipoPrest === 'contador' ? 'WhatsApp e e-mail são o destino do pacote do contador' : 'Locatário, fiador, proprietário, prestador…'),
        rotuloSalvar: pt ? 'Salvar' : 'Cadastrar',
        corpo: `${chipsFicha}<div data-pf-pane="dados"${ficha && paneInicial !== 'dados' ? ' hidden' : ''}>${blocoFalta}
            ${campo('Nome <i>*</i>', 'parte-nome', v('nome'), 'text', 'required')}
            <div class="rz-f"><label for="parte-documento">Documento (CPF ou CNPJ)</label>
                <input type="text" id="parte-documento" value="${v('documento')}" oninput="formatarMascaraDocumentoGenerico(this, 'parte-doc-indicador')" placeholder="Só os números">
                <p id="parte-doc-indicador" class="rz-hint raiz-indicador-inline" style="margin:0"></p></div>
            <div class="rz-f2">
                ${campo('WhatsApp', 'parte-whatsapp', v('whatsapp'))}
                ${campo('E-mail', 'parte-email', v('email'), 'email')}
            </div>
            ${campo('Nome fantasia', 'parte-nome-fantasia', v('nome_fantasia'))}
            <div class="rz-f"><label for="parte-tipo-prestador">Atua como prestador?</label>
                <select id="parte-tipo-prestador" onchange="ajustarCamposPrestadorParte()">
                    <option value="">Não / não se aplica</option>
                    <option value="imobiliaria" ${tipoPrest === 'imobiliaria' ? 'selected' : ''}>Administradora / imobiliária</option>
                    <option value="sindico" ${tipoPrest === 'sindico' ? 'selected' : ''}>Síndico / gestora</option>
                    <option value="manutencista" ${tipoPrest === 'manutencista' ? 'selected' : ''}>Manutencista</option>
                    <!-- Entrega F.3 (21/09/2026, pedido explícito) — papel novo:
                         contador (WhatsApp/e-mail cadastrados aqui são o destino
                         de "Compartilhar com o contador" no Fechamento). -->
                    <option value="contador" ${tipoPrest === 'contador' ? 'selected' : ''}>Contador</option>
                </select></div>
            <div id="parte-campos-prestador" class="${tipoPrest ? '' : 'hidden'} space-y-3" style="${tipoPrest ? '' : 'display:none'}">
                ${campo('Nome do contato', 'parte-contato-nome', v('contato_nome'))}
                <div id="parte-wrap-taxa" class="${tipoPrest === 'imobiliaria' ? '' : 'hidden'}">${campo('Taxa de administração (%)', 'parte-taxa-adm', pt?.taxa_adm != null ? String(pt.taxa_adm) : '', 'number', 'step="0.01" min="0"')}</div>
            </div>
            <div class="rz-f2" id="parte-campos-pf">
                ${campo('Profissão', 'parte-profissao', v('profissao'))}
                <div class="rz-f"><label for="parte-estado-civil">Estado civil</label>
                    <select id="parte-estado-civil">
                        <option value="">—</option>
                        ${['Solteiro(a)','Casado(a)','Divorciado(a)','Viúvo(a)','União estável'].map(o => `<option ${pt?.estado_civil === o ? 'selected' : ''}>${o}</option>`).join('')}
                    </select></div>
            </div>
            ${blocoEndereco}</div>${ficha ? `
            <div data-pf-pane="vinculos"${paneInicial !== 'vinculos' ? ' hidden' : ''}>
                <div class="rz-card rz-list">
                    <div class="rz-card-h"><h3>Vínculos</h3><span class="rz-sub" id="pf-vinculos-sub"></span><button type="button" onclick="abrirAdicionarPapelParte('${pt.id}')" class="rz-more" aria-label="Adicionar papel"><svg data-lucide="plus"></svg></button></div>
                    <div id="pf-vinculos-lista">${rzSkeleton('linhas', 3)}</div>
                </div>
            </div>` : ''}`,
        aoSalvar: (el) => salvarParteSheet(el, parteId || null)
    });
    rzIcones();
    if (!ficha || !sheetParte) return;
    // F2.5c — chips da ficha: um assunto por chip; o rodapé Cancelar/Salvar só no chip Dados
    const rodape = sheetParte.querySelector('.rz-sh-f');
    const mostrarPaneParte = (k) => {
        sheetParte.querySelectorAll('[data-pf-pane]').forEach(p => { p.hidden = p.dataset.pfPane !== k; });
        sheetParte.querySelectorAll('[data-pf-chip]').forEach(c => { const on = c.dataset.pfChip === k; c.classList.toggle('rz-on', on); c.setAttribute('aria-selected', on ? 'true' : 'false'); });
        if (rodape) rodape.hidden = k !== 'dados';
    };
    mostrarPaneParte(paneInicial);
    if (paneInicial !== 'dados') setTimeout(() => { if (sheetParte.contains(document.activeElement)) document.activeElement.blur(); }, 80);
    sheetParte.querySelector('[data-pf-chips]')?.addEventListener('click', (ev) => { const c = ev.target.closest('[data-pf-chip]'); if (c) mostrarPaneParte(c.dataset.pfChip); });
    sheetParte.addEventListener('click', (ev) => {
        const ir = ev.target.closest('[data-pf-ir]');
        if (ir) { mostrarPaneParte('dados'); const alvo = sheetParte.querySelector('#' + ir.dataset.pfIr); if (alvo) { alvo.scrollIntoView({ block: 'center' }); setTimeout(() => alvo.focus(), 120); } }
    });
    carregarVinculosFichaParte(sheetParte, pt);
}

export async function salvarParteSheet(el, parteId) {
    const g = id => (el.querySelector('#' + id)?.value || '').trim();
    const nome = g('parte-nome');
    if (!nome) { mostrarToast('Informe o nome.', 'danger'); return false; }
    const documento = g('parte-documento');
    const digitos = documento.replace(/\D/g, '');
    if (digitos.length > 0) {
        const tipoDoc = digitos.length > 11 ? 'CNPJ' : 'CPF';
        if (tipoDoc === 'CPF' && !validarCPF(documento)) { mostrarToast('CPF inválido.', 'danger'); return false; }
        if (tipoDoc === 'CNPJ' && !validarCNPJ(documento)) { mostrarToast('CNPJ inválido.', 'danger'); return false; }
    }
    const tipoPrestador = g('parte-tipo-prestador') || null;
    // v1.240.0 (demanda be42b19f, item 5) — lê o bloco de endereço
    // estruturado (quando renderizado; o fallback do campo simples
    // "parte-endereco" continua funcionando se o import falhou) e
    // grava as 2 formas: colunas estruturadas (edição futura) +
    // `endereco` texto (compatibilidade — telas que ainda só leem
    // essa coluna continuam funcionando, partes_endereco_
    // estruturado_v1). O bloco estruturado nasce em branco pra
    // parte que nunca foi editada por ele (não dá pra reconstituir
    // rua/número a partir do texto livre antigo) — se a pessoa
    // salvar sem preencher, MANTÉM o endereço já cadastrado em vez
    // de apagar (bug real que eu mesmo quase reintroduzi: 1ª versão
    // desta função zerava `endereco` toda vez que o bloco ficava em
    // branco).
    // v1.244.0 (demanda 176b3145) — mesmo fallback de
    // abrirFormParteSheet acima: sem `partesCliente` carregado,
    // ptAtual ficaria null e o endereço já cadastrado seria
    // apagado por engano (ver comentário logo abaixo).
    let ptAtual = parteId ? partesCliente.find(x => x.id === parteId) : null;
    if (parteId && !ptAtual) {
        try {
            const { data } = await dbAuth.from('partes').select('*').eq('id', parteId).maybeSingle();
            ptAtual = data || null;
        } catch (err) { console.warn('[partes] Falha ao buscar parte direto do banco:', err.message); }
    }
    let enderecoEstruturado = {};
    let enderecoTexto = g('parte-endereco'); // fallback
    if (el.querySelector('#parte-rua') || el.querySelector('#parte-cep')) {
        try {
            const { lerBlocoEndereco } = await import('./js/comum-endereco.js');
            const { formatarEnderecoParte } = await import('./js/comum-partes.js');
            enderecoEstruturado = lerBlocoEndereco('parte');
            const formatado = formatarEnderecoParte(enderecoEstruturado);
            if (formatado) {
                enderecoTexto = formatado;
            } else {
                // bloco em branco — não sobrescreve o que já existia
                enderecoEstruturado = {};
                enderecoTexto = ptAtual?.endereco || '';
            }
        } catch (err) { console.warn('[partes] Falha ao ler bloco de endereço estruturado:', err.message); }
    } else if (!enderecoTexto && ptAtual?.endereco) {
        enderecoTexto = ptAtual.endereco; // fallback simples também deixado em branco preserva o valor antigo
    }
    const linha = {
        cliente_id: CLIENTE_ID_SUPABASE,
        nome,
        doc_tipo: digitos.length > 11 ? 'CNPJ' : (digitos.length > 0 ? 'CPF' : null),
        documento: documento || null,
        nome_fantasia: g('parte-nome-fantasia') || null,
        whatsapp: g('parte-whatsapp') || null,
        email: g('parte-email') || null,
        ...enderecoEstruturado,
        endereco: enderecoTexto || null,
        profissao: g('parte-profissao') || null,
        estado_civil: g('parte-estado-civil') || null,
        contato_nome: g('parte-contato-nome') || null,
        tipo_prestador: tipoPrestador,
        taxa_adm: tipoPrestador === 'imobiliaria' && g('parte-taxa-adm') !== '' ? Number(g('parte-taxa-adm')) : null,
    };
    try {
        let idFinal = parteId;
        if (parteId) {
            const { error } = await dbAuth.from('partes').update(linha).eq('id', parteId);
            if (error) throw error;
        } else {
            const { data, error } = await dbAuth.from('partes').insert(linha).select('id').single();
            if (error) throw error;
            idFinal = data.id;
        }
        // Papel de prestador: mantém a tabela OPERACIONAL
        // (prestadores) e o papel em dia — contratos.administradora_id
        // e prestador_vinculo apontam pra ela, não pra partes.
        if (tipoPrestador) await sincronizarPrestadorDaParte(idFinal, linha, tipoPrestador);
        // v1.258.0 (demanda e19d6739) — contratos.locatario é cópia em texto (fonte da
        // lista e da ficha de Contratos); o banco só sincroniza contrato→parte.
        // Propaga a edição da parte para os contratos em que ela é locatária
        // (o trigger do contrato re-sincroniza a parte com o MESMO valor — sem laço).
        let contratoIdsLocatario = [];
        if (parteId) {
            const { data: vincsLoc, error: errVinc } = await dbAuth.from('partes_papeis').select('entidade_id')
                .eq('parte_id', parteId).eq('papel', 'locatario').eq('entidade_tipo', 'contrato').eq('ativo', true);
            if (errVinc) throw errVinc;
            contratoIdsLocatario = (vincsLoc || []).map(v => v.entidade_id);
            if (contratoIdsLocatario.length) {
                const patchCon = { locatario: nome };
                if (documento) { patchCon.cpf = documento; patchCon.doc_tipo = linha.doc_tipo; }
                const { error: errCon } = await dbAuth.from('contratos').update(patchCon).in('id', contratoIdsLocatario);
                if (errCon) throw errCon;
                contratos.forEach(c => { if (contratoIdsLocatario.includes(c.id)) { c.locatario = nome; if (documento) { c.cpf = documento; c.docTipo = linha.doc_tipo; } } });
            }
        }
        mostrarToast(parteId ? 'Parte atualizada.' : 'Parte cadastrada.', 'success');
        emitirEscritaGlobal('parte', { id: idFinal, acao: parteId ? 'editar' : 'criar', contratoIds: contratoIdsLocatario });
        await carregarPartes();
    } catch (err) {
        mostrarToast('Não consegui salvar: ' + (err.message || String(err)), 'danger');
        return false;
    }
}

export async function carregarVinculosFichaParte(sheet, pt) {
    const listaEl = sheet.querySelector('#pf-vinculos-lista');
    const subEl = sheet.querySelector('#pf-vinculos-sub');
    if (!listaEl) return;
    try {
        const { data, error } = await dbAuth.rpc('fn_vinculos_da_parte', { p_parte_id: pt.id });
        if (error) throw error;
        const vincs = data || [];
        vinculosFichaParte = vincs;
        const ativos = vincs.filter(v => v.ativo !== false);
        const encerrados = vincs.filter(v => v.ativo === false);
        const nChip = sheet.querySelector('[data-pf-n="vinculos"]'); // F2.5c
        if (nChip) { nChip.textContent = String(ativos.length); nChip.hidden = false; }
        if (subEl) subEl.textContent = [
            ativos.length ? `${ativos.length} ativo${ativos.length === 1 ? '' : 's'}` : '',
            encerrados.length ? `${encerrados.length} encerrado${encerrados.length === 1 ? '' : 's'}` : ''
        ].filter(Boolean).join(' · ');
        if (!vincs.length) {
            listaEl.innerHTML = '<div class="rz-empty"><p>Nenhum vínculo. "Adicionar papel" liga esta parte a um contrato, ativo ou empreendimento.</p></div>';
            return;
        }
        const linha = (v) => {
            const navegavel = vinculoParteNavegavel(v);
            const papel = PARTES_ROTULO_PAPEL[v.papel] || v.papel;
            const tipo = PARTES_VINCULO_TIPO[v.entidade_tipo] || '';
            const detalhe = String(v.detalhe || '').replace(/^[\s,·]+|[\s,·]+$/g, '');
            // v1.316.0 — a data do encerramento vai para a linha de baixo; o chip fica curto
            // (o "Encerrado em dd/mm/aaaa" espremia o nome — print do Nicola 07/10 01:41)
            const quando = v.ativo === false && v.encerrado_em ? 'encerrado em ' + new Date(v.encerrado_em).toLocaleDateString('pt-BR') : '';
            const sub = [papel + (tipo ? ' · ' + tipo : ''), quando, detalhe].filter(Boolean).join(' · ');
            const st = v.ativo === false ? '<span class="rz-st rz-neu">Encerrado</span>' : '<span class="rz-st rz-ok">Ativo</span>';
            return `
            <div class="rz-row ${navegavel ? 'rz-link' : ''}" ${navegavel ? `onclick="abrirDestinoVinculoParte('${v.papel_id}')"` : ''}>
                <div class="rz-ic"><svg data-lucide="${PARTES_ICONE_PAPEL[v.papel] || 'link'}"></svg></div>
                <div class="rz-tx"><b>${rzEsc(v.rotulo || tipo || 'Vínculo')}</b><span>${rzEsc(sub)}</span></div>
                ${st}
                <button type="button" onclick="event.stopPropagation(); abrirAcoesVinculoParte('${pt.id}','${v.papel_id}')" class="rz-more" aria-label="Ações do vínculo"><svg data-lucide="ellipsis-vertical"></svg></button>
            </div>`;
        };
        listaEl.innerHTML =
            (ativos.length ? `<div class="rz-group">Ativos · ${ativos.length}</div>` + ativos.map(linha).join('') : '') +
            (encerrados.length ? `<div class="rz-group">Encerrados · ${encerrados.length}</div>` + encerrados.map(linha).join('') : '');
        rzIcones();
    } catch (err) {
        listaEl.innerHTML = '<div class="rz-empty"><p>Não consegui carregar os vínculos agora.</p></div>';
        console.warn('[partes] fn_vinculos_da_parte falhou:', err.message);
    }
}

export async function adicionarSocioInput() {

    // UNIFICADO — isto agora cobre tanto sócios internos (cadastrados em
    // Pessoas) quanto terceiros externos (proprietário de fora da
    // empresa) na MESMA lista. Antes existiam duas telas separadas
    // ("Divisão de Sócios" e "Propriedade dentro/fora da empresa")
    // tentando guardar informação parecida no mesmo lugar do banco
    // (propriedade_imovel) — a gravação já classifica sozinha, pelo
    // nome, se é sócio interno (bate com uma pessoa cadastrada) ou
    // terceiro externo (não bate) — então uma lista só, com essa opção
    // extra, resolve as duas telas de uma vez, sem duplicar dado.
    const nomesJaAdicionados = sociosAdicionais.map(s => s.nome);
    // CORRIGIDO — só pessoas com % de cotas da empresa cadastrado
    // aparecem como opção (antes, qualquer pessoa cadastrada aparecia,
    // mesmo sem nenhuma cota — inclusive você mesmo, sem % nenhum).
    const pessoasDisponiveis = pessoas.filter(p => !nomesJaAdicionados.includes(p.nome) && p.percentualCotasEmpresa && p.percentualCotasEmpresa > 0);

    // v1.297.0 (F0.2a) — prompt() numerado virou escolha em lista + Sheet de nome livre.
    const escolha = await rzEscolherUm({
        titulo: 'Adicionar proprietário', sub: 'Sócio com cotas ou terceiro de fora',
        opcoes: [
            ...pessoasDisponiveis.map((p, i) => ({ valor: String(i), titulo: p.nome, sub: p.percentualCotasEmpresa ? p.percentualCotasEmpresa + '% de cotas' : '', icone: 'user' })),
            { valor: 'externo', titulo: 'Outro proprietário', sub: 'Terceiro, não cadastrado em Pessoas', icone: 'user-plus' },
        ],
    });
    if (escolha === null) return;
    if (escolha === 'externo') {
        // Terceiro externo — nome livre, não precisa estar em Pessoas
        const nomeExterno = await rzPedirTexto({ titulo: 'Proprietário externo', rotulo: 'Nome do proprietário', rotuloSalvar: 'Adicionar' });
        if (!nomeExterno) return;
        sociosAdicionais.push({ nome: nomeExterno, pct: 0 });
        renderSocioInputs();
        return;
    }
    const pessoaEscolhida = pessoasDisponiveis[Number(escolha)];
    if (!pessoaEscolhida) return;
    const pctSugerido = pessoaEscolhida.percentualCotasEmpresa || 0;
    sociosAdicionais.push({ nome: pessoaEscolhida.nome, pct: pctSugerido });
    renderSocioInputs();

}

// v1.253.0 (bug reportado pelo Nicola, 23/09/2026: contador recém-
// criado não excluía — "fala que tem vínculo mas tinha acabado de
// criar"). CAUSA: o papel técnico 'prestador' (espelho da parte em
// prestadores, criado por sincronizarPrestadorDaParte) contava como
// vínculo — TODA parte prestadora ficava impossível de excluir. Agora
// a regra mora no banco (fn_parte_excluir): ignora o espelho, recusa
// com o motivo exato quando há vínculo real e apaga parte + espelho
// juntos. O pré-bloqueio local por papeisPorParte saiu (era a causa).
export async function excluirParte(id) {
    const pt = partesCliente.find(x => x.id === id); if (!pt) return;
    if (!await rzPerguntar({ titulo: `Excluir ${pt.nome}?`, impacto: 'Não dá para desfazer.', destrutivo: true, rotuloConfirmar: 'Excluir parte' })) return;
    try {
        const { error } = await dbAuth.rpc('fn_parte_excluir', { p_parte_id: id });
        if (error) throw error;
        mostrarToast('Parte excluída.', 'success');
        emitirEscritaGlobal('parte', { id, acao: 'excluir' });
        // v1.301.0 (F1.4a) — tira só a linha; a lista não recarrega
        partesCliente = partesCliente.filter(x => x.id !== id);
        if (typeof renderChipsPartes === 'function') renderChipsPartes();
        if (typeof renderPartes === 'function') renderPartes();
    } catch (err) {
        // v1.297.2 (F0.2a, teste do Nicola 04/10 00:52) — a recusa do banco diz QUANTOS
        // vínculos, não QUAIS: busca os vínculos e oferece abrir a ficha da parte.
        let lista = [];
        try { const { data } = await dbAuth.rpc('fn_vinculos_da_parte', { p_parte_id: id }); lista = data || []; } catch (_) {}
        // v1.307.0 (demanda b94ef7d5) — a lista agora traz ativos e encerrados (antes só ativos,
        // e a recusa contava os dois). Encerrado é histórico e segura a parte; cadastro errado
        // se resolve excluindo o vínculo na ficha.
        const nAtivos = lista.filter(v => v.ativo !== false).length, nEnc = lista.length - nAtivos;
        const nomes = lista.slice(0, 4).map(v => `${PARTES_ROTULO_PAPEL[v.papel] || v.papel}: ${v.rotulo || ''}${v.ativo === false ? ' (encerrado)' : ''}`).join('; ');
        const resto = lista.length > 4 ? ` e mais ${lista.length - 4}` : '';
        const contagem = [nAtivos ? `${nAtivos} ativo${nAtivos === 1 ? '' : 's'}` : '', nEnc ? `${nEnc} encerrado${nEnc === 1 ? '' : 's'}` : ''].filter(Boolean).join(' e ');
        const impacto = lista.length
            ? `Ela tem ${lista.length} vínculo${lista.length === 1 ? '' : 's'} (${contagem}): ${nomes}${resto}. Na ficha, exclua os que foram cadastro errado. Vínculo encerrado é histórico e mantém a parte.`
            : (err.message || String(err));
        if (await rzPerguntar({ titulo: 'Não dá para excluir', impacto, rotuloConfirmar: 'Ver vínculos', rotuloCancelar: 'Fechar' })) abrirFichaParte(id);
    }
}

export async function enviarSolicitacaoAcessoSocio(nomeNormalizado, whatsappSocio, emailSocio) {

    const btn = document.getElementById('btn-solicitar-acesso-socio') || document.getElementById('btn-solicitar-acesso-socio-negado');

    btn.disabled = true;

    const iconeOriginal = btn.innerText;

    btn.innerText = "⏳";

    try {

        // Busca a lista atual de dispositivos (pode ser a primeira ação do

        // usuário nesse aparelho, então talvez ainda não tenha sido buscada).

        const response = await fetch(GOOGLE_API_URL);

        const resData = await response.json();

        const listaAtual = (resData.dados && resData.dados.dispositivosAprovados) || [];

        const jaExiste = listaAtual.find(d => d.deviceId === deviceId);

        if (jaExiste) {

            if (jaExiste.status === 'Aprovado') {

                rzAvisar("Este aparelho já está aprovado. Toque em 'Acessar Sistema'.", 'success');

            } else {

                rzAvisar('Já existe uma solicitação para este aparelho, aguardando aprovação.', 'info');

            }

            localStorage.setItem(chaveLocal('solicitacao_enviada'), '1');

            btn.classList.add('hidden');

            return;

        }

        listaAtual.push({

            deviceId: deviceId,

            nomeSocio: nomeNormalizado,

            status: 'Pendente',

            solicitadoEm: new Date().toISOString(),

            aprovadoEm: '',

            whatsapp: whatsappSocio,

            email: emailSocio

        });

        await enviarDadosParaGoogleSheets("dispositivosAprovados", listaAtual);

        dispositivosAprovados = listaAtual;

        localStorage.setItem(chaveLocal('solicitacao_enviada'), '1');

        btn.classList.add('hidden');

        rzResumo({ titulo: 'Solicitação enviada', linhas: [`Enviada como "${nomeNormalizado}".`, 'Assim que for aprovada, este aparelho entra direto, sem senha.'] });

    } catch (err) {

        rzAvisar('Não foi possível enviar a solicitação. Verifique a internet e tente de novo.', 'danger');

        btn.disabled = false;

        btn.innerText = iconeOriginal;

    }

}

export function abrirAcoesVinculoParte(parteId, papelId) {
    const v = vinculosFichaParte.find(x => x.papel_id === papelId);
    if (!v || typeof abrirSheetAcoes !== 'function') return;
    const papel = PARTES_ROTULO_PAPEL[v.papel] || v.papel;
    const tipo = PARTES_VINCULO_TIPO[v.entidade_tipo] || 'vínculo';
    const acoes = [];
    if (vinculoParteNavegavel(v)) acoes.push({ icone: 'arrow-up-right', titulo: 'Abrir ' + tipo.toLowerCase(), aoTocar: () => abrirDestinoVinculoParte(papelId) });
    // v1.309.0 — locatário (vem do próprio contrato) e proprietário (rateio em % no ativo)
    // ativos não se encerram nem se excluem aqui: o ⋮ leva para onde alterar. O banco recusa
    // igual (fn_vinculo_encerrar/fn_vinculo_excluir v2).
    const naOrigem = v.ativo !== false && ((v.papel === 'locatario' && v.entidade_tipo === 'contrato') || (v.papel === 'proprietario' && v.entidade_tipo === 'ativo'));
    if (naOrigem) {
        if (vinculoParteNavegavel(v)) acoes.push({ icone: 'pencil', titulo: v.papel === 'locatario' ? 'Alterar no contrato' : 'Alterar no ativo', sub: v.papel === 'locatario' ? 'O locatário vem do próprio contrato' : 'A propriedade tem rateio em %, no chip Propriedade', aoTocar: () => abrirDestinoVinculoParte(papelId) });
    } else {
        if (v.ativo !== false) acoes.push({ icone: 'archive', titulo: 'Encerrar vínculo', codigo: 'partes.editar', sub: 'Troca real (ex.: síndico substituído). Fica no histórico', aoTocar: () => encerrarVinculoParte(parteId, papelId) });
        // v1.316.0 — encerrado pode voltar (fn_vinculo_reativar; fiador volta ao contrato com os dados de antes)
        else acoes.push({ icone: 'rotate-ccw', titulo: 'Reativar vínculo', codigo: 'partes.editar', sub: 'Volta a valer, como antes do encerramento', aoTocar: () => reativarVinculoParte(parteId, papelId) });
        acoes.push({ icone: 'trash-2', tipo: 'bad', titulo: 'Excluir vínculo', codigo: 'partes.editar', sub: 'Cadastro errado. Sai também do histórico', aoTocar: () => excluirVinculoParte(parteId, papelId) });
    }
    abrirSheetAcoes({ titulo: `${papel} · ${v.rotulo || tipo}`, sub: v.ativo === false ? 'Vínculo encerrado' : 'Vínculo ativo', acoes });
}

// Chips por papel (REGRAS §8) — só papéis que EXISTEM na carteira,
// + "Prestadores" agregando sindico/manutencista/administradora/
// prestador (é assim que o menu ⚙️ chega aqui) + "Sem papel".
export function renderChipsPartes() {
    const wrap = document.getElementById('partes-chips');
    if (!wrap) return;
    const contag = { todos: partesCliente.length, prestadores: 0, sem: 0, pendencia: 0 };
    partesCliente.forEach(pt => {
        const papeis = papeisPorParte[pt.id] || [];
        if (pendenciasParte(pt, papeis).length) contag.pendencia++; // F2.5c
        if (parteEhPrestador(pt, papeis)) contag.prestadores++;
        if (!papeis.length) contag.sem++;
        // v1.119.0 (bug apontado pelo Nicola: "os totais não batem
        // com as partes, e sim com os papéis") — papeisPorParte
        // tem UMA entrada por LINHA de papel (parte locatária em 3
        // contratos = ['locatario','locatario','locatario']), e o
        // chip contava as 3. Dedup por parte: cada parte conta 1x
        // por papel, então o chip bate com o nº de linhas que o
        // filtro dele mostra.
        [...new Set(papeis)].forEach(pp => { if (!['prestador', 'sindico', 'manutencista', 'administradora'].includes(pp)) contag[pp] = (contag[pp] || 0) + 1; });
    });
    const ordem = ['todos', 'pendencia', 'locatario', 'fiador', 'proprietario', 'prestadores', 'interessado', 'corretor', 'sem'];
    const rotulo = { todos: 'Todas', pendencia: 'Com pendência', prestadores: 'Prestadores', sem: 'Sem papel', locatario: 'Locatários', fiador: 'Fiadores', proprietario: 'Proprietários', interessado: 'Interessados', corretor: 'Corretores' };
    const chips = ordem.filter(k => contag[k]).map(k => ({ chave: k, rotulo: rotulo[k] || PARTES_ROTULO_PAPEL[k] || k, n: contag[k] }));
    if (!chips.some(c => c.chave === partesFiltroPapel)) partesFiltroPapel = 'todos';
    wrap.innerHTML = chips.map(c => `<button type="button" onclick="filtrarPartesPorChip('${c.chave}')" class="rz-chip ${partesFiltroPapel === c.chave ? 'rz-on' : ''}${c.chave === 'pendencia' ? ' rz-warn' : ''}">${c.rotulo} <span class="rz-n">${c.n}</span></button>`).join('');
}

// v1.118.0 — EMPREENDIMENTOS DO PRESTADOR pela ficha da parte.
// Busca tudo do banco na hora (não depende de array em memória):
// empreendimentos do cliente + vínculos vigentes do prestador.
// Salvar reaplica a regra da tela antiga: marcar = insert com
// data_inicio_vigencia hoje (síndico fecha o vínculo do síndico
// anterior naquele empreendimento); desmarcar = data_fim_vigencia
// hoje. Nada é deletado — vigência é histórico.
export async function abrirEmpreendimentosDaParte(parteId) {
    const pt = partesCliente.find(x => x.id === parteId); if (!pt || typeof abrirSheetForm !== 'function') return;
    const { data: papelPrest } = await dbAuth.from('partes_papeis').select('entidade_id').eq('parte_id', parteId).eq('papel', 'prestador').eq('ativo', true).limit(1);
    const prestadorId = papelPrest && papelPrest.length ? papelPrest[0].entidade_id : null;
    if (!prestadorId) { mostrarToast('Salve a parte como prestador primeiro (Editar dados).', 'danger'); return; }
    const [{ data: emps, error: e1 }, { data: vincs, error: e2 }] = await Promise.all([
        dbAuth.from('empreendimentos').select('id, nome').eq('cliente_id', CLIENTE_ID_SUPABASE).order('nome'),
        dbAuth.from('prestador_vinculo').select('id, empreendimento_id').eq('prestador_id', prestadorId).is('data_fim_vigencia', null)
    ]);
    if (e1 || e2) { mostrarToast('Não consegui carregar os empreendimentos.', 'danger'); return; }
    if (!emps || !emps.length) { mostrarToast('Nenhum empreendimento cadastrado ainda (menu › Tipos e modelos).', 'danger'); return; }
    const vigentes = new Set((vincs || []).map(v => v.empreendimento_id));
    abrirSheetForm({
        titulo: 'Empreendimentos atendidos', sub: pt.nome, rotuloSalvar: 'Salvar',
        corpo: emps.map(e => `
            <label class="rz-row" style="cursor:pointer">
                <input type="checkbox" class="pe-check" value="${e.id}" ${vigentes.has(e.id) ? 'checked' : ''} style="width:18px;height:18px;accent-color:var(--pine)">
                <div class="rz-tx"><b>${rzEsc(e.nome)}</b></div>
            </label>`).join(''),
        aoSalvar: (el) => salvarEmpreendimentosDaParte(el, parteId, prestadorId, pt.tipo_prestador, vigentes)
    });
}

export async function salvarEmpreendimentosDaParte(el, parteId, prestadorId, tipoPrestador, vigentesAntes) {
    const marcados = new Set(Array.from(el.querySelectorAll('.pe-check:checked')).map(c => c.value));
    const hoje = new Date().toISOString().split('T')[0];
    try {
        for (const empId of marcados) {
            if (vigentesAntes.has(empId)) continue;
            if (tipoPrestador === 'sindico') {
                await dbAuth.from('prestador_vinculo').update({ data_fim_vigencia: hoje })
                    .eq('empreendimento_id', empId).eq('tipo_prestador', 'sindico').is('data_fim_vigencia', null);
            }
            const { error } = await dbAuth.from('prestador_vinculo').insert({ prestador_id: prestadorId, tipo_prestador: tipoPrestador, empreendimento_id: empId, data_inicio_vigencia: hoje });
            if (error) throw error;
        }
        for (const empId of vigentesAntes) {
            if (marcados.has(empId)) continue;
            const { error } = await dbAuth.from('prestador_vinculo').update({ data_fim_vigencia: hoje })
                .eq('prestador_id', prestadorId).eq('empreendimento_id', empId).is('data_fim_vigencia', null);
            if (error) throw error;
        }
        registrarLog('partes.empreendimentos', { parteId, prestadorId, qtd: marcados.size });
        mostrarToast('Empreendimentos atualizados.', 'success');
        emitirEscritaGlobal('parte', { id: parteId, acao: 'editar-empreendimentos' });
        abrirFichaParte(parteId);
    } catch (err) {
        mostrarToast('Não consegui salvar: ' + (err.message || String(err)), 'danger');
        return false;
    }
}

// Espelho parte → prestadores (+ papel 'prestador' em partes_papeis).
// Idempotente: acha o prestador já ligado pelo papel; senão por
// documento; senão cria. Vínculos de empreendimento continuam sendo
// administrados por prestador_vinculo (Frente F cobre a UI disso).
export async function sincronizarPrestadorDaParte(parteId, linha, tipoPrestador) {
    const tipoOperacional = tipoPrestador; // enum de prestadores: imobiliaria|sindico|manutencista
    let prestadorId = null;
    const { data: papelExist } = await dbAuth.from('partes_papeis').select('id, entidade_id').eq('parte_id', parteId).eq('papel', 'prestador').eq('ativo', true).limit(1);
    if (papelExist && papelExist.length) prestadorId = papelExist[0].entidade_id;
    const linhaPrest = {
        cliente_id: CLIENTE_ID_SUPABASE, tipo: tipoOperacional,
        pessoa_fisica_juridica: linha.doc_tipo === 'CNPJ' ? 'juridica' : 'fisica',
        nome: linha.nome, doc_tipo: linha.doc_tipo, documento: linha.documento,
        contato_nome: linha.contato_nome, whatsapp: linha.whatsapp, email: linha.email,
        taxa_adm: linha.taxa_adm,
    };
    if (prestadorId) {
        const { error } = await dbAuth.from('prestadores').update(linhaPrest).eq('id', prestadorId);
        if (error) throw error;
    } else {
        const { data, error } = await dbAuth.from('prestadores').insert(linhaPrest).select('id').single();
        if (error) throw error;
        prestadorId = data.id;
        const { error: errPapel } = await dbAuth.from('partes_papeis').insert({ parte_id: parteId, papel: 'prestador', entidade_tipo: 'prestador', entidade_id: prestadorId, ativo: true });
        if (errPapel) throw errPapel;
    }
    return prestadorId;
}

export function abrirAcoesParte(parteId) {
    const pt = partesCliente.find(x => x.id === parteId); if (!pt || typeof abrirSheetAcoes !== 'function') return;
    const acoes = [
        { icone: 'link', titulo: 'Vínculos', codigo: 'partes.ver', sub: 'Onde esta parte atua, ativos e encerrados', aoTocar: () => abrirFichaParte(pt.id, 'vinculos') },
        { icone: 'plus', titulo: 'Adicionar papel', codigo: 'partes.editar', sub: 'Ligar a um contrato, ativo ou empreendimento', aoTocar: () => abrirAdicionarPapelParte(pt.id) },
    ];
    // v1.118.0 — a ficha MOSTRAVA os empreendimentos do síndico/
    // manutencista (RPC) mas não EDITAVA (limitação registrada na
    // v1.117; a edição morava nos checks da tela antiga). Agora
    // edita por aqui, com as MESMAS regras de vigência da tela
    // antiga (data_fim_vigencia; síndico exclusivo por
    // empreendimento).
    if (pt.tipo_prestador === 'sindico' || pt.tipo_prestador === 'manutencista') {
        acoes.push({ icone: 'landmark', titulo: 'Empreendimentos atendidos', codigo: 'partes.editar', sub: 'Onde este prestador atua', aoTocar: () => abrirEmpreendimentosDaParte(pt.id) });
    }
    acoes.push({ icone: 'trash-2', titulo: 'Excluir parte', codigo: 'partes.excluir', tipo: 'bad', aoTocar: () => excluirParte(pt.id) });
    abrirSheetAcoes({ titulo: pt.nome, sub: pt.documento ? `${pt.doc_tipo || ''} ${pt.documento}` : '', acoes });
}

// FRENTE F — adicionar papel avulso: escolhe o papel, depois a
// entidade (contrato/ativo) quando o papel pede uma. Grava direto
// em partes_papeis.
export function abrirAdicionarPapelParte(parteId) {
    const pt = partesCliente.find(x => x.id === parteId); if (!pt || typeof abrirSheetAcoes !== 'function') return;
    const ir = (papel, entTipo) => () => abrirEscolhaEntidadePapel(parteId, papel, entTipo);
    abrirSheetAcoes({ titulo: 'Adicionar papel', sub: pt.nome, acoes: [
        { icone: 'user', titulo: 'Locatário', codigo: 'partes.editar', sub: 'Num contrato existente', aoTocar: ir('locatario', 'contrato') },
        { icone: 'shield-check', titulo: 'Fiador', codigo: 'partes.editar', sub: 'Num contrato existente', aoTocar: ir('fiador', 'contrato') },
        { icone: 'key-round', titulo: 'Proprietário', codigo: 'partes.editar', sub: 'De um ativo', aoTocar: ir('proprietario', 'ativo') },
        { icone: 'user-search', titulo: 'Interessado', codigo: 'partes.editar', sub: 'Sem vínculo com entidade', aoTocar: () => gravarPapelParte(parteId, 'interessado', null, null) },
        { icone: 'handshake', titulo: 'Corretor', codigo: 'partes.editar', sub: 'Sem vínculo com entidade', aoTocar: () => gravarPapelParte(parteId, 'corretor', null, null) },
        { icone: 'wrench', titulo: 'Prestador', codigo: 'partes.editar', sub: 'Síndico, administradora ou manutencista', aoTocar: () => abrirFormParteSheet(parteId) },
    ] });
}

export async function gravarPapelParte(parteId, papel, entTipo, entId) {
    try {
        const q = dbAuth.from('partes_papeis').select('id').eq('parte_id', parteId).eq('papel', papel).eq('ativo', true);
        const { data: jaTem } = entId ? await q.eq('entidade_id', entId) : await q.is('entidade_id', null);
        if (jaTem && jaTem.length) { mostrarToast('Este papel já existe pra esta parte.', 'danger'); return; }
        const { error } = await dbAuth.from('partes_papeis').insert({ parte_id: parteId, papel, entidade_tipo: entTipo, entidade_id: entId, ativo: true });
        if (error) throw error;
        registrarLog('partes.papel_adicionado', { parteId, papel, entTipo, entId });
        mostrarToast('Papel adicionado.', 'success');
        emitirEscritaGlobal('parte', { id: parteId, acao: 'adicionar-papel' });
        await carregarPartes();
        abrirFichaParte(parteId);
    } catch (err) {
        mostrarToast('Não consegui adicionar: ' + (err.message || String(err)), 'danger');
    }
}

export function atualizarListaSelecaoSociosRepasse() {

    const repSelect = document.getElementById('rep-socio');

    if(!repSelect) return;

    // CORRIGIDO — antes semeava a lista com SOCIO_PADRAO (nome fixo, "Ruyter"
    // nas instalações herdadas da Rumo) e completava com nomes derivados da
    // divisão dos imóveis. Agora usa a fonte de verdade: pessoas cadastradas
    // com percentual de cotas da empresa preenchido.
    const sociosComParticipacao = pessoas.filter(p => p.percentualCotasEmpresa && p.percentualCotasEmpresa > 0);

    repSelect.innerHTML = sociosComParticipacao.length === 0
        ? '<option value="">Nenhum sócio com % de cotas cadastrado</option>'
        : sociosComParticipacao.map(p => `<option value="${p.nome}">${p.nome}</option>`).join('');

}

export async function carregarPartes() {
    const container = document.getElementById('lista-partes');
    if (container && !container.querySelector('.rz-row')) container.innerHTML = rzSkeleton('linhas', 5); // v1.301.0 (F1.4a)
    try {
        await lerPartesDoBanco();
    } catch (err) {
        console.warn('[partes] Falha ao carregar:', err.message);
        if (container) container.innerHTML = '<div class="rz-empty"><p>Não foi possível carregar agora. Toque pra tentar de novo.</p></div>';
        if (container) container.onclick = () => { container.onclick = null; carregarPartes(); };
        return;
    }
    renderChipsPartes();
    renderPartes();
}

export async function lerPartesDoBanco() {
    const [{ data: dataPartes, error: erroPartes }, { data: dataPapeis, error: erroPapeis }] = await Promise.all([
        dbAuth.from('partes').select('*').eq('cliente_id', CLIENTE_ID_SUPABASE).order('nome'),
        dbAuth.from('partes_papeis').select('parte_id, papel').eq('ativo', true)
    ]);
    if (erroPartes) throw erroPartes;
    if (erroPapeis) throw erroPapeis;
    partesCliente = dataPartes || [];
    papeisPorParte = {};
    (dataPapeis || []).forEach(pp => { (papeisPorParte[pp.parte_id] = papeisPorParte[pp.parte_id] || []).push(pp.papel); });
    partesCarregadas = true;
}

export async function excluirVinculoParte(parteId, papelId) {
    const v = vinculosFichaParte.find(x => x.papel_id === papelId); if (!v) return;
    const papel = PARTES_ROTULO_PAPEL[v.papel] || v.papel;
    if (!await rzPerguntar({ titulo: 'Excluir vínculo?', impacto: `${papel} em ${v.rotulo || 'vínculo'}. Use para cadastro errado: o vínculo some, inclusive do histórico${v.papel === 'fiador' ? ', junto com o cônjuge anuente ligado a ele' : ''}. Não dá para desfazer.`, destrutivo: true, rotuloConfirmar: 'Excluir vínculo' })) return;
    await executarAcaoVinculoParte(parteId, 'fn_vinculo_excluir', papelId, 'Vínculo excluído.');
}

export async function executarAcaoVinculoParte(parteId, funcao, papelId, okPadrao) {
    try {
        const { data, error } = await dbAuth.rpc(funcao, { p_papel_id: papelId });
        if (error) throw error;
        mostrarToast((data && data.mensagem) || okPadrao, 'success');
        emitirEscritaGlobal('parte', { id: parteId, acao: 'editar' });
        if (typeof carregarPartes === 'function') await carregarPartes();
        abrirFichaParte(parteId, 'vinculos');
    } catch (err) {
        mostrarToast('Não consegui alterar o vínculo: ' + (err.message || String(err)), 'danger');
    }
}

export async function encerrarVinculoParte(parteId, papelId) {
    const v = vinculosFichaParte.find(x => x.papel_id === papelId); if (!v) return;
    const papel = PARTES_ROTULO_PAPEL[v.papel] || v.papel;
    if (!await rzPerguntar({ titulo: 'Encerrar vínculo?', impacto: `${papel} em ${v.rotulo || 'vínculo'}. Sai dos vínculos ativos e continua no histórico da parte${v.papel === 'fiador' ? ', junto com o cônjuge anuente ligado a ele' : ''}.`, rotuloConfirmar: 'Encerrar vínculo' })) return;
    await executarAcaoVinculoParte(parteId, 'fn_vinculo_encerrar', papelId, 'Vínculo encerrado.');
}

export async function reativarVinculoParte(parteId, papelId) {
    const v = vinculosFichaParte.find(x => x.papel_id === papelId); if (!v) return;
    const papel = PARTES_ROTULO_PAPEL[v.papel] || v.papel;
    if (!await rzPerguntar({ titulo: 'Reativar vínculo?', impacto: `${papel} em ${v.rotulo || 'vínculo'} volta a valer${v.papel === 'fiador' ? ', e o fiador volta ao contrato com os dados de antes' : ''}.`, rotuloConfirmar: 'Reativar vínculo' })) return;
    await executarAcaoVinculoParte(parteId, 'fn_vinculo_reativar', papelId, 'Vínculo reativado.');
}

export function abrirDestinoVinculoParte(papelId) {
    const v = vinculosFichaParte.find(x => x.papel_id === papelId);
    if (!vinculoParteNavegavel(v)) return;
    fecharSheet();
    if (v.entidade_tipo === 'contrato') abrirFichaContrato(v.entidade_id);
    else if (v.entidade_tipo === 'ativo') { switchTab('tab-ativos'); window.dispatchEvent(new CustomEvent('cofre:abrir-ativo', { detail: { id: v.entidade_id } })); }
    else if (v.entidade_tipo === 'item_controle') abrirAlertaItemControle(v.entidade_id, v.ativo_ref || null);
}

export function ajustarCamposPrestadorParte() {
    const tipo = document.getElementById('parte-tipo-prestador')?.value || '';
    const wrap = document.getElementById('parte-campos-prestador');
    if (wrap) { wrap.classList.toggle('hidden', !tipo); wrap.style.display = tipo ? '' : 'none'; }
    document.getElementById('parte-wrap-taxa')?.classList.toggle('hidden', tipo !== 'imobiliaria');
}

export function enviarResumoSocioEmail(socio) {

    const email = obterContatoSocio(socio, 'email');
    if (!email) return;
    const corpo = montarTextoResumoSocio(socio).replace(/\*/g, '');
    window.location.href = `mailto:${email}?subject=${encodeURIComponent('Resumo de repasses - ' + socio)}&body=${encodeURIComponent(corpo)}`;

}

// v1.41.2 — CORRIGIDO: os botões de WhatsApp/E-mail da aba
// Distribuição pareciam "não fazer nada" ao clicar. Causa raiz:
// obterContatoSocio() dependia de window.prompt() como fallback
// quando o sócio não tinha contato cadastrado — e prompt() não
// funciona dentro do PWA instalado no celular (a maioria dos
// navegadores/webviews mobile ignora silenciosamente e retorna null
// na hora, sem mostrar nenhuma caixa). Substituído por um modal
// próprio (pedirContatoSocioModal), e as duas funções de envio
// viraram callback-based para acomodar a natureza assíncrona do
// modal (prompt() era síncrono; um modal em HTML não é).
// v1.41.3 — CORRIGIDO de novo: o modal para digitar contato "avulso"
// (guardado só no localStorage deste aparelho) era confuso e frágil
// — o contato sumia se o sócio abrisse de outro celular. Agora o
// e-mail/WhatsApp vem DIRETO do cadastro de Pessoas (mesma fonte que
// alimenta a aba Pessoas, no menu de Conta). Se a pessoa ainda não
// tem e-mail/WhatsApp cadastrado lá, mostra um aviso claro dizendo
// exatamente isso — em vez de pedir para digitar um contato avulso.
export function enviarResumoSocioZap(socio) {

    const telefone = obterContatoSocio(socio, 'zap');
    if (!telefone) return;
    window.open(`https://api.whatsapp.com/send?phone=55${telefone.replace(/\D/g,'')}&text=${encodeURIComponent(montarTextoResumoSocio(socio))}`, '_blank');

}

// Partes: o termo mora em partesFiltroTexto; quem chama abrirBuscaPartes() só põe o foco na barra.
export function ligarBuscaPartes() {
    const el = rzBuscaInline('partes-busca-q', (v) => { partesFiltroTexto = v; renderPartes(); });
    if (el && el.value !== partesFiltroTexto) { el.value = partesFiltroTexto; el._rzMarcar && el._rzMarcar(); }
}

export function filtrarPartesPorChip(chave) {
    partesFiltroPapel = chave;
    renderChipsPartes();
    renderPartes();
}

export function atualizarPctSocioAdicional(index, valor) {

    sociosAdicionais[index].pct = parseFloat(valor) || 0;

}

export function removerSocioInput(index) {

    sociosAdicionais.splice(index, 1);

    renderSocioInputs();

}

// v1.52.0 — overlay de busca da aba Distribuição, mesmo padrão.
export function fecharBuscaSocios() {
    document.getElementById('modal-busca-socios').classList.add('hidden');
}
