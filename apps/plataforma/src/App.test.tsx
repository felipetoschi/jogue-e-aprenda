import { cleanup, fireEvent, render, screen } from '@testing-library/react';
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

  it('seleciona o estágio mais alto já alcançado e deixa voltar aos anteriores', () => {
    localStorage.setItem(
      'jogue-e-aprenda:perfil',
      JSON.stringify({
        versao: 1, xp: 0, ultimoDia: null, partidasDoDia: {}, selos: {}, provas: {},
        habilidades: { adicao: { estagio: 'intermediario', maestria: 10, partidasNoEstagio: 1, ultimosDesempenhos: [], revisao: null, revisoesRuinsSeguidas: 0, enferrujada: false } },
      }),
    );
    window.location.hash = '#/jogar/cobrinha-que-calcula?habilidade=adicao&modo=normal';
    render(<App />);
    expect(screen.getByRole('radio', { name: 'Intermediário' })).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(screen.getByRole('radio', { name: 'Básico' }));
    expect(screen.getByRole('radio', { name: 'Básico' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText('Vale XP, mas não muda sua maestria no Intermediário.')).toBeInTheDocument();
  });

  it('carrega a partida num iframe só ao abrir o jogo', () => {
    render(<App />);
    expect(document.querySelector('iframe')).toBeNull();
    cleanup();
    window.location.hash = '#/jogar/cobrinha-que-calcula?habilidade=adicao&modo=normal';
    render(<App />);
    // Primeiro a escolha de nível, com o estágio atual selecionado e os seguintes bloqueados.
    expect(document.querySelector('iframe')).toBeNull();
    expect(screen.getByRole('radio', { name: 'Básico' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('radio', { name: 'Intermediário' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Jogar' }));
    expect(document.querySelector('iframe')?.getAttribute('src')).toBe('jogos/cobrinha-que-calcula/index.html');
  });
});
