import { Router } from 'express';
import { asyncHandler } from '../../http/asyncHandler';
import { authentifier, exigerRole } from '../../middlewares/authentification';
import { acteController } from './acte.controller';

/** Génération du PDF de l'acte — réservé aux agents/officiers. */
export const acteRoutes = Router();
acteRoutes.get(
  '/:id/pdf',
  authentifier,
  exigerRole('AGENT', 'OFFICIER'),
  asyncHandler(acteController.actePdf),
);

/** Page publique de vérification (cible du QR code) — sans authentification. */
export const verificationRoutes = Router();
verificationRoutes.get('/:numero', asyncHandler(acteController.pageVerification));
