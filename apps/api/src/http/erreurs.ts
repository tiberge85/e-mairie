/**
 * Erreur métier porteuse d'un code HTTP. Les services lèvent des `ErreurHttp` ;
 * le middleware de gestion des erreurs les traduit en réponses propres, sans que
 * chaque contrôleur ait à gérer les `try/catch` et les statuts.
 */
export class ErreurHttp extends Error {
  constructor(
    public readonly statut: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ErreurHttp';
  }
}

export const erreurs = {
  requeteInvalide: (message = 'Requête invalide', details?: unknown) =>
    new ErreurHttp(400, message, details),
  nonAuthentifie: (message = 'Authentification requise') => new ErreurHttp(401, message),
  interdit: (message = 'Accès refusé') => new ErreurHttp(403, message),
  introuvable: (message = 'Ressource introuvable') => new ErreurHttp(404, message),
  conflit: (message = 'Conflit') => new ErreurHttp(409, message),
};
