# Backend - Coloc Antananarivo

Backend Express.js avec Prisma, PostgreSQL et Clerk pour la plateforme de colocation à Antananarivo.

## Prérequis

- Node.js (v18 ou supérieur)
- PostgreSQL (v14 ou supérieur)
- Compte Clerk (pour l'authentification)

## Installation

1. Installer les dépendances:
```bash
npm install
```

2. Configurer les variables d'environnement:
```bash
cp .env.example .env
```

3. Modifier le fichier `.env` avec vos configurations:
   - `DATABASE_URL`: URL de connexion PostgreSQL
   - `CLERK_PUBLISHABLE_KEY`: Clé publique Clerk
   - `CLERK_SECRET_KEY`: Clé secrète Clerk
   - `JWT_SECRET`: Clé secrète JWT
   - `PORT`: Port du serveur (défaut: 5000)

4. Générer le client Prisma:
```bash
npm run prisma:generate
```

5. Exécuter les migrations:
```bash
npm run prisma:migrate
```

6. (Optionnel) Seed la base de données:
```bash
npm run prisma:seed
```

## Démarrage

### Mode développement
```bash
npm run dev
```

### Mode production
```bash
npm start
```

## Structure du projet

```
backend/
├── src/
│   ├── routes/          # Routes API
│   ├── utils/           # Utilitaires (auth, response)
│   └── server.js        # Point d'entrée du serveur
├── prisma/
│   └── schema.prisma    # Schéma de base de données
├── uploads/             # Fichiers uploadés (images)
└── package.json
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
- `GET /api/properties/search` - Recherche de propriétés
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
- `PUT /api/messages/markAsRead/:id` - Marquer un message comme lu

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

L'application utilise Clerk pour l'authentification avec un fallback JWT pour la compatibilité.

Les tokens JWT sont envoyés dans le header `Authorization: Bearer <token>`.

## Base de données

Le schéma Prisma est défini dans `prisma/schema.prisma`. Pour modifier le schéma:

1. Modifier `prisma/schema.prisma`
2. Créer une migration: `npm run prisma:migrate`
3. Générer le client: `npm run prisma:generate`

## Développement

Pour développer avec hot-reload, utilisez:
```bash
npm run dev
```

Le serveur redémarrera automatiquement lors des modifications.

## Production

Pour la production:

1. Définir `NODE_ENV=production`
2. Utiliser une base de données PostgreSQL dédiée
3. Configurer les variables d'environnement sécurisées
4. Utiliser un processus manager comme PM2

