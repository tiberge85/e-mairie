import { Link, useParams } from 'react-router-dom';

/** Libellés des rubriques encore en préparation (référence : cahier des charges). */
const MODULES: Record<string, { titre: string; desc: string }> = {
  documents: { titre: 'Documents', desc: 'Vos actes générés, justificatifs et dossiers archivés seront regroupés ici, avec téléchargement et QR de vérification.' },
  notifications: { titre: 'Notifications', desc: 'Le suivi en temps réel de vos démarches (changements de statut, demandes de pièces) s\'affichera ici.' },
  profil: { titre: 'Profil', desc: 'La gestion de votre compte (coordonnées, mot de passe, préférences) arrive bientôt.' },
  paiements: { titre: 'Paiements', desc: 'Le règlement en ligne des frais administratifs éventuels sera proposé ici.' },
  'rendez-vous': { titre: 'Rendez-vous', desc: 'La prise de créneau pour finaliser ou retirer un acte sera disponible ici.' },
  'services-techniques': { titre: 'Services techniques', desc: 'Voirie, urbanisme, éclairage… la gestion des services techniques est prévue dans une prochaine phase.' },
  administration: { titre: 'Administration', desc: 'Gestion des comptes agents, rôles et permissions — module d\'administration à venir.' },
  support: { titre: 'Support', desc: 'Le centre d\'aide et de support interne arrive prochainement.' },
  parametres: { titre: 'Paramètres', desc: 'Le paramétrage de la commune (numérotation des actes, circuits de validation…) sera disponible ici.' },
};

export function EnConstruction() {
  const { module } = useParams();
  const info = MODULES[module ?? ''] ?? {
    titre: 'Module en préparation',
    desc: 'Cette rubrique fait partie de la feuille de route et sera bientôt disponible.',
  };

  return (
    <>
      <h1>{info.titre}</h1>
      <div className="carte" style={{ textAlign: 'center', padding: '40px 24px' }}>
        <div style={{ fontSize: '2.4rem' }}>🚧</div>
        <h2 style={{ marginTop: 8 }}>Module en préparation</h2>
        <p className="muet" style={{ maxWidth: 460, margin: '8px auto 20px' }}>{info.desc}</p>
        <Link to="/" className="btn btn--secondaire">← Retour à l'accueil</Link>
      </div>
    </>
  );
}
