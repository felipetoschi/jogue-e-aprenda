import { ESTAGIOS, zerou, type ConfigBase, type Estagio, type ResultadoJogo } from '@jogue/sdk-jogo';
import { ajusteFino } from './ajuste';
import { estaDesbloqueada, melhorSelo, progressoMateria, seloPorProgresso } from './desbloqueio';
import { calcularEstrelas } from './estrelas';
import { atualizarMaestria, desempenhoDe } from './maestria';
import { infoNivel, type InfoNivel } from './nivel';
import { PARAMETROS } from './parametros';
import { calcularXp } from './xp';
import { estadoDe } from './perfil';
import { agendarPrimeiraRevisao, aplicarRevisao } from './revisao';
import type { DefinicaoHabilidade, PerfilProgresso, Selo } from './tipos';
import { diaDe, indiceEstagio, proximoEstagio } from './util';

export interface MudancaHabilidade {
  habilidadeId: string;
  estagioAntes: Estagio;
  estagioDepois: Estagio;
  maestriaAntes: number;
  maestriaDepois: number;
  promovido: boolean;
}

export interface ResumoPartida {
  /** false para partidas que não mexem na progressão; o motivo fica em naoContou. */
  contou: boolean;
  naoContou?: 'abandono' | 'treino' | 'sem-tentativas';
  /** Acertou todas as perguntas da partida no estágio atual. */
  zerou: boolean;
  estrelas: 0 | 1 | 2 | 3;
  xpGanho: number;
  nivelAntes: InfoNivel;
  nivelDepois: InfoNivel;
  habilidades: MudancaHabilidade[];
  desbloqueadas: string[];
  revisaoAprovada: boolean | null;
  selosNovos: { materiaId: string; selo: Selo }[];
}

const MAX_HISTORICO_DESEMPENHO = 5;

/**
 * Aplica o resultado de uma partida ao perfil. Função pura: devolve um perfil novo
 * e o resumo do que mudou, para a tela de resultado.
 */
export function aplicarResultado(
  perfilAtual: PerfilProgresso,
  config: ConfigBase,
  resultado: ResultadoJogo,
  habilidades: DefinicaoHabilidade[],
  agora: Date = new Date(),
): { perfil: PerfilProgresso; resumo: ResumoPartida } {
  const perfil = structuredClone(perfilAtual);
  const nivelAntes = infoNivel(perfil.xp);
  const estrelas = calcularEstrelas(resultado.pontuacao);

  const tentativas = resultado.desempenho.reduce((total, d) => total + d.tentativas, 0);
  const naoContou =
    resultado.status === 'abandonada' ? 'abandono' : config.modo === 'treino' ? 'treino' : tentativas === 0 ? 'sem-tentativas' : null;
  if (naoContou) {
    return {
      perfil,
      resumo: {
        contou: false,
        zerou: false,
        naoContou,
        estrelas: naoContou === 'treino' ? estrelas : 0,
        xpGanho: 0,
        nivelAntes,
        nivelDepois: nivelAntes,
        habilidades: [],
        desbloqueadas: [],
        revisaoAprovada: null,
        selosNovos: [],
      },
    };
  }

  const hoje = diaDe(agora);
  const primeiraDoDia = perfil.ultimoDia !== hoje;
  if (primeiraDoDia) perfil.partidasDoDia = {};
  const chave = `${config.habilidadeId}:${config.estagio}`;
  const partidasAnterioresHoje = perfil.partidasDoDia[chave] ?? 0;

  const desbloqueadasAntes = new Set(habilidades.filter((h) => estaDesbloqueada(perfil, h, habilidades)).map((h) => h.id));

  let xpGanho = calcularXp({
    estagio: config.estagio,
    pontuacao: resultado.pontuacao,
    ajudas: resultado.ajudas,
    estrelas,
    primeiraDoDia,
    partidasAnterioresHoje,
  });
  let revisaoAprovada: boolean | null = null;
  let zerouPartida = false;
  const mudancas: MudancaHabilidade[] = [];

  for (const d of resultado.desempenho) {
    const def = habilidades.find((h) => h.id === d.habilidadeId);
    if (!def || d.tentativas === 0) continue;
    const antes = estadoDe(perfil, def);
    const desempenho = desempenhoDe(d.acertos, d.tentativas);
    let estado = antes;
    let promovido = false;
    // Maestria mostrada na tela de resultado: numa promoção, a do estágio que acabou de ser superado.
    let maestriaMostrada = antes.maestria;

    if (config.modo === 'revisao') {
      const r = aplicarRevisao(antes, desempenho, agora);
      estado = r.estado;
      revisaoAprovada = r.aprovada;
      if (r.aprovada) xpGanho += PARAMETROS.bonus.revisao;
    } else if (config.estagio === antes.estagio) {
      estado = {
        ...antes,
        maestria: atualizarMaestria(antes.maestria, desempenho, d.tentativas),
        partidasNoEstagio: antes.partidasNoEstagio + 1,
        ultimosDesempenhos: [...antes.ultimosDesempenhos, Math.round(desempenho)].slice(-MAX_HISTORICO_DESEMPENHO),
      };
      maestriaMostrada = estado.maestria;
      // Padrão dos jogos: sobe de estágio quem zera a partida no estágio atual (todas as perguntas certas).
      const proximo = proximoEstagio(estado.estagio);
      if (zerou(d.acertos, d.tentativas)) zerouPartida = true;
      if (proximo && zerou(d.acertos, d.tentativas)) {
        estado = {
          ...estado,
          estagio: proximo,
          maestria: 0,
          partidasNoEstagio: 0,
          ultimosDesempenhos: [],
          revisao: agendarPrimeiraRevisao(antes.estagio, agora),
        };
        promovido = true;
        xpGanho += PARAMETROS.bonus.promocao;
      }
    }

    perfil.habilidades[def.id] = estado;
    mudancas.push({
      habilidadeId: def.id,
      estagioAntes: antes.estagio,
      estagioDepois: estado.estagio,
      maestriaAntes: antes.maestria,
      maestriaDepois: maestriaMostrada,
      promovido,
    });
  }

  perfil.partidasDoDia[chave] = partidasAnterioresHoje + 1;
  perfil.ultimoDia = hoje;
  perfil.xp += xpGanho;

  const desbloqueadas = habilidades
    .filter((h) => !desbloqueadasAntes.has(h.id) && estaDesbloqueada(perfil, h, habilidades))
    .map((h) => h.id);

  const selosNovos: ResumoPartida['selosNovos'] = [];
  const materias = new Set(mudancas.map((m) => habilidades.find((h) => h.id === m.habilidadeId)!.materiaId));
  for (const materiaId of materias) {
    const progresso = progressoMateria(perfil, habilidades.filter((h) => h.materiaId === materiaId));
    const anterior = perfil.selos[materiaId];
    const novo = melhorSelo(anterior, seloPorProgresso(progresso));
    if (novo && novo !== anterior) {
      perfil.selos[materiaId] = novo;
      selosNovos.push({ materiaId, selo: novo });
    }
  }

  return {
    perfil,
    resumo: {
      contou: true,
      zerou: zerouPartida,
      estrelas,
      xpGanho,
      nivelAntes,
      nivelDepois: infoNivel(perfil.xp),
      habilidades: mudancas,
      desbloqueadas,
      revisaoAprovada,
      selosNovos,
    },
  };
}

/** O que a progressão decide sobre a próxima partida; a plataforma completa com as perguntas. */
export type ConfigSemId = ConfigBase;

/** Estágios que o jogador pode escolher jogar: do inicial até o atual. */
export function estagiosLiberados(perfil: PerfilProgresso, def: DefinicaoHabilidade): Estagio[] {
  const atual = indiceEstagio(estadoDe(perfil, def).estagio);
  return ESTAGIOS.filter((_, i) => i >= indiceEstagio(def.estagioInicial) && i <= atual);
}

/**
 * Monta a configuração da próxima partida de uma habilidade.
 * Com `estagioEscolhido` abaixo do atual, a partida vale XP, mas não mexe na maestria do estágio atual.
 */
export function configParaPartida(
  perfil: PerfilProgresso,
  def: DefinicaoHabilidade,
  modo: ConfigBase['modo'] = 'normal',
  estagioEscolhido?: Estagio,
): ConfigSemId {
  const estado = estadoDe(perfil, def);
  if (modo === 'normal' && estagioEscolhido && estagioEscolhido !== estado.estagio && estagiosLiberados(perfil, def).includes(estagioEscolhido)) {
    return { habilidadeId: def.id, estagio: estagioEscolhido, ajuste: 0.5, modo };
  }
  if (modo === 'revisao' && estado.revisao) {
    return { habilidadeId: def.id, estagio: estado.revisao.estagio, ajuste: 0.5, modo };
  }
  const modoFinal = modo === 'revisao' ? 'normal' : modo;
  return { habilidadeId: def.id, estagio: estado.estagio, ajuste: ajusteFino(estado), modo: modoFinal };
}
