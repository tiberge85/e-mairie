# Module Back-Office — ERP de gestion communale

> Cahier des charges fonctionnel.
> Rattaché au projet **e-Mairie**. Fait suite au module e-Citoyen.
> Statut : *spécification* — v1.0. Voir la **feuille de route** (§14) pour ce qui
> est livré et ce qui reste.

---

## 1. Intention

Donner aux agents municipaux un véritable **ERP de gestion communale** : un
espace sécurisé où l'on traite les demandes citoyennes, où chaque service suit
son activité, et où la hiérarchie (chef de service, secrétaire général, maire)
dispose d'un **centre de pilotage** adapté à son niveau de responsabilité.

Le back-office est l'autre moitié du portail e-Citoyen : les demandes déposées
côté citoyen y arrivent, y sont instruites, validées, signées, puis l'acte est
généré et rendu disponible. Tout est **tracé**.

Principe directeur : **chaque agent ne voit que ce que son rôle autorise.**

---

## 2. Rôles et périmètres

| Rôle | Accès |
|---|---|
| **Agent** | File de traitement de son service, consultation et instruction des dossiers. |
| **Officier d'état civil** | Idem agent + signature des actes. |
| **Chef de service** | Indicateurs de son service : charge, performance par agent, délais. |
| **Secrétaire général** | Vision consolidée de tous les services. |
| **Maire** | Centre de pilotage stratégique de la commune. |
| **Administrateur** | Gestion des comptes, rôles, permissions, paramétrage. |

La **gestion fine des rôles et permissions** est au cœur du module : un rôle
définit les écrans visibles, les actions permises et les données accessibles
(par service, par commune, par quartier).

---

## 3. Connexion des agents

- Identifiant professionnel + mot de passe.
- **Double authentification (OTP)** — obligatoire pour les rôles sensibles.
- **Journalisation des connexions** (date, heure, IP, poste).
- **Gestion des sessions** : déconnexion automatique après inactivité,
  révocation possible.

> Les comptes agents ne se créent pas via l'inscription publique (qui ne crée
> que des citoyens). Ils sont provisionnés par un administrateur.

---

## 4. Tableau de bord agent

### 4.1 Indicateurs clés (KPI du jour)

- Dossiers **reçus aujourd'hui**
- Dossiers **en attente**
- Dossiers **en cours de traitement**
- Dossiers **validés**
- Dossiers **rejetés**
- Dossiers **urgents**
- **Temps moyen de traitement**
- Citoyens **reçus au guichet**
- **Rendez-vous du jour**
- **Alertes** importantes

### 4.2 Vue chronologique

Fil des dernières activités : nouvelle déclaration, nouveau paiement, validation,
rejet, signature, connexion d'un agent, modification d'un dossier… chaque entrée
horodatée et attribuée à son auteur.

### 4.3 File d'attente intelligente

Statuts d'un dossier : Nouveau, En attente, Affecté, En cours de vérification,
Pièces complémentaires demandées, Validé, Refusé, En impression, Disponible,
Clôturé.

Filtres : date, service, commune, quartier, type de demande, priorité, nom du
citoyen, numéro de dossier. **Recherche instantanée.**

---

## 5. Consultation d'un dossier

- **Informations générales** : numéro, date de création, statut, service
  responsable, agent affecté.
- **Informations du citoyen** : photo, coordonnées, adresse, historique des
  demandes et des paiements.
- **Informations de la demande** : toutes les données saisies par le citoyen.
- **Pièces justificatives** : CNI, passeport, certificat médical, livret de
  famille, justificatifs complémentaires — avec **zoom, rotation, téléchargement**.

### Vérification assistée par IA

Le système met en évidence : champs incomplets, informations incohérentes,
documents flous, doublons potentiels, documents expirés. L'agent **accepte ou
corrige** les suggestions — l'IA assiste, elle ne décide pas.

---

## 6. Workflow de validation

Circuit configurable, chaque étape **horodatée** :

```
Réception → Vérification → Contrôle → Validation → Signature → Impression → Archivage
```

Le circuit est **paramétrable par service** (une demande d'urbanisme n'a pas le
même parcours qu'un acte de naissance).

---

## 7. Génération automatique des actes

Une fois validé : acte généré, **numéro officiel**, **QR Code sécurisé**,
**signature électronique** de l'officier, **cachet numérique** de la mairie.
Prévisualisation avant impression.

Le QR Code renvoie à une page publique d'authentification de l'acte, sans
exposer de données personnelles au-delà du nécessaire.

---

## 8. Gestion des rendez-vous

Les agents visualisent les rendez-vous du jour, les citoyens attendus, les
créneaux disponibles, les retards et les absences. Ils peuvent **reprogrammer ou
annuler**. Lié au guichet intelligent (§13).

---

## 9. Notifications internes

Alertes agent pour : nouveau dossier, dossier urgent, pièce complémentaire reçue,
validation en attente, signature requise, paiement effectué. Temps réel.

---

## 10. Tableaux de bord hiérarchiques

### 10.1 Chef de service

Dossiers par agent, performance individuelle, temps moyen de traitement, retards,
charge de travail, répartition des dossiers, taux de validation, taux de rejet,
productivité hebdomadaire et mensuelle.

### 10.2 Secrétaire général

Vision consolidée de tous les services : état civil, urbanisme, fiscalité,
domaine, ressources humaines, courrier, police municipale. Statistiques avec
graphiques et comparaisons.

### 10.3 Maire — centre de pilotage stratégique

Population, naissances / mariages / décès, recettes fiscales, dépenses, budget
consommé, projets communaux, dossiers sensibles, activité des services,
satisfaction citoyenne, **cartographie des demandes par quartier**, rapports
quotidiens / mensuels / annuels.

### 10.4 Centre de décision

Cartes interactives, KPI temps réel, évolution des recettes et démographique,
**prévisions** basées sur l'historique, alertes automatiques d'anomalie,
classement des services par performance.

---

## 11. Audit et traçabilité

**Aucune action sans trace.** Sont enregistrées : connexion, consultation,
modification, validation, suppression, impression, signature.

Chaque événement porte : date/heure, agent, adresse IP, poste, **ancienne
valeur / nouvelle valeur**.

Le journal d'audit est **inviolable** (append-only ; aucune suppression ni
modification a posteriori).

---

## 12. Sécurité & performance

- Rôles et permissions fins.
- Chiffrement des données sensibles ; sauvegardes automatiques.
- Déconnexion automatique après inactivité ; protection contre les accès non
  autorisés.
- Recherche instantanée, statistiques temps réel, **exports PDF / Excel**.
- Interface moderne, responsive, multi-navigateurs.

---

## 13. Module Guichet Intelligent

À l'arrivée en mairie, le citoyen **scanne le QR Code** de son dossier ou saisit
son **numéro de demande**. L'agent retrouve instantanément le dossier, voit les
pièces déjà déposées et les étapes restantes, et **finalise en quelques clics**.

Un **système de tickets d'attente** avec affichage sur écran appelle
automatiquement le prochain usager au guichet disponible. Objectif : fluidifier
l'accueil et réduire les temps d'attente.

---

## 14. Feuille de route (phases)

Le module est vaste ; on le construit par incréments livrables. État au
2026-07-15 :

| Phase | Contenu | État |
|---|---|---|
| **0** | Espace agent : file par statut, détail, actions du cycle de vie, journal | ✅ livré |
| **1** | **Tableau de bord agent** : KPI (reçus, en attente, en cours, validés, rejetés, temps moyen) + chronologie d'activité | ✅ livré (cette mise à jour) |
| **2** | Filtres avancés + recherche instantanée ; visionneuse de pièces (zoom/rotation) | ⬜ |
| **3** | Génération PDF de l'acte : numéro, QR Code, signature, cachet | ⬜ |
| **4** | Rôles hiérarchiques : dashboard chef de service (perf par agent, délais) | ⬜ |
| **5** | Vérification assistée par IA (champs incohérents, flou, doublons, expiration) | ⬜ |
| **6** | Rendez-vous + Guichet intelligent (scan QR, file d'attente, écran d'appel) | ⬜ |
| **7** | Dashboards secrétaire général & maire ; centre de décision, cartographie | ⬜ |
| **8** | Audit inviolable complet (IP, poste, avant/après), exports PDF/Excel | ⬜ |
| **9** | Multi-services (urbanisme, fiscalité, domaine, RH, courrier, police) | ⬜ |

> Chaque phase est pensée pour être utile seule : la mairie peut s'en servir dès
> la phase livrée, sans attendre l'ensemble.

---

## 15. Rattachement à l'existant

- **Traçabilité** : la table `TransitionStatut` (journal d'audit des changements
  de statut) est le socle du fil d'activité et de l'audit — à étendre aux
  consultations et connexions en phase 8.
- **Statuts** : la machine à états (`declaration.statuts.ts`) porte déjà le cycle
  de vie ; les statuts ERP supplémentaires (Affecté, En impression, Clôturé) s'y
  ajouteront.
- **KPI** : calculés à la volée depuis les déclarations et leurs horodatages
  (`creeLe`, `soumisLe`, `valideLe`, `genereLe`).
- **Rôles** : l'enum `Role` (CITOYEN, AGENT, OFFICIER) s'étendra (CHEF_SERVICE,
  SECRETAIRE_GENERAL, MAIRE, ADMIN) en phase 4.
