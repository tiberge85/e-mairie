import type { NextFunction, Request, Response } from 'express';

/**
 * Enveloppe un handler async pour que toute promesse rejetée parte dans
 * `next(err)` — sinon Express 4 avale l'erreur et la requête reste pendante.
 */
export const asyncHandler =
  (handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    handler(req, res, next).catch(next);
  };
