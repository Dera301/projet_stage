// services/imageUploadService.ts
import { apiUpload } from '../config';

export const uploadImageToServer = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const data = await apiUpload('/api/upload/image', formData);

    if (!data?.success) {
      throw new Error(data?.message || 'Erreur lors de l\'upload');
    }

    const payload = data.data || {};
    const imageUrl = payload.url || payload.path || data.imageUrl;

    if (!imageUrl) {
      throw new Error('Réponse serveur invalide : URL manquante');
    }

    return imageUrl;
  } catch (error) {
    console.error('Erreur upload:', error);
    throw new Error('Impossible d\'uploader l\'image');
  }
};

export const uploadMultipleImages = async (files: File[]): Promise<string[]> => {
  const uploadPromises = files.map(file => uploadImageToServer(file));
  return Promise.all(uploadPromises);
};