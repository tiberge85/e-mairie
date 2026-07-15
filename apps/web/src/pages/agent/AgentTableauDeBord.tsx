import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type StatsAgent } from '../../lib/api';
import { useAuth } from '../../auth/AuthContext';

export function AgentTableauDeBord() {
  const { token } = useAuth();
  const [stats, setStats] = useState<StatsAgent | null>(null);

  useEffect(() => {
    if (!token) return;
    api.statsAgent(token).then(setStats).catch(() => {});
  }, [token]);

  return (
    <>
      <h1>Tableau de bord</h1>
      <p className="sous-titre">Espace agent d'état civil — vue d'ensemble de l'activité.</p>

      {!stats && <p className="muet">Chargement des indicateurs…</p>}

      {stats && (
        <>
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

          <div style={{ marginBottom: 20 }}>
            <Link to="/agent/dossiers" className="btn">Ouvrir la file des dossiers →</Link>
          </div>

          <div className="carte">
            <h2>Activité récente</h2>
            {stats.activite.length === 0 ? (
              <p className="muet">Aucune activité pour l'instant.</p>
            ) : (
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
            )}
          </div>
        </>
      )}
    </>
  );
}
