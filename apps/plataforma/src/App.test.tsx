import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from './App';
import { carregarHistorico } from './dados/armazenamento';

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
    expect(screen.getByRole('heading', { name: 'O que é o Jogue e Aprenda?' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Para quem é?' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Escolher um jogo' })).toHaveAttribute('href', '#/jogos');
    expect(screen.getByRole('link', { name: 'Ver meu progresso' })).toHaveAttribute('href', '#/progresso');
  });

  it('continua de onde parou no topo de Progresso, e não no início', () => {
    localStorage.setItem(
      'jogue-e-aprenda:historico',
      JSON.stringify([{ id: 'x', jogoId: 'cobrinha-sabida', data: new Date().toISOString(), config: {}, resultado: null, resumo: { contou: true } }]),
    );
    render(<App />);
    expect(screen.queryByRole('link', { name: 'Continuar' })).toBeNull();
    cleanup();
    window.location.hash = '#/progresso';
    render(<App />);
    expect(screen.getByText('Nível 1')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Continuar' })).toBeInTheDocument();
  });

  it('troca o id antigo da cobrinha no histórico salvo', () => {
    localStorage.setItem(
      'jogue-e-aprenda:historico',
      JSON.stringify([{ id: 'x', jogoId: 'cobrinha-que-calcula', data: new Date().toISOString(), config: {}, resultado: null, resumo: null }]),
    );
    expect(carregarHistorico()[0]!.jogoId).toBe('cobrinha-sabida');
  });

  it('em Progresso, quem nunca jogou vê Começar', () => {
    window.location.hash = '#/progresso';
    render(<App />);
    expect(screen.getByRole('link', { name: 'Começar' })).toBeInTheDocument();
  });

  it('reúne todo o progresso numa aba, por disciplina e sem depender de um jogo', () => {
    window.location.hash = '#/progresso';
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Progresso' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Histórico' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Apagar progresso' })).toBeInTheDocument();
    expect(screen.getAllByText('Maestria 0 · zere o Básico (20 de 20) para subir').length).toBeGreaterThan(0);
    // Matemática, Geografia e História, cada uma com seu quadro.
    expect(screen.getAllByText('0% da disciplina dominada')).toHaveLength(3);
    // Todas as habilidades ficam abertas desde o início: 5 de Matemática, 5 de Geografia e 3 de História.
    expect(screen.queryByText(/^Falta:/)).toBeNull();
    expect(screen.getAllByRole('link', { name: 'Treinar' })).toHaveLength(13);
    expect(screen.getAllByRole('link', { name: 'Treinar' })[0]).toHaveAttribute('href', '#/jogos?habilidade=adicao');
    expect(screen.getByText('Português')).toBeInTheDocument();
  });

  it('leva os endereços antigos de Mapa e Perfil para Progresso', () => {
    window.location.hash = '#/perfil';
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Progresso' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Perfil' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Mapa' })).toBeNull();
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
    // Card fechado: ícone, nome, apresentação e Jogar.
    expect(screen.getByRole('heading', { name: 'Cobrinha Sabida' })).toBeInTheDocument();
    expect(screen.queryByRole('radiogroup', { name: 'Nível' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Jogar' }));
    // Card aberto: escolhe habilidade e nível, e então Começar.
    expect(screen.getByRole('radiogroup', { name: 'Nível' })).toBeInTheDocument();
    expect(document.querySelector('iframe')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Começar' }));
    expect(document.querySelector('iframe')?.getAttribute('src')).toBe('jogos/cobrinha-sabida/index.html');
  });

  it('o endereço antigo da cobrinha ainda abre o jogo', () => {
    window.location.hash = '#/jogar/cobrinha-que-calcula?habilidade=adicao';
    render(<App />);
    expect(document.querySelector('iframe')?.getAttribute('src')).toBe('jogos/cobrinha-sabida/index.html');
  });
});
