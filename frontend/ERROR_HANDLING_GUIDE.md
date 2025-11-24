# Guide d'utilisation du système de gestion d'erreurs

## Vue d'ensemble

Le système de gestion d'erreurs a été amélioré pour :
- ✅ Convertir automatiquement les codes d'erreur HTTP (404, 500, etc.) en messages utilisateur clairs
- ✅ Adapter l'affichage selon l'appareil (mobile/PC)
- ✅ Améliorer le style et la visibilité des erreurs

## Utilisation

### 1. Utiliser le hook `useErrorHandler`

```tsx
import { useErrorHandler } from '../hooks/useErrorHandler';

const MyComponent = () => {
  const { showError, showSuccess, showWarning, showInfo } = useErrorHandler();

  const handleSubmit = async () => {
    try {
      await apiJson('/api/endpoint', 'POST', data);
      showSuccess('Opération réussie !');
    } catch (error) {
      showError(error, 'Une erreur est survenue lors de l\'opération');
    }
  };

  return (
    // ...
  );
};
```

### 2. Utiliser directement `formatErrorForDisplay`

```tsx
import { formatErrorForDisplay } from '../utils/errorHandler';

try {
  await apiJson('/api/endpoint', 'POST', data);
} catch (error) {
  const message = formatErrorForDisplay(error, 'Message par défaut');
  toast.error(message);
}
```

### 3. Utiliser le composant `ErrorDisplay`

```tsx
import ErrorDisplay from '../components/ErrorDisplay';

<ErrorDisplay
  error={error}
  onClose={() => setError(null)}
  variant="error" // 'error' | 'warning' | 'info' | 'success'
  autoClose={true}
  duration={5000}
/>
```

## Messages d'erreur automatiques

Le système convertit automatiquement les codes HTTP en messages clairs :

- **400** → "Les informations fournies sont incorrectes. Veuillez vérifier vos données."
- **401** → "Votre session a expiré. Veuillez vous reconnecter."
- **403** → "Vous n'avez pas les permissions nécessaires pour effectuer cette action."
- **404** → "La ressource demandée n'existe pas ou a été supprimée."
- **500** → "Une erreur technique est survenue. Notre équipe a été notifiée. Veuillez réessayer plus tard."
- **502/503** → "Le service est temporairement indisponible. Veuillez réessayer dans quelques instants."

## Adaptation mobile/PC

- **Mobile** : Les erreurs s'affichent en bas de l'écran, avec une taille de texte adaptée
- **PC** : Les erreurs s'affichent en haut à droite, avec plus d'espace

## Exemple complet

```tsx
import React, { useState } from 'react';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { apiJson } from '../config';

const CreatePropertyPage = () => {
  const { showError, showSuccess } = useErrorHandler();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    try {
      const response = await apiJson('/api/properties', 'POST', formData);
      if (response.success) {
        showSuccess('Propriété créée avec succès !');
      }
    } catch (error) {
      // Le message d'erreur sera automatiquement formaté
      showError(error, 'Impossible de créer la propriété');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // ...
  );
};
```

## Migration depuis l'ancien système

**Avant :**
```tsx
catch (error) {
  toast.error(`Erreur ${error.response?.status}: ${error.message}`);
}
```

**Après :**
```tsx
const { showError } = useErrorHandler();
catch (error) {
  showError(error); // Message automatiquement formaté
}
```

