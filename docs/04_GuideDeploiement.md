# Guide de Déploiement - Plateforme Coloc Antananarivo

## Vue d'Ensemble

Ce guide explique comment déployer l'application sur **Vercel** (recommandé) pour le frontend et le backend, avec PostgreSQL hébergé (Neon, Supabase) et Cloudinary pour les fichiers.

## Architecture de Déploiement

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

## Prérequis

1. Compte GitHub
2. Compte Vercel (gratuit)
3. Compte Neon ou Supabase (pour PostgreSQL)
4. Compte Cloudinary (pour les images)
5. Repository Git du projet

## Étape 1 : Préparation de la Base de Données

### Option A : Neon (Recommandé)

1. Créer un compte sur [neon.tech](https://neon.tech)
2. Créer un nouveau projet
3. Copier la connection string :
   ```
   postgresql://user:password@host.neon.tech/dbname?sslmode=require
   ```

### Option B : Supabase

1. Créer un compte sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Aller dans Settings > Database
4. Copier la connection string

### Configuration de la Base de Données

```bash
# Dans le backend, mettre à jour .env
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# Exécuter les migrations
cd backend
npm run prisma:generate
npm run prisma:migrate
```

## Étape 2 : Configuration Cloudinary

1. Créer un compte sur [cloudinary.com](https://cloudinary.com)
2. Aller dans Dashboard
3. Copier les credentials :
   - Cloud Name
   - API Key
   - API Secret

## Étape 3 : Déploiement du Backend sur Vercel

### 3.1 Préparation

1. Vérifier que `backend/vercel.json` existe :
```json
{
  "version": 2,
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/index.js"
    },
    {
      "source": "/(.*)",
      "destination": "/api/index.js"
    }
  ],
  "functions": {
    "api/index.js": {
      "maxDuration": 30
    }
  }
}
```

2. Vérifier que `backend/api/index.js` existe et exporte l'app Express :
```javascript
const app = require('../src/server');
module.exports = app;
```

### 3.2 Déploiement via Vercel CLI

```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter
vercel login

# Aller dans le dossier backend
cd backend

# Déployer
vercel

# Pour la production
vercel --prod
```

### 3.3 Déploiement via Interface Vercel

1. Aller sur [vercel.com](https://vercel.com)
2. Cliquer sur "New Project"
3. Importer le repository GitHub
4. Configurer :
   - **Root Directory**: `backend`
   - **Framework Preset**: Other
   - **Build Command**: `npm run vercel-build` ou `prisma generate && prisma migrate deploy`
   - **Output Directory**: (laisser vide)
   - **Install Command**: `npm install`

5. Ajouter les variables d'environnement :
   ```
   DATABASE_URL=postgresql://...
   JWT_SECRET=votre-secret-jwt-tres-securise
   NODE_ENV=production
   FRONTEND_URL=https://votre-frontend.vercel.app
   CLOUDINARY_CLOUD_NAME=votre-cloud-name
   CLOUDINARY_API_KEY=votre-api-key
   CLOUDINARY_API_SECRET=votre-api-secret
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=votre-email@gmail.com
   EMAIL_PASS=votre-mot-de-passe
   ```

6. Déployer

### 3.4 Vérification

Après le déploiement, tester :
```bash
curl https://votre-backend.vercel.app/health
```

Vous devriez recevoir :
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

## Étape 4 : Déploiement du Frontend sur Vercel

### 4.1 Préparation

1. Vérifier que `frontend/vercel.json` existe :
```json
{
  "version": 2,
  "framework": "create-react-app",
  "env": {
    "REACT_APP_API_URL": "https://votre-backend.vercel.app"
  },
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

2. Mettre à jour la configuration API dans le code si nécessaire :
```typescript
// src/config/env.ts
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
```

### 4.2 Déploiement via Vercel CLI

```bash
# Aller dans le dossier frontend
cd frontend

# Déployer
vercel

# Pour la production
vercel --prod
```

### 4.3 Déploiement via Interface Vercel

1. Aller sur [vercel.com](https://vercel.com)
2. Cliquer sur "New Project"
3. Importer le repository GitHub
4. Configurer :
   - **Root Directory**: `frontend`
   - **Framework Preset**: Create React App
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

5. Ajouter les variables d'environnement :
   ```
   REACT_APP_API_URL=https://votre-backend.vercel.app
   ```

6. Déployer

## Étape 5 : Configuration CORS

Dans `backend/src/server.js`, s'assurer que les origines autorisées incluent l'URL du frontend :

```javascript
const allowedOrigins = [
  'https://votre-frontend.vercel.app',
  'http://localhost:3000'
];
```

## Étape 6 : Migrations de Base de Données

### Automatique (Recommandé)

Vercel exécutera automatiquement les migrations lors du build si configuré dans `vercel-build` :

```json
{
  "scripts": {
    "vercel-build": "prisma generate && prisma migrate deploy"
  }
}
```

### Manuelle

Si nécessaire, exécuter manuellement :

```bash
cd backend
npx prisma migrate deploy
```

## Étape 7 : Vérification Post-Déploiement

### Backend

1. Tester l'endpoint health :
   ```
   GET https://votre-backend.vercel.app/health
   ```

2. Tester l'authentification :
   ```
   POST https://votre-backend.vercel.app/api/auth/register
   ```

### Frontend

1. Ouvrir l'URL du frontend
2. Vérifier que l'API est accessible
3. Tester l'inscription/connexion
4. Vérifier les fonctionnalités principales

## Configuration des Domaines Personnalisés (Optionnel)

### Backend

1. Dans Vercel, aller dans Settings > Domains
2. Ajouter votre domaine personnalisé
3. Suivre les instructions DNS

### Frontend

1. Dans Vercel, aller dans Settings > Domains
2. Ajouter votre domaine personnalisé
3. Suivre les instructions DNS

## Variables d'Environnement

### Backend (.env)

```env
# Base de données
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# JWT
JWT_SECRET=votre-secret-jwt-tres-securise-changez-cela

# Environnement
NODE_ENV=production
PORT=5000

# Frontend
FRONTEND_URL=https://votre-frontend.vercel.app

# Cloudinary
CLOUDINARY_CLOUD_NAME=votre-cloud-name
CLOUDINARY_API_KEY=votre-api-key
CLOUDINARY_API_SECRET=votre-api-secret

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre-email@gmail.com
EMAIL_PASS=votre-mot-de-passe-app
EMAIL_FROM=noreply@coloc-antananarivo.com

# Clerk (Optionnel)
CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

### Frontend (.env)

```env
REACT_APP_API_URL=https://votre-backend.vercel.app
```

## Monitoring et Logs

### Vercel Logs

1. Aller dans votre projet Vercel
2. Cliquer sur "Deployments"
3. Sélectionner un déploiement
4. Voir les logs dans "Functions" ou "Build Logs"

### Base de Données

- **Neon**: Dashboard avec métriques
- **Supabase**: Dashboard avec logs et métriques

## Rollback en Cas de Problème

### Via Interface Vercel

1. Aller dans "Deployments"
2. Trouver le déploiement précédent qui fonctionnait
3. Cliquer sur les trois points (...)
4. Sélectionner "Promote to Production"

### Via CLI

```bash
vercel rollback [deployment-url]
```

## Optimisations de Production

### Backend

1. Activer la compression :
```javascript
const compression = require('compression');
app.use(compression());
```

2. Configurer les headers de sécurité
3. Activer le rate limiting (à implémenter)

### Frontend

1. Optimiser les images (déjà fait avec Cloudinary)
2. Activer le code splitting
3. Utiliser un CDN (automatique avec Vercel)

## Sécurité

### Checklist

- [ ] Variables d'environnement sécurisées (pas dans le code)
- [ ] JWT_SECRET fort et unique
- [ ] CORS configuré correctement
- [ ] HTTPS activé (automatique avec Vercel)
- [ ] Base de données avec SSL (sslmode=require)
- [ ] Mots de passe hashés (bcrypt)
- [ ] Validation des entrées
- [ ] Protection contre les injections SQL (Prisma)

## Troubleshooting

### Erreur de Build

```bash
# Vérifier les logs dans Vercel
# Vérifier les variables d'environnement
# Vérifier les dépendances dans package.json
```

### Erreur de Connexion à la Base de Données

```bash
# Vérifier DATABASE_URL
# Vérifier que la base de données accepte les connexions externes
# Vérifier le firewall de la base de données
```

### Erreur CORS

```bash
# Vérifier FRONTEND_URL dans le backend
# Vérifier allowedOrigins dans server.js
# Vérifier les headers CORS
```

### Erreur 500

```bash
# Vérifier les logs Vercel
# Vérifier les variables d'environnement
# Vérifier la configuration Prisma
```

## Commandes Utiles

```bash
# Déployer le backend
cd backend && vercel --prod

# Déployer le frontend
cd frontend && vercel --prod

# Voir les logs
vercel logs

# Lister les déploiements
vercel ls

# Ouvrir le dashboard
vercel
```

## Prochaines Étapes

1. ✅ Déploiement initial
2. ⏳ Configuration des domaines personnalisés
3. ⏳ Mise en place du monitoring
4. ⏳ Configuration des alertes
5. ⏳ Optimisations de performance
6. ⏳ Mise en place de la sauvegarde automatique de la base de données

