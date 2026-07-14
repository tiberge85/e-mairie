# Module e‑Citoyen — Déclaration numérique d'un acte de naissance

> Cahier des charges fonctionnel et technique.
> Rattaché au projet **e‑Mairie** (monorepo `@e-mairie/*`).
> Statut : *spécification* — v1.0.

---

## 1. Intention

Faire basculer l'état civil d'un modèle « le citoyen arrive au guichet les mains
vides » vers un modèle où **le dossier est déjà constitué, vérifié et pré‑saisi
avant même que l'usager se présente**. Le guichet cesse d'être un lieu de saisie
pour devenir un lieu de contrôle et de délivrance.

Trois effets recherchés :

- **Réduire le temps d'attente** : la saisie, l'étape la plus lente au guichet,
  est faite par le citoyen, chez lui, à son rythme.
- **Améliorer la qualité des données** : l'OCR pré‑remplit à partir des pièces
  officielles ; l'agent corrige au lieu de tout ressaisir.
- **Tracer** : chaque dossier a un numéro de suivi, un journal d'audit et un
  statut consultable en continu par le citoyen.

Le portail e‑Citoyen n'est **pas** une application séparée : c'est la façade
publique d'e‑Mairie. Une déclaration déposée par un citoyen atterrit dans le même
back‑office d'état civil que celui utilisé aujourd'hui par les agents.

---

## 2. Périmètre de la v1

**Dans le périmètre**

- Compte citoyen (création, connexion, OTP).
- Tableau de bord citoyen.
- Déclaration de naissance : formulaire multi‑étapes, téléversement des pièces,
  OCR de pré‑remplissage, récapitulatif, déclaration sur l'honneur, envoi.
- Suivi du dossier côté citoyen (statuts, notifications).
- Traitement côté mairie : file « à vérifier », comparaison OCR / image,
  demande de compléments, validation / refus.
- Génération de l'acte, numéro officiel, signature de l'officier, archivage GED,
  QR Code de vérification.

**Hors périmètre v1 (backlog — voir §12)**

- NFC, reconnaissance faciale, paiement en ligne, prise de rendez‑vous.
  Ces briques sont conçues comme des *extensions*, pas comme des prérequis : la
  v1 doit fonctionner sans elles.

Ce découpage est délibéré. Chacune des fonctions avancées touche à la
réglementation (biométrie), à un prestataire (paiement) ou au matériel (NFC) ;
les enfermer dans la v1 ferait dépendre l'état civil de contraintes externes.

---

## 3. Acteurs

| Acteur | Rôle |
|---|---|
| **Citoyen (déclarant)** | Crée le compte, saisit la déclaration, téléverse les pièces, suit le dossier. |
| **Agent d'état civil** | Vérifie, demande des compléments, approuve ou rejette. |
| **Officier d'état civil** | Signe l'acte généré. Peut être le même agent selon la commune. |
| **Système (OCR / règles)** | Pré‑remplit, détecte les doublons et les images floues, attribue les numéros. |

---

## 4. Parcours citoyen

### 4.1 Entrée par QR Code

Un QR Code affiché à l'entrée de la mairie et sur les supports de communication
ouvre le portail e‑Mairie. Le QR Code encode une URL publique ; il peut porter un
paramètre de campagne (`?src=affiche-mairie`) à des fins de statistiques, mais
**aucune donnée personnelle**.

Le portail est **responsive** : le même parcours fonctionne au scan sur
smartphone, sur tablette et sur ordinateur.

### 4.2 Authentification

**Nouveau citoyen** — création de compte :

- Nom, Prénom(s)
- Date de naissance
- Téléphone
- Email *(facultatif)*
- Mot de passe + confirmation
- Validation par **code OTP** (SMS, ou email si fourni).

**Citoyen déjà inscrit** — connexion :

- Téléphone **ou** email
- Mot de passe
- OTP selon le niveau de sécurité exigé (configurable par la commune).

> Le téléphone est l'identifiant pivot, pas l'email : dans le contexte visé,
> tout le monde a un numéro, pas forcément une adresse mail. L'email reste
> facultatif partout où il apparaît.

### 4.3 Tableau de bord citoyen

Après connexion : **Nouvelle demande**, **Mes demandes**, **Documents déposés**,
**Notifications**, **Paiements**, **Rendez‑vous**, **Profil**.

*(Paiements et Rendez‑vous sont affichés mais inactifs en v1 — voir §12.)*

### 4.4 Formulaire intelligent — Déclaration de naissance

Formulaire **multi‑étapes**, chaque étape validée avant de passer à la suivante.
Le brouillon est **sauvegardé automatiquement** : un citoyen interrompu retrouve
sa saisie.

**Étape 1 — L'enfant**

- Nom, Prénom(s), Sexe
- Date de naissance, Heure de naissance
- Lieu de naissance, Centre de santé
- Poids *(optionnel)*, Type d'accouchement *(optionnel)*

**Étape 2 — Le père**

- Nom, Prénom(s), Date de naissance
- Nationalité, Profession, Adresse, Téléphone
- Numéro de la pièce d'identité
- **Téléversement de la pièce d'identité** → OCR → pré‑remplissage → correction possible.

**Étape 3 — La mère**

- Mêmes champs et même fonctionnement OCR que pour le père.

**Étape 4 — Le déclarant**

- Père, Mère, Tuteur, Sage‑femme, Agent de santé, Autre.

**Étape 5 — Vérification**

- Récapitulatif complet de toutes les informations et pièces.
- Le citoyen confirme l'exactitude.

**Étape 6 — Déclaration sur l'honneur + envoi**

- Case à cocher attestant l'exactitude des informations (signature électronique
  simple : consentement horodaté + trace).
- À l'envoi : création du dossier, **numéro unique de suivi**, accusé de
  réception, notification (SMS / email / in‑app).

### 4.5 Téléversement & OCR

Le citoyen **photographie** la pièce avec la caméra du téléphone, **ou** importe
une image existante. Le système :

1. **compresse et optimise** la photo (réduire le poids sans perdre en lisibilité) ;
2. **détecte les images floues** et invite à reprendre la photo *avant* l'envoi ;
3. applique l'**OCR** pour lire nom, prénom, numéro de pièce, date de naissance… ;
4. **pré‑remplit** les champs ; le citoyen **corrige** si besoin.

> L'OCR pré‑remplit, il ne fait pas foi. La donnée qui fait foi est celle que le
> citoyen a validée puis que l'agent a contrôlée face à l'image d'origine. On
> conserve donc **et** le texte OCR **et** l'image source (cf. `texteOcr` et le
> versionnement dans la GED existante).

---

## 5. Traitement côté mairie

Le dossier apparaît **immédiatement** dans le tableau de bord de l'agent d'état
civil au statut **À vérifier**.

L'agent peut :

- consulter toutes les informations ;
- visualiser les pièces jointes ;
- **comparer côte à côte** les données extraites par OCR et les images originales ;
- **demander des compléments** (le dossier repasse côté citoyen) ;
- **approuver** ou **rejeter** (motif obligatoire au rejet).

---

## 6. Cycle de vie du dossier (statuts)

```
Brouillon
   └─▶ Soumis
          └─▶ En cours de vérification
                 ├─▶ Pièces complémentaires demandées ──▶ (retour) En cours de vérification
                 ├─▶ Refusé            (état terminal, motivé)
                 └─▶ Validé
                        └─▶ Acte généré
                               └─▶ Disponible
                                      └─▶ Retiré   (état terminal)
```

| Statut | Signification | Acteur qui déclenche |
|---|---|---|
| **Brouillon** | Saisie en cours, non envoyée | Citoyen |
| **Soumis** | Envoyé, en attente de prise en charge | Citoyen |
| **En cours de vérification** | Un agent instruit le dossier | Agent |
| **Pièces complémentaires demandées** | En attente d'un complément citoyen | Agent |
| **Validé** | Contrôles OK, prêt pour génération | Agent |
| **Refusé** | Rejeté avec motif *(terminal)* | Agent |
| **Acte généré** | Acte produit et signé | Système / Officier |
| **Disponible** | Prêt à être retiré / téléchargé | Système |
| **Retiré** | Remis au citoyen *(terminal)* | Agent / Citoyen |

Chaque transition est **horodatée** et **journalisée** (§9).

---

## 7. Génération de l'acte

Après validation :

- **génération automatique** de l'acte de naissance ;
- attribution d'un **numéro officiel** selon les règles de numérotation de la
  commune (paramétrable : préfixe, année, séquence, remise à zéro annuelle…) ;
- **signature électronique de l'officier** d'état civil ;
- **archivage sécurisé** du dossier et des pièces dans la **GED existante**
  (`entite = 'Dossier'`, versionnement, durée de conservation légale) ;
- **QR Code de vérification** apposé sur l'acte : son scan mène à une page
  publique qui atteste l'authenticité et l'état de l'acte, sans exposer de
  données personnelles au‑delà du strict nécessaire.

---

## 8. Rattachement à l'architecture existante

Le module réutilise les fondations d'e‑Mairie plutôt que d'en créer de nouvelles.

- **GED polymorphe.** Toute pièce (CNI du père, de la mère, acte final) est un
  `Document` rattaché par `entite`/`entiteId` — jamais par une colonne dédiée.
  Une déclaration devient une entité métier (`entite = 'DeclarationNaissance'`)
  à laquelle les documents se rattachent ; l'acte final est classé dans un
  dossier GED (`entite = 'Dossier'`). Aucune migration `dossierId` n'est requise.
- **Citoyen.** L'entité `Citoyen` existe déjà et sert de titulaire du compte et
  de rattachement des pièces.
- **Schémas partagés.** Les schémas dont **le formulaire React se sert aussi**
  (via `zodResolver`) vivent dans `@e-mairie/shared` : ce sont eux, et eux seuls,
  qu'il faut mutualiser (enfant, père, mère, déclarant). Les contrats purement
  API (multipart de téléversement, filtres de liste) restent côté API, comme
  pour la GED.
- **Versionnement & OCR.** Le champ `texteOcr` et le mécanisme `precedentId`
  déjà définis pour la GED couvrent le besoin « garder l'image + le texte + les
  versions successives » sans nouvelle mécanique.

### Modèle de données (esquisse Prisma)

```
DeclarationNaissance
  id                 String   @id @default(uuid())
  numeroSuivi        String   @unique          // remis au citoyen à l'envoi
  numeroActeOfficiel String?  @unique          // attribué à la génération
  statut             StatutDeclaration          // enum, cf. §6
  citoyenId          String                     // déclarant / titulaire du compte
  enfant             Json                        // ou table dédiée
  pere               Json
  mere               Json
  typeDeclarant      TypeDeclarant
  motifRefus         String?
  soumisLe           DateTime?
  valideLe           DateTime?
  genereLe           DateTime?
  // les pièces sont des Document (entite='DeclarationNaissance', entiteId=id)
```

> `enfant` / `pere` / `mere` en `Json` est une esquisse : à arbitrer entre
> colonnes dédiées (requêtable, contraint) et JSON (souple). La décision dépend
> du besoin de recherche sur ces champs.

---

## 9. Exigences transverses

- **Responsive** : smartphone, tablette, ordinateur — priorité au mobile (entrée
  par QR Code).
- **Sécurité & données personnelles** : minimisation des données, chiffrement au
  repos des pièces d'identité, accès agent tracé, consentement horodaté.
  Conformité aux exigences locales de protection des données personnelles.
- **Journal d'audit** : historique complet des modifications (qui, quoi, quand)
  sur chaque dossier et chaque pièce.
- **Notifications temps réel** : SMS, email, in‑app, sur chaque changement de
  statut.
- **Détection de doublons** : empêcher deux déclarations pour un même enfant
  (heuristique : nom + date/heure + parents + centre de santé).
- **Accusé de réception** systématique à l'envoi.

---

## 10. Règles métier structurantes

1. **L'OCR ne fait jamais foi** : toute donnée pré‑remplie est corrigeable par le
   citoyen, puis contrôlée par l'agent face à l'image source.
2. **Un refus est motivé** : le statut *Refusé* exige un motif renseigné.
3. **Le numéro de suivi est émis à l'envoi** ; le **numéro officiel** ne l'est
   qu'à la génération de l'acte — les deux ne se confondent pas.
4. **Une demande de compléments ne perd pas la saisie** : le dossier repasse
   côté citoyen sans repartir de zéro.
5. **L'image source est conservée** aux côtés du texte OCR, pour permettre la
   comparaison et l'audit.

---

## 11. Critères d'acceptation (v1)

- [ ] Un nouveau citoyen crée un compte et valide par OTP.
- [ ] Un citoyen dépose une déclaration complète en moins de 10 minutes,
      photos comprises.
- [ ] L'OCR pré‑remplit au moins nom, prénom, n° de pièce et date de naissance
      depuis une CNI lisible ; les champs restent corrigeables.
- [ ] Une photo floue est signalée **avant** l'envoi.
- [ ] Le dépôt émet un numéro de suivi + un accusé de réception.
- [ ] Le dossier apparaît côté agent au statut *À vérifier* en temps quasi réel.
- [ ] L'agent peut comparer OCR / image, demander un complément, valider ou
      rejeter avec motif.
- [ ] La validation génère un acte numéroté, signé, archivé en GED, porteur d'un
      QR Code de vérification vérifiable publiquement.
- [ ] Chaque transition de statut est journalisée et notifiée au citoyen.
- [ ] Une seconde déclaration pour le même enfant est détectée comme doublon.

---

## 12. Backlog — « Smart City » (post‑v1)

Ces briques transforment e‑Mairie d'un logiciel municipal en **plateforme de
ville intelligente**. Elles sont volontairement séparées de la v1.

- **OCR + IA** : lecture automatique des CNI, passeports et autres pièces, avec
  pré‑remplissage étendu.
- **Scan NFC** : lecture des puces des pièces d'identité qui le permettent, pour
  récupérer les informations officielles sans saisie ni OCR.
- **Reconnaissance faciale** : vérifier que le déposant correspond à la photo de
  la pièce — **uniquement là où la réglementation l'autorise**, et avec le
  consentement explicite de l'usager.
- **Anti‑doublon avancé** : au‑delà de l'heuristique v1, rapprochement inter‑
  services.
- **Prise de rendez‑vous intelligente** : à la validation, le citoyen choisit un
  créneau de retrait — réduit fortement les files.
- **Paiement en ligne** des frais administratifs éventuels.

> Point d'attention réglementaire : biométrie et reconnaissance faciale sont
> les plus sensibles. Elles doivent rester **activables/désactivables par
> commune** et n'être jamais un point de passage obligé du parcours.

---

## 13. Journal des décisions

| Date | Décision | Raison |
|---|---|---|
| 2026‑07‑14 | NFC, biométrie, paiement, RDV sortis de la v1 | Dépendances externes (matériel, prestataire, réglementation) — ne doivent pas bloquer l'état civil de base. |
| 2026‑07‑14 | Réutilisation de la GED polymorphe pour toutes les pièces | Évite une colonne `dossierId` redondante ; cohérent avec `ged.schemas.ts`. |
| 2026‑07‑14 | Téléphone = identifiant pivot, email facultatif | Contexte d'usage : couverture téléphonique supérieure à l'email. |
