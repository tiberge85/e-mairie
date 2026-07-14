# e‑Mairie

Plateforme de **gestion de mairie** évoluant vers une **e‑Mairie intelligente** :
un portail où le citoyen prépare son dossier (état civil, urbanisme…) avant même
d'arriver au guichet, adossé à un back‑office pour les agents.

## Architecture

Monorepo `@e-mairie/*` (npm workspaces).

```
GESTION DE MAIRIE/
├── apps/
│   └── api/                 # API TypeScript — Express + Zod + Prisma (PostgreSQL)
│       ├── prisma/          # schema.prisma
│       └── src/
│           ├── app.ts       # assemblage Express
│           ├── index.ts     # démarrage (écoute sur PORT)
│           ├── middlewares/ # auth (JWT), gestion d'erreurs
│           └── modules/
│               ├── auth/                  # inscription, OTP, connexion
│               ├── declaration-naissance/ # cœur métier + machine à états
│               └── ged/                   # documents polymorphes
│   └── web/                 # portail citoyen React (Vite) — inscription, OTP,
│                            #   tableau de bord, déclaration multi-étapes
├── packages/
│   └── shared/              # schémas Zod partagés API ⇆ formulaires React
├── docs/cahier-des-charges/
└── render.yaml              # déploiement Render (API + site statique)
```

Principes structurants (cf. `CLAUDE.md`) :

- **Documents polymorphes** : une pièce se rattache à n'importe quelle entité
  métier via `entite` / `entiteId` (jamais de colonne `dossierId`).
- **Schémas partagés** : seuls les schémas utilisés par les formulaires React
  (via `zodResolver`) vivent dans `@e-mairie/shared`.
- **L'OCR ne fait pas foi** : on conserve l'image source ET le texte OCR.

## Démarrer en local

Prérequis : Node ≥ 20 et une base PostgreSQL.

```bash
npm install
cp .env.example .env          # renseigner DATABASE_URL et JWT_SECRET
npm run prisma:migrate        # crée les tables (migration de dev)
npm run dev                   # API sur http://localhost:3000
```

## Portail citoyen (frontend)

```bash
npm install
cd apps/web && cp .env.example .env    # VITE_API_URL pointe sur l'API
npm run dev                            # portail sur http://localhost:5173
```

Le portail couvre : inscription + vérification OTP, connexion, tableau de bord,
formulaire multi-étapes de déclaration de naissance (enfant, père, mère,
déclarant, récapitulatif + déclaration sur l'honneur), et suivi des demandes.
Les formulaires valident avec les schémas de `@e-mairie/shared` (mêmes règles que
l'API).

## Endpoints principaux

| Méthode | Route | Accès | Rôle |
|---|---|---|---|
| GET | `/health` | public | sonde Render |
| POST | `/api/auth/inscription` | public | créer un compte (envoie un OTP) |
| POST | `/api/auth/otp` | public | valider l'OTP → jeton |
| POST | `/api/auth/connexion` | public | se connecter → jeton |
| POST | `/api/declarations` | citoyen | créer un brouillon |
| GET | `/api/declarations/mes` | citoyen | mes dossiers |
| POST | `/api/declarations/:id/soumettre` | citoyen | envoyer (→ numéro de suivi) |
| POST | `/api/declarations/:id/renvoyer` | citoyen | renvoyer après compléments |
| GET | `/api/declarations` | agent | file de traitement (filtrable par statut) |
| GET | `/api/declarations/:id` | agent | consulter + journal d'audit |
| PATCH | `/api/declarations/:id/statut` | agent | valider / refuser / générer l'acte |
| POST | `/api/documents` | authentifié | téléverser une pièce (multipart) |
| GET | `/api/documents` | authentifié | lister les pièces |

Les jetons s'envoient dans l'entête `Authorization: Bearer <jeton>`.

## Déploiement Render

Le fichier `render.yaml` décrit une base PostgreSQL + un service web. Créez un
Blueprint depuis le dashboard Render en pointant sur ce dépôt. ⚠️ L'offre
gratuite est faite pour la démo (base qui expire à 30 jours, service en veille
après 15 min) — passer en plan payant + stockage objet pour la production.

## Documentation

- [Cahier des charges — Module e‑Citoyen (acte de naissance)](docs/cahier-des-charges/module-e-citoyen-acte-naissance.md)

## État d'avancement

- ✅ Backend : auth (OTP/JWT), cycle de vie complet de la déclaration, GED, audit.
- ✅ Portail citoyen React : inscription/OTP, tableau de bord, déclaration
  multi-étapes, suivi des demandes.
- ⬜ Téléversement des pièces avec OCR dans le formulaire, écran agent (mairie).
- ⬜ Notifications SMS, génération PDF de l'acte, QR Code de vérification.
