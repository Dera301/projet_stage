import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { Property, CreatePropertyData, SearchFilters } from '../types';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface PropertyContextType {
  properties: Property[];
  userProperties: Property[]; // Ajouter cette ligne
  loading: boolean;
  createProperty: (propertyData: CreatePropertyData) => Promise<void>;
  searchProperties: (filters?: SearchFilters) => Promise<Property[]>;
  fetchProperties: () => Promise<void>;
  fetchPropertyById: (id: string) => Promise<Property | null>;
  deleteProperty: (propertyId: string) => Promise<void>;
  updateProperty: (propertyId: string, updates: Partial<Property>) => Promise<Property>;
  fetchUserProperties: () => Promise<void>; // Ajouter cette ligne
  
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const useProperty = () => {
  const context = useContext(PropertyContext);
  if (context === undefined) {
    throw new Error('useProperty must be used within a PropertyProvider');
  }
  return context;
};

interface PropertyProviderProps {
  children: ReactNode;
}

export const PropertyProvider: React.FC<PropertyProviderProps> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [userProperties, setUserProperties] = useState<Property[]>([]); // AJOUT: État pour les propriétés de l'utilisateur
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const API_BASE_URL = 'https://nytranoko.infinityfree.me/api/properties';
  // Fonction utilitaire pour gérer les réponses
  const handleResponse = async (response: Response) => {
    const contentType = response.headers.get('content-type');
    
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Réponse non-JSON:', text.substring(0, 500));
      
      // Si c'est une page HTML, c'est probablement une erreur 404 ou un mauvais chemin
      if (text.includes('<!DOCTYPE html>')) {
        throw new Error('Endpoint API non trouvé. Vérifiez le chemin des fichiers PHP.');
      }
      
      throw new Error('Le serveur a renvoyé une réponse non-JSON');
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Erreur ${response.status}`);
    }

    const result = await response.json();
    
    // Vérifier la structure de la réponse
    if (result && result.success !== undefined) {
      // Structure standardisée: {success: true, message: '...', data: [...]}
      if (result.success) {
        return result.data; // Retourne directement le tableau de données
      } else {
        throw new Error(result.message || 'Erreur inconnue');
      }
    }
    
    // Si pas de structure standardisée, retourner le résultat tel quel
    return result;
  };

  // Récupérer toutes les propriétés
  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/get_all.php`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await handleResponse(response);
      
      // S'assurer que data est un tableau
      if (Array.isArray(data)) {
        setProperties(data);
      } else {
        console.error('Les données reçues ne sont pas un tableau:', data);
        setProperties([]);
      }
    } catch (error) {
      console.error('Erreur fetchProperties:', error);
      toast.error('Erreur lors du chargement des propriétés');
      // En cas d'erreur, on initialise avec un tableau vide
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  // Récupérer une propriété par ID
  const fetchPropertyById = async (id: string): Promise<Property | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/get_by_id.php?id=${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await handleResponse(response);
      
      // Pour get_by_id, on s'attend à un objet propriété unique
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        return data;
      }
      
      console.error('Données invalides pour fetchPropertyById:', data);
      return null;
    } catch (error) {
      console.error('Erreur fetchPropertyById:', error);
      toast.error('Erreur lors du chargement de la propriété');
      return null;
    }
  };

  // Créer une nouvelle propriété
   const createProperty = async (propertyData: CreatePropertyData) => {
    setLoading(true);
    try {
      if (!user) {
        throw new Error('Vous devez être connecté pour créer une propriété');
      }

      console.log('Données envoyées à l\'API:', {
        ...propertyData,
        ownerId: user.id
      });

      const propertyWithOwner = {
        ...propertyData,
        ownerId: user.id
      };

      const response = await fetch(`${API_BASE_URL}/create.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertyWithOwner),
      });

      const newProperty = await handleResponse(response);
      
      // Mettre à jour les deux listes
      setProperties(prev => [newProperty, ...prev]);
      setUserProperties(prev => [newProperty, ...prev]); // AJOUT: Mettre à jour userProperties aussi
      
      toast.success('Propriété créée avec succès !');
    } catch (error) {
      console.error('Erreur createProperty:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la création de la propriété');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProperties = useCallback(async () => {
    if (!user) {
      setUserProperties([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/get_by_user.php?userId=${user.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await handleResponse(response);
      
      if (Array.isArray(data)) {
        setUserProperties(data);
      } else {
        console.error('Les données reçues ne sont pas un tableau:', data);
        setUserProperties([]);
      }
    } catch (error) {
      console.error('Erreur fetchUserProperties:', error);
      toast.error('Erreur lors du chargement de vos propriétés');
      setUserProperties([]);
    } finally {
      setLoading(false);
    }
  }, [user, API_BASE_URL]);

  // Modifier une propriété
  const updateProperty = async (propertyId: string, updates: Partial<Property>): Promise<Property> => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/update.php?id=${propertyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      const updatedProperty = await handleResponse(response);
      
      // Mettre à jour les listes locales
      setProperties(prev => prev.map(p => p.id === propertyId ? updatedProperty : p));
      setUserProperties(prev => prev.map(p => p.id === propertyId ? updatedProperty : p));
      
      toast.success('Propriété modifiée avec succès');
      return updatedProperty;
    } catch (error: any) {
      toast.error('Erreur lors de la modification de la propriété');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Supprimer une propriété
  const deleteProperty = async (propertyId: string): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/delete.php?id=${propertyId}`, {
        method: 'DELETE',
      });
      
      await handleResponse(response);
      
      // Mettre à jour les listes locales
      setProperties(prev => prev.filter(p => p.id !== propertyId));
      setUserProperties(prev => prev.filter(p => p.id !== propertyId));
      
      toast.success('Propriété supprimée avec succès');
    } catch (error: any) {
      toast.error('Erreur lors de la suppression de la propriété');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Rechercher des propriétés avec filtres
  const searchProperties = async (filters: SearchFilters = {}): Promise<Property[]> => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      
      // Ajouter les filtres aux paramètres de requête
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });

      const url = `${API_BASE_URL}/search.php?${queryParams.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const results = await handleResponse(response);
      return Array.isArray(results) ? results : [];
    } catch (error) {
      console.error('Erreur searchProperties:', error);
      toast.error('Erreur lors de la recherche des propriétés');
      return [];
    } finally {
      setLoading(false);
    }
  };

  
   useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // AJOUT: Charger les propriétés de l'utilisateur quand il change
  useEffect(() => {
    if (user) {
      fetchUserProperties();
    } else {
      setUserProperties([]);
    }
  }, [user, fetchUserProperties]);useEffect(() => {
    const loadUserProperties = async () => {
      if (user) {
        await fetchUserProperties();
      } else {
        setUserProperties([]);
      }
    };

    loadUserProperties();
  }, [user, fetchUserProperties]);  // Supprimer fetchUserProperties des dépendances


  const value: PropertyContextType = {
    properties,
    userProperties, // Ajouter au contexte
    loading,
    createProperty,
    searchProperties,
    fetchProperties,
    fetchPropertyById,
    deleteProperty,
    updateProperty,
    fetchUserProperties, // Ajouter cette fonction
  };

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
};