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
  const token = getStorage("auth_token");

  const headers: HeadersInit = {
    Accept: "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const response = await fetch(fullUrl, { headers });

    let json;
    try {
      json = await response.json();
    } catch {
      console.error("❌ Réponse non JSON");
      throw new Error(`Réponse non JSON - ${response.status}`);
    }

    if (!response.ok) {
      console.error("❌ Server Error Response:", json);
      throw new Error(json?.message || `Erreur serveur: ${response.status}`);
    }

    return json;
  } catch (err) {
    console.error("💥 Fetch error:", err);
    throw err;
  }
};

export const apiJson = async (url: string, method: string, data?: any) => {
  const fullUrl = buildUrl(url);
  const token = getStorage("auth_token");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const response = await fetch(fullUrl, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    });

    let json;
    try {
      json = await response.json();
    } catch {
      console.error("❌ Réponse non JSON");
      throw new Error(`Réponse non JSON - ${response.status}`);
    }

    if (!response.ok) {
      console.error("❌ Server Error Response:", json);
      throw new Error(json?.message || `Erreur serveur: ${response.status}`);
    }

    return json;
  } catch (err) {
    console.error("💥 Fetch error:", err);
    throw err;
  }
};

export const apiUpload = async (url: string, formData: FormData) => {
  const fullUrl = buildUrl(url);
  const token = getStorage("auth_token");

  const headers: HeadersInit = {
    Accept: "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const response = await fetch(fullUrl, {
      method: "POST",
      headers,
      body: formData,
    });

    let json;
    try {
      json = await response.json();
    } catch {
      console.error("❌ Réponse non JSON");
      throw new Error(`Réponse non JSON - ${response.status}`);
    }

    if (!response.ok) {
      console.error("❌ Server Error Response:", json);
      throw new Error(json?.message || `Erreur serveur: ${response.status}`);
    }

    return json;
  } catch (err) {
    console.error("💥 Upload error:", err);
    throw err;
  }
};

// Fonction utilitaire pour les requêtes DELETE
export const apiDelete = async (url: string) => {
  const fullUrl = buildUrl(url);
  const token = getStorage("auth_token");

  const headers: HeadersInit = {
    Accept: "application/json",
    'Content-Type': 'application/json',
  };
  
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const response = await fetch(fullUrl, {
      method: "DELETE",
      headers,
    });

    // Pour DELETE, on accepte 204 (No Content)
    if (response.status === 204) {
      return { success: true };
    }

    let json;
    try {
      json = await response.json();
    } catch {
      console.error("❌ Réponse non JSON");
      throw new Error(`Réponse non JSON - ${response.status}`);
    }

    if (!response.ok) {
      console.error("❌ Server Error Response:", json);
      throw new Error(json?.message || `Erreur serveur: ${response.status}`);
    }

    return json;
  } catch (err) {
    console.error("💥 Delete error:", err);
    throw err;
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


