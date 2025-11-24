# Audit complet du projet

Ce document synthétise chaque fichier et dossier du dépôt `projet_stage-main`. L'objectif est de pouvoir identifier rapidement le rôle de chaque élément et les interactions principales entre les couches backend, frontend et documentation.

## Racine
- `backend/` : API Express/Prisma déployée sur Vercel, gère l'authentification, les annonces, les propriétés, la messagerie et les uploads.
- `frontend/` : Application React + TypeScript (Create React App) qui consomme l'API et fournit l'expérience utilisateur.
- `diagramme/` : Diagrammes UML et documentation d'architecture, désormais alignés avec Vercel + Neon + Cloudinary.
- `docs/` : Documents techniques (UML, audit, guides).
- `ERREUR.txt` : Journal d'erreurs ou problèmes connus.
- `FRONTEND_UPDATES_COMPLETE.md` / `FRONTEND_UPDATE_GUIDE.md` : Historique détaillé des refontes côté frontend.
- `PROJECT_SUMMARY.md` : Résumé global précédent du projet.

## Backend
### Fichiers racine
- `package.json` / `package-lock.json` : Dépendances (Express, Prisma, Multer, etc.).
- `README.md` / `TROUBLESHOOTING.md` / `MIGRATION_GUIDE.md` : procédures d’installation, résolution d’incidents et migration vers Neon.
- `.env.production` : exemple de variables sensibles.
- `vercel.json` : routes serverless (réécritures API).
- `migrate-to-neon.js` : script utilitaire de migration PostgreSQL.

### Prisma
- `prisma/schema.prisma` : schéma complet (User avec statut et lastLogin, PendingRegistration, Property, etc.).
- `prisma/migrations/` : snapshots SQL (non détaillé ici mais à garder synchronisé après mofis).
- `prisma/migrate.js` : script Node pour lancer Prisma migrate/deploy.

### Source (`backend/src`)
- `server.js` : point d’entrée Express, configuration CORS, body-parser, routes et gestion globale des erreurs.

#### Routes (`backend/src/routes`)
- `admin.js` : endpoints d’administration (validation users, gestion annonces/propriétés).
- `announcements.js` : CRUD des annonces publiques.
- `appointments.js` : gestion des rendez-vous (création, mise à jour, annulation).
- `auth.js` : routes héritées (probablement legacy) exposant diverses actions auth.
- `authRoutes.js` : routes publiques actuelles (`/register`, `/login`, `/verify-email`, etc.).
- `contacts.js` : formulaire de contact.
- `messages.js` : conversations et messages privés.
- `properties.js` : CRUD des propriétés et gestion des visites.
- `upload.js` : uploads d’images (vers Cloudinary).
- `users.js` : profil utilisateur, préférences, etc.

#### Contrôleurs (`backend/src/controllers`)
- `auth/authController.js` : Inscription (désormais PendingRegistration), login (JWT), profil `/me`, logout.
- `auth/verificationController.js` : Validation du code email, renvoi de code, création finale d’un utilisateur et notifications.

#### Middleware (`backend/src/middleware`)
- `authMiddleware.js` : Vérifie et décode le JWT, protège les routes privées, gère les rôles.

#### Services (`backend/src/services`)
- `emailService.js` : envoi des emails (code de vérification, confirmation, notification admin, actions admin).

#### Utils (`backend/src/utils`)
- `adminNotifier.js` : helpers de notification admin (emails ciblés).
- `auth.js` : outils d’authentification additionnels (Clerk/cas spécial).
- `cloudinary.js` : configuration du SDK Cloudinary.
- `mailer.js` : configuration générique Nodemailer.
- `prisma.js` : singleton PrismaClient.
- `response.js` : helper de réponse JSON standardisée.

## Frontend
### Fichiers racine
- `package.json` / `package-lock.json` : dépendances (React Router, Tailwind, Framer Motion, HeroIcons, etc.).
- `README*.md`, `VERCEL_MIGRATION.md` : guides de déploiement.
- `tailwind.config.js`, `postcss.config.js`, `tsconfig.json` : configuration tooling.
- `.render.yaml`, `vercel.json` : cibles de déploiement.

### `src` – fichiers généraux
- `App.tsx` : déclaration des routes, providers globaux, Toaster, Navbar/Footer, ajout du `FirstLoginGuide`.
- `config.ts` : abstraction axios/fetch (`apiGet`, `apiJson`, `apiUpload`) + auth token helper.
- `index.tsx` : bootstrap ReactDOM.
- `index.css` : styles Tailwind + global.

### Contextes (`src/contexts`)
- `AuthContext.tsx` : gestion auth (login/logout/register, pending verification, CIN upload, token storage).
- `PropertyContext.tsx` : état global des propriétés (fetch, create, update, delete).
- `MessageContext.tsx` : conversations/messagerie temps réel côté client.
- `AnnouncementContext.tsx` : état partagé des annonces.

### Pages (`src/pages`)
- `AboutPage.tsx` : présentation du service.
- `AdminLoginPage.tsx` / `AdminRegisterPage.tsx` : écrans d’auth admin.
- `AdminPage.tsx` : back-office (validation, stats).
- `AnnouncementDetailPage.tsx` / `AnnouncementsPage.tsx` : lecture et listing d’annonces.
- `AppointmentsPage.tsx` : gestion des rendez-vous.
- `CINVerificationPage.tsx` : envoi et suivi vérification CIN.
- `ContactPage.tsx` : formulaire contact.
- `CreateAnnouncementPage.tsx` / `EditAnnouncementPage.tsx` : CRUD annonces.
- `CreatePropertyPage.tsx` / `EditPropertyPage.tsx` : CRUD propriétés.
- `DashboardPage.tsx` : vue principale après login.
- `HomePage.tsx` : landing page riche (héros, stats, CTA).
- `LoginPage.tsx` : connexion utilisateur.
- `MessagesPage.tsx` : interface de messagerie.
- `PrivacyPage.tsx` / `TermsPage.tsx` : mentions légales.
- `ProfilePage.tsx` : gestion du profil personnel.
- `PropertyDetailPage.tsx` / `PropertyListPage.tsx` : détail/listing des logements.
- `RegisterPage.tsx` : formulaire d’inscription (redirige vers vérification).
- `SearchPage.tsx` : recherche filtrée.
- `VerifyAccountPage.tsx` : nouvelle page dédiée à la saisie du code de vérification + renvoi.

### Composants (`src/components`)
- `AdminRoute.tsx` : wrapper route admin.
- `CINVerificationBanner.tsx` / `CINVerificationModal.tsx` / `CINVerificationResult.tsx` : UX vérification identité.
- `FirstLoginGuide.tsx` : tutoriel modal première connexion (localStorage par utilisateur).
- `Footer.tsx` : pied de page global.
- `HeroBackground3D.tsx` / `HeroBackground3DInner.tsx` : animations du header.
- `Navbar.tsx` : navigation principale.
- `PageTransition.tsx` : animation d’entrée/sortie route (Framer Motion).
- `ProtectedRoute.tsx` : guard authentification.
- `ScheduleAppointmentModal.tsx` : planification de rendez-vous.
- `ScrollToTopButton.tsx` : bouton flottant.
- `SimpleCaptcha.tsx` : captcha custom utilisé à l’inscription.

### Hooks (`src/hooks`)
- `useCINVerification.ts` : logique réutilisable pour l’upload et la validation CIN.
- `useSectionAnimations.ts` : animations scroll/section.

### Services (`src/services`)
- `avatarUploadService.ts` : envoi avatars vers Cloudinary.
- `cinVerificationService.ts` : règles métier côté front pour la vérification simple.
- `imageUploadService.tsx` : helper d’upload générique.

### Utils (`src/utils`)
- `animations.tsx` : presets d’animations.
- `storage.js` : wrappers `localStorage/sessionStorage` (utilisés par AuthContext).

### Types (`src/types/index.ts`)
- Définitions TypeScript : `User`, `Property`, `Message`, `Conversation`, `RegisterData`, `AuthContextType`, etc.

## Documentation & Diagrammes
- `diagramme/*.md` : cas d’utilisation, séquences, classes, domaine, paquetage, déploiement (mis à jour pour React + Express + Neon + Cloudinary).
- `diagramme/*.puml` : diagrammes PlantUML (inscription, authentification, annonces, etc.).
- `docs/uml_diagrams.md` : référence/explication des diagrammes.
- `docs/PROJECT_FULL_AUDIT.md` (ce fichier) : vision exhaustive actuelle.

---
**À retenir** : la pile utilise React (frontend) + Express/Prisma (backend) sur Vercel, PostgreSQL Neon pour la persistance, Cloudinary pour les médias et un flux d’inscription basé sur PendingRegistration + code email. Toute évolution fonctionnelle doit maintenir la cohérence entre ces composants et ce mapping de fichiers.    

