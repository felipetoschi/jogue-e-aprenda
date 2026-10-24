import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from './App';

afterEach(() => {
  cleanup();
  localStorage.clear();
  window.location.hash = '';
});

describe('plataforma', () => {
  it('recebe quem chega pela primeira vez com início do zero ou prova de nivelamento', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Aprenda jogando, do básico ao avançado' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Jogar agora' })).toHaveAttribute(
      'href',
      '#/jogar/cobrinha-que-calcula?habilidade=adicao&modo=normal',
    );
    expect(screen.getByRole('link', { name: 'Prova de Adição' })).toHaveAttribute(
      'href',
      '#/jogar/cobrinha-que-calcula?habilidade=adicao&modo=nivelamento',
    );
  });

  it('mostra o nível e a próxima partida depois da primeira partida', () => {
    localStorage.setItem(
      'jogue-e-aprenda:historico',
      JSON.stringify([{ id: 'x', jogoId: 'cobrinha-que-calcula', data: new Date().toISOString(), config: {}, resultado: null, resumo: { contou: true } }]),
    );
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Nível 1' })).toBeInTheDocument();
  });

  it('mostra as habilidades bloqueadas com o que falta', () => {
    window.location.hash = '#/mapa';
    render(<App />);
    expect(screen.getByText('Falta: Multiplicação — Intermediário')).toBeInTheDocument();
    expect(screen.getByText('0% da matéria dominada')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Já sei: prova do Intermediário' }).length).toBeGreaterThan(0);
  });

  it('carrega a partida num iframe só ao abrir o jogo', () => {
    render(<App />);
    expect(document.querySelector('iframe')).toBeNull();
    cleanup();
    window.location.hash = '#/jogar/cobrinha-que-calcula?habilidade=adicao&modo=normal';
    render(<App />);
    expect(document.querySelector('iframe')?.getAttribute('src')).toBe('jogos/cobrinha-que-calcula/index.html');
  });
});
