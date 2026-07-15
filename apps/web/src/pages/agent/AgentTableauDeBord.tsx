import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type Declaration, type StatsAgent } from '../../lib/api';
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

export function AgentTableauDeBord() {
  const { token } = useAuth();
  const [stats, setStats] = useState<StatsAgent | null>(null);
  const [statut, setStatut] = useState('Soumis');
  const [items, setItems] = useState<Declaration[] | null>(null);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    if (!token) return;
    api.statsAgent(token).then(setStats).catch(() => {});
  }, [token]);

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
      <p className="sous-titre">Espace agent d'état civil — vue d'ensemble et file de traitement.</p>

      {/* Indicateurs clés */}
      {stats && (
        <div className="kpis">
          <div className="kpi"><div className="kpi__val">{stats.recusAujourdhui}</div><div className="kpi__lib">Reçus aujourd'hui</div></div>
          <div className="kpi kpi--or"><div className="kpi__val">{stats.enAttente}</div><div className="kpi__lib">En attente</div></div>
          <div className="kpi"><div className="kpi__val">{stats.enCours}</div><div className="kpi__lib">En cours</div></div>
          <div className="kpi kpi--vert"><div className="kpi__val">{stats.valides}</div><div className="kpi__lib">Validés</div></div>
          <div className="kpi kpi--rouge"><div className="kpi__val">{stats.rejetes}</div><div className="kpi__lib">Rejetés</div></div>
          <div className="kpi">
            <div className="kpi__val">{stats.tempsMoyenHeures !== null ? `${stats.tempsMoyenHeures} h` : '—'}</div>
            <div className="kpi__lib">Temps moyen</div>
          </div>
        </div>
      )}

      {/* Chronologie d'activité */}
      {stats && stats.activite.length > 0 && (
        <div className="carte">
          <h2>Activité récente</h2>
          <ul className="fil">
            {stats.activite.map((a) => (
              <li key={a.id}>
                <span className="fil__point" />
                <span className="fil__txt">
                  {a.numeroSuivi} — {a.enfant?.prenoms} {a.enfant?.nom}
                  <br />
                  <span className="fil__meta">
                    {a.ancienStatut ? `${a.ancienStatut} → ` : ''}{a.nouveauStatut}
                    {' · '}{new Date(a.creeLe).toLocaleString('fr-FR')}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* File de traitement */}
      <div className="champ">
        <span className="champ__label">File — filtrer par statut</span>
        <select value={statut} onChange={(e) => setStatut(e.target.value)}>
          {STATUTS.map((s) => <option key={s} value={s}>{s}</option>)}
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
