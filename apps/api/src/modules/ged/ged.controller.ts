import type { Request, Response } from 'express';
import { gedService } from './ged.service';
import { filtreDocumentsSchema, televersementDocumentSchema } from './ged.schemas';

export const gedController = {
  async televerser(req: Request, res: Response) {
    if (!req.file) {
      res.status(400).json({ message: 'Aucun fichier fourni (champ multipart « fichier »)' });
      return;
    }
    const meta = televersementDocumentSchema.parse(req.body);
    const document = await gedService.enregistrer(req.file, meta);
    res.status(201).json(document);
  },

  async lister(req: Request, res: Response) {
    const filtre = filtreDocumentsSchema.parse(req.query);
    res.json(await gedService.lister(filtre));
  },

  async obtenir(req: Request, res: Response) {
    res.json(await gedService.obtenir(req.params.id));
  },
};
