import type { DefinicaoHabilidade, EstadoHabilidade, PerfilProgresso } from './tipos';

export function perfilNovo(): PerfilProgresso {
  return { versao: 1, xp: 0, habilidades: {}, ultimoDia: null, partidasDoDia: {}, selos: {}, provas: {} };
}

export function estadoInicial(def: DefinicaoHabilidade): EstadoHabilidade {
  return {
    estagio: def.estagioInicial,
    maestria: 0,
    partidasNoEstagio: 0,
    ultimosDesempenhos: [],
    revisao: null,
    revisoesRuinsSeguidas: 0,
    enferrujada: false,
  };
}

/** Estado da habilidade no perfil, ou o estado inicial se o jogador nunca a jogou. */
export function estadoDe(perfil: PerfilProgresso, def: DefinicaoHabilidade): EstadoHabilidade {
  return perfil.habilidades[def.id] ?? estadoInicial(def);
}
