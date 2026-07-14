import { existsSync, mkdirSync } from 'node:fs';
import { extname } from 'node:path';
import { randomUUID } from 'node:crypto';
import multer from 'multer';
import { env } from '../../env';

/**
 * Stockage local des pièces téléversées.
 *
 * ⚠️ Le disque des services Render gratuits est ÉPHÉMÈRE : ce stockage convient
 * au dev et à la démo, mais la production doit viser un stockage objet
 * (S3, Cloudflare R2…). Le reste du code ne dépend que de `cheminStockage`,
 * donc basculer revient à remplacer ce module.
 */
if (!existsSync(env.stockageDossier)) {
  mkdirSync(env.stockageDossier, { recursive: true });
}

const stockage = multer.diskStorage({
  destination: (_req, _fichier, cb) => cb(null, env.stockageDossier),
  // Nom aléatoire : deux citoyens peuvent téléverser « cni.jpg » sans collision.
  filename: (_req, fichier, cb) => cb(null, `${randomUUID()}${extname(fichier.originalname)}`),
});

/** Limite à 10 Mo : une photo de pièce d'identité n'a pas besoin de plus. */
export const upload = multer({
  storage: stockage,
  limits: { fileSize: 10 * 1024 * 1024 },
});
