import type { Role } from '@prisma/client';

/**
 * On attache l'utilisateur authentifié à la requête (rempli par le middleware
 * d'authentification). Déclaré ici pour que tout le code y accède en typé.
 */
declare global {
  namespace Express {
    interface Request {
      utilisateur?: {
        id: string;
        role: Role;
      };
    }
  }
}

export {};
