# Migration Vercel - Corrections des Appels API

## Problèmes corrigés

### 1. CINVerificationPage - Gel après vérification
- **Problème** : Le formulaire restait bloqué avec "Vérification en cours" après le succès
- **Solution** : Ajout d'un délai avant la navigation et rechargement de l'utilisateur depuis le serveur

### 2. Appels API avec localhost
- **Problème** : Plusieurs fichiers utilisaient `http://localhost:5000` en dur
- **Solution** : Utilisation de la configuration centralisée dans `config.ts`

## Fichiers modifiés

### Configuration centralisée
- `frontend/src/config.ts` : Ajout de `getImageUrl()` et `getApiBaseUrl()`

### Services
- `frontend/src/services/imageUploadService.tsx` : Utilise maintenant `apiUpload` de config

### Contextes
- `frontend/src/contexts/AuthContext.tsx` : 
  - Recharge l'utilisateur après vérification CIN
  - Utilise `apiUpload` au lieu de fetch direct

### Pages
- `frontend/src/pages/CINVerificationPage.tsx` : Correction du gel
- `frontend/src/pages/HomePage.tsx` : Utilise `getImageUrl` centralisée
- `frontend/src/pages/DashboardPage.tsx` : Utilise `getImageUrl` centralisée
- `frontend/src/pages/PropertyDetailPage.tsx` : Utilise `getImageUrl` centralisée
- `frontend/src/pages/PropertyListPage.tsx` : Utilise `getImageUrl` centralisée
- `frontend/src/pages/SearchPage.tsx` : À corriger
- `frontend/src/pages/EditPropertyPage.tsx` : À corriger
- `frontend/src/pages/EditAnnouncementPage.tsx` : À corriger
- `frontend/src/pages/CreatePropertyPage.tsx` : À corriger
- `frontend/src/pages/CreateAnnouncementPage.tsx` : À corriger
- `frontend/src/pages/AnnouncementsPage.tsx` : À corriger
- `frontend/src/pages/AnnouncementDetailPage.tsx` : À corriger
- `frontend/src/pages/AdminPage.tsx` : À corriger

## Utilisation

Tous les appels API doivent maintenant utiliser :
- `apiGet(url)` pour les requêtes GET
- `apiJson(url, method, data)` pour les requêtes JSON
- `apiUpload(url, formData)` pour les uploads
- `getImageUrl(imageUrl)` pour construire les URLs d'images

L'URL de base est automatiquement gérée par `config.ts` et s'adapte à Vercel.

