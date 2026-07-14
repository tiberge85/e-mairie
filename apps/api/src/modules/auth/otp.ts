import { randomInt } from 'node:crypto';
import { env } from '../../env';

/**
 * Génère un code OTP à 6 chiffres. On utilise `crypto.randomInt` (et non
 * `Math.random`) : un code de sécurité doit être imprévisible.
 */
export function genererCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, '0');
}

/**
 * « Envoie » le code au citoyen.
 *
 * En mode `console` (dev), on se contente de le journaliser : pas de SMS, pas de
 * coût, et le développeur voit le code dans les logs. En production, brancher
 * ici un vrai fournisseur (Twilio, Orange SMS API…) selon `env.otp.mode`.
 */
export function envoyerOtp(destinataire: string, code: string): void {
  if (env.otp.mode === 'console') {
    console.info(`[OTP] Code pour ${destinataire} : ${code} (valide ${env.otp.dureeMinutes} min)`);
    return;
  }
  // TODO production : intégration fournisseur SMS/email.
  console.warn(`[OTP] Mode d'envoi '${env.otp.mode}' non implémenté — code non transmis.`);
}
