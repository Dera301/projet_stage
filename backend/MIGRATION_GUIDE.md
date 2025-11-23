# Guide de Migration - Backend Express

## Étapes pour migrer de PHP vers Express

### 1. Configuration de la base de données

1. Créer une base de données PostgreSQL:
```sql
CREATE DATABASE coloc_antananarivo;
```

2. Configurer le fichier `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/coloc_antananarivo?schema=public"
```

3. Exécuter les migrations Prisma:
```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
```

### 2. Migration des données (si nécessaire)

Si vous avez des données existantes dans MySQL, vous pouvez les exporter et les importer dans PostgreSQL. Utilisez un outil de migration comme `pgloader` ou scriptez la migration.

### 3. Configuration Clerk (optionnel)

1. Créer un compte sur [Clerk](https://clerk.com)
2. Créer une nouvelle application
3. Copier les clés API dans le fichier `.env`:
```env
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

### 4. Démarrage du backend

```bash
cd backend
npm install
npm run dev
```

Le serveur sera accessible sur `http://localhost:5000`

### 5. Mise à jour du frontend

Le frontend doit être configuré pour pointer vers le nouveau backend:

1. Créer un fichier `.env` dans le dossier `frontend`:
```env
REACT_APP_API_URL=http://localhost:5000
```

2. Redémarrer le serveur de développement React:
```bash
cd frontend
npm start
```

### 6. Changements dans les routes API

Les routes PHP utilisaient des extensions `.php`, les routes Express n'en ont pas:

**Ancien (PHP):**
- `/api/auth/login.php`
- `/api/properties/get_all.php`

**Nouveau (Express):**
- `/api/auth/login`
- `/api/properties/get_all`

### 7. Authentification

L'authentification utilise maintenant JWT avec un fallback Clerk. Les tokens sont envoyés dans le header:
```
Authorization: Bearer <token>
```

### 8. Upload de fichiers

Les fichiers uploadés sont stockés dans `backend/uploads/` et servis via `/api/upload/uploads/<filename>`

### 9. Tests

Tester toutes les fonctionnalités:
- [ ] Authentification (login/register)
- [ ] Gestion des propriétés
- [ ] Gestion des annonces
- [ ] Messages
- [ ] Rendez-vous
- [ ] Admin
- [ ] Upload d'images

### 10. Déploiement

Pour la production:
1. Définir `NODE_ENV=production`
2. Utiliser une base de données PostgreSQL dédiée
3. Configurer les variables d'environnement sécurisées
4. Utiliser un processus manager comme PM2
5. Configurer un reverse proxy (nginx) si nécessaire

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

