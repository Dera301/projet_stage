// services/imageUploadService.ts
import { getAuthToken, apiUpload } from '../config';

export const uploadImageToServer = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);
  
  try {
    const data = await apiUpload('/api/upload/image', formData);
    
    if (!data.success) {
      throw new Error(data.message || 'Erreur lors de l\'upload');
    }
    
    // Retourner l'URL complète de l'image (peut être base64 sur Vercel)
    const imageUrl = data.data?.url || data.data?.path || data.imageUrl;
    return imageUrl;
  } catch (error: any) {
    console.error('Erreur upload:', error);
    throw new Error(error.message || 'Impossible d\'uploader l\'image');
  }
};

export const uploadMultipleImages = async (files: File[]): Promise<string[]> => {
  const uploadPromises = files.map(file => uploadImageToServer(file));
  return Promise.all(uploadPromises);
};