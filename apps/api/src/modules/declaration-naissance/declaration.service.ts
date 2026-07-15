import { randomInt } from 'node:crypto';
import { Prisma, Role, StatutDeclaration, type DeclarationNaissance } from '@prisma/client';
import type { DeclarationNaissanceDto } from '@e-mairie/shared';
import { prisma } from '../../prisma';
import { erreurs } from '../../http/erreurs';
import { peutTransiter } from './declaration.statuts';
import type { ChangementStatutDto, FiltreDeclarationsDto } from './declaration.schemas';

/** Sérialise en JSON « pur » (les Date deviennent des chaînes ISO) pour Prisma. */
const enJson = (v: unknown): Prisma.InputJsonValue => JSON.parse(JSON.stringify(v));

/** Numéro de suivi remis au citoyen : ND-<année>-<6 chiffres>, unique. */
async function genererNumeroSuivi(): Promise<string> {
  const annee = new Date().getFullYear();
  for (let i = 0; i < 5; i++) {
    const numero = `ND-${annee}-${String(randomInt(0, 1_000_000)).padStart(6, '0')}`;
    const existe = await prisma.declarationNaissance.findUnique({ where: { numeroSuivi: numero } });
    if (!existe) return numero;
  }
  throw new Error('Impossible de générer un numéro de suivi unique');
}

/**
 * Numéro officiel de l'acte : <année>/<séquence>. Esquisse — la vraie règle de
 * numérotation (préfixe de commune, remise à zéro…) est paramétrable par mairie.
 */
async function genererNumeroActe(): Promise<string> {
  const annee = new Date().getFullYear();
  const debutAnnee = new Date(annee, 0, 1);
  const dejaGeneres = await prisma.declarationNaissance.count({
    where: { genereLe: { gte: debutAnnee } },
  });
  return `${annee}/${String(dejaGeneres + 1).padStart(5, '0')}`;
}

type Declaration = DeclarationNaissance;

/** Applique une transition de statut ET journalise l'audit, atomiquement. */
async function transiter(
  declaration: Declaration,
  cible: StatutDeclaration,
  auteurId: string | null,
  options: { motif?: string; maj?: Prisma.DeclarationNaissanceUpdateInput } = {},
): Promise<Declaration> {
  if (!peutTransiter(declaration.statut, cible)) {
    throw erreurs.conflit(`Transition ${declaration.statut} → ${cible} non autorisée`);
  }
  const [misAJour] = await prisma.$transaction([
    prisma.declarationNaissance.update({
      where: { id: declaration.id },
      data: { statut: cible, ...options.maj },
    }),
    prisma.transitionStatut.create({
      data: {
        declarationId: declaration.id,
        ancienStatut: declaration.statut,
        nouveauStatut: cible,
        auteurId,
        motif: options.motif ?? null,
      },
    }),
  ]);
  return misAJour;
}

export const declarationService = {
  /** Création d'un brouillon par le citoyen connecté. */
  async creer(citoyenId: string, dto: DeclarationNaissanceDto) {
    return prisma.declarationNaissance.create({
      data: {
        // Numéro de suivi provisoire pour respecter la contrainte d'unicité ;
        // il n'a de sens pour le citoyen qu'à la soumission.
        numeroSuivi: `BR-${await genererNumeroSuivi()}`,
        citoyenId,
        enfant: enJson(dto.enfant),
        pere: enJson(dto.pere),
        mere: enJson(dto.mere),
        typeDeclarant: dto.typeDeclarant,
      },
    });
  },

  /** Le citoyen envoie son brouillon : passage Brouillon → Soumis. */
  async soumettre(citoyenId: string, id: string) {
    const declaration = await this.obtenirPourCitoyen(citoyenId, id);
    return transiter(declaration, StatutDeclaration.Soumis, citoyenId, {
      maj: { numeroSuivi: await genererNumeroSuivi(), soumisLe: new Date() },
    });
  },

  /** Après une demande de compléments, le citoyen renvoie le dossier. */
  async renvoyer(citoyenId: string, id: string) {
    const declaration = await this.obtenirPourCitoyen(citoyenId, id);
    return transiter(declaration, StatutDeclaration.EnVerification, citoyenId);
  },

  /** Liste réservée au citoyen : uniquement SES dossiers. */
  async listerPourCitoyen(citoyenId: string, filtre: FiltreDeclarationsDto) {
    return this.lister({ ...filtre, citoyenId });
  },

  /** Liste côté mairie : tous les dossiers, filtrables par statut. */
  async listerPourAgent(filtre: FiltreDeclarationsDto) {
    return this.lister(filtre);
  },

  async lister(filtre: FiltreDeclarationsDto) {
    const where: Prisma.DeclarationNaissanceWhereInput = {
      statut: filtre.statut,
      citoyenId: filtre.citoyenId,
    };
    if (filtre.numeroSuivi) where.numeroSuivi = filtre.numeroSuivi;
    // Recherche libre : numéro (partiel) ou nom/prénoms de l'enfant (champ JSON).
    if (filtre.recherche) {
      const q = filtre.recherche;
      where.OR = [
        { numeroSuivi: { contains: q, mode: 'insensitive' } },
        { enfant: { path: ['nom'], string_contains: q } },
        { enfant: { path: ['prenoms'], string_contains: q } },
      ];
    }
    const [items, total] = await prisma.$transaction([
      prisma.declarationNaissance.findMany({
        where,
        orderBy: { creeLe: 'desc' },
        skip: (filtre.page - 1) * filtre.parPage,
        take: filtre.parPage,
      }),
      prisma.declarationNaissance.count({ where }),
    ]);
    return { items, total, page: filtre.page, parPage: filtre.parPage };
  },

  async obtenirPourCitoyen(citoyenId: string, id: string): Promise<Declaration> {
    const declaration = await prisma.declarationNaissance.findUnique({ where: { id } });
    // On renvoie « introuvable » plutôt qu'« interdit » pour ne pas révéler
    // l'existence du dossier d'un autre citoyen.
    if (!declaration || declaration.citoyenId !== citoyenId) {
      throw erreurs.introuvable('Déclaration introuvable');
    }
    return declaration;
  },

  async obtenirPourAgent(id: string): Promise<Declaration> {
    const declaration = await prisma.declarationNaissance.findUnique({
      where: { id },
      include: { transitions: { orderBy: { creeLe: 'asc' } } },
    });
    if (!declaration) throw erreurs.introuvable('Déclaration introuvable');
    return declaration;
  },

  /**
   * Action de la mairie : changement de statut contrôlé (agent/officier). Les
   * effets de bord dépendent de la cible (validation, refus motivé, génération de
   * l'acte avec numéro officiel).
   */
  async changerStatut(auteurId: string, id: string, dto: ChangementStatutDto) {
    const declaration = await this.obtenirPourAgent(id);
    const maj: Prisma.DeclarationNaissanceUpdateInput = {};

    if (dto.statut === StatutDeclaration.Valide) {
      maj.valideLe = new Date();
    } else if (dto.statut === StatutDeclaration.Refuse) {
      maj.motifRefus = dto.motif || null;
    } else if (dto.statut === StatutDeclaration.ActeGenere) {
      maj.numeroActeOfficiel = await genererNumeroActe();
      maj.genereLe = new Date();
    }

    return transiter(declaration, dto.statut, auteurId, {
      motif: dto.motif || undefined,
      maj,
    });
  },

  /**
   * Indicateurs du tableau de bord agent (phase 1 de l'ERP). Calculés à la volée
   * depuis les déclarations et leurs horodatages — pas de table de stats à tenir.
   */
  async statsAgent() {
    const debutJour = new Date();
    debutJour.setHours(0, 0, 0, 0);

    const [recusAujourdhui, enAttente, enCours, piecesDemandees, valides, rejetes, totalCitoyens, pourMoyenne, activiteBrute] =
      await prisma.$transaction([
        prisma.declarationNaissance.count({ where: { creeLe: { gte: debutJour } } }),
        prisma.declarationNaissance.count({ where: { statut: StatutDeclaration.Soumis } }),
        prisma.declarationNaissance.count({ where: { statut: StatutDeclaration.EnVerification } }),
        prisma.declarationNaissance.count({ where: { statut: StatutDeclaration.PiecesDemandees } }),
        prisma.declarationNaissance.count({
          where: {
            statut: {
              in: [
                StatutDeclaration.Valide,
                StatutDeclaration.ActeGenere,
                StatutDeclaration.Disponible,
                StatutDeclaration.Retire,
              ],
            },
          },
        }),
        prisma.declarationNaissance.count({ where: { statut: StatutDeclaration.Refuse } }),
        prisma.citoyen.count({ where: { role: Role.CITOYEN } }),
        prisma.declarationNaissance.findMany({
          where: { soumisLe: { not: null }, valideLe: { not: null } },
          select: { soumisLe: true, valideLe: true },
        }),
        prisma.transitionStatut.findMany({
          take: 12,
          orderBy: { creeLe: 'desc' },
          include: { declaration: { select: { numeroSuivi: true, enfant: true } } },
        }),
      ]);

    // Temps moyen de traitement (soumission → validation), en heures.
    let tempsMoyenHeures: number | null = null;
    if (pourMoyenne.length > 0) {
      const totalMs = pourMoyenne.reduce(
        (s, d) => s + (d.valideLe!.getTime() - d.soumisLe!.getTime()),
        0,
      );
      tempsMoyenHeures = Math.round((totalMs / pourMoyenne.length / 3_600_000) * 10) / 10;
    }

    // Série d'activité sur 7 jours : déclarations créées par jour (données réelles).
    const debut7 = new Date();
    debut7.setHours(0, 0, 0, 0);
    debut7.setDate(debut7.getDate() - 6);
    const recentes = await prisma.declarationNaissance.findMany({
      where: { creeLe: { gte: debut7 } },
      select: { creeLe: true },
    });
    const parJour: { label: string; count: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const j = new Date(debut7);
      j.setDate(debut7.getDate() + i);
      parJour.push({ label: j.toLocaleDateString('fr-FR', { weekday: 'short' }), count: 0 });
    }
    for (const r of recentes) {
      const jour = new Date(r.creeLe.getFullYear(), r.creeLe.getMonth(), r.creeLe.getDate());
      const idx = Math.floor((jour.getTime() - debut7.getTime()) / 86_400_000);
      if (idx >= 0 && idx < 7) parJour[idx].count += 1;
    }

    const activite = activiteBrute.map((t) => ({
      id: t.id,
      ancienStatut: t.ancienStatut,
      nouveauStatut: t.nouveauStatut,
      motif: t.motif,
      creeLe: t.creeLe,
      numeroSuivi: t.declaration.numeroSuivi,
      enfant: t.declaration.enfant,
    }));

    return {
      recusAujourdhui,
      enAttente,
      enCours,
      piecesDemandees,
      valides,
      rejetes,
      totalCitoyens,
      tempsMoyenHeures,
      parJour,
      activite,
    };
  },
};
