import { describe, it, expect } from 'vitest';
import { comparar, regraAtendida, selecionarComunicacao } from '../js/comunicacoes/comunicacoes-regras.js';

describe('Central de Comunicações - regras', () => {
  it('seleciona maior prioridade entre comunicações elegíveis', () => {
    const lista = [
      { codigo:'campanha', prioridade:20, concluida:false, regras:[] },
      { codigo:'onboarding', prioridade:100, concluida:false, regras:[{tipo_regra:'sem_imoveis', operador:'eq', valor:true}] }
    ];
    expect(selecionarComunicacao(lista, {semImoveis:true}).codigo).toBe('onboarding');
  });

  it('não mostra onboarding quando já existem imóveis', () => {
    const lista = [{ codigo:'onboarding', prioridade:100, concluida:false, regras:[{tipo_regra:'sem_imoveis', operador:'eq', valor:true}] }];
    expect(selecionarComunicacao(lista, {semImoveis:false})).toBeNull();
  });

  it('não seleciona comunicação concluída', () => {
    const lista = [{ codigo:'onboarding', prioridade:100, concluida:true, regras:[] }];
    expect(selecionarComunicacao(lista, {})).toBeNull();
  });

  it('regra desconhecida falha fechada', () => {
    expect(regraAtendida({tipo_regra:'qualquer_coisa', operador:'eq', valor:true}, {})).toBe(false);
  });

  it('operador in funciona com lista', () => {
    expect(comparar('trial', 'in', ['trial','standard'])).toBe(true);
  });
});
