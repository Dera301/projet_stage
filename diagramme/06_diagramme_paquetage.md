# Diagramme de Paquetage - Plateforme Coloc Antananarivo

## Structure des Paquetages

```mermaid
graph TB
    subgraph "Frontend"
        subgraph "Pages"
            P1[HomePage]
            P2[LoginPage]
            P3[RegisterPage]
            P4[DashboardPage]
            P5[ProfilePage]
            P6[PropertyListPage]
            P7[PropertyDetailPage]
            P8[CreatePropertyPage]
            P9[SearchPage]
            P10[MessagesPage]
            P11[AnnouncementsPage]
            P12[AdminPage]
            P13[AppointmentsPage]
        end
        
        subgraph "Components"
            C1[Navbar]
            C2[Footer]
            C3[ProtectedRoute]
            C4[AdminRoute]
            C5[ScheduleAppointmentModal]
            C6[CINVerificationModal]
        end
        
        subgraph "Contexts"
            CT1[AuthContext]
            CT2[PropertyContext]
            CT3[MessageContext]
            CT4[AnnouncementContext]
        end
        
        subgraph "Services"
            S1[imageUploadService]
            S2[cinVerificationService]
        end
        
        subgraph "Utils"
            U1[storage]
            U2[animations]
        end
        
        subgraph "Config"
            CF1[config.ts]
        end
    end
    
    subgraph "Backend"
        subgraph "Routes"
            R1[auth.js]
            R2[properties.js]
            R3[announcements.js]
            R4[messages.js]
            R5[appointments.js]
            R6[contacts.js]
            R7[admin.js]
            R8[users.js]
            R9[upload.js]
        end
        
        subgraph "Utils"
            BU1[auth.js]
            BU2[response.js]
            BU3[adminNotifier.js]
            BU4[mailer.js]
            BU5[prisma.js]
        end
        
        subgraph "Prisma"
            PR1[schema.prisma]
            PR2[migrations]
        end
        
        subgraph "Server"
            SV1[server.js]
            SV2[api/index.js]
        end
    end
    
    subgraph "External Services"
        EXT1[PostgreSQL Database]
        EXT2[Clerk API]
        EXT3[Vercel Platform]
    end
    
    P1 --> CT1
    P1 --> CT2
    P2 --> CT1
    P3 --> CT1
    P4 --> CT1
    P4 --> CT2
    P5 --> CT1
    P5 --> S1
    P6 --> CT2
    P7 --> CT2
    P8 --> CT2
    P9 --> CT2
    P10 --> CT3
    P11 --> CT4
    P12 --> CT1
    
    CT1 --> CF1
    CT2 --> CF1
    CT3 --> CF1
    CT4 --> CF1
    
    S1 --> CF1
    S2 --> CF1
    
    CF1 --> R1
    CF1 --> R2
    CF1 --> R3
    
    R1 --> BU1
    R1 --> BU2
    R2 --> BU2
    R3 --> BU2
    R4 --> BU2
    R5 --> BU2
    R6 --> BU2
    R7 --> BU1
    R7 --> BU2
    R7 --> BU3
    R8 --> BU2
    R9 --> BU2
    
    BU1 --> PR1
    BU2 --> PR1
    BU3 --> EXT2
    BU5 --> PR1
    
    PR1 --> EXT1
    SV1 --> R1
    SV1 --> R2
    SV1 --> R3
    SV1 --> R4
    SV1 --> R5
    SV1 --> R6
    SV1 --> R7
    SV1 --> R8
    SV1 --> R9
    SV2 --> SV1
    
    SV2 --> EXT3
```

## Description des Paquetages

### Frontend

#### Pages
Contient toutes les pages de l'application React :
- Pages publiques : HomePage, LoginPage, RegisterPage
- Pages protégées : DashboardPage, ProfilePage, PropertyListPage, etc.
- Pages admin : AdminPage

#### Components
Composants réutilisables :
- Navigation : Navbar, Footer
- Sécurité : ProtectedRoute, AdminRoute
- Modales : ScheduleAppointmentModal, CINVerificationModal

#### Contexts
Gestion d'état global avec React Context :
- AuthContext : Authentification et profil utilisateur
- PropertyContext : Gestion des propriétés
- MessageContext : Messagerie
- AnnouncementContext : Annonces

#### Services
Services pour les opérations externes :
- imageUploadService : Upload d'images
- cinVerificationService : Vérification CIN

### Backend

#### Routes
Routes API Express organisées par domaine :
- auth.js : Authentification
- properties.js : Gestion des propriétés
- announcements.js : Gestion des annonces
- messages.js : Messagerie
- appointments.js : Rendez-vous
- contacts.js : Messages de contact
- admin.js : Administration
- users.js : Gestion utilisateurs
- upload.js : Upload de fichiers

#### Utils
Utilitaires backend :
- auth.js : Vérification JWT, gestion tokens
- response.js : Formatage des réponses API
- adminNotifier.js : Notifications admin
- mailer.js : Envoi d'emails
- prisma.js : Client Prisma

#### Prisma
ORM et schéma de base de données :
- schema.prisma : Définition des modèles
- migrations : Migrations de base de données

### External Services

#### PostgreSQL Database
Base de données relationnelle pour le stockage des données

#### Clerk API
Service d'authentification externe (optionnel)

#### Vercel Platform
Plateforme de déploiement serverless

## Dépendances entre Paquetages

1. **Frontend → Backend** : Communication via API REST
2. **Backend Routes → Utils** : Utilisation des utilitaires
3. **Backend Utils → Prisma** : Accès à la base de données
4. **Prisma → PostgreSQL** : Connexion à la base de données
5. **Backend → Clerk** : Authentification externe
6. **Backend → Vercel** : Déploiement serverless

