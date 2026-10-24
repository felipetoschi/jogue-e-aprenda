import { estadoDe, infoNivel, revisaoVencida, sugerirProximaPartida } from '@jogue/progressao';
import { NOMES_ESTAGIO } from '@jogue/sdk-jogo';
import { Link } from 'react-router';
import { linkParaJogar } from '../componentes/links';
import { Barra } from '../componentes/ui';
import { HABILIDADES, habilidadePorId } from '@jogue/conteudo';
import { useProgresso } from '../estado/progresso';
import { Apresentacao } from './Apresentacao';

/** O início sempre explica a plataforma. Quem já jogou vê antes uma faixa com o próprio progresso. */
export function Inicio() {
  const { historico } = useProgresso();
  const jaJogou = historico.some((r) => r.resumo?.contou);
  return (
    <div className="pilha">
      {jaJogou && <FaixaProgresso />}
      <Apresentacao />
    </div>
  );
}

function FaixaProgresso() {
  const { perfil } = useProgresso();
  const agora = new Date();
  const nivel = infoNivel(perfil.xp);
  const sugestao = sugerirProximaPartida(perfil, HABILIDADES, agora);
  const habilidade = sugestao && habilidadePorId(sugestao.habilidadeId);
  const revisoes = HABILIDADES.filter((h) => revisaoVencida(estadoDe(perfil, h), agora)).length;

  return (
    <section className="faixa-progresso" aria-label="Seu progresso">
      <div className="faixa-nivel">
        <strong>Nível {nivel.nivel}</strong>
        <span className="suave">{nivel.titulo}</span>
        <Barra valor={nivel.xpNoNivel} maximo={nivel.xpParaProximo} rotulo="XP no nível" />
      </div>
      {sugestao && habilidade && (
        <div className="faixa-acao">
          <span className="suave">
            {habilidade.nome} · {NOMES_ESTAGIO[sugestao.estagio]}
            {revisoes > 1 ? ` (+${revisoes - 1} para revisar)` : ''}
          </span>
          <Link className="botao" to={linkParaJogar(sugestao.habilidadeId, sugestao.modo) ?? '/jogos'}>
            {sugestao.modo === 'revisao' ? 'Revisar' : 'Continuar'}
          </Link>
        </div>
      )}
    </section>
  );
}
