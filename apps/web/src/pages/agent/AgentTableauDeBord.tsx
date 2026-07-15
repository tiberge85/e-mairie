import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
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

/** Action rapide proposée selon le statut (le back-end contrôle la transition). */
function actionRapide(statut: string): { label: string; cible: string } | null {
  switch (statut) {
    case 'Soumis': return { label: 'Prendre en charge', cible: 'EnVerification' };
    case 'EnVerification': return { label: 'Valider', cible: 'Valide' };
    case 'Valide': return { label: "Générer l'acte", cible: 'ActeGenere' };
    case 'ActeGenere': return { label: 'Rendre disponible', cible: 'Disponible' };
    default: return null;
  }
}

export function AgentTableauDeBord() {
  const { token } = useAuth();
  const [stats, setStats] = useState<StatsAgent | null>(null);
  const [priorites, setPriorites] = useState<Declaration[]>([]);
  const [statutTable, setStatutTable] = useState('Soumis');
  const [saisie, setSaisie] = useState('');
  const [recherche, setRecherche] = useState('');
  const [rows, setRows] = useState<Declaration[] | null>(null);
  const [actionEnCours, setActionEnCours] = useState<string | null>(null);

  const chargerStats = useCallback(() => {
    if (!token) return;
    api.statsAgent(token).then(setStats).catch(() => {});
    Promise.all([
      api.listerAgent(token, { statut: 'PiecesDemandees' }),
      api.listerAgent(token, { statut: 'Soumis' }),
    ])
      .then(([pc, so]) => setPriorites([...pc.items, ...so.items].slice(0, 4)))
      .catch(() => {});
  }, [token]);

  const chargerTable = useCallback(() => {
    if (!token) return;
    setRows(null);
    const opts = recherche ? { recherche } : { statut: statutTable };
    api.listerAgent(token, opts).then((r) => setRows(r.items)).catch(() => setRows([]));
  }, [token, statutTable, recherche]);

  useEffect(() => { chargerStats(); }, [chargerStats]);
  useEffect(() => { chargerTable(); }, [chargerTable]);

  function rechercher(e: FormEvent) {
    e.preventDefault();
    setRecherche(saisie.trim());
  }
  function effacer() { setSaisie(''); setRecherche(''); }
  function choisirPill(statut: string) { setRecherche(''); setSaisie(''); setStatutTable(statut); }

  async function agirRapide(id: string, cible: string) {
    if (!token) return;
    setActionEnCours(id);
    try {
      await api.changerStatut(id, cible, undefined, token);
      chargerStats();
      chargerTable();
    } finally {
      setActionEnCours(null);
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
                  <div className="muet">Dossier {d.numeroSuivi} — {d.enfant?.prenoms} {d.enfant?.nom}</div>
                  <div className="prio__meta">
                    <span>{new Date(d.creeLe).toLocaleDateString('fr-FR')}</span>
                    <Link to={`/agent/declarations/${d.id}`}>Traiter →</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="carte">
          <h2>Recherche</h2>
          <p className="muet" style={{ marginTop: -4, marginBottom: 16 }}>
            Par numéro de dossier ou nom de l'enfant.
          </p>
          <form onSubmit={rechercher}>
            <label className="champ">
              <span className="champ__label">Numéro ou nom</span>
              <input value={saisie} onChange={(e) => setSaisie(e.target.value)} placeholder="Ex : ND-2026-… ou Diallo" />
            </label>
            <button type="submit" className="btn btn--bloc">🔍 Rechercher</button>
          </form>
        </div>
      </div>

      <div className="carte">
        <div className="entete-section">
          <h2>{recherche ? `Résultats pour « ${recherche} »` : 'Dossiers en attente'}</h2>
          {recherche ? (
            <button className="pill" onClick={effacer}>✕ Effacer</button>
          ) : (
            <div className="pills">
              {PILLS.map((p) => (
                <button
                  key={p.statut}
                  className={`pill ${statutTable === p.statut ? 'pill--actif' : ''}`}
                  onClick={() => choisirPill(p.statut)}
                >
                  {p.label}{stats ? ` (${stats[p.cle]})` : ''}
                </button>
              ))}
            </div>
          )}
        </div>

        {rows === null && <p className="muet">Chargement…</p>}
        {rows && rows.length === 0 && <p className="muet">Aucun dossier.</p>}
        {rows && rows.length > 0 && (
          <div className="tableau-wrap">
            <table className="tableau">
              <thead>
                <tr><th>Numéro</th><th>Citoyen</th><th>Type</th><th>Date</th><th>Statut</th><th>Action</th></tr>
              </thead>
              <tbody>
                {rows.map((d) => {
                  const act = actionRapide(d.statut);
                  return (
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
                      <td>
                        {act ? (
                          <button
                            className="btn"
                            style={{ padding: '6px 12px', fontSize: '0.82rem' }}
                            disabled={actionEnCours === d.id}
                            onClick={() => agirRapide(d.id, act.cible)}
                          >
                            {actionEnCours === d.id ? '…' : act.label}
                          </button>
                        ) : (
                          <Link to={`/agent/declarations/${d.id}`}>Ouvrir</Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
