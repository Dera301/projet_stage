// config.ts - CORRECTION COMPLÈTE
const API_BASE_URL = 'http://nytranoko.infinityfree.me';

export const apiGet = async (url: string) => {
  const token = localStorage.getItem('auth_token');
  
  console.log('🔐 Token pour apiGet:', token);
  console.log('📤 Headers envoyés:');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  // 🔹 CORRECTION CRITIQUE : Toujours envoyer le token s'il existe
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('✅ Authorization header ajouté:', headers['Authorization']);
  } else {
    console.log('❌ Aucun token trouvé');
  }
  
  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: 'GET',
    headers,
    credentials: 'include'
  });
  
  return response;
};

export const apiJson = async (url: string, method: string, data?: any) => {
  const token = localStorage.getItem('auth_token');
  
  console.log('🔐 Token pour apiJson:', token);
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  // 🔹 CORRECTION CRITIQUE : Toujours envoyer le token s'il existe
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
    localStorage.setItem('auth_token', token);
    console.log('💾 Token enregistré dans localStorage:', token);
  } else {
    localStorage.removeItem('auth_token');
    console.log('🗑️ Token supprimé de localStorage');
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};