import { useEffect, useState } from 'react';

interface EventoInstalacao extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const modoApp = (modo: 'fullscreen' | 'standalone') => window.matchMedia?.(`(display-mode: ${modo})`).matches === true;

const jaInstalado = () => modoApp('fullscreen') || modoApp('standalone') || (navigator as { standalone?: boolean }).standalone === true;

const ehIphone = () => /iphone|ipad|ipod/i.test(navigator.userAgent);

/** Convida a instalar o app na tela inicial, para jogar em tela cheia. Some depois de instalado. */
export function InstalarApp() {
  const [evento, setEvento] = useState<EventoInstalacao | null>(null);
  const [instalado, setInstalado] = useState(jaInstalado);

  useEffect(() => {
    const aoOferecer = (e: Event) => {
      e.preventDefault();
      setEvento(e as EventoInstalacao);
    };
    const aoInstalar = () => setInstalado(true);
    window.addEventListener('beforeinstallprompt', aoOferecer);
    window.addEventListener('appinstalled', aoInstalar);
    return () => {
      window.removeEventListener('beforeinstallprompt', aoOferecer);
      window.removeEventListener('appinstalled', aoInstalar);
    };
  }, []);

  if (instalado) return null;
  if (evento) {
    return (
      <button
        type="button"
        className="botao secundario"
        onClick={async () => {
          await evento.prompt();
          if ((await evento.userChoice).outcome === 'accepted') setInstalado(true);
          setEvento(null);
        }}
      >
        Instalar o app
      </button>
    );
  }
  if (ehIphone()) {
    return <p className="suave">Para jogar em tela cheia: toque em Compartilhar e depois em "Adicionar à Tela de Início".</p>;
  }
  return null;
}
