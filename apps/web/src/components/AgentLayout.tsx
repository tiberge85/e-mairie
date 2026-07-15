import { NavLink, Outlet } from 'react-router-dom';

/**
 * Cadre du back-office agent : menu latéral (rubriques) + zone de contenu.
 * Les rubriques non encore développées sont affichées mais désactivées, pour
 * donner la vision d'ensemble de l'ERP à venir.
 */
const lienClasse = ({ isActive }: { isActive: boolean }) =>
  `bo__lien ${isActive ? 'bo__lien--actif' : ''}`;

export function AgentLayout() {
  return (
    <main className="bo">
      <aside className="bo__nav">
        <NavLink to="/agent" end className={lienClasse}>
          <span className="bo__ico">📊</span> Tableau de bord
        </NavLink>
        <NavLink to="/agent/dossiers" className={lienClasse}>
          <span className="bo__ico">📁</span> Dossiers
        </NavLink>
        <span className="bo__lien bo__lien--off"><span className="bo__ico">🗓️</span> Rendez-vous</span>
        <span className="bo__lien bo__lien--off"><span className="bo__ico">📈</span> Statistiques</span>
        <span className="bo__lien bo__lien--off"><span className="bo__ico">🖨️</span> Actes & impression</span>
        <span className="bo__lien bo__lien--off"><span className="bo__ico">🛡️</span> Audit</span>
        <span className="bo__lien bo__lien--off"><span className="bo__ico">⚙️</span> Paramètres</span>
      </aside>
      <section className="bo__contenu">
        <Outlet />
      </section>
    </main>
  );
}
