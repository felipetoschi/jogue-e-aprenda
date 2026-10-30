import { embaralhar, type Rng } from './aleatorio';
import type { QuestaoGerada } from './tipos';

/** Uma alternativa errada candidata, para disciplinas cujas perguntas saem de tabelas de fatos. */
export interface Errada<T extends string = string> {
  texto: string;
  tipo: T;
  explicacao: string;
  /** Quanto menor, mais parecida com a certa e mais cedo ela é escolhida. */
  peso: number;
}

export interface Pergunta<T extends string = string> {
  enunciado: string;
  resolucao: string;
  certa: string;
  erradas: Errada<T>[];
}

/** Monta a pergunta com a certa e as (alternativas − 1) erradas mais parecidas com ela. */
export function montar<T extends string>(
  habilidadeId: string,
  p: Pergunta<T>,
  alternativas: number,
  rotulos: Record<T, string>,
  rng: Rng,
): QuestaoGerada {
  const usadas = new Set([p.certa]);
  const erradas: Errada<T>[] = [];
  // Embaralha antes de ordenar pelo peso: entre erradas igualmente parecidas, a escolha varia.
  for (const e of embaralhar(p.erradas, rng).sort((a, b) => a.peso - b.peso)) {
    if (erradas.length === alternativas - 1) break;
    if (usadas.has(e.texto)) continue;
    usadas.add(e.texto);
    erradas.push(e);
  }
  if (erradas.length < alternativas - 1) throw new Error(`Faltam alternativas em "${p.enunciado}"`);
  return {
    habilidadeId,
    enunciado: p.enunciado,
    resolucao: p.resolucao,
    opcoes: embaralhar(
      [
        { texto: p.certa, correta: true },
        ...erradas.map((e) => ({ texto: e.texto, correta: false, erro: { tipo: e.tipo, rotulo: rotulos[e.tipo], explicacao: e.explicacao } })),
      ],
      rng,
    ),
  };
}

/** Sorteia um item; com ajuste alto, os menos conhecidos (fama maior) saem mais. */
export function sortear<T extends { fama: number }>(itens: readonly T[], ajuste: number, rng: Rng): T {
  const pesos = itens.map((i) => 1 + ajuste * (i.fama - 1));
  let sorte = rng() * pesos.reduce((a, b) => a + b, 0);
  for (let i = 0; i < itens.length; i++) {
    sorte -= pesos[i]!;
    if (sorte < 0) return itens[i]!;
  }
  return itens.at(-1)!;
}
