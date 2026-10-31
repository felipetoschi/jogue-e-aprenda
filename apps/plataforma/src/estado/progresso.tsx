import { aplicarResultado, perfilNovo, type PerfilProgresso, type ResumoPartida } from '@jogue/progressao';
import type { ConfigPartida, ResultadoJogo } from '@jogue/sdk-jogo';
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { HABILIDADES } from '@jogue/conteudo';
import {
  apagarTudo,
  carregarHistorico,
  carregarPerfil,
  salvarHistorico,
  salvarPerfil,
  type RegistroPartida,
} from '../dados/armazenamento';

interface ValorProgresso {
  perfil: PerfilProgresso;
  historico: RegistroPartida[];
  /** Aplica o resultado à progressão, salva e devolve o resumo e o perfil já atualizado. */
  registrarResultado(jogoId: string, config: ConfigPartida, resultado: ResultadoJogo): { resumo: ResumoPartida; perfil: PerfilProgresso };
  registrarAbandono(jogoId: string, config: ConfigPartida): void;
  apagarProgresso(): void;
}

const Contexto = createContext<ValorProgresso | null>(null);

export function ProvedorProgresso({ children }: { children: ReactNode }) {
  const [perfil, setPerfil] = useState(carregarPerfil);
  const [historico, setHistorico] = useState(carregarHistorico);
  // Partidas seguidas no mesmo jogo terminam antes de a tela redesenhar: o perfil mais novo fica aqui.
  const perfilAtual = useRef(perfil);
  perfilAtual.current = perfil;

  const registrar = useCallback((registro: RegistroPartida) => {
    setHistorico((atual) => salvarHistorico([registro, ...atual]));
  }, []);

  const registrarResultado = useCallback(
    (jogoId: string, config: ConfigPartida, resultado: ResultadoJogo) => {
      const { perfil: novo, resumo } = aplicarResultado(perfilAtual.current, config, resultado, HABILIDADES);
      perfilAtual.current = novo;
      setPerfil(novo);
      salvarPerfil(novo);
      registrar({ id: config.partidaId, jogoId, data: new Date().toISOString(), config, resultado, resumo });
      return { resumo, perfil: novo };
    },
    [registrar],
  );

  const registrarAbandono = useCallback(
    (jogoId: string, config: ConfigPartida) =>
      registrar({ id: config.partidaId, jogoId, data: new Date().toISOString(), config, resultado: null, resumo: null }),
    [registrar],
  );

  const apagarProgresso = useCallback(() => {
    apagarTudo();
    perfilAtual.current = perfilNovo();
    setPerfil(perfilAtual.current);
    setHistorico([]);
  }, []);

  return (
    <Contexto.Provider value={{ perfil, historico, registrarResultado, registrarAbandono, apagarProgresso }}>
      {children}
    </Contexto.Provider>
  );
}

export function useProgresso(): ValorProgresso {
  const valor = useContext(Contexto);
  if (!valor) throw new Error('useProgresso precisa estar dentro de ProvedorProgresso');
  return valor;
}
