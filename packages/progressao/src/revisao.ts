import type { Estagio } from '@jogue/sdk-jogo';
import { PARAMETROS } from './parametros';
import type { EstadoHabilidade, RevisaoAgendada } from './tipos';
import { somarDias } from './util';

export function agendarPrimeiraRevisao(estagioSuperado: Estagio, agora: Date): RevisaoAgendada {
  const dias = PARAMETROS.revisao.intervalosDias[0];
  return { estagio: estagioSuperado, indice: 0, venceEm: somarDias(agora, dias).toISOString() };
}

export function revisaoVencida(estado: EstadoHabilidade, agora: Date): boolean {
  return estado.revisao !== null && new Date(estado.revisao.venceEm) <= agora;
}

/** Aplica o resultado de uma partida de revisão. Retorna o novo estado e se ela foi bem-sucedida. */
export function aplicarRevisao(
  estado: EstadoHabilidade,
  desempenho: number,
  agora: Date,
): { estado: EstadoHabilidade; aprovada: boolean } {
  const { intervalosDias, notaAprovacao, notaRuim, ruinsParaEnferrujar } = PARAMETROS.revisao;
  if (!estado.revisao) return { estado, aprovada: false };

  if (desempenho >= notaAprovacao) {
    const indice = estado.revisao.indice + 1;
    const dias = intervalosDias[indice];
    return {
      aprovada: true,
      estado: {
        ...estado,
        enferrujada: false,
        revisoesRuinsSeguidas: 0,
        // Depois do último intervalo, a habilidade fica consolidada e sai da fila.
        revisao: dias === undefined ? null : { ...estado.revisao, indice, venceEm: somarDias(agora, dias).toISOString() },
      },
    };
  }

  const ruins = desempenho < notaRuim ? estado.revisoesRuinsSeguidas + 1 : 0;
  return {
    aprovada: false,
    estado: {
      ...estado,
      revisoesRuinsSeguidas: ruins,
      enferrujada: estado.enferrujada || ruins >= ruinsParaEnferrujar,
      revisao: { ...estado.revisao, indice: 0, venceEm: somarDias(agora, intervalosDias[0]).toISOString() },
    },
  };
}
