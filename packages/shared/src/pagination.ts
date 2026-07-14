import { z } from 'zod';

/**
 * Pagination commune à toutes les listes.
 *
 * Les valeurs arrivent de l'URL (donc en chaînes) : `z.coerce.number` convertit
 * `"2"` en `2`. On borne `parPage` pour qu'une requête ne puisse pas demander
 * dix mille lignes d'un coup.
 */
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  parPage: z.coerce.number().int().min(1).max(100).default(20),
});
export type PaginationDto = z.infer<typeof paginationSchema>;
