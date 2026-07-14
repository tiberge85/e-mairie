/**
 * Petit client HTTP de l'API e-Mairie.
 *
 * L'URL de base vient de `VITE_API_URL` (injectée au build). Les erreurs de l'API
 * (statut + message + détails par champ) sont remontées via `ErreurApi` pour être
 * affichées proprement dans les formulaires.
 */
// Adresse de l'API.
//  · Si `VITE_API_URL` est définie (et non vide), on l'utilise.
//  · Sinon : localhost en développement, et l'API de production par défaut.
// On retire une éventuelle barre « / » finale pour éviter les doubles slashs.
// Ce défaut robuste évite de dépendre d'un réglage Render parfait.
const BRUT =
  import.meta.env.VITE_API_URL?.trim() ||
  (import.meta.env.DEV ? 'http://localhost:3000' : 'https://emairie-api.onrender.com');
const BASE = BRUT.replace(/\/+$/, '');

export interface ErreurChamp {
  champ: string;
  message: string;
}

export class ErreurApi extends Error {
  constructor(
    public statut: number,
    message: string,
    public erreurs?: ErreurChamp[],
  ) {
    super(message);
  }
}

interface Options {
  token?: string | null;
  body?: unknown;
  form?: FormData;
}

async function requete<T>(methode: string, chemin: string, opts: Options = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (opts.token) headers['Authorization'] = `Bearer ${opts.token}`;

  let corps: BodyInit | undefined;
  if (opts.form) {
    corps = opts.form; // le navigateur pose le bon Content-Type multipart.
  } else if (opts.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    corps = JSON.stringify(opts.body);
  }

  const reponse = await fetch(`${BASE}${chemin}`, { method: methode, headers, body: corps });
  const texte = await reponse.text();
  const donnees = texte ? JSON.parse(texte) : null;

  if (!reponse.ok) {
    throw new ErreurApi(
      reponse.status,
      donnees?.message ?? 'Une erreur est survenue',
      donnees?.erreurs,
    );
  }
  return donnees as T;
}

export interface CitoyenConnecte {
  id: string;
  nom: string;
  prenoms: string;
  role: 'CITOYEN' | 'AGENT' | 'OFFICIER';
}
export interface ReponseAuth {
  jeton: string;
  citoyen: CitoyenConnecte;
}

export interface Declaration {
  id: string;
  numeroSuivi: string;
  numeroActeOfficiel: string | null;
  statut: string;
  enfant: { nom: string; prenoms: string; [k: string]: unknown };
  creeLe: string;
  soumisLe: string | null;
}
export interface ListeDeclarations {
  items: Declaration[];
  total: number;
  page: number;
  parPage: number;
}

export const api = {
  inscription: (dto: unknown) => requete<{ citoyenId: string; message: string }>(
    'POST', '/api/auth/inscription', { body: dto }),
  verifierOtp: (dto: unknown) => requete<ReponseAuth>('POST', '/api/auth/otp', { body: dto }),
  connexion: (dto: unknown) => requete<ReponseAuth>('POST', '/api/auth/connexion', { body: dto }),

  creerDeclaration: (dto: unknown, token: string) =>
    requete<Declaration>('POST', '/api/declarations', { body: dto, token }),
  soumettreDeclaration: (id: string, token: string) =>
    requete<Declaration>('POST', `/api/declarations/${id}/soumettre`, { token }),
  mesDeclarations: (token: string) =>
    requete<ListeDeclarations>('GET', '/api/declarations/mes', { token }),
  maDeclaration: (id: string, token: string) =>
    requete<Declaration>('GET', `/api/declarations/mes/${id}`, { token }),
  televerser: (form: FormData, token: string) =>
    requete<{ id: string; nom: string }>('POST', '/api/documents', { form, token }),
};
