import express from 'express';
import cors from 'cors';
import { env } from './env';
import { gestionErreurs } from './middlewares/gestionErreurs';
import { authRoutes } from './modules/auth/auth.routes';
import { declarationRoutes } from './modules/declaration-naissance/declaration.routes';
import { gedRoutes } from './modules/ged/ged.routes';

export function creerApp() {
  const app = express();

  app.use(cors({ origin: env.origineFrontend }));
  app.use(express.json());

  // Sonde de santé — c'est ce que Render interroge (healthCheckPath: /health).
  app.get('/health', (_req, res) => {
    res.json({ statut: 'ok', service: 'e-mairie-api' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/declarations', declarationRoutes);
  app.use('/api/documents', gedRoutes);

  // Le gestionnaire d'erreurs se déclare EN DERNIER, après toutes les routes.
  app.use(gestionErreurs);

  return app;
}
