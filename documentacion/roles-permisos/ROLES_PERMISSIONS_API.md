# API Documentation - Sistema de Roles y Permisos

## 📡 Endpoints de la API

### Base URL
```
/api/v1/agency/{agency}/roles
```

## 🔐 Autenticación

Todos los endpoints requieren autenticación mediante Sanctum:
```http
Authorization: Bearer {token}
```

## 📋 Endpoints Disponibles

### 1. Listar Roles de la Agencia

#### GET `/api/v1/agency/{agency}/roles`

**Descripción**: Obtiene todos los roles de una agencia específica.

**Parámetros**:
- `agency` (string, required): Slug de la agencia

**Query Parameters**:
- `type` (string, optional): `system`, `custom`, o `all` (default: `all`)
- `active` (boolean, optional): Filtrar por estado activo
- `search` (string, optional): Buscar por nombre o descripción
- `per_page` (integer, optional): Número de elementos por página (default: 15)

**Ejemplo de Request**:
```http
GET /api/v1/agency/viajes-del-caribe/roles?type=custom&active=true&search=vendedor
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

**Ejemplo de Response**:
```json
{
    "data": [
        {
            "id": 1,
            "name": "Vendedor Senior",
            "description": "Vendedor con experiencia para clientes importantes",
            "color": "#10B981",
            "is_system_role": false,
            "is_active": true,
            "sort_order": 1,
            "permissions_count": 24,
            "users_count": 3,
            "created_at": "2024-12-01T10:00:00.000000Z",
            "updated_at": "2024-12-01T10:00:00.000000Z"
        }
    ],
    "links": {
        "first": "http://localhost/api/v1/agency/viajes-del-caribe/roles?page=1",
        "last": "http://localhost/api/v1/agency/viajes-del-caribe/roles?page=1",
        "prev": null,
        "next": null
    },
    "meta": {
        "current_page": 1,
        "from": 1,
        "last_page": 1,
        "path": "http://localhost/api/v1/agency/viajes-del-caribe/roles",
        "per_page": 15,
        "to": 1,
        "total": 1
    }
}
```

### 2. Crear Nuevo Rol

#### POST `/api/v1/agency/{agency}/roles`

**Descripción**: Crea un nuevo rol personalizado para la agencia.

**Parámetros**:
- `agency` (string, required): Slug de la agencia

**Body Parameters**:
```json
{
    "name": "string (required, max:255, unique per agency)",
    "description": "string (optional, max:1000)",
    "color": "string (optional, hex color, default: #3B82F6)",
    "is_active": "boolean (optional, default: true)",
    "permissions": "array (optional, array of permission IDs)"
}
```

**Ejemplo de Request**:
```http
POST /api/v1/agency/viajes-del-caribe/roles
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
Content-Type: application/json

{
    "name": "Coordinador de Eventos",
    "description": "Especialista en organización de eventos corporativos",
    "color": "#8B5CF6",
    "is_active": true,
    "permissions": [1, 2, 3, 4, 5]
}
```

**Ejemplo de Response**:
```json
{
    "data": {
        "id": 2,
        "name": "Coordinador de Eventos",
        "description": "Especialista en organización de eventos corporativos",
        "color": "#8B5CF6",
        "is_system_role": false,
        "is_active": true,
        "sort_order": 2,
        "permissions_count": 5,
        "users_count": 0,
        "created_at": "2024-12-01T11:00:00.000000Z",
        "updated_at": "2024-12-01T11:00:00.000000Z"
    },
    "message": "Rol creado exitosamente"
}
```

### 3. Obtener Rol Específico

#### GET `/api/v1/agency/{agency}/roles/{role}`

**Descripción**: Obtiene información detallada de un rol específico.

**Parámetros**:
- `agency` (string, required): Slug de la agencia
- `role` (integer, required): ID del rol

**Ejemplo de Request**:
```http
GET /api/v1/agency/viajes-del-caribe/roles/1
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

**Ejemplo de Response**:
```json
{
    "data": {
        "id": 1,
        "name": "Vendedor Senior",
        "description": "Vendedor con experiencia para clientes importantes",
        "color": "#10B981",
        "is_system_role": false,
        "is_active": true,
        "sort_order": 1,
        "permissions": [
            {
                "id": 1,
                "name": "create-clients",
                "description": "Crear nuevos clientes",
                "category": {
                    "id": 1,
                    "name": "Clientes"
                }
            }
        ],
        "users": [
            {
                "id": 1,
                "name": "Juan Pérez",
                "email": "juan@agencia.com",
                "office": {
                    "id": 1,
                    "name": "Oficina Central"
                }
            }
        ],
        "created_at": "2024-12-01T10:00:00.000000Z",
        "updated_at": "2024-12-01T10:00:00.000000Z"
    }
}
```

### 4. Actualizar Rol

#### PUT `/api/v1/agency/{agency}/roles/{role}`

**Descripción**: Actualiza un rol existente.

**Parámetros**:
- `agency` (string, required): Slug de la agencia
- `role` (integer, required): ID del rol

**Body Parameters**:
```json
{
    "name": "string (required, max:255, unique per agency)",
    "description": "string (optional, max:1000)",
    "color": "string (optional, hex color)",
    "is_active": "boolean (optional)"
}
```

**Ejemplo de Request**:
```http
PUT /api/v1/agency/viajes-del-caribe/roles/1
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
Content-Type: application/json

{
    "name": "Vendedor Senior Actualizado",
    "description": "Vendedor con experiencia para clientes importantes y corporativos",
    "color": "#059669",
    "is_active": true
}
```

**Ejemplo de Response**:
```json
{
    "data": {
        "id": 1,
        "name": "Vendedor Senior Actualizado",
        "description": "Vendedor con experiencia para clientes importantes y corporativos",
        "color": "#059669",
        "is_system_role": false,
        "is_active": true,
        "sort_order": 1,
        "permissions_count": 24,
        "users_count": 3,
        "created_at": "2024-12-01T10:00:00.000000Z",
        "updated_at": "2024-12-01T11:30:00.000000Z"
    },
    "message": "Rol actualizado exitosamente"
}
```

### 5. Eliminar Rol

#### DELETE `/api/v1/agency/{agency}/roles/{role}`

**Descripción**: Elimina un rol personalizado.

**Parámetros**:
- `agency` (string, required): Slug de la agencia
- `role` (integer, required): ID del rol

**Restricciones**:
- Solo roles personalizados (no roles del sistema)
- No puede tener usuarios asignados

**Ejemplo de Request**:
```http
DELETE /api/v1/agency/viajes-del-caribe/roles/2
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

**Ejemplo de Response**:
```json
{
    "message": "Rol eliminado exitosamente"
}
```

### 6. Obtener Permisos Disponibles

#### GET `/api/v1/agency/{agency}/roles/permissions`

**Descripción**: Obtiene todos los permisos disponibles organizados por categorías.

**Parámetros**:
- `agency` (string, required): Slug de la agencia

**Ejemplo de Request**:
```http
GET /api/v1/agency/viajes-del-caribe/roles/permissions
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

**Ejemplo de Response**:
```json
{
    "data": [
        {
            "id": 1,
            "name": "Clientes",
            "description": "Permisos relacionados con la gestión de clientes",
            "sort_order": 1,
            "permissions": [
                {
                    "id": 1,
                    "name": "create-clients",
                    "description": "Crear nuevos clientes",
                    "sort_order": 1
                },
                {
                    "id": 2,
                    "name": "read-clients",
                    "description": "Ver información de clientes",
                    "sort_order": 2
                }
            ]
        }
    ]
}
```

### 7. Obtener Permisos de un Rol

#### GET `/api/v1/agency/{agency}/roles/{role}/permissions`

**Descripción**: Obtiene los permisos asignados a un rol específico.

**Parámetros**:
- `agency` (string, required): Slug de la agencia
- `role` (integer, required): ID del rol

**Ejemplo de Request**:
```http
GET /api/v1/agency/viajes-del-caribe/roles/1/permissions
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

**Ejemplo de Response**:
```json
{
    "data": [
        {
            "id": 1,
            "name": "create-clients",
            "description": "Crear nuevos clientes",
            "category": {
                "id": 1,
                "name": "Clientes"
            }
        }
    ]
}
```

### 8. Asignar Permisos a un Rol

#### POST `/api/v1/agency/{agency}/roles/{role}/permissions`

**Descripción**: Asigna permisos a un rol específico.

**Parámetros**:
- `agency` (string, required): Slug de la agencia
- `role` (integer, required): ID del rol

**Body Parameters**:
```json
{
    "permissions": "array (required, array of permission IDs)"
}
```

**Ejemplo de Request**:
```http
POST /api/v1/agency/viajes-del-caribe/roles/1/permissions
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
Content-Type: application/json

{
    "permissions": [1, 2, 3, 4, 5, 6, 7, 8]
}
```

**Ejemplo de Response**:
```json
{
    "data": {
        "id": 1,
        "name": "Vendedor Senior",
        "permissions_count": 8,
        "permissions": [
            {
                "id": 1,
                "name": "create-clients",
                "description": "Crear nuevos clientes"
            }
        ]
    },
    "message": "Permisos actualizados exitosamente"
}
```

### 9. Obtener Usuarios de un Rol

#### GET `/api/v1/agency/{agency}/roles/{role}/users`

**Descripción**: Obtiene todos los usuarios asignados a un rol específico.

**Parámetros**:
- `agency` (string, required): Slug de la agencia
- `role` (integer, required): ID del rol

**Ejemplo de Request**:
```http
GET /api/v1/agency/viajes-del-caribe/roles/1/users
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
```

**Ejemplo de Response**:
```json
{
    "data": [
        {
            "id": 1,
            "name": "Juan Pérez",
            "email": "juan@agencia.com",
            "office": {
                "id": 1,
                "name": "Oficina Central"
            },
            "assigned_at": "2024-12-01T10:00:00.000000Z"
        }
    ]
}
```

## 🔒 Códigos de Estado HTTP

### Éxito
- `200 OK`: Operación exitosa
- `201 Created`: Recurso creado exitosamente
- `204 No Content`: Operación exitosa sin contenido de respuesta

### Errores del Cliente
- `400 Bad Request`: Solicitud malformada
- `401 Unauthorized`: No autenticado
- `403 Forbidden`: No autorizado para esta operación
- `404 Not Found`: Recurso no encontrado
- `422 Unprocessable Entity`: Error de validación

### Errores del Servidor
- `500 Internal Server Error`: Error interno del servidor

## 📝 Ejemplos de Errores

### Error de Validación (422)
```json
{
    "message": "The given data was invalid.",
    "errors": {
        "name": [
            "The name field is required."
        ],
        "permissions": [
            "The permissions must be an array."
        ]
    }
}
```

### Error de Autorización (403)
```json
{
    "message": "No tienes permisos para realizar esta acción."
}
```

### Error de Recurso No Encontrado (404)
```json
{
    "message": "Rol no encontrado."
}
```

### Error de Restricción de Negocio (422)
```json
{
    "message": "No se puede eliminar el rol porque tiene 3 usuario(s) asignado(s)."
}
```

## 🧪 Ejemplos de Uso con cURL

### Crear un Nuevo Rol
```bash
curl -X POST "http://localhost/api/v1/agency/viajes-del-caribe/roles" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Coordinador de Eventos",
    "description": "Especialista en organización de eventos corporativos",
    "color": "#8B5CF6",
    "is_active": true,
    "permissions": [1, 2, 3, 4, 5]
  }'
```

### Obtener Roles de una Agencia
```bash
curl -X GET "http://localhost/api/v1/agency/viajes-del-caribe/roles?type=custom&active=true" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Asignar Permisos a un Rol
```bash
curl -X POST "http://localhost/api/v1/agency/viajes-del-caribe/roles/1/permissions" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "permissions": [1, 2, 3, 4, 5, 6, 7, 8]
  }'
```

### Eliminar un Rol
```bash
curl -X DELETE "http://localhost/api/v1/agency/viajes-del-caribe/roles/2" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔧 Configuración de Middleware

### Middleware de Autenticación
```php
Route::middleware('auth:sanctum')->group(function () {
    // Endpoints protegidos
});
```

### Middleware de Autorización
```php
Route::middleware(['auth:sanctum', 'agency.access'])->group(function () {
    // Endpoints con verificación de agencia
});
```

## 📊 Rate Limiting

Los endpoints están protegidos con rate limiting:
- **Límite**: 60 requests por minuto por usuario
- **Headers de respuesta**:
  - `X-RateLimit-Limit`: Límite de requests
  - `X-RateLimit-Remaining`: Requests restantes
  - `X-RateLimit-Reset`: Timestamp de reset

## 🔍 Filtros y Búsqueda

### Filtros Disponibles
- `type`: `system`, `custom`, `all`
- `active`: `true`, `false`
- `search`: Búsqueda en nombre y descripción
- `per_page`: Número de elementos por página (1-100)

### Ordenamiento
- Por defecto: `sort_order` ASC, `name` ASC
- Campos ordenables: `name`, `created_at`, `updated_at`, `sort_order`

## 📈 Paginación

Todos los endpoints de listado incluyen paginación:
```json
{
    "data": [...],
    "links": {
        "first": "http://localhost/api/v1/agency/.../roles?page=1",
        "last": "http://localhost/api/v1/agency/.../roles?page=10",
        "prev": "http://localhost/api/v1/agency/.../roles?page=2",
        "next": "http://localhost/api/v1/agency/.../roles?page=4"
    },
    "meta": {
        "current_page": 3,
        "from": 31,
        "last_page": 10,
        "per_page": 15,
        "to": 45,
        "total": 150
    }
}
```

## 🛡️ Seguridad

### Validaciones
- Nombres únicos por agencia
- Validación de colores hexadecimales
- Verificación de permisos existentes
- Protección contra roles del sistema

### Autorización
- Verificación de pertenencia a la agencia
- Políticas de autorización por operación
- Logs de auditoría para cambios críticos

---

**Versión de la API**: 1.0  
**Última actualización**: Diciembre 2024  
**Formato de respuesta**: JSON  
**Autenticación**: Bearer Token (Sanctum)
