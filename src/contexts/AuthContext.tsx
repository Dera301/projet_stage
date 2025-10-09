import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, RegisterData } from '../types';
import { apiGet, apiJson, setAuthToken } from '../config';
import toast from 'react-hot-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    console.log('🔐 Token dans localStorage:', token);
    
    if (!token) {
      setIsLoading(false);
      return;
    }

    // Réappliquer le token aux en-têtes API
    setAuthToken(token);

    (async () => {
      try {
        console.log('🔄 Tentative de récupération du profil...');
        const res = await apiGet('/api/auth/me.php');
        
        console.log('📡 Réponse me.php - Status:', res.status);
        
        const text = await res.text();
        console.log('📡 Réponse me.php - Body:', text);
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        let data;
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error('❌ Erreur parsing JSON:', parseError);
          setIsLoading(false);
          return;
        }
        
        // Vérifier si la requête a réussi
        if (data.success && data.data) {
          console.log('✅ Profil récupéré avec succès:', data.data);
          setUser(mapApiUserToFront(data.data));
        } else {
          console.error('❌ Erreur dans la réponse me.php:', data.message);
          // Si le token est invalide, nettoyer le localStorage
          setAuthToken(null);
          localStorage.removeItem('auth_token');
        }
      } catch (error) {
        console.error('❌ Erreur lors du chargement du profil:', error);
        setAuthToken(null);
        localStorage.removeItem('auth_token');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
  setIsLoading(true);
  try {
    const res = await apiJson('/api/auth/login.php', 'POST', { email, password });
    const data = await res.json();
    
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Erreur de connexion');
    }
    
    // 🔹 CORRECTION : Stocker le token seulement si la connexion réussit
    let authToken = null;
    if (data.data?.token) {
      authToken = data.data.token;
    } else if (data.token) {
      authToken = data.token;
    } else {
      // Si aucun token reçu, utiliser un token de démo
      authToken = 'demo-token';
      console.log('🧪 Token de démo enregistré (fallback)');
    }

    if (authToken) {
      setAuthToken(authToken);
      console.log('✅ Token enregistré:', authToken);
    }

    // 🔹 CORRECTION : Mettre à jour l'utilisateur
    if (data.data?.user) {
      setUser(mapApiUserToFront(data.data.user));
    } else if (data.user) {
      setUser(mapApiUserToFront(data.user));
    } else if (data.data) {
      // Si les données utilisateur sont directement dans data.data
      setUser(mapApiUserToFront(data.data));
    } else {
      // Si pas d'utilisateur dans la réponse, récupérer les infos via me.php
      try {
        const meRes = await apiGet('/api/auth/me.php');
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.success) {
            setUser(mapApiUserToFront(meData.data));
            console.log('👤 Utilisateur connecté via me.php:', meData.data);
          }
        }
      } catch (meError) {
        console.warn('⚠️ Impossible de charger le profil via me.php:', meError);
      }
    }
    
    toast.success('Connexion réussie !');
  } catch (error: any) {
    setAuthToken(null);
    toast.error(error.message || 'Erreur lors de la connexion');
    throw error;
  } finally {
    setIsLoading(false);
  }
};
  const register = async (userData: RegisterData): Promise<void> => {
    setIsLoading(true);
    try {
      const res = await apiJson('/api/auth/register.php', 'POST', {
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        userType: userData.userType,
        university: userData.university,
        studyLevel: userData.studyLevel,
      });
      
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Erreur lors de l\'inscription');
      }
      
      toast.success('Inscription réussie ! Vous pouvez maintenant vous connecter.');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'inscription');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiJson('/api/auth/logout.php', 'POST');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setUser(null);
      setAuthToken(null);
      toast.success('Déconnexion réussie');
    }
  };

  const updateProfile = async (profileData: Partial<User>): Promise<void> => {
    try {
      const res = await apiJson('/api/users/update_profile.php', 'PUT', {
        id: user?.id,
        ...profileData
      });
      
      const data = await res.json();
      
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Erreur lors de la mise à jour');
      }
      
      setUser(prev => prev ? { ...prev, ...mapApiUserToFront(data.data) } : null);
      toast.success('Profil mis à jour avec succès !');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour du profil');
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    updateProfile,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

function mapApiUserToFront(apiUser: any): User {
  return {
    id: String(apiUser.id),
    email: apiUser.email,
    firstName: apiUser.firstName || apiUser.first_name || '',
    lastName: apiUser.lastName || apiUser.last_name || '',
    phone: apiUser.phone || '',
    userType: apiUser.userType || apiUser.user_type,
    university: apiUser.university || undefined,
    studyLevel: apiUser.studyLevel || apiUser.study_level || undefined,
    budget: apiUser.budget ? Number(apiUser.budget) : undefined,
    preferences: Array.isArray(apiUser.preferences) ? apiUser.preferences : [],
    bio: apiUser.bio || '',
    avatar: apiUser.avatar || undefined,
    isVerified: Boolean(apiUser.isVerified || apiUser.is_verified || false),
    createdAt: apiUser.createdAt ? new Date(apiUser.createdAt) : (apiUser.created_at ? new Date(apiUser.created_at) : new Date()),
    updatedAt: apiUser.updatedAt ? new Date(apiUser.updatedAt) : (apiUser.updated_at ? new Date(apiUser.updated_at) : new Date()),
  };
}