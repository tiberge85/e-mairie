import { useEffect, useState } from 'react';
import { api, type StatsAgent } from '../../lib/api';
import { useAuth } from '../../auth/AuthContext';
import { BanniereIllustrative } from '../../components/BanniereIllustrative';

/** Barres illustratives d'activité par service (le module multi-services n'existe pas encore). */
const SERVICES = [
  { nom: 'État civil', pct: 88, or: false },
  { nom: 'Urbanisme', pct: 62, or: false },
  { nom: 'Technique', pct: 74, or: false },
  { nom: 'Social', pct: 45, or: false },
  { nom: 'Éducation', pct: 94, or: true },
];

export function DashboardMaire() {
  const { token } = useAuth();
  const [stats, setStats] = useState<StatsAgent | null>(null);
  useEffect(() => {
    if (!token) return;
    api.statsAgent(token).then(setStats).catch(() => {});
  }, [token]);

  const demandesEnCours = stats ? stats.enAttente + stats.enCours : null;

  return (
    <>
      <p className="surtitre">Cabinet du Maire</p>
      <h1>Tableau de bord stratégique</h1>
      <p className="sous-titre">Pilotage de la commune — vue consolidée.</p>

      <BanniereIllustrative />

      <div className="stats4">
        <div className="stat">
          <div className="stat__top"><span className="stat__ico">👥</span><span className="stat__trend trend-up">+2,4 %</span></div>
          <div className="stat__lib">Population (exemple)</div>
          <div className="stat__val">42 850</div>
        </div>
        <div className="stat stat--or">
          <div className="stat__top"><span className="stat__ico">📨</span><span className="stat__trend trend-warn">réel</span></div>
          <div className="stat__lib">Demandes en cours</div>
          <div className="stat__val">{demandesEnCours ?? '—'}</div>
        </div>
        <div className="stat stat--vert">
          <div className="stat__top"><span className="stat__ico">😊</span><span className="stat__trend trend-up">+5 pts</span></div>
          <div className="stat__lib">Satisfaction (exemple)</div>
          <div className="stat__val">89,4 %</div>
        </div>
        <div className="stat stat--bleu">
          <div className="stat__top"><span className="stat__ico">💶</span><span className="stat__trend">62 % utilisé</span></div>
          <div className="stat__lib">Budget alloué (exemple)</div>
          <div className="stat__val">12,5 M€</div>
        </div>
      </div>

      <div className="exec-2">
        <div className="carte">
          <h2>Activité des services municipaux</h2>
          <p className="muet" style={{ marginTop: -4 }}>Volume de dossiers traités par département (exemple).</p>
          <div className="cbars">
            {SERVICES.map((s) => (
              <div className="cbar" key={s.nom}>
                <div className={`cbar__b ${s.or ? 'cbar__b--or' : ''}`} style={{ height: `${s.pct}%` }} />
                <div className="cbar__lib">{s.nom}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="carte--hero">
          <h2 style={{ color: 'var(--gold-bright)' }}>Alertes critiques</h2>
          <div className="acrit">
            <span className="acrit__tag acrit__tag--urg">URGENT</span>
            <h3>Coupure d'eau — Quartier Nord</h3>
            <p>Rupture de canalisation. Équipes sur place.</p>
          </div>
          <div className="acrit">
            <span className="acrit__tag acrit__tag--suivi">SUIVI</span>
            <h3>Alerte météo — Orages</h3>
            <p>Vigilance orange à partir de 18 h 00.</p>
          </div>
        </div>
      </div>

      <div className="exec-2" style={{ marginTop: 20 }}>
        <div className="carte">
          <h2>Signalements en temps réel</h2>
          <div className="carte-plan">🗺️ Cartographie des signalements par quartier (à venir)</div>
          <ul className="fil" style={{ marginTop: 12 }}>
            <li><span className="fil__point" /><span className="fil__txt">Voirie : nid-de-poule signalé rue de la Paix <span className="fil__meta">· exemple</span></span></li>
            <li><span className="fil__point" /><span className="fil__txt">Éclairage : lampadaire HS place du Marché <span className="fil__meta">· exemple</span></span></li>
          </ul>
        </div>

        <div className="carte">
          <h2>À valider</h2>
          {['Décret : rénovation Parc Central', 'Planning : Fête de la Musique', 'Subvention : « Sport pour Tous »'].map((t) => (
            <div key={t} style={{ borderBottom: '1px solid var(--line-soft)', padding: '12px 0' }}>
              <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{t}</div>
              <div className="barre-boutons" style={{ marginTop: 8, justifyContent: 'flex-start' }}>
                <button className="btn" disabled>Approuver</button>
                <button className="btn btn--secondaire" disabled>Consulter</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
