import React, { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useAnnouncement, CreateAnnouncementData } from '../contexts/AnnouncementContext';
import { apiUpload } from '../config';
import toast from 'react-hot-toast';
import { PhotoIcon, IdentificationIcon, ExclamationTriangleIcon, XMarkIcon, ClockIcon } from '@heroicons/react/24/outline';

interface ImageFile {
  file: File;
  preview: string;
  id: string;
}

const uploadImageToServer = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    const data = await apiUpload('/api/upload/image', formData);
    
    if (!data.success) {
      throw new Error(data.message || 'Erreur lors de l\'upload');
    }
    
    return data.data?.url || data.data?.path || '';
  } catch (error: any) {
    console.error('Erreur upload:', error);
    throw new Error(error.message || 'Erreur lors de l\'upload');
  }
};

const CreateAnnouncementPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { createAnnouncement } = useAnnouncement();

  const [content, setContent] = useState('');
  const [contact, setContact] = useState('');
  const [imageFiles, setImageFiles] = useState<ImageFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          <p className="text-gray-600 mb-4">Seuls les comptes étudiants peuvent publier une annonce de colocation.</p>
          <button onClick={() => navigate('/dashboard')} className="w-full btn-secondary">Retour</button>
        </div>
      </div>
    );
  }

  const isCinVerified = user?.cinVerified || user?.cin_verified;
  const isCinPending = user?.cinPending || user?.cin_verification_requested_at;

  // Bloquer si l'étudiant n'est PAS vérifié ET n'est PAS en attente
  if (!isCinVerified && !isCinPending) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Vérification Requise</h2>
          <p className="text-gray-600 mb-4">Vous devez vérifier votre CIN avant de pouvoir publier des annonces.</p>
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
  
  // Afficher un message "en attente"
  if (!isCinVerified && isCinPending) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <ClockIcon className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Vérification en cours
          </h2>
          <p className="text-gray-600 mb-4">
            Votre CIN est en cours de validation. Vous pourrez publier une annonce dès qu'elle sera approuvée.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full btn-secondary"
          >
            Retour au tableau de bord
          </button>
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
      if (imageFiles.length + newImages.length >= 6) { toast.error('Maximum 6 images'); break; }
      newImages.push({ file, preview: URL.createObjectURL(file), id: Math.random().toString(36).slice(2) });
    }
    if (newImages.length > 0) {
      setImageFiles(prev => [...prev, ...newImages]);
      toast.success(`${newImages.length} image(s) ajoutée(s)`);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imageFiles[index].preview);
    setImageFiles(prev => prev.filter((_, i) => i !== index));
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
    try {
      toast.loading('Publication en cours...');
      const images = await uploadAllImages();
      toast.dismiss();
      const payload: CreateAnnouncementData = { content: content.trim(), images, contact: contact.trim() || undefined };
      await createAnnouncement(payload);
      imageFiles.forEach(i => URL.revokeObjectURL(i.preview));
      navigate('/announcements');
    } catch (err: any) {
      toast.dismiss();
      toast.error(err.message || 'Erreur lors de la publication');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Publier une annonce de colocation</h1>
          <p className="text-gray-600">Partagez ce que vous recherchez (quartier, budget, préférences) et ajoutez des images si besoin.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Texte de l'annonce *</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} rows={5} className="input-field" placeholder="Ex: Étudiant en info, je cherche une colocation à Isoraka, budget 300 000 Ar, non fumeur..." required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact (optionnel)</label>
            <input value={contact} onChange={e => setContact(e.target.value)} type="text" className="input-field" placeholder="Téléphone, email, etc." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Images (max 6)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" id="announcementImages" />
              <label htmlFor="announcementImages" className="cursor-pointer inline-flex items-center space-x-2 btn-secondary">
                <PhotoIcon className="w-5 h-5" />
                <span>Ajouter des images</span>
              </label>
              {imageFiles.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                  {imageFiles.map((img, idx) => (
                    <div key={img.id} className="relative">
                      <img src={img.preview} alt="preview" className="w-full h-32 object-cover rounded-lg" />
                      <button type="button" onClick={() => removeImage(idx)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-3">
            <button type="button" onClick={() => navigate('/announcements')} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={isUploading || !content.trim()} className="btn-primary">Publier</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAnnouncementPage;
