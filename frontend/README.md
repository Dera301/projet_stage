# ColocAntananarivo - Plateforme de Colocation Étudiante

# Pour accéder à l'application visiter le lien suivant:
https://projet-stage.vercel.app/

## Description du Projet

ColocAntananarivo est une plateforme web de mise en relation pour la colocation étudiante à Antananarivo, Madagascar. Cette application facilite la recherche de logements abordables et la mise en relation entre étudiants et propriétaires.

## Problématique

À Antananarivo, les étudiants font face à des difficultés pour trouver un logement abordable et adapté à leurs besoins. La colocation émerge comme une solution économique et conviviale, mais l'absence d'une plateforme dédiée complique la mise en relation entre étudiants et propriétaires.

## Objectifs

- Analyser les besoins des étudiants en matière de logement et de colocation à Antananarivo
- Étudier les modèles existants de plateformes de colocation dans d'autres contextes
- Concevoir une application web adaptée aux spécificités locales
- Évaluer l'impact social et économique de la plateforme sur les étudiants

## Technologies Utilisées

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: React Context API
- **Icons**: Heroicons
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns
- **Build Tool**: Create React App

## Fonctionnalités

### Pour les Étudiants
- Inscription et création de profil personnalisé
- Recherche avancée de logements avec filtres
- Système de favoris
- Messagerie intégrée avec les propriétaires
- Planification de visites
- Tableau de bord personnalisé

### Pour les Propriétaires
- Publication de logements avec photos et descriptions
- Gestion des annonces
- Communication avec les étudiants
- Suivi des demandes et visites
- Tableau de bord de gestion

### Fonctionnalités Générales
- Authentification sécurisée
- Interface responsive (mobile et desktop)
- Système de messagerie en temps réel
- Recherche géolocalisée par quartiers
- Système de notation et d'avis
- Filtres avancés (prix, type, équipements)

## Structure du Projet

```
src/
├── components/          # Composants réutilisables
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   └── ProtectedRoute.tsx
├── contexts/           # Contextes React pour la gestion d'état
│   ├── AuthContext.tsx
│   ├── PropertyContext.tsx
│   └── MessageContext.tsx
├── pages/              # Pages de l'application
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── DashboardPage.tsx
│   ├── ProfilePage.tsx
│   ├── PropertyListPage.tsx
│   ├── PropertyDetailPage.tsx
│   ├── CreatePropertyPage.tsx
│   ├── SearchPage.tsx
│   ├── MessagesPage.tsx
│   ├── AboutPage.tsx
│   └── ContactPage.tsx
├── types/              # Définitions TypeScript
│   └── index.ts
├── App.tsx             # Composant principal
├── index.tsx           # Point d'entrée
└── index.css           # Styles globaux
```

## Installation et Démarrage

### Prérequis
- Node.js (version 16 ou supérieure)
- npm ou yarn

### Installation
```bash
# Cloner le projet
git clone <repository-url>
cd Projet_stage

# Installer les dépendances
npm install

# Démarrer l'application en mode développement
npm start
```

L'application sera accessible sur `http://localhost:3000`

### Scripts Disponibles
```bash
# Démarrer en mode développement
npm start

# Construire pour la production
npm run build

# Lancer les tests
npm test

# Éjecter la configuration (non recommandé)
npm run eject
```

## Backend PHP (XAMPP)

Un backend PHP minimal a été ajouté dans `api/` pour gérer l'authentification, les propriétés et les messages avec MySQL.

### 1) Installer la base de données

1. Ouvrez `phpMyAdmin` (`http://localhost/phpmyadmin`).
2. Importez le fichierdans git hub montre moi ou trouver le lien pour accéeder à mon application SQL: `api/database.sql`.

### 2) Déployer l'API sous XAMPP

- Copiez le dossier `api/` dans `htdocs` (ou créez un alias virtuel qui pointe sur ce répertoire). Par exemple:
  - `C:/xampp/htdocs/projet_stage/api` (Windows)
  - `/opt/lampp/htdocs/projet_stage/api` (Linux)

### 3) Configurer la connexion MySQL

- Le fichier `api/config.php` est généré automatiquement au premier démarrage avec des valeurs par défaut:
  - hôte: `127.0.0.1`, base: `projet_stage`, utilisateur: `root`, mot de passe vide.
- Adaptez ces valeurs si nécessaire.

### 4) Tester les endpoints

- Base URL (exemple): `http://localhost/projet_stage/api`
- `POST /api/auth/register` { email, password, firstName, lastName, phone, userType }
- `POST /api/auth/login` { email, password } → renvoie `token`
- `GET /api/auth/me` avec `Authorization: Bearer <token>`
- `POST /api/auth/logout` avec `Authorization`

- `GET /api/properties`
- `GET /api/properties/:id`
- `POST /api/properties` (Authorization requis)
- `PUT /api/properties/:id` (Authorization requis)
- `DELETE /api/properties/:id` (Authorization requis)

- `GET /api/messages/conversations` (Authorization requis)
- `GET /api/messages?conversationId=ID` (Authorization requis)
- `POST /api/messages` { receiverId, content } (Authorization requis)
- `POST /api/messages/read` { messageId } (Authorization requis)

### 5) Intégration Frontend

- Remplacez les simulations (timeouts) dans `src/contexts/*.tsx` par des appels `fetch` vers l'API ci-dessus si vous souhaitez activer la persistance réelle.

## Design et UX

### Système de Design
- **Couleurs**: Palette basée sur le bleu primaire (#3b82f6)
- **Typographie**: Inter (Google Fonts)
- **Composants**: Design system cohérent avec Tailwind CSS
- **Responsive**: Mobile-first approach

### Principes UX
- Interface intuitive et simple
- Navigation claire et logique
- Feedback utilisateur immédiat
- Accessibilité et performance
- Adaptation aux infrastructures locales

## Quartiers Couverts

- Analakely
- Ambohijatovo
- Ankadifotsy
- Ankatso
- Antaninarenina
- Behoririka
- Isoraka
- Mahamasina
- Tsaralalana
- 67ha

## Impact Social

### Bénéfices pour les Étudiants
- Réduction des coûts de logement (jusqu'à 40%)
- Amélioration de la qualité de vie
- Création de liens sociaux
- Facilité d'accès à l'information

### Bénéfices pour les Propriétaires
- Optimisation de l'occupation
- Réduction des coûts de gestion
- Accès à un marché ciblé
- Sécurisation des paiements

## Sécurité

- Authentification sécurisée
- Validation des données côté client et serveur
- Protection contre les attaques XSS et CSRF
- Chiffrement des communications
- Vérification des utilisateurs

## Développement Futur

### Fonctionnalités Prévues
- Application mobile native
- Système de paiement intégré
- Géolocalisation avancée
- Chat vidéo intégré
- Système de réservation en ligne
- Intégration avec les universités

### Améliorations Techniques
- Migration vers Next.js
- Base de données PostgreSQL
- API REST complète
- Tests automatisés
- CI/CD pipeline

## Contribution

Ce projet est développé dans le cadre d'un mémoire de fin d'études. Pour toute contribution ou suggestion, veuillez contacter l'équipe de développement.

## Licence

Ce projet est développé à des fins éducatives et de recherche. Tous droits réservés.

## Contact

- **Email**: contact@colocantananarivo.mg
- **Téléphone**: +261 34 12 345 67
- **Adresse**: Antananarivo, Madagascar

---

*Développé avec ❤️ pour la communauté étudiante d'Antananarivo*
