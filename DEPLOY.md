# Despliegue en tu VPS (IP pública) + Cloudflare

Arquitectura: un único dominio sirve todo. Nginx recibe la petición → si es
`/api/v1/...` la pasa a PHP-FPM (Laravel); si no, sirve el export estático de
Next.js que ya vive dentro de `server/public/` (ver `server/routes/web.php`).
La base de datos MySQL corre en su propio contenedor, **sin puerto expuesto a
internet** — solo es accesible desde `app` y `queue` a través de la red
interna de Docker (nombre de host `db`).

Contenedores: `nginx` (puerto 80) → `app` (PHP-FPM) → `db` (MySQL), más
`queue` (worker de colas, `QUEUE_CONNECTION=database`).

## 1. Preparar el VPS

```bash
# Docker + plugin de compose (Ubuntu/Debian)
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # cierra sesión y vuelve a entrar
```

Firewall: abre solo el puerto 80 (y 443 si más adelante agregas TLS propio).
No abras el 3306 (MySQL) — no hace falta, y exponerlo sería un riesgo.

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw enable
```

## 2. Clonar y configurar

```bash
git clone <tu-repo> marketplace && cd marketplace
cp .env.example .env
cp server/.env.docker.example server/.env
```

Genera una `APP_KEY` real (una sola vez) y pégala en `server/.env`:

```bash
docker run --rm php:8.2-cli php -r "echo 'base64:'.base64_encode(random_bytes(32)).PHP_EOL;"
```

Edita **ambos** archivos:

- `.env` (raíz): `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`, `DB_ROOT_PASSWORD`
  — pon una contraseña fuerte.
- `server/.env`: `APP_KEY` (la que generaste), `APP_URL=https://tudominio.com`,
  y `DB_DATABASE` / `DB_USERNAME` / `DB_PASSWORD` **idénticos** a los del
  `.env` de la raíz (son los mismos: uno crea el usuario de MySQL, el otro
  lo usa para conectarse).

## 3. Levantar todo

```bash
docker compose build
docker compose up -d
docker compose logs -f app   # primer arranque: crea llaves de Passport,
                              # corre migraciones y crea el cliente de Passport
```

Si `queue` falla en el primer arranque (puede competir con `app` corriendo
migraciones a la vez), simplemente:

```bash
docker compose restart queue
```

## 4. Cloudflare: apuntar tu dominio al VPS

1. En el DNS de Cloudflare, crea un registro **A** con el nombre `@` (o `www`)
   apuntando a la IP pública de tu VPS, con el proxy activado (nube naranja).
2. En **SSL/TLS**, elige uno:
   - **Flexible** (rápido, sin nada extra en el VPS): Cloudflare habla HTTPS
     con el visitante y HTTP con tu VPS por el puerto 80 que ya está abierto.
     Suficiente para empezar.
   - **Full (strict)** (más seguro, extremo a extremo cifrado): necesitas un
     certificado válido en el VPS. Opción simple: instala `certbot` en el
     host (no en Docker) y usa un `nginx` del sistema como reverse proxy
     delante del contenedor, o usa el módulo *Origin CA* de Cloudflare para
     generar un certificado y montarlo en el contenedor `nginx` (habría que
     añadir un `listen 443 ssl` a `docker/nginx/default.conf`). Si quieres,
     lo dejamos configurado en otra sesión.
3. `docker/nginx/cloudflare.conf` ya restringe `set_real_ip_from` a los
   rangos de Cloudflare, para que Laravel vea la IP real del visitante
   (`CF-Connecting-IP`) en vez de la IP del proxy. Verifica de vez en cuando
   que la lista siga vigente en <https://www.cloudflare.com/ips/>.

## 5. Operación diaria

```bash
# Actualizar tras un cambio de código
git pull
docker compose build
docker compose up -d   # las migraciones corren solas al iniciar "app"

# Logs
docker compose logs -f app
docker compose logs -f nginx

# Comandos artisan sueltos
docker compose exec app php artisan tinker
docker compose exec app php artisan cache:clear

# Backup de la base de datos
docker compose exec db sh -c 'exec mysqldump -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"' > backup.sql

# Administrar MySQL desde tu máquina (sin exponer el puerto a internet)
ssh -L 3306:localhost:3306 usuario@tu-vps
# y en tu cliente de MySQL local, conecta a 127.0.0.1:3306
```

## Notas

- El frontend (Next.js) se compila en modo estático (`output: "export"`)
  dentro de la imagen y queda embebido en `server/public/`; no corre un
  proceso Node en producción.
- `server/.env` y el `.env` de la raíz **no se suben a git** (ya están en
  `.gitignore`) — vive solo en tu VPS.
- Si agregas tareas programadas en `server/routes/console.php`, hace falta
  un contenedor adicional que corra `php artisan schedule:run` cada minuto;
  hoy no existe ninguna, así que no se incluyó.
