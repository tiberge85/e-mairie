import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import type { DeclarationNaissance } from '@prisma/client';
import { prisma } from '../../prisma';
import { erreurs } from '../../http/erreurs';

const COMMUNE = process.env.COMMUNE_NOM ?? 'Commune de Démonstration';
const NAVY = '#00113a';
const GOLD = '#9a7b1f';
const GRIS = '#444650';

interface PersonneJson {
  nom?: string;
  prenoms?: string;
  sexe?: string;
  dateNaissance?: string;
  heureNaissance?: string;
  lieuNaissance?: string;
  numeroPiece?: string;
  [k: string]: unknown;
}

const SEXE_LABEL: Record<string, string> = { M: 'Masculin', F: 'Féminin' };

function dateFr(v?: string | Date | null): string {
  if (!v) return '—';
  const d = typeof v === 'string' ? new Date(v) : v;
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
}

/** Construit le PDF de l'acte et le renvoie sous forme de Buffer. */
function construirePdf(
  d: DeclarationNaissance,
  qr: Buffer,
  urlVerif: string,
): Promise<Buffer> {
  const enfant = d.enfant as PersonneJson;
  const pere = d.pere as PersonneJson;
  const mere = d.mere as PersonneJson;

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 56 });
    const chunks: Buffer[] = [];
    doc.on('data', (c) => chunks.push(c as Buffer));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const gauche = doc.page.margins.left;
    const largeur = doc.page.width - doc.page.margins.left - doc.page.margins.right;

    // ── En-tête ──────────────────────────────────────────────────────────────
    doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(11)
      .text('RÉPUBLIQUE — ' + COMMUNE.toUpperCase(), { align: 'center', characterSpacing: 1 });
    doc.moveDown(0.4);
    doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(22)
      .text("EXTRAIT D'ACTE DE NAISSANCE", { align: 'center' });
    doc.moveDown(0.3);
    // Filet doré
    const yTrait = doc.y;
    doc.moveTo(gauche + largeur / 2 - 40, yTrait).lineTo(gauche + largeur / 2 + 40, yTrait)
      .lineWidth(2).strokeColor(GOLD).stroke();
    doc.moveDown(1.2);

    doc.fillColor(GRIS).font('Helvetica').fontSize(11)
      .text(`Acte n° ${d.numeroActeOfficiel}`, { align: 'center' });
    doc.moveDown(1.4);

    // ── Section utilitaire ───────────────────────────────────────────────────
    const titreSection = (t: string) => {
      doc.moveDown(0.6);
      doc.fillColor(GOLD).font('Helvetica-Bold').fontSize(10)
        .text(t.toUpperCase(), { characterSpacing: 1 });
      doc.moveDown(0.2);
    };
    const ligne = (label: string, valeur: string) => {
      doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(11)
        .text(label + ' : ', { continued: true });
      doc.fillColor('#191c1e').font('Helvetica').text(valeur || '—');
    };

    titreSection("L'enfant");
    ligne('Nom', String(enfant.nom ?? ''));
    ligne('Prénom(s)', String(enfant.prenoms ?? ''));
    ligne('Sexe', SEXE_LABEL[String(enfant.sexe)] ?? '—');
    ligne(
      'Né(e) le',
      `${dateFr(enfant.dateNaissance)}${enfant.heureNaissance ? ` à ${enfant.heureNaissance}` : ''}`,
    );
    ligne('Lieu de naissance', String(enfant.lieuNaissance ?? ''));

    titreSection('Le père');
    ligne('Nom et prénoms', `${pere.prenoms ?? ''} ${pere.nom ?? ''}`.trim());
    if (pere.numeroPiece) ligne("Pièce d'identité", String(pere.numeroPiece));

    titreSection('La mère');
    ligne('Nom et prénoms', `${mere.prenoms ?? ''} ${mere.nom ?? ''}`.trim());
    if (mere.numeroPiece) ligne("Pièce d'identité", String(mere.numeroPiece));

    // ── Signature ────────────────────────────────────────────────────────────
    doc.moveDown(2);
    doc.fillColor(GRIS).font('Helvetica').fontSize(11)
      .text(`Fait à ${COMMUNE}, le ${dateFr(d.genereLe)}.`);
    doc.moveDown(1);
    doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(11)
      .text("L'Officier d'état civil");
    doc.fillColor(GRIS).font('Helvetica-Oblique').fontSize(10)
      .text('Signé électroniquement — cachet numérique de la mairie apposé.');

    // ── QR de vérification (bas de page) ─────────────────────────────────────
    const yQr = doc.page.height - doc.page.margins.bottom - 130;
    doc.image(qr, gauche, yQr, { width: 96 });
    doc.fillColor(GRIS).font('Helvetica').fontSize(9)
      .text("Vérifiez l'authenticité de cet acte en scannant ce QR code :", gauche + 110, yQr + 20, { width: largeur - 110 });
    doc.fillColor(GOLD).font('Helvetica').fontSize(8)
      .text(urlVerif, gauche + 110, yQr + 48, { width: largeur - 110 });
    doc.fillColor('#9aa0a6').font('Helvetica').fontSize(8)
      .text(`Référence de suivi : ${d.numeroSuivi}`, gauche + 110, yQr + 74, { width: largeur - 110 });

    doc.end();
  });
}

export const acteService = {
  /**
   * Génère le PDF de l'acte pour un dossier dont l'acte a été généré
   * (numéro officiel attribué). `construireUrlVerif` produit l'URL encodée dans
   * le QR code.
   */
  async genererPdf(
    id: string,
    construireUrlVerif: (numero: string) => string,
  ): Promise<{ buffer: Buffer; numero: string }> {
    const d = await prisma.declarationNaissance.findUnique({ where: { id } });
    if (!d) throw erreurs.introuvable('Déclaration introuvable');
    if (!d.numeroActeOfficiel) {
      throw erreurs.conflit("L'acte n'a pas encore été généré pour ce dossier");
    }
    const urlVerif = construireUrlVerif(d.numeroActeOfficiel);
    const qr = await QRCode.toBuffer(urlVerif, { margin: 1, width: 220 });
    const buffer = await construirePdf(d, qr, urlVerif);
    return { buffer, numero: d.numeroActeOfficiel };
  },

  /** Données minimales d'authenticité pour la page publique de vérification. */
  async verifier(numero: string) {
    const d = await prisma.declarationNaissance.findUnique({
      where: { numeroActeOfficiel: numero },
    });
    if (!d) return null;
    const enfant = d.enfant as PersonneJson;
    return {
      numero,
      statut: d.statut,
      enfant: { nom: enfant.nom ?? '', prenoms: enfant.prenoms ?? '' },
      genereLe: d.genereLe,
    };
  },
};
