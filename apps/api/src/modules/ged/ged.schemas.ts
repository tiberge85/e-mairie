import { z } from 'zod';
import { paginationSchema } from '@e-mairie/shared';

/**
 * Contrats d'entrée de la GED.
 *
 * ── Pourquoi ici, et non dans `@e-mairie/shared` ────────────────────────
 *
 * Le paquet partagé n'a de raison d'être que pour les schémas dont le FORMULAIRE
 * React se sert aussi (via `zodResolver`) : c'est là que la duplication serait
 * dangereuse. Ici, le frontend n'envoie que du multipart et des paramètres de
 * requête — aucun schéma Zod côté client. Ces contrats ne servent donc qu'à
 * l'API, et vivent avec elle.
 *
 * ── Le rattachement d'un document est POLYMORPHE ────────────────────────
 *
 * `Document` (schéma Prisma) ne porte PAS de `dossierId`. Il porte un couple
 * `entite` / `entiteId`, qui le rattache à n'importe quelle entité métier : un
 * citoyen, un permis de construire… ou un dossier de la GED. Classer un document
 * dans un dossier, c'est donc écrire `entite = 'Dossier'`, `entiteId = <id>`.
 *
 * C'est ce qui permet à la GED d'indexer les pièces de TOUS les modules sans
 * qu'aucun d'eux n'ait à connaître son existence — et c'est pourquoi on ne
 * réclame pas de migration pour une colonne `dossierId` qui ferait doublon.
 */
export const ENTITE_DOSSIER = 'Dossier';

// ── Dossiers ───────────────────────────────────────────────────────────────

export const creationDossierSchema = z.object({
  nom: z.string().trim().min(2, 'Le nom du dossier est requis').max(200),
  reference: z.string().trim().max(60).optional().or(z.literal('')),
  /** Absent : le dossier est créé à la racine de l'arborescence. */
  parentId: z.string().uuid().nullish(),
  /**
   * Durée de conservation légale, en années. C'est elle qui, au moment de
   * l'archivage, fixe la date à partir de laquelle l'élimination devient
   * juridiquement possible.
   */
  dureeConservation: z.coerce.number().int().min(0).max(150).nullish(),
});
export type CreationDossierDto = z.infer<typeof creationDossierSchema>;

export const miseAJourDossierSchema = creationDossierSchema.partial();
export type MiseAJourDossierDto = z.infer<typeof miseAJourDossierSchema>;

// ── Documents ──────────────────────────────────────────────────────────────

export const filtreDocumentsSchema = paginationSchema.extend({
  /** Documents classés dans ce dossier (`entite = 'Dossier'`). */
  dossierId: z.string().uuid().optional(),
  /** Rattachement métier direct (`Citoyen`, `PermisConstruire`…). */
  entite: z.string().trim().max(100).optional(),
  entiteId: z.string().uuid().optional(),
  citoyenId: z.string().uuid().optional(),
  mimeType: z.string().trim().max(100).optional(),
  /**
   * Fait remonter les versions supplantées.
   *
   * Par défaut une liste ne montre que la version courante de chaque document :
   * afficher les cinq versions successives d'un même arrêté noierait l'agent
   * sous des doublons apparents, dont un seul fait foi.
   */
  toutesVersions: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  /** Inclut les documents déjà versés aux archives. */
  inclureArchives: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
});
export type FiltreDocumentsDto = z.infer<typeof filtreDocumentsSchema>;

/**
 * Métadonnées accompagnant le fichier téléversé (corps multipart).
 *
 * Le multipart ne transporte que des chaînes : un champ laissé vide par le
 * formulaire arrive comme `''`, jamais comme `undefined`. D'où les
 * `.or(z.literal(''))` — une chaîne vide vaut « non renseigné », pas « invalide ».
 */
export const televersementDocumentSchema = z.object({
  /** À défaut, le nom d'origine du fichier est conservé. */
  nom: z.string().trim().max(255).optional().or(z.literal('')),
  dossierId: z.string().uuid().optional().or(z.literal('')),
  entite: z.string().trim().max(100).optional().or(z.literal('')),
  entiteId: z.string().uuid().optional().or(z.literal('')),
  citoyenId: z.string().uuid().optional().or(z.literal('')),
  /**
   * Document que celui-ci remplace. Renseigné, il déclenche le versionnement :
   * le nouveau document prend `version + 1` et pointe vers son prédécesseur, qui
   * reste consultable mais sort des listes courantes.
   */
  precedentId: z.string().uuid().optional().or(z.literal('')),
  /** Texte du document (OCR réalisé en amont, ou saisi). Indexé pour la recherche. */
  texteOcr: z.string().max(100_000).optional().or(z.literal('')),
});
export type TeleversementDocumentDto = z.infer<typeof televersementDocumentSchema>;
