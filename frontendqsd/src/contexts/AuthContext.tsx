import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, RegisterData, CINVerificationData } from '../types'; // Retirer CINVerificationResult
import { apiGet, apiJson, apiUpload, setAuthToken } from '../config';
import toast from 'react-hot-toast';
import { cinVerificationService } from '../services/cinVerificationService';
import { getStorage, removeStorage, clearStorage } from '../utils/storage';

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
  const token = getStorage('auth_token'); // Utiliser getStorage
  console.log('🔐 Token récupéré pour le port', window.location.port, ':', token);
  
  if (!token) {
    setIsLoading(false);
    return;
  }

  setAuthToken(token);

  (async () => {
    try {
      console.log('🔄 Tentative de récupération du profil...');
      const data = await apiGet('/api/auth/me');
      console.log('📡 Réponse me:', data);

      if (data.success && data.data) {
        console.log('✅ Profil récupéré avec succès:', data.data);
        setUser(mapApiUserToFront(data.data));
      } else {
        console.error('❌ Erreur dans la réponse me:', data?.message);
        setAuthToken(null);
        removeStorage('auth_token'); // Utiliser removeStorage
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement du profil:', error);
      setAuthToken(null);
      removeStorage('auth_token'); // Utiliser removeStorage
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  })();
}, []);


  const login = async (email: string, password: string): Promise<void> => {
  setIsLoading(true);
  try {
    const data = await apiJson('/api/auth/login', 'POST', { email, password });
    
    if (!data.success) {
      throw new Error(data.message || 'Erreur de connexion');
    }
    
    let authToken = null;
    if (data.data?.token) {
      authToken = data.data.token;
    } else if (data.token) {
      authToken = data.token;
    } else {
      authToken = 'demo-token';
      console.log('🧪 Token de démo enregistré (fallback)');
    }

    if (authToken) {
      setAuthToken(authToken);
      console.log('✅ Token enregistré pour le port', window.location.port);
    }

      if (data.data?.user) {
        setUser(mapApiUserToFront(data.data.user));
      } else if (data.user) {
        setUser(mapApiUserToFront(data.user));
      } else if (data.data) {
        setUser(mapApiUserToFront(data.data));
      } else {
        try {
          const meData = await apiGet('/api/auth/me');
          if (meData.success) {
            setUser(mapApiUserToFront(meData.data));
            console.log('👤 Utilisateur connecté via me:', meData.data);
          }
        } catch (meError) {
          console.warn('⚠️ Impossible de charger le profil via me:', meError);
        }
      }
      
      toast.success('Connexion réussie !');
    } catch (error: any) {
    setAuthToken(null);
    removeStorage('auth_token'); // Utiliser removeStorage
    toast.error(error.message || 'Erreur lors de la connexion');
    throw error;
  } finally {
    setIsLoading(false);
  }
};

  const register = async (userData: RegisterData): Promise<void> => {
    setIsLoading(true);
    try {
      const data = await apiJson('/api/auth/register', 'POST', {
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        userType: userData.userType,
        university: userData.university,
        studyLevel: userData.studyLevel,
        budget: typeof (userData as any).budget === 'number' ? (userData as any).budget : Number((userData as any).budget) || null,
      });
      
      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de l\'inscription');
      }

      // Si une image de profil a été fournie, utiliser le token retourné pour uploader et mettre à jour l'avatar
      const token = data?.data?.token || data?.token;
      const createdUser = data?.data?.user || data?.user;
      const profileImage: File | undefined = (userData as any).profileImage;
      if (token && profileImage) {
        setAuthToken(token);
        try {
          const form = new FormData();
          form.append('image', profileImage);
          const uploadData = await apiUpload('/api/upload/image', form);
          if (uploadData.success) {
            const avatarUrl = uploadData.data?.url || uploadData.data?.path;
            await apiJson('/api/users/me', 'PUT', { avatar: avatarUrl });
            // Met à jour le user local si on l'a déjà
            if (createdUser) {
              setUser(prev => prev ? { ...prev, avatar: avatarUrl } : prev);
            }
          }
        } catch (e) {
          console.warn('Upload avatar après inscription échoué:', e);
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de l\'inscription');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
  try {
    await apiJson('/api/auth/logout', 'POST');
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
  } finally {
    setUser(null);
    setAuthToken(null);
    clearStorage(); // Utiliser clearStorage
    toast.success('Déconnexion réussie');
  }
};

  const updateProfile = async (profileData: Partial<User>): Promise<void> => {
    try {
      const data = await apiJson('/api/users/me', 'PUT', profileData);
      
      if (!data.success) {
        throw new Error(data.message || 'Erreur lors de la mise à jour');
      }
      
      setUser(prev => prev ? { ...prev, ...mapApiUserToFront(data.data) } : mapApiUserToFront(data.data));
      toast.success('Profil mis à jour avec succès !');
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la mise à jour du profil');
      throw error;
    }
  };

  // Dans la fonction verifyCIN de AuthContext.tsx
  const verifyCIN = async (verificationData: CINVerificationData): Promise<void> => {
  setIsLoading(true);
  try {
    console.log('🔍 Début de la vérification CIN simple...');

    // 1. Vérification simple
    const verificationResult = await cinVerificationService.verifyCIN(
      verificationData.cinNumber,
      verificationData.cinRectoImage,
      verificationData.cinVersoImage
    );

    console.log('📊 Résultat vérification:', verificationResult);

    if (!verificationResult.success) {
      const errorMessage = verificationResult.message || 'Validation CIN locale échouée';
      throw new Error(errorMessage);
    }

    // 2. Upload images first (if needed)
    
    // Upload recto image
    let cinRectoImagePath = null;
    if (verificationData.cinRectoImage) {
      const rectoFormData = new FormData();
      rectoFormData.append('image', verificationData.cinRectoImage);
      const rectoData = await apiUpload('/api/upload/image', rectoFormData);
      if (!rectoData.success) {
        throw new Error(rectoData.message || 'Upload recto échoué');
      }
      cinRectoImagePath = rectoData.data.path;
    }

    // Upload verso image
    let cinVersoImagePath = null;
    if (verificationData.cinVersoImage) {
      const versoFormData = new FormData();
      versoFormData.append('image', verificationData.cinVersoImage);
      const versoData = await apiUpload('/api/upload/image', versoFormData);
      if (!versoData.success) {
        throw new Error(versoData.message || 'Upload verso échoué');
      }
      cinVersoImagePath = versoData.data.path;
    }

    // 3. Send CIN verification data
    const backendData = await apiJson('/api/auth/verify_cin', 'POST', {
      cinNumber: verificationData.cinNumber,
      cinRectoImagePath,
      cinVersoImagePath,
      cinData: (verificationResult as any).cinData || null
    });

    if (!backendData.success) {
      throw new Error(backendData.message || 'Erreur lors de la vérification CIN');
    }

    // 4. Recharger l'utilisateur depuis le serveur pour avoir les données à jour
    try {
      const meData = await apiGet('/api/auth/me');
      if (meData.success && meData.data) {
        setUser(mapApiUserToFront(meData.data));
        console.log('👤 Utilisateur rechargé après vérification CIN:', meData.data);
      }
    } catch (meError) {
      console.warn('⚠️ Impossible de recharger le profil:', meError);
      // Mettre à jour localement en fallback
      if (user) {
        const updatedUser = {
          ...user,
          isVerified: false,
          cinVerified: false,
          cinPending: true,
          cinNumber: verificationData.cinNumber
        };
        setUser(updatedUser);
      }
    }
    
    toast.success('Vérification CIN soumise avec succès ! En attente de validation par un administrateur.');

  } catch (error: any) {
    console.error('❌ Erreur vérification CIN:', error);
    toast.error(error.message || 'Erreur lors de la vérification CIN');
    throw error;
  } finally {
    setIsLoading(false);
  }
};

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    updateProfile,
    isLoading,
    verifyCIN,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

  function mapApiUserToFront(apiUser: any): User {
    // Logique améliorée pour déterminer cinVerified
    let isCinVerified = false;
    
    // Vérifier toutes les possibilités de champs pour cinVerified
    if (apiUser.cinVerified !== undefined) {
      isCinVerified = Boolean(apiUser.cinVerified);
    } else if (apiUser.cin_verified !== undefined) {
      isCinVerified = Boolean(apiUser.cin_verified);
    } else if (apiUser.cin_verified_at) {
      // Si une date de vérification existe, considérer comme vérifié
      isCinVerified = true;
    }
    
    // Déterminer si la CIN est en attente
    const hasCinImages = !!(apiUser.cin_recto_image_path || apiUser.cin_verso_image_path);
    const hasPendingStatus = apiUser.cinPending !== undefined ? Boolean(apiUser.cinPending) : false;
    const cinPending = (hasCinImages && !isCinVerified) || hasPendingStatus;

    console.log('🔍 Mapping user - cinVerified:', isCinVerified, 'cinPending:', cinPending, 'raw data:', {
      cinVerified: apiUser.cinVerified,
      cin_verified: apiUser.cin_verified,
      cin_verified_at: apiUser.cin_verified_at,
      cin_recto_image_path: apiUser.cin_recto_image_path,
      cin_verso_image_path: apiUser.cin_verso_image_path
    });

    return {
      id: String(apiUser.id),
      email: apiUser.email,
      firstName: apiUser.firstName || apiUser.first_name || '',
      lastName: apiUser.lastName || apiUser.last_name || '',
      phone: apiUser.phone || '',
      userType: apiUser.userType || apiUser.user_type,
      university: apiUser.university || undefined,
      studyLevel: apiUser.studyLevel || apiUser.study_level || undefined,
      budget: apiUser.budget !== null && apiUser.budget !== undefined ? Number(apiUser.budget) : undefined,
      preferences: Array.isArray(apiUser.preferences) ? apiUser.preferences : [],
      bio: apiUser.bio || '',
      avatar: apiUser.avatar || undefined,
      isVerified: Boolean(apiUser.isVerified || apiUser.is_verified || false),
      cinVerified: isCinVerified,
      cinPending: cinPending,
      cinNumber: apiUser.cinNumber || apiUser.cin_number || undefined,
      cinData: apiUser.cinData ? (typeof apiUser.cinData === 'string' ? JSON.parse(apiUser.cinData) : apiUser.cinData) : undefined,
      cin_verification_requested_at: apiUser.cin_verification_requested_at || undefined,
      cin_verified_at: apiUser.cin_verified_at || undefined,
      accountActivationDeadline: apiUser.account_activation_deadline ? new Date(apiUser.account_activation_deadline) : undefined,
      createdAt: apiUser.createdAt ? new Date(apiUser.createdAt) : (apiUser.created_at ? new Date(apiUser.created_at) : new Date()),
      updatedAt: apiUser.updatedAt ? new Date(apiUser.updatedAt) : (apiUser.updated_at ? new Date(apiUser.updated_at) : new Date()),
    };
  }