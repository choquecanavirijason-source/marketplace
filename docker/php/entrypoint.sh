#!/bin/sh
set -e

cd /var/www/html

echo "Esperando conexion a la base de datos ${DB_HOST}:${DB_PORT:-3306}..."
until php -r "exit(@fsockopen(getenv('DB_HOST'), (int) (getenv('DB_PORT') ?: 3306)) ? 0 : 1);"; do
  sleep 2
done
echo "Base de datos disponible."

mkdir -p storage/app/public storage/framework/cache storage/framework/sessions \
  storage/framework/views storage/logs bootstrap/cache

if [ -z "$APP_KEY" ]; then
  echo "ERROR: APP_KEY no esta definida en server/.env."
  echo "Generala una vez con:"
  echo "  docker run --rm -v \"\$(pwd)/server\":/var/www/html -w /var/www/html php:8.2-cli php -r \"echo 'base64:'.base64_encode(random_bytes(32));\""
  echo "y pegala en server/.env como APP_KEY=... antes de iniciar el contenedor."
  echo "(No se genera automaticamente aqui porque cambiaria en cada reinicio y"
  echo " rompería las contrasenas/tokens ya cifrados con la clave anterior)."
  exit 1
fi

if [ ! -f storage/oauth-private.key ] || [ ! -f storage/oauth-public.key ]; then
  php artisan passport:keys --force
fi

php artisan migrate --force

# Cliente personal de Passport (lo usa AuthService::login vía createToken()).
# Se instala una sola vez; el marker vive en el volumen storage_data para
# que no se duplique en cada reinicio del contenedor.
if [ ! -f storage/.passport-installed ]; then
  php artisan passport:client --personal --name="${APP_NAME:-Marketplace} Personal Access Client" --no-interaction
  touch storage/.passport-installed
fi

chown -R www-data:www-data storage bootstrap/cache

php artisan config:cache
php artisan route:cache

exec "$@"
