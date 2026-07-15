import { Outlet } from 'react-router-dom';

/** Cadre étroit centré pour les écrans citoyen et authentification. */
export function CadreEtroit() {
  return (
    <main className="conteneur">
      <Outlet />
    </main>
  );
}
