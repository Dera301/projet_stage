// config.ts
const getStorage = (key: string) => localStorage.getItem(key);

const setStorage = (key: string, value: string) => {
  localStorage.setItem(key, value);
};

const removeStorage = (key: string) => {
  localStorage.removeItem(key);
};

// URL de base : On utilise la variable d'env ou la valeur en dur, sans slash final
const API_BASE_URL = (process.env.REACT_APP_API_URL ?? 'https://projet-stage-backend.vercel.app').replace(/\/$/, '');

console.log('🔗 Configuration API:', API_BASE_URL);

export const buildUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
};

const ensureJsonResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const fallback = await response.text();
    console.error('❌ Invalid JSON received:', fallback.substring(0, 200));
    throw new Error('Le serveur a renvoyé un format invalide (JSON attendu)');
  }
  return response.json();
};

const withAuthHeaders = (headers: HeadersInit = {}) => {
  const token = getStorage('auth_token');
  if (token) {
    return { ...headers, Authorization: `Bearer ${token}` };
  }
  return headers;
};

const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const isFormData = options.body instanceof FormData;
  const headers: HeadersInit = {
    Accept: 'application/json',
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...options.headers,
  };

  const response = await fetch(buildUrl(endpoint), {
    ...options,
    headers: withAuthHeaders(headers),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Server Error Response:', errorText);
    throw new Error(`Erreur serveur: ${response.status}`);
  }

  return ensureJsonResponse(response);
};

export const apiGet = (endpoint: string) => apiRequest(endpoint);

export const apiJson = (endpoint: string, method: string, data?: unknown) =>
  apiRequest(endpoint, {
    method,
    body: data !== undefined ? JSON.stringify(data) : undefined,
  });

export const apiUpload = (endpoint: string, formData: FormData) =>
  apiRequest(endpoint, {
    method: 'POST',
    body: formData,
    headers: { 'Content-Type': undefined as unknown as string },
  });

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