# Dictionnaire des Données du Système - Plateforme Coloc Antananarivo

## Format du Tableau

| Nom de la rubrique | Description | Type | Taille | Observation |
|-------------------|-------------|------|--------|-------------|

**Légende des types :**
- **A** : Alphabétique
- **N** : Numérique
- **AN** : Alphanumérique
- **Date** : Date/Heure
- **Booléen** : Vrai/Faux

---

## Dictionnaire des Données (Ordre Alphabétique)

| Nom de la rubrique | Description | Type | Taille | Observation |
|-------------------|-------------|------|--------|-------------|
| Announcement.authorId | Identifiant de l'auteur de l'annonce | N | Auto-increment | Clé étrangère vers User |
| Announcement.contact | Informations de contact associées à l'annonce | A | Texte | Optionnel |
| Announcement.content | Contenu textuel de l'annonce | A | Texte | Obligatoire |
| Announcement.createdAt | Date et heure de création de l'annonce | Date | DateTime | Valeur par défaut : maintenant |
| Announcement.id | Identifiant unique de l'annonce | N | Auto-increment | Clé primaire |
| Announcement.images | Chemins vers les images de l'annonce | A | Texte | Optionnel, format JSON ou chaîne séparée |
| Announcement.updatedAt | Date et heure de dernière modification | Date | DateTime | Mise à jour automatique |
| Appointment.appointmentDate | Date et heure du rendez-vous | Date | DateTime | Obligatoire |
| Appointment.cancellationReason | Raison de l'annulation du rendez-vous | A | Texte | Optionnel, requis si statut = CANCELLED |
| Appointment.createdAt | Date et heure de création du rendez-vous | Date | DateTime | Valeur par défaut : maintenant |
| Appointment.id | Identifiant unique du rendez-vous | N | Auto-increment | Clé primaire |
| Appointment.message | Message associé à la demande de rendez-vous | A | Texte | Optionnel |
| Appointment.ownerId | Identifiant du propriétaire de la propriété | N | Auto-increment | Clé étrangère vers User |
| Appointment.propertyId | Identifiant de la propriété concernée | N | Auto-increment | Clé étrangère vers Property |
| Appointment.status | Statut du rendez-vous | AN | Enum | Valeurs : PENDING, CONFIRMED, CANCELLED, COMPLETED |
| Appointment.studentId | Identifiant de l'étudiant demandeur | N | Auto-increment | Clé étrangère vers User |
| Appointment.updatedAt | Date et heure de dernière modification | Date | DateTime | Mise à jour automatique |
| ContactMessage.createdAt | Date et heure de création du message de contact | Date | DateTime | Valeur par défaut : maintenant |
| ContactMessage.email | Adresse email de l'expéditeur | AN | varchar(255) | Obligatoire |
| ContactMessage.id | Identifiant unique du message de contact | N | Auto-increment | Clé primaire |
| ContactMessage.message | Contenu du message de contact | A | Texte | Obligatoire |
| ContactMessage.name | Nom de l'expéditeur du message | A | varchar(255) | Obligatoire |
| ContactMessage.subject | Sujet du message de contact | A | varchar(255) | Obligatoire |
| Conversation.createdAt | Date et heure de création de la conversation | Date | DateTime | Valeur par défaut : maintenant |
| Conversation.id | Identifiant unique de la conversation | N | Auto-increment | Clé primaire |
| Conversation.unreadCount | Nombre de messages non lus dans la conversation | N | Entier | Valeur par défaut : 0 |
| Conversation.updatedAt | Date et heure de dernière modification | Date | DateTime | Mise à jour automatique |
| Conversation.user1Id | Identifiant du premier utilisateur | N | Auto-increment | Clé étrangère vers User |
| Conversation.user2Id | Identifiant du second utilisateur | N | Auto-increment | Clé étrangère vers User |
| Message.content | Contenu textuel du message | A | Texte | Obligatoire |
| Message.conversationId | Identifiant de la conversation | N | Auto-increment | Clé étrangère vers Conversation |
| Message.createdAt | Date et heure d'envoi du message | Date | DateTime | Valeur par défaut : maintenant |
| Message.id | Identifiant unique du message | N | Auto-increment | Clé primaire |
| Message.isRead | Indicateur de lecture du message | Booléen | Boolean | Valeur par défaut : false |
| Message.receiverId | Identifiant du destinataire | N | Auto-increment | Clé étrangère vers User |
| Message.senderId | Identifiant de l'expéditeur | N | Auto-increment | Clé étrangère vers User |
| PendingRegistration.attempts | Nombre de tentatives de vérification | N | Entier | Valeur par défaut : 0 |
| PendingRegistration.avatar | Chemin vers l'avatar (optionnel) | A | Texte | Optionnel |
| PendingRegistration.budget | Budget de l'utilisateur (optionnel) | N | Decimal(10,2) | Optionnel |
| PendingRegistration.createdAt | Date et heure de création | Date | DateTime | Valeur par défaut : maintenant |
| PendingRegistration.email | Adresse email de l'inscription en attente | AN | varchar(255) | Unique, obligatoire |
| PendingRegistration.firstName | Prénom de l'utilisateur | A | varchar(100) | Obligatoire |
| PendingRegistration.id | Identifiant unique de l'inscription en attente | N | Auto-increment | Clé primaire |
| PendingRegistration.lastName | Nom de l'utilisateur | A | varchar(100) | Obligatoire |
| PendingRegistration.passwordHash | Hash du mot de passe | A | varchar(255) | Obligatoire |
| PendingRegistration.phone | Numéro de téléphone | AN | varchar(20) | Obligatoire |
| PendingRegistration.studyLevel | Niveau d'étude (optionnel) | A | varchar(100) | Optionnel |
| PendingRegistration.university | Université (optionnel) | A | varchar(255) | Optionnel |
| PendingRegistration.updatedAt | Date et heure de dernière modification | Date | DateTime | Mise à jour automatique |
| PendingRegistration.userType | Type d'utilisateur | AN | Enum | Valeurs : STUDENT, OWNER |
| PendingRegistration.verificationCode | Code de vérification | A | varchar(10) | Obligatoire |
| PendingRegistration.verificationExpires | Date d'expiration du code | Date | DateTime | Obligatoire |
| Property.address | Adresse complète de la propriété | A | Texte | Obligatoire |
| Property.amenities | Liste des équipements disponibles | A | Texte | Optionnel, format JSON ou chaîne séparée |
| Property.availableRooms | Nombre de chambres disponibles | N | Entier | Obligatoire, doit être ≤ totalRooms |
| Property.createdAt | Date et heure de création de la propriété | Date | DateTime | Valeur par défaut : maintenant |
| Property.deposit | Montant du dépôt de garantie | N | Decimal(10,2) | Obligatoire |
| Property.description | Description détaillée de la propriété | A | Texte | Obligatoire |
| Property.district | Quartier où se trouve la propriété | A | varchar(100) | Obligatoire |
| Property.id | Identifiant unique de la propriété | N | Auto-increment | Clé primaire |
| Property.images | Chemins vers les images de la propriété | A | Texte | Optionnel, format JSON ou chaîne séparée |
| Property.isAvailable | Indicateur de disponibilité | Booléen | Boolean | Valeur par défaut : true |
| Property.latitude | Coordonnée de latitude | N | Decimal(10,8) | Optionnel, entre -90 et 90 |
| Property.longitude | Coordonnée de longitude | N | Decimal(11,8) | Optionnel, entre -180 et 180 |
| Property.ownerId | Identifiant du propriétaire | N | Auto-increment | Clé étrangère vers User |
| Property.price | Prix mensuel de location | N | Decimal(10,2) | Obligatoire |
| Property.propertyType | Type de propriété | AN | Enum | Valeurs : APARTMENT, HOUSE, STUDIO |
| Property.title | Titre de l'annonce de la propriété | A | varchar(255) | Obligatoire |
| Property.totalRooms | Nombre total de chambres | N | Entier | Obligatoire |
| Property.updatedAt | Date et heure de dernière modification | Date | DateTime | Mise à jour automatique |
| User.accountActivationDeadline | Date limite d'activation du compte | Date | DateTime | Optionnel, 24h après inscription |
| User.avatar | Chemin vers la photo de profil | A | Texte | Optionnel |
| User.bio | Biographie de l'utilisateur | A | Texte | Optionnel |
| User.budget | Budget mensuel de l'étudiant | N | Decimal(10,2) | Optionnel, pour les étudiants |
| User.cinData | Données extraites du CIN | A | Texte | Optionnel, format JSON |
| User.cinNumber | Numéro de la Carte d'Identité Nationale | AN | varchar(12) | Optionnel, unique si fourni |
| User.cinRectoImagePath | Chemin vers l'image recto du CIN | A | Texte | Optionnel |
| User.cinVerificationConfidence | Niveau de confiance de la vérification CIN | N | Float | Optionnel, entre 0 et 1 |
| User.cinVerificationErrors | Erreurs détectées lors de la vérification CIN | A | Texte | Optionnel |
| User.cinVerified | Indicateur de vérification du CIN | Booléen | Boolean | Valeur par défaut : false |
| User.cinVerifiedAt | Date et heure de vérification du CIN | Date | DateTime | Optionnel |
| User.cinVerificationRequestedAt | Date de demande de vérification CIN | Date | DateTime | Optionnel |
| User.cinVersoImagePath | Chemin vers l'image verso du CIN | A | Texte | Optionnel |
| User.clerkId | Identifiant Clerk (optionnel) | AN | varchar(255) | Optionnel, unique si fourni |
| User.createdAt | Date et heure de création du compte | Date | DateTime | Valeur par défaut : maintenant |
| User.email | Adresse email de l'utilisateur | AN | varchar(255) | Unique, obligatoire |
| User.firstName | Prénom de l'utilisateur | A | varchar(100) | Obligatoire |
| User.id | Identifiant unique de l'utilisateur | N | Auto-increment | Clé primaire |
| User.isVerified | Indicateur de vérification du compte | Booléen | Boolean | Valeur par défaut : false |
| User.lastLogin | Date et heure de dernière connexion | Date | DateTime | Optionnel |
| User.lastName | Nom de l'utilisateur | A | varchar(100) | Obligatoire |
| User.password | Hash du mot de passe | A | varchar(255) | Optionnel si authentification Clerk |
| User.phone | Numéro de téléphone | AN | varchar(20) | Obligatoire |
| User.status | Statut de l'utilisateur dans le système | AN | Enum | Valeurs : PENDING_VERIFICATION, PENDING_APPROVAL, ACTIVE, SUSPENDED |
| User.studyLevel | Niveau d'étude de l'étudiant | A | varchar(100) | Optionnel, pour les étudiants |
| User.university | Université de l'étudiant | A | varchar(255) | Optionnel, pour les étudiants |
| User.updatedAt | Date et heure de dernière modification | Date | DateTime | Mise à jour automatique |
| User.userType | Type d'utilisateur | AN | Enum | Valeurs : STUDENT, OWNER, ADMIN |
| User.verificationCode | Code de vérification du compte | A | varchar(10) | Optionnel |
| User.verificationExpires | Date d'expiration du code de vérification | Date | DateTime | Optionnel |
| VerificationCode.code | Code de vérification | A | varchar(10) | Obligatoire |
| VerificationCode.createdAt | Date et heure de création du code | Date | DateTime | Valeur par défaut : maintenant |
| VerificationCode.expiresAt | Date et heure d'expiration du code | Date | DateTime | Obligatoire |
| VerificationCode.id | Identifiant unique du code de vérification | N | Auto-increment | Clé primaire |
| VerificationCode.type | Type de code de vérification | A | varchar(50) | Valeurs : EMAIL_VERIFICATION, PASSWORD_RESET, etc. |
| VerificationCode.used | Indicateur d'utilisation du code | Booléen | Boolean | Valeur par défaut : false |
| VerificationCode.userId | Identifiant de l'utilisateur associé | N | Auto-increment | Clé étrangère vers User |

---

## Notes Complémentaires

### Types de Données Spéciaux

1. **Enum UserType** : STUDENT, OWNER, ADMIN
2. **Enum UserStatus** : PENDING_VERIFICATION, PENDING_APPROVAL, ACTIVE, SUSPENDED
3. **Enum PropertyType** : APARTMENT, HOUSE, STUDIO
4. **Enum AppointmentStatus** : PENDING, CONFIRMED, CANCELLED, COMPLETED

### Contraintes Importantes

- Les emails doivent être uniques dans le système
- Les mots de passe sont stockés sous forme de hash (bcrypt)
- Les dates sont stockées au format DateTime (ISO 8601)
- Les montants monétaires utilisent le type Decimal pour éviter les erreurs d'arrondi
- Les coordonnées géographiques sont optionnelles mais doivent respecter les limites si fournies

### Relations Clés

- Un User peut avoir plusieurs Properties (relation 1-N)
- Un User peut avoir plusieurs Announcements (relation 1-N)
- Un User peut avoir plusieurs Appointments comme étudiant ou propriétaire
- Une Conversation lie deux Users (relation N-N via table de jointure)
- Une Conversation contient plusieurs Messages (relation 1-N)
- Une Property peut avoir plusieurs Appointments (relation 1-N)

