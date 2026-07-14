import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../auth/AuthContext';

/** Redirige vers la connexion si aucun jeton n'est présent. */
export function RouteProtegee({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/connexion" replace />;
  return <>{children}</>;
}
