# API de Autenticación - CRM

## Descripción General

Esta API permite a los usuarios autenticarse en el sistema CRM utilizando sus credenciales. La API valida que los usuarios estén activos en la base de datos antes de permitir el acceso.

## Características Principales

- ✅ Validación de usuarios activos únicamente
- ✅ Autenticación basada en tokens (Laravel Sanctum)
- ✅ Verificación de email (opcional)
- ✅ Respuestas estandarizadas
- ✅ Manejo de errores detallado
- ✅ Soporte para diferentes tipos de usuarios

## Base URL

**Desarrollo (Local):**
```
http://127.0.0.1:8000/api/v1
```

**Producción:**
```
https://mvpsolutions365.com/api/v1
```

## Endpoints Disponibles

### 1. Login de Usuario (Web)

**Endpoint:** `POST /auth/login`

**Descripción:** Permite a un usuario autenticarse en el sistema.

**Headers:**
```
Content-Type: application/json
Accept: application/json
```

**Body:**
```json
{
    "email": "usuario@ejemplo.com",
    "password": "contraseña123"
}
```

**Respuesta Exitosa (200):**
```json
{
    "success": true,
    "message": "Login exitoso",
    "data": {
        "user": {
            "id": 1,
            "name": "Maicol Londoño",
            "email": "maicol.londono@mvpsolutions.com",
            "phone": "3506852261",
            "avatar": null,
            "user_type": "basic_user",
            "has_agency": true,
            "permissions": [
                "ver agencias",
                "crear agencias",
                "editar agencias",
                "eliminar agencias",
                "ver oficinas",
                "crear oficinas",
                "editar oficinas",
                "eliminar oficinas",
                "ver personal",
                "crear personal",
                "editar personal",
                "eliminar personal",
                "ver usuarios",
                "crear usuarios",
                "editar usuarios",
                "eliminar usuarios",
                "ver configuración",
                "editar configuración",
                "gestionar backup",
                "ver logs sistema",
                "gestionar agencias",
                "ver lista agencias",
                "gestionar tenants",
                "acceso superadmin",
                "menu_dashboard",
                "menu_mis_tareas",
                "menu_administracion",
                "menu_agencias",
                "menu_mi_agencia",
                "menu_gestion_roles",
                "menu_oficinas",
                "menu_colaboradores",
                "menu_proveedores",
                "menu_clientes",
                "menu_lista_clientes",
                "menu_mis_cotizaciones",
                "menu_mis_ventas",
                "menu_contabilidad",
                "menu_solicitudes_pago",
                "menu_pagos_pendientes",
                "menu_historico_pagos",
                "menu_productos",
                "menu_paquetes",
                "menu_hoteles",
                "menu_tours"
            ],
            "roles": ["super-admin"],
            "created_at": "2025-09-14T20:23:01.000000Z",
            "agency": {
                "id": 1,
                "name": "Agencia Principal",
                "slug": "agencia-principal",
                "status": "activo",
                "logo": "https://via.placeholder.com/150",
                "main_image": null
            }
        },
        "token": "1|i48G0a8wLBc9OtrshNPUMoo1MXC6HDr15sk2HBOY058c87ca",
        "token_type": "Bearer",
        "expires_in": 10080
    }
}
```

**Errores Posibles:**

**401 - Credenciales Incorrectas:**
```json
{
    "success": false,
    "message": "Credenciales incorrectas o usuario inactivo",
    "error_code": "INVALID_CREDENTIALS"
}
```

**403 - Email No Verificado:**
```json
{
    "success": false,
    "message": "Debe verificar su email antes de iniciar sesión",
    "error_code": "EMAIL_NOT_VERIFIED"
}
```

**422 - Error de Validación:**
```json
{
    "success": false,
    "message": "Los datos proporcionados no son válidos",
    "errors": {
        "email": ["El campo email es obligatorio."],
        "password": ["El campo password debe tener al menos 6 caracteres."]
    },
    "error_code": "VALIDATION_ERROR"
}
```

### 2. Login de Clientes

**Endpoint:** `POST /client/login`

**Descripción:** Permite a un cliente autenticarse en el sistema.

**Headers:**
```
Content-Type: application/json
Accept: application/json
```

**Body:**
```json
{
    "email": "cliente@ejemplo.com",
    "password": "contraseña123"
}
```

**Respuesta:** Similar a la del login web, pero específica para clientes.

### 3. Verificar Autenticación

**Endpoint:** `GET /auth/check`

**Descripción:** Verifica si el usuario está autenticado sin requerir token.

**Headers:**
```
Accept: application/json
```

**Respuesta Exitosa (200):**
```json
{
    "success": true,
    "authenticated": true,
    "data": {
        "id": 1,
        "name": "Maicol Londoño",
        "email": "maicol.londono@mvpsolutions.com",
        "user_type": "basic_user",
        "has_agency": true,
        "agency_id": 1,
        "is_client": false,
        "is_personnel": false
    }
}
```

**Respuesta No Autenticado (401):**
```json
{
    "success": false,
    "authenticated": false,
    "message": "Usuario no autenticado"
}
```

### 4. Obtener Información del Usuario

**Endpoint:** `GET /auth/me`

**Descripción:** Obtiene la información completa del usuario autenticado.

**Headers:**
```
Authorization: Bearer {token}
Accept: application/json
```

**Respuesta Exitosa (200):**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "name": "Juan Pérez",
        "email": "usuario@ejemplo.com",
        "phone": "+1234567890",
        "avatar": null,
        "status": "activo",
        "type": "client",
        "user_type": "client",
        "email_verified_at": "2024-01-15T10:30:00.000000Z",
        "created_at": "2024-01-01T00:00:00.000000Z",
        "updated_at": "2024-01-15T10:30:00.000000Z",
        "agency": null,
        "personnel": null,
        "client": {
            "id": 1,
            "slug": "juan-perez-12345678",
            "document_type": "DNI",
            "document_number": "12345678",
            "client_type": "individual",
            "address": "Calle Principal 123",
            "city": "Lima",
            "country": "Perú"
        },
        "permissions": [],
        "roles": ["client"]
    }
}
```

### 5. Cerrar Sesión

**Endpoint:** `POST /auth/logout`

**Descripción:** Cierra la sesión del usuario y revoca el token.

**Headers:**
```
Authorization: Bearer {token}
Accept: application/json
```

**Respuesta Exitosa (200):**
```json
{
    "success": true,
    "message": "Sesión cerrada exitosamente"
}
```

### 6. Refrescar Token

**Endpoint:** `POST /auth/refresh`

**Descripción:** Refresca el token de autenticación del usuario.

**Headers:**
```
Authorization: Bearer {token}
Accept: application/json
```

**Respuesta Exitosa (200):**
```json
{
    "success": true,
    "message": "Token refrescado exitosamente",
    "data": {
        "token": "2|nuevo_token_abcdef1234567890...",
        "token_type": "Bearer",
        "expires_in": 10080
    }
}
```

## Tipos de Usuario

La API identifica diferentes tipos de usuarios:

- `system_admin`: Administrador del sistema
- `agency_admin`: Administrador de agencia
- `agency_manager`: Gerente de agencia
- `agency_agent`: Agente de agencia
- `agency_personnel`: Personal de agencia
- `client`: Cliente
- `basic_user`: Usuario básico

## Códigos de Error

| Código | Descripción |
|--------|-------------|
| `INVALID_CREDENTIALS` | Credenciales incorrectas o usuario inactivo |
| `EMAIL_NOT_VERIFIED` | Email no verificado |
| `VALIDATION_ERROR` | Error de validación de datos |
| `LOGIN_ERROR` | Error interno en el login |
| `UNAUTHENTICATED` | Usuario no autenticado |
| `LOGOUT_ERROR` | Error al cerrar sesión |
| `USER_INFO_ERROR` | Error al obtener información del usuario |
| `AUTH_CHECK_ERROR` | Error al verificar autenticación |
| `REFRESH_ERROR` | Error al refrescar token |

## Ejemplos de Uso

### JavaScript (Fetch API)

```javascript
// Configuración base
const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

// Login
const login = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
        // Guardar token
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        return data.data.user;
    } else {
        throw new Error(data.message);
    }
};

// Obtener información del usuario
const getMe = async () => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        }
    });
    
    const data = await response.json();
    return data;
};

// Verificar autenticación
const checkAuth = async () => {
    const response = await fetch(`${API_BASE_URL}/auth/check`, {
        headers: {
            'Accept': 'application/json'
        }
    });
    
    const data = await response.json();
    return data;
};

// Logout
const logout = async () => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        }
    });
    
    const data = await response.json();
    
    if (data.success) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
    
    return data;
};

// Refrescar token
const refreshToken = async () => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        }
    });
    
    const data = await response.json();
    
    if (data.success) {
        localStorage.setItem('token', data.data.token);
    }
    
    return data;
};
```

### PHP (cURL)

```php
<?php
// Configuración base
$API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

// Login
function login($email, $password) {
    global $API_BASE_URL;
    $url = $API_BASE_URL . '/auth/login';
    
    $data = [
        'email' => $email,
        'password' => $password
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Accept: application/json'
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($response, true);
}

// Obtener información del usuario
function getMe($token) {
    global $API_BASE_URL;
    $url = $API_BASE_URL . '/auth/me';
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $token,
        'Accept: application/json'
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($response, true);
}

// Verificar autenticación
function checkAuth() {
    global $API_BASE_URL;
    $url = $API_BASE_URL . '/auth/check';
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Accept: application/json'
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($response, true);
}

// Logout
function logout($token) {
    global $API_BASE_URL;
    $url = $API_BASE_URL . '/auth/logout';
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $token,
        'Accept: application/json'
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($response, true);
}
?>
```

### Python (requests)

```python
import requests
import json

# Configuración base
API_BASE_URL = 'http://127.0.0.1:8000/api/v1'

# Login
def login(email, password):
    url = f'{API_BASE_URL}/auth/login'
    
    data = {
        'email': email,
        'password': password
    }
    
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
    
    response = requests.post(url, json=data, headers=headers)
    return response.json()

# Obtener información del usuario
def get_me(token):
    url = f'{API_BASE_URL}/auth/me'
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Accept': 'application/json'
    }
    
    response = requests.get(url, headers=headers)
    return response.json()

# Verificar autenticación
def check_auth():
    url = f'{API_BASE_URL}/auth/check'
    
    headers = {
        'Accept': 'application/json'
    }
    
    response = requests.get(url, headers=headers)
    return response.json()

# Logout
def logout(token):
    url = f'{API_BASE_URL}/auth/logout'
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Accept': 'application/json'
    }
    
    response = requests.post(url, headers=headers)
    return response.json()

# Refrescar token
def refresh_token(token):
    url = f'{API_BASE_URL}/auth/refresh'
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Accept': 'application/json'
    }
    
    response = requests.post(url, headers=headers)
    return response.json()
```

## Consideraciones de Seguridad

1. **Tokens de Acceso**: Los tokens tienen una duración de 7 días por defecto.
2. **HTTPS**: Siempre use HTTPS en producción.
3. **Validación de Usuarios**: Solo usuarios con estado "activo" pueden autenticarse.
4. **Verificación de Email**: Opcional pero recomendada para mayor seguridad.
5. **Rate Limiting**: Implementado para prevenir ataques de fuerza bruta.

## Configuración del Servidor

Asegúrese de que su servidor tenga configurado:

1. **Laravel Sanctum**: Para la autenticación basada en tokens.
2. **CORS**: Configurado para permitir requests desde su frontend.
3. **Rate Limiting**: Para proteger contra ataques de fuerza bruta.

## Soporte

Para soporte técnico o preguntas sobre la API, contacte al equipo de desarrollo.

---

**Versión:** 1.0  
**Última actualización:** Enero 2024
