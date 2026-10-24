import { PARAMETROS, SELOS } from './parametros';
import { estadoDe } from './perfil';
import type { DefinicaoHabilidade, EstadoHabilidade, PerfilProgresso, Prerequisito, Selo } from './tipos';
import { indiceEstagio } from './util';

/** Pré-requisitos que ainda faltam para a habilidade abrir. Vazio = desbloqueada. */
export function prerequisitosPendentes(
  perfil: PerfilProgresso,
  def: DefinicaoHabilidade,
  todas: DefinicaoHabilidade[],
): Prerequisito[] {
  return def.prerequisitos.filter((p) => {
    const defPre = todas.find((h) => h.id === p.habilidadeId);
    if (!defPre) return true;
    return indiceEstagio(estadoDe(perfil, defPre).estagio) < indiceEstagio(p.estagio);
  });
}

export function estaDesbloqueada(perfil: PerfilProgresso, def: DefinicaoHabilidade, todas: DefinicaoHabilidade[]) {
  return prerequisitosPendentes(perfil, def, todas).length === 0;
}

/** Pontos possíveis numa habilidade: um por estágio a superar, mais o domínio completo no Mestre. */
export const pontosMaximos = (def: DefinicaoHabilidade) => 4 - indiceEstagio(def.estagioInicial);

/** Um ponto por estágio superado desde o inicial, e mais um pelo domínio completo no Mestre. */
export function pontosDominio(estado: EstadoHabilidade, def: DefinicaoHabilidade): number {
  const superados = indiceEstagio(estado.estagio) - indiceEstagio(def.estagioInicial);
  const dominio = estado.estagio === 'mestre' && estado.maestria >= PARAMETROS.maestria.dominioCompleto ? 1 : 0;
  return superados + dominio;
}

/** Fração (0 a 1) da matéria já dominada. */
export function progressoMateria(perfil: PerfilProgresso, habilidadesDaMateria: DefinicaoHabilidade[]): number {
  const maximo = habilidadesDaMateria.reduce((total, def) => total + pontosMaximos(def), 0);
  if (maximo === 0) return 0;
  const soma = habilidadesDaMateria.reduce((total, def) => total + pontosDominio(estadoDe(perfil, def), def), 0);
  return soma / maximo;
}

export function seloPorProgresso(progresso: number): Selo | null {
  return SELOS.find((s) => progresso >= s.minimo)?.selo ?? null;
}

const ORDEM_SELOS: Selo[] = ['bronze', 'prata', 'ouro', 'diamante'];

export function melhorSelo(a: Selo | null | undefined, b: Selo | null | undefined): Selo | null {
  const ia = a ? ORDEM_SELOS.indexOf(a) : -1;
  const ib = b ? ORDEM_SELOS.indexOf(b) : -1;
  return (ORDEM_SELOS[Math.max(ia, ib)] as Selo | undefined) ?? null;
}
