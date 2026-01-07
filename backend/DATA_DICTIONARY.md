| Donnée                | Description                                  | Type    | Taille / Notes                   |
|-----------------------|----------------------------------------------|---------|---------------------------------|
| Appointment.date      | Date du rendez-vous                          | Date    |                                 |
| Appointment.id        | Identifiant unique rendez-vous                | N       | Auto-increment                  |
| Appointment.ownerId   | ID propriétaire                              | N       | clé étrangère vers User        |
| Appointment.status    | Statut du rendez-vous                        | AN      | Enum (ex: pending, confirmed)  |
| Appointment.studentId | ID étudiant                                 | N       | clé étrangère vers User        |
| Appointment.updatedAt | Date mise à jour                            | Date    | auto update                  |
| Appointment.createdAt | Date création                               | Date    | default now()                 |
| Announcement.authorId | ID de l'auteur (utilisateur)                  | N       | clé étrangère vers User        |
| Announcement.content  | Contenu de l'annonce                          | A       | Texte                         |
| Announcement.createdAt| Date création                               | Date    | default now()                 |
| Announcement.id       | Identifiant unique annonce                    | N       | Auto-increment                  |
| Announcement.images   | Images associées                              | A       | Texte, optionnel              |
| Announcement.updatedAt| Date mise à jour                            | Date    | auto update                  |
| Property.address      | Adresse complète                              | A       | Texte                         |
| Property.amenities    | Équipements (ex: wifi, parking)                | A       | Texte, optionnel              |
| Property.availableRooms| Nombre de chambres disponibles                | N       |                                 |
| Property.createdAt    | Date création                               | Date    | default now()                 |
| Property.deposit      | Dépôt de garantie                            | N       | Decimal(10,2)                  |
| Property.description  | Description du logement                       | A       | Texte                         |
| Property.district     | Quartier                                     | A       | varchar(100)                   |
| Property.id           | Identifiant unique logement                   | N       | Auto-increment                  |
| Property.images       | Chemins images                               | A       | Texte, optionnel              |
| Property.isAvailable  | Disponibilité                               | Booléen | default true                  |
| Property.latitude     | Latitude (optionnel)                         | N       | Decimal(10,8)                 |
| Property.longitude    | Longitude (optionnel)                        | N       | Decimal(11,8)                 |
| Property.ownerId      | ID du propriétaire                           | N       | clé étrangère vers User       |
| Property.price        | Prix mensuel                                 | N       | Decimal(10,2)                  |
| Property.propertyType | Type de logement (ex: appartement, maison)   | AN      | Enum PropertyType              |
| Property.title        | Titre de l'annonce                            | A       | varchar(255)                   |
| Property.totalRooms   | Nombre total de chambres                       | N       |                                 |
| Property.updatedAt    | Date mise à jour                            | Date    | auto update                  |
| User.accountActivationDeadline | Date limite activation compte         | Date    |                                 |
| User.avatar           | Chemin vers avatar (optionnel)                | A       | Texte                         |
| User.bio              | Biographie (optionnel)                        | A       | Texte                         |
| User.budget           | Budget utilisateur (optionnel)                | N       | Decimal(10,2)                  |
| User.cinNumber        | Numéro CIN (optionnel)                        | AN      | varchar(12)                   |
| User.cinRectoImagePath| Image recto CIN (optionnel)                    | A       | Texte                         |
| User.cinVerificationConfidence | Confiance vérification CIN           | N       | Float                        |
| User.cinVerificationErrors | Erreurs vérification CIN                  | A       | Texte                         |
| User.cinVerified      | CIN vérifié ou non                            | Booléen |                                 |
| User.cinVerifiedAt    | Date de vérification CIN                      | Date    |                                 |
| User.cinVersoImagePath| Image verso CIN (optionnel)                    | A       | Texte                         |
| User.createdAt        | Date création                                 | Date    | default now()                  |
| User.email            | Email utilisateur                             | AN      | Unique, varchar(255)            |
| User.firstName        | Prénom utilisateur                            | A       | varchar(100)                   |
| User.id               | Identifiant unique utilisateur                | N       | Auto-increment                  |
| User.isVerified       | Utilisateur vérifié ou non                    | Booléen |                                 |
| User.lastLogin        | Date dernière connexion                        | Date    |                                 |
| User.lastName         | Nom utilisateur                              | A       | varchar(100)                   |
| User.phone            | Téléphone utilisateur                         | AN      | varchar(20)                    |
| User.status           | Statut utilisateur                            | AN      | Enum UserStatus                 |
| User.studyLevel       | Niveau d'étude (optionnel)                    | A       | varchar(100)                   |
| User.university       | Université (optionnel)                        | A       | varchar(255)                   |
| User.updatedAt        | Date mise à jour                              | Date    | auto update                   |
| User.userType         | Type utilisateur (ex: student, owner)        | AN      | Enum UserType                  |
| User.verificationCode | Code de vérification (optionnel)             | A       | varchar(10)                   |
| User.verificationExpires | Expiration code vérification                | Date    |                                 |
| User.verificationRequestedAt | Date demande vérification CIN           | Date    |                                 |
| VerificationCode.code | Code de vérification                          | A       | varchar(10)                   |
| VerificationCode.createdAt | Date création code vérification             | Date    | default now()                  |
| VerificationCode.expiresAt | Expiration code vérification                | Date    |                                 |
| VerificationCode.id   | Identifiant unique code vérification          | N       | Auto-increment                  |
| VerificationCode.type | Type de code (ex: EMAIL_VERIFICATION)         | A       | varchar(50)                   |
| VerificationCode.used | Code utilisé ou non                           | Booléen |                                 |
| VerificationCode.userId | ID utilisateur associé                       | N       | clé étrangère vers User        |

