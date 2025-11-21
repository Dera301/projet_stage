# Diagrammes UML - Plateforme Coloc Antananarivo

Ce dossier contient tous les diagrammes UML de la plateforme de colocation étudiante.

## Fichiers

1. **01_diagramme_cas_utilisation.md** - Diagramme de cas d'utilisation complet avec tous les acteurs (Students, Owner, Admin, Invité)

2. **02_diagrammes_sequence_generale.md** - Diagrammes de séquence générale pour chaque cas d'utilisation principal

3. **03_diagrammes_sequence_conception.md** - Diagrammes de séquence de conception montrant les interactions entre les couches (boundary, control, entity)

4. **04_diagrammes_classe_conception.md** - Diagrammes de classe de conception pour les utilisateurs uniquement (excluant les services)

5. **05_modele_domaine.md** - Modèle du domaine avec diagramme entité-relation complet

6. **06_diagramme_paquetage.md** - Diagramme de paquetage montrant la structure des modules frontend et backend

7. **07_diagramme_deploiement_vercel.md** - Diagramme de déploiement sur Vercel avec architecture serverless

## Visualisation

Tous les diagrammes sont au format Mermaid et peuvent être visualisés :
- Directement sur GitHub (si le fichier est en .md)
- Avec l'extension Mermaid pour VS Code
- Sur [Mermaid Live Editor](https://mermaid.live/)
- Avec des outils comme PlantUML (conversion nécessaire)

## Acteurs du Système

- **Étudiant (Student)** : Utilisateur cherchant un logement
- **Propriétaire (Owner)** : Utilisateur proposant des logements
- **Administrateur (Admin)** : Gestion et modération de la plateforme
- **Invitée (Invité)** : Visiteur non authentifié

## Cas d'Utilisation Principaux

- Authentification et gestion de profil
- Gestion des propriétés (CRUD)
- Système de rendez-vous
- Messagerie directe
- Gestion des annonces
- Administration et modération
- Vérification CIN

