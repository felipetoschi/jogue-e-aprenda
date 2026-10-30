import type { Estagio } from '@jogue/sdk-jogo';
import { embaralhar, inteiro, type Rng } from '../aleatorio';

/** Erros comuns que as opções falsas imitam (plano, aba do jogo, "Respostas falsas"). */
export type TipoErro =
  | 'vizinho-tabuada'
  | 'por-pouco'
  | 'operacao-trocada'
  | 'digitos-invertidos'
  | 'sem-reserva'
  | 'sinal-trocado';

export interface Opcao {
  valor: number;
  correta: boolean;
  /** Que erro a opção imita; null na correta. */
  tipoErro: TipoErro | null;
}

export interface Conta {
  habilidadeId: string;
  /** Texto exibido, ex.: "7 × 8". */
  texto: string;
  resposta: number;
  opcoes: Opcao[];
}

interface Candidato {
  valor: number;
  tipo: TipoErro;
}

interface ContaBruta {
  texto: string;
  resposta: number;
  candidatos: Candidato[];
}

/** Arredonda para evitar ruído de ponto flutuante (0,1 + 0,2). */
const arred = (n: number) => Math.round(n * 1000) / 1000;

const FORMATO = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 3 });

export function formatarNumero(n: number): string {
  const texto = FORMATO.format(Math.abs(n));
  return n < 0 ? `−${texto}` : texto;
}

/**
 * Sorteia um inteiro na faixa, deslocado pelo ajuste fino:
 * com ajuste 0 cai na parte baixa da faixa, com ajuste 1 na parte alta.
 */
function naFaixa(min: number, max: number, ajuste: number, rng: Rng): number {
  const amplitude = max - min;
  const lo = Math.round(min + amplitude * 0.4 * ajuste);
  const hi = Math.round(min + amplitude * (0.6 + 0.4 * ajuste));
  return inteiro(lo, Math.max(lo, hi), rng);
}

function inverterDigitos(n: number): number | null {
  if (!Number.isInteger(n) || Math.abs(n) < 10) return null;
  const invertido = Number(String(Math.abs(n)).split('').reverse().join(''));
  return invertido === Math.abs(n) ? null : Math.sign(n) * invertido;
}

/** Soma dígito a dígito sem o "vai um" (37 + 48 → 75). */
function somaSemVaiUm(a: number, b: number): number {
  let resultado = 0;
  for (let casa = 1; a > 0 || b > 0; casa *= 10) {
    resultado += (((a % 10) + (b % 10)) % 10) * casa;
    a = Math.floor(a / 10);
    b = Math.floor(b / 10);
  }
  return resultado;
}

/** Subtração dígito a dígito pegando sempre o maior menos o menor (52 − 27 → 35). */
function subtracaoSemEmprestimo(a: number, b: number): number {
  let resultado = 0;
  for (let casa = 1; a > 0 || b > 0; casa *= 10) {
    resultado += Math.abs((a % 10) - (b % 10)) * casa;
    a = Math.floor(a / 10);
    b = Math.floor(b / 10);
  }
  return resultado;
}

function temVaiUm(a: number, b: number): boolean {
  return somaSemVaiUm(a, b) !== a + b;
}

function temEmprestimo(a: number, b: number): boolean {
  return subtracaoSemEmprestimo(a, b) !== a - b;
}

function adicao(estagio: Estagio, ajuste: number, rng: Rng): ContaBruta {
  let a: number;
  let b: number;
  switch (estagio) {
    case 'basico':
      a = naFaixa(1, 8, ajuste, rng);
      b = inteiro(1, 10 - a, rng);
      break;
    case 'intermediario': {
      const dezA = naFaixa(1, 7, ajuste, rng);
      const dezB = inteiro(1, 8 - dezA, rng);
      const uniA = inteiro(0, 9, rng);
      a = dezA * 10 + uniA;
      b = dezB * 10 + inteiro(0, 9 - uniA, rng);
      break;
    }
    case 'avancado':
      do {
        a = naFaixa(100, 499, ajuste, rng);
        b = naFaixa(100, 499, ajuste, rng);
      } while (!temVaiUm(a, b));
      break;
    case 'mestre':
      a = naFaixa(100, 999, ajuste, rng) / 100;
      b = inteiro(10, 99, rng) / 10;
      break;
  }
  const resposta = arred(a + b);
  const candidatos: Candidato[] = [{ valor: arred(Math.abs(a - b)), tipo: 'operacao-trocada' }];
  if (Number.isInteger(a) && Number.isInteger(b) && temVaiUm(a, b)) {
    candidatos.push({ valor: somaSemVaiUm(a, b), tipo: 'sem-reserva' });
  }
  return { texto: `${formatarNumero(a)} + ${formatarNumero(b)}`, resposta, candidatos };
}

function subtracao(estagio: Estagio, ajuste: number, rng: Rng): ContaBruta {
  let a: number;
  let b: number;
  switch (estagio) {
    case 'basico':
      a = naFaixa(2, 10, ajuste, rng);
      b = inteiro(1, a - 1, rng);
      break;
    case 'intermediario': {
      const dezA = naFaixa(2, 9, ajuste, rng);
      const uniA = inteiro(0, 9, rng);
      a = dezA * 10 + uniA;
      b = inteiro(1, dezA - 1, rng) * 10 + inteiro(0, uniA, rng);
      break;
    }
    case 'avancado':
      do {
        a = naFaixa(200, 999, ajuste, rng);
        b = inteiro(100, a - 1, rng);
      } while (!temEmprestimo(a, b));
      break;
    case 'mestre':
      a = naFaixa(1, 9, ajuste, rng);
      b = inteiro(a + 1, a + 9, rng) + (rng() < 0.5 ? 0.5 : 0);
      break;
  }
  const resposta = arred(a - b);
  const candidatos: Candidato[] = [{ valor: arred(a + b), tipo: 'operacao-trocada' }];
  if (resposta < 0) candidatos.push({ valor: -resposta, tipo: 'sinal-trocado' });
  if (Number.isInteger(a) && Number.isInteger(b) && resposta >= 0 && temEmprestimo(a, b)) {
    candidatos.push({ valor: subtracaoSemEmprestimo(a, b), tipo: 'sem-reserva' });
  }
  return { texto: `${formatarNumero(a)} − ${formatarNumero(b)}`, resposta, candidatos };
}

function multiplicacao(estagio: Estagio, ajuste: number, rng: Rng): ContaBruta {
  let a: number;
  let b: number;
  switch (estagio) {
    case 'basico':
      a = naFaixa(1, 5, ajuste, rng);
      b = inteiro(1, 10, rng);
      break;
    case 'intermediario':
      a = naFaixa(2, 10, ajuste, rng);
      b = inteiro(2, 10, rng);
      break;
    case 'avancado':
      a = naFaixa(12, 99, ajuste, rng);
      b = inteiro(2, 9, rng);
      break;
    case 'mestre':
      a = naFaixa(11, 99, ajuste, rng);
      b = naFaixa(11, 99, ajuste, rng);
      break;
  }
  const resposta = a * b;
  const candidatos: Candidato[] = [
    { valor: a * (b + 1), tipo: 'vizinho-tabuada' },
    { valor: a * (b - 1), tipo: 'vizinho-tabuada' },
    { valor: (a + 1) * b, tipo: 'vizinho-tabuada' },
    { valor: a + b, tipo: 'operacao-trocada' },
  ];
  const invertido = inverterDigitos(resposta);
  if (invertido !== null) candidatos.push({ valor: invertido, tipo: 'digitos-invertidos' });
  return { texto: `${a} × ${b}`, resposta, candidatos };
}

function divisao(estagio: Estagio, ajuste: number, rng: Rng): ContaBruta {
  let divisor: number;
  let dividendo: number;
  switch (estagio) {
    case 'basico':
      divisor = naFaixa(1, 5, ajuste, rng);
      dividendo = divisor * inteiro(1, 10, rng);
      break;
    case 'intermediario':
      divisor = naFaixa(2, 10, ajuste, rng);
      dividendo = divisor * inteiro(2, 10, rng);
      break;
    case 'avancado':
      divisor = inteiro(2, 9, rng);
      dividendo = divisor * naFaixa(Math.ceil(100 / divisor), Math.floor(999 / divisor), ajuste, rng);
      break;
    case 'mestre': {
      const divisores = [2, 4, 5, 8];
      divisor = divisores[inteiro(0, divisores.length - 1, rng)]!;
      do {
        dividendo = naFaixa(3, 40, ajuste, rng);
      } while (dividendo % divisor === 0);
      break;
    }
  }
  const resposta = arred(dividendo / divisor);
  const candidatos: Candidato[] = [{ valor: dividendo - divisor, tipo: 'operacao-trocada' }];
  if (Number.isInteger(resposta)) {
    candidatos.push({ valor: resposta + 1, tipo: 'vizinho-tabuada' }, { valor: resposta - 1, tipo: 'vizinho-tabuada' });
  } else {
    candidatos.push({ valor: Math.floor(resposta), tipo: 'por-pouco' });
  }
  const invertido = inverterDigitos(resposta);
  if (invertido !== null) candidatos.push({ valor: invertido, tipo: 'digitos-invertidos' });
  return { texto: `${dividendo} ÷ ${divisor}`, resposta, candidatos };
}

const GERADORES: Record<string, (estagio: Estagio, ajuste: number, rng: Rng) => ContaBruta> = {
  adicao,
  subtracao,
  multiplicacao,
  divisao,
};

export const HABILIDADES_SUPORTADAS = Object.keys(GERADORES);

/** Erros "por pouco", usados para completar as opções: ±1, ±2… na casa mais baixa do resultado. */
function porPouco(resposta: number): Candidato[] {
  const casas = (String(resposta).split('.')[1] ?? '').length;
  const unidade = casas === 0 ? 1 : 10 ** -Math.min(casas, 2);
  return [1, -1, 2, -2, 10, -10, 3, -3, 5, -5].map((passo) => ({ valor: arred(resposta + passo * unidade), tipo: 'por-pouco' }));
}

/** Distância máxima entre uma errada e a certa: 25% da resposta, e no mínimo 2 casas da unidade mais baixa. */
export const DISTANCIA_MAXIMA = 0.25;

/** A errada está perto o bastante da certa para não dar para descartar só de olhar. */
export function perto(valor: number, resposta: number): boolean {
  const casas = (String(resposta).split('.')[1] ?? '').length;
  const unidade = casas === 0 ? 1 : 10 ** -Math.min(casas, 2);
  return Math.abs(valor - resposta) <= Math.max(2 * unidade, Math.abs(resposta) * DISTANCIA_MAXIMA) + 1e-9;
}

const ERROS_PROXIMOS: TipoErro[] = ['por-pouco', 'vizinho-tabuada', 'digitos-invertidos'];

/**
 * Gera uma conta com uma opção certa e (quantidade − 1) falsas.
 * As falsas são sempre próximas da certa (mesmo número de algarismos e no máximo 25% de distância);
 * entre elas, com ajuste alto, preferem os erros mais parecidos com o resultado.
 */
export function gerarConta(habilidadeId: string, estagio: Estagio, ajuste: number, quantidade: number, rng: Rng): Conta {
  const gerador = GERADORES[habilidadeId];
  if (!gerador) throw new Error(`Habilidade não suportada: ${habilidadeId}`);
  const bruta = gerador(estagio, ajuste, rng);
  const tamanhoResposta = formatarNumero(bruta.resposta).length;
  const permiteNegativo = bruta.resposta < 0;

  const proximosPrimeiro = ajuste >= 0.5;
  const prioridade = (c: Candidato) => (ERROS_PROXIMOS.includes(c.tipo) === proximosPrimeiro ? 0 : 1);
  // Errada longe da certa (outro número de algarismos ou distância grande) entrega a resposta: vai para o fim da fila.
  const longe = (c: Candidato) => Number(formatarNumero(c.valor).length !== tamanhoResposta || !perto(c.valor, bruta.resposta));
  const candidatos = [...embaralhar(bruta.candidatos, rng), ...porPouco(bruta.resposta)]
    .map((c, ordem) => ({ c, ordem, longe: longe(c) }))
    .sort((x, y) => x.longe - y.longe || prioridade(x.c) - prioridade(y.c) || x.ordem - y.ordem)
    .map(({ c }) => c);

  const falsas: Opcao[] = [];
  const usados = new Set([bruta.resposta]);
  for (const c of candidatos) {
    if (falsas.length === quantidade - 1) break;
    if (usados.has(c.valor) || (c.valor < 0 && !permiteNegativo)) continue;
    usados.add(c.valor);
    falsas.push({ valor: c.valor, correta: false, tipoErro: c.tipo });
  }

  return {
    habilidadeId,
    texto: bruta.texto,
    resposta: bruta.resposta,
    opcoes: embaralhar([{ valor: bruta.resposta, correta: true, tipoErro: null }, ...falsas], rng),
  };
}

const ROTULOS_ERRO: Record<TipoErro, string> = {
  'vizinho-tabuada': 'Vizinho da tabuada',
  'por-pouco': 'Errou por pouco',
  'operacao-trocada': 'Operação trocada',
  'digitos-invertidos': 'Dígitos invertidos',
  'sem-reserva': 'Esqueceu o "vai um" ou o empréstimo',
  'sinal-trocado': 'Sinal trocado',
};

/** Explica, numa frase, o erro que a opção escolhida imita. */
export function explicarErro(conta: Conta, valor: number, tipo: TipoErro): { rotulo: string; explicacao: string } {
  const v = formatarNumero(valor);
  const certa = `${conta.texto} = ${formatarNumero(conta.resposta)}`;
  const explicacoes: Record<TipoErro, string> = {
    'vizinho-tabuada': `${v} é o resultado vizinho na tabuada. ${certa}.`,
    'por-pouco': `Quase! ${v} ficou perto, mas ${certa}.`,
    'operacao-trocada': `${v} é o resultado de outra operação. ${certa}.`,
    'digitos-invertidos': `${v} tem os algarismos da resposta trocados de lugar. ${certa}.`,
    'sem-reserva': `${v} é o que dá esquecendo o "vai um" ou o empréstimo entre as casas. ${certa}.`,
    'sinal-trocado': `${v} está com o sinal trocado: o número maior está sendo subtraído. ${certa}.`,
  };
  return { rotulo: ROTULOS_ERRO[tipo], explicacao: explicacoes[tipo] };
}
