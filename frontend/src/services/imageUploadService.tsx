// services/imageUploadService.tsx
import { apiUpload } from '../config';

interface UploadResult {
  url: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  isBase64: boolean;
}

// Fonction générique pour uploader une image vers Cloudinary
export const uploadImage = async (
  file: File, 
  type: 'property' | 'announcement' | 'avatar' = 'property'
): Promise<UploadResult> => {
  // Vérification du type de fichier
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Format d\'image non supporté. Utilisez JPEG, PNG ou WebP');
  }

  // Vérification de la taille
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('Fichier trop volumineux (max 10MB)');
  }

  const formData = new FormData();
  formData.append('image', file);
  formData.append('type', type + 's'); // 'properties', 'announcements', 'avatars'

  try {
    const response = await apiUpload('/api/upload/image', formData);
    
    if (!response || !response.url) {
      throw new Error('Réponse invalide du serveur');
    }
    
    return {
      url: response.url,
      publicId: response.publicId,
      format: response.format || file.type.split('/')[1],
      width: response.width || 0,
      height: response.height || 0,
      bytes: response.bytes || file.size,
      isBase64: response.isBase64 || false
    };
    
  } catch (error: any) {
    console.error(`Erreur lors de l'upload de l'image (${type}):`, error);
    throw new Error(error.message || `Impossible d'uploader l'image de type ${type}`);
  }
};

// Upload d'image de propriété
export const uploadPropertyImage = (file: File) => uploadImage(file, 'property');

// Upload d'image d'annonce
export const uploadAnnouncementImage = (file: File) => uploadImage(file, 'announcement');

// Upload d'avatar
export const uploadAvatar = (file: File) => uploadImage(file, 'avatar');

// Upload multiple d'images
export const uploadMultipleImages = async (
  files: File[], 
  type: 'property' | 'announcement' | 'avatar' = 'property'
): Promise<UploadResult[]> => {
  try {
    const uploadPromises = files.map(file => uploadImage(file, type));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Erreur lors de l\'upload multiple:', error);
    throw error;
  }
};