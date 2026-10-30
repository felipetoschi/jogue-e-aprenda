export type Rng = () => number;

/** Inteiro entre min e max, inclusivos. */
export const inteiro = (min: number, max: number, rng: Rng) => Math.floor(rng() * (max - min + 1)) + min;

export function embaralhar<T>(itens: readonly T[], rng: Rng): T[] {
  const r = [...itens];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [r[i], r[j]] = [r[j]!, r[i]!];
  }
  return r;
}

/** Gerador com semente, para testes reproduzíveis. */
export function comSemente(semente: number): Rng {
  let a = semente >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
