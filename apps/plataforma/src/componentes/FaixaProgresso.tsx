import { HABILIDADES, habilidadePorId } from '@jogue/conteudo';
import { estadoDe, infoNivel, revisaoVencida, sugerirProximaPartida } from '@jogue/progressao';
import { NOMES_ESTAGIO } from '@jogue/sdk-jogo';
import { Link } from 'react-router';
import { useProgresso } from '../estado/progresso';
import { linkParaJogar } from './links';
import { Barra } from './ui';

/** Nível atual e a próxima partida sugerida: é por aqui que o jogador continua de onde parou. */
export function FaixaProgresso() {
  const { perfil, historico } = useProgresso();
  const agora = new Date();
  const nivel = infoNivel(perfil.xp);
  const sugestao = sugerirProximaPartida(perfil, HABILIDADES, agora);
  const habilidade = sugestao && habilidadePorId(sugestao.habilidadeId);
  const revisoes = HABILIDADES.filter((h) => revisaoVencida(estadoDe(perfil, h), agora)).length;
  const jaJogou = historico.some((r) => r.resumo?.contou);

  return (
    <section className="faixa-progresso" aria-label="Seu nível">
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
            {sugestao.modo === 'revisao' ? 'Revisar' : jaJogou ? 'Continuar' : 'Começar'}
          </Link>
        </div>
      )}
    </section>
  );
}
