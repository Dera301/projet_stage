// config.ts - Version FINALE corrigée
const getStorage = (key: string) => {
  return localStorage.getItem(key);
};

const setStorage = (key: string, value: string) => {
  localStorage.setItem(key, value);
};

const removeStorage = (key: string) => {
  localStorage.removeItem(key);
};

// 🔥 URL de base SANS barre oblique finale
const API_BASE_URL = 'https://projet-stage-backend.vercel.app';

console.log('🔗 Configuration API:', API_BASE_URL);

const buildUrl = (url: string): string => {
  // Nettoyer l'URL
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${API_BASE_URL}${cleanUrl}`;
};

export const apiGet = async (url: string) => {
  const fullUrl = buildUrl(url);
  
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
    });
    
    console.log('📡 Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const text = await response.text();
    console.log('📄 Response text:', text.substring(0, 200));
    
    // Essayer de parser comme JSON
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error('❌ JSON parse error:', e);
      throw new Error('Invalid JSON response from server');
    }
  } catch (error) {
    console.error('💥 Fetch error:', error);
    throw error;
  }
};

export const apiJson = async (url: string, method: string, data?: any) => {
  const fullUrl = buildUrl(url);
  
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
    });
    
    console.log('📡 Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const text = await response.text();
    console.log('📄 Response text:', text.substring(0, 200));
    
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error('❌ JSON parse error:', e);
      throw new Error('Invalid JSON response from server');
    }
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