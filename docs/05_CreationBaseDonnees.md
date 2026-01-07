# Création de la Base de Données - Plateforme Coloc Antananarivo

## Vue d'Ensemble

Ce guide explique comment créer et configurer la base de données PostgreSQL pour la plateforme Coloc Antananarivo en utilisant Prisma ORM.

## Prérequis

1. **PostgreSQL** installé localement OU
2. Compte **Neon** (recommandé pour le cloud) OU
3. Compte **Supabase** (alternative cloud)

## Option 1 : Base de Données Locale

### 1.1 Installation de PostgreSQL

#### Sur Linux (Ubuntu/Debian)

```bash
# Mettre à jour les paquets
sudo apt update

# Installer PostgreSQL
sudo apt install postgresql postgresql-contrib

# Démarrer le service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Vérifier l'installation
psql --version
```

#### Sur macOS

```bash
# Avec Homebrew
brew install postgresql@14
brew services start postgresql@14
```

#### Sur Windows

1. Télécharger depuis [postgresql.org](https://www.postgresql.org/download/windows/)
2. Installer avec l'installateur
3. Noter le mot de passe du superutilisateur `postgres`

### 1.2 Création de la Base de Données

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Ou sur macOS/Windows
psql -U postgres
```

Dans le shell PostgreSQL :

```sql
-- Créer un utilisateur (optionnel, vous pouvez utiliser postgres)
CREATE USER coloc_user WITH PASSWORD 'votre_mot_de_passe_securise';

-- Créer la base de données
CREATE DATABASE coloc_antananarivo;

-- Donner les privilèges
GRANT ALL PRIVILEGES ON DATABASE coloc_antananarivo TO coloc_user;

-- Quitter
\q
```

### 1.3 Configuration de la Connection String

Créer un fichier `.env` dans `backend/` :

```env
DATABASE_URL="postgresql://coloc_user:votre_mot_de_passe_securise@localhost:5432/coloc_antananarivo?schema=public"
```

## Option 2 : Base de Données Cloud avec Neon (Recommandé)

### 2.1 Création du Compte

1. Aller sur [neon.tech](https://neon.tech)
2. Créer un compte (gratuit)
3. Créer un nouveau projet
4. Choisir une région proche de vos utilisateurs

### 2.2 Récupération de la Connection String

1. Dans le dashboard Neon, aller dans "Connection Details"
2. Copier la connection string :
   ```
   postgresql://user:password@ep-xxx-xxx.region.neon.tech/dbname?sslmode=require
   ```

### 2.3 Configuration

Créer un fichier `.env` dans `backend/` :

```env
DATABASE_URL="postgresql://user:password@ep-xxx-xxx.region.neon.tech/dbname?sslmode=require"
```

## Option 3 : Base de Données Cloud avec Supabase

### 3.1 Création du Projet

1. Aller sur [supabase.com](https://supabase.com)
2. Créer un compte (gratuit)
3. Créer un nouveau projet
4. Attendre la création de la base de données

### 3.2 Récupération de la Connection String

1. Aller dans Settings > Database
2. Copier la connection string sous "Connection string" > "URI"
3. Remplacer `[YOUR-PASSWORD]` par votre mot de passe

### 3.3 Configuration

Créer un fichier `.env` dans `backend/` :

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres"
```

## Étape 2 : Configuration Prisma

### 2.1 Vérifier le Schéma

Le schéma Prisma est défini dans `backend/prisma/schema.prisma`. Vérifier qu'il contient tous les modèles nécessaires :

- User
- Property
- Announcement
- Appointment
- Message
- Conversation
- VerificationCode
- PendingRegistration
- ContactMessage

### 2.2 Générer le Client Prisma

```bash
cd backend
npm install
npm run prisma:generate
```

Cette commande génère le client Prisma basé sur le schéma.

## Étape 3 : Création des Tables (Migrations)

### 3.1 Créer une Migration Initiale

```bash
cd backend
npx prisma migrate dev --name init
```

Cette commande :
- Crée un nouveau dossier `migrations/` dans `prisma/`
- Génère les fichiers SQL de migration
- Applique les migrations à la base de données
- Génère le client Prisma

### 3.2 Vérifier les Migrations

Les migrations sont stockées dans `backend/prisma/migrations/`. Chaque migration contient :
- Un fichier `migration.sql` avec les commandes SQL
- Un fichier `migration_lock.toml` pour verrouiller la version de Prisma

### 3.3 Appliquer les Migrations en Production

```bash
# Pour la production (sans créer de nouvelles migrations)
npx prisma migrate deploy
```

## Étape 4 : Vérification

### 4.1 Vérifier avec Prisma Studio

```bash
cd backend
npm run prisma:studio
```

Cela ouvre Prisma Studio sur `http://localhost:5555` où vous pouvez :
- Voir toutes les tables
- Ajouter/modifier/supprimer des données
- Vérifier la structure

### 4.2 Vérifier avec psql

```bash
# Se connecter à la base de données
psql -U coloc_user -d coloc_antananarivo

# Lister les tables
\dt

# Voir la structure d'une table
\d users

# Voir les données
SELECT * FROM users;

# Quitter
\q
```

### 4.3 Vérifier avec le Code

Créer un fichier de test `backend/test-db.js` :

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    // Tester la connexion
    await prisma.$connect();
    console.log('✅ Connexion à la base de données réussie');

    // Compter les utilisateurs
    const userCount = await prisma.user.count();
    console.log(`📊 Nombre d'utilisateurs: ${userCount}`);

    // Lister les tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('📋 Tables:', tables);
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
```

Exécuter :
```bash
node test-db.js
```

## Étape 5 : Seed de la Base de Données (Optionnel)

### 5.1 Créer un Fichier de Seed

Créer `backend/prisma/seed.js` :

```javascript
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  // Créer un utilisateur admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@coloc-antananarivo.com' },
    update: {},
    create: {
      email: 'admin@coloc-antananarivo.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'System',
      phone: '+261341234567',
      userType: 'admin',
      status: 'ACTIVE',
      isVerified: true,
    },
  });

  console.log('✅ Admin créé:', admin);

  // Créer un utilisateur test
  const testPassword = await bcrypt.hash('test123', 10);
  
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      password: testPassword,
      firstName: 'Test',
      lastName: 'User',
      phone: '+261341234568',
      userType: 'student',
      status: 'ACTIVE',
      isVerified: true,
    },
  });

  console.log('✅ Utilisateur test créé:', testUser);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### 5.2 Configurer le Script de Seed

Dans `backend/package.json` :

```json
{
  "prisma": {
    "seed": "node prisma/seed.js"
  }
}
```

### 5.3 Exécuter le Seed

```bash
npm run prisma:seed
```

## Structure de la Base de Données

### Modèles Principaux

#### User
- Informations utilisateur (email, nom, téléphone)
- Authentification (password, JWT)
- Vérification (email, CIN)
- Rôles (student, owner, admin)

#### Property
- Propriétés à louer
- Informations (adresse, prix, type)
- Images et coordonnées GPS
- Relation avec le propriétaire (owner)

#### Announcement
- Annonces de colocation
- Contenu et images
- Relation avec l'auteur

#### Appointment
- Rendez-vous pour visites
- Statut (pending, confirmed, cancelled, completed)
- Relations avec property, student, owner

#### Message & Conversation
- Système de messagerie
- Conversations entre utilisateurs
- Messages avec statut de lecture

#### VerificationCode
- Codes de vérification email
- Expiration et utilisation

## Maintenance

### Sauvegardes

#### Automatique (Neon/Supabase)
- Neon : Sauvegardes automatiques quotidiennes
- Supabase : Sauvegardes automatiques (plan payant)

#### Manuelle

```bash
# Exporter la base de données
pg_dump -U coloc_user -d coloc_antananarivo > backup.sql

# Restaurer
psql -U coloc_user -d coloc_antananarivo < backup.sql
```

### Migrations Futures

Quand vous modifiez le schéma :

```bash
# 1. Modifier prisma/schema.prisma
# 2. Créer une nouvelle migration
npx prisma migrate dev --name nom_de_la_migration

# 3. En production
npx prisma migrate deploy
```

### Nettoyage

```bash
# Réinitialiser la base de données (DANGEREUX - supprime toutes les données)
npx prisma migrate reset

# Supprimer toutes les migrations et recommencer
rm -rf prisma/migrations
npx prisma migrate dev --name init
```

## Résolution des Problèmes

### Erreur de Connexion

```bash
# Vérifier que PostgreSQL est démarré
sudo systemctl status postgresql  # Linux
brew services list                 # macOS

# Vérifier la connection string
echo $DATABASE_URL

# Tester la connexion
psql $DATABASE_URL
```

### Erreur de Migration

```bash
# Vérifier l'état des migrations
npx prisma migrate status

# Résoudre les migrations en conflit
npx prisma migrate resolve --applied nom_migration

# Réinitialiser (ATTENTION: supprime les données)
npx prisma migrate reset
```

### Erreur de Schéma

```bash
# Vérifier le schéma
npx prisma validate

# Formater le schéma
npx prisma format

# Générer le client
npx prisma generate
```

## Commandes Utiles

```bash
# Générer le client Prisma
npm run prisma:generate

# Créer une migration
npx prisma migrate dev --name nom_migration

# Appliquer les migrations
npm run prisma:migrate

# Ouvrir Prisma Studio
npm run prisma:studio

# Valider le schéma
npx prisma validate

# Formater le schéma
npx prisma format

# Voir l'état des migrations
npx prisma migrate status

# Réinitialiser (DANGEREUX)
npx prisma migrate reset
```

## Prochaines Étapes

1. ✅ Base de données créée
2. ✅ Migrations appliquées
3. ✅ Client Prisma généré
4. ⏳ Seed de données de test (optionnel)
5. ⏳ Configuration des index pour les performances
6. ⏳ Mise en place des sauvegardes automatiques
7. ⏳ Monitoring de la base de données

