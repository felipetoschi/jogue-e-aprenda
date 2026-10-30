import type { Habilidade } from '../tipos';

/**
 * Habilidades (temas) de História: datas do Brasil e do mundo.
 * O que sobe de um estágio para o outro: fatos menos conhecidos, anos mais próximos e a pergunta ao contrário.
 */
const ESTAGIOS_DATAS: Habilidade['estagios'] = {
  basico: 'Fatos mais conhecidos, anos não tão próximos',
  intermediario: 'Mais fatos, anos mais próximos',
  avancado: 'O ano do fato e o fato do ano',
  mestre: 'Anos vizinhos e qual veio primeiro',
};

export const HABILIDADES_HISTORIA: Habilidade[] = [
  {
    id: 'datas-brasil',
    nome: 'Datas do Brasil',
    materiaId: 'historia',
    formato: 'resposta-curta',
    estagioInicial: 'basico',
    prerequisitos: [],
    estagios: ESTAGIOS_DATAS,
  },
  {
    id: 'datas-mundo',
    nome: 'Datas do mundo',
    materiaId: 'historia',
    formato: 'resposta-curta',
    estagioInicial: 'basico',
    prerequisitos: [],
    estagios: ESTAGIOS_DATAS,
  },
  {
    id: 'todas-datas',
    nome: 'Brasil e mundo',
    materiaId: 'historia',
    formato: 'resposta-curta',
    estagioInicial: 'basico',
    // Mistura as datas do Brasil e do mundo no nível escolhido.
    prerequisitos: [],
    estagios: ESTAGIOS_DATAS,
  },
];
