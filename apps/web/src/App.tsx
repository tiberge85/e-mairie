import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useAuth } from './auth/AuthContext';
import { RouteProtegee } from './components/ProtectedRoute';
import { RouteAgent } from './components/RouteAgent';
import { Logo } from './components/Logo';
import { CadreEtroit } from './components/CadreEtroit';
import { AgentLayout } from './components/AgentLayout';
import { EnConstruction } from './components/EnConstruction';
import { Inscription } from './pages/Inscription';
import { VerifierOtp } from './pages/VerifierOtp';
import { Connexion } from './pages/Connexion';
import { TableauDeBord } from './pages/TableauDeBord';
import { NouvelleDeclaration } from './pages/NouvelleDeclaration';
import { MesDeclarations } from './pages/MesDeclarations';
import { DetailDeclaration } from './pages/DetailDeclaration';
import { AgentTableauDeBord } from './pages/agent/AgentTableauDeBord';
import { AgentDossiers } from './pages/agent/AgentDossiers';
import { AgentDetailDeclaration } from './pages/agent/AgentDetailDeclaration';
import { DashboardMaire } from './pages/agent/DashboardMaire';
import { DashboardChef } from './pages/agent/DashboardChef';
import { DashboardSecretariat } from './pages/agent/DashboardSecretariat';

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

      <Routes>
        {/* Écrans citoyen & authentification — cadre étroit centré */}
        <Route element={<CadreEtroit />}>
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
          <Route path="/bientot/:module" element={<RouteProtegee><EnConstruction /></RouteProtegee>} />
        </Route>

        {/* Back-office agent — menu latéral */}
        <Route path="/agent" element={<RouteAgent><AgentLayout /></RouteAgent>}>
          <Route index element={<AgentTableauDeBord />} />
          <Route path="dossiers" element={<AgentDossiers />} />
          <Route path="declarations/:id" element={<AgentDetailDeclaration />} />
          <Route path="maire" element={<DashboardMaire />} />
          <Route path="performance" element={<DashboardChef />} />
          <Route path="secretariat" element={<DashboardSecretariat />} />
          <Route path="bientot/:module" element={<EnConstruction />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
