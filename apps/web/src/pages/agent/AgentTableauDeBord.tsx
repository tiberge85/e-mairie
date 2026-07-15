import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, type Declaration, type StatsAgent } from '../../lib/api';
import { useAuth } from '../../auth/AuthContext';

function initiales(prenoms?: string, nom?: string): string {
  const i = `${(prenoms ?? '').charAt(0)}${(nom ?? '').charAt(0)}`.toUpperCase();
  return i || '—';
}

const PILLS = [
  { label: 'À traiter', statut: 'Soumis', cle: 'enAttente' as const },
  { label: 'En vérification', statut: 'EnVerification', cle: 'enCours' as const },
  { label: 'Compléments', statut: 'PiecesDemandees', cle: 'piecesDemandees' as const },
];

/**
 * Console de gestion agent — reproduction de la maquette : indicateurs, tâches
 * prioritaires, recherche avancée, et table des dossiers en attente.
 */
export function AgentTableauDeBord() {
  const { token } = useAuth();
  const naviguer = useNavigate();
  const [stats, setStats] = useState<StatsAgent | null>(null);
  const [priorites, setPriorites] = useState<Declaration[]>([]);
  const [statutTable, setStatutTable] = useState('Soumis');
  const [rows, setRows] = useState<Declaration[] | null>(null);
  const [identifiant, setIdentifiant] = useState('');
  const [rechercheMsg, setRechercheMsg] = useState('');

  useEffect(() => {
    if (!token) return;
    api.statsAgent(token).then(setStats).catch(() => {});
    Promise.all([api.listerAgent(token, 'PiecesDemandees'), api.listerAgent(token, 'Soumis')])
      .then(([pc, so]) => setPriorites([...pc.items, ...so.items].slice(0, 4)))
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!token) return;
    setRows(null);
    api.listerAgent(token, statutTable).then((r) => setRows(r.items)).catch(() => setRows([]));
  }, [token, statutTable]);

  async function rechercher(e: FormEvent) {
    e.preventDefault();
    setRechercheMsg('');
    if (!token || !identifiant.trim()) {
      setRechercheMsg('Saisissez un numéro de dossier.');
      return;
    }
    try {
      const r = await api.listerAgent(token, identifiant.trim());
      if (r.items.length > 0) naviguer(`/agent/declarations/${r.items[0].id}`);
      else setRechercheMsg('Aucun dossier ne correspond à ce numéro.');
    } catch {
      setRechercheMsg('Recherche impossible.');
    }
  }

  return (
    <>
      <h1>Console de gestion</h1>
      <p className="sous-titre">Espace agent d'état civil — vue d'ensemble et traitement.</p>

      {stats && (
        <div className="kpis">
          <div className="kpi"><div className="kpi__val">{stats.recusAujourdhui}</div><div className="kpi__lib">Reçus aujourd'hui</div></div>
          <div className="kpi kpi--or"><div className="kpi__val">{stats.enAttente}</div><div className="kpi__lib">En attente</div></div>
          <div className="kpi"><div className="kpi__val">{stats.enCours}</div><div className="kpi__lib">En cours</div></div>
          <div className="kpi kpi--vert"><div className="kpi__val">{stats.valides}</div><div className="kpi__lib">Validés</div></div>
          <div className="kpi kpi--rouge"><div className="kpi__val">{stats.rejetes}</div><div className="kpi__lib">Rejetés</div></div>
          <div className="kpi"><div className="kpi__val">{stats.tempsMoyenHeures !== null ? `${stats.tempsMoyenHeures} h` : '—'}</div><div className="kpi__lib">Temps moyen</div></div>
        </div>
      )}

      <div className="console-haut">
        {/* Tâches prioritaires */}
        <div className="carte">
          <h2>Tâches prioritaires</h2>
          <p className="muet" style={{ marginTop: -4, marginBottom: 16 }}>
            {priorites.length > 0
              ? `${priorites.length} dossier(s) requièrent votre attention.`
              : 'Aucune tâche prioritaire pour le moment.'}
          </p>
          {priorites.length > 0 && (
            <div className="prio">
              {priorites.map((d) => (
                <div className="prio__item" key={d.id}>
                  <div className="prio__ligne1">
                    <span>{d.statut === 'PiecesDemandees' ? '📎' : '🛡️'}</span>
                    {d.statut === 'PiecesDemandees' ? 'Compléments reçus' : 'À vérifier'}
                  </div>
                  <div className="muet">
                    Dossier {d.numeroSuivi} — {d.enfant?.prenoms} {d.enfant?.nom}
                  </div>
                  <div className="prio__meta">
                    <span>{new Date(d.creeLe).toLocaleDateString('fr-FR')}</span>
                    <Link to={`/agent/declarations/${d.id}`}>Traiter →</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recherche avancée */}
        <div className="carte">
          <h2>Recherche</h2>
          <p className="muet" style={{ marginTop: -4, marginBottom: 16 }}>
            Localisez un dossier par son numéro de suivi.
          </p>
          <form onSubmit={rechercher}>
            <label className="champ">
              <span className="champ__label">Numéro de dossier</span>
              <input
                value={identifiant}
                onChange={(e) => setIdentifiant(e.target.value)}
                placeholder="Ex : ND-2026-000123"
              />
            </label>
            {rechercheMsg && <div className="alerte alerte--info">{rechercheMsg}</div>}
            <button type="submit" className="btn btn--bloc">🔍 Lancer la recherche</button>
          </form>
        </div>
      </div>

      {/* Dossiers en attente */}
      <div className="carte">
        <div className="entete-section">
          <h2>Dossiers en attente</h2>
          <div className="pills">
            {PILLS.map((p) => (
              <button
                key={p.statut}
                className={`pill ${statutTable === p.statut ? 'pill--actif' : ''}`}
                onClick={() => setStatutTable(p.statut)}
              >
                {p.label}{stats ? ` (${stats[p.cle]})` : ''}
              </button>
            ))}
          </div>
        </div>

        {rows === null && <p className="muet">Chargement…</p>}
        {rows && rows.length === 0 && <p className="muet">Aucun dossier dans cette file.</p>}
        {rows && rows.length > 0 && (
          <div className="tableau-wrap">
            <table className="tableau">
              <thead>
                <tr>
                  <th>Numéro</th><th>Citoyen</th><th>Type</th><th>Date dépôt</th><th>Statut</th><th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((d) => (
                  <tr key={d.id}>
                    <td><Link to={`/agent/declarations/${d.id}`}>{d.numeroSuivi}</Link></td>
                    <td>
                      <span className="cell-citoyen">
                        <span className="avatar">{initiales(d.enfant?.prenoms, d.enfant?.nom)}</span>
                        {d.enfant?.prenoms} {d.enfant?.nom}
                      </span>
                    </td>
                    <td>Déclaration de naissance</td>
                    <td>{new Date(d.creeLe).toLocaleDateString('fr-FR')}</td>
                    <td><span className="badge">{d.statut}</span></td>
                    <td><Link to={`/agent/declarations/${d.id}`}>Ouvrir</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
