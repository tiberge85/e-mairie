import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

/**
 * Tableau de bord citoyen. Les tuiles « à venir » sont affichées mais inactives :
 * elles correspondent aux fonctions post-v1 du cahier des charges (paiements,
 * rendez-vous…).
 */
export function TableauDeBord() {
  const { citoyen } = useAuth();
  return (
    <>
      <h1>Bonjour {citoyen?.prenoms ?? ''}</h1>
      <p className="sous-titre">Que souhaitez-vous faire aujourd'hui ?</p>

      <div className="tuiles">
        <Link className="tuile" to="/nouvelle-declaration">➕ Nouvelle demande</Link>
        <Link className="tuile" to="/mes-declarations">📁 Mes demandes</Link>
        <span className="tuile" style={{ opacity: 0.5 }}>📄 Documents<br /><span className="muet">bientôt</span></span>
        <span className="tuile" style={{ opacity: 0.5 }}>🔔 Notifications<br /><span className="muet">bientôt</span></span>
        <span className="tuile" style={{ opacity: 0.5 }}>💳 Paiements<br /><span className="muet">bientôt</span></span>
        <span className="tuile" style={{ opacity: 0.5 }}>📅 Rendez-vous<br /><span className="muet">bientôt</span></span>
      </div>
    </>
  );
}
