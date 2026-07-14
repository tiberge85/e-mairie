/**
 * Point d'entrée du paquet partagé `@e-mairie/shared`.
 *
 * Rappel de la frontière (cf. CLAUDE.md) : n'exposer ici QUE les schémas dont le
 * formulaire React se sert via `zodResolver`. Les contrats purement API
 * (multipart, filtres de requête) restent dans le module API correspondant.
 */
export * from './pagination';
export * from './citoyen.schemas';
export * from './declaration.schemas';
