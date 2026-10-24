import type { Habilidade } from '../tipos';

/** Árvore de habilidades de Matemática (plano, aba do jogo, "Habilidades e estágios"). */
export const HABILIDADES_MATEMATICA: Habilidade[] = [
  {
    id: 'adicao',
    nome: 'Adição',
    materiaId: 'matematica',
    formato: 'resposta-curta',
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
    formato: 'resposta-curta',
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
    formato: 'resposta-curta',
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
    formato: 'resposta-curta',
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
    id: 'todas-operacoes',
    nome: 'Todas as operações',
    materiaId: 'matematica',
    formato: 'resposta-curta',
    estagioInicial: 'basico',
    // Aberta desde o início: mistura as quatro operações no nível escolhido.
    prerequisitos: [],
    estagios: {
      basico: 'As quatro operações, com números pequenos',
      intermediario: 'As quatro operações, até 100 e tabuada do 10',
      avancado: 'As quatro operações, com números maiores',
      mestre: 'As quatro operações, com decimais',
    },
  },
  {
    id: 'expressoes',
    nome: 'Expressões',
    materiaId: 'matematica',
    formato: 'resposta-curta',
    estagioInicial: 'basico',
    prerequisitos: [
      { habilidadeId: 'adicao', estagio: 'intermediario' },
      { habilidadeId: 'subtracao', estagio: 'intermediario' },
      { habilidadeId: 'multiplicacao', estagio: 'intermediario' },
      { habilidadeId: 'divisao', estagio: 'intermediario' },
    ],
    estagios: {
      basico: 'Duas somas seguidas',
      intermediario: 'Duas operações de + e −',
      avancado: 'Com × e ÷, ordem das operações',
      mestre: 'Com parênteses',
    },
  },
];
