// services/avatarUploadService.ts
// Utilise exactement la même méthode que les annonces et propriétés : upload via /api/upload/image
import { apiUpload } from '../config';

// Upload function pour les avatars - même méthode que les annonces/propriétés
export const uploadAvatar = async (file: File): Promise<string> => {
  // Validate file type (même validation que les annonces/propriétés)
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Format d\'image non supporté. Utilisez JPEG, PNG ou WebP');
  }

  // Valider la taille (max 5MB - même que les annonces/propriétés)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('L\'image ne doit pas dépasser 5MB');
  }

  try {
    // Utiliser exactement la même méthode que les annonces/propriétés
    const formData = new FormData();
    formData.append('image', file);
    
    const data = await apiUpload('/api/upload/image', formData);
    
    if (!data.success) {
      throw new Error(data.message || 'Erreur lors de l\'upload');
    }
    
    // Retourner l'URL (même format que les annonces/propriétés)
    const imageUrl = data.data?.url || data.data?.path || '';
    
    if (!imageUrl) {
      throw new Error('Aucune URL d\'image valide reçue du serveur');
    }

    // Pas de limite de longueur - les URLs sont stockées en TEXT dans la base de données
    // Exactement comme pour les annonces et propriétés
    return imageUrl;
  } catch (error: any) {
    console.error('Erreur upload avatar:', error);
    throw new Error(error.message || 'Impossible d\'uploader l\'avatar');
  }
};

// Upload function publique pour l'inscription (sans authentification)
export const uploadAvatarPublic = async (file: File): Promise<string> => {
  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Format d\'image non supporté. Utilisez JPEG, PNG ou WebP');
  }

  // Valider la taille (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('L\'image ne doit pas dépasser 5MB');
  }

  try {
    // Utiliser la route publique pour l'inscription
    const formData = new FormData();
    formData.append('image', file);
    
    const data = await apiUpload('/api/upload/image/public', formData);
    
    if (!data.success) {
      throw new Error(data.message || 'Erreur lors de l\'upload');
    }
    
    // Retourner l'URL
    const imageUrl = data.data?.url || data.data?.path || '';
    
    if (!imageUrl) {
      throw new Error('Aucune URL d\'image valide reçue du serveur');
    }

    // Pas de limite de longueur - stocké comme TEXT dans la DB
    return imageUrl;
  } catch (error: any) {
    console.error('Erreur upload avatar public:', error);
    throw new Error(error.message || 'Impossible d\'uploader l\'avatar');
  }
};