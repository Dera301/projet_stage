# Diagrammes UML de Séquence de Conception - Plateforme Coloc Antananarivo

## UC1 - S'inscrire (Conception)

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant B as <<boundary>>\nRegisterPage
    participant C as <<control>>\nAuthController
    participant E1 as <<entity>>\nUser
    participant E2 as <<entity>>\nClerkService
    participant DB as Base de Données

    U->>B: Remplit formulaire
    B->>B: Validation locale
    B->>C: register(userData)
    C->>E1: checkEmailExists(email)
    E1->>DB: SELECT * FROM users WHERE email
    DB-->>E1: Résultat
    E1-->>C: Email existe?
    alt Email existe
        C-->>B: Erreur 400
        B-->>U: Afficher erreur
    else Email disponible
        opt Clerk configuré
            C->>E2: createUser(userData)
            E2-->>C: clerkId
        end
        C->>E1: hashPassword(password)
        E1-->>C: hashedPassword
        C->>E1: create(userData)
        E1->>DB: INSERT INTO users
        DB-->>E1: User créé
        E1-->>C: User
        C->>C: generateJWT(user)
        C-->>B: {user, token}
        B->>B: setAuthToken(token)
        B-->>U: Redirection dashboard
    end
```

## UC12 - Publier logement (Conception)

```mermaid
sequenceDiagram
    participant O as Propriétaire
    participant B as <<boundary>>\nCreatePropertyPage
    participant C as <<control>>\nPropertyController
    participant E1 as <<entity>>\nProperty
    participant E2 as <<entity>>\nUser
    participant DB as Base de Données

    O->>B: Remplit formulaire propriété
    B->>B: Validation formulaire
    B->>C: createProperty(propertyData)
    C->>C: verifyJWT(token)
    C->>E2: getCurrentUser(userId)
    E2->>DB: SELECT * FROM users WHERE id
    DB-->>E2: User
    E2-->>C: User
    C->>E1: create(propertyData, ownerId)
    E1->>DB: INSERT INTO properties
    DB-->>E1: Property créée
    E1-->>C: Property
    C-->>B: {property}
    B-->>O: Redirection liste propriétés
```

## UC15 - Planifier visite (Conception)

```mermaid
sequenceDiagram
    participant S as Étudiant
    participant B as <<boundary>>\nPropertyDetailPage
    participant C as <<control>>\nAppointmentController
    participant E1 as <<entity>>\nAppointment
    participant E2 as <<entity>>\nProperty
    participant E3 as <<entity>>\nUser
    participant DB as Base de Données

    S->>B: Clique "Planifier visite"
    B->>B: Affiche modal rendez-vous
    S->>B: Sélectionne date/heure
    B->>C: createAppointment(appointmentData)
    C->>C: verifyJWT(token)
    C->>E2: getById(propertyId)
    E2->>DB: SELECT * FROM properties WHERE id
    DB-->>E2: Property
    E2-->>C: Property
    C->>E3: getById(property.ownerId)
    E3->>DB: SELECT * FROM users WHERE id
    DB-->>E3: Owner
    E3-->>C: Owner
    C->>E1: create(appointmentData, studentId, ownerId, propertyId)
    E1->>DB: INSERT INTO appointments
    DB-->>E1: Appointment créé
    E1-->>C: Appointment
    C-->>B: {appointment}
    B-->>S: Confirmation
```

## UC17 - Messagerie directe (Conception)

```mermaid
sequenceDiagram
    participant U1 as Utilisateur 1
    participant B as <<boundary>>\nMessagesPage
    participant C as <<control>>\nMessageController
    participant E1 as <<entity>>\nConversation
    participant E2 as <<entity>>\nMessage
    participant DB as Base de Données

    U1->>B: Écrit message
    B->>C: sendMessage(messageData)
    C->>C: verifyJWT(token)
    C->>E1: findOrCreate(senderId, receiverId)
    E1->>DB: SELECT * FROM conversations WHERE...
    alt Conversation existe
        DB-->>E1: Conversation
    else Conversation n'existe pas
        E1->>DB: INSERT INTO conversations
        DB-->>E1: Conversation créée
    end
    E1-->>C: Conversation
    C->>E2: create(content, conversationId, senderId, receiverId)
    E2->>DB: INSERT INTO messages
    DB-->>E2: Message créé
    E2-->>C: Message
    C-->>B: {message}
    B-->>U1: Message affiché
```

## UC8 - Valider/Rejeter CIN (Conception)

```mermaid
sequenceDiagram
    participant A as Admin
    participant B as <<boundary>>\nAdminPage
    participant C as <<control>>\nAdminController
    participant E1 as <<entity>>\nUser
    participant E2 as <<entity>>\nNotificationService
    participant DB as Base de Données

    A->>B: Consulte CINs en attente
    B->>C: getCINsToVerify()
    C->>C: verifyAdminRole(token)
    C->>E1: findPendingCINs()
    E1->>DB: SELECT * FROM users WHERE cinVerified = false
    DB-->>E1: Liste utilisateurs
    E1-->>C: Users
    C-->>B: {users}
    B-->>A: Affiche liste CINs
    A->>B: Valide ou rejette CIN
    B->>C: verifyCIN(userId, status)
    C->>C: verifyAdminRole(token)
    C->>E1: updateCINStatus(userId, status)
    E1->>DB: UPDATE users SET cinVerified = ...
    DB-->>E1: User mis à jour
    E1-->>C: User
    C->>E2: notifyUser(userId, status)
    E2-->>C: Notification envoyée
    C-->>B: Confirmation
    B-->>A: Message de succès
```

## UC10 - Rechercher propriétés (Conception)

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant B as <<boundary>>\nSearchPage
    participant C as <<control>>\nPropertyController
    participant E1 as <<entity>>\nProperty
    participant DB as Base de Données

    U->>B: Applique filtres (district, prix, type)
    B->>C: searchProperties(filters)
    C->>E1: findByFilters(filters)
    E1->>DB: SELECT * FROM properties WHERE district = ? AND price <= ? AND propertyType = ?
    DB-->>E1: Liste propriétés
    E1-->>C: Properties
    C-->>B: {properties}
    B-->>U: Affiche résultats filtrés
```

## UC19 - Publier annonce (Conception)

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant B as <<boundary>>\nCreateAnnouncementPage
    participant C as <<control>>\nAnnouncementController
    participant E1 as <<entity>>\nAnnouncement
    participant E2 as <<entity>>\nUser
    participant DB as Base de Données

    U->>B: Remplit formulaire annonce
    B->>B: Validation formulaire
    B->>C: createAnnouncement(announcementData)
    C->>C: verifyJWT(token)
    C->>E2: getCurrentUser(userId)
    E2->>DB: SELECT * FROM users WHERE id
    DB-->>E2: User
    E2-->>C: User
    C->>E1: create(announcementData, authorId)
    E1->>DB: INSERT INTO announcements
    DB-->>E1: Announcement créée
    E1-->>C: Announcement
    C-->>B: {announcement}
    B-->>U: Redirection liste annonces
```

## UC5 - Modifier profil (Conception)

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant B as <<boundary>>\nProfilePage
    participant C as <<control>>\nUserController
    participant E1 as <<entity>>\nUser
    participant E2 as <<entity>>\nImageUploadService
    participant DB as Base de Données

    U->>B: Modifie informations profil
    opt Upload photo
        U->>B: Sélectionne image
        B->>E2: uploadImage(file)
        E2-->>B: imageUrl
    end
    B->>C: updateProfile(userData)
    C->>C: verifyJWT(token)
    C->>E1: update(userId, userData)
    E1->>DB: UPDATE users SET ...
    DB-->>E1: User mis à jour
    E1-->>C: User
    C-->>B: {user}
    B-->>U: Profil mis à jour
```

