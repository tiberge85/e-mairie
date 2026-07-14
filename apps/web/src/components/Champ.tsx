import type { ReactNode } from 'react';

/**
 * Habillage d'un champ de formulaire : libellé, contenu (input/select) et
 * message d'erreur. Centralise la présentation pour tous les formulaires.
 */
export function Champ({
  label,
  erreur,
  children,
  requis,
}: {
  label: string;
  erreur?: string;
  children: ReactNode;
  requis?: boolean;
}) {
  return (
    <label className="champ">
      <span className="champ__label">
        {label}
        {requis && <span className="champ__requis"> *</span>}
      </span>
      {children}
      {erreur && <span className="champ__erreur">{erreur}</span>}
    </label>
  );
}
