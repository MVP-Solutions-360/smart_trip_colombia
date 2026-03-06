# Configuración de Base de Datos World

## 📋 Requisitos Previos

### Software Necesario
- ✅ **MySQL 5.7+** o **MariaDB 10.2+**
- ✅ **PHP 8.1+** con extensión PDO MySQL
- ✅ **Laravel 10+** (ya instalado en el proyecto)
- ✅ **Acceso de red** a la base de datos world

### Permisos de Base de Datos
El usuario de MySQL debe tener permisos de:
- `SELECT` en todas las tablas de la BD world
- `SHOW TABLES` para verificar estructura
- `DESCRIBE` para inspeccionar columnas

## 🔧 Configuración Paso a Paso

### 1. Configurar Variables de Entorno

Editar el archivo `.env` y agregar las siguientes variables:

```env
# Base de datos principal (CRM)
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=crm
DB_USERNAME=root
DB_PASSWORD=tu_password_crm

# Base de datos world
DB_WORLD_HOST=127.0.0.1
DB_WORLD_PORT=3306
DB_WORLD_DATABASE=world
DB_WORLD_USERNAME=root
DB_WORLD_PASSWORD=tu_password_world
```

### 2. Configurar Conexión en Laravel

El archivo `config/database.php` ya incluye la configuración:

```php
'connections' => [
    // ... otras conexiones ...
    
    'world' => [
        'driver' => 'mysql',
        'host' => env('DB_WORLD_HOST', '127.0.0.1'),
        'port' => env('DB_WORLD_PORT', '3306'),
        'database' => env('DB_WORLD_DATABASE', 'world'),
        'username' => env('DB_WORLD_USERNAME', 'root'),
        'password' => env('DB_WORLD_PASSWORD', ''),
        'unix_socket' => env('DB_WORLD_SOCKET', ''),
        'charset' => 'utf8mb4',
        'collation' => 'utf8mb4_unicode_ci',
        'prefix' => '',
        'prefix_indexes' => true,
        'strict' => false,
        'engine' => null,
        'options' => extension_loaded('pdo_mysql') ? array_filter([
            PDO::MYSQL_ATTR_SSL_CA => env('MYSQL_ATTR_SSL_CA'),
        ]) : [],
    ],
],
```

### 3. Verificar Conexión

#### Método 1: Artisan Tinker
```bash
php artisan tinker
```
```php
DB::connection('world')->getPdo();
echo "Conexión exitosa a BD world!";
```

#### Método 2: Comando Artisan Personalizado
```bash
php artisan tinker --execute="echo DB::connection('world')->getDatabaseName();"
```

#### Método 3: Test de Conexión
```bash
php artisan tinker --execute="
try {
    \$pdo = DB::connection('world')->getPdo();
    echo '✅ Conexión exitosa a BD world';
} catch (Exception \$e) {
    echo '❌ Error: ' . \$e->getMessage();
}
"
```

### 4. Verificar Estructura de Tablas

```bash
php artisan tinker --execute="
\$tables = DB::connection('world')->select('SHOW TABLES');
foreach(\$tables as \$table) {
    echo 'Tabla: ' . array_values((array)\$table)[0] . PHP_EOL;
}
"
```

## 🔍 Verificación Completa

### Script de Verificación

Crear archivo `test_world_connection.php`:

```php
<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== Verificación de Conexión BD World ===\n";

try {
    // 1. Probar conexión
    $pdo = DB::connection('world')->getPdo();
    echo "✅ Conexión PDO exitosa\n";

    // 2. Verificar base de datos
    $dbName = DB::connection('world')->getDatabaseName();
    echo "✅ Base de datos: {$dbName}\n";

    // 3. Listar tablas
    $tables = DB::connection('world')->select('SHOW TABLES');
    echo "✅ Tablas disponibles: " . count($tables) . "\n";
    
    foreach ($tables as $table) {
        $tableName = array_values((array)$table)[0];
        echo "   - {$tableName}\n";
    }

    // 4. Probar consulta de países
    $countries = DB::connection('world')
        ->table('countries')
        ->count();
    echo "✅ Países disponibles: {$countries}\n";

    // 5. Probar consulta de ciudades
    $cities = DB::connection('world')
        ->table('cities')
        ->count();
    echo "✅ Ciudades disponibles: {$cities}\n";

    echo "\n🎉 ¡Configuración completada exitosamente!\n";

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
```

Ejecutar:
```bash
php test_world_connection.php
```

## 🚨 Troubleshooting

### Error: "Connection refused"
**Causa**: MySQL no está ejecutándose o puerto incorrecto
**Solución**:
```bash
# Verificar estado de MySQL
netstat -an | findstr :3306

# Iniciar MySQL (XAMPP)
net start mysql
```

### Error: "Access denied for user"
**Causa**: Credenciales incorrectas o usuario sin permisos
**Solución**:
```sql
-- Crear usuario con permisos
CREATE USER 'world_user'@'localhost' IDENTIFIED BY 'password';
GRANT SELECT ON world.* TO 'world_user'@'localhost';
FLUSH PRIVILEGES;
```

### Error: "Unknown database 'world'"
**Causa**: La base de datos world no existe
**Solución**:
```sql
-- Crear base de datos
CREATE DATABASE world CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Error: "Column not found"
**Causa**: Estructura de tabla diferente a la esperada
**Solución**:
```sql
-- Verificar estructura
DESCRIBE countries;
DESCRIBE cities;
```

### Error: "Connection timeout"
**Causa**: Problemas de red o configuración
**Solución**:
```php
// En config/database.php, agregar timeout
'world' => [
    // ... otras configuraciones ...
    'options' => [
        PDO::ATTR_TIMEOUT => 30,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4",
    ],
],
```

## 🔒 Consideraciones de Seguridad

### 1. Credenciales
- ✅ Usar variables de entorno para credenciales
- ✅ No hardcodear passwords en código
- ✅ Usar usuarios con permisos mínimos

### 2. Conexión
- ✅ Usar SSL si es posible
- ✅ Limitar acceso por IP si necesario
- ✅ Monitorear conexiones activas

### 3. Consultas
- ✅ Validar parámetros de entrada
- ✅ Usar prepared statements
- ✅ Limitar resultados con LIMIT

## 📊 Monitoreo

### Verificar Conexiones Activas
```sql
SHOW PROCESSLIST;
```

### Verificar Uso de Memoria
```sql
SHOW STATUS LIKE 'Threads_connected';
```

### Logs de Laravel
```bash
tail -f storage/logs/laravel.log | grep "world"
```

## ✅ Checklist de Configuración

- [ ] Variables de entorno configuradas
- [ ] Conexión PDO funcional
- [ ] Base de datos world accesible
- [ ] Tablas principales visibles
- [ ] Consultas básicas funcionando
- [ ] API endpoints respondiendo
- [ ] Logs sin errores
- [ ] Permisos de usuario correctos

---

*Documentación de Configuración - Base de Datos World - Septiembre 2025*
