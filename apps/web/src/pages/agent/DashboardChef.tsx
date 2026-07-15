import { useEffect, useState } from 'react';
import { api, type StatsAgent } from '../../lib/api';
import { useAuth } from '../../auth/AuthContext';
import { BanniereIllustrative } from '../../components/BanniereIllustrative';

const CHARGE = [
  { nom: 'État civil & citoyenneté', pct: 85, or: false },
  { nom: 'Urbanisme & aménagement', pct: 62, or: false },
  { nom: 'Affaires scolaires', pct: 94, or: true },
  { nom: 'Communication & culture', pct: 41, or: false },
];

const AGENDA = [
  { jour: '14', lib: 'Lun', txt: 'Comité de direction', h: '09:30 — Salle A' },
  { jour: '14', lib: 'Lun', txt: 'Revue des plannings S43', h: '15:00 — Teams' },
];

export function DashboardChef() {
  const { token } = useAuth();
  const [stats, setStats] = useState<StatsAgent | null>(null);
  useEffect(() => {
    if (!token) return;
    api.statsAgent(token).then(setStats).catch(() => {});
  }, [token]);

  return (
    <>
      <h1>Tableau de bord de supervision</h1>
      <p className="sous-titre">Suivi de l'activité administrative — performance globale et effectifs.</p>

      <BanniereIllustrative />

      <div className="stats4">
        <div className="stat">
          <div className="stat__top"><span className="stat__ico">⏱️</span><span className="stat__trend trend-warn">réel</span></div>
          <div className="stat__lib">Traitement moyen</div>
          <div className="stat__val">{stats && stats.tempsMoyenHeures !== null ? `${stats.tempsMoyenHeures} h` : '—'}</div>
          <div className="stat__sous">Objectif : 72 h (exemple)</div>
        </div>
        <div className="stat stat--or">
          <div className="stat__top"><span className="stat__ico">📚</span><span className="stat__trend trend-down">+5 %</span></div>
          <div className="stat__lib">Charge par agent (exemple)</div>
          <div className="stat__val">18,5</div>
          <div className="stat__sous">Dossiers actifs</div>
        </div>
        <div className="stat stat--vert">
          <div className="stat__top"><span className="stat__ico">✅</span><span className="stat__trend trend-warn">réel</span></div>
          <div className="stat__lib">Dossiers validés</div>
          <div className="stat__val">{stats ? stats.valides : '—'}</div>
          <div className="stat__sous">Total à ce jour</div>
        </div>
        <div className="stat stat--bleu">
          <div className="stat__top"><span className="stat__ico">📈</span><span className="stat__trend trend-up">+2 pts</span></div>
          <div className="stat__lib">Taux de réponse (exemple)</div>
          <div className="stat__val">98 %</div>
          <div className="stat__sous">Satisfaction citoyenne</div>
        </div>
      </div>

      <div className="exec-2">
        <div className="carte">
          <h2>Répartition de la charge de travail</h2>
          <p className="muet" style={{ marginTop: -4, marginBottom: 16 }}>Volume de dossiers par service vs capacité (exemple).</p>
          {CHARGE.map((c) => (
            <div className="barre" key={c.nom}>
              <div className="barre__tete"><span>{c.nom}</span><span>{c.pct} %</span></div>
              <div className="barre__track"><div className={`barre__fill ${c.or ? 'barre__fill--or' : ''}`} style={{ width: `${c.pct}%` }} /></div>
            </div>
          ))}
        </div>

        <div className="carte">
          <h2>Calendrier de service</h2>
          <p className="muet" style={{ marginTop: -4, marginBottom: 16 }}>Aujourd'hui (exemple).</p>
          {AGENDA.map((a, i) => (
            <div className="agenda__item" key={i}>
              <div className="agenda__date">
                <div className="agenda__jour">{a.jour}</div>
                <div className="agenda__lib">{a.lib}</div>
              </div>
              <div>
                <div className="agenda__txt">{a.txt}</div>
                <div className="muet">{a.h}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
