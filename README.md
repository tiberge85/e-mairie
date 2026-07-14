# e‑Mairie

Plateforme de **gestion de mairie** évoluant vers une **e‑Mairie intelligente** :
un portail où le citoyen prépare son dossier (état civil, urbanisme…) avant même
d'arriver au guichet, adossé à un back‑office pour les agents.

## Architecture

Monorepo `@e-mairie/*`.

```
GESTION DE MAIRIE/
├── apps/
│   └── api/            # API TypeScript — Zod (validation) + Prisma (ORM)
│       └── src/modules/
│           └── ged/    # Gestion Électronique des Documents (documents polymorphes)
├── packages/
│   └── shared/         # Schémas partagés API ⇆ formulaires React (zodResolver)
└── docs/
    └── cahier-des-charges/
```

Principes structurants :

- **Documents polymorphes** : une pièce se rattache à n'importe quelle entité
  métier via `entite` / `entiteId` (jamais de colonne `dossierId` dédiée).
- **Schémas partagés** : seuls les schémas dont le formulaire React se sert
  (via `zodResolver`) vivent dans `@e-mairie/shared` ; les contrats purement API
  restent avec l'API.

## Documentation

- [Cahier des charges — Module e‑Citoyen (acte de naissance)](docs/cahier-des-charges/module-e-citoyen-acte-naissance.md)

## Statut

Projet en cours de spécification et de développement.
