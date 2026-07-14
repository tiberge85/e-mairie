import { creerApp } from './app';
import { env } from './env';

const app = creerApp();

app.listen(env.port, () => {
  console.info(`e-Mairie API à l'écoute sur le port ${env.port}`);
});
