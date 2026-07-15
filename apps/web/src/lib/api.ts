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

export interface Parent {
  nom?: string;
  prenoms?: string;
  dateNaissance?: string;
  nationalite?: string;
  profession?: string;
  adresse?: string;
  telephone?: string;
  numeroPiece?: string;
}
export interface Transition {
  id: string;
  ancienStatut: string | null;
  nouveauStatut: string;
  motif: string | null;
  creeLe: string;
}
/** Vue complète d'un dossier côté agent (enfant/père/mère + audit). */
export interface DeclarationDetail extends Declaration {
  pere: Parent;
  mere: Parent;
  typeDeclarant: string;
  motifRefus: string | null;
  valideLe: string | null;
  genereLe: string | null;
  transitions?: Transition[];
}
export interface ActiviteItem {
  id: string;
  ancienStatut: string | null;
  nouveauStatut: string;
  motif: string | null;
  creeLe: string;
  numeroSuivi: string;
  enfant: { nom?: string; prenoms?: string; [k: string]: unknown };
}
export interface StatsAgent {
  recusAujourdhui: number;
  enAttente: number;
  enCours: number;
  piecesDemandees: number;
  valides: number;
  rejetes: number;
  totalCitoyens: number;
  tempsMoyenHeures: number | null;
  parJour: { label: string; count: number }[];
  activite: ActiviteItem[];
}
export interface Piece {
  id: string;
  nom: string;
  mimeType: string;
  tailleOctets: number;
  creeLe: string;
}
export interface ListeDocuments {
  items: Piece[];
  total: number;
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

  // ── Côté mairie (agent) ────────────────────────────────────────────────────
  listerAgent: (token: string, opts: { statut?: string; recherche?: string } = {}) => {
    const p = new URLSearchParams();
    if (opts.statut) p.set('statut', opts.statut);
    if (opts.recherche) p.set('recherche', opts.recherche);
    const qs = p.toString();
    return requete<ListeDeclarations>('GET', `/api/declarations${qs ? `?${qs}` : ''}`, { token });
  },
  statsAgent: (token: string) =>
    requete<StatsAgent>('GET', '/api/declarations/stats', { token }),
  obtenirAgent: (id: string, token: string) =>
    requete<DeclarationDetail>('GET', `/api/declarations/${id}`, { token }),
  changerStatut: (id: string, statut: string, motif: string | undefined, token: string) =>
    requete<DeclarationDetail>('PATCH', `/api/declarations/${id}/statut`, {
      body: { statut, motif },
      token,
    }),
  /** Télécharge le PDF de l'acte (le jeton ne peut pas passer par un simple lien). */
  telechargerActe: async (id: string, token: string): Promise<Blob> => {
    const reponse = await fetch(`${BASE}/api/actes/${id}/pdf`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!reponse.ok) {
      const t = await reponse.text();
      let msg = "Génération du PDF impossible";
      try { msg = JSON.parse(t)?.message ?? msg; } catch { /* ignore */ }
      throw new ErreurApi(reponse.status, msg);
    }
    return reponse.blob();
  },
  listerDocuments: (entite: string, entiteId: string, token: string) =>
    requete<ListeDocuments>(
      'GET',
      `/api/documents?entite=${encodeURIComponent(entite)}&entiteId=${entiteId}`,
      { token },
    ),
};
