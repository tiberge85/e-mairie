import { Role } from '@prisma/client';
import { prisma } from '../../prisma';
import { hacherMotDePasse } from './mots-de-passe';

/**
 * Crée (ou met à jour) un compte agent d'état civil au démarrage, à partir des
 * variables d'environnement `AGENT_TELEPHONE` et `AGENT_MOT_DE_PASSE`.
 *
 * Pourquoi au démarrage et pas via l'API : le compte agent ne doit pas pouvoir
 * se créer tout seul depuis l'extérieur (l'inscription publique ne crée que des
 * citoyens). On le provisionne donc côté serveur, là où on a accès à la base,
 * à partir de secrets d'environnement choisis par l'administrateur.
 *
 * Idempotent : relancé à chaque déploiement, il ne recrée pas de doublon.
 */
export async function bootstrapAgent(): Promise<void> {
  const telephone = process.env.AGENT_TELEPHONE?.trim();
  const motDePasse = process.env.AGENT_MOT_DE_PASSE;

  if (!telephone || !motDePasse) {
    console.info(
      "[bootstrap] AGENT_TELEPHONE / AGENT_MOT_DE_PASSE non définis — aucun compte agent créé.",
    );
    return;
  }

  const existant = await prisma.citoyen.findUnique({ where: { telephone } });
  if (existant) {
    if (existant.role === Role.CITOYEN) {
      await prisma.citoyen.update({
        where: { id: existant.id },
        data: { role: Role.AGENT, telephoneVerifie: true },
      });
      console.info(`[bootstrap] Compte ${telephone} promu AGENT.`);
    } else {
      console.info('[bootstrap] Compte agent déjà présent.');
    }
    return;
  }

  await prisma.citoyen.create({
    data: {
      nom: 'Agent',
      prenoms: 'État civil',
      dateNaissance: new Date('1990-01-01'),
      telephone,
      email: null,
      motDePasseHash: await hacherMotDePasse(motDePasse),
      role: Role.AGENT,
      telephoneVerifie: true,
    },
  });
  console.info(`[bootstrap] Compte AGENT créé pour ${telephone}.`);
}
