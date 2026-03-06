# Deployment Guide - Módulo de Renta de Autos

## 📋 Índice

1. [Requisitos del Sistema](#requisitos-del-sistema)
2. [Configuración de Producción](#configuración-de-producción)
3. [Variables de Entorno](#variables-de-entorno)
4. [Base de Datos](#base-de-datos)
5. [Servicios Externos](#servicios-externos)
6. [Optimizaciones](#optimizaciones)
7. [Monitoreo](#monitoreo)
8. [Backup y Recuperación](#backup-y-recuperación)
9. [Troubleshooting](#troubleshooting)

## 🖥️ Requisitos del Sistema

### Servidor Web

- **PHP**: 8.1 o superior
- **Laravel**: 11.x
- **Web Server**: Apache 2.4+ o Nginx 1.18+
- **SSL**: Certificado válido (recomendado)

### Base de Datos

- **MySQL**: 8.0+ o MariaDB 10.6+
- **Conexiones**: Mínimo 20 conexiones simultáneas
- **Storage**: Mínimo 10GB para datos iniciales

### Servicios Adicionales

- **Redis**: Para cache y sesiones (recomendado)
- **Queue Worker**: Para procesamiento asíncrono
- **Cron Jobs**: Para tareas programadas

### Especificaciones Mínimas

```
CPU: 2 cores
RAM: 4GB
Storage: 50GB SSD
Network: 100Mbps
```

### Especificaciones Recomendadas

```
CPU: 4+ cores
RAM: 8GB+
Storage: 100GB+ SSD
Network: 1Gbps
```

## ⚙️ Configuración de Producción

### 1. Configuración de PHP

#### php.ini

```ini
; Configuración básica
memory_limit = 512M
max_execution_time = 300
max_input_time = 300
post_max_size = 100M
upload_max_filesize = 100M

; Configuración de sesiones
session.gc_maxlifetime = 7200
session.cookie_secure = 1
session.cookie_httponly = 1
session.cookie_samesite = "Strict"

; Configuración de OPcache
opcache.enable = 1
opcache.memory_consumption = 256
opcache.interned_strings_buffer = 16
opcache.max_accelerated_files = 20000
opcache.validate_timestamps = 0
opcache.save_comments = 0
opcache.enable_file_override = 1
```

#### Extensiones Requeridas

```bash
# Instalar extensiones necesarias
sudo apt-get install php8.1-cli php8.1-fpm php8.1-mysql php8.1-xml php8.1-mbstring php8.1-curl php8.1-zip php8.1-bcmath php8.1-redis php8.1-gd
```

### 2. Configuración de Nginx

#### Configuración del Sitio

```nginx
server {
    listen 80;
    listen 443 ssl http2;
    server_name tu-dominio.com;
    root /var/www/crm/public;
    index index.php;

    # SSL Configuration
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;

    # PHP Processing
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }

    # Static Files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Laravel Routes
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # Deny access to sensitive files
    location ~ /\. {
        deny all;
    }
}
```

### 3. Configuración de Apache

#### Virtual Host

```apache
<VirtualHost *:80>
    ServerName tu-dominio.com
    DocumentRoot /var/www/crm/public
    
    <Directory /var/www/crm/public>
        AllowOverride All
        Require all granted
    </Directory>

    # Security Headers
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set X-Content-Type-Options "nosniff"
    Header always set Referrer-Policy "no-referrer-when-downgrade"
    
    # Gzip Compression
    LoadModule deflate_module modules/mod_deflate.so
    <Location />
        SetOutputFilter DEFLATE
        SetEnvIfNoCase Request_URI \
            \.(?:gif|jpe?g|png)$ no-gzip dont-vary
        SetEnvIfNoCase Request_URI \
            \.(?:exe|t?gz|zip|bz2|sit|rar)$ no-gzip dont-vary
    </Location>
</VirtualHost>
```

## 🔐 Variables de Entorno

### .env de Producción

```env
# Application
APP_NAME="CRM - Renta de Autos"
APP_ENV=production
APP_KEY=base64:tu-app-key-aqui
APP_DEBUG=false
APP_URL=https://tu-dominio.com

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=crm_production
DB_USERNAME=crm_user
DB_PASSWORD=tu-password-seguro

# Cache & Sessions
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

# Redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=tu-redis-password
REDIS_PORT=6379

# Mail
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=tu-email@gmail.com
MAIL_PASSWORD=tu-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@tu-dominio.com
MAIL_FROM_NAME="${APP_NAME}"

# BookingCars API
BOOKINGCARS_BASE_URL=https://api.bookingcars.com
BOOKINGCARS_API_KEY=tu-api-key-real

# Logging
LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=error

# Security
BCRYPT_ROUNDS=12
```

### Configuración de Seguridad

```bash
# Generar APP_KEY
php artisan key:generate

# Configurar permisos
sudo chown -R www-data:www-data /var/www/crm
sudo chmod -R 755 /var/www/crm
sudo chmod -R 775 /var/www/crm/storage
sudo chmod -R 775 /var/www/crm/bootstrap/cache
```

## 🗄️ Base de Datos

### 1. Configuración de MySQL

#### Crear Base de Datos

```sql
-- Crear base de datos
CREATE DATABASE crm_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Crear usuario
CREATE USER 'crm_user'@'localhost' IDENTIFIED BY 'tu-password-seguro';

-- Otorgar permisos
GRANT ALL PRIVILEGES ON crm_production.* TO 'crm_user'@'localhost';
FLUSH PRIVILEGES;
```

#### Configuración de MySQL

```ini
# /etc/mysql/mysql.conf.d/mysqld.cnf
[mysqld]
# Configuración básica
max_connections = 200
innodb_buffer_pool_size = 2G
innodb_log_file_size = 256M
innodb_flush_log_at_trx_commit = 2

# Configuración de charset
character-set-server = utf8mb4
collation-server = utf8mb4_unicode_ci

# Configuración de logs
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2

# Configuración de seguridad
local_infile = 0
```

### 2. Migraciones y Seeders

```bash
# Ejecutar migraciones
php artisan migrate --force

# Ejecutar seeders (solo datos iniciales)
php artisan db:seed --class=CarRentalSeeder --force
php artisan db:seed --class=CarLocationSeeder --force

# Optimizar base de datos
php artisan optimize
```

### 3. Backup de Base de Datos

#### Script de Backup Automático

```bash
#!/bin/bash
# /usr/local/bin/backup-crm.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/crm"
DB_NAME="crm_production"
DB_USER="crm_user"
DB_PASS="tu-password-seguro"

# Crear directorio de backup
mkdir -p $BACKUP_DIR

# Crear backup
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > $BACKUP_DIR/crm_backup_$DATE.sql

# Comprimir backup
gzip $BACKUP_DIR/crm_backup_$DATE.sql

# Eliminar backups antiguos (más de 30 días)
find $BACKUP_DIR -name "crm_backup_*.sql.gz" -mtime +30 -delete

echo "Backup completado: crm_backup_$DATE.sql.gz"
```

#### Cron Job para Backup

```bash
# Agregar al crontab
0 2 * * * /usr/local/bin/backup-crm.sh >> /var/log/backup-crm.log 2>&1
```

## 🔌 Servicios Externos

### 1. BookingCars API

#### Configuración de Producción

```env
# Variables de entorno
BOOKINGCARS_BASE_URL=https://api.bookingcars.com
BOOKINGCARS_API_KEY=tu-api-key-real-de-produccion
```

#### Configuración de Cache

```php
// config/cache.php
'stores' => [
    'redis' => [
        'driver' => 'redis',
        'connection' => 'default',
        'prefix' => 'bookingcars:',
    ],
],
```

### 2. Redis

#### Instalación

```bash
# Instalar Redis
sudo apt-get install redis-server

# Configurar Redis
sudo nano /etc/redis/redis.conf
```

#### Configuración de Redis

```conf
# /etc/redis/redis.conf
bind 127.0.0.1
port 6379
timeout 300
tcp-keepalive 300
maxmemory 1gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

#### Configuración de Laravel

```php
// config/database.php
'redis' => [
    'client' => 'phpredis',
    'options' => [
        'cluster' => 'redis',
        'prefix' => 'crm:',
    ],
    'default' => [
        'url' => env('REDIS_URL'),
        'host' => env('REDIS_HOST', '127.0.0.1'),
        'password' => env('REDIS_PASSWORD'),
        'port' => env('REDIS_PORT', '6379'),
        'database' => env('REDIS_DB', '0'),
    ],
],
```

## ⚡ Optimizaciones

### 1. Optimización de Laravel

```bash
# Optimizar para producción
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
```

### 2. Optimización de Composer

```bash
# Instalar dependencias optimizadas
composer install --optimize-autoloader --no-dev

# Generar autoloader optimizado
composer dump-autoload --optimize
```

### 3. Optimización de Base de Datos

```sql
-- Crear índices adicionales
CREATE INDEX idx_car_rates_price ON car_rates(price);
CREATE INDEX idx_car_rates_currency ON car_rates(currency);
CREATE INDEX idx_car_reservations_status ON car_reservations(status);
CREATE INDEX idx_car_reservations_dates ON car_reservations(pickup_date, dropoff_date);

-- Optimizar tablas
OPTIMIZE TABLE car_rentals;
OPTIMIZE TABLE car_locations;
OPTIMIZE TABLE car_rates;
OPTIMIZE TABLE car_reservations;
```

### 4. Optimización de PHP-FPM

```ini
# /etc/php/8.1/fpm/pool.d/www.conf
[www]
user = www-data
group = www-data
listen = /var/run/php/php8.1-fpm.sock
listen.owner = www-data
listen.group = www-data
listen.mode = 0660

pm = dynamic
pm.max_children = 50
pm.start_servers = 5
pm.min_spare_servers = 5
pm.max_spare_servers = 35
pm.max_requests = 1000

pm.status_path = /status
ping.path = /ping
```

## 📊 Monitoreo

### 1. Logs de Aplicación

#### Configuración de Logs

```php
// config/logging.php
'channels' => [
    'stack' => [
        'driver' => 'stack',
        'channels' => ['single', 'slack'],
        'ignore_exceptions' => false,
    ],
    'single' => [
        'driver' => 'single',
        'path' => storage_path('logs/laravel.log'),
        'level' => 'debug',
    ],
    'slack' => [
        'driver' => 'slack',
        'url' => env('LOG_SLACK_WEBHOOK_URL'),
        'username' => 'Laravel Log',
        'emoji' => ':boom:',
        'level' => 'critical',
    ],
],
```

#### Monitoreo de Logs

```bash
# Monitorear logs en tiempo real
tail -f /var/www/crm/storage/logs/laravel.log

# Monitorear logs de error
tail -f /var/log/nginx/error.log
tail -f /var/log/php8.1-fpm.log
```

### 2. Monitoreo de Sistema

#### Script de Monitoreo

```bash
#!/bin/bash
# /usr/local/bin/monitor-crm.sh

# Verificar estado de la aplicación
if ! curl -f http://localhost/health-check > /dev/null 2>&1; then
    echo "ALERT: Application is down at $(date)" >> /var/log/crm-monitor.log
    # Enviar notificación por email o Slack
fi

# Verificar uso de memoria
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.2f", $3/$2 * 100.0}')
if (( $(echo "$MEMORY_USAGE > 90" | bc -l) )); then
    echo "ALERT: High memory usage: ${MEMORY_USAGE}% at $(date)" >> /var/log/crm-monitor.log
fi

# Verificar espacio en disco
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 90 ]; then
    echo "ALERT: High disk usage: ${DISK_USAGE}% at $(date)" >> /var/log/crm-monitor.log
fi
```

#### Cron Job para Monitoreo

```bash
# Verificar cada 5 minutos
*/5 * * * * /usr/local/bin/monitor-crm.sh
```

### 3. Métricas de Aplicación

#### Health Check Endpoint

```php
// routes/web.php
Route::get('/health-check', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now(),
        'database' => DB::connection()->getPdo() ? 'connected' : 'disconnected',
        'cache' => Cache::store()->getStore() ? 'connected' : 'disconnected',
        'memory_usage' => memory_get_usage(true),
        'memory_peak' => memory_get_peak_usage(true),
    ]);
});
```

## 💾 Backup y Recuperación

### 1. Backup Completo

#### Script de Backup

```bash
#!/bin/bash
# /usr/local/bin/full-backup-crm.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/crm/full"
APP_DIR="/var/www/crm"

# Crear directorio
mkdir -p $BACKUP_DIR

# Backup de base de datos
mysqldump -u crm_user -p tu-password-seguro crm_production > $BACKUP_DIR/database_$DATE.sql

# Backup de archivos de aplicación
tar -czf $BACKUP_DIR/files_$DATE.tar.gz -C $APP_DIR .

# Backup de configuración
cp /etc/nginx/sites-available/crm $BACKUP_DIR/nginx_config_$DATE.conf
cp /etc/php/8.1/fpm/pool.d/www.conf $BACKUP_DIR/phpfpm_config_$DATE.conf

# Comprimir todo
tar -czf $BACKUP_DIR/crm_full_backup_$DATE.tar.gz -C $BACKUP_DIR .

# Limpiar archivos temporales
rm $BACKUP_DIR/database_$DATE.sql
rm $BACKUP_DIR/files_$DATE.tar.gz
rm $BACKUP_DIR/nginx_config_$DATE.conf
rm $BACKUP_DIR/phpfpm_config_$DATE.conf

echo "Backup completo creado: crm_full_backup_$DATE.tar.gz"
```

### 2. Recuperación

#### Script de Recuperación

```bash
#!/bin/bash
# /usr/local/bin/restore-crm.sh

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "Uso: $0 <archivo_backup.tar.gz>"
    exit 1
fi

# Extraer backup
tar -xzf $BACKUP_FILE -C /tmp/

# Restaurar base de datos
mysql -u crm_user -p tu-password-seguro crm_production < /tmp/database_*.sql

# Restaurar archivos
tar -xzf /tmp/files_*.tar.gz -C /var/www/crm/

# Restaurar configuración
cp /tmp/nginx_config_*.conf /etc/nginx/sites-available/crm
cp /tmp/phpfpm_config_*.conf /etc/php/8.1/fpm/pool.d/www.conf

# Reiniciar servicios
systemctl reload nginx
systemctl reload php8.1-fpm

echo "Recuperación completada"
```

## 🔧 Troubleshooting

### Problemas Comunes

#### 1. Error 500 - Internal Server Error

```bash
# Verificar logs
tail -f /var/www/crm/storage/logs/laravel.log
tail -f /var/log/nginx/error.log

# Verificar permisos
sudo chown -R www-data:www-data /var/www/crm
sudo chmod -R 755 /var/www/crm
sudo chmod -R 775 /var/www/crm/storage
sudo chmod -R 775 /var/www/crm/bootstrap/cache

# Limpiar cache
php artisan cache:clear
php artisan config:clear
php artisan view:clear
```

#### 2. Error de Base de Datos

```bash
# Verificar conexión
php artisan tinker
>>> DB::connection()->getPdo();

# Verificar migraciones
php artisan migrate:status

# Ejecutar migraciones pendientes
php artisan migrate --force
```

#### 3. Error de Cache

```bash
# Verificar Redis
redis-cli ping

# Limpiar cache
php artisan cache:clear
redis-cli FLUSHALL
```

#### 4. Error de API BookingCars

```bash
# Verificar configuración
php artisan tinker
>>> config('services.bookingcars.api_key')

# Probar API
php artisan test:bookingcars
```

### Comandos de Diagnóstico

```bash
# Estado general de la aplicación
php artisan about

# Verificar configuración
php artisan config:show

# Verificar rutas
php artisan route:list

# Verificar cache
php artisan cache:table

# Verificar queue
php artisan queue:work --once
```

### Logs Importantes

```bash
# Logs de aplicación
/var/www/crm/storage/logs/laravel.log

# Logs de Nginx
/var/log/nginx/access.log
/var/log/nginx/error.log

# Logs de PHP-FPM
/var/log/php8.1-fpm.log

# Logs de MySQL
/var/log/mysql/error.log
/var/log/mysql/slow.log

# Logs del sistema
/var/log/syslog
```

---

## 📞 Soporte

Para más información sobre el despliegue del módulo de renta de autos, consultar la documentación completa o contactar al equipo de desarrollo.

**Versión**: 1.0.0  
**Última actualización**: Septiembre 2025
