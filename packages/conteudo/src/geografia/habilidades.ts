import type { Habilidade } from '../tipos';

/**
 * Habilidades (temas) de Geografia. Todas abertas desde o início; só os estágios de cada uma sobem um a um.
 * O que sobe de um estágio para o outro: lugares menos conhecidos, grupo maior e pergunta ao contrário.
 */
export const HABILIDADES_GEOGRAFIA: Habilidade[] = [
  {
    id: 'estados-capitais',
    nome: 'Estados e capitais',
    materiaId: 'geografia',
    formato: 'resposta-curta',
    estagioInicial: 'basico',
    prerequisitos: [],
    estagios: {
      basico: 'Capitais dos estados mais conhecidos',
      intermediario: 'Capitais dos 26 estados e do DF',
      avancado: 'Capital → estado, e o contrário',
      mestre: 'Capitais e siglas, nos dois sentidos',
    },
  },
  {
    id: 'regioes-brasil',
    nome: 'Regiões do Brasil',
    materiaId: 'geografia',
    formato: 'resposta-curta',
    estagioInicial: 'basico',
    prerequisitos: [],
    estagios: {
      basico: 'Região dos estados mais conhecidos',
      intermediario: 'Região de todos os estados',
      avancado: 'Região de estados e capitais',
      mestre: 'Qual estado fica em cada região',
    },
  },
  {
    id: 'paises-capitais',
    nome: 'Países e capitais',
    materiaId: 'geografia',
    formato: 'resposta-curta',
    estagioInicial: 'basico',
    prerequisitos: [],
    estagios: {
      basico: 'Países mais conhecidos',
      intermediario: 'Américas e Europa',
      avancado: 'Ásia, África e Oceania, nos dois sentidos',
      mestre: 'Mundo todo, com pegadinhas',
    },
  },
  {
    id: 'continentes',
    nome: 'Continentes',
    materiaId: 'geografia',
    formato: 'resposta-curta',
    estagioInicial: 'basico',
    prerequisitos: [],
    estagios: {
      basico: 'Continente dos países mais conhecidos',
      intermediario: 'Continente de todos os países',
      avancado: 'Continente de países e capitais',
      mestre: 'Qual país fica em cada continente',
    },
  },
  {
    id: 'todos-temas-geografia',
    nome: 'Todos os temas',
    materiaId: 'geografia',
    formato: 'resposta-curta',
    estagioInicial: 'basico',
    // Mistura os quatro temas no nível escolhido.
    prerequisitos: [],
    estagios: {
      basico: 'Os quatro temas, com os lugares mais conhecidos',
      intermediario: 'Os quatro temas, com mais lugares',
      avancado: 'Os quatro temas, nos dois sentidos',
      mestre: 'Os quatro temas, com pegadinhas',
    },
  },
];
