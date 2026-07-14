import type { Request, Response } from 'express';
import { declarationNaissanceSchema } from '@e-mairie/shared';
import { declarationService } from './declaration.service';
import { changementStatutSchema, filtreDeclarationsSchema } from './declaration.schemas';

/** Renvoie l'utilisateur authentifié (garanti présent après `authentifier`). */
function utilisateur(req: Request) {
  return req.utilisateur!;
}

export const declarationController = {
  // ── Côté citoyen ───────────────────────────────────────────────────────────
  async creer(req: Request, res: Response) {
    const dto = declarationNaissanceSchema.parse(req.body);
    const declaration = await declarationService.creer(utilisateur(req).id, dto);
    res.status(201).json(declaration);
  },

  async mesDeclarations(req: Request, res: Response) {
    const filtre = filtreDeclarationsSchema.parse(req.query);
    res.json(await declarationService.listerPourCitoyen(utilisateur(req).id, filtre));
  },

  async maDeclaration(req: Request, res: Response) {
    const declaration = await declarationService.obtenirPourCitoyen(
      utilisateur(req).id,
      req.params.id,
    );
    res.json(declaration);
  },

  async soumettre(req: Request, res: Response) {
    res.json(await declarationService.soumettre(utilisateur(req).id, req.params.id));
  },

  async renvoyer(req: Request, res: Response) {
    res.json(await declarationService.renvoyer(utilisateur(req).id, req.params.id));
  },

  // ── Côté mairie ────────────────────────────────────────────────────────────
  async listerAgent(req: Request, res: Response) {
    const filtre = filtreDeclarationsSchema.parse(req.query);
    res.json(await declarationService.listerPourAgent(filtre));
  },

  async obtenirAgent(req: Request, res: Response) {
    res.json(await declarationService.obtenirPourAgent(req.params.id));
  },

  async changerStatut(req: Request, res: Response) {
    const dto = changementStatutSchema.parse(req.body);
    res.json(await declarationService.changerStatut(utilisateur(req).id, req.params.id, dto));
  },
};
