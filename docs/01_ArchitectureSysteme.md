# Architecture du Système - Plateforme Coloc Antananarivo

## Vue d'Ensemble

L'application suit une **architecture en couches (layered architecture)** avec séparation claire des responsabilités. Elle est composée d'un frontend React/TypeScript et d'un backend Node.js/Express avec une base de données PostgreSQL.

## Architecture Générale

```
┌─────────────────────────────────────────────────────────────┐
│                    COUCHE PRÉSENTATION                      │
│  React 18 + TypeScript + Tailwind CSS + React Router        │
│  Context API (Auth, Property, Message, Announcement)      │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST API
┌─────────────────────────────────────────────────────────────┐
│                    COUCHE CONTRÔLE                          │
│  Express.js Routes + Middleware + Controllers              │
│  JWT Authentication + CORS + Error Handling                │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                  COUCHE MÉTIER / SERVICES                   │
│  Business Logic + Email Service + File Service             │
│  Notification Service + Validation Service                 │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│              COUCHE D'ACCÈS AUX DONNÉES                     │
│  Prisma ORM + Repositories + Database Queries              │
│  Migrations + Schema Management                             │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    COUCHE DONNÉES                           │
│  PostgreSQL Database (Neon/Supabase/Local)                 │
│  File Storage (Cloudinary)                                  │
└─────────────────────────────────────────────────────────────┘
```

## Stack Technologique

### Frontend
- **Framework**: React 18.2+
- **Langage**: TypeScript 4.9+
- **Styling**: Tailwind CSS 3.2+
- **Routing**: React Router 6.8+
- **State Management**: React Context API
- **Build Tool**: Create React App (react-scripts 5.0.1)
- **Package Manager**: npm

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18+
- **Langage**: JavaScript (ES6+)
- **ORM**: Prisma 6.19+
- **Base de données**: PostgreSQL 14+
- **Authentification**: JWT (JSON Web Tokens)
- **Package Manager**: npm

### Infrastructure
- **Hébergement Frontend**: Vercel
- **Hébergement Backend**: Vercel (serverless functions)
- **Base de données**: PostgreSQL (Neon, Supabase, ou local)
- **Stockage fichiers**: Cloudinary
- **Service Email**: Nodemailer (SMTP)

## Détails des Couches

### 1. Couche de Présentation (Frontend)

**Technologies :**
- React 18+ avec TypeScript
- Tailwind CSS pour le styling
- React Router pour la navigation
- Context API pour la gestion d'état globale
- React Hook Form pour les formulaires
- Framer Motion pour les animations

**Structure :**
```
frontend/
├── src/
│   ├── components/      # Composants réutilisables
│   │   ├── optimized/   # Composants optimisés
│   │   └── ...          # Navbar, Footer, Modals, etc.
│   ├── pages/          # Pages de l'application
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── PropertyListPage.tsx
│   │   └── ...
│   ├── contexts/       # Contextes React
│   │   ├── AuthContext.tsx
│   │   ├── PropertyContext.tsx
│   │   ├── MessageContext.tsx
│   │   └── AnnouncementContext.tsx
│   ├── hooks/          # Hooks personnalisés
│   │   ├── useOptimizedFetch.ts
│   │   ├── useApiCache.ts
│   │   └── ...
│   ├── services/       # Services API
│   │   ├── avatarUploadService.ts
│   │   └── cinVerificationService.ts
│   ├── types/          # Types TypeScript
│   │   └── index.ts
│   └── utils/          # Utilitaires
│       └── errorHandler.ts
```

**Responsabilités :**
- Affichage de l'interface utilisateur
- Gestion des interactions utilisateur
- Appels API vers le backend (REST)
- Gestion de l'état local et global (Context API)
- Validation côté client des formulaires
- Gestion de la navigation et du routing

### 2. Couche de Contrôle (Backend - Routes & Controllers)

**Technologies :**
- Express.js pour le serveur HTTP
- JWT pour l'authentification
- Middleware personnalisés (auth, validation, errors)
- CORS pour la gestion des origines

**Structure :**
```
backend/
├── src/
│   ├── routes/         # Définition des routes
│   │   ├── auth.js
│   │   ├── properties.js
│   │   ├── announcements.js
│   │   ├── messages.js
│   │   ├── appointments.js
│   │   ├── users.js
│   │   ├── contacts.js
│   │   ├── upload.js
│   │   └── admin.js
│   ├── controllers/    # Logique de contrôle (si séparés)
│   ├── middleware/     # Middleware
│   │   └── authMiddleware.js
│   ├── utils/          # Utilitaires
│   │   ├── auth.js
│   │   ├── prisma.js
│   │   ├── cloudinary.js
│   │   ├── response.js
│   │   └── mailer.js
│   └── server.js       # Point d'entrée
├── prisma/
│   ├── schema.prisma   # Schéma de données
│   └── migrations/     # Migrations de base de données
└── api/
    └── index.js        # Handler Vercel
```

**Responsabilités :**
- Réception des requêtes HTTP
- Validation des données d'entrée
- Authentification et autorisation (JWT)
- Appel des services métier
- Formatage des réponses JSON
- Gestion des erreurs

**Routes principales :**
- `/api/auth` - Authentification (register, login, verify)
- `/api/properties` - Gestion des propriétés
- `/api/announcements` - Gestion des annonces
- `/api/appointments` - Gestion des rendez-vous
- `/api/messages` - Gestion de la messagerie
- `/api/users` - Gestion des utilisateurs
- `/api/admin` - Fonctions d'administration
- `/api/upload` - Upload de fichiers
- `/api/contacts` - Messages de contact

### 3. Couche Métier / Services

**Services principaux :**

1. **EmailService** (`src/services/emailService.js`)
   - Envoi d'emails de vérification
   - Notifications aux administrateurs
   - Emails de bienvenue
   - Utilise Nodemailer avec configuration SMTP

2. **FileService** (`src/utils/cloudinary.js`)
   - Upload d'images (avatars, propriétés, CIN)
   - Intégration avec Cloudinary
   - Validation des types de fichiers
   - Optimisation des images

3. **NotificationService** (`src/utils/adminNotifier.js`)
   - Notifications aux administrateurs (nouveaux utilisateurs, demandes CIN)
   - Notifications aux utilisateurs (changements de statut)

4. **ValidationService**
   - Validation des données métier
   - Vérification des règles de gestion
   - Contrôles de cohérence
   - Utilise express-validator

**Responsabilités :**
- Implémentation de la logique métier
- Application des règles de gestion
- Orchestration des opérations complexes
- Gestion des transactions
- Intégration avec les services externes

### 4. Couche d'Accès aux Données

**Technologies :**
- Prisma ORM 6.19+
- PostgreSQL
- Migrations Prisma

**Structure :**
```
backend/
├── prisma/
│   ├── schema.prisma   # Schéma de données
│   ├── migrations/     # Migrations de base de données
│   └── migrate.js      # Script de migration
```

**Modèles principaux :**
- `User` - Utilisateurs (students, owners, admins)
- `Property` - Propriétés à louer
- `Announcement` - Annonces de colocation
- `Appointment` - Rendez-vous pour visites
- `Message` - Messages entre utilisateurs
- `Conversation` - Conversations de messagerie
- `VerificationCode` - Codes de vérification
- `PendingRegistration` - Inscriptions en attente
- `ContactMessage` - Messages de contact

**Responsabilités :**
- Abstraction de l'accès à la base de données
- Mapping objet-relationnel (ORM)
- Optimisation des requêtes
- Gestion des transactions
- Migrations de schéma

### 5. Couche de Données

**Base de données :**
- PostgreSQL 14+ (production)
- Support pour Neon, Supabase, ou PostgreSQL local
- Schéma défini via Prisma

**Stockage de fichiers :**
- Cloudinary pour les images (production)
- Stockage local en développement (`uploads/`)

**Responsabilités :**
- Persistance des données
- Intégrité référentielle
- Performance et optimisation
- Sauvegardes
- Stockage sécurisé des fichiers

## Flux de Données

### Exemple : Création d'une Propriété

```
1. Utilisateur remplit le formulaire (Frontend - React)
   ↓
2. Validation côté client (Frontend - React Hook Form)
   ↓
3. Envoi requête POST /api/properties/create (HTTP/REST)
   ↓
4. Middleware d'authentification vérifie le token JWT (Backend)
   ↓
5. Route Express reçoit la requête (Backend - routes/properties.js)
   ↓
6. Validation des données (Backend - express-validator)
   ↓
7. Service métier traite la logique (Backend)
   ↓
8. Upload des images via FileService/Cloudinary (Backend)
   ↓
9. Prisma ORM crée l'enregistrement (Backend - Prisma Client)
   ↓
10. Base de données persiste les données (PostgreSQL)
   ↓
11. Réponse JSON retournée (Backend)
   ↓
12. Mise à jour de l'interface via Context API (Frontend)
```

## Sécurité

### Authentification
- **JWT (JSON Web Tokens)** pour l'authentification
- Tokens avec expiration (7 jours)
- Support optionnel de Clerk pour l'authentification
- Hashage des mots de passe avec bcryptjs

### Autorisation
- Middleware de vérification des rôles
- Contrôle d'accès basé sur les rôles (Student, Owner, Admin)
- Vérification de propriété pour les modifications
- Protection des routes sensibles

### Protection des Données
- Hashage des mots de passe (bcryptjs)
- Validation et sanitization des entrées
- CORS configuré pour les origines autorisées
- Protection contre les injections SQL (Prisma)
- Rate limiting (à implémenter)

## Performance

### Optimisations Frontend
- Code splitting avec React.lazy (à implémenter)
- Memoization des composants
- Lazy loading des images
- Cache des requêtes API (useApiCache hook)
- Optimisation des images avec Cloudinary

### Optimisations Backend
- Index sur les colonnes fréquemment interrogées
- Pagination des résultats
- Requêtes optimisées avec Prisma
- Connection pooling PostgreSQL
- Mise en cache (à implémenter avec Redis)

## Services Externes

1. **Cloudinary**
   - Stockage et optimisation d'images
   - Transformation d'images à la volée
   - CDN pour la distribution

2. **Clerk (Optionnel)**
   - Authentification et gestion des utilisateurs
   - Intégration sociale (à implémenter)

3. **Service Email (SMTP)**
   - Nodemailer pour l'envoi d'emails
   - Templates d'emails personnalisés

## Évolutivité

### Scalabilité Horizontale
- Architecture stateless (sans session serveur)
- Base de données scalable (PostgreSQL)
- CDN pour les assets statiques (Vercel)
- Serverless functions (Vercel)

### Améliorations Futures
- Cache Redis pour les sessions et données fréquentes
- Queue système pour les tâches asynchrones (Bull/BullMQ)
- Microservices pour les fonctionnalités spécifiques
- API GraphQL en complément de REST (à évaluer)
- Migration vers Vite pour de meilleures performances de build

## Diagramme de Déploiement

```
┌─────────────────────────────────────────────────────────┐
│                    INTERNET                              │
└─────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS
                            │
        ┌───────────────────┴───────────────────┐
        │                                         │
┌───────▼────────┐                    ┌─────────▼────────┐
│   Vercel CDN   │                    │  Vercel Serverless│
│   (Frontend)   │                    │   (Backend API)   │
│                │                    │                   │
│  React Build   │◄─── REST API ─────►│  Express.js       │
│  Static Files  │                    │  Serverless Funcs │
└────────────────┘                    └─────────┬──────────┘
                                                │
                                                │ Connection
                                                │
                                    ┌───────────▼──────────┐
                                    │   PostgreSQL         │
                                    │   (Neon/Supabase)    │
                                    │                      │
                                    │  Database            │
                                    └──────────────────────┘
                                                │
                                    ┌───────────▼──────────┐
                                    │   Cloudinary         │
                                    │   (File Storage)     │
                                    │                      │
                                    │  Images & Assets     │
                                    └──────────────────────┘
```

## Points Clés de l'Architecture

1. **Séparation des préoccupations** : Chaque couche a une responsabilité claire
2. **API REST** : Communication standardisée entre frontend et backend
3. **ORM Prisma** : Abstraction de la base de données pour une meilleure maintenabilité
4. **TypeScript** : Typage statique pour réduire les erreurs
5. **Serverless** : Déploiement sur Vercel pour une scalabilité automatique
6. **Stateless** : Pas de session serveur, utilisation de JWT
7. **Modulaire** : Structure claire facilitant l'ajout de nouvelles fonctionnalités

