import { HashRouter, Link, Navigate, Route, Routes } from 'react-router';
import { Layout } from './componentes/Layout';
import { ProvedorProgresso } from './estado/progresso';
import { Catalogo } from './paginas/Catalogo';
import { Inicio } from './paginas/Inicio';
import { Jogar } from './paginas/Jogar';
import { Mapa } from './paginas/Mapa';
import { Perfil } from './paginas/Perfil';
import { Resultado } from './paginas/Resultado';

function NaoEncontrada() {
  return (
    <div className="pilha">
      <h1>Página não encontrada</h1>
      <Link to="/">Voltar ao início</Link>
    </div>
  );
}

// HashRouter: as rotas ficam depois do "#", então o site roda em qualquer hospedagem estática.
export function App() {
  return (
    <ProvedorProgresso>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Inicio />} />
            <Route path="mapa" element={<Mapa />} />
            <Route path="jogos" element={<Catalogo />} />
            <Route path="resultado" element={<Resultado />} />
            <Route path="perfil" element={<Perfil />} />
            <Route path="sobre" element={<Navigate to="/" replace />} />
            <Route path="jogar/:jogoId" element={<Jogar />} />
            <Route path="*" element={<NaoEncontrada />} />
          </Route>
        </Routes>
      </HashRouter>
    </ProvedorProgresso>
  );
}
