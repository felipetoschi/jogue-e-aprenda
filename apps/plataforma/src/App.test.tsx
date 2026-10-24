import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from './App';

afterEach(() => {
  cleanup();
  localStorage.clear();
  window.location.hash = '';
});

const perfilNoIntermediario = () =>
  localStorage.setItem(
    'jogue-e-aprenda:perfil',
    JSON.stringify({
      versao: 1,
      xp: 0,
      ultimoDia: null,
      partidasDoDia: {},
      selos: {},
      habilidades: {
        adicao: { estagio: 'intermediario', maestria: 10, partidasNoEstagio: 1, ultimosDesempenhos: [], revisao: null, revisoesRuinsSeguidas: 0, enferrujada: false },
      },
    }),
  );

describe('plataforma', () => {
  it('abre explicando a plataforma e leva à escolha de jogo', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Cada partida é um passo na sua evolução.' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Escolher um jogo' })).toHaveAttribute('href', '#/jogos');
    expect(screen.getByRole('link', { name: 'Ver meu progresso' })).toHaveAttribute('href', '#/mapa');
  });

  it('mostra o nível e o botão Continuar depois da primeira partida', () => {
    localStorage.setItem(
      'jogue-e-aprenda:historico',
      JSON.stringify([{ id: 'x', jogoId: 'cobrinha-que-calcula', data: new Date().toISOString(), config: {}, resultado: null, resumo: { contou: true } }]),
    );
    render(<App />);
    expect(screen.getByText('Nível 1')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Continuar' })).toBeInTheDocument();
  });

  it('mostra o progresso por disciplina, sem depender de um jogo', () => {
    window.location.hash = '#/mapa';
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Mapa de progresso' })).toBeInTheDocument();
    expect(screen.getByText('0% da disciplina dominada')).toBeInTheDocument();
    expect(screen.getByText('Falta: Multiplicação — Intermediário')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Treinar' })[0]).toHaveAttribute('href', '#/jogos?habilidade=adicao');
    expect(screen.getByText('Português')).toBeInTheDocument();
  });

  it('no jogo, marca o nível mais alto já alcançado e deixa escolher um anterior', () => {
    perfilNoIntermediario();
    window.location.hash = '#/jogos?habilidade=adicao';
    render(<App />);
    const niveis = screen.getByRole('radiogroup', { name: 'Nível' });
    expect(within(screen.getByRole('radiogroup', { name: 'Habilidade' })).getByRole('radio', { name: 'Adição' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(within(niveis).getByRole('radio', { name: 'Intermediário' })).toHaveAttribute('aria-checked', 'true');
    expect(within(niveis).getByRole('radio', { name: 'Avançado' })).toBeDisabled();
    fireEvent.click(within(niveis).getByRole('radio', { name: 'Básico' }));
    expect(within(niveis).getByRole('radio', { name: 'Básico' })).toHaveAttribute('aria-checked', 'true');
  });

  it('só carrega o jogo, num iframe, ao clicar em Jogar', () => {
    window.location.hash = '#/jogos';
    render(<App />);
    expect(document.querySelector('iframe')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Jogar' }));
    expect(document.querySelector('iframe')?.getAttribute('src')).toBe('jogos/cobrinha-que-calcula/index.html');
  });
});
