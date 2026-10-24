/** Logo: um controle de videogame com um chapéu de formatura — jogar e estudar. */
export function Marca({ tamanho = 28 }: { tamanho?: number }) {
  return (
    <svg className="marca-icone" width={tamanho} height={tamanho} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="#121a33"/>
      <path d="M20 31h24c7 0 11 5 12 12l1.4 6.6c.8 4-3.4 6.4-6.4 4L45 48H19l-6 5.6c-3 2.4-7.2 0-6.4-4L8 43c1-7 5-12 12-12z" fill="#34c77b"/>
      <rect x="17.6" y="35" width="3.4" height="10.4" rx="1.2" fill="#121a33"/>
      <rect x="14.1" y="38.5" width="10.4" height="3.4" rx="1.2" fill="#121a33"/>
      <circle cx="43" cy="37.6" r="2.6" fill="#121a33"/>
      <circle cx="48.4" cy="42.6" r="2.6" fill="#121a33"/>
      <path d="M22 18.6v5.6c0 3.4 20 3.4 20 0v-5.6L32 22.4z" fill="#d99a00"/>
      <path d="M32 7l19 7.6-19 7.6-19-7.6z" fill="#ffc933"/>
      <path d="M32 14.6l15 2.2v8" fill="none" stroke="#ffc933" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <rect x="45.6" y="24.4" width="2.8" height="4.4" rx="1" fill="#ffc933"/>
    </svg>
  );
}
