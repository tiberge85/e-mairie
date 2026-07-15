import { Router } from 'express';
import { asyncHandler } from '../../http/asyncHandler';
import { authentifier, exigerRole } from '../../middlewares/authentification';
import { declarationController } from './declaration.controller';

export const declarationRoutes = Router();

// ── Parcours citoyen (tout citoyen authentifié agit sur SES dossiers) ─────────
declarationRoutes.post('/', authentifier, asyncHandler(declarationController.creer));
declarationRoutes.get('/mes', authentifier, asyncHandler(declarationController.mesDeclarations));
declarationRoutes.get('/mes/:id', authentifier, asyncHandler(declarationController.maDeclaration));
declarationRoutes.post(
  '/:id/soumettre',
  authentifier,
  asyncHandler(declarationController.soumettre),
);
declarationRoutes.post('/:id/renvoyer', authentifier, asyncHandler(declarationController.renvoyer));

// ── Traitement côté mairie (agents et officiers uniquement) ───────────────────
// '/stats' AVANT '/:id' pour ne pas être capturé comme un identifiant.
declarationRoutes.get(
  '/stats',
  authentifier,
  exigerRole('AGENT', 'OFFICIER'),
  asyncHandler(declarationController.statsAgent),
);
declarationRoutes.get(
  '/',
  authentifier,
  exigerRole('AGENT', 'OFFICIER'),
  asyncHandler(declarationController.listerAgent),
);
declarationRoutes.get(
  '/:id',
  authentifier,
  exigerRole('AGENT', 'OFFICIER'),
  asyncHandler(declarationController.obtenirAgent),
);
declarationRoutes.patch(
  '/:id/statut',
  authentifier,
  exigerRole('AGENT', 'OFFICIER'),
  asyncHandler(declarationController.changerStatut),
);
