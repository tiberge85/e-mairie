import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { useAuth } from '../auth/AuthContext';

/**
 * Cadre du back-office agent, reproduit d'après la maquette « Console de gestion
 * agent municipal » : marque Hôtel de Ville, menu de rubriques, déconnexion.
 * Les rubriques non encore développées sont affichées mais désactivées.
 */
const lienClasse = ({ isActive }: { isActive: boolean }) =>
  `bo__lien ${isActive ? 'bo__lien--actif' : ''}`;

export function AgentLayout() {
  const { deconnexion } = useAuth();
  const naviguer = useNavigate();

  return (
    <main className="bo">
      <aside className="bo__nav">
        <div className="bo__marque">
          <Logo />
          <div>
            <div className="bo__marque__titre">Hôtel de Ville</div>
            <div className="bo__marque__sous">Portail administratif</div>
          </div>
        </div>

        <NavLink to="/agent" end className={lienClasse}>
          <span className="bo__ico">📊</span> Vue d'ensemble
        </NavLink>
        <NavLink to="/agent/dossiers" className={lienClasse}>
          <span className="bo__ico">📁</span> Dossiers
        </NavLink>
        <NavLink to="/agent/secretariat" className={lienClasse}>
          <span className="bo__ico">📝</span> Secrétariat
        </NavLink>
        <NavLink to="/agent/bientot/services-techniques" className={lienClasse}>
          <span className="bo__ico">🛠️</span> Services techniques
        </NavLink>
        <NavLink to="/agent/maire" className={lienClasse}>
          <span className="bo__ico">🏛️</span> Cabinet du Maire
        </NavLink>
        <NavLink to="/agent/bientot/administration" className={lienClasse}>
          <span className="bo__ico">🛡️</span> Administration
        </NavLink>
        <NavLink to="/agent/performance" className={lienClasse}>
          <span className="bo__ico">📈</span> Statistiques
        </NavLink>

        <span className="bo__sep" />
        <NavLink to="/agent/bientot/support" className={lienClasse}>
          <span className="bo__ico">💬</span> Support
        </NavLink>
        <NavLink to="/agent/bientot/parametres" className={lienClasse}>
          <span className="bo__ico">⚙️</span> Paramètres
        </NavLink>
        <button
          className="bo__lien bo__decon"
          onClick={() => { deconnexion(); naviguer('/connexion'); }}
        >
          <span className="bo__ico">↩︎</span> Déconnexion
        </button>
      </aside>

      <section className="bo__contenu">
        <Outlet />
      </section>
    </main>
  );
}
