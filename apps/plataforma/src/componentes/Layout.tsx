import { infoNivel } from '@jogue/progressao';
import { NavLink, Outlet } from 'react-router';
import { useProgresso } from '../estado/progresso';

export function Layout() {
  const { perfil } = useProgresso();
  const { nivel, titulo } = infoNivel(perfil.xp);
  return (
    <div className="app">
      <header className="topo">
        <NavLink to="/" className="marca">
          Jogue e Aprenda
        </NavLink>
        <nav className="menu" aria-label="Principal">
          <NavLink to="/" end>
            Início
          </NavLink>
          <NavLink to="/mapa">Mapa</NavLink>
          <NavLink to="/jogos">Jogos</NavLink>
          <NavLink to="/perfil">Perfil</NavLink>
        </nav>
        <span className="nivel-topo" title={titulo}>
          Nv. {nivel}
        </span>
      </header>
      <main className="conteudo">
        <Outlet />
      </main>
    </div>
  );
}
