import { habilidadePorId, HABILIDADES, materiaPorId } from '@jogue/conteudo';
import {
  estadoDe,
  estagiosLiberados,
  estaDesbloqueada,
  prerequisitosPendentes,
  sugerirProximaPartida,
} from '@jogue/progressao';
import { ESTAGIOS, NOMES_ESTAGIO, type Estagio, type ManifestoJogo } from '@jogue/sdk-jogo';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { linkParaJogar } from '../componentes/links';
import { habilidadesDoJogo, JOGOS, materiasDoJogo } from '../conteudo/jogos';
import { useProgresso } from '../estado/progresso';

/**
 * Escolha do jogo: um card por jogo, com ícone, nome, apresentação e Jogar.
 * Ao tocar em Jogar, o próprio card se abre com a escolha de habilidade e nível.
 */
export function Catalogo() {
  const [busca] = useSearchParams();
  const habilidadePedida = busca.get('habilidade') ?? undefined;
  return (
    <div className="pilha">
      <h1>Jogos</h1>
      <div className="vitrine-jogos">
        {JOGOS.map((jogo) => (
          <CartaoJogo key={jogo.id} jogo={jogo} habilidadePedida={habilidadePedida} />
        ))}
      </div>
    </div>
  );
}

function CartaoJogo({ jogo, habilidadePedida }: { jogo: ManifestoJogo; habilidadePedida?: string }) {
  const { perfil } = useProgresso();
  const navegar = useNavigate();
  const materias = materiasDoJogo(jogo);
  const todas = habilidadesDoJogo(jogo);
  const abertas = todas.filter((h) => estaDesbloqueada(perfil, h, HABILIDADES));
  const sugerida = sugerirProximaPartida(perfil, abertas)?.habilidadeId;
  const inicial = abertas.find((h) => h.id === habilidadePedida) ?? abertas.find((h) => h.id === sugerida) ?? abertas[0];

  const [materiaId, setMateriaId] = useState(inicial?.materiaId ?? materias[0]?.id);
  const [habilidadeId, setHabilidadeId] = useState(inicial?.id);
  const [escolhido, setEscolhido] = useState<Estagio | null>(null);
  // Vindo de "Treinar" no mapa, o card já abre com a habilidade marcada.
  const [aberto, setAberto] = useState(() => !!habilidadePedida && todas.some((h) => h.id === habilidadePedida));

  const daMateria = todas.filter((h) => h.materiaId === materiaId);
  const def = daMateria.find((h) => h.id === habilidadeId) ?? daMateria.find((h) => estaDesbloqueada(perfil, h, HABILIDADES));
  const atual = def ? estadoDe(perfil, def).estagio : 'basico';
  const liberados = def ? estagiosLiberados(perfil, def) : [];
  // O nível mais alto já alcançado vem selecionado.
  const nivel = escolhido && liberados.includes(escolhido) ? escolhido : atual;

  function escolherMateria(id: string) {
    setMateriaId(id);
    setHabilidadeId(undefined);
    setEscolhido(null);
  }

  function escolherHabilidade(id: string) {
    setHabilidadeId(id);
    setEscolhido(null);
  }

  const cabecalho = (
    <div className="jogo-cabecalho">
      <img className="jogo-icone" src={jogo.icone} alt="" width={72} height={72} />
      <div>
        <h2>{jogo.nome}</h2>
        <p className="sobretitulo">
          {jogo.materias.map((m) => materiaPorId(m)?.nome).join(' · ')} · {jogo.duracaoMinutos[0]} a {jogo.duracaoMinutos[1]} min
        </p>
      </div>
    </div>
  );

  if (!aberto) {
    return (
      <article className="cartao cartao-jogo">
        {cabecalho}
        <p>{jogo.descricao}</p>
        <button type="button" className="botao" onClick={() => setAberto(true)}>
          Jogar
        </button>
      </article>
    );
  }

  return (
    <article className="cartao cartao-jogo aberto">
      {cabecalho}

      {materias.length > 1 && (
        <div className="opcoes-linha" role="radiogroup" aria-label="Disciplina">
          {materias.map((m) => (
            <button
              key={m.id}
              type="button"
              role="radio"
              aria-checked={m.id === materiaId}
              className={m.id === materiaId ? 'opcao selecionada' : 'opcao'}
              onClick={() => escolherMateria(m.id)}
            >
              {m.nome}
            </button>
          ))}
        </div>
      )}

      <div className="pilha-curta">
        <span className="rotulo-grupo">O que treinar</span>
        <div className="opcoes-linha" role="radiogroup" aria-label="Habilidade">
          {daMateria.map((h) => {
            const aberta = estaDesbloqueada(perfil, h, HABILIDADES);
            const falta = prerequisitosPendentes(perfil, h, HABILIDADES)
              .map((p) => `${habilidadePorId(p.habilidadeId)?.nome} — ${NOMES_ESTAGIO[p.estagio]}`)
              .join(', ');
            return (
              <button
                key={h.id}
                type="button"
                role="radio"
                aria-checked={h.id === def?.id}
                className={h.id === def?.id ? 'opcao selecionada' : 'opcao'}
                disabled={!aberta}
                title={aberta ? undefined : `Falta: ${falta}`}
                onClick={() => escolherHabilidade(h.id)}
              >
                {!aberta && <Cadeado />}
                {h.nome}
              </button>
            );
          })}
        </div>
      </div>

      {def && (
        <div className="pilha-curta">
          <span className="rotulo-grupo">Nível</span>
          <div className="seletor-estagio" role="radiogroup" aria-label="Nível">
            {ESTAGIOS.filter((e) => ESTAGIOS.indexOf(e) >= ESTAGIOS.indexOf(def.estagioInicial)).map((e) => {
              const liberado = liberados.includes(e);
              return (
                <button
                  key={e}
                  type="button"
                  role="radio"
                  aria-checked={e === nivel}
                  className={`opcao estagio-${e}${e === nivel ? ' selecionada' : ''}`}
                  disabled={!liberado}
                  onClick={() => setEscolhido(e)}
                >
                  {!liberado && <Cadeado />}
                  {NOMES_ESTAGIO[e]}
                </button>
              );
            })}
          </div>
          <p className="suave">
            {def.estagios[nivel]}
            {nivel !== atual && ` · vale XP, não muda a maestria do ${NOMES_ESTAGIO[atual]}`}
          </p>
        </div>
      )}

      <div className="acoes">
        <button
          type="button"
          className="botao"
          disabled={!def}
          onClick={() => def && navegar(linkParaJogar(def.id, 'normal', { estagio: nivel, jogoId: jogo.id }) ?? '/jogos')}
        >
          Começar
        </button>
        <button type="button" className="botao secundario" onClick={() => setAberto(false)}>
          Voltar
        </button>
      </div>
    </article>
  );
}

function Cadeado() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" className="cadeado">
      <rect x="2" y="5" width="8" height="6" rx="1.5" fill="currentColor" />
      <path d="M4 5V3.5a2 2 0 0 1 4 0V5" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
