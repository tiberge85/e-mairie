import jwt from 'jsonwebtoken';
import type { Role } from '@prisma/client';
import { env } from '../../env';
import { erreurs } from '../../http/erreurs';

/** Contenu utile d'un jeton d'accès : l'identité minimale, rien de sensible. */
export interface ChargeJeton {
  sub: string;
  role: Role;
}

export function signerJeton(charge: ChargeJeton): string {
  return jwt.sign(charge, env.jwt.secret, {
    expiresIn: env.jwt.expiration as jwt.SignOptions['expiresIn'],
  });
}

export function verifierJeton(jeton: string): ChargeJeton {
  try {
    const decode = jwt.verify(jeton, env.jwt.secret);
    // `verify` peut renvoyer une string ; on n'accepte qu'un payload objet.
    if (typeof decode === 'string' || !decode.sub) {
      throw erreurs.nonAuthentifie('Jeton invalide');
    }
    return { sub: String(decode.sub), role: (decode as jwt.JwtPayload).role as Role };
  } catch {
    throw erreurs.nonAuthentifie('Jeton invalide ou expiré');
  }
}
