// services/imageUploadService.ts
import { getAuthToken, apiUpload } from '../config';

// Helper function to compress images
const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          resolve(file); // Retourne le fichier original si le contexte n'est pas disponible
          return;
        }
        
        // Dessiner l'image sans redimensionnement
        ctx.drawImage(img, 0, 0);
        
        // Convertir en blob avec les paramètres de qualité
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file); // Retourne le fichier original en cas d'échec
              return;
            }
            // Créer un nouveau fichier avec le blob
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          0.8 // Qualité de compression (0.8 = 80%)
        );
      };
      img.onerror = () => {
        resolve(file); // Retourne le fichier original en cas d'erreur
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      resolve(file); // Retourne le fichier original en cas d'erreur
    };
    reader.readAsDataURL(file);
  });
};

export const uploadImageToServer = async (file: File): Promise<string> => {
  // Vérifier uniquement le type de fichier
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Format d\'image non supporté. Utilisez JPEG, PNG ou WebP');
  }

  // Compresser l'image pour optimiser la taille
  let processedFile = file;
  try {
    processedFile = await compressImage(file);
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

    // Pas de limite de longueur - les URLs sont stockées en TEXT dans la base de données
    return imageUrl;
  } catch (error: any) {
    console.error('Erreur upload:', error);
    throw new Error(error.message || 'Impossible d\'uploader l\'image');
  }
};

export const uploadMultipleImages = async (files: File[]): Promise<string[]> => {
  try {
    const uploadPromises = files.map(file => uploadImageToServer(file));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error in uploadMultipleImages:', error);
    throw error;
  }
};