// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { CANAL, VERSAO_PROTOCOLO, type ConfigPartida, type CorpoDoJogo, type PartidaRegistrada } from './contrato';
import { abrirCanalComJogo } from './plataforma';

const partida = (partidaId: string): ConfigPartida => ({
  partidaId,
  habilidadeId: 'adicao',
  estagio: 'basico',
  ajuste: 0.5,
  modo: 'normal',
  rotulo: 'Adição · Básico',
  questoes: Array.from({ length: 20 }, () => ({
    habilidadeId: 'adicao',
    enunciado: '1 + 1 = ?',
    resolucao: '1 + 1 = 2',
    opcoes: [{ letra: 'A' as const, texto: '2', correta: true }],
  })),
});

const resultado = (partidaId: string, acertos: number) => ({
  partidaId,
  pontuacao: acertos * 5,
  desempenho: [{ habilidadeId: 'adicao', acertos, tentativas: acertos + 1 }],
  ajudas: 0,
  status: 'concluida' as const,
});

/** Um iframe de mentira: guarda o que a plataforma manda e deixa o "jogo" responder. */
function montar() {
  const recebidas: unknown[] = [];
  const janelaDoJogo = { postMessage: (msg: unknown) => recebidas.push(msg) } as unknown as Window;
  const iframe = { contentWindow: janelaDoJogo } as HTMLIFrameElement;
  const doJogo = (corpo: CorpoDoJogo) =>
    window.dispatchEvent(
      new MessageEvent('message', { data: { canal: CANAL, versao: VERSAO_PROTOCOLO, ...corpo }, origin: window.location.origin, source: janelaDoJogo }),
    );
  return { iframe, recebidas, doJogo };
}

describe('canal plataforma ↔ jogo', () => {
  it('salva o resultado, oferece a próxima partida e passa a validar a nova', () => {
    const { iframe, recebidas, doJogo } = montar();
    const proxima = partida('p2');
    const registro: PartidaRegistrada = { proxima, xpGanho: 12, promovidoPara: null };
    const aoReceberResultado = vi.fn(() => registro);
    const aoNovaPartida = vi.fn();
    const aoVerResultado = vi.fn();
    const fechar = abrirCanalComJogo(iframe, partida('p1'), { aoReceberResultado, aoNovaPartida, aoVerResultado, aoSair: vi.fn() });

    doJogo({ tipo: 'pronto' });
    expect(recebidas.at(-1)).toMatchObject({ tipo: 'iniciar', config: { partidaId: 'p1' } });

    doJogo({ tipo: 'resultado', resultado: resultado('p1', 7) });
    expect(aoReceberResultado).toHaveBeenCalledTimes(1);
    expect(recebidas.at(-1)).toMatchObject({ tipo: 'registrado', registro: { xpGanho: 12, proxima: { partidaId: 'p2' } } });

    // Um segundo resultado da mesma partida é ignorado.
    doJogo({ tipo: 'resultado', resultado: resultado('p1', 7) });
    expect(aoReceberResultado).toHaveBeenCalledTimes(1);

    // O jogador joga de novo: a partida p2 passa a valer, e o resultado dela é aceito.
    doJogo({ tipo: 'novaPartida', partidaId: 'p2' });
    expect(aoNovaPartida).toHaveBeenCalledWith(proxima);
    doJogo({ tipo: 'resultado', resultado: resultado('p2', 3) });
    expect(aoReceberResultado).toHaveBeenCalledTimes(2);

    doJogo({ tipo: 'verResultado' });
    expect(aoVerResultado).toHaveBeenCalled();
    fechar();
  });

  it('não aceita começar uma partida que não foi oferecida', () => {
    const { iframe, doJogo } = montar();
    const aoNovaPartida = vi.fn();
    const fechar = abrirCanalComJogo(iframe, partida('p1'), { aoReceberResultado: vi.fn(), aoNovaPartida, aoSair: vi.fn() });
    doJogo({ tipo: 'novaPartida', partidaId: 'inventada' });
    expect(aoNovaPartida).not.toHaveBeenCalled();
    fechar();
  });
});
