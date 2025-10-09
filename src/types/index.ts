export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  userType: 'student' | 'owner';
  university?: string;
  studyLevel?: string;
  budget?: number;
  preferences: string[];
  bio: string;
  avatar?: string;
  isVerified: boolean;
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
  getConversationMessages?: (conversationId: string) => Promise<Message[]>;
  refreshConversations?: () => void;
  refreshMessages?: () => void;
  loading: boolean;
  
}