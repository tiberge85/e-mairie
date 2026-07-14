import type { FieldValues, Path, UseFormSetError } from 'react-hook-form';
import { ErreurApi } from './api';

/**
 * Reporte les erreurs de champ renvoyées par l'API sur les champs du formulaire,
 * et renvoie le message global à afficher en tête. Un seul point de traduction
 * API → formulaire.
 */
export function appliquerErreursServeur<T extends FieldValues>(
  e: unknown,
  setError: UseFormSetError<T>,
): string {
  if (e instanceof ErreurApi) {
    e.erreurs?.forEach(({ champ, message }) => {
      setError(champ as Path<T>, { message });
    });
    return e.message;
  }
  return "Impossible de joindre le serveur. Vérifiez votre connexion et réessayez.";
}
