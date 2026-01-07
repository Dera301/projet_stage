# Index des Livrables - Plateforme Coloc Antananarivo

Ce document répertorie tous les livrables créés pour le projet selon les spécifications demandées.

---

## 1. Diagrammes de Classe de Conception (15 fichiers .mmd)

Tous les diagrammes sont situés dans le dossier `/diagramme/` et sont au format Mermaid (.mmd).

### Liste des Diagrammes

1. **DC01_Inscription_ClasseConception.mmd**
   - Cas d'utilisation : Inscription
   - Classes : User, PendingRegistration, VerificationCode, Invite
   - Relations : Multiplicité, attributs, opérations

2. **DC02_Authentification_ClasseConception.mmd**
   - Cas d'utilisation : Authentification
   - Classes : User, Token, Etudiant, Proprietaire, Admin
   - Relations : Héritage, génération de tokens

3. **DC03_ModifierInformationPersonnel_ClasseConception.mmd**
   - Cas d'utilisation : Modifier information personnel
   - Classes : User, Etudiant, Proprietaire
   - Relations : Héritage, opérations de mise à jour

4. **DC04_CreerModifierSupprimerAnnonce_ClasseConception.mmd**
   - Cas d'utilisation : Créer, modifier, supprimer annonce
   - Classes : Announcement, User, Etudiant, Proprietaire, Admin
   - Relations : CRUD complet sur les annonces

5. **DC05_CreerModifierSupprimerPropriete_ClasseConception.mmd**
   - Cas d'utilisation : Créer, modifier, supprimer propriété
   - Classes : Property, User, Proprietaire, Admin, PropertyType
   - Relations : Gestion complète des propriétés

6. **DC06_ContacterUtilisateur_ClasseConception.mmd**
   - Cas d'utilisation : Contacter utilisateur
   - Classes : Message, Conversation, User, Etudiant, Proprietaire
   - Relations : Messagerie entre utilisateurs

7. **DC07_PlanifierVisite_ClasseConception.mmd**
   - Cas d'utilisation : Planifier visite
   - Classes : Appointment, Property, User, Etudiant, Proprietaire
   - Relations : Création de rendez-vous

8. **DC08_GererVisite_ClasseConception.mmd**
   - Cas d'utilisation : Gérer visite (valider/reporter)
   - Classes : Appointment, Proprietaire, Property, Etudiant, AppointmentStatus
   - Relations : Gestion des statuts de rendez-vous

9. **DC09_VerifierCompte_ClasseConception.mmd**
   - Cas d'utilisation : Vérifier compte
   - Classes : User, VerificationCode, PendingRegistration, UserStatus
   - Relations : Vérification par code

10. **DC10_GererVerification_ClasseConception.mmd**
    - Cas d'utilisation : Gérer vérification (valider/rejeter CIN)
    - Classes : User, Admin, CINVerification, CINVerificationStatus
    - Relations : Validation CIN par administrateur

11. **DC11_GererContenu_ClasseConception.mmd**
    - Cas d'utilisation : Gérer contenu (supprimer annonce/propriété, bannir utilisateur)
    - Classes : Admin, Announcement, Property, User, UserStatus
    - Relations : Modération par administrateur

12. **DC12_SupprimerModifierMessage_ClasseConception.mmd**
    - Cas d'utilisation : Supprimer/modifier message
    - Classes : Message, Conversation, User, Etudiant, Proprietaire
    - Relations : Gestion des messages

13. **DC13_RechercheAnnonce_ClasseConception.mmd**
    - Cas d'utilisation : Recherche annonce
    - Classes : Announcement, SearchFilter, User, Etudiant, Proprietaire, Invite
    - Relations : Recherche et filtrage

14. **DC14_RecherchePropriete_ClasseConception.mmd**
    - Cas d'utilisation : Recherche propriété
    - Classes : Property, SearchFilter, PropertyType, User, Etudiant, Proprietaire, Invite
    - Relations : Recherche avec filtres multiples

15. **DC15_DiagrammeClasseGlobal_ClasseConception.mmd**
    - Vue d'ensemble globale du système
    - Toutes les classes principales et leurs relations
    - Diagramme de synthèse

16. **DC16_ArchitectureSystemeCouches.mmd**
    - Architecture du système en couches
    - Représentation visuelle des différentes couches

### Caractéristiques des Diagrammes

- ✅ Multiplicité des relations spécifiée
- ✅ Relations en français
- ✅ Attributs détaillés pour chaque classe
- ✅ Opérations/méthodes pour chaque classe
- ✅ Exclusions des controllers et services (comme demandé)
- ✅ Format Mermaid (.mmd) pour visualisation

---

## 2. Règles de Gestion du Système

**Fichier** : `/docs/02_ReglesDeGestion.md`

### Contenu

30 règles de gestion organisées en 10 catégories :

1. **Règles d'Authentification et d'Inscription** (RG-001 à RG-003)
2. **Règles de Gestion des Utilisateurs** (RG-004 à RG-006)
3. **Règles de Gestion des Propriétés** (RG-007 à RG-010)
4. **Règles de Gestion des Annonces** (RG-011 à RG-013)
5. **Règles de Gestion des Rendez-vous** (RG-014 à RG-016)
6. **Règles de Gestion de la Messagerie** (RG-017 à RG-019)
7. **Règles de Recherche** (RG-020 à RG-021)
8. **Règles d'Administration** (RG-022 à RG-024)
9. **Règles Techniques** (RG-025 à RG-027)
10. **Règles Métier Spécifiques** (RG-028 à RG-030)

Chaque règle comprend :
- Description
- Contraintes détaillées
- Exceptions éventuelles

---

## 3. Dictionnaire des Données

**Fichier** : `/docs/03_DictionnaireDonnees.md`

### Contenu

- **Format** : Tableau avec colonnes : Nom de la rubrique | Description | Type | Taille | Observation
- **Ordre** : Alphabétique strict
- **Couverture** : Tous les champs de tous les modèles :
  - User (tous les champs)
  - Property (tous les champs)
  - Announcement (tous les champs)
  - Appointment (tous les champs)
  - Message (tous les champs)
  - Conversation (tous les champs)
  - VerificationCode (tous les champs)
  - PendingRegistration (tous les champs)
  - ContactMessage (tous les champs)

### Types de Données

- **A** : Alphabétique
- **N** : Numérique
- **AN** : Alphanumérique
- **Date** : Date/Heure
- **Booléen** : Vrai/Faux

### Notes Complémentaires

- Types de données spéciaux (Enums)
- Contraintes importantes
- Relations clés entre entités

---

## 4. Architecture du Système en Couches

**Fichier** : `/diagramme/DC16_ArchitectureSystemeCouches.mmd`

### Contenu

Diagramme Mermaid représentant l'architecture en couches :

1. **Couche de Présentation** : React, Pages, Components, Contexts
2. **Couche de Contrôle** : Routes, Middleware, Controllers
3. **Couche Métier / Services** : Business Logic, Email Service, File Service, Notification Service
4. **Couche d'Accès aux Données** : Prisma ORM, Repositories, Queries
5. **Couche de Données** : PostgreSQL, File Storage
6. **Services Externes** : Clerk, Cloudinary, Email Provider

### Visualisation

- Diagramme avec couleurs par couche
- Flux de données entre les couches
- Relations et dépendances

---

## 5. Architecture de l'Application

**Fichier** : `/docs/04_ArchitectureApplication.md`

### Contenu

Documentation complète de l'architecture :

1. **Vue d'Ensemble** : Schéma général
2. **Détails des Couches** : Description de chaque couche
3. **Flux de Données** : Exemple détaillé (création de propriété)
4. **Sécurité** : Authentification, autorisation, protection
5. **Performance** : Optimisations frontend et backend
6. **Déploiement** : Frontend et backend
7. **Services Externes** : Cloudinary, Clerk, Email
8. **Évolutivité** : Scalabilité et améliorations futures

---

## 6. Priorisation des Cas d'Utilisation

**Fichier** : `/docs/05_PriorisationCasUtilisation.md`

### Contenu

Priorisation complète avec :

1. **Méthodologie** : Critères de priorisation
2. **Légende** : P0 (Critique), P1 (Haute), P2 (Moyenne), P3 (Basse)
3. **Phases de Développement** :
   - Phase 1 : Fondations (Sprint 1-2)
   - Phase 2 : Profil et Gestion Utilisateur (Sprint 3-4)
   - Phase 3 : Gestion des Propriétés (Sprint 5-7)
   - Phase 4 : Rendez-vous (Sprint 8-9)
   - Phase 5 : Communication (Sprint 10-11)
   - Phase 6 : Annonces (Sprint 12-13)
   - Phase 7 : Administration (Sprint 14-16)

4. **Pour chaque cas d'utilisation** :
   - Priorité
   - Acteurs
   - Dépendances
   - Complexité
   - Justification
   - Chronologie

5. **Résumé de la Chronologie** : Vue d'ensemble par sprint
6. **Critères de Définition de "Terminé"**
7. **Risques et Dépendances**

---

## 7. Spécification des Besoins Techniques

**Fichier** : `/docs/06_SpecificationBesoinsTechniques.md`

### Contenu

Spécification technique complète :

1. **Architecture Technique** :
   - Stack technologique (Frontend, Backend, Infrastructure)
   - Architecture de déploiement

2. **Exigences Fonctionnelles Techniques** :
   - Authentification et autorisation
   - Gestion des données
   - Gestion des fichiers
   - Communication

3. **Exigences Non-Fonctionnelles** :
   - Performance
   - Sécurité
   - Disponibilité
   - Scalabilité
   - Maintenabilité

4. **Contraintes Techniques** :
   - Navigateurs supportés
   - Résolution d'écran
   - Accessibilité

5. **Intégrations Externes** :
   - Services requis
   - Services optionnels

6. **Environnements** :
   - Développement
   - Staging
   - Production

7. **Monitoring et Logging**
8. **Tests** : Unitaires, intégration, E2E, performance
9. **Documentation Technique**
10. **Plan de Migration et Déploiement**

---

## Structure des Fichiers Créés

```
projet_stage-main/
├── diagramme/
│   ├── DC01_Inscription_ClasseConception.mmd
│   ├── DC02_Authentification_ClasseConception.mmd
│   ├── DC03_ModifierInformationPersonnel_ClasseConception.mmd
│   ├── DC04_CreerModifierSupprimerAnnonce_ClasseConception.mmd
│   ├── DC05_CreerModifierSupprimerPropriete_ClasseConception.mmd
│   ├── DC06_ContacterUtilisateur_ClasseConception.mmd
│   ├── DC07_PlanifierVisite_ClasseConception.mmd
│   ├── DC08_GererVisite_ClasseConception.mmd
│   ├── DC09_VerifierCompte_ClasseConception.mmd
│   ├── DC10_GererVerification_ClasseConception.mmd
│   ├── DC11_GererContenu_ClasseConception.mmd
│   ├── DC12_SupprimerModifierMessage_ClasseConception.mmd
│   ├── DC13_RechercheAnnonce_ClasseConception.mmd
│   ├── DC14_RecherchePropriete_ClasseConception.mmd
│   ├── DC15_DiagrammeClasseGlobal_ClasseConception.mmd
│   └── DC16_ArchitectureSystemeCouches.mmd
│
└── docs/
    ├── 00_INDEX_LIVRABLES.md (ce fichier)
    ├── 02_ReglesDeGestion.md
    ├── 03_DictionnaireDonnees.md
    ├── 04_ArchitectureApplication.md
    ├── 05_PriorisationCasUtilisation.md
    └── 06_SpecificationBesoinsTechniques.md
```

---

## Visualisation des Diagrammes Mermaid

Pour visualiser les diagrammes `.mmd`, vous pouvez :

1. **Dans VS Code** : Installer l'extension "Markdown Preview Mermaid Support"
2. **En ligne** : Utiliser [Mermaid Live Editor](https://mermaid.live/)
3. **Dans GitHub** : Les fichiers `.mmd` sont automatiquement rendus
4. **Dans la documentation** : Intégrer dans des fichiers Markdown avec des blocs de code mermaid

---

## Notes Importantes

- ✅ Tous les diagrammes respectent les spécifications demandées
- ✅ Multiplicité, relations en français, attributs et opérations inclus
- ✅ Controllers et services exclus des diagrammes de classe
- ✅ Dictionnaire des données en ordre alphabétique strict
- ✅ Architecture documentée de manière complète
- ✅ Priorisation détaillée avec chronologie
- ✅ Spécifications techniques complètes

---

## Contact et Support

Pour toute question ou clarification sur ces livrables, consultez les fichiers individuels ou la documentation du projet.

