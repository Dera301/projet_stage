import { useState, useEffect, useCallback, useRef } from 'react';
import { apiGet } from '../config';

type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, CacheEntry<any>>();

export function useApiCache<T>(
  endpoint: string,
  params: Record<string, any> = {},
  skip = false
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(!skip);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);

  const cacheKey = useCallback(() => {
    const paramsString = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
      .join('&');
    return `${endpoint}?${paramsString}`;
  }, [endpoint, params]);

  const fetchData = useCallback(async () => {
    if (skip) return;

    const key = cacheKey();
    const cached = cache.get(key);
    const now = Date.now();

    // Retourner les données en cache si elles sont toujours valides
    if (cached && now - cached.timestamp < CACHE_EXPIRY) {
      if (isMounted.current) {
        setData(cached.data);
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiGet(key);
      
      if (response.success) {
        const newData = response.data as T;
        // Mettre à jour le cache
        cache.set(key, {
          data: newData,
          timestamp: now,
        });

        if (isMounted.current) {
          setData(newData);
        }
      } else {
        throw new Error(response.message || 'Failed to fetch data');
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [skip, cacheKey]);

  // Effet de nettoyage
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Effet pour charger les données
  useEffect(() => {
    if (!skip) {
      fetchData();
    }
  }, [fetchData, skip]);

  // Fonction pour forcer un rafraîchissement
  const refresh = useCallback(async () => {
    const key = cacheKey();
    cache.delete(key); // Supprimer l'entrée du cache
    await fetchData(); // Recharger les données
  }, [fetchData, cacheKey]);

  return { data, loading, error, refresh };
}

// Fonction utilitaire pour effacer le cache
export const clearApiCache = (endpoint?: string) => {
  if (endpoint) {
    // Supprimer un endpoint spécifique
    for (const key of cache.keys()) {
      if (key.startsWith(endpoint)) {
        cache.delete(key);
      }
    }
  } else {
    // Vider tout le cache
    cache.clear();
  }
};
