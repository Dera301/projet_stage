# Mise en Place d'un Projet React - Plateforme Coloc Antananarivo

## Vue d'Ensemble

Le projet utilise actuellement **Create React App (CRA)** avec TypeScript. Ce guide explique la configuration actuelle et propose une migration optionnelle vers **Vite** pour de meilleures performances.

## Configuration Actuelle

### Stack Technologique
- **React**: 18.2.0
- **TypeScript**: 4.9.0
- **Build Tool**: Create React App (react-scripts 5.0.1)
- **Styling**: Tailwind CSS 3.2.0
- **Routing**: React Router 6.8.0
- **State Management**: Context API

## Installation et Configuration

### 1. Prérequis

```bash
# Vérifier les versions
node --version  # >= 18.0.0
npm --version   # >= 9.0.0
```

### 2. Installation des Dépendances

```bash
cd frontend
npm install
```

### 3. Configuration de l'Environnement

Créer un fichier `.env` dans le dossier `frontend/` :

```env
# URL de l'API backend
REACT_APP_API_URL=http://localhost:5000

# Pour la production
# REACT_APP_API_URL=https://projet-stage-backend.vercel.app
```

### 4. Structure du Projet React

```
frontend/
├── public/                 # Fichiers statiques
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/         # Composants réutilisables
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── PropertyCard.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── ...
│   ├── pages/             # Pages de l'application
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── PropertyListPage.tsx
│   │   └── ...
│   ├── contexts/          # Contextes React
│   │   ├── AuthContext.tsx
│   │   ├── PropertyContext.tsx
│   │   ├── MessageContext.tsx
│   │   └── AnnouncementContext.tsx
│   ├── hooks/             # Hooks personnalisés
│   │   ├── useOptimizedFetch.ts
│   │   ├── useApiCache.ts
│   │   ├── useErrorHandler.ts
│   │   └── ...
│   ├── services/          # Services API
│   │   ├── avatarUploadService.ts
│   │   └── cinVerificationService.ts
│   ├── types/             # Types TypeScript
│   │   └── index.ts
│   ├── utils/             # Utilitaires
│   │   └── errorHandler.ts
│   ├── config/            # Configuration
│   │   └── env.ts
│   ├── App.tsx            # Composant principal
│   ├── index.tsx          # Point d'entrée
│   └── index.css          # Styles globaux
├── package.json
├── tsconfig.json          # Configuration TypeScript
├── tailwind.config.js     # Configuration Tailwind
└── postcss.config.js      # Configuration PostCSS
```

### 5. Scripts Disponibles

```bash
# Développement
npm start              # Démarre le serveur de développement (port 3000)

# Build
npm run build          # Crée un build de production

# Tests
npm test              # Lance les tests

# Déploiement
npm run predeploy     # Build avant déploiement
npm run deploy        # Déploie sur GitHub Pages
```

### 6. Configuration TypeScript

Le fichier `tsconfig.json` est configuré avec :
- Support React JSX
- Types pour Node.js et React
- Paths pour les imports
- Strict mode activé

### 7. Configuration Tailwind CSS

Le fichier `tailwind.config.js` configure :
- Contenu à scanner pour les classes
- Thème personnalisé
- Plugins (si nécessaire)

## Migration vers Vite (Optionnel)

Pour améliorer les performances de build et le hot reload, vous pouvez migrer vers Vite.

### Avantages de Vite
- Build beaucoup plus rapide
- Hot Module Replacement (HMR) instantané
- Meilleure gestion des dépendances
- Support natif TypeScript
- Optimisation automatique

### Étapes de Migration

#### 1. Installer Vite et ses dépendances

```bash
cd frontend
npm install --save-dev vite @vitejs/plugin-react
npm uninstall react-scripts
```

#### 2. Créer `vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'build',
    sourcemap: true,
  },
})
```

#### 3. Modifier `package.json`

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "vercel-build": "vite build"
  }
}
```

#### 4. Modifier `index.html`

Déplacer `index.html` à la racine de `frontend/` et modifier :

```html
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Coloc Antananarivo</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/index.tsx"></script>
  </body>
</html>
```

#### 5. Modifier les imports

Dans `src/index.tsx`, changer :
```typescript
// Avant
import './index.css';

// Après (si nécessaire)
import './index.css';
```

#### 6. Variables d'environnement

Avec Vite, les variables d'environnement utilisent le préfixe `VITE_` :

```env
# .env
VITE_API_URL=http://localhost:5000
```

Et dans le code :
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

#### 7. Mettre à jour les imports de types

```typescript
// types/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

## Configuration pour le Développement

### 1. Proxy API (Optionnel)

Pour éviter les problèmes CORS en développement, vous pouvez configurer un proxy dans `package.json` (CRA) ou `vite.config.ts` (Vite).

### 2. Hot Reload

- **CRA** : Hot reload automatique activé
- **Vite** : HMR instantané et plus performant

### 3. Linting et Formatage

```bash
# Installer ESLint et Prettier (si pas déjà installé)
npm install --save-dev eslint prettier

# Configuration ESLint pour React
npm install --save-dev eslint-config-react-app
```

## Structure des Composants

### Exemple de Composant TypeScript

```typescript
// src/components/PropertyCard.tsx
import React from 'react';
import { Property } from '../types';

interface PropertyCardProps {
  property: Property;
  onClick?: () => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ 
  property, 
  onClick 
}) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-md p-4 cursor-pointer"
      onClick={onClick}
    >
      <h3 className="text-xl font-bold">{property.title}</h3>
      <p className="text-gray-600">{property.description}</p>
      <p className="text-green-600 font-semibold">
        {property.price} Ar/mois
      </p>
    </div>
  );
};
```

### Exemple de Hook Personnalisé

```typescript
// src/hooks/useOptimizedFetch.ts
import { useState, useEffect } from 'react';

export const useOptimizedFetch = <T>(url: string) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Fetch failed');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
};
```

## Bonnes Pratiques

### 1. Organisation du Code
- Un composant par fichier
- Nommer les fichiers en PascalCase pour les composants
- Utiliser des dossiers pour regrouper les composants liés

### 2. Gestion d'État
- Context API pour l'état global (Auth, Properties, etc.)
- useState pour l'état local
- Éviter le prop drilling excessif

### 3. Performance
- Utiliser `React.memo` pour les composants coûteux
- Lazy loading des routes avec `React.lazy`
- Optimiser les images avec lazy loading
- Utiliser le cache API avec `useApiCache`

### 4. TypeScript
- Typer toutes les props et états
- Éviter `any` autant que possible
- Utiliser des interfaces pour les types complexes

## Déploiement

### Vercel (Recommandé)

1. Connecter le repository GitHub
2. Configurer le build :
   - Build Command: `npm run build`
   - Output Directory: `build`
3. Ajouter les variables d'environnement :
   - `REACT_APP_API_URL`

### Netlify

1. Connecter le repository
2. Build settings :
   - Build command: `npm run build`
   - Publish directory: `build`

## Résolution des Problèmes

### Erreur de Build
```bash
# Nettoyer le cache
rm -rf node_modules package-lock.json
npm install
```

### Erreurs TypeScript
```bash
# Vérifier la configuration
npx tsc --noEmit
```

### Problèmes de CORS
- Vérifier la configuration CORS du backend
- Utiliser un proxy en développement
- Vérifier les variables d'environnement

## Commandes Utiles

```bash
# Développement
npm start

# Build de production
npm run build

# Analyser le bundle
npm install --save-dev source-map-explorer
npx source-map-explorer 'build/static/js/*.js'

# Vérifier les dépendances obsolètes
npm outdated

# Mettre à jour les dépendances
npm update
```

## Prochaines Étapes

1. ✅ Configuration actuelle avec CRA
2. ⏳ Migration vers Vite (optionnel)
3. ⏳ Optimisation du bundle
4. ⏳ Tests unitaires avec Jest
5. ⏳ Tests E2E avec Cypress ou Playwright

