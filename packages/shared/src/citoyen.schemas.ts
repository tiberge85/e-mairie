import { z } from 'zod';

/**
 * Schémas du compte citoyen — utilisés à la fois par les formulaires React
 * (inscription, connexion) et par l'API qui les revalide. C'est précisément le
 * cas qui justifie leur place dans `@e-mairie/shared`.
 */

// ── Briques réutilisables ────────────────────────────────────────────────────

/** Un nom/prénom : on retire les espaces superflus et on impose 2 caractères. */
const texteIdentite = (libelle: string) =>
  z.string().trim().min(2, `${libelle} est requis`).max(100);

/**
 * Téléphone : identifiant pivot du compte (cf. cahier des charges). On reste
 * permissif sur le format international (chiffres, espaces, +, tirets) car les
 * numéros varient d'un pays à l'autre ; la validation fine appartient au
 * fournisseur SMS, pas au formulaire.
 */
export const telephoneSchema = z
  .string()
  .trim()
  .min(8, 'Numéro de téléphone trop court')
  .max(20)
  .regex(/^\+?[0-9\s().-]{8,20}$/, 'Numéro de téléphone invalide');

/** Email facultatif : vide ('') vaut « non renseigné », pas « invalide ». */
export const emailFacultatifSchema = z
  .string()
  .trim()
  .email('Adresse email invalide')
  .max(180)
  .optional()
  .or(z.literal(''));

const motDePasseSchema = z
  .string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .max(128);

// ── Inscription ──────────────────────────────────────────────────────────────

export const inscriptionCitoyenSchema = z
  .object({
    nom: texteIdentite('Le nom'),
    prenoms: texteIdentite('Le(s) prénom(s)'),
    dateNaissance: z.coerce.date({ errorMap: () => ({ message: 'Date de naissance invalide' }) }),
    telephone: telephoneSchema,
    email: emailFacultatifSchema,
    motDePasse: motDePasseSchema,
    confirmationMotDePasse: z.string(),
  })
  // La confirmation ne fait pas foi côté serveur, mais l'erreur doit s'afficher
  // sur le bon champ dans le formulaire : d'où le `path`.
  .refine((d) => d.motDePasse === d.confirmationMotDePasse, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmationMotDePasse'],
  });
export type InscriptionCitoyenDto = z.infer<typeof inscriptionCitoyenSchema>;

// ── Connexion ────────────────────────────────────────────────────────────────

/**
 * On se connecte au choix par téléphone OU par email : un seul champ
 * `identifiant`, l'API décide lequel c'est.
 */
export const connexionCitoyenSchema = z.object({
  identifiant: z.string().trim().min(1, 'Identifiant requis'),
  motDePasse: z.string().min(1, 'Mot de passe requis'),
});
export type ConnexionCitoyenDto = z.infer<typeof connexionCitoyenSchema>;

// ── Vérification OTP ─────────────────────────────────────────────────────────

export const verificationOtpSchema = z.object({
  identifiant: z.string().trim().min(1, 'Identifiant requis'),
  code: z
    .string()
    .trim()
    .regex(/^[0-9]{6}$/, 'Le code doit comporter 6 chiffres'),
});
export type VerificationOtpDto = z.infer<typeof verificationOtpSchema>;
