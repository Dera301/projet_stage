// services/imageUploadService.ts
import { getAuthToken, apiUpload } from '../config';

// Helper function to compress images
const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Impossible de compresser l\'image'));
          return;
        }
        
        // Draw and compress the image
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with quality settings
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Échec de la compression de l\'image'));
              return;
            }
            // Create a new file with the compressed blob
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg', // Always convert to jpeg for better compression
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          0.7 // 70% quality
        );
      };
      img.onerror = () => reject(new Error('Erreur lors du chargement de l\'image'));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
    reader.readAsDataURL(file);
  });
};

export const uploadImageToServer = async (file: File): Promise<string> => {
  // Validate file size (2MB max)
  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('La taille de l\'image ne doit pas dépasser 2MB');
  }

  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Format d\'image non supporté. Utilisez JPEG, PNG ou WebP');
  }

  // Compress image if it's too large
  let processedFile = file;
  if (file.size > 500 * 1024) { // Compress if > 500KB
    try {
      processedFile = await compressImage(file);
    } catch (error) {
      console.warn('Échec de la compression, envoi de l\'image originale', error);
    }
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

    // Ensure the URL isn't too long for the database
    if (imageUrl.length > 255) {
      console.warn('L\'URL de l\'image est très longue:', imageUrl.length, 'caractères');
      // Consider implementing a fallback strategy here if needed
    }

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