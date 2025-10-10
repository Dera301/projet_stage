# Utiliser une image PHP officielle
FROM php:8.2-apache

# Copier le contenu du dossier backend dans le conteneur
COPY . /var/www/html/

# Activer mod_rewrite pour PHP
RUN a2enmod rewrite

# Exposer le port
EXPOSE 10000

# Commande de démarrage
CMD ["php", "-S", "0.0.0.0:10000", "-t", "."]
