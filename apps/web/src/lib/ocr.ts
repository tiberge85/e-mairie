/**
 * Lecture OCR d'une pièce d'identité, côté navigateur (tesseract.js).
 *
 * Pourquoi côté client : l'OCR tourne sur l'appareil du citoyen, sans charger le
 * serveur ni transférer l'image avant validation. Le texte extrait sert à
 * PRÉ-REMPLIR — il ne fait pas foi (cf. cahier des charges) : on conserve l'image
 * source et le texte, et le citoyen puis l'agent contrôlent.
 *
 * tesseract.js est importé dynamiquement pour ne pas alourdir le chargement
 * initial du portail : la bibliothèque n'est téléchargée qu'au premier usage.
 */
export async function lireOcr(fichier: File): Promise<string> {
  const { recognize } = await import('tesseract.js');
  const { data } = await recognize(fichier, 'fra');
  return data.text ?? '';
}

/**
 * Extraction naïve du numéro de pièce depuis le texte OCR : on cherche une suite
 * alphanumérique de 7 à 15 caractères, en privilégiant celles qui contiennent
 * plusieurs chiffres (les numéros de CNI/passeport en ont). Best-effort — le
 * citoyen corrige au besoin.
 */
export function extraireNumeroPiece(texte: string): string | undefined {
  const candidats = texte.toUpperCase().match(/\b[A-Z0-9]{7,15}\b/g);
  if (!candidats) return undefined;
  const avecChiffres = candidats.filter(
    (c) => (c.match(/[0-9]/g)?.length ?? 0) >= 3,
  );
  return avecChiffres[0] ?? candidats[0];
}
