import type {
  InscriptionCitoyenDto,
  ConnexionCitoyenDto,
  VerificationOtpDto,
} from '@e-mairie/shared';
import { prisma } from '../../prisma';
import { env } from '../../env';
import { erreurs } from '../../http/erreurs';
import { hacherMotDePasse, verifierMotDePasse } from './mots-de-passe';
import { genererCode, envoyerOtp } from './otp';
import { signerJeton } from './jetons';

/** Un '@' dans l'identifiant ⇒ c'est un email, sinon un téléphone. */
function estEmail(identifiant: string): boolean {
  return identifiant.includes('@');
}

function trouverParIdentifiant(identifiant: string) {
  const cle = identifiant.trim();
  return estEmail(cle)
    ? prisma.citoyen.findUnique({ where: { email: cle.toLowerCase() } })
    : prisma.citoyen.findUnique({ where: { telephone: cle } });
}

/** Crée et « envoie » un nouvel OTP pour un citoyen donné. */
async function emettreOtp(citoyenId: string, destinataire: string): Promise<void> {
  const code = genererCode();
  const codeHash = await hacherMotDePasse(code);
  const expireLe = new Date(Date.now() + env.otp.dureeMinutes * 60_000);
  await prisma.otpCode.create({ data: { citoyenId, codeHash, expireLe } });
  envoyerOtp(destinataire, code);
}

export const authService = {
  /**
   * Inscription : on crée le compte NON vérifié, puis on envoie un OTP. Le compte
   * ne devient exploitable qu'après vérification (cf. `verifierOtp`).
   */
  async inscrire(dto: InscriptionCitoyenDto) {
    const email = dto.email ? dto.email.toLowerCase() : null;

    if (await prisma.citoyen.findUnique({ where: { telephone: dto.telephone } })) {
      throw erreurs.conflit('Un compte existe déjà avec ce numéro de téléphone');
    }
    if (email && (await prisma.citoyen.findUnique({ where: { email } }))) {
      throw erreurs.conflit('Un compte existe déjà avec cet email');
    }

    const citoyen = await prisma.citoyen.create({
      data: {
        nom: dto.nom,
        prenoms: dto.prenoms,
        dateNaissance: dto.dateNaissance,
        telephone: dto.telephone,
        email,
        motDePasseHash: await hacherMotDePasse(dto.motDePasse),
      },
    });

    await emettreOtp(citoyen.id, dto.telephone);
    return {
      citoyenId: citoyen.id,
      message: 'Compte créé. Un code de vérification vous a été envoyé.',
    };
  },

  /**
   * Vérifie un OTP et, si valide, marque le compte vérifié puis délivre un jeton.
   * On compare au HASH du dernier code non consommé et non expiré.
   */
  async verifierOtp(dto: VerificationOtpDto) {
    const citoyen = await trouverParIdentifiant(dto.identifiant);
    if (!citoyen) {
      throw erreurs.requeteInvalide('Identifiant ou code invalide');
    }

    const otp = await prisma.otpCode.findFirst({
      where: { citoyenId: citoyen.id, consomme: false, expireLe: { gt: new Date() } },
      orderBy: { creeLe: 'desc' },
    });
    if (!otp || !(await verifierMotDePasse(dto.code, otp.codeHash))) {
      throw erreurs.requeteInvalide('Identifiant ou code invalide');
    }

    await prisma.$transaction([
      prisma.otpCode.update({ where: { id: otp.id }, data: { consomme: true } }),
      prisma.citoyen.update({ where: { id: citoyen.id }, data: { telephoneVerifie: true } }),
    ]);

    return {
      jeton: signerJeton({ sub: citoyen.id, role: citoyen.role }),
      citoyen: { id: citoyen.id, nom: citoyen.nom, prenoms: citoyen.prenoms, role: citoyen.role },
    };
  },

  /**
   * Connexion. Message d'erreur volontairement identique que le compte existe ou
   * non, pour ne pas révéler quels numéros sont inscrits.
   */
  async connecter(dto: ConnexionCitoyenDto) {
    const citoyen = await trouverParIdentifiant(dto.identifiant);
    if (!citoyen || !(await verifierMotDePasse(dto.motDePasse, citoyen.motDePasseHash))) {
      throw erreurs.nonAuthentifie('Identifiant ou mot de passe incorrect');
    }

    // Compte jamais vérifié : on renvoie un OTP au lieu d'un jeton.
    if (!citoyen.telephoneVerifie) {
      await emettreOtp(citoyen.id, citoyen.telephone);
      throw erreurs.interdit('Compte non vérifié : un nouveau code vous a été envoyé.');
    }

    return {
      jeton: signerJeton({ sub: citoyen.id, role: citoyen.role }),
      citoyen: { id: citoyen.id, nom: citoyen.nom, prenoms: citoyen.prenoms, role: citoyen.role },
    };
  },
};
