import { z } from 'zod';
import { paginationSchema } from '@e-mairie/shared';
import { StatutDeclaration } from '@prisma/client';

/**
 * Contrats PUREMENT API de la déclaration — ils ne servent qu'ici (filtres de
 * liste, changement de statut côté agent). Aucun formulaire React ne s'en sert
 * via `zodResolver`, donc ils NE vont PAS dans `@e-mairie/shared` (cf. CLAUDE.md).
 *
 * Le formulaire de saisie citoyen, lui, utilise `declarationNaissanceSchema` du
 * paquet partagé.
 */

export const filtreDeclarationsSchema = paginationSchema.extend({
  statut: z.nativeEnum(StatutDeclaration).optional(),
  citoyenId: z.string().uuid().optional(),
  numeroSuivi: z.string().trim().max(40).optional(),
});
export type FiltreDeclarationsDto = z.infer<typeof filtreDeclarationsSchema>;

/**
 * Changement de statut demandé par un agent. Le `motif` devient obligatoire pour
 * un refus — c'est une règle métier, imposée ici par un `refine`.
 */
export const changementStatutSchema = z
  .object({
    statut: z.nativeEnum(StatutDeclaration),
    motif: z.string().trim().max(1000).optional().or(z.literal('')),
  })
  .refine((d) => d.statut !== StatutDeclaration.Refuse || (d.motif && d.motif.length > 0), {
    message: 'Un motif est obligatoire pour refuser une déclaration',
    path: ['motif'],
  });
export type ChangementStatutDto = z.infer<typeof changementStatutSchema>;
