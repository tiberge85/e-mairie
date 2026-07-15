import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

/**
 * Tableau de bord citoyen — mise en page « Lumière Citoyenne » : carte héro
 * bleu marine pour l'action principale, puis tuiles. Les tuiles « à venir »
 * correspondent aux fonctions post-v1 du cahier des charges.
 */
export function TableauDeBord() {
  const { citoyen } = useAuth();
  if (citoyen && citoyen.role !== 'CITOYEN') return <Navigate to="/agent" replace />;

  return (
    <>
      <h1>Bonjour, {citoyen?.prenoms ?? ''}</h1>
      <p className="sous-titre">
        Bienvenue sur votre portail citoyen. Suivez vos démarches en temps réel et
        accédez à vos documents officiels en un clic.
      </p>

      <div className="carte--hero">
        <span className="badge badge--or">Action recommandée</span>
        <h2 style={{ marginTop: 14 }}>Nouvelle demande</h2>
        <p>
          Déclarez une naissance et préparez votre dossier d'état civil via notre
          formulaire intelligent, pièces à l'appui.
        </p>
        <Link to="/nouvelle-declaration" className="lien-or">Démarrer une procédure →</Link>
      </div>

      <div className="tuiles">
        <Link className="tuile" to="/mes-declarations">
          <span className="tuile__icone">📁</span>
          <span className="tuile__titre">Mes demandes</span>
          <span className="muet">Suivez l'avancement de vos dossiers.</span>
        </Link>
        <Link className="tuile" to="/bientot/documents">
          <span className="tuile__icone">📄</span>
          <span className="tuile__titre">Documents</span>
          <span className="muet">Bientôt disponible.</span>
        </Link>
        <Link className="tuile" to="/bientot/notifications">
          <span className="tuile__icone">🔔</span>
          <span className="tuile__titre">Notifications</span>
          <span className="muet">Bientôt disponible.</span>
        </Link>
        <Link className="tuile" to="/bientot/profil">
          <span className="tuile__icone">👤</span>
          <span className="tuile__titre">Profil</span>
          <span className="muet">Bientôt disponible.</span>
        </Link>
      </div>
    </>
  );
}
