import { Prisma } from '@prisma/client';
import { prisma } from '../../prisma';
import { erreurs } from '../../http/erreurs';
import {
  ENTITE_DOSSIER,
  type FiltreDocumentsDto,
  type TeleversementDocumentDto,
} from './ged.schemas';

export const gedService = {
  /**
   * Enregistre une pièce téléversée. Le rattachement est polymorphe : soit
   * (entite, entiteId) directement, soit un `dossierId` (⇒ entite = 'Dossier').
   */
  async enregistrer(fichier: Express.Multer.File, meta: TeleversementDocumentDto) {
    let entite = meta.entite || undefined;
    let entiteId = meta.entiteId || undefined;
    if (meta.dossierId) {
      entite = ENTITE_DOSSIER;
      entiteId = meta.dossierId;
    }
    if (!entite || !entiteId) {
      throw erreurs.requeteInvalide(
        'Rattachement manquant : fournir (entite, entiteId) ou dossierId',
      );
    }

    // Versionnement : un `precedentId` fait de cette pièce la version suivante.
    let version = 1;
    const precedentId = meta.precedentId || undefined;
    if (precedentId) {
      const precedent = await prisma.document.findUnique({ where: { id: precedentId } });
      if (!precedent) throw erreurs.requeteInvalide('Document précédent introuvable');
      version = precedent.version + 1;
    }

    return prisma.document.create({
      data: {
        nom: meta.nom || fichier.originalname,
        cheminStockage: fichier.path,
        mimeType: fichier.mimetype,
        tailleOctets: fichier.size,
        entite,
        entiteId,
        citoyenId: meta.citoyenId || null,
        texteOcr: meta.texteOcr || null,
        version,
        precedentId,
      },
    });
  },

  async lister(filtre: FiltreDocumentsDto) {
    const where: Prisma.DocumentWhereInput = {
      entite: filtre.dossierId ? ENTITE_DOSSIER : filtre.entite,
      entiteId: filtre.dossierId ?? filtre.entiteId,
      citoyenId: filtre.citoyenId,
      mimeType: filtre.mimeType,
    };
    // Par défaut : uniquement la version courante (aucune version postérieure ne
    // la référence) et hors archives.
    if (!filtre.toutesVersions) where.versionsSuivantes = { none: {} };
    if (!filtre.inclureArchives) where.archiveLe = null;

    const [items, total] = await prisma.$transaction([
      prisma.document.findMany({
        where,
        orderBy: { creeLe: 'desc' },
        skip: (filtre.page - 1) * filtre.parPage,
        take: filtre.parPage,
      }),
      prisma.document.count({ where }),
    ]);
    return { items, total, page: filtre.page, parPage: filtre.parPage };
  },

  async obtenir(id: string) {
    const document = await prisma.document.findUnique({ where: { id } });
    if (!document) throw erreurs.introuvable('Document introuvable');
    return document;
  },
};
