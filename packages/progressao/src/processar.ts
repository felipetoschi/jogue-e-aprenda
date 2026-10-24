import type { ConfigPartida, Estagio, ResultadoJogo } from '@jogue/sdk-jogo';
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
import { diaDe, proximoEstagio, somarDias } from './util';

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
  /** Resultado da prova de nivelamento, quando a partida foi uma. */
  nivelamento: { estagio: Estagio; aprovado: boolean } | null;
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
  config: ConfigPartida,
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
        naoContou,
        nivelamento: null,
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
  let nivelamento: ResumoPartida['nivelamento'] = null;
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
    } else if (config.modo === 'nivelamento') {
      perfil.provas = { ...perfil.provas, [`${def.id}:${config.estagio}`]: agora.toISOString() };
      const { notaParaPular, tentativasMinimas } = PARAMETROS.nivelamento;
      const aprovado =
        config.estagio === proximoEstagio(antes.estagio) && desempenho >= notaParaPular && d.tentativas >= tentativasMinimas;
      nivelamento = { estagio: config.estagio, aprovado };
      if (aprovado) {
        // A prova já conta como a primeira partida do novo estágio.
        estado = {
          ...antes,
          estagio: config.estagio,
          maestria: atualizarMaestria(0, desempenho, d.tentativas),
          partidasNoEstagio: 1,
          ultimosDesempenhos: [Math.round(desempenho)],
        };
        promovido = true;
        xpGanho += PARAMETROS.bonus.promocao;
      }
    } else if (config.estagio === antes.estagio) {
      estado = {
        ...antes,
        maestria: atualizarMaestria(antes.maestria, desempenho, d.tentativas),
        partidasNoEstagio: antes.partidasNoEstagio + 1,
        ultimosDesempenhos: [...antes.ultimosDesempenhos, Math.round(desempenho)].slice(-MAX_HISTORICO_DESEMPENHO),
      };
      maestriaMostrada = estado.maestria;
      const proximo = proximoEstagio(estado.estagio);
      const { promocao, partidasMinimas } = PARAMETROS.maestria;
      if (proximo && estado.maestria >= promocao && estado.partidasNoEstagio >= partidasMinimas) {
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
      nivelamento,
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

export type ConfigSemId = Omit<ConfigPartida, 'partidaId'>;

/** Monta a configuração da próxima partida de uma habilidade. */
export function configParaPartida(perfil: PerfilProgresso, def: DefinicaoHabilidade, modo: ConfigPartida['modo'] = 'normal'): ConfigSemId {
  const estado = estadoDe(perfil, def);
  if (modo === 'revisao' && estado.revisao) {
    return { habilidadeId: def.id, estagio: estado.revisao.estagio, ajuste: 0.5, modo };
  }
  const proximo = proximoEstagio(estado.estagio);
  if (modo === 'nivelamento' && proximo) {
    return { habilidadeId: def.id, estagio: proximo, ajuste: 0.5, modo };
  }
  const modoFinal = modo === 'revisao' || modo === 'nivelamento' ? 'normal' : modo;
  return { habilidadeId: def.id, estagio: estado.estagio, ajuste: ajusteFino(estado), modo: modoFinal };
}

export interface SituacaoProva {
  /** Estágio que a prova permite alcançar. */
  estagio: Estagio;
  disponivel: boolean;
  /** Quando a próxima prova libera, se ainda estiver em espera. */
  liberaEm: string | null;
}

/** Se o jogador pode fazer a prova para pular o estágio atual. null no Mestre. */
export function situacaoProva(perfil: PerfilProgresso, def: DefinicaoHabilidade, agora: Date = new Date()): SituacaoProva | null {
  const proximo = proximoEstagio(estadoDe(perfil, def).estagio);
  if (!proximo) return null;
  const ultima = perfil.provas?.[`${def.id}:${proximo}`];
  const libera = ultima ? somarDias(new Date(ultima), PARAMETROS.nivelamento.diasEntreProvas) : null;
  const disponivel = !libera || libera <= agora;
  return { estagio: proximo, disponivel, liberaEm: disponivel ? null : libera!.toISOString() };
}
