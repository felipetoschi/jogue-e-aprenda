import { infoNivel } from '@jogue/progressao';
import { NavLink, Outlet } from 'react-router';
import { useProgresso } from '../estado/progresso';
import { Marca } from './Marca';

export function Layout() {
  const { perfil } = useProgresso();
  const { nivel, titulo } = infoNivel(perfil.xp);
  return (
    <div className="app">
      <header className="topo">
        <NavLink to="/" className="marca">
          <Marca />
          <span>Jogue e Aprenda</span>
        </NavLink>
        <nav className="menu" aria-label="Principal">
          <NavLink to="/" end>
            Início
          </NavLink>
          <NavLink to="/jogos">Jogos</NavLink>
          <NavLink to="/progresso">Progresso</NavLink>
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
