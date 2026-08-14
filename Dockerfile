FROM php:8.2-fpm

RUN apt-get update && apt-get install -y \
    libssl-dev libzip-dev unzip git nginx \
    && docker-php-ext-install pdo pdo_mysql mysqli \
    && pecl install mongodb redis \
    && docker-php-ext-enable mongodb redis \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
WORKDIR /var/www/html
COPY composer.json composer.lock* ./
RUN composer install --no-dev --no-interaction --prefer-dist --ignore-platform-req=ext-mongodb
COPY . .

RUN rm -f /etc/nginx/sites-enabled/default
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["sh", "-c", "sed -i \"s/__PORT__/${PORT:-80}/g\" /etc/nginx/conf.d/default.conf && php-fpm -D && nginx -g 'daemon off;'"]
