import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type Declaration } from '../lib/api';
import { useAuth } from '../auth/AuthContext';

export function MesDeclarations() {
  const { token } = useAuth();
  const [items, setItems] = useState<Declaration[] | null>(null);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    if (!token) return;
    api
      .mesDeclarations(token)
      .then((r) => setItems(r.items))
      .catch(() => setErreur('Impossible de charger vos demandes.'));
  }, [token]);

  return (
    <>
      <h1>Mes demandes</h1>
      {erreur && <div className="alerte alerte--erreur">{erreur}</div>}

      <div className="carte">
        {items === null && !erreur && <p className="muet">Chargement…</p>}
        {items?.length === 0 && (
          <p className="muet">
            Aucune demande pour l'instant. <Link to="/nouvelle-declaration">En créer une</Link>.
          </p>
        )}
        {items && items.length > 0 && (
          <ul className="liste-dossier">
            {items.map((d) => (
              <li key={d.id}>
                <Link to={`/declarations/${d.id}`}>
                  Déclaration de naissance — {d.enfant?.prenoms} {d.enfant?.nom}
                  <br />
                  <span className="muet">{d.numeroSuivi}</span>
                </Link>
                <span className="badge">{d.statut}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
