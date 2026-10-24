/** Logo: um tabuleiro 3 × 3 com a cobrinha chegando na peça certa. */
export function Marca({ tamanho = 28 }: { tamanho?: number }) {
  return (
    <svg className="marca-icone" width={tamanho} height={tamanho} viewBox="0 0 30 30" aria-hidden="true">
      <rect x="0" y="0" width="30" height="30" rx="8" fill="#121a33" />
      <rect x="4" y="4" width="6" height="6" rx="2" fill="#34c77b" />
      <rect x="12" y="4" width="6" height="6" rx="2" fill="#34c77b" />
      <rect x="20" y="4" width="6" height="6" rx="2" fill="#34c77b" opacity="0.55" />
      <rect x="20" y="12" width="6" height="6" rx="2" fill="#34c77b" opacity="0.3" />
      <rect x="20" y="20" width="6" height="6" rx="2" fill="#ffc933" />
      <rect x="4" y="20" width="6" height="6" rx="2" fill="#eef2fb" opacity="0.25" />
    </svg>
  );
}
