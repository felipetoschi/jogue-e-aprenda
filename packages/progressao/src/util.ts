import { ESTAGIOS, type Estagio } from '@jogue/sdk-jogo';

export const limitar = (valor: number, min: number, max: number) => Math.min(max, Math.max(min, valor));

export const indiceEstagio = (estagio: Estagio) => ESTAGIOS.indexOf(estagio);

export function proximoEstagio(estagio: Estagio): Estagio | null {
  return ESTAGIOS[indiceEstagio(estagio) + 1] ?? null;
}

export function estagioAnterior(estagio: Estagio): Estagio | null {
  return ESTAGIOS[indiceEstagio(estagio) - 1] ?? null;
}

export const diaDe = (data: Date) => data.toISOString().slice(0, 10);

export function somarDias(data: Date, dias: number): Date {
  return new Date(data.getTime() + dias * 24 * 60 * 60 * 1000);
}
