import type { NextFunction, Request, Response } from 'express';
import type { Role } from '@prisma/client';
import { verifierJeton } from '../modules/auth/jetons';
import { erreurs } from '../http/erreurs';

/**
 * Exige un jeton d'accès valide. En cas de succès, `req.utilisateur` est
 * renseigné pour la suite de la chaîne.
 */
export function authentifier(req: Request, _res: Response, next: NextFunction): void {
  const entete = req.header('authorization');
  if (!entete?.startsWith('Bearer ')) {
    throw erreurs.nonAuthentifie();
  }
  const jeton = entete.slice('Bearer '.length).trim();
  const charge = verifierJeton(jeton);
  req.utilisateur = { id: charge.sub, role: charge.role };
  next();
}

/**
 * Restreint l'accès à certains rôles. À placer APRÈS `authentifier`.
 * Ex. `exigerRole('AGENT', 'OFFICIER')` pour les écrans côté mairie.
 */
export function exigerRole(...rolesAutorises: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.utilisateur) {
      throw erreurs.nonAuthentifie();
    }
    if (!rolesAutorises.includes(req.utilisateur.role)) {
      throw erreurs.interdit("Votre rôle ne permet pas cette action");
    }
    next();
  };
}
