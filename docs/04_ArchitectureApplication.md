# Architecture de l'Application - Plateforme Coloc Antananarivo

## Vue d'Ensemble

L'application suit une architecture en couches (layered architecture) avec séparation claire des responsabilités. Elle est composée d'un frontend React/TypeScript et d'un backend Node.js/Express.

## Architecture Générale

```
┌─────────────────────────────────────────────────────────────┐
│                    COUCHE PRÉSENTATION                      │
│  React + TypeScript + Tailwind CSS + React Router          │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST API
┌─────────────────────────────────────────────────────────────┐
│                    COUCHE CONTRÔLE                          │
│  Express.js Routes + Middleware + Controllers              │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                  COUCHE MÉTIER / SERVICES                   │
│  Business Logic + Email Service + File Service             │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│              COUCHE D'ACCÈS AUX DONNÉES                     │
│  Prisma ORM + Repositories + Database Queries               │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    COUCHE DONNÉES                           │
│  PostgreSQL Database + File Storage (Cloudinary)            │
└─────────────────────────────────────────────────────────────┘
```

## Détails des Couches

### 1. Couche de Présentation (Frontend)

**Technologies :**
- React 18+
- TypeScript
- Tailwind CSS
- React Router
- Context API pour la gestion d'état

**Structure :**
```
frontend/
├── src/
│   ├── components/      # Composants réutilisables
│   ├── pages/          # Pages de l'application
│   ├── contexts/       # Contextes React (Auth, Property, Message)
│   ├── hooks/          # Hooks personnalisés
│   ├── services/       # Services API
│   ├── types/          # Types TypeScript
│   └── utils/          # Utilitaires
```

**Responsabilités :**
- Affichage de l'interface utilisateur
- Gestion des interactions utilisateur
- Appels API vers le backend
- Gestion de l'état local (Context API)
- Validation côté client des formulaires

### 2. Couche de Contrôle (Backend - Routes & Controllers)

**Technologies :**
- Express.js
- JWT pour l'authentification
- Middleware personnalisés

**Structure :**
```
backend/
├── src/
│   ├── routes/         # Définition des routes
│   ├── controllers/    # Logique de contrôle
│   ├── middleware/    # Middleware (auth, validation, errors)
│   └── utils/         # Utilitaires
```

**Responsabilités :**
- Réception des requêtes HTTP
- Validation des données d'entrée
- Authentification et autorisation
- Appel des services métier
- Formatage des réponses

**Routes principales :**
- `/api/auth` - Authentification (register, login, verify)
- `/api/properties` - Gestion des propriétés
- `/api/announcements` - Gestion des annonces
- `/api/appointments` - Gestion des rendez-vous
- `/api/messages` - Gestion de la messagerie
- `/api/users` - Gestion des utilisateurs
- `/api/admin` - Fonctions d'administration

### 3. Couche Métier / Services

**Services principaux :**

1. **EmailService**
   - Envoi d'emails de vérification
   - Notifications aux administrateurs
   - Emails de bienvenue

2. **FileService**
   - Upload d'images (avatars, propriétés, CIN)
   - Intégration avec Cloudinary
   - Validation des types de fichiers

3. **NotificationService**
   - Notifications aux administrateurs (nouveaux utilisateurs, demandes CIN)
   - Notifications aux utilisateurs (changements de statut)

4. **ValidationService**
   - Validation des données métier
   - Vérification des règles de gestion
   - Contrôles de cohérence

**Responsabilités :**
- Implémentation de la logique métier
- Application des règles de gestion
- Orchestration des opérations complexes
- Gestion des transactions

### 4. Couche d'Accès aux Données

**Technologies :**
- Prisma ORM
- PostgreSQL
- Migrations Prisma

**Structure :**
```
backend/
├── prisma/
│   ├── schema.prisma   # Schéma de données
│   └── migrations/     # Migrations de base de données
```

**Modèles principaux :**
- User
- Property
- Announcement
- Appointment
- Message
- Conversation
- VerificationCode
- PendingRegistration
- ContactMessage

**Responsabilités :**
- Abstraction de l'accès à la base de données
- Mapping objet-relationnel
- Optimisation des requêtes
- Gestion des transactions

### 5. Couche de Données

**Base de données :**
- PostgreSQL (production)
- Support pour Neon, Supabase, ou PostgreSQL local

**Stockage de fichiers :**
- Cloudinary pour les images
- Stockage local en développement

**Responsabilités :**
- Persistance des données
- Intégrité référentielle
- Performance et optimisation
- Sauvegardes

## Flux de Données

### Exemple : Création d'une Propriété

```
1. Utilisateur remplit le formulaire (Frontend)
   ↓
2. Validation côté client (Frontend)
   ↓
3. Envoi requête POST /api/properties (HTTP)
   ↓
4. Middleware d'authentification vérifie le token (Backend)
   ↓
5. Controller reçoit la requête (Backend)
   ↓
6. Validation des données (Backend)
   ↓
7. Service métier traite la logique (Backend)
   ↓
8. Upload des images via FileService (Backend)
   ↓
9. Prisma ORM crée l'enregistrement (Backend)
   ↓
10. Base de données persiste les données (PostgreSQL)
   ↓
11. Réponse JSON retournée (Backend)
   ↓
12. Mise à jour de l'interface (Frontend)
```

## Sécurité

### Authentification
- JWT (JSON Web Tokens) pour l'authentification
- Tokens avec expiration (7 jours)
- Support optionnel de Clerk pour l'authentification

### Autorisation
- Middleware de vérification des rôles
- Contrôle d'accès basé sur les rôles (Student, Owner, Admin)
- Vérification de propriété pour les modifications

### Protection des Données
- Hashage des mots de passe (bcrypt)
- Validation et sanitization des entrées
- Protection CSRF (à implémenter)
- Rate limiting (à implémenter)

## Performance

### Optimisations Frontend
- Code splitting avec React.lazy
- Memoization des composants
- Lazy loading des images
- Cache des requêtes API

### Optimisations Backend
- Index sur les colonnes fréquemment interrogées
- Pagination des résultats
- Requêtes optimisées avec Prisma
- Mise en cache (à implémenter)

## Déploiement

### Frontend
- Build statique avec React
- Déploiement sur Vercel ou Netlify
- Variables d'environnement pour la configuration

### Backend
- Déploiement sur Vercel (serverless)
- Base de données PostgreSQL hébergée (Neon, Supabase)
- Variables d'environnement pour les secrets

## Services Externes

1. **Cloudinary**
   - Stockage et optimisation d'images
   - Transformation d'images à la volée

2. **Clerk (Optionnel)**
   - Authentification et gestion des utilisateurs
   - Intégration sociale

3. **Service Email**
   - SMTP ou SendGrid pour l'envoi d'emails
   - Templates d'emails

## Évolutivité

### Scalabilité Horizontale
- Architecture stateless (sans session serveur)
- Base de données scalable
- CDN pour les assets statiques

### Améliorations Futures
- Cache Redis pour les sessions et données fréquentes
- Queue système pour les tâches asynchrones
- Microservices pour les fonctionnalités spécifiques
- API GraphQL en complément de REST

