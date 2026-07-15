import { BanniereIllustrative } from '../../components/BanniereIllustrative';

const COURRIER = [
  { ref: '#CR-4502', exp: 'Préfecture du Nord', objet: "Note d'urbanisme — Zone B2", prio: 'URGENTE', date: "Aujourd'hui, 09:15" },
  { ref: '#CR-4501', exp: 'M. Jean Dupont', objet: "Demande d'occupation du domaine public", prio: 'STANDARD', date: 'Hier, 16:45' },
];

const RDV = [
  { h: '14:00', nom: 'Mme Sophie Laurent', objet: "Papiers d'identité", or: false },
  { h: '14:45', nom: 'M. Lucas Martin', objet: 'Déclaration de travaux', or: true },
];

export function DashboardSecretariat() {
  return (
    <>
      <h1>Secrétariat Général</h1>
      <p className="sous-titre">Gestion centralisée des flux administratifs et de l'accueil citoyen.</p>

      <BanniereIllustrative>
        Aperçu de maquette : les modules Courrier, Rendez-vous, Support et Appels ne sont pas encore reliés à des données réelles.
      </BanniereIllustrative>

      <div className="exec-2">
        <div className="carte">
          <div className="entete-section">
            <h2>Gestion du courrier</h2>
            <div className="pills">
              <button className="pill pill--actif">Arrivée</button>
              <button className="pill">Départ</button>
            </div>
          </div>
          <div className="tableau-wrap">
            <table className="tableau">
              <thead><tr><th>Réf.</th><th>Expéditeur / Objet</th><th>Priorité</th><th>Date</th></tr></thead>
              <tbody>
                {COURRIER.map((c) => (
                  <tr key={c.ref}>
                    <td>{c.ref}</td>
                    <td><strong>{c.exp}</strong><br /><span className="muet">{c.objet}</span></td>
                    <td>
                      <span
                        className="badge"
                        style={c.prio === 'URGENTE' ? { background: '#ffdad6', color: '#93000a' } : undefined}
                      >
                        {c.prio}
                      </span>
                    </td>
                    <td>{c.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="btn btn--secondaire btn--bloc" style={{ marginTop: 16, borderStyle: 'dashed' }} disabled>
            + Enregistrer un nouveau courrier
          </button>
        </div>

        <div className="carte">
          <h2>Rendez-vous</h2>
          {RDV.map((r) => (
            <div
              key={r.h}
              style={{ borderLeft: `4px solid ${r.or ? 'var(--gold)' : 'var(--navy)'}`, padding: '10px 14px', marginBottom: 12, background: 'var(--surface-2)', borderRadius: 8 }}
            >
              <div className="muet" style={{ fontSize: '0.72rem' }}>RDV — {r.h}</div>
              <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{r.nom}</div>
              <div className="muet">{r.objet}</div>
            </div>
          ))}
          <button className="btn btn--bloc" disabled>🗓️ Fixer un nouveau rendez-vous</button>
        </div>
      </div>

      <div className="exec-2" style={{ marginTop: 20 }}>
        <div className="carte">
          <h2>Support citoyen</h2>
          <div className="bulle">Bonjour, je n'arrive pas à trouver le formulaire pour la cantine scolaire.</div>
          <div className="bulle bulle--moi">Bonjour. Vous le trouverez dans « Services » &gt; « Éducation ». Souhaitez-vous le lien direct ?</div>
          <label className="champ" style={{ marginTop: 12 }}>
            <input placeholder="Répondre au citoyen…" disabled />
          </label>
        </div>

        <div className="carte">
          <h2>Registre des appels</h2>
          <ul className="liste-dossier">
            <li><span>📥 06 XX XX 34 12</span><span className="muet">Il y a 12 min</span></li>
            <li><span>📕 Inconnu</span><span className="muet">Il y a 45 min</span></li>
          </ul>
          <button className="btn btn--secondaire btn--bloc" style={{ marginTop: 12 }} disabled>
            Consigner un appel
          </button>
        </div>
      </div>
    </>
  );
}
