// config.ts
import { getStorage, setStorage, removeStorage } from './utils/storage';

// URL de base : On utilise la variable d'env ou la valeur en dur, sans slash final
const API_BASE_URL = (process.env.REACT_APP_API_URL || 'https://projet-stage-backend.vercel.app').replace(/\/$/, '');

console.log('🔗 Configuration API:', API_BASE_URL);

const buildUrl = (endpoint: string): string => {
  // S'assurer que l'endpoint commence par un slash
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
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

// Fonction utilitaire pour construire une URL d'image complète
export const getImageUrl = (imageUrl: string | null | undefined): string => {
  if (!imageUrl) return '';
  
  // Si c'est déjà une URL complète (http/https), la retourner telle quelle
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  
  // Si c'est un chemin relatif, construire l'URL complète
  if (imageUrl.startsWith('/')) {
    return `${API_BASE_URL}${imageUrl}`;
  }
  
  // Sinon, ajouter le slash et construire l'URL
  return `${API_BASE_URL}/${imageUrl}`;
};