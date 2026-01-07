# Diagrammes UML de Séquence Générale - Plateforme Coloc Antananarivo

## UC1 - S'inscrire (POST /api/auth/register)

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant F as Frontend
    participant API as Backend API
    participant DB as Base de Données
    participant C as Clerk (Optionnel)

    U->>F: Remplit formulaire d'inscription
    F->>F: Validation des champs
    F->>API: POST /api/auth/register
    API->>DB: Vérifier si email existe
    DB-->>API: Résultat
    alt Email existe déjà
        API-->>F: Erreur 400
        F-->>U: Message d'erreur
    else Email disponible
        opt Clerk configuré
            API->>C: Créer utilisateur Clerk
            C-->>API: Clerk ID
        end
        API->>DB: Hasher mot de passe
        API->>DB: Créer utilisateur
        DB-->>API: Utilisateur créé
        API->>API: Générer JWT token
        API-->>F: {user, token}
        F->>F: Stocker token
        F-->>U: Redirection vers dashboard
    end
```

## UC2 - Se connecter (POST /api/auth/login)

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant F as Frontend
    participant API as Backend API
    participant DB as Base de Données

    U->>F: Saisit email et mot de passe
    F->>API: POST /api/auth/login
    API->>DB: Rechercher utilisateur par email
    DB-->>API: Utilisateur trouvé
    API->>API: Vérifier mot de passe
    alt Mot de passe incorrect
        API-->>F: Erreur 401
        F-->>U: Message d'erreur
    else Mot de passe correct
        API->>API: Générer JWT token
        API-->>F: {user, token}
        F->>F: Stocker token
        F-->>U: Redirection vers dashboard
    end
```

## UC7 - Demander vérification CIN (POST /api/auth/verify_cin)

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant F as Frontend
    participant API as Backend API
    participant DB as Base de Données
    participant A as Admin Notifier

    U->>F: Upload images CIN recto/verso
    F->>F: Convertir images en base64
    F->>API: POST /api/auth/verify_cin
    API->>API: Vérifier JWT token
    API->>DB: Mettre à jour utilisateur (CIN en attente)
    DB-->>API: Utilisateur mis à jour
    API->>A: Notifier admin (nouvelle CIN)
    API-->>F: Confirmation
    F-->>U: Message de succès
```

## UC12 - Publier logement (POST /api/properties/create)

```mermaid
sequenceDiagram
    participant O as Propriétaire
    participant F as Frontend
    participant API as Backend API
    participant DB as Base de Données

    O->>F: Remplit formulaire de propriété
    F->>F: Validation des données
    F->>API: POST /api/properties/create
    API->>API: Vérifier JWT token
    API->>DB: Créer propriété
    DB-->>API: Propriété créée
    API-->>F: {property}
    F-->>O: Redirection vers liste propriétés
```

## UC15 - Planifier visite (POST /api/appointments/create)

```mermaid
sequenceDiagram
    participant S as Étudiant
    participant F as Frontend
    participant API as Backend API
    participant DB as Base de Données
    participant O as Propriétaire

    S->>F: Sélectionne propriété et date
    F->>API: POST /api/appointments/create
    API->>API: Vérifier JWT token
    API->>DB: Créer rendez-vous (status: pending)
    DB-->>API: Rendez-vous créé
    opt Notification
        API->>O: Notifier propriétaire
    end
    API-->>F: {appointment}
    F-->>S: Confirmation
```

## UC17 - Messagerie directe (POST /api/messages/send)

```mermaid
sequenceDiagram
    participant U1 as Utilisateur 1
    participant F as Frontend
    participant API as Backend API
    participant DB as Base de Données
    participant U2 as Utilisateur 2

    U1->>F: Écrit message
    F->>API: POST /api/messages/send
    API->>API: Vérifier JWT token
    API->>DB: Chercher ou créer conversation
    API->>DB: Créer message
    DB-->>API: Message créé
    opt Notification temps réel
        API->>U2: Notifier nouveau message
    end
    API-->>F: {message}
    F-->>U1: Message envoyé
```

## UC19 - Publier annonce (POST /api/announcements/create)

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant F as Frontend
    participant API as Backend API
    participant DB as Base de Données

    U->>F: Remplit formulaire d'annonce
    F->>API: POST /api/announcements/create
    API->>API: Vérifier JWT token
    API->>DB: Créer annonce
    DB-->>API: Annonce créée
    API-->>F: {announcement}
    F-->>U: Redirection vers liste annonces
```

## UC8 - Valider/Rejeter CIN (PUT /api/admin/cin_verify/:id)

```mermaid
sequenceDiagram
    participant A as Admin
    participant F as Frontend
    participant API as Backend API
    participant DB as Base de Données
    participant U as Utilisateur

    A->>F: Consulte CINs en attente
    F->>API: GET /api/admin/cin_to_verify
    API-->>F: Liste des CINs
    A->>F: Valide ou rejette CIN
    F->>API: PUT /api/admin/cin_verify/:id
    API->>API: Vérifier rôle admin
    API->>DB: Mettre à jour utilisateur (cinVerified)
    DB-->>API: Utilisateur mis à jour
    opt Notification
        API->>U: Notifier résultat vérification
    end
    API-->>F: Confirmation
    F-->>A: Message de succès
```

## UC23 - Gérer utilisateurs (GET /api/admin/users_list)

```mermaid
sequenceDiagram
    participant A as Admin
    participant F as Frontend
    participant API as Backend API
    participant DB as Base de Données

    A->>F: Accède à la page admin
    F->>API: GET /api/admin/users_list
    API->>API: Vérifier rôle admin
    API->>DB: Récupérer tous les utilisateurs
    DB-->>API: Liste utilisateurs
    API-->>F: {users}
    F-->>A: Affiche liste utilisateurs
```

## UC10 - Rechercher propriétés (GET /api/properties/search)

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant F as Frontend
    participant API as Backend API
    participant DB as Base de Données

    U->>F: Applique filtres de recherche
    F->>API: GET /api/properties/search?district=...&price=...
    API->>DB: Rechercher propriétés avec filtres
    DB-->>API: Liste propriétés filtrées
    API-->>F: {properties}
    F-->>U: Affiche résultats
```

