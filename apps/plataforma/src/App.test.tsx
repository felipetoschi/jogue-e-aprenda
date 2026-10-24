import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from './App';

afterEach(() => {
  cleanup();
  localStorage.clear();
  window.location.hash = '';
});

describe('plataforma', () => {
  it('abre no início com nível 1 e sugere a primeira partida', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Nível 1' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Jogar agora' })).toHaveAttribute(
      'href',
      '#/jogar/cobrinha-que-calcula?habilidade=adicao&modo=normal',
    );
  });

  it('mostra as habilidades bloqueadas com o que falta', () => {
    window.location.hash = '#/mapa';
    render(<App />);
    expect(screen.getByText('Falta: Multiplicação — Intermediário')).toBeInTheDocument();
    expect(screen.getByText('0% da matéria dominada')).toBeInTheDocument();
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
