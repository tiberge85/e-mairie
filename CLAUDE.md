# CLAUDE.md — Guide du projet e‑Mairie

Ce fichier oriente Claude Code (et l'équipe) sur les conventions du dépôt.

## Nature du projet

e‑Mairie : plateforme de gestion municipale + portail citoyen. Monorepo
`@e-mairie/*`. Le portail e‑Citoyen est la **façade publique** du même
back‑office que celui des agents — pas une application séparée.

## Stack

- **API** : TypeScript, **Zod** (validation), **Prisma** (ORM).
- **Front** : React, react-hook-form + **zodResolver**.
- Monorepo : `apps/api`, `packages/shared`.

## Conventions non négociables

1. **Documents polymorphes.** Une pièce se rattache à une entité métier via le
   couple `entite` / `entiteId`. Ne jamais introduire de colonne `dossierId` :
   classer dans un dossier GED = `entite = 'Dossier'`, `entiteId = <id>`.
2. **Frontière des schémas partagés.** Un schéma ne va dans `@e-mairie/shared`
   **que** si le formulaire React s'en sert via `zodResolver`. Les contrats
   purement API (multipart, filtres de requête) restent dans le module API.
3. **Le multipart n'envoie que des chaînes.** Un champ vide arrive comme `''`,
   pas `undefined` → `.or(z.literal(''))` signifie « non renseigné », pas
   « invalide ».
4. **L'OCR ne fait pas foi.** On conserve toujours l'image source **et** le
   texte OCR ; la donnée validée par le citoyen puis contrôlée par l'agent fait
   foi.
5. **Français** partout : code commenté, documentation, libellés.

## Documentation

Les cahiers des charges vivent dans `docs/cahier-des-charges/`.
Voir `docs/cahier-des-charges/module-e-citoyen-acte-naissance.md`.

## Style de documentation

Commentaires qui expliquent **le pourquoi**, pas le quoi. Voir
`apps/api/src/modules/ged/ged.schemas.ts` comme référence de ton.
