# Diagrammes UML de la plateforme Coloc Antananarivo

Ce document regroupe les définitions PlantUML des principaux artefacts UML du projet. Vous pouvez générer des visuels à l'aide de [PlantUML](https://plantuml.com/) ou d'un outil compatible (ex. VSCode PlantUML, IntelliJ, CLI PlantUML + Graphviz).

> Exemple de génération :
> ```bash
> plantuml docs/uml_diagrams.md
> ```

## 1. Diagramme de cas d'utilisation

```plantuml
@startuml
left to right direction
actor Etudiant
actor Proprietaire
actor Admin
actor Visiteur

rectangle "Plateforme Coloc Antananarivo" {
  usecase UC1 as "S'inscrire"
  usecase UC2 as "Se connecter"
  usecase UC3 as "Demander vérification CIN"
  usecase UC4 as "Valider/Rejeter CIN"
  usecase UC5 as "Consulter propriétés"
  usecase UC6 as "Rechercher propriétés"
  usecase UC7 as "Voir détail logement"
  usecase UC8 as "Publier logement"
  usecase UC9 as "Mettre à jour logement"
  usecase UC10 as "Planifier visite"
  usecase UC11 as "Gérer statut rendez-vous"
  usecase UC12 as "Messagerie directe"
  usecase UC13 as "Envoyer message contact"
  usecase UC14 as "Publier annonce"
  usecase UC15 as "Modérer annonces"
}

Etudiant -- UC1
Proprietaire -- UC1
Etudiant -- UC2
Proprietaire -- UC2
Admin -- UC2
Etudiant -- UC3
Proprietaire -- UC3
Admin -- UC4
Visiteur -- UC5
Etudiant -- UC5
Proprietaire -- UC5
Visiteur -- UC6
Etudiant -- UC6
Proprietaire -- UC6
Visiteur -- UC7
Etudiant -- UC7
Proprietaire -- UC7
Proprietaire -- UC8
Proprietaire -- UC9
Admin -- UC9
Etudiant -- UC10
Etudiant -- UC11
Proprietaire -- UC11
Admin -- UC11
Etudiant -- UC12
Proprietaire -- UC12
Visiteur -- UC13
Etudiant -- UC14
Proprietaire -- UC14
Admin -- UC15
@enduml
```

## 2. Diagrammes de séquence (fonctionnels & conception)

Chaque diagramme inclut des stéréotypes <<boundary>>, <<control>> et <<entity>>, ainsi que l'endpoint HTTP utilisé.

### 2.1 S'inscrire — `POST /api/auth/register`
```plantuml
@startuml
actor User as "Étudiant/Propriétaire"
boundary B as "<<boundary>>\nClient HTTP"
control C as "<<control>>\nAuthRouter.register()"
entity E as "<<entity>>\nPrisma User"

User -> B: Saisir formulaire
B -> C: POST /api/auth/register
C -> E: create user(email,…)
E --> C: Nouvel utilisateur
C --> B: 201 + token JWT
B --> User: Confirmation d'inscription
@enduml
```

### 2.2 Se connecter — `POST /api/auth/login`
```plantuml
@startuml
actor User
boundary B as "<<boundary>>\nClient HTTP"
control C as "<<control>>\nAuthRouter.login()"
entity E as "<<entity>>\nPrisma User"

User -> B: Fournir email/mot de passe
B -> C: POST /api/auth/login
C -> E: findUnique(email)
E --> C: Compte + hash
C -> C: Vérifier mot de passe
C --> B: 200 + token JWT
B --> User: Tableau de bord
@enduml
```

### 2.3 Demander vérification CIN — `POST /api/auth/verify_cin`
```plantuml
@startuml
actor User as "Étudiant/Propriétaire"
boundary B as "<<boundary>>\nClient HTTP"
control C as "<<control>>\nAuthRouter.verifyCIN()"
entity E as "<<entity>>\nPrisma User"

User -> B: Soumettre données CIN
B -> C: POST /api/auth/verify_cin (JWT)
C -> E: update user(cinNumber,…)
E --> C: Profil mis à jour
C --> B: 200 message de soumission
B --> User: Attente validation admin
@enduml
```

### 2.4 Valider/Rejeter CIN — `PUT /api/admin/cin_verify/:id`
```plantuml
@startuml
actor Admin
boundary B as "<<boundary>>\nConsole Admin"
control C as "<<control>>\nAdminRouter.cinVerify()"
entity E as "<<entity>>\nPrisma User"

Admin -> B: Choisir dossier CIN
B -> C: PUT /api/admin/cin_verify/:id (JWT admin)
C -> E: update user(cinVerified,…)
E --> C: Statut mis à jour
C --> B: 200 résultat validation
B --> Admin: Confirmation
@enduml
```

### 2.5 Consulter propriétés — `GET /api/properties/get_all`
```plantuml
@startuml
actor Visiteur
boundary B as "<<boundary>>\nClient HTTP"
control C as "<<control>>\nPropertiesRouter.getAll()"
entity E as "<<entity>>\nPrisma Property"

Visiteur -> B: Ouvrir liste logements
B -> C: GET /api/properties/get_all
C -> E: findMany(isAvailable=true)
E --> C: Liste propriétés
C -> C: Formatter JSON (images,…)
C --> B: 200 catalogue
B --> Visiteur: Affichage
@enduml
```

### 2.6 Rechercher propriétés — `GET /api/properties/search`
```plantuml
@startuml
actor Visiteur
boundary B as "<<boundary>>\nClient HTTP"
control C as "<<control>>\nPropertiesRouter.search()"
entity E as "<<entity>>\nPrisma Property"

Visiteur -> B: Définir filtres
B -> C: GET /api/properties/search?district=...
C -> C: Construire critères
C -> E: findMany(where, orderBy)
E --> C: Résultats bruts
C -> C: Filtrer par amenities
C --> B: 200 résultats filtrés
B --> Visiteur: Liste filtrée
@enduml
```

### 2.7 Voir détail logement — `GET /api/properties/get_by_id/:id`
```plantuml
@startuml
actor Visiteur
boundary B as "<<boundary>>\nClient HTTP"
control C as "<<control>>\nPropertiesRouter.getById()"
entity E as "<<entity>>\nPrisma Property"

Visiteur -> B: Sélectionner logement
B -> C: GET /api/properties/get_by_id/ID
C -> E: findUnique(id)
E --> C: Propriété + propriétaire
C -> C: Adapter formats
C --> B: 200 fiche logement
B --> Visiteur: Détails affichés
@enduml
```

### 2.8 Publier un logement — `POST /api/properties/create`
```plantuml
@startuml
actor Proprietaire
boundary B as "<<boundary>>\nClient Auth"
control C as "<<control>>\nPropertiesRouter.create()"
entity E as "<<entity>>\nPrisma Property"

Proprietaire -> B: Remplir formulaire
B -> C: POST /api/properties/create (JWT)
C -> C: Vérifier rôle owner
C -> E: create property(...)
E --> C: Propriété persistée
C --> B: 201 + logement formaté
B --> Proprietaire: Confirmation publication
@enduml
```

### 2.9 Mettre à jour un logement — `PUT /api/properties/update/:id`
```plantuml
@startuml
actor Proprietaire
boundary B as "<<boundary>>\nClient Auth"
control C as "<<control>>\nPropertiesRouter.update()"
entity E as "<<entity>>\nPrisma Property"

Proprietaire -> B: Modifier champs
B -> C: PUT /api/properties/update/ID (JWT)
C -> E: findUnique(id)
E --> C: Propriété actuelle
C -> C: Vérifier propriétaire/admin
C -> E: update property(data)
E --> C: Propriété mise à jour
C --> B: 200 nouvelle fiche
B --> Proprietaire: Confirmation
@enduml
```

### 2.10 Planifier une visite — `POST /api/appointments/create`
```plantuml
@startuml
actor Etudiant
boundary B as "<<boundary>>\nClient Auth"
control C as "<<control>>\nAppointmentsRouter.create()"
entity Prop as "<<entity>>\nPrisma Property"
entity App as "<<entity>>\nPrisma Appointment"

Etudiant -> B: Choisir date + logement
B -> C: POST /api/appointments/create (JWT)
C -> Prop: findUnique(propertyId)
Prop --> C: Logement + owner
C -> App: findFirst(conflits)
App --> C: Conflit? (null/rdv)
C -> App: create appointment(status)
App --> C: Rendez-vous créé
C --> B: 201 + statut
B --> Etudiant: Confirmation
@enduml
```

### 2.11 Gérer statut rendez-vous — `PUT /api/appointments/update_status/:id`
```plantuml
@startuml
actor Utilisateur as "Étudiant/Propriétaire/Admin"
boundary B as "<<boundary>>\nClient Auth"
control C as "<<control>>\nAppointmentsRouter.updateStatus()"
entity E as "<<entity>>\nPrisma Appointment"

Utilisateur -> B: Choisir nouveau statut
B -> C: PUT /api/appointments/update_status/ID (JWT)
C -> E: findUnique(id)
E --> C: Rendez-vous actuel
C -> C: Vérifier autorisation
C -> E: update(status)
E --> C: Rendez-vous mis à jour
C --> B: 200 confirmation
B --> Utilisateur: Statut affiché
@enduml
```

### 2.12 Messagerie directe — `POST /api/messages/send`
```plantuml
@startuml
actor Utilisateur as "Étudiant/Propriétaire"
boundary B as "<<boundary>>\nClient Auth"
control C as "<<control>>\nMessagesRouter.send()"
entity Conv as "<<entity>>\nPrisma Conversation"
entity Msg as "<<entity>>\nPrisma Message"

Utilisateur -> B: Rédiger message
B -> C: POST /api/messages/send (JWT)
C -> Conv: findFirst(par participants)
Conv --> C: Conversation existante?
C -> Conv: create/update conversation
Conv --> C: Conversation id
C -> Msg: create message(...)
Msg --> C: Message persisté
C --> B: 201 message formaté
B --> Utilisateur: Fil de discussion
@enduml
```

### 2.13 Envoyer message de contact — `POST /api/contacts/send`
```plantuml
@startuml
actor Visiteur
boundary B as "<<boundary>>\nFormulaire"
control C as "<<control>>\nContactsRouter.send()"
entity E as "<<entity>>\nPrisma ContactMessage"

Visiteur -> B: Remplir formulaire
B -> C: POST /api/contacts/send
C -> C: Valider champs requis
C -> E: create contactMessage
E --> C: Message enregistré
C --> B: 201 accusé
B --> Visiteur: Merci de votre message
@enduml
```

### 2.14 Publier une annonce — `POST /api/announcements/create`
```plantuml
@startuml
actor Utilisateur as "Étudiant/Propriétaire"
boundary B as "<<boundary>>\nClient Auth"
control C as "<<control>>\nAnnouncementsRouter.create()"
entity E as "<<entity>>\nPrisma Announcement"

Utilisateur -> B: Saisir contenu
B -> C: POST /api/announcements/create (JWT)
C -> E: create announcement(authorId,…)
E --> C: Annonce persistée
C -> C: Formatter JSON
C --> B: 201 annonce
B --> Utilisateur: Publication confirmée
@enduml
```

### 2.15 Modérer les annonces — `PUT /api/announcements/update/:id` / `DELETE`
```plantuml
@startuml
actor Admin
boundary B as "<<boundary>>\nConsole Admin"
control C as "<<control>>\nAnnouncementsRouter/AdminRouter"
entity E as "<<entity>>\nPrisma Announcement"

Admin -> B: Choisir action (éditer/supprimer)
B -> C: PUT/DELETE /api/announcements/... (JWT admin)
C -> E: findUnique(id)
E --> C: Annonce actuelle
C -> E: update/delete selon action
E --> C: Résultat
C --> B: 200 confirmation
B --> Admin: Statut modération
@enduml
```

## 3. Modèle de domaine

```plantuml
@startuml
class User {
  +id:Int
  +email:String
  +password:String?
  +firstName:String
  +lastName:String
  +phone:String
  +userType:UserType
  +cinVerified:Boolean
  ...
}
class Property {
  +id:Int
  +title:String
  +price:Decimal
  +isAvailable:Boolean
  ...
}
class Announcement {
  +id:Int
  +content:String
  +contact:String?
  ...
}
class Appointment {
  +id:Int
  +appointmentDate:DateTime
  +status:AppointmentStatus
  ...
}
class Conversation
class Message
class ContactMessage

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

User "1" --o "many" Property : owner
User "1" --o "many" Announcement : author
User "1" --o "many" Appointment : owner
User "1" --o "many" Appointment : student
User "1" -- "many" Conversation : user1/user2
Conversation "1" --o "many" Message
User "1" --o "many" Message : sender
User "1" --o "many" Message : receiver
Property "1" --o "many" Appointment
@enduml
```

## 4. Diagramme de paquetages

```plantuml
@startuml
package Frontend {
  package "React App" {
    [Pages]
    [Contexts]
    [Services]
  }
}

package Backend {
  package "Express Server" {
    package Routes {
      [Auth]
      [Properties]
      [Announcements]
      [Appointments]
      [Messages]
      [Contacts]
      [Admin]
      [Users]
    }
    package Utils {
      [auth.js]
      [response.js]
      [adminNotifier.js]
    }
  }
  package "Prisma ORM" {
    [Client]
    [Schema]
  }
}

package "External Services" {
  [PostgreSQL DB]
  [Clerk API]
}

Frontend --> Backend : Requêtes REST
Backend::Routes --> Backend::Utils
Backend::Express Server --> Prisma ORM
Prisma ORM --> "PostgreSQL DB"
Backend::Utils --> "Clerk API"
@enduml
```

## 5. Diagramme de déploiement

```plantuml
@startuml
node "Utilisateur" {
  device "Navigateur" {
    artifact "Frontend React\n(http://localhost:3000)" as Frontend
  }
}

node "Serveur d'applications" {
  node "Node.js Express" {
    artifact "Backend API\n(http://localhost:5000)" as Backend
  }
}

node "Infrastructure données" {
  database "PostgreSQL" as DB
  node "Stockage fichiers" as Storage
}

node "Service tiers" {
  artifact "Clerk Identity" as Clerk
}

Frontend --> Backend : HTTPS REST
Backend --> DB : Connexion Prisma
Backend --> Storage : Uploads (/uploads)
Backend --> Clerk : Vérification token
@enduml
```
