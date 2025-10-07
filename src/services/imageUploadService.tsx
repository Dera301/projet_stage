// services/imageUploadService.ts

export const uploadImageToServer = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('image', file);
  
  try {
    const response = await fetch('http://localhost/Projet_stage/api/upload/image.php', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Erreur lors de l\'upload');
    }
    
    return data.imageUrl; // URL permanente de l'image
  } catch (error) {
    console.error('Erreur upload:', error);
    throw new Error('Impossible d\'uploader l\'image');
  }
};

export const uploadMultipleImages = async (files: File[]): Promise<string[]> => {
  const uploadPromises = files.map(file => uploadImageToServer(file));
  return Promise.all(uploadPromises);
};