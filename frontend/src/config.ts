// config.ts - VERSION CORRIGÉE AVEC STORAGE SÉPARÉ
import { getStorage, setStorage, removeStorage } from './utils/storage';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const apiGet = async (url: string) => {
  const token = getStorage('auth_token'); // Utiliser getStorage au lieu de localStorage
  
  console.log('🔐 Token pour apiGet:', token);
  console.log('🌐 Port actuel:', window.location.port);
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
    
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('✅ Authorization header ajouté:', headers['Authorization']);
  } else {
    console.log('❌ Aucun token trouvé pour le port', window.location.port);
  }
  
  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: 'GET',
    headers,
    credentials: 'include'
  });
  
  return response;
};

export const apiJson = async (url: string, method: string, data?: any) => {
  const token = getStorage('auth_token'); // Utiliser getStorage au lieu de localStorage
  
  console.log('🔐 Token pour apiJson:', token);
  console.log('🌐 Port actuel:', window.location.port);
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('✅ Authorization header ajouté:', headers['Authorization']);
  }
  
  const response = await fetch(`${API_BASE_URL}${url}`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: 'include'
  });
  
  return response;
};

export const setAuthToken = (token: string | null) => {
  if (token) {
    setStorage('auth_token', token); // Utiliser setStorage au lieu de localStorage
    console.log('💾 Token enregistré pour le port', window.location.port, ':', token);
  } else {
    removeStorage('auth_token'); // Utiliser removeStorage au lieu de localStorage
    console.log('🗑️ Token supprimé pour le port', window.location.port);
  }
};

export const getAuthToken = () => {
  return getStorage('auth_token'); // Utiliser getStorage au lieu de localStorage
};