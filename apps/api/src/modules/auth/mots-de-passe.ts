import bcrypt from 'bcryptjs';

/**
 * Hachage des mots de passe. bcrypt embarque le sel dans le hash ; un facteur de
 * coût de 10 est un compromis raisonnable entre sécurité et temps de réponse.
 */
const COUT = 10;

export const hacherMotDePasse = (clair: string): Promise<string> =>
  bcrypt.hash(clair, COUT);

export const verifierMotDePasse = (clair: string, hash: string): Promise<boolean> =>
  bcrypt.compare(clair, hash);
