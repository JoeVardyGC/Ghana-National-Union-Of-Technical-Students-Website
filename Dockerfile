FROM php:8.2-apache

# Install PDO MySQL and mysqli extensions
RUN docker-php-ext-install pdo pdo_mysql mysqli

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Set Apache DocumentRoot permissions
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80
