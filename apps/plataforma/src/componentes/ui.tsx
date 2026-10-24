import type { Estagio } from '@jogue/sdk-jogo';
import { NOMES_ESTAGIO } from '@jogue/sdk-jogo';
import type { Selo } from '@jogue/progressao';

export function Barra({ valor, maximo, rotulo }: { valor: number; maximo: number; rotulo: string }) {
  const fracao = maximo > 0 ? Math.min(1, valor / maximo) : 0;
  return (
    <div className="barra" role="progressbar" aria-label={rotulo} aria-valuenow={Math.round(valor)} aria-valuemin={0} aria-valuemax={maximo}>
      <div className="barra-preenchida" style={{ width: `${fracao * 100}%` }} />
    </div>
  );
}

export function Estrelas({ quantidade }: { quantidade: number }) {
  return (
    <span className="estrelas" aria-label={`${quantidade} de 3 estrelas`}>
      {[1, 2, 3].map((i) => (
        <span key={i} className={i <= quantidade ? 'estrela cheia' : 'estrela'}>
          ★
        </span>
      ))}
    </span>
  );
}

export function SeloEstagio({ estagio }: { estagio: Estagio }) {
  return <span className={`selo-estagio estagio-${estagio}`}>{NOMES_ESTAGIO[estagio]}</span>;
}

const NOMES_SELO: Record<Selo, string> = { bronze: 'Bronze', prata: 'Prata', ouro: 'Ouro', diamante: 'Diamante' };

export function SeloMateria({ selo }: { selo: Selo | null | undefined }) {
  if (!selo) return <span className="selo-materia vazio">Sem selo</span>;
  return <span className={`selo-materia selo-${selo}`}>{NOMES_SELO[selo]}</span>;
}
