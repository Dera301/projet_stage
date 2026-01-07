# Guide de Mise à Jour du Frontend

## Changements nécessaires

Tous les appels API doivent être mis à jour pour utiliser le nouveau backend Express au lieu de PHP.

### 1. Configuration

Le fichier `frontend/src/config.ts` a déjà été mis à jour pour pointer vers `http://localhost:5000`.

### 2. Routes API mises à jour

#### Routes d'authentification
- ✅ `/api/auth/login.php` → `/api/auth/login`
- ✅ `/api/auth/register.php` → `/api/auth/register`
- ✅ `/api/auth/me.php` → `/api/auth/me`
- ✅ `/api/auth/logout.php` → `/api/auth/logout`
- ✅ `/api/auth/verify_cin.php` → `/api/auth/verify_cin`

#### Routes des propriétés
- ✅ `/api/properties/get_all.php` → `/api/properties/get_all`
- ✅ `/api/properties/get_by_id.php?id=X` → `/api/properties/get_by_id/X`
- ✅ `/api/properties/get_by_user.php?userId=X` → `/api/properties/get_by_user`
- ✅ `/api/properties/create.php` → `/api/properties/create`
- ✅ `/api/properties/update.php?id=X` → `/api/properties/update/X`
- ✅ `/api/properties/delete.php?id=X` → `/api/properties/delete/X`
- ✅ `/api/properties/search.php` → `/api/properties/search`
- ✅ `/api/properties/stats.php` → `/api/properties/stats`
- ✅ `/api/properties/stats_public.php` → `/api/properties/stats_public`

#### Routes des annonces
- ⚠️ `/api/announcements/get_all.php` → `/api/announcements/get_all`
- ⚠️ `/api/announcements/get_by_id.php?id=X` → `/api/announcements/get_by_id/X`
- ⚠️ `/api/announcements/get_by_user.php?userId=X` → `/api/announcements/get_by_user`
- ⚠️ `/api/announcements/create.php` → `/api/announcements/create`
- ⚠️ `/api/announcements/update.php?id=X` → `/api/announcements/update/X`
- ⚠️ `/api/announcements/delete.php?id=X` → `/api/announcements/delete/X`

#### Routes des messages
- ⚠️ `/api/messages/send.php` → `/api/messages/send`
- ⚠️ `/api/messages/conversation.php?userId=X` → `/api/messages/conversations`
- ⚠️ `/api/messages/messages.php?conversationId=X` → `/api/messages/conversation/X`
- ⚠️ `/api/messages/markAsRead.php` → `/api/messages/markAsRead/X`

#### Routes des rendez-vous
- ⚠️ `/api/appointments/create.php` → `/api/appointments/create`
- ⚠️ `/api/appointments/get_all.php` → `/api/appointments/get_all`
- ⚠️ `/api/appointments/update_status.php` → `/api/appointments/update_status/X`
- ⚠️ `/api/appointments/delete.php` → (supprimé - utilisez update_status avec 'cancelled')

#### Routes d'upload
- ⚠️ `/api/upload/image.php` → `/api/upload/image`

#### Routes admin
- ⚠️ `/api/admin/users_list.php` → `/api/admin/users_list`
- ⚠️ `/api/admin/user_delete.php` → `/api/admin/user_delete/X`
- ⚠️ `/api/admin/announcements_list.php` → `/api/admin/announcements_list`
- ⚠️ `/api/admin/announcement_delete.php` → `/api/admin/announcement_delete/X`
- ⚠️ `/api/admin/properties_list.php` → `/api/admin/properties_list`
- ⚠️ `/api/admin/cin_to_verify.php` → `/api/admin/cin_to_verify`
- ⚠️ `/api/admin/cin_verify.php` → `/api/admin/cin_verify/X`
- ⚠️ `/api/admin/seed_admin.php` → `/api/admin/seed_admin`

### 3. Fichiers à mettre à jour

#### Contextes (partiellement mis à jour)
- ✅ `frontend/src/contexts/AuthContext.tsx` - Mis à jour
- ✅ `frontend/src/contexts/PropertyContext.tsx` - Mis à jour
- ⚠️ `frontend/src/contexts/MessageContext.tsx` - À mettre à jour
- ⚠️ `frontend/src/contexts/AnnouncementContext.tsx` - À mettre à jour

#### Pages (à mettre à jour)
- ⚠️ `frontend/src/pages/HomePage.tsx`
- ⚠️ `frontend/src/pages/DashboardPage.tsx`
- ⚠️ `frontend/src/pages/AdminPage.tsx`
- ⚠️ `frontend/src/pages/AppointmentsPage.tsx`
- ⚠️ `frontend/src/pages/AnnouncementDetailPage.tsx`
- ⚠️ `frontend/src/pages/EditPropertyPage.tsx`
- ⚠️ `frontend/src/pages/EditAnnouncementPage.tsx`
- ⚠️ `frontend/src/pages/CreatePropertyPage.tsx`
- ⚠️ `frontend/src/pages/CreateAnnouncementPage.tsx`
- ⚠️ `frontend/src/pages/AdminRegisterPage.tsx`

#### Services
- ⚠️ `frontend/src/services/imageUploadService.tsx`

#### Composants
- ⚠️ `frontend/src/components/ScheduleAppointmentModal.tsx`

### 4. Utilisation de l'API

Utilisez les fonctions `apiGet` et `apiJson` du fichier `config.ts` au lieu de `fetch` directement:

```typescript
import { apiGet, apiJson } from '../config';

// GET request
const response = await apiGet('/api/properties/get_all');
const data = await response.json();

// POST/PUT/DELETE request
const response = await apiJson('/api/properties/create', 'POST', propertyData);
const data = await response.json();
```

### 5. Format de réponse

Toutes les réponses suivent maintenant le format:
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

Vérifiez toujours `data.success` avant d'utiliser `data.data`.

### 6. Authentification

Les tokens JWT sont automatiquement inclus dans les headers via les fonctions `apiGet` et `apiJson`. Assurez-vous que le token est stocké avec `setAuthToken()` après la connexion.

### 7. Upload de fichiers

Pour l'upload d'images, utilisez FormData:

```typescript
const formData = new FormData();
formData.append('image', file);

const response = await fetch(`${API_BASE_URL}/api/upload/image`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${getAuthToken()}`
  },
  body: formData
});

const data = await response.json();
```

### 8. Variables d'environnement

Créez un fichier `.env` dans le dossier `frontend`:

```env
REACT_APP_API_URL=http://localhost:5000
```

## Commandes pour tester

1. Démarrer le backend:
```bash
cd backend
npm install
npm run dev
```

2. Démarrer le frontend:
```bash
cd frontend
npm install
npm start
```

3. Tester les fonctionnalités:
- Connexion/Inscription
- Création de propriétés
- Messages
- Rendez-vous
- Admin

## Notes importantes

- Tous les IDs sont maintenant des strings dans le frontend mais des integers dans le backend
- Les dates sont maintenant au format ISO string
- Les images sont servies via `/uploads/filename` au lieu de chemins relatifs PHP
- Les erreurs sont maintenant dans le format `{ success: false, message: "..." }`

