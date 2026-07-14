import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, type Declaration } from '../lib/api';
import { useAuth } from '../auth/AuthContext';

export function DetailDeclaration() {
  const { id } = useParams();
  const { token } = useAuth();
  const [decl, setDecl] = useState<Declaration | null>(null);
  const [message, setMessage] = useState('');
  const [erreur, setErreur] = useState('');
  const [enCours, setEnCours] = useState(false);

  useEffect(() => {
    if (!token || !id) return;
    api
      .maDeclaration(id, token)
      .then(setDecl)
      .catch(() => setErreur('Déclaration introuvable.'));
  }, [id, token]);

  async function soumettre() {
    if (!token || !id) return;
    setEnCours(true);
    setErreur('');
    try {
      const misAJour = await api.soumettreDeclaration(id, token);
      setDecl(misAJour);
      setMessage(`Demande envoyée. Numéro de suivi : ${misAJour.numeroSuivi}`);
    } catch {
      setErreur("L'envoi a échoué. Réessayez.");
    } finally {
      setEnCours(false);
    }
  }

  if (erreur && !decl) return <div className="alerte alerte--erreur">{erreur}</div>;
  if (!decl) return <p className="muet">Chargement…</p>;

  return (
    <>
      <h1>Déclaration de naissance</h1>
      <p className="sous-titre">
        {decl.enfant?.prenoms} {decl.enfant?.nom}
      </p>

      {message && <div className="alerte alerte--succes">{message}</div>}
      {erreur && <div className="alerte alerte--erreur">{erreur}</div>}

      <div className="carte">
        <p>
          Statut : <span className="badge">{decl.statut}</span>
        </p>
        <dl className="recap">
          <dt>Numéro de suivi</dt>
          <dd>{decl.numeroSuivi}</dd>
          {decl.numeroActeOfficiel && (
            <>
              <dt>Numéro d'acte officiel</dt>
              <dd>{decl.numeroActeOfficiel}</dd>
            </>
          )}
          <dt>Créée le</dt>
          <dd>{new Date(decl.creeLe).toLocaleString('fr-FR')}</dd>
        </dl>

        {decl.statut === 'Brouillon' && (
          <button className="btn btn--bloc" onClick={soumettre} disabled={enCours}>
            {enCours ? 'Envoi…' : 'Envoyer ma demande'}
          </button>
        )}
      </div>
    </>
  );
}
