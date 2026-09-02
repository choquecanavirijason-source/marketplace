# syntax=docker/dockerfile:1

##############################################
# 1. Build del frontend (Next.js export estático)
##############################################
FROM oven/bun:1-alpine AS frontend
WORKDIR /app
COPY client/package.json client/bun.lockb ./
RUN bun install --frozen-lockfile
COPY client/ .
ENV NODE_ENV=production
# La app se sirve desde el mismo origen que la API (ver server/routes/web.php),
# por eso el frontend llama a una ruta relativa en vez de un dominio fijo.
ENV NEXT_PUBLIC_API_URL=/api/v1
RUN bun run build

##############################################
# 2. Base PHP con extensiones necesarias
##############################################
FROM php:8.2-fpm-alpine AS php-base
RUN apk add --no-cache icu-libs libzip libpng freetype libjpeg-turbo oniguruma \
    && apk add --no-cache --virtual .build-deps $PHPIZE_DEPS icu-dev libzip-dev libpng-dev freetype-dev libjpeg-turbo-dev oniguruma-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j"$(nproc)" pdo_mysql mbstring bcmath gd zip intl exif opcache pcntl \
    && apk del .build-deps
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

##############################################
# 3. App: dependencias PHP + código + frontend compilado
##############################################
FROM php-base AS app
WORKDIR /var/www/html

COPY server/ .
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-progress

# El export estático de Next.js se copia dentro de public/ de Laravel
COPY --from=frontend /app/out/ ./public/

RUN mkdir -p storage/app/public storage/framework/cache storage/framework/sessions \
      storage/framework/views storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

COPY docker/php/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 9000
ENTRYPOINT ["entrypoint.sh"]
CMD ["php-fpm"]

##############################################
# 4. Web: nginx sirviendo el public/ ya compilado
##############################################
FROM nginx:1.27-alpine AS web
COPY docker/nginx/cloudflare.conf /etc/nginx/conf.d/cloudflare.conf
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=app /var/www/html/public /var/www/html/public
