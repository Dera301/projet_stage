// config.ts - Version URGENTE corrigée
const getStorage = (key: string) => {
  return localStorage.getItem(key);
};

const setStorage = (key: string, value: string) => {
  localStorage.setItem(key, value);
};

const removeStorage = (key: string) => {
  localStorage.removeItem(key);
};

// 🔥 CORRECTION: Supprimer le double slash
const API_BASE_URL = (process.env.REACT_APP_API_URL || 'https://projet-stage-backend.vercel.app')
  .replace(/\/+$/, ''); // Supprime les slashs à la fin

console.log('🔗 Configuration API:', {
  apiUrl: API_BASE_URL,
  fromEnv: process.env.REACT_APP_API_URL
});

export const apiGet = async (url: string) => {
  // Nettoyer l'URL pour éviter les doubles slashs
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  const fullUrl = `${API_BASE_URL}${cleanUrl}`;
  
  console.log('🌐 Fetching GET:', fullUrl);
  
  const token = getStorage('auth_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
    
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers,
      credentials: 'include'
    });
    
    console.log('📡 Response status:', response.status);
    return response;
  } catch (error) {
    console.error('💥 Fetch error:', error);
    throw error;
  }
};

export const apiJson = async (url: string, method: string, data?: any) => {
  // Nettoyer l'URL pour éviter les doubles slashs
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  const fullUrl = `${API_BASE_URL}${cleanUrl}`;
  
  console.log('🌐 Fetching JSON:', { url: fullUrl, method, data });
  
  const token = getStorage('auth_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(fullUrl, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include'
    });
    
    console.log('📡 Response status:', response.status);
    return response;
  } catch (error) {
    console.error('💥 Fetch error:', error);
    throw error;
  }
};

export const setAuthToken = (token: string | null) => {
  if (token) {
    setStorage('auth_token', token);
    console.log('🔐 Token stored');
  } else {
    removeStorage('auth_token');
    console.log('🔐 Token removed');
  }
};

export const getAuthToken = () => {
  return getStorage('auth_token');
};