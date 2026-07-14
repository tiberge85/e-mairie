import { z } from 'zod';

/**
 * Schémas du formulaire « Déclaration de naissance ».
 *
 * Ce formulaire multi-étapes React s'appuie sur ces schémas via `zodResolver` ;
 * l'API les revalide à la réception. Un seul endroit de vérité pour les deux.
 *
 * On sépare `enfant`, `parent` et `déclaration` pour valider chaque étape
 * indépendamment côté front (un `parentSchema` sert au père ET à la mère).
 */

export const SEXES = ['M', 'F'] as const;
export const sexeSchema = z.enum(SEXES, {
  errorMap: () => ({ message: 'Sexe requis' }),
});

export const TYPES_DECLARANT = [
  'Pere',
  'Mere',
  'Tuteur',
  'SageFemme',
  'AgentDeSante',
  'Autre',
] as const;
export const typeDeclarantSchema = z.enum(TYPES_DECLARANT, {
  errorMap: () => ({ message: 'Type de déclarant requis' }),
});

/** Champ texte facultatif : '' = « non renseigné » (cf. convention multipart). */
const facultatif = (max = 200) => z.string().trim().max(max).optional().or(z.literal(''));

// ── Étape 1 : l'enfant ───────────────────────────────────────────────────────

export const enfantSchema = z.object({
  nom: z.string().trim().min(2, "Le nom de l'enfant est requis").max(100),
  prenoms: z.string().trim().min(2, 'Le(s) prénom(s) est requis').max(150),
  sexe: sexeSchema,
  dateNaissance: z.coerce.date({ errorMap: () => ({ message: 'Date de naissance invalide' }) }),
  /** Heure au format HH:MM (24 h). Facultative si inconnue. */
  heureNaissance: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Heure invalide (HH:MM)')
    .optional()
    .or(z.literal('')),
  lieuNaissance: z.string().trim().min(2, 'Le lieu de naissance est requis').max(150),
  centreSante: facultatif(150),
  /** Poids en grammes. Optionnel. */
  poidsGrammes: z.coerce.number().int().min(200).max(8000).optional(),
  typeAccouchement: facultatif(100),
});
export type EnfantDto = z.infer<typeof enfantSchema>;

// ── Étapes 2 & 3 : un parent (père ou mère) ──────────────────────────────────

/**
 * Les champs OCR (numéro de pièce, etc.) sont pré-remplis puis corrigeables :
 * on ne les impose donc pas tous. Seuls nom et prénoms sont obligatoires — une
 * déclaration ne peut pas nommer un parent « inconnu » sans a minima son nom.
 */
export const parentSchema = z.object({
  nom: z.string().trim().min(2, 'Le nom est requis').max(100),
  prenoms: z.string().trim().min(2, 'Le(s) prénom(s) est requis').max(150),
  dateNaissance: z.coerce.date().optional(),
  nationalite: facultatif(80),
  profession: facultatif(120),
  adresse: facultatif(250),
  telephone: facultatif(20),
  numeroPiece: facultatif(60),
});
export type ParentDto = z.infer<typeof parentSchema>;

// ── Déclaration complète ─────────────────────────────────────────────────────

export const declarationNaissanceSchema = z.object({
  enfant: enfantSchema,
  pere: parentSchema,
  mere: parentSchema,
  typeDeclarant: typeDeclarantSchema,
});
export type DeclarationNaissanceDto = z.infer<typeof declarationNaissanceSchema>;
