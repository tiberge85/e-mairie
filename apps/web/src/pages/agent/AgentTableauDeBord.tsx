import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type Declaration } from '../../lib/api';
import { useAuth } from '../../auth/AuthContext';

const STATUTS = [
  'Soumis',
  'EnVerification',
  'PiecesDemandees',
  'Valide',
  'ActeGenere',
  'Disponible',
  'Refuse',
  'Retire',
];

/** File de traitement côté mairie, filtrable par statut. */
export function AgentTableauDeBord() {
  const { token } = useAuth();
  const [statut, setStatut] = useState('Soumis');
  const [items, setItems] = useState<Declaration[] | null>(null);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    if (!token) return;
    setItems(null);
    setErreur('');
    api
      .listerAgent(token, statut)
      .then((r) => setItems(r.items))
      .catch(() => setErreur('Chargement impossible.'));
  }, [token, statut]);

  return (
    <>
      <h1>Traitement des dossiers</h1>
      <p className="sous-titre">Espace agent d'état civil.</p>

      <div className="champ">
        <span className="champ__label">Filtrer par statut</span>
        <select value={statut} onChange={(e) => setStatut(e.target.value)}>
          {STATUTS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {erreur && <div className="alerte alerte--erreur">{erreur}</div>}

      <div className="carte">
        {items === null && !erreur && <p className="muet">Chargement…</p>}
        {items?.length === 0 && <p className="muet">Aucun dossier « {statut} ».</p>}
        {items && items.length > 0 && (
          <ul className="liste-dossier">
            {items.map((d) => (
              <li key={d.id}>
                <Link to={`/agent/declarations/${d.id}`}>
                  {d.enfant?.prenoms} {d.enfant?.nom}
                  <br />
                  <span className="muet">{d.numeroSuivi} · {new Date(d.creeLe).toLocaleDateString('fr-FR')}</span>
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
