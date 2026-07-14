import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { RouteProtegee } from './components/ProtectedRoute';
import { RouteAgent } from './components/RouteAgent';
import { Logo } from './components/Logo';
import { AgentTableauDeBord } from './pages/agent/AgentTableauDeBord';
import { AgentDetailDeclaration } from './pages/agent/AgentDetailDeclaration';
import { Inscription } from './pages/Inscription';
import { VerifierOtp } from './pages/VerifierOtp';
import { Connexion } from './pages/Connexion';
import { TableauDeBord } from './pages/TableauDeBord';
import { NouvelleDeclaration } from './pages/NouvelleDeclaration';
import { MesDeclarations } from './pages/MesDeclarations';
import { DetailDeclaration } from './pages/DetailDeclaration';

export function App() {
  const { token, citoyen, deconnexion } = useAuth();
  const naviguer = useNavigate();

  return (
    <>
      <header className="app-entete">
        <Link to="/" className="app-entete__marque"><Logo />e-Mairie</Link>
        {token && (
          <button
            className="btn btn--secondaire"
            onClick={() => {
              deconnexion();
              naviguer('/connexion');
            }}
          >
            {citoyen ? `Déconnexion (${citoyen.prenoms})` : 'Déconnexion'}
          </button>
        )}
      </header>

      <main className="conteneur">
        <Routes>
          <Route path="/inscription" element={<Inscription />} />
          <Route path="/otp" element={<VerifierOtp />} />
          <Route path="/connexion" element={<Connexion />} />
          <Route path="/" element={<RouteProtegee><TableauDeBord /></RouteProtegee>} />
          <Route
            path="/nouvelle-declaration"
            element={<RouteProtegee><NouvelleDeclaration /></RouteProtegee>}
          />
          <Route
            path="/mes-declarations"
            element={<RouteProtegee><MesDeclarations /></RouteProtegee>}
          />
          <Route
            path="/declarations/:id"
            element={<RouteProtegee><DetailDeclaration /></RouteProtegee>}
          />
          <Route path="/agent" element={<RouteAgent><AgentTableauDeBord /></RouteAgent>} />
          <Route
            path="/agent/declarations/:id"
            element={<RouteAgent><AgentDetailDeclaration /></RouteAgent>}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
