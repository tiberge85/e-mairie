import 'dotenv/config';

/**
 * Configuration lue une seule fois au démarrage.
 *
 * On plante volontairement tôt si une variable critique manque (JWT_SECRET,
 * DATABASE_URL) : mieux vaut un crash au boot qu'une faille de sécurité
 * silencieuse en production.
 */
function requis(nom: string): string {
  const valeur = process.env[nom];
  if (!valeur) {
    throw new Error(`Variable d'environnement manquante : ${nom}`);
  }
  return valeur;
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  origineFrontend: process.env.ORIGINE_FRONTEND ?? '*',
  databaseUrl: requis('DATABASE_URL'),
  jwt: {
    secret: requis('JWT_SECRET'),
    expiration: process.env.JWT_EXPIRATION ?? '2h',
  },
  otp: {
    dureeMinutes: Number(process.env.OTP_DUREE_MINUTES ?? 10),
    // 'console' : le code est journalisé au lieu d'être envoyé par SMS (dev).
    mode: process.env.OTP_MODE ?? 'console',
  },
  stockageDossier: process.env.STOCKAGE_DOSSIER ?? './data/uploads',
} as const;
