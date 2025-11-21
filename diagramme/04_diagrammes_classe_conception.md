# Diagrammes de Classe de Conception - Utilisateurs uniquement

## Diagramme de Classe Principal (Utilisateurs)

```mermaid
classDiagram
    class User {
        +int id
        +string email
        +string firstName
        +string lastName
        +string phone
        +UserType userType
        +string university
        +string studyLevel
        +decimal budget
        +string bio
        +string avatar
        +boolean cinVerified
        +string cinNumber
        +boolean isVerified
        +DateTime createdAt
        +DateTime updatedAt
        +register(userData) User
        +login(email, password) Token
        +updateProfile(userData) User
        +verifyCIN(cinData) boolean
        +getProfile() User
    }

    class Student {
        +searchProperties(filters) Property[]
        +createAppointment(propertyId, date) Appointment
        +sendMessage(receiverId, content) Message
        +createAnnouncement(announcementData) Announcement
        +viewPropertyDetails(propertyId) Property
    }

    class Owner {
        +createProperty(propertyData) Property
        +updateProperty(propertyId, propertyData) Property
        +deleteProperty(propertyId) boolean
        +manageAppointments() Appointment[]
        +confirmAppointment(appointmentId) Appointment
        +cancelAppointment(appointmentId) Appointment
    }

    class Admin {
        +getAllUsers() User[]
        +updateUserRole(userId, role) User
        +deleteUser(userId) boolean
        +verifyCIN(userId, status) boolean
        +getCINsToVerify() User[]
        +getAllProperties() Property[]
        +togglePropertyAvailability(propertyId) Property
        +getAllAnnouncements() Announcement[]
        +deleteAnnouncement(announcementId) boolean
        +getStatistics() Statistics
    }

    class Invite {
        +viewProperties() Property[]
        +searchProperties(filters) Property[]
        +viewPropertyDetails(propertyId) Property
        +sendContactMessage(messageData) boolean
        +viewAnnouncements() Announcement[]
    }

    User <|-- Student
    User <|-- Owner
    User <|-- Admin
    User <|-- Invite

    note for Student "Hérite de User\nAccès limité aux fonctionnalités étudiant"
    note for Owner "Hérite de User\nPeut gérer ses propriétés"
    note for Admin "Hérite de User\nAccès complet à l'administration"
    note for Invite "Utilisateur non authentifié\nAccès limité en lecture"
```

## Diagramme de Classe - Relations Utilisateurs

```mermaid
classDiagram
    class User {
        +int id
        +string email
        +string firstName
        +string lastName
        +UserType userType
    }

    class Property {
        +int id
        +string title
        +decimal price
        +int ownerId
    }

    class Appointment {
        +int id
        +int propertyId
        +int studentId
        +int ownerId
        +DateTime appointmentDate
        +AppointmentStatus status
    }

    class Message {
        +int id
        +int senderId
        +int receiverId
        +string content
        +boolean isRead
    }

    class Announcement {
        +int id
        +int authorId
        +string content
    }

    class Conversation {
        +int id
        +int user1Id
        +int user2Id
    }

    User "1" --> "*" Property : owns
    User "1" --> "*" Appointment : creates (as student)
    User "1" --> "*" Appointment : receives (as owner)
    User "1" --> "*" Message : sends
    User "1" --> "*" Message : receives
    User "1" --> "*" Announcement : creates
    User "1" --> "*" Conversation : participates
    Property "1" --> "*" Appointment : has
    Conversation "1" --> "*" Message : contains
```

## Diagramme de Classe - Vues par Rôle

### Vue Étudiant

```mermaid
classDiagram
    class Student {
        +int id
        +string email
        +string firstName
        +string lastName
        +string university
        +string studyLevel
        +decimal budget
        +searchProperties(filters) Property[]
        +viewPropertyDetails(propertyId) Property
        +createAppointment(propertyId, date) Appointment
        +getMyAppointments() Appointment[]
        +sendMessage(receiverId, content) Message
        +getConversations() Conversation[]
        +createAnnouncement(data) Announcement
        +updateProfile(data) User
        +uploadAvatar(file) string
    }

    class Property {
        +int id
        +string title
        +decimal price
        +string district
    }

    class Appointment {
        +int id
        +DateTime appointmentDate
        +AppointmentStatus status
    }

    Student --> Property : views
    Student --> Appointment : creates
```

### Vue Propriétaire

```mermaid
classDiagram
    class Owner {
        +int id
        +string email
        +string firstName
        +string lastName
        +createProperty(data) Property
        +updateProperty(id, data) Property
        +deleteProperty(id) boolean
        +getMyProperties() Property[]
        +getAppointmentsForProperty(propertyId) Appointment[]
        +confirmAppointment(id) Appointment
        +cancelAppointment(id) Appointment
        +sendMessage(receiverId, content) Message
        +createAnnouncement(data) Announcement
    }

    class Property {
        +int id
        +string title
        +decimal price
    }

    class Appointment {
        +int id
        +AppointmentStatus status
    }

    Owner "1" --> "*" Property : owns
    Property "1" --> "*" Appointment : receives
    Owner --> Appointment : manages
```

### Vue Administrateur

```mermaid
classDiagram
    class Admin {
        +int id
        +string email
        +string firstName
        +string lastName
        +getAllUsers() User[]
        +updateUserRole(userId, role) User
        +deleteUser(userId) boolean
        +getCINsToVerify() User[]
        +verifyCIN(userId, status) boolean
        +getAllProperties() Property[]
        +togglePropertyAvailability(propertyId) Property
        +getAllAnnouncements() Announcement[]
        +deleteAnnouncement(id) boolean
        +getStatistics() Statistics
    }

    class User {
        +int id
        +UserType userType
        +boolean cinVerified
    }

    class Property {
        +int id
        +boolean isAvailable
    }

    class Announcement {
        +int id
    }

    Admin --> User : manages
    Admin --> Property : moderates
    Admin --> Announcement : moderates
```

### Vue Invité

```mermaid
classDiagram
    class Invite {
        +viewProperties() Property[]
        +searchProperties(filters) Property[]
        +viewPropertyDetails(propertyId) Property
        +sendContactMessage(data) boolean
        +viewAnnouncements() Announcement[]
        +viewAnnouncementDetails(id) Announcement
    }

    class Property {
        +int id
        +string title
        +decimal price
    }

    class ContactMessage {
        +string name
        +string email
        +string message
    }

    Invite --> Property : views
    Invite --> ContactMessage : sends
```

