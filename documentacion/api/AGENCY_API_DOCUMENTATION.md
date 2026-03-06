# 🏢 **DOCUMENTACIÓN COMPLETA DE LA API DE AGENCIA - CRM AGENCIA DE VIAJES**

## 🎯 **DESCRIPCIÓN GENERAL**

Esta API permite la gestión completa de agencias de viajes, incluyendo autenticación diferenciada por tipo de usuario, información de agencias, estadísticas y gestión de personal. El sistema identifica automáticamente si un usuario pertenece a una agencia o es un cliente convencional.

---

## 🌐 **BASE URL**

```
https://mvpsolutions365.com/api
```

**Para desarrollo local:**
```
https://mvpsolutions365.com/api
```

---

## 🔐 **AUTENTICACIÓN**

### **Sanctum Token (Para rutas protegidas)**
- **Header:** `Authorization: Bearer {token}`
- **Header:** `Accept: application/json`
- **Content-Type:** `application/json`

---

## 📋 **ENDPOINTS DISPONIBLES**

### **🔓 RUTAS PÚBLICAS (Sin autenticación)**

#### **1. Información de Agencia**
```
GET /v1/agency/{slug}
```
**Descripción:** Obtiene información detallada de una agencia por su slug.

**Parámetros:**
- `slug` (path): Slug de la agencia (ej: `agencia-principal`)

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "name": "Agencia Principal",
        "slug": "agencia-principal",
        "nit": "9000000001",
        "phone": "3506852261",
        "email": "Maicol.londono@mvpsolutions.com",
        "address": "Cl. 98a #65-120, Castilla, Medellín",
        "city": "Medellín",
        "country": "Colombia",
        "description": "Agencia de viajes especializada en el Caribe"
    }
}
```

#### **2. Autenticación Web**
```
POST /v1/auth/login
```
**Descripción:** Login para usuarios web (clientes o personal de agencia).

**Body:**
```json
{
    "email": "usuario@email.com",
    "password": "contraseña123"
}
```

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "message": "Login exitoso",
    "data": {
        "user": {
            "id": 1,
            "name": "Juan Pérez",
            "email": "usuario@email.com",
            "user_type": "agency_agent",
            "has_agency": true,
            "agency": {
                "id": 1,
                "name": "Agencia Principal",
                "slug": "agencia-principal",
                "status": "activo"
            },
            "personnel": {
                "id": 1,
                "position": "Agente de Ventas",
                "department": "Ventas",
                "employee_code": "EMP001",
                "status": "activo"
            }
        },
        "token": "1|abc123def456...",
        "token_type": "Bearer"
    }
}
```

#### **3. Verificar Autenticación**
```
GET /v1/auth/check
```
**Descripción:** Verifica si el usuario está autenticado y retorna información básica.

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "authenticated": true,
    "data": {
        "id": 1,
        "name": "Juan Pérez",
        "email": "usuario@email.com",
        "user_type": "agency_agent",
        "has_agency": true,
        "agency_id": 1,
        "is_client": false,
        "is_personnel": true
    }
}
```

#### **4. Crear Cotización**
```
POST /v1/quotation
```
**Descripción:** Crea una nueva solicitud de cotización desde el sitio web.

**Body:**
```json
{
    "agency_slug": "agencia-principal",
    "client_name": "Juan Pérez",
    "client_email": "juan@email.com",
    "client_phone": "3001234567",
    "slug": "juan-perez-meytsq98",
    "request_type": "tiquete_aereo",
    "destination_type": "nacional",
    "origin": "Medellín",
    "destination": "Cartagena",
    "departure_date": "2024-06-15",
    "return_date": "2024-06-20",
    "adult": 2,
    "children": 0,
    "infant": 0,
    "description": "Viaje familiar a Cartagena",
    "budget_range": "1000000-2000000",
    "preferred_currency": "COP",
    "special_requirements": "Habitación con vista al mar"
}
```

#### **5. Crear Tarea**
```
POST /v1/task
```
**Descripción:** Crea una nueva tarea o consulta desde el sitio web.

**Body:**
```json
{
    "agency_slug": "agencia-principal",
    "client_name": "María García",
    "client_email": "maria@email.com",
    "client_phone": "3009876543",
    "title": "Consulta sobre paquetes al Caribe",
    "type_task": "consulta",
    "description": "Necesito información sobre paquetes todo incluido al Caribe",
    "priority": "normal",
    "due_date": "2024-06-10",
    "contact_preference": "email",
    "best_time_to_contact": "mañana"
}
```

#### **6. Crear Cliente**
```
POST /v1/client
```
**Descripción:** Crea una nueva cuenta de cliente desde el sitio web.

**Body:**
```json
{
    "name": "Ana López",
    "email": "ana@email.com",
    "phone": "3005551234",
    "address": "Calle 123 #45-67",
    "city": "Medellín",
    "country": "Colombia",
    "password": "miContraseña123"
}
```

#### **7. Buscar Clientes**
```
GET /v1/client/search?query={search_term}
```
**Descripción:** Busca clientes por nombre o email (mínimo 2 caracteres).

#### **8. Login de Cliente**
```
POST /v1/client/login
```
**Descripción:** Autentica a un cliente y genera un token de acceso.

#### **9. Tipos de Servicios**
```
GET /v1/services/types
```
**Descripción:** Obtiene la lista de tipos de servicios disponibles.

#### **10. Destinos Populares**
```
GET /v1/destinations/popular
```
**Descripción:** Obtiene la lista de destinos más populares.

#### **11. Listar Paquetes de una Agencia**
```
GET /v1/agency/{slug}/packages
```
**Descripción:** Obtiene la lista de paquetes turísticos de una agencia específica.

#### **12. Mostrar Paquete Específico**
```
GET /v1/agency/{slug}/packages/{id}
```
**Descripción:** Obtiene los detalles completos de un paquete específico.

#### **13. Obtener Destinos de Paquetes**
```
GET /v1/agency/{slug}/packages/destinations
```
**Descripción:** Obtiene la lista de destinos únicos disponibles en los paquetes de una agencia.

#### **14. Obtener Paquetes Destacados**
```
GET /v1/agency/{slug}/packages/featured
```
**Descripción:** Obtiene los paquetes destacados (con salidas activas) de una agencia.

---

### **🔒 RUTAS PROTEGIDAS PARA USUARIOS AUTENTICADOS**

#### **1. Perfil del Usuario**
```
GET /v1/user/profile
```
**Descripción:** Obtiene el perfil completo del usuario logueado.

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "name": "Juan Pérez",
        "email": "usuario@email.com",
        "phone": "3001234567",
        "user_type": "agency_agent",
        "has_agency": true,
        "permissions": ["view_quotes", "create_sales"],
        "roles": ["agent"],
        "agency": {
            "id": 1,
            "name": "Agencia Principal",
            "slug": "agencia-principal",
            "status": "activo"
        },
        "personnel": {
            "id": 1,
            "position": "Agente de Ventas",
            "department": "Ventas",
            "employee_code": "EMP001",
            "status": "activo"
        }
    }
}
```

#### **2. Tipo de Usuario**
```
GET /v1/user/type
```
**Descripción:** Obtiene información básica del usuario para verificar su tipo.

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "name": "Juan Pérez",
        "email": "usuario@email.com",
        "user_type": "agency_agent",
        "has_agency": true,
        "agency_id": 1,
        "permissions": ["view_quotes", "create_sales"],
        "roles": ["agent"]
    }
}
```

#### **3. Información de la Agencia del Usuario**
```
GET /v1/user/agency/info
```
**Descripción:** Obtiene información específica de la agencia del usuario.

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "name": "Agencia Principal",
        "slug": "agencia-principal",
        "nit": "9000000001",
        "phone": "3506852261",
        "email": "Maicol.londono@mvpsolutions.com",
        "address": "Cl. 98a #65-120, Castilla, Medellín",
        "city": "Medellín",
        "country": "Colombia",
        "description": "Agencia de viajes especializada en el Caribe",
        "status": "activo",
        "logo": "https://mvpsolutions365.com/storage/agencies/logo-1.jpg",
        "website": "https://agencia-principal.com",
        "social_media": {
            "facebook": "https://facebook.com/agencia-principal",
            "instagram": "https://instagram.com/agencia-principal",
            "twitter": null,
            "linkedin": null
        },
        "business_hours": {
            "monday": "8:00 AM - 6:00 PM",
            "tuesday": "8:00 AM - 6:00 PM",
            "wednesday": "8:00 AM - 6:00 PM",
            "thursday": "8:00 AM - 6:00 PM",
            "friday": "8:00 AM - 6:00 PM",
            "saturday": "9:00 AM - 2:00 PM",
            "sunday": "Cerrado"
        }
    }
}
```

#### **4. Logout del Usuario**
```
POST /v1/auth/logout
```
**Descripción:** Cierra la sesión del usuario.

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "message": "Logout exitoso"
}
```

#### **5. Información del Usuario Logueado**
```
GET /v1/auth/me
```
**Descripción:** Obtiene información del usuario logueado para el frontend.

---

### **🔒 RUTAS PROTEGIDAS PARA AGENCIAS**

#### **1. Perfil de la Agencia**
```
GET /v1/agency/{slug}/profile
```
**Descripción:** Obtiene el perfil completo de una agencia (solo para usuarios de la agencia).

#### **2. Estadísticas de la Agencia**
```
GET /v1/agency/{slug}/statistics
```
**Descripción:** Obtiene estadísticas de la agencia (solo para usuarios de la agencia).

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "data": {
        "general": {
            "total_clients": 150,
            "total_quotes": 89,
            "total_sales": 45,
            "total_tasks": 67,
            "total_packages": 23,
            "total_personnel": 12
        },
        "monthly": {
            "quotes_this_month": 15,
            "sales_this_month": 8,
            "tasks_this_month": 12
        },
        "recent_activity": {
            "latest_quotes": [
                {
                    "id": 1,
                    "client_name": "María García",
                    "request_type": "tiquete_aereo",
                    "status": "En proceso",
                    "created_at": "2024-01-15T10:30:00Z"
                }
            ],
            "latest_sales": [
                {
                    "id": 1,
                    "client_name": "Juan Pérez",
                    "total_amount": 2500000,
                    "status": "Confirmada",
                    "created_at": "2024-01-14T14:20:00Z"
                }
            ],
            "latest_tasks": [
                {
                    "id": 1,
                    "title": "Seguimiento de venta",
                    "client_name": "Ana López",
                    "state": "En proceso",
                    "created_at": "2024-01-15T09:15:00Z"
                }
            ]
        }
    }
}
```

#### **3. Oficinas de la Agencia**
```
GET /v1/agency/{slug}/offices
```
**Descripción:** Obtiene la lista de oficinas de una agencia.

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "Oficina Principal",
            "address": "Cl. 98a #65-120, Castilla",
            "city": "Medellín",
            "phone": "3506852261",
            "email": "principal@agencia.com",
            "status": "active"
        },
        {
            "id": 2,
            "name": "Oficina Norte",
            "address": "Cl. 70 #45-23, Laureles",
            "city": "Medellín",
            "phone": "3506852262",
            "email": "norte@agencia.com",
            "status": "active"
        }
    ],
    "agency": {
        "id": 1,
        "name": "Agencia Principal",
        "slug": "agencia-principal"
    }
}
```

---

### **🔒 RUTAS PROTEGIDAS PARA CLIENTES**

#### **1. Perfil del Cliente**
```
GET /v1/client/profile
```
**Descripción:** Obtiene el perfil del cliente autenticado.

#### **2. Cotizaciones del Cliente**
```
GET /v1/client/quotations
```
**Descripción:** Obtiene las cotizaciones del cliente autenticado.

#### **3. Detalle de Cotización**
```
GET /v1/client/quotations/{id}
```
**Descripción:** Obtiene el detalle de una cotización específica del cliente.

#### **4. Servicios de una Cotización**
```
GET /v1/client/quotations/{quotationId}/services
```
**Descripción:** Obtiene todos los servicios de una cotización específica (tickets, hoteles, traslados, asistencia médica).

**Respuesta exitosa (200):**
```json
{
    "success": true,
    "data": {
        "quotation": {
            "id": 1,
            "slug": "cotizacion-cartagena-abc123",
            "request_type": "tiquete_aereo",
            "destination": "Cartagena",
            "departure_date": "2024-06-15T00:00:00Z",
            "return_date": "2024-06-20T00:00:00Z",
            "status": "cotizado",
            "totals": {
                "quoted": 1500000,
                "sold": 0,
                "discarded": 0
            }
        },
        "services": {
            "tickets": [...],
            "hotels": [...],
            "transfers": [...],
            "medical_assists": [...]
        }
    }
}
```

#### **5. Tickets Aéreos de una Cotización**
```
GET /v1/client/quotations/{quotationId}/services/tickets
```
**Descripción:** Obtiene solo los tickets aéreos de una cotización.

#### **6. Hoteles de una Cotización**
```
GET /v1/client/quotations/{quotationId}/services/hotels
```
**Descripción:** Obtiene solo las reservas de hoteles de una cotización.

#### **7. Traslados de una Cotización**
```
GET /v1/client/quotations/{quotationId}/services/transfers
```
**Descripción:** Obtiene solo los servicios de traslado de una cotización.

#### **8. Asistencia Médica de una Cotización**
```
GET /v1/client/quotations/{quotationId}/services/medical-assists
```
**Descripción:** Obtiene solo los servicios de asistencia médica de una cotización.



---

### **🔒 RUTAS PROTEGIDAS PARA ADMINISTRADORES**

#### **1. Listar Cotizaciones (Admin)**
```
GET /v1/admin/quotations
```
**Descripción:** Lista todas las cotizaciones del sistema.

#### **2. Listar Tareas (Admin)**
```
GET /v1/admin/tasks
```
**Descripción:** Lista todas las tareas del sistema.

---

## 👥 **TIPOS DE USUARIO**

### **Sistema identifica automáticamente:**

| **Tipo** | **Descripción** | **Acceso** |
|-----------|-----------------|------------|
| `system_admin` | Administrador del sistema | Todo el sistema |
| `agency_admin` | Administrador de agencia | Solo su agencia |
| `agency_manager` | Gerente de agencia | Solo su agencia |
| `agency_agent` | Agente de ventas | Solo su agencia |
| `agency_personnel` | Personal de agencia | Solo su agencia |
| `client` | Cliente convencional | Solo sus datos |
| `basic_user` | Usuario básico | Acceso limitado |

---

## 🎨 **IMPLEMENTACIÓN EN FRONTEND**

### **1. Incluir el Cliente JavaScript:**
```html
<script src="/js/agency-api-client.js"></script>
```

### **2. Inicializar el Cliente:**
```javascript
const apiClient = new AgencyApiClient();
```

### **3. Login de Usuario:**
```javascript
try {
    const response = await apiClient.login(email, password);
    console.log('Usuario logueado:', response.user);
    
    // Verificar tipo de usuario
    if (response.user.user_type === 'client') {
        // Mostrar interfaz de cliente
        showClientInterface();
    } else if (response.user.user_type.startsWith('agency_')) {
        // Mostrar interfaz de agencia
        showAgencyInterface();
    }
} catch (error) {
    console.error('Error en login:', error);
}
```

### **4. Verificar Tipo de Usuario:**
```javascript
// Verificar si es cliente
if (apiClient.isClient()) {
    showClientFeatures();
}

// Verificar si es personal de agencia
if (apiClient.isAgencyPersonnel()) {
    showAgencyFeatures();
}

// Verificar si es administrador
if (apiClient.isAdmin()) {
    showAdminFeatures();
}
```

### **5. Mostrar/Ocultar Elementos:**
```html
<!-- Solo para clientes -->
<div data-show-for="client">
    <h3>Mis Cotizaciones</h3>
    <!-- Contenido específico para clientes -->
</div>

<!-- Solo para personal de agencia -->
<div data-show-for="agency">
    <h3>Panel de Agencia</h3>
    <!-- Contenido específico para agencias -->
</div>

<!-- Solo para administradores -->
<div data-show-for="admin">
    <h3>Panel de Administración</h3>
    <!-- Contenido específico para administradores -->
</div>
```

### **6. Actualizar Interfaz:**
```javascript
// Actualizar elementos con datos del usuario
document.querySelector('[data-user-name]').textContent = user.name;
document.querySelector('[data-user-email]').textContent = user.email;

// Si pertenece a una agencia
if (user.agency) {
    document.querySelector('[data-agency-name]').textContent = user.agency.name;
    document.querySelector('[data-agency-logo]').src = user.agency.logo;
}

// Mostrar/ocultar elementos basado en el tipo
AgencyFrontendUtils.toggleElementsByUserType(user.user_type);
```

---

## 🧪 **EJEMPLOS DE USO**

### **Flujo Completo de Usuario de Agencia:**
1. **Login** → `POST /v1/auth/login`
2. **Verificar Tipo** → `GET /v1/user/type`
3. **Obtener Perfil** → `GET /v1/user/profile`
4. **Información de Agencia** → `GET /v1/user/agency/info`
5. **Estadísticas** → `GET /v1/agency/{slug}/statistics`
6. **Oficinas** → `GET /v1/agency/{slug}/offices`

### **Flujo de Cliente:**
1. **Login** → `POST /v1/auth/login`
2. **Verificar Tipo** → `GET /v1/user/type`
3. **Obtener Perfil** → `GET /v1/user/profile`
4. **Ver Cotizaciones** → `GET /v1/client/quotations`

---

## 🔧 **CONFIGURACIÓN**

### **1. Middleware de Acceso a Agencia:**
```php
// En routes/api.php
Route::middleware(['auth:sanctum', 'agency.access'])->group(function () {
    // Rutas protegidas de agencia
});
```

### **2. Verificación de Permisos:**
```php
// En el controlador
if ($user->agency_id !== $agency->id) {
    return response()->json([
        'success' => false,
        'message' => 'No tienes permisos para acceder a esta agencia'
    ], 403);
}
```

---

## 🚀 **PRÓXIMOS PASOS**

1. ✅ **API de agencia implementada**
2. ✅ **Sistema de autenticación diferenciado**
3. ✅ **Middleware de acceso a agencia**
4. ✅ **Cliente JavaScript completo**
5. ✅ **Página de demostración**
6. 🔄 **Integración con el frontend principal**
7. 🔄 **Testing y optimización**

---

**¿Necesitas ayuda con la implementación o quieres que te ayude con alguna funcionalidad específica?**
