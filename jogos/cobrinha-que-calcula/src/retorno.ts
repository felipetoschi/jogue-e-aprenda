/** Som (Web Audio, sem arquivos) e vibração. Tudo é opcional: falhas são ignoradas. */

const CHAVE_SOM = 'cobrinha:som';

function lerPreferencia(): boolean {
  try {
    return localStorage.getItem(CHAVE_SOM) !== 'desligado';
  } catch {
    return true;
  }
}

export class Retorno {
  private contexto: AudioContext | null = null;
  somLigado = lerPreferencia();

  /** Precisa ser chamado num clique ou toque: o navegador só libera áudio depois de uma interação. */
  liberar(): void {
    if (this.contexto) return;
    try {
      this.contexto = new AudioContext();
    } catch {
      this.contexto = null;
    }
  }

  alternarSom(): boolean {
    this.somLigado = !this.somLigado;
    try {
      localStorage.setItem(CHAVE_SOM, this.somLigado ? 'ligado' : 'desligado');
    } catch {
      // Sem armazenamento: a preferência vale só nesta partida.
    }
    return this.somLigado;
  }

  acerto(sequencia: number): void {
    // Cada acerto seguido sobe um pouco o tom, até um limite.
    const base = 520 * 2 ** (Math.min(sequencia, 12) / 12);
    this.nota(base, 0.08, 'triangle');
    this.nota(base * 1.5, 0.12, 'triangle', 0.07);
    this.vibrar(15);
  }

  erro(): void {
    this.nota(220, 0.25, 'sawtooth');
    this.nota(165, 0.35, 'sawtooth', 0.12);
    this.vibrar([60, 40, 90]);
  }

  vitoria(): void {
    [523, 659, 784, 1047].forEach((f, i) => this.nota(f, 0.18, 'triangle', i * 0.11));
    this.vibrar([30, 40, 30, 40, 80]);
  }

  private nota(frequencia: number, duracao: number, forma: OscillatorType, atraso = 0): void {
    const ctx = this.contexto;
    if (!ctx || !this.somLigado) return;
    try {
      const inicio = ctx.currentTime + atraso;
      const osc = ctx.createOscillator();
      const volume = ctx.createGain();
      osc.type = forma;
      osc.frequency.value = frequencia;
      volume.gain.setValueAtTime(0.0001, inicio);
      volume.gain.exponentialRampToValueAtTime(0.12, inicio + 0.01);
      volume.gain.exponentialRampToValueAtTime(0.0001, inicio + duracao);
      osc.connect(volume).connect(ctx.destination);
      osc.start(inicio);
      osc.stop(inicio + duracao + 0.02);
    } catch {
      // Áudio indisponível.
    }
  }

  private vibrar(padrao: number | number[]): void {
    try {
      navigator.vibrate?.(padrao);
    } catch {
      // Vibração indisponível.
    }
  }
}
