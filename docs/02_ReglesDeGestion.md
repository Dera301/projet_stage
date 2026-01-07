# Règles de Gestion du Système - Plateforme Coloc Antananarivo

## 1. Règles d'Authentification et d'Inscription

### RG-001 : Inscription Utilisateur
- **Description** : Un utilisateur doit fournir un email unique, un mot de passe, un prénom, un nom, un numéro de téléphone et un type d'utilisateur (étudiant ou propriétaire) pour s'inscrire.
- **Contraintes** :
  - L'email doit être unique dans le système
  - Le mot de passe doit respecter les critères de sécurité (minimum 8 caractères)
  - Le numéro de téléphone doit être valide
  - Le type d'utilisateur doit être soit "student" soit "owner"
- **Exception** : Les administrateurs sont créés manuellement par un autre administrateur

### RG-002 : Vérification du Compte
- **Description** : Après l'inscription, un code de vérification est envoyé par email à l'utilisateur.
- **Contraintes** :
  - Le code de vérification expire après 24 heures
  - L'utilisateur a un maximum de 3 tentatives pour valider le code
  - Le compte doit être activé dans les 24 heures suivant l'inscription
  - Si le compte n'est pas activé dans les 24 heures, il passe en statut "PENDING_VERIFICATION"

### RG-003 : Authentification
- **Description** : L'authentification se fait via email et mot de passe.
- **Contraintes** :
  - Seuls les utilisateurs avec le statut "ACTIVE" peuvent se connecter
  - Les utilisateurs suspendus ne peuvent pas se connecter
  - Un token JWT est généré à la connexion avec une durée de validité de 7 jours
  - La dernière date de connexion est mise à jour à chaque authentification réussie

## 2. Règles de Gestion des Utilisateurs

### RG-004 : Profil Utilisateur
- **Description** : Les utilisateurs peuvent modifier leurs informations personnelles.
- **Contraintes** :
  - L'email ne peut pas être modifié après l'inscription
  - Les étudiants peuvent modifier leur université, niveau d'étude et budget
  - Les propriétaires peuvent modifier leurs informations de contact
  - La modification du profil nécessite une authentification valide

### RG-005 : Vérification CIN
- **Description** : Les utilisateurs peuvent demander la vérification de leur CIN (Carte d'Identité Nationale).
- **Contraintes** :
  - Seuls les utilisateurs authentifiés peuvent demander la vérification CIN
  - L'utilisateur doit fournir le numéro CIN, une image recto et une image verso
  - La vérification CIN est effectuée manuellement par un administrateur
  - Un utilisateur ne peut avoir qu'une seule demande de vérification CIN en attente
  - Une fois vérifié, le CIN ne peut plus être modifié sans intervention admin

### RG-006 : Statut Utilisateur
- **Description** : Les utilisateurs ont différents statuts dans le système.
- **Contraintes** :
  - Statuts possibles : PENDING_VERIFICATION, PENDING_APPROVAL, ACTIVE, SUSPENDED
  - Un utilisateur suspendu ne peut pas accéder aux fonctionnalités du système
  - Seuls les administrateurs peuvent modifier le statut d'un utilisateur

## 3. Règles de Gestion des Propriétés

### RG-007 : Création de Propriété
- **Description** : Seuls les propriétaires peuvent créer des annonces de logement.
- **Contraintes** :
  - Le propriétaire doit être authentifié et avoir le statut "ACTIVE"
  - Les champs obligatoires sont : titre, description, adresse, quartier, prix, dépôt de garantie, nombre de chambres disponibles, nombre total de chambres, type de propriété
  - Le prix et le dépôt de garantie doivent être des valeurs positives
  - Le nombre de chambres disponibles ne peut pas être supérieur au nombre total de chambres
  - Une propriété est créée avec le statut "disponible" par défaut

### RG-008 : Modification de Propriété
- **Description** : Un propriétaire peut modifier ses propres propriétés.
- **Contraintes** :
  - Seul le propriétaire de la propriété peut la modifier
  - Les propriétés avec des rendez-vous confirmés ne peuvent pas être supprimées
  - La modification nécessite une authentification valide

### RG-009 : Suppression de Propriété
- **Description** : Un propriétaire peut supprimer ses propres propriétés.
- **Contraintes** :
  - Seul le propriétaire de la propriété peut la supprimer
  - Les propriétés avec des rendez-vous confirmés ou en attente ne peuvent pas être supprimées directement
  - Les rendez-vous associés doivent être annulés avant la suppression
  - Les administrateurs peuvent supprimer n'importe quelle propriété pour modération

### RG-010 : Disponibilité des Propriétés
- **Description** : Les propriétés peuvent être marquées comme disponibles ou non disponibles.
- **Contraintes** :
  - Seules les propriétés disponibles apparaissent dans les résultats de recherche pour les invités et étudiants
  - Les propriétaires peuvent toujours voir leurs propriétés, même si elles ne sont pas disponibles
  - Une propriété non disponible ne peut pas recevoir de nouvelles demandes de rendez-vous

## 4. Règles de Gestion des Annonces

### RG-011 : Création d'Annonce
- **Description** : Les étudiants et propriétaires peuvent créer des annonces.
- **Contraintes** :
  - L'utilisateur doit être authentifié et avoir le statut "ACTIVE"
  - Le contenu de l'annonce est obligatoire
  - Les images sont optionnelles mais limitées à un certain nombre (à définir)
  - Les annonces sont visibles par tous les utilisateurs authentifiés et les invités

### RG-012 : Modification d'Annonce
- **Description** : Un utilisateur peut modifier ses propres annonces.
- **Contraintes** :
  - Seul l'auteur de l'annonce peut la modifier
  - La modification nécessite une authentification valide

### RG-013 : Suppression d'Annonce
- **Description** : Un utilisateur peut supprimer ses propres annonces.
- **Contraintes** :
  - Seul l'auteur de l'annonce peut la supprimer
  - Les administrateurs peuvent supprimer n'importe quelle annonce pour modération

## 5. Règles de Gestion des Rendez-vous

### RG-014 : Planification de Visite
- **Description** : Les étudiants peuvent planifier des visites pour les propriétés disponibles.
- **Contraintes** :
  - Seuls les étudiants authentifiés peuvent planifier une visite
  - La propriété doit être disponible (isAvailable = true)
  - La date du rendez-vous doit être dans le futur
  - Un propriétaire ne peut pas avoir plus d'un rendez-vous dans une fenêtre de 2 heures
  - Un étudiant ne peut pas avoir plus de 3 rendez-vous en attente simultanément

### RG-015 : Gestion des Rendez-vous par le Propriétaire
- **Description** : Les propriétaires peuvent valider, rejeter ou reporter les rendez-vous.
- **Contraintes** :
  - Seul le propriétaire de la propriété peut gérer les rendez-vous associés
  - Un rendez-vous rejeté doit avoir une raison de rejet (optionnelle mais recommandée)
  - Un rendez-vous reporté doit avoir une nouvelle date proposée
  - Les rendez-vous confirmés ne peuvent pas être modifiés, seulement annulés

### RG-016 : Statut des Rendez-vous
- **Description** : Les rendez-vous ont différents statuts.
- **Contraintes** :
  - Statuts possibles : PENDING, CONFIRMED, CANCELLED, COMPLETED
  - Un rendez-vous en attente peut être validé, rejeté ou reporté
  - Un rendez-vous confirmé ne peut être que complété ou annulé
  - Un rendez-vous annulé ne peut pas être réactivé

## 6. Règles de Gestion de la Messagerie

### RG-017 : Envoi de Message
- **Description** : Les utilisateurs authentifiés peuvent envoyer des messages à d'autres utilisateurs.
- **Contraintes** :
  - L'utilisateur doit être authentifié et avoir le statut "ACTIVE"
  - Le contenu du message ne peut pas être vide
  - Un utilisateur ne peut pas s'envoyer de message à lui-même
  - Les messages sont organisés en conversations entre deux utilisateurs

### RG-018 : Modification et Suppression de Message
- **Description** : Les utilisateurs peuvent modifier ou supprimer leurs propres messages.
- **Contraintes** :
  - Seul l'expéditeur du message peut le modifier ou le supprimer
  - Un message modifié conserve l'historique de modification (optionnel)
  - La suppression d'un message ne supprime pas la conversation si d'autres messages existent

### RG-019 : Conversation
- **Description** : Les conversations regroupent les messages entre deux utilisateurs.
- **Contraintes** :
  - Une conversation est créée automatiquement lors du premier message entre deux utilisateurs
  - Le compteur de messages non lus est mis à jour automatiquement
  - Un utilisateur peut supprimer une conversation entière, ce qui supprime tous les messages associés

## 7. Règles de Recherche

### RG-020 : Recherche de Propriétés
- **Description** : Les utilisateurs peuvent rechercher des propriétés avec des filtres.
- **Contraintes** :
  - Les invités peuvent rechercher uniquement les propriétés disponibles
  - Les utilisateurs authentifiés peuvent voir toutes les propriétés disponibles
  - Les filtres possibles : mot-clé, quartier, prix min/max, type de propriété, nombre de chambres
  - Les résultats sont triés par date de création (plus récent en premier) par défaut

### RG-021 : Recherche d'Annonces
- **Description** : Les utilisateurs peuvent rechercher des annonces.
- **Contraintes** :
  - Tous les utilisateurs (authentifiés et invités) peuvent rechercher des annonces
  - Les filtres possibles : mot-clé, auteur, date
  - Les résultats sont triés par date de création (plus récent en premier) par défaut

## 8. Règles d'Administration

### RG-022 : Vérification CIN par l'Administrateur
- **Description** : Les administrateurs peuvent valider ou rejeter les demandes de vérification CIN.
- **Contraintes** :
  - Seuls les administrateurs peuvent accéder à cette fonctionnalité
  - Lors de la validation, l'administrateur peut ajouter un niveau de confiance
  - Lors du rejet, l'administrateur doit fournir une raison de rejet
  - Une fois validé, le CIN ne peut être modifié que par un administrateur

### RG-023 : Modération de Contenu
- **Description** : Les administrateurs peuvent modérer le contenu du système.
- **Contraintes** :
  - Les administrateurs peuvent supprimer des annonces et des propriétés
  - Les administrateurs peuvent bannir des utilisateurs (statut SUSPENDED)
  - Les actions de modération doivent être traçables (logs)
  - Un utilisateur banni ne peut plus accéder au système

### RG-024 : Gestion des Utilisateurs par l'Administrateur
- **Description** : Les administrateurs peuvent gérer tous les utilisateurs.
- **Contraintes** :
  - Les administrateurs peuvent consulter la liste de tous les utilisateurs
  - Les administrateurs peuvent modifier le statut d'un utilisateur
  - Les administrateurs ne peuvent pas modifier les informations personnelles d'un utilisateur sans raison valide
  - Un administrateur ne peut pas se bannir lui-même

## 9. Règles Techniques

### RG-025 : Sécurité des Données
- **Description** : Les données sensibles doivent être protégées.
- **Contraintes** :
  - Les mots de passe sont hashés avec bcrypt (10 rounds)
  - Les tokens JWT sont signés avec une clé secrète
  - Les données CIN sont stockées de manière sécurisée
  - Les images sont stockées via un service externe (Cloudinary)

### RG-026 : Performance
- **Description** : Le système doit répondre dans des délais raisonnables.
- **Contraintes** :
  - Les recherches doivent retourner des résultats en moins de 2 secondes
  - Les pages doivent se charger en moins de 3 secondes
  - La base de données doit être optimisée avec des index appropriés

### RG-027 : Disponibilité
- **Description** : Le système doit être disponible la plupart du temps.
- **Contraintes** :
  - Le système doit avoir un taux de disponibilité d'au moins 99%
  - Les sauvegardes de la base de données doivent être effectuées quotidiennement
  - Les erreurs doivent être loggées pour le débogage

## 10. Règles Métier Spécifiques

### RG-028 : Budget Étudiant
- **Description** : Les étudiants peuvent définir un budget pour leurs recherches.
- **Contraintes** :
  - Le budget est optionnel
  - Le budget doit être une valeur positive
  - Le budget peut être utilisé pour filtrer les propriétés dans les recherches

### RG-029 : Informations Académiques
- **Description** : Les étudiants peuvent renseigner leurs informations académiques.
- **Contraintes** :
  - L'université et le niveau d'étude sont optionnels
  - Ces informations peuvent être utilisées pour des recommandations futures

### RG-030 : Géolocalisation
- **Description** : Les propriétés peuvent avoir des coordonnées géographiques.
- **Contraintes** :
  - La latitude et la longitude sont optionnelles
  - Si fournies, elles doivent être valides (latitude entre -90 et 90, longitude entre -180 et 180)
  - Ces coordonnées peuvent être utilisées pour des recherches géolocalisées futures

