import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
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
    expect(screen.getByRole('heading', { name: 'Cada partida é um passo na sua evolução.' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Jogar agora' })).toHaveAttribute(
      'href',
      '#/jogar/cobrinha-que-calcula?habilidade=adicao&modo=normal',
    );
    expect(screen.getByRole('link', { name: 'Já sei o básico' })).toHaveAttribute(
      'href',
      '#/jogar/cobrinha-que-calcula?habilidade=multiplicacao&modo=nivelamento',
    );
  });

  it('mostra o nível e a próxima partida depois da primeira partida', () => {
    localStorage.setItem(
      'jogue-e-aprenda:historico',
      JSON.stringify([{ id: 'x', jogoId: 'cobrinha-que-calcula', data: new Date().toISOString(), config: {}, resultado: null, resumo: { contou: true } }]),
    );
    render(<App />);
    expect(screen.getByText('Nível 1')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Continuar' })).toBeInTheDocument();
    // A apresentação continua no início.
    expect(screen.getByRole('heading', { name: 'Cada partida é um passo na sua evolução.' })).toBeInTheDocument();
  });

  it('mostra as habilidades bloqueadas com o que falta', () => {
    window.location.hash = '#/mapa';
    render(<App />);
    expect(screen.getByText('Falta: Multiplicação — Intermediário')).toBeInTheDocument();
    expect(screen.getByText('0% da matéria dominada')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: 'Já sei: prova do Intermediário' }).length).toBeGreaterThan(0);
  });

  it('carrega a partida num iframe só ao abrir o jogo, direto no nível mais alto', () => {
    render(<App />);
    expect(document.querySelector('iframe')).toBeNull();
    cleanup();
    window.location.hash = '#/jogar/cobrinha-que-calcula?habilidade=adicao&modo=normal';
    render(<App />);
    expect(document.querySelector('iframe')?.getAttribute('src')).toBe('jogos/cobrinha-que-calcula/index.html');
  });

  it('no mapa, marca o nível mais alto já alcançado e deixa escolher um anterior', () => {
    localStorage.setItem(
      'jogue-e-aprenda:perfil',
      JSON.stringify({
        versao: 1, xp: 0, ultimoDia: null, partidasDoDia: {}, selos: {}, provas: {},
        habilidades: { adicao: { estagio: 'intermediario', maestria: 10, partidasNoEstagio: 1, ultimosDesempenhos: [], revisao: null, revisoesRuinsSeguidas: 0, enferrujada: false } },
      }),
    );
    window.location.hash = '#/mapa';
    render(<App />);
    const niveis = screen.getByRole('radiogroup', { name: 'Nível de Adição' });
    const basico = within(niveis).getByRole('radio', { name: 'Básico' });
    expect(within(niveis).getByRole('radio', { name: 'Intermediário' })).toHaveAttribute('aria-checked', 'true');
    expect(within(niveis).getByRole('radio', { name: 'Avançado' })).toBeDisabled();
    fireEvent.click(basico);
    expect(basico).toHaveAttribute('aria-checked', 'true');
  });
});
