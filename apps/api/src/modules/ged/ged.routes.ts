import { Router } from 'express';
import { asyncHandler } from '../../http/asyncHandler';
import { authentifier } from '../../middlewares/authentification';
import { upload } from './stockage';
import { gedController } from './ged.controller';

export const gedRoutes = Router();

// `upload.single('fichier')` lit le fichier multipart AVANT le contrôleur.
gedRoutes.post('/', authentifier, upload.single('fichier'), asyncHandler(gedController.televerser));
gedRoutes.get('/', authentifier, asyncHandler(gedController.lister));
gedRoutes.get('/:id', authentifier, asyncHandler(gedController.obtenir));
