import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { CitoyenConnecte } from '../lib/api';

/**
 * État d'authentification partagé. Le jeton et le citoyen sont conservés en
 * `localStorage` pour survivre à un rafraîchissement de page (application réelle,
 * pas un artefact — le stockage navigateur est ici légitime).
 */
interface EtatAuth {
  token: string | null;
  citoyen: CitoyenConnecte | null;
  connexion: (token: string, citoyen: CitoyenConnecte) => void;
  deconnexion: () => void;
}

const CLE = 'emairie.auth';
const AuthContext = createContext<EtatAuth | null>(null);

function lireStockage(): { token: string; citoyen: CitoyenConnecte } | null {
  const brut = localStorage.getItem(CLE);
  if (!brut) return null;
  try {
    return JSON.parse(brut);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [etat, setEtat] = useState(lireStockage);

  const valeur = useMemo<EtatAuth>(
    () => ({
      token: etat?.token ?? null,
      citoyen: etat?.citoyen ?? null,
      connexion: (token, citoyen) => {
        localStorage.setItem(CLE, JSON.stringify({ token, citoyen }));
        setEtat({ token, citoyen });
      },
      deconnexion: () => {
        localStorage.removeItem(CLE);
        setEtat(null);
      },
    }),
    [etat],
  );

  return <AuthContext.Provider value={valeur}>{children}</AuthContext.Provider>;
}

export function useAuth(): EtatAuth {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return ctx;
}
