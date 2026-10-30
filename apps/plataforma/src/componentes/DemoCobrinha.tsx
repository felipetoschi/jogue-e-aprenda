import { useEffect, useRef, useState } from 'react';

/**
 * Demonstração da Cobrinha que Calcula na página inicial: a cobra vai sozinha até
 * a letra da resposta certa de cada conta (A ou B). Não carrega o jogo; é só uma animação leve.
 */

const COLUNAS = 10;
const LINHAS = 7;
const PASSO_MS = 170;
const PAUSA_MS = 900;
const TAMANHO_MAXIMO = 7;

interface Posicao {
  x: number;
  y: number;
}

/** Em cada rodada, as alternativas A e B, na ordem; `certa` diz qual delas é a resposta. */
const RODADAS = [
  { texto: '7 × 8', alternativas: [56, 48], certa: 0 },
  { texto: '45 + 38', alternativas: [73, 83], certa: 1 },
  { texto: '36 ÷ 4', alternativas: [8, 9], certa: 1 },
  { texto: '15 − 7', alternativas: [8, 22], certa: 0 },
];
const LETRAS = ['A', 'B'] as const;

interface Peca extends Posicao {
  letra: string;
  certa: boolean;
}

const igual = (a: Posicao, b: Posicao) => a.x === b.x && a.y === b.y;
const distancia = (a: Posicao, b: Posicao) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

/** Sorteio com semente, para a animação ser sempre a mesma. */
function sorteador(semente: number) {
  let a = semente;
  return () => {
    a = (a * 1664525 + 1013904223) >>> 0;
    return a / 4294967296;
  };
}

function posicionar(rodada: number, cobra: Posicao[]): Peca[] {
  const { certa } = RODADAS[rodada % RODADAS.length]!;
  // A certa é posicionada primeiro, para a cobra ter sempre caminho até ela.
  const ordem = [certa, 1 - certa];
  const sorte = sorteador(rodada * 7919 + 17);
  const pecas: Peca[] = [];
  for (let tentativa = 0; tentativa < 500 && pecas.length < ordem.length; tentativa++) {
    const p = { x: 1 + Math.floor(sorte() * (COLUNAS - 2)), y: 1 + Math.floor(sorte() * (LINHAS - 2)) };
    if (cobra.some((c) => igual(c, p)) || distancia(p, cobra[0]!) < 4) continue;
    if (pecas.some((o) => distancia(o, p) < 3)) continue;
    pecas.push({ ...p, letra: LETRAS[ordem[pecas.length]!]!, certa: pecas.length === 0 });
  }
  return pecas;
}

/** Caminho mais curto até a peça certa, desviando das falsas e do corpo. */
function caminho(cobra: Posicao[], pecas: Peca[]): Posicao[] {
  const alvo = pecas.find((p) => p.certa)!;
  const bloqueado = (p: Posicao) =>
    p.x < 0 || p.y < 0 || p.x >= COLUNAS || p.y >= LINHAS || pecas.some((o) => !o.certa && igual(o, p)) || cobra.slice(0, -1).some((c) => igual(c, p));
  const chave = (p: Posicao) => p.y * COLUNAS + p.x;
  const veioDe = new Map<number, Posicao | null>([[chave(cobra[0]!), null]]);
  const fila = [cobra[0]!];
  while (fila.length) {
    const atual = fila.shift()!;
    if (igual(atual, alvo)) break;
    for (const [dx, dy] of [[1, 0], [0, 1], [-1, 0], [0, -1]] as const) {
      const prox = { x: atual.x + dx, y: atual.y + dy };
      if (bloqueado(prox) || veioDe.has(chave(prox))) continue;
      veioDe.set(chave(prox), atual);
      fila.push(prox);
    }
  }
  const rota: Posicao[] = [];
  for (let p: Posicao | null | undefined = alvo; p && !igual(p, cobra[0]!); p = veioDe.get(chave(p))) rota.unshift(p);
  return rota;
}

export function DemoCobrinha() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [conta, setConta] = useState({ texto: RODADAS[0]!.texto, resposta: null as number | null });
  const rodadaAtual = RODADAS.find((r) => r.texto === conta.texto)!;

  useEffect(() => {
    const tela = canvas.current;
    const ctx = tela?.getContext('2d');
    if (!tela || !ctx) return;

    let cobra: Posicao[] = [{ x: 3, y: 4 }, { x: 2, y: 4 }, { x: 1, y: 4 }];
    let rodada = 0;
    let pecas = posicionar(rodada, cobra);
    let rota = caminho(cobra, pecas);
    let anel: { pos: Posicao; quadros: number } | null = null;

    const cor = (nome: string) => getComputedStyle(tela).getPropertyValue(nome).trim();

    function desenhar() {
      const lado = tela!.clientWidth / COLUNAS;
      const densidade = window.devicePixelRatio || 1;
      tela!.width = Math.round(tela!.clientWidth * densidade);
      tela!.height = Math.round(lado * LINHAS * densidade);
      ctx!.setTransform(densidade, 0, 0, densidade, 0, 0);
      ctx!.clearRect(0, 0, lado * COLUNAS, lado * LINHAS);

      ctx!.strokeStyle = cor('--demo-grade');
      ctx!.lineWidth = 1;
      ctx!.beginPath();
      for (let i = 1; i < COLUNAS; i++) {
        ctx!.moveTo(i * lado, 0);
        ctx!.lineTo(i * lado, lado * LINHAS);
      }
      for (let j = 1; j < LINHAS; j++) {
        ctx!.moveTo(0, j * lado);
        ctx!.lineTo(lado * COLUNAS, j * lado);
      }
      ctx!.stroke();

      ctx!.font = `800 ${lado * 0.55}px Lexend, system-ui, sans-serif`;
      ctx!.textAlign = 'center';
      ctx!.textBaseline = 'middle';
      for (const p of pecas) {
        ctx!.fillStyle = cor('--demo-peca');
        ctx!.beginPath();
        ctx!.roundRect(p.x * lado + 3, p.y * lado + 3, lado - 6, lado - 6, lado * 0.25);
        ctx!.fill();
        ctx!.fillStyle = cor('--demo-peca-texto');
        ctx!.fillText(p.letra, (p.x + 0.5) * lado, (p.y + 0.53) * lado);
      }

      cobra.forEach((parte, i) => {
        ctx!.fillStyle = i === 0 ? cor('--verde-forte') : cor('--verde');
        ctx!.beginPath();
        ctx!.roundRect(parte.x * lado + 2, parte.y * lado + 2, lado - 4, lado - 4, lado * 0.3);
        ctx!.fill();
      });

      if (anel) {
        const progresso = anel.quadros / 4;
        ctx!.globalAlpha = 1 - progresso;
        ctx!.strokeStyle = cor('--verde');
        ctx!.lineWidth = 3;
        ctx!.beginPath();
        ctx!.arc((anel.pos.x + 0.5) * lado, (anel.pos.y + 0.5) * lado, lado * (0.6 + progresso * 1.6), 0, Math.PI * 2);
        ctx!.stroke();
        ctx!.globalAlpha = 1;
      }
    }

    desenhar();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let pausaAte = 0;
    const intervalo = setInterval(() => {
      const agora = performance.now();
      if (anel) anel = anel.quadros >= 4 ? null : { ...anel, quadros: anel.quadros + 1 };
      if (agora < pausaAte) {
        desenhar();
        return;
      }
      if (rota.length === 0) {
        // Chegou: mostra a resposta, cresce e passa para a próxima conta.
        rodada++;
        pecas = posicionar(rodada, cobra);
        rota = caminho(cobra, pecas);
        setConta({ texto: RODADAS[rodada % RODADAS.length]!.texto, resposta: null });
        desenhar();
        return;
      }
      const proxima = rota.shift()!;
      cobra = [proxima, ...cobra];
      const comida = pecas.find((p) => p.certa && igual(p, proxima));
      if (comida) {
        const atual = RODADAS[rodada % RODADAS.length]!;
        setConta({ texto: atual.texto, resposta: atual.alternativas[atual.certa]! });
        pecas = pecas.filter((p) => p !== comida);
        anel = { pos: proxima, quadros: 0 };
        pausaAte = agora + PAUSA_MS;
        if (cobra.length > TAMANHO_MAXIMO) cobra.pop();
      } else {
        cobra.pop();
      }
      desenhar();
    }, PASSO_MS);

    window.addEventListener('resize', desenhar);
    return () => {
      clearInterval(intervalo);
      window.removeEventListener('resize', desenhar);
    };
  }, []);

  return (
    <figure className="demo" aria-label="Demonstração da Cobrinha que Calcula">
      <div className="demo-conta" aria-live="off">
        {conta.texto} = <span className={conta.resposta === null ? 'demo-interrogacao' : 'demo-resposta'}>{conta.resposta ?? '?'}</span>
      </div>
      <div className="demo-alternativas">
        {rodadaAtual.alternativas.map((valor, i) => (
          <span key={LETRAS[i]} className="demo-alternativa">
            <b>{LETRAS[i]}</b> {valor}
          </span>
        ))}
      </div>
      <canvas ref={canvas} className="demo-tabuleiro" />
    </figure>
  );
}
