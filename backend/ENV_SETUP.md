# Configuration des variables d'environnement pour l'envoi d'emails

## Variables requises

Votre fichier `.env` doit contenir les variables suivantes avec ces noms **exacts** :

```env
# Configuration SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=hajaaridera@gmail.com
SMTP_PASSWORD="qmkc ryti riej vres"

# Expéditeur des emails
EMAIL_FROM_ADDRESS=hajaaridera@gmail.com
EMAIL_FROM_NAME="Coloc App"

# Autres variables
ADMIN_EMAIL=hajaaridera@gmail.com
JWT_SECRET=1785c5b2d5ceb6f05a8397f70352e8322733839137886d3018c447ec5b7a3f21
```

## ⚠️ Points importants

1. **`SMTP_PASSWORD`** (pas `SMTP_PASS`) - Le mot de passe d'application Gmail
2. **`EMAIL_FROM_ADDRESS`** (pas `SMTP_FROM`) - L'adresse email expéditrice
3. **`EMAIL_FROM_NAME`** - Le nom affiché dans l'email (sans les chevrons)

## Vérification

Après avoir mis à jour votre `.env`, redémarrez le serveur backend. Vous devriez voir dans les logs :

```
🔍 Vérification configuration SMTP:
  - SMTP_HOST: ✅ défini
  - SMTP_PORT: 465
  - SMTP_SECURE: true
  - SMTP_USER: ✅ défini
  - SMTP_PASSWORD: ✅ défini
  - EMAIL_FROM_ADDRESS: ✅ défini
  - EMAIL_FROM_NAME: ✅ défini
✅ Transporteur SMTP créé avec succès
```

Si vous voyez des ❌, cela signifie que les variables ne sont pas correctement chargées.

## Dépannage

### Les emails ne partent toujours pas ?

1. **Vérifiez que le fichier `.env` est bien dans le dossier `backend/`**
2. **Redémarrez complètement le serveur** après modification du `.env`
3. **Vérifiez les logs** lors d'une inscription - vous verrez des messages détaillés
4. **Pour Gmail** : Assurez-vous d'utiliser un **mot de passe d'application** (pas votre mot de passe normal)
   - Activez la 2FA sur votre compte Gmail
   - Générez un mot de passe d'application : https://myaccount.google.com/apppasswords

### Erreurs courantes

- **"Invalid login"** : Le mot de passe d'application est incorrect
- **"Connection timeout"** : Vérifiez que le port 465 est ouvert
- **"Configuration SMTP incomplète"** : Vérifiez que toutes les variables sont définies avec les bons noms

