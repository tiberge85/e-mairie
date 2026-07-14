import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { ErreurHttp } from '../http/erreurs';

/**
 * Point unique de traduction des erreurs en réponses HTTP.
 *
 *  · `ZodError` → 400 avec le détail par champ (le front peut l'afficher).
 *  · `ErreurHttp` → le statut qu'elle porte.
 *  · tout le reste → 500, sans fuiter la stack au client (on la journalise).
 *
 * NB : le 4e paramètre `_next` est requis pour qu'Express reconnaisse ce
 * middleware comme gestionnaire d'erreurs, même inutilisé.
 */
export function gestionErreurs(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      message: 'Données invalides',
      erreurs: err.issues.map((i) => ({ champ: i.path.join('.'), message: i.message })),
    });
    return;
  }

  if (err instanceof ErreurHttp) {
    res.status(err.statut).json({ message: err.message, details: err.details });
    return;
  }

  console.error('Erreur non gérée :', err);
  res.status(500).json({ message: 'Erreur interne du serveur' });
}
