import type { DefinicaoHabilidade } from '@jogue/progressao';
import type { Estagio } from '@jogue/sdk-jogo';

export interface Materia {
  id: string;
  nome: string;
}

export const MATERIAS: Materia[] = [{ id: 'matematica', nome: 'Matemática' }];

export interface Habilidade extends DefinicaoHabilidade {
  /** O que cada estágio cobra, para mostrar no mapa. */
  estagios: Partial<Record<Estagio, string>>;
}

/** Árvore de habilidades de Matemática (plano, aba do jogo, "Habilidades e estágios"). */
export const HABILIDADES: Habilidade[] = [
  {
    id: 'adicao',
    nome: 'Adição',
    materiaId: 'matematica',
    estagioInicial: 'basico',
    prerequisitos: [],
    estagios: {
      basico: 'Até 10',
      intermediario: 'Até 100, sem "vai um"',
      avancado: 'Até 1.000, com "vai um"',
      mestre: 'Decimais',
    },
  },
  {
    id: 'subtracao',
    nome: 'Subtração',
    materiaId: 'matematica',
    estagioInicial: 'basico',
    prerequisitos: [{ habilidadeId: 'adicao', estagio: 'intermediario' }],
    estagios: {
      basico: 'Até 10',
      intermediario: 'Até 100, sem empréstimo',
      avancado: 'Até 1.000, com empréstimo',
      mestre: 'Negativos e decimais',
    },
  },
  {
    id: 'multiplicacao',
    nome: 'Multiplicação',
    materiaId: 'matematica',
    estagioInicial: 'basico',
    prerequisitos: [],
    estagios: {
      basico: 'Tabuada do 1 ao 5',
      intermediario: 'Tabuada do 1 ao 10',
      avancado: '2 dígitos × 1 dígito',
      mestre: '2 dígitos × 2 dígitos',
    },
  },
  {
    id: 'divisao',
    nome: 'Divisão',
    materiaId: 'matematica',
    estagioInicial: 'basico',
    prerequisitos: [{ habilidadeId: 'multiplicacao', estagio: 'intermediario' }],
    estagios: {
      basico: 'Exata, tabuada do 1 ao 5',
      intermediario: 'Exata, tabuada do 1 ao 10',
      avancado: '3 dígitos ÷ 1 dígito',
      mestre: 'Com resultado decimal',
    },
  },
  {
    id: 'expressoes',
    nome: 'Expressões',
    materiaId: 'matematica',
    estagioInicial: 'intermediario',
    prerequisitos: [
      { habilidadeId: 'adicao', estagio: 'intermediario' },
      { habilidadeId: 'subtracao', estagio: 'intermediario' },
      { habilidadeId: 'multiplicacao', estagio: 'intermediario' },
      { habilidadeId: 'divisao', estagio: 'intermediario' },
    ],
    estagios: {
      intermediario: 'Duas operações de + e −',
      avancado: 'Com × e ÷, ordem das operações',
      mestre: 'Com parênteses',
    },
  },
];

export const habilidadePorId = (id: string) => HABILIDADES.find((h) => h.id === id);
export const materiaPorId = (id: string) => MATERIAS.find((m) => m.id === id);
