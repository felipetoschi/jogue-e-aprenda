import type { ConfigPartida, ResultadoJogo } from './contrato';

const inteiroNaoNegativo = (n: unknown): n is number => Number.isInteger(n) && (n as number) >= 0;

/**
 * Confere se um resultado é plausível antes de entrar na progressão.
 * Retorna a lista de problemas; vazia significa válido.
 */
export function validarResultado(resultado: ResultadoJogo, config: ConfigPartida): string[] {
  const problemas: string[] = [];
  if (resultado.partidaId !== config.partidaId) problemas.push('partida desconhecida');
  if (typeof resultado.pontuacao !== 'number' || resultado.pontuacao < 0 || resultado.pontuacao > 100) {
    problemas.push('pontuação fora de 0 a 100');
  }
  if (!inteiroNaoNegativo(resultado.ajudas)) problemas.push('ajudas inválidas');
  if (resultado.status !== 'concluida' && resultado.status !== 'abandonada') problemas.push('status inválido');
  if (!Array.isArray(resultado.desempenho)) {
    problemas.push('desempenho ausente');
  } else {
    for (const d of resultado.desempenho) {
      if (!inteiroNaoNegativo(d.acertos) || !inteiroNaoNegativo(d.tentativas)) {
        problemas.push(`desempenho inválido em ${d.habilidadeId}`);
      } else if (d.acertos > d.tentativas) {
        problemas.push(`mais acertos que tentativas em ${d.habilidadeId}`);
      }
    }
  }
  if (resultado.erros !== undefined && !Array.isArray(resultado.erros)) problemas.push('erros inválidos');
  return problemas;
}
