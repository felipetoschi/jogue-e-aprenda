import type { Estagio } from '@jogue/sdk-jogo';
import type { Rng } from '../aleatorio';
import { montar, sortear, type Errada as ErradaBase, type Pergunta as PerguntaBase } from '../alternativas';
import type { QuestaoGerada } from '../tipos';
import { FATOS_BRASIL, FATOS_MUNDO, type Fato } from './dados';

/** Erros que as alternativas falsas imitam, para agrupar no perfil. */
type TipoErro = 'ano-proximo' | 'outro-fato' | 'fato-trocado' | 'ordem-trocada';

const ROTULOS_ERRO: Record<TipoErro, string> = {
  'ano-proximo': 'Ano próximo',
  'outro-fato': 'Ano de outro fato',
  'fato-trocado': 'Fato de outro ano',
  'ordem-trocada': 'Ordem trocada',
};

type Errada = ErradaBase<TipoErro>;
type Pergunta = PerguntaBase<TipoErro>;

/**
 * Distância, em anos, entre a certa e a errada em "Ano de…?". Diminui a cada estágio:
 * no Básico, 1888 contra 1858; no Mestre, 1888 contra 1889.
 */
const DISTANCIA: Record<Estagio, { min: number; max: number }> = {
  basico: { min: 10, max: 40 },
  intermediario: { min: 4, max: 15 },
  avancado: { min: 2, max: 8 },
  mestre: { min: 1, max: 4 },
};

/** Último ano que pode aparecer como alternativa: nenhuma errada no futuro. */
const ANO_LIMITE = 2025;

const doFato = (f: Fato) => `${f.ano} é o ano ${f.de} ${f.nome}.`;

/** "Ano da Lei Áurea?": as erradas são anos de outros fatos próximos ou anos vizinhos. */
function anoDoFato(f: Fato, todos: Fato[], estagio: Estagio): Pergunta {
  const { min, max } = DISTANCIA[estagio];
  const dentro = (ano: number) => {
    const d = Math.abs(ano - f.ano);
    return d >= min && d <= max && ano <= ANO_LIMITE;
  };
  // O ano de outro fato é a errada mais instrutiva: confundir a Lei Áurea (1888) com a República (1889).
  const deOutros: Errada[] = todos
    .filter((o) => o.ano !== f.ano && dentro(o.ano))
    .map((o) => ({ texto: String(o.ano), tipo: 'outro-fato', explicacao: `${doFato(o)} ${doFato(f)}`, peso: 0 }));
  const vizinhos: Errada[] = [];
  for (let d = min; d <= max; d++) {
    for (const ano of [f.ano - d, f.ano + d]) {
      if (dentro(ano)) vizinhos.push({ texto: String(ano), tipo: 'ano-proximo', explicacao: `Quase! ${doFato(f)}`, peso: 1 });
    }
  }
  return {
    enunciado: `Ano ${f.de} ${f.nome}?`,
    resolucao: `${f.curto}: ${f.ano}`,
    certa: String(f.ano),
    erradas: [...deOutros, ...vizinhos],
  };
}

/** "O que houve em 1822?": as erradas são fatos de anos próximos. */
function fatoDoAno(f: Fato, todos: Fato[]): Pergunta {
  return {
    enunciado: `O que houve em ${f.ano}?`,
    resolucao: `${f.ano}: ${f.curto}`,
    certa: f.curto,
    erradas: todos
      .filter((o) => o.ano !== f.ano)
      .map((o) => ({ texto: o.curto, tipo: 'fato-trocado', explicacao: `${doFato(o)} ${doFato(f)}`, peso: Math.abs(o.ano - f.ano) })),
  };
}

/** "Qual veio primeiro?": a certa é o fato mais antigo; as erradas, fatos logo depois dele. */
function qualVeioPrimeiro(f: Fato, depois: Fato[]): Pergunta {
  return {
    enunciado: 'Qual veio primeiro?',
    resolucao: `${f.curto} (${f.ano}) veio antes`,
    certa: f.curto,
    erradas: depois.map((o) => ({
      texto: o.curto,
      tipo: 'ordem-trocada',
      explicacao: `${doFato(f)} ${o.curto} veio depois, em ${o.ano}.`,
      peso: o.ano - f.ano,
    })),
  };
}

/** Fatos que aparecem no estágio: os conhecidos no Básico, todos depois. */
const fatosDoEstagio = (fatos: Fato[], estagio: Estagio) => (estagio === 'basico' ? fatos.filter((f) => f.fama <= 2) : fatos);

function perguntaDeDatas(fatos: Fato[], estagio: Estagio, ajuste: number, alternativas: number, rng: Rng): Pergunta {
  const doEstagio = fatosDoEstagio(fatos, estagio);
  const f = sortear(doEstagio, ajuste, rng);
  const cara = rng() < 0.5;
  switch (estagio) {
    case 'basico':
    case 'intermediario':
      return anoDoFato(f, doEstagio, estagio);
    case 'avancado':
      return cara ? fatoDoAno(f, doEstagio) : anoDoFato(f, doEstagio, estagio);
    case 'mestre': {
      // O fato mais recente não tem nada depois dele: aí a pergunta vira "Ano de…?".
      const depois = doEstagio.filter((o) => o.ano > f.ano);
      return cara && depois.length >= alternativas - 1 ? qualVeioPrimeiro(f, depois) : anoDoFato(f, doEstagio, estagio);
    }
  }
}

const TEMAS: Record<string, Fato[]> = {
  'datas-brasil': FATOS_BRASIL,
  'datas-mundo': FATOS_MUNDO,
};

/** Uma pergunta de História no formato comum a todos os jogos. */
export function questaoDeHistoria(habilidadeId: string, estagio: Estagio, ajuste: number, alternativas: number, rng: Rng): QuestaoGerada {
  if (habilidadeId === 'todas-datas') {
    const tema = rng() < 0.5 ? 'datas-brasil' : 'datas-mundo';
    // O acerto conta para "Brasil e mundo", a habilidade escolhida na partida.
    return { ...questaoDeHistoria(tema, estagio, ajuste, alternativas, rng), habilidadeId };
  }
  const fatos = TEMAS[habilidadeId];
  if (!fatos) throw new Error(`Habilidade de História desconhecida: ${habilidadeId}`);
  return montar(habilidadeId, perguntaDeDatas(fatos, estagio, ajuste, alternativas, rng), alternativas, ROTULOS_ERRO, rng);
}
