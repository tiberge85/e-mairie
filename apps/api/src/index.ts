import { creerApp } from './app';
import { env } from './env';
import { bootstrapAgent } from './modules/auth/bootstrap';

const app = creerApp();

app.listen(env.port, async () => {
  console.info(`e-Mairie API à l'écoute sur le port ${env.port}`);
  // Provisionne le compte agent si les variables d'env sont fournies. Une erreur
  // ici ne doit pas empêcher l'API de servir : on log et on continue.
  try {
    await bootstrapAgent();
  } catch (e) {
    console.error('[bootstrap] Échec de la création du compte agent :', e);
  }
});
