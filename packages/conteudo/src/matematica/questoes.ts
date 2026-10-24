import type { Estagio, Questao } from '@jogue/sdk-jogo';
import type { Rng } from '../aleatorio';
import { explicarErro, formatarNumero, gerarConta } from './contas';

/** Opções por pergunta em cada estágio: mais opções, mais difícil chutar. */
export const OPCOES_POR_ESTAGIO: Record<Estagio, number> = { basico: 3, intermediario: 3, avancado: 4, mestre: 4 };

/** Uma conta de Matemática no formato comum a todos os jogos. */
export function questaoDeMatematica(habilidadeId: string, estagio: Estagio, ajuste: number, rng: Rng): Questao {
  const conta = gerarConta(habilidadeId, estagio, ajuste, OPCOES_POR_ESTAGIO[estagio], rng);
  return {
    habilidadeId,
    enunciado: `${conta.texto} = ?`,
    resolucao: `${conta.texto} = ${formatarNumero(conta.resposta)}`,
    opcoes: conta.opcoes.map((o) => ({
      texto: formatarNumero(o.valor),
      correta: o.correta,
      ...(o.tipoErro ? { erro: { tipo: o.tipoErro, ...explicarErro(conta, o.valor, o.tipoErro) } } : {}),
    })),
  };
}
