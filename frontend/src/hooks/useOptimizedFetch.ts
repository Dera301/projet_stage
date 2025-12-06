import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import config from '../config/env';

interface FetchOptions extends RequestInit {
  useCache?: boolean;
  cacheKey?: string;
  cacheTtl?: number;
  showErrorToast?: boolean;
}

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  status: number | null;
}

// Cache en mémoire
const cache = new Map<string, { data: any; timestamp: number }>();

const useOptimizedFetch = <T>() => {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: false,
    error: null,
    status: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  // Nettoyer les requêtes en cours lors du démontage du composant
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Fonction de récupération des données
  const fetchData = useCallback(
    async (url: string, options: FetchOptions = {}): Promise<T | null> => {
      const {
        useCache = true,
        cacheKey = url,
        cacheTtl = config.CACHE.DEFAULT_TTL,
        showErrorToast = true,
        ...fetchOptions
      } = options;

      // Vérifier le cache si activé
      if (useCache && cache.has(cacheKey)) {
        const cached = cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < cacheTtl) {
          setState(prev => ({
            ...prev,
            data: cached.data,
            loading: false,
            error: null,
            status: 200,
          }));
          return cached.data;
        }
      }

      // Annuler la requête précédente si elle existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Créer un nouveau contrôleur d'annulation
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const response = await fetch(config.apiUrl(url), {
          ...fetchOptions,
          signal: abortController.signal,
          headers: {
            'Content-Type': 'application/json',
            ...fetchOptions.headers,
          },
        });

        if (!response.ok) {
          const error = new Error(`HTTP error! status: ${response.status}`);
          (error as any).status = response.status;
          throw error;
        }

        const data = await response.json();

        // Mettre en cache si nécessaire
        if (useCache) {
          cache.set(cacheKey, { data, timestamp: Date.now() });
          // Limiter la taille du cache
          if (cache.size > config.CACHE.MAX_ITEMS) {
            const firstKey = cache.keys().next().value;
            cache.delete(firstKey);
          }
        }

        setState({
          data,
          loading: false,
          error: null,
          status: response.status,
        });

        return data;
      } catch (error: any) {
        // Ignorer les erreurs d'annulation
        if (error.name === 'AbortError') {
          return null;
        }

        const errorMessage = error.message || 'Une erreur est survenue';
        
        if (showErrorToast) {
          toast.error(errorMessage);
        }

        setState(prev => ({
          ...prev,
          loading: false,
          error: new Error(errorMessage),
          status: error.status || 500,
        }));

        return null;
      }
    },
    []
  );

  // Fonction pour effacer le cache
  const clearCache = useCallback((key?: string) => {
    if (key) {
      cache.delete(key);
    } else {
      cache.clear();
    }
  }, []);

  // Fonction pour forcer un rafraîchissement des données
  const refresh = useCallback(
    (url: string, options: Omit<FetchOptions, 'useCache'> = {}) => {
      // Supprimer du cache avant de recharger
      if (options.cacheKey) {
        cache.delete(options.cacheKey);
      }
      return fetchData(url, { ...options, useCache: false });
    },
    [fetchData]
  );

  return {
    ...state,
    fetchData,
    clearCache,
    refresh,
    isIdle: !state.loading && !state.data && !state.error,
  };
};

export default useOptimizedFetch;
