import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAnnouncement, CreateAnnouncementData } from '../contexts/AnnouncementContext';
import toast from 'react-hot-toast';
import { PhotoIcon, IdentificationIcon, ExclamationTriangleIcon, XMarkIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

interface ImageFile {
  file: File;
  preview: string;
  id: string;
}

const uploadImageToServer = async (file: File): Promise<string> => {
  try {
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const { getAuthToken } = await import('../config');
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('image', file);
    
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/api/upload/image`, { 
      method: 'POST', 
      headers,
      body: formData 
    });
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Erreur lors de l\'upload');
    }
    
    return data.data?.url || data.data?.path || '';
  } catch (error) {
    console.error('Erreur upload:', error);
    throw new Error('Erreur lors de l\'upload: ' + (error as Error).message);
  }
};

const EditAnnouncementPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { userAnnouncements, updateAnnouncement, loading } = useAnnouncement();

  const [content, setContent] = useState('');
  const [contact, setContact] = useState('');
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Charger les données de l'annonce à modifier
  useEffect(() => {
    if (!id) return;
    const annId = parseInt(id);
    const announcement = userAnnouncements.find(a => Number(a.id) === annId);
    if (announcement) {
      setContent(announcement.content);
      setContact(announcement.contact || '');
      setExistingImages(announcement.images || []);
      return;
    }
    // Fallback: charger depuis l'API si non présent dans le cache
    (async () => {
      try {
        const { apiGet } = await import('../config');
        const res = await apiGet(`/api/announcements/get_by_id/${annId}`);
        const data = await res.json();
        if (!res.ok || !data.success || !data.data) {
          throw new Error(data.message || 'Annonce non trouvée');
        }
        const a = data.data;
        // sécurité: s'assurer que l'utilisateur est bien l'auteur
        if (user && String(a.author?.id) !== String(user.id)) {
          toast.error('Vous ne pouvez pas modifier cette annonce');
          navigate('/dashboard');
          return;
        }
        setContent(a.content || '');
        setContact(a.contact || '');
        setExistingImages(a.images || []);
      } catch (e: any) {
        toast.error(e.message || 'Annonce non trouvée');
        navigate('/dashboard');
      }
    })();
  }, [id, userAnnouncements, navigate, user]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (user.userType !== 'student') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Réservé aux étudiants</h2>
          <p className="text-gray-600 mb-4">Seuls les comptes étudiants peuvent modifier une annonce de colocation.</p>
          <button onClick={() => navigate('/dashboard')} className="w-full btn-secondary">Retour</button>
        </div>
      </div>
    );
  }

  if (!user.cinVerified) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Vérification Requise</h2>
          <p className="text-gray-600 mb-4">Vous devez vérifier votre CIN avant de pouvoir modifier des annonces.</p>
          <div className="space-y-3">
            <Link to="/cin-verification" className="w-full btn-primary flex items-center justify-center space-x-2">
              <IdentificationIcon className="w-5 h-5" />
              <span>Vérifier mon CIN</span>
            </Link>
            <button onClick={() => navigate('/dashboard')} className="w-full btn-secondary">Retour au tableau de bord</button>
          </div>
        </div>
      </div>
    );
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newImages: ImageFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) { toast.error(`${file.name} n'est pas une image valide`); continue; }
      if (file.size > 5 * 1024 * 1024) { toast.error(`${file.name} est trop volumineux (max 5MB)`); continue; }
      if (existingImages.length + imageFiles.length + newImages.length >= 6) { toast.error('Maximum 6 images'); break; }
      newImages.push({ file, preview: URL.createObjectURL(file), id: Math.random().toString(36).slice(2) });
    }
    if (newImages.length > 0) {
      setImageFiles(prev => [...prev, ...newImages]);
      toast.success(`${newImages.length} image(s) ajoutée(s)`);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeNewImage = (index: number) => {
    URL.revokeObjectURL(imageFiles[index].preview);
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadAllImages = async (): Promise<string[]> => {
    if (imageFiles.length === 0) return [];
    setIsUploading(true);
    try {
      const files = imageFiles.map(i => i.file);
      const urls = await Promise.all(files.map(uploadImageToServer));
      return urls;
    } finally { setIsUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) { toast.error('Le texte de votre annonce est requis'); return; }
    if (!id) { toast.error('ID d\'annonce manquant'); return; }

    try {
      toast.loading('Modification en cours...');
      const newImageUrls = await uploadAllImages();
      const allImages = [...existingImages, ...newImageUrls];
      
      const payload: Partial<CreateAnnouncementData> = { 
        content: content.trim(), 
        images: allImages, 
        contact: contact.trim() || undefined 
      };
      
      await updateAnnouncement(parseInt(id), payload);
      toast.dismiss();
      imageFiles.forEach(i => URL.revokeObjectURL(i.preview));
      navigate('/dashboard');
    } catch (err: any) {
      toast.dismiss();
      toast.error(err.message || 'Erreur lors de la modification');
    }
  };

  const getImageUrl = (imageUrl: string | undefined) => {
    if (!imageUrl) return '/api/placeholder/400/300';
    if (imageUrl.startsWith('http')) return imageUrl;
    if (imageUrl.startsWith('/')) return `http://localhost${imageUrl}`;
    return imageUrl;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link
              to="/dashboard"
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Retour
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Modifier l'annonce de colocation</h1>
          <p className="text-gray-600">Modifiez votre recherche de colocation (quartier, budget, préférences) et les images.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Texte de l'annonce *</label>
            <textarea 
              value={content} 
              onChange={e => setContent(e.target.value)} 
              rows={5} 
              className="input-field" 
              placeholder="Ex: Étudiant en info, je cherche une colocation à Isoraka, budget 300 000 Ar, non fumeur..." 
              required 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact (optionnel)</label>
            <input 
              value={contact} 
              onChange={e => setContact(e.target.value)} 
              type="text" 
              className="input-field" 
              placeholder="Téléphone, email, etc." 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Images (max 6)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/*" 
                multiple 
                onChange={handleImageUpload} 
                className="hidden" 
                id="announcementImages" 
              />
              <label htmlFor="announcementImages" className="cursor-pointer inline-flex items-center space-x-2 btn-secondary">
                <PhotoIcon className="w-5 h-5" />
                <span>Ajouter des images</span>
              </label>
              
              {/* Images existantes */}
              {existingImages.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Images actuelles</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {existingImages.map((img, idx) => (
                      <div key={idx} className="relative">
                        <img src={getImageUrl(img)} alt={`existing-${idx}`} className="w-full h-32 object-cover rounded-lg" />
                        <button 
                          type="button" 
                          onClick={() => removeExistingImage(idx)} 
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nouvelles images */}
              {imageFiles.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Nouvelles images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {imageFiles.map((img, idx) => (
                      <div key={img.id} className="relative">
                        <img src={img.preview} alt="preview" className="w-full h-32 object-cover rounded-lg" />
                        <button 
                          type="button" 
                          onClick={() => removeNewImage(idx)} 
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Compteur d'images */}
              {(existingImages.length > 0 || imageFiles.length > 0) && (
                <div className="mt-3 text-sm text-gray-500">
                  {existingImages.length + imageFiles.length} / 6 images
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-3">
            <button 
              type="button" 
              onClick={() => navigate('/dashboard')} 
              className="btn-secondary"
              disabled={isUploading || loading}
            >
              Annuler
            </button>
            <button 
              type="submit" 
              disabled={isUploading || loading || !content.trim()} 
              className="btn-primary"
            >
              {isUploading || loading ? 'Modification...' : 'Modifier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAnnouncementPage;