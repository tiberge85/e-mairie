import { StatutDeclaration } from '@prisma/client';

/**
 * Machine à états du dossier. Les transitions AUTORISÉES vivent ici, en un seul
 * endroit — pas éparpillées dans les contrôleurs. La base ne les connaît pas
 * (l'enum Prisma liste les états, pas les chemins permis) ; c'est ce code qui
 * fait foi.
 *
 * Cf. le diagramme du cahier des charges (docs/cahier-des-charges).
 */
export const TRANSITIONS: Record<StatutDeclaration, StatutDeclaration[]> = {
  Brouillon: [StatutDeclaration.Soumis],
  Soumis: [StatutDeclaration.EnVerification],
  EnVerification: [
    StatutDeclaration.PiecesDemandees,
    StatutDeclaration.Valide,
    StatutDeclaration.Refuse,
  ],
  PiecesDemandees: [StatutDeclaration.EnVerification],
  Valide: [StatutDeclaration.ActeGenere],
  Refuse: [], // état terminal
  ActeGenere: [StatutDeclaration.Disponible],
  Disponible: [StatutDeclaration.Retire],
  Retire: [], // état terminal
};

export function peutTransiter(de: StatutDeclaration, vers: StatutDeclaration): boolean {
  return TRANSITIONS[de].includes(vers);
}
