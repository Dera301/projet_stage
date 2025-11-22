# Guide de Dépannage - Backend

## Problèmes d'Installation npm

### Erreur EPERM (Permissions)

Les erreurs `EPERM: operation not permitted` sur Windows sont généralement causées par :
- Des fichiers verrouillés par un processus
- Des permissions insuffisantes
- Des antivirus qui bloquent la suppression

**Solutions :**

1. **Fermer tous les processus Node.js :**
   ```powershell
   taskkill /F /IM node.exe
   ```

2. **Supprimer manuellement node_modules :**
   ```powershell
   Remove-Item -Recurse -Force node_modules
   Remove-Item -Force package-lock.json
   ```

3. **Réinstaller les dépendances :**
   ```powershell
   npm install
   ```

4. **Si le problème persiste, exécuter PowerShell en tant qu'administrateur**

### Erreur ENOENT avec Prisma

L'erreur `ENOENT spawn C:\WINDOWS\system32\cmd.exe` avec Prisma peut être résolue :

1. **Réinstaller Prisma :**
   ```powershell
   npm uninstall prisma @prisma/client
   npm install prisma @prisma/client --save-dev
   ```

2. **Générer le client Prisma manuellement :**
   ```powershell
   npx prisma generate
   ```

3. **Vérifier que Node.js est dans le PATH :**
   ```powershell
   node --version
   npm --version
   ```

## Mise à jour de Multer

Multer a été mis à jour de la version 1.x vers 2.x pour corriger les vulnérabilités de sécurité.

**Changements :**
- Version mise à jour : `multer@^2.0.1`
- Le code existant est compatible (API rétrocompatible)

**Après la mise à jour :**
```powershell
cd backend
npm install
```

## Problèmes de Build sur Vercel

Si vous rencontrez des erreurs lors du déploiement sur Vercel :

1. **Vérifier les variables d'environnement** dans le dashboard Vercel
2. **Vérifier le script de build** dans `package.json` :
   ```json
   "vercel-build": "prisma generate && prisma migrate deploy"
   ```
3. **Vérifier que Prisma est dans les dépendances** et non seulement dans devDependencies pour Vercel

## Nettoyage Complet

Si rien ne fonctionne, effectuer un nettoyage complet :

```powershell
# 1. Fermer tous les processus Node
taskkill /F /IM node.exe

# 2. Supprimer node_modules et lock files
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

# 3. Nettoyer le cache npm
npm cache clean --force

# 4. Réinstaller
npm install

# 5. Générer Prisma
npx prisma generate
```

## Vérification de l'Installation

Après l'installation, vérifier que tout fonctionne :

```powershell
# Vérifier les versions
node --version
npm --version
npx prisma --version

# Tester le serveur
npm run dev
```


