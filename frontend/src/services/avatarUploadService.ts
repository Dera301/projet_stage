// services/avatarUploadService.ts
import { apiUpload } from '../config';

// Helper function to compress images for avatars
const compressAvatarImage = (file: File): Promise<File> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        
        // Dimensions optimisées pour les avatars
        const maxWidth = 400;
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          resolve(file);
          return;
        }
        
        // Draw resized image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob avec qualité optimisée pour avatar
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          0.7 // Qualité réduite pour avatar
        );
      };
      img.onerror = () => resolve(file);
      img.src = event.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
};

// Upload function spécifique pour les avatars
export const uploadAvatar = async (file: File): Promise<string> => {
  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Format d\'image non supporté. Utilisez JPEG, PNG ou WebP');
  }

  // Compress image spécifiquement pour avatar
  let processedFile = file;
  try {
    processedFile = await compressAvatarImage(file);
  } catch (error) {
    console.warn('Échec de la compression, envoi de l\'image originale', error);
  }

  const formData = new FormData();
  formData.append('image', processedFile);
  
  try {
    const data = await apiUpload('api/upload/image', formData);
    
    if (!data.success) {
      throw new Error(data.message || 'Erreur lors de l\'upload');
    }
    
    // Return the first available URL
    const imageUrl = data.data?.url || data.data?.path || data.imageUrl;
    
    if (!imageUrl) {
      throw new Error('Aucune URL d\'image valide reçue du serveur');
    }

    return imageUrl;
  } catch (error: any) {
    console.error('Erreur upload avatar:', error);
    throw new Error(error.message || 'Impossible d\'uploader l\'avatar');
  }
};