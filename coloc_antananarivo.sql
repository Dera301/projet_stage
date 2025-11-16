-- Active la compatibilité avec les timestamps
SET TIME ZONE 'UTC';

-- TABLE users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    userType VARCHAR(10) CHECK (userType IN ('student','owner','admin')) NOT NULL,
    university VARCHAR(255),
    studyLevel VARCHAR(100),
    bio TEXT,
    avatar VARCHAR(255),
    budget NUMERIC(10,2),
    cin_number VARCHAR(12),
    cin_data TEXT,
    cin_verified BOOLEAN DEFAULT FALSE,
    cin_recto_image_path VARCHAR(255),
    cin_verso_image_path VARCHAR(255),
    cin_verification_confidence REAL,
    cin_verification_errors TEXT,
    cin_verified_at TIMESTAMP,
    cin_verification_requested_at TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    account_activation_deadline TIMESTAMP
);

-- TABLE announcements
CREATE TABLE announcements (
    id SERIAL PRIMARY KEY,
    authorId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    images TEXT,
    contact VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLE contact_messages
CREATE TABLE contact_messages (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLE conversations
CREATE TABLE conversations (
    id SERIAL PRIMARY KEY,
    user1_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unreadCount INTEGER DEFAULT 0
);

-- TABLE messages
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    conversationId INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    senderId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiverId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    isRead BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLE properties
CREATE TABLE properties (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    address TEXT NOT NULL,
    district VARCHAR(100) NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    deposit NUMERIC(10,2) NOT NULL,
    availableRooms INTEGER NOT NULL,
    totalRooms INTEGER NOT NULL,
    propertyType VARCHAR(20) CHECK (propertyType IN ('apartment','house','studio')) NOT NULL,
    amenities TEXT,
    images TEXT,
    ownerId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    isAvailable BOOLEAN DEFAULT TRUE,
    latitude NUMERIC(10,8),
    longitude NUMERIC(11,8),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLE appointments
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    propertyId INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    studentId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ownerId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    appointmentDate TIMESTAMP NOT NULL,
    status VARCHAR(15) CHECK (status IN ('pending','confirmed','cancelled','completed')) DEFAULT 'pending',
    message TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

  generator client {
    provider = "prisma-client"
    output   = "../src/generated/prisma"
  }


datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                        Int       @id @default(autoincrement())
  email                     String    @unique @db.VarChar(255)
  password                  String?   @db.VarChar(255)
  firstName                 String    @db.VarChar(100)
  lastName                  String    @db.VarChar(100)
  phone                     String    @db.VarChar(20)
  userType                  UserType  @default(student)
  university                String?   @db.VarChar(255)
  studyLevel                String?   @db.VarChar(100)
  bio                       String?   @db.Text
  avatar                    String?   @db.VarChar(255)
  budget                    Decimal?  @db.Decimal(10, 2)
  cinNumber                 String?   @db.VarChar(12)
  cinData                   String?   @db.Text
  cinVerified               Boolean   @default(false)
  cinRectoImagePath         String?   @db.VarChar(255)
  cinVersoImagePath         String?   @db.VarChar(255)
  cinVerificationConfidence Float?
  cinVerificationErrors     String?   @db.Text
  cinVerifiedAt             DateTime?
  cinVerificationRequestedAt DateTime?
  isVerified                Boolean   @default(false)
  clerkId                   String?   @unique @db.VarChar(255)
  accountActivationDeadline DateTime?
  createdAt                 DateTime  @default(now())
  updatedAt                 DateTime  @updatedAt

  // Relations
  properties                Property[]
  announcements             Announcement[]
  sentMessages              Message[]  @relation("SentMessages")
  receivedMessages          Message[]  @relation("ReceivedMessages")
  conversationsAsUser1      Conversation[] @relation("User1Conversations")
  conversationsAsUser2      Conversation[] @relation("User2Conversations")
  appointmentsAsStudent     Appointment[] @relation("StudentAppointments")
  appointmentsAsOwner       Appointment[] @relation("OwnerAppointments")

  @@map("users")
}

model Property {
  id            Int         @id @default(autoincrement())
  title         String      @db.VarChar(255)
  description   String      @db.Text
  address       String      @db.Text
  district      String      @db.VarChar(100)
  price         Decimal     @db.Decimal(10, 2)
  deposit       Decimal     @db.Decimal(10, 2)
  availableRooms Int
  totalRooms    Int
  propertyType  PropertyType
  amenities     String?     @db.Text
  images        String?     @db.Text
  ownerId       Int
  isAvailable   Boolean     @default(true)
  latitude      Decimal?    @db.Decimal(10, 8)
  longitude     Decimal?    @db.Decimal(11, 8)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  // Relations
  owner         User        @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  appointments  Appointment[]

  @@map("properties")
}

model Announcement {
  id        Int      @id @default(autoincrement())
  authorId  Int
  content   String   @db.Text
  images    String?  @db.Text
  contact   String?  @db.VarChar(255)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)

  @@map("announcements")
}

model ContactMessage {
  id        Int      @id @default(autoincrement())
  name      String   @db.VarChar(255)
  email     String   @db.VarChar(255)
  subject   String   @db.VarChar(255)
  message   String   @db.Text
  createdAt DateTime @default(now())

  @@map("contact_messages")
}

model Conversation {
  id          Int       @id @default(autoincrement())
  user1Id     Int
  user2Id     Int
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  unreadCount Int       @default(0)

  // Relations
  user1       User      @relation("User1Conversations", fields: [user1Id], references: [id], onDelete: Cascade)
  user2       User      @relation("User2Conversations", fields: [user2Id], references: [id], onDelete: Cascade)
  messages    Message[]

  @@map("conversations")
}

model Message {
  id             Int       @id @default(autoincrement())
  conversationId Int
  senderId       Int
  receiverId     Int
  content        String    @db.Text
  isRead         Boolean   @default(false)
  createdAt      DateTime  @default(now())

  // Relations
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  sender         User      @relation("SentMessages", fields: [senderId], references: [id], onDelete: Cascade)
  receiver       User      @relation("ReceivedMessages", fields: [receiverId], references: [id], onDelete: Cascade)

  @@map("messages")
}

model Appointment {
  id             Int            @id @default(autoincrement())
  propertyId     Int
  studentId      Int
  ownerId        Int
  appointmentDate DateTime
  status         AppointmentStatus @default(pending)
  message        String?        @db.Text
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  // Relations
  property       Property       @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  student        User           @relation("StudentAppointments", fields: [studentId], references: [id], onDelete: Cascade)
  owner          User           @relation("OwnerAppointments", fields: [ownerId], references: [id], onDelete: Cascade)

  @@map("appointments")
}

enum UserType {
  student
  owner
  admin
}

enum PropertyType {
  apartment
  house
  studio
}

enum AppointmentStatus {
  pending
  confirmed
  cancelled
  completed
}


DATABASE_URL="postgresql://postgres:dera@localhost:5432/coloc_antananarivo"
CLERK_PUBLISHABLE_KEY="pk_test_dG9wLWRvbmtleS05OC5jbGVyay5hY2NvdW50cy5kZXYk"
CLERK_SECRET_KEY="sk_test_eWXkZcnYH1BDRGeNe9x3ITMUxsuVGIeYV5HobOCDW2"
FRONTEND_URL="http://localhost:3000"
PORT=5000