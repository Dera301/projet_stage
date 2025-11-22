// services/imageUploadService.tsx
import { apiUpload } from '../config';

interface UploadResult {
  url: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

// Fonction pour uploader un avatar
export const uploadAvatar = async (file: File): Promise<UploadResult> => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Format d\'image non supporté. Utilisez JPEG, PNG ou WebP');
  }

  if (file.size > 6 * 1024 * 1024) {
    throw new Error('Fichier trop volumineux (max 6MB)');
  }

  const formData = new FormData();
  formData.append('file', file); // ← Changer 'image' par 'file'

  try {
    const response = await apiUpload('/api/upload/avatar', formData); // ← Utiliser la route spécifique
    
    if (!response || !response.url) {
      throw new Error('Réponse invalide du serveur');
    }
    
    return {
      url: response.url,
      publicId: response.publicId,
      format: response.format,
      width: response.width,
      height: response.height,
      bytes: response.bytes
    };
    
  } catch (error: any) {
    console.error('Erreur lors de l\'upload de l\'avatar:', error);
    throw new Error(error.message || 'Impossible d\'uploader l\'avatar');
  }
};

// Fonction pour uploader une image de propriété
export const uploadPropertyImage = async (file: File): Promise<UploadResult> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiUpload('/api/upload/property', formData);
  
  return {
    url: response.url,
    publicId: response.publicId,
    format: response.format,
    width: response.width,
    height: response.height,
    bytes: response.bytes
  };
};

// Upload multiple
export const uploadMultipleImages = async (
  files: File[], 
  type: 'property' | 'announcement' = 'property'
): Promise<UploadResult[]> => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));

  const response = await apiUpload(`/api/upload/multiple?type=${type}`, formData);
  return response;
};