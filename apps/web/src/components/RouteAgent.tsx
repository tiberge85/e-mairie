import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../auth/AuthContext';

/**
 * Réserve une route aux agents et officiers. Un citoyen connecté est renvoyé
 * vers son espace ; un visiteur non connecté vers la connexion.
 */
export function RouteAgent({ children }: { children: ReactNode }) {
  const { token, citoyen } = useAuth();
  if (!token) return <Navigate to="/connexion" replace />;
  if (citoyen && citoyen.role === 'CITOYEN') return <Navigate to="/" replace />;
  return <>{children}</>;
}
