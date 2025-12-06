// Configuration des variables d'environnement
const config = {
  // URL de base de l'API
  API_BASE_URL: process.env.REACT_APP_API_URL || 'https://api.votresite.com',
  
  // Clés pour le stockage local
  STORAGE_KEYS: {
    AUTH_TOKEN: 'auth_token',
    USER_DATA: 'user_data',
    THEME_PREFERENCE: 'theme_preference',
  },
  
  // Paramètres de cache
  CACHE: {
    DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes en millisecondes
    MAX_ITEMS: 100,
  },
  
  // Paramètres de pagination
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
  },
  
  // Paramètres de débogage
  DEBUG: process.env.NODE_ENV === 'development',
  
  // Fonction utilitaire pour construire les URLs d'API
  apiUrl: (path: string): string => {
    // Supprimer les slashes en double
    const cleanPath = path.replace(/^\/+/, '');
    return `${config.API_BASE_URL}/${cleanPath}`;
  },
  
  // Fonction utilitaire pour les URLs d'images
  getImageUrl: (path?: string | null, size: 'thumb' | 'small' | 'medium' | 'large' = 'medium'): string => {
    if (!path) return '/placeholder-property.jpg';
    
    // Si c'est déjà une URL complète, la retourner telle quelle
    if (path.startsWith('http')) return path;
    
    // Gestion des tailles d'images
    const sizes = {
      thumb: 'w=200&h=150&fit=crop',
      small: 'w=400&h=300&fit=crop',
      medium: 'w=800&h=600&fit=cover',
      large: 'w=1200&h=800&fit=cover',
    };
    
    return `${config.API_BASE_URL}/api/images/${path}?${sizes[size]}`;
  },
};

export default config;
