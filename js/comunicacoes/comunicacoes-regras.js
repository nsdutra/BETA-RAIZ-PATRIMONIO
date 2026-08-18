// Raiz Patrimônio — Central de Comunicações — Regras puras
// Beta v1.43.0

export function detectarAmbiente(navigatorLike = navigator, windowLike = window) {
    const ua = navigatorLike.userAgent || '';
    const ios = /iPad|iPhone|iPod/.test(ua) ||
        (navigatorLike.platform === 'MacIntel' && navigatorLike.maxTouchPoints > 1);
    const android = /Android/i.test(ua);
    const standalone = Boolean(
        windowLike.matchMedia && windowLike.matchMedia('(display-mode: standalone)').matches
    ) || navigatorLike.standalone === true;
    return { ios, android, standalone, navegador: ios ? 'ios' : android ? 'android' : 'outro' };
}

export function regraAtendida(regra, contexto) {
    const tipo = regra.tipo_regra;
    const valor = regra.valor;
    if (tipo === 'sem_imoveis') return Boolean(contexto.semImoveis) === Boolean(valor);
    if (tipo === 'pwa_nao_instalado') return Boolean(!contexto.pwaInstalado) === Boolean(valor);
    if (tipo === 'plano') return comparar(contexto.plano, regra.operador, valor);
    if (tipo === 'perfil') return comparar(contexto.perfil, regra.operador, valor);
    if (tipo === 'tela') return comparar(contexto.tela, regra.operador, valor);
    if (tipo === 'dispositivo') return comparar(contexto.dispositivo, regra.operador, valor);
    return false; // regra desconhecida falha fechada
}

export function comparar(atual, operador, esperado) {
    if (operador === 'eq') return atual === esperado;
    if (operador === 'neq') return atual !== esperado;
    if (operador === 'in') return Array.isArray(esperado) && esperado.includes(atual);
    if (operador === 'gte') return Number(atual) >= Number(esperado);
    if (operador === 'lte') return Number(atual) <= Number(esperado);
    return false;
}

export function selecionarComunicacao(comunicacoes, contexto) {
    return [...(comunicacoes || [])]
        .filter(c => !c.concluida)
        .filter(c => (c.regras || []).every(r => regraAtendida(r, contexto)))
        .sort((a, b) => (b.prioridade || 0) - (a.prioridade || 0))[0] || null;
}
