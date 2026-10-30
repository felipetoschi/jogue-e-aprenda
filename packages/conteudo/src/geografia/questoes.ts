import type { Estagio } from '@jogue/sdk-jogo';
import type { Rng } from '../aleatorio';
import { montar, sortear, type Errada as ErradaBase, type Pergunta as PerguntaBase } from '../alternativas';
import type { QuestaoGerada } from '../tipos';
import {
  CONTINENTE_DA_REGIAO,
  CONTINENTES,
  ESTADOS,
  PAISES,
  REGIOES_BRASIL,
  REGIOES_VIZINHAS,
  type Continente,
  type Estado,
  type Fama,
  type Pais,
} from './dados';

/** Erros que as alternativas falsas imitam, para agrupar no perfil. */
type TipoErro =
  | 'capital-trocada'
  | 'cidade-famosa'
  | 'estado-trocado'
  | 'sigla-trocada'
  | 'regiao-trocada'
  | 'continente-trocado'
  | 'pais-trocado';

const ROTULOS_ERRO: Record<TipoErro, string> = {
  'capital-trocada': 'Capital de outro lugar',
  'cidade-famosa': 'Cidade famosa, não a capital',
  'estado-trocado': 'Estado trocado',
  'sigla-trocada': 'Sigla trocada',
  'regiao-trocada': 'Região trocada',
  'continente-trocado': 'Continente trocado',
  'pais-trocado': 'País trocado',
};

type Errada = ErradaBase<TipoErro>;
type Pergunta = PerguntaBase<TipoErro>;

/** Continentes vizinhos, para a errada ser uma confusão plausível. */
const CONTINENTES_VIZINHOS: Record<Continente, Continente[]> = {
  América: ['Europa', 'Oceania'],
  Europa: ['Ásia', 'África'],
  Ásia: ['Europa', 'Oceania', 'África'],
  África: ['Europa', 'Ásia'],
  Oceania: ['Ásia', 'América'],
};

const cara = (rng: Rng) => rng() < 0.5;

// ——— Estados e capitais do Brasil ———

/** Fama parecida pesa junto com a distância: "Capital do Piauí?" com Salvador ao lado seria fácil demais. */
const diferencaDeFama = (a: { fama: Fama }, b: { fama: Fama }) => Math.abs(a.fama - b.fama);

const pertoNoBrasil = (a: Estado, b: Estado) =>
  2 * (a.regiao === b.regiao ? 0 : REGIOES_VIZINHAS[a.regiao].includes(b.regiao) ? 1 : 2) + diferencaDeFama(a, b);

function capitalDoEstado(e: Estado, outros: Estado[]): Pergunta {
  return {
    enunciado: `Capital ${e.de} ${e.nome}?`,
    resolucao: `Capital ${e.de} ${e.nome}: ${e.capital}`,
    certa: e.capital,
    erradas: outros.map((o) => ({
      texto: o.capital,
      tipo: 'capital-trocada',
      explicacao: `${o.capital} é a capital ${o.de} ${o.nome}. A capital ${e.de} ${e.nome} é ${e.capital}.`,
      peso: pertoNoBrasil(e, o),
    })),
  };
}

function estadoDaCapital(e: Estado, outros: Estado[]): Pergunta {
  return {
    enunciado: `${e.capital} é capital de?`,
    resolucao: `${e.capital} é a capital ${e.de} ${e.nome}`,
    certa: e.nome,
    erradas: outros.map((o) => ({
      texto: o.nome,
      tipo: 'estado-trocado',
      explicacao: `A capital ${o.de} ${o.nome} é ${o.capital}. ${e.capital} é a capital ${e.de} ${e.nome}.`,
      peso: pertoNoBrasil(e, o),
    })),
  };
}

/** Siglas parecidas (mesma letra inicial) confundem mais: AM, AP, AC, AL. */
const pesoSigla = (a: Estado, b: Estado) => (a.sigla[0] === b.sigla[0] ? 0 : a.regiao === b.regiao ? 1 : 2);

function siglaDoEstado(e: Estado, outros: Estado[]): Pergunta {
  return {
    enunciado: `Sigla ${e.de} ${e.nome}?`,
    resolucao: `Sigla ${e.de} ${e.nome}: ${e.sigla}`,
    certa: e.sigla,
    erradas: outros.map((o) => ({
      texto: o.sigla,
      tipo: 'sigla-trocada',
      explicacao: `${o.sigla} é a sigla ${o.de} ${o.nome}. A sigla ${e.de} ${e.nome} é ${e.sigla}.`,
      peso: pesoSigla(e, o),
    })),
  };
}

function estadoDaSigla(e: Estado, outros: Estado[]): Pergunta {
  return {
    enunciado: `Estado da sigla ${e.sigla}?`,
    resolucao: `${e.sigla} é a sigla ${e.de} ${e.nome}`,
    certa: e.nome,
    erradas: outros.map((o) => ({
      texto: o.nome,
      tipo: 'sigla-trocada',
      explicacao: `A sigla ${o.de} ${o.nome} é ${o.sigla}. ${e.sigla} é ${e.nome}.`,
      peso: pesoSigla(e, o),
    })),
  };
}

/** Estados que aparecem no estágio: os conhecidos no Básico, todos depois. */
const estadosDoEstagio = (estagio: Estagio) => (estagio === 'basico' ? ESTADOS.filter((e) => e.fama <= 2) : ESTADOS);
const outrosEstados = (e: Estado, estagio: Estagio) => estadosDoEstagio(estagio).filter((o) => o !== e);

function estadosECapitais(estagio: Estagio, ajuste: number, rng: Rng): Pergunta {
  const e = sortear(estadosDoEstagio(estagio), ajuste, rng);
  const outros = outrosEstados(e, estagio);
  // "São Paulo é capital de?" não é pergunta: a capital tem o nome do estado.
  const temVolta = e.capital !== e.nome;
  switch (estagio) {
    case 'basico':
    case 'intermediario':
      return capitalDoEstado(e, outros);
    case 'avancado':
      return temVolta && cara(rng) ? estadoDaCapital(e, outros) : capitalDoEstado(e, outros);
    case 'mestre': {
      const tipos = [capitalDoEstado, siglaDoEstado, estadoDaSigla, ...(temVolta ? [estadoDaCapital] : [])];
      return tipos[Math.floor(rng() * tipos.length)]!(e, outros);
    }
  }
}

// ——— Regiões do Brasil ———

const pesoRegiao = (certa: (typeof REGIOES_BRASIL)[number], errada: (typeof REGIOES_BRASIL)[number]) =>
  REGIOES_VIZINHAS[certa].includes(errada) ? 0 : 1;

function regiaoDoEstado(e: Estado): Pergunta {
  return {
    enunciado: `Região ${e.de} ${e.nome}?`,
    resolucao: `${e.nome} fica no ${e.regiao}`,
    certa: e.regiao,
    erradas: REGIOES_BRASIL.filter((r) => r !== e.regiao).map((r) => ({
      texto: r,
      tipo: 'regiao-trocada',
      explicacao: `${e.nome} fica no ${e.regiao}, não no ${r}.`,
      peso: pesoRegiao(e.regiao, r),
    })),
  };
}

function regiaoDaCapital(e: Estado): Pergunta {
  return {
    enunciado: `Região de ${e.capital}?`,
    resolucao: `${e.capital} (${e.sigla}) fica no ${e.regiao}`,
    certa: e.regiao,
    erradas: REGIOES_BRASIL.filter((r) => r !== e.regiao).map((r) => ({
      texto: r,
      tipo: 'regiao-trocada',
      explicacao: `${e.capital} é a capital ${e.de} ${e.nome}, que fica no ${e.regiao}, não no ${r}.`,
      peso: pesoRegiao(e.regiao, r),
    })),
  };
}

function estadoDaRegiao(e: Estado): Pergunta {
  return {
    enunciado: `Estado do ${e.regiao}?`,
    resolucao: `${e.nome} fica no ${e.regiao}`,
    certa: e.nome,
    erradas: ESTADOS.filter((o) => o.regiao !== e.regiao).map((o) => ({
      texto: o.nome,
      tipo: 'regiao-trocada',
      explicacao: `${o.nome} fica no ${o.regiao}. ${e.nome} é que fica no ${e.regiao}.`,
      peso: pesoRegiao(e.regiao, o.regiao),
    })),
  };
}

function regioesDoBrasil(estagio: Estagio, ajuste: number, rng: Rng): Pergunta {
  const e = sortear(estadosDoEstagio(estagio), ajuste, rng);
  switch (estagio) {
    case 'basico':
    case 'intermediario':
      return regiaoDoEstado(e);
    case 'avancado':
      return e.capital !== e.nome && cara(rng) ? regiaoDaCapital(e) : regiaoDoEstado(e);
    case 'mestre':
      return cara(rng) ? estadoDaRegiao(e) : e.capital !== e.nome ? regiaoDaCapital(e) : regiaoDoEstado(e);
  }
}

// ——— Países e capitais ———

const continente = (p: Pais) => CONTINENTE_DA_REGIAO[p.regiao];
const pertoNoMundo = (a: Pais, b: Pais) => 2 * (a.regiao === b.regiao ? 0 : continente(a) === continente(b) ? 1 : 2) + diferencaDeFama(a, b);

const PAISES_POR_ESTAGIO: Record<Estagio, (p: Pais) => boolean> = {
  basico: (p) => p.fama === 1,
  intermediario: (p) => continente(p) === 'América' || continente(p) === 'Europa',
  avancado: (p) => continente(p) !== 'América' && continente(p) !== 'Europa',
  mestre: () => true,
};

/** Erradas vêm de países tão conhecidos quanto os do estágio, para nenhuma ser descartada por ser estranha. */
const outrosPaises = (p: Pais, estagio: Estagio) =>
  PAISES.filter((o) => o !== p && (estagio === 'basico' ? o.fama <= 2 : estagio === 'intermediario' ? o.fama <= 2 || o.regiao === p.regiao : true));

function capitalDoPais(p: Pais, outros: Pais[], estagio: Estagio): Pergunta {
  const erradas: Errada[] = outros.map((o) => ({
    texto: o.capital,
    tipo: 'capital-trocada',
    explicacao: `${o.capital} é a capital ${o.de} ${o.nome}. A capital ${p.de} ${p.nome} é ${p.capital}.`,
    peso: pertoNoMundo(p, o),
  }));
  if (p.armadilha) {
    erradas.push({
      texto: p.armadilha,
      tipo: 'cidade-famosa',
      explicacao: `${p.armadilha} é uma cidade famosa ${p.de} ${p.nome}, mas a capital é ${p.capital}.`,
      // No Mestre, a pegadinha vem sempre.
      peso: estagio === 'mestre' ? -1 : 0,
    });
  }
  return { enunciado: `Capital ${p.de} ${p.nome}?`, resolucao: `Capital ${p.de} ${p.nome}: ${p.capital}`, certa: p.capital, erradas };
}

function paisDaCapital(p: Pais, outros: Pais[]): Pergunta {
  return {
    enunciado: `${p.capital} é capital de?`,
    resolucao: `${p.capital} é a capital ${p.de} ${p.nome}`,
    certa: p.nome,
    erradas: outros.map((o) => ({
      texto: o.nome,
      tipo: 'pais-trocado',
      explicacao: `A capital ${o.de} ${o.nome} é ${o.capital}. ${p.capital} é a capital ${p.de} ${p.nome}.`,
      peso: pertoNoMundo(p, o),
    })),
  };
}

function paisesECapitais(estagio: Estagio, ajuste: number, rng: Rng): Pergunta {
  const p = sortear(PAISES.filter(PAISES_POR_ESTAGIO[estagio]), ajuste, rng);
  const outros = outrosPaises(p, estagio);
  const volta = (estagio === 'avancado' || estagio === 'mestre') && cara(rng);
  return volta ? paisDaCapital(p, outros) : capitalDoPais(p, outros, estagio);
}

// ——— Continentes ———

const pesoContinente = (certo: Continente, errado: Continente) => (CONTINENTES_VIZINHOS[certo].includes(errado) ? 0 : 1);

function continenteDoPais(p: Pais): Pergunta {
  const certo = continente(p);
  return {
    enunciado: `Continente ${p.de} ${p.nome}?`,
    resolucao: `${p.nome} fica na ${certo}`,
    certa: certo,
    erradas: CONTINENTES.filter((c) => c !== certo).map((c) => ({
      texto: c,
      tipo: 'continente-trocado',
      explicacao: `${p.nome} fica na ${certo}, não na ${c}.`,
      peso: pesoContinente(certo, c),
    })),
  };
}

function continenteDaCapital(p: Pais): Pergunta {
  const certo = continente(p);
  return {
    enunciado: `Continente de ${p.capital}?`,
    resolucao: `${p.capital}, capital ${p.de} ${p.nome}, fica na ${certo}`,
    certa: certo,
    erradas: CONTINENTES.filter((c) => c !== certo).map((c) => ({
      texto: c,
      tipo: 'continente-trocado',
      explicacao: `${p.capital} é a capital ${p.de} ${p.nome}, que fica na ${certo}, não na ${c}.`,
      peso: pesoContinente(certo, c),
    })),
  };
}

function paisDoContinente(p: Pais, candidatos: Pais[]): Pergunta {
  const certo = continente(p);
  return {
    enunciado: `País da ${certo}?`,
    resolucao: `${p.nome} fica na ${certo}`,
    certa: p.nome,
    erradas: candidatos
      .filter((o) => continente(o) !== certo)
      .map((o) => ({
        texto: o.nome,
        tipo: 'continente-trocado',
        explicacao: `${o.nome} fica na ${continente(o)}. ${p.nome} é que fica na ${certo}.`,
        peso: pesoContinente(certo, continente(o)),
      })),
  };
}

function continentes(estagio: Estagio, ajuste: number, rng: Rng): Pergunta {
  // Países em dois continentes (Rússia, Turquia) ficam de fora: a resposta seria discutível.
  const semDuvida = PAISES.filter((p) => !p.transcontinental);
  const pool = estagio === 'basico' ? semDuvida.filter((p) => p.fama === 1) : semDuvida;
  const p = sortear(pool, ajuste, rng);
  switch (estagio) {
    case 'basico':
    case 'intermediario':
      return continenteDoPais(p);
    case 'avancado':
      return cara(rng) ? continenteDaCapital(p) : continenteDoPais(p);
    case 'mestre':
      return cara(rng) ? paisDoContinente(p, semDuvida) : continenteDaCapital(p);
  }
}

// ——— Entrada ———

const TEMAS: Record<string, (estagio: Estagio, ajuste: number, rng: Rng) => Pergunta> = {
  'estados-capitais': estadosECapitais,
  'regioes-brasil': regioesDoBrasil,
  'paises-capitais': paisesECapitais,
  continentes,
};

export const TEMAS_GEOGRAFIA = Object.keys(TEMAS);

/** Uma pergunta de Geografia no formato comum a todos os jogos. */
export function questaoDeGeografia(habilidadeId: string, estagio: Estagio, ajuste: number, alternativas: number, rng: Rng): QuestaoGerada {
  if (habilidadeId === 'todos-temas-geografia') {
    const tema = TEMAS_GEOGRAFIA[Math.floor(rng() * TEMAS_GEOGRAFIA.length)]!;
    // O acerto conta para "Todos os temas", a habilidade escolhida na partida.
    return { ...questaoDeGeografia(tema, estagio, ajuste, alternativas, rng), habilidadeId };
  }
  const tema = TEMAS[habilidadeId];
  if (!tema) throw new Error(`Habilidade de Geografia desconhecida: ${habilidadeId}`);
  return montar(habilidadeId, tema(estagio, ajuste, rng), alternativas, ROTULOS_ERRO, rng);
}
