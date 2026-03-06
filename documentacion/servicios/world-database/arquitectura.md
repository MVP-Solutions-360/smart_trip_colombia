# Arquitectura - Base de Datos World

## 📋 Visión General

La integración de la base de datos World en el sistema CRM utiliza una arquitectura de conexión externa que permite consultar datos geográficos sin afectar la estructura principal del sistema.

## 🏗️ Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                        SISTEMA CRM                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────────┐ │
│  │   Frontend      │    │   Backend       │    │   Database   │ │
│  │   (Livewire)    │    │   (Laravel)     │    │   Layer     │ │
│  └─────────────────┘    └─────────────────┘    └──────────────┘ │
│           │                       │                       │     │
│           │                       │                       │     │
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────────┐ │
│  │   Components    │    │   Controllers   │    │   CRM DB     │ │
│  │   - CountrySel  │    │   - WorldData   │    │   (mysql)    │ │
│  │   - CitySearch  │    │   - API Routes  │    │              │ │
│  └─────────────────┘    └─────────────────┘    └──────────────┘ │
│           │                       │                       │     │
│           │                       │                       │     │
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────────┐ │
│  │   API Layer     │    │   Service Layer │    │   World DB   │ │
│  │   - REST API    │    │   - DB Facade   │    │   (mysql)    │ │
│  │   - JSON Resp   │    │   - Eloquent    │    │              │ │
│  └─────────────────┘    └─────────────────┘    └──────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 🔌 Conexiones de Base de Datos

### 1. Configuración de Conexiones

```php
// config/database.php
'connections' => [
    'mysql' => [
        // Conexión principal del CRM
        'driver' => 'mysql',
        'host' => env('DB_HOST', '127.0.0.1'),
        'database' => env('DB_DATABASE', 'crm'),
        // ... configuración CRM
    ],
    
    'world' => [
        // Conexión externa a BD World
        'driver' => 'mysql',
        'host' => env('DB_WORLD_HOST', '127.0.0.1'),
        'database' => env('DB_WORLD_DATABASE', 'world'),
        // ... configuración World
    ],
],
```

### 2. Flujo de Conexión

```
Aplicación Laravel
        │
        ▼
┌─────────────────┐
│ DatabaseManager │
└─────────────────┘
        │
        ├─── mysql (CRM) ────► CRM Database
        │
        └─── world ──────────► World Database
```

## 📊 Estructura de Datos

### 1. Tablas de la Base de Datos World

```sql
-- Tabla de países
CREATE TABLE countries (
    id mediumint(8) unsigned PRIMARY KEY,
    name varchar(100) NOT NULL,
    iso2 char(2) NOT NULL,
    iso3 char(3) NOT NULL,
    capital varchar(255),
    currency varchar(255),
    region varchar(255),
    region_id mediumint(8) unsigned,
    subregion varchar(255),
    subregion_id mediumint(8) unsigned,
    latitude decimal(10,8),
    longitude decimal(11,8),
    created_at timestamp,
    updated_at timestamp
);

-- Tabla de ciudades
CREATE TABLE cities (
    id mediumint(8) unsigned PRIMARY KEY,
    name varchar(255) NOT NULL,
    state_id mediumint(8) unsigned,
    state_code varchar(255),
    country_id mediumint(8) unsigned NOT NULL,
    country_code char(2) NOT NULL,
    latitude decimal(10,8),
    longitude decimal(11,8),
    created_at timestamp,
    updated_at timestamp,
    FOREIGN KEY (country_id) REFERENCES countries(id)
);

-- Tabla de regiones
CREATE TABLE regions (
    id mediumint(8) unsigned PRIMARY KEY,
    name varchar(100) NOT NULL,
    translations text,
    created_at timestamp,
    updated_at timestamp
);

-- Tabla de estados
CREATE TABLE states (
    id mediumint(8) unsigned PRIMARY KEY,
    name varchar(255) NOT NULL,
    country_id mediumint(8) unsigned NOT NULL,
    created_at timestamp,
    updated_at timestamp,
    FOREIGN KEY (country_id) REFERENCES countries(id)
);

-- Tabla de subregiones
CREATE TABLE subregions (
    id mediumint(8) unsigned PRIMARY KEY,
    name varchar(255) NOT NULL,
    region_id mediumint(8) unsigned,
    created_at timestamp,
    updated_at timestamp,
    FOREIGN KEY (region_id) REFERENCES regions(id)
);
```

### 2. Relaciones Entre Tablas

```
regions (1) ──── (N) countries (1) ──── (N) states
    │                                      │
    │                                      │
    └── (1) ──── (N) subregions            │
                                           │
                                           │
countries (1) ──── (N) cities
```

## 🔄 Flujo de Datos

### 1. Consulta Simple

```
Frontend Request
        │
        ▼
┌─────────────────┐
│   API Route     │
│ /api/world/...  │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│ WorldDataCtrl   │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│   DB Facade     │
│ connection('world') │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│   World DB      │
│   (MySQL)       │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│   JSON Response │
└─────────────────┘
```

### 2. Consulta con Relaciones

```
Frontend Request
        │
        ▼
┌─────────────────┐
│   API Route     │
│ /countries/{id}/cities │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│ WorldDataCtrl   │
│ getCitiesByCountry() │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│   DB Query      │
│ JOIN countries   │
│ ON cities.country_id │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│   World DB      │
│   (MySQL)       │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│   JSON Response │
│   with relations │
└─────────────────┘
```

## 🎯 Patrones de Diseño

### 1. Repository Pattern (Opcional)

```php
// app/Repositories/WorldRepository.php
<?php

namespace App\Repositories;

use Illuminate\Support\Facades\DB;

class WorldRepository
{
    public function getCountries()
    {
        return DB::connection('world')
            ->table('countries')
            ->select('id', 'name', 'iso2', 'iso3')
            ->orderBy('name')
            ->get();
    }

    public function getCitiesByCountry($countryId)
    {
        return DB::connection('world')
            ->table('cities')
            ->join('countries', 'cities.country_id', '=', 'countries.id')
            ->where('cities.country_id', $countryId)
            ->select('cities.id', 'cities.name', 'countries.name as country_name')
            ->orderBy('cities.name')
            ->get();
    }

    public function searchCities($query)
    {
        return DB::connection('world')
            ->table('cities')
            ->join('countries', 'cities.country_id', '=', 'countries.id')
            ->where('cities.name', 'LIKE', "%{$query}%")
            ->select('cities.id', 'cities.name', 'countries.name as country_name')
            ->limit(20)
            ->get();
    }
}
```

### 2. Service Layer Pattern

```php
// app/Services/WorldDataService.php
<?php

namespace App\Services;

use App\Repositories\WorldRepository;
use Illuminate\Support\Facades\Cache;

class WorldDataService
{
    protected $worldRepository;

    public function __construct(WorldRepository $worldRepository)
    {
        $this->worldRepository = $worldRepository;
    }

    public function getCountries()
    {
        return Cache::remember('world_countries', 3600, function () {
            return $this->worldRepository->getCountries();
        });
    }

    public function getCitiesByCountry($countryId)
    {
        return Cache::remember("world_cities_country_{$countryId}", 1800, function () use ($countryId) {
            return $this->worldRepository->getCitiesByCountry($countryId);
        });
    }

    public function searchCities($query)
    {
        if (strlen($query) < 2) {
            return collect();
        }

        return Cache::remember("world_cities_search_{$query}", 300, function () use ($query) {
            return $this->worldRepository->searchCities($query);
        });
    }
}
```

### 3. API Resource Pattern

```php
// app/Http/Resources/World/CountryResource.php
<?php

namespace App\Http\Resources\World;

use Illuminate\Http\Resources\Json\JsonResource;

class CountryResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'iso2' => $this->iso2,
            'iso3' => $this->iso3,
            'capital' => $this->capital,
            'currency' => $this->currency,
        ];
    }
}

// app/Http/Resources/World/CityResource.php
<?php

namespace App\Http\Resources\World;

use Illuminate\Http\Resources\Json\JsonResource;

class CityResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'country_name' => $this->country_name,
            'country_code' => $this->country_code,
        ];
    }
}
```

## 🔒 Consideraciones de Seguridad

### 1. Validación de Entrada

```php
// app/Http/Requests/WorldDataRequest.php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class WorldDataRequest extends FormRequest
{
    public function rules()
    {
        return [
            'country_id' => 'required|integer|min:1',
            'query' => 'required|string|min:2|max:100',
        ];
    }

    public function messages()
    {
        return [
            'country_id.required' => 'El ID del país es requerido',
            'country_id.integer' => 'El ID del país debe ser un número entero',
            'query.required' => 'El término de búsqueda es requerido',
            'query.min' => 'El término de búsqueda debe tener al menos 2 caracteres',
        ];
    }
}
```

### 2. Rate Limiting

```php
// app/Http/Middleware/WorldApiRateLimit.php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

class WorldApiRateLimit
{
    public function handle(Request $request, Closure $next)
    {
        $key = 'world_api:' . $request->ip();
        
        if (RateLimiter::tooManyAttempts($key, 100)) {
            return response()->json([
                'success' => false,
                'message' => 'Demasiadas solicitudes. Intente más tarde.'
            ], 429);
        }

        RateLimiter::hit($key, 60); // 100 requests per minute

        return $next($request);
    }
}
```

## 📈 Optimizaciones

### 1. Índices de Base de Datos

```sql
-- Índices recomendados para la BD World
CREATE INDEX idx_cities_country_id ON cities(country_id);
CREATE INDEX idx_cities_name ON cities(name);
CREATE INDEX idx_countries_name ON countries(name);
CREATE INDEX idx_countries_iso2 ON countries(iso2);
CREATE INDEX idx_states_country_id ON states(country_id);
```

### 2. Caché de Consultas

```php
// config/cache.php - Configuración de caché
'stores' => [
    'world' => [
        'driver' => 'redis',
        'connection' => 'default',
        'prefix' => 'world:',
    ],
],
```

### 3. Consultas Optimizadas

```php
// Consulta optimizada con select específico
$countries = DB::connection('world')
    ->table('countries')
    ->select('id', 'name', 'iso2') // Solo campos necesarios
    ->where('id', '>', 0) // Evitar NULLs
    ->orderBy('name')
    ->get();

// Consulta con límite para evitar sobrecarga
$cities = DB::connection('world')
    ->table('cities')
    ->select('id', 'name')
    ->where('country_id', $countryId)
    ->limit(100) // Límite razonable
    ->get();
```

## 🔄 Monitoreo y Logging

### 1. Logging de Consultas

```php
// app/Http/Controllers/WorldDataController.php
use Illuminate\Support\Facades\Log;

public function getCountries()
{
    $startTime = microtime(true);
    
    try {
        $countries = DB::connection('world')
            ->table('countries')
            ->select('id', 'name', 'iso2', 'iso3')
            ->orderBy('name')
            ->get();

        $executionTime = microtime(true) - $startTime;
        
        Log::info('World DB Query', [
            'query' => 'getCountries',
            'execution_time' => $executionTime,
            'result_count' => $countries->count()
        ]);

        return response()->json([
            'success' => true,
            'data' => $countries,
            'count' => $countries->count()
        ]);
    } catch (\Exception $e) {
        Log::error('World DB Error', [
            'query' => 'getCountries',
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);

        return response()->json([
            'success' => false,
            'message' => 'Error al obtener países: ' . $e->getMessage()
        ], 500);
    }
}
```

### 2. Métricas de Rendimiento

```php
// app/Services/MetricsService.php
<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class MetricsService
{
    public function getWorldDbMetrics()
    {
        return [
            'connection_status' => $this->checkConnection(),
            'cache_hit_rate' => $this->getCacheHitRate(),
            'avg_query_time' => $this->getAverageQueryTime(),
            'total_queries' => $this->getTotalQueries(),
        ];
    }

    private function checkConnection()
    {
        try {
            DB::connection('world')->getPdo();
            return 'connected';
        } catch (\Exception $e) {
            return 'disconnected';
        }
    }

    private function getCacheHitRate()
    {
        $hits = Cache::get('world_cache_hits', 0);
        $misses = Cache::get('world_cache_misses', 0);
        $total = $hits + $misses;
        
        return $total > 0 ? ($hits / $total) * 100 : 0;
    }
}
```

---

*Arquitectura - Base de Datos World - Septiembre 2025*
