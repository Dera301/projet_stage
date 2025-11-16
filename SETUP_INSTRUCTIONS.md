# Instructions de Configuration - Coloc Antananarivo

## Vue d'ensemble

Ce projet a été migré d'un backend PHP/MySQL vers un backend Express/PostgreSQL avec Prisma et Clerk pour l'authentification.

## Prérequis

- Node.js (v18 ou supérieur)
- PostgreSQL (v14 ou supérieur)
- npm ou yarn
- Compte Clerk (optionnel, pour l'authentification)

## Installation

### 1. Backend

```bash
cd backend
npm install
```

### 2. Configuration de la base de données

1. Créer une base de données PostgreSQL:
```sql
CREATE DATABASE coloc_antananarivo;
```

2. Créer le fichier `.env` dans le dossier `backend`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/coloc_antananarivo?schema=public"
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CLERK_PUBLISHABLE_KEY=pk_test_your-clerk-publishable-key
CLERK_SECRET_KEY=sk_test_your-clerk-secret-key
```

3. Générer le client Prisma:
```bash
npm run prisma:generate
```

4. Exécuter les migrations:
```bash
npm run prisma:migrate
```

5. (Optionnel) Seed la base de données:
```bash
npm run prisma:seed
```

### 3. Frontend

```bash
cd frontend
npm install
```

1. Créer le fichier `.env` dans le dossier `frontend`:
```env
REACT_APP_API_URL=http://localhost:5000
```

## Démarrage

### Backend

```bash
cd backend
npm run dev
```

Le serveur sera accessible sur `http://localhost:5000`

### Frontend

```bash
cd frontend
npm start
```

Le frontend sera accessible sur `http://localhost:3000`

## Structure du projet

```
projet_stage-main/
├── backend/                 # Backend Express
│   ├── src/
│   │   ├── routes/         # Routes API
│   │   ├── utils/          # Utilitaires
│   │   └── server.js       # Point d'entrée
│   ├── prisma/
│   │   └── schema.prisma   # Schéma de base de données
│   └── uploads/            # Fichiers uploadés
├── frontend/               # Frontend React
│   └── src/
│       ├── contexts/       # Contextes React
│       ├── pages/          # Pages
│       └── components/     # Composants
└── API_BACK/              # Ancien backend PHP (référence)
```

## API Endpoints

### Authentification
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur
- `POST /api/auth/logout` - Déconnexion
- `POST /api/auth/verify_cin` - Vérification CIN

### Propriétés
- `GET /api/properties/get_all` - Liste des propriétés
- `GET /api/properties/get_by_id/:id` - Détails d'une propriété
- `GET /api/properties/get_by_user` - Propriétés de l'utilisateur
- `GET /api/properties/search` - Recherche
- `POST /api/properties/create` - Créer une propriété
- `PUT /api/properties/update/:id` - Modifier une propriété
- `DELETE /api/properties/delete/:id` - Supprimer une propriété

### Annonces
- `GET /api/announcements/get_all` - Liste des annonces
- `GET /api/announcements/get_by_id/:id` - Détails d'une annonce
- `GET /api/announcements/get_by_user` - Annonces de l'utilisateur
- `POST /api/announcements/create` - Créer une annonce
- `PUT /api/announcements/update/:id` - Modifier une annonce
- `DELETE /api/announcements/delete/:id` - Supprimer une annonce

### Messages
- `POST /api/messages/send` - Envoyer un message
- `GET /api/messages/conversations` - Liste des conversations
- `GET /api/messages/conversation/:id` - Messages d'une conversation
- `PUT /api/messages/markAsRead/:id` - Marquer comme lu

### Rendez-vous
- `POST /api/appointments/create` - Créer un rendez-vous
- `GET /api/appointments/get_all` - Liste des rendez-vous
- `PUT /api/appointments/update_status/:id` - Modifier le statut

### Contacts
- `POST /api/contacts/send` - Envoyer un message de contact

### Upload
- `POST /api/upload/image` - Upload une image

### Admin
- `GET /api/admin/users_list` - Liste des utilisateurs
- `PUT /api/admin/user_update_role/:id` - Modifier le rôle
- `DELETE /api/admin/user_delete/:id` - Supprimer un utilisateur
- `GET /api/admin/properties_list` - Liste des propriétés
- `PUT /api/admin/property_toggle_availability/:id` - Toggle disponibilité
- `GET /api/admin/announcements_list` - Liste des annonces
- `DELETE /api/admin/announcement_delete/:id` - Supprimer une annonce
- `GET /api/admin/cin_to_verify` - CINs à vérifier
- `PUT /api/admin/cin_verify/:id` - Vérifier une CIN

## Authentification

L'authentification utilise JWT avec un fallback Clerk. Les tokens sont envoyés dans le header:
```
Authorization: Bearer <token>
```

## Résolution des problèmes

### Erreur de connexion à la base de données
- Vérifier que PostgreSQL est en cours d'exécution
- Vérifier les credentials dans `.env`
- Vérifier que la base de données existe

### Erreur CORS
- Vérifier que `FRONTEND_URL` dans `.env` correspond à l'URL du frontend
- Vérifier les headers CORS dans `server.js`

### Erreur d'authentification
- Vérifier que le token JWT est valide
- Vérifier la configuration Clerk (si utilisée)
- Vérifier les clés secrètes dans `.env`

### Erreur d'upload
- Vérifier que le dossier `uploads/` existe
- Vérifier les permissions du dossier
- Vérifier la taille maximale des fichiers

## Fichiers de référence

- `backend/README.md` - Documentation du backend
- `backend/MIGRATION_GUIDE.md` - Guide de migration
- `FRONTEND_UPDATE_GUIDE.md` - Guide de mise à jour du frontend

## Notes importantes

- Les IDs sont des strings dans le frontend mais des integers dans le backend
- Les dates sont au format ISO string
- Les images sont servies via `/uploads/filename`
- Les erreurs suivent le format `{ success: false, message: "..." }`

## Prochaines étapes

1. Mettre à jour les fichiers frontend restants (voir `FRONTEND_UPDATE_GUIDE.md`)
2. Tester toutes les fonctionnalités
3. Configurer Clerk pour l'authentification (optionnel)
4. Déployer en production

