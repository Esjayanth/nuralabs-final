FROM php:8.2-apache

# System dependencies for MongoDB, Redis, and mysqli/pdo_mysql extensions
RUN apt-get update && apt-get install -y \
    libssl-dev \
    libzip-dev \
    unzip \
    git \
    && docker-php-ext-install pdo pdo_mysql mysqli \
    && pecl install mongodb redis \
    && docker-php-ext-enable mongodb redis \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Ensure only one MPM module is active (avoids "More than one MPM loaded")
RUN a2dismod mpm_event mpm_worker >/dev/null 2>&1; a2enmod mpm_prefork rewrite

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY composer.json composer.lock* ./
RUN composer install --no-dev --no-interaction --prefer-dist --ignore-platform-req=ext-mongodb

COPY . .

EXPOSE 80

CMD ["sh", "-c", "sed -i \"s/80/${PORT:-80}/g\" /etc/apache2/sites-available/000-default.conf /etc/apache2/ports.conf && apache2-foreground"]
