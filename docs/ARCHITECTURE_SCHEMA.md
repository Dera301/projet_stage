# Architecture de l'application

```mermaid
flowchart TD
    subgraph Donnees[Couche de Données]
        DB[(Base de données PostgreSQL)]
        Prisma[Prisma ORM]
    end

    subgraph Logique[Couche Logique Métier]
        Controllers[Contrôleurs Express]
        Services[Services (Emails, Notifications)]
        Middleware[Middleware (JWT, Auth)]
        Utils[Utilitaires (Helpers, Cloudinary, Mailer)]
    end

    subgraph Presentation[Couche de Présentation]
        Frontend[React + TypeScript]
        Pages[Pages]
        Components[Composants]
        Contexts[Contexts (Auth, Property, Message)]
    end

    DB --> Prisma
    Prisma --> Controllers
    Controllers --> Services
    Controllers --> Middleware
    Controllers --> Utils
    Controllers --> Frontend
    Frontend --> Pages
    Frontend --> Components
    Frontend --> Contexts
```

Ce schéma illustre la séparation des couches et leurs interactions principales.
