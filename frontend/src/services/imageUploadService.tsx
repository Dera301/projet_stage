// services/imageUploadService.ts
import { getAuthToken } from '../config';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const uploadImageToServer = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);
  
  try {
    const token = getAuthToken();
    const headers: HeadersInit = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}api/upload/image`, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Erreur lors de l\'upload');
    }
    
    // Retourner l'URL complète de l'image
    return data.data?.url || data.data?.path || data.imageUrl;
  } catch (error) {
    console.error('Erreur upload:', error);
    throw new Error('Impossible d\'uploader l\'image');
  }
};

export const uploadMultipleImages = async (files: File[]): Promise<string[]> => {
  const uploadPromises = files.map(file => uploadImageToServer(file));
  return Promise.all(uploadPromises);
};