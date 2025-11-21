// Dans types.ts
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  userType: 'student' | 'owner' | 'admin';
  university?: string;
  studyLevel?: string;
  budget?: number;
  preferences: string[];
  bio: string;
  avatar?: string;
  isVerified: boolean;
  cinVerified: boolean;
  cinPending?: boolean; // CIN soumise mais en attente de validation admin
  cinNumber?: string;
  cinData?: CINData;
  cin_number?: string;
  cin_verified?: boolean;
  is_verified?: boolean;
  cin_verification_requested_at?: string;
  cin_verified_at?: string;
  account_activation_deadline?: string; // Nouveau champ pour stocker les données CIN extraites
  accountActivationDeadline?: Date; // Date limite pour l'accès (24h)
  createdAt: Date;
  updatedAt: Date;
}

// types.ts
export interface Property {
  id: string;
  title: string;
  description: string;
  address: string;
  district: string;
  price: number;
  deposit: number;
  availableRooms: number;
  totalRooms: number;
  propertyType: 'apartment' | 'house' | 'studio';
  amenities: string[];
  images: string[];
  ownerId: string;
  owner: User;
  isAvailable: boolean;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  updatedAt?: string;
  viewCount?: number;
  clickCount?: number;
  contactCount?: number;
  favoriteCount?: number;
  lastViewedAt?: string;
}

export interface Message {
  id: string;
  conversationId: string; 
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt?: Date;
  sender: {
    firstName: string;
    lastName: string;
  };
  receiver: {
    firstName: string;
    lastName: string;
  };
}

export interface Conversation {
  id: string;
  participants: User[];lastMessage?: Omit<Message, 'conversationId'>; 
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  userType: 'student' | 'owner';
  university?: string;
  studyLevel?: string;
}

export interface ImageFile {
  file: File;
  preview: string;
  id: string; // Identifiant unique pour la gestion
}

// Dans types.ts
export interface CreatePropertyData {
  title: string;
  description: string;
  address: string;
  district: string;
  price: number;
  deposit: number;
  availableRooms: number;
  totalRooms: number;
  propertyType: 'apartment' | 'house' | 'studio';
  amenities: string[];
  images: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface SearchFilters {
  district?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  availableRooms?: number;
  amenities?: string[];
  sort?: string;
}

// Context Types
export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile?: (profileData: Partial<User>) => Promise<void>;
  isLoading: boolean;
  verifyCIN: (verificationData: CINVerificationData) => Promise<void>; // Nouvelle méthode
}

export interface PropertyContextType {
  properties: Property[];
  loading: boolean;
  createProperty: (propertyData: CreatePropertyData) => Promise<void>;
  updateProperty: (id: string, propertyData: Partial<Property>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  searchProperties: (filters: SearchFilters) => Promise<Property[]>;
  getPropertyById?: (id: string) => Promise<Property | null>;
}

export interface MessageContextType {
  conversations: Conversation[];
  messages: Message[];
  sendMessage: (receiverId: string, content: string) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  getConversationMessages: (conversationId: string) => Promise<Message[]>;
  refreshConversations: () => void;
  refreshMessages: () => void;
  loading: boolean;
  editMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
}
export interface CINVerificationData {
  cinNumber: string;
  cinRectoImage: File;
  cinVersoImage: File;
}

// Modifier CINVerificationResult
export interface CINVerificationResult {
  success: boolean;
  extractedCIN?: string;
  cinData?: CINData;
  confidence: number;
  message: string;
  validationErrors: string[];
  details?: {
    cinNumberMatch: boolean;
    documentType: string;
    clarityScore: number;
    rectoVersoConsistency: boolean; // Nouveau champ
  };
}

export interface CINData {
  numeroCIN: string;
  nom: string;
  prenoms: string;
  dateNaissance: string;
  lieuNaissance: string;
  adresse: string;
  profession: string;
  pere: string;
  mere: string;
  dateDelivrance: string;
  lieuDelivrance: string;
}

export interface Appointment {
  id: string;
  propertyId: string;
  propertyTitle: string;
  appointmentDate: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  message: string;
  studentFirstName?: string;
  studentLastName?: string;
  studentEmail?: string;
  studentPhone?: string;
  ownerFirstName?: string;
  ownerLastName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  ownerId?: string; // Ajout de ownerId optionnel
  address?: string; // Ajout de address optionnel
}