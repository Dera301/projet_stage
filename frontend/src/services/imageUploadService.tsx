// services/imageUploadService.tsx
import { apiUpload, apiJson } from '../config';

type ImageType = 'property' | 'announcement' | 'avatar';

interface UploadResult {
  url: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

// Fonction utilitaire pour compresser les images avant l'upload
const compressImage = (file: File, maxWidth: number, maxHeight: number, quality = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        
        // Calculer les nouvelles dimensions en conservant le ratio
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }
        
        // Dessiner l'image redimensionnée
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convertir en blob avec les paramètres de qualité
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            
            const compressedFile = new File(
              [blob], 
              file.name.replace(/\.[^/.]+$/, '.jpg'), // Remplacer l'extension par .jpg
              { type: 'image/jpeg', lastModified: Date.now() }
            );
            
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = () => resolve(file);
      img.src = event.target?.result as string;
    };
    
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
};

// Fonction générique pour uploader une image
const uploadImage = async (
  file: File, 
  type: ImageType = 'property', 
  options: { maxWidth?: number; maxHeight?: number; quality?: number } = {}
): Promise<UploadResult> => {
  // Vérification du type de fichier
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Format d\'image non supporté. Utilisez JPEG, PNG ou WebP');
  }

  // Paramètres par défaut selon le type
  const defaults = {
    property: { maxWidth: 1200, maxHeight: 800, quality: 0.8 },
    announcement: { maxWidth: 1000, maxHeight: 800, quality: 0.8 },
    avatar: { maxWidth: 400, maxHeight: 400, quality: 0.9 }
  };
  
  const { maxWidth, maxHeight, quality } = { ...defaults[type], ...options };
  
  // Compression de l'image
  let processedFile = file;
  try {
    processedFile = await compressImage(file, maxWidth, maxHeight, quality);
  } catch (error) {
    console.warn('Échec de la compression, envoi de l\'image originale', error);
  }
  
  // Préparation du formulaire
  const formData = new FormData();
  formData.append('file', processedFile);
  
  try {
    // Appel à l'API appropriée selon le type
    const endpoint = `api/upload/${type}`;
    const response = await apiUpload(endpoint, formData);
    
    if (!response || !response.url) {
      throw new Error('Réserve invalide du serveur');
    }
    
    return {
      url: response.url,
      publicId: response.publicId,
      format: response.format || file.type.split('/')[1],
      width: response.width || 0,
      height: response.height || 0,
      bytes: response.bytes || file.size
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
  type: ImageType = 'property'
): Promise<UploadResult[]> => {
  try {
    const uploadPromises = files.map(file => uploadImage(file, type));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Erreur lors de l\'upload multiple:', error);
    throw error;
  }
};

// Suppression d'image
export const deleteImage = async (publicId: string): Promise<void> => {
  if (!publicId) return;
  
  try {
    await apiJson(`api/upload/${publicId}`, 'DELETE');
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'image:', error);
    throw new Error('Impossible de supprimer l\'image');
  }
};