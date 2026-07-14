import type { Request, Response } from 'express';
import {
  inscriptionCitoyenSchema,
  connexionCitoyenSchema,
  verificationOtpSchema,
} from '@e-mairie/shared';
import { authService } from './auth.service';

/**
 * Les contrôleurs valident l'entrée avec le schéma partagé (`.parse` lève une
 * `ZodError` interceptée par le middleware d'erreurs), puis délèguent au service.
 */
export const authController = {
  async inscription(req: Request, res: Response) {
    const dto = inscriptionCitoyenSchema.parse(req.body);
    const resultat = await authService.inscrire(dto);
    res.status(201).json(resultat);
  },

  async verificationOtp(req: Request, res: Response) {
    const dto = verificationOtpSchema.parse(req.body);
    const resultat = await authService.verifierOtp(dto);
    res.json(resultat);
  },

  async connexion(req: Request, res: Response) {
    const dto = connexionCitoyenSchema.parse(req.body);
    const resultat = await authService.connecter(dto);
    res.json(resultat);
  },
};
