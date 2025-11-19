import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import { Property, CreatePropertyData, SearchFilters } from '../types';
import { useAuth } from './AuthContext';
import { apiGet, apiJson } from '../config';
import toast from 'react-hot-toast';

interface PropertyContextType {
  properties: Property[];
  userProperties: Property[];
  loading: boolean;
  createProperty: (propertyData: CreatePropertyData) => Promise<void>;
  searchProperties: (filters?: SearchFilters) => Promise<Property[]>;
  fetchProperties: () => Promise<void>;
  fetchPropertyById: (id: string) => Promise<Property | null>;
  deleteProperty: (propertyId: string) => Promise<void>;
  updateProperty: (propertyId: string, updates: Partial<Property>) => Promise<Property>;
  fetchUserProperties: () => Promise<void>;
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
  const [userProperties, setUserProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Récupérer toutes les propriétés
  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiGet('/api/properties/get_all');
      const data = await response.json();
      
      if (data.success && data.data) {
        const propertiesData = Array.isArray(data.data) ? data.data : [];
        setProperties(propertiesData);
      } else {
        setProperties([]);
      }
    } catch (error) {
      console.error('Erreur fetchProperties:', error);
      toast.error('Erreur lors du chargement des propriétés');
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Récupérer une propriété par ID
  const fetchPropertyById = async (id: string): Promise<Property | null> => {
    try {
      const response = await apiGet(`/api/properties/get_by_id/${id}`);
      const data = await response.json();
      
      if (data.success && data.data) {
        return data.data;
      }
      
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

      const response = await apiJson('/api/properties/create', 'POST', propertyData);
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Erreur lors de la création');
      }
      
      const newProperty = data.data;
      
      setProperties(prev => [newProperty, ...prev]);
      setUserProperties(prev => [newProperty, ...prev]);
      
      toast.success('Propriété créée avec succès !');
    } catch (error) {
      console.error('Erreur createProperty:', error);
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la création de la propriété');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les propriétés de l'utilisateur (version externe)
  const fetchUserProperties = useCallback(async () => {
    if (!user) {
      setUserProperties([]);
      return;
    }

    setLoading(true);
    try {
      const response = await apiGet('/api/properties/get_by_user');
      const data = await response.json();
      
      if (data.success && data.data) {
        const propertiesData = Array.isArray(data.data) ? data.data : [];
        setUserProperties(propertiesData);
      } else {
        setUserProperties([]);
      }
    } catch (error) {
      console.error('Erreur fetchUserProperties:', error);
      toast.error('Erreur lors du chargement de vos propriétés');
      setUserProperties([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Modifier une propriété
  const updateProperty = async (propertyId: string, updates: Partial<Property>): Promise<Property> => {
    setLoading(true);
    try {
      const response = await apiJson(`/api/properties/update/${propertyId}`, 'PUT', updates);
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Erreur lors de la mise à jour');
      }
      
      const updatedProperty = data.data;
      
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
      const response = await apiJson(`/api/properties/delete/${propertyId}`, 'DELETE');
      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Erreur lors de la suppression');
      }
      
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
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => queryParams.append(key, v));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });

      const url = `/api/properties/search?${queryParams.toString()}`;
      const response = await apiGet(url);
      const data = await response.json();
      
      if (data.success && data.data) {
        return Array.isArray(data.data) ? data.data : [];
      }
      return [];
    } catch (error) {
      console.error('Erreur searchProperties:', error);
      toast.error('Erreur lors de la recherche des propriétés');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Effet pour charger toutes les propriétés
  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // Effet pour charger les propriétés de l'utilisateur - CORRIGÉ
  useEffect(() => {
    const loadUserProperties = async () => {
      if (!user) {
        setUserProperties([]);
        return;
      }

      setLoading(true);
      try {
        const response = await apiGet('/api/properties/get_by_user');
        const data = await response.json();
        
        if (data.success && data.data) {
          const propertiesData = Array.isArray(data.data) ? data.data : [];
          setUserProperties(propertiesData);
        } else {
          setUserProperties([]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des propriétés utilisateur:', error);
        toast.error('Erreur lors du chargement de vos propriétés');
        setUserProperties([]);
      } finally {
        setLoading(false);
      }
    };

    loadUserProperties();
  }, [user]); // Seulement user en dépendance

  const value: PropertyContextType = {
    properties,
    userProperties,
    loading,
    createProperty,
    searchProperties,
    fetchProperties,
    fetchPropertyById,
    deleteProperty,
    updateProperty,
    fetchUserProperties,
  };

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
};