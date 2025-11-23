// config.ts
import { getStorage, setStorage, removeStorage } from './utils/storage';

// URL de base : On utilise la variable d'env ou la valeur en dur, sans slash final
const API_BASE_URL = (process.env.REACT_APP_API_URL || 'https://projet-stage-backend.vercel.app').replace(/\/+$/, '');

console.log('🔗 Configuration API:', API_BASE_URL);

const buildUrl = (endpoint: string): string => {
  // Nettoyer l'endpoint : enlever tous les slashes en début et fin
  const cleanEndpoint = endpoint.replace(/^\/+|\/+$/g, '');
  // Nettoyer l'URL de base : enlever le slash de fin s'il existe
  const cleanBaseUrl = API_BASE_URL.replace(/\/+$/, '');
  // Construire l'URL finale en évitant les doubles slashes
  let finalUrl = `${cleanBaseUrl}/${cleanEndpoint}`;
  
  // Remplacer tous les séquences de plus d'un slash par un seul
  finalUrl = finalUrl.replace(/([^:])\/\//g, '$1/');
  
  // S'assurer que le protocole est correct (http:// ou https://)
  finalUrl = finalUrl.replace(/(https?:)\/+/g, '$1//');
  
  console.log('URL construite:', finalUrl); // Pour le débogage
  return finalUrl;
};

export const apiGet = async (url: string) => {
  const fullUrl = buildUrl(url);
  
  const token = getStorage('auth_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json' // Force la demande de JSON
  };
    
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers,
    });
    
    // Si le serveur renvoie une erreur HTML (404/500), on capture l'erreur ici avant le JSON.parse
    if (!response.ok) {
       const errorText = await response.text();
       console.error('❌ Server Error Response:', errorText);
       throw new Error(`Erreur serveur: ${response.status}`);
    }
    
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error('❌ Invalid JSON received:', text.substring(0, 100));
      throw new Error('Le serveur a renvoyé un format invalide (HTML au lieu de JSON)');
    }
  } catch (error) {
    console.error('💥 Fetch error:', error);
    throw error;
  }
};

export const apiUpload = async (url: string, formData: FormData) => {
  const fullUrl = buildUrl(url);
  const token = getStorage('auth_token');
  const headers: HeadersInit = {
    'Accept': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Server Error Response:', errorText);
      throw new Error(`Erreur serveur: ${response.status}`);
    }

    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error('❌ Invalid JSON received:', text.substring(0, 100));
      throw new Error('Le serveur a renvoyé un format invalide');
    }
  } catch (error) {
    console.error('💥 Upload error:', error);
    throw error;
  }
};

export const apiJson = async (url: string, method: string, data?: any) => {
  const fullUrl = buildUrl(url);
  
  const token = getStorage('auth_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(fullUrl, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    
    if (!response.ok) {
       const errorText = await response.text();
       console.error('❌ Server Error Response:', errorText);
       throw new Error(`Erreur serveur: ${response.status}`);
    }
    
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error('❌ Invalid JSON received:', text.substring(0, 100));
      throw new Error('Le serveur a renvoyé un format invalide');
    }
  } catch (error) {
    console.error('💥 Fetch error:', error);
    throw error;
  }
};

export const setAuthToken = (token: string | null) => {
  if (token) {
    setStorage('auth_token', token);
  } else {
    removeStorage('auth_token');
  }
};

export const getAuthToken = () => {
  return getStorage('auth_token');
};

// Fonction utilitaire pour obtenir l'URL de base de l'API
export const getApiBaseUrl = () => {
  return API_BASE_URL;
};

/**
 * Construit l'URL d'une image Cloudinary à partir de son ID public
 */
export const getCloudinaryUrl = (publicId: string | null | undefined, options: {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'limit' | 'pad' | 'crop' | 'thumb' | 'scale';
  quality?: string;
} = {}): string => {
  if (!publicId) return '';
  
  const cloudName = 'dz4ttrfjc'; // Remplacez par votre nom de cloud Cloudinary
  const transformations = [
    'c_fill',
    options.width ? `w_${options.width}` : 'w_500',
    options.height ? `h_${options.height}` : 'h_500',
    options.crop ? `c_${options.crop}` : 'c_fill',
    'g_face',
    'q_auto:good'
  ].filter(Boolean).join(',');
  
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${publicId}`;
};

/**
 * Fonction de compatibilité pour les anciennes URLs
 */
export const getImageUrl = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) return '';
  
  // Si c'est un ID Cloudinary (ne contient pas de /)
  if (!imageUrl.includes('/')) {
    return getCloudinaryUrl(imageUrl, { width: 500, height: 500 });
  }
  
  // Si l'URL est déjà une URL complète, la retourner telle quelle
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Si c'est un chemin relatif, le combiner avec l'URL de base de l'API
  const baseUrl = API_BASE_URL.replace(/\/+$/, ''); // Supprimer les slashes de fin
  const cleanPath = imageUrl.replace(/^\/+/, ''); // Supprimer les slashes de début
  
  return `${baseUrl}/${cleanPath}`;
};