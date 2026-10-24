import { PADRAO, type Estagio, type Questao } from '@jogue/sdk-jogo';
import type { Rng } from '../aleatorio';
import { explicarErro, formatarNumero, gerarConta } from './contas';

/** "Todas as operações" sorteia uma destas a cada pergunta. */
const OPERACOES = ['adicao', 'subtracao', 'multiplicacao', 'divisao'] as const;

/** Uma conta de Matemática no formato comum a todos os jogos. */
export function questaoDeMatematica(habilidadeId: string, estagio: Estagio, ajuste: number, rng: Rng): Questao {
  if (habilidadeId === 'todas-operacoes') {
    const operacao = OPERACOES[Math.floor(rng() * OPERACOES.length)]!;
    // O acerto conta para "Todas as operações", a habilidade escolhida na partida.
    return { ...questaoDeMatematica(operacao, estagio, ajuste, rng), habilidadeId };
  }
  const conta = gerarConta(habilidadeId, estagio, ajuste, PADRAO.estagios[estagio].opcoes, rng);
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
