# API Reference - Base de Datos World

## 📋 Información General

**Base URL**: `http://localhost:8000/api/world`  
**Formato**: JSON  
**Autenticación**: No requerida (endpoints públicos)  
**Rate Limit**: Sin límite (considerar implementar si es necesario)

## 🌍 Endpoints Disponibles

### 1. Obtener Todos los Países

**Endpoint**: `GET /api/world/countries`

**Descripción**: Retorna una lista de todos los países disponibles en la base de datos.

**Parámetros**: Ninguno

**Respuesta Exitosa** (200):
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "Afghanistan",
            "iso2": "AF",
            "iso3": "AFG"
        },
        {
            "id": 2,
            "name": "Aland Islands",
            "iso2": "AX",
            "iso3": "ALA"
        }
    ],
    "count": 250
}
```

**Ejemplo de Uso**:
```bash
curl "http://localhost:8000/api/world/countries"
```

### 2. Obtener Ciudades por País

**Endpoint**: `GET /api/world/countries/{countryId}/cities`

**Descripción**: Retorna todas las ciudades de un país específico.

**Parámetros**:
- `countryId` (integer, requerido): ID del país

**Respuesta Exitosa** (200):
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "Bogotá D.C.",
            "country_name": "Colombia",
            "country_code": "CO"
        },
        {
            "id": 2,
            "name": "Medellín",
            "country_name": "Colombia",
            "country_code": "CO"
        }
    ],
    "count": 150
}
```

**Ejemplo de Uso**:
```bash
curl "http://localhost:8000/api/world/countries/48/cities"
```

### 3. Obtener Estados por País

**Endpoint**: `GET /api/world/countries/{countryId}/states`

**Descripción**: Retorna todos los estados/provincias de un país específico.

**Parámetros**:
- `countryId` (integer, requerido): ID del país

**Respuesta Exitosa** (200):
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "Cundinamarca",
            "country_name": "Colombia"
        },
        {
            "id": 2,
            "name": "Antioquia",
            "country_name": "Colombia"
        }
    ],
    "count": 32
}
```

**Ejemplo de Uso**:
```bash
curl "http://localhost:8000/api/world/countries/48/states"
```

### 4. Obtener Regiones

**Endpoint**: `GET /api/world/regions`

**Descripción**: Retorna todas las regiones continentales disponibles.

**Parámetros**: Ninguno

**Respuesta Exitosa** (200):
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "Africa"
        },
        {
            "id": 2,
            "name": "Americas"
        },
        {
            "id": 3,
            "name": "Asia"
        },
        {
            "id": 4,
            "name": "Europe"
        },
        {
            "id": 5,
            "name": "Oceania"
        }
    ],
    "count": 5
}
```

**Ejemplo de Uso**:
```bash
curl "http://localhost:8000/api/world/regions"
```

### 5. Buscar Ciudades

**Endpoint**: `GET /api/world/cities/search`

**Descripción**: Busca ciudades por nombre con coincidencia parcial.

**Parámetros de Query**:
- `q` (string, requerido): Término de búsqueda (mínimo 2 caracteres)

**Respuesta Exitosa** (200):
```json
{
    "success": true,
    "data": [
        {
            "id": 149237,
            "name": "Bogotá D.C.",
            "country_name": "Colombia",
            "country_code": "CO"
        },
        {
            "id": 112501,
            "name": "Bogota",
            "country_name": "United States",
            "country_code": "US"
        }
    ],
    "count": 2,
    "query": "Bogotá"
}
```

**Ejemplo de Uso**:
```bash
curl "http://localhost:8000/api/world/cities/search?q=Bogotá"
```

### 6. Obtener Detalles Completos de País

**Endpoint**: `GET /api/world/countries/{countryId}/details`

**Descripción**: Retorna información completa de un país incluyendo sus ciudades y estados.

**Parámetros**:
- `countryId` (integer, requerido): ID del país

**Respuesta Exitosa** (200):
```json
{
    "success": true,
    "data": {
        "country": {
            "id": 48,
            "name": "Colombia",
            "iso2": "CO",
            "iso3": "COL",
            "capital": "Bogotá",
            "currency": "COP"
        },
        "cities": [
            {
                "id": 1,
                "name": "Bogotá D.C."
            },
            {
                "id": 2,
                "name": "Medellín"
            }
        ],
        "states": [
            {
                "id": 1,
                "name": "Cundinamarca"
            },
            {
                "id": 2,
                "name": "Antioquia"
            }
        ],
        "cities_count": 150,
        "states_count": 32
    }
}
```

**Ejemplo de Uso**:
```bash
curl "http://localhost:8000/api/world/countries/48/details"
```

## ❌ Códigos de Error

### 400 Bad Request
```json
{
    "success": false,
    "message": "La búsqueda debe tener al menos 2 caracteres"
}
```

### 404 Not Found
```json
{
    "success": false,
    "message": "País no encontrado"
}
```

### 500 Internal Server Error
```json
{
    "success": false,
    "message": "Error al obtener países: [detalle del error]"
}
```

## 🔧 Ejemplos de Integración

### JavaScript/Fetch
```javascript
// Obtener países
async function getCountries() {
    try {
        const response = await fetch('/api/world/countries');
        const data = await response.json();
        
        if (data.success) {
            console.log('Países:', data.data);
            return data.data;
        } else {
            console.error('Error:', data.message);
        }
    } catch (error) {
        console.error('Error de red:', error);
    }
}

// Buscar ciudades
async function searchCities(query) {
    try {
        const response = await fetch(`/api/world/cities/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        if (data.success) {
            return data.data;
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
```

### PHP/Laravel
```php
// En un controlador
use Illuminate\Support\Facades\Http;

public function getCountries()
{
    $response = Http::get('http://localhost:8000/api/world/countries');
    
    if ($response->successful()) {
        $data = $response->json();
        return $data['data'];
    }
    
    return [];
}

// En un componente Livewire
public function searchCities($query)
{
    $response = Http::get("http://localhost:8000/api/world/cities/search", [
        'q' => $query
    ]);
    
    if ($response->successful()) {
        $this->cities = $response->json()['data'];
    }
}
```

### cURL Ejemplos
```bash
# Obtener países
curl -X GET "http://localhost:8000/api/world/countries" \
     -H "Accept: application/json"

# Buscar ciudades
curl -X GET "http://localhost:8000/api/world/cities/search?q=Madrid" \
     -H "Accept: application/json"

# Obtener ciudades de Colombia
curl -X GET "http://localhost:8000/api/world/countries/48/cities" \
     -H "Accept: application/json"
```

## 📊 Límites y Consideraciones

### Rendimiento
- **Países**: ~250 registros, respuesta rápida
- **Ciudades**: Miles de registros, considerar paginación
- **Búsquedas**: Limitadas a 20 resultados por defecto

### Recomendaciones
1. **Caché**: Implementar caché para consultas frecuentes
2. **Paginación**: Considerar para listas grandes
3. **Índices**: Verificar índices en BD world
4. **Rate Limiting**: Implementar si es necesario

### Estructura de Respuesta
Todas las respuestas exitosas incluyen:
- `success`: boolean indicando éxito
- `data`: array con los datos solicitados
- `count`: número total de registros
- `message`: mensaje descriptivo (en caso de error)

---

*API Reference - Base de Datos World - Septiembre 2025*
