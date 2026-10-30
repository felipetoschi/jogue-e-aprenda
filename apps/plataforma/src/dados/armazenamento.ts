import { perfilNovo, type PerfilProgresso, type ResumoPartida } from '@jogue/progressao';
import type { ConfigPartida, ResultadoJogo } from '@jogue/sdk-jogo';
import { IDS_ANTIGOS } from '../conteudo/jogos';

/**
 * Guarda o progresso no próprio navegador. Na Fase 1 não há servidor:
 * esta é a única camada que muda quando a API de progressão existir.
 */
export interface RegistroPartida {
  id: string;
  jogoId: string;
  data: string;
  config: ConfigPartida;
  resultado: ResultadoJogo | null;
  resumo: ResumoPartida | null;
}

const CHAVE_PERFIL = 'jogue-e-aprenda:perfil';
const CHAVE_HISTORICO = 'jogue-e-aprenda:historico';
const MAX_HISTORICO = 200;

function ler<T>(chave: string): T | null {
  try {
    const texto = localStorage.getItem(chave);
    return texto ? (JSON.parse(texto) as T) : null;
  } catch {
    return null;
  }
}

function gravar(chave: string, valor: unknown): void {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    // Sem armazenamento (aba anônima, cota cheia): o jogo continua, só não lembra o progresso.
  }
}

export function carregarPerfil(): PerfilProgresso {
  const salvo = ler<PerfilProgresso>(CHAVE_PERFIL);
  return salvo?.versao === 1 ? salvo : perfilNovo();
}

export const salvarPerfil = (perfil: PerfilProgresso) => gravar(CHAVE_PERFIL, perfil);

/** Lê o histórico já trocando o id de jogos renomeados pelo atual. */
export const carregarHistorico = (): RegistroPartida[] =>
  (ler<RegistroPartida[]>(CHAVE_HISTORICO) ?? []).map((r) => (IDS_ANTIGOS[r.jogoId] ? { ...r, jogoId: IDS_ANTIGOS[r.jogoId]! } : r));

export function salvarHistorico(historico: RegistroPartida[]): RegistroPartida[] {
  const cortado = historico.slice(0, MAX_HISTORICO);
  gravar(CHAVE_HISTORICO, cortado);
  return cortado;
}

export function apagarTudo(): void {
  try {
    localStorage.removeItem(CHAVE_PERFIL);
    localStorage.removeItem(CHAVE_HISTORICO);
  } catch {
    // Nada a apagar.
  }
}
