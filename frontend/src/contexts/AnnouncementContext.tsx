import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { apiGet, apiJson } from '../config';
import toast from 'react-hot-toast';

export interface Announcement {
  id: number;
  authorId: number;
  author: {
    id: number;
    firstName: string;
    lastName: string;
    userType: 'student' | 'owner' | 'admin';
  };
  content: string;
  images: string[];
  contact?: string;
  createdAt: string;
}

export interface CreateAnnouncementData {
  content: string;
  images: string[];
  contact?: string;
}

interface AnnouncementContextType {
  announcements: Announcement[];
  userAnnouncements: Announcement[];
  loading: boolean;
  fetchAnnouncements: () => Promise<void>;
  fetchUserAnnouncements: () => Promise<void>;
  createAnnouncement: (data: CreateAnnouncementData) => Promise<void>;
  updateAnnouncement: (id: number, updates: Partial<CreateAnnouncementData>) => Promise<void>; // id: number
  deleteAnnouncement: (id: number) => Promise<void>; // id: number
}

const AnnouncementContext = createContext<AnnouncementContextType | undefined>(undefined);

export const useAnnouncement = () => {
  const ctx = useContext(AnnouncementContext);
  if (!ctx) throw new Error('useAnnouncement must be used within AnnouncementProvider');
  return ctx;
};

export const AnnouncementProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [userAnnouncements, setUserAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet('/api/announcements/get_all');
      const data = await res.json();
      if (data.success && data.data) {
        setAnnouncements(Array.isArray(data.data) ? data.data : []);
      } else {
        setAnnouncements([]);
      }
    } catch (err) {
      console.error(err);
      toast.error('Impossible de charger les annonces');
      setAnnouncements([]);
    } finally { setLoading(false); }
  }, []);

  const fetchUserAnnouncements = useCallback(async () => {
    if (!user) { setUserAnnouncements([]); return; }
    setLoading(true);
    try {
      const res = await apiGet('/api/announcements/get_by_user');
      const data = await res.json();
      if (data.success && data.data) {
        setUserAnnouncements(Array.isArray(data.data) ? data.data : []);
      } else {
        setUserAnnouncements([]);
      }
    } catch (err) {
      console.error(err);
      toast.error('Impossible de charger vos annonces');
      setUserAnnouncements([]);
    } finally { setLoading(false); }
  }, [user]);

  const createAnnouncement = async (data: CreateAnnouncementData) => {
    if (!user) throw new Error('Non connecté');
    setLoading(true);
    try {
      const res = await apiJson('/api/announcements/create', 'POST', data);
      const responseData = await res.json();
      if (!res.ok || !responseData.success) {
        throw new Error(responseData.message || 'Erreur lors de la création');
      }
      const created = responseData.data;
      setAnnouncements(prev => [created, ...prev]);
      if (Number(created.authorId) === Number(user.id)) {
        setUserAnnouncements(prev => [created, ...prev]);
      }
      toast.success('Annonce publiée !');
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la publication');
      throw err;
    } finally { setLoading(false); }
  };

  const updateAnnouncement = async (id: number, updates: Partial<CreateAnnouncementData>) => {
    setLoading(true);
    try {
      const res = await apiJson(`/api/announcements/update/${id}`, 'PUT', updates);
      const responseData = await res.json();
      if (!res.ok || !responseData.success) {
        throw new Error(responseData.message || 'Erreur lors de la mise à jour');
      }
      const updated = responseData.data;
      setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, ...updated } : a));
      setUserAnnouncements(prev => prev.map(a => a.id === id ? { ...a, ...updated } : a));
      toast.success('Annonce mise à jour');
    } catch (err: any) {
      toast.error(err.message || 'Mise à jour impossible');
      throw err;
    } finally { setLoading(false); }
  };
  
  const deleteAnnouncement = async (id: number) => {
    setLoading(true);
    try {
      const res = await apiJson(`/api/announcements/delete/${id}`, 'DELETE');
      const responseData = await res.json();
      if (!res.ok || !responseData.success) {
        throw new Error(responseData.message || 'Erreur lors de la suppression');
      }
      setAnnouncements(prev => prev.filter(a => a.id !== id));
      setUserAnnouncements(prev => prev.filter(a => a.id !== id));
      toast.success('Annonce supprimée');
    } catch (err) {
      toast.error('Suppression impossible');
      throw err;
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAnnouncements(); }, [fetchAnnouncements]);
  useEffect(() => { fetchUserAnnouncements(); }, [fetchUserAnnouncements]);

  return (
    <AnnouncementContext.Provider value={{ 
      announcements, 
      userAnnouncements, 
      loading, 
      fetchAnnouncements, 
      fetchUserAnnouncements, 
      createAnnouncement, 
      updateAnnouncement, 
      deleteAnnouncement 
    }}>
      {children}
    </AnnouncementContext.Provider>
  );
};